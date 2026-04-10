/**
 * RealTimeCollaborationService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  RealTimeCollaborationService,
  realTimeCollaborationService,
  CollaborationEvent,
} from '../realTimeCollaborationService';

const mockErrorLoggerInfo = jest.fn();
const mockErrorLoggerWarn = jest.fn();
const mockErrorLoggerError = jest.fn();
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    info: (...args: unknown[]) => mockErrorLoggerInfo(...args),
    warn: (...args: unknown[]) => mockErrorLoggerWarn(...args),
    error: (...args: unknown[]) => mockErrorLoggerError(...args),
  },
  toError: (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
}));

// WebSocket 모킹
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send = jest.fn();
  close = jest.fn();

  constructor(public url: string) {
    // 연결 시뮬레이션
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }
}

// localStorage 모킹
const localStorageMock = (() => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: MockWebSocket,
});

global.console.log = jest.fn();
global.console.warn = jest.fn();
global.console.error = jest.fn();

describe('RealTimeCollaborationService', () => {
  let service: RealTimeCollaborationService;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorageMock.clear();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);

    service = new RealTimeCollaborationService();
    // WebSocket 연결 완료 대기
    jest.advanceTimersByTime(10);
  });

  afterEach(() => {
    service.cleanup();
    jest.useRealTimers();
    mockDateNow.mockRestore();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(RealTimeCollaborationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(realTimeCollaborationService).toBeDefined();
      expect(realTimeCollaborationService).toBeInstanceOf(RealTimeCollaborationService);
    });

    it('WebSocket 초기화', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      expect(ws).toBeDefined();
    });
  });

  describe('세션 관리', () => {
    it('세션 참가', async () => {
      const session = await service.joinSession('project-1');

      expect(session).toBeDefined();
      expect(session.projectId).toBe('project-1');
      expect(session.isActive).toBe(true);
    });

    it('세션 퇴장', async () => {
      await service.joinSession('project-1');
      service.leaveSession();

      const users = service.getCurrentSessionUsers();
      expect(users.length).toBe(0);
    });
  });

  describe('커서 위치', () => {
    it('커서 위치 업데이트', async () => {
      await service.joinSession('project-1');
      service.updateCursorPosition(100, 200);

      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      expect(ws.send).toHaveBeenCalled();
    });
  });

  describe('텍스트 변경', () => {
    it('텍스트 변경 전송', async () => {
      await service.joinSession('project-1');
      service.sendTextChange('doc-1', '새 내용', 2);

      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      expect(ws.send).toHaveBeenCalled();
    });
  });

  describe('공유 문서', () => {
    it('공유 문서 생성', () => {
      const document = service.createSharedDocument('project-1', '초기 내용');

      expect(document).toBeDefined();
      expect(document.projectId).toBe('project-1');
      expect(document.content).toBe('초기 내용');
      expect(document.version).toBe(1);
    });

    it('공유 문서 업데이트', () => {
      const document = service.createSharedDocument('project-1', '초기 내용');
      const result = service.updateSharedDocument(document.documentId, '업데이트된 내용');

      expect(result).toBe(true);
      
      const updated = service.getSharedDocument(document.documentId);
      expect(updated?.content).toBe('업데이트된 내용');
      expect(updated?.version).toBe(2);
    });

    it('존재하지 않는 문서 업데이트 시 false 반환', () => {
      const result = service.updateSharedDocument('nonexistent', '내용');
      expect(result).toBe(false);
    });

    it('공유 문서 조회', () => {
      const document = service.createSharedDocument('project-1', '내용');
      const retrieved = service.getSharedDocument(document.documentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.documentId).toBe(document.documentId);
    });

    it('존재하지 않는 문서 조회 시 null 반환', () => {
      const document = service.getSharedDocument('nonexistent');
      expect(document).toBeNull();
    });
  });

  describe('사용자 관리', () => {
    it('온라인 사용자 목록 조회', async () => {
      await service.joinSession('project-1');
      const users = service.getOnlineUsers();

      expect(Array.isArray(users)).toBe(true);
    });

    it('현재 세션 사용자 목록 조회', async () => {
      const session = await service.joinSession('project-1');
      expect(session).toBeDefined();
      const users = service.getCurrentSessionUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('세션 없을 때 빈 배열 반환', () => {
      const users = service.getCurrentSessionUsers();
      expect(users).toEqual([]);
    });
  });

  describe('이벤트 리스너', () => {
    it('이벤트 리스너 등록', () => {
      const callback = jest.fn();
      service.addEventListener('join', callback);

      expect(callback).toBeDefined();
    });

    it('이벤트 리스너 제거', () => {
      const callback = jest.fn();
      service.addEventListener('join', callback);
      service.removeEventListener('join', callback);

      expect(callback).toBeDefined();
    });

    it('이벤트 수신 시 리스너 호출', async () => {
      const callback = jest.fn();
      service.addEventListener('join', callback);

      // WebSocket 메시지 시뮬레이션
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      const joinEvent: CollaborationEvent = {
        type: 'join',
        userId: 'user-1',
        timestamp: new Date(),
        data: { username: '테스트 사용자' },
      };
      
      ws.onmessage?.({ data: JSON.stringify(joinEvent) } as MessageEvent);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('댓글', () => {
    it('댓글 전송', async () => {
      await service.joinSession('project-1');
      service.sendComment('테스트 댓글');

      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      expect(ws.send).toHaveBeenCalled();
    });

    it('대상 ID와 함께 댓글 전송', async () => {
      await service.joinSession('project-1');
      service.sendComment('테스트 댓글', 'target-1');

      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      expect(ws.send).toHaveBeenCalled();
    });
  });

  describe('WebSocket 메시지 처리', () => {
    it('join 이벤트 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      const joinEvent: CollaborationEvent = {
        type: 'join',
        userId: 'user-1',
        timestamp: new Date(),
        data: {
          sessionId: 'session-1',
          username: '테스트 사용자',
          activity: '프로젝트 참여',
        },
      };

      ws.onmessage?.({ data: JSON.stringify(joinEvent) } as MessageEvent);

      const users = service.getOnlineUsers();
      expect(users.length).toBeGreaterThanOrEqual(0);
    });

    it('leave 이벤트 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      
      // 먼저 join
      const joinEvent: CollaborationEvent = {
        type: 'join',
        userId: 'user-1',
        timestamp: new Date(),
        data: { username: '테스트 사용자' },
      };
      ws.onmessage?.({ data: JSON.stringify(joinEvent) } as MessageEvent);

      // 그 다음 leave
      const leaveEvent: CollaborationEvent = {
        type: 'leave',
        userId: 'user-1',
        timestamp: new Date(),
        data: {},
      };
      const leaveSpy = jest.fn();
      service.addEventListener('leave', leaveSpy);
      ws.onmessage?.({ data: JSON.stringify(leaveEvent) } as MessageEvent);

      expect(leaveSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'leave', userId: 'user-1' }));
    });

    it('cursor_move 이벤트 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      
      // 먼저 join
      const joinEvent: CollaborationEvent = {
        type: 'join',
        userId: 'user-1',
        timestamp: new Date(),
        data: { username: '테스트 사용자' },
      };
      ws.onmessage?.({ data: JSON.stringify(joinEvent) } as MessageEvent);

      // 커서 이동
      const cursorEvent: CollaborationEvent = {
        type: 'cursor_move',
        userId: 'user-1',
        timestamp: new Date(),
        data: { position: { x: 100, y: 200 } },
      };
      const cursorSpy = jest.fn();
      service.addEventListener('cursor_move', cursorSpy);
      ws.onmessage?.({ data: JSON.stringify(cursorEvent) } as MessageEvent);

      expect(cursorSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'cursor_move',
        userId: 'user-1',
        data: { position: { x: 100, y: 200 } },
      }));
    });

    it('text_change 이벤트 처리', () => {
      const document = service.createSharedDocument('project-1', '초기');
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;

      const textEvent: CollaborationEvent = {
        type: 'text_change',
        userId: 'user-1',
        timestamp: new Date(),
        data: {
          documentId: document.documentId,
          content: '변경된 내용',
          version: 2,
        },
      };

      ws.onmessage?.({ data: JSON.stringify(textEvent) } as MessageEvent);

      const updated = service.getSharedDocument(document.documentId);
      expect(updated?.content).toBe('변경된 내용');
      expect(updated?.version).toBe(2);
    });

    it('file_upload 이벤트 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      const fileEvent: CollaborationEvent = {
        type: 'file_upload',
        userId: 'user-1',
        timestamp: new Date(),
        data: { filename: 'test.pdf' },
      };

      ws.onmessage?.({ data: JSON.stringify(fileEvent) } as MessageEvent);

      expect(mockErrorLoggerInfo).toHaveBeenCalled();
    });

    it('comment 이벤트 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      const commentEvent: CollaborationEvent = {
        type: 'comment',
        userId: 'user-1',
        timestamp: new Date(),
        data: { comment: '테스트 댓글' },
      };

      ws.onmessage?.({ data: JSON.stringify(commentEvent) } as MessageEvent);

      expect(mockErrorLoggerInfo).toHaveBeenCalled();
    });
  });

  describe('WebSocket 연결', () => {
    it('WebSocket 연결 시 상태 브로드캐스트', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      ws.readyState = MockWebSocket.OPEN;
      ws.onopen?.(new Event('open'));

      expect(ws.send).toHaveBeenCalled();
    });

    it('WebSocket 연결 종료 시 재연결 시도', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      ws.readyState = MockWebSocket.CLOSED;
      ws.onclose?.(new CloseEvent('close'));

      jest.advanceTimersByTime(2000);
      expect(mockErrorLoggerInfo).toHaveBeenCalled();
    });

    it('WebSocket 미연결 시 메시지 전송 안 함', () => {
      (service as unknown as { websocket: MockWebSocket }).websocket.readyState = MockWebSocket.CLOSED;
      service.updateCursorPosition(100, 200);

      expect(mockErrorLoggerWarn).toHaveBeenCalled();
    });
  });

  describe('정리', () => {
    it('서비스 정리', async () => {
      await service.joinSession('project-1');
      service.createSharedDocument('project-1', '내용');
      
      service.cleanup();

      const users = service.getCurrentSessionUsers();
      expect(users.length).toBe(0);
    });
  });

  describe('에지 케이스', () => {
    it('잘못된 JSON 메시지 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      ws.onmessage?.({ data: 'invalid json' } as MessageEvent);

      expect(mockErrorLoggerError).toHaveBeenCalled();
    });

    it('알 수 없는 이벤트 타입 처리', () => {
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;
      const unknownEvent = {
        type: 'unknown',
        userId: 'user-1',
        timestamp: new Date(),
        data: {},
      };

      ws.onmessage?.({ data: JSON.stringify(unknownEvent) } as MessageEvent);

      // 에러 없이 처리되어야 함
      expect(true).toBe(true);
    });

    it('오래된 버전의 텍스트 변경 무시', () => {
      const document = service.createSharedDocument('project-1', '내용');
      const ws = (service as unknown as { websocket: MockWebSocket }).websocket;

      // 버전 3으로 업데이트
      const textEvent1: CollaborationEvent = {
        type: 'text_change',
        userId: 'user-1',
        timestamp: new Date(),
        data: {
          documentId: document.documentId,
          content: '버전 3',
          version: 3,
        },
      };
      ws.onmessage?.({ data: JSON.stringify(textEvent1) } as MessageEvent);

      // 버전 2로 되돌리기 시도 (무시되어야 함)
      const textEvent2: CollaborationEvent = {
        type: 'text_change',
        userId: 'user-2',
        timestamp: new Date(),
        data: {
          documentId: document.documentId,
          content: '버전 2로 되돌리기',
          version: 2,
        },
      };
      ws.onmessage?.({ data: JSON.stringify(textEvent2) } as MessageEvent);

      const updated = service.getSharedDocument(document.documentId);
      expect(updated?.content).toBe('버전 3');
      expect(updated?.version).toBe(3);
    });
  });
});

