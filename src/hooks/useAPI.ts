import { useState, useCallback, useEffect } from 'react';
import { chatAPI, aiAPI, wsClient, APIResponse, ChatMessage, ChatRoom, AISystem } from '../services/api';
import { useNotifications } from '../context/AppContext';

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// API 훅 기본 타입
export interface APIHookState<T> extends LoadingState {
  data: T | null;
  refetch: () => Promise<void>;
}

// 채팅 API 훅
export const useChatAPI = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, error: null });
  const { addNotification } = useNotifications();

  // 채팅방 목록 조회
  const fetchChatRooms = useCallback(async () => {
    setLoading({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getChatRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        throw new Error(response.error || '채팅방 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setLoading({ isLoading: false, error: errorMessage });
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
    } finally {
      setLoading({ isLoading: false, error: null });
    }
  }, [addNotification]);

  // 메시지 조회
  const fetchMessages = useCallback(async (roomId: string) => {
    setLoading({ isLoading: true, error: null });
    try {
      const response = await chatAPI.getMessages(roomId);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        throw new Error(response.error || '메시지를 불러올 수 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setLoading({ isLoading: false, error: errorMessage });
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
    } finally {
      setLoading({ isLoading: false, error: null });
    }
  }, [addNotification]);

  // 메시지 전송
  const sendMessage = useCallback(async (roomId: string, content: string, sender: 'user' | 'ai' | 'system' = 'user') => {
    try {
      const messageData = {
        content,
        sender,
        type: 'text' as const,
        metadata: {}
      };

      const response = await chatAPI.sendMessage(roomId, messageData);
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        addNotification({
          type: 'success',
          title: '메시지 전송',
          message: '메시지가 성공적으로 전송되었습니다.'
        });
        return response.data;
      } else {
        throw new Error(response.error || '메시지 전송에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // AI 응답 생성
  const generateAIResponse = useCallback(async (message: string, systemId?: string) => {
    try {
      const response = await chatAPI.generateAIResponse(message, systemId);
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        addNotification({
          type: 'success',
          title: 'AI 응답',
          message: 'AI 응답이 생성되었습니다.'
        });
        return response.data;
      } else {
        throw new Error(response.error || 'AI 응답 생성에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 응답 생성에 실패했습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // 채팅방 생성
  const createChatRoom = useCallback(async (roomData: Omit<ChatRoom, 'id' | 'unreadCount' | 'lastMessageTime'>) => {
    try {
      const response = await chatAPI.createChatRoom(roomData);
      if (response.success && response.data) {
        setRooms(prev => [...prev, response.data!]);
        addNotification({
          type: 'success',
          title: '채팅방 생성',
          message: '새 채팅방이 생성되었습니다.'
        });
        return response.data;
      } else {
        throw new Error(response.error || '채팅방 생성에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '채팅방 생성에 실패했습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // 초기 로드
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    rooms,
    messages,
    loading,
    fetchChatRooms,
    fetchMessages,
    sendMessage,
    generateAIResponse,
    createChatRoom,
  };
};

// AI 시스템 API 훅
export const useAIAPI = () => {
  const [aiSystems, setAiSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, error: null });
  const { addNotification } = useNotifications();

  // AI 시스템 목록 조회
  const fetchAISystems = useCallback(async () => {
    setLoading({ isLoading: true, error: null });
    try {
      const response = await aiAPI.getAISystems();
      if (response.success && response.data) {
        setAiSystems(response.data);
      } else {
        throw new Error(response.error || 'AI 시스템 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setLoading({ isLoading: false, error: errorMessage });
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
    } finally {
      setLoading({ isLoading: false, error: null });
    }
  }, [addNotification]);

  // AI 시스템 토글
  const toggleAISystem = useCallback(async (systemId: string, isActive: boolean) => {
    try {
      const response = await aiAPI.toggleAISystem(systemId, isActive);
      if (response.success && response.data) {
        setAiSystems(prev => prev.map(system => 
          system.id === systemId ? response.data! : system
        ));
        addNotification({
          type: 'success',
          title: 'AI 시스템',
          message: `${response.data.name}이(가) ${isActive ? '활성화' : '비활성화'}되었습니다.`
        });
        return response.data;
      } else {
        throw new Error(response.error || 'AI 시스템 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 시스템 상태 변경에 실패했습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // AI 시스템 성능 조회
  const getSystemPerformance = useCallback(async (systemId: string) => {
    try {
      const response = await aiAPI.getSystemPerformance(systemId);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '시스템 성능 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '시스템 성능 정보를 불러올 수 없습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // AI 응답 테스트
  const testAIResponse = useCallback(async (systemId: string, input: string) => {
    try {
      const response = await aiAPI.testAIResponse(systemId, input);
      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'AI 테스트',
          message: 'AI 응답 테스트가 완료되었습니다.'
        });
        return response.data;
      } else {
        throw new Error(response.error || 'AI 응답 테스트에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI 응답 테스트에 실패했습니다.';
      addNotification({
        type: 'error',
        title: '오류',
        message: errorMessage
      });
      throw error;
    }
  }, [addNotification]);

  // 초기 로드
  useEffect(() => {
    fetchAISystems();
  }, [fetchAISystems]);

  return {
    aiSystems,
    loading,
    fetchAISystems,
    toggleAISystem,
    getSystemPerformance,
    testAIResponse,
  };
};

// WebSocket 훅
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { addNotification } = useNotifications();

  const connect = useCallback((url: string) => {
    wsClient.connect(
      (data) => {
        setLastMessage(data);
        // 실시간 메시지 처리
        if (data.type === 'message') {
          addNotification({
            type: 'info',
            title: '실시간 메시지',
            message: data.content
          });
        }
      },
      (error) => {
        console.error('WebSocket 오류:', error);
        setIsConnected(false);
        addNotification({
          type: 'error',
          title: '연결 오류',
          message: '실시간 연결에 문제가 발생했습니다.'
        });
      }
    );
    setIsConnected(true);
  }, [addNotification]);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data: any) => {
    wsClient.send(data);
  }, []);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
}; 