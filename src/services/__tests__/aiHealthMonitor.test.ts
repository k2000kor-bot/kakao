/**
 * AIHealthMonitor 테스트
 */

import aiHealthMonitor, {
  AIHealthMonitor,
  ServiceHealth,
  SystemHealth,
  HealthCheckResult,
  HealthThreshold,
} from '../aiHealthMonitor';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AIHealthMonitor', () => {
  let monitor: AIHealthMonitor;

  beforeEach(() => {
    monitor = new AIHealthMonitor();
    jest.useFakeTimers();
  });

  afterEach(() => {
    monitor.stop();
    monitor.shutdown();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('모니터 인스턴스 생성', () => {
      expect(monitor).toBeInstanceOf(AIHealthMonitor);
    });

    it('기본 임계값 초기화 확인', () => {
      const threshold = monitor.getThreshold('test-service');
      // 기본 임계값이 설정되어 있지 않으면 null 반환
      expect(threshold === null || typeof threshold === 'object').toBe(true);
    });
  });

  describe('시작/중지', () => {
    it('모니터 시작', () => {
      monitor.start();
      expect(monitor.isSystemRunning()).toBe(true);
    });

    it('모니터 중지', () => {
      monitor.start();
      expect(monitor.isSystemRunning()).toBe(true);

      monitor.stop();
      expect(monitor.isSystemRunning()).toBe(false);
    });

    it('이미 중지된 모니터 다시 중지', () => {
      monitor.stop();
      expect(monitor.isSystemRunning()).toBe(false);
    });
  });

  describe('서비스 등록/해제', () => {
    it('서비스 등록', () => {
      monitor.registerService('test-service');
      const health = monitor.getServiceHealth('test-service');
      expect(health).toBeDefined();
      expect(health?.service_name).toBe('test-service');
      expect(health?.status).toBe('healthy');
    });

    it('초기 헬스 데이터로 서비스 등록', () => {
      const initialHealth: Partial<ServiceHealth> = {
        status: 'warning',
        response_time: 100,
        error_rate: 0.1,
      };

      monitor.registerService('test-service', initialHealth);
      const health = monitor.getServiceHealth('test-service');
      expect(health?.status).toBe('warning');
      expect(health?.response_time).toBe(100);
      expect(health?.error_rate).toBe(0.1);
    });

    it('서비스 해제', () => {
      monitor.registerService('test-service');
      expect(monitor.getServiceHealth('test-service')).toBeDefined();

      const result = monitor.unregisterService('test-service');
      expect(result).toBe(true);
      expect(monitor.getServiceHealth('test-service')).toBeNull();
    });

    it('존재하지 않는 서비스 해제', () => {
      const result = monitor.unregisterService('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('서비스 헬스 업데이트', () => {
    it('서비스 헬스 업데이트', () => {
      monitor.registerService('test-service');
      monitor.updateServiceHealth('test-service', {
        response_time: 200,
        error_rate: 0.05,
        memory_usage: 512,
      });

      const health = monitor.getServiceHealth('test-service');
      expect(health?.response_time).toBe(200);
      expect(health?.error_rate).toBe(0.05);
      expect(health?.memory_usage).toBe(512);
    });

    it('존재하지 않는 서비스 헬스 업데이트', () => {
      expect(() => {
        monitor.updateServiceHealth('non-existent', { response_time: 100 });
      }).not.toThrow();
    });
  });

  describe('헬스 체크', () => {
    it('서비스 헬스 체크 수행', async () => {
      monitor.registerService('test-service');
      const result = await monitor.performHealthCheck('test-service');

      expect(result).toBeDefined();
      expect(result.service_name).toBe('test-service');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.response_time).toBe('number');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('존재하지 않는 서비스 헬스 체크', async () => {
      const result = await monitor.performHealthCheck('non-existent');
      expect(result).toBeDefined();
      expect(result.service_name).toBe('non-existent');
    });

    it('시스템 헬스 체크 수행', async () => {
      monitor.registerService('service-1');
      monitor.registerService('service-2');

      const systemHealth = await monitor.performSystemHealthCheck();

      expect(systemHealth).toBeDefined();
      expect(systemHealth.overall_status).toMatch(/healthy|warning|critical/);
      expect(systemHealth.total_services).toBe(2);
      expect(Array.isArray(systemHealth.services)).toBe(true);
      expect(typeof systemHealth.system_uptime).toBe('number');
      expect(typeof systemHealth.performance_score).toBe('number');
      expect(typeof systemHealth.reliability_score).toBe('number');
      expect(typeof systemHealth.availability_score).toBe('number');
    });

    it('빈 시스템 헬스 체크', async () => {
      const systemHealth = await monitor.performSystemHealthCheck();
      expect(systemHealth.total_services).toBe(0);
      expect(systemHealth.overall_status).toBe('healthy');
    });
  });

  describe('헬스 상태 조회', () => {
    it('시스템 헬스 상태 조회', () => {
      monitor.registerService('service-1');
      monitor.registerService('service-2');

      const systemHealth = monitor.getSystemHealth();

      expect(systemHealth).toBeDefined();
      expect(systemHealth.total_services).toBe(2);
      expect(systemHealth.healthy_services).toBeGreaterThanOrEqual(0);
      expect(systemHealth.warning_services).toBeGreaterThanOrEqual(0);
      expect(systemHealth.critical_services).toBeGreaterThanOrEqual(0);
      expect(systemHealth.offline_services).toBeGreaterThanOrEqual(0);
    });

    it('서비스 헬스 상태 조회', () => {
      monitor.registerService('test-service');
      const health = monitor.getServiceHealth('test-service');

      expect(health).toBeDefined();
      expect(health?.service_name).toBe('test-service');
      expect(health?.status).toMatch(/healthy|warning|critical|offline/);
    });

    it('존재하지 않는 서비스 헬스 상태 조회', () => {
      const health = monitor.getServiceHealth('non-existent');
      expect(health).toBeNull();
    });

    it('모든 서비스 헬스 상태 조회', () => {
      monitor.registerService('service-1');
      monitor.registerService('service-2');

      const allHealth = monitor.getAllServicesHealth();
      expect(Array.isArray(allHealth)).toBe(true);
      expect(allHealth.length).toBe(2);
    });
  });

  describe('헬스 체크 히스토리', () => {
    it('헬스 체크 히스토리 조회', async () => {
      monitor.registerService('test-service');
      await monitor.performHealthCheck('test-service');
      await monitor.performHealthCheck('test-service');

      const history = monitor.getHealthHistory('test-service');
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('헬스 체크 히스토리 제한', async () => {
      monitor.registerService('test-service');
      for (let i = 0; i < 5; i++) {
        await monitor.performHealthCheck('test-service');
      }

      const history = monitor.getHealthHistory('test-service', 3);
      expect(history.length).toBeLessThanOrEqual(3);
    });

    it('존재하지 않는 서비스의 헬스 체크 히스토리', () => {
      const history = monitor.getHealthHistory('non-existent');
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });

  describe('임계값 관리', () => {
    it('임계값 설정', () => {
      const threshold: HealthThreshold = {
        service_name: 'test-service',
        max_response_time: 500,
        max_error_rate: 0.1,
        max_memory_usage: 1024,
        max_cpu_usage: 80,
        min_uptime: 3600,
      };

      monitor.setThreshold('test-service', threshold);
      const retrieved = monitor.getThreshold('test-service');

      expect(retrieved).toBeDefined();
      expect(retrieved?.max_response_time).toBe(500);
      expect(retrieved?.max_error_rate).toBe(0.1);
    });

    it('임계값 조회', () => {
      const threshold: HealthThreshold = {
        service_name: 'test-service',
        max_response_time: 300,
        max_error_rate: 0.05,
        max_memory_usage: 512,
        max_cpu_usage: 70,
        min_uptime: 1800,
      };

      monitor.setThreshold('test-service', threshold);
      const retrieved = monitor.getThreshold('test-service');

      expect(retrieved).toBeDefined();
      expect(retrieved?.service_name).toBe('test-service');
    });

    it('존재하지 않는 서비스의 임계값 조회', () => {
      const threshold = monitor.getThreshold('non-existent');
      expect(threshold).toBeNull();
    });
  });

  describe('서비스 재시작', () => {
    it('서비스 재시작', async () => {
      monitor.registerService('test-service');
      const result = await monitor.restartService('test-service');

      expect(typeof result).toBe('boolean');
    });

    it('존재하지 않는 서비스 재시작', async () => {
      const result = await monitor.restartService('non-existent');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('서비스 통계', () => {
    it('서비스 통계 조회', async () => {
      monitor.registerService('test-service');
      await monitor.performHealthCheck('test-service');

      const stats = monitor.getServiceStats('test-service');
      expect(stats).toBeDefined();
    });

    it('존재하지 않는 서비스의 통계 조회', () => {
      const stats = monitor.getServiceStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('시스템 종료', () => {
    it('시스템 종료', () => {
      monitor.registerService('service-1');
      monitor.registerService('service-2');

      expect(monitor.getAllServicesHealth().length).toBe(2);

      monitor.shutdown();

      expect(monitor.getAllServicesHealth().length).toBe(0);
      expect(monitor.isSystemRunning()).toBe(false);
    });
  });

  describe('다양한 서비스 상태', () => {
    it('경고 상태 서비스', () => {
      monitor.registerService('warning-service');
      monitor.updateServiceHealth('warning-service', {
        status: 'warning',
        response_time: 500,
        error_rate: 0.15,
      });

      const health = monitor.getServiceHealth('warning-service');
      expect(health?.status).toBe('warning');
    });

    it('위험 상태 서비스', () => {
      monitor.registerService('critical-service');
      monitor.updateServiceHealth('critical-service', {
        status: 'critical',
        response_time: 1000,
        error_rate: 0.5,
      });

      const health = monitor.getServiceHealth('critical-service');
      expect(health?.status).toBe('critical');
    });

    it('오프라인 상태 서비스', () => {
      monitor.registerService('offline-service');
      monitor.updateServiceHealth('offline-service', {
        status: 'offline',
      });

      const health = monitor.getServiceHealth('offline-service');
      expect(health?.status).toBe('offline');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiHealthMonitor).toBeInstanceOf(AIHealthMonitor);
    });
  });
});

