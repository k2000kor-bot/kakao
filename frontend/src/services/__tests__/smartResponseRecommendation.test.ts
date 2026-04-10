/**
 * SmartResponseRecommendation 테스트
 */
import smartResponseRecommendation from '../smartResponseRecommendation';
import type { ConversationContext } from '../smartResponseRecommendation';

const createContext = (overrides: Partial<ConversationContext> = {}): ConversationContext => ({
  recentQuestions: [],
  userPreferences: {
    detailLevel: 'balanced',
    responseStyle: 'conversational',
    language: 'korean'
  },
  ...overrides
});

describe('SmartResponseRecommendation', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('analyzeQuestionPattern', () => {
    it('기술 질문 패턴 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('코드 작성 방법을 알려주세요', context);

      expect(pattern.category).toBe('technical');
      expect(['simple', 'moderate', 'complex']).toContain(pattern.complexity);
      expect(pattern.preferredStyle).toBe('conversational');
    });

    it('실습 질문 패턴 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('예제 구현을 도와주세요', context);

      expect(pattern.category).toBe('practical');
      expect(pattern.keywords.length).toBeLessThanOrEqual(5);
    });

    it('복잡도 simple 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('간단한 기본 개념을 알려주세요', context);

      expect(pattern.complexity).toBe('simple');
    });

    it('복잡도 complex 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('아키텍처 설계 최적화 방법', context);

      expect(pattern.complexity).toBe('complex');
    });

    it('개념 질문 패턴 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('이론과 방법론을 알려주세요', context);

      expect(pattern.category).toBe('conceptual');
      expect(pattern.keywords.length).toBeLessThanOrEqual(5);
    });

    it('트러블슈팅 질문 패턴 분석', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('오류 해결과 디버깅 방법', context);

      expect(pattern.category).toBe('troubleshooting');
    });

    it('매칭되는 카테고리가 없으면 general 반환', () => {
      const context = createContext();
      const pattern = smartResponseRecommendation.analyzeQuestionPattern('안녕하세요', context);

      expect(pattern.category).toBe('general');
      expect(pattern.complexity).toBe('moderate');
    });
  });

  describe('generateRecommendations', () => {
    it('추천 목록 생성', () => {
      const context = createContext();
      const recommendations = smartResponseRecommendation.generateRecommendations(
        '코드 예제를 보여주세요',
        '기본적인 예시입니다.',
        context
      );

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('reasoning');
        expect(rec).toHaveProperty('suggestedAction');
        expect(['enhancement', 'alternative', 'followup']).toContain(rec.type);
      });
    });

    it('confidence 내림차순 정렬', () => {
      const context = createContext();
      const recommendations = smartResponseRecommendation.generateRecommendations(
        '비교 분석 해주세요',
        '비교 결과입니다.',
        context
      );

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i].confidence).toBeLessThanOrEqual(recommendations[i - 1].confidence);
      }
    });

    it('빈 응답으로도 추천 목록을 반환해야 함', () => {
      const context = createContext();
      const recommendations = smartResponseRecommendation.generateRecommendations(
        '질문입니다',
        '',
        context
      );

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('suggestedAction');
      });
    });
  });

  describe('generatePersonalizedRecommendations', () => {
    it('개인화된 추천 생성', () => {
      const context = createContext();
      const recommendations = smartResponseRecommendation.generatePersonalizedRecommendations(
        '개발 방법론을 알려주세요',
        context
      );

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1.1);
      });
    });
  });

  describe('learnUserPreferences', () => {
    it('사용자 피드백 학습 호출 시 에러 없음', () => {
      const context = createContext();
      expect(() => {
        smartResponseRecommendation.learnUserPreferences(
          '질문입니다',
          '응답입니다',
          { rating: 5, helpful: true, detailed: true },
          context
        );
      }).not.toThrow();
    });
  });
});
