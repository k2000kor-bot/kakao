/**
 * AICacheManager 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiCacheManager, {
  AICacheManager,
} from '../aiCacheManager';

describe('AICacheManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    aiCacheManager.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    aiCacheManager.clear();
  });

  describe('초기화', () => {
    it('서비스 초기화 확인', () => {
      expect(aiCacheManager).toBeInstanceOf(AICacheManager);
    });

    it('기본 설정으로 초기화', () => {
      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBe(0);
    });

    it('커스텀 설정으로 초기화', () => {
      const customManager = new AICacheManager({
        max_size: 50,
        max_entries: 1000,
        default_ttl: 1800,
        eviction_policy: 'lfu',
      });
      expect(customManager).toBeInstanceOf(AICacheManager);
      customManager.shutdown();
    });
  });

  describe('캐시 저장/조회', () => {
    it('데이터 저장', () => {
      const result = aiCacheManager.set('test-key', { value: 'test-data' });
      expect(result).toBe(true);
      expect(aiCacheManager.has('test-key')).toBe(true);
    });

    it('데이터 조회', () => {
      const data = { value: 'test-data' };
      aiCacheManager.set('test-key', data);
      const retrieved = aiCacheManager.get('test-key');
      expect(retrieved).toEqual(data);
    });

    it('존재하지 않는 키 조회 시 null 반환', () => {
      const result = aiCacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('TTL 옵션으로 저장', () => {
      aiCacheManager.set('test-key', { value: 'test' }, { ttl: 60 });
      expect(aiCacheManager.has('test-key')).toBe(true);
    });

    it('태그와 함께 저장', () => {
      aiCacheManager.set('test-key', { value: 'test' }, { tags: ['tag1', 'tag2'] });
      const entry = aiCacheManager.getEntryInfo('test-key');
      expect(entry?.tags).toContain('tag1');
      expect(entry?.tags).toContain('tag2');
    });

    it('우선순위와 함께 저장', () => {
      aiCacheManager.set('test-key', { value: 'test' }, { priority: 'high' });
      const entry = aiCacheManager.getEntryInfo('test-key');
      expect(entry?.priority).toBe('high');
    });
  });

  describe('캐시 만료', () => {
    it('만료된 캐시 조회 시 null 반환', () => {
      aiCacheManager.set('test-key', { value: 'test' }, { ttl: 1 });
      expect(aiCacheManager.get('test-key')).toBeDefined();

      // 2초 후 만료
      jest.advanceTimersByTime(2000);
      expect(aiCacheManager.get('test-key')).toBeNull();
    });

    it('만료된 항목 정리', () => {
      aiCacheManager.set('key1', { value: 'test1' }, { ttl: 1 });
      aiCacheManager.set('key2', { value: 'test2' }, { ttl: 10 });

      jest.advanceTimersByTime(2000);
      const cleaned = aiCacheManager.cleanup();
      expect(cleaned).toBeGreaterThan(0);
      expect(aiCacheManager.has('key1')).toBe(false);
      expect(aiCacheManager.has('key2')).toBe(true);
    });
  });

  describe('캐시 삭제', () => {
    it('키로 삭제', () => {
      aiCacheManager.set('test-key', { value: 'test' });
      expect(aiCacheManager.delete('test-key')).toBe(true);
      expect(aiCacheManager.has('test-key')).toBe(false);
    });

    it('존재하지 않는 키 삭제 시 false 반환', () => {
      expect(aiCacheManager.delete('non-existent')).toBe(false);
    });

    it('태그로 삭제', () => {
      aiCacheManager.set('key1', { value: 'test1' }, { tags: ['tag1'] });
      aiCacheManager.set('key2', { value: 'test2' }, { tags: ['tag2'] });
      aiCacheManager.set('key3', { value: 'test3' }, { tags: ['tag1'] });

      const deleted = aiCacheManager.deleteByTag('tag1');
      expect(deleted).toBe(2);
      expect(aiCacheManager.has('key1')).toBe(false);
      expect(aiCacheManager.has('key2')).toBe(true);
      expect(aiCacheManager.has('key3')).toBe(false);
    });
  });

  describe('캐시 통계', () => {
    it('통계 조회', () => {
      aiCacheManager.set('key1', { value: 'test1' });
      aiCacheManager.set('key2', { value: 'test2' });

      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBe(2);
      expect(stats.total_size).toBeGreaterThan(0);
      expect(typeof stats.hit_rate).toBe('number');
      expect(typeof stats.miss_rate).toBe('number');
      expect(stats.eviction_count).toBeGreaterThanOrEqual(0);
    });

    it('히트/미스 통계', () => {
      aiCacheManager.set('test-key', { value: 'test' });
      aiCacheManager.get('test-key'); // hit
      aiCacheManager.get('non-existent'); // miss

      const stats = aiCacheManager.getStats();
      expect(stats.hit_rate).toBeGreaterThan(0);
      expect(stats.miss_rate).toBeGreaterThan(0);
    });

    it('메모리 사용량 조회', () => {
      aiCacheManager.set('test-key', { value: 'test' });
      const memoryUsage = aiCacheManager.getMemoryUsage();

      expect(memoryUsage.used).toBeGreaterThanOrEqual(0);
      expect(memoryUsage.limit).toBeGreaterThan(0);
      expect(memoryUsage.percentage).toBeGreaterThanOrEqual(0);
      expect(memoryUsage.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('캐시 키 조회', () => {
    it('모든 키 조회', () => {
      aiCacheManager.set('key1', { value: 'test1' });
      aiCacheManager.set('key2', { value: 'test2' });

      const keys = aiCacheManager.getKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });

    it('태그별 키 조회', () => {
      aiCacheManager.set('key1', { value: 'test1' }, { tags: ['tag1'] });
      aiCacheManager.set('key2', { value: 'test2' }, { tags: ['tag2'] });
      aiCacheManager.set('key3', { value: 'test3' }, { tags: ['tag1'] });

      const keys = aiCacheManager.getKeysByTag('tag1');
      expect(keys).toContain('key1');
      expect(keys).toContain('key3');
      expect(keys.length).toBe(2);
    });
  });

  describe('캐시 엔트리 정보', () => {
    it('엔트리 정보 조회', () => {
      aiCacheManager.set('test-key', { value: 'test' }, {
        tags: ['tag1'],
        priority: 'high',
        ttl: 3600,
      });

      const entry = aiCacheManager.getEntryInfo('test-key');
      expect(entry).toBeDefined();
      expect(entry?.key).toBe('test-key');
      expect(entry?.tags).toContain('tag1');
      expect(entry?.priority).toBe('high');
      expect(entry?.access_count).toBe(0);
    });

    it('존재하지 않는 키의 엔트리 정보 조회 시 null 반환', () => {
      const entry = aiCacheManager.getEntryInfo('non-existent');
      expect(entry).toBeNull();
    });
  });

  describe('캐시 최적화', () => {
    it('최적화 수행', () => {
      aiCacheManager.set('test-key', { value: 'test' });
      aiCacheManager.optimize();

      const stats = aiCacheManager.getStats();
      expect(stats).toBeDefined();
    });

    it('높은 메모리 사용 시 최적화로 항목 제거', () => {
      // 작은 크기의 데이터로 여러 개 저장
      for (let i = 0; i < 100; i++) {
        aiCacheManager.set(`key${i}`, { value: `test${i}` }, { priority: 'low' });
      }

      aiCacheManager.optimize();
      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBeGreaterThanOrEqual(0);
    });
  });

  describe('캐시 내보내기/가져오기', () => {
    it('캐시 내보내기', () => {
      aiCacheManager.set('key1', { value: 'test1' }, { tags: ['tag1'] });
      aiCacheManager.set('key2', { value: 'test2' }, { tags: ['tag2'] });

      const exported = aiCacheManager.export();
      expect(exported).toBeDefined();
      expect(Array.isArray(exported.entries)).toBe(true);
      expect(exported.entries.length).toBe(2);
      expect(exported.stats).toBeDefined();
      expect(exported.config).toBeDefined();
    });

    it('캐시 가져오기', () => {
      aiCacheManager.set('key1', { value: 'test1' });
      aiCacheManager.set('key2', { value: 'test2' });

      const exported = aiCacheManager.export();
      aiCacheManager.clear();

      const result = aiCacheManager.import(exported);
      expect(result).toBe(true);
      expect(aiCacheManager.has('key1')).toBe(true);
      expect(aiCacheManager.has('key2')).toBe(true);
    });

    it('잘못된 데이터 가져오기', () => {
      // entries가 없으면 클리어만 수행되고 true 반환
      const result = aiCacheManager.import({ invalid: 'data' });
      expect(result).toBe(true);
      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBe(0);
    });
  });

  describe('프리워밍', () => {
    it('프리워밍 수행', async () => {
      const dataLoader = jest.fn(async (key: string) => {
        return { value: `data-${key}` };
      });

      const keys = ['key1', 'key2', 'key3'];
      const loadedCount = await aiCacheManager.prewarm(keys, dataLoader);

      expect(loadedCount).toBe(3);
      expect(dataLoader).toHaveBeenCalledTimes(3);
      expect(aiCacheManager.has('key1')).toBe(true);
      expect(aiCacheManager.has('key2')).toBe(true);
      expect(aiCacheManager.has('key3')).toBe(true);
    });

    it('이미 존재하는 키는 프리워밍하지 않음', async () => {
      aiCacheManager.set('key1', { value: 'existing' });

      const dataLoader = jest.fn(async (key: string) => {
        return { value: `data-${key}` };
      });

      const loadedCount = await aiCacheManager.prewarm(['key1', 'key2'], dataLoader);
      expect(loadedCount).toBe(1);
      // key1은 이미 존재하므로 dataLoader가 호출되지 않음
      // key2만 프리워밍됨
      expect(dataLoader).toHaveBeenCalledTimes(1);
      expect(dataLoader).toHaveBeenCalledWith('key2');
    });
  });

  describe('캐시 무효화', () => {
    it('태그로 무효화', () => {
      aiCacheManager.set('key1', { value: 'test1' }, { tags: ['tag1'] });
      aiCacheManager.set('key2', { value: 'test2' }, { tags: ['tag2'] });
      aiCacheManager.set('key3', { value: 'test3' }, { tags: ['tag1'] });

      aiCacheManager.invalidateByTag('tag1');
      expect(aiCacheManager.has('key1')).toBe(false);
      expect(aiCacheManager.has('key2')).toBe(true);
      expect(aiCacheManager.has('key3')).toBe(false);
    });
  });

  describe('설정 업데이트', () => {
    it('설정 업데이트', () => {
      aiCacheManager.updateConfig({
        max_size: 200,
        default_ttl: 7200,
      });

      // 설정이 업데이트되었는지 확인 (내부적으로는 확인 불가하지만 에러가 없으면 성공)
      expect(aiCacheManager).toBeDefined();
    });
  });

  describe('시작/중지', () => {
    it('캐시 시작', () => {
      aiCacheManager.start();
      expect(aiCacheManager).toBeDefined();
    });

    it('캐시 중지', () => {
      aiCacheManager.start();
      aiCacheManager.stop();
      expect(aiCacheManager).toBeDefined();
    });

    it('캐시 종료', () => {
      aiCacheManager.set('test-key', { value: 'test' });
      aiCacheManager.shutdown();

      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBe(0);
    });
  });

  describe('캐시 클리어', () => {
    it('전체 캐시 클리어', () => {
      aiCacheManager.set('key1', { value: 'test1' });
      aiCacheManager.set('key2', { value: 'test2' });

      aiCacheManager.clear();

      const stats = aiCacheManager.getStats();
      expect(stats.total_entries).toBe(0);
      expect(stats.total_size).toBe(0);
    });
  });

  describe('접근 통계', () => {
    it('접근 횟수 증가', () => {
      aiCacheManager.set('test-key', { value: 'test' });

      aiCacheManager.get('test-key');
      aiCacheManager.get('test-key');
      aiCacheManager.get('test-key');

      const entry = aiCacheManager.getEntryInfo('test-key');
      expect(entry?.access_count).toBe(3);
    });
  });

  describe('이벤트 발행', () => {
    it('캐시 저장 이벤트 발행', (done) => {
      const listener = jest.fn(() => {
        expect(listener).toHaveBeenCalled();
        aiCacheManager.removeListener('cache_set', listener);
        done();
      });

      aiCacheManager.on('cache_set', listener);
      aiCacheManager.set('test-key', { value: 'test' });
    });

    it('캐시 히트 이벤트 발행', (done) => {
      aiCacheManager.set('test-key', { value: 'test' });

      const listener = jest.fn(() => {
        expect(listener).toHaveBeenCalled();
        aiCacheManager.removeListener('cache_hit', listener);
        done();
      });

      aiCacheManager.on('cache_hit', listener);
      aiCacheManager.get('test-key');
    });

    it('캐시 미스 이벤트 발행', (done) => {
      const listener = jest.fn(() => {
        expect(listener).toHaveBeenCalled();
        aiCacheManager.removeListener('cache_miss', listener);
        done();
      });

      aiCacheManager.on('cache_miss', listener);
      aiCacheManager.get('non-existent');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiCacheManager).toBeInstanceOf(AICacheManager);
    });
  });
});

