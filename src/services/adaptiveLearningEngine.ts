import { Project, Chat, Message } from '../types/project';

export interface LearningPattern {
    id: string;
    pattern: string;
    frequency: number;
    impact: number;
    confidence: number;
    lastObserved: Date;
    category: 'user_behavior' | 'system_performance' | 'optimization_effect' | 'error_pattern';
}

export interface AdaptiveModel {
    id: string;
    name: string;
    version: string;
    accuracy: number;
    lastUpdated: Date;
    trainingDataSize: number;
    performanceMetrics: {
        precision: number;
        recall: number;
        f1Score: number;
        auc: number;
    };
    modelType: 'classification' | 'regression' | 'clustering' | 'recommendation';
}

export interface OptimizationResult {
    id: string;
    optimizationId: string;
    beforeMetrics: any;
    afterMetrics: any;
    improvement: number;
    userSatisfaction: number;
    learningInsights: string[];
    appliedAt: Date;
}

export interface PredictiveInsight {
    id: string;
    insight: string;
    confidence: number;
    timeframe: 'short_term' | 'medium_term' | 'long_term';
    category: 'performance' | 'user_behavior' | 'system_health' | 'resource_usage';
    recommendations: string[];
    dataPoints: number;
    lastUpdated: Date;
}

class AdaptiveLearningEngine {
    private learningPatterns: LearningPattern[] = [];
    private adaptiveModels: AdaptiveModel[] = [];
    private optimizationResults: OptimizationResult[] = [];
    private predictiveInsights: PredictiveInsight[] = [];
    private modelVersion = 1.0;

    constructor() {
        this.initializeDefaultModels();
        this.loadStoredData();
    }

    private initializeDefaultModels() {
        this.adaptiveModels = [
            {
                id: 'user-behavior-model',
                name: '사용자 행동 분석 모델',
                version: '1.0',
                accuracy: 0.85,
                lastUpdated: new Date(),
                trainingDataSize: 1000,
                performanceMetrics: {
                    precision: 0.82,
                    recall: 0.88,
                    f1Score: 0.85,
                    auc: 0.87
                },
                modelType: 'classification'
            },
            {
                id: 'performance-prediction-model',
                name: '성능 예측 모델',
                version: '1.0',
                accuracy: 0.78,
                lastUpdated: new Date(),
                trainingDataSize: 800,
                performanceMetrics: {
                    precision: 0.75,
                    recall: 0.81,
                    f1Score: 0.78,
                    auc: 0.80
                },
                modelType: 'regression'
            },
            {
                id: 'optimization-recommendation-model',
                name: '최적화 권장 모델',
                version: '1.0',
                accuracy: 0.92,
                lastUpdated: new Date(),
                trainingDataSize: 1200,
                performanceMetrics: {
                    precision: 0.90,
                    recall: 0.94,
                    f1Score: 0.92,
                    auc: 0.93
                },
                modelType: 'recommendation'
            }
        ];
    }

    private loadStoredData() {
        try {
            const storedPatterns = localStorage.getItem('adaptiveLearningPatterns');
            if (storedPatterns) {
                this.learningPatterns = JSON.parse(storedPatterns).map((p: any) => ({
                    ...p,
                    lastObserved: new Date(p.lastObserved)
                }));
            }

            const storedResults = localStorage.getItem('optimizationResults');
            if (storedResults) {
                this.optimizationResults = JSON.parse(storedResults).map((r: any) => ({
                    ...r,
                    appliedAt: new Date(r.appliedAt)
                }));
            }

            const storedInsights = localStorage.getItem('predictiveInsights');
            if (storedInsights) {
                this.predictiveInsights = JSON.parse(storedInsights).map((i: any) => ({
                    ...i,
                    lastUpdated: new Date(i.lastUpdated)
                }));
            }
        } catch (error) {
            console.error('적응형 학습 데이터 로드 중 오류:', error);
        }
    }

    private saveData() {
        try {
            localStorage.setItem('adaptiveLearningPatterns', JSON.stringify(this.learningPatterns));
            localStorage.setItem('optimizationResults', JSON.stringify(this.optimizationResults));
            localStorage.setItem('predictiveInsights', JSON.stringify(this.predictiveInsights));
        } catch (error) {
            console.error('적응형 학습 데이터 저장 중 오류:', error);
        }
    }

    // 사용자 행동 패턴 학습
    learnUserBehavior(projects: Project[], chats: Chat[], messages: Message[]): LearningPattern[] {
        const patterns: LearningPattern[] = [];

        // 프로젝트 생성 패턴 분석
        const projectCreationPattern = this.analyzeProjectCreationPattern(projects);
        if (projectCreationPattern) {
            patterns.push(projectCreationPattern);
        }

        // 채팅 활동 패턴 분석
        const chatActivityPattern = this.analyzeChatActivityPattern(chats, messages);
        if (chatActivityPattern) {
            patterns.push(chatActivityPattern);
        }

        // 메시지 작성 패턴 분석
        const messagePattern = this.analyzeMessagePattern(messages);
        if (messagePattern) {
            patterns.push(messagePattern);
        }

        // 기존 패턴과 병합 및 업데이트
        this.updateLearningPatterns(patterns);
        this.saveData();

        return this.learningPatterns;
    }

