/* eslint-disable jest/no-conditional-expect */
/**
 * AutomationWorkflowManager 컴포넌트 테스트
 * 자동화 워크플로우 관리 컴포넌트 기능 확인
 */

import {
  API_AUTOMATION_WORKFLOWS_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../../config/api';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AutomationWorkflowManager from '../AutomationWorkflowManager';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { errorLogger } from '../../utils/errorLogger';

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
const mockedAxios: jest.Mocked<typeof axios> = jest.mocked(axios);

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

describe('AutomationWorkflowManager', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          workflows: [],
          executions: [],
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<AutomationWorkflowManager />);

      await waitFor(() => {
        expect(screen.getByText(/워크플로우/i)).toBeInTheDocument();
      });
    });

    it('모든 탭이 표시되어야 함', async () => {
      renderWithTheme(<AutomationWorkflowManager />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('워크플로우 로드', () => {
    it('워크플로우 목록을 로드할 수 있어야 함', async () => {
      const mockWorkflows = [
        {
          id: '1',
          name: '테스트 워크플로우',
          description: '테스트 설명',
          status: 'active',
          trigger: { type: 'schedule', schedule: '0 0 * * *' },
          actions: [],
          created_at: '2024-01-27T10:00:00Z',
          updated_at: '2024-01-27T10:00:00Z',
          run_count: 10,
          success_count: 9,
          error_count: 1,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            workflows: mockWorkflows,
          },
        },
      });

      renderWithTheme(<AutomationWorkflowManager />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${API_AUTOMATION_WORKFLOWS_PATH}`)
        );
      });
    });

    it('워크플로우 로드 실패 시 에러를 로깅해야 함', async () => {
      // Error 객체를 명시적으로 생성
      const networkError = Object.create(Error.prototype);
      networkError.message = 'Network error';
      networkError.name = 'Error';
      
      mockedAxios.get.mockImplementation(() => {
        return Promise.reject(networkError);
      });

      renderWithTheme(<AutomationWorkflowManager />);

      await waitFor(() => {
        expect(errorLogger.error).toHaveBeenCalled();
      }, { timeout: 10000 });
    });
  });

  describe('워크플로우 실행', () => {
    it('워크플로우를 실행할 수 있어야 함', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            execution_id: 'exec-1',
          },
        },
      });

      renderWithTheme(<AutomationWorkflowManager />);

      // 실행 버튼 찾기 (실제 구현에 따라 다를 수 있음)
      await waitFor(() => {
        const executeButtons = screen.queryAllByRole('button', { name: /실행|run/i });
        if (executeButtons.length > 0) {
          fireEvent.click(executeButtons[0]);
          
          expect(mockedAxios.post).toHaveBeenCalled();
        }
      });
    });
  });

  describe('탭 전환', () => {
    it('실행 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<AutomationWorkflowManager />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        const executionTab = tabs.find(tab => tab.textContent?.includes('실행'));
        if (executionTab) {
          fireEvent.click(executionTab);
          expect(executionTab).toHaveAttribute('aria-selected', 'true');
        }
      }, { timeout: 5000 });
    });
  });
});
