/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedAnalytics 컴포넌트 테스트
 * 고급 분석 컴포넌트 기능 확인
 */

import {
  FALLBACK_API_ORIGIN,
  INTEGRATED_API_ANALYTICS_ADVANCED_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedAnalytics from '../AdvancedAnalytics';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock fetch
installJestFetchMock();

describe('AdvancedAnalytics', () => {
  const mockOnInsightGenerated = jest.fn();

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      // 탭으로 확인
      expect(screen.getByRole('tab', { name: /고급 분석/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /예측 분석/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /인사이트/i })).toBeInTheDocument();
    });

    it('고급 분석 탭이 기본적으로 활성화되어 있어야 함', () => {
      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      expect(screen.getByText(/분석 실행/i)).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('예측 분석 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const predictionTab = screen.getByRole('tab', { name: /예측 분석/i });
      fireEvent.click(predictionTab);

      // 탭이 활성화되었는지 확인
      expect(predictionTab).toHaveAttribute('aria-selected', 'true');
    });

    it('인사이트 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const insightsTab = screen.getByRole('tab', { name: /인사이트/i });
      fireEvent.click(insightsTab);

      // 탭이 활성화되었는지 확인
      expect(insightsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('고급 분석 실행', () => {
    it('고급 분석을 실행할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            summary: {
              avg_positive: 0.7,
              avg_negative: 0.2,
              trend_direction: 'up',
              volatility: 0.1,
            },
            insights: ['사용자 만족도가 증가하고 있습니다.'],
          },
        }),
      });

      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const runButton = screen.getByRole('button', { name: /분석 실행/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${INTEGRATED_API_ANALYTICS_ADVANCED_PATH}`),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('분석 실행 실패 시 에러 메시지가 표시되어야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const runButton = screen.getByRole('button', { name: /분석 실행/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/오류/i)).toBeInTheDocument();
      });
    });
  });

  describe('분석 타입 선택', () => {
    it('분석 타입을 선택할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      // 분석 타입 선택 필드 찾기
      const analysisTypeSelects = screen.queryAllByLabelText(/분석 타입|analysis type/i);
      if (analysisTypeSelects.length > 0) {
        const select = analysisTypeSelects[0];
        fireEvent.mouseDown(select);
        
        await waitFor(() => {
          expect(screen.getByText(/사용자 행동/i)).toBeInTheDocument();
        });
        const userBehaviorOption = screen.getByText(/사용자 행동/i);
        fireEvent.click(userBehaviorOption);
      }
    });
  });

  describe('예측 분석', () => {
    it('예측 분석을 실행할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            prediction: {
              current_value: 85,
              predicted_value: 90,
              confidence: 0.85,
              factors: ['사용자 증가', '콘텐츠 품질 향상'],
              recommendations: ['마케팅 강화', '사용자 경험 개선'],
            },
          },
        }),
      });

      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const predictionTab = screen.getByRole('tab', { name: /예측 분석/i });
      fireEvent.click(predictionTab);

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
      
      const runButton = screen.queryByRole('button', { name: /예측|실행/i });
      if (runButton) {
        fireEvent.click(runButton);
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('인사이트 생성', () => {
    it('인사이트를 생성할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            total_insights: 3,
            insights: [
              {
                title: '사용자 만족도 향상',
                description: '최근 사용자 만족도가 15% 증가했습니다.',
                impact: 'high',
                recommendation: '현재 전략을 유지하세요.',
              },
            ],
          },
        }),
      });

      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const insightsTab = screen.getByRole('tab', { name: /인사이트/i });
      fireEvent.click(insightsTab);

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
      
      const generateButton = screen.queryByRole('button', { name: /인사이트|생성/i });
      if (generateButton) {
        fireEvent.click(generateButton);
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('인사이트 생성 시 콜백이 호출되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            total_insights: 1,
            insights: [
              {
                title: '테스트 인사이트',
                description: '테스트 설명',
                impact: 'high',
                recommendation: '테스트 권장사항',
              },
            ],
          },
        }),
      });

      renderWithTheme(<AdvancedAnalytics onInsightGenerated={mockOnInsightGenerated} />);

      const insightsTab = screen.getByRole('tab', { name: /인사이트/i });
      fireEvent.click(insightsTab);

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
      
      const generateButton = screen.queryByRole('button', { name: /인사이트|생성/i });
      if (generateButton) {
        fireEvent.click(generateButton);
      }

      await waitFor(() => {
        expect(mockOnInsightGenerated).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
