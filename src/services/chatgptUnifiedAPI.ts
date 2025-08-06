// ChatGPT 스타일 통합 대화형 시스템 API 서비스
const CHATGPT_UNIFIED_API_BASE = 'http://localhost:8008';

export interface ChatMessageCreate {
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type?: string;
  metadata?: Record<string, any>;
}

export interface ChatSessionCreate {
  session_name?: string;
}

export interface ContentGenerationRequest {
  session_id: string;
  content_type: string;
  title?: string;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface AnalysisRequest {
  session_id: string;
  analysis_type: string;
  data?: string;
  parameters?: Record<string, any>;
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
  metadata: Record<string, any>;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  session_id: string;
  content_type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  session_id: string;
  analysis_type: string;
  result_data: Record<string, any>;
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
  const response = await fetch(`${CHATGPT_UNIFIED_API_BASE}${endpoint}`, {
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
    return apiCall('/api/status');
  }

  // 지원하는 기능 조회
  static async getSupportedFeatures(): Promise<SupportedFeatures> {
    return apiCall('/api/features');
  }

  // 대화 세션 생성
  static async createSession(session: ChatSessionCreate): Promise<{
    success: boolean;
    session_id: string;
    message: string;
  }> {
    return apiCall('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  // 모든 대화 세션 조회
  static async getAllSessions(): Promise<{
    success: boolean;
    sessions: ChatSession[];
  }> {
    return apiCall('/api/sessions');
  }

  // 특정 대화 세션 조회
  static async getSession(sessionId: string): Promise<{
    success: boolean;
    session?: ChatSession;
    error?: string;
  }> {
    return apiCall(`/api/sessions/${sessionId}`);
  }

  // 메시지 전송 및 응답
  static async sendMessage(sessionId: string, message: ChatMessageCreate): Promise<{
    success: boolean;
    response?: {
      content: string;
      message_type: string;
      metadata: Record<string, any>;
    };
    error?: string;
  }> {
    return apiCall(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // 콘텐츠 생성
  static async generateContent(request: ContentGenerationRequest): Promise<{
    success: boolean;
    content_id?: string;
    content?: string;
    content_type?: string;
    metadata?: Record<string, any>;
    error?: string;
  }> {
    return apiCall('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 분석 수행
  static async performAnalysis(request: AnalysisRequest): Promise<{
    success: boolean;
    analysis_id?: string;
    analysis_type?: string;
    result?: Record<string, any>;
    summary?: string;
    error?: string;
  }> {
    return apiCall('/api/analysis/perform', {
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
    return apiCall('/api/test');
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