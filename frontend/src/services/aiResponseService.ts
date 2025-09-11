import { Message, AIResponseConfig, ChatContext } from '../types/chat';

export interface AIResponseRequest {
  message: string;
  context: ChatContext;
  config: AIResponseConfig;
}

export interface AIResponseResult {
  success: boolean;
  message: Message;
  error?: string;
}

class AIResponseService {
  private baseUrl = 'http://localhost:8002/api/v7';

  async generateResponse(request: AIResponseRequest): Promise<AIResponseResult> {
    try {
      const response = await fetch(`${this.baseUrl}/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('AI 응답 생성 실패:', error);
      return {
        success: false,
        message: this.createFallbackMessage(request),
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  private createFallbackMessage(request: AIResponseRequest): Message {
    const timestamp = new Date().toISOString();
    const id = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 기본 대화형 응답 생성
    return {
      id,
      content: `죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 다시 시도해주세요.\n\n요청: ${request.message}`,
      sender: 'CORBU.AI',
      timestamp,
      isMe: false,
      type: 'ai_response',
      aiResponse: {
        type: 'conversation',
        metadata: {
          confidence: 0,
          processingTime: 0,
          model: 'fallback',
          tokens: 0,
        },
      },
      conversation: {
        style: 'friendly',
        tone: 'empathetic',
        language: 'korean',
      },
    };
  }

  async generateConversationResponse(message: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message,
      context,
      config: {
        responseType: 'conversation',
        style: 'friendly',
        format: 'text',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateSummaryResponse(content: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 내용을 요약해주세요: ${content}`,
      context,
      config: {
        responseType: 'summary',
        format: 'text',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateAnalysisResponse(content: string, analysisType: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 내용을 ${analysisType} 분석해주세요: ${content}`,
      context,
      config: {
        responseType: 'analysis',
        format: 'text',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateFormResponse(formConfig: any, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 폼을 생성해주세요: ${JSON.stringify(formConfig)}`,
      context,
      config: {
        responseType: 'form',
        format: 'json',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateChartResponse(data: any, chartType: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 데이터로 ${chartType} 차트를 생성해주세요: ${JSON.stringify(data)}`,
      context,
      config: {
        responseType: 'chart',
        format: 'json',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateTableResponse(data: any, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 데이터를 테이블로 표시해주세요: ${JSON.stringify(data)}`,
      context,
      config: {
        responseType: 'table',
        format: 'json',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateListResponse(items: string[], listType: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 항목들을 ${listType} 형태로 정리해주세요: ${items.join(', ')}`,
      context,
      config: {
        responseType: 'list',
        format: 'text',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateCodeResponse(code: string, language: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 ${language} 코드를 생성해주세요: ${code}`,
      context,
      config: {
        responseType: 'code',
        format: 'text',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  async generateImageResponse(prompt: string, style: string, context: ChatContext): Promise<Message> {
    const request: AIResponseRequest = {
      message: `다음 프롬프트로 ${style} 스타일의 이미지를 생성해주세요: ${prompt}`,
      context,
      config: {
        responseType: 'image',
        format: 'json',
        language: 'korean',
      },
    };

    const result = await this.generateResponse(request);
    return result.message;
  }

  // 빠른 응답 생성 (오프라인 모드)
  createQuickResponse(userMessage: string, responseType: string): Message {
    const timestamp = new Date().toISOString();
    const id = `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const responses = {
      conversation: {
        content: `네, ${userMessage}에 대해 답변드리겠습니다.`,
        style: 'friendly',
        tone: 'positive',
      },
      summary: {
        content: `요약: ${userMessage}`,
        type: 'brief',
        keyPoints: ['주요 포인트 1', '주요 포인트 2'],
      },
      analysis: {
        content: `분석 결과: ${userMessage}`,
        type: 'sentiment',
        insights: ['인사이트 1', '인사이트 2'],
      },
      form: {
        content: '폼이 생성되었습니다.',
        type: 'input',
        fields: [
          { id: 'name', label: '이름', type: 'text', required: true },
          { id: 'email', label: '이메일', type: 'email', required: true },
        ],
      },
      chart: {
        content: '차트가 생성되었습니다.',
        type: 'bar',
        data: [
          { label: '항목 1', value: 10 },
          { label: '항목 2', value: 20 },
        ],
      },
      table: {
        content: '테이블이 생성되었습니다.',
        headers: ['제목 1', '제목 2', '제목 3'],
        rows: [
          ['데이터 1', '데이터 2', '데이터 3'],
          ['데이터 4', '데이터 5', '데이터 6'],
        ],
      },
      list: {
        content: '목록이 생성되었습니다.',
        type: 'unordered',
        items: ['항목 1', '항목 2', '항목 3'],
      },
      code: {
        content: '코드가 생성되었습니다.',
        language: 'javascript',
        code: 'console.log("Hello, World!");',
      },
      image: {
        content: '이미지가 생성되었습니다.',
        url: 'https://via.placeholder.com/400x300',
        prompt: userMessage,
        style: 'realistic',
      },
    };

    const response = responses[responseType as keyof typeof responses] || responses.conversation;

    const { content, ...responseData } = response;
    // responseData에서 type 속성 제거
    const { type, ...cleanResponseData } = responseData as any;

    const message: Message = {
      id,
      content: content || '응답이 생성되었습니다.',
      sender: 'CORBU.AI',
      timestamp,
      isMe: false,
      // type 필드 제거 - UI에서 불필요하므로 제외
      aiResponse: {
        type: responseType as any,
        metadata: {
          confidence: 85,
          processingTime: 100,
          model: 'quick-response',
          tokens: 50,
        },
      },
      ...cleanResponseData,
    };

    return message;
  }
}

export const aiResponseService = new AIResponseService();
export default aiResponseService; 