import { ChatMessage } from './chatService';

export interface ResponseProcessingContext {
  userInput: string;
  conversationHistory: ChatMessage[];
  projectContext?: any;
  userProfile?: any;
  currentTime: Date;
  processingStage: 'initial' | 'analysis' | 'enhancement' | 'refinement' | 'final';
}

export interface ProcessingResult {
  content: string;
  confidence: number;
  reasoning: string;
  improvements: string[];
  metadata: {
    processingTime: number;
    stagesCompleted: string[];
    qualityScore: number;
  };
}

export interface ResponseEnhancement {
  type: 'clarity' | 'detail' | 'context' | 'tone' | 'structure';
  description: string;
  priority: 'high' | 'medium' | 'low';
  applied: boolean;
}

class AdvancedResponseProcessor {
  private processingStages = [
    'initial',
    'analysis', 
    'enhancement',
    'refinement',
    'final'
  ];

  private enhancementStrategies = [
    {
      type: 'clarity',
      name: '명확성 향상',
      description: '답변의 명확성과 이해도를 높입니다',
      priority: 'high'
    },
    {
      type: 'detail',
      name: '상세 정보 추가',
      description: '관련된 상세 정보를 추가합니다',
      priority: 'medium'
    },
    {
      type: 'context',
      name: '맥락 정보 통합',
      description: '대화 맥락과 프로젝트 정보를 통합합니다',
      priority: 'high'
    },
    {
      type: 'tone',
      name: '톤 조정',
      description: '사용자 선호도에 맞는 톤으로 조정합니다',
      priority: 'medium'
    },
    {
      type: 'structure',
      name: '구조 개선',
      description: '답변의 구조와 가독성을 개선합니다',
      priority: 'low'
    }
  ];

  /**
   * 메인 응답 처리 함수 - 여러 단계의 재가공 과정을 거침
   */
  async processResponse(
    userInput: string,
    conversationHistory: ChatMessage[],
    projectContext?: any
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const context: ResponseProcessingContext = {
      userInput,
      conversationHistory,
      projectContext,
      currentTime: new Date(),
      processingStage: 'initial'
    };

    console.log('🚀 고급 응답 처리 시작:', userInput);

    // 1단계: 초기 분석
    const initialAnalysis = await this.performInitialAnalysis(context);
    console.log('📊 1단계 - 초기 분석 완료');

    // 2단계: 맥락 분석 및 강화
    const enhancedContext = await this.enhanceContext(context, initialAnalysis);
    console.log('🔍 2단계 - 맥락 분석 완료');

    // 3단계: 응답 생성 및 개선
    const generatedResponse = await this.generateEnhancedResponse(enhancedContext);
    console.log('✍️ 3단계 - 응답 생성 완료');

    // 4단계: 품질 검증 및 정제
    const refinedResponse = await this.refineResponse(generatedResponse, context);
    console.log('✨ 4단계 - 응답 정제 완료');

    // 5단계: 최종 검증 및 완성
    const finalResponse = await this.finalizeResponse(refinedResponse, context);
    console.log('🎯 5단계 - 최종 완성 완료');

    const processingTime = Date.now() - startTime;

    return {
      content: finalResponse.content,
      confidence: finalResponse.confidence,
      reasoning: finalResponse.reasoning,
      improvements: finalResponse.improvements,
      metadata: {
        processingTime,
        stagesCompleted: this.processingStages,
        qualityScore: finalResponse.qualityScore
      }
    };
  }

  /**
   * 1단계: 초기 분석
   */
  private async performInitialAnalysis(context: ResponseProcessingContext) {
    const analysis = {
      intent: this.analyzeIntent(context.userInput),
      sentiment: this.analyzeSentiment(context.userInput),
      complexity: this.analyzeComplexity(context.userInput),
      keywords: this.extractKeywords(context.userInput),
      topics: this.identifyTopics(context.userInput),
      urgency: this.assessUrgency(context.userInput),
      userProfile: this.analyzeUserProfile(context.conversationHistory)
    };

    console.log('📊 초기 분석 결과:', analysis);
    return analysis;
  }

