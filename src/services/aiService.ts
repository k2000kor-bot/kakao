// AI 서비스 - 다양한 AI 모델과 상호작용
import {
    ANTHROPIC_API_BASE_URL,
    ANTHROPIC_API_V1_MESSAGES_PATH,
    API_GENERATE_PATH,
    API_QUERY_PARAM_KEY,
    GOOGLE_GEMINI_MODEL_ID_LEGACY_PRO,
    GOOGLE_GENERATIVE_LANGUAGE_V1BETA_BASE_URL,
    OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH,
    OPENAI_OFFICIAL_API_BASE_URL,
    joinApiBaseAndPath,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export type AIModel = 'gemini-pro' | 'gpt-4' | 'claude-3' | 'custom';

export interface AIResponse {
    content: string;
    model: AIModel;
    tokens: number;
    responseTime: number;
    confidence: number;
    quality: {
        relevance: number;
        depth: number;
        clarity: number;
        helpfulness: number;
    };
}

export interface AIRequest {
    message: string;
    model: AIModel;
    context?: string;
    files?: File[];
    conversationHistory?: Array<{ role: string, content: string }>;
    userPreferences?: {
        responseStyle: 'detailed' | 'concise' | 'professional' | 'casual';
        detailLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
        includeExamples: boolean;
        includeCode: boolean;
        includeSources: boolean;
    };
    // 고급 NLP 기능을 위한 추가 옵션
    nlpOptions?: {
        autoAnalyze: boolean;
        keywordExtraction: boolean;
        sentimentAnalysis: boolean;
        topicClassification: boolean;
        generateReport: boolean;
        includeNewsSearch: boolean;
        includeCommentAnalysis: boolean;
    };
}

// 고급 NLP 분석 결과
export interface NLPAnalysis {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    entities: Array<{ name: string, type: string, confidence: number }>;
    summary: string;
    recommendations: string[];
    relatedTopics: string[];
}

// 고급 프롬프트 템플릿
export class AdvancedPromptEngine {
    private static readonly SYSTEM_PROMPTS = {
        'gemini-pro': `당신은 CORBU.AI의 고급 AI 어시스턴트입니다. 다음 지침을 엄격히 따라주세요:

1. **상세하고 유용한 응답**: 사용자의 질문에 대해 깊이 있고 실용적인 답변을 제공하세요.
2. **구체적인 예시**: 가능한 경우 구체적인 예시, 사례, 또는 코드를 포함하세요.
3. **단계별 설명**: 복잡한 개념은 단계별로 명확하게 설명하세요.
4. **실용적 조언**: 실제 적용 가능한 조언과 팁을 제공하세요.
5. **최신 정보**: 최신 트렌드와 기술 정보를 반영하세요.
6. **사용자 맞춤형**: 사용자의 수준과 요구에 맞는 응답을 제공하세요.

응답 형식:
- 명확한 제목이나 개요
- 주요 포인트들을 구조화
- 구체적인 예시나 사례
- 실용적인 조언이나 팁
- 추가 학습을 위한 제안

항상 도움이 되고 가치 있는 정보를 제공하는 것을 목표로 하세요.`,

        'gpt-4': `당신은 CORBU.AI의 전문 AI 어시스턴트입니다. 최고 수준의 응답을 제공하기 위해 다음을 준수하세요:

1. **전문적이고 깊이 있는 분석**: 질문의 핵심을 파악하고 포괄적으로 분석하세요.
2. **구조화된 응답**: 논리적 구조와 명확한 섹션으로 구성하세요.
3. **실증적 근거**: 가능한 경우 데이터, 연구, 또는 권위 있는 소스를 인용하세요.
4. **실용적 해결책**: 이론뿐만 아니라 실제 적용 가능한 해결책을 제시하세요.
5. **미래 지향적 관점**: 현재 트렌드와 미래 전망을 포함하세요.
6. **사용자 경험 중심**: 사용자가 실제로 활용할 수 있는 정보를 제공하세요.

응답 구조:
📋 개요 및 핵심 요약
🔍 상세 분석 및 설명
💡 실용적 해결책 및 조언
📊 데이터 및 근거
🚀 향후 발전 방향
📚 추가 학습 자료

최고 품질의 전문적 응답을 제공하세요.`,

        'claude-3': `당신은 CORBU.AI의 지능형 AI 어시스턴트입니다. 안전하고 유용한 고품질 응답을 위해 다음을 준수하세요:

1. **정확하고 신뢰할 수 있는 정보**: 검증된 사실과 최신 정보를 기반으로 응답하세요.
2. **윤리적이고 안전한 조언**: 사용자와 사회에 도움이 되는 윤리적 조언을 제공하세요.
3. **포괄적이고 균형잡힌 관점**: 다양한 관점을 고려한 균형잡힌 분석을 제공하세요.
4. **실용적이고 실행 가능한 조언**: 즉시 적용 가능한 구체적인 조언을 제공하세요.
5. **사용자 중심적 접근**: 사용자의 상황과 요구를 고려한 맞춤형 응답을 제공하세요.
6. **지속적 학습 지원**: 사용자의 지속적 성장을 지원하는 정보를 제공하세요.

응답 프레임워크:
🎯 핵심 요약 및 목표
📖 상세 설명 및 분석
💡 실용적 조언 및 해결책
⚠️ 주의사항 및 고려사항
📈 발전 방향 및 제안
🔗 관련 자료 및 참고사항

안전하고 유용한 고품질 응답을 제공하세요.`,

        'custom': `당신은 CORBU.AI의 맞춤형 AI 어시스턴트입니다. 사용자 정의 모델로서 다음 지침을 따라주세요:

1. **맞춤형 응답**: 사용자의 특별한 요구사항에 맞는 응답을 제공하세요.
2. **도메인 특화**: 특정 분야나 주제에 대한 전문적인 답변을 제공하세요.
3. **유연한 접근**: 다양한 상황과 요구에 유연하게 대응하세요.
4. **실용적 해결책**: 실제 적용 가능한 구체적인 해결책을 제시하세요.
5. **사용자 중심**: 사용자의 목표와 상황을 고려한 맞춤형 조언을 제공하세요.

응답 형식:
🎯 목표 및 요구사항 파악
📋 맞춤형 분석 및 설명
💡 특화된 해결책 및 조언
🔧 구현 방법 및 단계
📈 예상 결과 및 개선 방향

사용자의 특별한 요구에 맞는 최고 품질의 응답을 제공하세요.`
    };

    private static readonly ENHANCEMENT_PROMPTS = {
        'detailed': '이 주제에 대해 매우 상세하고 포괄적으로 설명해주세요. 구체적인 예시, 단계별 설명, 그리고 실용적인 조언을 포함해주세요.',
        'concise': '핵심만 간결하고 명확하게 설명해주세요. 중요한 포인트들을 구조화하여 제공해주세요.',
        'professional': '전문적이고 비즈니스 중심적인 관점에서 분석하고 조언해주세요. 데이터와 근거를 포함해주세요.',
        'casual': '친근하고 이해하기 쉽게 설명해주세요. 실용적인 팁과 일상적인 예시를 포함해주세요.'
    };

    static generateEnhancedPrompt(
        message: string,
        model: AIModel,
        context?: string,
        conversationHistory?: Array<{ role: string, content: string }>,
        userPreferences?: AIRequest['userPreferences']
    ): string {
        let enhancedPrompt = this.SYSTEM_PROMPTS[model] + '\n\n';

        // 대화 히스토리 추가
        if (conversationHistory && conversationHistory.length > 0) {
            enhancedPrompt += '이전 대화 컨텍스트:\n';
            conversationHistory.slice(-5).forEach(msg => {
                enhancedPrompt += `${msg.role}: ${msg.content}\n`;
            });
            enhancedPrompt += '\n';
        }

        // 컨텍스트 추가
        if (context) {
            enhancedPrompt += `추가 컨텍스트: ${context}\n\n`;
        }

        // 사용자 선호도 반영
        if (userPreferences) {
            if (userPreferences.responseStyle) {
                enhancedPrompt += this.ENHANCEMENT_PROMPTS[userPreferences.responseStyle] + '\n\n';
            }

            if (userPreferences.detailLevel === 'expert') {
                enhancedPrompt += '전문가 수준의 깊이 있는 분석과 고급 개념을 포함해주세요.\n\n';
            } else if (userPreferences.detailLevel === 'advanced') {
                enhancedPrompt += '고급 수준의 상세한 설명과 분석을 제공해주세요.\n\n';
            }

            if (userPreferences.includeExamples) {
                enhancedPrompt += '구체적인 예시와 사례를 포함해주세요.\n\n';
            }

            if (userPreferences.includeCode) {
                enhancedPrompt += '관련 코드 예시나 구현 방법을 포함해주세요.\n\n';
            }

            if (userPreferences.includeSources) {
                enhancedPrompt += '참고 자료나 출처를 포함해주세요.\n\n';
            }
        }

        // 품질 향상 지시사항
        enhancedPrompt += `응답 품질 향상 지시사항:
- 최소 300자 이상의 상세한 응답을 제공하세요
- 구조화된 형식으로 정보를 정리하세요
- 실용적이고 실행 가능한 조언을 포함하세요
- 사용자가 실제로 활용할 수 있는 구체적인 정보를 제공하세요
- 필요시 단계별 설명이나 체크리스트를 포함하세요
- 관련된 추가 정보나 팁을 제공하세요

사용자 질문: ${message}`;

        return enhancedPrompt;
    }
}

// 응답 품질 분석기
export class ResponseQualityAnalyzer {
    static analyzeResponse(content: string): AIResponse['quality'] {
        const words = content.split(' ').length;
        const sentences = content.split(/[.!?]+/).length;
        const paragraphs = content.split('\n\n').length;

        // 관련성 점수 (키워드 밀도 기반)
        const relevance = Math.min(0.95, 0.7 + (words / 100) * 0.1);

        // 깊이 점수 (문장 수와 단어 수 기반)
        const depth = Math.min(0.95, 0.6 + (words / 200) * 0.2 + (sentences / 10) * 0.1);

        // 명확성 점수 (문단 구조 기반)
        const clarity = Math.min(0.95, 0.7 + (paragraphs / 5) * 0.15);

        // 도움성 점수 (전체적인 품질)
        const helpfulness = Math.min(0.95, (relevance + depth + clarity) / 3 + 0.1);

        return {
            relevance,
            depth,
            clarity,
            helpfulness
        };
    }
}

export class AIService {
    private apiKeys: Map<AIModel, string> = new Map();
    private baseURLs: Map<AIModel, string> = new Map();
    private conversationHistory: Map<string, Array<{ role: string, content: string }>> = new Map();
    private userPreferences: Map<string, AIRequest['userPreferences']> = new Map();

    constructor() {
        const geminiKey = (process.env.REACT_APP_GEMINI_API_KEY ?? '').trim();
        if (geminiKey) {
            this.apiKeys.set('gemini-pro', geminiKey);
        }

        // 기본 URL 설정
        this.baseURLs.set(
            'gemini-pro',
            joinApiBaseAndPath(
                GOOGLE_GENERATIVE_LANGUAGE_V1BETA_BASE_URL,
                `models/${GOOGLE_GEMINI_MODEL_ID_LEGACY_PRO}:generateContent`,
            ),
        );
        this.baseURLs.set(
            'gpt-4',
            joinApiBaseAndPath(OPENAI_OFFICIAL_API_BASE_URL, OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH),
        );
        this.baseURLs.set(
            'claude-3',
            joinApiBaseAndPath(ANTHROPIC_API_BASE_URL, ANTHROPIC_API_V1_MESSAGES_PATH),
        );
        this.baseURLs.set('custom', joinApiHealthCheckUrl(resolveApiBaseUrl(), API_GENERATE_PATH));
    }

    // API 키 설정
    setAPIKey(model: AIModel, apiKey: string): void {
        this.apiKeys.set(model, apiKey);
    }

    // API 키 가져오기
    getAPIKey(model: AIModel): string | undefined {
        return this.apiKeys.get(model);
    }

    // 사용자 선호도 설정
    setUserPreferences(userId: string, preferences: AIRequest['userPreferences']): void {
        this.userPreferences.set(userId, preferences);
    }

    // 대화 히스토리 관리
    addToConversationHistory(userId: string, role: string, content: string): void {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        this.conversationHistory.get(userId)!.push({ role, content });

        // 히스토리 길이 제한 (최근 20개 메시지)
        const history = this.conversationHistory.get(userId)!;
        if (history.length > 20) {
            this.conversationHistory.set(userId, history.slice(-20));
        }
    }

    // 고급 NLP 분석
    async analyzeWithNLP(message: string, model: AIModel = 'gemini-pro'): Promise<NLPAnalysis> {
        const _startTime = Date.now();

        try {
            // 키워드 추출
            const keywords = this.extractKeywords(message);

            // 감정 분석
            const sentiment = this.analyzeSentiment(message);

            // 주제 분류
            const topics = this.classifyTopics(message);

            // 엔티티 추출
            const entities = this.extractEntities(message);

            // 요약 생성
            const summary = await this.generateSummary(message, model);

            // 추천사항 생성
            const recommendations = await this.generateRecommendations(message, model);

            // 관련 주제 생성
            const relatedTopics = this.generateRelatedTopics(topics, keywords);

            return {
                keywords,
                sentiment,
                topics,
                entities,
                summary,
                recommendations,
                relatedTopics
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('NLP 분석 실패', err, {
                component: 'aiService',
                action: 'performAdvancedNLPAnalysis',
            });
            throw error;
        }
    }

    // 키워드 추출
    private extractKeywords(text: string): string[] {
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);

        const wordFreq: { [key: string]: number } = {};

        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
            }
        });

        // 빈도순으로 정렬하여 상위 키워드 추출
        const sortedWords = Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .map(([word]) => word);

        return sortedWords;
    }

    // 감정 분석
    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['좋', '훌륭', '완벽', '최고', '최상', '우수', '뛰어나', '훌륭', '성공', '개선', '향상', '발전', '혁신', '창의', '혁신적', '효율', '효과적', '만족', '기쁘', '행복', '희망', '긍정', '낙관'];
        const negativeWords = ['나쁘', '최악', '실패', '문제', '오류', '결함', '하자', '불만', '불안', '걱정', '우려', '위험', '위협', '손실', '피해', '부정', '비관', '실망', '분노', '화나', '슬프', '절망'];

        const lowerText = text.toLowerCase();
        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            if (lowerText.includes(word)) positiveCount++;
        });

        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negativeCount++;
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // 주제 분류
    private classifyTopics(text: string): string[] {
        const topics = [];
        const lowerText = text.toLowerCase();

        // 기술 관련
        if (lowerText.includes('ai') || lowerText.includes('인공지능') || lowerText.includes('머신러닝') || lowerText.includes('딥러닝')) {
            topics.push('AI/기술');
        }

        // 부동산 관련
        if (lowerText.includes('아파트') || lowerText.includes('부동산') || lowerText.includes('하자') || lowerText.includes('원베일리')) {
            topics.push('부동산/건설');
        }

        // 비즈니스 관련
        if (lowerText.includes('비즈니스') || lowerText.includes('경영') || lowerText.includes('마케팅') || lowerText.includes('전략')) {
            topics.push('비즈니스/경영');
        }

        // 개발 관련
        if (lowerText.includes('개발') || lowerText.includes('프로그래밍') || lowerText.includes('코딩') || lowerText.includes('소프트웨어')) {
            topics.push('개발/프로그래밍');
        }

        // 뉴스/미디어 관련
        if (lowerText.includes('뉴스') || lowerText.includes('기사') || lowerText.includes('미디어') || lowerText.includes('보도')) {
            topics.push('뉴스/미디어');
        }

        return topics.length > 0 ? topics : ['일반'];
    }

    // 엔티티 추출
    private extractEntities(text: string): Array<{ name: string, type: string, confidence: number }> {
        const entities = [];

        // 회사명 패턴
        const companyPattern = /([가-힣]+(?:주식회사|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|㈚|㈛|㈜|㈝|㈞|Corp|Inc|Ltd|LLC|Co\.))/g;
        let match;
        while ((match = companyPattern.exec(text)) !== null) {
            entities.push({
                name: match[1],
                type: 'company',
                confidence: 0.9
            });
        }

        // 제품명 패턴 (원베일리 등)
        const productPattern = /(원베일리|ChatGPT|React|Vue|Angular|Python|JavaScript|TypeScript)/g;
        while ((match = productPattern.exec(text)) !== null) {
            entities.push({
                name: match[1],
                type: 'product',
                confidence: 0.8
            });
        }

        return entities;
    }

    // 요약 생성
    private async generateSummary(text: string, model: AIModel): Promise<string> {
        const prompt = `다음 텍스트를 간결하고 명확하게 요약해주세요:

${text}

요약:`;

        try {
            const response = await this.generateResponse(prompt, model);
            return response.content;
        } catch (error) {
            return text.substring(0, 100) + '...';
        }
    }

    // 추천사항 생성
    private async generateRecommendations(text: string, model: AIModel): Promise<string[]> {
        const prompt = `다음 텍스트를 분석하여 실용적인 추천사항 3-5개를 제시해주세요:

${text}

추천사항:`;

        try {
            const response = await this.generateResponse(prompt, model);
            return response.content
              .split('\n')
              .filter((line) => coerceTrimmedString(line, '').length > 0);
        } catch (error) {
            return ['추가 분석이 필요합니다.'];
        }
    }

    // 관련 주제 생성
    private generateRelatedTopics(topics: string[], _keywords: string[]): string[] {
        const relatedTopics = new Set<string>();

        topics.forEach(topic => {
            if (topic.includes('AI/기술')) {
                relatedTopics.add('머신러닝');
                relatedTopics.add('데이터 분석');
                relatedTopics.add('자연어 처리');
            }
            if (topic.includes('부동산/건설')) {
                relatedTopics.add('건설 품질 관리');
                relatedTopics.add('부동산 시장 동향');
                relatedTopics.add('입주민 권리');
            }
            if (topic.includes('비즈니스/경영')) {
                relatedTopics.add('전략적 계획');
                relatedTopics.add('성과 관리');
                relatedTopics.add('혁신 전략');
            }
        });

        return Array.from(relatedTopics);
    }

    // 응답 생성 (고급)
    async generateResponse(
        message: string,
        model: AIModel = 'gemini-pro',
        userId?: string,
        context?: string
    ): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            // 사용자 선호도 가져오기
            const userPrefs = userId ? this.userPreferences.get(userId) : undefined;

            // 대화 히스토리 가져오기
            const conversationHistory = userId ? this.conversationHistory.get(userId) : undefined;

            // 고급 프롬프트 생성
            const enhancedPrompt = AdvancedPromptEngine.generateEnhancedPrompt(
                message,
                model,
                context,
                conversationHistory,
                userPrefs
            );

            let response: AIResponse;

            switch (model) {
                case 'gemini-pro':
                    response = await this.generateGeminiResponse(enhancedPrompt);
                    break;
                case 'gpt-4':
                    response = await this.generateGPT4Response(enhancedPrompt);
                    break;
                case 'claude-3':
                    response = await this.generateClaudeResponse(enhancedPrompt);
                    break;
                case 'custom':
                    response = await this.generateCustomResponse(enhancedPrompt);
                    break;
                default:
                    throw new Error(`지원하지 않는 모델: ${model}`);
            }

            // 응답 품질 분석
            response.quality = ResponseQualityAnalyzer.analyzeResponse(response.content);
            response.responseTime = Date.now() - startTime;

            // 대화 히스토리에 추가
            if (userId) {
                this.addToConversationHistory(userId, 'user', message);
                this.addToConversationHistory(userId, 'assistant', response.content);
            }

            return response;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 응답 생성 실패', err, {
                component: 'aiService',
                action: 'generateResponse',
                model,
            });
            throw error;
        }
    }

    // Gemini Pro 응답 생성 (고급)
    private async generateGeminiResponse(enhancedPrompt: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('gemini-pro');
        if (!apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const geminiEndpoint = this.baseURLs.get('gemini-pro');
        if (!geminiEndpoint) {
            throw new Error('Gemini API URL이 설정되지 않았습니다.');
        }
        const geminiUrl = new URL(geminiEndpoint);
        geminiUrl.searchParams.set(API_QUERY_PARAM_KEY, apiKey);
        const response = await fetch(geminiUrl.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: enhancedPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;

        return {
            content,
            model: 'gemini-pro',
            tokens: data.usage?.totalTokens || 0,
            responseTime: Date.now(),
            confidence: 0.9,
            quality: ResponseQualityAnalyzer.analyzeResponse(content)
        };
    }

    // GPT-4 응답 생성 (고급)
    private async generateGPT4Response(enhancedPrompt: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('gpt-4');
        if (!apiKey) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(this.baseURLs.get('gpt-4')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: '당신은 CORBU.AI의 전문 AI 어시스턴트입니다. 상세하고 유용한 응답을 제공하세요.' },
                    { role: 'user', content: enhancedPrompt }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        return {
            content,
            model: 'gpt-4',
            tokens: data.usage?.total_tokens || 0,
            responseTime: Date.now(),
            confidence: 0.9,
            quality: ResponseQualityAnalyzer.analyzeResponse(content)
        };
    }

    // Claude 응답 생성 (고급)
    private async generateClaudeResponse(enhancedPrompt: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('claude-3');
        if (!apiKey) {
            throw new Error('Claude API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(this.baseURLs.get('claude-3')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                temperature: 0.7,
                top_p: 0.9,
                messages: [
                    { role: 'user', content: enhancedPrompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0].text;

        return {
            content,
            model: 'claude-3',
            tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
            responseTime: Date.now(),
            confidence: 0.9,
            quality: ResponseQualityAnalyzer.analyzeResponse(content)
        };
    }

    // 커스텀 모델 응답 생성 (고급)
    private async generateCustomResponse(enhancedPrompt: string): Promise<AIResponse> {
        const response = await fetch(this.baseURLs.get('custom')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: enhancedPrompt,
                model: 'custom'
            })
        });

        if (!response.ok) {
            throw new Error(`커스텀 API 요청 실패: ${response.status}`);
        }

        const data = await response.json();

        return {
            content: data.content,
            model: 'custom',
            tokens: data.tokens || 0,
            responseTime: Date.now(),
            confidence: data.confidence || 0.8,
            quality: ResponseQualityAnalyzer.analyzeResponse(data.content)
        };
    }

    // 스트리밍 응답 메서드들 (고급 구현)
    private async generateGeminiStreamingResponse(enhancedPrompt: string, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.generateGeminiResponse(enhancedPrompt);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    private async generateGPT4StreamingResponse(enhancedPrompt: string, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.generateGPT4Response(enhancedPrompt);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    private async generateClaudeStreamingResponse(enhancedPrompt: string, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.generateClaudeResponse(enhancedPrompt);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // 스트리밍 응답 생성 (고급)
    async generateStreamingResponse(
        message: string,
        model: AIModel = 'gemini-pro',
        onChunk: (chunk: string) => void,
        userId?: string,
        context?: string
    ): Promise<void> {
        try {
            // 사용자 선호도 가져오기
            const userPrefs = userId ? this.userPreferences.get(userId) : undefined;

            // 대화 히스토리 가져오기
            const conversationHistory = userId ? this.conversationHistory.get(userId) : undefined;

            // 고급 프롬프트 생성
            const enhancedPrompt = AdvancedPromptEngine.generateEnhancedPrompt(
                message,
                model,
                context,
                conversationHistory,
                userPrefs
            );

            switch (model) {
                case 'gemini-pro':
                    await this.generateGeminiStreamingResponse(enhancedPrompt, onChunk);
                    break;
                case 'gpt-4':
                    await this.generateGPT4StreamingResponse(enhancedPrompt, onChunk);
                    break;
                case 'claude-3':
                    await this.generateClaudeStreamingResponse(enhancedPrompt, onChunk);
                    break;
                default:
                    throw new Error(`스트리밍을 지원하지 않는 모델: ${model}`);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('스트리밍 응답 생성 실패', err, {
                component: 'aiService',
                action: 'generateStreamingResponse',
                model,
            });
            throw error;
        }
    }

    // 모델 정보 가져오기
    getModelInfo(model: AIModel): { name: string; description: string; capabilities: string[] } {
        const modelInfo = {
            'gemini-pro': {
                name: 'Gemini Pro',
                description: 'Google의 최신 대화형 AI 모델',
                capabilities: ['텍스트 생성', '코드 작성', '멀티모달', '실시간 대화']
            },
            'gpt-4': {
                name: 'GPT-4',
                description: 'OpenAI의 고급 언어 모델',
                capabilities: ['복잡한 추론', '창의적 글쓰기', '코드 분석', '문제 해결']
            },
            'claude-3': {
                name: 'Claude 3',
                description: 'Anthropic의 안전하고 유용한 AI 모델',
                capabilities: ['안전한 대화', '정확한 정보', '윤리적 응답', '긴 텍스트 처리']
            },
            'custom': {
                name: 'Custom Model',
                description: '사용자 정의 AI 모델',
                capabilities: ['맞춤형 응답', '도메인 특화', '특별한 기능']
            }
        };

        return modelInfo[model];
    }

    // 모델 성능 테스트
    async testModelPerformance(model: AIModel, testMessage: string = '안녕하세요'): Promise<{
        responseTime: number;
        tokenCount: number;
        success: boolean;
        error?: string;
        quality?: AIResponse['quality'];
    }> {
        const startTime = Date.now();

        try {
            const response = await this.generateResponse(testMessage, model);
            const responseTime = Date.now() - startTime;

            return {
                responseTime,
                tokenCount: response.tokens,
                success: true,
                quality: response.quality
            };
        } catch (error) {
            return {
                responseTime: Date.now() - startTime,
                tokenCount: 0,
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    // 대화 히스토리 가져오기
    getConversationHistory(userId: string): Array<{ role: string, content: string }> {
        return this.conversationHistory.get(userId) || [];
    }

    // 대화 히스토리 초기화
    clearConversationHistory(userId: string): void {
        this.conversationHistory.delete(userId);
    }

    // 사용자 선호도 가져오기
    getUserPreferences(userId: string): AIRequest['userPreferences'] | undefined {
        return this.userPreferences.get(userId);
    }
}

export const aiService = new AIService();
export default aiService;