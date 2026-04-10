// CORBU.AI 통합 API 서비스 - 모든 백엔드 API 호출을 중앙에서 관리

import {
  API_BASE_URL as CONFIG_API_BASE,
  API_AI_ADVANCED_ANALYSIS_PATH,
  API_AI_ADAPTIVE_LEARNING_SYSTEM_PATH,
  API_AI_ADVANCED_INSIGHTS_GENERATION_PATH,
  API_AI_ADVANCED_PREDICTIVE_MODELING_PATH,
  API_AI_ADVANCED_RESEARCH_CONTROL_PATH,
  API_AI_ADVANCED_VISUALIZATION_PATH,
  API_AI_ANALYZE_IMAGE_PATH,
  API_AI_AR_VR_SUPPORT_PATH,
  API_AI_AUTO_INSIGHTS_GENERATION_PATH,
  API_AI_AUTOMATED_WORKFLOW_ENGINE_PATH,
  API_AI_BLOCKCHAIN_SECURITY_PATH,
  API_AI_COGNITIVE_COMPUTING_PATH,
  API_AI_COMPETITOR_ANALYSIS_PATH,
  API_AI_COMPREHENSIVE_ANALYSIS_PATH,
  API_AI_CONVERSATION_ANALYSIS_PATH,
  API_AI_CONVERSATIONAL_QA_PATH,
  API_AI_COSMIC_AI_INTEGRATION_PATH,
  API_AI_DEEP_LEARNING_ANALYSIS_PATH,
  API_AI_EDGE_COMPUTING_SUPPORT_PATH,
  API_AI_EXPERIMENTAL_RESEARCH_SYSTEM_PATH,
  API_AI_FILE_ANALYSIS_PATH,
  API_AI_FINANCIAL_ANALYSIS_PATH,
  API_AI_FUTURE_TECHNOLOGY_RESEARCH_PATH,
  API_AI_IMAGE_ANALYSIS_PATH,
  API_AI_INTEGRATED_ANALYSIS_PATH,
  API_AI_INTEGRATED_RESEARCH_ECOSYSTEM_PATH,
  API_AI_INNOVATIVE_RESEARCH_PLATFORM_PATH,
  API_AI_KNOWLEDGE_PROCESSING_PATH,
  API_AI_LEARNING_OPTIMIZATION_PATH,
  API_AI_MACHINE_LEARNING_PREDICTION_PATH,
  API_AI_MULTILINGUAL_SUPPORT_PATH,
  API_AI_NATURAL_LANGUAGE_PROCESSING_PATH,
  API_AI_NEXT_GENERATION_RESEARCH_INNOVATION_PATH,
  API_AI_PERSONALIZED_DASHBOARD_PATH,
  API_AI_PREDICTIVE_ANALYSIS_PATH,
  API_AI_PROCESS_FILE_PATH,
  API_AI_QUANTUM_COMPUTING_SUPPORT_PATH,
  API_AI_REAL_ESTATE_ANALYSIS_PATH,
  API_AI_REAL_TIME_COLLABORATION_PATH,
  API_AI_REAL_TIME_DATA_ANALYSIS_PATH,
  API_AI_REAL_TIME_DECISION_SUPPORT_PATH,
  API_AI_RESEARCH_UNLIMITED_ANALYSIS_PATH,
  API_AI_RISK_ASSESSMENT_PATH,
  API_AI_SENTIMENT_ANALYSIS_ADVANCED_PATH,
  API_AI_SYSTEM_METRICS_PATH,
  API_AI_ULTIMATE_RESEARCH_ECOSYSTEM_PATH,
  API_AI_ULTIMATE_RESEARCH_INNOVATION_PLATFORM_PATH,
  API_AI_ULTIMATE_RESEARCH_SYSTEM_PATH,
  API_AI_VOICE_PROCESSING_PATH,
  API_AI_WORKFLOW_EXECUTION_PATH,
  API_AI_WRITING_GENERATION_PATH,
  API_FORM_FIELD_FILE,
  API_MESSAGES_LIST_PATH,
  API_PROJECTS_LIST_PATH,
  API_QUERY_PARAM_CONVERSATION_ID,
  API_QUERY_PARAM_LIMIT,
  API_QUERY_PARAM_OFFSET,
  API_QUERY_PARAM_PROJECT_ID,
  FILES_COLLECTION_PATH,
  INTEGRATED_POST_PATH_ANALYZE,
  WS_BASE_URL,
  WS_CHAT_ROOM_PATH_PREFIX,
  FALLBACK_API_ORIGIN,
  FILE_DOWNLOAD_PATH,
  FILE_UPLOAD_PATH,
  getChatPostUrlsForConfigBase,
  joinApiBaseAndPath,
  joinApiHealthCheckUrl,
} from '../config/api';
import { extractResponseContent } from '../utils/chatInputUtils';
import { errorLogger } from '../utils/errorLogger';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
} from './modernChatContextBuilder';
import type { ChatTurn, MergeApiChatContextPayloadOptions } from './modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from './multiLayerStyleAnalysisSystem';

