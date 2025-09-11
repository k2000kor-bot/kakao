// 궁극적 메시지 통합 시스템 API 서비스
const ULTIMATE_MESSAGE_API_BASE = 'http://localhost:8002';

export interface UltimateMessageRequest {
  original_message: string;
  format_type?: string;
  strategy_type?: string;
  tone_type?: string;
  user_id?: string;
  chat_room_id?: string;
  context?: string;
  recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
  include_analytics?: boolean;
  include_history?: boolean;
}

export interface UserProfileRequest {
  user_id: string;
  preferred_formats: string[];
  communication_style: string;
  strategy_preferences: string[];
  tone_preferences: string[];
}

export interface UltimateAnalytics {
  emotion_score: number;
  sentiment_score: number;
  complexity_score: number;
  impact_prediction: number;
  keywords: string[];
  tone: string;
  formality_level: string;
  strategy_effectiveness: number;
  format_appropriateness: number;
}

export interface UltimateGeneratedMessage {
  id: string;
  original_message: string;
  format_type: string;
  strategy_type: string;
  tone_type: string;
  generated_message: string;
  analytics: UltimateAnalytics;
  user_profile: {
    preferred_formats: string[];
    communication_style: string;
    strategy_preferences: string[];
    tone_preferences: string[];
  };
  context_analysis: {
    total_messages: number;
    context_length: number;
    overall_sentiment: string;
    positive_count: number;
    negative_count: number;
  };
  timestamp: string;
}

export interface UserProfile {
  user_id: string;
  preferred_formats: string[];
  communication_style: string;
  strategy_preferences: string[];
  tone_preferences: string[];
  created_at: string;
  updated_at: string;
}

export interface MessageHistoryItem {
  message_id: string;
  format_type: string;
  strategy_type: string;
  success: boolean;
  timestamp: string;
}

export interface MessageFormat {
  [key: string]: string;
}

export interface Strategy {
  [key: string]: string;
}

export interface Tone {
  [key: string]: string;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${ULTIMATE_MESSAGE_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 궁극적 메시지 통합 시스템 API 클래스
export class UltimateMessageAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall('/api/status');
  }

  // 헬스 체크
  static async healthCheck() {
    return apiCall('/api/health');
  }

  // 메시지 형식 목록 조회
  static async getMessageFormats(): Promise<{ success: boolean; formats: MessageFormat }> {
    return apiCall('/api/message-formats');
  }

  // 전략 목록 조회
  static async getStrategies(): Promise<{ success: boolean; strategies: Strategy }> {
    return apiCall('/api/strategies');
  }

  // 톤 목록 조회
  static async getTones(): Promise<{ success: boolean; tones: Tone }> {
    return apiCall('/api/tones');
  }

  // 궁극적 메시지 생성
  static async generateUltimateMessage(request: UltimateMessageRequest): Promise<{ success: boolean; message: UltimateGeneratedMessage }> {
    return apiCall('/api/generate-ultimate-message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 사용자 프로필 업데이트
  static async updateUserProfile(request: UserProfileRequest): Promise<{ success: boolean; message: string }> {
    return apiCall('/api/update-user-profile', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 사용자 프로필 조회
  static async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    return apiCall(`/api/user-profile/${userId}`);
  }

  // 메시지 히스토리 조회
  static async getMessageHistory(userId: string, limit: number = 10): Promise<{ success: boolean; history?: MessageHistoryItem[]; error?: string }> {
    return apiCall(`/api/message-history/${userId}?limit=${limit}`);
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('서버 연결 실패:', error);
      return false;
    }
  }
}

// 편의 함수들
export const ultimateMessageAPI = {
  // 메시지 형식 가져오기
  getFormats: async () => {
    try {
      const response = await UltimateMessageAPI.getMessageFormats();
      return response.formats;
    } catch (error) {
      console.error('메시지 형식 조회 실패:', error);
      return {};
    }
  },

  // 전략 가져오기
  getStrategies: async () => {
    try {
      const response = await UltimateMessageAPI.getStrategies();
      return response.strategies;
    } catch (error) {
      console.error('전략 조회 실패:', error);
      return {};
    }
  },

  // 톤 가져오기
  getTones: async () => {
    try {
      const response = await UltimateMessageAPI.getTones();
      return response.tones;
    } catch (error) {
      console.error('톤 조회 실패:', error);
      return {};
    }
  },

  // 궁극적 메시지 생성
  generateUltimate: async (request: UltimateMessageRequest) => {
    try {
      const response = await UltimateMessageAPI.generateUltimateMessage(request);
      return response.message;
    } catch (error) {
      console.error('궁극적 메시지 생성 실패:', error);
      throw error;
    }
  },

  // 사용자 프로필 업데이트
  updateProfile: async (request: UserProfileRequest) => {
    try {
      const response = await UltimateMessageAPI.updateUserProfile(request);
      return response.message;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  },

  // 사용자 프로필 조회
  getProfile: async (userId: string) => {
    try {
      const response = await UltimateMessageAPI.getUserProfile(userId);
      return response.profile;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  },

  // 메시지 히스토리 조회
  getHistory: async (userId: string, limit: number = 10) => {
    try {
      const response = await UltimateMessageAPI.getMessageHistory(userId, limit);
      return response.history;
    } catch (error) {
      console.error('히스토리 조회 실패:', error);
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await UltimateMessageAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      return false;
    }
  },

  // 테스트 엔드포인트
  testEndpoint: async () => {
    try {
      const response = await apiCall('/api/test');
      return response;
    } catch (error) {
      console.error('테스트 엔드포인트 실패:', error);
      throw error;
    }
  },
};

export default UltimateMessageAPI; 