/**
 * 대화 히스토리 및 컨텍스트 관리 서비스
 */

import { errorLogger } from '../utils/errorLogger';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    modelUsed?: string;
    tokensUsed?: number;
    processingTime?: number;
    confidence?: number;
  };
}

export interface ConversationContext {
  id: string;
  projectId?: string;
  title: string;
  messages: ConversationMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata?: Record<string, any>;
}

class ConversationHistoryService {
  private static instance: ConversationHistoryService;
  private conversations: Map<string, ConversationContext> = new Map();
  private readonly storageKey = 'conversationHistory';
  private readonly maxContextLength = 8000; // 최대 컨텍스트 길이 (토큰)

  constructor() {
    this.loadConversations();
  }

  public static getInstance(): ConversationHistoryService {
    if (!ConversationHistoryService.instance) {
      ConversationHistoryService.instance = new ConversationHistoryService();
    }
    return ConversationHistoryService.instance;
  }

  /**
   * 새 대화 생성
   */
  createConversation(
    title: string,
    projectId?: string,
    initialMessage?: ConversationMessage
  ): ConversationContext {
    const conversation: ConversationContext = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title,
      messages: initialMessage ? [initialMessage] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    this.conversations.set(conversation.id, conversation);
    this.saveConversations();

    return conversation;
  }

  /**
   * 메시지 추가
   */
  addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): ConversationMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`대화를 찾을 수 없습니다: ${conversationId}`);
    }

    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();

    // 컨텍스트 길이 관리
    this.manageContextLength(conversation);

    this.conversations.set(conversationId, conversation);
    this.saveConversations();

    return newMessage;
  }

  /**
   * 컨텍스트 길이 관리 (최근 메시지 우선 유지)
   */
  private manageContextLength(conversation: ConversationContext): void {
    let totalLength = conversation.messages.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content),
      0
    );

    // 시스템 메시지 제외
    const systemMessages = conversation.messages.filter(m => m.role === 'system');
    const userAssistantMessages = conversation.messages.filter(m => m.role !== 'system');

    if (totalLength > this.maxContextLength) {
      // 오래된 메시지부터 제거 (시스템 메시지 제외)
      const messagesToKeep: ConversationMessage[] = [...systemMessages];
      let currentLength = systemMessages.reduce((sum, msg) => sum + this.estimateTokens(msg.content), 0);

      // 최근 메시지부터 유지
      for (let i = userAssistantMessages.length - 1; i >= 0; i--) {
        const msg = userAssistantMessages[i];
        const msgLength = this.estimateTokens(msg.content);

        if (currentLength + msgLength <= this.maxContextLength) {
          messagesToKeep.unshift(msg);
          currentLength += msgLength;
        } else {
          break;
        }
      }

      conversation.messages = messagesToKeep;
    }
  }

  /**
   * 토큰 수 추정
   */
  private estimateTokens(text: string): number {
    // 대략적인 추정: 1 토큰 ≈ 4 문자
    return Math.ceil(text.length / 4);
  }

  /**
   * 대화 조회
   */
  getConversation(id: string): ConversationContext | null {
    return this.conversations.get(id) || null;
  }

  /**
   * 대화 목록 조회
   */
  getConversations(projectId?: string): ConversationContext[] {
    let conversations = Array.from(this.conversations.values());

    if (projectId) {
      conversations = conversations.filter(c => c.projectId === projectId);
    }

    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * 대화 요약 생성
   */
  generateSummary(conversationId: string): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return '';
    }

    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');

    if (userMessages.length === 0) {
      return '대화가 없습니다.';
    }

    const firstUserMessage = userMessages[0].content;
    const summary = firstUserMessage.length > 100
      ? firstUserMessage.substring(0, 100) + '...'
      : firstUserMessage;

    return summary;
  }

  /**
   * 대화 업데이트
   */
  updateConversation(id: string, updates: Partial<ConversationContext>): ConversationContext | null {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      return null;
    }

    const updated: ConversationContext = {
      ...conversation,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.conversations.set(id, updated);
    this.saveConversations();

    return updated;
  }

  /**
   * 대화 삭제
   */
  deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      this.saveConversations();
    }
    return deleted;
  }

  /**
   * 컨텍스트 추출 (LLM에 전달할 형식)
   */
  getContextForLLM(conversationId: string, maxMessages?: number): Array<{ role: string; content: string }> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    let messages = conversation.messages;
    if (maxMessages) {
      messages = messages.slice(-maxMessages);
    }

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * 대화 저장
   */
  private saveConversations(): void {
    try {
      const conversationsArray = Array.from(this.conversations.values());
      localStorage.setItem(this.storageKey, JSON.stringify(conversationsArray));
    } catch (error) {
      errorLogger.error('대화 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'ConversationHistoryService',
        action: 'saveConversations',
      });
    }
  }

  /**
   * 대화 로드
   */
  private loadConversations(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const conversationsArray: ConversationContext[] = JSON.parse(stored);
        conversationsArray.forEach(conversation => {
          this.conversations.set(conversation.id, conversation);
        });
      }
    } catch (error) {
      errorLogger.error('대화 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'ConversationHistoryService',
        action: 'loadConversations',
      });
    }
  }
}

export const conversationHistoryService = ConversationHistoryService.getInstance();
export default conversationHistoryService;

