/**
 * 스트리밍 API 클라이언트
 * Server-Sent Events (SSE)를 사용한 실시간 메시지 스트리밍
 * 
 * Task-H1: 메시지 스트리밍 기능 구현
 */

import errorReportingService from '../services/errorReportingService';
import { errorLogger } from './errorLogger';
import { API_BASE_URL } from '../config/api';

export interface StreamingMessage {
  text: string;
  done: boolean;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  requestBody?: Record<string, unknown>;
  /** AbortSignal for cancelling the streaming request */
  signal?: AbortSignal;
}

/**
 * Server-Sent Events를 사용한 스트리밍 요청
 */
export async function streamChatMessage(
  message: string,
  sessionId: string,
  options: StreamingOptions = {}
): Promise<string> {
  const { onChunk, onComplete, onError, onProgress, requestBody, signal } = options;
  let fullText = '';

  try {
    const candidates = [
      `${API_BASE_URL}/api/chat/stream`,
      `${API_BASE_URL}/api/unified/chat/stream`,
    ];

    const basePayload = {
      message,
      session_id: sessionId,
      conversation_id: sessionId,
      user_id: sessionId,
      ...(requestBody || {}),
    };

    let response: any = null;
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

      // 404면 다음 후보로 폴백
      if (response.status === 404 && i < candidates.length - 1) {
        continue;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      break;
    }

    if (lastError) throw lastError;

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
          try {
            // 백엔드 SSE가 {content, done} 또는 {text, done} 형태 모두 올 수 있어 유연하게 처리
            const data = JSON.parse(line.slice(6)) as any;

            if (data.error) {
              const error = new Error(data.error);
              onError?.(error);
              throw error;
            }

            const chunkText: string =
              (typeof data.text === 'string' && data.text)
                ? data.text
                : (typeof data.content === 'string' ? data.content : '');

            if (chunkText) {
              fullText += chunkText;
              onChunk?.(chunkText);
            }

            if (data.metadata?.progress !== undefined) {
              onProgress?.(Number(data.metadata.progress));
            }

            if (data.done) {
              // 백엔드가 fullContent를 제공하는 경우 최종 텍스트 보정
              if (typeof data.fullContent === 'string' && data.fullContent.length > 0) {
                fullText = data.fullContent;
              }
              onComplete?.(fullText);
              return fullText;
            }
          } catch (parseError) {
            // JSON 파싱 오류는 무시하고 계속 진행
            errorLogger.warn('Failed to parse SSE data', {
              component: 'streamingClient',
              action: 'parseSSEData',
              error: parseError instanceof Error ? parseError.message : String(parseError),
            });
          }
        }
      }
    }

    if (fullText) {
      onComplete?.(fullText);
    }

    return fullText;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // AbortError인 경우 (사용자가 취소한 경우)
    if (errorObj.name === 'AbortError') {
      // 취소 시에는 지금까지 받은 텍스트를 반환
      onComplete?.(fullText);
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

