import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage?: number;
    timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
    const renderStartTime = useRef<number>(0);
    const renderCount = useRef<number>(0);

    useEffect(() => {
        renderStartTime.current = performance.now();
        renderCount.current += 1;

        return () => {
            const renderTime = performance.now() - renderStartTime.current;

            // 성능 메트릭 수집
            const metrics: PerformanceMetrics = {
                renderTime,
                timestamp: Date.now()
            };

            // 메모리 사용량 확인 (브라우저 지원 시)
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
            }

            // 성능 로깅 (개발 환경에서만)
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Performance] ${componentName}:`, {
                    renderCount: renderCount.current,
                    renderTime: `${renderTime.toFixed(2)}ms`,
                    memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A'
                });
            }

            // 성능 경고 (렌더링 시간이 16ms를 초과하는 경우)
            if (renderTime > 16) {
                console.warn(`[Performance Warning] ${componentName} 렌더링이 느립니다: ${renderTime.toFixed(2)}ms`);
            }
        };
    });
};
