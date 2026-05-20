/**
 * 혁신형 Composer Oversight Council — 5인 협의회 모델
 * Intake → Strategy → Production → Critique → Integration
 * 질문·요구·글쓰기·다중 요청을 항목별 성공 기준과 일관성 헌장으로 묶어 답변 품질을 끌어올립니다.
 */
import type { ComposerOversightPlan, ComposerOversightWorkItem, ComposerWorkItemKind } from './composerOversightPipeline';

export type CouncilSeatId =
  | 'intake_director'
  | 'strategic_planner'
  | 'production_lead'
  | 'critical_reviewer'
  | 'knowledge_guardian';

export type CouncilPhase = {
  id: string;
  seat: CouncilSeatId;
  label: string;
  pipelineUiPhase: 'analyze' | 'outline' | 'draft' | 'crosscheck' | 'verify';
  deliverable: string;
};

export const COUNCIL_PHASES: CouncilPhase[] = [
  {
    id: 'intake',
    seat: 'intake_director',
    label: '요구 해석·범위 확정',
    pipelineUiPhase: 'analyze',
    deliverable: '작업 항목·질문/요구/글쓰기 분류, 누락 위험 표시',
  },
  {
    id: 'strategy',
    seat: 'strategic_planner',
    label: '전략·구조 기획',
    pipelineUiPhase: 'outline',
    deliverable: '처리 순서, 출력 형식(표/목록/문단), 항목별 소제목 설계',
  },
  {
    id: 'production',
    seat: 'production_lead',
    label: '본문 생산',
    pipelineUiPhase: 'draft',
    deliverable: '근거·맥락 반영 초안, 다중 항목 번호 순서 준수',
  },
  {
    id: 'critique',
    seat: 'critical_reviewer',
    label: '판단·비평',
    pipelineUiPhase: 'crosscheck',
    deliverable: '논리 비약·형식 불일치·질문-요구 미반영 보완',
  },
  {
    id: 'integration',
    seat: 'knowledge_guardian',
    label: '통합·지식 검증',
    pipelineUiPhase: 'verify',
    deliverable: '용어 일관성, 근거 표기, 전체 충족 체크리스트',
  },
];

function kindSuccessCriteria(kind: ComposerWorkItemKind): string[] {
  switch (kind) {
    case 'question':
      return ['질문 핵심에 직접 답함', '불확실 시 「확인 필요」 표기'];
    case 'requirement':
      return ['요구 형식·분량·톤 반영', '누락 항목 없음'];
    case 'writing':
      return ['서론·본론·결론', '가독성·논리 흐름', '제목·소제목 명확'];
    case 'analysis':
      return ['비교·근거 제시', '추측과 사실 구분'];
    default:
      return ['요청 의도 반영', '실행 가능한 다음 단계 1개 이상'];
  }
}

function buildItemCriteriaBlock(items: ComposerOversightWorkItem[]): string[] {
  const lines: string[] = ['## 항목별 성공 기준 (Council 검수표)'];
  for (const w of items) {
    const criteria = kindSuccessCriteria(w.kind);
    lines.push(`### ${w.index}. [${w.kind}] ${w.summary}`);
    for (const c of criteria) {
      lines.push(`- [ ] ${c}`);
    }
  }
  return lines;
}

export type ComposerOversightCouncilLayer = {
  enabled: boolean;
  phases: CouncilPhase[];
  councilInstruction: string;
  executionBrief: string;
  consistencyCharter: string;
};

/**
 * Oversight Plan 위에 Council v2 실행 브리프·협의회 지시문을 생성합니다.
 */