const API_BASE_URL = CONFIG_API_BASE || FALLBACK_API_ORIGIN;

// ===== 기본 인터페이스 =====
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// ===== 통합 AI 서비스 인터페이스 =====
export interface ChatRequest {
  message: string;
  /** basic | enhanced | ultimate. 미지정 시 기본값 enhanced로 전송 */
  quality?: string;
  /** `conversation_history`·`conversationHistory`·`messages`·턴 `pipelineExtras`는 merge에서 파이프라인·시나리오 상속에 사용 */
  context?: Record<string, unknown>;
  session_id?: string;
  /** ChatService·일부 UI에서 사용하는 대화 ID (`session_id`와 별도로 본문에 실을 때) */
  conversation_id?: string;
  /** 파이프라인·Genspark 병합 시 이전 턴 (선택). 턴에 `pipelineExtras`가 있으면 상속 env에서 merge 4번째 인자로 자동 반영 */
  conversation_history?: ChatTurn[];
  /** `mergeApiChatContextPayload` 4번째 인자 — 직전 턴 생성 시나리오 상속 등 (요청 본문에는 포함되지 않음) */
  mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
  options?: Record<string, unknown>;
  /** 미지정 시 본문에 balanced·practical 기본값 */
  response_style?: string;
  perspective?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: {
    content: string;
    timestamp: string;
  };
  error?: string;
  /** 성공 시 서버 JSON 원본 — `extractPipelineMessageExtrasFromChatResponse` 등 후처리용 */
  rawResponse?: unknown;
}

export interface FileUploadRequest {
  file: File;
  project_id?: string;
}

export interface FileUploadResponse {
  success: boolean;
  file_id?: string;
  file_name?: string;
  error?: string;
}

export interface AdvancedAnalysisRequest {
  content: string;
  analysis_type?: 'comprehensive' | 'sentiment' | 'trend' | 'relationship';
}

export interface KnowledgeProcessingRequest {
  content: string;
  context?: Record<string, unknown>;
}

export interface FileAnalysisRequest {
  content: string;
  file_type?: string;
}

export interface WritingGenerationRequest {
  prompt: string;
  style?: 'formal' | 'casual' | 'professional' | 'creative';
  context?: Record<string, unknown>;
}

export interface ConversationAnalysisRequest {
  messages: Array<{
    sender: string;
    content: string;
    timestamp?: string;
  }>;
}

export interface RealEstateAnalysisRequest {
  content: string;
}

export interface VoiceProcessingRequest {
  audio_data: string; // base64 encoded
  format?: 'wav' | 'mp3' | 'm4a';
}

export interface ImageAnalysisRequest {
  image_data: string; // base64 encoded
  format?: 'jpg' | 'png' | 'gif' | 'bmp';
}

export interface WorkflowExecutionRequest {
  workflow_id: string;
  data?: Record<string, unknown>;
}

export interface LearningOptimizationRequest {
  user_data: Record<string, unknown>;
}

export interface ComprehensiveAnalysisRequest {
  content: string;
  context?: Record<string, unknown>;
}

// ===== 응답 인터페이스 =====
export interface AdvancedAnalysisResponse {
  success: boolean;
  analysis: {
    success: boolean;
    analysis_type: string;
    basic_analysis: Record<string, unknown>;
    detailed_analysis: Record<string, unknown>;
    performance: {
      response_time: number;
      confidence_score: number;
    };
  };
  ai_analysis: {
    sentiment: Record<string, unknown>;
    intent: string;
    complexity: string;
    urgency: string;
    confidence: number;
  };
  timestamp: string;
}

