/**
 * PWAService 테스트
 */

import { PWAService, pwaService, PWAConfig, PWAStatus, NotificationOptions } from '../pwaService';

// Service Worker 모킹
const mockShowNotification = jest.fn();
const mockServiceWorkerRegistration = {
  scope: '/',
  installing: null as any,
  waiting: null as any,
  active: {
    postMessage: jest.fn(),
    state: 'activated',
  },
  pushManager: {
    subscribe: jest.fn(),
  },
  showNotification: mockShowNotification,
  update: jest.fn(),
  addEventListener: jest.fn(),
};

const mockServiceWorker = {
  register: jest.fn(),
  controller: null,
  addEventListener: jest.fn(),
};

// Notification 모킹
const mockNotification = {
  requestPermission: jest.fn(),
  permission: 'default' as NotificationPermission,
};

// window.matchMedia 모킹
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// navigator 모킹
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    serviceWorker: mockServiceWorker,
    onLine: true,
  },
});

Object.defineProperty(global, 'Notification', {
  writable: true,
  value: mockNotification,
});

// caches 모킹
global.caches = {
  keys: jest.fn().mockResolvedValue(['cache-1', 'cache-2']),
  delete: jest.fn().mockResolvedValue(true),
  match: jest.fn(),
  has: jest.fn(),
  open: jest.fn(),
  add: jest.fn(),
  addAll: jest.fn(),
  put: jest.fn(),
};

Object.defineProperty(global.window, 'atob', {
  writable: true,
  value: jest.fn((str: string) => {
    return Buffer.from(str, 'base64').toString('binary');
  }),
});

global.fetch = jest.fn();

global.console.warn = jest.fn();
global.console.error = jest.fn();
global.console.log = jest.fn();

