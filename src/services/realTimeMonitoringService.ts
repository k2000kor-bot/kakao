import { Project, Chat, Message } from '../types/project';
import aiSystemOptimizationEngine from './aiSystemOptimizationEngine';
import adaptiveLearningEngine from './adaptiveLearningEngine';

export interface SystemAlert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    category: 'performance' | 'security' | 'user_experience' | 'system_health' | 'learning';
    title: string;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
    autoResolved: boolean;
    metadata: Record<string, any>;
    actions?: AlertAction[];
}

export interface AlertAction {
    id: string;
    label: string;
    type: 'auto_fix' | 'manual_action' | 'ignore' | 'escalate';
    handler: () => Promise<void>;
}

export interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    threshold: {
        warning: number;
        critical: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    history: Array<{
        timestamp: Date;
        value: number;
    }>;
}

export interface MonitoringConfig {
    enabled: boolean;
    interval: number; // milliseconds
    alertThresholds: {
        cpuUsage: { warning: number; critical: number };
        memoryUsage: { warning: number; critical: number };
        responseTime: { warning: number; critical: number };
        errorRate: { warning: number; critical: number };
        userSatisfaction: { warning: number; critical: number };
    };
    autoOptimization: {
        enabled: boolean;
        maxActionsPerHour: number;
        requireConfirmation: boolean;
    };
    notifications: {
        email: boolean;
        browser: boolean;
        sound: boolean;
    };
}

class RealTimeMonitoringService {
    private alerts: SystemAlert[] = [];
    private metrics: PerformanceMetric[] = [];
    private config: MonitoringConfig;
    private monitoringInterval: NodeJS.Timeout | null = null;
    private isMonitoring = false;
    private alertListeners: Array<(alert: SystemAlert) => void> = [];
    private metricListeners: Array<(metrics: PerformanceMetric[]) => void> = [];

    constructor() {
        this.config = this.getDefaultConfig();
        this.initializeMetrics();
        this.loadStoredData();
    }

    private getDefaultConfig(): MonitoringConfig {
        return {
            enabled: true,
            interval: 30000, // 30초
            alertThresholds: {
                cpuUsage: { warning: 70, critical: 90 },
                memoryUsage: { warning: 80, critical: 95 },
                responseTime: { warning: 1000, critical: 3000 },
                errorRate: { warning: 2, critical: 5 },
                userSatisfaction: { warning: 0.7, critical: 0.5 }
            },
            autoOptimization: {
                enabled: true,
                maxActionsPerHour: 5,
                requireConfirmation: false
            },
            notifications: {
                email: false,
                browser: true,
                sound: true
            }
        };
    }

    private initializeMetrics(): void {
        this.metrics = [
            {
                id: 'cpu_usage',
                name: 'CPU 사용률',
                value: 0,
                unit: '%',
                threshold: this.config.alertThresholds.cpuUsage,
                trend: 'stable',
                history: []
            },
            {
                id: 'memory_usage',
                name: '메모리 사용률',
                value: 0,
                unit: '%',
                threshold: this.config.alertThresholds.memoryUsage,
                trend: 'stable',
                history: []
            },
            {
                id: 'response_time',
                name: '응답 시간',
                value: 0,
                unit: 'ms',
                threshold: this.config.alertThresholds.responseTime,
                trend: 'stable',
                history: []
            },
            {
                id: 'error_rate',
                name: '오류율',
                value: 0,
                unit: '%',
                threshold: this.config.alertThresholds.errorRate,
                trend: 'stable',
                history: []
            },
            {
                id: 'user_satisfaction',
                name: '사용자 만족도',
                value: 0.8,
                unit: '',
                threshold: this.config.alertThresholds.userSatisfaction,
                trend: 'stable',
                history: []
            }
        ];
    }

