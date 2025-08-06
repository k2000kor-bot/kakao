// API 기본 설정
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true' || !process.env.REACT_APP_API_URL;

// API 응답 타입 정의
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string;
  type: 'text' | 'chart' | 'stats' | 'summary' | 'analysis' | 'system' | 'command' | 'error' | 'success';
  metadata?: {
    confidence?: number;
    processingTime?: number;
    suggestions?: string[];
    actions?: string[];
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'project' | 'analysis' | 'system';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface AISystem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  capabilities: string[];
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

export interface Message {
  // 필요한 필드 정의 (예시)
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

export interface AIResponse {
  // 필요한 필드 정의 (예시)
  result: string;
  confidence?: number;
}

// HTTP 클라이언트 설정
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST 요청
  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스
const apiClient = new APIClient(API_BASE_URL);

// 모킹 API 클라이언트 (개발 환경에서 사용)
let mockAPIClient: any = null;
if (USE_MOCK_API) {
  import('./mockAPI').then(module => {
    mockAPIClient = module.mockAPIClient;
  });
}

// 채팅 관련 API
export const chatAPI = {
  // 채팅방 목록 조회
  async getChatRooms(): Promise<APIResponse<ChatRoom[]>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.getChatRooms();
    }
    return apiClient.get<ChatRoom[]>('/chat/rooms');
  },

  // 채팅방 메시지 조회
  async getMessages(roomId: string): Promise<APIResponse<ChatMessage[]>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.getMessages(roomId);
    }
    return apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
  },

  // 메시지 전송
  async sendMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<APIResponse<ChatMessage>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.sendMessage(roomId, message);
    }
    return apiClient.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, message);
  },

  // AI 응답 생성
  async generateAIResponse(message: string, systemId?: string): Promise<APIResponse<ChatMessage>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.generateAIResponse(message, systemId);
    }
    return apiClient.post<ChatMessage>('/ai/generate', {
      message,
      systemId,
    });
  },

  // 채팅방 생성
  async createChatRoom(roomData: Omit<ChatRoom, 'id' | 'unreadCount' | 'lastMessageTime'>): Promise<APIResponse<ChatRoom>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.createChatRoom(roomData);
    }
    return apiClient.post<ChatRoom>('/chat/rooms', roomData);
  },

  // 채팅방 삭제
  async deleteChatRoom(roomId: string): Promise<APIResponse<void>> {
    if (USE_MOCK_API && mockAPIClient) {
      return { success: true, data: undefined };
    }
    return apiClient.delete<void>(`/chat/rooms/${roomId}`);
  },
};

// AI 시스템 관련 API
export const aiAPI = {
  // AI 시스템 목록 조회
  async getAISystems(): Promise<APIResponse<AISystem[]>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.getAISystems();
    }
    return apiClient.get<AISystem[]>('/ai/systems');
  },

  // AI 시스템 상태 변경
  async toggleAISystem(systemId: string, isActive: boolean): Promise<APIResponse<AISystem>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.toggleAISystem(systemId, isActive);
    }
    return apiClient.put<AISystem>(`/ai/systems/${systemId}`, { isActive });
  },

  // AI 시스템 성능 모니터링
  async getSystemPerformance(systemId: string): Promise<APIResponse<any>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.getSystemPerformance(systemId);
    }
    return apiClient.get<any>(`/ai/systems/${systemId}/performance`);
  },

  // AI 응답 테스트
  async testAIResponse(systemId: string, input: string): Promise<APIResponse<any>> {
    if (USE_MOCK_API && mockAPIClient) {
      return mockAPIClient.testAIResponse(systemId, input);
    }
    return apiClient.post<any>(`/ai/systems/${systemId}/test`, { input });
  },
};

// 실시간 통신을 위한 WebSocket 클라이언트
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string) { }

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket 연결됨');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        onError?.(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        this.attemptReconnect(onMessage, onError);
      };
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
    }
  }

  private attemptReconnect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        this.connect(onMessage, onError);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('WebSocket 재연결 실패');
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket이 연결되지 않음');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// WebSocket 인스턴스 (실제 서버 URL로 변경 필요)
export const wsClient = new WebSocketClient('ws://localhost:8000/ws');

// MockWebSocketClient export
export { MockWebSocketClient } from './mockAPI';

export default apiClient; 