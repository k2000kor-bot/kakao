/**
 * 스트리밍 API 클라이언트
 * Server-Sent Events (SSE)를 사용한 실시간 메시지 스트리밍
 *
 * SSE URL 폴백: `getChatStreamUrlsForConfigBase(API_BASE_URL)` (`CHAT_STREAM_PATH` → `CHAT_STREAM_PATH_UNIFIED`, `config/api`).
 *
 * Task-H1: 메시지 스트리밍 기능 구현
 */

import errorReportingService from '../services/errorReportingService';
import {
  API_BASE_URL,
  API_QUERY_PARAM_CONVERSATION_ID,
  API_QUERY_PARAM_USER_ID,
  getChatStreamUrlsForConfigBase,
} from '../config/api';
import {
  coerceTrimmedString,
  extractResponseContent,
  type MessageLikeForScenarioInherit,
} from './chatInputUtils';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
} from '../services/modernChatContextBuilder';
import type { ChatTurn, MergeApiChatContextPayloadOptions } from '../services/modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from '../services/multiLayerStyleAnalysisSystem';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from './modernChatUrlStyle';

/** JSON 폴백 응답 본문에서 SSE `metadata`와 동일 계열로 합칠 키 */
const PIPELINE_JSON_META_KEYS = [
  'next_actions',
  'follow_up_questions',
  'response_alternatives',
  'answer_mode',
  'response_style',
  'answer_blueprint',
  'generation_scenario',
  'qa_pipeline_trace_id',
  'trace_id',
  'task_plan',
  'route_decision',
  'verification_summary',
  'verification_pass',
  'evidence_coverage',
  'deepseek_critique',
  'deepseek_reasoner_meta',
  'deepseek_refine_meta',
  'korean_style_notes',
  'korean_quality_scores',
  'workspace_tool_result',
] as const;

function extractPipelineMetaFromJsonBody(
  json: Record<string, unknown>
): Record<string, unknown> | undefined {
  const meta: Record<string, unknown> = {};
  for (const key of PIPELINE_JSON_META_KEYS) {
    if (json[key] !== undefined && json[key] !== null) {
      meta[key] = json[key];
    }
  }
  const inner = json.data;
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    for (const key of PIPELINE_JSON_META_KEYS) {
      if (meta[key] === undefined && d[key] !== undefined && d[key] !== null) {
        meta[key] = d[key];
      }
    }
  }
  return Object.keys(meta).length > 0 ? meta : undefined;
}

