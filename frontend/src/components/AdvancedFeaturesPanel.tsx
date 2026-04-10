/**
 * 고급 기능 패널 컴포넌트
 *
 * 음성 인식, 이미지 분석, 예측 분석, 목소리 생성(Qwen TTS) 기능을 탭으로 통합 제공합니다.
 * - 음성 인식: Web Speech API + 백엔드 세션 연동
 * - 이미지 분석: 파일 업로드 후 객체/OCR/감정 분석
 * - 예측 분석: 사용자 활동·메시지 품질·시스템 성능 예측 및 요약
 * - 목소리 생성: URL/프로젝트 보이스/상황만 선택 모드 지원
 *
 * 접근성: role="tablist"/"tab"/"tabpanel", 키보드(Arrow, Home, End) 탭 이동 지원
 */

import { DEMO_PLACEHOLDER_YOUTUBE_OR_TIKTOK_URL_HINT, WS_BASE_URL } from '../config/api';
import React, { useState, useCallback, useRef, useMemo, useEffect, startTransition } from 'react';
import advancedAPIService, {
  ImageAnalysisResponse,
  UserActivityPredictionResponse,
  MessageQualityPredictionResponse,
  SystemPerformancePredictionResponse,
  PredictionSummaryResponse,
} from '../services/advancedAPIService';
import { useWebSocket } from '../hooks/useWebSocket';
import { speechRecognitionService } from '../services/speechRecognitionService';
import PredictionChart from './PredictionChart';
import LoadingSkeleton from './LoadingSkeleton';
import LoadingStateIndicator from './LoadingStateIndicator';
import { useLoadingState } from '../hooks/useLoadingState';
import { useDebounce } from '../hooks/useDebounce';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  getQwenTtsConfig,
  speakQwenTts,
  speakQwenTtsScriptFromSourceUrl,
  speakQwenTtsFromProject,
  getProjectVoiceSources,
  addProjectVoiceSource,
  deleteProjectVoiceSource,
  TTS_SITUATION_LABELS,
  TTS_SCRIPT_DIALOGUE_SITUATIONS,
  type ProjectVoiceSource,
  type TtsSituation,
} from '../services/qwenTtsService';
import {
  extractScriptFromDocument,
  analyzeScriptStyle,
  generateScriptInStyle,
} from '../services/scriptStyleAPI';
import { Settings } from 'lucide-react';
import './AdvancedFeaturesPanel.css';

type ScriptDialogueSituation = 'movie_dialogue' | 'drama_dialogue' | 'film_acting';

const TTS_SITUATION_OPTIONS: TtsSituation[] = (
  Object.keys(TTS_SITUATION_LABELS) as TtsSituation[]
);

const TAB_ORDER: Array<'voice' | 'image' | 'prediction' | 'voiceGen'> = ['voice', 'image', 'prediction', 'voiceGen'];
const TAB_IDS: Record<'voice' | 'image' | 'prediction' | 'voiceGen', string> = {
  voice: 'tab-voice',
  image: 'tab-image',
  prediction: 'tab-prediction',
  voiceGen: 'tab-voiceGen',
};
const PANEL_IDS: Record<'voice' | 'image' | 'prediction' | 'voiceGen', string> = {
  voice: 'panel-voice',
  image: 'panel-image',
  prediction: 'panel-prediction',
  voiceGen: 'panel-voiceGen',
};

/** Typecast 7종 감정 프리셋 (공식: normal, happy, sad, angry, whisper, toneup, tonedown) */
export type TypecastEmotionPreset = 'normal' | 'happy' | 'sad' | 'angry' | 'whisper' | 'toneup' | 'tonedown';
const TYPECAST_EMOTION_PRESETS: { value: TypecastEmotionPreset; label: string }[] = [
  { value: 'normal', label: '보통' },
  { value: 'happy', label: '기쁨' },
  { value: 'sad', label: '슬픔' },
  { value: 'angry', label: '분노' },
  { value: 'whisper', label: '속삭임' },
  { value: 'toneup', label: '톤업(밝게)' },
  { value: 'tonedown', label: '톤다운(차분히)' },
];

/** 감정·상황 프롬프트 빠른 입력 태그 (타입캐스트 스타일) */
const VOICE_GEN_EMOTION_TAGS = ['명료하게', '따뜻하게', '추궁하듯', '넋을 잃은 듯', '귀찮은 듯'] as const;

/** 줄 단위 대본 아이템 (Typecast 스타일: 한 줄마다 속도·톤·음성 개별 설정) */
export interface ScriptLine {
  id: string;
  text: string;
  speed: number;
  tonePrompt: string;
  pitch: number;
  pauseAfter: number;
  audioUrl: string | null;
  duration: number | null;
  isPause?: boolean;
}

const TONE_HASHTAGS = ['#명료하게', '#따뜻하게', '#추궁하듯', '#넋을 잃은 듯', '#귀찮은 듯', '#설렌 듯', '#진지하게'] as const;

/** 대본 텍스트를 줄 단위로 파싱하여 ScriptLine 배열로 변환 (업로드/붙여넣기용) */
function parseScriptToLines(script: string): ScriptLine[] {
  const raw = coerceTrimmedString(script, '').split(/\n/).map((s) => coerceTrimmedString(s, '')).filter(Boolean);
  const ts = Date.now();
  return raw.map((text, i) => ({
    id: `line-${ts}-${i}`,
    text,
    speed: 1.0,
    tonePrompt: '',
    pitch: 0,
    pauseAfter: 0.1,
    audioUrl: null,
    duration: null,
  }));
}

/** ScriptLine[]을 단일 텍스트로 병합 */
function linesToScript(lines: ScriptLine[]): string {
  return lines.map((l) => (l.isPause ? '' : l.text)).filter(Boolean).join('\n');
}

/** AudioBuffer를 WAV Blob으로 변환 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let offset = 0;
  const setUint8 = (v: number) => { view.setUint8(offset++, v); };
  ['R', 'I', 'F', 'F'].forEach((c) => setUint8(c.charCodeAt(0)));
  view.setUint32(offset, length - 8, true); offset += 4;
  ['W', 'A', 'V', 'E', 'f', 'm', 't', ' '].forEach((c) => setUint8(c.charCodeAt(0)));
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numCh, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numCh * 2, true); offset += 4;
  view.setUint16(offset, numCh * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  ['d', 'a', 't', 'a'].forEach((c) => setUint8(c.charCodeAt(0)));
  view.setUint32(offset, buffer.length * numCh * 2, true); offset += 4;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return arrayBuffer;
}

/** 대본을 문단/문장/단어/줄 단위로 나누어 구간 배열 생성 (각 구간 기본 속도 1.0) */
function splitScriptToSegments(
  script: string,
  by: 'paragraph' | 'sentence' | 'word' | 'line'
): Array<{ text: string; speed: number }> {
  const trimmed = coerceTrimmedString(script, '');
  if (!trimmed) return [];
  let parts: string[];
  switch (by) {
    case 'paragraph':
      parts = trimmed.split(/\n\s*\n|\r\n\s*\r\n/).map((s) => coerceTrimmedString(s, '')).filter(Boolean);
      break;
    case 'sentence':
      parts = trimmed
        .split(/(?<=[.!?。])\s+/)
        .map((s) => coerceTrimmedString(s, ''))
        .filter(Boolean);
      if (parts.length === 0) parts = [trimmed];
      break;
    case 'word':
      parts = trimmed.split(/\s+/).filter(Boolean);
      break;
    case 'line':
    default:
      parts = trimmed.split(/\n/).map((s) => coerceTrimmedString(s, '')).filter(Boolean);
      break;
  }
  return parts.map((text) => ({ text, speed: 1.0 }));
}

export interface AdvancedFeaturesPanelProps {
  /** 사용자/방 식별자 (WebSocket roomId 등에 사용) */
  userId?: string;
  /** 현재 프로젝트 ID (넘기면 목소리 생성 탭의 프로젝트 ID 필드에 자동 반영) */
  projectId?: string | null;
  /** 모달 등에서 열 때 처음 보여줄 탭 (예: 'voiceGen') */
  defaultTab?: 'voice' | 'image' | 'prediction' | 'voiceGen';
  /** 이미지 분석 완료 시 호출되는 콜백 */
  onImageAnalyzed?: (result: ImageAnalysisResponse) => void;
  /** 예측 분석 완료 시 호출 (type: 'user_activity' | 'message_quality' | 'system_performance') */
  onPredictionComplete?: (type: string, result: unknown) => void;
}

