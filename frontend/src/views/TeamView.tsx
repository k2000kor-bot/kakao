/**
 * 팀·멤버·권한 뷰 (확장 범위) — teamViewService 목데이터
 */
import React, { useEffect, useState } from 'react';
import {
  fetchTeamSummary,
  normalizeTeamSummary,
  type TeamSummary,
} from '../services/teamViewService';

const PERMISSION_ROWS = [
  { scope: '프로젝트', viewer: '읽기', editor: '편집', admin: '전체' },
  { scope: '대화·노트북', viewer: '읽기', editor: '메시지', admin: '공유·삭제' },
  { scope: '청구·플랜', viewer: '—', editor: '—', admin: '전체' },
];

function TeamView() {
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchTeamSummary()
      .then((d) => {
        if (!c) setSummary(normalizeTeamSummary(d));
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);
  const memberLabel = loading
    ? '멤버 수: …'
    : summary
      ? `멤버 수: ${summary.members.length}`
      : '멤버 수: —';
  const roleLabel = loading ? '역할: …' : summary ? `역할: ${summary.role}` : '역할: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="팀"
      data-testid="team-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">팀 멤버와 권한을 관리할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="team-members-heading">
          <h2 id="team-members-heading" className="bw-detail-section-title">
            멤버
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              팀원 초대·역할 지정·멤버 목록을 관리합니다.
            </p>
            <div className="bw-flex-gap-8 bw-detail-meta-row" role="list" aria-label="팀 요약">
              <span className="bw-label-block bw-detail-meta-text">{memberLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{roleLabel}</span>
            </div>
            {!loading && summary && (
              <div className="bw-tool-table-wrap bw-mt-md">
                <table className="bw-tool-table">
                  <caption>멤버 목록</caption>
                  <thead>
                    <tr>
                      <th scope="col">이름</th>
                      <th scope="col">이메일</th>
                      <th scope="col">역할</th>
                      <th scope="col">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.members.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.role}</td>
                        <td>
                          <span className="bw-badge-soft">{m.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && summary && (
              <p className="bw-label-block bw-detail-note bw-mt-sm">
                초대 링크·역할 변경은 백엔드 연동 후 저장됩니다. 현재 표는 데모 데이터입니다.
              </p>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="team-permissions-heading">
          <h2 id="team-permissions-heading" className="bw-detail-section-title">
            권한
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              프로젝트·대화·설정에 대한 접근 권한을 역할별로 설정할 수 있습니다.
            </p>
            <div className="bw-tool-table-wrap bw-mt-sm">
              <table className="bw-tool-table">
                <caption>역할별 권한 요약</caption>
                <thead>
                  <tr>
                    <th scope="col">범위</th>
                    <th scope="col">뷰어</th>
                    <th scope="col">편집자</th>
                    <th scope="col">관리자</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_ROWS.map((r) => (
                    <tr key={r.scope}>
                      <td>{r.scope}</td>
                      <td>{r.viewer}</td>
                      <td>{r.editor}</td>
                      <td>{r.admin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="team-collab-heading">
          <h2 id="team-collab-heading" className="bw-detail-section-title">
            실시간 협업
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              동시 편집·댓글·공유 링크 등 협업 기능이 제공됩니다.
            </p>
            <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: '1.2rem' }}>
              <li>프로젝트 초대 링크 만료 시간 설정</li>
              <li>대화 스레드에 멘션·할 일 지정</li>
              <li>문서 버전 히스토리 (연동 시)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TeamView;
