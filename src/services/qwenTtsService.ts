/**
 * Qwen3-TTS 연동 서비스
 * 백엔드 /api/tts 프록시를 통해 텍스트→음성 및 보이스 클로닝 지원.
 * 보이스 클로닝 최대 품질·동일 목소리 유지: qualityPreset 'voice_clone_max' + refAudio + refText 사용.
 * 딥러닝 기반 참조 음성 보정(enhanceRefAudio) + 자연스러움 지시(naturalnessMode)로 더 자연스러운 목소리 생성.
 */

import {
  API_BASE_URL,
  API_PROJECTS_LIST_PATH,
  API_PROJECT_VOICE_SOURCES_SEGMENT,
  API_QUERY_PARAM_PROJECT_ID,
  API_TTS_CONFIG_PATH,
  API_TTS_SPEECH_FROM_PROJECT_PATH,
  API_TTS_SPEECH_FROM_SOURCE_PATH,
  API_TTS_SPEECH_PATH,
  API_TTS_SITUATIONS_PATH,
  API_TTS_VOICES_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export type QwenTtsTaskType = 'CustomVoice' | 'VoiceDesign' | 'Base';

/** 품질 프리셋: voice_clone_max = 동일 보이스로 자유 텍스트 합성 품질 최대화 */
export type QwenTtsQualityPreset = 'standard' | 'high' | 'voice_clone_max';

/** 특정 상황에 맞는 성우 목소리 (instructions에 반영). 영화·드라마 대사 스타일 포함 */
export type TtsSituation =
  | 'default'
  | 'narration'
  | 'news'
  | 'emotional'
  | 'children'
  | 'ad'
  | 'documentary'
  | 'audiobook'
  | 'game_character'
  | 'announcement'
  | 'warm_story'
  | 'professional'
  | 'exciting'
  | 'movie_dialogue'
  | 'drama_dialogue'
  | 'film_acting';

/** 상황별 UI 라벨 (드롭다운 등에서 사용) */
export const TTS_SITUATION_LABELS: Record<TtsSituation, string> = {
  default: '기본',
  narration: '나레이션',
  news: '뉴스/앵커',
  emotional: '감정 연기',
  children: '동화/어린이',
  ad: '광고',
  documentary: '다큐멘터리',
  audiobook: '오디오북',
  game_character: '게임 캐릭터',
  announcement: '안내 방송',
  warm_story: '따뜻한 이야기',
  professional: '비즈니스/전문가',
  exciting: '흥미진진/역동',
  movie_dialogue: '영화 대사',
  drama_dialogue: '드라마 대사',
  film_acting: '영화·드라마 연기',
};

/** 영화/드라마 대본을 특정 목소리로 만들 때 권장하는 상황 */
export const TTS_SCRIPT_DIALOGUE_SITUATIONS: TtsSituation[] = ['movie_dialogue', 'drama_dialogue', 'film_acting'];

export interface QwenTtsConfig {
  success: boolean;
  available: boolean;
  base_url_configured: boolean;
  message: string;
}

export interface QwenTtsVoicesResponse {
  success: boolean;
  voices: string[] | { id: string; name?: string }[];
  message?: string;
}

export interface QwenTtsSpeakOptions {
  /** 백엔드 API 베이스 URL (기본: API_BASE_URL) */
  baseUrl?: string;
  /** 보이스 ID/이름 (CustomVoice) */
  voiceId?: string;
  /** 태스크: CustomVoice | VoiceDesign | Base(클로닝) */
  taskType?: QwenTtsTaskType;
  /** 언어: Auto, Chinese, English, Japanese, Korean */
  language?: string;
  /** 스타일/감정 지시 */
  instructions?: string;
  /** 참조 오디오: File(업로드) 또는 URL/data:...;base64,... (Base 태스크) */
  refAudio?: File | string;
  /** 참조 오디오 대본 (Base 태스크, ICL 시 정확한 대본 권장) */
  refText?: string;
  /** 오디오 포맷 (클로닝 품질 최대화 시 wav 권장) */
  responseFormat?: 'wav' | 'mp3' | 'flac' | 'pcm' | 'aac' | 'opus';
  /** TTS 생성 시 음성 속도 0.25–4.0 (API 파라미터) */
  speed?: number;
  /** 최대 생성 토큰 (보이스 클로닝·긴 문장 시 4096 권장) */
  maxNewTokens?: number;
  /** True 시 스피커 임베딩만 사용해 임의 텍스트에 동일 보이스 적용 (ICL 미사용) */
  xVectorOnlyMode?: boolean;
  /** voice_clone_max: 클로닝 품질·동일 보이스 유지 최대화 */
  qualityPreset?: QwenTtsQualityPreset;
  /** 참조 음성에 딥러닝 기반 노이즈 감소·음량 정규화 적용 (같은 목소리·자연스러운 합성) */
  enhanceRefAudio?: boolean;
  /** natural/auto: 합성 시 자연스러움 지시 추가 (일상 말투·부드러운 톤) */
  naturalnessMode?: 'off' | 'auto' | 'natural';
  /** 특정 상황에 맞는 성우 목소리 (나레이션, 뉴스, 감정 연기, 광고 등) */
  situation?: TtsSituation | string;
}

/** 보이스 클로닝 최대 품질 기본값 (동일 목소리로 자유 텍스트 합성) */
export const VOICE_CLONE_MAX_NEW_TOKENS = 4096;
export const VOICE_CLONE_RESPONSE_FORMAT = 'wav' as const;

/** 재생 속도 옵션 (브라우저 재생 시 playbackRate). 권장 범위 0.5–2 */
export const PLAYBACK_RATE_MIN = 0.5;
export const PLAYBACK_RATE_MAX = 2;
export const PLAYBACK_RATE_DEFAULT = 1;

const DEFAULT_BASE = API_BASE_URL;

function getBaseUrl(options?: { baseUrl?: string }): string {
  const base = (options?.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
  return base;
}

/**
 * TTS 사용 가능 여부 및 설정 조회
 */
export async function getQwenTtsConfig(
  baseUrl: string = DEFAULT_BASE
): Promise<QwenTtsConfig> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_CONFIG_PATH));
  if (!res.ok) throw new Error(`TTS config failed: ${res.status}`);
  return res.json() as Promise<QwenTtsConfig>;
}

