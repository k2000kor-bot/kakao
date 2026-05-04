/**
 * 분석·리포팅 뷰 — 사용 통계·차트 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /analytics
 * API: GET /api/integrated/analytics, GET /api/projects/{id}/analytics (analyticsViewService)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchAnalytics, fetchProjectAnalytics, type AnalyticsData } from '../services/analyticsViewService';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';
import { CHART_COLORS } from '../styles/themeColors';
import { CHATGPT_CONVERSATIONS_STORAGE_KEY } from '../services/chatGptUiStorageKeys';

// ---------- 로컬 대화 통계 ----------
interface LocalConvStats {
  totalConversations: number;
  totalMessages: number;
  pinnedCount: number;
  todayCount: number;
  last7Days: { date: string; count: number }[];
}

// 시간대(0-23) × 요일(0-6, 일~토) 히트맵 집계
function computeHourDowHeatmap(): number[][] {
  // matrix[dow][hour]
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return matrix;
    const parsed: Array<{ createdAt?: string; updatedAt?: string }> = JSON.parse(raw);
    if (!Array.isArray(parsed)) return matrix;
    parsed.forEach((conv) => {
      const ts = conv.createdAt ?? conv.updatedAt;
      if (!ts) return;
      const d = new Date(ts);
      if (isNaN(d.getTime())) return;
      matrix[d.getDay()][d.getHours()] += 1;
    });
  } catch { /* ignore */ }
  return matrix;
}

function computeLocalConvStats(): LocalConvStats {
  const empty: LocalConvStats = { totalConversations: 0, totalMessages: 0, pinnedCount: 0, todayCount: 0, last7Days: [] };
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return empty;
    const parsed: Array<{
      updatedAt?: string;
      messages?: unknown[];
      pinned?: boolean;
    }> = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 최근 7일 버킷 초기화
    const buckets = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      buckets.set(d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }), 0);
    }

    let totalMessages = 0;
    let pinnedCount = 0;
    let todayCount = 0;

    for (const conv of parsed) {
      if (!conv) continue;
      totalMessages += Array.isArray(conv.messages) ? conv.messages.length : 0;
      if (conv.pinned) pinnedCount++;

      const updatedAt = conv.updatedAt ? new Date(conv.updatedAt) : null;
      if (updatedAt && !isNaN(updatedAt.getTime())) {
        const convDay = new Date(updatedAt);
        convDay.setHours(0, 0, 0, 0);
        if (convDay.getTime() === today.getTime()) todayCount++;
        const label = convDay.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
        if (buckets.has(label)) {
          buckets.set(label, (buckets.get(label) ?? 0) + 1);
        }
      }
    }

    return {
      totalConversations: parsed.length,
      totalMessages,
      pinnedCount,
      todayCount,
      last7Days: Array.from(buckets.entries()).map(([date, count]) => ({ date, count })),
    };
  } catch {
    return empty;
  }
}

// ---------- 연간 활동 히트맵 ----------
function computeYearlyHeatmap(): Map<string, number> {
  const map = new Map<string, number>();
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return map;
    const parsed: Array<{ updatedAt?: string }> = JSON.parse(raw);
    if (!Array.isArray(parsed)) return map;
    for (const conv of parsed) {
      if (!conv.updatedAt) continue;
      const d = new Date(conv.updatedAt);
      if (isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  } catch { /* noop */ }
  return map;
}

// ---------- 연속 사용 스트릭 ----------
const STREAK_KEY = 'corbu.analytics.streak';
const WEEKLY_GOAL_KEY = 'corbu.analytics.weeklyGoal';

interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string;
  weeklyUsed: number;
  activeDays: string[];
}

function computeStreak(): StreakData {
  const empty: StreakData = { current: 0, longest: 0, lastActiveDate: '', weeklyUsed: 0, activeDays: [] };
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return empty;
    const parsed: Array<{ updatedAt?: string; createdAt?: string }> = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;

    const activeDays = new Set<string>();
    for (const conv of parsed) {
      const dt = conv.updatedAt ?? conv.createdAt;
      if (!dt) continue;
      const d = new Date(dt);
      if (!isNaN(d.getTime())) activeDays.add(d.toISOString().slice(0, 10));
    }

    const sorted = Array.from(activeDays).sort();
    let current = 0, longest = 0, streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    let prev = '';

    for (let i = 0; i < sorted.length; i++) {
      const day = sorted[i];
      if (prev) {
        const diff = (new Date(day).getTime() - new Date(prev).getTime()) / 86400000;
        if (diff === 1) { streak++; } else { streak = 1; }
      } else { streak = 1; }
      if (streak > longest) longest = streak;
      if (day === today || i === sorted.length - 1) current = streak;
      prev = day;
    }
    if (sorted.length > 0 && sorted[sorted.length - 1] !== today) {
      const lastDay = sorted[sorted.length - 1];
      const diff = (new Date(today).getTime() - new Date(lastDay).getTime()) / 86400000;
      if (diff > 1) current = 0;
    }

    // 이번 주 사용 일수
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weeklyUsed = sorted.filter((d) => new Date(d) >= startOfWeek).length;

    return { current, longest, lastActiveDate: sorted[sorted.length - 1] ?? '', weeklyUsed, activeDays: sorted };
  } catch { return empty; }
}