export interface StreamingMessage {
  text: string;
  done: boolean;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  /** fullText and optional metadata (e.g. workspace_tool_result from SSE done event) */
  onComplete?: (fullText: string, metadata?: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  /** SSE 이벤트에 `metadata`가 올 때마다 누적본 전달 — 파이프라인 단계 UI 연동 */
  onMetadata?: (mergedMetadata: Record<string, unknown>) => void;
  requestBody?: Record<string, unknown>;
  /** AbortSignal for cancelling the streaming request */
  signal?: AbortSignal;
  /**
   * `REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO=true`일 때 merge에서 직전 어시스턴트 시나리오를
   * `client_generation_scenario`로 넣음 (요청 본문에 그대로 실리지 않음).
   * 비어 있으면 `requestBody.conversation_history` 또는 `requestBody.context`의
   * `conversation_history` / `conversationHistory` 턴 `pipelineExtras`로 동일 동작을 시도함.
   */
  messagesForScenarioInherit?: readonly MessageLikeForScenarioInherit[];
  /** `mergeApiChatContextPayload` 4번째 인자 병합 — 대화별 딥시크 등 */
  mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
}

/**
 * Server-Sent Events를 사용한 스트리밍 요청
 */
export async function streamChatMessage(
  message: string,
  sessionId: string,
  options: StreamingOptions = {}
): Promise<string> {
  const { onChunk, onComplete, onError, onProgress, onMetadata, requestBody, signal, messagesForScenarioInherit } =
    options;
  let fullText = '';
  /** SSE 조각마다 오는 metadata를 합쳐 done 시점에 한 번에 전달 (task_plan 등이 텍스트 청크와 분리된 경우) */
  let accumulatedMeta: Record<string, unknown> | undefined;

  const emitAccumulatedMetadata = () => {
    if (onMetadata && accumulatedMeta && Object.keys(accumulatedMeta).length > 0) {
      onMetadata({ ...accumulatedMeta });
    }
  };

  try {
    const candidates = getChatStreamUrlsForConfigBase(API_BASE_URL);

    const rb = { ...(requestBody || {}) } as Record<string, unknown>;
    const msg = coerceTrimmedString(message, '');
    const rawCtx = rb.context;
    const ctxSeed =
      rawCtx != null && typeof rawCtx === 'object' && !Array.isArray(rawCtx)
        ? { ...(rawCtx as Record<string, unknown>) }
        : {};
    const ctx = await enrichChatContextRecordWithOptionalMultilayerStyleHint(msg, ctxSeed);
    const topHist = rb.conversation_history;
    const rawHist = Array.isArray(topHist) && topHist.length > 0 ? topHist : [];
    const normalizedTop = normalizeChatTurnsForApiMerge(rawHist as ChatTurn[]);
    const hist = normalizedTop.length > 0 ? normalizedTop : undefined;
    const fromHist = resolveMergeOptionsFromHistoryAndExplicit(normalizedTop, undefined);
    const mergeForPayload: MergeApiChatContextPayloadOptions | undefined = {
      ...fromHist,
      ...options.mergeApiChatContextOptions,
      ...(messagesForScenarioInherit != null && messagesForScenarioInherit.length > 0
        ? { recentMessagesForScenarioInherit: messagesForScenarioInherit }
        : {}),
    };
    const useMergePayload = Object.keys(mergeForPayload).length > 0;
    const { quality, contextForBody } = mergeApiChatContextPayload(
      msg,
      ctx,
      hist,
      useMergePayload ? mergeForPayload : undefined
    );

    const rbRest = { ...rb };
    delete rbRest.context;
    delete rbRest.conversation_history;
    delete rbRest.quality;
    delete rbRest.message;

    const basePayload: Record<string, unknown> = {
      message: msg,
      session_id: sessionId,
      [API_QUERY_PARAM_CONVERSATION_ID]: sessionId,
      [API_QUERY_PARAM_USER_ID]: sessionId,
      quality,
      response_style: DEFAULT_CHAT_RESPONSE_STYLE,
      perspective: DEFAULT_CHAT_PERSPECTIVE,
      ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
      ...rbRest,
    };

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const url = candidates[i];
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'user',
        },
        body: JSON.stringify(basePayload),
        signal, // AbortController signal 전달
      });

      if (response.ok) {
        lastError = null;
        break;
      }

      // 404·5xx면 다음 후보로 폴백(api/chat·unified 비스트리밍과 동일 정책)
      if ((response.status === 404 || response.status >= 500) && i < candidates.length - 1) {
        continue;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      break;
    }

    if (lastError) throw lastError;
    if (!response) throw new Error('No response received');

    // 일부 테스트 mock·비표준 fetch 응답에 headers가 없을 수 있음
    const contentType =
      response.headers && typeof response.headers.get === 'function'
        ? response.headers.get('content-type') || ''
        : '';
    // 스트리밍이 아닌 JSON 응답(에러/폴백)이 오면 한 번에 파싱해 답변 추출
    if (contentType.includes('application/json')) {
      const json = (await response.json()) as Record<string, unknown>;
      const err = json?.error;
      if (typeof err === 'string' && coerceTrimmedString(err, '')) {
        const error = new Error(coerceTrimmedString(err, ''));
        onError?.(error);
        throw error;
      }
      if (json.success === false) {
        const msg =
          typeof json.error === 'string' && coerceTrimmedString(json.error, '')
            ? coerceTrimmedString(json.error, '')
            : '요청 처리에 실패했습니다.';
        const error = new Error(msg);
        onError?.(error);
        throw error;
      }
      const out = coerceTrimmedString(extractResponseContent({ data: json }), '');
      const jsonMeta = extractPipelineMetaFromJsonBody(json);
      if (jsonMeta && onMetadata) {
        onMetadata(jsonMeta);
      }
      onComplete?.(out, jsonMeta);
      return out;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      // 취소 요청 확인
      if (signal?.aborted) {
        reader.cancel();
        const abortError = new Error('Streaming cancelled by user');
        abortError.name = 'AbortError';
        throw abortError;
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = coerceTrimmedString(line.slice(6), '');
          if (!payload) continue; // 빈 data: 무시
          try {
            // JSON 파싱 시도
            const data = JSON.parse(payload) as {
              error?: string;
              text?: string;
              content?: string;
              response?: string;
              message?: string;
              delta?: string;
              metadata?: Record<string, unknown>;
              done?: boolean;
              fullContent?: string;
            };

            if (data.error) {
              const error = new Error(data.error);
              onError?.(error);
              throw error;
            }

            const chunkText: string = (() => {
              const cand = [data.text, data.content, data.response, data.message, data.delta] as unknown[];
              for (const x of cand) {
                if (typeof x === 'string' && coerceTrimmedString(x, '')) return x;
              }
              return '';
            })();

            if (chunkText) {
              fullText += chunkText;
              onChunk?.(chunkText);
            }

            if (data.metadata != null && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) {
              accumulatedMeta = { ...(accumulatedMeta ?? {}), ...data.metadata };
              if (data.metadata.progress !== undefined) {
                onProgress?.(Number(data.metadata.progress));
              }
              emitAccumulatedMetadata();
            }

            if (data.done) {
              if (typeof data.fullContent === 'string' && data.fullContent.length > 0) {
                fullText = data.fullContent;
              }
              let metaOut: Record<string, unknown> = { ...(accumulatedMeta ?? {}) };
              if (data.metadata != null && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) {
                metaOut = { ...metaOut, ...data.metadata };
              }
              const dataRec = data as Record<string, unknown>;
              for (const key of PIPELINE_JSON_META_KEYS) {
                const v = dataRec[key];
                if (v !== undefined && v !== null && metaOut[key] === undefined) {
                  metaOut[key] = v;
                }
              }
              const metaFinal = Object.keys(metaOut).length > 0 ? metaOut : undefined;
              if (metaFinal && onMetadata) {
                onMetadata(metaFinal);
              }
              onComplete?.(fullText, metaFinal);
              return fullText;
            }
          } catch (parseError) {
            // JSON이 아닌 경우 payload 자체를 텍스트로 처리 (일부 백엔드 호환)
            if (parseError instanceof SyntaxError && payload && payload !== '[DONE]') {
              fullText += payload;
              onChunk?.(payload);
            } else if (!(parseError instanceof SyntaxError)) {
              throw parseError;
            }
          }
        }
      }
    }

    // 스트림이 끝났는데 텍스트가 없으면 남은 buffer를 JSON으로 파싱 시도 (백엔드가 한 덩어리로 보낸 경우)
    if (!fullText && coerceTrimmedString(buffer, '')) {
      try {
        const data = JSON.parse(coerceTrimmedString(buffer, '')) as { response?: string; message?: string; content?: string; fullContent?: string; error?: string };
        if (data.error) {
          const err = new Error(typeof data.error === 'string' ? data.error : 'Unknown error');
          onError?.(err);
          throw err;
        }
        const text = data.fullContent ?? data.response ?? data.message ?? data.content ?? '';
        if (typeof text === 'string' && coerceTrimmedString(text, '')) {
          fullText = coerceTrimmedString(text, '');
        }
      } catch (e) {
        if (!(e instanceof SyntaxError)) throw e;
      }
    }

    // 스트림 종료 시 항상 onComplete 호출 (done 이벤트 없이 끝난 경우에도 UI 반영)
    const tailMeta =
      accumulatedMeta && Object.keys(accumulatedMeta).length > 0
        ? { ...accumulatedMeta }
        : undefined;
    if (tailMeta && onMetadata) {
      onMetadata(tailMeta);
    }
    onComplete?.(fullText, tailMeta);

    return fullText;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // AbortError인 경우 (사용자가 취소한 경우)
    if (errorObj.name === 'AbortError') {
      // 취소 시에는 지금까지 받은 텍스트를 반환
      const metaAbort =
        accumulatedMeta && Object.keys(accumulatedMeta).length > 0
          ? { ...accumulatedMeta }
          : undefined;
      onComplete?.(fullText, metaAbort);
      return fullText;
    }

    errorReportingService.reportError(errorObj, {
      severity: 'high',
      additionalContext: {
        action: 'streamChatMessage',
        sessionId,
        message,
      },
    });

    onError?.(errorObj);
    throw errorObj;
  }
}

/**
 * 스트리밍 지원 여부 확인
 */
export function isStreamingSupported(): boolean {
  return typeof fetch !== 'undefined' && typeof ReadableStream !== 'undefined';
}

