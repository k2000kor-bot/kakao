/**
 * 팀·멤버·권한 뷰 (확장 범위) — teamViewService 목데이터
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTeamSummary,
  normalizeTeamSummary,
  type TeamSummary,
} from '../services/teamViewService';
import { showToast } from '../utils/toast';

const TEAM_MEMBERS_KEY = 'corbu.team.members';
const TEAM_ACTIVITY_KEY = 'corbu.team.activity';

type ActivityType = 'invite' | 'role_change' | 'remove' | 'join' | 'chat' | 'doc';
interface ActivityItem {
  id: string;
  memberName: string;
  type: ActivityType;
  detail: string;
  ts: string; // ISO
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  invite: '📨', role_change: '🔄', remove: '🗑', join: '✅', chat: '💬', doc: '📄',
};

function loadActivity(): ActivityItem[] {
  try { return JSON.parse(localStorage.getItem(TEAM_ACTIVITY_KEY) || '[]'); } catch { return []; }
}
function pushActivity(item: Omit<ActivityItem, 'id' | 'ts'>): void {
  try {
    const list = loadActivity();
    const next = [{ ...item, id: `act-${Date.now()}`, ts: new Date().toISOString() }, ...list].slice(0, 50);
    localStorage.setItem(TEAM_ACTIVITY_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

type MemberRole = '뷰어' | '편집자' | '관리자';
type MemberStatus = '활성' | '초대중' | '비활성';

interface LocalMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  tags?: string[];
}

const DEFAULT_MEMBERS: LocalMember[] = [
  { id: 'm1', name: '김관리자', email: 'admin@corbu.ai', role: '관리자', status: '활성' },
  { id: 'm2', name: '이편집자', email: 'editor@corbu.ai', role: '편집자', status: '활성' },
  { id: 'm3', name: '박뷰어', email: 'viewer@corbu.ai', role: '뷰어', status: '초대중' },
];

const PERMISSION_ROWS = [
  { scope: '프로젝트', viewer: '읽기', editor: '편집', admin: '전체' },
  { scope: '대화·노트북', viewer: '읽기', editor: '메시지', admin: '공유·삭제' },
  { scope: '청구·플랜', viewer: '—', editor: '—', admin: '전체' },
];

const ROLE_OPTIONS: MemberRole[] = ['뷰어', '편집자', '관리자'];

function loadMembers(): LocalMember[] {
  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_KEY);
    return raw ? (JSON.parse(raw) as LocalMember[]) : DEFAULT_MEMBERS;
  } catch { return DEFAULT_MEMBERS; }
}

function TeamView() {
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<LocalMember[]>(() => loadMembers());
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(() => loadActivity());
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [activityMemberFilter, setActivityMemberFilter] = useState<string>('all');
  const [activityDays, setActivityDays] = useState<number>(30);

  const saveMembers = useCallback((updated: LocalMember[]) => {
    setMembers(updated);
    try { localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  const refreshActivity = useCallback(() => setActivityLog(loadActivity()), []);

  const filteredActivity = useMemo(() => {
    const cutoff = new Date(Date.now() - activityDays * 86400000).toISOString();
    return activityLog
      .filter((a) => a.ts >= cutoff)
      .filter((a) => activityFilter === 'all' || a.type === activityFilter)
      .filter((a) => activityMemberFilter === 'all' || a.memberName === activityMemberFilter);
  }, [activityLog, activityFilter, activityMemberFilter, activityDays]);

  /* 팀원 태그 관리 */
  const [memberTagInput, setMemberTagInput] = useState<Record<string, string>>({});
  const [memberTagOpen, setMemberTagOpen] = useState<string | null>(null);
  const [memberTagFilter, setMemberTagFilter] = useState<string | null>(null);

  const allMemberTags = useMemo(() => {
    const set = new Set<string>();
    members.forEach(m => (m.tags ?? []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [members]);

  const addMemberTag = useCallback((memberId: string, tag: string) => {
    const t = tag.trim();
    if (!t) return;
    saveMembers(members.map(m =>
      m.id === memberId
        ? { ...m, tags: [...new Set([...(m.tags ?? []), t])].slice(0, 6) }
        : m
    ));
    setMemberTagInput(prev => ({ ...prev, [memberId]: '' }));
  }, [members, saveMembers]);

  const removeMemberTag = useCallback((memberId: string, tag: string) => {
    saveMembers(members.map(m =>
      m.id === memberId ? { ...m, tags: (m.tags ?? []).filter(t => t !== tag) } : m
    ));
  }, [members, saveMembers]);

  const filteredMembers = useMemo(() =>
    memberTagFilter ? members.filter(m => (m.tags ?? []).includes(memberTagFilter)) : members,
    [members, memberTagFilter]
  );

  // 역할별 통계
  const roleStats = useMemo(() => {
    const counts: Record<MemberRole, number> = { '관리자': 0, '편집자': 0, '뷰어': 0 };
    members.forEach(m => { counts[m.role]++; });
    const statusCounts = { '활성': 0, '초대중': 0, '비활성': 0 };
    members.forEach(m => { statusCounts[m.status]++; });
    return { counts, statusCounts };
  }, [members]);

  // 활동 타임라인 멤버 이름 목록
  const activityMemberNames = useMemo(() => {
    const names = Array.from(new Set(activityLog.map(a => a.memberName)));
    return names;
  }, [activityLog]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('뷰어');

  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchTeamSummary()
      .then((d) => { if (!c) setSummary(normalizeTeamSummary(d)); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, []);

  const changeRole = useCallback((id: string, role: MemberRole) => {
    const target = members.find((m) => m.id === id);
    saveMembers(members.map((m) => m.id === id ? { ...m, role } : m));
    if (target) pushActivity({ memberName: target.name, type: 'role_change', detail: `역할 → ${role}` });
    refreshActivity();
    showToast('역할이 변경되었습니다.', 'success');
  }, [members, saveMembers, refreshActivity]);

  const toggleStatus = useCallback((id: string) => {
    saveMembers(members.map((m) => {
      if (m.id !== id) return m;
      const next: MemberStatus = m.status === '활성' ? '비활성' : '활성';
      return { ...m, status: next };
    }));
  }, [members, saveMembers]);

  const removeMember = useCallback((id: string) => {
    const target = members.find((m) => m.id === id);
    saveMembers(members.filter((m) => m.id !== id));
    if (target) pushActivity({ memberName: target.name, type: 'remove', detail: '팀에서 제거' });
    refreshActivity();
    showToast('멤버를 삭제했습니다.', 'success');
  }, [members, saveMembers, refreshActivity]);

  const inviteMember = useCallback(() => {
    const name = inviteName.trim();
    const email = inviteEmail.trim();
    if (!name || !email) { showToast('이름과 이메일을 입력하세요.', 'error'); return; }
    if (!email.includes('@')) { showToast('올바른 이메일을 입력하세요.', 'error'); return; }
    if (members.some((m) => m.email === email)) { showToast('이미 등록된 이메일입니다.', 'error'); return; }
    const newMember: LocalMember = {
      id: `m-${Date.now()}`,
      name,
      email,
      role: inviteRole,
      status: '초대중',
    };
    saveMembers([...members, newMember]);
    pushActivity({ memberName: name, type: 'invite', detail: `${inviteRole} 역할로 초대` });
    refreshActivity();
    setInviteName(''); setInviteEmail(''); setInviteRole('뷰어');
    setInviteOpen(false);
    showToast(`"${name}"에게 초대를 보냈습니다.`, 'success');
  }, [inviteName, inviteEmail, inviteRole, members, saveMembers, refreshActivity]);

  const memberLabel = `멤버 수: ${members.length}`;
  const roleLabel = loading ? '역할: …' : summary ? `내 역할: ${summary.role}` : '내 역할: —';

  // 초대 링크 생성
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const generateLink = useCallback(() => {
    const token = btoa(`invite-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const link = `${window.location.origin}/join?token=${token}`;
    setInviteLink(link);
    try { navigator.clipboard.writeText(link); } catch { /* ignore */ }
    showToast('초대 링크가 클립보드에 복사되었습니다.', 'success');
  }, []);

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

        {/* 팀원 초대 모달 */}
        {inviteOpen && (
          <dialog
            className="modal-overlay"
            open
            aria-modal="true"
            aria-labelledby="invite-member-title"
            onClick={(e) => { if (e.target === e.currentTarget) setInviteOpen(false); }}
            onKeyDown={(e) => { if (e.key === 'Escape') setInviteOpen(false); }}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-header">
                <h2 id="invite-member-title" className="modal-title">팀원 초대</h2>
                <button type="button" className="modal-close-btn" aria-label="닫기" onClick={() => setInviteOpen(false)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0 16px' }}>
                <div>
                  <label htmlFor="invite-name" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>이름</label>
                  <input id="invite-name" type="text" className="bw-input" placeholder="홍길동" value={inviteName} onChange={(e) => setInviteName(e.target.value)} maxLength={30} />
                </div>
                <div>
                  <label htmlFor="invite-email" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>이메일</label>
                  <input id="invite-email" type="email" className="bw-input" placeholder="example@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} maxLength={80}
                    onKeyDown={(e) => { if (e.key === 'Enter') inviteMember(); }} />
                </div>
                <div>
                  <label htmlFor="invite-role" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>역할</label>
                  <select id="invite-role" className="bw-input bw-select-max" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as MemberRole)}>
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="bw-btn-secondary" onClick={() => setInviteOpen(false)}>취소</button>
                <button type="button" className="bw-btn-primary" onClick={inviteMember} disabled={!inviteName.trim() || !inviteEmail.trim()}>초대 보내기</button>
              </div>
            </div>
          </dialog>
        )}

        {/* 역할별 통계 카드 */}
        <section className="bw-detail-section" aria-label="역할별 통계">
          <div className="team-role-stats-grid">
            <div className="team-role-stat-card team-role-stat-card--total">
              <div className="team-role-stat-num">{members.length}</div>
              <div className="team-role-stat-label">전체 멤버</div>
            </div>
            {(['관리자', '편집자', '뷰어'] as MemberRole[]).map(role => (
              <div key={role} className={`team-role-stat-card team-role-stat-card--${role === '관리자' ? 'admin' : role === '편집자' ? 'editor' : 'viewer'}`}>
                <div className="team-role-stat-num">{roleStats.counts[role]}</div>
                <div className="team-role-stat-label">{role}</div>
              </div>
            ))}
            <div className="team-role-stat-card team-role-stat-card--active">
              <div className="team-role-stat-num">{roleStats.statusCounts['활성']}</div>
              <div className="team-role-stat-label">활성</div>
            </div>
            <div className="team-role-stat-card team-role-stat-card--pending">
              <div className="team-role-stat-num">{roleStats.statusCounts['초대중']}</div>
              <div className="team-role-stat-label">초대중</div>
            </div>
            <div className="team-role-stat-card team-role-stat-card--inactive">
              <div className="team-role-stat-num">{roleStats.statusCounts['비활성']}</div>
              <div className="team-role-stat-label">비활성</div>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="team-members-heading">
          <h2 id="team-members-heading" className="bw-detail-section-title">멤버</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">팀원 초대·역할 지정·멤버 목록을 관리합니다.</p>
            <div className="bw-flex-between bw-mt-sm" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div className="bw-detail-meta-row" style={{ margin: 0 }}>
                <span className="bw-label-block bw-detail-meta-text">{memberLabel}</span>
                <span className="bw-label-block bw-detail-meta-text">{roleLabel}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="bw-btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={generateLink} aria-label="초대 링크 생성">
                  🔗 링크 생성
                </button>
                <button type="button" className="bw-btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setInviteOpen(true)}>
                  + 팀원 초대
                </button>
              </div>
            </div>
            {inviteLink && (
              <div className="team-invite-link-box">
                <span className="team-invite-link-label">초대 링크 (24시간 유효)</span>
                <div className="team-invite-link-row">
                  <input type="text" readOnly value={inviteLink} className="team-invite-link-input" aria-label="초대 링크" />
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    style={{ fontSize: 12, padding: '4px 10px', flexShrink: 0 }}
                    onClick={() => { navigator.clipboard.writeText(inviteLink).catch(() => {}); showToast('복사했습니다.', 'success'); }}
                  >복사</button>
                  <button type="button" className="bw-btn-secondary" style={{ fontSize: 12, padding: '4px 10px', flexShrink: 0, color: '#ef4444' }} onClick={() => setInviteLink(null)} aria-label="링크 닫기">✕</button>
                </div>
              </div>
            )}
            {/* 태그 빠른 필터 */}
            {allMemberTags.length > 0 && (
              <div className="team-tag-filter-row">
                <span className="team-tag-filter-label">🏷 태그 필터:</span>
                {allMemberTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`team-tag-filter-chip${memberTagFilter === tag ? ' team-tag-filter-chip--active' : ''}`}
                    onClick={() => setMemberTagFilter(prev => prev === tag ? null : tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {memberTagFilter && (
                  <button type="button" className="team-tag-filter-clear" onClick={() => setMemberTagFilter(null)}>✕ 초기화</button>
                )}
              </div>
            )}
            <div className="bw-tool-table-wrap">
              <table className="bw-tool-table">
                <caption>멤버 목록 ({filteredMembers.length}/{members.length}명)</caption>
                <thead>
                  <tr>
                    <th scope="col">이름</th>
                    <th scope="col">이메일</th>
                    <th scope="col">역할</th>
                    <th scope="col">상태</th>
                    <th scope="col">동작</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan={5} className="bw-detail-meta-text">{memberTagFilter ? `"${memberTagFilter}" 태그 팀원 없음` : '멤버가 없습니다.'}</td></tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{m.name}</div>
                          {/* 태그 행 */}
                          <div className="team-member-tags">
                            {(m.tags ?? []).map(tag => (
                              <span key={tag} className="team-member-tag">
                                #{tag}
                                <button type="button" className="team-member-tag-del" onClick={() => removeMemberTag(m.id, tag)} aria-label={`태그 #${tag} 삭제`}>✕</button>
                              </span>
                            ))}
                            {memberTagOpen === m.id ? (
                              <span className="team-member-tag-add-wrap">
                                <input
                                  type="text"
                                  className="team-member-tag-input"
                                  placeholder="태그…"
                                  value={memberTagInput[m.id] ?? ''}
                                  onChange={e => setMemberTagInput(prev => ({ ...prev, [m.id]: e.target.value }))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') { addMemberTag(m.id, memberTagInput[m.id] ?? ''); }
                                    if (e.key === 'Escape') { setMemberTagOpen(null); }
                                  }}
                                  maxLength={12}
                                  autoFocus
                                  aria-label="태그 입력"
                                />
                                <button type="button" className="team-member-tag-confirm" onClick={() => addMemberTag(m.id, memberTagInput[m.id] ?? '')} aria-label="추가">✓</button>
                                <button type="button" className="team-member-tag-cancel" onClick={() => setMemberTagOpen(null)} aria-label="취소">✕</button>
                              </span>
                            ) : (m.tags ?? []).length < 6 && (
                              <button type="button" className="team-member-tag-add-btn" onClick={() => setMemberTagOpen(m.id)} title="태그 추가">+태그</button>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.email}</td>
                        <td>
                          <select
                            className="team-role-select"
                            value={m.role}
                            onChange={(e) => changeRole(m.id, e.target.value as MemberRole)}
                            aria-label={`${m.name} 역할`}
                          >
                            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td>
                          <span className={`bw-badge-soft${m.status === '활성' ? ' bw-badge-soft--success' : m.status === '비활성' ? ' bw-badge-soft--error' : ''}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              className="bw-btn-secondary"
                              style={{ fontSize: 12, padding: '2px 8px' }}
                              onClick={() => toggleStatus(m.id)}
                              aria-label={`${m.name} ${m.status === '활성' ? '비활성화' : '활성화'}`}
                            >
                              {m.status === '활성' ? '비활성화' : '활성화'}
                            </button>
                            <button
                              type="button"
                              className="bw-btn-secondary"
                              style={{ fontSize: 12, padding: '2px 8px', color: 'var(--color-error, #ef4444)' }}
                              onClick={() => removeMember(m.id)}
                              aria-label={`${m.name} 삭제`}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="team-permissions-heading">
          <h2 id="team-permissions-heading" className="bw-detail-section-title">권한</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">프로젝트·대화·설정에 대한 접근 권한을 역할별로 설정할 수 있습니다.</p>
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

        {/* 팀원 활동 타임라인 */}
        <section className="bw-detail-section" aria-labelledby="team-activity-heading">
          <div className="team-activity-header">
            <h2 id="team-activity-heading" className="bw-detail-section-title" style={{ margin: 0 }}>
              📋 팀원 활동 타임라인
              {filteredActivity.length > 0 && (
                <span className="team-activity-count">{filteredActivity.length}건</span>
              )}
            </h2>
            <div className="team-activity-filter-row">
              <div className="team-activity-filters">
                {(['all', 'invite', 'role_change', 'remove', 'join', 'chat', 'doc'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`team-activity-filter-btn${activityFilter === type ? ' team-activity-filter-btn--active' : ''}`}
                    onClick={() => setActivityFilter(type)}
                    title={type === 'all' ? '전체' : type}
                  >
                    {type === 'all' ? '전체' : ACTIVITY_ICONS[type]}
                  </button>
                ))}
              </div>
              <div className="team-activity-meta-filters">
                {activityMemberNames.length > 0 && (
                  <select
                    className="team-activity-select"
                    value={activityMemberFilter}
                    onChange={e => setActivityMemberFilter(e.target.value)}
                    aria-label="멤버 필터"
                  >
                    <option value="all">👤 전체 멤버</option>
                    {activityMemberNames.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                )}
                <select
                  className="team-activity-select"
                  value={activityDays}
                  onChange={e => setActivityDays(Number(e.target.value))}
                  aria-label="기간 필터"
                >
                  <option value={7}>최근 7일</option>
                  <option value={30}>최근 30일</option>
                  <option value={90}>최근 90일</option>
                  <option value={365}>최근 1년</option>
                </select>
              </div>
            </div>
          </div>
          <div className="team-activity-timeline">
            {filteredActivity.length === 0 ? (
              <p className="team-activity-empty">
                {activityLog.length === 0 ? '아직 활동 기록이 없습니다. 멤버를 초대하거나 역할을 변경해 보세요.' : '선택한 유형의 활동이 없습니다.'}
              </p>
            ) : (
              filteredActivity.slice(0, 20).map((item) => (
                <div key={item.id} className="team-activity-item">
                  <span className="team-activity-icon" aria-hidden>{ACTIVITY_ICONS[item.type]}</span>
                  <div className="team-activity-body">
                    <span className="team-activity-name">{item.memberName}</span>
                    <span className="team-activity-detail">{item.detail}</span>
                  </div>
                  <time className="team-activity-time" dateTime={item.ts} title={new Date(item.ts).toLocaleString('ko-KR')}>
                    {timeAgo(item.ts)}
                  </time>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="team-collab-heading">
          <h2 id="team-collab-heading" className="bw-detail-section-title">실시간 협업</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">동시 편집·댓글·공유 링크 등 협업 기능이 제공됩니다.</p>
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
