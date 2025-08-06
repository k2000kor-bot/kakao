// 에러 처리 유틸리티

export interface ErrorInfo {
    message: string;
    stack?: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    componentName?: string;
    action?: string;
    data?: any;
}

export interface ErrorReport {
    id: string;
    error: ErrorInfo;
    severity: 'low' | 'medium' | 'high' | 'critical';
    handled: boolean;
    retryCount: number;
}

// 에러 타입 정의
export enum ErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    RESOURCE_NOT_FOUND = 'resource_not_found',
    SERVER_ERROR = 'server_error',
    CLIENT_ERROR = 'client_error',
    TIMEOUT = 'timeout',
    CRITICAL = 'critical',
    UNKNOWN = 'unknown'
}

// 에러 심각도 정의
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// 에러 분류 함수
export function classifyError(error: Error | string): ErrorType {
    const message = typeof error === 'string' ? error : error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return ErrorType.NETWORK;
    }
    if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
        return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
        return ErrorType.AUTHORIZATION;
    }
    if (message.includes('not found') || message.includes('404')) {
        return ErrorType.RESOURCE_NOT_FOUND;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
        return ErrorType.TIMEOUT;
    }
    if (message.includes('500') || message.includes('server')) {
        return ErrorType.SERVER_ERROR;
    }

    return ErrorType.UNKNOWN;
}

// 에러 심각도 결정
export function determineSeverity(errorType: ErrorType, context?: any): ErrorSeverity {
    switch (errorType) {
        case ErrorType.CRITICAL:
        case ErrorType.AUTHENTICATION:
            return ErrorSeverity.CRITICAL;
        case ErrorType.AUTHORIZATION:
        case ErrorType.SERVER_ERROR:
            return ErrorSeverity.HIGH;
        case ErrorType.NETWORK:
        case ErrorType.TIMEOUT:
            return ErrorSeverity.MEDIUM;
        case ErrorType.VALIDATION:
        case ErrorType.RESOURCE_NOT_FOUND:
        case ErrorType.CLIENT_ERROR:
        default:
            return ErrorSeverity.LOW;
    }
}

// 에러 정보 생성
export function createErrorInfo(
    error: Error | string,
    context?: {
        componentName?: string;
        action?: string;
        data?: any;
        userId?: string;
        sessionId?: string;
    }
): ErrorInfo {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    return {
        message: errorMessage,
        stack,
        timestamp: new Date().toISOString(),
        userId: context?.userId,
        sessionId: context?.sessionId,
        componentName: context?.componentName,
        action: context?.action,
        data: context?.data
    };
}

// 에러 복구 전략
export interface RetryStrategy {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

export const defaultRetryStrategy: RetryStrategy = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
};

// 지수 백오프를 사용한 재시도 함수
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    strategy: RetryStrategy = defaultRetryStrategy
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === strategy.maxRetries) {
                throw lastError;
            }

            const delay = Math.min(
                strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attempt),
                strategy.maxDelay
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// 에러 로깅
export class ErrorLogger {
    private errors: ErrorReport[] = [];
    private maxErrors = 100;

    logError(
        error: Error | string,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context?: any
    ): string {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const errorInfo = createErrorInfo(error, context);
        const errorType = classifyError(error);

        const report: ErrorReport = {
            id: errorId,
            error: errorInfo,
            severity,
            handled: false,
            retryCount: 0
        };

        this.errors.push(report);

        // 최대 에러 수 제한
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // 콘솔에 로그 출력
        console.error(`[${severity.toUpperCase()}] ${errorInfo.message}`, {
            errorId,
            errorType,
            context,
            timestamp: errorInfo.timestamp
        });

        return errorId;
    }

    getErrors(): ErrorReport[] {
        return [...this.errors];
    }

    getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
        return this.errors.filter(error => error.severity === severity);
    }

    clearErrors(): void {
        this.errors = [];
    }

    markAsHandled(errorId: string): void {
        const error = this.errors.find(e => e.id === errorId);
        if (error) {
            error.handled = true;
        }
    }
}

// 글로벌 에러 로거 인스턴스
export const errorLogger = new ErrorLogger();

// 글로벌 에러 핸들러
export function setupGlobalErrorHandler(): void {
    // 처리되지 않은 Promise 에러
    window.addEventListener('unhandledrejection', (event) => {
        errorLogger.logError(
            event.reason,
            ErrorSeverity.HIGH,
            { type: 'unhandledrejection' }
        );
    });

    // 처리되지 않은 JavaScript 에러
    window.addEventListener('error', (event) => {
        errorLogger.logError(
            event.error || event.message,
            ErrorSeverity.HIGH,
            {
                type: 'error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }
        );
    });
}

// 사용자 친화적인 에러 메시지
export function getUserFriendlyMessage(errorType: ErrorType): string {
    switch (errorType) {
        case ErrorType.NETWORK:
            return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
        case ErrorType.VALIDATION:
            return '입력한 정보를 확인해주세요.';
        case ErrorType.AUTHENTICATION:
            return '로그인이 필요합니다. 다시 로그인해주세요.';
        case ErrorType.AUTHORIZATION:
            return '이 작업을 수행할 권한이 없습니다.';
        case ErrorType.RESOURCE_NOT_FOUND:
            return '요청한 정보를 찾을 수 없습니다.';
        case ErrorType.SERVER_ERROR:
            return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        case ErrorType.TIMEOUT:
            return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        default:
            return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
    }
}

// 에러 복구 가능성 확인
export function isRecoverableError(errorType: ErrorType): boolean {
    return [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.SERVER_ERROR
    ].includes(errorType);
} 