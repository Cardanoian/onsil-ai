import { devLog, devError } from './logger';

export interface CachedMedia {
  id: string;
  type: 'image' | 'audio';
  format: string;
  blobUrl: string; // Blob URL
  timestamp: number;
  size: number; // 바이트 단위
}

export class MediaCache {
  private static readonly MAX_ITEMS = 100;
  private static cache = new Map<string, CachedMedia>();

  /**
   * 미디어를 캐시에 저장 (Blob URL 방식)
   * @param type 미디어 타입
   * @param format 파일 형식
   * @param data base64 데이터
   * @returns 캐시 키
   */
  static store(type: 'image' | 'audio', format: string, data: string): string {
    try {
      const id = this.generateId();
      const size = this.calculateSize(data);

      // Base64를 Blob으로 변환
      const blob = this.base64ToBlob(data, type, format);
      const blobUrl = URL.createObjectURL(blob);

      const cachedMedia: CachedMedia = {
        id,
        type,
        format,
        blobUrl,
        timestamp: Date.now(),
        size,
      };

      // 캐시 용량 확인 및 정리
      this.ensureCacheSpace();

      // 메모리 캐시에 저장
      this.cache.set(id, cachedMedia);

      devLog(`미디어 캐시 저장: ${id} (${type}, ${this.formatSize(size)})`);
      return id;
    } catch (error) {
      devError('미디어 캐시 저장 실패:', error);
      throw new Error('캐시 저장에 실패했습니다.');
    }
  }

  /**
   * 캐시에서 미디어 조회
   * @param id 캐시 키
   * @returns 캐시된 미디어 또는 null
   */
  static get(id: string): CachedMedia | null {
    try {
      const media = this.cache.get(id);
      if (!media) {
        return null;
      }

      // 접근 시간 업데이트 (LRU를 위해)
      media.timestamp = Date.now();
      this.cache.set(id, media);

      return media;
    } catch (error) {
      devError('미디어 캐시 조회 실패:', error);
      return null;
    }
  }

  /**
   * 미디어 데이터를 Blob URL로 반환
   * @param id 캐시 키
   * @returns Blob URL 또는 null
   */
  static getAsDataUrl(id: string): string | null {
    const media = this.get(id);
    if (!media) {
      return null;
    }

    return media.blobUrl;
  }

  /**
   * 특정 미디어를 캐시에서 제거
   * @param id 캐시 키
   */
  static remove(id: string): void {
    try {
      const media = this.cache.get(id);
      if (media) {
        // Blob URL 해제
        URL.revokeObjectURL(media.blobUrl);
        this.cache.delete(id);
      }
    } catch (error) {
      devError('미디어 캐시 제거 실패:', error);
    }
  }

  /**
   * 전체 캐시 정리
   */
  static clear(): void {
    try {
      // 모든 Blob URL 해제
      for (const media of this.cache.values()) {
        URL.revokeObjectURL(media.blobUrl);
      }
      this.cache.clear();
    } catch (error) {
      devError('미디어 캐시 정리 실패:', error);
    }
  }

  /**
   * 캐시 상태 정보 반환
   */
  static getStats(): {
    totalItems: number;
    totalSize: number;
    formattedSize: string;
    items: Array<{
      id: string;
      type: string;
      format: string;
      size: number;
      timestamp: number;
    }>;
  } {
    const items = Array.from(this.cache.values());
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalItems: items.length,
      totalSize,
      formattedSize: this.formatSize(totalSize),
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        format: item.format,
        size: item.size,
        timestamp: item.timestamp,
      })),
    };
  }

  /**
   * 고유 ID 생성
   */
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Base64 데이터 크기 계산 (바이트)
   */
  private static calculateSize(base64Data: string): number {
    // Base64는 원본 크기의 약 4/3배
    return Math.ceil((base64Data.length * 3) / 4);
  }

  /**
   * 캐시 공간 확보 (아이템 수 기준)
   */
  private static ensureCacheSpace(): void {
    if (this.cache.size >= this.MAX_ITEMS) {
      // 오래된 순으로 정렬 (LRU)
      const items = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );

      // 가장 오래된 아이템 제거
      const [oldestId] = items[0];
      this.remove(oldestId);
    }
  }

  /**
   * Base64를 Blob으로 변환
   */
  private static base64ToBlob(
    base64Data: string,
    type: 'image' | 'audio',
    format: string
  ): Blob {
    // data URL 접두사 제거
    let cleanBase64 = base64Data;
    if (cleanBase64.startsWith('data:')) {
      const base64Index = cleanBase64.indexOf('base64,');
      if (base64Index !== -1) {
        cleanBase64 = cleanBase64.substring(base64Index + 7);
      }
    }

    // Base64를 바이너리로 변환
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // MIME 타입 설정
    const mimeType = this.getMimeType(type, format);
    return new Blob([bytes], { type: mimeType });
  }

  /**
   * MIME 타입 반환
   */
  private static getMimeType(type: 'image' | 'audio', format: string): string {
    if (type === 'image') {
      return `image/${format}`;
    } else if (type === 'audio') {
      return `audio/${format}`;
    }
    return 'application/octet-stream';
  }

  /**
   * 크기를 읽기 쉬운 형식으로 변환
   */
  private static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 페이지 언로드 시 모든 Blob URL 정리
   */
  static setupCleanup(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.clear();
      });
    }
  }
}

// 페이지 로드 시 자동 정리 설정
if (typeof window !== 'undefined') {
  MediaCache.setupCleanup();
}