export function buildComposerOversightCouncilLayer(
  plan: ComposerOversightPlan,
): ComposerOversightCouncilLayer {
  const empty: ComposerOversightCouncilLayer = {
    enabled: false,
    phases: [],
    councilInstruction: '',
    executionBrief: '',
    consistencyCharter: '',
  };
  if (!plan.enabled || plan.workItems.length === 0) {
    return empty;
  }

  const phaseLines = COUNCIL_PHASES.map(
    (p, i) => `${i + 1}. **${p.label}** (${p.deliverable})`,
  );

  const consistencyCharter = [
    '## 일관성 헌장 (Knowledge Guardian)',
    '- 동일 개념은 첫 등장 후 동일 용어를 유지합니다.',
    '- 앞 항목 결론과 뒤 항목 전제가 모순되지 않게 합니다.',
    '- 수치·날짜·고유명사는 근거 없이 바꾸지 않습니다.',
    '- 추측은 「추정」「확인 필요」로 구분합니다.',
    plan.hasMultipleRequests
      ? '- 다중 항목: 번호·소제목으로 구분하고, 항목 간 참조(「앞서 언급한」)는 실제 본문과 일치하게 합니다.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const executionBrief = [
    '## Council 실행 브리프 (내부 — 본문에 그대로 복사하지 마세요)',
    '',
    '### 처리 파이프라인',
    ...phaseLines,
    '',
    ...buildItemCriteriaBlock(plan.workItems),
    '',
    consistencyCharter,
    '',
    '### 통합 출력',
    '- 최종 답변 1개로 제출하되, 항목별 소제목·번호 유지',
    '- 말미에 「충족 체크」 3~5줄 (항목·일관성·근거)',
  ].join('\n');

  const councilInstruction = [
    '[Composer Oversight Council v2 — 혁신형 다단계 답변 생성]',
    '',
    '당신은 5인 협의회가 **순차 합의**한 것처럼 답변합니다. 역할 이름·Council·내부 단계명은 사용자에게 노출하지 마세요.',
    '',
    '### 협의회 좌석 (순서 고정)',
    '1. **Intake Director**: 질문·요구·글쓰기·다중 요청을 항목으로 분해하고 범위를 확정합니다.',
    '2. **Strategic Planner (팀장)**: 항목 처리 순서·출력 스키마(표/불릿/문단/보고서)를 2~4줄로 확정합니다.',
    '3. **Production Lead**: 근거·대화 맥락·첨부를 반영해 항목별 본문을 작성합니다.',
    '4. **Critical Reviewer**: 누락·논리 비약·형식 불일치·다중 요청 미처리를 수정합니다.',
    '5. **Knowledge Guardian**: 용어·사실 관계 일관성, 근거 표기, 전체 충족을 최종 검증합니다.',
    '',
    plan.planMarkdown,
    '',
    executionBrief,
    '',
    '### 금지',
    '- 「좋은 질문이네요」「더 구체적으로 말씀해 주세요」 등 일반 채팅 회피만으로 끝내기',
    '- [다중 요청], [혁신적 답변], 빈 불릿(• .) 시스템 태그 출력',
    '- 작업 항목·검수표를 그대로 복사해 노출하기',
  ].join('\n');

  return {
    enabled: true,
    phases: COUNCIL_PHASES,
    councilInstruction,
    executionBrief,
    consistencyCharter,
  };
}

/** API context에 Council v2 메타·지시를 병합합니다. */
export function mergeComposerOversightCouncilIntoContext(
  base: Record<string, unknown>,
  plan: ComposerOversightPlan,
): Record<string, unknown> {
  const council = buildComposerOversightCouncilLayer(plan);
  if (!council.enabled) {
    return base;
  }
  return {
    ...base,
    composer_oversight_council_v2: true,
    composer_oversight_council_phases: council.phases.map((p) => ({
      id: p.id,
      seat: p.seat,
      label: p.label,
      pipeline_ui_phase: p.pipelineUiPhase,
    })),
    composer_oversight_execution_brief: council.executionBrief,
    composer_oversight_council_instruction: council.councilInstruction,
    composer_oversight_instruction: council.councilInstruction,
    composer_oversight_plan_markdown: council.councilInstruction,
    /** Q→A Writer·Verifier가 읽는 브리프 */
    oversight_council_execution_brief: council.executionBrief,
    /** 파이프라인 UI 단계 힌트 */
    pipeline_oversight_council: true,
    prefer_informed_answer: true,
    /** 검증 재작성 기본 활성(팀장급 검수) */
    pipeline_verifier_rewrite: base.pipeline_verifier_rewrite ?? true,
  };
}
