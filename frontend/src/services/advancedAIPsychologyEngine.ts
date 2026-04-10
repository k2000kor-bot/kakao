import { EventEmitter } from 'events';
import { errorLogger } from '../utils/errorLogger';

/** Interaction/analysis payload from callers */
type InteractionData = Record<string, unknown>;

interface TextEmotionResult {
    primary: EmotionalState['primary_emotion'];
    secondary: string[];
    intensity: number;
    valence: number;
    arousal: number;
    confidence: number;
}

interface InteractionEmotionResult {
    primary: EmotionalState['primary_emotion'];
    intensity: number;
}

export interface UserPsychologyData {
    emotional_state?: EmotionalState;
    cognitive_load?: CognitiveLoad;
    learning_motivation?: LearningMotivation;
    stress_level?: StressLevel;
    personality_insights?: PersonalityInsights;
}

export interface PsychologyStatistics {
    total_users: number;
    total_recommendations: number;
    average_emotional_intensity: number;
    average_cognitive_load: number;
    average_motivation_level: number;
    high_stress_users: number;
}

// 인터페이스 정의
export interface EmotionalState {
    user_id: string;
    session_id: string;
    primary_emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
    secondary_emotions: string[];
    intensity: number; // 0-10
    valence: number; // -5 to +5 (negative to positive)
    arousal: number; // 0-10 (calm to excited)
    confidence: number; // 0-1
    triggers: string[];
    duration: number; // seconds
    last_updated: Date;
}

export interface CognitiveLoad {
    user_id: string;
    session_id: string;
    overall_load: number; // 0-10
    components: {
        intrinsic_load: number; // 작업의 복잡성
        extraneous_load: number; // 불필요한 정보
        germane_load: number; // 학습에 도움이 되는 정보
    };
    indicators: {
        response_time_variability: number;
        error_frequency: number;
        repetition_requests: number;
        topic_switching: number;
        frustration_signals: number;
    };
    recommendations: string[];
    last_updated: Date;
}

export interface LearningMotivation {
    user_id: string;
    session_id: string;
    motivation_type: 'intrinsic' | 'extrinsic' | 'mixed';
    motivation_level: number; // 0-10
    factors: {
        curiosity: number;
        mastery_goal: number;
        performance_goal: number;
        social_recognition: number;
        external_rewards: number;
        self_efficacy: number;
    };
    barriers: string[];
    enhancers: string[];
    trend: 'increasing' | 'stable' | 'decreasing';
    last_updated: Date;
}

export interface StressLevel {
    user_id: string;
    session_id: string;
    stress_level: number; // 0-10
    stress_type: 'eustress' | 'distress' | 'none';
    indicators: {
        rapid_typing: boolean;
        short_responses: boolean;
        topic_avoidance: boolean;
        repeated_questions: boolean;
        negative_language: boolean;
        time_pressure: boolean;
    };
    coping_strategies: string[];
    intervention_needed: boolean;
    last_updated: Date;
}

export interface PersonalityInsights {
    user_id: string;
    session_id: string;
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    communication_preference: 'direct' | 'detailed' | 'conversational' | 'technical';
    decision_making_style: 'analytical' | 'intuitive' | 'collaborative' | 'systematic';
    risk_tolerance: 'low' | 'medium' | 'high';
    confidence_level: number; // 0-10
    adaptability: number; // 0-10
    persistence: number; // 0-10
    last_updated: Date;
}

export interface AIPsychologyRecommendation {
    recommendation_id: string;
    user_id: string;
    category: 'emotional_support' | 'cognitive_optimization' | 'motivation_enhancement' | 'stress_management' | 'personality_adaptation';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action_items: string[];
    expected_impact: {
        emotional_wellbeing: number;
        learning_effectiveness: number;
        engagement: number;
        satisfaction: number;
    };
    implementation_strategy: string;
    generated_at: Date;
}

