export interface MessageContext {
  type: 'analysis' | 'research' | 'writing' | 'coding' | 'design' | 'planning' | 'review' | 'synthesis';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  topics: string[];
  requirements: string[];
  constraints: string[];
  expectedOutput: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // 분 단위
  dependencies: string[];
  alternatives: string[];
}

export interface ProcessedMessage {
  originalMessage: string;
  context: MessageContext;
  tasks: Task[];
  summary: string;
  recommendations: string[];
  nextSteps: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: unknown;
}

class AdvancedMessageProcessor {
  private static instance: AdvancedMessageProcessor;
  private processingQueue: Map<string, ProcessedMessage> = new Map();

  private constructor() { }

  static getInstance(): AdvancedMessageProcessor {
    if (!AdvancedMessageProcessor.instance) {
      AdvancedMessageProcessor.instance = new AdvancedMessageProcessor();
    }
    return AdvancedMessageProcessor.instance;
  }

  // 메시지 분석 및 처리
  async processMessage(message: string, context?: MessageContext): Promise<ProcessedMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 컨텍스트 분석
    const analyzedContext = context || await this.analyzeContext(message);

    // 작업 분해
    const tasks = await this.decomposeTasks(message, analyzedContext);

    // 요약 생성
    const summary = await this.generateSummary(message, analyzedContext, tasks);

    // 권장사항 생성
    const recommendations = await this.generateRecommendations(analyzedContext, tasks);

    // 다음 단계 제안
    const nextSteps = await this.suggestNextSteps(analyzedContext, tasks);

    const processedMessage: ProcessedMessage = {
      originalMessage: message,
      context: analyzedContext,
      tasks,
      summary,
      recommendations,
      nextSteps
    };

