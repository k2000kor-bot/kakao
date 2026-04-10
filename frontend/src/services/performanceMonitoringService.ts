/**
 * CORBU.AI 성능 모니터링 서비스
 * 실시간 성능 지표 수집 및 최적화
 */

import { API_PATH_IN_URL_MARKER } from '../config/api';
import { errorLogger } from '../utils/errorLogger';

interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    throughput: number;
    userSatisfaction: number;
    timestamp: Date;
}

interface ApiPerformance {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    success: boolean;
    timestamp: Date;
}

interface UserInteraction {
    action: string;
    component: string;
    duration: number;
    success: boolean;
    timestamp: Date;
}

export class PerformanceMonitoringService {
    private metrics: PerformanceMetrics[] = [];
    private apiPerformance: ApiPerformance[] = [];
    private userInteractions: UserInteraction[] = [];
    private performanceObserver?: PerformanceObserver;

    constructor() {
        this.initializePerformanceObserver();
        this.startMetricsCollection();
    }

    /**
     * Performance Observer 초기화
     */
    private initializePerformanceObserver(): void {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });

            this.performanceObserver.observe({
                entryTypes: ['navigation', 'resource', 'measure', 'paint']
            });
        }
    }

    /**
     * Performance Entry 처리
     */
    private processPerformanceEntry(entry: PerformanceEntry): void {
        const timestamp = new Date();

        switch (entry.entryType) {
            case 'navigation':
                const navEntry = entry as PerformanceNavigationTiming;
                this.recordMetric({
                    responseTime: navEntry.loadEventEnd - navEntry.startTime,
                    memoryUsage: this.getMemoryUsage(),
                    cpuUsage: 0, // Browser limitation
                    errorRate: 0,
                    throughput: 1,
                    userSatisfaction: this.calculateUserSatisfaction(navEntry.loadEventEnd - navEntry.startTime),
                    timestamp
                });
                break;

            case 'resource':
                const resourceEntry = entry as PerformanceResourceTiming;
                if (resourceEntry.name.includes(API_PATH_IN_URL_MARKER)) {
                    this.recordApiPerformance({
                        endpoint: resourceEntry.name,
                        method: 'GET', // Default, should be enhanced
                        responseTime: resourceEntry.responseEnd - resourceEntry.requestStart,
                        statusCode: 200, // Default, should be enhanced
                        success: resourceEntry.responseEnd > 0,
                        timestamp
                    });
                }
                break;
        }
    }

    /**
     * 메모리 사용량 측정
     */
    private getMemoryUsage(): number {
        if ('memory' in performance) {
            const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
            return memory ? memory.usedJSHeapSize / memory.totalJSHeapSize : 0;
        }
        return 0;
    }

    /**
     * 사용자 만족도 계산
     */
    private calculateUserSatisfaction(responseTime: number): number {
        if (responseTime < 100) return 1.0;
        if (responseTime < 300) return 0.9;
        if (responseTime < 1000) return 0.7;
        if (responseTime < 3000) return 0.5;
        return 0.3;
    }

    /**
     * 메트릭 기록
     */
    private recordMetric(metric: PerformanceMetrics): void {
        this.metrics.push(metric);

        // 최근 100개 항목만 유지
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100);
        }

        this.analyzePerformanceTrends();
    }

    /**
     * API 성능 기록
     */
    private recordApiPerformance(performance: ApiPerformance): void {
        this.apiPerformance.push(performance);

        // 최근 100개 항목만 유지
        if (this.apiPerformance.length > 100) {
            this.apiPerformance = this.apiPerformance.slice(-100);
        }
    }

    /**
     * 사용자 상호작용 기록
     */
    public recordUserInteraction(interaction: Omit<UserInteraction, 'timestamp'>): void {
        this.userInteractions.push({
            ...interaction,
            timestamp: new Date()
        });

        // 최근 50개 항목만 유지
        if (this.userInteractions.length > 50) {
            this.userInteractions = this.userInteractions.slice(-50);
        }
    }

    /**
     * API 호출 모니터링
     */
    public async monitorApiCall<T>(
        endpoint: string,
        method: string,
        apiCall: () => Promise<T>
    ): Promise<T> {
        const startTime = performance.now();
        let success = false;
        let statusCode = 0;

        try {
            const result = await apiCall();
            success = true;
            statusCode = 200;
            return result;
        } catch (error) {
            success = false;
            statusCode = error instanceof Error ? 500 : 400;
            throw error;
        } finally {
            const endTime = performance.now();
            this.recordApiPerformance({
                endpoint,
                method,
                responseTime: endTime - startTime,
                statusCode,
                success,
                timestamp: new Date()
            });
        }
    }

    /**
     * 성능 트렌드 분석
     */
    private analyzePerformanceTrends(): void {
        if (this.metrics.length < 10) return;

        const recent = this.metrics.slice(-10);
        const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
        const avgMemoryUsage = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length;
        const avgUserSatisfaction = recent.reduce((sum, m) => sum + m.userSatisfaction, 0) / recent.length;

        // 성능 저하 감지
        if (avgResponseTime > 2000) {
            this.triggerPerformanceAlert('높은 응답 시간', avgResponseTime);
        }

        if (avgMemoryUsage > 0.8) {
            this.triggerPerformanceAlert('높은 메모리 사용량', avgMemoryUsage);
        }

        if (avgUserSatisfaction < 0.7) {
            this.triggerPerformanceAlert('낮은 사용자 만족도', avgUserSatisfaction);
        }
    }

    /**
     * 성능 경고 트리거
     */
    private triggerPerformanceAlert(type: string, value: number): void {
        errorLogger.warn('성능 경고', {
            component: 'performanceMonitoringService',
            action: 'triggerPerformanceAlert',
            alertType: type,
            value,
        });

        // 사용자에게 알림 (옵션)
        this.showPerformanceNotification(type, value);
    }

    /**
     * 성능 알림 표시
     */
    private showPerformanceNotification(type: string, value: number): void {
        // 실제 구현에서는 Toast 알림이나 다른 UI 컴포넌트 사용
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('CORBU.AI 성능 알림', {
                body: `${type} 감지됨 (${value.toFixed(2)})`,
                icon: '/favicon.ico'
            });
        }
    }

    /**
     * 메트릭 수집 시작
     */
    private startMetricsCollection(): void {
        // 주기적으로 메트릭 수집 (30초마다)
        setInterval(() => {
            this.collectCurrentMetrics();
        }, 30000);
    }

    /**
     * 현재 메트릭 수집
     */
    private collectCurrentMetrics(): void {
        const timestamp = new Date();

        this.recordMetric({
            responseTime: this.getAverageResponseTime(),
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: 0, // Browser limitation
            errorRate: this.calculateErrorRate(),
            throughput: this.calculateThroughput(),
            userSatisfaction: this.calculateCurrentUserSatisfaction(),
            timestamp
        });
    }

    /**
     * 평균 응답 시간 계산
     */
    private getAverageResponseTime(): number {
        if (this.apiPerformance.length === 0) return 0;

        const recent = this.apiPerformance.slice(-10);
        return recent.reduce((sum, api) => sum + api.responseTime, 0) / recent.length;
    }

    /**
     * 오류율 계산
     */
    private calculateErrorRate(): number {
        if (this.apiPerformance.length === 0) return 0;

        const recent = this.apiPerformance.slice(-20);
        const errors = recent.filter(api => !api.success).length;
        return errors / recent.length;
    }

    /**
     * 처리량 계산
     */
    private calculateThroughput(): number {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        const recentRequests = this.apiPerformance.filter(
            api => api.timestamp.getTime() > oneMinuteAgo
        );

        return recentRequests.length; // 분당 요청 수
    }

    /**
     * 현재 사용자 만족도 계산
     */
    private calculateCurrentUserSatisfaction(): number {
        const recentInteractions = this.userInteractions.slice(-10);
        if (recentInteractions.length === 0) return 1.0;

        const successRate = recentInteractions.filter(i => i.success).length / recentInteractions.length;
        const avgDuration = recentInteractions.reduce((sum, i) => sum + i.duration, 0) / recentInteractions.length;

        return (successRate * 0.7) + (this.calculateUserSatisfaction(avgDuration) * 0.3);
    }

    /**
     * 성능 리포트 생성
     */
    public generatePerformanceReport(): {
        summary: {
            avgResponseTime: number;
            avgMemoryUsage: number;
            errorRate: number;
            throughput: number;
            userSatisfaction: number;
        };
        recommendations: string[];
        trends: {
            responseTime: number[];
            memoryUsage: number[];
            userSatisfaction: number[];
        };
    } {
        const recent = this.metrics.slice(-20);

        const summary = {
            avgResponseTime: recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length || 0,
            avgMemoryUsage: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length || 0,
            errorRate: recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length || 0,
            throughput: recent.reduce((sum, m) => sum + m.throughput, 0) / recent.length || 0,
            userSatisfaction: recent.reduce((sum, m) => sum + m.userSatisfaction, 0) / recent.length || 1
        };

        const recommendations = this.generateRecommendations(summary);

        const trends = {
            responseTime: recent.map(m => m.responseTime),
            memoryUsage: recent.map(m => m.memoryUsage),
            userSatisfaction: recent.map(m => m.userSatisfaction)
        };

        return { summary, recommendations, trends };
    }

    /**
     * 성능 개선 권장사항 생성
     */
    private generateRecommendations(summary: { avgResponseTime?: number; avgMemoryUsage?: number; errorRate?: number; userSatisfaction?: number }): string[] {
        const recommendations: string[] = [];

        if ((summary.avgResponseTime ?? 0) > 1000) {
            recommendations.push('응답 시간이 느립니다. API 최적화를 고려해보세요.');
        }

        if ((summary.avgMemoryUsage ?? 0) > 0.7) {
            recommendations.push('메모리 사용량이 높습니다. 메모리 정리를 고려해보세요.');
        }

        if ((summary.errorRate ?? 0) > 0.1) {
            recommendations.push('오류율이 높습니다. 에러 핸들링을 개선해보세요.');
        }

        if ((summary.userSatisfaction ?? 0) < 0.8) {
            recommendations.push('사용자 만족도가 낮습니다. UX 개선을 고려해보세요.');
        }

        if (recommendations.length === 0) {
            recommendations.push('시스템이 원활하게 작동하고 있습니다! 🎉');
        }

        return recommendations;
    }

    /**
     * 실시간 성능 데이터 조회
     */
    public getRealTimeMetrics(): PerformanceMetrics | null {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }

    /**
     * API 성능 데이터 조회
     */
    public getApiPerformanceData(): ApiPerformance[] {
        return [...this.apiPerformance];
    }

    /**
     * 사용자 상호작용 데이터 조회
     */
    public getUserInteractionData(): UserInteraction[] {
        return [...this.userInteractions];
    }

    /**
     * 성능 모니터링 정리
     */
    public dispose(): void {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
    }
}

// 싱글톤 인스턴스
export const performanceMonitoringService = new PerformanceMonitoringService();

export default performanceMonitoringService;
