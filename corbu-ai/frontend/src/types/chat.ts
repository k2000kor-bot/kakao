export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  role?: 'user' | 'assistant' | 'system';
  chatId?: string;
  isBookmarked?: boolean;
  isMe?: boolean;
  isUser?: boolean; // 사용자 메시지 여부 추가
  type?: 'text' | 'image' | 'file' | 'system' | 'voice' | 'media' | 'ai_response' | 'analysis' | 'chart' | 'data' | 'error';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Array<{ emoji: string; users: string[] }>;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  isDeleted?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  urgency?: 'low' | 'medium' | 'high';
  metadata?: MessageMetadata;
  // AI 응답 관련 필드들
  aiResponse?: {
    type: 'conversation' | 'summary' | 'analysis' | 'form' | 'chart' | 'table' | 'list' | 'code' | 'image' | 'creative' | 'technical' | 'business';
    data?: any;
    confidence?: number;
    processingTime?: number;
    model?: string;
    tokens?: number;
    status?: 'success' | 'error' | 'processing';
    message?: string;
    metadata?: {
      confidence?: number;
      processingTime?: number;
      model?: string;
      tokens?: number;
    };
  };
  // 대화형 응답
  conversation?: {
    style: 'casual' | 'formal' | 'professional' | 'friendly';
    tone: 'neutral' | 'positive' | 'negative' | 'empathetic';
    language: 'korean' | 'english' | 'mixed';
  };
  // 요약 응답
  summary?: {
    type: 'brief' | 'detailed' | 'bullet_points' | 'timeline';
    keyPoints?: string[];
    wordCount?: number;
  };
  // 분석 응답
  analysis?: {
    type: 'sentiment' | 'trend' | 'comparison' | 'prediction';
    data?: any;
    insights?: string[];
  };
  // 폼 응답
  form?: {
    type: 'input' | 'selection' | 'multi_choice' | 'rating' | 'file_upload';
    fields?: Array<{
      id: string;
      label: string;
      type: string;
      required?: boolean;
      options?: string[];
      placeholder?: string;
    }>;
    submitAction?: string;
  };
  // 차트/시각화 응답
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
    data?: any;
    config?: any;
  };
  // 테이블 응답
  table?: {
    headers: string[];
    rows: string[][];
    sortable?: boolean;
    searchable?: boolean;
  };
  // 리스트 응답
  list?: {
    type: 'ordered' | 'unordered' | 'checklist' | 'timeline';
    items: string[];
    style?: 'compact' | 'detailed';
  };
  // 코드 응답
  code?: {
    language: string;
    code: string;
    syntaxHighlight?: boolean;
    executable?: boolean;
  };
  // 이미지 생성 응답
  generatedImage?: {
    url: string;
    prompt: string;
    style?: string;
    size?: string;
  };
}

// 채팅 세션 타입 추가
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  projectId?: string; // 프로젝트와 연동
  isActive: boolean;
  messageCount: number;
  lastMessage?: string;
  participants: string[];
  tags: string[];
  type?: 'general' | 'file_chat' | 'guideline_chat' | 'persistent_chat'; // 채팅 타입 추가
  parentChatId?: string; // 부모 채팅 ID
  childChatIds?: string[]; // 하위 채팅 ID들
  status: 'active' | 'archived' | 'deleted'; // 세션 상태
  lastActivity: string; // 마지막 활동 시간
  totalMessages: number; // 전체 메시지 수
  isPersistent: boolean; // 지속적 채팅 여부
  metadata?: {
    totalTokens?: number;
    averageResponseTime?: number;
    userSatisfaction?: number;
    conversationDepth?: number; // 대화 깊이
    topicCount?: number; // 다룬 주제 수
    sessionDuration?: number; // 세션 지속 시간 (분)
  };
}

// 채팅 리스트 관리 타입
export interface ChatList {
  sessions: ChatSession[];
  activeSessionId?: string;
  totalSessions: number;
  lastUpdated: string;
}

