/**
 * performance 유틸리티 테스트
 * debounce, throttle 함수 테스트
 */

import {
  debounce,
  throttle,
  memoize,
  calculateVirtualScroll,
  measurePerformance,
  batchUpdates,
} from '../performance';

// errorLogger 모킹
jest.mock('../errorLogger', () => ({
  errorLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('performance utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('함수를 디바운스해야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('마지막 호출만 실행되어야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('first');
      jest.advanceTimersByTime(50);
      debouncedFunc('second');
      jest.advanceTimersByTime(50);
      debouncedFunc('third');

      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('third');
    });

    it('지정된 시간 후에 실행되어야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 200);

      debouncedFunc();

      jest.advanceTimersByTime(100);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('함수를 스로틀해야 함', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      throttledFunc();
      throttledFunc();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('지정된 시간 간격으로 실행되어야 함', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(50);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(50);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('연속 호출 시 첫 번째만 실행되어야 함', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc('first');
      expect(func).toHaveBeenCalledWith('first');
      expect(func).toHaveBeenCalledTimes(1);

      throttledFunc('second');
      throttledFunc('third');

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(50);
      // throttle이 해제되면 다음 호출이 가능
      throttledFunc('fourth');
      expect(func).toHaveBeenCalledTimes(2);
      expect(func).toHaveBeenCalledWith('fourth');
    });
  });

  describe('memoize', () => {
    it('결과를 캐싱해야 함', () => {
      const expensiveFunction = jest.fn((x: number) => x * 2);
      const memoizedFunc = memoize(expensiveFunction);

      const result1 = memoizedFunc(5);
      const result2 = memoizedFunc(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);
    });

    it('다른 인자로 호출 시 다시 계산해야 함', () => {
      const expensiveFunction = jest.fn((x: number) => x * 2);
      const memoizedFunc = memoize(expensiveFunction);

      memoizedFunc(5);
      memoizedFunc(10);

      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });

    it('복잡한 객체도 캐싱해야 함', () => {
      const func = jest.fn((obj: { a: number; b: number }) => obj.a + obj.b);
      const memoizedFunc = memoize(func);

      const obj = { a: 1, b: 2 };
      memoizedFunc(obj);
      memoizedFunc(obj);

      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateVirtualScroll', () => {
    it('가상 스크롤 범위를 계산해야 함', () => {
      const result = calculateVirtualScroll(100, {
        containerHeight: 500,
        itemHeight: 50,
        totalItems: 100,
      });

      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeLessThanOrEqual(99);
      expect(result.visibleItems).toBeGreaterThan(0);
      expect(result.offsetY).toBeGreaterThanOrEqual(0);
    });

    it('overscan을 고려해야 함', () => {
      const result = calculateVirtualScroll(0, {
        containerHeight: 500,
        itemHeight: 50,
        totalItems: 100,
        overscan: 5,
      });

      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBeGreaterThan(10);
    });

    it('스크롤 위치에 따라 범위가 변경되어야 함', () => {
      const result1 = calculateVirtualScroll(0, {
        containerHeight: 500,
        itemHeight: 50,
        totalItems: 100,
      });

      const result2 = calculateVirtualScroll(1000, {
        containerHeight: 500,
        itemHeight: 50,
        totalItems: 100,
      });

      expect(result2.startIndex).toBeGreaterThan(result1.startIndex);
      expect(result2.offsetY).toBeGreaterThan(result1.offsetY);
    });
  });

  describe('measurePerformance', () => {
    it('성능을 측정해야 함', () => {
      const { errorLogger } = require('../errorLogger');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = measurePerformance('test', () => {
        return 42;
      });

      expect(result).toBe(42);
      expect(errorLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] test:'),
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('프로덕션 모드에서는 로그를 출력하지 않아야 함', () => {
      const { errorLogger } = require('../errorLogger');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      jest.clearAllMocks();

      measurePerformance('test', () => 42);

      expect(errorLogger.info).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('batchUpdates', () => {
    it('여러 업데이트를 배치로 실행해야 함', () => {
      const update1 = jest.fn(() => 1);
      const update2 = jest.fn(() => 2);
      const update3 = jest.fn(() => 3);

      const results = batchUpdates([update1, update2, update3]);

      expect(results).toEqual([1, 2, 3]);
      expect(update1).toHaveBeenCalled();
      expect(update2).toHaveBeenCalled();
      expect(update3).toHaveBeenCalled();
    });

    it('빈 배열을 처리해야 함', () => {
      const results = batchUpdates([]);
      expect(results).toEqual([]);
    });
  });
});

