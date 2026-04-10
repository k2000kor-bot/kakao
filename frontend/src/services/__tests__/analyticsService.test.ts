/**
 * analyticsService 서비스 테스트
 * 대화 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import analyticsService from '../analyticsService';
import { ChatSession } from '../../types/chat';

describe('analyticsService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(analyticsService).toBeDefined();
    });
  });

  describe('generateAnalytics', () => {
    it('대화 분석 데이터를 생성할 수 있어야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '테스트 질문',
            isUser: true,
            timestamp: new Date('2024-01-01T10:00:00').toISOString(),
          },
          {
            id: 'msg-2',
            content: '테스트 답변',
            isUser: false,
            timestamp: new Date('2024-01-01T10:00:05').toISOString(),
          },
        ],
        createdAt: new Date('2024-01-01T10:00:00').toISOString(),
        updatedAt: new Date('2024-01-01T10:00:05').toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics).toBeDefined();
      expect(analytics.messageCount).toBe(2);
      expect(analytics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(analytics.responseQuality).toBeDefined();
      expect(analytics.topicDistribution).toBeDefined();
      expect(analytics.sentimentAnalysis).toBeDefined();
      expect(analytics.userEngagement).toBeDefined();
      expect(analytics.aiPerformance).toBeDefined();
    });

    it('평균 응답 시간을 계산해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '질문',
            isUser: true,
            timestamp: new Date('2024-01-01T10:00:00').toISOString(),
          },
          {
            id: 'msg-2',
            content: '답변',
            isUser: false,
            timestamp: new Date('2024-01-01T10:00:05').toISOString(),
          },
        ],
        createdAt: new Date('2024-01-01T10:00:00').toISOString(),
        updatedAt: new Date('2024-01-01T10:00:05').toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.averageResponseTime).toBeGreaterThan(0);
    });

    it('응답 품질을 분석해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '질문',
            isUser: true,
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            content: '# 🤖 지능형 응답',
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.responseQuality.intelligent).toBeGreaterThan(0);
    });

    it('주제 분포를 분석해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '프로젝트 계획에 대해 알려주세요',
            isUser: true,
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            content: '답변',
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(Object.keys(analytics.topicDistribution).length).toBeGreaterThan(0);
    });

    it('감정 분석을 수행해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '좋은 결과가 나왔어요',
            isUser: true,
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            content: '답변',
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.sentimentAnalysis.positive).toBeGreaterThanOrEqual(0);
      expect(analytics.sentimentAnalysis.neutral).toBeGreaterThanOrEqual(0);
      expect(analytics.sentimentAnalysis.negative).toBeGreaterThanOrEqual(0);
    });

    it('사용자 참여도를 분석해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '질문1',
            isUser: true,
            timestamp: new Date('2024-01-01T10:00:00').toISOString(),
          },
          {
            id: 'msg-2',
            content: '답변1',
            isUser: false,
            timestamp: new Date('2024-01-01T10:00:05').toISOString(),
          },
        ],
        createdAt: new Date('2024-01-01T10:00:00').toISOString(),
        updatedAt: new Date('2024-01-01T10:00:05').toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.userEngagement.dailyMessages).toBeDefined();
      expect(Array.isArray(analytics.userEngagement.dailyMessages)).toBe(true);
      expect(analytics.userEngagement.sessionDuration).toBeGreaterThanOrEqual(0);
      expect(analytics.userEngagement.responseRate).toBeGreaterThanOrEqual(0);
    });

    it('AI 성능을 분석해야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [
          {
            id: 'msg-1',
            content: '질문',
            isUser: true,
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            content: '# 제목\n\n긴 답변 내용입니다.',
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.aiPerformance.accuracy).toBeGreaterThanOrEqual(0);
      expect(analytics.aiPerformance.relevance).toBeGreaterThanOrEqual(0);
      expect(analytics.aiPerformance.helpfulness).toBeGreaterThanOrEqual(0);
    });

    it('빈 세션도 처리할 수 있어야 함', async () => {
      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-123',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analytics = await analyticsService.generateAnalytics(session);

      expect(analytics.messageCount).toBe(0);
      expect(analytics.averageResponseTime).toBe(0);
    });
  });

  describe('generateChartData', () => {
    it('차트 데이터를 생성할 수 있어야 함', async () => {
      const analytics = {
        messageCount: 10,
        averageResponseTime: 5000,
        responseQuality: {
          basic: 50,
          intelligent: 30,
          advanced: 15,
          adaptive: 5,
        },
        topicDistribution: {
          '프로젝트 관리': 5,
          '문제 해결': 3,
        },
        sentimentAnalysis: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        userEngagement: {
          dailyMessages: [{ date: '2024-01-01', count: 10 }],
          sessionDuration: 60000,
          responseRate: 80,
        },
        aiPerformance: {
          accuracy: 85,
          relevance: 90,
          helpfulness: 75,
        },
      };

      const chartData = await analyticsService.generateChartData(analytics);

      expect(chartData).toBeDefined();
      expect(chartData.responseQuality).toBeDefined();
      expect(chartData.topicDistribution).toBeDefined();
      expect(chartData.sentimentAnalysis).toBeDefined();
      expect(chartData.dailyActivity).toBeDefined();
      expect(chartData.aiPerformance).toBeDefined();
    });

    it('응답 품질 차트 데이터를 생성해야 함', async () => {
      const analytics = {
        messageCount: 10,
        averageResponseTime: 5000,
        responseQuality: {
          basic: 50,
          intelligent: 30,
          advanced: 15,
          adaptive: 5,
        },
        topicDistribution: {},
        sentimentAnalysis: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        userEngagement: {
          dailyMessages: [],
          sessionDuration: 0,
          responseRate: 0,
        },
        aiPerformance: {
          accuracy: 85,
          relevance: 90,
          helpfulness: 75,
        },
      };

      const chartData = await analyticsService.generateChartData(analytics);

      expect(chartData.responseQuality.labels).toEqual(['기본', '능동적', '고급', '개인화']);
      expect(chartData.responseQuality.datasets[0].data).toEqual([50, 30, 15, 5]);
    });
  });

  describe('generateInsightReport', () => {
    it('인사이트 리포트를 생성할 수 있어야 함', async () => {
      const analytics = {
        messageCount: 10,
        averageResponseTime: 5000,
        responseQuality: {
          basic: 50,
          intelligent: 30,
          advanced: 15,
          adaptive: 5,
        },
        topicDistribution: {
          '프로젝트 관리': 5,
        },
        sentimentAnalysis: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        userEngagement: {
          dailyMessages: [{ date: '2024-01-01', count: 10 }],
          sessionDuration: 60000,
          responseRate: 80,
        },
        aiPerformance: {
          accuracy: 85,
          relevance: 90,
          helpfulness: 75,
        },
      };

      const report = await analyticsService.generateInsightReport(analytics);

      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
      expect(report).toContain('대화 분석 리포트');
    });

    it('기본 통계를 포함해야 함', async () => {
      const analytics = {
        messageCount: 10,
        averageResponseTime: 5000,
        responseQuality: {
          basic: 50,
          intelligent: 30,
          advanced: 15,
          adaptive: 5,
        },
        topicDistribution: {},
        sentimentAnalysis: {
          positive: 60,
          neutral: 30,
          negative: 10,
        },
        userEngagement: {
          dailyMessages: [],
          sessionDuration: 60000,
          responseRate: 80,
        },
        aiPerformance: {
          accuracy: 85,
          relevance: 90,
          helpfulness: 75,
        },
      };

      const report = await analyticsService.generateInsightReport(analytics);

      expect(report).toContain('총 메시지 수');
      expect(report).toContain('평균 응답 시간');
    });

    it('개선 제안을 포함해야 함', async () => {
      const analytics = {
        messageCount: 10,
        averageResponseTime: 5000,
        responseQuality: {
          basic: 60,
          intelligent: 20,
          advanced: 15,
          adaptive: 5,
        },
        topicDistribution: {},
        sentimentAnalysis: {
          positive: 40,
          neutral: 40,
          negative: 20,
        },
        userEngagement: {
          dailyMessages: [],
          sessionDuration: 0,
          responseRate: 0,
        },
        aiPerformance: {
          accuracy: 85,
          relevance: 90,
          helpfulness: 60,
        },
      };

      const report = await analyticsService.generateInsightReport(analytics);

      expect(report).toContain('개선 제안');
    });
  });
});

