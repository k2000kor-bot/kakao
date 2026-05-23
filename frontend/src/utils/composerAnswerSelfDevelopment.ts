/**
 * 답변 생성 AI — 단계별 자가 개발(검증→비판→통합→진화) 루프
 * 관계도 `conversationGraphAnswerSelfImprove`와 동일한 패턴을 일반 컴포저에 적용합니다.
 */
import {
  coerceTrimmedString,
  isAssistantGenerationStepUi,
  type PipelineMessageExtras,
} from './chatInputUtils';
import {
  resolveAssistantAnswerDisplayText,
  shouldUseSimpleComposerOutboundMessage,
} from './composerStreamResponseText';

export type ComposerSelfDevelopStep =
  | 'intake'
  | 'plan'
  | 'draft'
  | 'critique'
  | 'integrate'
  | 'evolve';

export const COMPOSER_SELF_DEVELOP_STEPS: readonly ComposerSelfDevelopStep[] = [
  'intake',
  'plan',
  'draft',
  'critique',
  'integrate',
  'evolve',
] as const;

export const COMPOSER_SELF_DEVELOP_MAX_ATTEMPTS = 2;

const LESSONS_STORAGE_PREFIX = 'composer_sd_lessons_';
const MAX_STORED_LESSONS = 12;

const GENERIC_MARKERS = [
  '[다중 요청]',
  '더 정확한 답변을 위해',
  '질문 의도를 분석',
  '답변 생성 로직',
  '시스템 지시',
  '[출력 형식 지시]',
];

export type ComposerAnswerVerifyResult = {
  pass: boolean;
  issues: string[];
  score: number;
};

export function isComposerAnswerSelfDevelopEnabled(): boolean {
  return process.env.REACT_APP_COMPOSER_ANSWER_SELF_DEVELOP !== '0';
}

export function shouldRunComposerAnswerSelfDevelop(opts: {
  trimmedInput: string;
  composerSimpleQuery?: boolean;
  isGraphComposerAnswer?: boolean;
  multiRequestMode?: boolean;
  /** 중간 관리·Council 활성 시 적극 자가 개발 */
  oversightEnabled?: boolean;
}): boolean {
  if (!isComposerAnswerSelfDevelopEnabled()) return false;
  if (opts.composerSimpleQuery || opts.isGraphComposerAnswer) return false;

  const input = coerceTrimmedString(opts.trimmedInput, '');
  if (!input) return false;
  if (opts.multiRequestMode || opts.oversightEnabled) return true;
  if (input.length >= 80) return true;
  if (/작성|분석|보고서|요구사항|질문:|다음\s*단계|정리|요약/i.test(input)) return true;
  if (input.length >= 35 && /\?/.test(input)) return true;
  return input.length >= 50;
}

/** UI·플레이스홀더용 단계 안내 문구 */
export function getComposerSelfDevelopStatusText(step: ComposerSelfDevelopStep): string {
  const labels: Record<ComposerSelfDevelopStep, string> = {
    intake: '① 질문·요구를 다시 파악하고 있습니다…',
    plan: '② 답변 구조와 항목을 설계하고 있습니다…',
    draft: '③ 근거를 반영해 초안을 다듬고 있습니다…',
    critique: '④ 논리·누락을 점검하고 있습니다…',
    integrate: '⑤ 최종 답변으로 통합하고 있습니다…',
    evolve: '⑥ 다음 답변을 위해 학습 내용을 반영하고 있습니다…',
  };
  return labels[step];
}

const PROACTIVE_UI_STEPS: ComposerSelfDevelopStep[] = [
  'intake',
  'plan',
  'draft',
  'critique',
  'integrate',
];

export function verifyComposerAnswerDraft(
  userInput: string,
  draft: string,
): ComposerAnswerVerifyResult {
  const text = coerceTrimmedString(draft, '');
  const issues: string[] = [];
  let score = 100;

  if (!text || isAssistantGenerationStepUi(text)) {
    return { pass: false, issues: ['답변 본문이 비어 있거나 생성 단계 문구만 있습니다.'], score: 0 };
  }

  const input = coerceTrimmedString(userInput, '');
  const minLen =
    input.length > 400 ? 180 : input.length > 150 ? 100 : input.length > 60 ? 50 : 24;
  if (text.length < minLen) {
    issues.push(`답변이 짧습니다(현재 ${text.length}자, 권장 ${minLen}자 이상). 핵심·근거·구조를 보강하세요.`);
    score -= 35;
  }

  for (const marker of GENERIC_MARKERS) {
    if (text.includes(marker)) {
      issues.push(`시스템·메타 문구(${marker})를 제거하고 사용자 질문에 대한 본문만 작성하세요.`);
      score -= 25;
      break;
    }
  }

  const numberedInInput = (input.match(/(?:^|\n)\s*\d+[.)]\s+/gm) ?? []).length;
  if (numberedInInput >= 2) {
    const numberedInAnswer = (text.match(/(?:^|\n)\s*\d+[.)]\s+/gm) ?? []).length;
    if (numberedInAnswer < Math.min(numberedInInput, 2)) {
      issues.push('다중 항목 질문인데 답변에 번호별 구분이 부족합니다. 항목 순서대로 답하세요.');
      score -= 20;
    }
  }

  if (input.includes('?') && text.length < 40) {
    issues.push('질문에 대한 직접적인 답이 드러나도록 서두에 핵심 결론을 제시하세요.');
    score -= 15;
  }

  const pass = issues.length === 0 && score >= 70;
  return { pass, issues, score: Math.max(0, score) };
}

