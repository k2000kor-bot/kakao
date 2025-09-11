// 실시간 지식 베이스 업데이트 및 학습 시스템
import { clientFileProcessor, FileAnalysisResult } from './clientFileProcessor';
import { learningFeedbackSystem } from './learningFeedbackSystem';

interface RealTimeKnowledgeUpdate {
    projectId: string;
    timestamp: string;
    updateType: 'knowledge' | 'writing' | 'analysis' | 'learning';
    data: Record<string, unknown>;
    confidence: number;
}

interface KnowledgeSyncStatus {
    projectId: string;
    lastSync: string;
    syncStatus: 'synced' | 'pending' | 'failed';
    pendingUpdates: number;
    errorCount: number;
}

export interface KnowledgeUpdateEvent {
    id: string;
    type: 'file_added' | 'file_updated' | 'pattern_learned' | 'insight_generated' | 'knowledge_connected';
    projectId: string;
    timestamp: Date;
    source: {
        fileId?: string;
        fileName?: string;
        fileType?: string;
    };
    changes: {
        addedTopics: string[];
        updatedEntities: Record<string, string[]>;
        newInsights: string[];
        connectedKnowledge: string[];
    };
    impact: {
        confidence: number;
        relevanceScore: number;
        affectedAreas: string[];
    };
}

export interface SmartKnowledgeConnection {
    id: string;
    sourceFiles: string[];
    connectionType: 'topic_similarity' | 'entity_overlap' | 'temporal_sequence' | 'causal_relationship';
    strength: number;
    description: string;
    insights: string[];
    suggestedActions: string[];
    createdAt: Date;
}

export interface ConversationContext {
    projectId: string;
    sessionId: string;
    messageHistory: Array<{
        id: string;
        content: string;
        sender: 'user' | 'ai';
        timestamp: Date;
        attachments?: Array<{
            fileId: string;
            fileName: string;
            analysis: any; // FileAnalysisResult | MediaAnalysisResult;
        }>;
    }>;
    activeKnowledge: {
        relevantFiles: string[];
        keyTopics: string[];
        contextualInsights: string[];
        suggestedQuestions: string[];
    };
    learningState: {
        newPatternsDetected: number;
        knowledgeGrowth: number;
        confidenceImprovement: number;
        lastUpdate: Date;
    };
}

export interface IntelligentResponse {
    response: string;
    confidence: number;
    sourceFiles: Array<{
        fileId: string;
        fileName: string;
        relevanceScore: number;
        usedSections: string[];
    }>;
    knowledgeInsights: string[];
    followUpQuestions: string[];
    suggestedActions: string[];
    learningFeedback: {
        newKnowledgeGained: boolean;
        patternsReinforced: string[];
        confidenceUpdated: boolean;
    };
}

export class RealTimeKnowledgeSystem {
    private knowledgeUpdates = new Map<string, KnowledgeUpdateEvent[]>();
    private smartConnections = new Map<string, SmartKnowledgeConnection[]>();
    private conversationContexts = new Map<string, ConversationContext>();
    private updateSubscribers = new Map<string, Array<(event: KnowledgeUpdateEvent) => void>>();

