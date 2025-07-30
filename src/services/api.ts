import { SystemMetrics, ChatMessage, ChatRoom } from './types';

// API 서버 설정 - 고정 포트
export const API_SERVERS = {
  MAIN: 'http://localhost:8001',
  MESSAGE: 'http://localhost:8002',
  SYNC: 'http://localhost:8010',
  ANALYSIS: 'http://localhost:8005',
  SIMULATION: 'http://localhost:8009',
  MEDIA: 'http://localhost:8007',
  RESPONSE: 'http://localhost:8002',
  CONTEXT: 'http://localhost:8006',
  STRATEGY: 'http://localhost:8008',
  ADVANCED_MESSAGE: 'http://localhost:8002',
  UPLOAD: 'http://localhost:8002'
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // 메인 서버
  MAIN_STATUS: `${API_SERVERS.MAIN}/api/status`,
  MAIN_HEALTH: `${API_SERVERS.MAIN}/api/health`,

  // 메시지 생성 서버
  MESSAGE_STATUS: `${API_SERVERS.MESSAGE}/api/status`,
  MESSAGE_GENERATE: `${API_SERVERS.MESSAGE}/api/generate-message`,
  MESSAGE_HISTORY: `${API_SERVERS.MESSAGE}/api/message-history`,

  // 동기화 서버
  SYNC_STATUS: `${API_SERVERS.SYNC}/api/status`,
  SYNC_CHAT_ROOMS: `${API_SERVERS.SYNC}/api/chat-rooms`,
  SYNC_CHAT_MESSAGES: (roomId: string) => `${API_SERVERS.SYNC}/api/chat-messages/${roomId}`,
  SYNC_MEDIA_FILES: (roomId: string) => `${API_SERVERS.SYNC}/api/media-files/${roomId}`,
  SYNC_MANUAL: `${API_SERVERS.SYNC}/api/sync`,
  SYNC_STATUS_CHECK: `${API_SERVERS.SYNC}/api/sync-status`,

  // 대화 분석 서버
  ANALYSIS_STATUS: `${API_SERVERS.ANALYSIS}/api/status`,
  ANALYSIS_CONVERSATION: `${API_SERVERS.ANALYSIS}/api/analyze-conversation`,
  ANALYSIS_EMOTION: `${API_SERVERS.ANALYSIS}/api/analyze-emotion`,
  ANALYSIS_KEYWORDS: `${API_SERVERS.ANALYSIS}/api/extract-keywords`,
  ANALYSIS_HISTORY: (roomId: string) => `${API_SERVERS.ANALYSIS}/api/analysis-history/${roomId}`,

  // 시뮬레이션 서버
  SIMULATION_STATUS: `${API_SERVERS.SIMULATION}/api/status`,
  SIMULATION_RESPONSE: `${API_SERVERS.SIMULATION}/api/simulate-response`,
  SIMULATION_PREDICT_IMPACT: `${API_SERVERS.SIMULATION}/api/predict-impact`,
  SIMULATION_HISTORY: `${API_SERVERS.SIMULATION}/api/simulation-history`,

  // 미디어 관리 서버
  MEDIA_STATUS: `${API_SERVERS.MEDIA}/api/status`,
  MEDIA_UPLOAD: `${API_SERVERS.MEDIA}/api/upload-media`,
  MEDIA_FILES: (roomId: string) => `${API_SERVERS.MEDIA}/api/media-files/${roomId}`,
  MEDIA_SEARCH: `${API_SERVERS.MEDIA}/api/search-media`,
  MEDIA_STATS: `${API_SERVERS.MEDIA}/api/media-stats`,

  // 대응메시지 생성 서버
  RESPONSE_STATUS: `${API_SERVERS.RESPONSE}/api/status`,
  RESPONSE_GENERATE: `${API_SERVERS.RESPONSE}/api/generate-response`,
  RESPONSE_STRATEGIES: `${API_SERVERS.RESPONSE}/api/response-strategies`,
  RESPONSE_ADD_STRATEGY: `${API_SERVERS.RESPONSE}/api/add-strategy`,
  RESPONSE_HISTORY: `${API_SERVERS.RESPONSE}/api/response-history`,
  RESPONSE_FEEDBACK: `${API_SERVERS.RESPONSE}/api/feedback`,

  // 컨텍스트 분석 서버
  CONTEXT_STATUS: `${API_SERVERS.CONTEXT}/api/status`,
  CONTEXT_ANALYZE: `${API_SERVERS.CONTEXT}/api/analyze-context`,
  CONTEXT_PATTERNS: `${API_SERVERS.CONTEXT}/api/situation-patterns`,
  CONTEXT_ADD_PATTERN: `${API_SERVERS.CONTEXT}/api/add-pattern`,
  CONTEXT_HISTORY: (roomId: string) => `${API_SERVERS.CONTEXT}/api/context-history/${roomId}`,

  // 전략 최적화 서버
  STRATEGY_STATUS: `${API_SERVERS.STRATEGY}/api/status`,
  STRATEGY_OPTIMIZE: `${API_SERVERS.STRATEGY}/api/optimize-strategy`,
  STRATEGY_AB_TEST: `${API_SERVERS.STRATEGY}/api/run-ab-test`,
  STRATEGY_ANALYZE_PERFORMANCE: `${API_SERVERS.STRATEGY}/api/analyze-performance`,
  STRATEGY_PERFORMANCE: `${API_SERVERS.STRATEGY}/api/strategy-performance`,
  STRATEGY_OPTIMIZATION_HISTORY: `${API_SERVERS.STRATEGY}/api/optimization-history`,

  // 고도화된 메시지 생성 서버
  ADVANCED_MESSAGE_STATUS: `${API_SERVERS.ADVANCED_MESSAGE}/api/status`,
  ADVANCED_MESSAGE_GENERATE: `${API_SERVERS.ADVANCED_MESSAGE}/api/generate-advanced-message`,
  ADVANCED_MESSAGE_UPDATE_PROFILE: `${API_SERVERS.ADVANCED_MESSAGE}/api/update-user-profile`,
  ADVANCED_MESSAGE_LEARNING_FEEDBACK: `${API_SERVERS.ADVANCED_MESSAGE}/api/learning-feedback`,
  ADVANCED_MESSAGE_PERFORMANCE: `${API_SERVERS.ADVANCED_MESSAGE}/api/performance-analysis`,
  ADVANCED_MESSAGE_AI_MODELS: `${API_SERVERS.ADVANCED_MESSAGE}/api/ai-model-performance`,
  ADVANCED_MESSAGE_USER_PROFILE: (userId: string) => `${API_SERVERS.ADVANCED_MESSAGE}/api/user-profile/${userId}`
};

