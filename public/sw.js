// CORBU AI Progressive Web App Service Worker
// 오프라인 지원, 캐싱, 백그라운드 동기화를 제공

const CACHE_NAME = 'corbu-ai-v1.1.0';
const RUNTIME_CACHE = 'corbu-ai-runtime';
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 네트워크 우선 전략을 위한 URL 패턴
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
    /\/socket\.io\//,
    /localhost:8001/,
    /localhost:8005/,
    /localhost:8006/
];

// 캐시 우선 전략을 위한 URL 패턴
const CACHE_FIRST_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:css|js)$/,
    /fonts\//,
    /icons\//
];

// 설치 이벤트 - 초기 리소스 캐싱
self.addEventListener('install', event => {
    console.log('[SW] 🚀 Service Worker 설치 중...');

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] 📦 초기 리소스 캐싱 중...');
            return cache.addAll(PRECACHE_URLS);
        }).then(() => {
            console.log('[SW] ✅ 초기 리소스 캐싱 완료');
            return self.skipWaiting();
        }).catch(error => {
            console.error('[SW] ❌ 캐싱 실패:', error);
        })
    );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', event => {
    console.log('[SW] 🔄 Service Worker 활성화 중...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[SW] 🗑️ 이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] ✅ Service Worker 활성화 완료');
            return self.clients.claim();
        })
    );
});

// 네트워크 요청 인터셉트 및 캐싱 전략 적용
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // POST 요청은 캐시하지 않음
    if (request.method !== 'GET') {
        return;
    }

    // Chrome extension 요청 무시
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // API 요청 - 네트워크 우선 전략
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 정적 리소스 - 캐시 우선 전략
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML 페이지 - 네트워크 우선, 오프라인 시 캐시
    if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
        return;
    }

    // 기본 - 스테일 앤 리벨리데이트 전략
    event.respondWith(staleWhileRevalidate(request));
});

// 네트워크 우선 전략
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('[SW] 📡 네트워크 실패, 캐시에서 조회:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // 오프라인 폴백 페이지
        if (request.destination === 'document') {
            return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CORBU AI - 오프라인</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .offline-container {
              padding: 40px;
              border-radius: 16px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            .offline-title { font-size: 24px; margin-bottom: 16px; }
            .offline-message { font-size: 16px; opacity: 0.9; line-height: 1.5; }
            .retry-button {
              margin-top: 20px;
              padding: 12px 24px;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-size: 14px;
            }
            .retry-button:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <div class="offline-title">CORBU AI</div>
            <div class="offline-message">
              인터넷 연결을 확인해주세요.<br>
              오프라인 상태에서도 일부 기능을 사용할 수 있습니다.
            </div>
            <button class="retry-button" onclick="window.location.reload()">
              다시 시도
            </button>
          </div>
        </body>
        </html>
      `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        throw error;
    }
}

// 캐시 우선 전략
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] ❌ 리소스 로드 실패:', request.url, error);
        throw error;
    }
}

// 스테일 앤 리벨리데이트 전략
async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('[SW] 🔄 백그라운드 업데이트 실패:', request.url, error);
        return cachedResponse;
    });

    return cachedResponse || fetchPromise;
}

// 백그라운드 동기화
self.addEventListener('sync', event => {
    console.log('[SW] 🔄 백그라운드 동기화:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // 오프라인 중에 저장된 데이터 동기화
        const offlineData = await getOfflineData();

        if (offlineData.length > 0) {
            for (const data of offlineData) {
                await syncData(data);
            }
            await clearOfflineData();
            console.log('[SW] ✅ 백그라운드 동기화 완료');
        }
    } catch (error) {
        console.error('[SW] ❌ 백그라운드 동기화 실패:', error);
    }
}

// 푸시 알림
self.addEventListener('push', event => {
    console.log('[SW] 📢 푸시 알림 수신:', event);

    const options = {
        body: '새로운 메시지가 도착했습니다.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'corbu-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: '열기',
                icon: '/icons/action-open.png'
            },
            {
                action: 'dismiss',
                title: '닫기',
                icon: '/icons/action-close.png'
            }
        ],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    if (event.data) {
        const payloadData = event.data.json();
        options.body = payloadData.body || options.body;
        options.data = { ...options.data, ...payloadData };
    }

    event.waitUntil(
        self.registration.showNotification('CORBU AI', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
    console.log('[SW] 🔔 알림 클릭:', event);

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'dismiss') {
        // 알림만 닫기
        return;
    } else {
        // 기본 동작 - 앱 열기
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// 메시지 처리 (앱과의 통신)
self.addEventListener('message', event => {
    console.log('[SW] 📨 메시지 수신:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// 유틸리티 함수들
async function getOfflineData() {
    // IndexedDB에서 오프라인 데이터 조회
    return [];
}

async function syncData(data) {
    // 서버로 데이터 동기화
    try {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (error) {
        throw error;
    }
}

async function clearOfflineData() {
    // 동기화 완료된 오프라인 데이터 삭제
    return true;
}

// 에러 처리
self.addEventListener('error', event => {
    console.error('[SW] ❌ Service Worker 오류:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] ❌ 처리되지 않은 Promise 거부:', event.reason);
    event.preventDefault();
});

console.log('[SW] 🎉 CORBU AI Service Worker 로드 완료');