/**
 * 사용 가능한 보이스 목록 조회 (CustomVoice 모델)
 */
export async function getQwenTtsVoices(
  baseUrl: string = DEFAULT_BASE
): Promise<QwenTtsVoicesResponse> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_VOICES_PATH));
  if (!res.ok) throw new Error(`TTS voices failed: ${res.status}`);
  return res.json() as Promise<QwenTtsVoicesResponse>;
}

export interface TtsSituationItem {
  id: string;
  label: string;
  instructions_preview: string;
}

/**
 * 특정 상황에 맞는 성우 목소리 프리셋 목록 조회 (UI 선택용)
 */
export async function getQwenTtsSituations(
  baseUrl: string = DEFAULT_BASE
): Promise<{ success: boolean; situations: TtsSituationItem[] }> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SITUATIONS_PATH));
  if (!res.ok) throw new Error(`TTS situations failed: ${res.status}`);
  return res.json() as Promise<{ success: boolean; situations: TtsSituationItem[] }>;
}

/**
 * File을 data:audio/...;base64,... 문자열로 변환
 */
async function fileToRefAudioDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Qwen3-TTS로 텍스트→음성 생성 후 오디오 Blob 반환.
 * qualityPreset 'voice_clone_max' + refAudio(+ refText) 사용 시 동일 보이스로 자유 텍스트 합성 품질 최대화.
 */