    private analyzeProjectCreationPattern(projects: Project[]): LearningPattern | null {
        if (projects.length < 3) return null;

        const recentProjects = projects
            .filter(p => new Date().getTime() - p.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000) // 30일 이내
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (recentProjects.length === 0) return null;

        const avgCreationTime = recentProjects.reduce((sum, p) => sum + p.createdAt.getTime(), 0) / recentProjects.length;
        const creationFrequency = recentProjects.length / 30; // 일평균 생성 수

        return {
            id: 'project-creation-pattern',
            pattern: `프로젝트 생성 패턴: 일평균 ${creationFrequency.toFixed(2)}개 생성`,
            frequency: creationFrequency,
            impact: 0.7,
            confidence: Math.min(0.9, recentProjects.length / 10),
            lastObserved: new Date(),
            category: 'user_behavior'
        };
    }

    private analyzeChatActivityPattern(chats: Chat[], messages: Message[]): LearningPattern | null {
        if (chats.length === 0) return null;

        const recentChats = chats
            .filter(c => new Date().getTime() - c.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000) // 7일 이내
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (recentChats.length === 0) return null;

        const avgMessagesPerChat = messages.length / chats.length;
        const activeChats = recentChats.filter(c => c.messages.length > 0).length;
        const activityRate = activeChats / recentChats.length;

        return {
            id: 'chat-activity-pattern',
            pattern: `채팅 활동 패턴: 채팅당 평균 ${avgMessagesPerChat.toFixed(1)}개 메시지, 활동률 ${(activityRate * 100).toFixed(1)}%`,
            frequency: activityRate,
            impact: 0.8,
            confidence: Math.min(0.85, recentChats.length / 20),
            lastObserved: new Date(),
            category: 'user_behavior'
        };
    }

    private analyzeMessagePattern(messages: Message[]): LearningPattern | null {
        if (messages.length < 10) return null;

        const recentMessages = messages
            .filter(m => {
                const timestamp = m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp);
                return new Date().getTime() - timestamp.getTime() < 24 * 60 * 60 * 1000; // 24시간 이내
            })
            .sort((a, b) => {
                const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                return timestampB.getTime() - timestampA.getTime();
            });

        if (recentMessages.length === 0) return null;

        const avgMessageLength = recentMessages.reduce((sum, m) => sum + m.content.length, 0) / recentMessages.length;
        const responseTime = this.calculateAverageResponseTime(recentMessages);

