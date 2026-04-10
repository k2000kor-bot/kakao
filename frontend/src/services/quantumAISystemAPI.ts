// 양자 AI 시스템 API 서비스 (통합 백엔드 main_server와 동일 오리진)
import {
  API_BASE_URL,
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  FALLBACK_API_ORIGIN,
  GENERATE_QUANTUM_MESSAGE_PATH,
  QUANTUM_ANALYSIS_PATH,
  QUANTUM_PREDICTION_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

const QUANTUM_AI_API_BASE = API_BASE_URL || FALLBACK_API_ORIGIN;

export interface QuantumMessageRequest {
  original_message: string;
  user_id: string;
  context?: string;
  recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
  quantum_analysis_enabled?: boolean;
  superposition_mode?: boolean;
  entanglement_analysis?: boolean;
}

export interface QuantumAnalysisRequest {
  messages: Array<{ content: string; sender: string; timestamp: string }>;
  user_id: string;
  analysis_dimensions?: string[];
}

export interface QuantumPredictionRequest {
  user_id: string;
  prediction_type: string;
  quantum_context: Record<string, unknown>;
}

export interface QuantumState {
  amplitude: string; // 복소수 문자열
  phase: number;
  probability: number;
  coherence: number;
}

export interface QuantumAnalytics {
  quantum_states: Record<string, QuantumState>;
  superposition_analysis: Record<string, unknown>;
  entanglement_metrics: {
    entanglement_score: number;
    correlation: number;
    nonlocality: number;
  };
  interference_patterns: Record<string, unknown>;
  quantum_predictions: {
    response_time?: {
      prediction_type: string;
      quantum_probability: number;
      uncertainty_principle: number;
      entanglement_boost: number;
      superposition_effect: unknown;
      quantum_advantage: number;
    };
    success_rate?: {
      prediction_type: string;
      quantum_probability: number;
      uncertainty_principle: number;
      entanglement_boost: number;
      superposition_effect: unknown;
      quantum_advantage: number;
    };
    complexity_prediction?: {
      prediction_type: string;
      quantum_probability: number;
      uncertainty_principle: number;
      entanglement_boost: number;
      superposition_effect: unknown;
      quantum_advantage: number;
    };
  };
  quantum_performance: {
    quantum_accuracy: number;
    coherence_score: number;
    entanglement_score: number;
    quantum_advantage: number;
    overall_quantum_performance: number;
  };
}

export interface QuantumGeneratedMessage {
  id: string;
  original_message: string;
  quantum_message: string;
  analytics: QuantumAnalytics;
  timestamp: string;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(joinApiHealthCheckUrl(QUANTUM_AI_API_BASE, endpoint), {
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
      component: 'quantumAISystemAPI',
      action: 'apiCall',
      endpoint,
      method: options?.method || 'GET',
    });
    throw error;
  }
};

// 양자 AI 시스템 API 클래스
export class QuantumAISystemAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall(API_STATUS_PATH);
  }

  // 양자 메시지 생성
  static async generateQuantumMessage(request: QuantumMessageRequest): Promise<{ success: boolean; message: QuantumGeneratedMessage }> {
    return apiCall(GENERATE_QUANTUM_MESSAGE_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 양자 분석
  static async quantumAnalysis(request: QuantumAnalysisRequest): Promise<{ success: boolean; analysis: unknown }> {
    return apiCall(QUANTUM_ANALYSIS_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 양자 예측
  static async quantumPrediction(request: QuantumPredictionRequest): Promise<{ success: boolean; prediction: unknown }> {
    return apiCall(QUANTUM_PREDICTION_PATH, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('서버 연결 실패', err, {
        component: 'quantumAISystemAPI',
        action: 'testConnection',
      });
      return false;
    }
  }
}

// 편의 함수들
export const quantumAISystemAPI = {
  // 양자 메시지 생성
  generateQuantum: async (request: QuantumMessageRequest) => {
    try {
      const response = await QuantumAISystemAPI.generateQuantumMessage(request);
      return response.message;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('양자 메시지 생성 실패', err, {
        component: 'quantumAISystemAPI',
        action: 'generateQuantum',
        userId: request.user_id,
      });
      throw error;
    }
  },

  // 양자 분석
  quantumAnalysis: async (request: QuantumAnalysisRequest) => {
    try {
      const response = await QuantumAISystemAPI.quantumAnalysis(request);
      return response.analysis;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('양자 분석 실패', err, {
        component: 'quantumAISystemAPI',
        action: 'quantumAnalysis',
        userId: request.user_id,
        messagesCount: request.messages?.length || 0,
      });
      throw error;
    }
  },

  // 양자 예측
  quantumPrediction: async (request: QuantumPredictionRequest) => {
    try {
      const response = await QuantumAISystemAPI.quantumPrediction(request);
      return response.prediction;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('양자 예측 실패', err, {
        component: 'quantumAISystemAPI',
        action: 'quantumPrediction',
        userId: request.user_id,
        predictionType: request.prediction_type,
      });
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await QuantumAISystemAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      const err = toError(error);
      errorLogger.error('서버 상태 확인 실패', err, {
        component: 'quantumAISystemAPI',
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
        component: 'quantumAISystemAPI',
        action: 'testEndpoint',
      });
      throw error;
    }
  },
};

export default QuantumAISystemAPI; 