    private loadStoredData(): void {
        try {
            const storedAlerts = localStorage.getItem('realtime_monitoring_alerts');
            if (storedAlerts) {
                this.alerts = JSON.parse(storedAlerts).map((alert: any) => ({
                    ...alert,
                    timestamp: new Date(alert.timestamp)
                }));
            }

            const storedConfig = localStorage.getItem('realtime_monitoring_config');
            if (storedConfig) {
                this.config = { ...this.config, ...JSON.parse(storedConfig) };
            }

            const storedMetrics = localStorage.getItem('realtime_monitoring_metrics');
            if (storedMetrics) {
                const metrics = JSON.parse(storedMetrics);
                this.metrics = metrics.map((metric: any) => ({
                    ...metric,
                    history: metric.history.map((h: any) => ({
                        ...h,
                        timestamp: new Date(h.timestamp)
                    }))
                }));
            }
        } catch (error) {
            console.error('모니터링 데이터 로드 중 오류:', error);
        }
    }

    private saveData(): void {
        try {
            localStorage.setItem('realtime_monitoring_alerts', JSON.stringify(this.alerts));
            localStorage.setItem('realtime_monitoring_config', JSON.stringify(this.config));
            localStorage.setItem('realtime_monitoring_metrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('모니터링 데이터 저장 중 오류:', error);
        }
    }

    // 모니터링 시작
    startMonitoring(): void {
        if (this.isMonitoring || !this.config.enabled) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, this.config.interval);

        console.log('실시간 모니터링이 시작되었습니다.');
    }

    // 모니터링 중지
    stopMonitoring(): void {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('실시간 모니터링이 중지되었습니다.');
    }

    // 메트릭 수집
    private async collectMetrics(): Promise<void> {
        try {
            // 시스템 데이터 가져오기
            const projects = this.getStoredProjects();
            const chats = this.getStoredChats();
            const messages = this.getStoredMessages();

            // AI 시스템 최적화 엔진에서 메트릭 수집
            const systemMetrics = aiSystemOptimizationEngine.collectSystemMetrics(projects, chats, messages);
            const healthScore = aiSystemOptimizationEngine.analyzeSystemHealth(systemMetrics);

            // 메트릭 업데이트
            this.updateMetric('cpu_usage', systemMetrics.cpuUsage);
            this.updateMetric('memory_usage', systemMetrics.memoryUsage);
            this.updateMetric('response_time', systemMetrics.responseTime);
            this.updateMetric('error_rate', systemMetrics.errorRate);
            this.updateMetric('user_satisfaction', systemMetrics.userSatisfaction);

            // 알림 체크
            this.checkAlerts();

            // 자동 최적화 체크
            if (this.config.autoOptimization.enabled) {
                await this.checkAutoOptimization();
            }

            // 적응형 학습 실행
            adaptiveLearningEngine.learnUserBehavior(projects, chats, messages);

            // 리스너들에게 알림
            this.notifyMetricListeners();

            this.saveData();
        } catch (error) {
            console.error('메트릭 수집 중 오류:', error);
            this.createAlert({
                type: 'critical',
                category: 'system_health',
                title: '모니터링 오류',
                message: '시스템 메트릭 수집 중 오류가 발생했습니다.',
                metadata: { error: (error as Error).message }
            });
        }
    }

    private updateMetric(metricId: string, value: number): void {
        const metric = this.metrics.find(m => m.id === metricId);
        if (!metric) return;

        const previousValue = metric.value;
        metric.value = value;

        // 히스토리 업데이트
        metric.history.push({
            timestamp: new Date(),
            value: value
        });

        // 히스토리 크기 제한 (최근 100개)
        if (metric.history.length > 100) {
            metric.history = metric.history.slice(-100);
        }

        // 트렌드 계산
        if (metric.history.length >= 5) {
            const recentValues = metric.history.slice(-5).map(h => h.value);
            const trend = this.calculateTrend(recentValues);
            metric.trend = trend;
        }
    }

    private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
        if (values.length < 2) return 'stable';

        const first = values[0];
        const last = values[values.length - 1];
        const change = (last - first) / first;