export interface AIResponseConfig {
  responseType: 'conversation' | 'summary' | 'analysis' | 'form' | 'chart' | 'table' | 'list' | 'code' | 'image' | 'creative' | 'technical' | 'business';
  style?: 'casual' | 'formal' | 'professional' | 'friendly';
  format?: 'text' | 'markdown' | 'html' | 'json';
  includeMetadata?: boolean;
  maxLength?: number;
  language?: 'korean' | 'english' | 'mixed';
}

export interface ChatContext {
  roomId: string;
  userId: string;
  conversationHistory: Message[];
  userPreferences: {
    preferredResponseType: string;
    language: string;
    style: string;
  };
  systemContext: {
    currentTopic: string;
    userIntent: string;
    conversationMode: 'casual' | 'professional' | 'analysis' | 'creative';
  };
}

// ChatMessage 타입 추가 (Message와 동일)
export interface ChatMessage extends Message {
  // Message 인터페이스를 상속하여 동일한 구조 유지
}

export interface StyleBasedMessage {
  content: string;
  style_confidence: number;
  natural_flow_score: number;
  formality_match: number;
  characteristic_elements: string[];
  logic_flow: string[];
  emotional_tone: string;
}

export interface PersonaProfile {
  speaking_style: {
    formality_level: number;
    conversation_role: string;
    logical_pattern: string;
    emotional_expression: string;
    tone_indicators: {
      concern: number;
      confidence: number;
      enthusiasm: number;
    };
    verbal_habits: string[];
  };
  conversation_logic: {
    argument_structure: string;
  };
  signature_expressions: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  participantCount: number;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
}

export interface ChatData {
  roomId: string;
  messages: Message[];
  participants: string[];
  totalMessages: number;
  lastUpdated: string;
}

// AI 응답 타입 추가
export interface AIResponse {
  id: string;
  content: string;
  type: 'text' | 'analysis' | 'chart' | 'code' | 'image' | 'system';
  confidence: number;
  processingTime: number;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
    data?: any;
    usedSystems?: string[];
    learningScore?: number;
  };
}

// AI 시스템 타입 추가
export interface AISystem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  capabilities: string[];
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

// 메시지 메타데이터 타입 추가
export interface MessageMetadata {
  processingTime: number;
  confidence: number;
  model: string;
  tokens: number;
  usedServices: string[];
  quality?: string;
  responseLength?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  files: ProjectFile[];
  guidelines: Guideline[];
  conversations: ConversationSummary[];
  members: string[];
  settings: {
    autoSummarize: boolean;
    enableVoiceInput: boolean;
    enableFileUpload: boolean;
    maxFileSize: number;
  };
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'other';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  path: string;
  file?: File; // 파일 객체 추가
  description?: string;
  tags: string[];
  learningStatus: 'pending' | 'processing' | 'completed' | 'failed';
  classification: FileClassification;
  extractedContent?: string;
  aiInsights?: AIInsight[];
  learningProgress: number; // 0-100
}

export interface FileClassification {
  category: string;
  subcategory: string;
  confidence: number;
  keywords: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  documentType: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIInsight {
  id: string;
  type: 'summary' | 'key_point' | 'action_item' | 'risk' | 'opportunity';
  content: string;
  confidence: number;
  relevance: number;
  tags: string[];
  createdAt: string;
}

export interface LearningSession {
  id: string;
  projectId: string;
  fileIds: string[];
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'failed';
  progress: number;
  insights: AIInsight[];
  modelVersion: string;
  learningMetrics: LearningMetrics;
}

export interface LearningMetrics {
  totalFiles: number;
  processedFiles: number;
  averageConfidence: number;
  newInsights: number;
  improvedClassifications: number;
  processingTime: number;
}

export interface Guideline {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'specific' | 'technical';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  participants: string[];
  keyTopics: string[];
  summary: string;
  createdAt: string;
  fileId?: string;
  chatRoomId?: string;
} 