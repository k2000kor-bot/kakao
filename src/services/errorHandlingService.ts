/**
 * 고급 에러 처리 및 사용자 피드백 시스템
 * 모든 에러를 체계적으로 관리하고 사용자에게 친화적인 피드백 제공
 */

import { API_BASE_URL, API_ERRORS_REPORT_PATH, joinApiHealthCheckUrl } from '../config/api';
import { errorLogger } from '../utils/errorLogger';
import { ERROR_HANDLING_LOGS_STORAGE_KEY } from './errorHandlingStorageKeys';

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  context: ErrorContext;
  stackTrace?: string;
  suggestions: string[];
  recoveryActions: RecoveryAction[];
}

export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  SYSTEM = 'system',
  AI_SERVICE = 'ai_service',
  FILE_PROCESSING = 'file_processing',
  USER_INPUT = 'user_input'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RecoveryAction {
  label: string;
  action: () => Promise<void>;
  icon?: string;
  priority: number;
}

export interface UserFeedback {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

class ErrorHandlingService {
  private errorHistory: ErrorReport[] = [];
  private feedbackCallbacks: Array<(feedback: UserFeedback) => void> = [];
  private retryAttempts: Map<string, number> = new Map();
  private maxRetryAttempts = 3;

  /**
   * 에러 보고 및 처리
   */
  async reportError(
    error: Error | string,
    context: Partial<ErrorContext>,
    customMessage?: string
  ): Promise<ErrorReport> {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      type: this.classifyError(error),
      severity: this.assessSeverity(error, context),
      message: typeof error === 'string' ? error : error.message,
      userMessage: customMessage || this.generateUserFriendlyMessage(error),
      context: {
        component: 'unknown',
        action: 'unknown',
        timestamp: new Date(),
        sessionId: this.getSessionId(),
        ...context
      },
      stackTrace: typeof error === 'object' ? error.stack : undefined,
      suggestions: this.generateSuggestions(error, context),
      recoveryActions: this.generateRecoveryActions(error, context)
    };

    // 에러 히스토리에 추가
    this.errorHistory.push(errorReport);

    // 에러 로깅
    await this.logError(errorReport);

    // 사용자 피드백 생성
    const feedback = this.createUserFeedback(errorReport);
    this.showFeedback(feedback);

    // 자동 복구 시도
    await this.attemptAutoRecovery(errorReport);

    return errorReport;
  }

  /**
   * 에러 분류
   */
  private classifyError(error: Error | string): ErrorType {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
      return ErrorType.PERMISSION;
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('model')) {
      return ErrorType.AI_SERVICE;
    }
    if (lowerMessage.includes('file') || lowerMessage.includes('upload')) {
      return ErrorType.FILE_PROCESSING;
    }

