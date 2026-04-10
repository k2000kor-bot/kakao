/**
 * 전역 에러 처리 유틸리티
 */

import { errorLogger } from './errorLogger';
import { UI_ERROR_LOG_STORAGE_KEY } from '../services/uiErrorLogStorageKeys';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

class ErrorHandler {
  private errorLog: Array<{ error: Error; context: ErrorContext }> = [];
  private maxLogSize = 100;

  /**
   * 에러 로깅
   */
  logError(error: Error, context: Partial<ErrorContext> = {}): void {
    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };

    this.errorLog.push({ error, context: errorContext });

    // 최대 크기 제한
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 에러 로깅
    errorLogger.error('Error logged', error, {
      component: errorContext.component || 'unknown',
      action: errorContext.action || 'unknown',
      ...errorContext,
    });

    // 로컬 스토리지에 저장
    try {
      const stored = JSON.parse(localStorage.getItem(UI_ERROR_LOG_STORAGE_KEY) || '[]');
      stored.push({
        message: error.message,
        stack: error.stack,
        context: errorContext,
      });

      // 최대 50개만 유지
      if (stored.length > 50) {
        stored.shift();
      }

      localStorage.setItem(UI_ERROR_LOG_STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      errorLogger.error('Failed to save error to localStorage', e instanceof Error ? e : new Error(String(e)), {
        component: 'errorHandler',
        action: 'logError',
      });
    }

    // 실제 환경에서는 에러 리포팅 서비스로 전송
    // this.reportToService(error, errorContext);
  }

  /**
   * 에러 리포팅 (선택적)
   */
  private reportToService(_error: Error, _context: ErrorContext): void {
    // 실제 환경에서는 Sentry, LogRocket 등의 서비스로 전송
    // 예시:
    // if (process.env.REACT_APP_SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * 에러 로그 조회
   */
  getErrorLog(): Array<{ error: Error; context: ErrorContext }> {
    return [...this.errorLog];
  }

  /**
   * 에러 로그 클리어
   */
  clearErrorLog(): void {
    this.errorLog = [];
    try {
      localStorage.removeItem(UI_ERROR_LOG_STORAGE_KEY);
    } catch (e) {
      errorLogger.error('Failed to clear error log', e instanceof Error ? e : new Error(String(e)), {
        component: 'errorHandler',
        action: 'clearErrorLog',
      });
    }
  }

  /**
   * API 에러 처리
   */
  handleAPIError(error: unknown, endpoint: string): string {
    let message = '요청 처리 중 오류가 발생했습니다.';

    const err = error as { response?: { status: number; data?: { message?: string } }; request?: unknown; message?: string };
    if (err.response) {
      // 서버 응답이 있는 경우
      const status = err.response.status;
      const data = err.response.data;

      switch (status) {
        case 400:
          message = data?.message || '잘못된 요청입니다.';
          break;
        case 401:
          message = '인증이 필요합니다.';
          break;
        case 403:
          message = '권한이 없습니다.';
          break;
        case 404:
          message = '요청한 리소스를 찾을 수 없습니다.';
          break;
        case 500:
          message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 503:
          message = '서비스를 일시적으로 사용할 수 없습니다.';
          break;
        default:
          message = data?.message || `오류가 발생했습니다. (${status})`;
      }
    } else if (err.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      message = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
    } else {
      // 요청 설정 중 오류
      message = err.message || '요청 설정 중 오류가 발생했습니다.';
    }

    // 에러 로깅
    this.logError(
      new Error(message),
      {
        component: 'API',
        action: endpoint,
      }
    );

    return message;
  }

  /**
   * 네트워크 에러 처리
   */
  handleNetworkError(error: unknown): string {
    let message = '네트워크 오류가 발생했습니다.';
    const err = error as { code?: string; message?: string };
    if (!navigator.onLine) {
      message = '인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.';
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      message = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    } else if (err.message?.includes('Failed to fetch')) {
      message = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
    }

    this.logError(new Error(message), {
      component: 'Network',
      action: 'fetch',
    });

    return message;
  }

  /**
   * 안전한 API 호출 래퍼
   */
  async safeApiCall<T>(
    apiCall: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<{ success: true; data: T } | { success: false; error: { message: string; details?: string } }> {
    try {
      const data = await apiCall();
      return { success: true, data };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logError(errorObj, {
        component: context?.component as string || 'API',
        action: context?.action as string || 'apiCall',
      });
      return {
        success: false,
        error: {
          message: errorObj.message,
          details: errorObj.stack,
        },
      };
    }
  }
}

// 싱글톤 인스턴스
export const errorHandler = new ErrorHandler();
/**
 * 전역 에러 핸들링 설정 함수
 */
export function setupGlobalErrorHandling(): void {
  // 전역 에러 핸들러 설정
  window.addEventListener('error', (event) => {
    if (event.error) {
      errorLogger.error('전역 에러 발생', event.error, {
        component: 'global',
        action: 'error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      errorHandler.logError(event.error, {
        component: 'global',
        action: 'error',
      });
    }
  });

  // 처리되지 않은 Promise 거부 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    errorLogger.error('처리되지 않은 Promise 거부', error, {
      component: 'global',
      action: 'unhandledrejection',
    });
    errorHandler.logError(error, {
      component: 'global',
      action: 'unhandledrejection',
    });
  });
}

export default errorHandler;

