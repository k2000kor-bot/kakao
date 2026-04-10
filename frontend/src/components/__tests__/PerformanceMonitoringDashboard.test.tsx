/**
 * PerformanceMonitoringDashboard 컴포넌트 테스트
 * 성능 모니터링 대시보드 기능 확인
 */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PerformanceMonitoringDashboard from '../PerformanceMonitoringDashboard';
import advancedAPIService from '../../services/advancedAPIService';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import type { UseLoadingStateReturn } from '../../hooks/useLoadingState';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock CSS
jest.mock('../PerformanceMonitoringDashboard.css', () => ({}));

// Mock hooks
interface MockWebSocketReturn {
  isConnected: boolean;
  socket: WebSocket | null;
  sendMessage: jest.Mock;
  disconnect: jest.Mock;
  reconnect: jest.Mock;
}

const mockUseWebSocket = jest.fn((_options?: unknown): MockWebSocketReturn => ({
  isConnected: true,
  socket: null,
  sendMessage: jest.fn(),
  disconnect: jest.fn(),
  reconnect: jest.fn(),
}));

jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: (options?: unknown) => mockUseWebSocket(options),
}));

const mockUseLoadingState = jest.fn((): UseLoadingStateReturn => ({
  loadingState: { type: 'idle' as const },
  startRefreshing: jest.fn(),
  stopLoading: jest.fn(),
  startInitialLoading: jest.fn(),
  startUpdating: jest.fn(),
  isLoading: false,
  isInitialLoading: false,
  isUpdating: false,
  isRefreshing: false,
}));

jest.mock('../../hooks/useLoadingState', () => ({
  useLoadingState: () => mockUseLoadingState(),
}));

// Mock child components
jest.mock('../PredictionChart', () => {
  return function MockPredictionChart({ data, title }: { data?: unknown; title?: React.ReactNode }) {
    return (
      <div data-testid="prediction-chart">
        {title && <h3>{title}</h3>}
        <div>Chart Data: {JSON.stringify(data)}</div>
      </div>
    );
  };
});

jest.mock('../LoadingSkeleton', () => ({
  __esModule: true,
  default: function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading...</div>;
  },
  CardSkeleton: function MockCardSkeleton() {
    return <div data-testid="card-skeleton">Card Loading...</div>;
  },
}));

jest.mock('../LoadingStateIndicator', () => {
  return function MockLoadingStateIndicator({ type, message }: { type?: string; message?: string }) {
    if (type === 'idle') return null;
    return (
      <div data-testid="loading-state-indicator">
        {message || 'Loading...'}
      </div>
    );
  };
});

// Mock advancedAPIService
jest.mock('../../services/advancedAPIService', () => ({
  __esModule: true,
  default: {
    predictSystemPerformance: jest.fn(),
    getPredictionSummary: jest.fn(),
  },
}));

// Mock fetch
installJestFetchMock();

