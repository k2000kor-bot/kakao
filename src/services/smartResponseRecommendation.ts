import { errorLogger } from '../utils/errorLogger';

interface UserQuestionPattern {
    category: string;
    complexity: 'simple' | 'moderate' | 'complex';
    context: string[];
    keywords: string[];
    preferredStyle: 'conversational' | 'formal' | 'technical' | 'creative';
}

interface ResponseRecommendation {
    type: 'enhancement' | 'alternative' | 'followup';
    title: string;
    description: string;
    confidence: number;
    reasoning: string;
    suggestedAction: string;
}

interface ConversationContext {
    recentQuestions: string[];
    userPreferences: {
        detailLevel: 'simple' | 'balanced' | 'detailed';
        responseStyle: 'conversational' | 'formal' | 'technical' | 'creative';
        language: 'korean' | 'english' | 'mixed';
    };
    projectContext?: Record<string, unknown>;
}

class SmartResponseRecommendation {
    private questionCategories = {
        'technical': ['코드', '프로그래밍', '개발', '기술', 'API', '라이브러리'],
        'conceptual': ['개념', '이론', '원리', '방법론', '프로세스'],
        'practical': ['실습', '예제', '구현', '적용', '사용법'],
        'comparison': ['비교', '차이점', '장단점', '선택', '추천'],
        'troubleshooting': ['오류', '문제', '해결', '디버깅', '수정']
    };

    private complexityIndicators = {
        simple: ['기본', '간단', '쉬운', '초보', '개념'],
        moderate: ['중급', '적용', '실습', '예제', '구현'],
        complex: ['고급', '최적화', '아키텍처', '설계', '성능']
    };

    /**
     * 사용자 질문 패턴 분석
     */
    analyzeQuestionPattern(userInput: string, context: ConversationContext): UserQuestionPattern {
        const input = userInput.toLowerCase();

        // 카테고리 분석
        let category = 'general';
        for (const [cat, keywords] of Object.entries(this.questionCategories)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                category = cat;
                break;
            }
        }

        // 복잡도 분석
        let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
        for (const [comp, indicators] of Object.entries(this.complexityIndicators)) {
            if (indicators.some(indicator => input.includes(indicator))) {
                complexity = comp as 'simple' | 'moderate' | 'complex';
                break;
            }
        }

        // 키워드 추출
        const keywords = this.extractKeywords(input);

        // 컨텍스트 분석
        const contextKeywords = this.analyzeContext(context);