// 고급 AI 심리학 분석 엔진 클래스
class AdvancedAIPsychologyEngine extends EventEmitter {
    private emotionalStates: Map<string, EmotionalState> = new Map();
    private cognitiveLoads: Map<string, CognitiveLoad> = new Map();
    private learningMotivations: Map<string, LearningMotivation> = new Map();
    private stressLevels: Map<string, StressLevel> = new Map();
    private personalityInsights: Map<string, PersonalityInsights> = new Map();
    private recommendations: AIPsychologyRecommendation[] = [];
    private analysisInterval: NodeJS.Timeout | null = null;
    private isAnalyzing: boolean = false;

    constructor() {
        super();
        this.startAnalysis();
    }

    // 분석 시작
    public startAnalysis(): void {
        if (this.isAnalyzing) return;

        this.isAnalyzing = true;
        this.analysisInterval = setInterval(() => {
            this.performPsychologicalAnalysis();
        }, 30000); // 30초마다 분석

        errorLogger.info('🧠 고급 AI 심리학 분석이 시작되었습니다', {
            component: 'advancedAIPsychologyEngine',
            action: 'startAnalysis',
        });
    }

    // 분석 중지
    public stopAnalysis(): void {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        this.isAnalyzing = false;
        errorLogger.info('⏹️ AI 심리학 분석이 중지되었습니다', {
            component: 'advancedAIPsychologyEngine',
            action: 'stopAnalysis',
        });
    }

    // 감정 상태 분석
    public analyzeEmotionalState(userId: string, sessionId: string, interactionData: InteractionData): EmotionalState {
        const key = `${userId}-${sessionId}`;

        let emotionalState = this.emotionalStates.get(key) || {
            user_id: userId,
            session_id: sessionId,
            primary_emotion: 'neutral',
            secondary_emotions: [],
            intensity: 5,
            valence: 0,
            arousal: 5,
            confidence: 0.5,
            triggers: [],
            duration: 0,
            last_updated: new Date()
        };

        // 새로운 데이터로 감정 상태 업데이트
        emotionalState = this.updateEmotionalState(emotionalState, interactionData);

        this.emotionalStates.set(key, emotionalState);
        this.emit('emotional_state_updated', emotionalState);

        return emotionalState;
    }

    // 감정 상태 업데이트
    private updateEmotionalState(state: EmotionalState, data: InteractionData): EmotionalState {
        const d = data as Record<string, unknown>;
        // 텍스트 분석을 통한 감정 감지
        if (typeof d.text === 'string') {
            const emotionAnalysis = this.analyzeTextEmotion(d.text);
            state.primary_emotion = emotionAnalysis.primary;
            state.secondary_emotions = emotionAnalysis.secondary;
            state.intensity = emotionAnalysis.intensity;
            state.valence = emotionAnalysis.valence;
            state.arousal = emotionAnalysis.arousal;
            state.confidence = emotionAnalysis.confidence;
        }

        // 상호작용 패턴 분석
        if (d.interaction_patterns && typeof d.interaction_patterns === 'object') {
            const patternEmotion = this.analyzeInteractionEmotion(d.interaction_patterns as Record<string, unknown>);
            state.primary_emotion = patternEmotion.primary;
            state.intensity = Math.max(state.intensity, patternEmotion.intensity);
        }

        // 트리거 식별
        state.triggers = this.identifyEmotionalTriggers(data);

        // 지속 시간 업데이트
        state.duration = this.calculateEmotionDuration(state, data);

        state.last_updated = new Date();
        return state;
    }

