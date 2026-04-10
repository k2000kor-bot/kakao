/**
 * API 클라이언트 유틸리티
 * 타입 안전한 API 호출을 위한 헬퍼 함수
 *
 * 대화 POST 폴백: `getChatPostUrlsForConfigBase(API_BASE_URL)` (`config/api`의 `CHAT_POST_PATH` 순).
 * 앱 통합 경로는 `unifiedAPI.sendChatMessage`가 동일 URL 순을 쓰되 응답 정규화·오프라인 폴백이 다름.
 *
 * Task-F1: 코드 품질 개선
 */

import axios, { type AxiosInstance } from 'axios';
import type { ChatAPIResponse } from '../types';
import errorReportingService from '../services/errorReportingService';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  type ChatTurn,
  type MergeApiChatContextPayloadOptions,
} from '../services/modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from '../services/multiLayerStyleAnalysisSystem';
import { retryApiCall, RetryOptions } from './retryHandler';
import { API_BASE_URL, getChatPostUrlsForConfigBase, joinApiHealthCheckUrl } from '../config/api';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from './modernChatUrlStyle';

export interface APIError extends Error {
  status?: number;
  statusText?: string;
  response?: Record<string, unknown>;
}

/**
 * 타입 안전한 fetch 래퍼 (재시도 로직 포함). 현재 대화 POST 경로는 `postChatJsonWithFallback`만 사용.
 */
async function _apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> {
  const url = joinApiHealthCheckUrl(API_BASE_URL, endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

  const fetchFunction = async (): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'user',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      
      try {
        error.response = await response.json() as Record<string, unknown>;
      } catch {
        // JSON 파싱 실패 시 무시
      }
      
      throw error;
    }

    return await response.json();
  };

  // 재시도 옵션이 있으면 재시도 로직 사용
  if (retryOptions) {
    return retryApiCall(fetchFunction, retryOptions);
  }

  // 재시도 옵션이 없으면 기본 재시도 로직 적용 (네트워크 오류만)
  try {
    return await retryApiCall(fetchFunction, {
      maxRetries: 2,
      initialDelay: 1000,
      retryable: (error: unknown) => {
        if (error instanceof TypeError && error.message.includes('fetch')) return true;
        const err = error as { status?: number };
        if (typeof err?.status === 'number' && err.status >= 500 && err.status < 600) return true;
        return false;
      },
    });
  } catch (error) {
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError: APIError = new Error('네트워크 연결에 실패했습니다.');
      networkError.status = 0;
      throw networkError;
    }

    throw error;
  }
}

/** `CHAT_POST_PATH` → `CHAT_POST_PATH_UNIFIED` 순(404·5xx 시 다음 URL). 전체 JSON 본문 유지(감정·의도 분석 등). */
async function apiFetchChatWithFallback<T>(body: Record<string, unknown>): Promise<T> {
  const urls = getChatPostUrlsForConfigBase(API_BASE_URL);
  let lastError: Error | null = null;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'user',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error: APIError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        try {
          error.response = (await response.json()) as Record<string, unknown>;
        } catch {
          /* ignore */
        }
        lastError = error;
        if ((response.status === 404 || response.status >= 500) && i < urls.length - 1) {
          continue;
        }
        throw error;
      }

      return (await response.json()) as T;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const st = (e as APIError)?.status;
      const retryable =
        typeof st === 'number' && (st === 404 || st >= 500) && i < urls.length - 1;
      if (retryable) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('대화 API 호출 실패');
}

/**
 * 임의 대화 POST 본문으로 `CHAT_POST_PATH` → `CHAT_POST_PATH_UNIFIED` 순 호출(App·SimpleChatView 등).
 * 성공 시 파싱된 JSON만 반환(감정·의도 필드 유지). 실패 시 throw.
 */
export async function postChatJsonWithFallback<T = Record<string, unknown>>(
  body: Record<string, unknown>
): Promise<T> {
  return retryApiCall(() => apiFetchChatWithFallback<T>(body), {
    maxRetries: 2,
    initialDelay: 1000,
    retryable: (error: unknown) => {
      if (error instanceof TypeError && error.message.includes('fetch')) return true;
      const err = error as APIError;
      if (typeof err?.status === 'number' && err.status >= 500 && err.status < 600) return true;
      return false;
    },
  });
}

export type PostChatAxiosPerUrlRetry = {
  maxRetries: number;
  retryDelayMs: number;
};

export type PostChatAxiosWithFallbackOptions = {
  /** URL 하나당 5xx·네트워크 오류 시 재시도 (ChatGPTInterface 메인 비스트리밍과 동일) */
  perUrlRetry?: PostChatAxiosPerUrlRetry;
  /** 미지정 시 전역 `axios`. 인터셉터가 필요하면 `axios.create` 인스턴스 전달 */
  axiosInstance?: AxiosInstance;
};

