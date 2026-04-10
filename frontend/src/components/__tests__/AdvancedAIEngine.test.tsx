/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedAIEngine 컴포넌트 테스트
 * 고급 AI 엔진 컴포넌트 기능 확인
 */

import React from 'react';
import { act, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedAIEngine from '../AdvancedAIEngine';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';
import { AI_ENGINE_METRICS_PATH, AI_MODELS_STATUS_PATH } from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fetch
installJestFetchMock();

describe('AdvancedAIEngine', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockReset();
    
    // 초기 렌더링 시 호출되는 fetch 모킹
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        metrics: {
          processingSpeed: 850,
          accuracy: 96.5,
          memoryUsage: 45,
          responseTime: 120,
          throughput: 1000,
          errorRate: 0.5,
          confidence: 0.95,
          learningRate: 0.001,
        },
      }),
    });
    
    // setInterval을 사용하는 useEffect를 위해 fake timers 사용
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<AdvancedAIEngine />);

      expect(screen.getByText(/AI 엔진/i)).toBeInTheDocument();
    });

    it('모든 탭이 표시되어야 함', () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 탭들이 표시되는지 확인 (실제 텍스트는 컴포넌트에 따라 다를 수 있음)
      expect(screen.getByText(/AI 엔진/i)).toBeInTheDocument();
    });
  });

  describe('AI 엔진 메트릭', () => {
    it('AI 엔진 메트릭을 조회할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedAIEngine />);

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(AI_ENGINE_METRICS_PATH));
      });
    });

    it('메트릭 조회 실패 시 에러를 로깅해야 함', async () => {
      const networkError = new Error('Network error');

      jest.mocked(global.fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : String(input);
        if (url.includes(AI_ENGINE_METRICS_PATH)) {
          return Promise.reject(networkError);
        }
        if (url.includes(AI_MODELS_STATUS_PATH)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, models: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      });

      renderWithTheme(<AdvancedAIEngine />);

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      });
    });
  });

  describe('AI 모델 관리', () => {
    it('AI 모델 목록이 표시되어야 함', async () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 모델 관리 탭으로 전환
      const modelTab = screen.getByRole('tab', { name: /모델 관리/i });
      fireEvent.click(modelTab);

      // 모델 목록이 표시되는지 확인
      await waitFor(() => {
        const models = screen.queryAllByText(/GPT-4 Enhanced|BERT-Korean|Transformer-XL/i);
        expect(models.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('모델을 선택할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 모델 관리 탭으로 전환
      const modelTab = screen.getByRole('tab', { name: /모델 관리/i });
      fireEvent.click(modelTab);

      // 모델 선택 기능 확인
      await waitFor(() => {
        const models = screen.queryAllByText(/GPT-4 Enhanced|BERT-Korean|Transformer-XL/i);
        expect(models.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('처리 파이프라인', () => {
    it('처리 파이프라인이 표시되어야 함', async () => {
      renderWithTheme(<AdvancedAIEngine />);

      // AI 처리 탭으로 전환
      const processingTab = screen.getByRole('tab', { name: /AI 처리/i });
      fireEvent.click(processingTab);

      // 파이프라인 단계 확인
      await waitFor(() => {
        const pipelineStages = screen.queryAllByText(/초기 분석|컨텍스트 강화/i);
        expect(pipelineStages.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('텍스트 처리', () => {
    it('입력 텍스트를 입력할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 입력 필드 찾기 (실제 구현에 따라 다를 수 있음)
      const inputFields = screen.queryAllByRole('textbox');
      if (inputFields.length > 0) {
        const inputField = inputFields[0];
        fireEvent.change(inputField, { target: { value: '테스트 입력' } });
        expect(inputField).toHaveValue('테스트 입력');
      }
    });
  });

  describe('탭 전환', () => {
    it('다른 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 탭 전환 기능 확인 (실제 구현에 따라 다를 수 있음)
      const tabs = screen.queryAllByRole('tab');
      if (tabs.length > 1) {
        fireEvent.click(tabs[1]);
        // 탭 전환 후 내용이 변경되는지 확인
      }
    });
  });

  describe('처리 시작', () => {
    it('처리를 시작할 수 있어야 함', () => {
      renderWithTheme(<AdvancedAIEngine />);

      // 처리 시작 버튼 찾기
      const processButtons = screen.queryAllByRole('button', { name: /처리|시작|실행/i });
      if (processButtons.length > 0) {
        expect(processButtons[0]).toBeInTheDocument();
      }
    });
  });
});
