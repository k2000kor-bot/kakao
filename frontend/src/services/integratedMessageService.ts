import type { AxiosResponse } from 'axios';
import { AISystem } from '../types/chat';
import { errorLogger, toError } from '../utils/errorLogger';
import {
  API_BASE_URL,
  API_FORM_FIELD_FILE,
  CHAT_POST_PATH,
  FALLBACK_API_ORIGIN,
  FILE_UPLOAD_PATH,
  FILES_COLLECTION_PATH,
  GUIDANCE_GENERATE_PATH,
  INTEGRATED_POST_PATH_ANALYZE,
  INTEGRATED_POST_PATH_FILE,
  INTEGRATED_POST_PATH_GUIDANCE,
  INTEGRATED_POST_PATH_PROJECT,
  LEARNING_FEEDBACK_PATH,
  SYSTEMS_STATUS_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';
import {
  DEFAULT_CHAT_POST_AXIOS_OPTIONS,
  DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
  postChatAxiosWithFallback,
} from '../utils/apiClient';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  type ChatTurn,
  type MergeApiChatContextPayloadOptions,
} from './modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from './multiLayerStyleAnalysisSystem';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';

interface IntegratedMessageRequest {
  content: string;
  context?: string;
  /**
   * `mergeApiChatContextPayload` 2번째 인자에 합쳐짐 (`conversation_history`·Genspark id 등).
   * `projectId` 등 서비스 필드는 이 객체 위에 덮어씀.
   */
  chatContext?: Record<string, unknown>;
  /** merge 3번째 인자 — `pipelineExtras`는 시나리오 상속·파이프라인 히스토리에 사용 */
  conversationHistory?: ChatTurn[];
  mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
  systemType?: 'analysis' | 'guidance' | 'conversation' | 'project' | 'file';
  userPreferences?: {
    tone: 'formal' | 'casual' | 'professional';
    style: 'informative' | 'persuasive' | 'empathetic' | 'analytical';
    length: 'short' | 'medium' | 'long';
  };
  projectId?: string;
  knowledgeBaseId?: string;
}

interface IntegratedMessageResponse {
  id: string;
  content: string;
  type: 'text' | 'analysis' | 'chart' | 'code' | 'image' | 'system';
  confidence: number;
  processingTime: number;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
    data?: unknown;
    usedSystems?: string[];
    learningScore?: number;
  };
}

export class IntegratedMessageService {
  private baseURL = API_BASE_URL || FALLBACK_API_ORIGIN;
  private systems: AISystem[] = [];

  constructor() {
    this.initializeSystems();
  }

  private initializeSystems() {
    this.systems = [
      {
        id: 'conversation',
        name: '대화형 AI',
        description: '자연스러운 대화형 인터페이스',
        isActive: true,
        capabilities: ['대화', '질의응답', '컨텍스트 이해'],
        performance: { accuracy: 0.95, speed: 0.9, reliability: 0.95 }
      },
      {
        id: 'analysis',
        name: '분석 엔진',
        description: '고급 데이터 분석 및 인사이트 제공',
        isActive: true,
        capabilities: ['감정 분석', '의도 분석', '주제 추출', '복잡도 평가'],
        performance: { accuracy: 0.92, speed: 0.85, reliability: 0.9 }
      },
      {
        id: 'guidance',
        name: '메시지 가이드',
        description: '상황별 메시지 생성 및 가이드',
        isActive: true,
        capabilities: ['톤 설정', '길이 조절', '구조 가이드', '예시 제공'],
        performance: { accuracy: 0.88, speed: 0.8, reliability: 0.85 }
      },
      {
        id: 'project',
        name: '프로젝트 관리',
        description: '프로젝트 정보 및 진행 상황 관리',
        isActive: true,
        capabilities: ['진행 상황', '팀 구성', '관련 파일', '지침 정보'],
        performance: { accuracy: 0.9, speed: 0.9, reliability: 0.9 }
      },
      {
        id: 'file',
        name: '파일 관리',
        description: '파일 업로드, 분석 및 관리',
        isActive: true,
        capabilities: ['파일 분석', 'OCR', '문서 요약', '미디어 처리'],
        performance: { accuracy: 0.85, speed: 0.75, reliability: 0.8 }
      }
    ];
  }