export async function speakQwenTts(
  text: string,
  options: QwenTtsSpeakOptions = {}
): Promise<Blob> {
  const base = getBaseUrl(options);
  const isBase = options.taskType === 'Base' || options.qualityPreset === 'voice_clone_max';
  const body: Record<string, unknown> = {
    input: text,
    voice: options.voiceId ?? 'Vivian',
    response_format: options.responseFormat ?? (isBase ? VOICE_CLONE_RESPONSE_FORMAT : 'mp3'),
    speed: options.speed ?? 1.0,
    task_type: options.taskType ?? (options.qualityPreset === 'voice_clone_max' ? 'Base' : 'CustomVoice'),
    language: options.language ?? 'Auto',
  };
  if (options.qualityPreset != null) body.quality_preset = options.qualityPreset;
  if (options.maxNewTokens != null) body.max_new_tokens = options.maxNewTokens;
  if (options.xVectorOnlyMode === true) body.x_vector_only_mode = true;
  if (options.enhanceRefAudio === true) body.enhance_ref_audio = true;
  if (options.naturalnessMode != null && options.naturalnessMode !== 'off') body.naturalness_mode = options.naturalnessMode;
  if (options.situation != null && options.situation !== 'default') body.situation = options.situation;
  if (options.instructions != null) body.instructions = options.instructions;
  if (options.refText != null) body.ref_text = options.refText;
  if (options.refAudio != null) {
    if (options.refAudio instanceof File) {
      body.ref_audio = await fileToRefAudioDataUrl(options.refAudio);
    } else {
      body.ref_audio = options.refAudio;
    }
  }
  if (body.task_type === 'Base' && body.ref_audio == null) {
    throw new Error('보이스 클로닝(Base) 사용 시 refAudio가 필요합니다.');
  }

  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SPEECH_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      (errBody as { error?: string }).error ??
      (errBody as { detail?: string }).detail ??
      res.statusText;
    throw new Error(`TTS failed: ${res.status} - ${msg}`);
  }

  return res.blob();
}

/**
 * 동일 보이스로 자유 텍스트 합성 (품질 최대화 + 딥러닝 기반 자연스러움).
 * 참조 오디오(refAudio)와 대본(refText)으로 목소리를 고정한 뒤, 임의의 텍스트를 같은 목소리로 낸다.
 * - refAudio: 3~10초 정도의 참조 음성 (File 또는 data URL)
 * - refText: 참조 음성의 정확한 대본 (ICL 품질 향상)
 * - enhanceRefAudio: 참조 음성 노이즈 감소·정규화 (기본 true, 자연스러운 결과)
 * - naturalnessMode: 합성 시 자연스러운 말투 지시 (기본 'natural')
 */
export async function speakQwenTtsWithVoiceClone(
  text: string,
  refAudio: File | string,
  options: {
    refText?: string;
    xVectorOnlyMode?: boolean;
    baseUrl?: string;
    speed?: number;
    language?: string;
    maxNewTokens?: number;
    /** 참조 음성 딥러닝 보정 (기본 true) */
    enhanceRefAudio?: boolean;
    /** 자연스러움 지시 (기본 'natural') */
    naturalnessMode?: 'off' | 'auto' | 'natural';
    /** 특정 상황에 맞는 성우 목소리 */
    situation?: TtsSituation | string;
  } = {}
): Promise<Blob> {
  return speakQwenTts(text, {
    qualityPreset: 'voice_clone_max',
    taskType: 'Base',
    refAudio,
    refText: options.refText,
    xVectorOnlyMode: options.xVectorOnlyMode,
    responseFormat: VOICE_CLONE_RESPONSE_FORMAT,
    maxNewTokens: options.maxNewTokens ?? VOICE_CLONE_MAX_NEW_TOKENS,
    baseUrl: options.baseUrl,
    speed: options.speed,
    language: options.language,
    enhanceRefAudio: options.enhanceRefAudio !== false,
    naturalnessMode: options.naturalnessMode ?? 'natural',
    situation: options.situation,
  });
}

/**
 * 영화·드라마 대사처럼: 원하는 목소리(refAudio)를 학습하고, 대본(script)을 그 목소리로 만들어냄.
 * - 참조 음성(영화/드라마 클립, 유튜브 등)으로 목소리를 고정한 뒤, 새 대본을 그 목소리·연기 톤으로 합성.
 * - situation 기본값: drama_dialogue (movie_dialogue, film_acting 선택 가능)
 */