    // 텍스트 감정 분석
    private analyzeTextEmotion(text: string): TextEmotionResult {
        const lowerText = text.toLowerCase();
        let primary: EmotionalState['primary_emotion'] = 'neutral';
        let secondary: string[] = [];
        let intensity = 5;
        let valence = 0;
        let arousal = 5;
        let confidence = 0.5;

        // 긍정적 감정 키워드
        const positiveWords = ['좋아', '감사', '행복', '즐거워', '재미있어', '훌륭해', '완벽해', '성공', '이해됐어'];
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;

        // 부정적 감정 키워드
        const negativeWords = ['싫어', '화나', '짜증', '힘들어', '어려워', '실패', '실망', '답답해', '지겨워'];
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        // 질문 패턴
        const questionPattern = /\?/g;
        const questionCount = (text.match(questionPattern) || []).length;

        // 감탄사 패턴
        const exclamationPattern = /!/g;
        const exclamationCount = (text.match(exclamationPattern) || []).length;

        // 감정 분류
        if (positiveCount > negativeCount) {
            primary = 'joy';
            valence = Math.min(5, positiveCount * 0.5);
            arousal = Math.min(10, 5 + positiveCount * 0.3);
            intensity = Math.min(10, 5 + positiveCount * 0.4);
        } else if (negativeCount > positiveCount) {
            primary = 'sadness';
            if (lowerText.includes('화나') || lowerText.includes('짜증')) {
                primary = 'anger';
            }
            valence = Math.max(-5, -negativeCount * 0.5);
            arousal = Math.min(10, 5 + negativeCount * 0.3);
            intensity = Math.min(10, 5 + negativeCount * 0.4);
        } else if (questionCount > 2) {
            primary = 'surprise';
            arousal = Math.min(10, 5 + questionCount * 0.2);
            intensity = Math.min(10, 5 + questionCount * 0.3);
        }

        // 신뢰도 계산
        confidence = Math.min(1, (positiveCount + negativeCount + questionCount + exclamationCount) * 0.1);

        return { primary, secondary, intensity, valence, arousal, confidence };
    }

    // 상호작용 패턴 감정 분석
    private analyzeInteractionEmotion(patterns: Record<string, unknown>): InteractionEmotionResult {
        let primary: EmotionalState['primary_emotion'] = 'neutral';
        let intensity = 5;
        const p = patterns as Record<string, unknown>;
        if (p.rapid_responses) {
            primary = 'fear';
            intensity = 8;
        } else if (p.repeated_questions) {
            primary = 'fear';
            intensity = 7;
        } else if (p.short_responses) {
            primary = 'anger';
            intensity = 6;
        } else if (p.long_detailed_responses) {
            primary = 'joy';
            intensity = 6;
        }

        return { primary, intensity };
    }

    // 감정 트리거 식별
    private identifyEmotionalTriggers(data: InteractionData): string[] {
        const triggers: string[] = [];
        const d = data as Record<string, unknown>;
        if (d.complex_topics) triggers.push('복잡한 주제');
        if (d.technical_errors) triggers.push('기술적 오류');
        if (d.slow_responses) triggers.push('느린 응답');
        if (d.unclear_explanations) triggers.push('불명확한 설명');
        if (d.learning_progress) triggers.push('학습 진전');
        if (d.successful_completion) triggers.push('성공적 완료');

        return triggers;
    }

    // 감정 지속 시간 계산
    private calculateEmotionDuration(state: EmotionalState, _data: InteractionData): number {
        const timeSinceLastUpdate = Date.now() - state.last_updated.getTime();
        return state.duration + (timeSinceLastUpdate / 1000);
    }

    // 인지 부하 분석
    public analyzeCognitiveLoad(userId: string, sessionId: string, interactionData: InteractionData): CognitiveLoad {
        const key = `${userId}-${sessionId}`;

        let cognitiveLoad = this.cognitiveLoads.get(key) || {
            user_id: userId,
            session_id: sessionId,
            overall_load: 5,
            components: {
                intrinsic_load: 5,
                extraneous_load: 3,
                germane_load: 4
            },
            indicators: {
                response_time_variability: 0,
                error_frequency: 0,
                repetition_requests: 0,
                topic_switching: 0,
                frustration_signals: 0
            },
            recommendations: [],
            last_updated: new Date()
        };

        // 인지 부하 업데이트
        cognitiveLoad = this.updateCognitiveLoad(cognitiveLoad, interactionData);

        this.cognitiveLoads.set(key, cognitiveLoad);
        this.emit('cognitive_load_updated', cognitiveLoad);

        return cognitiveLoad;
    }

