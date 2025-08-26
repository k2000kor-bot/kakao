import { EventEmitter } from 'events';

// 인터페이스 정의
export interface PerformanceMetric {
    timestamp: Date;
    metric_type: 'response_time' | 'accuracy' | 'satisfaction' | 'resource_usage' | 'error_rate' | 'throughput';
    value: number;
    unit: string;
    context: {
        service: string;
        user_id?: string;
        session_id?: string;
        request_type?: string;
        model_used?: string;
    };
    metadata?: any;
}

export interface PerformanceAlert {
    id: string;
    timestamp: Date;
    alert_type: 'warning' | 'critical' | 'info';
    metric: PerformanceMetric;
    threshold: number;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    auto_resolved: boolean;
    resolution_time?: Date;
}

export interface PerformanceReport {
    report_id: string;
    generated_at: Date;
    time_range: {
        start: Date;
        end: Date;
    };
    summary: {
        total_requests: number;
        average_response_time: number;
        success_rate: number;
        average_satisfaction: number;
        error_rate: number;
        throughput: number;
    };
    metrics_by_service: {
        [service: string]: {
            request_count: number;
            average_response_time: number;
            success_rate: number;
            error_count: number;
        };
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
    trends: {
        response_time_trend: 'improving' | 'stable' | 'degrading';
        satisfaction_trend: 'improving' | 'stable' | 'degrading';
        error_rate_trend: 'improving' | 'stable' | 'degrading';
    };
}

export interface SystemHealth {
    overall_health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_latency: number;
    active_connections: number;
    error_rate: number;
    last_updated: Date;
}

export interface UserExperienceMetrics {
    user_id: string;
    session_id: string;
    metrics: {
        response_satisfaction: number;
        interaction_fluency: number;
        learning_progress: number;
        engagement_level: number;
        frustration_signals: number;
    };
    patterns: {
        preferred_interaction_time: string;
        average_session_duration: number;
        common_use_cases: string[];
        pain_points: string[];
    };
    last_updated: Date;
}

// 성능 모니터링 서비스 클래스
class RealTimeAIPerformanceMonitor extends EventEmitter {
    private metrics: PerformanceMetric[] = [];
    private alerts: PerformanceAlert[] = [];
    private systemHealth!: SystemHealth;
    private userExperienceData: Map<string, UserExperienceMetrics> = new Map();
    private thresholds: Map<string, number> = new Map();
    private monitoringInterval: NodeJS.Timeout | null = null;
    private isMonitoring: boolean = false;

    constructor() {
        super();
        this.initializeSystemHealth();
        this.initializeThresholds();
        this.startMonitoring();
    }

    // 시스템 헬스 초기화
    private initializeSystemHealth(): void {
        this.systemHealth = {
            overall_health: 'good',
            cpu_usage: 0,
            memory_usage: 0,
            disk_usage: 0,
            network_latency: 0,
            active_connections: 0,
            error_rate: 0,
            last_updated: new Date()
        };
    }

    // 임계값 초기화
    private initializeThresholds(): void {
        this.thresholds.set('response_time_warning', 2000); // 2초
        this.thresholds.set('response_time_critical', 5000); // 5초
        this.thresholds.set('error_rate_warning', 0.05); // 5%
        this.thresholds.set('error_rate_critical', 0.15); // 15%
        this.thresholds.set('satisfaction_warning', 3.5); // 3.5/5
        this.thresholds.set('satisfaction_critical', 2.5); // 2.5/5
        this.thresholds.set('cpu_usage_warning', 80); // 80%
        this.thresholds.set('cpu_usage_critical', 95); // 95%
        this.thresholds.set('memory_usage_warning', 85); // 85%
        this.thresholds.set('memory_usage_critical', 95); // 95%
    }

