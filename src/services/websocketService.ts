/**
 * WebSocket Service for real-time communication
 * 실시간 통신을 위한 WebSocket 서비스
 */

import { errorLogger } from '../utils/errorLogger';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface SecurityAlert {
  alert_type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  source: string;
  action: string;
}

export interface AIModelStatus {
  name: string;
  status: 'active' | 'idle' | 'processing' | 'training';
  accuracy: number;
  processing_time: number;
  memory_usage: number;
}

export interface AIEngineStatus {
  models: AIModelStatus[];
  overall_performance: number;
  active_requests: number;
}

export interface PerformanceOptimization {
  optimization_type: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  estimated_completion: number;
  performance_gain: number;
}

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  data: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      const wsUrl = 'ws://localhost:8000/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        errorLogger.info('WebSocket 연결 성공', {
          component: 'WebSocketService',
          action: 'connect',
        });
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          errorLogger.error('WebSocket 메시지 파싱 오류', error instanceof Error ? error : new Error(String(error)), {
            component: 'WebSocketService',
            action: 'parseMessage',
          });
        }
      };

      this.ws.onclose = () => {
        errorLogger.info('WebSocket 연결 종료', {
          component: 'WebSocketService',
          action: 'close',
        });
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', {});
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        errorLogger.error('WebSocket 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'WebSocketService',
          action: 'websocketError',
        });
        this.emit('error', error);
      };

    } catch (error) {
      errorLogger.error('WebSocket 연결 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'WebSocketService',
        action: 'connect',
      });
      this.attemptReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'system_metrics':
        this.emit('systemMetrics', message.data as SystemMetrics);
        break;
      case 'security_alert':
        this.emit('securityAlert', message.data as SecurityAlert);
        break;
      case 'ai_engine_status':
        this.emit('aiEngineStatus', message.data as AIEngineStatus);
        break;
      case 'performance_optimization':
        this.emit('performanceOptimization', message.data as PerformanceOptimization);
        break;
      case 'pong':
        // Heartbeat 응답
        break;
      default:
        errorLogger.warn('알 수 없는 메시지 타입', {
          component: 'WebSocketService',
          action: 'handleMessage',
          messageType: message.type,
        });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // 30초마다 ping
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      errorLogger.info(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, {
        component: 'WebSocketService',
        action: 'attemptReconnect',
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      errorLogger.error('WebSocket 재연결 실패: 최대 시도 횟수 초과', new Error('Max reconnect attempts exceeded'), {
        component: 'WebSocketService',
        action: 'attemptReconnect',
        maxAttempts: this.maxReconnectAttempts,
      });
      this.emit('reconnectFailed', {});
    }
  }

  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      errorLogger.warn('WebSocket이 연결되지 않음', {
        component: 'WebSocketService',
        action: 'send',
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public requestMetrics(): void {
    this.send({
      type: 'request_metrics',
      timestamp: new Date().toISOString()
    });
  }

  public requestSecurityAlerts(): void {
    this.send({
      type: 'request_security',
      timestamp: new Date().toISOString()
    });
  }

  public requestAIStatus(): void {
    this.send({
      type: 'request_ai_status',
      timestamp: new Date().toISOString()
    });
  }

  public requestPerformanceOptimization(): void {
    this.send({
      type: 'request_performance',
      timestamp: new Date().toISOString()
    });
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스
export const websocketService = new WebSocketService();

// 특화된 WebSocket 연결들
export class MetricsWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('ws://localhost:8000/ws/metrics');

      this.ws.onopen = () => {
        errorLogger.info('메트릭 WebSocket 연결 성공', {
          component: 'MetricsWebSocket',
          action: 'connect',
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === 'system_metrics') {
            this.emit('metrics', message.data as SystemMetrics);
          }
        } catch (error) {
          errorLogger.error('메트릭 WebSocket 메시지 파싱 오류', error instanceof Error ? error : new Error(String(error)), {
            component: 'MetricsWebSocket',
            action: 'parseMessage',
          });
        }
      };

      this.ws.onclose = () => {
        errorLogger.info('메트릭 WebSocket 연결 종료', {
          component: 'MetricsWebSocket',
          action: 'close',
        });
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        errorLogger.error('메트릭 WebSocket 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'MetricsWebSocket',
          action: 'websocketError',
        });
      };

    } catch (error) {
      errorLogger.error('메트릭 WebSocket 연결 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'MetricsWebSocket',
        action: 'connect',
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export class AlertsWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('ws://localhost:8000/ws/alerts');

      this.ws.onopen = () => {
        errorLogger.info('알림 WebSocket 연결 성공', {
          component: 'AlertsWebSocket',
          action: 'connect',
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === 'security_alert') {
            this.emit('alert', message.data as SecurityAlert);
          }
        } catch (error) {
          errorLogger.error('알림 WebSocket 메시지 파싱 오류', error instanceof Error ? error : new Error(String(error)), {
            component: 'AlertsWebSocket',
            action: 'parseMessage',
          });
        }
      };

      this.ws.onclose = () => {
        errorLogger.info('알림 WebSocket 연결 종료', {
          component: 'AlertsWebSocket',
          action: 'close',
        });
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        errorLogger.error('알림 WebSocket 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'AlertsWebSocket',
          action: 'websocketError',
        });
      };

    } catch (error) {
      errorLogger.error('알림 WebSocket 연결 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'AlertsWebSocket',
        action: 'connect',
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const metricsWebSocket = new MetricsWebSocket();
export const alertsWebSocket = new AlertsWebSocket();