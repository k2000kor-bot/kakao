import React, { useEffect, useId, useState } from 'react';
import { downloadMermaidSource } from './conversationGraphMermaidExtract';

export type ConversationGraphMermaidBlockProps = {
  source: string;
};

type MermaidPreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'error' };

/** Mermaid 관계도 — 소스 표시·복사·(가능 시) lazy 미리보기 */
export function ConversationGraphMermaidBlock({ source }: ConversationGraphMermaidBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [preview, setPreview] = useState<MermaidPreviewState>({ status: 'idle' });
  const renderId = useId().replace(/:/g, '');

  useEffect(() => {
    const trimmed = source.trim();
    if (!trimmed) {
      setPreview({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setPreview({ status: 'loading' });

    void (async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
        });
        const { svg } = await mermaid.render(`conversation-graph-mermaid-${renderId}`, trimmed);
        if (!cancelled) {
          setPreview({ status: 'ready', svg });
        }
      } catch {
        if (!cancelled) {
          setPreview({ status: 'error' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderId, source]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const previewReady = preview.status === 'ready';
  const previewLoading = preview.status === 'loading';
  const previewFailed = preview.status === 'error';

  return (
    <div
      className="conversation-graph-mermaid-block"
      data-testid="conversation-graph-mermaid-block"
      style={{
        margin: '12px 0',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-width) solid var(--border-color)',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          fontSize: 'var(--font-size-xs)',
          borderBottom: 'var(--border-width) solid var(--border-color)',
        }}
      >
        <span className="bw-label-block" style={{ margin: 0, fontSize: 12 }}>
          관계도 다이어그램 (Mermaid)
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {previewReady ? (
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ fontSize: 12 }}
              data-testid="conversation-graph-mermaid-toggle-source"
              onClick={() => setShowSource((v) => !v)}
            >
              {showSource ? '미리보기' : '소스'}
            </button>
          ) : null}
          <button type="button" className="bw-btn-secondary" style={{ fontSize: 12 }} onClick={() => void handleCopy()}>
            {copied ? '복사됨' : '복사'}
          </button>
          <button
            type="button"
            className="bw-btn-secondary"
            style={{ fontSize: 12 }}
            data-testid="conversation-graph-mermaid-download"
            onClick={() => downloadMermaidSource(source)}
          >
            .mmd 저장
          </button>
        </div>
      </div>
      {previewLoading ? (
        <p
          className="bw-detail-meta-text"
          style={{ margin: 0, padding: '12px' }}
          data-testid="conversation-graph-mermaid-loading"
        >
          다이어그램 미리보기를 그리는 중…
        </p>
      ) : null}
      {previewReady && !showSource ? (
        <div
          className="conversation-graph-mermaid-preview"
          data-testid="conversation-graph-mermaid-preview"
          style={{ padding: 12, overflow: 'auto', background: 'var(--bg-primary)' }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: preview.svg }}
        />
      ) : null}
      {(showSource || !previewReady || previewFailed) && (
        <pre
          style={{
            margin: 0,
            padding: 12,
            overflow: 'auto',
            fontSize: 12,
            lineHeight: 1.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
          data-testid="conversation-graph-mermaid-source"
        >
          <code>{source}</code>
        </pre>
      )}
      <p className="bw-detail-meta-text" style={{ margin: 0, padding: '8px 12px' }}>
        {previewFailed
          ? '미리보기를 그리지 못했습니다. 소스를 복사해 Mermaid Live Editor 등에서 확인하세요.'
          : '위 족보형 관계도 SVG·매트릭스 보기와 함께 참고하세요.'}
      </p>
    </div>
  );
}
