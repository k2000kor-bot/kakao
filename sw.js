// CORBU.AI Service Worker
const CACHE_NAME = 'corbu-ai-v2.1.0';
const urlsToCache = [
    '/',
    '/modern_chat_interface.html',
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🤖</text></svg>'
];

// 설치 이벤트
self.addEventListener('install', event => {
    console.log('🔧 Service Worker 설치 중...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 캐시 열기 완료');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker 설치 완료');
                return self.skipWaiting();
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker 활성화 중...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 오래된 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker 활성화 완료');
            return self.clients.claim();
        })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
    // API 요청은 항상 네트워크를 통해 처리
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // API 응답을 복사하여 캐시에 저장 (선택적)
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 네트워크 오류 시 캐시된 응답 반환 (있는 경우)
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 정적 자원에 대한 캐시 우선 전략
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 캐시된 버전 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크에서 가져오기
                return fetch(event.request).then(response => {
                    // 유효한 응답이 아니면 그대로 반환
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 응답을 복사하여 캐시에 저장
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                });
            })
    );
});

// 백그라운드 동기화 (향후 확장 가능)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 백그라운드 동기화 실행');
        event.waitUntil(doBackgroundSync());
    }
});

// 푸시 알림 처리 (향후 확장 가능)
self.addEventListener('push', event => {
    console.log('📬 푸시 알림 수신:', event);

    const options = {
        body: event.data ? event.data.text() : 'CORBU.AI에서 새로운 메시지가 있습니다!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🤖</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🔔</text></svg>',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: '확인하기',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">👀</text></svg>'
            },
            {
                action: 'close',
                title: '닫기',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">❌</text></svg>'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('CORBU.AI', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
    console.log('🔔 알림 클릭:', event);
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // 아무것도 하지 않음 (알림만 닫기)
    } else {
        // 기본 동작: 앱 열기
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 백그라운드 동기화 함수 (향후 구현)
async function doBackgroundSync() {
    try {
        // 오프라인 상태에서 저장된 데이터를 서버로 전송
        console.log('🔄 백그라운드 동기화 수행 중...');
        // 구현 예정
    } catch (error) {
        console.error('❌ 백그라운드 동기화 실패:', error);
    }
}

// 에러 처리
self.addEventListener('error', event => {
    console.error('❌ Service Worker 오류:', event.error);
});

console.log('🤖 CORBU.AI Service Worker 로드 완료');
