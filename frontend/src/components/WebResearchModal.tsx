/**
 * 웹/Fast Research 모달
 * 검색 쿼리로 웹 연구 수행 후 소스로 추가
 */

import React, { useState, useEffect } from 'react';
import webResearchService, { type WebResearchResult } from '../services/webResearchService';
import { projectService } from '../services/projectService';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { getUserFriendlyError, isValidHttpUrl } from '../utils/errorMessages';
import './WebResearchModal.css';

interface WebResearchModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSourceAdded?: () => void;
}

const WebResearchModal: React.FC<WebResearchModalProps> = ({
  open,
  onClose,
  projectId,
  onSourceAdded,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [loadingElapsedSec, setLoadingElapsedSec] = useState(0);
  const [result, setResult] = useState<WebResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingUrl, setAddingUrl] = useState<string | null>(null);
  const [addSourceError, setAddSourceError] = useState<string | null>(null);

  const handleSearch = async () => {
    const trimmedQuery = coerceTrimmedString(query, '');
    if (!trimmedQuery || loading) return;
    setLoading(true);
    setLoadingStartTime(Date.now());
    setLoadingElapsedSec(0);
    setError(null);
    setResult(null);
    try {
      const res = await webResearchService.performWebResearch(trimmedQuery, {
        project_id: projectId,
      });
      setResult(res);
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error(String(err));
      setError(errObj.message);
      errorLogger.warn('웹 연구 실패', { component: 'WebResearchModal', query: trimmedQuery, error: errObj.message });
    } finally {
      setLoading(false);
      setLoadingStartTime(null);
      setLoadingElapsedSec(0);
    }
  };

  useEffect(() => {
    if (!loading || !loadingStartTime) return;
    const tick = () => setLoadingElapsedSec(Math.floor((Date.now() - loadingStartTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loading, loadingStartTime]);

  const handleAddSource = async (url: string) => {
    const u = coerceTrimmedString(url, '');
    if (!u || addingUrl) return;
    if (!isValidHttpUrl(u)) {
      setAddSourceError('http:// 또는 https://로 시작하는 올바른 URL이 필요합니다.');
      return;
    }
    setAddingUrl(u);
    setAddSourceError(null);
    try {
      const added = await projectService.addNotebookSourceFromUrl(projectId, u);
      if (added) onSourceAdded?.();
      else setAddSourceError('소스 추가에 실패했습니다.');
    } catch (err) {
      setAddSourceError(err instanceof Error ? err.message : '소스 추가에 실패했습니다.');
      errorLogger.warn('소스 추가 실패', { component: 'WebResearchModal', url: u, error: String(err) });
    } finally {
      setAddingUrl(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setAddSourceError(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="web-research-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="web-research-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="web-research-title"
        aria-modal="true"
      >
        <div className="web-research-modal-header">
          <h2 id="web-research-title">웹/Fast Research</h2>
          <button type="button" className="web-research-close" onClick={onClose} aria-label="닫기">
            x
          </button>
        </div>
        <div className="web-research-modal-body">
          <p className="web-research-desc">
            검색어를 입력하면 웹 검색 기반 연구를 수행하고, 결과를 노트북 소스로 추가할 수 있습니다.
          </p>
          <div className="web-research-input-row">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSearch();
                else if (e.key === 'Escape') onClose();
              }}
              placeholder="연구할 주제 또는 질문 입력..."
              className="web-research-input"
              disabled={loading}
              aria-label="검색 쿼리"
              aria-keyshortcuts="Enter 검색, Escape 닫기"
            />
            <button
              type="button"
              className="web-research-search-btn"
              onClick={() => void handleSearch()}
              disabled={loading || !coerceTrimmedString(query, '')}
              aria-busy={loading}
              aria-label="연구 실행"
            >
              {loading ? `연구 중... (${loadingElapsedSec}초)` : '연구 실행'}
            </button>
          </div>
          {error && (() => {
            const errInfo = getUserFriendlyError(new Error(error));
            return (
              <div className="web-research-error" role="alert">
                <div className="web-research-error-message">{errInfo.userMessage}</div>
                {errInfo.suggestions.length > 0 && (
                  <ul className="web-research-error-suggestions" aria-label="해결 제안">
                    {errInfo.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
                {errInfo.canRetry && (
                  <button
                    type="button"
                    className="web-research-retry-btn"
                    onClick={() => {
                      setError(null);
                      void handleSearch();
                    }}
                    disabled={loading}
                    aria-label="다시 시도"
                  >
                    다시 시도
                  </button>
                )}
              </div>
            );
          })()}
          {result && (
            <div className="web-research-result">
              <h3>연구 결과</h3>
              <div className="web-research-summary">
                {result.research_results.research_summary}
              </div>
              {result.research_results.sources && result.research_results.sources.length > 0 ? (
                <div className="web-research-sources">
                  <h4>발견된 소스 (소스로 추가 가능)</h4>
                  <ul>
                    {result.research_results.sources.map((s, i) => (
                      <li key={i} className="web-research-source-item">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="web-research-source-link">
                          {s.title || s.url}
                        </a>
                        <span className="web-research-source-domain">{s.domain}</span>
                        <button
                          type="button"
                          className="web-research-add-btn"
                          onClick={() => void handleAddSource(s.url)}
                          disabled={
                            addingUrl !== null &&
                            coerceTrimmedString(s.url, '') === addingUrl
                          }
                          aria-label="노트북 소스로 추가"
                          title="노트북 소스로 추가"
                        >
                          {addingUrl !== null && coerceTrimmedString(s.url, '') === addingUrl
                            ? '추가 중...'
                            : '소스로 추가'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : result.research_results.research_summary && (
                <p className="web-research-no-sources">
                  발견된 소스가 없습니다. 다른 검색어로 시도해 보세요.
                </p>
              )}
              {addSourceError && (() => {
                const errInfo = getUserFriendlyError(new Error(addSourceError));
                return (
                  <div className="web-research-add-source-error" role="alert">
                    <span>{errInfo.userMessage}</span>
                    {errInfo.suggestions.length > 0 && (
                      <ul className="web-research-add-error-suggestions" aria-label="해결 제안">
                        {errInfo.suggestions.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebResearchModal;
