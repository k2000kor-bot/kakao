/**
 * 템플릿·프롬프트 라이브러리 뷰 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /templates
 * 데이터: templatesViewService (목데이터, 추후 API 교체)
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchTemplatesSummary,
  normalizeTemplatesSummary,
  type TemplatesSummary,
} from '../services/templatesViewService';

function TemplatesView() {
  const [summary, setSummary] = useState<TemplatesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('전체');

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
      if (!q) return catOk;
      return catOk && (item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    });
  }, [summary, query, category]);

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
                <div className="bw-tool-chip-row" role="group" aria-label="카테고리 필터">
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
                        filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.category}</td>
                            <td>{item.uses}회</td>
                            <td>{item.favorited ? '★' : '—'}</td>
                            <td>
                              <button type="button" className="bw-btn-secondary">
                                적용
                              </button>
                            </td>
                          </tr>
                        ))
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

        <section className="bw-detail-section" aria-labelledby="templates-favorites-heading">
          <h2 id="templates-favorites-heading" className="bw-detail-section-title">
            즐겨찾기
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              자주 쓰는 템플릿을 즐겨찾기하여 빠르게 적용할 수 있습니다.
            </p>
            {!loading && summary && summary.favoritesCount === 0 && (
              <p className="bw-detail-meta-text bw-mt-sm">
                아직 즐겨찾기가 없습니다. 목록에서 ★가 붙은 항목은 API 연동 후 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TemplatesView;
