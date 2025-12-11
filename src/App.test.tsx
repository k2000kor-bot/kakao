import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// scrollIntoView 모킹
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

// 간단한 테스트 - 앱이 렌더링되는지 확인
test('renders app', () => {
  render(<App />);
  // 최소한 뭔가 렌더링되는지 확인
});
