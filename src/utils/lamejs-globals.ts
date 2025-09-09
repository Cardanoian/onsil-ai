// lamejs 라이브러리에서 필요한 전역 상수들을 정의
// 이 파일은 lamejs를 사용하기 전에 import되어야 합니다.

// 전역 타입 확장
declare global {
  interface Window {
    MPEGMode: Record<string, number>;
    VbrMode: Record<string, number>;
    ShortBlock: Record<string, number>;
    LAME_MAXMP3BUFFER: number;
    ENCDELAY: number;
    POSTDELAY: number;
    MDCTDELAY: number;
    FFTOFFSET: number;
    BLKSIZE: number;
    SBMAX_l: number;
    SBMAX_s: number;
    PSFB21: number;
    PSFB12: number;
  }

  // Node.js 환경을 위한 globalThis 확장
  var MPEGMode: Record<string, number>;
  var VbrMode: Record<string, number>;
  var ShortBlock: Record<string, number>;
  var LAME_MAXMP3BUFFER: number;
  var ENCDELAY: number;
  var POSTDELAY: number;
  var MDCTDELAY: number;
  var FFTOFFSET: number;
  var BLKSIZE: number;
  var SBMAX_l: number;
  var SBMAX_s: number;
  var PSFB21: number;
  var PSFB12: number;
}

// MPEGMode 생성자 함수와 상수들을 전역으로 정의
interface MPEGModeInstance {
  ordinal(): number;
}

interface MPEGModeConstructor {
  new (ordinal: number): MPEGModeInstance;
  STEREO: MPEGModeInstance;
  JOINT_STEREO: MPEGModeInstance;
  DUAL_CHANNEL: MPEGModeInstance;
  MONO: MPEGModeInstance;
  NOT_SET: MPEGModeInstance;
}

function MPEGMode(this: MPEGModeInstance, ordinal: number) {
  const _ordinal = ordinal;
  this.ordinal = function () {
    return _ordinal;
  };
}

const MPEGModeConstructor = MPEGMode as unknown as MPEGModeConstructor;
MPEGModeConstructor.STEREO = new MPEGModeConstructor(0);
MPEGModeConstructor.JOINT_STEREO = new MPEGModeConstructor(1);
MPEGModeConstructor.DUAL_CHANNEL = new MPEGModeConstructor(2);
MPEGModeConstructor.MONO = new MPEGModeConstructor(3);
MPEGModeConstructor.NOT_SET = new MPEGModeConstructor(4);

(globalThis as Record<string, unknown>).MPEGMode = MPEGModeConstructor;

// VbrMode enum을 전역 객체로 정의
(globalThis as Record<string, unknown>).VbrMode = {
  vbr_off: 0,
  vbr_mt: 1,
  vbr_rh: 2,
  vbr_abr: 3,
  vbr_mtrh: 4,
};

// ShortBlock enum을 전역 객체로 정의
(globalThis as Record<string, unknown>).ShortBlock = {
  short_block_not_set: -1,
  short_block_allowed: 0,
  short_block_coupled: 1,
  short_block_dispensed: 2,
  short_block_forced: 3,
};

// 기타 필요한 상수들
(globalThis as Record<string, unknown>).LAME_MAXMP3BUFFER = 16384 + 128 * 1024;
(globalThis as Record<string, unknown>).ENCDELAY = 576;
(globalThis as Record<string, unknown>).POSTDELAY = 288;
(globalThis as Record<string, unknown>).MDCTDELAY = 48;
(globalThis as Record<string, unknown>).FFTOFFSET = 224;
(globalThis as Record<string, unknown>).BLKSIZE = 1024;
(globalThis as Record<string, unknown>).SBMAX_l = 22;
(globalThis as Record<string, unknown>).SBMAX_s = 13;
(globalThis as Record<string, unknown>).PSFB21 = 6;
(globalThis as Record<string, unknown>).PSFB12 = 6;

// 더 간단한 접근: 필요한 모든 전역 객체들을 직접 정의
// BitStream에서 참조하는 Lame 객체를 위한 더미 정의
(globalThis as Record<string, unknown>).Lame = {
  LAME_MAXMP3BUFFER: 16384 + 128 * 1024,
  V9: 410,
  V8: 420,
  V7: 430,
  V6: 440,
  V5: 450,
  V4: 460,
  V3: 470,
  V2: 480,
  V1: 490,
  V0: 500,
  R3MIX: 1000,
  STANDARD: 1001,
  EXTREME: 1002,
  INSANE: 1003,
  STANDARD_FAST: 1004,
  EXTREME_FAST: 1005,
  MEDIUM: 1006,
  MEDIUM_FAST: 1007,
};

// BitStream 관련 상수들
(globalThis as Record<string, unknown>).BitStream = {
  EQ: function (a: number, b: number) {
    return Math.abs(a - b) < 1e-10;
  },
  NEQ: function (a: number, b: number) {
    return Math.abs(a - b) >= 1e-10;
  },
};

// 기타 필요한 전역 함수들
(globalThis as Record<string, unknown>).linear_int = function (
  a: number,
  b: number,
  m: number
) {
  return a + m * (b - a);
};

(globalThis as Record<string, unknown>).map2MP3Frequency = function (
  freq: number
) {
  if (freq <= 8000) return 8000;
  if (freq <= 11025) return 11025;
  if (freq <= 12000) return 12000;
  if (freq <= 16000) return 16000;
  if (freq <= 22050) return 22050;
  if (freq <= 24000) return 24000;
  if (freq <= 32000) return 32000;
  if (freq <= 44100) return 44100;
  return 48000;
};

// System 객체 정의
(globalThis as Record<string, unknown>).System = {
  err: {
    println: function (msg: string) {
      console.error(msg);
    },
  },
};

// 기타 필요한 상수들
(globalThis as Record<string, unknown>).LAME_DEFAULT_QUALITY = 5;

export {}; // 이 파일을 모듈로 만들기 위해
