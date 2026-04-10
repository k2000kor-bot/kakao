/**
 * webCommentAnalysisService 테스트
 */
import webCommentAnalysisService from '../webCommentAnalysisService';
import type { WebComment } from '../webCommentAnalysisService';

const sampleComments: WebComment[] = [
  {
    id: '1',
    content: '정말 훌륭한 글이에요! 감사합니다.',
    author: 'user1',
    timestamp: new Date(),
    likes: 10,
    replies: [],
    sentiment: 'positive',
    topic: '테스트',
    keywords: ['훌륭', '감사']
  },
  {
    id: '2',
    content: '실망스러운 결과입니다.',
    author: 'user2',
    timestamp: new Date(),
    likes: 2,
    replies: [],
    sentiment: 'negative',
    topic: '테스트',
    keywords: ['실망']
  }
];

describe('webCommentAnalysisService', () => {
  describe('analyzeComments', () => {
    it('빈 배열 시 기본값 반환', () => {
      const result = webCommentAnalysisService.analyzeComments([]);

      expect(result.overallSentiment).toBe('neutral');
      expect(result.dominantTopics).toEqual([]);
      expect(result.averageLength).toBe(0);
      expect(result.engagementLevel).toBe('low');
    });

    it('댓글 분석 결과 반환', () => {
      const result = webCommentAnalysisService.analyzeComments(sampleComments);

      expect(result).toBeDefined();
      expect(result.overallSentiment).toMatch(/^(positive|negative|neutral)$/);
      expect(result.dominantTopics).toBeDefined();
      expect(Array.isArray(result.commonKeywords)).toBe(true);
      expect(typeof result.averageLength).toBe('number');
      expect(result.engagementLevel).toMatch(/^(high|medium|low)$/);
      expect(result.tone).toMatch(/^(formal|casual|professional|friendly)$/);
    });

    it('단일 댓글 분석 시 구조 검증', () => {
      const single = [sampleComments[0]];
      const result = webCommentAnalysisService.analyzeComments(single);

      expect(result.overallSentiment).toMatch(/^(positive|negative|neutral)$/);
      expect(Array.isArray(result.dominantTopics)).toBe(true);
      expect(Array.isArray(result.commonKeywords)).toBe(true);
      expect(result.averageLength).toBeGreaterThanOrEqual(0);
      expect(result.engagementLevel).toMatch(/^(high|medium|low)$/);
    });
  });

  describe('generateComment', () => {
    it('댓글 생성', async () => {
      const result = await webCommentAnalysisService.generateComment({
        originalContent: '원본 글 내용입니다.',
        comments: sampleComments,
        targetStyle: 'supportive',
        targetTone: 'friendly',
        targetLength: 'short'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.style).toBe('supportive');
      expect(result.tone).toBe('friendly');
      expect(result.length).toBe('short');
      expect(result.reasoning).toBeDefined();
    });

    it('다른 스타일/길이로 댓글 생성', async () => {
      const result = await webCommentAnalysisService.generateComment({
        originalContent: '기술 블로그 글입니다.',
        comments: sampleComments,
        targetStyle: 'informative',
        targetTone: 'professional',
        targetLength: 'medium'
      });

      expect(result).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.style).toBe('informative');
      expect(result.tone).toBe('professional');
      expect(result.length).toBe('medium');
    });
  });

  describe('extractCommentsFromWebSearch', () => {
    it('검색 쿼리로 댓글 추출', async () => {
      const result = await webCommentAnalysisService.extractCommentsFromWebSearch('React 튜토리얼');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('sentiment');
    });
  });
});
