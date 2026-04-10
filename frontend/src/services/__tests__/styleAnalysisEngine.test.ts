/**
 * StyleAnalysisEngine 테스트
 */
import styleAnalysisEngine from '../styleAnalysisEngine';
import type { StyleProfile } from '../styleAnalysisEngine';

const createMinimalProfile = (): StyleProfile => ({
  wordCount: 100,
  sentenceCount: 10,
  paragraphCount: 3,
  averageWordsPerSentence: 10,
  averageSentencesPerParagraph: 3.33,
  formality: 'formal',
  politeness: 'polite',
  emotionalTone: 'neutral',
  intensity: 'moderate',
  writingStyle: 'informative',
  voiceType: 'third_person',
  tenseDominance: 'present',
  vocabularyLevel: 'intermediate',
  technicalTerms: 5,
  foreignWords: 2,
  honorificUsage: 'moderate',
  sentenceComplexity: 'mixed',
  averageClausesPerSentence: 1.5,
  questionSentences: 0,
  exclamatorySentences: 0,
  rhetoricalDevices: [],
  metaphorUsage: 0.2,
  repetitionPatterns: [],
  argumentativeStance: 'neutral',
  certaintyLevel: 'confident',
  subjectivity: 'objective',
  transitionWords: ['그러나', '따라서'],
  logicalStructure: 'cause_effect',
  conclusionStyle: 'summary',
  uniquePhrases: [],
  characteristicExpressions: [],
  punctuationPatterns: {},
  targetAudience: 'general',
  purpose: 'inform',
  domain: 'business'
});

describe('StyleAnalysisEngine', () => {
  describe('analyzeStyle', () => {
    it('텍스트 스타일 분석', async () => {
      const result = await styleAnalysisEngine.analyzeStyle({
        text: '안녕하십니까. 본 문서는 스타일 분석 테스트를 위한 샘플 텍스트입니다. 여러 문장으로 구성되어 있으며, 분석 엔진이 다양한 특성을 추출할 수 있어야 합니다. 감사합니다.'
      });

      expect(result).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.profile.wordCount).toBeGreaterThan(0);
      expect(result.profile.sentenceCount).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.keyCharacteristics)).toBe(true);
      expect(typeof result.styleSignature).toBe('string');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('짧은 텍스트 분석', async () => {
      const result = await styleAnalysisEngine.analyzeStyle({
        text: '간단한 문장입니다.'
      });

      expect(result).toBeDefined();
      expect(result.profile.wordCount).toBeGreaterThan(0);
      expect(result.profile.sentenceCount).toBeGreaterThan(0);
    });

    it('context 옵션 전달', async () => {
      const result = await styleAnalysisEngine.analyzeStyle({
        text: '이 문서는 비즈니스 리포트입니다. 중요한 내용을 담고 있습니다.',
        context: '비즈니스 문서'
      });

      expect(result).toBeDefined();
      expect(result.profile.domain).toBeDefined();
    });
  });

  describe('prepareStyleCloning', () => {
    it('스타일 클로닝 준비 데이터 생성', () => {
      const profile = createMinimalProfile();
      const result = styleAnalysisEngine.prepareStyleCloning(profile);

      expect(result).toBeDefined();
      expect(result.structuralGuidelines).toBeDefined();
      expect(result.linguisticGuidelines).toBeDefined();
      expect(result.stylisticGuidelines).toBeDefined();
      expect(result.rhetoricalGuidelines).toBeDefined();
      expect(result.uniqueElements).toBeDefined();
      expect((result.structuralGuidelines as Record<string, unknown>).targetWordCount).toBe(100);
    });

    it('linguisticGuidelines에 formality·politeness 포함', () => {
      const profile = createMinimalProfile();
      const result = styleAnalysisEngine.prepareStyleCloning(profile);

      const linguistic = result.linguisticGuidelines as Record<string, unknown>;
      expect(linguistic.formality).toBe('formal');
      expect(linguistic.politeness).toBe('polite');
      expect(linguistic.emotionalTone).toBe('neutral');
    });

    it('stylisticGuidelines에 writingStyle·voiceType 포함', () => {
      const profile = createMinimalProfile();
      const result = styleAnalysisEngine.prepareStyleCloning(profile);

      const stylistic = result.stylisticGuidelines as Record<string, unknown>;
      expect(stylistic.writingStyle).toBe('informative');
      expect(stylistic.voiceType).toBe('third_person');
    });
  });

  describe('analyzeStyle 응답 구조', () => {
    it('keyCharacteristics·styleSignature·recommendations 반환', async () => {
      const result = await styleAnalysisEngine.analyzeStyle({
        text: '비즈니스 문서입니다. 중요한 내용을 전달합니다. 요약하면 핵심 사항입니다.'
      });

      expect(Array.isArray(result.keyCharacteristics)).toBe(true);
      expect(typeof result.styleSignature).toBe('string');
      expect(result.styleSignature.length).toBeGreaterThan(0);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});
