// 통합 메시지 시스템 API 서비스
import {
  ANALYZE_MESSAGES_PATH,
  API_HEALTH_PATH,
  API_STATUS_PATH,
  GENERATE_ADVANCED_MESSAGE_PATH,
  GENERATE_CONTEXTUAL_MESSAGE_PATH,
  GENERATE_FORMATTED_MESSAGE_PATH,
  GENERATE_KAKAO_MESSAGE_PATH,
  MESSAGE_FORMATS_PATH,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

const UNIFIED_MESSAGE_API_BASE = resolveApiBaseUrl();

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
  emotion_analysis?: unknown;
  impact_prediction?: number;
}

export interface MessageAnalysisResult {
  total_messages: number;
  analysis_type: string;
  timestamp: string;
  emotion_analysis?: unknown;
  sentiment_analysis?: unknown;
  comprehensive_analysis?: unknown;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(joinApiHealthCheckUrl(UNIFIED_MESSAGE_API_BASE, endpoint), {
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
    const err = toError(error);
    errorLogger.error('API 호출 오류', err, {
      component: 'unifiedMessageAPI',
      action: 'apiCall',
      endpoint,
      method: options?.method || 'GET',
    });
    throw error;
  }
};

// 통합 메시지 시스템 API 클래스
export class UnifiedMessageAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall(API_STATUS_PATH);
  }

  // 헬스 체크
  static async healthCheck() {
    return apiCall(API_HEALTH_PATH);
  }

  // 메시지 형식 목록 조회
  static async getMessageFormats(): Promise<{ success: boolean; formats: MessageFormat }> {
    return apiCall(MESSAGE_FORMATS_PATH);
  }

  // 형식별 메시지 생성
  static async generateFormattedMessage(request: MessageFormatRequest): Promise<{ success: boolean; message: GeneratedMessage }> {
    return apiCall(GENERATE_FORMATTED_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 고급 메시지 생성
  static async generateAdvancedMessage(request: AdvancedMessageRequest): Promise<{ success: boolean; message: unknown }> {
    return apiCall(GENERATE_ADVANCED_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 맥락 기반 메시지 생성
  static async generateContextualMessage(request: ContextualMessageRequest): Promise<{ success: boolean; message: unknown }> {
    return apiCall(GENERATE_CONTEXTUAL_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 카카오톡 메시지 생성
  static async generateKakaoMessage(request: KakaoMessageRequest): Promise<{ success: boolean; message: unknown }> {
    return apiCall(GENERATE_KAKAO_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 메시지 분석
  static async analyzeMessages(request: MessageAnalysisRequest): Promise<{ success: boolean; analysis: MessageAnalysisResult }> {
    return apiCall(ANALYZE_MESSAGES_PATH, {
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
      const err = toError(error);
      errorLogger.error('서버 연결 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'testConnection',
      });
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
      const err = toError(error);
      errorLogger.error('메시지 형식 조회 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'getFormats',
      });
      return {};
    }
  },

  // 형식별 메시지 생성
  generateFormatted: async (formatType: string, originalMessage: string, context: string = '', recentMessages: unknown[] = []) => {
    try {
      const request: MessageFormatRequest = {
        format_type: formatType,
        original_message: originalMessage,
        context,
        recent_messages: recentMessages as Array<{ content: string; sender: string; timestamp: string }>,
      };
      
      const response = await UnifiedMessageAPI.generateFormattedMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('형식별 메시지 생성 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'generateFormatted',
        formatType,
        originalMessageLength: originalMessage.length,
      });
      throw error;
    }
  },

  // 고급 메시지 생성
  generateAdvanced: async (request: AdvancedMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateAdvancedMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('고급 메시지 생성 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'generateAdvanced',
        chatRoomId: request.chat_room_id,
        userId: request.user_id,
      });
      throw error;
    }
  },

  // 맥락 기반 메시지 생성
  generateContextual: async (request: ContextualMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateContextualMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('맥락 기반 메시지 생성 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'generateContextual',
        chatRoomId: request.chat_room_id,
        targetPerson: request.target_person,
      });
      throw error;
    }
  },

  // 카카오톡 메시지 생성
  generateKakao: async (request: KakaoMessageRequest) => {
    try {
      const response = await UnifiedMessageAPI.generateKakaoMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('카카오톡 메시지 생성 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'generateKakao',
        messageType: request.message_type,
        chatRoomId: request.chat_room_id,
      });
      throw error;
    }
  },

  // 메시지 분석
  analyze: async (request: MessageAnalysisRequest) => {
    try {
      const response = await UnifiedMessageAPI.analyzeMessages(request);
      return response.analysis;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('메시지 분석 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'analyze',
        messagesCount: request.messages?.length || 0,
      });
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await UnifiedMessageAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      const err = toError(error);
      errorLogger.error('서버 상태 확인 실패', err, {
        component: 'unifiedMessageAPI',
        action: 'checkStatus',
      });
      return false;
    }
  },
};

export default UnifiedMessageAPI; 