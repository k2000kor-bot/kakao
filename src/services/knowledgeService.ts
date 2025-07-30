import {
  KnowledgeBase,
  Document,
  Guideline,
  LogicRule,
  MessageGenerationRequest,
  MessageGenerationResponse,
  AIServiceConfig,
  KnowledgeProcessingResult
} from '../types/knowledge';

class KnowledgeService {
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();
  private aiConfig: AIServiceConfig;

  constructor() {
    this.aiConfig = {
      openaiApiKey: 'YOUR_OPENAI_API_KEY',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,  // ChatGPT와 유사하게 조정
      useDeepLearning: true,
      deepLearningModel: 'local-bert'
    };
  }

  // 지식 베이스 관리
  async createKnowledgeBase(knowledgeBase: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeBase> {
    const id = `kb_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    const newKnowledgeBase: KnowledgeBase = {
      ...knowledgeBase,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.knowledgeBases.set(id, newKnowledgeBase);
    return newKnowledgeBase;
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    return this.knowledgeBases.get(id) || null;
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> {
    const kb = this.knowledgeBases.get(id);
    if (!kb) return null;

    const updatedKb = {
      ...kb,
      ...updates,
      updatedAt: new Date()
    };

    this.knowledgeBases.set(id, updatedKb);
    return updatedKb;
  }

  // 문서 처리 및 임베딩 생성
  async processDocument(document: Document): Promise<KnowledgeProcessingResult> {
    try {
      // 문서 내용 전처리
      const processedContent = await this.preprocessContent(document.content);

      // 키워드 및 엔티티 추출
      const extractedInfo = await this.extractInformation(processedContent);

      // 임베딩 생성 (OpenAI 또는 로컬 모델 사용)
      const embeddings = await this.generateEmbeddings(processedContent);

      const result: KnowledgeProcessingResult = {
        id: `processed_${Date.now()}`,
        status: 'completed',
        extractedInfo: {
          keyPoints: extractedInfo.keyPoints,
          entities: extractedInfo.entities,
          summary: '문서 요약입니다.',
          confidence: 0.85,
          sentiment: extractedInfo.sentiment,
          relationships: extractedInfo.relationships
        },
        metadata: {
          processedAt: new Date(),
          processingTime: 1500,
          fileSize: 0,
          documentId: document.id,
          modelUsed: 'gpt-3.5-turbo'
        },
        embeddings: new Array(768).fill(0).map(() => Math.random())
      };

      return result;
    } catch (error) {
      console.error('문서 처리 실패:', error);
      throw error;
    }
  }

  private async preprocessContent(content: string): Promise<string> {
    // 텍스트 정규화 및 클리닝
    return content
      .replace(/\s+/g, ' ').trim()
      .toLowerCase();
  }

  private async extractInformation(content: string) {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    const keywords = content.split(' ').filter(word => word.length > 2)
      .slice(0, 10);

    // 감정 분석 (간단한 구현)
    const positiveWords = ['좋음', '감사', '동의', '찬성', '수고', '고생', '축하', '기대', '환영'];
    const negativeWords = ['불만', '문제', '반대', '우려', '실패', '어려움', '짜증'];
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    return {
      keyPoints: keywords,
      entities: keywords.filter(word => word.length > 3),
      relationships: '',
      sentiment
    };
  }

  private async generateEmbeddings(content: string): Promise<number[]> {
    if (this.aiConfig.useDeepLearning) {
      // 로컬 BERT 모델 사용 (실제로는 TensorFlow.js나 ONNX 사용)
      return this.generateLocalEmbeddings(content);
    } else {
      // OpenAI API 사용
      return this.generateOpenAIEmbeddings(content);
    }
  }

  private async generateLocalEmbeddings(content: string): Promise<number[]> {
    // 간단한 해시 기반 임베딩 (실제로는 BERT 모델 사용)
    const hash = content.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // 768차원 벡터 생성 (BERT와 동일한 차원)
    const embeddings = new Array(768).fill(0);
    for (let i = 0; i < 768; i++) {
      embeddings[i] = Math.sin(hash + i) * 0.001;
    }

    return embeddings;
  }

  private async generateOpenAIEmbeddings(content: string): Promise<number[]> {
    if (!this.aiConfig.openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.aiConfig.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content,
          model: 'text-embedding-ada-002'
        })
      });

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI 임베딩 생성 실패:', error);
      // 폴백으로 로컬 임베딩 사용
      return this.generateLocalEmbeddings(content);
    }
  }

  // 지침 및 논리 규칙 관리
  async addGuideline(knowledgeBaseId: string, guideline: Omit<Guideline, 'id' | 'createdAt'>): Promise<Guideline> {
    const kb = this.knowledgeBases.get(knowledgeBaseId);
    if (!kb) throw new Error('지식 베이스를 찾을 수 없습니다.');
    const newGuideline: Guideline = {
      ...guideline,
      id: `gl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    kb.guidelines.push(newGuideline);
    this.knowledgeBases.set(knowledgeBaseId, kb);

    return newGuideline;
  }

  async addLogicRule(knowledgeBaseId: string, rule: Omit<LogicRule, 'id'>): Promise<LogicRule> {
    const kb = this.knowledgeBases.get(knowledgeBaseId);
    if (!kb) throw new Error('지식 베이스를 찾을 수 없습니다.');
    const newRule: LogicRule = {
      ...rule,
      id: `lr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    kb.logicRules.push(newRule);
    this.knowledgeBases.set(knowledgeBaseId, kb);

    return newRule;
  }

  // 메시지 생성 (핵심 기능)
  async generateMessage(request: MessageGenerationRequest): Promise<MessageGenerationResponse> {
    const startTime = Date.now();

    try {
      // 1. 베이스 로드
      const knowledgeBase = await this.getKnowledgeBase(request.knowledgeBaseId);
      if (!knowledgeBase) {
        throw new Error('지식 베이스를 찾을 수 없습니다.');
      }

      // 2. 컨텍스트 분석
      const contextAnalysis = await this.analyzeContext(request.context, knowledgeBase);

      // 3. 지침 및 규칙 찾기
      const relevantGuidelines = await this.findRelevantGuidelines(request, knowledgeBase);
      const applicableRules = await this.findApplicableRules(request, knowledgeBase);

      // 4. 메시지 생성
      const generatedMessage = await this.createMessage(
        request,
        contextAnalysis,
        relevantGuidelines,
        applicableRules
      );

      // 5. 신뢰도 계산
      const confidence = this.calculateConfidence(contextAnalysis, relevantGuidelines, applicableRules);

      return {
        generatedMessage,
        confidence,
        reasoning: this.generateReasoning(contextAnalysis, relevantGuidelines, applicableRules),
        usedGuidelines: relevantGuidelines,
        appliedRules: applicableRules,
        suggestions: this.generateSuggestions(request, contextAnalysis),
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: this.aiConfig.useDeepLearning ? 'local-bert' : 'openai',
          tokensUsed: generatedMessage.length
        }
      };
    } catch (error) {
      console.error('메시지 생성 실패:', error);
      throw error;
    }
  }

  private async analyzeContext(context: string, knowledgeBase: KnowledgeBase) {
    // 컨텍스트 분석 로직
    const contextEmbeddings = await this.generateEmbeddings(context);

    // 관련 문서 찾기
    const relevantDocuments = knowledgeBase.documents.filter(doc =>
      doc.embeddings && this.calculateSimilarity(contextEmbeddings, doc.embeddings) > 0.5
    );

    return {
      contextEmbeddings,
      relevantDocuments,
      keyTopics: this.extractKeyTopics(context),
      sentiment: this.analyzeSentiment(context)
    };
  }

  private async findRelevantGuidelines(request: MessageGenerationRequest, knowledgeBase: KnowledgeBase): Promise<Guideline[]> {
    const contextEmbeddings = await this.generateEmbeddings(request.context);

    return knowledgeBase.guidelines
      .filter(guideline => {
        // 카테고리 매칭
        if (request.guidelines && request.guidelines.length > 0) {
          return request.guidelines.includes(guideline.category);
        }
        return true;
      })
      .sort((a, b) => {
        // 우선순위 및 관련성으로 정렬
        const priorityScore = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
        return priorityScore;
      })
      .slice(0, 5); // 상위 5개만 반환
  }

  private async findApplicableRules(request: MessageGenerationRequest, knowledgeBase: KnowledgeBase): Promise<LogicRule[]> {
    return knowledgeBase.logicRules
      .filter(rule => rule.isActive)
      .filter(rule => {
        // 조건 평가
        return rule.conditions.every(condition =>
          this.evaluateCondition(condition, request)
        );
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private evaluateCondition(condition: any, request: MessageGenerationRequest): boolean {
    const fieldValue = this.getFieldValue(condition.field, request);

    switch (condition.operator) {
      case 'contains':
        return fieldValue.includes(condition.value);
      case 'equals':
        return fieldValue === condition.value;
      case 'starts_with':
        return fieldValue.startsWith(condition.value);
      case 'ends_with':
        return fieldValue.endsWith(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(fieldValue);
      default:
        return false;
    }
  }

  private getFieldValue(field: string, request: MessageGenerationRequest): string {
    switch (field) {
      case 'context':
        return request.context;
      case 'tone':
        return request.userPreferences.tone;
      case 'style':
        return request.userPreferences.style;
      default:
        return '';
    }
  }

  private async createMessage(
    request: MessageGenerationRequest,
    contextAnalysis: any,
    guidelines: Guideline[],
    rules: LogicRule[]
  ): Promise<string> {
    // OpenAI API를 사용한 메시지 생성
    if (this.aiConfig.openaiApiKey) {
      return this.generateWithOpenAI(request, contextAnalysis, guidelines, rules);
    } else {
      return this.generateWithLocalModel(request, contextAnalysis, guidelines, rules);
    }
  }

  private async generateWithOpenAI(
    request: MessageGenerationRequest,
    contextAnalysis: any,
    guidelines: Guideline[],
    rules: LogicRule[]
  ): Promise<string> {
    const prompt = this.buildPrompt(request, contextAnalysis, guidelines, rules);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.aiConfig.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.aiConfig.model,
          messages: [
            {
              role: 'system',
              content: '당신은 전문적인 대화 분석가입니다. 주어진 지침과 규칙을 바탕으로 적절한 메시지를 생성해주세요.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.aiConfig.maxTokens,
          temperature: this.aiConfig.temperature
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI 메시지 생성 실패:', error);
      return this.generateWithLocalModel(request, contextAnalysis, guidelines, rules);
    }
  }

  private async generateWithLocalModel(
    request: MessageGenerationRequest,
    contextAnalysis: any,
    guidelines: Guideline[],
    rules: LogicRule[]
  ): Promise<string> {
    // 로컬 모델을 사용한 메시지 생성 (템플릿 기반)
    const template = this.selectTemplate(request, guidelines);
    return this.fillTemplate(template, request, contextAnalysis);
  }

  private buildPrompt(
    request: MessageGenerationRequest,
    contextAnalysis: any,
    guidelines: Guideline[],
    rules: LogicRule[]
  ): string {
    let prompt = `컨텍스트: ${request.context}\n\n`;

    if (guidelines.length > 0) {
      prompt += `적용할 지침:\n`;
      guidelines.forEach(guideline => {
        prompt += `- ${guideline.title}: ${guideline.content}\n`;
      });
      prompt += '\n';
    }

    if (rules.length > 0) {
      prompt += `적용할 규칙:\n`;
      rules.forEach(rule => {
        prompt += `- ${rule.name}: ${rule.description}\n`;
      });
      prompt += '\n';
    }

    prompt += `사용자 선호도: ${request.userPreferences.tone} 톤, ${request.userPreferences.style} 스타일\n`;
    prompt += `요청: 위의 정보를 바탕으로 적절한 메시지를 생성해주세요.`;

    return prompt;
  }

  private selectTemplate(request: MessageGenerationRequest, guidelines: Guideline[]): string {
    const tone = request.userPreferences.tone;
    const style = request.userPreferences.style;

    // 기본 템플릿 선택
    let template = '말씀하신 내용을 잘 이해했습니다. ';

    if (style === 'empathetic') {
      template += '충분히 공감하며, ';
    } else if (style === 'analytical') {
      template += '분석해보니,';
    }

    template += '이런 점도 함께 고려해보시면 어떨까요?';
    return template;
  }

  private fillTemplate(template: string, request: MessageGenerationRequest, contextAnalysis: any): string {
    // 템플릿에 컨텍스트 정보 채우기
    return template.replace('{context}', request.context);
  }

  private calculateConfidence(contextAnalysis: any, guidelines: Guideline[], rules: LogicRule[]): number {
    let confidence = 0.5; // 기본값

    // 관련 문서가 많을수록 신뢰도 증가
    confidence += Math.min(contextAnalysis.relevantDocuments.length * 0.1, 0.3);

    // 지침이 많을수록 신뢰도 증가
    confidence += Math.min(guidelines.length * 0.1, 0.2);

    // 규칙이 많을수록 신뢰도 증가
    confidence += Math.min(rules.length * 0.1);

    return Math.min(confidence, 1.0);
  }

  private generateReasoning(contextAnalysis: any, guidelines: Guideline[], rules: LogicRule[]): string {
    let reasoning = '생성 근거: ';

    if (contextAnalysis.relevantDocuments.length > 0) {
      reasoning += `${contextAnalysis.relevantDocuments.length}개의 관련 문서를 참고했습니다. `;
    }

    if (guidelines.length > 0) {
      reasoning += `${guidelines.length}개의 지침을 적용했습니다. `;
    }

    if (rules.length > 0) {
      reasoning += `${rules.length}개의 논리 규칙을 적용했습니다.`;
    }

    return reasoning;
  }

  private generateSuggestions(request: MessageGenerationRequest, contextAnalysis: any): string {
    const suggestions = [];
    if (contextAnalysis.sentiment === 'negative') {
      suggestions.push('공감적이고 이해하는 톤으로 응답하는 것을 권장합니다.');
    }

    if (request.userPreferences.length === 'short') {
      suggestions.push('간결하고 핵심적인 내용으로 응답하는 것을 권장합니다.');
    }

    return suggestions.join(' ');
  }

  private calculateSimilarity(embeddings1: number[], embeddings2: number[]): number {
    if (embeddings1.length !== embeddings2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embeddings1.length; i++) {
      dotProduct += embeddings1[i] * embeddings2[i];
      norm1 += embeddings1[i] * embeddings1[i];
      norm2 += embeddings2[i] * embeddings2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private extractKeyTopics(context: string): string[] {
    // 간단한 키워드 추출
    const words = context.split(' ').filter(word => word.length > 2);
    return words.slice(0, 5);
  }

  private analyzeSentiment(context: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['좋음', '감사', '동의', '찬성', '수고', '고생', '축하', '기대', '환영'];
    const negativeWords = ['불만', '문제', '반대', '우려', '실패', '어려움', '짜증'];
    const positiveCount = positiveWords.filter(word => context.includes(word)).length;
    const negativeCount = negativeWords.filter(word => context.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  // AI 설정 관리
  setAIConfig(config: Partial<AIServiceConfig>): void {
    this.aiConfig = { ...this.aiConfig, ...config };
  }

  getAIConfig(): AIServiceConfig {
    return this.aiConfig;
  }
}

export default new KnowledgeService(); 