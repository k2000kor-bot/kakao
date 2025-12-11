import { Message, AIResponse, AISystem } from '../types/chat';

interface IntegratedMessageRequest {
  content: string;
  context?: string;
  systemType?: 'analysis' | 'guidance' | 'conversation' | 'project' | 'file';
  userPreferences?: {
    tone: 'formal' | 'casual' | 'professional';
    style: 'informative' | 'persuasive' | 'empathetic' | 'analytical';
    length: 'short' | 'medium' | 'long';
  };
  projectId?: string;
  knowledgeBaseId?: string;
}

interface IntegratedMessageResponse {
  id: string;
  content: string;
  type: 'text' | 'analysis' | 'chart' | 'code' | 'image' | 'system';
  confidence: number;
  processingTime: number;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
    data?: any;
    usedSystems?: string[];
    learningScore?: number;
  };
}

export class IntegratedMessageService {
  private baseURL = 'http://localhost:8003';
  private systems: AISystem[] = [];

  constructor() {
    this.initializeSystems();
  }

  private initializeSystems() {
    this.systems = [
      {
        id: 'conversation',
        name: '대화형 AI',
        description: '자연스러운 대화형 인터페이스',
        isActive: true,
        capabilities: ['대화', '질의응답', '컨텍스트 이해'],
        performance: { accuracy: 0.95, speed: 0.9, reliability: 0.95 }
      },
      {
        id: 'analysis',
        name: '분석 엔진',
        description: '고급 데이터 분석 및 인사이트 제공',
        isActive: true,
        capabilities: ['감정 분석', '의도 분석', '주제 추출', '복잡도 평가'],
        performance: { accuracy: 0.92, speed: 0.85, reliability: 0.9 }
      },
      {
        id: 'guidance',
        name: '메시지 가이드',
        description: '상황별 메시지 생성 및 가이드',
        isActive: true,
        capabilities: ['톤 설정', '길이 조절', '구조 가이드', '예시 제공'],
        performance: { accuracy: 0.88, speed: 0.8, reliability: 0.85 }
      },
      {
        id: 'project',
        name: '프로젝트 관리',
        description: '프로젝트 정보 및 진행 상황 관리',
        isActive: true,
        capabilities: ['진행 상황', '팀 구성', '관련 파일', '지침 정보'],
        performance: { accuracy: 0.9, speed: 0.9, reliability: 0.9 }
      },
      {
        id: 'file',
        name: '파일 관리',
        description: '파일 업로드, 분석 및 관리',
        isActive: true,
        capabilities: ['파일 분석', 'OCR', '문서 요약', '미디어 처리'],
        performance: { accuracy: 0.85, speed: 0.75, reliability: 0.8 }
      }
    ];
  }

  async sendMessage(request: IntegratedMessageRequest): Promise<IntegratedMessageResponse> {
    const startTime = Date.now();

    try {
      // 시스템 타입에 따른 라우팅
      const systemType = this.determineSystemType(request.content);
      const endpoint = this.getEndpointForSystem(systemType);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          systemType,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        id: `msg_${Date.now()}`,
        content: data.response || data.content || data.message,
        type: data.type || 'text',
        confidence: data.confidence || 0.8,
        processingTime,
        metadata: {
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          data: data.data || {},
          usedSystems: [systemType],
          learningScore: data.learningScore || 0.7
        }
      };
    } catch (error) {
      console.error('메시지 전송 실패:', error);

      // 폴백 응답
      return {
        id: `msg_${Date.now()}`,
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'text',
        confidence: 0.5,
        processingTime: Date.now() - startTime,
        metadata: {
          suggestions: ['다시 시도해보세요', '다른 표현으로 질문해보세요'],
          actions: ['retry'],
          usedSystems: ['fallback']
        }
      };
    }
  }

  private determineSystemType(content: string): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('분석') || lowerContent.includes('analyze') || lowerContent.includes('분석해')) {
      return 'analysis';
    }

    if (lowerContent.includes('가이드') || lowerContent.includes('guidance') || lowerContent.includes('메시지')) {
      return 'guidance';
    }

    if (lowerContent.includes('프로젝트') || lowerContent.includes('project') || lowerContent.includes('개포우성')) {
      return 'project';
    }

    if (lowerContent.includes('파일') || lowerContent.includes('file') || lowerContent.includes('업로드')) {
      return 'file';
    }

    return 'conversation';
  }

  private getEndpointForSystem(systemType: string): string {
    switch (systemType) {
      case 'analysis':
        return '/api/analyze';
      case 'guidance':
        return '/api/guidance';
      case 'project':
        return '/api/project';
      case 'file':
        return '/api/file';
      default:
        return '/api/chat';
    }
  }

  async getSystemStatus(): Promise<AISystem[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/systems/status`);
      if (response.ok) {
        const data = await response.json();
        return data.systems || this.systems;
      }
    } catch (error) {
      console.error('시스템 상태 조회 실패:', error);
    }
    return this.systems;
  }

  async uploadFile(file: File): Promise<{ success: boolean; fileId?: string; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, fileId: data.fileId };
      } else {
        return { success: false, error: '파일 업로드 실패' };
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류' };
    }
  }

  async getProjectInfo(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/project/${projectId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('프로젝트 정보 조회 실패:', error);
    }
    return null;
  }

  async getFileList(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/files`);
      if (response.ok) {
        const data = await response.json();
        return data.files || [];
      }
    } catch (error) {
      console.error('파일 목록 조회 실패:', error);
    }
    return [];
  }

  async generateGuidance(context: string, preferences: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/guidance/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, preferences }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('가이드 생성 실패:', error);
    }
    return null;
  }

  // 실시간 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });
      return response.ok;
    } catch (error) {
      console.log('백엔드 연결 실패:', error);
      return false;
    }
  }

  // 학습 데이터 업데이트
  async updateLearningData(messageId: string, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/learning/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, feedback }),
      });
    } catch (error) {
      console.error('학습 데이터 업데이트 실패:', error);
    }
  }
}

export const integratedMessageService = new IntegratedMessageService();
export default integratedMessageService; 