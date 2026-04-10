/**
 * advancedTextAnalysisService 서비스 테스트
 * 고급 텍스트 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { advancedTextAnalysisService } from '../advancedTextAnalysisService';

describe('advancedTextAnalysisService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedTextAnalysisService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedTextAnalysisService;
      const instance2 = advancedTextAnalysisService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('performComprehensiveAnalysis', () => {
    it('기본 텍스트에 대한 종합 분석을 수행할 수 있어야 함', async () => {
      const text = '재개발 프로젝트는 도시 재생을 위한 중요한 정책입니다. 시공사 선정과 예산 계획이 핵심 요소입니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result).toBeDefined();
      expect(result.descriptive).toBeDefined();
      expect(result.research).toBeDefined();
      expect(result.opinion).toBeDefined();
      expect(result.manipulation).toBeDefined();
      expect(result.generatedTexts).toBeDefined();
      expect(result.analysisResult).toBeDefined();
      expect(result.expertAssessment).toBeDefined();
      expect(result.contextualFactors).toBeDefined();
    });

    it('descriptive 분석 타입으로 분석을 수행할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 시공사 선정 기준을 설명합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'descriptive');

      expect(result).toBeDefined();
      expect(result.descriptive.type).toBe('descriptive');
      expect(Array.isArray(result.descriptive.findings)).toBe(true);
      expect(Array.isArray(result.descriptive.insights)).toBe(true);
    });

    it('research 분석 타입으로 분석을 수행할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 예산 계획에 대한 연구 결과를 제시합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'research');

      expect(result).toBeDefined();
      expect(result.research.type).toBe('research');
      expect(Array.isArray(result.research.findings)).toBe(true);
      expect(Array.isArray(result.research.insights)).toBe(true);
    });

    it('opinion 분석 타입으로 분석을 수행할 수 있어야 함', async () => {
      const text = '재개발 프로젝트에 대한 의견을 제시합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'opinion');

      expect(result).toBeDefined();
      expect(result.opinion.type).toBe('opinion');
      expect(Array.isArray(result.opinion.findings)).toBe(true);
      expect(Array.isArray(result.opinion.insights)).toBe(true);
    });

    it('manipulation 분석 타입으로 분석을 수행할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 필요성을 강조하는 텍스트입니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'manipulation');

      expect(result).toBeDefined();
      expect(result.manipulation).toBeDefined();
      expect(Array.isArray(result.manipulation.changes)).toBe(true);
      expect(Array.isArray(result.manipulation.additions)).toBe(true);
      expect(Array.isArray(result.manipulation.improvements)).toBe(true);
      expect(result.manipulation.quality).toBeDefined();
    });

    it('생성된 텍스트를 포함해야 함', async () => {
      const text = '재개발 프로젝트 분석';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result.generatedTexts).toBeDefined();
      expect(typeof result.generatedTexts.descriptiveAnalysis).toBe('string');
      expect(typeof result.generatedTexts.researchSummary).toBe('string');
      expect(Array.isArray(result.generatedTexts.alternatives)).toBe(true);
      expect(result.generatedTexts.alternatives.length).toBeGreaterThan(0);
    });

    it('분석 결과를 포함해야 함', async () => {
      const text = '재개발 프로젝트 평가';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result.analysisResult).toBeDefined();
      expect(typeof result.analysisResult.methodology).toBe('string');
      expect(Array.isArray(result.analysisResult.findings)).toBe(true);
      expect(Array.isArray(result.analysisResult.insights)).toBe(true);
      expect(Array.isArray(result.analysisResult.limitations)).toBe(true);
      expect(Array.isArray(result.analysisResult.recommendations)).toBe(true);
    });

    it('전문가 평가를 포함해야 함', async () => {
      const text = '재개발 프로젝트 분석';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result.expertAssessment).toBeDefined();
      expect(typeof result.expertAssessment.credibility).toBe('number');
      expect(typeof result.expertAssessment.reliability).toBe('number');
      expect(result.expertAssessment.credibility).toBeGreaterThanOrEqual(0);
      expect(result.expertAssessment.credibility).toBeLessThanOrEqual(1);
      expect(result.expertAssessment.reliability).toBeGreaterThanOrEqual(0);
      expect(result.expertAssessment.reliability).toBeLessThanOrEqual(1);
    });

    it('맥락적 요소를 포함해야 함', async () => {
      const text = '재개발 프로젝트 분석';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result.contextualFactors).toBeDefined();
      expect(Array.isArray(result.contextualFactors.temporal)).toBe(true);
      expect(Array.isArray(result.contextualFactors.social)).toBe(true);
      expect(Array.isArray(result.contextualFactors.political)).toBe(true);
      expect(Array.isArray(result.contextualFactors.economic)).toBe(true);
    });

    it('캐싱 기능이 작동해야 함', async () => {
      const text = '캐시 테스트 텍스트';
      const result1 = await advancedTextAnalysisService.performComprehensiveAnalysis(text);
      const result2 = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // 캐시된 결과는 동일한 객체여야 함
      expect(result1).toBe(result2);
    });

    it('긴 텍스트에 대해서도 분석을 수행할 수 있어야 함', async () => {
      const longText = '재개발 프로젝트는 도시 재생을 위한 중요한 정책입니다. '.repeat(50);
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(longText);

      expect(result).toBeDefined();
      expect(result.descriptive.findings.length).toBeGreaterThan(0);
      expect(result.descriptive.findings.some(f => f.includes('문장'))).toBe(true);
    });

    it('짧은 텍스트에 대해서도 분석을 수행할 수 있어야 함', async () => {
      const shortText = '재개발 프로젝트';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(shortText);

      expect(result).toBeDefined();
      expect(result.descriptive).toBeDefined();
      expect(result.research).toBeDefined();
      expect(result.opinion).toBeDefined();
    });

    it('manipulation 분석의 품질 메트릭을 포함해야 함', async () => {
      const text = '재개발 프로젝트의 필요성을 강조하는 텍스트';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'manipulation');

      expect(result.manipulation.quality).toBeDefined();
      expect(typeof result.manipulation.quality.readability).toBe('number');
      expect(typeof result.manipulation.quality.engagement).toBe('number');
      expect(typeof result.manipulation.quality.clarity).toBe('number');
      expect(typeof result.manipulation.quality.persuasiveness).toBe('number');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획 수립 방법을 종합적으로 분석합니다. 시공사 선정은 기술력, 경험, 비용, 일정 관리 능력을 종합적으로 평가하여 결정합니다. 예산 계획은 건설 비용, 설계 비용, 인허가 비용, 부대 비용을 모두 고려하여 수립합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result).toBeDefined();
      expect(result.descriptive.findings.length).toBeGreaterThan(0);
      expect(result.research.findings.length).toBeGreaterThan(0);
      expect(result.opinion.findings.length).toBeGreaterThan(0);
      expect(result.expertAssessment.credibility).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '시공사 선정 시 고려해야 할 주요 기준은 기술력, 경험, 비용, 일정 관리 능력입니다. 이러한 기준들을 종합적으로 평가하여 최적의 시공사를 선정해야 합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'research');

      expect(result).toBeDefined();
      expect(result.research.type).toBe('research');
      expect(result.analysisResult.methodology).toBeDefined();
      expect(result.generatedTexts.researchSummary.length).toBeGreaterThan(0);
    });

    it('예산 계획 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트 예산 계획 수립 시 건설 비용, 설계 비용, 인허가 비용, 부대 비용을 모두 고려해야 합니다. 비용 최적화를 위해 각 항목별로 세부 계획을 수립하는 것이 중요합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'descriptive');

      expect(result).toBeDefined();
      expect(result.descriptive.type).toBe('descriptive');
      expect(result.descriptive.findings.length).toBeGreaterThan(0);
      expect(result.descriptive.recommendations.length).toBeGreaterThan(0);
    });

    it('복합적인 텍스트를 종합적으로 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 평가합니다. 각 요소는 서로 연관되어 있으며, 전체적인 관점에서 접근해야 합니다. 시공사 선정은 기술력과 경험을 중시하며, 예산 계획은 현실적이고 실현 가능한 수준으로 수립해야 합니다. 일정 관리는 리스크를 고려하여 여유를 두고 계획해야 합니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text);

      expect(result).toBeDefined();
      expect(result.descriptive.findings.length).toBeGreaterThan(0);
      expect(result.research.insights.length).toBeGreaterThan(0);
      expect(result.opinion.implications.length).toBeGreaterThan(0);
      expect(result.manipulation.improvements.length).toBeGreaterThan(0);
      expect(result.generatedTexts.alternatives.length).toBeGreaterThan(0);
    });

    it('의견 분석을 통해 여론 형성 영향을 평가할 수 있어야 함', async () => {
      const text = '재개발 프로젝트는 지역 주민의 삶의 질을 향상시키고 도시 경쟁력을 강화하는 중요한 정책입니다.';
      const result = await advancedTextAnalysisService.performComprehensiveAnalysis(text, 'opinion');

      expect(result).toBeDefined();
      expect(result.opinion.type).toBe('opinion');
      expect(result.opinion.findings.length).toBeGreaterThan(0);
      expect(result.opinion.insights.length).toBeGreaterThan(0);
    });
  });
});

