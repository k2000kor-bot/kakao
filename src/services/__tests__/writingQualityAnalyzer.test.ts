/**
 * writingQualityAnalyzer 테스트
 */
import writingQualityAnalyzer from '../writingQualityAnalyzer';

describe('writingQualityAnalyzer', () => {
  describe('analyzeQuality', () => {
    it('글쓰기 품질 분석 결과 반환', () => {
      const content =
        '이 프로젝트는 매우 훌륭합니다. 그리고 사용자 경험을 개선합니다. 또한 성능 최적화를 수행합니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.strengths).toBeDefined();
      expect(result.weaknesses).toBeDefined();
    });

    it('통계값 포함 (단어/문자/문장 수)', () => {
      const content = '첫 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result.statistics.wordCount).toBeGreaterThan(0);
      expect(result.statistics.charCount).toBe(content.length);
      expect(result.statistics.sentenceCount).toBeGreaterThan(0);
      expect(result.statistics.paragraphCount).toBeGreaterThan(0);
    });

    it('메트릭 점수 0~100 범위', () => {
      const content = '간단한 테스트입니다. 문장이 짧습니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result.metrics.readability).toBeGreaterThanOrEqual(0);
      expect(result.metrics.readability).toBeLessThanOrEqual(100);
      expect(result.metrics.overall).toBeGreaterThanOrEqual(0);
      expect(result.metrics.overall).toBeLessThanOrEqual(100);
    });

    it('빈 문자열 처리', () => {
      const result = writingQualityAnalyzer.analyzeQuality('');

      expect(result.metrics).toBeDefined();
      expect(result.statistics.wordCount).toBe(0);
    });

    it('metrics에 readability, coherence, grammar, vocabulary, structure 포함', () => {
      const content = '품질 분석 테스트 문장입니다. 여러 문장으로 구성합니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result.metrics.readability).toBeDefined();
      expect(result.metrics.coherence).toBeDefined();
      expect(result.metrics.grammar).toBeDefined();
      expect(result.metrics.vocabulary).toBeDefined();
      expect(result.metrics.structure).toBeDefined();
      expect(result.metrics.overall).toBeDefined();
      expect(typeof result.metrics.readability).toBe('number');
      expect(typeof result.metrics.overall).toBe('number');
    });

    it('suggestions, strengths, weaknesses 배열 반환', () => {
      const content = '긴 글입니다. ' + '문장을 반복합니다. '.repeat(15);

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.weaknesses)).toBe(true);
    });
  });

  describe('analyzeStyle', () => {
    it('격식(formal) 스타일 인식', () => {
      const content =
        '저는 이 업무를 수행하시기 바랍니다. 감사드립니다. 배려하시기 바랍니다. 하시길 원합니다.';

      const result = writingQualityAnalyzer.analyzeStyle(content);

      expect(result.formality).toMatch(/^(formal|casual|mixed)$/);
      expect(result.tone).toMatch(/^(positive|neutral|negative)$/);
      expect(result.complexity).toMatch(/^(simple|moderate|complex)$/);
    });

    it('스타일 분석 결과 구조', () => {
      const content = '테스트입니다. 간단한 문장이에요.';

      const result = writingQualityAnalyzer.analyzeStyle(content);

      expect(result).toHaveProperty('formality');
      expect(result).toHaveProperty('tone');
      expect(result).toHaveProperty('complexity');
    });

    it('캐주얼 스타일 인식', () => {
      const content = '와 진짜 좋다! 맛있어요. 강추!';

      const result = writingQualityAnalyzer.analyzeStyle(content);

      expect(result.formality).toMatch(/^(formal|casual|mixed)$/);
      expect(result.tone).toMatch(/^(positive|neutral|negative)$/);
      expect(result.complexity).toMatch(/^(simple|moderate|complex)$/);
    });
  });

  describe('analyzeQuality 통계 상세', () => {
    it('statistics에 uniqueWords·vocabularyRichness·readingTime 포함', () => {
      const content = '품질 분석 테스트입니다. 여러 단어로 구성된 문장입니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result.statistics.uniqueWords).toBeDefined();
      expect(typeof result.statistics.uniqueWords).toBe('number');
      expect(result.statistics.vocabularyRichness).toBeDefined();
      expect(typeof result.statistics.vocabularyRichness).toBe('number');
      expect(result.statistics.readingTime).toBeDefined();
      expect(typeof result.statistics.readingTime).toBe('number');
    });

    it('statistics에 avgWordsPerSentence·avgCharsPerWord 포함', () => {
      const content = '첫 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.';

      const result = writingQualityAnalyzer.analyzeQuality(content);

      expect(result.statistics.avgWordsPerSentence).toBeDefined();
      expect(result.statistics.avgCharsPerWord).toBeDefined();
      expect(typeof result.statistics.avgWordsPerSentence).toBe('number');
      expect(typeof result.statistics.avgCharsPerWord).toBe('number');
    });
  });
});