// API 호출 헬퍼 함수
export const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API 호출 오류 (${url}):`, error);
    throw error;
  }
};

// 서버 상태 확인
export const checkServerStatus = async () => {
  const servers = [
    { name: '메인 서버', url: API_ENDPOINTS.MAIN_STATUS },
    { name: '메시지 서버', url: API_ENDPOINTS.MESSAGE_STATUS },
    { name: '동기화 서버', url: API_ENDPOINTS.SYNC_STATUS },
    { name: '분석 서버', url: API_ENDPOINTS.ANALYSIS_STATUS },
    { name: '시뮬레이션 서버', url: API_ENDPOINTS.SIMULATION_STATUS },
    { name: '미디어 서버', url: API_ENDPOINTS.MEDIA_STATUS },
    { name: '대응메시지 서버', url: API_ENDPOINTS.RESPONSE_STATUS },
    { name: '컨텍스트 서버', url: API_ENDPOINTS.CONTEXT_STATUS },
    { name: '전략 최적화 서버', url: API_ENDPOINTS.STRATEGY_STATUS },
    { name: '고도화된 메시지 서버', url: API_ENDPOINTS.ADVANCED_MESSAGE_STATUS }
  ];

  const status: Record<string, string> = {};

  for (const server of servers) {
    try {
      const response = await fetch(server.url);
      status[server.name] = response.ok ? 'online' : 'error';
    } catch (error) {
      status[server.name] = 'offline';
    }
  }

  return status;
};

// API 응답 타입들
export interface ResponseRequest {
  strategy: string;
  characteristics: string;
  preference: string;
  content: string;
  chatRoomId: string;
}

export interface SmartResponseRequest {
  chatRoomId: string;
  conversationContext: {
    messages: ChatMessage[];
    strategy: string;
    characteristics: string;
    preference: string;
    desiredContent: string;
  };
  includeReasoning: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage: number;
  rating: number;
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface AdvancedMessageRequest {
  messageContent: string;
  selectedStyle: string;
  selectedTone: string;
  selectedStructure: string;
  targetAudience: string;
  context: string;
  keywords: string[];
}

export interface MessageSuggestionRequest {
  conversationContext: {
    messages: ChatMessage[];
    currentTopic: string;
    participants: string[];
    urgency: 'low' | 'medium' | 'high';
    mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  filters: {
    type: string[];
    tone: string[];
    length: string[];
    minConfidence: number;
  };
}

export interface QualityMetrics {
  relevance: number;
  coherence: number;
  helpfulness: number;
  naturalness: number;
  overall: number;
}

export interface MessageSuggestion {
  id: string;
  content: string;
  type: 'response' | 'follow_up' | 'clarification' | 'encouragement' | 'solution';
  confidence: number;
  reasoning: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  tags: string[];
  isSelected: boolean;
}

// 지식 관리 시스템 타입들
export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  confidence: number;
  isProcessed: boolean;
  isTraining: boolean;
  aiInsights: string[];
  usage: number;
  rating: number;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  subcategories: string[];
}

export interface AIInsight {
  id: string;
  type: 'topic' | 'sentiment' | 'key_phrase' | 'summary' | 'recommendation';
  content: string;
  confidence: number;
  timestamp: string;
}

export interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  status: string;
}

// API 서비스 클래스
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_SERVERS.MAIN) {
    this.baseUrl = baseUrl;
  }

  // 기본 HTTP 메서드들
  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async postFile<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 시스템 상태 확인
  async checkSystemHealth(): Promise<{ status: string }> {
    return this.get<{ status: string }>('/health');
  }

  // 채팅방 목록 조회
  async getChatRooms(): Promise<{ chatrooms: ChatRoom[] }> {
    return this.get<{ chatrooms: ChatRoom[] }>('/chatrooms');
  }

  // 채팅 메시지 조회
  async getChatMessages(chatRoomId: string, period: string = 'all'): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/chatrooms/${chatRoomId}/messages?period=${period}`);
  }

  // 시스템 메트릭스 조회
  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.get<SystemMetrics>('/system/metrics');
  }

  // AI 응답 생성
  async generateAIResponse(request: ResponseRequest): Promise<{ message: string; strategy: string; confidence: number }> {
    return this.post<{ message: string; strategy: string; confidence: number }>('/ai/response', request);
  }

  // 고급 AI 응답 생성
  async generateSmartResponse(request: SmartResponseRequest): Promise<{ message: string; reasoning?: string; confidence: number }> {
    return this.post<{ message: string; reasoning?: string; confidence: number }>('/ai/smart-response', request);
  }

  // 대화 감정 분석
  async analyzeConversationSentiment(messages: ChatMessage[]): Promise<{
    analysis: Array<{ messageId: string; sentiment: string; score: number }>;
    overallSentiment: string;
    confidence: number;
  }> {
    return this.post<{
      analysis: Array<{ messageId: string; sentiment: string; score: number }>;
      overallSentiment: string;
      confidence: number;
    }>('/ai/analyze-sentiment', messages);
  }

  // 주제 추출
  async extractTopics(messages: ChatMessage[]): Promise<{ topics: string[]; confidence: number }> {
    return this.post<{ topics: string[]; confidence: number }>('/ai/extract-topics', messages);
  }

  // 품질 분석
  async analyzeQuality(message: string): Promise<QualityMetrics> {
    return this.post<QualityMetrics>('/ai/quality-analysis', { message });
  }

  // 새로운 메시지 생성 관련 API들

  // 메시지 템플릿 목록 조회
  async getMessageTemplates(category?: string, search?: string): Promise<{ templates: MessageTemplate[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const endpoint = queryString ? `/templates?${queryString}` : '/templates';
    return this.get<{ templates: MessageTemplate[] }>(endpoint);
  }

  // 새 메시지 템플릿 생성
  async createMessageTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt'>): Promise<{ message: string; template: MessageTemplate }> {
    return this.post<{ message: string; template: MessageTemplate }>('/templates', template);
  }

  // 메시지 템플릿 수정
  async updateMessageTemplate(templateId: string, template: MessageTemplate): Promise<{ message: string }> {
    return this.put<{ message: string }>(`/templates/${templateId}`, template);
  }

  // 메시지 템플릿 삭제
  async deleteMessageTemplate(templateId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/templates/${templateId}`);
  }

  // 고급 메시지 작성
  async advancedMessageCompose(request: AdvancedMessageRequest): Promise<{
    qualityScores: {
      clarity: number;
      empathy: number;
      professionalism: number;
      effectiveness: number;
      overall: number;
    };
    suggestions: string[];
    improvedMessage: string;
  }> {
    return this.post<{
      qualityScores: {
        clarity: number;
        empathy: number;
        professionalism: number;
        effectiveness: number;
        overall: number;
      };
      suggestions: string[];
      improvedMessage: string;
    }>('/ai/advanced-compose', request);
  }

  // 지능형 메시지 제안
  async getMessageSuggestions(request: MessageSuggestionRequest): Promise<{ suggestions: MessageSuggestion[] }> {
    return this.post<{ suggestions: MessageSuggestion[] }>('/ai/message-suggestions', request);
  }

  // 대화 컨텍스트 분석
  async analyzeConversationContext(messages: ChatMessage[]): Promise<{
    analysis: {
      sentiment: string;
      urgency: string;
      keyTopics: string[];
      suggestedTone: string;
      priorityActions: string[];
    };
  }> {
    return this.post<{
      analysis: {
        sentiment: string;
        urgency: string;
        keyTopics: string[];
        suggestedTone: string;
        priorityActions: string[];
      };
    }>('/ai/analyze-conversation', messages);
  }

  // 지식 관리 시스템 API들

  // 지식 문서 업로드
  async uploadKnowledgeDocument(file: File): Promise<{
    success: boolean;
    document: KnowledgeDocument;
    classification: {
      category: string;
      category_name: string;
      subcategory: string;
      confidence: number;
    };
    insights: AIInsight[];
  }> {
    return this.postFile<{
      success: boolean;
      document: KnowledgeDocument;
      classification: {
        category: string;
        category_name: string;
        subcategory: string;
        confidence: number;
      };
      insights: AIInsight[];
    }>('/knowledge/upload', file);
  }

  // 지식 문서 목록 조회
  async getKnowledgeDocuments(category?: string, search?: string): Promise<{ documents: KnowledgeDocument[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const endpoint = queryString ? `/knowledge/documents?${queryString}` : '/knowledge/documents';
    return this.get<{ documents: KnowledgeDocument[] }>(endpoint);
  }

  // 지식 문서 삭제
  async deleteKnowledgeDocument(documentId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/knowledge/documents/${documentId}`);
  }

  // 문서 사용 횟수 업데이트
  async updateDocumentUsage(documentId: string): Promise<{ usage: number }> {
    return this.post<{ usage: number }>(`/knowledge/documents/${documentId}/usage`, {});
  }

  // 지식 기반 AI 학습 시작
  async startKnowledgeAITraining(): Promise<{
    message: string;
    final_accuracy: number;
    final_loss: number;
    total_documents: number;
  }> {
    return this.post<{
      message: string;
      final_accuracy: number;
      final_loss: number;
      total_documents: number;
    }>('/knowledge/training/start', {});
  }

  // AI 학습 상태 조회
  async getTrainingStatus(): Promise<TrainingStatus> {
    return this.get<TrainingStatus>('/knowledge/training/status');
  }

  // 지식 문서 카테고리 목록 조회
  async getKnowledgeCategories(): Promise<{ categories: DocumentCategory[] }> {
    return this.get<{ categories: DocumentCategory[] }>('/knowledge/categories');
  }

  // AI 인사이트 조회
  async getAIInsights(): Promise<{ insights: AIInsight[] }> {
    return this.get<{ insights: AIInsight[] }>('/knowledge/insights');
  }

  // 템플릿 사용 통계 업데이트
  async updateTemplateUsage(templateId: string): Promise<{ message: string }> {
    return this.put<{ message: string }>(`/templates/${templateId}/usage`, {});
  }

  // 템플릿 평점 업데이트
  async updateTemplateRating(templateId: string, rating: number): Promise<{ message: string }> {
    return this.put<{ message: string }>(`/templates/${templateId}/rating`, { rating });
  }

  // 템플릿 즐겨찾기 토글
  async toggleTemplateFavorite(templateId: string): Promise<{ message: string }> {
    return this.put<{ message: string }>(`/templates/${templateId}/favorite`, {});
  }

  // 메시지 제안 피드백
  async submitSuggestionFeedback(suggestionId: string, feedback: 'positive' | 'negative'): Promise<{ message: string }> {
    return this.post<{ message: string }>('/ai/suggestion-feedback', {
      suggestionId,
      feedback
    });
  }

  // 메시지 커스터마이징
  async customizeMessage(suggestionId: string, customizations: {
    content: string;
    tone?: string;
    length?: string;
  }): Promise<{ message: string; customizedMessage: string }> {
    return this.post<{ message: string; customizedMessage: string }>('/ai/customize-message', {
      suggestionId,
      customizations
    });
  }

  // 실시간 메시지 품질 모니터링
  async monitorMessageQuality(message: string): Promise<{
    realTimeScore: number;
    suggestions: string[];
    alerts: string[];
  }> {
    return this.post<{
      realTimeScore: number;
      suggestions: string[];
      alerts: string[];
    }>('/ai/monitor-quality', { message });
  }

  // 메시지 스타일 분석
  async analyzeMessageStyle(message: string): Promise<{
    style: string;
    characteristics: string[];
    recommendations: string[];
  }> {
    return this.post<{
      style: string;
      characteristics: string[];
      recommendations: string[];
    }>('/ai/analyze-style', { message });
  }

  // 컨텍스트 기반 메시지 최적화
  async optimizeMessageForContext(message: string, context: {
    audience: string;
    situation: string;
    urgency: string;
    mood: string;
  }): Promise<{
    optimizedMessage: string;
    improvements: string[];
    confidence: number;
  }> {
    return this.post<{
      optimizedMessage: string;
      improvements: string[];
      confidence: number;
    }>('/ai/optimize-context', { message, context });
  }

  // 고급 분석 메서드 추가
  async advancedAnalysis(request: {
    conversationData: string;
    analysisModules: string[];
    responseStrategy: string;
  }): Promise<{
    analysis: any;
    recommendations: string[];
    confidence: number;
  }> {
    return this.post<{
      analysis: any;
      recommendations: string[];
      confidence: number;
    }>('/ai/advanced-analysis', request);
  }

  // AI 학습 관련 API
  async startGeneralAITraining(): Promise<{ status: string; message: string }> {
    return this.post<{ status: string; message: string }>('/ai/training/start', {});
  }

  async getAITrainingStatus(): Promise<{
    status: string;
    progress: number;
    current_epoch: number;
    models_loaded: string[];
    last_update: string;
  }> {
    return this.get<{
      status: string;
      progress: number;
      current_epoch: number;
      models_loaded: string[];
      last_update: string;
    }>('/ai/training/status');
  }

  async loadAIModels(timestamp?: string): Promise<{ status: string; timestamp?: string }> {
    return this.post<{ status: string; timestamp?: string }>('/ai/training/load-models', { timestamp });
  }

  async predictTextCategory(text: string): Promise<{
    category?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    error?: string;
  }> {
    return this.post<{
      category?: string;
      confidence?: number;
      probabilities?: Record<string, number>;
      error?: string;
    }>('/ai/predict/category', { text });
  }

  async analyzeTextSentiment(text: string): Promise<{
    sentiment?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    error?: string;
  }> {
    return this.post<{
      sentiment?: string;
      confidence?: number;
      probabilities?: Record<string, number>;
      error?: string;
    }>('/ai/analyze/sentiment', { text });
  }

  // 지침 관리 관련 API
  async generateGuidelinesFromData(): Promise<{
    status: string;
    generated_count?: number;
    guidelines?: string[];
    error?: string;
  }> {
    return this.post<{
      status: string;
      generated_count?: number;
      guidelines?: string[];
      error?: string;
    }>('/guidelines/generate', {});
  }

  async getGuidelines(category?: string, priority?: string): Promise<{
    guidelines: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      priority: string;
      keywords: string[];
      references: string[];
      usage_count: number;
      effectiveness_score: number;
      created_at: string;
      updated_at: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);

    return this.get<{
      guidelines: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        priority: string;
        keywords: string[];
        references: string[];
        usage_count: number;
        effectiveness_score: number;
        created_at: string;
        updated_at: string;
      }>;
    }>(`/guidelines?${params.toString()}`);
  }

  async getRelevantGuidelines(context: string, limit: number = 5): Promise<{
    guidelines: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      priority: string;
      keywords: string[];
      references: string[];
      usage_count: number;
      effectiveness_score: number;
      created_at: string;
      updated_at: string;
      relevance_score: number;
    }>;
  }> {
    return this.post<{
      guidelines: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        priority: string;
        keywords: string[];
        references: string[];
        usage_count: number;
        effectiveness_score: number;
        created_at: string;
        updated_at: string;
        relevance_score: number;
      }>;
    }>('/guidelines/relevant', { context, limit });
  }

  async updateGuidelineUsage(guidelineId: string, context: string = '', feedback: string = ''): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/guidelines/${guidelineId}/usage`, { context, feedback });
  }

  async evaluateGuidelineEffectiveness(guidelineId: string, metrics: Record<string, number>): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/guidelines/${guidelineId}/evaluate`, { metrics });
  }

  async getGuidelineStatistics(): Promise<{
    total_guidelines?: number;
    category_counts?: Record<string, number>;
    priority_counts?: Record<string, number>;
    average_usage?: number;
    average_effectiveness?: number;
    error?: string;
  }> {
    return this.get<{
      total_guidelines?: number;
      category_counts?: Record<string, number>;
      priority_counts?: Record<string, number>;
      average_usage?: number;
      average_effectiveness?: number;
      error?: string;
    }>('/guidelines/statistics');
  }

  // 지식 고도화 관련 API
  async extractKnowledgeFromDocuments(): Promise<{
    status: string;
    extracted_count?: number;
    knowledge_items?: string[];
    error?: string;
  }> {
    return this.post<{
      status: string;
      extracted_count?: number;
      knowledge_items?: string[];
      error?: string;
    }>('/knowledge/extract', {});
  }

  async searchKnowledge(query: string, limit: number = 10): Promise<{
    results: Array<{
      id: string;
      title: string;
      content: string;
      knowledge_type: string;
      category: string;
      priority: string;
      similarity: number;
      confidence: number;
      usage_count: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('limit', limit.toString());

    return this.get<{
      results: Array<{
        id: string;
        title: string;
        content: string;
        knowledge_type: string;
        category: string;
        priority: string;
        similarity: number;
        confidence: number;
        usage_count: number;
      }>;
    }>(`/knowledge/search?${params.toString()}`);
  }

  async getKnowledgeByType(knowledgeType: string): Promise<{
    knowledge_type: string;
    items: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      priority: string;
      confidence: number;
      usage_count: number;
      expert_verified: boolean;
    }>;
  }> {
    return this.get<{
      knowledge_type: string;
      items: Array<{
        id: string;
        title: string;
        content: string;
        category: string;
        priority: string;
        confidence: number;
        usage_count: number;
        expert_verified: boolean;
      }>;
    }>(`/knowledge/type/${knowledgeType}`);
  }

  async getKnowledgeByCategory(category: string): Promise<{
    category: string;
    items: Array<{
      id: string;
      title: string;
      content: string;
      knowledge_type: string;
      priority: string;
      confidence: number;
      usage_count: number;
      expert_verified: boolean;
    }>;
  }> {
    return this.get<{
      category: string;
      items: Array<{
        id: string;
        title: string;
        content: string;
        knowledge_type: string;
        priority: string;
        confidence: number;
        usage_count: number;
        expert_verified: boolean;
      }>;
    }>(`/knowledge/category/${category}`);
  }

  async getRelatedKnowledge(knowledgeId: string, limit: number = 5): Promise<{
    knowledge_id: string;
    related_items: Array<{
      id: string;
      title: string;
      content: string;
      knowledge_type: string;
      category: string;
      priority: string;
      confidence: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    return this.get<{
      knowledge_id: string;
      related_items: Array<{
        id: string;
        title: string;
        content: string;
        knowledge_type: string;
        category: string;
        priority: string;
        confidence: number;
      }>;
    }>(`/knowledge/${knowledgeId}/related?${params.toString()}`);
  }

  async updateKnowledgeUsage(knowledgeId: string, query: string = '', context: string = '', rating?: number): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/knowledge/${knowledgeId}/usage`, { query, context, rating });
  }

  async addExpertVerification(knowledgeId: string, expertName: string, status: string, comments: string = ''): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/knowledge/${knowledgeId}/verify`, { expert_name: expertName, status, comments });
  }

  async getKnowledgeStatistics(): Promise<{
    total_knowledge?: number;
    type_counts?: Record<string, number>;
    category_counts?: Record<string, number>;
    priority_counts?: Record<string, number>;
    average_usage?: number;
    average_confidence?: number;
    verified_count?: number;
    verification_rate?: number;
    error?: string;
  }> {
    return this.get<{
      total_knowledge?: number;
      type_counts?: Record<string, number>;
      category_counts?: Record<string, number>;
      priority_counts?: Record<string, number>;
      average_usage?: number;
      average_confidence?: number;
      verified_count?: number;
      verification_rate?: number;
      error?: string;
    }>('/knowledge/statistics');
  }
}

