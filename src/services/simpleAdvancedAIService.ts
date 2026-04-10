export interface SimpleAdvancedAIResponse {
    content: string;
    confidence: number;
    learningScore: number;
    adaptationLevel: number;
    recommendations: string[];
    nextActions: string[];
    userInsights: {
        preferences: string[];
        behaviorPatterns: string[];
        improvementAreas: string[];
    };
}

export interface SimpleUserProfile {
    expertise: string[];
    interests: string[];
    communicationStyle: string;
    responsePreference: string;
    totalInteractions: number;
}

export class SimpleAdvancedAIService {
    private userData: Map<string, Record<string, unknown>[]> = new Map();

    async generateAdvancedResponse(
        message: string,
        userId: string,
        baseResponse: string,
        nlpAnalysis: Record<string, unknown>
    ): Promise<SimpleAdvancedAIResponse> {
        // 사용자 데이터 업데이트
        this.updateUserData(userId, message, baseResponse, nlpAnalysis);

        // 기본 분석
        const confidence = this.calculateConfidence(message, nlpAnalysis);
        const learningScore = this.calculateLearningScore(userId);
        const adaptationLevel = this.calculateAdaptationLevel(userId);

        // 추천사항 생성
        const recommendations = this.generateRecommendations(message, nlpAnalysis);
        const nextActions = this.generateNextActions(message, nlpAnalysis);

        // 사용자 인사이트
        const userInsights = this.generateUserInsights(userId, message);

        return {
            content: baseResponse,
            confidence,
            learningScore,
            adaptationLevel,
            recommendations,
            nextActions,
            userInsights
        };
    }

    getUserProfile(userId: string): SimpleUserProfile {
        const userData = this.userData.get(userId) || [];

        return {
            expertise: ['AI', '기술', '분석'],
            interests: ['뉴스', '트렌드', '인사이트'],
            communicationStyle: 'casual',
            responsePreference: 'detailed',
            totalInteractions: userData.length
        };
    }

    private updateUserData(userId: string, message: string, response: string, nlpAnalysis: Record<string, unknown>) {
        const userData = this.userData.get(userId) || [];
        userData.push({
            message,
            response,
            nlpAnalysis,
            timestamp: new Date()
        });
        this.userData.set(userId, userData);
    }

    private calculateConfidence(message: string, nlpAnalysis: Record<string, unknown>): number {
        let confidence = 0.7; // 기본 신뢰도

        if (Array.isArray(nlpAnalysis?.keywords) && nlpAnalysis.keywords.length > 0) {
            confidence += 0.1;
        }

        if (message.length > 20) {
            confidence += 0.1;
        }

        if (nlpAnalysis?.sentiment) {
            confidence += 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    private calculateLearningScore(userId: string): number {
        const userData = this.userData.get(userId) || [];
        return Math.min(userData.length * 0.1, 1.0);
    }

    private calculateAdaptationLevel(userId: string): number {
        const userData = this.userData.get(userId) || [];
        return Math.min(userData.length * 0.05, 1.0);
    }

    private generateRecommendations(message: string, nlpAnalysis: Record<string, unknown>): string[] {
        const recommendations: string[] = [];

        if (message.toLowerCase().includes('원베일리')) {
            recommendations.push('원베일리 관련 최신 뉴스를 검색해보세요');
            recommendations.push('시장 동향 분석을 통해 투자 전략을 수립하세요');
        }

        if (nlpAnalysis?.sentiment === 'negative') {
            recommendations.push('부정적인 감정이 감지되었습니다. 긍정적인 관점도 고려해보세요');
        }

        if (message.length < 10) {
            recommendations.push('더 구체적인 질문을 하시면 더 정확한 답변을 받을 수 있습니다');
        }

        return recommendations;
    }

    private generateNextActions(message: string, _nlpAnalysis: Record<string, unknown>): string[] {
        const actions: string[] = [];

        if (message.toLowerCase().includes('뉴스')) {
            actions.push('뉴스 검색 실행');
            actions.push('관련 기사 분석');
        }

        if (message.toLowerCase().includes('분석')) {
            actions.push('심화 분석 수행');
            actions.push('데이터 시각화 생성');
        }

        actions.push('대화 기록 저장');
        actions.push('사용자 선호도 업데이트');

        return actions;
    }

    private generateUserInsights(userId: string, _message: string): {
        preferences: string[];
        behaviorPatterns: string[];
        improvementAreas: string[];
    } {
        const _userData = this.userData.get(userId) || [];

        const preferences = [
            '상세한 분석을 선호함',
            '실용적인 정보를 중시함'
        ];

        const behaviorPatterns = [
            '키워드 기반 질문을 자주 함',
            '분석 결과를 요구하는 경향이 있음'
        ];

        const improvementAreas = [
            '더 구체적인 질문하기',
            '후속 질문을 통한 심화 학습'
        ];

        return {
            preferences,
            behaviorPatterns,
            improvementAreas
        };
    }
}

export const simpleAdvancedAIService = new SimpleAdvancedAIService();
