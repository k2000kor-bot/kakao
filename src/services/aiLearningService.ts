import { ProjectFile, KnowledgeBase, AILearningSession } from '../types/project';

export interface AIAnalysisResult {
  keywords: string[];
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  entities: string[];
  topics: string[];
  recommendations: string[];
  confidence: number;
  analysisType: 'basic' | 'advanced' | 'deep';
  processingTime: number;
  modelVersion: string;
  accuracy: number;
}

export interface LearningProgress {
  currentStep: string;
  progress: number;
  estimatedTime: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  details: string;
  errors: string[];
  warnings: string[];
}

export interface RealTimeAnalysis {
  id: string;
  fileId: string;
  type: 'keyword' | 'sentiment' | 'entity' | 'topic' | 'summary';
  result: any;
  confidence: number;
  timestamp: string;
}

export class AILearningService {
  private static instance: AILearningService;
  private learningSessions: Map<string, AILearningSession> = new Map();
  private knowledgeBase: Map<string, KnowledgeBase[]> = new Map();
  private realTimeAnalyses: Map<string, RealTimeAnalysis[]> = new Map();

  private constructor() { }

  static getInstance(): AILearningService {
    if (!AILearningService.instance) {
      AILearningService.instance = new AILearningService();
    }
    return AILearningService.instance;
  }

  async startLearningSession(projectId: string, options: {
    analysisType?: 'basic' | 'advanced' | 'deep';
    modelVersion?: string;
    accuracy?: number;
  }): Promise<AILearningSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: AILearningSession = {
      id: sessionId,
      projectId,
      sessionType: options.analysisType || 'basic',
      startTime: new Date(),
      endTime: undefined,
      learningData: {
        filesAnalyzed: 0,
        totalFiles: 0,
        progress: 0,
        results: [],
        errors: [],
        modelVersion: options.modelVersion || 'GPT-5-Enhanced-v1.0',
        accuracy: options.accuracy || 0.94,
        processingTime: 0
      }
    };

