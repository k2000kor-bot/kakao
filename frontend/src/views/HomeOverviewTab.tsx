/**
 * 홈 요약 탭 — 모든 서브섹션의 주요 통계를 한눈에 표시
 * localStorage 데이터를 직접 읽어 실시간 수치 표시
 */
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AGENTS_PATH,
  ANALYTICS_PATH,
  AUTOMATION_PATH,
  COMMUNITY_PATH,
  TEAM_PATH,
  TEMPLATES_PATH,
  LEARN_PATH,
  SETTINGS_PATH,
  SEARCH_PATH,
} from '../config/routes';
import { CHATGPT_CONVERSATION_REMOVED_EVENT, CHATGPT_CONVERSATIONS_STORAGE_KEY, SIDEBAR_CHATS_UPDATED_EVENT } from '../services/chatGptUiStorageKeys';
import {
  CORBU_AUTOMATION_RUNS_KEY,
  CORBU_AUTOMATION_WORKFLOWS_KEY,
  CORBU_BILLING_PLAN_KEY,
  CORBU_COMMUNITY_POSTS_KEY,
  CORBU_COMMUNITY_REPLIES_KEY,
  CORBU_HOME_GOALS_KEY,
  CORBU_HOME_LAYOUT_COMPACT_KEY,
  CORBU_HOME_MOOD_KEY,
  CORBU_HOME_QUICK_MEMO_KEY,
  CORBU_HOME_STORAGE_UPDATED_EVENT,
  CORBU_HOME_SUGGEST_SEED_KEY,
  CORBU_LEARN_COMPLETED_AT_KEY,
  CORBU_LEARN_PROGRESS_KEY,
  CORBU_TEAM_ACTIVITY_KEY,
  CORBU_TEAM_MEMBERS_KEY,
  dispatchCorbuHomeStorageUpdated,
  isCorbuHomeSyncStorageKey,
} from '../services/corbuHomeStorageEvents';

const DASHBOARD_PATH = '/dashboard';
const CHAT_PATH = '/chat';

/* ── 목표 달성률 트래커 ── */
interface Goal { id: string; title: string; target: number; current: number; unit: string; color: string; }
const DEFAULT_GOALS: Goal[] = [
  { id: 'g1', title: '이번 달 대화 목표', target: 30, current: 0, unit: '회', color: '#6366f1' },
  { id: 'g2', title: '학습 완료 항목', target: 10, current: 0, unit: '개', color: '#10b981' },
  { id: 'g3', title: '템플릿 활용', target: 5, current: 0, unit: '회', color: '#f59e0b' },
];
function loadGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem(CORBU_HOME_GOALS_KEY) || 'null') ?? DEFAULT_GOALS; } catch { return DEFAULT_GOALS; }
}
function saveGoals(g: Goal[]): void {
  try {
    localStorage.setItem(CORBU_HOME_GOALS_KEY, JSON.stringify(g));
    dispatchCorbuHomeStorageUpdated();
  } catch { /* ignore */ }
}

/* ── AI 추천 프롬프트 ── */
const AI_PROMPT_POOL: { text: string; category: string; icon: string }[] = [
  { text: '최근 대화를 한 줄로 요약해줘', category: '요약', icon: '📝' },
  { text: '오늘 할 일 목록을 만들어줘', category: '생산성', icon: '✅' },
  { text: 'Python으로 CSV 파일 읽는 코드 작성해줘', category: '코드', icon: '💻' },
  { text: '이 텍스트를 영어로 번역해줘', category: '번역', icon: '🌐' },
  { text: '마케팅 이메일 초안을 작성해줘', category: '글쓰기', icon: '✉️' },
  { text: 'SWOT 분석 표를 만들어줘', category: '분석', icon: '📊' },
  { text: 'React 컴포넌트 테스트 코드 예시를 써줘', category: '코드', icon: '🧪' },
  { text: '회의록을 요약하고 액션 아이템을 추출해줘', category: '요약', icon: '🗒️' },
  { text: '블로그 포스트 아이디어 5가지 제안해줘', category: '창작', icon: '💡' },
  { text: 'SQL 쿼리로 중복 데이터 제거하는 방법 설명해줘', category: '코드', icon: '🗄️' },
  { text: '이 아이디어의 장단점을 분석해줘', category: '분석', icon: '⚖️' },
  { text: '발표 자료 개요를 작성해줘', category: '글쓰기', icon: '📑' },
];

