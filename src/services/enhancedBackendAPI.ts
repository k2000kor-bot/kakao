import { sendChatMessage, ChatRequest } from './unifiedAPI';
import { normalizeChatTurnsForApiMerge, type ChatTurn } from './modernChatContextBuilder';
import {
  extractPipelineMessageExtrasFromChatResponse,
  hasPipelineExtras,
  type PipelineMessageExtras,
} from '../utils/chatInputUtils';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    API_BASE_URL,
    API_ULTIMATE_HEALTH_PATH,
    API_ULTIMATE_PROCESS_PATH,
    API_V7_ADVANCED_AI_PATH,
    FALLBACK_API_ORIGIN,
    joinApiHealthCheckUrl,
} from '../config/api';

/** UI·세션의 conversationHistory → ChatRequest.conversation_history (`pipelineExtras` 있으면 유지 → unified merge 상속) */
export function mapConversationHistoryToChatTurns(raw: unknown): ChatTurn[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: ChatTurn[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const content = String(o.content ?? o.message ?? o.text ?? '').trim();
    if (!content) continue;
    const roleRaw = String(o.role ?? o.sender ?? 'user').toLowerCase();
    const role =
      roleRaw === 'assistant' || roleRaw === 'ai' ? 'assistant' : 'user';
    const turn: ChatTurn = { role, content };
    const pe = o.pipelineExtras;
    if (pe != null && typeof pe === 'object') {
      turn.pipelineExtras = pe as PipelineMessageExtras;
    }
    out.push(turn);
  }
  return out.length > 0 ? normalizeChatTurnsForApiMerge(out) : undefined;
}

export interface BackendAPIResponse {
    success: boolean;
    content: string;
    confidence: number;
    processingTime: number;
    metadata: {
        model: string;
        tokens: number;
        qualityScore: number;
        improvements: string[];
        limitations: string[];
    };
    /** 통합 대화 `rawResponse`·기타 백엔드 JSON에서 추출한 파이프라인 부가 메타 */
    pipelineExtras?: PipelineMessageExtras;
}

export interface BackendAPIRequest {
    userInput: string;
    context?: Record<string, unknown>;
    /** 파이프라인·Genspark 병합용 (선택) */
    conversation_history?: ChatTurn[];
    options?: {
        quality: 'standard' | 'enhanced' | 'ultimate';
        style?: 'conversational' | 'formal' | 'technical' | 'creative';
        detailLevel?: 'simple' | 'balanced' | 'detailed';
        tone?: 'friendly' | 'professional' | 'neutral';
    };
}

export class EnhancedBackendAPI {
    /** 통합 main_server(5002) 기준 — 품질 티어는 동일 호스트로 요청 */
    private baseURLs = (() => {
        const o = API_BASE_URL || FALLBACK_API_ORIGIN;
        return { ultimate: o, enhanced: o, standard: o };
    })();

    /**
     * 백엔드 API를 통한 고품질 응답 생성
     */
    async generateHighQualityResponse(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const startTime = Date.now();

        try {
            let response: BackendAPIResponse;

            switch (request.options?.quality) {
                case 'ultimate':
                    response = await this.callUltimateAPI(request);
                    break;
                case 'enhanced':
                    response = await this.callEnhancedAPI(request);
                    break;
                default:
                    response = await this.callStandardAPI(request);
            }

            response.processingTime = Date.now() - startTime;
            return response;

        } catch (error) {
            const err = toError(error);
            errorLogger.error('백엔드 API 호출 실패', err, {
                component: 'enhancedBackendAPI',
                action: 'generateHighQualityResponse',
                quality: request.options?.quality || 'standard',
                userInputLength: request.userInput.length,
            });
            return this.createFallbackResponse(request.userInput, Date.now() - startTime);
        }
    }

    /**
     * 궁극의 통합 응답 시스템 API 호출
     */
    private async callUltimateAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const apiRequest = {
            user_input: request.userInput,
            conversation_history: [],
            project_context: request.context || {},
            user_preferences: {
                response_style: request.options?.style || 'conversational',
                detail_level: request.options?.detailLevel || 'balanced',
                tone: request.options?.tone || 'friendly'
            }
        };