export interface KnowledgeProcessingResponse {
  success: boolean;
  knowledge_processing: {
    extracted_concepts: string[];
    relationships: Record<string, unknown>;
    recommendations: string[];
    confidence: number;
  };
  timestamp: string;
}

export interface FileAnalysisResponse {
  success: boolean;
  file_analysis: {
    file_type: string;
    content_summary: string;
    key_points: string[];
    sentiment: Record<string, unknown>;
    recommendations: string[];
  };
  timestamp: string;
}

export interface WritingGenerationResponse {
  success: boolean;
  writing_generation: {
    content: string;
    style: string;
    word_count: number;
    confidence: number;
    suggestions: string[];
  };
  timestamp: string;
}

export interface ConversationAnalysisResponse {
  success: boolean;
  conversation_analysis: {
    participant_count: number;
    topic_evolution: string[];
    engagement_level: number;
    sentiment_trend: string[];
    recommendations: string[];
  };
  timestamp: string;
}

export interface RealEstateAnalysisResponse {
  success: boolean;
  real_estate_analysis: {
    market_trend: Record<string, unknown>;
    investment_potential: Record<string, unknown>;
    risk_assessment: Record<string, unknown>;
    recommendations: string[];
  };
  timestamp: string;
}

export interface VoiceProcessingResponse {
  success: boolean;
  voice_processing: {
    transcription: string;
    confidence: number;
    language: string;
    duration: number;
    word_count: number;
  };
  timestamp: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  image_analysis: {
    objects_detected: string[];
    text_extracted: string;
    sentiment: string;
    confidence: number;
    tags: string[];
  };
  timestamp: string;
}

export interface WorkflowExecutionResponse {
  success: boolean;
  workflow_execution: {
    workflow_id: string;
    status: string;
    steps_completed: number;
    total_steps: number;
    result: string;
    execution_time: number;
  };
  timestamp: string;
}

export interface LearningOptimizationResponse {
  success: boolean;
  learning_optimization: {
    optimization_score: number;
    recommendations: string[];
    improvement_areas: string[];
    next_steps: string[];
  };
  timestamp: string;
}

export interface SystemMetricsResponse {
  success: boolean;
  metrics: {
    active_users: number;
    requests_per_minute: number;
    average_response_time: number;
    error_rate: number;
    system_health: string;
    total_analyses: number;
    success_rate: number;
  };
  timestamp: string;
}

export interface ComprehensiveAnalysisResponse {
  success: boolean;
  comprehensive_analysis: {
    basic_analysis: Record<string, unknown>;
    ai_analysis: Record<string, unknown>;
    knowledge_processing: Record<string, unknown>;
    file_analysis: Record<string, unknown>;
    writing_generation: Record<string, unknown>;
    real_estate_analysis: Record<string, unknown>;
  };
  overall_score: number;
  recommendations: string[];
  timestamp: string;
}

// ===== 대화 관련 인터페이스 =====
// ChatRequest는 파일 상단에 단일 정의

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
  metadata?: Record<string, unknown>;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

// ===== 분석 관련 인터페이스 =====
export interface AnalysisRequest {
  text: string;
  context?: Record<string, unknown>;
  analysis_type?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: string;
  confidence: number;
  processing_time: number;
  tokens: number;
}

export interface SentimentAnalysis {
  sentiment: string;
  confidence: number;
  positive_score: number;
  negative_score: number;
  neutral_score: number;
  analysis_time: string;
}

export interface PersonalityAnalysis {
  traits: {
    extroversion: number;
    introversion: number;
    analytical: number;
    creative: number;
    detail_oriented: number;
    big_picture: number;
  };
  dominant_trait: string;
  analysis_summary: string;
  recommendations: string[];
  analysis_time: string;
}

export interface ConstructionBiasAnalysis {
  bias_type: string;
  bias_score: number;
  construction_mentions: number;
  real_estate_mentions: number;
  sentiment: SentimentAnalysis;
  risk_assessment: {
    risk_indicators: string[];
    risk_level: string;
    recommendations: string[];
  };
  analysis_time: string;
}

export interface PredictiveAnalysis {
  current_trend: string;
  predicted_value: number;
  confidence: number;
  historical_data?: number[];
  prediction_factors: string[];
  recommendations: string[];
  analysis_time: string;
}