describe('PerformanceMonitoringDashboard', () => {
  const mockAdvancedAPIService = jest.mocked(advancedAPIService);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
    mockUseWebSocket.mockReturnValue({
      isConnected: true,
      socket: null,
      sendMessage: jest.fn(),
      disconnect: jest.fn(),
      reconnect: jest.fn(),
    });
    mockUseLoadingState.mockReturnValue({
      loadingState: { type: 'idle' },
      startRefreshing: jest.fn(),
      stopLoading: jest.fn(),
      startInitialLoading: jest.fn(),
      startUpdating: jest.fn(),
      isLoading: false,
      isInitialLoading: false,
      isUpdating: false,
      isRefreshing: false,
    });
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      render(<PerformanceMonitoringDashboard />);
      expect(screen.getByText('성능 모니터링 대시보드')).toBeInTheDocument();
    });

    it('자동 갱신 토글이 표시되어야 함', () => {
      render(<PerformanceMonitoringDashboard />);
      expect(screen.getByText(/자동 갱신/)).toBeInTheDocument();
    });

    it('새로고침 버튼이 표시되어야 함', () => {
      render(<PerformanceMonitoringDashboard />);
      expect(screen.getByText('🔄 새로고침')).toBeInTheDocument();
    });

    it('연결 상태가 표시되어야 함', () => {
      render(<PerformanceMonitoringDashboard />);
      expect(screen.getByText(/실시간 연결|연결 끊김/)).toBeInTheDocument();
    });
  });

  describe('메트릭 표시', () => {
    it('메트릭이 없을 때 로딩 스켈레톤이 표시되어야 함', () => {
      mockUseLoadingState.mockReturnValueOnce({
        loadingState: { type: 'initial' },
        startRefreshing: jest.fn(),
        stopLoading: jest.fn(),
        startInitialLoading: jest.fn(),
        startUpdating: jest.fn(),
        isLoading: true,
        isInitialLoading: true,
        isUpdating: false,
        isRefreshing: false,
      });

      render(<PerformanceMonitoringDashboard />);
      expect(screen.getAllByTestId('card-skeleton').length).toBeGreaterThan(0);
    });

    it('메트릭이 있을 때 메트릭 카드가 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        expect(screen.getByText('CPU 사용률')).toBeInTheDocument();
      });
    });

    it('CPU 사용률이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument();
      });
    });

    it('메모리 사용률이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        expect(screen.getByText('메모리 사용률')).toBeInTheDocument();
        expect(screen.getByText('60.0%')).toBeInTheDocument();
      });
    });

    it('디스크 사용률이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        expect(screen.getByText('디스크 사용률')).toBeInTheDocument();
        expect(screen.getByText('40.0%')).toBeInTheDocument();
      });
    });
  });

  describe('메트릭 상태 표시', () => {
    it('정상 상태 메트릭이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5, // 50%
              memory_usage: 0.5,
              disk_usage: 0.5,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        const statusTexts = screen.getAllByText('정상');
        expect(statusTexts.length).toBeGreaterThan(0);
      });
    });

    it('경고 상태 메트릭이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.75, // 75% (경고)
              memory_usage: 0.5,
              disk_usage: 0.5,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        const warningTexts = screen.getAllByText('경고');
        expect(warningTexts.length).toBeGreaterThan(0);
      });
    });

    it('위험 상태 메트릭이 올바르게 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.9, // 90% (위험)
              memory_usage: 0.5,
              disk_usage: 0.5,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        const dangerTexts = screen.getAllByText('위험');
        expect(dangerTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('자동 갱신', () => {
    it('자동 갱신 토글이 작동해야 함', () => {
      render(<PerformanceMonitoringDashboard />);

      const toggle = screen.getByLabelText(/자동 갱신/);
      expect(toggle).toBeChecked();

      fireEvent.click(toggle);
      expect(toggle).not.toBeChecked();
    });

    it('자동 갱신이 꺼져있을 때 새로고침 버튼이 작동해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      const toggle = screen.getByLabelText(/자동 갱신/);
      fireEvent.click(toggle);

      const refreshButton = screen.getByText('🔄 새로고침');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('새로고침', () => {
    it('새로고침 버튼 클릭 시 메트릭이 다시 로드되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard />);

      const refreshButton = screen.getByText('🔄 새로고침');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('예측 기능', () => {
    beforeEach(() => {
      mockAdvancedAPIService.predictSystemPerformance.mockResolvedValue({
        status: 'success',
        performance_prediction: {
          current_metrics: {
            cpu_usage: 50,
            memory_usage: 60,
            disk_usage: 40,
          },
          predicted_metrics: {
            cpu_usage: 55,
            memory_usage: 65,
            response_time_ms: 120,
            throughput: 1000,
          },
          trends: {
            cpu_trend: 'stable',
            memory_trend: 'increasing',
            load_trend: 'stable',
          },
          prediction_horizon: '1h',
          confidence: 0.85,
          alerts: [],
          recommendations: [],
        },
      });

      mockAdvancedAPIService.getPredictionSummary.mockResolvedValue({
        status: 'success',
        summary: {
          total_predictions: 10,
          predictions_by_type: {
            user_activity: 3,
            message_quality: 4,
            system_performance: 3,
          },
        },
      } as unknown as Record<string, unknown>);
    });

    it('예측이 활성화되어 있을 때 예측 차트가 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          system_status: {
            system_metrics: {
              cpu_usage: 0.5,
              memory_usage: 0.6,
              disk_usage: 0.4,
            },
          },
        }),
      });

      render(<PerformanceMonitoringDashboard showPredictions={true} />);

      await waitFor(() => {
        expect(mockAdvancedAPIService.predictSystemPerformance).toHaveBeenCalled();
      });
    });

    it('예측이 비활성화되어 있을 때 예측 차트가 표시되지 않아야 함', () => {
      render(<PerformanceMonitoringDashboard showPredictions={false} />);

      expect(mockAdvancedAPIService.predictSystemPerformance).not.toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 에러 메시지가 표시되어야 함', async () => {
      const mockStartRefreshing = jest.fn();
      const mockStopLoading = jest.fn();
      
      mockUseLoadingState.mockReturnValueOnce({
        loadingState: { type: 'idle' },
        startRefreshing: mockStartRefreshing,
        stopLoading: mockStopLoading,
        startInitialLoading: jest.fn(),
        startUpdating: jest.fn(),
        isLoading: false,
        isInitialLoading: false,
        isUpdating: false,
        isRefreshing: false,
      });

      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<PerformanceMonitoringDashboard />);

      await waitFor(() => {
        expect(mockStopLoading).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        const errorMessage = screen.queryByText(/오류가 발생했습니다|Network error/);
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('WebSocket 연결', () => {
    it('WebSocket이 연결되어 있을 때 연결 상태가 표시되어야 함', () => {
      mockUseWebSocket.mockReturnValueOnce({
        isConnected: true,
        socket: null,
        sendMessage: jest.fn(),
        disconnect: jest.fn(),
        reconnect: jest.fn(),
      });

      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByText('실시간 연결')).toBeInTheDocument();
    });

    it('WebSocket이 연결되지 않았을 때 연결 끊김 상태가 표시되어야 함', () => {
      mockUseWebSocket.mockReturnValueOnce({
        isConnected: false,
        socket: null,
        sendMessage: jest.fn(),
        disconnect: jest.fn(),
        reconnect: jest.fn(),
      });

      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByText('연결 끊김')).toBeInTheDocument();
    });
  });

  describe('새로고침 간격', () => {
    it('커스텀 새로고침 간격이 적용되어야 함', () => {
      render(<PerformanceMonitoringDashboard refreshInterval={60} />);

      expect(screen.getByText(/60초/)).toBeInTheDocument();
    });

    it('기본 새로고침 간격이 30초여야 함', () => {
      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByText(/30초/)).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 로딩 인디케이터가 표시되어야 함', () => {
      mockUseLoadingState.mockReturnValueOnce({
        loadingState: { type: 'refreshing', message: '새로고침 중...' } as unknown as Record<string, unknown>,
        startRefreshing: jest.fn(),
        stopLoading: jest.fn(),
        startInitialLoading: jest.fn(),
        startUpdating: jest.fn(),
        isLoading: true,
        isInitialLoading: false,
        isUpdating: false,
        isRefreshing: true,
      });

      render(<PerformanceMonitoringDashboard />);

      expect(screen.getByTestId('loading-state-indicator')).toBeInTheDocument();
      expect(screen.getByText('새로고침 중...')).toBeInTheDocument();
    });
  });
});

