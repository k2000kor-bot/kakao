/**
 * errorLogger 유틸리티
 * Task-C1: 에러 로깅 개선
 * 
 * 일관된 에러 로깅을 위한 유틸리티 함수
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

