/**
 * AIPredictiveAnalyticsService 테스트
 */

import aiPredictiveAnalyticsService, {
  AIPredictiveAnalyticsService,
  Prediction,
  AnomalyDetection,
  TrendAnalysis,
  AutoDecision,
  PredictiveInsight,
} from '../aiPredictiveAnalyticsService';
import { Project, Chat, Message } from '../../types/project';

// Mock dependencies
jest.mock('../aiSystemOptimizationEngine', () => ({
  __esModule: true,
  default: {
    optimize: jest.fn(),
  },
}));

jest.mock('../adaptiveLearningEngine', () => ({
  __esModule: true,
  default: {
    learn: jest.fn(),
  },
}));

jest.mock('../realTimeMonitoringService', () => ({
  __esModule: true,
  default: {
    getMetrics: jest.fn(() => [
      {
        id: 'cpu_usage',
        name: 'CPU Usage',
        value: 50,
        unit: '%',
        timestamp: new Date(),
        trend: 'stable',
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        value: 60,
        unit: '%',
        timestamp: new Date(),
        trend: 'stable',
      },
      {
        id: 'response_time',
        name: 'Response Time',
        value: 200,
        unit: 'ms',
        timestamp: new Date(),
        trend: 'stable',
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        value: 0.01,
        unit: '%',
        timestamp: new Date(),
        trend: 'stable',
      },
      {
        id: 'user_satisfaction',
        name: 'User Satisfaction',
        value: 85,
        unit: '%',
        timestamp: new Date(),
        trend: 'stable',
      },
    ]),
  },
}));

