// 고도화된 AI 시스템 API 서비스
import { errorLogger, toError } from '../utils/errorLogger';
import {
  ANALYZE_EMOTION_PATH,
  ANALYZE_PATTERNS_PATH,
  API_BASE_URL,
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  FALLBACK_API_ORIGIN,
  GENERATE_ADVANCED_MESSAGE_PATH,
  PREDICT_BEHAVIOR_PATH,
  USER_PERFORMANCE_METRICS_PATH_PREFIX,
  joinApiHealthCheckUrl,
} from '../config/api';

const ADVANCED_AI_API_BASE = API_BASE_URL || FALLBACK_API_ORIGIN;

export interface AdvancedMessageRequest {
  original_message: string;
  user_id: string;
  context?: string;
  recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
  learning_enabled?: boolean;
  prediction_enabled?: boolean;
}

export interface EmotionAnalysisRequest {
  messages: Array<{ content: string; sender: string; timestamp: string }>;
  user_id: string;
}

export interface PatternAnalysisRequest {
  conversation_data: Array<{ content: string; sender: string; timestamp: string }>;
  user_id: string;
}

export interface PredictionRequest {
  user_id: string;
  prediction_type: 'response_time' | 'success_rate' | 'conflict_probability';
  context_data: Record<string, unknown>;
}

export interface AdvancedAnalytics {
  emotion_analysis: {
    emotion_scores: Record<string, number>;
    sentiment_score: number;
    dominant_emotion: string;
    emotion_confidence: number;
    emotion_trend: {
      trend: string;
      volatility: number;
      average: number;
    };
    emotional_stability: number;
  };
  pattern_analysis: {
    pattern_frequency: Record<string, number>;
    dominant_pattern: string;
    pattern_effectiveness: number;
    conversation_style: string;
    interaction_patterns: {
      interaction_type: string;
      engagement_level: number;
      response_frequency: number;
      average_message_length: number;
    };
  };
  prediction_results: {
    response_time?: {
      prediction_type: string;
      predicted_value: number;
      confidence_score: number;
      historical_trend: number[];
      prediction_factors: Record<string, number>;
    };
    success_rate?: {
      prediction_type: string;
      predicted_value: number;
      confidence_score: number;
      historical_trend: number[];
      prediction_factors: Record<string, number>;
    };
    conflict_probability?: {
      prediction_type: string;
      predicted_value: number;
      confidence_score: number;
      historical_trend: number[];
      prediction_factors: Record<string, number>;
    };
  };
  learning_insights: {
    preferred_emotion: string;
    effective_patterns: string[];
    learning_recommendations: string[];
    improvement_areas: string[];
  };
  performance_metrics: {
    prediction_accuracy: number;
    emotion_recognition_accuracy: number;
    pattern_recognition_accuracy: number;
    overall_performance: number;
  };
}

export interface AdvancedGeneratedMessage {
  id: string;
  original_message: string;
  advanced_message: string;
  analytics: AdvancedAnalytics;
  timestamp: string;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(joinApiHealthCheckUrl(ADVANCED_AI_API_BASE, endpoint), {
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
      component: 'advancedAISystemAPI',
      action: 'apiCall',
      endpoint,
      method: options?.method || 'GET',
    });
    throw error;
  }
};

// 고도화된 AI 시스템 API 클래스
export class AdvancedAISystemAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall(API_STATUS_PATH);
  }

  // 고급 메시지 생성
  static async generateAdvancedMessage(request: AdvancedMessageRequest): Promise<{ success: boolean; message: AdvancedGeneratedMessage }> {
    return apiCall(GENERATE_ADVANCED_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 감정 분석
  static async analyzeEmotion(request: EmotionAnalysisRequest): Promise<{ success: boolean; analysis: unknown }> {
    return apiCall(ANALYZE_EMOTION_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 패턴 분석
  static async analyzePatterns(request: PatternAnalysisRequest): Promise<{ success: boolean; analysis: unknown }> {
    return apiCall(ANALYZE_PATTERNS_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 행동 예측
  static async predictBehavior(request: PredictionRequest): Promise<{ success: boolean; prediction: unknown }> {
    return apiCall(PREDICT_BEHAVIOR_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 성능 메트릭 조회
  static async getPerformanceMetrics(userId: string): Promise<{ success: boolean; metrics: unknown }> {
    return apiCall(`${USER_PERFORMANCE_METRICS_PATH_PREFIX}/${encodeURIComponent(userId)}`);
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('서버 연결 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'testConnection',
      });
      return false;
    }
  }
}

// 편의 함수들
export const advancedAISystemAPI = {
  // 고급 메시지 생성
  generateAdvanced: async (request: AdvancedMessageRequest) => {
    try {
      const response = await AdvancedAISystemAPI.generateAdvancedMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('고급 메시지 생성 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'generateAdvanced',
        userId: request.user_id,
      });
      throw error;
    }
  },

  // 감정 분석
  analyzeEmotion: async (request: EmotionAnalysisRequest) => {
    try {
      const response = await AdvancedAISystemAPI.analyzeEmotion(request);
      return response.analysis;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('감정 분석 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'analyzeEmotion',
        userId: request.user_id,
        messagesCount: request.messages?.length || 0,
      });
      throw error;
    }
  },

  // 패턴 분석
  analyzePatterns: async (request: PatternAnalysisRequest) => {
    try {
      const response = await AdvancedAISystemAPI.analyzePatterns(request);
      return response.analysis;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('패턴 분석 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'analyzePatterns',
        userId: request.user_id,
        conversationDataLength: request.conversation_data?.length || 0,
      });
      throw error;
    }
  },

  // 행동 예측
  predictBehavior: async (request: PredictionRequest) => {
    try {
      const response = await AdvancedAISystemAPI.predictBehavior(request);
      return response.prediction;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('행동 예측 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'predictBehavior',
        userId: request.user_id,
        predictionType: request.prediction_type,
      });
      throw error;
    }
  },

  // 성능 메트릭 조회
  getPerformanceMetrics: async (userId: string) => {
    try {
      const response = await AdvancedAISystemAPI.getPerformanceMetrics(userId);
      return response.metrics;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('성능 메트릭 조회 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'getPerformanceMetrics',
        userId,
      });
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await AdvancedAISystemAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      const err = toError(error);
      errorLogger.error('서버 상태 확인 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'checkStatus',
      });
      return false;
    }
  },

  // 테스트 엔드포인트
  testEndpoint: async () => {
    try {
      const response = await apiCall(API_SMOKE_TEST_PATH);
      return response;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('테스트 엔드포인트 실패', err, {
        component: 'advancedAISystemAPI',
        action: 'testEndpoint',
      });
      throw error;
    }
  },
};

export default AdvancedAISystemAPI; 