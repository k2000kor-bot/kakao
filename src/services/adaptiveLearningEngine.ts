import { ChatSession } from '../types/chat';
import { Project } from '../types/project';

interface LearningPattern {
    userId: string;
    preferredTopics: string[];
    responseStyle: 'detailed' | 'concise' | 'technical' | 'casual';
    interactionFrequency: number;
    averageMessageLength: number;
    commonQuestions: string[];
    lastUpdated: Date;
}

interface AdaptiveResponse {
    content: string;
    style: string;
    complexity: 'basic' | 'intermediate' | 'advanced';
    personalization: number;
}

class AdaptiveLearningEngine {
    private learningPatterns: Map<string, LearningPattern> = new Map();
    private readonly STORAGE_KEY = 'adaptive_learning_patterns';

    constructor() {
        this.loadLearningPatterns();
    }

    // 사용자 패턴 학습
    async learnFromInteraction(
        userId: string,
        message: string,
        response: string,
        session: ChatSession,
        project: Project | null
    ): Promise<void> {
        const pattern = this.getOrCreatePattern(userId);

        // 메시지 길이 분석
        pattern.averageMessageLength = this.updateAverageLength(
            pattern.averageMessageLength,
            message.length,
            pattern.interactionFrequency
        );

        // 주제 선호도 분석
        const topics = this.extractTopics(message);
        pattern.preferredTopics = this.updatePreferredTopics(
            pattern.preferredTopics,
            topics
        );

        // 응답 스타일 분석
        pattern.responseStyle = this.analyzeResponseStyle(response);

        // 상호작용 빈도 업데이트
        pattern.interactionFrequency += 1;

        // 자주 묻는 질문 업데이트
        pattern.commonQuestions = this.updateCommonQuestions(
            pattern.commonQuestions,
            message
        );

        pattern.lastUpdated = new Date();

        this.learningPatterns.set(userId, pattern);
        this.saveLearningPatterns();
    }

    // 적응형 응답 생성
    async generateAdaptiveResponse(
        userMessage: string,
        baseResponse: string,
        userId: string,
        session: ChatSession,
        project: Project | null
    ): Promise<AdaptiveResponse> {
        const pattern = this.learningPatterns.get(userId);

        if (!pattern) {
            return {
                content: baseResponse,
                style: 'default',
                complexity: 'intermediate',
                personalization: 0
            };
        }

        // 개인화된 응답 생성
        const personalizedResponse = this.personalizeResponse(
            baseResponse,
            pattern,
            userMessage
        );

        // 복잡도 조정
        const complexity = this.adjustComplexity(pattern, userMessage);

        // 스타일 적용
        const styledResponse = this.applyStyle(personalizedResponse, pattern.responseStyle);

        return {
            content: styledResponse,
            style: pattern.responseStyle,
            complexity,
            personalization: this.calculatePersonalization(pattern)
        };
    }

    // 사용자 패턴 분석
    async analyzeUserPattern(userId: string): Promise<LearningPattern | null> {
        return this.learningPatterns.get(userId) || null;
    }

    // 추천 주제 생성
    async generateTopicRecommendations(userId: string): Promise<string[]> {
        const pattern = this.learningPatterns.get(userId);
        if (!pattern) return [];

        const recommendations: string[] = [];

        // 선호 주제 기반 추천
        pattern.preferredTopics.forEach(topic => {
            const relatedTopics = this.getRelatedTopics(topic);
            recommendations.push(...relatedTopics);
        });

        // 상호작용 패턴 기반 추천
        if (pattern.interactionFrequency > 10) {
            recommendations.push('고급 분석 기능');
            recommendations.push('프로젝트 최적화');
        }

        // 중복 제거 및 상위 5개 반환
        const uniqueRecommendations = Array.from(new Set(recommendations));
        return uniqueRecommendations.slice(0, 5);
    }

    // 개인화 점수 계산
    private calculatePersonalization(pattern: LearningPattern): number {
        let score = 0;

        // 상호작용 빈도
        score += Math.min(pattern.interactionFrequency / 10, 0.3);

        // 주제 다양성
        score += Math.min(pattern.preferredTopics.length / 5, 0.2);

        // 응답 스타일 일관성
        score += 0.2;

        // 최근 활동
        const daysSinceLastUpdate = (Date.now() - pattern.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 0.3 - daysSinceLastUpdate * 0.01);

        return Math.min(score, 1);
    }

    // 응답 개인화
    private personalizeResponse(
        baseResponse: string,
        pattern: LearningPattern,
        userMessage: string
    ): string {
        let response = baseResponse;

        // 사용자 선호 주제 강조
        pattern.preferredTopics.forEach(topic => {
            if (userMessage.includes(topic)) {
                response = response.replace(
                    new RegExp(topic, 'g'),
                    `**${topic}**`
                );
            }
        });

        // 자주 묻는 질문 관련 추가 정보
        const relatedQuestions = pattern.commonQuestions.filter(q =>
            this.calculateSimilarity(userMessage, q) > 0.6
        );

        if (relatedQuestions.length > 0) {
            response += `\n\n💡 **관련 질문**: 이전에 비슷한 질문을 하신 적이 있습니다. 더 구체적인 답변이 필요하시면 말씀해 주세요.`;
        }

        return response;
    }

