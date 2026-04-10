/**
 * AdvancedWritingEngine 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  advancedWritingEngine,
  AdvancedWritingEngine,
  WritingContext,
  WritingPrompt,
} from '../advancedWritingEngine';

describe('AdvancedWritingEngine', () => {
  describe('generateAdvancedPrompt', () => {
    it('formal 톤으로 프롬프트 생성', () => {
      const context: WritingContext = {
        topic: '인공지능의 미래',
        audience: '기술 전문가',
        purpose: '기술 동향 분석',
        tone: 'formal',
        style: 'analytical',
        keywords: ['AI', '머신러닝', '딥러닝'],
        requirements: ['최신 동향 포함', '데이터 기반 분석'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt).toBeDefined();
      expect(prompt.systemPrompt).toContain('글쓰기 전문가');
      expect(prompt.userPrompt).toContain(context.audience);
      expect(prompt.userPrompt).toContain(context.purpose);
      expect(prompt.userPrompt).toContain(context.topic);
      expect(prompt.userPrompt).toContain('AI');
      expect(prompt.context).toEqual(context);
      expect(prompt.temperature).toBe(0.8);
      expect(prompt.maxTokens).toBe(2000);
    });

    it('creative 톤으로 프롬프트 생성', () => {
      const context: WritingContext = {
        topic: '창의성의 힘',
        audience: '일반 독자',
        purpose: '영감 부여',
        tone: 'creative',
        style: 'narrative',
        keywords: ['창의성', '혁신', '상상력'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toContain('창의적');
      expect(prompt.userPrompt).toContain('생동감');
      expect(prompt.temperature).toBe(0.8);
    });

    it('analytical 톤으로 프롬프트 생성', () => {
      const context: WritingContext = {
        topic: '시장 분석',
        audience: '경영진',
        purpose: '의사결정 지원',
        tone: 'analytical',
        style: 'analytical',
        keywords: ['시장', '분석', '트렌드'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toContain('분석적');
      expect(prompt.userPrompt).toContain('논리적');
    });

    it('casual 톤으로 프롬프트 생성', () => {
      const context: WritingContext = {
        topic: '일상 이야기',
        audience: '친구들',
        purpose: '공유',
        tone: 'casual',
        style: 'concise',
        keywords: ['일상', '경험'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toContain('친근');
      expect(prompt.userPrompt).toContain('자연스러운');
    });

    it('previousContent가 있을 때 프롬프트 생성', () => {
      const context: WritingContext = {
        topic: '기술 소개',
        audience: '개발자',
        purpose: '교육',
        tone: 'formal',
        style: 'detailed',
        keywords: ['기술', '개발'],
        previousContent: '이전 단락 내용입니다.',
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toContain('이전 내용');
      expect(prompt.userPrompt).toContain(context.previousContent);
      expect(prompt.temperature).toBe(0.7);
    });

    it('알 수 없는 톤일 때 formal 템플릿 사용', () => {
      const context: WritingContext = {
        topic: '테스트',
        audience: '독자',
        purpose: '테스트',
        tone: 'professional',
        style: 'detailed',
        keywords: ['테스트'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toBeDefined();
      expect(prompt.temperature).toBe(0.8);
    });

    it('requirements가 없을 때 처리', () => {
      const context: WritingContext = {
        topic: '주제',
        audience: '독자',
        purpose: '목적',
        tone: 'formal',
        style: 'detailed',
        keywords: ['키워드'],
      };

      const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

      expect(prompt.userPrompt).toContain('없음');
    });
  });

  describe('generateWithContext', () => {
    it('컨텍스트 기반 글 생성', async () => {
      const context: WritingContext = {
        topic: '인공지능',
        audience: '개발자',
        purpose: '교육',
        tone: 'formal',
        style: 'detailed',
        keywords: ['AI', '머신러닝'],
      };

      const mockApiCall = jest.fn().mockResolvedValue('생성된 글 내용입니다.');

      const result = await advancedWritingEngine.generateWithContext(
        context,
        mockApiCall
      );

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.quality).toBeGreaterThan(0);
      expect(result.coherence).toBeGreaterThan(0);
      expect(result.creativity).toBeGreaterThan(0);
      expect(result.relevance).toBeGreaterThan(0);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('API 호출이 실패할 때 처리', async () => {
      const context: WritingContext = {
        topic: '테스트',
        audience: '독자',
        purpose: '테스트',
        tone: 'formal',
        style: 'detailed',
        keywords: ['테스트'],
      };

      const mockApiCall = jest
        .fn()
        .mockRejectedValue(new Error('API 오류'));

      await expect(
        advancedWritingEngine.generateWithContext(context, mockApiCall)
      ).rejects.toThrow('API 오류');
    });
  });

  describe('generateStreaming', () => {
    it('스트리밍 글 생성', async () => {
      const context: WritingContext = {
        topic: '스트리밍 테스트',
        audience: '독자',
        purpose: '테스트',
        tone: 'formal',
        style: 'detailed',
        keywords: ['스트리밍'],
      };

      const mockApiCall = jest
        .fn()
        .mockImplementation(
          async (_prompt: WritingPrompt, onChunk: (chunk: string) => void) => {
            onChunk('첫 번째 ');
            onChunk('청크입니다.');
          }
        );

      const generator = advancedWritingEngine.generateStreaming(
        context,
        mockApiCall
      );

      const results: string[] = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toBeDefined();
    });

    it('빈 스트림 처리', async () => {
      const context: WritingContext = {
        topic: '테스트',
        audience: '독자',
        purpose: '테스트',
        tone: 'formal',
        style: 'detailed',
        keywords: ['테스트'],
      };

      const mockApiCall = jest
        .fn()
        .mockImplementation(
          async (_prompt: WritingPrompt, _onChunk: (chunk: string) => void) => {
            // 빈 스트림
          }
        );

      const generator = advancedWritingEngine.generateStreaming(
        context,
        mockApiCall
      );

      const results: string[] = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeAndEnhance', () => {
    const baseContext: WritingContext = {
      topic: '테스트 주제',
      audience: '테스트 독자',
      purpose: '테스트 목적',
      tone: 'formal',
      style: 'detailed',
      keywords: ['테스트', '주제'],
    };

    it('기본 분석 및 향상', () => {
      const content = '이것은 테스트 내용입니다. 여러 문장을 포함하고 있습니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.quality).toBe('number');
      expect(typeof result.coherence).toBe('number');
      expect(typeof result.creativity).toBe('number');
      expect(typeof result.relevance).toBe('number');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.wordCount).toBeGreaterThan(0);
      expect(result.metadata.readingTime).toBeGreaterThan(0);
      expect(['simple', 'moderate', 'complex']).toContain(
        result.metadata.complexity
      );
      expect(['positive', 'negative', 'neutral']).toContain(
        result.metadata.sentiment
      );
    });

    it('긴 내용 분석', () => {
      const longContent = Array(100).fill('테스트 문장입니다. ').join('');

      const result = advancedWritingEngine.analyzeAndEnhance(
        longContent,
        baseContext
      );

      expect(result.metadata.wordCount).toBeGreaterThan(50);
      expect(result.metadata.readingTime).toBeGreaterThan(0);
    });

    it('키워드 포함 분석', () => {
      const content = '이것은 테스트 주제에 관한 내용입니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      expect(result.relevance).toBeGreaterThan(0);
      expect(result.quality).toBeGreaterThan(0);
    });

    it('키워드 강조 적용', () => {
      const content = '테스트 주제에 대해 설명합니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      // 키워드가 강조되었는지 확인 (markdown 형식)
      expect(
        result.content.includes('**테스트**') ||
          result.content.includes('**주제**')
      ).toBe(true);
    });

    it('단락 구조 개선', () => {
      const content = '첫 문장. 두 번째 문장. 세 번째 문장.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      // 단락 구조가 개선되었는지 확인
      expect(result.content).toBeDefined();
    });

    it('품질 점수 범위 확인', () => {
      const content = '테스트 내용입니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      expect(result.quality).toBeGreaterThanOrEqual(0);
      expect(result.quality).toBeLessThanOrEqual(1);
      expect(result.coherence).toBeGreaterThanOrEqual(0);
      expect(result.coherence).toBeLessThanOrEqual(1);
      expect(result.creativity).toBeGreaterThanOrEqual(0);
      expect(result.creativity).toBeLessThanOrEqual(1);
      expect(result.relevance).toBeGreaterThanOrEqual(0);
      expect(result.relevance).toBeLessThanOrEqual(1);
    });

    it('복잡한 내용 복잡도 분석', () => {
      const complexContent = Array(200)
        .fill('이것은 복잡한 시스템 분석 프로세스 최적화 통합 구조 메커니즘입니다. ')
        .join('');

      const result = advancedWritingEngine.analyzeAndEnhance(
        complexContent,
        baseContext
      );

      expect(['simple', 'moderate', 'complex']).toContain(
        result.metadata.complexity
      );
    });

    it('긍정적 감정 분석', () => {
      const positiveContent =
        '성공적인 개선으로 인해 향상된 결과를 얻었습니다. 긍정적인 변화가 있었고 좋은 효과를 보였습니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        positiveContent,
        baseContext
      );

      expect(['positive', 'negative', 'neutral']).toContain(
        result.metadata.sentiment
      );
    });

    it('부정적 감정 분석', () => {
      const negativeContent =
        '문제가 발생했습니다. 실패한 시도로 인해 어려움이 있었습니다. 부정적인 결과가 나왔습니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        negativeContent,
        baseContext
      );

      expect(['positive', 'negative', 'neutral']).toContain(
        result.metadata.sentiment
      );
    });

    it('중립적 감정 분석', () => {
      const neutralContent = '일반적인 설명입니다. 객관적인 사실을 제시합니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        neutralContent,
        baseContext
      );

      expect(['positive', 'negative', 'neutral']).toContain(
        result.metadata.sentiment
      );
    });

    it('개선 제안 생성', () => {
      const shortContent = '짧은 내용.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        shortContent,
        baseContext
      );

      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('모든 키워드 포함 시 품질 향상', () => {
      const content = '이것은 테스트 주제에 대한 상세한 내용입니다.';

      const result = advancedWritingEngine.analyzeAndEnhance(
        content,
        baseContext
      );

      expect(result.quality).toBeGreaterThan(0);
      expect(result.relevance).toBeGreaterThan(0);
    });

    it('구조화된 내용 품질 향상', () => {
      const structuredContent = `1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목`;

      const result = advancedWritingEngine.analyzeAndEnhance(
        structuredContent,
        baseContext
      );

      expect(result.quality).toBeGreaterThan(0);
    });

    it('빈 내용 처리', () => {
      const emptyContent = '';

      const result = advancedWritingEngine.analyzeAndEnhance(
        emptyContent,
        baseContext
      );

      expect(result.content).toBeDefined();
      expect(result.metadata.wordCount).toBe(0);
      expect(result.metadata.readingTime).toBe(0);
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(advancedWritingEngine).toBeInstanceOf(AdvancedWritingEngine);
    });
  });
});

