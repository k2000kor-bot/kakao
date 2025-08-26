import { EventEmitter } from 'events';

export interface PerformanceMetric {
    id: string;
    timestamp: Date;
    system: string;
    metric_type: 'cpu' | 'memory' | 'response_time' | 'throughput' | 'accuracy' | 'latency';
    value: number;
    unit: string;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
    context?: any;
}

export interface OptimizationRule {
    id: string;
    name: string;
    description: string;
    condition: {
        metric_type: string;
        operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
        threshold: number;
        duration: number; // seconds
    };
    action: {
        type: 'scale' | 'throttle' | 'cache' | 'optimize' | 'alert';
        parameters: any;
    };
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemHealth {
    overall_status: 'healthy' | 'degraded' | 'critical';
    systems: {
        [key: string]: {
            status: 'healthy' | 'degraded' | 'critical';
            metrics: PerformanceMetric[];
            last_updated: Date;
        };
    };
    recommendations: string[];
    alerts: string[];
}

export interface OptimizationConfig {
    auto_optimization: boolean;
    performance_thresholds: {
        cpu_usage: number;
        memory_usage: number;
        response_time: number;
        throughput: number;
    };
    optimization_rules: OptimizationRule[];
    monitoring_interval: number; // milliseconds
    alert_channels: string[];
}

class AIPerformanceOptimizationService extends EventEmitter {
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private optimizationRules: Map<string, OptimizationRule> = new Map();
    private systemHealth: SystemHealth = {
        overall_status: 'healthy',
        systems: {},
        recommendations: [],
        alerts: []
    };
    private config: OptimizationConfig = {
        auto_optimization: true,
        performance_thresholds: {
            cpu_usage: 80,
            memory_usage: 85,
            response_time: 1000,
            throughput: 100
        },
        optimization_rules: [],
        monitoring_interval: 5000,
        alert_channels: ['console', 'email']
    };
    private monitoringInterval: NodeJS.Timeout | null = null;
    private isInitialized: boolean = false;

    constructor() {
        super();
        this.initializeSystem();
    }

    private async initializeSystem(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // 기본 최적화 규칙 설정
            this.setupDefaultOptimizationRules();

            // 모니터링 시작
            this.startMonitoring();

            this.isInitialized = true;
            this.emit('system_initialized', { timestamp: new Date() });
        } catch (error) {
            console.error('AI 성능 최적화 시스템 초기화 오류:', error);
            this.emit('system_error', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private setupDefaultOptimizationRules(): void {
        const defaultRules: OptimizationRule[] = [
            {
                id: 'rule-1',
                name: 'CPU 사용률 최적화',
                description: 'CPU 사용률이 80%를 초과하면 자동 스케일링을 수행합니다.',
                condition: {
                    metric_type: 'cpu',
                    operator: 'gt',
                    threshold: 80,
                    duration: 60
                },
                action: {
                    type: 'scale',
                    parameters: { scale_factor: 1.5, target: 'cpu' }
                },
                enabled: true,
                priority: 'high'
            },
            {
                id: 'rule-2',
                name: '응답 시간 최적화',
                description: '응답 시간이 1초를 초과하면 캐싱을 활성화합니다.',
                condition: {
                    metric_type: 'response_time',
                    operator: 'gt',
                    threshold: 1000,
                    duration: 30
                },
                action: {
                    type: 'cache',
                    parameters: { cache_duration: 300, strategy: 'aggressive' }
                },
                enabled: true,
                priority: 'medium'
            },
            {
                id: 'rule-3',
                name: '메모리 사용률 최적화',
                description: '메모리 사용률이 85%를 초과하면 가비지 컬렉션을 수행합니다.',
                condition: {
                    metric_type: 'memory',
                    operator: 'gt',
                    threshold: 85,
                    duration: 45
                },
                action: {
                    type: 'optimize',
                    parameters: { action: 'garbage_collection', force: true }
                },
                enabled: true,
                priority: 'critical'
            }
        ];

        defaultRules.forEach(rule => {
            this.optimizationRules.set(rule.id, rule);
        });
    }

    public startMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.evaluateOptimizationRules();
            this.updateSystemHealth();
        }, this.config.monitoring_interval);
    }

    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    private async collectMetrics(): Promise<void> {
        try {
            const systems = ['data_analytics', 'quality_assurance', 'emotion_recognition', 'chat_system'];

            for (const system of systems) {
                const metrics = await this.generateSystemMetrics(system);
                this.metrics.set(system, metrics);
            }

            this.emit('metrics_collected', { timestamp: new Date(), systems });
        } catch (error) {
            console.error('메트릭 수집 오류:', error);
        }
    }

