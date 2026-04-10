/**
 * services/api.ts 테스트
 * ApiService handleError, export 객체 검증 (axios 의존 메서드는 통합 테스트에서 검증)
 */

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    })),
  },
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  toError: jest.fn((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
}));

// eslint-disable-next-line import/first -- mocks must be defined before module under test
import apiService, { aiAnalyticsApi, performanceMonitorApi } from '../api';

describe('services/api', () => {
  describe('default export (apiService)', () => {
    it('apiService가 정의되어 있어야 함', () => {
      expect(apiService).toBeDefined();
    });
  });

  describe('handleError', () => {
    it('response.data.message가 있으면 해당 문자열을 반환해야 함', () => {
      const err = { response: { data: { message: '서버 오류 메시지' } } };
      expect(apiService.handleError(err)).toBe('서버 오류 메시지');
    });

    it('error.message가 있으면 해당 문자열을 반환해야 함', () => {
      const err = new Error('클라이언트 오류');
      expect(apiService.handleError(err)).toBe('클라이언트 오류');
    });

    it('둘 다 없으면 기본 메시지를 반환해야 함', () => {
      expect(apiService.handleError({})).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('response.data.message와 message 둘 다 있으면 response.data.message를 반환해야 함', () => {
      const err = {
        response: { data: { message: '서버 메시지' } },
        message: '클라이언트 메시지',
      };
      expect(apiService.handleError(err)).toBe('서버 메시지');
    });

    it('response.data.message가 빈 문자열이면 기본 메시지를 반환해야 함', () => {
      const err = { response: { data: { message: '' } } };
      expect(apiService.handleError(err)).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('error가 null이면 기본 메시지를 반환해야 함', () => {
      expect(apiService.handleError(null)).toBe('알 수 없는 오류가 발생했습니다.');
    });
  });

  describe('apiService 메서드 존재', () => {
    it('handleError, initialize, getSystemStatus, checkConnection이 함수여야 함', () => {
      expect(typeof apiService.handleError).toBe('function');
      expect(typeof apiService.initialize).toBe('function');
      expect(typeof apiService.getSystemStatus).toBe('function');
      expect(typeof apiService.checkConnection).toBe('function');
    });

    it('getProjects, getProject, createProject가 함수여야 함', () => {
      expect(typeof apiService.getProjects).toBe('function');
      expect(typeof apiService.getProject).toBe('function');
      expect(typeof apiService.createProject).toBe('function');
    });
  });

  describe('export 객체', () => {
    it('aiAnalyticsApi가 export 되어 있어야 함', () => {
      expect(aiAnalyticsApi).toBeDefined();
      expect(typeof aiAnalyticsApi.getMetrics).toBe('function');
      expect(typeof aiAnalyticsApi.healthCheck).toBe('function');
    });

    it('performanceMonitorApi가 export 되어 있어야 함', () => {
      expect(performanceMonitorApi).toBeDefined();
      expect(typeof performanceMonitorApi.getSystemMetrics).toBe('function');
      expect(typeof performanceMonitorApi.healthCheck).toBe('function');
    });
  });
});
