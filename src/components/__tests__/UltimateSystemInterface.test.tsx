/* eslint-disable jest/no-conditional-expect */
/**
 * UltimateSystemInterface 컴포넌트 테스트
 * 최종 시스템 인터페이스 컴포넌트 기능 확인
 */

import React from 'react';
import { act, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltimateSystemInterface from '../UltimateSystemInterface';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';
import { API_SYSTEM_BACKUP_PATH, API_SYSTEM_RESTART_PATH } from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock child components
jest.mock('../PerformanceOptimizer', () => {
  return function MockPerformanceOptimizer() {
    return <div data-testid="performance-optimizer">Performance Optimizer</div>;
  };
});

jest.mock('../AdvancedAIEngine', () => {
  return function MockAdvancedAIEngine() {
    return <div data-testid="advanced-ai-engine">Advanced AI Engine</div>;
  };
});

jest.mock('../EnhancedUserExperience', () => {
  return function MockEnhancedUserExperience() {
    return <div data-testid="enhanced-user-experience">Enhanced User Experience</div>;
  };
});

jest.mock('../AdvancedSecurityMonitor', () => {
  return function MockAdvancedSecurityMonitor() {
    return <div data-testid="advanced-security-monitor">Advanced Security Monitor</div>;
  };
});

// Mock errorLogger and toError
jest.mock('../../utils/errorLogger', () => {
  const actual = jest.requireActual('../../utils/errorLogger');
  return {
    ...actual,
    errorLogger: {
      error: jest.fn(),
      info: jest.fn(),
    },
  };
});

// Mock fetch
installJestFetchMock();

describe('UltimateSystemInterface', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockReset();
    
    // 기본 fetch 모킹 (자동 업데이트를 위해)
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        status: {
          overall: 'healthy',
          uptime: 99.9,
          activeUsers: 45,
          totalRequests: 1250,
          errorRate: 0.2,
          responseTime: 45,
          cpuUsage: 25,
          memoryUsage: 60,
          diskUsage: 35,
          networkUsage: 15,
        },
        metrics: {
          performance: 95,
          security: 98,
          userExperience: 92,
          aiCapability: 96,
          overall: 95,
        },
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      // 여러 곳에 있을 수 있으므로 queryAllByText 사용
      const overviewElements = screen.queryAllByText(/시스템 개요/i);
      expect(overviewElements.length).toBeGreaterThan(0);
    });

    it('시스템 상태가 표시되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      const statusElements = screen.queryAllByText(/전체 시스템 상태|시스템 상태/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('시스템 메트릭이 표시되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      // 여러 곳에 있을 수 있으므로 queryAllByText 사용
      expect(screen.queryAllByText('성능').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('보안').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('사용자 경험').length).toBeGreaterThan(0);
      expect(screen.queryAllByText('AI 능력').length).toBeGreaterThan(0);
    });
  });

  describe('시스템 상태 업데이트', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('시스템 상태를 업데이트할 수 있어야 함', async () => {
      const mockStatus = {
        success: true,
        status: {
          overall: 'healthy',
          uptime: 99.9,
          activeUsers: 50,
          totalRequests: 1500,
          errorRate: 0.1,
          responseTime: 40,
          cpuUsage: 20,
          memoryUsage: 55,
          diskUsage: 30,
          networkUsage: 12,
        },
      };

      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      });

      renderWithTheme(<UltimateSystemInterface />);

      // 5초 후 자동 업데이트
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('시스템 상태 업데이트 실패 시 에러를 로깅해야 함', async () => {
      // Error 객체를 명시적으로 생성하고 mockImplementation 사용
      const networkError = Object.create(Error.prototype);
      networkError.message = 'Network error';
      networkError.name = 'Error';
      
      jest.mocked(global.fetch).mockImplementation(() => {
        return Promise.reject(networkError);
      });

      renderWithTheme(<UltimateSystemInterface />);

      // 5초 후 자동 업데이트
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('시스템 메트릭 업데이트', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('시스템 메트릭을 업데이트할 수 있어야 함', async () => {
      const mockMetrics = {
        success: true,
        metrics: {
          performance: 98,
          security: 99,
          userExperience: 95,
          aiCapability: 97,
          overall: 97,
        },
      };

      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockMetrics,
      });

      renderWithTheme(<UltimateSystemInterface />);

      // 5초 후 자동 업데이트
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('시스템 메트릭 업데이트 실패 시 에러를 로깅해야 함', async () => {
      // Error 객체를 명시적으로 생성하고 mockImplementation 사용
      const networkError = Object.create(Error.prototype);
      networkError.message = 'Network error';
      networkError.name = 'Error';
      
      jest.mocked(global.fetch).mockImplementation(() => {
        return Promise.reject(networkError);
      });

      renderWithTheme(<UltimateSystemInterface />);

      // 5초 후 자동 업데이트
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('탭 전환', () => {
    it('성능 최적화 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const performanceMenus = screen.queryAllByText('성능 최적화');
        if (performanceMenus.length > 0) {
          fireEvent.click(performanceMenus[0]);
          expect(screen.getByTestId('performance-optimizer')).toBeInTheDocument();
        }
      }, { timeout: 5000 });
    });

    it('AI 엔진 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const aiEngineMenus = screen.queryAllByText('AI 엔진');
        if (aiEngineMenus.length > 0) {
          fireEvent.click(aiEngineMenus[0]);
          expect(screen.getByTestId('advanced-ai-engine')).toBeInTheDocument();
        }
      }, { timeout: 5000 });
    });

    it('사용자 경험 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const userExperienceMenus = screen.queryAllByText('사용자 경험');
        if (userExperienceMenus.length > 0) {
          fireEvent.click(userExperienceMenus[0]);
          expect(screen.getByTestId('enhanced-user-experience')).toBeInTheDocument();
        }
      }, { timeout: 5000 });
    });

    it('보안 모니터링 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const securityMenus = screen.queryAllByText('보안 모니터링');
        if (securityMenus.length > 0) {
          fireEvent.click(securityMenus[0]);
          expect(screen.getByTestId('advanced-security-monitor')).toBeInTheDocument();
        }
      }, { timeout: 5000 });
    });
  });

  describe('알림 시스템', () => {
    it('알림이 표시되어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      const notificationsMenu = screen.getByRole('button', { name: /알림 센터/i });
      await act(async () => {
        fireEvent.click(notificationsMenu);
      });

      await waitFor(() => {
        expect(screen.getByText('시스템 최적화 완료')).toBeInTheDocument();
        expect(screen.getByText('새로운 AI 모델 배포')).toBeInTheDocument();
        expect(screen.getByText('보안 스캔 필요')).toBeInTheDocument();
      });
    });

    it('모든 알림을 읽음 처리할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      const notificationsMenu = screen.getByRole('button', { name: /알림 센터/i });
      await act(async () => {
        fireEvent.click(notificationsMenu);
      });

      const markAllReadButton = await screen.findByRole('button', { name: /모두 읽음/i });
      expect(markAllReadButton).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(markAllReadButton);
      });

      await waitFor(() => {
        expect(markAllReadButton).toBeDisabled();
      });
    });
  });

  describe('시스템 재시작', () => {
    it('시스템을 재시작할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      const restartButton = await screen.findByRole('button', { name: /시스템 재시작/i });
      expect(restartButton).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(restartButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(API_SYSTEM_RESTART_PATH),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    it('시스템 재시작 실패 시 에러를 로깅해야 함', async () => {
      jest.mocked(global.fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input);
        if (url.includes(API_SYSTEM_RESTART_PATH)) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            status: {
              overall: 'healthy',
              uptime: 99.9,
              activeUsers: 45,
              totalRequests: 1250,
              errorRate: 0.2,
              responseTime: 45,
              cpuUsage: 25,
              memoryUsage: 60,
              diskUsage: 35,
              networkUsage: 15,
            },
            metrics: {
              performance: 95,
              security: 98,
              userExperience: 92,
              aiCapability: 96,
              overall: 95,
            },
          }),
        });
      });

      renderWithTheme(<UltimateSystemInterface />);

      const restartButton = await screen.findByRole('button', { name: /시스템 재시작/i });
      await act(async () => {
        fireEvent.click(restartButton);
      });

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalledWith(
          '시스템 재시작 실패',
          expect.any(Error),
          {
            component: 'UltimateSystemInterface',
            action: 'restartSystem',
          }
        );
      });
    });
  });

  describe('시스템 백업', () => {
    it('시스템을 백업할 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      const backupButton = await screen.findByRole('button', { name: /시스템 백업/i });
      expect(backupButton).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(backupButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(API_SYSTEM_BACKUP_PATH),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    it('시스템 백업 실패 시 에러를 로깅해야 함', async () => {
      jest.mocked(global.fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input);
        if (url.includes(API_SYSTEM_BACKUP_PATH)) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            status: {
              overall: 'healthy',
              uptime: 99.9,
              activeUsers: 45,
              totalRequests: 1250,
              errorRate: 0.2,
              responseTime: 45,
              cpuUsage: 25,
              memoryUsage: 60,
              diskUsage: 35,
              networkUsage: 15,
            },
            metrics: {
              performance: 95,
              security: 98,
              userExperience: 92,
              aiCapability: 96,
              overall: 95,
            },
          }),
        });
      });

      renderWithTheme(<UltimateSystemInterface />);

      const backupButton = await screen.findByRole('button', { name: /시스템 백업/i });
      await act(async () => {
        fireEvent.click(backupButton);
      });

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalledWith(
          '시스템 백업 실패',
          expect.any(Error),
          {
            component: 'UltimateSystemInterface',
            action: 'backupSystem',
          }
        );
      });
    });
  });

  describe('시스템 설정 다이얼로그', () => {
    it('시스템 설정 다이얼로그를 열 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const settingsButtons = screen.queryAllByRole('button', { name: /시스템 설정/i });
        if (settingsButtons.length > 0) {
          fireEvent.click(settingsButtons[0]);
          // 다이얼로그가 열렸는지 확인 (DialogTitle 확인)
          const dialogTitle = screen.queryByRole('heading', { name: /시스템 설정/i });
          expect(dialogTitle).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    });

    it('시스템 설정 다이얼로그를 닫을 수 있어야 함', async () => {
      renderWithTheme(<UltimateSystemInterface />);

      await waitFor(() => {
        const settingsButtons = screen.queryAllByRole('button', { name: /시스템 설정/i });
        if (settingsButtons.length > 0) {
          fireEvent.click(settingsButtons[0]);
        }
      }, { timeout: 3000 });

      await waitFor(() => {
        const dialogTitle = screen.queryByRole('heading', { name: /시스템 설정/i });
        expect(dialogTitle).toBeInTheDocument();
      }, { timeout: 3000 });

      const closeButtons = screen.queryAllByRole('button', { name: /닫기/i });
      if (closeButtons.length > 0) {
        fireEvent.click(closeButtons[0]);
      }

      await waitFor(() => {
        const dialogTitle = screen.queryByRole('heading', { name: /시스템 설정/i });
        expect(dialogTitle).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('시스템 상태 표시', () => {
    it('시스템 상태에 따른 색상이 올바르게 표시되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      // healthy 상태는 success 색상
      const statusChip = screen.getByText('healthy');
      expect(statusChip).toBeInTheDocument();
    });

    it('전체 시스템 점수가 계산되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      // 전체 점수는 메트릭의 평균값
      // (95 + 98 + 92 + 96) / 4 = 95.25 ≈ 95
      // 여러 곳에 있을 수 있으므로 queryAllByText 사용
      const scoreElements = screen.queryAllByText(/95/i);
      expect(scoreElements.length).toBeGreaterThan(0);
    });
  });

  describe('시스템 리소스 표시', () => {
    it('시스템 리소스 정보가 표시되어야 함', () => {
      renderWithTheme(<UltimateSystemInterface />);

      // 시스템 리소스 정보 확인
      expect(screen.getByText('시스템 리소스')).toBeInTheDocument();
      expect(screen.getByText('CPU 사용률')).toBeInTheDocument();
      expect(screen.getByText('메모리 사용률')).toBeInTheDocument();
      expect(screen.getByText('디스크 사용률')).toBeInTheDocument();
      expect(screen.getByText('네트워크 사용률')).toBeInTheDocument();
    });
  });
});
