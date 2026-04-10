import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupCommonMocks } from './test-utils/testHelpers';
import App from './App';

beforeAll(() => {
  setupCommonMocks();
});

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, response: 'ok' }),
    })
  ) as jest.Mock;
});

// 간단한 테스트 - 앱이 렌더링되는지 확인
test('renders app', () => {
  render(<App />);
  // 최소한 뭔가 렌더링되는지 확인
});

test('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 App 전송 fetch 본문에 genspark_*가 없다', async () => {
  const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
  const prevPath = `${window.location.pathname}${window.location.search}`;
  process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
  const fetchMock = jest.mocked(global.fetch);
  try {
    window.history.replaceState({}, '', '/?id=7c36051a-2b94-4e9e-bd36-05dfabfe3e07');
    render(<App />);
    const input = screen.getByPlaceholderText(/CORBU\.AI에게 무엇이든/);
    fireEvent.change(input, { target: { value: '안녕' } });
    fireEvent.click(screen.getByTitle('전송'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const init = fetchMock.mock.calls[0][1] as { body: string };
    const posted = JSON.parse(init.body);
    expect(posted.context?.genspark_route_agent_id).toBeUndefined();
    expect(posted.context?.genspark_reference_agent_id).toBeUndefined();
  } finally {
    window.history.replaceState({}, '', prevPath);
    if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
  }
});
