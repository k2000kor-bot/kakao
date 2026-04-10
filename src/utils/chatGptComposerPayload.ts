/**
 * ChatGPT Composer — 비스트리밍 POST `extra` / SSE `streamChatMessage` `requestBody` 공통 빌더
 */

import { API_QUERY_PARAM_PROJECT_ID } from '../config/api';
import {
  mergeApiChatContextPayload,
  type MergeApiChatContextPayloadOptions,
} from '../services/modernChatContextBuilder';
import {
  DEFAULT_CHAT_PERSPECTIVE,
  DEFAULT_CHAT_RESPONSE_STYLE,
  type ChatPerspectiveUi,
  type ChatResponseStyleUi,
} from './modernChatUrlStyle';

export type AnswerDiversityMode = 'stable' | 'varied' | 'exploratory';

/** 비스트리밍 `extra`·스트리밍 `requestBody`에 공통으로 넣는 다양성·형식 힌트 */
export const COMPOSER_CHAT_CREATIVITY_BODY: Readonly<Record<string, unknown>> = {
  max_tokens: 16384,
  enable_creative_variations: true,
  allow_flexible_format: true,
  support_multiple_output_formats: true,
  force_variety: true,
  always_vary_response: true,
  precise_intent_matching: true,
  auto_format_detection: true,
};

/** 비스트리밍 `CHAT_POST_PATH`·`CHAT_POST_PATH_UNIFIED` POST: `mergeApiChatContextPayload`로 Q→A·Genspark 병합, 다양성 등은 top-level 유지 */
export function buildChatGptNonStreamPostPayload(
  message: string,
  effectiveQuality: string,
  context: Record<string, unknown>,
  extra: Record<string, unknown>,
  scenarioMerge?: MergeApiChatContextPayloadOptions
): Record<string, unknown> {
  const { quality, contextForBody } = mergeApiChatContextPayload(
    message,
    {
      ...context,
      quality: effectiveQuality,
    },
    undefined,
    scenarioMerge
  );
  return {
    message,
    quality,
    response_style: DEFAULT_CHAT_RESPONSE_STYLE,
    perspective: DEFAULT_CHAT_PERSPECTIVE,
    ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
    ...extra,
  };
}

/** Composer 비스트리밍 POST `buildChatGptNonStreamPostPayload`의 `extra` — 경로 간 동일 유지 */
export function buildComposerNonStreamChatExtras(args: {
  conversationId: string;
  requestId: string;
  responseStyle: ChatResponseStyleUi;
  /** null이면 `DEFAULT_CHAT_PERSPECTIVE` */
  perspective: ChatPerspectiveUi | null;
  diversityLevel: AnswerDiversityMode;
  temperature: number;
  projectId?: string;
}): Record<string, unknown> {
  return {
    conversation_id: args.conversationId,
    request_id: args.requestId,
    response_style: args.responseStyle,
    perspective: args.perspective ?? DEFAULT_CHAT_PERSPECTIVE,
    diversity: true,
    diversity_level: args.diversityLevel,
    temperature: args.temperature,
    ...COMPOSER_CHAT_CREATIVITY_BODY,
    ...(args.projectId ? { [API_QUERY_PARAM_PROJECT_ID]: args.projectId } : {}),
  };
}

/** Composer 스트리밍 `streamChatMessage`의 `requestBody` — 일반·재생성·편집 경로 공통 */
export function buildComposerStreamChatRequestBody(args: {
  quality: string;
  conversationId: string;
  context: Record<string, unknown>;
  requestId: string;
  responseStyle: ChatResponseStyleUi;
  perspective: ChatPerspectiveUi | null;
  diversityLevel: AnswerDiversityMode;
  temperature: number;
  projectId?: string;
  /** 사용자 메시지 편집 후 재전송 등 */
  handleMultipleQuestions?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    quality: args.quality,
    conversation_id: args.conversationId,
    context: args.context,
    request_id: args.requestId,
    response_style: args.responseStyle,
    perspective: args.perspective ?? DEFAULT_CHAT_PERSPECTIVE,
    diversity: true,
    diversity_level: args.diversityLevel,
    temperature: args.temperature,
    ...COMPOSER_CHAT_CREATIVITY_BODY,
    ...(args.projectId ? { [API_QUERY_PARAM_PROJECT_ID]: args.projectId } : {}),
  };
  if (args.handleMultipleQuestions === true) {
    body.handle_multiple_questions = true;
  }
  return body;
}
