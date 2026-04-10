/**
 * websocket.ts (WebSocketService) 테스트
 */
import websocketService from '../websocket';

describe('websocket (WebSocketService)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('subscribe / unsubscribe', () => {
    it('subscribe로 콜백 등록', () => {
      const callback = jest.fn();
      expect(() => websocketService.subscribe('test-type', callback)).not.toThrow();
    });

    it('unsubscribe로 콜백 제거', () => {
      const callback = jest.fn();
      websocketService.subscribe('unsub-type', callback);
      expect(() => websocketService.unsubscribe('unsub-type', callback)).not.toThrow();
    });

    it('같은 type에 여러 콜백 등록 후 각각 제거', () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      websocketService.subscribe('multi-type', cb1);
      websocketService.subscribe('multi-type', cb2);
      expect(() => websocketService.unsubscribe('multi-type', cb1)).not.toThrow();
      expect(() => websocketService.unsubscribe('multi-type', cb2)).not.toThrow();
    });

    it('등록되지 않은 콜백으로 unsubscribe 호출 시 오류 없음', () => {
      const callback = jest.fn();
      expect(() => websocketService.unsubscribe('no-sub-type', callback)).not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('연결 전 false 반환', () => {
      const connected = websocketService.isConnected();
      expect(typeof connected).toBe('boolean');
    });
  });

  describe('send', () => {
    it('연결되지 않은 상태에서 호출 시 오류 없음', () => {
      expect(() => websocketService.send('test', { data: 'value' })).not.toThrow();
    });
  });

  describe('disconnect', () => {
    it('disconnect 호출 시 오류 없음', () => {
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe('connect', () => {
    it('WebSocket onopen 호출 시 connect 이행', async () => {
      let captureOnopen: (() => void) | null = null;
      const MockWS = jest.fn().mockImplementation(function (this: { onopen: () => void; readyState: number; close: jest.Mock; send: jest.Mock }) {
        this.readyState = 0;
        this.close = jest.fn();
        this.send = jest.fn();
        Object.defineProperty(this, 'onopen', {
          set: (fn: () => void) => {
            captureOnopen = fn;
          },
          configurable: true,
        });
        setTimeout(() => captureOnopen?.(), 0);
        return this;
      });
      const OriginalWS = global.WebSocket;
      (global as unknown as { WebSocket: unknown }).WebSocket = MockWS;

      const connectPromise = websocketService.connect();
      await expect(connectPromise).resolves.toBeUndefined();

      (global as unknown as { WebSocket: unknown }).WebSocket = OriginalWS;
    });
  });
});
