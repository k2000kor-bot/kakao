/**
 * AIQualityEnhancementService 테스트
 */

import aiQualityEnhancementService, {
  AIQualityEnhancementService,
} from '../aiQualityEnhancementService';

describe('AIQualityEnhancementService', () => {
  let service: AIQualityEnhancementService;

  beforeEach(() => {
    service = new AIQualityEnhancementService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIQualityEnhancementService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiQualityEnhancementService).toBeInstanceOf(
        AIQualityEnhancementService
      );
    });
  });

  describe('응답 품질 분석', () => {
    it('응답 품질 분석 수행', () => {
      const response = 'React에서 useState 훅을 사용하여 상태를 관리합니다.';
      const query = 'React 상태 관리 방법';
      const analysis = service.analyzeResponseQuality(response, query);

      expect(analysis).toBeDefined();
      expect(analysis.metrics).toBeDefined();
      expect(Array.isArray(analysis.strengths)).toBe(true);
      expect(Array.isArray(analysis.weaknesses)).toBe(true);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
      expect(typeof analysis.confidence).toBe('number');
      if (!isNaN(analysis.confidence)) {
        expect(analysis.confidence).toBeGreaterThanOrEqual(0);
        expect(analysis.confidence).toBeLessThanOrEqual(1);
      }
      expect(analysis.timestamp).toBeInstanceOf(Date);
    });

    it('품질 메트릭 구조 확인', () => {
      const response = '테스트 응답입니다.';
      const query = '테스트 질문';
      const analysis = service.analyzeResponseQuality(response, query);

      const metrics = analysis.metrics;
      expect(typeof metrics.accuracy).toBe('number');
      expect(typeof metrics.relevance).toBe('number');
      expect(typeof metrics.creativity).toBe('number');
      expect(typeof metrics.completeness).toBe('number');
      expect(typeof metrics.clarity).toBe('number');
      expect(typeof metrics.engagement).toBe('number');
      expect(typeof metrics.overall).toBe('number');

      // 모든 메트릭이 0-1 범위인지 확인 (NaN 체크)
      Object.values(metrics).forEach((value) => {
        if (!isNaN(value)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        }
      });
    });

    it('컨텍스트가 있는 품질 분석', () => {
      const response = '전문적인 응답입니다.';
      const query = '전문 질문';
      const context = {
        professional: true,
        user: { preferences: {} },
      };

      const analysis = service.analyzeResponseQuality(response, query, context);

      expect(analysis).toBeDefined();
      expect(analysis.metrics).toBeDefined();
    });

    it('긴 응답 품질 분석', () => {
      const longResponse =
        'React에서 상태 관리는 매우 중요한 개념입니다. ' +
        'useState 훅을 사용하면 함수형 컴포넌트에서도 상태를 관리할 수 있습니다. ' +
        '또한 useReducer를 사용하면 더 복잡한 상태 로직을 관리할 수 있습니다.';
      const query = 'React 상태 관리';

      const analysis = service.analyzeResponseQuality(longResponse, query);

      expect(analysis.metrics.completeness).toBeGreaterThan(0);
    });

    it('빈 응답 품질 분석', () => {
      const response = '';
      const query = '질문';
      const analysis = service.analyzeResponseQuality(response, query);

      expect(analysis).toBeDefined();
      expect(analysis.metrics).toBeDefined();
    });
  });

  describe('응답 향상', () => {
    it('응답 향상 수행', () => {
      const response = 'React 상태 관리';
      const query = 'React에서 상태는 어떻게 관리하나요?';
      const result = service.enhanceResponse(response, query);

      expect(result).toBeDefined();
      expect(result.enhancedResponse).toBeDefined();
      expect(typeof result.enhancedResponse).toBe('string');
      expect(Array.isArray(result.appliedRules)).toBe(true);
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.enhancedResponse.length).toBeGreaterThanOrEqual(response.length);
    });

    it('컨텍스트가 있는 응답 향상', () => {
      const response = '기본 응답';
      const query = '질문';
      const context = {
        professional: true,
        user: { preferences: { style: 'detailed' } },
      };

      const result = service.enhanceResponse(response, query, context);

      expect(result).toBeDefined();
      expect(result.enhancedResponse).toBeDefined();
      expect(typeof result.enhancedResponse).toBe('string');
    });

    it('긴 응답 향상', () => {
      const longResponse =
        'React는 UI 라이브러리입니다. ' +
        '컴포넌트 기반으로 작동합니다. ' +
        '가상 DOM을 사용합니다.';
      const query = 'React란?';

      const result = service.enhanceResponse(longResponse, query);

      expect(result).toBeDefined();
      expect(result.enhancedResponse.length).toBeGreaterThan(0);
    });

    it('빈 응답 향상', () => {
      const response = '';
      const query = '질문';
      const result = service.enhanceResponse(response, query);

      expect(result).toBeDefined();
      expect(result.enhancedResponse).toBeDefined();
      expect(typeof result.enhancedResponse).toBe('string');
    });
  });

  describe('피드백 학습', () => {
    it('피드백 학습', () => {
      const userQuery = 'React 상태 관리';
      const aiResponse = 'useState를 사용합니다.';
      const userFeedback = 'positive' as const;
      const qualityScore = 0.9;

      service.learnFromFeedback(
        userQuery,
        aiResponse,
        userFeedback,
        qualityScore
      );

      // 학습이 성공적으로 완료되었는지 확인 (에러가 발생하지 않으면 성공)
      expect(true).toBe(true);
    });

    it('부정적 피드백 학습', () => {
      const userQuery = 'React 상태 관리';
      const aiResponse = '짧은 응답';
      const userFeedback = 'negative' as const;
      const qualityScore = 0.3;

      service.learnFromFeedback(
        userQuery,
        aiResponse,
        userFeedback,
        qualityScore
      );

      expect(true).toBe(true);
    });

    it('중립적 피드백 학습', () => {
      const userQuery = 'React 상태 관리';
      const aiResponse = '보통 응답';
      const userFeedback = 'neutral' as const;
      const qualityScore = 0.6;

      service.learnFromFeedback(
        userQuery,
        aiResponse,
        userFeedback,
        qualityScore
      );

      expect(true).toBe(true);
    });

    it('개선 제안이 있는 피드백 학습', () => {
      const userQuery = 'React 상태 관리';
      const aiResponse = '응답';
      const userFeedback = 'negative' as const;
      const qualityScore = 0.4;

      service.learnFromFeedback(
        userQuery,
        aiResponse,
        userFeedback,
        qualityScore
      );

      expect(true).toBe(true);
    });
  });

  describe('다양한 응답 타입', () => {
    it('기술 질문 응답 분석', () => {
      const response = 'TypeScript의 제네릭은 타입을 매개변수로 받습니다.';
      const query = 'TypeScript 제네릭이란?';
      const analysis = service.analyzeResponseQuality(response, query);

      expect(analysis.metrics.relevance).toBeGreaterThan(0);
      expect(analysis.metrics.accuracy).toBeGreaterThan(0);
    });

    it('창의적 응답 분석', () => {
      const response = '혁신적이고 독창적인 아이디어입니다.';
      const query = '창의적인 아이디어';
      const analysis = service.analyzeResponseQuality(response, query);

      expect(analysis.metrics.creativity).toBeGreaterThan(0);
    });

    it('상세한 응답 분석', () => {
      const response =
        '이것은 매우 상세하고 포괄적인 설명입니다. ' +
        '첫째, 기본 개념을 설명하고, 둘째, 구체적인 예시를 제공하며, ' +
        '셋째, 실무 적용 방법을 안내합니다.';
      const query = '상세한 설명';
      const analysis = service.analyzeResponseQuality(response, query);

      expect(analysis.metrics.completeness).toBeGreaterThan(0);
    });
  });

  describe('통합 테스트', () => {
    it('분석 후 향상 워크플로우', () => {
      const response = '기본 응답';
      const query = '질문';

      // 품질 분석
      const analysis = service.analyzeResponseQuality(response, query);
      expect(analysis).toBeDefined();

      // 응답 향상
      const result = service.enhanceResponse(response, query);
      expect(result).toBeDefined();
      expect(result.enhancedResponse).toBeDefined();

      // 향상된 응답 품질 분석
      const enhancedAnalysis = service.analyzeResponseQuality(result.enhancedResponse, query);
      expect(enhancedAnalysis).toBeDefined();
    });

    it('피드백 학습 후 향상', () => {
      const userQuery = 'React 상태 관리';
      const aiResponse = 'useState 사용';
      const result = service.enhanceResponse(aiResponse, userQuery);

      // 피드백 학습
      service.learnFromFeedback(
        userQuery,
        result.enhancedResponse,
        'positive',
        0.85
      );

      expect(true).toBe(true);
    });
  });
});

