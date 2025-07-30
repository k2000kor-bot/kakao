import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
    type: string;
    content?: string;
    title?: string;
    room_id?: string;
    timestamp: string;
    [key: string]: any;
}

interface WebSocketHookOptions {
    url?: string;
    clientId: string;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

interface WebSocketHookReturn {
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    messages: WebSocketMessage[];  // messages 배열 추가
    sendMessage: (message: any) => void;
    subscribeToRoom: (roomId: string) => void;
    disconnect: () => void;
    reconnect: () => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    error: string | null;
}

export const useWebSocket = (options: WebSocketHookOptions): WebSocketHookReturn => {
    const {
        url = 'ws://localhost:8004',
        clientId,
        autoReconnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);  // messages 상태 추가
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);

    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

    // 하트비트 전송
    const sendHeartbeat = useCallback(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            }));
        }
    }, []);

    // 하트비트 시작
    const startHeartbeat = useCallback(() => {
        if (heartbeatTimer.current) {
            clearInterval(heartbeatTimer.current);
        }
        heartbeatTimer.current = setInterval(sendHeartbeat, 30000); // 30초마다
    }, [sendHeartbeat]);

    // 하트비트 중지
    const stopHeartbeat = useCallback(() => {
        if (heartbeatTimer.current) {
            clearInterval(heartbeatTimer.current);
            heartbeatTimer.current = null;
        }
    }, []);

    // WebSocket 연결
    const connect = useCallback(() => {
        try {
            setConnectionStatus('connecting');
            setError(null);

            const websocketUrl = `${url}/ws/${clientId}`;
            ws.current = new WebSocket(websocketUrl);

            ws.current.onopen = () => {
                console.log('WebSocket 연결됨:', clientId);
                setIsConnected(true);
                setConnectionStatus('connected');
                setError(null);
                reconnectAttempts.current = 0;
                startHeartbeat();
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);
                    
                    // messages 배열에 새 메시지 추가
                    setMessages(prev => [...prev, message]);

                    // 특별한 메시지 타입 처리
                    if (message.type === 'heartbeat_response') {
                        // 하트비트 응답은 로그만 남기기
                        console.log('Heartbeat response received');
                        return;
                    }

                    console.log('WebSocket 메시지 수신:', message);

                    // 브라우저 알림 (권한이 있는 경우)
                    if (message.type === 'room_notification' || message.type === 'broadcast_notification') {
                        if (Notification.permission === 'granted') {
                            new Notification(message.title || '알림', {
                                body: message.content || '',
                                icon: '/favicon.ico',
                                tag: message.type
                            });
                        }
                    }
                } catch (e) {
                    console.error('WebSocket 메시지 파싱 오류:', e);
                }
            };

            ws.current.onclose = () => {
                console.log('WebSocket 연결 종료');
                setIsConnected(false);
                setConnectionStatus('disconnected');
                stopHeartbeat();

                // 자동 재연결
                if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    console.log(`재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);

                    reconnectTimer.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket 오류:', error);
                setError('WebSocket 연결 오류가 발생했습니다.');
                setConnectionStatus('error');
                stopHeartbeat();
            };

        } catch (e) {
            console.error('WebSocket 연결 실패:', e);
            setError('WebSocket 연결을 생성할 수 없습니다.');
            setConnectionStatus('error');
        }
    }, [url, clientId, autoReconnect, maxReconnectAttempts, reconnectInterval, startHeartbeat, stopHeartbeat]);

    // 메시지 전송
    const sendMessage = useCallback((message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                ws.current.send(JSON.stringify(message));
                console.log('WebSocket 메시지 전송:', message);
            } catch (e) {
                console.error('메시지 전송 실패:', e);
                setError('메시지 전송에 실패했습니다.');
            }
        } else {
            console.warn('WebSocket이 연결되지 않았습니다.');
            setError('WebSocket이 연결되지 않았습니다.');
        }
    }, []);

    // 채팅방 구독
    const subscribeToRoom = useCallback((roomId: string) => {
        sendMessage({
            type: 'subscribe_room',
            room_id: roomId,
            timestamp: new Date().toISOString()
        });
    }, [sendMessage]);

    // 연결 해제
    const disconnect = useCallback(() => {
        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
        }

        stopHeartbeat();

        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
    }, [stopHeartbeat]);

    // 수동 재연결
    const reconnect = useCallback(() => {
        disconnect();
        reconnectAttempts.current = 0;
        setTimeout(connect, 1000);
    }, [disconnect, connect]);

    // 초기 연결 및 정리
    useEffect(() => {
        // 브라우저 알림 권한 요청
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        connect();

        // 컴포넌트 언마운트 시 정리
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // 페이지 가시성 변경 시 재연결 관리
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !isConnected) {
                reconnect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isConnected, reconnect]);

    return {
        isConnected,
        lastMessage,
        messages,  // messages 반환
        sendMessage,
        subscribeToRoom,
        disconnect,
        reconnect,
        connectionStatus,
        error
    };
}; 