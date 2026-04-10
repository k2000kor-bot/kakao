/**
 * 성능 모니터링 유틸리티
 * PerformanceObserver 기반 긴 작업·레이아웃 변경 감지, 컴포넌트 렌더/마운트 시간 수집.
 * @module performanceMonitor
 */

import { errorLogger } from './errorLogger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * 성능 관찰자 초기화
   */
  private initializeObservers() {
    if (typeof PerformanceObserver !== 'undefined') {
      // 긴 작업 감지
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              errorLogger.warn(`긴 작업 감지: ${entry.duration.toFixed(2)}ms`, {
                component: 'performanceMonitor',
                action: 'longTask',
                duration: entry.duration,
                entryName: entry.name,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // longtask는 모든 브라우저에서 지원되지 않음
      }

      // 레이아웃 변경 감지
      try {
        const layoutObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as PerformanceEntry & { value?: number };
            if (typeof layoutEntry.value === 'number' && layoutEntry.value > 16) {
              errorLogger.warn(`레이아웃 변경 감지: ${layoutEntry.value.toFixed(2)}ms`, {
                component: 'performanceMonitor',
                action: 'layoutShift',
                value: layoutEntry.value,
                entryName: entry.name,
              });
            }
          }
        });
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutObserver);
      } catch (e) {
        // layout-shift는 모든 브라우저에서 지원되지 않음
      }
    }
  }

  /**
   * 메트릭 기록
   */
  recordMetric(name: string, value: number, unit: string = 'ms') {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });

    // 최대 1000개까지만 유지
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * 컴포넌트 성능 기록
   */
  recordComponentPerformance(
    componentName: string,
    renderTime: number,
    mountTime?: number
  ) {
    const existing = this.componentMetrics.get(componentName) || {
      componentName,
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
    };

    this.componentMetrics.set(componentName, {
      ...existing,
      renderTime: existing.updateCount === 0 ? renderTime : (existing.renderTime + renderTime) / 2,
      mountTime: mountTime || existing.mountTime,
      updateCount: existing.updateCount + 1,
    });
  }

  /**
   * 성능 측정 시작
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      return duration;
    };
  }

  /**
   * 메모리 사용량 확인
   */
  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };
      }
    }
    return null;
  }

  /**
   * 네트워크 성능 확인
   */
  getNetworkPerformance(): {
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
    };
  } {
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection;
      if (conn) {
        return {
          connection: {
            effectiveType: conn.effectiveType || 'unknown',
            downlink: conn.downlink ?? 0,
            rtt: conn.rtt ?? 0,
          },
        };
      }
    }
    return {};
  }

  /**
   * 평균 메트릭 가져오기
   */
  getAverageMetric(name: string, lastN: number = 10): number | null {
    const relevantMetrics = this.metrics
      .filter((m) => m.name === name)
      .slice(-lastN);

    if (relevantMetrics.length === 0) return null;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  /**
   * 성능 리포트 생성
   */
  generateReport(): {
    metrics: PerformanceMetric[];
    components: ComponentPerformance[];
    memory: {
      used: number;
      total: number;
      percentage: number;
    } | null;
    network: {
      connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
      };
    };
    summary: {
      totalMetrics: number;
      slowComponents: ComponentPerformance[];
      averageRenderTime: number;
    };
  } {
    const components = Array.from(this.componentMetrics.values());
    const slowComponents = components.filter((c) => c.renderTime > 16);
    const averageRenderTime =
      components.length > 0
        ? components.reduce((sum, c) => sum + c.renderTime, 0) / components.length
        : 0;

    return {
      metrics: this.metrics.slice(-100), // 최근 100개만
      components,
      memory: this.getMemoryUsage(),
      network: this.getNetworkPerformance(),
      summary: {
        totalMetrics: this.metrics.length,
        slowComponents,
        averageRenderTime,
      },
    };
  }

  /**
   * 성능 데이터 초기화
   */
  clear() {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  /**
   * 관찰자 정리
   */
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;

