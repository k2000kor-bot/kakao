/**
 * ErrorRecovery 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ErrorRecovery from '../ErrorRecovery';

// NetworkMonitor 및 retryWithNetworkCheck 모킹
const mockGetOnlineStatus = jest.fn(() => true);
const mockSubscribe = jest.fn(() => jest.fn());
const mockNetworkMonitorInstance = {
  getOnlineStatus: mockGetOnlineStatus,
  subscribe: mockSubscribe,
};

// retryWithNetworkCheck 모킹 함수를 외부에서 정의
const mockRetryWithNetworkCheck = jest.fn(async (fn: () => Promise<any>) => {
  try {
    const result = await fn();
    return { success: true as const, data: result, attempts: 1 };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts: 1,
    };
  }
});

jest.mock('../../utils/retryHandler', () => {
  const actualModule = jest.requireActual('../../utils/retryHandler');
  
  return {
    ...actualModule,
    NetworkMonitor: class {
      static getInstance() {
        return mockNetworkMonitorInstance;
      }
    },
    retryWithNetworkCheck: (...args: any[]) => mockRetryWithNetworkCheck(...args),
  };
});

describe('ErrorRecovery', () => {
  const mockOnRetry = jest.fn().mockResolvedValue(undefined);
  const mockOnRecoverySuccess = jest.fn();
  const mockOnRecoveryFailure = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOnlineStatus.mockReturnValue(true);
    mockSubscribe.mockReturnValue(jest.fn());
    mockRetryWithNetworkCheck.mockImplementation(async (fn: () => Promise<any>) => {
      try {
        const result = await fn();
        return { success: true as const, data: result, attempts: 1 };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error : new Error(String(error)),
          attempts: 1,
        };
      }
    });
  });

  it('에러 메시지를 표시해야 함', () => {
    const error = new Error('테스트 에러');
    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
  });

  it('네트워크 오류 메시지를 표시해야 함', () => {
    const error = new Error('Failed to fetch');
    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText(/서버에 연결할 수 없습니다/)).toBeInTheDocument();
  });

  it('다시 시도 버튼이 있어야 함', () => {
    const error = new Error('테스트 에러');
    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
  });

  it('페이지 새로고침 버튼이 있어야 함', () => {
    const error = new Error('테스트 에러');
    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByRole('button', { name: /페이지 새로고침/ })).toBeInTheDocument();
  });

  it('다시 시도 버튼 클릭 시 onRetry가 호출되어야 함', async () => {
    const error = new Error('테스트 에러');
    mockOnRetry.mockResolvedValue(undefined);

    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
        onRecoverySuccess={mockOnRecoverySuccess}
      />
    );

    const retryButton = screen.getByRole('button', { name: /다시 시도/ });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  it('자동 재시도가 활성화되면 자동으로 재시도해야 함', async () => {
    const error = new Error('테스트 에러');
    mockOnRetry.mockResolvedValue(undefined);

    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
        autoRetry={true}
        maxAutoRetries={3}
        onRecoverySuccess={mockOnRecoverySuccess}
      />
    );

    // 자동 재시도는 useEffect에서 실행되므로 시간이 필요
    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('복구 성공 시 onRecoverySuccess가 호출되어야 함', async () => {
    const error = new Error('테스트 에러');
    mockOnRetry.mockResolvedValue(undefined);

    render(
      <ErrorRecovery
        error={error}
        onRetry={mockOnRetry}
        onRecoverySuccess={mockOnRecoverySuccess}
      />
    );

    const retryButton = screen.getByRole('button', { name: /다시 시도/ });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockOnRecoverySuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
