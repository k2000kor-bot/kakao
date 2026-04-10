// OpenAI GPT integration service (supports GPT-5 if available)

import { joinApiBaseAndPath, OPENAI_OFFICIAL_API_V1_BASE_URL } from '../config/api';
// Env vars (CRA-compatible):
// - REACT_APP_OPENAI_API_KEY: required to enable OpenAI provider
// - REACT_APP_OPENAI_BASE_URL: optional, defaults to OPENAI_OFFICIAL_API_V1_BASE_URL
// - REACT_APP_OPENAI_MODEL: optional, defaults to 'gpt-5' then falls back to 'gpt-4o'

export type OpenAIChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export interface OpenAIChatOptions {
    model?: string;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    systemPrompt?: string;
}

const getEnv = (key: string): string | undefined => {
    // In CRA/Vite environments, process.env access works at build-time.
    // Fallback to window for runtime-injected vars if present.
    const w: Record<string, string | undefined> =
        typeof window !== 'undefined'
            ? (window as unknown as Record<string, string | undefined>)
            : {};
    return (process.env as unknown as Record<string, string | undefined>)[key] ?? w[key];
};

const defaultModelCandidates = ['gpt-5', 'gpt-5-mini', 'gpt-4o'];

export class OpenAIService {
    static isConfigured(): boolean {
        return Boolean(getEnv('REACT_APP_OPENAI_API_KEY'));
    }

    private static baseUrl(): string {
        return (
            getEnv('REACT_APP_OPENAI_BASE_URL')?.replace(/\/$/, '') ||
            OPENAI_OFFICIAL_API_V1_BASE_URL
        );
    }

    private static authHeader(): Record<string, string> {
        const apiKey = getEnv('REACT_APP_OPENAI_API_KEY');
        if (!apiKey) throw new Error('OpenAI API key is not configured');
        return { Authorization: `Bearer ${apiKey}` };
    }

    private static resolveModel(explicit?: string): string {
        if (explicit) return explicit;
        const fromEnv = getEnv('REACT_APP_OPENAI_MODEL');
        if (fromEnv) return fromEnv;
        return defaultModelCandidates[0];
    }

    static async chat(
        messages: OpenAIChatMessage[],
        options: OpenAIChatOptions = {}
    ): Promise<{ content: string; model: string }> {
        const model = this.resolveModel(options.model);
        const temperature = options.temperature ?? 0.6;
        const body = {
            model,
            temperature,
            messages: options.systemPrompt
                ? [{ role: 'system', content: options.systemPrompt }, ...messages]
                : messages,
            max_tokens: options.max_tokens,
            top_p: options.top_p,
        } as Record<string, unknown>;

        // Prefer Chat Completions; if unavailable, try Responses API
        const endpoints = [
            joinApiBaseAndPath(this.baseUrl(), 'chat/completions'),
            joinApiBaseAndPath(this.baseUrl(), 'responses'),
        ];

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.authHeader(),
                    },
                    body: JSON.stringify(
                        endpoint.endsWith('/chat/completions')
                            ? body
                            : {
                                model,
                                input: messages
                                    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
                                    .join('\n\n'),
                                temperature,
                            }
                    ),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`${res.status} ${res.statusText} - ${text}`);
                }

                const json = await res.json();
                // Normalize response
                if (json.choices && json.choices[0]?.message?.content) {
                    return { content: json.choices[0].message.content as string, model };
                }
                if (json.output && typeof json.output[0]?.content?.[0]?.text === 'string') {
                    return { content: json.output[0].content[0].text as string, model };
                }
                if (json.output_text) {
                    return { content: json.output_text as string, model };
                }
                // Fallback stringification
                return { content: JSON.stringify(json), model };
            } catch (err) {
                // Try next endpoint
                continue;
            }
        }
        throw new Error('OpenAI API: all endpoints failed');
    }
}

export const openAIService = OpenAIService;


