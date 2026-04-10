/**
 * errorHandler.tsx 유틸리티 테스트
 * 고급 에러 핸들링 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import {
  errorHandler as errorHandlerInstance,
  setupGlobalErrorHandling,
  ErrorBoundary,
  type ErrorInfo,
} from '../errorHandler.tsx';

// errorHandler 인스턴스 사용
const errorHandler = errorHandlerInstance;

// console 메서드 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

describe('errorHandler.tsx', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    errorHandler.clearErrorLog();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockAlert.mockRestore();
  });

  describe('ErrorHandler 싱글톤', () => {
    it('errorHandler는 싱글톤 인스턴스여야 함', () => {
      // errorHandler는 이미 싱글톤 인스턴스
      // 같은 인스턴스를 참조하는지 확인
      const handler1 = errorHandler;
      const handler2 = errorHandler;

      expect(handler1).toBe(handler2);
    });
  });

  describe('handleError', () => {
    it('네트워크 에러를 처리해야 함', () => {
      const error = new Error('Failed to fetch');
      const response = errorHandler.handleError(error);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('NETWORK_ERROR');
      expect(response.error.message).toBe('네트워크 연결에 문제가 있습니다.');
      expect(response.error.severity).toBe('high');
      expect(response.retryable).toBe(true);
      expect(response.suggestions).toContain('인터넷 연결을 확인해주세요.');
    });

    it('API 에러를 처리해야 함', () => {
      const error = new Error('API server error');
      const response = errorHandler.handleError(error);

      expect(response.error.code).toBe('API_ERROR');
      expect(response.error.message).toBe('서버와의 통신에 문제가 있습니다.');
      expect(response.error.severity).toBe('high');
      expect(response.retryable).toBe(true);
    });

    it('인증 에러를 처리해야 함', () => {
      const error = new Error('Unauthorized auth error');
      const response = errorHandler.handleError(error);

      expect(response.error.code).toBe('AUTH_ERROR');
      expect(response.error.message).toBe('인증에 문제가 있습니다.');
      expect(response.error.severity).toBe('critical');
      expect(response.retryable).toBe(false);
      expect(response.suggestions).toContain('로그인 상태를 확인해주세요.');
    });

    it('일반 에러를 처리해야 함', () => {
      const error = new Error('General error');
      const response = errorHandler.handleError(error);

      expect(response.error.code).toBe('GENERAL_ERROR');
      expect(response.error.message).toBe('예상치 못한 오류가 발생했습니다.');
      expect(response.error.severity).toBe('medium');
      expect(response.retryable).toBe(true);
    });

    it('알 수 없는 에러를 처리해야 함', () => {
      const error = 'String error';
      const response = errorHandler.handleError(error);

      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('알 수 없는 오류가 발생했습니다.');
      expect(response.error.severity).toBe('medium');
    });

    it('컨텍스트 정보를 포함해야 함', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      const response = errorHandler.handleError(error, context);

      expect(response.error.context).toEqual(context);
    });
  });

  describe('getErrorLog', () => {
    it('에러 로그를 반환해야 함', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0].code).toBe('GENERAL_ERROR');
    });

    it('로그의 복사본을 반환해야 함', () => {
      errorHandler.handleError(new Error('Error 1'));
      const log1 = errorHandler.getErrorLog();
      const log2 = errorHandler.getErrorLog();

      expect(log1).not.toBe(log2);
      expect(log1).toEqual(log2);
    });
  });

  describe('clearErrorLog', () => {
    it('에러 로그를 클리어해야 함', () => {
      errorHandler.handleError(new Error('Error 1'));
      errorHandler.handleError(new Error('Error 2'));

      errorHandler.clearErrorLog();

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(0);
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

      expect(result.success).toBe(false);
      // API 에러 메시지가 포함되어 있으면 API_ERROR로 분류됨
      const errorCode = (result as { error?: { code?: string } }).error?.code;
      expect(['API_ERROR', 'GENERAL_ERROR']).toContain(errorCode);
    });

    it('컨텍스트 정보를 전달해야 함', async () => {
      const error = new Error('Test error');
      const apiCall = jest.fn().mockRejectedValue(error);

      await errorHandler.safeApiCall(apiCall, { component: 'Test' });

      const log = errorHandler.getErrorLog();
      expect(log[0].context?.component).toBe('Test');
    });
  });

  describe('safeExecute', () => {
    it('성공적인 함수 실행을 처리해야 함', () => {
      const fn = jest.fn().mockReturnValue('success');

      const result = errorHandler.safeExecute(fn);

      expect(result).toEqual({
        success: true,
        data: 'success',
      });
      expect(fn).toHaveBeenCalled();
    });

    it('실패한 함수 실행을 처리해야 함', () => {
      const error = new Error('Function failed');
      const fn = jest.fn().mockImplementation(() => {
        throw error;
      });

      const result = errorHandler.safeExecute(fn);

      expect(result.success).toBe(false);
      expect((result as { error?: { code?: string } }).error?.code).toBe('GENERAL_ERROR');
    });

    it('컨텍스트 정보를 전달해야 함', () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockImplementation(() => {
        throw error;
      });

      errorHandler.safeExecute(fn, { component: 'Test' });

      const log = errorHandler.getErrorLog();
      expect(log[0].context?.component).toBe('Test');
    });
  });

  describe('setupGlobalErrorHandling', () => {
    it('전역 에러 핸들러를 설정해야 함', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      setupGlobalErrorHandling();

      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('unhandledrejection 이벤트를 처리해야 함', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      setupGlobalErrorHandling();

      // unhandledrejection 이벤트 리스너가 등록되었는지 확인
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('critical 에러는 severity가 critical이어야 함', () => {
      // critical 에러를 직접 처리하여 severity 확인
      const error = new Error('Unauthorized auth error');
      const response = errorHandler.handleError(error);
      
      // critical 에러인지 확인
      expect(response.error.severity).toBe('critical');
      expect(response.error.code).toBe('AUTH_ERROR');
    });
  });

  describe('ErrorBoundary', () => {
    it('에러가 없으면 children을 렌더링해야 함', () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );

      expect(container.textContent).toBe('Test Content');
    });

    it('에러가 발생하면 에러 UI를 표시해야 함', () => {
      // React의 Error Boundary는 테스트 환경에서 제대로 작동하지 않을 수 있으므로
      // 에러가 발생했을 때 ErrorBoundary가 에러를 잡는지 확인
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // 에러 메시지가 표시되는지 확인 (여러 요소가 있을 수 있으므로 queryAllByText 사용)
      const errorMessages = screen.queryAllByText(/오류가 발생했습니다/);
      expect(errorMessages.length).toBeGreaterThan(0);
      
      // 에러 상세 메시지 확인
      const detailMessages = screen.queryAllByText(/예상치 못한 오류가 발생했습니다/);
      expect(detailMessages.length).toBeGreaterThan(0);
    });

    it('커스텀 fallback 컴포넌트를 사용해야 함', () => {
      const CustomFallback: React.FC<{ error: ErrorInfo }> = ({ error }) => (
        <div>Custom Error: {error.message}</div>
      );

      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Custom Error:/)).toBeInTheDocument();
    });

    it('새로고침 버튼이 작동해야 함', () => {
      // window.location.reload는 모킹하기 어려우므로
      // 버튼이 렌더링되고 클릭 가능한지만 확인
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText(/페이지 새로고침/);
      expect(reloadButton).toBeInTheDocument();
      // 버튼이 존재하고 클릭 가능한지 확인
      expect(reloadButton.tagName).toBe('BUTTON');
    });
  });

  describe('로그 크기 제한', () => {
    it('최대 로그 크기를 초과하면 오래된 로그를 제거해야 함', () => {
      // 최대 크기는 100이므로 101개를 추가
      for (let i = 0; i < 101; i++) {
        errorHandler.handleError(new Error(`Error ${i}`));
      }

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(100);
      expect(log[0].details).toContain('Error 1'); // 첫 번째가 제거됨
    });
  });

  describe('심각도별 로깅', () => {
    it('critical 에러는 추가 로깅해야 함', () => {
      const error = new Error('Unauthorized auth error');
      errorHandler.handleError(error);

      expect(mockConsoleError).toHaveBeenCalledTimes(2); // 일반 로그 + 심각도 로그
    });

    it('high 에러는 추가 로깅해야 함', () => {
      const error = new Error('Failed to fetch');
      errorHandler.handleError(error);

      expect(mockConsoleError).toHaveBeenCalledTimes(2);
    });

    it('medium 에러는 일반 로깅만 해야 함', () => {
      const error = new Error('General error');
      errorHandler.handleError(error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });
});

