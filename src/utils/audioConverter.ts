import './lamejs-globals';
import { Mp3Encoder } from 'lamejs';
import { devLog, devError } from './logger';

export class AudioConverter {
  /**
   * Gemini API에서 받은 오디오 데이터를 MP3로 변환
   * @param audioBase64 Gemini API에서 받은 base64 오디오 데이터
   * @param channels 채널 수 (기본값: 1 - 모노)
   * @param sampleRate 샘플레이트 (기본값: 24000Hz)
   * @returns MP3 형식의 base64 데이터
   */
  static async convertToMp3(
    audioBase64: string,
    channels: number = 1,
    sampleRate: number = 24000
  ): Promise<string> {
    try {
      devLog('오디오 변환 시작:', { channels, sampleRate });

      // Base64를 ArrayBuffer로 변환
      const audioArrayBuffer = this.base64ToArrayBuffer(audioBase64);
      devLog('오디오 데이터 크기:', audioArrayBuffer.byteLength);

      // 먼저 WAV 파일인지 확인
      const isWavFile = this.isWavFile(audioArrayBuffer);
      devLog('WAV 파일 여부:', isWavFile);

      let pcmData: Int16Array;
      let actualChannels = channels;
      let actualSampleRate = sampleRate;

      if (isWavFile) {
        // WAV 파일인 경우 헤더 파싱
        const wavData = this.parseWavFile(audioArrayBuffer);
        pcmData = wavData.samples;
        actualChannels = wavData.channels;
        actualSampleRate = wavData.sampleRate;
        devLog('WAV 파일 정보:', {
          channels: actualChannels,
          sampleRate: actualSampleRate,
          samples: pcmData.length,
        });
      } else {
        // PCM 원시 데이터인 경우 직접 사용
        pcmData = new Int16Array(audioArrayBuffer);
        devLog('PCM 데이터 샘플 수:', pcmData.length);
      }

      // MP3 인코더 설정
      const mp3encoder = new Mp3Encoder(
        actualChannels,
        actualSampleRate,
        128 // 128kbps 품질
      );

      // PCM 데이터를 MP3로 변환
      const mp3Data: Int8Array[] = [];
      const sampleBlockSize = 1152; // MP3 프레임 크기

      for (
        let i = 0;
        i < pcmData.length;
        i += sampleBlockSize * actualChannels
      ) {
        const sampleChunk = pcmData.subarray(
          i,
          i + sampleBlockSize * actualChannels
        );

        if (actualChannels === 1) {
          // 모노
          const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        } else {
          // 스테레오 - 좌우 채널 분리
          const left = new Int16Array(sampleBlockSize);
          const right = new Int16Array(sampleBlockSize);

          for (let j = 0; j < sampleBlockSize; j++) {
            left[j] = sampleChunk[j * 2] || 0;
            right[j] = sampleChunk[j * 2 + 1] || 0;
          }

          const mp3buf = mp3encoder.encodeBuffer(left, right);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }
      }

      // 마지막 프레임 처리
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      // MP3 데이터를 하나의 배열로 합치기
      const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
      const mp3Buffer = new Int8Array(totalLength);
      let offset = 0;

      for (const chunk of mp3Data) {
        mp3Buffer.set(chunk, offset);
        offset += chunk.length;
      }

      devLog('MP3 변환 완료, 크기:', mp3Buffer.length);

      // ArrayBuffer를 base64로 변환
      return this.arrayBufferToBase64(mp3Buffer.buffer);
    } catch (error) {
      devError('오디오 변환 실패:', error);
      throw new Error(
        `오디오 변환 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      );
    }
  }

  /**
   * 하위 호환성을 위한 기존 메서드 (deprecated)
   */
  static async convertWavToMp3(wavBase64: string): Promise<string> {
    return this.convertToMp3(wavBase64);
  }

  /**
   * Base64 문자열을 ArrayBuffer로 변환
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
      // data URL 접두사 제거
      let cleanBase64 = base64;

      // data: 접두사가 있는 경우 제거
      if (cleanBase64.startsWith('data:')) {
        const base64Index = cleanBase64.indexOf('base64,');
        if (base64Index !== -1) {
          cleanBase64 = cleanBase64.substring(base64Index + 7);
        }
      }

      // 공백 및 줄바꿈 제거
      cleanBase64 = cleanBase64.replace(/\s/g, '');

      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      devError('Base64 디코딩 실패:', error);
      throw new Error('Base64 데이터 디코딩에 실패했습니다.');
    }
  }

  /**
   * ArrayBuffer를 Base64로 변환
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  /**
   * 데이터가 WAV 파일인지 확인
   */
  private static isWavFile(arrayBuffer: ArrayBuffer): boolean {
    if (arrayBuffer.byteLength < 12) {
      return false;
    }

    const view = new DataView(arrayBuffer);

    // RIFF 헤더 확인
    const riff = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );

    // WAVE 헤더 확인
    const wave = String.fromCharCode(
      view.getUint8(8),
      view.getUint8(9),
      view.getUint8(10),
      view.getUint8(11)
    );

    return riff === 'RIFF' && wave === 'WAVE';
  }

  /**
   * WAV 파일 헤더 파싱
   */
  private static parseWavFile(arrayBuffer: ArrayBuffer): {
    channels: number;
    sampleRate: number;
    samples: Int16Array;
  } {
    if (arrayBuffer.byteLength < 44) {
      throw new Error('WAV 파일이 너무 작습니다. 최소 44바이트가 필요합니다.');
    }

    const view = new DataView(arrayBuffer);

    // WAV 헤더 검증
    const riff = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );
    if (riff !== 'RIFF') {
      throw new Error(
        `유효하지 않은 WAV 파일입니다. RIFF 헤더가 "${riff}"입니다.`
      );
    }

    const wave = String.fromCharCode(
      view.getUint8(8),
      view.getUint8(9),
      view.getUint8(10),
      view.getUint8(11)
    );
    if (wave !== 'WAVE') {
      throw new Error(
        `유효하지 않은 WAV 파일입니다. WAVE 헤더가 "${wave}"입니다.`
      );
    }

    // fmt 청크 찾기
    let offset = 12;
    while (offset < arrayBuffer.byteLength) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);

      if (chunkId === 'fmt ') {
        const channels = view.getUint16(offset + 10, true);
        const sampleRate = view.getUint32(offset + 12, true);
        const bitsPerSample = view.getUint16(offset + 22, true);

        if (bitsPerSample !== 16) {
          throw new Error('16비트 WAV 파일만 지원됩니다.');
        }

        // data 청크 찾기
        let dataOffset = offset + 8 + chunkSize;
        while (dataOffset < arrayBuffer.byteLength) {
          const dataChunkId = String.fromCharCode(
            view.getUint8(dataOffset),
            view.getUint8(dataOffset + 1),
            view.getUint8(dataOffset + 2),
            view.getUint8(dataOffset + 3)
          );
          const dataChunkSize = view.getUint32(dataOffset + 4, true);

          if (dataChunkId === 'data') {
            const samples = new Int16Array(
              arrayBuffer,
              dataOffset + 8,
              dataChunkSize / 2
            );
            return { channels, sampleRate, samples };
          }

          dataOffset += 8 + dataChunkSize;
        }

        throw new Error('WAV 파일에서 데이터 청크를 찾을 수 없습니다.');
      }

      offset += 8 + chunkSize;
    }

    throw new Error('WAV 파일에서 포맷 정보를 찾을 수 없습니다.');
  }
}