    // 파일 추가시 실시간 지식 업데이트
    async processNewFile(file: File, projectId: string, sessionIdParam?: string): Promise<{
        fileAnalysis: FileAnalysisResult;
        classification: {
            category: string;
            confidence: number;
            subCategories: string[];
            tags: string[];
        };
        knowledgeUpdate: KnowledgeUpdateEvent;
        smartConnections: SmartKnowledgeConnection[];
    }> {
        const sessionId = sessionIdParam || `session_${Date.now()}`;
        const context = this.conversationContexts.get(sessionId);

        try {
            // 1. 파일 분석 및 분류
            let fileAnalysis: FileAnalysisResult;
            fileAnalysis = await clientFileProcessor.processFile(file, projectId);

            const classification = await clientFileProcessor.classifyFile(file, projectId);

            // 2. 지식 베이스 업데이트 이벤트 생성
            const knowledgeUpdate = this.createKnowledgeUpdateEvent(fileAnalysis, classification, projectId);

            // 3. 스마트 연결 탐지
            const smartConnections = await this.detectSmartConnections(fileAnalysis, projectId);

            // 4. 실시간 업데이트 브로드캐스트
            this.notifySubscribers(projectId, knowledgeUpdate);

            // 5. 학습 패턴 강화
            await this.reinforceLearningPatterns(fileAnalysis, classification, projectId);

            return {
                fileAnalysis,
                classification,
                knowledgeUpdate,
                smartConnections
            };

        } catch (error) {
            console.error('실시간 파일 처리 실패:', error);
            throw new Error(`파일 처리 중 오류: ${error}`);
        }
    }

    // 대화 중 지능형 응답 생성
    async generateIntelligentResponse(
        userMessage: string,
        projectId: string,
        sessionId: string,
        attachedFiles?: File[]
    ): Promise<IntelligentResponse> {

        try {
            // 1. 첨부 파일 처리 (있는 경우)
            const attachmentAnalyses: Array<any> = []; // FileAnalysisResult | MediaAnalysisResult;
            if (attachedFiles && attachedFiles.length > 0) {
                for (const file of attachedFiles) {
                    const result = await this.processNewFile(file, projectId, sessionId);
                    attachmentAnalyses.push(result.fileAnalysis);
                }
            }

            // 2. 관련 지식 검색
            const relevantKnowledge = this.searchRelevantKnowledge(userMessage, projectId);

            // 3. 대화 컨텍스트 활용
            const conversationContext = this.conversationContexts.get(sessionId);

            // 4. 지능형 응답 생성
            const response = await this.generateContextualResponse(
                userMessage,
                relevantKnowledge,
                conversationContext,
                attachmentAnalyses
            );

            // 5. 학습 피드백 처리
            const learningFeedback = this.processLearningFeedback(userMessage, response, projectId);

            // 6. 대화 히스토리 업데이트
            this.updateConversationHistory(sessionId, userMessage, response.response, attachmentAnalyses);

            return {
                ...response,
                learningFeedback
            };

        } catch (error) {
            console.error('지능형 응답 생성 오류:', error);

            // 기본 응답 반환
            return {
                response: '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
                confidence: 0.1,
                sourceFiles: [],
                knowledgeInsights: [],
                followUpQuestions: [],
                suggestedActions: [],
                learningFeedback: {
                    newKnowledgeGained: false,
                    patternsReinforced: [],
                    confidenceUpdated: false
                }
            };
        }
    }

    private isMediaFile(file: File): boolean {
        return file.type.startsWith('image/') ||
            file.type.startsWith('video/') ||
            file.type.startsWith('audio/');
    }

    private generateFileId(file: File): string {
        return `file_${file.name}_${file.size}_${file.lastModified}`.replace(/[^a-zA-Z0-9]/g, '_');
    }

    private createKnowledgeUpdateEvent(
        analysis: FileAnalysisResult,
        classification: {
            category: string;
            confidence: number;
            subCategories: string[];
            tags: string[];
        },
        projectId: string
    ): KnowledgeUpdateEvent {

        const isMedia = 'fileType' in analysis && ['image', 'video', 'audio'].includes(analysis.fileType);
        const keyTopics = isMedia ?
            (analysis as any).knowledgeExtraction.keyTopics : // MediaAnalysisResult
            (analysis as any).keyTopics; // FileAnalysisResult

        const entities = isMedia ?
            (analysis as any).knowledgeExtraction.entities : // MediaAnalysisResult
            (analysis as any).entities; // FileAnalysisResult

        return {
            id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'file_added',
            projectId,
            timestamp: new Date(),
            source: {
                fileId: analysis.id, // 공통 속성
                fileName: analysis.fileName, // 공통 속성
                fileType: analysis.fileType // 공통 속성
            },
            changes: {
                addedTopics: keyTopics,
                updatedEntities: entities,
                newInsights: isMedia ?
                    (analysis as any).knowledgeExtraction.insights : // MediaAnalysisResult
                    [`${analysis.fileName}에서 ${keyTopics.length}개 주제 발견`],
                connectedKnowledge: []
            },
            impact: {
                confidence: analysis.confidence, // 공통 속성
                relevanceScore: classification.confidence,
                affectedAreas: [classification.category]
            }
        };
    }

