/**
 * 고급 API 서비스
 * 음성 인식, 이미지 분석, 예측 분석 기능 제공
 */

import axios, { AxiosInstance } from 'axios';
import errorHandler from '../utils/errorHandler';
import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 타입 정의
export interface VoiceRecognitionRequest {
  session_id?: string;
  language?: 'ko' | 'en' | 'ja' | 'zh';
}

export interface VoiceRecognitionResponse {
  status: 'success' | 'error';
  message?: string;
  session_id?: string;
  duration_seconds?: number;
  timestamp: string;
}

export interface VoiceResultsResponse {
  status: 'success' | 'error';
  session_id?: string;
  session_status?: string;
  results?: any[];
  language?: string;
  started_at?: string;
  sessions?: Record<string, any>;
  total_sessions?: number;
  timestamp: string;
}

export interface ImageAnalysisRequest {
  image_data: string; // Base64 encoded image
  analysis_type?: 'comprehensive' | 'object' | 'ocr' | 'emotion' | 'color';
}

export interface ImageAnalysisResponse {
  status: 'success' | 'error';
  message?: string;
  analysis_id?: string;
  analysis?: {
    image_info: {
      width: number;
      height: number;
      format: string;
      mode: string;
      size_bytes: number;
      aspect_ratio: number;
    };
    analysis_type: string;
    object_detection?: {
      detected_objects: Array<{
        name: string;
        confidence: number;
        bbox: number[];
      }>;
      total_objects: number;
    };
    ocr_results?: {
      extracted_text: string;
      text_regions: Array<{
        text: string;
        confidence: number;
        bbox: number[];
      }>;
      language: string;
    };
    emotion_analysis?: {
      primary_emotion: string;
      emotions: {
        positive: number;
        neutral: number;
        negative: number;
      };
      confidence: number;
    };
    color_analysis?: {
      dominant_colors: Array<{
        color: string;
        count: number;
        percentage: number;
      }>;
    };
    timestamp: string;
  };
}

export interface UserActivityPredictionRequest {
  user_id: string;
  time_horizon?: '1h' | '6h' | '24h' | '7d';
}

export interface UserActivityPredictionResponse {
  status: 'success' | 'error';
  message?: string;
  prediction?: {
    user_id: string;
    time_horizon: string;
    predicted_activities: Array<{
      activity: string;
      probability: number;
      expected_time: string;
      confidence: number;
    }>;
    next_likely_action: {
      activity: string;
      probability: number;
      expected_time: string;
      confidence: number;
    };
    activity_patterns: {
      peak_hours: number[];
      is_currently_peak: boolean;
      average_activity_level: string;
    };
    confidence: number;
    timestamp: string;
  };
}

export interface MessageQualityPredictionRequest {
  message_content: string;
  message_type?: 'question' | 'statement' | 'command' | 'general';
  context?: Record<string, any>;
}

export interface MessageQualityPredictionResponse {
  status: 'success' | 'error';
  message?: string;
  quality_analysis?: {
    overall_score: number;
    scores: {
      clarity: number;
      completeness: number;
      relevance: number;
      tone_appropriateness: number;
    };
    message_metrics: {
      length: number;
      word_count: number;
      has_question: boolean;
      has_emotion: boolean;
    };
    quality_level: 'excellent' | 'good' | 'fair' | 'poor';
    suggestions: string[];
    predicted_effectiveness: number;
    timestamp: string;
  };
}

export interface SystemPerformancePredictionRequest {
  time_horizon?: '15m' | '1h' | '6h' | '24h' | '7d';
  include_trends?: boolean;
}

export interface SystemPerformancePredictionResponse {
  status: 'success' | 'error';
  message?: string;
  warning?: string;
  performance_prediction?: {
    current_metrics: {
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
    };
    predicted_metrics: {
      cpu_usage: number;
      memory_usage: number;
      response_time_ms: number;
      throughput: number;
    };
    trends?: {
      cpu_trend: string;
      memory_trend: string;
      load_trend: string;
    };
    prediction_horizon: string;
    confidence: number;
    alerts: Array<{
      level: 'warning' | 'critical';
      type: string;
      message: string;
      recommendation: string;
    }>;
    recommendations: string[];
    timestamp: string;
  };
}

export interface PredictionSummaryResponse {
  status: 'success' | 'error';
  message?: string;
  summary?: {
    total_predictions: number;
    accuracy_rate: number;
    active_models: number;
    last_updated: string;
    predictions_by_type: {
      user_activity: number;
      message_quality: number;
      system_performance: number;
    };
    accuracy_by_type: {
      user_activity: number;
      message_quality: number;
      system_performance: number;
    };
    recent_activity: {
      last_hour: number;
      last_24_hours: number;
    };
    quality_insights: Array<{
      metric: string;
      value: number;
      trend: string;
    }>;
    model_status: {
      user_activity: string;
      message_quality: string;
      system_performance: string;
    };
  };
}

class AdvancedAPIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.api.interceptors.request.use(
      (config) => {
        errorLogger.info(`[AdvancedAPI] ${config.method?.toUpperCase()} ${config.url}`, {
          component: 'AdvancedAPIService',
          action: 'request',
          method: config.method,
          url: config.url,
        });
        return config;
      },
      (error: unknown) => {
        errorLogger.error('[AdvancedAPI] Request Error', error instanceof Error ? error : new Error(String(error)), {
          component: 'AdvancedAPIService',
          action: 'request',
        });
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.api.interceptors.response.use(
      (response) => {
        errorLogger.info(`[AdvancedAPI] Response: ${response.status} ${response.config.url}`, {
          component: 'AdvancedAPIService',
          action: 'response',
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: unknown) => {
        errorLogger.error('[AdvancedAPI] Response Error', error instanceof Error ? error : new Error(String(error)), {
          component: 'AdvancedAPIService',
          action: 'response',
        });
        return Promise.reject(error);
      }
    );
  }

  // ==================== 음성 인식 API ====================

  /**
   * 음성 인식 시작
   */
  async startVoiceRecognition(
    request: VoiceRecognitionRequest
  ): Promise<VoiceRecognitionResponse> {
    try {
      const response = await this.api.post<VoiceRecognitionResponse>(
        '/api/v7/voice/start-recognition',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('음성 인식 시작 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'startVoiceRecognition',
      });
      const message = errorHandler.handleAPIError(error as any, '/api/v7/voice/start-recognition');
      throw new Error(message);
    }
  }

  /**
   * 음성 인식 중지
   */
  async stopVoiceRecognition(
    request: VoiceRecognitionRequest
  ): Promise<VoiceRecognitionResponse> {
    try {
      const response = await this.api.post<VoiceRecognitionResponse>(
        '/api/v7/voice/stop-recognition',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('음성 인식 중지 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'stopVoiceRecognition',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '음성 인식 중지 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 음성 인식 결과 조회
   */
  async getVoiceRecognitionResults(
    sessionId?: string
  ): Promise<VoiceResultsResponse> {
    try {
      const params = sessionId ? { session_id: sessionId } : {};
      const response = await this.api.get<VoiceResultsResponse>(
        '/api/v7/voice/results',
        { params }
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('음성 인식 결과 조회 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'getVoiceRecognitionResults',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '음성 인식 결과 조회 중 오류가 발생했습니다.'
      );
    }
  }

  // ==================== 이미지 분석 API ====================

  /**
   * Base64 이미지 분석
   */
  async analyzeBase64Image(
    request: ImageAnalysisRequest
  ): Promise<ImageAnalysisResponse> {
    try {
      const response = await this.api.post<ImageAnalysisResponse>(
        '/api/v7/image/analyze-base64',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('이미지 분석 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'analyzeBase64Image',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '이미지 분석 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 파일을 Base64로 변환하여 이미지 분석
   */
  async analyzeImageFile(
    file: File,
    analysisType: ImageAnalysisRequest['analysis_type'] = 'comprehensive'
  ): Promise<ImageAnalysisResponse> {
    try {
      // 파일을 Base64로 변환
      const base64 = await this.fileToBase64(file);
      
      return this.analyzeBase64Image({
        image_data: base64,
        analysis_type: analysisType,
      });
    } catch (error: unknown) {
      errorLogger.error('이미지 파일 분석 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'analyzeImageFile',
      });
      const err = error as Error;
      throw new Error(
        err.message || '이미지 파일 분석 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 파일을 Base64 문자열로 변환
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, 부분 제거
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==================== 예측 분석 API ====================

  /**
   * 사용자 활동 예측
   */
  async predictUserActivity(
    request: UserActivityPredictionRequest
  ): Promise<UserActivityPredictionResponse> {
    try {
      const response = await this.api.post<UserActivityPredictionResponse>(
        '/api/v7/predict/user-activity',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('사용자 활동 예측 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'predictUserActivity',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '사용자 활동 예측 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 메시지 품질 예측
   */
  async predictMessageQuality(
    request: MessageQualityPredictionRequest
  ): Promise<MessageQualityPredictionResponse> {
    try {
      const response = await this.api.post<MessageQualityPredictionResponse>(
        '/api/v7/predict/message-quality',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('메시지 품질 예측 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'predictMessageQuality',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '메시지 품질 예측 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 시스템 성능 예측
   */
  async predictSystemPerformance(
    request: SystemPerformancePredictionRequest = {}
  ): Promise<SystemPerformancePredictionResponse> {
    try {
      const response = await this.api.post<SystemPerformancePredictionResponse>(
        '/api/v7/predict/system-performance',
        request
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('시스템 성능 예측 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'predictSystemPerformance',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '시스템 성능 예측 중 오류가 발생했습니다.'
      );
    }
  }

  /**
   * 예측 요약 조회
   */
  async getPredictionSummary(): Promise<PredictionSummaryResponse> {
    try {
      const response = await this.api.get<PredictionSummaryResponse>(
        '/api/v7/predict/summary'
      );
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('예측 요약 조회 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'getPredictionSummary',
      });
      const err = error as any;
      throw new Error(
        err.response?.data?.message || '예측 요약 조회 중 오류가 발생했습니다.'
      );
    }
  }

  // ==================== 헬스 체크 ====================

  /**
   * 서버 상태 확인
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error: unknown) {
      errorLogger.error('헬스 체크 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedAPIService',
        action: 'healthCheck',
      });
      throw new Error('서버 상태 확인 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스 export
export const advancedAPIService = new AdvancedAPIService();
export default advancedAPIService;

