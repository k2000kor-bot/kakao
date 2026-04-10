// CORBU.AI Service Worker
const CACHE_NAME = 'corbu-ai-v1.0.0';
const STATIC_CACHE = 'corbu-ai-static-v1.0.0';
const DYNAMIC_CACHE = 'corbu-ai-dynamic-v1.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API 엔드포인트들
const API_ENDPOINTS = [
  '/api/chat',
  '/api/monitoring',
  '/api/projects',
  '/api/files'
];

// 설치 시 정적 파일 캐시
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('정적 파일 캐시 중...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker 설치 실패:', error);
      })
  );
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 파일 요청 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청 처리 (네트워크 우선, 캐시 폴백)
async function handleApiRequest(request) {
  try {
    // 네트워크 요청 시도
    const networkResponse = await fetch(request);
    
    // 성공한 응답을 동적 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('네트워크 요청 실패, 캐시에서 응답:', error);
    
    // 캐시에서 응답 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 응답
    return new Response(
      JSON.stringify({
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

// 정적 파일 요청 처리 (캐시 우선, 네트워크 폴백)
async function handleStaticRequest(request) {
  // 캐시에서 먼저 찾기
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // 네트워크에서 가져오기
    const networkResponse = await fetch(request);
    
    // 성공한 응답을 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('정적 파일 요청 실패:', error);
    
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('오프라인 상태입니다.', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// 백그라운드 동기화 수행
async function performBackgroundSync() {
  try {
    // 오프라인 중에 저장된 데이터 동기화
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        // 성공한 요청은 오프라인 저장소에서 제거
        await removeOfflineData(data.id);
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
  console.log('푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CORBU.AI', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리
self.addEventListener('message', (event) => {
  console.log('Service Worker 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 오프라인 데이터 저장
async function saveOfflineData(data) {
  const db = await openDB();
  const tx = db.transaction('offlineData', 'readwrite');
  const store = tx.objectStore('offlineData');
  await store.add(data);
}

// 오프라인 데이터 조회
async function getOfflineData() {
  const db = await openDB();
  const tx = db.transaction('offlineData', 'readonly');
  const store = tx.objectStore('offlineData');
  return await store.getAll();
}

// 오프라인 데이터 제거
async function removeOfflineData(id) {
  const db = await openDB();
  const tx = db.transaction('offlineData', 'readwrite');
  const store = tx.objectStore('offlineData');
  await store.delete(id);
}

// IndexedDB 열기
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CORBU_AI_DB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 오프라인 데이터 저장소 생성
      if (!db.objectStoreNames.contains('offlineData')) {
        const store = db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// 캐시 정리 (오래된 캐시 삭제)
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  for (const cacheName of cacheNames) {
    if (!currentCaches.includes(cacheName)) {
      await caches.delete(cacheName);
      console.log('오래된 캐시 삭제:', cacheName);
    }
  }
}

// 주기적 캐시 정리 (7일마다)
setInterval(cleanupOldCaches, 7 * 24 * 60 * 60 * 1000);
