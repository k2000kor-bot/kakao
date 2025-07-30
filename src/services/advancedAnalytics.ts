/**
 * Advanced Analytics Service
 * 고도화된 분석 서비스
 * 
 * Features:
 * - Multi-dimensional context analysis
 * - Predictive conversation modeling
 * - Real-time optimization
 * - Advanced intelligence insights
 */

export interface AdvancedAnalysisResult {
    temporal_intelligence: {
        confidence: number;
        patterns: {
            rhythm: string;
            avg_interval_seconds: number;
            urgency_score: number;
            consistency_score: number;
        };
        insights: string[];
        metrics: {
            total_messages: number;
            time_span_hours: number;
            messages_per_hour: number;
        };
    };
    emotional_intelligence: {
        confidence: number;
        emotions: {
            positive: number;
            negative: number;
            neutral: number;
        };
        detailed_emotions: {
            joy: number;
            satisfaction: number;
            concern: number;
            frustration: number;
            professional: number;
        };
        insights: string[];
        metrics: {
            dominant_emotion: string;
            emotion_strength: number;
            emotion_volatility: number;
        };
    };
    social_intelligence: {
        confidence: number;
        dynamics: {
            participation_balance: number;
            hierarchy_detected: boolean;
            interaction_patterns: {
                pattern_type: string;
                turn_taking_balance: number;
            };
        };
        insights: string[];
    };
    cultural_intelligence: {
        confidence: number;
        cultural_markers: {
            collectivism: number;
            hierarchy: number;
            harmony: number;
            indirect_communication: number;
        };
        insights: string[];
    };
    strategic_intelligence: {
        confidence: number;
        strategies: {
            persuasion: number;
            information_seeking: number;
            consensus_building: number;
            problem_solving: number;
        };
        insights: string[];
        complexity: number;
    };
    overall_confidence: number;
    analysis_depth: string;
    processing_time: number;
}

export interface PredictiveInsight {
    prediction_type: string;
    prediction_content: string;
    confidence: number;
    time_horizon: string;
    supporting_evidence: string[];
    risk_factors: string[];
}

export interface OptimizationStrategy {
    goal: string;
    tactics: string[];
    priority: string;
    context_alignment: number;
    success_probability: number;
}

export interface RealTimeRecommendations {
    immediate_actions: string[];
    tone_adjustments: string[];
    content_suggestions: string[];
    strategic_pivots: string[];
}

class AdvancedAnalyticsService {
    private koreanPatterns = {
        emotion_indicators: {
            positive: ['좋아', '기쁘', '만족', '효과', '성공', '도움', '훌륭', '완벽'],
            negative: ['싫어', '화나', '실망', '문제', '어려', '걱정', '불만', '나쁘'],
            neutral: ['그래', '알겠', '이해', '확인', '검토', '논의', '생각', '보통']
        },
        urgency_markers: {
            high: ['긴급', '빨리', '즉시', '당장', '시급', '급하', '서둘러'],
            medium: ['빠른', '신속', '조속', '이른', '빨리'],
            low: ['천천히', '차근차근', '신중', '여유', '점진적']
        },
        social_hierarchy: {
            formal: ['습니다', '있습니다', '드립니다', '께서', '분께서'],
            semi_formal: ['해요', '이에요', '가요', '세요', '네요'],
            casual: ['해', '야', '어', '지', '다']
        },
        cultural_markers: {
            collectivism: ['우리', '함께', '같이', '모두', '전체', '공동'],
            hierarchy: ['선배', '후배', '상급자', '님', '께서', '분'],
            harmony: ['조화', '화합', '평화', '균형', '상생', '협력'],
            indirect: ['아마', '아닌가', '같습니다', '것 같아', '듯이', '처럼']
        },
        strategic_patterns: {
            persuasion: ['설득', '납득', '이해시키', '동의', '찬성'],
            information_seeking: ['궁금', '질문', '문의', '알고', '확인'],
            consensus_building: ['합의', '의견', '토론', '논의', '상의'],
            problem_solving: ['해결', '방법', '방안', '대책', '개선']
        }
    };

