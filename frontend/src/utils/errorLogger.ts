/**
 * errorLogger 유틸리티
 * Task-C1: 에러 로깅 개선. 일관된 에러 로깅을 위한 유틸리티 (error/warn/info/debug).
 * @module errorLogger
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    const fullMessage = this.formatMessage('error', message, {
      ...context,
      error: errorMessage,
      stack,
    });

    if (this.isDevelopment) {
      console.error(fullMessage, error);
    } else {
      // 프로덕션에서는 에러 추적 서비스로 전송
      // 예: Sentry, LogRocket 등
      console.error(fullMessage);
    }
  }

  warn(message: string, context?: LogContext): void {
    const fullMessage = this.formatMessage('warn', message, context);
    if (this.isDevelopment) {
      console.warn(fullMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    const fullMessage = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.log(fullMessage);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const fullMessage = this.formatMessage('debug', message, context);
      console.debug(fullMessage);
    }
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Helper function to safely convert unknown error types to Error objects
 * 여러 컴포넌트에서 중복 사용되던 toError 함수를 공통 유틸리티로 추출
 * @param err - 변환할 에러 (unknown 타입)
 * @returns Error 객체
 */
export const toError = (err: unknown): Error => {
  // instanceof 체크를 안전하게 수행
  try {
    if (err && typeof err === 'object' && 'message' in err && 'name' in err) {
      const errorObj = err as { message?: unknown; name?: unknown; stack?: unknown };
      const error: Error = new Error(String(errorObj.message || err));
      if (errorObj.name) error.name = String(errorObj.name);
      if (errorObj.stack) (error as { stack?: unknown }).stack = errorObj.stack;
      return error;
    }
  } catch {
    // instanceof 체크 실패 시 계속 진행
  }
  
  // Error 생성자를 명시적으로 사용
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const ErrorConstructor = globalThis.Error as unknown as new (message?: string) => Error;
    if (typeof ErrorConstructor === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return new ErrorConstructor(String(err));
    }
  } catch {
    // Error 생성자 사용 실패 시 폴백
  }
  
  // 최종 폴백: 일반 객체로 Error 생성
  return new Error(String(err));
};

