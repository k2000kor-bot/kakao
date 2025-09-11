// AI 추천 시스템
export interface Recommendation {
    id: string;
    type: 'question' | 'topic' | 'action' | 'suggestion';
    title: string;
    description: string;
    confidence: number;
    category: string;
    tags: string[];
    metadata?: {
        usageCount?: number;
        lastUsed?: string;
        userRating?: number;
    };
}

export interface UserBehavior {
    messageContent: string;
    timestamp: string;
    sessionId: string;
    modelUsed: string;
    responseTime: number;
    userRating?: number;
    category?: string;
}

class RecommendationService {
    private userBehaviors: UserBehavior[] = [];
    private recommendations: Recommendation[] = [];
    private userPreferences: Map<string, number> = new Map();

    constructor() {
        this.initializeDefaultRecommendations();
    }

    private initializeDefaultRecommendations() {
        this.recommendations = [
            {
                id: '1',
                type: 'question',
                title: '코드 리뷰 요청',
                description: '현재 작성한 코드의 개선점을 찾아보세요',
                confidence: 0.9,
                category: 'programming',
                tags: ['코딩', '리뷰', '개선'],
                metadata: { usageCount: 0 }
            },
            {
                id: '2',
                type: 'question',
                title: '알고리즘 설명',
                description: '특정 알고리즘의 동작 원리를 이해해보세요',
                confidence: 0.85,
                category: 'programming',
                tags: ['알고리즘', '설명', '학습'],
                metadata: { usageCount: 0 }
            },
            {
                id: '3',
                type: 'topic',
                title: '최신 기술 트렌드',
                description: 'AI, 웹 개발, 모바일 앱의 최신 동향을 알아보세요',
                confidence: 0.8,
                category: 'technology',
                tags: ['트렌드', '기술', '최신'],
                metadata: { usageCount: 0 }
            },
            {
                id: '4',
                type: 'action',
                title: '프로젝트 계획 수립',
                description: '새로운 프로젝트의 계획과 구조를 설계해보세요',
                confidence: 0.75,
                category: 'planning',
                tags: ['계획', '프로젝트', '설계'],
                metadata: { usageCount: 0 }
            },
            {
                id: '5',
                type: 'suggestion',
                title: '성능 최적화',
                description: '코드나 시스템의 성능을 개선하는 방법을 찾아보세요',
                confidence: 0.7,
                category: 'optimization',
                tags: ['성능', '최적화', '개선'],
                metadata: { usageCount: 0 }
            }
        ];
    }

    // 사용자 행동 기록
    recordUserBehavior(behavior: UserBehavior): void {
        this.userBehaviors.push(behavior);
        this.updateUserPreferences(behavior);
        this.updateRecommendations();
    }

    // 사용자 선호도 업데이트
    private updateUserPreferences(behavior: UserBehavior): void {
        const words = behavior.messageContent.toLowerCase().split(/\s+/);
        const categories = this.extractCategories(behavior.messageContent);

        words.forEach(word => {
            const currentWeight = this.userPreferences.get(word) || 0;
            this.userPreferences.set(word, currentWeight + 1);
        });

        categories.forEach(category => {
            const currentWeight = this.userPreferences.get(category) || 0;
            this.userPreferences.set(category, currentWeight + 2); // 카테고리에 더 높은 가중치
        });
    }

    // 카테고리 추출
    private extractCategories(text: string): string[] {
        const categories: string[] = [];
        const lowerText = text.toLowerCase();

        if (lowerText.includes('코드') || lowerText.includes('프로그래밍') || lowerText.includes('개발')) {
            categories.push('programming');
        }
        if (lowerText.includes('알고리즘') || lowerText.includes('자료구조')) {
            categories.push('algorithms');
        }
        if (lowerText.includes('웹') || lowerText.includes('프론트엔드') || lowerText.includes('백엔드')) {
            categories.push('web-development');
        }
        if (lowerText.includes('AI') || lowerText.includes('머신러닝') || lowerText.includes('딥러닝')) {
            categories.push('ai-ml');
        }
        if (lowerText.includes('데이터') || lowerText.includes('분석')) {
            categories.push('data-analysis');
        }
        if (lowerText.includes('디자인') || lowerText.includes('UI') || lowerText.includes('UX')) {
            categories.push('design');
        }

        return categories;
    }

    // 추천 업데이트
    private updateRecommendations(): void {
        this.recommendations.forEach(rec => {
            const relevanceScore = this.calculateRelevanceScore(rec);
            rec.confidence = Math.min(0.95, rec.confidence + relevanceScore * 0.1);
        });

        // 사용 빈도에 따른 가중치 조정
        this.recommendations.forEach(rec => {
            if (rec.metadata?.usageCount) {
                rec.confidence = Math.max(0.3, rec.confidence - rec.metadata.usageCount * 0.05);
            }
        });
    }

