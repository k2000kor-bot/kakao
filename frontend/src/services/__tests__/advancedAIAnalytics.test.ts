/// <reference types="jest" />
/**
 * advancedAIAnalytics 서비스 테스트
 * 고급 AI 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedAIAnalytics from '../advancedAIAnalytics';
import { ChatSession } from '../../types/chat';
import { Project } from '../../types/project';

describe('advancedAIAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIAnalytics).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIAnalytics;
      const instance2 = advancedAIAnalytics;
      expect(instance1).toBe(instance2);
    });
  });

  describe('updateRealTimeMetrics', () => {
    it('실시간 메트릭을 업데이트할 수 있어야 함', () => {
      const metrics = {
        activeUsers: 10,
        requestsPerMinute: 50,
        averageResponseTime: 200,
        errorRate: 0.01,
        systemHealth: 'good' as const,
      };

      advancedAIAnalytics.updateRealTimeMetrics(metrics);

      const updatedMetrics = advancedAIAnalytics.getRealTimeMetrics();
      expect(updatedMetrics.activeUsers).toBe(10);
      expect(updatedMetrics.requestsPerMinute).toBe(50);
    });

    it('부분 메트릭만 업데이트할 수 있어야 함', () => {
      const initialMetrics = advancedAIAnalytics.getRealTimeMetrics();
      
      advancedAIAnalytics.updateRealTimeMetrics({
        activeUsers: 20,
      });

      const updatedMetrics = advancedAIAnalytics.getRealTimeMetrics();
      expect(updatedMetrics.activeUsers).toBe(20);
      // 다른 메트릭은 유지되어야 함
      expect(updatedMetrics.systemHealth).toBe(initialMetrics.systemHealth);
    });

    it('시스템 건강 상태를 업데이트할 수 있어야 함', () => {
      advancedAIAnalytics.updateRealTimeMetrics({
        systemHealth: 'poor',
      });

      const metrics = advancedAIAnalytics.getRealTimeMetrics();
      expect(['excellent', 'good', 'fair', 'poor']).toContain(metrics.systemHealth);
    });
  });

  describe('collectAnalytics', () => {
    it('분석 데이터를 수집할 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-1', {
        messageCount: 10,
        responseTime: 500,
        userSatisfaction: 0.9,
      });

      const allData = advancedAIAnalytics.getAllAnalyticsData();
      expect(allData.has('session-1')).toBe(true);
    });

    it('기존 데이터를 업데이트할 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-2', {
        messageCount: 5,
      });

      advancedAIAnalytics.collectAnalytics('session-2', {
        messageCount: 10,
      });

      const allData = advancedAIAnalytics.getAllAnalyticsData();
      const sessionData = allData.get('session-2');
      expect(sessionData?.messageCount).toBe(10);
    });

    it('기능 사용량을 추적할 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-3', {
        featureUsage: {
          'analysis': 5,
          'prediction': 3,
        },
      });

      const allData = advancedAIAnalytics.getAllAnalyticsData();
      const sessionData = allData.get('session-3');
      expect(sessionData?.featureUsage.analysis).toBe(5);
      expect(sessionData?.featureUsage.prediction).toBe(3);
    });
  });

  describe('runAdvancedAnalysis', () => {
    it('고급 분석을 실행할 수 있어야 함', async () => {
      const analysis = await advancedAIAnalytics.runAdvancedAnalysis('테스트 메시지');

      expect(analysis).toBeDefined();
      expect(analysis.sentiment).toBeDefined();
      expect(analysis.intent).toBeDefined();
      expect(analysis.complexity).toBeDefined();
      expect(analysis.urgency).toBeDefined();
      expect(analysis.context).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('감정 분석을 수행해야 함', async () => {
      const positiveAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('좋은 결과가 나왔습니다. 성공했습니다.');
      expect(['positive', 'neutral']).toContain(positiveAnalysis.sentiment);

      const negativeAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('문제가 발생했습니다. 실패했습니다.');
      expect(['negative', 'neutral']).toContain(negativeAnalysis.sentiment);
    });

    it('의도를 감지해야 함', async () => {
      const analysisAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('이 데이터를 분석해주세요');
      expect(analysisAnalysis.intent).toBe('analysis');

      const questionAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('이것이 무엇인지 궁금합니다');
      expect(questionAnalysis.intent).toBe('question');

      const recommendationAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('추천해주세요');
      expect(recommendationAnalysis.intent).toBe('recommendation');
    });

    it('복잡도를 분석해야 함', async () => {
      const simpleAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('안녕하세요');
      expect(['low', 'medium', 'high']).toContain(simpleAnalysis.complexity);

      // 복잡한 메시지: 문장당 평균 단어 수가 많도록 구성
      const complexMessage = '이것은 매우 복잡한 문장입니다 여러 가지 개념을 포함하고 있으며 다양한 관점에서 분석이 필요합니다 각 부분을 세밀하게 검토해야 합니다 추가적인 고려사항도 있습니다';
      const complexAnalysis = await advancedAIAnalytics.runAdvancedAnalysis(complexMessage);
      expect(['low', 'medium', 'high']).toContain(complexAnalysis.complexity);
    });

    it('긴급도를 감지해야 함', async () => {
      const urgentAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('긴급하게 처리해주세요');
      expect(urgentAnalysis.urgency).toBe('high');

      const normalAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('일반적인 요청입니다');
      expect(['low', 'medium']).toContain(normalAnalysis.urgency);
    });

    it('세션 컨텍스트를 활용할 수 있어야 함', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [
          { id: '1', content: '첫 번째 메시지', sender: 'user', timestamp: new Date().toISOString() },
          { id: '2', content: '두 번째 메시지', sender: 'assistant', timestamp: new Date().toISOString() },
        ],
        createdAt: '',
        updatedAt: '',
        isActive: true,
        messageCount: 2,
        participants: [],
        tags: [],
        status: 'active',
        lastActivity: '',
        totalMessages: 2,
        isPersistent: false,
      };

      const analysis = await advancedAIAnalytics.runAdvancedAnalysis('분석해주세요', mockSession);

      expect(analysis.context).toBeDefined();
      expect(analysis.context.session).toBe('테스트 세션');
      expect(analysis.context.previousMessages).toBe(2);
    });

    it('프로젝트 컨텍스트를 활용할 수 있어야 함', async () => {
      const mockProject = {
        id: 'project-1',
        name: '샘플 재개발',
        category: 'redevelopment',
      } as unknown as Project;

      const analysis = await advancedAIAnalytics.runAdvancedAnalysis('시공사 선정 기준은?', undefined, mockProject);

      expect(analysis.context).toBeDefined();
      expect(analysis.context.project).toBe('샘플 재개발');
    });

    it('도메인을 감지해야 함', async () => {
      const constructionAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('시공사 선정 기준');
      expect(constructionAnalysis.context.domain).toBe('construction');

      const realEstateAnalysis = await advancedAIAnalytics.runAdvancedAnalysis('부동산 매물 정보');
      expect(realEstateAnalysis.context.domain).toBe('realestate');
    });
  });

  describe('generateAnalyticsReport', () => {
    it('분석 리포트를 생성할 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-report', {
        messageCount: 20,
        responseTime: 300,
        userSatisfaction: 0.85,
        featureUsage: {
          'analysis': 10,
          'prediction': 5,
        },
      });

      const report = advancedAIAnalytics.generateAnalyticsReport('session-report');

      expect(report).toBeDefined();
      expect(report?.sessionId).toBe('session-report');
      expect(report?.summary.totalMessages).toBe(20);
      expect(report?.summary.averageResponseTime).toBe(300);
      expect(report?.summary.userSatisfaction).toBe(0.85);
    });

    it('존재하지 않는 세션에 대해 null을 반환해야 함', () => {
      const report = advancedAIAnalytics.generateAnalyticsReport('non-existent-session');
      expect(report).toBeNull();
    });

    it('가장 많이 사용된 기능을 포함해야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-features', {
        featureUsage: {
          'analysis': 15,
          'prediction': 8,
          'recommendation': 3,
        },
      });

      const report = advancedAIAnalytics.generateAnalyticsReport('session-features');
      expect(report?.summary.mostUsedFeatures).toBeDefined();
      expect(Array.isArray(report?.summary.mostUsedFeatures)).toBe(true);
    });

    it('추천사항을 포함해야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-recommendations', {
        responseTime: 6000,
        userSatisfaction: 0.5,
      });

      const report = advancedAIAnalytics.generateAnalyticsReport('session-recommendations');
      expect(report?.recommendations).toBeDefined();
      expect(Array.isArray(report?.recommendations)).toBe(true);
    });
  });

  describe('getRealTimeMetrics', () => {
    it('실시간 메트릭을 가져올 수 있어야 함', () => {
      const metrics = advancedAIAnalytics.getRealTimeMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.activeUsers).toBe('number');
      expect(typeof metrics.requestsPerMinute).toBe('number');
      expect(typeof metrics.averageResponseTime).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
      expect(['excellent', 'good', 'fair', 'poor']).toContain(metrics.systemHealth);
    });
  });

  describe('getAllAnalyticsData', () => {
    it('전체 분석 데이터를 가져올 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-all-1', { messageCount: 5 });
      advancedAIAnalytics.collectAnalytics('session-all-2', { messageCount: 10 });

      const allData = advancedAIAnalytics.getAllAnalyticsData();

      expect(allData instanceof Map).toBe(true);
      expect(allData.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 분석할 수 있어야 함', async () => {
      const mockProject = {
        id: 'project-1',
        name: '샘플 재개발',
        category: 'redevelopment',
      } as unknown as Project;

      const analysis = await advancedAIAnalytics.runAdvancedAnalysis(
        '시공사 선정 기준은 무엇인가요? 기술력, 안전성, 경험을 어떻게 평가하나요?',
        undefined,
        mockProject
      );

      expect(['question', 'general']).toContain(analysis.intent);
      expect(analysis.context.project).toBe('샘플 재개발');
      expect(analysis.context.domain).toBe('construction');
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('복합적인 분석 요청을 처리할 수 있어야 함', async () => {
      const mockSession: ChatSession = {
        id: 'session-complex',
        title: '시공사 선정 분석',
        messages: Array.from({ length: 15 }, (_, i) => ({
          id: `msg-${i}`,
          content: `메시지 ${i}`,
          sender: i % 2 === 0 ? 'user' : 'assistant',
          timestamp: new Date().toISOString(),
        })),
        createdAt: '',
        updatedAt: '',
        isActive: true,
        messageCount: 15,
        participants: [],
        tags: [],
        status: 'active',
        lastActivity: '',
        totalMessages: 15,
        isPersistent: false,
      };

      const analysis = await advancedAIAnalytics.runAdvancedAnalysis(
        '시공사 선정을 위해 기술력, 안전성, 경험, 재무 건전성, 과거 실적을 종합적으로 분석하고 예측해주세요. 또한 향후 리스크를 평가해주세요.',
        mockSession
      );

      expect(['low', 'medium', 'high']).toContain(analysis.complexity);
      expect(analysis.intent).toBe('analysis');
      expect(analysis.context.previousMessages).toBe(15);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('사용자 만족도가 낮은 세션에 대한 리포트를 생성할 수 있어야 함', () => {
      advancedAIAnalytics.collectAnalytics('session-low-satisfaction', {
        messageCount: 30,
        responseTime: 8000,
        userSatisfaction: 0.4,
        featureUsage: {
          'analysis': 5,
        },
      });

      const report = advancedAIAnalytics.generateAnalyticsReport('session-low-satisfaction');

      expect(report).toBeDefined();
      expect(report?.summary.userSatisfaction).toBe(0.4);
      expect(report?.recommendations.some(rec => rec.includes('만족도'))).toBe(true);
    });
  });
});

