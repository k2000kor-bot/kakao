/**
 * Deep Research 모달 - 심층 보고서 생성 (web-research API 연동)
 */

import React, { useState, useEffect } from 'react';
import webResearchService, { type WebResearchResult } from '../services/webResearchService';
import { projectService } from '../services/projectService';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { getUserFriendlyError, isValidHttpUrl } from '../utils/errorMessages';
import './DeepResearchModal.css';

interface DeepResearchModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSourceAdded?: () => void;
}

const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
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

  const handleResearch = async () => {
    const trimmedQuery = coerceTrimmedString(query, '');
    if (!trimmedQuery || loading) return;
    setLoading(true);
    setLoadingStartTime(Date.now());
    setLoadingElapsedSec(0);
    setError(null);
    setResult(null);
    const researchQuestion = `다음 주제에 대한 심층 보고서를 작성해주세요. 상세한 분석, 근거, 논리적 검토, 결론을 포함해주세요:\n\n${trimmedQuery}`;
    try {
      const res = await webResearchService.performWebResearch(researchQuestion, {
        project_id: projectId,
      });
      setResult(res);
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error(String(err));
      setError(errObj.message);
      errorLogger.warn('Deep Research 실패', { component: 'DeepResearchModal', query: trimmedQuery, error: errObj.message });
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
      errorLogger.warn('소스 추가 실패', { component: 'DeepResearchModal', url: u, error: String(err) });
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

  const formattedReport = result ? webResearchService.formatWebResearchResponse(result) : '';

  return (
    <div className="deep-research-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="deep-research-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="deep-research-title"
        aria-modal="true"
      >
        <div className="deep-research-modal-header">
          <h2 id="deep-research-title">Deep Research</h2>
          <button type="button" className="deep-research-close" onClick={onClose} aria-label="닫기">x</button>
        </div>
        <div className="deep-research-modal-body">
          <p className="deep-research-desc">
            주제를 입력하면 웹 검색 기반 심층 보고서를 생성합니다. 발견된 소스를 노트북에 추가할 수 있습니다.
          </p>
          <div className="deep-research-input-row">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleResearch();
                else if (e.key === 'Escape') onClose();
              }}
              placeholder="심층 분석할 주제 또는 질문..."
              className="deep-research-input"
              disabled={loading}
              aria-label="연구 주제"
              aria-keyshortcuts="Enter 실행, Escape 닫기"
            />
            <button
              type="button"
              className="deep-research-run-btn"
              onClick={() => void handleResearch()}
              disabled={loading || !coerceTrimmedString(query, '')}
              aria-busy={loading}
              aria-label="심층 보고서 생성"
            >
              {loading ? `보고서 생성 중... (${loadingElapsedSec}초)` : '심층 보고서 생성'}
            </button>
          </div>
          {error && (() => {
            const errInfo = getUserFriendlyError(new Error(error));
            return (
              <div className="deep-research-error" role="alert">
                <div className="deep-research-error-message">{errInfo.userMessage}</div>
                {errInfo.suggestions.length > 0 && (
                  <ul className="deep-research-error-suggestions" aria-label="해결 제안">
                    {errInfo.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
                {errInfo.canRetry && (
                  <button
                    type="button"
                    className="deep-research-retry-btn"
                    onClick={() => {
                      setError(null);
                      void handleResearch();
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
            <div className="deep-research-result">
              <h3>심층 보고서</h3>
              <div className="deep-research-report">{formattedReport}</div>
              {result.research_results.sources && result.research_results.sources.length > 0 ? (
                <div className="deep-research-sources">
                  <h4>참고 소스 (노트북에 추가 가능)</h4>
                  <ul>
                    {result.research_results.sources.map((s, i) => (
                      <li key={i} className="deep-research-source-item">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="deep-research-source-link">{s.title || s.url}</a>
                        <span className="deep-research-source-domain">{s.domain}</span>
                        <button
                          type="button"
                          className="deep-research-add-btn"
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
              ) : (
                <p className="deep-research-no-sources">
                  발견된 참고 소스가 없습니다. 다른 주제로 시도해 보세요.
                </p>
              )}
              {addSourceError && (() => {
                const errInfo = getUserFriendlyError(new Error(addSourceError));
                return (
                  <div className="deep-research-add-source-error" role="alert">
                    <span>{errInfo.userMessage}</span>
                    {errInfo.suggestions.length > 0 && (
                      <ul className="deep-research-add-error-suggestions" aria-label="해결 제안">
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

export default DeepResearchModal;
