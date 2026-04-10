/**
 * 전역 타입 정의
 * 
 * Task-F1: 코드 품질 개선 - 타입 안정성
 */

import type { PipelineMessageExtras } from '../utils/chatInputUtils';

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  intensity: number;
  keywords: string[];
}

export interface IntentAnalysis {
  intent: string;
  confidence: number;
  context: string;
  entities: string[];
}

export interface AnalysisData {
  emotion_analysis: EmotionAnalysis;
  intent_analysis: IntentAnalysis;
  success: boolean;
  response: string;
  response_time: number;
  session_id: string;
  timestamp: string;
  type: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  analysis: AnalysisData | null;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  /** Genspark Q→A 파이프라인 메타(SSE 종료 metadata 등) — ModernChatInterface·MessageItem */
  pipelineExtras?: PipelineMessageExtras;
}

export interface ChatAPIRequest {
  message: string;
  /** basic | enhanced | ultimate. 미지정 시 백엔드 기본값 enhanced */
  quality?: string;
  session_id: string;
  /** 통합 대화·Q→A·Genspark context (main_server / unified_chat) */
  context?: Record<string, unknown>;
}

export interface ChatAPIResponse {
  success: boolean;
  response?: string;
  error?: string;
  emotion_analysis?: EmotionAnalysis;
  intent_analysis?: IntentAnalysis;
  response_time?: number;
  session_id?: string;
  timestamp?: string;
  type?: string;
  /** 비스트리밍 응답에 파이프라인 메타(예: generation_phase)가 실릴 때 UI 단계 표시용 */
  metadata?: Record<string, unknown>;
}

export type ChatMode = 'chat' | 'coding' | 'analysis' | 'monitoring' | 'writing' | 'notebook';

