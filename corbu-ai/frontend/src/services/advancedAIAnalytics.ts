import { ChatSession } from '../types/chat';
import { Project } from '../types/project';

interface AnalyticsData {
    messageCount: number;
    responseTime: number;
    userSatisfaction: number;
    featureUsage: {
        [key: string]: number;
    };
    trends: {
        [key: string]: any;
    };
}

interface RealTimeMetrics {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

class AdvancedAIAnalytics {
    private analyticsData: Map<string, AnalyticsData> = new Map();
    private realTimeMetrics: RealTimeMetrics = {
        activeUsers: 0,
        requestsPerMinute: 0,
        averageResponseTime: 0,
        errorRate: 0,
        systemHealth: 'excellent'
    };

    // 실시간 메트릭 업데이트
    updateRealTimeMetrics(metrics: Partial<RealTimeMetrics>) {
        this.realTimeMetrics = { ...this.realTimeMetrics, ...metrics };
        this.broadcastMetrics();
    }

    // 분석 데이터 수집
    collectAnalytics(sessionId: string, data: Partial<AnalyticsData>) {
        const existing = this.analyticsData.get(sessionId) || {
            messageCount: 0,
            responseTime: 0,
            userSatisfaction: 0,
            featureUsage: {},
            trends: {}
        };

        this.analyticsData.set(sessionId, { ...existing, ...data });
    }

    // 고급 분석 실행
    async runAdvancedAnalysis(message: string, session?: ChatSession, project?: Project) {
        const analysis = {
            sentiment: this.analyzeSentiment(message),
            intent: this.detectIntent(message),
            complexity: this.analyzeComplexity(message),
            urgency: this.detectUrgency(message),
            context: this.extractContext(message, session, project),
            recommendations: this.generateRecommendations(message, session, project)
        };

        return analysis;
    }

    // 감정 분석
    private analyzeSentiment(message: string) {
        const positiveWords = ['좋다', '훌륭하다', '만족', '성공', '긍정', '희망'];
        const negativeWords = ['나쁘다', '실패', '불만', '부정', '우려', '문제'];

        const positiveCount = positiveWords.filter(word => message.includes(word)).length;
        const negativeCount = negativeWords.filter(word => message.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // 의도 감지
    private detectIntent(message: string) {
        if (message.includes('분석') || message.includes('검토')) return 'analysis';
        if (message.includes('예측') || message.includes('전망')) return 'prediction';
        if (message.includes('추천') || message.includes('제안')) return 'recommendation';
        if (message.includes('질문') || message.includes('궁금')) return 'question';
        return 'general';
    }

    // 복잡도 분석
    private analyzeComplexity(message: string) {
        const wordCount = message.split(' ').length;
        const sentenceCount = message.split(/[.!?]/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;

        if (avgWordsPerSentence > 15) return 'high';
        if (avgWordsPerSentence > 8) return 'medium';
        return 'low';
    }

    // 긴급도 감지
    private detectUrgency(message: string) {
        const urgentWords = ['긴급', '즉시', '바로', '당장', '시급'];
        const hasUrgentWords = urgentWords.some(word => message.includes(word));

        if (hasUrgentWords) return 'high';
        if (message.includes('빨리') || message.includes('빠르게')) return 'medium';
        return 'low';
    }

    // 컨텍스트 추출
    private extractContext(message: string, session?: ChatSession, project?: Project) {
        const context = {
            project: project?.name || 'unknown',
            session: session?.title || 'unknown',
            previousMessages: session?.messages?.length || 0,
            userPreferences: this.extractUserPreferences(session),
            domain: this.detectDomain(message)
        };

        return context;
    }

    // 사용자 선호도 추출
    private extractUserPreferences(session?: ChatSession) {
        if (!session?.messages) return {};

        const preferences = {
            responseStyle: 'detailed',
            analysisDepth: 'comprehensive',
            language: 'korean'
        };

        // 메시지 히스토리에서 선호도 분석
        const messages = session.messages;
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content.includes('간단히')) {
                preferences.responseStyle = 'concise';
            }
            if (lastMessage.content.includes('상세히')) {
                preferences.responseStyle = 'detailed';
            }
        }

        return preferences;
    }

    // 도메인 감지
    private detectDomain(message: string) {
        if (message.includes('건설') || message.includes('시공')) return 'construction';
        if (message.includes('부동산') || message.includes('매물')) return 'realestate';
        if (message.includes('투자') || message.includes('금융')) return 'finance';
        if (message.includes('기술') || message.includes('IT')) return 'technology';
        return 'general';
    }

    // 추천사항 생성
    private generateRecommendations(message: string, session?: ChatSession, project?: Project) {
        const recommendations = [];

        // 메시지 길이에 따른 추천
        if (message.length < 10) {
            recommendations.push('더 구체적인 질문을 해주시면 더 정확한 분석을 제공할 수 있습니다.');
        }

        // 프로젝트 컨텍스트에 따른 추천
        if (project?.name) {
            recommendations.push(`${project.name} 프로젝트와 관련된 추가 정보를 제공해주시면 더 맞춤형 분석이 가능합니다.`);
        }

        // 세션 히스토리에 따른 추천
        if (session?.messages && session.messages.length > 10) {
            recommendations.push('이전 대화 내용을 바탕으로 연속성 있는 분석을 제공하고 있습니다.');
        }

        return recommendations;
    }

    // 실시간 메트릭 브로드캐스트
    private broadcastMetrics() {
        if (typeof window !== 'undefined' && (window as any).postMessage) {
            (window as any).postMessage({
                type: 'REAL_TIME_METRICS',
                data: this.realTimeMetrics
            }, '*');
        }
    }

    // 분석 리포트 생성
    generateAnalyticsReport(sessionId: string) {
        const data = this.analyticsData.get(sessionId);
        if (!data) return null;

        return {
            sessionId,
            summary: {
                totalMessages: data.messageCount,
                averageResponseTime: data.responseTime,
                userSatisfaction: data.userSatisfaction,
                mostUsedFeatures: this.getMostUsedFeatures(data.featureUsage)
            },
            trends: data.trends,
            recommendations: this.generateReportRecommendations(data)
        };
    }

    // 가장 많이 사용된 기능 추출
    private getMostUsedFeatures(featureUsage: { [key: string]: number }) {
        return Object.entries(featureUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([feature, count]) => ({ feature, count }));
    }

    // 리포트 추천사항 생성
    private generateReportRecommendations(data: AnalyticsData) {
        const recommendations = [];

        if (data.responseTime > 5000) {
            recommendations.push('응답 시간이 다소 길어지고 있습니다. 시스템 최적화를 고려해보세요.');
        }

        if (data.userSatisfaction < 0.7) {
            recommendations.push('사용자 만족도가 낮습니다. 응답 품질 개선이 필요합니다.');
        }

        return recommendations;
    }

    // 실시간 메트릭 조회
    getRealTimeMetrics(): RealTimeMetrics {
        return this.realTimeMetrics;
    }

    // 전체 분석 데이터 조회
    getAllAnalyticsData(): Map<string, AnalyticsData> {
        return this.analyticsData;
    }
}

export default new AdvancedAIAnalytics();
