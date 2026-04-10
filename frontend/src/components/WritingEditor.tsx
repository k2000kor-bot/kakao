/**
 * 글쓰기 편집기 컴포넌트
 * 생성된 글을 편집하고 개선할 수 있는 기능
 */

import React, { useState } from 'react';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import './WritingEditor.css';

interface WritingEditorProps {
  content: string;
  onSave?: (content: string) => void;
  onImprove?: (type: string) => void;
}

const WritingEditor: React.FC<WritingEditorProps> = ({ content, onSave, onImprove }) => {
  const [editedContent, setEditedContent] = useState<string>(content);
  const [wordCount, setWordCount] = useState<number>(content.split(/\s+/).filter(Boolean).length);
  const [charCount, setCharCount] = useState<number>(content.length);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setWordCount(value.split(/\s+/).filter(Boolean).length);
    setCharCount(value.length);
  };

  const handleSave = () => {
    onSave?.(editedContent);
  };

  const handleImprove = (type: string) => {
    onImprove?.(type);
  };

  const handleFormat = (type: string) => {
    let formatted = editedContent;
    
    switch (type) {
      case 'uppercase':
        formatted = editedContent.toUpperCase();
        break;
      case 'lowercase':
        formatted = editedContent.toLowerCase();
        break;
      case 'capitalize':
        formatted = editedContent
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case 'trim':
        formatted = coerceTrimmedString(editedContent, '');
        break;
      default:
        return;
    }
    
    handleContentChange(formatted);
  };

  return (
    <div className="writing-editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button
            className="toolbar-btn"
            onClick={() => handleImprove('grammar')}
            title="문법 개선"
          >
            ✏️ 문법 개선
          </button>
          <button
            className="toolbar-btn"
            onClick={() => handleImprove('style')}
            title="스타일 개선"
          >
            🎨 스타일 개선
          </button>
          <button
            className="toolbar-btn"
            onClick={() => handleImprove('tone')}
            title="톤 조정"
          >
            🎭 톤 조정
          </button>
        </div>
        <div className="toolbar-right">
          <div className="editor-stats">
            <span>단어: {wordCount}</span>
            <span>글자: {charCount}</span>
          </div>
          <button type="button" className="toolbar-btn save-btn" onClick={handleSave} aria-label="글 저장">
            💾 저장
          </button>
        </div>
      </div>

      <textarea
        className="editor-textarea"
        value={editedContent}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="여기에 글을 작성하세요..."
        aria-label="글 작성 입력"
      />

      <div className="editor-actions">
        <div className="format-buttons">
          <button
            type="button"
            className="format-btn"
            onClick={() => handleFormat('uppercase')}
            title="대문자로 변환"
            aria-label="선택한 텍스트를 대문자로 변환"
          >
            대문자
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => handleFormat('lowercase')}
            title="소문자로 변환"
            aria-label="선택한 텍스트를 소문자로 변환"
          >
            소문자
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => handleFormat('capitalize')}
            title="첫 글자 대문자"
            aria-label="선택한 텍스트의 첫 글자만 대문자로 변환"
          >
            첫 글자 대문자
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => handleFormat('trim')}
            title="공백 제거"
            aria-label="선택한 텍스트의 앞뒤 공백 제거"
          >
            공백 제거
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingEditor;

