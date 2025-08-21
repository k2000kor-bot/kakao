// WebSocket 서비스 - 향후 Redux 연동 예정
// import { store } from '../store';
// import {
//     setWebSocketStatus,
//     receiveWebSocketMessage,
//     updateRealtimeAnalysis,
//     updateAdvancedAnalytics
// } from '../store/slices/aiEngineSlice';

export interface WebSocketMessage {
    type: string;
    data: Record<string, unknown>;
    timestamp: number;
    roomId?: string;
    userId?: string;
}

export interface WebSocketConfig {
    url: string;
    reconnectAttempts: number;
    reconnectInterval: number;
    heartbeatInterval: number;
}

class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000;
    private clientId: string;

    constructor() {
        this.clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`ws://localhost:5000/ws/${this.clientId}`);

                this.ws.onopen = () => {
                    console.log('WebSocket 연결 성공');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('WebSocket 메시지 파싱 오류:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('WebSocket 연결 종료');
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket 오류:', error);
                    reject(error);
                };

            } catch (error) {
                console.error('WebSocket 연결 실패:', error);
                reject(error);
            }
        });
    }

    private handleMessage(data: {
        type: string;
        content?: string;
        timestamp?: number;
        model?: string;
        sentiment?: string;
        confidence?: number;
    }) {
        switch (data.type) {
            case 'ai_response':
                console.log('AI 응답 수신:', data.content);
                // 전역 이벤트로 AI 응답 전달
                window.dispatchEvent(new CustomEvent('aiResponse', {
                    detail: {
                        content: data.content,
                        timestamp: data.timestamp,
                        model: data.model
                    }
                }));
                break;
            case 'heartbeat_response':
                console.log('하트비트 응답 수신');
                break;
            case 'sentiment_result':
                console.log('감정 분석 결과:', data.sentiment);
                // 감정 분석 결과 전달
                window.dispatchEvent(new CustomEvent('sentimentResult', {
                    detail: {
                        sentiment: data.sentiment,
                        confidence: data.confidence
                    }
                }));
                break;
            default:
                console.log('알 수 없는 메시지 타입:', data.type);
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                this.connect().catch(() => {
                    this.attemptReconnect();
                });
            }, this.reconnectInterval);
        } else {
            console.error('WebSocket 재연결 최대 시도 횟수 초과');
        }
    }

    sendMessage(message: Record<string, unknown>): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket이 연결되지 않았습니다');
        }
    }

    sendChatMessage(content: string): void {
        this.sendMessage({
            type: 'chat',
            content: content,
            timestamp: new Date().toISOString()
        });
    }

    sendHeartbeat(): void {
        this.sendMessage({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
        });
    }

    sendSentimentAnalysis(text: string): void {
        this.sendMessage({
            type: 'sentiment_analysis',
            text: text,
            timestamp: new Date().toISOString()
        });
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    getClientId(): string {
        return this.clientId;
    }
}

const websocketService = new WebSocketService();
export default websocketService;
