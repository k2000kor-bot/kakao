import { Project, Chat, Message } from '../types/project';
import { errorLogger, toError } from '../utils/errorLogger';
import { ADAPTIVE_LEARNING_STORAGE_KEYS } from './adaptiveLearningStorageKeys';

function safeLabelForLog(value: unknown): string {
    try {
        return String(value);
    } catch {
        return '[unstringifiable]';
    }
}

/** 응답 시간 계산용: 오래된 메시지가 앞에 오도록 정렬 (동일 시각은 입력 순서 유지) */
function compareMessagesByTimestampAsc(a: Message, b: Message): number {
    try {
        const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        const tA = timestampA.getTime();
        const tB = timestampB.getTime();
        if (Number.isNaN(tA) || Number.isNaN(tB)) {
            return 0;
        }
        return tA - tB;
    } catch {
        return 0;
    }
}

/** message-pattern: 원본 입력·24시간 필터 후 각각 이 개수 미만이면 분석하지 않음 */
const MIN_MESSAGES_FOR_MESSAGE_PATTERN = 10;

/** message-pattern: 최근 메시지로 인정하는 시간 창(밀리초) */
const MESSAGE_PATTERN_RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

const MESSAGE_PATTERN_WINDOW_HOURS = MESSAGE_PATTERN_RECENT_WINDOW_MS / (60 * 60 * 1000);

const MESSAGE_PATTERN_IMPACT = 0.6;
const MESSAGE_PATTERN_CONFIDENCE_CAP = 0.8;
/** confidence = min(cap, recentCount / 이 값) */
const MESSAGE_PATTERN_CONFIDENCE_SAMPLE_TARGET = 50;

/** message-pattern 지표(테스트·외부 검증과 엔진 수치 단일 출처 동기화용) */
export const MESSAGE_PATTERN_METRICS = {
    minMessages: MIN_MESSAGES_FOR_MESSAGE_PATTERN,
    recentWindowMs: MESSAGE_PATTERN_RECENT_WINDOW_MS,
    windowHours: MESSAGE_PATTERN_WINDOW_HOURS,
    impact: MESSAGE_PATTERN_IMPACT,
    confidenceCap: MESSAGE_PATTERN_CONFIDENCE_CAP,
    confidenceSampleTarget: MESSAGE_PATTERN_CONFIDENCE_SAMPLE_TARGET,
} as const;

/** project-creation-pattern: 분석에 필요한 최소 프로젝트 수 */
const MIN_PROJECTS_FOR_CREATION_PATTERN = 3;
/** project-creation-pattern: 최근으로 볼 시간 창 */
const PROJECT_CREATION_RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
/** project-creation-pattern: 일평균 생성 수(frequency) 분모 일수 */
const PROJECT_CREATION_FREQUENCY_WINDOW_DAYS = 30;
const PROJECT_CREATION_IMPACT = 0.7;
const PROJECT_CREATION_CONFIDENCE_CAP = 0.9;
/** confidence = min(cap, recentCount / 이 값) */
const PROJECT_CREATION_CONFIDENCE_SAMPLE_TARGET = 10;

/** project-creation-pattern 지표(테스트·외부 검증용) */
export const PROJECT_CREATION_PATTERN_METRICS = {
    minProjects: MIN_PROJECTS_FOR_CREATION_PATTERN,
    recentWindowMs: PROJECT_CREATION_RECENT_WINDOW_MS,
    frequencyWindowDays: PROJECT_CREATION_FREQUENCY_WINDOW_DAYS,
    impact: PROJECT_CREATION_IMPACT,
    confidenceCap: PROJECT_CREATION_CONFIDENCE_CAP,
    confidenceSampleTarget: PROJECT_CREATION_CONFIDENCE_SAMPLE_TARGET,
} as const;

/** chat-activity-pattern: 최근 대화로 볼 시간 창 */
const CHAT_ACTIVITY_RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const CHAT_ACTIVITY_IMPACT = 0.8;
const CHAT_ACTIVITY_CONFIDENCE_CAP = 0.85;
/** confidence = min(cap, recentChats / 이 값) */
const CHAT_ACTIVITY_CONFIDENCE_SAMPLE_TARGET = 20;

