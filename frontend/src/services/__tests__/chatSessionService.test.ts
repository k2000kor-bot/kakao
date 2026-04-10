/**
 * chatSessionService 테스트
 * 대화 세션 관리 서비스 기능 확인
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import chatSessionService, { CHAT_SESSIONS_STORAGE_KEY } from '../chatSessionService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// console 메서드 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('chatSessionService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('createChatSession', () => {
    it('대화 세션을 생성해야 함', async () => {
      const session = await chatSessionService.createChatSession();

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.title).toBeDefined();
      expect(session.messages.length).toBe(1);
      expect(session.messages[0].sender).toBe('ai');
    });

    it('제목을 지정할 수 있어야 함', async () => {
      const session = await chatSessionService.createChatSession('Test Title');

      expect(session.title).toBe('Test Title');
    });

    it('projectId를 지정할 수 있어야 함', async () => {
      const session = await chatSessionService.createChatSession(undefined, 'project-1');

      expect(session.projectId).toBe('project-1');
    });

    it('로컬 스토리지에 저장해야 함', async () => {
      await chatSessionService.createChatSession();

      const stored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
      expect(stored).not.toBeNull();
      
      const sessions = JSON.parse(stored!);
      expect(sessions.length).toBe(1);
    });
  });

  describe('loadChatSession', () => {
    it('대화 세션을 로드해야 함', async () => {
      const created = await chatSessionService.createChatSession('Test Session');
      const loaded = await chatSessionService.loadChatSession(created.id);

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(created.id);
      expect(loaded?.title).toBe('Test Session');
    });

    it('존재하지 않는 세션은 null을 반환해야 함', async () => {
      const loaded = await chatSessionService.loadChatSession('non-existent');

      expect(loaded).toBeNull();
    });
  });

  describe('loadAllChatSessions', () => {
    it('모든 대화 세션을 로드해야 함', async () => {
      await chatSessionService.createChatSession('Session 1');
      await chatSessionService.createChatSession('Session 2');

      const result = await chatSessionService.loadAllChatSessions();

      expect(result.sessions.length).toBe(2);
      expect(result.totalSessions).toBe(2);
    });

    it('세션이 없으면 빈 배열을 반환해야 함', async () => {
      const result = await chatSessionService.loadAllChatSessions();

      expect(result.sessions.length).toBe(0);
      expect(result.totalSessions).toBe(0);
    });

    it('localStorage에 잘못된 JSON이 있으면 빈 세션 목록을 반환해야 함', async () => {
      localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, 'not valid json');

      const result = await chatSessionService.loadAllChatSessions();

      expect(result.sessions).toEqual([]);
      expect(result.totalSessions).toBe(0);
      expect(result.lastUpdated).toBeDefined();
    });

    it('localStorage 루트가 객체(배열 아님)이면 빈 세션 목록을 반환해야 함', async () => {
      localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, '{}');

      const result = await chatSessionService.loadAllChatSessions();

      expect(result.sessions).toEqual([]);
      expect(result.totalSessions).toBe(0);
    });

    it('localStorage 루트가 null JSON이면 빈 세션 목록을 반환해야 함', async () => {
      localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, 'null');

      const result = await chatSessionService.loadAllChatSessions();

      expect(result.sessions).toEqual([]);
      expect(result.totalSessions).toBe(0);
    });

    it('손상된 루트 형식이어도 새 세션 생성이 동작해야 함', async () => {
      localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, '{}');

      const session = await chatSessionService.createChatSession('복구 후 세션');

      expect(session.title).toBe('복구 후 세션');
      const stored = JSON.parse(localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY)!);
      expect(Array.isArray(stored)).toBe(true);
      expect(stored).toHaveLength(1);
    });

    it('lastUpdated 필드를 포함해야 함', async () => {
      await chatSessionService.createChatSession('Test');
      const result = await chatSessionService.loadAllChatSessions();

      expect(result.lastUpdated).toBeDefined();
      expect(typeof result.lastUpdated).toBe('string');
    });
  });

  describe('addMessage', () => {
    it('메시지를 추가해야 함', async () => {
      const session = await chatSessionService.createChatSession();
      const message = {
        content: 'Test message',
        sender: 'user',
        timestamp: new Date().toISOString(),
        isUser: true,
        type: 'user_message' as const,
      };

      const updated = await chatSessionService.addMessage(session.id, message);

      expect(updated).not.toBeNull();
      expect(updated?.messages.length).toBe(2);
      expect(updated?.messages[1].content).toBe('Test message');
    });

    it('메시지 추가 시 messageCount·lastMessage·updatedAt이 갱신되어야 함', async () => {
      const session = await chatSessionService.createChatSession();
      const message = {
        content: '새 메시지',
        sender: 'user',
        timestamp: new Date().toISOString(),
        isUser: true,
        type: 'user_message' as const,
      };

      const updated = await chatSessionService.addMessage(session.id, message);

      expect(updated?.messageCount).toBe(2);
      expect(updated?.lastMessage).toBe('새 메시지');
      expect(updated?.updatedAt).toBeDefined();
    });

    it('존재하지 않는 세션에는 메시지를 추가할 수 없어야 함', async () => {
      const message = {
        content: 'Test message',
        sender: 'user',
        timestamp: new Date().toISOString(),
        isUser: true,
        type: 'user_message' as const,
      };

      const result = await chatSessionService.addMessage('non-existent', message);

      expect(result).toBeNull();
    });
  });

  describe('deleteChatSession', () => {
    it('대화 세션을 삭제해야 함', async () => {
      const session = await chatSessionService.createChatSession();
      const deleted = await chatSessionService.deleteChatSession(session.id);

      expect(deleted).toBe(true);

      const loaded = await chatSessionService.loadChatSession(session.id);
      expect(loaded).toBeNull();
    });

    it('존재하지 않는 세션 삭제는 true를 반환해야 함', async () => {
      const deleted = await chatSessionService.deleteChatSession('non-existent');

      expect(deleted).toBe(true);
    });
  });

  describe('updateChatTitle', () => {
    it('대화 제목을 업데이트해야 함', async () => {
      const session = await chatSessionService.createChatSession('Old Title');
      const updated = await chatSessionService.updateChatTitle(session.id, 'New Title');

      expect(updated).toBe(true);

      const loaded = await chatSessionService.loadChatSession(session.id);
      expect(loaded?.title).toBe('New Title');
    });

    it('존재하지 않는 세션은 업데이트할 수 없어야 함', async () => {
      const updated = await chatSessionService.updateChatTitle('non-existent', 'New Title');

      expect(updated).toBe(false);
    });
  });

  describe('getProjectChatSessions', () => {
    it('프로젝트별 대화 세션을 조회해야 함', async () => {
      await chatSessionService.createChatSession('Session 1', 'project-1');
      await chatSessionService.createChatSession('Session 2', 'project-1');
      await chatSessionService.createChatSession('Session 3', 'project-2');

      const sessions = await chatSessionService.getProjectChatSessions('project-1');

      expect(sessions.length).toBe(2);
      expect(sessions.every(s => s.projectId === 'project-1')).toBe(true);
    });

    it('프로젝트에 세션이 없으면 빈 배열을 반환해야 함', async () => {
      const sessions = await chatSessionService.getProjectChatSessions('project-999');

      expect(sessions.length).toBe(0);
    });
  });
});

