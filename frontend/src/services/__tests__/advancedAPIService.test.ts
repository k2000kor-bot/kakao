/**
 * advancedAPIService 서비스 테스트
 * 고급 API 서비스 테스트 (음성 인식, 이미지 분석, 예측 분석)
 */
/* eslint-disable jest/no-conditional-expect */

import { File as NodeBufferFile } from 'buffer';
import axios from 'axios';

if (typeof globalThis.File === 'undefined') {
  (globalThis as unknown as { File: typeof NodeBufferFile }).File = NodeBufferFile;
}
import { errorLogger } from '../../utils/errorLogger';
import advancedAPIService from '../advancedAPIService';
import {
  API_HEALTH_PATH,
  API_QUERY_PARAM_SESSION_ID,
  API_V7_IMAGE_ANALYZE_BASE64_PATH,
  API_V7_VOICE_RESULTS_PATH,
  API_V7_VOICE_START_RECOGNITION_PATH,
  API_V7_VOICE_STOP_RECOGNITION_PATH,
} from '../../config/api';

// axios 모킹 (ESM 대응: requireActual 미사용, factory 내부에서 instance 정의)
jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    default: {
      create: jest.fn(() => mockAxiosInstance),
      get: jest.fn(),
      post: jest.fn(),
    },
    create: jest.fn(() => mockAxiosInstance),
    get: jest.fn(),
    post: jest.fn(),
  };
});

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// errorHandler 모킹
jest.mock('../../utils/errorHandler', () => ({
  __esModule: true,
  default: {
    handleAPIError: jest.fn((error, url) => `Error: ${url}`),
  },
}));

const mockAxiosInstance = (axios as unknown as { create: () => { post: jest.Mock; get: jest.Mock } }).create();

