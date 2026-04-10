import { Project, Chat, Message } from '../types/project';
import realTimeMonitoringService from './realTimeMonitoringService';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    AI_PREDICTIVE_ANOMALIES_STORAGE_KEY,
    AI_PREDICTIVE_DECISIONS_STORAGE_KEY,
    AI_PREDICTIVE_INSIGHTS_STORAGE_KEY,
    AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY,
    AI_PREDICTIVE_TRENDS_STORAGE_KEY,
} from './aiPredictiveAnalyticsStorageKeys';

export interface PredictiveModel {
    id: string;
    name: string;
    type: 'performance' | 'user_behavior' | 'resource_demand' | 'anomaly_detection' | 'trend_forecasting' | 'risk_assessment';
    status: 'active' | 'training' | 'optimizing' | 'error';
    accuracy: number;
    lastUpdated: Date;
    lastTrained: Date;
    version: string;
    parameters: Record<string, unknown>;
    learningRate: number;
    confidence: number;
    autoOptimize: boolean;
    trainingDataSize: number;
    adaptiveThresholds: {
        min: number;
        max: number;
        critical: number;
        warning: number;
    };
}

export interface Prediction {
    id: string;
    modelId: string;
    metric: string;
    target: string;
    predictedValue: number;
    confidence: number;
    timestamp: Date;
    timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
    actualValue?: number;
    accuracy?: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    autoActions: string[];
}

export interface AnomalyDetection {
    id: string;
    metric: string;
    detectedValue: number;
    expectedRange: { min: number; max: number };
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    confidence: number;
    rootCause?: string;
    suggestedActions: string[];
    autoResolve: boolean;
    resolved: boolean;
    resolutionTime?: Date;
    impact: 'low' | 'medium' | 'high' | 'critical';
    affectedServices: string[];
}

export interface TrendAnalysis {
    id: string;
    metric: string;
    period: '1h' | '6h' | '24h' | '7d' | '30d';
    trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical' | 'seasonal';
    direction: 'positive' | 'negative' | 'neutral';
    strength: number; // 0-1
    confidence: number;
    startDate: Date;
    endDate: Date;
    dataPoints: number;
    seasonality?: {
        period: number;
        strength: number;
    };
    forecast: {
        nextValue: number;
        confidence: number;
        timeframe: Date;
    };
    insights: string[];
    recommendations: string[];
}

export interface AutoDecision {
    id: string;
    type: 'optimization' | 'scaling' | 'maintenance' | 'alert' | 'prevention' | 'recovery';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
    trigger: string;
    condition: string;
    action: string;
    description: string;
    confidence: number;
    estimatedImpact: number; // 0-100
    estimatedCost: number;
    risk: 'low' | 'medium' | 'high';
    timestamp: Date;
    executedAt?: Date;
    result?: {
        success: boolean;
        actualImpact: number;
        actualCost: number;
        duration: number;
        errors?: string[];
    };
    dependencies: string[];
    autoExecute: boolean;
    approvalRequired: boolean;
    approvedBy?: string;
    approvedAt?: Date;
}

export interface PredictiveInsight {
    id: string;
    type: 'performance' | 'trend' | 'anomaly' | 'optimization' | 'risk' | 'opportunity';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    category: string;
    tags: string[];
    data: Record<string, unknown>;
    recommendations: string[];
    actions: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
    reviewedBy?: string;
    reviewedAt?: Date;
    implementationDate?: Date;
    results?: {
        success: boolean;
        impact: number;
        feedback: string;
    };
}



interface LearningPattern {
    id: string;
    pattern: string;
    frequency: number;
    confidence: number;
    lastObserved: Date;
    impact: 'positive' | 'negative' | 'neutral';
    category: 'user_behavior' | 'system_performance' | 'resource_usage' | 'error_patterns';
    metadata: Record<string, unknown>;
}

interface AdaptiveThreshold {
    metric: string;
    current: {
        min: number;
        max: number;
        critical: number;
        warning: number;
    };
    adaptive: {
        min: number;
        max: number;
        critical: number;
        warning: number;
    };
    learningRate: number;
    lastUpdated: Date;
    confidence: number;
}

interface RealTimeLearning {
    id: string;
    timestamp: Date;
    input: Record<string, unknown>;
    prediction: Record<string, unknown>;
    actual: Record<string, unknown>;
    error: number;
    learning: {
        parameterUpdates: Record<string, number>;
        confidenceChange: number;
        accuracyChange: number;
    };
    modelId: string;
}

export class AIPredictiveAnalyticsService {
    private predictiveModels: PredictiveModel[] = [];
    private predictions: Prediction[] = [];
    private anomalies: AnomalyDetection[] = [];
    private trends: TrendAnalysis[] = [];
    private autoDecisions: AutoDecision[] = [];
    private insights: PredictiveInsight[] = [];
    private learningPatterns: LearningPattern[] = [];
    private adaptiveThresholds: AdaptiveThreshold[] = [];
    private realTimeLearning: RealTimeLearning[] = [];
    private isLearning: boolean = false;
    private isTraining: boolean = false;
    private autoOptimizationEnabled: boolean = true;
    private continuousLearningEnabled: boolean = true;

    constructor() {
        this.initializeModels();
        this.loadStoredData();
        this.startContinuousLearning();
    }

