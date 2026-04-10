/**
 * UltimateStyleCloningService 테스트
 */
import ultimateStyleCloningService from '../ultimateStyleCloningService';

describe('UltimateStyleCloningService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('analyzeUltimateStyle', () => {
    it('궁극적 스타일 분석', async () => {
      const result = await ultimateStyleCloningService.analyzeUltimateStyle({
        originalText: '환경 보호는 우리 모두의 책임입니다. 지속 가능한 미래를 위해 노력해야 합니다.',
        analysisDepth: 'basic',
        preserveNuances: true,
        extractPersonality: false
      });

      expect(result).toBeDefined();
      expect(result.basicStyleProfile).toBeDefined();
      expect(result.advancedStyleProfile).toBeDefined();
      expect(result.comprehensiveAnalysis).toBeDefined();
      expect(result.styleSignature).toBeDefined();
      expect(typeof result.analysisConfidence).toBe('number');
      expect(result.analysisQuality).toBeDefined();
    });

    it('advanced 분석 깊이로 분석', async () => {
      const result = await ultimateStyleCloningService.analyzeUltimateStyle({
        originalText: '인공지능은 미래 산업의 핵심입니다. 데이터와 알고리즘이 경쟁력을 좌우합니다.',
        analysisDepth: 'advanced',
        preserveNuances: true,
        extractPersonality: false
      });

      expect(result).toBeDefined();
      expect(result.comprehensiveAnalysis.coreCharacteristics).toBeDefined();
      expect(Array.isArray(result.comprehensiveAnalysis.coreCharacteristics)).toBe(true);
      expect(result.styleSignature.keyElements).toBeDefined();
      expect(Array.isArray(result.styleSignature.keyElements)).toBe(true);
    });
  });

  describe('quickStyleClone', () => {
    it('빠른 스타일 복제', async () => {
      const result = await ultimateStyleCloningService.quickStyleClone(
        '환경 보호는 중요한 과제입니다.',
        '인공지능의 미래'
      );

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('preserveLength 옵션 적용', async () => {
      const result = await ultimateStyleCloningService.quickStyleClone(
        '간단한 문장입니다.',
        '새 주제',
        { preserveLength: true }
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('cloneUltimateStyle', () => {
    it('궁극적 스타일 복제', async () => {
      const result = await ultimateStyleCloningService.cloneUltimateStyle({
        originalText: '환경 보호는 우리의 미래를 좌우합니다. 지속 가능한 발전이 필요합니다.',
        newTopic: '디지털 변혁',
        cloneAccuracy: 'close'
      });

      expect(result).toBeDefined();
      expect(result.clonedText).toBeDefined();
      expect(typeof result.clonedText).toBe('string');
      expect(result.cloneQuality).toBeDefined();
      expect(result.comparisonAnalysis).toBeDefined();
    });

    it('cloneAccuracy exact로 복제 시 결과 구조 검증', async () => {
      const result = await ultimateStyleCloningService.cloneUltimateStyle({
        originalText: '간결한 문장. 두 번째 문장.',
        newTopic: '새 주제',
        cloneAccuracy: 'exact'
      });

      expect(result.clonedText.length).toBeGreaterThan(0);
      expect(result.cloneQuality).toBeDefined();
      expect(result.comparisonAnalysis).toBeDefined();
      expect(typeof result.cloneQuality).toBe('object');
    });
  });
});
