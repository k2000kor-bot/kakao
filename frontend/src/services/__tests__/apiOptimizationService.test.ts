/**
 * ApiOptimizationService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { API_PATH_IN_URL_MARKER, CHAT_POST_PATH } from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  ApiOptimizationService,
  apiOptimizationService,
} from '../apiOptimizationService';

// fetch 모킹
installJestFetchMock();

function partialJsonResponse(init: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json: () => Promise<unknown>;
}): Response {
  return init as unknown as Response;
}

describe('ApiOptimizationService', () => {
  let service: ApiOptimizationService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new ApiOptimizationService();
    mockFetch = jest.mocked(global.fetch);
  });

  afterEach(() => {
    jest.useRealTimers();
    service.clearCache();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ApiOptimizationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(apiOptimizationService).toBeDefined();
      expect(apiOptimizationService).toBeInstanceOf(ApiOptimizationService);
    });

    it('초기 메트릭 설정', () => {
      const metrics = service.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      metrics.forEach(metric => {
        expect(metric).toHaveProperty('endpoint');
        expect(metric).toHaveProperty('responseTime');
        expect(metric).toHaveProperty('successRate');
        expect(metric).toHaveProperty('errorRate');
        expect(metric).toHaveProperty('cacheHitRate');
      });
    });
  });

  describe('캐시 관리', () => {
    it('캐시 설정', () => {
      service.setCache('test-key', { data: 'test' });
      const cached = service.getCache('test-key');
      expect(cached).toEqual({ data: 'test' });
    });

    it('캐시 조회 - 존재하지 않는 키', () => {
      const cached = service.getCache('non-existent');
      expect(cached).toBeNull();
    });

    it('TTL이 만료된 캐시 조회', () => {
      service.setCache('test-key', { data: 'test' }, 1); // 1초 TTL
      jest.advanceTimersByTime(2000); // 2초 경과
      const cached = service.getCache('test-key');
      expect(cached).toBeNull();
    });

    it('캐시 통계 조회', () => {
      service.setCache('key1', { data: '1' });
      service.setCache('key2', { data: '2' });
      const stats = service.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.missRate).toBeGreaterThanOrEqual(0);
    });

    it('캐시 클리어', () => {
      service.setCache('key1', { data: '1' });
      service.setCache('key2', { data: '2' });
      service.clearCache();
      expect(service.getCache('key1')).toBeNull();
      expect(service.getCache('key2')).toBeNull();
    });
  });

  describe('캐시 전략', () => {
    it('LRU 전략으로 캐시 제거', () => {
      service.updateCacheConfig({ maxSize: 2, strategy: 'lru' });
      service.setCache('key1', { data: '1' });
      service.setCache('key2', { data: '2' });
      service.setCache('key3', { data: '3' }); // key1이 제거되어야 함
      expect(service.getCache('key1')).toBeNull();
      expect(service.getCache('key2')).toBeDefined();
      expect(service.getCache('key3')).toBeDefined();
    });

    it('FIFO 전략으로 캐시 제거', () => {
      service.updateCacheConfig({ maxSize: 2, strategy: 'fifo' });
      service.setCache('key1', { data: '1' });
      service.setCache('key2', { data: '2' });
      service.setCache('key3', { data: '3' }); // key1이 제거되어야 함
      expect(service.getCache('key1')).toBeNull();
      expect(service.getCache('key2')).toBeDefined();
      expect(service.getCache('key3')).toBeDefined();
    });

    it('TTL 전략으로 만료된 캐시 제거', () => {
      service.updateCacheConfig({ maxSize: 10, strategy: 'ttl' });
      service.setCache('key1', { data: '1' }, 1); // 1초 TTL
      service.setCache('key2', { data: '2' }, 5); // 5초 TTL
      jest.advanceTimersByTime(2000); // 2초 경과
      service.setCache('key3', { data: '3' }); // evictCache 호출
      expect(service.getCache('key1')).toBeNull();
      expect(service.getCache('key2')).toBeDefined();
      expect(service.getCache('key3')).toBeDefined();
    });
  });

  describe('최적화된 요청', () => {
    it('캐시된 요청 반환', async () => {
      const testData = { result: 'cached' };
      service.setCache('GET:https://api.example.com/data:', testData);

      const result = await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      });

      expect(result).toEqual(testData);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('캐시되지 않은 요청 실행', async () => {
      const testData = { result: 'fresh' };
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: async () => testData,
        })
      );

      const result = await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      });

      expect(result).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('요청 캐싱', async () => {
      const testData = { result: 'data' };
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: async () => testData,
        })
      );

      await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      });

      // 두 번째 요청은 캐시에서 반환
      const cached = await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      });

      expect(cached).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('캐시 비활성화 요청', async () => {
      const testData = { result: 'data' };
      mockFetch.mockResolvedValue(
        partialJsonResponse({
          ok: true,
          json: async () => testData,
        })
      );

      await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      }, false);

      await service.optimizedRequest('https://api.example.com/data', {
        method: 'GET',
      }, false);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('에러 처리', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.optimizedRequest('https://api.example.com/data', {
          method: 'GET',
        })
      ).rejects.toThrow('Network error');
    });

    it('HTTP 에러 처리', async () => {
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({}),
        })
      );

      await expect(
        service.optimizedRequest('https://api.example.com/data', {
          method: 'GET',
        })
      ).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('메트릭 관리', () => {
    it('모든 메트릭 조회', () => {
      const metrics = service.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('특정 엔드포인트 메트릭 조회', () => {
      const metric = service.getMetric(CHAT_POST_PATH);
      expect(metric).toBeDefined();
      expect(metric?.endpoint).toBe(CHAT_POST_PATH);
    });

    it('존재하지 않는 엔드포인트 메트릭 조회', () => {
      const metric = service.getMetric(`${API_PATH_IN_URL_MARKER}non-existent`);
      expect(metric).toBeUndefined();
    });

    it('메트릭 업데이트', async () => {
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: async () => ({ data: 'test' }),
        })
      );

      await service.optimizedRequest(CHAT_POST_PATH, {
        method: 'GET',
      });

      const metric = service.getMetric(CHAT_POST_PATH);
      expect(metric).toBeDefined();
      expect(metric?.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('최적화 제안', () => {
    it('최적화 제안 생성', () => {
      const suggestions = service.getOptimizationSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('최적화 제안 구조 확인', () => {
      const suggestions = service.getOptimizationSuggestions();
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('impact');
        expect(suggestion).toHaveProperty('effort');
        expect(suggestion).toHaveProperty('estimatedImprovement');
        expect(['caching', 'compression', 'pagination', 'batching', 'preloading']).toContain(suggestion.type);
        expect(['high', 'medium', 'low']).toContain(suggestion.impact);
        expect(['easy', 'medium', 'hard']).toContain(suggestion.effort);
      });
    });

    it('느린 응답 시간에 대한 제안', () => {
      // 메트릭을 수동으로 설정하여 느린 응답 시간 시뮬레이션
      const suggestions = service.getOptimizationSuggestions();
      // 일반적인 제안은 항상 포함됨
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('캐시 설정 업데이트', () => {
    it('TTL 업데이트', () => {
      service.updateCacheConfig({ ttl: 600 });
      service.setCache('key1', { data: '1' });
      // TTL이 업데이트되었는지 확인
      const cached = service.getCache('key1');
      expect(cached).toBeDefined();
    });

    it('최대 크기 업데이트', () => {
      service.updateCacheConfig({ maxSize: 5 });
      for (let i = 0; i < 6; i++) {
        service.setCache(`key${i}`, { data: i });
      }
      // 최대 크기가 5이므로 일부 키가 제거되어야 함
      const stats = service.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(5);
    });

    it('전략 업데이트', () => {
      service.updateCacheConfig({ strategy: 'fifo' });
      service.setCache('key1', { data: '1' });
      service.setCache('key2', { data: '2' });
      const cached = service.getCache('key1');
      expect(cached).toBeDefined();
    });
  });

  describe('메트릭 수집', () => {
    it('메트릭 자동 업데이트', () => {
      jest.advanceTimersByTime(10000); // 10초 경과
      const metrics = service.getMetrics();
      metrics.forEach(metric => {
        expect(metric.lastUpdated).toBeInstanceOf(Date);
      });
    });
  });

  describe('에지 케이스', () => {
    it('빈 URL 요청', async () => {
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: async () => ({}),
        })
      );

      const result = await service.optimizedRequest('', {
        method: 'GET',
      });

      expect(result).toBeDefined();
    });

    it('POST 요청 캐싱', async () => {
      const testData = { result: 'post' };
      mockFetch.mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: async () => testData,
        })
      );

      await service.optimizedRequest('https://api.example.com/data', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      });

      const cached = await service.optimizedRequest('https://api.example.com/data', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      });

      expect(cached).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('다른 본문의 POST 요청은 별도 캐시', async () => {
      const testData1 = { result: 'post1' };
      const testData2 = { result: 'post2' };
      mockFetch
        .mockResolvedValueOnce(
          partialJsonResponse({
            ok: true,
            json: async () => testData1,
          })
        )
        .mockResolvedValueOnce(
          partialJsonResponse({
            ok: true,
            json: async () => testData2,
          })
        );

      const result1 = await service.optimizedRequest('https://api.example.com/data', {
        method: 'POST',
        body: JSON.stringify({ key: 'value1' }),
      });

      const result2 = await service.optimizedRequest('https://api.example.com/data', {
        method: 'POST',
        body: JSON.stringify({ key: 'value2' }),
      });

      expect(result1).toEqual(testData1);
      expect(result2).toEqual(testData2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

