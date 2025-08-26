import { EventEmitter } from 'events';

// 인터페이스 정의
export interface UserBehaviorPattern {
    user_id: string;
    session_id: string;
    pattern_type: 'learning' | 'exploration' | 'problem_solving' | 'social' | 'efficiency' | 'casual';
    confidence: number;
    characteristics: {
        session_duration: number;
        interaction_frequency: number;
        response_time_preference: number;
        complexity_preference: number;
        topic_diversity: number;
        repetition_tolerance: number;
    };
    preferences: {
        preferred_topics: string[];
        preferred_interaction_style: string;
        preferred_response_length: 'short' | 'medium' | 'long';
        preferred_learning_pace: 'slow' | 'moderate' | 'fast';
        preferred_feedback_type: 'immediate' | 'delayed' | 'summary';
    };
    last_updated: Date;
}

export interface UserEngagementMetrics {
    user_id: string;
    session_id: string;
    metrics: {
        session_duration: number;
        interaction_count: number;
        response_time: number;
        topic_switches: number;
        depth_of_exploration: number;
        return_frequency: number;
        completion_rate: number;
        satisfaction_score: number;
        frustration_signals: number;
        learning_progress: number;
    };
    patterns: {
        peak_activity_hours: string[];
        preferred_session_length: number;
        common_use_cases: string[];
        drop_off_points: string[];
        re_engagement_triggers: string[];
    };
    last_updated: Date;
}

export interface UserSatisfactionAnalysis {
    user_id: string;
    session_id: string;
    overall_satisfaction: number;
    satisfaction_factors: {
        response_quality: number;
        response_speed: number;
        personalization: number;
        learning_effectiveness: number;
        interface_usability: number;
        content_relevance: number;
    };
    satisfaction_trend: 'improving' | 'stable' | 'declining';
    pain_points: string[];
    positive_experiences: string[];
    recommendations: string[];
    last_updated: Date;
}

export interface LearningEffectivenessMetrics {
    user_id: string;
    session_id: string;
    learning_outcomes: {
        knowledge_retention: number;
        skill_improvement: number;
        concept_understanding: number;
        problem_solving_ability: number;
        confidence_level: number;
        motivation_level: number;
    };
    learning_patterns: {
        optimal_learning_time: number;
        preferred_learning_methods: string[];
        effective_feedback_types: string[];
        knowledge_gaps: string[];
        strengths: string[];
    };
    progress_tracking: {
        current_level: number;
        target_level: number;
        progress_rate: number;
        estimated_completion: Date;
        milestones_achieved: number;
        total_milestones: number;
    };
    last_updated: Date;
}

export interface UserExperienceInsight {
    insight_id: string;
    user_id: string;
    insight_type: 'behavior' | 'engagement' | 'satisfaction' | 'learning' | 'optimization';
    title: string;
    description: string;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionable: boolean;
    recommendations: string[];
    data_points: any[];
    generated_at: Date;
}

export interface UXOptimizationRecommendation {
    recommendation_id: string;
    user_id: string;
    category: 'interface' | 'content' | 'interaction' | 'personalization' | 'performance';
    title: string;
    description: string;
    impact_score: number;
    implementation_effort: 'low' | 'medium' | 'high';
    expected_improvement: {
        satisfaction: number;
        engagement: number;
        learning_effectiveness: number;
        retention: number;
    };
    implementation_steps: string[];
    metrics_to_track: string[];
    generated_at: Date;
}

