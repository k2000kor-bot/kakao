/**
 * ChatGPTMainInterface 컴포넌트 테스트
 * ChatGPTMainInterface는 ChatGPT5CompleteInterface의 re-export이므로 기본 렌더링만 확인
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatGPTMainInterface from '../ChatGPTMainInterface';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';

// ChatGPT5CompleteInterface를 모킹 (실제로는 re-export이므로)
jest.mock('../ChatGPT5CompleteInterface', () => {
  return function MockChatGPT5CompleteInterface() {
    return <div data-testid="chatgpt5-complete-interface">ChatGPT5CompleteInterface</div>;
  };
});

describe('ChatGPTMainInterface', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<ChatGPTMainInterface />);

      expect(screen.getByTestId('chatgpt5-complete-interface')).toBeInTheDocument();
    });
  });
});
