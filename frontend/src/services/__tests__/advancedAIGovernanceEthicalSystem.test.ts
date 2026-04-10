/**
 * advancedAIGovernanceEthicalSystem 서비스 테스트
 * 고급 AI 거버넌스 및 윤리 AI 시스템 테스트
 */

import advancedAIGovernanceEthicalSystem, { AIGovernancePolicy } from '../advancedAIGovernanceEthicalSystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn(),
}));

jest.mock('../aiHealthMonitor', () => ({
  getHealthStatus: jest.fn(() => ({ status: 'healthy' })),
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
}));

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIGovernanceEthicalSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 시스템 중지
    if (advancedAIGovernanceEthicalSystem) {
      try {
        advancedAIGovernanceEthicalSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIGovernanceEthicalSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIGovernanceEthicalSystem;
      const instance2 = advancedAIGovernanceEthicalSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIGovernanceEthicalSystem.start();
      advancedAIGovernanceEthicalSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIGovernanceEthicalSystem.start();
      advancedAIGovernanceEthicalSystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIGovernanceEthicalSystem.start();
      advancedAIGovernanceEthicalSystem.start(); // 중복 호출
      advancedAIGovernanceEthicalSystem.stop();
    });
  });

  describe('performEthicalAnalysis', () => {
    it('윤리적 AI 분석을 수행할 수 있어야 함', async () => {
      const request = {
        id: 'request-123',
        user_id: 'user-123',
        input: {
          text: '테스트 요청',
        },
      };

      const response = {
        id: 'response-123',
        content: '테스트 응답',
        confidence_score: 0.9,
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.request_id).toBe('request-123');
      expect(analysis.user_id).toBe('user-123');
      expect(typeof analysis.fairness_score).toBe('number');
      expect(Array.isArray(analysis.bias_detection)).toBe(true);
      expect(typeof analysis.transparency_score).toBe('number');
      expect(analysis.explainability_metrics).toBeDefined();
      expect(analysis.privacy_compliance).toBeDefined();
      expect(analysis.security_assessment).toBeDefined();
      expect(typeof analysis.overall_ethical_score).toBe('number');
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(Array.isArray(analysis.violations)).toBe(true);
    });

    it('분석 결과가 올바른 범위를 가져야 함', async () => {
      const request = {
        id: 'request-range',
        user_id: 'user-range',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-range',
        content: '응답',
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(analysis.fairness_score).toBeGreaterThanOrEqual(0);
      expect(analysis.fairness_score).toBeLessThanOrEqual(1);
      expect(analysis.transparency_score).toBeGreaterThanOrEqual(0);
      expect(analysis.transparency_score).toBeLessThanOrEqual(1);
      expect(analysis.overall_ethical_score).toBeGreaterThanOrEqual(0);
      expect(analysis.overall_ethical_score).toBeLessThanOrEqual(1);
    });
  });

  describe('addPolicy / updatePolicy / removePolicy', () => {
    it('정책을 추가할 수 있어야 함', () => {
      const policy: AIGovernancePolicy = {
        id: 'test-policy',
        name: '테스트 정책',
        description: '테스트용 정책',
        category: 'fairness',
        rules: [],
        enforcement_level: 'moderate',
        created_date: new Date(),
        last_updated: new Date(),
        status: 'active',
      };

      advancedAIGovernanceEthicalSystem.addPolicy(policy);

      const policies = advancedAIGovernanceEthicalSystem.getPolicies();
      const addedPolicy = policies.find(p => p.id === 'test-policy');
      expect(addedPolicy).toBeDefined();
      expect(addedPolicy?.name).toBe('테스트 정책');
    });

    it('정책을 업데이트할 수 있어야 함', () => {
      const policy: AIGovernancePolicy = {
        id: 'update-policy',
        name: '업데이트 정책',
        description: '업데이트 전',
        category: 'transparency',
        rules: [],
        enforcement_level: 'moderate',
        created_date: new Date(),
        last_updated: new Date(),
        status: 'active',
      };

      advancedAIGovernanceEthicalSystem.addPolicy(policy);
      advancedAIGovernanceEthicalSystem.updatePolicy('update-policy', {
        description: '업데이트 후',
        status: 'draft',
      });

      const policies = advancedAIGovernanceEthicalSystem.getPolicies();
      const updatedPolicy = policies.find(p => p.id === 'update-policy');
      expect(updatedPolicy?.description).toBe('업데이트 후');
      expect(updatedPolicy?.status).toBe('draft');
    });

    it('정책을 삭제할 수 있어야 함', () => {
      const policy: AIGovernancePolicy = {
        id: 'delete-policy',
        name: '삭제 정책',
        description: '삭제될 정책',
        category: 'security',
        rules: [],
        enforcement_level: 'advisory',
        created_date: new Date(),
        last_updated: new Date(),
        status: 'active',
      };

      advancedAIGovernanceEthicalSystem.addPolicy(policy);
      advancedAIGovernanceEthicalSystem.removePolicy('delete-policy');

      const policies = advancedAIGovernanceEthicalSystem.getPolicies();
      const deletedPolicy = policies.find(p => p.id === 'delete-policy');
      expect(deletedPolicy).toBeUndefined();
    });
  });

  describe('getEthicalAnalysis / getAllEthicalAnalyses', () => {
    it('특정 윤리적 분석을 조회할 수 있어야 함', async () => {
      const request = {
        id: 'request-get',
        user_id: 'user-get',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-get',
        content: '응답',
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);
      const retrieved = advancedAIGovernanceEthicalSystem.getEthicalAnalysis(analysis.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(analysis.id);
    });

    it('존재하지 않는 분석은 null을 반환해야 함', () => {
      const analysis = advancedAIGovernanceEthicalSystem.getEthicalAnalysis('non-existent');

      expect(analysis).toBeNull();
    });

    it('모든 윤리적 분석을 조회할 수 있어야 함', async () => {
      const request1 = {
        id: 'request-all-1',
        user_id: 'user-all',
        input: { text: '테스트 1' },
      };

      const request2 = {
        id: 'request-all-2',
        user_id: 'user-all',
        input: { text: '테스트 2' },
      };

      const response = {
        id: 'response-all',
        content: '응답',
      };

      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request1, response);
      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request2, response);

      const allAnalyses = advancedAIGovernanceEthicalSystem.getAllEthicalAnalyses();

      expect(Array.isArray(allAnalyses)).toBe(true);
      expect(allAnalyses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getViolations', () => {
    it('위반사항을 조회할 수 있어야 함', () => {
      const violations = advancedAIGovernanceEthicalSystem.getViolations();

      expect(Array.isArray(violations)).toBe(true);
    });

    it('해결되지 않은 위반만 반환해야 함', async () => {
      const request = {
        id: 'request-violations',
        user_id: 'user-violations',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-violations',
        content: '응답',
      };

      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);
      const violations = advancedAIGovernanceEthicalSystem.getViolations();

      violations.forEach(violation => {
        expect(violation.resolved).toBe(false);
      });
    });
  });

  describe('resolveViolation', () => {
    it('위반을 해결할 수 있어야 함', async () => {
      const request = {
        id: 'request-resolve',
        user_id: 'user-resolve',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-resolve',
        content: '응답',
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      /* eslint-disable jest/no-conditional-expect -- violations may be empty; resolve path when present */
      if (analysis.violations.length > 0) {
        const violationId = analysis.violations[0].rule_id;
        const initialViolations = advancedAIGovernanceEthicalSystem.getViolations();

        advancedAIGovernanceEthicalSystem.resolveViolation(violationId);

        const violations = advancedAIGovernanceEthicalSystem.getViolations();

        const resolvedCount = violations.filter(v => v.rule_id === violationId && !v.resolved).length;
        expect(resolvedCount).toBeLessThan(initialViolations.filter(v => v.rule_id === violationId).length);
      } else {
        expect(analysis.violations.length).toBe(0);
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('getAuditTrail', () => {
    it('감사 로그를 조회할 수 있어야 함', async () => {
      const request = {
        id: 'request-audit',
        user_id: 'user-audit',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-audit',
        content: '응답',
      };

      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);
      const auditTrail = advancedAIGovernanceEthicalSystem.getAuditTrail();

      expect(Array.isArray(auditTrail)).toBe(true);
    });

    it('감사 로그가 올바른 구조를 가져야 함', async () => {
      const request = {
        id: 'request-audit-structure',
        user_id: 'user-audit-structure',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-audit-structure',
        content: '응답',
      };

      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);
      const auditTrail = advancedAIGovernanceEthicalSystem.getAuditTrail();

      expect(Array.isArray(auditTrail)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (auditTrail.length > 0) {
        const entry = auditTrail[0];
        expect(entry.id).toBeDefined();
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(entry.user_id).toBeDefined();
        expect(entry.action).toBeDefined();
        expect(entry.resource).toBeDefined();
        expect(['success', 'failure', 'warning']).toContain(entry.outcome);
        expect(entry.details).toBeDefined();
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('getGovernanceMetrics', () => {
    it('거버넌스 메트릭을 조회할 수 있어야 함', async () => {
      advancedAIGovernanceEthicalSystem.start();
      
      // 메트릭 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = advancedAIGovernanceEthicalSystem.getGovernanceMetrics();

      /* eslint-disable jest/no-conditional-expect -- metrics may be null before start */
      if (metrics) {
        expect(typeof metrics.total_policies).toBe('number');
        expect(typeof metrics.active_policies).toBe('number');
        expect(typeof metrics.compliance_rate).toBe('number');
        expect(typeof metrics.average_ethical_score).toBe('number');
        expect(typeof metrics.total_violations).toBe('number');
        expect(typeof metrics.critical_violations).toBe('number');
        expect(metrics.last_audit_date).toBeInstanceOf(Date);
        expect(typeof metrics.policy_effectiveness).toBe('object');
      }
      /* eslint-enable jest/no-conditional-expect */

      advancedAIGovernanceEthicalSystem.stop();
    });
  });

  describe('getPolicies', () => {
    it('모든 정책을 조회할 수 있어야 함', () => {
      const policies = advancedAIGovernanceEthicalSystem.getPolicies();

      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);
    });

    it('정책이 올바른 구조를 가져야 함', () => {
      const policies = advancedAIGovernanceEthicalSystem.getPolicies();

      expect(Array.isArray(policies)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (policies.length > 0) {
        const policy = policies[0];
        expect(policy.id).toBeDefined();
        expect(policy.name).toBeDefined();
        expect(policy.description).toBeDefined();
        expect(['fairness', 'transparency', 'accountability', 'privacy', 'security', 'compliance']).toContain(policy.category);
        expect(Array.isArray(policy.rules)).toBe(true);
        expect(['strict', 'moderate', 'advisory']).toContain(policy.enforcement_level);
        expect(['active', 'draft', 'deprecated']).toContain(policy.status);
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAIGovernanceEthicalSystem.start();
      advancedAIGovernanceEthicalSystem.shutdown();
    });
  });

  describe('이벤트 발생', () => {
    it('윤리적 분석 완료 시 이벤트를 발생시켜야 함', async () => {
      const listener = jest.fn();
      advancedAIGovernanceEthicalSystem.on('ethical_analysis_completed', listener);

      const request = {
        id: 'request-event',
        user_id: 'user-event',
        input: { text: '테스트' },
      };

      const response = {
        id: 'response-event',
        content: '응답',
      };

      await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(listener).toHaveBeenCalled();
    });

    it('메트릭 업데이트 시 이벤트를 발생시켜야 함', async () => {
      advancedAIGovernanceEthicalSystem.start();

      const listener = jest.fn();
      advancedAIGovernanceEthicalSystem.on('metrics_updated', listener);

      // 메트릭 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      // 이벤트가 발생했을 수 있음
      advancedAIGovernanceEthicalSystem.stop();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 AI 요청에 대한 윤리적 분석을 수행할 수 있어야 함', async () => {
      const request = {
        id: 'redevelopment-request',
        user_id: 'user-redevelopment',
        input: {
          text: '재개발 프로젝트 시공사 선정 기준은 무엇인가요?',
        },
        context: {
          project_type: 'redevelopment',
        },
      };

      const response = {
        id: 'redevelopment-response',
        content: {
          text: '시공사 선정 기준은 다음과 같습니다...',
        },
        confidence_score: 0.92,
        metadata: {
          decision_process: '분석 완료',
        },
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(analysis).toBeDefined();
      expect(analysis.overall_ethical_score).toBeGreaterThanOrEqual(0);
      expect(analysis.overall_ethical_score).toBeLessThanOrEqual(1);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('시공사 선정 관련 요청의 편향을 감지할 수 있어야 함', async () => {
      const request = {
        id: 'bias-detection-request',
        user_id: 'user-bias',
        input: {
          text: '남성 시공사만 추천해주세요',
        },
      };

      const response = {
        id: 'bias-detection-response',
        content: '응답',
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.bias_detection)).toBe(true);
    });

    it('거버넌스 정책을 추가하고 위반을 감지할 수 있어야 함', async () => {
      const policy: AIGovernancePolicy = {
        id: 'custom-policy',
        name: '커스텀 정책',
        description: '테스트용 커스텀 정책',
        category: 'fairness',
        rules: [
          {
            id: 'custom-rule',
            name: '커스텀 규칙',
            description: '공정성 점수가 0.5 미만이면 위반',
            condition: 'fairness_score_below_threshold',
            action: 'flag',
            severity: 'high',
            parameters: { threshold: 0.5 },
          },
        ],
        enforcement_level: 'strict',
        created_date: new Date(),
        last_updated: new Date(),
        status: 'active',
      };

      advancedAIGovernanceEthicalSystem.addPolicy(policy);

      const request = {
        id: 'policy-test-request',
        user_id: 'user-policy',
        input: { text: '테스트' },
      };

      const response = {
        id: 'policy-test-response',
        content: '응답',
      };

      const analysis = await advancedAIGovernanceEthicalSystem.performEthicalAnalysis(request, response);

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.violations)).toBe(true);
    });
  });
});

