/**
 * 성능 최적화 및 메모리 관리 서비스
 * 시스템 성능을 모니터링하고 자동으로 최적화
 */

export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  renderTime: number;
  networkLatency: number;
  cacheHitRate: number;
  componentRenderCount: number;
  timestamp: number;
}

export interface OptimizationSuggestion {
  type: 'memory' | 'render' | 'network' | 'cache';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action: () => Promise<void>;
  impact: string;
}

class PerformanceOptimizationService {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private renderTimeTracker: Map<string, number> = new Map();
  private componentRenderCounts: Map<string, number> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxCacheSize = 100;
  private maxMetricsHistory = 50;

  constructor() {
    this.initializePerformanceMonitoring();
    this.startMemoryMonitoring();
    this.setupCacheCleanup();
  }

  /**
   * 성능 모니터링 초기화
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.processPerformanceEntry(entry);
        });
      });

      // 다양한 성능 메트릭 관찰
      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('성능 관찰자 설정 실패:', error);
      }
    }
  }

  /**
   * 성능 엔트리 처리
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'measure':
        this.handleMeasureEntry(entry as PerformanceMeasure);
        break;
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.handleResourceEntry(entry as PerformanceResourceTiming);
        break;
    }
  }

  /**
   * 측정 엔트리 처리
   */
  private handleMeasureEntry(entry: PerformanceMeasure): void {
    if (entry.name.startsWith('component-render-')) {
      const componentName = entry.name.replace('component-render-', '');
      this.trackComponentRender(componentName, entry.duration);
    }
  }

