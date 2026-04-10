/**
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */
/**
 * UltimateChatGPTInterface 컴포넌트 테스트
 * 궁극의 ChatGPT 인터페이스 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UltimateChatGPTInterface from '../UltimateChatGPTInterface';
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../../services/multiLayerStyleAnalysisSystem';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-markdown">{children}</div>
  ),
  Components: {},
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('../../utils/rehypeHighlightSearch', () => ({
  rehypeHighlightSearch: () => () => {},
}));

// Mock global fetch
installJestFetchMock();

describe('UltimateChatGPTInterface', () => {
  const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    localStorage.removeItem('corbu_ai_conversation');

    // 기본 모킹 설정
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: '테스트 응답',
        analysis: {
          performance: {
            response_time: 100,
          },
          emotion: {
            confidence: 0.95,
          },
        },
      }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('localStorage 복원', () => {
    it('corbu_ai_conversation이 있으면 마운트 시 메시지를 복원한다', async () => {
      localStorage.setItem(
        'corbu_ai_conversation',
        JSON.stringify({
          project: null,
          messages: [
            {
              id: 'saved-1',
              role: 'user',
              content: '저장된 질문 텍스트',
              timestamp: new Date('2025-01-15T12:00:00.000Z').toISOString(),
            },
          ],
          timestamp: new Date().toISOString(),
        })
      );

      renderWithTheme(<UltimateChatGPTInterface />);

      await waitFor(() => {
        expect(screen.getByText('저장된 질문 텍스트')).toBeInTheDocument();
      });
    });
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<UltimateChatGPTInterface />);

      await waitFor(() => {
        // 기본 UI 요소 확인
        const inputFields = screen.queryAllByRole('textbox');
        expect(inputFields.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('메시지 입력', () => {
    it('메시지를 입력할 수 있어야 함', async () => {
      renderWithTheme(<UltimateChatGPTInterface />);

      await waitFor(() => {
        const inputFields = screen.queryAllByRole('textbox');
        expect(inputFields.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      const inputFields = screen.queryAllByRole('textbox');
      if (inputFields.length > 0) {
        fireEvent.change(inputFields[0], { target: { value: '테스트 메시지' } });
        expect(inputFields[0]).toHaveValue('테스트 메시지');
      }
    });
  });

  describe('메시지 전송', () => {
    it('메시지를 전송할 수 있어야 함', async () => {
      renderWithTheme(<UltimateChatGPTInterface />);

      await waitFor(() => {
        const inputFields = screen.queryAllByRole('textbox');
        expect(inputFields.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      const inputFields = screen.queryAllByRole('textbox');
      if (inputFields.length > 0) {
        fireEvent.change(inputFields[0], { target: { value: '테스트 메시지' } });
        
        const sendButton = screen.queryByRole('button', { name: /전송/i }) ||
                          screen.queryByTestId('send-button') ||
                          screen.queryByTestId('send');
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }
    });

    it('멀티레이어 힌트 env 활성화 시 초장문 전송 시 surface 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      try {
        renderWithTheme(<UltimateChatGPTInterface />);
        await waitFor(() => {
          expect(screen.queryAllByRole('textbox').length).toBeGreaterThan(0);
        }, { timeout: 3000 });
        const inputFields = screen.getAllByRole('textbox');
        const longMsg = 'v'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 45);
        fireEvent.change(inputFields[0], { target: { value: longMsg } });
        fireEvent.click(screen.getByRole('button', { name: /메시지 전송/i }));
        await waitFor(
          () => {
            expect(spy).toHaveBeenCalledWith(
              'v'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
              'surface'
            );
          },
          { timeout: 8000 }
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 전송 본문 context에 genspark_*가 없다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        renderWithTheme(<UltimateChatGPTInterface />);
        await waitFor(() => {
          expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
        }, { timeout: 3000 });
        window.history.replaceState({}, '', '/?id=7c36051a-2b94-4e9e-bd36-05dfabfe3e07');
        const nCallsBefore = mockFetch.mock.calls.length;
        const inputFields = screen.getAllByRole('textbox');
        fireEvent.change(inputFields[0], { target: { value: '안녕' } });
        fireEvent.click(screen.getByRole('button', { name: /메시지 전송/i }));
        await waitFor(() => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(nCallsBefore);
        }, { timeout: 8000 });
        const newCalls = mockFetch.mock.calls.slice(nCallsBefore);
        const chatPost = newCalls.find((c) => {
          const init = c[1] as RequestInit | undefined;
          if (!init?.body || typeof init.body !== 'string') return false;
          try {
            const o = JSON.parse(init.body) as Record<string, unknown>;
            return o.user_id === 'ultimate_interface';
          } catch {
            return false;
          }
        });
        expect(chatPost).toBeDefined();
        const posted = JSON.parse((chatPost![1] as { body: string }).body);
        expect(posted.context?.genspark_route_agent_id).toBeUndefined();
        expect(posted.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });
  });
});
