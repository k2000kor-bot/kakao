// 실시간 보안 모니터링 WebSocket 서비스
// 보안 이벤트, 위협, 알림을 실시간으로 수신

import { EventEmitter } from 'events';
import { WS_BASE_URL, WS_SECURITY_PATH, joinApiBaseAndPath } from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

export interface SecurityWebSocketEvent {
    type: 'threat' | 'alert' | 'event' | 'status_update' | 'scan_result';
    data: unknown;
    timestamp: string;
}

class SecurityWebSocketService extends EventEmitter {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private isConnecting = false;
    private baseURL: string;

    constructor() {
        super();
        // WebSocket URL 설정 (환경 변수 또는 기본값)
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // 개발 환경에서는 통합 API 포트(5002) 사용
        const wsHost = process.env.REACT_APP_WS_URL
            ? new URL(process.env.REACT_APP_WS_URL.replace(/^ws/i, 'http')).host
            : process.env.NODE_ENV === 'development'
              ? new URL(WS_BASE_URL.replace(/^ws/i, 'http')).host
              : window.location.host;
        this.baseURL = `${wsProtocol}//${wsHost}`;
    }

    /**
     * WebSocket 연결 시작
     */
    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
            return;
        }

        this.isConnecting = true;
        const wsUrl = joinApiBaseAndPath(this.baseURL, WS_SECURITY_PATH);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                errorLogger.info('보안 WebSocket 연결 성공', {
                    component: 'securityWebSocketService',
                    action: 'connect',
                    baseURL: this.baseURL,
                });
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: SecurityWebSocketEvent = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    const err = toError(error);
                    errorLogger.error('WebSocket 메시지 파싱 실패', err, {
                        component: 'securityWebSocketService',
                        action: 'connect',
                        baseURL: this.baseURL,
                    });
                }
            };

            this.ws.onerror = (error) => {
                const err = toError(error);
                errorLogger.error('WebSocket 오류', err, {
                    component: 'securityWebSocketService',
                    action: 'connect',
                    baseURL: this.baseURL,
                });
                this.emit('error', error);
                this.isConnecting = false;
            };

            this.ws.onclose = () => {
                errorLogger.info('WebSocket 연결 종료', {
                    component: 'securityWebSocketService',
                    action: 'connect',
                    baseURL: this.baseURL,
                });
                this.isConnecting = false;
                this.emit('disconnected');
                this.attemptReconnect();
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('WebSocket 연결 실패', err, {
                component: 'securityWebSocketService',
                action: 'connect',
                baseURL: this.baseURL,
            });
            this.isConnecting = false;
            this.attemptReconnect();
        }
    }

    /**
     * WebSocket 연결 종료
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.reconnectAttempts = 0;
    }

    /**
     * 메시지 전송
     */
    send(message: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            errorLogger.warn('WebSocket이 연결되지 않았습니다', {
                component: 'securityWebSocketService',
                action: 'send',
                readyState: this.ws?.readyState,
                baseURL: this.baseURL,
            });
        }
    }

    /**
     * 메시지 처리
     */
    private handleMessage(message: SecurityWebSocketEvent): void {
        switch (message.type) {
            case 'threat':
                this.emit('threat', message.data);
                break;
            case 'alert':
                this.emit('alert', message.data);
                break;
            case 'event':
                this.emit('event', message.data);
                break;
            case 'status_update':
                this.emit('status_update', message.data);
                break;
            case 'scan_result':
                this.emit('scan_result', message.data);
                break;
            default:
                this.emit('message', message);
        }
    }

    /**
     * 재연결 시도
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            errorLogger.error('최대 재연결 시도 횟수 초과', new Error('최대 재연결 시도 횟수 초과'), {
                component: 'securityWebSocketService',
                action: 'attemptReconnect',
                maxReconnectAttempts: this.maxReconnectAttempts,
                baseURL: this.baseURL,
            });
            this.emit('reconnect_failed');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;

        errorLogger.info('재연결 시도', {
            component: 'securityWebSocketService',
            action: 'attemptReconnect',
            delay,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            baseURL: this.baseURL,
        });

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * 연결 상태 확인
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * 구독 요청 (특정 이벤트 타입 구독)
     */
    subscribe(eventType: string): void {
        this.send({
            action: 'subscribe',
            event_type: eventType,
        });
    }

    /**
     * 구독 해제
     */
    unsubscribe(eventType: string): void {
        this.send({
            action: 'unsubscribe',
            event_type: eventType,
        });
    }
}

// 싱글톤 인스턴스
const securityWebSocketService = new SecurityWebSocketService();

export default securityWebSocketService;