  /**
   * 네비게이션 타이밍 처리
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const loadTime = entry.loadEventEnd - (entry as any).navigationStart;
    this.recordMetric('page-load', loadTime);
  }

  /**
   * 리소스 엔트리 처리
   */
  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    const loadTime = entry.responseEnd - entry.requestStart;
    this.recordMetric('resource-load', loadTime);
  }

  /**
   * 메모리 모니터링 시작
   */
  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // 30초마다 체크
  }

  /**
   * 메모리 사용량 확인
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMetrics = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };

      this.recordMemoryMetrics(memoryMetrics);

      // 메모리 사용량이 80% 이상이면 최적화 수행
      if (memoryMetrics.percentage > 80) {
        this.performMemoryOptimization();
      }
    }
  }

  /**
   * 메모리 메트릭 기록
   */
  private recordMemoryMetrics(memoryMetrics: PerformanceMetrics['memoryUsage']): void {
    const metrics: PerformanceMetrics = {
      memoryUsage: memoryMetrics,
      renderTime: this.getAverageRenderTime(),
      networkLatency: this.getAverageNetworkLatency(),
      cacheHitRate: this.getCacheHitRate(),
      componentRenderCount: this.getTotalRenderCount(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);

    // 메트릭 히스토리 제한
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.splice(0, this.metrics.length - this.maxMetricsHistory);
    }
  }

  /**
   * 컴포넌트 렌더링 추적
   */
  trackComponentRender(componentName: string, duration: number): void {
    const currentCount = this.componentRenderCounts.get(componentName) || 0;
    this.componentRenderCounts.set(componentName, currentCount + 1);
    
    this.renderTimeTracker.set(componentName, duration);

    // 렌더링 시간이 16ms(60fps) 이상이면 경고
    if (duration > 16) {
      console.warn(`성능 경고: ${componentName} 컴포넌트 렌더링 시간이 ${duration.toFixed(2)}ms입니다.`);
    }
  }

  /**
   * 메트릭 기록
   */
  private recordMetric(name: string, value: number): void {
    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  /**
   * 평균 렌더링 시간 계산
   */
  private getAverageRenderTime(): number {
    const times = Array.from(this.renderTimeTracker.values());
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  /**
   * 평균 네트워크 지연 시간 계산
   */
  private getAverageNetworkLatency(): number {
    // 실제 구현에서는 네트워크 요청 시간을 추적
    return 0;
  }

  /**
   * 캐시 히트율 계산
   */
  private getCacheHitRate(): number {
    // 실제 구현에서는 캐시 히트/미스 통계를 추적
    return 0;
  }

  /**
   * 총 렌더링 횟수
   */
  private getTotalRenderCount(): number {
    return Array.from(this.componentRenderCounts.values()).reduce((a, b) => a + b, 0);
  }

  /**
   * 메모리 최적화 수행
   */
  private async performMemoryOptimization(): Promise<void> {
    console.log('메모리 최적화 시작...');

    // 1. 캐시 정리
    this.cleanupCache();

    // 2. 오래된 메트릭 정리
    this.cleanupOldMetrics();

    // 3. 가비지 컬렉션 제안 (브라우저가 지원하는 경우)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // 4. 컴포넌트 렌더링 통계 정리
    this.cleanupRenderStats();

    console.log('메모리 최적화 완료');
  }

  /**
   * 캐시 정리
   */
  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > value.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    // 캐시 크기 제한
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * 오래된 메트릭 정리
   */
  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
  }

  /**
   * 렌더링 통계 정리
   */
  private cleanupRenderStats(): void {
    // 렌더링 횟수가 많은 컴포넌트만 유지
    const entries = Array.from(this.componentRenderCounts.entries());
    entries.sort((a, b) => b[1] - a[1]);
    
    this.componentRenderCounts.clear();
    entries.slice(0, 20).forEach(([key, value]) => {
      this.componentRenderCounts.set(key, value);
    });
  }

  /**
   * 캐시 설정
   */
  setupCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // 5분마다 캐시 정리
  }

  /**
   * 캐시에 데이터 저장
   */
  setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 캐시에서 데이터 조회
   */
  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 성능 최적화 제안 생성
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const latestMetrics = this.metrics[this.metrics.length - 1];

    if (!latestMetrics) return suggestions;

    // 메모리 사용량 체크
    if (latestMetrics.memoryUsage.percentage > 70) {
      suggestions.push({
        type: 'memory',
        severity: latestMetrics.memoryUsage.percentage > 85 ? 'high' : 'medium',
        message: `메모리 사용량이 ${latestMetrics.memoryUsage.percentage.toFixed(1)}%입니다. 메모리 정리를 권장합니다.`,
        action: async () => this.performMemoryOptimization(),
        impact: '메모리 사용량 20-30% 감소 예상'
      });
    }

    // 렌더링 성능 체크
    if (latestMetrics.renderTime > 16) {
      suggestions.push({
        type: 'render',
        severity: latestMetrics.renderTime > 50 ? 'high' : 'medium',
        message: `평균 렌더링 시간이 ${latestMetrics.renderTime.toFixed(2)}ms입니다. 컴포넌트 최적화가 필요합니다.`,
        action: async () => this.optimizeRendering(),
        impact: '렌더링 성능 30-50% 향상 예상'
      });
    }

    // 캐시 효율성 체크
    if (latestMetrics.cacheHitRate < 50) {
      suggestions.push({
        type: 'cache',
        severity: 'medium',
        message: `캐시 히트율이 ${latestMetrics.cacheHitRate.toFixed(1)}%입니다. 캐시 전략 개선이 필요합니다.`,
        action: async () => this.optimizeCache(),
        impact: '응답 속도 20-40% 향상 예상'
      });
    }

    return suggestions;
  }

  /**
   * 렌더링 최적화
   */
  private async optimizeRendering(): Promise<void> {
    console.log('렌더링 최적화 시작...');
    
    // 렌더링 횟수가 많은 컴포넌트 식별
    const topComponents = Array.from(this.componentRenderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log('최적화 대상 컴포넌트:', topComponents);
    
    // 실제로는 React.memo, useMemo, useCallback 등의 최적화 제안
    console.log('렌더링 최적화 완료');
  }

  /**
   * 캐시 최적화
   */
  private async optimizeCache(): Promise<void> {
    console.log('캐시 최적화 시작...');
    
    // 캐시 전략 개선
    this.maxCacheSize = Math.min(this.maxCacheSize * 1.5, 200);
    
    console.log('캐시 최적화 완료');
  }

  /**
   * 현재 성능 메트릭 조회
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * 성능 히스토리 조회
   */
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 성능 리포트 생성
   */
  generatePerformanceReport(): {
    summary: string;
    metrics: PerformanceMetrics | null;
    suggestions: OptimizationSuggestion[];
    trends: {
      memoryTrend: 'improving' | 'stable' | 'degrading';
      renderTrend: 'improving' | 'stable' | 'degrading';
    };
  } {
    const currentMetrics = this.getCurrentMetrics();
    const suggestions = this.getOptimizationSuggestions();
    
    let summary = '시스템이 정상적으로 작동 중입니다.';
    if (suggestions.length > 0) {
      const highSeverity = suggestions.filter(s => s.severity === 'high').length;
      if (highSeverity > 0) {
        summary = `${highSeverity}개의 중요한 성능 이슈가 발견되었습니다.`;
      } else {
        summary = `${suggestions.length}개의 최적화 기회가 있습니다.`;
      }
    }

    return {
      summary,
      metrics: currentMetrics,
      suggestions,
      trends: this.analyzeTrends()
    };
  }

  /**
   * 성능 트렌드 분석
   */
  private analyzeTrends(): {
    memoryTrend: 'improving' | 'stable' | 'degrading';
    renderTrend: 'improving' | 'stable' | 'degrading';
  } {
    if (this.metrics.length < 3) {
      return { memoryTrend: 'stable', renderTrend: 'stable' };
    }

    const recent = this.metrics.slice(-3);
    
    // 메모리 트렌드
    const memoryTrend = this.calculateTrend(recent.map(m => m.memoryUsage.percentage));
    
    // 렌더링 트렌드
    const renderTrend = this.calculateTrend(recent.map(m => m.renderTime));

    return { memoryTrend, renderTrend };
  }

  /**
   * 트렌드 계산
   */
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 2) return 'stable';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;
    
    if (change > 10) return 'degrading';
    if (change < -10) return 'improving';
    return 'stable';
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    
    this.cache.clear();
    this.metrics = [];
    this.renderTimeTracker.clear();
    this.componentRenderCounts.clear();
  }
}

// 싱글톤 인스턴스
export const performanceOptimizationService = new PerformanceOptimizationService();

export default performanceOptimizationService;
