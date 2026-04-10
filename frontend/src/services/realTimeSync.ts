/**
 * 실시간 동기화 서비스
 * 여러 클라이언트 간 실시간 데이터 동기화 관리
 */

import { errorLogger } from '../utils/errorLogger';
import {
    API_V7_SYNC_PATH,
    WS_BASE_URL,
    WS_CLIENT_GENERIC_PATH,
    joinApiBaseAndPath,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';

export interface SyncEvent {
    type: 'message' | 'typing' | 'presence' | 'update' | 'delete';
    id: string;
    data: Record<string, unknown>;
    timestamp: string;
    userId?: string;
    sessionId?: string;
}

export interface SyncConfig {
    enabled: boolean;
    syncInterval?: number; // ms
    maxRetries?: number;
    onSync?: (event: SyncEvent) => void;
    onError?: (error: Error) => void;
}

class RealTimeSyncService {
    private static instance: RealTimeSyncService;
    private config: SyncConfig = {
        enabled: false,
        syncInterval: 1000,
        maxRetries: 3,
    };
    private syncIntervalId: NodeJS.Timeout | null = null;
    private eventQueue: SyncEvent[] = [];
    private readonly listeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;

    private constructor() {
        // WebSocket 연결 시도 (선택적)
        if (typeof WebSocket !== 'undefined') {
            this.initializeWebSocket();
        }
    }

    public static getInstance(): RealTimeSyncService {
        if (!RealTimeSyncService.instance) {
            RealTimeSyncService.instance = new RealTimeSyncService();
        }
        return RealTimeSyncService.instance;
    }

    /**
     * WebSocket 초기화
     */
    private initializeWebSocket(): void {
        try {
            const wsUrl =
                process.env.REACT_APP_WS_URL || joinApiBaseAndPath(WS_BASE_URL, WS_CLIENT_GENERIC_PATH);
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                errorLogger.info('RealTimeSync: WebSocket 연결됨', {
                    component: 'RealTimeSync',
                    action: 'connect',
                });
                this.reconnectAttempts = 0;
                this.flushEventQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const syncEvent: SyncEvent = JSON.parse(event.data);
                    this.handleIncomingEvent(syncEvent);
                } catch (error: unknown) {
                    errorLogger.error('RealTimeSync: 메시지 파싱 실패', error instanceof Error ? error : new Error(String(error)), {
                        component: 'RealTimeSync',
                        action: 'parseMessage',
                    });
                }
            };

            this.ws.onerror = (error: Event) => {
                errorLogger.error('RealTimeSync: WebSocket 오류', error instanceof Error ? error : new Error('WebSocket 연결 오류'), {
                    component: 'RealTimeSync',
                    action: 'websocketError',
                });
                this.config.onError?.(new Error('WebSocket 연결 오류'));
            };

            this.ws.onclose = () => {
                errorLogger.info('RealTimeSync: WebSocket 연결 종료', {
                    component: 'RealTimeSync',
                    action: 'disconnect',
                });
                this.attemptReconnect();
            };
        } catch (error: unknown) {
            errorLogger.warn('RealTimeSync: WebSocket 초기화 실패, 폴링 모드로 전환', {
                component: 'RealTimeSync',
                action: 'initializeWebSocket',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * 재연결 시도
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            errorLogger.info(`RealTimeSync: ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
                component: 'RealTimeSync',
                action: 'attemptReconnect',
                delay,
                attempts: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
            });
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        }
    }

    /**
     * 설정 업데이트
     */
    configure(config: Partial<SyncConfig>): void {
        this.config = { ...this.config, ...config };

        if (this.config.enabled) {
            this.startSync();
        } else {
            this.stopSync();
        }
    }

    /**
     * 동기화 시작
     */
    startSync(): void {
        if (this.syncIntervalId) {
            return; // 이미 실행 중
        }

        this.config.enabled = true;

        // WebSocket이 연결되어 있지 않으면 폴링 모드
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.syncIntervalId = setInterval(() => {
                this.sync();
            }, this.config.syncInterval || 1000);
        }
    }

    /**
     * 동기화 중지
     */
    stopSync(): void {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
        this.config.enabled = false;
    }

    /**
     * 동기화 실행
     */
    private async sync(): Promise<void> {
        if (this.eventQueue.length === 0) {
            return;
        }

        try {
            // WebSocket이 연결되어 있으면 WebSocket으로 전송
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                for (const event of this.eventQueue) {
                    this.ws.send(JSON.stringify(event));
                }
                this.eventQueue = [];
                return;
            }

            // 폴링 모드: HTTP API로 전송
            const response = await fetch(
                joinApiHealthCheckUrl(resolveApiBaseUrl(), API_V7_SYNC_PATH),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        events: this.eventQueue,
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                this.eventQueue = [];

                // 서버에서 받은 이벤트 처리
                if (result.events && Array.isArray(result.events)) {
                    for (const event of result.events) {
                        this.handleIncomingEvent(event);
                    }
                }
            }
        } catch (error: unknown) {
            errorLogger.error('RealTimeSync: 동기화 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'RealTimeSync',
                action: 'sync',
            });
            this.config.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * 이벤트 전송
     */
    sendEvent(event: Omit<SyncEvent, 'timestamp'>): void {
        try {
            const syncEvent: SyncEvent = {
                ...event,
                timestamp: new Date().toISOString(),
            };

            // WebSocket이 연결되어 있으면 즉시 전송
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(syncEvent));
                return;
            }

            // 그렇지 않으면 큐에 추가
            this.eventQueue.push(syncEvent);

            // 큐가 너무 크면 오래된 이벤트 제거
            if (this.eventQueue.length > 100) {
                this.eventQueue.shift();
            }
        } catch (error: unknown) {
            errorLogger.error('RealTimeSync: 이벤트 전송 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'RealTimeSync',
                action: 'sendEvent',
            });
            this.config.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * 수신 이벤트 처리
     */
    private handleIncomingEvent(event: SyncEvent): void {
        try {
            // 타입별 리스너 호출
            const listeners = this.listeners.get(String(event.type));
            if (listeners) {
                for (const listener of listeners) {
                    try {
                        listener(event);
                    } catch (error: unknown) {
                        errorLogger.error('RealTimeSync: 리스너 실행 오류', error instanceof Error ? error : new Error(String(error)), {
                            component: 'RealTimeSync',
                            action: 'handleIncomingEvent',
                            eventType: event.type,
                        });
                    }
                }
            }

            // 전역 콜백 호출
            this.config.onSync?.(event);
        } catch (error: unknown) {
            errorLogger.error('RealTimeSync: 이벤트 처리 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'RealTimeSync',
                action: 'handleIncomingEvent',
            });
        }
    }

    /**
     * 이벤트 리스너 등록
     */
    on(eventType: SyncEvent['type'], listener: (event: SyncEvent) => void): () => void {
        const eventTypeKey: string = String(eventType);
        if (!this.listeners.has(eventTypeKey)) {
            this.listeners.set(eventTypeKey, new Set<(event: SyncEvent) => void>());
        }
        const listenerSet = this.listeners.get(eventTypeKey);
        if (listenerSet) {
            listenerSet.add(listener);
        }

        // 구독 해제 함수 반환
        return () => {
            const listeners = this.listeners.get(eventTypeKey);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(eventTypeKey);
                }
            }
        };
    }

    /**
     * 이벤트 큐 플러시
     */
    private flushEventQueue(): void {
        if (this.eventQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            for (const event of this.eventQueue) {
                this.ws.send(JSON.stringify(event));
            }
            this.eventQueue = [];
        }
    }

    /**
     * 연결 상태 확인
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * 연결 종료
     */
    disconnect(): void {
        this.stopSync();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const realTimeSync = RealTimeSyncService.getInstance();
export default realTimeSync;