export async function speakQwenTtsScriptInVoice(
  script: string,
  refAudio: File | string,
  options: {
    refText?: string;
    /** 영화 대사 / 드라마 대사 / 영화·드라마 연기 (기본: drama_dialogue) */
    situation?: 'movie_dialogue' | 'drama_dialogue' | 'film_acting';
    baseUrl?: string;
    speed?: number;
    language?: string;
    enhanceRefAudio?: boolean;
    naturalnessMode?: 'off' | 'auto' | 'natural';
  } = {}
): Promise<Blob> {
  return speakQwenTtsWithVoiceClone(script, refAudio, {
    ...options,
    situation: options.situation ?? 'drama_dialogue',
    enhanceRefAudio: options.enhanceRefAudio !== false,
    naturalnessMode: options.naturalnessMode ?? 'natural',
  });
}

/**
 * 동일 보이스로 텍스트 합성 후 재생 (품질 최대화 + 딥러닝 자연스러움). stop() 반환.
 */
export async function speakQwenTtsWithVoiceCloneAndPlay(
  text: string,
  refAudio: File | string,
  options: {
    refText?: string;
    xVectorOnlyMode?: boolean;
    baseUrl?: string;
    speed?: number;
    language?: string;
    playbackRate?: number;
    enhanceRefAudio?: boolean;
    naturalnessMode?: 'off' | 'auto' | 'natural';
    situation?: TtsSituation | string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}
): Promise<{ stop: () => void }> {
  const { refText, xVectorOnlyMode, baseUrl, speed, language, playbackRate, enhanceRefAudio, naturalnessMode, situation, onStart, onEnd, onError } = options;
  return speakQwenTtsAndPlay(text, {
    qualityPreset: 'voice_clone_max',
    taskType: 'Base',
    refAudio,
    refText,
    xVectorOnlyMode,
    responseFormat: VOICE_CLONE_RESPONSE_FORMAT,
    maxNewTokens: VOICE_CLONE_MAX_NEW_TOKENS,
    baseUrl,
    speed,
    language,
    enhanceRefAudio: enhanceRefAudio !== false,
    naturalnessMode: naturalnessMode ?? 'natural',
    situation,
    playbackRate,
    onStart,
    onEnd,
    onError,
  });
}

/**
 * Qwen3-TTS로 음성 생성 후 재생. 재생 중지용 stop() 반환.
 * playbackRate로 재생 속도 조절 (0.5–2 권장, 기본 1).
 */
export async function speakQwenTtsAndPlay(
  text: string,
  options: QwenTtsSpeakOptions & {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    /** 재생 속도 (0.5–2 권장). 브라우저 playbackRate */
    playbackRate?: number;
  } = {}
): Promise<{ stop: () => void }> {
  const { onStart, onEnd, onError, playbackRate = PLAYBACK_RATE_DEFAULT, ...speakOpts } = options;
  let url: string | null = null;
  let audio: HTMLAudioElement | null = null;

  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    if (url) {
      URL.revokeObjectURL(url);
      url = null;
    }
    onEnd?.();
  };

  try {
    onStart?.();
    const blob = await speakQwenTts(text, speakOpts);
    url = URL.createObjectURL(blob);
    audio = new Audio(url);
    const rate = Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAX, playbackRate));
    audio.playbackRate = rate;
    audio.onended = () => {
      stop();
    };
    audio.onerror = () => {
      stop();
      onError?.('오디오 재생 실패');
    };
    await audio.play();
    return { stop };
  } catch (e) {
    if (url) URL.revokeObjectURL(url);
    const message = e instanceof Error ? e.message : String(e);
    onError?.(message);
    throw e;
  }
}