    // 인지 부하 업데이트
    private updateCognitiveLoad(load: CognitiveLoad, data: InteractionData): CognitiveLoad {
        const d = data as Record<string, unknown>;
        // 응답 시간 가변성 계산
        const responseTimes = Array.isArray(d.response_times) ? (d.response_times as number[]) : undefined;
        if (responseTimes && responseTimes.length > 0) {
            const mean = responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length;
            const variance = responseTimes.reduce((sum: number, time: number) => sum + Math.pow(time - mean, 2), 0) / responseTimes.length;
            load.indicators.response_time_variability = Math.sqrt(variance);
        }

        // 오류 빈도 계산
        const errors = Array.isArray(d.errors) ? d.errors : undefined;
        if (errors) {
            load.indicators.error_frequency = errors.length;
        }

        // 반복 요청 계산
        if (typeof d.repetition_requests === 'number') {
            load.indicators.repetition_requests = d.repetition_requests;
        }

        // 주제 전환 계산
        if (typeof d.topic_switches === 'number') {
            load.indicators.topic_switching = d.topic_switches;
        }

        // 좌절 신호 계산
        if (typeof d.frustration_signals === 'number') {
            load.indicators.frustration_signals = d.frustration_signals;
        }

        // 전체 인지 부하 계산
        load.overall_load = this.calculateOverallCognitiveLoad(load.indicators);

        // 구성 요소 업데이트
        load.components = this.updateLoadComponents(load, data);

        // 권장사항 생성
        load.recommendations = this.generateCognitiveLoadRecommendations(load);

        load.last_updated = new Date();
        return load;
    }

    // 전체 인지 부하 계산
    private calculateOverallCognitiveLoad(indicators: CognitiveLoad['indicators']): number {
        let load = 5; // 기본값

        // 응답 시간 가변성이 높으면 부하 증가
        if (indicators.response_time_variability > 1000) load += 2;

        // 오류 빈도가 높으면 부하 증가
        if (indicators.error_frequency > 3) load += 2;

        // 반복 요청이 많으면 부하 증가
        if (indicators.repetition_requests > 2) load += 1;

        // 주제 전환이 많으면 부하 증가
        if (indicators.topic_switching > 3) load += 1;

        // 좌절 신호가 많으면 부하 증가
        if (indicators.frustration_signals > 2) load += 2;

        return Math.min(10, Math.max(0, load));
    }

    // 부하 구성 요소 업데이트
    private updateLoadComponents(load: CognitiveLoad, data: InteractionData): CognitiveLoad['components'] {
        const components = { ...load.components };
        const d = data as Record<string, unknown>;

        // 내재적 부하 (작업 복잡성)
        if (typeof d.task_complexity === 'number') {
            components.intrinsic_load = Math.min(10, d.task_complexity);
        }

        // 외재적 부하 (불필요한 정보)
        if (typeof d.irrelevant_information === 'number') {
            components.extraneous_load = Math.min(10, components.extraneous_load + d.irrelevant_information);
        }

        // 관련 부하 (학습에 도움이 되는 정보)
        if (typeof d.helpful_information === 'number') {
            components.germane_load = Math.min(10, components.germane_load + d.helpful_information);
        }

        return components;
    }

    // 인지 부하 권장사항 생성
    private generateCognitiveLoadRecommendations(load: CognitiveLoad): string[] {
        const recommendations: string[] = [];

        if (load.overall_load > 8) {
            recommendations.push('인지 부하가 매우 높습니다. 작업을 더 작은 단위로 나누어 진행하세요.');
        } else if (load.overall_load > 6) {
            recommendations.push('인지 부하가 높습니다. 휴식을 취하고 단계별로 접근하세요.');
        }

        if (load.components.extraneous_load > 6) {
            recommendations.push('불필요한 정보가 많습니다. 핵심 내용에 집중하세요.');
        }

        if (load.indicators.frustration_signals > 3) {
            recommendations.push('좌절 신호가 감지되었습니다. 다른 접근 방법을 시도해보세요.');
        }

        return recommendations;
    }

