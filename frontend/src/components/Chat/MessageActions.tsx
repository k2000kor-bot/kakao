/**
 * MessageActions 컴포넌트
 * ChatMessage에서 분리된 액션 버튼 컴포넌트
 * Task-C1: Cognitive Complexity 감소
 */

import React from 'react';

interface MessageActionsProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  copySuccess: boolean;
  showDeleteConfirm: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onLoadToInput?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  id,
  role,
  content: _content,
  copySuccess,
  showDeleteConfirm,
  onCopy,
  onRegenerate,
  onLoadToInput,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="message-actions">
      {role === 'assistant' && (
        <>
          {onCopy && (
            <button
              type="button"
              className={`action-btn ${copySuccess ? 'copy-success' : ''}`}
              onClick={onCopy}
              title="복사 (Ctrl+C)"
              aria-label="메시지 복사"
              data-message-id={id}
              style={copySuccess ? { color: 'var(--accent-success)' } : {}}
            >
              {copySuccess ? '✓' : '📋'}
            </button>
          )}
          {onRegenerate && (
            <button
              type="button"
              className="action-btn"
              onClick={onRegenerate}
              title="다시 생성"
              aria-label="메시지 다시 생성"
            >
              ↻
            </button>
          )}
        </>
      )}
      {onLoadToInput && (
        <button
          type="button"
          className="action-btn"
          onClick={onLoadToInput}
          title="입력창으로 불러오기"
          aria-label="메시지를 입력창으로 불러오기"
        >
          🔄
        </button>
      )}
      {onEdit && role === 'user' && (
        <button
          type="button"
          className="action-btn"
          onClick={onEdit}
          title="수정"
          aria-label="메시지 수정"
        >
          ✏️
        </button>
      )}
      {onCopy && role === 'user' && (
        <button
          type="button"
          className={`action-btn ${copySuccess ? 'copy-success' : ''}`}
          onClick={onCopy}
          title="복사 (Ctrl+C)"
          aria-label="메시지 복사"
          data-message-id={id}
          style={copySuccess ? { color: 'var(--accent-success)' } : {}}
        >
          {copySuccess ? '✓' : '📋'}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className={`action-btn ${showDeleteConfirm ? 'delete-confirm' : ''}`}
          onClick={onDelete}
          title={showDeleteConfirm ? "확인하려면 다시 클릭" : "삭제"}
          aria-label="메시지 삭제"
          style={showDeleteConfirm ? { color: 'var(--accent-error)', backgroundColor: 'var(--accent-error-muted)' } : {}}
        >
          {showDeleteConfirm ? '✓ 삭제' : '🗑️'}
        </button>
      )}
    </div>
  );
};