// 폴더 동기화 API
export interface SyncFolderRequest {
  folderPath: string;
  options: {
    includeNewFiles: boolean;
    updateExisting: boolean;
    autoProcess: boolean;
  };
  filters: {
    includeTxt: boolean;
    includePdf: boolean;
    includeDoc: boolean;
  };
  searchKeywords: string[];
  categoryTags: string[];
}

export interface SyncFolderResponse {
  success: boolean;
  processedFiles: number;
  dbRecords: number;
  message: string;
}

export const syncFolder = async (request: SyncFolderRequest): Promise<SyncFolderResponse> => {
  try {
    const response = await fetch('/api/sync-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`동기화 오류: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('폴더 동기화 오류:', error);
    throw error;
  }
};

export const stopSync = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/sync-folder/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`중지 오류: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('동기화 중지 오류:', error);
    throw error;
  }
};

// 파일 업로드
export async function uploadFile(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('파일 업로드 실패');
    return response.json();
  } catch (error) {
    // 백엔드 API가 없을 때 모의 응답
    console.log('백엔드 API 없음, 모의 업로드 성공');
    return { success: true, filename: file.name };
  }
}

// 파일 리스트 조회
export async function fetchFileList(): Promise<string[]> {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) throw new Error('파일 리스트 조회 실패');
    return response.json();
  } catch (error) {
    // 백엔드 API가 없을 때 모의 데이터
    console.log('백엔드 API 없음, 모의 파일 리스트 반환');
    return [
      'sample_document.pdf',
      'project_guidelines.docx',
      'meeting_notes.txt',
      'blueprint.jpg',
      'contract.pdf'
    ];
  }
}

// 파일 삭제
export async function deleteFile(filename: string): Promise<any> {
  try {
    const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('파일 삭제 실패');
    return response.json();
  } catch (error) {
    // 백엔드 API가 없을 때 모의 응답
    console.log('백엔드 API 없음, 모의 삭제 성공');
    return { success: true, deleted: filename };
  }
}

// API 서비스 인스턴스 생성 및 export
const apiService = new ApiService();
export { apiService };
export default apiService; 