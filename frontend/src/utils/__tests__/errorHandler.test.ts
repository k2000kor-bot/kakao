/**
 * errorHandler 유틸리티 테스트
 * 에러 처리 및 로깅 기능 확인
 * @jest-environment jsdom
*/

import { API_SMOKE_TEST_PATH } from '../../config/api';
import { errorHandler, setupGlobalErrorHandling, type ErrorContext } from '../errorHandler';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// console 메서드 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorHandler.clearErrorLog();
    localStorageMock.clear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('logError', () => {
    it('에러를 로깅해야 함', () => {
      const error = new Error('Test error');
      errorHandler.logError(error);

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0].error.message).toBe('Test error');
      expect(log[0].context).toHaveProperty('timestamp');
      expect(log[0].context).toHaveProperty('userAgent');
      expect(log[0].context).toHaveProperty('url');
    });

    it('컨텍스트 정보를 포함해야 함', () => {
      const error = new Error('Test error');
      const context: Partial<ErrorContext> = {
        component: 'TestComponent',
        action: 'testAction',
      };

      errorHandler.logError(error, context);

      const log = errorHandler.getErrorLog();
      expect(log[0].context.component).toBe('TestComponent');
      expect(log[0].context.action).toBe('testAction');
    });

    it('로컬 스토리지에 저장해야 함', () => {
      const error = new Error('Test error');
      errorHandler.logError(error);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'errorLog',
        expect.stringContaining('Test error')
      );
    });

    it('최대 로그 크기를 초과하면 오래된 로그를 제거해야 함', () => {
      // 최대 크기는 100이므로 101개를 추가
      for (let i = 0; i < 101; i++) {
        errorHandler.logError(new Error(`Error ${i}`));
      }

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(100);
      expect(log[0].error.message).toBe('Error 1'); // 첫 번째가 제거됨
    });

    it('로컬 스토리지 저장 실패 시 에러를 처리해야 함', () => {
      const error = new Error('Test error');
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      // 에러가 발생해도 예외가 전파되지 않아야 함
      expect(() => {
        errorHandler.logError(error);
      }).not.toThrow();
    });
  });

  describe('getErrorLog', () => {
    it('에러 로그를 반환해야 함', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorHandler.logError(error1);
      errorHandler.logError(error2);

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(2);
      expect(log[0].error.message).toBe('Error 1');
      expect(log[1].error.message).toBe('Error 2');
    });

    it('로그의 복사본을 반환해야 함', () => {
      const error = new Error('Test error');
      errorHandler.logError(error);

      const log1 = errorHandler.getErrorLog();
      const log2 = errorHandler.getErrorLog();

      expect(log1).not.toBe(log2);
      expect(log1).toEqual(log2);
    });
  });

  describe('clearErrorLog', () => {
    it('에러 로그를 클리어해야 함', () => {
      errorHandler.logError(new Error('Error 1'));
      errorHandler.logError(new Error('Error 2'));

      errorHandler.clearErrorLog();

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(0);
    });

    it('로컬 스토리지에서도 제거해야 함', () => {
      errorHandler.logError(new Error('Test error'));
      errorHandler.clearErrorLog();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('errorLog');
    });
  });

  describe('handleAPIError', () => {
    it('400 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('Bad Request');
    });

    it('401 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('인증이 필요합니다.');
    });

    it('403 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 403,
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('권한이 없습니다.');
    });

    it('404 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 404,
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('요청한 리소스를 찾을 수 없습니다.');
    });

    it('500 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    });

    it('503 에러를 처리해야 함', () => {
      const error = {
        response: {
          status: 503,
        },
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('서비스를 일시적으로 사용할 수 없습니다.');
    });

    it('요청은 보냈지만 응답을 받지 못한 경우를 처리해야 함', () => {
      const error = {
        request: {},
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    });

    it('요청 설정 중 오류를 처리해야 함', () => {
      const error = {
        message: 'Request setup error',
      };

      const message = errorHandler.handleAPIError(error, API_SMOKE_TEST_PATH);
      expect(message).toBe('Request setup error');
    });
  });

  describe('handleNetworkError', () => {
    beforeEach(() => {
      // navigator.onLine 모킹
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      });
    });

    it('오프라인 상태를 감지해야 함', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      });

      const error = new Error('Network error');
      const message = errorHandler.handleNetworkError(error);

      expect(message).toBe('인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.');
    });

    it('타임아웃 에러를 처리해야 함', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout',
      };

      const message = errorHandler.handleNetworkError(error);
      expect(message).toBe('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    });

    it('Failed to fetch 에러를 처리해야 함', () => {
      const error = {
        message: 'Failed to fetch',
      };

      const message = errorHandler.handleNetworkError(error);
      expect(message).toBe('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    });

    it('기본 네트워크 에러를 처리해야 함', () => {
      const error = new Error('Unknown network error');
      const message = errorHandler.handleNetworkError(error);

      expect(message).toBe('네트워크 오류가 발생했습니다.');
    });
  });

  describe('safeApiCall', () => {
    it('성공적인 API 호출을 처리해야 함', async () => {
      const apiCall = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await errorHandler.safeApiCall(apiCall);

      expect(result).toEqual({
        success: true,
        data: { data: 'success' },
      });
      expect(apiCall).toHaveBeenCalled();
    });

    it('실패한 API 호출을 처리해야 함', async () => {
      const error = new Error('API call failed');
      const apiCall = jest.fn().mockRejectedValue(error);

      const result = await errorHandler.safeApiCall(apiCall);

      expect(result).toEqual({
        success: false,
        error: {
          message: 'API call failed',
          details: expect.any(String),
        },
      });
    });

    it('문자열 에러를 처리해야 함', async () => {
      const apiCall = jest.fn().mockRejectedValue('String error');

      const result = await errorHandler.safeApiCall(apiCall);

      expect(result.success).toBe(false);
      expect((result as { success: false; error: { message: string } }).error?.message).toBe('String error');
    });

    it('컨텍스트 정보를 사용해야 함', async () => {
      const apiCall = jest.fn().mockResolvedValue({ data: 'success' });

      await errorHandler.safeApiCall(apiCall, {
        component: 'TestComponent',
        action: 'testAction',
      });

      errorHandler.getErrorLog();
      // 성공한 경우에도 로그가 남지 않아야 함 (에러가 없으므로)
    });
  });

  describe('setupGlobalErrorHandling', () => {
    it('전역 에러 핸들러를 설정해야 함', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      setupGlobalErrorHandling();

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });
  });
});