/** YouTube/TikTok URL에서 목소리를 학습해 텍스트를 해당 목소리로 합성(대복). */
export async function speakQwenTtsFromSourceUrl(
  text: string,
  sourceUrl: string,
  options: {
    refTextOverride?: string;
    maxRefSeconds?: number;
    baseUrl?: string;
    responseFormat?: 'wav' | 'mp3' | 'flac';
    enhanceRefAudio?: boolean;
    naturalnessMode?: 'off' | 'auto' | 'natural';
    /** 특정 상황에 맞는 성우 목소리 (영화/드라마 대사: movie_dialogue, drama_dialogue, film_acting) */
    situation?: TtsSituation | string;
  } = {}
): Promise<Blob> {
  return speakQwenTtsFromSourceUrlInternal(text, sourceUrl, options);
}

/**
 * 영화·드라마 영상 URL에서 목소리를 학습하고, 대본(script)을 그 목소리로 만들어냄.
 * - 영상 URL(YouTube/TikTok 등)에서 참조 음성 추출 → 대본을 영화/드라마 대사 톤으로 합성.
 */
export async function speakQwenTtsScriptFromSourceUrl(
  script: string,
  sourceUrl: string,
  options: {
    refTextOverride?: string;
    maxRefSeconds?: number;
    baseUrl?: string;
    situation?: 'movie_dialogue' | 'drama_dialogue' | 'film_acting';
    /** 스타일/감정 추가 지시 (예: 서러운듯 울먹이며) */
    instructions?: string;
    /** 재생 속도 0.25~4.0 */
    speed?: number;
  } = {}
): Promise<Blob> {
  return speakQwenTtsFromSourceUrlInternal(script, sourceUrl, {
    ...options,
    situation: options.situation ?? 'drama_dialogue',
  });
}

async function speakQwenTtsFromSourceUrlInternal(
  text: string,
  sourceUrl: string,
  options: {
    refTextOverride?: string;
    maxRefSeconds?: number;
    baseUrl?: string;
    responseFormat?: 'wav' | 'mp3' | 'flac';
    enhanceRefAudio?: boolean;
    naturalnessMode?: 'off' | 'auto' | 'natural';
    situation?: TtsSituation | string;
    /** 스타일/감정 추가 지시 */
    instructions?: string;
    speed?: number;
  } = {}
): Promise<Blob> {
  const base = getBaseUrl(options);
  const body: Record<string, unknown> = {
    source_url: sourceUrl,
    input: text,
    ref_text_override: options.refTextOverride,
    max_ref_seconds: options.maxRefSeconds ?? 10,
    quality_preset: 'voice_clone_max',
    enhance_ref_audio: options.enhanceRefAudio !== false,
    naturalness_mode: options.naturalnessMode ?? 'natural',
    response_format: options.responseFormat ?? 'mp3',
    situation: options.situation,
    speed: options.speed ?? 1.0,
  };
  const instr = coerceTrimmedString(options.instructions, '');
  if (instr) body.instructions = instr;
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SPEECH_FROM_SOURCE_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      (errBody as { error?: string }).error ??
      (errBody as { detail?: string }).detail ??
      res.statusText;
    throw new Error(`TTS from source failed: ${res.status} - ${msg}`);
  }
  return res.blob();
}

