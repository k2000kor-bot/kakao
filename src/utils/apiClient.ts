/**
 * API 클라이언트 유틸리티
 * 타입 안전한 API 호출을 위한 헬퍼 함수
 * 
 * Task-F1: 코드 품질 개선
 */

import type { ChatAPIRequest, ChatAPIResponse } from '../types';
import errorReportingService from '../services/errorReportingService';
import { retryApiCall, RetryOptions } from './retryHandler';
import { localLLMService } from '../services/localLLMService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export interface APIError extends Error {
  status?: number;
  statusText?: string;
  response?: Record<string, unknown>;
}

/**
 * 타입 안전한 fetch 래퍼 (재시도 로직 포함)
 */
async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

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
      retryable: (error: any) => {
        // 네트워크 오류만 재시도
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return true;
        }
        // 5xx 서버 오류 재시도
        if (error?.status >= 500 && error?.status < 600) {
          return true;
        }
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

  /**
 * 채팅 API 호출
   */
export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<ChatAPIResponse> {
  try {
    const request: ChatAPIRequest = {
      message,
      session_id: sessionId,
    };

    const response = await apiFetch<ChatAPIResponse>(
      '/api/chat',
      {
      method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response;
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