        if (Math.abs(change) < 0.05) return 'stable';
        return change > 0 ? 'declining' : 'improving'; // 대부분의 메트릭에서 값이 낮을수록 좋음
    }

    private checkAlerts(): void {
        for (const metric of this.metrics) {
            const { value, threshold, name } = metric;

            if (value >= threshold.critical) {
                this.createAlert({
                    type: 'critical',
                    category: 'performance',
                    title: `${name} 임계치 초과`,
                    message: `${name}이(가) 임계치(${threshold.critical}${metric.unit})를 초과했습니다. 현재 값: ${value}${metric.unit}`,
                    metadata: { metricId: metric.id, value, threshold: threshold.critical }
                });
            } else if (value >= threshold.warning) {
                this.createAlert({
                    type: 'warning',
                    category: 'performance',
                    title: `${name} 경고`,
                    message: `${name}이(가) 경고 수준(${threshold.warning}${metric.unit})에 도달했습니다. 현재 값: ${value}${metric.unit}`,
                    metadata: { metricId: metric.id, value, threshold: threshold.warning }
                });
            }
        }
    }

    private async checkAutoOptimization(): Promise<void> {
        try {
            const projects = this.getStoredProjects();
            const chats = this.getStoredChats();
            const messages = this.getStoredMessages();

            const systemMetrics = aiSystemOptimizationEngine.collectSystemMetrics(projects, chats, messages);
            const healthScore = aiSystemOptimizationEngine.analyzeSystemHealth(systemMetrics);
            const recommendations = aiSystemOptimizationEngine.generateOptimizationRecommendations(systemMetrics, healthScore);

            const autoImplementableRecommendations = recommendations.filter(r => 
                r.autoImplementable && r.priority === 'critical'
            );

            if (autoImplementableRecommendations.length > 0) {
                const recentAutoActions = this.getRecentAutoActions();
                if (recentAutoActions < this.config.autoOptimization.maxActionsPerHour) {
                    if (!this.config.autoOptimization.requireConfirmation) {
                        await aiSystemOptimizationEngine.executeAutoOptimization(autoImplementableRecommendations);
                        
                        this.createAlert({
                            type: 'success',
                            category: 'performance',
                            title: '자동 최적화 실행',
                            message: `${autoImplementableRecommendations.length}개의 최적화 작업이 자동으로 실행되었습니다.`,
                            metadata: { recommendations: autoImplementableRecommendations.map(r => r.title) }
                        });
                    } else {
                        this.createAlert({
                            type: 'info',
                            category: 'performance',
                            title: '자동 최적화 대기',
                            message: `${autoImplementableRecommendations.length}개의 최적화 작업이 승인을 대기하고 있습니다.`,
                            metadata: { recommendations: autoImplementableRecommendations },
                            actions: [{
                                id: 'approve_optimization',
                                label: '최적화 승인',
                                type: 'auto_fix',
                                handler: async () => {
                                    await aiSystemOptimizationEngine.executeAutoOptimization(autoImplementableRecommendations);
                                }
                            }]
                        });
                    }
                }
            }
        } catch (error) {
            console.error('자동 최적화 체크 중 오류:', error);
        }
    }

    private getRecentAutoActions(): number {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.alerts.filter(alert => 
            alert.type === 'success' && 
            alert.category === 'performance' && 
            alert.title.includes('자동 최적화') &&
            alert.timestamp > oneHourAgo
        ).length;
    }

    private createAlert(alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged' | 'autoResolved'>): void {
        // 중복 알림 방지
        const existingAlert = this.alerts.find(alert => 
            alert.title === alertData.title && 
            alert.category === alertData.category &&
            !alert.acknowledged &&
            new Date().getTime() - alert.timestamp.getTime() < 5 * 60 * 1000 // 5분 이내
        );

        if (existingAlert) return;

        const alert: SystemAlert = {
            id: this.generateId(),
            ...alertData,
            timestamp: new Date(),
            acknowledged: false,
            autoResolved: false
        };

        this.alerts.unshift(alert);

        // 알림 개수 제한 (최근 1000개)
        if (this.alerts.length > 1000) {
            this.alerts = this.alerts.slice(0, 1000);
        }

        // 브라우저 알림
        if (this.config.notifications.browser && alert.type === 'critical') {
            this.showBrowserNotification(alert);
        }

        // 사운드 알림
        if (this.config.notifications.sound && (alert.type === 'critical' || alert.type === 'warning')) {
            this.playAlertSound(alert.type);
        }

        // 리스너들에게 알림
        this.notifyAlertListeners(alert);

        console.log(`[${alert.type.toUpperCase()}] ${alert.title}: ${alert.message}`);
    }

    private showBrowserNotification(alert: SystemAlert): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`CORBU AI - ${alert.title}`, {
                body: alert.message,
                icon: '/favicon.ico',
                tag: alert.id
            });
        }
    }

    private playAlertSound(type: 'critical' | 'warning'): void {
        try {
            const audio = new Audio();
            audio.src = type === 'critical' 
                ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' 
                : 'data:audio/wav;base64,UklGRnoGAABXQVZFZm1...'; // 경고음
            audio.volume = 0.3;
            audio.play().catch(() => {}); // 오류 무시
        } catch (error) {
            // 사운드 재생 실패 시 무시
        }
    }

    private getStoredProjects(): Project[] {
        try {
            const stored = localStorage.getItem('projects');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private getStoredChats(): Chat[] {
        try {
            const stored = localStorage.getItem('chats');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private getStoredMessages(): Message[] {
        try {
            const stored = localStorage.getItem('messages');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private notifyAlertListeners(alert: SystemAlert): void {
        this.alertListeners.forEach(listener => {
            try {
                listener(alert);
            } catch (error) {
                console.error('알림 리스너 오류:', error);
            }
        });
    }

    private notifyMetricListeners(): void {
        this.metricListeners.forEach(listener => {
            try {
                listener([...this.metrics]);
            } catch (error) {
                console.error('메트릭 리스너 오류:', error);
            }
        });
    }

    // 공개 메서드들
    getAlerts(): SystemAlert[] {
        return [...this.alerts];
    }

    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    getConfig(): MonitoringConfig {
        return { ...this.config };
    }

    updateConfig(newConfig: Partial<MonitoringConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.saveData();

        // 모니터링 간격이 변경되면 재시작
        if (newConfig.interval && this.isMonitoring) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    acknowledgeAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.saveData();
        }
    }

    dismissAlert(alertId: string): void {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.saveData();
    }

    clearAllAlerts(): void {
        this.alerts = [];
        this.saveData();
    }

    // 이벤트 리스너
    onAlert(listener: (alert: SystemAlert) => void): () => void {
        this.alertListeners.push(listener);
        return () => {
            const index = this.alertListeners.indexOf(listener);
            if (index > -1) {
                this.alertListeners.splice(index, 1);
            }
        };
    }

    onMetricsUpdate(listener: (metrics: PerformanceMetric[]) => void): () => void {
        this.metricListeners.push(listener);
        return () => {
            const index = this.metricListeners.indexOf(listener);
            if (index > -1) {
                this.metricListeners.splice(index, 1);
            }
        };
    }

    // 브라우저 알림 권한 요청
    async requestNotificationPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    // 수동 메트릭 수집
    async collectMetricsNow(): Promise<void> {
        await this.collectMetrics();
    }

    // 시스템 상태 요약
    getSystemStatus(): {
        status: 'healthy' | 'warning' | 'critical';
        activeAlerts: number;
        criticalAlerts: number;
        averagePerformance: number;
    } {
        const activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
        const criticalAlerts = this.alerts.filter(a => !a.acknowledged && a.type === 'critical').length;
        
        const performanceMetrics = this.metrics.filter(m => 
            ['cpu_usage', 'memory_usage', 'response_time', 'error_rate'].includes(m.id)
        );
        
        const averagePerformance = performanceMetrics.length > 0
            ? performanceMetrics.reduce((sum, m) => sum + (100 - m.value), 0) / performanceMetrics.length
            : 100;

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (criticalAlerts > 0) {
            status = 'critical';
        } else if (activeAlerts > 0 || averagePerformance < 70) {
            status = 'warning';
        }

        return {
            status,
            activeAlerts,
            criticalAlerts,
            averagePerformance
        };
    }
}

const realTimeMonitoringService = new RealTimeMonitoringService();
export default realTimeMonitoringService;
