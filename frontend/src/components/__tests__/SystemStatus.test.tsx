/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import SystemStatus from '../SystemStatus';
import { integratedAPIService } from '../../services/integratedAPIService';

// Mock integratedAPIService
jest.mock('../../services/integratedAPIService', () => ({
  integratedAPIService: {
    testConnection: jest.fn(),
    getSystemStatus: jest.fn()
  }
}));

const mockIntegratedAPIService: jest.Mocked<typeof integratedAPIService> = jest.mocked(integratedAPIService);

installJestFetchMock();

describe('SystemStatus', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('렌더링', () => {
    it('기본적으로 시스템 상태 컴포넌트를 렌더링해야 함', () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: {
          total_requests: 100,
          successful_requests: 95,
          failed_requests: 5,
          average_response_time: 0.5,
          last_updated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      expect(screen.getByText('시스템 상태')).toBeInTheDocument();
      expect(screen.getByText('새로고침')).toBeInTheDocument();
    });

    it('백엔드 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(screen.getByText('기본 백엔드')).toBeInTheDocument();
        expect(screen.getByText('포트 5001 - Flask 서버')).toBeInTheDocument();
      });
    });

    it('통합 API 서버 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(screen.getByText('통합 API 서버')).toBeInTheDocument();
        expect(screen.getByText('포트 5002 - 통합 AI 서버')).toBeInTheDocument();
      });
    });
  });

  describe('상태 확인', () => {
    it('백엔드가 연결된 경우 연결됨 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        const connectedChips = screen.getAllByText('연결됨');
        expect(connectedChips.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('백엔드가 연결되지 않은 경우 연결 끊김 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(false);

      render(<SystemStatus />);

      await waitFor(() => {
        const disconnectedChips = screen.getAllByText('연결 끊김');
        expect(disconnectedChips.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('통합 API 서버가 연결된 경우 연결됨 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        const connectedChips = screen.getAllByText('연결됨');
        expect(connectedChips.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('통합 API 서버가 연결되지 않은 경우 연결 끊김 상태를 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(false);

      render(<SystemStatus />);

      await waitFor(() => {
        const disconnectedChips = screen.getAllByText('연결 끊김');
        expect(disconnectedChips.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('메트릭 표시', () => {
    it('메트릭이 있는 경우 성능 메트릭을 표시해야 함', async () => {
      const metrics = {
        total_requests: 100,
        successful_requests: 95,
        failed_requests: 5,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(screen.getByText('성능 메트릭')).toBeInTheDocument();
        expect(screen.getByText(/총 요청: 100/)).toBeInTheDocument();
        expect(screen.getByText(/성공: 95/)).toBeInTheDocument();
        expect(screen.getByText(/실패: 5/)).toBeInTheDocument();
        expect(screen.getByText(/응답시간: 500\.00ms/)).toBeInTheDocument();
      });
    });

    it('메트릭이 없는 경우 성능 메트릭을 표시하지 않아야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        const metricsTitle = screen.queryByText('성능 메트릭');
        expect(metricsTitle).not.toBeInTheDocument();
      });
    });
  });

  describe('새로고침 기능', () => {
    it('새로고침 버튼 클릭 시 상태를 다시 확인해야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockResolvedValueOnce({ ok: true, status: 200 });
      
      mockIntegratedAPIService.testConnection = jest.fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn()
        .mockResolvedValueOnce({
          status: 'online',
          version: '1.0.0',
          metrics: null,
          timestamp: new Date().toISOString()
        })
        .mockResolvedValueOnce({
          status: 'online',
          version: '1.0.0',
          metrics: null,
          timestamp: new Date().toISOString()
        });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(screen.getByText('새로고침')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('새로고침');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(mockIntegratedAPIService.testConnection).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('상태 변경 콜백', () => {
    it('모든 서버가 연결된 경우 connected 콜백을 호출해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus onStatusChange={mockOnStatusChange} />);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('connected');
      });
    });

    it('서버 중 하나라도 연결되지 않은 경우 disconnected 콜백을 호출해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(false);

      render(<SystemStatus onStatusChange={mockOnStatusChange} />);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('disconnected');
      });
    });
  });

  describe('자동 새로고침', () => {
    it('30초마다 상태를 자동으로 새로고침해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('마지막 업데이트 시간', () => {
    it('마지막 업데이트 시간을 표시해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200
      });
      
      mockIntegratedAPIService.testConnection = jest.fn().mockResolvedValue(true);
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: null,
        timestamp: new Date().toISOString()
      });

      render(<SystemStatus />);

      await waitFor(() => {
        expect(screen.getByText(/마지막 업데이트:/)).toBeInTheDocument();
      });
    });
  });
});

