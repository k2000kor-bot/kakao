/**
 * 로컬 LLM 서비스
 * 노트북에서 실행되는 로컬 LLM (Ollama, LM Studio 등) 연동
 */

import {
  API_GENERATE_PATH,
  API_OLLAMA_TAGS_PATH,
  joinApiHealthCheckUrl,
  OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH,
  OPENAI_COMPAT_V1_MODELS_PATH,
} from '../config/api';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  LOCAL_LLM_PROVIDERS_STORAGE_KEY,
  PROJECT_LLM_CONFIGS_STORAGE_KEY,
} from './localLLMStorageKeys';

/** CRA: `.env.local` 의 REACT_APP_OLLAMA_BASE_URL 등 — docs/PORTS.md · env.example */
const DEFAULT_OLLAMA_BASE =
  process.env.REACT_APP_OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_LM_STUDIO_BASE =
  process.env.REACT_APP_LM_STUDIO_BASE_URL || 'http://localhost:1234';

export interface LLMProvider {
  id: string;
  name: string;
  type: 'ollama' | 'lmstudio' | 'custom';
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface ProjectLLMConfig {
  projectId: string;
  projectName: string;
  provider: LLMProvider;
  model: LLMModel;
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
    stream: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export class LocalLLMService {
  private providers: Map<string, LLMProvider> = new Map();
  private projectConfigs: Map<string, ProjectLLMConfig> = new Map();
  private defaultProvider: LLMProvider | null = null;

  constructor() {
    this.initializeDefaultProviders();
    this.loadProjectConfigs();
  }

  /**
   * 기본 프로바이더 초기화
   */
  private initializeDefaultProviders(): void {
    // Ollama 기본 설정
    const ollamaProvider: LLMProvider = {
      id: 'ollama-default',
      name: 'Ollama (Local)',
      type: 'ollama',
      baseUrl: DEFAULT_OLLAMA_BASE,
      enabled: true,
    };

    // LM Studio 기본 설정
    const lmStudioProvider: LLMProvider = {
      id: 'lmstudio-default',
      name: 'LM Studio (Local)',
      type: 'lmstudio',
      baseUrl: DEFAULT_LM_STUDIO_BASE,
      enabled: true,
    };

    this.providers.set(ollamaProvider.id, ollamaProvider);
    this.providers.set(lmStudioProvider.id, lmStudioProvider);
    this.defaultProvider = ollamaProvider;

    // 저장된 프로바이더 로드
    this.loadProviders();
  }

  /**
   * 프로바이더 추가
   */
  addProvider(provider: LLMProvider): void {
    this.providers.set(provider.id, provider);
    this.saveProviders();
  }

  /**
   * 프로바이더 제거
   */
  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.saveProviders();
  }

  /**
   * 프로바이더 목록 조회
   */
  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 프로젝트별 LLM 설정
   */
  setProjectLLM(projectId: string, projectName: string, provider: LLMProvider, model: LLMModel, settings?: Partial<ProjectLLMConfig['settings']>): void {
    const config: ProjectLLMConfig = {
      projectId,
      projectName,
      provider,
      model,
      settings: {
        temperature: settings?.temperature ?? 0.7,
        maxTokens: settings?.maxTokens ?? model.maxTokens,
        topP: settings?.topP ?? 0.9,
        topK: settings?.topK,
        stream: settings?.stream ?? true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projectConfigs.set(projectId, config);
    this.saveProjectConfigs();
  }

  /**
   * 프로젝트별 LLM 설정 조회
   */
  getProjectLLM(projectId: string): ProjectLLMConfig | undefined {
    return this.projectConfigs.get(projectId);
  }

  /**
   * 프로젝트별 LLM 설정 목록
   */
  getProjectConfigs(): ProjectLLMConfig[] {
    return Array.from(this.projectConfigs.values());
  }

  /**
   * 프로젝트별 LLM 설정 삭제
   */
  removeProjectLLM(projectId: string): void {
    this.projectConfigs.delete(projectId);
    this.saveProjectConfigs();
  }

  /**
   * 사용 가능한 모델 목록 조회 (Ollama)
   */
  async getOllamaModels(baseUrl: string): Promise<LLMModel[]> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(baseUrl, API_OLLAMA_TAGS_PATH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Ollama models: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.models || []).map((model: Record<string, unknown>) => ({
        id: `ollama-${String(model.name ?? '')}`,
        name: String(model.name ?? ''),
        provider: 'ollama',
        description: String(model.name ?? ''),
        contextLength: Number(model.size) || 4096,
        maxTokens: 2048,
      }));
    } catch (error) {
      errorLogger.error('Ollama 모델 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'getOllamaModels',
        baseUrl,
      });
      return [];
    }
  }

