/**
 * 성능 최적화 유틸리티
 * 혁신적인 성능 개선을 위한 유틸리티 함수들
 */

/**
 * 디바운스 함수 (성능 최적화) - 고급 버전 (cancel, flush 지원)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  const debounced = function executedFunction(...args: Parameters<T>) {
    lastArgs = args;
    const later = () => {
      timeout = null;
      if (lastArgs) {
        func(...lastArgs);
        lastArgs = null;
      }
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  } as ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
  };
  
  debounced.flush = () => {
    if (timeout && lastArgs) {
      clearTimeout(timeout);
      timeout = null;
      func(...lastArgs);
      lastArgs = null;
    }
  };
  
  return debounced;
}

/**
 * 스로틀 함수 (성능 최적화)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 배치 업데이트 (React 18+ 스타일)
 */
export function batchUpdates(updates: (() => void)[]): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      updates.forEach(update => update());
    });
  } else {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }
}

/**
 * 메모이제이션된 함수 생성
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  keyGenerator?: (...args: Args) => string
): (...args: Args) => Return {
  const cache = new Map<string, Return>();
  
  return (...args: Args): Return => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // 캐시 크기 제한 (메모리 관리)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

/**
 * 가상 스크롤 계산
 */
export function calculateVirtualScroll(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan: number = 5
): { startIndex: number; endIndex: number; offsetY: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  const offsetY = startIndex * itemHeight;
  
  return { startIndex, endIndex, offsetY };
}

/**
 * 텍스트 처리 최적화 (긴 텍스트 처리)
 */
export function optimizeTextRendering(text: string, maxLength: number = 1000): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // 긴 텍스트는 요약 표시
  return text.substring(0, maxLength) + '...';
}

/**
 * 이미지 지연 로딩 최적화
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

