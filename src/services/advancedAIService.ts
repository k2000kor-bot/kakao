import { Message, ChatContext } from '../types/chat';

export interface AdvancedAIRequest {
    type: 'conversation' | 'analysis' | 'summary' | 'creative' | 'technical' | 'business' | 'emotion' | 'style' | 'translation' | 'learning';
    text: string;
    style?: 'friendly' | 'professional' | 'creative' | 'formal' | 'casual' | 'academic' | 'poetic';
    length?: 'short' | 'medium' | 'long';
    context?: ChatContext;
    emotion?: 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'calm';
    language?: 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de';
    personality?: 'helpful' | 'creative' | 'analytical' | 'empathetic' | 'humorous';
    learningMode?: boolean;
}

export interface AdvancedAIResponse {
    success: boolean;
    message: Message;
    metadata?: {
        processingTime: number;
        confidence: number;
        model: string;
        tokens: number;
        emotion?: string;
        style?: string;
        language?: string;
        learningInsights?: string[];
    };
    suggestions?: string[];
    alternatives?: Message[];
}

export interface EmotionAnalysis {
    primary: string;
    secondary: string[];
    intensity: number;
    confidence: number;
}

export interface StyleProfile {
    formality: number;
    creativity: number;
    technicality: number;
    empathy: number;
    humor: number;
}

export interface LearningContext {
    userPreferences: Record<string, unknown>;
    conversationHistory: Message[];
    learningPatterns: string[];
    adaptationLevel: number;
}

class AdvancedAIService {
    private baseUrl = 'http://localhost:8002/api/v7';
    private learningContext: LearningContext = {
        userPreferences: {},
        conversationHistory: [],
        learningPatterns: [],
        adaptationLevel: 0.5
    };
    private styleProfiles: Map<string, StyleProfile> = new Map();
    private emotionCache: Map<string, EmotionAnalysis> = new Map();