    return ErrorType.SYSTEM;
  }

  /**
   * 에러 심각도 평가
   */
  private assessSeverity(error: Error | string, context: Partial<ErrorContext>): ErrorSeverity {
    const message = typeof error === 'string' ? error : error.message;
    
    // 중요한 컴포넌트에서 발생한 에러
    if (context.component?.includes('AI') || context.component?.includes('Chat')) {
      return ErrorSeverity.HIGH;
    }

    // 네트워크 에러
    if (message.includes('network') || message.includes('timeout')) {
      return ErrorSeverity.MEDIUM;
    }

    // 사용자 입력 관련 에러
    if (message.includes('validation') || message.includes('input')) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * 사용자 친화적 메시지 생성
   */
  private generateUserFriendlyMessage(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network')) {
      return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
    }
    if (lowerMessage.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }
    if (lowerMessage.includes('validation')) {
      return '입력하신 정보에 오류가 있습니다. 다시 확인해주세요.';
    }
    if (lowerMessage.includes('unauthorized')) {
      return '인증이 필요합니다. 다시 로그인해주세요.';
    }
    if (lowerMessage.includes('forbidden')) {
      return '이 작업을 수행할 권한이 없습니다.';
    }
    if (lowerMessage.includes('ai') || lowerMessage.includes('model')) {
      return 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    return '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  /**
   * 해결 제안 생성
   */
  private generateSuggestions(error: Error | string, _context: Partial<ErrorContext>): string[] {
    const message = typeof error === 'string' ? error : error.message;
    const suggestions: string[] = [];

    if (message.includes('network')) {
      suggestions.push('인터넷 연결 상태를 확인하세요');
      suggestions.push('VPN을 사용 중이라면 잠시 비활성화해보세요');
      suggestions.push('브라우저를 새로고침하세요');
    }

    if (message.includes('validation')) {
      suggestions.push('입력 형식을 다시 확인하세요');
      suggestions.push('필수 필드가 모두 채워졌는지 확인하세요');
    }

    if (message.includes('ai')) {
      suggestions.push('질문을 더 간단하게 다시 작성해보세요');
      suggestions.push('파일 크기가 너무 크지 않은지 확인하세요');
    }

    suggestions.push('페이지를 새로고침하세요');
    suggestions.push('문제가 지속되면 고객지원에 문의하세요');

    return suggestions;
  }

  /**
   * 복구 액션 생성
   */
  private generateRecoveryActions(error: Error | string, context: Partial<ErrorContext>): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // 재시도 액션
    actions.push({
      label: '다시 시도',
      action: async () => {
        const retryKey = `${context.component}-${context.action}`;
        const attempts = this.retryAttempts.get(retryKey) || 0;
        
        if (attempts < this.maxRetryAttempts) {
          this.retryAttempts.set(retryKey, attempts + 1);
          // 원래 액션 재실행 로직
        }
      },
      icon: '🔄',
      priority: 1
    });

    // 새로고침 액션
    actions.push({
      label: '페이지 새로고침',
      action: async () => {
        window.location.reload();
      },
      icon: '↻',
      priority: 2
    });

    // 홈으로 이동
    actions.push({
      label: '홈으로 이동',
      action: async () => {
        window.location.href = '/';
      },
      icon: '🏠',
      priority: 3
    });

    return actions;
  }

  /**
   * 사용자 피드백 생성
   */
  private createUserFeedback(errorReport: ErrorReport): UserFeedback {
    const { severity, userMessage, recoveryActions } = errorReport;

    let type: UserFeedback['type'] = 'error';
    if (severity === ErrorSeverity.LOW) type = 'warning';
    if (severity === ErrorSeverity.CRITICAL) type = 'error';

    return {
      type,
      title: this.getSeverityTitle(severity),
      message: userMessage,
      duration: severity === ErrorSeverity.LOW ? 5000 : 0, // 낮은 심각도는 자동으로 사라짐
      actions: recoveryActions.map(action => ({
        label: action.label,
        action: action.action,
        style: action.priority === 1 ? 'primary' : 'secondary'
      }))
    };
  }

  /**
   * 심각도별 제목
   */
  private getSeverityTitle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW: return '알림';
      case ErrorSeverity.MEDIUM: return '주의';
      case ErrorSeverity.HIGH: return '오류';
      case ErrorSeverity.CRITICAL: return '심각한 오류';
      default: return '알림';
    }
  }

  /**
   * 자동 복구 시도
   */
  private async attemptAutoRecovery(errorReport: ErrorReport): Promise<void> {
    const { type, context } = errorReport;

    try {
      switch (type) {
        case ErrorType.NETWORK:
          // 네트워크 재연결 시도
          await this.retryNetworkConnection();
          break;
        
        case ErrorType.AI_SERVICE:
          // AI 서비스 재시작 시도
          await this.restartAIService();
          break;
        
        case ErrorType.FILE_PROCESSING:
          // 파일 처리 재시도
          await this.retryFileProcessing(context);
          break;
      }
    } catch (recoveryError) {
      errorLogger.warn('자동 복구 실패', {
        component: 'ErrorHandlingService',
        action: 'attemptAutoRecovery',
        errorType: errorReport.type,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
      });
    }
  }

  /**
   * 네트워크 재연결 시도
   */
  private async retryNetworkConnection(): Promise<void> {
    // 간단한 핑 테스트
    try {
      await fetch(joinApiHealthCheckUrl(API_BASE_URL), { method: 'HEAD' });
      this.showFeedback({
        type: 'success',
        title: '연결 복구',
        message: '네트워크 연결이 복구되었습니다.',
        duration: 3000
      });
    } catch {
      // 복구 실패
    }
  }

  /**
   * AI 서비스 재시작
   */
  private async restartAIService(): Promise<void> {
    // AI 서비스 상태 확인 및 재시작 로직
    errorLogger.info('AI 서비스 재시작 시도', {
      component: 'ErrorHandlingService',
      action: 'restartAIService',
    });
  }

  /**
   * 파일 처리 재시도
   */
  private async retryFileProcessing(context: Partial<ErrorContext>): Promise<void> {
    // 파일 처리 재시도 로직
    errorLogger.info('파일 처리 재시도', {
      component: 'ErrorHandlingService',
      action: 'retryFileProcessing',
      context,
    });
  }

  /**
   * 피드백 표시
   */
  private showFeedback(feedback: UserFeedback): void {
    this.feedbackCallbacks.forEach(callback => callback(feedback));
  }

  /**
   * 피드백 콜백 등록
   */
  registerFeedbackCallback(callback: (feedback: UserFeedback) => void): void {
    this.feedbackCallbacks.push(callback);
  }

  /**
   * 에러 로깅
   */
  private async logError(errorReport: ErrorReport): Promise<void> {
    try {
      // 로컬 스토리지에 저장
      const logs = JSON.parse(localStorage.getItem(ERROR_HANDLING_LOGS_STORAGE_KEY) || '[]');
      logs.push(errorReport);
      
      // 최대 100개까지만 보관
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem(ERROR_HANDLING_LOGS_STORAGE_KEY, JSON.stringify(logs));

      // 서버로 전송 (선택적)
      if (errorReport.severity === ErrorSeverity.HIGH || errorReport.severity === ErrorSeverity.CRITICAL) {
        await this.sendErrorToServer(errorReport);
      }
    } catch (loggingError) {
      errorLogger.error('에러 로깅 실패', loggingError instanceof Error ? loggingError : new Error(String(loggingError)), {
        component: 'ErrorHandlingService',
        action: 'logError',
      });
    }
  }

  /**
   * 서버로 에러 전송
   */
  private async sendErrorToServer(errorReport: ErrorReport): Promise<void> {
    try {
      await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_ERRORS_REPORT_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch {
      // 서버 전송 실패는 무시 (이미 에러 상황이므로)
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * 에러 통계
   */
  getErrorStatistics(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: ErrorReport[];
  } {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent: this.errorHistory.slice(-10)
    };

    // 타입별 통계
    Object.values(ErrorType).forEach(type => {
      stats.byType[type] = this.errorHistory.filter(e => e.type === type).length;
    });

    // 심각도별 통계
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = this.errorHistory.filter(e => e.severity === severity).length;
    });

    return stats;
  }

  /**
   * 에러 히스토리 클리어
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    localStorage.removeItem(ERROR_HANDLING_LOGS_STORAGE_KEY);
  }
}

// 싱글톤 인스턴스
export { ERROR_HANDLING_LOGS_STORAGE_KEY } from './errorHandlingStorageKeys';

export const errorHandlingService = new ErrorHandlingService();

// 전역 에러 핸들러 설정
window.addEventListener('error', (event) => {
  errorHandlingService.reportError(event.error, {
    component: 'global',
    action: 'unhandled_error'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandlingService.reportError(event.reason, {
    component: 'global',
    action: 'unhandled_promise_rejection'
  });
});

export default errorHandlingService;