// ---------- 주간 비교 데이터 ----------
interface WeeklyCompareRow {
  day: string;       // '월', '화', …
  thisWeek: number;
  lastWeek: number;
}

function computeWeeklyCompare(): WeeklyCompareRow[] {
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const rows: WeeklyCompareRow[] = dayLabels.map((d) => ({ day: d, thisWeek: 0, lastWeek: 0 }));
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return rows;
    const parsed: Array<{ updatedAt?: string; createdAt?: string }> = JSON.parse(raw);
    if (!Array.isArray(parsed)) return rows;
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    for (const conv of parsed) {
      const raw2 = conv.updatedAt ?? conv.createdAt;
      if (!raw2) continue;
      const d = new Date(raw2);
      if (isNaN(d.getTime())) continue;
      const dow = d.getDay();
      if (d >= startOfThisWeek) {
        rows[dow].thisWeek++;
      } else if (d >= startOfLastWeek) {
        rows[dow].lastWeek++;
      }
    }
  } catch { /* ignore */ }
  return rows;
}

interface TopicSlice { name: string; value: number; color: string; }

const TOPIC_KEYWORDS: { label: string; keywords: string[]; color: string }[] = [
  { label: '코드/개발', keywords: ['코드', 'code', '프로그램', 'bug', '오류', 'typescript', 'javascript', 'python', 'react', '함수'], color: '#6366f1' },
  { label: '문서/요약', keywords: ['요약', 'summary', '문서', '정리', '번역', 'translate', '작성'], color: '#22d3ee' },
  { label: '분석/데이터', keywords: ['분석', 'analysis', '데이터', 'data', '통계', '차트', '그래프'], color: '#f59e0b' },
  { label: 'AI/에이전트', keywords: ['에이전트', 'agent', 'AI', '모델', 'gpt', '프롬프트', 'prompt'], color: '#10b981' },
  { label: '기타', keywords: [], color: '#94a3b8' },
];

function computeTopicDistribution(): TopicSlice[] {
  try {
    const raw = localStorage.getItem('chatgpt_conversations');
    if (!raw) return [];
    const convs: { title?: string; messages?: { content?: string }[] }[] = JSON.parse(raw);
    const counts: Record<string, number> = {};
    TOPIC_KEYWORDS.forEach((t) => { counts[t.label] = 0; });

    for (const c of convs) {
      const text = ((c.title ?? '') + ' ' + (c.messages ?? []).map((m) => m.content ?? '').join(' ')).toLowerCase();
      let matched = false;
      for (const topic of TOPIC_KEYWORDS.slice(0, -1)) {
        if (topic.keywords.some((kw) => text.includes(kw))) {
          counts[topic.label]++;
          matched = true;
          break;
        }
      }
      if (!matched) counts['기타']++;
    }

    return TOPIC_KEYWORDS
      .map((t) => ({ name: t.label, value: counts[t.label], color: t.color }))
      .filter((s) => s.value > 0);
  } catch { return []; }
}

