/**
 * Genspark형 후속 액션(next_actions) 칩 — ChatGPTInterface와 동일 스타일
 */
import React from 'react';

export interface GensparkNextActionChipsProps {
  hints: string[];
  messageId: string;
  onSelectHint: (hint: string) => void;
  borderColor: string;
  textSecondary: string;
}

export const GensparkNextActionChips: React.FC<GensparkNextActionChipsProps> = ({
  hints,
  messageId,
  onSelectHint,
  borderColor,
  textSecondary,
}) => {
  if (!hints.length) return null;

  return (
    <div
      style={{
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      role="group"
      aria-label="다음에 물어보기"
    >
      <span style={{ fontSize: '12px', color: textSecondary }}>
        다음에 물어보기
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {hints.map((hint, hidx) => (
          <button
            key={`follow-${messageId}-${hidx}`}
            type="button"
            onClick={() => onSelectHint(hint)}
            data-testid={`next-action-${hidx}`}
            aria-label={`후속 질문 보내기: ${hint.slice(0, 80)}`}
            style={{
              fontSize: '13px',
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: 'var(--sidebar-dark-input-bg, rgba(0,0,0,0.04))',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              maxWidth: '100%',
            }}
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
};
