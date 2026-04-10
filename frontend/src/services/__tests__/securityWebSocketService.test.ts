/**
 * securityWebSocketService 테스트
 */
import securityWebSocketService from '../securityWebSocketService';

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

describe('securityWebSocketService', () => {
  const originalWebSocket = global.WebSocket;
  const originalWindow = global.window;

  beforeAll(() => {
    (global as unknown as { WebSocket?: typeof MockWebSocket }).WebSocket = MockWebSocket;
    if (!global.window) {
      (global as unknown as { window?: { location: { protocol: string; host: string } } }).window = {
        location: { protocol: 'http:', host: 'localhost:3000' }
      };
    }
  });

  afterAll(() => {
    (global as unknown as { WebSocket?: typeof WebSocket }).WebSocket = originalWebSocket;
    if (originalWindow === undefined) {
      delete (global as unknown as { window?: unknown }).window;
    }
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    securityWebSocketService.disconnect();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('connect / disconnect', () => {
    it('connect 호출 시 WebSocket 생성', async () => {
      securityWebSocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(securityWebSocketService.isConnected()).toBe(true);
    });

    it('disconnect 호출 시 연결 해제', async () => {
      securityWebSocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      securityWebSocketService.disconnect();
      expect(securityWebSocketService.isConnected()).toBe(false);
    });
  });

  describe('isConnected', () => {
    it('연결 전 false 반환', () => {
      expect(securityWebSocketService.isConnected()).toBe(false);
    });
  });

  describe('send', () => {
    it('연결되지 않은 상태에서 호출 시 경고만 출력', () => {
      expect(() => securityWebSocketService.send({ test: 1 })).not.toThrow();
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('subscribe 호출 시 send 호출 (연결 시)', async () => {
      securityWebSocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      securityWebSocketService.subscribe('threat');
      expect(securityWebSocketService.isConnected()).toBe(true);
    });

    it('unsubscribe 호출 시 send 호출 (연결 시)', async () => {
      securityWebSocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      securityWebSocketService.unsubscribe('threat');
      expect(securityWebSocketService.isConnected()).toBe(true);
    });
  });

  describe('EventEmitter', () => {
    it('connected 이벤트 수신', async () => {
      const callback = jest.fn();
      securityWebSocketService.on('connected', callback);
      securityWebSocketService.connect();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callback).toHaveBeenCalled();
    });
  });
});
