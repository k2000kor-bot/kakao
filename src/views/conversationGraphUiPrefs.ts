import type { KakaoTalkSamplePreset } from '../utils/kakaoTalkMessageSampling';
import type { ConversationGraphLayoutMode } from './conversationGraphForceLayout';
import type { ExpertLayerId } from './conversationGraphExpertLayers';

export type ConversationGraphViewMode = 'graph' | 'matrix';

const STORAGE_KEY = 'corbu.conversationGraph.uiPrefs';

export interface ConversationGraphUiPrefs {
  excludeSystemMessages?: boolean;
  kakaoSamplePreset?: KakaoTalkSamplePreset;
  autoRequestAiNarrative?: boolean;
  autoGenerateAnswer?: boolean;
  useStreamAnswer?: boolean;
  /** 2-pass LLM(개요→보고서). 미설정 시 `REACT_APP_GRAPH_ANSWER_TWO_PASS` env */
  useTwoPassAnswer?: boolean;
  useServerAiAnalysis?: boolean;
  graphLayoutMode?: ConversationGraphLayoutMode;
  graphViewMode?: ConversationGraphViewMode;
  expertLayer?: ExpertLayerId;
}

function readRaw(): ConversationGraphUiPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ConversationGraphUiPrefs;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function loadConversationGraphUiPrefs(): ConversationGraphUiPrefs {
  return readRaw();
}

export function saveConversationGraphUiPrefs(patch: ConversationGraphUiPrefs): void {
  try {
    const next = { ...readRaw(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}
