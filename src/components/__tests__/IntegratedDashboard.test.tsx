/**
 * IntegratedDashboard 컴포넌트 테스트
 * 통합 대시보드 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntegratedDashboard from '../IntegratedDashboard';

// Mock Material-UI
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  LinearProgress: (props: any) => <div data-testid="linear-progress" {...props} />,
  Chip: ({ label, ...props }: any) => <span data-testid="chip" {...props}>{label}</span>,
  IconButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Tooltip: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>,
  Snackbar: ({ children, ...props }: any) => <div data-testid="snackbar" {...props}>{children}</div>,
  Fab: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Dialog: ({ children, open, ...props }: any) => open ? <div data-testid="dialog" {...props}>{children}</div> : null,
  DialogTitle: ({ children, ...props }: any) => <div data-testid="dialog-title" {...props}>{children}</div>,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogActions: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  List: ({ children, ...props }: any) => <div data-testid="list" {...props}>{children}</div>,
  ListItem: ({ children, ...props }: any) => <div data-testid="list-item" {...props}>{children}</div>,
  ListItemText: ({ primary, secondary, ...props }: any) => (
    <div {...props}>
      <div>{primary}</div>
      {secondary && <div>{secondary}</div>}
    </div>
  ),
  ListItemIcon: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Divider: () => <hr />,
  Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  Badge: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  Dashboard: () => <span data-testid="dashboard-icon">📊</span>,
  Speed: () => <span data-testid="speed-icon">⚡</span>,
  Security: () => <span data-testid="security-icon">🔒</span>,
  Psychology: () => <span data-testid="psychology-icon">🧠</span>,
  Person: () => <span data-testid="person-icon">👤</span>,
  Refresh: () => <span data-testid="refresh-icon">↻</span>,
  Notifications: () => <span data-testid="notifications-icon">🔔</span>,
  Settings: () => <span data-testid="settings-icon">⚙️</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">📈</span>,
  Memory: () => <span data-testid="memory-icon">💾</span>,
  Storage: () => <span data-testid="storage-icon">💿</span>,
  NetworkCheck: () => <span data-testid="network-icon">🌐</span>,
  Warning: () => <span data-testid="warning-icon">⚠</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✓</span>,
  Error: () => <span data-testid="error-icon">✗</span>,
  Info: () => <span data-testid="info-icon">ℹ</span>,
}));

// Mock services
jest.mock('../../services/apiService', () => ({
  performanceApi: {
    getMetrics: jest.fn(() => Promise.resolve({
      success: true,
      data: {
        cpu: 45.5,
        memory: 62.3,
        disk: 75.8,
        network: 30.2,
        responseTime: 120,
        errorRate: 0.5,
      },
    })),
  },
  aiEngineApi: {
    getStatus: jest.fn(() => Promise.resolve({ success: true })),
  },
  securityApi: {
    getStatus: jest.fn(() => Promise.resolve({ success: true })),
  },
  userExperienceApi: {
    getMetrics: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

jest.mock('../../services/websocketService', () => ({
  websocketService: {
    on: jest.fn(),
    off: jest.fn(),
    requestMetrics: jest.fn(),
    requestSecurityAlerts: jest.fn(),
    requestAIStatus: jest.fn(),
    requestPerformanceOptimization: jest.fn(),
  },
}));

jest.mock('../../services/notificationService', () => ({
  notificationService: {
    error: jest.fn(),
    security: jest.fn(),
    ai: jest.fn(),
    performance: jest.fn(),
  },
}));

// Mock hooks
const mockUseNotifications = jest.fn(() => ({
  notifications: [],
  markAsRead: jest.fn(),
  dismiss: jest.fn(),
  clearAll: jest.fn(),
}));

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: (...args: any[]) => mockUseNotifications(...args),
}));

// Mock NotificationCenter
jest.mock('../NotificationCenter', () => {
  return function MockNotificationCenter() {
    return <div data-testid="notification-center">Notification Center</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('IntegratedDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue({
      notifications: [],
      markAsRead: jest.fn(),
      dismiss: jest.fn(),
      clearAll: jest.fn(),
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        status: 'healthy',
        modules: {
          performance: 'healthy',
          security: 'healthy',
          ai_engine: 'healthy',
          user_experience: 'healthy',
        },
      }),
    });
  });

  describe('기본 렌더링', () => {
    it('대시보드가 렌더링되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/CORBU AI Ultimate Dashboard/)).toBeInTheDocument();
      });
    });

    it('로딩 중일 때 로딩 상태가 표시되어야 함', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<IntegratedDashboard />);

      // 로딩 상태는 매우 짧게 표시될 수 있음
      const progressBars = screen.queryAllByTestId('linear-progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('시스템 상태 표시', () => {
    it('전체 시스템 상태가 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/전체 시스템/)).toBeInTheDocument();
      });
    });

    it('성능 최적화 상태가 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/성능 최적화/)).toBeInTheDocument();
      });
    });

    it('AI 엔진 상태가 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/AI 엔진/)).toBeInTheDocument();
      });
    });

    it('보안 모니터링 상태가 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/보안 모니터링/)).toBeInTheDocument();
      });
    });
  });

  describe('실시간 메트릭', () => {
    it('CPU 사용률이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/CPU 사용률/)).toBeInTheDocument();
      });
    });

    it('메모리 사용률이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/메모리 사용률/)).toBeInTheDocument();
      });
    });

    it('디스크 사용률이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/디스크 사용률/)).toBeInTheDocument();
      });
    });

    it('네트워크 사용률이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/네트워크 사용률/)).toBeInTheDocument();
      });
    });
  });

  describe('성능 지표', () => {
    it('응답 시간이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        const responseTimeTexts = screen.queryAllByText(/응답 시간/);
        expect(responseTimeTexts.length).toBeGreaterThan(0);
      });
    });

    it('오류율이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        const errorRateTexts = screen.queryAllByText(/오류율/);
        expect(errorRateTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('알림 표시', () => {
    it('최근 알림 섹션이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/최근 알림/)).toBeInTheDocument();
      });
    });
  });

  describe('헤더 기능', () => {
    it('NotificationCenter가 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });
    });

    it('새로고침 버튼이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        const refreshIcons = screen.getAllByTestId('refresh-icon');
        expect(refreshIcons.length).toBeGreaterThan(0);
      });
    });

    it('설정 버튼이 표시되어야 함', async () => {
      render(<IntegratedDashboard />);

      await waitFor(() => {
        const settingsIcons = screen.getAllByTestId('settings-icon');
        expect(settingsIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('에러 처리', () => {
    it('데이터 수집 실패 시 에러 알림이 표시되어야 함', async () => {
      const { notificationService } = require('../../services/notificationService');
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<IntegratedDashboard />);

      await waitFor(() => {
        expect(notificationService.error).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});

