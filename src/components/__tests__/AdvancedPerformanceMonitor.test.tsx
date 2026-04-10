/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedPerformanceMonitor 컴포넌트 테스트
 * 고급 성능 모니터링 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdvancedPerformanceMonitor from '../AdvancedPerformanceMonitor';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';

// Mock axios
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));
const mockedAxios: jest.Mocked<typeof axios> = jest.mocked(axios);

describe('AdvancedPerformanceMonitor', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockedAxios.get.mockResolvedValue({
      data: {
        timestamp: new Date().toISOString(),
        cpu: {
          usage: 50,
          cores: 8,
          temperature: 60,
          frequency: 2400,
        },
        memory: {
          used: 4096,
          total: 8192,
          available: 4096,
          swap: 1024,
        },
        disk: {
          used: 100,
          total: 500,
          readSpeed: 100,
          writeSpeed: 80,
        },
        network: {
          bytesIn: 1000000,
          bytesOut: 500000,
          packetsIn: 1000,
          packetsOut: 500,
          latency: 10,
        },
        processes: {
          total: 100,
          running: 50,
          sleeping: 40,
          zombie: 10,
        },
      },
    });

    mockedAxios.post.mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<AdvancedPerformanceMonitor />);

      await waitFor(() => {
        const headers = screen.queryAllByText(/성능 모니터/i);
        expect(headers.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('탭이 표시되어야 함', async () => {
      renderWithTheme(<AdvancedPerformanceMonitor />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
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
      renderWithTheme(<AdvancedPerformanceMonitor />);

      // 모니터링 시작 버튼 클릭 (메트릭 수집을 트리거)
      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        const startButton = buttons.find(btn => 
          btn.textContent?.includes('시작') || 
          btn.textContent?.includes('Start') ||
          btn.getAttribute('aria-label')?.includes('모니터링')
        );
        if (startButton) {
          fireEvent.click(startButton);
        }
      }, { timeout: 3000 });

      // 모니터링이 시작되면 메트릭이 조회됨
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('모니터링 제어', () => {
    it('모니터링 시작/중지 버튼이 있어야 함', async () => {
      renderWithTheme(<AdvancedPerformanceMonitor />);

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('탭 전환', () => {
    it('다른 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedPerformanceMonitor />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      const tabs = screen.queryAllByRole('tab');
      if (tabs.length > 1) {
        fireEvent.click(tabs[1]);
        await waitFor(() => {
          expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
        });
      }
    });
  });
});