        return {
            category,
            complexity,
            context: contextKeywords,
            keywords,
            preferredStyle: context.userPreferences.responseStyle
        };
    }

    /**
     * 키워드 추출
     */
    private extractKeywords(text: string): string[] {
        const stopWords = ['이', '가', '을', '를', '에', '에서', '로', '으로', '의', '와', '과', '도', '만', '은', '는', '이', '그', '저', '어떻게', '무엇', '왜', '언제', '어디서'];
        const words = text.split(/\s+/).filter(word =>
            word.length > 1 && !stopWords.includes(word)
        );
        return words;
    }

    /**
     * 컨텍스트 분석
     */
    private analyzeContext(context: ConversationContext): string[] {
        const contextKeywords: string[] = [];

        // 최근 질문에서 키워드 추출
        context.recentQuestions.forEach(question => {
            const keywords = this.extractKeywords(question.toLowerCase());
            contextKeywords.push(...keywords);
        });

        // 프로젝트 컨텍스트 분석
        if (context.projectContext) {
            const projectName = context.projectContext.name as string;
            if (projectName) {
                contextKeywords.push(...this.extractKeywords(projectName.toLowerCase()));
            }
        }

        return Array.from(new Set(contextKeywords));
    }

    /**
     * 응답 추천 생성
     */
    generateRecommendations(
        userInput: string,
        currentResponse: string,
        context: ConversationContext
    ): ResponseRecommendation[] {
        const pattern = this.analyzeQuestionPattern(userInput, context);
        const recommendations: ResponseRecommendation[] = [];

        // 1. 응답 향상 추천
        const enhancementRec = this.generateEnhancementRecommendation(pattern, currentResponse);
        if (enhancementRec) {
            recommendations.push(enhancementRec);
        }

        // 2. 대안 응답 추천
        const alternativeRec = this.generateAlternativeRecommendation(pattern, context);
        if (alternativeRec) {
            recommendations.push(alternativeRec);
        }

        // 3. 후속 질문 추천
        const followupRec = this.generateFollowupRecommendation(pattern, context);
        if (followupRec) {
            recommendations.push(followupRec);
        }

        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * 응답 향상 추천
     */
    private generateEnhancementRecommendation(
        pattern: UserQuestionPattern,
        currentResponse: string
    ): ResponseRecommendation | null {
        const responseLength = currentResponse.length;
        const _hasCode = currentResponse.includes('```') || currentResponse.includes('코드');
        const hasExamples = currentResponse.includes('예시') || currentResponse.includes('예제');

        let enhancement = '';
        let confidence = 0.7;

        if (pattern.complexity === 'complex' && responseLength < 500) {
            enhancement = '더 상세한 기술적 설명 추가';
            confidence = 0.9;
        } else if (pattern.category === 'practical' && !hasExamples) {
            enhancement = '실용적인 예시나 코드 추가';
            confidence = 0.85;
        } else if (pattern.category === 'comparison' && !currentResponse.includes('비교')) {
            enhancement = '비교 분석 구조화';
            confidence = 0.8;
        } else if (pattern.complexity === 'simple' && responseLength > 800) {
            enhancement = '더 간결하고 이해하기 쉬운 설명으로 단순화';
            confidence = 0.75;
        }

        if (!enhancement) return null;

        return {
            type: 'enhancement',
            title: '응답 품질 향상',
            description: enhancement,
            confidence,
            reasoning: `${pattern.category} 카테고리의 ${pattern.complexity} 복잡도 질문에 최적화된 응답을 위해 제안합니다.`,
            suggestedAction: '응답을 다시 생성하여 더 나은 품질을 제공하세요.'
        };
    }

    /**
     * 대안 응답 추천
     */
    private generateAlternativeRecommendation(
        pattern: UserQuestionPattern,
        context: ConversationContext
    ): ResponseRecommendation | null {
        const stylePreferences = {
            conversational: ['친근한', '대화형', '쉬운'],
            formal: ['공식적', '전문적', '구조화된'],
            technical: ['기술적', '상세한', '정확한'],
            creative: ['창의적', '혁신적', '독창적인']
        };

        const currentStyle = context.userPreferences.responseStyle;
        const alternativeStyles = Object.keys(stylePreferences).filter(style => style !== currentStyle);

        if (alternativeStyles.length === 0) return null;

        const recommendedStyle = alternativeStyles[0];
        const styleDescription = stylePreferences[recommendedStyle as keyof typeof stylePreferences][0];

        return {
            type: 'alternative',
            title: '대안 응답 스타일',
            description: `${styleDescription} 스타일로 응답 생성`,
            confidence: 0.75,
            reasoning: `현재 ${currentStyle} 스타일과 다른 ${recommendedStyle} 스타일로 접근하여 다양한 관점을 제공할 수 있습니다.`,
            suggestedAction: `${recommendedStyle} 스타일로 응답을 다시 생성해보세요.`
        };
    }

    /**
     * 후속 질문 추천
     */
    private generateFollowupRecommendation(
        pattern: UserQuestionPattern,
        _context: ConversationContext
    ): ResponseRecommendation | null {
        const followupQuestions = {
            technical: [
                '실제 구현 예시를 보여주세요',
                '성능 최적화 방법은 무엇인가요?',
                '다른 기술과의 비교는 어떻게 되나요?'
            ],
            conceptual: [
                '실제 적용 사례를 알려주세요',
                '이 개념의 장단점은 무엇인가요?',
                '더 깊이 있는 설명을 해주세요'
            ],
            practical: [
                '단계별 구현 가이드를 제공해주세요',
                '자주 발생하는 문제와 해결방법은?',
                '모범 사례를 알려주세요'
            ],
            comparison: [
                '구체적인 사용 시나리오를 비교해주세요',
                '성능 벤치마크 결과는 어떻게 되나요?',
                '선택 기준을 제시해주세요'
            ],
            troubleshooting: [
                '근본 원인 분석을 해주세요',
                '예방 방법은 무엇인가요?',
                '디버깅 도구를 추천해주세요'
            ]
        };

        const questions = followupQuestions[pattern.category as keyof typeof followupQuestions] || [];
        if (questions.length === 0) return null;

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

        return {
            type: 'followup',
            title: '후속 질문 제안',
            description: randomQuestion,
            confidence: 0.8,
            reasoning: `${pattern.category} 카테고리의 질문에 대한 자연스러운 후속 질문입니다.`,
            suggestedAction: '사용자에게 이 질문을 제안하여 더 깊이 있는 대화를 이어가세요.'
        };
    }

    /**
     * 사용자 선호도 학습
     */
    learnUserPreferences(
        userInput: string,
        response: string,
        userFeedback: {
            rating: number;
            helpful: boolean;
            detailed: boolean;
        },
        context: ConversationContext
    ): void {
        // 사용자 피드백을 기반으로 선호도 학습
        const pattern = this.analyzeQuestionPattern(userInput, context);

        errorLogger.info('사용자 선호도 학습', {
            component: 'smartResponseRecommendation',
            action: 'learnUserPreferences',
            pattern,
            feedback: userFeedback,
            responseLength: response.length,
            responseStyle: context.userPreferences.responseStyle,
        });

        // 실제 구현에서는 이 정보를 저장하여 향후 추천에 활용
        // localStorage.setItem('userPreferences', JSON.stringify(learnedPreferences));
    }

    /**
     * 개인화된 추천 생성
     */
    generatePersonalizedRecommendations(
        userInput: string,
        context: ConversationContext
    ): ResponseRecommendation[] {
        // 사용자 히스토리 기반 개인화 추천
        const recommendations = this.generateRecommendations(userInput, '', context);

        // 개인화 가중치 적용
        return recommendations.map(rec => ({
            ...rec,
            confidence: rec.confidence * 1.1 // 개인화 보너스
        }));
    }
}

// 싱글톤 인스턴스 생성
const smartResponseRecommendation = new SmartResponseRecommendation();

export default smartResponseRecommendation;
export type { UserQuestionPattern, ResponseRecommendation, ConversationContext };
