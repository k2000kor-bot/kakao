/**
 * 컴포저 중간 관리형 답변 생성 — 질문·요구·글쓰기·다중 요청을 항목별로 분해하고
 * 기획(팀장) → 작성 → 판단 → 검증 단계를 거쳐 일관된 답변을 만들도록 context를 구성합니다.
 */
import {
  coerceTrimmedString,
  parseInputIntent,
  parseMultiAskItems,
  parseQuestionRequirementSections,
  type PipelineMessageExtras,
} from './chatInputUtils';
import { mergeComposerOversightCouncilIntoContext } from './composerOversightCouncil';

export type ComposerWorkItemKind = 'question' | 'requirement' | 'writing' | 'analysis' | 'general';

export type ComposerOversightWorkItem = {
  index: number;
  kind: ComposerWorkItemKind;
  summary: string;
  source: 'multi' | 'question_section' | 'requirements_section' | 'whole';
};

export type ComposerOversightPlan = {
  enabled: boolean;
  workItems: ComposerOversightWorkItem[];
  hasMultipleRequests: boolean;
  hasWriting: boolean;
  hasStructuredQa: boolean;
  planMarkdown: string;
};

const WRITING_KEYWORDS =
  /(?:작성|글쓰|초안|보고서|리포트|에세이|칼럼|문서|원고|기고|스크립트|대본|메일\s*초안)/i;
const REQUIREMENT_KEYWORDS =
  /(?:요구|요청|부탁|반드시|포함|준수|맞춰|형식|분량|톤|스타일)/i;
const QUESTION_KEYWORDS = /(?:\?|질문|왜|어떻게|무엇|언제|어디|누구|인지|일까|할까)/i;

function classifySegmentKind(text: string): ComposerWorkItemKind {
  const t = text.trim();
  if (!t) return 'general';
  if (WRITING_KEYWORDS.test(t)) return 'writing';
  if (QUESTION_KEYWORDS.test(t) && !REQUIREMENT_KEYWORDS.test(t)) return 'question';
  if (REQUIREMENT_KEYWORDS.test(t) && !QUESTION_KEYWORDS.test(t)) return 'requirement';
  if (QUESTION_KEYWORDS.test(t) && REQUIREMENT_KEYWORDS.test(t)) return 'analysis';
  if (/분석|검토|비교|평가|요약/.test(t)) return 'analysis';
  return 'general';
}

function kindLabel(kind: ComposerWorkItemKind): string {
  switch (kind) {
    case 'question':
      return '질문';
    case 'requirement':
      return '요구';
    case 'writing':
      return '글쓰기';
    case 'analysis':
      return '분석·검토';
    default:
      return '요청';
  }
}