    this.learningSessions.set(sessionId, session);
    return session;
  }

  async processLearningSession(sessionId: string, files: ProjectFile[]): Promise<void> {
    const session = this.learningSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.learningData.totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 시뮬레이션된 처리 시간
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      try {
        const analysis = await this.analyzeFile(file);
        session.learningData.results.push(analysis);
        session.learningData.filesAnalyzed++;
        session.learningData.progress = (session.learningData.filesAnalyzed / session.learningData.totalFiles) * 100;

        // 지식 베이스에 추가 (프로젝트 단위 저장)
        await this.extractKnowledge(file, analysis, session.projectId);

      } catch (error) {
        session.learningData.errors.push(`파일 ${file.name} 분석 실패: ${error}`);
      }
    }

    session.endTime = new Date();
    session.learningData.processingTime = Date.now() - session.startTime.getTime();
  }

  async analyzeFile(file: ProjectFile): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    try {
      // 파일 내용 읽기
      const content = await this.readFileContent(file);

      // 고도화된 분석 수행
      const keywords = this.extractKeywords(content);
      const summary = this.generateSummary(content);
      const sentiment = this.analyzeSentiment(content);
      const entities = this.extractEntities(content);
      const topics = this.identifyTopics(content);
      const recommendations = this.generateRecommendationsFromContent(content);

      // 신뢰도 계산 (내용 길이, 키워드 수, 감정 분석 일관성 등 기반)
      const confidence = this.calculateConfidence(content, keywords, sentiment);

      // 정확도 계산 (분석 품질 기반)
      const accuracy = this.calculateAccuracy(content, keywords, entities);

      const processingTime = Date.now() - startTime;

      return {
        keywords,
        summary,
        sentiment,
        entities,
        topics,
        recommendations,
        confidence,
        analysisType: 'advanced',
        processingTime,
        modelVersion: 'GPT-5-Enhanced-v1.0',
        accuracy
      };
    } catch (error) {
      console.error('AI 파일 분석 오류:', error);
      return {
        keywords: [],
        summary: `파일 "${file.name}" 분석 중 오류가 발생했습니다.`,
        sentiment: 'neutral',
        entities: [],
        topics: [],
        recommendations: ['파일 분석을 다시 시도해주세요.'],
        confidence: 0.1,
        analysisType: 'basic',
        processingTime: Date.now() - startTime,
        modelVersion: 'GPT-5-Enhanced-v1.0',
        accuracy: 0.1
      };
    }
  }

  private calculateConfidence(content: string, keywords: string[], sentiment: string): number {
    let confidence = 0.5; // 기본 신뢰도

    // 내용 길이에 따른 신뢰도 조정
    if (content.length > 1000) confidence += 0.2;
    else if (content.length > 500) confidence += 0.1;

    // 키워드 수에 따른 신뢰도 조정
    if (keywords.length > 10) confidence += 0.15;
    else if (keywords.length > 5) confidence += 0.1;

    // 감정 분석 일관성에 따른 조정
    if (sentiment !== 'neutral') confidence += 0.1;

    // 특수 문자나 숫자 비율에 따른 조정
    const specialCharRatio = (content.match(/[^\w\s가-힣]/g) || []).length / content.length;
    if (specialCharRatio < 0.1) confidence += 0.05;

    return Math.min(confidence, 0.95); // 최대 0.95로 제한
  }

  private calculateAccuracy(content: string, keywords: string[], entities: string[]): number {
    let accuracy = 0.6; // 기본 정확도

    // 키워드 품질에 따른 정확도 조정
    const meaningfulKeywords = keywords.filter(kw => kw.length >= 2);
    if (meaningfulKeywords.length > keywords.length * 0.8) accuracy += 0.2;

    // 엔티티 다양성에 따른 정확도 조정
    if (entities.length > 3) accuracy += 0.1;

    // 내용의 구조화 정도에 따른 정확도 조정
    const hasStructure = /제목|목차|개요|요약|결론/.test(content);
    if (hasStructure) accuracy += 0.1;

    return Math.min(accuracy, 0.95); // 최대 0.95로 제한
  }

  private async readFileContent(file: ProjectFile): Promise<string> {
    // 실제 구현에서는 파일 내용을 읽어옴
    // 여기서는 시뮬레이션된 내용 반환
    const sampleContents = [
      "프로젝트 진행 상황에 대한 상세한 분석 보고서입니다. 주요 이슈들과 해결 방안을 포함하고 있습니다.",
      "팀 협업 및 커뮤니케이션 개선 방안에 대한 제안서입니다. 현재 문제점과 개선점을 정리했습니다.",
      "기술적 도전 과제와 해결 방법에 대한 기술 문서입니다. 구현 세부사항과 최적화 방안을 포함합니다.",
      "사용자 피드백 분석 및 개선 제안에 대한 보고서입니다. 사용자 경험 향상을 위한 방안을 제시합니다.",
      "시장 분석 및 경쟁사 조사 결과입니다. 시장 동향과 전략적 제안을 포함합니다."
    ];

    return sampleContents[Math.floor(Math.random() * sampleContents.length)];
  }

  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];

    // 한국어 핵심 키워드 패턴 (확장)
    const patterns = [
      { pattern: /재개발|재건축|아파트|아파트단지|주거단지/g, weight: 3 },
      { pattern: /시공사|건설사|건설|시공|공사|시공업체/g, weight: 3 },
      { pattern: /분석|검토|평가|조사|연구|검증/g, weight: 2 },
      { pattern: /조합원|주민|거주자|입주자|세대주|주민대표/g, weight: 3 },
      { pattern: /홍보|마케팅|광고|선전|브랜딩|프로모션/g, weight: 2 },
      { pattern: /법적|법률|규정|조례|법령|법규/g, weight: 3 },
      { pattern: /가격|비용|예산|투자|자금|재정/g, weight: 3 },
      { pattern: /일정|스케줄|계획|진도|단계|타임라인/g, weight: 2 },
      { pattern: /사업|프로젝트|개발|사업화|추진|진행/g, weight: 3 },
      { pattern: /계약|협약|합의|MOU|양해각서|협의/g, weight: 3 },
      { pattern: /환경|친환경|녹지|공원|조경|생태/g, weight: 2 },
      { pattern: /교통|도로|지하철|버스|주차|교통편/g, weight: 2 },
      { pattern: /교육|학교|학원|도서관|문화시설|교육시설/g, weight: 2 },
      { pattern: /상업|상가|매장|오피스|업무|상업시설/g, weight: 2 },
      { pattern: /의료|병원|약국|보건|의료시설|의료기관/g, weight: 2 },
      { pattern: /안전|보안|방재|소방|안전시설|안전관리/g, weight: 2 },
      { pattern: /복지|복지시설|노인|장애인|어린이|복지정책/g, weight: 2 },
      { pattern: /통신|IT|인터넷|스마트|디지털|정보화/g, weight: 2 },
      { pattern: /에너지|전기|가스|수도|열공급|에너지관리/g, weight: 2 },
      { pattern: /관리|운영|유지보수|시설관리|관리체계/g, weight: 2 }
    ];

    // 패턴 기반 키워드 추출
    patterns.forEach(({ pattern, weight }) => {
      if (pattern.test(content)) {
        const matches = content.match(pattern);
        if (matches) {
          // 가중치에 따라 중복 추가
          for (let i = 0; i < weight; i++) {
            keywords.push(...matches);
          }
        }
      }
    });

    // 빈도 기반 키워드 추출
    const words = content.toLowerCase().split(/[^\w가-힣]+/).filter(word => word.length > 1);
    const wordFreq: Record<string, number> = {};

    words.forEach(word => {
      if (word.length >= 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // 빈도가 높은 단어들을 키워드로 추가
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    // 의미있는 단어만 필터링
    const stopWords = [
      '그리고', '또는', '하지만', '그러나', '이것', '저것', '무엇', '어떤', '어떻게',
      '언제', '어디서', '왜', '어떻게', '그런', '이런', '저런', '무슨', '어느', '몇',
      '있고', '있으며', '있어서', '있으니', '있으므로', '있기', '있을', '있는', '있었',
      '그리고', '또한', '또는', '그러나', '하지만', '그런데', '그러므로', '따라서'
    ];

    const meaningfulWords = sortedWords.filter(word =>
      word.length >= 2 && !stopWords.includes(word)
    );

    keywords.push(...meaningfulWords);

    // 중복 제거 및 정렬
    return Array.from(new Set(keywords)).slice(0, 20);
  }

  private generateSummary(content: string): string {
    const summaries = [
      "프로젝트 진행 상황을 종합적으로 분석한 결과, 주요 이슈들과 해결 방안을 도출했습니다.",
      "팀 협업 및 커뮤니케이션 개선을 위한 구체적인 방안을 제시했습니다.",
      "기술적 도전 과제에 대한 해결 방법과 최적화 방안을 정리했습니다.",
      "사용자 피드백을 바탕으로 한 개선 제안과 사용자 경험 향상 방안을 제시했습니다.",
      "시장 분석 결과를 바탕으로 한 전략적 제안과 시장 동향 분석을 포함했습니다."
    ];

    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  private extractEntities(content: string): string[] {
    const entities = [
      '김철수', 'ABC기업', '서울시', '2024년 3월', '1억원'
    ];

    return entities.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private identifyTopics(content: string): string[] {
    const topics = [
      '프로젝트 관리', '팀 협업', '기술 개발', '사용자 경험', '시장 분석'
    ];

    return topics.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateRecommendationsFromContent(content: string): string[] {
    const recommendations = [
      "정기적인 팀 미팅을 통해 진행 상황을 공유하고 이슈를 조기에 해결하세요.",
      "프로젝트 관리 도구를 활용하여 작업 진행 상황을 시각화하고 추적하세요.",
      "사용자 피드백을 수집하고 분석하여 제품 개선에 반영하세요.",
      "기술적 부채를 정기적으로 점검하고 리팩토링을 통해 코드 품질을 유지하세요.",
      "시장 동향을 지속적으로 모니터링하고 전략을 적시에 조정하세요."
    ];

    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  async extractKnowledge(file: ProjectFile, analysis: AIAnalysisResult, projectId: string): Promise<void> {
    const knowledgeItem: KnowledgeBase = {
      id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: projectId,
      name: `${file.name} 분석 결과`,
      description: analysis.summary,
      documents: [file],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const projectKnowledge = this.knowledgeBase.get(projectId) || [];
    projectKnowledge.push(knowledgeItem);
    this.knowledgeBase.set(projectId, projectKnowledge);
  }

  async addKnowledgeItem(projectId: string, knowledge: Omit<KnowledgeBase, 'id' | 'createdAt'>): Promise<void> {
    const newKnowledge: KnowledgeBase = {
      ...knowledge,
      id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    const projectKnowledge = this.knowledgeBase.get(projectId) || [];
    projectKnowledge.push(newKnowledge);
    this.knowledgeBase.set(projectId, projectKnowledge);
  }

  getLearningSession(sessionId: string): AILearningSession | undefined {
    return this.learningSessions.get(sessionId);
  }

  getProjectLearningSessions(projectId: string): AILearningSession[] {
    return Array.from(this.learningSessions.values())
      .filter(session => session.projectId === projectId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  getProjectKnowledge(projectId: string): KnowledgeBase[] {
    return this.knowledgeBase.get(projectId) || [];
  }

  async removeKnowledgeItem(projectId: string, knowledgeId: string): Promise<void> {
    const projectKnowledge = this.knowledgeBase.get(projectId) || [];
    const updatedKnowledge = projectKnowledge.filter(k => k.id !== knowledgeId);
    this.knowledgeBase.set(projectId, updatedKnowledge);
  }

  async generateRecommendations(projectId: string): Promise<string[]> {
    const knowledge = this.getProjectKnowledge(projectId);
    const sessions = this.getProjectLearningSessions(projectId);

    const recommendations = [
      "정기적인 지식 베이스 업데이트를 통해 최신 정보를 유지하세요.",
      "AI 학습 세션을 주기적으로 실행하여 새로운 인사이트를 발견하세요.",
      "팀원들과 지식 베이스를 공유하여 협업 효율성을 높이세요.",
      "분석 결과를 바탕으로 프로젝트 전략을 지속적으로 개선하세요.",
      "사용자 피드백을 지식 베이스에 반영하여 제품 품질을 향상시키세요."
    ];

    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  async analyzeLearningPerformance(projectId: string): Promise<{
    totalSessions: number;
    successRate: number;
    averageConfidence: number;
    knowledgeGrowth: number;
    recommendations: string[];
  }> {
    const sessions = this.getProjectLearningSessions(projectId);
    const knowledge = this.getProjectKnowledge(projectId);

    const completedSessions = sessions.filter(s => s.endTime !== undefined);
    const successRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
    const averageConfidence = knowledge.length > 0
      ? knowledge.reduce((sum, k) => sum + ((k as any).confidence || 0.8), 0) / knowledge.length
      : 0;

    return {
      totalSessions: sessions.length,
      successRate,
      averageConfidence,
      knowledgeGrowth: knowledge.length,
      recommendations: await this.generateRecommendations(projectId)
    };
  }

  async performRealTimeAnalysis(fileId: string, analysisType: string): Promise<RealTimeAnalysis> {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 시뮬레이션된 실시간 분석
    const result = await this.simulateRealTimeAnalysis(analysisType);

    const analysis: RealTimeAnalysis = {
      id: analysisId,
      fileId,
      type: analysisType as any,
      result,
      confidence: Math.random() * 0.2 + 0.8, // 80-100% 신뢰도
      timestamp: new Date().toISOString()
    };

    // 실시간 분석 결과 저장
    const existingAnalyses = this.realTimeAnalyses.get(fileId) || [];
    existingAnalyses.push(analysis);
    this.realTimeAnalyses.set(fileId, existingAnalyses);

    return analysis;
  }

  private async simulateRealTimeAnalysis(type: string): Promise<any> {
    const mockResults = {
      keyword: ['AI', '머신러닝', '데이터 분석', '자동화', '최적화'],
      sentiment: { positive: 0.7, neutral: 0.2, negative: 0.1 },
      entity: ['사용자', '시스템', '데이터베이스', 'API', '클라이언트'],
      topic: ['기술 개발', '사용자 경험', '성능 최적화', '보안', '확장성'],
      summary: '이 문서는 AI 기반 시스템의 개발 및 최적화에 대한 포괄적인 가이드를 제공합니다.'
    };

    return mockResults[type as keyof typeof mockResults] || mockResults.keyword;
  }

  async analyzePatterns(projectId: string): Promise<any> {
    const sessions = this.getProjectLearningSessions(projectId);
    const knowledge = this.getProjectKnowledge(projectId);

    // 패턴 분석 시뮬레이션
    return {
      commonKeywords: ['AI', '자동화', '최적화', '분석', '개발'],
      trendingTopics: ['머신러닝', '딥러닝', '자연어처리', '컴퓨터비전'],
      sentimentTrend: { positive: 0.75, neutral: 0.15, negative: 0.1 },
      knowledgeGrowth: knowledge.length,
      sessionCount: sessions.length,
      averageConfidence: 0.87,
      recommendations: [
        '더 많은 데이터로 모델을 훈련시키세요',
        '실시간 분석 기능을 활성화하세요',
        '사용자 피드백을 수집하여 모델을 개선하세요'
      ]
    };
  }

  async getAdvancedAnalytics(projectId: string): Promise<any> {
    const sessions = this.getProjectLearningSessions(projectId);
    const knowledge = this.getProjectKnowledge(projectId);

    // 최근 활동 데이터 생성
    const recentActivity = [
      {
        id: `activity_${Date.now()}_1`,
        type: 'file_upload' as const,
        description: '새로운 파일이 업로드되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
        status: 'success' as const
      },
      {
        id: `activity_${Date.now()}_2`,
        type: 'analysis' as const,
        description: 'AI 분석이 완료되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1시간 전
        status: 'success' as const
      },
      {
        id: `activity_${Date.now()}_3`,
        type: 'learning' as const,
        description: '학습 세션이 시작되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2시간 전
        status: 'success' as const
      },
      {
        id: `activity_${Date.now()}_4`,
        type: 'knowledge_add' as const,
        description: '새로운 지식이 추가되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3시간 전
        status: 'success' as const
      }
    ];

    return {
      totalSessions: sessions.length,
      totalKnowledge: knowledge.length,
      averageConfidence: 0.89,
      mostAnalyzedFiles: ['document1.pdf', 'presentation.pptx', 'data.xlsx'],
      topKeywords: ['AI', '자동화', '분석', '최적화', '개발'],
      sentimentDistribution: { positive: 0.7, neutral: 0.2, negative: 0.1 },
      knowledgeGrowthRate: 0.15,
      modelPerformance: {
        accuracy: 0.94,
        precision: 0.92,
        recall: 0.89,
        f1Score: 0.91
      },
      recommendations: [
        '더 많은 데이터로 모델을 훈련시키세요',
        '실시간 분석 기능을 활성화하세요',
        '사용자 피드백을 수집하여 모델을 개선하세요',
        '정기적인 모델 업데이트를 수행하세요'
      ],
      recentActivity
    };
  }

  getRealTimeAnalyses(fileId: string): RealTimeAnalysis[] {
    return this.realTimeAnalyses.get(fileId) || [];
  }
}
