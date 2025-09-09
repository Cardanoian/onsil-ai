import { MediaCache } from './mediaCache';

import { devError } from './logger';

export interface MediaLoadResult {
  success: boolean;
  data?: string;
  dataUrl?: string;
  error?: string;
}

export class MediaLoader {
  private static loadingCache = new Map<string, Promise<MediaLoadResult>>();

  /**
   * 캐시된 미디어를 로드하여 Data URL로 반환
   * @param mediaId 미디어 캐시 ID
   * @returns MediaLoadResult Promise
   */
  static async load(mediaId: string): Promise<MediaLoadResult> {
    // 이미 로딩 중인 경우 기존 Promise 반환
    if (this.loadingCache.has(mediaId)) {
      return this.loadingCache.get(mediaId)!;
    }

    const loadPromise = this.performLoad(mediaId);
    this.loadingCache.set(mediaId, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      // 로딩 완료 후 캐시에서 제거
      this.loadingCache.delete(mediaId);
    }
  }

  /**
   * 실제 로딩 수행
   */
  private static async performLoad(mediaId: string): Promise<MediaLoadResult> {
    try {
      const blobUrl = MediaCache.getAsDataUrl(mediaId);

      if (!blobUrl) {
        return {
          success: false,
          error: '캐시에서 미디어를 찾을 수 없습니다.',
        };
      }

      // Blob URL 유효성 검증
      if (!this.isValidBlobUrl(blobUrl)) {
        return {
          success: false,
          error: '유효하지 않은 미디어 데이터입니다.',
        };
      }

      return {
        success: true,
        dataUrl: blobUrl,
      };
    } catch (error) {
      devError('미디어 로딩 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 여러 미디어를 동시에 로드
   * @param mediaIds 미디어 ID 배열
   * @returns MediaLoadResult 배열
   */
  static async loadMultiple(mediaIds: string[]): Promise<MediaLoadResult[]> {
    const loadPromises = mediaIds.map((id) => this.load(id));
    return Promise.all(loadPromises);
  }

  /**
   * 미디어 존재 여부 확인
   * @param mediaId 미디어 캐시 ID
   * @returns 존재 여부
   */
  static exists(mediaId: string): boolean {
    return MediaCache.get(mediaId) !== null;
  }

  /**
   * 미디어 타입 확인
   * @param mediaId 미디어 캐시 ID
   * @returns 미디어 타입 또는 null
   */
  static getMediaType(mediaId: string): 'image' | 'audio' | null {
    const media = MediaCache.get(mediaId);
    return media?.type || null;
  }

  /**
   * 미디어 형식 확인
   * @param mediaId 미디어 캐시 ID
   * @returns 미디어 형식 또는 null
   */
  static getMediaFormat(mediaId: string): string | null {
    const media = MediaCache.get(mediaId);
    return media?.format || null;
  }

  /**
   * Blob URL 유효성 검증
   */
  private static isValidBlobUrl(blobUrl: string): boolean {
    try {
      // Blob URL 형식 검증 (blob:http://... 또는 blob:https://...)
      const blobUrlPattern = /^blob:(https?:\/\/[^/]+\/[a-f0-9-]+)$/;
      return blobUrlPattern.test(blobUrl);
    } catch {
      return false;
    }
  }

  /**
   * Data URL 유효성 검증 (하위 호환성을 위해 유지)
   */
  private static isValidDataUrl(dataUrl: string): boolean {
    try {
      // Data URL 형식 검증
      const dataUrlPattern =
        /^data:([a-zA-Z0-9][a-zA-Z0-9/+-]*);base64,([A-Za-z0-9+/=]+)$/;
      return dataUrlPattern.test(dataUrl);
    } catch {
      return false;
    }
  }

  /**
   * 로딩 상태 확인
   * @param mediaId 미디어 캐시 ID
   * @returns 로딩 중 여부
   */
  static isLoading(mediaId: string): boolean {
    return this.loadingCache.has(mediaId);
  }

  /**
   * 모든 로딩 작업 취소
   */
  static cancelAllLoading(): void {
    this.loadingCache.clear();
  }
}

/**
 * React Hook 스타일의 미디어 로더 (옵션)
 */
export class MediaHook {
  private static subscribers = new Map<string, Set<() => void>>();

  /**
   * 미디어 로딩 상태 구독
   * @param mediaId 미디어 ID
   * @param callback 상태 변경 콜백
   * @returns 구독 해제 함수
   */
  static subscribe(mediaId: string, callback: () => void): () => void {
    if (!this.subscribers.has(mediaId)) {
      this.subscribers.set(mediaId, new Set());
    }

    this.subscribers.get(mediaId)!.add(callback);

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.subscribers.get(mediaId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(mediaId);
        }
      }
    };
  }

  /**
   * 구독자들에게 상태 변경 알림
   */
  private static notify(mediaId: string): void {
    const callbacks = this.subscribers.get(mediaId);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }

  /**
   * 미디어 로드 및 구독자 알림
   */
  static async loadWithNotification(mediaId: string): Promise<MediaLoadResult> {
    const result = await MediaLoader.load(mediaId);
    this.notify(mediaId);
    return result;
  }
}