/** chat-activity-pattern 지표(테스트·외부 검증용) */
export const CHAT_ACTIVITY_PATTERN_METRICS = {
    recentWindowMs: CHAT_ACTIVITY_RECENT_WINDOW_MS,
    impact: CHAT_ACTIVITY_IMPACT,
    confidenceCap: CHAT_ACTIVITY_CONFIDENCE_CAP,
    confidenceSampleTarget: CHAT_ACTIVITY_CONFIDENCE_SAMPLE_TARGET,
} as const;

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
    beforeMetrics: Record<string, unknown>;
    afterMetrics: Record<string, unknown>;
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

export { ADAPTIVE_LEARNING_STORAGE_KEYS } from './adaptiveLearningStorageKeys';

/** persist 백엔드 — 테스트에서 setItem/getItem mock 주입용 */
export type AdaptiveLearningEngineStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface AdaptiveLearningEngineOptions {
    storage?: AdaptiveLearningEngineStorage;
}

export class AdaptiveLearningEngine {
    private readonly storage: AdaptiveLearningEngineStorage;
    private learningPatterns: LearningPattern[] = [];
    private adaptiveModels: AdaptiveModel[] = [];
    private optimizationResults: OptimizationResult[] = [];
    private predictiveInsights: PredictiveInsight[] = [];
    private modelVersion = 1.0;

