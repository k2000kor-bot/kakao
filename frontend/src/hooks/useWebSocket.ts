/**
 * WebSocket 훅
 * 실시간 통신을 위한 WebSocket 연결 관리
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { joinApiBaseAndPath, WS_CHAT_ROOM_PATH_PREFIX } from '../config/api';
import { errorLogger } from '../utils/errorLogger';

interface UseWebSocketOptions {
  url: string;
  roomId?: string;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: string | Record<string, unknown>) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    roomId = 'default',
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect: shouldReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(shouldReconnect);
  const urlRef = useRef(url);
  const roomIdRef = useRef(roomId);

  // URL과 roomId가 변경되면 ref 업데이트
  useEffect(() => {
    urlRef.current = url;
    roomIdRef.current = roomId;
  }, [url, roomId]);

  const connect = useCallback(() => {
    try {
      const wsUrl = joinApiBaseAndPath(
        urlRef.current,
        `${WS_CHAT_ROOM_PATH_PREFIX}/${encodeURIComponent(roomIdRef.current)}`
      );
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        errorLogger.info('[WebSocket] 연결됨', {
          component: 'useWebSocket',
          action: 'connect',
          url: wsUrl,
          roomId,
        });
        setIsConnected(true);
        setSocket(ws);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          // 문자열 메시지인 경우
          onMessage?.(event.data);
        }
      };

      ws.onerror = (error) => {
        errorLogger.error('[WebSocket] 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'useWebSocket',
          action: 'websocketError',
          url: wsUrl,
          roomId,
        });
        onError?.(error);
      };

      ws.onclose = () => {
        errorLogger.info('[WebSocket] 연결 종료', {
          component: 'useWebSocket',
          action: 'close',
          url: wsUrl,
          roomId,
        });
        setIsConnected(false);
        setSocket(null);
        onClose?.();

        // 자동 재연결
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            errorLogger.info('[WebSocket] 재연결 시도...', {
              component: 'useWebSocket',
              action: 'reconnect',
              url: wsUrl,
              roomId,
            });
            connect();
          }, reconnectInterval);
        }
      };

      return ws;
    } catch (error) {
      const wsUrl = joinApiBaseAndPath(
        urlRef.current,
        `${WS_CHAT_ROOM_PATH_PREFIX}/${encodeURIComponent(roomIdRef.current)}`,
      );
      errorLogger.error('[WebSocket] 연결 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'useWebSocket',
        action: 'connect',
        url: wsUrl,
        roomId: roomIdRef.current,
      });
      setIsConnected(false);
      return null;
    }
  }, [onMessage, onError, onOpen, onClose, reconnectInterval, roomId]);

  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect;
  }, [shouldReconnect]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: string | Record<string, unknown>) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        socket.send(data);
      } else {
        errorLogger.warn('[WebSocket] 연결되지 않음, 메시지 전송 실패', {
          component: 'useWebSocket',
          action: 'sendMessage',
          roomId,
        });
      }
    },
    [socket, roomId]
  );

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roomId omitted for stable callback
  }, [socket]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      shouldReconnectRef.current = true;
      connect();
    }, 1000);
  }, [disconnect, connect]);

  return {
    socket,
    isConnected,
    sendMessage,
    disconnect,
    reconnect,
  };
};

export default useWebSocket;

