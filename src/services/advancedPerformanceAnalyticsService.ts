import { ConversationMemory } from './advancedConversationMemoryService';
import { LearningExperience } from './personalizedLearningExperienceService';

export interface PerformanceAnalyticsRequest {
    user_id: string;
    session_id: string;
    conversation_memory: ConversationMemory;
    learning_experience: LearningExperience;
    time_range: 'day' | 'week' | 'month' | 'all';
}

export interface PerformanceAnalyticsResult {
    overall_score: number;
    learning_efficiency: number;
    engagement_level: 'low' | 'medium' | 'high' | 'excellent';
    progress_trend: 'declining' | 'stable' | 'improving' | 'accelerating';
    performance_metrics: PerformanceMetrics;
    learning_patterns: LearningPattern[];
    skill_gaps: SkillGap[];
    recommendations: PerformanceRecommendation[];
    predictions: PerformancePrediction[];
    insights: PerformanceInsight[];
}

export interface PerformanceMetrics {
    response_time: {
        average: number;
        trend: 'improving' | 'stable' | 'declining';
        percentile: number;
    };
    satisfaction_score: {
        average: number;
        trend: 'improving' | 'stable' | 'declining';
        consistency: number;
    };
    engagement_metrics: {
        session_duration: number;
        interaction_frequency: number;
        topic_diversity: number;
        depth_of_questions: number;
    };
    learning_progress: {
        completion_rate: number;
        retention_rate: number;
        application_rate: number;
        mastery_level: number;
    };
    cognitive_load: {
        complexity_handling: number;
        problem_solving_speed: number;
        concept_integration: number;
    };
}

export interface LearningPattern {
    pattern_type: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'social';
    frequency: number;
    effectiveness: number;
    preferred_time: string;
    session_length: number;
    topics: string[];
    confidence_boost: number;
}

export interface SkillGap {
    skill_name: string;
    current_level: number;
    required_level: number;
    gap_size: number;
    impact_priority: 'low' | 'medium' | 'high' | 'critical';
    learning_difficulty: number;
    estimated_time_to_master: number;
    related_concepts: string[];
    suggested_resources: string[];
}

export interface PerformanceRecommendation {
    id: string;
    type: 'learning_strategy' | 'content_focus' | 'practice_exercise' | 'review_session' | 'skill_development';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expected_impact: number;
    implementation_difficulty: number;
    time_requirement: number;
    prerequisites: string[];
    success_metrics: string[];
}

export interface PerformancePrediction {
    metric: string;
    current_value: number;
    predicted_value: number;
    confidence: number;
    timeframe: number; // days
    factors: PredictionFactor[];
    risk_level: 'low' | 'medium' | 'high';
}

export interface PredictionFactor {
    factor_name: string;
    impact: number; // -1 to 1
    confidence: number;
    description: string;
}

export interface PerformanceInsight {
    id: string;
    type: 'strength' | 'weakness' | 'opportunity' | 'trend' | 'anomaly';
    title: string;
    description: string;
    data_evidence: string[];
    confidence: number;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
}

class AdvancedPerformanceAnalyticsService {
    private performanceHistory: Map<string, PerformanceAnalyticsResult[]> = new Map();
    private predictionModels: Map<string, any> = new Map();
    private benchmarkData: Map<string, any> = new Map();

    constructor() {
        this.initializeBenchmarkData();
        this.initializePredictionModels();
    }

    // 메인 분석 메서드
    async analyzePerformance(request: PerformanceAnalyticsRequest): Promise<PerformanceAnalyticsResult> {
        try {
            const startTime = Date.now();

            // 1. 기본 성과 지표 계산
            const performanceMetrics = await this.calculatePerformanceMetrics(request);

            // 2. 학습 패턴 분석
            const learningPatterns = await this.analyzeLearningPatterns(request);

            // 3. 기술 격차 식별
            const skillGaps = await this.identifySkillGaps(request, performanceMetrics);

            // 4. 성과 추천사항 생성
            const recommendations = await this.generateRecommendations(request, performanceMetrics, skillGaps);

            // 5. 성과 예측
            const predictions = await this.generatePredictions(request, performanceMetrics);

            // 6. 인사이트 생성
            const insights = await this.generateInsights(request, performanceMetrics, learningPatterns, skillGaps);

            // 7. 종합 점수 계산
            const overallScore = this.calculateOverallScore(performanceMetrics, learningPatterns);
            const learningEfficiency = this.calculateLearningEfficiency(performanceMetrics, learningPatterns);
            const engagementLevel = this.assessEngagementLevel(performanceMetrics);
            const progressTrend = this.analyzeProgressTrend(request);

            const result: PerformanceAnalyticsResult = {
                overall_score: overallScore,
                learning_efficiency: learningEfficiency,
                engagement_level: engagementLevel,
                progress_trend: progressTrend,
                performance_metrics: performanceMetrics,
                learning_patterns: learningPatterns,
                skill_gaps: skillGaps,
                recommendations: recommendations,
                predictions: predictions,
                insights: insights
            };

            // 성과 히스토리 저장
            this.savePerformanceHistory(request.user_id, result);

            console.log(`Performance analysis completed in ${Date.now() - startTime}ms`);
            return result;

        } catch (error) {
            console.error('Performance analysis error:', error);
            return this.generateFallbackResult();
        }
    }

