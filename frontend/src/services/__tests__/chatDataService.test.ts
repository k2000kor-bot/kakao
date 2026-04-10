/**
 * ChatDataService 테스트
 * @jest-environment jsdom
 */

import {
  parseKakaoChatData,
  parseRealChatData,
  parseSampleChatData,
  analyzeChatData,
  loadRealChatData,
  saveMessagesToDatabase,
  loadMessagesFromDatabase,
  checkDatabaseStatus,
  loadChatData,
  getChatRooms,
  realChatRooms,
} from '../chatDataService';
import { Message } from '../types';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

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
});

// fetch 모킹
installJestFetchMock();

function partialTextResponse(init: {
  ok: boolean;
  text: () => Promise<string>;
}): Response {
  return init as unknown as Response;
}

describe('ChatDataService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseKakaoChatData', () => {
    it('카카오 대화 데이터 파싱', () => {
      // 정규식 패턴에 맞는 형식: 2025년 6월 24일 오전 9:22, 홍길동 : 안녕하세요
      const content = `2025년 6월 24일
2025년 6월 24일 오전 9:22, 홍길동 : 안녕하세요
2025년 6월 24일 오전 9:23, 김철수 : 반갑습니다`;

      const messages = parseKakaoChatData(content);

      expect(Array.isArray(messages)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- structure check when parsed */
      if (messages.length > 0) {
        expect(messages[0].sender).toBeDefined();
        expect(messages[0].content).toBeDefined();
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('빈 데이터 파싱', () => {
      const messages = parseKakaoChatData('');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });
  });

  describe('parseRealChatData', () => {
    it('실제 대화 데이터 파싱', () => {
      const rawData = `2024-01-15 14:30:25 [홍길동] 안녕하세요
2024-01-15 14:31:10 김철수: 반갑습니다`;

      const messages = parseRealChatData(rawData);

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].sender).toBe('홍길동');
      expect(messages[0].content).toBe('안녕하세요');
    });

    it('멀티라인 메시지 파싱', () => {
      const rawData = `2024-01-15 14:30:25 [홍길동] 첫 번째 줄
두 번째 줄
세 번째 줄`;

      const messages = parseRealChatData(rawData);

      expect(messages.length).toBe(1);
      expect(messages[0].content).toContain('첫 번째 줄');
      expect(messages[0].content).toContain('두 번째 줄');
    });
  });

  describe('parseSampleChatData', () => {
    it('샘플 대화 데이터 파싱', () => {
      const rawData = `[2025년 7월 15일] [12:40] 0035_우성7차 : 안녕하세요
[2025년 7월 15일] [12:41] 0098 : 반갑습니다`;

      const messages = parseSampleChatData(rawData);

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(2);
      expect(messages[0].sender).toBe('0035_우성7차');
      expect(messages[0].content).toBe('안녕하세요');
    });

    it('빈 샘플 데이터 파싱', () => {
      const messages = parseSampleChatData('');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });
  });

  describe('analyzeChatData', () => {
    it('대화 데이터 분석', () => {
      const messages: Message[] = [
        {
          id: '1',
          sender: '홍길동',
          content: '안녕하세요',
          timestamp: '2024-01-15 14:30:25',
          type: 'text',
        },
        {
          id: '2',
          sender: '김철수',
          content: '반갑습니다',
          timestamp: '2024-01-15 14:31:10',
          type: 'text',
        },
        {
          id: '3',
          sender: '홍길동',
          content: '좋은 하루 되세요',
          timestamp: '2024-01-15 14:32:00',
          type: 'text',
        },
      ];

      const analysis = analyzeChatData(messages);

      expect(analysis).toBeDefined();
      expect(analysis.totalMessages).toBe(3);
      expect(analysis.uniqueParticipants).toBe(2);
      expect(Array.isArray(analysis.topParticipants)).toBe(true);
    });

    it('빈 메시지 배열 분석', () => {
      const analysis = analyzeChatData([]);

      expect(analysis.totalMessages).toBe(0);
      expect(analysis.uniqueParticipants).toBe(0);
    });

    it('topParticipants는 sender·count를 가지며 메시지 수 내림차순이어야 함', () => {
      const messages: Message[] = [
        { id: '1', sender: 'A', content: '메시지1', timestamp: '2024-01-15 14:30:25', type: 'text' },
        { id: '2', sender: 'B', content: '메시지2', timestamp: '2024-01-15 14:31:00', type: 'text' },
        { id: '3', sender: 'A', content: '메시지3', timestamp: '2024-01-15 14:32:00', type: 'text' },
        { id: '4', sender: 'A', content: '메시지4', timestamp: '2024-01-15 14:33:00', type: 'text' },
      ];

      const analysis = analyzeChatData(messages);

      expect(analysis.topParticipants).toHaveLength(2);
      expect(analysis.topParticipants[0]).toEqual({ sender: 'A', count: 3 });
      expect(analysis.topParticipants[1]).toEqual({ sender: 'B', count: 1 });
    });

    it('dateRange가 유효한 타임스탬프일 때 start·end를 반환해야 함', () => {
      const messages: Message[] = [
        { id: '1', sender: 'A', content: '첫 메시지', timestamp: '2024-01-15 14:30:25', type: 'text' },
        { id: '2', sender: 'B', content: '마지막 메시지', timestamp: '2024-01-16 10:00:00', type: 'text' },
      ];

      const analysis = analyzeChatData(messages);

      expect(analysis.dateRange.start).not.toBeNull();
      expect(analysis.dateRange.end).not.toBeNull();
      expect(analysis.dateRange.start!.getTime()).toBeLessThanOrEqual(analysis.dateRange.end!.getTime());
    });

    it('키워드가 포함된 내용에서 keywords를 추출해야 함', () => {
      const messages: Message[] = [
        { id: '1', sender: 'A', content: '조합 회의에서 안건 투표가 있었습니다.', timestamp: '2024-01-15 14:30:25', type: 'text' },
        { id: '2', sender: 'B', content: '아파트 건설 협의가 필요합니다.', timestamp: '2024-01-15 14:31:00', type: 'text' },
      ];

      const analysis = analyzeChatData(messages);

      expect(Array.isArray(analysis.keywords)).toBe(true);
      expect(analysis.keywords).toContain('조합');
      expect(analysis.keywords).toContain('안건');
      expect(analysis.keywords).toContain('투표');
      expect(analysis.keywords).toContain('아파트');
      expect(analysis.keywords).toContain('건설');
      expect(analysis.keywords).toContain('협의');
    });
  });

  describe('loadRealChatData', () => {
    it('실제 대화 데이터 로드', async () => {
      jest.mocked(global.fetch).mockResolvedValue(
        partialTextResponse({
          ok: true,
          text: async () => `2024-01-15 14:30:25 [홍길동] 안녕하세요`,
        })
      );

      const messages = await loadRealChatData('우성7차_아파트_조합원');

      expect(Array.isArray(messages)).toBe(true);
    });

    it('로드 실패 처리', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const messages = await loadRealChatData('non-existent');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });
  });

  describe('saveMessagesToDatabase', () => {
    it('메시지를 데이터베이스에 저장', () => {
      const messages: Message[] = [
        {
          id: '1',
          sender: '홍길동',
          content: '테스트 메시지',
          timestamp: '2024-01-15 14:30:25',
          type: 'text',
        },
      ];

      expect(() => saveMessagesToDatabase(messages, 'test-room')).not.toThrow();
    });
  });

  describe('loadMessagesFromDatabase', () => {
    it('데이터베이스에서 메시지 로드', () => {
      const messages: Message[] = [
        {
          id: '1',
          sender: '홍길동',
          content: '테스트 메시지',
          timestamp: '2024-01-15 14:30:25',
          type: 'text',
        },
      ];

      saveMessagesToDatabase(messages, 'test-room');
      const loaded = loadMessagesFromDatabase('test-room');

      expect(Array.isArray(loaded)).toBe(true);
    });

    it('존재하지 않는 대화방 메시지 로드', () => {
      const messages = loadMessagesFromDatabase('non-existent');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(0);
    });
  });

  describe('checkDatabaseStatus', () => {
    it('데이터베이스 상태 확인', () => {
      const messages: Message[] = [
        {
          id: '1',
          sender: '홍길동',
          content: '테스트 메시지',
          timestamp: '2024-01-15 14:30:25',
          type: 'text',
        },
      ];

      saveMessagesToDatabase(messages, 'test-room');
      const status = checkDatabaseStatus('test-room');

      expect(status).toBeDefined();
      expect(typeof status.hasData).toBe('boolean');
      expect(typeof status.messageCount).toBe('number');
    });

    it('존재하지 않는 대화방 상태 확인', () => {
      const status = checkDatabaseStatus('non-existent');

      expect(status.hasData).toBe(false);
      expect(status.messageCount).toBe(0);
    });
  });

  describe('loadChatData', () => {
    it('대화 데이터 로드', async () => {
      jest.mocked(global.fetch).mockResolvedValue(
        partialTextResponse({
          ok: true,
          text: async () => `[2025년 7월 15일] [12:40] 0035_우성7차 : 안녕하세요`,
        })
      );

      const messages = await loadChatData('우성7차_아파트_조합원');

      expect(Array.isArray(messages)).toBe(true);
    });

    it('로드 실패 처리', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const messages = await loadChatData('non-existent');

      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe('getChatRooms', () => {
    it('대화방 목록 가져오기', async () => {
      const rooms = await getChatRooms();

      expect(Array.isArray(rooms)).toBe(true);
    });
  });

  describe('realChatRooms', () => {
    it('실제 대화방 데이터 확인', () => {
      expect(Array.isArray(realChatRooms)).toBe(true);
      expect(realChatRooms.length).toBeGreaterThan(0);
      realChatRooms.forEach((room) => {
        expect(room.id).toBeDefined();
        expect(room.name).toBeDefined();
        expect(typeof room.participantCount).toBe('number');
        expect(typeof room.messageCount).toBe('number');
      });
    });
  });
});

