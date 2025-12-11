/**
 * 학습 피드백 시스템
 * 사용자 상호작용을 통해 AI의 응답 품질을 지속적으로 개선하는 시스템
 */

export interface FeedbackData {
    messageId: string;
    userMessage: string;
    aiResponse: string;
    userFeedback: 'helpful' | 'partially_helpful' | 'not_helpful';
    feedbackDetails?: string;
    timestamp: Date;
    sessionId: string;
    projectId: string;
    attachedFiles?: string[];
}

export interface LearningMetrics {
    totalFeedbacks: number;
    positiveRate: number;
    averageHelpfulness: number;
    improvementTrend: number;
    commonIssues: string[];
    strengths: string[];
}

export interface ConversationPattern {
    pattern: string;
    frequency: number;
    successRate: number;
    context: string[];
    recommendedApproach: string;
}

class LearningFeedbackSystem {
    private feedbackHistory = new Map<string, FeedbackData[]>(); // projectId -> feedbacks
    private conversationPatterns = new Map<string, ConversationPattern>();
    private learningInsights = new Map<string, any>(); // projectId -> insights

    // 피드백 저장
    recordFeedback(feedback: FeedbackData) {
        const projectFeedbacks = this.feedbackHistory.get(feedback.projectId) || [];
        projectFeedbacks.push(feedback);
        this.feedbackHistory.set(feedback.projectId, projectFeedbacks);

        // 실시간 학습 업데이트
        this.updateLearningInsights(feedback);
        this.updateConversationPatterns(feedback);

        console.log('📊 학습 피드백 기록됨:', feedback.userFeedback);
    }

    // 학습 메트릭 계산
    calculateLearningMetrics(projectId: string): LearningMetrics {
        const feedbacks = this.feedbackHistory.get(projectId) || [];

        if (feedbacks.length === 0) {
            return {
                totalFeedbacks: 0,
                positiveRate: 0,
                averageHelpfulness: 0,
                improvementTrend: 0,
                commonIssues: [],
                strengths: []
            };
        }

        const helpfulCount = feedbacks.filter(f => f.userFeedback === 'helpful').length;
        const partiallyHelpfulCount = feedbacks.filter(f => f.userFeedback === 'partially_helpful').length;

        const positiveRate = helpfulCount / feedbacks.length;
        const averageHelpfulness = (helpfulCount * 1 + partiallyHelpfulCount * 0.5) / feedbacks.length;

        // 개선 트렌드 계산 (최근 10개 vs 이전 10개)
        const recentFeedbacks = feedbacks.slice(-10);
        const previousFeedbacks = feedbacks.slice(-20, -10);

        const recentPositiveRate = recentFeedbacks.length > 0 ?
            recentFeedbacks.filter(f => f.userFeedback === 'helpful').length / recentFeedbacks.length : 0;
        const previousPositiveRate = previousFeedbacks.length > 0 ?
            previousFeedbacks.filter(f => f.userFeedback === 'helpful').length / previousFeedbacks.length : 0;

        const improvementTrend = recentPositiveRate - previousPositiveRate;

        // 일반적인 문제점과 강점 분석
        const { commonIssues, strengths } = this.analyzeCommonPatterns(feedbacks);

        return {
            totalFeedbacks: feedbacks.length,
            positiveRate: Math.round(positiveRate * 100) / 100,
            averageHelpfulness: Math.round(averageHelpfulness * 100) / 100,
            improvementTrend: Math.round(improvementTrend * 100) / 100,
            commonIssues,
            strengths
        };
    }

    // 대화 패턴 분석
    private updateConversationPatterns(feedback: FeedbackData) {
        const messageType = this.classifyMessageType(feedback.userMessage);
        const pattern = this.conversationPatterns.get(messageType) || {
            pattern: messageType,
            frequency: 0,
            successRate: 0,
            context: [],
            recommendedApproach: ''
        };

        pattern.frequency += 1;
        const isSuccessful = feedback.userFeedback === 'helpful';
        pattern.successRate = (pattern.successRate * (pattern.frequency - 1) + (isSuccessful ? 1 : 0)) / pattern.frequency;

        // 컨텍스트 업데이트
        if (feedback.attachedFiles && feedback.attachedFiles.length > 0) {
            pattern.context.push('with_files');
        } else {
            pattern.context.push('text_only');
        }

        // 권장 접근법 업데이트
        pattern.recommendedApproach = this.generateRecommendedApproach(pattern);

        this.conversationPatterns.set(messageType, pattern);
    }

    // 메시지 유형 분류
    private classifyMessageType(message: string): string {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('요약') || lowerMessage.includes('정리')) {
            return 'summarization';
        }
        if (lowerMessage.includes('분석') || lowerMessage.includes('평가')) {
            return 'analysis';
        }
        if (lowerMessage.includes('어떻게') || lowerMessage.includes('방법')) {
            return 'how_to';
        }
        if (lowerMessage.includes('무엇') || lowerMessage.includes('뭐')) {
            return 'what_is';
        }
        if (lowerMessage.includes('왜') || lowerMessage.includes('이유')) {
            return 'explanation';
        }
        if (lowerMessage.includes('추천') || lowerMessage.includes('제안')) {
            return 'recommendation';
        }
        if (lowerMessage.includes('비교') || lowerMessage.includes('차이')) {
            return 'comparison';
        }

