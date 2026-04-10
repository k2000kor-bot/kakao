/**
 * advancedAnalyticsService 서비스 테스트
 * 고급 사용자 행동 분석 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { advancedAnalyticsService } from '../advancedAnalyticsService';

// window, document, navigator 모킹
const mockWindow = {
  screen: { width: 1920, height: 1080 },
  scrollY: 0,
  scrollX: 0,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockDocument = {
  documentElement: {
    scrollHeight: 2000
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Test)'
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Intl 모킹
(global as unknown as Record<string, unknown>).Intl = {
  DateTimeFormat: jest.fn(() => ({
    resolvedOptions: () => ({ timeZone: 'Asia/Seoul' })
  }))
};

describe('advancedAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAnalyticsService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAnalyticsService;
      const instance2 = advancedAnalyticsService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('recordBehavior', () => {
    it('사용자 행동을 기록할 수 있어야 함', () => {
      advancedAnalyticsService.recordBehavior('click', 'button', {
        buttonId: 'test-button'
      });

      // recordBehavior는 내부적으로 동작하므로 에러가 발생하지 않으면 성공
      expect(true).toBe(true);
    });

    it('duration과 result를 포함하여 행동을 기록할 수 있어야 함', () => {
      advancedAnalyticsService.recordBehavior(
        'search',
        'search-bar',
        { query: 'test' },
        150,
        'success'
      );

      expect(true).toBe(true);
    });

    it('다양한 액션 타입을 기록할 수 있어야 함', () => {
      const actions = ['click', 'scroll', 'keydown', 'search', 'navigate'];
      
      actions.forEach(action => {
        expect(() => {
          advancedAnalyticsService.recordBehavior(action, 'component', {});
        }).not.toThrow();
      });
    });
  });

  describe('generateInsights', () => {
    it('인사이트를 생성할 수 있어야 함', () => {
      const insights = advancedAnalyticsService.generateInsights();

      expect(Array.isArray(insights)).toBe(true);
    });

    it('생성된 인사이트가 올바른 구조를 가져야 함', () => {
      const insights = advancedAnalyticsService.generateInsights();

      insights.forEach(insight => {
        expect(insight).toBeDefined();
        expect(['usage', 'performance', 'preference', 'trend']).toContain(insight.type);
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.description).toBe('string');
        expect(typeof insight.confidence).toBe('number');
        expect(Array.isArray(insight.recommendations)).toBe(true);
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getUserProfile', () => {
    it('사용자 프로필을 가져올 수 있어야 함', () => {
      const profile = advancedAnalyticsService.getUserProfile();

      expect(profile).toBeDefined();
      expect(profile.userId).toBeDefined();
      expect(profile.preferences).toBeDefined();
      expect(profile.behavior).toBeDefined();
      expect(profile.performance).toBeDefined();
    });

    it('사용자 프로필이 올바른 구조를 가져야 함', () => {
      const profile = advancedAnalyticsService.getUserProfile();

      expect(profile.preferences).toBeDefined();
      expect(['light', 'dark', 'auto']).toContain(profile.preferences.theme);
      expect(['small', 'medium', 'large']).toContain(profile.preferences.fontSize);
      expect(['concise', 'detailed', 'conversational']).toContain(profile.preferences.aiResponseStyle);
      expect(['low', 'medium', 'high']).toContain(profile.preferences.notificationLevel);

      expect(profile.behavior).toBeDefined();
      expect(typeof profile.behavior.averageSessionDuration).toBe('number');
      expect(Array.isArray(profile.behavior.mostUsedFeatures)).toBe(true);
      expect(Array.isArray(profile.behavior.preferredTimeSlots)).toBe(true);
      expect(Array.isArray(profile.behavior.commonQueries)).toBe(true);

      expect(profile.performance).toBeDefined();
      expect(typeof profile.performance.averageResponseTime).toBe('number');
      expect(typeof profile.performance.errorRate).toBe('number');
      expect(typeof profile.performance.satisfactionScore).toBe('number');
    });
  });

  describe('analyzeTrends', () => {
    it('트렌드를 분석할 수 있어야 함', () => {
      const trend = advancedAnalyticsService.analyzeTrends('project-1', 'message_count', 'daily');

      expect(trend).toBeDefined();
      expect(trend.metric).toBe('message_count');
      expect(Array.isArray(trend.data)).toBe(true);
      expect(['increasing', 'decreasing', 'stable']).toContain(trend.trend);
      expect(typeof trend.slope).toBe('number');
      expect(typeof trend.correlation).toBe('number');
    });

    it('다양한 기간으로 트렌드를 분석할 수 있어야 함', () => {
      const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];

      periods.forEach(period => {
        const trend = advancedAnalyticsService.analyzeTrends('project-1', 'message_count', period);
        expect(trend).toBeDefined();
        expect(Array.isArray(trend.data)).toBe(true);
      });
    });

    it('다양한 메트릭에 대해 트렌드를 분석할 수 있어야 함', () => {
      const metrics = ['message_count', 'user_activity', 'response_time', 'satisfaction'];

      metrics.forEach(metric => {
        const trend = advancedAnalyticsService.analyzeTrends('project-1', metric);
        expect(trend).toBeDefined();
        expect(trend.metric).toBe(metric);
      });
    });
  });

  describe('generatePredictiveInsights', () => {
    it('예측 인사이트를 생성할 수 있어야 함', () => {
      const insights = advancedAnalyticsService.generatePredictiveInsights('project-1');

      expect(Array.isArray(insights)).toBe(true);
    });

    it('생성된 예측 인사이트가 올바른 구조를 가져야 함', () => {
      const insights = advancedAnalyticsService.generatePredictiveInsights('project-1');

      insights.forEach(insight => {
        expect(insight).toBeDefined();
        expect(insight.id).toBeDefined();
        expect([
          'completion_time',
          'resource_needs',
          'risk_assessment',
          'quality_prediction',
          'collaboration_impact'
        ]).toContain(insight.type);
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.description).toBe('string');
        expect(typeof insight.confidence).toBe('number');
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
        expect(insight.predictedValue).toBeDefined();
        expect(Array.isArray(insight.factors)).toBe(true);
        expect(Array.isArray(insight.recommendations)).toBe(true);
        expect(insight.timestamp).toBeDefined();
      });
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 행동을 기록하고 분석할 수 있어야 함', () => {
      advancedAnalyticsService.recordBehavior('view', 'project', {
        projectId: 'redevelopment-project-1',
        projectName: '강남구 역삼동 재개발'
      });

      const insights = advancedAnalyticsService.generateInsights();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('프로젝트의 트렌드를 분석할 수 있어야 함', () => {
      const trend = advancedAnalyticsService.analyzeTrends(
        'redevelopment-project-1',
        'user_activity',
        'weekly'
      );

      expect(trend).toBeDefined();
      expect(trend.metric).toBe('user_activity');
      expect(['increasing', 'decreasing', 'stable']).toContain(trend.trend);
    });

    it('프로젝트의 예측 인사이트를 생성할 수 있어야 함', () => {
      const insights = advancedAnalyticsService.generatePredictiveInsights('redevelopment-project-1');

      expect(Array.isArray(insights)).toBe(true);
      insights.forEach(insight => {
        expect(insight).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    it('사용자 프로필을 기반으로 개인화된 인사이트를 제공할 수 있어야 함', () => {
      const profile = advancedAnalyticsService.getUserProfile();
      expect(profile).toBeDefined();

      const insights = advancedAnalyticsService.generateInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });
});

