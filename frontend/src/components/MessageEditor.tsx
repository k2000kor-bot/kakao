/**
 * 메시지 편집 컴포넌트
 * 메시지를 인라인으로 편집할 수 있는 기능 제공
 * 
 * Task-H1: 메시지 편집 기능 추가
 */

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import './MessageEditor.css';

interface MessageEditorProps {
  /**
   * 초기 텍스트
   */
  initialText: string;
  
  /**
   * 편집 완료 시 호출되는 콜백
   */
  onSave: (newText: string) => void;
  
  /**
   * 편집 취소 시 호출되는 콜백
   */
  onCancel: () => void;
  
  /**
   * 자동 포커스 여부
   */
  autoFocus?: boolean;
  
  /**
   * 최소 높이 (px)
   */
  minHeight?: number;
  
  /**
   * 최대 높이 (px)
   */
  maxHeight?: number;
}

const MessageEditor: React.FC<MessageEditorProps> = ({
  initialText,
  onSave,
  onCancel,
  autoFocus = true,
  minHeight = 60,
  maxHeight = 300,
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // 커서를 끝으로 이동
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus]);

  useEffect(() => {
    // 텍스트 영역 높이 자동 조절
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text, minHeight, maxHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter: 저장
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    // Escape: 취소
    else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    const trimmedText = coerceTrimmedString(text, '');
    const initialTrimmed = coerceTrimmedString(initialText, '');
    if (trimmedText && trimmedText !== initialTrimmed) {
      onSave(trimmedText);
    } else if (trimmedText === initialTrimmed) {
      // 변경사항이 없으면 취소
      onCancel();
    }
  };

  const handleCancel = () => {
    setText(initialText);
    onCancel();
  };

  return (
    <div className="message-editor" role="textbox" aria-label="메시지 편집">
      <textarea
        ref={textareaRef}
        className="message-editor-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 편집하세요..."
        rows={1}
        aria-label="메시지 편집 입력창"
      />
      <div className="message-editor-actions">
        <div className="message-editor-hint">
          <span>Ctrl/Cmd + Enter: 저장</span>
          <span>Esc: 취소</span>
        </div>
        <div className="message-editor-buttons">
          <button
            type="button"
            className="message-editor-btn message-editor-btn-save"
            onClick={() => handleSave()}
            disabled={
              !coerceTrimmedString(text, '') ||
              coerceTrimmedString(text, '') === coerceTrimmedString(initialText, '')
            }
            aria-label="저장"
          >
            저장
          </button>
          <button
            type="button"
            className="message-editor-btn message-editor-btn-cancel"
            onClick={handleCancel}
            aria-label="취소"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;

