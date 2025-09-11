export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  guidelines: Guideline[];
  logicRules: LogicRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'doc' | 'txt' | 'image';
  category: string;
  tags: string[];
  uploadedAt: Date;
  processedContent?: string;
  embeddings?: number[];
}

export interface Guideline {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  context: string[];
  examples: string[];
  createdAt: Date;
}

export interface LogicRule {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  actions: Action[];
  priority: number;
  isActive: boolean;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

export interface Action {
  type: 'generate_response' | 'apply_template' | 'use_guideline' | 'call_api' | 'set_variable';
  parameters: Record<string, any>;
}

export interface MessageGenerationRequest {
  context: string;
  selectedMessage?: any;
  knowledgeBaseId: string;
  guidelines?: string[];
  logicRules?: string[];
  userPreferences: {
    tone: 'formal' | 'casual' | 'y' | 'professional';
    style: 'informative' | 'persuasive' | 'empathetic' | 'analytical';
    length: 'short' | 'medium' | 'long';
  };
  constraints?: {
    maxLength?: number;
    includeKeywords?: string[];
    excludeKeywords?: string;
  };
}

export interface MessageGenerationResponse {
  generatedMessage: string;
  confidence: number;
  reasoning: string;
  usedGuidelines: string[];
  appliedRules: LogicRule[];
  suggestions: string[];
  metadata: {
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
  };
}

export interface AIServiceConfig {
  openaiApiKey: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
  maxTokens: number;
  temperature: number;
  useDeepLearning: boolean;
  deepLearningModel?: string;
}

export interface KnowledgeProcessingResult {
  id: string;
  status: 'processing' | 'completed' | 'error';
  extractedInfo: {
    keyPoints: string[];
    entities: string[];
    summary: string;
    confidence: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    relationships?: string;
  };
  metadata: {
    processedAt: Date;
    processingTime: number;
    fileSize: number;
    documentId?: string;
    modelUsed?: string;
  };
  embeddings?: number[];
} 