        const response = await fetch(joinApiHealthCheckUrl(this.baseURLs.ultimate, API_ULTIMATE_PROCESS_PATH), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest),
        });

        if (!response.ok) {
            throw new Error(`Ultimate API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
            const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse(data);
            const pipelineExtras = hasPipelineExtras(pipelineExtrasRaw) ? pipelineExtrasRaw : undefined;
            return {
                success: true,
                content: data.result.content || data.result.response || '궁극 응답을 생성할 수 없습니다.',
                confidence: data.result.confidence || 0.9,
                processingTime: 0,
                metadata: {
                    model: 'ultimate-integrated-system',
                    tokens: data.result.tokens || 0,
                    qualityScore: data.result.quality_score || 0.95,
                    improvements: data.result.improvements || ['궁극 품질 시스템 사용'],
                    limitations: data.result.limitations || ['처리 시간 증가']
                },
                ...(pipelineExtras ? { pipelineExtras } : {}),
            };
        } else {
            throw new Error(data.error || '궁극 API 응답 오류');
        }
    }

    /**
     * 고급 통합 API 호출
     */
    private async callEnhancedAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const apiRequest = {
            message: request.userInput,
            context: request.context || {},
            options: {
                intent: 'enhanced_conversation',
                style: request.options?.style || 'conversational',
                tone: request.options?.tone || 'friendly',
                requireCitations: true
            }
        };

        const response = await fetch(joinApiHealthCheckUrl(this.baseURLs.enhanced, API_V7_ADVANCED_AI_PATH), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest),
        });

        if (!response.ok) {
            throw new Error(`Enhanced API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.message) {
            const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse(data);
            const pipelineExtras = hasPipelineExtras(pipelineExtrasRaw) ? pipelineExtrasRaw : undefined;
            return {
                success: true,
                content: data.message.content,
                confidence: data.metadata?.confidence || 0.85,
                processingTime: 0,
                metadata: {
                    model: data.metadata?.model || 'enhanced-ai',
                    tokens: data.metadata?.tokens || 0,
                    qualityScore: 0.85,
                    improvements: ['고급 분석 시스템 사용'],
                    limitations: ['제한된 컨텍스트 처리']
                },
                ...(pipelineExtras ? { pipelineExtras } : {}),
            };
        } else {
            throw new Error('고급 API 응답 오류');
        }
    }

    /**
     * 기본 통합 API 호출
     */
    private async callStandardAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const q = request.options?.quality;
        const quality =
            q === 'ultimate' ? 'ultimate' : q === 'standard' ? 'basic' : 'enhanced';

        const chatRequest: ChatRequest = {
            message: request.userInput,
            quality,
            context: { ...(request.context || {}) },
            ...(request.conversation_history?.length
                ? { conversation_history: request.conversation_history }
                : {}),
            options: {
                intent: 'conversation',
                style: request.options?.style || 'conversational',
                tone: request.options?.tone || 'friendly',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);

        if (!response || typeof response !== 'object') {
            throw new Error('기본 API 응답 형식 오류');
        }

        if (response.success && response.message) {
            const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse(
                response.rawResponse !== undefined ? response.rawResponse : response
            );
            const pipelineExtras = hasPipelineExtras(pipelineExtrasRaw) ? pipelineExtrasRaw : undefined;
            return {
                success: true,
                content: response.message.content,
                confidence: 0.7,
                processingTime: 0,
                metadata: {
                    model: 'standard-ai',
                    tokens: 0,
                    qualityScore: 0.7,
                    improvements: ['기본 응답 시스템'],
                    limitations: ['제한된 품질']
                },
                ...(pipelineExtras ? { pipelineExtras } : {}),
            };
        } else {
            throw new Error('기본 API 응답 오류');
        }
    }

    /**
     * 다중 백엔드 API 병렬 호출
     */
    async generateMultiBackendResponse(request: BackendAPIRequest): Promise<BackendAPIResponse[]> {
        const promises = [
            this.callUltimateAPI(request).catch(error => {
                const err = toError(error);
                errorLogger.error('Ultimate API 실패', err, {
                    component: 'enhancedBackendAPI',
                    action: 'generateMultiBackendResponse',
                    apiType: 'ultimate',
                    userInputLength: request.userInput.length,
                });
                return null;
            }),
            this.callEnhancedAPI(request).catch(error => {
                const err = toError(error);
                errorLogger.error('Enhanced API 실패', err, {
                    component: 'enhancedBackendAPI',
                    action: 'generateMultiBackendResponse',
                    apiType: 'enhanced',
                    userInputLength: request.userInput.length,
                });
                return null;
            }),
            this.callStandardAPI(request).catch(error => {
                const err = toError(error);
                errorLogger.error('Standard API 실패', err, {
                    component: 'enhancedBackendAPI',
                    action: 'generateMultiBackendResponse',
                    apiType: 'standard',
                    userInputLength: request.userInput.length,
                });
                return null;
            })
        ];

        const responses = await Promise.all(promises);
        return responses.filter(response => response !== null) as BackendAPIResponse[];
    }

    /**
     * 백엔드 시스템 상태 확인
     */
    async checkBackendStatus(): Promise<{
        ultimate: boolean;
        enhanced: boolean;
        standard: boolean;
    }> {
        const status = {
            ultimate: false,
            enhanced: false,
            standard: false
        };

        try {
            const ultimateResponse = await fetch(
                joinApiHealthCheckUrl(this.baseURLs.ultimate, API_ULTIMATE_HEALTH_PATH),
            );
            status.ultimate = ultimateResponse.ok;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('Ultimate API 상태 확인 실패', err, {
                component: 'enhancedBackendAPI',
                action: 'checkBackendStatus',
                apiType: 'ultimate',
            });
        }

        try {
            const enhancedResponse = await fetch(joinApiHealthCheckUrl(this.baseURLs.enhanced));
            status.enhanced = enhancedResponse.ok;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('Enhanced API 상태 확인 실패', err, {
                component: 'enhancedBackendAPI',
                action: 'checkBackendStatus',
                apiType: 'enhanced',
            });
        }

        try {
            const standardResponse = await fetch(joinApiHealthCheckUrl(this.baseURLs.standard));
            status.standard = standardResponse.ok;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('Standard API 상태 확인 실패', err, {
                component: 'enhancedBackendAPI',
                action: 'checkBackendStatus',
                apiType: 'standard',
            });
        }

        return status;
    }

    /**
     * 대화 메시지 전송 (기존 API와 호환성)
     */
    async sendChatMessage(request: {
        message: string;
        quality: 'standard' | 'enhanced' | 'ultimate';
        context: {
            conversationHistory: unknown[];
            projectContext: Record<string, unknown>;
            userPreferences: {
                responseStyle: string;
                detailLevel: string;
                language: string;
                tone: string;
            };
        };
    }): Promise<{
        content: string;
        quality_score?: number;
        confidence?: number;
        metadata?: Record<string, unknown>;
        pipelineExtras?: PipelineMessageExtras;
    }> {
        const backendRequest: BackendAPIRequest = {
            userInput: request.message,
            context: request.context.projectContext,
            conversation_history: mapConversationHistoryToChatTurns(
                request.context.conversationHistory
            ),
            options: {
                quality: request.quality,
                style: request.context.userPreferences.responseStyle as 'conversational' | 'formal' | 'technical' | 'creative',
                detailLevel: request.context.userPreferences.detailLevel as 'simple' | 'balanced' | 'detailed',
                tone: request.context.userPreferences.tone as 'friendly' | 'professional' | 'neutral'
            }
        };

        const response = await this.generateHighQualityResponse(backendRequest);

        return {
            content: response.content,
            quality_score: response.metadata.qualityScore,
            confidence: response.confidence,
            metadata: response.metadata,
            ...(response.pipelineExtras ? { pipelineExtras: response.pipelineExtras } : {}),
        };
    }

    /**
     * 폴백 응답 생성
     */
    private createFallbackResponse(userInput: string, processingTime: number): BackendAPIResponse {
        return {
            success: false,
            content: `죄송합니다. "${userInput}"에 대한 백엔드 처리 중 오류가 발생했습니다. 다시 시도해주세요.`,
            confidence: 0.3,
            processingTime,
            metadata: {
                model: 'fallback',
                tokens: 0,
                qualityScore: 0.3,
                improvements: ['백엔드 연결 복구 필요'],
                limitations: ['백엔드 시스템 오류']
            }
        };
    }
}

// 싱글톤 인스턴스 생성
export const enhancedBackendAPI = new EnhancedBackendAPI();
export default enhancedBackendAPI;