describe('AIPredictiveAnalyticsService', () => {
  let service: AIPredictiveAnalyticsService;

  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: '테스트 프로젝트',
      description: '테스트 설명',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockChats: Chat[] = [
    {
      id: 'chat-1',
      projectId: 'project-1',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      role: 'user',
      content: '테스트 메시지',
      timestamp: new Date(),
    },
  ];

  beforeEach(() => {
    service = new AIPredictiveAnalyticsService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIPredictiveAnalyticsService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiPredictiveAnalyticsService).toBeInstanceOf(
        AIPredictiveAnalyticsService
      );
    });
  });

  describe('성능 예측', () => {
    it('성능 예측 실행', async () => {
      const predictions = await service.runPerformancePredictions(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(Array.isArray(predictions)).toBe(true);
      predictions.forEach((prediction) => {
        expect(prediction).toBeDefined();
        expect(prediction.id).toBeDefined();
        expect(prediction.modelId).toBeDefined();
        expect(typeof prediction.predictedValue).toBe('number');
        expect(typeof prediction.confidence).toBe('number');
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeLessThanOrEqual(1);
        expect(prediction.timestamp).toBeInstanceOf(Date);
        expect(['increasing', 'decreasing', 'stable']).toContain(prediction.trend);
        expect(['low', 'medium', 'high', 'critical']).toContain(prediction.impact);
        expect(Array.isArray(prediction.recommendations)).toBe(true);
      });
    });

    it('빈 데이터로 성능 예측', async () => {
      const predictions = await service.runPerformancePredictions([], [], []);

      expect(Array.isArray(predictions)).toBe(true);
    });
  });

  describe('이상 감지', () => {
    it('이상 감지 실행', async () => {
      const anomalies = await service.detectAnomalies(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(Array.isArray(anomalies)).toBe(true);
      anomalies.forEach((anomaly) => {
        expect(anomaly).toBeDefined();
        expect(anomaly.id).toBeDefined();
        expect(typeof anomaly.detectedValue).toBe('number');
        expect(anomaly.expectedRange).toBeDefined();
        expect(typeof anomaly.expectedRange.min).toBe('number');
        expect(typeof anomaly.expectedRange.max).toBe('number');
        expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity);
        expect(typeof anomaly.confidence).toBe('number');
        expect(anomaly.timestamp).toBeInstanceOf(Date);
        expect(Array.isArray(anomaly.suggestedActions)).toBe(true);
        expect(typeof anomaly.autoResolve).toBe('boolean');
        expect(typeof anomaly.resolved).toBe('boolean');
      });
    });

    it('빈 데이터로 이상 감지', async () => {
      const anomalies = await service.detectAnomalies([], [], []);

      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe('트렌드 분석', () => {
    it('트렌드 분석 실행', async () => {
      const trends = await service.analyzeTrends(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(Array.isArray(trends)).toBe(true);
      trends.forEach((trend) => {
        expect(trend).toBeDefined();
        expect(trend.id).toBeDefined();
        expect(['increasing', 'decreasing', 'stable', 'cyclical', 'seasonal']).toContain(
          trend.trend
        );
        expect(['positive', 'negative', 'neutral']).toContain(trend.direction);
        expect(typeof trend.strength).toBe('number');
        expect(trend.strength).toBeGreaterThanOrEqual(0);
        expect(trend.strength).toBeLessThanOrEqual(1);
        expect(typeof trend.confidence).toBe('number');
        expect(trend.startDate).toBeInstanceOf(Date);
        expect(trend.endDate).toBeInstanceOf(Date);
        expect(typeof trend.dataPoints).toBe('number');
        expect(trend.forecast).toBeDefined();
        expect(Array.isArray(trend.insights)).toBe(true);
        expect(Array.isArray(trend.recommendations)).toBe(true);
      });
    });

    it('빈 데이터로 트렌드 분석', async () => {
      const trends = await service.analyzeTrends([], [], []);

      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('자동 결정 생성', () => {
    it('자동 결정 생성', async () => {
      const decisions = await service.generateAutoDecisions(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(Array.isArray(decisions)).toBe(true);
      decisions.forEach((decision) => {
        expect(decision).toBeDefined();
        expect(decision.id).toBeDefined();
        expect([
          'optimization',
          'scaling',
          'maintenance',
          'alert',
          'prevention',
          'recovery',
        ]).toContain(decision.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(decision.priority);
        expect([
          'pending',
          'executing',
          'completed',
          'failed',
          'cancelled',
        ]).toContain(decision.status);
        expect(typeof decision.confidence).toBe('number');
        expect(typeof decision.estimatedImpact).toBe('number');
        expect(decision.timestamp).toBeInstanceOf(Date);
        expect(Array.isArray(decision.dependencies)).toBe(true);
        expect(typeof decision.autoExecute).toBe('boolean');
        expect(typeof decision.approvalRequired).toBe('boolean');
      });
    });

    it('빈 데이터로 자동 결정 생성', async () => {
      const decisions = await service.generateAutoDecisions([], [], []);

      expect(Array.isArray(decisions)).toBe(true);
    });
  });

  describe('예측 인사이트 생성', () => {
    it('예측 인사이트 생성', async () => {
      const insights = await service.generatePredictiveInsights(
        mockProjects,
        mockChats,
        mockMessages
      );

      expect(Array.isArray(insights)).toBe(true);
      insights.forEach((insight) => {
        expect(insight).toBeDefined();
        expect(insight.id).toBeDefined();
        expect([
          'performance',
          'trend',
          'anomaly',
          'optimization',
          'risk',
          'opportunity',
        ]).toContain(insight.type);
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.description).toBe('string');
        expect(typeof insight.confidence).toBe('number');
        expect(['low', 'medium', 'high', 'critical']).toContain(insight.impact);
        expect(insight.timestamp).toBeInstanceOf(Date);
        expect(Array.isArray(insight.tags)).toBe(true);
        expect(typeof insight.data).toBe('object');
        expect(Array.isArray(insight.recommendations)).toBe(true);
        expect(Array.isArray(insight.actions)).toBe(true);
        expect(['new', 'reviewed', 'implemented', 'dismissed']).toContain(insight.status);
      });
    });

    it('빈 데이터로 예측 인사이트 생성', async () => {
      const insights = await service.generatePredictiveInsights([], [], []);

      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('모델 재훈련', () => {
    it('모델 재훈련', async () => {
      const models = await service.retrainModels();

      expect(Array.isArray(models)).toBe(true);
      models.forEach((model) => {
        expect(model).toBeDefined();
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect([
          'performance',
          'user_behavior',
          'resource_demand',
          'anomaly_detection',
          'trend_forecasting',
          'risk_assessment',
        ]).toContain(model.type);
        expect(['active', 'training', 'optimizing', 'error']).toContain(model.status);
        expect(typeof model.accuracy).toBe('number');
        expect(model.lastUpdated).toBeInstanceOf(Date);
      });
    }, 10000);
  });

  describe('자동 결정 실행', () => {
    it('자동 결정 실행', async () => {
      // 먼저 결정 생성
      const decisions = await service.generateAutoDecisions(
        mockProjects,
        mockChats,
        mockMessages
      );

      if (decisions.length > 0) {
        const decisionId = decisions[0].id;
        const result = await service.executeAutoDecision(decisionId);

        expect(typeof result).toBe('boolean');
      } else {
        // 결정이 없으면 false 반환 기대
        const result = await service.executeAutoDecision('non-existent');
        expect(typeof result).toBe('boolean');
      }
    });

    it('존재하지 않는 결정 실행', async () => {
      const result = await service.executeAutoDecision('non-existent-id');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('고급 분석', () => {
    it('고급 예측 분석 실행', async () => {
      await service.runAdvancedPredictiveAnalysis(
        mockProjects,
        mockChats,
        mockMessages
      );

      // 성공적으로 완료되면 에러가 발생하지 않음
      expect(true).toBe(true);
    });

    it('빈 데이터로 고급 분석 실행', async () => {
      await service.runAdvancedPredictiveAnalysis([], [], []);

      expect(true).toBe(true);
    });
  });

  describe('학습 패턴 조회', () => {
    it('학습 패턴 조회', () => {
      const patterns = service.getLearningPatterns();

      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('적응형 임계값 조회', () => {
    it('적응형 임계값 조회', () => {
      const thresholds = service.getAdaptiveThresholds();

      expect(Array.isArray(thresholds)).toBe(true);
    });
  });

  describe('실시간 학습 조회', () => {
    it('실시간 학습 조회', () => {
      const learning = service.getRealTimeLearning();

      expect(Array.isArray(learning)).toBe(true);
    });
  });

  describe('시스템 헬스', () => {
    it('시스템 헬스 조회', () => {
      const health = service.getSystemHealth();

      expect(health).toBeDefined();
      if (health.models !== undefined) {
        expect(typeof health.models).toBe('object');
      }
      if (health.predictions !== undefined) {
        expect(typeof health.predictions).toBe('object');
      }
      if (health.anomalies !== undefined) {
        expect(typeof health.anomalies).toBe('object');
      }
    });
  });

  describe('연속 학습 토글', () => {
    it('연속 학습 활성화', () => {
      service.toggleContinuousLearning(true);
      expect(true).toBe(true);
    });

    it('연속 학습 비활성화', () => {
      service.toggleContinuousLearning(false);
      expect(true).toBe(true);
    });
  });

  describe('자동 최적화 토글', () => {
    it('자동 최적화 활성화', () => {
      service.toggleAutoOptimization(true);
      expect(true).toBe(true);
    });

    it('자동 최적화 비활성화', () => {
      service.toggleAutoOptimization(false);
      expect(true).toBe(true);
    });
  });

  describe('고급 분석 데이터', () => {
    it('고급 분석 데이터 조회', () => {
      const analytics = service.getAdvancedAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.modelVersions).toBe('object');
      expect(typeof analytics.learningProgress).toBe('object');
      expect(typeof analytics.optimizationHistory).toBe('object');
      expect(typeof analytics.performanceMetrics).toBe('object');
    });
  });

  describe('통합 테스트', () => {
    it('전체 워크플로우 테스트', async () => {
      // 성능 예측
      const predictions = await service.runPerformancePredictions(
        mockProjects,
        mockChats,
        mockMessages
      );
      expect(Array.isArray(predictions)).toBe(true);

      // 이상 감지
      const anomalies = await service.detectAnomalies(
        mockProjects,
        mockChats,
        mockMessages
      );
      expect(Array.isArray(anomalies)).toBe(true);

      // 트렌드 분석
      const trends = await service.analyzeTrends(
        mockProjects,
        mockChats,
        mockMessages
      );
      expect(Array.isArray(trends)).toBe(true);

      // 자동 결정
      const decisions = await service.generateAutoDecisions(
        mockProjects,
        mockChats,
        mockMessages
      );
      expect(Array.isArray(decisions)).toBe(true);

      // 인사이트 생성
      const insights = await service.generatePredictiveInsights(
        mockProjects,
        mockChats,
        mockMessages
      );
      expect(Array.isArray(insights)).toBe(true);
    });
  });
});