  /**
   * 2단계: 맥락 분석 및 강화
   */
  private async enhanceContext(context: ResponseProcessingContext, analysis: any) {
    const enhancedContext = {
      ...context,
      enhancedAnalysis: analysis,
      conversationPatterns: this.analyzeConversationPatterns(context.conversationHistory),
      projectRelevance: this.assessProjectRelevance(context.userInput, context.projectContext),
      temporalContext: this.analyzeTemporalContext(context),
      userPreferences: this.extractUserPreferences(context.conversationHistory)
    };

    console.log('🔍 맥락 분석 결과:', enhancedContext);
    return enhancedContext;
  }

  /**
   * 3단계: 응답 생성 및 개선
   */
  private async generateEnhancedResponse(enhancedContext: any) {
    // 기본 응답 생성
    let response = await this.generateBaseResponse(enhancedContext);
    
    // 여러 단계의 개선 적용
    const improvements = [];
    
    for (const strategy of this.enhancementStrategies) {
      const beforeImprovement = response.content;
      response = await this.applyEnhancementStrategy(response, strategy, enhancedContext);
      
      if (response.content !== beforeImprovement) {
        improvements.push(`${strategy.name}: ${strategy.description}`);
      }
    }

    console.log('✍️ 응답 생성 및 개선 완료, 적용된 개선사항:', improvements);
    return { ...response, improvements };
  }

  /**
   * 4단계: 품질 검증 및 정제
   */
  private async refineResponse(response: any, context: ResponseProcessingContext) {
    const qualityChecks = [
      this.checkClarity(response.content),
      this.checkRelevance(response.content, context.userInput),
      this.checkCompleteness(response.content),
      this.checkConsistency(response.content, context.conversationHistory),
      this.checkTone(response.content, context)
    ];

    const qualityScore = qualityChecks.reduce((sum, check) => sum + check.score, 0) / qualityChecks.length;
    
    // 품질이 낮은 경우 추가 정제
    if (qualityScore < 0.8) {
      response = await this.applyQualityImprovements(response, qualityChecks);
    }

    console.log('✨ 품질 검증 완료, 점수:', qualityScore);
    return { ...response, qualityScore };
  }

  /**
   * 5단계: 최종 검증 및 완성
   */
  private async finalizeResponse(response: any, context: ResponseProcessingContext) {
    // 최종 검증
    const finalValidation = {
      grammar: this.validateGrammar(response.content),
      coherence: this.validateCoherence(response.content),
      appropriateness: this.validateAppropriateness(response.content, context),
      completeness: this.validateCompleteness(response.content, context.userInput)
    };

    // 필요시 최종 조정
    if (Object.values(finalValidation).some(v => !v.valid)) {
      response = await this.applyFinalAdjustments(response, finalValidation);
    }

    console.log('🎯 최종 검증 완료');
    return response;
  }

