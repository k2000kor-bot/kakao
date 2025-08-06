import { APIResponse, ChatMessage, ChatRoom, AISystem } from './api';

// 모킹 데이터
const mockChatRooms: ChatRoom[] = [
  {
    id: 'general',
    name: '일반 채팅',
    type: 'general',
    unreadCount: 0,
    lastMessage: '안녕하세요! CORBU AI입니다.',
    lastMessageTime: new Date().toISOString()
  },
  {
    id: 'project',
    name: '프로젝트 관리',
    type: 'project',
    unreadCount: 2,
    lastMessage: '프로젝트 상태를 확인해보세요.',
    lastMessageTime: new Date().toISOString()
  },
  {
    id: 'analysis',
    name: 'AI 분석',
    type: 'analysis',
    unreadCount: 0,
    lastMessage: '분석 결과가 준비되었습니다.',
    lastMessageTime: new Date().toISOString()
  },
  {
    id: 'system',
    name: '시스템 모니터링',
    type: 'system',
    unreadCount: 1,
    lastMessage: '시스템 상태가 정상입니다.',
    lastMessageTime: new Date().toISOString()
  }
];

const mockMessages: { [roomId: string]: ChatMessage[] } = {
  general: [
    {
      id: '1',
      content: '안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ],
  project: [
    {
      id: '1',
      content: '프로젝트 관리 채팅방입니다. 프로젝트 상태를 확인해보세요.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ],
  analysis: [
    {
      id: '1',
      content: 'AI 분석 채팅방입니다. 분석 결과가 준비되었습니다.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ],
  system: [
    {
      id: '1',
      content: '시스템 모니터링 채팅방입니다. 시스템 상태가 정상입니다.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]
};

const mockAISystems: AISystem[] = [
  {
    id: 'conversational',
    name: '대화형 AI',
    description: '자연스러운 대화를 위한 AI 시스템',
    isActive: true,
    capabilities: ['자연어 처리', '맥락 이해', '감정 분석'],
    performance: { accuracy: 95, speed: 1000, reliability: 98 }
  },
  {
    id: 'analytical',
    name: '분석 AI',
    description: '데이터 분석 및 인사이트 생성',
    isActive: true,
    capabilities: ['데이터 분석', '패턴 인식', '예측 모델링'],
    performance: { accuracy: 92, speed: 2000, reliability: 95 }
  },
  {
    id: 'creative',
    name: '창작 AI',
    description: '콘텐츠 생성 및 창작 지원',
    isActive: false,
    capabilities: ['텍스트 생성', '이미지 생성', '코드 생성'],
    performance: { accuracy: 88, speed: 3000, reliability: 90 }
  },
  {
    id: 'predictive',
    name: '예측 AI',
    description: '미래 예측 및 트렌드 분석',
    isActive: false,
    capabilities: ['시계열 분석', '트렌드 예측', '리스크 평가'],
    performance: { accuracy: 85, speed: 5000, reliability: 87 }
  }
];

// 지연 시뮬레이션
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 모킹 API 클라이언트
export const mockAPIClient = {
  // 채팅방 목록 조회
  async getChatRooms(): Promise<APIResponse<ChatRoom[]>> {
    await delay(500);
    return {
      success: true,
      data: mockChatRooms
    };
  },

  // 채팅방 메시지 조회
  async getMessages(roomId: string): Promise<APIResponse<ChatMessage[]>> {
    await delay(300);
    const messages = mockMessages[roomId] || [];
    return {
      success: true,
      data: messages
    };
  },

  // 메시지 전송
  async sendMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<APIResponse<ChatMessage>> {
    await delay(200);
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    if (!mockMessages[roomId]) {
      mockMessages[roomId] = [];
    }
    mockMessages[roomId].push(newMessage);

    return {
      success: true,
      data: newMessage
    };
  },

  // AI 응답 생성
  async generateAIResponse(message: string, systemId?: string): Promise<APIResponse<ChatMessage>> {
    await delay(1000 + Math.random() * 2000);
    
    const system = mockAISystems.find(s => s.id === systemId) || mockAISystems[0];
    const aiResponse: ChatMessage = {
      id: Date.now().toString(),
      content: `${system.name}의 응답: "${message}"에 대한 분석 결과입니다. CORBU AI가 도움을 드리겠습니다.`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text',
      metadata: {
        confidence: system.performance.accuracy / 100,
        processingTime: system.performance.speed,
        suggestions: ['더 자세한 정보를 원하시나요?', '다른 질문이 있으시면 말씀해 주세요.'],
        actions: ['결과 저장', '차트 생성', '보고서 생성']
      }
    };

    return {
      success: true,
      data: aiResponse
    };
  },

  // 채팅방 생성
  async createChatRoom(roomData: Omit<ChatRoom, 'id' | 'unreadCount' | 'lastMessageTime'>): Promise<APIResponse<ChatRoom>> {
    await delay(400);
    const newRoom: ChatRoom = {
      ...roomData,
      id: `room_${Date.now()}`,
      unreadCount: 0,
      lastMessageTime: new Date().toISOString()
    };

    mockChatRooms.push(newRoom);
    mockMessages[newRoom.id] = [];

    return {
      success: true,
      data: newRoom
    };
  },

  // AI 시스템 목록 조회
  async getAISystems(): Promise<APIResponse<AISystem[]>> {
    await delay(300);
    return {
      success: true,
      data: mockAISystems
    };
  },

  // AI 시스템 상태 변경
  async toggleAISystem(systemId: string, isActive: boolean): Promise<APIResponse<AISystem>> {
    await delay(200);
    const system = mockAISystems.find(s => s.id === systemId);
    if (!system) {
      return {
        success: false,
        error: 'AI 시스템을 찾을 수 없습니다.'
      };
    }

    system.isActive = isActive;
    return {
      success: true,
      data: system
    };
  },

  // AI 시스템 성능 조회
  async getSystemPerformance(systemId: string): Promise<APIResponse<any>> {
    await delay(200);
    const system = mockAISystems.find(s => s.id === systemId);
    if (!system) {
      return {
        success: false,
        error: 'AI 시스템을 찾을 수 없습니다.'
      };
    }

    return {
      success: true,
      data: {
        accuracy: system.performance.accuracy,
        speed: system.performance.speed,
        reliability: system.performance.reliability,
        status: system.isActive ? '활성' : '비활성'
      }
    };
  },

  // AI 응답 테스트
  async testAIResponse(systemId: string, input: string): Promise<APIResponse<any>> {
    await delay(800 + Math.random() * 1200);
    const system = mockAISystems.find(s => s.id === systemId);
    if (!system) {
      return {
        success: false,
        error: 'AI 시스템을 찾을 수 없습니다.'
      };
    }

    return {
      success: true,
      data: {
        systemId,
        input,
        response: `${system.name}의 테스트 응답: "${input}"에 대한 분석 결과입니다.`,
        confidence: system.performance.accuracy / 100,
        processingTime: system.performance.speed
      }
    };
  }
};

// 모킹 WebSocket 클라이언트
export class MockWebSocketClient {
  private isConnected = false;
  private messageHandlers: ((data: any) => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    this.isConnected = true;
    this.messageHandlers.push(onMessage);
    if (onError) {
      this.errorHandlers.push(onError);
    }

    // 모킹 실시간 메시지 시뮬레이션
    setTimeout(() => {
      this.emitMessage({
        type: 'connection',
        message: 'WebSocket 연결됨'
      });
    }, 100);
  }

  private emitMessage(data: any) {
    if (this.isConnected) {
      this.messageHandlers.forEach(handler => handler(data));
    }
  }

  send(data: any) {
    if (this.isConnected) {
      console.log('Mock WebSocket 전송:', data);
      // 에코 응답 시뮬레이션
      setTimeout(() => {
        this.emitMessage({
          type: 'echo',
          data: data
        });
      }, 100);
    }
  }

  disconnect() {
    this.isConnected = false;
    this.messageHandlers = [];
    this.errorHandlers = [];
  }
} 