/**
 * Genspark형 답변 본문 — react-markdown + GFM (표·체크리스트·코드)
 * 메인 대화와 Ultimate 동일한 타이포·코드 블록 UX(복사·언어 헤더) 지원
 */
import React, { useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { coerceTrimmedString } from '../../utils/chatInputUtils';
import { rehypeHighlightSearch } from '../../utils/rehypeHighlightSearch';

const MarkdownCodeBlock: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        margin: '12px 0',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'var(--code-block-bg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          backgroundColor: 'var(--code-block-header)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--code-muted)',
        }}
      >
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label="코드 복사"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--accent-success)' : 'var(--code-muted)',
            cursor: 'pointer',
            fontSize: '12px',
            borderRadius: '4px',
            transition: 'all 0.2s',
          }}
          title="코드 복사"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
              </svg>
              복사
            </>
          )}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '12px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.5',
        }}
      >
        <code className={className} style={{ color: 'var(--code-block-text)' }}>
          {children}
        </code>
      </pre>
    </div>
  );
};

/** 인라인 `code` — enhanced 브랜치에서 baseComponents.code를 호출하지 않도록 분리 (TS Components 유니온 호환) */
const GensparkInlineCode: React.FC<
  React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
> = ({ children, ...props }) => (
  <code
    style={{
      padding: '2px 6px',
      borderRadius: 4,
      fontSize: '0.9em',
      background: 'var(--bg-active, rgba(0,0,0,0.06))',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }}
    {...props}
  >
    {children}
  </code>
);

const baseComponents: Components = {
  p: ({ children }) => (
    <p style={{ margin: '0 0 0.75em', whiteSpace: 'pre-wrap' }}>{children}</p>
  ),
  ul: ({ children }) => <ul style={{ margin: '0 0 0.75em', paddingLeft: '1.35em' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0 0 0.75em', paddingLeft: '1.35em' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: '0.25em' }}>{children}</li>,
  h1: ({ children }) => (
    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '1em 0 0.5em', lineHeight: 1.35 }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1em 0 0.5em', lineHeight: 1.35 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '1em 0 0.5em', lineHeight: 1.35 }}>{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '0.75em 0',
        paddingLeft: '1em',
        borderLeft: '3px solid var(--accent-info-muted, rgba(59,130,246,0.4))',
        color: 'var(--text-secondary, #6b7280)',
      }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--accent-info, #2563eb)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src || ''}
      alt={alt || '이미지'}
      className="message-image"
      loading="lazy"
      style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, margin: '0.5em 0', display: 'block' }}
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = 'none';
      }}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <GensparkInlineCode {...props}>{children}</GensparkInlineCode>
      );
    }
    return (
      <code
        className={className}
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.88em' }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      style={{
        margin: '0.75em 0',
        padding: 'var(--spacing-md, 12px)',
        borderRadius: 'var(--radius-md, 8px)',
        background: 'var(--bg-tertiary, #f3f4f6)',
        border: '1px solid var(--border-color, #e5e7eb)',
        overflowX: 'auto',
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0.75em 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid var(--border-color)',
        padding: '6px 10px',
        textAlign: 'left',
        background: 'var(--bg-secondary)',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid var(--border-color)', padding: '6px 10px', textAlign: 'left' }}>{children}</td>
  ),
};

export interface GensparkAnswerMarkdownProps {
  text: string;
  className?: string;
  /** 메시지 내 검색어 하이라이트 */
  searchTerm?: string;
  /** 펜스 코드 블록에 복사·언어 헤더 (메인 대화와 동일 UX) */
  enhancedCodeBlocks?: boolean;
}

export const GensparkAnswerMarkdown: React.FC<GensparkAnswerMarkdownProps> = ({
  text,
  className,
  searchTerm,
  enhancedCodeBlocks = false,
}) => {
  const term = coerceTrimmedString(searchTerm ?? '', '');
  type RMRehype = NonNullable<React.ComponentProps<typeof ReactMarkdown>['rehypePlugins']>;
  const rehypePlugins = useMemo((): RMRehype => {
    if (!term) return [];
    return [[rehypeHighlightSearch, { searchTerm: term }]] as RMRehype;
  }, [term]);

  const components = useMemo(() => {
    if (!enhancedCodeBlocks) return baseComponents;
    return {
      ...baseComponents,
      pre: ({ children }) => <>{children}</>,
      code: ({ className: cn, children, ...props }) => {
        const isInline = !cn;
        if (isInline) {
          return <GensparkInlineCode {...props}>{children}</GensparkInlineCode>;
        }
        return <MarkdownCodeBlock className={cn}>{children}</MarkdownCodeBlock>;
      },
    } as Components;
  }, [enhancedCodeBlocks]);

  return (
    <div className={className ?? 'genspark-md-body'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
