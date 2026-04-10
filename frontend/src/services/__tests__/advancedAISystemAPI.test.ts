/**
 * advancedAISystemAPI 서비스 테스트
 * 고도화된 AI 시스템 API 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  FALLBACK_API_ORIGIN,
  GENERATE_ADVANCED_MESSAGE_PATH,
  joinApiHealthCheckUrl,
  USER_PERFORMANCE_METRICS_PATH_PREFIX,
} from '../../config/api';
import AdvancedAISystemAPI, { advancedAISystemAPI } from '../advancedAISystemAPI';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import type {
  AdvancedMessageRequest,
  EmotionAnalysisRequest,
  PatternAnalysisRequest,
  PredictionRequest,
} from '../advancedAISystemAPI';

// fetch 모킹
installJestFetchMock();

function partialJsonResponse(init: {
  ok?: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}): Response {
  return init as unknown as Response;
}

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('AdvancedAISystemAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getStatus', () => {
    it('시스템 상태를 조회할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ status: 'healthy', version: '1.0.0' }),
      }));

      const result = await AdvancedAISystemAPI.getStatus();

      expect(result).toEqual({ status: 'healthy', version: '1.0.0' });
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_STATUS_PATH}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('서버 오류 시 에러를 발생시켜야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: false,
        status: 500,
      }));

      await expect(AdvancedAISystemAPI.getStatus()).rejects.toThrow();
    });
  });

  describe('generateAdvancedMessage', () => {
    it('고급 메시지를 생성할 수 있어야 함', async () => {
      const mockMessage = {
        id: 'msg-123',
        original_message: '안녕하세요',
        advanced_message: '안녕하세요! 어떤 도움이 필요하신가요?',
        analytics: {
          emotion_analysis: {
            emotion_scores: { joy: 0.8, neutral: 0.2 },
            sentiment_score: 0.8,
            dominant_emotion: 'joy',
            emotion_confidence: 0.9,
            emotion_trend: {
              trend: 'positive',
              volatility: 0.1,
              average: 0.75,
            },
            emotional_stability: 0.85,
          },
          pattern_analysis: {
            pattern_frequency: {},
            dominant_pattern: 'greeting',
            pattern_effectiveness: 0.9,
            conversation_style: 'friendly',
            interaction_patterns: {
              interaction_type: 'casual',
              engagement_level: 0.8,
              response_frequency: 1.0,
              average_message_length: 10,
            },
          },
          prediction_results: {},
          learning_insights: {
            preferred_emotion: 'joy',
            effective_patterns: [],
            learning_recommendations: [],
            improvement_areas: [],
          },
          performance_metrics: {
            prediction_accuracy: 0.9,
            emotion_recognition_accuracy: 0.9,
            pattern_recognition_accuracy: 0.85,
            overall_performance: 0.88,
          },
        },
        timestamp: new Date().toISOString(),
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, message: mockMessage }),
      }));

      const request: AdvancedMessageRequest = {
        original_message: '안녕하세요',
        user_id: 'user-123',
        context: '테스트 컨텍스트',
      };

      const result = await AdvancedAISystemAPI.generateAdvancedMessage(request);

      expect(result.success).toBe(true);
      expect(result.message).toEqual(mockMessage);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${GENERATE_ADVANCED_MESSAGE_PATH}`),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('analyzeEmotion', () => {
    it('감정을 분석할 수 있어야 함', async () => {
      const mockAnalysis = {
        emotion_scores: { joy: 0.8, sadness: 0.2 },
        sentiment_score: 0.8,
        dominant_emotion: 'joy',
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, analysis: mockAnalysis }),
      }));

      const request: EmotionAnalysisRequest = {
        messages: [
          {
            content: '좋은 하루네요!',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-123',
      };

      const result = await AdvancedAISystemAPI.analyzeEmotion(request);

      expect(result.success).toBe(true);
      expect(result.analysis).toEqual(mockAnalysis);
    });
  });

  describe('analyzePatterns', () => {
    it('패턴을 분석할 수 있어야 함', async () => {
      const mockAnalysis = {
        pattern_frequency: { greeting: 0.5, question: 0.3 },
        dominant_pattern: 'greeting',
        pattern_effectiveness: 0.9,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, analysis: mockAnalysis }),
      }));

      const request: PatternAnalysisRequest = {
        conversation_data: [
          {
            content: '안녕하세요',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-123',
      };

      const result = await AdvancedAISystemAPI.analyzePatterns(request);

      expect(result.success).toBe(true);
      expect(result.analysis).toEqual(mockAnalysis);
    });
  });

  describe('predictBehavior', () => {
    it('행동을 예측할 수 있어야 함', async () => {
      const mockPrediction = {
        prediction_type: 'response_time',
        predicted_value: 2.5,
        confidence_score: 0.85,
        historical_trend: [2.0, 2.3, 2.5],
        prediction_factors: {
          message_length: 0.3,
          user_history: 0.5,
          time_of_day: 0.2,
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, prediction: mockPrediction }),
      }));

      const request: PredictionRequest = {
        user_id: 'user-123',
        prediction_type: 'response_time',
        context_data: { message_length: 10 },
      };

      const result = await AdvancedAISystemAPI.predictBehavior(request);

      expect(result.success).toBe(true);
      expect(result.prediction).toEqual(mockPrediction);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('성능 메트릭을 조회할 수 있어야 함', async () => {
      const mockMetrics = {
        prediction_accuracy: 0.9,
        emotion_recognition_accuracy: 0.85,
        overall_performance: 0.88,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, metrics: mockMetrics }),
      }));

      const result = await AdvancedAISystemAPI.getPerformanceMetrics('user-123');

      expect(result.success).toBe(true);
      expect(result.metrics).toEqual(mockMetrics);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${USER_PERFORMANCE_METRICS_PATH_PREFIX}/user-123`),
        expect.any(Object)
      );
    });
  });

  describe('testConnection', () => {
    it('연결이 성공하면 true를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      }));

      const result = await AdvancedAISystemAPI.testConnection();

      expect(result).toBe(true);
    });

    it('연결이 실패하면 false를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await AdvancedAISystemAPI.testConnection();

      expect(result).toBe(false);
    });
  });
});

describe('advancedAISystemAPI (편의 함수)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  describe('generateAdvanced', () => {
    it('고급 메시지를 생성할 수 있어야 함', async () => {
      const mockMessage = {
        id: 'msg-123',
        original_message: '안녕하세요',
        advanced_message: '안녕하세요!',
        analytics: {
          emotion_analysis: {
            emotion_scores: {},
            sentiment_score: 0.8,
            dominant_emotion: 'joy',
            emotion_confidence: 0.9,
            emotion_trend: { trend: 'positive', volatility: 0.1, average: 0.75 },
            emotional_stability: 0.85,
          },
          pattern_analysis: {
            pattern_frequency: {},
            dominant_pattern: 'greeting',
            pattern_effectiveness: 0.9,
            conversation_style: 'friendly',
            interaction_patterns: {
              interaction_type: 'casual',
              engagement_level: 0.8,
              response_frequency: 1.0,
              average_message_length: 10,
            },
          },
          prediction_results: {},
          learning_insights: {
            preferred_emotion: 'joy',
            effective_patterns: [],
            learning_recommendations: [],
            improvement_areas: [],
          },
          performance_metrics: {
            prediction_accuracy: 0.9,
            emotion_recognition_accuracy: 0.9,
            pattern_recognition_accuracy: 0.85,
            overall_performance: 0.88,
          },
        },
        timestamp: new Date().toISOString(),
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, message: mockMessage }),
      }));

      const request: AdvancedMessageRequest = {
        original_message: '안녕하세요',
        user_id: 'user-123',
      };

      const result = await advancedAISystemAPI.generateAdvanced(request);

      expect(result).toEqual(mockMessage);
    });

    it('오류 발생 시 에러를 전파해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request: AdvancedMessageRequest = {
        original_message: '안녕하세요',
        user_id: 'user-123',
      };

      await expect(advancedAISystemAPI.generateAdvanced(request)).rejects.toThrow();
    });
  });

  describe('analyzeEmotion', () => {
    it('감정을 분석할 수 있어야 함', async () => {
      const mockAnalysis = {
        emotion_scores: { joy: 0.8 },
        sentiment_score: 0.8,
        dominant_emotion: 'joy',
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, analysis: mockAnalysis }),
      }));

      const request: EmotionAnalysisRequest = {
        messages: [
          {
            content: '좋은 하루네요!',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-123',
      };

      const result = await advancedAISystemAPI.analyzeEmotion(request);

      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('analyzePatterns', () => {
    it('패턴을 분석할 수 있어야 함', async () => {
      const mockAnalysis = {
        pattern_frequency: { greeting: 0.5 },
        dominant_pattern: 'greeting',
        pattern_effectiveness: 0.9,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, analysis: mockAnalysis }),
      }));

      const request: PatternAnalysisRequest = {
        conversation_data: [
          {
            content: '안녕하세요',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-123',
      };

      const result = await advancedAISystemAPI.analyzePatterns(request);

      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('predictBehavior', () => {
    it('행동을 예측할 수 있어야 함', async () => {
      const mockPrediction = {
        prediction_type: 'response_time',
        predicted_value: 2.5,
        confidence_score: 0.85,
        historical_trend: [2.0, 2.3, 2.5],
        prediction_factors: {},
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, prediction: mockPrediction }),
      }));

      const request: PredictionRequest = {
        user_id: 'user-123',
        prediction_type: 'response_time',
        context_data: {},
      };

      const result = await advancedAISystemAPI.predictBehavior(request);

      expect(result).toEqual(mockPrediction);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('성능 메트릭을 조회할 수 있어야 함', async () => {
      const mockMetrics = {
        prediction_accuracy: 0.9,
        emotion_recognition_accuracy: 0.85,
        overall_performance: 0.88,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, metrics: mockMetrics }),
      }));

      const result = await advancedAISystemAPI.getPerformanceMetrics('user-123');

      expect(result).toEqual(mockMetrics);
    });
  });

  describe('checkStatus', () => {
    it('상태가 healthy면 true를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      }));

      const result = await advancedAISystemAPI.checkStatus();

      expect(result).toBe(true);
    });

    it('상태가 healthy가 아니면 false를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ status: 'unhealthy' }),
      }));

      const result = await advancedAISystemAPI.checkStatus();

      expect(result).toBe(false);
    });

    it('오류 발생 시 false를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await advancedAISystemAPI.checkStatus();

      expect(result).toBe(false);
    });
  });

  describe('testEndpoint', () => {
    it('테스트 엔드포인트를 호출할 수 있어야 함', async () => {
      const mockResponse = { message: 'test successful' };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      const result = await advancedAISystemAPI.testEndpoint();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_SMOKE_TEST_PATH}`),
        expect.any(Object)
      );
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 고급 메시지를 생성할 수 있어야 함', async () => {
      const mockMessage = {
        id: 'msg-redev-123',
        original_message: '재개발 프로젝트 관련 질문입니다',
        advanced_message: '재개발 프로젝트에 대해 자세히 설명드리겠습니다.',
        analytics: {
          emotion_analysis: {
            emotion_scores: { interest: 0.8, curiosity: 0.7 },
            sentiment_score: 0.75,
            dominant_emotion: 'interest',
            emotion_confidence: 0.85,
            emotion_trend: { trend: 'stable', volatility: 0.15, average: 0.7 },
            emotional_stability: 0.8,
          },
          pattern_analysis: {
            pattern_frequency: { question: 0.6, information: 0.4 },
            dominant_pattern: 'question',
            pattern_effectiveness: 0.9,
            conversation_style: 'professional',
            interaction_patterns: {
              interaction_type: 'information_seeking',
              engagement_level: 0.85,
              response_frequency: 0.9,
              average_message_length: 15,
            },
          },
          prediction_results: {},
          learning_insights: {
            preferred_emotion: 'interest',
            effective_patterns: ['question', 'information'],
            learning_recommendations: ['더 많은 컨텍스트 제공'],
            improvement_areas: [],
          },
          performance_metrics: {
            prediction_accuracy: 0.9,
            emotion_recognition_accuracy: 0.88,
            pattern_recognition_accuracy: 0.85,
            overall_performance: 0.88,
          },
        },
        timestamp: new Date().toISOString(),
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, message: mockMessage }),
      }));

      const request: AdvancedMessageRequest = {
        original_message: '재개발 프로젝트 관련 질문입니다',
        user_id: 'user-redev-123',
        context: '재개발 프로젝트 정보 조회',
        learning_enabled: true,
        prediction_enabled: true,
      };

      const result = await advancedAISystemAPI.generateAdvanced(request);

      expect(result).toBeDefined();
      expect(result.original_message).toBe(request.original_message);
      expect(result.advanced_message).toBeDefined();
      expect(result.analytics).toBeDefined();
    });

    it('시공사 선정 관련 감정 및 패턴을 분석할 수 있어야 함', async () => {
      const mockEmotionAnalysis = {
        emotion_scores: { concern: 0.6, interest: 0.4 },
        sentiment_score: 0.5,
        dominant_emotion: 'concern',
        emotion_confidence: 0.8,
        emotion_trend: { trend: 'stable', volatility: 0.2, average: 0.5 },
        emotional_stability: 0.75,
      };

      const mockPatternAnalysis = {
        pattern_frequency: { evaluation: 0.5, comparison: 0.3, decision: 0.2 },
        dominant_pattern: 'evaluation',
        pattern_effectiveness: 0.85,
        conversation_style: 'analytical',
        interaction_patterns: {
          interaction_type: 'decision_making',
          engagement_level: 0.9,
          response_frequency: 0.8,
          average_message_length: 20,
        },
      };

      jest.mocked(global.fetch)
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, analysis: mockEmotionAnalysis }),
        }))
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, analysis: mockPatternAnalysis }),
        }));

      const emotionRequest: EmotionAnalysisRequest = {
        messages: [
          {
            content: '시공사 선정에 대해 고민이 많습니다',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-contractor-123',
      };

      const patternRequest: PatternAnalysisRequest = {
        conversation_data: [
          {
            content: '시공사 선정에 대해 고민이 많습니다',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
        user_id: 'user-contractor-123',
      };

      const [emotionResult, patternResult] = await Promise.all([
        advancedAISystemAPI.analyzeEmotion(emotionRequest),
        advancedAISystemAPI.analyzePatterns(patternRequest),
      ]);

      expect(emotionResult).toEqual(mockEmotionAnalysis);
      expect(patternResult).toEqual(mockPatternAnalysis);
    });

    it('행동 예측을 통해 사용자 응답 시간을 예측할 수 있어야 함', async () => {
      const mockPrediction = {
        prediction_type: 'response_time',
        predicted_value: 3.5,
        confidence_score: 0.9,
        historical_trend: [3.0, 3.2, 3.5],
        prediction_factors: {
          message_complexity: 0.4,
          user_experience_level: 0.3,
          time_of_day: 0.2,
          conversation_context: 0.1,
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, prediction: mockPrediction }),
      }));

      const request: PredictionRequest = {
        user_id: 'user-123',
        prediction_type: 'response_time',
        context_data: {
          message_complexity: 'high',
          user_experience_level: 'intermediate',
          time_of_day: 'afternoon',
        },
      };

      const result = (await advancedAISystemAPI.predictBehavior(request)) as typeof mockPrediction;

      expect(result).toEqual(mockPrediction);
      expect(result.predicted_value).toBeGreaterThan(0);
      expect(result.confidence_score).toBeGreaterThan(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
    });
  });
});

