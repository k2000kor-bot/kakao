/**
 * MessageContent 컴포넌트
 * ChatMessage에서 분리된 메시지 내용 렌더링 컴포넌트
 * Task-C1: Cognitive Complexity 감소
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import StreamingMessage from './StreamingMessage';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  role: 'user' | 'assistant';
  content: string;
  searchTerm?: string;
  isStreaming?: boolean;
  highlightText: (text: string, searchTerm?: string) => React.ReactNode;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  role,
  content,
  searchTerm,
  isStreaming,
  highlightText,
}) => {
  return (
    <div className="message-text">
      {role === 'assistant' ? (
        isStreaming ? (
          <StreamingMessage
            content={content}
            isStreaming={isStreaming}
          />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )
      ) : (
        <p>{searchTerm ? highlightText(content, searchTerm) : content}</p>
      )}
    </div>
  );
};