export function buildComposerSelfDevelopRevisionContext(
  base: Record<string, unknown>,
  issues: readonly string[],
  attemptIndex: number,
  step: ComposerSelfDevelopStep,
): Record<string, unknown> {
  const prev = coerceTrimmedString(String(base.answer_quality_instruction ?? ''), '');
  const stepLabel: Record<ComposerSelfDevelopStep, string> = {
    intake: '입력·의도 재확인',
    plan: '구조·항목 재기획',
    draft: '초안 보강',
    critique: '논리·누락 비판',
    integrate: '통합·일관성',
    evolve: '다음 턴 개선 반영',
  };
  const block = [
    `[자가 개발 — ${stepLabel[step]} (시도 ${attemptIndex + 1}/${COMPOSER_SELF_DEVELOP_MAX_ATTEMPTS})]`,
    '아래 검증 이슈를 모두 해결한 **완성 답변**만 출력하세요. 이전 초안을 그대로 반복하지 마세요.',
    ...issues.map((i) => `- ${i}`),
  ].join('\n');

  const lessons = Array.isArray(base.composer_self_develop_lessons)
    ? (base.composer_self_develop_lessons as string[])
    : [];
  const lessonBlock =
    lessons.length > 0
      ? `\n[세션에서 학습한 개선점]\n${lessons.map((l) => `- ${l}`).join('\n')}`
      : '';

  return {
    ...base,
    composer_self_develop_enabled: true,
    composer_self_develop_attempt: attemptIndex + 1,
    composer_self_develop_phase: step,
    qa_pipeline_fast_path: false,
    answer_quality_instruction: prev ? `${prev}\n\n${block}${lessonBlock}` : `${block}${lessonBlock}`,
  };
}