    private initializeModels(): void {
        this.predictiveModels = [
            {
                id: 'performance-predictor',
                name: '성능 예측 모델',
                type: 'performance',
                accuracy: 0.85,
                lastUpdated: new Date(),
                lastTrained: new Date(),
                version: '1.0.0',
                parameters: {},
                learningRate: 0.01,
                confidence: 0.85,
                autoOptimize: true,
                trainingDataSize: 1000,
                adaptiveThresholds: {
                    min: 0.1,
                    max: 0.9,
                    critical: 0.95,
                    warning: 0.8
                },
                status: 'active'
            },
            {
                id: 'user-behavior-predictor',
                name: '사용자 행동 예측 모델',
                type: 'user_behavior',
                accuracy: 0.78,
                lastUpdated: new Date(),
                lastTrained: new Date(),
                version: '1.0.0',
                parameters: {},
                learningRate: 0.01,
                confidence: 0.78,
                autoOptimize: true,
                trainingDataSize: 800,
                adaptiveThresholds: {
                    min: 0.1,
                    max: 0.9,
                    critical: 0.95,
                    warning: 0.8
                },
                status: 'active'
            },
            {
                id: 'resource-demand-predictor',
                name: '리소스 수요 예측 모델',
                type: 'resource_demand',
                accuracy: 0.82,
                lastUpdated: new Date(),
                lastTrained: new Date(),
                version: '1.0.0',
                parameters: {},
                learningRate: 0.01,
                confidence: 0.82,
                autoOptimize: true,
                trainingDataSize: 600,
                adaptiveThresholds: {
                    min: 0.1,
                    max: 0.9,
                    critical: 0.95,
                    warning: 0.8
                },
                status: 'active'
            },
            {
                id: 'anomaly-detector',
                name: '이상 징후 감지 모델',
                type: 'anomaly_detection',
                accuracy: 0.91,
                lastUpdated: new Date(),
                lastTrained: new Date(),
                version: '1.0.0',
                parameters: {},
                learningRate: 0.01,
                confidence: 0.91,
                autoOptimize: true,
                trainingDataSize: 1200,
                adaptiveThresholds: {
                    min: 0.1,
                    max: 0.9,
                    critical: 0.95,
                    warning: 0.8
                },
                status: 'active'
            }
        ];

        // Initialize adaptive thresholds
        this.adaptiveThresholds = [
            { metric: 'cpu', current: { min: 0, max: 100, critical: 90, warning: 75 }, adaptive: { min: 0, max: 100, critical: 90, warning: 75 }, learningRate: 0.01, lastUpdated: new Date(), confidence: 0.85 },
            { metric: 'memory', current: { min: 0, max: 100, critical: 85, warning: 70 }, adaptive: { min: 0, max: 100, critical: 85, warning: 70 }, learningRate: 0.01, lastUpdated: new Date(), confidence: 0.87 },
            { metric: 'responseTime', current: { min: 0, max: 5000, critical: 4000, warning: 3000 }, adaptive: { min: 0, max: 5000, critical: 4000, warning: 3000 }, learningRate: 0.008, lastUpdated: new Date(), confidence: 0.82 },
            { metric: 'errorRate', current: { min: 0, max: 10, critical: 8, warning: 5 }, adaptive: { min: 0, max: 10, critical: 8, warning: 5 }, learningRate: 0.015, lastUpdated: new Date(), confidence: 0.89 },
            { metric: 'userSatisfaction', current: { min: 0, max: 100, critical: 30, warning: 50 }, adaptive: { min: 0, max: 100, critical: 30, warning: 50 }, learningRate: 0.005, lastUpdated: new Date(), confidence: 0.78 }
        ];
    }

