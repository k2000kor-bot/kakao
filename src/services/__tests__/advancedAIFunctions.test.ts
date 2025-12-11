/**
 * advancedAIFunctions 서비스 테스트
 * 고급 AI 기능 함수들 테스트
 */

import {
  evaluateAnswerQuality,
  enhanceAnswerQuality,
  improveAnswerContent,
  createQualityReview,
  calculateStatistics,
} from '../advancedAIFunctions';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('advancedAIFunctions', () => {
  describe('evaluateAnswerQuality', () => {
    it('답변 품질을 올바르게 평가해야 함', () => {
      const question = 'React 컴포넌트 작성 방법';
      const content = 'React 컴포넌트는 함수형 또는 클래스형으로 작성할 수 있습니다. **함수형 컴포넌트**는 간단하고 현대적인 방식입니다. 예를 들어, const MyComponent = () => { return <div>Hello</div>; }와 같이 작성합니다.';

      const result = evaluateAnswerQuality(content, question);

      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('completeness');
      expect(result).toHaveProperty('clarity');
      expect(result).toHaveProperty('relevance');
      expect(result).toHaveProperty('depth');
      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('짧은 답변의 품질을 평가해야 함', () => {
      const question = '테스트 질문';
      const content = '짧은 답변';

      const result = evaluateAnswerQuality(content, question);

      expect(result.overallScore).toBeDefined();
      expect(result.completeness).toBeLessThan(100);
    });

    it('긴 답변의 품질을 평가해야 함', () => {
      const question = '상세한 설명이 필요한 질문';
      const content = 'A'.repeat(1000) + ' **섹션 1** 내용 **섹션 2** 내용 **섹션 3** 내용';

      const result = evaluateAnswerQuality(content, question);

      expect(result.completeness).toBeGreaterThan(50);
      expect(result.overallScore).toBeDefined();
    });

    it('키워드 매칭을 기반으로 정확도를 평가해야 함', () => {
      const question = 'React 컴포넌트';
      const content = 'React 컴포넌트에 대한 설명입니다. 컴포넌트는 재사용 가능한 UI 요소입니다.';

      const result = evaluateAnswerQuality(content, question);

      expect(result.accuracy).toBeGreaterThan(0);
    });
  });

  describe('enhanceAnswerQuality', () => {
    it('품질이 낮은 답변을 개선해야 함', async () => {
      const question = '테스트 질문';
      const content = '짧은 답변';

      const result = await enhanceAnswerQuality(content, question);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual(content.length);
    });

    it('품질이 높은 답변은 그대로 반환해야 함', async () => {
      const question = 'React 컴포넌트 작성 방법';
      const content = 'React 컴포넌트는 함수형 또는 클래스형으로 작성할 수 있습니다. **함수형 컴포넌트**는 간단하고 현대적인 방식입니다. 예를 들어, const MyComponent = () => { return <div>Hello</div>; }와 같이 작성합니다. **클래스형 컴포넌트**는 class 키워드를 사용합니다. **장점**은 생명주기 메서드를 사용할 수 있다는 점입니다.';

      const result = await enhanceAnswerQuality(content, question);

      expect(typeof result).toBe('string');
    });
  });

  describe('improveAnswerContent', () => {
    it('낮은 정확도에 대한 개선 제안을 추가해야 함', async () => {
      const content = '기본 답변';
      const question = '테스트 질문';
      const metrics = { accuracy: 50, completeness: 80, clarity: 80 };

      const result = await improveAnswerContent(content, question, metrics);

      expect(result).toContain('정보 검증 참고사항');
    });

    it('낮은 완성도에 대한 개선 제안을 추가해야 함', async () => {
      const content = '기본 답변';
      const question = '테스트 질문';
      const metrics = { accuracy: 80, completeness: 50, clarity: 80 };

      const result = await improveAnswerContent(content, question, metrics);

      expect(result).toContain('추가 분석 제안');
    });

    it('낮은 명확성에 대한 개선 제안을 추가해야 함', async () => {
      const content = '**핵심 포인트 1** 내용 **핵심 포인트 2** 내용 **핵심 포인트 3** 내용';
      const question = '테스트 질문';
      const metrics = { accuracy: 80, completeness: 80, clarity: 50 };

      const result = await improveAnswerContent(content, question, metrics);

      expect(result).toContain('핵심 요약');
    });
  });

  describe('createQualityReview', () => {
    it('품질 검토를 생성해야 함', () => {
      const messageId = 'test-message-1';
      const content = 'React 컴포넌트는 함수형 또는 클래스형으로 작성할 수 있습니다.';
      const question = 'React 컴포넌트 작성 방법';

      const result = createQualityReview(messageId, content, question);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('messageId', messageId);
      expect(result).toHaveProperty('reviewer', 'ai');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('status', 'reviewed');
      expect(result).toHaveProperty('timestamp');
    });

    it('낮은 품질에 대한 피드백을 생성해야 함', () => {
      const messageId = 'test-message-2';
      const content = '짧은 답변';
      const question = '테스트 질문';

      const result = createQualityReview(messageId, content, question);

      expect(result.feedback).toBeInstanceOf(Array);
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('performStatisticalAnalysis', () => {
    it('통계 분석을 수행해야 함', () => {
      const data = { data: [85, 92, 78, 95, 88, 91, 87, 93, 89, 90] };
      const { performStatisticalAnalysis } = require('../advancedAIFunctions');

      const result = performStatisticalAnalysis(data);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});