        return 'general_inquiry';
    }

    // 권장 접근법 생성
    private generateRecommendedApproach(pattern: ConversationPattern): string {
        if (pattern.successRate > 0.8) {
            return 'current_approach_effective';
        } else if (pattern.successRate < 0.4) {
            if (pattern.context.includes('with_files')) {
                return 'improve_file_analysis_integration';
            } else {
                return 'provide_more_detailed_context';
            }
        } else {
            return 'moderate_improvement_needed';
        }
    }

    // 일반적인 패턴 분석
    private analyzeCommonPatterns(feedbacks: FeedbackData[]): { commonIssues: string[], strengths: string[] } {
        const commonIssues: string[] = [];
        const strengths: string[] = [];

        const negativefeedbacks = feedbacks.filter(f => f.userFeedback === 'not_helpful');
        const positiveFeedbacks = feedbacks.filter(f => f.userFeedback === 'helpful');

        // 부정적 피드백 패턴 분석
        if (negativefeedbacks.length > 0) {
            const negativeTypes = negativefeedbacks.map(f => this.classifyMessageType(f.userMessage));
            const typeFrequency = this.calculateFrequency(negativeTypes);

            Object.entries(typeFrequency).forEach(([type, freq]) => {
                if (freq > negativeTypes.length * 0.3) {
                    commonIssues.push(`${type} 유형 질문에 대한 응답 개선 필요`);
                }
            });
        }

        // 긍정적 피드백 패턴 분석
        if (positiveFeedbacks.length > 0) {
            const positiveTypes = positiveFeedbacks.map(f => this.classifyMessageType(f.userMessage));
            const typeFrequency = this.calculateFrequency(positiveTypes);

            Object.entries(typeFrequency).forEach(([type, freq]) => {
                if (freq > positiveTypes.length * 0.4) {
                    strengths.push(`${type} 유형 질문에 대한 효과적 응답`);
                }
            });
        }

        return { commonIssues: commonIssues.slice(0, 3), strengths: strengths.slice(0, 3) };
    }

    // 빈도 계산
    private calculateFrequency(items: string[]): Record<string, number> {
        const frequency: Record<string, number> = {};
        items.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
        });
        return frequency;
    }

    // 학습 인사이트 업데이트
    private updateLearningInsights(feedback: FeedbackData) {
        const projectInsights = this.learningInsights.get(feedback.projectId) || {
            responseQualityTrend: [],
            userPreferences: {},
            successfulPatterns: [],
            improvementAreas: []
        };

        // 응답 품질 트렌드 추가
        const qualityScore = this.calculateQualityScore(feedback);
        projectInsights.responseQualityTrend.push({
            timestamp: feedback.timestamp,
            score: qualityScore,
            messageType: this.classifyMessageType(feedback.userMessage)
        });

        // 최근 20개만 유지
        if (projectInsights.responseQualityTrend.length > 20) {
            projectInsights.responseQualityTrend = projectInsights.responseQualityTrend.slice(-20);
        }

        // 사용자 선호도 학습
        this.updateUserPreferences(projectInsights.userPreferences, feedback);

        this.learningInsights.set(feedback.projectId, projectInsights);
    }

    // 품질 점수 계산
    private calculateQualityScore(feedback: FeedbackData): number {
        switch (feedback.userFeedback) {
            case 'helpful': return 1.0;
            case 'partially_helpful': return 0.6;
            case 'not_helpful': return 0.2;
            default: return 0.5;
        }
    }

    // 사용자 선호도 업데이트
    private updateUserPreferences(preferences: any, feedback: FeedbackData) {
        const messageType = this.classifyMessageType(feedback.userMessage);

        if (!preferences[messageType]) {
            preferences[messageType] = {
                totalCount: 0,
                positiveCount: 0,
                preferredResponseLength: 'medium',
                preferredDetailLevel: 'moderate'
            };
        }

        preferences[messageType].totalCount += 1;
        if (feedback.userFeedback === 'helpful') {
            preferences[messageType].positiveCount += 1;
        }

        // 응답 길이 선호도 추론
        const responseLength = feedback.aiResponse.length;
        if (feedback.userFeedback === 'helpful') {
            if (responseLength < 200) {
                preferences[messageType].preferredResponseLength = 'short';
            } else if (responseLength > 800) {
                preferences[messageType].preferredResponseLength = 'long';
            }
        }
    }

    // 스마트 응답 제안
    generateSmartSuggestions(userMessage: string, projectId: string): string[] {
        const messageType = this.classifyMessageType(userMessage);
        const pattern = this.conversationPatterns.get(messageType);
        const insights = this.learningInsights.get(projectId);

        const suggestions: string[] = [];

        if (pattern && pattern.successRate < 0.5) {
            suggestions.push(`이 유형의 질문에 대해서는 더 구체적인 정보를 제공해 주세요.`);
        }

        if (insights && insights.userPreferences[messageType]) {
            const prefs = insights.userPreferences[messageType];
            if (prefs.preferredResponseLength === 'short') {
                suggestions.push('간결한 답변을 선호하시는 것 같습니다.');
            } else if (prefs.preferredResponseLength === 'long') {
                suggestions.push('상세한 답변을 선호하시는 것 같습니다.');
            }
        }

        return suggestions;
    }

    // 학습 통계 조회
    getLearningStatistics(projectId: string) {
        const metrics = this.calculateLearningMetrics(projectId);
        const insights = this.learningInsights.get(projectId);
        const patterns = Array.from(this.conversationPatterns.values())
            .filter(p => p.frequency > 2)
            .sort((a, b) => b.frequency - a.frequency);

        return {
            metrics,
            recentTrend: insights?.responseQualityTrend?.slice(-10) || [],
            topPatterns: patterns.slice(0, 5),
            totalInteractions: this.feedbackHistory.get(projectId)?.length || 0
        };
    }

    // 프로젝트별 데이터 클리어
    clearProjectData(projectId: string) {
        this.feedbackHistory.delete(projectId);
        this.learningInsights.delete(projectId);
    }
}

const learningFeedbackSystem = new LearningFeedbackSystem();
export default learningFeedbackSystem;
export { LearningFeedbackSystem };