export function readComposerSelfDevelopLessons(sessionId: string): string[] {
  if (typeof sessionStorage === 'undefined' || !sessionId) return [];
  try {
    const raw = sessionStorage.getItem(`${LESSONS_STORAGE_PREFIX}${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function appendComposerSelfDevelopLessons(sessionId: string, issues: string[]): void {
  if (typeof sessionStorage === 'undefined' || !sessionId || !issues.length) return;
  const prev = readComposerSelfDevelopLessons(sessionId);
  const next = [...prev, ...issues.map((i) => i.slice(0, 200))].slice(-MAX_STORED_LESSONS);
  try {
    sessionStorage.setItem(`${LESSONS_STORAGE_PREFIX}${sessionId}`, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function mergeSelfDevelopLessonsIntoContext(
  base: Record<string, unknown>,
  sessionId: string,
): Record<string, unknown> {
  const lessons = readComposerSelfDevelopLessons(sessionId);
  if (!lessons.length) return base;
  return { ...base, composer_self_develop_lessons: lessons };
}

export type RefineComposerAnswerFn = (
  outboundMessage: string,
  context: Record<string, unknown>,
) => Promise<string>;

export type RunComposerAnswerSelfDevelopResult = {
  finalText: string;
  attempts: number;
  improved: boolean;
  lastScore: number;
};

export type BuildComposerSelfDevelopContextFlagsOptions = {
  trimmedInput: string;
  featureCtx: Record<string, unknown>;
  pipelineMerge: Record<string, unknown>;
  isGraphComposerAnswer?: boolean;
};

/** API context에 넣을 자가 개발 플래그(활성 시에만) */
export function buildComposerSelfDevelopContextFlags(
  opts: BuildComposerSelfDevelopContextFlagsOptions,
): Record<string, unknown> {
  const composerSimpleQuery =
    opts.featureCtx.composer_simple_query === true ||
    shouldUseSimpleComposerOutboundMessage(opts.trimmedInput);
  const active = shouldRunComposerAnswerSelfDevelop({
    trimmedInput: opts.trimmedInput,
    composerSimpleQuery,
    isGraphComposerAnswer: opts.isGraphComposerAnswer,
    multiRequestMode: !!(opts.featureCtx as { multi_request_mode?: boolean }).multi_request_mode,
    oversightEnabled: opts.pipelineMerge.composer_oversight_enabled === true,
  });
  if (!active) return {};
  return {
    composer_self_develop_enabled: true,
    composer_self_develop_proactive: true,
  };
}

export type ApplyComposerSelfDevelopOptions = {
  draft: string;
  userInput: string;
  baseContext: Record<string, unknown>;
  sessionId: string;
  active: boolean;
  requestRefined: RefineComposerAnswerFn;
  onStatusText?: (text: string, step: ComposerSelfDevelopStep) => void;
  onPhase?: (step: ComposerSelfDevelopStep) => void;
  stepPacingMs?: number;
  onImproved?: () => void;
};

/** 검증·재생성 루프 적용 — 비활성·실패 시 원문 draft 유지 */
export async function applyComposerSelfDevelopIfEnabled(
  opts: ApplyComposerSelfDevelopOptions,
): Promise<{ text: string; extras?: PipelineMessageExtras }> {
  const base =
    resolveAssistantAnswerDisplayText(opts.draft) || coerceTrimmedString(opts.draft, '');
  if (!opts.active || !base) {
    return { text: base };
  }
  try {
    const improved = await runComposerAnswerSelfDevelop({
      draft: base,
      userInput: opts.userInput,
      baseContext: opts.baseContext,
      sessionId: opts.sessionId,
      requestRefined: opts.requestRefined,
      onStatusText: opts.onStatusText,
      onPhase: opts.onPhase,
      stepPacingMs: opts.stepPacingMs,
    });
    if (improved.improved) {
      opts.onImproved?.();
    }
    return {
      text: improved.finalText || base,
      extras: buildComposerSelfDevelopPipelineExtras(improved),
    };
  } catch {
    return { text: base };
  }
}

/** 메시지 pipelineExtras·SSE 메타에 실을 자가 개발 요약 */
export function buildComposerSelfDevelopPipelineExtras(
  result: RunComposerAnswerSelfDevelopResult,
): PipelineMessageExtras | undefined {
  if (result.attempts <= 0 && !result.improved) return undefined;
  return {
    composerSelfDevelopImproved: result.improved,
    composerSelfDevelopAttempts: result.attempts,
    composerSelfDevelopScore: result.lastScore,
  };
}

/**
 * 초안 검증 후 필요 시 API 재호출로 자가 개선 (최대 COMPOSER_SELF_DEVELOP_MAX_ATTEMPTS회).
 */
export async function runComposerAnswerSelfDevelop(opts: {
  draft: string;
  userInput: string;
  baseContext: Record<string, unknown>;
  sessionId: string;
  requestRefined: RefineComposerAnswerFn;
  onPhase?: (step: ComposerSelfDevelopStep) => void;
  /** 단계별 UI 문구 갱신(플레이스홀더 슬롯) */
  onStatusText?: (text: string, step: ComposerSelfDevelopStep) => void;
  /** 단계 UI 최소 표시 간격(ms). 0이면 즉시 */
  stepPacingMs?: number;
}): Promise<RunComposerAnswerSelfDevelopResult> {
  const {
    draft,
    userInput,
    baseContext,
    sessionId,
    requestRefined,
    onPhase,
    onStatusText,
    stepPacingMs = 180,
  } = opts;
  let current =
    resolveAssistantAnswerDisplayText(draft) || coerceTrimmedString(draft, '');
  let attempts = 0;

  const emitStep = async (step: ComposerSelfDevelopStep) => {
    onPhase?.(step);
    onStatusText?.(getComposerSelfDevelopStatusText(step), step);
    if (stepPacingMs > 0) {
      await new Promise((r) => setTimeout(r, stepPacingMs));
    }
  };

  const refineSteps: ComposerSelfDevelopStep[] = ['critique', 'integrate'];

  for (let i = 0; i < COMPOSER_SELF_DEVELOP_MAX_ATTEMPTS; i++) {
    const verification = verifyComposerAnswerDraft(userInput, current);
    if (verification.pass) {
      if (attempts > 0) {
        await emitStep('evolve');
      }
      return {
        finalText: current,
        attempts,
        improved: attempts > 0,
        lastScore: verification.score,
      };
    }

    for (const step of PROACTIVE_UI_STEPS) {
      await emitStep(step);
    }

    const refineStep = refineSteps[Math.min(i, refineSteps.length - 1)];
    await emitStep(refineStep);
    attempts += 1;

    const ctx = buildComposerSelfDevelopRevisionContext(
      baseContext,
      verification.issues,
      i,
      refineStep,
    );
    const revisionMessage = [
      coerceTrimmedString(userInput, ''),
      '',
      '[자가 개발 — 이전 초안을 검증 이슈에 맞게 전면 개선한 **새 답변**을 작성하세요]',
      '',
      current.slice(0, 5000),
    ].join('\n');

    try {
      const raw = await requestRefined(revisionMessage, ctx);
      const refined = resolveAssistantAnswerDisplayText(raw) || coerceTrimmedString(raw, '');
      if (refined && refined.length >= Math.min(current.length, 30)) {
        appendComposerSelfDevelopLessons(sessionId, verification.issues);
        current = refined;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  const finalVerification = verifyComposerAnswerDraft(userInput, current);
  return {
    finalText: current,
    attempts,
    improved: attempts > 0,
    lastScore: finalVerification.score,
  };
}
