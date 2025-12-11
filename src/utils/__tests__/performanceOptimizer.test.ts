/**
 * performanceOptimizer 유틸리티 테스트
 * 고급 성능 최적화 함수 테스트
 */

import {
  debounce,
  throttle,
  batchUpdates,
  memoize,
  calculateVirtualScroll,
  optimizeTextRendering,
  createIntersectionObserver,
} from '../performanceOptimizer';

// IntersectionObserver 모킹
global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: options?.thresholds || [0],
  };
}) as any;

describe('performanceOptimizer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('debounce (고급 버전)', () => {
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

    it('cancel 메서드로 취소할 수 있어야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc.cancel();

      jest.advanceTimersByTime(100);

      expect(func).not.toHaveBeenCalled();
    });

    it('flush 메서드로 즉시 실행할 수 있어야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('arg1', 'arg2');
      debouncedFunc.flush();

      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('flush 후에는 다시 실행되지 않아야 함', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc.flush();

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
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchUpdates', () => {
    it('업데이트를 배치로 실행해야 함', () => {
      const update1 = jest.fn();
      const update2 = jest.fn();
      const update3 = jest.fn();

      batchUpdates([update1, update2, update3]);

      // requestIdleCallback 또는 requestAnimationFrame이 호출되어야 함
      jest.advanceTimersByTime(100);

      expect(update1).toHaveBeenCalled();
      expect(update2).toHaveBeenCalled();
      expect(update3).toHaveBeenCalled();
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

    it('커스텀 키 생성기를 사용할 수 있어야 함', () => {
      const func = jest.fn((obj: { a: number; b: number }) => obj.a + obj.b);
      const keyGenerator = jest.fn((obj: { a: number; b: number }) => `${obj.a}-${obj.b}`);
      const memoizedFunc = memoize(func, keyGenerator);

      const obj = { a: 1, b: 2 };
      memoizedFunc(obj);
      memoizedFunc(obj);

      expect(func).toHaveBeenCalledTimes(1);
      expect(keyGenerator).toHaveBeenCalledTimes(2);
    });

    it('캐시 크기 제한을 적용해야 함', () => {
      const func = jest.fn((x: number) => x);
      const memoizedFunc = memoize(func);

      // 101개 호출 (캐시 크기 제한: 100)
      for (let i = 0; i < 101; i++) {
        memoizedFunc(i);
      }

      // 첫 번째 항목이 제거되어야 함
      memoizedFunc(0);
      expect(func).toHaveBeenCalledTimes(102); // 0이 다시 계산됨
    });
  });

  describe('calculateVirtualScroll', () => {
    it('가상 스크롤 범위를 계산해야 함', () => {
      const result = calculateVirtualScroll(100, 50, 500, 100, 5);

      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeLessThanOrEqual(99);
      expect(result.offsetY).toBeGreaterThanOrEqual(0);
    });

    it('overscan을 고려해야 함', () => {
      const result = calculateVirtualScroll(0, 50, 500, 100, 10);

      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBeGreaterThan(10);
    });

    it('스크롤 위치에 따라 범위가 변경되어야 함', () => {
      const result1 = calculateVirtualScroll(0, 50, 500, 100, 5);
      const result2 = calculateVirtualScroll(1000, 50, 500, 100, 5);

      expect(result2.startIndex).toBeGreaterThan(result1.startIndex);
      expect(result2.offsetY).toBeGreaterThan(result1.offsetY);
    });
  });

  describe('optimizeTextRendering', () => {
    it('짧은 텍스트는 그대로 반환해야 함', () => {
      const text = 'Short text';
      const result = optimizeTextRendering(text, 100);

      expect(result).toBe(text);
    });

    it('긴 텍스트는 요약해야 함', () => {
      const longText = 'a'.repeat(2000);
      const result = optimizeTextRendering(longText, 1000);

      expect(result.length).toBe(1003); // 1000 + '...'
      expect(result).toContain('...');
    });

    it('기본 maxLength를 사용해야 함', () => {
      const longText = 'a'.repeat(2000);
      const result = optimizeTextRendering(longText);

      expect(result.length).toBe(1003); // 기본값 1000 + '...'
    });
  });

  describe('createIntersectionObserver', () => {
    it('IntersectionObserver를 생성해야 함', () => {
      const callback = jest.fn();
      const observer = createIntersectionObserver(callback);

      expect(observer).toBeInstanceOf(IntersectionObserver);
    });

    it('기본 옵션을 사용해야 함', () => {
      const callback = jest.fn();
      const observer = createIntersectionObserver(callback);

      expect(observer).toBeInstanceOf(IntersectionObserver);
    });

    it('커스텀 옵션을 사용할 수 있어야 함', () => {
      const callback = jest.fn();
      const options = { rootMargin: '100px', threshold: 0.5 };
      const observer = createIntersectionObserver(callback, options);

      expect(observer).toBeInstanceOf(IntersectionObserver);
    });
  });
});