    private async detectSmartConnections(
        newAnalysis: FileAnalysisResult,
        projectId: string
    ): Promise<SmartKnowledgeConnection[]> {

        const connections: SmartKnowledgeConnection[] = [];
        const existingConnections = this.smartConnections.get(projectId) || [];

        // 기존 지식과의 연결점 탐지
        const isMedia = 'fileType' in newAnalysis && ['image', 'video', 'audio'].includes(newAnalysis.fileType);
        const newTopics = isMedia ?
            (newAnalysis as any).knowledgeExtraction.keyTopics : // MediaAnalysisResult
            (newAnalysis as any).keyTopics; // FileAnalysisResult

        const newEntities = isMedia ?
            (newAnalysis as any).knowledgeExtraction.entities : // MediaAnalysisResult
            (newAnalysis as any).entities; // FileAnalysisResult

        // 1. 주제 유사성 기반 연결
        const topicConnections = this.findTopicSimilarityConnections(newAnalysis, newTopics, projectId);
        connections.push(...topicConnections);

        // 2. 엔티티 중복 기반 연결
        const entityConnections = this.findEntityOverlapConnections(newAnalysis, newEntities, projectId);
        connections.push(...entityConnections);

        // 3. 시간적 순서 기반 연결
        const temporalConnections = this.findTemporalConnections(newAnalysis, projectId);
        connections.push(...temporalConnections);

        // 4. 기존 연결에 추가
        connections.forEach(connection => {
            if (!existingConnections.find(existing => existing.id === connection.id)) {
                existingConnections.push(connection);
            }
        });

        this.smartConnections.set(projectId, existingConnections);
        return connections;
    }

    private findTopicSimilarityConnections(
        newAnalysis: FileAnalysisResult,
        newTopics: string[],
        projectId: string
    ): SmartKnowledgeConnection[] {

        const connections: SmartKnowledgeConnection[] = [];
        const knowledgeBase = clientFileProcessor.getKnowledgeBase(projectId);

        if (!knowledgeBase) return connections;

        // 기존 지식의 주제들과 비교
        const existingTopics = knowledgeBase.keyConcepts;
        const commonTopics = newTopics.filter(topic =>
            existingTopics.some(existing =>
                existing.includes(topic) || topic.includes(existing)
            )
        );

        if (commonTopics.length > 0) {
            connections.push({
                id: `topic_sim_${Date.now()}`,
                sourceFiles: [newAnalysis.id],
                connectionType: 'topic_similarity',
                strength: commonTopics.length / Math.max(newTopics.length, 1),
                description: `공통 주제: ${commonTopics.join(', ')}`,
                insights: [`${newAnalysis.fileName}이(가) 기존 지식과 ${commonTopics.length}개 주제를 공유합니다.`],
                suggestedActions: ['관련 파일들을 함께 검토해보세요', '주제별로 내용을 정리해보세요'],
                createdAt: new Date()
            });
        }

        return connections;
    }

