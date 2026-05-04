/**
 * 템플릿·프롬프트 라이브러리 뷰 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /templates
 * 데이터: templatesViewService (목데이터, 추후 API 교체)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTemplatesSummary,
  normalizeTemplatesSummary,
  type TemplatesSummary,
} from '../services/templatesViewService';
import { getStandaloneChatPath } from '../config/uiPreferences';
import { showToast } from '../utils/toast';

const CUSTOM_TEMPLATES_KEY = 'corbu.templates.custom';
const RECENT_TEMPLATES_KEY = 'corbu.templates.recent';
const FAV_TEMPLATES_KEY = 'corbu.templates.favorites';
const MAX_RECENT = 5;

function loadFavTemplateIds(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_TEMPLATES_KEY) ?? '[]'); } catch { return []; }
}
function saveFavTemplateIds(ids: string[]) {
  try { localStorage.setItem(FAV_TEMPLATES_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

function loadRecentIds(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_TEMPLATES_KEY) ?? '[]'); } catch { return []; }
}
function pushRecentTemplate(id: string) {
  try {
    const prev = loadRecentIds();
    const next = [id, ...prev.filter((v) => v !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

interface CustomTemplate {
  id: string;
  title: string;
  category: string;
  prompt: string;
  createdAt: string;
}

function loadCustomTemplates(): CustomTemplate[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TEMPLATES_KEY) ?? '[]'); } catch { return []; }
}
function saveCustomTemplates(list: CustomTemplate[]) {
  try { localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

function TemplatesView() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<TemplatesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('전체');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(loadCustomTemplates);
  const [tagFilter, setTagFilter] = useState('전체');
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentIds());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomTemplate | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorCategory, setEditorCategory] = useState('');
  const [editorPrompt, setEditorPrompt] = useState('');
  const [favIds, setFavIds] = useState<string[]>(loadFavTemplateIds);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [tmplSort, setTmplSort] = useState<'newest' | 'oldest' | 'alpha'>('newest');
  // 미리보기 패널
  type PreviewItem = { id: string; title: string; category: string; prompt?: string; isCustom?: boolean };
  const [previewTemplate, setPreviewTemplate] = useState<PreviewItem | null>(null);

  const toggleFav = useCallback((id: string) => {
    setFavIds(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavTemplateIds(next);
      return next;
    });
  }, []);

  const openEditor = (t?: CustomTemplate) => {
    setEditTarget(t ?? null);
    setEditorTitle(t?.title ?? '');
    setEditorCategory(t?.category ?? '');
    setEditorPrompt(t?.prompt ?? '');
    setEditorOpen(true);
  };

  const saveEditor = () => {
    if (!editorTitle.trim() || !editorPrompt.trim()) {
      showToast('제목과 프롬프트를 입력하세요.', 'error');
      return;
    }
    setCustomTemplates((prev) => {
      const next = editTarget
        ? prev.map((t) => t.id === editTarget.id ? { ...t, title: editorTitle, category: editorCategory, prompt: editorPrompt } : t)
        : [{ id: `cust_${Date.now()}`, title: editorTitle, category: editorCategory || '사용자 정의', prompt: editorPrompt, createdAt: new Date().toISOString() }, ...prev];
      saveCustomTemplates(next);
      return next;
    });
    setEditorOpen(false);
    showToast(editTarget ? '템플릿을 수정했습니다.' : '새 템플릿을 추가했습니다.', 'success');
  };

  const deleteCustom = (id: string) => {
    setCustomTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveCustomTemplates(next);
      return next;
    });
    showToast('템플릿을 삭제했습니다.', 'info');
  };

  const applyTemplate = useCallback((prompt: string | undefined, title: string, id?: string) => {
    if (!prompt) {
      showToast('이 템플릿에는 프롬프트가 없습니다.', 'info');
      return;
    }
    if (id) {
      pushRecentTemplate(id);
      setRecentIds(loadRecentIds());
    }
    const chatPath = getStandaloneChatPath();
    navigate(chatPath, { state: { marketingComposerDraft: prompt } });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTemplatesSummary()
      .then((data) => {
        if (!cancelled) setSummary(normalizeTemplatesSummary(data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryLabel = loading
    ? '카테고리: …'
    : summary?.categories?.length
      ? `카테고리: ${summary.categories.join(' · ')}`
      : '카테고리: —';
  const favoritesLabel =
    loading ? '즐겨찾기: …' : summary != null ? `즐겨찾기: ${summary.favoritesCount}개` : '즐겨찾기: —';

  const categoriesWithAll = useMemo(() => {
    if (!summary?.categories.length) return ['전체'];
    return ['전체', ...summary.categories];
  }, [summary]);

  const filteredItems = useMemo(() => {
    if (!summary) return [];
    const q = query.trim().toLowerCase();
    return summary.libraryItems.filter((item) => {
      const catOk = category === '전체' || item.category === category;
      const favOk = !showFavsOnly || favIds.includes(item.id);
      if (!q) return catOk && favOk;
      return catOk && favOk && (item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    });
  }, [summary, query, category, showFavsOnly, favIds]);

  const favLibItems = useMemo(() => {
    if (!summary) return [];
    return summary.libraryItems.filter(item => favIds.includes(item.id));
  }, [summary, favIds]);

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="템플릿"
      data-testid="templates-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">프롬프트·템플릿 라이브러리를 관리하고 재사용할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="templates-library-heading">
          <h2 id="templates-library-heading" className="bw-detail-section-title">
            프롬프트 라이브러리
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              질문은행, 요구사항, 회의록, 체크리스트 등 미리 정의된 프롬프트를 불러와 사용할 수 있습니다.
            </p>
            <div className="bw-detail-meta-row" role="list" aria-label="템플릿 요약">
              <span className="bw-label-block bw-detail-meta-text">{categoryLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{favoritesLabel}</span>
            </div>
            {!loading && summary && (
              <p className="bw-label-block bw-detail-note bw-mt-sm">
                즐겨찾기 개수는 API·로컬 저장 연동 시 반영됩니다. 아래 표는 샘플 라이브러리입니다.
              </p>
            )}
            {!loading && summary && (
              <>
                <div className="bw-tool-toolbar bw-tool-toolbar--search-only bw-mt-md">
                  <label htmlFor="tpl-search" className="sr-only">
                    템플릿 검색
                  </label>
                  <input
                    id="tpl-search"
                    type="search"
                    className="bw-input"
                    placeholder="템플릿 이름·카테고리 검색"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="템플릿 검색"
                  />
                </div>
                <div className="bw-tool-chip-row" role="group" aria-label="카테고리 필터" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {categoriesWithAll.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`bw-tool-chip${category === c ? ' bw-tool-chip--active' : ''}`}
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`bw-tool-chip${showFavsOnly ? ' bw-tool-chip--active' : ''}`}
                    onClick={() => setShowFavsOnly(v => !v)}
                    aria-pressed={showFavsOnly}
                    style={{ background: showFavsOnly ? 'rgba(245,158,11,0.12)' : undefined, color: showFavsOnly ? '#f59e0b' : undefined, borderColor: showFavsOnly ? '#f59e0b' : undefined }}
                  >
                    ⭐ 즐겨찾기{favIds.length > 0 ? ` (${favIds.length})` : ''}
                  </button>
                </div>
                <div className="bw-tool-table-wrap">
                  <table className="bw-tool-table">
                    <caption>템플릿 목록</caption>
                    <thead>
                      <tr>
                        <th scope="col">제목</th>
                        <th scope="col">카테고리</th>
                        <th scope="col">사용</th>
                        <th scope="col">즐겨찾기</th>
                        <th scope="col"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="bw-detail-meta-text">
                            조건에 맞는 템플릿이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => {
                          const isFav = favIds.includes(item.id);
                          const isPreviewing = previewTemplate?.id === item.id;
                          return (
                            <React.Fragment key={item.id}>
                            <tr style={isFav ? { background: 'rgba(245,158,11,0.04)' } : undefined}>
                              <td style={{ fontWeight: isFav ? 600 : undefined }}>
                                {isFav && <span style={{ color: '#f59e0b', marginRight: 4 }}>⭐</span>}
                                <button
                                  type="button"
                                  className="tmpl-preview-title-btn"
                                  onClick={() => setPreviewTemplate(isPreviewing ? null : { id: item.id, title: item.title, category: item.category, prompt: item.prompt })}
                                  aria-expanded={isPreviewing}
                                  title="미리보기"
                                >
                                  {item.title}
                                  <span className="tmpl-preview-chevron" aria-hidden>{isPreviewing ? '▲' : '▼'}</span>
                                </button>
                              </td>
                              <td>{item.category}</td>
                              <td>{item.uses}회</td>
                              <td>
                                <button
                                  type="button"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
                                  onClick={() => toggleFav(item.id)}
                                  aria-label={isFav ? `${item.title} 즐겨찾기 해제` : `${item.title} 즐겨찾기`}
                                  title={isFav ? '즐겨찾기 해제' : '즐겨찾기'}
                                >
                                  {isFav ? '★' : '☆'}
                                </button>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="bw-btn-secondary"
                                  onClick={() => applyTemplate(item.prompt, item.title)}
                                  aria-label={`${item.title} 템플릿 채팅에 적용`}
                                >
                                  적용
                                </button>
                              </td>
                            </tr>
                            {isPreviewing && (
                              <tr>
                                <td colSpan={5} style={{ padding: 0 }}>
                                  <div className="tmpl-preview-panel">
                                    <div className="tmpl-preview-panel-header">
                                      <span className="tmpl-preview-panel-title">📋 프롬프트 미리보기</span>
                                      <button
                                        type="button"
                                        className="bw-btn-primary"
                                        style={{ fontSize: 12, padding: '4px 12px' }}
                                        onClick={() => { applyTemplate(item.prompt, item.title); setPreviewTemplate(null); }}
                                        aria-label={`${item.title} 적용`}
                                      >
                                        ▶ 적용
                                      </button>
                                      <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 13 }}
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.prompt ?? '').then(() => showToast('프롬프트가 복사됐습니다.', 'success'));
                                        }}
                                        title="복사"
                                        aria-label="프롬프트 복사"
                                      >
                                        📋
                                      </button>
                                      <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 12, marginLeft: 'auto' }}
                                        onClick={() => setPreviewTemplate(null)}
                                        aria-label="닫기"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <pre className="tmpl-preview-panel-body">{item.prompt}</pre>
                                  </div>
                                </td>
                              </tr>
                            )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="templates-category-heading">
          <h2 id="templates-category-heading" className="bw-detail-section-title">
            카테고리
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              도시정비·재건축·재개발, 일반 업무, 회의·문서 등 카테고리별로 템플릿을 찾을 수 있습니다.
            </p>
            {!loading && summary && (
              <div className="bw-tool-grid bw-mt-sm">
                {summary.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="bw-tool-tile bw-tool-chip"
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => setCategory(cat)}
                  >
                    <p className="bw-tool-tile-title">{cat}</p>
                    <p className="bw-tool-tile-meta">필터로 이동</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 나만의 템플릿 ── */}
        <section className="bw-detail-section" aria-labelledby="templates-custom-heading">
          <h2 id="templates-custom-heading" className="bw-detail-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>✏️ 나만의 템플릿 ({customTemplates.length})</span>
            <button type="button" className="bw-btn-secondary" style={{ fontSize: 13 }} onClick={() => openEditor()}>
              + 새 템플릿
            </button>
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            {/* 최근 사용 */}
            {recentIds.length > 0 && (() => {
              const recentTmpl = recentIds.map((id) => customTemplates.find((t) => t.id === id)).filter(Boolean) as typeof customTemplates;
              if (recentTmpl.length === 0) return null;
              return (
                <div className="tmpl-recent-row">
                  <span className="tmpl-recent-label">🕓 최근 사용:</span>
                  {recentTmpl.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="tmpl-recent-chip"
                      onClick={() => applyTemplate(t.prompt, t.title, t.id)}
                      title={t.prompt.slice(0, 80)}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* 카테고리 태그 필터 */}
            {customTemplates.length > 0 && (() => {
              const cats = ['전체', ...Array.from(new Set(customTemplates.map((t) => t.category || '기타'))).sort()];
              return (
                <div className="tmpl-tag-filter">
                  {cats.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`tmpl-tag${tagFilter === c ? ' tmpl-tag--active' : ''}`}
                      onClick={() => setTagFilter(c)}
                      aria-pressed={tagFilter === c}
                    >
                      {c}
                      {c !== '전체' && <span className="tmpl-tag-count">{customTemplates.filter((t) => (t.category || '기타') === c).length}</span>}
                    </button>
                  ))}
                </div>
              );
            })()}

            {customTemplates.length === 0 ? (
              <p className="bw-detail-meta-text">아직 나만의 템플릿이 없습니다. "+ 새 템플릿"으로 추가하세요.</p>
            ) : (
              <>
                {/* 정렬 컨트롤 */}
                <div className="tmpl-sort-row">
                  <span className="tmpl-sort-label">정렬:</span>
                  {(['newest', 'oldest', 'alpha'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`tmpl-sort-btn${tmplSort === opt ? ' tmpl-sort-btn--active' : ''}`}
                      onClick={() => setTmplSort(opt)}
                    >
                      {opt === 'newest' ? '최신순' : opt === 'oldest' ? '오래된순' : '이름순'}
                    </button>
                  ))}
                </div>
                <table className="gs-home__table" style={{ width: '100%', marginTop: 6 }}>
                  <thead>
                    <tr>
                      <th scope="col">제목</th>
                      <th scope="col">카테고리</th>
                      <th scope="col">작성일</th>
                      <th scope="col" style={{ width: 140 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customTemplates
                      .filter((t) => tagFilter === '전체' || (t.category || '기타') === tagFilter)
                      .slice()
                      .sort((a, b) => {
                        if (tmplSort === 'alpha') return a.title.localeCompare(b.title, 'ko');
                        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return tmplSort === 'newest' ? db - da : da - db;
                      })
                      .map((t) => (
                      <tr key={t.id} className={recentIds[0] === t.id ? 'tmpl-row--recent' : ''}>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {recentIds.includes(t.id) && <span className="tmpl-recent-dot" title="최근 사용" aria-hidden>●</span>}
                          {t.title}
                        </td>
                        <td><span className="gs-home__badge">{t.category || '기타'}</span></td>
                        <td className="tmpl-created-date">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button type="button" className="bw-btn-secondary" style={{ fontSize: 12 }} onClick={() => applyTemplate(t.prompt, t.title, t.id)}>▶ 적용</button>
                            <button type="button" className="bw-btn-secondary" style={{ fontSize: 12 }} onClick={() => openEditor(t)}>편집</button>
                            <button type="button" className="bw-btn-danger" style={{ fontSize: 12 }} onClick={() => deleteCustom(t.id)}>삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </section>

        {/* 템플릿 편집기 모달 */}
        {editorOpen && (
          <div className="tmpl-modal-overlay" role="dialog" aria-modal="true" aria-label="템플릿 편집기" onClick={(e) => { if (e.target === e.currentTarget) setEditorOpen(false); }}>
            <div className="tmpl-modal">
              <h2 className="tmpl-modal-title">{editTarget ? '템플릿 편집' : '새 템플릿 추가'}</h2>
              <label className="tmpl-field-label" htmlFor="tmpl-title">제목 *</label>
              <input id="tmpl-title" className="tmpl-input" type="text" placeholder="템플릿 제목" value={editorTitle} onChange={(e) => setEditorTitle(e.target.value)} />
              <label className="tmpl-field-label" htmlFor="tmpl-category">카테고리</label>
              <input id="tmpl-category" className="tmpl-input" type="text" placeholder="예: 업무, 회의, 분석" value={editorCategory} onChange={(e) => setEditorCategory(e.target.value)} />
              <label className="tmpl-field-label" htmlFor="tmpl-prompt">프롬프트 내용 *</label>
              <textarea id="tmpl-prompt" className="tmpl-textarea" placeholder="AI에게 전달할 프롬프트를 입력하세요…" value={editorPrompt} onChange={(e) => setEditorPrompt(e.target.value)} rows={6} />
              <div className="tmpl-modal-actions">
                <button type="button" className="bw-btn-secondary" onClick={() => setEditorOpen(false)}>취소</button>
                <button type="button" className="bw-btn-primary" onClick={saveEditor}>저장</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 즐겨찾기 템플릿 ── */}
        {favLibItems.length > 0 && (
          <section className="bw-detail-section" aria-labelledby="templates-favorites-heading">
            <h2 id="templates-favorites-heading" className="bw-detail-section-title">
              ⭐ 즐겨찾기 템플릿 ({favLibItems.length})
            </h2>
            <div className="bw-features-card bw-detail-scroll">
              <div className="tmpl-fav-grid">
                {favLibItems.map(item => (
                  <div key={item.id} className="tmpl-fav-card">
                    <div className="tmpl-fav-card-header">
                      <span className="tmpl-fav-category">{item.category}</span>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#f59e0b', padding: '2px 4px' }}
                        onClick={() => toggleFav(item.id)}
                        aria-label="즐겨찾기 해제"
                        title="즐겨찾기 해제"
                      >
                        ★
                      </button>
                    </div>
                    <p className="tmpl-fav-title">{item.title}</p>
                    {item.prompt && (
                      <p className="tmpl-fav-snippet">{item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '…' : ''}</p>
                    )}
                    <button
                      type="button"
                      className="bw-btn-primary tmpl-fav-apply"
                      onClick={() => applyTemplate(item.prompt, item.title)}
                      aria-label={`${item.title} 적용`}
                    >
                      ▶ 적용
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default TemplatesView;
