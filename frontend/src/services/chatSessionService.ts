import { resolveApiBaseUrl } from '../config/api';
import { ChatSession, Message, ChatList } from '../types/chat';
import { errorLogger } from '../utils/errorLogger';
import { CHAT_SESSIONS_STORAGE_KEY } from './chatSessionStorageKeys';

class ChatSessionService {
  private baseUrl = resolveApiBaseUrl();
  private localStorageKey = CHAT_SESSIONS_STORAGE_KEY;

  // 대화 세션 생성
  async createChatSession(title?: string, projectId?: string): Promise<ChatSession> {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const dateString = now.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });

    const session: ChatSession = {
      id: this.generateId(),
      title: title || `대화 분석 (${dateString} ${timeString})`,
      messages: [
        {
          id: this.generateId(),
          content: '안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isUser: false,
          type: 'ai_response'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId,
      type: 'general',
      parentChatId: undefined,
      childChatIds: [],
      status: 'active',
      lastActivity: new Date().toISOString(),
      totalMessages: 1,
      isPersistent: true,
      isActive: true,
      messageCount: 1,
      lastMessage: '안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?',
      participants: ['user', 'ai'],
      tags: [],
      metadata: {
        totalTokens: 0,
        averageResponseTime: 0,
        userSatisfaction: 0
      }
    };

    // 로컬 스토리지에 저장
    this.saveSessionToLocal(session);

    return session;
  }

  // 대화 세션 로드
  async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = this.getSessionsFromLocal();
      return sessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      errorLogger.error('대화 세션 로드 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'loadChatSession', sessionId });
      return null;
    }
  }

  // 모든 대화 세션 로드
  async loadAllChatSessions(): Promise<ChatList> {
    try {
      const sessions = this.getSessionsFromLocal();
      return {
        sessions,
        totalSessions: sessions.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      errorLogger.error('대화 세션 목록 로드 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'loadAllChatSessions' });
      return {
        sessions: [],
        totalSessions: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // 메시지 추가
  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<ChatSession | null> {
    try {
      const sessions = this.getSessionsFromLocal();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      const newMessage: Message = {
        ...message,
        id: this.generateId()
      };

      sessions[sessionIndex].messages.push(newMessage);
      sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
      sessions[sessionIndex].updatedAt = new Date().toISOString();
      sessions[sessionIndex].lastMessage = message.content;

      // 로컬 스토리지 업데이트
      localStorage.setItem(this.localStorageKey, JSON.stringify(sessions));

      return sessions[sessionIndex];
    } catch (error) {
      errorLogger.error('메시지 추가 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'addMessage', sessionId });
      return null;
    }
  }

  // 대화 세션 삭제
  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const sessions = this.getSessionsFromLocal();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);

      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredSessions));
      return true;
    } catch (error) {
      errorLogger.error('대화 세션 삭제 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'deleteChatSession', sessionId });
      return false;
    }
  }

  // 대화 세션 제목 업데이트
  async updateChatTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const sessions = this.getSessionsFromLocal();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return false;

      sessions[sessionIndex].title = title;
      sessions[sessionIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(this.localStorageKey, JSON.stringify(sessions));
      return true;
    } catch (error) {
      errorLogger.error('대화 제목 업데이트 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'updateChatTitle', sessionId });
      return false;
    }
  }

  // 프로젝트별 대화 세션 조회
  async getProjectChatSessions(projectId: string): Promise<ChatSession[]> {
    try {
      const sessions = this.getSessionsFromLocal();
      return sessions.filter(session => session.projectId === projectId);
    } catch (error) {
      errorLogger.error('프로젝트 대화 세션 조회 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'getProjectChatSessions', projectId });
      return [];
    }
  }

  // 로컬 스토리지에서 세션 목록 가져오기
  private getSessionsFromLocal(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed as ChatSession[];
    } catch (error) {
      errorLogger.error('로컬 스토리지 읽기 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'getSessionsFromLocal' });
      return [];
    }
  }

  // 로컬 스토리지에 세션 저장
  private saveSessionToLocal(session: ChatSession): void {
    try {
      const sessions = this.getSessionsFromLocal();
      sessions.push(session);
      localStorage.setItem(this.localStorageKey, JSON.stringify(sessions));
    } catch (error) {
      errorLogger.error('로컬 스토리지 저장 오류', error instanceof Error ? error : new Error(String(error)), { component: 'ChatSessionService', action: 'saveSessionToLocal' });
    }
  }

  // 고유 ID 생성
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export { CHAT_SESSIONS_STORAGE_KEY } from './chatSessionStorageKeys';

const chatSessionService = new ChatSessionService();
export default chatSessionService;
