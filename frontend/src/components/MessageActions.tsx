/**
 * 메시지 액션 컴포넌트
 * 복사, 재생성, 좋아요/싫어요 등의 액션 제공
 * 
 * Task-C2: 대화 메시지 액션 개선
 */

import React, { useState } from 'react';
import { errorLogger } from '../utils/errorLogger';
import './MessageActions.css';

interface MessageActionsProps {
  messageId: number;
  messageText: string;
  sessionId?: string;
  onCopy?: (text: string) => void;
  onRegenerate?: (messageId: number) => void;
  onModifyRequest?: (messageId: number) => void; // 수정 요청 핸들러 추가
  onEdit?: (messageId: number) => void;
  onReply?: (messageId: number) => void;
  onLike?: (messageId: number) => void;
  onDislike?: (messageId: number) => void;
  onBookmark?: (messageId: number) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  showActions?: boolean;
  canEdit?: boolean; // 편집 가능 여부 (사용자 메시지만 편집 가능)
  isAssistant?: boolean; // AI 응답인지 여부
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  messageText,
  sessionId: _sessionId,
  onCopy,
  onRegenerate,
  onModifyRequest,
  onEdit,
  onReply,
  onLike,
  onDislike,
  onBookmark,
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
  showActions = false,
  canEdit = false,
  isAssistant = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) {
        onCopy(messageText);
      }
    }).catch((err) => {
      errorLogger.error('복사 실패', err);
    });
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(messageId);
    }
  };

  const handleModifyRequest = () => {
    if (onModifyRequest) {
      onModifyRequest(messageId);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(messageId);
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike(messageId);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(messageId);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(messageId);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(messageId);
    }
  };

  if (!showActions) {
    return null;
  }

  return (
    <div className="message-actions">
      <button
        className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title="복사"
        aria-label="메시지 복사"
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            복사됨
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            복사
          </>
        )}
      </button>

      {canEdit && onEdit && (
        <button
          className="action-btn edit-btn"
          onClick={handleEdit}
          title="편집"
          aria-label="메시지 편집"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          편집
        </button>
      )}

      {onReply && (
        <button
          className="action-btn reply-btn"
          onClick={handleReply}
          title="답장"
          aria-label="메시지에 답장"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 10 4 15 9 20" />
            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
          </svg>
          답장
        </button>
      )}

      {onRegenerate && (
        <button
          className="action-btn regenerate-btn"
          onClick={handleRegenerate}
          title="재생성"
          aria-label="응답 재생성"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          재생성
        </button>
      )}

      {onModifyRequest && isAssistant && (
        <button
          className="action-btn modify-request-btn"
          onClick={handleModifyRequest}
          title="수정 요청"
          aria-label="응답 수정 요청"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          수정 요청
        </button>
      )}

      {onLike && (
        <button
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          title={isLiked ? '좋아요 취소' : '좋아요'}
          aria-label={isLiked ? '좋아요 취소' : '좋아요'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isLiked ? '좋아요 취소' : '좋아요'}
        </button>
      )}

      {onDislike && (
        <button
          className={`action-btn dislike-btn ${isDisliked ? 'disliked' : ''}`}
          onClick={handleDislike}
          title={isDisliked ? '싫어요 취소' : '싫어요'}
          aria-label={isDisliked ? '싫어요 취소' : '싫어요'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isDisliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
          </svg>
          {isDisliked ? '싫어요 취소' : '싫어요'}
        </button>
      )}

      {onBookmark && (
        <button
          className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          title={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
          aria-label={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isBookmarked ? '즐겨찾기 제거' : '즐겨찾기'}
        </button>
      )}
    </div>
  );
};

export default MessageActions;

