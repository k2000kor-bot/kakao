/**
 * 에러 복구 컴포넌트
 * 에러 발생 시 사용자에게 복구 옵션 제공
 */

import React, { useState, useEffect } from 'react';
import { retryWithNetworkCheck, NetworkMonitor } from '../utils/retryHandler';
import errorReportingService from '../services/errorReportingService';
import './ErrorRecovery.css';

export interface ErrorRecoveryProps {
  /**
   * 에러 객체
   */
  error: Error;
  
  /**
   * 재시도할 함수
   */
  onRetry: () => Promise<unknown>;
  
  /**
   * 에러 컨텍스트
   */
  context?: {
    component?: string;
    action?: string;
    userId?: string;
  };
  
  /**
   * 복구 성공 콜백
   */
  onRecoverySuccess?: () => void;
  
  /**
   * 복구 실패 콜백
   */
  onRecoveryFailure?: () => void;
  
  /**
   * 자동 재시도 활성화
   */
  autoRetry?: boolean;
  
  /**
   * 자동 재시도 최대 횟수
   */
  maxAutoRetries?: number;
}

const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  context,
  onRecoverySuccess,
  onRecoveryFailure,
  autoRetry = false,
  maxAutoRetries = 3,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [recoveryMessage, setRecoveryMessage] = useState<string>('');

  // 네트워크 상태 모니터링
  useEffect(() => {
    const monitor = NetworkMonitor.getInstance();
    setIsOnline(monitor.getOnlineStatus());

    const unsubscribe = monitor.subscribe((online) => {
      setIsOnline(online);
      if (online && autoRetry && retryCount < maxAutoRetries) {
        handleRetry();
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRetry, retryCount, maxAutoRetries]);

  // 자동 재시도
  useEffect(() => {
    if (autoRetry && retryCount < maxAutoRetries && isOnline) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 2000 * (retryCount + 1)); // 지수적 지연

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRetry, retryCount, maxAutoRetries, isOnline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRecoveryMessage('재시도 중...');

    try {
      const result = await retryWithNetworkCheck(
        async () => {
          await onRetry();
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            setRecoveryMessage(`${attempt}번째 재시도 중...`);
            const err = error instanceof Error ? error : new Error(String(error));
            errorReportingService.reportError(err, {
              severity: 'medium',
              additionalContext: {
                ...context,
                retryAttempt: attempt,
                autoRetry: autoRetry,
              },
            });
          },
          onFailure: (error, attempts) => {
            setRecoveryMessage(`재시도 실패 (${attempts}회 시도)`);
            const err = error instanceof Error ? error : new Error(String(error));
            errorReportingService.reportError(err, {
              severity: 'high',
              additionalContext: {
                ...context,
                totalAttempts: attempts,
                autoRetry: autoRetry,
              },
            });
          },
        }
      );

      if (result.success) {
        setRecoveryMessage('복구 성공!');
        setRetryCount(0);
        if (onRecoverySuccess) {
          onRecoverySuccess();
        }
      } else {
        setRetryCount((prev) => prev + 1);
        if (retryCount >= maxAutoRetries - 1 && onRecoveryFailure) {
          onRecoveryFailure();
        }
      }
    } catch (error) {
      setRetryCount((prev) => prev + 1);
      setRecoveryMessage('재시도 중 오류 발생');
      if (onRecoveryFailure) {
        onRecoveryFailure();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    handleRetry();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getErrorMessage = (): string => {
    if (!isOnline) {
      return '인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.';
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
    }

    if (error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    return error.message || '오류가 발생했습니다.';
  };

  return (
    <div className="error-recovery" role="alert" aria-live="assertive" data-testid="error-recovery">
      <div className="error-recovery-content">
        <div className="error-recovery-icon">⚠️</div>
        <h3 className="error-recovery-title">오류가 발생했습니다</h3>
        <p className="error-recovery-message">{getErrorMessage()}</p>

        {recoveryMessage && (
          <div className={`error-recovery-status ${isRetrying ? 'retrying' : ''}`}>
            {recoveryMessage}
          </div>
        )}

        {!isOnline && (
          <div className="error-recovery-offline">
            <p>오프라인 상태입니다. 인터넷 연결을 확인해주세요.</p>
          </div>
        )}

        <div className="error-recovery-actions" role="group" aria-label="오류 복구 액션">
          {!isRetrying && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleManualRetry}
                disabled={!isOnline}
                aria-label="다시 시도"
              >
                🔄 다시 시도
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReload}
                aria-label="페이지 새로고침"
              >
                🔃 페이지 새로고침
              </button>
            </>
          )}

          {isRetrying && (
            <div className="error-recovery-spinner" role="status" aria-label="재시도 중">
              <div className="spinner" aria-hidden="true"></div>
              <span>재시도 중...</span>
            </div>
          )}
        </div>

        {autoRetry && retryCount > 0 && (
          <div className="error-recovery-auto-retry">
            <p>자동 재시도: {retryCount}/{maxAutoRetries}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorRecovery;

