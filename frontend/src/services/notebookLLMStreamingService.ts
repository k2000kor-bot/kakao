/**
 * 노트북 LLM 스트리밍 서비스
 * 실시간 스트리밍 응답 지원
 */

import {
  API_PROJECTS_LIST_PATH,
  API_V7_NOTEBOOK_LLM_STREAM_PATH,
  PROJECT_NOTEBOOK_LLM_SEGMENT,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../config/api';
import notebookLLMService from './notebookLLMService';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';

// 타입을 직접 정의 (notebookLLMService.ts의 export 문제 해결을 위해)
export interface NotebookLLMConfig {
  modelType: 'llama3.1:8b' | 'qwen2.5:7b' | 'gemma2:9b' | 'kullm:12.8b' | 'polyglot-ko:12.8b' | 'auto';
  processingMode: 'auto' | 'local_only' | 'cloud_only' | 'hybrid';
  projectId?: string;
  contextSize?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface NotebookLLMResponse {
  content: string;
  modelUsed: string;
  processingTime: number;
  confidence: number;
  tokensUsed: number;
  mode: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface StreamingChunk {
  content: string;
  isComplete: boolean;
  metadata?: {
    tokenCount?: number;
    modelUsed?: string;
    timestamp?: string;
  };
}

export interface StreamingOptions {
  onChunk?: (chunk: StreamingChunk) => void;
  onComplete?: (response: NotebookLLMResponse) => void;
  onError?: (error: Error) => void;
  /** NDJSON 줄에 `metadata`가 있으면 누적본 전달 — 파이프라인 단계 UI */
  onMetadata?: (mergedMetadata: Record<string, unknown>) => void;
  chunkSize?: number;
  /** 취소 시 fetch 중단에 사용 */
  signal?: AbortSignal;
}

class NotebookLLMStreamingService {
  private static instance: NotebookLLMStreamingService;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = resolveApiBaseUrl();
  }

  public static getInstance(): NotebookLLMStreamingService {
    if (!NotebookLLMStreamingService.instance) {
      NotebookLLMStreamingService.instance = new NotebookLLMStreamingService();
    }
    return NotebookLLMStreamingService.instance;
  }

  /**
   * 기본 노트북 LLM 스트리밍 응답 생성
   */
  async streamDefaultNotebook(
    prompt: string,
    context?: Record<string, unknown>,
    config?: Partial<NotebookLLMConfig>,
    options?: StreamingOptions
  ): Promise<void> {
    const { onChunk, onComplete, onError, onMetadata, chunkSize = 50, signal } = options || {};
    let fullContent = '';
    let accumulatedStreamMeta: Record<string, unknown> | undefined;

    const emitNotebookStreamMeta = () => {
      if (onMetadata && accumulatedStreamMeta && Object.keys(accumulatedStreamMeta).length > 0) {
        onMetadata({ ...accumulatedStreamMeta });
      }
    };

    try {
      const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, API_V7_NOTEBOOK_LLM_STREAM_PATH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          config: { ...notebookLLMService.loadDefaultConfig(), ...config },
        }),
        signal,
      });

      if (!response.ok) {
        const statusMsg = response.status >= 500
          ? '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : response.status === 404
            ? '요청한 API를 찾을 수 없습니다.'
            : `스트리밍 실패 (${response.status}): ${response.statusText}`;
        throw new Error(statusMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('스트리밍 리더를 사용할 수 없습니다');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          emitNotebookStreamMeta();
          // 최종 응답 생성
          const finalResponse: NotebookLLMResponse = {
            content: fullContent,
            modelUsed: 'streaming',
            processingTime: 0,
            confidence: 0.8,
            tokensUsed: fullContent.length / 4, // 대략적인 토큰 수
            mode: 'streaming',
            timestamp: new Date().toISOString(),
            ...(accumulatedStreamMeta != null && Object.keys(accumulatedStreamMeta).length > 0
              ? { metadata: { ...accumulatedStreamMeta } }
              : {}),
          };

          onComplete?.(finalResponse);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!coerceTrimmedString(line, '')) continue;

          try {
            const data = JSON.parse(line) as Record<string, unknown>;
            if (data.metadata != null && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) {
              accumulatedStreamMeta = { ...(accumulatedStreamMeta ?? {}), ...(data.metadata as Record<string, unknown>) };
              emitNotebookStreamMeta();
            }

            if (data.content) {
              fullContent += String(data.content);
              
              // 청크 단위로 전송
              if (fullContent.length >= chunkSize) {
                onChunk?.({
                  content: fullContent,
                  isComplete: false,
                  metadata: {
                    tokenCount: Math.floor(fullContent.length / 4),
                    modelUsed: (data.model as string) || 'streaming',
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            }

            if (data.done) {
              emitNotebookStreamMeta();
              onChunk?.({
                content: fullContent,
                isComplete: true,
                metadata: {
                  tokenCount: Math.floor(fullContent.length / 4),
                  modelUsed: (data.model as string) || 'streaming',
                  timestamp: new Date().toISOString(),
                },
              });
            }
          } catch (e) {
            // JSON 파싱 실패 시 무시
            errorLogger.warn('스트리밍 데이터 파싱 실패', {
              component: 'NotebookLLMStreamingService',
              action: 'parseStreamingData',
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        onComplete?.({
          content: fullContent,
          modelUsed: 'streaming',
          processingTime: 0,
          confidence: 0.8,
          tokensUsed: Math.floor(fullContent.length / 4),
          mode: 'streaming',
          timestamp: new Date().toISOString(),
          ...(accumulatedStreamMeta != null && Object.keys(accumulatedStreamMeta).length > 0
            ? { metadata: { ...accumulatedStreamMeta } }
            : {}),
        });
        return;
      }
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }

  /**
   * 프로젝트별 노트북 LLM 스트리밍 응답 생성
   */
  async streamProjectNotebook(
    projectId: string,
    prompt: string,
    context?: Record<string, unknown>,
    config?: Partial<NotebookLLMConfig>,
    options?: StreamingOptions
  ): Promise<void> {
    const { onChunk, onComplete, onError, onMetadata, chunkSize = 50, signal } = options || {};
    let fullContent = '';
    let accumulatedStreamMeta: Record<string, unknown> | undefined;

    const emitNotebookStreamMeta = () => {
      if (onMetadata && accumulatedStreamMeta && Object.keys(accumulatedStreamMeta).length > 0) {
        onMetadata({ ...accumulatedStreamMeta });
      }
    };

    try {
      const projectConfig = notebookLLMService.getProjectNotebookConfig(projectId) || notebookLLMService.loadDefaultConfig();
      const finalConfig = { ...projectConfig, ...config, projectId };

      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseUrl,
          `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${PROJECT_NOTEBOOK_LLM_SEGMENT}/stream`,
        ),
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          config: finalConfig,
        }),
        signal,
      }
    );

      if (!response.ok) {
        const statusMsg = response.status >= 500
          ? '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          : response.status === 404
            ? '프로젝트 API를 찾을 수 없습니다.'
            : `프로젝트 스트리밍 실패 (${response.status}): ${response.statusText}`;
        throw new Error(statusMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('스트리밍 리더를 사용할 수 없습니다');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          emitNotebookStreamMeta();
          const finalResponse: NotebookLLMResponse = {
            content: fullContent,
            modelUsed: 'streaming',
            processingTime: 0,
            confidence: 0.8,
            tokensUsed: fullContent.length / 4,
            mode: 'streaming',
            timestamp: new Date().toISOString(),
            ...(accumulatedStreamMeta != null && Object.keys(accumulatedStreamMeta).length > 0
              ? { metadata: { ...accumulatedStreamMeta } }
              : {}),
          };

          onComplete?.(finalResponse);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!coerceTrimmedString(line, '')) continue;

          try {
            const data = JSON.parse(line) as Record<string, unknown>;
            if (data.error) {
              onError?.(new Error(String(data.error)));
              return;
            }
            if (data.metadata != null && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) {
              accumulatedStreamMeta = { ...(accumulatedStreamMeta ?? {}), ...(data.metadata as Record<string, unknown>) };
              emitNotebookStreamMeta();
            }
            if (data.content !== undefined) {
              fullContent += String(data.content);
              if (fullContent.length >= chunkSize) {
                onChunk?.({
                  content: fullContent,
                  isComplete: false,
                  metadata: {
                    tokenCount: Math.floor(fullContent.length / 4),
                    modelUsed: (data.model as string) || 'streaming',
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            }
            if (data.done) {
              emitNotebookStreamMeta();
              onChunk?.({
                content: fullContent,
                isComplete: true,
                metadata: {
                  tokenCount: Math.floor(fullContent.length / 4),
                  modelUsed: (data.model as string) || 'streaming',
                  timestamp: new Date().toISOString(),
                },
              });
            }
          } catch (e) {
            errorLogger.warn('스트리밍 데이터 파싱 실패', {
              component: 'NotebookLLMStreamingService',
              action: 'parseStreamingData',
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        onComplete?.({
          content: fullContent,
          modelUsed: 'streaming',
          processingTime: 0,
          confidence: 0.8,
          tokensUsed: Math.floor(fullContent.length / 4),
          mode: 'streaming',
          timestamp: new Date().toISOString(),
          ...(accumulatedStreamMeta != null && Object.keys(accumulatedStreamMeta).length > 0
            ? { metadata: { ...accumulatedStreamMeta } }
            : {}),
        });
        return;
      }
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }
}

export const notebookLLMStreamingService = NotebookLLMStreamingService.getInstance();
export default notebookLLMStreamingService;

