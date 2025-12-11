/**
 * performanceMonitor 유틸리티 테스트
 * 성능 모니터링 기능 확인
 */

import performanceMonitor from '../performanceMonitor';

// PerformanceObserver 모킹
global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => []),
  };
}) as any;

// performance.now 모킹
const mockPerformanceNow = jest.fn(() => 1000);
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
    },
  },
  writable: true,
});

// navigator.connection 모킹
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
  writable: true,
  configurable: true,
});

// console.warn 모킹
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  describe('recordMetric', () => {
    it('메트릭을 기록해야 함', () => {
      performanceMonitor.recordMetric('test', 100, 'ms');

      const report = performanceMonitor.generateReport();
      expect(report.metrics.length).toBeGreaterThan(0);
      expect(report.metrics[report.metrics.length - 1].name).toBe('test');
      expect(report.metrics[report.metrics.length - 1].value).toBe(100);
    });

    it('최대 1000개까지만 유지해야 함', () => {
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.recordMetric('test', i);
      }

      const report = performanceMonitor.generateReport();
      expect(report.summary.totalMetrics).toBe(1000);
    });
  });

  describe('recordComponentPerformance', () => {
    it('컴포넌트 성능을 기록해야 함', () => {
      performanceMonitor.recordComponentPerformance('TestComponent', 10, 5);

      const report = performanceMonitor.generateReport();
      const component = report.components.find((c) => c.componentName === 'TestComponent');
      expect(component).toBeDefined();
      expect(component?.renderTime).toBe(10);
      expect(component?.mountTime).toBe(5);
      expect(component?.updateCount).toBe(1);
    });

    it('여러 번 업데이트 시 평균을 계산해야 함', () => {
      performanceMonitor.recordComponentPerformance('TestComponent', 10);
      performanceMonitor.recordComponentPerformance('TestComponent', 20);

      const report = performanceMonitor.generateReport();
      const component = report.components.find((c) => c.componentName === 'TestComponent');
      expect(component?.renderTime).toBe(15); // (10 + 20) / 2
      expect(component?.updateCount).toBe(2);
    });
  });

  describe('startMeasure', () => {
    it('성능 측정을 시작하고 종료할 수 있어야 함', () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const stopMeasure = performanceMonitor.startMeasure('test');
      const duration = stopMeasure();

      expect(duration).toBe(100);
      
      const report = performanceMonitor.generateReport();
      const metric = report.metrics.find((m) => m.name === 'test');
      expect(metric?.value).toBe(100);
    });
  });

  describe('getMemoryUsage', () => {
    it('메모리 사용량을 반환해야 함', () => {
      const usage = performanceMonitor.getMemoryUsage();

      expect(usage).not.toBeNull();
      expect(usage?.used).toBe(1000000);
      expect(usage?.total).toBe(2000000);
      expect(usage?.percentage).toBe(50);
    });

    it('메모리 정보가 없으면 null을 반환해야 함', () => {
      Object.defineProperty(global, 'performance', {
        value: { now: mockPerformanceNow },
        writable: true,
      });

      const usage = performanceMonitor.getMemoryUsage();
      expect(usage).toBeNull();
    });
  });

  describe('getNetworkPerformance', () => {
    it('네트워크 성능 정보를 반환해야 함', () => {
      const network = performanceMonitor.getNetworkPerformance();

      expect(network.connection).toBeDefined();
      expect(network.connection?.effectiveType).toBe('4g');
      expect(network.connection?.downlink).toBe(10);
      expect(network.connection?.rtt).toBe(50);
    });

    it('네트워크 정보가 없으면 빈 객체를 반환해야 함', () => {
      const originalConnection = (navigator as any).connection;
      delete (navigator as any).connection;

      const network = performanceMonitor.getNetworkPerformance();
      expect(network.connection).toBeUndefined();

      // 복원
      (navigator as any).connection = originalConnection;
    });
  });

  describe('getAverageMetric', () => {
    it('평균 메트릭을 계산해야 함', () => {
      performanceMonitor.recordMetric('test', 10);
      performanceMonitor.recordMetric('test', 20);
      performanceMonitor.recordMetric('test', 30);

      const average = performanceMonitor.getAverageMetric('test');

      expect(average).toBe(20);
    });

    it('메트릭이 없으면 null을 반환해야 함', () => {
      const average = performanceMonitor.getAverageMetric('nonexistent');

      expect(average).toBeNull();
    });

    it('lastN 파라미터를 사용해야 함', () => {
      for (let i = 1; i <= 20; i++) {
        performanceMonitor.recordMetric('test', i);
      }

      const average = performanceMonitor.getAverageMetric('test', 5);
      // 마지막 5개: 16, 17, 18, 19, 20의 평균
      expect(average).toBe(18);
    });
  });

  describe('generateReport', () => {
    it('성능 리포트를 생성해야 함', () => {
      performanceMonitor.recordMetric('test', 100);
      performanceMonitor.recordComponentPerformance('TestComponent', 10);

      const report = performanceMonitor.generateReport();

      expect(report.metrics.length).toBeGreaterThan(0);
      expect(report.components.length).toBeGreaterThan(0);
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
    });

    it('느린 컴포넌트를 식별해야 함', () => {
      performanceMonitor.recordComponentPerformance('SlowComponent', 20);
      performanceMonitor.recordComponentPerformance('FastComponent', 10);

      const report = performanceMonitor.generateReport();

      expect(report.summary.slowComponents.length).toBeGreaterThan(0);
      expect(report.summary.slowComponents.some((c) => c.componentName === 'SlowComponent')).toBe(true);
    });
  });

  describe('clear', () => {
    it('모든 메트릭을 초기화해야 함', () => {
      performanceMonitor.recordMetric('test', 100);
      performanceMonitor.recordComponentPerformance('TestComponent', 10);

      performanceMonitor.clear();

      const report = performanceMonitor.generateReport();
      expect(report.metrics.length).toBe(0);
      expect(report.components.length).toBe(0);
    });
  });
});