    // 학습 동기 분석
    public analyzeLearningMotivation(userId: string, sessionId: string, interactionData: InteractionData): LearningMotivation {
        const key = `${userId}-${sessionId}`;

        let motivation = this.learningMotivations.get(key) || {
            user_id: userId,
            session_id: sessionId,
            motivation_type: 'mixed',
            motivation_level: 5,
            factors: {
                curiosity: 5,
                mastery_goal: 5,
                performance_goal: 5,
                social_recognition: 5,
                external_rewards: 5,
                self_efficacy: 5
            },
            barriers: [],
            enhancers: [],
            trend: 'stable',
            last_updated: new Date()
        };

        // 학습 동기 업데이트
        motivation = this.updateLearningMotivation(motivation, interactionData);

        this.learningMotivations.set(key, motivation);
        this.emit('learning_motivation_updated', motivation);

        return motivation;
    }

    // 학습 동기 업데이트
    private updateLearningMotivation(motivation: LearningMotivation, data: InteractionData): LearningMotivation {
        const d = data as Record<string, unknown>;
        // 호기심 분석
        if (typeof d.follow_up_questions === 'number') {
            motivation.factors.curiosity = Math.min(10, 5 + d.follow_up_questions * 0.5);
        }

        // 숙달 목표 분석
        if (typeof d.deep_diving === 'number') {
            motivation.factors.mastery_goal = Math.min(10, 5 + d.deep_diving * 0.3);
        }

        // 성과 목표 분석
        if (typeof d.performance_focus === 'number') {
            motivation.factors.performance_goal = Math.min(10, 5 + d.performance_focus * 0.3);
        }

        // 자기 효능감 분석
        if (typeof d.confidence_signals === 'number') {
            motivation.factors.self_efficacy = Math.min(10, 5 + d.confidence_signals * 0.4);
        }

        // 전체 동기 수준 계산
        motivation.motivation_level = this.calculateOverallMotivation(motivation.factors);

        // 동기 유형 분류
        motivation.motivation_type = this.classifyMotivationType(motivation.factors);

        // 장벽과 강화 요소 식별
        motivation.barriers = this.identifyMotivationBarriers(data);
        motivation.enhancers = this.identifyMotivationEnhancers(data);

        // 트렌드 분석
        motivation.trend = this.analyzeMotivationTrend(motivation, data);

        motivation.last_updated = new Date();
        return motivation;
    }

    // 전체 동기 수준 계산
    private calculateOverallMotivation(factors: LearningMotivation['factors']): number {
        const weights = {
            curiosity: 0.2,
            mastery_goal: 0.25,
            performance_goal: 0.15,
            social_recognition: 0.1,
            external_rewards: 0.1,
            self_efficacy: 0.2
        };

        let totalMotivation = 0;
        (Object.keys(weights) as Array<keyof LearningMotivation['factors']>).forEach(factor => {
            totalMotivation += factors[factor] * weights[factor];
        });

        return Math.min(10, Math.max(0, totalMotivation));
    }

    // 동기 유형 분류
    private classifyMotivationType(factors: LearningMotivation['factors']): 'intrinsic' | 'extrinsic' | 'mixed' {
        const intrinsicFactors = factors.curiosity + factors.mastery_goal + factors.self_efficacy;
        const extrinsicFactors = factors.performance_goal + factors.social_recognition + factors.external_rewards;

        if (intrinsicFactors > extrinsicFactors * 1.5) return 'intrinsic';
        if (extrinsicFactors > intrinsicFactors * 1.5) return 'extrinsic';
        return 'mixed';
    }

    // 동기 장벽 식별
    private identifyMotivationBarriers(data: InteractionData): string[] {
        const barriers: string[] = [];
        const d = data as Record<string, unknown>;
        if (typeof d.difficulty_level === 'number' && d.difficulty_level > 8) barriers.push('높은 난이도');
        if (d.lack_of_progress) barriers.push('진전 부족');
        if (d.negative_feedback) barriers.push('부정적 피드백');
        if (d.time_pressure) barriers.push('시간 압박');
        if (d.lack_of_relevance) barriers.push('관련성 부족');

        return barriers;
    }

