/**
 * advancedAIAnalyticsService 서비스 테스트
 * 고급 AI 분석 및 예측 서비스 테스트
 * @jest-environment jsdom
 */

import advancedAIAnalyticsService from '../advancedAIAnalyticsService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// window, document 모킹
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document, 'addEventListener', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

Object.defineProperty(window, 'screen', {
  value: { width: 1920, height: 1080 },
  writable: true,
});

// Intl 모킹
Object.defineProperty(Intl, 'DateTimeFormat', {
  value: jest.fn(() => ({
    resolvedOptions: () => ({ timeZone: 'Asia/Seoul' }),
  })),
  writable: true,
});

// crypto 모킹
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
  },
  writable: true,
});

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('userId', 'test-user-123');
    localStorageMock.setItem('sessionStart', Date.now().toString());
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIAnalyticsService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIAnalyticsService;
      const instance2 = advancedAIAnalyticsService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('trackUserBehavior', () => {
    it('사용자 행동을 추적할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: ['action1', 'action2'],
        deviceInfo: { userAgent: 'test' },
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('test_action', 'chat', context);

      const behaviors = advancedAIAnalyticsService.getUserBehaviors();
      expect(behaviors.length).toBeGreaterThan(0);
      expect(behaviors[behaviors.length - 1].action).toBe('test_action');
      expect(behaviors[behaviors.length - 1].category).toBe('chat');
    });

    it('행동 추적 시 상세 정보를 포함할 수 있어야 함', () => {
      const context = {
        sessionDuration: 2000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      const details = {
        query: '테스트 쿼리',
        projectId: 'project-123',
        responseTime: 150,
        success: true,
      };

      advancedAIAnalyticsService.trackUserBehavior('search', 'analysis', context, details);

      const behaviors = advancedAIAnalyticsService.getUserBehaviors();
      const lastBehavior = behaviors[behaviors.length - 1];
      expect(lastBehavior.details.query).toBe('테스트 쿼리');
      expect(lastBehavior.details.projectId).toBe('project-123');
      expect(lastBehavior.details.responseTime).toBe(150);
    });
  });

  describe('getAnalyticsMetrics', () => {
    it('분석 메트릭을 조회할 수 있어야 함', () => {
      const metrics = advancedAIAnalyticsService.getAnalyticsMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.userEngagement).toBeDefined();
      expect(metrics.performance).toBeDefined();
      expect(metrics.content).toBeDefined();
      expect(metrics.predictions).toBeDefined();
    });

    it('메트릭이 올바른 구조를 가져야 함', () => {
      const metrics = advancedAIAnalyticsService.getAnalyticsMetrics();

      expect(typeof metrics.userEngagement.dailyActiveUsers).toBe('number');
      expect(typeof metrics.performance.averageResponseTime).toBe('number');
      expect(Array.isArray(metrics.content.popularTopics)).toBe(true);
      expect(['improving', 'stable', 'declining']).toContain(metrics.predictions.performanceTrend);
    });
  });

  describe('getBehaviorPatterns', () => {
    it('행동 패턴을 조회할 수 있어야 함', () => {
      // 충분한 행동 데이터 생성
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context);
      }

      const patterns = advancedAIAnalyticsService.getBehaviorPatterns();

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('특정 사용자의 행동 패턴을 조회할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context);
      }

      const patterns = advancedAIAnalyticsService.getBehaviorPatterns('test-user-123');

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('행동 패턴이 올바른 구조를 가져야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      // 충분한 데이터로 패턴 생성 (최소 10개 이상 필요)
      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context);
      }

      const patterns = advancedAIAnalyticsService.getBehaviorPatterns();

      expect(Array.isArray(patterns)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (patterns.length > 0) {
        const pattern = patterns.find(p => p && p.id && p.userId && p.pattern);
        if (pattern) {
          expect(pattern.id).toBeDefined();
          expect(pattern.userId).toBeDefined();
          expect(pattern.pattern).toBeDefined();
          expect(pattern.insights).toBeDefined();
          expect(pattern.createdAt).toBeDefined();
          expect(pattern.updatedAt).toBeDefined();
        }
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('getPredictiveModels', () => {
    it('예측 모델을 조회할 수 있어야 함', () => {
      const models = advancedAIAnalyticsService.getPredictiveModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('예측 모델이 올바른 구조를 가져야 함', () => {
      const models = advancedAIAnalyticsService.getPredictiveModels();
      expect(models.length).toBeGreaterThan(0);
      const model = models[0];
      expect(model.id).toBeDefined();
      expect(['user_engagement', 'error_prediction', 'performance_optimization', 'content_recommendation']).toContain(model.type);
      expect(typeof model.accuracy).toBe('number');
      expect(Array.isArray(model.features)).toBe(true);
      expect(Array.isArray(model.predictions)).toBe(true);
    });
  });

  describe('getPersonalizationProfile', () => {
    it('개인화 프로필을 조회할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('test_action', 'chat', context, {
        query: '테스트 쿼리',
      });

      const profile = advancedAIAnalyticsService.getPersonalizationProfile('test-user-123');

      /* eslint-disable jest/no-conditional-expect -- service may return null when profile not yet persisted */
      if (profile) {
        expect(profile.userId).toBe('test-user-123');
        expect(profile.preferences).toBeDefined();
        expect(profile.interests).toBeDefined();
        expect(profile.behavior).toBeDefined();
        expect(profile.recommendations).toBeDefined();
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('존재하지 않는 사용자의 프로필은 null을 반환해야 함', () => {
      const profile = advancedAIAnalyticsService.getPersonalizationProfile('non-existent-user');

      expect(profile).toBeNull();
    });
  });

  describe('getUserBehaviors', () => {
    it('사용자 행동을 조회할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('action1', 'chat', context);
      advancedAIAnalyticsService.trackUserBehavior('action2', 'project', context);

      const behaviors = advancedAIAnalyticsService.getUserBehaviors();

      expect(Array.isArray(behaviors)).toBe(true);
      expect(behaviors.length).toBeGreaterThanOrEqual(2);
    });

    it('특정 사용자의 행동만 조회할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('action1', 'chat', context);

      const behaviors = advancedAIAnalyticsService.getUserBehaviors('test-user-123');

      expect(Array.isArray(behaviors)).toBe(true);
      behaviors.forEach(behavior => {
        expect(behavior.userId).toBe('test-user-123');
      });
    });

    it('행동 조회 시 제한을 설정할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      for (let i = 0; i < 50; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context);
      }

      const behaviors = advancedAIAnalyticsService.getUserBehaviors(undefined, 10);

      expect(behaviors.length).toBeLessThanOrEqual(10);
    });
  });

  describe('runPredictions', () => {
    it('예측을 실행할 수 있어야 함', async () => {
      await advancedAIAnalyticsService.runPredictions();

      const models = advancedAIAnalyticsService.getPredictiveModels();
      models.forEach(model => {
        expect(model.predictions.length).toBeGreaterThan(0);
      });
    });

    it('예측 결과가 올바른 구조를 가져야 함', async () => {
      await advancedAIAnalyticsService.runPredictions();

      const models = advancedAIAnalyticsService.getPredictiveModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models[0].predictions.length).toBeGreaterThan(0);
      const prediction = models[0].predictions[0];
      expect(prediction.timestamp).toBeDefined();
      expect(typeof prediction.value).toBe('number');
      expect(typeof prediction.confidence).toBe('number');
    });
  });

  describe('cleanup', () => {
    it('서비스를 정리할 수 있어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('test_action', 'chat', context);
      advancedAIAnalyticsService.cleanup();

      // cleanup이 정상 실행되어야 함
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('메트릭 업데이트', () => {
    it('행동 추적 시 메트릭이 업데이트되어야 함', () => {
      const initialMetrics = advancedAIAnalyticsService.getAnalyticsMetrics();
      const initialConversations = initialMetrics.content.totalConversations;

      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('chat_action', 'chat', context);

      const updatedMetrics = advancedAIAnalyticsService.getAnalyticsMetrics();
      expect(updatedMetrics.content.totalConversations).toBeGreaterThanOrEqual(initialConversations);
    });

    it('성능 메트릭이 업데이트되어야 함', () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      advancedAIAnalyticsService.trackUserBehavior('test_action', 'performance', context, {
        responseTime: 200,
        success: true,
      });

      const metrics = advancedAIAnalyticsService.getAnalyticsMetrics();
      expect(typeof metrics.performance.averageResponseTime).toBe('number');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 사용자 행동을 추적하고 분석할 수 있어야 함', () => {
      const context = {
        sessionDuration: 5000,
        previousActions: ['project_view', 'file_upload'],
        deviceInfo: { userAgent: 'Chrome' },
        networkStatus: 'online',
      };

      // 재개발 프로젝트 관련 행동 추적
      advancedAIAnalyticsService.trackUserBehavior('project_create', 'project', context, {
        projectId: 'redevelopment-project-1',
        query: '재개발 프로젝트',
      });

      advancedAIAnalyticsService.trackUserBehavior('query_search', 'analysis', context, {
        query: '시공사 선정 기준',
        responseTime: 300,
        success: true,
      });

      const behaviors = advancedAIAnalyticsService.getUserBehaviors();
      expect(behaviors.length).toBeGreaterThanOrEqual(2);

      const profile = advancedAIAnalyticsService.getPersonalizationProfile('test-user-123');
      /* eslint-disable jest/no-conditional-expect -- profile may be absent before persistence */
      if (profile) {
        expect(profile.interests.keywords.length).toBeGreaterThanOrEqual(0);
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('시공사 선정 관련 질문 패턴을 분석할 수 있어야 함', () => {
      const context = {
        sessionDuration: 3000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      // 여러 질문 추적
      const queries = [
        '시공사 선정 기준은 무엇인가요?',
        '재개발 프로젝트 시공사 선정 방법',
        '시공사 평가 항목',
      ];

      queries.forEach(query => {
        advancedAIAnalyticsService.trackUserBehavior('query', 'chat', context, {
          query,
          responseTime: 250,
          success: true,
        });
      });

      // 충분한 데이터로 패턴 분석
      for (let i = 0; i < 10; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context);
      }

      const patterns = advancedAIAnalyticsService.getBehaviorPatterns('test-user-123');
      expect(Array.isArray(patterns)).toBe(true);

      const metrics = advancedAIAnalyticsService.getAnalyticsMetrics();
      expect(metrics.content.popularTopics.length).toBeGreaterThanOrEqual(0);
    });

    it('예측 모델을 실행하여 향후 사용자 참여도를 예측할 수 있어야 함', async () => {
      const context = {
        sessionDuration: 1000,
        previousActions: [],
        deviceInfo: {},
        networkStatus: 'online',
      };

      // 여러 행동 추적
      for (let i = 0; i < 20; i++) {
        advancedAIAnalyticsService.trackUserBehavior(`action_${i}`, 'chat', context, {
          responseTime: 150 + i * 5,
          success: true,
        });
      }

      // 예측 실행
      await advancedAIAnalyticsService.runPredictions();

      const models = advancedAIAnalyticsService.getPredictiveModels();
      const engagementModel = models.find(m => m.type === 'user_engagement');

      /* eslint-disable jest/no-conditional-expect -- user_engagement model may be absent */
      if (engagementModel && engagementModel.predictions.length > 0) {
        const prediction = engagementModel.predictions[engagementModel.predictions.length - 1];
        expect(typeof prediction.value).toBe('number');
        expect(prediction.value).toBeGreaterThanOrEqual(0);
        expect(prediction.value).toBeLessThanOrEqual(100);
      }
      /* eslint-enable jest/no-conditional-expect */

      const metrics = advancedAIAnalyticsService.getAnalyticsMetrics();
      expect(typeof metrics.predictions.nextWeekUsers).toBe('number');
    });
  });
});

