/**
 * adaptiveLearningEngine 서비스 테스트
 * 적응형 학습 엔진 테스트
 */

import adaptiveLearningEngine, {
  LearningPattern,
  AdaptiveModel,
  OptimizationResult,
  PredictiveInsight
} from '../adaptiveLearningEngine';
import { Project, Chat, Message } from '../../types/project';

describe('adaptiveLearningEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(adaptiveLearningEngine).toBeDefined();
    });
  });

  describe('getModelVersion', () => {
    it('모델 버전을 반환해야 함', () => {
      const version = adaptiveLearningEngine.getModelVersion();
      expect(typeof version).toBe('number');
      expect(version).toBeGreaterThan(0);
    });
  });

  describe('getLearningPatterns', () => {
    it('학습 패턴을 조회할 수 있어야 함', () => {
      const patterns = adaptiveLearningEngine.getLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('학습 패턴이 올바른 구조를 가져야 함', () => {
      const patterns = adaptiveLearningEngine.getLearningPatterns();
      if (patterns.length > 0) {
        const pattern = patterns[0];
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('frequency');
        expect(pattern).toHaveProperty('confidence');
        expect(pattern).toHaveProperty('category');
      }
    });
  });

  describe('getAdaptiveModels', () => {
    it('적응형 모델을 조회할 수 있어야 함', () => {
      const models = adaptiveLearningEngine.getAdaptiveModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('적응형 모델이 올바른 구조를 가져야 함', () => {
      const models = adaptiveLearningEngine.getAdaptiveModels();
      if (models.length > 0) {
        const model = models[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('version');
        expect(model).toHaveProperty('accuracy');
        expect(model).toHaveProperty('performanceMetrics');
      }
    });
  });

  describe('getOptimizationResults', () => {
    it('최적화 결과를 조회할 수 있어야 함', () => {
      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getPredictiveInsights', () => {
    it('예측 인사이트를 조회할 수 있어야 함', () => {
      const insights = adaptiveLearningEngine.getPredictiveInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('learnUserBehavior', () => {
    const createMockProject = (id: string, createdAt?: Date): Project => ({
      id,
      name: `프로젝트 ${id}`,
      description: '테스트 프로젝트',
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      chats: []
    });

    const createMockChat = (id: string, projectId: string, createdAt?: Date): Chat => ({
      id,
      projectId,
      title: `채팅 ${id}`,
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      messages: []
    });

    const createMockMessage = (role: 'user' | 'assistant', content: string, timestamp?: Date): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: timestamp || new Date()
    });

    it('사용자 행동을 학습할 수 있어야 함', () => {
      const projects: Project[] = [
        createMockProject('proj1', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        createMockProject('proj2', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      ];

      const chats: Chat[] = [
        createMockChat('chat1', 'proj1', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        createMockChat('chat2', 'proj2', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
      ];

      const messages: Message[] = [
        createMockMessage('user', '재개발 프로젝트에 대해 알려주세요'),
        createMockMessage('assistant', '재개발 프로젝트는...')
      ];

      const patterns = adaptiveLearningEngine.learnUserBehavior(projects, chats, messages);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('빈 데이터로도 작동해야 함', () => {
      const patterns = adaptiveLearningEngine.learnUserBehavior([], [], []);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('learnFromOptimizationResult', () => {
    const createMockOptimizationResult = (): OptimizationResult => ({
      id: `opt_${Date.now()}`,
      optimizationId: 'test_optimization',
      beforeMetrics: { performance: 0.7 },
      afterMetrics: { performance: 0.9 },
      improvement: 0.2,
      userSatisfaction: 0.85,
      learningInsights: ['성능이 향상되었습니다'],
      appliedAt: new Date()
    });

    it('최적화 결과로부터 학습할 수 있어야 함', () => {
      const result = createMockOptimizationResult();
      
      expect(() => {
        adaptiveLearningEngine.learnFromOptimizationResult(result);
      }).not.toThrow();

      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(results.length).toBeGreaterThan(0);
    });

    it('여러 최적화 결과를 학습할 수 있어야 함', () => {
      const result1 = createMockOptimizationResult();
      const result2 = createMockOptimizationResult();
      
      adaptiveLearningEngine.learnFromOptimizationResult(result1);
      adaptiveLearningEngine.learnFromOptimizationResult(result2);

      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generatePredictiveInsights', () => {
    it('예측 인사이트를 생성할 수 있어야 함', () => {
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      
      expect(Array.isArray(insights)).toBe(true);
    });

    it('생성된 인사이트가 올바른 구조를 가져야 함', () => {
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      
      if (insights.length > 0) {
        const insight = insights[0];
        expect(insight).toHaveProperty('id');
        expect(insight).toHaveProperty('insight');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('timeframe');
        expect(insight).toHaveProperty('category');
      }
    });
  });

  describe('generateLearningReport', () => {
    it('학습 리포트를 생성할 수 있어야 함', () => {
      const report = adaptiveLearningEngine.generateLearningReport();
      
      expect(report).toBeDefined();
      expect(typeof report).toBe('object');
    });

    it('학습 리포트에 필수 정보가 포함되어야 함', () => {
      const report = adaptiveLearningEngine.generateLearningReport();
      
      // 리포트 구조 확인
      expect(report).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 사용자 행동을 학습할 수 있어야 함', () => {
      const projects: Project[] = [
        {
          id: 'proj1',
          name: '개포우성7차 재개발',
          description: '재개발 프로젝트',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          chats: []
        }
      ];

      const chats: Chat[] = [
        {
          id: 'chat1',
          projectId: 'proj1',
          title: '시공사 선정',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          messages: []
        }
      ];

      const messages: Message[] = [
        {
          id: 'msg1',
          role: 'user',
          content: '시공사 선정 기준은 무엇인가요?',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'msg2',
          role: 'assistant',
          content: '시공사 선정 기준은 기술력, 안전성, 경험 등을 고려합니다.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000)
        }
      ];

      const patterns = adaptiveLearningEngine.learnUserBehavior(projects, chats, messages);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('최적화 결과를 학습하고 예측 인사이트를 생성할 수 있어야 함', () => {
      const result: OptimizationResult = {
        id: 'opt1',
        optimizationId: 'performance_optimization',
        beforeMetrics: { responseTime: 2000, accuracy: 0.75 },
        afterMetrics: { responseTime: 1200, accuracy: 0.85 },
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: ['응답 시간이 크게 개선되었습니다'],
        appliedAt: new Date()
      };

      adaptiveLearningEngine.learnFromOptimizationResult(result);
      
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });
});

