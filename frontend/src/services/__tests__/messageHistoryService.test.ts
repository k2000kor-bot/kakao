/// <reference types="jest" />
/**
 * MessageHistoryService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  MessageHistoryService,
  messageHistoryService,
  StoredMessage,
  MESSAGE_HISTORY_STORAGE_KEY,
} from '../messageHistoryService';
import { MESSAGE_HISTORY_STORAGE_KEY as MESSAGE_HISTORY_KEY_MODULE } from '../messageHistoryStorageKeys';
import advancedSearchParser from '../../utils/advancedSearchParser';
import { errorLogger } from '../../utils/errorLogger';
import { ASSISTANT_PLACEHOLDER_ANALYZING } from '../../utils/chatInputUtils';

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

describe('MESSAGE_HISTORY_STORAGE_KEY', () => {
  it('messageHistoryService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(MESSAGE_HISTORY_STORAGE_KEY).toBe(MESSAGE_HISTORY_KEY_MODULE);
  });
});

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

  describe('저장소 복원', () => {
    it('로컬에 남은 AI 생성 단계 문구는 조회 시 안내로 치환된다', () => {
      localStorage.setItem(
        MESSAGE_HISTORY_STORAGE_KEY,
        JSON.stringify({
          'session-x': [
            {
              id: 1,
              sender: 'ai',
              text: ASSISTANT_PLACEHOLDER_ANALYZING,
              timestamp: new Date().toISOString(),
              sessionId: 'session-x',
            },
          ],
        }),
      );
      const fresh = new MessageHistoryService();
      const msgs = fresh.getSessionMessages('session-x');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].text).toContain('미완료');
    });

    it('저장 시 AI 생성 단계 플레이스홀더는 로컬에 안내 문구로 기록된다', () => {
      const ts = new Date().toISOString();
      service.saveMessage({
        id: 1,
        sender: 'ai',
        text: ASSISTANT_PLACEHOLDER_ANALYZING,
        timestamp: ts,
        sessionId: 'session-save-ph',
      });
      const raw = JSON.parse(
        localStorage.getItem(MESSAGE_HISTORY_STORAGE_KEY) || '{}',
      ) as Record<string, StoredMessage[]>;
      expect(raw['session-save-ph']).toHaveLength(1);
      expect(raw['session-save-ph'][0].text).toContain('미완료');
    });

    it('손상된 JSON이면 조회 시 빈 히스토리로 처리된다', () => {
      localStorage.setItem(MESSAGE_HISTORY_STORAGE_KEY, '{not-json');
      const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
      try {
        const fresh = new MessageHistoryService();
        expect(fresh.getSessionMessages('any')).toEqual([]);
      } finally {
        errSpy.mockRestore();
      }
    });

    it('저장소 루트가 배열이면 빈 히스토리로 처리된다', () => {
      localStorage.setItem(MESSAGE_HISTORY_STORAGE_KEY, '[]');
      const fresh = new MessageHistoryService();
      expect(fresh.getSessionMessages('any')).toEqual([]);
    });

    it('저장소 루트가 null JSON이면 빈 히스토리로 처리된다', () => {
      localStorage.setItem(MESSAGE_HISTORY_STORAGE_KEY, 'null');
      const fresh = new MessageHistoryService();
      expect(fresh.getSessionMessages('any')).toEqual([]);
    });

    it('세션 메시지 배열에 유효하지 않은 항목은 조회 시 제외된다', () => {
      const ts = new Date().toISOString();
      localStorage.setItem(
        MESSAGE_HISTORY_STORAGE_KEY,
        JSON.stringify({
          'session-mixed': [
            {
              id: 1,
              sender: 'user',
              text: 'good',
              timestamp: ts,
              sessionId: 'session-mixed',
            },
            null,
            { id: 2, sender: 'user' },
          ],
        }),
      );
      const fresh = new MessageHistoryService();
      const msgs = fresh.getSessionMessages('session-mixed');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].text).toBe('good');
    });

    it('일부 세션 값이 배열이 아니어도(getHistory) 다른 세션은 정상 조회된다', () => {
      const ts = new Date().toISOString();
      localStorage.setItem(
        MESSAGE_HISTORY_STORAGE_KEY,
        JSON.stringify({
          'session-good': [
            {
              id: 1,
              sender: 'user',
              text: 'ok',
              timestamp: ts,
              sessionId: 'session-good',
            },
          ],
          'session-bad-shape': { not: 'array' },
        }),
      );
      const fresh = new MessageHistoryService();
      expect(fresh.getSessionMessages('session-good')).toHaveLength(1);
      expect(fresh.getSessionMessages('session-good')[0].text).toBe('ok');
      expect(fresh.getSessionMessages('session-bad-shape')).toEqual([]);
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

    it('세션당 최대 메시지 수 초과 시 가장 오래된 항목이 제거된다', () => {
      const s = service as unknown as {
        config: { maxMessagesPerSession: number; maxSessions: number; storageKey: string };
      };
      s.config.maxMessagesPerSession = 3;
      const base = { sessionId: 'cap-session', sender: 'user' as const, timestamp: new Date().toISOString() };
      for (let i = 1; i <= 4; i += 1) {
        service.saveMessage({ ...base, id: i, text: `m${i}` });
      }
      const msgs = service.getSessionMessages('cap-session');
      expect(msgs).toHaveLength(3);
      expect(msgs.map((m) => m.id)).toEqual([2, 3, 4]);
    });

    it('세션 수 최대 초과 시 마지막 메시지 시각이 가장 이른 세션이 제거된다', () => {
      const s = service as unknown as {
        config: { maxMessagesPerSession: number; maxSessions: number; storageKey: string };
      };
      s.config.maxSessions = 2;
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'a',
        timestamp: '2020-01-01T00:00:00.000Z',
        sessionId: 'sess-old',
      });
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'b',
        timestamp: '2021-01-01T00:00:00.000Z',
        sessionId: 'sess-mid',
      });
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'c',
        timestamp: '2022-01-01T00:00:00.000Z',
        sessionId: 'sess-new',
      });
      expect(service.getSessionMessages('sess-old').length).toBe(0);
      expect(service.getSessionMessages('sess-mid').length).toBe(1);
      expect(service.getSessionMessages('sess-new').length).toBe(1);
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

    it('고급 검색 파서 오류 시 기본 부분 일치 검색으로 폴백한다', () => {
      const parseSpy = jest.spyOn(advancedSearchParser, 'parseQuery').mockImplementation(() => {
        throw new Error('parse forced');
      });
      const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
      try {
        const results = service.searchMessages('테스트');
        expect(results.length).toBeGreaterThan(0);
        expect(warnSpy).toHaveBeenCalled();
      } finally {
        parseSpy.mockRestore();
        warnSpy.mockRestore();
      }
    });

    it('검색 중 내부 예외 시 빈 배열을 반환한다', () => {
      const spy = jest.spyOn(MessageHistoryService.prototype, 'getAllMessages').mockImplementation(() => {
        throw new Error('forced');
      });
      const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
      try {
        expect(service.searchMessages('테스트')).toEqual([]);
        expect(errSpy).toHaveBeenCalled();
      } finally {
        spy.mockRestore();
        errSpy.mockRestore();
      }
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

    it('localStorage QuotaExceededError 시 세션 일부 삭제 후 재저장한다', () => {
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'a',
        timestamp: '2020-01-01T00:00:00.000Z',
        sessionId: 's1',
      });
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'b',
        timestamp: '2020-01-02T00:00:00.000Z',
        sessionId: 's2',
      });
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'c',
        timestamp: '2020-01-03T00:00:00.000Z',
        sessionId: 's3',
      });

      const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
      const setItemSpy = jest
        .spyOn(localStorageMock, 'setItem')
        .mockImplementationOnce(() => {
          throw new DOMException('QuotaExceeded', 'QuotaExceededError');
        })
        .mockImplementation((key: string, value: string) => {
          localStorageStore[key] = value.toString();
        });

      try {
        service.saveMessage({
          id: 2,
          sender: 'user',
          text: 'extra',
          timestamp: '2020-01-04T00:00:00.000Z',
          sessionId: 's1',
        });
        const raw = localStorage.getItem(MESSAGE_HISTORY_STORAGE_KEY);
        const parsed = JSON.parse(raw || '{}') as Record<string, unknown>;
        expect(Object.keys(parsed).length).toBe(2);
        expect(errSpy).toHaveBeenCalled();
      } finally {
        errSpy.mockRestore();
        setItemSpy.mockRestore();
      }
    });

    it('QuotaExceeded 재시도도 실패하면 재시도 실패 로그가 남는다', () => {
      service.saveMessage({
        id: 1,
        sender: 'user',
        text: 'a',
        timestamp: '2020-01-01T00:00:00.000Z',
        sessionId: 's1',
      });
      const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceeded', 'QuotaExceededError');
      });
      try {
        service.saveMessage({
          id: 2,
          sender: 'user',
          text: 'b',
          timestamp: '2020-01-02T00:00:00.000Z',
          sessionId: 's1',
        });
        const retryFail = errSpy.mock.calls.some((call) => call[0] === '히스토리 저장 재시도 실패');
        expect(retryFail).toBe(true);
      } finally {
        errSpy.mockRestore();
        jest.restoreAllMocks();
      }
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
      const logSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
      try {
        const imported = service.importHistory('invalid json', 'json');
        expect(imported).toBe(false);
      } finally {
        logSpy.mockRestore();
      }
    });

    it('JSON 루트가 배열이면 가져오기 실패(false)', () => {
      expect(service.importHistory('[]', 'json')).toBe(false);
    });

    it('JSON 루트가 null이면 가져오기 실패(false)', () => {
      expect(service.importHistory('null', 'json')).toBe(false);
    });

    it('JSON 가져오기 시 AI 생성 단계 문구는 안내로 치환된다', () => {
      const payload = JSON.stringify({
        'session-import': [
          {
            id: 1,
            sender: 'ai',
            text: ASSISTANT_PLACEHOLDER_ANALYZING,
            timestamp: new Date().toISOString(),
            sessionId: 'session-import',
          },
        ],
      });
      const ok = service.importHistory(payload, 'json');
      expect(ok).toBe(true);
      const msgs = service.getSessionMessages('session-import');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].text).toContain('미완료');
    });

    it('txt 형식 가져오기는 미지원(false)', () => {
      expect(service.importHistory('=== 세션: x ===', 'txt')).toBe(false);
    });

    it('JSON 가져오기 시 세션 값이 배열이 아니면 빈 배열로 저장된다', () => {
      const payload = JSON.stringify({
        'session-ok': [
          {
            id: 1,
            sender: 'user',
            text: 'hi',
            timestamp: new Date().toISOString(),
            sessionId: 'session-ok',
          },
        ],
        'session-bad': 'not-array',
      });
      expect(service.importHistory(payload, 'json')).toBe(true);
      expect(service.getSessionMessages('session-ok')).toHaveLength(1);
      expect(service.getSessionMessages('session-bad')).toEqual([]);
    });

    it('JSON 가져오기 시 세션 내 잘못된 메시지 항목은 제외된다', () => {
      const ts = new Date().toISOString();
      const payload = JSON.stringify({
        'session-imp': [
          { id: 1, sender: 'user', text: 'keep', timestamp: ts, sessionId: 'session-imp' },
          null,
          { id: 2, sender: 'user' },
        ],
      });
      service.clearHistory();
      expect(service.importHistory(payload, 'json')).toBe(true);
      const msgs = service.getSessionMessages('session-imp');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].text).toBe('keep');
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
          isLiked: true,
        },
        {
          id: 3,
          sender: 'user',
          text: '북마크 아님',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          isBookmarked: false,
        },
        {
          id: 4,
          sender: 'ai',
          text: '좋아요 아님',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          isLiked: false,
        },
      ];

      messages.forEach((msg) => service.saveMessage(msg));
    });

    it('즐겨찾기 필터 검색', () => {
      const results = service.searchMessages('', { isBookmarked: true });

      expect(Array.isArray(results)).toBe(true);
      expect(results.every((m) => m.isBookmarked === true)).toBe(true);
    });

    it('즐겨찾기 아님(false)만 필터 검색', () => {
      const results = service.searchMessages('', { isBookmarked: false });
      expect(results.every((m) => m.isBookmarked === false)).toBe(true);
      expect(results.some((m) => m.id === 3)).toBe(true);
    });

    it('좋아요 필터 검색', () => {
      const results = service.searchMessages('', { isLiked: true });

      expect(Array.isArray(results)).toBe(true);
      expect(results.every((m) => m.isLiked === true)).toBe(true);
      expect(results.some((m) => m.id === 2)).toBe(true);
    });

    it('좋아요 아님(false)만 필터 검색', () => {
      const results = service.searchMessages('', { isLiked: false });
      expect(results.every((m) => m.isLiked === false)).toBe(true);
      expect(results.some((m) => m.id === 4)).toBe(true);
    });

    it('태그 검색', () => {
      const results = service.searchMessages('tag1');

      expect(Array.isArray(results)).toBe(true);
    });
  });
});

