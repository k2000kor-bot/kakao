export interface ResponseQualityMetrics {
  accuracy: number;        // 정확도 (0-1)
  relevance: number;       // 관련성 (0-1)
  creativity: number;      // 창의성 (0-1)
  completeness: number;    // 완성도 (0-1)
  clarity: number;         // 명확성 (0-1)
  engagement: number;      // 흥미도 (0-1)
  coherence: number;       // 일관성 (0-1)
  helpfulness: number;     // 도움성 (0-1)
}

export interface QualityImprovement {
  type: 'accuracy' | 'relevance' | 'creativity' | 'completeness' | 'clarity' | 'engagement' | 'coherence' | 'helpfulness';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  confidence: number;
}

export interface ResponseAnalysis {
  originalResponse: string;
  improvedResponse: string;
  qualityMetrics: ResponseQualityMetrics;
  improvements: QualityImprovement[];
  overallScore: number;
  processingTime: number;
  language: string;
  context: {
    userIntent: string;
    conversationHistory: string[];
    attachedFiles: string[];
    projectContext?: any;
  };
}

export class AIResponseQualityService {
  private qualityThresholds = {
    accuracy: 0.8,
    relevance: 0.85,
    creativity: 0.7,
    completeness: 0.9,
    clarity: 0.85,
    engagement: 0.75,
    coherence: 0.9,
    helpfulness: 0.85
  };

  // 응답 품질 분석
  async analyzeResponseQuality(
    response: string,
    context: {
      userIntent: string;
      conversationHistory: string[];
      attachedFiles: string[];
      projectContext?: any;
    }
  ): Promise<ResponseAnalysis> {
    const startTime = Date.now();

    // 품질 메트릭 계산
    const qualityMetrics = await this.calculateQualityMetrics(response, context);
    
    // 개선 사항 식별
    const improvements = this.identifyImprovements(qualityMetrics, response, context);
    
    // 응답 개선
    const improvedResponse = await this.improveResponse(response, improvements, context);
    
    // 전체 점수 계산
    const overallScore = this.calculateOverallScore(qualityMetrics);

    return {
      originalResponse: response,
      improvedResponse,
      qualityMetrics,
      improvements,
      overallScore,
      processingTime: Date.now() - startTime,
      language: this.detectLanguage(response),
      context
    };
  }

  // 품질 메트릭 계산
  private async calculateQualityMetrics(
    response: string,
    context: any
  ): Promise<ResponseQualityMetrics> {
    // 정확도: 사실 기반 정보의 정확성
    const accuracy = this.calculateAccuracy(response, context);
    
    // 관련성: 사용자 의도와의 연관성
    const relevance = this.calculateRelevance(response, context.userIntent);
    
    // 창의성: 독창적이고 혁신적인 내용
    const creativity = this.calculateCreativity(response);
    
    // 완성도: 질문에 대한 완전한 답변
    const completeness = this.calculateCompleteness(response, context.userIntent);
    
    // 명확성: 이해하기 쉬운 표현
    const clarity = this.calculateClarity(response);
    
    // 흥미도: 사용자의 관심을 끄는 정도
    const engagement = this.calculateEngagement(response);
    
    // 일관성: 논리적 흐름과 일관성
    const coherence = this.calculateCoherence(response, context.conversationHistory);
    
    // 도움성: 실제 도움이 되는 정도
    const helpfulness = this.calculateHelpfulness(response, context);

    return {
      accuracy,
      relevance,
      creativity,
      completeness,
      clarity,
      engagement,
      coherence,
      helpfulness
    };
  }

  // 정확도 계산
  private calculateAccuracy(response: string, context: any): number {
    // 사실 확인 가능한 정보 검출
    const factualStatements = this.extractFactualStatements(response);
    const verifiedFacts = factualStatements.filter(fact => 
      this.verifyFact(fact, context)
    );
    
    return factualStatements.length > 0 
      ? verifiedFacts.length / factualStatements.length 
      : 0.9; // 사실적 정보가 없는 경우 기본값
  }

