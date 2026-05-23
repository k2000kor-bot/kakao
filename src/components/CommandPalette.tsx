/**
 * 글로벌 커맨드 팔레트 — Ctrl+K / Cmd+K 로 열기
 * 모든 페이지·라우트를 검색 후 키보드로 이동
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultRoutes, extendedRoutes } from '../config/routes';

/* ── 명령 목록 ── */
type CommandCategory = 'recent' | 'ai' | 'page' | 'tool' | 'setting' | 'other';

interface Command {
  id: string;
  icon: string;
  name: string;
  description: string;
  path: string;
  keywords?: string[];
  category?: CommandCategory;
}

const CATEGORY_META: Record<CommandCategory, { label: string; icon: string }> = {
  recent:  { label: '최근 사용',  icon: '' },
  ai:      { label: 'AI 기능',    icon: '' },
  page:    { label: '페이지',     icon: '' },
  tool:    { label: '도구',       icon: '' },
  setting: { label: '설정',       icon: '' },
  other:   { label: '기타',       icon: '' },
};

function inferCategory(path: string): CommandCategory {
  if (path.startsWith('/chat') || path === '/agents' || path.includes('genspark')) return 'ai';
  if (path === '/settings' || path.includes('billing') || path.includes('team')) return 'setting';
  if (path.includes('voice') || path.includes('image') || path.includes('automation') || path.includes('dashboard') || path.includes('graph')) return 'tool';
  if (path.includes('analytics') || path.includes('learn') || path.includes('community') || path.includes('docs') || path.includes('search') || path.includes('project')) return 'page';
  return 'other';
}

const EXTRA_COMMANDS: Command[] = [
  { id: 'new-chat',   icon: '', name: '새 대화 시작',   description: '새로운 AI 대화를 시작합니다',       path: '/chat',      keywords: ['new', 'chat', '대화'], category: 'ai' },
  { id: 'dashboard',  icon: '', name: '시스템 대시보드', description: 'CPU·메모리·네트워크 모니터링',      path: '/dashboard', keywords: ['dash', 'monitor', '대시'], category: 'tool' },
  { id: 'voice',      icon: '', name: '목소리 생성',    description: '텍스트를 음성(TTS)으로 변환',        path: '/voice-generation', keywords: ['tts', 'voice', '음성'], category: 'tool' },
  { id: 'graph',      icon: '', name: '대화 관계도',    description: '대화 참여자 관계 시각화',           path: '/conversation-graph', keywords: ['graph', '관계도', '그래프'], category: 'tool' },
];

function buildCommands(): Command[] {
  const seen = new Set<string>();
  const cmds: Command[] = [];

  const add = (r: { path: string; name: string; description?: string; icon?: string }) => {
    if (seen.has(r.path)) return;
    seen.add(r.path);
    cmds.push({
      id: r.path,
      icon: '',
      name: r.name,
      description: r.description ?? '',
      path: r.path,
      category: inferCategory(r.path),
    });
  };

  EXTRA_COMMANDS.forEach((c) => { seen.add(c.path); cmds.push(c); });
  defaultRoutes.forEach(add);
  extendedRoutes.forEach(add);
  return cmds;
}

const ALL_COMMANDS = buildCommands();

