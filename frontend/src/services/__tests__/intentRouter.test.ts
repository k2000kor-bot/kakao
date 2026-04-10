/**
 * intentRouter 서비스 테스트
 * 의도 감지 기능 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { detectIntent } from '../intentRouter';

describe('intentRouter', () => {
  describe('detectIntent', () => {
    it('summary 키워드로 요약 의도를 감지해야 함', () => {
      const result = detectIntent('summary of this document');

      expect(result.intent).toBe('summarize');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.hints.length).toBeGreaterThan(0);
    });

    it('summarize 키워드로 요약 의도를 감지해야 함', () => {
      const result = detectIntent('summarize this document');

      expect(result.intent).toBe('summarize');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('plan 키워드로 계획 의도를 감지해야 함', () => {
      const result = detectIntent('plan for this project');

      expect(result.intent).toBe('plan');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('roadmap 키워드로 계획 의도를 감지해야 함', () => {
      const result = detectIntent('create a roadmap for this project');

      expect(result.intent).toBe('plan');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('compare 키워드로 비교 의도를 감지해야 함', () => {
      const result = detectIntent('compare React vs Vue');

      expect(result.intent).toBe('compare');
      expect(result.confidence).toBeGreaterThan(0.5);
    });


    it('analyze 키워드로 분석 의도를 감지해야 함', () => {
      const result = detectIntent('analyze this problem');

      expect(result.intent).toBe('analyze');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('why 키워드로 분석 의도를 감지해야 함', () => {
      const result = detectIntent('why is this happening');

      expect(result.intent).toBe('analyze');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('code 키워드로 코드 의도를 감지해야 함', () => {
      const result = detectIntent('write code in TypeScript');

      expect(result.intent).toBe('code');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('ts 키워드로 코드 의도를 감지해야 함', () => {
      const result = detectIntent('show me ts example');

      expect(result.intent).toBe('code');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('js 키워드로 코드 의도를 감지해야 함', () => {
      const result = detectIntent('show me js example');

      expect(result.intent).toBe('code');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('table 키워드로 표 의도를 감지해야 함', () => {
      const result = detectIntent('create a table from this data');

      expect(result.intent).toBe('table');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('write 키워드로 작성 의도를 감지해야 함', () => {
      const result = detectIntent('write a report');

      expect(result.intent).toBe('write');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('draft 키워드로 작성 의도를 감지해야 함', () => {
      const result = detectIntent('draft a document');

      expect(result.intent).toBe('write');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('질문 의도를 감지해야 함 (물음표로 끝나는 경우)', () => {
      const result = detectIntent('React는 무엇인가요?');

      expect(result.intent).toBe('qa');
      expect(result.confidence).toBeGreaterThan(0.5);
    });


    it('의도가 명확하지 않으면 other를 반환해야 함', () => {
      const result = detectIntent('안녕하세요');

      expect(result.intent).toBe('other');
      expect(result.confidence).toBe(0.5);
    });

    it('대소문자 구분 없이 감지해야 함', () => {
      const englishUpperResult = detectIntent('SUMMARIZE this document');
      const englishLowerResult = detectIntent('summarize this document');
      const englishMixedResult = detectIntent('Summarize This Document');

      expect(englishUpperResult.intent).toBe('summarize');
      expect(englishLowerResult.intent).toBe('summarize');
      expect(englishMixedResult.intent).toBe('summarize');
    });

    it('confidence는 0과 1 사이여야 함', () => {
      const result = detectIntent('테스트 메시지');

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('hints는 배열이어야 함', () => {
      const result = detectIntent('요약해줘');

      expect(Array.isArray(result.hints)).toBe(true);
    });

    it('python 키워드로 코드 의도를 감지해야 함', () => {
      const result = detectIntent('write python code for hello world');
      expect(result.intent).toBe('code');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('root cause 키워드로 분석 의도를 감지해야 함', () => {
      const result = detectIntent('find root cause of the bug');
      expect(result.intent).toBe('analyze');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('빈 문자열은 other 의도여야 함', () => {
      const result = detectIntent('');
      expect(result.intent).toBe('other');
      expect(result.confidence).toBe(0.5);
      expect(result.hints).toEqual([]);
    });
  });
});

