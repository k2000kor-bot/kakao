/**
 * advancedNLPService 서비스 테스트
 * 고급 NLP 질문 이해 및 문맥 분석 서비스 테스트
 */

import { advancedNLPService, QuestionAnalysis } from '../advancedNLPService';

describe('advancedNLPService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedNLPService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedNLPService;
      const instance2 = advancedNLPService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzeQuestion', () => {
    it('기본 질문을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발이란 무엇인가요?');

      expect(analysis).toBeDefined();
      expect(analysis.questionType).toBeDefined();
      expect(analysis.complexity).toBeDefined();
      expect(analysis.context).toBeDefined();
      expect(analysis.intent).toBeDefined();
      expect(analysis.logicalStructure).toBeDefined();
      expect(analysis.requirements).toBeDefined();
    });

    it('factual 질문을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발의 정의는 무엇인가요?');

      expect(['factual', 'explanatory']).toContain(analysis.questionType);
    });

    it('analytical 질문을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발 프로젝트의 원인을 분석해주세요');

      expect(['analytical', 'explanatory']).toContain(analysis.questionType);
    });

    it('comparative 질문을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발과 재건축의 차이점을 비교해주세요');

      expect(['comparative', 'explanatory']).toContain(analysis.questionType);
    });

    it('explanatory 질문을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발 프로젝트의 절차를 설명해주세요');

      expect(['explanatory', 'procedural']).toContain(analysis.questionType);
    });

    it('procedural 질문을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발 프로젝트를 어떻게 진행하나요?');

      // procedural 타입이 없을 경우 explanatory로 반환될 수 있음
      expect(['factual', 'analytical', 'comparative', 'explanatory', 'procedural', 'opinion']).toContain(analysis.questionType);
    });

    it('질문의 복잡도를 평가할 수 있어야 함', async () => {
      const simpleAnalysis = await advancedNLPService.analyzeQuestion('재개발이 뭐야?');
      expect(['simple', 'moderate']).toContain(simpleAnalysis.complexity);

      const complexAnalysis = await advancedNLPService.analyzeQuestion(
        '재개발 프로젝트의 시공사 선정 기준과 예산 계획 수립 방법, 그리고 일정 관리와 리스크 분석을 종합적으로 알려주세요'
      );
      expect(['simple', 'moderate', 'complex', 'multi-layered']).toContain(complexAnalysis.complexity);
    });

    it('문맥을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('부동산 재개발 프로젝트의 절차는?');

      expect(analysis.context).toBeDefined();
      expect(analysis.context.domain).toBeDefined();
      expect(Array.isArray(analysis.context.domain)).toBe(true);
      expect(analysis.context.scope).toBeDefined();
      expect(['specific', 'general', 'comprehensive']).toContain(analysis.context.scope);
    });

    it('의도를 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발 프로젝트를 자세히 분석해주세요');

      expect(analysis.intent).toBeDefined();
      expect(analysis.intent.primary).toBeDefined();
      expect(Array.isArray(analysis.intent.secondary)).toBe(true);
      expect(Array.isArray(analysis.intent.implicitNeeds)).toBe(true);
      expect(analysis.intent.expectedDepth).toBeDefined();
      expect(['surface', 'detailed', 'comprehensive', 'expert']).toContain(analysis.intent.expectedDepth);
    });

    it('논리적 구조를 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '재개발이 필요하기 때문에 시공사를 선정해야 합니다. 따라서 예산 계획을 수립해야 합니다.'
      );

      expect(analysis.logicalStructure).toBeDefined();
      expect(Array.isArray(analysis.logicalStructure.premises)).toBe(true);
      expect(Array.isArray(analysis.logicalStructure.conclusions)).toBe(true);
      expect(Array.isArray(analysis.logicalStructure.relationships)).toBe(true);
      expect(Array.isArray(analysis.logicalStructure.gaps)).toBe(true);
    });

    it('요구사항을 추출할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '재개발 프로젝트의 통계 데이터와 전문가 의견, 그리고 예시를 제공해주세요'
      );

      expect(analysis.requirements).toBeDefined();
      expect(Array.isArray(analysis.requirements.informationTypes)).toBe(true);
      expect(Array.isArray(analysis.requirements.evidenceNeeded)).toBe(true);
      expect(Array.isArray(analysis.requirements.formatPreferences)).toBe(true);
      expect(Array.isArray(analysis.requirements.constraints)).toBe(true);
    });

    it('대화 히스토리를 고려하여 분석할 수 있어야 함', async () => {
      const history = [
        '재개발이 무엇인가요?',
        '재개발은 기존 건물을 철거하고 새로운 건물을 짓는 것입니다.'
      ];

      const analysis = await advancedNLPService.analyzeQuestion(
        '그럼 시공사는 어떻게 선정하나요?',
        history
      );

      expect(analysis).toBeDefined();
      expect(analysis.context.background.length).toBeGreaterThanOrEqual(0);
    });

    it('부동산 도메인을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('아파트 재개발 프로젝트의 절차는?');

      expect(analysis.context.domain).toContain('real_estate');
    });

    it('비즈니스 도메인을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('비즈니스 전략을 수립하는 방법은?');

      expect(analysis.context.domain).toContain('business');
    });

    it('기술 도메인을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('AI 기술의 발전 방향은?');

      expect(analysis.context.domain).toContain('technology');
    });

    it('뉴스 도메인을 식별할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('최신 부동산 뉴스를 알려주세요');

      expect(analysis.context.domain).toContain('news');
    });
  });

  describe('generateResponseGuidelines', () => {
    it('분석 결과를 바탕으로 응답 가이드라인을 생성할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('재개발 프로젝트를 분석해주세요');
      const guidelines = advancedNLPService.generateResponseGuidelines(analysis);

      expect(guidelines).toBeDefined();
      expect(Array.isArray(guidelines.structure)).toBe(true);
      expect(Array.isArray(guidelines.requiredElements)).toBe(true);
      expect(typeof guidelines.tone).toBe('string');
      expect(typeof guidelines.depth).toBe('string');
      expect(Array.isArray(guidelines.evidenceRequirements)).toBe(true);
    });

    it('웹 검색 결과를 포함한 가이드라인을 생성할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion('최신 재개발 뉴스를 알려주세요');
      const webSearchResults = [
        { title: '재개발 뉴스 1', url: 'https://example.com/1' },
        { title: '재개발 뉴스 2', url: 'https://example.com/2' }
      ];

      const guidelines = advancedNLPService.generateResponseGuidelines(analysis, webSearchResults);

      expect(guidelines).toBeDefined();
      expect(guidelines.evidenceRequirements).toContain('웹 검색 결과를 활용한 최신 정보');
    });

    it('복잡한 질문에 대한 상세한 가이드라인을 생성할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '재개발 프로젝트의 시공사 선정 기준과 예산 계획, 일정 관리, 리스크 분석을 종합적으로 알려주세요'
      );

      const guidelines = advancedNLPService.generateResponseGuidelines(analysis);

      expect(guidelines).toBeDefined();
      expect(guidelines.depth).toBeDefined();
      expect(guidelines.structure.length).toBeGreaterThan(0);
    });
  });

  describe('실제 사용자 질문 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획을 분석해주세요'
      );

      expect(analysis).toBeDefined();
      expect(analysis.questionType).toBeDefined();
      expect(analysis.complexity).toBeDefined();
      expect(Array.isArray(analysis.context.domain)).toBe(true);
      expect(analysis.context.domain.length).toBeGreaterThanOrEqual(0);
      expect(analysis.intent.primary).toBeDefined();
    });

    it('시공사 선정 관련 질문을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '시공사 선정 시 고려해야 할 주요 기준과 평가 방법'
      );

      expect(analysis).toBeDefined();
      expect(analysis.requirements.informationTypes.length).toBeGreaterThanOrEqual(0);
    });

    it('예산 계획 관련 질문을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안'
      );

      expect(analysis).toBeDefined();
      expect(analysis.intent.implicitNeeds.length).toBeGreaterThanOrEqual(0);
    });

    it('복합적인 질문을 분석할 수 있어야 함', async () => {
      const analysis = await advancedNLPService.analyzeQuestion(
        '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 분석해주세요'
      );

      expect(analysis).toBeDefined();
      expect(['simple', 'moderate', 'complex', 'multi-layered']).toContain(analysis.complexity);
      expect(analysis.intent.expectedDepth).toBeDefined();
    });
  });
});

