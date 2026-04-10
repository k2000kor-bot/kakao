import AdvancedMessageProcessor, { ProcessedMessage, MessageContext } from './advancedMessageProcessor';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface ResponseContext {
  userMessage: string;
  processedMessage: ProcessedMessage;
  uploadedFiles: unknown[];
  conversationHistory: unknown[];
  projectContext: Record<string, unknown>;
  userPreferences: Record<string, unknown>;
}

/** Result of analyzeContext() */
export interface ContextAnalysis {
  fileContext: Record<string, unknown>;
  conversationContext: Record<string, unknown>;
  projectContext: Record<string, unknown>;
  userIntent: Record<string, unknown>;
  temporalContext: Record<string, unknown>;
  topicRelevance: Record<string, unknown>;
}

export interface MultiRequirementResponse {
  mainResponse: string;
  detailedResponses: RequirementResponse[];
  summary: string;
  nextActions: string[];
  relatedTopics: string[];
  visualizations: VisualizationSuggestion[];
}

export interface RequirementResponse {
  requirement: string;
  response: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  dependencies: string[];
  alternatives: string[];
}

export interface VisualizationSuggestion {
  type: 'chart' | 'table' | 'diagram' | 'timeline' | 'mindmap';
  title: string;
  description: string;
  data: Record<string, unknown>;
}

class AdvancedResponseGenerator {
  private static instance: AdvancedResponseGenerator;
  private messageProcessor = AdvancedMessageProcessor.getInstance();

  private constructor() {}

  static getInstance(): AdvancedResponseGenerator {
    if (!AdvancedResponseGenerator.instance) {
      AdvancedResponseGenerator.instance = new AdvancedResponseGenerator();
    }
    return AdvancedResponseGenerator.instance;
  }

  // 종합적인 응답 생성
  async generateComprehensiveResponse(context: ResponseContext): Promise<MultiRequirementResponse> {
    const { userMessage, processedMessage, uploadedFiles: _uploadedFiles, conversationHistory: _conversationHistory, projectContext: _projectContext } = context;

    // 1. 요구사항 추출 및 분류
    const requirements = this.extractRequirements(userMessage);
    
    // 2. 문맥 분석
    const contextAnalysis = this.analyzeContext(context);
    
    // 3. 각 요구사항별 상세 응답 생성
    const detailedResponses = await this.generateDetailedResponses(requirements, contextAnalysis);
    
    // 4. 메인 응답 생성
    const mainResponse = await this.generateMainResponse(processedMessage, detailedResponses, contextAnalysis);
    
    // 5. 요약 생성
    const summary = this.generateSummary(detailedResponses, contextAnalysis);
    
    // 6. 다음 액션 제안
    const nextActions = this.suggestNextActions(detailedResponses, contextAnalysis);
    
    // 7. 관련 주제 추천
    const relatedTopics = this.suggestRelatedTopics(requirements, contextAnalysis);
    
    // 8. 시각화 제안
    const visualizations = this.suggestVisualizations(detailedResponses, contextAnalysis);

    return {
      mainResponse,
      detailedResponses,
      summary,
      nextActions,
      relatedTopics,
      visualizations
    };
  }