    constructor(options?: AdaptiveLearningEngineOptions) {
        this.storage = options?.storage ?? localStorage;
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
            const storedPatterns = this.storage.getItem(ADAPTIVE_LEARNING_STORAGE_KEYS.patterns);
            if (storedPatterns) {
                const parsed = JSON.parse(storedPatterns) as unknown;
                if (Array.isArray(parsed)) {
                    this.learningPatterns = parsed.map((p: Record<string, unknown>) => ({
                        ...p,
                        lastObserved: new Date(p.lastObserved as string | number | Date)
                    })) as LearningPattern[];
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('적응형 학습 데이터 로드 중 오류 (adaptiveLearningPatterns)', err, {
                component: 'adaptiveLearningEngine',
                action: 'loadData:adaptiveLearningPatterns',
            });
        }

        try {
            const storedResults = this.storage.getItem(ADAPTIVE_LEARNING_STORAGE_KEYS.optimizationResults);
            if (storedResults) {
                const parsed = JSON.parse(storedResults) as unknown;
                if (Array.isArray(parsed)) {
                    this.optimizationResults = parsed.map((r: Record<string, unknown>) => ({
                        ...r,
                        appliedAt: new Date(r.appliedAt as string | number | Date)
                    })) as OptimizationResult[];
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('적응형 학습 데이터 로드 중 오류 (optimizationResults)', err, {
                component: 'adaptiveLearningEngine',
                action: 'loadData:optimizationResults',
            });
        }

        try {
            const storedInsights = this.storage.getItem(ADAPTIVE_LEARNING_STORAGE_KEYS.predictiveInsights);
            if (storedInsights) {
                const parsed = JSON.parse(storedInsights) as unknown;
                if (Array.isArray(parsed)) {
                    this.predictiveInsights = parsed.map((i: Record<string, unknown>) => ({
                        ...i,
                        lastUpdated: new Date(i.lastUpdated as string | number | Date)
                    })) as PredictiveInsight[];
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('적응형 학습 데이터 로드 중 오류 (predictiveInsights)', err, {
                component: 'adaptiveLearningEngine',
                action: 'loadData:predictiveInsights',
            });
        }
    }

    private saveData() {
        try {
            this.storage.setItem(ADAPTIVE_LEARNING_STORAGE_KEYS.patterns, JSON.stringify(this.learningPatterns));
            this.storage.setItem(ADAPTIVE_LEARNING_STORAGE_KEYS.optimizationResults, JSON.stringify(this.optimizationResults));
            this.storage.setItem(ADAPTIVE_LEARNING_STORAGE_KEYS.predictiveInsights, JSON.stringify(this.predictiveInsights));
        } catch (error) {
            const err = toError(error);
            errorLogger.error('적응형 학습 데이터 저장 중 오류', err, {
                component: 'adaptiveLearningEngine',
                action: 'saveData',
            });
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

        // 대화 활동 패턴 분석
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
        if (projects.length < MIN_PROJECTS_FOR_CREATION_PATTERN) return null;

        const recentProjects = projects
            .filter(p => {
                try {
                    return p.createdAt && p.createdAt.getTime && new Date().getTime() - p.createdAt.getTime() < PROJECT_CREATION_RECENT_WINDOW_MS;
                } catch (error) {
                    errorLogger.warn('Invalid createdAt in project', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeProjectCreationPattern',
                        createdAt: safeLabelForLog(p.createdAt),
                        projectId: p.id,
                    });
                    return false;
                }
            })
            .sort((a, b) => {
                try {
                    return a.createdAt && a.createdAt.getTime && b.createdAt && b.createdAt.getTime ?
                        b.createdAt.getTime() - a.createdAt.getTime() : 0;
                } catch (error) {
                    errorLogger.warn('Invalid createdAt in sort', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeProjectCreationPattern',
                        createdAtA: safeLabelForLog(a.createdAt),
                        createdAtB: safeLabelForLog(b.createdAt),
                    });
                    return 0;
                }
            });

        if (recentProjects.length === 0) return null;

        const _avgCreationTime = recentProjects.reduce((sum, p) => {
            try {
                return sum + (p.createdAt && p.createdAt.getTime ? p.createdAt.getTime() : 0);
            } catch (error) {
                errorLogger.warn('Invalid createdAt in reduce', {
                    component: 'adaptiveLearningEngine',
                    action: 'analyzeProjectCreationPattern',
                    createdAt: safeLabelForLog(p.createdAt),
                    projectId: p.id,
                });
                return sum;
            }
        }, 0) / recentProjects.length;
        void _avgCreationTime;
        const creationFrequency = recentProjects.length / PROJECT_CREATION_FREQUENCY_WINDOW_DAYS;

        return {
            id: 'project-creation-pattern',
            pattern: `프로젝트 생성 패턴: 일평균 ${creationFrequency.toFixed(2)}개 생성`,
            frequency: creationFrequency,
            impact: PROJECT_CREATION_IMPACT,
            confidence: Math.min(
                PROJECT_CREATION_CONFIDENCE_CAP,
                recentProjects.length / PROJECT_CREATION_CONFIDENCE_SAMPLE_TARGET,
            ),
            lastObserved: new Date(),
            category: 'user_behavior'
        };
    }

    private analyzeChatActivityPattern(chats: Chat[], messages: Message[]): LearningPattern | null {
        if (chats.length === 0) return null;

        const recentChats = chats
            .filter(c => {
                try {
                    return c.createdAt && c.createdAt.getTime && new Date().getTime() - c.createdAt.getTime() < CHAT_ACTIVITY_RECENT_WINDOW_MS;
                } catch (error) {
                    errorLogger.warn('Invalid createdAt in chat', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeChatActivityPattern',
                        createdAt: safeLabelForLog(c.createdAt),
                        chatId: c.id,
                    });
                    return false;
                }
            })
            .sort((a, b) => {
                try {
                    return a.createdAt && a.createdAt.getTime && b.createdAt && b.createdAt.getTime ?
                        b.createdAt.getTime() - a.createdAt.getTime() : 0;
                } catch (error) {
                    errorLogger.warn('Invalid createdAt in chat sort', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeChatActivityPattern',
                        createdAtA: safeLabelForLog(a.createdAt),
                        createdAtB: safeLabelForLog(b.createdAt),
                    });
                    return 0;
                }
            });

        if (recentChats.length === 0) return null;

        const avgMessagesPerChat = messages.length / chats.length;
        const activeChats = recentChats.filter(c => c.messages.length > 0).length;
        const activityRate = activeChats / recentChats.length;

        return {
            id: 'chat-activity-pattern',
            pattern: `대화 활동 패턴: 대화당 평균 ${avgMessagesPerChat.toFixed(1)}개 메시지, 활동률 ${(activityRate * 100).toFixed(1)}%`,
            frequency: activityRate,
            impact: CHAT_ACTIVITY_IMPACT,
            confidence: Math.min(
                CHAT_ACTIVITY_CONFIDENCE_CAP,
                recentChats.length / CHAT_ACTIVITY_CONFIDENCE_SAMPLE_TARGET,
            ),
            lastObserved: new Date(),
            category: 'user_behavior'
        };
    }

    private analyzeMessagePattern(messages: Message[]): LearningPattern | null {
        if (messages.length < MIN_MESSAGES_FOR_MESSAGE_PATTERN) return null;

        const nowMs = Date.now();
        const recentMessages = messages
            .filter(m => {
                try {
                    const timestamp = m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp);
                    const tsMs = timestamp.getTime();
                    if (Number.isNaN(tsMs)) {
                        return false;
                    }
                    return nowMs - tsMs < MESSAGE_PATTERN_RECENT_WINDOW_MS;
                } catch (error) {
                    errorLogger.warn('Invalid timestamp in message', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeMessagePattern',
                        timestamp: safeLabelForLog(m.timestamp),
                        messageId: m.id,
                    });
                    return false;
                }
            })
            .sort((a, b) => {
                try {
                    const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
                    const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
                    return timestampB && timestampB.getTime && timestampA && timestampA.getTime ?
                        timestampB.getTime() - timestampA.getTime() : 0;
                } catch (error) {
                    errorLogger.warn('Invalid timestamp in sort', {
                        component: 'adaptiveLearningEngine',
                        action: 'analyzeMessagePattern',
                        timestampA: safeLabelForLog(a.timestamp),
                        timestampB: safeLabelForLog(b.timestamp),
                    });
                    return 0;
                }
            });

        if (recentMessages.length < MIN_MESSAGES_FOR_MESSAGE_PATTERN) return null;

        const avgMessageLength = recentMessages.reduce((sum, m) => sum + m.content.length, 0) / recentMessages.length;
        const chronologicalForResponse = [...recentMessages].sort(compareMessagesByTimestampAsc);
        const responseTime = this.calculateAverageResponseTime(chronologicalForResponse);

        return {
            id: 'message-pattern',
            pattern: `메시지 패턴: 평균 길이 ${avgMessageLength.toFixed(0)}자, 응답시간 ${responseTime.toFixed(1)}분`,
            frequency: recentMessages.length / MESSAGE_PATTERN_WINDOW_HOURS, // 시간당 메시지 수
            impact: MESSAGE_PATTERN_IMPACT,
            confidence: Math.min(
                MESSAGE_PATTERN_CONFIDENCE_CAP,
                recentMessages.length / MESSAGE_PATTERN_CONFIDENCE_SAMPLE_TARGET,
            ),
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
                try {
                    const currentTimestamp =
                        currentMessage.timestamp instanceof Date ? currentMessage.timestamp : new Date(currentMessage.timestamp);
                    const previousTimestamp =
                        previousMessage.timestamp instanceof Date ? previousMessage.timestamp : new Date(previousMessage.timestamp);
                    const t0 = currentTimestamp.getTime();
                    const t1 = previousTimestamp.getTime();
                    if (Number.isNaN(t0) || Number.isNaN(t1)) {
                        errorLogger.warn('Invalid timestamp in responseTime pair', {
                            component: 'adaptiveLearningEngine',
                            action: 'calculateAverageResponseTime',
                            messageIdUser: previousMessage.id,
                            messageIdAssistant: currentMessage.id,
                            timestampUser: safeLabelForLog(previousMessage.timestamp),
                            timestampAssistant: safeLabelForLog(currentMessage.timestamp),
                        });
                        continue;
                    }
                    if (t0 < t1) {
                        errorLogger.warn('Invalid timestamp in responseTime pair', {
                            component: 'adaptiveLearningEngine',
                            action: 'calculateAverageResponseTime',
                            messageIdUser: previousMessage.id,
                            messageIdAssistant: currentMessage.id,
                            timestampUser: safeLabelForLog(previousMessage.timestamp),
                            timestampAssistant: safeLabelForLog(currentMessage.timestamp),
                            reason: 'assistantTimestampBeforeUser',
                        });
                        continue;
                    }
                    totalResponseTime += (t0 - t1) / (1000 * 60); // 분 단위
                    responseCount++;
                } catch {
                    errorLogger.warn('Invalid timestamp in responseTime pair', {
                        component: 'adaptiveLearningEngine',
                        action: 'calculateAverageResponseTime',
                        messageIdUser: previousMessage.id,
                        messageIdAssistant: currentMessage.id,
                        timestampUser: safeLabelForLog(previousMessage.timestamp),
                        timestampAssistant: safeLabelForLog(currentMessage.timestamp),
                    });
                }
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
    generateLearningReport(): Record<string, unknown> {
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
