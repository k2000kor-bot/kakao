/**
 * 성능 최적화 유틸리티
 * 디바운스·스로틀·메모이제이션·지연 로딩·가상 스크롤·프리로드·성능 측정 등 제공.
 * @module performance
 */

import { errorLogger } from './errorLogger';

/**
 * 디바운스 함수. 마지막 호출 후 wait ms 동안 추가 호출이 없을 때만 func 실행.
 * @param func - 디바운스할 함수
 * @param wait - 대기 시간 (ms)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- HOF requires permissive typing for any callback
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
    clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 쓰로틀 함수. limit ms 동안 최대 1회만 func 실행.
 * @param func - 스로틀할 함수
 * @param limit - 최소 호출 간격 (ms)
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
 * 메모이제이션 헬퍼. 동일 인자로 재호출 시 캐시된 결과 반환.
 * @param fn - 메모이제이션할 함수
 */
export function memoize<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const cache = new Map<string, Return>();
  
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * 이미지 지연 로딩. 뷰포트에 들어오면 src 할당 (rootMargin 50px).
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(img);
}

/** 가상 스크롤링 옵션 */
export interface VirtualScrollOptions {
  containerHeight: number;
  itemHeight: number;
  totalItems: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  offsetY: number;
}

/**
 * 가상 스크롤 계산. 뷰포트에 보일 항목 범위·오프셋 계산.
 */
export function calculateVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
): VirtualScrollResult {
  const { containerHeight, itemHeight, totalItems, overscan = 3 } = options;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = endIndex - startIndex + 1;
  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
  };
}

/**
 * 리소스 프리로딩. image/script/style 타입별로 미리 로드.
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    } else if (type === 'script') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      document.head.appendChild(link);
      resolve();
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
      resolve();
    }
  });
}

/**
 * 성능 측정. development에서 duration 로깅.
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    errorLogger.info(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`, { component: 'performance', action: 'measurePerformance', name, duration: end - start });
  }
  
  return result;
}

/**
 * 배치 업데이트. 여러 업데이트 함수를 순서대로 실행하고 결과 배열 반환.
 */
export function batchUpdates<T>(
  updates: Array<() => T>
): T[] {
  return updates.map(update => update());
}

/**
 * 웹 워커 생성 헬퍼. 함수를 Blob으로 감싸 Worker 인스턴스 생성.
 */
export function createWorker(workerFunction: Function): Worker {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript',
  });
  return new Worker(URL.createObjectURL(blob));
  }
  