    private loadStoredData(): void {
        try {
            const storedPredictions = localStorage.getItem(AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY);
            if (storedPredictions) {
                this.predictions = (JSON.parse(storedPredictions) as Record<string, unknown>[]).map((p: Record<string, unknown>) => ({
                    ...p,
                    timestamp: new Date(p.timestamp as string | number),
                    actualValue: p.actualValue as number | undefined
                })) as Prediction[];
            }

            const storedAnomalies = localStorage.getItem(AI_PREDICTIVE_ANOMALIES_STORAGE_KEY);
            if (storedAnomalies) {
                this.anomalies = (JSON.parse(storedAnomalies) as Record<string, unknown>[]).map((a: Record<string, unknown>) => ({
                    ...a,
                    timestamp: new Date(a.timestamp as string | number)
                })) as AnomalyDetection[];
            }

            const storedTrends = localStorage.getItem(AI_PREDICTIVE_TRENDS_STORAGE_KEY);
            if (storedTrends) {
                this.trends = (JSON.parse(storedTrends) as Record<string, unknown>[]).map((t: Record<string, unknown>) => ({
                    ...t,
                    timestamp: new Date(t.timestamp as string | number)
                })) as unknown as TrendAnalysis[];
            }

            const storedDecisions = localStorage.getItem(AI_PREDICTIVE_DECISIONS_STORAGE_KEY);
            if (storedDecisions) {
                this.autoDecisions = (JSON.parse(storedDecisions) as Record<string, unknown>[]).map((d: Record<string, unknown>) => ({
                    ...d,
                    timestamp: new Date((d.timestamp ?? d.createdAt) as string | number),
                    executedAt: d.executedAt ? new Date(d.executedAt as string | number) : undefined
                })) as AutoDecision[];
            }

            const storedInsights = localStorage.getItem(AI_PREDICTIVE_INSIGHTS_STORAGE_KEY);
            if (storedInsights) {
                this.insights = (JSON.parse(storedInsights) as Record<string, unknown>[]).map((i: Record<string, unknown>) => ({
                    ...i,
                    timestamp: new Date((i.timestamp ?? i.lastUpdated) as string | number)
                })) as PredictiveInsight[];
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('예측 분석 데이터 로드 중 오류', err, {
                component: 'aiPredictiveAnalyticsService',
                action: 'loadData',
            });
        }
    }

    private saveData(): void {
        try {
            localStorage.setItem(AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY, JSON.stringify(this.predictions));
            localStorage.setItem(AI_PREDICTIVE_ANOMALIES_STORAGE_KEY, JSON.stringify(this.anomalies));
            localStorage.setItem(AI_PREDICTIVE_TRENDS_STORAGE_KEY, JSON.stringify(this.trends));
            localStorage.setItem(AI_PREDICTIVE_DECISIONS_STORAGE_KEY, JSON.stringify(this.autoDecisions));
            localStorage.setItem(AI_PREDICTIVE_INSIGHTS_STORAGE_KEY, JSON.stringify(this.insights));
        } catch (error) {
            const err = toError(error);
            errorLogger.error('예측 분석 데이터 저장 중 오류', err, {
                component: 'aiPredictiveAnalyticsService',
                action: 'saveData',
            });
        }
    }

    // 성능 예측 실행
    async runPerformancePredictions(_projects: Project[], _chats: Chat[], _messages: Message[]): Promise<Prediction[]> {
        const predictions: Prediction[] = [];
        const metrics = realTimeMonitoringService.getMetrics();

        // CPU 사용률 예측
        const cpuPrediction = await this.predictMetric('cpu_usage', metrics, '1h');
        if (cpuPrediction) predictions.push(cpuPrediction);

        // 메모리 사용률 예측
        const memoryPrediction = await this.predictMetric('memory_usage', metrics, '1h');
        if (memoryPrediction) predictions.push(memoryPrediction);

        // 응답 시간 예측
        const responseTimePrediction = await this.predictMetric('response_time', metrics, '1h');
        if (responseTimePrediction) predictions.push(responseTimePrediction);

        // 오류율 예측
        const errorRatePrediction = await this.predictMetric('error_rate', metrics, '1h');
        if (errorRatePrediction) predictions.push(errorRatePrediction);

        // 사용자 만족도 예측
        const satisfactionPrediction = await this.predictMetric('user_satisfaction', metrics, '1h');
        if (satisfactionPrediction) predictions.push(satisfactionPrediction);

        this.predictions.push(...predictions);
        this.saveData();

        return predictions;
    }

    private async predictMetric(metricName: string, currentMetrics: Record<string, unknown>[], timeframe: '1h' | '6h' | '24h' | '7d' | '30d'): Promise<Prediction | null> {
        if (!currentMetrics || !Array.isArray(currentMetrics)) return null;
        const metric = currentMetrics.find(m => (m as Record<string, unknown>).id === metricName) as Record<string, unknown> | undefined;
        if (!metric) return null;

        // 시뮬레이션된 예측 로직
        const baseValue = Number(metric.value);
        const trend = metric.trend as string;
        const confidence = 0.7 + Math.random() * 0.2; // 70-90% 신뢰도

        let predictedValue = baseValue;
        const timeMultiplier = timeframe === '1h' ? 1.1 : timeframe === '6h' ? 1.2 : 1.3;

        if (trend === 'improving') {
            predictedValue = baseValue * (1 - 0.1 * timeMultiplier);
        } else if (trend === 'declining') {
            predictedValue = baseValue * (1 + 0.1 * timeMultiplier);
        } else {
            predictedValue = baseValue * (1 + (Math.random() - 0.5) * 0.05 * timeMultiplier);
        }

        const prediction: Prediction = {
            id: `pred-${metricName}-${Date.now()}`,
            modelId: 'performance-predictor',
            metric: metricName,
            target: String(metric.id ?? metricName),
            predictedValue: Math.max(0, Math.min(100, predictedValue)),
            confidence,
            timeframe,
            timestamp: new Date(),
            trend: 'stable',
            impact: 'low',
            recommendations: [],
            autoActions: []
        };

        return prediction;
    }

    // 이상 징후 감지
    async detectAnomalies(_projects: Project[], _chats: Chat[], _messages: Message[]): Promise<AnomalyDetection[]> {
        const anomalies: AnomalyDetection[] = [];
        const metrics = realTimeMonitoringService.getMetrics();
        
        if (!metrics || !Array.isArray(metrics)) return anomalies;
        
        for (const metric of metrics) {
            const anomaly = this.checkForAnomaly(metric);
            if (anomaly) {
                anomalies.push(anomaly);
            }
        }

        this.anomalies.push(...anomalies);
        this.saveData();

        return anomalies;
    }

    private checkForAnomaly(metric: Record<string, unknown>): AnomalyDetection | null {
        const value = Number(metric.value);
        const threshold = metric.threshold as { warning?: number; critical?: number };
        const expectedRange = {
            min: (threshold.warning ?? 80) * 0.8,
            max: (threshold.critical ?? 100) * 1.1
        };

        if (value < expectedRange.min || value > expectedRange.max) {
            const severity = value >= (threshold.critical ?? 100) ? 'critical' :
                value >= (threshold.warning ?? 80) ? 'high' :
                    value < expectedRange.min * 0.5 ? 'medium' : 'low';

            return {
                id: `anomaly-${metric.id}-${Date.now()}`,
                metric: String(metric.id),
                detectedValue: value,
                expectedRange,
                severity,
                timestamp: new Date(),
                confidence: 0.85,
                suggestedActions: this.generateAnomalyRecommendations(metric, severity),
                autoResolve: false,
                resolved: false,
                impact: severity as 'low' | 'medium' | 'high' | 'critical',
                affectedServices: [String(metric.id)]
            };
        }

        return null;
    }

    private generateAnomalyRecommendations(metric: Record<string, unknown>, severity: string): string[] {
        const recommendations: string[] = [];

        if (String(metric.id) === 'cpu_usage' && severity === 'critical') {
            recommendations.push('CPU 사용률이 임계치를 초과했습니다. 서버 리소스를 즉시 확장하세요.');
            recommendations.push('불필요한 프로세스를 종료하여 CPU 부하를 줄이세요.');
        } else if (String(metric.id) === 'memory_usage' && severity === 'high') {
            recommendations.push('메모리 사용률이 높습니다. 메모리 정리를 실행하세요.');
            recommendations.push('캐시 크기를 조정하여 메모리 효율성을 개선하세요.');
        } else if (String(metric.id) === 'response_time' && severity === 'critical') {
            recommendations.push('응답 시간이 임계치를 초과했습니다. 데이터베이스 쿼리를 최적화하세요.');
            recommendations.push('CDN을 사용하여 응답 시간을 개선하세요.');
        } else if (String(metric.id) === 'error_rate' && severity === 'high') {
            recommendations.push('오류율이 증가하고 있습니다. 오류 로그를 분석하세요.');
            recommendations.push('시스템 안정성을 점검하고 백업을 준비하세요.');
        }

        return recommendations;
    }

    // 트렌드 분석
    async analyzeTrends(_projects: Project[], _chats: Chat[], _messages: Message[]): Promise<TrendAnalysis[]> {
        const trends: TrendAnalysis[] = [];
        const metrics = realTimeMonitoringService.getMetrics();

        if (!metrics || !Array.isArray(metrics)) return trends;

        for (const metric of metrics) {
            const trend = this.calculateTrend(metric);
            if (trend) {
                trends.push(trend);
            }
        }

        this.trends.push(...trends);
        this.saveData();

        return trends;
    }

    private calculateTrend(metric: Record<string, unknown>): TrendAnalysis | null {
        const history = (metric.history as unknown[]) ?? [];
        if (history.length < 5) return null;

        const recentValues = history.slice(-5).map((h: unknown) => Number((h as Record<string, unknown>).value));
        const trend = this.determineTrendDirection(recentValues);
        const strength = this.calculateTrendStrength(recentValues);
        const confidence = 0.6 + strength * 0.3;

        const forecast = {
            nextValue: this.forecastValue(Number(metric.value), trend, 1),
            confidence: confidence,
            timeframe: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        return {
            id: `trend-${metric.id}-${Date.now()}`,
            metric: String(metric.id),
            period: '24h',
            trend: trend.trend === 'fluctuating' ? 'cyclical' : trend.trend,
            direction: trend.direction,
            strength,
            confidence,
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            dataPoints: 5,
            forecast,
            insights: this.identifyTrendFactors(metric),
            recommendations: [`${String(metric.id)} 트렌드 모니터링 지속`]
        };
    }

    private determineTrendDirection(values: number[]): { trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating'; direction: 'positive' | 'negative' | 'neutral' } {
        if (values.length < 2) return { trend: 'stable', direction: 'neutral' };

        const first = values[0];
        const last = values[values.length - 1];
        const change = (last - first) / first;

        if (Math.abs(change) < 0.05) {
            return { trend: 'stable', direction: 'neutral' };
        }

        // 대부분의 메트릭에서 값이 낮을수록 좋음
        const isPositive = change < 0;

        if (Math.abs(change) > 0.2) {
            return {
                trend: isPositive ? 'decreasing' : 'increasing',
                direction: isPositive ? 'positive' : 'negative'
            };
        } else {
            return {
                trend: isPositive ? 'decreasing' : 'increasing',
                direction: isPositive ? 'positive' : 'negative'
            };
        }
    }

    private calculateTrendStrength(values: number[]): number {
        if (values.length < 2) return 0;

        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(Math.abs((values[i] - values[i - 1]) / values[i - 1]));
        }

        const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
        return Math.min(1, avgChange * 10); // 0-1 범위로 정규화
    }

    private forecastValue(currentValue: number, trend: { direction: string }, days: number): number {
        const dailyChange = trend.direction === 'positive' ? -0.02 : 0.02; // 2% 일일 변화
        return Math.max(0, Math.min(100, currentValue * (1 + dailyChange * days)));
    }

    private identifyTrendFactors(metric: Record<string, unknown>): string[] {
        const factors: string[] = [];
        const id = String(metric.id);

        if (id === 'cpu_usage') {
            factors.push('사용자 활동 증가');
            factors.push('백그라운드 프로세스');
        } else if (id === 'memory_usage') {
            factors.push('데이터 처리량');
            factors.push('캐시 사용량');
        } else if (id === 'response_time') {
            factors.push('네트워크 지연');
            factors.push('데이터베이스 성능');
        } else if (id === 'error_rate') {
            factors.push('시스템 안정성');
            factors.push('코드 품질');
        }

        return factors;
    }

    // 자동 의사결정 생성
    async generateAutoDecisions(projects: Project[], chats: Chat[], messages: Message[]): Promise<AutoDecision[]> {
        const decisions: AutoDecision[] = [];
        const predictions = this.predictions.slice(-10);
        const anomalies = this.anomalies.filter(a => !a.autoResolve);
        const trends = this.trends.slice(-5);

        // 성능 기반 의사결정
        const performanceDecisions = this.generatePerformanceDecisions(predictions, anomalies);
        decisions.push(...performanceDecisions);

        // 사용자 행동 기반 의사결정
        const behaviorDecisions = this.generateBehaviorDecisions(projects, chats, messages);
        decisions.push(...behaviorDecisions);

        // 리소스 기반 의사결정
        const resourceDecisions = this.generateResourceDecisions(trends);
        decisions.push(...resourceDecisions);

        this.autoDecisions.push(...decisions);
        this.saveData();

        return decisions;
    }

    private generatePerformanceDecisions(predictions: Prediction[], anomalies: AnomalyDetection[]): AutoDecision[] {
        const decisions: AutoDecision[] = [];

        // CPU 사용률 예측 기반 의사결정
        const cpuPrediction = predictions.find(p => p.target === 'cpu_usage');
        if (cpuPrediction && cpuPrediction.predictedValue > 80) {
            decisions.push({
                id: `decision-cpu-${Date.now()}`,
                type: 'scaling',
                trigger: 'CPU 사용률 예측',
                condition: 'CPU 사용률이 80%를 초과할 것으로 예측됨',
                action: '서버 리소스 자동 확장',
                priority: 'high',
                status: 'pending',
                description: 'CPU 사용률 증가에 따른 자동 스케일링',
                confidence: cpuPrediction.confidence,
                estimatedImpact: 0.8,
                estimatedCost: 100,
                risk: 'low',
                timestamp: new Date(),
                dependencies: [],
                autoExecute: true,
                approvalRequired: false
            });
        }

        // 이상 징후 기반 의사결정
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
        for (const anomaly of criticalAnomalies) {
            decisions.push({
                id: `decision-anomaly-${anomaly.id}`,
                type: 'optimization',
                trigger: '이상 징후 감지',
                condition: `${anomaly.metric}에서 ${anomaly.severity} 수준의 이상 징후 발견`,
                action: '자동 최적화 실행',
                priority: 'critical',
                status: 'pending',
                description: '이상 징후 감지에 따른 자동 최적화',
                confidence: 0.9,
                estimatedImpact: 0.7,
                estimatedCost: 200,
                risk: 'medium',
                timestamp: new Date(),
                dependencies: [],
                autoExecute: true,
                approvalRequired: false
            });
        }

        return decisions;
    }

    private generateBehaviorDecisions(projects: Project[], chats: Chat[], messages: Message[]): AutoDecision[] {
        const decisions: AutoDecision[] = [];

        // 사용자 활동 패턴 분석
        const recentMessages = messages.filter(m =>
            new Date(m.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        );

        if (recentMessages.length > 100) {
            decisions.push({
                id: `decision-activity-${Date.now()}`,
                type: 'scaling',
                trigger: '사용자 활동 증가',
                condition: '24시간 내 메시지 수가 100개를 초과함',
                action: '시스템 리소스 사전 확장',
                priority: 'medium',
                status: 'pending',
                description: '사용자 활동 증가에 따른 자동 스케일링',
                confidence: 0.75,
                estimatedImpact: 0.6,
                estimatedCost: 50,
                risk: 'low',
                timestamp: new Date(),
                dependencies: [],
                autoExecute: true,
                approvalRequired: false
            });
        }

        return decisions;
    }

    private generateResourceDecisions(trends: TrendAnalysis[]): AutoDecision[] {
        const decisions: AutoDecision[] = [];

        // 메모리 사용률 트렌드 기반 의사결정
        const memoryTrend = trends.find(t => t.metric === 'memory_usage');
        if (memoryTrend && memoryTrend.trend === 'increasing' && memoryTrend.strength > 0.7) {
            decisions.push({
                id: `decision-memory-${Date.now()}`,
                type: 'maintenance',
                trigger: '메모리 사용률 증가 트렌드',
                condition: '메모리 사용률이 지속적으로 증가하고 있음',
                action: '메모리 정리 및 최적화 실행',
                priority: 'medium',
                status: 'pending',
                description: '메모리 사용률 증가에 따른 유지보수',
                confidence: memoryTrend.confidence,
                estimatedImpact: 0.5,
                estimatedCost: 30,
                risk: 'low',
                timestamp: new Date(),
                dependencies: [],
                autoExecute: true,
                approvalRequired: false
            });
        }

        return decisions;
    }

    // 예측 인사이트 생성
    async generatePredictiveInsights(projects: Project[], chats: Chat[], messages: Message[]): Promise<PredictiveInsight[]> {
        const insights: PredictiveInsight[] = [];
        const predictions = this.predictions.slice(-20);
        const trends = this.trends.slice(-10);
        const _decisions = this.autoDecisions.slice(-10);

        // 성능 인사이트
        const performanceInsights = this.generatePerformanceInsights(predictions, trends);
        insights.push(...performanceInsights);

        // 사용자 행동 인사이트
        const behaviorInsights = this.generateBehaviorInsights(projects, chats, messages);
        insights.push(...behaviorInsights);

        // 시스템 건강도 인사이트
        const healthInsights = this.generateHealthInsights(predictions, trends);
        insights.push(...healthInsights);

        this.insights.push(...insights);
        this.saveData();

        return insights;
    }

    private generatePerformanceInsights(predictions: Prediction[], _trends: TrendAnalysis[]): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];

        // CPU 사용률 예측 인사이트
        const cpuPredictions = predictions.filter(p => p.target === 'cpu_usage');
        if (cpuPredictions.length > 0) {
            const avgPrediction = cpuPredictions.reduce((sum, p) => sum + p.predictedValue, 0) / cpuPredictions.length;

            if (avgPrediction > 70) {
                insights.push({
                    id: `insight-cpu-${Date.now()}`,
                    type: 'performance',
                    title: 'CPU 사용률 최적화 필요',
                    description: 'CPU 사용률이 높은 수준을 유지할 것으로 예측됩니다. 리소스 확장을 고려하세요.',
                    confidence: 0.8,
                    impact: 'high',
                    timestamp: new Date(),
                    category: 'performance',
                    tags: ['cpu', 'performance', 'optimization'],
                    data: { avgPrediction, dataPoints: cpuPredictions.length },
                    recommendations: [
                        '서버 리소스 사전 확장',
                        '불필요한 프로세스 정리',
                        '로드 밸런싱 최적화'
                    ],
                    actions: ['scale_resources', 'optimize_processes'],
                    priority: 'high',
                    status: 'new'
                });
            }
        }

        return insights;
    }

