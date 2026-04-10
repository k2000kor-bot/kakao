/**
 * 메시지 인용/답장 컴포넌트
 * 다른 메시지를 인용하여 답장하는 기능 제공
 * 
 * Task-H1: 메시지 인용/답장 기능 추가
 */

import React from 'react';
import './MessageReply.css';

export interface QuotedMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface MessageReplyProps {
  /**
   * 인용된 메시지
   */
  quotedMessage: QuotedMessage;
  
  /**
   * 닫기 버튼 클릭 시 호출
   */
  onClose?: () => void;
  
  /**
   * 컴팩트 모드 (작은 크기로 표시)
   */
  compact?: boolean;
}

const MessageReply: React.FC<MessageReplyProps> = ({
  quotedMessage,
  onClose,
  compact = false,
}) => {
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayText = compact
    ? truncateText(quotedMessage.text, 100)
    : quotedMessage.text;

  return (
    <div className={`message-reply ${compact ? 'compact' : ''}`} role="region" aria-label="인용된 메시지">
      <div className="message-reply-header">
        <div className="message-reply-info">
          <span className="message-reply-sender">
            {quotedMessage.sender === 'user' ? '👤 사용자' : '🤖 AI'}
          </span>
          <span className="message-reply-time" aria-label={`인용된 메시지 시간: ${quotedMessage.timestamp}`}>
            {quotedMessage.timestamp}
          </span>
        </div>
        {onClose && (
          <button
            className="message-reply-close"
            onClick={onClose}
            aria-label="인용 닫기"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <div className="message-reply-content" style={{ whiteSpace: 'pre-line' }}>
        {displayText}
      </div>
    </div>
  );
};

export default MessageReply;

