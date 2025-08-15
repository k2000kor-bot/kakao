import { ChatSession } from '../types/chat';
import { Project } from '../types/project';

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  supported: boolean;
  costPerToken: number;
  maxTokens: number;
  description?: string;
  capabilities?: string[];
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
}

export interface AIConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoSpeak: boolean;
}

class ExternalAIService {
  private providers: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
      defaultModel: 'gpt-4',
      supported: true,
      costPerToken: 0.00003,
      maxTokens: 4096
    },
    {
      id: 'claude',
      name: 'Claude',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      defaultModel: 'claude-3-sonnet',
      supported: true,
      costPerToken: 0.000015,
      maxTokens: 4096
    },
    {
      id: 'gemini',
      name: 'Gemini',
      models: ['gemini-pro', 'gemini-pro-vision'],
      defaultModel: 'gemini-pro',
      supported: true,
      costPerToken: 0.00001,
      maxTokens: 4096
    },
    {
      id: 'local',
      name: 'Local AI',
      models: ['local-model'],
      defaultModel: 'local-model',
      supported: true,
      costPerToken: 0,
      maxTokens: 4096
    }
  ];

  private defaultConfig: AIConfig = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    autoSpeak: false
  };

  async getProviders(): Promise<AIProvider[]> {
    return this.providers.filter(p => p.supported);
  }

  getDefaultConfig(): AIConfig {
    return { ...this.defaultConfig };
  }

  // AI 응답 생성
  async generateResponse(
    message: string,
    session: ChatSession,
    project: Project | null,
    config: AIConfig = this.defaultConfig
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let response: AIResponse;

      switch (config.provider) {
        case 'openai':
          response = await this.callOpenAI(message, session, project, config);
          break;
        case 'claude':
          response = await this.callClaude(message, session, project, config);
          break;
        case 'gemini':
          response = await this.callGemini(message, session, project, config);
          break;
        case 'local':
          response = await this.callLocalAI(message, session, project, config);
          break;
        default:
          throw new Error(`지원하지 않는 AI 제공자: ${config.provider}`);
      }

      response.latency = Date.now() - startTime;
      return response;
    } catch (error) {
      console.error('AI 응답 생성 오류:', error);
      // 폴백으로 로컬 AI 사용
      return await this.callLocalAI(message, session, project, config);
    }
  }

  // OpenAI API 호출
  private async callOpenAI(
    message: string,
    session: ChatSession,
    project: Project | null,
    config: AIConfig
  ): Promise<AIResponse> {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const systemPrompt = this.buildSystemPrompt(session, project, config);
    const messages = this.buildMessages(message, session, systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const tokens = data.usage.total_tokens;

    return {
      content,
      provider: 'openai',
      model: config.model,
      tokens,
      cost: tokens * this.providers.find(p => p.id === 'openai')!.costPerToken,
      latency: 0
    };
  }

  // Claude API 호출
  private async callClaude(
    message: string,
    session: ChatSession,
    project: Project | null,
    config: AIConfig
  ): Promise<AIResponse> {
    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API 키가 설정되지 않았습니다.');
    }

    const systemPrompt = this.buildSystemPrompt(session, project, config);
    const messages = this.buildMessages(message, session, systemPrompt);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const tokens = data.usage.input_tokens + data.usage.output_tokens;

    return {
      content,
      provider: 'claude',
      model: config.model,
      tokens,
      cost: tokens * this.providers.find(p => p.id === 'claude')!.costPerToken,
      latency: 0
    };
  }

  // Gemini API 호출
  private async callGemini(
    message: string,
    session: ChatSession,
    project: Project | null,
    config: AIConfig
  ): Promise<AIResponse> {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const systemPrompt = this.buildSystemPrompt(session, project, config);
    const prompt = `${systemPrompt}\n\n사용자: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    const tokens = data.usageMetadata?.totalTokenCount || 0;

    return {
      content,
      provider: 'gemini',
      model: config.model,
      tokens,
      cost: tokens * this.providers.find(p => p.id === 'gemini')!.costPerToken,
      latency: 0
    };
  }

  // 로컬 AI (폴백)
  private async callLocalAI(
    message: string,
    session: ChatSession,
    project: Project | null,
    config: AIConfig
  ): Promise<AIResponse> {
    // 로컬 AI는 간단한 규칙 기반 응답 생성
    const systemPrompt = this.buildSystemPrompt(session, project, config);
    const response = this.generateLocalResponse(message, systemPrompt, project);

    return {
      content: response,
      provider: 'local',
      model: 'local-ai',
      tokens: message.length + response.length,
      cost: 0,
      latency: 0
    };
  }

  // 시스템 프롬프트 생성
  private buildSystemPrompt(session: ChatSession, project: Project | null, config: AIConfig): string {
    let prompt = `당신은 CORBU AI의 고급 AI 어시스턴트입니다. 사용자의 질문에 정확하고 도움이 되는 답변을 제공해주세요.

현재 대화 세션: ${session.title}
총 메시지 수: ${session.messages.length}개

`;

    if (project) {
      prompt += `프로젝트 정보:
- 프로젝트명: ${project.name}
- 설명: ${project.description}
- 상태: ${project.status}
- 우선순위: ${project.priority}

프로젝트 파일 수: ${project.files.length}개
프로젝트 지침 수: ${project.guidelines.length}개

이 정보를 바탕으로 프로젝트에 특화된 답변을 제공해주세요.
`;
    }

    prompt += `
답변 형식:
- 명확하고 구조화된 답변
- 필요시 마크다운 형식 사용
- 구체적인 예시나 단계별 설명 제공
- 사용자의 맥락을 고려한 개인화된 응답

언어: 한국어로 답변해주세요.`;

    return prompt;
  }

  // 메시지 배열 생성
  private buildMessages(message: string, session: ChatSession, systemPrompt: string): { role: string; content: string }[] {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // 최근 대화 히스토리 추가 (최대 10개)
    const recentMessages = session.messages.slice(-10);
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // 현재 메시지 추가
    messages.push({ role: 'user', content: message });

    return messages;
  }

  // 로컬 AI 응답 생성
  private generateLocalResponse(message: string, systemPrompt: string, project: Project | null): string {
    const keywords = message.toLowerCase();
    let response = '';

    if (keywords.includes('안녕') || keywords.includes('hello')) {
      response = '안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?';
    } else if (keywords.includes('프로젝트') && project) {
      response = `현재 "${project.name}" 프로젝트를 진행 중이시군요. 프로젝트 관련 질문이 있으시면 언제든 말씀해주세요.`;
    } else if (keywords.includes('도움') || keywords.includes('help')) {
      response = '다음과 같은 기능들을 사용할 수 있습니다:\n• 질문-답변\n• 프로젝트 관리\n• 파일 분석\n• 대화 요약\n\n무엇을 도와드릴까요?';
    } else if (keywords.includes('날씨')) {
      response = '죄송합니다. 현재 날씨 정보는 제공하지 않습니다. 다른 질문이 있으시면 말씀해주세요.';
    } else {
      response = `"${message}"에 대한 답변을 생성하려고 합니다. 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.`;
    }

    return response;
  }

  // AI 모델 성능 비교
  async compareModels(
    message: string,
    session: ChatSession,
    project: Project | null
  ): Promise<{ [key: string]: AIResponse }> {
    const providers = ['openai', 'claude', 'gemini', 'local'];
    const results: { [key: string]: AIResponse } = {};

    for (const provider of providers) {
      try {
        const config: AIConfig = {
          provider,
          model: this.getDefaultModel(provider),
          temperature: 0.7,
          maxTokens: 1000,
          autoSpeak: false
        };

        results[provider] = await this.generateResponse(message, session, project, config);
      } catch (error) {
        console.error(`${provider} 모델 호출 실패:`, error);
        results[provider] = {
          content: `오류: ${error}`,
          provider,
          model: 'error',
          tokens: 0,
          cost: 0,
          latency: 0
        };
      }
    }

    return results;
  }

  // 기본 모델 반환
  private getDefaultModel(provider: string): string {
    const models = {
      openai: 'gpt-4',
      claude: 'claude-3-sonnet-20240229',
      gemini: 'gemini-pro',
      local: 'local-ai'
    };
    return models[provider as keyof typeof models] || 'gpt-4';
  }

  // 비용 계산
  calculateCost(provider: string, tokens: number): number {
    const providerInfo = this.providers.find(p => p.id === provider);
    return providerInfo ? tokens * providerInfo.costPerToken : 0;
  }

  // 사용량 통계
  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    providerBreakdown: { [key: string]: { requests: number; tokens: number; cost: number } };
  }> {
    // 실제 구현에서는 데이터베이스에서 통계를 가져옴
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      providerBreakdown: {}
    };
  }
}

const externalAIService = new ExternalAIService();
export default externalAIService;
