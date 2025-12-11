/**
 * ConstructionAnalyticsService 테스트
 */

import {
  ConstructionAnalyticsService,
  constructionAnalyticsService,
} from '../constructionAnalytics';

// fetch 모킹
global.fetch = jest.fn();

describe('ConstructionAnalyticsService', () => {
  let service: ConstructionAnalyticsService;

  beforeEach(() => {
    service = new ConstructionAnalyticsService();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConstructionAnalyticsService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(constructionAnalyticsService).toBeDefined();
    });

    it('현재 상태 조회', () => {
      const state = service.getCurrentState();

      expect(state).toBeDefined();
      expect(typeof state.has_companies_data).toBe('boolean');
      expect(typeof state.companies_count).toBe('number');
      expect(typeof state.has_evaluation_result).toBe('boolean');
      expect(typeof state.has_knowledge_base).toBe('boolean');
    });
  });

  describe('비교집 자료 업로드', () => {
    it('파일 업로드', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          message: '업로드 완료',
          companies: ['company1', 'company2'],
          processed_data: {
            company1: {
              company_id: 'company1',
              company_name: '회사1',
              technical_specs: {},
              financial_data: {},
              project_history: [],
              certifications: [],
              evaluation_scores: {},
              strengths: [],
              weaknesses: [],
              risk_factors: [],
              competitive_advantages: [],
            },
          },
        }),
      });

      const file = new File(['test'], 'comparison.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const result = await service.uploadComparisonData(file, '재개발');

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(Array.isArray(result.companies)).toBe(true);
      expect(result.processed_data).toBeDefined();
    });

    it('업로드 실패 처리', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      const file = new File(['test'], 'comparison.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await expect(service.uploadComparisonData(file, '재개발')).rejects.toThrow();
    });
  });

  describe('시공사 분석', () => {
    it('회사 분석 수행', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          analysis_result: {
            weighted_scores: { company1: 0.85 },
            qualified_companies: ['company1'],
            risk_assessments: {
              company1: {
                risk_level: 'low',
                risk_factors: [],
                mitigation_strategies: [],
                overall_risk_score: 0.2,
              },
            },
            recommendation_logic: {
              ranking: [{ company_id: 'company1', score: 0.85 }],
              primary_recommendation: 'company1',
              alternative_options: [],
              decision_factors: [],
              comparative_analysis: {},
            },
            decision_rationale: '분석 결과',
          },
          criteria_applied: {
            project_type: '재개발',
            budget_range: [1000000000, 2000000000],
            timeline: 24,
            priority_weights: {},
            mandatory_requirements: [],
            preferred_features: [],
            risk_tolerance: 'medium',
          },
          companies_analyzed: 1,
        }),
      });

      const criteria = {
        project_type: '재개발',
        budget_range: [1000000000, 2000000000] as [number, number],
        timeline: 24,
        priority_weights: {},
        mandatory_requirements: [],
        preferred_features: [],
        risk_tolerance: 'medium' as const,
      };

      const result = await service.analyzeCompanies(criteria);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.analysis_result).toBeDefined();
      expect(result.companies_analyzed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('메시지 생성', () => {
    it('추천 메시지 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          message_data: {
            message_id: 'msg-1',
            timestamp: new Date().toISOString(),
            message_type: 'recommendation',
            generated_content: {
              title: '추천 메시지',
              content: '메시지 내용',
              summary: '요약',
            },
            decision_logic: {
              weighted_scores: {},
              qualified_companies: [],
              risk_assessments: {},
              recommendation_logic: {
                ranking: [],
                primary_recommendation: null,
                alternative_options: [],
                decision_factors: [],
                comparative_analysis: {},
              },
              decision_rationale: '',
            },
          },
          generation_info: {
            message_type: 'recommendation',
            target_audience: 'management',
            include_details: true,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await service.generateMessage('recommendation', true, 'management');

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.message_data).toBeDefined();
      expect(result.generation_info).toBeDefined();
    });

    it('비교 메시지 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          message_data: {
            message_id: 'msg-2',
            timestamp: new Date().toISOString(),
            message_type: 'comparison',
            generated_content: {
              title: '비교 메시지',
              content: '비교 내용',
              summary: '요약',
            },
            decision_logic: {
              weighted_scores: {},
              qualified_companies: [],
              risk_assessments: {},
              recommendation_logic: {
                ranking: [],
                primary_recommendation: null,
                alternative_options: [],
                decision_factors: [],
                comparative_analysis: {},
              },
              decision_rationale: '',
            },
          },
          generation_info: {
            message_type: 'comparison',
            target_audience: 'technical',
            include_details: true,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await service.generateMessage('comparison', true, 'technical');

      expect(result).toBeDefined();
      expect(result.message_data.message_type).toBe('comparison');
    });
  });

  describe('평가 기준 조회', () => {
    it('평가 기준 목록 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          criteria: {
            technical: {
              name: '기술력',
              description: '기술적 역량',
              weight_range: [0.1, 0.3] as [number, number],
              data_type: 'number',
            },
          },
          total_criteria: 1,
          weight_total: 1.0,
        }),
      });

      const result = await service.getEvaluationCriteria();

      expect(result).toBeDefined();
      expect(result.criteria).toBeDefined();
      expect(typeof result.total_criteria).toBe('number');
      expect(typeof result.weight_total).toBe('number');
    });
  });

  describe('지식 베이스 조회', () => {
    it('지식 베이스 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          knowledge_base: {
            evaluation_guidelines: {
              technical: {
                weight_range: [0.1, 0.3] as [number, number],
                key_indicators: ['기술력', '경험'],
                evaluation_logic: '기술적 역량 평가',
              },
            },
            decision_patterns: {
              redevelopment: {
                primary_criteria: ['기술력', '재정'],
                risk_considerations: ['공사 기간', '예산'],
                message_template: '템플릿',
              },
            },
          },
        }),
      });

      const result = await service.getKnowledgeBase();

      expect(result).toBeDefined();
      expect(result.knowledge_base).toBeDefined();
    });
  });

  describe('의사결정 저장', () => {
    it('의사결정 저장', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          message: '저장 완료',
          decision_id: 'decision-1',
        }),
      });

      const decisionData = {
        selected_company: 'company1',
        decision_rationale: '선택 이유',
      };

      const result = await service.saveDecision(decisionData);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });
  });

  describe('의사결정 이력 조회', () => {
    it('의사결정 이력 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          decisions: [
            {
              decision_id: 'decision-1',
              timestamp: new Date().toISOString(),
              selected_company: 'company1',
            },
          ],
          total_decisions: 1,
        }),
      });

      const result = await service.getDecisionHistory();

      expect(result).toBeDefined();
      expect(Array.isArray(result.decisions)).toBe(true);
      expect(typeof result.total_decisions).toBe('number');
    });
  });

  describe('데이터 초기화', () => {
    it('데이터 초기화', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          message: '초기화 완료',
        }),
      });

      const result = await service.resetData();

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });
  });

  describe('로컬 데이터 접근', () => {
    it('회사 데이터 접근', () => {
      const data = service.getCompaniesData();

      expect(typeof data).toBe('object');
    });

    it('평가 결과 접근', () => {
      const result = service.getEvaluationResult();

      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('지식 베이스 데이터 접근', () => {
      const data = service.getKnowledgeBaseData();

      expect(data === null || typeof data === 'object').toBe(true);
    });
  });
});