  async sendMessage(request: IntegratedMessageRequest): Promise<IntegratedMessageResponse> {
    const startTime = Date.now();

    try {
      // 시스템 타입에 따른 라우팅
      const systemType = this.determineSystemType(request.content);
      const endpoint = this.getEndpointForSystem(systemType);

      let body: Record<string, unknown>;
      if (endpoint === CHAT_POST_PATH) {
        const ctx: Record<string, unknown> = { ...(request.chatContext && typeof request.chatContext === 'object' ? request.chatContext : {}) };
        if (request.projectId) ctx.project_id = request.projectId;
        if (request.knowledgeBaseId) ctx.knowledge_base_id = request.knowledgeBaseId;
        if (request.context && request.context.trim()) {
          ctx.integrated_context_note = request.context;
        }
        if (request.userPreferences) {
          ctx.user_preferences = request.userPreferences;
        }
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
        body = {
          message: request.content,
          quality,
          response_style: DEFAULT_CHAT_RESPONSE_STYLE,
          perspective: DEFAULT_CHAT_PERSPECTIVE,
          ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
          systemType,
          timestamp: new Date().toISOString(),
        };
      } else {
        body = {
          ...request,
          systemType,
          timestamp: new Date().toISOString(),
        };
      }

      if (endpoint === CHAT_POST_PATH) {
        const axRes = (await postChatAxiosWithFallback(
          this.baseURL,
          body,
          DEFAULT_CHAT_POST_AXIOS_OPTIONS,
          DEFAULT_CHAT_POST_FALLBACK_OPTIONS
        )) as AxiosResponse<Record<string, unknown>>;
        const data = axRes.data;
        const processingTime = Date.now() - startTime;
        const msgVal = data.message;
        const fromMessage = typeof msgVal === 'string' ? msgVal : '';
        const content =
          (typeof data.response === 'string' ? data.response : undefined) ??
          (typeof data.content === 'string' ? data.content : undefined) ??
          fromMessage;
        return {
          id: `msg_${Date.now()}`,
          content,
          type: (typeof data.type === 'string' ? data.type : 'text') as IntegratedMessageResponse['type'],
          confidence: typeof data.confidence === 'number' ? data.confidence : 0.8,
          processingTime,
          metadata: {
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            actions: Array.isArray(data.actions) ? data.actions : [],
            data: data.data ?? {},
            usedSystems: [systemType],
            learningScore: typeof data.learningScore === 'number' ? data.learningScore : 0.7,
          },
        };
      }

      const init: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      };

      const response = await fetch(joinApiHealthCheckUrl(this.baseURL, endpoint), init);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        id: `msg_${Date.now()}`,
        content: data.response || data.content || data.message,
        type: data.type || 'text',
        confidence: data.confidence || 0.8,
        processingTime,
        metadata: {
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          data: data.data || {},
          usedSystems: [systemType],
          learningScore: data.learningScore || 0.7
        }
        };
    } catch (error) {
      const err = toError(error);
      errorLogger.error('메시지 전송 실패', err, {
        component: 'integratedMessageService',
        action: 'sendMessage',
        contentPreview: request.content,
        systemType: request.systemType,
      });

      // 폴백 응답
      return {
        id: `msg_${Date.now()}`,
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'text',
        confidence: 0.5,
        processingTime: Date.now() - startTime,
        metadata: {
          suggestions: ['다시 시도해보세요', '다른 표현으로 질문해보세요'],
          actions: ['retry'],
          usedSystems: ['fallback']
        }
      };
    }
  }

  private determineSystemType(content: string): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('분석') || lowerContent.includes('analyze') || lowerContent.includes('분석해')) {
      return 'analysis';
    }

    // 단독 '메시지'는 일상 대화에 흔해 CHAT_POST_PATH로 두고, 가이드·guidance·문구 도움만 라우팅
    if (
      lowerContent.includes('가이드') ||
      lowerContent.includes('guidance') ||
      lowerContent.includes('메시지 가이드') ||
      lowerContent.includes('문구 추천') ||
      lowerContent.includes('어떻게 쓰') ||
      lowerContent.includes('어떻게 말')
    ) {
      return 'guidance';
    }

    if (lowerContent.includes('프로젝트') || lowerContent.includes('project') || lowerContent.includes('개발')) {
      return 'project';
    }

    if (lowerContent.includes('파일') || lowerContent.includes('file') || lowerContent.includes('업로드')) {
      return 'file';
    }

    return 'conversation';
  }

  private getEndpointForSystem(systemType: string): string {
    switch (systemType) {
      case 'analysis':
        return INTEGRATED_POST_PATH_ANALYZE;
      case 'guidance':
        return INTEGRATED_POST_PATH_GUIDANCE;
      case 'project':
        return INTEGRATED_POST_PATH_PROJECT;
      case 'file':
        return INTEGRATED_POST_PATH_FILE;
      default:
        return CHAT_POST_PATH;
    }
  }

  async getSystemStatus(): Promise<AISystem[]> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseURL, SYSTEMS_STATUS_PATH));
      if (response.ok) {
        const data = await response.json();
        return data.systems || this.systems;
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('시스템 상태 조회 실패', err, {
        component: 'integratedMessageService',
        action: 'getSystemStatus',
      });
    }
    return this.systems;
  }

  async uploadFile(file: File): Promise<{ success: boolean; fileId?: string; error?: string }> {
    const formData = new FormData();
    formData.append(API_FORM_FIELD_FILE, file);

    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseURL, FILE_UPLOAD_PATH), {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, fileId: data.fileId };
      } else {
        return { success: false, error: '파일 업로드 실패' };
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류' };
    }
  }

  async getProjectInfo(projectId: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseURL,
          `${INTEGRATED_POST_PATH_PROJECT}/${encodeURIComponent(projectId)}`,
        ),
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('프로젝트 정보 조회 실패', err, {
        component: 'integratedMessageService',
        action: 'getProjectInfo',
        projectId,
      });
    }
    return null;
  }

  async getFileList(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseURL, FILES_COLLECTION_PATH));
      if (response.ok) {
        const data = await response.json();
        return data.files || [];
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 목록 조회 실패', err, {
        component: 'integratedMessageService',
        action: 'getFileList',
      });
    }
    return [];
  }

  async generateGuidance(context: string, preferences: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseURL, GUIDANCE_GENERATE_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, preferences }),
      });

      if (response.ok) {
        return (await response.json()) as Record<string, unknown>;
      }
    } catch (error) {
      const err = toError(error);
      errorLogger.error('가이드 생성 실패', err, {
        component: 'integratedMessageService',
        action: 'generateGuidance',
        contextPreview: context,
      });
    }
    return null;
  }

  // 실시간 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseURL), {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });
      return response.ok;
    } catch (error) {
      const err = toError(error);
      errorLogger.warn('백엔드 연결 실패', {
        component: 'integratedMessageService',
        action: 'checkConnection',
        error: err.message,
      });
      return false;
    }
  }

  // 학습 데이터 업데이트
  async updateLearningData(messageId: string, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    try {
      await fetch(joinApiHealthCheckUrl(this.baseURL, LEARNING_FEEDBACK_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, feedback }),
      });
    } catch (error) {
      const err = toError(error);
      errorLogger.error('학습 데이터 업데이트 실패', err, {
        component: 'integratedMessageService',
        action: 'updateLearningData',
        messageId,
        feedback,
      });
    }
  }
}

export const integratedMessageService = new IntegratedMessageService();
export default integratedMessageService; 