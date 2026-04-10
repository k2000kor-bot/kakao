/**
 * 워크플로우·자동화 빌더 뷰 (확장 범위)
 * API: GET /automation/status, GET /automation/workflows (automationViewService)
 */
import React, { useEffect, useState } from 'react';
import { fetchAutomationSummary, type AutomationSummary } from '../services/automationViewService';

const DEMO_WORKFLOWS = [
  { name: '신규 파일 → 요약 → 슬랙', trigger: '스토리지 업로드', status: '대기' },
  { name: '야간 배치 리포트', trigger: '스케줄 02:00', status: '활성' },
  { name: '이슈 라벨링', trigger: '웹훅', status: '오류' },
];

const DEMO_RUNS = [
  { at: '2026-03-27 09:12', workflow: '신규 파일 → 요약 → 슬랙', ok: true },
  { at: '2026-03-26 02:00', workflow: '야간 배치 리포트', ok: true },
  { at: '2026-03-25 18:40', workflow: '이슈 라벨링', ok: false },
];

function AutomationView() {
  const [summary, setSummary] = useState<AutomationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchAutomationSummary()
      .then((d) => {
        if (!c) setSummary(d);
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);
  const countLabel = loading
    ? '워크플로우 수: …'
    : summary != null
      ? `워크플로우 수: ${summary.workflowCount}`
      : '워크플로우 수: —';
  const lastLabel = loading
    ? '마지막 실행: …'
    : summary?.lastRunAt
      ? `마지막 실행: ${summary.lastRunAt}`
      : '마지막 실행: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="자동화"
      data-testid="automation-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">워크플로우와 자동화를 설계·실행할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="automation-builder-heading">
          <h2 id="automation-builder-heading" className="bw-detail-section-title">
            워크플로우 빌더
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              트리거·조건·액션을 연결하는 노코드/로코드 워크플로우를 설계할 수 있습니다.
            </p>
            <div className="bw-detail-meta-row" role="list" aria-label="자동화 요약">
              <span className="bw-label-block bw-detail-meta-text">{countLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{lastLabel}</span>
            </div>
            {!loading && summary && (
              <div className="bw-tool-table-wrap bw-mt-md">
                <table className="bw-tool-table">
                  <caption>
                    {summary.workflowCount === 0 && !summary.lastRunAt
                      ? '등록된 워크플로가 없을 때 표시되는 예시 목록'
                      : '워크플로 목록 (API 확장 시 대체)'}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">이름</th>
                      <th scope="col">트리거</th>
                      <th scope="col">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_WORKFLOWS.map((w) => (
                      <tr key={w.name}>
                        <td>{w.name}</td>
                        <td>{w.trigger}</td>
                        <td>
                          <span className="bw-badge-soft">{w.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="automation-triggers-heading">
          <h2 id="automation-triggers-heading" className="bw-detail-section-title">
            트리거
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              새 메시지·파일 업로드·스케줄·웹훅 등으로 자동화를 시작할 수 있습니다.
            </p>
            <div className="bw-tool-chip-row bw-mt-sm" role="list" aria-label="트리거 유형">
              <span className="bw-badge-soft">메시지</span>
              <span className="bw-badge-soft">파일</span>
              <span className="bw-badge-soft">스케줄</span>
              <span className="bw-badge-soft">웹훅</span>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="automation-history-heading">
          <h2 id="automation-history-heading" className="bw-detail-section-title">
            실행 이력
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              워크플로우 실행 로그·성공/실패·재시도를 확인할 수 있습니다.
            </p>
            {!loading && summary && (
              <div className="bw-tool-table-wrap bw-mt-sm">
                <table className="bw-tool-table">
                  <caption>최근 실행 (데모)</caption>
                  <thead>
                    <tr>
                      <th scope="col">시각</th>
                      <th scope="col">워크플로</th>
                      <th scope="col">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_RUNS.map((r) => (
                      <tr key={`${r.at}-${r.workflow}`}>
                        <td>{r.at}</td>
                        <td>{r.workflow}</td>
                        <td>{r.ok ? '성공' : '실패'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AutomationView;
