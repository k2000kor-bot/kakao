import { Message, ChatContext } from '../types/chat';

export interface ContextualAnalysis {
  intent: string;
  requirements: string[];
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  followUpQuestions: string[];
  summary: string;
  confidence: number;
}

export interface ContextualRequest {
  message: string;
  conversationHistory: Message[];
  context?: ChatContext;
  userPreferences?: Record<string, any>;
}

export interface ContextualResponse {
  analysis: ContextualAnalysis;
  response: string;
  suggestions: string[];
  relatedTopics: string[];
  nextActions: string[];
}

export class ContextualAnalysisService {
  private baseUrl = 'http://localhost:8003/api/v7';

  async analyzeContext(request: ContextualRequest): Promise<ContextualResponse> {
    try {
      // 백엔드 API 호출
      const response = await fetch(`${this.baseUrl}/contextual-analysis`, {
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
          analysis: data.analysis,
          response: data.response,
          suggestions: data.suggestions,
          relatedTopics: data.related_topics,
          nextActions: data.next_actions
        };
      } else {
        throw new Error('백엔드 API 호출 실패');
      }
    } catch (error) {
      console.error('문맥 분석 오류:', error);

      // 로컬 폴백 분석 수행
      const fullContext = this.buildFullContext(request);
      const analysis = await this.performContextualAnalysis(fullContext, request.message);
      const response = this.generateContextualResponse(analysis, request);
      const suggestions = this.generateSuggestions(analysis);
      const relatedTopics = this.generateRelatedTopics(analysis);
      const nextActions = this.generateNextActions(analysis);

      return {
        analysis,
        response,
        suggestions,
        relatedTopics,
        nextActions
      };
    }
  }

