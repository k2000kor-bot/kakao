// 통합 메시지 시스템 API 서비스
const UNIFIED_MESSAGE_API_BASE = 'http://localhost:8001';

export interface MessageFormatRequest {
  format_type: string;
  original_message: string;
  context?: string;
  recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
}

export interface AdvancedMessageRequest {
  original_message: string;
  context: string;
  sender: string;
  chat_room_id: string;
  target_audience: string[];
  context_type: string;
  user_id: string;
  emotion_context?: string;
  style?: string;
  recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
}

export interface ContextualMessageRequest {
  chat_room_id: string;
  target_person: string;
  message_intent?: string;
  context_messages?: Array<{ content: string; sender: string; timestamp: string }>;
  tone_preference?: string;
  length_preference?: string;
  formality_level?: string;
}

export interface KakaoMessageRequest {
  content: string;
  chat_room_id: string;
  sender: string;
  message_type?: string;
  context?: string;
}

export interface MessageAnalysisRequest {
  messages: Array<{ id: string; content: string; sender: string; timestamp: string }>;
  analysis_type?: string;
  include_emotion?: boolean;
  include_sentiment?: boolean;
}

export interface MessageFormat {
  [key: string]: string;
}

export interface GeneratedMessage {
  id: string;
  original_message?: string;
  format_type?: string;
  generated_message: string;
  timestamp: string;
  confidence_score?: number;
  emotion_analysis?: any;
  impact_prediction?: number;
}

export interface MessageAnalysisResult {
  total_messages: number;
  analysis_type: string;
  timestamp: string;
  emotion_analysis?: any;
  sentiment_analysis?: any;
  comprehensive_analysis?: any;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${UNIFIED_MESSAGE_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 통합 메시지 시스템 API 클래스
export class UnifiedMessageAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall('/api/status');
  }

  // 헬스 체크
  static async healthCheck() {
    return apiCall('/api/health');
  }

  // 메시지 형식 목록 조회
  static async getMessageFormats(): Promise<{ success: boolean; formats: MessageFormat }> {
    return apiCall('/api/message-formats');
  }

  // 형식별 메시지 생성
  static async generateFormattedMessage(request: MessageFormatRequest): Promise<{ success: boolean; message: GeneratedMessage }> {
    return apiCall('/api/generate-formatted-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 고급 메시지 생성
  static async generateAdvancedMessage(request: AdvancedMessageRequest): Promise<{ success: boolean; message: any }> {
    return apiCall('/api/generate-advanced-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 맥락 기반 메시지 생성
  static async generateContextualMessage(request: ContextualMessageRequest): Promise<{ success: boolean; message: any }> {
    return apiCall('/api/generate-contextual-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 카카오톡 메시지 생성
  static async generateKakaoMessage(request: KakaoMessageRequest): Promise<{ success: boolean; message: any }> {
    return apiCall('/api/generate-kakao-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 메시지 분석
  static async analyzeMessages(request: MessageAnalysisRequest): Promise<{ success: boolean; analysis: MessageAnalysisResult }> {
    return apiCall('/api/analyze-messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('서버 연결 실패:', error);
      return false;
    }
  }
}

// 편의 함수들
export const messageAPI = {
  // 메시지 형식 가져오기
  getFormats: async () => {
    try {
      const response = await UnifiedMessageAPI.getMessageFormats();
      return response.formats;
    } catch (error) {
      console.error('메시지 형식 조회 실패:', error);
      return {};
    }
  },

  // 형식별 메시지 생성
  generateFormatted: async (formatType: string, originalMessage: string, context: string = '', recentMessages: any[] = []) => {
    try {
      const request: MessageFormatRequest = {
        format_type: formatType,
        original_message: originalMessage,
        context,
        recent_messages: recentMessages,
      };
      
      const response = await UnifiedMessageAPI.generateFormattedMessage(request);
      return response.message;
    } catch (error) {
      console.error('형식별 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 고급 메시지 생성
  generateAdvanced: async (request: AdvancedMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateAdvancedMessage(request);
      return response.message;
    } catch (error) {
      console.error('고급 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 맥락 기반 메시지 생성
  generateContextual: async (request: ContextualMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateContextualMessage(request);
      return response.message;
    } catch (error) {
      console.error('맥락 기반 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 카카오톡 메시지 생성
  generateKakao: async (request: KakaoMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateKakaoMessage(request);
      return response.message;
    } catch (error) {
      console.error('카카오톡 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 메시지 분석
  analyze: async (request: MessageAnalysisRequest) => {
    try {
      const response = await UnifiedMessageAPI.analyzeMessages(request);
      return response.analysis;
    } catch (error) {
      console.error('메시지 분석 실패:', error);
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await UnifiedMessageAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      return false;
    }
  },
};

export default UnifiedMessageAPI; 