/**
 * 워크스페이스·조직 뷰 (확장 범위) — workspaceViewService 목데이터
 */
import React, { useEffect, useState } from 'react';
import {
  fetchWorkspaceSummary,
  normalizeWorkspaceSummary,
  type WorkspaceSummary,
} from '../services/workspaceViewService';

function WorkspaceView() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchWorkspaceSummary()
      .then((d) => {
        const n = normalizeWorkspaceSummary(d);
        if (!c) {
          setSummary(n);
          setActiveId(n.workspaces.find((w) => w.isCurrent)?.id ?? n.workspaces[0]?.id ?? null);
        }
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  const countLabel = loading
    ? '워크스페이스 수: …'
    : summary != null
      ? `워크스페이스 수: ${summary.workspaces.length}`
      : '워크스페이스 수: —';
  const currentLabel = loading
    ? '현재: …'
    : summary
      ? `현재: ${summary.workspaces.find((w) => w.id === activeId)?.name ?? summary.currentName}`
      : '현재: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="워크스페이스"
      data-testid="workspace-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">워크스페이스와 조직을 관리할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="workspace-list-heading">
          <h2 id="workspace-list-heading" className="bw-detail-section-title">
            워크스페이스 목록
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              팀·조직별로 워크스페이스를 나누고 전환할 수 있습니다.
            </p>
            <div className="bw-flex-gap-8 bw-detail-meta-row" role="list" aria-label="워크스페이스 요약">
              <span className="bw-label-block bw-detail-meta-text">{countLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{currentLabel}</span>
            </div>
            {!loading && summary && (
              <>
                <div className="bw-tool-table-wrap bw-mt-md">
                  <table className="bw-tool-table">
                    <caption>워크스페이스</caption>
                    <thead>
                      <tr>
                        <th scope="col">이름</th>
                        <th scope="col">멤버</th>
                        <th scope="col">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.workspaces.map((w) => (
                        <tr key={w.id}>
                          <td>
                            {w.name}
                            {w.id === activeId ? (
                              <span className="bw-badge-soft bw-mt-xs" style={{ marginLeft: 8 }}>
                                선택됨
                              </span>
                            ) : null}
                          </td>
                          <td>{w.members}명</td>
                          <td>
                            <button
                              type="button"
                              className="bw-btn-secondary"
                              onClick={() => setActiveId(w.id)}
                              disabled={w.id === activeId}
                            >
                              전환
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="bw-label-block bw-detail-note bw-mt-sm">
                  전환은 UI 데모입니다. 실제 격리·권한은 백엔드 세션과 연동됩니다.
                </p>
              </>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="workspace-org-heading">
          <h2 id="workspace-org-heading" className="bw-detail-section-title">
            조직 설정
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              조직명·도메인·기본 정책을 설정합니다.
            </p>
            <div className="bw-tool-field bw-mt-sm">
              <label htmlFor="ws-org-name" className="bw-label-block">
                조직 표시 이름
              </label>
              <input id="ws-org-name" className="bw-input" type="text" defaultValue="CORBU 데모 조직" />
            </div>
            <div className="bw-tool-field">
              <label htmlFor="ws-domain" className="bw-label-block">
                허용 도메인
              </label>
              <input id="ws-domain" className="bw-input" type="text" placeholder="example.com" />
            </div>
            <button type="button" className="bw-btn-primary bw-mt-sm">
              저장 (데모)
            </button>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="workspace-resources-heading">
          <h2 id="workspace-resources-heading" className="bw-detail-section-title">
            리소스 분리
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              프로젝트·대화·파일이 워크스페이스 단위로 구분됩니다.
            </p>
            <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: '1.2rem' }}>
              <li>선택한 워크스페이스: {summary && !loading ? (summary.workspaces.find((w) => w.id === activeId)?.name ?? '—') : '—'}</li>
              <li>데이터 경계: 프로젝트·대화·업로드 파일</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WorkspaceView;
