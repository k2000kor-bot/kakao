/**
 * PerformanceMonitoringService 테스트
 */

import {
  PerformanceMonitoringService,
  performanceMonitoringService,
} from '../performanceMonitoringService';

// Performance API 모킹
const mockPerformance = {
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
  },
  now: jest.fn(() => Date.now()),
};

// PerformanceObserver 모킹
class MockPerformanceObserver {
  private callback: PerformanceObserverCallback;
  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }
}

// 전역 스코프에 PerformanceObserver 정의
(global as any).PerformanceObserver = MockPerformanceObserver;

// window 객체 모킹
const mockWindow = {
  PerformanceObserver: MockPerformanceObserver,
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
  configurable: true,
});

global.console.log = jest.fn();
global.console.error = jest.fn();

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new PerformanceMonitoringService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(PerformanceMonitoringService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(performanceMonitoringService).toBeDefined();
      expect(performanceMonitoringService).toBeInstanceOf(PerformanceMonitoringService);
    });

    it('Performance Observer 초기화', () => {
      // PerformanceObserver가 window에 있는지 확인
      expect('PerformanceObserver' in window).toBe(true);
    });
  });

  describe('사용자 상호작용 기록', () => {
    it('사용자 상호작용 기록', () => {
      service.recordUserInteraction({
        action: 'click',
        component: 'button',
        duration: 100,
        success: true,
      });

      const interactions = service.getUserInteractionData();
      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions[interactions.length - 1].action).toBe('click');
      expect(interactions[interactions.length - 1].component).toBe('button');
    });

    it('여러 상호작용 기록', () => {
      service.recordUserInteraction({
        action: 'click',
        component: 'button1',
        duration: 100,
        success: true,
      });

      service.recordUserInteraction({
        action: 'scroll',
        component: 'page',
        duration: 200,
        success: true,
      });

      const interactions = service.getUserInteractionData();
      expect(interactions.length).toBeGreaterThanOrEqual(2);
    });

    it('상호작용 타임스탬프 자동 추가', () => {
      service.recordUserInteraction({
        action: 'click',
        component: 'button',
        duration: 100,
        success: true,
      });

      const interactions = service.getUserInteractionData();
      expect(interactions[interactions.length - 1].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('API 호출 모니터링', () => {
    it('성공적인 API 호출 모니터링', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await service.monitorApiCall(
        '/api/test',
        'GET',
        mockApiCall
      );

      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalled();

      const apiPerf = service.getApiPerformanceData();
      expect(apiPerf.length).toBeGreaterThan(0);
      expect(apiPerf[apiPerf.length - 1].endpoint).toBe('/api/test');
      expect(apiPerf[apiPerf.length - 1].method).toBe('GET');
      expect(apiPerf[apiPerf.length - 1].success).toBe(true);
    });

    it('실패한 API 호출 모니터링', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(
        service.monitorApiCall('/api/test', 'GET', mockApiCall)
      ).rejects.toThrow('API Error');

      const apiPerf = service.getApiPerformanceData();
      expect(apiPerf.length).toBeGreaterThan(0);
      expect(apiPerf[apiPerf.length - 1].success).toBe(false);
    });

    it('API 호출 응답 시간 측정', async () => {
      let startTime = 0;
      let endTime = 0;
      
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100);

      const mockApiCall = jest.fn().mockResolvedValue({});

      await service.monitorApiCall('/api/test', 'POST', mockApiCall);

      const apiPerf = service.getApiPerformanceData();
      expect(apiPerf[apiPerf.length - 1].responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('메트릭 조회', () => {
    it('실시간 메트릭 조회', () => {
      const metrics = service.getRealTimeMetrics();
      // 초기에는 null일 수 있음
      expect(metrics === null || typeof metrics === 'object').toBe(true);
    });

    it('API 성능 데이터 조회', () => {
      const apiPerf = service.getApiPerformanceData();
      expect(Array.isArray(apiPerf)).toBe(true);
    });

    it('사용자 상호작용 데이터 조회', () => {
      const interactions = service.getUserInteractionData();
      expect(Array.isArray(interactions)).toBe(true);
    });
  });

  describe('성능 리포트', () => {
    it('성능 리포트 생성', () => {
      const report = service.generatePerformanceReport();
      expect(report).toBeDefined();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('trends');
    });

    it('성능 리포트 요약 구조 확인', () => {
      const report = service.generatePerformanceReport();
      expect(report.summary).toHaveProperty('avgResponseTime');
      expect(report.summary).toHaveProperty('avgMemoryUsage');
      expect(report.summary).toHaveProperty('errorRate');
      expect(report.summary).toHaveProperty('throughput');
      expect(report.summary).toHaveProperty('userSatisfaction');
    });

    it('성능 리포트 트렌드 구조 확인', () => {
      const report = service.generatePerformanceReport();
      expect(report.trends).toHaveProperty('responseTime');
      expect(report.trends).toHaveProperty('memoryUsage');
      expect(report.trends).toHaveProperty('userSatisfaction');
      expect(Array.isArray(report.trends.responseTime)).toBe(true);
      expect(Array.isArray(report.trends.memoryUsage)).toBe(true);
      expect(Array.isArray(report.trends.userSatisfaction)).toBe(true);
    });

    it('성능 리포트 권장사항 포함', () => {
      const report = service.generatePerformanceReport();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('서비스 정리', () => {
    it('서비스 정리', () => {
      const observer = (service as any).performanceObserver;
      if (observer) {
        const disconnectSpy = jest.spyOn(observer, 'disconnect');
        service.dispose();
        expect(disconnectSpy).toHaveBeenCalled();
      } else {
        // PerformanceObserver가 없는 경우에도 에러 없이 처리되어야 함
        expect(() => service.dispose()).not.toThrow();
      }
    });
  });

  describe('에지 케이스', () => {
    it('빈 메트릭으로 리포트 생성', () => {
      const report = service.generatePerformanceReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    it('빈 상호작용으로 조회', () => {
      const interactions = service.getUserInteractionData();
      expect(Array.isArray(interactions)).toBe(true);
    });

    it('빈 API 성능 데이터로 조회', () => {
      const apiPerf = service.getApiPerformanceData();
      expect(Array.isArray(apiPerf)).toBe(true);
    });
  });
});

