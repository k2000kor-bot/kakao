import { sendChatMessage, ChatRequest } from './unifiedAPI';
import enhancedBackendAPI, { BackendAPIRequest } from './enhancedBackendAPI';
import { Message } from '../types/chat';
import advancedQualityEvaluator, { ResponseAnalysis } from './advancedQualityEvaluator';

export interface EnhancedResponseContext {
    userInput: string;
    conversationHistory: Message[];
    projectContext?: Record<string, unknown>;
    userPreferences?: {
        responseStyle: 'conversational' | 'formal' | 'technical' | 'creative';
        detailLevel: 'simple' | 'balanced' | 'detailed';
        language: 'korean' | 'english' | 'mixed';
        tone: 'friendly' | 'professional' | 'neutral';
        responseLength?: 'short' | 'medium' | 'long';
    };
    currentTime: Date;
}

export interface EnhancedResponseResult {
    content: string;
    confidence: number;
    processingTime: number;
    qualityScore: number;
    metadata: {
        model: string;
        tokens: number;
        reasoningSteps: number;
        sourcesUsed: number;
        improvements: string[];
        limitations: string[];
    };
}

export interface ResponseQualityMetrics {
    relevance: number;
    accuracy: number;
    completeness: number;
    clarity: number;
    helpfulness: number;
    overall: number;
}

class EnhancedResponseProcessor {
    private qualityThreshold = 0.8;
    private maxRetries = 3;

    /**
     * 고급 응답 처리 메인 함수
     */
    async processEnhancedResponse(
        userInput: string,
        context: EnhancedResponseContext
    ): Promise<EnhancedResponseResult> {
        const startTime = Date.now();

        try {
            console.log('🚀 고급 응답 처리 시작:', userInput);

            // 1단계: 입력 분석 및 컨텍스트 강화
            const enhancedContext = await this.enhanceContext(context);

            // 2단계: 다중 모델 응답 생성
            const modelResponses = await this.generateMultiModelResponses(userInput, enhancedContext);

            // 3단계: 응답 품질 평가 및 선택
            const bestResponse = await this.evaluateAndSelectBestResponse(modelResponses, enhancedContext);

            // 4단계: 고급 품질 평가 수행
            const qualityAnalysis = await advancedQualityEvaluator.evaluateResponseQuality(
                bestResponse.content,
                userInput,
                {
                    conversationHistory: context.conversationHistory,
                    projectContext: context.projectContext,
                    userPreferences: context.userPreferences
                }
            );

            // 5단계: 품질 분석 기반 응답 정제
            const refinedResponse = await this.refineResponseWithQualityAnalysis(bestResponse, qualityAnalysis, enhancedContext);

            // 6단계: 최종 품질 검증
            const finalResponse = await this.validateFinalResponse(refinedResponse, enhancedContext);

            const processingTime = Date.now() - startTime;

            return {
                content: finalResponse.content,
                confidence: finalResponse.confidence,
                processingTime,
                qualityScore: finalResponse.qualityScore,
                metadata: {
                    model: 'enhanced-response-processor',
                    tokens: finalResponse.content.split(' ').length,
                    reasoningSteps: 6,
                    sourcesUsed: finalResponse.sourcesUsed || 0,
                    improvements: finalResponse.improvements || [],
                    limitations: finalResponse.limitations || []
                }
            };

        } catch (error) {
            console.error('고급 응답 처리 오류:', error);
            return this.createFallbackResponse(userInput, Date.now() - startTime);
        }
    }

    /**
     * 컨텍스트 강화
     */
    private async enhanceContext(context: EnhancedResponseContext): Promise<EnhancedResponseContext> {
        const enhanced = { ...context };

        // 대화 히스토리 분석
        if (context.conversationHistory && context.conversationHistory.length > 0) {
            const recentMessages = context.conversationHistory.slice(-5);
            enhanced.conversationHistory = recentMessages;
        }

        // 사용자 선호도 기본값 설정
        if (!enhanced.userPreferences) {
            enhanced.userPreferences = {
                responseStyle: 'conversational',
                detailLevel: 'balanced',
                language: 'korean',
                tone: 'friendly'
            };
        }

        return enhanced;
    }

