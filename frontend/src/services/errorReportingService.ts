/**
 * 에러 리포팅 서비스
 * 에러를 수집하고 외부 서비스로 전송하는 기능 제공
 * 
 * Task-C1: 에러 리포팅 개선
 */

import { errorLogger } from '../utils/errorLogger';
import { ERROR_REPORTS_STORAGE_KEY } from './errorReportingStorageKeys';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  environment?: 'development' | 'staging' | 'production';
  sampleRate?: number; // 0-1, 에러 샘플링 비율
  maxReportsPerSession?: number;
}

class ErrorReportingService {
  private config: ErrorReportingConfig = {
    enabled: true,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    sampleRate: 1.0,
    maxReportsPerSession: 50,
  };

  private reports: ErrorReport[] = [];
  private sessionReportCount = 0;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandling();
    }
  }

  /**
   * 설정 업데이트
   */
  configure(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 에러 리포트 생성 및 전송
   */
  async reportError(
    error: Error,
    context?: {
      componentStack?: string;
      userId?: string;
      severity?: ErrorReport['severity'];
      additionalContext?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // 샘플링 체크
    if (Math.random() > (this.config.sampleRate || 1.0)) {
      return;
    }

    // 세션당 최대 리포트 수 체크
    if (this.sessionReportCount >= (this.config.maxReportsPerSession || 50)) {
      errorLogger.warn('Maximum error reports per session reached', {
        component: 'ErrorReportingService',
        action: 'reportError',
        sessionReportCount: this.sessionReportCount,
        maxReports: this.config.maxReportsPerSession || 50,
      });
      return;
    }

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      componentStack: context?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '',
      url: (typeof window !== 'undefined' && window.location?.href) || '',
      userId: context?.userId,
      sessionId: this.sessionId,
      severity: context?.severity || this.determineSeverity(error),
      context: context?.additionalContext,
    };

    this.reports.push(errorReport);
    this.sessionReportCount++;

    // 로컬 스토리지에 저장 (개발용)
    this.saveToLocalStorage(errorReport);

    // 외부 서비스로 전송 (설정된 경우)
    if (this.config.endpoint) {
      await this.sendToExternalService(errorReport);
    }

    // 개발 모드에서는 로깅
    if (this.config.environment === 'development') {
      errorLogger.info('Error Report', {
        component: 'ErrorReportingService',
        action: 'reportError',
        errorReport,
      });
    }
  }

  /**
   * 에러 심각도 결정
   */
  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();

    // Critical: 네트워크 오류, 인증 오류 등
    if (
      message.includes('network') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('authentication')
    ) {
      return 'critical';
    }

    // High: 렌더링 오류, 데이터 오류 등
    if (
      message.includes('render') ||
      message.includes('cannot read') ||
      message.includes('undefined') ||
      message.includes('null')
    ) {
      return 'high';
    }

    // Medium: 일반적인 런타임 오류
    if (message.includes('type') || message.includes('syntax')) {
      return 'medium';
    }

    // Low: 기타 오류
    return 'low';
  }

  /**
   * 외부 서비스로 전송
   */
  private async sendToExternalService(report: ErrorReport): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) {
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        errorLogger.warn('Failed to send error report to external service', {
          component: 'ErrorReportingService',
          action: 'sendToExternalService',
          status: response.status,
        });
      }
    } catch (error) {
      errorLogger.warn('Error sending report to external service', {
        component: 'ErrorReportingService',
        action: 'sendToExternalService',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 로컬 스토리지에 저장
   */
  private saveToLocalStorage(report: ErrorReport): void {
    try {
      const stored = localStorage.getItem(ERROR_REPORTS_STORAGE_KEY);
      const reports = stored ? JSON.parse(stored) : [];
      reports.push(report);

      // 최대 100개만 유지
      if (reports.length > 100) {
        reports.shift();
      }

      localStorage.setItem(ERROR_REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      errorLogger.warn('Failed to save error report to localStorage', {
        component: 'ErrorReportingService',
        action: 'saveToLocalStorage',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 저장된 에러 리포트 조회
   */
  getStoredReports(): ErrorReport[] {
    try {
      const stored = localStorage.getItem(ERROR_REPORTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      errorLogger.warn('Failed to retrieve error reports from localStorage', {
        component: 'ErrorReportingService',
        action: 'getStoredReports',
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * 에러 리포트 통계
   */
  getErrorStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    recent: ErrorReport[];
  } {
    const reports = this.getStoredReports();
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    reports.forEach((report) => {
      bySeverity[report.severity] = (bySeverity[report.severity] || 0) + 1;
    });

    return {
      total: reports.length,
      bySeverity,
      recent: reports.slice(-10).reverse(),
    };
  }

  /**
   * 저장된 에러 리포트 삭제
   */
  clearStoredReports(): void {
    localStorage.removeItem(ERROR_REPORTS_STORAGE_KEY);
  }

  /**
   * 전역 에러 핸들링 설정
   */
  private setupGlobalErrorHandling(): void {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.reportError(
        new Error(event.message),
        {
          severity: 'high',
          additionalContext: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }
      );
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      this.reportError(error, {
        severity: 'medium',
        additionalContext: {
          type: 'unhandledrejection',
        },
      });
    });
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 에러 ID 생성
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export { ERROR_REPORTS_STORAGE_KEY } from './errorReportingStorageKeys';

// 싱글톤 인스턴스
export const errorReportingService = new ErrorReportingService();

// 개발 모드에서 전역 객체로 노출 (디버깅용)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    (window as Window & { errorReportingService?: typeof errorReportingService }).errorReportingService =
      errorReportingService;
  } catch (_) {}
}

export default errorReportingService;

