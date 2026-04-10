/**
 * 로딩 상태 표시 컴포넌트
 * 로딩 타입에 따라 다른 UI를 표시
 */

import React, { useState, useEffect, useMemo } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import ProgressIndicator from './ProgressIndicator';
import { LoadingType } from '../hooks/useLoadingState';
import './LoadingStateIndicator.css';

interface LoadingStateIndicatorProps {
  type: LoadingType;
  message?: string;
  skeletonType?: 'text' | 'card' | 'list' | 'chart' | 'table';
  skeletonLines?: number;
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const LoadingStateIndicator: React.FC<LoadingStateIndicatorProps> = ({
  type,
  message,
  skeletonType = 'text',
  skeletonLines = 3,
  showSpinner = false,
  showProgress = false,
  progress,
  className = '',
}) => {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // 진행률 시뮬레이션 (progress가 제공되지 않은 경우)
  useEffect(() => {
    if (showProgress && progress === undefined && type !== 'idle') {
      const interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 90) return prev; // 90%에서 멈춤
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => {
        if (typeof globalThis !== 'undefined' && 'clearInterval' in globalThis) {
          globalThis.clearInterval(interval);
        }
      };
    } else if (progress !== undefined) {
      setSimulatedProgress(progress);
    }
  }, [showProgress, progress, type]);

  const currentProgress = useMemo(() => 
    progress !== undefined ? progress : simulatedProgress,
    [progress, simulatedProgress]
  );

  if (type === 'idle') {
    return null;
  }

  // 초기 로딩: 전체 스켈레톤 UI
  if (type === 'initial') {
    return (
      <div 
        className={`loading-state-indicator loading-initial ${className}`}
        role="status"
        aria-live="polite"
        aria-label={message || '로딩 중'}
        data-testid="loading-state-initial"
      >
        {showSpinner && (
          <div className="loading-spinner" aria-hidden="true">
            <div className="spinner"></div>
          </div>
        )}
        {showProgress && (
          <ProgressIndicator
            progress={currentProgress}
            label={message}
            size="medium"
            variant="primary"
            showDetails={true}
          />
        )}
        {!showProgress && (
          <>
            <LoadingSkeleton type={skeletonType} lines={skeletonLines} />
            {message && (
              <div className="loading-message" role="status">{message}</div>
            )}
          </>
        )}
      </div>
    );
  }

  // 업데이트 로딩: 상단 인디케이터
  if (type === 'updating') {
    return (
      <div 
        className={`loading-state-indicator loading-updating ${className}`}
        role="status"
        aria-live="polite"
        aria-label={message || '업데이트 중'}
        data-testid="loading-state-updating"
      >
        {showProgress ? (
          <ProgressIndicator
            progress={currentProgress}
            label={message || '업데이트 중...'}
            size="small"
            variant="primary"
            showDetails={true}
          />
        ) : (
          <div className="updating-indicator">
            <div className="updating-spinner" aria-hidden="true"></div>
            <span className="updating-text">{message || '업데이트 중...'}</span>
          </div>
        )}
      </div>
    );
  }

  // 새로고침 로딩: 미묘한 인디케이터
  if (type === 'refreshing') {
    return (
      <div 
        className={`loading-state-indicator loading-refreshing ${className}`}
        role="status"
        aria-live="polite"
        aria-label={message || '새로고침 중'}
        data-testid="loading-state-refreshing"
      >
        <div className="refreshing-indicator">
          <div className="refreshing-dot" aria-hidden="true"></div>
          <span className="refreshing-text">{message || '새로고침 중...'}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingStateIndicator;

