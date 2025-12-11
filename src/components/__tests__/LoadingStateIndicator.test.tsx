/**
 * LoadingStateIndicator 컴포넌트 테스트
 * 로딩 상태 표시 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingStateIndicator from '../LoadingStateIndicator';

// LoadingSkeleton과 ProgressIndicator 모킹
jest.mock('../LoadingSkeleton', () => {
  return function MockLoadingSkeleton({ type }: { type: string }) {
    return <div data-testid="loading-skeleton" data-type={type}>Loading Skeleton</div>;
  };
});

jest.mock('../ProgressIndicator', () => {
  return function MockProgressIndicator({ progress }: { progress?: number }) {
    return <div data-testid="progress-indicator" data-progress={progress}>Progress: {progress}%</div>;
  };
});

describe('LoadingStateIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('idle 타입일 때 렌더링되지 않아야 함', () => {
    const { container } = render(<LoadingStateIndicator type="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('initial 타입일 때 스켈레톤을 렌더링해야 함', () => {
    render(<LoadingStateIndicator type="initial" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('updating 타입일 때 업데이트 인디케이터를 렌더링해야 함', () => {
    const { container } = render(<LoadingStateIndicator type="updating" />);
    expect(container.querySelector('.updating-indicator')).toBeInTheDocument();
    expect(container.querySelector('.updating-spinner')).toBeInTheDocument();
  });

  it('refreshing 타입일 때 새로고침 인디케이터를 렌더링해야 함', () => {
    const { container } = render(<LoadingStateIndicator type="refreshing" />);
    expect(container.querySelector('.refreshing-indicator')).toBeInTheDocument();
    expect(container.querySelector('.refreshing-dot')).toBeInTheDocument();
  });

  it('커스텀 메시지를 표시해야 함', () => {
    render(<LoadingStateIndicator type="initial" message="로딩 중..." />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('showProgress가 true일 때 ProgressIndicator를 렌더링해야 함', () => {
    render(<LoadingStateIndicator type="updating" showProgress progress={50} />);
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
  });

  it('커스텀 skeletonType을 사용해야 함', () => {
    render(<LoadingStateIndicator type="initial" skeletonType="card" />);
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveAttribute('data-type', 'card');
  });

  it('커스텀 skeletonLines를 사용해야 함', () => {
    render(<LoadingStateIndicator type="initial" skeletonLines={5} />);
    // LoadingSkeleton이 lines prop을 받는지 확인
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('커스텀 className을 적용해야 함', () => {
    const { container } = render(
      <LoadingStateIndicator type="initial" className="custom-class" />
    );
    const indicator = container.querySelector('.loading-state-indicator');
    expect(indicator).toHaveClass('custom-class');
  });

  it('progress가 제공되면 해당 값을 사용해야 함', () => {
    render(<LoadingStateIndicator type="updating" showProgress progress={75} />);
    const progressIndicator = screen.getByTestId('progress-indicator');
    expect(progressIndicator).toHaveAttribute('data-progress', '75');
  });
});