    // 성과 지표 계산
    private async calculatePerformanceMetrics(request: PerformanceAnalyticsRequest): Promise<PerformanceMetrics> {
        const memory = request.conversation_memory;
        const learningExp = request.learning_experience;

        // 응답 시간 분석
        const responseTimes = memory.conversation_history
            .map(entry => entry.metadata.processing_time)
            .filter(time => time > 0);
        
        const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
            : 0;

        // 만족도 분석
        const satisfactionScores = memory.interaction_stats.satisfaction_scores || [];
        const avgSatisfaction = satisfactionScores.length > 0
            ? satisfactionScores.reduce((sum, score) => sum + score.score, 0) / satisfactionScores.length
            : 3.0;

        // 참여도 지표
        const sessionDuration = this.calculateSessionDuration(memory);
        const interactionFrequency = this.calculateInteractionFrequency(memory);
        const topicDiversity = this.calculateTopicDiversity(memory);
        const depthOfQuestions = this.calculateQuestionDepth(memory);

        // 학습 진행도
        const completionRate = learningExp?.current_learning_path?.completion_percentage || 0;
        const retentionRate = this.calculateRetentionRate(memory);
        const applicationRate = this.calculateApplicationRate(memory);
        const masteryLevel = this.calculateMasteryLevel(memory, learningExp);

        // 인지 부하
        const complexityHandling = this.calculateComplexityHandling(memory);
        const problemSolvingSpeed = this.calculateProblemSolvingSpeed(memory);
        const conceptIntegration = this.calculateConceptIntegration(memory);

        return {
            response_time: {
                average: avgResponseTime,
                trend: this.analyzeTrend(responseTimes),
                percentile: this.calculatePercentile(avgResponseTime, [1, 2, 3, 4, 5])
            },
            satisfaction_score: {
                average: avgSatisfaction,
                trend: this.analyzeTrend(satisfactionScores.map(s => s.score)),
                consistency: this.calculateConsistency(satisfactionScores.map(s => s.score))
            },
            engagement_metrics: {
                session_duration: sessionDuration,
                interaction_frequency: interactionFrequency,
                topic_diversity: topicDiversity,
                depth_of_questions: depthOfQuestions
            },
            learning_progress: {
                completion_rate: completionRate,
                retention_rate: retentionRate,
                application_rate: applicationRate,
                mastery_level: masteryLevel
            },
            cognitive_load: {
                complexity_handling: complexityHandling,
                problem_solving_speed: problemSolvingSpeed,
                concept_integration: conceptIntegration
            }
        };
    }

    // 학습 패턴 분석
    private async analyzeLearningPatterns(request: PerformanceAnalyticsRequest): Promise<LearningPattern[]> {
        const memory = request.conversation_memory;
        const patterns: LearningPattern[] = [];

        // 시각적 학습 패턴
        const visualPatterns = this.analyzeVisualLearningPatterns(memory);
        if (visualPatterns.frequency > 0) {
            patterns.push(visualPatterns);
        }

        // 청각적 학습 패턴
        const auditoryPatterns = this.analyzeAuditoryLearningPatterns(memory);
        if (auditoryPatterns.frequency > 0) {
            patterns.push(auditoryPatterns);
        }

        // 운동감각적 학습 패턴
        const kinestheticPatterns = this.analyzeKinestheticLearningPatterns(memory);
        if (kinestheticPatterns.frequency > 0) {
            patterns.push(kinestheticPatterns);
        }

        // 읽기 학습 패턴
        const readingPatterns = this.analyzeReadingLearningPatterns(memory);
        if (readingPatterns.frequency > 0) {
            patterns.push(readingPatterns);
        }

        // 사회적 학습 패턴
        const socialPatterns = this.analyzeSocialLearningPatterns(memory);
        if (socialPatterns.frequency > 0) {
            patterns.push(socialPatterns);
        }

        return patterns.sort((a, b) => b.frequency - a.frequency);
    }

