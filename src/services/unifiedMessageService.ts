import {
    API_FILE_PROCESS_PATH,
    API_GENERATE_PATH,
    API_PROJECTS_PROCESS_PATH,
    API_STATUS_PATH,
    getChatPostUrlsForConfigBase,
    INTEGRATED_POST_PATH_ANALYZE,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { Message, ChatContext } from '../types/chat';
import { coerceTrimmedString, extractResponseContent } from '../utils/chatInputUtils';
import { errorLogger } from '../utils/errorLogger';
import {
    mergeApiChatContextPayload,
    normalizeChatTurnsForApiMerge,
    resolveMergeOptionsFromHistoryAndExplicit,
    type ChatTurn,
    type MergeApiChatContextPayloadOptions,
} from './modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from './multiLayerStyleAnalysisSystem';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';

export interface UnifiedMessageRequest {
    type: 'chat' | 'analysis' | 'guidance' | 'project' | 'file' | 'system';
    content: string;
    /** 구조화된 `ChatContext` 또는 API merge용 레코드(`conversation_history`·`messages`·`pipelineExtras` 등) */
    context?: ChatContext | Record<string, unknown>;
    /** merge 3번째 인자 — `context` 내 히스토리와 병합되며 `pipelineExtras`는 시나리오 상속에 사용 */
    conversationHistory?: ChatTurn[];
    mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
    options?: {
        style?: 'friendly' | 'professional' | 'creative' | 'formal';
        length?: 'short' | 'medium' | 'long';
        priority?: 'low' | 'medium' | 'high';
    };
}

export interface UnifiedMessageResponse {
    success: boolean;
    message: Message;
    metadata?: {
        processingTime: number;
        confidence: number;
        model: string;
        tokens: number;
        usedServices: string[];
    };
}

class UnifiedMessageService {
    private baseUrl = resolveApiBaseUrl();

    /** `CHAT_POST_PATH`·`CHAT_POST_PATH_UNIFIED` JSON 본문 → 통합 응답 (`extractResponseContent`로 형식 차이 흡수) */
    private buildUnifiedChatResponseFromJson(data: unknown, startTime: number): UnifiedMessageResponse | null {
        if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
        const d = data as Record<string, unknown>;
        const msg = d.message;
        let content = '';
        if (msg != null && typeof msg === 'object' && !Array.isArray(msg)) {
            const mc = (msg as Record<string, unknown>).content;
            if (typeof mc === 'string') {
                content = coerceTrimmedString(mc, '');
            }
        }
        let fromExtract = false;
        if (!content) {
            content = extractResponseContent({ data: d });
            fromExtract = true;
        }
        if (!coerceTrimmedString(content, '')) return null;
        if (fromExtract && content === '응답을 생성할 수 없습니다. 다시 시도해 주세요.') return null;

        const msgObj = msg != null && typeof msg === 'object' && !Array.isArray(msg) ? (msg as Record<string, unknown>) : undefined;
        const senderRaw = msgObj?.sender;
        const sender = typeof senderRaw === 'string' && senderRaw ? senderRaw : 'ai';
        const ts = msgObj?.timestamp;
        const timestamp = typeof ts === 'string' ? ts : new Date().toISOString();
        const topMeta = d.metadata;
        const messageMeta =
            topMeta != null && typeof topMeta === 'object' && !Array.isArray(topMeta)
                ? (topMeta as Message['metadata'])
                : undefined;

        return {
            success: true,
            message: {
                id: `chat_${Date.now()}`,
                content,
                sender,
                timestamp,
                type: 'text',
                metadata: messageMeta,
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence:
                    messageMeta && typeof messageMeta.confidence === 'number' ? messageMeta.confidence : 0.8,
                model: 'advanced-ai',
                tokens: messageMeta && typeof messageMeta.tokens === 'number' ? messageMeta.tokens : 100,
                usedServices: ['ai-chat'],
            },
        };
    }

    async processMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();

        try {
            let response: UnifiedMessageResponse;

            switch (request.type) {
                case 'chat':
                    response = await this.handleChatMessage(request);
                    break;
                case 'analysis':
                    response = await this.handleAnalysisMessage(request);
                    break;
                case 'guidance':
                    response = await this.handleGuidanceMessage(request);
                    break;
                case 'project':
                    response = await this.handleProjectMessage(request);
                    break;
                case 'file':
                    response = await this.handleFileMessage(request);
                    break;
                case 'system':
                    response = await this.handleSystemMessage(request);
                    break;
                default:
                    response = await this.handleChatMessage(request);
            }

            response.metadata = {
                processingTime: Date.now() - startTime,
                confidence: response.metadata?.confidence || 0.7,
                model: response.metadata?.model || 'unified',
                tokens: response.metadata?.tokens || 100,
                usedServices: [request.type]
            };

            return response;
        } catch (error) {
            errorLogger.error('통합 메시지 서비스 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'processMessage',
                messageType: request.type,
            });
            return this.createFallbackResponse(request);
        }
    }

    private async handleChatMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const rawCtx = request.context;
            const ctx: Record<string, unknown> =
                rawCtx && typeof rawCtx === 'object' && !Array.isArray(rawCtx)
                    ? { ...(rawCtx as unknown as Record<string, unknown>) }
                    : {};
            const optHist = request.conversationHistory;
            const rawHist = Array.isArray(optHist) ? optHist : [];
            const history = normalizeChatTurnsForApiMerge(rawHist);
            const mergeForPayload = resolveMergeOptionsFromHistoryAndExplicit(
                history,
                request.mergeApiChatContextOptions
            );
            const ctxEnriched = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
                request.content,
                ctx
            );
            const { quality, contextForBody } = mergeApiChatContextPayload(
                request.content,
                ctxEnriched,
                history.length > 0 ? history : undefined,
                mergeForPayload
            );
            const body: Record<string, unknown> = {
                message: request.content,
                quality,
                response_style: DEFAULT_CHAT_RESPONSE_STYLE,
                perspective: DEFAULT_CHAT_PERSPECTIVE,
                ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
                ...(request.options && Object.keys(request.options).length > 0 ? { options: request.options } : {}),
            };
            const init: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            };
            const chatUrls = getChatPostUrlsForConfigBase(this.baseUrl);
            for (let i = 0; i < chatUrls.length; i++) {
                const response = await fetch(chatUrls[i], init);
                if (response.ok) {
                    const data = await response.json();
                    const mapped = this.buildUnifiedChatResponseFromJson(data, startTime);
                    if (mapped) {
                        return mapped;
                    }
                    if (i < chatUrls.length - 1) {
                        continue;
                    }
                    break;
                }
                const retry = (response.status === 404 || response.status >= 500) && i < chatUrls.length - 1;
                if (retry) {
                    continue;
                }
                break;
            }
        } catch (error) {
            errorLogger.error('AI 대화 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleChatMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private async handleAnalysisMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, INTEGRATED_POST_PATH_ANALYZE), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `analysis_${Date.now()}`,
                        content: `📊 분석 결과:\n${data.analysis}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.85,
                        model: 'analysis-engine',
                        tokens: data.tokens || 200,
                        usedServices: ['ai-analysis']
                    }
                };
            }
        } catch (error) {
            errorLogger.error('분석 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleAnalysisMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private async handleGuidanceMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, API_GENERATE_PATH), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: request.content,
                    preferences: request.options
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `guidance_${Date.now()}`,
                        content: `💡 메시지 가이드:\n${data.generatedMessage}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.9,
                        model: 'guidance-system',
                        tokens: data.tokens || 150,
                        usedServices: ['message-guidance']
                    }
                };
            }
        } catch (error) {
            errorLogger.error('가이드 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleGuidanceMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private async handleProjectMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, API_PROJECTS_PROCESS_PATH), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `project_${Date.now()}`,
                        content: `📁 프로젝트 정보:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.8,
                        model: 'project-manager',
                        tokens: data.tokens || 120,
                        usedServices: ['project-management']
                    }
                };
            }
        } catch (error) {
            errorLogger.error('프로젝트 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleProjectMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private async handleFileMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, API_FILE_PROCESS_PATH), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `file_${Date.now()}`,
                        content: `📂 파일 정보:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.85,
                        model: 'file-processor',
                        tokens: data.tokens || 100,
                        usedServices: ['file-management']
                    }
                };
            }
        } catch (error) {
            errorLogger.error('파일 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleFileMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private async handleSystemMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, API_STATUS_PATH), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `system_${Date.now()}`,
                        content: `⚙️ 시스템 상태:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.95,
                        model: 'system-monitor',
                        tokens: data.tokens || 80,
                        usedServices: ['system-monitoring']
                    }
                };
            }
        } catch (error) {
            errorLogger.error('시스템 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'UnifiedMessageService',
                action: 'handleSystemMessage',
            });
        }

        return this.createFallbackResponse(request);
    }

    private createFallbackResponse(request: UnifiedMessageRequest): UnifiedMessageResponse {
        const startTime = Date.now();
        const fallbackContent = this.generateFallbackContent(request);

        return {
            success: false,
            message: {
                id: `fallback_${Date.now()}`,
                content: fallbackContent,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.6,
                model: 'fallback',
                tokens: 50,
                usedServices: ['fallback']
            }
        };
    }

    private generateFallbackContent(request: UnifiedMessageRequest): string {
        const { type, content } = request;

        const fallbackMessages = {
            chat: `안녕하세요! "${content}"에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!\n\n현재 오프라인 모드로 작동 중입니다. 백엔드 서버 연결 후 더 정확한 응답을 받을 수 있습니다.\n\n질문·요구·요청을 자연스럽게 입력하면 맥락에 맞는 기능(대화·분석·검색·프로젝트·파일 등)이 연결됩니다.\n보조 라우팅 예시: "분석", "가이드", "프로젝트", "파일", "시스템" 등 키워드가 포함된 문장도 사용할 수 있습니다.`,
            analysis: `📊 분석 결과 (오프라인 모드):\n"${content}"에 대한 기본 분석을 제공합니다.\n\n• 키워드: ${content.split(/\s+/).filter(Boolean).join(', ')}\n• 길이: ${content.length}자\n• 감정: 중립적\n• 의도: 정보 요청\n• 복잡도: ${content.length > 50 ? '높음' : '보통'}\n\n백엔드 서버 연결 후 더 정확한 분석을 받을 수 있습니다.`,
            guidance: `💡 메시지 가이드 (오프라인 모드):\n"${content}"에 대한 기본 가이드를 제공합니다.\n\n권장 사항:\n• 톤: 정중하고 명확한 톤 사용\n• 구조: 인사 → 내용 → 마무리\n• 길이: 상황에 맞는 적절한 길이\n• 키워드: 핵심 내용 강조\n\n예시 응답:\n"안녕하세요. 말씀하신 내용을 잘 이해했습니다. [구체적인 답변]. 추가 문의사항이 있으시면 언제든 연락주세요."\n\n백엔드 서버 연결 후 더 상세한 가이드를 받을 수 있습니다.`,
            project: `📁 프로젝트 정보 (오프라인 모드):\n"${content}"에 대한 기본 프로젝트 정보를 제공합니다.\n\n등록된 프로젝트가 있으면 이름으로 질문·요청할 수 있습니다.\n프로젝트별로 확인할 수 있는 항목 예시:\n• 파일 목록\n• 진행 상황\n• 관련 문서\n• 팀 구성\n\n백엔드 서버 연결 후 실제 프로젝트 데이터를 조회할 수 있습니다.`,
            file: `📄 파일 처리 (오프라인 모드):\n"${content}"에 대한 기본 파일 정보를 제공합니다.\n\n업로드된 파일 예시(데모):\n• 대화요약_sample.txt (50KB)\n• 회의록_요약.pdf (120KB)\n• 평가자료.xlsx (85KB)\n• 프로젝트_진행상황.docx (200KB)\n\n파일 기능:\n• 검색 및 필터링\n• 다운로드\n• 미리보기\n• 메타데이터 확인\n\n백엔드 서버 연결 후 더 정확한 파일 정보를 받을 수 있습니다.`,
            system: `⚙️ 시스템 상태 (오프라인 모드):\n"${content}"에 대한 기본 시스템 정보를 제공합니다.\n\n현재 상태:\n• 프론트엔드: 정상 동작 ✅\n• 백엔드: 연결 중 🔄\n• AI 엔진: 오프라인 모드\n• 데이터베이스: 로컬 캐시\n• 메모리 사용량: 45%\n• 응답 시간: 평균 200ms\n\n시스템 기능:\n• 실시간 모니터링\n• 성능 최적화\n• 오류 로깅\n• 자동 복구\n\n백엔드 서버 연결 후 더 정확한 시스템 상태를 확인할 수 있습니다.`
        };

        return fallbackMessages[type] || fallbackMessages.chat;
    }

    // 대화형 명령 처리
    async processConversationCommand(text: string): Promise<UnifiedMessageResponse> {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('분석') || lowerText.includes('analyze')) {
            return this.processMessage({
                type: 'analysis',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('가이드') || lowerText.includes('guidance')) {
            return this.processMessage({
                type: 'guidance',
                content: text,
                options: { style: 'friendly', length: 'medium' }
            });
        }

        if (lowerText.includes('프로젝트') || lowerText.includes('project')) {
            return this.processMessage({
                type: 'project',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('파일') || lowerText.includes('file')) {
            return this.processMessage({
                type: 'file',
                content: text,
                options: { style: 'professional', length: 'short' }
            });
        }

        if (lowerText.includes('시스템') || lowerText.includes('system') || lowerText.includes('상태')) {
            return this.processMessage({
                type: 'system',
                content: text,
                options: { style: 'formal', length: 'short' }
            });
        }

        // 기본 대화 처리
        return this.processMessage({
            type: 'chat',
            content: text,
            options: { style: 'friendly', length: 'medium' }
        });
    }
}

const unifiedMessageService = new UnifiedMessageService();
export default unifiedMessageService; 