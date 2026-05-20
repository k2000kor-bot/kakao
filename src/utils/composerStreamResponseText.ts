/**
 * 스트리밍·완료 시 어시스턴트 본문 병합·정제 — 플레이스홀더만 남거나 clean이 과도할 때 복구
 */
import {
  cleanResponseText,
  coerceTrimmedString,
  hasPipelineExtras,
  isAssistantGenerationStepUi,
  mergePipelineMessageExtras,
  parseMultiAskItems,
  parsePipelineMessageExtras,
  parseQuestionRequirementSections,
  shouldTreatAsStructuredQuestionRequirements,
  type PipelineMessageExtras,
} from './chatInputUtils';
import { buildComposerOversightPipelineExtras } from './composerOversightPipeline';

/** 스트림 done·누적 본문 중 더 긴 쪽을 최종 원문으로 선택 */
export function mergeStreamCompletionText(
  streamCompleteText: string,
  accumulatedText: string,
): string {
  const fromDone = coerceTrimmedString(streamCompleteText, '');
  const fromAcc = coerceTrimmedString(accumulatedText, '');
  if (!fromDone) return fromAcc;
  if (!fromAcc) return fromDone;
  return fromDone.length >= fromAcc.length ? fromDone : fromAcc;
}

/** 표시용 답변 본문 — 생성 단계 플레이스홀더 제외, clean 과도 제거 시 완화 */
export function resolveAssistantAnswerDisplayText(raw: string): string {
  const trimmed = coerceTrimmedString(raw, '');
  if (!trimmed || isAssistantGenerationStepUi(trimmed)) {
    return '';
  }

  const cleaned = cleanResponseText(trimmed);
  const display = coerceTrimmedString(cleaned, '');
  if (display && !isAssistantGenerationStepUi(display)) {
    return display;
  }

  if (trimmed.length > 80 && display.length < trimmed.length * 0.12) {
    const light = coerceTrimmedString(
      trimmed.replace(/\[강제\]|\[필수\]/g, '').replace(/\n{3,}/g, '\n\n'),
      '',
    );
    if (light && !isAssistantGenerationStepUi(light)) {
      return light;
    }
  }

  return display && !isAssistantGenerationStepUi(display) ? display : '';
}

/** 완료된 답변에는 생성 단계 슬러그를 남기지 않음 — Genspark 단계 UI가 본문을 가리지 않게 */
export function finalizePipelineExtrasForAnswer(
  extras: PipelineMessageExtras | undefined,
): PipelineMessageExtras | undefined {
  if (!extras?.pipelineGenerationPhase) {
    return extras;
  }
  const { pipelineGenerationPhase: _phase, ...rest } = extras;
  if (!hasPipelineExtras(rest)) {
    return undefined;
  }
  return rest;
}

/** API 메타·자가 개발·요청 context(Council)를 어시스턴트 메시지 extras로 병합 */
export function mergeAssistantPipelineExtrasForTurn(opts: {
  responseMeta?: Record<string, unknown>;
  responseExtras?: PipelineMessageExtras;
  requestContext?: Record<string, unknown>;
  selfDevelopExtras?: PipelineMessageExtras;
}): PipelineMessageExtras | undefined {
  let merged: PipelineMessageExtras =
    finalizePipelineExtrasForAnswer(opts.responseExtras) ??
    finalizePipelineExtrasForAnswer(
      opts.responseMeta ? parsePipelineMessageExtras(opts.responseMeta) : undefined,
    ) ??
    {};

  if (opts.selfDevelopExtras) {
    merged = mergePipelineMessageExtras(opts.selfDevelopExtras, merged);
  }
  if (opts.requestContext) {
    const oversight = buildComposerOversightPipelineExtras(opts.requestContext);
    if (oversight) {
      merged = mergePipelineMessageExtras(oversight, merged);
    }
  }

  return hasPipelineExtras(merged) ? merged : undefined;
}

export type ComposerStreamPreRevealOptions = {
  trimmedInput: string;
  structuredInputAssistEnabled?: boolean;
  multiRequestMode?: boolean;
  benchmarkGenspark?: boolean;
  gensparkAgentRouteSession?: boolean;
};

/** 짧은 일반 질문은 pre-reveal(단계만 보이고 본문 숨김) 생략 */
export function shouldUseComposerStreamPreReveal(opts: ComposerStreamPreRevealOptions): boolean {
  if (opts.multiRequestMode) return true;
  if (opts.benchmarkGenspark || opts.gensparkAgentRouteSession) return true;

  const trimmed = coerceTrimmedString(opts.trimmedInput, '');
  const sections = parseQuestionRequirementSections(trimmed);
  const structured =
    Boolean(opts.structuredInputAssistEnabled) &&
    shouldTreatAsStructuredQuestionRequirements(sections);
  const multi = parseMultiAskItems(trimmed);

  if (structured || multi.hasMultiple) return true;
  if (trimmed.length > 400) return true;
  return false;
}

/** 직접 답변 모드 — Genspark 다단계 UI·파이프라인 오버헤드 생략 */
export function shouldUseComposerDirectAnswerMode(
  opts: ComposerStreamPreRevealOptions,
): boolean {
  return !shouldUseComposerStreamPreReveal(opts);
}

/** 짧은 일반 질문은 구조화 프롬프트 덤프 없이 원문 우선 전송 */
export function shouldUseSimpleComposerOutboundMessage(rawInput: string): boolean {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed || trimmed.length > 600) return false;
  const sections = parseQuestionRequirementSections(trimmed);
  if (sections.hasBoth) return false;
  const multi = parseMultiAskItems(trimmed);
  if (multi.hasMultiple) return false;
  if (/질문:|요구사항:/i.test(trimmed)) return false;
  return true;
}
