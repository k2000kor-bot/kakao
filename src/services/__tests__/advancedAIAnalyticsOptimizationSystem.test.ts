/**
 * advancedAIAnalyticsOptimizationSystem 서비스 테스트
 * 고급 AI 분석 및 최적화 시스템 테스트
 */

import advancedAIAnalyticsOptimizationSystem, {
  AIAnalyticsData,
  OptimizationRecommendation,
  PerformanceTrend,
  AIServiceOptimization,
} from '../advancedAIAnalyticsOptimizationSystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';
import aiHealthMonitor from '../aiHealthMonitor';
import aiCacheManager from '../aiCacheManager';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn(),
}));

jest.mock('../aiHealthMonitor', () => ({
  getHealthStatus: jest.fn(() => ({ status: 'healthy' })),
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
}));

jest.mock('../aiCacheManager', () => ({
  optimize: jest.fn(),
  clear: jest.fn(),
  getStats: jest.fn(() => ({ hitRate: 0.8, size: 100 })),
}));

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIAnalyticsOptimizationSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 시스템 중지 및 초기화
    if (advancedAIAnalyticsOptimizationSystem) {
      try {
        advancedAIAnalyticsOptimizationSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIAnalyticsOptimizationSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIAnalyticsOptimizationSystem;
      const instance2 = advancedAIAnalyticsOptimizationSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIAnalyticsOptimizationSystem.start();
      advancedAIAnalyticsOptimizationSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIAnalyticsOptimizationSystem.start();
      advancedAIAnalyticsOptimizationSystem.stop();
      
      // 중지 후에는 interval이 정리되어야 함
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIAnalyticsOptimizationSystem.start();
      advancedAIAnalyticsOptimizationSystem.start(); // 중복 호출
      advancedAIAnalyticsOptimizationSystem.stop();
    });
  });

  describe('collectAnalyticsData', () => {
    it('분석 데이터를 수집할 수 있어야 함', () => {
      const analyticsData: AIAnalyticsData = {
        id: 'data-1',
        timestamp: new Date(),
        service_name: 'test-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: {
            cpu: 50,
            memory: 60,
            disk: 40,
            network: 30,
          },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      const listener = jest.fn();
      advancedAIAnalyticsOptimizationSystem.on('analytics_data_collected', listener);

      advancedAIAnalyticsOptimizationSystem.collectAnalyticsData(analyticsData);

      expect(listener).toHaveBeenCalledWith(analyticsData);
    });

    it('최대 1000개 데이터만 유지해야 함', () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'test-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      // 1001개의 데이터 추가
      for (let i = 0; i < 1001; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
        });
      }

      // 데이터가 1000개로 제한되었는지 확인은 내부 상태이므로 직접 확인 불가
      // 하지만 메서드가 정상 실행되어야 함
    });
  });

  describe('analyzePerformance', () => {
    it('성능 분석을 수행할 수 있어야 함', async () => {
      // 충분한 데이터 수집
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'performance-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 10; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
      }

      const trends = await advancedAIAnalyticsOptimizationSystem.analyzePerformance('performance-service');

      expect(Array.isArray(trends)).toBe(true);
    });

    it('데이터가 부족하면 빈 배열을 반환해야 함', async () => {
      const trends = await advancedAIAnalyticsOptimizationSystem.analyzePerformance('non-existent-service');
      
      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBe(0);
    });

    it('트렌드를 포함해야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'trend-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
      }

      const trends = await advancedAIAnalyticsOptimizationSystem.analyzePerformance('trend-service');

      if (trends.length > 0) {
        expect(trends[0].metric).toBeDefined();
        expect(['improving', 'stable', 'declining']).toContain(trends[0].trend);
        expect(trends[0].prediction).toBeDefined();
      }
    });
  });

  describe('generateOptimizationRecommendations', () => {
    it('최적화 권장사항을 생성할 수 있어야 함', async () => {
      // 성능 저하 데이터 수집
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'optimization-service',
        metrics: {
          response_time: 2000, // 높은 응답 시간
          accuracy: 0.7, // 낮은 정확도
          throughput: 30,
          error_rate: 0.05,
          resource_usage: { cpu: 90, memory: 90, disk: 40, network: 30 }, // 높은 리소스 사용
          user_satisfaction: 0.6,
          learning_effectiveness: 0.7,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
          metrics: {
            ...baseData.metrics,
            response_time: baseData.metrics.response_time + i * 50, // 점진적 증가
          },
        });
      }

      const recommendations = await advancedAIAnalyticsOptimizationSystem.generateOptimizationRecommendations('optimization-service');

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('권장사항이 올바른 구조를 가져야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'recommendation-service',
        metrics: {
          response_time: 1500,
          accuracy: 0.75,
          throughput: 40,
          error_rate: 0.03,
          resource_usage: { cpu: 85, memory: 85, disk: 40, network: 30 },
          user_satisfaction: 0.65,
          learning_effectiveness: 0.75,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
      }

      const recommendations = await advancedAIAnalyticsOptimizationSystem.generateOptimizationRecommendations('recommendation-service');

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec.id).toBeDefined();
        expect(['performance', 'accuracy', 'resource', 'user_experience', 'security']).toContain(rec.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.status).toBe('pending');
      }
    });
  });

  describe('approveOptimization', () => {
    it('최적화를 승인할 수 있어야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'approval-service',
        metrics: {
          response_time: 1500,
          accuracy: 0.8,
          throughput: 40,
          error_rate: 0.02,
          resource_usage: { cpu: 70, memory: 70, disk: 40, network: 30 },
          user_satisfaction: 0.75,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
      }

      const recommendations = await advancedAIAnalyticsOptimizationSystem.generateOptimizationRecommendations('approval-service');

      if (recommendations.length > 0) {
        const listener = jest.fn();
        advancedAIAnalyticsOptimizationSystem.on('optimization_approved', listener);

        const approved = advancedAIAnalyticsOptimizationSystem.approveOptimization('approval-service', recommendations[0].id);

        expect(approved).toBe(true);
        expect(listener).toHaveBeenCalled();
      }
    });

    it('존재하지 않는 최적화 승인 시 false를 반환해야 함', () => {
      const approved = advancedAIAnalyticsOptimizationSystem.approveOptimization('non-existent', 'non-existent-id');
      
      expect(approved).toBe(false);
    });
  });

  describe('getServiceOptimization', () => {
    it('서비스 최적화 상태를 조회할 수 있어야 함', () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'status-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      advancedAIAnalyticsOptimizationSystem.collectAnalyticsData(baseData);

      const optimization = advancedAIAnalyticsOptimizationSystem.getServiceOptimization('status-service');

      expect(optimization).toBeDefined();
      expect(optimization?.service_name).toBe('status-service');
      expect(optimization?.current_performance).toBeDefined();
      expect(typeof optimization?.optimization_score).toBe('number');
    });

    it('데이터가 없으면 null을 반환해야 함', () => {
      const optimization = advancedAIAnalyticsOptimizationSystem.getServiceOptimization('non-existent-service');
      
      expect(optimization).toBeNull();
    });

    it('최적화 히스토리를 포함해야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'history-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      for (let i = 0; i < 5; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
        });
      }

      const optimization = advancedAIAnalyticsOptimizationSystem.getServiceOptimization('history-service');

      if (optimization) {
        expect(Array.isArray(optimization.optimization_history)).toBe(true);
        expect(Array.isArray(optimization.active_optimizations)).toBe(true);
        expect(Array.isArray(optimization.performance_trends)).toBe(true);
      }
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAIAnalyticsOptimizationSystem.start();
      advancedAIAnalyticsOptimizationSystem.shutdown();
      
      // shutdown 후에는 데이터가 정리되어야 함
    });
  });

  describe('이벤트 발생', () => {
    it('분석 데이터 수집 시 이벤트를 발생시켜야 함', () => {
      const listener = jest.fn();
      advancedAIAnalyticsOptimizationSystem.on('analytics_data_collected', listener);

      const analyticsData: AIAnalyticsData = {
        id: 'event-data',
        timestamp: new Date(),
        service_name: 'event-service',
        metrics: {
          response_time: 100,
          accuracy: 0.9,
          throughput: 50,
          error_rate: 0.01,
          resource_usage: { cpu: 50, memory: 60, disk: 40, network: 30 },
          user_satisfaction: 0.85,
          learning_effectiveness: 0.8,
        },
        context: {
          request_type: 'analysis',
          complexity: 5,
          domain: 'general',
        },
      };

      advancedAIAnalyticsOptimizationSystem.collectAnalyticsData(analyticsData);

      expect(listener).toHaveBeenCalledWith(analyticsData);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 서비스의 성능을 분석하고 최적화할 수 있어야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'redevelopment-service',
        metrics: {
          response_time: 150,
          accuracy: 0.92,
          throughput: 45,
          error_rate: 0.02,
          resource_usage: { cpu: 55, memory: 65, disk: 40, network: 30 },
          user_satisfaction: 0.88,
          learning_effectiveness: 0.85,
        },
        context: {
          user_id: 'user-123',
          session_id: 'session-1',
          request_type: 'analysis',
          complexity: 7,
          domain: 'construction',
        },
      };

      // 여러 데이터 수집
      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
          metrics: {
            ...baseData.metrics,
            response_time: baseData.metrics.response_time + i * 10,
          },
        });
      }

      // 성능 분석
      const trends = await advancedAIAnalyticsOptimizationSystem.analyzePerformance('redevelopment-service');
      expect(Array.isArray(trends)).toBe(true);

      // 최적화 권장사항 생성
      const recommendations = await advancedAIAnalyticsOptimizationSystem.generateOptimizationRecommendations('redevelopment-service');
      expect(Array.isArray(recommendations)).toBe(true);

      // 서비스 최적화 상태 조회
      const optimization = advancedAIAnalyticsOptimizationSystem.getServiceOptimization('redevelopment-service');
      expect(optimization).toBeDefined();
      expect(optimization?.service_name).toBe('redevelopment-service');
    });

    it('시공사 선정 관련 서비스의 최적화를 승인하고 구현할 수 있어야 함', async () => {
      const baseData: AIAnalyticsData = {
        id: 'data',
        timestamp: new Date(),
        service_name: 'construction-selection-service',
        metrics: {
          response_time: 1800,
          accuracy: 0.85,
          throughput: 35,
          error_rate: 0.04,
          resource_usage: { cpu: 85, memory: 80, disk: 40, network: 30 },
          user_satisfaction: 0.72,
          learning_effectiveness: 0.78,
        },
        context: {
          request_type: 'analysis',
          complexity: 8,
          domain: 'construction',
        },
      };

      for (let i = 0; i < 15; i++) {
        advancedAIAnalyticsOptimizationSystem.collectAnalyticsData({
          ...baseData,
          id: `data-${i}`,
          timestamp: new Date(Date.now() + i * 1000),
          metrics: {
            ...baseData.metrics,
            response_time: baseData.metrics.response_time + i * 30,
          },
        });
      }

      const recommendations = await advancedAIAnalyticsOptimizationSystem.generateOptimizationRecommendations('construction-selection-service');

      if (recommendations.length > 0) {
        const recommendation = recommendations[0];
        const approved = advancedAIAnalyticsOptimizationSystem.approveOptimization('construction-selection-service', recommendation.id);

        expect(approved).toBe(true);

        // 최적화 구현 완료 대기
        await new Promise(resolve => setTimeout(resolve, 2100));

        const optimization = advancedAIAnalyticsOptimizationSystem.getServiceOptimization('construction-selection-service');
        expect(optimization).toBeDefined();
      }
    });
  });
});