    /**
     * 다중 모델 응답 생성
     */
    private async generateMultiModelResponses(
        userInput: string,
        context: EnhancedResponseContext
    ): Promise<Array<{
        content: string;
        confidence: number;
        type: string;
        model: string;
        qualityScore?: number;
    }>> {
        const responses: Array<{
            content: string;
            confidence: number;
            type: string;
            model: string;
            qualityScore?: number;
        }> = [];

        // 1. 백엔드 API 응답 (우선순위 높음)
        try {
            const backendRequest: BackendAPIRequest = {
                userInput,
                context: context.projectContext,
                options: {
                    quality: context.userPreferences?.responseStyle === 'technical' ? 'ultimate' : 'enhanced',
                    style: context.userPreferences?.responseStyle || 'conversational',
                    detailLevel: context.userPreferences?.detailLevel || 'balanced',
                    tone: context.userPreferences?.tone || 'friendly'
                }
            };

            const backendResponse = await enhancedBackendAPI.generateHighQualityResponse(backendRequest);
            responses.push({
                content: backendResponse.content,
                confidence: backendResponse.confidence,
                type: 'backend-api',
                model: backendResponse.metadata.model,
                qualityScore: backendResponse.metadata.qualityScore
            });
        } catch (error) {
            console.error('백엔드 API 응답 생성 실패:', error);
        }

        // 2. 기본 AI 응답
        try {
            const basicResponse = await this.generateBasicAIResponse(userInput, context);
            responses.push(basicResponse);
        } catch (error) {
            console.error('기본 AI 응답 생성 실패:', error);
        }

        // 3. 고급 분석 응답
        try {
            const advancedResponse = await this.generateAdvancedAnalysisResponse(userInput, context);
            responses.push(advancedResponse);
        } catch (error) {
            console.error('고급 분석 응답 생성 실패:', error);
        }

        // 4. 컨텍스트 기반 응답
        try {
            const contextualResponse = await this.generateContextualResponse(userInput, context);
            responses.push(contextualResponse);
        } catch (error) {
            console.error('컨텍스트 기반 응답 생성 실패:', error);
        }

        return responses;
    }

    /**
     * 기본 AI 응답 생성
     */
    private async generateBasicAIResponse(userInput: string, context: EnhancedResponseContext): Promise<{
        content: string;
        confidence: number;
        type: string;
        model: string;
    }> {
        const prompt = this.buildEnhancedPrompt(userInput, context, 'basic');

        const request: ChatRequest = {
            message: prompt,
            context: context.projectContext || {},
            options: {
                intent: 'conversation',
                style: context.userPreferences?.responseStyle || 'conversational',
                tone: context.userPreferences?.tone || 'friendly',
                requireCitations: true
            }
        };

        const response = await sendChatMessage(request);

        return {
            content: response.success && response.message ? response.message.content : '기본 응답을 생성할 수 없습니다.',
            confidence: 0.7,
            type: 'basic',
            model: 'basic-ai'
        };
    }

    /**
     * 고급 분석 응답 생성
     */
    private async generateAdvancedAnalysisResponse(userInput: string, context: EnhancedResponseContext): Promise<{
        content: string;
        confidence: number;
        type: string;
        model: string;
    }> {
        const prompt = this.buildEnhancedPrompt(userInput, context, 'advanced');

        const request: ChatRequest = {
            message: prompt,
            context: context.projectContext || {},
            options: {
                intent: 'analysis',
                style: 'technical',
                tone: 'professional',
                requireCitations: true
            }
        };

        const response = await sendChatMessage(request);

        return {
            content: response.success && response.message ? response.message.content : '고급 분석을 수행할 수 없습니다.',
            confidence: 0.85,
            type: 'advanced',
            model: 'advanced-analysis'
        };
    }

