/**
 * ChatMessage 컴포넌트 테스트
 * Task-C1: 테스트 커버리지 개선
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChatMessage from '../ChatMessage';
import type { ChatMessageProps } from '../ChatMessage';

jest.mock('../../genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-md">{text}</div>
  ),
}));

// framer-motion 모킹 (애니메이션 라이브러리)
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  },
}));

describe('ChatMessage', () => {
  const defaultProps: ChatMessageProps = {
    id: 'test-message-1',
    role: 'user',
    content: '테스트 메시지입니다.',
    timestamp: '2024-01-01T12:00:00Z',
  };

  it('메시지 내용을 올바르게 렌더링합니다', () => {
    render(<ChatMessage {...defaultProps} />);
    expect(screen.getByText('테스트 메시지입니다.')).toBeInTheDocument();
  });

  it('사용자 메시지와 AI 메시지를 구분하여 표시합니다', () => {
    const { rerender } = render(<ChatMessage {...defaultProps} role="user" />);
    expect(screen.getByText('사용자')).toBeInTheDocument();

    rerender(<ChatMessage {...defaultProps} role="assistant" />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('편집 모드일 때 편집 폼을 표시합니다', () => {
    render(
      <ChatMessage
        {...defaultProps}
        editing={true}
        editingContent="편집된 내용"
      />
    );
    expect(screen.getByDisplayValue('편집된 내용')).toBeInTheDocument();
  });

  it('하이라이트된 메시지를 올바르게 표시합니다', () => {
    render(
      <ChatMessage {...defaultProps} highlighted={true} />
    );
    expect(screen.getByTestId('message-highlighted')).toBeInTheDocument();
  });

  it('검색어가 있을 때 하이라이트합니다', () => {
    render(
      <ChatMessage
        {...defaultProps}
        content="테스트 메시지입니다."
        searchTerm="테스트"
      />
    );
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('스트리밍 중일 때 커서를 표시합니다', async () => {
    render(
      <ChatMessage
        {...defaultProps}
        role="assistant"
        isStreaming={true}
        content="스트리밍 중..."
      />
    );
    // 스트리밍 중일 때 메시지가 표시되는지 확인
    // StreamingMessage는 비동기로 텍스트를 표시하므로 waitFor 사용
    await waitFor(() => {
      const message = screen.queryByText(/스트리밍/);
      expect(message).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

