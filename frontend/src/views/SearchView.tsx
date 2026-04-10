/**
 * 전역 검색·디스커버리 뷰 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /search
 * 데이터: searchViewService (목데이터, 추후 API 교체)
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchSearchSummary,
  normalizeSearchSummary,
  type SearchSummary,
} from '../services/searchViewService';

function SearchView() {
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('전체');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSearchSummary()
      .then((data) => {
        if (!cancelled) setSummary(normalizeSearchSummary(data));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const targetLabel = loading ? '검색 대상: …' : summary ? `검색 대상: ${summary.searchTarget}` : '검색 대상: —';
  const recentLabel = loading
    ? '최근 검색어: …'
    : summary?.recentQueries?.length
      ? `최근 검색어: ${summary.recentQueries.slice(0, 5).join(', ')}`
      : '최근 검색어: —';

  const filteredSpotlight = useMemo(() => {
    if (!summary) return [];
    const q = query.trim().toLowerCase();
    return summary.spotlight.filter((row) => {
      const scopeOk = scope === '전체' || row.type === scope;
      if (!q) return scopeOk;
      const inText =
        row.title.toLowerCase().includes(q) || row.snippet.toLowerCase().includes(q);
      return scopeOk && inText;
    });
  }, [summary, query, scope]);

  const scopes = summary?.filterScopes ?? ['전체', '대화', '프로젝트', '문서'];

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="검색"
      data-testid="search-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">대화·프로젝트·문서를 한곳에서 검색할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="search-global-heading">
          <h2 id="search-global-heading" className="bw-detail-section-title">
            전역 검색
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              대화 내용, 프로젝트 이름, 첨부 문서를 키워드로 검색합니다.
            </p>
            <div className="bw-detail-meta-row" role="list" aria-label="검색 예시">
              <span className="bw-label-block bw-detail-meta-text">{targetLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{recentLabel}</span>
            </div>
            {!loading && summary && (
              <>
                <div className="bw-tool-toolbar bw-tool-toolbar--search-only bw-mt-md">
                  <label htmlFor="search-global-q" className="sr-only">
                    검색어
                  </label>
                  <input
                    id="search-global-q"
                    type="search"
                    className="bw-input"
                    placeholder="예: 재건축, 회의록, 사업시행계획"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="전역 검색어"
                  />
                </div>
                <div className="bw-tool-chip-row" role="group" aria-label="검색 범위">
                  {scopes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`bw-tool-chip${scope === s ? ' bw-tool-chip--active' : ''}`}
                      onClick={() => setScope(s)}
                      aria-pressed={scope === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="bw-tool-table-wrap">
                  <table className="bw-tool-table">
                    <caption>검색 결과 (데모 데이터, 키워드·범위로 필터)</caption>
                    <thead>
                      <tr>
                        <th scope="col">유형</th>
                        <th scope="col">제목</th>
                        <th scope="col">요약</th>
                        <th scope="col">수정일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpotlight.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="bw-detail-meta-text">
                            조건에 맞는 항목이 없습니다. 검색어를 바꾸거나 범위를 &quot;전체&quot;로
                            선택해 보세요.
                          </td>
                        </tr>
                      ) : (
                        filteredSpotlight.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <span className="bw-badge-soft">{row.type}</span>
                            </td>
                            <td>{row.title}</td>
                            <td>{row.snippet}</td>
                            <td>{row.updatedAt}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!summary.recentQueries.length && (
                  <p className="bw-label-block bw-detail-note bw-mt-sm">
                    검색을 사용하면 최근 검색어가 상단 메타 영역에 쌓입니다. 지금 표는 API 연동 전
                    샘플입니다.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="search-recent-heading">
          <h2 id="search-recent-heading" className="bw-detail-section-title">
            최근 검색
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              최근 검색어와 자주 찾은 항목이 여기에 표시됩니다.
            </p>
            {!loading && summary && (
              <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: '1.2rem' }}>
                {summary.recentQueries.length ? (
                  summary.recentQueries.map((q) => <li key={q}>{q}</li>)
                ) : (
                  <li>아직 최근 검색이 없습니다. 위 검색창에서 키워드를 입력해 보세요.</li>
                )}
              </ul>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="search-discovery-heading">
          <h2 id="search-discovery-heading" className="bw-detail-section-title">
            추천·디스커버리
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              태그·프로젝트 유형별 추천과 인기 템플릿을 확인할 수 있습니다.
            </p>
            {!loading && summary && (
              <div className="bw-tool-grid">
                {summary.popularTemplates.map((t) => (
                  <div key={t.title} className="bw-tool-tile">
                    <p className="bw-tool-tile-title">{t.title}</p>
                    <p className="bw-tool-tile-meta">사용 {t.uses}회 · 템플릿</p>
                    <button type="button" className="bw-btn-secondary bw-mt-xs">
                      미리보기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SearchView;
