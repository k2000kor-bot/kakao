import { useState, useEffect, useRef, useCallback } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';

export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface WebSocketStatus {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    reconnectAttempts: number;
}

interface WebSocketHook {
  sendMessage: ((message: string) => void) | null;
  lastMessage: string | null;
  connectionStatus: 'Connecting' | 'Connected' | 'Disconnected';
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useWebSocket = (url: string): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Connecting');
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('Connected');
        setError(null);
      };

      ws.onmessage = (event) => {
        setLastMessage(event.data);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('Disconnected');
        
        if (!event.wasClean) {
          setError('연결이 예기치 않게 끊어졌습니다.');
          // 자동 재연결
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket 연결 오류가 발생했습니다.');
        setIsConnecting(false);
        setConnectionStatus('Disconnected');
      };
    } catch (err) {
      setError('WebSocket 연결을 생성할 수 없습니다.');
      setIsConnecting(false);
      setConnectionStatus('Disconnected');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionStatus('Disconnected');
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      setError('연결이 끊어져 메시지를 보낼 수 없습니다.');
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage: isConnected ? sendMessage : null,
    lastMessage,
    connectionStatus,
    isConnected,
    isConnecting,
    error,
    reconnect
  };
};

// 채팅 메시지 관리
export const useChatMessages = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const wsManager = advancedMessageAPI.getWebSocketManager();

    useEffect(() => {
        const handleMessage = (data: any) => {
            if (data.type === 'message') {
                const newMessage: ChatMessage = {
                    id: data.id || `msg_${Date.now()}`,
                    type: data.role === 'assistant' ? 'assistant' : 'user',
                    content: data.content,
                    timestamp: data.timestamp || new Date().toISOString(),
                };

                setMessages(prev => [...prev, newMessage]);
            }
        };

        const handleFileUpload = (data: any) => {
            if (data.type === 'file_upload') {
                const uploadMessage: ChatMessage = {
                    id: `upload_${Date.now()}`,
                    type: 'assistant',
                    content: `파일 "${data.file_name}" 업로드 완료`,
                    timestamp: new Date().toISOString(),
                };

                setMessages(prev => [...prev, uploadMessage]);
            }
        };

        const handleAnalysis = (data: any) => {
            if (data.type === 'analysis') {
                const analysisMessage: ChatMessage = {
                    id: `analysis_${Date.now()}`,
                    type: 'assistant',
                    content: `분석 결과: ${data.summary || '분석이 완료되었습니다.'}`,
                    timestamp: new Date().toISOString(),
                };

                setMessages(prev => [...prev, analysisMessage]);
            }
        };

        // 이벤트 리스너 등록
        wsManager.on('message', handleMessage);
        wsManager.on('file_upload', handleFileUpload);
        wsManager.on('analysis', handleAnalysis);

        return () => {
            wsManager.off('message', handleMessage);
            wsManager.off('file_upload', handleFileUpload);
            wsManager.off('analysis', handleAnalysis);
        };
    }, [wsManager]);

    const sendMessage = useCallback((content: string, projectId?: string) => {
        const message = {
            type: 'chat_message',
            content,
            project_id: projectId,
            timestamp: new Date().toISOString(),
        };

        // 즉시 사용자 메시지 추가
        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);

        // WebSocket으로 전송
        advancedMessageAPI.sendWebSocketMessage(message);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sendMessage,
        clearMessages,
    };
};

// 파일 업로드 진행상황 관리
export const useFileUploadProgress = () => {
    const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
    const [uploadStatus, setUploadStatus] = useState<Map<string, string>>(new Map());
    const wsManager = advancedMessageAPI.getWebSocketManager();

    useEffect(() => {
        const handleUploadProgress = (data: any) => {
            if (data.type === 'file_upload_progress') {
                setUploadProgress(prev => new Map(prev.set(data.file_id, data.progress)));
                setUploadStatus(prev => new Map(prev.set(data.file_id, data.status)));
            }
        };

        wsManager.on('file_upload_progress', handleUploadProgress);

        return () => {
            wsManager.off('file_upload_progress', handleUploadProgress);
        };
    }, [wsManager]);

    const getProgress = useCallback((fileId: string) => {
        return uploadProgress.get(fileId) || 0;
    }, [uploadProgress]);

    const getStatus = useCallback((fileId: string) => {
        return uploadStatus.get(fileId) || 'pending';
    }, [uploadStatus]);

    const clearProgress = useCallback((fileId: string) => {
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
        setUploadStatus(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, []);

    return {
        getProgress,
        getStatus,
        clearProgress,
    };
}; 