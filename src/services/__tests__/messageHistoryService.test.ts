/**
 * MessageHistoryService 테스트
 */

// localStorage 모킹
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => {
    return localStorageStore[key] || null;
  },
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    localStorageStore = {};
  },
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: (index: number) => {
    const keys = Object.keys(localStorageStore);
    return keys[index] || null;
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// advancedSearchParser는 실제 구현을 사용

import {
  MessageHistoryService,
  messageHistoryService,
  StoredMessage,
} from '../messageHistoryService';

describe('MessageHistoryService', () => {
  let service: MessageHistoryService;

  beforeEach(() => {
    // localStorage store 초기화
    localStorageStore = {};
    jest.clearAllMocks();
    service = new MessageHistoryService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(MessageHistoryService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(messageHistoryService).toBeDefined();
    });
  });

  describe('메시지 저장', () => {
    it('메시지 저장', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe(1);
      expect(messages[0].text).toBe('테스트 메시지');
    });

    it('중복 메시지 업데이트', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '원래 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const updatedMessage: StoredMessage = {
        ...message,
        text: '업데이트된 메시지',
      };

      service.saveMessage(updatedMessage);

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(1);
      expect(messages[0].text).toBe('업데이트된 메시지');
    });

    it('여러 메시지 저장', () => {
      const messages: StoredMessage[] = [
        {
          id: 1,
          sender: 'user',
          text: '메시지 1',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
        {
          id: 2,
          sender: 'ai',
          text: '메시지 2',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));

      const stored = service.getSessionMessages('session-1');
      expect(stored.length).toBe(2);
    });

    it('다른 세션에 메시지 저장', () => {
      const message1: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '세션1 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      const message2: StoredMessage = {
        id: 2,
        sender: 'user',
        text: '세션2 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-2',
      };

      service.saveMessage(message1);
      service.saveMessage(message2);

      expect(service.getSessionMessages('session-1').length).toBe(1);
      expect(service.getSessionMessages('session-2').length).toBe(1);
    });
  });

  describe('메시지 조회', () => {
    it('세션 메시지 조회', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const messages = service.getSessionMessages('session-1');
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(1);
    });

    it('존재하지 않는 세션 조회', () => {
      const messages = service.getSessionMessages('nonexistent');
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });

    it('모든 메시지 조회', () => {
      const messages: StoredMessage[] = [
        {
          id: 1,
          sender: 'user',
          text: '메시지 1',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
        {
          id: 2,
          sender: 'ai',
          text: '메시지 2',
          timestamp: new Date().toISOString(),
          sessionId: 'session-2',
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));

      const allMessages = service.getAllMessages();
      expect(allMessages.length).toBe(2);
    });
  });

  describe('메시지 검색', () => {
    beforeEach(() => {
      const messages: StoredMessage[] = [
        {
          id: 1,
          sender: 'user',
          text: '테스트 메시지 1',
          timestamp: new Date('2024-01-01').toISOString(),
          sessionId: 'session-1',
        },
        {
          id: 2,
          sender: 'ai',
          text: '응답 메시지',
          timestamp: new Date('2024-01-02').toISOString(),
          sessionId: 'session-1',
        },
        {
          id: 3,
          sender: 'user',
          text: '다른 메시지',
          timestamp: new Date('2024-01-03').toISOString(),
          sessionId: 'session-2',
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));
    });

    it('기본 검색', () => {
      const results = service.searchMessages('테스트');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('세션별 검색', () => {
      const results = service.searchMessages('메시지', { sessionId: 'session-1' });

      expect(Array.isArray(results)).toBe(true);
    });

    it('발신자별 검색', () => {
      const results = service.searchMessages('', { sender: 'user' });

      expect(Array.isArray(results)).toBe(true);
      results.forEach((msg) => {
        expect(msg.sender).toBe('user');
      });
    });

    it('빈 쿼리 검색', () => {
      const results = service.searchMessages('');

      expect(Array.isArray(results)).toBe(true);
    });

    it('날짜 범위 검색', () => {
      const dateFrom = new Date('2024-01-02');
      const dateTo = new Date('2024-01-03');

      const results = service.searchMessages('', {
        dateFrom,
        dateTo,
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('즐겨찾기 및 좋아요', () => {
    it('즐겨찾기 메시지 조회', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        isBookmarked: true,
      };

      service.saveMessage(message);

      const bookmarked = service.getBookmarkedMessages();
      expect(Array.isArray(bookmarked)).toBe(true);
      expect(bookmarked.every((m) => m.isBookmarked)).toBe(true);
    });

    it('좋아요 메시지 조회', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        isLiked: true,
      };

      service.saveMessage(message);

      const liked = service.getLikedMessages();
      expect(Array.isArray(liked)).toBe(true);
      expect(liked.every((m) => m.isLiked)).toBe(true);
    });

    it('즐겨찾기 토글', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const result1 = service.toggleBookmark(1, 'session-1');
      expect(result1).toBe(true);

      const result2 = service.toggleBookmark(1, 'session-1');
      expect(result2).toBe(false);
    });

    it('존재하지 않는 메시지 즐겨찾기 토글', () => {
      const result = service.toggleBookmark(999, 'session-1');
      expect(result).toBe(false);
    });
  });

  describe('메시지 삭제', () => {
    it('메시지 삭제', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '삭제할 메시지',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const deleted = service.deleteMessage(1, 'session-1');
      expect(deleted).toBe(true);

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(0);
    });

    it('존재하지 않는 메시지 삭제', () => {
      const deleted = service.deleteMessage(999, 'session-1');
      expect(deleted).toBe(false);
    });
  });

  describe('세션 삭제', () => {
    it('세션 삭제', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const deleted = service.deleteSession('session-1');
      expect(deleted).toBe(true);

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(0);
    });

    it('존재하지 않는 세션 삭제', () => {
      const deleted = service.deleteSession('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('히스토리 관리', () => {
    it('히스토리 전체 삭제', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);
      service.clearHistory();

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(0);
    });

    it('통계 조회', () => {
      const messages: StoredMessage[] = [
        {
          id: 1,
          sender: 'user',
          text: '메시지 1',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          isBookmarked: true,
        },
        {
          id: 2,
          sender: 'ai',
          text: '메시지 2',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          isLiked: true,
        },
        {
          id: 3,
          sender: 'user',
          text: '메시지 3',
          timestamp: new Date().toISOString(),
          sessionId: 'session-2',
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));

      const stats = service.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.totalMessages).toBe('number');
      expect(typeof stats.totalSessions).toBe('number');
      expect(typeof stats.bookmarkedMessages).toBe('number');
      expect(typeof stats.likedMessages).toBe('number');
      expect(Array.isArray(stats.sessions)).toBe(true);
    });

    it('빈 히스토리 통계', () => {
      const stats = service.getStatistics();

      expect(stats.totalMessages).toBe(0);
      expect(stats.totalSessions).toBe(0);
      expect(stats.bookmarkedMessages).toBe(0);
      expect(stats.likedMessages).toBe(0);
      expect(stats.sessions.length).toBe(0);
    });
  });

  describe('히스토리 내보내기/가져오기', () => {
    it('JSON 형식 내보내기', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const exported = service.exportHistory('json');

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('텍스트 형식 내보내기', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const exported = service.exportHistory('txt');

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('JSON 형식 가져오기', () => {
      const message: StoredMessage = {
        id: 1,
        sender: 'user',
        text: '테스트',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
      };

      service.saveMessage(message);

      const exported = service.exportHistory('json');
      service.clearHistory();
      const imported = service.importHistory(exported, 'json');

      expect(imported).toBe(true);

      const messages = service.getSessionMessages('session-1');
      expect(messages.length).toBe(1);
    });

    it('잘못된 형식 가져오기', () => {
      const imported = service.importHistory('invalid json', 'json');
      expect(imported).toBe(false);
    });
  });

  describe('검색 옵션', () => {
    beforeEach(() => {
      const messages: StoredMessage[] = [
        {
          id: 1,
          sender: 'user',
          text: '테스트 메시지',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          tags: ['tag1', 'tag2'],
        },
        {
          id: 2,
          sender: 'ai',
          text: '응답 메시지',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          isBookmarked: true,
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));
    });

    it('즐겨찾기 필터 검색', () => {
      const results = service.searchMessages('', { isBookmarked: true });

      expect(Array.isArray(results)).toBe(true);
      expect(results.every((m) => m.isBookmarked === true)).toBe(true);
    });

    it('좋아요 필터 검색', () => {
      const results = service.searchMessages('', { isLiked: true });

      expect(Array.isArray(results)).toBe(true);
      expect(results.every((m) => m.isLiked === true)).toBe(true);
    });

    it('태그 검색', () => {
      const results = service.searchMessages('tag1');

      expect(Array.isArray(results)).toBe(true);
    });
  });
});