    private findEntityOverlapConnections(
        newAnalysis: FileAnalysisResult,
        newEntities: any,
        projectId: string
    ): SmartKnowledgeConnection[] {

        const connections: SmartKnowledgeConnection[] = [];

        // 엔티티 중복 검사 로직 (간단화)
        const peopleCount = newEntities.people?.length || 0;
        const orgCount = newEntities.organizations?.length || 0;
        const locationCount = newEntities.locations?.length || 0;

        if (peopleCount > 0 || orgCount > 0 || locationCount > 0) {
            connections.push({
                id: `entity_overlap_${Date.now()}`,
                sourceFiles: [newAnalysis.id],
                connectionType: 'entity_overlap',
                strength: Math.min(1.0, (peopleCount + orgCount + locationCount) / 10),
                description: `엔티티 정보: 인물 ${peopleCount}명, 조직 ${orgCount}개, 장소 ${locationCount}개`,
                insights: [`${newAnalysis.fileName}에서 중요한 관계자 정보를 발견했습니다.`],
                suggestedActions: ['관련 인물들의 역할을 파악해보세요', '조직 관계도를 작성해보세요'],
                createdAt: new Date()
            });
        }

        return connections;
    }

    private findTemporalConnections(
        newAnalysis: FileAnalysisResult,
        projectId: string
    ): SmartKnowledgeConnection[] {

        const connections: SmartKnowledgeConnection[] = [];

        // 업로드 시간 기반 연결 (간단화)
        const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24시간
        const uploadTime = (newAnalysis as any).uploadTime || (newAnalysis as any).analysisTime;

        if (uploadTime && uploadTime.getTime() > recentThreshold) {
            connections.push({
                id: `temporal_${Date.now()}`,
                sourceFiles: [newAnalysis.id],
                connectionType: 'temporal_sequence',
                strength: 0.6,
                description: '최근 24시간 내 업로드된 파일',
                insights: ['최근 활동과 연관된 파일입니다.'],
                suggestedActions: ['최근 업로드된 다른 파일들과 함께 검토해보세요'],
                createdAt: new Date()
            });
        }

        return connections;
    }

    private updateConversationContext(
        sessionId: string,
        projectId: string,
        attachment: {
            fileId: string;
            fileName: string;
            analysis: any; // FileAnalysisResult | MediaAnalysisResult;
        }
    ) {
        let context = this.conversationContexts.get(sessionId);

        if (!context) {
            context = {
                projectId,
                sessionId,
                messageHistory: [],
                activeKnowledge: {
                    relevantFiles: [],
                    keyTopics: [],
                    contextualInsights: [],
                    suggestedQuestions: []
                },
                learningState: {
                    newPatternsDetected: 0,
                    knowledgeGrowth: 0,
                    confidenceImprovement: 0,
                    lastUpdate: new Date()
                }
            };
        }

        // 활성 지식 업데이트
        context.activeKnowledge.relevantFiles.push(attachment.fileId);

        const isMedia = 'fileType' in attachment.analysis && ['image', 'video', 'audio'].includes(attachment.analysis.fileType);
        const topics = isMedia ?
            (attachment.analysis as any).knowledgeExtraction.keyTopics : // MediaAnalysisResult
            (attachment.analysis as any).keyTopics; // FileAnalysisResult

        topics.forEach((topic: string) => {
            if (!context!.activeKnowledge.keyTopics.includes(topic)) {
                context!.activeKnowledge.keyTopics.push(topic);
            }
        });

        // 학습 상태 업데이트
        context.learningState.knowledgeGrowth += 1;
        context.learningState.lastUpdate = new Date();

        this.conversationContexts.set(sessionId, context);
    }

    private searchRelevantKnowledge(userMessage: string, projectId: string) {
        const knowledgeBase = clientFileProcessor.getKnowledgeBase(projectId);
        const writingMaterials = clientFileProcessor.getWritingMaterials(projectId);
        // const mediaContext = mediaAnalysisService.getConversationContext(projectId); // mediaAnalysisService 제거

        const relevantFiles: any[] = [];
        const relevantInsights: string[] = [];
        const relevantTopics: string[] = [];

        // 키워드 기반 검색
        const messageKeywords = userMessage.toLowerCase().split(' ').filter(word => word.length > 2);

        if (knowledgeBase) {
            knowledgeBase.keyConcepts.forEach(concept => {
                if (messageKeywords.some(keyword => concept.toLowerCase().includes(keyword))) {
                    relevantTopics.push(concept);
                }
            });

            relevantInsights.push(...knowledgeBase.writingSuggestions.filter(suggestion =>
                messageKeywords.some(keyword => suggestion.toLowerCase().includes(keyword))
            ));
        }

        // if (mediaContext) { // mediaAnalysisService 제거
        //     relevantInsights.push(...mediaContext.combinedInsights.filter(insight =>
        //         messageKeywords.some(keyword => insight.toLowerCase().includes(keyword))
        //     ));
        // }

        return {
            files: relevantFiles,
            insights: relevantInsights,
            topics: relevantTopics,
            writingMaterials: writingMaterials || []
        };
    }

