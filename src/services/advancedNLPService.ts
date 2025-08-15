import { Message, ChatContext } from '../types/chat';

export interface AdvancedNLPRequest {
  message: string;
  conversationHistory: Message[];
  context?: ChatContext;
  userPreferences?: Record<string, any>;
}

export interface IntentAnalysis {
  primaryIntent: string;
  secondaryIntents: string[];
  confidence: number;
  reasoning: string;
}

export interface RequirementAnalysis {
  explicitRequirements: string[];
  implicitRequirements: string[];
  constraints: string[];
  preferences: string[];
}

export interface ContextAnalysis {
  topics: string[];
  entities: string[];
  relationships: Array<{ type: string; entities: string[] }>;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'low' | 'medium' | 'high';
}

export interface AdvancedNLPResponse {
  intentAnalysis: IntentAnalysis;
  requirementAnalysis: RequirementAnalysis;
  contextAnalysis: ContextAnalysis;
  response: string;
  suggestions: string[];
  followUpQuestions: string[];
  actionItems: string[];
  confidenceScore: number;
}

class AdvancedNLPService {
  private baseUrl = 'http://localhost:8004/api/v8';

  async analyzeAdvancedNLP(request: AdvancedNLPRequest): Promise<AdvancedNLPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/advanced-nlp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversation_history: request.conversationHistory,
          context: request.context,
          user_preferences: request.userPreferences
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          intentAnalysis: data.intent_analysis,
          requirementAnalysis: data.requirement_analysis,
          contextAnalysis: data.context_analysis,
          response: data.response,
          suggestions: data.suggestions,
          followUpQuestions: data.follow_up_questions,
          actionItems: data.action_items,
          confidenceScore: data.confidence_score
        };
      } else {
        throw new Error('고급 NLP API 호출 실패');
      }
    } catch (error) {
      console.error('고급 NLP 분석 오류:', error);
      return this.createFallbackResponse(request);
    }
  }

  private createFallbackResponse(request: AdvancedNLPRequest): AdvancedNLPResponse {
    return {
      intentAnalysis: {
        primaryIntent: 'general_inquiry',
        secondaryIntents: [],
        confidence: 0.3,
        reasoning: '기본 분석 수행'
      },
      requirementAnalysis: {
        explicitRequirements: [],
        implicitRequirements: [],
        constraints: [],
        preferences: []
      },
      contextAnalysis: {
        topics: [],
        entities: [],
        relationships: [],
        sentiment: 'neutral',
        urgency: 'low',
        complexity: 'low'
      },
      response: '메시지를 이해했습니다. 더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.',
      suggestions: ['구체적인 요청사항을 명시해주세요.'],
      followUpQuestions: [],
      actionItems: [],
      confidenceScore: 0.3
    };
  }

  // 고급 문맥 분석을 위한 헬퍼 메서드들
  async analyzeComplexIntent(message: string): Promise<IntentAnalysis> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.intentAnalysis;
  }

  async analyzeLayeredRequirements(message: string): Promise<RequirementAnalysis> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.requirementAnalysis;
  }

  async generateIntelligentResponse(message: string, history: Message[]): Promise<string> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: history,
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.response;
  }

  async generateSmartSuggestions(message: string): Promise<string[]> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.suggestions;
  }

  async generateContextualQuestions(message: string): Promise<string[]> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.followUpQuestions;
  }

  async generateActionItems(message: string): Promise<string[]> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return response.actionItems;
  }

  // 복합 요구사항 분석
  async analyzeMultipleRequirements(message: string): Promise<{
    primary: string;
    secondary: string[];
    constraints: string[];
    preferences: string[];
  }> {
    const requirementAnalysis = await this.analyzeLayeredRequirements(message);
    
    return {
      primary: requirementAnalysis.explicitRequirements[0] || '',
      secondary: requirementAnalysis.explicitRequirements.slice(1),
      constraints: requirementAnalysis.constraints,
      preferences: requirementAnalysis.preferences
    };
  }

  // 문맥 복잡도 분석
  async analyzeContextComplexity(message: string): Promise<{
    complexity: 'low' | 'medium' | 'high';
    topics: string[];
    entities: string[];
    relationships: Array<{ type: string; entities: string[] }>;
  }> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: [],
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    return {
      complexity: response.contextAnalysis.complexity,
      topics: response.contextAnalysis.topics,
      entities: response.contextAnalysis.entities,
      relationships: response.contextAnalysis.relationships
    };
  }

  // 지능형 응답 생성
  async generateComprehensiveResponse(message: string, history: Message[]): Promise<{
    response: string;
    suggestions: string[];
    followUpQuestions: string[];
    actionItems: string[];
    confidence: number;
  }> {
    const request: AdvancedNLPRequest = {
      message,
      conversationHistory: history,
      context: undefined,
      userPreferences: undefined
    };

    const response = await this.analyzeAdvancedNLP(request);
    
    return {
      response: response.response,
      suggestions: response.suggestions,
      followUpQuestions: response.followUpQuestions,
      actionItems: response.actionItems,
      confidence: response.confidenceScore
    };
  }
}

export const advancedNLPService = new AdvancedNLPService();
