// 성능 최적화 유틸리티

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 쓰로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 메모이제이션 함수
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 가상화를 위한 아이템 크기 계산
export function calculateItemSize(
  itemCount: number,
  containerHeight: number,
  itemHeight: number = 60
): { totalHeight: number; visibleCount: number } {
  const totalHeight = itemCount * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  return { totalHeight, visibleCount };
}

// 이미지 지연 로딩
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (placeholder) {
      img.src = placeholder;
    }
    
    const image = new Image();
    image.onload = () => {
      img.src = src;
      resolve();
    };
    image.onerror = reject;
    image.src = src;
  });
}

// 성능 측정
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} 실행 시간: ${end - start}ms`);
  return result;
}

// 메모리 사용량 모니터링
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('메모리 사용량:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
    });
  }
}

// 스크롤 성능 최적화
export function optimizeScroll(
  element: HTMLElement,
  callback: (scrollTop: number) => void
): () => void {
  let ticking = false;
  
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(element.scrollTop);
        ticking = false;
      });
      ticking = true;
    }
  };
  
  element.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
}

// 컴포넌트 렌더링 최적화
export function shouldComponentUpdate<T>(
  prevProps: T,
  nextProps: T,
  keys: (keyof T)[]
): boolean {
  return keys.some(key => prevProps[key] !== nextProps[key]);
}

// 캐시 관리
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// 네트워크 상태 모니터링
export function monitorNetworkStatus(): {
  isOnline: boolean;
  connectionType?: string;
  downlink?: number;
} {
  const isOnline = navigator.onLine;
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      isOnline,
      connectionType: connection?.effectiveType,
      downlink: connection?.downlink
    };
  }
  
  return { isOnline };
} 