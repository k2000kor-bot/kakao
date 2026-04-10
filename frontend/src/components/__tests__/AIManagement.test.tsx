/* eslint-disable jest/no-conditional-expect */
/**
 * AIManagement 컴포넌트 테스트
 * AI 관리 컴포넌트 기능 확인
 */

import {
  FALLBACK_API_ORIGIN,
  INTEGRATED_API_AI_BENCHMARK_PATH,
  INTEGRATED_API_AI_OPTIMIZE_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIManagement from '../AIManagement';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock global fetch
installJestFetchMock();

describe('AIManagement', () => {
  const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<AIManagement />);

      expect(screen.getByRole('tab', { name: /최적화/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /벤치마크/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /피드백/i })).toBeInTheDocument();
    });

    it('모든 탭이 표시되어야 함', () => {
      renderWithTheme(<AIManagement />);

      expect(screen.getByRole('tab', { name: /최적화/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /벤치마크/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /피드백/i })).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('벤치마크 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AIManagement />);

      const benchmarkTab = screen.getByRole('tab', { name: /벤치마크/i });
      fireEvent.click(benchmarkTab);

      expect(screen.getByText(/벤치마크 실행/i)).toBeInTheDocument();
    });

    it('피드백 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AIManagement />);

      const feedbackTab = screen.getByRole('tab', { name: /피드백/i });
      fireEvent.click(feedbackTab);

      expect(screen.getByText(/피드백 제출/i)).toBeInTheDocument();
    });
  });

  describe('최적화 기능', () => {
    it('최적화를 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            before_optimization: { response_time: 100 },
            after_optimization: { response_time: 80 },
            improvements: { response_time: 20 },
            recommendations: ['Cache frequently used data'],
          },
        }),
      } as Response);

      renderWithTheme(<AIManagement />);

      const optimizeButton = screen.getByRole('button', { name: /최적화 실행/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${INTEGRATED_API_AI_OPTIMIZE_PATH}`),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('최적화 결과를 표시해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            before_optimization: { response_time: 100 },
            after_optimization: { response_time: 80 },
            improvements: { response_time: 20 },
            recommendations: ['Cache frequently used data'],
          },
        }),
      } as Response);

      renderWithTheme(<AIManagement />);

      const optimizeButton = screen.getByRole('button', { name: /최적화 실행/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(screen.getByText(/최적화 결과/i)).toBeInTheDocument();
      });
    });

    it('최적화 실패 시 에러를 표시해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<AIManagement />);

      const optimizeButton = screen.getByRole('button', { name: /최적화 실행/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(screen.getByText(/최적화 중 오류가 발생했습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('벤치마크 기능', () => {
    it('벤치마크를 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            summary: {
              best_model: 'model-1',
              best_score: 95,
              recommendations: ['Use model-1 for production'],
            },
            results: [
              {
                model_name: 'model-1',
                response_time: 50,
                accuracy: 95,
                memory_usage: 100,
                throughput: 1000,
                cost_per_request: 0.01,
                reliability: 99,
                comprehensive_score: 95,
              },
            ],
          },
        }),
      } as Response);

      renderWithTheme(<AIManagement />);

      const benchmarkTab = screen.getByRole('tab', { name: /벤치마크/i });
      fireEvent.click(benchmarkTab);

      const benchmarkButton = screen.getByRole('button', { name: /벤치마크 실행/i });
      fireEvent.click(benchmarkButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${INTEGRATED_API_AI_BENCHMARK_PATH}`),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('피드백 기능', () => {
    it('피드백을 제출할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            learning_update: {
              new_training_samples: 10,
              model_accuracy_improvement: 2,
              response_quality_score: 4.5,
              user_satisfaction_trend: 'improving',
            },
            improvements: ['Improved response quality'],
            feedback_stats: {
              total_feedback_count: 100,
              average_rating: 4.5,
              positive_feedback_rate: 0.9,
              improvement_suggestions_count: 20,
            },
          },
        }),
      } as Response);

      renderWithTheme(<AIManagement />);

      const feedbackTab = screen.getByRole('tab', { name: /피드백/i });
      fireEvent.click(feedbackTab);

      // 피드백 내용 입력 (버튼이 비활성화되지 않도록)
      await waitFor(() => {
        const feedbackInput = screen.getByLabelText(/피드백 내용/i);
        expect(feedbackInput).toBeInTheDocument();
      });
      const feedbackInput = screen.getByLabelText(/피드백 내용/i);
      fireEvent.change(feedbackInput, { target: { value: '테스트 피드백' } });

      // 제출 버튼 찾기 및 클릭
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /피드백 제출/i });
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 3000 });
      const submitButton = screen.getByRole('button', { name: /피드백 제출/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('onOptimizationComplete 콜백을 호출해야 함', async () => {
      const onOptimizationComplete = jest.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            before_optimization: { response_time: 100 },
            after_optimization: { response_time: 80 },
            improvements: { response_time: 20 },
            recommendations: [],
          },
        }),
      } as Response);

      renderWithTheme(<AIManagement onOptimizationComplete={onOptimizationComplete} />);

      const optimizeButton = screen.getByRole('button', { name: /최적화 실행/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(onOptimizationComplete).toHaveBeenCalled();
      });
    });
  });
});
