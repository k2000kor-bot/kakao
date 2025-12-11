/**
 * advancedQuestionAnalyzer 서비스 테스트
 * 고급 질문 분석기 테스트
 */

import advancedQuestionAnalyzer from '../advancedQuestionAnalyzer';

describe('advancedQuestionAnalyzer', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedQuestionAnalyzer).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedQuestionAnalyzer;
      const instance2 = advancedQuestionAnalyzer;
      expect(instance1).toBe(instance2);
    });
  });

  describe('decomposeQuestion', () => {
    it('단순 질문을 분해할 수 있어야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요?';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      expect(result).toBeDefined();
      expect(result.originalQuestion).toBe(question);
      expect(Array.isArray(result.components)).toBe(true);
      expect(result.components.length).toBeGreaterThan(0);
      expect(typeof result.overallComplexity).toBe('number');
      expect(['short', 'medium', 'long', 'comprehensive']).toContain(result.estimatedResponseLength);
    });

    it('복합 질문을 분해할 수 있어야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요? 그리고 평가 프로세스는 어떻게 진행되나요?';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      expect(result).toBeDefined();
      expect(result.components.length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(result.executionOrder)).toBe(true);
    });

    it('조건부 질문을 분해할 수 있어야 함', async () => {
      const question = '만약 시공사가 우수한 기술력을 보유한다면, 어떤 평가 기준이 적용되나요?';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      expect(result).toBeDefined();
      expect(result.components.length).toBeGreaterThan(0);
      const hasConditional = result.components.some(c => c.type === 'conditional');
      expect(hasConditional).toBe(true);
    });

    it('질문 컴포넌트에 필수 속성이 있어야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정 기준과 평가 프로세스를 알려주세요.';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      if (result.components.length > 0) {
        const component = result.components[0];
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('content');
        expect(component).toHaveProperty('intent');
        expect(component).toHaveProperty('priority');
        expect(component).toHaveProperty('expectedResponseType');
        expect(component).toHaveProperty('complexity');
        expect(Array.isArray(component.domain)).toBe(true);
      }
    });

    it('필요한 역량을 식별해야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정에 대한 전문적인 분석을 해주세요.';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      expect(Array.isArray(result.requiredCapabilities)).toBe(true);
      expect(Array.isArray(result.suggestedApproach)).toBe(true);
    });
  });

  describe('performMultiLayerAnalysis', () => {
    it('다층 분석을 수행할 수 있어야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요?';
      
      const result = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(result).toBeDefined();
      expect(result.surfaceLevel).toBeDefined();
      expect(result.deepLevel).toBeDefined();
      expect(result.metaLevel).toBeDefined();
    });

    it('표면 수준 분석을 수행해야 함', async () => {
      const question = '시공사 선정 기준과 평가 프로세스를 알려주세요.';
      
      const result = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(Array.isArray(result.surfaceLevel.directQuestions)).toBe(true);
      expect(Array.isArray(result.surfaceLevel.explicitRequests)).toBe(true);
      expect(result.surfaceLevel.obviousIntent).toBeDefined();
    });

    it('심층 수준 분석을 수행해야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정이 왜 중요한가요?';
      
      const result = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(Array.isArray(result.deepLevel.implicitNeeds)).toBe(true);
      expect(Array.isArray(result.deepLevel.underlyingConcerns)).toBe(true);
      expect(Array.isArray(result.deepLevel.hiddenAssumptions)).toBe(true);
      expect(result.deepLevel.emotionalContext).toBeDefined();
    });

    it('메타 수준 분석을 수행해야 함', async () => {
      const question = '시공사 선정에 대해 종합적으로 분석해주세요.';
      
      const result = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(result.metaLevel.questioningStrategy).toBeDefined();
      expect(typeof result.metaLevel.cognitiveLoad).toBe('number');
      expect(Array.isArray(result.metaLevel.informationGaps)).toBe(true);
      expect(Array.isArray(result.metaLevel.biasIndicators)).toBe(true);
    });
  });

  describe('generateResponseStrategy', () => {
    it('응답 전략을 생성할 수 있어야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요?';
      const decomposition = await advancedQuestionAnalyzer.decomposeQuestion(question);
      const multiLayerAnalysis = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      const strategy = await advancedQuestionAnalyzer.generateResponseStrategy(decomposition, multiLayerAnalysis);
      
      expect(strategy).toBeDefined();
      expect(strategy.structure).toBeDefined();
      expect(['formal', 'conversational', 'technical', 'educational', 'persuasive']).toContain(strategy.tone);
      expect(['surface', 'moderate', 'deep', 'expert']).toContain(strategy.depth);
      expect(strategy.interactivity).toBeDefined();
    });

    it('응답 구조를 생성해야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정에 대해 설명해주세요.';
      const decomposition = await advancedQuestionAnalyzer.decomposeQuestion(question);
      const multiLayerAnalysis = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      const strategy = await advancedQuestionAnalyzer.generateResponseStrategy(decomposition, multiLayerAnalysis);
      
      expect(strategy.structure.introduction).toBeDefined();
      expect(Array.isArray(strategy.structure.mainSections)).toBe(true);
      expect(strategy.structure.conclusion).toBeDefined();
      expect(Array.isArray(strategy.structure.followUpSuggestions)).toBe(true);
    });

    it('인터랙티브 요소를 포함해야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요?';
      const decomposition = await advancedQuestionAnalyzer.decomposeQuestion(question);
      const multiLayerAnalysis = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      const strategy = await advancedQuestionAnalyzer.generateResponseStrategy(decomposition, multiLayerAnalysis);
      
      expect(Array.isArray(strategy.interactivity.clarificationQuestions)).toBe(true);
      expect(Array.isArray(strategy.interactivity.engagementPoints)).toBe(true);
      expect(Array.isArray(strategy.interactivity.feedbackRequests)).toBe(true);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 분석할 수 있어야 함', async () => {
      const question = '개포우성7차 재개발 프로젝트의 시공사 선정 기준은 무엇인가요?';
      
      const result = await advancedQuestionAnalyzer.decomposeQuestion(question);
      
      expect(result).toBeDefined();
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.components.some(c => c.content.includes('시공사') || c.content.includes('선정'))).toBe(true);
    });

    it('시공사 선정 관련 복합 질문을 분석할 수 있어야 함', async () => {
      const question = '시공사 선정 기준은 무엇인가요? 그리고 평가 프로세스는 어떻게 진행되며, 어떤 시공사가 적합한가요?';
      
      const decomposition = await advancedQuestionAnalyzer.decomposeQuestion(question);
      const multiLayer = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(decomposition.components.length).toBeGreaterThan(1);
      expect(multiLayer.surfaceLevel.directQuestions.length).toBeGreaterThan(0);
    });

    it('다층 분석으로 질문의 깊이를 파악할 수 있어야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정이 왜 중요한지, 그리고 어떤 기준으로 평가해야 하는지 알려주세요.';
      
      const result = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      expect(result.deepLevel.implicitNeeds.length).toBeGreaterThanOrEqual(0);
      expect(result.metaLevel.cognitiveLoad).toBeGreaterThanOrEqual(0);
    });

    it('응답 전략을 생성하여 구조화된 답변을 준비할 수 있어야 함', async () => {
      const question = '재개발 프로젝트 시공사 선정 기준, 평가 프로세스, 그리고 주의사항을 종합적으로 설명해주세요.';
      const decomposition = await advancedQuestionAnalyzer.decomposeQuestion(question);
      const multiLayerAnalysis = await advancedQuestionAnalyzer.performMultiLayerAnalysis(question);
      
      const strategy = await advancedQuestionAnalyzer.generateResponseStrategy(decomposition, multiLayerAnalysis);
      
      expect(strategy.structure.mainSections.length).toBeGreaterThan(0);
      expect(strategy.depth).toBeDefined();
      expect(strategy.interactivity.clarificationQuestions.length).toBeGreaterThanOrEqual(0);
    });
  });
});

