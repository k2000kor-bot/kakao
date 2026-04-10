/**
 * AISystemOptimizationEngine 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiSystemOptimizationEngine, {
  AISystemOptimizationEngine,
  SystemMetrics,
} from '../aiSystemOptimizationEngine';
import { Project, Chat, Message } from '../types/project';

// Mock adaptiveLearningEngine
jest.mock('../adaptiveLearningEngine', () => {
  const mockPattern = {
    id: 'pattern-1',
    pattern: 'test pattern',
    frequency: 1,
    impact: 0.5,
    confidence: 0.8,
    lastObserved: new Date(),
    category: 'user_behavior' as const,
  };
  const mockModel = {
    id: 'model-1',
    name: 'test model',
    version: '1.0',
    accuracy: 0.9,
    lastUpdated: new Date(),
    trainingDataSize: 100,
    performanceMetrics: {
      precision: 0.9,
      recall: 0.9,
      f1Score: 0.9,
      auc: 0.9,
    },
    modelType: 'classification' as const,
  };
  return {
    __esModule: true,
    default: {
      learnUserBehavior: jest.fn(() => [mockPattern]),
      getLearningPatterns: jest.fn(() => [mockPattern]),
      getAdaptiveModels: jest.fn(() => [mockModel]),
      getPredictiveInsights: jest.fn(() => []),
      retrainModels: jest.fn(() => ({ success: true })),
      generateLearningReport: jest.fn(() => ({ success: true })),
      getModelVersion: jest.fn(() => 1),
    },
  };
});

describe('AISystemOptimizationEngine', () => {
  let engine: AISystemOptimizationEngine;

  beforeEach(() => {
    engine = new AISystemOptimizationEngine();
  });

  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: '테스트 프로젝트',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockChats: Chat[] = [
    {
      id: 'chat-1',
      projectId: 'project-1',
      title: '테스트 대화',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      content: '테스트 메시지',
      sender: 'user',
      timestamp: new Date().toISOString(),
      isMe: true,
      type: 'user',
    },
  ];

  describe('초기화', () => {
    it('엔진 인스턴스 생성', () => {
      expect(engine).toBeInstanceOf(AISystemOptimizationEngine);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiSystemOptimizationEngine).toBeInstanceOf(
        AISystemOptimizationEngine
      );
    });
  });

  describe('시스템 메트릭 수집', () => {
    it('시스템 메트릭 수집', () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(metrics).toBeDefined();
      expect(typeof metrics.cpuUsage).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(typeof metrics.diskUsage).toBe('number');
      expect(typeof metrics.networkLatency).toBe('number');
      expect(typeof metrics.responseTime).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
      expect(typeof metrics.userSatisfaction).toBe('number');
      expect(typeof metrics.systemUptime).toBe('number');
      expect(typeof metrics.activeUsers).toBe('number');
      expect(typeof metrics.concurrentSessions).toBe('number');
    });

    it('빈 데이터로 메트릭 수집', () => {
      const metrics = engine.collectSystemMetrics([], [], []);

      expect(metrics).toBeDefined();
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('시스템 건강도 분석', () => {
    it('시스템 건강도 분석', () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );
      const healthScore = engine.analyzeSystemHealth(metrics);

      expect(healthScore).toBeDefined();
      expect(typeof healthScore.overall).toBe('number');
      expect(typeof healthScore.performance).toBe('number');
      expect(typeof healthScore.security).toBe('number');
      expect(typeof healthScore.userExperience).toBe('number');
      expect(typeof healthScore.resourceEfficiency).toBe('number');
      expect(typeof healthScore.workflowOptimization).toBe('number');
      expect(healthScore.lastUpdated).toBeInstanceOf(Date);
      expect(healthScore.trends).toBeDefined();
    });

    it('건강도 점수 범위 확인', () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );
      const healthScore = engine.analyzeSystemHealth(metrics);

      expect(healthScore.overall).toBeGreaterThanOrEqual(0);
      expect(healthScore.overall).toBeLessThanOrEqual(100);
      expect(healthScore.performance).toBeGreaterThanOrEqual(0);
      expect(healthScore.performance).toBeLessThanOrEqual(100);
    });
  });

  describe('최적화 권장사항 생성', () => {
    it('최적화 권장사항 생성', () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );
      const healthScore = engine.analyzeSystemHealth(metrics);
      const recommendations = engine.generateOptimizationRecommendations(
        metrics,
        healthScore
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('높은 CPU 사용량 시 권장사항 생성', () => {
      const highCpuMetrics: SystemMetrics = {
        cpuUsage: 90,
        memoryUsage: 60,
        diskUsage: 50,
        networkLatency: 50,
        responseTime: 300,
        errorRate: 0.5,
        userSatisfaction: 80,
        systemUptime: 99.5,
        activeUsers: 20,
        concurrentSessions: 15,
      };

      const healthScore = engine.analyzeSystemHealth(highCpuMetrics);
      const recommendations = engine.generateOptimizationRecommendations(
        highCpuMetrics,
        healthScore
      );

      expect(recommendations.length).toBeGreaterThan(0);
      const cpuRecommendation = recommendations.find(
        (r) => r.category === 'performance'
      );
      expect(cpuRecommendation).toBeDefined();
    });
  });

  describe('자동 최적화 실행', () => {
    it('자동 최적화 실행', async () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );
      const healthScore = engine.analyzeSystemHealth(metrics);
      const recommendations = engine.generateOptimizationRecommendations(
        metrics,
        healthScore
      );

      const actions = await engine.executeAutoOptimization(recommendations);

      expect(Array.isArray(actions)).toBe(true);
    });

    it('빈 권장사항으로 자동 최적화 실행', async () => {
      const actions = await engine.executeAutoOptimization([]);

      expect(Array.isArray(actions)).toBe(true);
    });
  });

  describe('예측 분석', () => {
    it('예측 분석 생성', () => {
      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        mockMessages
      );
      const healthScore = engine.analyzeSystemHealth(metrics);
      const predictions = engine.generatePredictiveAnalysis(
        metrics,
        healthScore
      );

      expect(Array.isArray(predictions)).toBe(true);
    });
  });

  describe('적응형 학습', () => {
    it('사용자 행동 학습', () => {
      // learnUserBehavior는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.learnUserBehavior(mockProjects, mockChats, mockMessages);
      }).not.toThrow();
    });

    it('학습 패턴 가져오기', () => {
      // getLearningPatterns는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.getLearningPatterns();
      }).not.toThrow();
    });

    it('적응형 모델 가져오기', () => {
      // getAdaptiveModels는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.getAdaptiveModels();
      }).not.toThrow();
    });

    it('예측 인사이트 가져오기', () => {
      // getPredictiveInsights는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.getPredictiveInsights();
      }).not.toThrow();
    });

    it('모델 재훈련', () => {
      // retrainModels는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.retrainModels();
      }).not.toThrow();
    });

    it('학습 리포트 생성', () => {
      // generateLearningReport는 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공
      expect(() => {
        engine.generateLearningReport();
      }).not.toThrow();
    });

    it('모델 버전 가져오기', () => {
      // getModelVersion은 adaptiveLearningEngine을 통해 호출되므로
      // 에러가 발생하지 않으면 성공 (mock이 제대로 설정되지 않을 수 있으므로)
      expect(() => {
        engine.getModelVersion();
      }).not.toThrow();
    });
  });

  describe('다양한 시나리오', () => {
    it('많은 프로젝트로 메트릭 수집', () => {
      const manyProjects: Project[] = Array.from({ length: 10 }, (_, i) => ({
        id: `project-${i}`,
        name: `프로젝트 ${i}`,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const metrics = engine.collectSystemMetrics(
        manyProjects,
        mockChats,
        mockMessages
      );

      expect(metrics.cpuUsage).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });

    it('많은 메시지로 메트릭 수집', () => {
      const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        chatId: 'chat-1',
        content: `메시지 ${i}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        isMe: true,
        type: 'user' as const,
      }));

      const metrics = engine.collectSystemMetrics(
        mockProjects,
        mockChats,
        manyMessages
      );

      expect(metrics).toBeDefined();
      expect(metrics.activeUsers).toBeGreaterThanOrEqual(0);
    });
  });
});

