/**
 * chatSessionService 테스트
 * 채팅 세션 관리 서비스 기능 확인
 */

import chatSessionService from '../chatSessionService';

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
    it('채팅 세션을 생성해야 함', async () => {
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

      const stored = localStorage.getItem('corbu_chat_sessions');
      expect(stored).not.toBeNull();
      
      const sessions = JSON.parse(stored!);
      expect(sessions.length).toBe(1);
    });
  });

  describe('loadChatSession', () => {
    it('채팅 세션을 로드해야 함', async () => {
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
    it('모든 채팅 세션을 로드해야 함', async () => {
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
    it('채팅 세션을 삭제해야 함', async () => {
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
    it('채팅 제목을 업데이트해야 함', async () => {
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
    it('프로젝트별 채팅 세션을 조회해야 함', async () => {
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

