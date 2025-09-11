/**
 * 고급 에러 핸들링 유틸리티
 * 시스템 전반의 에러를 안전하게 처리하고 사용자에게 적절한 피드백 제공
 */

import React from 'react';

export interface ErrorInfo {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
    context?: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorResponse {
    success: false;
    error: ErrorInfo;
    suggestions?: string[];
    retryable: boolean;
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: ErrorInfo[] = [];
    private maxLogSize = 100;

    private constructor() { }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * 에러를 분류하고 적절한 응답 생성
     */
    public handleError(error: unknown, context?: Record<string, unknown>): ErrorResponse {
        const errorInfo = this.classifyError(error, context);
        this.logError(errorInfo);

        return {
            success: false,
            error: errorInfo,
            suggestions: this.generateSuggestions(errorInfo),
            retryable: this.isRetryable(errorInfo)
        };
    }

    /**
     * 에러 분류
     */
    private classifyError(error: unknown, context?: Record<string, unknown>): ErrorInfo {
        const timestamp = new Date().toISOString();

        if (error instanceof Error) {
            // 네트워크 에러
            if (error.message.includes('fetch') || error.message.includes('network')) {
                return {
                    code: 'NETWORK_ERROR',
                    message: '네트워크 연결에 문제가 있습니다.',
                    details: error.message,
                    timestamp,
                    context,
                    severity: 'high'
                };
            }

            // API 에러
            if (error.message.includes('API') || error.message.includes('server')) {
                return {
                    code: 'API_ERROR',
                    message: '서버와의 통신에 문제가 있습니다.',
                    details: error.message,
                    timestamp,
                    context,
                    severity: 'high'
                };
            }

            // 인증 에러
            if (error.message.includes('auth') || error.message.includes('unauthorized')) {
                return {
                    code: 'AUTH_ERROR',
                    message: '인증에 문제가 있습니다.',
                    details: error.message,
                    timestamp,
                    context,
                    severity: 'critical'
                };
            }

            // 일반 에러
            return {
                code: 'GENERAL_ERROR',
                message: '예상치 못한 오류가 발생했습니다.',
                details: error.message,
                timestamp,
                context,
                severity: 'medium'
            };
        }

        // 알 수 없는 에러
        return {
            code: 'UNKNOWN_ERROR',
            message: '알 수 없는 오류가 발생했습니다.',
            details: String(error),
            timestamp,
            context,
            severity: 'medium'
        };
    }

    /**
     * 에러 로깅
     */
    private logError(errorInfo: ErrorInfo): void {
        this.errorLog.push(errorInfo);

        // 로그 크기 제한
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }

        // 콘솔 로깅
        console.error('Error occurred:', errorInfo);

        // 심각한 에러는 추가 로깅
        if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
            console.error('Critical/High severity error:', errorInfo);
        }
    }

    /**
     * 사용자 제안 생성
     */
    private generateSuggestions(errorInfo: ErrorInfo): string[] {
        const suggestions: string[] = [];

        switch (errorInfo.code) {
            case 'NETWORK_ERROR':
                suggestions.push('인터넷 연결을 확인해주세요.');
                suggestions.push('잠시 후 다시 시도해주세요.');
                break;

            case 'API_ERROR':
                suggestions.push('서버 상태를 확인해주세요.');
                suggestions.push('잠시 후 다시 시도해주세요.');
                break;

            case 'AUTH_ERROR':
                suggestions.push('로그인 상태를 확인해주세요.');
                suggestions.push('페이지를 새로고침해주세요.');
                break;

            case 'GENERAL_ERROR':
                suggestions.push('잠시 후 다시 시도해주세요.');
                suggestions.push('문제가 지속되면 관리자에게 문의해주세요.');
                break;

            default:
                suggestions.push('잠시 후 다시 시도해주세요.');
        }

        return suggestions;
    }

    /**
     * 재시도 가능 여부 판단
     */
    private isRetryable(errorInfo: ErrorInfo): boolean {
        const retryableCodes = ['NETWORK_ERROR', 'API_ERROR', 'GENERAL_ERROR'];
        return retryableCodes.includes(errorInfo.code);
    }

    /**
     * 에러 로그 조회
     */
    public getErrorLog(): ErrorInfo[] {
        return [...this.errorLog];
    }

    /**
     * 에러 로그 초기화
     */
    public clearErrorLog(): void {
        this.errorLog = [];
    }

    /**
     * 안전한 API 호출 래퍼
     */
    public async safeApiCall<T>(
        apiCall: () => Promise<T>,
        context?: Record<string, unknown>
    ): Promise<{ success: true; data: T } | ErrorResponse> {
        try {
            const data = await apiCall();
            return { success: true, data };
        } catch (error) {
            return this.handleError(error, context);
        }
    }

    /**
     * 안전한 함수 실행 래퍼
     */
    public safeExecute<T>(
        fn: () => T,
        context?: Record<string, unknown>
    ): { success: true; data: T } | ErrorResponse {
        try {
            const data = fn();
            return { success: true, data };
        } catch (error) {
            return this.handleError(error, context);
        }
    }
}

// 전역 에러 핸들러 인스턴스
export const errorHandler = ErrorHandler.getInstance();

// 전역 에러 핸들러 설정
export const setupGlobalErrorHandling = (): void => {
    // 처리되지 않은 Promise 거부 에러
    window.addEventListener('unhandledrejection', (event) => {
        const errorResponse = errorHandler.handleError(event.reason, {
            type: 'unhandledrejection',
            url: window.location.href
        });

        console.error('Unhandled promise rejection:', errorResponse);

        // 심각한 에러는 사용자에게 알림
        if (errorResponse.error.severity === 'critical') {
            alert(`심각한 오류가 발생했습니다: ${errorResponse.error.message}`);
        }
    });

    // 일반적인 JavaScript 에러
    window.addEventListener('error', (event) => {
        const errorResponse = errorHandler.handleError(event.error, {
            type: 'javascript_error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.href
        });

        console.error('JavaScript error:', errorResponse);
    });
};

// React 컴포넌트용 에러 바운더리
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ComponentType<{ error: ErrorInfo }> },
    { hasError: boolean; error?: ErrorInfo }
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: ErrorInfo }> }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): { hasError: boolean; error: ErrorInfo } {
        const errorInfo = errorHandler.handleError(error, { type: 'react_error_boundary' }).error;
        return { hasError: true, error: errorInfo };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        errorHandler.handleError(error, {
            type: 'react_component_error',
            componentStack: errorInfo.componentStack
        });
    }

    render() {
        if (this.state.hasError && this.state.error) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return <FallbackComponent error={this.state.error} />;
        }

        return this.props.children;
    }
}

// 기본 에러 폴백 컴포넌트
const DefaultErrorFallback: React.FC<{ error: ErrorInfo }> = ({ error }) => (
    <div style= {{
        padding: '20px',
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
        margin: '20px'
  }}>
    <h3 style={ { color: '#ff6b6b', marginBottom: '10px' } }>
        오류가 발생했습니다
            </h3>
            < p style = {{ marginBottom: '10px' }}> { error.message } </p>
                < button
onClick = {() => window.location.reload()}
style = {{
    padding: '8px 16px',
        backgroundColor: '#ff6b6b',
            color: 'white',
                border: 'none',
                    borderRadius: '4px',
                        cursor: 'pointer'
}}
    >
    페이지 새로고침
        </button>
        </div>
);

export default errorHandler;