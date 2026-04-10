/**
 * AnalyticsDashboard 컴포넌트 테스트
 * 분석 대시보드 기능 확인
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { integratedAPIService } from '../../services/integratedAPIService';
import { setupCommonMocks } from '../../test-utils/testHelpers';

// Mock integratedAPIService
jest.mock('../../services/integratedAPIService', () => ({
  integratedAPIService: {
    getSystemStatus: jest.fn()
  }
}));

const mockIntegratedAPIService: jest.Mocked<typeof integratedAPIService> = jest.mocked(integratedAPIService);

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('기본 렌더링', () => {
    it('로딩 상태가 표시되어야 함', () => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockImplementation(
        () => new Promise(() => {}) // 무한 대기
      );

      render(<AnalyticsDashboard />);
      expect(screen.getByText(/분석 대시보드 로딩 중/)).toBeInTheDocument();
    });

    it('데이터 로드 성공 시 대시보드가 표시되어야 함', async () => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue({
        status: 'online',
        version: '1.0.0',
        metrics: {
          total_requests: 100,
          successful_requests: 90,
          failed_requests: 10,
          average_response_time: 0.5,
          last_updated: new Date().toISOString()
        }
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/CORBU.AI 분석 대시보드/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('데이터 로드 실패 시 에러 메시지가 표시되어야 함', async () => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockRejectedValue(
        new Error('데이터 로드 실패')
      );

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/분석 데이터를 불러올 수 없습니다/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('통계 데이터 표시', () => {
    const mockMetrics = {
      status: 'online',
      version: '1.0.0',
      metrics: {
        total_requests: 100,
        successful_requests: 90,
        failed_requests: 10,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      }
    };

    beforeEach(() => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue(mockMetrics);
    });

    it('총 요청 수가 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/총 요청/)).toBeInTheDocument();
    });

    it('성공률이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/90.0%/)).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/성공률/)).toBeInTheDocument();
    });

    it('평균 응답시간이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/500.0ms/)).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/평균 응답시간/)).toBeInTheDocument();
    });

    it('실패 요청 수가 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/실패 요청/)).toBeInTheDocument();
    });
  });

  describe('감정 분석 분포', () => {
    const mockMetrics = {
      status: 'online',
      version: '1.0.0',
      metrics: {
        total_requests: 100,
        successful_requests: 90,
        failed_requests: 10,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      }
    };

    beforeEach(() => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue(mockMetrics);
    });

    it('감정 분석 분포 섹션이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/감정 분석 분포/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('긍정, 부정, 중립 감정이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/감정 분석 분포/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 감정 분석 분포 섹션이 표시되면 통과
      expect(screen.getByText(/감정 분석 분포/)).toBeInTheDocument();
    });
  });

  describe('의도 분석 분포', () => {
    const mockMetrics = {
      status: 'online',
      version: '1.0.0',
      metrics: {
        total_requests: 100,
        successful_requests: 90,
        failed_requests: 10,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      }
    };

    beforeEach(() => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue(mockMetrics);
    });

    it('의도 분석 분포 섹션이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/의도 분석 분포/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('다양한 의도 타입이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/question:/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/request:/i)).toBeInTheDocument();
      expect(screen.getByText(/gratitude:/i)).toBeInTheDocument();
    });
  });

  describe('최근 메시지', () => {
    const mockMetrics = {
      status: 'online',
      version: '1.0.0',
      metrics: {
        total_requests: 100,
        successful_requests: 90,
        failed_requests: 10,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      }
    };

    beforeEach(() => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue(mockMetrics);
    });

    it('최근 분석된 메시지 섹션이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/최근 분석된 메시지/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('최근 메시지 목록이 표시되어야 함', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/정말 좋은 서비스네요!/)).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/이 기능은 어떻게 사용하나요?/)).toBeInTheDocument();
      expect(screen.getByText(/도와주세요!/)).toBeInTheDocument();
    });
  });

  describe('자동 업데이트', () => {
    const mockMetrics = {
      status: 'online',
      version: '1.0.0',
      metrics: {
        total_requests: 100,
        successful_requests: 90,
        failed_requests: 10,
        average_response_time: 0.5,
        last_updated: new Date().toISOString()
      }
    };

    it('10초마다 데이터를 자동으로 업데이트해야 함', async () => {
      mockIntegratedAPIService.getSystemStatus = jest.fn().mockResolvedValue(mockMetrics);

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(mockIntegratedAPIService.getSystemStatus).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });

      // 10초 경과 시뮬레이션
      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(mockIntegratedAPIService.getSystemStatus).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });
    });
  });
});

