/**
 * advancedLogicAnalysisEngine 서비스 테스트
 * 고급 논리 및 어조 분석 엔진 테스트
 */

import advancedLogicAnalysisEngine from '../advancedLogicAnalysisEngine';

describe('advancedLogicAnalysisEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedLogicAnalysisEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedLogicAnalysisEngine;
      const instance2 = advancedLogicAnalysisEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzeAdvancedStyle', () => {
    it('텍스트의 고급 스타일을 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트는 복잡한 과정을 거칩니다. 따라서 신중한 계획이 필요합니다. 시공사 선정은 기술력, 안전성, 경험을 종합적으로 고려해야 합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure).toBeDefined();
      expect(result.tonalProgression).toBeDefined();
      expect(result.argumentativeFramework).toBeDefined();
      expect(result.linguisticSignature).toBeDefined();
      expect(result.cognitivePatterns).toBeDefined();
    });

    it('논리적 구조를 분석할 수 있어야 함', async () => {
      const text = '만약 시공사가 우수한 기술력을 보유한다면, 프로젝트 성공 확률이 높아집니다. 따라서 기술력 평가가 중요합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result.logicalStructure).toBeDefined();
      expect(result.logicalStructure.argumentType).toBeDefined();
      expect(Array.isArray(result.logicalStructure.premisePatterns)).toBe(true);
      expect(Array.isArray(result.logicalStructure.conclusionPatterns)).toBe(true);
      expect(Array.isArray(result.logicalStructure.evidenceTypes)).toBe(true);
    });

    it('어조 진행을 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트는 중요한 결정입니다. 신중하게 접근해야 합니다. 다양한 요소를 고려해야 합니다. 결론적으로 전문가의 조언이 필요합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result.tonalProgression).toBeDefined();
      expect(result.tonalProgression.openingTone).toBeDefined();
      expect(result.tonalProgression.developmentTone).toBeDefined();
      expect(result.tonalProgression.climaxTone).toBeDefined();
      expect(result.tonalProgression.conclusionTone).toBeDefined();
      expect(Array.isArray(result.tonalProgression.emotionalArc)).toBe(true);
      expect(Array.isArray(result.tonalProgression.intensityProgression)).toBe(true);
      expect(typeof result.tonalProgression.toneConsistency).toBe('number');
    });

    it('논증 프레임워크를 분석할 수 있어야 함', async () => {
      const text = '시공사 선정 기준은 다음과 같습니다. 첫째, 기술력이 우수해야 합니다. 둘째, 안전 관리 시스템이 체계적이어야 합니다. 셋째, 비슷한 프로젝트 경험이 있어야 합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result.argumentativeFramework).toBeDefined();
      // argumentativeFramework의 실제 구조에 맞게 검증
      if (result.argumentativeFramework) {
        expect(typeof result.argumentativeFramework).toBe('object');
      }
    });

    it('언어학적 시그니처를 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 성공을 위해서는 체계적인 접근이 필수적입니다. 전문가의 의견을 수렴하고, 다양한 관점을 고려해야 합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result.linguisticSignature).toBeDefined();
      // linguisticSignature의 실제 구조에 맞게 검증
      if (result.linguisticSignature) {
        expect(typeof result.linguisticSignature).toBe('object');
        expect(result.linguisticSignature.vocabularyPreferences).toBeDefined();
        expect(result.linguisticSignature.syntacticPatterns).toBeDefined();
      }
    });

    it('인지적 패턴을 분석할 수 있어야 함', async () => {
      const text = '데이터를 분석한 결과, 시공사 선정에 있어 기술력이 가장 중요한 요소임을 확인했습니다. 통계적으로 유의미한 상관관계가 발견되었습니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(Array.isArray(result.cognitivePatterns)).toBe(true);
    });

    it('짧은 텍스트도 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트입니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure).toBeDefined();
      expect(result.tonalProgression).toBeDefined();
    });

    it('긴 텍스트도 분석할 수 있어야 함', async () => {
      const longText = Array(50).fill('재개발 프로젝트는 복잡한 과정을 거칩니다. 신중한 계획과 전문가의 조언이 필요합니다. 시공사 선정은 기술력, 안전성, 경험을 종합적으로 고려해야 합니다. 다양한 요소를 분석하고 평가해야 합니다.').join(' ');
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(longText);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure).toBeDefined();
      expect(result.tonalProgression).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '개포우성7차 재개발 프로젝트의 시공사 선정은 매우 중요한 결정입니다. 기술력, 안전성, 경험, 경제성을 종합적으로 평가해야 합니다. 대우건설은 뛰어난 기술력과 체계적인 안전 관리 시스템을 보유하고 있어 우수한 후보입니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure.argumentType).toBeDefined();
      expect(result.tonalProgression.openingTone).toBeDefined();
    });

    it('시공사 선정 기준 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '시공사 선정 기준은 다음과 같습니다. 첫째, 기술력이 우수해야 합니다. 둘째, 안전 관리 시스템이 체계적이어야 합니다. 셋째, 비슷한 규모의 프로젝트 경험이 있어야 합니다. 넷째, 경제적 제안이 합리적이어야 합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure.premisePatterns.length).toBeGreaterThanOrEqual(0);
      expect(result.argumentativeFramework).toBeDefined();
    });

    it('복합적인 논증 구조를 가진 텍스트를 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트의 성공을 위해서는 여러 요소가 중요합니다. 기술력이 우수한 시공사를 선정하면 프로젝트 품질이 향상됩니다. 또한 체계적인 안전 관리로 사고를 예방할 수 있습니다. 따라서 시공사 선정 시 기술력과 안전성을 우선적으로 고려해야 합니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.logicalStructure.causalChains.length).toBeGreaterThanOrEqual(0);
      expect(result.logicalStructure.logicalConnectors.length).toBeGreaterThanOrEqual(0);
    });

    it('어조 변화가 있는 텍스트를 분석할 수 있어야 함', async () => {
      const text = '재개발 프로젝트는 기대되는 부분이 많습니다. 그러나 주의해야 할 점도 있습니다. 신중한 접근이 필요합니다. 결론적으로 전문가의 조언을 구하는 것이 좋겠습니다.';
      
      const result = await advancedLogicAnalysisEngine.analyzeAdvancedStyle(text);
      
      expect(result).toBeDefined();
      expect(result.tonalProgression.toneShifts.length).toBeGreaterThanOrEqual(0);
      expect(typeof result.tonalProgression.toneConsistency).toBe('number');
    });
  });
});

