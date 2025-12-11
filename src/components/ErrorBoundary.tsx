/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하고 처리
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import errorReportingService from '../services/errorReportingService';
import { errorLogger } from '../utils/errorLogger';
import { getUserFriendlyError, getErrorIcon } from '../utils/errorMessages';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.error('ErrorBoundary caught an error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅 (선택적)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 로깅 및 리포팅
    this.logErrorToService(error, errorInfo);
    errorReportingService.reportError(error, {
      componentStack: errorInfo.componentStack || undefined,
      severity: 'high',
      additionalContext: {
        errorBoundary: true,
        errorName: error.name,
      },
    });
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 실제 환경에서는 에러 리포팅 서비스로 전송
    // 예: Sentry, LogRocket, 등
    // 이 메서드는 이제 errorReportingService를 사용하므로 더 이상 필요 없음
    // 하지만 하위 호환성을 위해 유지
    try {
      // 로컬 스토리지에 저장 (개발용)
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };
      const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errors.push(errorData);
      if (errors.length > 50) {
        errors.shift(); // 최대 50개만 유지
      }
      localStorage.setItem('errorLog', JSON.stringify(errors));
    } catch (e) {
      errorLogger.error('Failed to log error', e);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
      (globalThis as unknown as Window).location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      const errorInfo = this.state.error 
        ? getUserFriendlyError(this.state.error)
        : {
            type: 'unknown' as const,
            message: '알 수 없는 오류',
            userMessage: '예상치 못한 오류가 발생했습니다.',
            canRetry: true,
            suggestions: [
              '페이지를 새로고침해주세요.',
              '브라우저 캐시를 지우고 다시 시도해주세요.',
              '문제가 계속되면 고객 지원팀에 문의해주세요.',
            ],
          };

      return (
        <div 
          className="error-boundary"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="error-boundary-content">
            <div className="error-icon" aria-hidden="true">{getErrorIcon(errorInfo.type)}</div>
            <h2>오류가 발생했습니다</h2>
            <output className="error-message" role="status">
              {errorInfo.userMessage}
            </output>
            
            {errorInfo.suggestions.length > 0 && (
              <section className="error-suggestions" aria-labelledby="suggestions-heading">
                <h3 id="suggestions-heading">해결 방법:</h3>
                <ul>
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={`suggestion-${index}-${suggestion.substring(0, 10)}`}>{suggestion}</li>
                  ))}
                </ul>
              </section>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details" aria-label="에러 상세 정보">
                <summary>에러 상세 정보 (개발 모드)</summary>
                <section className="error-stack" aria-label="에러 스택 정보">
                  <h4>에러 메시지:</h4>
                  <pre aria-label="에러 메시지">{this.state.error.toString()}</pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4>스택 트레이스:</h4>
                      <pre aria-label="스택 트레이스">{this.state.error.stack}</pre>
                    </>
                  )}

                  {this.state.errorInfo && (
                    <>
                      <h4>컴포넌트 스택:</h4>
                      <pre aria-label="컴포넌트 스택">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </section>
              </details>
            )}

            <div className="error-actions" role="group" aria-label="에러 복구 액션">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReset}
                type="button"
                aria-label="에러 상태 초기화 및 다시 시도"
              >
                <span aria-hidden="true">🔄</span> 다시 시도
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={this.handleReload}
                type="button"
                aria-label="페이지 새로고침"
              >
                <span aria-hidden="true">🔃</span> 페이지 새로고침
              </button>
            </div>

            <div className="error-help" role="region" aria-labelledby="help-heading">
              <p id="help-heading">문제가 계속되면 다음을 시도해보세요:</p>
              <ul>
                <li>브라우저 캐시를 지우고 다시 시도</li>
                <li>다른 브라우저에서 시도</li>
                <li>시스템 관리자에게 문의</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

