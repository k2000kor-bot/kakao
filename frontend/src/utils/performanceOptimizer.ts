/**
 * 성능 최적화 유틸리티
 * 디바운스·스로틀·배치 업데이트·메모이제이션·가상 스크롤 등 성능 개선용 함수 제공.
 * @module performanceOptimizer
 * @see debounce - cancel/flush 지원 디바운스
 * @see throttle - 호출 빈도 제한
 * @see batchUpdates - requestIdleCallback/requestAnimationFrame 배치
 * @see memoize - 캐시 크기 제한 메모이제이션
 * @see calculateVirtualScroll - 가상 스크롤 범위 계산
 * @see optimizeTextRendering - 긴 텍스트 요약
 * @see createIntersectionObserver - 지연 로딩용 Observer
 */

/**
 * 디바운스 함수 (성능 최적화) - 고급 버전 (cancel, flush 지원).
 * 마지막 호출 후 wait ms 동안 추가 호출이 없을 때만 func 실행.
 * @param func - 디바운스할 함수
 * @param wait - 대기 시간 (ms)
 * @returns 디바운스된 함수 (cancel, flush 메서드 포함)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- HOF requires permissive typing for any callback
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
 * 스로틀 함수 (성능 최적화).
 * limit ms 동안 최대 1회만 func 실행.
 * @param func - 스로틀할 함수
 * @param limit - 최소 호출 간격 (ms)
 * @returns 스로틀된 함수
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- HOF requires permissive typing for any callback
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
 * 배치 업데이트 (React 18+ 스타일).
 * requestIdleCallback 또는 requestAnimationFrame으로 여러 업데이트를 한 프레임에 묶어 실행.
 * @param updates - 실행할 함수 배열
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
 * 메모이제이션된 함수 생성.
 * 동일 인자로 재호출 시 캐시된 결과 반환 (캐시 크기 100 제한).
 * @param fn - 메모이제이션할 함수
 * @param keyGenerator - (선택) 캐시 키 생성 함수. 없으면 JSON.stringify(args) 사용
 * @returns 메모이제이션된 함수
 */
export function memoize<Args extends unknown[], Return>(
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
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  };
}

/**
 * 가상 스크롤 계산.
 * 뷰포트에 보일 항목 범위와 오프셋을 계산.
 * @param overscan - 뷰포트 밖에 미리 렌더할 항목 수 (기본 5)
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
 * 텍스트 처리 최적화 (긴 텍스트 처리).
 * maxLength 초과 시 잘라서 '...' 붙여 반환.
 * @param maxLength - 최대 길이 (기본 1000)
 */
export function optimizeTextRendering(text: string, maxLength: number = 1000): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // 긴 텍스트는 요약 표시
  return text.substring(0, maxLength) + '...';
}

/**
 * 이미지 지연 로딩 최적화용 IntersectionObserver 생성.
 * rootMargin 50px, threshold 0.1 기본값.
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

