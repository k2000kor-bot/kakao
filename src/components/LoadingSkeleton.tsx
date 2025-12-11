/**
 * 로딩 스켈레톤 UI 컴포넌트
 * 콘텐츠 로딩 중 플레이스홀더 표시
 */

import React, { useMemo } from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'text' | 'card' | 'list' | 'chart' | 'table';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'text',
  lines = 3,
  width,
  height,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div 
            className={`skeleton skeleton-text ${className}`}
            role="status"
            aria-label="콘텐츠 로딩 중"
            aria-live="polite"
          >
            {Array.from({ length: lines }).map((_, idx) => (
              <div
                key={`skeleton-line-${idx}`}
                className="skeleton-line"
                style={{
                  width: idx === lines - 1 ? '60%' : '100%',
                  height: height || '16px',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div 
            className={`skeleton skeleton-card ${className}`} 
            style={{ width, height }}
            role="status"
            aria-label="카드 로딩 중"
            aria-live="polite"
          >
            <div className="skeleton-header" aria-hidden="true" />
            <div className="skeleton-body" aria-hidden="true">
              <div className="skeleton-line" style={{ width: '100%', height: '20px' }} />
              <div className="skeleton-line" style={{ width: '80%', height: '16px' }} />
              <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
            </div>
          </div>
        );

      case 'list':
        return (
          <ul 
            className={`skeleton skeleton-list ${className}`}
            role="status"
            aria-label="목록 로딩 중"
            aria-live="polite"
          >
            {Array.from({ length: lines }).map((_, idx) => (
              <li key={`skeleton-list-item-${idx}`} className="skeleton-list-item" aria-hidden="true">
                <div className="skeleton-avatar" />
                <div className="skeleton-content">
                  <div className="skeleton-line" style={{ width: '70%', height: '16px' }} />
                  <div className="skeleton-line" style={{ width: '50%', height: '14px' }} />
                </div>
              </li>
            ))}
          </ul>
        );

      case 'chart':
        const barHeights = useMemo(() => 
          Array.from({ length: 5 }).map(() => Math.random() * 60 + 20),
          []
        );
        return (
          <div 
            className={`skeleton skeleton-chart ${className}`} 
            style={{ width, height }}
            role="status"
            aria-label="차트 로딩 중"
            aria-live="polite"
          >
            <div className="skeleton-chart-bars" aria-hidden="true">
              {barHeights.map((height, idx) => (
                <div
                  key={`skeleton-chart-bar-${idx}`}
                  className="skeleton-chart-bar"
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'table':
        return (
          <div 
            className={`skeleton skeleton-table ${className}`} 
            style={{ width }}
            role="status"
            aria-label="테이블 로딩 중"
            aria-live="polite"
          >
            <div className="skeleton-table-header" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-header-${idx}`} className="skeleton-line" style={{ width: '100%', height: '20px' }} />
              ))}
            </div>
            <div className="skeleton-table-body" aria-hidden="true">
              {Array.from({ length: lines }).map((_, rowIdx) => (
                <div key={`skeleton-row-${rowIdx}`} className="skeleton-table-row">
                  {Array.from({ length: 4 }).map((_, colIdx) => (
                    <div
                      key={`skeleton-cell-${rowIdx}-${colIdx}`}
                      className="skeleton-line"
                      style={{ width: '100%', height: '16px' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div 
            className={`skeleton skeleton-default ${className}`} 
            style={{ width, height }}
            role="status"
            aria-label="콘텐츠 로딩 중"
            aria-live="polite"
          />
        );
    }
  };

  return <div className="skeleton-wrapper">{renderSkeleton()}</div>;
};

// 특정 용도의 스켈레톤 컴포넌트들
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <LoadingSkeleton type="text" lines={lines} />
);

export const CardSkeleton: React.FC<{ width?: string | number; height?: string | number }> = ({
  width,
  height,
}) => <LoadingSkeleton type="card" width={width} height={height} />;

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <LoadingSkeleton type="list" lines={items} />
);

export const ChartSkeleton: React.FC<{ width?: string | number; height?: string | number }> = ({
  width = '100%',
  height = '200px',
}) => <LoadingSkeleton type="chart" width={width} height={height} />;

export const TableSkeleton: React.FC<{ rows?: number; width?: string | number }> = ({
  rows = 5,
  width = '100%',
}) => <LoadingSkeleton type="table" lines={rows} width={width} />;

export default LoadingSkeleton;