    // 동기 강화 요소 식별
    private identifyMotivationEnhancers(data: InteractionData): string[] {
        const enhancers: string[] = [];
        const d = data as Record<string, unknown>;
        if (d.learning_progress) enhancers.push('학습 진전');
        if (d.positive_feedback) enhancers.push('긍정적 피드백');
        if (d.interesting_content) enhancers.push('흥미로운 내용');
        if (d.social_interaction) enhancers.push('사회적 상호작용');
        if (d.achievement_recognition) enhancers.push('성취 인정');

        return enhancers;
    }

    // 동기 트렌드 분석
    private analyzeMotivationTrend(motivation: LearningMotivation, _data: InteractionData): 'increasing' | 'stable' | 'decreasing' {
        // 시뮬레이션 - 실제로는 이전 데이터와 비교
        if (motivation.motivation_level > 7) return 'increasing';
        if (motivation.motivation_level < 3) return 'decreasing';
        return 'stable';
    }

    // 스트레스 레벨 분석
    public analyzeStressLevel(userId: string, sessionId: string, interactionData: InteractionData): StressLevel {
        const key = `${userId}-${sessionId}`;

        let stressLevel = this.stressLevels.get(key) || {
            user_id: userId,
            session_id: sessionId,
            stress_level: 3,
            stress_type: 'none',
            indicators: {
                rapid_typing: false,
                short_responses: false,
                topic_avoidance: false,
                repeated_questions: false,
                negative_language: false,
                time_pressure: false
            },
            coping_strategies: [],
            intervention_needed: false,
            last_updated: new Date()
        };

        // 스트레스 레벨 업데이트
        stressLevel = this.updateStressLevel(stressLevel, interactionData);

        this.stressLevels.set(key, stressLevel);
        this.emit('stress_level_updated', stressLevel);

        return stressLevel;
    }

    // 스트레스 레벨 업데이트
    private updateStressLevel(stress: StressLevel, data: InteractionData): StressLevel {
        let stressScore = 3; // 기본값
        const d = data as Record<string, unknown>;

        // 스트레스 지표 분석
        if (d.rapid_typing) {
            stress.indicators.rapid_typing = true;
            stressScore += 2;
        }
        if (d.short_responses) {
            stress.indicators.short_responses = true;
            stressScore += 1;
        }
        if (d.topic_avoidance) {
            stress.indicators.topic_avoidance = true;
            stressScore += 2;
        }
        if (d.repeated_questions) {
            stress.indicators.repeated_questions = true;
            stressScore += 1;
        }
        if (d.negative_language) {
            stress.indicators.negative_language = true;
            stressScore += 2;
        }
        if (d.time_pressure) {
            stress.indicators.time_pressure = true;
            stressScore += 3;
        }

        stress.stress_level = Math.min(10, Math.max(0, stressScore));

        // 스트레스 유형 분류
        stress.stress_type = this.classifyStressType(stress.stress_level, data);

        // 대처 전략 생성
        stress.coping_strategies = this.generateCopingStrategies(stress);

        // 개입 필요성 판단
        stress.intervention_needed = stress.stress_level > 7;

        stress.last_updated = new Date();
        return stress;
    }

    // 스트레스 유형 분류
    private classifyStressType(stressLevel: number, data: InteractionData): 'eustress' | 'distress' | 'none' {
        if (stressLevel < 3) return 'none';
        if ((data as Record<string, unknown>).positive_outcome_expectation) return 'eustress';
        return 'distress';
    }

    // 대처 전략 생성
    private generateCopingStrategies(stress: StressLevel): string[] {
        const strategies: string[] = [];

        if (stress.stress_level > 8) {
            strategies.push('즉시 휴식을 취하세요');
            strategies.push('깊은 호흡을 시도하세요');
        } else if (stress.stress_level > 6) {
            strategies.push('작업을 더 작은 단위로 나누세요');
            strategies.push('명확한 목표를 설정하세요');
        } else if (stress.stress_level > 4) {
            strategies.push('적절한 휴식을 취하세요');
            strategies.push('긍정적인 마인드를 유지하세요');
        }

        return strategies;
    }