    // 기술 격차 식별
    private async identifySkillGaps(request: PerformanceAnalyticsRequest, metrics: PerformanceMetrics): Promise<SkillGap[]> {
        const memory = request.conversation_memory;
        const learningExp = request.learning_experience;
        const gaps: SkillGap[] = [];

        // 프로그래밍 기술 격차
        const programmingGap = this.analyzeProgrammingSkillGap(memory, metrics);
        if (programmingGap.gap_size > 0.2) {
            gaps.push(programmingGap);
        }

        // 웹 개발 기술 격차
        const webDevGap = this.analyzeWebDevelopmentSkillGap(memory, metrics);
        if (webDevGap.gap_size > 0.2) {
            gaps.push(webDevGap);
        }

        // 문제 해결 능력 격차
        const problemSolvingGap = this.analyzeProblemSolvingSkillGap(memory, metrics);
        if (problemSolvingGap.gap_size > 0.2) {
            gaps.push(problemSolvingGap);
        }

        // 개념 이해 격차
        const conceptUnderstandingGap = this.analyzeConceptUnderstandingGap(memory, metrics);
        if (conceptUnderstandingGap.gap_size > 0.2) {
            gaps.push(conceptUnderstandingGap);
        }

        return gaps.sort((a, b) => b.impact_priority.localeCompare(a.impact_priority));
    }

