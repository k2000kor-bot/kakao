/**
 * 워크플로우·자동화 빌더 뷰 (확장 범위)
 * API: GET /automation/status, GET /automation/workflows (automationViewService)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAutomationSummary, type AutomationSummary } from '../services/automationViewService';
import { showToast } from '../utils/toast';

const WORKFLOWS_KEY = 'corbu.automation.workflows';
const RUNS_KEY = 'corbu.automation.runs';

type WorkflowStatus = '활성' | '일시정지' | '오류';

interface WorkflowCondition {
  field: string;
  op: '포함' | '같음' | '초과' | '미만';
  value: string;
}

interface WorkflowAction {
  type: string;
  params: string;
}

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  status: WorkflowStatus;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  scheduledAt?: string; // ISO datetime string
  scheduleRepeat?: '없음' | '매일' | '매주' | '매월';
}

const CONDITION_FIELDS = ['메시지 길이', '키워드', '사용자', '시간대', '오류율'];
const CONDITION_OPS: WorkflowCondition['op'][] = ['포함', '같음', '초과', '미만'];
const ACTION_TYPES = ['슬랙 메시지 발송', '이메일 전송', 'AI 요약 실행', '웹훅 호출', '대화 저장', '알림 표시'];

interface RunLogStep {
  step: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
  durationMs: number;
}

interface RunItem {
  id: string;
  at: string;
  workflow: string;
  ok: boolean;
  workflowId?: string;
  durationMs?: number;
  steps?: RunLogStep[];
}

const DEFAULT_WORKFLOWS: WorkflowItem[] = [
  { id: 'wf1', name: '신규 파일 → 요약 → 슬랙', trigger: '스토리지 업로드', status: '일시정지' },
  { id: 'wf2', name: '야간 배치 리포트', trigger: '스케줄 02:00', status: '활성' },
  { id: 'wf3', name: '이슈 라벨링', trigger: '웹훅', status: '오류' },
];

const DEFAULT_RUNS: RunItem[] = [
  { id: 'r1', at: '2026-03-27 09:12', workflow: '신규 파일 → 요약 → 슬랙', ok: true },
  { id: 'r2', at: '2026-03-26 02:00', workflow: '야간 배치 리포트', ok: true },
  { id: 'r3', at: '2026-03-25 18:40', workflow: '이슈 라벨링', ok: false },
];

function loadWorkflows(): WorkflowItem[] {
  try {
    const raw = localStorage.getItem(WORKFLOWS_KEY);
    return raw ? (JSON.parse(raw) as WorkflowItem[]) : DEFAULT_WORKFLOWS;
  } catch { return DEFAULT_WORKFLOWS; }
}

function loadRuns(): RunItem[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    return raw ? (JSON.parse(raw) as RunItem[]) : DEFAULT_RUNS;
  } catch { return DEFAULT_RUNS; }
}

const TRIGGER_OPTIONS = ['스토리지 업로드', '스케줄 02:00', '웹훅', '메시지 수신', '새 대화 시작'];

interface WfTemplate {
  id: string;
  icon: string;
  name: string;
  trigger: string;
  desc: string;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
}

const WF_QUICK_TEMPLATES: WfTemplate[] = [
  {
    id: 'tpl-1', icon: '📁', name: '파일 업로드 → AI 요약',
    trigger: '스토리지 업로드', desc: '새 파일이 업로드되면 자동으로 AI 요약을 생성합니다.',
    actions: [{ type: 'AI 요약 실행', params: 'auto' }, { type: '슬랙 메시지 발송', params: '#general' }],
  },
  {
    id: 'tpl-2', icon: '🌙', name: '야간 배치 리포트',
    trigger: '스케줄 02:00', desc: '매일 새벽 2시 사용량 리포트를 이메일로 발송합니다.',
    actions: [{ type: '이메일 전송', params: 'admin@company.com' }],
  },
  {
    id: 'tpl-3', icon: '🔔', name: '키워드 알림',
    trigger: '메시지 수신', desc: '특정 키워드가 포함된 메시지가 도착하면 알림을 보냅니다.',
    conditions: [{ field: '키워드', op: '포함', value: '긴급' }],
    actions: [{ type: '알림 표시', params: '긴급 메시지 수신' }],
  },
  {
    id: 'tpl-4', icon: '💾', name: '대화 자동 저장',
    trigger: '새 대화 시작', desc: '새 대화가 시작되면 자동으로 저장·백업합니다.',
    actions: [{ type: '대화 저장', params: 'auto-backup' }],
  },
  {
    id: 'tpl-5', icon: '🔗', name: '웹훅 이벤트 처리',
    trigger: '웹훅', desc: '외부 시스템의 웹훅을 받아 AI 요약 후 슬랙에 전송합니다.',
    actions: [{ type: 'AI 요약 실행', params: 'webhook-payload' }, { type: '웹훅 호출', params: 'https://hooks.slack.com/...' }],
  },
  {
    id: 'tpl-6', icon: '📊', name: '오류 모니터링',
    trigger: '메시지 수신', desc: '오류율이 높아지면 이메일과 슬랙으로 즉시 경보를 전송합니다.',
    conditions: [{ field: '오류율', op: '초과', value: '5' }],
    actions: [{ type: '슬랙 메시지 발송', params: '#alerts' }, { type: '이메일 전송', params: 'oncall@company.com' }],
  },
];

function AutomationView() {
  const [summary, setSummary] = useState<AutomationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(() => loadWorkflows());
  const [runs, setRuns] = useState<RunItem[]>(() => loadRuns());
  const [runStatusFilter, setRunStatusFilter] = useState<'all' | 'success' | 'fail'>('all');
  const [runWorkflowFilter, setRunWorkflowFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<WfTemplate | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [logModalRun, setLogModalRun] = useState<RunItem | null>(null);

  const allWorkflowNames = useMemo(() => {
    const names = new Set(runs.map(r => r.workflow));
    return ['all', ...Array.from(names)];
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs.filter(r => {
      if (runStatusFilter === 'success' && !r.ok) return false;
      if (runStatusFilter === 'fail' && r.ok) return false;
      if (runWorkflowFilter !== 'all' && r.workflow !== runWorkflowFilter) return false;
      return true;
    });
  }, [runs, runStatusFilter, runWorkflowFilter]);

  const generateRunLog = useCallback((wf: WorkflowItem, success: boolean): RunLogStep[] => {
    const steps: RunLogStep[] = [
      { step: '트리거 감지', status: 'ok', message: `"${wf.trigger}" 트리거가 발동되었습니다.`, durationMs: Math.floor(Math.random() * 20) + 5 },
    ];
    if (wf.conditions && wf.conditions.length > 0) {
      wf.conditions.forEach((c, i) => {
        const condOk = success || i < wf.conditions!.length - 1;
        steps.push({ step: `조건 ${i + 1} 검사`, status: condOk ? 'ok' : 'warn', message: `${c.field} ${c.op} "${c.value}" → ${condOk ? '통과' : '미충족(계속)'}`, durationMs: Math.floor(Math.random() * 10) + 2 });
      });
    }
    if (wf.actions && wf.actions.length > 0) {
      wf.actions.forEach((a, i) => {
        const actOk = success || i < wf.actions!.length - 1;
        steps.push({ step: `액션 ${i + 1}: ${a.type}`, status: actOk ? 'ok' : 'error', message: actOk ? `"${a.type}" 실행 완료 (params: ${a.params || '없음'})` : `"${a.type}" 실행 실패: 연결 시간 초과`, durationMs: Math.floor(Math.random() * 200) + 50 });
      });
    } else {
      steps.push({ step: '기본 액션', status: success ? 'ok' : 'error', message: success ? '워크플로우 기본 동작 완료' : '기본 동작 중 오류 발생', durationMs: Math.floor(Math.random() * 150) + 30 });
    }
    steps.push({ step: '완료', status: success ? 'ok' : 'error', message: success ? '모든 단계가 성공적으로 완료되었습니다.' : '오류로 인해 워크플로우가 중단되었습니다.', durationMs: 1 });
    return steps;
  }, []);
  const addNameRef = useRef<HTMLInputElement>(null);
  const [scheduleEditId, setScheduleEditId] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleRepeat, setScheduleRepeat] = useState<WorkflowItem['scheduleRepeat']>('없음');

  const saveSchedule = useCallback((id: string) => {
    setWorkflows((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, scheduledAt: scheduleAt || undefined, scheduleRepeat } : w
      );
      try { localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    setScheduleEditId(null);
    showToast(scheduleAt ? `예약 설정이 저장되었습니다.` : '예약이 해제되었습니다.', 'success');
  }, [scheduleAt, scheduleRepeat]);

  const clearSchedule = useCallback((id: string) => {
    setWorkflows((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, scheduledAt: undefined, scheduleRepeat: undefined } : w
      );
      try { localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    showToast('예약이 해제되었습니다.', 'success');
  }, []);

  // ── 워크플로우 상세 편집기 ──
  const [editTarget, setEditTarget] = useState<WorkflowItem | null>(null);
  const [editConditions, setEditConditions] = useState<WorkflowCondition[]>([]);
  const [editActions, setEditActions] = useState<WorkflowAction[]>([]);

  const openEditor = useCallback((wf: WorkflowItem) => {
    setEditTarget(wf);
    setEditConditions(wf.conditions ?? []);
    setEditActions(wf.actions ?? []);
  }, []);

  // 워크플로우 저장
  const saveWorkflows = useCallback((updated: WorkflowItem[]) => {
    setWorkflows(updated);
    try { localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  const saveEditor = useCallback(() => {
    if (!editTarget) return;
    saveWorkflows(workflows.map((w) =>
      w.id === editTarget.id ? { ...w, conditions: editConditions, actions: editActions } : w
    ));
    setEditTarget(null);
    showToast(`"${editTarget.name}" 워크플로우를 저장했습니다.`, 'success');
  }, [editTarget, editConditions, editActions, workflows, saveWorkflows]);

  useEffect(() => {
    let c = false;
    setLoading(true);
    fetchAutomationSummary()
      .then((d) => { if (!c) setSummary(d); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, []);

  // 실행 이력 저장
  const saveRuns = useCallback((updated: RunItem[]) => {
    setRuns(updated);
    try { localStorage.setItem(RUNS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setWorkflows((prev) => {
      const updated = prev.map((w) => {
        if (w.id !== id) return w;
        const next: WorkflowStatus = w.status === '활성' ? '일시정지' : '활성';
        return { ...w, status: next };
      });
      try { localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const manualRun = useCallback(async (wf: WorkflowItem) => {
    if (wf.status === '오류') {
      showToast(`"${wf.name}" 워크플로우에 오류가 있습니다. 수정 후 실행하세요.`, 'error');
      return;
    }
    setRunningId(wf.id);
    const start = Date.now();
    await new Promise<void>((r) => setTimeout(r, 1200)); // simulate
    const ok = wf.status === '활성';
    const totalMs = Date.now() - start;
    const steps = generateRunLog(wf, ok);
    const newRun: RunItem = {
      id: `r-${Date.now()}`,
      at: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      workflow: wf.name,
      workflowId: wf.id,
      ok,
      durationMs: totalMs,
      steps,
    };
    saveRuns([newRun, ...runs].slice(0, 30));
    setRunningId(null);
    showToast(`"${wf.name}" ${ok ? '실행 완료' : '실행 실패'} — 로그 보기 ▸`, ok ? 'success' : 'error');
    setLogModalRun(newRun);
  }, [runs, saveRuns]);

  const applyTemplate = useCallback((tpl: WfTemplate) => {
    setSelectedTemplate(tpl);
    setNewName(tpl.name);
    setNewTrigger(tpl.trigger);
  }, []);

  const addWorkflow = useCallback(() => {
    const name = newName.trim();
    if (!name) { addNameRef.current?.focus(); return; }
    const newWf: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name,
      trigger: newTrigger,
      status: '일시정지',
      conditions: selectedTemplate?.conditions,
      actions: selectedTemplate?.actions,
    };
    saveWorkflows([...workflows, newWf]);
    setNewName('');
    setNewTrigger(TRIGGER_OPTIONS[0]);
    setSelectedTemplate(null);
    setAddOpen(false);
    showToast(`"${name}" 워크플로우가 추가되었습니다.`, 'success');
  }, [newName, newTrigger, selectedTemplate, workflows, saveWorkflows]);

  const deleteWorkflow = useCallback((id: string) => {
    saveWorkflows(workflows.filter((w) => w.id !== id));
  }, [workflows, saveWorkflows]);

  const duplicateWorkflow = useCallback((id: string) => {
    const src = workflows.find((w) => w.id === id);
    if (!src) return;
    const copy: typeof src = {
      ...src,
      id: `wf_${Date.now()}`,
      name: `${src.name} (복사본)`,
      status: '일시정지',
      scheduledAt: undefined,
      scheduleRepeat: undefined,
    };
    const idx = workflows.findIndex((w) => w.id === id);
    const next = [...workflows];
    next.splice(idx + 1, 0, copy);
    saveWorkflows(next);
    import('../utils/toast').then((m) => m.showToast(`"${copy.name}" 워크플로우를 복제했습니다.`, 'success'));
  }, [workflows, saveWorkflows]);

  const countLabel = loading
    ? '워크플로우 수: …'
    : `워크플로우 수: ${workflows.length}`;
  const lastLabel = runs.length > 0
    ? `마지막 실행: ${runs[0].at}`
    : (summary?.lastRunAt ? `마지막 실행: ${summary.lastRunAt}` : '마지막 실행: —');

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

        {/* 새 워크플로우 추가 모달 */}
        {addOpen && (
          <dialog
            className="modal-overlay"
            open
            aria-modal="true"
            aria-labelledby="add-wf-title"
            onClick={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}
            onKeyDown={(e) => { if (e.key === 'Escape') setAddOpen(false); }}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-header">
                <h2 id="add-wf-title" className="modal-title">새 워크플로우 추가</h2>
                <button type="button" className="modal-close-btn" aria-label="닫기" onClick={() => setAddOpen(false)}>✕</button>
              </div>
              {/* 빠른시작 템플릿 그리드 */}
              <div style={{ padding: '8px 0 4px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary, #64748b)', marginBottom: 8 }}>
                  ⚡ 빠른시작 템플릿 (선택 시 자동 입력)
                </p>
                <div className="auto-tpl-grid">
                  {WF_QUICK_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`auto-tpl-card${selectedTemplate?.id === tpl.id ? ' auto-tpl-card--selected' : ''}`}
                      onClick={() => applyTemplate(tpl)}
                      title={tpl.desc}
                    >
                      <span className="auto-tpl-icon">{tpl.icon}</span>
                      <span className="auto-tpl-name">{tpl.name}</span>
                      <span className="auto-tpl-desc">{tpl.desc}</span>
                    </button>
                  ))}
                </div>
                {selectedTemplate && (
                  <div className="auto-tpl-selected-info">
                    <span>✅ <strong>{selectedTemplate.name}</strong> 템플릿 선택됨</span>
                    <button
                      type="button"
                      className="auto-tpl-clear"
                      onClick={() => { setSelectedTemplate(null); setNewName(''); setNewTrigger(TRIGGER_OPTIONS[0]); }}
                    >템플릿 해제</button>
                  </div>
                )}
              </div>
              <div style={{ padding: '8px 0 16px', borderTop: '1px solid var(--border-color, #e2e8f0)', marginTop: 8 }}>
                <label htmlFor="new-wf-name" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                  워크플로우 이름
                </label>
                <input
                  id="new-wf-name"
                  ref={addNameRef}
                  type="text"
                  className="bw-input"
                  placeholder="예: 새 파일 → AI 요약"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addWorkflow(); }}
                  style={{ marginBottom: 12 }}
                  maxLength={60}
                />
                <label htmlFor="new-wf-trigger" style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                  트리거
                </label>
                <select
                  id="new-wf-trigger"
                  className="bw-input bw-select-max"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                >
                  {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="bw-btn-secondary" onClick={() => { setAddOpen(false); setSelectedTemplate(null); }}>취소</button>
                <button type="button" className="bw-btn-primary" onClick={addWorkflow} disabled={!newName.trim()}>추가</button>
              </div>
            </div>
          </dialog>
        )}

        <section className="bw-detail-section" aria-labelledby="automation-builder-heading">
          <h2 id="automation-builder-heading" className="bw-detail-section-title">
            워크플로우 빌더
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              트리거·조건·액션을 연결하는 노코드/로코드 워크플로우를 설계할 수 있습니다.
            </p>
            <div className="bw-flex-between bw-flex-gap-8 bw-mt-sm">
              <div className="bw-detail-meta-row" role="list" aria-label="자동화 요약" style={{ margin: 0 }}>
                <span className="bw-label-block bw-detail-meta-text">{countLabel}</span>
                <span className="bw-label-block bw-detail-meta-text">{lastLabel}</span>
              </div>
              <button
                type="button"
                className="bw-btn-primary"
                style={{ fontSize: 13, padding: '6px 14px' }}
                onClick={() => { setAddOpen(true); setTimeout(() => addNameRef.current?.focus(), 50); }}
              >
                + 새 워크플로우
              </button>
            </div>
            <div className="bw-tool-table-wrap bw-mt-md">
              <table className="bw-tool-table">
                <caption>워크플로 목록</caption>
                <thead>
                  <tr>
                    <th scope="col">이름</th>
                    <th scope="col">트리거</th>
                    <th scope="col">상태</th>
                    <th scope="col">동작</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.length === 0 ? (
                    <tr><td colSpan={4} className="bw-detail-meta-text">워크플로우가 없습니다. "+ 새 워크플로우"로 추가하세요.</td></tr>
                  ) : (
                    workflows.map((w) => (
                      <React.Fragment key={w.id}>
                        <tr>
                          <td style={{ fontWeight: 500 }}>
                            {w.name}
                            {w.scheduledAt && (
                              <span className="auto-schedule-badge" title={`예약: ${new Date(w.scheduledAt).toLocaleString('ko-KR')}`}>
                                🕐 {new Date(w.scheduledAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{w.trigger}</td>
                          <td>
                            <span
                              className={`bw-badge-soft${w.status === '활성' ? ' bw-badge-soft--success' : w.status === '오류' ? ' bw-badge-soft--error' : ''}`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ fontSize: 12, padding: '3px 8px' }}
                                onClick={() => toggleStatus(w.id)}
                                aria-label={`${w.name} ${w.status === '활성' ? '일시정지' : '활성화'}`}
                              >
                                {w.status === '활성' ? '⏸ 정지' : '▶ 활성화'}
                              </button>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ fontSize: 12, padding: '3px 8px' }}
                                onClick={() => void manualRun(w)}
                                disabled={runningId === w.id}
                                aria-label={`${w.name} 수동 실행`}
                              >
                                {runningId === w.id ? '…' : '▷ 실행'}
                              </button>
                              <button
                                type="button"
                                className={`bw-btn-secondary${scheduleEditId === w.id ? ' bw-btn-primary' : ''}`}
                                style={{ fontSize: 12, padding: '3px 8px' }}
                                onClick={() => {
                                  if (scheduleEditId === w.id) {
                                    setScheduleEditId(null);
                                  } else {
                                    setScheduleEditId(w.id);
                                    setScheduleAt(w.scheduledAt ? w.scheduledAt.slice(0, 16) : '');
                                    setScheduleRepeat(w.scheduleRepeat ?? '없음');
                                  }
                                }}
                                aria-label={`${w.name} 예약 설정`}
                                aria-expanded={scheduleEditId === w.id}
                              >
                                🕐 예약
                              </button>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ fontSize: 12, padding: '3px 8px' }}
                                onClick={() => openEditor(w)}
                                aria-label={`${w.name} 편집`}
                              >
                                ✏️ 편집
                              </button>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ fontSize: 12, padding: '3px 8px' }}
                                onClick={() => duplicateWorkflow(w.id)}
                                aria-label={`${w.name} 복제`}
                                title="워크플로우 복제"
                              >
                                📋 복제
                              </button>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ fontSize: 12, padding: '3px 8px', color: 'var(--color-error, #ef4444)' }}
                                onClick={() => deleteWorkflow(w.id)}
                                aria-label={`${w.name} 삭제`}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                        {scheduleEditId === w.id && (
                          <tr>
                            <td colSpan={4} className="auto-schedule-panel-cell">
                              <div className="auto-schedule-panel">
                                <span className="auto-schedule-panel-title">🕐 예약 실행 설정 — {w.name}</span>
                                <div className="auto-schedule-fields">
                                  <div>
                                    <label htmlFor={`sched-dt-${w.id}`} style={{ fontSize: 12, display: 'block', marginBottom: 3 }}>날짜·시간</label>
                                    <input
                                      id={`sched-dt-${w.id}`}
                                      type="datetime-local"
                                      className="bw-input auto-schedule-input"
                                      value={scheduleAt}
                                      onChange={(e) => setScheduleAt(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor={`sched-rep-${w.id}`} style={{ fontSize: 12, display: 'block', marginBottom: 3 }}>반복</label>
                                    <select
                                      id={`sched-rep-${w.id}`}
                                      className="bw-input auto-schedule-select"
                                      value={scheduleRepeat}
                                      onChange={(e) => setScheduleRepeat(e.target.value as WorkflowItem['scheduleRepeat'])}
                                    >
                                      {(['없음', '매일', '매주', '매월'] as const).map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="auto-schedule-actions">
                                  <button type="button" className="bw-btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => saveSchedule(w.id)}>
                                    저장
                                  </button>
                                  {w.scheduledAt && (
                                    <button type="button" className="bw-btn-secondary" style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }} onClick={() => clearSchedule(w.id)}>
                                      예약 해제
                                    </button>
                                  )}
                                  <button type="button" className="bw-btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setScheduleEditId(null)}>
                                    취소
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="automation-triggers-heading">
          <h2 id="automation-triggers-heading" className="bw-detail-section-title">트리거 유형</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              새 메시지·파일 업로드·스케줄·웹훅 등으로 자동화를 시작할 수 있습니다.
            </p>
            <div className="bw-tool-chip-row bw-mt-sm" role="list" aria-label="트리거 유형">
              {TRIGGER_OPTIONS.map((t) => (
                <span key={t} className="bw-badge-soft">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 실행 통계 요약 카드 ── */}
        {runs.length > 0 && (() => {
          const total = runs.length;
          const success = runs.filter((r) => r.ok).length;
          const fail = total - success;
          const rate = total > 0 ? Math.round((success / total) * 100) : 0;
          const last = runs[0];
          return (
            <section className="bw-detail-section" aria-labelledby="automation-stats-heading">
              <h2 id="automation-stats-heading" className="bw-detail-section-title">📊 실행 통계</h2>
              <div className="auto-stats-grid">
                <div className="auto-stat-card auto-stat-card--total">
                  <span className="auto-stat-icon">⚡</span>
                  <div className="auto-stat-body">
                    <span className="auto-stat-value">{total}</span>
                    <span className="auto-stat-label">전체 실행</span>
                  </div>
                </div>
                <div className="auto-stat-card auto-stat-card--success">
                  <span className="auto-stat-icon">✅</span>
                  <div className="auto-stat-body">
                    <span className="auto-stat-value">{success}</span>
                    <span className="auto-stat-label">성공</span>
                  </div>
                </div>
                <div className="auto-stat-card auto-stat-card--fail">
                  <span className="auto-stat-icon">❌</span>
                  <div className="auto-stat-body">
                    <span className="auto-stat-value">{fail}</span>
                    <span className="auto-stat-label">실패</span>
                  </div>
                </div>
                <div className="auto-stat-card auto-stat-card--rate">
                  <span className="auto-stat-icon">📈</span>
                  <div className="auto-stat-body">
                    <span className="auto-stat-value" style={{ color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>{rate}%</span>
                    <span className="auto-stat-label">성공률</span>
                  </div>
                </div>
              </div>
              {/* 성공률 바 */}
              <div className="auto-rate-bar-wrap" aria-label={`성공률 ${rate}%`}>
                <div className="auto-rate-bar" style={{ width: `${rate}%`, background: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }} />
              </div>
              {last && (
                <p className="auto-stat-last">
                  최근 실행: <strong>{last.workflow}</strong> — {last.at} — {last.ok ? '✅ 성공' : '❌ 실패'}
                </p>
              )}
              {/* 워크플로우별 성공률 테이블 */}
              {runs.length > 0 && (() => {
                const wfStats = new Map<string, { total: number; success: number }>();
                runs.forEach(r => {
                  const s = wfStats.get(r.workflow) ?? { total: 0, success: 0 };
                  wfStats.set(r.workflow, { total: s.total + 1, success: s.success + (r.ok ? 1 : 0) });
                });
                return (
                  <div className="auto-wf-stat-table-wrap">
                    <p className="auto-wf-stat-table-title">워크플로우별 성공률</p>
                    <table className="auto-wf-stat-table">
                      <thead>
                        <tr>
                          <th>워크플로우</th>
                          <th>실행</th>
                          <th>성공</th>
                          <th>성공률</th>
                          <th>바 차트</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(wfStats.entries()).map(([name, s]) => {
                          const r = Math.round((s.success / s.total) * 100);
                          return (
                            <tr key={name}>
                              <td className="auto-wf-stat-name">{name}</td>
                              <td>{s.total}</td>
                              <td>{s.success}</td>
                              <td style={{ fontWeight: 700, color: r >= 80 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444' }}>{r}%</td>
                              <td>
                                <div className="auto-wf-stat-bar-track">
                                  <div className="auto-wf-stat-bar-fill" style={{ width: `${r}%`, background: r >= 80 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </section>
          );
        })()}

        <section className="bw-detail-section" aria-labelledby="automation-history-heading">
          <h2 id="automation-history-heading" className="bw-detail-section-title">
            실행 이력
            {filteredRuns.length !== runs.length && (
              <span className="auto-run-filter-count">{filteredRuns.length} / {runs.length}</span>
            )}
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc">
              워크플로우 실행 로그·성공/실패를 확인할 수 있습니다. (최근 30개)
            </p>
            {/* 필터 행 */}
            <div className="auto-run-filter-row">
              <div className="auto-run-filter-group" role="group" aria-label="결과 필터">
                {([
                  { id: 'all', label: '전체', icon: '⚡' },
                  { id: 'success', label: '성공', icon: '✅' },
                  { id: 'fail', label: '실패', icon: '❌' },
                ] as { id: 'all'|'success'|'fail'; label: string; icon: string }[]).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`auto-run-filter-btn${runStatusFilter === opt.id ? ' auto-run-filter-btn--active' : ''}`}
                    onClick={() => setRunStatusFilter(opt.id)}
                    aria-pressed={runStatusFilter === opt.id}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {allWorkflowNames.length > 2 && (
                <select
                  className="auto-run-wf-select"
                  value={runWorkflowFilter}
                  onChange={e => setRunWorkflowFilter(e.target.value)}
                  aria-label="워크플로우 필터"
                >
                  <option value="all">전체 워크플로우</option>
                  {allWorkflowNames.filter(n => n !== 'all').map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              )}
              {(runStatusFilter !== 'all' || runWorkflowFilter !== 'all') && (
                <button
                  type="button"
                  className="auto-run-filter-reset"
                  onClick={() => { setRunStatusFilter('all'); setRunWorkflowFilter('all'); }}
                  aria-label="필터 초기화"
                >
                  ✕ 초기화
                </button>
              )}
            </div>
            <div className="bw-tool-table-wrap bw-mt-sm">
              <table className="bw-tool-table">
                <caption>최근 실행</caption>
                <thead>
                  <tr>
                    <th scope="col">시각</th>
                    <th scope="col">워크플로</th>
                    <th scope="col">소요</th>
                    <th scope="col">결과</th>
                    <th scope="col"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.length === 0 ? (
                    <tr><td colSpan={5} className="bw-detail-meta-text">{runs.length === 0 ? '실행 이력이 없습니다.' : '필터 조건에 맞는 결과가 없습니다.'}</td></tr>
                  ) : (
                    filteredRuns.slice(0, 30).map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12 }}>{r.at}</td>
                        <td>{r.workflow}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {r.durationMs ? `${r.durationMs}ms` : '—'}
                        </td>
                        <td>
                          <span className={`bw-badge-soft${r.ok ? ' bw-badge-soft--success' : ' bw-badge-soft--error'}`}>
                            {r.ok ? '✓ 성공' : '✕ 실패'}
                          </span>
                        </td>
                        <td>
                          {r.steps && r.steps.length > 0 && (
                            <button
                              type="button"
                              className="bw-btn-secondary"
                              style={{ fontSize: 11, padding: '2px 8px' }}
                              onClick={() => setLogModalRun(r)}
                              aria-label="실행 로그 보기"
                            >
                              📋 로그
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* ── 실행 로그 모달 ── */}
      {logModalRun && (
        <div
          className="tmpl-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="run-log-title"
          onClick={(e) => { if (e.target === e.currentTarget) setLogModalRun(null); }}
        >
          <div className="tmpl-modal" style={{ maxWidth: 560 }}>
            <h2 className="tmpl-modal-title" id="run-log-title">
              📋 실행 로그 — {logModalRun.workflow}
            </h2>
            <div style={{ marginBottom: 8, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>🕐 {logModalRun.at}</span>
              {logModalRun.durationMs != null && <span>⏱ {logModalRun.durationMs}ms</span>}
              <span className={`bw-badge-soft${logModalRun.ok ? ' bw-badge-soft--success' : ' bw-badge-soft--error'}`} style={{ fontSize: 11 }}>
                {logModalRun.ok ? '✓ 성공' : '✕ 실패'}
              </span>
            </div>
            <div className="auto-log-steps">
              {(logModalRun.steps ?? []).map((s, i) => (
                <div key={i} className={`auto-log-step auto-log-step--${s.status}`}>
                  <div className="auto-log-step-header">
                    <span className="auto-log-step-icon">
                      {s.status === 'ok' ? '✅' : s.status === 'warn' ? '⚠️' : '❌'}
                    </span>
                    <span className="auto-log-step-name">{s.step}</span>
                    <span className="auto-log-step-dur">{s.durationMs}ms</span>
                    <button
                      type="button"
                      className="auto-log-step-copy"
                      onClick={() => navigator.clipboard.writeText(`[${s.status.toUpperCase()}] ${s.step} (${s.durationMs}ms)\n${s.message}`)}
                      title="이 스텝 로그 복사"
                      aria-label="스텝 로그 복사"
                    >
                      📋
                    </button>
                  </div>
                  <p className="auto-log-step-msg">{s.message}</p>
                </div>
              ))}
            </div>
            <div className="tmpl-modal-actions">
              <button
                type="button"
                className="bw-btn-secondary auto-log-copy-btn"
                onClick={() => {
                  const lines: string[] = [
                    `[실행 로그] ${logModalRun.workflow}`,
                    `실행 시각: ${logModalRun.at}`,
                    logModalRun.durationMs != null ? `총 소요: ${logModalRun.durationMs}ms` : '',
                    `결과: ${logModalRun.ok ? '성공' : '실패'}`,
                    '─'.repeat(36),
                    ...(logModalRun.steps ?? []).map((s, i) =>
                      `[${i + 1}] ${s.status.toUpperCase()} | ${s.step} (${s.durationMs}ms)\n    ${s.message}`
                    ),
                  ].filter(Boolean);
                  navigator.clipboard.writeText(lines.join('\n')).then(() => {
                    import('../utils/toast').then(m => m.showToast('로그를 클립보드에 복사했습니다.', 'success'));
                  });
                }}
                title="전체 로그를 텍스트로 복사"
              >
                📋 로그 복사
              </button>
              <button type="button" className="bw-btn-secondary" onClick={() => setLogModalRun(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 워크플로우 편집기 모달 ── */}
      {editTarget && (
        <div
          className="tmpl-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auto-editor-title"
          onClick={(e) => { if (e.target === e.currentTarget) setEditTarget(null); }}
        >
          <div className="tmpl-modal" style={{ maxWidth: 560, width: '94vw' }}>
            <h2 id="auto-editor-title" className="tmpl-modal-title">⚙️ 워크플로우 편집 — {editTarget.name}</h2>

            {/* 조건 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p className="tmpl-field-label" style={{ margin: 0 }}>조건</p>
                <button
                  type="button"
                  className="bw-btn-secondary"
                  style={{ fontSize: 12, padding: '3px 10px' }}
                  onClick={() => setEditConditions((prev) => [...prev, { field: CONDITION_FIELDS[0], op: '포함', value: '' }])}
                >+ 조건 추가</button>
              </div>
              {editConditions.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>조건 없음 (항상 실행)</p>
              )}
              {editConditions.map((c, i) => (
                <div key={i} className="auto-cond-row">
                  <select
                    className="tmpl-input"
                    style={{ flex: 1 }}
                    value={c.field}
                    onChange={(e) => setEditConditions((prev) => prev.map((x, j) => j === i ? { ...x, field: e.target.value } : x))}
                    aria-label="조건 필드"
                  >
                    {CONDITION_FIELDS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select
                    className="tmpl-input"
                    style={{ width: 80 }}
                    value={c.op}
                    onChange={(e) => setEditConditions((prev) => prev.map((x, j) => j === i ? { ...x, op: e.target.value as WorkflowCondition['op'] } : x))}
                    aria-label="조건 연산자"
                  >
                    {CONDITION_OPS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <input
                    type="text"
                    className="tmpl-input"
                    style={{ flex: 1 }}
                    placeholder="값"
                    value={c.value}
                    onChange={(e) => setEditConditions((prev) => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                    aria-label="조건 값"
                  />
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    style={{ fontSize: 12, padding: '3px 7px', color: '#ef4444' }}
                    onClick={() => setEditConditions((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="조건 삭제"
                  >✕</button>
                </div>
              ))}
            </div>

            {/* 액션 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p className="tmpl-field-label" style={{ margin: 0 }}>액션</p>
                <button
                  type="button"
                  className="bw-btn-secondary"
                  style={{ fontSize: 12, padding: '3px 10px' }}
                  onClick={() => setEditActions((prev) => [...prev, { type: ACTION_TYPES[0], params: '' }])}
                >+ 액션 추가</button>
              </div>
              {editActions.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>액션 없음</p>
              )}
              {editActions.map((a, i) => (
                <div key={i} className="auto-cond-row">
                  <select
                    className="tmpl-input"
                    style={{ flex: 1.2 }}
                    value={a.type}
                    onChange={(e) => setEditActions((prev) => prev.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}
                    aria-label="액션 타입"
                  >
                    {ACTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input
                    type="text"
                    className="tmpl-input"
                    style={{ flex: 2 }}
                    placeholder="파라미터 (예: 채널명, URL…)"
                    value={a.params}
                    onChange={(e) => setEditActions((prev) => prev.map((x, j) => j === i ? { ...x, params: e.target.value } : x))}
                    aria-label="액션 파라미터"
                  />
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    style={{ fontSize: 12, padding: '3px 7px', color: '#ef4444' }}
                    onClick={() => setEditActions((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="액션 삭제"
                  >✕</button>
                </div>
              ))}
            </div>

            <div className="tmpl-modal-actions">
              <button type="button" className="bw-btn-secondary" onClick={() => setEditTarget(null)}>취소</button>
              <button type="button" className="bw-btn-primary" onClick={saveEditor}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutomationView;
