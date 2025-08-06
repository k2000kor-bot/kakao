import { useState, useEffect } from 'react';
import { wsClient, MockWebSocketClient } from './api';
import { mockAPIClient } from './mockAPI';

// 실시간 이벤트 타입 정의
export interface RealtimeEvent {
  type: 'message' | 'typing' | 'system' | 'ai_response' | 'notification' | 'user_activity' | 'ai_status';
  data: any;
  timestamp: string;
  roomId?: string;
  userId?: string;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  roomId: string;
  isTyping: boolean;
}

export interface AIStatusUpdate {
  systemId: string;
  status: 'active' | 'inactive' | 'processing' | 'error';
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
  lastUpdate: string;
}

export interface UserActivity {
  userId: string;
  username: string;
  action: 'join' | 'leave' | 'typing' | 'message' | 'reaction';
  roomId?: string;
  data?: any;
}

// 실시간 서비스 클래스
class RealtimeService {
  private wsClient: any;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, ((event: RealtimeEvent) => void)[]> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set<userId>
  private aiStatus: Map<string, AIStatusUpdate> = new Map();

  constructor() {
    // 개발 환경에서는 모킹 WebSocket 사용
    if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_WS_URL) {
      this.wsClient = new MockWebSocketClient();
    } else {
      this.wsClient = wsClient;
    }
  }

  // 연결 시작
  connect() {
    if (this.isConnected) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
    
    this.wsClient.connect(
      (data: RealtimeEvent) => {
        this.handleRealtimeEvent(data);
      },
      (error: Event) => {
        console.error('WebSocket 연결 오류:', error);
        this.isConnected = false;
        this.attemptReconnect();
      }
    );

    this.isConnected = true;
    this.reconnectAttempts = 0;
  }

  // 재연결 시도
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('WebSocket 재연결 실패');
    }
  }

  // 실시간 이벤트 처리
  private handleRealtimeEvent(event: RealtimeEvent) {
    console.log('실시간 이벤트 수신:', event);

    // 이벤트 타입별 처리
    switch (event.type) {
      case 'message':
        this.handleMessageEvent(event);
        break;
      case 'typing':
        this.handleTypingEvent(event);
        break;
      case 'ai_response':
        this.handleAIResponseEvent(event);
        break;
      case 'ai_status':
        this.handleAIStatusEvent(event);
        break;
      case 'user_activity':
        this.handleUserActivityEvent(event);
        break;
      case 'notification':
        this.handleNotificationEvent(event);
        break;
      default:
        console.log('알 수 없는 이벤트 타입:', event.type);
    }

    // 이벤트 핸들러 호출
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  // 메시지 이벤트 처리
  private handleMessageEvent(event: RealtimeEvent) {
    // 메시지 수신 시 타이핑 상태 제거
    if (event.roomId && event.data?.userId) {
      this.removeTypingUser(event.roomId, event.data.userId);
    }
  }

  // 타이핑 이벤트 처리
  private handleTypingEvent(event: RealtimeEvent) {
    if (event.roomId && event.data) {
      const { userId, isTyping } = event.data;
      if (isTyping) {
        this.addTypingUser(event.roomId, userId);
      } else {
        this.removeTypingUser(event.roomId, userId);
      }
    }
  }

  // AI 응답 이벤트 처리
  private handleAIResponseEvent(event: RealtimeEvent) {
    // AI 응답 수신 시 처리
    console.log('AI 응답 수신:', event.data);
  }

  // AI 상태 이벤트 처리
  private handleAIStatusEvent(event: RealtimeEvent) {
    if (event.data?.systemId) {
      this.aiStatus.set(event.data.systemId, event.data);
    }
  }

  // 사용자 활동 이벤트 처리
  private handleUserActivityEvent(event: RealtimeEvent) {
    console.log('사용자 활동:', event.data);
  }

  // 알림 이벤트 처리
  private handleNotificationEvent(event: RealtimeEvent) {
    console.log('알림 수신:', event.data);
  }

  // 타이핑 사용자 추가
  private addTypingUser(roomId: string, userId: string) {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(userId);
  }

  // 타이핑 사용자 제거
  private removeTypingUser(roomId: string, userId: string) {
    const users = this.typingUsers.get(roomId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }
  }

  // 타이핑 사용자 목록 조회
  getTypingUsers(roomId: string): string[] {
    const users = this.typingUsers.get(roomId);
    return users ? Array.from(users) : [];
  }

  // AI 상태 조회
  getAIStatus(systemId: string): AIStatusUpdate | null {
    return this.aiStatus.get(systemId) || null;
  }

  // 모든 AI 상태 조회
  getAllAIStatus(): AIStatusUpdate[] {
    return Array.from(this.aiStatus.values());
  }

  // 이벤트 리스너 등록
  on(eventType: string, handler: (event: RealtimeEvent) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  // 이벤트 리스너 제거
  off(eventType: string, handler: (event: RealtimeEvent) => void) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 메시지 전송
  sendMessage(roomId: string, message: any) {
    this.wsClient.send({
      type: 'message',
      roomId,
      data: message,
      timestamp: new Date().toISOString()
    });
  }

  // 타이핑 상태 전송
  sendTypingStatus(roomId: string, userId: string, isTyping: boolean) {
    this.wsClient.send({
      type: 'typing',
      roomId,
      data: {
        userId,
        isTyping
      },
      timestamp: new Date().toISOString()
    });
  }

  // AI 시스템 상태 요청
  requestAIStatus(systemId?: string) {
    this.wsClient.send({
      type: 'ai_status_request',
      data: { systemId },
      timestamp: new Date().toISOString()
    });
  }

  // 연결 해제
  disconnect() {
    this.wsClient.disconnect();
    this.isConnected = false;
    this.eventHandlers.clear();
    this.typingUsers.clear();
    this.aiStatus.clear();
  }

  // 연결 상태 확인
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 실시간 서비스 인스턴스
export const realtimeService = new RealtimeService();

// 실시간 훅
export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  const [aiStatus, setAIStatus] = useState<Map<string, AIStatusUpdate>>(new Map());

  useEffect(() => {
    // 연결 상태 모니터링
    const checkConnection = () => {
      setIsConnected(realtimeService.getConnectionStatus());
    };

    const interval = setInterval(checkConnection, 1000);

    // 실시간 이벤트 리스너 등록
    const handleTypingEvent = (event: RealtimeEvent) => {
      if (event.type === 'typing' && event.roomId) {
        const users = realtimeService.getTypingUsers(event.roomId);
        setTypingUsers(prev => new Map(prev).set(event.roomId!, users));
      }
    };

    const handleAIStatusEvent = (event: RealtimeEvent) => {
      if (event.type === 'ai_status') {
        setAIStatus(prev => new Map(prev).set(event.data.systemId, event.data));
      }
    };

    realtimeService.on('typing', handleTypingEvent);
    realtimeService.on('ai_status', handleAIStatusEvent);

    // 초기 연결
    realtimeService.connect();

    return () => {
      clearInterval(interval);
      realtimeService.off('typing', handleTypingEvent);
      realtimeService.off('ai_status', handleAIStatusEvent);
    };
  }, []);

  return {
    isConnected,
    typingUsers,
    aiStatus,
    sendMessage: realtimeService.sendMessage.bind(realtimeService),
    sendTypingStatus: realtimeService.sendTypingStatus.bind(realtimeService),
    requestAIStatus: realtimeService.requestAIStatus.bind(realtimeService),
    getTypingUsers: realtimeService.getTypingUsers.bind(realtimeService),
    getAIStatus: realtimeService.getAIStatus.bind(realtimeService),
    getAllAIStatus: realtimeService.getAllAIStatus.bind(realtimeService)
  };
}; 