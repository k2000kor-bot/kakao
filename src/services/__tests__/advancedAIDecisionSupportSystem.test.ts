/**
 * advancedAIDecisionSupportSystem 서비스 테스트
 * 고급 AI 의사결정 지원 시스템 테스트
 */

import advancedAIDecisionSupportSystem from '../advancedAIDecisionSupportSystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn(),
}));

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedAIDecisionSupportSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 시스템 중지
    if (advancedAIDecisionSupportSystem) {
      try {
        advancedAIDecisionSupportSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIDecisionSupportSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIDecisionSupportSystem;
      const instance2 = advancedAIDecisionSupportSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('initializeSystem', () => {
    it('시스템을 초기화할 수 있어야 함', () => {
      advancedAIDecisionSupportSystem.initializeSystem();
      
      const contexts = advancedAIDecisionSupportSystem.getDecisionContexts();
      expect(Array.isArray(contexts)).toBe(true);
    });
  });

  describe('createDecisionContext', () => {
    it('의사결정 컨텍스트를 생성할 수 있어야 함', () => {
      const context = {
        user_id: 'user-123',
        session_id: 'session-123',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO', 'CTO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(realTimeAIAlertSystem.createAlert).toHaveBeenCalled();
    });

    it('생성된 컨텍스트를 조회할 수 있어야 함', () => {
      const context = {
        user_id: 'user-456',
        session_id: 'session-456',
        decision_type: 'operational' as const,
        domain: 'technical' as const,
        complexity: 'medium' as const,
        urgency: 'high' as const,
        stakeholders: ['Tech Lead'],
        constraints: ['Timeline: 2 weeks'],
        objectives: ['System stability'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.5,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      const contexts = advancedAIDecisionSupportSystem.getDecisionContexts();

      expect(contexts.length).toBeGreaterThan(0);
      const createdContext = contexts.find(ctx => ctx.id === contextId);
      expect(createdContext).toBeDefined();
      expect(createdContext?.user_id).toBe('user-456');
    });
  });

  describe('generateDecisionOptions', () => {
    it('의사결정 옵션을 생성할 수 있어야 함', () => {
      const context = {
        user_id: 'user-789',
        session_id: 'session-789',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      const options = advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('옵션이 올바른 구조를 가져야 함', () => {
      const context = {
        user_id: 'user-options',
        session_id: 'session-options',
        decision_type: 'operational' as const,
        domain: 'technical' as const,
        complexity: 'medium' as const,
        urgency: 'high' as const,
        stakeholders: ['Tech Lead'],
        constraints: ['Timeline: 2 weeks'],
        objectives: ['System stability'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.5,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      const options = advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);

      if (options.length > 0) {
        const option = options[0];
        expect(option.id).toBeDefined();
        expect(option.title).toBeDefined();
        expect(option.description).toBeDefined();
        expect(Array.isArray(option.pros)).toBe(true);
        expect(Array.isArray(option.cons)).toBe(true);
        expect(option.estimated_impact).toBeDefined();
        expect(typeof option.probability_of_success).toBe('number');
        expect(Array.isArray(option.risks)).toBe(true);
        expect(typeof option.confidence_level).toBe('number');
        expect(typeof option.ranking_score).toBe('number');
      }
    });

    it('존재하지 않는 컨텍스트에 대해 에러를 발생시켜야 함', () => {
      expect(() => {
        advancedAIDecisionSupportSystem.generateDecisionOptions('non-existent-context');
      }).toThrow();
    });
  });

  describe('performScenarioAnalysis', () => {
    it('시나리오 분석을 수행할 수 있어야 함', () => {
      const context = {
        user_id: 'user-scenario',
        session_id: 'session-scenario',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      const scenarios = advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);

      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThan(0);
    });

    it('시나리오가 올바른 구조를 가져야 함', () => {
      const context = {
        user_id: 'user-scenario-structure',
        session_id: 'session-scenario-structure',
        decision_type: 'operational' as const,
        domain: 'technical' as const,
        complexity: 'medium' as const,
        urgency: 'high' as const,
        stakeholders: ['Tech Lead'],
        constraints: ['Timeline: 2 weeks'],
        objectives: ['System stability'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.5,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      const scenarios = advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);

      if (scenarios.length > 0) {
        const scenario = scenarios[0];
        expect(scenario.id).toBeDefined();
        expect(scenario.scenario_name).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(typeof scenario.probability).toBe('number');
        expect(scenario.outcomes).toBeDefined();
        expect(scenario.outcomes.best_case).toBeDefined();
        expect(scenario.outcomes.most_likely).toBeDefined();
        expect(scenario.outcomes.worst_case).toBeDefined();
        expect(Array.isArray(scenario.sensitivity_analysis)).toBe(true);
        expect(Array.isArray(scenario.recommendations)).toBe(true);
      }
    });

    it('옵션이 없으면 에러를 발생시켜야 함', () => {
      const context = {
        user_id: 'user-no-options',
        session_id: 'session-no-options',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);

      expect(() => {
        advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);
      }).toThrow();
    });
  });

  describe('generateDecisionRecommendation', () => {
    it('의사결정 추천을 생성할 수 있어야 함', () => {
      const context = {
        user_id: 'user-recommendation',
        session_id: 'session-recommendation',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);
      const recommendation = advancedAIDecisionSupportSystem.generateDecisionRecommendation(contextId);

      expect(recommendation).toBeDefined();
      expect(recommendation.id).toBeDefined();
      expect(recommendation.decision_context_id).toBe(contextId);
      expect(recommendation.recommended_option).toBeDefined();
      expect(Array.isArray(recommendation.alternative_options)).toBe(true);
      expect(Array.isArray(recommendation.reasoning)).toBe(true);
      expect(typeof recommendation.confidence_level).toBe('number');
      expect(Array.isArray(recommendation.risk_assessment)).toBe(true);
      expect(recommendation.implementation_plan).toBeDefined();
      expect(recommendation.monitoring_plan).toBeDefined();
      expect(realTimeAIAlertSystem.createAlert).toHaveBeenCalled();
    });

    it('필요한 데이터가 없으면 에러를 발생시켜야 함', () => {
      const context = {
        user_id: 'user-no-data',
        session_id: 'session-no-data',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);

      expect(() => {
        advancedAIDecisionSupportSystem.generateDecisionRecommendation(contextId);
      }).toThrow();
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIDecisionSupportSystem.start();
      advancedAIDecisionSupportSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIDecisionSupportSystem.start();
      advancedAIDecisionSupportSystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIDecisionSupportSystem.start();
      advancedAIDecisionSupportSystem.start(); // 중복 호출
      advancedAIDecisionSupportSystem.stop();
    });
  });

  describe('getMetrics', () => {
    it('메트릭을 조회할 수 있어야 함', () => {
      const metrics = advancedAIDecisionSupportSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_decisions).toBe('number');
      expect(typeof metrics.successful_decisions).toBe('number');
      expect(typeof metrics.average_confidence).toBe('number');
      expect(typeof metrics.average_implementation_time).toBe('number');
      expect(typeof metrics.risk_mitigation_success_rate).toBe('number');
      expect(typeof metrics.stakeholder_satisfaction).toBe('number');
      expect(typeof metrics.decision_quality_score).toBe('number');
      expect(typeof metrics.system_utilization).toBe('number');
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태를 조회할 수 있어야 함', () => {
      const health = advancedAIDecisionSupportSystem.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'stopped']).toContain(health.status);
      expect(health.details).toBeDefined();
      expect(typeof health.details.active_contexts).toBe('number');
      expect(typeof health.details.pending_recommendations).toBe('number');
    });
  });

  describe('getDecisionOptions', () => {
    it('특정 컨텍스트의 옵션을 조회할 수 있어야 함', () => {
      const context = {
        user_id: 'user-get-options',
        session_id: 'session-get-options',
        decision_type: 'tactical' as const,
        domain: 'operational' as const,
        complexity: 'low' as const,
        urgency: 'medium' as const,
        stakeholders: ['Manager'],
        constraints: ['Budget: $50K'],
        objectives: ['Quick improvement'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.6,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      const options = advancedAIDecisionSupportSystem.getDecisionOptions(contextId);

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 컨텍스트는 빈 배열을 반환해야 함', () => {
      const options = advancedAIDecisionSupportSystem.getDecisionOptions('non-existent');
      
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(0);
    });
  });

  describe('getScenarioAnalyses', () => {
    it('특정 컨텍스트의 시나리오 분석을 조회할 수 있어야 함', () => {
      const context = {
        user_id: 'user-get-scenarios',
        session_id: 'session-get-scenarios',
        decision_type: 'emergency' as const,
        domain: 'security' as const,
        complexity: 'critical' as const,
        urgency: 'urgent' as const,
        stakeholders: ['Security Team'],
        constraints: ['Immediate action required'],
        objectives: ['Risk mitigation'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.3,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);
      const scenarios = advancedAIDecisionSupportSystem.getScenarioAnalyses(contextId);

      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 컨텍스트는 빈 배열을 반환해야 함', () => {
      const scenarios = advancedAIDecisionSupportSystem.getScenarioAnalyses('non-existent');
      
      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBe(0);
    });
  });

  describe('getRecommendations', () => {
    it('추천사항을 조회할 수 있어야 함', () => {
      const recommendations = advancedAIDecisionSupportSystem.getRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('생성된 추천사항을 조회할 수 있어야 함', () => {
      const context = {
        user_id: 'user-get-recommendations',
        session_id: 'session-get-recommendations',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['CEO'],
        constraints: ['Budget: $1M'],
        objectives: ['Revenue growth'],
        available_data: [],
        historical_decisions: [],
        risk_tolerance: 0.7,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);
      advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);
      advancedAIDecisionSupportSystem.generateDecisionRecommendation(contextId);

      const recommendations = advancedAIDecisionSupportSystem.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getDecisionHistory', () => {
    it('의사결정 히스토리를 조회할 수 있어야 함', () => {
      const history = advancedAIDecisionSupportSystem.getDecisionHistory();

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 시공사 선정 의사결정을 지원할 수 있어야 함', () => {
      const context = {
        user_id: 'user-redevelopment',
        session_id: 'session-redevelopment',
        decision_type: 'strategic' as const,
        domain: 'business' as const,
        complexity: 'high' as const,
        urgency: 'medium' as const,
        stakeholders: ['프로젝트 관리자', '건설 전문가', '재무 담당자'],
        constraints: ['예산: 100억원', '기간: 3년'],
        objectives: ['최적의 시공사 선정', '품질 보장', '일정 준수'],
        available_data: [
          { type: '시공사 정보', data: 'A사, B사, C사' },
          { type: '과거 실적', data: 'A사: 5건, B사: 3건, C사: 2건' },
        ],
        historical_decisions: [],
        risk_tolerance: 0.6,
        time_horizon: 'long' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      const options = advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);

      expect(options.length).toBeGreaterThan(0);

      const scenarios = advancedAIDecisionSupportSystem.performScenarioAnalysis(contextId);
      expect(scenarios.length).toBeGreaterThan(0);

      const recommendation = advancedAIDecisionSupportSystem.generateDecisionRecommendation(contextId);
      expect(recommendation).toBeDefined();
      expect(recommendation.recommended_option).toBeDefined();
      expect(recommendation.implementation_plan).toBeDefined();
    });

    it('시공사 선정 기준에 대한 의사결정 옵션을 생성할 수 있어야 함', () => {
      const context = {
        user_id: 'user-selection-criteria',
        session_id: 'session-selection-criteria',
        decision_type: 'operational' as const,
        domain: 'business' as const,
        complexity: 'medium' as const,
        urgency: 'high' as const,
        stakeholders: ['프로젝트 관리자'],
        constraints: ['빠른 결정 필요', '명확한 기준 필요'],
        objectives: ['공정한 선정', '투명성 확보'],
        available_data: [
          { type: '선정 기준', data: '경력, 기술력, 가격, 일정' },
        ],
        historical_decisions: [],
        risk_tolerance: 0.5,
        time_horizon: 'short' as const,
      };

      const contextId = advancedAIDecisionSupportSystem.createDecisionContext(context);
      const options = advancedAIDecisionSupportSystem.generateDecisionOptions(contextId);

      expect(options.length).toBeGreaterThan(0);
      
      if (options.length > 0) {
        const topOption = options[0];
        expect(topOption.ranking_score).toBeGreaterThanOrEqual(0);
        expect(topOption.confidence_level).toBeGreaterThanOrEqual(0);
        expect(topOption.confidence_level).toBeLessThanOrEqual(1);
      }
    });
  });
});