    private generateBehaviorInsights(projects: Project[], chats: Chat[], messages: Message[]): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];

        // 사용자 활동 패턴 분석
        const recentActivity = messages.filter(m =>
            new Date(m.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length;

        const previousWeekActivity = messages.filter(m => {
            const messageTime = new Date(m.timestamp).getTime();
            const weekAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            const twoWeeksAgo = Date.now() - 21 * 24 * 60 * 60 * 1000;
            return messageTime > twoWeeksAgo && messageTime <= weekAgo;
        }).length;

        if (recentActivity > previousWeekActivity * 1.5) {
            insights.push({
                id: `insight-activity-${Date.now()}`,
                type: 'trend',
                title: '사용자 활동 증가 트렌드',
                description: '사용자 활동이 이전 주 대비 50% 증가했습니다. 시스템 부하 증가를 예상하세요.',
                confidence: 0.85,
                impact: 'medium',
                timestamp: new Date(),
                category: 'user_behavior',
                tags: ['activity', 'trend', 'user_behavior'],
                data: { recentActivity, previousWeekActivity, increase: '50%' },
                recommendations: [
                    '시스템 리소스 사전 확장',
                    '사용자 경험 최적화',
                    '성능 모니터링 강화'
                ],
                actions: ['scale_resources', 'optimize_ux'],
                priority: 'medium',
                status: 'new'
            });
        }

        return insights;
    }

    private generateHealthInsights(predictions: Prediction[], _trends: TrendAnalysis[]): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];

        // 시스템 안정성 인사이트
        const errorRatePredictions = predictions.filter(p => p.target === 'error_rate');
        if (errorRatePredictions.length > 0) {
            const avgErrorRate = errorRatePredictions.reduce((sum, p) => sum + p.predictedValue, 0) / errorRatePredictions.length;

            if (avgErrorRate > 3) {
                insights.push({
                    id: `insight-health-${Date.now()}`,
                    type: 'anomaly',
                    title: '시스템 안정성 경고',
                    description: '오류율이 증가 추세를 보이고 있습니다. 시스템 안정성을 점검하세요.',
                    confidence: 0.75,
                    impact: 'high',
                    timestamp: new Date(),
                    category: 'system_health',
                    tags: ['error_rate', 'stability', 'health'],
                    data: { avgErrorRate, dataPoints: errorRatePredictions.length },
                    recommendations: [
                        '오류 로그 상세 분석',
                        '시스템 안정성 점검',
                        '백업 및 복구 계획 검토'
                    ],
                    actions: ['analyze_logs', 'check_stability'],
                    priority: 'high',
                    status: 'new'
                });
            }
        }

        return insights;
    }

    // 모델 재훈련
    async retrainModels(): Promise<PredictiveModel[]> {
        if (this.isTraining) {
            throw new Error('모델 훈련이 이미 진행 중입니다.');
        }

        this.isTraining = true;

        try {
            for (const model of this.predictiveModels) {
                model.status = 'training';

                // 시뮬레이션된 훈련 시간
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 모델 성능 개선 (시뮬레이션)
                const improvement = Math.random() * 0.1; // 0-10% 개선
                model.accuracy = Math.min(0.98, model.accuracy + improvement);
                model.lastTrained = new Date();
                model.trainingDataSize += 100;
                model.status = 'active';
            }

            this.saveData();
            return [...this.predictiveModels];
        } finally {
            this.isTraining = false;
        }
    }

    // 공개 메서드들
    getPredictiveModels(): PredictiveModel[] {
        return [...this.predictiveModels];
    }

    getPredictions(): Prediction[] {
        return [...this.predictions];
    }

    getAnomalies(): AnomalyDetection[] {
        return [...this.anomalies];
    }

    getTrends(): TrendAnalysis[] {
        return [...this.trends];
    }

    getAutoDecisions(): AutoDecision[] {
        return [...this.autoDecisions];
    }

    getInsights(): PredictiveInsight[] {
        return [...this.insights];
    }

    isTrainingActive(): boolean {
        return this.isTraining;
    }

    // 예측 정확도 업데이트
    updatePredictionAccuracy(predictionId: string, actualValue: number): void {
        const prediction = this.predictions.find(p => p.id === predictionId);
        if (prediction) {
            prediction.actualValue = actualValue;
            prediction.accuracy = 1 - Math.abs(prediction.predictedValue - actualValue) / actualValue;
        }
    }

    // 이상 징후 해결
    resolveAnomaly(anomalyId: string): void {
        const anomaly = this.anomalies.find(a => a.id === anomalyId);
        if (anomaly) {
            anomaly.autoResolve = true;
        }
    }

    // 자동 의사결정 실행
    async executeAutoDecision(decisionId: string): Promise<boolean> {
        const decision = this.autoDecisions.find(d => d.id === decisionId);
        if (!decision || decision.status !== 'pending') {
            return false;
        }

        decision.status = 'executing';
        decision.executedAt = new Date();

        try {
            // 의사결정 실행 로직 (시뮬레이션)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const success = Math.random() > 0.1; // 90% 성공률
            const actualImpact = success ? decision.estimatedImpact * (0.8 + Math.random() * 0.4) : 0;

            decision.status = success ? 'completed' : 'failed';
            decision.result = {
                success,
                actualImpact,
                actualCost: decision.estimatedCost * (success ? 1 : 0.5),
                duration: 1000,
                errors: success ? undefined : ['시스템 오류', '리소스 부족']
            };

            this.saveData();
            return success;
        } catch (error) {
            decision.status = 'failed';
            decision.result = {
                success: false,
                actualImpact: 0,
                actualCost: 0,
                duration: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
            this.saveData();
            return false;
        }
    }

    private startContinuousLearning(): void {
        if (this.continuousLearningEnabled) {
            setInterval(() => {
                this.performContinuousLearning();
            }, 30000); // Every 30 seconds
        }
    }

    private async performContinuousLearning(): Promise<void> {
        if (this.isLearning) return;

        this.isLearning = true;
        try {
            // Get current metrics
            const currentMetrics = realTimeMonitoringService.getMetrics();

            // Update adaptive thresholds
            await this.updateAdaptiveThresholds(currentMetrics);

            // Learn from recent predictions
            await this.learnFromRecentPredictions();

            // Optimize models if needed
            await this.autoOptimizeModels();

            // Generate new insights
            await this.generateRealTimeInsights();

        } catch (error) {
            const err = toError(error);
            errorLogger.error('Continuous learning error', err, {
                component: 'aiPredictiveAnalyticsService',
                action: 'performContinuousLearning',
            });
        } finally {
            this.isLearning = false;
        }
    }

    private async updateAdaptiveThresholds(metrics: Record<string, unknown>[]): Promise<void> {
        for (const threshold of this.adaptiveThresholds) {
            const metric = metrics.find(m => (m as Record<string, unknown>).name === threshold.metric) as Record<string, unknown> | undefined;
            if (metric) {
                const currentValue = Number(metric.value);
                const learningRate = threshold.learningRate;

                // Adaptive threshold adjustment based on current performance
                if (currentValue > threshold.current.warning) {
                    // If current value is high, adjust thresholds upward
                    threshold.adaptive.warning = Math.min(threshold.adaptive.warning * (1 + learningRate), threshold.current.max * 0.9);
                    threshold.adaptive.critical = Math.min(threshold.adaptive.critical * (1 + learningRate), threshold.current.max * 0.95);
                } else if (currentValue < threshold.current.warning * 0.5) {
                    // If current value is low, adjust thresholds downward
                    threshold.adaptive.warning = Math.max(threshold.adaptive.warning * (1 - learningRate), threshold.current.min * 1.1);
                    threshold.adaptive.critical = Math.max(threshold.adaptive.critical * (1 - learningRate), threshold.current.min * 1.2);
                }

                threshold.lastUpdated = new Date();
                threshold.confidence = Math.min(threshold.confidence + learningRate * 0.1, 0.95);
            }
        }
    }

    private async learnFromRecentPredictions(): Promise<void> {
        const recentPredictions = this.predictions.filter(p =>
            new Date(p.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000 && p.actualValue !== undefined
        );

        for (const prediction of recentPredictions) {
            const model = this.predictiveModels.find(m => m.id === prediction.modelId);
            if (model && prediction.actualValue !== undefined) {
                const error = Math.abs(prediction.predictedValue - prediction.actualValue);
                const accuracy = Math.max(0, 1 - error / Math.max(prediction.actualValue, 1));

                // Update model accuracy
                model.accuracy = model.accuracy * 0.9 + accuracy * 0.1;

                // Create learning record
                const learningRecord: RealTimeLearning = {
                    id: `learn-${Date.now()}-${Math.random()}`,
                    timestamp: new Date(),
                    input: { metric: prediction.metric, timeframe: prediction.timeframe },
                    prediction: { value: prediction.predictedValue, confidence: prediction.confidence },
                    actual: { value: prediction.actualValue },
                    error: error,
                    learning: {
                        parameterUpdates: { accuracy: accuracy - model.accuracy },
                        confidenceChange: accuracy > model.accuracy ? 0.01 : -0.01,
                        accuracyChange: accuracy - model.accuracy
                    },
                    modelId: model.id
                };

                this.realTimeLearning.push(learningRecord);

                // Update model confidence
                model.confidence = Math.max(0.5, Math.min(0.95, model.confidence + learningRecord.learning.confidenceChange));
                model.lastUpdated = new Date();
            }
        }
    }

    private async autoOptimizeModels(): Promise<void> {
        if (!this.autoOptimizationEnabled) return;

        for (const model of this.predictiveModels) {
            if (model.autoOptimize && model.accuracy < 0.8) {
                model.status = 'optimizing';

                // Simulate optimization process
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Improve model performance
                const improvement = Math.random() * 0.1 + 0.05; // 5-15% improvement
                model.accuracy = Math.min(0.95, model.accuracy + improvement);
                model.confidence = Math.min(0.95, model.confidence + improvement * 0.5);
                model.version = this.incrementVersion(model.version);
                model.lastUpdated = new Date();
                model.status = 'active';

                errorLogger.info(`Model ${model.name} optimized: accuracy improved to ${model.accuracy.toFixed(3)}`, {
                    component: 'aiPredictiveAnalyticsService',
                    action: 'optimizeModels',
                    modelId: model.id,
                    modelName: model.name,
                    accuracy: model.accuracy,
                });
            }
        }
    }

    private incrementVersion(version: string): string {
        const parts = version.split('.');
        const minor = parseInt(parts[2]) + 1;
        return `${parts[0]}.${parts[1]}.${minor}`;
    }

    private async generateRealTimeInsights(): Promise<void> {
        const recentMetrics = realTimeMonitoringService.getMetrics();
        const recentPredictions = this.predictions.filter(p =>
            new Date(p.timestamp).getTime() > Date.now() - 60 * 60 * 1000
        );

        // Performance optimization insight
        const cpuMetric = Array.isArray(recentMetrics) ? recentMetrics.find((m: unknown) => (m as Record<string, unknown>).name === 'cpu') as Record<string, unknown> | undefined : null;
        const cpuValue = cpuMetric ? Number((cpuMetric as Record<string, unknown>).value) : 0;
        if (cpuMetric && cpuValue > 80) {
            const insight: PredictiveInsight = {
                id: `insight-${Date.now()}-${Math.random()}`,
                type: 'optimization',
                title: 'CPU 사용률 최적화 필요',
                description: `현재 CPU 사용률이 ${cpuValue.toFixed(1)}%로 높은 수준입니다. 시스템 성능 최적화가 권장됩니다.`,
                confidence: 0.92,
                impact: 'high',
                timestamp: new Date(),
                category: 'performance',
                tags: ['cpu', 'optimization', 'performance'],
                data: { currentCpu: cpuValue, threshold: 80 },
                recommendations: [
                    '불필요한 백그라운드 프로세스 종료',
                    '캐시 최적화',
                    '리소스 사용량이 높은 서비스 모니터링'
                ],
                actions: ['auto_optimize', 'scale_resources', 'alert_admin'],
                priority: 'high',
                status: 'new'
            };
            this.insights.push(insight);
        }

        // Trend-based insight
        const trendInsight = this.generateTrendInsight(recentPredictions);
        if (trendInsight) {
            this.insights.push(trendInsight);
        }
    }

    private generateTrendInsight(predictions: Prediction[]): PredictiveInsight | null {
        if (predictions.length < 3) return null;

        const cpuPredictions = predictions.filter(p => p.metric === 'cpu');
        if (cpuPredictions.length >= 3) {
            const trend = this.calculateSimpleTrend(cpuPredictions.map(p => p.predictedValue));

            if (trend && trend.direction === 'negative' && trend.strength > 0.7) {
                return {
                    id: `trend-insight-${Date.now()}-${Math.random()}`,
                    type: 'trend',
                    title: 'CPU 사용률 상승 트렌드 감지',
                    description: 'CPU 사용률이 지속적으로 상승하는 트렌드가 감지되었습니다. 사전 대응이 필요합니다.',
                    confidence: 0.85,
                    impact: 'medium',
                    timestamp: new Date(),
                    category: 'trend',
                    tags: ['cpu', 'trend', 'prediction'],
                    data: { trend: trend, predictions: cpuPredictions.length },
                    recommendations: [
                        '리소스 사용량 분석',
                        '확장 계획 수립',
                        '성능 최적화 검토'
                    ],
                    actions: ['monitor_trend', 'plan_scaling', 'optimize_performance'],
                    priority: 'medium',
                    status: 'new'
                };
            }
        }

        return null;
    }

    private calculateSimpleTrend(values: number[]): { direction: 'positive' | 'negative' | 'stable'; strength: number } {
        if (values.length < 2) return { direction: 'stable', strength: 0 };

        let increasing = 0;
        let decreasing = 0;

        for (let i = 1; i < values.length; i++) {
            if (values[i] > values[i - 1]) increasing++;
            else if (values[i] < values[i - 1]) decreasing++;
        }

        const total = values.length - 1;
        const strength = Math.max(increasing, decreasing) / total;

        if (increasing > decreasing) return { direction: 'positive', strength };
        else if (decreasing > increasing) return { direction: 'negative', strength };
        else return { direction: 'stable', strength };
    }

    // Enhanced public methods
    public async runAdvancedPredictiveAnalysis(projects: Project[] = [], chats: Chat[] = [], messages: Message[] = []): Promise<void> {
        await this.runPerformancePredictions(projects, chats, messages);
        await this.detectAnomalies(projects, chats, messages);
        await this.analyzeTrends(projects, chats, messages);
        await this.generateAutoDecisions(projects, chats, messages);
        await this.generatePredictiveInsights(projects, chats, messages);
        await this.performContinuousLearning();
    }

    public getLearningPatterns(): LearningPattern[] {
        return this.learningPatterns;
    }

    public getAdaptiveThresholds(): AdaptiveThreshold[] {
        return this.adaptiveThresholds;
    }

    public getRealTimeLearning(): RealTimeLearning[] {
        return this.realTimeLearning;
    }

    public getSystemHealth(): {
        overallHealth: number;
        modelPerformance: number;
        predictionAccuracy: number;
        anomalyDetectionRate: number;
        autoDecisionSuccess: number;
        learningEfficiency: number;
    } {
        const avgModelAccuracy = this.predictiveModels.reduce((sum, m) => sum + m.accuracy, 0) / this.predictiveModels.length;
        const avgPredictionAccuracy = this.predictions.length > 0 ?
            this.predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / this.predictions.length : 0;
        const anomalyDetectionRate = this.anomalies.length > 0 ?
            this.anomalies.filter(a => a.resolved).length / this.anomalies.length : 0;
        const autoDecisionSuccess = this.autoDecisions.length > 0 ?
            this.autoDecisions.filter(d => d.result?.success).length / this.autoDecisions.length : 0;
        const learningEfficiency = this.realTimeLearning.length > 0 ?
            this.realTimeLearning.reduce((sum, l) => sum + (1 - l.error), 0) / this.realTimeLearning.length : 0;

        return {
            overallHealth: (avgModelAccuracy + avgPredictionAccuracy + anomalyDetectionRate + autoDecisionSuccess + learningEfficiency) / 5,
            modelPerformance: avgModelAccuracy,
            predictionAccuracy: avgPredictionAccuracy,
            anomalyDetectionRate,
            autoDecisionSuccess,
            learningEfficiency
        };
    }

    public toggleContinuousLearning(enabled: boolean): void {
        this.continuousLearningEnabled = enabled;
    }

    public toggleAutoOptimization(enabled: boolean): void {
        this.autoOptimizationEnabled = enabled;
    }

    public getAdvancedAnalytics(): {
        modelVersions: Record<string, string>;
        learningProgress: Record<string, number>;
        optimizationHistory: Record<string, RealTimeLearning[]>;
        performanceMetrics: Record<string, number>;
    } {
        const modelVersions: Record<string, string> = {};
        const learningProgress: Record<string, number> = {};
        const optimizationHistory: Record<string, RealTimeLearning[]> = {};
        const performanceMetrics: Record<string, number> = {};

        for (const model of this.predictiveModels) {
            modelVersions[model.name] = model.version;
            learningProgress[model.name] = model.accuracy;
            optimizationHistory[model.name] = this.realTimeLearning.filter(l => l.modelId === model.id);
            performanceMetrics[model.name] = model.confidence;
        }

        return {
            modelVersions,
            learningProgress,
            optimizationHistory,
            performanceMetrics
        };
    }
}

export {
    AI_PREDICTIVE_ANOMALIES_STORAGE_KEY,
    AI_PREDICTIVE_DECISIONS_STORAGE_KEY,
    AI_PREDICTIVE_INSIGHTS_STORAGE_KEY,
    AI_PREDICTIVE_PREDICTIONS_STORAGE_KEY,
    AI_PREDICTIVE_TRENDS_STORAGE_KEY,
} from './aiPredictiveAnalyticsStorageKeys';

const aiPredictiveAnalyticsService = new AIPredictiveAnalyticsService();
export default aiPredictiveAnalyticsService;
