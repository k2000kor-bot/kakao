/**
 * PerformanceOptimizationService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  API_PERFORMANCE_HEALTH_PATH,
  API_PERFORMANCE_METRICS_PATH,
  API_PERFORMANCE_OPTIMIZE_PATH,
  API_PERFORMANCE_RECOMMENDATIONS_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../../config/api';
import {
  PerformanceOptimizationService,
  performanceOptimizationService,
  PerformanceMetrics,
  SystemHealth,
  OptimizationRecommendation,
  OptimizationResult,
} from '../performanceOptimizationService';
import axios from 'axios';

// axios ESM 대응: requireActual 없이 수동 모킹 (Jest에서 node_modules/axios ESM 로드 방지)
jest.mock('axios', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockInstance = { get: mockGet, post: mockPost };
  return {
    default: { get: mockGet, post: mockPost, create: jest.fn(() => mockInstance) },
    get: mockGet,
    post: mockPost,
  };
});

const mockedAxios: jest.Mocked<typeof axios> = jest.mocked(axios);

/** setInterval(async () => { await ... }) 콜백이 첫 await 이후 이어지도록 마이크로태스크 플러시 */
async function flushMicrotasks(times = 15): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

global.console.error = jest.fn();

describe('PerformanceOptimizationService', () => {
  let service: PerformanceOptimizationService;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new PerformanceOptimizationService();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.useRealTimers();
    mockDateNow.mockRestore();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(PerformanceOptimizationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(performanceOptimizationService).toBeDefined();
      expect(performanceOptimizationService).toBeInstanceOf(PerformanceOptimizationService);
    });
  });

  describe('성능 메트릭 조회', () => {
    it('성능 메트릭 조회 성공', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMetrics,
      });

      const result = await service.getPerformanceMetrics();

      expect(result).toEqual(mockMetrics);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_PERFORMANCE_METRICS_PATH)
      );
    });

    it('성능 메트릭 조회 실패 처리', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getPerformanceMetrics()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('시스템 건강도 조회', () => {
    it('시스템 건강도 조회 성공', async () => {
      const mockHealth: SystemHealth = {
        overall: 85,
        cpu: 80,
        memory: 90,
        disk: 85,
        network: 90,
        security: 95,
        last_check: 1000000,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockHealth,
      });

      const result = await service.getSystemHealth();

      expect(result).toEqual(mockHealth);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_PERFORMANCE_HEALTH_PATH)
      );
    });

    it('시스템 건강도 조회 실패 처리', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getSystemHealth()).rejects.toThrow('Network error');
    });
  });

  describe('최적화 권장사항 조회', () => {
    it('최적화 권장사항 조회 성공', async () => {
      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'memory',
          priority: 'high',
          title: '메모리 최적화',
          description: '메모리 사용량을 줄이세요',
          impact: 0.3,
          estimated_time: 300,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          recommendations: mockRecommendations,
        },
      });

      const result = await service.getOptimizationRecommendations();

      expect(result).toEqual(mockRecommendations);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_PERFORMANCE_RECOMMENDATIONS_PATH)
      );
    });

    it('최적화 권장사항 조회 실패 처리', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getOptimizationRecommendations()).rejects.toThrow('Network error');
    });
  });

  describe('최적화 적용', () => {
    it('최적화 적용 성공', async () => {
      const mockResult: OptimizationResult = {
        id: 'opt-1',
        type: 'memory',
        status: 'completed',
        applied_at: 1000000,
        impact: {
          cpu_improvement: 10,
          memory_improvement: 20,
          response_time_improvement: 15,
        },
        message: '최적화 완료',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResult,
      });

      const result = await service.applyOptimization({
        id: 'opt-1',
        type: 'memory',
      });

      expect(result).toEqual(mockResult);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_PERFORMANCE_OPTIMIZE_PATH),
        {
          id: 'opt-1',
          type: 'memory',
        }
      );
    });

    it('최적화 적용 실패 처리', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Optimization failed'));

      await expect(
        service.applyOptimization({
          id: 'opt-1',
          type: 'memory',
        })
      ).rejects.toThrow('Optimization failed');
    });
  });

  describe('캐시 관리', () => {
    it('캐시된 메트릭 반환', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMetrics,
      });

      await service.getPerformanceMetrics();
      const cached = service.getCachedMetrics();

      expect(cached).toEqual(mockMetrics);
    });

    it('캐시 만료된 메트릭 null 반환', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockMetrics,
      });

      await service.getPerformanceMetrics();
      
      // 캐시 타임아웃 이후
      mockDateNow.mockReturnValue(1000000 + 31000);
      const cached = service.getCachedMetrics();

      expect(cached).toBeNull();
    });

    it('캐시된 건강도 반환', async () => {
      const mockHealth: SystemHealth = {
        overall: 85,
        cpu: 80,
        memory: 90,
        disk: 85,
        network: 90,
        security: 95,
        last_check: 1000000,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockHealth,
      });

      await service.getSystemHealth();
      const cached = service.getCachedHealth();

      expect(cached).toEqual(mockHealth);
    });

    it('캐시된 권장사항 반환', async () => {
      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'memory',
          priority: 'high',
          title: '메모리 최적화',
          description: '메모리 사용량을 줄이세요',
          impact: 0.3,
          estimated_time: 300,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          recommendations: mockRecommendations,
        },
      });

      await service.getOptimizationRecommendations();
      const cached = service.getCachedRecommendations();

      expect(cached).toEqual(mockRecommendations);
    });
  });

  describe('유틸리티 메서드', () => {
    it('바이트 포맷팅', () => {
      expect(service.formatBytes(0)).toBe('0 Bytes');
      expect(service.formatBytes(1024)).toBe('1 KB');
      expect(service.formatBytes(1048576)).toBe('1 MB');
      expect(service.formatBytes(1073741824)).toBe('1 GB');
    });

    it('CPU 상태 평가', () => {
      expect(service.getCPUStatus(20)).toBe('excellent');
      expect(service.getCPUStatus(50)).toBe('good');
      expect(service.getCPUStatus(70)).toBe('warning');
      expect(service.getCPUStatus(90)).toBe('critical');
    });

    it('메모리 상태 평가', () => {
      expect(service.getMemoryStatus(40)).toBe('excellent');
      expect(service.getMemoryStatus(60)).toBe('good');
      expect(service.getMemoryStatus(80)).toBe('warning');
      expect(service.getMemoryStatus(90)).toBe('critical');
    });

    it('디스크 상태 평가', () => {
      expect(service.getDiskStatus(50)).toBe('excellent');
      expect(service.getDiskStatus(75)).toBe('good');
      expect(service.getDiskStatus(85)).toBe('warning');
      expect(service.getDiskStatus(95)).toBe('critical');
    });

    it('성능 점수 계산', () => {
      const metrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      const score = service.calculatePerformanceScore(metrics);
      expect(score).toBe(50); // (50 + 50 + 50) / 3 = 50
    });
  });

  describe('실시간 모니터링', () => {
    it('실시간 모니터링 시작', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      // setInterval 내부 async + axios는 가짜 타이머와 마이크로태스크 순서에 걸리기 쉬움 → 인스턴스 메서드만 스텁
      const getMetricsSpy = jest
        .spyOn(service, 'getPerformanceMetrics')
        .mockResolvedValue(mockMetrics);

      const callback = jest.fn();
      const intervalId = service.startRealTimeMonitoring(callback);

      try {
        jest.advanceTimersByTime(10000);
        await flushMicrotasks();
        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(mockMetrics);
      } finally {
        service.stopRealTimeMonitoring(intervalId);
        getMetricsSpy.mockRestore();
      }
    });

    it('실시간 모니터링 중지', () => {
      const callback = jest.fn();
      const intervalId = service.startRealTimeMonitoring(callback);

      service.stopRealTimeMonitoring(intervalId);

      jest.advanceTimersByTime(10000);
      // 중지 후에는 콜백이 호출되지 않아야 함
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('자동 최적화', () => {
    it('자동 최적화 실행', async () => {
      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'memory',
          priority: 'critical',
          title: '메모리 최적화',
          description: '메모리 사용량을 줄이세요',
          impact: 0.3,
          estimated_time: 300,
        },
        {
          id: 'rec-2',
          type: 'cpu',
          priority: 'high',
          title: 'CPU 최적화',
          description: 'CPU 사용량을 줄이세요',
          impact: 0.2,
          estimated_time: 200,
        },
        {
          id: 'rec-3',
          type: 'disk',
          priority: 'low',
          title: '디스크 최적화',
          description: '디스크 사용량을 줄이세요',
          impact: 0.1,
          estimated_time: 100,
        },
      ];

      const mockResult1: OptimizationResult = {
        id: 'opt-1',
        type: 'memory',
        status: 'completed',
        applied_at: 1000000,
        impact: {
          cpu_improvement: 10,
          memory_improvement: 20,
          response_time_improvement: 15,
        },
        message: '최적화 완료',
      };

      const mockResult2: OptimizationResult = {
        id: 'opt-2',
        type: 'cpu',
        status: 'completed',
        applied_at: 1000000,
        impact: {
          cpu_improvement: 15,
          memory_improvement: 10,
          response_time_improvement: 10,
        },
        message: '최적화 완료',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          recommendations: mockRecommendations,
        },
      });

      mockedAxios.post
        .mockResolvedValueOnce({ data: mockResult1 })
        .mockResolvedValueOnce({ data: mockResult2 });

      jest.useRealTimers();
      const results = await service.runAutoOptimization();
      jest.useFakeTimers();

      expect(results.length).toBe(2); // critical과 high만 적용
      expect(results[0]).toEqual(mockResult1);
      expect(results[1]).toEqual(mockResult2);
    });

    it('자동 최적화 실패 처리', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.runAutoOptimization()).rejects.toThrow('Network error');
    });
  });

  describe('성능 리포트 생성', () => {
    it('성능 리포트 생성 성공', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 50,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 4000000000,
          used: 4000000000,
          percent: 50,
        },
        disk: {
          total: 1000000000000,
          used: 500000000000,
          free: 500000000000,
          percent: 50,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      const mockHealth: SystemHealth = {
        overall: 85,
        cpu: 80,
        memory: 90,
        disk: 85,
        network: 90,
        security: 95,
        last_check: 1000000,
      };

      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'memory',
          priority: 'high',
          title: '메모리 최적화',
          description: '메모리 사용량을 줄이세요',
          impact: 0.3,
          estimated_time: 300,
        },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockMetrics })
        .mockResolvedValueOnce({ data: mockHealth })
        .mockResolvedValueOnce({
          data: {
            recommendations: mockRecommendations,
          },
        });

      const report = await service.generatePerformanceReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('health');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('score');
      expect(report).toHaveProperty('summary');
      expect(report.metrics).toEqual(mockMetrics);
      expect(report.health).toEqual(mockHealth);
      expect(report.recommendations).toEqual(mockRecommendations);
    });

    it('높은 성능 점수 리포트', async () => {
      const mockMetrics: PerformanceMetrics = {
        timestamp: 1000000,
        cpu: {
          usage_percent: 5,
          count: 4,
        },
        memory: {
          total: 8000000000,
          available: 7600000000,
          used: 400000000,
          percent: 5,
        },
        disk: {
          total: 1000000000000,
          used: 100000000000,
          free: 900000000000,
          percent: 10,
        },
        network: {
          bytes_sent: 1000000,
          bytes_recv: 2000000,
          packets_sent: 100,
          packets_recv: 200,
        },
        system: {
          processes: 100,
          boot_time: 1000000,
        },
      };

      const mockHealth: SystemHealth = {
        overall: 95,
        cpu: 95,
        memory: 95,
        disk: 95,
        network: 95,
        security: 95,
        last_check: 1000000,
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockMetrics })
        .mockResolvedValueOnce({ data: mockHealth })
        .mockResolvedValueOnce({
          data: {
            recommendations: [],
          },
        });

      const report = await service.generatePerformanceReport();

      expect(report.score).toBeGreaterThanOrEqual(90);
      expect(report.summary).toContain('매우 우수');
    });

    it('성능 리포트 생성 실패 처리', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.generatePerformanceReport()).rejects.toThrow('Network error');
    });
  });

  describe('에지 케이스', () => {
    it('빈 권장사항으로 자동 최적화', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          recommendations: [],
        },
      });

      jest.useRealTimers();
      const results = await service.runAutoOptimization();
      jest.useFakeTimers();

      expect(results).toEqual([]);
    });

    it('최적화 적용 중 일부 실패', async () => {
      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'memory',
          priority: 'critical',
          title: '메모리 최적화',
          description: '메모리 사용량을 줄이세요',
          impact: 0.3,
          estimated_time: 300,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          recommendations: mockRecommendations,
        },
      });

      mockedAxios.post.mockRejectedValueOnce(new Error('Optimization failed'));

      jest.useRealTimers();
      const results = await service.runAutoOptimization();
      jest.useFakeTimers();

      expect(results).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });
});

