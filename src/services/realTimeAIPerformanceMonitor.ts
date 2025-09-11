// 더미 서비스 - 비활성화된 서비스 대체용
export interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    timestamp: Date;
}

export default {
    start: () => { },
    stop: () => { },
    getMetrics: (): PerformanceMetric[] => [],
    addMetric: () => { },
    recordResponseTime: (service: string, time: number, metadata?: any) => { },
    recordSatisfaction: (userId: string, sessionId: string, satisfaction: number, metadata?: any) => { }
};
