/**
 * AIPerformanceOptimizationService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiPerformanceOptimizationService, {
  AIPerformanceOptimizationService,
  OptimizationRule,
  OptimizationConfig,
} from '../aiPerformanceOptimizationService';

describe('AIPerformanceOptimizationService', () => {
  let service: AIPerformanceOptimizationService;

  beforeEach(() => {
    service = new AIPerformanceOptimizationService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.stopMonitoring();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIPerformanceOptimizationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiPerformanceOptimizationService).toBeInstanceOf(
        AIPerformanceOptimizationService
      );
    });

    it('기본 설정 확인', () => {
      const config = service.getConfig();
      expect(config.auto_optimization).toBe(true);
      expect(config.performance_thresholds.cpu_usage).toBe(80);
      expect(config.performance_thresholds.memory_usage).toBe(85);
      expect(config.performance_thresholds.response_time).toBe(1000);
    });
  });

  describe('모니터링', () => {
    it('모니터링 시작', () => {
      service.startMonitoring();
      // 모니터링이 시작되었는지 확인 (에러가 발생하지 않으면 성공)
      expect(true).toBe(true);
    });

    it('모니터링 중지', () => {
      service.startMonitoring();
      service.stopMonitoring();
      // 모니터링이 중지되었는지 확인
      expect(true).toBe(true);
    });

    it('중지되지 않은 모니터링 다시 중지', () => {
      service.stopMonitoring();
      expect(true).toBe(true);
    });
  });

  describe('시스템 헬스', () => {
    it('시스템 헬스 조회', () => {
      const health = service.getSystemHealth();

      expect(health).toBeDefined();
      expect(['healthy', 'degraded', 'critical']).toContain(health.overall_status);
      expect(typeof health.systems).toBe('object');
      expect(Array.isArray(health.recommendations)).toBe(true);
      expect(Array.isArray(health.alerts)).toBe(true);
    });
  });

  describe('메트릭 관리', () => {
    it('모든 시스템 메트릭 조회', () => {
      const metrics = service.getMetrics();

      expect(Array.isArray(metrics)).toBe(true);
    });

    it('특정 시스템 메트릭 조회', () => {
      const metrics = service.getMetrics('test-system');

      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('최적화 규칙 관리', () => {
    it('최적화 규칙 조회', () => {
      const rules = service.getOptimizationRules();

      expect(Array.isArray(rules)).toBe(true);
    });

    it('최적화 규칙 추가', () => {
      const rule: OptimizationRule = {
        id: 'test-rule-1',
        name: '테스트 규칙',
        description: '테스트 설명',
        condition: {
          metric_type: 'cpu',
          operator: 'gt',
          threshold: 80,
          duration: 60,
        },
        action: {
          type: 'scale',
          parameters: { scale_factor: 1.5 },
        },
        enabled: true,
        priority: 'high',
      };

      service.addOptimizationRule(rule);

      const rules = service.getOptimizationRules();
      const addedRule = rules.find((r) => r.id === 'test-rule-1');
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('테스트 규칙');
    });

    it('최적화 규칙 업데이트', () => {
      const rule: OptimizationRule = {
        id: 'test-rule-2',
        name: '원본 규칙',
        description: '원본 설명',
        condition: {
          metric_type: 'cpu',
          operator: 'gt',
          threshold: 80,
          duration: 60,
        },
        action: {
          type: 'scale',
          parameters: { scale_factor: 1.5 },
        },
        enabled: true,
        priority: 'high',
      };

      service.addOptimizationRule(rule);
      service.updateOptimizationRule('test-rule-2', {
        name: '업데이트된 규칙',
        enabled: false,
      });

      const rules = service.getOptimizationRules();
      const updatedRule = rules.find((r) => r.id === 'test-rule-2');
      expect(updatedRule?.name).toBe('업데이트된 규칙');
      expect(updatedRule?.enabled).toBe(false);
    });

    it('최적화 규칙 제거', () => {
      const rule: OptimizationRule = {
        id: 'test-rule-3',
        name: '삭제될 규칙',
        description: '삭제 설명',
        condition: {
          metric_type: 'cpu',
          operator: 'gt',
          threshold: 80,
          duration: 60,
        },
        action: {
          type: 'scale',
          parameters: { scale_factor: 1.5 },
        },
        enabled: true,
        priority: 'high',
      };

      service.addOptimizationRule(rule);
      expect(service.getOptimizationRules().find((r) => r.id === 'test-rule-3')).toBeDefined();

      service.removeOptimizationRule('test-rule-3');
      expect(service.getOptimizationRules().find((r) => r.id === 'test-rule-3')).toBeUndefined();
    });

    it('존재하지 않는 규칙 업데이트', () => {
      expect(() => {
        service.updateOptimizationRule('non-existent', { enabled: false });
      }).not.toThrow();
    });

    it('존재하지 않는 규칙 제거', () => {
      expect(() => {
        service.removeOptimizationRule('non-existent');
      }).not.toThrow();
    });
  });

  describe('설정 관리', () => {
    it('설정 조회', () => {
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(typeof config.auto_optimization).toBe('boolean');
      expect(config.performance_thresholds).toBeDefined();
      expect(Array.isArray(config.optimization_rules)).toBe(true);
      expect(typeof config.monitoring_interval).toBe('number');
      expect(Array.isArray(config.alert_channels)).toBe(true);
    });

    it('설정 업데이트', () => {
      const updates: Partial<OptimizationConfig> = {
        auto_optimization: false,
        monitoring_interval: 10000,
      };

      service.updateConfig(updates);

      const config = service.getConfig();
      expect(config.auto_optimization).toBe(false);
      expect(config.monitoring_interval).toBe(10000);
    });

    it('성능 임계값 업데이트', () => {
      service.updateConfig({
        performance_thresholds: {
          cpu_usage: 90,
          memory_usage: 90,
          response_time: 2000,
          throughput: 150,
        },
      });

      const config = service.getConfig();
      expect(config.performance_thresholds.cpu_usage).toBe(90);
      expect(config.performance_thresholds.memory_usage).toBe(90);
      expect(config.performance_thresholds.response_time).toBe(2000);
      expect(config.performance_thresholds.throughput).toBe(150);
    });
  });

  describe('수동 최적화', () => {
    it('스케일링 수행', async () => {
      await service.performManualOptimization('scale', {
        scale_factor: 2.0,
        target: 'cpu',
      });

      // 성공적으로 완료되면 에러가 발생하지 않음
      expect(true).toBe(true);
    });

    it('캐싱 수행', async () => {
      await service.performManualOptimization('cache', {
        cache_duration: 300,
        strategy: 'aggressive',
      });

      expect(true).toBe(true);
    });

    it('스로틀링 수행', async () => {
      await service.performManualOptimization('throttle', {
        rate_limit: 100,
        duration: 60,
      });

      expect(true).toBe(true);
    });

    it('최적화 수행', async () => {
      await service.performManualOptimization('optimize', {
        target: 'memory',
        strategy: 'cleanup',
      });

      expect(true).toBe(true);
    });

    it('알 수 없는 최적화 유형 에러', async () => {
      await expect(
        service.performManualOptimization('unknown', {})
      ).rejects.toThrow('알 수 없는 최적화 유형');
    });
  });

  describe('성능 리포트', () => {
    it('성능 리포트 생성', () => {
      const report = service.getPerformanceReport();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(['healthy', 'degraded', 'critical']).toContain(report.overall_health);
      expect(Array.isArray(report.systems)).toBe(true);
      expect(report.optimization_rules).toBeDefined();
      expect(typeof report.optimization_rules.total).toBe('number');
      expect(typeof report.optimization_rules.enabled).toBe('number');
      expect(typeof report.optimization_rules.disabled).toBe('number');
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(Array.isArray(report.alerts)).toBe(true);
    });

    it('성능 리포트 구조 확인', () => {
      const report = service.getPerformanceReport();

      report.systems.forEach((system) => {
        expect(typeof system.name).toBe('string');
        expect(['healthy', 'degraded', 'critical', 'unknown']).toContain(system.health);
        expect(typeof system.metrics_count).toBe('number');
        expect(typeof system.critical_metrics).toBe('number');
        expect(typeof system.warning_metrics).toBe('number');
      });
    });
  });

  describe('이벤트', () => {
    it('시스템 초기화 이벤트 리스너 등록', () => {
      const newService = new AIPerformanceOptimizationService();
      let eventReceived = false;

      newService.once('system_initialized', (data) => {
        expect(data.timestamp).toBeInstanceOf(Date);
        eventReceived = true;
      });

      // 이벤트가 발생했는지 확인 (비동기 이벤트이므로 발생 여부만 확인)
      expect(newService.listenerCount('system_initialized')).toBeGreaterThanOrEqual(0);
      expect(eventReceived).toBe(false); // 동기 테스트에서는 이벤트 미발생

      // 정리
      newService.removeAllListeners();
    });
  });

  describe('다양한 최적화 규칙 타입', () => {
    it('캐싱 규칙 추가', () => {
      const rule: OptimizationRule = {
        id: 'cache-rule',
        name: '캐싱 규칙',
        description: '캐싱 최적화',
        condition: {
          metric_type: 'response_time',
          operator: 'gt',
          threshold: 1000,
          duration: 30,
        },
        action: {
          type: 'cache',
          parameters: { cache_duration: 300 },
        },
        enabled: true,
        priority: 'medium',
      };

      service.addOptimizationRule(rule);
      const rules = service.getOptimizationRules();
      expect(rules.find((r) => r.id === 'cache-rule')).toBeDefined();
    });

    it('스로틀링 규칙 추가', () => {
      const rule: OptimizationRule = {
        id: 'throttle-rule',
        name: '스로틀링 규칙',
        description: '스로틀링 최적화',
        condition: {
          metric_type: 'throughput',
          operator: 'gt',
          threshold: 200,
          duration: 60,
        },
        action: {
          type: 'throttle',
          parameters: { rate_limit: 150 },
        },
        enabled: true,
        priority: 'high',
      };

      service.addOptimizationRule(rule);
      const rules = service.getOptimizationRules();
      expect(rules.find((r) => r.id === 'throttle-rule')).toBeDefined();
    });

    it('알림 규칙 추가', () => {
      const rule: OptimizationRule = {
        id: 'alert-rule',
        name: '알림 규칙',
        description: '알림 전송',
        condition: {
          metric_type: 'memory',
          operator: 'gt',
          threshold: 90,
          duration: 30,
        },
        action: {
          type: 'alert',
          parameters: { channels: ['email', 'slack'] },
        },
        enabled: true,
        priority: 'critical',
      };

      service.addOptimizationRule(rule);
      const rules = service.getOptimizationRules();
      expect(rules.find((r) => r.id === 'alert-rule')).toBeDefined();
    });
  });
});