// ---------- CSV 내보내기 유틸 ----------
function buildAnalyticsCsv(
  localStats: LocalConvStats,
  weeklyCompare: WeeklyCompareRow[],
  topicData: TopicSlice[],
  analytics: AnalyticsData | null
): string {
  const rows: string[][] = [];
  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  rows.push(['## 기본 대화 통계', '']);
  rows.push(['항목', '값']);
  rows.push(['전체 대화', String(localStats.totalConversations)]);
  rows.push(['전체 메시지', String(localStats.totalMessages)]);
  rows.push(['고정 대화', String(localStats.pinnedCount)]);
  rows.push(['오늘 대화', String(localStats.todayCount)]);
  rows.push(['', '']);

  rows.push(['## 일별 추이 (최근 7일)', '']);
  rows.push(['날짜', '대화 수']);
  localStats.last7Days.forEach((d) => rows.push([d.date, String(d.count)]));
  rows.push(['', '']);

  rows.push(['## 이번 주 vs 지난 주', '', '']);
  rows.push(['요일', '이번 주', '지난 주']);
  weeklyCompare.forEach((r) => rows.push([r.day, String(r.thisWeek), String(r.lastWeek)]));
  rows.push(['', '', '']);

  if (topicData.length > 0) {
    rows.push(['## 주제 분포', '']);
    rows.push(['주제', '대화 수']);
    topicData.forEach((t) => rows.push([t.name, String(t.value)]));
    rows.push(['', '']);
  }

  if (analytics) {
    rows.push(['## API 통계', '']);
    rows.push(['항목', '값']);
    rows.push(['요청 수', String(analytics.total_requests)]);
    rows.push(['성공', String(analytics.successful_requests)]);
    rows.push(['실패', String(analytics.failed_requests)]);
    rows.push(['평균 응답(ms)', String(analytics.average_response_time)]);
  }

  return rows.map((r) => r.map(q).join(',')).join('\n');
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [localStats, setLocalStats] = useState<LocalConvStats>(() => computeLocalConvStats());
  const [weeklyCompare, setWeeklyCompare] = useState<WeeklyCompareRow[]>(() => computeWeeklyCompare());
  const [topicData, setTopicData] = useState<TopicSlice[]>(() => computeTopicDistribution());
  const hourDowMatrix = useMemo(() => computeHourDowHeatmap(), []);
  const [projectAnalytics, setProjectAnalytics] = useState<{
    session_count: number;
    total_messages: number;
    source_count: number;
    project_name: string;
  } | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [streak] = useState<StreakData>(() => computeStreak());
  const [localChartType, setLocalChartType] = useState<'bar' | 'line'>('line');
  const [dashChartType, setDashChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [weeklyChartType, setWeeklyChartType] = useState<'bar' | 'line'>('bar');
  const [weeklyGoal, setWeeklyGoal] = useState<number>(() => {
    try { return Number(localStorage.getItem(WEEKLY_GOAL_KEY)) || 5; } catch { return 5; }
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  // 커스텀 날짜 범위 필터
  const [dateRangeFrom, setDateRangeFrom] = useState('');
  const [dateRangeTo, setDateRangeTo] = useState('');
  const [dateRangeApplied, setDateRangeApplied] = useState(false);

  const applyDateFilter = () => {
    if (!dateRangeFrom && !dateRangeTo) return;
    setDateRangeApplied(true);
  };
  const clearDateFilter = () => {
    setDateRangeFrom(''); setDateRangeTo(''); setDateRangeApplied(false);
  };

  const filteredSummary = useMemo(() => {
    if (!dateRangeApplied || (!dateRangeFrom && !dateRangeTo)) {
      return { total: localStats.totalConversations, avgPerDay: localStats.todayCount };
    }
    try {
      const convs: { createdAt?: string }[] = JSON.parse(localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY) ?? '[]');
      const from = dateRangeFrom ? new Date(dateRangeFrom).getTime() : 0;
      const to = dateRangeTo ? new Date(dateRangeTo).getTime() + 86400000 : Infinity;
      const inRange = convs.filter(c => {
        const t = c.createdAt ? new Date(c.createdAt).getTime() : NaN;
        return !isNaN(t) && t >= from && t <= to;
      });
      return { total: inRange.length, avgPerDay: inRange.length > 0 ? Math.round(inRange.length / Math.max(1, (to === Infinity ? Date.now() : to - from) / 86400000)) : 0 };
    } catch {
      return { total: localStats.totalConversations, avgPerDay: localStats.todayCount };
    }
  }, [dateRangeApplied, dateRangeFrom, dateRangeTo, localStats]);

  const saveWeeklyGoal = (val: number) => {
    const v = Math.max(1, Math.min(30, val));
    setWeeklyGoal(v);
    try { localStorage.setItem(WEEKLY_GOAL_KEY, String(v)); } catch { /* ignore */ }
  };

  // localStorage 변경 시 로컬 통계 재계산
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHATGPT_CONVERSATIONS_STORAGE_KEY) {
        setLocalStats(computeLocalConvStats());
        setWeeklyCompare(computeWeeklyCompare());
        setTopicData(computeTopicDistribution());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
      {/* ── 연속 사용 스트릭 + 주간 목표 ── */}
      <section className="bw-detail-section" aria-labelledby="analytics-streak-heading">
        <h2 id="analytics-streak-heading" className="bw-detail-section-title">🔥 사용 스트릭 &amp; 주간 목표</h2>
        <div className="analytics-streak-grid">
          {/* 연속 사용 카드 */}
          <div className="analytics-streak-card">
            <div className="analytics-streak-flame">{streak.current >= 7 ? '🔥' : streak.current >= 3 ? '⚡' : '📅'}</div>
            <div className="analytics-streak-body">
              <span className="analytics-streak-val">{streak.current}일</span>
              <span className="analytics-streak-label">연속 사용</span>
              <span className="analytics-streak-sub">최장 기록: {streak.longest}일</span>
            </div>
          </div>

          {/* 주간 요일 히트맵 */}
          <div className="analytics-streak-card analytics-streak-card--heatmap">
            <p className="analytics-streak-heatmap-title">이번 주 활동</p>
            <div className="analytics-streak-heatmap">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setHours(0, 0, 0, 0);
                startOfWeek.setDate(now.getDate() - now.getDay());
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);
                const key = dayDate.toISOString().slice(0, 10);
                const count = weeklyCompare[i]?.thisWeek ?? 0;
                const isToday = dayDate.toDateString() === now.toDateString();
                return (
                  <div
                    key={day}
                    className={`analytics-heatmap-cell${count > 0 ? ' analytics-heatmap-cell--active' : ''}${isToday ? ' analytics-heatmap-cell--today' : ''}`}
                    title={`${key}: ${count}건`}
                    aria-label={`${day}요일 ${count}건`}
                  >
                    <span className="analytics-heatmap-day">{day}</span>
                    {count > 0 && <span className="analytics-heatmap-count">{count}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 연간 활동 히트맵 (GitHub 스타일) */}
          {(() => {
            const yearMap = computeYearlyHeatmap();
            const today = new Date();
            // 오늘 기준 52주(364일) 뒤로
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 363);
            startDate.setHours(0, 0, 0, 0);
            // 일요일로 맞춤
            const dayOfWeek = startDate.getDay();
            startDate.setDate(startDate.getDate() - dayOfWeek);

            const cells: { key: string; count: number; future: boolean }[] = [];
            const cursor = new Date(startDate);
            while (cursor <= today) {
              const key = cursor.toISOString().slice(0, 10);
              cells.push({ key, count: yearMap.get(key) ?? 0, future: cursor > today });
              cursor.setDate(cursor.getDate() + 1);
            }
            const maxCount = Math.max(1, ...cells.map((c) => c.count));
            const monthLabels: { label: string; col: number }[] = [];
            cells.forEach((c, i) => {
              if (i % 7 === 0) {
                const mo = c.key.slice(5, 7);
                const prevMo = i > 0 ? cells[i - 7]?.key.slice(5, 7) : '';
                if (mo !== prevMo) monthLabels.push({ label: `${parseInt(mo)}월`, col: Math.floor(i / 7) });
              }
            });
            const totalCols = Math.ceil(cells.length / 7);
            const totalActive = cells.filter((c) => c.count > 0).length;
            const totalConvYear = cells.reduce((s, c) => s + c.count, 0);
            return (
              <div className="analytics-yearly-heatmap-card">
                <div className="analytics-yearly-heatmap-header">
                  <span className="analytics-yearly-heatmap-title">📅 연간 활동 히트맵</span>
                  <span className="analytics-yearly-heatmap-meta">활동일 {totalActive}일 · 총 {totalConvYear}건</span>
                </div>
                <div className="analytics-yearly-heatmap-wrap" style={{ overflowX: 'auto' }}>
                  <div className="analytics-yearly-heatmap-month-row" style={{ gridTemplateColumns: `repeat(${totalCols}, 12px)`, display: 'grid', gap: '2px', marginBottom: '2px', paddingLeft: 22 }}>
                    {monthLabels.map(({ label, col }) => (
                      <span key={col} className="analytics-yearly-month-label" style={{ gridColumn: col + 1, fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <div className="analytics-yearly-dow-col">
                      {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                        <span key={d} className="analytics-yearly-dow-label">{d}</span>
                      ))}
                    </div>
                    <div className="analytics-yearly-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCols}, 12px)`, gridTemplateRows: 'repeat(7, 12px)', gap: 2, gridAutoFlow: 'column' }}>
                      {cells.map((c) => {
                        const intensity = c.count === 0 ? 0 : Math.ceil((c.count / maxCount) * 4);
                        return (
                          <div
                            key={c.key}
                            className={`analytics-yearly-cell analytics-yearly-cell--${intensity}`}
                            title={`${c.key}: ${c.count}건`}
                            aria-label={`${c.key} ${c.count}건`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="analytics-yearly-legend">
                    <span className="analytics-yearly-legend-label">적음</span>
                    {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`analytics-yearly-cell analytics-yearly-cell--${i}`} style={{ display: 'inline-block' }} />)}
                    <span className="analytics-yearly-legend-label">많음</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 주간 목표 카드 */}
          <div className="analytics-streak-card analytics-streak-card--goal">
            <div className="analytics-goal-top">
              <span className="analytics-goal-icon">🎯</span>
              <div className="analytics-goal-body">
                <span className="analytics-goal-label">주간 목표</span>
                {editingGoal ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      className="analytics-goal-edit-input"
                      value={goalDraft}
                      min={1}
                      max={30}
                      autoFocus
                      onChange={(e) => setGoalDraft(e.target.value)}
                      onBlur={() => { saveWeeklyGoal(Number(goalDraft)); setEditingGoal(false); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { saveWeeklyGoal(Number(goalDraft)); setEditingGoal(false); }
                        if (e.key === 'Escape') setEditingGoal(false);
                      }}
                      style={{ width: 44 }}
                    />
                    <span style={{ fontSize: 12 }}>일/주</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="analytics-goal-val-btn"
                    onClick={() => { setGoalDraft(String(weeklyGoal)); setEditingGoal(true); }}
                    title="클릭하여 목표 변경"
                  >
                    {streak.weeklyUsed} / {weeklyGoal}일
                  </button>
                )}
              </div>
            </div>
            <div className="analytics-goal-bar-track">
              <div
                className="analytics-goal-bar-fill"
                style={{ width: `${Math.min(100, Math.round((streak.weeklyUsed / weeklyGoal) * 100))}%` }}
                role="progressbar"
                aria-valuenow={streak.weeklyUsed}
                aria-valuemax={weeklyGoal}
              />
            </div>
            <span className="analytics-goal-pct">
              {streak.weeklyUsed >= weeklyGoal ? '🏆 달성!' : `${Math.round((streak.weeklyUsed / weeklyGoal) * 100)}%`}
            </span>
          </div>
        </div>
      </section>

      {/* ---- 로컬 대화 통계 (백엔드 불필요) ---- */}
      <section className="bw-detail-section" aria-labelledby="analytics-local-heading">
        <h2 id="analytics-local-heading" className="bw-detail-section-title">내 대화 통계</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            이 기기에 저장된 대화 데이터를 집계합니다. 백엔드 연결 없이 즉시 확인할 수 있습니다.
          </p>
          {/* 날짜 범위 필터 */}
          <div className="analytics-date-range-row">
            <span className="analytics-date-range-label">📅 기간 필터:</span>
            <input
              type="date"
              className="bw-input analytics-date-range-input"
              value={dateRangeFrom}
              onChange={e => setDateRangeFrom(e.target.value)}
              aria-label="시작일"
              title="시작일"
            />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>~</span>
            <input
              type="date"
              className="bw-input analytics-date-range-input"
              value={dateRangeTo}
              onChange={e => setDateRangeTo(e.target.value)}
              aria-label="종료일"
              title="종료일"
            />
            <button
              type="button"
              className="bw-btn-primary analytics-date-range-apply"
              onClick={applyDateFilter}
              disabled={!dateRangeFrom && !dateRangeTo}
              aria-label="기간 필터 적용"
            >
              적용
            </button>
            {dateRangeApplied && (
              <button
                type="button"
                className="analytics-date-range-clear"
                onClick={clearDateFilter}
                aria-label="기간 필터 초기화"
              >
                ✕ 초기화
              </button>
            )}
            {dateRangeApplied && (
              <span className="analytics-date-range-badge">
                {dateRangeFrom || '~'} ~ {dateRangeTo || '~'} 기준
              </span>
            )}
          </div>
          <div className="bw-analytics-stat-cards">
            <div className="bw-analytics-stat-card">
              <span className="bw-analytics-stat-value">{dateRangeApplied ? filteredSummary.total : localStats.totalConversations}</span>
              <span className="bw-analytics-stat-label">{dateRangeApplied ? '기간 내 대화' : '전체 대화'}</span>
            </div>
            <div className="bw-analytics-stat-card">
              <span className="bw-analytics-stat-value">{localStats.totalMessages}</span>
              <span className="bw-analytics-stat-label">전체 메시지</span>
            </div>
            <div className="bw-analytics-stat-card bw-analytics-stat-card--highlight">
              <span className="bw-analytics-stat-value">{dateRangeApplied ? filteredSummary.avgPerDay : localStats.todayCount}</span>
              <span className="bw-analytics-stat-label">{dateRangeApplied ? '일평균 대화' : '오늘 대화'}</span>
            </div>
            <div className="bw-analytics-stat-card">
              <span className="bw-analytics-stat-value">{localStats.pinnedCount}</span>
              <span className="bw-analytics-stat-label">📌 고정됨</span>
            </div>
          </div>
          {localStats.last7Days.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="analytics-chart-header">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>최근 7일 대화 추이</p>
                <div className="analytics-chart-toggle" role="group" aria-label="차트 유형">
                  {([['bar', '▊ 막대'], ['line', '📈 선']] as [typeof localChartType, string][]).map(([t, lbl]) => (
                    <button key={t} type="button" className={`analytics-chart-toggle-btn${localChartType === t ? ' analytics-chart-toggle-btn--active' : ''}`} onClick={() => setLocalChartType(t)} aria-pressed={localChartType === t}>{lbl}</button>
                  ))}
                </div>
              </div>
              <div className="bw-chart-container" role="img" aria-label="최근 7일 대화 추이 차트">
                <ResponsiveContainer width="100%" height="100%">
                  {localChartType === 'bar' ? (
                    <BarChart data={localStats.last7Days} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay, #e0e0e0)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} width={28} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay, #fff)', border: '1px solid var(--border-overlay, #e0e0e0)', borderRadius: 6, fontSize: 12 }} />
                      <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="대화 수" />
                    </BarChart>
                  ) : (
                    <LineChart data={localStats.last7Days} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay, #e0e0e0)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} width={28} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay, #fff)', border: '1px solid var(--border-overlay, #e0e0e0)', borderRadius: 6, fontSize: 12 }} />
                      <Line type="monotone" dataKey="count" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} name="대화 수" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* ── 주간 비교 차트 ── */}
          <div style={{ marginTop: 28 }}>
            <div className="analytics-chart-header">
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>📅 이번 주 vs 지난 주 대화 비교</p>
              <div className="analytics-chart-toggle" role="group" aria-label="차트 유형">
                {([['bar', '▊ 막대'], ['line', '📈 선']] as [typeof weeklyChartType, string][]).map(([t, lbl]) => (
                  <button key={t} type="button" className={`analytics-chart-toggle-btn${weeklyChartType === t ? ' analytics-chart-toggle-btn--active' : ''}`} onClick={() => setWeeklyChartType(t)} aria-pressed={weeklyChartType === t}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="bw-chart-container" style={{ height: 180 }} role="img" aria-label="이번 주 vs 지난 주 대화 수 비교 차트">
              <ResponsiveContainer width="100%" height="100%">
                {weeklyChartType === 'bar' ? (
                  <BarChart data={weeklyCompare} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay, #e0e0e0)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} width={28} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay, #fff)', border: '1px solid var(--border-overlay, #e0e0e0)', borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="thisWeek" name="이번 주" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="lastWeek" name="지난 주" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} opacity={0.6} />
                  </BarChart>
                ) : (
                  <LineChart data={weeklyCompare} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay, #e0e0e0)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }} width={28} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay, #fff)', border: '1px solid var(--border-overlay, #e0e0e0)', borderRadius: 6, fontSize: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="thisWeek" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} name="이번 주" />
                    <Line type="monotone" dataKey="lastWeek" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} name="지난 주" strokeDasharray="4 3" opacity={0.7} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, textAlign: 'center' }}>
              파랑: 이번 주 / 초록: 지난 주
            </p>
          </div>

          {localStats.totalConversations === 0 && (
            <p className="bw-label-block bw-detail-note" style={{ marginTop: 8 }}>
              아직 저장된 대화가 없습니다. 대화를 시작하면 여기에 통계가 표시됩니다.
            </p>
          )}
        </div>
      </section>

      {/* ── 주제 분포 도넛 차트 ── */}
      <section className="bw-detail-section" aria-labelledby="analytics-topic-heading">
        <h2 id="analytics-topic-heading" className="bw-detail-section-title">🍩 대화 주제 분포</h2>
        <div className="bw-features-card">
          {topicData.length === 0 ? (
            <p className="bw-detail-meta-text">저장된 대화가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: '0 0 260px', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {topicData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, n: string) => [`${v}건`, n]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {topicData.map((s) => (
                    <li key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} aria-hidden />
                      <span style={{ flex: 1, color: 'var(--text-primary)' }}>{s.name}</span>
                      <span style={{ fontWeight: 700, color: s.color }}>{s.value}건</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

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
            <>
              <div className="analytics-chart-header" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>감정·의도 분포</span>
                <div className="analytics-chart-toggle" role="group" aria-label="차트 유형">
                  {([['bar', '▊ 막대'], ['line', '📈 선'], ['pie', '🍩 파이']] as [typeof dashChartType, string][]).map(([t, lbl]) => (
                    <button key={t} type="button" className={`analytics-chart-toggle-btn${dashChartType === t ? ' analytics-chart-toggle-btn--active' : ''}`} onClick={() => setDashChartType(t)} aria-pressed={dashChartType === t}>{lbl}</button>
                  ))}
                </div>
              </div>
              <div className="bw-chart-container bw-chart-container--tall" role="img" aria-label="감정·의도 분포 차트">
                <ResponsiveContainer width="100%" height="100%">
                  {dashChartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {chartData.map((_entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border-overlay)', borderRadius: 4 }} />
                      <Legend />
                    </PieChart>
                  ) : dashChartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border-overlay)', borderRadius: 4 }} labelStyle={{ color: 'var(--text-primary)' }} />
                      <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} name="건수" />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border-overlay)', borderRadius: 4 }} labelStyle={{ color: 'var(--text-primary)' }} />
                      <Bar dataKey="count" fill={CHART_COLORS[0]} name="건수" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}
          {!loading && analytics != null && chartData.length === 0 && (
            <p className="bw-label-block bw-detail-meta-text">
              표시할 분포 데이터가 없습니다. 백엔드에서 emotion/intent 분포를 제공하면 차트가 표시됩니다.
            </p>
          )}
        </div>
      </section>

      {/* ── 시간대별 × 요일별 히트맵 ── */}
      {(() => {
        const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
        const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i}시`);
        const maxVal = Math.max(1, ...hourDowMatrix.flat());
        const totalByHour = Array.from({ length: 24 }, (_, h) =>
          hourDowMatrix.reduce((s, row) => s + row[h], 0)
        );
        const peakHour = totalByHour.indexOf(Math.max(...totalByHour));
        const totalByDow = hourDowMatrix.map(row => row.reduce((s, v) => s + v, 0));
        const peakDow = totalByDow.indexOf(Math.max(...totalByDow));
        return (
          <section className="bw-detail-section" aria-labelledby="analytics-hour-heading">
            <h2 id="analytics-hour-heading" className="bw-detail-section-title">⏰ 시간대 × 요일별 사용 히트맵</h2>
            <div className="bw-features-card">
              <div className="av-hour-meta">
                <span>피크 시간대: <strong>{peakHour}시</strong></span>
                <span>피크 요일: <strong>{DOW_LABELS[peakDow]}요일</strong></span>
              </div>
              <div className="av-hour-heatmap-wrap" aria-label="시간대별 요일별 사용 히트맵">
                <div className="av-hour-grid">
                  {/* 헤더: 시간 레이블 */}
                  <div className="av-hour-corner" />
                  {HOUR_LABELS.map((h, hi) => (
                    <div key={h} className="av-hour-label">{hi % 3 === 0 ? `${hi}h` : ''}</div>
                  ))}
                  {/* 요일 행 */}
                  {DOW_LABELS.map((dow, di) => (
                    <React.Fragment key={dow}>
                      <div className="av-dow-label">{dow}</div>
                      {hourDowMatrix[di].map((val, hi) => {
                        const intensity = Math.round((val / maxVal) * 4);
                        return (
                          <div
                            key={hi}
                            className={`av-hour-cell av-hour-cell--${intensity}`}
                            title={`${dow}요일 ${hi}시: ${val}건`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                {/* 범례 */}
                <div className="av-hour-legend">
                  <span className="av-hour-legend-label">없음</span>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className={`av-hour-cell av-hour-cell--${i}`} style={{ width: 14, height: 14 }} />
                  ))}
                  <span className="av-hour-legend-label">많음</span>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <section className="bw-detail-section" aria-labelledby="analytics-export-heading">
        <h2 id="analytics-export-heading" className="bw-detail-section-title">내보내기</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            로컬 대화 통계 · 주간 비교 · 주제 분포 · API 데이터를 CSV로 내보냅니다.
          </p>
          <div className="analytics-export-grid">
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                const csv = buildAnalyticsCsv(localStats, weeklyCompare, topicData, analytics);
                downloadCsv(csv, `analytics-full-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <span className="analytics-export-icon">📊</span>
              <span className="analytics-export-label">
                <strong>전체 통계 CSV</strong>
                <small>대화 · 주간 비교 · 주제 · API</small>
              </span>
            </button>

            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                const rows = [['날짜', '대화 수'], ...localStats.last7Days.map((d) => [d.date, String(d.count)])];
                downloadCsv(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'), `daily-trend-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <span className="analytics-export-icon">📅</span>
              <span className="analytics-export-label">
                <strong>일별 추이 CSV</strong>
                <small>최근 7일 대화 추이</small>
              </span>
            </button>

            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                const rows = [['요일', '이번 주', '지난 주'], ...weeklyCompare.map((r) => [r.day, String(r.thisWeek), String(r.lastWeek)])];
                downloadCsv(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'), `weekly-compare-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <span className="analytics-export-icon">📈</span>
              <span className="analytics-export-label">
                <strong>주간 비교 CSV</strong>
                <small>이번 주 vs 지난 주</small>
              </span>
            </button>

            {topicData.length > 0 && (
              <button
                type="button"
                className="analytics-export-btn"
                onClick={() => {
                  const rows = [['주제', '대화 수'], ...topicData.map((t) => [t.name, String(t.value)])];
                  downloadCsv(rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'), `topics-${new Date().toISOString().slice(0, 10)}.csv`);
                }}
              >
                <span className="analytics-export-icon">🍩</span>
                <span className="analytics-export-label">
                  <strong>주제 분포 CSV</strong>
                  <small>카테고리별 대화 수</small>
                </span>
              </button>
            )}
            {/* 스트릭 & 주간 목표 CSV */}
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
                const rows: string[][] = [
                  ['## 사용 스트릭'],
                  ['현재 스트릭(일)', String(streak.current)],
                  ['최장 스트릭(일)', String(streak.longest)],
                  ['이번 주 사용일', String(streak.weeklyUsed)],
                  ['주간 목표(일)', String(weeklyGoal)],
                  ['달성률(%)', `${Math.round((streak.weeklyUsed / weeklyGoal) * 100)}%`],
                  [''],
                  ['## 최근 7일 사용 현황'],
                  ['날짜', '사용 여부'],
                  ...(() => {
                    const result: string[][] = [];
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date();
                      d.setDate(d.getDate() - i);
                      const key = d.toISOString().slice(0, 10);
                      const used = streak.activeDays?.includes(key) ?? false;
                      result.push([key, used ? '✓' : '—']);
                    }
                    return result;
                  })(),
                ];
                downloadCsv(rows.map(r => r.map(q).join(',')).join('\n'), `streak-goal-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <span className="analytics-export-icon">🔥</span>
              <span className="analytics-export-label">
                <strong>스트릭 & 목표 CSV</strong>
                <small>사용 스트릭 · 주간 목표</small>
              </span>
            </button>
            {/* 커뮤니티 활동 CSV */}
            <button
              type="button"
              className="analytics-export-btn"
              onClick={() => {
                const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
                try {
                  const posts = JSON.parse(localStorage.getItem('corbu.community.posts') ?? '[]') as Array<{ id: string; title: string; category: string; author: string; createdAt: string; likes: number }>;
                  const replies = JSON.parse(localStorage.getItem('corbu.community.replies') ?? '{}') as Record<string, Array<unknown>>;
                  const rows: string[][] = [
                    ['## 커뮤니티 게시글'],
                    ['ID', '제목', '카테고리', '작성자', '날짜', '좋아요', '댓글 수'],
                    ...posts.map(p => [p.id, p.title, p.category, p.author, p.createdAt, String(p.likes), String((replies[p.id] ?? []).length)]),
                  ];
                  downloadCsv(rows.map(r => r.map(q).join(',')).join('\n'), `community-activity-${new Date().toISOString().slice(0, 10)}.csv`);
                } catch { /* ignore */ }
              }}
            >
              <span className="analytics-export-icon">🌐</span>
              <span className="analytics-export-label">
                <strong>커뮤니티 활동 CSV</strong>
                <small>게시글 · 좋아요 · 댓글 수</small>
              </span>
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

export default AnalyticsView;
