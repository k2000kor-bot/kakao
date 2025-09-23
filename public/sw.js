// CORBU AI Ultimate System - Service Worker
const CACHE_NAME = 'corbu-ai-v2.0.0';
const STATIC_CACHE_NAME = 'corbu-ai-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'corbu-ai-dynamic-v2.0.0';
const API_CACHE_NAME = 'corbu-ai-api-v2.0.0';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// 캐시할 API 엔드포인트 패턴
const API_PATTERNS = [
  /^https:\/\/localhost:8000\/api\/status/,
  /^https:\/\/localhost:8000\/api\/metrics/,
  /^https:\/\/localhost:8000\/api\/health/,
  /^https:\/\/localhost:8000\/api\/performance/,
  /^https:\/\/localhost:8000\/api\/security/,
  /^https:\/\/localhost:8000\/api\/analytics/
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker: 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 정적 리소스 캐싱 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: 설치 실패', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: 오래된 캐시 삭제', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: 활성화 완료');
        return self.clients.claim();
      })
  );
});

// 페치 이벤트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 정적 리소스 요청 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // 기타 요청은 네트워크로 전달
  event.respondWith(fetch(request));
});

// API 요청 처리
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // 캐시 가능한 API인지 확인
  const isCacheableApi = API_PATTERNS.some(pattern => pattern.test(request.url));
  
  if (!isCacheableApi) {
    return fetch(request);
  }
  
  try {
    // 네트워크 우선 전략
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('API 네트워크 요청 실패, 캐시에서 응답:', error);
    
    // 캐시에서 응답 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 응답
    return new Response(
      JSON.stringify({
        success: false,
        error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// 정적 리소스 요청 처리
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 네트워크에서 가져오기
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('정적 리소스 네트워크 요청 실패:', error);
    
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // 기본 오프라인 응답
    return new Response('오프라인 상태입니다.', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('Service Worker: 백그라운드 동기화', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 실행
async function doBackgroundSync() {
  try {
    console.log('Service Worker: 백그라운드 동기화 실행');
    
    // 오프라인 상태에서 저장된 데이터 동기화
    const pendingRequests = await getStoredRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request);
        await removeStoredRequest(request);
      } catch (error) {
        console.error('백그라운드 동기화 실패:', error);
      }
    }
  } catch (error) {
    console.error('백그라운드 동기화 오류:', error);
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('Service Worker: 푸시 알림 수신');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CORBU AI 알림', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: 알림 클릭', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리
self.addEventListener('message', (event) => {
  console.log('Service Worker: 메시지 수신', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 저장된 요청 가져오기
async function getStoredRequests() {
  // IndexedDB에서 오프라인 요청 가져오기
  return [];
}

// 저장된 요청 제거
async function removeStoredRequest(request) {
  // IndexedDB에서 요청 제거
}

// 캐시 정리
async function cleanupCache() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // 오래된 캐시 항목 제거 (7일 이상)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader && new Date(dateHeader).getTime() < weekAgo) {
        await cache.delete(request);
      }
    }
  }
}

// 주기적 캐시 정리 (1시간마다)
setInterval(cleanupCache, 60 * 60 * 1000);