    // 복잡도 조정
    private adjustComplexity(pattern: LearningPattern, userMessage: string): 'basic' | 'intermediate' | 'advanced' {
        if (pattern.interactionFrequency < 5) return 'basic';
        if (pattern.interactionFrequency < 15) return 'intermediate';
        return 'advanced';
    }

    // 스타일 적용
    private applyStyle(response: string, style: string): string {
        switch (style) {
            case 'detailed':
                return response.replace(/\./g, '.\n\n');
            case 'concise':
                return response.split('\n').slice(0, 3).join('\n');
            case 'technical':
                return `📊 **기술적 분석**:\n${response}`;
            case 'casual':
                return response.replace(/입니다\./g, '이에요!').replace(/습니다\./g, '어요!');
            default:
                return response;
        }
    }

    // 응답 스타일 분석
    private analyzeResponseStyle(response: string): 'detailed' | 'concise' | 'technical' | 'casual' {
        const length = response.length;
        const hasTechnicalTerms = /[A-Z]{2,}|[0-9]+%|[가-힣]+[성율도]/.test(response);
        const hasEmojis = response.includes('😊') || response.includes('📊') || response.includes('💡') || response.includes('🔍');

        if (length > 500) return 'detailed';
        if (hasTechnicalTerms) return 'technical';
        if (hasEmojis || length < 100) return 'casual';
        return 'concise';
    }

    // 주제 추출
    private extractTopics(text: string): string[] {
        const topics: string[] = [];

        if (text.includes('프로젝트') || text.includes('계획')) topics.push('프로젝트 관리');
        if (text.includes('문제') || text.includes('해결')) topics.push('문제 해결');
        if (text.includes('분석') || text.includes('데이터')) topics.push('데이터 분석');
        if (text.includes('개선') || text.includes('최적화')) topics.push('프로세스 개선');
        if (text.includes('팀') || text.includes('협업')) topics.push('팀워크');
        if (text.includes('성과') || text.includes('결과')) topics.push('성과 관리');

        return topics;
    }

    // 관련 주제 가져오기
    private getRelatedTopics(topic: string): string[] {
        const topicMap: { [key: string]: string[] } = {
            '프로젝트 관리': ['일정 관리', '리소스 할당', '리스크 관리'],
            '문제 해결': ['근본 원인 분석', '해결책 도출', '실행 계획'],
            '데이터 분석': ['통계 분석', '시각화', '인사이트 도출'],
            '프로세스 개선': ['효율성 향상', '품질 관리', '표준화'],
            '팀워크': ['의사소통', '역할 분담', '동기부여'],
            '성과 관리': ['KPI 설정', '평가 체계', '피드백']
        };

        return topicMap[topic] || [];
    }

    // 평균 길이 업데이트
    private updateAverageLength(currentAvg: number, newLength: number, count: number): number {
        return (currentAvg * (count - 1) + newLength) / count;
    }

    // 선호 주제 업데이트
    private updatePreferredTopics(current: string[], newTopics: string[]): string[] {
        const allTopics = [...current, ...newTopics];
        const topicCount: { [key: string]: number } = {};

        allTopics.forEach(topic => {
            topicCount[topic] = (topicCount[topic] || 0) + 1;
        });

        return Object.entries(topicCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic]) => topic);
    }

    // 자주 묻는 질문 업데이트
    private updateCommonQuestions(current: string[], newQuestion: string): string[] {
        const questions = [...current, newQuestion];
        const questionCount: { [key: string]: number } = {};

        questions.forEach(q => {
            questionCount[q] = (questionCount[q] || 0) + 1;
        });

        return Object.entries(questionCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([question]) => question);
    }

    // 유사도 계산
    private calculateSimilarity(text1: string, text2: string): number {
        const words1 = text1.toLowerCase().match(/[가-힣]+/g) || [];
        const words2 = text2.toLowerCase().match(/[가-힣]+/g) || [];

        const commonWords = words1.filter(word => words2.some(w => w === word));
        return commonWords.length / Math.max(words1.length, words2.length);
    }

    // 패턴 가져오기 또는 생성
    private getOrCreatePattern(userId: string): LearningPattern {
        if (this.learningPatterns.has(userId)) {
            return this.learningPatterns.get(userId)!;
        }

        return {
            userId,
            preferredTopics: [],
            responseStyle: 'concise',
            interactionFrequency: 0,
            averageMessageLength: 0,
            commonQuestions: [],
            lastUpdated: new Date()
        };
    }

    // 패턴 저장
    private saveLearningPatterns(): void {
        try {
            const patterns = Object.fromEntries(this.learningPatterns);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));
        } catch (error) {
            console.error('학습 패턴 저장 오류:', error);
        }
    }

    // 패턴 로드
    private loadLearningPatterns(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const patterns = JSON.parse(stored);
                this.learningPatterns = new Map(Object.entries(patterns));

                // 날짜 객체 복원
                this.learningPatterns.forEach(pattern => {
                    pattern.lastUpdated = new Date(pattern.lastUpdated);
                });
            }
        } catch (error) {
            console.error('학습 패턴 로드 오류:', error);
        }
    }
}

const adaptiveLearningEngine = new AdaptiveLearningEngine();
export default adaptiveLearningEngine;
