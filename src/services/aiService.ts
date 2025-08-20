// AI 서비스 - 다양한 AI 모델과 상호작용
export type AIModel = 'gemini-pro' | 'gpt-4' | 'claude-3' | 'custom';

export interface AIResponse {
    content: string;
    model: AIModel;
    tokens: number;
    responseTime: number;
    confidence: number;
}

export interface AIRequest {
    message: string;
    model: AIModel;
    context?: string;
    files?: File[];
}

class AIService {
    private apiKeys: Map<AIModel, string> = new Map();
    private baseURLs: Map<AIModel, string> = new Map();

    constructor() {
        // 기본 설정
        this.baseURLs.set('gemini-pro', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent');
        this.baseURLs.set('gpt-4', 'https://api.openai.com/v1/chat/completions');
        this.baseURLs.set('claude-3', 'https://api.anthropic.com/v1/messages');
        this.baseURLs.set('custom', 'http://localhost:8000/api/generate');
    }

    // API 키 설정
    setAPIKey(model: AIModel, apiKey: string): void {
        this.apiKeys.set(model, apiKey);
    }

    // API 키 가져오기
    getAPIKey(model: AIModel): string | undefined {
        return this.apiKeys.get(model);
    }

    // 응답 생성 (기본)
    async generateResponse(message: string, model: AIModel = 'gemini-pro'): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            switch (model) {
                case 'gemini-pro':
                    return await this.generateGeminiResponse(message);
                case 'gpt-4':
                    return await this.generateGPT4Response(message);
                case 'claude-3':
                    return await this.generateClaudeResponse(message);
                case 'custom':
                    return await this.generateCustomResponse(message);
                default:
                    throw new Error(`지원하지 않는 모델: ${model}`);
            }
        } catch (error) {
            console.error(`AI 응답 생성 실패 (${model}):`, error);
            throw error;
        } finally {
            const responseTime = Date.now() - startTime;
            console.log(`${model} 응답 시간: ${responseTime}ms`);
        }
    }

    // 스트리밍 응답 생성
    async generateStreamingResponse(
        message: string,
        model: AIModel = 'gemini-pro',
        onChunk: (chunk: string) => void
    ): Promise<void> {
        try {
            switch (model) {
                case 'gemini-pro':
                    await this.generateGeminiStreamingResponse(message, onChunk);
                    break;
                case 'gpt-4':
                    await this.generateGPT4StreamingResponse(message, onChunk);
                    break;
                case 'claude-3':
                    await this.generateClaudeStreamingResponse(message, onChunk);
                    break;
                default:
                    throw new Error(`스트리밍을 지원하지 않는 모델: ${model}`);
            }
        } catch (error) {
            console.error(`스트리밍 응답 생성 실패 (${model}):`, error);
            throw error;
        }
    }

    // 멀티모달 응답 생성 (이미지 포함)
    async generateMultimodalResponse(
        message: string,
        images: File[],
        model: AIModel = 'gemini-pro'
    ): Promise<AIResponse> {
        if (model !== 'gemini-pro') {
            throw new Error('멀티모달은 현재 Gemini Pro만 지원합니다.');
        }

        const startTime = Date.now();

        try {
            const apiKey = this.getAPIKey(model);
            if (!apiKey) {
                throw new Error('API 키가 설정되지 않았습니다.');
            }

            const base64Images = await Promise.all(
                images.map(async (file) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
                    return {
                        mimeType: file.type,
                        data: base64
                    };
                })
            );

            const response = await fetch(`${this.baseURLs.get(model)}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: message },
                            ...base64Images.map(img => ({
                                inlineData: {
                                    mimeType: img.mimeType,
                                    data: img.data
                                }
                            }))
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            const content = data.candidates[0].content.parts[0].text;
            const responseTime = Date.now() - startTime;

            return {
                content,
                model,
                tokens: data.usage?.totalTokens || 0,
                responseTime,
                confidence: 0.9
            };
        } catch (error) {
            console.error('멀티모달 응답 생성 실패:', error);
            throw error;
        }
    }

    // Gemini Pro 응답 생성
    private async generateGeminiResponse(message: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('gemini-pro');
        if (!apiKey) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(`${this.baseURLs.get('gemini-pro')}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;

        return {
            content,
            model: 'gemini-pro',
            tokens: data.usage?.totalTokens || 0,
            responseTime: Date.now(),
            confidence: 0.9
        };
    }

    // GPT-4 응답 생성
    private async generateGPT4Response(message: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('gpt-4');
        if (!apiKey) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(this.baseURLs.get('gpt-4')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: message }],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        return {
            content,
            model: 'gpt-4',
            tokens: data.usage?.total_tokens || 0,
            responseTime: Date.now(),
            confidence: 0.9
        };
    }

    // Claude 응답 생성
    private async generateClaudeResponse(message: string): Promise<AIResponse> {
        const apiKey = this.getAPIKey('claude-3');
        if (!apiKey) {
            throw new Error('Claude API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(this.baseURLs.get('claude-3')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0].text;

        return {
            content,
            model: 'claude-3',
            tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
            responseTime: Date.now(),
            confidence: 0.9
        };
    }

    // 커스텀 모델 응답 생성
    private async generateCustomResponse(message: string): Promise<AIResponse> {
        const response = await fetch(this.baseURLs.get('custom')!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                model: 'custom'
            })
        });

        if (!response.ok) {
            throw new Error(`커스텀 API 요청 실패: ${response.status}`);
        }

        const data = await response.json();

        return {
            content: data.content,
            model: 'custom',
            tokens: data.tokens || 0,
            responseTime: Date.now(),
            confidence: data.confidence || 0.8
        };
    }

    // 스트리밍 응답 메서드들 (기본 구현)
    private async generateGeminiStreamingResponse(message: string, onChunk: (chunk: string) => void): Promise<void> {
        // 실제 구현에서는 Server-Sent Events나 WebSocket 사용
        const response = await this.generateGeminiResponse(message);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private async generateGPT4StreamingResponse(message: string, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.generateGPT4Response(message);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private async generateClaudeStreamingResponse(message: string, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.generateClaudeResponse(message);
        const words = response.content.split(' ');

        for (const word of words) {
            onChunk(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 모델 정보 가져오기
    getModelInfo(model: AIModel): { name: string; description: string; capabilities: string[] } {
        const modelInfo = {
            'gemini-pro': {
                name: 'Gemini Pro',
                description: 'Google의 최신 대화형 AI 모델',
                capabilities: ['텍스트 생성', '코드 작성', '멀티모달', '실시간 대화']
            },
            'gpt-4': {
                name: 'GPT-4',
                description: 'OpenAI의 고급 언어 모델',
                capabilities: ['복잡한 추론', '창의적 글쓰기', '코드 분석', '문제 해결']
            },
            'claude-3': {
                name: 'Claude 3',
                description: 'Anthropic의 안전하고 유용한 AI 모델',
                capabilities: ['안전한 대화', '정확한 정보', '윤리적 응답', '긴 텍스트 처리']
            },
            'custom': {
                name: 'Custom Model',
                description: '사용자 정의 AI 모델',
                capabilities: ['맞춤형 응답', '도메인 특화', '특별한 기능']
            }
        };

        return modelInfo[model];
    }

    // 모델 성능 테스트
    async testModelPerformance(model: AIModel, testMessage: string = '안녕하세요'): Promise<{
        responseTime: number;
        tokenCount: number;
        success: boolean;
        error?: string;
    }> {
        const startTime = Date.now();

        try {
            const response = await this.generateResponse(testMessage, model);
            const responseTime = Date.now() - startTime;

            return {
                responseTime,
                tokenCount: response.tokens,
                success: true
            };
        } catch (error) {
            return {
                responseTime: Date.now() - startTime,
                tokenCount: 0,
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }
}

export const aiService = new AIService();
export default aiService;