  // 분석 메서드들
  private analyzeIntent(input: string) {
    const intents = {
      question: /(어떻게|무엇|언제|어디서|왜|어떤|가능한가|알려주세요|궁금합니다)/g,
      request: /(해주세요|부탁합니다|요청합니다|필요합니다)/g,
      statement: /(입니다|입니다|입니다|입니다)/g,
      command: /(해라|하라|해|하세요)/g
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(input)) {
        return intent;
      }
    }
    return 'general';
  }

  private analyzeSentiment(input: string) {
    const positiveWords = ['좋다', '감사', '훌륭', '완벽', '최고', '만족'];
    const negativeWords = ['나쁘', '실망', '문제', '어려움', '불만', '실패'];
    
    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private analyzeComplexity(input: string) {
    const wordCount = input.split(' ').length;
    const hasComplexTerms = /(분석|전략|시스템|프로세스|최적화|통합)/g.test(input);
    
    if (wordCount > 20 || hasComplexTerms) return 'complex';
    if (wordCount > 10) return 'moderate';
    return 'simple';
  }

  private extractKeywords(input: string) {
    const stopWords = ['이', '가', '을', '를', '의', '에', '에서', '로', '으로', '와', '과', '도', '만', '은', '는'];
    const words = input.split(/\s+/).filter(word => 
      word.length > 1 && !stopWords.includes(word)
    );
    
    return words.slice(0, 5); // 상위 5개 키워드
  }

  private identifyTopics(input: string) {
    const topicPatterns = {
      project: /(프로젝트|개발|구현|설계)/g,
      analysis: /(분석|검토|평가|조사)/g,
      technical: /(기술|코드|알고리즘|시스템)/g,
      business: /(비즈니스|전략|마케팅|운영)/g
    };

    const topics = [];
    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(input)) {
        topics.push(topic);
      }
    }
    return topics;
  }

  private assessUrgency(input: string) {
    const urgentWords = ['급하다', '바로', '즉시', '당장', '긴급', '시급'];
    return urgentWords.some(word => input.includes(word)) ? 'high' : 'normal';
  }

  private analyzeUserProfile(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) {
      return {
        avgMessageLength: 0,
        technicalLevel: 'normal',
        interactionStyle: 'concise'
      };
    }
    
    const userMessages = history.filter(msg => msg.isUser);
    if (userMessages.length === 0) {
      return {
        avgMessageLength: 0,
        technicalLevel: 'normal',
        interactionStyle: 'concise'
      };
    }
    
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
    const technicalTerms = userMessages.filter(msg => /(API|코드|함수|클래스|데이터베이스)/g.test(msg.content)).length;
    
    return {
      avgMessageLength: avgLength,
      technicalLevel: technicalTerms > userMessages.length * 0.3 ? 'high' : 'normal',
      interactionStyle: avgLength > 50 ? 'detailed' : 'concise'
    };
  }

  private analyzeConversationPatterns(history: ChatMessage[]) {
    if (!history || !Array.isArray(history)) {
      return {
        questionFrequency: 0,
        followUpQuestions: [],
        topicConsistency: 0.5,
        responseTime: 0
      };
    }
    
    const patterns = {
      questionFrequency: history.filter(msg => msg.isUser && /[?？]/.test(msg.content)).length,
      followUpQuestions: this.countFollowUpQuestions(history),
      topicConsistency: this.calculateTopicConsistency(history),
      responseTime: this.analyzeResponseTime(history)
    };
    
    return patterns;
  }

  private assessProjectRelevance(input: string, projectContext?: any) {
    if (!projectContext) return 0.5;
    
    const projectKeywords = ['개포우성', '재건축', '프로젝트', '분석'];
    const relevanceScore = projectKeywords.filter(keyword => 
      input.includes(keyword)
    ).length / projectKeywords.length;
    
    return relevanceScore;
  }

  private analyzeTemporalContext(context: ResponseProcessingContext) {
    if (!context.currentTime) {
      const now = new Date();
      return {
        isBusinessHours: true,
        isWeekend: false,
        timeOfDay: 'afternoon'
      };
    }
    
    const hour = context.currentTime.getHours();
    const isBusinessHours = hour >= 9 && hour <= 18;
    const isWeekend = context.currentTime.getDay() === 0 || context.currentTime.getDay() === 6;
    
    return {
      isBusinessHours,
      isWeekend,
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    };
  }

  private extractUserPreferences(history: ChatMessage[]) {
    if (!history || !Array.isArray(history)) {
      return {
        responseLength: 'medium',
        detailLevel: 'normal',
        tone: 'professional',
        format: 'structured'
      };
    }
    
    const preferences = {
      responseLength: this.analyzePreferredResponseLength(history),
      detailLevel: this.analyzePreferredDetailLevel(history),
      tone: this.analyzePreferredTone(history),
      format: this.analyzePreferredFormat(history)
    };
    
    return preferences;
  }

  // 응답 생성 및 개선 메서드들
  private async generateBaseResponse(enhancedContext: any) {
    // 기본 응답 생성 로직
    const { userInput, enhancedAnalysis } = enhancedContext;
    
    let baseResponse = `안녕하세요! ${userInput}에 대한 답변을 드리겠습니다.`;
    
    // 분석 결과에 따른 기본 응답 조정
    if (enhancedAnalysis && enhancedAnalysis.intent === 'question') {
      baseResponse = `질문해주신 "${userInput}"에 대해 답변드리겠습니다.`;
    } else if (enhancedAnalysis && enhancedAnalysis.intent === 'request') {
      baseResponse = `요청하신 "${userInput}"에 대해 도움을 드리겠습니다.`;
    }
    
    return {
      content: baseResponse,
      confidence: 0.7,
      reasoning: '기본 응답 생성'
    };
  }

  private async applyEnhancementStrategy(response: any, strategy: any, context: any) {
    switch (strategy.type) {
      case 'clarity':
        return this.enhanceClarity(response, context);
      case 'detail':
        return this.enhanceDetail(response, context);
      case 'context':
        return this.enhanceContext(response, context);
      case 'tone':
        return this.enhanceTone(response, context);
      case 'structure':
        return this.enhanceStructure(response, context);
      default:
        return response;
    }
  }

  private enhanceClarity(response: any, context: any) {
    let content = response.content;
    
    // 복잡한 문장을 단순화
    content = content.replace(/[가-힣]+[은는이가] [가-힣]+[을를] [가-힣]+[하겠습니다]/g, 
      (match: string) => match.split(' ').slice(0, 3).join(' ') + '하겠습니다.');
    
    // 명확한 표현으로 변경
    content = content.replace(/어떤/, '구체적으로');
    content = content.replace(/뭔가/, '구체적인 내용');
    
    return { ...response, content };
  }

  private enhanceDetail(response: any, context: any) {
    const { enhancedAnalysis, projectRelevance } = context;
    
    if (projectRelevance > 0.5) {
      response.content += `\n\n프로젝트 관련 추가 정보:\n- 현재 프로젝트 상태: 활성화\n- 관련 파일 수: ${context.projectContext?.files?.length || 0}개\n- 최근 활동: ${context.projectContext?.lastActivity || '없음'}`;
    }
    
    if (enhancedAnalysis && enhancedAnalysis.topics && Array.isArray(enhancedAnalysis.topics) && enhancedAnalysis.topics.includes('analysis')) {
      response.content += `\n\n분석 관련 상세 정보를 제공해드릴 수 있습니다.`;
    }
    
    return response;
  }

  private enhanceResponseContext(response: any, context: any) {
    const { conversationPatterns, temporalContext } = context;
    
    // 대화 맥락 반영
    if (conversationPatterns.questionFrequency > 3) {
      response.content = `이전 질문들과 연관하여, ${response.content}`;
    }
    
    // 시간적 맥락 반영
    if (temporalContext.isBusinessHours) {
      response.content += `\n\n업무 시간 중이니 빠른 응답을 드리겠습니다.`;
    }
    
    return response;
  }

  private enhanceTone(response: any, context: any) {
    const { userProfile, enhancedAnalysis } = context;
    
    if (userProfile && userProfile.technicalLevel === 'high') {
      response.content = response.content.replace(/입니다/g, '입니다.');
    } else {
      response.content = response.content.replace(/입니다/g, '입니다 😊');
    }
    
    if (enhancedAnalysis && enhancedAnalysis.sentiment === 'negative') {
      response.content = `이해했습니다. ${response.content} 더 자세히 도움을 드리겠습니다.`;
    }
    
    return response;
  }

  private enhanceStructure(response: any, context: any) {
    const { enhancedAnalysis } = context;
    
    if (enhancedAnalysis && enhancedAnalysis.complexity === 'complex') {
      response.content = `📋 요약\n${response.content}\n\n🔍 상세 분석\n추가적인 분석이 필요하시면 말씀해 주세요.`;
    }
    
    return response;
  }

  // 품질 검증 메서드들
  private checkClarity(content: string) {
    const longSentences = content.split('.').filter(s => s.length > 100).length;
    const clarityScore = Math.max(0, 1 - (longSentences * 0.2));
    
    return { score: clarityScore, issues: longSentences > 0 ? ['긴 문장이 많습니다'] : [] };
  }

  private checkRelevance(content: string, userInput: string) {
    const userKeywords = this.extractKeywords(userInput);
    const contentKeywords = this.extractKeywords(content);
    const overlap = userKeywords.filter(k => contentKeywords.includes(k)).length;
    const relevanceScore = overlap / Math.max(userKeywords.length, 1);
    
    return { score: relevanceScore, issues: relevanceScore < 0.5 ? ['관련성이 낮습니다'] : [] };
  }

  private checkCompleteness(content: string) {
    const hasAnswer = content.length > 50;
    const hasStructure = /[1-9]\.|•|✓/.test(content);
    const completenessScore = (hasAnswer ? 0.6 : 0) + (hasStructure ? 0.4 : 0);
    
    return { score: completenessScore, issues: !hasAnswer ? ['답변이 너무 짧습니다'] : [] };
  }

  private checkConsistency(content: string, history: ChatMessage[]) {
    const recentResponses = history.filter(msg => !msg.isUser).slice(-3);
    const avgLength = recentResponses.reduce((sum, msg) => sum + msg.content.length, 0) / recentResponses.length;
    const currentLength = content.length;
    const consistencyScore = Math.abs(currentLength - avgLength) < 100 ? 1 : 0.5;
    
    return { score: consistencyScore, issues: consistencyScore < 1 ? ['응답 길이가 일관되지 않습니다'] : [] };
  }

  private checkTone(content: string, context: ResponseProcessingContext) {
    const formalTone = /입니다|습니다|합니다/g.test(content);
    const informalTone = /야|어|해/g.test(content);
    const toneScore = formalTone && !informalTone ? 1 : 0.7;
    
    return { score: toneScore, issues: toneScore < 1 ? ['톤이 일관되지 않습니다'] : [] };
  }

  // 유틸리티 메서드들
  private countFollowUpQuestions(history: ChatMessage[]) {
    if (!history || !Array.isArray(history)) return [];
    const followUpQuestions: string[] = [];
    for (let i = 1; i < history.length; i++) {
      if (history[i].isUser && history[i-1].isUser && /[?？]/.test(history[i].content)) {
        followUpQuestions.push(history[i].content);
      }
    }
    return followUpQuestions;
  }

  private calculateTopicConsistency(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) return 0.5;
    const userMessages = history.filter(msg => msg.isUser);
    if (userMessages.length === 0) return 0.5;
    const topics = userMessages.map(msg => this.identifyTopics(msg.content));
    
    let consistency = 0;
    for (let i = 1; i < topics.length; i++) {
      const overlap = topics[i].filter(t => topics[i-1].includes(t)).length;
      consistency += overlap / Math.max(topics[i].length, 1);
    }
    
    return consistency / Math.max(topics.length - 1, 1);
  }

  private analyzeResponseTime(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length < 2) return 0;
    const responseTimes = [];
    for (let i = 1; i < history.length; i++) {
      if (!history[i].isUser && history[i-1].isUser) {
        const timeDiff = new Date(history[i].timestamp).getTime() - new Date(history[i-1].timestamp).getTime();
        responseTimes.push(timeDiff);
      }
    }
    
    return responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
  }

  private analyzePreferredResponseLength(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) return 'medium';
    const aiResponses = history.filter(msg => !msg.isUser);
    if (aiResponses.length === 0) return 'medium';
    const avgLength = aiResponses.reduce((sum, msg) => sum + msg.content.length, 0) / aiResponses.length;
    
    if (avgLength > 300) return 'long';
    if (avgLength > 100) return 'medium';
    return 'short';
  }

  private analyzePreferredDetailLevel(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) return 'normal';
    const detailedResponses = history.filter(msg => !msg.isUser && msg.content.includes('상세'));
    return detailedResponses.length > history.length * 0.3 ? 'high' : 'normal';
  }

  private analyzePreferredTone(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) return 'professional';
    const formalResponses = history.filter(msg => !msg.isUser && /입니다|습니다/g.test(msg.content));
    return formalResponses.length > history.length * 0.5 ? 'formal' : 'casual';
  }

  private analyzePreferredFormat(history: ChatMessage[]) {
    if (!history || !Array.isArray(history) || history.length === 0) return 'structured';
    const structuredResponses = history.filter(msg => !msg.isUser && /[1-9]\.|•|✓/g.test(msg.content));
    return structuredResponses.length > history.length * 0.3 ? 'structured' : 'narrative';
  }

  // 품질 개선 메서드들
  private async applyQualityImprovements(response: any, qualityChecks: any[]) {
    let improvedResponse = { ...response };
    
    for (const check of qualityChecks) {
      if (check.score < 0.7) {
        improvedResponse = await this.improveQuality(improvedResponse, check);
      }
    }
    
    return improvedResponse;
  }

  private async improveQuality(response: any, qualityCheck: any) {
    // 품질 문제에 따른 개선 적용
    if (qualityCheck.issues.includes('긴 문장이 많습니다')) {
      response.content = this.simplifySentences(response.content);
    }
    
    if (qualityCheck.issues.includes('관련성이 낮습니다')) {
      response.content = this.improveRelevance(response.content);
    }
    
    return response;
  }

  private simplifySentences(content: string) {
    return content.split('.').map(sentence => {
      if (sentence.length > 100) {
        return sentence.split(' ').slice(0, 15).join(' ') + '...';
      }
      return sentence;
    }).join('.');
  }

  private improveRelevance(content: string) {
    return content + '\n\n더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.';
  }

  // 최종 검증 메서드들
  private validateGrammar(content: string) {
    const hasProperEnding = /[입니다|습니다|합니다|니다]$/.test(content);
    return { valid: hasProperEnding, issues: hasProperEnding ? [] : ['문법 오류가 있습니다'] };
  }

  private validateCoherence(content: string) {
    const sentences = content.split('.');
    const coherenceScore = sentences.length > 1 ? 0.8 : 1.0;
    return { valid: coherenceScore > 0.7, issues: coherenceScore <= 0.7 ? ['일관성이 부족합니다'] : [] };
  }

  private validateAppropriateness(content: string, context: ResponseProcessingContext) {
    const hasInappropriateContent = /(비속어|욕설)/g.test(content);
    return { valid: !hasInappropriateContent, issues: hasInappropriateContent ? ['부적절한 내용이 포함되어 있습니다'] : [] };
  }

  private validateCompleteness(content: string, userInput: string) {
    const hasAnswer = content.length > userInput.length * 0.5;
    return { valid: hasAnswer, issues: hasAnswer ? [] : ['답변이 불완전합니다'] };
  }

  // 최종 조정 메서드들
  private async applyFinalAdjustments(response: any, finalValidation: any) {
    let adjustedResponse = { ...response };
    
    for (const [aspect, validation] of Object.entries(finalValidation)) {
      const validationResult = validation as { valid: boolean; issues?: string[] };
      if (!validationResult.valid) {
        adjustedResponse = await this.adjustAspect(adjustedResponse, aspect, validationResult);
      }
    }
    
    return adjustedResponse;
  }

  private async adjustAspect(response: any, aspect: string, validation: any) {
    switch (aspect) {
      case 'grammar':
        response.content = this.fixGrammar(response.content);
        break;
      case 'coherence':
        response.content = this.improveCoherence(response.content);
        break;
      case 'appropriateness':
        response.content = this.makeAppropriate(response.content);
        break;
      case 'completeness':
        response.content = this.makeComplete(response.content);
        break;
    }
    
    return response;
  }

  private fixGrammar(content: string) {
    return content.replace(/[가-힣]+[은는이가] [가-힣]+[을를] [가-힣]+[하겠습니다]/g, 
      (match: string) => match + '.');
  }

  private improveCoherence(content: string) {
    return content + '\n\n이 답변이 도움이 되었기를 바랍니다.';
  }

  private makeAppropriate(content: string) {
    return content.replace(/[비속어|욕설]/g, '');
  }

  private makeComplete(content: string) {
    return content + '\n\n추가 질문이 있으시면 언제든 말씀해 주세요.';
  }
}

export const advancedResponseProcessor = new AdvancedResponseProcessor();
export default advancedResponseProcessor;