    // 관련성 점수 계산
    private calculateRelevanceScore(recommendation: Recommendation): number {
        let score = 0;
        const userWords = Array.from(this.userPreferences.keys());

        recommendation.tags.forEach(tag => {
            if (userWords.includes(tag.toLowerCase())) {
                score += this.userPreferences.get(tag.toLowerCase()) || 0;
            }
        });

        if (recommendation.category) {
            score += this.userPreferences.get(recommendation.category) || 0;
        }

        return Math.min(1, score / 10); // 0-1 범위로 정규화
    }

    // 개인화된 추천 가져오기
    getPersonalizedRecommendations(limit: number = 5): Recommendation[] {
        const sortedRecommendations = [...this.recommendations]
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);

        return sortedRecommendations;
    }

    // 카테고리별 추천
    getRecommendationsByCategory(category: string, limit: number = 3): Recommendation[] {
        return this.recommendations
            .filter(rec => rec.category === category)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);
    }

    // 컨텍스트 기반 추천
    getContextualRecommendations(context: string, limit: number = 3): Recommendation[] {
        const contextWords = context.toLowerCase().split(/\s+/);
        const contextCategories = this.extractCategories(context);

        const scoredRecommendations = this.recommendations.map(rec => {
            let score = 0;

            // 태그 매칭
            rec.tags.forEach(tag => {
                if (contextWords.includes(tag.toLowerCase())) {
                    score += 2;
                }
            });

            // 카테고리 매칭
            if (contextCategories.includes(rec.category)) {
                score += 3;
            }

            return { ...rec, score };
        });

        return scoredRecommendations
            .filter(rec => rec.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ score, ...rec }) => rec);
    }

    // 추천 사용 기록
    recordRecommendationUsage(recommendationId: string, rating?: number): void {
        const recommendation = this.recommendations.find(rec => rec.id === recommendationId);
        if (recommendation) {
            if (!recommendation.metadata) {
                recommendation.metadata = {};
            }
            recommendation.metadata.usageCount = (recommendation.metadata.usageCount || 0) + 1;
            recommendation.metadata.lastUsed = new Date().toISOString();
            if (rating !== undefined) {
                recommendation.metadata.userRating = rating;
            }
        }
    }

    // 새로운 추천 추가
    addRecommendation(recommendation: Omit<Recommendation, 'id'>): string {
        const id = Date.now().toString();
        const newRecommendation: Recommendation = {
            ...recommendation,
            id,
            metadata: { usageCount: 0 }
        };

        this.recommendations.push(newRecommendation);
        return id;
    }

    // 추천 제거
    removeRecommendation(recommendationId: string): boolean {
        const index = this.recommendations.findIndex(rec => rec.id === recommendationId);
        if (index !== -1) {
            this.recommendations.splice(index, 1);
            return true;
        }
        return false;
    }

    // 사용자 행동 분석
    getUserBehaviorAnalysis(): {
        totalInteractions: number;
        averageResponseTime: number;
        favoriteCategories: string[];
        activeHours: number[];
        modelPreferences: Map<string, number>;
    } {
        const totalInteractions = this.userBehaviors.length;
        const averageResponseTime = this.userBehaviors.reduce((sum, behavior) =>
            sum + behavior.responseTime, 0) / totalInteractions || 0;

        // 카테고리별 사용 빈도
        const categoryCounts = new Map<string, number>();
        this.userBehaviors.forEach(behavior => {
            const categories = this.extractCategories(behavior.messageContent);
            categories.forEach(category => {
                categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
            });
        });

        const favoriteCategories = Array.from(categoryCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category]) => category);

        // 활성 시간대 분석
        const activeHours = new Array(24).fill(0);
        this.userBehaviors.forEach(behavior => {
            const hour = new Date(behavior.timestamp).getHours();
            activeHours[hour]++;
        });

        // 모델 선호도
        const modelPreferences = new Map<string, number>();
        this.userBehaviors.forEach(behavior => {
            modelPreferences.set(behavior.modelUsed,
                (modelPreferences.get(behavior.modelUsed) || 0) + 1);
        });

        return {
            totalInteractions,
            averageResponseTime,
            favoriteCategories,
            activeHours,
            modelPreferences
        };
    }

    // 스마트 제안 생성
    generateSmartSuggestions(currentMessage: string): string[] {
        const suggestions: string[] = [];
        const lowerMessage = currentMessage.toLowerCase();

        // 메시지 길이에 따른 제안
        if (currentMessage.length < 10) {
            suggestions.push('더 구체적으로 질문해보세요');
            suggestions.push('예시를 포함해서 설명해주세요');
        }

        // 키워드 기반 제안
        if (lowerMessage.includes('코드') || lowerMessage.includes('프로그래밍')) {
            suggestions.push('코드 리뷰를 요청해보세요');
            suggestions.push('성능 최적화 방법을 물어보세요');
        }

        if (lowerMessage.includes('오류') || lowerMessage.includes('에러')) {
            suggestions.push('오류 로그를 함께 공유해보세요');
            suggestions.push('디버깅 방법을 요청해보세요');
        }

        if (lowerMessage.includes('설계') || lowerMessage.includes('아키텍처')) {
            suggestions.push('시스템 아키텍처를 설명해보세요');
            suggestions.push('디자인 패턴을 적용해보세요');
        }

        return suggestions.slice(0, 3);
    }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