export interface ComprehensiveAnalysis {
  timestamp: string;
  analysis_type: string;
  confidence_score: number;
  processing_time: string;
  content: {
    original_text: string;
    analysis_summary: string;
    perspectives: Array<{
      perspective: string;
      analysis: string;
      focus: string;
    }>;
    actionable_insights: string[];
    recommendations: string[];
  };
  metadata: {
    model_version: string;
    analysis_parameters: Record<string, unknown>;
    quality_metrics: Record<string, number>;
  };
}

// ===== 가이드 관련 인터페이스 =====
export interface GuidanceRequest {
  context: string;
  preferences?: Record<string, unknown>;
}

export interface GuidanceResponse {
  success: boolean;
  generatedMessage: string;
  confidence: number;
  processing_time: number;
  tokens: number;
}

// ===== 프로젝트 관련 인터페이스 =====
export interface ProjectRequest {
  query: string;
  context?: Record<string, unknown>;
}

export interface ProjectResponse {
  success: boolean;
  response: string;
  confidence: number;
  processing_time: number;
  tokens: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  file_count: number;
  created_time: string;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  total: number;
}

// ===== 파일 관련 인터페이스 =====
export interface FileRequest {
  query: string;
  context?: Record<string, unknown>;
}

export interface FileResponse {
  success: boolean;
  response: string;
  confidence: number;
  processing_time: number;
  tokens: number;
}

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  upload_time: string;
  analysis_status: string;
}

export interface FilesResponse {
  success: boolean;
  files: FileInfo[];
  total: number;
}



// ===== 시스템 관련 인터페이스 =====
export interface SystemRequest {
  query: string;
}

export interface SystemResponse {
  success: boolean;
  status: string;
  confidence: number;
  processing_time: number;
  tokens: number;
}

export interface SystemStatus {
  is_file_uploading: boolean;
  is_analyzing: boolean;
  is_learning: boolean;
  is_project_loading: boolean;
  active_projects: string[];
  available_commands: string[];
  timestamp: string;
}

// ===== 음성 관련 인터페이스 =====
export interface VoiceRequest {
  audio_data: string;
  context?: Record<string, unknown>;
}

export interface VoiceResponse {
  success: boolean;
  transcript: string;
  confidence: number;
  processing_time: number;
}

// ===== 이미지 관련 인터페이스 =====
export interface ImageAnalysis {
  image_info: {
    width: number;
    height: number;
    format: string;
    size: string;
  };
  detected_objects: Array<{
    name: string;
    confidence: number;
    bbox: number[];
  }>;
  extracted_text: string[];
  sentiment: string;
  color_analysis: {
    dominant_colors: string[];
    brightness: string;
    contrast: string;
  };
  quality_assessment: {
    sharpness: string;
    noise_level: string;
    overall_quality: string;
  };
  analysis_time: string;
}

// ===== 명령어 관련 인터페이스 =====
export interface CommandRequest {
  command: string;
  args: string[];
  user_id?: string;
}

export interface CommandResponse {
  success: boolean;
  response: string;
  execution_time: number;
  metadata?: Record<string, unknown>;
}

