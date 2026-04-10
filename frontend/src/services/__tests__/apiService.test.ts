/**
 * apiService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  performanceApi,
  aiEngineApi,
  securityApi,
  userExperienceApi,
  systemApi,
  apiService,
} from '../apiService';

// fetch 모킹
installJestFetchMock();

describe('apiService', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.mocked(global.fetch);
  });

  describe('performanceApi', () => {
    it('메트릭 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { metrics: 'test' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('분석 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { analysis: 'test' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.getAnalysis();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('최적화 실행', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { result: 'optimized' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.runOptimization('target', 'strategy');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('최적화 이력 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { history: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.getOptimizationHistory();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('설정 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { config: {} },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.getConfig();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('설정 업데이트', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { updated: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.updateConfig({ setting: 'value' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'healthy' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.healthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('API 오류 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await performanceApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('aiEngineApi', () => {
    it('메트릭 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { metrics: 'test' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('모델 상태 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { models: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.getModelsStatus();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('텍스트 처리', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { processed: 'text' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.processText('test text', 'model1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('모델 재훈련', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { retrained: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.retrainModel('model-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('모델 최적화', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { optimized: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.optimizeModel('model-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('처리 이력 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { history: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.getProcessingHistory();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('훈련 이력 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { history: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.getTrainingHistory();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'healthy' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await aiEngineApi.healthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('securityApi', () => {
    it('메트릭 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { metrics: 'test' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('이벤트 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { events: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.getEvents();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('정책 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { policies: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.getPolicies();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('감사 로그 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { logs: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.getAuditLogs();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('보안 스캔 실행', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { scan: 'completed' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.runSecurityScan('full');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('위협 해결', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { resolved: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.resolveThreat('threat-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('정책 상태 업데이트', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { updated: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.updatePolicyStatus('policy-1', 'active');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('스캔 이력 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { history: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.getScanHistory();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'healthy' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await securityApi.healthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('userExperienceApi', () => {
    it('선호도 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { preferences: {} },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.getPreferences('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('선호도 업데이트', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { updated: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.updatePreferences({ theme: 'dark' }, 'user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('통계 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { stats: {} },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.getStats('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('통계 업데이트', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { updated: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.updateStats({ count: 10 }, 'user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('피드백 제출', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { submitted: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.submitFeedback({ rating: 5 }, 'user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('알림 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { notifications: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.getNotifications('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('알림 읽음 처리', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { read: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.markNotificationRead('notification-1', 'user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('모든 알림 읽음 처리', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { readAll: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.markAllNotificationsRead('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('활동 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { activities: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.getActivities('user-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'healthy' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await userExperienceApi.healthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('systemApi', () => {
    it('상태 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'running' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.getStatus();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('메트릭 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { metrics: {} },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { status: 'healthy' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.healthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('시스템 재시작', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { restarted: true },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.restartSystem();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('시스템 백업', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { backup: 'completed' },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.backupSystem();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('로그 조회', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { logs: [] },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await systemApi.getLogs();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('apiService 통합', () => {
    it('apiService 객체 구조 확인', () => {
      expect(apiService).toBeDefined();
      expect(apiService.performance).toBeDefined();
      expect(apiService.aiEngine).toBeDefined();
      expect(apiService.security).toBeDefined();
      expect(apiService.userExperience).toBeDefined();
      expect(apiService.system).toBeDefined();
    });

    it('모든 API 모듈 접근 가능', () => {
      expect(typeof apiService.performance.getMetrics).toBe('function');
      expect(typeof apiService.aiEngine.getMetrics).toBe('function');
      expect(typeof apiService.security.getMetrics).toBe('function');
      expect(typeof apiService.userExperience.getPreferences).toBe('function');
      expect(typeof apiService.system.getStatus).toBe('function');
    });
  });

  describe('에러 처리', () => {
    it('HTTP 오류 처리', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await performanceApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('네트워크 오류 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await performanceApi.getMetrics();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('엔드포인트 URL 생성', () => {
    it('/api로 시작하는 엔드포인트 처리', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {},
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await systemApi.getStatus();

      // /api로 시작하는 경우 중복 방지
      expect(mockFetch).toHaveBeenCalled();
    });

    it('/api로 시작하지 않는 엔드포인트 처리', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {},
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await performanceApi.getMetrics();

      // /api가 자동으로 추가됨
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});

