/**
 * IntegratedAPIService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  FALLBACK_API_ORIGIN,
  INTEGRATED_API_ANALYZE_PATH,
  joinApiHealthCheckUrl,
  INTEGRATED_API_HEALTH_PATH,
  INTEGRATED_API_METRICS_PATH,
  INTEGRATED_API_STATUS_PATH,
} from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  IntegratedAPIService,
  integratedAPIService,
} from '../integratedAPIService';

// fetch 모킹
installJestFetchMock();
global.console.error = jest.fn();

// AbortSignal.timeout 모킹 (Jest 환경에서 지원되지 않을 수 있음)
global.AbortSignal = {
  timeout: jest.fn((ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }),
} as unknown as typeof AbortSignal;

describe('IntegratedAPIService', () => {
  let service: IntegratedAPIService;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
    service = new IntegratedAPIService();
    mockFetch = jest.mocked(global.fetch);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(IntegratedAPIService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(integratedAPIService).toBeDefined();
      expect(integratedAPIService).toBeInstanceOf(IntegratedAPIService);
    });

    it('기본 URL 설정', () => {
      expect(service['baseURL']).toBe(FALLBACK_API_ORIGIN);
    });

    it('환경 변수로 URL 설정', () => {
      process.env.REACT_APP_INTEGRATED_API_URL = 'http://custom-api.com';
      const customService = new IntegratedAPIService();
      expect(customService['baseURL']).toBe('http://custom-api.com');
    });
  });

  describe('메시지 분석', () => {
    it('메시지 분석 성공', async () => {
      const mockResponse = {
        success: true,
        response: '분석 결과',
        analysis: {
          emotion: {
            sentiment: 'positive',
            confidence: 0.9,
            positive_score: 0.8,
            negative_score: 0.2,
          },
          keywords: ['키워드1', '키워드2'],
          intent: {
            type: 'question',
            confidence: 0.85,
          },
          response_time: 150,
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeMessage('테스트 메시지');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, INTEGRATED_API_ANALYZE_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: '테스트 메시지' }),
        })
      );
    });

    it('메시지 분석 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.analyzeMessage('테스트')).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('네트워크 에러 처리', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.analyzeMessage('테스트')).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('시스템 상태 조회', () => {
    it('시스템 상태 조회 성공', async () => {
      const mockStatus = {
        status: 'healthy',
        version: '1.0.0',
        metrics: {
          total_requests: 1000,
          successful_requests: 950,
          failed_requests: 50,
          average_response_time: 150,
          last_updated: '2024-01-01T00:00:00Z',
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await service.getSystemStatus();

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, INTEGRATED_API_STATUS_PATH),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('시스템 상태 조회 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(service.getSystemStatus()).rejects.toThrow('HTTP 503: Service Unavailable');
    });
  });

  describe('헬스 체크', () => {
    it('헬스 체크 성공', async () => {
      const mockHealth = {
        status: 'healthy',
        service: 'integrated-api',
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await service.healthCheck();

      expect(result).toEqual(mockHealth);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, INTEGRATED_API_HEALTH_PATH),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('헬스 체크 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.healthCheck()).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('성능 메트릭 조회', () => {
    it('메트릭 조회 성공', async () => {
      const mockMetrics = {
        success: true,
        metrics: {
          total_requests: 1000,
          successful_requests: 950,
          failed_requests: 50,
          average_response_time: 150,
          last_updated: '2024-01-01T00:00:00Z',
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const result = await service.getMetrics();

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, INTEGRATED_API_METRICS_PATH),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('메트릭 조회 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.getMetrics()).rejects.toThrow('HTTP 404: Not Found');
    });
  });

  describe('에지 케이스', () => {
    it('빈 메시지 분석', async () => {
      const mockResponse = {
        success: true,
        response: '',
        analysis: {
          emotion: {
            sentiment: 'neutral',
            confidence: 0.5,
            positive_score: 0.5,
            negative_score: 0.5,
          },
          keywords: [],
          intent: {
            type: 'unknown',
            confidence: 0.0,
          },
          response_time: 50,
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeMessage('');

      expect(result).toEqual(mockResponse);
    });

    it('긴 메시지 분석', async () => {
      const longMessage = 'a'.repeat(10000);
      const mockResponse = {
        success: true,
        response: '분석 완료',
        analysis: {
          emotion: {
            sentiment: 'neutral',
            confidence: 0.5,
            positive_score: 0.5,
            negative_score: 0.5,
          },
          keywords: ['keyword'],
          intent: {
            type: 'analysis',
            confidence: 0.8,
          },
          response_time: 200,
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeMessage(longMessage);

      expect(result).toEqual(mockResponse);
    });

    it('특수 문자 포함 메시지 분석', async () => {
      const specialMessage = '테스트!@#$%^&*()메시지';
      const mockResponse = {
        success: true,
        response: '분석 완료',
        analysis: {
          emotion: {
            sentiment: 'neutral',
            confidence: 0.5,
            positive_score: 0.5,
            negative_score: 0.5,
          },
          keywords: [],
          intent: {
            type: 'unknown',
            confidence: 0.0,
          },
          response_time: 100,
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeMessage(specialMessage);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('응답 구조', () => {
    it('분석 응답 구조 확인', async () => {
      const mockResponse = {
        success: true,
        response: '응답',
        analysis: {
          emotion: {
            sentiment: 'positive',
            confidence: 0.9,
            positive_score: 0.8,
            negative_score: 0.2,
          },
          keywords: ['키워드'],
          intent: {
            type: 'question',
            confidence: 0.85,
          },
          response_time: 150,
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeMessage('테스트');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('timestamp');
      expect(result.analysis).toHaveProperty('emotion');
      expect(result.analysis).toHaveProperty('keywords');
      expect(result.analysis).toHaveProperty('intent');
      expect(result.analysis).toHaveProperty('response_time');
    });

    it('시스템 상태 응답 구조 확인', async () => {
      const mockStatus = {
        status: 'healthy',
        version: '1.0.0',
        metrics: {
          total_requests: 1000,
          successful_requests: 950,
          failed_requests: 50,
          average_response_time: 150,
          last_updated: '2024-01-01T00:00:00Z',
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await service.getSystemStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('timestamp');
      expect(result.metrics).toHaveProperty('total_requests');
      expect(result.metrics).toHaveProperty('successful_requests');
      expect(result.metrics).toHaveProperty('failed_requests');
      expect(result.metrics).toHaveProperty('average_response_time');
      expect(result.metrics).toHaveProperty('last_updated');
    });
  });

  describe('testConnection', () => {
    it('연결 성공 시 true 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'healthy',
          service: 'integrated-api',
          timestamp: '2024-01-01T00:00:00Z',
        }),
      });

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, INTEGRATED_API_HEALTH_PATH),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('연결 실패 시 false 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('네트워크 에러 시 false 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });
});

