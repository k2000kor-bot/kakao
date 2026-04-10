// 더미 서비스 - 비활성화된 서비스 대체용
export interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    timestamp: Date;
}

const realTimeAIPerformanceMonitor = {
    start: () => { },
    stop: () => { },
    getMetrics: (): PerformanceMetric[] => [],
    addMetric: () => { },
    recordResponseTime: (_service: string, _time: number, _metadata?: Record<string, unknown>) => { },
    recordSatisfaction: (_userId: string, _sessionId: string, _satisfaction: number, _metadata?: Record<string, unknown>) => { }
};
export default realTimeAIPerformanceMonitor;