    private async generateSystemMetrics(system: string): Promise<PerformanceMetric[]> {
        const now = new Date();
        const metrics: PerformanceMetric[] = [];

        // CPU 사용률 시뮬레이션
        const cpuUsage = Math.random() * 100;
        metrics.push({
            id: `${system}-cpu-${now.getTime()}`,
            timestamp: now,
            system,
            metric_type: 'cpu',
            value: cpuUsage,
            unit: '%',
            threshold: this.config.performance_thresholds.cpu_usage,
            status: cpuUsage > this.config.performance_thresholds.cpu_usage ? 'warning' : 'normal'
        });

        // 메모리 사용률 시뮬레이션
        const memoryUsage = Math.random() * 100;
        metrics.push({
            id: `${system}-memory-${now.getTime()}`,
            timestamp: now,
            system,
            metric_type: 'memory',
            value: memoryUsage,
            unit: '%',
            threshold: this.config.performance_thresholds.memory_usage,
            status: memoryUsage > this.config.performance_thresholds.memory_usage ? 'warning' : 'normal'
        });

        // 응답 시간 시뮬레이션
        const responseTime = Math.random() * 2000;
        metrics.push({
            id: `${system}-response-${now.getTime()}`,
            timestamp: now,
            system,
            metric_type: 'response_time',
            value: responseTime,
            unit: 'ms',
            threshold: this.config.performance_thresholds.response_time,
            status: responseTime > this.config.performance_thresholds.response_time ? 'warning' : 'normal'
        });

        // 처리량 시뮬레이션
        const throughput = Math.random() * 200;
        metrics.push({
            id: `${system}-throughput-${now.getTime()}`,
            timestamp: now,
            system,
            metric_type: 'throughput',
            value: throughput,
            unit: 'req/s',
            threshold: this.config.performance_thresholds.throughput,
            status: throughput < this.config.performance_thresholds.throughput ? 'warning' : 'normal'
        });

        return metrics;
    }

    private evaluateOptimizationRules(): void {
        for (const rule of this.optimizationRules.values()) {
            if (!rule.enabled) continue;

            const isTriggered = this.checkRuleCondition(rule);
            if (isTriggered) {
                this.executeOptimizationAction(rule);
            }
        }
    }

    private checkRuleCondition(rule: OptimizationRule): boolean {
        const { condition } = rule;
        const systemMetrics = Array.from(this.metrics.values()).flat();
        const relevantMetrics = systemMetrics.filter(
            metric => metric.metric_type === condition.metric_type
        );

        if (relevantMetrics.length === 0) return false;

        const recentMetrics = relevantMetrics.filter(
            metric => Date.now() - metric.timestamp.getTime() < condition.duration * 1000
        );

        if (recentMetrics.length === 0) return false;

        const averageValue = recentMetrics.reduce((sum, metric) => sum + metric.value, 0) / recentMetrics.length;

        switch (condition.operator) {
            case 'gt':
                return averageValue > condition.threshold;
            case 'lt':
                return averageValue < condition.threshold;
            case 'eq':
                return Math.abs(averageValue - condition.threshold) < 0.1;
            case 'gte':
                return averageValue >= condition.threshold;
            case 'lte':
                return averageValue <= condition.threshold;
            default:
                return false;
        }
    }