    /**
     * 고도화된 다차원 컨텍스트 분석
     */
    async analyzeAdvancedContext(
        messages: any[],
        participants: string[],
        analysisDepth: string = 'expert'
    ): Promise<AdvancedAnalysisResult> {
        const startTime = performance.now();

        try {
            // 각 차원별 분석 수행
            const temporalAnalysis = this.analyzeTemporalIntelligence(messages);
            const emotionalAnalysis = this.analyzeEmotionalIntelligence(messages);
            const socialAnalysis = this.analyzeSocialIntelligence(messages, participants);
            const culturalAnalysis = this.analyzeCulturalIntelligence(messages);
            const strategicAnalysis = this.analyzeStrategicIntelligence(messages, analysisDepth);

            // 전체 신뢰도 계산
            const confidenceScores = [
                temporalAnalysis.confidence,
                emotionalAnalysis.confidence,
                socialAnalysis.confidence,
                culturalAnalysis.confidence,
                strategicAnalysis.confidence
            ];
            const overallConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

            const processingTime = performance.now() - startTime;

            return {
                temporal_intelligence: temporalAnalysis,
                emotional_intelligence: emotionalAnalysis,
                social_intelligence: socialAnalysis,
                cultural_intelligence: culturalAnalysis,
                strategic_intelligence: strategicAnalysis,
                overall_confidence: overallConfidence,
                analysis_depth: analysisDepth,
                processing_time: processingTime
            };

        } catch (error) {
            console.error('Advanced context analysis failed:', error);
            return this.createFallbackAnalysis(analysisDepth);
        }
    }