    this.processingQueue.set(messageId, processedMessage);
    return processedMessage;
  }

  // 컨텍스트 분석
  private async analyzeContext(message: string): Promise<MessageContext> {
    // 복잡한 패턴 매칭
    const patterns = {
      analysis: /분석|검토|평가|조사|연구|탐구|비교|대조/gi,
      research: /연구|조사|탐구|수집|정리|분류|탐색|조사/gi,
      writing: /작성|글쓰기|문서|보고서|기사|에세이|논문|편집/gi,
      coding: /코딩|프로그래밍|개발|알고리즘|코드|함수|클래스|모듈/gi,
      design: /디자인|설계|레이아웃|UI|UX|인터페이스|시각화/gi,
      planning: /계획|전략|로드맵|일정|목표|방향|전략/gi,
      review: /검토|리뷰|평가|비평|토론|검증|확인/gi,
      synthesis: /종합|통합|요약|정리|결합|융합/gi
    };

    const complexity = {
      basic: /기초|간단|쉬운|기본|초급|입문/gi,
      intermediate: /중급|보통|일반|표준|평균/gi,
      advanced: /고급|심화|전문|고도화|심화/gi,
      expert: /전문가|박사|최고급|최첨단|최신/gi
    };

    // 타입 분석
    let detectedType = 'analysis';
    let maxMatches = 0;

    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = message.match(pattern)?.length || 0;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = type;
      }
    });

    // 복잡도 분석
    let detectedComplexity = 'intermediate';
    Object.entries(complexity).forEach(([level, pattern]) => {
      if (pattern.test(message)) {
        detectedComplexity = level;
      }
    });

    // 키워드 추출
    const keywords = message.match(/[가-힣a-zA-Z]+/g) || [];
    const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 15);

    // 요구사항 추출
    const requirements = message.match(/[가-힣a-zA-Z\s]+(?:해주세요|해주시면|부탁드립니다|요청합니다|필요합니다|원합니다)/g) || [];

    // 제약사항 추출
    const constraints = message.match(/(?:제한|제약|조건|범위|한계|제외|포함|시간|예산|기술)[가-힣a-zA-Z\s]*/g) || [];

    // 우선순위 분석
    const priority = this.analyzePriority(message, detectedComplexity);

    // 예상 시간 추정
    const estimatedTime = this.estimateTime(message, detectedComplexity, detectedType);

    // 의존성 분석
    const dependencies = this.analyzeDependencies(message);

    // 대안 분석
    const alternatives = this.analyzeAlternatives(message);

    return {
      type: detectedType as 'analysis' | 'research' | 'writing' | 'review' | 'coding' | 'planning' | 'design' | 'synthesis',
      complexity: detectedComplexity as 'basic' | 'intermediate' | 'advanced' | 'expert',
      topics: uniqueKeywords,
      requirements: requirements,
      constraints: constraints,
      expectedOutput: this.extractExpectedOutput(message),
      priority,
      estimatedTime,
      dependencies,
      alternatives
    };
  }

  // 작업 분해
  private async decomposeTasks(message: string, context: MessageContext): Promise<Task[]> {
    const tasks: Task[] = [];
    const taskId = `task_${Date.now()}`;

    // 메인 작업
    tasks.push({
      id: `${taskId}_main`,
      title: `${context.type} 작업 수행`,
      description: `사용자 요청에 따른 ${context.type} 작업을 수행합니다.`,
      type: context.type,
      priority: context.priority,
      estimatedTime: context.estimatedTime,
      dependencies: [],
      status: 'pending'
    });

    // 세부 작업들
    if (context.requirements.length > 0) {
      context.requirements.forEach((req, index) => {
        tasks.push({
          id: `${taskId}_req_${index}`,
          title: `요구사항 처리: ${req}`,
          description: `사용자가 요청한 "${req}" 요구사항을 처리합니다.`,
          type: 'requirement',
          priority: context.priority,
          estimatedTime: Math.ceil(context.estimatedTime / context.requirements.length),
          dependencies: [`${taskId}_main`],
          status: 'pending'
        });
      });
    }

    // 제약사항 처리
    if (context.constraints.length > 0) {
      context.constraints.forEach((constraint, index) => {
        tasks.push({
          id: `${taskId}_constraint_${index}`,
          title: `제약사항 확인: ${constraint}`,
          description: `제약사항 "${constraint}"을 고려하여 작업을 수행합니다.`,
          type: 'constraint',
          priority: 'high',
          estimatedTime: 5,
          dependencies: [`${taskId}_main`],
          status: 'pending'
        });
      });
    }

    // 복잡도별 추가 작업
    if (context.complexity === 'expert') {
      tasks.push({
        id: `${taskId}_research`,
        title: '최신 연구 및 트렌드 조사',
        description: '관련 분야의 최신 연구와 트렌드를 조사합니다.',
        type: 'research',
        priority: 'medium',
        estimatedTime: 15,
        dependencies: [`${taskId}_main`],
        status: 'pending'
      });
    }

    return tasks;
  }

  // 요약 생성
  private async generateSummary(message: string, context: MessageContext, tasks: Task[]): Promise<string> {
    const taskCount = tasks.length;
    const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);

    return `사용자의 요청을 분석한 결과, ${context.type} 작업이 필요합니다. 
    복잡도는 ${context.complexity} 수준이며, 총 ${taskCount}개의 세부 작업으로 구성됩니다. 
    예상 소요 시간은 ${totalTime}분이며, ${context.topics.length}개의 주요 키워드가 식별되었습니다. 
    ${context.requirements.length}개의 요구사항과 ${context.constraints.length}개의 제약사항이 확인되었습니다.`;
  }

  // 권장사항 생성
  private async generateRecommendations(context: MessageContext, _tasks: Task[]): Promise<string[]> {
    const recommendations: string[] = [];

    // 복잡도별 권장사항
    switch (context.complexity) {
      case 'basic':
        recommendations.push('기초 개념부터 단계별로 설명하여 이해도를 높이세요');
        recommendations.push('실용적인 예시와 함께 설명하여 적용 가능성을 높이세요');
        break;
      case 'intermediate':
        recommendations.push('이론과 실무를 연결하여 실용적인 관점을 제공하세요');
        recommendations.push('다양한 접근 방법을 제시하여 선택의 폭을 넓히세요');
        break;
      case 'advanced':
        recommendations.push('전문적인 용어와 고급 개념을 포함하여 깊이 있는 분석을 제공하세요');
        recommendations.push('최신 동향과 트렌드를 반영하여 시의성을 확보하세요');
        break;
      case 'expert':
        recommendations.push('최신 연구 결과와 전문가 의견을 종합하여 최고 수준의 분석을 제공하세요');
        recommendations.push('다양한 관점과 대안을 제시하여 포괄적인 시각을 제공하세요');
        break;
    }

    // 타입별 권장사항
    switch (context.type) {
      case 'analysis':
        recommendations.push('분석 기준과 평가 지표를 명확히 하여 객관성을 확보하세요');
        recommendations.push('비교 대상이나 참고 자료를 포함하여 맥락을 제공하세요');
        break;
      case 'research':
        recommendations.push('연구 범위와 기간을 구체화하여 실현 가능성을 높이세요');
        recommendations.push('참고 자료와 출처를 명시하여 신뢰성을 확보하세요');
        break;
      case 'writing':
        recommendations.push('글의 목적과 대상 독자를 명확히 하여 효과적인 커뮤니케이션을 하세요');
        recommendations.push('글의 길이와 스타일을 지정하여 일관성을 유지하세요');
        break;
      case 'coding':
        recommendations.push('프로그래밍 언어와 프레임워크를 명시하여 구체적인 구현 방향을 제시하세요');
        recommendations.push('입력과 출력 형식을 구체화하여 명확한 요구사항을 정의하세요');
        break;
    }

    return recommendations;
  }

  // 다음 단계 제안
  private async suggestNextSteps(context: MessageContext, _tasks: Task[]): Promise<string[]> {
    const nextSteps: string[] = [];

    // 우선순위별 다음 단계
    if (context.priority === 'urgent') {
      nextSteps.push('즉시 실행 가능한 핵심 작업부터 시작하세요');
      nextSteps.push('중간 결과를 빠르게 확인하여 방향을 조정하세요');
    } else {
      nextSteps.push('전체 계획을 수립한 후 단계별로 진행하세요');
      nextSteps.push('각 단계의 완료도를 정기적으로 점검하세요');
    }

    // 복잡도별 다음 단계
    if (context.complexity === 'expert') {
      nextSteps.push('전문가 자문을 구하여 품질을 보장하세요');
      nextSteps.push('최신 연구 결과를 지속적으로 모니터링하세요');
    }

    // 타입별 다음 단계
    switch (context.type) {
      case 'analysis':
        nextSteps.push('분석 결과를 시각화하여 이해도를 높이세요');
        nextSteps.push('분석 결과를 바탕으로 실용적인 제안을 제시하세요');
        break;
      case 'research':
        nextSteps.push('연구 결과를 체계적으로 정리하여 문서화하세요');
        nextSteps.push('연구 결과를 바탕으로 향후 연구 방향을 제시하세요');
        break;
      case 'writing':
        nextSteps.push('작성된 내용을 검토하고 피드백을 반영하세요');
        nextSteps.push('독자 반응을 모니터링하여 개선점을 파악하세요');
        break;
      case 'coding':
        nextSteps.push('코드 리뷰를 통해 품질을 보장하세요');
        nextSteps.push('테스트를 통해 기능의 정확성을 검증하세요');
        break;
    }

    return nextSteps;
  }

  // 우선순위 분석
  private analyzePriority(message: string, complexity: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentKeywords = /긴급|시급|즉시|바로|당장|마감|데드라인|deadline/gi;
    const highKeywords = /중요|핵심|필수|반드시|꼭/gi;
    const mediumKeywords = /보통|일반|평균/gi;

    if (urgentKeywords.test(message)) return 'urgent';
    if (highKeywords.test(message)) return 'high';
    if (mediumKeywords.test(message)) return 'medium';
    if (complexity === 'expert') return 'high';
    return 'medium';
  }

  // 예상 시간 추정
  private estimateTime(message: string, complexity: string, type: string): number {
    let baseTime = 10; // 기본 10분

    // 복잡도별 시간 조정
    switch (complexity) {
      case 'basic': baseTime *= 0.5; break;
      case 'intermediate': baseTime *= 1; break;
      case 'advanced': baseTime *= 2; break;
      case 'expert': baseTime *= 3; break;
    }

    // 타입별 시간 조정
    switch (type) {
      case 'analysis': baseTime *= 1.2; break;
      case 'research': baseTime *= 1.5; break;
      case 'writing': baseTime *= 1.3; break;
      case 'coding': baseTime *= 1.4; break;
      case 'design': baseTime *= 1.6; break;
      case 'planning': baseTime *= 1.1; break;
      case 'review': baseTime *= 0.8; break;
      case 'synthesis': baseTime *= 1.7; break;
    }

    // 메시지 길이에 따른 조정
    if (message.length > 1000) baseTime *= 1.5;
    if (message.length > 2000) baseTime *= 2;

    return Math.ceil(baseTime);
  }

  // 의존성 분석
  private analyzeDependencies(message: string): string[] {
    const dependencies: string[] = [];

    if (/참고|참조|출처|문헌|자료/gi.test(message)) {
      dependencies.push('참고 자료 수집');
    }

    if (/검증|확인|테스트|검사/gi.test(message)) {
      dependencies.push('검증 과정');
    }

    if (/승인|검토|리뷰/gi.test(message)) {
      dependencies.push('승인 절차');
    }

    return dependencies;
  }

  // 대안 분석
  private analyzeAlternatives(message: string): string[] {
    const alternatives: string[] = [];

    if (/또는|혹은|대안|대체/gi.test(message)) {
      alternatives.push('대안적 접근 방법');
    }

    if (/비교|대조/gi.test(message)) {
      alternatives.push('비교 분석');
    }

    if (/최적화|개선/gi.test(message)) {
      alternatives.push('최적화 방안');
    }

    return alternatives;
  }

  // 예상 출력 형태 추출
  private extractExpectedOutput(message: string): string {
    const outputPatterns = [
      /(?:형태|형식|스타일|방식|구조|틀|템플릿)[가-힣a-zA-Z\s]*/g,
      /(?:표|차트|그래프|목록|요약|정리|분류)/g,
      /(?:코드|함수|클래스|모듈|알고리즘)/g,
      /(?:보고서|문서|기사|논문|에세이)/g
    ];

    for (const pattern of outputPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '일반적인 형태';
  }

  // 처리된 메시지 조회
  getProcessedMessage(messageId: string): ProcessedMessage | null {
    return this.processingQueue.get(messageId) || null;
  }

  // 모든 처리된 메시지 조회
  getAllProcessedMessages(): ProcessedMessage[] {
    return Array.from(this.processingQueue.values());
  }

  // 처리된 메시지 삭제
  removeProcessedMessage(messageId: string): boolean {
    return this.processingQueue.delete(messageId);
  }
}

export default AdvancedMessageProcessor;
