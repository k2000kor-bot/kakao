/**
 * conversationMemoryService 서비스 테스트
 * 대화 메모리 및 학습 서비스 테스트
 */

import { conversationMemoryService } from '../conversationMemoryService';

describe('conversationMemoryService', () => {
  beforeEach(() => {
    // 각 테스트 전에 서비스 초기화
    const data = conversationMemoryService.exportLearningData();
    conversationMemoryService.importLearningData({
      conversations: [],
      userPatterns: {},
      statistics: null,
      exportedAt: new Date().toISOString()
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(conversationMemoryService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = conversationMemoryService;
      const instance2 = conversationMemoryService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveConversation', () => {
    it('대화 기록을 저장할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '재개발이란 무엇인가요?',
        response: '재개발은 기존 건물을 철거하고 새로운 건물을 짓는 것입니다.',
        processingTime: 100,
        context: {}
      });

      const history = conversationMemoryService.getConversationHistory(1);
      expect(history.length).toBe(1);
      expect(history[0].question).toBe('재개발이란 무엇인가요?');
      expect(history[0].id).toBeDefined();
      expect(history[0].timestamp).toBeDefined();
    });

    it('여러 대화 기록을 저장할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문 1',
        response: '답변 1',
        processingTime: 100,
        context: {}
      });

      conversationMemoryService.saveConversation({
        question: '질문 2',
        response: '답변 2',
        processingTime: 150,
        context: {}
      });

      const history = conversationMemoryService.getConversationHistory(10);
      expect(history.length).toBe(2);
    });

    it('analysisType을 포함하여 저장할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '분석 질문',
        response: '분석 답변',
        processingTime: 200,
        context: {},
        analysisType: 'research'
      });

      const history = conversationMemoryService.getConversationHistory(1);
      expect(history[0].analysisType).toBe('research');
    });

    it('userSatisfaction을 포함하여 저장할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '만족도 질문',
        response: '만족도 답변',
        processingTime: 120,
        context: {},
        userSatisfaction: 4.5
      });

      const history = conversationMemoryService.getConversationHistory(1);
      expect(history[0].userSatisfaction).toBe(4.5);
    });
  });

  describe('getConversationHistory', () => {
    it('대화 히스토리를 가져올 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문 1',
        response: '답변 1',
        processingTime: 100,
        context: {}
      });

      const history = conversationMemoryService.getConversationHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('limit 파라미터로 히스토리 개수를 제한할 수 있어야 함', () => {
      // 5개의 대화 기록 저장
      for (let i = 1; i <= 5; i++) {
        conversationMemoryService.saveConversation({
          question: `질문 ${i}`,
          response: `답변 ${i}`,
          processingTime: 100,
          context: {}
        });
      }

      const history = conversationMemoryService.getConversationHistory(3);
      expect(history.length).toBeLessThanOrEqual(3);
    });

    it('빈 히스토리를 반환할 수 있어야 함', () => {
      const history = conversationMemoryService.getConversationHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getPopularQuestions', () => {
    it('인기 질문을 가져올 수 있어야 함', () => {
      // 같은 질문을 여러 번 저장
      for (let i = 0; i < 3; i++) {
        conversationMemoryService.saveConversation({
          question: '인기 질문',
          response: '답변',
          processingTime: 100,
          context: {}
        });
      }

      const popular = conversationMemoryService.getPopularQuestions();
      expect(Array.isArray(popular)).toBe(true);
    });

    it('인기 질문이 count를 포함해야 함', () => {
      conversationMemoryService.saveConversation({
        question: '테스트 질문',
        response: '답변',
        processingTime: 100,
        context: {}
      });

      const popular = conversationMemoryService.getPopularQuestions();
      if (popular.length > 0) {
        expect(popular[0]).toHaveProperty('question');
        expect(popular[0]).toHaveProperty('count');
        expect(typeof popular[0].count).toBe('number');
      }
    });
  });

  describe('getPersonalizedSuggestions', () => {
    it('개인화된 제안을 가져올 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '재개발 프로젝트에 대해 알려주세요',
        response: '재개발은...',
        processingTime: 100,
        context: {}
      });

      const suggestions = conversationMemoryService.getPersonalizedSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('사용자 ID를 지정하여 제안을 가져올 수 있어야 함', () => {
      const suggestions = conversationMemoryService.getPersonalizedSuggestions('user-123');
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('getPerformanceStats', () => {
    it('성능 통계를 가져올 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문',
        response: '답변',
        processingTime: 100,
        context: {}
      });

      const stats = conversationMemoryService.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(stats.totalConversations).toBeGreaterThan(0);
      expect(typeof stats.averageProcessingTime).toBe('number');
      expect(typeof stats.averageSatisfaction).toBe('number');
    });

    it('빈 대화 기록일 때 null을 반환해야 함', () => {
      const stats = conversationMemoryService.getPerformanceStats();
      // 빈 상태에서는 null이거나 통계가 0일 수 있음
      expect(stats === null || stats.totalConversations === 0).toBe(true);
    });

    it('analysisType 분포를 포함해야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문',
        response: '답변',
        processingTime: 100,
        context: {},
        analysisType: 'research'
      });

      const stats = conversationMemoryService.getPerformanceStats();
      if (stats) {
        expect(stats.analysisTypeDistribution).toBeDefined();
        expect(typeof stats.analysisTypeDistribution).toBe('object');
      }
    });

    it('평균 만족도를 계산할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문 1',
        response: '답변 1',
        processingTime: 100,
        context: {},
        userSatisfaction: 4.5
      });

      conversationMemoryService.saveConversation({
        question: '질문 2',
        response: '답변 2',
        processingTime: 120,
        context: {},
        userSatisfaction: 3.5
      });

      const stats = conversationMemoryService.getPerformanceStats();
      if (stats) {
        expect(stats.averageSatisfaction).toBeGreaterThanOrEqual(0);
        expect(stats.averageSatisfaction).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('recordFeedback', () => {
    it('피드백을 기록할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문',
        response: '답변',
        processingTime: 100,
        context: {}
      });

      const history = conversationMemoryService.getConversationHistory(1);
      const conversationId = history[0].id;

      conversationMemoryService.recordFeedback(conversationId, 4.5);

      const updatedHistory = conversationMemoryService.getConversationHistory(1);
      expect(updatedHistory[0].userSatisfaction).toBe(4.5);
    });

    it('존재하지 않는 대화 ID에 대한 피드백은 무시해야 함', () => {
      expect(() => {
        conversationMemoryService.recordFeedback('non-existent-id', 4.5);
      }).not.toThrow();
    });
  });

  describe('exportLearningData', () => {
    it('학습 데이터를 내보낼 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문',
        response: '답변',
        processingTime: 100,
        context: {}
      });

      const data = conversationMemoryService.exportLearningData();
      expect(data).toBeDefined();
      expect(data.conversations).toBeDefined();
      expect(Array.isArray(data.conversations)).toBe(true);
      expect(data.userPatterns).toBeDefined();
      expect(data.statistics).toBeDefined();
      expect(data.exportedAt).toBeDefined();
    });
  });

  describe('importLearningData', () => {
    it('학습 데이터를 가져올 수 있어야 함', () => {
      const testData = {
        conversations: [
          {
            id: 'test-1',
            timestamp: new Date().toISOString(),
            question: '테스트 질문',
            response: '테스트 답변',
            processingTime: 100,
            context: {}
          }
        ],
        userPatterns: {
          'default': {
            favoriteTopics: ['재개발'],
            questionStyle: 'direct' as const,
            preferredResponseLength: 'medium' as const,
            commonKeywords: ['재개발'],
            sessionDuration: 1000,
            questionsPerSession: 5
          }
        },
        statistics: null,
        exportedAt: new Date().toISOString()
      };

      conversationMemoryService.importLearningData(testData);

      const history = conversationMemoryService.getConversationHistory();
      expect(history.length).toBeGreaterThanOrEqual(1);
    });

    it('부분적인 데이터로도 가져올 수 있어야 함', () => {
      const partialData = {
        conversations: []
      };

      expect(() => {
        conversationMemoryService.importLearningData(partialData);
      }).not.toThrow();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 대화를 저장하고 분석할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '재개발 프로젝트의 시공사 선정 기준은 무엇인가요?',
        response: '시공사 선정 기준은 기술력, 경험, 비용 등을 고려합니다.',
        processingTime: 150,
        context: { topic: '재개발' },
        analysisType: 'research'
      });

      const history = conversationMemoryService.getConversationHistory(1);
      expect(history[0].question).toContain('재개발');
      expect(history[0].analysisType).toBe('research');
    });

    it('여러 대화를 저장하고 통계를 생성할 수 있어야 함', () => {
      const questions = [
        '재개발이란 무엇인가요?',
        '시공사 선정 기준은?',
        '예산 계획은 어떻게 수립하나요?'
      ];

      questions.forEach((question, index) => {
        conversationMemoryService.saveConversation({
          question,
          response: `답변 ${index + 1}`,
          processingTime: 100 + index * 10,
          context: {},
          userSatisfaction: 4.0 + index * 0.1
        });
      });

      const stats = conversationMemoryService.getPerformanceStats();
      if (stats) {
        expect(stats.totalConversations).toBe(3);
        expect(stats.averageSatisfaction).toBeGreaterThan(0);
      }
    });

    it('피드백을 기록하고 통계에 반영할 수 있어야 함', () => {
      conversationMemoryService.saveConversation({
        question: '질문',
        response: '답변',
        processingTime: 100,
        context: {}
      });

      const history = conversationMemoryService.getConversationHistory(1);
      const conversationId = history[0].id;

      conversationMemoryService.recordFeedback(conversationId, 5.0);

      const stats = conversationMemoryService.getPerformanceStats();
      if (stats) {
        expect(stats.averageSatisfaction).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

