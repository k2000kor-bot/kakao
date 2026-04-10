/**
 * 진행률 표시 컴포넌트
 * 작업 진행 상황을 시각적으로 표시
 */

import React, { useMemo } from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  /**
   * 진행률 (0-100)
   */
  progress: number;
  
  /**
   * 진행률 표시 텍스트
   */
  label?: string;
  
  /**
   * 크기 (small, medium, large)
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 색상 테마
   */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  
  /**
   * 애니메이션 활성화
   */
  animated?: boolean;
  
  /**
   * 상세 정보 표시
   */
  showDetails?: boolean;
  
  /**
   * 추가 정보
   */
  details?: string;
  
  /**
   * 클래스명
   */
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label,
  size = 'medium',
  variant = 'primary',
  animated = true,
  showDetails = false,
  details,
  className = '',
}) => {
  const clampedProgress = useMemo(() => Math.max(0, Math.min(100, progress)), [progress]);
  
  const sizeClasses = useMemo(() => ({
    small: 'progress-indicator-small',
    medium: 'progress-indicator-medium',
    large: 'progress-indicator-large',
  }), []);
  
  const variantClasses = useMemo(() => ({
    primary: 'progress-indicator-primary',
    success: 'progress-indicator-success',
    warning: 'progress-indicator-warning',
    danger: 'progress-indicator-danger',
  }), []);

  const progressLabel = useMemo(() => 
    label || '진행률',
    [label]
  );

  return (
    <div 
      className={`progress-indicator ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="region"
      aria-label={progressLabel}
      data-testid="progress-indicator"
    >
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showDetails && (
            <span className="progress-percentage" aria-label={`${Math.round(clampedProgress)}퍼센트`}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div className="progress-bar-container">
        <div
          className={`progress-bar ${animated ? 'progress-bar-animated' : ''}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
          aria-valuetext={`${Math.round(clampedProgress)}%`}
        />
      </div>
      
      {details && showDetails && (
        <div className="progress-details" role="status" aria-live="polite">{details}</div>
      )}
    </div>
  );
};

export default ProgressIndicator;

