// 실제 백엔드 API 연동 서비스

import { API_BASE_URL, USE_MOCK_API, ChatRoom, Message, AISystem, AIResponse } from './api';

// 백엔드 API 엔드포인트
const BACKEND_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify'
  },

  // 채팅
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: '/chat/messages',
    TYPING: '/chat/typing',
    HISTORY: '/chat/history'
  },

  // AI 시스템
  AI: {
    SYSTEMS: '/ai/systems',
    PROCESS: '/ai/process',
    STATUS: '/ai/status',
    CONFIG: '/ai/config'
  },

  // 사용자
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    PREFERENCES: '/user/preferences'
  },

  // 파일 업로드
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    DOCUMENT: '/upload/document'
  },

  // 분석
  ANALYTICS: {
    USAGE: '/analytics/usage',
    PERFORMANCE: '/analytics/performance',
    ERRORS: '/analytics/errors'
  }
};

// API 응답 타입
export interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
  timestamp: string;
}

// 인증 토큰 관리
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenManager = new TokenManager();

// 백엔드 API 클라이언트
class BackendAPIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = tokenManager.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        // 토큰 만료, 갱신 시도
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // 재시도
          return this.request(endpoint, options);
        } else {
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          throw new Error('인증이 만료되었습니다.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}${BACKEND_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        tokenManager.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
    }

    tokenManager.clearTokens();
    return false;
  }

  // 인증 API
  async login(credentials: { email: string; password: string }) {
    return this.request(BACKEND_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async logout() {
    const response = await this.request(BACKEND_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST'
    });
    tokenManager.clearTokens();
    return response;
  }

  async register(userData: { email: string; password: string; name: string }) {
    return this.request(BACKEND_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 채팅 API
  async getChatRooms() {
    return this.request<ChatRoom[]>(BACKEND_ENDPOINTS.CHAT.ROOMS);
  }

  async getChatMessages(roomId: string, limit: number = 50, offset: number = 0) {
    return this.request<Message[]>(`${BACKEND_ENDPOINTS.CHAT.MESSAGES}?roomId=${roomId}&limit=${limit}&offset=${offset}`);
  }

  async sendMessage(message: { roomId: string; content: string; type?: string }) {
    return this.request<Message>(BACKEND_ENDPOINTS.CHAT.MESSAGES, {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }

  async sendTypingStatus(roomId: string, isTyping: boolean) {
    return this.request(BACKEND_ENDPOINTS.CHAT.TYPING, {
      method: 'POST',
      body: JSON.stringify({ roomId, isTyping })
    });
  }

  // AI 시스템 API
  async getAISystems() {
    return this.request<AISystem[]>(BACKEND_ENDPOINTS.AI.SYSTEMS);
  }

  async processAIRequest(request: {
    systemId: string;
    input: string;
    options?: any;
  }) {
    return this.request<AIResponse>(BACKEND_ENDPOINTS.AI.PROCESS, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getAIStatus(systemId?: string) {
    const url = systemId
      ? `${BACKEND_ENDPOINTS.AI.STATUS}?systemId=${systemId}`
      : BACKEND_ENDPOINTS.AI.STATUS;
    return this.request<AISystem[]>(url);
  }

  // 파일 업로드 API
  async uploadFile(file: File, type: 'image' | 'file' | 'document') {
    // 모의 업로드 (실제 서버가 없을 때 사용)
    return new Promise<BackendResponse<{ url: string; filename: string }>>((resolve) => {
      setTimeout(() => {
        // 파일 정보 시뮬레이션
        const mockFileInfo = {
          url: `https://example.com/uploads/${file.name}`,
          filename: file.name
        };

        resolve({
          success: true,
          data: mockFileInfo,
          message: '파일이 성공적으로 업로드되었습니다.',
          timestamp: new Date().toISOString()
        });
      }, 2000); // 2초 지연으로 업로드 시뮬레이션
    });

    // 실제 API 호출 (서버가 있을 때 사용)
    /*
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = BACKEND_ENDPOINTS.UPLOAD[type.toUpperCase() as keyof typeof BACKEND_ENDPOINTS.UPLOAD];

    return this.request<{ url: string; filename: string }>(endpoint, {
      method: 'POST',
      headers: {
        // Content-Type은 자동으로 설정됨
      },
      body: formData
    });
    */
  }

  // 사용자 API
  async getUserProfile() {
    return this.request(BACKEND_ENDPOINTS.USER.PROFILE);
  }

  async updateUserSettings(settings: any) {
    return this.request(BACKEND_ENDPOINTS.USER.SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // 분석 API
  async getAnalytics(type: 'usage' | 'performance' | 'errors', period: string = '7d') {
    return this.request(`${BACKEND_ENDPOINTS.ANALYTICS[type.toUpperCase() as keyof typeof BACKEND_ENDPOINTS.ANALYTICS]}?period=${period}`);
  }
}

// 백엔드 API 인스턴스
export const backendAPI = new BackendAPIClient();

// 백엔드 API 훅
export function useBackendAPI() {
  const isAuthenticated = tokenManager.isAuthenticated();

  return {
    isAuthenticated,
    login: backendAPI.login.bind(backendAPI),
    logout: backendAPI.logout.bind(backendAPI),
    register: backendAPI.register.bind(backendAPI),
    getChatRooms: backendAPI.getChatRooms.bind(backendAPI),
    getChatMessages: backendAPI.getChatMessages.bind(backendAPI),
    sendMessage: backendAPI.sendMessage.bind(backendAPI),
    sendTypingStatus: backendAPI.sendTypingStatus.bind(backendAPI),
    getAISystems: backendAPI.getAISystems.bind(backendAPI),
    processAIRequest: backendAPI.processAIRequest.bind(backendAPI),
    getAIStatus: backendAPI.getAIStatus.bind(backendAPI),
    uploadFile: backendAPI.uploadFile.bind(backendAPI),
    getUserProfile: backendAPI.getUserProfile.bind(backendAPI),
    updateUserSettings: backendAPI.updateUserSettings.bind(backendAPI),
    getAnalytics: backendAPI.getAnalytics.bind(backendAPI)
  };
} 