  // 관련성 계산
  private calculateRelevance(response: string, userIntent: string): number {
    const responseKeywords = this.extractKeywords(response);
    const intentKeywords = this.extractKeywords(userIntent);
    
    const intersection = responseKeywords.filter(keyword => 
      intentKeywords.includes(keyword)
    );
    
    return intentKeywords.length > 0 
      ? intersection.length / intentKeywords.length 
      : 0.8;
  }

  // 창의성 계산
  private calculateCreativity(response: string): number {
    const creativityIndicators = [
      '혁신적인', '창의적인', '독창적인', '새로운', '혁신',
      '아이디어', '제안', '방안', '접근법', '해결책',
      '예시', '비유', '메타포', '시나리오', '시뮬레이션'
    ];
    
    const creativeElements = creativityIndicators.filter(indicator => 
      response.includes(indicator)
    ).length;
    
    return Math.min(creativeElements / 3, 1); // 최대 1.0
  }

  // 완성도 계산
  private calculateCompleteness(response: string, userIntent: string): number {
    const intentWords = userIntent.split(' ').filter(word => word.length > 1);
    const responseWords = response.split(' ').filter(word => word.length > 1);
    
    const coveredIntent = intentWords.filter(word => 
      responseWords.some(responseWord => 
        responseWord.includes(word) || word.includes(responseWord)
      )
    );
    
    return intentWords.length > 0 
      ? coveredIntent.length / intentWords.length 
      : 0.9;
  }