describe('advancedAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAPIService).toBeDefined();
    });
  });

  describe('startVoiceRecognition', () => {
    it('음성 인식을 시작할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        session_id: 'session-123',
        duration_seconds: 10,
        timestamp: new Date().toISOString(),
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.startVoiceRecognition({
        language: 'ko',
      });

      expect(result.status).toBe('success');
      expect(result.session_id).toBe('session-123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        API_V7_VOICE_START_RECOGNITION_PATH,
        { language: 'ko' }
      );
    });

    it('음성 인식 시작 실패 시 에러를 처리해야 함', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.startVoiceRecognition({ language: 'ko' })
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('stopVoiceRecognition', () => {
    it('음성 인식을 중지할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        session_id: 'session-123',
        timestamp: new Date().toISOString(),
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.stopVoiceRecognition({
        session_id: 'session-123',
      });

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        API_V7_VOICE_STOP_RECOGNITION_PATH,
        { session_id: 'session-123' }
      );
    });

    it('음성 인식 중지 실패 시 에러를 처리해야 함', async () => {
      const error = { response: { data: { message: 'Stop failed' } } };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.stopVoiceRecognition({ session_id: 'session-123' })
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('getVoiceRecognitionResults', () => {
    it('음성 인식 결과를 조회할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        session_id: 'session-123',
        results: ['결과 1', '결과 2'],
        timestamp: new Date().toISOString(),
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.getVoiceRecognitionResults('session-123');

      expect(result.status).toBe('success');
      expect(result.session_id).toBe('session-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(API_V7_VOICE_RESULTS_PATH, {
        params: { [API_QUERY_PARAM_SESSION_ID]: 'session-123' },
      });
    });

    it('세션 ID 없이 결과를 조회할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        total_sessions: 5,
        timestamp: new Date().toISOString(),
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.getVoiceRecognitionResults();

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        API_V7_VOICE_RESULTS_PATH,
        { params: {} }
      );
    });
  });

  describe('analyzeBase64Image', () => {
    it('Base64 이미지를 분석할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        analysis_id: 'analysis-123',
        analysis: {
          image_info: {
            width: 800,
            height: 600,
            format: 'jpeg',
            mode: 'RGB',
            size_bytes: 100000,
            aspect_ratio: 1.33,
          },
          analysis_type: 'comprehensive',
          object_detection: {
            detected_objects: [
              { name: 'person', confidence: 0.9, bbox: [10, 20, 100, 200] },
            ],
            total_objects: 1,
          },
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.analyzeBase64Image({
        image_data: 'base64string',
        analysis_type: 'comprehensive',
      });

      expect(result.status).toBe('success');
      expect(result.analysis_id).toBe('analysis-123');
      expect(result.analysis?.object_detection?.total_objects).toBe(1);
    });

    it('이미지 분석 실패 시 에러를 처리해야 함', async () => {
      const error = { response: { data: { message: 'Analysis failed' } } };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.analyzeBase64Image({
          image_data: 'base64string',
        })
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('analyzeImageFile', () => {
    // FileReader 모킹
    interface MockFileReaderType {
      readAsDataURL: jest.Mock;
      result: string | null;
      onload: (() => void) | null;
      onerror: ((err: unknown) => void) | null;
    }
    const mockFileReader: MockFileReaderType = {
      readAsDataURL: jest.fn(),
      result: null,
      onload: null,
      onerror: null,
    };

    beforeEach(() => {
      (global as unknown as Record<string, unknown>).FileReader = jest.fn(() => mockFileReader);
      mockFileReader.readAsDataURL = jest.fn(function(this: MockFileReaderType) {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
          if (this.onload) this.onload();
        }, 0);
      });
    });

    it('이미지 파일을 분석할 수 있어야 함', async () => {
      const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockResponse = {
        status: 'success',
        analysis_id: 'analysis-123',
        analysis: {
          image_info: {
            width: 800,
            height: 600,
            format: 'jpeg',
            mode: 'RGB',
            size_bytes: 100000,
            aspect_ratio: 1.33,
          },
          analysis_type: 'object',
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.analyzeImageFile(imageFile, 'object');

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        API_V7_IMAGE_ANALYZE_BASE64_PATH,
        expect.objectContaining({
          image_data: expect.any(String),
          analysis_type: 'object',
        })
      );
    });

    it('기본 분석 타입으로 이미지를 분석할 수 있어야 함', async () => {
      const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockResponse = {
        status: 'success',
        analysis: {
          image_info: {},
          analysis_type: 'comprehensive',
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.analyzeImageFile(imageFile);

      expect(result.status).toBe('success');
    });
  });

  describe('predictUserActivity', () => {
    it('사용자 활동을 예측할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        prediction: {
          user_id: 'user-123',
          time_horizon: '24h',
          predicted_activities: [
            {
              activity: 'login',
              probability: 0.8,
              expected_time: '2024-01-01T10:00:00Z',
              confidence: 0.9,
            },
          ],
          next_likely_action: {
            activity: 'login',
            probability: 0.8,
            expected_time: '2024-01-01T10:00:00Z',
            confidence: 0.9,
          },
          activity_patterns: {
            peak_hours: [9, 10, 11],
            is_currently_peak: true,
            average_activity_level: 'high',
          },
          confidence: 0.9,
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.predictUserActivity({
        user_id: 'user-123',
        time_horizon: '24h',
      });

      expect(result.status).toBe('success');
      expect(result.prediction?.user_id).toBe('user-123');
      expect(result.prediction?.predicted_activities.length).toBeGreaterThan(0);
    });

    it('사용자 활동 예측 실패 시 에러를 처리해야 함', async () => {
      const error = { response: { data: { message: 'Prediction failed' } } };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.predictUserActivity({
          user_id: 'user-123',
        })
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('predictMessageQuality', () => {
    it('메시지 품질을 예측할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        quality_analysis: {
          overall_score: 0.9,
          scores: {
            clarity: 0.95,
            completeness: 0.85,
            relevance: 0.9,
            tone_appropriateness: 0.88,
          },
          message_metrics: {
            length: 100,
            word_count: 20,
            has_question: true,
            has_emotion: false,
          },
          quality_level: 'excellent',
          suggestions: ['더 구체적인 정보 추가'],
          predicted_effectiveness: 0.92,
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.predictMessageQuality({
        message_content: '시공사 선정 기준은 무엇인가요?',
        message_type: 'question',
      });

      expect(result.status).toBe('success');
      expect(result.quality_analysis?.overall_score).toBe(0.9);
      expect(result.quality_analysis?.quality_level).toBe('excellent');
    });

    it('메시지 품질 예측 실패 시 에러를 처리해야 함', async () => {
      const error = { response: { data: { message: 'Quality prediction failed' } } };
      mockAxiosInstance.post.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.predictMessageQuality({
          message_content: '테스트 메시지',
        })
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('predictSystemPerformance', () => {
    it('시스템 성능을 예측할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        performance_prediction: {
          current_metrics: {
            cpu_usage: 50,
            memory_usage: 60,
            disk_usage: 40,
          },
          predicted_metrics: {
            cpu_usage: 55,
            memory_usage: 65,
            response_time_ms: 100,
            throughput: 1000,
          },
          trends: {
            cpu_trend: 'increasing',
            memory_trend: 'stable',
            load_trend: 'stable',
          },
          prediction_horizon: '1h',
          confidence: 0.85,
          alerts: [],
          recommendations: ['모니터링 강화'],
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.predictSystemPerformance({
        time_horizon: '1h',
        include_trends: true,
      });

      expect(result.status).toBe('success');
      expect(result.performance_prediction?.confidence).toBe(0.85);
    });

    it('기본 옵션으로 시스템 성능을 예측할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        performance_prediction: {
          current_metrics: {},
          predicted_metrics: {},
          prediction_horizon: '1h',
          confidence: 0.8,
          alerts: [],
          recommendations: [],
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.predictSystemPerformance();

      expect(result.status).toBe('success');
    });
  });

  describe('getPredictionSummary', () => {
    it('예측 요약을 조회할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        summary: {
          total_predictions: 1000,
          accuracy_rate: 0.92,
          active_models: 3,
          last_updated: new Date().toISOString(),
          predictions_by_type: {
            user_activity: 500,
            message_quality: 300,
            system_performance: 200,
          },
          accuracy_by_type: {
            user_activity: 0.95,
            message_quality: 0.90,
            system_performance: 0.88,
          },
          recent_activity: {
            last_hour: 50,
            last_24_hours: 500,
          },
          quality_insights: [],
          model_status: {
            user_activity: 'active',
            message_quality: 'active',
            system_performance: 'active',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.getPredictionSummary();

      expect(result.status).toBe('success');
      expect(result.summary?.total_predictions).toBe(1000);
      expect(result.summary?.accuracy_rate).toBe(0.92);
    });

    it('예측 요약 조회 실패 시 에러를 처리해야 함', async () => {
      const error = { response: { data: { message: 'Summary fetch failed' } } };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.getPredictionSummary()
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('헬스 체크를 수행할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AdvancedAPI',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.service).toBe('AdvancedAPI');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(API_HEALTH_PATH);
    });

    it('헬스 체크 실패 시 에러를 처리해야 함', async () => {
      const error = new Error('Health check failed');
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(
        advancedAPIService.healthCheck()
      ).rejects.toThrow();

      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 이미지를 분석할 수 있어야 함', async () => {
      const imageFile = new File(['image content'], '프로젝트도면.jpg', { type: 'image/jpeg' });
      
      const mockResponse = {
        status: 'success',
        analysis: {
          image_info: {
            width: 1200,
            height: 800,
            format: 'jpeg',
            mode: 'RGB',
            size_bytes: 200000,
            aspect_ratio: 1.5,
          },
          analysis_type: 'comprehensive',
          ocr_results: {
            extracted_text: '샘플 재개발 프로젝트',
            text_regions: [],
            language: 'ko',
          },
          timestamp: new Date().toISOString(),
        },
      };

      // FileReader 모킹
      interface MockFileReaderType2 {
        readAsDataURL: jest.Mock;
        result: string | null;
        onload: (() => void) | null;
        onerror: ((err: unknown) => void) | null;
      }
      const mockFileReader: MockFileReaderType2 = {
        readAsDataURL: jest.fn(function(this: MockFileReaderType2) {
          setTimeout(() => {
            this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
            if (this.onload) this.onload();
          }, 0);
        }),
        result: null,
        onload: null,
        onerror: null,
      };
      (global as unknown as Record<string, unknown>).FileReader = jest.fn(() => mockFileReader);

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.analyzeImageFile(imageFile, 'comprehensive');

      expect(result.status).toBe('success');
      expect(result.analysis?.ocr_results?.extracted_text).toContain('재개발');
    });

    it('시공사 선정 관련 메시지의 품질을 예측할 수 있어야 함', async () => {
      const mockResponse = {
        status: 'success',
        quality_analysis: {
          overall_score: 0.95,
          scores: {
            clarity: 0.98,
            completeness: 0.92,
            relevance: 0.96,
            tone_appropriateness: 0.94,
          },
          message_metrics: {
            length: 150,
            word_count: 30,
            has_question: true,
            has_emotion: false,
          },
          quality_level: 'excellent',
          suggestions: [],
          predicted_effectiveness: 0.96,
          timestamp: new Date().toISOString(),
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await advancedAPIService.predictMessageQuality({
        message_content: '시공사 선정 기준은 무엇인가요? 기술력, 안전성, 경험을 어떻게 평가하나요?',
        message_type: 'question',
        context: {
          topic: '시공사 선정',
          project: '샘플 재개발',
        },
      });

      expect(result.status).toBe('success');
      expect(result.quality_analysis?.quality_level).toBe('excellent');
      expect(result.quality_analysis?.overall_score).toBeGreaterThan(0.9);
    });
  });
});

