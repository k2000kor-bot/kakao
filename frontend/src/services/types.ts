// 시스템 메트릭스 타입
export interface SystemMetrics {
  totalMessages: number;
  activeUsers: number;
  sentimentScore: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'link' | 'video' | 'deleted';
  fileInfo?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };
  linkInfo?: {
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  };
  imageInfo?: {
    url: string;
    alt?: string;
  };
  isDeleted?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  participantCount: number;
  messageCount: number;
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isDeleted: boolean;
  mediaFiles: string[];
}

// 알림 타입
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

// 대화 분석 결과 타입
export interface ConversationAnalysis {
  sentiment: string;
  urgency: string;
  keyTopics: string[];
  suggestedTone: string;
  priorityActions: string[];
}

// AI 응답 타입
export interface AIResponse {
  message: string;
  strategy: string;
  confidence: number;
}

// 고급 AI 응답 타입
export interface SmartAIResponse {
  message: string;
  reasoning?: string;
  confidence: number;
}

// 감정 분석 결과 타입
export interface SentimentAnalysis {
  analysis: Array<{
    messageId: string;
    sentiment: string;
    score: number;
  }>;
  overallSentiment: string;
  confidence: number;
}

// 주제 추출 결과 타입
export interface TopicExtraction {
  topics: string[];
  confidence: number;
}

// 품질 메트릭스 타입
export interface QualityMetrics {
  relevance: number;
  coherence: number;
  helpfulness: number;
  naturalness: number;
  overall: number;
}

// 메시지 템플릿 타입
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

// 고급 메시지 요청 타입
export interface AdvancedMessageRequest {
  messageContent: string;
  selectedStyle: string;
  selectedTone: string;
  selectedStructure: string;
  targetAudience: string;
  context: string;
  keywords: string[];
}

// 메시지 제안 요청 타입
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

// 메시지 제안 타입
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

// 실시간 차트 데이터 타입
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label: string;
}

export interface RealTimeData {
  messages: number;
  users: number;
  sentiment: number;
  timestamp: string;
}

// 대화 예측 타입
export interface ConversationPrediction {
  nextTopic: string;
  confidence: number;
  suggestedResponse: string;
  reasoning: string;
}

// 대화 품질 분석 타입
export interface ConversationQuality {
  engagement: number;
  clarity: number;
  relevance: number;
  overall: number;
  suggestions: string[];
}

// 자동 응답 최적화 타입
export interface AutoResponseOptimization {
  originalResponse: string;
  optimizedResponse: string;
  improvements: string[];
  confidence: number;
}

// 메시지 스타일 타입
export interface MessageStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

// 메시지 톤 타입
export interface MessageTone {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

// 메시지 구조 타입
export interface MessageStructure {
  id: string;
  name: string;
  description: string;
  template: string;
}

// 고급 분석 요청 타입
export interface AdvancedAnalysisRequest {
  conversationData: string;
  analysisModules: string[];
  responseStrategy: string;
}

// 고급 분석 결과 타입
export interface AdvancedAnalysisResult {
  metrics: {
    engagement: number;
    clarity: number;
    relevance: number;
    effectiveness: number;
  };
  insights: string[];
  recommendations: string[];
  confidence: number;
}

// 스마트 응답 생성 요청 타입
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

// 스마트 응답 결과 타입
export interface SmartResponseResult {
  message: string;
  reasoning?: string;
  confidence: number;
  strategy: string;
  contextMatch: number;
}

// 대화 분석 요청 타입
export interface ConversationAnalysisRequest {
  chatRoomId: string;
  startDate: string;
  endDate: string;
  analysisType: string;
}

// 대화 분석 결과 타입
export interface ConversationAnalysisResult {
  summary: {
    totalMessages: number;
    participants: number;
    duration: string;
    sentiment: string;
  };
  topics: Array<{
    name: string;
    frequency: number;
    sentiment: string;
  }>;
  insights: string[];
  recommendations: string[];
}

// AI 예측 요청 타입
export interface AIPredictionRequest {
  chatRoomId: string;
  conversationHistory: ChatMessage[];
  predictionType: string;
}

// AI 예측 결과 타입
export interface AIPredictionResult {
  predictions: Array<{
    type: string;
    content: string;
    confidence: number;
    reasoning: string;
  }>;
  nextActions: string[];
  riskFactors: string[];
}

// 품질 분석 요청 타입
export interface QualityAnalysisRequest {
  conversationData: string;
  analysisCriteria: string[];
}

// 품질 분석 결과 타입
export interface QualityAnalysisResult {
  qualityScore: number;
  breakdown: {
    engagement: number;
    clarity: number;
    relevance: number;
    effectiveness: number;
  };
  suggestions: string[];
  alerts: string[];
}

// 자동 응답 최적화 요청 타입
export interface AutoResponseOptimizationRequest {
  originalResponse: string;
  context: {
    audience: string;
    situation: string;
    urgency: string;
  };
  optimizationGoals: string[];
}

// 자동 응답 최적화 결과 타입
export interface AutoResponseOptimizationResult {
  optimizedResponse: string;
  improvements: string[];
  confidence: number;
  reasoning: string;
} 