    private async executeOptimizationAction(rule: OptimizationRule): Promise<void> {
        try {
            const { action } = rule;

            switch (action.type) {
                case 'scale':
                    await this.performScaling(action.parameters);
                    break;
                case 'throttle':
                    await this.performThrottling(action.parameters);
                    break;
                case 'cache':
                    await this.performCaching(action.parameters);
                    break;
                case 'optimize':
                    await this.performOptimization(action.parameters);
                    break;
                case 'alert':
                    await this.sendAlert(action.parameters);
                    break;
            }

            this.emit('optimization_executed', {
                rule_id: rule.id,
                action_type: action.type,
                timestamp: new Date(),
                parameters: action.parameters
            });
        } catch (error) {
            console.error(`최적화 액션 실행 오류 (${rule.id}):`, error);
            this.emit('optimization_error', {
                rule_id: rule.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async performScaling(parameters: any): Promise<void> {
        console.log(`스케일링 수행: ${JSON.stringify(parameters)}`);
        // 실제 스케일링 로직 구현
    }

    private async performThrottling(parameters: any): Promise<void> {
        console.log(`스로틀링 수행: ${JSON.stringify(parameters)}`);
        // 실제 스로틀링 로직 구현
    }

    private async performCaching(parameters: any): Promise<void> {
        console.log(`캐싱 수행: ${JSON.stringify(parameters)}`);
        // 실제 캐싱 로직 구현
    }

    private async performOptimization(parameters: any): Promise<void> {
        console.log(`최적화 수행: ${JSON.stringify(parameters)}`);
        // 실제 최적화 로직 구현
    }

    private async sendAlert(parameters: any): Promise<void> {
        console.log(`알림 전송: ${JSON.stringify(parameters)}`);
        // 실제 알림 전송 로직 구현
    }

    private updateSystemHealth(): void {
        const allMetrics = Array.from(this.metrics.values()).flat();
        const criticalMetrics = allMetrics.filter(metric => metric.status === 'critical');
        const warningMetrics = allMetrics.filter(metric => metric.status === 'warning');

        let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';

        if (criticalMetrics.length > 0) {
            overallStatus = 'critical';
        } else if (warningMetrics.length > 0) {
            overallStatus = 'degraded';
        }

        // 시스템별 상태 업데이트
        const systems: { [key: string]: any } = {};
        for (const [systemName, systemMetrics] of this.metrics.entries()) {
            const criticalCount = systemMetrics.filter(m => m.status === 'critical').length;
            const warningCount = systemMetrics.filter(m => m.status === 'warning').length;

            let systemStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
            if (criticalCount > 0) {
                systemStatus = 'critical';
            } else if (warningCount > 0) {
                systemStatus = 'degraded';
            }

            systems[systemName] = {
                status: systemStatus,
                metrics: systemMetrics,
                last_updated: new Date()
            };
        }

        // 권장사항 생성
        const recommendations = this.generateRecommendations(allMetrics);
        const alerts = this.generateAlerts(criticalMetrics);

        this.systemHealth = {
            overall_status: overallStatus,
            systems,
            recommendations,
            alerts
        };

        this.emit('health_updated', this.systemHealth);
    }

    private generateRecommendations(metrics: PerformanceMetric[]): string[] {
        const recommendations: string[] = [];

        const cpuMetrics = metrics.filter(m => m.metric_type === 'cpu');
        const memoryMetrics = metrics.filter(m => m.metric_type === 'memory');
        const responseMetrics = metrics.filter(m => m.metric_type === 'response_time');

        if (cpuMetrics.some(m => m.status === 'warning')) {
            recommendations.push('CPU 사용률이 높습니다. 자동 스케일링을 고려하세요.');
        }

        if (memoryMetrics.some(m => m.status === 'warning')) {
            recommendations.push('메모리 사용률이 높습니다. 가비지 컬렉션을 수행하세요.');
        }

        if (responseMetrics.some(m => m.status === 'warning')) {
            recommendations.push('응답 시간이 느립니다. 캐싱을 활성화하세요.');
        }

        return recommendations;
    }

    private generateAlerts(criticalMetrics: PerformanceMetric[]): string[] {
        return criticalMetrics.map(metric =>
            `${metric.system} 시스템의 ${metric.metric_type}이 임계값을 초과했습니다: ${metric.value}${metric.unit}`
        );
    }

    // Public API Methods
    public getSystemHealth(): SystemHealth {
        return this.systemHealth;
    }

    public getMetrics(system?: string): PerformanceMetric[] {
        if (system) {
            return this.metrics.get(system) || [];
        }
        return Array.from(this.metrics.values()).flat();
    }

    public getOptimizationRules(): OptimizationRule[] {
        return Array.from(this.optimizationRules.values());
    }

    public addOptimizationRule(rule: OptimizationRule): void {
        this.optimizationRules.set(rule.id, rule);
        this.emit('rule_added', rule);
    }

    public updateOptimizationRule(ruleId: string, updates: Partial<OptimizationRule>): void {
        const rule = this.optimizationRules.get(ruleId);
        if (rule) {
            const updatedRule = { ...rule, ...updates };
            this.optimizationRules.set(ruleId, updatedRule);
            this.emit('rule_updated', updatedRule);
        }
    }

    public removeOptimizationRule(ruleId: string): void {
        this.optimizationRules.delete(ruleId);
        this.emit('rule_removed', { ruleId });
    }

    public getConfig(): OptimizationConfig {
        return this.config;
    }

    public updateConfig(updates: Partial<OptimizationConfig>): void {
        this.config = { ...this.config, ...updates };
        this.emit('config_updated', this.config);
    }

    public async performManualOptimization(optimizationType: string, parameters: any): Promise<void> {
        try {
            switch (optimizationType) {
                case 'scale':
                    await this.performScaling(parameters);
                    break;
                case 'throttle':
                    await this.performThrottling(parameters);
                    break;
                case 'cache':
                    await this.performCaching(parameters);
                    break;
                case 'optimize':
                    await this.performOptimization(parameters);
                    break;
                default:
                    throw new Error(`알 수 없는 최적화 유형: ${optimizationType}`);
            }

            this.emit('manual_optimization_completed', {
                type: optimizationType,
                parameters,
                timestamp: new Date()
            });
        } catch (error) {
            this.emit('manual_optimization_error', {
                type: optimizationType,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    public getPerformanceReport(): any {
        const allMetrics = this.getMetrics();
        const systems = Array.from(this.metrics.keys());

        const report = {
            timestamp: new Date(),
            overall_health: this.systemHealth.overall_status,
            systems: systems.map(system => ({
                name: system,
                health: this.systemHealth.systems[system]?.status || 'unknown',
                metrics_count: this.metrics.get(system)?.length || 0,
                critical_metrics: this.metrics.get(system)?.filter(m => m.status === 'critical').length || 0,
                warning_metrics: this.metrics.get(system)?.filter(m => m.status === 'warning').length || 0
            })),
            optimization_rules: {
                total: this.optimizationRules.size,
                enabled: Array.from(this.optimizationRules.values()).filter(r => r.enabled).length,
                disabled: Array.from(this.optimizationRules.values()).filter(r => !r.enabled).length
            },
            recommendations: this.systemHealth.recommendations,
            alerts: this.systemHealth.alerts
        };

        return report;
    }
}

const aiPerformanceOptimizationService = new AIPerformanceOptimizationService();
export default aiPerformanceOptimizationService;
