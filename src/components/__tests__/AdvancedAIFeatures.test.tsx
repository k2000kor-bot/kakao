/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedAIFeatures 컴포넌트 테스트
 * 고급 AI 기능 컴포넌트 기능 확인
 */

import {
  API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH,
  API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH,
  API_V8_ADVANCED_SYSTEM_HEALTH_PATH,
  API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../../config/api';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedAIFeatures from '../AdvancedAIFeatures';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock global fetch
installJestFetchMock();

describe('AdvancedAIFeatures', () => {
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
      renderWithTheme(<AdvancedAIFeatures />);

      // 탭으로 확인
      expect(screen.getByRole('tab', { name: /감정 분석/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /텍스트 요약/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /키워드 추출/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /시스템 헬스/i })).toBeInTheDocument();
    });

    it('모든 탭이 표시되어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      expect(screen.getByRole('tab', { name: /감정 분석/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /텍스트 요약/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /키워드 추출/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /시스템 헬스/i })).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('텍스트 요약 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      const summaryTab = screen.getByRole('tab', { name: /텍스트 요약/i });
      fireEvent.click(summaryTab);

      // 탭이 활성화되었는지 확인
      expect(summaryTab).toHaveAttribute('aria-selected', 'true');
      
      // 입력 필드가 있는지 확인
      expect(screen.getByLabelText(/요약할 텍스트/i)).toBeInTheDocument();
    });

    it('키워드 추출 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      const keywordTab = screen.getByRole('tab', { name: /키워드 추출/i });
      fireEvent.click(keywordTab);

      expect(screen.getByLabelText(/키워드를 추출할 텍스트/i)).toBeInTheDocument();
    });

    it('시스템 헬스 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      const healthTab = screen.getByRole('tab', { name: /시스템 헬스/i });
      fireEvent.click(healthTab);

      expect(screen.getByText(/시스템 헬스 모니터링/i)).toBeInTheDocument();
    });
  });

  describe('감정 분석', () => {
    it('텍스트 입력 필드가 있어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      const inputField = screen.getByLabelText(/분석할 텍스트/i);
      expect(inputField).toBeInTheDocument();
    });

    it('빈 텍스트일 때 감정 분석 버튼이 비활성화되어야 함', () => {
      renderWithTheme(<AdvancedAIFeatures />);

      const analyzeButton = screen.getByRole('button', { name: /감정 분석 실행/i });
      expect(analyzeButton).toBeDisabled();
    });

    it('감정 분석을 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dominant_emotion: 'positive',
          confidence: 0.95,
          sentiment_scores: {
            positive: 0.8,
            negative: 0.1,
            neutral: 0.1,
          },
        }),
      } as Response);

      renderWithTheme(<AdvancedAIFeatures />);

      const inputField = screen.getByLabelText(/분석할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '좋은 하루입니다!' } });

      const analyzeButton = screen.getByRole('button', { name: /감정 분석 실행/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH}`),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: '좋은 하루입니다!' }),
          })
        );
      });
    });

    it('감정 분석 결과를 표시해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dominant_emotion: 'positive',
          confidence: 0.95,
          sentiment_scores: {
            positive: 0.8,
            negative: 0.1,
            neutral: 0.1,
          },
        }),
      } as Response);

      renderWithTheme(<AdvancedAIFeatures />);

      const inputField = screen.getByLabelText(/분석할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '좋은 하루입니다!' } });

      const analyzeButton = screen.getByRole('button', { name: /감정 분석 실행/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/감정 분석 결과/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
    });

    it('감정 분석 실패 시 에러를 표시해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<AdvancedAIFeatures />);

      const inputField = screen.getByLabelText(/분석할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '테스트 텍스트' } });

      const analyzeButton = screen.getByRole('button', { name: /감정 분석 실행/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/감정 분석 중 오류가 발생했습니다/i)).toBeInTheDocument();
      });
    });

    it('onAnalysisComplete 콜백을 호출해야 함', async () => {
      const onAnalysisComplete = jest.fn();
      const mockResult = {
        dominant_emotion: 'positive',
        confidence: 0.95,
        sentiment_scores: {
          positive: 0.8,
          negative: 0.1,
          neutral: 0.1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      } as Response);

      renderWithTheme(<AdvancedAIFeatures onAnalysisComplete={onAnalysisComplete} />);

      const inputField = screen.getByLabelText(/분석할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '테스트 텍스트' } });

      const analyzeButton = screen.getByRole('button', { name: /감정 분석 실행/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(onAnalysisComplete).toHaveBeenCalledWith(mockResult);
      });
    });
  });

  describe('텍스트 요약', () => {
    it('텍스트 요약을 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          original_length: 100,
          summary_length: 50,
          compression_ratio: 0.5,
          summary: '요약된 텍스트',
        }),
      } as Response);

      renderWithTheme(<AdvancedAIFeatures />);

      const summaryTab = screen.getByRole('tab', { name: /텍스트 요약/i });
      fireEvent.click(summaryTab);

      const inputField = screen.getByLabelText(/요약할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '긴 텍스트 내용입니다...' } });

      const summarizeButton = screen.getByRole('button', { name: /텍스트 요약 실행/i });
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH}`),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              text: '긴 텍스트 내용입니다...',
              max_length: 100,
            }),
          })
        );
      });
    });
  });

  describe('키워드 추출', () => {
    it('키워드 추출을 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          keyword_count: 5,
          keywords: [
            { word: '키워드1', frequency: 10 },
            { word: '키워드2', frequency: 8 },
          ],
          total_words: 100,
          unique_words: 50,
        }),
      } as Response);

      renderWithTheme(<AdvancedAIFeatures />);

      const keywordTab = screen.getByRole('tab', { name: /키워드 추출/i });
      fireEvent.click(keywordTab);

      const inputField = screen.getByLabelText(/키워드를 추출할 텍스트/i);
      fireEvent.change(inputField, { target: { value: '테스트 텍스트입니다' } });

      const extractButton = screen.getByRole('button', { name: /키워드 추출 실행/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH}`),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              text: '테스트 텍스트입니다',
              max_keywords: 10,
            }),
          })
        );
      });
    });
  });

  describe('시스템 헬스', () => {
    it('시스템 헬스 체크를 실행할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          system_resources: {
            cpu_usage: '50%',
            memory_usage: '60%',
            disk_usage: '40%',
          },
          api_status: {
            version: '1.0.0',
          },
          ai_models: {
            sentiment_analysis: 'active',
            text_summarization: 'active',
          },
        }),
      } as Response);

      renderWithTheme(<AdvancedAIFeatures />);

      const healthTab = screen.getByRole('tab', { name: /시스템 헬스/i });
      fireEvent.click(healthTab);

      const checkButton = screen.getByRole('button', { name: /시스템 헬스 체크/i });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_V8_ADVANCED_SYSTEM_HEALTH_PATH)
        );
      });
    });
  });
});