  /**
   * 사용 가능한 모델 목록 조회 (LM Studio)
   */
  async getLMStudioModels(baseUrl: string): Promise<LLMModel[]> {
    try {
      const response = await fetch(joinApiHealthCheckUrl(baseUrl, OPENAI_COMPAT_V1_MODELS_PATH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch LM Studio models: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.data || []).map((model: Record<string, unknown>) => ({
        id: `lmstudio-${String(model.id ?? '')}`,
        name: String(model.id ?? ''),
        provider: 'lmstudio',
        description: String(model.id ?? ''),
        contextLength: 4096,
        maxTokens: 2048,
      }));
    } catch (error) {
      errorLogger.error('LM Studio 모델 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'getLMStudioModels',
        baseUrl,
      });
      return [];
    }
  }

  /**
   * LLM 요청 전송 (Ollama)
   */
  async sendOllamaRequest(
    baseUrl: string,
    request: LLMRequest,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const url = joinApiHealthCheckUrl(baseUrl, API_GENERATE_PATH);
    let fullContent = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          stream: request.stream ?? true,
          options: {
            temperature: request.temperature ?? 0.7,
            top_p: request.topP ?? 0.9,
            top_k: request.topK,
            num_predict: request.maxTokens ?? 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      if (request.stream) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((line) => coerceTrimmedString(line, ''));

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  fullContent += data.response;
                  onChunk?.(data.response);
                }
                if (data.done) {
                  break;
                }
              } catch (e) {
                // JSON 파싱 실패 무시
              }
            }
          }
        }
      } else {
        const data = await response.json();
        fullContent = data.response || '';
      }

      return {
        content: fullContent,
        model: request.model,
        finishReason: 'stop',
      };
    } catch (error) {
      errorLogger.error('Ollama 요청 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'sendOllamaRequest',
        baseUrl,
        model: request.model,
      });
      throw error;
    }
  }

  /**
   * LLM 요청 전송 (LM Studio - OpenAI 호환)
   */
  async sendLMStudioRequest(
    baseUrl: string,
    request: LLMRequest,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const url = joinApiHealthCheckUrl(baseUrl, OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH);
    let fullContent = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
          top_p: request.topP ?? 0.9,
          top_k: request.topK,
          stream: request.stream ?? true,
        }),
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.statusText}`);
      }

      if (request.stream) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter((line) => coerceTrimmedString(line, '') && line.startsWith('data: '));

            for (const line of lines) {
              try {
                const data = JSON.parse(line.slice(6)); // 'data: ' 제거
                const delta = data.choices?.[0]?.delta;
                if (delta?.content) {
                  fullContent += delta.content;
                  onChunk?.(delta.content);
                }
                if (data.choices?.[0]?.finish_reason) {
                  break;
                }
              } catch (e) {
                // JSON 파싱 실패 무시
              }
            }
          }
        }
      } else {
        const data = await response.json();
        fullContent = data.choices?.[0]?.message?.content || '';
      }

      return {
        content: fullContent,
        model: request.model,
        finishReason: 'stop',
      };
    } catch (error) {
      errorLogger.error('LM Studio 요청 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'sendLMStudioRequest',
        baseUrl,
        model: request.model,
      });
      throw error;
    }
  }

  /**
   * 프로젝트별 LLM으로 요청 전송
   */
  async sendProjectRequest(
    projectId: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse> {
    const config = this.getProjectLLM(projectId);
    if (!config) {
      throw new Error(`프로젝트 ${projectId}에 대한 LLM 설정이 없습니다.`);
    }

    const request: LLMRequest = {
      messages,
      model: config.model.id,
      temperature: config.settings.temperature,
      maxTokens: config.settings.maxTokens,
      topP: config.settings.topP,
      topK: config.settings.topK,
      stream: config.settings.stream,
    };

    if (config.provider.type === 'ollama') {
      return this.sendOllamaRequest(config.provider.baseUrl, request, onChunk);
    } else if (config.provider.type === 'lmstudio') {
      return this.sendLMStudioRequest(config.provider.baseUrl, request, onChunk);
    } else {
      throw new Error(`지원하지 않는 프로바이더 타입: ${config.provider.type}`);
    }
  }

  /**
   * 프로바이더 연결 테스트
   */
  async testProviderConnection(provider: LLMProvider): Promise<boolean> {
    try {
      if (provider.type === 'ollama') {
        const models = await this.getOllamaModels(provider.baseUrl);
        return models.length > 0;
      } else if (provider.type === 'lmstudio') {
        const models = await this.getLMStudioModels(provider.baseUrl);
        return models.length > 0;
      }
      return false;
    } catch (error) {
      errorLogger.error('프로바이더 연결 테스트 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'testProviderConnection',
        providerId: provider.id,
        providerType: provider.type,
      });
      return false;
    }
  }

  /**
   * 프로바이더 저장
   */
  private saveProviders(): void {
    try {
      const providersArray = Array.from(this.providers.values());
      localStorage.setItem(LOCAL_LLM_PROVIDERS_STORAGE_KEY, JSON.stringify(providersArray));
    } catch (error) {
      errorLogger.error('프로바이더 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'saveProviders',
      });
    }
  }

  /**
   * 프로바이더 로드
   */
  private loadProviders(): void {
    try {
      const saved = localStorage.getItem(LOCAL_LLM_PROVIDERS_STORAGE_KEY);
      if (saved) {
        const providersArray = JSON.parse(saved) as LLMProvider[];
        providersArray.forEach(provider => {
          this.providers.set(provider.id, provider);
        });
      }
    } catch (error) {
      errorLogger.error('프로바이더 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'loadProviders',
      });
    }
  }

  /**
   * 프로젝트 설정 저장
   */
  private saveProjectConfigs(): void {
    try {
      const configsArray = Array.from(this.projectConfigs.values());
      localStorage.setItem(PROJECT_LLM_CONFIGS_STORAGE_KEY, JSON.stringify(configsArray));
    } catch (error) {
      errorLogger.error('프로젝트 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'saveProjectConfigs',
      });
    }
  }

  /**
   * 프로젝트 설정 로드
   */
  private loadProjectConfigs(): void {
    try {
      const saved = localStorage.getItem(PROJECT_LLM_CONFIGS_STORAGE_KEY);
      if (saved) {
        const configsArray = JSON.parse(saved) as ProjectLLMConfig[];
        configsArray.forEach(config => {
          // Date 객체 복원
          config.createdAt = new Date(config.createdAt);
          config.updatedAt = new Date(config.updatedAt);
          this.projectConfigs.set(config.projectId, config);
        });
      }
    } catch (error) {
      errorLogger.error('프로젝트 설정 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'LocalLLMService',
        action: 'loadProjectConfigs',
      });
    }
  }
}

export {
  LOCAL_LLM_PROVIDERS_STORAGE_KEY,
  PROJECT_LLM_CONFIGS_STORAGE_KEY,
  USE_LOCAL_LLM_STORAGE_KEY,
} from './localLLMStorageKeys';

export const localLLMService = new LocalLLMService();

