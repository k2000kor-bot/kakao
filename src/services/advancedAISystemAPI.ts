// 고도화된 AI 시스템 API 서비스
const ADVANCED_AI_API_BASE = 'http://localhost:8003';

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
  context_data: Record<string, any>;
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
    const response = await fetch(`${ADVANCED_AI_API_BASE}${endpoint}`, {
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

// 고도화된 AI 시스템 API 클래스
export class AdvancedAISystemAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall('/api/status');
  }

  // 고급 메시지 생성
  static async generateAdvancedMessage(request: AdvancedMessageRequest): Promise<{ success: boolean; message: AdvancedGeneratedMessage }> {
    return apiCall('/api/generate-advanced-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 감정 분석
  static async analyzeEmotion(request: EmotionAnalysisRequest): Promise<{ success: boolean; analysis: any }> {
    return apiCall('/api/analyze-emotion', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 패턴 분석
  static async analyzePatterns(request: PatternAnalysisRequest): Promise<{ success: boolean; analysis: any }> {
    return apiCall('/api/analyze-patterns', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 행동 예측
  static async predictBehavior(request: PredictionRequest): Promise<{ success: boolean; prediction: any }> {
    return apiCall('/api/predict-behavior', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 성능 메트릭 조회
  static async getPerformanceMetrics(userId: string): Promise<{ success: boolean; metrics: any }> {
    return apiCall(`/api/performance-metrics/${userId}`);
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch (error) {
      console.error('서버 연결 실패:', error);
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
      console.error('고급 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 감정 분석
  analyzeEmotion: async (request: EmotionAnalysisRequest) => {
    try {
      const response = await AdvancedAISystemAPI.analyzeEmotion(request);
      return response.analysis;
    } catch (error) {
      console.error('감정 분석 실패:', error);
      throw error;
    }
  },

  // 패턴 분석
  analyzePatterns: async (request: PatternAnalysisRequest) => {
    try {
      const response = await AdvancedAISystemAPI.analyzePatterns(request);
      return response.analysis;
    } catch (error) {
      console.error('패턴 분석 실패:', error);
      throw error;
    }
  },

  // 행동 예측
  predictBehavior: async (request: PredictionRequest) => {
    try {
      const response = await AdvancedAISystemAPI.predictBehavior(request);
      return response.prediction;
    } catch (error) {
      console.error('행동 예측 실패:', error);
      throw error;
    }
  },

  // 성능 메트릭 조회
  getPerformanceMetrics: async (userId: string) => {
    try {
      const response = await AdvancedAISystemAPI.getPerformanceMetrics(userId);
      return response.metrics;
    } catch (error) {
      console.error('성능 메트릭 조회 실패:', error);
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await AdvancedAISystemAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      return false;
    }
  },

  // 테스트 엔드포인트
  testEndpoint: async () => {
    try {
      const response = await apiCall('/api/test');
      return response;
    } catch (error) {
      console.error('테스트 엔드포인트 실패:', error);
      throw error;
    }
  },
};

export default AdvancedAISystemAPI; 