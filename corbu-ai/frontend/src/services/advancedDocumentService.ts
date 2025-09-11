import { Message } from '../types/chat';

export interface AdvancedDocumentRequest {
    documentText: string;
    conversationHistory: Message[];
    userConditions: string[];
    stylePreferences?: Record<string, unknown>;
    contextId?: string;
    priorityLevel?: 'high' | 'normal' | 'low';
}

export interface DocumentStructure {
    sections: Array<{
        type: string;
        content: string;
        level: number;
        lineNumber: number;
        subsections: Array<{
            type: string;
            content: string;
            lineNumber: number;
        }>;
    }>;
    hierarchy: Record<string, unknown>;
    keyPoints: string[];
    mainTopics: string[];
    supportingDetails: string[];
    processingTime: number;
}

export interface MultiConditionAnalysis {
    primaryCondition: string;
    secondaryConditions: string[];
    conditionalStatements: string[];
    dependencies: Array<{
        prerequisite: string;
        dependentTask: string;
    }>;
    priorityOrder: string[];
    complexityScore: number;
}

export interface ContextMemory {
    conversationId: string;
    contextWindows: Array<{
        content: string;
        timestamp: string;
        type: string;
        importance: number;
        memoryWeight: number;
    }>;
    longTermMemory: Record<string, any>;
    keyEntities: Record<string, any>;
    relationshipGraph: Record<string, any>;
    styleProfile: Record<string, any>;
    memoryStrength: number;
}

export interface StyleAnalysis {
    tone: string;
    formalityLevel: number;
    emotionIndicators: string[];
    vocabularyStyle: string;
    sentencePatterns: string[];
    characteristicPhrases: string[];
    consistencyScore: number;
}

export interface AdvancedDocumentResponse {
    documentStructure: DocumentStructure;
    multiConditionAnalysis: MultiConditionAnalysis;
    contextMemory: ContextMemory;
    styleAnalysis: StyleAnalysis;
    processedResponse: string;
    detailPreservationScore: number;
    contextContinuityScore: number;
    processingMetadata: {
        processingTime: number;
        cacheUsed: boolean;
        parallelProcessing: boolean;
        complexityLevel: number;
        memoryStrength: number;
    };
}

class AdvancedDocumentService {
    private baseUrl = 'http://localhost:8005/api/v9';
    private cache = new Map<string, { data: any; timestamp: number }>();
    private cacheTTL = 3600000; // 1시간