function pickDailyPrompts(count = 6): typeof AI_PROMPT_POOL {
  const today = new Date().toDateString();
  let seed: number;
  try {
    const saved = JSON.parse(localStorage.getItem(CORBU_HOME_SUGGEST_SEED_KEY) ?? 'null') as { date: string; seed: number } | null;
    if (saved?.date === today) {
      seed = saved.seed;
    } else {
      seed = Math.floor(Math.random() * 10000);
      localStorage.setItem(CORBU_HOME_SUGGEST_SEED_KEY, JSON.stringify({ date: today, seed }));
      dispatchCorbuHomeStorageUpdated();
    }
  } catch {
    seed = 0;
  }
  const shuffled = [...AI_PROMPT_POOL].sort((a, b) => {
    const ha = (a.text.charCodeAt(0) + seed) % AI_PROMPT_POOL.length;
    const hb = (b.text.charCodeAt(0) + seed) % AI_PROMPT_POOL.length;
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

function AiSuggestedPrompts() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState(() => pickDailyPrompts(6));
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => setPrompts(pickDailyPrompts(6));
    window.addEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CORBU_HOME_SUGGEST_SEED_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleUse = (text: string) => {
    try {
      sessionStorage.setItem('corbu.pendingPrompt', text);
    } catch { /* ignore */ }
    navigate(CHAT_PATH);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => { /* ignore */ });
  };

  return (
    <section className="ho-section" aria-label="AI 추천 프롬프트">
      <h2 className="ho-section-title">✨ 오늘의 AI 추천 프롬프트</h2>
      <p className="ho-suggest-desc">매일 새롭게 추천되는 프롬프트 — 클릭하면 대화창으로 바로 이동합니다.</p>
      <div className="ho-suggest-grid">
        {prompts.map((p, i) => (
          <div key={i} className="ho-suggest-card">
            <span className="ho-suggest-icon" aria-hidden>{p.icon}</span>
            <div className="ho-suggest-body">
              <span className="ho-suggest-category">{p.category}</span>
              <p className="ho-suggest-text">{p.text}</p>
            </div>
            <div className="ho-suggest-actions">
              <button
                type="button"
                className="ho-suggest-use"
                onClick={() => handleUse(p.text)}
                aria-label="이 프롬프트로 대화 시작"
              >
                시작 →
              </button>
              <button
                type="button"
                className="ho-suggest-copy"
                onClick={() => handleCopy(p.text, i)}
                aria-label="프롬프트 복사"
                title="복사"
              >
                {copied === i ? '✓' : '📋'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 로컬스토리지 읽기 헬퍼 ── */
function readLocal<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v) return JSON.parse(v) as T;
  } catch { /* ignore */ }
  return fallback;
}

/** 답글 저장소는 객체(게시글 ID → 배열)만 사용한다 */
function readCommunityRepliesMap(): Record<string, { body?: string; createdAt?: string }[]> {
  try {
    const v = localStorage.getItem(CORBU_COMMUNITY_REPLIES_KEY);
    if (!v) return {};
    const parsed = JSON.parse(v) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, { body?: string; createdAt?: string }[]> = {};
    for (const [pid, list] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(list)) out[pid] = list as { body?: string; createdAt?: string }[];
    }
    return out;
  } catch {
    return {};
  }
}

interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  rawValue?: number;
  sub?: string;
  path: string;
  color: string;
}

/** 숫자를 0에서 target까지 duration ms에 걸쳐 카운트업 */
function useAnimatedNumber(target: number, duration = 700): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const from = prevTarget.current;
    prevTarget.current = target;
    startRef.current = null;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

function AnimatedStatValue({ value, rawValue }: { value: string | number; rawValue?: number }) {
  const animated = useAnimatedNumber(rawValue ?? (typeof value === 'number' ? value : 0));
  if (rawValue === undefined && typeof value !== 'number') {
    return <>{value}</>;
  }
  return <>{animated.toLocaleString()}</>;
}

interface RecentItem {
  icon: string;
  label: string;
  sub: string;
  path: string;
}

interface PinnedConv {
  id: string;
  title: string;
  pinned: boolean;
}

export default function HomeOverviewTab() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  interface TimelineEvent {
    ts: number;
    icon: string;
    label: string;
    path: string;
    category: string;
  }
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [pinnedConvs, setPinnedConvs] = useState<PinnedConv[]>([]);
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<string>('전체');
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [goalEditId, setGoalEditId] = useState<string | null>(null);
  const [goalEditVal, setGoalEditVal] = useState('');

  const updateGoalCurrent = useCallback((id: string, val: number) => {
    setGoals((prev) => {
      const next = prev.map((g) => g.id === id ? { ...g, current: Math.max(0, Math.min(g.target * 2, val)) } : g);
      saveGoals(next);
      return next;
    });
  }, []);

  const filteredTimeline = useMemo(() => {
    if (timelineCategoryFilter === '전체') return timeline;
    return timeline.filter(e => e.category === timelineCategoryFilter);
  }, [timeline, timelineCategoryFilter]);

  const timelineCategories = useMemo(() => {
    const cats = new Set(timeline.map(e => e.category));
    return ['전체', ...Array.from(cats)];
  }, [timeline]);

  /* 오늘의 무드/상태 배너 */
  interface MoodEntry { emoji: string; label: string; savedDate: string; }
  const MOOD_PRESETS = [
    { emoji: '😊', label: '좋음' }, { emoji: '😐', label: '보통' }, { emoji: '😔', label: '피곤함' },
    { emoji: '🔥', label: '집중' }, { emoji: '🤔', label: '고민 중' }, { emoji: '🎉', label: '즐거움' },
  ];
  const [mood, setMood] = useState<MoodEntry | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CORBU_HOME_MOOD_KEY) ?? 'null') as MoodEntry | null;
      if (saved?.savedDate === new Date().toDateString()) return saved;
      return null;
    } catch { return null; }
  });
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const selectMood = useCallback((emoji: string, label: string) => {
    const entry: MoodEntry = { emoji, label, savedDate: new Date().toDateString() };
    setMood(entry);
    setShowMoodPicker(false);
    try {
      localStorage.setItem(CORBU_HOME_MOOD_KEY, JSON.stringify(entry));
      dispatchCorbuHomeStorageUpdated();
    } catch { /* noop */ }
  }, []);

  const goalOverallPct = useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + Math.min(100, Math.round((g.current / g.target) * 100)), 0);
    return Math.round(sum / goals.length);
  }, [goals]);
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try { return localStorage.getItem(CORBU_HOME_LAYOUT_COMPACT_KEY) === 'true'; } catch { return false; }
  });
  const toggleCompact = useCallback(() => {
    setIsCompact(v => {
      const next = !v;
      try {
        localStorage.setItem(CORBU_HOME_LAYOUT_COMPACT_KEY, String(next));
        dispatchCorbuHomeStorageUpdated();
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; snippet: string }[]>([]);

  /* 빠른 메모 위젯 */
  const [quickMemo, setQuickMemo] = useState<string>(() => localStorage.getItem(CORBU_HOME_QUICK_MEMO_KEY) ?? '');
  const [memoEditing, setMemoEditing] = useState(false);
  const [memoDraft, setMemoDraft] = useState('');
  const memoTextareaRef = useRef<HTMLTextAreaElement>(null);

  const openMemoEditor = useCallback(() => {
    setMemoDraft(quickMemo);
    setMemoEditing(true);
    setTimeout(() => memoTextareaRef.current?.focus(), 50);
  }, [quickMemo]);

  const saveMemo = useCallback(() => {
    setQuickMemo(memoDraft);
    try {
      localStorage.setItem(CORBU_HOME_QUICK_MEMO_KEY, memoDraft);
      dispatchCorbuHomeStorageUpdated();
    } catch { /* ignore */ }
    setMemoEditing(false);
  }, [memoDraft]);

  const clearMemo = useCallback(() => {
    if (!window.confirm('메모를 삭제하시겠습니까?')) return;
    setQuickMemo('');
    try {
      localStorage.removeItem(CORBU_HOME_QUICK_MEMO_KEY);
      dispatchCorbuHomeStorageUpdated();
    } catch { /* ignore */ }
    setMemoEditing(false);
  }, []);
  const [allConvs, setAllConvs] = useState<{ id?: string; title?: string; content?: string; messages?: { content?: string }[]; pinned?: boolean }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const hits = allConvs
      .filter((c) => {
        const titleMatch = (c.title ?? '').toLowerCase().includes(lower);
        const contentMatch = (c.content ?? '').toLowerCase().includes(lower);
        const msgMatch = (c.messages ?? []).some((m) => (m.content ?? '').toLowerCase().includes(lower));
        return titleMatch || contentMatch || msgMatch;
      })
      .map((c) => {
        const text = c.content ?? c.messages?.map((m) => m.content).join(' ') ?? '';
        const idx = text.toLowerCase().indexOf(lower);
        const snippet = idx >= 0
          ? '…' + text.slice(Math.max(0, idx - 20), idx + 60).replace(/\n/g, ' ') + '…'
          : '';
        return { id: c.id ?? '', title: c.title || '(제목 없음)', snippet };
      })
      .slice(0, 8);
    setSearchResults(hits);
  }, [allConvs]);

  const loadHomeOverviewFromStorage = useCallback(() => {
    setGoals(loadGoals());

    try {
      const moodSaved = JSON.parse(localStorage.getItem(CORBU_HOME_MOOD_KEY) ?? 'null') as { emoji?: string; label?: string; savedDate?: string } | null;
      if (moodSaved?.savedDate === new Date().toDateString() && moodSaved.emoji && moodSaved.label) {
        setMood({ emoji: moodSaved.emoji, label: moodSaved.label, savedDate: moodSaved.savedDate });
      } else {
        setMood(null);
      }
    } catch {
      setMood(null);
    }
    try {
      setQuickMemo(localStorage.getItem(CORBU_HOME_QUICK_MEMO_KEY) ?? '');
    } catch {
      setQuickMemo('');
    }
    try {
      setIsCompact(localStorage.getItem(CORBU_HOME_LAYOUT_COMPACT_KEY) === 'true');
    } catch {
      setIsCompact(false);
    }

    /* 대화 */
    const convs: { createdAt?: string; messages?: unknown[] }[] = readLocal(CHATGPT_CONVERSATIONS_STORAGE_KEY, []);
    const convCount = convs.length;
    const today = new Date().toDateString();
    const todayCount = convs.filter((c) => {
      try { return new Date(c.createdAt ?? '').toDateString() === today; } catch { return false; }
    }).length;

    /* 워크플로우 */
    const workflows: { name?: string; status?: string }[] = readLocal(CORBU_AUTOMATION_WORKFLOWS_KEY, []);
    const activeWf = workflows.filter((w) => w.status === '활성' || w.status === 'active').length;

    /* 커뮤니티 */
    const posts: { title?: string; createdAt?: string }[] = readLocal(CORBU_COMMUNITY_POSTS_KEY, []);
    const communityReplies = readCommunityRepliesMap();
    const replyTotal = Object.values(communityReplies).reduce((n, arr) => n + arr.length, 0);

    /* 팀 */
    const members: { name?: string; status?: string }[] = readLocal(CORBU_TEAM_MEMBERS_KEY, []);
    const activeMembers = members.filter((m) => m.status === '활성' || m.status === 'active').length;

    /* 학습 */
    const progress: Record<string, number> = readLocal(CORBU_LEARN_PROGRESS_KEY, {});
    const completedCourses = Object.values(progress).filter((v) => v >= 100).length;

    /* 청구/플랜 */
    const plan: string = readLocal(CORBU_BILLING_PLAN_KEY, 'free');

    setStats([
      { icon: '💬', label: '전체 대화',    value: convCount,         rawValue: convCount,         sub: `오늘 ${todayCount}건`,          path: SEARCH_PATH,     color: '#3b82f6' },
      { icon: '⚡', label: '활성 워크플로', value: activeWf,          rawValue: activeWf,          sub: `전체 ${workflows.length}개`,    path: AUTOMATION_PATH, color: '#f59e0b' },
      { icon: '👥', label: '활성 팀원',    value: activeMembers,     rawValue: activeMembers,     sub: `전체 ${members.length}명`,      path: TEAM_PATH,       color: '#10b981' },
      { icon: '📝', label: '커뮤니티 글',  value: posts.length,      rawValue: posts.length,      sub: `답글 ${replyTotal}건`,           path: COMMUNITY_PATH,  color: '#8b5cf6' },
      { icon: '🎓', label: '완료 강의',    value: completedCourses,  rawValue: completedCourses,  sub: `진행 중 ${Object.keys(progress).length}개`, path: LEARN_PATH, color: '#ec4899' },
      { icon: '💳', label: '현재 플랜',   value: plan.toUpperCase(), rawValue: undefined,          sub: '구독 상태',                  path: '/billing',      color: '#64748b' },
    ]);

    /* 최근 활동 (최신 대화 3건, 최신 포스트 2건, 최근 실행 워크플로우 2건) */
    const items: RecentItem[] = [];

    convs.slice(0, 3).forEach((c: { title?: string; createdAt?: string }) => {
      items.push({
        icon: '💬',
        label: c.title || '(제목 없음)',
        sub: c.createdAt ? new Date(c.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        path: SEARCH_PATH,
      });
    });

    posts.slice(0, 2).forEach((p) => {
      items.push({
        icon: '📝',
        label: p.title || '(제목 없음)',
        sub: p.createdAt ? new Date(p.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric' }) : '',
        path: COMMUNITY_PATH,
      });
    });

    const runs: { workflow?: string; name?: string; at?: string }[] = readLocal(CORBU_AUTOMATION_RUNS_KEY, []);
    runs.slice(0, 2).forEach((r) => {
      items.push({
        icon: '⚡',
        label: r.workflow ?? r.name ?? '워크플로우 실행',
        sub: r.at
          ? (() => {
              const d = new Date(r.at as string);
              return Number.isNaN(d.getTime())
                ? String(r.at)
                : d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            })()
          : '',
        path: AUTOMATION_PATH,
      });
    });

    setRecentItems(items.slice(0, 7));

    /* 활동 타임라인 — 최근 20개 이벤트 (대화·커뮤니티·자동화·팀·학습) */
    const tlEvents: TimelineEvent[] = [];
    // 대화
    const convsFull: { id?: string; title?: string; createdAt?: string; updatedAt?: string }[] = readLocal(CHATGPT_CONVERSATIONS_STORAGE_KEY, []);
    convsFull.forEach((c) => {
      const ts = new Date(c.updatedAt ?? c.createdAt ?? '').getTime();
      if (!isNaN(ts)) tlEvents.push({ ts, icon: '💬', label: c.title || '새 대화', path: `/chat?id=${c.id ?? ''}`, category: '대화' });
    });
    // 커뮤니티 게시글
    const postsAll: { id?: string; title?: string; createdAt?: string }[] = readLocal(CORBU_COMMUNITY_POSTS_KEY, []);
    postsAll.forEach((p) => {
      const ts = new Date(p.createdAt ?? '').getTime();
      if (!isNaN(ts)) tlEvents.push({ ts, icon: '📣', label: p.title || '게시글', path: COMMUNITY_PATH, category: '커뮤니티' });
    });
    Object.entries(communityReplies).forEach(([postId, list]) => {
      if (!Array.isArray(list)) return;
      const postTitle = postsAll.find((p) => p.id === postId)?.title ?? postId;
      list.forEach((r) => {
        const ts = new Date(r.createdAt ?? '').getTime();
        if (!isNaN(ts)) {
          const snippet = (r.body ?? '').replace(/\s+/g, ' ').slice(0, 36);
          tlEvents.push({
            ts,
            icon: '↩️',
            label: snippet ? `답글 · ${postTitle} — ${snippet}` : `답글 · ${postTitle}`,
            path: COMMUNITY_PATH,
            category: '커뮤니티',
          });
        }
      });
    });
    // 자동화 실행
    const automationRuns: { id?: string; workflow?: string; at?: string; ok?: boolean }[] = readLocal(CORBU_AUTOMATION_RUNS_KEY, []);
    automationRuns.forEach((r) => {
      const ts = new Date(r.at ?? '').getTime();
      if (!isNaN(ts)) {
        const ok = r.ok !== false;
        tlEvents.push({
          ts,
          icon: ok ? '✅' : '❌',
          label: `워크플로우 실행 (${r.workflow ?? r.id ?? ''})`,
          path: AUTOMATION_PATH,
          category: '자동화',
        });
      }
    });
    // 팀 활동
    const teamActivity: { id?: string; type?: string; memberName?: string; detail?: string; at?: string; ts?: string }[] = readLocal(CORBU_TEAM_ACTIVITY_KEY, []);
    teamActivity.forEach((a) => {
      const ts = new Date(a.ts ?? a.at ?? '').getTime();
      if (!isNaN(ts)) {
        const icon = a.type === 'invite' ? '👋' : a.type === 'role_change' ? '🔑' : a.type === 'remove' ? '🗑️' : '👥';
        tlEvents.push({ ts, icon, label: `${a.memberName ?? '팀원'} — ${a.detail ?? a.type ?? '팀 활동'}`, path: TEAM_PATH, category: '팀' });
      }
    });
    // 학습 진도 (100% 완료된 코스)
    const learnProgress: Record<string, number> = readLocal(CORBU_LEARN_PROGRESS_KEY, {});
    const completedAtMap: Record<string, string> = readLocal(CORBU_LEARN_COMPLETED_AT_KEY, {});
    const completedCourseIds = Object.entries(learnProgress).filter(([, v]) => v >= 100).map(([k]) => k);
    [...completedCourseIds].sort().forEach((courseId) => {
      const parsed = completedAtMap[courseId] ? new Date(completedAtMap[courseId]).getTime() : NaN;
      let ts = parsed;
      if (Number.isNaN(ts)) {
        let h = 0;
        for (let i = 0; i < courseId.length; i++) h = (Math.imul(31, h) + courseId.charCodeAt(i)) >>> 0;
        ts = 1_700_000_000_000 + (h % 86_400_000);
      }
      tlEvents.push({ ts, icon: '🎓', label: `${courseId} 학습 완료`, path: LEARN_PATH, category: '학습' });
    });
    tlEvents.sort((a, b) => b.ts - a.ts);
    setTimeline(tlEvents.slice(0, 20));

    /* 고정된 대화 */
    const storedConvs: { id?: string; title?: string; content?: string; messages?: { content?: string }[]; pinned?: boolean }[] =
      readLocal(CHATGPT_CONVERSATIONS_STORAGE_KEY, []);
    setAllConvs(storedConvs);
    setPinnedConvs(
      storedConvs
        .filter((c) => c.pinned)
        .map((c) => ({ id: c.id ?? '', title: c.title || '(제목 없음)', pinned: true }))
        .slice(0, 5)
    );
  }, []);

  useEffect(() => {
    loadHomeOverviewFromStorage();
  }, [loadHomeOverviewFromStorage]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (isCorbuHomeSyncStorageKey(e.key)) loadHomeOverviewFromStorage();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(SIDEBAR_CHATS_UPDATED_EVENT, loadHomeOverviewFromStorage);
    window.addEventListener(CHATGPT_CONVERSATION_REMOVED_EVENT, loadHomeOverviewFromStorage);
    window.addEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, loadHomeOverviewFromStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SIDEBAR_CHATS_UPDATED_EVENT, loadHomeOverviewFromStorage);
      window.removeEventListener(CHATGPT_CONVERSATION_REMOVED_EVENT, loadHomeOverviewFromStorage);
      window.removeEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, loadHomeOverviewFromStorage);
    };
  }, [loadHomeOverviewFromStorage]);

  const quickLinks = [
    { icon: '🖥️', label: '대시보드',  path: DASHBOARD_PATH },
    { icon: '✨', label: '에이전트',  path: AGENTS_PATH },
    { icon: '📈', label: '분석',      path: ANALYTICS_PATH },
    { icon: '⚡', label: '자동화',    path: AUTOMATION_PATH },
    { icon: '📋', label: '템플릿',    path: TEMPLATES_PATH },
    { icon: '💬', label: '커뮤니티',  path: COMMUNITY_PATH },
    { icon: '👥', label: '팀',        path: TEAM_PATH },
    { icon: '🎓', label: '학습',      path: LEARN_PATH },
    { icon: '⚙️', label: '설정',      path: SETTINGS_PATH },
  ];

  return (
    <div className={`ho-root${isCompact ? ' ho-root--compact' : ''}`}>
      {/* ── 오늘의 무드 배너 ── */}
      <div className="ho-mood-banner">
        {mood ? (
          <>
            <span className="ho-mood-emoji" title={mood.label}>{mood.emoji}</span>
            <span className="ho-mood-label">오늘 기분: <strong>{mood.label}</strong></span>
            <button type="button" className="ho-mood-change-btn" onClick={() => setShowMoodPicker(p => !p)}>
              변경
            </button>
          </>
        ) : (
          <>
            <span className="ho-mood-emoji">✨</span>
            <span className="ho-mood-label">오늘 기분이 어때요?</span>
            <button type="button" className="ho-mood-change-btn" onClick={() => setShowMoodPicker(p => !p)}>
              선택
            </button>
          </>
        )}
        {showMoodPicker && (
          <div className="ho-mood-picker">
            {MOOD_PRESETS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                className={`ho-mood-option${mood?.emoji === emoji ? ' ho-mood-option--active' : ''}`}
                onClick={() => selectMood(emoji, label)}
                title={label}
                aria-label={label}
              >
                {emoji}
                <span className="ho-mood-option-label">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 레이아웃 토글 ── */}
      <div className="ho-layout-toggle-row">
        <button
          type="button"
          className={`ho-layout-toggle-btn${isCompact ? ' ho-layout-toggle-btn--active' : ''}`}
          onClick={toggleCompact}
          aria-pressed={isCompact}
          title={isCompact ? '일반 레이아웃으로 전환' : '콤팩트 레이아웃으로 전환'}
        >
          {isCompact ? '⊞ 일반 보기' : '⊟ 콤팩트'}
        </button>
      </div>

      {/* ── 빠른 메모 위젯 ── */}
      <section className="ho-section ho-memo-section" aria-label="빠른 메모">
        <div className="ho-memo-header">
          <h2 className="ho-section-title" style={{ margin: 0 }}>📝 빠른 메모</h2>
          <div className="ho-memo-header-actions">
            {!memoEditing && <button type="button" className="ho-memo-btn" onClick={openMemoEditor} aria-label="메모 편집">✏️ 편집</button>}
            {quickMemo && !memoEditing && <button type="button" className="ho-memo-btn ho-memo-btn--danger" onClick={clearMemo} aria-label="메모 삭제">🗑</button>}
          </div>
        </div>
        {memoEditing ? (
          <div className="ho-memo-edit">
            <textarea
              ref={memoTextareaRef}
              className="ho-memo-textarea"
              value={memoDraft}
              onChange={e => setMemoDraft(e.target.value)}
              placeholder="자유롭게 메모하세요…"
              rows={4}
              onKeyDown={e => { if (e.key === 'Escape') { setMemoEditing(false); } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveMemo(); }}
              aria-label="메모 입력"
            />
            <div className="ho-memo-edit-actions">
              <button type="button" className="ho-memo-save-btn" onClick={saveMemo} aria-label="저장">저장 (Ctrl+Enter)</button>
              <button type="button" className="ho-memo-cancel-btn" onClick={() => setMemoEditing(false)} aria-label="취소">취소</button>
            </div>
          </div>
        ) : (
          <div
            className={`ho-memo-display${!quickMemo ? ' ho-memo-display--empty' : ''}`}
            onClick={openMemoEditor}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openMemoEditor(); }}
            aria-label="메모 편집하기"
          >
            {quickMemo
              ? quickMemo.split('\n').map((line, i) => <p key={i} className="ho-memo-line">{line || <br />}</p>)
              : <span className="ho-memo-placeholder">클릭해서 메모를 작성하세요…</span>}
          </div>
        )}
      </section>

      {/* ── 대화 빠른 검색 ── */}
      <section className="ho-section" aria-label="대화 검색">
        <h2 className="ho-section-title">🔍 대화 검색</h2>
        <div className="ho-search-bar">
          <input
            ref={searchInputRef}
            type="search"
            className="ho-search-input"
            placeholder={`저장된 대화 ${allConvs.length}개에서 검색…`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="대화 검색"
          />
          {searchQuery && (
            <button
              type="button"
              className="ho-search-clear"
              onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus(); }}
              aria-label="검색어 지우기"
            >✕</button>
          )}
        </div>
        {searchResults.length > 0 && (
          <ul className="ho-search-results" role="listbox" aria-label="검색 결과">
            {searchResults.map((r) => (
              <li key={r.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="ho-search-result-item"
                  onClick={() => { navigate(`/chat?id=${r.id}`); }}
                  aria-label={`대화로 이동: ${r.title}`}
                >
                  <span className="ho-search-result-title">💬 {r.title}</span>
                  {r.snippet && <span className="ho-search-result-snippet">{r.snippet}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchQuery && searchResults.length === 0 && (
          <p className="ho-search-empty">일치하는 대화가 없습니다.</p>
        )}
      </section>

      {/* ── 통계 카드 ── */}
      <section className="ho-section" aria-label="주요 통계">
        <h2 className="ho-section-title">📊 주요 통계</h2>
        {isCompact ? (
          <div className="ho-stat-compact-list">
            {stats.map((s) => (
              <button
                key={s.label}
                type="button"
                className="ho-stat-compact-item"
                style={{ '--ho-accent': s.color } as React.CSSProperties}
                onClick={() => navigate(s.path)}
                aria-label={`${s.label}: ${s.value}`}
              >
                <span className="ho-stat-compact-icon">{s.icon}</span>
                <span className="ho-stat-compact-label">{s.label}</span>
                <strong className="ho-stat-compact-value" style={{ color: s.color }}>
                  <AnimatedStatValue value={s.value} rawValue={s.rawValue} />
                </strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="ho-stat-grid">
            {stats.map((s) => (
              <button
                key={s.label}
                type="button"
                className="ho-stat-card"
                style={{ '--ho-accent': s.color } as React.CSSProperties}
                onClick={() => navigate(s.path)}
                aria-label={`${s.label}: ${s.value}`}
              >
                <span className="ho-stat-icon">{s.icon}</span>
                <strong className="ho-stat-value">
                  <AnimatedStatValue value={s.value} rawValue={s.rawValue} />
                </strong>
                <span className="ho-stat-label">{s.label}</span>
                {s.sub && <span className="ho-stat-sub">{s.sub}</span>}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── 고정된 대화 ── */}
      {pinnedConvs.length > 0 && (
        <section className="ho-section" aria-label="고정된 대화">
          <h2 className="ho-section-title">📌 고정된 대화</h2>
          <div className="ho-pinned-list">
            {pinnedConvs.map((c) => (
              <button
                key={c.id}
                type="button"
                className="ho-pinned-item"
                onClick={() => navigate(`/chat?id=${c.id}`)}
                aria-label={`고정된 대화: ${c.title}`}
              >
                <span className="ho-pinned-icon">📌</span>
                <span className="ho-pinned-title">{c.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="ho-two-col">
        {/* ── 최근 활동 ── */}
        <section className="ho-section" aria-label="최근 활동">
          <h2 className="ho-section-title">🕐 최근 활동</h2>
          {recentItems.length === 0 ? (
            <p className="ho-empty">활동 기록이 없습니다.</p>
          ) : (
            <ul className="ho-activity-list">
              {recentItems.map((item, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="ho-activity-row"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="ho-activity-icon">{item.icon}</span>
                    <span className="ho-activity-label">{item.label}</span>
                    {item.sub && <span className="ho-activity-sub">{item.sub}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── 빠른 이동 ── */}
        <section className="ho-section" aria-label="빠른 이동">
          <h2 className="ho-section-title">🚀 빠른 이동</h2>
          <div className="ho-quicklinks">
            {quickLinks.map((l) => (
              <button
                key={l.label}
                type="button"
                className="ho-quicklink-btn"
                onClick={() => navigate(l.path)}
              >
                <span className="ho-quicklink-icon">{l.icon}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── 퀵 액션 타일 ── */}
      <section className="ho-section" aria-label="빠른 실행">
        <h2 className="ho-section-title">⚡ 빠른 실행</h2>
        {isCompact ? (
          <div className="ho-quick-compact-row">
            {[
              { icon: '💬', label: '새 대화', path: '/chat', highlight: true },
              { icon: '🤖', label: '에이전트', path: '/agents' },
              { icon: '📋', label: '템플릿', path: '/templates' },
              { icon: '⚡', label: '자동화', path: '/automation' },
              { icon: '📊', label: '분석', path: '/analytics' },
              { icon: '🔍', label: '검색', path: '/search' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                className={`ho-quick-compact-btn${item.highlight ? ' ho-quick-compact-btn--primary' : ''}`}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ho-quick-grid">
            {[
              { icon: '💬', label: '새 대화', desc: '빈 대화창 시작', path: '/chat', highlight: true },
              { icon: '🤖', label: '에이전트 허브', desc: '특화 AI 선택', path: '/agents' },
              { icon: '📋', label: '템플릿 적용', desc: '프롬프트 재사용', path: '/templates' },
              { icon: '⚡', label: '자동화 실행', desc: '워크플로우 시작', path: '/automation' },
              { icon: '📊', label: '분석 보기', desc: '대화 통계 확인', path: '/analytics' },
              { icon: '📄', label: '문서 열기', desc: '사용법·가이드', path: '/docs' },
              { icon: '⚙️', label: '설정', desc: '앱 환경 구성', path: '/settings' },
              { icon: '🔍', label: '검색', desc: '전체 내용 검색', path: '/search' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                className={`ho-quick-tile${item.highlight ? ' ho-quick-tile--primary' : ''}`}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                <span className="ho-quick-icon" aria-hidden>{item.icon}</span>
                <span className="ho-quick-label">{item.label}</span>
                <span className="ho-quick-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── 활동 타임라인 ── */}
      {timeline.length > 0 && (
        <section className="ho-section" aria-label="활동 타임라인">
          <div className="ho-timeline-header">
            <h2 className="ho-section-title" style={{ margin: 0 }}>📅 활동 타임라인</h2>
            <span className="ho-timeline-count">{filteredTimeline.length}건</span>
          </div>
          {/* 카테고리 필터 */}
          <div className="ho-timeline-filters" role="group" aria-label="타임라인 필터">
            {timelineCategories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`ho-timeline-filter-btn${timelineCategoryFilter === cat ? ' ho-timeline-filter-btn--active' : ''}`}
                onClick={() => setTimelineCategoryFilter(cat)}
                aria-pressed={timelineCategoryFilter === cat}
              >
                {cat}
              </button>
            ))}
          </div>
          <ol className="ho-timeline" aria-label="최근 활동 목록">
            {filteredTimeline.length === 0 ? (
              <li className="ho-timeline-empty">이 카테고리의 활동 내역이 없습니다.</li>
            ) : (() => {
              const todayStr = new Date().toDateString();
              const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
              let lastDateLabel = '';
              return filteredTimeline.map((ev, i) => {
                const d = new Date(ev.ts);
                const dStr = d.toDateString();
                const dateLabel = dStr === todayStr ? '오늘' : dStr === yesterdayStr ? '어제' : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                const showDivider = dateLabel !== lastDateLabel;
                lastDateLabel = dateLabel;
                const isToday = dStr === todayStr;
                const timeStr = isToday
                  ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                  : d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <React.Fragment key={i}>
                    {showDivider && (
                      <li className="ho-timeline-date-divider" role="separator">
                        <span className="ho-timeline-date-label">{dateLabel}</span>
                      </li>
                    )}
                    <li className="ho-timeline-item">
                      <span className="ho-timeline-dot" aria-hidden>{ev.icon}</span>
                      <button
                        type="button"
                        className="ho-timeline-body"
                        onClick={() => navigate(ev.path)}
                        aria-label={`${ev.category}: ${ev.label}`}
                      >
                        <span className="ho-timeline-label">{ev.label}</span>
                        <span className="ho-timeline-meta">
                          <span className="ho-timeline-category">{ev.category}</span>
                          <time className="ho-timeline-time" dateTime={d.toISOString()}>{timeStr}</time>
                        </span>
                      </button>
                    </li>
                  </React.Fragment>
                );
              });
            })()}
          </ol>
        </section>
      )}

      {/* ── 목표 달성률 트래커 ── */}
      <section className="ho-section" aria-label="목표 달성률 트래커">
        <div className="ho-goals-header">
          <h2 className="ho-section-title" style={{ margin: 0 }}>🎯 목표 달성률</h2>
          <div className="ho-goals-overall">
            <div className="ho-goals-overall-ring" style={{ '--ring-pct': `${goalOverallPct}` } as React.CSSProperties}>
              <span className="ho-goals-overall-val">{goalOverallPct}%</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>전체 평균</span>
          </div>
        </div>
        <div className="ho-goals-list">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const isEditing = goalEditId === g.id;
            return (
              <div key={g.id} className="ho-goal-row">
                <div className="ho-goal-info">
                  <span className="ho-goal-title">{g.title}</span>
                  <span className="ho-goal-count" style={{ color: g.color }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="ho-goal-edit-input"
                        value={goalEditVal}
                        min={0}
                        max={g.target * 2}
                        onChange={(e) => setGoalEditVal(e.target.value)}
                        onBlur={() => {
                          updateGoalCurrent(g.id, Number(goalEditVal));
                          setGoalEditId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { updateGoalCurrent(g.id, Number(goalEditVal)); setGoalEditId(null); }
                          if (e.key === 'Escape') setGoalEditId(null);
                        }}
                        autoFocus
                        style={{ width: 48 }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="ho-goal-current-btn"
                        title="클릭하여 현재 값 편집"
                        onClick={() => { setGoalEditId(g.id); setGoalEditVal(String(g.current)); }}
                        style={{ color: g.color }}
                      >
                        {g.current}
                      </button>
                    )}
                    <span style={{ opacity: 0.5 }}> / {g.target}{g.unit}</span>
                  </span>
                </div>
                <div className="ho-goal-bar-track">
                  <div
                    className="ho-goal-bar-fill"
                    style={{ width: `${pct}%`, background: g.color }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${g.title} ${pct}%`}
                  />
                </div>
                <span className="ho-goal-pct" style={{ color: pct >= 100 ? '#10b981' : g.color }}>
                  {pct >= 100 ? '✅' : `${pct}%`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI 추천 프롬프트 ── */}
      <AiSuggestedPrompts />
    </div>
  );
}