const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({
  userId = 'default-user',
  projectId: projectIdProp,
  defaultTab = 'image',
  onImageAnalyzed,
  onPredictionComplete,
}) => {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<'voice' | 'image' | 'prediction' | 'voiceGen'>(defaultTab);
  const { loadingState, startUpdating, stopLoading } = useLoadingState();

  // defaultTab prop 변경 시 활성 탭 동기화 (모달 재오픈 등)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [error, setError] = useState<string | null>(null);
  /** TTS 서버 미연결 시 브라우저 음성 폴백 안내 (오류가 아닌 안내 메시지) */
  const [ttsFallbackNotice, setTtsFallbackNotice] = useState<string | null>(null);

  // 목소리 생성 (Qwen TTS)
  const [ttsAvailable, setTtsAvailable] = useState<boolean | null>(null);
  const [voiceGenUrl, setVoiceGenUrl] = useState('');
  const [voiceGenScript, setVoiceGenScript] = useState('');
  const [voiceGenSituation, setVoiceGenSituation] = useState<ScriptDialogueSituation>('drama_dialogue');
  const [voiceGenAudioUrl, setVoiceGenAudioUrl] = useState<string | null>(null);
  const voiceGenAudioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceGenProjectId, setVoiceGenProjectId] = useState('');
  const [voiceGenMode, setVoiceGenMode] = useState<'url' | 'project' | 'situation'>('url');
  const [voiceGenSituationOnly, setVoiceGenSituationOnly] = useState<TtsSituation>('narration');
  const [projectVoiceSources, setProjectVoiceSources] = useState<ProjectVoiceSource[]>([]);
  /** 프로젝트 모드에서 생성 시 사용할 학습된 목소리 ID (null = 서버 기본) */
  const [voiceGenSelectedSourceId, setVoiceGenSelectedSourceId] = useState<string | null>(null);
  const [voiceGenAddSourceUrl, setVoiceGenAddSourceUrl] = useState('');
  /** 목소리 학습 추가 시 참조 대본(선택). 영상의 정확한 대본을 넣으면 학습 품질이 좋아짐 */
  const [voiceGenAddSourceRefText, setVoiceGenAddSourceRefText] = useState('');
  /** 목소리 ID/이름 (구분용). 해당 아이디에 맞는 연결 URL로 학습 심화 */
  const [voiceGenAddSourceName, setVoiceGenAddSourceName] = useState('');
  /** 심화 학습용 추가 URL (같은 목소리 더 수집 시 품질 향상) */
  const [voiceGenAddSourceReferenceUrl, setVoiceGenAddSourceReferenceUrl] = useState('');
  /** 해당 목소리만: 구간 시작(초). 여러 사람 나오는 영상에서 한 목소리만 학습할 때 */
  const [voiceGenAddSourceStartSec, setVoiceGenAddSourceStartSec] = useState<string>('');
  /** 해당 목소리만: 구간 끝(초) */
  const [voiceGenAddSourceEndSec, setVoiceGenAddSourceEndSec] = useState<string>('');
  const [voiceSourcesLoading, setVoiceSourcesLoading] = useState(false);
  /** 대본 전체 속도 (구간별 미사용 시). 0.25~4.0 */
  const [voiceGenGlobalSpeed, setVoiceGenGlobalSpeed] = useState(1.0);
  /** 구간별 속도 사용 여부 (문단/문장/단어/직접 구간) */
  const [voiceGenUseSegmentSpeed, setVoiceGenUseSegmentSpeed] = useState(false);
  /** 구간 나누기 기준 */
  const [voiceGenSplitBy, setVoiceGenSplitBy] = useState<'paragraph' | 'sentence' | 'word' | 'line'>('paragraph');
  /** 구간별 텍스트 + 속도 (구간별 속도 사용 시) */
  const [voiceGenSegments, setVoiceGenSegments] = useState<Array<{ text: string; speed: number }>>([]);
  /** 끊어 읽기(쉼) 시간(초). 0~10. 타입캐스트 스타일 UI용, API 연동 시 전달 */
  const [_voiceGenPauseSeconds, _setVoiceGenPauseSeconds] = useState(0.1);
  /** 끝음 조절: 자동 / 직접. 타입캐스트 스타일 UI용 */
  const [_voiceGenEndTone, _setVoiceGenEndTone] = useState<'auto' | 'manual'>('auto');
  /** 피치 조절. -1(낮게)~1(높게), 0=보통. 타입캐스트 스타일 UI용 */
  const [_voiceGenPitch, _setVoiceGenPitch] = useState(0);
  /** 구간별 생성된 오디오 URL (순차 재생용) */
  const [voiceGenSegmentUrls, setVoiceGenSegmentUrls] = useState<string[]>([]);
  const voiceGenSegmentUrlsRef = useRef<string[]>([]);
  const voiceGenSegmentPlayIndexRef = useRef(0);
  /** 생성 후 재생 버튼 클릭 시, 생성 완료 후 자동 재생 */
  const voiceGenAutoPlayAfterGenerateRef = useRef(false);
  /** 샘플 대본 스타일 반영: 샘플 텍스트, 분석 요약, 생성 주제, 문서 유형 힌트(톤다운·기업보도 등) */
  const [voiceGenSampleScript, setVoiceGenSampleScript] = useState('');
  const [voiceGenStyleSummary, setVoiceGenStyleSummary] = useState<string | null>(null);
  const [voiceGenTopicOutline, setVoiceGenTopicOutline] = useState('');
  const [voiceGenDocumentHint, setVoiceGenDocumentHint] = useState<'tone_down' | 'corporate' | 'general' | ''>('');
  const [voiceGenSourceFilename, setVoiceGenSourceFilename] = useState('');
  const voiceGenSampleFileInputRef = useRef<HTMLInputElement | null>(null);
  const voiceGenImportInputRef = useRef<HTMLInputElement | null>(null);
  /** 줄 모드 프로젝트 제목 (타입캐스트 스타일) */
  const [voiceGenProjectTitle, setVoiceGenProjectTitle] = useState('제목없음');
  /** 선택 입력 프리셋 탭 (일반 / A,B,C,D) */
  const [voiceGenInputPreset, setVoiceGenInputPreset] = useState<'일반' | 'A' | 'B' | 'C' | 'D'>('일반');
  /** A/B/C/D 프리셋 저장값 (속도·톤·피치·끊어읽기) */
  const [voiceGenPresets, setVoiceGenPresets] = useState<Record<'A' | 'B' | 'C' | 'D', { speed: number; tonePrompt: string; pitch: number; pauseAfter: number } | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });
  /** 읽는 시간 입력 Beta (목표 초, 적용 시 해당 줄 속도 조정) */
  const [voiceGenReadingTimeInput, setVoiceGenReadingTimeInput] = useState('');
  /** 감정·상황 프롬프트 (예: 서러운듯 울먹이며). TTS instructions로 전달되어 음성 톤 반영 */
  const [voiceGenEmotionPrompt, setVoiceGenEmotionPrompt] = useState('');
  /** Typecast 스타일 감정 제어: Smart Emotion(자동) vs Preset(7종 수동) */
  const [voiceGenEmotionMode, setVoiceGenEmotionMode] = useState<'smart' | 'preset'>('smart');
  /** Preset 선택 시 Typecast 7종 감정 프리셋 */
  const [voiceGenEmotionPreset, setVoiceGenEmotionPreset] = useState<TypecastEmotionPreset>('normal');
  /** 줄 모드 적용/저장 등 짧은 성공 메시지 (2초 후 자동 해제) */
  const [voiceGenToast, setVoiceGenToast] = useState<string | null>(null);
  /** PRO 재생 속도 (0.5~2배, 재생 시 적용) */
  const [voiceGenPlaybackRate, setVoiceGenPlaybackRate] = useState(1);
  /** 대본을 줄 단위로 파싱 (타입캐스트 스타일 목록 표시용) — legacy */
  const voiceGenScriptLines = useMemo(
    () => coerceTrimmedString(voiceGenScript, '').split(/\n/).map((s) => coerceTrimmedString(s, '')).filter(Boolean),
    [voiceGenScript]
  );
  /** 줄 단위 대본 (Typecast 스타일: 줄마다 속도·톤·음성 개별 설정) */
  const [voiceGenLines, setVoiceGenLines] = useState<ScriptLine[]>([]);
  /** 선택된 줄 인덱스 (오른쪽 패널에서 해당 줄 설정 편집) */
  const [voiceGenSelectedLineIndex, setVoiceGenSelectedLineIndex] = useState<number | null>(null);
  /** 줄 단위 모드 사용 여부 (lines가 있으면 true) */
  const voiceGenLineMode = voiceGenLines.length > 0;

  /** 줄 모드에서 텍스트 수정 시 스크립트 동기화 */
  useEffect(() => {
    if (voiceGenLineMode) {
      setVoiceGenScript(linesToScript(voiceGenLines));
    }
  }, [voiceGenLineMode, voiceGenLines]);

  /** 성공 토스트 2초 후 자동 해제 */
  useEffect(() => {
    if (!voiceGenToast) return;
    const t = setTimeout(() => setVoiceGenToast(null), 2000);
    return () => clearTimeout(t);
  }, [voiceGenToast]);

  // 음성 인식 상태
  const [voiceSessionId, setVoiceSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceInterimTranscript, setVoiceInterimTranscript] = useState<string>('');
  const _recognitionRef = useRef<unknown>(null);

  // 이미지 분석 상태
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 예측 분석 상태
  const [userActivityPrediction, setUserActivityPrediction] = useState<UserActivityPredictionResponse | null>(null);
  const [messageQualityPrediction, setMessageQualityPrediction] = useState<MessageQualityPredictionResponse | null>(null);
  const [systemPerformancePrediction, setSystemPerformancePrediction] = useState<SystemPerformancePredictionResponse | null>(null);
  const [predictionSummary, setPredictionSummary] = useState<PredictionSummaryResponse | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  const _debouncedMessageInput = useDebounce(messageInput, 500);

  // 활동 예측 차트 데이터 (훅은 항상 동일 순서로 호출되어야 함)
  const activityChartData = useMemo(() => {
    const activities = userActivityPrediction?.prediction?.predicted_activities;
    if (!activities?.length) return { labels: [] as string[], values: [] as number[] };
    return {
      labels: activities.map((a) => a.activity),
      values: activities.map((a) => a.probability),
    };
  }, [userActivityPrediction?.prediction?.predicted_activities]);

  // WebSocket 연결
  const wsUrl = WS_BASE_URL;
  const { isConnected: wsConnected, sendMessage: wsSendMessage } = useWebSocket({
    url: wsUrl,
    roomId: userId,
    onMessage: (data) => {
      errorLogger.info('[WebSocket] 메시지 수신', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketMessage',
        dataType: typeof data,
      });
      // 실시간 업데이트 처리
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'emotion_analysis') {
            // 감정 분석 결과 실시간 업데이트
            errorLogger.info('실시간 감정 분석', {
              component: 'AdvancedFeaturesPanel',
              action: 'emotionAnalysis',
              data: parsed,
            });
          } else if (parsed.type === 'file_learning_progress') {
            // 파일 학습 진행 상황 업데이트
            errorLogger.info('파일 학습 진행', {
              component: 'AdvancedFeaturesPanel',
              action: 'fileLearningProgress',
              data: parsed,
            });
          }
        } catch (e) {
          // 파싱 실패 시 무시
        }
      }
    },
    onError: (error) => {
      errorLogger.error('[WebSocket] 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketError',
      });
    },
    onOpen: () => {
      errorLogger.info('[WebSocket] 연결됨', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketOpen',
      });
    },
    onClose: () => {
      errorLogger.info('[WebSocket] 연결 종료', {
        component: 'AdvancedFeaturesPanel',
        action: 'websocketClose',
      });
    },
    reconnect: true,
  });

  // 에러 표시 중 Escape 키로 닫기
  useEffect(() => {
    if (!error) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setError(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [error]);

  // ==================== 음성 인식 기능 ====================

  const handleStartVoiceRecognition = useCallback(async () => {
    try {
      startUpdating('음성 인식을 시작하는 중...');
      setError(null);
      setVoiceTranscript('');
      setVoiceInterimTranscript('');

      // 백엔드 세션 시작
      const response = await advancedAPIService.startVoiceRecognition({
        language: 'ko',
      });

      if (response.status === 'success' && response.session_id) {
        setVoiceSessionId(response.session_id);

        // Web Speech API 시작
        const started = await speechRecognitionService.startListening({
          onResult: (result) => {
            const transcript = result.transcript || '';
            if (result.isFinal) {
              setVoiceTranscript(prev => prev + transcript + ' ');
              setVoiceInterimTranscript('');

              // 백엔드에 결과 전송
              if (response.session_id) {
                wsSendMessage({
                  type: 'voice_result',
                  session_id: response.session_id,
                  text: transcript,
                  is_final: true,
                });
              }
            } else {
              setVoiceInterimTranscript(transcript);
            }
          },
          onError: (error) => {
            setError(`음성 인식 오류: ${error}`);
            setIsRecording(false);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        });

        if (started) {
          setIsRecording(true);
        } else {
          throw new Error('음성 인식 시작 실패 (브라우저 미지원 또는 권한 필요)');
        }
      } else {
        throw new Error(response.message || '음성 인식 시작 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '음성 인식 시작 중 오류가 발생했습니다.');
      setIsRecording(false);
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [wsSendMessage]);

  const handleStopVoiceRecognition = useCallback(async () => {
    if (!voiceSessionId) return;

    try {
      startUpdating('음성 인식을 중지하는 중...');
      setError(null);

      // Web Speech API 중지
      speechRecognitionService.stopListening();

      // 백엔드 세션 중지
      const response = await advancedAPIService.stopVoiceRecognition({
        session_id: voiceSessionId,
      });

      if (response.status === 'success') {
        setIsRecording(false);
        setVoiceInterimTranscript('');

        // 최종 결과 조회
        await advancedAPIService.getVoiceRecognitionResults(voiceSessionId);
        errorLogger.info('음성 인식 결과', {
          component: 'AdvancedFeaturesPanel',
          action: 'voiceRecognition',
          sessionId: voiceSessionId,
        });

        // 최종 텍스트가 있으면 표시
        if (coerceTrimmedString(voiceTranscript, '')) {
          setError(null);
        }
      } else {
        throw new Error(response.message || '음성 인식 중지 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '음성 인식 중지 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [voiceSessionId, voiceTranscript]);

  // ==================== 이미지 분석 기능 ====================

  const handleImageFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      startUpdating('이미지를 분석하는 중...');
      setError(null);

      const result = await advancedAPIService.analyzeImageFile(file, 'comprehensive');

      if (result.status === 'success') {
        setImageAnalysisResult(result);
        onImageAnalyzed?.(result);
      } else {
        throw new Error(result.message || '이미지 분석 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '이미지 분석 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [onImageAnalyzed]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ==================== 예측 분석 기능 ====================

  const handlePredictUserActivity = useCallback(async () => {
    try {
      startUpdating('사용자 활동을 예측하는 중...');
      setError(null);

      const result = await advancedAPIService.predictUserActivity({
        user_id: userId,
        time_horizon: '1h',
      });

      if (result.status === 'success') {
        setUserActivityPrediction(result);
        onPredictionComplete?.('user_activity', result);
      } else {
        throw new Error(result.message || '사용자 활동 예측 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '사용자 활동 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [userId, onPredictionComplete]);

  const handlePredictMessageQuality = useCallback(async () => {
    const trimmedMessage = coerceTrimmedString(messageInput, '');
    if (!trimmedMessage) {
      setError('메시지를 입력해주세요.');
      return;
    }

    try {
      startUpdating('메시지 품질을 분석하는 중...');
      setError(null);

      const result = await advancedAPIService.predictMessageQuality({
        message_content: trimmedMessage,
        message_type: 'general',
      });

      if (result.status === 'success') {
        setMessageQualityPrediction(result);
        onPredictionComplete?.('message_quality', result);
      } else {
        throw new Error(result.message || '메시지 품질 예측 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '메시지 품질 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [messageInput, onPredictionComplete]);

  const handlePredictSystemPerformance = useCallback(async () => {
    try {
      startUpdating('시스템 성능을 예측하는 중...');
      setError(null);

      const result = await advancedAPIService.predictSystemPerformance({
        time_horizon: '1h',
        include_trends: true,
      });

      if (result.status === 'success') {
        setSystemPerformancePrediction(result);
        onPredictionComplete?.('system_performance', result);
      } else {
        throw new Error(result.message || '시스템 성능 예측 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '시스템 성능 예측 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, [onPredictionComplete]);

  const handleGetPredictionSummary = useCallback(async () => {
    try {
      startUpdating('예측 요약을 불러오는 중...');
      setError(null);

      const result = await advancedAPIService.getPredictionSummary();

      if (result.status === 'success') {
        setPredictionSummary(result);
      } else {
        throw new Error(result.message || '예측 요약 조회 실패');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예측 요약 조회 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startUpdating, stopLoading are stable
  }, []);

  // ==================== 목소리 생성 (Qwen TTS) ====================

  useEffect(() => {
    if (projectIdProp != null && projectIdProp !== '') {
      setVoiceGenProjectId(projectIdProp);
      setVoiceGenMode('project');
    }
  }, [projectIdProp]);

  useEffect(() => {
    if (activeTab !== 'voiceGen') return;
    setError(null);
    let cancelled = false;
    getQwenTtsConfig()
      .then((res) => {
        if (!cancelled) startTransition(() => setTtsAvailable(res.available));
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setTtsAvailable(false));
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    if (activeTab !== 'voiceGen' || !pid) {
      setProjectVoiceSources([]);
      return;
    }
    let cancelled = false;
    setVoiceSourcesLoading(true);
    getProjectVoiceSources(pid)
      .then((res) => {
        if (!cancelled) startTransition(() => setProjectVoiceSources(res.data ?? []));
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setProjectVoiceSources([]));
      })
      .finally(() => {
        if (!cancelled) startTransition(() => setVoiceSourcesLoading(false));
      });
    return () => { cancelled = true; };
  }, [activeTab, voiceGenProjectId]);

  // 학습된 목소리 목록이 바뀌면 선택이 유효한지 맞춤 (삭제된 소스면 초기화)
  useEffect(() => {
    if (voiceGenSelectedSourceId && projectVoiceSources.length > 0) {
      const exists = projectVoiceSources.some((s) => s.id === voiceGenSelectedSourceId);
      if (!exists) setVoiceGenSelectedSourceId(null);
    }
  }, [projectVoiceSources, voiceGenSelectedSourceId]);

  const VOICE_SELECTION_STORAGE_KEY = 'advanced-features-voice-selection';

  // 프로젝트별 선택 목소리 저장 → 같은 프로젝트에서 다시 열어도 일괄성 유지
  useEffect(() => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    if (!pid) return;
    try {
      const raw = voiceGenSelectedSourceId ?? '';
      if (raw) localStorage.setItem(`${VOICE_SELECTION_STORAGE_KEY}-${pid}`, raw);
      else localStorage.removeItem(`${VOICE_SELECTION_STORAGE_KEY}-${pid}`);
    } catch {
      // localStorage 비활성 등 무시
    }
  }, [voiceGenProjectId, voiceGenSelectedSourceId]);

  // 프로젝트·목소리 목록 로드 시 저장된 선택 복원 (일괄성 유지)
  useEffect(() => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    if (!pid || projectVoiceSources.length === 0) return;
    if (voiceGenSelectedSourceId != null) return; // 이미 선택됨
    try {
      const saved = localStorage.getItem(`${VOICE_SELECTION_STORAGE_KEY}-${pid}`);
      if (saved && projectVoiceSources.some((s) => s.id === saved)) {
        setVoiceGenSelectedSourceId(saved);
      }
    } catch {
      // ignore
    }
  }, [voiceGenProjectId, projectVoiceSources, voiceGenSelectedSourceId]);

  useEffect(() => {
    const url = voiceGenAudioUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [voiceGenAudioUrl]);

  useEffect(() => {
    const urls = voiceGenSegmentUrls;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [voiceGenSegmentUrls]);

  useEffect(() => {
    const lines = voiceGenLines;
    return () => {
      lines.forEach((l) => {
        if (l.audioUrl) URL.revokeObjectURL(l.audioUrl);
      });
    };
  }, [voiceGenLines]);

  const handleVoiceGenGenerate = useCallback(async () => {
    const script = coerceTrimmedString(voiceGenScript, '');
    if (!script) {
      setError('대본을 입력해 주세요.');
      return;
    }
    if (voiceGenAudioUrl) {
      URL.revokeObjectURL(voiceGenAudioUrl);
      setVoiceGenAudioUrl(null);
    }
    setVoiceGenSegmentUrls([]);
    if (voiceGenAudioRef.current) {
      voiceGenAudioRef.current.pause();
      voiceGenAudioRef.current = null;
    }
    const speed = voiceGenGlobalSpeed;
    const useSegmentSpeed = voiceGenUseSegmentSpeed && voiceGenSegments.length > 0;
    try {
      startUpdating(useSegmentSpeed ? '목소리 생성 중 (구간별)...' : '목소리 생성 중...');
      setError(null);
      setTtsFallbackNotice(null);
      const emotionPart = voiceGenEmotionMode === 'preset' ? `#${voiceGenEmotionPreset}` : voiceGenEmotionMode === 'smart' ? '' : '';
      const promptPart = coerceTrimmedString(voiceGenEmotionPrompt, '');
      const instructions = coerceTrimmedString([emotionPart, promptPart].filter(Boolean).join(' '), '') || undefined;

      if (useSegmentSpeed) {
        const urls: string[] = [];
        for (let i = 0; i < voiceGenSegments.length; i++) {
          const seg = voiceGenSegments[i];
          const text = coerceTrimmedString(seg.text, '');
          if (!text) continue;
          let blob: Blob;
          if (voiceGenMode === 'situation') {
            blob = await speakQwenTts(text, {
              situation: voiceGenSituationOnly,
              taskType: 'CustomVoice',
              voiceId: 'Vivian',
              speed: seg.speed,
              instructions,
            });
          } else if (voiceGenMode === 'project' && coerceTrimmedString(voiceGenProjectId, '')) {
            blob = await speakQwenTtsFromProject(text, coerceTrimmedString(voiceGenProjectId, ''), {
              voiceSourceId: voiceGenSelectedSourceId ?? undefined,
              situation: voiceGenSituation,
              maxRefSeconds: 10,
              speed: seg.speed,
              instructions,
            });
          } else {
            const url = coerceTrimmedString(voiceGenUrl, '');
            if (!url) {
              setError('영상 URL을 입력하거나, 프로젝트 보이스·상황만 선택을 사용해 주세요.');
              stopLoading();
              return;
            }
            blob = await speakQwenTtsScriptFromSourceUrl(text, url, {
              situation: voiceGenSituation,
              maxRefSeconds: 10,
              speed: seg.speed,
              instructions,
            });
          }
          urls.push(URL.createObjectURL(blob));
        }
        setVoiceGenSegmentUrls(urls);
      } else {
        let blob: Blob;
        if (voiceGenMode === 'situation') {
          blob = await speakQwenTts(script, {
            situation: voiceGenSituationOnly,
            taskType: 'CustomVoice',
            voiceId: 'Vivian',
            speed,
            instructions,
          });
        } else if (voiceGenMode === 'project' && coerceTrimmedString(voiceGenProjectId, '')) {
          blob = await speakQwenTtsFromProject(script, coerceTrimmedString(voiceGenProjectId, ''), {
            voiceSourceId: voiceGenSelectedSourceId ?? undefined,
            situation: voiceGenSituation,
            maxRefSeconds: 10,
            speed,
            instructions,
          });
        } else {
          const url = coerceTrimmedString(voiceGenUrl, '');
          if (!url) {
            setError('영상 URL을 입력하거나, 프로젝트 보이스·상황만 선택을 사용해 주세요.');
            stopLoading();
            return;
          }
          blob = await speakQwenTtsScriptFromSourceUrl(script, url, {
            situation: voiceGenSituation,
            maxRefSeconds: 10,
            speed,
            instructions,
          });
        }
        setVoiceGenAudioUrl(URL.createObjectURL(blob));
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '목소리 생성 실패';
      const isTtsUnavailable =
        raw.includes('503') ||
        raw.includes('QWEN_TTS_BASE_URL') ||
        raw.includes('TTS') ||
        raw.includes('fetch') ||
        raw.includes('Failed to fetch') ||
        raw.includes('NetworkError');
      if (isTtsUnavailable && typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(script);
          utterance.lang = 'ko-KR';
          utterance.rate = Math.max(0.5, Math.min(2, speed));
          window.speechSynthesis.speak(utterance);
          setError(null);
          setTtsFallbackNotice(
            'TTS 서버에 연결할 수 없어 브라우저 음성으로 재생했습니다. (서버에 Qwen TTS를 설정하거나 백엔드에 gtts를 설치하면 더 나은 음질을 사용할 수 있습니다.)'
          );
        } catch (_) {
          setTtsFallbackNotice(null);
          setError(
            raw.includes('501') || raw.includes('yt-dlp') || raw.includes('yt_dlp')
              ? '영상에서 음성 추출을 위해 서버에 yt-dlp 설치가 필요합니다. (pip install yt-dlp)'
              : 'TTS 서버에 연결할 수 없습니다. npm run restart:backend 후에도 동일하면 Qwen TTS 서버를 설정해 주세요.'
          );
        }
      } else {
        setError(
          raw.includes('501') || raw.includes('yt-dlp') || raw.includes('yt_dlp')
            ? '영상에서 음성 추출을 위해 서버에 yt-dlp 설치가 필요합니다. (pip install yt-dlp)'
            : raw.includes('503') || raw.includes('QWEN_TTS')
              ? 'TTS 서버에 연결할 수 없습니다. npm run restart:backend 후에도 동일하면 Qwen TTS 서버를 설정해 주세요.'
              : raw
        );
      }
      voiceGenAutoPlayAfterGenerateRef.current = false;
    } finally {
      stopLoading();
    }
  }, [voiceGenUrl, voiceGenScript, voiceGenSituation, voiceGenSituationOnly, voiceGenMode, voiceGenProjectId, voiceGenSelectedSourceId, voiceGenGlobalSpeed, voiceGenUseSegmentSpeed, voiceGenSegments, voiceGenAudioUrl, voiceGenEmotionPrompt, voiceGenEmotionMode, voiceGenEmotionPreset, startUpdating, stopLoading]);

  /** 음성 생성 후 자동 재생 (샘플 확인용). 생성 완료 시 useEffect에서 재생. */
  const handleVoiceGenGenerateAndPlay = useCallback(() => {
    voiceGenAutoPlayAfterGenerateRef.current = true;
    handleVoiceGenGenerate();
  }, [handleVoiceGenGenerate]);

  /** 목소리 생성 대본 textarea에서 Cmd/Ctrl+Enter 시 생성, Cmd/Ctrl+Shift+Enter 시 생성 후 재생 */
  const handleVoiceGenKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter' || (!e.metaKey && !e.ctrlKey)) return;
      const canGenerate =
        loadingState.type !== 'updating' &&
        coerceTrimmedString(voiceGenScript, '').length > 0 &&
        (voiceGenMode !== 'url' || coerceTrimmedString(voiceGenUrl, '').length > 0) &&
        (voiceGenMode !== 'project' || coerceTrimmedString(voiceGenProjectId, '').length > 0);
      if (canGenerate) {
        e.preventDefault();
        if (e.shiftKey) {
          handleVoiceGenGenerateAndPlay();
        } else {
          handleVoiceGenGenerate();
        }
      }
    },
    [
      loadingState.type,
      voiceGenScript,
      voiceGenMode,
      voiceGenUrl,
      voiceGenProjectId,
      handleVoiceGenGenerate,
      handleVoiceGenGenerateAndPlay,
    ]
  );

  const refreshProjectVoiceSources = useCallback(() => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    if (!pid) return;
    getProjectVoiceSources(pid)
      .then((res) => setProjectVoiceSources(res.data ?? []))
      .catch(() => setProjectVoiceSources([]));
  }, [voiceGenProjectId]);

  const handleAddProjectVoiceSource = useCallback(async () => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    const url = coerceTrimmedString(voiceGenAddSourceUrl, '');
    if (!pid || !url) {
      setError('프로젝트 ID와 영상 URL을 입력해 주세요.');
      return;
    }
    try {
      startUpdating('목소리 학습 중...');
      setError(null);
      const startSec = coerceTrimmedString(voiceGenAddSourceStartSec, '') ? parseFloat(voiceGenAddSourceStartSec) : undefined;
      const endSec = coerceTrimmedString(voiceGenAddSourceEndSec, '') ? parseFloat(voiceGenAddSourceEndSec) : undefined;
      await addProjectVoiceSource(pid, url, {
        refText: coerceTrimmedString(voiceGenAddSourceRefText, '') || undefined,
        name: coerceTrimmedString(voiceGenAddSourceName, '') || undefined,
        referenceUrl: coerceTrimmedString(voiceGenAddSourceReferenceUrl, '') || undefined,
        startSeconds: startSec,
        endSeconds: endSec,
      });
      setVoiceGenAddSourceUrl('');
      setVoiceGenAddSourceRefText('');
      setVoiceGenAddSourceName('');
      setVoiceGenAddSourceReferenceUrl('');
      setVoiceGenAddSourceStartSec('');
      setVoiceGenAddSourceEndSec('');
      refreshProjectVoiceSources();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '보이스 소스 추가 실패');
    } finally {
      stopLoading();
    }
  }, [
    voiceGenProjectId, voiceGenAddSourceUrl, voiceGenAddSourceRefText,
    voiceGenAddSourceName, voiceGenAddSourceReferenceUrl,
    voiceGenAddSourceStartSec, voiceGenAddSourceEndSec,
    startUpdating, stopLoading, refreshProjectVoiceSources,
  ]);

  const handleDeleteProjectVoiceSource = useCallback(async (sourceId: string) => {
    const pid = coerceTrimmedString(voiceGenProjectId, '');
    if (!pid) return;
    try {
      startUpdating('보이스 소스 삭제 중...');
      setError(null);
      await deleteProjectVoiceSource(pid, sourceId);
      refreshProjectVoiceSources();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '보이스 소스 삭제 실패');
    } finally {
      stopLoading();
    }
  }, [voiceGenProjectId, startUpdating, stopLoading, refreshProjectVoiceSources]);

  const handleVoiceGenPlay = useCallback(() => {
    if (voiceGenSegmentUrls.length > 0) {
      voiceGenSegmentUrlsRef.current = voiceGenSegmentUrls;
      voiceGenSegmentPlayIndexRef.current = 0;
      if (voiceGenAudioRef.current) {
        voiceGenAudioRef.current.pause();
        voiceGenAudioRef.current = null;
      }
      const playNext = () => {
        const urls = voiceGenSegmentUrlsRef.current;
        const idx = voiceGenSegmentPlayIndexRef.current;
        if (idx >= urls.length) return;
        const audio = new Audio(urls[idx]);
        voiceGenAudioRef.current = audio;
        audio.onended = () => {
          voiceGenSegmentPlayIndexRef.current = idx + 1;
          if (idx + 1 < urls.length) playNext();
        };
        audio.play().catch((e) => setError(e instanceof Error ? e.message : '재생 실패'));
      };
      playNext();
      return;
    }
    if (!voiceGenAudioUrl) return;
    if (voiceGenAudioRef.current) {
      voiceGenAudioRef.current.pause();
      voiceGenAudioRef.current.currentTime = 0;
    }
    const audio = new Audio(voiceGenAudioUrl);
    voiceGenAudioRef.current = audio;
    audio.play().catch((e) => setError(e instanceof Error ? e.message : '재생 실패'));
  }, [voiceGenAudioUrl, voiceGenSegmentUrls]);

  /** 생성 후 재생: URL/구간이 설정되면 자동 재생 */
  useEffect(() => {
    if (!voiceGenAutoPlayAfterGenerateRef.current) return;
    if (voiceGenAudioUrl || voiceGenSegmentUrls.length > 0) {
      voiceGenAutoPlayAfterGenerateRef.current = false;
      handleVoiceGenPlay();
    }
  }, [voiceGenAudioUrl, voiceGenSegmentUrls, handleVoiceGenPlay]);

  /** 대본 텍스트를 줄 단위로 변환 (줄별 편집·음성 생성용) */
  const handleConvertScriptToLines = useCallback(() => {
    const script = coerceTrimmedString(voiceGenScript, '');
    if (!script) {
      setError('대본을 입력한 뒤 변환해 주세요.');
      return;
    }
    setVoiceGenLines(parseScriptToLines(script));
    setVoiceGenSelectedLineIndex(null);
  }, [voiceGenScript]);

  /** 줄 목록에서 한 줄 업데이트 */
  const updateVoiceGenLine = useCallback((index: number, patch: Partial<ScriptLine>) => {
    setVoiceGenLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  }, []);

  /** 읽는 시간 입력 Beta 적용: 목표 초에 맞게 선택 줄의 속도 조정 */
  const handleApplyReadingTime = useCallback(() => {
    const idx = voiceGenSelectedLineIndex;
    if (idx == null) return;
    const line = voiceGenLines[idx];
    if (line?.isPause || !line) return;
    const targetSec = parseFloat(voiceGenReadingTimeInput.replace(/,/g, '.'));
    if (!Number.isFinite(targetSec) || targetSec <= 0) {
      setError('올바른 재생 시간(초)을 입력해 주세요.');
      return;
    }
    const curDur = line.duration ?? 1;
    const newSpeed = Math.max(0.25, Math.min(4, curDur / targetSec));
    updateVoiceGenLine(idx, { speed: newSpeed });
    setVoiceGenReadingTimeInput('');
    setError(null);
    setVoiceGenToast('읽는 시간이 적용되었습니다.');
  }, [voiceGenSelectedLineIndex, voiceGenLines, voiceGenReadingTimeInput, updateVoiceGenLine]);

  /** 프리셋을 선택 줄에 적용 */
  const handleApplyPresetToLine = useCallback(
    (key: 'A' | 'B' | 'C' | 'D') => {
      const idx = voiceGenSelectedLineIndex;
      const preset = voiceGenPresets[key];
      if (idx == null || !preset) return;
      updateVoiceGenLine(idx, { ...preset });
    },
    [voiceGenSelectedLineIndex, voiceGenPresets, updateVoiceGenLine]
  );

  /** 프리셋을 모든 줄에 적용 */
  const handleApplyPresetToAllLines = useCallback(
    (key: 'A' | 'B' | 'C' | 'D') => {
      const preset = voiceGenPresets[key];
      if (!preset || voiceGenLines.length === 0) return;
      setVoiceGenLines((prev) => prev.map((l) => ({ ...l, ...preset })));
    },
    [voiceGenPresets, voiceGenLines.length]
  );

  /** 현재 선택 줄 설정을 프리셋에 저장 */
  const handleSavePreset = useCallback(
    (key: 'A' | 'B' | 'C' | 'D') => {
      const idx = voiceGenSelectedLineIndex;
      if (idx == null) return;
      const line = voiceGenLines[idx];
      if (!line) return;
      setVoiceGenPresets((prev) => ({
        ...prev,
        [key]: {
          speed: line.speed,
          tonePrompt: line.tonePrompt,
          pitch: line.pitch,
          pauseAfter: line.pauseAfter,
        },
      }));
      setVoiceGenToast(`프리셋 ${key}에 저장되었습니다.`);
    },
    [voiceGenSelectedLineIndex, voiceGenLines]
  );

  /** Blob URL을 지정 파일명으로 다운로드 (생성된 TTS 오디오·내보내기 JSON 저장) */
  const downloadBlobUrl = useCallback((url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  /** 파일명에 사용 불가 문자 제거 */
  const sanitizeFileName = useCallback((name: string) => {
    return name.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 80) || '제목없음';
  }, []);

  /** 대본·프리셋 내보내기 (JSON) */
  const handleExportScript = useCallback(() => {
    const payload = {
      title: voiceGenProjectTitle,
      exportedAt: new Date().toISOString(),
      lines: voiceGenLines.map((l) => ({
        text: l.text,
        speed: l.speed,
        tonePrompt: l.tonePrompt,
        pitch: l.pitch,
        pauseAfter: l.pauseAfter,
        isPause: l.isPause ?? false,
      })),
      presets: voiceGenPresets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const safeName = sanitizeFileName(voiceGenProjectTitle || '제목없음');
    downloadBlobUrl(url, `voice-gen-${safeName}-${Date.now()}.json`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [voiceGenProjectTitle, voiceGenLines, voiceGenPresets, downloadBlobUrl, sanitizeFileName]);

  /** 대본·프리셋 가져오기 (JSON) */
  const handleImportScript = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const payload = JSON.parse(reader.result as string) as {
            title?: string;
            lines?: Array<Partial<ScriptLine> & { text: string }>;
            presets?: Record<'A' | 'B' | 'C' | 'D', { speed: number; tonePrompt: string; pitch: number; pauseAfter: number } | null>;
          };
          if (payload.title != null) setVoiceGenProjectTitle(String(payload.title));
          if (Array.isArray(payload.lines)) {
            const ts = Date.now();
            setVoiceGenLines(
              payload.lines.map((l, i) => ({
                id: `line-${ts}-${i}`,
                text: typeof l.text === 'string' ? l.text : '',
                speed: typeof l.speed === 'number' ? l.speed : 1,
                tonePrompt: typeof l.tonePrompt === 'string' ? l.tonePrompt : '',
                pitch: typeof l.pitch === 'number' ? l.pitch : 0,
                pauseAfter: typeof l.pauseAfter === 'number' ? l.pauseAfter : 0.1,
                audioUrl: null,
                duration: null,
                isPause: Boolean(l.isPause),
              }))
            );
            setVoiceGenSelectedLineIndex(null);
            setError(null);
          }
          if (payload.presets && typeof payload.presets === 'object') {
            setVoiceGenPresets((prev) => ({ ...prev, ...payload.presets }));
          }
        } catch (err) {
          setError('JSON 파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    []
  );

  /** 선택된 줄 뒤에 쉼 추가 */
  const handleAddPauseLine = useCallback((afterIndex: number) => {
    const pauseLine: ScriptLine = {
      id: `pause-${Date.now()}`,
      text: '',
      speed: 1.0,
      tonePrompt: '',
      pitch: 0,
      pauseAfter: 0.5,
      audioUrl: null,
      duration: null,
      isPause: true,
    };
    setVoiceGenLines((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, pauseLine);
      return next;
    });
    setVoiceGenSelectedLineIndex(afterIndex + 1);
  }, []);

  /** 줄 삭제 */
  const handleRemoveLine = useCallback((index: number) => {
    const line = voiceGenLines[index];
    if (line?.audioUrl) URL.revokeObjectURL(line.audioUrl);
    setVoiceGenLines((prev) => prev.filter((_, i) => i !== index));
    setVoiceGenSelectedLineIndex((prev) => {
      if (prev == null) return null;
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
  }, [voiceGenLines]);

  /** 줄 위로/아래로 이동 */
  const handleMoveLine = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= voiceGenLines.length) return;
    setVoiceGenLines((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
    setVoiceGenSelectedLineIndex(newIndex);
  }, [voiceGenLines.length]);

  /** 줄 복사 (해당 줄을 복제하여 바로 뒤에 삽입) */
  const handleDuplicateLine = useCallback((index: number) => {
    const src = voiceGenLines[index];
    if (!src) return;
    const copy: ScriptLine = {
      id: `line-${Date.now()}-dup`,
      text: src.text,
      speed: src.speed,
      tonePrompt: src.tonePrompt,
      pitch: src.pitch,
      pauseAfter: src.pauseAfter,
      audioUrl: null,
      duration: null,
      isPause: src.isPause ?? false,
    };
    setVoiceGenLines((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setVoiceGenSelectedLineIndex(index + 1);
  }, [voiceGenLines]);

  /** 줄 모드 해제 (텍스트로 되돌리기) */
  const handleClearLineMode = useCallback(() => {
    voiceGenLines.forEach((l) => {
      if (l.audioUrl) URL.revokeObjectURL(l.audioUrl);
    });
    setVoiceGenLines([]);
    setVoiceGenSelectedLineIndex(null);
    setVoiceGenScript(linesToScript(voiceGenLines));
  }, [voiceGenLines]);

  /** 새 줄 추가 (지정 위치 뒤에 삽입, index가 -1이면 맨 끝) */
  const handleAddLine = useCallback((afterIndex: number) => {
    const newLine: ScriptLine = {
      id: `line-${Date.now()}-new`,
      text: '',
      speed: 1.0,
      tonePrompt: '',
      pitch: 0,
      pauseAfter: 0.1,
      audioUrl: null,
      duration: null,
    };
    setVoiceGenLines((prev) => {
      const next = [...prev];
      const insertAt = afterIndex < 0 ? next.length : Math.min(afterIndex + 1, next.length);
      next.splice(insertAt, 0, newLine);
      return next;
    });
    setVoiceGenSelectedLineIndex(afterIndex < 0 ? voiceGenLines.length : afterIndex + 1);
  }, [voiceGenLines.length]);

  /** 줄 모드에서 생성된 모든 오디오 일괄 다운로드 */
  const handleDownloadAllLines = useCallback(() => {
    const withAudio = voiceGenLines
      .map((l, i) => ({ line: l, index: i }))
      .filter(({ line }) => line.audioUrl && !line.isPause);
    if (withAudio.length === 0) {
      setError('다운로드할 오디오가 없습니다. 먼저 음성을 생성해 주세요.');
      return;
    }
    withAudio.forEach(({ line, index }) => {
      const num = index + 1;
      downloadBlobUrl(line.audioUrl!, `tts-line-${num}.mp3`);
    });
    if (withAudio.length > 1) {
      setError(null);
    }
  }, [voiceGenLines, downloadBlobUrl]);

  /** 줄 단위 음성 생성 (한 줄 또는 전체) */
  const handleGenerateLineVoice = useCallback(
    async (targetLineIndex?: number) => {
      const indices =
        targetLineIndex != null
          ? [targetLineIndex]
          : voiceGenLines.map((l, i) => i).filter((i) => !voiceGenLines[i].isPause && coerceTrimmedString(voiceGenLines[i].text, ''));
      if (indices.length === 0) {
        setError(targetLineIndex != null ? '해당 줄에 텍스트가 없습니다.' : '생성할 줄이 없습니다.');
        return;
      }
      const isSingle = targetLineIndex != null;
      if (voiceGenMode === 'url' && !coerceTrimmedString(voiceGenUrl, '')) {
        setError('영상 URL을 입력해 주세요.');
        return;
      }
      if (voiceGenMode === 'project' && !coerceTrimmedString(voiceGenProjectId, '')) {
        setError('프로젝트 ID를 입력해 주세요.');
        return;
      }
      try {
        startUpdating(isSingle ? `줄 ${(targetLineIndex ?? 0) + 1} 음성 생성 중...` : '줄별 목소리 생성 중...');
        setError(null);
        for (const idx of indices) {
          const line = voiceGenLines[idx];
          const text = coerceTrimmedString(line.text, '');
          if (!text) continue;
          if (line.audioUrl) URL.revokeObjectURL(line.audioUrl);
          const speed = line.speed ?? voiceGenGlobalSpeed;
          const linePrompt = coerceTrimmedString(line.tonePrompt, '');
          const emotionPart = voiceGenEmotionMode === 'preset' ? `#${voiceGenEmotionPreset}` : '';
          const globalPrompt = coerceTrimmedString(voiceGenEmotionPrompt, '');
          const instructions = coerceTrimmedString([emotionPart, linePrompt, globalPrompt].filter(Boolean).join(' '), '') || undefined;
          let blob: Blob;
          if (voiceGenMode === 'situation') {
            blob = await speakQwenTts(text, {
              situation: voiceGenSituationOnly,
              taskType: 'CustomVoice',
              voiceId: 'Vivian',
              speed,
              instructions,
            });
          } else if (voiceGenMode === 'project' && coerceTrimmedString(voiceGenProjectId, '')) {
            blob = await speakQwenTtsFromProject(text, coerceTrimmedString(voiceGenProjectId, ''), {
              voiceSourceId: voiceGenSelectedSourceId ?? undefined,
              situation: voiceGenSituation,
              maxRefSeconds: 10,
              speed,
              instructions,
            });
          } else {
            blob = await speakQwenTtsScriptFromSourceUrl(text, coerceTrimmedString(voiceGenUrl, ''), {
              situation: voiceGenSituation,
              maxRefSeconds: 10,
              speed,
              instructions,
            });
          }
          const url = URL.createObjectURL(blob);
          updateVoiceGenLine(idx, { audioUrl: url, duration: null });
          const audio = new Audio(url);
          audio.addEventListener('loadedmetadata', () => {
            const d = audio.duration;
            if (Number.isFinite(d)) updateVoiceGenLine(idx, { duration: d });
          });
          audio.load();
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '음성 생성 실패');
      } finally {
        stopLoading();
      }
    },
    [
      voiceGenLines,
      voiceGenMode,
      voiceGenUrl,
      voiceGenProjectId,
      voiceGenSituation,
      voiceGenSituationOnly,
      voiceGenSelectedSourceId,
      voiceGenGlobalSpeed,
      voiceGenEmotionPrompt,
      voiceGenEmotionMode,
      voiceGenEmotionPreset,
      startUpdating,
      stopLoading,
      updateVoiceGenLine,
    ]
  );

  /** 줄 단위 재생 (한 줄 또는 전체 순차, 쉼 반영, PRO 재생 속도 적용) */
  const handlePlayLineVoice = useCallback(
    (lineIndex?: number) => {
      const rate = Math.max(0.5, Math.min(2, voiceGenPlaybackRate));
      if (lineIndex != null) {
        const line = voiceGenLines[lineIndex];
        if (line?.isPause) return;
        if (line?.audioUrl) {
          const audio = new Audio(line.audioUrl);
          audio.playbackRate = rate;
          audio.play().catch((e) => setError(e instanceof Error ? e.message : '재생 실패'));
        }
        return;
      }
      let idx = 0;
      const playNext = () => {
        while (idx < voiceGenLines.length) {
          const line = voiceGenLines[idx];
          idx++;
          if (line.isPause) {
            const sec = (line.pauseAfter ?? 0.5) * 1000;
            if (sec > 0) setTimeout(playNext, sec);
            else playNext();
            return;
          }
          if (line.audioUrl) {
            const a = new Audio(line.audioUrl);
            a.playbackRate = rate;
            a.onended = playNext;
            a.play().catch((e) => setError(e instanceof Error ? e.message : '재생 실패'));
            return;
          }
        }
      };
      if (voiceGenLines.some((l) => l.audioUrl || l.isPause)) playNext();
    },
    [voiceGenLines, voiceGenPlaybackRate]
  );

  /** 줄 모드 키보드 단축키 (선택 줄: Delete 삭제, Ctrl+Shift+D 복사, ↑↓ 이동) */
  useEffect(() => {
    if (activeTab !== 'voiceGen' || !voiceGenLineMode || voiceGenSelectedLineIndex == null) return;
    const el = document.activeElement as HTMLElement | null;
    if (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = voiceGenSelectedLineIndex;
      if (e.key === 'Escape') {
        e.preventDefault();
        setVoiceGenSelectedLineIndex(null);
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleRemoveLine(idx);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handleDuplicateLine(idx);
        return;
      }
      if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault();
        handleMoveLine(idx, 'up');
        return;
      }
      if (e.key === 'ArrowDown' && idx < voiceGenLines.length - 1) {
        e.preventDefault();
        handleMoveLine(idx, 'down');
        return;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeTab, voiceGenLineMode, voiceGenSelectedLineIndex, voiceGenLines.length, handleRemoveLine, handleDuplicateLine, handleMoveLine]);

  /** 전체 줄 오디오를 쉼 포함해 하나의 WAV로 합쳐서 다운로드 */
  const handleMergeAllLinesAudio = useCallback(async () => {
    const SAMPLE_RATE = 44100;
    if (!voiceGenLines.some((l) => l.audioUrl || l.isPause)) {
      setError('합칠 오디오가 없습니다. 먼저 음성을 생성해 주세요.');
      return;
    }
    try {
      startUpdating('오디오 합치는 중...');
      setError(null);
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      let totalDuration = 0;
      for (const line of voiceGenLines) {
        if (line.isPause) totalDuration += line.pauseAfter ?? 0.5;
        else if (line.audioUrl) totalDuration += line.duration ?? 5;
      }
      if (totalDuration <= 0) {
        setError('재생 시간을 알 수 없습니다. 줄을 재생해 보거나 다시 생성해 주세요.');
        stopLoading();
        return;
      }
      const offline = new OfflineAudioContext(2, Math.ceil(totalDuration * SAMPLE_RATE), SAMPLE_RATE);
      let currentTime = 0;
      for (const line of voiceGenLines) {
        if (line.isPause) {
          currentTime += line.pauseAfter ?? 0.5;
          continue;
        }
        if (!line.audioUrl) continue;
        const res = await fetch(line.audioUrl);
        const buf = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buf);
        const src = offline.createBufferSource();
        src.buffer = decoded;
        src.connect(offline.destination);
        src.start(currentTime);
        src.stop(currentTime + decoded.duration);
        currentTime += decoded.duration;
      }
      const rendered = await offline.startRendering();
      const wav = audioBufferToWav(rendered);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const safeName = sanitizeFileName(voiceGenProjectTitle || '제목없음');
      downloadBlobUrl(url, `${safeName}-merged.wav`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오디오 합치기 실패');
    } finally {
      stopLoading();
    }
  }, [voiceGenLines, voiceGenProjectTitle, startUpdating, stopLoading, downloadBlobUrl, sanitizeFileName]);

  /** 워드/텍스트 문서에서 샘플 대본 추출 */
  const handleExtractScriptDocument = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        startUpdating('문서에서 대본 추출 중...');
        setError(null);
        const result = await extractScriptFromDocument(file);
        if (result.success && result.text) {
          setVoiceGenSampleScript(result.text);
          // 목소리 생성용 대본에는 대화(대사)만 넣어서 상황에 맞게 TTS 적용
          const scriptForVoice = coerceTrimmedString(result.dialogue_only ?? result.text, '') || result.text;
          setVoiceGenScript(scriptForVoice);
          if (result.dialogue_only) {
            setVoiceGenSituation('drama_dialogue');
            setVoiceGenSituationOnly('drama_dialogue');
          }
          setVoiceGenStyleSummary(null);
          setVoiceGenSourceFilename(file.name);
          const suggested = result.suggested_document_hint;
          setVoiceGenDocumentHint(
            suggested === 'tone_down' || suggested === 'corporate' ? suggested : ''
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '문서 추출 실패';
        const isDocxVenvError =
          typeof msg === 'string' &&
          (msg.includes('python-docx') || msg.includes('pip install')) &&
          /\.docx$/i.test(file.name);
        if (isDocxVenvError) {
          try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = coerceTrimmedString(result.value ?? '', '');
            if (text) {
              setVoiceGenSampleScript(text);
              // mammoth 폴백에는 dialogue_only 없음 → 전체 텍스트 사용
              setVoiceGenScript(text);
              setVoiceGenStyleSummary(null);
              setVoiceGenSourceFilename(file.name);
              setError(null);
            } else {
              setError('문서에서 텍스트를 추출할 수 없습니다. 백엔드를 가상환경으로 실행하거나, 워드에서 "다른 이름으로 저장" → "일반 텍스트(.txt)"로 저장 후 업로드해 보세요.');
            }
          } catch (fallbackErr) {
            setError(
              'docx 추출을 쓰려면 백엔드를 가상환경으로 실행해야 합니다. 1) 5002 포트를 쓰는 기존 프로세스를 모두 종료한 뒤 2) 프로젝트 루트에서 npm run restart:backend 를 실행하세요. (.txt 파일은 설정 없이 사용 가능합니다.)'
            );
          }
        } else if (typeof msg === 'string' && (msg.includes('python-docx') || msg.includes('pip install'))) {
          setError(
            'docx 추출을 쓰려면 백엔드를 가상환경으로 실행해야 합니다. 1) 5002 포트를 쓰는 기존 프로세스를 모두 종료한 뒤 2) 프로젝트 루트에서 npm run restart:backend 를 실행하세요. (.txt 파일은 설정 없이 사용 가능합니다.)'
          );
        } else {
          setError(msg);
        }
      } finally {
        stopLoading();
      }
      e.target.value = '';
    },
    [startUpdating, stopLoading]
  );

  /** 샘플 대본 스타일 분석 */
  const handleAnalyzeScriptStyle = useCallback(async () => {
    const sample = coerceTrimmedString(voiceGenSampleScript, '');
    if (!sample) {
      setError('샘플 대본을 입력하거나 문서에서 추출해 주세요.');
      return;
    }
    try {
      startUpdating('스타일 분석 중...');
      setError(null);
      const result = await analyzeScriptStyle(sample, {
        documentHint: voiceGenDocumentHint || undefined,
        sourceFilename: voiceGenSourceFilename || undefined,
      });
      if (result.success) {
        setVoiceGenStyleSummary(result.style_summary);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '스타일 분석 실패');
    } finally {
      stopLoading();
    }
  }, [voiceGenSampleScript, voiceGenDocumentHint, voiceGenSourceFilename, startUpdating, stopLoading]);

  /** 샘플 스타일로 새 대본 생성 → 메인 대본 필드에 반영 */
  const handleGenerateScriptInStyle = useCallback(async () => {
    const sample = coerceTrimmedString(voiceGenSampleScript, '');
    const topic = coerceTrimmedString(voiceGenTopicOutline, '');
    if (!sample) {
      setError('샘플 대본을 입력하거나 문서에서 추출해 주세요.');
      return;
    }
    if (!topic) {
      setError('생성할 주제/개요를 입력해 주세요.');
      return;
    }
    try {
      startUpdating('스타일 반영 대본 생성 중...');
      setError(null);
      const result = await generateScriptInStyle(sample, topic, {
        documentHint: voiceGenDocumentHint || undefined,
        sourceFilename: voiceGenSourceFilename || undefined,
      });
      if (result.success && result.generated_script) {
        setVoiceGenScript(result.generated_script);
        // 줄 모드는 사용자가 '줄 단위로 변환'을 눌렀을 때만 진입 (통합 시나리오·단일 생성 버튼 유지)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '대본 생성 실패');
    } finally {
      stopLoading();
    }
  }, [voiceGenSampleScript, voiceGenTopicOutline, voiceGenDocumentHint, voiceGenSourceFilename, startUpdating, stopLoading]);

  // ==================== 렌더링 ====================

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab') return;
    const currentIndex = TAB_ORDER.findIndex((tab) => TAB_IDS[tab] === target.id);
    if (currentIndex < 0) return;

    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = currentIndex === TAB_ORDER.length - 1 ? 0 : currentIndex + 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = currentIndex === 0 ? TAB_ORDER.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = TAB_ORDER.length - 1;
    }
    if (nextIndex !== null) {
      const nextTab = TAB_ORDER[nextIndex];
      setActiveTab(nextTab);
      const nextTabEl = document.getElementById(TAB_IDS[nextTab]);
      nextTabEl?.focus();
    }
  }, []);

  return (
    <div className="advanced-features-panel bw-detail-root" role="region" aria-label="고급 기능" data-testid="advanced-features-panel">
      <div className="bw-detail-header">
        <div className="bw-detail-header-inner">
          <div className="bw-detail-header-left">
            <div className="bw-detail-header-icon">
              <Settings size={20} aria-hidden />
            </div>
            <div>
              <h2 id="advanced-features-heading" className="bw-detail-header-title">고급 기능</h2>
              <p className="bw-detail-header-desc">음성 인식·이미지 분석·예측·목소리 생성(TTS)</p>
            </div>
          </div>
          <div className="connection-status bw-detail-header-actions" role="status" aria-live="polite" aria-label={wsConnected ? '실시간 연결됨' : '연결 끊김'}>
            <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="connection-status-text">
              {wsConnected ? '실시간 연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
        {voiceGenToast && (
          <div className="voice-gen-toast success-message" role="status" aria-live="polite" data-testid="voice-gen-toast">
            {voiceGenToast}
          </div>
        )}
        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setError(null)}
              aria-label="에러 메시지 닫기"
              data-testid="error-dismiss"
            >
              확인
            </button>
          </div>
        )}
        {ttsFallbackNotice && (
          <div className="info-message voice-gen-fallback-notice" role="status" data-testid="tts-fallback-notice">
            <span>{ttsFallbackNotice}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setTtsFallbackNotice(null)}
              aria-label="안내 닫기"
              data-testid="tts-fallback-dismiss"
            >
              확인
            </button>
          </div>
        )}
        {/* 탭 네비게이션 */}
        <div
          className="bw-detail-tabs"
          role="tablist"
          aria-label="고급 기능 탭"
          onKeyDown={handleTabKeyDown}
        >
          <button
            id={TAB_IDS.voice}
            role="tab"
            aria-selected={activeTab === 'voice'}
            aria-controls={PANEL_IDS.voice}
            tabIndex={activeTab === 'voice' ? 0 : -1}
            className={`bw-detail-tab ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            🎤 음성 인식
          </button>
          <button
            id={TAB_IDS.image}
            role="tab"
            aria-selected={activeTab === 'image'}
            aria-controls={PANEL_IDS.image}
            tabIndex={activeTab === 'image' ? 0 : -1}
            className={`bw-detail-tab ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            🖼️ 이미지 분석
          </button>
          <button
            id={TAB_IDS.prediction}
            role="tab"
            aria-selected={activeTab === 'prediction'}
            aria-controls={PANEL_IDS.prediction}
            tabIndex={activeTab === 'prediction' ? 0 : -1}
            className={`bw-detail-tab ${activeTab === 'prediction' ? 'active' : ''}`}
            onClick={() => setActiveTab('prediction')}
          >
            🔮 예측 분석
          </button>
          <button
            id={TAB_IDS.voiceGen}
            role="tab"
            aria-selected={activeTab === 'voiceGen'}
            aria-controls={PANEL_IDS.voiceGen}
            tabIndex={activeTab === 'voiceGen' ? 0 : -1}
            className={`bw-detail-tab ${activeTab === 'voiceGen' ? 'active' : ''}`}
            onClick={() => setActiveTab('voiceGen')}
          >
            🎙️ 목소리 생성
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bw-detail-content panel-content">
        <LoadingStateIndicator
          type={loadingState.type}
          message={loadingState.message}
          showSpinner={loadingState.type === 'updating'}
        />

        {/* 로딩 스켈레톤 */}
        {loadingState.type === 'updating' && activeTab === 'image' && !imageAnalysisResult && (
          <LoadingSkeleton type="card" height="300px" />
        )}
        {loadingState.type === 'updating' && activeTab === 'prediction' && !userActivityPrediction && !messageQualityPrediction && !systemPerformancePrediction && (
          <LoadingSkeleton type="list" lines={3} />
        )}
        {loadingState.type === 'updating' && activeTab === 'voiceGen' && !voiceGenAudioUrl && (
          <LoadingSkeleton type="card" height="200px" />
        )}

        {/* 음성 인식 탭 */}
        {activeTab === 'voice' && (
          <div id={PANEL_IDS.voice} className="bw-detail-tab-content voice-recognition-section" role="tabpanel" aria-labelledby={TAB_IDS.voice}>
            <h3>음성 인식</h3>
            {!isRecording && !voiceTranscript && !voiceInterimTranscript && (
              <p className="voice-empty" role="status" data-testid="voice-empty">
                아래 버튼을 눌러 음성 인식을 시작하세요.
              </p>
            )}
            <div className="voice-controls">
              {!isRecording ? (
                <button
                  className="btn btn-primary"
                  onClick={handleStartVoiceRecognition}
                  disabled={loadingState.type === 'updating'}
                  aria-label="음성 인식 시작"
                >
                  🎤 음성 인식 시작
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleStopVoiceRecognition}
                  disabled={loadingState.type === 'updating'}
                  aria-label="음성 인식 중지"
                >
                  ⏹️ 음성 인식 중지
                </button>
              )}
            </div>
            {isRecording && (
              <div className="recording-indicator">
                <span className="pulse"></span>
                <span>녹음 중...</span>
              </div>
            )}
            {voiceSessionId && (
              <div className="session-info">
                <p>세션 ID: {voiceSessionId}</p>
              </div>
            )}
            {(voiceTranscript || voiceInterimTranscript) && (
              <div className="voice-transcript">
                <h4>인식된 텍스트:</h4>
                <div className="transcript-text">
                  <span>{voiceTranscript}</span>
                  <span className="bw-text-muted-italic">
                    {voiceInterimTranscript}
                  </span>
                </div>
                {voiceTranscript && (
                  <button
                    className="btn btn-secondary bw-mt-sm"
                    onClick={() => {
                      setMessageInput(coerceTrimmedString(voiceTranscript, ''));
                      setActiveTab('prediction');
                    }}
                  >
                    📝 메시지 품질 예측에 사용
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 이미지 분석 탭 */}
        {activeTab === 'image' && (
          <div id={PANEL_IDS.image} className="bw-detail-tab-content image-analysis-section" role="tabpanel" aria-labelledby={TAB_IDS.image}>
            <h3>이미지 분석</h3>
            <div className="image-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="bw-hidden"
                data-testid="advanced-features-file-input"
                aria-label="이미지 파일 선택"
              />
              <button
                className="btn btn-primary"
                onClick={handleImageUpload}
                disabled={loadingState.type === 'updating'}
                aria-label="이미지 선택하여 분석"
              >
                📁 이미지 선택
              </button>
            </div>
            {!imageAnalysisResult?.analysis && loadingState.type !== 'updating' && (
              <p className="image-analysis-empty" role="status" data-testid="image-analysis-empty">
                이미지를 선택하면 분석 결과가 여기에 표시됩니다.
              </p>
            )}

            {imageAnalysisResult?.analysis && (
              <div className="analysis-results">
                <div className="bw-flex-between bw-mb-md">
                  <h4>분석 결과</h4>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setImageAnalysisResult(null); setError(null); }}
                    aria-label="분석 결과 지우기"
                    data-testid="image-analysis-clear"
                  >
                    결과 지우기
                  </button>
                </div>
                <div className="result-grid">
                  <div className="result-item">
                    <strong>이미지 정보</strong>
                    <p>
                      크기: {imageAnalysisResult.analysis.image_info.width} x{' '}
                      {imageAnalysisResult.analysis.image_info.height}
                    </p>
                    <p>형식: {imageAnalysisResult.analysis.image_info.format}</p>
                  </div>

                  {imageAnalysisResult.analysis.object_detection && (
                    <div className="result-item">
                      <strong>객체 감지</strong>
                      <p>
                        감지된 객체: {imageAnalysisResult.analysis.object_detection.total_objects}개
                      </p>
                      <ul>
                        {imageAnalysisResult.analysis.object_detection.detected_objects.map(
                          (obj, idx) => (
                            <li key={idx}>
                              {obj.name} (신뢰도: {(obj.confidence * 100).toFixed(1)}%)
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {imageAnalysisResult.analysis.ocr_results && (
                    <div className="result-item">
                      <strong>OCR 결과</strong>
                      <p>{imageAnalysisResult.analysis.ocr_results.extracted_text}</p>
                    </div>
                  )}

                  {imageAnalysisResult.analysis.emotion_analysis && (
                    <div className="result-item">
                      <strong>감정 분석</strong>
                      <p>
                        주요 감정: {imageAnalysisResult.analysis.emotion_analysis.primary_emotion}
                      </p>
                      <p>
                        신뢰도: {(imageAnalysisResult.analysis.emotion_analysis.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 예측 분석 탭 */}
        {activeTab === 'prediction' && (
          <div id={PANEL_IDS.prediction} className="bw-detail-tab-content prediction-analysis-section" role="tabpanel" aria-labelledby={TAB_IDS.prediction}>
            <div className="bw-flex-between bw-mb-lg">
              <h3>예측 분석</h3>
              <div className="bw-flex-gap-8">
                {(userActivityPrediction ?? messageQualityPrediction ?? systemPerformancePrediction ?? predictionSummary) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setUserActivityPrediction(null);
                      setMessageQualityPrediction(null);
                      setSystemPerformancePrediction(null);
                      setPredictionSummary(null);
                      setError(null);
                    }}
                    aria-label="예측 결과 지우기"
                    data-testid="prediction-clear"
                  >
                    결과 지우기
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    void handlePredictUserActivity();
                    void handlePredictSystemPerformance();
                    void handleGetPredictionSummary();
                  }}
                  disabled={loadingState.type === 'updating'}
                >
                  🔄 전체 새로고침
                </button>
              </div>
            </div>

            {!userActivityPrediction?.prediction &&
              !messageQualityPrediction?.quality_analysis &&
              !systemPerformancePrediction?.performance_prediction &&
              !predictionSummary?.summary &&
              loadingState.type !== 'updating' && (
                <p className="prediction-empty" role="status" data-testid="prediction-empty">
                  아래 버튼으로 예측을 실행하면 결과가 여기에 표시됩니다.
                </p>
            )}
            <div className="prediction-controls">
              <div className="control-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void handlePredictUserActivity()}
                  disabled={loadingState.type === 'updating'}
                >
                  👤 사용자 활동 예측
                </button>
                {userActivityPrediction?.prediction && (
                  <div className="prediction-result">
                    <h4>예측된 활동</h4>
                    <PredictionChart
                      data={activityChartData}
                      type="bar"
                      title="활동 예측 확률"
                    />
                    <ul className="bw-mt-md">
                      {userActivityPrediction.prediction?.predicted_activities.map((activity, idx) => (
                        <li key={idx}>
                          <strong>{activity.activity}</strong> - 확률: {(activity.probability * 100).toFixed(1)}%
                          <br />
                          <small className="bw-text-secondary">
                            예상 시간: {activity.expected_time} | 신뢰도: {(activity.confidence * 100).toFixed(1)}%
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="control-group">
                <h4>메시지 품질 예측</h4>
                <textarea
                  className="message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type '/' for commands"
                  rows={4}
                  aria-label="품질 예측할 메시지 입력"
                />
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => void handlePredictMessageQuality()}
                  disabled={loadingState.type === 'updating' || !coerceTrimmedString(messageInput, '')}
                >
                  ✍️ 품질 예측
                </button>
                {messageQualityPrediction?.quality_analysis && (
                  <div className="prediction-result">
                    <h4>품질 분석 결과</h4>
                    <PredictionChart
                      data={{
                        labels: ['명확성', '완전성', '관련성', '톤'],
                        values: [
                          messageQualityPrediction.quality_analysis.scores.clarity,
                          messageQualityPrediction.quality_analysis.scores.completeness,
                          messageQualityPrediction.quality_analysis.scores.relevance,
                          messageQualityPrediction.quality_analysis.scores.tone_appropriateness,
                        ],
                        colors: ['var(--accent-info)', 'var(--accent-success)', 'var(--accent-warning)', 'var(--accent-error)'],
                      }}
                      type="bar"
                      title="품질 점수 분석"
                    />
                    <div className="bw-mt-md">
                      <p>
                        <strong>종합 점수:</strong> {(messageQualityPrediction.quality_analysis.overall_score * 100).toFixed(1)}점
                      </p>
                      <p>
                        <strong>품질 수준:</strong>{' '}
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                                ? 'var(--accent-success-muted)'
                                : messageQualityPrediction.quality_analysis.quality_level === 'good'
                                ? 'var(--accent-info-muted)'
                                : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                                ? 'var(--accent-warning-muted)'
                                : 'var(--accent-error-muted)',
                            color:
                              messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                                ? 'var(--accent-success)'
                                : messageQualityPrediction.quality_analysis.quality_level === 'good'
                                ? 'var(--accent-info)'
                                : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                                ? 'var(--accent-warning)'
                                : 'var(--accent-error)',
                          }}
                        >
                          {messageQualityPrediction.quality_analysis.quality_level === 'excellent'
                            ? '우수'
                            : messageQualityPrediction.quality_analysis.quality_level === 'good'
                            ? '양호'
                            : messageQualityPrediction.quality_analysis.quality_level === 'fair'
                            ? '보통'
                            : '개선 필요'}
                        </span>
                      </p>
                      {messageQualityPrediction.quality_analysis.suggestions.length > 0 && (
                        <div>
                          <strong>개선 제안:</strong>
                          <ul>
                            {messageQualityPrediction.quality_analysis.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="control-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void handlePredictSystemPerformance()}
                  disabled={loadingState.type === 'updating'}
                >
                  ⚙️ 시스템 성능 예측
                </button>
                {systemPerformancePrediction?.performance_prediction && (
                  <div className="prediction-result">
                    <h4>성능 예측 결과</h4>
                    <p>
                      CPU 사용률: {systemPerformancePrediction.performance_prediction.predicted_metrics.cpu_usage.toFixed(1)}%
                    </p>
                    <p>
                      메모리 사용률: {systemPerformancePrediction.performance_prediction.predicted_metrics.memory_usage.toFixed(1)}%
                    </p>
                    {systemPerformancePrediction.performance_prediction.alerts.length > 0 && (
                      <div className="alerts">
                        <strong>경고:</strong>
                        <ul>
                          {systemPerformancePrediction.performance_prediction.alerts.map((alert, idx) => (
                            <li key={idx} className={`alert-${alert.level}`}>
                              {alert.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="control-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void handleGetPredictionSummary()}
                  disabled={loadingState.type === 'updating'}
                >
                  📊 예측 요약 조회
                </button>
                {predictionSummary?.summary && (
                  <div className="prediction-result">
                    <h4>예측 요약</h4>
                    <p>총 예측 수: {predictionSummary.summary.total_predictions}</p>
                    <p>정확도: {(predictionSummary.summary.accuracy_rate * 100).toFixed(1)}%</p>
                    <p>활성 모델: {predictionSummary.summary.active_models}개</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 목소리 생성 탭 (Qwen TTS) */}
        {activeTab === 'voiceGen' && (
          <div id={PANEL_IDS.voiceGen} className="bw-detail-tab-content voice-gen-section" data-testid="voice-gen-section" role="tabpanel" aria-labelledby={TAB_IDS.voiceGen}>
            <header className="voice-gen-header">
              <h3 className="voice-gen-title">목소리 생성</h3>
              <p className="voice-gen-intro" role="status">
                영상 URL로 목소리를 학습한 뒤, 대본(직접 입력 또는 워드/텍스트 파일)을 해당 목소리로 음성 생성합니다.
              </p>
            </header>
            {ttsAvailable === false && (
              <p className="voice-gen-unavailable" role="status">
                TTS 백엔드를 사용할 수 없습니다. 서버에 Qwen TTS가 설정되어 있는지 확인해 주세요.
              </p>
            )}
            {ttsAvailable !== false && (
              <>
                <div className="voice-gen-steps">
                <section className="voice-gen-step voice-gen-step--mode" aria-label="목소리 소스 방식">
                  <h4 className="voice-gen-step-title">
                    <span className="voice-gen-step-num">1</span>
                    목소리 소스 선택
                  </h4>
                  <div className="voice-gen-mode-selector" role="group" aria-label="목소리 입력 방식">
                    <label className="voice-gen-mode-option">
                      <input type="radio" name="voiceGenMode" checked={voiceGenMode === 'url'} onChange={() => setVoiceGenMode('url')} data-testid="voice-gen-mode-url" />
                      <span>URL로 목소리 학습</span>
                    </label>
                    <label className="voice-gen-mode-option">
                      <input type="radio" name="voiceGenMode" checked={voiceGenMode === 'project'} onChange={() => setVoiceGenMode('project')} data-testid="voice-gen-mode-project" />
                      <span>프로젝트 보이스</span>
                    </label>
                    <label className="voice-gen-mode-option">
                      <input type="radio" name="voiceGenMode" checked={voiceGenMode === 'situation'} onChange={() => setVoiceGenMode('situation')} data-testid="voice-gen-mode-situation" />
                      <span>상황만 선택</span>
                    </label>
                  </div>

                {voiceGenMode === 'url' && (
                  <div className="control-group">
                    <label htmlFor="voice-gen-url">1. 목소리 학습 URL (필수)</label>
                    <p className="voice-gen-helper bw-mb-sm" role="status">
                      YouTube·TikTok 등 영상 URL을 넣으면 해당 목소리를 학습해, 아래 대본을 그 목소리로 읽어 줍니다.
                    </p>
                    <input
                      id="voice-gen-url"
                      type="url"
                      className="message-input"
                      value={voiceGenUrl}
                      onChange={(e) => setVoiceGenUrl(e.target.value)}
                      placeholder={DEMO_PLACEHOLDER_YOUTUBE_OR_TIKTOK_URL_HINT}
                      data-testid="voice-gen-url"
                    />
                  </div>
                )}
                {voiceGenMode === 'project' && (
                  <div className="control-group">
                    <label htmlFor="voice-gen-project-id">1. 프로젝트 ID (필수)</label>
                    <input
                      id="voice-gen-project-id"
                      type="text"
                      className="message-input"
                      value={voiceGenProjectId}
                      onChange={(e) => setVoiceGenProjectId(e.target.value)}
                      placeholder="프로젝트 ID 입력"
                      data-testid="voice-gen-project-id"
                    />
                  </div>
                )}
                {voiceGenMode === 'situation' && (
                  <div className="control-group">
                    <label htmlFor="voice-gen-situation-only">1. 상황 (나레이션·뉴스 등)</label>
                    <select
                      id="voice-gen-situation-only"
                      value={voiceGenSituationOnly}
                      onChange={(e) => setVoiceGenSituationOnly(e.target.value as TtsSituation)}
                      data-testid="voice-gen-situation-only"
                      className="message-input bw-d-block bw-mt-xs bw-max-w-320"
                    >
                      {TTS_SITUATION_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {TTS_SITUATION_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {voiceGenMode !== 'project' && (
                  <details className="control-group bw-mb-sm" data-testid="voice-gen-advanced-project">
                    <summary className="bw-details-summary">고급: 프로젝트 보이스 소스</summary>
                    <div className="bw-mt-sm">
                      <label htmlFor="voice-gen-project-id">프로젝트 ID</label>
                      <input
                        id="voice-gen-project-id"
                        type="text"
                        className="message-input"
                        value={voiceGenProjectId}
                        onChange={(e) => setVoiceGenProjectId(e.target.value)}
                        placeholder="프로젝트 ID (보이스 소스 관리)"
                        data-testid="voice-gen-project-id"
                      />
                    </div>
                  </details>
                )}

                {coerceTrimmedString(voiceGenProjectId, '') && voiceGenMode === 'project' && (
                  <div className="control-group voice-gen-project-sources">
                    <h4>학습된 목소리 (보이스 소스) {voiceSourcesLoading ? '조회 중...' : `${projectVoiceSources.length}개`}</h4>
                    <p className="voice-gen-helper bw-mb-md" role="status">
                      YouTube 등 영상 URL을 넣으면 해당 목소리를 학습합니다. 여러 개 추가 시 목소리를 구분해 선택한 뒤, 대본을 입력하면 그 목소리로 음성을 만들 수 있습니다.
                    </p>
                    {projectVoiceSources.length > 0 && (
                      <ul className="voice-sources-list" data-testid="voice-sources-list">
                        {projectVoiceSources.map((src) => (
                          <li key={src.id}>
                            <span className="voice-source-url" title={src.url}>
                              {src.name ? `[${src.name}] ` : ''}
                              {src.url.length > 50 ? `${src.url.slice(0, 47)}...` : src.url}
                              {src.start_seconds != null || src.end_seconds != null
                                ? ` (${src.start_seconds ?? 0}~${src.end_seconds ?? '끝'}초)`
                                : ''}
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteProjectVoiceSource(src.id)}
                              disabled={loadingState.type === 'updating'}
                              data-testid={`voice-source-delete-${src.id}`}
                            >
                              삭제
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="voice-gen-add-source">
                      <div className="control-group bw-mb-sm">
                        <label htmlFor="voice-gen-add-source-name">목소리 ID/이름 (선택)</label>
                        <p className="voice-gen-helper voice-gen-helper--sm bw-mb-xs" role="status">
                          구분용 이름. 해당 아이디에 맞는 연결 URL을 아래에 넣으면 학습이 심화됩니다.
                        </p>
                        <input
                          id="voice-gen-add-source-name"
                          type="text"
                          className="message-input"
                          value={voiceGenAddSourceName}
                          onChange={(e) => setVoiceGenAddSourceName(e.target.value)}
                          placeholder="예: 홍길동, 나레이션"
                          data-testid="voice-gen-add-source-name"
                          aria-label="목소리 ID/이름 (구분용)"
                        />
                      </div>
                      <input
                        type="url"
                        className="message-input bw-mb-sm"
                        value={voiceGenAddSourceUrl}
                        onChange={(e) => setVoiceGenAddSourceUrl(e.target.value)}
                        placeholder="YouTube/TikTok URL 입력 후 추가"
                        data-testid="voice-gen-add-source-url"
                        aria-label="학습할 영상 URL (YouTube 등)"
                      />
                      <div className="control-group bw-mb-sm">
                        <label htmlFor="voice-gen-add-reference-url">심화 학습용 연결 URL (선택)</label>
                        <p className="voice-gen-helper voice-gen-helper--sm bw-mb-xs" role="status">
                          위 목소리와 같은 사람의 다른 영상 URL을 넣으면 해당 목소리 학습이 심화됩니다.
                        </p>
                        <input
                          id="voice-gen-add-reference-url"
                          type="url"
                          className="message-input"
                          value={voiceGenAddSourceReferenceUrl}
                          onChange={(e) => setVoiceGenAddSourceReferenceUrl(e.target.value)}
                          placeholder="같은 목소리의 추가 영상 URL"
                          data-testid="voice-gen-add-reference-url"
                          aria-label="심화 학습용 연결 URL (선택)"
                        />
                      </div>
                      <div className="control-group bw-mb-sm">
                        <span className="bw-label-block">해당 목소리만 구간 (여러 사람 나올 때)</span>
                        <p className="voice-gen-helper voice-gen-helper--sm bw-mb-sm" role="status">
                          영상에서 특정 구간(초 단위)만 이 목소리로 쓰려면 시작·끝 초를 입력하세요. 비우면 전체 구간 사용.
                        </p>
                        <div className="bw-flex-gap-8">
                          <label htmlFor="voice-gen-add-start-sec" className="sr-only">시작(초)</label>
                          <input
                            id="voice-gen-add-start-sec"
                            type="number"
                            min={0}
                            step={0.1}
                            className="message-input bw-input-w-80"
                            value={voiceGenAddSourceStartSec}
                            onChange={(e) => setVoiceGenAddSourceStartSec(e.target.value)}
                            placeholder="시작(초)"
                            data-testid="voice-gen-add-start-sec"
                            aria-label="구간 시작 초"
                          />
                          <span className="bw-text-secondary">~</span>
                          <label htmlFor="voice-gen-add-end-sec" className="sr-only">끝(초)</label>
                          <input
                            id="voice-gen-add-end-sec"
                            type="number"
                            min={0}
                            step={0.1}
                            className="message-input bw-input-w-80"
                            value={voiceGenAddSourceEndSec}
                            onChange={(e) => setVoiceGenAddSourceEndSec(e.target.value)}
                            placeholder="끝(초)"
                            data-testid="voice-gen-add-end-sec"
                            aria-label="구간 끝 초"
                          />
                        </div>
                      </div>
                      <div className="control-group bw-mt-sm">
                        <label htmlFor="voice-gen-add-ref-text">참조 대본 (선택)</label>
                        <p className="voice-gen-helper voice-gen-helper--sm bw-mb-xs" role="status">
                          영상에서 나오는 말의 정확한 대본을 넣으면 목소리 학습 품질이 좋아집니다.
                        </p>
                        <textarea
                          id="voice-gen-add-ref-text"
                          className="message-input"
                          value={voiceGenAddSourceRefText}
                          onChange={(e) => setVoiceGenAddSourceRefText(e.target.value)}
                          placeholder="영상의 대사나 나레이션 텍스트..."
                          rows={2}
                          data-testid="voice-gen-add-ref-text"
                          aria-label="참조 대본 (선택, 학습 품질 향상)"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddProjectVoiceSource}
                        disabled={loadingState.type === 'updating' || !coerceTrimmedString(voiceGenAddSourceUrl, '')}
                        data-testid="voice-gen-add-source-btn"
                        aria-label="URL 추가하여 목소리 학습"
                      >
                        목소리 학습 추가
                      </button>
                    </div>
                    {projectVoiceSources.length > 0 && (
                      <div className="control-group bw-mt-md">
                        <label htmlFor="voice-gen-select-source">사용할 목소리 선택 (일괄성 유지)</label>
                        <p className="voice-gen-helper voice-gen-helper--sm bw-mb-sm" role="status">
                          목소리를 선택해 두면 같은 프로젝트에서 다시 열어도 유지되며, 여러 번 생성해도 동일한 목소리로 일괄 생성됩니다.
                        </p>
                        <select
                          id="voice-gen-select-source"
                          value={voiceGenSelectedSourceId ?? ''}
                          onChange={(e) => setVoiceGenSelectedSourceId(e.target.value || null)}
                          className="message-input"
                          data-testid="voice-gen-select-source"
                          aria-label="생성 시 사용할 학습된 목소리 선택 (일괄성 유지)"
                        >
                          <option value="">서버 기본 (첫 번째 등)</option>
                          {projectVoiceSources.map((src, idx) => (
                            <option key={src.id} value={src.id}>
                              목소리 {idx + 1}{src.name ? ` (${src.name})` : ''}: {src.url.length > 35 ? `${src.url.slice(0, 32)}...` : src.url}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                </section>

                <div className="voice-gen-required-hint" role="status" data-testid="voice-gen-required-hint">
                  {voiceGenMode === 'url' && '✓ 목소리 학습 URL과 대본을 입력한 뒤 "생성"을 누르세요.'}
                  {voiceGenMode === 'project' && '✓ 프로젝트 ID와 대본을 입력한 뒤 생성하세요.'}
                  {voiceGenMode === 'situation' && '✓ 상황과 대본을 입력한 뒤 생성하세요.'}
                </div>
                <details className="control-group bw-mt-md">
                  <summary className="bw-details-summary">같은 스타일로 새 대본 만들기 (선택)</summary>
                <div className="control-group" role="group" aria-label="샘플 대본으로 스타일 반영">
                  <span className="bw-label-block bw-mb-sm">
                    샘플 대본으로 톤·스타일·어투 반영
                  </span>
                  <p className="voice-gen-helper bw-mb-sm" role="status">
                    워드(docx) 또는 텍스트 파일에서 대본을 추출하거나, 샘플 대본을 붙여넣어 스타일을 분석한 뒤, 같은 톤·말투로 새 대본을 만들 수 있습니다.
                  </p>
                  <div className="voice-gen-inline-row voice-gen-inline-row--mb">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => voiceGenSampleFileInputRef.current?.click()}
                      disabled={loadingState.type === 'updating'}
                      data-testid="voice-gen-extract-document"
                    >
                      📄 문서에서 추출 (docx/txt)
                    </button>
                    <span className="voice-gen-text-xs-muted">
                      추출한 대본은 아래 &quot;대본&quot; 칸에 채워지며, &quot;음성 생성&quot;으로 바로 샘플 재생할 수 있습니다.
                    </span>
                    <label htmlFor="voice-gen-sample-script" className="voice-gen-inline-label voice-gen-inline-label--ml">또는 샘플 대본 붙여넣기:</label>
                  </div>
                  <textarea
                    id="voice-gen-sample-script"
                    className="message-input bw-mb-sm"
                    value={voiceGenSampleScript}
                    onChange={(e) => { setVoiceGenSampleScript(e.target.value); setVoiceGenStyleSummary(null); }}
                    placeholder="샘플 대본을 붙여넣거나 위에서 문서 추출 후 여기에 표시됩니다."
                    rows={3}
                    data-testid="voice-gen-sample-script"
                    aria-label="샘플 대본 (스타일 분석·생성용)"
                  />
                  <div className="voice-gen-inline-row voice-gen-inline-row--mb">
                    <label htmlFor="voice-gen-document-hint" className="voice-gen-inline-label voice-gen-inline-label--min-90">문서 유형 힌트</label>
                    <select
                      id="voice-gen-document-hint"
                      value={voiceGenDocumentHint}
                      onChange={(e) => setVoiceGenDocumentHint(e.target.value as 'tone_down' | 'corporate' | 'general' | '')}
                      data-testid="voice-gen-document-hint"
                      className="voice-gen-hint-select"
                      aria-label="문서 유형 힌트 (톤다운·기업보도 등)"
                    >
                      <option value="">없음</option>
                      <option value="tone_down">톤다운·보도</option>
                      <option value="corporate">기업·PR</option>
                      <option value="general">일반 대본</option>
                    </select>
                    {voiceGenSourceFilename && (
                      <span className="voice-gen-text-11-secondary" title={voiceGenSourceFilename}>
                        업로드: {voiceGenSourceFilename.length > 20 ? voiceGenSourceFilename.slice(0, 18) + '…' : voiceGenSourceFilename}
                      </span>
                    )}
                  </div>
                  <div className="voice-gen-inline-row voice-gen-inline-row--mb">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAnalyzeScriptStyle}
                      disabled={loadingState.type === 'updating' || !coerceTrimmedString(voiceGenSampleScript, '')}
                      data-testid="voice-gen-analyze-style"
                    >
                      {loadingState.type === 'updating' ? '분석 중...' : '스타일 분석'}
                    </button>
                    {voiceGenStyleSummary && (
                      <details className="voice-gen-style-details">
                        <summary className="voice-gen-inline-label">분석 결과 보기</summary>
                        <div className="voice-gen-style-summary">
                          {voiceGenStyleSummary}
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="voice-gen-inline-row">
                    <label htmlFor="voice-gen-topic-outline" className="voice-gen-inline-label voice-gen-inline-label--min-120">생성할 주제/개요</label>
                    <input
                      id="voice-gen-topic-outline"
                      type="text"
                      className="message-input voice-gen-flex-1-200"
                      value={voiceGenTopicOutline}
                      onChange={(e) => setVoiceGenTopicOutline(e.target.value)}
                      placeholder="예: 신제품 발표회 오프닝 멘트, 감사 인사 말씀..."
                      data-testid="voice-gen-topic-outline"
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGenerateScriptInStyle}
                      disabled={loadingState.type === 'updating' || !coerceTrimmedString(voiceGenSampleScript, '') || !coerceTrimmedString(voiceGenTopicOutline, '')}
                      data-testid="voice-gen-generate-in-style"
                    >
                      {loadingState.type === 'updating' ? '생성 중...' : '이 스타일로 대본 생성'}
                    </button>
                  </div>
                </div>
                </details>

                {voiceGenLineMode && (
                  <div className="voice-gen-typecast-download-bar" role="region" aria-label="다운로드">
                    <p className="voice-gen-pro-hint">
                      음성 세부 조절 된 문장은 프로 플랜 이상에서만 다운로드가 가능합니다.
                    </p>
                    <div className="voice-gen-download-actions">
                      <button
                        type="button"
                        className="btn btn-primary voice-gen-download-main"
                        onClick={handleMergeAllLinesAudio}
                        disabled={loadingState.type === 'updating' || !voiceGenLines.some((l) => l.audioUrl || l.isPause)}
                        data-testid="voice-gen-download-main"
                        title="쉼 포함 전체를 한 WAV 파일로 다운로드"
                      >
                        다운로드
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleDownloadAllLines}
                        disabled={!voiceGenLines.some((l) => l.audioUrl && !l.isPause)}
                        title="줄별 MP3 일괄 다운로드"
                        data-testid="voice-gen-download-segments"
                      >
                        줄별 다운로드
                      </button>
                    </div>
                  </div>
                )}
                <div className="voice-gen-layout">
                  <div className="voice-gen-script-panel">
                    <section className="voice-gen-step voice-gen-step--script" aria-label="대본 입력">
                      <h4 className="voice-gen-step-title">
                        <span className="voice-gen-step-num">2</span>
                        대본 (필수)
                      </h4>
                      <div className="control-group voice-gen-script-block">
                        <div className="voice-gen-script-header">
                          <label htmlFor="voice-gen-script">읽을 내용 입력 또는 파일 업로드</label>
                          <input
                            ref={voiceGenSampleFileInputRef}
                            type="file"
                            accept=".docx,.txt"
                            onChange={handleExtractScriptDocument}
                            className="bw-hidden"
                            data-testid="voice-gen-sample-file"
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => voiceGenSampleFileInputRef.current?.click()}
                            disabled={loadingState.type === 'updating'}
                            data-testid="voice-gen-extract-document"
                            aria-label="워드/텍스트 파일 업로드"
                          >
                            📄 워드/텍스트 파일 업로드
                          </button>
                        </div>
                        <p className="voice-gen-helper bw-mb-sm" role="status">
                          직접 입력하거나 워드(docx)·텍스트 파일을 업로드하면 대본 칸에 채워집니다.
                        </p>
                        <textarea
                          id="voice-gen-script"
                          className="message-input"
                          value={voiceGenScript}
                          onChange={(e) => setVoiceGenScript(e.target.value)}
                          onKeyDown={handleVoiceGenKeyDown}
                          placeholder="대사를 입력하거나 위에서 파일을 업로드하세요. (Cmd/Ctrl+Enter: 생성)"
                          rows={4}
                          data-testid="voice-gen-script"
                          aria-label="대본 (이 목소리로 읽을 텍스트)"
                        />
                        {!voiceGenLineMode && (
                          <button
                            type="button"
                            className="btn btn-secondary bw-mt-sm"
                            onClick={handleConvertScriptToLines}
                            data-testid="voice-gen-convert-to-lines"
                            aria-label="대본을 줄 단위로 변환"
                            title={coerceTrimmedString(voiceGenScript, '') ? '대본을 줄 단위로 나눕니다' : '대본을 입력한 뒤 변환해 주세요'}
                          >
                            📋 줄 단위로 변환 (속도·톤 줄마다 설정)
                          </button>
                        )}
                        {voiceGenLineMode && (
                          <div className="voice-gen-lines-panel voice-gen-typecast-layout" data-testid="voice-gen-lines-panel">
                            <div className="voice-gen-lines-header voice-gen-typecast-header">
                              <input
                                type="text"
                                className="voice-gen-typecast-title-input"
                                value={voiceGenProjectTitle}
                                onChange={(e) => setVoiceGenProjectTitle(e.target.value)}
                                placeholder="제목없음"
                                data-testid="voice-gen-project-title"
                                aria-label="프로젝트 제목"
                              />
                              <div className="voice-gen-lines-header-actions">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleExportScript}
                                  data-testid="voice-gen-export"
                                  aria-label="대본 내보내기"
                                  title="대본·프리셋 JSON 내보내기"
                                >
                                  내보내기
                                </button>
                                <input
                                  ref={voiceGenImportInputRef}
                                  type="file"
                                  accept=".json,application/json"
                                  onChange={handleImportScript}
                                  className="bw-hidden"
                                  data-testid="voice-gen-import-input"
                                  aria-label="대본 가져오기"
                                />
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => voiceGenImportInputRef.current?.click()}
                                  data-testid="voice-gen-import"
                                  aria-label="대본 가져오기"
                                  title="JSON 파일에서 대본·프리셋 가져오기"
                                >
                                  가져오기
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleAddLine(-1)}
                                  data-testid="voice-gen-add-line"
                                  aria-label="새 줄 추가"
                                  title="맨 끝에 줄 추가"
                                >
                                  + 줄 추가
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleClearLineMode}
                                  data-testid="voice-gen-clear-line-mode"
                                  aria-label="줄 모드 해제"
                                  title="텍스트 모드로 되돌리기"
                                >
                                  줄 모드 해제
                                </button>
                              </div>
                            </div>
                            <ul className="voice-gen-script-lines voice-gen-script-lines--editable voice-gen-typecast-list" aria-label="줄 단위 대본 목록">
                              {voiceGenLines.map((line, idx) => (
                                <li
                                  key={line.id}
                                  className={`voice-gen-script-line voice-gen-script-line--editable voice-gen-typecast-line ${line.isPause ? 'voice-gen-script-line--pause' : ''} ${voiceGenSelectedLineIndex === idx ? 'selected' : ''}`}
                                  data-testid={`voice-gen-line-${idx}`}
                                >
                                  <span className="voice-gen-script-line-num voice-gen-typecast-num">{idx + 1}</span>
                                  <div className="voice-gen-typecast-avatar">
                                    <span className="voice-gen-typecast-avatar-circle" aria-hidden>
                                      {line.isPause ? '⏸' : '👤'}
                                    </span>
                                    <span className="voice-gen-typecast-avatar-dur">
                                      {line.isPause ? (line.pauseAfter ?? 0.5).toFixed(1) + 's' : line.audioUrl && line.duration != null ? line.duration.toFixed(1) + 's' : '—'}
                                    </span>
                                  </div>
                                  <div className="voice-gen-script-line-body voice-gen-typecast-body">
                                    <div className="voice-gen-typecast-speaker-row">
                                      <span className="voice-gen-typecast-speaker">지희</span>
                                      {line.isPause && (
                                        <span className="voice-gen-typecast-pause-badge" onClick={() => setVoiceGenSelectedLineIndex(idx)}>
                                          🕐 쉼 추가
                                        </span>
                                      )}
                                    </div>
                                    {line.isPause ? (
                                      <span className="voice-gen-pause-label" onClick={() => setVoiceGenSelectedLineIndex(idx)}>
                                        쉼 ({(line.pauseAfter ?? 0.5).toFixed(1)}초)
                                      </span>
                                    ) : (
                                      <>
                                        <div className="voice-gen-typecast-text-row">
                                          <input
                                            type="text"
                                            className="message-input voice-gen-line-input voice-gen-typecast-input"
                                            value={line.text}
                                            onChange={(e) => updateVoiceGenLine(idx, { text: e.target.value })}
                                            onFocus={() => setVoiceGenSelectedLineIndex(idx)}
                                            placeholder="대사 입력"
                                            data-testid={`voice-gen-line-input-${idx}`}
                                            aria-label={`줄 ${idx + 1} 대사`}
                                          />
                                          <span className="voice-gen-typecast-dur-pill">
                                            {line.audioUrl && line.duration != null ? `${line.duration.toFixed(1)}s` : '0.1s'}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    <div className="voice-gen-line-actions">
                                      <span className="voice-gen-line-dur" aria-hidden>
                                        {line.isPause ? '⏸' : line.audioUrl ? (line.duration != null ? `✓ ${line.duration.toFixed(1)}s` : '✓') : '—'}
                                      </span>
                                      {!line.isPause && (
                                        <>
                                          <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleGenerateLineVoice(idx)}
                                            disabled={loadingState.type === 'updating' || !coerceTrimmedString(line.text, '')}
                                            data-testid={`voice-gen-line-generate-${idx}`}
                                            aria-label={`줄 ${idx + 1} 음성 생성`}
                                            title="이 줄만 음성 생성"
                                          >
                                            🎙
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handlePlayLineVoice(idx)}
                                            disabled={!line.audioUrl}
                                            data-testid={`voice-gen-line-play-${idx}`}
                                            aria-label={`줄 ${idx + 1} 재생`}
                                            title="재생"
                                          >
                                            ▶
                                          </button>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleAddLine(idx)}
                                        data-testid={`voice-gen-insert-line-${idx}`}
                                        aria-label={`줄 ${idx + 1} 뒤에 새 줄 삽입`}
                                        title="줄 삽입"
                                      >
                                        +
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDuplicateLine(idx)}
                                        data-testid={`voice-gen-duplicate-line-${idx}`}
                                        aria-label={`줄 ${idx + 1} 복사`}
                                        title="줄 복사"
                                      >
                                        ⧉
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleMoveLine(idx, 'up')}
                                        disabled={idx === 0}
                                        data-testid={`voice-gen-move-up-${idx}`}
                                        aria-label={`줄 ${idx + 1} 위로`}
                                        title="위로"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleMoveLine(idx, 'down')}
                                        disabled={idx === voiceGenLines.length - 1}
                                        data-testid={`voice-gen-move-down-${idx}`}
                                        aria-label={`줄 ${idx + 1} 아래로`}
                                        title="아래로"
                                      >
                                        ▼
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleAddPauseLine(idx)}
                                        data-testid={`voice-gen-add-pause-${idx}`}
                                        aria-label={`줄 ${idx + 1} 뒤에 쉼 추가`}
                                        title="쉼 추가"
                                      >
                                        ⏸
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm voice-gen-line-delete"
                                        onClick={() => handleRemoveLine(idx)}
                                        data-testid={`voice-gen-line-delete-${idx}`}
                                        aria-label={`줄 ${idx + 1} 삭제`}
                                        title="줄 삭제"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {voiceGenScriptLines.length > 0 && !voiceGenLineMode && (
                          <div className="voice-gen-script-preview" data-testid="voice-gen-script-lines">
                            <span className="voice-gen-voice-group-label">대본 미리보기 ({voiceGenScriptLines.length}줄)</span>
                            <ul className="voice-gen-script-lines" aria-label="대본 줄 목록">
                              {voiceGenScriptLines.map((line, idx) => (
                                <li key={idx} className="voice-gen-script-line">
                                  <span className="voice-gen-script-line-num">{idx + 1}</span>
                                  <span className="voice-gen-script-line-text">{line}</span>
                                  <span className="voice-gen-script-line-dur" aria-hidden>—</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="voice-gen-typecast-panel-wrap">
                  <aside className="voice-gen-voice-panel voice-gen-typecast-panel voice-gen-voice-panel--with-icon" aria-label="음성 설정">
                    <div className="voice-gen-voice-panel-inner">
                    <div className="voice-gen-typecast-panel-header">
                      <span className="voice-gen-typecast-tab voice-gen-typecast-tab--active">음성</span>
                      {voiceGenLineMode && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const idx = voiceGenSelectedLineIndex;
                            if (idx == null) return;
                            const src = voiceGenLines[idx];
                            if (!src) return;
                            const patch = {
                              speed: src.speed,
                              tonePrompt: src.tonePrompt,
                              pitch: src.pitch,
                              pauseAfter: src.pauseAfter,
                            };
                            setVoiceGenLines((prev) => prev.map((l, i) => (i === idx ? l : { ...l, ...patch })));
                            setVoiceGenToast('모든 줄에 적용되었습니다.');
                          }}
                          disabled={voiceGenSelectedLineIndex == null}
                          data-testid="voice-gen-apply-all"
                        >
                          전체 적용
                        </button>
                      )}
                    </div>
                    <div className="voice-gen-typecast-speaker-bar">
                      <span className="voice-gen-typecast-speaker-label">지희</span>
                    </div>
                    <section className="voice-gen-step voice-gen-step--options" aria-label="옵션 및 생성">
                      {voiceGenLineMode && voiceGenSelectedLineIndex != null && (
                        <div className="voice-gen-line-settings voice-gen-typecast-sections" data-testid="voice-gen-line-settings">
                          <div className="voice-gen-typecast-select-input">
                            <span className="voice-gen-voice-group-label voice-gen-typecast-section-label">
                              선택 입력 · 줄 {voiceGenSelectedLineIndex + 1}
                              {voiceGenLines[voiceGenSelectedLineIndex]?.isPause ? ' (쉼)' : ''}
                            </span>
                            <div className="voice-gen-typecast-tabs" role="tablist" aria-label="입력 프리셋">
                              {(['일반', 'A', 'B', 'C', 'D'] as const).map((tab) => (
                                <button
                                  key={tab}
                                  type="button"
                                  role="tab"
                                  className={`voice-gen-typecast-tab-item ${voiceGenInputPreset === tab ? 'active' : ''}`}
                                  aria-selected={voiceGenInputPreset === tab}
                                  onClick={() => setVoiceGenInputPreset(tab)}
                                  data-testid={`voice-gen-preset-tab-${tab}`}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>
                            {voiceGenInputPreset !== '일반' && (
                              <>
                                {voiceGenPresets[voiceGenInputPreset] && (
                                  <p className="voice-gen-preset-preview" data-testid={`voice-gen-preset-preview-${voiceGenInputPreset}`}>
                                    저장됨: 속도 {voiceGenPresets[voiceGenInputPreset]!.speed.toFixed(2)}x
                                    {voiceGenPresets[voiceGenInputPreset]!.tonePrompt ? ` · 톤 ${voiceGenPresets[voiceGenInputPreset]!.tonePrompt.slice(0, 12)}${voiceGenPresets[voiceGenInputPreset]!.tonePrompt.length > 12 ? '…' : ''}` : ''}
                                    · 끊어읽기 {voiceGenPresets[voiceGenInputPreset]!.pauseAfter.toFixed(1)}초
                                  </p>
                                )}
                                <div className="voice-gen-preset-actions">
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleApplyPresetToLine(voiceGenInputPreset)}
                                    disabled={!voiceGenPresets[voiceGenInputPreset]}
                                    data-testid={`voice-gen-apply-preset-${voiceGenInputPreset}`}
                                  >
                                    선택 줄에 적용
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleApplyPresetToAllLines(voiceGenInputPreset)}
                                    disabled={!voiceGenPresets[voiceGenInputPreset] || voiceGenLines.length === 0}
                                    data-testid={`voice-gen-apply-preset-all-${voiceGenInputPreset}`}
                                    title={`프리셋 ${voiceGenInputPreset}를 모든 줄에 적용`}
                                  >
                                    모든 줄에 적용
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleSavePreset(voiceGenInputPreset)}
                                    data-testid={`voice-gen-save-preset-${voiceGenInputPreset}`}
                                  >
                                    현재 줄을 {voiceGenInputPreset}에 저장
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {voiceGenLines[voiceGenSelectedLineIndex]?.isPause ? (
                            <div className="voice-gen-voice-group">
                              <label className="voice-gen-voice-group-label">쉼 길이</label>
                              <div className="voice-gen-pause-stepper">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-pause-btn"
                                  onClick={() => {
                                    const v = voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.5;
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, { pauseAfter: Math.max(0.1, v - 0.1) });
                                  }}
                                  disabled={(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.5) <= 0.1}
                                  aria-label="0.1초 감소"
                                >
                                  −
                                </button>
                                <span className="voice-gen-pause-value-inline">
                                  {(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.5).toFixed(1)}초
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-pause-btn"
                                  onClick={() => {
                                    const v = voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.5;
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, { pauseAfter: Math.min(10, v + 0.1) });
                                  }}
                                  disabled={(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0) >= 10}
                                  aria-label="0.1초 증가"
                                >
                                  +
                                </button>
                                <input
                                  type="range"
                                  min={0.1}
                                  max={10}
                                  step={0.1}
                                  value={voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.5}
                                  onChange={(e) =>
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, {
                                      pauseAfter: Number(e.target.value),
                                    })
                                  }
                                  data-testid="voice-gen-line-pause-duration"
                                  className="voice-gen-range-flex"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                          <div className="voice-gen-voice-group">
                            <span className="voice-gen-voice-group-label">읽는 속도</span>
                            <div className="voice-gen-speed-presets" role="group" aria-label="속도 프리셋">
                              {([['느림', 0.8], ['보통', 1.0], ['빠름', 1.2]] as const).map(([label, value]) => {
                                const line = voiceGenLines[voiceGenSelectedLineIndex];
                                const v = line?.speed ?? 1.0;
                                const active = Math.abs(v - value) < 0.15;
                                return (
                                  <button
                                    key={label}
                                    type="button"
                                    className={`voice-gen-speed-preset ${active ? 'active' : ''}`}
                                    onClick={() => updateVoiceGenLine(voiceGenSelectedLineIndex, { speed: value })}
                                    data-testid={`voice-gen-line-speed-${label}`}
                                    aria-pressed={active}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="control-group voice-gen-control-inline">
                              <input
                                type="range"
                                min={0.25}
                                max={4}
                                step={0.25}
                                value={voiceGenLines[voiceGenSelectedLineIndex]?.speed ?? 1.0}
                                onChange={(e) =>
                                  updateVoiceGenLine(voiceGenSelectedLineIndex, { speed: Number(e.target.value) })
                                }
                                data-testid="voice-gen-line-speed-range"
                              />
                              <span className="voice-gen-inline-label">
                                {(voiceGenLines[voiceGenSelectedLineIndex]?.speed ?? 1.0).toFixed(2)}x
                              </span>
                            </div>
                            <div
                              className="voice-gen-typecast-reading-time"
                              title="목표 재생 시간(초)을 입력한 뒤 적용하면, 해당 줄의 읽는 속도를 자동으로 조정합니다."
                            >
                              <span className="voice-gen-voice-group-label">읽는 시간 입력 Beta</span>
                              <div className="voice-gen-reading-row">
                                <input
                                  type="text"
                                  className="message-input voice-gen-input-w-72"
                                  value={voiceGenReadingTimeInput}
                                  onChange={(e) => setVoiceGenReadingTimeInput(e.target.value)}
                                  placeholder={voiceGenLines[voiceGenSelectedLineIndex]?.duration != null ? voiceGenLines[voiceGenSelectedLineIndex].duration!.toFixed(1) : '3.1'}
                                  aria-label="목표 재생 시간(초)"
                                  data-testid="voice-gen-reading-time-input"
                                />
                                <span className="voice-gen-inline-label">초</span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleApplyReadingTime}
                                  disabled={voiceGenLines[voiceGenSelectedLineIndex]?.isPause || !coerceTrimmedString(voiceGenReadingTimeInput, '')}
                                  data-testid="voice-gen-reading-time-apply"
                                >
                                  적용
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <label htmlFor="voice-gen-line-tone" className="voice-gen-voice-group-label">
                              PRO 감정
                            </label>
                            <span className="voice-gen-typecast-beta">프롬프트 Beta</span>
                            <input
                              id="voice-gen-line-tone"
                              type="text"
                              className="message-input bw-mb-sm"
                              value={voiceGenLines[voiceGenSelectedLineIndex]?.tonePrompt ?? ''}
                              onChange={(e) =>
                                updateVoiceGenLine(voiceGenSelectedLineIndex, { tonePrompt: e.target.value })
                              }
                              placeholder="예: 서러운듯 울먹이며"
                              data-testid="voice-gen-line-tone"
                            />
                            <div className="voice-gen-tone-tags">
                              {TONE_HASHTAGS.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-tag-btn"
                                  onClick={() => {
                                    const line = voiceGenLines[voiceGenSelectedLineIndex];
                                    const cur = line?.tonePrompt ?? '';
                                    const next = cur.includes(tag)
                                      ? coerceTrimmedString(cur.replace(tag, ''), '')
                                      : coerceTrimmedString(`${cur} ${tag}`, '');
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, { tonePrompt: next });
                                  }}
                                  data-testid={`voice-gen-line-tone-${tag}`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <label className="voice-gen-voice-group-label">끊어 읽기</label>
                            <div className="voice-gen-typecast-pause-row">
                              <div className="voice-gen-pause-stepper">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-pause-btn"
                                  onClick={() => {
                                    const v = voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.1;
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, { pauseAfter: Math.max(0, v - 0.1) });
                                  }}
                                  disabled={(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0) <= 0}
                                  aria-label="0.1초 감소"
                                >
                                  −
                                </button>
                                <span className="voice-gen-typecast-pause-value">
                                  {(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.1).toFixed(1)}초
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-pause-btn"
                                  onClick={() => {
                                    const v = voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.1;
                                    updateVoiceGenLine(voiceGenSelectedLineIndex, { pauseAfter: Math.min(10, v + 0.1) });
                                  }}
                                  disabled={(voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0) >= 10}
                                  aria-label="0.1초 증가"
                                >
                                  +
                                </button>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={10}
                                step={0.1}
                                value={voiceGenLines[voiceGenSelectedLineIndex]?.pauseAfter ?? 0.1}
                                onChange={(e) =>
                                  updateVoiceGenLine(voiceGenSelectedLineIndex, {
                                    pauseAfter: Number(e.target.value),
                                  })
                                }
                                data-testid="voice-gen-line-pause"
                                className="voice-gen-typecast-slider"
                              />
                              <span className="voice-gen-note-range">0초 — 10.0초</span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm bw-mt-sm"
                              onClick={() => voiceGenSelectedLineIndex != null && handleAddPauseLine(voiceGenSelectedLineIndex)}
                              data-testid="voice-gen-add-segment"
                            >
                              구간 추가하기
                            </button>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <span className="voice-gen-voice-group-label">PRO 끝음 조절</span>
                            <div className="voice-gen-row">
                              <span className="voice-gen-typecast-auto-label">자동</span>
                              <button type="button" className="btn btn-secondary btn-sm" disabled>직접 조절</button>
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <span className="voice-gen-voice-group-label">PRO 재생 속도</span>
                            <div className="voice-gen-row">
                              <input
                                type="range"
                                min={0.5}
                                max={2}
                                step={0.1}
                                value={voiceGenPlaybackRate}
                                onChange={(e) => setVoiceGenPlaybackRate(Number(e.target.value))}
                                className="voice-gen-range-flex"
                                aria-label="재생 속도"
                                data-testid="voice-gen-playback-rate"
                              />
                              <span className="voice-gen-rate-value">{voiceGenPlaybackRate.toFixed(1)}배</span>
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <label className="voice-gen-voice-group-label">PRO 피치</label>
                            <div className="voice-gen-row">
                              <input
                                type="range"
                                min={-1}
                                max={1}
                                step={0.1}
                                value={voiceGenLines[voiceGenSelectedLineIndex]?.pitch ?? 0}
                                onChange={(e) =>
                                  updateVoiceGenLine(voiceGenSelectedLineIndex, { pitch: Number(e.target.value) })
                                }
                                data-testid="voice-gen-line-pitch"
                              />
                              <span className="voice-gen-inline-label">
                                {((voiceGenLines[voiceGenSelectedLineIndex]?.pitch ?? 0) < -0.3
                                  ? '낮게'
                                  : (voiceGenLines[voiceGenSelectedLineIndex]?.pitch ?? 0) > 0.3
                                    ? '높게'
                                    : '보통')}
                              </span>
                            </div>
                          </div>
                            </>
                          )}
                        </div>
                      )}
                          <div className="voice-gen-voice-group voice-gen-typecast-group" role="group" aria-label="감정 제어 Typecast 스타일">
                            <span className="voice-gen-voice-group-label">감정 제어</span>
                            <p className="voice-gen-helper voice-gen-helper--sm bw-mb-sm">
                              Smart Emotion: 텍스트에 맞는 감정 자동 적용. Preset: 7종 감정 중 선택.
                            </p>
                            <div className="voice-gen-emotion-mode-row">
                              <label className="voice-gen-radio-option">
                                <input
                                  type="radio"
                                  name="voice-gen-emotion-mode"
                                  checked={voiceGenEmotionMode === 'smart'}
                                  onChange={() => setVoiceGenEmotionMode('smart')}
                                  data-testid="voice-gen-emotion-mode-smart"
                                  aria-label="Smart Emotion 자동"
                                />
                                <span>Smart Emotion (자동)</span>
                              </label>
                              <label className="voice-gen-radio-option">
                                <input
                                  type="radio"
                                  name="voice-gen-emotion-mode"
                                  checked={voiceGenEmotionMode === 'preset'}
                                  onChange={() => setVoiceGenEmotionMode('preset')}
                                  data-testid="voice-gen-emotion-mode-preset"
                                  aria-label="Preset 수동"
                                />
                                <span>Preset (수동)</span>
                              </label>
                              {voiceGenEmotionMode === 'preset' && (
                                <select
                                  value={voiceGenEmotionPreset}
                                  onChange={(e) => setVoiceGenEmotionPreset(e.target.value as TypecastEmotionPreset)}
                                  className="message-input voice-gen-select-compact"
                                  data-testid="voice-gen-emotion-preset"
                                  aria-label="감정 프리셋 선택"
                                >
                                  {TYPECAST_EMOTION_PRESETS.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group" role="group" aria-label="감정·상황 프롬프트">
                            <span className="voice-gen-voice-group-label">추가 지시 (선택)</span>
                            <p className="voice-gen-helper voice-gen-helper--sm bw-mb-sm">
                              음성 톤·감정을 자연어로 더 적으면 TTS에 반영됩니다.
                            </p>
                            <input
                              type="text"
                              className="message-input bw-mb-sm"
                              value={voiceGenEmotionPrompt}
                              onChange={(e) => setVoiceGenEmotionPrompt(e.target.value)}
                              placeholder="예: 서러운듯 울먹이며"
                              data-testid="voice-gen-emotion-prompt"
                              aria-label="감정·상황 프롬프트"
                            />
                            <div className="voice-gen-tone-tags">
                              {VOICE_GEN_EMOTION_TAGS.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  className="btn btn-secondary btn-sm voice-gen-tag-btn"
                                  onClick={() => {
                                    const cur = coerceTrimmedString(voiceGenEmotionPrompt, '');
                                    const next = cur.includes(tag)
                                      ? coerceTrimmedString(cur.replace(tag, ''), '').replace(/\s+/g, ' ')
                                      : coerceTrimmedString(`${cur} ${tag}`, '');
                                    setVoiceGenEmotionPrompt(next);
                                  }}
                                  data-testid={`voice-gen-emotion-tag-${tag}`}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="voice-gen-voice-group voice-gen-typecast-group">
                            <span className="voice-gen-voice-group-label">PRO 읽는 속도</span>
                            <span className="voice-gen-typecast-reading-label">읽는 속도 선택 (전체 기본)</span>
                        <div className="voice-gen-speed-presets" role="group" aria-label="속도 프리셋">
                          {([['느림', 0.8], ['보통', 1.0], ['빠름', 1.2]] as const).map(([label, value]) => (
                            <button
                              key={label}
                              type="button"
                              className={`voice-gen-speed-preset ${Math.abs(voiceGenGlobalSpeed - value) < 0.15 ? 'active' : ''}`}
                              onClick={() => setVoiceGenGlobalSpeed(value)}
                              data-testid={`voice-gen-speed-${label}`}
                              aria-pressed={Math.abs(voiceGenGlobalSpeed - value) < 0.15}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="control-group" role="group" aria-label="재생 속도 (전체)">
                          <label htmlFor="voice-gen-global-speed" className="sr-only">재생 속도 (전체)</label>
                          <input
                            id="voice-gen-global-speed"
                            type="range"
                            min={0.25}
                            max={4}
                            step={0.25}
                            value={voiceGenGlobalSpeed}
                            onChange={(e) => setVoiceGenGlobalSpeed(Number(e.target.value))}
                            data-testid="voice-gen-global-speed"
                            aria-valuemin={0.25}
                            aria-valuemax={4}
                            aria-valuenow={voiceGenGlobalSpeed}
                          />
                          <span className="voice-gen-inline-value-offset">{voiceGenGlobalSpeed.toFixed(2)}x</span>
                        </div>
                      </div>
                      {voiceGenLineMode && (
                        <div className="voice-gen-voice-group voice-gen-typecast-group">
                          <span className="voice-gen-voice-group-label">PRO 재생 속도</span>
                          <div className="voice-gen-row">
                            <input
                              type="range"
                              min={0.5}
                              max={2}
                              step={0.1}
                              value={voiceGenPlaybackRate}
                              onChange={(e) => setVoiceGenPlaybackRate(Number(e.target.value))}
                              data-testid="voice-gen-playback-rate-global"
                              aria-label="재생 속도"
                              className="voice-gen-range-flex"
                            />
                            <span className="voice-gen-inline-label">{voiceGenPlaybackRate.toFixed(1)}배</span>
                          </div>
                        </div>
                      )}
                      {voiceGenMode !== 'situation' && (
                        <div className="voice-gen-voice-group">
                          <label htmlFor="voice-gen-situation" className="voice-gen-voice-group-label">상황 (URL/프로젝트 보이스용)</label>
                          <select
                            id="voice-gen-situation"
                            value={voiceGenSituation}
                            onChange={(e) => setVoiceGenSituation(e.target.value as ScriptDialogueSituation)}
                            data-testid="voice-gen-situation"
                            className="message-input voice-gen-situation-select"
                          >
                            {TTS_SCRIPT_DIALOGUE_SITUATIONS.map((key) => (
                              <option key={key} value={key}>
                                {TTS_SITUATION_LABELS[key]}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="voice-gen-voice-group">
                        <label className="voice-gen-voice-group-label">
                          <input
                            type="checkbox"
                            checked={voiceGenUseSegmentSpeed}
                            onChange={(e) => setVoiceGenUseSegmentSpeed(e.target.checked)}
                            data-testid="voice-gen-use-segment-speed"
                          />
                          {' '}구간별 속도 (문단/문장/줄 단위)
                        </label>
                        {voiceGenUseSegmentSpeed && (
                          <>
                            <div className="control-group voice-gen-inline-row bw-mt-sm">
                              <label htmlFor="voice-gen-split-by" className="sr-only">나누기 기준</label>
                              <select
                                id="voice-gen-split-by"
                                value={voiceGenSplitBy}
                                onChange={(e) => setVoiceGenSplitBy(e.target.value as 'paragraph' | 'sentence' | 'word' | 'line')}
                                data-testid="voice-gen-split-by"
                                className="message-input voice-gen-flex-1-100"
                              >
                                <option value="paragraph">문단</option>
                                <option value="sentence">문장</option>
                                <option value="word">단어</option>
                                <option value="line">줄</option>
                              </select>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setVoiceGenSegments(splitScriptToSegments(voiceGenScript, voiceGenSplitBy))}
                                disabled={!coerceTrimmedString(voiceGenScript, '')}
                                data-testid="voice-gen-split-script"
                              >
                                구간 나누기
                              </button>
                            </div>
                            {voiceGenSegments.length > 0 && (
                              <div className="control-group voice-gen-segments-panel">
                                <span className="voice-gen-segments-title">구간별 속도 ({voiceGenSegments.length}개)</span>
                                {voiceGenSegments.map((seg, i) => (
                                  <div key={i} className="voice-gen-segment-item">
                                    <div className="voice-gen-segment-text" title={seg.text}>
                                      {seg.text.slice(0, 40)}{seg.text.length > 40 ? '…' : ''}
                                    </div>
                                    <div className="voice-gen-segment-row">
                                      <label htmlFor={`voice-gen-seg-speed-${i}`} className="sr-only">속도</label>
                                      <input
                                        id={`voice-gen-seg-speed-${i}`}
                                        type="range"
                                        min={0.25}
                                        max={4}
                                        step={0.25}
                                        value={seg.speed}
                                        onChange={(e) => {
                                          const v = Number(e.target.value);
                                          setVoiceGenSegments((prev) => prev.map((s, j) => (j === i ? { ...s, speed: v } : s)));
                                        }}
                                        data-testid={`voice-gen-segment-speed-${i}`}
                                      />
                                      <span className="voice-gen-segment-value">{seg.speed.toFixed(2)}x</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="voice-controls bw-mt-md">
                        {(() => {
                          const isDisabled =
                            loadingState.type === 'updating' ||
                            !coerceTrimmedString(voiceGenScript, '') ||
                            (voiceGenMode === 'url' && !coerceTrimmedString(voiceGenUrl, '')) ||
                            (voiceGenMode === 'project' && !coerceTrimmedString(voiceGenProjectId, ''));
                          const lineGenDisabled =
                            loadingState.type === 'updating' ||
                            voiceGenLines.length === 0 ||
                            (voiceGenMode === 'url' && !coerceTrimmedString(voiceGenUrl, '')) ||
                            (voiceGenMode === 'project' && !coerceTrimmedString(voiceGenProjectId, ''));
                          let buttonTitle: string | undefined;
                          if (loadingState.type === 'updating') buttonTitle = '생성 중...';
                          else if (!coerceTrimmedString(voiceGenScript, '')) buttonTitle = '대본을 입력해 주세요';
                          else if (voiceGenMode === 'url' && !coerceTrimmedString(voiceGenUrl, '')) buttonTitle = '영상 URL을 입력해 주세요';
                          else if (voiceGenMode === 'project' && !coerceTrimmedString(voiceGenProjectId, '')) buttonTitle = '프로젝트 ID를 입력해 주세요';
                          else if (voiceGenMode === 'situation') buttonTitle = '선택한 상황 스타일로 음성 생성';
                          return (
                            <>
                              {voiceGenLineMode ? (
                                <>
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleGenerateLineVoice()}
                                    disabled={lineGenDisabled}
                                    title="모든 줄 음성 생성"
                                    data-testid="voice-gen-generate-all-lines"
                                    aria-busy={loadingState.type === 'updating'}
                                  >
                                    {loadingState.type === 'updating' ? '생성 중...' : '🎙️ 전체 줄 생성'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary voice-gen-btn-spaced"
                                    onClick={() => handlePlayLineVoice()}
                                    disabled={!voiceGenLines.some((l) => l.audioUrl)}
                                    title="전체 줄 순차 재생"
                                    data-testid="voice-gen-play-all-lines"
                                  >
                                    ▶ 전체 재생
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary voice-gen-btn-spaced"
                                    onClick={handleDownloadAllLines}
                                    disabled={!voiceGenLines.some((l) => l.audioUrl && !l.isPause)}
                                    title="생성된 모든 줄 오디오 다운로드"
                                    data-testid="voice-gen-download-all-lines"
                                  >
                                    ⬇ 모두 다운로드
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary voice-gen-btn-spaced"
                                    onClick={handleMergeAllLinesAudio}
                                    disabled={loadingState.type === 'updating' || !voiceGenLines.some((l) => l.audioUrl || l.isPause)}
                                    title="쉼 포함 전체를 한 WAV 파일로 다운로드"
                                    data-testid="voice-gen-merge-all-lines"
                                  >
                                    🔗 전체 합치기 (WAV)
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-primary"
                                    onClick={handleVoiceGenGenerate}
                                    disabled={isDisabled}
                                    title={buttonTitle}
                                    data-testid="voice-gen-generate"
                                    aria-busy={loadingState.type === 'updating'}
                                  >
                                    {loadingState.type === 'updating' ? '생성 중...' : '🎙️ 생성'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary voice-gen-btn-spaced"
                                    onClick={handleVoiceGenGenerateAndPlay}
                                    disabled={isDisabled}
                                    title="음성 생성 후 바로 재생 (샘플 확인용)"
                                    aria-label="음성 생성 후 바로 재생 (샘플 확인용)"
                                    data-testid="voice-gen-generate-and-play"
                                  >
                                    생성 후 재생
                                  </button>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </section>
                    </div>
                    <nav className="voice-gen-typecast-icon-bar" aria-label="설정 카테고리">
                      <span className="voice-gen-icon-bar-item active" title="음성" aria-current="true">🎙</span>
                      <button
                        type="button"
                        className="voice-gen-icon-bar-item"
                        title="캐릭터 (준비 중)"
                        onClick={() => setError('캐릭터 설정은 준비 중입니다.')}
                        data-testid="voice-gen-icon-character"
                      >
                        👤
                      </button>
                      <button
                        type="button"
                        className="voice-gen-icon-bar-item"
                        title="배경 색상 (준비 중)"
                        onClick={() => setError('배경 색상 설정은 준비 중입니다.')}
                        data-testid="voice-gen-icon-bg"
                      >
                        🎨
                      </button>
                      <button
                        type="button"
                        className="voice-gen-icon-bar-item"
                        title="미디어 (준비 중)"
                        onClick={() => setError('미디어 설정은 준비 중입니다.')}
                        data-testid="voice-gen-icon-media"
                      >
                        🖼
                      </button>
                      <button
                        type="button"
                        className="voice-gen-icon-bar-item"
                        title="배경음악 (준비 중)"
                        onClick={() => setError('배경음악 설정은 준비 중입니다.')}
                        data-testid="voice-gen-icon-music"
                      >
                        🎵
                      </button>
                      <button
                        type="button"
                        className="voice-gen-icon-bar-item"
                        title="자막 (준비 중)"
                        onClick={() => setError('자막 설정은 준비 중입니다.')}
                        data-testid="voice-gen-icon-captions"
                      >
                        CC
                      </button>
                    </nav>
                  </aside>
                  </div>
                </div>

                {(voiceGenAudioUrl || voiceGenSegmentUrls.length > 0) && (
                  <section className="voice-gen-result voice-gen-result--brainwave" aria-label="생성 결과">
                    <p className="voice-gen-result-success-message" role="status">
                      음성이 성공적으로 생성되었습니다. 추가로 맞춤 설정하거나 그대로 다운로드해 사용하세요.
                    </p>
                    <div className="voice-gen-playback-row">
                      <div className="voice-gen-playback">
                        {voiceGenAudioUrl && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary voice-gen-play-pause"
                              onClick={handleVoiceGenPlay}
                              data-testid="voice-gen-play"
                              aria-label="재생"
                            >
                              ▶
                            </button>
                            <div className="voice-gen-waveform-placeholder" aria-hidden>
                              <audio
                                ref={voiceGenAudioRef}
                                src={voiceGenAudioUrl}
                                controls
                                className="voice-gen-audio-native"
                                data-testid="voice-gen-audio"
                              />
                            </div>
                          </>
                        )}
                        {voiceGenSegmentUrls.length > 0 && !voiceGenAudioUrl && (
                          <span className="voice-gen-segments-label">
                            구간별 오디오 {voiceGenSegmentUrls.length}개 (순차 재생)
                          </span>
                        )}
                        {voiceGenSegmentUrls.length > 0 && !voiceGenAudioUrl && (
                          <button
                            className="btn btn-secondary"
                            onClick={handleVoiceGenPlay}
                            data-testid="voice-gen-play"
                          >
                            ▶ 재생{voiceGenSegmentUrls.length > 1 ? ' (구간 순차)' : ''}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="voice-gen-result-actions">
                      {voiceGenAudioUrl && (
                        <button
                          type="button"
                          className="btn btn-primary voice-gen-export-btn"
                          onClick={() => downloadBlobUrl(voiceGenAudioUrl, 'tts-output.mp3')}
                          aria-label="내보내기 (다운로드)"
                          data-testid="voice-gen-download"
                          title="내보내기"
                        >
                          <span className="voice-gen-btn-icon" aria-hidden>⬆</span>
                          내보내기
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary voice-gen-edit-btn"
                        onClick={() => document.getElementById('voice-gen-script')?.focus()}
                        aria-label="대본 편집"
                        data-testid="voice-gen-edit-script"
                        title="대본 편집"
                      >
                        <span className="voice-gen-btn-icon" aria-hidden>✎</span>
                        편집
                      </button>
                      {voiceGenSegmentUrls.length > 0 && !voiceGenAudioUrl && (
                        <span className="voice-gen-segment-downloads">
                          {voiceGenSegmentUrls.map((url, i) => (
                            <button
                              key={`segment-download-${i}`}
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => downloadBlobUrl(url, `tts-segment-${i + 1}.mp3`)}
                              aria-label={`구간 ${i + 1} 오디오 다운로드`}
                              data-testid={`voice-gen-download-segment-${i + 1}`}
                            >
                              구간 {i + 1} 다운로드
                            </button>
                          ))}
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary voice-gen-clear-btn"
                        onClick={() => {
                          setVoiceGenAudioUrl(null);
                          setVoiceGenSegmentUrls([]);
                        }}
                        aria-label="생성된 오디오 지우기"
                        data-testid="voice-gen-clear"
                      >
                        오디오 지우기
                      </button>
                    </div>
                  </section>
                )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeaturesPanel;