        return {
            id: 'message-pattern',
            pattern: `메시지 패턴: 평균 길이 ${avgMessageLength.toFixed(0)}자, 응답시간 ${responseTime.toFixed(1)}분`,
            frequency: recentMessages.length / 24, // 시간당 메시지 수
            impact: 0.6,
            confidence: Math.min(0.8, recentMessages.length / 50),
            lastObserved: new Date(),
            category: 'user_behavior'
        };
    }

    private calculateAverageResponseTime(messages: Message[]): number {
        let totalResponseTime = 0;
        let responseCount = 0;

        for (let i = 1; i < messages.length; i++) {
            const currentMessage = messages[i];
            const previousMessage = messages[i - 1];

            if (currentMessage.role === 'assistant' && previousMessage.role === 'user') {
                const currentTimestamp = currentMessage.timestamp instanceof Date ? currentMessage.timestamp : new Date(currentMessage.timestamp);
                const previousTimestamp = previousMessage.timestamp instanceof Date ? previousMessage.timestamp : new Date(previousMessage.timestamp);
                const responseTime = (currentTimestamp.getTime() - previousTimestamp.getTime()) / (1000 * 60); // 분 단위
                totalResponseTime += responseTime;
                responseCount++;
            }
        }

        return responseCount > 0 ? totalResponseTime / responseCount : 0;
    }

    private updateLearningPatterns(newPatterns: LearningPattern[]) {
        newPatterns.forEach(newPattern => {
            const existingIndex = this.learningPatterns.findIndex(p => p.id === newPattern.id);

            if (existingIndex >= 0) {
                // 기존 패턴 업데이트
                const existing = this.learningPatterns[existingIndex];
                this.learningPatterns[existingIndex] = {
                    ...newPattern,
                    frequency: (existing.frequency + newPattern.frequency) / 2,
                    confidence: Math.min(0.95, existing.confidence + 0.1),
                    lastObserved: new Date()
                };
            } else {
                // 새 패턴 추가
                this.learningPatterns.push(newPattern);
            }
        });
    }

    // 최적화 결과 학습
    learnFromOptimizationResult(result: OptimizationResult): void {
        this.optimizationResults.push(result);

        // 모델 성능 업데이트
        this.updateModelPerformance(result);

        // 새로운 인사이트 생성
        this.generatePredictiveInsights();

        this.saveData();
    }

    private updateModelPerformance(result: OptimizationResult): void {
        const model = this.adaptiveModels.find(m => m.id === 'optimization-recommendation-model');
        if (model && result.improvement > 0) {
            // 성공적인 최적화로 모델 정확도 향상
            model.accuracy = Math.min(0.98, model.accuracy + 0.01);
            model.performanceMetrics.precision = Math.min(0.95, model.performanceMetrics.precision + 0.005);
            model.performanceMetrics.recall = Math.min(0.95, model.performanceMetrics.recall + 0.005);
            model.performanceMetrics.f1Score = Math.min(0.95, model.performanceMetrics.f1Score + 0.005);
            model.lastUpdated = new Date();
            model.trainingDataSize += 1;
        }
    }

    // 예측 인사이트 생성
    generatePredictiveInsights(): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];

        // 사용자 행동 기반 예측
        const userBehaviorInsight = this.generateUserBehaviorInsight();
        if (userBehaviorInsight) {
            insights.push(userBehaviorInsight);
        }

        // 시스템 성능 기반 예측
        const performanceInsight = this.generatePerformanceInsight();
        if (performanceInsight) {
            insights.push(performanceInsight);
        }

        // 리소스 사용량 기반 예측
        const resourceInsight = this.generateResourceInsight();
        if (resourceInsight) {
            insights.push(resourceInsight);
        }

        // 기존 인사이트와 병합
        this.updatePredictiveInsights(insights);
        this.saveData();

        return this.predictiveInsights;
    }

    private generateUserBehaviorInsight(): PredictiveInsight | null {
        const userPatterns = this.learningPatterns.filter(p => p.category === 'user_behavior');
        if (userPatterns.length === 0) return null;

        const avgFrequency = userPatterns.reduce((sum, p) => sum + p.frequency, 0) / userPatterns.length;
        const trend = avgFrequency > 0.5 ? '증가' : '감소';

        return {
            id: `user-behavior-${Date.now()}`,
            insight: `사용자 활동이 ${trend} 추세를 보이고 있습니다. ${trend === '증가' ? '시스템 리소스를 미리 확보' : '리소스 최적화'}를 권장합니다.`,
            confidence: 0.75,
            timeframe: 'short_term',
            category: 'user_behavior',
            recommendations: [
                trend === '증가' ? '서버 리소스 사전 확장' : '불필요한 리소스 정리',
                '사용자 경험 최적화',
                '성능 모니터링 강화'
            ],
            dataPoints: userPatterns.length,
            lastUpdated: new Date()
        };
    }

    private generatePerformanceInsight(): PredictiveInsight | null {
        const recentResults = this.optimizationResults
            .filter(r => new Date().getTime() - r.appliedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
            .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());

        if (recentResults.length === 0) return null;

        const avgImprovement = recentResults.reduce((sum, r) => sum + r.improvement, 0) / recentResults.length;
        const trend = avgImprovement > 0.1 ? '개선' : '저하';

        return {
            id: `performance-${Date.now()}`,
            insight: `시스템 성능이 ${trend} 추세를 보이고 있습니다. 최근 최적화의 평균 개선도는 ${(avgImprovement * 100).toFixed(1)}%입니다.`,
            confidence: 0.8,
            timeframe: 'medium_term',
            category: 'performance',
            recommendations: [
                '성능 병목 지점 분석',
                '최적화 전략 재검토',
                '시스템 아키텍처 개선'
            ],
            dataPoints: recentResults.length,
            lastUpdated: new Date()
        };
    }

    private generateResourceInsight(): PredictiveInsight | null {
        const resourcePatterns = this.learningPatterns.filter(p => p.category === 'system_performance');
        if (resourcePatterns.length === 0) return null;

        const avgImpact = resourcePatterns.reduce((sum, p) => sum + p.impact, 0) / resourcePatterns.length;
        const riskLevel = avgImpact > 0.7 ? '높음' : avgImpact > 0.4 ? '보통' : '낮음';

        return {
            id: `resource-${Date.now()}`,
            insight: `리소스 사용량이 ${riskLevel} 수준입니다. 시스템 안정성을 위해 리소스 모니터링을 강화하는 것을 권장합니다.`,
            confidence: 0.7,
            timeframe: 'short_term',
            category: 'resource_usage',
            recommendations: [
                '리소스 사용량 실시간 모니터링',
                '자동 스케일링 설정',
                '백업 시스템 준비'
            ],
            dataPoints: resourcePatterns.length,
            lastUpdated: new Date()
        };
    }

    private updatePredictiveInsights(newInsights: PredictiveInsight[]) {
        newInsights.forEach(newInsight => {
            const existingIndex = this.predictiveInsights.findIndex(i => i.id === newInsight.id);

            if (existingIndex >= 0) {
                // 기존 인사이트 업데이트
                this.predictiveInsights[existingIndex] = {
                    ...newInsight,
                    confidence: Math.min(0.95, this.predictiveInsights[existingIndex].confidence + 0.05),
                    lastUpdated: new Date()
                };
            } else {
                // 새 인사이트 추가
                this.predictiveInsights.push(newInsight);
            }
        });

        // 오래된 인사이트 제거 (30일 이상)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        this.predictiveInsights = this.predictiveInsights.filter(
            insight => insight.lastUpdated > thirtyDaysAgo
        );
    }

    // 모델 재훈련
    retrainModels(): AdaptiveModel[] {
        this.adaptiveModels.forEach(model => {
            // 모델 버전 업데이트
            model.version = (parseFloat(model.version) + 0.1).toFixed(1);
            model.lastUpdated = new Date();

            // 성능 메트릭 개선 (시뮬레이션)
            const improvement = Math.random() * 0.05; // 0-5% 개선
            model.accuracy = Math.min(0.98, model.accuracy + improvement);
            model.performanceMetrics.precision = Math.min(0.95, model.performanceMetrics.precision + improvement);
            model.performanceMetrics.recall = Math.min(0.95, model.performanceMetrics.recall + improvement);
            model.performanceMetrics.f1Score = Math.min(0.95, model.performanceMetrics.f1Score + improvement);
        });

        this.modelVersion += 0.1;
        this.saveData();

        return this.adaptiveModels;
    }

    // 학습 데이터 분석 리포트
    generateLearningReport(): any {
        const totalPatterns = this.learningPatterns.length;
        const totalOptimizations = this.optimizationResults.length;
        const totalInsights = this.predictiveInsights.length;
        const avgModelAccuracy = this.adaptiveModels.reduce((sum, m) => sum + m.accuracy, 0) / this.adaptiveModels.length;

        const categoryBreakdown = this.learningPatterns.reduce((acc, pattern) => {
            acc[pattern.category] = (acc[pattern.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const recentOptimizations = this.optimizationResults
            .filter(r => new Date().getTime() - r.appliedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
            .length;

        const avgImprovement = this.optimizationResults.length > 0
            ? this.optimizationResults.reduce((sum, r) => sum + r.improvement, 0) / this.optimizationResults.length
            : 0;

        return {
            summary: {
                totalPatterns,
                totalOptimizations,
                totalInsights,
                avgModelAccuracy: Math.round(avgModelAccuracy * 100) / 100,
                modelVersion: this.modelVersion.toFixed(1),
                lastUpdated: new Date()
            },
            categoryBreakdown,
            recentActivity: {
                recentOptimizations,
                avgImprovement: Math.round(avgImprovement * 100) / 100,
                activeModels: this.adaptiveModels.length
            },
            recommendations: this.generateLearningRecommendations()
        };
    }

    private generateLearningRecommendations(): string[] {
        const recommendations: string[] = [];

        if (this.learningPatterns.length < 10) {
            recommendations.push('더 많은 학습 데이터를 수집하여 모델 정확도를 향상시키세요.');
        }

        if (this.optimizationResults.length < 5) {
            recommendations.push('최적화 결과를 더 많이 수집하여 예측 모델을 개선하세요.');
        }

        const lowConfidencePatterns = this.learningPatterns.filter(p => p.confidence < 0.5);
        if (lowConfidencePatterns.length > 0) {
            recommendations.push('신뢰도가 낮은 패턴들을 재분석하여 정확도를 향상시키세요.');
        }

        const oldModels = this.adaptiveModels.filter(m =>
            new Date().getTime() - m.lastUpdated.getTime() > 7 * 24 * 60 * 60 * 1000
        );
        if (oldModels.length > 0) {
            recommendations.push('오래된 모델들을 재훈련하여 최신 데이터에 맞게 업데이트하세요.');
        }

        return recommendations;
    }

    // 공개 메서드들
    getLearningPatterns(): LearningPattern[] {
        return this.learningPatterns;
    }

    getAdaptiveModels(): AdaptiveModel[] {
        return this.adaptiveModels;
    }

    getOptimizationResults(): OptimizationResult[] {
        return this.optimizationResults;
    }

    getPredictiveInsights(): PredictiveInsight[] {
        return this.predictiveInsights;
    }

    getModelVersion(): number {
        return this.modelVersion;
    }
}

const adaptiveLearningEngine = new AdaptiveLearningEngine();
export default adaptiveLearningEngine;