function summarize(text: string, max = 120): string {
  const t = coerceTrimmedString(text, '').replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export type BuildComposerOversightPlanOptions = {
  multiRequestItems?: string[];
  skipWhenGraphAnswer?: boolean;
  /** 짧은 일반 질문 — Council·중간관리 오버헤드 생략 */
  skipForSimpleQuery?: boolean;
  /** 답변 생성 자가 개발 6단계를 기획 지시에 포함 */
  includeSelfDevelop?: boolean;
};

/**
 * 사용자 입력에서 작업 항목을 추출하고 중간 관리(기획·판단·검증) 지시문을 만듭니다.
 */
export function buildComposerOversightPlan(
  trimmedInput: string,
  options?: BuildComposerOversightPlanOptions,
): ComposerOversightPlan {
  const empty: ComposerOversightPlan = {
    enabled: false,
    workItems: [],
    hasMultipleRequests: false,
    hasWriting: false,
    hasStructuredQa: false,
    planMarkdown: '',
  };

  if (options?.skipWhenGraphAnswer || options?.skipForSimpleQuery) {
    return empty;
  }

  const trimmed = coerceTrimmedString(trimmedInput, '');
  if (!trimmed) {
    return empty;
  }

  const sections = parseQuestionRequirementSections(trimmed);
  const multi = parseMultiAskItems(trimmed);
  const intent = parseInputIntent(trimmed);
  const workItems: ComposerOversightWorkItem[] = [];

  const pushItem = (
    kind: ComposerWorkItemKind,
    summary: string,
    source: ComposerOversightWorkItem['source'],
  ) => {
    workItems.push({ index: workItems.length + 1, kind, summary: summarize(summary), source });
  };

  if (multi.hasMultiple && multi.items.length >= 2) {
    for (const seg of multi.items) {
      const s = coerceTrimmedString(seg, '');
      if (s.length >= 2) pushItem(classifySegmentKind(s), s, 'multi');
    }
  } else if (sections.hasBoth) {
    if (sections.question) pushItem('question', sections.question, 'question_section');
    if (sections.requirements) pushItem('requirement', sections.requirements, 'requirements_section');
  } else if (sections.question) {
    pushItem('question', sections.question, 'question_section');
  } else if (sections.requirements) {
    pushItem('requirement', sections.requirements, 'requirements_section');
  } else {
    pushItem(classifySegmentKind(trimmed), trimmed, 'whole');
  }

  const hasMultipleRequests =
    workItems.length >= 2 ||
    Boolean(options?.multiRequestItems && options.multiRequestItems.length >= 2);
  const hasWriting = workItems.some((w) => w.kind === 'writing') || WRITING_KEYWORDS.test(trimmed);
  const hasStructuredQa = sections.hasBoth || intent.type !== 'general';

  const shouldEnable =
    hasMultipleRequests ||
    hasStructuredQa ||
    hasWriting ||
    workItems.length >= 2 ||
    trimmed.length > 280;

  if (!shouldEnable) {
    return empty;
  }

  const itemLines = workItems.map(
    (w) => `${w.index}. [${kindLabel(w.kind)}] ${w.summary}`,
  );

  const planMarkdown = [
    '[중간 관리형 답변 생성 — 팀장급 오케스트레이션]',
    '',
    '다음 역할을 순서대로 수행하세요. 역할 이름을 본문에 그대로 노출하지 마세요.',
    '',
    '1) **중간 기획자(팀장)**: 아래 작업 항목의 처리 순서·출력 형식(표/목록/문단/글쓰기)을 2~4줄로 확정합니다.',
    '2) **작성**: 항목별로 근거·맥락을 반영해 초안을 작성합니다. 다중 항목은 번호 순서를 지킵니다.',
    '3) **판단자**: 논리 비약·누락·형식 불일치·질문-요구 미반영을 점검해 보완합니다.',
    '4) **검증자**: 모든 항목 충족·용어·사실 관계 일관성·근거 표기를 최종 확인합니다.',
    '',
    '## 작업 항목',
    ...itemLines,
    '',
    '## 출력 규칙',
    '- 한 개의 완성된 답변으로 통합하되, 항목별 소제목 또는 번호로 구분합니다.',
    '- [다중 요청], [혁신적 답변], 빈 불릿(• .) 등 시스템 태그는 출력하지 않습니다.',
    '- 불확실한 내용은 「확인 필요」로 표기하고, 추측은 추측임을 밝힙니다.',
    '- 글쓰기 항목은 서론·본론·결론과 가독성을 갖춥니다.',
    '',
    '## 마무리 체크리스트 (본문 말미에 짧게)',
    '- 각 작업 항목에 답했는가',
    '- 질문·요구·글쓰기 형식이 맞는가',
    '- 앞뒤 용어·논지가 일관되는가',
    ...(options?.includeSelfDevelop
      ? [
          '',
          '## 자가 개발(적극 품질 향상 — 내부 순서, 본문에 단계명 출력 금지)',
          'intake→plan→draft→critique→integrate→evolve 순으로 스스로 점검·보완한 뒤 최종 답만 제시하세요.',
          '이전 턴·세션 교훈이 있으면 evolve 단계에서 반영하세요.',
        ]
      : []),
  ].join('\n');

  return {
    enabled: true,
    workItems,
    hasMultipleRequests,
    hasWriting,
    hasStructuredQa,
    planMarkdown,
  };
}

/** API context에 중간 관리 + Council v2 메타·지시를 병합합니다. */
export function mergeComposerOversightIntoContext(
  base: Record<string, unknown>,
  plan: ComposerOversightPlan,
): Record<string, unknown> {
  if (!plan.enabled || !plan.planMarkdown.trim()) {
    return base;
  }
  const withBase = {
    ...base,
    composer_oversight_enabled: true,
    composer_oversight_work_items: plan.workItems.map((w) => ({
      index: w.index,
      kind: w.kind,
      summary: w.summary,
    })),
    composer_oversight_has_multiple: plan.hasMultipleRequests,
    /** 다중 요청 시 항목별 순차 처리 강조(기존 multi_request와 병행) */
    ...(plan.hasMultipleRequests
      ? {
          multi_request_adaptation_instruction: [
            typeof base.multi_request_adaptation_instruction === 'string'
              ? base.multi_request_adaptation_instruction
              : '',
            'Council v2: 각 항목마다 Intake→Strategy→Production→Critique→Integration 순으로 처리한 뒤 다음 항목으로 넘어가세요. 용어·논지를 유지하세요.',
          ]
            .filter(Boolean)
            .join('\n'),
        }
      : {}),
  };
  return mergeComposerOversightCouncilIntoContext(withBase, plan);
}

/** 요청 context의 중간 관리·Council v2 플래그 → 메시지 pipelineExtras 요약 */
export function buildComposerOversightPipelineExtras(
  ctx: Record<string, unknown>,
): PipelineMessageExtras | undefined {
  if (ctx.composer_oversight_enabled !== true) {
    return undefined;
  }
  const workItems = ctx.composer_oversight_work_items;
  const count = Array.isArray(workItems) ? workItems.length : 0;
  return {
    composerOversightEnabled: true,
    composerOversightCouncilV2: ctx.composer_oversight_council_v2 === true,
    composerOversightWorkItemCount: count > 0 ? count : undefined,
    composerOversightHasMultiple: ctx.composer_oversight_has_multiple === true,
  };
}