    private buildFullContext(request: ContextualRequest): string {
    const historyText = request.conversationHistory
      .map(msg => `${msg.isUser || msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    return `${historyText}\n\n사용자: ${request.message}`;
  }

  private async performContextualAnalysis(fullContext: string, newMessage: string): Promise<ContextualAnalysis> {
    // 주요 토픽 추출
    const topics = this.extractMainTopics(fullContext);

    // 핵심 엔티티 추출
    const entities = this.extractKeyEntities(fullContext);

    // 의도 분석
    const intent = this.analyzeIntent(newMessage, fullContext);

    // 요구사항 추출
    const requirements = this.extractRequirements(newMessage, fullContext);

    // 감정 분석
    const sentiment = this.analyzeSentiment(fullContext);

    // 긴급도 분석
    const urgency = this.analyzeUrgency(newMessage, fullContext);

    // 액션 아이템 추출
    const actionItems = this.extractActionItems(newMessage, fullContext);

    // 후속 질문 생성
    const followUpQuestions = this.generateFollowUpQuestions(topics, intent);

    // 요약 생성
    const summary = this.generateSummary(fullContext, topics, intent);

    // 신뢰도 계산
    const confidence = this.calculateConfidence(topics, entities, intent);

    return {
      intent,
      requirements,
      topics,
      entities,
      sentiment,
      urgency,
      actionItems,
      followUpQuestions,
      summary,
      confidence
    };
  }

  private extractMainTopics(context: string): string[] {
    const topics: string[] = [];

    // 재개발/재건축 관련
    if (context.match(/(?:재개발|재건축|아파트|주택|건설)/g)) {
      topics.push('재개발/재건축');
    }

    // 시공사 관련
    if (context.match(/(?:시공사|건설사|삼성|GS|대우|현대)/g)) {
      topics.push('시공사');
    }

    // 분석/검토 관련
    if (context.match(/(?:분석|검토|평가|리뷰)/g)) {
      topics.push('분석/검토');
    }

    // 글쓰기/작성 관련
    if (context.match(/(?:글쓰기|작성|카드뉴스|포스팅)/g)) {
      topics.push('글쓰기/작성');
    }

    // 비교/대조 관련
    if (context.match(/(?:비교|대조|대비)/g)) {
      topics.push('비교/대조');
    }

    // 문제/이슈 관련
    if (context.match(/(?:문제|이슈|논란|갈등)/g)) {
      topics.push('문제/이슈');
    }

    return Array.from(new Set(topics));
  }

  private extractKeyEntities(context: string): string[] {
    const entities: string[] = [];

    // 회사명
    const companies = context.match(/(?:삼성물산|GS건설|대우건설|현대건설|롯데건설)/g);
    if (companies) entities.push(...companies);

    // 지역명
    const locations = context.match(/(?:개포우성|잠실우성|강남|서울|부산|대구)/g);
    if (locations) entities.push(...locations);

    // 인명
    const names = context.match(/(?:이재헌|박재우|박은진|정지혜|김철수|이영희)/g);
    if (names) entities.push(...names);

    return Array.from(new Set(entities));
  }

  private analyzeIntent(message: string, context: string): string {
    if (message.includes('분석') || message.includes('검토') || message.includes('평가')) {
      return 'analysis_request';
    }

    if (message.includes('요약') || message.includes('정리') || message.includes('핵심')) {
      return 'summary_request';
    }

    if (message.includes('글쓰기') || message.includes('작성') || message.includes('카드뉴스')) {
      return 'writing_request';
    }

    if (message.includes('비교') || message.includes('대조') || message.includes('대비')) {
      return 'comparison_request';
    }

    if (message.includes('예측') || message.includes('전망') || message.includes('미래')) {
      return 'prediction_request';
    }

    if (message.includes('해결') || message.includes('방안') || message.includes('대책')) {
      return 'solution_request';
    }

    return 'general_inquiry';
  }

  private extractRequirements(message: string, context: string): string[] {
    const requirements: string[] = [];

    if (message.includes('카드뉴스') || context.includes('카드뉴스')) {
      requirements.push('카드뉴스 형식');
    }

    if (message.includes('극우적') || message.includes('극우적 댓글')) {
      requirements.push('극우적 댓글 스타일');
    }

    if (message.includes('실명') || message.includes('실명방')) {
      requirements.push('실명방 스타일');
    }

    if (message.includes('요약') || message.includes('정리')) {
      requirements.push('요약/정리');
    }

    if (message.includes('상세') || message.includes('자세히')) {
      requirements.push('상세 분석');
    }

    if (message.includes('간단') || message.includes('간략')) {
      requirements.push('간단한 설명');
    }

    return requirements;
  }

  private analyzeSentiment(context: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positiveWords = ['좋다', '긍정적', '유리', '성공', '개선', '해결', '진전'];
    const negativeWords = ['문제', '논란', '부정적', '불리', '실패', '어려움', '갈등'];

    const positiveCount = positiveWords.filter(word => context.includes(word)).length;
    const negativeCount = negativeWords.filter(word => context.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
    return 'neutral';
  }

  private analyzeUrgency(message: string, context: string): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['긴급', '즉시', '바로', '당장', '시급'];
    const highUrgencyKeywords = ['중요', '필수', '반드시', '꼭'];
    const mediumUrgencyKeywords = ['가능하면', '시간되면', '나중에'];

    if (urgentKeywords.some(keyword => message.includes(keyword))) {
      return 'critical';
    }

    if (highUrgencyKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    }

    if (mediumUrgencyKeywords.some(keyword => message.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  private extractActionItems(message: string, context: string): string[] {
    const actionItems: string[] = [];

    if (message.includes('분석해줘') || message.includes('검토해줘')) {
      actionItems.push('상세 분석 수행');
    }

    if (message.includes('글쓰기') || message.includes('작성해줘')) {
      actionItems.push('글 작성');
    }

    if (message.includes('비교') || message.includes('대조')) {
      actionItems.push('비교 분석');
    }

    if (message.includes('요약') || message.includes('정리')) {
      actionItems.push('요약 작성');
    }

    if (message.includes('해결방안') || message.includes('대책')) {
      actionItems.push('해결방안 제시');
    }

    return actionItems;
  }

  private generateFollowUpQuestions(topics: string[], intent: string): string[] {
    const questions: string[] = [];

    if (topics.includes('시공사')) {
      questions.push('다른 시공사와의 비교 분석이 필요하신가요?');
      questions.push('시공사 선정 기준에 대해 더 자세히 알고 싶으신가요?');
    }

    if (topics.includes('재개발/재건축')) {
      questions.push('재개발 과정의 다른 단계에 대한 정보가 필요하신가요?');
      questions.push('재개발 혜택과 문제점을 비교해드릴까요?');
    }

    if (intent === 'analysis_request') {
      questions.push('더 상세한 분석이 필요하시면 말씀해주세요.');
      questions.push('다른 관점에서의 분석도 가능합니다.');
    }

    if (intent === 'writing_request') {
      questions.push('다른 형식으로도 작성 가능합니다.');
      questions.push('글의 톤과 스타일을 조정할 수 있습니다.');
    }

    return questions;
  }

  private generateSummary(context: string, topics: string[], intent: string): string {
    const topicText = topics.length > 0 ? topics.join(', ') : '일반적인';
    const intentText = this.getIntentDescription(intent);

    return `현재 대화는 ${topicText}에 대한 논의로, ${intentText} 의도를 가지고 있습니다.`;
  }

  private getIntentDescription(intent: string): string {
    const descriptions: Record<string, string> = {
      'analysis_request': '분석 요청',
      'summary_request': '요약 요청',
      'writing_request': '글쓰기 요청',
      'comparison_request': '비교 요청',
      'prediction_request': '예측 요청',
      'solution_request': '해결방안 요청',
      'general_inquiry': '일반 문의'
    };

    return descriptions[intent] || '일반 문의';
  }

  private calculateConfidence(topics: string[], entities: string[], intent: string): number {
    let confidence = 0.5; // 기본값

    // 토픽이 명확할수록 신뢰도 증가
    if (topics.length > 0) confidence += 0.2;
    if (topics.length > 2) confidence += 0.1;

    // 엔티티가 많을수록 신뢰도 증가
    if (entities.length > 0) confidence += 0.1;
    if (entities.length > 2) confidence += 0.1;

    // 의도가 명확할수록 신뢰도 증가
    if (intent !== 'general_inquiry') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateContextualResponse(analysis: ContextualAnalysis, request: ContextualRequest): string {
    let response = `전체 문맥을 파악했습니다. `;

    if (analysis.intent === 'analysis_request') {
      response += `${analysis.topics.join(', ')}에 대한 종합적인 분석을 제공하겠습니다. `;
    } else if (analysis.intent === 'summary_request') {
      response += `주요 내용을 요약하여 정리해드리겠습니다. `;
    } else if (analysis.intent === 'writing_request') {
      response += `요청하신 형식으로 글을 작성해드리겠습니다. `;
    } else if (analysis.intent === 'comparison_request') {
      response += `요청하신 비교 분석을 수행하겠습니다. `;
    } else if (analysis.intent === 'solution_request') {
      response += `해결방안을 제시해드리겠습니다. `;
    }

    if (analysis.requirements.length > 0) {
      response += `특별히 ${analysis.requirements.join(', ')} 요구사항을 반영하여 처리하겠습니다.`;
    }

    return response;
  }

  private generateSuggestions(analysis: ContextualAnalysis): string[] {
    const suggestions: string[] = [];

    if (analysis.intent === 'analysis_request') {
      suggestions.push('더 상세한 분석이 필요하시면 말씀해주세요.');
      suggestions.push('다른 관점에서의 분석도 가능합니다.');
    }

    if (analysis.topics.includes('시공사')) {
      suggestions.push('다른 시공사와의 비교 분석을 제공할 수 있습니다.');
    }

    if (analysis.requirements.includes('카드뉴스 형식')) {
      suggestions.push('카드뉴스 외에도 다른 형식으로 제작 가능합니다.');
    }

    if (analysis.urgency === 'high' || analysis.urgency === 'critical') {
      suggestions.push('긴급한 요청이므로 우선적으로 처리하겠습니다.');
    }

    return suggestions;
  }

  private generateRelatedTopics(analysis: ContextualAnalysis): string[] {
    const relatedTopics: string[] = [];

    if (analysis.topics.includes('시공사')) {
      relatedTopics.push('시공사 선정 기준', '시공사 평가 방법', '시공사 비교 분석');
    }

    if (analysis.topics.includes('재개발/재건축')) {
      relatedTopics.push('재개발 과정', '재개발 혜택', '재개발 문제점');
    }

    if (analysis.topics.includes('분석/검토')) {
      relatedTopics.push('상세 분석', '비교 분석', '예측 분석');
    }

    return relatedTopics;
  }

  private generateNextActions(analysis: ContextualAnalysis): string[] {
    const actions: string[] = [];

    actions.push(...analysis.actionItems);

    if (analysis.intent === 'analysis_request') {
      actions.push('데이터 수집 및 분석');
    }

    if (analysis.intent === 'writing_request') {
      actions.push('글 작성 및 편집');
    }

    if (analysis.intent === 'comparison_request') {
      actions.push('비교 기준 설정 및 분석');
    }

    return actions;
  }

  private createFallbackResponse(request: ContextualRequest): ContextualResponse {
    return {
      analysis: {
        intent: 'general_inquiry',
        requirements: [],
        topics: [],
        entities: [],
        sentiment: 'neutral',
        urgency: 'low',
        actionItems: [],
        followUpQuestions: [],
        summary: '일반적인 문의로 인식되었습니다.',
        confidence: 0.3
      },
      response: '메시지를 이해했습니다. 도움이 필요하시면 구체적으로 말씀해주세요.',
      suggestions: ['더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.'],
      relatedTopics: [],
      nextActions: []
    };
  }
}

export const contextualAnalysisService = new ContextualAnalysisService();