    async generateAdvancedResponse(request: AdvancedAIRequest): Promise<AdvancedAIResponse> {
        try {
            // 감정 분석 추가
            const emotionAnalysis = await this.analyzeEmotion(request.text);

            // 스타일 프로필 업데이트
            await this.updateStyleProfile(request);

            // 학습 컨텍스트 업데이트
            await this.updateLearningContext(request);

            const response = await fetch(`${this.baseUrl}/advanced-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...request,
                    emotionAnalysis,
                    learningContext: this.learningContext
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.enhanceResponse(data, request);
            } else {
                throw new Error('AI 응답 생성 실패');
            }
        } catch (error) {
            console.error('고급 AI 서비스 오류:', error);
            return this.createFallbackResponse(request);
        }
    }

    private async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
        const cacheKey = text.substring(0, 100);
        if (this.emotionCache.has(cacheKey)) {
            return this.emotionCache.get(cacheKey)!;
        }

        const emotions = ['happy', 'sad', 'angry', 'neutral', 'excited', 'calm'];
        const emotionKeywords = {
            happy: ['좋아', '행복', '기쁘', '즐거', '웃'],
            sad: ['슬프', '우울', '힘들', '아프', '눈물'],
            angry: ['화나', '짜증', '분노', '열받', '빡'],
            excited: ['신나', '흥미', '재미', '놀라', '대박'],
            calm: ['차분', '평온', '조용', '편안', '여유']
        };

        let primaryEmotion = 'neutral';
        let maxScore = 0;

        for (const emotion of emotions) {
            const keywords = emotionKeywords[emotion as keyof typeof emotionKeywords] || [];
            const score = keywords.reduce((acc, keyword) => {
                return acc + (text.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }

        const analysis: EmotionAnalysis = {
            primary: primaryEmotion,
            secondary: emotions.filter(e => e !== primaryEmotion).slice(0, 2),
            intensity: Math.min(maxScore / 3, 1),
            confidence: Math.min(maxScore / 5, 0.9)
        };

        this.emotionCache.set(cacheKey, analysis);
        return analysis;
    }

    private async updateStyleProfile(request: AdvancedAIRequest): Promise<void> {
        const profileKey = request.style || 'friendly';
        const currentProfile = this.styleProfiles.get(profileKey) || {
            formality: 0.5,
            creativity: 0.5,
            technicality: 0.5,
            empathy: 0.5,
            humor: 0.5
        };

        // 사용자 상호작용에 따른 스타일 조정
        const emotionAnalysis = await this.analyzeEmotion(request.text);

        if (emotionAnalysis.primary === 'sad') {
            currentProfile.empathy += 0.1;
            currentProfile.humor += 0.05;
        } else if (emotionAnalysis.primary === 'angry') {
            currentProfile.empathy += 0.15;
            currentProfile.formality += 0.1;
        } else if (emotionAnalysis.primary === 'excited') {
            currentProfile.creativity += 0.1;
            currentProfile.humor += 0.1;
        }

        // 값 범위 제한
        Object.keys(currentProfile).forEach(key => {
            const k = key as keyof StyleProfile;
            currentProfile[k] = Math.max(0, Math.min(1, currentProfile[k]));
        });

        this.styleProfiles.set(profileKey, currentProfile);
    }

    private async updateLearningContext(request: AdvancedAIRequest): Promise<void> {
        // 대화 히스토리 업데이트
        this.learningContext.conversationHistory.push({
            id: `user_${Date.now()}`,
            content: request.text,
            sender: 'user',
            timestamp: new Date().toISOString(),
            isMe: true,
            type: 'text'
        });

        // 사용자 선호도 학습
        if (request.style) {
            this.learningContext.userPreferences.style = request.style;
        }
        if (request.emotion) {
            this.learningContext.userPreferences.emotion = request.emotion;
        }

        // 학습 패턴 분석
        const patterns = await this.analyzeLearningPatterns();
        this.learningContext.learningPatterns = patterns;

        // 적응 수준 조정
        this.learningContext.adaptationLevel = Math.min(1, this.learningContext.adaptationLevel + 0.01);
    }

    private async analyzeLearningPatterns(): Promise<string[]> {
        const patterns: string[] = [];
        const recentMessages = this.learningContext.conversationHistory.slice(-10);

        // 감정 패턴 분석
        const emotions = await Promise.all(recentMessages.map(msg => this.analyzeEmotion(msg.content)));
        const primaryEmotions = emotions.map(e => e.primary);
        const emotionPattern = this.findMostCommon(primaryEmotions);
        if (emotionPattern) patterns.push(`emotion_${emotionPattern}`);

        // 주제 패턴 분석
        const topics = this.extractTopics(recentMessages);
        const topicPattern = this.findMostCommon(topics);
        if (topicPattern) patterns.push(`topic_${topicPattern}`);

        // 스타일 패턴 분석
        const styles = recentMessages.map(msg => this.extractStyle(msg.content));
        const stylePattern = this.findMostCommon(styles);
        if (stylePattern) patterns.push(`style_${stylePattern}`);

        return patterns;
    }

    private findMostCommon(arr: string[]): string | null {
        const counts = arr.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const maxCount = Math.max(...Object.values(counts));
        const mostCommon = Object.keys(counts).find(key => counts[key] === maxCount);
        return mostCommon || null;
    }

    private extractTopics(messages: Message[]): string[] {
        const topicKeywords = {
            'business': ['비즈니스', '회사', '업무', '경영', '마케팅'],
            'technology': ['기술', '프로그래밍', '코딩', '소프트웨어', 'AI'],
            'personal': ['개인', '일상', '생활', '취미', '관심사'],
            'academic': ['학습', '연구', '교육', '학문', '지식']
        };

        return messages.map(msg => {
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                if (keywords.some(keyword => msg.content.includes(keyword))) {
                    return topic;
                }
            }
            return 'general';
        });
    }

    private extractStyle(text: string): string {
        const styleIndicators = {
            'formal': ['공식', '체계', '구조', '분석'],
            'casual': ['친근', '편안', '자연', '일상'],
            'creative': ['창의', '혁신', '아이디어', '상상'],
            'technical': ['기술', '방법', '과정', '구현']
        };

        for (const [style, indicators] of Object.entries(styleIndicators)) {
            if (indicators.some(indicator => text.includes(indicator))) {
                return style;
            }
        }
        return 'neutral';
    }

    private enhanceResponse(response: AdvancedAIResponse, request: AdvancedAIRequest): AdvancedAIResponse {
        // 감정 기반 응답 조정
        const emotionAnalysis = this.emotionCache.get(request.text.substring(0, 100));
        if (emotionAnalysis) {
            response.message.content = this.adjustResponseByEmotion(
                response.message.content,
                emotionAnalysis
            );
        }

        // 학습 컨텍스트 기반 개인화
        if (this.learningContext.adaptationLevel > 0.3) {
            response.message.content = this.personalizeResponse(
                response.message.content,
                this.learningContext
            );
        }

        // 대안 제안 생성
        response.alternatives = this.generateAlternatives(request, response.message);

        return response;
    }

    private adjustResponseByEmotion(content: string, emotion: EmotionAnalysis): string {
        const emotionAdjustments = {
            'sad': '😔 ',
            'happy': '😊 ',
            'angry': '😤 ',
            'excited': '🎉 ',
            'calm': '😌 '
        };

        const prefix = emotionAdjustments[emotion.primary as keyof typeof emotionAdjustments] || '';
        return prefix + content;
    }

    private personalizeResponse(content: string, context: LearningContext): string {
        // 사용자 선호도에 따른 개인화
        if (context.userPreferences.style === 'creative') {
            content = `💡 ${content}`;
        } else if (context.userPreferences.style === 'professional') {
            content = `📊 ${content}`;
        }

        // 학습 패턴 기반 개인화
        if (context.learningPatterns.includes('emotion_sad')) {
            content = `🤗 ${content}`;
        }

        return content;
    }

    private generateAlternatives(request: AdvancedAIRequest, originalMessage: Message): Message[] {
        const alternatives: Message[] = [];
        const styles = ['friendly', 'professional', 'creative', 'formal'];

        styles.forEach(style => {
            if (style !== request.style) {
                const alternativeContent = this.generateFallbackContent({
                    ...request,
                    style: style as any
                });

                alternatives.push({
                    ...originalMessage,
                    id: `${originalMessage.id}_alt_${style}`,
                    content: alternativeContent,
                    aiResponse: {
                        ...originalMessage.aiResponse,
                        type: request.type as any
                    }
                });
            }
        });

        return alternatives;
    }

    private createFallbackResponse(request: AdvancedAIRequest): AdvancedAIResponse {
        const responseContent = this.generateFallbackContent(request);

        return {
            success: false,
            message: {
                id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: responseContent,
                sender: 'CORBU.AI',
                timestamp: new Date().toISOString(),
                isMe: false,
                type: 'ai_response',
                aiResponse: {
                    type: this.mapRequestTypeToResponseType(request.type),
                    metadata: {
                        confidence: 0.7,
                        processingTime: 1000,
                        model: 'fallback',
                        tokens: 150
                    }
                }
            },
            suggestions: this.generateSuggestions(request),
            alternatives: []
        };
    }

    private generateSuggestions(request: AdvancedAIRequest): string[] {
        const suggestions = {
            conversation: [
                '더 자세한 설명을 원하시나요?',
                '관련된 다른 주제도 궁금하신가요?',
                '실제 예시를 들어 설명해드릴까요?'
            ],
            analysis: [
                '더 깊은 분석을 원하시나요?',
                '데이터 시각화도 함께 제공할까요?',
                '비교 분석도 추가로 해드릴까요?'
            ],
            creative: [
                '더 창의적인 아이디어를 원하시나요?',
                '실제 구현 가능한 방안도 제시할까요?',
                '관련된 다른 창작 영역도 탐색해볼까요?'
            ]
        };

        return suggestions[request.type as keyof typeof suggestions] || [
            '추가 정보가 필요하시면 언제든 말씀해 주세요!'
        ];
    }

    private generateFallbackContent(request: AdvancedAIRequest): string {
        const { type, text, style = 'friendly' } = request;

        const responses = {
            conversation: {
                friendly: `안녕하세요! "${text}"에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!`,
                professional: `분석 결과: "${text}"에 대한 전문적인 답변을 제공합니다.`,
                creative: `창의적 관점에서 "${text}"를 바라보면 흥미로운 아이디어가 나올 것 같아요!`,
                formal: `공식적으로 "${text}"에 대한 답변을 드리겠습니다.`,
                casual: `"${text}"에 대해 편하게 이야기해보죠!`,
                academic: `학술적 관점에서 "${text}"를 분석해보겠습니다.`,
                poetic: `"${text}"의 아름다움을 시적으로 표현해보겠습니다.`
            },
            analysis: {
                friendly: `"${text}"를 분석해보니 흥미로운 결과가 나왔어요!`,
                professional: `분석 결과: "${text}"에 대한 심층 분석을 완료했습니다.`,
                creative: `창의적 분석: "${text}"에서 새로운 관점을 발견했습니다!`,
                formal: `공식 분석 결과: "${text}"에 대한 상세한 분석을 제공합니다.`,
                casual: `"${text}" 분석해봤는데 재미있는 점들이 보이네요!`,
                academic: `학술적 분석: "${text}"에 대한 체계적인 연구 결과를 제시합니다.`,
                poetic: `"${text}"의 숨겨진 의미를 시적으로 해석해보겠습니다.`
            },
            summary: {
                friendly: `"${text}"의 핵심을 간단히 요약해드릴게요!`,
                professional: `요약 결과: "${text}"의 주요 내용을 정리했습니다.`,
                creative: `창의적 요약: "${text}"를 새로운 방식으로 정리해봤어요!`,
                formal: `공식 요약: "${text}"의 핵심 내용을 체계적으로 정리했습니다.`,
                casual: `"${text}" 요약해드릴게요!`,
                academic: `학술적 요약: "${text}"의 핵심 논점을 정리했습니다.`,
                poetic: `"${text}"의 본질을 시적으로 요약해보겠습니다.`
            },
            creative: {
                friendly: `"${text}"에 대한 창의적인 아이디어를 떠올려봤어요!`,
                professional: `창작 분석: "${text}"에 대한 전문적인 창작 가이드를 제공합니다.`,
                creative: `창의적 영감: "${text}"에서 놀라운 아이디어가 떠올랐어요!`,
                formal: `공식 창작: "${text}"에 대한 체계적인 창작 방법을 제시합니다.`,
                casual: `"${text}"에 대한 재미있는 아이디어 생각해봤어요!`,
                academic: `창작 연구: "${text}"에 대한 학술적 창작 방법론을 제시합니다.`,
                poetic: `"${text}"에서 시적 영감을 찾아보겠습니다.`
            },
            technical: {
                friendly: `"${text}"에 대한 기술적 해결책을 찾아봤어요!`,
                professional: `기술 분석: "${text}"에 대한 전문적인 기술 솔루션을 제공합니다.`,
                creative: `창의적 기술: "${text}"에 대한 혁신적인 기술적 접근을 제안합니다!`,
                formal: `공식 기술: "${text}"에 대한 체계적인 기술적 해결책을 제시합니다.`,
                casual: `"${text}" 기술적으로 해결해보죠!`,
                academic: `기술 연구: "${text}"에 대한 학술적 기술 방법론을 제시합니다.`,
                poetic: `"${text}"의 기술적 아름다움을 탐구해보겠습니다.`
            },
            business: {
                friendly: `"${text}"에 대한 비즈니스 인사이트를 공유해드릴게요!`,
                professional: `비즈니스 분석: "${text}"에 대한 전문적인 시장 분석을 제공합니다.`,
                creative: `창의적 비즈니스: "${text}"에 대한 혁신적인 비즈니스 아이디어를 제안합니다!`,
                formal: `공식 비즈니스: "${text}"에 대한 체계적인 비즈니스 전략을 제시합니다.`,
                casual: `"${text}" 비즈니스 관점에서 생각해보죠!`,
                academic: `경영 연구: "${text}"에 대한 학술적 비즈니스 분석을 제시합니다.`,
                poetic: `"${text}"의 비즈니스 영감을 시적으로 표현해보겠습니다.`
            },
            emotion: {
                friendly: `"${text}"의 감정을 이해하고 공감해드릴게요!`,
                professional: `감정 분석: "${text}"에 대한 전문적인 감정 분석을 제공합니다.`,
                creative: `감정적 창작: "${text}"에서 감정적 영감을 찾아보겠습니다!`,
                formal: `공식 감정: "${text}"에 대한 체계적인 감정 분석을 제시합니다.`,
                casual: `"${text}" 감정적으로 이해해보죠!`,
                academic: `감정 연구: "${text}"에 대한 학술적 감정 분석을 제시합니다.`,
                poetic: `"${text}"의 감정을 시적으로 표현해보겠습니다.`
            },
            style: {
                friendly: `"${text}"의 스타일을 분석해드릴게요!`,
                professional: `스타일 분석: "${text}"에 대한 전문적인 스타일 분석을 제공합니다.`,
                creative: `창의적 스타일: "${text}"에서 새로운 스타일을 발견했습니다!`,
                formal: `공식 스타일: "${text}"에 대한 체계적인 스타일 분석을 제시합니다.`,
                casual: `"${text}" 스타일적으로 살펴보죠!`,
                academic: `스타일 연구: "${text}"에 대한 학술적 스타일 분석을 제시합니다.`,
                poetic: `"${text}"의 스타일적 아름다움을 탐구해보겠습니다.`
            },
            translation: {
                friendly: `"${text}"를 다른 언어로 번역해드릴게요!`,
                professional: `번역 서비스: "${text}"에 대한 전문적인 번역을 제공합니다.`,
                creative: `창의적 번역: "${text}"를 새로운 방식으로 번역해보겠습니다!`,
                formal: `공식 번역: "${text}"에 대한 체계적인 번역을 제시합니다.`,
                casual: `"${text}" 번역해드릴게요!`,
                academic: `번역 연구: "${text}"에 대한 학술적 번역 분석을 제시합니다.`,
                poetic: `"${text}"를 시적으로 번역해보겠습니다.`
            },
            learning: {
                friendly: `"${text}"에 대해 함께 학습해보겠습니다!`,
                professional: `학습 가이드: "${text}"에 대한 전문적인 학습 방법을 제공합니다.`,
                creative: `창의적 학습: "${text}"를 새로운 방식으로 학습해보겠습니다!`,
                formal: `공식 학습: "${text}"에 대한 체계적인 학습 방법을 제시합니다.`,
                casual: `"${text}" 재미있게 배워보죠!`,
                academic: `학습 연구: "${text}"에 대한 학술적 학습 방법론을 제시합니다.`,
                poetic: `"${text}"의 학습 과정을 시적으로 표현해보겠습니다.`
            }
        };

        return responses[type][style] || responses[type].friendly;
    }

    // 특정 AI 모드별 응답 생성
    async generateConversationResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'conversation',
            text,
            style: 'friendly',
            context
        });
        return response.message;
    }

    async generateAnalysisResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'analysis',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateSummaryResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'summary',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateCreativeResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'creative',
            text,
            style: 'creative',
            context
        });
        return response.message;
    }

    async generateTechnicalResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'technical',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateBusinessResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'business',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    // 새로운 고도화된 기능들
    async generateEmotionResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'conversation',
            text,
            style: 'friendly',
            context
        });
        return response.message;
    }

    async generateStyleResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'style',
            text,
            style: 'creative',
            context
        });
        return response.message;
    }

    async generateTranslationResponse(text: string, targetLanguage: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'translation',
            text,
            style: 'professional',
            language: targetLanguage as any,
            context
        });
        return response.message;
    }

    async generateLearningResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'learning',
            text,
            style: 'friendly',
            learningMode: true,
            context
        });
        return response.message;
    }

    // 학습 컨텍스트 관리
    getLearningContext(): LearningContext {
        return this.learningContext;
    }

    updateUserPreferences(preferences: Record<string, unknown>): void {
        this.learningContext.userPreferences = {
            ...this.learningContext.userPreferences,
            ...preferences
        };
    }

    resetLearningContext(): void {
        this.learningContext = {
            userPreferences: {},
            conversationHistory: [],
            learningPatterns: [],
            adaptationLevel: 0.5
        };
    }

    // 스타일 프로필 관리
    getStyleProfile(style: string): StyleProfile | undefined {
        return this.styleProfiles.get(style);
    }

    getAllStyleProfiles(): Map<string, StyleProfile> {
        return this.styleProfiles;
    }

    // 감정 분석 캐시 관리
    clearEmotionCache(): void {
        this.emotionCache.clear();
    }

    getEmotionAnalysis(text: string): EmotionAnalysis | undefined {
        const cacheKey = text.substring(0, 100);
        return this.emotionCache.get(cacheKey);
    }

    private mapRequestTypeToResponseType(requestType: AdvancedAIRequest['type']): NonNullable<Message['aiResponse']>['type'] {
        const typeMapping: Record<AdvancedAIRequest['type'], NonNullable<Message['aiResponse']>['type']> = {
            'conversation': 'conversation',
            'analysis': 'analysis',
            'summary': 'analysis',
            'creative': 'creative',
            'technical': 'technical',
            'business': 'business',
            'emotion': 'conversation',
            'style': 'creative',
            'translation': 'conversation',
            'learning': 'conversation'
        };
        return typeMapping[requestType];
    }
}

export const advancedAIService = new AdvancedAIService(); 