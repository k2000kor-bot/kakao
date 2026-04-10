/**
 * BackendIntegrationSystem 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import BackendIntegrationSystem from '../backendIntegrationSystem';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// fetch 모킹
installJestFetchMock();

describe('BackendIntegrationSystem', () => {
  let service: BackendIntegrationSystem;

  beforeEach(() => {
    service = new BackendIntegrationSystem();
    jest.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(BackendIntegrationSystem);
    });

    it('사용 가능한 서비스 목록 조회', () => {
      const services = service.getAvailableServices();

      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      services.forEach((service) => {
        expect(service).toBeDefined();
        expect(typeof service.name).toBe('string');
        expect(typeof service.endpoint).toBe('string');
        expect(typeof service.description).toBe('string');
        expect(Array.isArray(service.capabilities)).toBe(true);
      });
    });

    it('각 서비스에 inputFormat·outputFormat이 있어야 함', () => {
      const services = service.getAvailableServices();

      services.forEach((svc) => {
        expect(svc).toHaveProperty('inputFormat');
        expect(svc).toHaveProperty('outputFormat');
        expect(typeof svc.inputFormat).toBe('object');
        expect(typeof svc.outputFormat).toBe('object');
      });
    });

    it('requiredServices 없이 호출 시 관련 서비스를 자동 식별해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ result: 'success' }),
      });

      const result = await service.integrateBackendServices('텍스트 분석 요청', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
      expect(result.combinedInsights).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('백엔드 서비스 통합', () => {
    it('백엔드 서비스 통합 호출', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          result: 'success',
          data: { test: 'data' },
        }),
      });

      const result = await service.integrateBackendServices('테스트 쿼리', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
      expect(Array.isArray(result.combinedInsights)).toBe(true);
      expect(result.dataAnalysis).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('특정 서비스 지정하여 통합 호출', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          result: 'success',
        }),
      });

      const result = await service.integrateBackendServices(
        '테스트 쿼리',
        {},
        ['textAnalysis']
      );

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });

    it('서비스 호출 실패 시 폴백 처리', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await service.integrateBackendServices('테스트 쿼리', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
      expect(Array.isArray(result.combinedInsights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('HTTP 에러 처리', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      const result = await service.integrateBackendServices('테스트 쿼리', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });
  });

  describe('서비스 식별', () => {
    it('텍스트 분석 관련 쿼리', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          keywords: ['테스트', '분석'],
          topics: ['주제1', '주제2'],
        }),
      });

      const result = await service.integrateBackendServices('텍스트를 분석해주세요', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });

    it('코드 관련 쿼리', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          codeQuality: { overall: 85 },
          suggestions: ['개선 제안 1', '개선 제안 2'],
        }),
      });

      const result = await service.integrateBackendServices('코드를 검토해주세요', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });

    it('데이터 분석 관련 쿼리', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          patterns: [{ type: 'pattern1' }, { type: 'pattern2' }],
          trends: { direction: 'up' },
        }),
      });

      const result = await service.integrateBackendServices('데이터를 분석해주세요', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });

    it('문서 처리 관련 쿼리', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          content: '추출된 내용',
          metadata: {},
        }),
      });

      const result = await service.integrateBackendServices('문서를 처리해주세요', {});

      expect(result).toBeDefined();
      expect(result.serviceResults).toBeDefined();
    });
  });

  describe('캐시 관리', () => {
    it('캐시 정리', () => {
      expect(() => service.clearCache()).not.toThrow();
    });

    it('캐시된 결과 반환', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          result: 'cached',
          data: { test: 'cached data' },
        }),
      };

      jest.mocked(global.fetch).mockResolvedValue(mockResponse);

      // 첫 번째 호출
      const firstResult = await service.integrateBackendServices('테스트 쿼리', {}, ['textAnalysis']);
      const firstCallCount = jest.mocked(global.fetch).mock.calls.length;

      // 두 번째 호출 (캐시에서 반환되어야 함)
      const secondResult = await service.integrateBackendServices('테스트 쿼리', {}, ['textAnalysis']);
      const secondCallCount = jest.mocked(global.fetch).mock.calls.length;

      expect(firstResult).toBeDefined();
      expect(secondResult).toBeDefined();
      // 두 번째 호출 시 fetch가 추가로 호출되지 않아야 함 (캐시 사용)
      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('통합 인사이트 생성', () => {
    it('여러 서비스 결과 통합', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          keywords: ['키워드1', '키워드2'],
          topics: ['주제1', '주제2'],
          sentiment: 'positive',
          confidence: 0.9,
        }),
      });

      const result = await service.integrateBackendServices('종합 분석 요청', {});

      expect(result).toBeDefined();
      expect(Array.isArray(result.combinedInsights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('신뢰도 계산', () => {
    it('신뢰도 값 반환', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          result: 'success',
        }),
      });

      const result = await service.integrateBackendServices('테스트 쿼리', {});

      expect(result).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

