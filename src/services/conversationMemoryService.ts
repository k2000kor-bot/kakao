/**
 * 대화 메모리 및 학습 서비스
 * 사용자의 질문 패턴을 학습하고 더 나은 응답 제공
 */

interface ConversationRecord {
  id: string;
  timestamp: string;
  question: string;
  response: string;
  analysisType?: string;
  userSatisfaction?: number;
  processingTime: number;
  context: any;
}

interface UserPattern {
  favoriteTopics: string[];
  questionStyle: 'direct' | 'exploratory' | 'detailed';
  preferredResponseLength: 'short' | 'medium' | 'long';
  commonKeywords: string[];
  sessionDuration: number;
  questionsPerSession: number;
}

class ConversationMemoryService {
  private conversations: ConversationRecord[] = [];
  private userPatterns: Map<string, UserPattern> = new Map();
  private maxRecords = 1000;

  /**
   * 대화 기록 저장
   */
  saveConversation(record: Omit<ConversationRecord, 'id' | 'timestamp'>): void {
    const conversation: ConversationRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.conversations.push(conversation);
    
    // 최대 기록 수 제한
    if (this.conversations.length > this.maxRecords) {
      this.conversations = this.conversations.slice(-this.maxRecords);
    }

    // 패턴 학습
    this.updateUserPatterns(conversation);
  }

  /**
   * 사용자 패턴 분석 및 업데이트
   */
  private updateUserPatterns(conversation: ConversationRecord): void {
    const userId = 'default'; // 실제로는 사용자 ID 사용
    let pattern = this.userPatterns.get(userId);

    if (!pattern) {
      pattern = {
        favoriteTopics: [],
        questionStyle: 'direct',
        preferredResponseLength: 'medium',
        commonKeywords: [],
        sessionDuration: 0,
        questionsPerSession: 0
      };
    }

    // 주제 분석
    const topics = this.extractTopics(conversation.question);
    topics.forEach(topic => {
      if (!pattern!.favoriteTopics.includes(topic)) {
        pattern!.favoriteTopics.push(topic);
      }
    });

    // 키워드 분석
    const keywords = this.extractKeywords(conversation.question);
    keywords.forEach(keyword => {
      if (!pattern!.commonKeywords.includes(keyword)) {
        pattern!.commonKeywords.push(keyword);
      }
    });

    // 질문 스타일 분석
    pattern.questionStyle = this.analyzeQuestionStyle(conversation.question);

    this.userPatterns.set(userId, pattern);
  }

