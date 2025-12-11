/**
 * 노트북 LLM 스트리밍 서비스
 * 실시간 스트리밍 응답 지원
 */

import notebookLLMService from './notebookLLMService';
import { errorLogger } from '../utils/errorLogger';

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
  metadata?: Record<string, any>;
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
  chunkSize?: number;
}

class NotebookLLMStreamingService {
  private static instance: NotebookLLMStreamingService;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
    context?: Record<string, any>,
    config?: Partial<NotebookLLMConfig>,
    options?: StreamingOptions
  ): Promise<void> {
    const { onChunk, onComplete, onError, chunkSize = 50 } = options || {};

    try {
      const response = await fetch(`${this.baseUrl}/api/v7/notebook-llm/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          config: { ...notebookLLMService.loadDefaultConfig(), ...config },
        }),
      });

      if (!response.ok) {
        throw new Error(`스트리밍 실패: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      if (!reader) {
        throw new Error('스트리밍 리더를 사용할 수 없습니다');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 최종 응답 생성
          const finalResponse: NotebookLLMResponse = {
            content: fullContent,
            modelUsed: 'streaming',
            processingTime: 0,
            confidence: 0.8,
            tokensUsed: fullContent.length / 4, // 대략적인 토큰 수
            mode: 'streaming',
            timestamp: new Date().toISOString(),
          };

          onComplete?.(finalResponse);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);
            
            if (data.content) {
              fullContent += data.content;
              
              // 청크 단위로 전송
              if (fullContent.length >= chunkSize) {
                onChunk?.({
                  content: fullContent,
                  isComplete: false,
                  metadata: {
                    tokenCount: Math.floor(fullContent.length / 4),
                    modelUsed: data.model || 'streaming',
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            }

            if (data.done) {
              onChunk?.({
                content: fullContent,
                isComplete: true,
                metadata: {
                  tokenCount: Math.floor(fullContent.length / 4),
                  modelUsed: data.model || 'streaming',
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
    context?: Record<string, any>,
    config?: Partial<NotebookLLMConfig>,
    options?: StreamingOptions
  ): Promise<void> {
    const { onChunk, onComplete, onError, chunkSize = 50 } = options || {};

    try {
      const projectConfig = notebookLLMService.getProjectNotebookConfig(projectId) || notebookLLMService.loadDefaultConfig();
      const finalConfig = { ...projectConfig, ...config, projectId };

      const response = await fetch(`${this.baseUrl}/api/v7/notebook-llm/project/${projectId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          config: finalConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`프로젝트 스트리밍 실패: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      if (!reader) {
        throw new Error('스트리밍 리더를 사용할 수 없습니다');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const finalResponse: NotebookLLMResponse = {
            content: fullContent,
            modelUsed: 'streaming',
            processingTime: 0,
            confidence: 0.8,
            tokensUsed: fullContent.length / 4,
            mode: 'streaming',
            timestamp: new Date().toISOString(),
          };

          onComplete?.(finalResponse);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);
            
            if (data.content) {
              fullContent += data.content;
              
              if (fullContent.length >= chunkSize) {
                onChunk?.({
                  content: fullContent,
                  isComplete: false,
                  metadata: {
                    tokenCount: Math.floor(fullContent.length / 4),
                    modelUsed: data.model || 'streaming',
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            }

            if (data.done) {
              onChunk?.({
                content: fullContent,
                isComplete: true,
                metadata: {
                  tokenCount: Math.floor(fullContent.length / 4),
                  modelUsed: data.model || 'streaming',
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
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }
}

export const notebookLLMStreamingService = NotebookLLMStreamingService.getInstance();
export default notebookLLMStreamingService;

