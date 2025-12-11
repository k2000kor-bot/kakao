/**
 * MessageContent 컴포넌트 테스트
 * 메시지 내용 렌더링 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessageContent } from '../Chat/MessageContent';

// Mock StreamingMessage
jest.mock('../Chat/StreamingMessage', () => {
  return function MockStreamingMessage({ content, isStreaming }: any) {
    return <div data-testid="streaming-message">Streaming: {content}</div>;
  };
});

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: any) {
    return <div data-testid="react-markdown">{children}</div>;
  };
});

// Mock remark-gfm
jest.mock('remark-gfm', () => {
  return jest.fn();
});

describe('MessageContent', () => {
  const mockHighlightText = jest.fn((text: string) => text);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('assistant 역할일 때 ReactMarkdown을 사용해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content="# Hello World"
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
      expect(screen.getByText('# Hello World')).toBeInTheDocument();
    });

    it('user 역할일 때 일반 텍스트를 렌더링해야 함', () => {
      render(
        <MessageContent
          role="user"
          content="Hello World"
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('스트리밍 메시지', () => {
    it('isStreaming이 true일 때 StreamingMessage를 사용해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content="Streaming content"
          isStreaming={true}
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('streaming-message')).toBeInTheDocument();
      expect(screen.getByText(/Streaming: Streaming content/)).toBeInTheDocument();
    });

    it('isStreaming이 false일 때 ReactMarkdown을 사용해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content="# Markdown content"
          isStreaming={false}
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
      expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument();
    });
  });

  describe('텍스트 하이라이트', () => {
    it('user 역할에서 searchTerm이 있을 때 highlightText를 호출해야 함', () => {
      const highlightText = jest.fn((text: string) => <span>{text}</span>);

      render(
        <MessageContent
          role="user"
          content="Hello World"
          searchTerm="Hello"
          highlightText={highlightText}
        />
      );

      expect(highlightText).toHaveBeenCalledWith('Hello World', 'Hello');
    });

    it('user 역할에서 searchTerm이 없을 때 highlightText를 호출하지 않아야 함', () => {
      const highlightText = jest.fn((text: string) => text);

      render(
        <MessageContent
          role="user"
          content="Hello World"
          highlightText={highlightText}
        />
      );

      // searchTerm이 없으면 highlightText를 호출하지 않고 직접 렌더링
      expect(highlightText).not.toHaveBeenCalled();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('다양한 콘텐츠 타입', () => {
    it('긴 텍스트를 올바르게 렌더링해야 함', () => {
      const longContent = 'A'.repeat(1000);

      render(
        <MessageContent
          role="assistant"
          content={longContent}
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('빈 문자열을 올바르게 처리해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content=""
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    it('마크다운 콘텐츠를 올바르게 렌더링해야 함', () => {
      const markdownContent = `# Heading
**Bold text**
*Italic text*
\`\`\`code\`\`\``;

      render(
        <MessageContent
          role="assistant"
          content={markdownContent}
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });
  });
});

