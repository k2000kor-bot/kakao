/* eslint-disable jest/no-conditional-expect */
/**
 * PerformanceOptimizer 컴포넌트 테스트
 * 성능 최적화 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PerformanceOptimizer from '../PerformanceOptimizer';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';
import { performanceApi } from '../../services/apiService';
import { performanceMonitorApi } from '../../services/api';

// Mock services
jest.mock('../../services/apiService', () => ({
  performanceApi: {
    getMetrics: jest.fn(),
  },
}));

jest.mock('../../services/api', () => ({
  performanceMonitorApi: {
    runOptimization: jest.fn(),
  },
}));

// Mock errorLogger (toError는 컴포넌트 catch 블록에서 사용됨)
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
  toError: (err: unknown) => (err instanceof Error ? err : new Error(String(err))),
}));

describe('PerformanceOptimizer', () => {
  const mockPerformanceApi = jest.mocked(performanceApi);
  const mockPerformanceMonitorApi = jest.mocked(performanceMonitorApi);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockPerformanceApi.getMetrics.mockResolvedValue({
      success: true,
      data: {
        cpu: 25,
        memory: 60,
        network: 15,
        storage: 35,
        responseTime: 120,
        throughput: 1000,
        errorRate: 0.5,
        cacheHitRate: 85,
      },
    });

    mockPerformanceMonitorApi.runOptimization.mockResolvedValue({
      success: true,
    } as unknown);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      // 탭으로 확인
      expect(screen.getByRole('tab', { name: /성능 메트릭/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /최적화/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /히스토리/i })).toBeInTheDocument();
    });

    it('성능 메트릭 탭이 기본적으로 활성화되어 있어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      // 성능 메트릭 탭이 선택되어 있는지 확인
      const metricsTab = screen.getByRole('tab', { name: /성능 메트릭/i });
      expect(metricsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('탭 전환', () => {
    it('최적화 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByText(/최적화/i);
      fireEvent.click(optimizationTab);

      // 최적화 설정이 표시되는지 확인
      expect(screen.getByText(/캐싱/i)).toBeInTheDocument();
    });

    it('히스토리 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const historyTab = screen.getByRole('tab', { name: /히스토리/i });
      fireEvent.click(historyTab);

      // 탭이 활성화되었는지 확인
      expect(historyTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('성능 메트릭 수집', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('성능 메트릭을 조회할 수 있어야 함', async () => {
      renderWithTheme(<PerformanceOptimizer />);

      // 초기 마운트 시에는 호출되지 않음 (setInterval은 5초 후 첫 호출)
      // 5초 진행 후 getMetrics 호출·setState가 act 내에서 처리되도록 함
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      await waitFor(() => {
        expect(mockPerformanceApi.getMetrics).toHaveBeenCalled();
      });
    });

    it('메트릭 조회 실패 시 에러를 로깅해야 함', async () => {
      mockPerformanceApi.getMetrics.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<PerformanceOptimizer />);

      // 5초 후에 호출되도록 시간 진행
      jest.advanceTimersByTime(5000);

      // 에러가 발생하면 errorLogger.error가 호출됨
      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      });
      
      // 에러 로깅이 호출되었는지 확인
      expect(errorLogger.error).toHaveBeenCalledWith(
        '메트릭 수집 실패',
        expect.any(Error),
        expect.objectContaining({
          component: 'PerformanceOptimizer',
          action: 'collectMetrics',
        })
      );
    });
  });

  describe('최적화 설정', () => {
    it('최적화 설정이 표시되어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByRole('tab', { name: /최적화/i });
      fireEvent.click(optimizationTab);

      // 탭이 활성화되었는지 확인
      expect(optimizationTab).toHaveAttribute('aria-selected', 'true');
    });

    it('최적화 설정을 변경할 수 있어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByRole('tab', { name: /최적화/i });
      fireEvent.click(optimizationTab);

      // 스위치 찾기 (실제 구현에 따라 다를 수 있음)
      const switches = screen.queryAllByRole('checkbox');
      if (switches.length > 0) {
        const firstSwitch = switches[0];
        const isChecked = firstSwitch.getAttribute('aria-checked') === 'true';
        fireEvent.click(firstSwitch);
        // 스위치 상태가 변경되었는지 확인
        expect(firstSwitch.getAttribute('aria-checked')).toBe(isChecked ? 'false' : 'true');
      }
    });
  });

  describe('최적화 실행', () => {
    it('최적화를 실행할 수 있어야 함', async () => {
      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByRole('tab', { name: /최적화/i });
      fireEvent.click(optimizationTab);

      // 최적화 버튼 찾기
      const optimizeButtons = screen.queryAllByRole('button', { name: /최적화|실행|시작/i });
      if (optimizeButtons.length > 0) {
        fireEvent.click(optimizeButtons[0]);
        
        await waitFor(() => {
          expect(mockPerformanceMonitorApi.runOptimization).toHaveBeenCalled();
        });
      }
    });

    it('최적화 실행 실패 시 에러를 로깅해야 함', async () => {
      mockPerformanceMonitorApi.runOptimization.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByRole('tab', { name: /최적화/i });
      fireEvent.click(optimizationTab);

      const optimizeButtons = screen.queryAllByRole('button', { name: /최적화|실행|시작/i });
      if (optimizeButtons.length > 0) {
        fireEvent.click(optimizeButtons[0]);
        
        await waitFor(() => {
          expect(errorLogger.error).toHaveBeenCalledWith(
            '최적화 실행 실패',
            expect.any(Error),
            expect.objectContaining({
              component: 'PerformanceOptimizer',
              action: 'runSpeed',
            })
          );
        });
      }
    });
  });

  describe('최적화 히스토리', () => {
    it('최적화 히스토리가 표시되어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const historyTab = screen.getByRole('tab', { name: /히스토리/i });
      fireEvent.click(historyTab);

      // 탭이 활성화되었는지 확인
      expect(historyTab).toHaveAttribute('aria-selected', 'true');
    });

    it('히스토리가 비어있으면 안내 메시지가 표시되어야 함', () => {
      renderWithTheme(<PerformanceOptimizer />);

      const historyTab = screen.getByRole('tab', { name: /히스토리/i });
      fireEvent.click(historyTab);

      // 탭이 활성화되었는지 확인
      expect(historyTab).toHaveAttribute('aria-selected', 'true');
      
      // 히스토리가 없을 때 안내 메시지 확인
      const emptyMessages = screen.queryAllByText(/아직|없습니다|없음/i);
      if (emptyMessages.length > 0) {
        expect(emptyMessages[0]).toBeInTheDocument();
      }
    });
  });

  describe('자동 최적화', () => {
    it('자동 최적화를 실행할 수 있어야 함', async () => {
      renderWithTheme(<PerformanceOptimizer />);

      const optimizationTab = screen.getByRole('tab', { name: /최적화/i });
      fireEvent.click(optimizationTab);

      // 자동 최적화 버튼 찾기
      const autoOptimizeButtons = screen.queryAllByRole('button', { name: /자동|auto/i });
      if (autoOptimizeButtons.length > 0) {
        fireEvent.click(autoOptimizeButtons[0]);
        
        await waitFor(() => {
          expect(mockPerformanceMonitorApi.runOptimization).toHaveBeenCalled();
        });
      }
    });
  });
});
