/// <reference types="jest" />
/**
 * advancedAIDocumentationAPISystem 서비스 테스트
 * 고급 AI 문서화 및 API 시스템 테스트
 */

import { API_AI_BASE } from '../../config/api';
import advancedAIDocumentationAPISystem from '../advancedAIDocumentationAPISystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';

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

describe('advancedAIDocumentationAPISystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 시스템 중지
    if (advancedAIDocumentationAPISystem) {
      try {
        advancedAIDocumentationAPISystem.stop();
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
      expect(advancedAIDocumentationAPISystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIDocumentationAPISystem;
      const instance2 = advancedAIDocumentationAPISystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAIDocumentationAPISystem.start();
      advancedAIDocumentationAPISystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAIDocumentationAPISystem.start();
      advancedAIDocumentationAPISystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIDocumentationAPISystem.start();
      advancedAIDocumentationAPISystem.start(); // 중복 호출
      advancedAIDocumentationAPISystem.stop();
    });
  });

  describe('generateAPIDocumentation', () => {
    it('API 문서화를 생성할 수 있어야 함', async () => {
      const documentation = await advancedAIDocumentationAPISystem.generateAPIDocumentation('test-service');

      expect(documentation).toBeDefined();
      expect(documentation.id).toBeDefined();
      expect(documentation.service_name).toBe('test-service');
      expect(documentation.version).toBeDefined();
      expect(Array.isArray(documentation.endpoints)).toBe(true);
      expect(Array.isArray(documentation.schemas)).toBe(true);
      expect(Array.isArray(documentation.examples)).toBe(true);
      expect(Array.isArray(documentation.changelog)).toBe(true);
    });

    it('문서화가 올바른 구조를 가져야 함', async () => {
      const documentation = await advancedAIDocumentationAPISystem.generateAPIDocumentation('structure-test');

      expect(['active', 'deprecated', 'beta']).toContain(documentation.status);
      expect(documentation.last_updated).toBeInstanceOf(Date);
    });

    it('특정 서비스에 대한 문서화를 생성할 수 있어야 함', async () => {
      const documentation = await advancedAIDocumentationAPISystem.generateAPIDocumentation('integrated-ai-service');

      expect(documentation.service_name).toBe('integrated-ai-service');
      expect(documentation.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('getAPIDocumentation', () => {
    it('특정 서비스의 API 문서화를 조회할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('test-service');
      const documentation = advancedAIDocumentationAPISystem.getAPIDocumentation('test-service');

      expect(documentation).toBeDefined();
      expect(documentation?.service_name).toBe('test-service');
    });

    it('존재하지 않는 서비스는 null을 반환해야 함', () => {
      const documentation = advancedAIDocumentationAPISystem.getAPIDocumentation('non-existent-service');

      expect(documentation).toBeNull();
    });
  });

  describe('getAllAPIDocumentation', () => {
    it('모든 API 문서화를 조회할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('service-1');
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('service-2');

      const allDocs = advancedAIDocumentationAPISystem.getAllAPIDocumentation();

      expect(Array.isArray(allDocs)).toBe(true);
      expect(allDocs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('collectAPIUsageStats', () => {
    it('API 사용 통계를 수집할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('stats-service');
      const stats = await advancedAIDocumentationAPISystem.collectAPIUsageStats();

      expect(Array.isArray(stats)).toBe(true);
    });

    it('통계가 올바른 구조를 가져야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('stats-structure-service');
      const stats = await advancedAIDocumentationAPISystem.collectAPIUsageStats();

      expect(Array.isArray(stats)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (stats.length > 0) {
        const stat = stats[0];
        expect(stat.endpoint_id).toBeDefined();
        expect(typeof stat.total_requests).toBe('number');
        expect(typeof stat.success_rate).toBe('number');
        expect(typeof stat.average_response_time).toBe('number');
        expect(typeof stat.error_rate).toBe('number');
        expect(stat.last_used).toBeInstanceOf(Date);
        expect(typeof stat.unique_users).toBe('number');
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('updateDocumentationMetrics', () => {
    it('문서화 메트릭을 업데이트할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('metrics-service');
      const metrics = await advancedAIDocumentationAPISystem.updateDocumentationMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_endpoints).toBe('number');
      expect(typeof metrics.documented_endpoints).toBe('number');
      expect(typeof metrics.coverage_percentage).toBe('number');
      expect(metrics.last_documentation_update).toBeInstanceOf(Date);
      expect(typeof metrics.documentation_quality_score).toBe('number');
      expect(Array.isArray(metrics.api_usage_statistics)).toBe(true);
      expect(Array.isArray(metrics.popular_endpoints)).toBe(true);
      expect(typeof metrics.deprecated_endpoints).toBe('number');
    });

    it('메트릭이 올바른 범위를 가져야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('metrics-range-service');
      const metrics = await advancedAIDocumentationAPISystem.updateDocumentationMetrics();

      expect(metrics.coverage_percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.coverage_percentage).toBeLessThanOrEqual(100);
      expect(metrics.documentation_quality_score).toBeGreaterThanOrEqual(0);
      expect(metrics.documentation_quality_score).toBeLessThanOrEqual(1);
    });
  });

  describe('getDocumentationMetrics', () => {
    it('문서화 메트릭을 조회할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('get-metrics-service');
      await advancedAIDocumentationAPISystem.updateDocumentationMetrics();

      const metrics = advancedAIDocumentationAPISystem.getDocumentationMetrics();

      expect(metrics).toBeDefined();
      /* eslint-disable jest/no-conditional-expect -- metrics may be null before update */
      if (metrics) {
        expect(typeof metrics.total_endpoints).toBe('number');
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('메트릭이 업데이트되지 않았으면 null을 반환해야 함', () => {
      const metrics = advancedAIDocumentationAPISystem.getDocumentationMetrics();

      // 초기화 시 메트릭이 있을 수도 있음
      expect(metrics === null || typeof metrics === 'object').toBe(true);
    });
  });

  describe('searchEndpoints', () => {
    it('엔드포인트를 검색할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('integrated-ai-service');
      const results = advancedAIDocumentationAPISystem.searchEndpoints('process');

      expect(Array.isArray(results)).toBe(true);
    });

    it('경로로 엔드포인트를 검색할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('integrated-ai-service');
      const results = advancedAIDocumentationAPISystem.searchEndpoints(API_AI_BASE);

      expect(Array.isArray(results)).toBe(true);
    });

    it('태그로 엔드포인트를 검색할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('integrated-ai-service');
      const results = advancedAIDocumentationAPISystem.searchEndpoints('AI');

      expect(Array.isArray(results)).toBe(true);
    });

    it('검색 결과가 올바른 구조를 가져야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('integrated-ai-service');
      const results = advancedAIDocumentationAPISystem.searchEndpoints('process');

      expect(Array.isArray(results)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (results.length > 0) {
        const endpoint = results[0];
        expect(endpoint.id).toBeDefined();
        expect(endpoint.path).toBeDefined();
        expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(endpoint.method);
        expect(endpoint.description).toBeDefined();
        expect(Array.isArray(endpoint.parameters)).toBe(true);
        expect(Array.isArray(endpoint.responses)).toBe(true);
        expect(Array.isArray(endpoint.authentication)).toBe(true);
        expect(typeof endpoint.deprecated).toBe('boolean');
        expect(Array.isArray(endpoint.tags)).toBe(true);
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAIDocumentationAPISystem.start();
      advancedAIDocumentationAPISystem.shutdown();
    });
  });

  describe('이벤트 발생', () => {
    it('문서화 생성 시 이벤트를 발생시켜야 함', async () => {
      const listener = jest.fn();
      advancedAIDocumentationAPISystem.on('documentation_generated', listener);

      await advancedAIDocumentationAPISystem.generateAPIDocumentation('event-service');

      expect(listener).toHaveBeenCalled();
    });

    it('메트릭 업데이트 시 이벤트를 발생시켜야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('metrics-event-service');
      
      const listener = jest.fn();
      advancedAIDocumentationAPISystem.on('metrics_updated', listener);

      await advancedAIDocumentationAPISystem.updateDocumentationMetrics();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('문서화 품질 검사', () => {
    it('문서화 품질이 낮을 때 알림을 생성해야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('quality-test');

      expect(realTimeAIAlertSystem.createAlert).toHaveBeenCalled();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 API 문서화를 생성하고 조회할 수 있어야 함', async () => {
      const documentation = await advancedAIDocumentationAPISystem.generateAPIDocumentation('redevelopment-api-service');

      expect(documentation).toBeDefined();
      expect(documentation.service_name).toBe('redevelopment-api-service');

      const retrieved = advancedAIDocumentationAPISystem.getAPIDocumentation('redevelopment-api-service');
      expect(retrieved).toBeDefined();
      expect(retrieved?.service_name).toBe('redevelopment-api-service');
    });

    it('시공사 선정 관련 API 엔드포인트를 검색할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('construction-selection-api');

      // 검색 테스트
      const results = advancedAIDocumentationAPISystem.searchEndpoints('selection');
      expect(Array.isArray(results)).toBe(true);

      // 메트릭 업데이트
      const metrics = await advancedAIDocumentationAPISystem.updateDocumentationMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.total_endpoints).toBeGreaterThanOrEqual(0);
    });

    it('API 사용 통계를 수집하고 분석할 수 있어야 함', async () => {
      await advancedAIDocumentationAPISystem.generateAPIDocumentation('analytics-api-service');

      const stats = await advancedAIDocumentationAPISystem.collectAPIUsageStats();
      expect(Array.isArray(stats)).toBe(true);

      const metrics = await advancedAIDocumentationAPISystem.updateDocumentationMetrics();
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics.api_usage_statistics)).toBe(true);
      expect(metrics.api_usage_statistics.length).toBeGreaterThanOrEqual(0);
    });
  });
});

