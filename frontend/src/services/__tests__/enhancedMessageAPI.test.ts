/**
 * EnhancedMessageAPI 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  API_ANALYTICS_PATH,
  API_HEALTH_PATH,
  API_QUERY_PARAM_LIMIT,
  API_STATUS_PATH,
  GENERATE_ENHANCED_MESSAGE_PATH,
  MESSAGE_FORMATS_PATH,
  MESSAGE_HISTORY_PATH_PREFIX,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
  UPDATE_USER_PROFILE_PATH,
  USER_PROFILE_PATH_PREFIX,
} from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  EnhancedMessageAPI,
  enhancedMessageAPI,
  EnhancedMessageFormatRequest,
  UserProfileRequest,
} from '../enhancedMessageAPI';

const apiUrl = (path: string) => joinApiHealthCheckUrl(resolveApiBaseUrl(), path);

// fetch 모킹
installJestFetchMock();

describe('EnhancedMessageAPI', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.mocked(global.fetch);
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('클래스 존재 확인', () => {
      expect(EnhancedMessageAPI).toBeDefined();
      expect(typeof EnhancedMessageAPI.getStatus).toBe('function');
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(enhancedMessageAPI).toBeDefined();
    });
  });

  describe('시스템 상태 확인', () => {
    it('기본 상태 확인', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          status: 'operational',
          version: '1.0.0',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getStatus();

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_STATUS_PATH));
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('상태 확인 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(EnhancedMessageAPI.getStatus()).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_STATUS_PATH));
    });
  });

  describe('헬스 체크', () => {
    it('기본 헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          health: 'healthy',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.healthCheck();

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_HEALTH_PATH));
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(EnhancedMessageAPI.healthCheck()).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_HEALTH_PATH));
    });
  });

  describe('메시지 형식 목록 조회', () => {
    it('기본 메시지 형식 목록 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          formats: {
            formal: '공식적인 형식',
            casual: '캐주얼한 형식',
            professional: '전문적인 형식',
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getMessageFormats();

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(MESSAGE_FORMATS_PATH));
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.formats).toBeDefined();
      expect(typeof result.formats).toBe('object');
    });

    it('메시지 형식 목록 조회 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(EnhancedMessageAPI.getMessageFormats()).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(MESSAGE_FORMATS_PATH));
    });
  });

  describe('향상된 메시지 생성', () => {
    it('기본 향상된 메시지 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: {
            id: 'msg-123',
            original_message: '원본 메시지',
            format_type: 'formal',
            generated_message: '생성된 향상된 메시지',
            analytics: {
              emotion_score: 0.8,
              sentiment_score: 0.7,
              complexity_score: 0.6,
              impact_prediction: 0.75,
              keywords: ['키워드1', '키워드2'],
              tone: 'positive',
              formality_level: 'high',
            },
            user_profile: {
              preferred_formats: ['formal'],
              communication_style: 'professional',
            },
            context_analysis: {
              total_messages: 5,
              context_length: 100,
              overall_sentiment: 'positive',
              positive_count: 3,
              negative_count: 1,
            },
            timestamp: new Date().toISOString(),
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: EnhancedMessageFormatRequest = {
        format_type: 'formal',
        original_message: '원본 메시지',
      };

      const result = await EnhancedMessageAPI.generateEnhancedMessage(request);

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(GENERATE_ENHANCED_MESSAGE_PATH));
      expect((mockFetch.mock.calls[0][1] as RequestInit).method).toBe('POST');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message.id).toBeDefined();
      expect(result.message.generated_message).toBeDefined();
      expect(result.message.analytics).toBeDefined();
    });

    it('컨텍스트 포함 메시지 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: {
            id: 'msg-456',
            original_message: '컨텍스트 메시지',
            format_type: 'casual',
            generated_message: '컨텍스트 기반 생성 메시지',
            analytics: {
              emotion_score: 0.7,
              sentiment_score: 0.8,
              complexity_score: 0.5,
              impact_prediction: 0.7,
              keywords: ['컨텍스트'],
              tone: 'neutral',
              formality_level: 'medium',
            },
            user_profile: {
              preferred_formats: ['casual'],
              communication_style: 'friendly',
            },
            context_analysis: {
              total_messages: 10,
              context_length: 200,
              overall_sentiment: 'neutral',
              positive_count: 5,
              negative_count: 2,
            },
            timestamp: new Date().toISOString(),
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: EnhancedMessageFormatRequest = {
        format_type: 'casual',
        original_message: '컨텍스트 메시지',
        context: '추가 컨텍스트',
        recent_messages: [
          {
            content: '이전 메시지',
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const result = await EnhancedMessageAPI.generateEnhancedMessage(request);

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(GENERATE_ENHANCED_MESSAGE_PATH));
      expect((mockFetch.mock.calls[0][1] as RequestInit).method).toBe('POST');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message.context_analysis).toBeDefined();
    });

    it('메시지 생성 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: EnhancedMessageFormatRequest = {
        format_type: 'formal',
        original_message: '실패 테스트',
      };

      await expect(
        EnhancedMessageAPI.generateEnhancedMessage(request)
      ).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(GENERATE_ENHANCED_MESSAGE_PATH));
    });
  });

  describe('사용자 프로필 관리', () => {
    it('사용자 프로필 업데이트', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: '프로필이 업데이트되었습니다',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: UserProfileRequest = {
        user_id: 'user-123',
        preferred_formats: ['formal', 'professional'],
        communication_style: 'professional',
      };

      const result = await EnhancedMessageAPI.updateUserProfile(request);

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(UPDATE_USER_PROFILE_PATH));
      expect((mockFetch.mock.calls[0][1] as RequestInit).method).toBe('POST');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('사용자 프로필 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          profile: {
            user_id: 'user-123',
            preferred_formats: ['formal'],
            communication_style: 'professional',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getUserProfile('user-123');

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(`${USER_PROFILE_PATH_PREFIX}/user-123`));
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile?.user_id).toBe('user-123');
    });

    it('존재하지 않는 사용자 프로필 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          error: 'User not found',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getUserProfile('nonexistent');

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(`${USER_PROFILE_PATH_PREFIX}/nonexistent`));
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('프로필 업데이트 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: UserProfileRequest = {
        user_id: 'user-123',
        preferred_formats: ['formal'],
        communication_style: 'professional',
      };

      await expect(
        EnhancedMessageAPI.updateUserProfile(request)
      ).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(UPDATE_USER_PROFILE_PATH));
    });
  });

  describe('메시지 히스토리', () => {
    it('기본 메시지 히스토리 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          history: [
            {
              message_id: 'msg-1',
              format_type: 'formal',
              original_message: '메시지 1',
              generated_message: '생성된 메시지 1',
              timestamp: new Date().toISOString(),
              success: true,
            },
            {
              message_id: 'msg-2',
              format_type: 'casual',
              original_message: '메시지 2',
              generated_message: '생성된 메시지 2',
              timestamp: new Date().toISOString(),
              success: true,
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getMessageHistory('user-123');

      expect(mockFetch.mock.calls[0][0]).toBe(
        apiUrl(`${MESSAGE_HISTORY_PATH_PREFIX}/user-123?${API_QUERY_PARAM_LIMIT}=10`)
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.history)).toBe(true);
      if (result.history && result.history.length > 0) {
        expect(result.history[0].message_id).toBeDefined();
        expect(result.history[0].format_type).toBeDefined();
      }
    });

    it('제한된 개수의 메시지 히스토리 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          history: [],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getMessageHistory('user-123', 5);

      expect(mockFetch.mock.calls[0][0]).toBe(
        apiUrl(`${MESSAGE_HISTORY_PATH_PREFIX}/user-123?${API_QUERY_PARAM_LIMIT}=5`)
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.history)).toBe(true);
    });

    it('메시지 히스토리 조회 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        EnhancedMessageAPI.getMessageHistory('user-123')
      ).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(
        apiUrl(`${MESSAGE_HISTORY_PATH_PREFIX}/user-123?${API_QUERY_PARAM_LIMIT}=10`)
      );
    });
  });

  describe('메시지 분석', () => {
    it('기본 메시지 분석 결과 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          analytics: {
            emotion_score: 0.8,
            sentiment_score: 0.7,
            complexity_score: 0.6,
            impact_prediction: 0.75,
            timestamp: new Date().toISOString(),
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getMessageAnalytics('msg-123');

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(`${API_ANALYTICS_PATH}/msg-123`));
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.analytics).toBeDefined();
      if (result.analytics) {
        expect(typeof result.analytics.emotion_score).toBe('number');
        expect(typeof result.analytics.sentiment_score).toBe('number');
        expect(typeof result.analytics.complexity_score).toBe('number');
        expect(typeof result.analytics.impact_prediction).toBe('number');
      }
    });

    it('존재하지 않는 메시지 분석 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          error: 'Message not found',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.getMessageAnalytics('nonexistent');

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(`${API_ANALYTICS_PATH}/nonexistent`));
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('메시지 분석 조회 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        EnhancedMessageAPI.getMessageAnalytics('msg-123')
      ).rejects.toThrow();
      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(`${API_ANALYTICS_PATH}/msg-123`));
    });
  });

  describe('서버 연결 테스트', () => {
    it('연결 성공', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          health: 'healthy',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await EnhancedMessageAPI.testConnection();

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_HEALTH_PATH));
      expect(result).toBe(true);
    });

    it('연결 실패', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await EnhancedMessageAPI.testConnection();

      expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(API_HEALTH_PATH));
      expect(result).toBe(false);
    });
  });

  describe('다양한 메시지 형식', () => {
    it('다양한 형식 타입 테스트', async () => {
      const formatTypes = ['formal', 'casual', 'professional', 'friendly'];

      for (const formatType of formatTypes) {
        const mockResponse = {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: {
              id: `msg-${formatType}`,
              original_message: '테스트 메시지',
              format_type: formatType,
              generated_message: `${formatType} 형식 메시지`,
              analytics: {
                emotion_score: 0.7,
                sentiment_score: 0.8,
                complexity_score: 0.6,
                impact_prediction: 0.7,
                keywords: [],
                tone: 'neutral',
                formality_level: 'medium',
              },
              user_profile: {
                preferred_formats: [formatType],
                communication_style: formatType,
              },
              context_analysis: {
                total_messages: 1,
                context_length: 10,
                overall_sentiment: 'neutral',
                positive_count: 0,
                negative_count: 0,
              },
              timestamp: new Date().toISOString(),
            },
          }),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const request: EnhancedMessageFormatRequest = {
          format_type: formatType,
          original_message: '테스트 메시지',
        };

        const result = await EnhancedMessageAPI.generateEnhancedMessage(request);

        expect(mockFetch.mock.calls[0][0]).toBe(apiUrl(GENERATE_ENHANCED_MESSAGE_PATH));
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.message.format_type).toBe(formatType);
      }
    });
  });
});

