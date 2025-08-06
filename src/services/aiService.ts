// AI 서비스 연동 API
import { API_BASE_URL } from './api';

export interface AIRequest {
  message: string;
  context?: {
    files?: Array<{
      name: string;
      content: string;
      type: string;
    }>;
    guidelines?: Array<{
      title: string;
      content: string;
      priority: string;
    }>;
    projectInfo?: {
      name: string;
      description: string;
    };
  };
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AIResponse {
  success: boolean;
  message: string;
  analysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    entities: string[];
    summary: string;
  };
  suggestions?: string[];
  error?: string;
}

export interface FileAnalysisRequest {
  file: File;
  analysisType: 'text' | 'summary' | 'keywords' | 'sentiment' | 'full';
}

export interface FileAnalysisResponse {
  success: boolean;
  fileName: string;
  fileType: string;
  analysis: {
    extractedText?: string;
    summary?: string;
    keyInsights: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics: string[];
    entities: string[];
    confidence: number;
  };
  error?: string;
}

class AIService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // AI 응답 생성
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      // 실제 AI 서비스 연동 시 여기에 실제 API 호출
      // 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response: AIResponse = {
        success: true,
        message: this.generateMockResponse(request.message),
        analysis: {
          sentiment: 'positive',
          topics: ['AI', '프로젝트 관리', '파일 분석'],
          entities: ['사용자', 'AI 시스템'],
          summary: '사용자 질문에 대한 AI 응답이 생성되었습니다.'
        },
        suggestions: [
          '파일을 업로드하여 더 정확한 분석을 받아보세요',
          '지침을 추가하여 AI 응답을 개선하세요',
          '새로운 대화를 시작하여 다른 주제로 논의하세요'
        ]
      };

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'AI 응답 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 파일 분석
  async analyzeFile(request: FileAnalysisRequest): Promise<FileAnalysisResponse> {
    try {
      // 실제 파일 분석 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));

      const analysis: FileAnalysisResponse = {
        success: true,
        fileName: request.file.name,
        fileType: request.file.type,
        analysis: {
          extractedText: `파일 "${request.file.name}"에서 추출된 텍스트 내용입니다.`,
          summary: `${request.file.name} 파일 분석이 완료되었습니다.`,
          keyInsights: [
            `문서 유형: ${this.getFileType(request.file.type)}`,
            `파일 크기: ${(request.file.size / 1024).toFixed(1)}KB`,
            `업로드 시간: ${new Date().toLocaleTimeString()}`,
            'AI 분석 완료'
          ],
          sentiment: 'positive',
          topics: ['문서 분석', '파일 처리', 'AI 학습'],
          entities: ['파일 시스템', 'AI 엔진', '사용자'],
          confidence: 0.95
        }
      };

      return analysis;
    } catch (error) {
      return {
        success: false,
        fileName: request.file.name,
        fileType: request.file.type,
        analysis: {
          keyInsights: [],
          topics: [],
          entities: [],
          confidence: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 파일 타입 판별
  private getFileType(type: string): string {
    if (type.includes('pdf')) return 'PDF 문서';
    if (type.includes('doc')) return 'Word 문서';
    if (type.includes('xls')) return 'Excel 문서';
    if (type.includes('ppt')) return 'PowerPoint 문서';
    if (type.includes('image')) return '이미지 파일';
    if (type.includes('text')) return '텍스트 파일';
    return '일반 문서';
  }

  // 모의 응답 생성
  private generateMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('안녕') || lowerMessage.includes('hello')) {
      return '안녕하세요! AI 어시스턴트입니다. 무엇을 도와드릴까요?';
    }

    if (lowerMessage.includes('파일') || lowerMessage.includes('업로드')) {
      return '파일 업로드 기능을 사용하시려면 드래그 앤 드롭하거나 첨부 버튼을 클릭하세요.';
    }

    if (lowerMessage.includes('지침') || lowerMessage.includes('가이드')) {
      return '지침 관리 기능을 사용하여 프로젝트에 맞는 가이드라인을 설정할 수 있습니다.';
    }

    if (lowerMessage.includes('분석') || lowerMessage.includes('ai')) {
      return 'AI 분석 기능을 통해 파일 내용을 분석하고 인사이트를 제공합니다.';
    }

    return `"${message}"에 대한 답변을 생성했습니다. 더 구체적인 질문이나 다른 기능을 사용하고 싶으시면 말씀해주세요!`;
  }

  // AI 시스템 상태 확인
  async checkAIStatus(): Promise<{ status: string; version: string; uptime: number }> {
    try {
      const response = await this.request<{ status: string; version: string; uptime: number }>('/ai/status');
      return response;
    } catch (error) {
      // 모의 응답
      return {
        status: 'online',
        version: 'v2.1.4',
        uptime: 86400 // 24시간
      };
    }
  }
}

// 싱글톤 인스턴스
const aiService = new AIService();

export default aiService; 