    // 모니터링 시작
    public startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.updateSystemHealth();
            this.analyzePerformance();
            this.checkAlerts();
            this.emit('metrics_updated', this.getCurrentMetrics());
        }, 5000); // 5초마다 업데이트

        console.log('🔍 실시간 AI 성능 모니터링이 시작되었습니다.');
    }

    // 모니터링 중지
    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        console.log('⏹️ AI 성능 모니터링이 중지되었습니다.');
    }

    // 성능 메트릭 기록
    public recordMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // 최근 1000개 메트릭만 유지
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }

        // 실시간 임계값 체크
        this.checkThreshold(metric);

        this.emit('metric_recorded', metric);
    }

    // 응답 시간 기록
    public recordResponseTime(service: string, responseTime: number, context: any = {}): void {
        const metric: PerformanceMetric = {
            timestamp: new Date(),
            metric_type: 'response_time',
            value: responseTime,
            unit: 'ms',
            context: {
                service,
                user_id: context.user_id,
                session_id: context.session_id,
                request_type: context.request_type,
                model_used: context.model_used
            }
        };

        this.recordMetric(metric);
    }

    // 정확도 기록
    public recordAccuracy(service: string, accuracy: number, context: any = {}): void {
        const metric: PerformanceMetric = {
            timestamp: new Date(),
            metric_type: 'accuracy',
            value: accuracy,
            unit: 'percentage',
            context: {
                service,
                user_id: context.user_id,
                session_id: context.session_id,
                request_type: context.request_type
            }
        };

        this.recordMetric(metric);
    }

    // 사용자 만족도 기록
    public recordSatisfaction(userId: string, sessionId: string, satisfaction: number, context: any = {}): void {
        const metric: PerformanceMetric = {
            timestamp: new Date(),
            metric_type: 'satisfaction',
            value: satisfaction,
            unit: 'rating',
            context: {
                service: context.service || 'ai_chat',
                user_id: userId,
                session_id: sessionId,
                request_type: context.request_type
            }
        };

        this.recordMetric(metric);

        // 사용자 경험 데이터 업데이트
        this.updateUserExperience(userId, sessionId, satisfaction, context);
    }

    // 에러율 기록
    public recordError(service: string, errorType: string, context: any = {}): void {
        const metric: PerformanceMetric = {
            timestamp: new Date(),
            metric_type: 'error_rate',
            value: 1, // 개별 에러는 1로 기록
            unit: 'count',
            context: {
                service,
                user_id: context.user_id,
                session_id: context.session_id,
                request_type: context.request_type
            }
        };

        this.recordMetric(metric);
    }

    // 시스템 헬스 업데이트
    private updateSystemHealth(): void {
        // 실제 환경에서는 시스템 리소스 정보를 가져와야 함
        this.systemHealth = {
            overall_health: this.calculateOverallHealth(),
            cpu_usage: Math.random() * 100, // 시뮬레이션
            memory_usage: Math.random() * 100, // 시뮬레이션
            disk_usage: Math.random() * 100, // 시뮬레이션
            network_latency: Math.random() * 100, // 시뮬레이션
            active_connections: Math.floor(Math.random() * 100), // 시뮬레이션
            error_rate: this.calculateErrorRate(),
            last_updated: new Date()
        };

        this.emit('system_health_updated', this.systemHealth);
    }

    // 전체 헬스 계산
    private calculateOverallHealth(): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
        const avgResponseTime = this.getAverageResponseTime();
        const errorRate = this.calculateErrorRate();
        const satisfaction = this.getAverageSatisfaction();

        if (avgResponseTime < 1000 && errorRate < 0.02 && satisfaction > 4.5) {
            return 'excellent';
        } else if (avgResponseTime < 2000 && errorRate < 0.05 && satisfaction > 4.0) {
            return 'good';
        } else if (avgResponseTime < 3000 && errorRate < 0.10 && satisfaction > 3.5) {
            return 'fair';
        } else if (avgResponseTime < 5000 && errorRate < 0.15 && satisfaction > 3.0) {
            return 'poor';
        } else {
            return 'critical';
        }
    }

    // 에러율 계산
    private calculateErrorRate(): number {
        const recentMetrics = this.metrics.filter(m =>
            m.timestamp > new Date(Date.now() - 5 * 60 * 1000) // 최근 5분
        );

        const errorMetrics = recentMetrics.filter(m => m.metric_type === 'error_rate');
        const totalMetrics = recentMetrics.filter(m => m.metric_type === 'response_time');

        if (totalMetrics.length === 0) return 0;

        return errorMetrics.length / totalMetrics.length;
    }

    // 평균 응답 시간 계산
    private getAverageResponseTime(): number {
        const recentMetrics = this.metrics.filter(m =>
            m.metric_type === 'response_time' &&
            m.timestamp > new Date(Date.now() - 5 * 60 * 1000) // 최근 5분
        );

        if (recentMetrics.length === 0) return 0;

        const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.value, 0);
        return totalTime / recentMetrics.length;
    }

    // 평균 만족도 계산
    private getAverageSatisfaction(): number {
        const recentMetrics = this.metrics.filter(m =>
            m.metric_type === 'satisfaction' &&
            m.timestamp > new Date(Date.now() - 10 * 60 * 1000) // 최근 10분
        );

        if (recentMetrics.length === 0) return 4.0; // 기본값

        const totalSatisfaction = recentMetrics.reduce((sum, metric) => sum + metric.value, 0);
        return totalSatisfaction / recentMetrics.length;
    }

    // 임계값 체크
    private checkThreshold(metric: PerformanceMetric): void {
        const thresholdKey = `${metric.metric_type}_warning`;
        const criticalKey = `${metric.metric_type}_critical`;

        const warningThreshold = this.thresholds.get(thresholdKey);
        const criticalThreshold = this.thresholds.get(criticalKey);

        if (!warningThreshold && !criticalThreshold) return;

        let alertType: 'warning' | 'critical' | null = null;
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

        if (criticalThreshold && metric.value >= criticalThreshold) {
            alertType = 'critical';
            severity = 'critical';
        } else if (warningThreshold && metric.value >= warningThreshold) {
            alertType = 'warning';
            severity = 'medium';
        }

        if (alertType) {
            this.createAlert(metric, alertType, severity, warningThreshold || criticalThreshold || 0);
        }
    }

    // 알림 생성
    private createAlert(metric: PerformanceMetric, alertType: 'warning' | 'critical', severity: 'low' | 'medium' | 'high' | 'critical', threshold: number): void {
        const alert: PerformanceAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            alert_type: alertType,
            metric,
            threshold,
            message: this.generateAlertMessage(metric, alertType, threshold),
            severity,
            resolved: false,
            auto_resolved: false
        };

        this.alerts.push(alert);
        this.emit('alert_created', alert);

        console.log(`🚨 성능 알림: ${alert.message}`);
    }

    // 알림 메시지 생성
    private generateAlertMessage(metric: PerformanceMetric, alertType: string, threshold: number): string {
        const serviceName = metric.context.service;
        const value = metric.value;
        const unit = metric.unit;

        switch (metric.metric_type) {
            case 'response_time':
                return `${serviceName} 서비스의 응답 시간이 ${value}${unit}로 ${alertType === 'critical' ? '심각한' : '높은'} 수준입니다. (임계값: ${threshold}${unit})`;
            case 'error_rate':
                return `${serviceName} 서비스의 에러율이 ${(value * 100).toFixed(1)}%로 ${alertType === 'critical' ? '심각한' : '높은'} 수준입니다. (임계값: ${(threshold * 100).toFixed(1)}%)`;
            case 'satisfaction':
                return `사용자 만족도가 ${value}/5로 ${alertType === 'critical' ? '심각하게 낮은' : '낮은'} 수준입니다. (임계값: ${threshold}/5)`;
            default:
                return `${serviceName} 서비스에서 ${metric.metric_type} 관련 ${alertType}가 발생했습니다.`;
        }
    }

    // 성능 분석
    private analyzePerformance(): void {
        const analysis = {
            response_time_trend: this.analyzeResponseTimeTrend(),
            satisfaction_trend: this.analyzeSatisfactionTrend(),
            error_rate_trend: this.analyzeErrorRateTrend(),
            service_performance: this.analyzeServicePerformance(),
            recommendations: this.generateRecommendations()
        };

        this.emit('performance_analyzed', analysis);
    }

    // 응답 시간 트렌드 분석
    private analyzeResponseTimeTrend(): 'improving' | 'stable' | 'degrading' {
        const now = Date.now();
        const recent5min = this.metrics.filter(m =>
            m.metric_type === 'response_time' &&
            m.timestamp > new Date(now - 5 * 60 * 1000)
        );
        const previous5min = this.metrics.filter(m =>
            m.metric_type === 'response_time' &&
            m.timestamp > new Date(now - 10 * 60 * 1000) &&
            m.timestamp <= new Date(now - 5 * 60 * 1000)
        );

        if (recent5min.length === 0 || previous5min.length === 0) return 'stable';

        const recentAvg = recent5min.reduce((sum, m) => sum + m.value, 0) / recent5min.length;
        const previousAvg = previous5min.reduce((sum, m) => sum + m.value, 0) / previous5min.length;

        const change = ((recentAvg - previousAvg) / previousAvg) * 100;

        if (change < -10) return 'improving';
        if (change > 10) return 'degrading';
        return 'stable';
    }

    // 만족도 트렌드 분석
    private analyzeSatisfactionTrend(): 'improving' | 'stable' | 'degrading' {
        const now = Date.now();
        const recent10min = this.metrics.filter(m =>
            m.metric_type === 'satisfaction' &&
            m.timestamp > new Date(now - 10 * 60 * 1000)
        );
        const previous10min = this.metrics.filter(m =>
            m.metric_type === 'satisfaction' &&
            m.timestamp > new Date(now - 20 * 60 * 1000) &&
            m.timestamp <= new Date(now - 10 * 60 * 1000)
        );

        if (recent10min.length === 0 || previous10min.length === 0) return 'stable';

        const recentAvg = recent10min.reduce((sum, m) => sum + m.value, 0) / recent10min.length;
        const previousAvg = previous10min.reduce((sum, m) => sum + m.value, 0) / previous10min.length;

        const change = recentAvg - previousAvg;

        if (change > 0.2) return 'improving';
        if (change < -0.2) return 'degrading';
        return 'stable';
    }

    // 에러율 트렌드 분석
    private analyzeErrorRateTrend(): 'improving' | 'stable' | 'degrading' {
        const now = Date.now();
        const recent5min = this.metrics.filter(m =>
            m.metric_type === 'error_rate' &&
            m.timestamp > new Date(now - 5 * 60 * 1000)
        );
        const previous5min = this.metrics.filter(m =>
            m.metric_type === 'error_rate' &&
            m.timestamp > new Date(now - 10 * 60 * 1000) &&
            m.timestamp <= new Date(now - 5 * 60 * 1000)
        );

        if (recent5min.length === 0 && previous5min.length === 0) return 'stable';
        if (recent5min.length === 0) return 'improving';
        if (previous5min.length === 0) return 'degrading';

        const recentCount = recent5min.length;
        const previousCount = previous5min.length;

        if (recentCount < previousCount * 0.5) return 'improving';
        if (recentCount > previousCount * 2) return 'degrading';
        return 'stable';
    }

    // 서비스별 성능 분석
    private analyzeServicePerformance(): any {
        const serviceMetrics: { [key: string]: any } = {};

        const services = Array.from(new Set(this.metrics.map(m => m.context.service)));

        services.forEach(service => {
            const serviceData = this.metrics.filter(m => m.context.service === service);
            const responseTimes = serviceData.filter(m => m.metric_type === 'response_time');
            const errors = serviceData.filter(m => m.metric_type === 'error_rate');

            serviceMetrics[service] = {
                request_count: responseTimes.length,
                average_response_time: responseTimes.length > 0 ?
                    responseTimes.reduce((sum, m) => sum + m.value, 0) / responseTimes.length : 0,
                error_count: errors.length,
                success_rate: responseTimes.length > 0 ?
                    ((responseTimes.length - errors.length) / responseTimes.length) * 100 : 100
            };
        });

        return serviceMetrics;
    }

    // 권장사항 생성
    private generateRecommendations(): string[] {
        const recommendations: string[] = [];
        const avgResponseTime = this.getAverageResponseTime();
        const errorRate = this.calculateErrorRate();
        const satisfaction = this.getAverageSatisfaction();

        if (avgResponseTime > 3000) {
            recommendations.push('응답 시간이 느립니다. 서버 리소스를 확장하거나 캐싱을 활성화하세요.');
        }

        if (errorRate > 0.1) {
            recommendations.push('에러율이 높습니다. 로그를 분석하여 근본 원인을 파악하세요.');
        }

        if (satisfaction < 3.5) {
            recommendations.push('사용자 만족도가 낮습니다. 응답 품질과 사용자 경험을 개선하세요.');
        }

        if (this.systemHealth.cpu_usage > 80) {
            recommendations.push('CPU 사용률이 높습니다. 서버 확장을 고려하세요.');
        }

        if (this.systemHealth.memory_usage > 85) {
            recommendations.push('메모리 사용률이 높습니다. 메모리 최적화를 수행하세요.');
        }

        return recommendations;
    }

    // 알림 체크 및 자동 해결
    private checkAlerts(): void {
        this.alerts.forEach(alert => {
            if (alert.resolved) return;

            // 자동 해결 조건 체크
            if (this.shouldAutoResolve(alert)) {
                alert.resolved = true;
                alert.auto_resolved = true;
                alert.resolution_time = new Date();
                this.emit('alert_resolved', alert);
            }
        });
    }

    // 자동 해결 조건 체크
    private shouldAutoResolve(alert: PerformanceAlert): boolean {
        const timeSinceAlert = Date.now() - alert.timestamp.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        // 5분이 지났고 현재 메트릭이 임계값 아래로 떨어졌는지 체크
        if (timeSinceAlert > fiveMinutes) {
            const currentMetrics = this.metrics.filter(m =>
                m.metric_type === alert.metric.metric_type &&
                m.context.service === alert.metric.context.service &&
                m.timestamp > new Date(Date.now() - 2 * 60 * 1000) // 최근 2분
            );

            if (currentMetrics.length > 0) {
                const avgValue = currentMetrics.reduce((sum, m) => sum + m.value, 0) / currentMetrics.length;
                return avgValue < alert.threshold;
            }
        }

        return false;
    }

    // 사용자 경험 업데이트
    private updateUserExperience(userId: string, sessionId: string, satisfaction: number, context: any): void {
        const key = `${userId}-${sessionId}`;
        let userExp = this.userExperienceData.get(key);

        if (!userExp) {
            userExp = {
                user_id: userId,
                session_id: sessionId,
                metrics: {
                    response_satisfaction: 0,
                    interaction_fluency: 0,
                    learning_progress: 0,
                    engagement_level: 0,
                    frustration_signals: 0
                },
                patterns: {
                    preferred_interaction_time: '',
                    average_session_duration: 0,
                    common_use_cases: [],
                    pain_points: []
                },
                last_updated: new Date()
            };
        }

        // 메트릭 업데이트
        userExp.metrics.response_satisfaction = satisfaction;
        userExp.metrics.interaction_fluency = Math.random() * 5; // 시뮬레이션
        userExp.metrics.learning_progress = Math.random() * 100; // 시뮬레이션
        userExp.metrics.engagement_level = Math.random() * 5; // 시뮬레이션
        userExp.metrics.frustration_signals = satisfaction < 3 ? Math.random() * 3 : 0; // 시뮬레이션

        userExp.last_updated = new Date();

        this.userExperienceData.set(key, userExp);
    }

    // 성능 리포트 생성
    public generatePerformanceReport(timeRange: { start: Date; end: Date }): PerformanceReport {
        const metricsInRange = this.metrics.filter(m =>
            m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
        );

        const responseTimeMetrics = metricsInRange.filter(m => m.metric_type === 'response_time');
        const satisfactionMetrics = metricsInRange.filter(m => m.metric_type === 'satisfaction');
        const errorMetrics = metricsInRange.filter(m => m.metric_type === 'error_rate');

        const totalRequests = responseTimeMetrics.length;
        const averageResponseTime = totalRequests > 0 ?
            responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / totalRequests : 0;
        const successRate = totalRequests > 0 ?
            ((totalRequests - errorMetrics.length) / totalRequests) * 100 : 100;
        const averageSatisfaction = satisfactionMetrics.length > 0 ?
            satisfactionMetrics.reduce((sum, m) => sum + m.value, 0) / satisfactionMetrics.length : 4.0;
        const errorRate = totalRequests > 0 ? (errorMetrics.length / totalRequests) * 100 : 0;
        const throughput = totalRequests / ((timeRange.end.getTime() - timeRange.start.getTime()) / 1000); // 요청/초

        const alertsInRange = this.alerts.filter(a =>
            a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
        );

        return {
            report_id: `report-${Date.now()}`,
            generated_at: new Date(),
            time_range: timeRange,
            summary: {
                total_requests: totalRequests,
                average_response_time: averageResponseTime,
                success_rate: successRate,
                average_satisfaction: averageSatisfaction,
                error_rate: errorRate,
                throughput: throughput
            },
            metrics_by_service: this.analyzeServicePerformance(),
            alerts: alertsInRange,
            recommendations: this.generateRecommendations(),
            trends: {
                response_time_trend: this.analyzeResponseTimeTrend(),
                satisfaction_trend: this.analyzeSatisfactionTrend(),
                error_rate_trend: this.analyzeErrorRateTrend()
            }
        };
    }

    // 현재 메트릭 가져오기
    public getCurrentMetrics(): PerformanceMetric[] {
        return this.metrics.slice(-100); // 최근 100개
    }

    // 시스템 헬스 가져오기
    public getSystemHealth(): SystemHealth {
        return this.systemHealth;
    }

    // 활성 알림 가져오기
    public getActiveAlerts(): PerformanceAlert[] {
        return this.alerts.filter(a => !a.resolved);
    }

    // 사용자 경험 데이터 가져오기
    public getUserExperience(userId: string, sessionId: string): UserExperienceMetrics | null {
        const key = `${userId}-${sessionId}`;
        return this.userExperienceData.get(key) || null;
    }

    // 임계값 설정
    public setThreshold(metricType: string, threshold: number): void {
        this.thresholds.set(metricType, threshold);
    }

    // 알림 해결
    public resolveAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolution_time = new Date();
            this.emit('alert_resolved', alert);
        }
    }

    // 통계 정보 가져오기
    public getStatistics(): any {
        const now = Date.now();
        const lastHour = this.metrics.filter(m => m.timestamp > new Date(now - 60 * 60 * 1000));
        const lastDay = this.metrics.filter(m => m.timestamp > new Date(now - 24 * 60 * 60 * 1000));

        return {
            total_metrics: this.metrics.length,
            metrics_last_hour: lastHour.length,
            metrics_last_day: lastDay.length,
            active_alerts: this.getActiveAlerts().length,
            system_health: this.systemHealth.overall_health,
            average_response_time: this.getAverageResponseTime(),
            average_satisfaction: this.getAverageSatisfaction(),
            error_rate: this.calculateErrorRate()
        };
    }

    // 서비스 종료
    public shutdown(): void {
        this.stopMonitoring();
        this.metrics = [];
        this.alerts = [];
        this.userExperienceData.clear();
        console.log('🔌 AI 성능 모니터링 서비스가 종료되었습니다.');
    }
}

const realTimeAIPerformanceMonitor = new RealTimeAIPerformanceMonitor();
export default realTimeAIPerformanceMonitor;
