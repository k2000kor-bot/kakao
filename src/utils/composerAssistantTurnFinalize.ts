/**
 * Ultimate·파일 분석 등 ChatGPTInterface 외 경로에서
 * Council context·자가 개발·pipelineExtras 병합을 동일하게 적용합니다.
 */
import {
  extractPipelineMessageExtrasFromChatResponse,
  extractResponseContent,
  hasPipelineExtras,
  type PipelineMessageExtras,
} from './chatInputUtils';
import { DEFAULT_CHAT_RESPONSE_STYLE } from './modernChatUrlStyle';
import {
  applyComposerSelfDevelopIfEnabled,
  buildComposerSelfDevelopContextFlags,
  shouldRunComposerAnswerSelfDevelop,
  type RefineComposerAnswerFn,
} from './composerAnswerSelfDevelopment';
import {
  buildUnifiedQaGensparkPipelineContextMerge,
  type BuildUnifiedQaGensparkPipelineContextMergeOptions,
} from './buildUnifiedQaGensparkPipelineContextMerge';
import {
  mergeAssistantPipelineExtrasForTurn,
  resolveAssistantAnswerDisplayText,
  shouldUseSimpleComposerOutboundMessage,
} from './composerStreamResponseText';

export type BuildComposerPipelineContextAppendOptions =
  BuildUnifiedQaGensparkPipelineContextMergeOptions & {
    /** 관계도 handoff 등 — 미지정 시 featureCtx.conversation_graph_analysis */
    isGraphComposerAnswer?: boolean;
  };

export type BuildComposerPipelineContextAppendResult = {
  parsedInput?: ReturnType<typeof buildUnifiedQaGensparkPipelineContextMerge>['parsedInput'];
  pipelineMerge: Record<string, unknown>;
  selfDevelopFlags: Record<string, unknown>;
};

/** Q→A·Council API context (자가 개발 플래그 없음) */
export function buildComposerPipelineMerge(
  options: BuildComposerPipelineContextAppendOptions,
): Pick<BuildComposerPipelineContextAppendResult, 'parsedInput' | 'pipelineMerge'> {
  const { parsedInput, pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge(options);
  return { parsedInput, pipelineMerge };
}

/** Q→A·Council·자가 개발 API context 플래그 */
export function buildComposerPipelineContextAppend(
  options: BuildComposerPipelineContextAppendOptions,
): BuildComposerPipelineContextAppendResult {
  const { parsedInput, pipelineMerge } = buildComposerPipelineMerge(options);
  const selfDevelopFlags = buildComposerSelfDevelopContextFlags({
    trimmedInput: options.trimmedInput,
    featureCtx: options.featureCtx,
    pipelineMerge,
    isGraphComposerAnswer:
      options.isGraphComposerAnswer ?? options.featureCtx.conversation_graph_analysis === true,
  });
  return { parsedInput, pipelineMerge, selfDevelopFlags };
}

export type CreatePostChatRefinedAnswerFnOptions = {
  postChat: (body: Record<string, unknown>) => Promise<unknown>;
  buildPayload: (outboundMessage: string, context: Record<string, unknown>) => Record<string, unknown>;
};

export function createPostChatRefinedAnswerFn(
  opts: CreatePostChatRefinedAnswerFnOptions,
): RefineComposerAnswerFn {
  return async (outboundMessage, contextForBody) => {
    const response = await opts.postChat(
      opts.buildPayload(outboundMessage, contextForBody),
    );
    const extracted = extractResponseContent(response);
    const display = resolveAssistantAnswerDisplayText(extracted);
    if (!display || extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.') {
      throw new Error('자가 개선 재생성 응답이 비어 있습니다.');
    }
    return display;
  };
}

export type FinalizeAssistantNonStreamTurnOptions = {
  draft: string;
  userInput: string;
  requestContext: Record<string, unknown>;
  sessionId: string;
  selfDevelopActive: boolean;
  requestRefined: RefineComposerAnswerFn;
  responseData?: unknown;
  responseMeta?: Record<string, unknown>;
  stepPacingMs?: number;
  onStatusText?: (text: string) => void;
  onImproved?: () => void;
};

export async function finalizeAssistantNonStreamTurn(
  opts: FinalizeAssistantNonStreamTurnOptions,
): Promise<{ text: string; pipelineExtras?: PipelineMessageExtras }> {
  const sd = await applyComposerSelfDevelopIfEnabled({
    draft: opts.draft,
    userInput: opts.userInput,
    baseContext: opts.requestContext,
    sessionId: opts.sessionId,
    active: opts.selfDevelopActive,
    requestRefined: opts.requestRefined,
    stepPacingMs: opts.stepPacingMs ?? 140,
    onStatusText: opts.onStatusText
      ? (text) => opts.onStatusText!(text)
      : undefined,
    onImproved: opts.onImproved,
  });

  const pipelineExtras = mergeAssistantPipelineExtrasForTurn({
    responseMeta: opts.responseMeta,
    responseExtras: opts.responseData
      ? extractPipelineMessageExtrasFromChatResponse(opts.responseData)
      : undefined,
    requestContext: opts.requestContext,
    selfDevelopExtras: sd.extras,
  });

  return {
    text: sd.text,
    pipelineExtras: hasPipelineExtras(pipelineExtras) ? pipelineExtras : undefined,
  };
}

export function isComposerSelfDevelopActiveForTurn(opts: {
  trimmedInput: string;
  featureCtx: Record<string, unknown>;
  pipelineMerge: Record<string, unknown>;
  isGraphComposerAnswer?: boolean;
}): boolean {
  const composerSimpleQuery =
    opts.featureCtx.composer_simple_query === true ||
    shouldUseSimpleComposerOutboundMessage(opts.trimmedInput);
  return shouldRunComposerAnswerSelfDevelop({
    trimmedInput: opts.trimmedInput,
    composerSimpleQuery,
    isGraphComposerAnswer: opts.isGraphComposerAnswer,
    multiRequestMode: opts.featureCtx.multi_request_mode === true,
    oversightEnabled: opts.pipelineMerge.composer_oversight_enabled === true,
  });
}

/** 기본 responseStyle이 없을 때 사용 */
export const DEFAULT_COMPOSER_PIPELINE_RESPONSE_STYLE = DEFAULT_CHAT_RESPONSE_STYLE;
