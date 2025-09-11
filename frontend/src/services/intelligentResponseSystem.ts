export interface IntelligentContext {
  userMessage: string;
  conversationHistory: any[];
  uploadedFiles: any[];
  userPreferences: any;
  projectContext: any;
  detectedIntent: string;
  detectedEmotion: string;
  confidence: number;
  suggestedActions: string[];
}

export interface SmartResponse {
  mainResponse: string;
  detailedAnswers: DetailedAnswer[];
  followUpQuestions: string[];
  suggestedActions: string[];
  relatedTopics: string[];
  confidence: number;
  responseType: 'direct' | 'exploratory' | 'suggestive' | 'comprehensive';
}

export interface DetailedAnswer {
  question: string;
  answer: string;
  confidence: number;
  source?: string;
  relatedInfo?: string[];
}

class IntelligentResponseSystem {
  private static instance: IntelligentResponseSystem;
  private contextMemory: Map<string, any> = new Map();
  private userPatterns: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): IntelligentResponseSystem {
    if (!IntelligentResponseSystem.instance) {
      IntelligentResponseSystem.instance = new IntelligentResponseSystem();
    }
    return IntelligentResponseSystem.instance;
  }

  // 메인 응답 생성
  async generateSmartResponse(userMessage: string, context: any): Promise<SmartResponse> {
    // 1. 컨텍스트 분석
    const intelligentContext = await this.analyzeIntelligentContext(userMessage, context);
    
    // 2. 의도 파악
    const intent = this.detectIntent(userMessage, intelligentContext);
    
    // 3. 감정 분석
    const emotion = this.analyzeEmotion(userMessage);
    
    // 4. 숨겨진 요구사항 추출
    const hiddenRequirements = this.extractHiddenRequirements(userMessage, intelligentContext);
    
    // 5. 메인 응답 생성
    const mainResponse = await this.generateMainResponse(userMessage, intent, emotion, hiddenRequirements, intelligentContext);
    
    // 6. 상세 답변 생성
    const detailedAnswers = await this.generateDetailedAnswers(hiddenRequirements, intelligentContext);
    
    // 7. 후속 질문 생성
    const followUpQuestions = this.generateFollowUpQuestions(intent, hiddenRequirements, intelligentContext);
    
    // 8. 제안 액션 생성
    const suggestedActions = this.generateSuggestedActions(intent, hiddenRequirements, intelligentContext);
    
    // 9. 관련 주제 추천
    const relatedTopics = this.suggestRelatedTopics(intent, hiddenRequirements, intelligentContext);
    
    // 10. 신뢰도 계산
    const confidence = this.calculateConfidence(intent, hiddenRequirements.length, intelligentContext.confidence);

    return {
      mainResponse,
      detailedAnswers,
      followUpQuestions,
      suggestedActions,
      relatedTopics,
      confidence,
      responseType: this.determineResponseType(intent, hiddenRequirements.length, confidence)
    };
  }

  // 지능형 컨텍스트 분석
  private async analyzeIntelligentContext(message: string, context: any): Promise<IntelligentContext> {
    const conversationHistory = context.conversationHistory || [];
    const uploadedFiles = context.uploadedFiles || [];
    const userPreferences = this.extractUserPreferences(conversationHistory);
    const projectContext = context.projectContext || {};
    
    // 의도 파악
    const detectedIntent = this.detectIntent(message, { conversationHistory, uploadedFiles });
    
    // 감정 분석
    const detectedEmotion = this.analyzeEmotion(message);
    
    // 신뢰도 계산
    const confidence = this.calculateContextConfidence(message, conversationHistory, uploadedFiles);
    
    // 제안 액션
    const suggestedActions = this.generateContextualActions(message, detectedIntent, detectedEmotion);

    return {
      userMessage: message,
      conversationHistory,
      uploadedFiles,
      userPreferences,
      projectContext,
      detectedIntent,
      detectedEmotion,
      confidence,
      suggestedActions
    };
  }

  // 의도 파악 (자연스러운 표현 포함)
  private detectIntent(message: string, context: any): string {
    const message_lower = message.toLowerCase();
    
    // 다양한 표현 패턴 매칭
    const intentPatterns = {
      // 정보 요청 (직접적 + 간접적)
      information: [
        /알려주세요|알고싶습니다|무엇인가요|어떤가요|뭐예요|뭔가요/gi,
        /궁금해요|궁금합니다|모르겠어요|모르겠습니다/gi,
        /이게 뭐야|이건 뭐지|뭐하는 거야/gi,
        /설명해주세요|이해하고싶어요|왜 그런가요/gi
      ],
      
      // 분석 요청 (구체적 + 추상적)
      analysis: [
        /분석해주세요|검토해주세요|평가해주세요|조사해주세요/gi,
        /어떻게 보세요|어떤 것 같아요|생각해보세요/gi,
        /좋은가요|나쁜가요|괜찮은가요/gi,
        /문제가 있나요|개선점이 있나요/gi
      ],
      
      // 생성 요청 (명시적 + 암시적)
      creation: [
        /만들어주세요|작성해주세요|생성해주세요|해주세요/gi,
        /좋은 아이디어 없어요|방법이 있을까요/gi,
        /어떻게 하면 좋을까요|어떤 방법이 있을까요/gi,
        /제안해주세요|추천해주세요/gi
      ],
      
      // 비교 요청
      comparison: [
        /비교해주세요|대조해주세요|차이점이 뭔가요/gi,
        /어떤 게 좋을까요|어떤 걸 선택해야 할까요/gi,
        /A와 B 중에 뭐가 나을까요/gi,
        /더 나은 건 뭔가요/gi
      ],
      
      // 문제 해결
      problem_solving: [
        /문제가 있어요|어려움이 있어요|고민이 있어요/gi,
        /해결방법이 있을까요|어떻게 해결할까요/gi,
        /도움이 필요해요|조언해주세요/gi,
        /막혔어요|안 되고 있어요/gi
      ],
      
      // 감정적 표현
      emotional: [
        /짜증나요|화나요|답답해요|힘들어요/gi,
        /좋아요|재미있어요|신기해요|감동이에요/gi,
        /무서워요|걱정이에요|불안해요/gi,
        /기뻐요|행복해요|만족해요/gi
      ],
      
      // 일상적 대화
      casual: [
        /안녕하세요|반갑습니다|그래요|네/gi,
        /오늘 날씨가|요즘 어떻게 지내세요/gi,
        /재미있는 이야기|흥미로운 주제/gi
      ]
    };

    // 각 의도별 점수 계산
    const intentScores: { [key: string]: number } = {};
    
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = message_lower.match(pattern);
        if (matches) {
          score += matches.length;
        }
      });
      intentScores[intent] = score;
    });

    // 가장 높은 점수의 의도 반환
    const maxIntent = Object.entries(intentScores).reduce((max, [intent, score]) => 
      score > max[1] ? [intent, score] : max, ['information', 0]
    );

    return maxIntent[0];
  }

  // 감정 분석
  private analyzeEmotion(message: string): string {
    const emotionPatterns = {
      positive: [
        /좋아요|좋습니다|재미있어요|신기해요|감동이에요|기뻐요|행복해요|만족해요/gi,
        /👍|😊|😄|😍|🎉|💪|✨/g
      ],
      negative: [
        /짜증나요|화나요|답답해요|힘들어요|어려워요|복잡해요|지겨워요/gi,
        /😡|😤|😰|😭|😞|😩|💔/g
      ],
      anxious: [
        /무서워요|걱정이에요|불안해요|긴장돼요|떨려요|두려워요/gi,
        /😨|😰|😱|😥|😓|😵/g
      ],
      neutral: [
        /그래요|네|알겠어요|괜찮아요|보통이에요|그럴 수 있어요/gi,
        /😐|🤔|😶|😑|😯/g
      ]
    };

    const emotionScores: { [key: string]: number } = {};
    
    Object.entries(emotionPatterns).forEach(([emotion, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = message.match(pattern);
        if (matches) {
          score += matches.length;
        }
      });
      emotionScores[emotion] = score;
    });

    const maxEmotion = Object.entries(emotionScores).reduce((max, [emotion, score]) => 
      score > max[1] ? [emotion, score] : max, ['neutral', 0]
    );

    return maxEmotion[0];
  }

  // 숨겨진 요구사항 추출
  private extractHiddenRequirements(message: string, context: IntelligentContext): string[] {
    const requirements: string[] = [];
    
    // 1. 간접적 요청 패턴
    const indirectPatterns = [
      /(?:좋은|나쁜|괜찮은|적절한|효과적인|효율적인)\s*[가-힣a-zA-Z\s]+(?:가|이|을|를|에|에서)/g,
      /(?:어떻게|왜|언제|어디서|무엇을|어떤)\s*[가-힣a-zA-Z\s]+(?:할까요|해야 할까요|하면 좋을까요)/g,
      /(?:도움이|필요가|궁금한|모르는|알고 싶은)\s*[가-힣a-zA-Z\s]+/g,
      /(?:문제가|어려움이|고민이|막힌|안 되는)\s*[가-힣a-zA-Z\s]+/g
    ];

    indirectPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        requirements.push(...matches.map(match => `"${match}"에 대한 정보나 해결책`));
      }
    });

    // 2. 감정적 표현에서 추출
    const emotionalRequirements = this.extractEmotionalRequirements(message, context.detectedEmotion);
    requirements.push(...emotionalRequirements);

    // 3. 컨텍스트 기반 추출
    const contextualRequirements = this.extractContextualRequirements(message, context);
    requirements.push(...contextualRequirements);

    // 4. 암시적 요청 추출
    const implicitRequirements = this.extractImplicitRequirements(message, context);
    requirements.push(...implicitRequirements);

    return Array.from(new Set(requirements)).filter(req => req.length > 0);
  }

  // 감정적 요구사항 추출
  private extractEmotionalRequirements(message: string, emotion: string): string[] {
    const requirements: string[] = [];
    
    switch (emotion) {
      case 'negative':
        requirements.push('스트레스 해소 방법', '문제 해결 방안', '개선점 제안');
        break;
      case 'anxious':
        requirements.push('안심할 수 있는 정보', '확실한 답변', '구체적인 해결책');
        break;
      case 'positive':
        requirements.push('더 나은 방법', '개선 아이디어', '다음 단계 제안');
        break;
    }

    return requirements;
  }

  // 컨텍스트 기반 요구사항 추출
  private extractContextualRequirements(message: string, context: IntelligentContext): string[] {
    const requirements: string[] = [];
    
    // 대화 히스토리 기반
    if (context.conversationHistory.length > 0) {
      const recentTopics = context.conversationHistory.slice(-3).flatMap(msg => msg.topics || []);
      if (recentTopics.length > 0) {
        requirements.push(`이전 대화 주제 "${recentTopics[0]}"에 대한 추가 정보`);
      }
    }

    // 업로드된 파일 기반
    if (context.uploadedFiles.length > 0) {
      const fileTypes = context.uploadedFiles.map(file => file.type);
      if (fileTypes.some(type => type.includes('image'))) {
        requirements.push('이미지 분석 결과 활용');
      }
      if (fileTypes.some(type => type.includes('document'))) {
        requirements.push('문서 내용 기반 답변');
      }
    }

    return requirements;
  }

  // 암시적 요구사항 추출
  private extractImplicitRequirements(message: string, context: IntelligentContext): string[] {
    const requirements: string[] = [];
    
    // 질문 형태에서 추출
    if (message.includes('?')) {
      const questionParts = message.split('?');
      questionParts.forEach(part => {
        if (part.trim().length > 0) {
          requirements.push(`"${part.trim()}"에 대한 답변`);
        }
      });
    }

    // 부정문에서 추출
    if (/안|못|없|아니/.test(message)) {
      requirements.push('대안적 해결책', '다른 접근 방법');
    }

    // 비교 표현에서 추출
    if (/보다|더|가장|최고|최적/.test(message)) {
      requirements.push('비교 분석', '최적화 방안');
    }

    return requirements;
  }

  // 메인 응답 생성
  private async generateMainResponse(
    message: string, 
    intent: string, 
    emotion: string, 
    hiddenRequirements: string[], 
    context: IntelligentContext
  ): Promise<string> {
    let response = '';

    // 감정에 따른 인사
    response += this.generateEmotionalGreeting(emotion);
    
    // 의도에 따른 메인 응답
    response += await this.generateIntentBasedResponse(intent, message, context);
    
    // 숨겨진 요구사항에 대한 언급
    if (hiddenRequirements.length > 0) {
      response += this.generateHiddenRequirementsResponse(hiddenRequirements);
    }
    
    // 자연스러운 마무리
    response += this.generateNaturalClosing(intent, emotion);

    return response;
  }

  // 감정 기반 인사
  private generateEmotionalGreeting(emotion: string): string {
    switch (emotion) {
      case 'positive':
        return '안녕하세요! 좋은 기분이신 것 같네요 😊 ';
      case 'negative':
        return '안녕하세요. 답답하신 것 같아서 걱정이네요 😔 ';
      case 'anxious':
        return '안녕하세요. 걱정이 많으신 것 같아요. 편하게 말씀해 주세요 😌 ';
      default:
        return '안녕하세요! ';
    }
  }

  // 의도 기반 응답 생성
  private async generateIntentBasedResponse(intent: string, message: string, context: IntelligentContext): Promise<string> {
    switch (intent) {
      case 'information':
        return await this.generateInformationResponse(message, context);
      case 'analysis':
        return await this.generateAnalysisResponse(message, context);
      case 'creation':
        return await this.generateCreationResponse(message, context);
      case 'comparison':
        return await this.generateComparisonResponse(message, context);
      case 'problem_solving':
        return await this.generateProblemSolvingResponse(message, context);
      case 'emotional':
        return await this.generateEmotionalResponse(message, context);
      case 'casual':
        return await this.generateCasualResponse(message, context);
      default:
        return await this.generateGeneralResponse(message, context);
    }
  }

  // 정보 요청 응답
  private async generateInformationResponse(message: string, context: IntelligentContext): Promise<string> {
    return `말씀해 주신 내용에 대해 자세히 알아보겠습니다. 
    
제가 이해한 바로는 ${this.extractKeyPoints(message)}에 대해 궁금해 하시는 것 같아요.

이 주제에 대해 다음과 같은 정보를 제공해 드릴 수 있습니다:

📚 **기본 정보**: 핵심 개념과 정의
🔍 **상세 분석**: 깊이 있는 설명과 예시
💡 **실용적 조언**: 실제 적용 가능한 팁
📈 **최신 동향**: 관련된 최신 정보나 트렌드

어떤 부분이 가장 궁금하신지, 또는 특별히 알고 싶으신 부분이 있으시면 말씀해 주세요!`;
  }

  // 분석 요청 응답
  private async generateAnalysisResponse(message: string, context: IntelligentContext): Promise<string> {
    return `좋은 질문이네요! ${this.extractKeyPoints(message)}에 대해 체계적으로 분석해 보겠습니다.

분석을 위해 다음과 같은 관점에서 살펴보겠습니다:

🔍 **현재 상황 분석**: 현재 상태와 특징
📊 **데이터 기반 평가**: 객관적인 지표와 수치
⚖️ **장단점 비교**: 긍정적/부정적 측면
🎯 **개선 방안**: 더 나은 결과를 위한 제안

분석 결과를 바탕으로 구체적인 답변과 실용적인 제안을 드리겠습니다. 
혹시 특별히 중점을 두고 싶으신 부분이나 관심 있는 측면이 있으시면 알려주세요!`;
  }

  // 생성 요청 응답
  private async generateCreationResponse(message: string, context: IntelligentContext): Promise<string> {
    return `네, ${this.extractKeyPoints(message)}에 대한 아이디어나 방안을 함께 생각해 보겠습니다!

다음과 같은 접근 방법으로 도움을 드릴 수 있습니다:

💡 **창의적 아이디어**: 새로운 관점과 혁신적 접근
📝 **구체적 방안**: 실현 가능한 단계별 계획
🛠️ **실용적 도구**: 활용할 수 있는 방법과 도구
🎨 **다양한 옵션**: 여러 가지 대안과 선택지

어떤 스타일이나 방향으로 도움을 드리면 좋을지, 또는 특별히 고려하고 싶으신 조건이 있으시면 말씀해 주세요!`;
  }

  // 비교 요청 응답
  private async generateComparisonResponse(message: string, context: IntelligentContext): Promise<string> {
    return `좋은 질문입니다! ${this.extractKeyPoints(message)}에 대한 비교 분석을 해보겠습니다.

다음과 같은 기준으로 체계적으로 비교해 보겠습니다:

📊 **객관적 지표**: 수치화 가능한 비교 요소
💡 **주관적 평가**: 사용자 경험과 만족도
⏰ **시간적 관점**: 단기/장기 효과 비교
💰 **비용 효율성**: 투자 대비 성과 분석

비교 결과를 바탕으로 상황에 맞는 최적의 선택을 도와드리겠습니다.
혹시 특별히 중점을 두고 싶으신 비교 기준이나 관심 있는 측면이 있으시면 알려주세요!`;
  }

  // 문제 해결 응답
  private async generateProblemSolvingResponse(message: string, context: IntelligentContext): Promise<string> {
    return `아, ${this.extractKeyPoints(message)}에 대한 어려움이 있으시군요. 걱정하지 마세요, 함께 해결해 보겠습니다!

문제 해결을 위해 다음과 같은 단계로 접근해 보겠습니다:

🔍 **문제 진단**: 현재 상황과 원인 분석
💡 **해결 방안**: 다양한 대안과 방법
📋 **실행 계획**: 구체적인 단계별 가이드
✅ **검증 방법**: 결과 확인과 개선 방안

어떤 부분에서 가장 어려움을 겪고 계신지, 또는 이미 시도해 보신 방법이 있다면 알려주세요. 
더 구체적이고 실용적인 해결책을 제시해 드리겠습니다!`;
  }

  // 감정적 응답
  private async generateEmotionalResponse(message: string, context: IntelligentContext): Promise<string> {
    return `그런 마음이 드시는군요. ${this.extractKeyPoints(message)}에 대한 감정을 이해합니다.

감정에 따라 다음과 같은 도움을 드릴 수 있습니다:

😊 **긍정적 감정**: 더 나은 결과를 위한 발전 방안
😔 **부정적 감정**: 스트레스 해소와 개선 방법
😰 **불안한 감정**: 안심할 수 있는 정보와 대안
🤔 **중립적 감정**: 객관적 관점과 균형잡힌 조언

감정 상태에 맞는 따뜻한 조언과 실용적인 해결책을 제공해 드리겠습니다.
편하게 말씀해 주세요!`;
  }

  // 일상적 대화 응답
  private async generateCasualResponse(message: string, context: IntelligentContext): Promise<string> {
    return `안녕하세요! 반갑습니다 😊

${this.extractKeyPoints(message)}에 대해 이야기해 주셨네요.

일상적인 대화를 통해 다음과 같은 도움을 드릴 수 있습니다:

💬 **자연스러운 대화**: 편안한 소통과 정보 교환
🎯 **관심사 파악**: 궁금한 주제나 관심 분야 탐색
💡 **가벼운 조언**: 일상적인 문제에 대한 간단한 제안
📚 **흥미로운 정보**: 재미있고 유용한 정보 공유

편하게 대화하시면서 궁금한 점이나 도움이 필요한 부분이 있으시면 언제든 말씀해 주세요!`;
  }

  // 일반 응답
  private async generateGeneralResponse(message: string, context: IntelligentContext): Promise<string> {
    return `안녕하세요! ${this.extractKeyPoints(message)}에 대해 말씀해 주셨네요.

제가 도움을 드릴 수 있는 방법은 다음과 같습니다:

📚 **정보 제공**: 궁금한 내용에 대한 자세한 설명
🔍 **분석 및 검토**: 객관적인 평가와 인사이트
💡 **아이디어 제안**: 창의적인 해결방안과 대안
🛠️ **실용적 도움**: 구체적인 방법과 가이드

어떤 부분에서 도움이 필요하신지, 또는 특별히 궁금한 점이 있으시면 편하게 말씀해 주세요!`;
  }

  // 숨겨진 요구사항 응답
  private generateHiddenRequirementsResponse(requirements: string[]): string {
    if (requirements.length === 0) return '';

    return `

추가로, 말씀해 주신 내용에서 다음과 같은 부분들도 도움이 필요하실 것 같아요:

${requirements.map((req, index) => `${index + 1}. ${req}`).join('\n')}

이 부분들에 대해서도 함께 도움을 드릴 수 있습니다. 
특별히 궁금하신 부분이나 더 자세히 알고 싶으신 내용이 있으시면 언제든 말씀해 주세요!`;
  }

  // 자연스러운 마무리
  private generateNaturalClosing(intent: string, emotion: string): string {
    const closings = {
      information: '더 궁금한 점이 있으시면 언제든 물어보세요!',
      analysis: '분석 결과에 대해 추가 질문이 있으시면 말씀해 주세요!',
      creation: '아이디어나 방안에 대해 더 논의하고 싶으시면 언제든 연락주세요!',
      comparison: '비교 결과에 대해 더 자세히 알고 싶으신 부분이 있으시면 말씀해 주세요!',
      problem_solving: '문제 해결 과정에서 추가 도움이 필요하시면 언제든 말씀해 주세요!',
      emotional: '감정적으로 어려운 부분이 있으시면 언제든 이야기해 주세요!',
      casual: '편하게 대화하시면서 궁금한 점이 있으시면 언제든 물어보세요!'
    };

    return `\n\n${closings[intent as keyof typeof closings] || '도움이 필요하시면 언제든 말씀해 주세요!'}`;
  }

  // 상세 답변 생성
  private async generateDetailedAnswers(requirements: string[], context: IntelligentContext): Promise<DetailedAnswer[]> {
    const answers: DetailedAnswer[] = [];

    for (const requirement of requirements) {
      const answer = await this.generateSingleDetailedAnswer(requirement, context);
      answers.push(answer);
    }

    return answers;
  }

  // 단일 상세 답변 생성
  private async generateSingleDetailedAnswer(requirement: string, context: IntelligentContext): Promise<DetailedAnswer> {
    // 실제 구현에서는 AI 모델을 사용하여 답변 생성
    const answer = `"${requirement}"에 대한 상세한 답변입니다.

이 요구사항에 대해 다음과 같은 정보를 제공해 드릴 수 있습니다:

📋 **기본 정보**: 핵심 개념과 정의
🔍 **상세 분석**: 깊이 있는 설명과 예시
💡 **실용적 조언**: 실제 적용 가능한 팁
📈 **최신 동향**: 관련된 최신 정보나 트렌드

더 구체적인 정보나 특정 부분에 대해 궁금하신 점이 있으시면 언제든 말씀해 주세요!`;

    return {
      question: requirement,
      answer,
      confidence: 0.85,
      source: 'AI 분석 결과',
      relatedInfo: ['관련 주제 1', '관련 주제 2', '관련 주제 3']
    };
  }

  // 후속 질문 생성
  private generateFollowUpQuestions(intent: string, requirements: string[], context: IntelligentContext): string[] {
    const questions: string[] = [];

    switch (intent) {
      case 'information':
        questions.push('이 정보를 어떻게 활용하고 싶으신가요?');
        questions.push('특별히 궁금한 부분이 있으시면 말씀해 주세요.');
        questions.push('관련된 다른 주제도 궁금하신가요?');
        break;
      case 'analysis':
        questions.push('분석 결과에 대해 더 자세히 알고 싶은 부분이 있나요?');
        questions.push('특정 관점에서의 분석이 필요하신가요?');
        questions.push('분석 결과를 바탕으로 다음 단계는 어떻게 진행하고 싶으신가요?');
        break;
      case 'creation':
        questions.push('생성된 아이디어 중에서 가장 마음에 드는 것은 무엇인가요?');
        questions.push('더 구체적으로 발전시키고 싶은 부분이 있나요?');
        questions.push('실제로 적용해보고 싶은 방안이 있으신가요?');
        break;
      case 'comparison':
        questions.push('비교 결과 중에서 가장 중요한 기준은 무엇인가요?');
        questions.push('특정 상황에 맞는 선택을 도와드릴까요?');
        questions.push('비교 결과를 바탕으로 결정하신 후 다음 단계는 어떻게 진행하고 싶으신가요?');
        break;
      case 'problem_solving':
        questions.push('제안된 해결책 중에서 시도해보고 싶은 방법이 있나요?');
        questions.push('문제 해결 과정에서 추가로 어려운 부분이 있으신가요?');
        questions.push('해결책을 적용한 후의 결과를 어떻게 확인하고 싶으신가요?');
        break;
    }

    return questions;
  }

  // 제안 액션 생성
  private generateSuggestedActions(intent: string, requirements: string[], context: IntelligentContext): string[] {
    const actions: string[] = [];

    switch (intent) {
      case 'information':
        actions.push('관련 자료나 참고문헌을 찾아보세요');
        actions.push('전문가의 의견을 구해보세요');
        actions.push('실제 사례를 조사해보세요');
        break;
      case 'analysis':
        actions.push('분석 결과를 문서화해보세요');
        actions.push('다른 관점에서도 분석해보세요');
        actions.push('분석 결과를 바탕으로 계획을 수립해보세요');
        break;
      case 'creation':
        actions.push('아이디어를 구체화해보세요');
        actions.push('프로토타입을 만들어보세요');
        actions.push('피드백을 받아보세요');
        break;
      case 'comparison':
        actions.push('비교 결과를 정리해보세요');
        actions.push('결정 기준을 명확히 해보세요');
        actions.push('선택한 방안을 실행해보세요');
        break;
      case 'problem_solving':
        actions.push('해결책을 단계별로 실행해보세요');
        actions.push('진행 상황을 정기적으로 점검해보세요');
        actions.push('결과를 평가하고 개선점을 찾아보세요');
        break;
    }

    return actions;
  }

  // 관련 주제 추천
  private suggestRelatedTopics(intent: string, requirements: string[], context: IntelligentContext): string[] {
    const topics: string[] = [];

    // 의도 기반 주제
    switch (intent) {
      case 'information':
        topics.push('관련 최신 정보', '전문가 의견', '실제 사례');
        break;
      case 'analysis':
        topics.push('심화 분석', '비교 분석', '트렌드 분석');
        break;
      case 'creation':
        topics.push('창의적 아이디어', '혁신 방법론', '실용적 도구');
        break;
      case 'comparison':
        topics.push('객관적 평가', '비용 분석', '효율성 비교');
        break;
      case 'problem_solving':
        topics.push('문제 진단', '해결 방법론', '예방 전략');
        break;
    }

    // 요구사항 기반 주제
    requirements.forEach(req => {
      const keywords = req.match(/[가-힣a-zA-Z]+/g) || [];
      topics.push(...keywords.slice(0, 3));
    });

    return Array.from(new Set(topics)).slice(0, 10);
  }

  // 신뢰도 계산
  private calculateConfidence(intent: string, requirementsCount: number, contextConfidence: number): number {
    let confidence = 0.7; // 기본 신뢰도

    // 의도별 신뢰도 조정
    switch (intent) {
      case 'information': confidence += 0.1; break;
      case 'analysis': confidence += 0.15; break;
      case 'creation': confidence += 0.05; break;
      case 'comparison': confidence += 0.1; break;
      case 'problem_solving': confidence += 0.2; break;
      case 'emotional': confidence += 0.05; break;
      case 'casual': confidence += 0.1; break;
    }

    // 요구사항 수에 따른 조정
    if (requirementsCount > 0) {
      confidence += Math.min(requirementsCount * 0.05, 0.2);
    }

    // 컨텍스트 신뢰도 반영
    confidence = (confidence + contextConfidence) / 2;

    return Math.min(confidence, 0.95);
  }

  // 응답 타입 결정
  private determineResponseType(intent: string, requirementsCount: number, confidence: number): 'direct' | 'exploratory' | 'suggestive' | 'comprehensive' {
    if (confidence > 0.9 && requirementsCount <= 2) return 'direct';
    if (requirementsCount > 3) return 'comprehensive';
    if (intent === 'casual' || intent === 'emotional') return 'suggestive';
    return 'exploratory';
  }

  // 키 포인트 추출
  private extractKeyPoints(message: string): string {
    const keywords = message.match(/[가-힣a-zA-Z]+/g) || [];
    const importantKeywords = keywords.filter(word => word.length > 1).slice(0, 3);
    return importantKeywords.join(', ') || '말씀해 주신 내용';
  }

  // 사용자 선호도 추출
  private extractUserPreferences(conversationHistory: any[]): any {
    const preferences: any = {};
    
    if (conversationHistory.length === 0) return preferences;

    // 응답 길이 선호도
    const responseLengths = conversationHistory.map(msg => msg.response?.length || 0);
    preferences.prefersDetailed = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length > 500;
    
    // 기술적 수준 선호도
    const technicalTerms = conversationHistory.flatMap(msg => msg.technicalTerms || []);
    preferences.prefersTechnical = technicalTerms.length > 5;
    
    // 감정적 표현 선호도
    const emotionalExpressions = conversationHistory.flatMap(msg => msg.emotionalExpressions || []);
    preferences.prefersEmotional = emotionalExpressions.length > 3;

    return preferences;
  }

  // 컨텍스트 신뢰도 계산
  private calculateContextConfidence(message: string, conversationHistory: any[], uploadedFiles: any[]): number {
    let confidence = 0.5;

    // 메시지 길이에 따른 조정
    if (message.length > 100) confidence += 0.1;
    if (message.length > 500) confidence += 0.1;

    // 대화 히스토리에 따른 조정
    if (conversationHistory.length > 0) confidence += 0.1;
    if (conversationHistory.length > 5) confidence += 0.1;

    // 파일 업로드에 따른 조정
    if (uploadedFiles.length > 0) confidence += 0.1;

    return Math.min(confidence, 0.9);
  }

  // 컨텍스트 기반 액션 생성
  private generateContextualActions(message: string, intent: string, emotion: string): string[] {
    const actions: string[] = [];

    if (emotion === 'negative') {
      actions.push('스트레스 해소 방법 제안');
      actions.push('문제 해결 방안 제공');
    }

    if (intent === 'problem_solving') {
      actions.push('단계별 해결책 제시');
      actions.push('관련 전문가 추천');
    }

    if (message.length > 200) {
      actions.push('상세한 분석 제공');
      actions.push('구조화된 답변 제시');
    }

    return actions;
  }
}

export default IntelligentResponseSystem;
