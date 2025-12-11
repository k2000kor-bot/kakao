/**
 * advancedMessageAPI 서비스 테스트
 * 고급 메시지 API 테스트
 */

// axios 모킹 (서비스 파일에서 import 하기 전에 모킹)
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  AxiosResponse: jest.fn(),
}));

// WebSocket 모킹
global.WebSocket = jest.fn().mockImplementation(() => ({
  readyState: 1, // OPEN
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})) as any;

import { advancedMessageAPI } from '../advancedMessageAPI';

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedMessageAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('기본 기능', () => {
    it('advancedMessageAPI 객체가 존재해야 함', () => {
      expect(advancedMessageAPI).toBeDefined();
      expect(typeof advancedMessageAPI).toBe('object');
    });

    it('주요 메서드들이 존재해야 함', () => {
      expect(typeof advancedMessageAPI.generateAdvancedMessage).toBe('function');
      expect(typeof advancedMessageAPI.checkServerStatus).toBe('function');
      expect(typeof advancedMessageAPI.getPersonalizedResponse).toBe('function');
      expect(typeof advancedMessageAPI.getWebSocketManager).toBe('function');
    });
  });

  describe('checkServerStatus', () => {
    it('서버 상태를 확인할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.checkServerStatus();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('서버 상태 응답 구조가 올바른 형식을 가져야 함', async () => {
      const result = await advancedMessageAPI.checkServerStatus();

      if (result.success && result.data) {
        expect(result.data.status).toBeDefined();
        expect(typeof result.data.status).toBe('string');
      }
    });
  });

  describe('getAIModelPerformance', () => {
    it('AI 모델 성능을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getAIModelPerformance();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(Array.isArray(result.data.models)).toBe(true);
      }
    });
  });

  describe('getPerformanceAnalysis', () => {
    it('성능 분석을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getPerformanceAnalysis();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(typeof result.data.avg_response_time).toBe('number');
        expect(typeof result.data.success_rate).toBe('number');
      }
    });
  });

  describe('getUserProfile', () => {
    it('사용자 프로필을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getUserProfile('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.user_id).toBeDefined();
        expect(result.data.preferences).toBeDefined();
      }
    });
  });

  describe('generateAdvancedMessage', () => {
    it('고급 메시지를 생성할 수 있어야 함', async () => {
      const request = {
        context: '재개발 프로젝트',
        style: 'professional',
        user_profile: {},
        performance_metrics: {},
      };

      const result = await advancedMessageAPI.generateAdvancedMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.text).toBeDefined();
        expect(typeof result.data.confidence).toBe('number');
        expect(result.data.style).toBe('professional');
      }
    });
  });

  describe('getPersonalizedResponse', () => {
    it('개인화된 응답을 생성할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getPersonalizedResponse(
        '메시지',
        '컨텍스트'
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.personalized_style) {
        expect(result.personalized_style.tone).toBeDefined();
        expect(result.personalized_style.formality_level).toBeDefined();
      }
    });
  });

  describe('getConversationEvents', () => {
    it('대화 이벤트를 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getConversationEvents('conversation-1', 10);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('getConversationPredictions', () => {
    it('대화 예측을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getConversationPredictions('conversation-1', 10);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.prediction) {
        expect(result.prediction.next_topic).toBeDefined();
        expect(typeof result.prediction.engagement_prediction).toBe('number');
      }
    });
  });

  describe('getMonitoringSystemStats', () => {
    it('모니터링 시스템 통계를 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getMonitoringSystemStats();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.stats) {
        expect(typeof result.stats.total_conversations).toBe('number');
        expect(typeof result.stats.avg_response_time).toBe('number');
      }
    });
  });

  describe('stopConversationMonitoring', () => {
    it('모니터링을 중지할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.stopConversationMonitoring('conversation-1');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('getUserMLProfile', () => {
    it('사용자 ML 프로필을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getUserMLProfile('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.profile) {
        expect(result.profile.user_id).toBeDefined();
        expect(result.profile.ml_preferences).toBeDefined();
      }
    });
  });

  describe('getAllUserMLProfiles', () => {
    it('모든 사용자 ML 프로필을 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getAllUserMLProfiles();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.profiles) {
        expect(Array.isArray(result.profiles)).toBe(true);
      }
    });
  });

  describe('predictUserEngagement', () => {
    it('사용자 참여도를 예측할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.predictUserEngagement('메시지', '컨텍스트');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.prediction) {
        expect(typeof result.prediction.engagement_score).toBe('number');
        expect(typeof result.prediction.response_likelihood).toBe('number');
      }
    });
  });

  describe('predictResponseTime', () => {
    it('응답 시간을 예측할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.predictResponseTime('메시지', '컨텍스트');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.prediction) {
        expect(typeof result.prediction.estimated_time).toBe('number');
        expect(typeof result.prediction.confidence).toBe('number');
      }
    });
  });

  describe('clearUserMLData', () => {
    it('사용자 ML 데이터를 삭제할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.clearUserMLData('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('analyzeProject', () => {
    it('프로젝트를 분석할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.analyzeProject('room-1');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.project_name).toBeDefined();
        expect(typeof result.data.total_files).toBe('number');
      }
    });
  });

  describe('submitLearningFeedback', () => {
    it('학습 피드백을 제출할 수 있어야 함', async () => {
      const feedback = {
        message_id: 'msg-1',
        feedback_type: 'positive',
        rating: 5,
        comments: '좋습니다',
      };

      const result = await advancedMessageAPI.submitLearningFeedback(feedback);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('updateUserProfile', () => {
    it('사용자 프로필을 업데이트할 수 있어야 함', async () => {
      const profile = {
        user_id: 'user-1',
        preferences: { language: 'ko' },
      };

      const result = await advancedMessageAPI.updateUserProfile(profile);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('getMLSystemStats', () => {
    it('ML 시스템 통계를 조회할 수 있어야 함', async () => {
      const result = await advancedMessageAPI.getMLSystemStats();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success && result.stats) {
        expect(typeof result.stats.total_users).toBe('number');
        expect(typeof result.stats.avg_accuracy).toBe('number');
      }
    });
  });

  describe('WebSocket 관련 기능', () => {
    it('WebSocket 매니저를 가져올 수 있어야 함', () => {
      const wsManager = advancedMessageAPI.getWebSocketManager();

      expect(wsManager).toBeDefined();
      expect(typeof wsManager.connect).toBe('function');
      expect(typeof wsManager.disconnect).toBe('function');
      expect(typeof wsManager.send).toBe('function');
      expect(typeof wsManager.on).toBe('function');
      expect(typeof wsManager.off).toBe('function');
    });

    it('WebSocket 메시지를 전송할 수 있어야 함', () => {
      expect(() => {
        advancedMessageAPI.sendWebSocketMessage({ type: 'test', data: {} });
      }).not.toThrow();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 고급 메시지를 생성할 수 있어야 함', async () => {
      const request = {
        context: '개포우성7차 재개발 프로젝트 시공사 선정 관련',
        style: 'professional',
        user_profile: {
          preferences: { formality: 'high' },
        },
        performance_metrics: {
          previous_success_rate: 0.9,
        },
      };

      const result = await advancedMessageAPI.generateAdvancedMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.text).toBeDefined();
        expect(result.data.confidence).toBeGreaterThan(0);
        expect(result.data.style).toBe('professional');
      }
    });

    it('시공사 선정 대화에 대한 예측을 수행할 수 있어야 함', async () => {
      const engagementResult = await advancedMessageAPI.predictUserEngagement(
        '시공사 선정 기준에 대해 논의하고 싶습니다',
        '재개발 프로젝트 컨텍스트'
      );

      const responseTimeResult = await advancedMessageAPI.predictResponseTime(
        '시공사 선정 기준에 대해 논의하고 싶습니다',
        '재개발 프로젝트 컨텍스트'
      );

      expect(engagementResult).toBeDefined();
      expect(engagementResult.success).toBe(true);
      if (engagementResult.success && engagementResult.prediction) {
        expect(engagementResult.prediction.engagement_score).toBeGreaterThanOrEqual(0);
        expect(engagementResult.prediction.engagement_score).toBeLessThanOrEqual(1);
      }

      expect(responseTimeResult).toBeDefined();
      expect(responseTimeResult.success).toBe(true);
      if (responseTimeResult.success && responseTimeResult.prediction) {
        expect(responseTimeResult.prediction.estimated_time).toBeGreaterThan(0);
      }
    });

    it('프로젝트 분석 및 모니터링을 수행할 수 있어야 함', async () => {
      const analysisResult = await advancedMessageAPI.analyzeProject('project-room-1');
      const statsResult = await advancedMessageAPI.getMonitoringSystemStats();

      expect(analysisResult).toBeDefined();
      expect(analysisResult.success).toBe(true);

      expect(statsResult).toBeDefined();
      expect(statsResult.success).toBe(true);
      if (statsResult.success && statsResult.stats) {
        expect(statsResult.stats.total_conversations).toBeGreaterThanOrEqual(0);
      }
    });

    it('사용자 프로필 및 ML 프로필을 관리할 수 있어야 함', async () => {
      const userProfile = await advancedMessageAPI.getUserProfile('user-1');
      const mlProfile = await advancedMessageAPI.getUserMLProfile('user-1');
      const allMLProfiles = await advancedMessageAPI.getAllUserMLProfiles();

      expect(userProfile).toBeDefined();
      expect(userProfile.success).toBe(true);

      expect(mlProfile).toBeDefined();
      expect(mlProfile.success).toBe(true);

      expect(allMLProfiles).toBeDefined();
      expect(allMLProfiles.success).toBe(true);
      if (allMLProfiles.success && allMLProfiles.profiles) {
        expect(Array.isArray(allMLProfiles.profiles)).toBe(true);
      }
    });

    it('성능 분석 및 AI 모델 성능을 조회할 수 있어야 함', async () => {
      const performanceAnalysis = await advancedMessageAPI.getPerformanceAnalysis();
      const aiModelPerformance = await advancedMessageAPI.getAIModelPerformance();

      expect(performanceAnalysis).toBeDefined();
      expect(performanceAnalysis.success).toBe(true);
      if (performanceAnalysis.success && performanceAnalysis.data) {
        expect(performanceAnalysis.data.avg_response_time).toBeGreaterThanOrEqual(0);
        expect(performanceAnalysis.data.success_rate).toBeGreaterThanOrEqual(0);
        expect(performanceAnalysis.data.success_rate).toBeLessThanOrEqual(1);
      }

      expect(aiModelPerformance).toBeDefined();
      expect(aiModelPerformance.success).toBe(true);
      if (aiModelPerformance.success && aiModelPerformance.data) {
        expect(Array.isArray(aiModelPerformance.data.models)).toBe(true);
      }
    });
  });
});