    /**
     * 컨텍스트 기반 응답 생성
     */
    private async generateContextualResponse(userInput: string, context: EnhancedResponseContext): Promise<{
        content: string;
        confidence: number;
        type: string;
        model: string;
    }> {
        const prompt = this.buildEnhancedPrompt(userInput, context, 'contextual');

        const request: ChatRequest = {
            message: prompt,
            context: {
                ...context.projectContext,
                conversationHistory: context.conversationHistory,
                userPreferences: context.userPreferences
            },
            options: {
                intent: 'contextual',
                style: context.userPreferences?.responseStyle || 'conversational',
                tone: context.userPreferences?.tone || 'friendly',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(request);

        return {
            content: response.success && response.message ? response.message.content : '컨텍스트 기반 응답을 생성할 수 없습니다.',
            confidence: 0.8,
            type: 'contextual',
            model: 'contextual-ai'
        };
    }

    /**
     * 향상된 프롬프트 빌더
     */
    private buildEnhancedPrompt(userInput: string, context: EnhancedResponseContext, type: string): string {
        // 응답 길이에 따른 지시사항
        const lengthInstruction = this.getLengthInstruction(context.userPreferences?.responseLength);

        const basePrompt = `다음 사용자 입력에 대해 고품질의 답변을 생성해주세요:

**사용자 입력:** ${userInput}

**사용자 선호도:**
- 스타일: ${context.userPreferences?.responseStyle || 'conversational'}
- 상세도: ${context.userPreferences?.detailLevel || 'balanced'}
- 톤: ${context.userPreferences?.tone || 'friendly'}
- 언어: ${context.userPreferences?.language || 'korean'}
- 응답 길이: ${lengthInstruction}

**대화 컨텍스트:**
${context.conversationHistory.length > 0 ? `최근 ${context.conversationHistory.length}개 메시지가 있습니다.` : '새로운 대화입니다.'}

요청하신 내용에 대해 ${lengthInstruction} 답변을 제공해주세요.`;

        switch (type) {
            case 'basic':
                return basePrompt + '\n\n**응답 유형:** 기본 대화형 응답';
            case 'advanced':
                return basePrompt + '\n\n**응답 유형:** 고급 분석 및 전문적 조언';
            case 'contextual':
                return basePrompt + '\n\n**응답 유형:** 맥락을 고려한 맞춤형 응답';
            default:
                return basePrompt;
        }
    }

    /**
     * 응답 길이에 따른 지시사항 생성
     */
    private getLengthInstruction(responseLength?: 'short' | 'medium' | 'long'): string {
        switch (responseLength) {
            case 'short':
                return '간결하고 핵심적인 내용만 포함하여 짧게 (2-3문장)';
            case 'long':
                return '상세하고 포괄적인 내용을 포함하여 길게 (5-7문장 이상)';
            case 'medium':
            default:
                return '균형잡힌 내용으로 적당한 길이 (3-5문장)';
        }
    }

    /**
     * 응답 품질 평가 및 최적 응답 선택
     */
    private async evaluateAndSelectBestResponse(
        responses: Array<{
            content: string;
            confidence: number;
            type: string;
            model: string;
            qualityScore?: number;
        }>,
        context: EnhancedResponseContext
    ): Promise<{
        content: string;
        confidence: number;
        type: string;
        model: string;
        qualityScore: number;
        sourcesUsed?: number;
        improvements?: string[];
        limitations?: string[];
    }> {
        if (responses.length === 0) {
            throw new Error('생성된 응답이 없습니다.');
        }

        // 각 응답의 품질 평가
        const evaluatedResponses = await Promise.all(
            responses.map(async (response) => {
                const qualityMetrics = await this.evaluateResponseQuality(response, context);
                return {
                    ...response,
                    qualityScore: qualityMetrics.overall,
                    qualityMetrics
                };
            })
        );

        // 최고 품질 응답 선택
        const bestResponse = evaluatedResponses.reduce((best, current) =>
            current.qualityScore > best.qualityScore ? current : best
        );

        console.log('🎯 최적 응답 선택:', {
            type: bestResponse.type,
            qualityScore: bestResponse.qualityScore,
            confidence: bestResponse.confidence
        });

        return {
            content: bestResponse.content,
            confidence: bestResponse.confidence,
            type: bestResponse.type,
            model: bestResponse.model,
            qualityScore: bestResponse.qualityScore,
            sourcesUsed: 1,
            improvements: ['다중 모델 병렬 처리', '품질 평가 시스템', '최적 응답 선택'],
            limitations: ['제한된 정보 소스', '시간적 제약']
        };
    }

    /**
     * 응답 품질 평가
     */
    private async evaluateResponseQuality(
        response: {
            content: string;
            confidence: number;
            type: string;
            model: string;
        },
        context: EnhancedResponseContext
    ): Promise<ResponseQualityMetrics> {
        const content = response.content;

        // 기본 품질 지표 계산
        const relevance = this.calculateRelevance(content, context.userInput);
        const accuracy = this.calculateAccuracy(content);
        const completeness = this.calculateCompleteness(content, context.userInput);
        const clarity = this.calculateClarity(content);
        const helpfulness = this.calculateHelpfulness(content, context);

        const overall = (relevance + accuracy + completeness + clarity + helpfulness) / 5;

        return {
            relevance,
            accuracy,
            completeness,
            clarity,
            helpfulness,
            overall
        };
    }

    /**
     * 관련성 계산
     */
    private calculateRelevance(content: string, userInput: string): number {
        const inputWords = userInput.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);

        const matchingWords = inputWords.filter(word =>
            contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
        );

        return Math.min(1.0, matchingWords.length / Math.max(1, inputWords.length));
    }

    /**
     * 정확성 계산
     */
    private calculateAccuracy(content: string): number {
        // 기본 정확성 점수 (실제로는 더 복잡한 로직 필요)
        const hasCitations = content.includes('[') && content.includes(']');
        const hasSpecificInfo = content.length > 100;
        const hasStructure = content.includes('\n') || content.includes('•') || content.includes('-');

        let score = 0.7; // 기본 점수
        if (hasCitations) score += 0.1;
        if (hasSpecificInfo) score += 0.1;
        if (hasStructure) score += 0.1;

        return Math.min(1.0, score);
    }

    /**
     * 완성도 계산
     */
    private calculateCompleteness(content: string, userInput: string): number {
        const inputLength = userInput.length;
        const contentLength = content.length;

        // 입력 대비 응답 길이 비율
        const lengthRatio = contentLength / Math.max(1, inputLength);

        // 적절한 길이 범위 (너무 짧거나 길지 않음)
        if (lengthRatio >= 2 && lengthRatio <= 10) {
            return 0.9;
        } else if (lengthRatio >= 1 && lengthRatio <= 15) {
            return 0.7;
        } else {
            return 0.5;
        }
    }

    /**
     * 명확성 계산
     */
    private calculateClarity(content: string): number {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.length, 0) / Math.max(1, sentences.length);

        // 적절한 문장 길이 (너무 길거나 짧지 않음)
        if (avgSentenceLength >= 20 && avgSentenceLength <= 80) {
            return 0.9;
        } else if (avgSentenceLength >= 10 && avgSentenceLength <= 120) {
            return 0.7;
        } else {
            return 0.5;
        }
    }

