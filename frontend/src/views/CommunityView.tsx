/**
 * 커뮤니티·포럼·지식 공유 뷰 (확장 범위) — communityViewService 목데이터
 */
import React, { useEffect, useState } from 'react';
import {
  fetchCommunitySummary,
  normalizeCommunitySummary,
  type CommunitySummary,
} from '../services/communityViewService';

function CommunityView() {
  const [summary, setSummary] = useState<CommunitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchCommunitySummary()
      .then((d) => {
        if (!c) setSummary(normalizeCommunitySummary(d));
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);
  const topicLabel = loading ? '주제 수: …' : summary != null ? `주제 수: ${summary.topicCount}` : '주제 수: —';
  const recentLabel = loading ? '최근 글: …' : summary ? `최근 글: ${summary.recentPostLabel}` : '최근 글: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="커뮤니티"
      data-testid="community-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">포럼과 지식 공유 공간입니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="community-forum-heading">
          <h2 id="community-forum-heading" className="bw-detail-section-title">
            포럼
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              질문·답변·사용 팁을 주제별로 나누어 공유할 수 있습니다.
            </p>
            <div className="bw-flex-gap-8 bw-detail-meta-row" role="list" aria-label="커뮤니티 요약">
              <span className="bw-label-block bw-detail-meta-text">{topicLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{recentLabel}</span>
            </div>
            {!loading && summary && (
              <>
                <div className="bw-tool-chip-row bw-mt-md" aria-label="인기 주제">
                  {summary.topicLabels.map((t) => (
                    <span key={t} className="bw-badge-soft">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="bw-tool-table-wrap bw-mt-sm">
                  <table className="bw-tool-table">
                    <caption>최근 토픽 (데모)</caption>
                    <thead>
                      <tr>
                        <th scope="col">제목</th>
                        <th scope="col">분류</th>
                        <th scope="col">댓글</th>
                        <th scope="col">갱신</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.threads.map((row) => (
                        <tr key={row.id}>
                          <td>{row.title}</td>
                          <td>{row.category}</td>
                          <td>{row.replies}</td>
                          <td>{row.updatedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="bw-label-block bw-detail-note bw-mt-sm">
                  주제 수·최근 글은 API 값이며, 표 행은 콘텐츠 미연결 시에도 볼 수 있도록 샘플로
                  채워 둡니다.
                </p>
              </>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="community-knowledge-heading">
          <h2 id="community-knowledge-heading" className="bw-detail-section-title">
            지식 공유
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              가이드·템플릿·베스트 프랙티스를 커뮤니티에서 함께 관리합니다.
            </p>
            <div className="bw-tool-grid bw-mt-sm">
              <div className="bw-tool-tile">
                <p className="bw-tool-tile-title">온보딩 가이드</p>
                <p className="bw-tool-tile-meta">PDF · 12페이지</p>
                <button type="button" className="bw-btn-secondary bw-mt-xs">
                  보기
                </button>
              </div>
              <div className="bw-tool-tile">
                <p className="bw-tool-tile-title">프롬프트 모음 ZIP</p>
                <p className="bw-tool-tile-meta">도시정비 시나리오</p>
                <button type="button" className="bw-btn-secondary bw-mt-xs">
                  다운로드
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="community-oss-heading">
          <h2 id="community-oss-heading" className="bw-detail-section-title">
            OSS·기여
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              오픈소스 기여·이슈·개선 제안 링크와 안내가 제공됩니다.
            </p>
            <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: '1.2rem' }}>
              <li>이슈 트래커: 내부 Git 연동 시 표시</li>
              <li>기여 가이드·코드 스타일 문서</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CommunityView;