// 고급 사용자 경험 분석 엔진 클래스
class AdvancedUserExperienceAnalytics extends EventEmitter {
    private userBehaviorPatterns: Map<string, UserBehaviorPattern> = new Map();
    private userEngagementData: Map<string, UserEngagementMetrics> = new Map();
    private userSatisfactionData: Map<string, UserSatisfactionAnalysis> = new Map();
    private learningEffectivenessData: Map<string, LearningEffectivenessMetrics> = new Map();
    private insights: UserExperienceInsight[] = [];
    private optimizationRecommendations: UXOptimizationRecommendation[] = [];
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
            this.performComprehensiveAnalysis();
        }, 30000); // 30초마다 분석

        console.log('🧠 고급 사용자 경험 분석이 시작되었습니다.');
    }

    // 분석 중지
    public stopAnalysis(): void {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        this.isAnalyzing = false;
        console.log('⏹️ 사용자 경험 분석이 중지되었습니다.');
    }

    // 사용자 행동 패턴 분석
    public analyzeUserBehavior(userId: string, sessionId: string, interactionData: any): UserBehaviorPattern {
        const key = `${userId}-${sessionId}`;

        // 기존 패턴 가져오기 또는 새로 생성
        let pattern = this.userBehaviorPatterns.get(key) || {
            user_id: userId,
            session_id: sessionId,
            pattern_type: 'learning',
            confidence: 0.5,
            characteristics: {
                session_duration: 0,
                interaction_frequency: 0,
                response_time_preference: 0,
                complexity_preference: 0,
                topic_diversity: 0,
                repetition_tolerance: 0
            },
            preferences: {
                preferred_topics: [],
                preferred_interaction_style: 'conversational',
                preferred_response_length: 'medium',
                preferred_learning_pace: 'moderate',
                preferred_feedback_type: 'immediate'
            },
            last_updated: new Date()
        };

        // 새로운 데이터로 패턴 업데이트
        pattern = this.updateBehaviorPattern(pattern, interactionData);

        this.userBehaviorPatterns.set(key, pattern);
        this.emit('behavior_pattern_updated', pattern);

        return pattern;
    }

    // 행동 패턴 업데이트
    private updateBehaviorPattern(pattern: UserBehaviorPattern, data: any): UserBehaviorPattern {
        // 세션 지속 시간 분석
        if (data.session_duration) {
            pattern.characteristics.session_duration =
                (pattern.characteristics.session_duration + data.session_duration) / 2;
        }

        // 상호작용 빈도 분석
        if (data.interaction_count && data.session_duration) {
            pattern.characteristics.interaction_frequency =
                data.interaction_count / (data.session_duration / 60); // 분당 상호작용
        }

        // 응답 시간 선호도 분석
        if (data.response_times) {
            const avgResponseTime = data.response_times.reduce((sum: number, time: number) => sum + time, 0) / data.response_times.length;
            pattern.characteristics.response_time_preference = avgResponseTime;
        }

        // 복잡도 선호도 분석
        if (data.complexity_scores) {
            pattern.characteristics.complexity_preference =
                data.complexity_scores.reduce((sum: number, score: number) => sum + score, 0) / data.complexity_scores.length;
        }

        // 주제 다양성 분석
        if (data.topics) {
            pattern.characteristics.topic_diversity = data.topics.length;
            pattern.preferences.preferred_topics = data.topics.slice(0, 5);
        }

        // 패턴 타입 분류
        pattern.pattern_type = this.classifyBehaviorPattern(pattern.characteristics);
        pattern.confidence = this.calculatePatternConfidence(pattern.characteristics);
        pattern.last_updated = new Date();

        return pattern;
    }

    // 행동 패턴 분류
    private classifyBehaviorPattern(characteristics: any): string {
        const { session_duration, interaction_frequency, complexity_preference, topic_diversity } = characteristics;

        if (session_duration > 30 && interaction_frequency > 5 && complexity_preference > 7) {
            return 'learning';
        } else if (topic_diversity > 5 && interaction_frequency > 3) {
            return 'exploration';
        } else if (complexity_preference > 8 && session_duration > 20) {
            return 'problem_solving';
        } else if (interaction_frequency > 8) {
            return 'social';
        } else if (session_duration < 10 && interaction_frequency < 3) {
            return 'efficiency';
        } else {
            return 'casual';
        }
    }

    // 패턴 신뢰도 계산
    private calculatePatternConfidence(characteristics: any): number {
        const factors = [
            characteristics.session_duration > 0 ? 1 : 0,
            characteristics.interaction_frequency > 0 ? 1 : 0,
            characteristics.response_time_preference > 0 ? 1 : 0,
            characteristics.complexity_preference > 0 ? 1 : 0,
            characteristics.topic_diversity > 0 ? 1 : 0
        ];

        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    // 사용자 참여도 분석
    public analyzeUserEngagement(userId: string, sessionId: string, engagementData: any): UserEngagementMetrics {
        const key = `${userId}-${sessionId}`;

        let engagement = this.userEngagementData.get(key) || {
            user_id: userId,
            session_id: sessionId,
            metrics: {
                session_duration: 0,
                interaction_count: 0,
                response_time: 0,
                topic_switches: 0,
                depth_of_exploration: 0,
                return_frequency: 0,
                completion_rate: 0,
                satisfaction_score: 0,
                frustration_signals: 0,
                learning_progress: 0
            },
            patterns: {
                peak_activity_hours: [],
                preferred_session_length: 0,
                common_use_cases: [],
                drop_off_points: [],
                re_engagement_triggers: []
            },
            last_updated: new Date()
        };

        // 참여도 메트릭 업데이트
        engagement = this.updateEngagementMetrics(engagement, engagementData);

        this.userEngagementData.set(key, engagement);
        this.emit('engagement_updated', engagement);

        return engagement;
    }

    // 참여도 메트릭 업데이트
    private updateEngagementMetrics(engagement: UserEngagementMetrics, data: any): UserEngagementMetrics {
        // 기본 메트릭 업데이트
        if (data.session_duration) {
            engagement.metrics.session_duration = data.session_duration;
        }
        if (data.interaction_count) {
            engagement.metrics.interaction_count = data.interaction_count;
        }
        if (data.response_time) {
            engagement.metrics.response_time = data.response_time;
        }
        if (data.topic_switches) {
            engagement.metrics.topic_switches = data.topic_switches;
        }
        if (data.satisfaction_score) {
            engagement.metrics.satisfaction_score = data.satisfaction_score;
        }

        // 깊이 분석
        engagement.metrics.depth_of_exploration = this.calculateExplorationDepth(data);
        engagement.metrics.completion_rate = this.calculateCompletionRate(data);
        engagement.metrics.frustration_signals = this.detectFrustrationSignals(data);

        // 패턴 분석
        engagement.patterns.peak_activity_hours = this.analyzePeakActivityHours(data);
        engagement.patterns.preferred_session_length = this.calculatePreferredSessionLength(data);
        engagement.patterns.common_use_cases = this.identifyCommonUseCases(data);
        engagement.patterns.drop_off_points = this.identifyDropOffPoints(data);

        engagement.last_updated = new Date();
        return engagement;
    }

    // 탐색 깊이 계산
    private calculateExplorationDepth(data: any): number {
        const factors = [
            data.topic_switches || 0,
            data.follow_up_questions || 0,
            data.detailed_responses || 0,
            data.research_requests || 0
        ];

        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    // 완료율 계산
    private calculateCompletionRate(data: any): number {
        const started = data.started_tasks || 0;
        const completed = data.completed_tasks || 0;

        return started > 0 ? (completed / started) * 100 : 0;
    }

    // 좌절 신호 감지
    private detectFrustrationSignals(data: any): number {
        const signals = [
            data.repeated_questions || 0,
            data.negative_feedback || 0,
            data.rapid_topic_switches || 0,
            data.short_responses || 0
        ];

        return signals.reduce((sum, signal) => sum + signal, 0);
    }

    // 피크 활동 시간 분석
    private analyzePeakActivityHours(data: any): string[] {
        // 시뮬레이션 - 실제로는 시간대별 활동 데이터가 필요
        return ['09:00-11:00', '14:00-16:00', '20:00-22:00'];
    }

    // 선호 세션 길이 계산
    private calculatePreferredSessionLength(data: any): number {
        return data.session_duration || 15; // 기본값 15분
    }

    // 일반적인 사용 사례 식별
    private identifyCommonUseCases(data: any): string[] {
        return data.use_cases || ['learning', 'problem_solving', 'exploration'];
    }

    // 이탈 지점 식별
    private identifyDropOffPoints(data: any): string[] {
        return data.drop_off_points || ['complex_questions', 'long_responses', 'technical_topics'];
    }

    // 사용자 만족도 분석
    public analyzeUserSatisfaction(userId: string, sessionId: string, satisfactionData: any): UserSatisfactionAnalysis {
        const key = `${userId}-${sessionId}`;

        let satisfaction = this.userSatisfactionData.get(key) || {
            user_id: userId,
            session_id: sessionId,
            overall_satisfaction: 4.0,
            satisfaction_factors: {
                response_quality: 4.0,
                response_speed: 4.0,
                personalization: 4.0,
                learning_effectiveness: 4.0,
                interface_usability: 4.0,
                content_relevance: 4.0
            },
            satisfaction_trend: 'stable',
            pain_points: [],
            positive_experiences: [],
            recommendations: [],
            last_updated: new Date()
        };

        // 만족도 분석 업데이트
        satisfaction = this.updateSatisfactionAnalysis(satisfaction, satisfactionData);

        this.userSatisfactionData.set(key, satisfaction);
        this.emit('satisfaction_updated', satisfaction);

        return satisfaction;
    }

    // 만족도 분석 업데이트
    private updateSatisfactionAnalysis(satisfaction: UserSatisfactionAnalysis, data: any): UserSatisfactionAnalysis {
        // 전체 만족도 업데이트
        if (data.overall_satisfaction) {
            satisfaction.overall_satisfaction = data.overall_satisfaction;
        }

        // 만족도 요인 업데이트
        if (data.satisfaction_factors) {
            satisfaction.satisfaction_factors = {
                ...satisfaction.satisfaction_factors,
                ...data.satisfaction_factors
            };
        }

        // 만족도 트렌드 분석
        satisfaction.satisfaction_trend = this.analyzeSatisfactionTrend(satisfaction.overall_satisfaction);

        // 고통 지점 및 긍정적 경험 식별
        satisfaction.pain_points = this.identifyPainPoints(data);
        satisfaction.positive_experiences = this.identifyPositiveExperiences(data);

        // 개선 권장사항 생성
        satisfaction.recommendations = this.generateSatisfactionRecommendations(satisfaction);

        satisfaction.last_updated = new Date();
        return satisfaction;
    }

    // 만족도 트렌드 분석
    private analyzeSatisfactionTrend(currentSatisfaction: number): 'improving' | 'stable' | 'declining' {
        // 시뮬레이션 - 실제로는 이전 만족도 데이터와 비교
        if (currentSatisfaction > 4.5) return 'improving';
        if (currentSatisfaction < 3.5) return 'declining';
        return 'stable';
    }

    // 고통 지점 식별
    private identifyPainPoints(data: any): string[] {
        const painPoints = [];

        if (data.slow_responses) painPoints.push('느린 응답 시간');
        if (data.unclear_responses) painPoints.push('불명확한 응답');
        if (data.irrelevant_content) painPoints.push('관련 없는 콘텐츠');
        if (data.technical_issues) painPoints.push('기술적 문제');
        if (data.lack_of_personalization) painPoints.push('개인화 부족');

        return painPoints;
    }

    // 긍정적 경험 식별
    private identifyPositiveExperiences(data: any): string[] {
        const positiveExperiences = [];

        if (data.fast_responses) positiveExperiences.push('빠른 응답');
        if (data.accurate_responses) positiveExperiences.push('정확한 응답');
        if (data.personalized_content) positiveExperiences.push('개인화된 콘텐츠');
        if (data.helpful_learning) positiveExperiences.push('유용한 학습');
        if (data.easy_interface) positiveExperiences.push('사용하기 쉬운 인터페이스');

        return positiveExperiences;
    }

    // 만족도 개선 권장사항 생성
    private generateSatisfactionRecommendations(satisfaction: UserSatisfactionAnalysis): string[] {
        const recommendations = [];

        if (satisfaction.satisfaction_factors.response_speed < 3.5) {
            recommendations.push('응답 속도를 개선하세요');
        }
        if (satisfaction.satisfaction_factors.personalization < 3.5) {
            recommendations.push('개인화 수준을 높이세요');
        }
        if (satisfaction.satisfaction_factors.content_relevance < 3.5) {
            recommendations.push('콘텐츠 관련성을 개선하세요');
        }

        return recommendations;
    }

    // 학습 효과성 분석
    public analyzeLearningEffectiveness(userId: string, sessionId: string, learningData: any): LearningEffectivenessMetrics {
        const key = `${userId}-${sessionId}`;

        let learning = this.learningEffectivenessData.get(key) || {
            user_id: userId,
            session_id: sessionId,
            learning_outcomes: {
                knowledge_retention: 0,
                skill_improvement: 0,
                concept_understanding: 0,
                problem_solving_ability: 0,
                confidence_level: 0,
                motivation_level: 0
            },
            learning_patterns: {
                optimal_learning_time: 0,
                preferred_learning_methods: [],
                effective_feedback_types: [],
                knowledge_gaps: [],
                strengths: []
            },
            progress_tracking: {
                current_level: 1,
                target_level: 5,
                progress_rate: 0,
                estimated_completion: new Date(),
                milestones_achieved: 0,
                total_milestones: 10
            },
            last_updated: new Date()
        };

        // 학습 효과성 업데이트
        learning = this.updateLearningEffectiveness(learning, learningData);

        this.learningEffectivenessData.set(key, learning);
        this.emit('learning_effectiveness_updated', learning);

        return learning;
    }

    // 학습 효과성 업데이트
    private updateLearningEffectiveness(learning: LearningEffectivenessMetrics, data: any): LearningEffectivenessMetrics {
        // 학습 결과 업데이트
        if (data.knowledge_retention) {
            learning.learning_outcomes.knowledge_retention = data.knowledge_retention;
        }
        if (data.skill_improvement) {
            learning.learning_outcomes.skill_improvement = data.skill_improvement;
        }
        if (data.confidence_level) {
            learning.learning_outcomes.confidence_level = data.confidence_level;
        }

        // 학습 패턴 업데이트
        learning.learning_patterns.optimal_learning_time = this.calculateOptimalLearningTime(data);
        learning.learning_patterns.preferred_learning_methods = this.identifyPreferredLearningMethods(data);
        learning.learning_patterns.effective_feedback_types = this.identifyEffectiveFeedbackTypes(data);
        learning.learning_patterns.knowledge_gaps = this.identifyKnowledgeGaps(data);
        learning.learning_patterns.strengths = this.identifyStrengths(data);

        // 진행 상황 업데이트
        learning.progress_tracking = this.updateProgressTracking(learning.progress_tracking, data);

        learning.last_updated = new Date();
        return learning;
    }

    // 최적 학습 시간 계산
    private calculateOptimalLearningTime(data: any): number {
        return data.optimal_learning_time || 25; // 기본값 25분
    }

    // 선호 학습 방법 식별
    private identifyPreferredLearningMethods(data: any): string[] {
        return data.preferred_methods || ['interactive', 'visual', 'practical'];
    }

    // 효과적인 피드백 유형 식별
    private identifyEffectiveFeedbackTypes(data: any): string[] {
        return data.effective_feedback || ['immediate', 'detailed', 'encouraging'];
    }

    // 지식 격차 식별
    private identifyKnowledgeGaps(data: any): string[] {
        return data.knowledge_gaps || ['advanced_concepts', 'practical_applications'];
    }

    // 강점 식별
    private identifyStrengths(data: any): string[] {
        return data.strengths || ['concept_understanding', 'problem_solving'];
    }

    // 진행 상황 업데이트
    private updateProgressTracking(progress: any, data: any): any {
        if (data.current_level) {
            progress.current_level = data.current_level;
        }
        if (data.milestones_achieved) {
            progress.milestones_achieved = data.milestones_achieved;
        }

        progress.progress_rate = (progress.milestones_achieved / progress.total_milestones) * 100;

        return progress;
    }

    // 종합 분석 수행
    private performComprehensiveAnalysis(): void {
        // 인사이트 생성
        this.generateInsights();

        // 최적화 권장사항 생성
        this.generateOptimizationRecommendations();

        this.emit('analysis_completed', {
            insights: this.insights,
            recommendations: this.optimizationRecommendations
        });
    }

    // 인사이트 생성
    private generateInsights(): void {
        this.insights = [];

        // 행동 패턴 인사이트
        this.userBehaviorPatterns.forEach((pattern, key) => {
            if (pattern.confidence > 0.7) {
                this.insights.push({
                    insight_id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user_id: pattern.user_id,
                    insight_type: 'behavior',
                    title: `${pattern.pattern_type} 패턴 발견`,
                    description: `사용자가 ${pattern.pattern_type} 패턴을 보이고 있습니다.`,
                    confidence: pattern.confidence,
                    priority: pattern.confidence > 0.9 ? 'high' : 'medium',
                    actionable: true,
                    recommendations: this.generateBehaviorRecommendations(pattern),
                    data_points: [pattern.characteristics],
                    generated_at: new Date()
                });
            }
        });

        // 참여도 인사이트
        this.userEngagementData.forEach((engagement, key) => {
            if (engagement.metrics.frustration_signals > 3) {
                this.insights.push({
                    insight_id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    user_id: engagement.user_id,
                    insight_type: 'engagement',
                    title: '높은 좌절 신호 감지',
                    description: '사용자에게 좌절 신호가 많이 나타나고 있습니다.',
                    confidence: 0.8,
                    priority: 'high',
                    actionable: true,
                    recommendations: ['응답 품질 개선', '인터페이스 단순화', '개인화 강화'],
                    data_points: [engagement.metrics],
                    generated_at: new Date()
                });
            }
        });
    }

    // 행동 패턴 권장사항 생성
    private generateBehaviorRecommendations(pattern: UserBehaviorPattern): string[] {
        const recommendations = [];

        switch (pattern.pattern_type) {
            case 'learning':
                recommendations.push('더 깊이 있는 학습 자료 제공');
                recommendations.push('단계별 학습 경로 제안');
                break;
            case 'exploration':
                recommendations.push('다양한 주제 추천');
                recommendations.push('관련 주제 연결');
                break;
            case 'problem_solving':
                recommendations.push('실습 문제 제공');
                recommendations.push('해결 방법 가이드');
                break;
            case 'social':
                recommendations.push('상호작용 기회 증가');
                recommendations.push('피드백 시스템 강화');
                break;
            case 'efficiency':
                recommendations.push('빠른 응답 최적화');
                recommendations.push('핵심 정보 우선 제공');
                break;
        }

        return recommendations;
    }

    // 최적화 권장사항 생성
    private generateOptimizationRecommendations(): void {
        this.optimizationRecommendations = [];

        // 인터페이스 최적화
        this.optimizationRecommendations.push({
            recommendation_id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: 'general',
            category: 'interface',
            title: '사용자 인터페이스 개선',
            description: '사용자 경험을 향상시키기 위한 인터페이스 최적화',
            impact_score: 0.8,
            implementation_effort: 'medium',
            expected_improvement: {
                satisfaction: 0.3,
                engagement: 0.2,
                learning_effectiveness: 0.1,
                retention: 0.2
            },
            implementation_steps: [
                '사용자 피드백 수집',
                '인터페이스 프로토타입 제작',
                'A/B 테스트 수행',
                '결과 분석 및 적용'
            ],
            metrics_to_track: ['satisfaction_score', 'session_duration', 'completion_rate'],
            generated_at: new Date()
        });
    }

    // 사용자별 데이터 가져오기
    public getUserData(userId: string, sessionId: string): any {
        const key = `${userId}-${sessionId}`;

        return {
            behavior_pattern: this.userBehaviorPatterns.get(key),
            engagement: this.userEngagementData.get(key),
            satisfaction: this.userSatisfactionData.get(key),
            learning_effectiveness: this.learningEffectivenessData.get(key)
        };
    }

    // 인사이트 가져오기
    public getInsights(userId?: string): UserExperienceInsight[] {
        if (userId) {
            return this.insights.filter(insight => insight.user_id === userId);
        }
        return this.insights;
    }

    // 최적화 권장사항 가져오기
    public getOptimizationRecommendations(userId?: string): UXOptimizationRecommendation[] {
        if (userId) {
            return this.optimizationRecommendations.filter(rec => rec.user_id === userId || rec.user_id === 'general');
        }
        return this.optimizationRecommendations;
    }

    // 통계 정보 가져오기
    public getStatistics(): any {
        return {
            total_users: this.userBehaviorPatterns.size,
            total_insights: this.insights.length,
            total_recommendations: this.optimizationRecommendations.length,
            average_satisfaction: this.calculateAverageSatisfaction(),
            average_engagement: this.calculateAverageEngagement(),
            common_patterns: this.identifyCommonPatterns()
        };
    }

    // 평균 만족도 계산
    private calculateAverageSatisfaction(): number {
        const satisfactions = Array.from(this.userSatisfactionData.values());
        if (satisfactions.length === 0) return 0;

        const total = satisfactions.reduce((sum, s) => sum + s.overall_satisfaction, 0);
        return total / satisfactions.length;
    }

    // 평균 참여도 계산
    private calculateAverageEngagement(): number {
        const engagements = Array.from(this.userEngagementData.values());
        if (engagements.length === 0) return 0;

        const total = engagements.reduce((sum, e) => sum + e.metrics.satisfaction_score, 0);
        return total / engagements.length;
    }

    // 일반적인 패턴 식별
    private identifyCommonPatterns(): string[] {
        const patterns = Array.from(this.userBehaviorPatterns.values());
        const patternCounts: { [key: string]: number } = {};

        patterns.forEach(pattern => {
            patternCounts[pattern.pattern_type] = (patternCounts[pattern.pattern_type] || 0) + 1;
        });

        return Object.entries(patternCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([pattern]) => pattern);
    }

    // 서비스 종료
    public shutdown(): void {
        this.stopAnalysis();
        this.userBehaviorPatterns.clear();
        this.userEngagementData.clear();
        this.userSatisfactionData.clear();
        this.learningEffectivenessData.clear();
        this.insights = [];
        this.optimizationRecommendations = [];
        console.log('🔌 고급 사용자 경험 분석 서비스가 종료되었습니다.');
    }
}

const advancedUserExperienceAnalytics = new AdvancedUserExperienceAnalytics();
export default advancedUserExperienceAnalytics;