/** 노트북 LLM 프로젝트에 등록된 보이스 소스로 텍스트를 해당 목소리로 합성. */
export async function speakQwenTtsFromProject(
  text: string,
  projectId: string,
  options: {
    voiceSourceId?: string;
    maxRefSeconds?: number;
    baseUrl?: string;
    responseFormat?: 'wav' | 'mp3' | 'flac';
    enhanceRefAudio?: boolean;
    naturalnessMode?: 'off' | 'auto' | 'natural';
    /** 특정 상황에 맞는 성우 목소리 */
    situation?: TtsSituation | string;
    /** 스타일/감정 추가 지시 (예: 서러운듯 울먹이며, 명료하게) */
    instructions?: string;
    /** 재생 속도 0.25~4.0 */
    speed?: number;
  } = {}
): Promise<Blob> {
  const base = getBaseUrl(options);
  const body: Record<string, unknown> = {
    [API_QUERY_PARAM_PROJECT_ID]: projectId,
    input: text,
    voice_source_id: options.voiceSourceId,
    max_ref_seconds: options.maxRefSeconds ?? 10,
    quality_preset: 'voice_clone_max',
    enhance_ref_audio: options.enhanceRefAudio !== false,
    naturalness_mode: options.naturalnessMode ?? 'natural',
    response_format: options.responseFormat ?? 'mp3',
    situation: options.situation,
    speed: options.speed ?? 1.0,
  };
  const instrFromProject = coerceTrimmedString(options.instructions, '');
  if (instrFromProject) body.instructions = instrFromProject;
  const res = await fetch(joinApiHealthCheckUrl(base, API_TTS_SPEECH_FROM_PROJECT_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      (errBody as { error?: string }).error ??
      (errBody as { detail?: string }).detail ??
      res.statusText;
    throw new Error(`TTS from project failed: ${res.status} - ${msg}`);
  }
  return res.blob();
}

export interface ProjectVoiceSource {
  id: string;
  url: string;
  ref_text?: string | null;
  created_at: string;
  /** 목소리 ID/이름 (구분용) */
  name?: string | null;
  /** 심화 학습용 추가 URL */
  reference_url?: string | null;
  /** 해당 목소리만: 구간 시작(초) */
  start_seconds?: number | null;
  /** 해당 목소리만: 구간 끝(초) */
  end_seconds?: number | null;
}

/** 노트북 LLM 프로젝트 보이스 소스 목록 조회. */
export async function getProjectVoiceSources(
  projectId: string,
  baseUrl: string = DEFAULT_BASE
): Promise<{ success: boolean; data: ProjectVoiceSource[]; count: number }> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(
    joinApiHealthCheckUrl(
      base,
      `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_VOICE_SOURCES_SEGMENT}`,
    ),
  );
  if (!res.ok) throw new Error(`Voice sources failed: ${res.status}`);
  return res.json() as Promise<{ success: boolean; data: ProjectVoiceSource[]; count: number }>;
}

/** 노트북 LLM 프로젝트에 보이스 소스(YouTube/TikTok URL) 추가. */
export async function addProjectVoiceSource(
  projectId: string,
  url: string,
  options: {
    refText?: string;
    baseUrl?: string;
    /** 목소리 ID/이름 (구분용) */
    name?: string;
    /** 심화 학습용 추가 URL (같은 목소리 더 수집 시 품질 향상) */
    referenceUrl?: string;
    /** 해당 목소리만: 구간 시작(초). 여러 화자 중 한 명만 쓸 때 */
    startSeconds?: number;
    /** 해당 목소리만: 구간 끝(초) */
    endSeconds?: number;
  } = {}
): Promise<{ success: boolean; data: { voice_source: ProjectVoiceSource } }> {
  const base = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
  const body: Record<string, unknown> = {
    url: coerceTrimmedString(url, ''),
    ref_text: coerceTrimmedString(options.refText ?? '', '') || null,
  };
  const voiceName = coerceTrimmedString(options.name, '');
  if (voiceName) body.name = voiceName;
  const refUrl = coerceTrimmedString(options.referenceUrl, '');
  if (refUrl) body.reference_url = refUrl;
  if (options.startSeconds != null) body.start_seconds = options.startSeconds;
  if (options.endSeconds != null) body.end_seconds = options.endSeconds;
  const res = await fetch(
    joinApiHealthCheckUrl(
      base,
      `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_VOICE_SOURCES_SEGMENT}`,
    ),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Add voice source failed: ${res.status}`);
  return res.json() as Promise<{ success: boolean; data: { voice_source: ProjectVoiceSource } }>;
}

/** 노트북 LLM 프로젝트 보이스 소스 삭제. */
export async function deleteProjectVoiceSource(
  projectId: string,
  sourceId: string,
  baseUrl: string = DEFAULT_BASE
): Promise<void> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(
    joinApiHealthCheckUrl(
      base,
      `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_VOICE_SOURCES_SEGMENT}/${encodeURIComponent(sourceId)}`,
    ),
    {
      method: 'DELETE',
    },
  );
  if (!res.ok) throw new Error(`Delete voice source failed: ${res.status}`);
}
