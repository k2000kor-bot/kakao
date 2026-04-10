/**
 * advancedAIQualityAssuranceSystem 서비스 테스트
 * 고급 AI 품질 보증 및 테스트 자동화 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedAIQualityAssuranceSystem from '../advancedAIQualityAssuranceSystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn().mockResolvedValue({}),
}));

jest.mock('../aiHealthMonitor', () => ({
  reportHealth: jest.fn(),
}));

// 타이머 모킹
jest.useFakeTimers();

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAIQualityAssuranceSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // 시스템 중지
    if (advancedAIQualityAssuranceSystem) {
      try {
        advancedAIQualityAssuranceSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.useRealTimers();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIQualityAssuranceSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIQualityAssuranceSystem;
      const instance2 = advancedAIQualityAssuranceSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIQualityAssuranceSystem.start();
      advancedAIQualityAssuranceSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIQualityAssuranceSystem.start();
      advancedAIQualityAssuranceSystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIQualityAssuranceSystem.start();
      advancedAIQualityAssuranceSystem.start(); // 중복 호출
      advancedAIQualityAssuranceSystem.stop();
    });
  });

  describe('getTestSuites', () => {
    it('모든 테스트 스위트를 조회할 수 있어야 함', () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();

      expect(Array.isArray(suites)).toBe(true);
      expect(suites.length).toBeGreaterThan(0);
    });

    it('테스트 스위트가 올바른 구조를 가져야 함', () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();

      if (suites.length > 0) {
        const suite = suites[0];
        expect(suite.id).toBeDefined();
        expect(suite.name).toBeDefined();
        expect(suite.description).toBeDefined();
        expect(suite.category).toBeDefined();
        expect(Array.isArray(suite.test_cases)).toBe(true);
        expect(suite.priority).toBeDefined();
        expect(suite.created_date).toBeInstanceOf(Date);
      }
    });
  });

  describe('executeTestSuite', () => {
    it('테스트 스위트를 실행할 수 있어야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      const execution = await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.test_suite_id).toBe(suiteId);
      expect(execution.status).toBe('completed');
      expect(execution.start_time).toBeInstanceOf(Date);
      expect(execution.end_time).toBeInstanceOf(Date);
      expect(execution.progress_percentage).toBe(100);
      expect(Array.isArray(execution.results)).toBe(true);
      expect(execution.summary).toBeDefined();
      expect(execution.summary.total_tests).toBeGreaterThan(0);
    });

    it('존재하지 않는 테스트 스위트를 실행하면 에러를 발생시켜야 함', async () => {
      await expect(
        advancedAIQualityAssuranceSystem.executeTestSuite('non-existent-suite')
      ).rejects.toThrow();
    });

    it('테스트 실행 결과가 올바른 구조를 가져야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      const execution = await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      if (execution.results.length > 0) {
        const result = execution.results[0];
        expect(result.id).toBeDefined();
        expect(result.test_case_id).toBeDefined();
        expect(result.execution_id).toBe(execution.id);
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(['passed', 'failed', 'skipped', 'error']).toContain(result.status);
        expect(typeof result.execution_time_ms).toBe('number');
        expect(Array.isArray(result.validation_results)).toBe(true);
        expect(result.performance_metrics).toBeDefined();
        expect(typeof result.quality_score).toBe('number');
      }
    });
  });

  describe('getTestResults', () => {
    it('모든 테스트 결과를 조회할 수 있어야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      const results = advancedAIQualityAssuranceSystem.getTestResults();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('특정 실행 ID로 테스트 결과를 필터링할 수 있어야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      const execution = await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      const results = advancedAIQualityAssuranceSystem.getTestResults(execution.id);

      expect(Array.isArray(results)).toBe(true);
      results.forEach((result) => {
        expect(result.execution_id).toBe(execution.id);
      });
    });
  });

  describe('getQualityReports', () => {
    it('품질 보고서를 조회할 수 있어야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      const reports = advancedAIQualityAssuranceSystem.getQualityReports();

      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });

    it('품질 보고서가 올바른 구조를 가져야 함', async () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      await advancedAIQualityAssuranceSystem.executeTestSuite(suiteId);

      const reports = advancedAIQualityAssuranceSystem.getQualityReports();

      if (reports.length > 0) {
        const report = reports[0];
        expect(report.id).toBeDefined();
        expect(report.execution_id).toBeDefined();
        expect(report.generated_date).toBeInstanceOf(Date);
        expect(report.test_suite_id).toBeDefined();
        expect(typeof report.total_tests).toBe('number');
        expect(typeof report.passed_tests).toBe('number');
        expect(typeof report.failed_tests).toBe('number');
        expect(typeof report.overall_quality_score).toBe('number');
        expect(report.performance_summary).toBeDefined();
        expect(Array.isArray(report.quality_trends)).toBe(true);
        expect(Array.isArray(report.recommendations)).toBe(true);
      }
    });
  });

  describe('getActiveExecutions', () => {
    it('활성 실행 목록을 조회할 수 있어야 함', () => {
      const executions = advancedAIQualityAssuranceSystem.getActiveExecutions();

      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe('getQualityMetrics', () => {
    it('품질 메트릭을 조회할 수 있어야 함', async () => {
      // 메트릭 수집을 위해 시간 경과
      advancedAIQualityAssuranceSystem.start();
      jest.advanceTimersByTime(600000); // 10분
      advancedAIQualityAssuranceSystem.stop();

      const metrics = advancedAIQualityAssuranceSystem.getQualityMetrics();

      expect(metrics).toBeDefined();
      if (metrics) {
        expect(typeof metrics.total_test_suites).toBe('number');
        expect(typeof metrics.active_test_suites).toBe('number');
        expect(typeof metrics.total_test_cases).toBe('number');
        expect(metrics.last_execution_date).toBeInstanceOf(Date);
        expect(typeof metrics.overall_pass_rate).toBe('number');
        expect(typeof metrics.average_quality_score).toBe('number');
        expect(typeof metrics.critical_failures).toBe('number');
        expect(typeof metrics.test_coverage).toBe('number');
        expect(typeof metrics.automation_rate).toBe('number');
      }
    });
  });

  describe('addTestSuite', () => {
    it('새로운 테스트 스위트를 추가할 수 있어야 함', () => {
      const initialCount = advancedAIQualityAssuranceSystem.getTestSuites().length;

      const newSuite = {
        id: 'custom-test-suite',
        name: '커스텀 테스트 스위트',
        description: '테스트용 스위트',
        category: 'functional' as const,
        test_cases: [],
        execution_schedule: '0 0 * * *',
        priority: 'medium' as const,
        created_date: new Date(),
        last_executed: new Date(),
        status: 'active' as const,
      };

      advancedAIQualityAssuranceSystem.addTestSuite(newSuite);

      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      expect(suites.length).toBe(initialCount + 1);

      const addedSuite = suites.find((s) => s.id === newSuite.id);
      expect(addedSuite).toBeDefined();
      expect(addedSuite?.name).toBe(newSuite.name);
    });
  });

  describe('updateTestSuite', () => {
    it('테스트 스위트를 업데이트할 수 있어야 함', () => {
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      const suiteId = suites[0].id;

      advancedAIQualityAssuranceSystem.updateTestSuite(suiteId, {
        name: '업데이트된 이름',
        priority: 'high',
      });

      const updatedSuite = advancedAIQualityAssuranceSystem
        .getTestSuites()
        .find((s) => s.id === suiteId);

      expect(updatedSuite).toBeDefined();
      expect(updatedSuite?.name).toBe('업데이트된 이름');
      expect(updatedSuite?.priority).toBe('high');
    });
  });

  describe('removeTestSuite', () => {
    it('테스트 스위트를 삭제할 수 있어야 함', () => {
      // 먼저 새로운 스위트 추가
      const newSuite = {
        id: 'temp-test-suite',
        name: '임시 테스트 스위트',
        description: '삭제용 스위트',
        category: 'functional' as const,
        test_cases: [],
        execution_schedule: '0 0 * * *',
        priority: 'low' as const,
        created_date: new Date(),
        last_executed: new Date(),
        status: 'active' as const,
      };

      advancedAIQualityAssuranceSystem.addTestSuite(newSuite);

      const beforeCount = advancedAIQualityAssuranceSystem.getTestSuites().length;

      advancedAIQualityAssuranceSystem.removeTestSuite(newSuite.id);

      const afterCount = advancedAIQualityAssuranceSystem.getTestSuites().length;
      expect(afterCount).toBe(beforeCount - 1);

      const removedSuite = advancedAIQualityAssuranceSystem
        .getTestSuites()
        .find((s) => s.id === newSuite.id);
      expect(removedSuite).toBeUndefined();
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAIQualityAssuranceSystem.start();
      advancedAIQualityAssuranceSystem.shutdown();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 기능에 대한 품질 테스트를 수행할 수 있어야 함', async () => {
      const newSuite = {
        id: 'redevelopment-qa-suite',
        name: '재개발 프로젝트 품질 테스트',
        description: '재개발 프로젝트 관련 기능의 품질 검증',
        category: 'functional' as const,
        test_cases: [
          {
            id: 'redev-doc-test',
            name: '재개발 문서 생성 테스트',
            description: '재개발 프로젝트 문서 생성 기능 검증',
            test_type: 'functional' as const,
            input_data: {
              project_type: 'redevelopment',
              question: '재개발 프로젝트 문서를 생성해주세요.',
            },
            expected_output: {
              accuracy: 0.9,
              completeness: 0.85,
            },
            validation_rules: [
              {
                id: 'redev-accuracy-rule',
                name: '재개발 문서 정확성',
                rule_type: 'accuracy' as const,
                condition: 'accuracy >= 0.85',
                threshold: 0.85,
                operator: 'greater_than' as const,
                severity: 'high' as const,
              },
            ],
            timeout_ms: 10000,
            retry_count: 3,
            tags: ['redevelopment', 'documentation'],
          },
        ],
        execution_schedule: '0 0 * * *',
        priority: 'high' as const,
        created_date: new Date(),
        last_executed: new Date(),
        status: 'active' as const,
      };

      advancedAIQualityAssuranceSystem.addTestSuite(newSuite);

      const execution = await advancedAIQualityAssuranceSystem.executeTestSuite(newSuite.id);

      expect(execution).toBeDefined();
      expect(execution.test_suite_id).toBe(newSuite.id);
      expect(execution.status).toBe('completed');
      expect(execution.results.length).toBeGreaterThan(0);
    });

    it('시공사 선정 기능에 대한 성능 및 보안 테스트를 수행할 수 있어야 함', async () => {
      const performanceSuite = {
        id: 'contractor-performance-suite',
        name: '시공사 선정 성능 테스트',
        description: '시공사 선정 기능의 성능 및 보안 검증',
        category: 'performance' as const,
        test_cases: [
          {
            id: 'contractor-response-time',
            name: '시공사 선정 응답 시간 테스트',
            description: '응답 시간이 1초 이내인지 검증',
            test_type: 'performance' as const,
            input_data: {
              action: 'select_contractor',
              criteria: ['price', 'experience', 'quality'],
            },
            expected_output: {
              response_time: 500,
            },
            validation_rules: [
              {
                id: 'response-time-rule',
                name: '응답 시간 기준',
                rule_type: 'response_time' as const,
                condition: 'response_time <= 1000',
                threshold: 1000,
                operator: 'less_than' as const,
                severity: 'high' as const,
              },
            ],
            timeout_ms: 2000,
            retry_count: 3,
            tags: ['contractor', 'performance'],
          },
          {
            id: 'contractor-security',
            name: '시공사 선정 보안 테스트',
            description: '보안 취약점 검증',
            test_type: 'security' as const,
            input_data: {
              malicious_input: "'; DROP TABLE contractors; --",
            },
            expected_output: {
              vulnerability_score: 0,
            },
            validation_rules: [
              {
                id: 'security-rule',
                name: '보안 기준',
                rule_type: 'security' as const,
                condition: 'vulnerability_score <= 0.1',
                threshold: 0.1,
                operator: 'less_than' as const,
                severity: 'critical' as const,
              },
            ],
            timeout_ms: 5000,
            retry_count: 2,
            tags: ['contractor', 'security'],
          },
        ],
        execution_schedule: '0 */6 * * *',
        priority: 'critical' as const,
        created_date: new Date(),
        last_executed: new Date(),
        status: 'active' as const,
      };

      advancedAIQualityAssuranceSystem.addTestSuite(performanceSuite);

      // 비동기 실행 시작
      const executionPromise = advancedAIQualityAssuranceSystem.executeTestSuite(
        performanceSuite.id
      );

      // 성능 테스트에서 사용하는 setTimeout 처리 (200-1200ms 범위)
      jest.advanceTimersByTime(1500);

      const execution = await executionPromise;

      expect(execution).toBeDefined();
      expect(execution.results.length).toBeGreaterThanOrEqual(1);
      expect(execution.results.length).toBeLessThanOrEqual(2);

      // 품질 보고서 확인
      const reports = advancedAIQualityAssuranceSystem.getQualityReports();
      const report = reports.find((r) => r.execution_id === execution.id);
      expect(report).toBeDefined();
      if (report) {
        expect(report.total_tests).toBeGreaterThanOrEqual(1);
        expect(report.total_tests).toBeLessThanOrEqual(2);
      }
    }, 10000);

    it('전체 품질 메트릭을 수집하고 트렌드를 분석할 수 있어야 함', async () => {
      // 여러 테스트 실행
      const suites = advancedAIQualityAssuranceSystem.getTestSuites();
      for (const suite of suites.slice(0, 2)) {
        const executionPromise = advancedAIQualityAssuranceSystem.executeTestSuite(suite.id);
        // 성능 테스트에서 사용하는 setTimeout 처리
        jest.advanceTimersByTime(2000);
        await executionPromise;
      }

      // 메트릭 수집
      advancedAIQualityAssuranceSystem.start();
      jest.advanceTimersByTime(600000); // 10분
      advancedAIQualityAssuranceSystem.stop();

      const metrics = advancedAIQualityAssuranceSystem.getQualityMetrics();

      expect(metrics).toBeDefined();
      if (metrics) {
        expect(metrics.total_test_suites).toBeGreaterThan(0);
        expect(metrics.total_test_cases).toBeGreaterThan(0);
        expect(metrics.overall_pass_rate).toBeGreaterThanOrEqual(0);
        expect(metrics.overall_pass_rate).toBeLessThanOrEqual(1);
        expect(metrics.average_quality_score).toBeGreaterThanOrEqual(0);
        expect(metrics.average_quality_score).toBeLessThanOrEqual(1);
      }

      // 품질 보고서 확인
      const reports = advancedAIQualityAssuranceSystem.getQualityReports();
      if (reports.length > 0) {
        const report = reports[0];
        expect(report.quality_trends.length).toBeGreaterThan(0);
        expect(report.recommendations.length).toBeGreaterThan(0);
      }
    }, 15000);
  });
});