/** 비스트리밍 대화 POST(Composer/ChatGPTInterface) 공통 타임아웃 */
export const DEFAULT_CHAT_POST_AXIOS_OPTIONS: { timeout: number } = { timeout: 60000 };

export const DEFAULT_CHAT_POST_PER_URL_RETRY: PostChatAxiosPerUrlRetry = {
  maxRetries: 3,
  retryDelayMs: 1000,
};

export const DEFAULT_CHAT_POST_FALLBACK_OPTIONS: PostChatAxiosWithFallbackOptions = {
  perUrlRetry: DEFAULT_CHAT_POST_PER_URL_RETRY,
};

async function axiosPostChatSingleUrl(
  url: string,
  payload: Record<string, unknown>,
  axiosOptions: { timeout: number },
  perUrlRetry?: PostChatAxiosPerUrlRetry,
  axiosInstance?: AxiosInstance
): Promise<Awaited<ReturnType<typeof axios.post>>> {
  const client = axiosInstance ?? axios;
  const reqOpts = {
    ...axiosOptions,
    headers: { 'Content-Type': 'application/json' },
  };
  if (perUrlRetry == null) {
    return client.post(url, payload, reqOpts);
  }
  const { maxRetries, retryDelayMs } = perUrlRetry;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.post(url, payload, reqOpts);
    } catch (error) {
      lastError = error;
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 500 && status < 600 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
          continue;
        }
        if (!error.response && error.request && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * `getChatPostUrlsForConfigBase` 순으로 `axios.post` — 폴백(404 시 다음 URL).
 * `extractResponseContent` 등 기존 axios 응답 소비 코드와 호환.
 */
export async function postChatAxiosWithFallback(
  apiBaseUrl: string,
  payload: Record<string, unknown>,
  axiosOptions: { timeout: number },
  options?: PostChatAxiosWithFallbackOptions
): Promise<Awaited<ReturnType<typeof axios.post>>> {
  const chatEndpoints = getChatPostUrlsForConfigBase(apiBaseUrl);
  let response: Awaited<ReturnType<typeof axios.post>> | null = null;
  let lastError: Error | null = null;
  for (let i = 0; i < chatEndpoints.length; i++) {
    const url = chatEndpoints[i];
    try {
      const result = await axiosPostChatSingleUrl(
        url,
        payload,
        axiosOptions,
        options?.perUrlRetry,
        options?.axiosInstance
      );
      if (result && typeof result === 'object' && result !== null && 'data' in result) {
        response = result;
        break;
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404 && i < chatEndpoints.length - 1) {
          continue;
        }
        if (
          e.response?.status &&
          e.response.status >= 500 &&
          i === chatEndpoints.length - 1
        ) {
          continue;
        }
      }
      if (i < chatEndpoints.length - 1) {
        continue;
      }
    }
  }
  if (!response || typeof response !== 'object' || response === null || !('data' in response)) {
    throw lastError || new Error('대화 API에 연결할 수 없습니다.');
  }
  return response;
}

/**
 * 대화 API 호출
 */
export async function sendChatMessage(
  message: string,
  sessionId: string,
  options?: {
    context?: Record<string, unknown>;
    conversation_history?: ChatTurn[];
    /** 미지정 시 `conversation_history` 턴으로 `scenarioInheritMergeOptionsFromMessages` 유도 */
    mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
    /** 미지정 시 balanced·practical (`ChatGPTInterface` 등과 동일 기본) */
    response_style?: string;
    perspective?: string;
  }
): Promise<ChatAPIResponse> {
  try {
    const rawHist =
      options != null && Array.isArray(options.conversation_history)
        ? options.conversation_history
        : [];
    const history = normalizeChatTurnsForApiMerge(rawHist);
    const mergeForPayload = resolveMergeOptionsFromHistoryAndExplicit(
      history,
      options?.mergeApiChatContextOptions
    );
    const enrichedContext = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
      message,
      options?.context
    );
    const { quality, contextForBody } = mergeApiChatContextPayload(
      message,
      enrichedContext,
      history.length > 0 ? history : undefined,
      mergeForPayload
    );
    const request: Record<string, unknown> = {
      message,
      quality,
      session_id: sessionId,
      response_style: options?.response_style ?? DEFAULT_CHAT_RESPONSE_STYLE,
      perspective: options?.perspective ?? DEFAULT_CHAT_PERSPECTIVE,
    };
    if (contextForBody && Object.keys(contextForBody).length > 0) {
      request.context = contextForBody;
    }

    return await postChatJsonWithFallback<ChatAPIResponse>(request);
  } catch (error) {
    // 에러 리포팅
    const errorObj = error instanceof Error ? error : new Error(String(error));
    errorReportingService.reportError(errorObj, {
      severity: 'high',
      additionalContext: {
        action: 'sendChatMessage',
        sessionId,
        message,
      },
    });

    throw error;
  }
}

/**
 * API 응답 검증
 */
export function isValidChatResponse(data: unknown): data is ChatAPIResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as Record<string, unknown>).success === 'boolean'
  );
}
