/**
 * 개발 환경에서만 로그를 출력하는 유틸리티 함수들
 */

const isDevelopment = (): boolean => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

export const devLog = (...args: unknown[]): void => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

export const devError = (...args: unknown[]): void => {
  if (isDevelopment()) {
    console.error(...args);
  }
};

export const devWarn = (...args: unknown[]): void => {
  if (isDevelopment()) {
    console.warn(...args);
  }
};

export const devInfo = (...args: unknown[]): void => {
  if (isDevelopment()) {
    console.info(...args);
  }
};
