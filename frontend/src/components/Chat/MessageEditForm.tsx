/**
 * MessageEditForm 컴포넌트
 * ChatMessage에서 분리된 편집 폼 컴포넌트
 * Task-C1: Cognitive Complexity 감소
 */

import React from 'react';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

interface MessageEditFormProps {
  id: string;
  editingContent: string;
  onEdit: (id: string, content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

export const MessageEditForm: React.FC<MessageEditFormProps> = ({
  id,
  editingContent,
  onEdit,
  onEditSave,
  onEditCancel,
}) => {
  return (
    <div className="message-editing">
      <textarea
        className="message-edit-input"
        value={editingContent}
        onChange={(e) => onEdit(id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onEditSave();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onEditCancel();
          }
        }}
        rows={5}
        autoFocus
        aria-label="메시지 편집 입력창"
        aria-describedby="edit-instructions"
      />
      <div id="edit-instructions" className="sr-only">
        메시지를 편집하세요. Ctrl+Enter로 저장, Escape로 취소합니다.
      </div>
      <div className="message-edit-actions">
        <button
          type="button"
          className="message-edit-btn save"
          onClick={onEditSave}
          disabled={!coerceTrimmedString(editingContent, '')}
          aria-label="저장 및 재전송"
        >
          저장 및 재전송
        </button>
        <button
          type="button"
          className="message-edit-btn cancel"
          onClick={onEditCancel}
          aria-label="편집 취소"
        >
          취소
        </button>
      </div>
    </div>
  );
};

