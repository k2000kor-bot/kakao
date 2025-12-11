// CORBU AI 통합 API 서비스 - 모든 백엔드 API 호출을 중앙에서 관리

import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
  context?: Record<string, unknown>;
  session_id?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: {
    content: string;
    timestamp: string;
  };
  error?: string;
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

// ===== 채팅 관련 인터페이스 =====
export interface ChatRequest {
  message: string;
  context?: Record<string, unknown>;
  options?: Record<string, unknown>;
}



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
    const url = `${this.baseURL}${endpoint}`;
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
    const response = await fetch(`${this.baseURL}/api/ai/advanced-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async knowledgeProcessing(request: KnowledgeProcessingRequest): Promise<KnowledgeProcessingResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/knowledge-processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async fileAnalysis(request: FileAnalysisRequest): Promise<FileAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/file-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async writingGeneration(request: WritingGenerationRequest): Promise<WritingGenerationResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/writing-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async conversationAnalysis(request: ConversationAnalysisRequest): Promise<ConversationAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/conversation-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realEstateAnalysis(request: RealEstateAnalysisRequest): Promise<RealEstateAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/real-estate-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async voiceProcessing(request: VoiceProcessingRequest): Promise<VoiceProcessingResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/voice-processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async imageAnalysis(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/image-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async workflowExecution(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/workflow-execution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async learningOptimization(request: LearningOptimizationRequest): Promise<LearningOptimizationResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/learning-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetricsResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/system-metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async comprehensiveAnalysis(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/comprehensive-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async predictiveAnalysis(request: { content: string; prediction_type?: string }): Promise<APIResponse<PredictiveAnalysis>> {
    const response = await fetch(`${this.baseURL}/api/ai/predictive-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async riskAssessment(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/risk-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async competitorAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/competitor-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async financialAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/financial-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedSentimentAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/sentiment-analysis-advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async machineLearningPrediction(request: { content: string; prediction_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/machine-learning-prediction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async deepLearningAnalysis(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/deep-learning-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async naturalLanguageProcessing(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/natural-language-processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async cognitiveComputing(request: { content: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/cognitive-computing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeDataAnalysis(request: { content: string; data_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/real-time-data-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedPredictiveModeling(request: { content: string; model_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/advanced-predictive-modeling`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async adaptiveLearningSystem(request: { content: string; learning_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/adaptive-learning-system`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeCollaboration(request: { content: string; collaboration_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/real-time-collaboration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedVisualization(request: { content: string; visualization_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/advanced-visualization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async aiIntegratedAnalysis(request: { content: string; analysis_depth?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/ai-integrated-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async realTimeDecisionSupport(request: { content: string; decision_type?: string; urgency_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/real-time-decision-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async autoInsightsGeneration(request: { content: string; insight_type?: string; data_sources?: string[] }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/auto-insights-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async personalizedDashboard(request: { content: string; user_preferences?: Record<string, unknown>; dashboard_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/personalized-dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async multilingualSupport(request: { content: string; source_language?: string; target_language?: string; translation_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/multilingual-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async arVrSupport(request: { content: string; vr_type?: string; interaction_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/ar-vr-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedInsightsGeneration(request: { content: string; insight_depth?: string; analysis_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/advanced-insights-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async blockchainSecurity(request: { content: string; security_level?: string; blockchain_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/blockchain-security`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async automatedWorkflowEngine(request: { content: string; workflow_type?: string; automation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/automated-workflow-engine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async quantumComputingSupport(request: { content: string; quantum_type?: string; algorithm_type?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/quantum-computing-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async edgeComputingSupport(request: { content: string; edge_type?: string; processing_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/edge-computing-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async researchUnlimitedAnalysis(request: { content: string; analysis_type?: string; research_depth?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/research-unlimited-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async advancedResearchControl(request: { content: string; control_level?: string; research_mode?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/advanced-research-control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async experimentalResearchSystem(request: { content: string; research_scope?: string; innovation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/experimental-research-system`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async innovativeResearchPlatform(request: { content: string; platform_type?: string; research_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/innovative-research-platform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async futureTechnologyResearch(request: { content: string; technology_focus?: string; research_horizon?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/future-technology-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async integratedResearchEcosystem(request: { content: string; ecosystem_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/integrated-research-ecosystem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async nextGenerationResearchInnovation(request: { content: string; innovation_type?: string; research_focus?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/next-generation-research-innovation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchSystem(request: { content: string; system_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/ultimate-research-system`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchInnovationPlatform(request: { content: string; platform_type?: string; innovation_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/ultimate-research-innovation-platform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async ultimateResearchEcosystem(request: { content: string; ecosystem_type?: string; integration_level?: string }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/ultimate-research-ecosystem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async cosmicAIIntegration(request: { input: string; context?: Record<string, unknown> }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/cosmic-ai-integration`, {
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
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getMessages(limit: number = 50, offset: number = 0): Promise<MessagesResponse> {
    const response = await fetch(`${this.baseURL}/api/messages?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async analyzeText(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getProjects(): Promise<APIResponse> {
    const response = await fetch(`${this.baseURL}/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getFiles(): Promise<APIResponse> {
    const response = await fetch(`${this.baseURL}/api/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getHealth(): Promise<APIResponse> {
    const response = await fetch(`${this.baseURL}/health`, {
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
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/download/${fileId}`, {
      method: 'GET',
    });
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
    
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).type = errorType;
    (enhancedError as any).originalError = error;
    
    throw enhancedError;
  }

  // ===== 추가 메서드들 =====
  async conversationalQA(question: string, context?: Record<string, unknown>): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/conversational-qa`, {
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
    formData.append('file', request.file);
    if (request.project_id) {
      formData.append('project_id', request.project_id);
    }

    const response = await fetch(`${this.baseURL}/api/ai/process-file`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  async analyzeImage(request: { image_data: string; format?: string;[key: string]: unknown }): Promise<APIResponse<Record<string, unknown>>> {
    const response = await fetch(`${this.baseURL}/api/ai/analyze-image`, {
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
        this.ws = new WebSocket(`ws://localhost:8004/ws/chat/${this.roomId}`);

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
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  if (request.project_id) {
    formData.append('project_id', request.project_id);
  }

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

// ===== 싱글톤 인스턴스 생성 =====
const unifiedAPI = new UnifiedAPIService();

// ===== 내보내기 =====
export default unifiedAPI;
export { UnifiedAPIService };
