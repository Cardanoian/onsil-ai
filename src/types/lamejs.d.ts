declare module 'lamejs' {
  export enum MPEGMode {
    STEREO = 0,
    JOINT_STEREO = 1,
    DUAL_CHANNEL = 2,
    MONO = 3,
    NOT_SET = 4,
  }

  export enum VbrMode {
    vbr_off = 0,
    vbr_mt = 1,
    vbr_rh = 2,
    vbr_abr = 3,
    vbr_mtrh = 4,
  }

  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
    flush(): Int8Array;
  }

  // Lame 관련 상수들
  export const LAME_MAXMP3BUFFER: number;
  export const ENCDELAY: number;
  export const POSTDELAY: number;
  export const MDCTDELAY: number;
  export const FFTOFFSET: number;
  export const BLKSIZE: number;
  export const SBMAX_l: number;
  export const SBMAX_s: number;
  export const PSFB21: number;
  export const PSFB12: number;

  // ShortBlock enum
  export enum ShortBlock {
    short_block_not_set = -1,
    short_block_allowed = 0,
    short_block_coupled = 1,
    short_block_dispensed = 2,
    short_block_forced = 3,
  }

  // 기타 필요한 타입들
  export interface LameGlobalFlags {
    class_id: number;
    num_samples: number;
    num_channels: number;
    in_samplerate: number;
    out_samplerate: number;
    scale: number;
    scale_left: number;
    scale_right: number;
    analysis: boolean;
    bWriteVbrTag: boolean;
    decode_only: boolean;
    quality: number;
    mode: MPEGMode;
    force_ms: boolean;
    free_format: boolean;
    findReplayGain: boolean;
    decode_on_the_fly: boolean;
    nogap_total: number;
    nogap_current: number;
    brate: number;
    compression_ratio: number;
    copyright: number;
    original: number;
    error_protection: boolean;
    extension: number;
    emphasis: number;
    VBR: VbrMode;
    VBR_q: number;
    VBR_q_frac: number;
    VBR_mean_bitrate_kbps: number;
    VBR_min_bitrate_kbps: number;
    VBR_max_bitrate_kbps: number;
    VBR_hard_min: number;
    lowpassfreq: number;
    highpassfreq: number;
    lowpasswidth: number;
    highpasswidth: number;
    maskingadjust: number;
    maskingadjust_short: number;
    ATHcurve: number;
    ATHtype: number;
    athaa_type: number;
    athaa_loudapprox: number;
    athaa_sensitivity: number;
    short_blocks: ShortBlock;
    useTemporal: boolean;
    interChRatio: number;
    msfix: number;
    tune: boolean;
    tune_value_a: number;
    experimentalY: boolean;
    experimentalZ: number;
    exp_nspsytune: number;
    preset: number;
    quant_comp: number;
    quant_comp_short: number;
    frameNum: number;
    framesize: number;
    encoder_delay: number;
    encoder_padding: number;
    version: number;
    write_id3tag_automatic: boolean;
    lame_allocated_gfp: number;
    internal_flags: LameInternalFlags | null;
  }

  export interface LameInternalFlags {
    Class_ID: number;
    lame_encode_frame_init: number;
    iteration_init_init: number;
    fill_buffer_resample_init: number;
    mf_samples_to_encode: number;
    mf_size: number;
    channels_in: number;
    channels_out: number;
    mode_ext: number;
    samplerate_index: number;
    bitrate_index: number;
    VBR_min_bitrate: number;
    VBR_max_bitrate: number;
    resample_ratio: number;
    lowpass1: number;
    lowpass2: number;
    highpass1: number;
    highpass2: number;
    amp_filter: Float32Array;
    slot_lag: number;
    frac_SpF: number;
    psymodel: number;
    noise_shaping: number;
    noise_shaping_amp: number;
    noise_shaping_stop: number;
    subblock_gain: number;
    substep_shaping: number;
    use_best_huffman: number;
    full_outer_loop: number;
    sfb21_extra: boolean;
    findReplayGain: boolean;
    findPeakSample: boolean;
    decode_on_the_fly: boolean;
    RadioGain: number;
    AudiophileGain: number;
    noclipGainChange: number;
    noclipScale: number;
    PeakSample: number;
    mode_gr: number;
    sideinfo_len: number;
    itime: number[];
    inbuf_old: Float32Array[];
    blackfilt: Float32Array[][];
    in_buffer_0: Float32Array;
    in_buffer_1: Float32Array;
    in_buffer_nsamples: number;
    mfbuf: Float32Array[];
    bitrate_stereoMode_Hist: number[][];
    bitrate_blockType_Hist: number[][];
    scalefac_band: {
      l: number[];
      s: number[];
      psfb21: number[];
      psfb12: number[];
    };
    ATH: Record<string, unknown> | null;
    PSY: Record<string, unknown> | null;
    rgdata: Record<string, unknown> | null;
    nsPsy: Record<string, unknown> | null;
    hip: Record<string, unknown> | null;
    pinfo: Record<string, unknown> | null;
    iteration_loop: Record<string, unknown> | null;
  }

  // Lame 클래스
  export class Lame {
    enc: Record<string, unknown>;
    lame_init(): LameGlobalFlags;
    lame_init_params(gfp: LameGlobalFlags): number;
    lame_encode_buffer(
      gfp: LameGlobalFlags,
      buffer_l: Int16Array,
      buffer_r: Int16Array,
      nsamples: number,
      mp3buf: Int8Array,
      mp3bufPos: number,
      mp3buf_size: number
    ): number;
    lame_encode_flush(
      gfp: LameGlobalFlags,
      mp3buffer: Int8Array,
      mp3bufferPos: number,
      mp3buffer_size: number
    ): number;
    nearestBitrateFullIndex(bitrate: number): number;
    setModules(
      ga: Record<string, unknown>,
      bs: Record<string, unknown>,
      p: Record<string, unknown>,
      qupvt: Record<string, unknown>,
      qu: Record<string, unknown>,
      vbr: Record<string, unknown>,
      ver: Record<string, unknown>,
      id3: Record<string, unknown>,
      mpglib: Record<string, unknown>
    ): void;
  }
}