    // 추천사항 생성
    private async generateRecommendations(
        request: PerformanceAnalyticsRequest, 
        metrics: PerformanceMetrics, 
        skillGaps: SkillGap[]
    ): Promise<PerformanceRecommendation[]> {
        const recommendations: PerformanceRecommendation[] = [];

        // 학습 효율성 기반 추천
        if (metrics.learning_progress.completion_rate < 0.7) {
            recommendations.push({
                id: 'improve-completion',
                type: 'learning_strategy',
                title: '학습 완료율 향상',
                description: '현재 학습 완료율이 낮습니다. 더 체계적인 학습 계획을 세워보세요.',
                priority: 'high',
                expected_impact: 0.3,
                implementation_difficulty: 0.4,
                time_requirement: 30,
                prerequisites: [],
                success_metrics: ['completion_rate', 'learning_efficiency']
            });
        }

        // 만족도 기반 추천
        if (metrics.satisfaction_score.average < 3.5) {
            recommendations.push({
                id: 'improve-satisfaction',
                type: 'content_focus',
                title: '응답 만족도 개선',
                description: '더 구체적이고 실용적인 질문을 해보세요.',
                priority: 'medium',
                expected_impact: 0.2,
                implementation_difficulty: 0.3,
                time_requirement: 15,
                prerequisites: [],
                success_metrics: ['satisfaction_score', 'engagement_level']
            });
        }

        // 기술 격차 기반 추천
        skillGaps.slice(0, 3).forEach(gap => {
            recommendations.push({
                id: `skill-gap-${gap.skill_name}`,
                type: 'skill_development',
                title: `${gap.skill_name} 기술 향상`,
                description: `${gap.skill_name} 영역에서 개선이 필요합니다.`,
                priority: gap.impact_priority,
                expected_impact: 1 - gap.gap_size,
                implementation_difficulty: gap.learning_difficulty,
                time_requirement: gap.estimated_time_to_master,
                prerequisites: gap.related_concepts,
                success_metrics: ['mastery_level', 'skill_gap_reduction']
            });
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // 성과 예측
    private async generatePredictions(
        request: PerformanceAnalyticsRequest, 
        metrics: PerformanceMetrics
    ): Promise<PerformancePrediction[]> {
        const predictions: PerformancePrediction[] = [];

        // 학습 완료율 예측
        const completionPrediction = this.predictCompletionRate(request, metrics);
        predictions.push(completionPrediction);

        // 만족도 예측
        const satisfactionPrediction = this.predictSatisfactionScore(request, metrics);
        predictions.push(satisfactionPrediction);

        // 기술 숙련도 예측
        const skillMasteryPrediction = this.predictSkillMastery(request, metrics);
        predictions.push(skillMasteryPrediction);

        // 학습 효율성 예측
        const efficiencyPrediction = this.predictLearningEfficiency(request, metrics);
        predictions.push(efficiencyPrediction);

        return predictions;
    }

    // 인사이트 생성
    private async generateInsights(
        request: PerformanceAnalyticsRequest,
        metrics: PerformanceMetrics,
        patterns: LearningPattern[],
        skillGaps: SkillGap[]
    ): Promise<PerformanceInsight[]> {
        const insights: PerformanceInsight[] = [];

        // 강점 인사이트
        if (metrics.satisfaction_score.average > 4.0) {
            insights.push({
                id: 'high-satisfaction-strength',
                type: 'strength',
                title: '높은 만족도',
                description: '평균 만족도가 4점을 넘어서고 있습니다. 현재 학습 방식이 효과적입니다.',
                data_evidence: [`평균 만족도: ${metrics.satisfaction_score.average.toFixed(1)}/5`],
                confidence: 0.9,
                actionable: false,
                priority: 'medium'
            });
        }

        // 약점 인사이트
        if (metrics.learning_progress.completion_rate < 0.5) {
            insights.push({
                id: 'low-completion-weakness',
                type: 'weakness',
                title: '낮은 완료율',
                description: '학습 완료율이 50% 미만입니다. 학습 계획을 재검토해보세요.',
                data_evidence: [`완료율: ${(metrics.learning_progress.completion_rate * 100).toFixed(1)}%`],
                confidence: 0.8,
                actionable: true,
                priority: 'high'
            });
        }

        // 기회 인사이트
        if (patterns.length > 0) {
            const topPattern = patterns[0];
            insights.push({
                id: 'learning-pattern-opportunity',
                type: 'opportunity',
                title: '학습 패턴 발견',
                description: `${topPattern.pattern_type} 학습 방식이 가장 효과적입니다. 이를 더 활용해보세요.`,
                data_evidence: [`패턴 타입: ${topPattern.pattern_type}`, `효과성: ${topPattern.effectiveness.toFixed(2)}`],
                confidence: 0.7,
                actionable: true,
                priority: 'medium'
            });
        }

        // 트렌드 인사이트
        if (metrics.satisfaction_score.trend === 'improving') {
            insights.push({
                id: 'improving-satisfaction-trend',
                type: 'trend',
                title: '만족도 개선 트렌드',
                description: '만족도가 지속적으로 개선되고 있습니다. 현재 접근 방식을 유지하세요.',
                data_evidence: ['만족도 트렌드: 개선 중'],
                confidence: 0.8,
                actionable: false,
                priority: 'low'
            });
        }

        return insights;
    }

    // 헬퍼 메서드들
    private calculateSessionDuration(memory: ConversationMemory): number {
        if (memory.conversation_history.length < 2) return 0;
        
        const firstEntry = memory.conversation_history[0];
        const lastEntry = memory.conversation_history[memory.conversation_history.length - 1];
        
        return (new Date(lastEntry.timestamp).getTime() - new Date(firstEntry.timestamp).getTime()) / (1000 * 60); // minutes
    }

    private calculateInteractionFrequency(memory: ConversationMemory): number {
        const totalMessages = memory.interaction_stats.total_messages;
        const sessionDuration = this.calculateSessionDuration(memory);
        
        return sessionDuration > 0 ? totalMessages / sessionDuration : 0;
    }

    private calculateTopicDiversity(memory: ConversationMemory): number {
        const topics = new Set(
            memory.conversation_history
                .map(entry => entry.context?.current_topic)
                .filter(Boolean)
        );
        
        return topics.size / Math.max(memory.conversation_history.length, 1);
    }

    private calculateQuestionDepth(memory: ConversationMemory): number {
        const questions = memory.conversation_history
            .filter(entry => entry.user_input.includes('?'))
            .map(entry => entry.user_input.length);
        
        return questions.length > 0 ? questions.reduce((a, b) => a + b, 0) / questions.length : 0;
    }

    private calculateRetentionRate(memory: ConversationMemory): number {
        // 간단한 구현 - 실제로는 더 복잡한 알고리즘 필요
        const repeatedConcepts = memory.knowledge_graph?.nodes?.filter(node => node.access_count > 1) || [];
        const totalConcepts = memory.knowledge_graph?.nodes?.length || 1;
        
        return repeatedConcepts.length / totalConcepts;
    }

    private calculateApplicationRate(memory: ConversationMemory): number {
        // 실제 구현에서는 코드 예시나 실습 관련 대화를 분석
        const codeRelatedEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('code') || 
            entry.user_input.toLowerCase().includes('example') ||
            entry.user_input.toLowerCase().includes('실습')
        );
        
        return codeRelatedEntries.length / Math.max(memory.conversation_history.length, 1);
    }

    private calculateMasteryLevel(memory: ConversationMemory, learningExp: LearningExperience): number {
        const completionRate = learningExp?.current_learning_path?.completion_percentage || 0;
        const satisfactionScore = memory.interaction_stats.average_satisfaction || 3;
        
        return (completionRate * 0.6 + satisfactionScore * 8) / 10;
    }

    private calculateComplexityHandling(memory: ConversationMemory): number {
        const complexQuestions = memory.conversation_history.filter(entry => 
            entry.understanding_result?.semantic_analysis?.complexity_assessment?.overall_complexity > 7
        );
        
        return complexQuestions.length / Math.max(memory.conversation_history.length, 1);
    }

    private calculateProblemSolvingSpeed(memory: ConversationMemory): number {
        const problemSolvingEntries = memory.conversation_history.filter(entry => 
            entry.understanding_result?.intent_clarification?.primary_intent === 'problem_solving'
        );
        
        if (problemSolvingEntries.length === 0) return 0;
        
        const avgProcessingTime = problemSolvingEntries
            .map(entry => entry.metadata.processing_time)
            .reduce((a, b) => a + b, 0) / problemSolvingEntries.length;
        
        return Math.max(0, 1 - avgProcessingTime / 10000); // 10초를 기준으로 정규화
    }

    private calculateConceptIntegration(memory: ConversationMemory): number {
        const knowledgeGraph = memory.knowledge_graph;
        if (!knowledgeGraph || !knowledgeGraph.edges) return 0;
        
        const totalNodes = knowledgeGraph.nodes.length;
        const totalEdges = knowledgeGraph.edges.length;
        
        return totalNodes > 0 ? totalEdges / (totalNodes * (totalNodes - 1) / 2) : 0;
    }

    private analyzeTrend(values: number[]): 'improving' | 'stable' | 'declining' {
        if (values.length < 3) return 'stable';
        
        const recent = values.slice(-3);
        const earlier = values.slice(-6, -3);
        
        if (earlier.length < 3) return 'stable';
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        
        const change = (recentAvg - earlierAvg) / earlierAvg;
        
        if (change > 0.1) return 'improving';
        if (change < -0.1) return 'declining';
        return 'stable';
    }

    private calculatePercentile(value: number, distribution: number[]): number {
        const sorted = distribution.sort((a, b) => a - b);
        const index = sorted.findIndex(x => x >= value);
        return index >= 0 ? (index / sorted.length) * 100 : 100;
    }

    private calculateConsistency(values: number[]): number {
        if (values.length < 2) return 1;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 1 - stdDev / mean);
    }

    // 학습 패턴 분석 메서드들
    private analyzeVisualLearningPatterns(memory: ConversationMemory): LearningPattern {
        const visualEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('diagram') ||
            entry.user_input.toLowerCase().includes('chart') ||
            entry.user_input.toLowerCase().includes('visual') ||
            entry.user_input.toLowerCase().includes('그림') ||
            entry.user_input.toLowerCase().includes('차트')
        );
        
        return {
            pattern_type: 'visual',
            frequency: visualEntries.length,
            effectiveness: this.calculatePatternEffectiveness(visualEntries),
            preferred_time: this.calculatePreferredTime(visualEntries),
            session_length: this.calculateAverageSessionLength(visualEntries),
            topics: this.extractTopics(visualEntries),
            confidence_boost: this.calculateConfidenceBoost(visualEntries)
        };
    }