  // 요구사항 추출
  private extractRequirements(message: string): string[] {
    const requirements: string[] = [];
    
    // 다양한 요구사항 패턴 매칭
    const patterns = [
      // 직접적인 요청
      /[가-힣a-zA-Z\s]+(?:해주세요|해주시면|부탁드립니다|요청합니다|필요합니다|원합니다)/g,
      // 질문 형태
      /[가-힣a-zA-Z\s]+(?:인가요|입니까|무엇인가요|어떻게|왜|언제|어디서)/g,
      // 설명 요청
      /[가-힣a-zA-Z\s]+(?:설명|분석|검토|평가|비교|정리|요약|제안)/g,
      // 구체적인 작업 요청
      /(?:작성|생성|만들어|구현|개발|설계|계획|수립)/g,
      // 조건부 요청
      /(?:만약|만일|~라면|~한다면|~할 때)/g
    ];

    patterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        requirements.push(...matches);
      }
    });

    // 중복 제거 및 정리
    return Array.from(new Set(requirements))
      .map((req) => coerceTrimmedString(req, ''))
      .filter((req) => req.length > 0);
  }

  // 문맥 분석
  private analyzeContext(context: ResponseContext): ContextAnalysis {
    const { userMessage, uploadedFiles, conversationHistory, projectContext } = context;
    
    const analysis = {
      // 파일 분석
      fileContext: this.analyzeFileContext(uploadedFiles),
      
      // 대화 히스토리 분석
      conversationContext: this.analyzeConversationContext(conversationHistory),
      
      // 프로젝트 컨텍스트 분석
      projectContext: this.analyzeProjectContext(projectContext),
      
      // 사용자 의도 분석
      userIntent: this.analyzeUserIntent(userMessage),
      
      // 시간적 컨텍스트
      temporalContext: this.analyzeTemporalContext(conversationHistory as Record<string, unknown>[]),
      
      // 주제 연관성
      topicRelevance: this.analyzeTopicRelevance(userMessage, conversationHistory as Record<string, unknown>[])
    };

    return analysis;
  }

  // 파일 컨텍스트 분석
  private analyzeFileContext(files: unknown[]): Record<string, unknown> {
    if (!files || files.length === 0) return {};

    const fileTypes = files.map((file: unknown) => (file as Record<string, unknown>).type ?? 'unknown');
    const fileTopics = (files.flatMap((file: unknown) => ((file as Record<string, unknown>).topics as unknown[]) ?? []) as string[]);
    const fileKeywords = (files.flatMap((file: unknown) => ((file as Record<string, unknown>).keywords as unknown[]) ?? []) as string[]);

    return {
      fileCount: files.length,
      fileTypes: Array.from(new Set(fileTypes)),
      commonTopics: this.findCommonElements(fileTopics),
      commonKeywords: this.findCommonElements(fileKeywords),
      hasImages: fileTypes.some((type: unknown) => String(type).includes('image')),
      hasDocuments: fileTypes.some((type: unknown) => String(type).includes('document')),
      hasData: fileTypes.some((type: unknown) => String(type).includes('spreadsheet'))
    };
  }

  // 대화 히스토리 분석
  private analyzeConversationContext(history: unknown[]): Record<string, unknown> {
    if (!history || history.length === 0) return {};

    const recentMessages = history.slice(-5); // 최근 5개 메시지
    const allTopics = (recentMessages.flatMap((msg: unknown) => ((msg as Record<string, unknown>).topics as unknown[]) ?? []) as string[]);
    const allKeywords = (recentMessages.flatMap((msg: unknown) => ((msg as Record<string, unknown>).keywords as unknown[]) ?? []) as string[]);

    return {
      messageCount: history.length,
      recentTopics: this.findCommonElements(allTopics),
      recentKeywords: this.findCommonElements(allKeywords),
      conversationFlow: this.analyzeConversationFlow(recentMessages as Record<string, unknown>[]),
      userPreferences: this.extractUserPreferences(history as Record<string, unknown>[])
    };
  }

  // 프로젝트 컨텍스트 분석
  private analyzeProjectContext(projectContext: Record<string, unknown>): Record<string, unknown> {
    if (!projectContext) return {};

    return {
      projectType: projectContext.type ?? 'general',
      projectStage: projectContext.stage ?? 'planning',
      projectGoals: projectContext.goals ?? [],
      projectConstraints: projectContext.constraints ?? [],
      projectTimeline: projectContext.timeline ?? 'flexible'
    };
  }

  // 사용자 의도 분석
  private analyzeUserIntent(message: string): Record<string, unknown> {
    const intentPatterns = {
      information: /알려주세요|알고싶습니다|무엇인가요|어떤가요/g,
      analysis: /분석해주세요|검토해주세요|평가해주세요/g,
      creation: /만들어주세요|작성해주세요|생성해주세요/g,
      comparison: /비교해주세요|대조해주세요|차이점/g,
      explanation: /설명해주세요|이해하고싶습니다|왜/g,
      suggestion: /제안해주세요|추천해주세요|방법/g,
      problem: /문제|해결|어려움|고민/g
    };

    const detectedIntents: string[] = [];
    Object.entries(intentPatterns).forEach(([intent, pattern]) => {
      if (pattern.test(message)) {
        detectedIntents.push(intent);
      }
    });

    return {
      primaryIntent: detectedIntents[0] || 'general',
      allIntents: detectedIntents,
      urgency: this.detectUrgency(message),
      complexity: this.detectComplexity(message)
    };
  }

  // 시간적 컨텍스트 분석
  private analyzeTemporalContext(history: Record<string, unknown>[]): Record<string, unknown> {
    if (!history || history.length === 0) return {};

    const recentTime = new Date();
    const messageTimestamps = history.map(msg => new Date((msg as Record<string, unknown>).timestamp as number || Date.now()));
    const timeGaps = messageTimestamps.map((timestamp, index) => {
      if (index === 0) return 0;
      return (timestamp.getTime() - messageTimestamps[index - 1].getTime()) / (1000 * 60); // 분 단위
    });

    return {
      averageResponseTime: timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length,
      conversationDuration: (recentTime.getTime() - messageTimestamps[0].getTime()) / (1000 * 60 * 60), // 시간 단위
      isActiveSession: timeGaps[timeGaps.length - 1] < 30, // 30분 이내면 활성 세션
      sessionIntensity: this.calculateSessionIntensity(timeGaps)
    };
  }

  // 주제 연관성 분석
  private analyzeTopicRelevance(message: string, history: Record<string, unknown>[]): Record<string, unknown> {
    const messageKeywords = message.match(/[가-힣a-zA-Z]+/g) || [];
    const historyKeywords = history.flatMap(msg => ((msg as Record<string, unknown>).keywords as unknown[]) ?? []);
    
    const commonKeywords = messageKeywords.filter(keyword => 
      historyKeywords.some((histKeyword: unknown) => 
        String(histKeyword).toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(String(histKeyword).toLowerCase())
      )
    );

    return {
      relevanceScore: commonKeywords.length / Math.max(messageKeywords.length, 1),
      commonTopics: commonKeywords,
      topicContinuity: this.calculateTopicContinuity(history),
      newTopics: messageKeywords.filter(keyword => !historyKeywords.includes(keyword))
    };
  }

  // 상세 응답 생성
  private async generateDetailedResponses(requirements: string[], contextAnalysis: ContextAnalysis): Promise<RequirementResponse[]> {
    const responses: RequirementResponse[] = [];

    for (const requirement of requirements) {
      const response = await this.generateSingleRequirementResponse(requirement, contextAnalysis);
      responses.push(response);
    }

    // 우선순위별 정렬
    return responses.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 단일 요구사항 응답 생성
  private async generateSingleRequirementResponse(requirement: string, contextAnalysis: ContextAnalysis): Promise<RequirementResponse> {
    // 요구사항 타입 분석
    const requirementType = this.analyzeRequirementType(requirement);
    
    // 복잡도 분석
    const complexity = this.analyzeRequirementComplexity(requirement, contextAnalysis);
    
    // 우선순위 분석
    const priority = this.analyzeRequirementPriority(requirement, contextAnalysis);
    
    // 예상 시간 추정
    const estimatedTime = this.estimateRequirementTime(requirement, complexity, requirementType);
    
    // 의존성 분석
    const dependencies = this.analyzeRequirementDependencies(requirement, contextAnalysis);
    
    // 대안 분석
    const alternatives = this.analyzeRequirementAlternatives(requirement, contextAnalysis);
    
    // 응답 생성
    const response = await this.generateRequirementResponse(requirement, requirementType, complexity, contextAnalysis);

    return {
      requirement,
      response,
      priority,
      complexity,
      estimatedTime,
      dependencies,
      alternatives
    };
  }

  // 메인 응답 생성
  private async generateMainResponse(processedMessage: ProcessedMessage, detailedResponses: RequirementResponse[], contextAnalysis: ContextAnalysis): Promise<string> {
    const { context } = processedMessage;
    const ctx = context as unknown as Record<string, unknown>;
    let mainResponse = `안녕하세요! 귀하의 요청을 종합적으로 분석한 결과를 말씀드리겠습니다.\n\n`;

    // 요약 정보
    mainResponse += `📋 **요청 분석 결과**\n`;
    mainResponse += `• 요청 유형: ${ctx.type ?? 'unknown'}\n`;
    mainResponse += `• 복잡도: ${ctx.complexity ?? 'unknown'}\n`;
    mainResponse += `• 식별된 요구사항: ${detailedResponses.length}개\n`;
    mainResponse += `• 예상 소요 시간: ${detailedResponses.reduce((sum, resp) => sum + resp.estimatedTime, 0)}분\n\n`;

    // 주요 요구사항들
    const highPriorityResponses = detailedResponses.filter(resp => resp.priority === 'high' || resp.priority === 'urgent');
    if (highPriorityResponses.length > 0) {
      mainResponse += `🎯 **주요 요구사항**\n`;
      highPriorityResponses.forEach((resp, index) => {
        mainResponse += `${index + 1}. ${resp.requirement}\n`;
      });
      mainResponse += `\n`;
    }

    // 전체적인 접근 방법
    mainResponse += `🔍 **전체적인 접근 방법**\n`;
    mainResponse += this.generateOverallApproach(context, detailedResponses, contextAnalysis);

    return mainResponse;
  }

  // 요약 생성
  private generateSummary(detailedResponses: RequirementResponse[], _contextAnalysis: ContextAnalysis): string {
    const totalRequirements = detailedResponses.length;
    const totalTime = detailedResponses.reduce((sum, resp) => sum + resp.estimatedTime, 0);
    const highPriorityCount = detailedResponses.filter(resp => resp.priority === 'high' || resp.priority === 'urgent').length;

    return `총 ${totalRequirements}개의 요구사항이 식별되었으며, 예상 소요 시간은 ${totalTime}분입니다. 
    이 중 ${highPriorityCount}개는 높은 우선순위로 분류되었습니다. 
    모든 요구사항에 대해 상세한 답변과 함께 실용적인 제안을 제공했습니다.`;
  }

  // 다음 액션 제안
  private suggestNextActions(detailedResponses: RequirementResponse[], _contextAnalysis: ContextAnalysis): string[] {
    const actions: string[] = [];

    // 우선순위별 액션
    const urgentResponses = detailedResponses.filter(resp => resp.priority === 'urgent');
    if (urgentResponses.length > 0) {
      actions.push('긴급 요구사항을 즉시 처리하세요');
      actions.push('중간 결과를 빠르게 확인하여 방향을 조정하세요');
    }

    // 복잡도별 액션
    const expertResponses = detailedResponses.filter(resp => resp.complexity === 'expert');
    if (expertResponses.length > 0) {
      actions.push('전문가 자문을 구하여 품질을 보장하세요');
      actions.push('최신 연구 결과를 지속적으로 모니터링하세요');
    }

    // 일반적인 액션
    actions.push('각 요구사항별로 단계별 실행 계획을 수립하세요');
    actions.push('정기적으로 진행 상황을 점검하고 피드백을 반영하세요');

    return actions;
  }

  // 관련 주제 추천
  private suggestRelatedTopics(requirements: string[], contextAnalysis: ContextAnalysis): string[] {
    const topics: string[] = [];
    
    // 요구사항에서 추출한 키워드 기반
    requirements.forEach(req => {
      const keywords = req.match(/[가-힣a-zA-Z]+/g) || [];
      topics.push(...keywords);
    });

    // 컨텍스트 기반 추가 주제
    if (contextAnalysis.fileContext.hasImages) {
      topics.push('이미지 분석', 'OCR 기술', '시각적 데이터 처리');
    }
    
    if (contextAnalysis.fileContext.hasDocuments) {
      topics.push('문서 처리', '텍스트 분석', '자연어 처리');
    }

    // 중복 제거 및 정리
    return Array.from(new Set(topics));
  }

  // 시각화 제안
  private suggestVisualizations(detailedResponses: RequirementResponse[], _contextAnalysis: ContextAnalysis): VisualizationSuggestion[] {
    const visualizations: VisualizationSuggestion[] = [];

    // 우선순위별 차트
    const priorityData = detailedResponses.reduce((acc, resp) => {
      acc[resp.priority] = (acc[resp.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    visualizations.push({
      type: 'chart',
      title: '요구사항 우선순위 분포',
      description: '식별된 요구사항들의 우선순위별 분포를 보여줍니다.',
      data: priorityData
    });

    // 복잡도별 차트
    const complexityData = detailedResponses.reduce((acc, resp) => {
      acc[resp.complexity] = (acc[resp.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    visualizations.push({
      type: 'chart',
      title: '요구사항 복잡도 분포',
      description: '각 요구사항의 복잡도 수준을 시각화합니다.',
      data: complexityData
    });

    // 타임라인
    const timelineData = detailedResponses.map((resp, index) => ({
      id: index + 1,
      title: resp.requirement,
      duration: resp.estimatedTime,
      priority: resp.priority
    }));

    visualizations.push({
      type: 'timeline',
      title: '요구사항 처리 타임라인',
      description: '각 요구사항의 예상 처리 시간을 타임라인으로 표시합니다.',
      data: timelineData as unknown as Record<string, unknown>
    });

    return visualizations;
  }

  // 유틸리티 메서드들
  private findCommonElements(array: string[]): string[] {
    const frequency: { [key: string]: number } = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.entries(frequency)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([item, _]) => item);
  }

  private analyzeConversationFlow(messages: Record<string, unknown>[]): string {
    if (messages.length < 2) return '단일 메시지';
    
    const topics = messages.map(msg => ((msg as Record<string, unknown>).topics as unknown[]) ?? []);
    const topicChanges = topics.filter((_, index) => 
      index > 0 && JSON.stringify(topics[index]) !== JSON.stringify(topics[index - 1])
    ).length;
    
    if (topicChanges === 0) return '일관된 주제';
    if (topicChanges < messages.length / 2) return '점진적 주제 변화';
    return '다양한 주제 탐색';
  }

  private extractUserPreferences(history: Record<string, unknown>[]): Record<string, unknown> {
    const preferences: Record<string, unknown> = {};
    
    // 응답 길이 선호도
    const responseLengths = history.map(msg => {
      const r = (msg as Record<string, unknown>).response;
      return typeof r === 'string' ? r.length : 0;
    });
    preferences.prefersDetailed = responseLengths.length > 0 && responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length > 500;
    
    // 기술적 수준 선호도
    const technicalTerms = history.flatMap(msg => ((msg as Record<string, unknown>).technicalTerms as unknown[]) ?? []);
    preferences.prefersTechnical = technicalTerms.length > 5;
    
    return preferences;
  }

  private detectUrgency(message: string): 'low' | 'medium' | 'high' {
    const urgentPatterns = /긴급|시급|즉시|바로|당장|마감|deadline/gi;
    const highPatterns = /중요|핵심|필수|반드시|꼭/gi;
    
    if (urgentPatterns.test(message)) return 'high';
    if (highPatterns.test(message)) return 'medium';
    return 'low';
  }

  private detectComplexity(message: string): 'basic' | 'intermediate' | 'advanced' | 'expert' {
    const expertPatterns = /전문가|박사|최고급|최첨단|최신/gi;
    const advancedPatterns = /고급|심화|전문|고도화/gi;
    const basicPatterns = /기초|간단|쉬운|기본/gi;
    
    if (expertPatterns.test(message)) return 'expert';
    if (advancedPatterns.test(message)) return 'advanced';
    if (basicPatterns.test(message)) return 'basic';
    return 'intermediate';
  }

  private calculateSessionIntensity(timeGaps: number[]): 'low' | 'medium' | 'high' {
    const avgGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
    if (avgGap < 5) return 'high';
    if (avgGap < 15) return 'medium';
    return 'low';
  }

  private calculateTopicContinuity(history: Record<string, unknown>[]): number {
    if (history.length < 2) return 1;
    
    const topics = history.map(msg => ((msg as Record<string, unknown>).topics as unknown[]) ?? []);
    let continuityCount = 0;
    
    for (let i = 1; i < topics.length; i++) {
      const prevTopics = topics[i - 1] as string[];
      const currTopics = topics[i] as string[];
      const commonTopics = currTopics.filter((topic: unknown) => prevTopics.includes(topic as string));
      if (commonTopics.length > 0) continuityCount++;
    }
    
    return continuityCount / (topics.length - 1);
  }

  // 요구사항 분석 메서드들
  private analyzeRequirementType(requirement: string): string {
    if (/분석|검토|평가/.test(requirement)) return 'analysis';
    if (/작성|생성|만들어/.test(requirement)) return 'creation';
    if (/설명|이해|왜/.test(requirement)) return 'explanation';
    if (/비교|대조|차이점/.test(requirement)) return 'comparison';
    if (/제안|추천|방법/.test(requirement)) return 'suggestion';
    if (/문제|해결|어려움/.test(requirement)) return 'problem-solving';
    return 'general';
  }

  private analyzeRequirementComplexity(requirement: string, _contextAnalysis: ContextAnalysis): 'basic' | 'intermediate' | 'advanced' | 'expert' {
    const expertTerms = /전문가|박사|최고급|최첨단|최신/gi;
    const advancedTerms = /고급|심화|전문|고도화/gi;
    const basicTerms = /기초|간단|쉬운|기본/gi;
    
    if (expertTerms.test(requirement)) return 'expert';
    if (advancedTerms.test(requirement)) return 'advanced';
    if (basicTerms.test(requirement)) return 'basic';
    return 'intermediate';
  }

  private analyzeRequirementPriority(requirement: string, _contextAnalysis: ContextAnalysis): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentTerms = /긴급|시급|즉시|바로|당장|마감|deadline/gi;
    const highTerms = /중요|핵심|필수|반드시|꼭/gi;
    
    if (urgentTerms.test(requirement)) return 'urgent';
    if (highTerms.test(requirement)) return 'high';
    return 'medium';
  }

  private estimateRequirementTime(requirement: string, complexity: string, type: string): number {
    let baseTime = 5;
    
    switch (complexity) {
      case 'basic': baseTime *= 0.5; break;
      case 'intermediate': baseTime *= 1; break;
      case 'advanced': baseTime *= 2; break;
      case 'expert': baseTime *= 3; break;
    }
    
    switch (type) {
      case 'analysis': baseTime *= 1.2; break;
      case 'creation': baseTime *= 1.5; break;
      case 'explanation': baseTime *= 0.8; break;
      case 'comparison': baseTime *= 1.3; break;
      case 'suggestion': baseTime *= 1.1; break;
      case 'problem-solving': baseTime *= 1.4; break;
    }
    
    return Math.ceil(baseTime);
  }

  private analyzeRequirementDependencies(requirement: string, _contextAnalysis: ContextAnalysis): string[] {
    const dependencies: string[] = [];
    
    if (/참고|참조|출처|문헌|자료/.test(requirement)) {
      dependencies.push('참고 자료 수집');
    }
    
    if (/검증|확인|테스트|검사/.test(requirement)) {
      dependencies.push('검증 과정');
    }
    
    return dependencies;
  }

  private analyzeRequirementAlternatives(requirement: string, _contextAnalysis: ContextAnalysis): string[] {
    const alternatives: string[] = [];
    
    if (/또는|혹은|대안|대체/.test(requirement)) {
      alternatives.push('대안적 접근 방법');
    }
    
    if (/비교|대조/.test(requirement)) {
      alternatives.push('비교 분석');
    }
    
    return alternatives;
  }

  private async generateRequirementResponse(requirement: string, type: string, complexity: string, _contextAnalysis: ContextAnalysis): Promise<string> {
    // 실제 구현에서는 AI 모델을 사용하여 응답 생성
    // 여기서는 템플릿 기반 응답 생성
    
    let response = `요청하신 "${requirement}"에 대한 답변입니다.\n\n`;
    
    switch (type) {
      case 'analysis':
        response += `📊 **분석 결과**\n`;
        response += `이 요구사항에 대한 체계적인 분석을 수행했습니다. `;
        response += `관련 데이터와 정보를 종합하여 객관적인 평가를 제공합니다.\n\n`;
        break;
      case 'creation':
        response += `✍️ **생성 결과**\n`;
        response += `요청하신 내용을 바탕으로 새로운 자료를 생성했습니다. `;
        response += `구체적이고 실용적인 내용으로 구성했습니다.\n\n`;
        break;
      case 'explanation':
        response += `📚 **상세 설명**\n`;
        response += `이 주제에 대해 단계별로 상세히 설명드립니다. `;
        response += `이해하기 쉽도록 예시와 함께 설명했습니다.\n\n`;
        break;
      case 'comparison':
        response += `⚖️ **비교 분석**\n`;
        response += `요청하신 비교 분석을 수행했습니다. `;
        response += `객관적인 기준을 바탕으로 체계적인 비교를 제공합니다.\n\n`;
        break;
      case 'suggestion':
        response += `💡 **제안사항**\n`;
        response += `상황에 맞는 실용적인 제안을 드립니다. `;
        response += `다양한 관점에서 검토한 결과를 바탕으로 합니다.\n\n`;
        break;
      case 'problem-solving':
        response += `🔧 **문제 해결**\n`;
        response += `제시된 문제에 대한 해결 방안을 제시합니다. `;
        response += `근본 원인 분석과 함께 실효성 있는 해결책을 제공합니다.\n\n`;
        break;
      default:
        response += `📋 **일반 응답**\n`;
        response += `요청하신 내용에 대한 답변을 제공합니다.\n\n`;
    }
    
    response += `**복잡도**: ${complexity}\n`;
    response += `**처리 방법**: ${this.getProcessingMethod(type, complexity)}\n`;
    response += `**예상 결과**: ${this.getExpectedResult(type, complexity)}`;
    
    return response;
  }

  private generateOverallApproach(context: MessageContext, responses: RequirementResponse[], _contextAnalysis: ContextAnalysis): string {
    let approach = '';
    
    // 우선순위별 접근
    const urgentCount = responses.filter(r => r.priority === 'urgent').length;
    const highCount = responses.filter(r => r.priority === 'high').length;
    
    if (urgentCount > 0) {
      approach += `• 긴급 요구사항 ${urgentCount}개를 최우선으로 처리\n`;
    }
    if (highCount > 0) {
      approach += `• 중요 요구사항 ${highCount}개를 체계적으로 처리\n`;
    }
    
    // 복잡도별 접근
    const expertCount = responses.filter(r => r.complexity === 'expert').length;
    if (expertCount > 0) {
      approach += `• 전문가 수준 요구사항 ${expertCount}개에 대해 심화 분석 수행\n`;
    }
    
    // 타입별 접근
    approach += `• ${context.type} 작업에 특화된 방법론 적용\n`;
    approach += `• 각 요구사항별 맞춤형 접근 방식 채택\n`;
    
    return approach;
  }

  private getProcessingMethod(type: string, complexity: string): string {
    const methods: { [key: string]: { [key: string]: string } } = {
      analysis: {
        basic: '기본 분석 도구 활용',
        intermediate: '표준 분석 방법론 적용',
        advanced: '고급 분석 기법 활용',
        expert: '최신 연구 기반 전문 분석'
      },
      creation: {
        basic: '템플릿 기반 생성',
        intermediate: '구조화된 생성 방법',
        advanced: '고급 생성 알고리즘',
        expert: 'AI 기반 최적화 생성'
      }
    };
    
    return methods[type]?.[complexity] || '표준 처리 방법';
  }

  private getExpectedResult(type: string, complexity: string): string {
    const results: { [key: string]: { [key: string]: string } } = {
      analysis: {
        basic: '기본 분석 보고서',
        intermediate: '상세 분석 결과',
        advanced: '심화 분석 보고서',
        expert: '전문가 수준 종합 분석'
      },
      creation: {
        basic: '기본 생성물',
        intermediate: '구조화된 생성물',
        advanced: '고급 생성물',
        expert: '최적화된 전문 생성물'
      }
    };
    
    return results[type]?.[complexity] || '적절한 결과물';
  }
}

export default AdvancedResponseGenerator;