    async processAdvancedDocument(request: AdvancedDocumentRequest): Promise<AdvancedDocumentResponse> {
        try {
            // 캐시 확인
            const cacheKey = this.generateCacheKey(request);
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }

            const response = await fetch(`${this.baseUrl}/advanced-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    document_text: request.documentText,
                    conversation_history: request.conversationHistory,
                    user_conditions: request.userConditions,
                    style_preferences: request.stylePreferences,
                    context_id: request.contextId,
                    priority_level: request.priorityLevel || 'normal'
                })
            });

            if (response.ok) {
                const data = await response.json();
                const result = this.transformResponse(data);

                // 캐시에 저장
                this.saveToCache(cacheKey, result);

                return result;
            } else {
                throw new Error('고급 문서 처리 API 호출 실패');
            }
        } catch (error) {
            console.error('고급 문서 처리 오류:', error);
            return this.createFallbackResponse(request);
        }
    }

    // 긴 대화 맥락 분석
    async analyzeLongConversation(messages: Message[], contextId?: string): Promise<{
        memoryStrength: number;
        continuityScore: number;
        keyTopics: string[];
        styleConsistency: number;
        recommendations: string[];
    }> {
        try {
            const request: AdvancedDocumentRequest = {
                documentText: messages.map(m => m.content).join('\n'),
                conversationHistory: messages,
                userConditions: [],
                contextId
            };

            const response = await this.processAdvancedDocument(request);

            return {
                memoryStrength: response.contextMemory.memoryStrength,
                continuityScore: response.contextContinuityScore,
                keyTopics: response.documentStructure.mainTopics,
                styleConsistency: response.styleAnalysis.consistencyScore,
                recommendations: this.generateContinuityRecommendations(response)
            };
        } catch (error) {
            console.error('긴 대화 분석 오류:', error);
            return {
                memoryStrength: 0.5,
                continuityScore: 0.5,
                keyTopics: [],
                styleConsistency: 0.5,
                recommendations: ['더 많은 대화 데이터가 필요합니다.']
            };
        }
    }

    // 복잡한 요청 처리
    async processComplexRequest(message: string, history: Message[], conditions: string[]): Promise<{
        response: string;
        processingTime: number;
        complexityScore: number;
        priorityOrder: string[];
        suggestions: string[];
    }> {
        try {
            const startTime = performance.now();

            const request: AdvancedDocumentRequest = {
                documentText: message,
                conversationHistory: history,
                userConditions: conditions,
                priorityLevel: conditions.length > 3 ? 'high' : 'normal'
            };

            const response = await this.processAdvancedDocument(request);
            const processingTime = performance.now() - startTime;

            return {
                response: response.processedResponse,
                processingTime,
                complexityScore: response.multiConditionAnalysis.complexityScore,
                priorityOrder: response.multiConditionAnalysis.priorityOrder,
                suggestions: this.generateComplexRequestSuggestions(response)
            };
        } catch (error) {
            console.error('복잡한 요청 처리 오류:', error);
            return {
                response: '요청을 처리했습니다. 더 구체적인 설명을 해주시면 정확한 답변을 드릴 수 있습니다.',
                processingTime: 0,
                complexityScore: 0,
                priorityOrder: [],
                suggestions: ['요청을 더 구체적으로 설명해주세요.']
            };
        }
    }

    // 맥락 유지 대화 생성
    async generateContextualResponse(
        message: string,
        history: Message[],
        contextId: string
    ): Promise<{
        response: string;
        contextStrength: number;
        styleMatching: number;
        detailPreservation: number;
        followUpSuggestions: string[];
    }> {
        try {
            const request: AdvancedDocumentRequest = {
                documentText: message,
                conversationHistory: history,
                userConditions: [message],
                contextId
            };

            const response = await this.processAdvancedDocument(request);

            return {
                response: response.processedResponse,
                contextStrength: response.contextMemory.memoryStrength,
                styleMatching: response.styleAnalysis.consistencyScore,
                detailPreservation: response.detailPreservationScore,
                followUpSuggestions: this.generateFollowUpSuggestions(response)
            };
        } catch (error) {
            console.error('맥락 유지 대화 생성 오류:', error);
            return {
                response: '이전 대화를 고려하여 답변드리겠습니다.',
                contextStrength: 0.5,
                styleMatching: 0.5,
                detailPreservation: 0.5,
                followUpSuggestions: []
            };
        }
    }

    // 스타일 일관성 분석
    async analyzeStyleConsistency(messages: Message[]): Promise<{
        overallConsistency: number;
        toneStability: number;
        formalityConsistency: number;
        vocabularyConsistency: number;
        recommendations: string[];
    }> {
        try {
            const userMessages = messages.filter(m => m.isUser);
            if (userMessages.length < 3) {
                return {
                    overallConsistency: 1.0,
                    toneStability: 1.0,
                    formalityConsistency: 1.0,
                    vocabularyConsistency: 1.0,
                    recommendations: ['더 많은 메시지가 필요합니다.']
                };
            }

            const request: AdvancedDocumentRequest = {
                documentText: userMessages.map(m => m.content).join('\n'),
                conversationHistory: messages,
                userConditions: []
            };

            const response = await this.processAdvancedDocument(request);

            return {
                overallConsistency: response.styleAnalysis.consistencyScore,
                toneStability: this.calculateToneStability(response.styleAnalysis),
                formalityConsistency: this.calculateFormalityConsistency(response.styleAnalysis),
                vocabularyConsistency: this.calculateVocabularyConsistency(response.styleAnalysis),
                recommendations: this.generateStyleRecommendations(response.styleAnalysis)
            };
        } catch (error) {
            console.error('스타일 일관성 분석 오류:', error);
            return {
                overallConsistency: 0.5,
                toneStability: 0.5,
                formalityConsistency: 0.5,
                vocabularyConsistency: 0.5,
                recommendations: ['분석에 오류가 발생했습니다.']
            };
        }
    }

    // 처리 통계 조회
    async getProcessingStats(): Promise<{
        totalRequests: number;
        avgProcessingTime: number;
        cacheHits: number;
        performanceMetrics: Record<string, any>;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            if (response.ok) {
                const data = await response.json();
                return {
                    totalRequests: data.total_requests,
                    avgProcessingTime: data.avg_processing_time,
                    cacheHits: data.cache_hits,
                    performanceMetrics: data
                };
            }
            throw new Error('통계 조회 실패');
        } catch (error) {
            console.error('처리 통계 조회 오류:', error);
            return {
                totalRequests: 0,
                avgProcessingTime: 0,
                cacheHits: 0,
                performanceMetrics: {}
            };
        }
    }

    // 헬퍼 메서드들
    private generateCacheKey(request: AdvancedDocumentRequest): string {
        const keyData = {
            textHash: this.simpleHash(request.documentText),
            conditionsHash: this.simpleHash(JSON.stringify(request.userConditions)),
            historyLength: request.conversationHistory.length
        };
        return `adv_doc_${this.simpleHash(JSON.stringify(keyData))}`;
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer로 변환
        }
        return Math.abs(hash);
    }

    private getFromCache(key: string): AdvancedDocumentResponse | null {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            return cached.data;
        }
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }

    private saveToCache(key: string, data: AdvancedDocumentResponse): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private transformResponse(data: any): AdvancedDocumentResponse {
        return {
            documentStructure: {
                sections: data.document_structure.sections,
                hierarchy: data.document_structure.hierarchy,
                keyPoints: data.document_structure.key_points,
                mainTopics: data.document_structure.main_topics,
                supportingDetails: data.document_structure.supporting_details,
                processingTime: data.document_structure.processing_time
            },
            multiConditionAnalysis: {
                primaryCondition: data.multi_condition_analysis.primary_condition,
                secondaryConditions: data.multi_condition_analysis.secondary_conditions,
                conditionalStatements: data.multi_condition_analysis.conditional_statements,
                dependencies: data.multi_condition_analysis.dependencies,
                priorityOrder: data.multi_condition_analysis.priority_order,
                complexityScore: data.multi_condition_analysis.complexity_score
            },
            contextMemory: {
                conversationId: data.context_memory.conversation_id,
                contextWindows: data.context_memory.context_windows,
                longTermMemory: data.context_memory.long_term_memory,
                keyEntities: data.context_memory.key_entities,
                relationshipGraph: data.context_memory.relationship_graph,
                styleProfile: data.context_memory.style_profile,
                memoryStrength: data.context_memory.memory_strength
            },
            styleAnalysis: {
                tone: data.style_analysis.tone,
                formalityLevel: data.style_analysis.formality_level,
                emotionIndicators: data.style_analysis.emotion_indicators,
                vocabularyStyle: data.style_analysis.vocabulary_style,
                sentencePatterns: data.style_analysis.sentence_patterns,
                characteristicPhrases: data.style_analysis.characteristic_phrases,
                consistencyScore: data.style_analysis.consistency_score
            },
            processedResponse: data.processed_response,
            detailPreservationScore: data.detail_preservation_score,
            contextContinuityScore: data.context_continuity_score,
            processingMetadata: data.processing_metadata
        };
    }

    private generateContinuityRecommendations(response: AdvancedDocumentResponse): string[] {
        const recommendations = [];

        if (response.contextMemory.memoryStrength < 0.5) {
            recommendations.push('대화 맥락을 더 풍부하게 만들어 보세요.');
        }

        if (response.styleAnalysis.consistencyScore < 0.7) {
            recommendations.push('일관된 어투와 스타일을 유지해 보세요.');
        }

        if (response.contextContinuityScore < 0.6) {
            recommendations.push('이전 주제와의 연결성을 강화해 보세요.');
        }

        return recommendations;
    }

    private generateComplexRequestSuggestions(response: AdvancedDocumentResponse): string[] {
        const suggestions = [];

        if (response.multiConditionAnalysis.complexityScore > 0.8) {
            suggestions.push('복잡한 요청을 단계별로 나누어 처리하는 것을 고려해보세요.');
        }

        if (response.multiConditionAnalysis.dependencies.length > 0) {
            suggestions.push('의존성이 있는 작업들의 순서를 확인해보세요.');
        }

        if (response.processingMetadata.processingTime > 2000) {
            suggestions.push('요청을 더 간단하게 나누면 처리 속도가 향상됩니다.');
        }

        return suggestions;
    }

    private generateFollowUpSuggestions(response: AdvancedDocumentResponse): string[] {
        const suggestions = [];

        response.documentStructure.mainTopics.forEach(topic => {
            suggestions.push(`${topic}에 대해 더 자세히 알고 싶으시면 말씀해주세요.`);
        });

        if (response.styleAnalysis.emotionIndicators.length > 0) {
            suggestions.push('감정적인 측면을 더 고려한 답변이 필요하시면 말씀해주세요.');
        }

        return suggestions.slice(0, 3); // 최대 3개만
    }

    private calculateToneStability(styleAnalysis: StyleAnalysis): number {
        // 톤의 안정성을 계산 (실제로는 더 복잡한 로직)
        return styleAnalysis.tone === 'neutral' ? 0.8 : 0.9;
    }

    private calculateFormalityConsistency(styleAnalysis: StyleAnalysis): number {
        // 격식 수준의 일관성을 계산
        return Math.abs(styleAnalysis.formalityLevel - 0.5) < 0.2 ? 0.9 : 0.7;
    }

    private calculateVocabularyConsistency(styleAnalysis: StyleAnalysis): number {
        // 어휘 일관성을 계산
        return styleAnalysis.vocabularyStyle === 'standard' ? 0.8 : 0.7;
    }

    private generateStyleRecommendations(styleAnalysis: StyleAnalysis): string[] {
        const recommendations = [];

        if (styleAnalysis.consistencyScore < 0.7) {
            recommendations.push('일관된 어투를 유지해보세요.');
        }

        if (styleAnalysis.formalityLevel < 0.3) {
            recommendations.push('좀 더 격식 있는 표현을 사용해보세요.');
        } else if (styleAnalysis.formalityLevel > 0.8) {
            recommendations.push('좀 더 친근한 표현을 사용해보세요.');
        }

        if (styleAnalysis.emotionIndicators.length === 0) {
            recommendations.push('감정 표현을 더 풍부하게 해보세요.');
        }

        return recommendations;
    }

    private createFallbackResponse(request: AdvancedDocumentRequest): AdvancedDocumentResponse {
        return {
            documentStructure: {
                sections: [],
                hierarchy: {},
                keyPoints: [],
                mainTopics: [],
                supportingDetails: [],
                processingTime: 0
            },
            multiConditionAnalysis: {
                primaryCondition: '',
                secondaryConditions: [],
                conditionalStatements: [],
                dependencies: [],
                priorityOrder: [],
                complexityScore: 0
            },
            contextMemory: {
                conversationId: 'fallback',
                contextWindows: [],
                longTermMemory: {},
                keyEntities: {},
                relationshipGraph: {},
                styleProfile: {},
                memoryStrength: 0.5
            },
            styleAnalysis: {
                tone: 'neutral',
                formalityLevel: 0.5,
                emotionIndicators: [],
                vocabularyStyle: 'standard',
                sentencePatterns: [],
                characteristicPhrases: [],
                consistencyScore: 0.5
            },
            processedResponse: '문서를 처리했습니다. 더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.',
            detailPreservationScore: 0.5,
            contextContinuityScore: 0.5,
            processingMetadata: {
                processingTime: 0,
                cacheUsed: false,
                parallelProcessing: false,
                complexityLevel: 0,
                memoryStrength: 0.5
            }
        };
    }
}

export const advancedDocumentService = new AdvancedDocumentService();
