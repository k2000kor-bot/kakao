// 대응 메시지 관련 컴포넌트들
export { default as ResponseMessageGenerator } from './ResponseMessageGenerator';
export { default as ResponseTemplateManager } from './ResponseTemplateManager';
export { default as SmartResponseGenerator } from './SmartResponseGenerator';
export { default as AdvancedResponseAnalyzer } from './AdvancedResponseAnalyzer';
export { default as AIResponseQualityAnalyzer } from './AIResponseQualityAnalyzer';
export { default as IntegratedMessageGenerator } from './IntegratedMessageGenerator';
export { default as AdvancedMessageComposer } from './AdvancedMessageComposer';
export { default as MessageTemplateLibrary } from './MessageTemplateLibrary';
export { default as IntelligentMessageSuggester } from './IntelligentMessageSuggester';

// 타입 정의들
export interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
}

export interface ResponseStrategy {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface QualityMetrics {
  relevance: number;
  coherence: number;
  helpfulness: number;
  naturalness: number;
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

export interface ConversationContext {
  messages: Array<{
    sender: string;
    content: string;
    timestamp: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }>;
  currentTopic: string;
  participants: string[];
  urgency: 'low' | 'medium' | 'high';
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
} 