    /**
     * 도움성 계산
     */
    private calculateHelpfulness(content: string, context: EnhancedResponseContext): number {
        let score = 0.7; // 기본 점수

        // 구체적인 정보 포함
        if (content.includes('예시') || content.includes('예를 들어') || content.includes('구체적으로')) {
            score += 0.1;
        }

        // 다음 단계 제안
        if (content.includes('다음') || content.includes('추가로') || content.includes('권장')) {
            score += 0.1;
        }

        // 사용자 선호도 반영
        const style = context.userPreferences?.responseStyle;
        if (style === 'conversational' && (content.includes('~입니다') || content.includes('~해요'))) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 품질 분석 기반 응답 정제
     */
    private async refineResponseWithQualityAnalysis(
        response: {
            content: string;
            confidence: number;
            type: string;
            model: string;
            qualityScore?: number;
        },
        qualityAnalysis: ResponseAnalysis,
        context: EnhancedResponseContext
    ): Promise<{
        content: string;
        confidence: number;
        qualityScore: number;
        sourcesUsed?: number;
        improvements?: string[];
        limitations?: string[];
    }> {
        console.log('🔧 품질 분석 기반 응답 정제 시작...');

        let refinedContent = response.content;
        let qualityScore = response.qualityScore || 0.7;

        // 고우선순위 개선사항 적용
        const highPriorityImprovements = qualityAnalysis.improvements.filter(imp => imp.priority === 'high');

        if (highPriorityImprovements.length > 0) {
            console.log(`🔴 고우선순위 개선사항 ${highPriorityImprovements.length}개 적용 중...`);

            for (const improvement of highPriorityImprovements.slice(0, 2)) { // 최대 2개만 적용
                refinedContent = await this.applyImprovement(refinedContent, improvement, context);
                qualityScore = Math.min(1.0, qualityScore + 0.1); // 각 개선으로 10% 향상
            }
        }

        // 중우선순위 개선사항 적용
        const mediumPriorityImprovements = qualityAnalysis.improvements.filter(imp => imp.priority === 'medium');

        if (mediumPriorityImprovements.length > 0) {
            console.log(`🟡 중우선순위 개선사항 ${mediumPriorityImprovements.length}개 적용 중...`);

            for (const improvement of mediumPriorityImprovements.slice(0, 1)) { // 최대 1개만 적용
                refinedContent = await this.applyImprovement(refinedContent, improvement, context);
                qualityScore = Math.min(1.0, qualityScore + 0.05); // 각 개선으로 5% 향상
            }
        }

        // 품질 분석 정보를 응답에 포함
        const qualityInfo = this.generateQualityInfo(qualityAnalysis);
        refinedContent += qualityInfo;

        console.log(`✅ 품질 분석 기반 정제 완료 (최종 품질: ${(qualityScore * 100).toFixed(1)}%)`);

        return {
            content: refinedContent,
            confidence: Math.min(1.0, response.confidence * qualityAnalysis.qualityMetrics.confidence),
            qualityScore,
            sourcesUsed: 0,
            improvements: qualityAnalysis.improvements.map(imp => `${imp.dimension}: ${imp.suggestions[0]}`),
            limitations: qualityAnalysis.weaknesses
        };
    }

    /**
     * 개선사항 적용
     */
    private async applyImprovement(
        content: string,
        improvement: {
            dimension: string;
            currentScore: number;
            targetScore: number;
            suggestions: string[];
            priority: 'high' | 'medium' | 'low';
        },
        context: EnhancedResponseContext
    ): Promise<string> {
        const improvementPrompt = `다음 응답을 개선해주세요:

**원본 응답:**
${content}

**개선 요구사항:**
- ${improvement.dimension} 차원 개선 필요
- 현재 점수: ${(improvement.currentScore * 100).toFixed(1)}%
- 목표 점수: ${(improvement.targetScore * 100).toFixed(1)}%
- 구체적 제안: ${improvement.suggestions.join(', ')}

**사용자 선호도:**
- 스타일: ${context.userPreferences?.responseStyle || 'conversational'}
- 톤: ${context.userPreferences?.tone || 'friendly'}
- 상세도: ${context.userPreferences?.detailLevel || 'balanced'}

개선된 응답을 제공해주세요.`;

        try {
            const request: ChatRequest = {
                message: improvementPrompt,
                context: context.projectContext || {},
                options: {
                    intent: 'improvement',
                    style: context.userPreferences?.responseStyle || 'conversational',
                    tone: context.userPreferences?.tone || 'friendly',
                    requireCitations: false
                }
            };

            const response = await sendChatMessage(request);
            return response.success && response.message ? response.message.content : content;
        } catch (error) {
            console.error('개선사항 적용 실패:', error);
            return content;
        }
    }

    /**
     * 품질 정보 생성
     */
    private generateQualityInfo(qualityAnalysis: ResponseAnalysis): string {
        const metrics = qualityAnalysis.qualityMetrics;

        return `

---
**🎯 고급 품질 분석 결과**
📊 전체 품질: ${(metrics.overall * 100).toFixed(1)}%
🔍 신뢰도: ${(metrics.confidence * 100).toFixed(1)}%

**📈 세부 품질 지표:**
• 관련성: ${(metrics.relevance.score * 100).toFixed(1)}%
• 정확성: ${(metrics.accuracy.score * 100).toFixed(1)}%
• 완성도: ${(metrics.completeness.score * 100).toFixed(1)}%
• 명확성: ${(metrics.clarity.score * 100).toFixed(1)}%
• 도움성: ${(metrics.helpfulness.score * 100).toFixed(1)}%
• 일관성: ${(metrics.coherence.score * 100).toFixed(1)}%
• 창의성: ${(metrics.creativity.score * 100).toFixed(1)}%
• 기술적 깊이: ${(metrics.technicalDepth.score * 100).toFixed(1)}%

**✅ 강점:**
${qualityAnalysis.strengths.map(strength => `• ${strength}`).join('\n')}

**⚠️ 개선사항:**
${qualityAnalysis.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}
`;
    }

    /**
     * 응답 내용 개선
     */
    private async improveResponseContent(content: string, context: EnhancedResponseContext): Promise<string> {
        const improvementPrompt = `다음 응답을 개선해주세요:

**원본 응답:**
${content}

**개선 요구사항:**
- 더 명확하고 이해하기 쉽게 작성
- 구체적인 예시나 설명 추가
- 사용자 선호도에 맞는 스타일로 조정
- 문법과 맞춤법 검토

개선된 응답을 제공해주세요.`;

        try {
            const request: ChatRequest = {
                message: improvementPrompt,
                context: context.projectContext || {},
                options: {
                    intent: 'improvement',
                    style: context.userPreferences?.responseStyle || 'conversational',
                    tone: context.userPreferences?.tone || 'friendly',
                    requireCitations: false
                }
            };

            const response = await sendChatMessage(request);

            return response.success && response.message ? response.message.content : content;
        } catch (error) {
            console.error('응답 개선 실패:', error);
            return content; // 개선 실패시 원본 반환
        }
    }

    /**
     * 최종 응답 검증
     */
    private async validateFinalResponse(
        response: {
            content: string;
            confidence: number;
            qualityScore: number;
            sourcesUsed?: number;
            improvements?: string[];
            limitations?: string[];
        },
        context: EnhancedResponseContext
    ): Promise<{
        content: string;
        confidence: number;
        qualityScore: number;
        sourcesUsed?: number;
        improvements?: string[];
        limitations?: string[];
    }> {
        // 품질 임계값 확인
        if (response.qualityScore < this.qualityThreshold) {
            console.warn('⚠️ 응답 품질이 임계값 미달:', response.qualityScore);

            // 재시도 로직
            for (let i = 0; i < this.maxRetries; i++) {
                try {
                    const retryResponse = await this.generateBasicAIResponse(context.userInput, context);
                    const retryQuality = await this.evaluateResponseQuality(retryResponse, context);

                    if (retryQuality.overall > response.qualityScore) {
                        console.log(`🔄 재시도 ${i + 1} 성공: 품질 향상 ${response.qualityScore} → ${retryQuality.overall}`);
                        return {
                            content: retryResponse.content,
                            confidence: retryResponse.confidence,
                            qualityScore: retryQuality.overall,
                            sourcesUsed: 1,
                            improvements: ['재시도 로직을 통한 품질 향상'],
                            limitations: ['제한된 재시도 횟수']
                        };
                    }
                } catch (error) {
                    console.error(`재시도 ${i + 1} 실패:`, error);
                }
            }
        }

        return response;
    }

    /**
     * 폴백 응답 생성
     */
    private createFallbackResponse(userInput: string, processingTime: number): EnhancedResponseResult {
        return {
            content: `죄송합니다. "${userInput}"에 대한 답변을 생성하는 중에 오류가 발생했습니다. 다시 시도해주시거나 다른 방식으로 질문해주세요.`,
            confidence: 0.3,
            processingTime,
            qualityScore: 0.3,
            metadata: {
                model: 'fallback',
                tokens: 0,
                reasoningSteps: 0,
                sourcesUsed: 0,
                improvements: ['오류 복구 필요'],
                limitations: ['시스템 오류로 인한 제한된 응답']
            }
        };
    }
}

// 싱글톤 인스턴스 생성
const enhancedResponseProcessor = new EnhancedResponseProcessor();

export default enhancedResponseProcessor;
