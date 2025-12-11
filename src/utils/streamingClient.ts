/**
 * 스트리밍 API 클라이언트
 * Server-Sent Events (SSE)를 사용한 실시간 메시지 스트리밍
 * 
 * Task-H1: 메시지 스트리밍 기능 구현
 */

import errorReportingService from '../services/errorReportingService';
import { errorLogger } from './errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
}

/**
 * Server-Sent Events를 사용한 스트리밍 요청
 */
export async function streamChatMessage(
  message: string,
  sessionId: string,
  options: StreamingOptions = {}
): Promise<string> {
  const { onChunk, onComplete, onError, onProgress } = options;
  let fullText = '';

  try {
    const url = `${API_BASE_URL}/api/chat/stream`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'user',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
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
            const data = JSON.parse(line.slice(6)) as StreamingMessage;

            if (data.error) {
              const error = new Error(data.error);
              onError?.(error);
              throw error;
            }

            if (data.text) {
              fullText += data.text;
              onChunk?.(data.text);
            }

            if (data.metadata?.progress !== undefined) {
              onProgress?.(Number(data.metadata.progress));
            }

            if (data.done) {
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