    private analyzeAuditoryLearningPatterns(memory: ConversationMemory): LearningPattern {
        const auditoryEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('explain') ||
            entry.user_input.toLowerCase().includes('tell me') ||
            entry.user_input.toLowerCase().includes('설명') ||
            entry.user_input.toLowerCase().includes('이야기')
        );
        
        return {
            pattern_type: 'auditory',
            frequency: auditoryEntries.length,
            effectiveness: this.calculatePatternEffectiveness(auditoryEntries),
            preferred_time: this.calculatePreferredTime(auditoryEntries),
            session_length: this.calculateAverageSessionLength(auditoryEntries),
            topics: this.extractTopics(auditoryEntries),
            confidence_boost: this.calculateConfidenceBoost(auditoryEntries)
        };
    }

    private analyzeKinestheticLearningPatterns(memory: ConversationMemory): LearningPattern {
        const kinestheticEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('practice') ||
            entry.user_input.toLowerCase().includes('exercise') ||
            entry.user_input.toLowerCase().includes('실습') ||
            entry.user_input.toLowerCase().includes('연습')
        );
        
        return {
            pattern_type: 'kinesthetic',
            frequency: kinestheticEntries.length,
            effectiveness: this.calculatePatternEffectiveness(kinestheticEntries),
            preferred_time: this.calculatePreferredTime(kinestheticEntries),
            session_length: this.calculateAverageSessionLength(kinestheticEntries),
            topics: this.extractTopics(kinestheticEntries),
            confidence_boost: this.calculateConfidenceBoost(kinestheticEntries)
        };
    }

    private analyzeReadingLearningPatterns(memory: ConversationMemory): LearningPattern {
        const readingEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('read') ||
            entry.user_input.toLowerCase().includes('documentation') ||
            entry.user_input.toLowerCase().includes('읽기') ||
            entry.user_input.toLowerCase().includes('문서')
        );
        
        return {
            pattern_type: 'reading',
            frequency: readingEntries.length,
            effectiveness: this.calculatePatternEffectiveness(readingEntries),
            preferred_time: this.calculatePreferredTime(readingEntries),
            session_length: this.calculateAverageSessionLength(readingEntries),
            topics: this.extractTopics(readingEntries),
            confidence_boost: this.calculateConfidenceBoost(readingEntries)
        };
    }

    private analyzeSocialLearningPatterns(memory: ConversationMemory): LearningPattern {
        const socialEntries = memory.conversation_history.filter(entry => 
            entry.user_input.toLowerCase().includes('discuss') ||
            entry.user_input.toLowerCase().includes('compare') ||
            entry.user_input.toLowerCase().includes('토론') ||
            entry.user_input.toLowerCase().includes('비교')
        );
        
        return {
            pattern_type: 'social',
            frequency: socialEntries.length,
            effectiveness: this.calculatePatternEffectiveness(socialEntries),
            preferred_time: this.calculatePreferredTime(socialEntries),
            session_length: this.calculateAverageSessionLength(socialEntries),
            topics: this.extractTopics(socialEntries),
            confidence_boost: this.calculateConfidenceBoost(socialEntries)
        };
    }

    // 패턴 분석 헬퍼 메서드들
    private calculatePatternEffectiveness(entries: any[]): number {
        if (entries.length === 0) return 0;
        
        const satisfactionScores = entries
            .map(entry => entry.user_feedback?.rating || 3)
            .filter(score => score > 0);
        
        return satisfactionScores.length > 0 
            ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length / 5
            : 0.6;
    }

    private calculatePreferredTime(entries: any[]): string {
        if (entries.length === 0) return 'unknown';
        
        const hours = entries.map(entry => new Date(entry.timestamp).getHours());
        const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
        
        if (avgHour < 12) return 'morning';
        if (avgHour < 18) return 'afternoon';
        return 'evening';
    }

    private calculateAverageSessionLength(entries: any[]): number {
        if (entries.length < 2) return 0;
        
        const firstEntry = entries[0];
        const lastEntry = entries[entries.length - 1];
        
        return (new Date(lastEntry.timestamp).getTime() - new Date(firstEntry.timestamp).getTime()) / (1000 * 60);
    }

    private extractTopics(entries: any[]): string[] {
        const topics = new Set<string>();
        
        entries.forEach(entry => {
            if (entry.context?.current_topic) {
                topics.add(entry.context.current_topic);
            }
        });
        
        return Array.from(topics);
    }

    private calculateConfidenceBoost(entries: any[]): number {
        if (entries.length === 0) return 0;
        
        const confidenceScores = entries
            .map(entry => entry.understanding_result?.confidence_score || 0.5)
            .filter(score => score > 0);
        
        return confidenceScores.length > 0 
            ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
            : 0.5;
    }

    // 기술 격차 분석 메서드들
    private analyzeProgrammingSkillGap(memory: ConversationMemory, metrics: PerformanceMetrics): SkillGap {
        const programmingEntries = memory.conversation_history.filter(entry => 
            entry.understanding_result?.semantic_analysis?.domain_classification?.primary_domain === 'programming'
        );
        
        const currentLevel = programmingEntries.length > 0 ? 0.6 : 0.3;
        const requiredLevel = 0.8;
        
        return {
            skill_name: '프로그래밍',
            current_level: currentLevel,
            required_level: requiredLevel,
            gap_size: requiredLevel - currentLevel,
            impact_priority: currentLevel < 0.5 ? 'high' : 'medium',
            learning_difficulty: 0.7,
            estimated_time_to_master: 30,
            related_concepts: ['functions', 'classes', 'algorithms', 'data structures'],
            suggested_resources: ['프로그래밍 기초 튜토리얼', '실습 프로젝트', '코드 리뷰']
        };
    }

    private analyzeWebDevelopmentSkillGap(memory: ConversationMemory, metrics: PerformanceMetrics): SkillGap {
        const webDevEntries = memory.conversation_history.filter(entry => 
            entry.understanding_result?.semantic_analysis?.domain_classification?.primary_domain === 'web_development'
        );
        
        const currentLevel = webDevEntries.length > 0 ? 0.7 : 0.4;
        const requiredLevel = 0.8;
        
        return {
            skill_name: '웹 개발',
            current_level: currentLevel,
            required_level: requiredLevel,
            gap_size: requiredLevel - currentLevel,
            impact_priority: currentLevel < 0.6 ? 'high' : 'medium',
            learning_difficulty: 0.6,
            estimated_time_to_master: 25,
            related_concepts: ['HTML', 'CSS', 'JavaScript', 'React'],
            suggested_resources: ['웹 개발 튜토리얼', '프론트엔드 프로젝트', '반응형 디자인']
        };
    }

    private analyzeProblemSolvingSkillGap(memory: ConversationMemory, metrics: PerformanceMetrics): SkillGap {
        const problemSolvingEntries = memory.conversation_history.filter(entry => 
            entry.understanding_result?.intent_clarification?.primary_intent === 'problem_solving'
        );
        
        const currentLevel = metrics.cognitive_load.problem_solving_speed;
        const requiredLevel = 0.8;
        
        return {
            skill_name: '문제 해결',
            current_level: currentLevel,
            required_level: requiredLevel,
            gap_size: requiredLevel - currentLevel,
            impact_priority: currentLevel < 0.5 ? 'high' : 'medium',
            learning_difficulty: 0.8,
            estimated_time_to_master: 40,
            related_concepts: ['알고리즘', '디버깅', '최적화', '시스템 설계'],
            suggested_resources: ['알고리즘 문제 풀이', '디버깅 연습', '시스템 설계 실습']
        };
    }

    private analyzeConceptUnderstandingGap(memory: ConversationMemory, metrics: PerformanceMetrics): SkillGap {
        const currentLevel = metrics.cognitive_load.concept_integration;
        const requiredLevel = 0.8;
        
        return {
            skill_name: '개념 이해',
            current_level: currentLevel,
            required_level: requiredLevel,
            gap_size: requiredLevel - currentLevel,
            impact_priority: currentLevel < 0.5 ? 'critical' : 'medium',
            learning_difficulty: 0.6,
            estimated_time_to_master: 35,
            related_concepts: ['기본 개념', '원리 이해', '지식 연결'],
            suggested_resources: ['개념 설명 문서', '기초 튜토리얼', '예시 학습']
        };
    }

    // 예측 메서드들
    private predictCompletionRate(request: PerformanceAnalyticsRequest, metrics: PerformanceMetrics): PerformancePrediction {
        const currentRate = metrics.learning_progress.completion_rate;
        const predictedRate = Math.min(1.0, currentRate + 0.1); // 10% 증가 예측
        
        return {
            metric: 'completion_rate',
            current_value: currentRate,
            predicted_value: predictedRate,
            confidence: 0.7,
            timeframe: 7,
            factors: [
                {
                    factor_name: '현재 진행률',
                    impact: 0.3,
                    confidence: 0.8,
                    description: '현재 완료율이 높을수록 향후 완료 가능성 증가'
                },
                {
                    factor_name: '학습 참여도',
                    impact: 0.4,
                    confidence: 0.7,
                    description: '높은 참여도는 완료율 향상에 긍정적 영향'
                }
            ],
            risk_level: currentRate < 0.5 ? 'high' : 'medium'
        };
    }

    private predictSatisfactionScore(request: PerformanceAnalyticsRequest, metrics: PerformanceMetrics): PerformancePrediction {
        const currentScore = metrics.satisfaction_score.average;
        const predictedScore = Math.min(5.0, currentScore + 0.2);
        
        return {
            metric: 'satisfaction_score',
            current_value: currentScore,
            predicted_value: predictedScore,
            confidence: 0.6,
            timeframe: 14,
            factors: [
                {
                    factor_name: '현재 만족도',
                    impact: 0.5,
                    confidence: 0.8,
                    description: '현재 만족도가 향후 만족도에 큰 영향'
                }
            ],
            risk_level: currentScore < 3.0 ? 'high' : 'low'
        };
    }

    private predictSkillMastery(request: PerformanceAnalyticsRequest, metrics: PerformanceMetrics): PerformancePrediction {
        const currentMastery = metrics.learning_progress.mastery_level;
        const predictedMastery = Math.min(1.0, currentMastery + 0.15);
        
        return {
            metric: 'skill_mastery',
            current_value: currentMastery,
            predicted_value: predictedMastery,
            confidence: 0.8,
            timeframe: 30,
            factors: [
                {
                    factor_name: '학습 효율성',
                    impact: 0.6,
                    confidence: 0.7,
                    description: '높은 학습 효율성이 숙련도 향상에 긍정적 영향'
                }
            ],
            risk_level: currentMastery < 0.5 ? 'high' : 'medium'
        };
    }

    private predictLearningEfficiency(request: PerformanceAnalyticsRequest, metrics: PerformanceMetrics): PerformancePrediction {
        const currentEfficiency = this.calculateLearningEfficiency(metrics, []);
        const predictedEfficiency = Math.min(100, currentEfficiency + 5);
        
        return {
            metric: 'learning_efficiency',
            current_value: currentEfficiency,
            predicted_value: predictedEfficiency,
            confidence: 0.6,
            timeframe: 21,
            factors: [
                {
                    factor_name: '학습 패턴',
                    impact: 0.4,
                    confidence: 0.6,
                    description: '효과적인 학습 패턴이 효율성 향상에 도움'
                }
            ],
            risk_level: currentEfficiency < 50 ? 'high' : 'low'
        };
    }

    // 종합 점수 계산 메서드들
    private calculateOverallScore(metrics: PerformanceMetrics, patterns: LearningPattern[]): number {
        const satisfactionWeight = 0.3;
        const completionWeight = 0.25;
        const engagementWeight = 0.2;
        const efficiencyWeight = 0.15;
        const masteryWeight = 0.1;
        
        const satisfactionScore = metrics.satisfaction_score.average / 5;
        const completionScore = metrics.learning_progress.completion_rate;
        const engagementScore = (metrics.engagement_metrics.interaction_frequency + metrics.engagement_metrics.topic_diversity) / 2;
        const efficiencyScore = this.calculateLearningEfficiency(metrics, patterns) / 100;
        const masteryScore = metrics.learning_progress.mastery_level;
        
        return (
            satisfactionScore * satisfactionWeight +
            completionScore * completionWeight +
            engagementScore * engagementWeight +
            efficiencyScore * efficiencyWeight +
            masteryScore * masteryWeight
        ) * 100;
    }

    private calculateLearningEfficiency(metrics: PerformanceMetrics, patterns: LearningPattern[]): number {
        const retentionWeight = 0.3;
        const applicationWeight = 0.3;
        const complexityWeight = 0.2;
        const speedWeight = 0.2;
        
        const retentionScore = metrics.learning_progress.retention_rate;
        const applicationScore = metrics.learning_progress.application_rate;
        const complexityScore = metrics.cognitive_load.complexity_handling;
        const speedScore = metrics.cognitive_load.problem_solving_speed;
        
        return (
            retentionScore * retentionWeight +
            applicationScore * applicationWeight +
            complexityScore * complexityWeight +
            speedScore * speedWeight
        ) * 100;
    }

    private assessEngagementLevel(metrics: PerformanceMetrics): 'low' | 'medium' | 'high' | 'excellent' {
        const engagementScore = (
            metrics.engagement_metrics.session_duration / 60 + // 시간당 정규화
            metrics.engagement_metrics.interaction_frequency * 10 + // 빈도 정규화
            metrics.engagement_metrics.topic_diversity * 100 + // 다양성 정규화
            metrics.engagement_metrics.depth_of_questions / 100 // 깊이 정규화
        ) / 4;
        
        if (engagementScore > 0.8) return 'excellent';
        if (engagementScore > 0.6) return 'high';
        if (engagementScore > 0.4) return 'medium';
        return 'low';
    }

    private analyzeProgressTrend(request: PerformanceAnalyticsRequest): 'declining' | 'stable' | 'improving' | 'accelerating' {
        const history = this.performanceHistory.get(request.user_id) || [];
        
        if (history.length < 3) return 'stable';
        
        const recentScores = history.slice(-3).map(result => result.overall_score);
        const earlierScores = history.slice(-6, -3).map(result => result.overall_score);
        
        if (earlierScores.length < 3) return 'stable';
        
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
        
        const change = (recentAvg - earlierAvg) / earlierAvg;
        
        if (change > 0.2) return 'accelerating';
        if (change > 0.05) return 'improving';
        if (change < -0.05) return 'declining';
        return 'stable';
    }

    // 유틸리티 메서드들
    private savePerformanceHistory(userId: string, result: PerformanceAnalyticsResult): void {
        if (!this.performanceHistory.has(userId)) {
            this.performanceHistory.set(userId, []);
        }
        
        const history = this.performanceHistory.get(userId)!;
        history.push(result);
        
        // 최근 10개 결과만 유지
        if (history.length > 10) {
            history.shift();
        }
    }

    private generateFallbackResult(): PerformanceAnalyticsResult {
        return {
            overall_score: 50,
            learning_efficiency: 50,
            engagement_level: 'medium',
            progress_trend: 'stable',
            performance_metrics: {
                response_time: { average: 0, trend: 'stable', percentile: 50 },
                satisfaction_score: { average: 3, trend: 'stable', consistency: 0.5 },
                engagement_metrics: { session_duration: 0, interaction_frequency: 0, topic_diversity: 0, depth_of_questions: 0 },
                learning_progress: { completion_rate: 0, retention_rate: 0, application_rate: 0, mastery_level: 0 },
                cognitive_load: { complexity_handling: 0, problem_solving_speed: 0, concept_integration: 0 }
            },
            learning_patterns: [],
            skill_gaps: [],
            recommendations: [],
            predictions: [],
            insights: []
        };
    }

    private initializeBenchmarkData(): void {
        // 벤치마크 데이터 초기화
        this.benchmarkData.set('response_time', {
            excellent: 1.0,
            good: 2.0,
            average: 3.0,
            poor: 5.0
        });
        
        this.benchmarkData.set('satisfaction_score', {
            excellent: 4.5,
            good: 4.0,
            average: 3.5,
            poor: 3.0
        });
    }

    private initializePredictionModels(): void {
        // 예측 모델 초기화 (간단한 구현)
        this.predictionModels.set('completion_rate', {
            type: 'linear',
            parameters: { slope: 0.1, intercept: 0.5 }
        });
        
        this.predictionModels.set('satisfaction_score', {
            type: 'linear',
            parameters: { slope: 0.05, intercept: 3.0 }
        });
    }
}

const advancedPerformanceAnalyticsService = new AdvancedPerformanceAnalyticsService();
export default advancedPerformanceAnalyticsService;