    private async generateContextualResponse(
        userMessage: string,
        relevantKnowledge: any,
        conversationContext: ConversationContext | undefined,
        attachmentAnalyses: Array<any> // FileAnalysisResult | MediaAnalysisResult
    ): Promise<Omit<IntelligentResponse, 'learningFeedback'>> {

        // 컨텍스트 기반 응답 생성
        let response = '';
        const sourceFiles: IntelligentResponse['sourceFiles'] = [];
        const knowledgeInsights: string[] = [];
        const followUpQuestions: string[] = [];
        const suggestedActions: string[] = [];

        // 1. 첨부 파일 기반 응답
        if (attachmentAnalyses.length > 0) {
            response += `업로드하신 ${attachmentAnalyses.length}개 파일을 분석했습니다.\n\n`;

            attachmentAnalyses.forEach((analysis, index) => {
                const isMedia = 'fileType' in analysis && ['image', 'video', 'audio'].includes(analysis.fileType);
                const fileName = analysis.fileName;
                const summary = isMedia ? (analysis as any).contextualSummary : (analysis as any).knowledgeSummary; // MediaAnalysisResult

                response += `📁 **${fileName}**\n${summary}\n\n`;

                sourceFiles.push({
                    fileId: analysis.id,
                    fileName,
                    relevanceScore: 0.9,
                    usedSections: ['전체 내용']
                });
            });
        }

        // 2. 기존 지식 기반 응답
        if (relevantKnowledge.insights.length > 0) {
            response += '관련된 기존 지식을 찾았습니다:\n\n';
            relevantKnowledge.insights.slice(0, 3).forEach((insight: string) => {
                response += `💡 ${insight}\n`;
                knowledgeInsights.push(insight);
            });
            response += '\n';
        }

        // 3. 주제 기반 응답
        if (relevantKnowledge.topics.length > 0) {
            response += `이 내용은 다음 주제들과 관련이 있습니다: ${relevantKnowledge.topics.slice(0, 5).join(', ')}\n\n`;
        }

        // 4. 대화 컨텍스트 활용
        if (conversationContext && conversationContext.activeKnowledge.keyTopics.length > 0) {
            response += `현재 대화에서 다루고 있는 주제들: ${conversationContext.activeKnowledge.keyTopics.slice(0, 3).join(', ')}\n\n`;
        }

        // 5. 기본 응답 (관련 정보가 없는 경우)
        if (!response.trim()) {
            response = '요청하신 내용을 검토해보겠습니다. ';

            if (userMessage.includes('분석') || userMessage.includes('검토')) {
                response += '상세한 분석을 위해 관련 자료를 업로드해 주시면 더 정확한 답변을 드릴 수 있습니다.';
                followUpQuestions.push('어떤 측면에서 분석이 필요하신가요?');
                suggestedActions.push('관련 문서나 자료를 업로드해주세요');
            } else if (userMessage.includes('계획') || userMessage.includes('일정')) {
                response += '계획 수립을 도와드리겠습니다.';
                followUpQuestions.push('구체적인 목표와 기간을 알려주시겠어요?');
                suggestedActions.push('현재 상황을 파악할 수 있는 자료를 공유해주세요');
            } else {
                response += '더 구체적인 정보를 알려주시면 맞춤형 답변을 제공해드리겠습니다.';
                followUpQuestions.push('어떤 도움이 필요하신지 구체적으로 말씀해주시겠어요?');
            }
        }

        // 6. 후속 질문 및 제안 액션 생성
        if (attachmentAnalyses.length > 0) {
            followUpQuestions.push('업로드된 파일에서 특별히 주목해야 할 부분이 있나요?');
            followUpQuestions.push('이 내용을 바탕으로 어떤 작업을 진행하실 예정인가요?');
            suggestedActions.push('파일 내용을 요약해서 정리해보세요');
            suggestedActions.push('관련된 추가 자료를 수집해보세요');
        }

        // 신뢰도 계산
        let confidence = 0.5;
        if (attachmentAnalyses.length > 0) confidence += 0.3;
        if (relevantKnowledge.insights.length > 0) confidence += 0.2;
        if (conversationContext?.activeKnowledge.keyTopics.length) confidence += 0.1;

        return {
            response: response.trim(),
            confidence: Math.min(1.0, confidence),
            sourceFiles,
            knowledgeInsights,
            followUpQuestions,
            suggestedActions
        };
    }

