/**
 * ErrorBoundary 컴포넌트 테스트
 * 에러 바운더리의 정상 작동 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { errorLogger } from '../../utils/errorLogger';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// errorReportingService 모킹
jest.mock('../../services/errorReportingService', () => ({
  __esModule: true,
  default: {
    reportError: jest.fn(),
    reportWarning: jest.fn(),
    reportInfo: jest.fn(),
  },
}));

// 에러를 발생시키는 테스트 컴포넌트
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // React의 에러 로깅 억제
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('에러가 없을 때 자식 컴포넌트를 렌더링해야 함', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('에러가 발생했을 때 에러 UI를 표시해야 함', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // h2 태그의 "오류가 발생했습니다" 텍스트를 찾음
    expect(screen.getByRole('heading', { name: /오류가 발생했습니다/i })).toBeInTheDocument();
  });

  it('에러 발생 시 errorLogger를 호출해야 함', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(errorLogger.error).toHaveBeenCalled();
  });

  it('onError 콜백이 제공되면 호출해야 함', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('새로고침 버튼이 있어야 함', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // "페이지 새로고침" 버튼을 찾음 (더 구체적인 텍스트)
    const refreshButton = screen.getByText(/페이지 새로고침/i);
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton.tagName).toBe('BUTTON');
  });
});

