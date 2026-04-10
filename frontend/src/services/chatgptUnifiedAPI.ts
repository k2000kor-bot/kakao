// ChatGPT 스타일 통합 대화형 시스템 API 서비스
import {
  ANALYSIS_PERFORM_PATH,
  API_BASE_URL,
  API_FEATURES_PATH,
  API_SESSION_MESSAGES_SEGMENT,
  API_SESSIONS_LIST_PATH,
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  CONTENT_GENERATE_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../config/api';

const CHATGPT_UNIFIED_API_BASE = API_BASE_URL || FALLBACK_API_ORIGIN;

export interface ChatMessageCreate {
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatSessionCreate {
  session_name?: string;
}

export interface ContentGenerationRequest {
  session_id: string;
  content_type: string;
  title?: string;
  prompt: string;
  parameters?: Record<string, unknown>;
}

export interface AnalysisRequest {
  session_id: string;
  analysis_type: string;
  data?: string;
  parameters?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  session_name: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  session_id: string;
  content_type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  session_id: string;
  analysis_type: string;
  result_data: Record<string, unknown>;
  summary: string;
  created_at: string;
}

export interface SystemStatus {
  status: string;
  services: Record<string, string>;
  timestamp: string;
}

export interface SupportedFeatures {
  success: boolean;
  features: Record<string, string[]>;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(joinApiHealthCheckUrl(CHATGPT_UNIFIED_API_BASE, endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// ChatGPT 스타일 통합 대화형 시스템 API 클래스
export class ChatGPTUnifiedAPI {
  // 시스템 상태 확인
  static async getStatus(): Promise<SystemStatus> {
    return apiCall(API_STATUS_PATH);
  }

  // 지원하는 기능 조회
  static async getSupportedFeatures(): Promise<SupportedFeatures> {
    return apiCall(API_FEATURES_PATH);
  }

  // 대화 세션 생성
  static async createSession(session: ChatSessionCreate): Promise<{
    success: boolean;
    session_id: string;
    message: string;
  }> {
    return apiCall(API_SESSIONS_LIST_PATH, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  // 모든 대화 세션 조회
  static async getAllSessions(): Promise<{
    success: boolean;
    sessions: ChatSession[];
  }> {
    return apiCall(API_SESSIONS_LIST_PATH);
  }

  // 특정 대화 세션 조회
  static async getSession(sessionId: string): Promise<{
    success: boolean;
    session?: ChatSession;
    error?: string;
  }> {
    return apiCall(`${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}`);
  }

  // 메시지 전송 및 응답
  static async sendMessage(sessionId: string, message: ChatMessageCreate): Promise<{
    success: boolean;
    response?: {
      content: string;
      message_type: string;
      metadata: Record<string, unknown>;
    };
    error?: string;
  }> {
    return apiCall(
      `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_MESSAGES_SEGMENT}`,
      {
        method: 'POST',
        body: JSON.stringify(message),
      },
    );
  }

  // 콘텐츠 생성
  static async generateContent(request: ContentGenerationRequest): Promise<{
    success: boolean;
    content_id?: string;
    content?: string;
    content_type?: string;
    metadata?: Record<string, unknown>;
    error?: string;
  }> {
    return apiCall(CONTENT_GENERATE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 분석 수행
  static async performAnalysis(request: AnalysisRequest): Promise<{
    success: boolean;
    analysis_id?: string;
    analysis_type?: string;
    result?: Record<string, unknown>;
    summary?: string;
    error?: string;
  }> {
    return apiCall(ANALYSIS_PERFORM_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 테스트 엔드포인트
  static async test(): Promise<{
    message: string;
    features: string[];
    timestamp: string;
  }> {
    return apiCall(API_SMOKE_TEST_PATH);
  }
}

// 편의 함수들
export const chatgptUnifiedAPI = {
  getStatus: ChatGPTUnifiedAPI.getStatus,
  getSupportedFeatures: ChatGPTUnifiedAPI.getSupportedFeatures,
  createSession: ChatGPTUnifiedAPI.createSession,
  getAllSessions: ChatGPTUnifiedAPI.getAllSessions,
  getSession: ChatGPTUnifiedAPI.getSession,
  sendMessage: ChatGPTUnifiedAPI.sendMessage,
  generateContent: ChatGPTUnifiedAPI.generateContent,
  performAnalysis: ChatGPTUnifiedAPI.performAnalysis,
  test: ChatGPTUnifiedAPI.test,
};

export default ChatGPTUnifiedAPI; 