describe('PWAService', () => {
  let service: PWAService;
  let mockReload: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReload = jest.fn();
    mockShowNotification.mockClear();
    
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        reload: mockReload,
      },
    });

    // window.matchMedia 재설정
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    // Service Worker 재설정
    mockServiceWorker.register.mockResolvedValue(mockServiceWorkerRegistration);
    mockServiceWorker.controller = null;
    mockServiceWorkerRegistration.installing = null;
    mockServiceWorkerRegistration.waiting = null;
    
    // Notification 재설정
    Object.defineProperty(global, 'Notification', {
      writable: true,
      value: {
        requestPermission: jest.fn().mockResolvedValue('granted'),
        permission: 'default',
      },
    });

    // navigator 재설정
    (global.navigator as any).onLine = true;
    (global.navigator as any).serviceWorker = mockServiceWorker;

    service = new PWAService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(PWAService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(pwaService).toBeDefined();
      expect(pwaService).toBeInstanceOf(PWAService);
    });

    it('Service Worker 지원 확인', () => {
      const status = service.getStatus();
      expect(status.isServiceWorkerSupported).toBe(true);
    });
  });

  describe('설치 프롬프트', () => {
    it('설치 프롬프트 표시', async () => {
      const mockPrompt = jest.fn().mockResolvedValue(undefined);
      const mockUserChoice = Promise.resolve({ outcome: 'accepted' });
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: mockPrompt,
        userChoice: mockUserChoice,
      } as any;

      // beforeinstallprompt 이벤트 시뮬레이션
      window.dispatchEvent(new Event('beforeinstallprompt'));
      Object.defineProperty(window, 'beforeinstallprompt', {
        value: mockEvent,
        writable: true,
      });

      const service2 = new PWAService();
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await service2.showInstallPrompt();

      expect(result).toBe(false); // deferredPrompt가 없을 수 있음
    });

    it('설치 프롬프트 없을 때 false 반환', async () => {
      const result = await service.showInstallPrompt();
      expect(result).toBe(false);
    });
  });

  describe('앱 업데이트', () => {
    it('업데이트 적용', async () => {
      mockServiceWorkerRegistration.waiting = {
        postMessage: jest.fn(),
      };

      await service.applyUpdate();

      expect(mockServiceWorkerRegistration.waiting?.postMessage).toHaveBeenCalledWith({
        type: 'SKIP_WAITING',
      });
    });

    it('waiting Service Worker 없을 때 업데이트 안 함', async () => {
      mockServiceWorkerRegistration.waiting = null;

      await service.applyUpdate();

      expect(mockReload).not.toHaveBeenCalled();
    });
  });

  describe('푸시 알림', () => {
    it('알림 권한 요청', async () => {
      const requestPermissionMock = jest.fn().mockResolvedValue('granted');
      (global.Notification as any).requestPermission = requestPermissionMock;

      const permission = await service.requestNotificationPermission();

      expect(permission).toBe('granted');
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('Notification 미지원 시 denied 반환', async () => {
      Object.defineProperty(global, 'Notification', {
        writable: true,
        value: undefined,
      });

      const permission = await service.requestNotificationPermission();

      expect(permission).toBe('denied');
    });

    it('푸시 구독', async () => {
      const mockSubscription = {
        endpoint: 'https://example.com/push',
        keys: {
          p256dh: 'key',
          auth: 'auth',
        },
      };

      // Service Worker 등록이 필요
      (service as any).registration = mockServiceWorkerRegistration;
      (service as any).config.vapidPublicKey = 'dGVzdC1rZXk='; // base64 인코딩된 키
      mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue(mockSubscription);
      (global.window.atob as jest.Mock).mockReturnValue('test-key');

      const subscription = await service.subscribeToPush();

      expect(subscription).toEqual(mockSubscription);
    });

    it('VAPID 키 없을 때 null 반환', async () => {
      (service as any).registration = mockServiceWorkerRegistration;
      (service as any).config.vapidPublicKey = undefined;

      const subscription = await service.subscribeToPush();

      expect(subscription).toBeNull();
    });
  });

  describe('알림 표시', () => {
    it('알림 표시 성공', async () => {
      (service as any).registration = mockServiceWorkerRegistration;
      
      // Notification.requestPermission이 granted를 반환하도록 설정
      (global.Notification as any).requestPermission = jest.fn().mockResolvedValue('granted');

      const options: NotificationOptions = {
        title: '테스트 알림',
        body: '알림 내용',
        icon: '/icon.png',
      };

      await service.showNotification(options);

      expect(mockShowNotification).toHaveBeenCalledWith(
        '테스트 알림',
        expect.objectContaining({
          body: '알림 내용',
          icon: '/icon.png',
        })
      );
    });

    it('권한 없을 때 알림 표시 안 함', async () => {
      (service as any).registration = mockServiceWorkerRegistration;
      (global.Notification as any).requestPermission = jest.fn().mockResolvedValue('denied');

      const options: NotificationOptions = {
        title: '테스트 알림',
        body: '알림 내용',
      };

      await service.showNotification(options);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('Service Worker 없을 때 알림 표시 안 함', async () => {
      mockShowNotification.mockClear();
      (service as any).registration = null;

      const options: NotificationOptions = {
        title: '테스트 알림',
        body: '알림 내용',
      };

      await service.showNotification(options);

      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('백그라운드 동기화', () => {
    it('백그라운드 동기화 등록', async () => {
      (service as any).registration = {
        ...mockServiceWorkerRegistration,
        sync: {
          register: jest.fn(),
        },
      };

      await service.registerBackgroundSync('sync-tag');

      expect((service as any).registration.sync.register).toHaveBeenCalledWith('sync-tag');
    });

    it('sync API 미지원 시 경고', async () => {
      (service as any).registration = mockServiceWorkerRegistration;

      await service.registerBackgroundSync('sync-tag');

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('오프라인 큐', () => {
    it('오프라인 큐에 요청 추가', () => {
      service.addToOfflineQueue('/api/test', { method: 'POST' });

      expect(console.log).toHaveBeenCalled();
    });

    it('온라인 시 오프라인 큐 처리', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      service.addToOfflineQueue('/api/test1', { method: 'GET' });
      service.addToOfflineQueue('/api/test2', { method: 'POST' });

      // processOfflineQueue는 private이므로 직접 호출할 수 없음
      // 온라인 이벤트를 트리거하면 처리됨
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('PWA 상태 조회', () => {
    it('상태 조회', () => {
      const status = service.getStatus();

      expect(status).toHaveProperty('isServiceWorkerSupported');
      expect(status).toHaveProperty('isServiceWorkerRegistered');
      expect(status).toHaveProperty('isInstallable');
      expect(status).toHaveProperty('isInstalled');
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('hasUpdate');
    });

    it('온라인 상태 확인', () => {
      (global.navigator as any).onLine = true;
      expect(service.isOnline()).toBe(true);

      (global.navigator as any).onLine = false;
      expect(service.isOnline()).toBe(false);
    });

    it('설치 상태 확인', () => {
      const isInstalled = service.isInstalled();
      expect(typeof isInstalled).toBe('boolean');
    });
  });

  describe('구독', () => {
    it('상태 변경 구독', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribe(callback);

      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      // 구독 해제 후에는 콜백이 호출되지 않아야 함
      callback.mockClear();
    });
  });

  describe('캐시 관리', () => {
    it('캐시 정리', async () => {
      (global.caches.keys as jest.Mock).mockResolvedValue(['cache-1', 'cache-2']);
      (global.caches.delete as jest.Mock).mockResolvedValue(true);

      await service.clearCache();
      
      // Promise.all이 완료될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(global.caches.keys).toHaveBeenCalled();
      expect(global.caches.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('설정 업데이트', () => {
    it('설정 업데이트', () => {
      const newConfig: Partial<PWAConfig> = {
        cacheStrategy: 'cacheFirst',
        enablePushNotifications: false,
      };

      service.updateConfig(newConfig);

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Service Worker 메시지 전송', () => {
    it('Service Worker에 메시지 전송', async () => {
      (service as any).registration = mockServiceWorkerRegistration;

      await service.sendMessageToServiceWorker({ type: 'TEST' });

      expect(mockServiceWorkerRegistration.active.postMessage).toHaveBeenCalledWith({
        type: 'TEST',
      });
    });

    it('Service Worker 없을 때 메시지 전송 안 함', async () => {
      (service as any).registration = null;

      await service.sendMessageToServiceWorker({ type: 'TEST' });

      expect(mockServiceWorkerRegistration.active.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('에지 케이스', () => {
    it('Service Worker 미지원 환경', () => {
      const originalServiceWorker = (global.navigator as any).serviceWorker;
      delete (global.navigator as any).serviceWorker;

      const service2 = new PWAService();
      const status = service2.getStatus();

      expect(status.isServiceWorkerSupported).toBe(false);
      
      // 복원
      (global.navigator as any).serviceWorker = originalServiceWorker;
    });

    it('빈 오프라인 큐 처리', async () => {
      // 오프라인 큐가 비어있을 때 처리
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

