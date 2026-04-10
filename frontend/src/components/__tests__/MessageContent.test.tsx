/**
 * MessageContent 컴포넌트 테스트
 * 메시지 내용 렌더링 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import { MessageContent } from '../Chat/MessageContent';
import { ASSISTANT_PLACEHOLDER_DRAFT } from '../../utils/chatInputUtils';

// Mock StreamingMessage
jest.mock('../Chat/StreamingMessage', () => {
  return function MockStreamingMessage({ content }: { content: string }) {
    return <div data-testid="streaming-message">Streaming: {content}</div>;
  };
});

jest.mock('../genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-md">{text}</div>
  ),
}));

jest.mock('../genspark/GensparkGenerationStatus', () => ({
  GensparkGenerationStatus: ({
    variant,
    phase,
  }: {
    variant: string;
    phase?: string;
  }) => (
    <div
      data-testid="genspark-generation-status"
      data-variant={variant}
      data-phase={phase ?? ''}
    />
  ),
}));

describe('MessageContent', () => {
  const mockHighlightText = jest.fn((text: string) => text);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('assistant 역할일 때 GensparkAnswerMarkdown으로 렌더해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content="# Hello World"
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('genspark-answer-md')).toBeInTheDocument();
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

    it('isStreaming이 false일 때 GensparkAnswerMarkdown을 사용해야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content="# Markdown content"
          isStreaming={false}
          highlightText={mockHighlightText}
        />
      );

      expect(screen.getByTestId('genspark-answer-md')).toBeInTheDocument();
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

      const gen = screen.getByTestId('genspark-generation-status');
      expect(gen).toBeInTheDocument();
      expect(gen).toHaveAttribute('data-variant', 'initial');
      expect(screen.queryByTestId('genspark-answer-md')).not.toBeInTheDocument();
    });

    it('생성 플레이스홀더 본문이면 GensparkGenerationStatus(step)를 써야 함', () => {
      render(
        <MessageContent
          role="assistant"
          content={ASSISTANT_PLACEHOLDER_DRAFT}
          highlightText={mockHighlightText}
        />
      );

      const gen = screen.getByTestId('genspark-generation-status');
      expect(gen).toHaveAttribute('data-variant', 'step');
      expect(gen).toHaveAttribute('data-phase', 'draft');
      expect(screen.queryByTestId('genspark-answer-md')).not.toBeInTheDocument();
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

      expect(screen.getByTestId('genspark-answer-md')).toBeInTheDocument();
    });
  });
});

