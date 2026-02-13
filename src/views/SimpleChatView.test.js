/**
 * 간단 채팅 뷰 테스트
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('CORBU AI')).toBeInTheDocument();
    expect(screen.getByText(/안녕하세요! CORBU AI입니다/)).toBeInTheDocument();
  });

  it('채팅 입력과 전송 버튼을 렌더한다', () => {
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
});