// ===== 통합 API 서비스 클래스 =====
class UnifiedAPIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * 기본 HTTP 요청 헬퍼
   * 
   * @param endpoint - API 엔드포인트
   * @param options - fetch 옵션
   * @param retries - 재시도 횟수 (기본값: 0)
   * @returns Promise<T> - 응답 데이터
   * @throws Error - 요청 실패 시
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 0
  ): Promise<T> {
    const url = joinApiHealthCheckUrl(this.baseURL, endpoint);
    const maxRetries = 3;
    const retryDelay = 1000; // 1초

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        // 5xx 서버 오류인 경우 재시도
        if (response.status >= 500 && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retries + 1)));
          return this.request<T>(endpoint, options, retries + 1);
        }
        
        // 4xx 클라이언트 오류는 재시도하지 않음
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // 네트워크 오류인 경우 재시도
      if (error instanceof TypeError && error.message.includes('fetch') && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retries + 1)));
        return this.request<T>(endpoint, options, retries + 1);
      }
      
      errorLogger.error(`API 요청 실패 (${endpoint})`, error, {
        component: 'UnifiedAPI',
        action: 'request',
        endpoint,
      });
      this.handleError(error);
    }
  }

  // ===== 고급 AI 분석 API =====
  async advancedAnalysis(request: AdvancedAnalysisRequest): Promise<AdvancedAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADVANCED_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async knowledgeProcessing(request: KnowledgeProcessingRequest): Promise<KnowledgeProcessingResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_KNOWLEDGE_PROCESSING_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async fileAnalysis(request: FileAnalysisRequest): Promise<FileAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_FILE_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async writingGeneration(request: WritingGenerationRequest): Promise<WritingGenerationResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_WRITING_GENERATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async conversationAnalysis(request: ConversationAnalysisRequest): Promise<ConversationAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_CONVERSATION_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realEstateAnalysis(request: RealEstateAnalysisRequest): Promise<RealEstateAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_REAL_ESTATE_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async voiceProcessing(request: VoiceProcessingRequest): Promise<VoiceProcessingResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_VOICE_PROCESSING_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async imageAnalysis(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_IMAGE_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async workflowExecution(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_WORKFLOW_EXECUTION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async learningOptimization(request: LearningOptimizationRequest): Promise<LearningOptimizationResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_LEARNING_OPTIMIZATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetricsResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_SYSTEM_METRICS_PATH), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async comprehensiveAnalysis(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_COMPREHENSIVE_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async predictiveAnalysis(request: { content: string; prediction_type?: string }): Promise<APIResponse<PredictiveAnalysis>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_PREDICTIVE_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async riskAssessment(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_RISK_ASSESSMENT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async competitorAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_COMPETITOR_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async financialAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_FINANCIAL_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedSentimentAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_SENTIMENT_ANALYSIS_ADVANCED_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async machineLearningPrediction(request: { content: string; prediction_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_MACHINE_LEARNING_PREDICTION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async deepLearningAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_DEEP_LEARNING_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async naturalLanguageProcessing(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_NATURAL_LANGUAGE_PROCESSING_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async cognitiveComputing(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_COGNITIVE_COMPUTING_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeDataAnalysis(request: { content: string; data_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_REAL_TIME_DATA_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedPredictiveModeling(request: { content: string; model_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADVANCED_PREDICTIVE_MODELING_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async adaptiveLearningSystem(request: { content: string; learning_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADAPTIVE_LEARNING_SYSTEM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeCollaboration(request: { content: string; collaboration_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_REAL_TIME_COLLABORATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedVisualization(request: { content: string; visualization_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADVANCED_VISUALIZATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async aiIntegratedAnalysis(request: { content: string; analysis_depth?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_INTEGRATED_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeDecisionSupport(request: { content: string; decision_type?: string; urgency_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_REAL_TIME_DECISION_SUPPORT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async autoInsightsGeneration(request: { content: string; insight_type?: string; data_sources?: string[] }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_AUTO_INSIGHTS_GENERATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async personalizedDashboard(request: { content: string; user_preferences?: Record<string, unknown>; dashboard_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_PERSONALIZED_DASHBOARD_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async multilingualSupport(request: { content: string; source_language?: string; target_language?: string; translation_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_MULTILINGUAL_SUPPORT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async arVrSupport(request: { content: string; vr_type?: string; interaction_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_AR_VR_SUPPORT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedInsightsGeneration(request: { content: string; insight_depth?: string; analysis_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADVANCED_INSIGHTS_GENERATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async blockchainSecurity(request: { content: string; security_level?: string; blockchain_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_BLOCKCHAIN_SECURITY_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async automatedWorkflowEngine(request: { content: string; workflow_type?: string; automation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_AUTOMATED_WORKFLOW_ENGINE_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async quantumComputingSupport(request: { content: string; quantum_type?: string; algorithm_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_QUANTUM_COMPUTING_SUPPORT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async edgeComputingSupport(request: { content: string; edge_type?: string; processing_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_EDGE_COMPUTING_SUPPORT_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async researchUnlimitedAnalysis(request: { content: string; analysis_type?: string; research_depth?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_RESEARCH_UNLIMITED_ANALYSIS_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedResearchControl(request: { content: string; control_level?: string; research_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ADVANCED_RESEARCH_CONTROL_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async experimentalResearchSystem(request: { content: string; research_scope?: string; innovation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_EXPERIMENTAL_RESEARCH_SYSTEM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async innovativeResearchPlatform(request: { content: string; platform_type?: string; research_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_INNOVATIVE_RESEARCH_PLATFORM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async futureTechnologyResearch(request: { content: string; technology_focus?: string; research_horizon?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_FUTURE_TECHNOLOGY_RESEARCH_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async integratedResearchEcosystem(request: { content: string; ecosystem_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_INTEGRATED_RESEARCH_ECOSYSTEM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async nextGenerationResearchInnovation(request: { content: string; innovation_type?: string; research_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_NEXT_GENERATION_RESEARCH_INNOVATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchSystem(request: { content: string; system_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ULTIMATE_RESEARCH_SYSTEM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchInnovationPlatform(request: { content: string; platform_type?: string; innovation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ULTIMATE_RESEARCH_INNOVATION_PLATFORM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchEcosystem(request: { content: string; ecosystem_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ULTIMATE_RESEARCH_ECOSYSTEM_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async cosmicAIIntegration(request: { input: string; context?: Record<string, unknown> }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_COSMIC_AI_INTEGRATION_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  // ===== 기존 API 메서드들 =====
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return postUnifiedChat(request, resolveChatApiBase(this.baseURL));
  }

  async getMessages(limit: number = 50, offset: number = 0): Promise<MessagesResponse> {
    const qs = new URLSearchParams({
      [API_QUERY_PARAM_LIMIT]: String(limit),
      [API_QUERY_PARAM_OFFSET]: String(offset),
    });
    const response = await fetch(
      joinApiHealthCheckUrl(this.baseURL, `${API_MESSAGES_LIST_PATH}?${qs}`),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.json();
  }

  async analyzeText(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, INTEGRATED_POST_PATH_ANALYZE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getProjects(): Promise<APIResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_PROJECTS_LIST_PATH), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getFiles(): Promise<APIResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, FILES_COLLECTION_PATH), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getHealth(): Promise<APIResponse> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  // ===== 유틸리티 메서드 =====
  async uploadFile(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append(API_FORM_FIELD_FILE, file);

    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, FILE_UPLOAD_PATH), {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(
      joinApiHealthCheckUrl(this.baseURL, `${FILE_DOWNLOAD_PATH}/${encodeURIComponent(fileId)}`),
      {
        method: 'GET',
      },
    );
    return response.blob();
  }

  /**
   * 에러 핸들링 및 분류
   * 
   * @param error - 발생한 오류
   * @throws Error - 사용자 친화적인 오류 메시지와 함께
   */
  private handleError(error: unknown): never {
    errorLogger.error('API Error', error, {
      component: 'UnifiedAPI',
      action: 'handleError',
    });
    
    let errorMessage: string;
    let errorType: string = 'UNKNOWN';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 에러 타입 분류
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'NETWORK';
        errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        errorType = 'AUTH';
        errorMessage = '인증에 실패했습니다. 다시 로그인해주세요.';
      } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        errorType = 'PERMISSION';
        errorMessage = '접근 권한이 없습니다.';
      } else if (errorMessage.includes('404')) {
        errorType = 'NOT_FOUND';
        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        errorType = 'SERVER';
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (errorMessage.includes('timeout')) {
        errorType = 'TIMEOUT';
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      }
    } else {
      errorMessage = String(error);
    }
    
    const enhancedError = new Error(errorMessage) as Error & { type?: string; originalError?: unknown };
    enhancedError.type = errorType;
    enhancedError.originalError = error;

    throw enhancedError;
  }

  // ===== 추가 메서드들 =====
  async conversationalQA(question: string, context?: Record<string, unknown>): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_CONVERSATIONAL_QA_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
    });
    return response.json();
  }

  async processFile(request: { file: File; project_id?: string;[key: string]: unknown }): Promise<APIResponse<Record<string, unknown>>> {
    const formData = new FormData();
    formData.append(API_FORM_FIELD_FILE, request.file);
    if (request.project_id) {
      formData.append(API_QUERY_PARAM_PROJECT_ID, request.project_id);
    }

    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_PROCESS_FILE_PATH), {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async analyzeImage(request: { image_data: string; format?: string;[key: string]: unknown }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(joinApiHealthCheckUrl(this.baseURL, API_AI_ANALYZE_IMAGE_PATH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}

// ===== WebSocket 관리 클래스 =====
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private roomId: string) { }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(
          joinApiBaseAndPath(
            WS_BASE_URL,
            `${WS_CHAT_ROOM_PATH_PREFIX}/${encodeURIComponent(this.roomId)}`,
          ),
        );

        this.ws.onopen = () => {
          errorLogger.info('WebSocket connected', {
            component: 'UnifiedAPI',
            action: 'connect',
            roomId: this.roomId,
          });
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (error: Event) => {
          errorLogger.error('WebSocket error', error instanceof Error ? error : new Error('WebSocket error'), {
            component: 'UnifiedAPI',
            action: 'connect',
            roomId: this.roomId,
          });
          reject(error);
        };

        this.ws.onclose = () => {
          errorLogger.info('WebSocket disconnected', {
            component: 'UnifiedAPI',
            action: 'disconnect',
            roomId: this.roomId,
          });
          this.attemptReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      errorLogger.info(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
        component: 'UnifiedAPI',
        action: 'attemptReconnect',
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });

      setTimeout(() => {
        this.connect().catch((err: unknown) => {
          errorLogger.error('WebSocket reconnect failed', err instanceof Error ? err : new Error(String(err)), {
            component: 'UnifiedAPI',
            action: 'reconnect',
          });
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  sendMessage(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      errorLogger.error('WebSocket is not connected', new Error('WebSocket not connected'), {
        component: 'UnifiedAPI',
        action: 'sendMessage',
        roomId: this.roomId,
      });
    }
  }

  sendAIRequest(content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'ai_request',
        content: content
      });
      this.ws.send(message);
    } else {
      errorLogger.error('WebSocket is not connected', new Error('WebSocket not connected'), {
        component: 'UnifiedAPI',
        action: 'sendMessage',
        roomId: this.roomId,
      });
    }
  }

  onMessage(callback: (data: Record<string, unknown>) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error: unknown) {
          errorLogger.error('Error parsing WebSocket message', error instanceof Error ? error : new Error(String(error)), {
            component: 'UnifiedAPI',
            action: 'onMessage',
            roomId: this.roomId,
          });
        }
      };
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// ===== 추가 함수들 =====
/** `CHAT_POST_PATH` POST 본문: 파이프라인 context 병합 + session_id·options 유지 (`config/api`) */
export function buildUnifiedApiChatRequestBody(request: ChatRequest): Record<string, unknown> {
  const {
    message,
    quality: reqQuality,
    context: reqContext,
    session_id,
    conversation_id,
    conversation_history,
    mergeApiChatContextOptions: reqMergeOpts,
    options,
    response_style: reqResponseStyle,
    perspective: reqPerspective,
    ...rest
  } = request;

  const rawHistory = Array.isArray(conversation_history) ? conversation_history : [];
  const history = normalizeChatTurnsForApiMerge(rawHistory);
  const mergeForPayload = resolveMergeOptionsFromHistoryAndExplicit(history, reqMergeOpts);

  const userContext: Record<string, unknown> = { ...(reqContext || {}) };
  if (reqQuality) {
    userContext.quality = reqQuality;
  }

  const { quality, contextForBody } = mergeApiChatContextPayload(
    message,
    userContext,
    history.length > 0 ? history : undefined,
    mergeForPayload
  );

  const body: Record<string, unknown> = {
    message,
    quality,
    response_style: reqResponseStyle ?? DEFAULT_CHAT_RESPONSE_STYLE,
    perspective: reqPerspective ?? DEFAULT_CHAT_PERSPECTIVE,
    ...(session_id ? { session_id } : {}),
    ...(conversation_id ? { [API_QUERY_PARAM_CONVERSATION_ID]: conversation_id } : {}),
    ...(contextForBody ? { context: contextForBody } : {}),
    ...(options && Object.keys(options).length > 0 ? { options } : {}),
    ...rest,
  };
  return body;
}

const CHAT_EXTRACT_FALLBACK = '응답을 생성할 수 없습니다. 다시 시도해 주세요.';

function resolveChatApiBase(origin: string): string {
  const t = (typeof origin === 'string' ? origin : '').trim().replace(/\/$/, '');
  return t.length > 0 ? t : FALLBACK_API_ORIGIN.replace(/\/$/, '');
}

/** 백엔드 JSON(`response`/`message`/`data` 등)을 ChatResponse 형태로 맞춤 */
function normalizeChatJsonToChatResponse(parsed: unknown): ChatResponse {
  const obj = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  if (obj?.success === false) {
    const err = obj.error;
    return {
      success: false,
      error: typeof err === 'string' && err.trim() ? err : '요청 처리에 실패했습니다.',
    };
  }
  const content = extractResponseContent({ data: parsed });
  if (content && content !== CHAT_EXTRACT_FALLBACK) {
    return {
      success: true,
      message: { content, timestamp: new Date().toISOString() },
      rawResponse: parsed,
    };
  }
  const err = obj?.error;
  return {
    success: false,
    error: typeof err === 'string' && err.trim() ? err : '유효한 답변 본문이 없습니다.',
  };
}

/**
 * 통합 대화 POST: `CHAT_POST_PATH` → `CHAT_POST_PATH_UNIFIED` 순(`getChatPostUrlsForConfigBase`).
 * 백엔드가 `response` 문자열 등 다양한 형식을 쓰면 `message.content`로 정규화한다.
 */
async function postUnifiedChat(request: ChatRequest, base: string): Promise<ChatResponse> {
  const rawCtx = request.context;
  const ctxSeed =
    rawCtx != null && typeof rawCtx === 'object' && !Array.isArray(rawCtx)
      ? { ...(rawCtx as Record<string, unknown>) }
      : {};
  const enrichedContext = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
    typeof request.message === 'string' ? request.message : '',
    ctxSeed
  );
  const requestForBody: ChatRequest = { ...request, context: enrichedContext };
  const body = buildUnifiedApiChatRequestBody(requestForBody);
  const urls = getChatPostUrlsForConfigBase(base);
  let lastFailure: ChatResponse = { success: false, error: '대화 API에 연결할 수 없습니다.' };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let parsed: unknown;
      try {
        const text = await response.text();
        parsed = text ? JSON.parse(text) : {};
      } catch {
        lastFailure = { success: false, error: '서버 응답을 JSON으로 해석할 수 없습니다.' };
        if (!response.ok && i < urls.length - 1) continue;
        return lastFailure;
      }

      if (!response.ok) {
        const o = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
        const errMsg =
          typeof o?.error === 'string' && o.error.trim() ? o.error : `HTTP ${response.status}`;
        lastFailure = { success: false, error: errMsg };
        if ((response.status === 404 || response.status >= 500) && i < urls.length - 1) {
          continue;
        }
        return lastFailure;
      }

      const out = normalizeChatJsonToChatResponse(parsed);
      if (out.success && out.message?.content) {
        return out;
      }
      lastFailure =
        out.success === false && out.error
          ? out
          : { success: false, error: '유효한 답변 본문이 없습니다.' };
      if (i < urls.length - 1) {
        continue;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      lastFailure = { success: false, error: msg };
      if (i < urls.length - 1) continue;
    }
  }

  if (process.env.REACT_APP_CHAT_OFFLINE_FALLBACK === 'true') {
    const q = typeof request.message === 'string' ? request.message : '';
    return {
      success: true,
      message: {
        content: `[오프라인 데모]\n백엔드에 연결되지 않았습니다.\n\n질문: "${q}"\n\n실제 답변을 받으려면 API 서버(예: 포트 5002)를 실행한 뒤 이 플래그를 끄세요.`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return lastFailure;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return postUnifiedChat(request, resolveChatApiBase(API_BASE_URL));
}

export async function uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append(API_FORM_FIELD_FILE, request.file);
  if (request.project_id) {
    formData.append(API_QUERY_PARAM_PROJECT_ID, request.project_id);
  }

  const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, FILE_UPLOAD_PATH), {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

// ===== 싱글톤 인스턴스 생성 =====
const unifiedAPI = new UnifiedAPIService();

// ===== 내보내기 =====
export {
  mergeApiChatContextPayload,
  scenarioInheritMergeOptionsFromMessages,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
} from './modernChatContextBuilder';
export type { ChatTurn, MergeApiChatContextPayloadOptions } from './modernChatContextBuilder';
/** 통합 대화·merge와 동일한 Genspark URL 계약 — 외부 통합 코드에서 `gensparkAgentRegistry` 직접 import 대신 사용 가능 */
export {
  resolveGensparkAgentIdFromWindowSearch,
  resolveGensparkAgentIdFromSearchParamsIfEnabled,
  isGensparkWindowRouteContextMergeDisabled,
  resolveAgentIdFromGensparkAgentsQuery,
  buildGensparkRouteAgentContext,
} from './gensparkAgentRegistry';
export type { UnifiedChatConversationTurn } from './chatConversationTurn';
export default unifiedAPI;
export { UnifiedAPIService };
