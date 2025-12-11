/**
 * Service Worker 관리 훅
 * Service Worker 등록, 업데이트, 캐시 관리 기능 제공
 */

import { useState, useEffect, useCallback } from 'react';
import { errorLogger } from '../utils/errorLogger';

interface ServiceWorkerState {
    registration: ServiceWorkerRegistration | null;
    updateAvailable: boolean;
    offline: boolean;
    cacheSize: number;
}

interface UseServiceWorkerReturn extends ServiceWorkerState {
    updateServiceWorker: () => Promise<void>;
    clearCache: () => Promise<void>;
    getCacheSize: () => Promise<number>;
    skipWaiting: () => Promise<void>;
}

export const useServiceWorker = (): UseServiceWorkerReturn => {
    const [state, setState] = useState<ServiceWorkerState>({
        registration: null,
        updateAvailable: false,
        offline: !navigator.onLine,
        cacheSize: 0,
    });

    // Service Worker 등록
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    setState((prev) => ({ ...prev, registration }));

                    // 업데이트 확인
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setState((prev) => ({ ...prev, updateAvailable: true }));
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    errorLogger.error('Service Worker 등록 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useServiceWorker', action: 'registerServiceWorker' });
                });
        }

        // 온라인/오프라인 상태 감지
        const handleOnline = () => setState((prev) => ({ ...prev, offline: false }));
        const handleOffline = () => setState((prev) => ({ ...prev, offline: true }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Service Worker 업데이트
    const updateServiceWorker = useCallback(async () => {
        if (state.registration) {
            await state.registration.update();
        }
    }, [state.registration]);

    // 캐시 삭제
    const clearCache = useCallback(async () => {
        if (navigator.serviceWorker.controller) {
            return new Promise<void>((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = () => {
                    setState((prev) => ({ ...prev, cacheSize: 0 }));
                    resolve();
                };
                navigator.serviceWorker.controller?.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [channel.port2]
                );
            });
        }
    }, []);

    // 캐시 크기 조회
    const getCacheSize = useCallback(async (): Promise<number> => {
        if (navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    const size = event.data.size || 0;
                    setState((prev) => ({ ...prev, cacheSize: size }));
                    resolve(size);
                };
                navigator.serviceWorker.controller?.postMessage(
                    { type: 'GET_CACHE_SIZE' },
                    [channel.port2]
                );
            });
        }
        return 0;
    }, []);

    // Service Worker 즉시 활성화
    const skipWaiting = useCallback(async () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, []);

    // 초기 캐시 크기 조회
    useEffect(() => {
        if (state.registration) {
            getCacheSize();
        }
    }, [state.registration, getCacheSize]);

    return {
        ...state,
        updateServiceWorker,
        clearCache,
        getCacheSize,
        skipWaiting,
    };
};

