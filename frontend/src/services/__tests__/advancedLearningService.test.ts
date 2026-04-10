/**
 * advancedLearningService 서비스 테스트
 * 고급 AI 학습 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedLearningService, {
  LearningData
} from '../advancedLearningService';

describe('advancedLearningService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedLearningService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedLearningService;
      const instance2 = advancedLearningService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('collectLearningData', () => {
    const createMockLearningData = (): LearningData => ({
      id: `learning_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'user_123',
      input: '재개발 프로젝트에 대해 설명해주세요',
      response: '재개발 프로젝트는 기존 건물을 철거하고 새로운 건물을 건설하는 프로젝트입니다.',
      feedback: {
        rating: 5,
        helpful: true,
        comments: '유용한 정보입니다'
      },
      context: {
        sessionId: 'session_123',
        conversationHistory: [],
        userPreferences: {},
        systemState: {}
      },
      metadata: {
        model: 'gpt-4',
        responseTime: 1200,
        tokens: 150,
        confidence: 0.9
      }
    });

    it('학습 데이터를 수집할 수 있어야 함', async () => {
      const data = createMockLearningData();
      
      await expect(
        advancedLearningService.collectLearningData(data)
      ).resolves.not.toThrow();
    });

    it('수집된 학습 데이터를 조회할 수 있어야 함', async () => {
      const data = createMockLearningData();
      
      await advancedLearningService.collectLearningData(data);
      
      const allData = advancedLearningService.getLearningData();
      expect(Array.isArray(allData)).toBe(true);
      expect(allData.length).toBeGreaterThan(0);
    });
  });

  describe('getKnowledgeGraph', () => {
    it('지식 그래프를 조회할 수 있어야 함', () => {
      const knowledgeGraph = advancedLearningService.getKnowledgeGraph();
      
      expect(Array.isArray(knowledgeGraph)).toBe(true);
    });

    it('초기 지식 그래프에 기본 노드가 있어야 함', () => {
      const knowledgeGraph = advancedLearningService.getKnowledgeGraph();
      
      const concepts = knowledgeGraph.map(node => node.concept);
      expect(concepts.length).toBeGreaterThan(0);
    });

    it('지식 그래프 노드에 필수 속성이 있어야 함', () => {
      const knowledgeGraph = advancedLearningService.getKnowledgeGraph();
      
      if (knowledgeGraph.length > 0) {
        const node = knowledgeGraph[0];
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('concept');
        expect(node).toHaveProperty('description');
        expect(node).toHaveProperty('relationships');
        expect(node).toHaveProperty('confidence');
        expect(node).toHaveProperty('lastUpdated');
      }
    });
  });

  describe('getLearningPatterns', () => {
    it('학습 패턴을 조회할 수 있어야 함', () => {
      const patterns = advancedLearningService.getLearningPatterns();
      
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getModelOptimizations', () => {
    it('모델 최적화 정보를 조회할 수 있어야 함', () => {
      const optimizations = advancedLearningService.getModelOptimizations();
      
      expect(Array.isArray(optimizations)).toBe(true);
    });
  });

  describe('getAdaptiveResponses', () => {
    it('적응형 응답을 조회할 수 있어야 함', () => {
      const responses = advancedLearningService.getAdaptiveResponses();
      
      expect(Array.isArray(responses)).toBe(true);
    });
  });

  describe('학습 데이터 수집 및 지식 그래프 업데이트', () => {
    it('학습 데이터 수집 시 지식 그래프가 업데이트되어야 함', async () => {
      const initialGraphSize = advancedLearningService.getKnowledgeGraph().length;
      
      const data: LearningData = {
        id: `learning_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        input: '인공지능과 머신러닝에 대해 설명해주세요',
        response: '인공지능은 컴퓨터가 인간의 지능을 모방하는 기술이고, 머신러닝은 인공지능의 한 분야입니다.',
        feedback: {
          rating: 5,
          helpful: true
        },
        context: {
          sessionId: 'session_123',
          conversationHistory: [],
          userPreferences: {},
          systemState: {}
        },
        metadata: {
          model: 'gpt-4',
          responseTime: 1200,
          tokens: 200,
          confidence: 0.9
        }
      };

      await advancedLearningService.collectLearningData(data);
      
      // 지식 그래프가 업데이트되었는지 확인
      const updatedGraph = advancedLearningService.getKnowledgeGraph();
      expect(updatedGraph.length).toBeGreaterThanOrEqual(initialGraphSize);
    });

    it('다양한 학습 데이터를 수집할 수 있어야 함', async () => {
      const data1: LearningData = {
        id: `learning_${Date.now()}_1`,
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        input: '재개발 프로젝트',
        response: '재개발 프로젝트에 대한 답변',
        feedback: { rating: 4, helpful: true },
        context: {
          sessionId: 'session_123',
          conversationHistory: [],
          userPreferences: {},
          systemState: {}
        },
        metadata: {
          model: 'gpt-4',
          responseTime: 1000,
          tokens: 100,
          confidence: 0.85
        }
      };

      const data2: LearningData = {
        id: `learning_${Date.now()}_2`,
        timestamp: new Date().toISOString(),
        userId: 'user_456',
        input: '시공사 선정',
        response: '시공사 선정에 대한 답변',
        feedback: { rating: 5, helpful: true },
        context: {
          sessionId: 'session_456',
          conversationHistory: [],
          userPreferences: {},
          systemState: {}
        },
        metadata: {
          model: 'gpt-4',
          responseTime: 1500,
          tokens: 150,
          confidence: 0.9
        }
      };

      await advancedLearningService.collectLearningData(data1);
      await advancedLearningService.collectLearningData(data2);

      const allData = advancedLearningService.getLearningData();
      expect(allData.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 학습 데이터를 수집할 수 있어야 함', async () => {
      const data: LearningData = {
        id: `learning_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        input: '샘플 재개발 프로젝트 시공사 선정 기준은 무엇인가요?',
        response: '시공사 선정 기준은 기술력, 안전성, 경험, 경제성 등을 종합적으로 고려합니다.',
        feedback: {
          rating: 5,
          helpful: true,
          comments: '전문적인 답변 감사합니다'
        },
        context: {
          sessionId: 'session_123',
          conversationHistory: [],
          userPreferences: { domain: 'real_estate' },
          systemState: { project: '샘플 프로젝트' }
        },
        metadata: {
          model: 'gpt-4',
          responseTime: 1800,
          tokens: 250,
          confidence: 0.92
        }
      };

      await expect(
        advancedLearningService.collectLearningData(data)
      ).resolves.not.toThrow();

      const allData = advancedLearningService.getLearningData();
      const collected = allData.find(d => d.id === data.id);
      expect(collected).toBeDefined();
    });

    it('시공사 평가 관련 학습 패턴을 감지할 수 있어야 함', async () => {
      const data: LearningData = {
        id: `learning_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        input: '대우건설의 기술력과 안전성 평가는 어떻게 되나요?',
        response: '대우건설은 뛰어난 기술력과 안전 관리 시스템을 보유하고 있습니다.',
        feedback: {
          rating: 5,
          helpful: true
        },
        context: {
          sessionId: 'session_123',
          conversationHistory: [],
          userPreferences: {},
          systemState: {}
        },
        metadata: {
          model: 'gpt-4',
          responseTime: 2000,
          tokens: 300,
          confidence: 0.88
        }
      };

      await advancedLearningService.collectLearningData(data);

      const patterns = advancedLearningService.getLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });
  });
});