    // 성격 인사이트 분석
    public analyzePersonalityInsights(userId: string, sessionId: string, interactionData: InteractionData): PersonalityInsights {
        const key = `${userId}-${sessionId}`;

        let personality = this.personalityInsights.get(key) || {
            user_id: userId,
            session_id: sessionId,
            learning_style: 'mixed',
            communication_preference: 'conversational',
            decision_making_style: 'analytical',
            risk_tolerance: 'medium',
            confidence_level: 5,
            adaptability: 5,
            persistence: 5,
            last_updated: new Date()
        };

        // 성격 인사이트 업데이트
        personality = this.updatePersonalityInsights(personality, interactionData);

        this.personalityInsights.set(key, personality);
        this.emit('personality_insights_updated', personality);

        return personality;
    }

    // 성격 인사이트 업데이트
    private updatePersonalityInsights(personality: PersonalityInsights, data: InteractionData): PersonalityInsights {
        const d = data as Record<string, unknown>;
        // 학습 스타일 분석
        if (d.visual_preferences) personality.learning_style = 'visual';
        else if (d.auditory_preferences) personality.learning_style = 'auditory';
        else if (d.kinesthetic_preferences) personality.learning_style = 'kinesthetic';
        else if (d.reading_preferences) personality.learning_style = 'reading';

        // 의사소통 선호도 분석
        if (d.direct_communication) personality.communication_preference = 'direct';
        else if (d.detailed_explanations) personality.communication_preference = 'detailed';
        else if (d.technical_communication) personality.communication_preference = 'technical';

        // 의사결정 스타일 분석
        if (d.analytical_approach) personality.decision_making_style = 'analytical';
        else if (d.intuitive_approach) personality.decision_making_style = 'intuitive';
        else if (d.collaborative_approach) personality.decision_making_style = 'collaborative';
        else if (d.systematic_approach) personality.decision_making_style = 'systematic';

        // 위험 감수 성향 분석
        if (d.risk_averse_behavior) personality.risk_tolerance = 'low';
        else if (d.risk_seeking_behavior) personality.risk_tolerance = 'high';

        // 신뢰도, 적응성, 지속성 업데이트
        if (typeof d.confidence_signals === 'number') personality.confidence_level = Math.min(10, 5 + d.confidence_signals * 0.5);
        if (typeof d.adaptability_signals === 'number') personality.adaptability = Math.min(10, 5 + d.adaptability_signals * 0.5);
        if (typeof d.persistence_signals === 'number') personality.persistence = Math.min(10, 5 + d.persistence_signals * 0.5);

        personality.last_updated = new Date();
        return personality;
    }

    // 심리학적 분석 수행
    private performPsychologicalAnalysis(): void {
        // 권장사항 생성
        this.generatePsychologyRecommendations();

        this.emit('psychology_analysis_completed', {
            recommendations: this.recommendations
        });
    }

