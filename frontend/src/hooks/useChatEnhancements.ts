/**
 * 대화 경험 향상 훅
 * Task-C 시리즈: 대화 경험 업그레이드
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import realTimeSync, { type SyncEvent } from '../services/realTimeSync';
import recommendationService from '../services/recommendationService';
import { errorLogger } from '../utils/errorLogger';

export interface ChatEnhancementConfig {
  enableSmartSuggestions?: boolean;
  enableRealTimeSync?: boolean;
  enableTypingIndicators?: boolean;
  enableReadReceipts?: boolean;
  enableReactions?: boolean;
  enableQuickReplies?: boolean;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface MessageReaction {
  messageId: string;
  userId: string;
  reaction: string;
  timestamp: Date;
}

export interface QuickReply {
  id: string;
  text: string;
  category: string;
}

const useChatEnhancements = (config: ChatEnhancementConfig = {}) => {
  const {
    enableSmartSuggestions = true,
    enableRealTimeSync = true,
    enableTypingIndicators = true,
    enableReadReceipts = true,
    enableReactions = true,
    enableQuickReplies = true,
  } = config;

  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [readReceipts, setReadReceipts] = useState<Map<string, ReadReceipt[]>>(new Map());
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map());
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 읽음 확인 처리 (useEffect 이전에 정의)
  const handleReadReceipt = useCallback(
    (receipt: ReadReceipt) => {
      if (!enableReadReceipts) return;

      setReadReceipts((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(receipt.messageId) || [];
        const updated = [...existing.filter((r) => r.userId !== receipt.userId), receipt];
        newMap.set(receipt.messageId, updated);
        return newMap;
      });
    },
    [enableReadReceipts]
  );

  // 반응 처리 (useEffect 이전에 정의)
  const handleReaction = useCallback(
    (reaction: MessageReaction) => {
      if (!enableReactions) return;

      setReactions((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(reaction.messageId) || [];
        const updated = existing.filter(
          (r) => !(r.userId === reaction.userId && r.reaction === reaction.reaction)
        );
        updated.push(reaction);
        newMap.set(reaction.messageId, updated);
        return newMap;
      });
    },
    [enableReactions]
  );

  // 실시간 동기화 설정
  useEffect(() => {
    if (!enableRealTimeSync) return;

    const handleSyncEvent = (event: SyncEvent) => {
      if (event.type === 'typing') {
        const typingIndicator: TypingIndicator = {
          userId: event.userId ?? event.id ?? 'unknown',
          userName: (event.data?.userName as string) ?? '사용자',
          timestamp: new Date(event.timestamp ?? Date.now()),
        };

        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.userId !== typingIndicator.userId);
          return [...filtered, typingIndicator];
        });

        // 3초 후 자동 제거
        const timeoutId = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== typingIndicator.userId));
        }, 3000);

        typingTimeoutRef.current.set(typingIndicator.userId, timeoutId);
      } else if (event.type === 'update' && event.data) {
        const data = event.data;
        if (data.readReceipt) {
          handleReadReceipt(data.readReceipt as ReadReceipt);
        }
        if (data.reaction) {
          handleReaction(data.reaction as MessageReaction);
        }
      }
    };

    // realTimeSync의 on 메서드 사용
    const unsubscribeTyping = realTimeSync.on('typing', handleSyncEvent);
    const unsubscribeUpdate = realTimeSync.on('update', handleSyncEvent);
    const unsubscribePresence = realTimeSync.on('presence', handleSyncEvent);

    realTimeSync.configure({
      enabled: true,
      syncInterval: 1000,
      onSync: (event) => {
        if (process.env.NODE_ENV === 'development') {
          errorLogger.info('Sync event', { component: 'useChatEnhancements', action: 'onSync', event });
        }
      },
      onError: (error) => {
        // 에러는 항상 로깅
        errorLogger.error('Real-time sync error', error instanceof Error ? error : new Error(String(error)), { component: 'useChatEnhancements', action: 'onError' });
      },
    });

    return () => {
      unsubscribeTyping();
      unsubscribeUpdate();
      unsubscribePresence();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
      // smartSuggestionsDebounceRef는 현재 사용하지 않음
      // if (smartSuggestionsDebounceRef.current) {
      //   clearTimeout(smartSuggestionsDebounceRef.current);
      //   smartSuggestionsDebounceRef.current = null;
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableRealTimeSync, handleReadReceipt, handleReaction]);

  // 타이핑 상태 전송
  const sendTypingIndicator = useCallback(
    (isTyping: boolean, userName: string = '나') => {
      if (!enableRealTimeSync || !enableTypingIndicators) return;

      // 기존 타이머 취소
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }

      // 디바운싱: 500ms 후에 전송
      typingDebounceRef.current = setTimeout(() => {
        realTimeSync.sendEvent({
          type: 'typing',
          id: `typing-${Date.now()}`,
          data: {
            isTyping,
            userName,
          },
          userId: 'current-user',
        });
        typingDebounceRef.current = null;
      }, 500);

      realTimeSync.sendEvent({
        type: 'typing',
        id: `typing-${Date.now()}`,
        data: {
          isTyping,
          userName,
        },
        userId: 'current-user',
      });
    },
    [enableRealTimeSync, enableTypingIndicators]
  );

  // 읽음 확인 전송
  const sendReadReceipt = useCallback(
    (messageId: string) => {
      if (!enableRealTimeSync || !enableReadReceipts) return;

      const receipt: ReadReceipt = {
        messageId,
        userId: 'current-user',
        readAt: new Date(),
      };

      realTimeSync.sendEvent({
        type: 'update',
        id: `read-${Date.now()}`,
        data: {
          readReceipt: receipt,
        },
      });

      handleReadReceipt(receipt);
    },
    [enableRealTimeSync, enableReadReceipts, handleReadReceipt]
  );

  // 반응 전송
  const sendReaction = useCallback(
    (messageId: string, reaction: string) => {
      if (!enableRealTimeSync || !enableReactions) return;

      const messageReaction: MessageReaction = {
        messageId,
        userId: 'current-user',
        reaction,
        timestamp: new Date(),
      };

      realTimeSync.sendEvent({
        type: 'update',
        id: `reaction-${Date.now()}`,
        data: {
          reaction: messageReaction,
        },
      });

      handleReaction(messageReaction);
    },
    [enableRealTimeSync, enableReactions, handleReaction]
  );

  // 스마트 제안 생성
  const generateSmartSuggestions = useCallback(
    (currentMessage: string) => {
      if (!enableSmartSuggestions) return;

      // 기존 타이머 취소
      // smartSuggestionsDebounceRef는 현재 사용하지 않음
      // if (smartSuggestionsDebounceRef.current) {
      //   clearTimeout(smartSuggestionsDebounceRef.current);
      // }

      // 디바운싱: 800ms 후에 생성
      // smartSuggestionsDebounceRef는 현재 사용하지 않음
      setTimeout(() => {
        const suggestions = recommendationService.generateSmartSuggestions(currentMessage);
        setSmartSuggestions(suggestions);
      }, 800);
    },
    [enableSmartSuggestions]
  );

  // 빠른 답장 생성
  const generateQuickReplies = useCallback(
    (context: string) => {
      if (!enableQuickReplies) return [];

      const contextualRecs = recommendationService.getContextualRecommendations(context, 3);
      const quickReplies: QuickReply[] = contextualRecs.map((rec, index) => ({
        id: `quick-${index}`,
        text: rec.title,
        category: rec.category,
      }));

      setQuickReplies(quickReplies);
      return quickReplies;
    },
    [enableQuickReplies]
  );

  // 메시지 반응 가져오기
  const getMessageReactions = useCallback(
    (messageId: string): MessageReaction[] => {
      return reactions.get(messageId) || [];
    },
    [reactions]
  );

  // 메시지 읽음 확인 가져오기
  const getMessageReadReceipts = useCallback(
    (messageId: string): ReadReceipt[] => {
      return readReceipts.get(messageId) || [];
    },
    [readReceipts]
  );

  // 타이핑 중인 사용자 목록
  const getTypingUsers = useCallback((): TypingIndicator[] => {
    return typingUsers.filter((user) => {
      const timeDiff = Date.now() - user.timestamp.getTime();
      return timeDiff < 3000; // 3초 이내만 유효
    });
  }, [typingUsers]);

  return {
    // 상태
    typingUsers: getTypingUsers(),
    readReceipts,
    reactions,
    quickReplies,
    smartSuggestions,

    // 액션
    sendTypingIndicator,
    sendReadReceipt,
    sendReaction,
    generateSmartSuggestions,
    generateQuickReplies,

    // 조회
    getMessageReactions,
    getMessageReadReceipts,
    getTypingUsers,
  };
};

export default useChatEnhancements;
