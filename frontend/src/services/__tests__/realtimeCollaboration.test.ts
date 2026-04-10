/**
 * realtimeCollaboration 테스트
 */
import { realtimeCollaboration } from '../realtimeCollaboration';

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onclose: (() => void) | null = null;
  send = jest.fn();
  close = jest.fn();

  constructor(_url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }
}

describe('realtimeCollaboration', () => {
  const originalWebSocket = global.WebSocket;

  beforeAll(() => {
    (global as unknown as { WebSocket?: typeof MockWebSocket }).WebSocket = MockWebSocket;
  });

  afterAll(() => {
    (global as unknown as { WebSocket?: typeof WebSocket }).WebSocket = originalWebSocket;
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    realtimeCollaboration.disconnect();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('connect', () => {
    it('WebSocket 연결 성공', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(realtimeCollaboration.isConnected()).toBe(true);
    });

    it('연결 전 false 반환', () => {
      expect(realtimeCollaboration.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('연결 해제', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      realtimeCollaboration.disconnect();
      expect(realtimeCollaboration.isConnected()).toBe(false);
    });
  });

  describe('joinProject / leaveProject', () => {
    it('프로젝트 참여', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.joinProject('project-1')).not.toThrow();
    });

    it('프로젝트 나가기', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      realtimeCollaboration.joinProject('project-1');
      expect(() => realtimeCollaboration.leaveProject()).not.toThrow();
    });
  });

  describe('sendMessage', () => {
    it('메시지 전송', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.sendMessage('테스트 메시지')).not.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('상태 업데이트', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.updateStatus('away')).not.toThrow();
    });
  });

  describe('notify*', () => {
    it('파일 업로드 알림', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.notifyFileUpload({ name: 'test.txt' })).not.toThrow();
    });

    it('분석 완료 알림', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.notifyAnalysisComplete({ type: 'sentiment' })).not.toThrow();
    });

    it('인사이트 생성 알림', async () => {
      await realtimeCollaboration.connect('user-1', 'testuser');
      expect(() => realtimeCollaboration.notifyInsightGenerated({ type: 'trend' })).not.toThrow();
    });
  });

  describe('on', () => {
    it('이벤트 리스너 등록', () => {
      const callback = jest.fn();
      expect(() => realtimeCollaboration.on('message', callback)).not.toThrow();
    });
  });
});
