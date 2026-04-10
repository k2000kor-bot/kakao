/**
 * PersistentChatSessionService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  PersistentChatSessionService,
  parsePersistentChatSessionsJson,
} from '../persistentChatSessionService';
import { ChatSession, Message } from '../../types/chat';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

describe('parsePersistentChatSessionsJson', () => {
  it('배열 루트는 빈 맵으로 처리한다', () => {
    expect(parsePersistentChatSessionsJson('[]')).toEqual({});
  });

  it('null 루트는 빈 맵으로 처리한다', () => {
    expect(parsePersistentChatSessionsJson('null')).toEqual({});
  });

  it('손상된 JSON은 빈 맵으로 처리한다', () => {
    expect(parsePersistentChatSessionsJson('{not')).toEqual({});
  });

  it('빈 객체는 그대로이다', () => {
    expect(parsePersistentChatSessionsJson('{}')).toEqual({});
  });

  it('배열 루트 다음 저장 시 병합할 빈 맵과 동일하게 처리된다', () => {
    const fromArray = parsePersistentChatSessionsJson('[]');
    expect(fromArray).toEqual({});
    const sid = 'persistent_1_1';
    const merged = { ...fromArray, [sid]: { id: sid } };
    expect(Array.isArray(merged)).toBe(false);
    expect(merged[sid]).toBeDefined();
  });
});

// fetch 모킹
installJestFetchMock();

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.console.error = jest.fn();
global.console.log = jest.fn();

describe('PersistentChatSessionService', () => {
  let service: PersistentChatSessionService;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch = jest.mocked(global.fetch);
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    localStorageMock.clear();
    service = PersistentChatSessionService.getInstance();
    // 싱글톤 인스턴스의 세션 초기화
    (service as unknown as { sessions: Map<string, unknown> }).sessions.clear();
    (service as unknown as { sessionCounter: number }).sessionCounter = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
    mockDateNow.mockRestore();
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('싱글톤 인스턴스 생성', () => {
      const instance1 = PersistentChatSessionService.getInstance();
      const instance2 = PersistentChatSessionService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('기본 설정 확인', () => {
      const config = service.getConfig();
      expect(config.maxSessions).toBe(50);
      expect(config.sessionTimeout).toBe(1440);
      expect(config.autoArchive).toBe(true);
      expect(config.enableHistory).toBe(true);
    });
  });

  describe('세션 생성', () => {
    it('백엔드 성공 시 세션 생성', async () => {
      const mockBackendSession = {
        id: 'session-1',
        title: '테스트 세션',
        description: '초기 메시지: 테스트...',
        tags: ['persistent'],
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        last_activity: '2024-01-01T00:00:00.000Z',
        total_messages: 0,
        metadata: {
          conversationDepth: 0,
          topicCount: 0,
          sessionDuration: 0,
        },
        is_archived: false,
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBackendSession,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'msg-1',
            session_id: 'session-1',
            content: '초기 메시지',
            role: 'user',
            sender: 'user',
            timestamp: '2024-01-01T00:00:00.000Z',
            metadata: {},
            is_bookmarked: false,
          }),
        } as Response);

      const session = await service.createPersistentChatSession(
        '테스트 세션',
        '초기 메시지',
        ['test']
      );

      expect(session).toBeDefined();
      expect(session.id).toBe('session-1');
      expect(session.title).toBe('테스트 세션');
      expect(session.isPersistent).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('백엔드 실패 시 로컬 세션 생성', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const session = await service.createPersistentChatSession('로컬 세션');

      expect(session).toBeDefined();
      expect(session.id).toContain('persistent_');
      expect(session.isPersistent).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });

    it('초기 메시지 없이 세션 생성', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const session = await service.createPersistentChatSession('세션');

      expect(session).toBeDefined();
      expect(session.messages.length).toBe(0);
    });

    it('로컬 세션 생성 시 긴 제목은 목록 규칙으로 잘린다', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const long = '가'.repeat(45);
      const session = await service.createPersistentChatSession(long);
      expect(session.title.length).toBeLessThanOrEqual(33);
      expect(session.title.endsWith('...')).toBe(true);
    });
  });

  describe('세션 변환', () => {
    it('일반 세션을 지속적 세션으로 변환', () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '일반 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
      };

      // 세션을 먼저 추가
      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const converted = service.convertToPersistentSession('session-1');

      expect(converted).toBeDefined();
      expect(converted?.isPersistent).toBe(true);
      expect(converted?.type).toBe('persistent_chat');
    });

    it('존재하지 않는 세션 변환 시 null 반환', () => {
      const result = service.convertToPersistentSession('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('메시지 추가', () => {
    it('백엔드 성공 시 메시지 추가', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const mockBackendMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        content: '테스트 메시지',
        role: 'user',
        sender: 'user',
        timestamp: '2024-01-01T00:00:00.000Z',
        metadata: {},
        is_bookmarked: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendMessage,
      } as Response);

      const message = await service.addMessageToSession('session-1', {
        role: 'user',
        content: '테스트 메시지',
      });

      expect(message).toBeDefined();
      expect(message?.content).toBe('테스트 메시지');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('백엔드 실패 시 로컬 메시지 추가', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const message = await service.addMessageToSession('session-1', {
        role: 'user',
        content: '로컬 메시지',
      });

      expect(message).toBeDefined();
      expect(message?.content).toBe('로컬 메시지');
      expect(console.error).toHaveBeenCalled();
    });

    it('삭제된 세션에 메시지 추가 시 null 반환', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '삭제된 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: false,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'deleted',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const message = await service.addMessageToSession('session-1', {
        role: 'user',
        content: '메시지',
      });

      expect(message).toBeNull();
    });

    it('메시지 히스토리 제한 확인', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);
      service.updateConfig({ maxMessageHistory: 5 });

      mockFetch.mockRejectedValue(new Error('Network error'));

      // 10개의 메시지 추가
      for (let i = 0; i < 10; i++) {
        await service.addMessageToSession('session-1', {
          role: 'user',
          content: `메시지 ${i}`,
        });
      }

      const session = service.getSession('session-1');
      expect(session?.messages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('세션 상태 변경', () => {
    it('세션 상태 업데이트', () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const result = service.updateSessionStatus('session-1', 'archived');

      expect(result).toBe(true);
      const updatedSession = service.getSession('session-1');
      expect(updatedSession?.status).toBe('archived');
      expect(updatedSession?.isActive).toBe(false);
    });

    it('세션 삭제', () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const result = service.updateSessionStatus('session-1', 'deleted');

      expect(result).toBe(true);
      const deletedSession = service.getSession('session-1');
      expect(deletedSession).toBeNull();
    });

    it('존재하지 않는 세션 상태 변경 시 false 반환', () => {
      const result = service.updateSessionStatus('nonexistent', 'archived');
      expect(result).toBe(false);
    });
  });

  describe('세션 아카이브', () => {
    it('백엔드 성공 시 세션 아카이브', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await service.archiveSession('session-1');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('백엔드 실패 시 로컬 아카이브', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.archiveSession('session-1');

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('세션 복원', () => {
    it('백엔드 성공 시 세션 복원', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: false,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'archived',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await service.restoreSession('session-1');

      expect(result).toBe(true);
    });

    it('백엔드 실패 시 로컬 복원', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: false,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'archived',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.restoreSession('session-1');

      expect(result).toBe(true);
    });

    it('아카이브되지 않은 세션 복원 시 false 반환', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.restoreSession('session-1');

      expect(result).toBe(false);
    });
  });

  describe('세션 삭제', () => {
    it('백엔드 성공 시 세션 삭제', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await service.deleteSession('session-1');

      expect(result).toBe(true);
      expect(service.getSession('session-1')).toBeNull();
    });

    it('백엔드 실패 시 로컬 삭제', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.deleteSession('session-1');

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('세션 검색', () => {
    it('제목으로 세션 검색', () => {
      const mockSession1: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      const mockSession2: ChatSession = {
        id: 'session-2',
        title: '다른 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession1);
      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-2', mockSession2);

      const results = service.searchSessions('테스트');

      expect(results.length).toBe(1);
      expect(results[0].id).toBe('session-1');
    });

    it('태그로 세션 검색', () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: ['test', 'persistent'],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const results = service.searchSessions('test');

      expect(results.length).toBe(1);
    });

    it('메시지 내용으로 세션 검색', () => {
      const mockMessage: Message = {
        id: 'msg-1',
        content: '검색할 메시지',
        sender: 'user',
        timestamp: '2024-01-01T00:00:00.000Z',
        role: 'user',
        chatId: 'session-1',
      };

      const mockSession: ChatSession = {
        id: 'session-1',
        title: '세션',
        messages: [mockMessage],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 1,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 1,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const results = service.searchSessions('검색할');

      expect(results.length).toBe(1);
    });
  });

  describe('세션 통계', () => {
    it('세션 통계 조회', () => {
      const mockSession1: ChatSession = {
        id: 'session-1',
        title: '활성 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 10,
        participants: ['user'],
        tags: ['test'],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 10,
        isPersistent: true,
      };

      const mockSession2: ChatSession = {
        id: 'session-2',
        title: '아카이브 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: false,
        messageCount: 5,
        participants: ['user'],
        tags: ['test'],
        type: 'persistent_chat',
        status: 'archived',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 5,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession1);
      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-2', mockSession2);

      const stats = service.getSessionStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.activeSessions).toBe(1);
      expect(stats.archivedSessions).toBe(1);
      expect(stats.totalMessages).toBe(15);
      expect(stats.mostActiveTopics).toContain('test');
    });
  });

  describe('활성 세션 조회', () => {
    it('백엔드 성공 시 활성 세션 조회', async () => {
      const mockBackendSessions = [
        {
          id: 'session-1',
          title: '활성 세션',
          tags: [],
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          last_activity: '2024-01-01T00:00:00.000Z',
          total_messages: 0,
          metadata: {},
          is_archived: false,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendSessions,
      } as Response);

      const sessions = await service.getActiveSessions();

      expect(sessions.length).toBe(1);
      expect(sessions[0].id).toBe('session-1');
    });

    it('백엔드 실패 시 로컬 활성 세션 조회', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '활성 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const sessions = await service.getActiveSessions();

      expect(sessions.length).toBe(1);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('세션 조회', () => {
    it('세션 ID로 세션 조회', () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        title: '테스트 세션',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: ['user'],
        tags: [],
        type: 'persistent_chat',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: true,
      };

      (service as unknown as { sessions: Map<string, unknown> }).sessions.set('session-1', mockSession);

      const session = service.getSession('session-1');

      expect(session).toBeDefined();
      expect(session?.id).toBe('session-1');
    });

    it('존재하지 않는 세션 조회 시 null 반환', () => {
      const session = service.getSession('nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('설정 관리', () => {
    it('설정 업데이트', () => {
      service.updateConfig({ maxSessions: 100 });

      const config = service.getConfig();
      expect(config.maxSessions).toBe(100);
    });

    it('부분 설정 업데이트', () => {
      const originalConfig = service.getConfig();
      service.updateConfig({ sessionTimeout: 720 });

      const config = service.getConfig();
      expect(config.sessionTimeout).toBe(720);
      expect(config.maxSessions).toBe(originalConfig.maxSessions);
    });
  });

  describe('에지 케이스', () => {
    it('빈 세션 목록으로 통계 조회', () => {
      const stats = service.getSessionStats();
      expect(stats.totalSessions).toBe(0);
      expect(stats.activeSessions).toBe(0);
      expect(stats.totalMessages).toBe(0);
    });

    it('빈 검색어로 세션 검색', () => {
      const results = service.searchSessions('');
      expect(Array.isArray(results)).toBe(true);
    });
  });
});

