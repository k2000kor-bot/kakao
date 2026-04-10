/**
 * 학습·코스·튜토리얼 뷰 (확장 범위) — learnViewService 목데이터
 */
import React, { useEffect, useState } from 'react';
import {
  fetchLearnSummary,
  normalizeLearnSummary,
  type LearnSummary,
} from '../services/learnViewService';

function LearnView() {
  const [summary, setSummary] = useState<LearnSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchLearnSummary()
      .then((d) => {
        if (!c) setSummary(normalizeLearnSummary(d));
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);
  const progressLabel = loading ? '진행률: …' : summary ? `진행률: ${summary.progressPercent}%` : '진행률: —';
  const completedLabel =
    loading ? '완료 코스: …' : summary != null ? `완료 코스: ${summary.completedCourses}개` : '완료 코스: —';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered bw-tool-view"
      role="main"
      aria-label="학습"
      data-testid="learn-view"
    >
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">학습 경로·코스·튜토리얼을 확인할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="learn-path-heading">
          <h2 id="learn-path-heading" className="bw-detail-section-title">
            학습 경로
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              대화·프로젝트·노트북 LLM·목소리 생성 등 기능별 단계별 학습 경로를 제공합니다.
            </p>
            <div className="bw-flex-gap-8 bw-detail-meta-row" role="list" aria-label="학습 요약">
              <span className="bw-label-block bw-detail-meta-text">{progressLabel}</span>
              <span className="bw-label-block bw-detail-meta-text">{completedLabel}</span>
            </div>
            {!loading && summary && (
              <div className="bw-mt-md">
                {summary.courses.map((c) => (
                  <div key={c.id} className="bw-progress-row">
                    <div className="bw-progress-label">
                      <span>{c.title}</span>
                      <span>
                        {c.progressPercent}% · 약 {c.minutes}분
                      </span>
                    </div>
                    <div className="bw-progress-track" role="progressbar" aria-valuenow={c.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                      <div className="bw-progress-fill" style={{ width: `${c.progressPercent}%` }} />
                    </div>
                  </div>
                ))}
                <p className="bw-label-block bw-detail-note bw-mt-sm">
                  진행률은 로컬 데모이며, 로그인·LMS 연동 시 서버와 동기화됩니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="learn-tutorial-heading">
          <h2 id="learn-tutorial-heading" className="bw-detail-section-title">
            튜토리얼
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              첫 사용자용 빠른 시작과 도시정비·재개발 프로젝트 활용 가이드가 포함됩니다.
            </p>
            {!loading && summary && (
              <div className="bw-tool-table-wrap bw-mt-sm">
                <table className="bw-tool-table">
                  <caption>추천 튜토리얼</caption>
                  <thead>
                    <tr>
                      <th scope="col">제목</th>
                      <th scope="col">예상 시간</th>
                      <th scope="col"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.tutorials.map((t) => (
                      <tr key={t.title}>
                        <td>{t.title}</td>
                        <td>{t.minutes}분</td>
                        <td>
                          <button type="button" className="bw-btn-secondary">
                            시작
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="learn-cert-heading">
          <h2 id="learn-cert-heading" className="bw-detail-section-title">
            인증·완료
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              코스 완료 시 진행률·인증 배지가 표시됩니다.
            </p>
            <div className="bw-tool-chip-row bw-mt-sm" aria-label="배지 예시">
              <span className="bw-badge-soft">시작하기 완료</span>
              <span className="bw-badge-soft">노트북 입문</span>
              <span className="bw-badge-soft">문서 파이프라인</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LearnView;
