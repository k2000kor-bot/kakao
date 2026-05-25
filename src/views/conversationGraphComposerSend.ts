import type { ChatResponseStyleUi } from '../utils/modernChatUrlStyle';
import {
  GRAPH_ANSWER_API_QUALITY,
  GRAPH_ANSWER_API_RESPONSE_STYLE,
  GRAPH_ANSWER_CONTEXT_FLAG,
  applyGraphAnswerQualityDefaults,
  generateGraphAnswerViaChat,
  sealConversationGraphChatContext,
  type GraphAnswerGenerateOptions,
} from './conversationGraphAnswerGeneration';
import { isGraphAnswerTwoPassEnabled } from './conversationGraphAnswerTwoPass';

/** 메인 채팅 입력창 전송 시 관계도 답변과 충돌하는 composer 플래그 */
const COMPOSER_OVERSIGHT_KEYS = [
  'composer_oversight_enabled',
  'composer_oversight_work_items',
  'composer_oversight_has_multiple',
  'composer_oversight_plan_markdown',
  'composer_oversight_instruction',
  'composer_oversight_council_v2',
  'composer_oversight_council_phases',
  'composer_oversight_execution_brief',
  'composer_oversight_council_instruction',
  'oversight_council_execution_brief',
  'pipeline_oversight_council',
] as const;

const COMPOSER_CHAFF_KEYS = [
  'encourage_variety',
  'vary_approach',
  'include_alternatives',
  'vary_logical_flow',
  'include_multiple_perspectives',
  'support_multiple_styles',
  'flexible_output_format',
  'force_variety',
  'always_vary_response',
  'precise_intent_matching',
  'auto_format_detection',
  'adapt_answer_to_request',
] as const;

export function isConversationGraphComposerContext(context: Record<string, unknown>): boolean {
  return context[GRAPH_ANSWER_CONTEXT_FLAG] === true;
}

export type GraphComposerSendOptions = {
  quality: 'basic' | 'enhanced' | 'ultimate';
  responseStyle: ChatResponseStyleUi;
};

export function resolveGraphComposerSendOptions(options: {
  isGraph: boolean;
  quality: 'basic' | 'enhanced' | 'ultimate';
  responseStyle: ChatResponseStyleUi;
}): GraphComposerSendOptions {
  if (!options.isGraph) {
    return { quality: options.quality, responseStyle: options.responseStyle };
  }
  return {
    quality: GRAPH_ANSWER_API_QUALITY,
    responseStyle: GRAPH_ANSWER_API_RESPONSE_STYLE,
  };
}

/**
 * 관계도 handoff·생성 의도 전송용 context 정리 — 다중요청·다양성 강제·일반 품질 지시 덮어쓰기 방지.
 */
export function finalizeComposerContextForGraphChat(
  context: Record<string, unknown>,
): Record<string, unknown> {
  if (!isConversationGraphComposerContext(context)) {
    return context;
  }

  const sealed = sealConversationGraphChatContext(context);
  const next: Record<string, unknown> = { ...sealed };

  for (const key of COMPOSER_CHAFF_KEYS) {
    delete next[key];
  }
  for (const key of COMPOSER_OVERSIGHT_KEYS) {
    delete next[key];
  }

  next.prefer_informed_answer = true;
  next.multi_request_mode = false;
  delete next.multi_request_items;
  delete next.multi_request_adaptation_instruction;

  const withQuality = applyGraphAnswerQualityDefaults(next);
  const graphInstruction = withQuality.answer_quality_instruction;
  if (graphInstruction != null && String(graphInstruction).trim()) {
    withQuality.answer_quality_instruction = String(graphInstruction).trim();
  }

  return withQuality;
}

/** 전송 성공 후 재생성·편집이 graph 맥락(첨부·handoff)을 잃지 않도록 ref에 누적 */
export function mergePersistedGraphComposerContext(
  ref: { current: Record<string, unknown> | null },
  context: Record<string, unknown>,
): void {
  if (!isConversationGraphComposerContext(context)) {
    return;
  }
  ref.current = {
    ...(ref.current ?? {}),
    ...finalizeComposerContextForGraphChat(context),
  };
}

/** handoff·편집·재생성 — merge·2-pass·자가검증 포함 관계도 답변 생성 */
export async function runGraphComposerAnswerGeneration(
  apiMessage: string,
  context: Record<string, unknown>,
  opts?: GraphAnswerGenerateOptions,
): Promise<string | null> {
  return generateGraphAnswerViaChat(apiMessage, context, {
    ...opts,
    twoPass: opts?.twoPass ?? isGraphAnswerTwoPassEnabled(),
  });
}
