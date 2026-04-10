import {
  WS_BASE_URL,
  joinApiBaseAndPath,
  joinApiSecurityWebSocketClientPath,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

const securityWsClientId =
  typeof process.env.REACT_APP_SECURITY_WS_CLIENT_ID === 'string' &&
  process.env.REACT_APP_SECURITY_WS_CLIENT_ID.trim().length > 0
    ? process.env.REACT_APP_SECURITY_WS_CLIENT_ID.trim()
    : 'client1';

interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          errorLogger.info('WebSocket 연결 성공', {
            component: 'websocket',
            action: 'connect',
            url: this.url,
          });
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            const err = toError(error);
            errorLogger.error('WebSocket 메시지 파싱 오류', err, {
              component: 'websocket',
              action: 'connect',
              url: this.url,
            });
          }
        };

        this.ws.onclose = () => {
          errorLogger.info('WebSocket 연결 종료', {
            component: 'websocket',
            action: 'connect',
            url: this.url,
          });
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          const err = toError(error);
          errorLogger.error('WebSocket 오류', err, {
            component: 'websocket',
            action: 'connect',
            url: this.url,
          });
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      errorLogger.info('WebSocket 재연결 시도', {
        component: 'websocket',
        action: 'attemptReconnect',
        reconnectAttempts: this.reconnectAttempts,
        maxReconnectAttempts: this.maxReconnectAttempts,
        url: this.url,
      });
      
      setTimeout(() => {
        this.connect().catch(error => {
          const err = toError(error);
          errorLogger.error('WebSocket 재연결 실패', err, {
            component: 'websocket',
            action: 'attemptReconnect',
            reconnectAttempts: this.reconnectAttempts,
            url: this.url,
          });
        });
      }, this.reconnectInterval);
    } else {
      errorLogger.error('WebSocket 최대 재연결 시도 횟수 초과', new Error('최대 재연결 시도 횟수 초과'), {
        component: 'websocket',
        action: 'attemptReconnect',
        maxReconnectAttempts: this.maxReconnectAttempts,
        url: this.url,
      });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message.data));
    }
  }

  subscribe(type: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  unsubscribe(type: string, callback: (data: unknown) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(type: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      errorLogger.warn('WebSocket이 연결되지 않았습니다', {
        component: 'websocket',
        action: 'send',
        type,
        readyState: this.ws?.readyState,
        url: this.url,
      });
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// WebSocket 서비스 인스턴스 생성
const WS_API_BASE = WS_BASE_URL.replace(/^http:/, 'ws:');
export const websocketService = new WebSocketService(
  joinApiBaseAndPath(WS_API_BASE, joinApiSecurityWebSocketClientPath(securityWsClientId)),
);
export default websocketService; 