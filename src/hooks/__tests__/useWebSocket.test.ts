/**
 * useWebSocket 훅 테스트
 * WebSocket 연결 관리 기능 확인
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
    errorLogger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

// WebSocket 모킹
class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readyState = MockWebSocket.CONNECTING;
    url: string;
    onopen: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;

    constructor(url: string) {
        this.url = url;
        // 비동기로 연결 시뮬레이션
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 0);
    }

    send(data: string) {
        if (this.readyState !== MockWebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }
    }

    close() {
        this.readyState = MockWebSocket.CLOSING;
        setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
                this.onclose(new CloseEvent('close'));
            }
        }, 0);
    }
}

global.WebSocket = MockWebSocket as any;

describe('useWebSocket', () => {
    const { errorLogger } = require('../../utils/errorLogger');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('WebSocket 연결을 초기화해야 함', async () => {
        const onOpen = jest.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                roomId: 'test-room',
                onOpen,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        expect(onOpen).toHaveBeenCalled();
        expect(result.current.socket).not.toBeNull();
    });

    it('메시지를 수신해야 함', async () => {
        const onMessage = jest.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                onMessage,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        // 메시지 시뮬레이션
        if (result.current.socket) {
            const messageEvent = new MessageEvent('message', {
                data: JSON.stringify({ type: 'test', data: 'hello' }),
            });
            (result.current.socket as any).onmessage(messageEvent);
        }

        await waitFor(() => {
            expect(onMessage).toHaveBeenCalled();
        });
    });

    it('문자열 메시지를 처리해야 함', async () => {
        const onMessage = jest.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                onMessage,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        // 문자열 메시지 시뮬레이션
        if (result.current.socket) {
            const messageEvent = new MessageEvent('message', {
                data: 'plain text message',
            });
            (result.current.socket as any).onmessage(messageEvent);
        }

        await waitFor(() => {
            expect(onMessage).toHaveBeenCalledWith('plain text message');
        });
    });

    it('에러를 처리해야 함', async () => {
        const onError = jest.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                onError,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        // 에러 시뮬레이션
        if (result.current.socket) {
            const errorEvent = new Event('error');
            (result.current.socket as any).onerror(errorEvent);
        }

        await waitFor(() => {
            expect(onError).toHaveBeenCalled();
        });
    });

    it('연결 종료를 처리해야 함', async () => {
        const onClose = jest.fn();
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                onClose,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        // 연결 종료
        result.current.disconnect();

        await waitFor(() => {
            expect(result.current.isConnected).toBe(false);
        });
    });

    it('메시지를 전송해야 함', async () => {
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        const sendSpy = jest.spyOn(result.current.socket!, 'send');

        result.current.sendMessage({ type: 'test', data: 'hello' });

        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'test', data: 'hello' }));
    });

    it('연결되지 않은 상태에서 메시지 전송 시 경고를 표시해야 함', () => {
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                reconnect: false,
            })
        );

        // 연결 전에 메시지 전송 시도
        result.current.sendMessage('test');

        expect(errorLogger.warn).toHaveBeenCalled();
    });

    it('재연결 기능을 제공해야 함', async () => {
        const { result } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
                reconnect: true,
                reconnectInterval: 1000,
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        // 연결 종료
        result.current.disconnect();

        await waitFor(() => {
            expect(result.current.isConnected).toBe(false);
        });

        // 재연결
        result.current.reconnect();

        jest.advanceTimersByTime(1100);

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });
    });

    it('컴포넌트 언마운트 시 연결을 정리해야 함', async () => {
        const { result, unmount } = renderHook(() =>
            useWebSocket({
                url: 'ws://localhost:5001',
            })
        );

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        const closeSpy = jest.spyOn(result.current.socket!, 'close');

        unmount();

        expect(closeSpy).toHaveBeenCalled();
    });
});

