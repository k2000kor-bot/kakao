/**
 * CORBU.AI `/agents` 허브 — 히어로 + 공개 URL 스트립 + 에이전트 그리드
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../config/routes';
import { getStandaloneChatPath } from '../config/uiPreferences';
import { TEST_IDS } from '../constants/testIds';
import {
  listRegisteredGensparkAgents,
  PUBLIC_GENSPARK_AGENTS_ORIGIN,
  PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL,
  type GensparkAgentCategory,
} from '../services/gensparkAgentRegistry';
import { GENSPARK_REFERENCE_AGENT_ID, GENSPARK_REFERENCE_AGENT_URL } from '../services/gensparkReferenceAgentPreset';
import writingExporter from '../utils/writingExport';
import { showToast } from '../utils/toast';
import './GensparkAgentsHubView.css';

const ALL_CATEGORIES: GensparkAgentCategory[] = ['전체', '과업', '연동', '분석', '글쓰기'];

const AGENT_FAVS_KEY = 'corbu.agents.favorites';
function loadFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(AGENT_FAVS_KEY) || '[]'); } catch { return []; }
}
function saveFavs(ids: string[]): void {
  localStorage.setItem(AGENT_FAVS_KEY, JSON.stringify(ids));
}

const superAgentInAppPath = `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`;

function agentCardEmoji(displayName: string, index: number): string {
  const base = displayName.trim().charCodeAt(0) || 0;
  const pool = ['✨', '🎯', '🧠', '⚡', '🔮', '🛠️', '📎', '🌐'];
  return pool[(base + index) % pool.length];
}

/** 카드 본문 노이즈 감소 — 전체 ID는 `title`·스크린리더로 제공 */
function formatAgentIdShort(id: string): string {
  const t = id.trim();
  if (t.length <= 14) return t;
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

export default function GensparkAgentsHubView() {
  const allAgents = listRegisteredGensparkAgents();
  const chatPath = getStandaloneChatPath();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GensparkAgentCategory>('전체');
  const [favIds, setFavIds] = useState<string[]>(() => loadFavs());
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  const toggleFav = useCallback((id: string) => {
    setFavIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next);
      return next;
    });
  }, []);

  const favoriteAgents = useMemo(
    () => allAgents.filter((a) => favIds.includes(a.id)),
    [allAgents, favIds]
  );

  // 실제로 에이전트가 있는 카테고리만 탭에 표시
  const availableCategories = useMemo<GensparkAgentCategory[]>(() => {
    const occupied = new Set(allAgents.map((a) => a.category));
    return ALL_CATEGORIES.filter((c) => c === '전체' || occupied.has(c));
  }, [allAgents]);

  const agents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allAgents.filter((a) => {
      const matchesCategory = activeCategory === '전체' || a.category === activeCategory;
      const matchesSearch =
        !q ||
        a.displayName.toLowerCase().includes(q) ||
        a.oneLineDescription.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allAgents, searchQuery, activeCategory]);

  return (
    <main
      id="chat-main-content"
      className="main-content bw-detail-scroll genspark-home"
      tabIndex={-1}
      role="main"
      aria-labelledby="genspark-agents-hub-heading"
      data-testid={TEST_IDS.GENSPARK_AGENTS_HUB}
    >
      <header className="genspark-home-hero">
        <p className="genspark-home-kicker">AI Agents</p>
        <h1 id="genspark-agents-hub-heading" className="genspark-home-title">
          에이전트와 대화를 시작하세요
        </h1>
        <p className="genspark-home-lead">
          <code className="genspark-home-code genspark-home-code--inline">만들어줘</code>{' '}
          처럼 자연어로 지시하면
          앱 안에서 세션을 엽니다.
        </p>
        <div className="genspark-home-hero-actions">
          <Link to={superAgentInAppPath} className="genspark-home-cta-primary">
            Super Agent
          </Link>
          <Link to={chatPath} className="genspark-home-cta-secondary">
            일반 대화
          </Link>
        </div>
      </header>

      <div className="genspark-home-body">
        <div
          className="genspark-home-url-strip"
          role="region"
          aria-label="에이전트 공개 URL"
          data-testid={TEST_IDS.GENSPARK_AGENTS_HUB_URL_STRIP}
        >
          <div className="genspark-home-url-strip-head">
            <span className="genspark-home-url-strip-label">공개 URL (동일 규칙)</span>
            <code className="genspark-home-url-strip-pattern">
              {PUBLIC_GENSPARK_AGENTS_ORIGIN}?{AGENTS_QUERY_PARAM_ID}=…
            </code>
          </div>
          <div className="genspark-home-url-strip-links">
            <a href={PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL} target="_blank" rel="noopener noreferrer">
              Super Agent (공개 사이트)
            </a>
            <span className="genspark-home-url-strip-dot" aria-hidden>
              ·
            </span>
            <a href={GENSPARK_REFERENCE_AGENT_URL} target="_blank" rel="noopener noreferrer">
              참조 에이전트
            </a>
            <span className="genspark-home-url-strip-dot" aria-hidden>
              ·
            </span>
            <Link to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`}>
              앱에서 열기
            </Link>
          </div>
        </div>

        {/* 즐겨찾기 섹션 */}
        {favoriteAgents.length > 0 && (
          <section className="agent-favs-section" aria-labelledby="agent-favs-title">
            <h2 id="agent-favs-title" className="genspark-home-section-title agent-favs-title">
              ⭐ 즐겨찾기 <span className="genspark-home-section-count">({favoriteAgents.length})</span>
            </h2>
            <div className="agent-favs-row">
              {favoriteAgents.map((a, i) => (
                <div key={a.id} className="agent-fav-chip">
                  <span className="agent-fav-chip-emoji" aria-hidden>{agentCardEmoji(a.displayName, i)}</span>
                  <Link
                    to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(a.id)}`}
                    className="agent-fav-chip-name"
                    title={a.displayName}
                  >
                    {a.displayName}
                  </Link>
                  <button
                    type="button"
                    className="agent-fav-chip-remove"
                    aria-label={`${a.displayName} 즐겨찾기 해제`}
                    onClick={() => toggleFav(a.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="genspark-agents-grid-title">
          <div className="genspark-home-section-header">
            <h2 id="genspark-agents-grid-title" className="genspark-home-section-title">
              등록 에이전트 <span className="genspark-home-section-count">({allAgents.length})</span>
            </h2>
            <div className="genspark-home-search-wrap">
              <label htmlFor="agents-search" className="sr-only">에이전트 검색</label>
              <input
                id="agents-search"
                type="search"
                className="genspark-home-search-input"
                placeholder="이름·설명 검색…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="agents-search-input"
              />
            </div>
          </div>
          {/* 카테고리 필터 탭 */}
          <div
            className="genspark-home-category-tabs"
            role="tablist"
            aria-label="에이전트 카테고리 필터"
            data-testid="agents-category-tabs"
          >
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`genspark-home-category-tab${activeCategory === cat ? ' genspark-home-category-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                data-testid={`agents-category-tab-${cat}`}
              >
                {cat}
                {cat !== '전체' && (
                  <span className="genspark-home-category-tab-count">
                    {allAgents.filter((a) => a.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {allAgents.length === 0 ? (
            <div className="genspark-home-empty" role="status">
              <p className="genspark-home-empty-title">등록된 에이전트가 없습니다</p>
              <p className="genspark-home-empty-text">
                <code className="genspark-home-code">gensparkAgentRegistry</code>에 항목을 추가하세요.
              </p>
            </div>
          ) : agents.length === 0 ? (
            <div className="genspark-home-empty" role="status">
              <p className="genspark-home-empty-title">검색 결과가 없습니다</p>
              <p className="genspark-home-empty-text">
                다른 검색어를 입력하거나{' '}
                <button
                  type="button"
                  className="genspark-home-empty-reset"
                  onClick={() => setSearchQuery('')}
                >
                  초기화
                </button>
                하세요.
              </p>
            </div>
          ) : (
            <div className="genspark-home-grid">
              {agents.map((a, i) => (
                <article
                  key={a.id}
                  className={`genspark-home-card${favIds.includes(a.id) ? ' genspark-home-card--fav' : ''}${hoveredAgentId === a.id ? ' genspark-home-card--hovered' : ''}`}
                  tabIndex={-1}
                  onMouseEnter={() => setHoveredAgentId(a.id)}
                  onMouseLeave={() => setHoveredAgentId(null)}
                  style={{ position: 'relative' }}
                >
                  <div className="genspark-home-card-top">
                    <div className="genspark-home-card-avatar" aria-hidden>
                      {agentCardEmoji(a.displayName, i)}
                    </div>
                    <div className="genspark-home-card-head">
                      <h3 className="genspark-home-card-name">{a.displayName}</h3>
                      <button
                        type="button"
                        className={`agent-card-fav-btn${favIds.includes(a.id) ? ' agent-card-fav-btn--active' : ''}`}
                        aria-label={favIds.includes(a.id) ? `${a.displayName} 즐겨찾기 해제` : `${a.displayName} 즐겨찾기 추가`}
                        aria-pressed={favIds.includes(a.id)}
                        onClick={() => toggleFav(a.id)}
                      >
                        {favIds.includes(a.id) ? '⭐' : '☆'}
                      </button>
                      <div className="genspark-home-card-pills">
                        {a.id === GENSPARK_REFERENCE_AGENT_ID && (
                          <span className="genspark-home-card-pill">참조</span>
                        )}
                        {a.category && a.category !== '전체' && (
                          <span className={`genspark-home-card-pill genspark-home-card-pill--cat genspark-home-card-pill--cat-${a.category}`}>
                            {a.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {a.oneLineDescription ? (
                    <p className="genspark-home-card-desc">{a.oneLineDescription}</p>
                  ) : null}
                  <div className="genspark-home-card-id-row">
                    <p
                      className="genspark-home-card-id"
                      title={a.id}
                      aria-label={`에이전트 ID ${a.id}`}
                    >
                      {formatAgentIdShort(a.id)}
                    </p>
                    <button
                      type="button"
                      className="genspark-home-card-copy-id"
                      data-testid={`${TEST_IDS.GENSPARK_AGENTS_HUB_CARD_COPY_ID}-${a.id}`}
                      aria-label={`에이전트 ID ${a.id} 복사`}
                      onClick={() => {
                        void (async () => {
                          const ok = await writingExporter.copyToClipboard(a.id);
                          if (ok) {
                            showToast('에이전트 ID를 복사했습니다.', 'success');
                          } else {
                            showToast('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.', 'info');
                          }
                        })();
                      }}
                    >
                      복사
                    </button>
                  </div>
                  <div className="genspark-home-card-actions">
                    <Link
                      to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(a.id)}`}
                      className="genspark-home-card-btn genspark-home-card-btn--primary"
                    >
                      대화 시작
                    </Link>
                    <a
                      href={a.url}
                      className="genspark-home-card-btn genspark-home-card-btn--ghost"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      공개 사이트에서 열기
                    </a>
                  </div>
                  {/* 호버 미리보기 팝오버 */}
                  {hoveredAgentId === a.id && a.oneLineDescription && (
                    <div className="agent-card-preview-pop" role="tooltip">
                      <p className="agent-card-preview-label">📝 에이전트 설명</p>
                      <p className="agent-card-preview-text">
                        {a.oneLineDescription.slice(0, 200)}
                        {a.oneLineDescription.length > 200 ? '…' : ''}
                      </p>
                      {a.category && (
                        <span className="agent-card-preview-cat">{a.category}</span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