  /**
   * 주제 추출
   */
  private extractTopics(question: string): string[] {
    const topicKeywords = {
      '성향분석': ['성향', '참여자', '사람들', '의견', '생각'],
      '편향분석': ['편향', '시공사', '업체', '건설사', '선호'],
      '여론분석': ['여론', '분위기', '반응', '트렌드', '변화'],
      '비교분석': ['비교', '차이', '대비', 'vs'],
      '예측분석': ['예측', '전망', '미래', '가능성']
    };

    const topics: string[] = [];
    const lowerQuestion = question.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * 키워드 추출
   */
  private extractKeywords(question: string): string[] {
    const words = question.toLowerCase().split(/\s+/);
    const stopWords = ['이', '그', '저', '것', '들', '은', '는', '이', '가', '을', '를', '에', '서', '로', '으로', '와', '과'];
    
    return words
      .filter(word => word.length > 1)
      .filter(word => !stopWords.includes(word))
      .slice(0, 10); // 상위 10개만
  }

  /**
   * 질문 스타일 분석
   */
  private analyzeQuestionStyle(question: string): 'direct' | 'exploratory' | 'detailed' {
    const directPatterns = /^(.*해줘|.*보여줘|.*알려줘)$/;
    const exploratoryPatterns = /(어때|어떻게|어떤|왜|무엇)/;
    const detailedPatterns = /(자세히|구체적|상세|깊이|완전히)/;

    if (detailedPatterns.test(question)) return 'detailed';
    if (exploratoryPatterns.test(question)) return 'exploratory';
    if (directPatterns.test(question)) return 'direct';

    return 'direct';
  }

  /**
   * 사용자 패턴 기반 응답 개선 제안
   */
  getPersonalizedSuggestions(userId: string = 'default'): string[] {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return [];

    const suggestions: string[] = [];

    // 선호 주제 기반 제안
    if (pattern.favoriteTopics.includes('성향분석')) {
      suggestions.push('참여자별 상세 성향 분석도 확인해보세요');
    }

    if (pattern.favoriteTopics.includes('편향분석')) {
      suggestions.push('시간대별 편향 변화 추이도 살펴보시면 좋을 것 같아요');
    }

    // 질문 스타일 기반 제안
    if (pattern.questionStyle === 'detailed') {
      suggestions.push('심층 분석 보고서도 생성할 수 있습니다');
    }

    return suggestions;
  }

  /**
   * 대화 이력 조회
   */
  getConversationHistory(limit: number = 20): ConversationRecord[] {
    return this.conversations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * 인기 질문 분석
   */
  getPopularQuestions(): Array<{ question: string; count: number }> {
    const questionCounts = new Map<string, number>();

    this.conversations.forEach(conv => {
      const normalizedQ = this.normalizeQuestion(conv.question);
      questionCounts.set(normalizedQ, (questionCounts.get(normalizedQ) || 0) + 1);
    });

    return Array.from(questionCounts.entries())
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 질문 정규화
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/[?!.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 성능 통계
   */
  getPerformanceStats(): any {
    const totalConversations = this.conversations.length;
    if (totalConversations === 0) return null;

    const avgProcessingTime = this.conversations.reduce((sum, conv) => sum + conv.processingTime, 0) / totalConversations;
    const satisfactionRatings = this.conversations.filter(conv => conv.userSatisfaction !== undefined);
    const avgSatisfaction = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((sum, conv) => sum + (conv.userSatisfaction || 0), 0) / satisfactionRatings.length
      : 0;

    const analysisTypeCounts = this.conversations.reduce((acc, conv) => {
      if (conv.analysisType) {
        acc[conv.analysisType] = (acc[conv.analysisType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConversations,
      averageProcessingTime: Math.round(avgProcessingTime),
      averageSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      analysisTypeDistribution: analysisTypeCounts,
      mostActiveDay: this.getMostActiveDay(),
      responseTimeImprovement: this.getResponseTimeImprovement()
    };
  }

  /**
   * 가장 활발한 요일 찾기
   */
  private getMostActiveDay(): string {
    const dayCounts = this.conversations.reduce((acc, conv) => {
      const day = new Date(conv.timestamp).toLocaleDateString('ko-KR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '데이터 없음';
  }

  /**
   * 응답 시간 개선도 계산
   */
  private getResponseTimeImprovement(): number {
    if (this.conversations.length < 10) return 0;

    const recent = this.conversations.slice(-10);
    const older = this.conversations.slice(-20, -10);

    const recentAvg = recent.reduce((sum, conv) => sum + conv.processingTime, 0) / recent.length;
    const olderAvg = older.reduce((sum, conv) => sum + conv.processingTime, 0) / older.length;

    return Math.round(((olderAvg - recentAvg) / olderAvg) * 100);
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 사용자 피드백 기록
   */
  recordFeedback(conversationId: string, satisfaction: number): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.userSatisfaction = satisfaction;
    }
  }

  /**
   * 학습 데이터 내보내기
   */
  exportLearningData(): any {
    return {
      conversations: this.conversations,
      userPatterns: Object.fromEntries(this.userPatterns),
      statistics: this.getPerformanceStats(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * 학습 데이터 가져오기
   */
  importLearningData(data: any): void {
    if (data.conversations) {
      this.conversations = data.conversations;
    }
    if (data.userPatterns) {
      this.userPatterns = new Map(Object.entries(data.userPatterns));
    }
  }
}

export const conversationMemoryService = new ConversationMemoryService();
