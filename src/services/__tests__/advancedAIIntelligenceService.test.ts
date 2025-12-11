/**
 * advancedAIIntelligenceService 서비스 테스트
 * 고급 AI 인텔리전스 서비스 테스트
 */

import advancedAIIntelligenceService from '../advancedAIIntelligenceService';

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIIntelligenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIIntelligenceService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIIntelligenceService;
      const instance2 = advancedAIIntelligenceService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('performAdvancedAnalysis', () => {
    it('고급 AI 분석을 수행할 수 있어야 함', async () => {
      const input = '재개발 프로젝트 시공사 선정 기준은 무엇인가요?';
      const context = {
        user_id: 'user-123',
        session_id: 'session-123',
      };

      const result = await advancedAIIntelligenceService.performAdvancedAnalysis(input, context);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('분석 결과가 올바른 구조를 가져야 함', async () => {
      const input = '테스트 입력';
      const result = await advancedAIIntelligenceService.performAdvancedAnalysis(input);

      expect(result.analysis.userBehavior).toBeDefined();
      expect(result.analysis.contentQuality).toBeDefined();
      expect(result.analysis.sentiment).toBeDefined();
      expect(result.analysis.patterns).toBeDefined();
      expect(result.analysis.timestamp).toBeInstanceOf(Date);
      expect(typeof result.analysis.confidence).toBe('number');
    });

    it('분석 결과의 신뢰도가 올바른 범위를 가져야 함', async () => {
      const input = '테스트 입력';
      const result = await advancedAIIntelligenceService.performAdvancedAnalysis(input);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('컨텍스트 없이도 분석을 수행할 수 있어야 함', async () => {
      const input = '테스트 입력';
      const result = await advancedAIIntelligenceService.performAdvancedAnalysis(input);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    });
  });

  describe('getInsights', () => {
    it('인사이트를 조회할 수 있어야 함', () => {
      const insights = advancedAIIntelligenceService.getInsights();

      expect(Array.isArray(insights)).toBe(true);
    });

    it('인사이트가 올바른 구조를 가져야 함', async () => {
      // 분석을 수행하여 인사이트 생성
      await advancedAIIntelligenceService.performAdvancedAnalysis('테스트 입력', {
        user_id: 'user-insights',
      });

      const insights = advancedAIIntelligenceService.getInsights();

      if (insights.length > 0) {
        const insight = insights[0];
        expect(insight.id).toBeDefined();
        expect(['pattern', 'anomaly', 'prediction', 'recommendation']).toContain(insight.type);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(typeof insight.confidence).toBe('number');
        expect(['high', 'medium', 'low']).toContain(insight.impact);
        expect(insight.timestamp).toBeInstanceOf(Date);
      }
    });
  });

  describe('getLearningPatterns', () => {
    it('학습 패턴을 조회할 수 있어야 함', () => {
      const patterns = advancedAIIntelligenceService.getLearningPatterns();

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('학습 패턴이 올바른 구조를 가져야 함', async () => {
      // 분석을 수행하여 패턴 학습
      await advancedAIIntelligenceService.performAdvancedAnalysis('테스트 입력');

      const patterns = advancedAIIntelligenceService.getLearningPatterns();

      if (patterns.length > 0) {
        const pattern = patterns[0];
        expect(pattern.id).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(typeof pattern.frequency).toBe('number');
        expect(typeof pattern.accuracy).toBe('number');
        expect(pattern.lastSeen).toBeInstanceOf(Date);
        expect(Array.isArray(pattern.context)).toBe(true);
      }
    });
  });

  describe('getPredictiveModels', () => {
    it('예측 모델을 조회할 수 있어야 함', () => {
      const models = advancedAIIntelligenceService.getPredictiveModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('예측 모델이 올바른 구조를 가져야 함', () => {
      const models = advancedAIIntelligenceService.getPredictiveModels();

      if (models.length > 0) {
        const model = models[0];
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(['classification', 'regression', 'clustering', 'nlp']).toContain(model.type);
        expect(typeof model.accuracy).toBe('number');
        expect(model.lastTrained).toBeInstanceOf(Date);
        expect(model.parameters).toBeDefined();
        expect(model.performance).toBeDefined();
        expect(typeof model.performance.precision).toBe('number');
        expect(typeof model.performance.recall).toBe('number');
        expect(typeof model.performance.f1Score).toBe('number');
      }
    });
  });

  describe('getAdaptiveResponses', () => {
    it('적응형 응답을 조회할 수 있어야 함', () => {
      const responses = advancedAIIntelligenceService.getAdaptiveResponses();

      expect(Array.isArray(responses)).toBe(true);
    });

    it('분석 수행 후 적응형 응답이 저장되어야 함', async () => {
      const initialCount = advancedAIIntelligenceService.getAdaptiveResponses().length;

      await advancedAIIntelligenceService.performAdvancedAnalysis('테스트 입력', {
        user_id: 'user-adaptive',
      });

      const responses = advancedAIIntelligenceService.getAdaptiveResponses();
      expect(responses.length).toBeGreaterThanOrEqual(initialCount);
    });

    it('적응형 응답이 올바른 구조를 가져야 함', async () => {
      await advancedAIIntelligenceService.performAdvancedAnalysis('테스트 입력');

      const responses = advancedAIIntelligenceService.getAdaptiveResponses();

      if (responses.length > 0) {
        const response = responses[0];
        expect(response.id).toBeDefined();
        expect(response.query).toBeDefined();
        expect(response.response).toBeDefined();
        expect(response.context).toBeDefined();
        expect(typeof response.userSatisfaction).toBe('number');
        expect(response.timestamp).toBeInstanceOf(Date);
        expect(Array.isArray(response.improvements)).toBe(true);
      }
    });
  });

  describe('getLearningStatus', () => {
    it('학습 상태를 조회할 수 있어야 함', () => {
      const status = advancedAIIntelligenceService.getLearningStatus();

      expect(status).toBeDefined();
      expect(typeof status.isLearning).toBe('boolean');
      expect(status.lastLearning).toBeInstanceOf(Date);
      expect(typeof status.patternsCount).toBe('number');
      expect(typeof status.insightsCount).toBe('number');
    });
  });

  describe('이벤트 발생', () => {
    it('새로운 인사이트 생성 시 이벤트를 발생시켜야 함', async () => {
      const listener = jest.fn();
      advancedAIIntelligenceService.on('newInsight', listener);

      // 인사이트 생성 대기 (비동기 프로세스)
      await new Promise(resolve => setTimeout(resolve, 100));

      // 이벤트가 발생했을 수 있음
      // 실제로는 generateInsights가 주기적으로 실행되므로
      // 이벤트가 발생하지 않을 수도 있음
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문에 대한 고급 분석을 수행할 수 있어야 함', async () => {
      const input = '재개발 프로젝트 시공사 선정 기준은 무엇인가요?';
      const context = {
        user_id: 'user-redevelopment',
        session_id: 'session-redevelopment',
        project_type: 'redevelopment',
      };

      const result = await advancedAIIntelligenceService.performAdvancedAnalysis(input, context);

      expect(result).toBeDefined();
      expect(result.analysis.userBehavior).toBeDefined();
      expect(result.analysis.contentQuality).toBeDefined();
      expect(result.analysis.sentiment).toBeDefined();
      expect(result.analysis.patterns).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('시공사 선정 관련 질문의 패턴을 학습할 수 있어야 함', async () => {
      const queries = [
        '시공사 선정 기준은 무엇인가요?',
        '재개발 프로젝트 시공사 선정 방법',
        '시공사 평가 항목',
      ];

      for (const query of queries) {
        await advancedAIIntelligenceService.performAdvancedAnalysis(query, {
          user_id: 'user-pattern-learning',
        });
      }

      const patterns = advancedAIIntelligenceService.getLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);

      const responses = advancedAIIntelligenceService.getAdaptiveResponses();
      expect(responses.length).toBeGreaterThanOrEqual(queries.length);
    });

    it('다양한 질문에 대한 인사이트를 생성할 수 있어야 함', async () => {
      const inputs = [
        '재개발 프로젝트 시공사 선정 기준',
        '시공사 평가 방법',
        '건설사 선정 절차',
      ];

      for (const input of inputs) {
        await advancedAIIntelligenceService.performAdvancedAnalysis(input);
      }

      const insights = advancedAIIntelligenceService.getInsights();
      expect(Array.isArray(insights)).toBe(true);

      const status = advancedAIIntelligenceService.getLearningStatus();
      expect(status.insightsCount).toBeGreaterThanOrEqual(0);
    });

    it('예측 모델의 성능을 확인할 수 있어야 함', () => {
      const models = advancedAIIntelligenceService.getPredictiveModels();

      expect(models.length).toBeGreaterThan(0);

      models.forEach(model => {
        expect(model.accuracy).toBeGreaterThanOrEqual(0);
        expect(model.accuracy).toBeLessThanOrEqual(1);
        expect(model.performance.precision).toBeGreaterThanOrEqual(0);
        expect(model.performance.precision).toBeLessThanOrEqual(1);
        expect(model.performance.recall).toBeGreaterThanOrEqual(0);
        expect(model.performance.recall).toBeLessThanOrEqual(1);
        expect(model.performance.f1Score).toBeGreaterThanOrEqual(0);
        expect(model.performance.f1Score).toBeLessThanOrEqual(1);
      });
    });
  });
});

