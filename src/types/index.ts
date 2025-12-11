/**
 * 전역 타입 정의
 * 
 * Task-F1: 코드 품질 개선 - 타입 안정성
 */

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
}

export interface ChatAPIRequest {
  message: string;
  session_id: string;
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
}

export type ChatMode = 'chat' | 'coding' | 'analysis' | 'monitoring' | 'writing' | 'notebook';