    // 심리학 권장사항 생성
    private generatePsychologyRecommendations(): void {
        this.recommendations = [];

        // 감정적 지원 권장사항
        this.emotionalStates.forEach((state, _key) => {
            if (state.intensity > 7 && state.valence < -2) {
                this.recommendations.push({
                    recommendation_id: `psych-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user_id: state.user_id,
                    category: 'emotional_support',
                    title: '감정적 지원 필요',
                    description: '사용자가 높은 부정적 감정을 보이고 있습니다.',
                    priority: 'high',
                    action_items: [
                        '공감적 반응 제공',
                        '긍정적 강화 메시지',
                        '단계별 접근 제안'
                    ],
                    expected_impact: {
                        emotional_wellbeing: 0.4,
                        learning_effectiveness: 0.2,
                        engagement: 0.3,
                        satisfaction: 0.4
                    },
                    implementation_strategy: '즉시 감정적 지원 제공',
                    generated_at: new Date()
                });
            }
        });

        // 인지 최적화 권장사항
        this.cognitiveLoads.forEach((load, _key) => {
            if (load.overall_load > 8) {
                this.recommendations.push({
                    recommendation_id: `psych-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user_id: load.user_id,
                    category: 'cognitive_optimization',
                    title: '인지 부하 최적화',
                    description: '인지 부하가 매우 높습니다. 학습 환경을 최적화해야 합니다.',
                    priority: 'high',
                    action_items: [
                        '작업을 더 작은 단위로 분할',
                        '불필요한 정보 제거',
                        '명확한 지시사항 제공'
                    ],
                    expected_impact: {
                        emotional_wellbeing: 0.3,
                        learning_effectiveness: 0.5,
                        engagement: 0.4,
                        satisfaction: 0.3
                    },
                    implementation_strategy: '단계별 접근 방식 적용',
                    generated_at: new Date()
                });
            }
        });
    }

    // 사용자별 데이터 가져오기
    public getUserPsychologyData(userId: string, sessionId: string): UserPsychologyData {
        const key = `${userId}-${sessionId}`;

        return {
            emotional_state: this.emotionalStates.get(key),
            cognitive_load: this.cognitiveLoads.get(key),
            learning_motivation: this.learningMotivations.get(key),
            stress_level: this.stressLevels.get(key),
            personality_insights: this.personalityInsights.get(key)
        };
    }

    // 권장사항 가져오기
    public getPsychologyRecommendations(userId?: string): AIPsychologyRecommendation[] {
        if (userId) {
            return this.recommendations.filter(rec => rec.user_id === userId);
        }
        return this.recommendations;
    }

    // 통계 정보 가져오기
    public getPsychologyStatistics(): PsychologyStatistics {
        return {
            total_users: this.emotionalStates.size,
            total_recommendations: this.recommendations.length,
            average_emotional_intensity: this.calculateAverageEmotionalIntensity(),
            average_cognitive_load: this.calculateAverageCognitiveLoad(),
            average_motivation_level: this.calculateAverageMotivationLevel(),
            high_stress_users: this.countHighStressUsers()
        };
    }

    // 평균 감정 강도 계산
    private calculateAverageEmotionalIntensity(): number {
        const states = Array.from(this.emotionalStates.values());
        if (states.length === 0) return 0;

        const total = states.reduce((sum, state) => sum + state.intensity, 0);
        return total / states.length;
    }

    // 평균 인지 부하 계산
    private calculateAverageCognitiveLoad(): number {
        const loads = Array.from(this.cognitiveLoads.values());
        if (loads.length === 0) return 0;

        const total = loads.reduce((sum, load) => sum + load.overall_load, 0);
        return total / loads.length;
    }

    // 평균 동기 수준 계산
    private calculateAverageMotivationLevel(): number {
        const motivations = Array.from(this.learningMotivations.values());
        if (motivations.length === 0) return 0;

        const total = motivations.reduce((sum, motivation) => sum + motivation.motivation_level, 0);
        return total / motivations.length;
    }

    // 높은 스트레스 사용자 수 계산
    private countHighStressUsers(): number {
        const stressLevels = Array.from(this.stressLevels.values());
        return stressLevels.filter(stress => stress.stress_level > 7).length;
    }

    // 서비스 종료
    public shutdown(): void {
        this.stopAnalysis();
        this.emotionalStates.clear();
        this.cognitiveLoads.clear();
        this.learningMotivations.clear();
        this.stressLevels.clear();
        this.personalityInsights.clear();
        this.recommendations = [];
        errorLogger.info('🔌 고급 AI 심리학 분석 서비스가 종료되었습니다', {
            component: 'advancedAIPsychologyEngine',
            action: 'shutdown',
        });
    }
}

const advancedAIPsychologyEngine = new AdvancedAIPsychologyEngine();
export default advancedAIPsychologyEngine;