  // 명확성 계산
  private calculateClarity(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, sentence) => 
      sum + sentence.split(' ').length, 0
    ) / sentences.length;
    
    // 적절한 문장 길이 (10-20단어)를 선호
    const lengthScore = avgSentenceLength >= 10 && avgSentenceLength <= 20 ? 1 : 
                       avgSentenceLength < 5 || avgSentenceLength > 30 ? 0.5 : 0.8;
    
    // 복잡한 문장 구조 감지
    const complexStructures = (response.match(/[그러나|하지만|그런데|또한|또한|그리고]/g) || []).length;
    const structureScore = complexStructures > 5 ? 0.7 : 1;
    
    return (lengthScore + structureScore) / 2;
  }

  // 흥미도 계산
  private calculateEngagement(response: string): number {
    const engagementIndicators = [
      '흥미로운', '놀라운', '신기한', '재미있는', '유용한',
      '중요한', '핵심적인', '주목할 만한', '특별한', '독특한'
    ];
    
    const engagementElements = engagementIndicators.filter(indicator => 
      response.includes(indicator)
    ).length;
    
    // 질문 포함 여부
    const hasQuestions = response.includes('?') || response.includes('?');
    
    return Math.min((engagementElements + (hasQuestions ? 0.3 : 0)) / 2, 1);
  }

  // 일관성 계산
  private calculateCoherence(response: string, conversationHistory: string[]): number {
    if (conversationHistory.length === 0) return 0.9;
    
    const recentContext = conversationHistory.slice(-3).join(' ');
    const contextKeywords = this.extractKeywords(recentContext);
    const responseKeywords = this.extractKeywords(response);
    
    const contextContinuity = contextKeywords.filter(keyword => 
      responseKeywords.includes(keyword)
    ).length;
    
    return contextKeywords.length > 0 
      ? Math.min(contextContinuity / contextKeywords.length, 1) 
      : 0.8;
  }

  // 도움성 계산
  private calculateHelpfulness(response: string, context: any): number {
    const helpfulIndicators = [
      '도움이', '유용한', '실용적인', '구체적인', '상세한',
      '단계별', '방법', '가이드', '팁', '조언',
      '권장', '제안', '해결책', '대안', '옵션'
    ];
    
    const helpfulElements = helpfulIndicators.filter(indicator => 
      response.includes(indicator)
    ).length;
    
    // 구체적인 정보 포함 여부
    const hasSpecificInfo = /\d+|[첫째|둘째|셋째|넷째|다섯째]/.test(response);
    
    return Math.min((helpfulElements + (hasSpecificInfo ? 0.4 : 0)) / 3, 1);
  }

  // 개선 사항 식별
  private identifyImprovements(
    metrics: ResponseQualityMetrics,
    response: string,
    context: any
  ): QualityImprovement[] {
    const improvements: QualityImprovement[] = [];
    
    Object.entries(metrics).forEach(([metric, score]) => {
      const threshold = this.qualityThresholds[metric as keyof ResponseQualityMetrics];
      
      if (score < threshold) {
        improvements.push({
          type: metric as keyof ResponseQualityMetrics,
          priority: score < threshold * 0.7 ? 'high' : 
                   score < threshold * 0.85 ? 'medium' : 'low',
          suggestion: this.generateImprovementSuggestion(metric, score, response, context),
          confidence: 1 - score
        });
      }
    });
    
    // 우선순위별 정렬
    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // 개선 제안 생성
  private generateImprovementSuggestion(
    metric: string,
    score: number,
    response: string,
    context: any
  ): string {
    const suggestions: { [key: string]: string[] } = {
      accuracy: [
        '더 정확한 정보를 제공하기 위해 구체적인 데이터나 예시를 추가하세요.',
        '사실 확인이 필요한 내용에 대해 출처를 명시하세요.',
        '최신 정보로 업데이트가 필요한 부분을 확인하세요.'
      ],
      relevance: [
        '사용자의 질문과 더 직접적으로 관련된 내용으로 응답하세요.',
        '핵심 질문에 대한 답변을 우선적으로 제공하세요.',
        '관련성이 낮은 정보는 제거하거나 간소화하세요.'
      ],
      creativity: [
        '더 창의적이고 독창적인 관점을 제시하세요.',
        '새로운 아이디어나 접근 방식을 제안하세요.',
        '예시나 비유를 사용하여 설명을 더 흥미롭게 만드세요.'
      ],
      completeness: [
        '질문의 모든 측면에 대해 완전한 답변을 제공하세요.',
        '누락된 중요한 정보를 추가하세요.',
        '단계별로 상세한 설명을 제공하세요.'
      ],
      clarity: [
        '더 명확하고 이해하기 쉬운 언어를 사용하세요.',
        '복잡한 문장을 간단한 문장으로 나누세요.',
        '전문 용어에 대한 설명을 추가하세요.'
      ],
      engagement: [
        '더 흥미롭고 매력적인 표현을 사용하세요.',
        '질문을 통해 사용자의 참여를 유도하세요.',
        '관련된 흥미로운 사실이나 통계를 추가하세요.'
      ],
      coherence: [
        '논리적 흐름을 개선하여 일관성을 높이세요.',
        '이전 대화 내용과의 연결성을 강화하세요.',
        '주제 전환을 부드럽게 처리하세요.'
      ],
      helpfulness: [
        '실용적이고 구체적인 도움을 제공하세요.',
        '단계별 가이드나 체크리스트를 제공하세요.',
        '추가 리소스나 참고 자료를 제안하세요.'
      ]
    };

    const metricSuggestions = suggestions[metric] || ['전반적인 품질을 개선하세요.'];
    const suggestionIndex = Math.floor((1 - score) * metricSuggestions.length);
    return metricSuggestions[suggestionIndex];
  }

  // 응답 개선
  private async improveResponse(
    response: string,
    improvements: QualityImprovement[],
    context: any
  ): Promise<string> {
    let improvedResponse = response;
    
    // 높은 우선순위 개선사항부터 적용
    const highPriorityImprovements = improvements.filter(imp => imp.priority === 'high');
    
    for (const improvement of highPriorityImprovements) {
      improvedResponse = await this.applyImprovement(improvedResponse, improvement, context);
    }
    
    return improvedResponse;
  }

  // 개선사항 적용
  private async applyImprovement(
    response: string,
    improvement: QualityImprovement,
    context: any
  ): Promise<string> {
    switch (improvement.type) {
      case 'accuracy':
        return this.improveAccuracy(response, context);
      case 'relevance':
        return this.improveRelevance(response, context.userIntent);
      case 'creativity':
        return this.improveCreativity(response);
      case 'completeness':
        return this.improveCompleteness(response, context.userIntent);
      case 'clarity':
        return this.improveClarity(response);
      case 'engagement':
        return this.improveEngagement(response);
      case 'coherence':
        return this.improveCoherence(response, context.conversationHistory);
      case 'helpfulness':
        return this.improveHelpfulness(response, context);
      default:
        return response;
    }
  }

  // 정확도 개선
  private async improveAccuracy(response: string, context: any): Promise<string> {
    // 사실 확인 및 출처 추가
    const factualStatements = this.extractFactualStatements(response);
    let improved = response;
    
    for (const statement of factualStatements) {
      if (!this.verifyFact(statement, context)) {
        improved = improved.replace(statement, `${statement} (확인 필요)`);
      }
    }
    
    return improved;
  }

  // 관련성 개선
  private improveRelevance(response: string, userIntent: string): string {
    const intentKeywords = this.extractKeywords(userIntent);
    const responseKeywords = this.extractKeywords(response);
    
    const missingKeywords = intentKeywords.filter(keyword => 
      !responseKeywords.some(responseKeyword => 
        responseKeyword.includes(keyword) || keyword.includes(responseKeyword)
      )
    );
    
    if (missingKeywords.length > 0) {
      return `${response}\n\n추가로 ${missingKeywords.join(', ')}에 대한 정보도 제공해드릴 수 있습니다.`;
    }
    
    return response;
  }

  // 창의성 개선
  private improveCreativity(response: string): string {
    const creativeElements = [
      '💡 아이디어: ',
      '🚀 혁신적 접근: ',
      '🎯 창의적 해결책: ',
      '✨ 새로운 관점: '
    ];
    
    const randomElement = creativeElements[Math.floor(Math.random() * creativeElements.length)];
    return `${response}\n\n${randomElement}이 문제를 다른 각도에서 바라보면 더 흥미로운 해결책을 찾을 수 있을 것 같습니다.`;
  }

  // 완성도 개선
  private improveCompleteness(response: string, userIntent: string): string {
    const intentWords = userIntent.split(' ').filter(word => word.length > 1);
    const responseWords = response.split(' ').filter(word => word.length > 1);
    
    const missingAspects = intentWords.filter(word => 
      !responseWords.some(responseWord => 
        responseWord.includes(word) || word.includes(responseWord)
      )
    );
    
    if (missingAspects.length > 0) {
      return `${response}\n\n${missingAspects.join(', ')}에 대해서도 더 자세히 설명드릴까요?`;
    }
    
    return response;
  }

  // 명확성 개선
  private improveClarity(response: string): string {
    // 긴 문장을 짧은 문장으로 분리
    const sentences = response.split(/[.!?]+/);
    const improvedSentences = sentences.map(sentence => {
      if (sentence.split(' ').length > 20) {
        return sentence.replace(/[,;]/g, '.\n');
      }
      return sentence;
    });
    
    return improvedSentences.join('. ');
  }

  // 흥미도 개선
  private improveEngagement(response: string): string {
    const engagementQuestions = [
      '이 정보가 도움이 되셨나요?',
      '추가로 궁금한 점이 있으시면 언제든 물어보세요!',
      '이 주제에 대해 더 자세히 알고 싶으신 부분이 있나요?'
    ];
    
    const randomQuestion = engagementQuestions[Math.floor(Math.random() * engagementQuestions.length)];
    return `${response}\n\n${randomQuestion}`;
  }

  // 일관성 개선
  private improveCoherence(response: string, conversationHistory: string[]): string {
    if (conversationHistory.length === 0) return response;
    
    const recentContext = conversationHistory.slice(-2).join(' ');
    const contextKeywords = this.extractKeywords(recentContext);
    
    if (contextKeywords.length > 0) {
      return `앞서 말씀하신 ${contextKeywords.slice(0, 2).join(', ')}와 관련하여, ${response}`;
    }
    
    return response;
  }

  // 도움성 개선
  private improveHelpfulness(response: string, context: any): string {
    const helpfulAdditions = [
      '\n\n💡 팁: 이 정보를 실제로 적용할 때 참고하세요.',
      '\n\n📋 체크리스트: 다음 단계를 확인해보세요.',
      '\n\n🔗 관련 자료: 더 자세한 정보를 찾아보세요.'
    ];
    
    const randomAddition = helpfulAdditions[Math.floor(Math.random() * helpfulAdditions.length)];
    return response + randomAddition;
  }

  // 전체 점수 계산
  private calculateOverallScore(metrics: ResponseQualityMetrics): number {
    const weights = {
      accuracy: 0.2,
      relevance: 0.2,
      completeness: 0.15,
      clarity: 0.15,
      helpfulness: 0.1,
      coherence: 0.1,
      creativity: 0.05,
      engagement: 0.05
    };
    
    return Object.entries(metrics).reduce((score, [metric, value]) => {
      return score + (value * weights[metric as keyof ResponseQualityMetrics]);
    }, 0);
  }

  // 언어 감지
  private detectLanguage(text: string): string {
    const koreanPattern = /[가-힣]/;
    const englishPattern = /[a-zA-Z]/;
    const japanesePattern = /[あ-んア-ン]/;
    const chinesePattern = /[一-龯]/;
    
    if (koreanPattern.test(text)) return 'ko';
    if (japanesePattern.test(text)) return 'ja';
    if (chinesePattern.test(text)) return 'zh';
    if (englishPattern.test(text)) return 'en';
    
    return 'unknown';
  }

  // 키워드 추출
  private extractKeywords(text: string): string[] {
    const stopWords = ['이', '그', '저', '것', '수', '등', '및', '또는', '그리고', '하지만', '그러나'];
    return text
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 10); // 상위 10개 키워드만
  }

  // 사실적 문장 추출
  private extractFactualStatements(text: string): string[] {
    const factualPatterns = [
      /[0-9]+%/, // 퍼센트
      /[0-9]+년/, // 연도
      /[0-9]+개/, // 개수
      /[가-힣]+은/, // 주어 + 은
      /[가-힣]+는/, // 주어 + 는
      /[가-힣]+이다/, // ~이다
      /[가-힣]+입니다/ // ~입니다
    ];
    
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      factualPatterns.some(pattern => pattern.test(sentence))
    );
  }

  // 사실 확인 (시뮬레이션)
  private verifyFact(fact: string, context: any): boolean {
    // 실제 구현에서는 외부 API나 데이터베이스를 사용
    return Math.random() > 0.3; // 70% 확률로 사실로 간주
  }

  // 실시간 품질 모니터링
  startQualityMonitoring(callback: (metrics: ResponseQualityMetrics) => void): () => void {
    const interval = setInterval(() => {
      // 실시간 품질 메트릭 수집
      const mockMetrics: ResponseQualityMetrics = {
        accuracy: 0.85 + Math.random() * 0.1,
        relevance: 0.8 + Math.random() * 0.15,
        creativity: 0.7 + Math.random() * 0.2,
        completeness: 0.9 + Math.random() * 0.1,
        clarity: 0.85 + Math.random() * 0.1,
        engagement: 0.75 + Math.random() * 0.2,
        coherence: 0.9 + Math.random() * 0.1,
        helpfulness: 0.85 + Math.random() * 0.1
      };
      
      callback(mockMetrics);
    }, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }
}

export const aiResponseQualityService = new AIResponseQualityService();