/* ── 최근 사용 내역 ── */
const RECENT_KEY = 'corbu.cmdpalette.recent';
const RECENT_MAX = 6;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(id: string) {
  try {
    const prev = loadRecent().filter((r) => r !== id);
    const next = [id, ...prev].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="cp-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ── 컴포넌트 ── */
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* 열릴 때마다 최근 내역 다시 로드 */
  useEffect(() => {
    if (open) setRecentIds(loadRecent());
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      /* 검색어 없으면: 최근 사용 → 나머지 */
      const recentCmds = recentIds
        .map((id) => ALL_COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as Command[];
      const rest = ALL_COMMANDS.filter((c) => !recentIds.includes(c.id));
      return [...recentCmds, ...rest];
    }
    return ALL_COMMANDS.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.path.toLowerCase().includes(q) ||
      (c.keywords ?? []).some((k) => k.includes(q))
    );
  }, [query, recentIds]);

  /** 검색 중일 때 카테고리별 그룹으로 변환 */
  const groupedResults = useMemo(() => {
    if (!query.trim()) return null;
    const groups: Record<string, Command[]> = {};
    filtered.forEach(cmd => {
      const cat = cmd.category ?? 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    const ORDER: CommandCategory[] = ['ai', 'tool', 'page', 'setting', 'other'];
    return ORDER
      .filter(k => groups[k]?.length)
      .map(k => ({ category: k as CommandCategory, items: groups[k] }));
  }, [filtered, query]);

  /* 열릴 때 초기화 */
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* 선택 인덱스가 필터 범위 초과 방지 */
  useEffect(() => {
    setSelectedIdx((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  /* 선택 항목 스크롤 보정 */
  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  const execute = useCallback((cmd: Command) => {
    saveRecent(cmd.id);
    onClose();
    navigate(cmd.path);
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % Math.max(1, filtered.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIdx]) execute(filtered[selectedIdx]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  }, [filtered, selectedIdx, execute, onClose]);

  if (!open) return null;

  return (
    <div
      className="cp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="커맨드 팔레트"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cp-dialog" onKeyDown={handleKeyDown}>
        {/* 검색 입력 */}
        <div className="cp-search-row">
          <span className="cp-search-icon" aria-hidden>🔍</span>
          <input
            ref={inputRef}
            className="cp-input"
            type="text"
            placeholder="기능·페이지 검색..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            aria-label="커맨드 검색"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cp-esc-hint">ESC</kbd>
        </div>

        {/* 결과 목록 */}
        <ul
          ref={listRef}
          className="cp-list"
          role="listbox"
          aria-label="검색 결과"
        >
          {filtered.length === 0 ? (
            <li className="cp-empty">검색 결과가 없습니다.</li>
          ) : groupedResults ? (
            /* 검색 결과: 카테고리별 그룹 */
            (() => {
              let globalIdx = 0;
              return groupedResults.map(group => (
                <React.Fragment key={group.category}>
                  <li className="cp-section-header" role="presentation">
                    {CATEGORY_META[group.category].icon ? (
                      <span className="cp-section-icon">{CATEGORY_META[group.category].icon}</span>
                    ) : null}
                    {CATEGORY_META[group.category].label}
                    <span className="cp-section-count">{group.items.length}</span>
                  </li>
                  {group.items.map(cmd => {
                    const idx = globalIdx++;
                    return (
                      <li
                        key={cmd.id}
                        role="option"
                        aria-selected={idx === selectedIdx}
                        className={`cp-item${idx === selectedIdx ? ' cp-item--active' : ''}`}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                      >
                        {cmd.icon ? <span className="cp-item-icon" aria-hidden>{cmd.icon}</span> : null}
                        <span className="cp-item-body">
                          <span className="cp-item-name">{highlight(cmd.name, query)}</span>
                          {cmd.description && (
                            <span className="cp-item-desc">{highlight(cmd.description, query)}</span>
                          )}
                        </span>
                        <span className="cp-item-path">{cmd.path}</span>
                      </li>
                    );
                  })}
                </React.Fragment>
              ));
            })()
          ) : (
            /* 초기 목록: 최근 사용 → 모든 기능 */
            filtered.map((cmd, idx) => {
              const isRecentBoundary = !query && idx === recentIds.length && recentIds.length > 0;
              const isRecentItem = !query && recentIds.includes(cmd.id);
              return (
                <React.Fragment key={cmd.id}>
                  {isRecentBoundary && (
                    <li className="cp-section-header" role="presentation">
                      모든 기능
                    </li>
                  )}
                  {!query && idx === 0 && recentIds.length > 0 && (
                    <li className="cp-section-header" role="presentation">
                      최근 사용
                      <span className="cp-section-count">{recentIds.length}</span>
                    </li>
                  )}
                  <li
                    role="option"
                    aria-selected={idx === selectedIdx}
                    className={`cp-item${idx === selectedIdx ? ' cp-item--active' : ''}`}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    {cmd.icon ? <span className="cp-item-icon" aria-hidden>{cmd.icon}</span> : null}
                    <span className="cp-item-body">
                      <span className="cp-item-name">{highlight(cmd.name, query)}</span>
                      {cmd.description && (
                        <span className="cp-item-desc">{highlight(cmd.description, query)}</span>
                      )}
                    </span>
                    {isRecentItem
                      ? <span className="cp-item-recent" aria-label="최근 사용">최근</span>
                      : <span className="cp-item-path">{cmd.path}</span>
                    }
                  </li>
                </React.Fragment>
              );
            })
          )}
        </ul>

        {/* 하단 힌트 */}
        <div className="cp-footer">
          <span><kbd>↑↓</kbd> 이동</span>
          <span><kbd>Enter</kbd> 이동</span>
          <span><kbd>Esc</kbd> 닫기</span>
          <span className="cp-footer-count">{filtered.length}개 결과</span>
        </div>
      </div>
    </div>
  );
}
