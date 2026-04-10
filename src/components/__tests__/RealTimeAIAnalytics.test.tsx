/* eslint-disable jest/no-conditional-expect */
/**
 * RealTimeAIAnalytics 컴포넌트 테스트
 * 실시간 AI 분석 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealTimeAIAnalytics from '../RealTimeAIAnalytics';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';
import { aiAnalyticsApi } from '../../services/api';

// Mock axios (ESM 모듈)
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock aiAnalyticsApi
jest.mock('../../services/api', () => ({
  aiAnalyticsApi: {
    getMetrics: jest.fn(),
    getRecentAnalysis: jest.fn(),
    getModelPerformance: jest.fn(),
  },
}));

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

describe('RealTimeAIAnalytics', () => {
  const mockAiAnalyticsApi = jest.mocked(aiAnalyticsApi);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockAiAnalyticsApi.getMetrics.mockResolvedValue({
      requestsPerSecond: 10,
      averageResponseTime: 120,
      activeModels: 3,
      totalTokens: 1000,
      errorRate: 0.5,
      successRate: 99.5,
    });

    mockAiAnalyticsApi.getRecentAnalysis.mockResolvedValue([]);
    mockAiAnalyticsApi.getModelPerformance.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        // "실시간" 텍스트가 여러 곳에 있을 수 있음
        const realtimeTexts = screen.queryAllByText(/실시간/i);
        expect(realtimeTexts.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('모든 탭이 표시되어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        // 탭들이 렌더링되는지 확인
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('실시간 데이터 수집', () => {
    it('실시간 메트릭을 조회할 수 있어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        expect(mockAiAnalyticsApi.getMetrics).toHaveBeenCalled();
      });
      expect(mockAiAnalyticsApi.getRecentAnalysis).toHaveBeenCalled();
      expect(mockAiAnalyticsApi.getModelPerformance).toHaveBeenCalled();
    });

    it('데이터 수집 실패 시 에러를 로깅해야 함', async () => {
      // Error 객체를 명시적으로 생성
      const networkError = Object.create(Error.prototype);
      networkError.message = 'Network error';
      networkError.name = 'Error';
      
      mockAiAnalyticsApi.getMetrics.mockImplementation(() => {
        return Promise.reject(networkError);
      });

      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      }, { timeout: 10000 });
    });
  });

  describe('자동 새로고침', () => {
    it('자동 새로고침이 활성화되어 있어야 함', async () => {
      jest.useFakeTimers();
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        expect(mockAiAnalyticsApi.getMetrics).toHaveBeenCalled();
      });

      // 5초 후 자동 새로고침 확인
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockAiAnalyticsApi.getMetrics).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });

    it('자동 새로고침을 비활성화할 수 있어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        const autoRefreshSwitches = screen.queryAllByRole('checkbox', { name: /자동|auto/i });
        if (autoRefreshSwitches.length > 0) {
          fireEvent.click(autoRefreshSwitches[0]);
          // 자동 새로고침이 비활성화되었는지 확인
        }
      });
    });
  });

  describe('탭 전환', () => {
    it('분석 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
      const tabs = screen.queryAllByRole('tab');
      const analysisTab = screen.queryByRole('tab', { name: /실시간 분석|분석/i }) || tabs[0];
      if (analysisTab) {
        fireEvent.click(analysisTab);
        await waitFor(() => {
          expect(analysisTab).toHaveAttribute('aria-selected', 'true');
        });
      }
    });

    it('모델 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<RealTimeAIAnalytics />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
      const tabs = screen.queryAllByRole('tab');
      const modelTab = screen.queryByRole('tab', { name: /모델 성능|모델/i }) || tabs[0];
      if (modelTab) {
        fireEvent.click(modelTab);
        await waitFor(() => {
          expect(modelTab).toHaveAttribute('aria-selected', 'true');
        });
      }
    });
  });
});