    /**
     * 시간적 지능 분석
     */
    private analyzeTemporalIntelligence(messages: any[]) {
        if (!messages || messages.length === 0) {
            return {
                confidence: 0.0,
                patterns: { rhythm: 'unknown', avg_interval_seconds: 0, urgency_score: 0, consistency_score: 0 },
                insights: ['데이터 부족'],
                metrics: { total_messages: 0, time_span_hours: 0, messages_per_hour: 0 }
            };
        }

        // 시간 간격 분석
        const timestamps = messages
            .map(msg => new Date(msg.timestamp))
            .filter(date => !isNaN(date.getTime()));

        if (timestamps.length < 2) {
            return {
                confidence: 0.3,
                patterns: { rhythm: 'insufficient_data', avg_interval_seconds: 0, urgency_score: 0.5, consistency_score: 0.5 },
                insights: ['시간 데이터 부족'],
                metrics: { total_messages: messages.length, time_span_hours: 0, messages_per_hour: 0 }
            };
        }

        // 응답 간격 계산
        const intervals = [];
        for (let i = 1; i < timestamps.length; i++) {
            const interval = (timestamps[i].getTime() - timestamps[i - 1].getTime()) / 1000; // seconds
            intervals.push(interval);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, interval) =>
            sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

        // 대화 리듬 분석
        let rhythm = 'slow';
        let urgencyScore = 0.3;

        if (avgInterval < 60) { // 1분 이내
            rhythm = 'rapid_fire';
            urgencyScore = 0.9;
        } else if (avgInterval < 300) { // 5분 이내
            rhythm = 'active';
            urgencyScore = 0.7;
        } else if (avgInterval < 1800) { // 30분 이내
            rhythm = 'moderate';
            urgencyScore = 0.5;
        }

        // 일관성 점수
        const consistencyScore = 1.0 / (1.0 + intervalVariance / 1000);

        // 시간대별 활동 분석
        const hourActivity: { [key: number]: number } = {};
        timestamps.forEach(ts => {
            const hour = ts.getHours();
            hourActivity[hour] = (hourActivity[hour] || 0) + 1;
        });

        const peakHour = Object.entries(hourActivity)
            .reduce((a, b) => hourActivity[parseInt(a[0])] > hourActivity[parseInt(b[0])] ? a : b)?.[0] || '12';

        const timeSpanHours = timestamps.length > 1 ?
            (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / (1000 * 60 * 60) : 0;

        const messagesPerHour = timeSpanHours > 0 ? messages.length / timeSpanHours : 0;

        const insights = [
            `대화 리듬: ${rhythm}`,
            `평균 응답 간격: ${Math.round(avgInterval)}초`,
            `주요 활동 시간: ${peakHour}시`,
            `대화 일관성: ${consistencyScore.toFixed(2)}`
        ];

        return {
            confidence: 0.8,
            patterns: {
                rhythm,
                avg_interval_seconds: avgInterval,
                urgency_score: urgencyScore,
                consistency_score: consistencyScore
            },
            insights,
            metrics: {
                total_messages: messages.length,
                time_span_hours: timeSpanHours,
                messages_per_hour: messagesPerHour
            }
        };
    }

    /**
     * 감정적 지능 분석
     */
    private analyzeEmotionalIntelligence(messages: any[]) {
        if (!messages || messages.length === 0) {
            return {
                confidence: 0.0,
                emotions: { positive: 0, negative: 0, neutral: 0 },
                detailed_emotions: { joy: 0, satisfaction: 0, concern: 0, frustration: 0, professional: 0 },
                insights: ['데이터 부족'],
                metrics: { dominant_emotion: 'unknown', emotion_strength: 0, emotion_volatility: 0 }
            };
        }

        const emotionScores = { positive: 0, negative: 0, neutral: 0 };
        const detailedEmotions = {
            joy: 0, satisfaction: 0, concern: 0, frustration: 0, professional: 0
        };

        const emotionTrajectory = [];

        for (const msg of messages) {
            const content = msg.content?.toLowerCase() || '';
            const msgEmotions = { positive: 0, negative: 0, neutral: 0 };

            // 기본 감정 분석
            for (const [emotionType, keywords] of Object.entries(this.koreanPatterns.emotion_indicators)) {
                const score = keywords.filter(keyword => content.includes(keyword)).length * 0.3;
                msgEmotions[emotionType as keyof typeof msgEmotions] = Math.min(1.0, score);
                emotionScores[emotionType as keyof typeof emotionScores] += msgEmotions[emotionType as keyof typeof msgEmotions];
            }

            // 세부 감정 분석
            if (['좋', '기쁘'].some(word => content.includes(word))) {
                detailedEmotions.joy += 0.5;
            }
            if (['만족', '효과'].some(word => content.includes(word))) {
                detailedEmotions.satisfaction += 0.5;
            }
            if (['걱정', '우려'].some(word => content.includes(word))) {
                detailedEmotions.concern += 0.5;
            }
            if (['답답', '힘들'].some(word => content.includes(word))) {
                detailedEmotions.frustration += 0.5;
            }
            if (['검토', '분석', '업무'].some(word => content.includes(word))) {
                detailedEmotions.professional += 0.5;
            }

            emotionTrajectory.push({
                timestamp: msg.timestamp,
                emotions: { ...msgEmotions }
            });
        }

        // 정규화
        const totalMessages = messages.length;
        Object.keys(emotionScores).forEach(emotion => {
            emotionScores[emotion as keyof typeof emotionScores] /= totalMessages;
        });

        Object.keys(detailedEmotions).forEach(emotion => {
            detailedEmotions[emotion as keyof typeof detailedEmotions] =
                Math.min(1.0, detailedEmotions[emotion as keyof typeof detailedEmotions] / totalMessages);
        });

        // 감정 변화율 계산
        let emotionVolatility = 0.0;
        if (emotionTrajectory.length > 1) {
            const changes = [];
            for (let i = 1; i < emotionTrajectory.length; i++) {
                const prevEmotions = emotionTrajectory[i - 1].emotions;
                const currEmotions = emotionTrajectory[i].emotions;
                const change = Object.keys(prevEmotions).reduce((sum, key) =>
                    sum + Math.abs(currEmotions[key as keyof typeof currEmotions] - prevEmotions[key as keyof typeof prevEmotions]), 0);
                changes.push(change);
            }
            emotionVolatility = changes.reduce((a, b) => a + b, 0) / changes.length;
        }

        // 지배적 감정
        const dominantEmotion = Object.entries(emotionScores)
            .reduce((a, b) => emotionScores[a[0] as keyof typeof emotionScores] > emotionScores[b[0] as keyof typeof emotionScores] ? a : b);

        const insights = [
            `지배적 감정: ${dominantEmotion[0]} (${dominantEmotion[1].toFixed(2)})`,
            `감정 변화율: ${emotionVolatility.toFixed(2)}`,
            `감정적 안정성: ${emotionVolatility < 0.3 ? '높음' : emotionVolatility < 0.6 ? '보통' : '낮음'}`
        ];

        return {
            confidence: 0.85,
            emotions: emotionScores,
            detailed_emotions: detailedEmotions,
            insights,
            metrics: {
                dominant_emotion: dominantEmotion[0],
                emotion_strength: dominantEmotion[1],
                emotion_volatility: emotionVolatility
            }
        };
    }

    /**
     * 사회적 지능 분석
     */
    private analyzeSocialIntelligence(messages: any[], participants: string[]) {
        if (!messages || messages.length === 0 || !participants || participants.length === 0) {
            return {
                confidence: 0.0,
                dynamics: {
                    participation_balance: 0,
                    hierarchy_detected: false,
                    interaction_patterns: { pattern_type: 'unknown', turn_taking_balance: 0 }
                },
                insights: ['데이터 부족']
            };
        }

        // 참여자별 통계
        const participantStats: { [key: string]: any } = {};
        participants.forEach(participant => {
            participantStats[participant] = {
                message_count: 0,
                total_length: 0,
                formality_score: 0
            };
        });

        let prevSender = null;
        for (const msg of messages) {
            const sender = msg.sender;
            const content = msg.content || '';

            if (sender && participantStats[sender]) {
                participantStats[sender].message_count += 1;
                participantStats[sender].total_length += content.length;

                // 격식도 분석
                let formality = 0;
                this.koreanPatterns.social_hierarchy.formal.forEach(marker => {
                    if (content.includes(marker)) formality += 0.3;
                });
                this.koreanPatterns.social_hierarchy.semi_formal.forEach(marker => {
                    if (content.includes(marker)) formality += 0.2;
                });
                participantStats[sender].formality_score += formality;
            }
            prevSender = sender;
        }

        // 통계 계산
        Object.keys(participantStats).forEach(sender => {
            const stats = participantStats[sender];
            if (stats.message_count > 0) {
                stats.avg_length = stats.total_length / stats.message_count;
                stats.formality_score /= stats.message_count;
            }
        });

        // 참여 균형도
        const messageCounts = Object.values(participantStats).map((stats: any) => stats.message_count);
        const participationBalance = this.calculateParticipationBalance(messageCounts);

        // 계층 구조 감지
        const hierarchyDetected = Object.values(participantStats)
            .some((stats: any) => stats.formality_score > 0.5);

        // 상호작용 패턴
        const speakerSequence = messages.map(msg => msg.sender);
        const uniqueSpeakers = new Set(speakerSequence).size;
        const turnTakingBalance = uniqueSpeakers / messages.length;

        let patternType = 'low_interaction';
        if (turnTakingBalance > 0.3) {
            patternType = 'highly_interactive';
        } else if (turnTakingBalance > 0.1) {
            patternType = 'moderately_interactive';
        }

        const insights = [
            `참여 균형도: ${participationBalance.toFixed(2)}`,
            `계층 구조: ${hierarchyDetected ? '감지됨' : '평등함'}`,
            `상호작용: ${patternType}`
        ];

        return {
            confidence: 0.9,
            dynamics: {
                participation_balance: participationBalance,
                hierarchy_detected: hierarchyDetected,
                interaction_patterns: {
                    pattern_type: patternType,
                    turn_taking_balance: turnTakingBalance
                }
            },
            insights
        };
    }

    /**
     * 문화적 지능 분석
     */
    private analyzeCulturalIntelligence(messages: any[]) {
        const culturalMarkers = {
            collectivism: 0,
            hierarchy: 0,
            harmony: 0,
            indirect_communication: 0
        };

        let totalScore = 0;

        for (const msg of messages) {
            const content = msg.content || '';

            // 각 문화적 차원 점수 계산
            Object.entries(this.koreanPatterns.cultural_markers).forEach(([dimension, keywords]) => {
                if (dimension in culturalMarkers) {
                    const score = keywords.filter(keyword => content.includes(keyword)).length * 0.2;
                    culturalMarkers[dimension as keyof typeof culturalMarkers] += score;
                }
            });
        }

        // 정규화
        const totalMessages = messages.length || 1;
        Object.keys(culturalMarkers).forEach(marker => {
            culturalMarkers[marker as keyof typeof culturalMarkers] =
                Math.min(1.0, culturalMarkers[marker as keyof typeof culturalMarkers] / totalMessages);
            totalScore += culturalMarkers[marker as keyof typeof culturalMarkers];
        });

        // 문화적 복잡성
        const culturalComplexity = Object.values(culturalMarkers).filter(score => score > 0.3).length;

        // 지배적 문화 특성
        const dominantTrait = Object.entries(culturalMarkers)
            .reduce((a, b) => culturalMarkers[a[0] as keyof typeof culturalMarkers] > culturalMarkers[b[0] as keyof typeof culturalMarkers] ? a : b);

        const insights = [
            `지배적 문화 특성: ${dominantTrait[0]} (${dominantTrait[1].toFixed(2)})`,
            `문화적 복잡성: ${culturalComplexity}/4`,
            `한국 문화 적합도: ${(totalScore / 4).toFixed(2)}`
        ];

        return {
            confidence: 0.75,
            cultural_markers: culturalMarkers,
            insights
        };
    }

    /**
     * 전략적 지능 분석
     */
    private analyzeStrategicIntelligence(messages: any[], analysisDepth: string) {
        const strategicPatterns = {
            persuasion: 0,
            information_seeking: 0,
            consensus_building: 0,
            problem_solving: 0
        };

        for (const msg of messages) {
            const content = msg.content || '';

            Object.entries(this.koreanPatterns.strategic_patterns).forEach(([pattern, keywords]) => {
                if (pattern in strategicPatterns) {
                    const score = keywords.filter(keyword => content.includes(keyword)).length * 0.3;
                    strategicPatterns[pattern as keyof typeof strategicPatterns] += score;
                }
            });
        }

        // 정규화
        const totalMessages = messages.length || 1;
        Object.keys(strategicPatterns).forEach(pattern => {
            strategicPatterns[pattern as keyof typeof strategicPatterns] =
                Math.min(1.0, strategicPatterns[pattern as keyof typeof strategicPatterns] / totalMessages);
        });

        // 전략적 복잡성
        const activeStrategies = Object.values(strategicPatterns).filter(score => score > 0.2);
        const strategicComplexity = activeStrategies.length;

        // 주요 전략
        const primaryStrategy = Object.entries(strategicPatterns)
            .reduce((a, b) => strategicPatterns[a[0] as keyof typeof strategicPatterns] > strategicPatterns[b[0] as keyof typeof strategicPatterns] ? a : b);

        // 고급 분석
        const advancedInsights = [];
        if (analysisDepth === 'genius') {
            if (strategicPatterns.consensus_building > 0.5 && strategicPatterns.problem_solving > 0.5) {
                advancedInsights.push('협력적 문제해결 패턴 감지');
            }
            if (strategicPatterns.information_seeking > 0.4) {
                advancedInsights.push('데이터 기반 의사결정 성향');
            }
        }

        const insights = [
            `주요 전략: ${primaryStrategy[0]} (${primaryStrategy[1].toFixed(2)})`,
            `전략적 복잡성: ${strategicComplexity}/4`,
            ...advancedInsights
        ];

        const confidence = analysisDepth === 'basic' ? 0.6 :
            analysisDepth === 'expert' ? 0.8 : 0.95;

        return {
            confidence,
            strategies: strategicPatterns,
            insights,
            complexity: strategicComplexity
        };
    }

    /**
     * 예측적 대화 모델링
     */
    async generateConversationPredictions(
        conversationHistory: any[],
        predictionHorizon: number = 5
    ): Promise<PredictiveInsight[]> {
        if (!conversationHistory || conversationHistory.length === 0) {
            return [{
                prediction_type: 'insufficient_data',
                prediction_content: '예측에 필요한 데이터가 부족합니다.',
                confidence: 0.0,
                time_horizon: 'unknown',
                supporting_evidence: [],
                risk_factors: ['데이터 부족']
            }];
        }

        const predictions: PredictiveInsight[] = [];
        const recentMessages = conversationHistory.slice(-5);

        // 주제 트렌드 예측
        predictions.push(this.predictTopicEvolution(recentMessages));

        // 감정 궤적 예측
        predictions.push(this.predictEmotionalTrajectory(recentMessages));

        // 참여도 예측
        predictions.push(this.predictEngagementLevel(recentMessages));

        // 갈등 예측
        predictions.push(this.predictPotentialConflicts(recentMessages));

        // 해결 기회 예측
        predictions.push(this.predictResolutionOpportunities(recentMessages));

        return predictions.slice(0, predictionHorizon);
    }

    /**
     * 실시간 대화 최적화
     */
    async optimizeConversationRealTime(
        currentMessage: any,
        conversationContext: any,
        optimizationGoals: string[] = ['harmony', 'efficiency', 'resolution']
    ): Promise<{
        strategies: OptimizationStrategy[];
        recommendations: RealTimeRecommendations;
        metrics: any;
    }> {
        const messages = [...(conversationContext.messages || [])];
        if (currentMessage) {
            messages.push(currentMessage);
        }

        // 컨텍스트 분석
        const contextAnalysis = await this.analyzeAdvancedContext(
            messages,
            conversationContext.participants || []
        );

        // 최적화 전략 생성
        const strategies: OptimizationStrategy[] = optimizationGoals.map(goal =>
            this.generateOptimizationStrategy(goal, contextAnalysis)
        );

        // 실시간 권장사항
        const recommendations = this.generateRealTimeRecommendations(contextAnalysis, currentMessage);

        // 성능 메트릭
        const metrics = {
            context_coherence: contextAnalysis.overall_confidence,
            optimization_urgency: this.calculateOptimizationUrgency(contextAnalysis),
            success_probability: this.estimateOptimizationSuccess(strategies)
        };

        return { strategies, recommendations, metrics };
    }

    // Helper methods
    private calculateParticipationBalance(messageCounts: number[]): number {
        if (!messageCounts || messageCounts.length <= 1) return 1.0;

        const n = messageCounts.length;
        const sortedCounts = [...messageCounts].sort((a, b) => a - b);
        const totalMessages = sortedCounts.reduce((a, b) => a + b, 0);

        if (totalMessages === 0) return 0.0;

        // Gini 계수의 역수로 균형도 계산
        const index = sortedCounts.map((_, i) => i + 1);
        const gini = (2 * sortedCounts.reduce((sum, count, i) => sum + (index[i] * count), 0)) /
            (n * totalMessages) - (n + 1) / n;

        return Math.max(0.0, Math.min(1.0, 1.0 - gini));
    }

    private predictTopicEvolution(messages: any[]): PredictiveInsight {
        const currentTopics = [];
        for (const msg of messages) {
            const content = msg.content || '';
            if (content.includes('시공사')) currentTopics.push('시공사_선정');
            if (content.includes('분담금') || content.includes('비용')) currentTopics.push('비용_관리');
            if (content.includes('총회') || content.includes('회의')) currentTopics.push('총회_운영');
        }

        let predictedTopic = '일반_운영_사항_논의';
        let confidence = 0.6;
        let evidence = ['정기 운영 회의 패턴'];
        let risks = ['논의 초점 분산'];

        if (currentTopics.includes('시공사_선정')) {
            predictedTopic = '시공사_계약_및_조건_협상';
            confidence = 0.8;
            evidence = ['시공사 선정 논의 진행 중', '계약 조건 논의 필요성'];
            risks = ['계약 조건 이견', '추가 비용 발생'];
        } else if (currentTopics.includes('비용_관리')) {
            predictedTopic = '분담금_납부_일정_확정';
            confidence = 0.75;
            evidence = ['비용 관련 논의 활발', '구체적 금액 산정 필요'];
            risks = ['분담금 부담 이의', '납부 일정 지연'];
        }

        return {
            prediction_type: 'topic_evolution',
            prediction_content: `다음 주요 논의 주제: ${predictedTopic}`,
            confidence,
            time_horizon: '단기 (1-3일)',
            supporting_evidence: evidence,
            risk_factors: risks
        };
    }

    private predictEmotionalTrajectory(messages: any[]): PredictiveInsight {
        // 간단한 감정 트렌드 분석
        const emotionScores = messages.map(msg => {
            const content = msg.content?.toLowerCase() || '';
            let score = 0;
            if (['좋아', '만족', '성공'].some(word => content.includes(word))) score += 0.5;
            if (['걱정', '문제', '어려'].some(word => content.includes(word))) score -= 0.5;
            return score;
        });

        const avgEmotion = emotionScores.reduce((a, b) => a + b, 0) / (emotionScores.length || 1);

        let prediction = '안정적 감정 상태 유지';
        let confidence = 0.7;
        let evidence = ['감정적 안정성'];
        let risks = ['예상치 못한 변화'];

        if (avgEmotion > 0.3) {
            prediction = '긍정적 분위기 지속 예상';
            confidence = 0.8;
            evidence = ['긍정적 표현 증가', '건설적 대화'];
            risks = ['과도한 낙관'];
        } else if (avgEmotion < -0.3) {
            prediction = '긴장감 증가 주의 필요';
            confidence = 0.85;
            evidence = ['부정적 표현 증가', '우려 증가'];
            risks = ['갈등 확산', '의사결정 지연'];
        }

        return {
            prediction_type: 'emotional_trajectory',
            prediction_content: prediction,
            confidence,
            time_horizon: '단기 (1-2일)',
            supporting_evidence: evidence,
            risk_factors: risks
        };
    }

    private predictEngagementLevel(messages: any[]): PredictiveInsight {
        const messageFrequency = messages.length / 24; // 가정: 24시간 기준

        let level = 'medium';
        let prediction = '적정 참여도 유지 예상';
        let confidence = 0.75;
        let evidence = ['안정적 메시지 빈도'];
        let risks = ['관심도 저하'];

        if (messageFrequency > 5) {
            level = 'high';
            prediction = '높은 참여도 지속 예상';
            confidence = 0.85;
            evidence = ['빈번한 메시지 교환'];
            risks = ['피로도 증가'];
        } else if (messageFrequency < 1) {
            level = 'low';
            prediction = '참여도 저하 우려';
            confidence = 0.8;
            evidence = ['메시지 빈도 감소'];
            risks = ['논의 중단', '참여자 이탈'];
        }

        return {
            prediction_type: 'engagement_level',
            prediction_content: `${level} 참여도 - ${prediction}`,
            confidence,
            time_horizon: '단기 (1-2일)',
            supporting_evidence: evidence,
            risk_factors: risks
        };
    }

    private predictPotentialConflicts(messages: any[]): PredictiveInsight {
        let conflictIndicators = 0;
        const evidence = [];

        for (const msg of messages) {
            const content = msg.content || '';
            if (['반대', '문제', '불만'].some(word => content.includes(word))) {
                conflictIndicators += 1;
                evidence.push('반대 의견 표명');
            }
            if (['걱정', '우려'].some(word => content.includes(word))) {
                conflictIndicators += 0.5;
                evidence.push('우려 사항 제기');
            }
        }

        const conflictRatio = conflictIndicators / (messages.length || 1);

        let riskLevel = 'low';
        let prediction = '낮은 갈등 위험';
        let confidence = 0.7;
        let risks = ['예상치 못한 이슈'];

        if (conflictRatio > 0.6) {
            riskLevel = 'high';
            prediction = '높은 갈등 위험 - 즉각적 중재 필요';
            confidence = 0.9;
            risks = ['논의 중단', '그룹 분열'];
        } else if (conflictRatio > 0.3) {
            riskLevel = 'medium';
            prediction = '중간 갈등 가능성 - 예방적 소통 필요';
            confidence = 0.75;
            risks = ['의견 대립 심화', '결정 지연'];
        }

        return {
            prediction_type: 'conflict_potential',
            prediction_content: `${riskLevel} 갈등 위험도 - ${prediction}`,
            confidence,
            time_horizon: '즉시-단기 (1일)',
            supporting_evidence: Array.from(new Set(evidence)),
            risk_factors: risks
        };
    }

    private predictResolutionOpportunities(messages: any[]): PredictiveInsight {
        let resolutionIndicators = 0;
        const evidence = [];

        for (const msg of messages) {
            const content = msg.content || '';
            if (['해결', '방법', '방안'].some(word => content.includes(word))) {
                resolutionIndicators += 1;
                evidence.push('해결 방안 모색');
            }
            if (['합의', '동의', '찬성'].some(word => content.includes(word))) {
                resolutionIndicators += 1;
                evidence.push('합의 의지 표명');
            }
            if (['협력', '함께'].some(word => content.includes(word))) {
                resolutionIndicators += 0.5;
                evidence.push('협력적 태도');
            }
        }

        const resolutionRatio = resolutionIndicators / (messages.length || 1);

        let opportunityLevel = 'medium';
        let prediction = '중간 수준 해결 기회';
        let confidence = 0.7;

        if (resolutionRatio > 0.5) {
            opportunityLevel = 'high';
            prediction = '높은 해결 가능성 - 적극적 추진';
            confidence = 0.85;
        } else if (resolutionRatio < 0.2) {
            opportunityLevel = 'low';
            prediction = '낮은 해결 가능성 - 새로운 접근 필요';
            confidence = 0.6;
        }

        return {
            prediction_type: 'resolution_opportunity',
            prediction_content: `${opportunityLevel} 해결 기회 - ${prediction}`,
            confidence,
            time_horizon: '단기-중기 (2-5일)',
            supporting_evidence: Array.from(new Set(evidence)),
            risk_factors: ['외부 변수', '새로운 이슈 등장']
        };
    }

    private generateOptimizationStrategy(goal: string, contextAnalysis: AdvancedAnalysisResult): OptimizationStrategy {
        const strategies = {
            harmony: {
                goal: '대화 조화 증진',
                tactics: ['감정 공감 표현', '중립적 어조 유지', '공통점 강조'],
                priority: contextAnalysis.emotional_intelligence.confidence < 0.6 ? 'high' : 'medium'
            },
            efficiency: {
                goal: '효율적 의사결정',
                tactics: ['명확한 선택지 제시', '시간 제약 설정', '우선순위 명시'],
                priority: contextAnalysis.temporal_intelligence.confidence > 0.7 ? 'high' : 'medium'
            },
            resolution: {
                goal: '갈등 해결',
                tactics: ['양방향 이해 촉진', '타협점 모색', '단계적 해결'],
                priority: contextAnalysis.social_intelligence.confidence < 0.6 ? 'high' : 'low'
            }
        };

        const baseStrategy = strategies[goal as keyof typeof strategies] || strategies.harmony;

        return {
            ...baseStrategy,
            context_alignment: contextAnalysis.overall_confidence,
            success_probability: contextAnalysis.overall_confidence * 0.8
        };
    }

    private generateRealTimeRecommendations(
        contextAnalysis: AdvancedAnalysisResult,
        currentMessage: any
    ): RealTimeRecommendations {
        const recommendations: RealTimeRecommendations = {
            immediate_actions: [],
            tone_adjustments: [],
            content_suggestions: [],
            strategic_pivots: []
        };

        // 감정 상태 기반 권장사항
        if (contextAnalysis.emotional_intelligence.confidence < 0.4) {
            recommendations.immediate_actions.push('감정적 지원 메시지 추가');
            recommendations.tone_adjustments.push('더 공감적인 어조 사용');
        }

        // 사회적 역학 기반 권장사항
        if (contextAnalysis.social_intelligence.confidence < 0.5) {
            recommendations.immediate_actions.push('참여 균형 조정 필요');
            recommendations.content_suggestions.push('모든 참여자 의견 수렴');
        }

        // 문화적 맥락 기반 권장사항
        if (contextAnalysis.cultural_intelligence.confidence > 0.7) {
            recommendations.tone_adjustments.push('문화적 맥락 맞는 표현 사용');
        }

        // 전략적 기회
        if (contextAnalysis.overall_confidence > 0.8) {
            recommendations.strategic_pivots.push('핵심 의사결정 시점 - 중요 안건 제기');
        }

        return recommendations;
    }

    private calculateOptimizationUrgency(contextAnalysis: AdvancedAnalysisResult): number {
        const urgencyFactors = [
            1.0 - contextAnalysis.overall_confidence,
            1.0 - contextAnalysis.emotional_intelligence.confidence,
            1.0 - contextAnalysis.social_intelligence.confidence
        ];

        return urgencyFactors.reduce((a, b) => a + b, 0) / urgencyFactors.length;
    }

    private estimateOptimizationSuccess(strategies: OptimizationStrategy[]): number {
        if (!strategies || strategies.length === 0) return 0.0;

        const successScores = strategies.map(strategy => {
            const contextAlignment = strategy.context_alignment || 0.5;
            const priorityWeight = strategy.priority === 'high' ? 1.0 :
                strategy.priority === 'medium' ? 0.7 : 0.5;
            return contextAlignment * priorityWeight;
        });

        return successScores.reduce((a, b) => a + b, 0) / successScores.length;
    }

    private createFallbackAnalysis(analysisDepth: string): AdvancedAnalysisResult {
        return {
            temporal_intelligence: {
                confidence: 0.1,
                patterns: { rhythm: 'unknown', avg_interval_seconds: 0, urgency_score: 0, consistency_score: 0 },
                insights: ['분석 실패'],
                metrics: { total_messages: 0, time_span_hours: 0, messages_per_hour: 0 }
            },
            emotional_intelligence: {
                confidence: 0.1,
                emotions: { positive: 0, negative: 0, neutral: 0 },
                detailed_emotions: { joy: 0, satisfaction: 0, concern: 0, frustration: 0, professional: 0 },
                insights: ['분석 실패'],
                metrics: { dominant_emotion: 'unknown', emotion_strength: 0, emotion_volatility: 0 }
            },
            social_intelligence: {
                confidence: 0.1,
                dynamics: {
                    participation_balance: 0,
                    hierarchy_detected: false,
                    interaction_patterns: { pattern_type: 'unknown', turn_taking_balance: 0 }
                },
                insights: ['분석 실패']
            },
            cultural_intelligence: {
                confidence: 0.1,
                cultural_markers: { collectivism: 0, hierarchy: 0, harmony: 0, indirect_communication: 0 },
                insights: ['분석 실패']
            },
            strategic_intelligence: {
                confidence: 0.1,
                strategies: { persuasion: 0, information_seeking: 0, consensus_building: 0, problem_solving: 0 },
                insights: ['분석 실패'],
                complexity: 0
            },
            overall_confidence: 0.1,
            analysis_depth: analysisDepth,
            processing_time: 0.0
        };
    }
}

// Export singleton instance
export const advancedAnalyticsService = new AdvancedAnalyticsService(); 