    private processLearningFeedback(
        userMessage: string,
        response: Omit<IntelligentResponse, 'learningFeedback'>,
        projectId: string
    ) {
        // 학습 피드백 처리 (간단화)
        return {
            newKnowledgeGained: response.sourceFiles.length > 0,
            patternsReinforced: response.knowledgeInsights.length > 0 ? ['컨텍스트 연결'] : [],
            confidenceUpdated: response.confidence > 0.7
        };
    }

    private updateConversationHistory(
        sessionId: string,
        userMessage: string,
        aiResponse: string,
        attachments: Array<any> // FileAnalysisResult | MediaAnalysisResult
    ) {
        const context = this.conversationContexts.get(sessionId);
        if (!context) return;

        // 사용자 메시지 추가
        context.messageHistory.push({
            id: `msg_${Date.now()}_user`,
            content: userMessage,
            sender: 'user',
            timestamp: new Date(),
            attachments: attachments.map(analysis => ({
                fileId: analysis.id,
                fileName: analysis.fileName,
                analysis
            }))
        });

        // AI 응답 추가
        context.messageHistory.push({
            id: `msg_${Date.now()}_ai`,
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date()
        });

        this.conversationContexts.set(sessionId, context);
    }

    private notifySubscribers(projectId: string, knowledgeUpdate: KnowledgeUpdateEvent) {
        const subscribers = this.updateSubscribers.get(projectId);
        if (subscribers) {
            subscribers.forEach(callback => callback(knowledgeUpdate));
        }
    }

    subscribeToUpdates(projectId: string, callback: (event: KnowledgeUpdateEvent) => void) {
        const subscribers = this.updateSubscribers.get(projectId) || [];
        subscribers.push(callback);
        this.updateSubscribers.set(projectId, subscribers);
    }

    unsubscribeFromUpdates(projectId: string, callback: (event: KnowledgeUpdateEvent) => void) {
        const subscribers = this.updateSubscribers.get(projectId);
        if (subscribers) {
            this.updateSubscribers.set(projectId, subscribers.filter(cb => cb !== callback));
        }
    }

    async reinforceLearningPatterns(
        analysis: FileAnalysisResult,
        classification: {
            category: string;
            confidence: number;
            subCategories: string[];
            tags: string[];
        },
        projectId: string
    ) {
        // 학습 피드백 시스템에 분석 결과 전달
        const insights = clientFileProcessor.getAutoLearningInsights(projectId);

        if (classification.confidence > 0.8) {
            insights.push(`${analysis.fileName}에서 강한 분류 패턴 감지 (신뢰도: ${(classification.confidence * 100).toFixed(1)}%)`);
        }
    }
}

// 싱글톤 인스턴스 export
export const realTimeKnowledgeSystem = new RealTimeKnowledgeSystem();