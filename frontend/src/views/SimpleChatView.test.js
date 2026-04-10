/**
 * 간단 대화 뷰 테스트
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SimpleChatView from './SimpleChatView';

// localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, response: '테스트 응답' }),
    })
  );
});

// errorLogger
jest.mock('../utils/errorLogger', () => ({
  errorLogger: { error: jest.fn() },
}));

describe('SimpleChatView', () => {
  it('헤더 타이틀과 환영 메시지를 렌더한다', () => {
    render(<SimpleChatView />);
    expect(screen.getByText('간단 대화')).toBeInTheDocument();
    expect(screen.getByText(/안녕하세요! CORBU.AI입니다/)).toBeInTheDocument();
  });

  it('대화 입력과 전송 버튼을 렌더한다', () => {
    render(<SimpleChatView />);
    expect(screen.getByPlaceholderText(/Type '\/' for commands/)).toBeInTheDocument();
    expect(screen.getByTitle('전송')).toBeInTheDocument();
  });

  it('빠른 액션 버튼(인사, 웹 개발 등)을 렌더한다', () => {
    render(<SimpleChatView />);
    expect(screen.getByRole('button', { name: /인사/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /웹 개발/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /머신러닝/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /데이터 분석/ })).toBeInTheDocument();
  });

  it('main-content 컨테이너를 렌더한다', () => {
    render(<SimpleChatView />);
    expect(screen.getByTestId('simple-chat-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('simple-chat-container')).toBeInTheDocument();
  });

  it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 전송 fetch 본문에 genspark_*가 없다', async () => {
    const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    const fetchMock = jest.mocked(global.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, response: 'ok' }),
    });
    try {
      window.history.replaceState({}, '', '/?id=7c36051a-2b94-4e9e-bd36-05dfabfe3e07');
      render(<SimpleChatView />);
      const input = screen.getByPlaceholderText(/Type '\/' for commands/);
      fireEvent.change(input, { target: { value: '안녕' } });
      fireEvent.click(screen.getByTitle('전송'));
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
      const init = fetchMock.mock.calls[0][1];
      const posted = JSON.parse(init.body);
      expect(posted.context?.genspark_route_agent_id).toBeUndefined();
      expect(posted.context?.genspark_reference_agent_id).toBeUndefined();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
    }
  });
});
