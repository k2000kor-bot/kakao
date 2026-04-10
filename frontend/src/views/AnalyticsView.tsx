/**
 * 분석·리포팅 뷰 — 사용 통계·차트 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /analytics
 * API: GET /api/integrated/analytics, GET /api/projects/{id}/analytics (analyticsViewService)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAnalytics, fetchProjectAnalytics, type AnalyticsData } from '../services/analyticsViewService';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';
import { CHART_COLORS } from '../styles/themeColors';

function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectAnalytics, setProjectAnalytics] = useState<{
    session_count: number;
    total_messages: number;
    source_count: number;
    project_name: string;
  } | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAnalytics()
      .then((data) => {
        if (!cancelled) setAnalytics(data ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    projectService.getProjects().then((list) => {
      if (!cancelled) {
        setProjects(list);
        setSelectedProjectId((prev) => (prev || (list.length > 0 ? list[0].id : '')));
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectAnalytics(null);
      return;
    }
    let cancelled = false;
    setProjectLoading(true);
    fetchProjectAnalytics(selectedProjectId)
      .then((data) => {
        if (!cancelled && data)
          setProjectAnalytics({
            session_count: data.session_count,
            total_messages: data.total_messages,
            source_count: data.source_count,
            project_name: data.project_name,
          });
        else if (!cancelled) setProjectAnalytics(null);
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedProjectId]);

  const reqLabel = loading ? '요청 수: …' : analytics ? `요청 수: ${analytics.total_requests}` : '요청 수: —';
  const tokenLabel = '토큰 사용: —';
  const sessionLabel = '세션 시간: —';
  const avgTimeLabel = analytics != null && !loading
    ? `평균 응답: ${typeof analytics.average_response_time === 'number' ? analytics.average_response_time.toFixed(1) : analytics.average_response_time}ms`
    : null;

  const projectChartData = useMemo(() => {
    if (!projectAnalytics) return [];
    return [
      { name: '세션', count: projectAnalytics.session_count },
      { name: '메시지', count: projectAnalytics.total_messages },
      { name: '노트북 소스', count: projectAnalytics.source_count },
    ];
  }, [projectAnalytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    const items: { name: string; count: number }[] = [];
    if (analytics.emotion_distribution) {
      items.push(
        { name: '긍정', count: analytics.emotion_distribution.positive },
        { name: '부정', count: analytics.emotion_distribution.negative },
        { name: '중립', count: analytics.emotion_distribution.neutral },
      );
    }
    const intentLabels: Record<string, string> = {
      question: '질문', request: '요청', gratitude: '감사', greeting: '인사',
      complaint: '불만', compliment: '칭찬',
    };
    if (analytics.intent_distribution && Object.keys(analytics.intent_distribution).length > 0) {
      Object.entries(analytics.intent_distribution).forEach(([k, v]) => {
        items.push({ name: intentLabels[k] ?? k, count: v });
      });
    }
    return items.length > 0 ? items : [];
  }, [analytics]);

  return (
    <div className="main-content bw-detail-root bw-detail-root--centered bw-tool-view" role="main" aria-label="분석" data-testid="analytics-view">
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">사용 통계와 대시보드를 확인할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
      <section className="bw-detail-section" aria-labelledby="analytics-stats-heading">
        <h2 id="analytics-stats-heading" className="bw-detail-section-title">사용 통계</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            프로젝트별 요청 수·토큰 사용량·세션 시간 등 메트릭이 표시됩니다.
          </p>
          <div className="bw-detail-meta-row" role="list" aria-label="메트릭 예시">
            <span className="bw-label-block bw-detail-meta-text">{reqLabel}</span>
            <span className="bw-label-block bw-detail-meta-text">{tokenLabel}</span>
            <span className="bw-label-block bw-detail-meta-text">{sessionLabel}</span>
            {avgTimeLabel != null && (
              <span className="bw-label-block bw-detail-meta-text">{avgTimeLabel}</span>
            )}
          </div>
          {!loading && analytics == null && (
            <p className="bw-label-block bw-detail-note">
              백엔드 미연결 시 플레이스홀더로 표시됩니다. 연결되면 실시간 지표로 갱신됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="analytics-project-heading">
        <h2 id="analytics-project-heading" className="bw-detail-section-title">프로젝트별 통계</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            프로젝트를 선택하면 세션 수·메시지 수·노트북 소스 수를 확인할 수 있습니다.
          </p>
          {projects.length > 0 ? (
            <>
              <label htmlFor="analytics-project-select" className="sr-only">
                프로젝트 선택
              </label>
              <select
                id="analytics-project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bw-input bw-mt-12 bw-select-max"
                aria-describedby="analytics-project-stats"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div
                id="analytics-project-stats"
                role="list"
                aria-label="프로젝트 통계"
                className="bw-detail-meta-row"
              >
                {projectLoading && (
                  <span className="bw-label-block bw-detail-meta-text">
                    로딩 중…
                  </span>
                )}
                {!projectLoading && projectAnalytics && (
                  <>
                    <span className="bw-label-block bw-detail-meta-text">
                      세션 수: {projectAnalytics.session_count}
                    </span>
                    <span className="bw-label-block bw-detail-meta-text">
                      메시지 수: {projectAnalytics.total_messages}
                    </span>
                    <span className="bw-label-block bw-detail-meta-text">
                      노트북 소스: {projectAnalytics.source_count}
                    </span>
                    {projectChartData.length > 0 && (
                      <div className="bw-chart-container" role="img" aria-label="프로젝트별 사용량 차트">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={projectChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border-overlay)', borderRadius: 4 }}
                              labelStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="count" fill={CHART_COLORS[1]} name="건수" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}
                {!projectLoading && !projectAnalytics && selectedProjectId && (
                  <span className="bw-label-block bw-detail-meta-text">
                    통계를 불러올 수 없습니다.
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="bw-label-block bw-detail-note">
              프로젝트가 없습니다. 프로젝트를 만들면 여기에 통계가 표시됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="analytics-dashboard-heading">
        <h2 id="analytics-dashboard-heading" className="bw-detail-section-title">대시보드</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            차트·트렌드·비교 뷰로 사용 현황을 한눈에 볼 수 있습니다.
          </p>
          {loading && (
            <p className="bw-label-block bw-detail-meta-text">차트 로딩 중…</p>
          )}
          {!loading && chartData.length > 0 && (
            <div className="bw-chart-container bw-chart-container--tall" role="img" aria-label="감정·의도 분포 차트">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border-overlay)', borderRadius: 4 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} name="건수" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!loading && analytics != null && chartData.length === 0 && (
            <p className="bw-label-block bw-detail-meta-text">
              표시할 분포 데이터가 없습니다. 백엔드에서 emotion/intent 분포를 제공하면 차트가 표시됩니다.
            </p>
          )}
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="analytics-export-heading">
        <h2 id="analytics-export-heading" className="bw-detail-section-title">내보내기</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            통계·리포트를 CSV·PDF 등으로 내보낼 수 있습니다.
          </p>
          {(analytics || projectAnalytics) && (
            <button
              type="button"
              onClick={() => {
                const rows = [['항목', '값']];
                if (analytics) {
                  rows.push(['요청 수', String(analytics.total_requests)]);
                  rows.push(['성공', String(analytics.successful_requests)]);
                  rows.push(['실패', String(analytics.failed_requests)]);
                  rows.push(['평균 응답(ms)', String(analytics.average_response_time)]);
                  chartData.forEach((d) => rows.push([d.name, String(d.count)]));
                }
                if (projectAnalytics) {
                  rows.push(['--- 프로젝트별 ---', '']);
                  rows.push(['프로젝트', projectAnalytics.project_name]);
                  rows.push(['세션 수', String(projectAnalytics.session_count)]);
                  rows.push(['메시지 수', String(projectAnalytics.total_messages)]);
                  rows.push(['노트북 소스', String(projectAnalytics.source_count)]);
                }
                const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}
              className="bw-btn-secondary bw-mt-sm"
            >
              CSV로 내보내기
            </button>
          )}
          {!analytics && !projectAnalytics && !loading && (
            <p className="bw-label-block bw-detail-note">
              데이터를 불러온 후 내보내기를 사용할 수 있습니다.
            </p>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

export default AnalyticsView;
