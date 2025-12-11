/**
 * notificationService 서비스 테스트
 * 고급 알림 서비스 테스트
 */

import { notificationService, NotificationData } from '../notificationService';

// 브라우저 API 모킹
const mockNotification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted'),
};

const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
    },
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
};

const mockVibrate = jest.fn();
const mockLocalStorage: { [key: string]: string } = {};

// localStorage 헬퍼 함수
const clearMockLocalStorage = () => {
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
};

beforeAll(() => {
  // Notification API 모킹
  (global as any).Notification = jest.fn().mockImplementation((title: string, options?: any) => ({
    title,
    ...options,
    onclick: null,
    close: jest.fn(),
  }));
  Object.assign(global as any, { Notification: { ...mockNotification, permission: 'granted' } });

  // AudioContext 모킹
  (global as any).AudioContext = jest.fn(() => mockAudioContext);
  (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

  // navigator.vibrate 모킹
  Object.defineProperty(navigator, 'vibrate', {
    value: mockVibrate,
    writable: true,
    configurable: true,
  });

  // localStorage 모킹
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        clearMockLocalStorage();
      }),
    },
    writable: true,
    configurable: true,
  });
});

describe('notificationService', () => {
  beforeEach(() => {
    // 알림 목록 초기화
    notificationService.clearAllNotifications();
    jest.clearAllMocks();
    clearMockLocalStorage();
  });

  describe('addNotification', () => {
    it('알림을 추가할 수 있어야 함', () => {
      const id = notificationService.addNotification({
        type: 'info',
        title: '테스트 알림',
        message: '테스트 메시지',
        priority: 'low',
        category: 'system',
      });

      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('테스트 알림');
      expect(notifications[0].message).toBe('테스트 메시지');
    });

    it('알림에 ID와 타임스탬프를 자동으로 추가해야 함', () => {
      const id = notificationService.addNotification({
        type: 'success',
        title: '성공',
        message: '작업 완료',
        priority: 'medium',
        category: 'system',
      });

      const notifications = notificationService.getNotifications();
      expect(notifications[0].id).toBe(id);
      expect(notifications[0].timestamp).toBeDefined();
    });

    it('설정이 비활성화되어 있으면 알림을 추가하지 않아야 함', () => {
      notificationService.updateSettings({ enabled: false });
      
      const id = notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      expect(id).toBe('');
      expect(notificationService.getNotifications()).toHaveLength(0);
      
      // 설정 복원
      notificationService.updateSettings({ enabled: true });
    });

    it('카테고리가 비활성화되어 있으면 알림을 추가하지 않아야 함', () => {
      notificationService.updateSettings({
        categories: {
          system: false,
          security: true,
          performance: true,
          ai: true,
          user: true,
        },
      });

      const id = notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      expect(id).toBe('');
      
      // 설정 복원
      notificationService.updateSettings({
        categories: {
          system: true,
          security: true,
          performance: true,
          ai: true,
          user: true,
        },
      });
    });

    it('최대 알림 수를 초과하면 오래된 알림을 제거해야 함', () => {
      // 50개보다 많은 알림 추가
      for (let i = 0; i < 55; i++) {
        notificationService.addNotification({
          type: 'info',
          title: `알림 ${i}`,
          message: '테스트',
          priority: 'low',
          category: 'system',
        });
      }

      const notifications = notificationService.getNotifications();
      expect(notifications.length).toBeLessThanOrEqual(50);
    });
  });

  describe('removeNotification', () => {
    it('알림을 제거할 수 있어야 함', () => {
      const id = notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      notificationService.removeNotification(id);
      expect(notificationService.getNotifications()).toHaveLength(0);
    });

    it('존재하지 않는 알림을 제거하려고 해도 에러가 발생하지 않아야 함', () => {
      expect(() => {
        notificationService.removeNotification('nonexistent-id');
      }).not.toThrow();
    });
  });

  describe('clearAllNotifications', () => {
    it('모든 알림을 제거해야 함', () => {
      notificationService.addNotification({
        type: 'info',
        title: '알림 1',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      notificationService.addNotification({
        type: 'warning',
        title: '알림 2',
        message: '테스트',
        priority: 'medium',
        category: 'system',
      });

      notificationService.clearAllNotifications();
      expect(notificationService.getNotifications()).toHaveLength(0);
    });
  });

  describe('clearNotificationsByCategory', () => {
    it('특정 카테고리의 알림만 제거해야 함', () => {
      notificationService.addNotification({
        type: 'info',
        title: '시스템 알림',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      notificationService.addNotification({
        type: 'security',
        title: '보안 알림',
        message: '테스트',
        priority: 'high',
        category: 'security',
      });

      notificationService.clearNotificationsByCategory('system');
      
      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].category).toBe('security');
    });
  });

  describe('getNotifications', () => {
    it('모든 알림을 반환해야 함', () => {
      notificationService.addNotification({
        type: 'info',
        title: '알림 1',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      notificationService.addNotification({
        type: 'warning',
        title: '알림 2',
        message: '테스트',
        priority: 'medium',
        category: 'system',
      });

      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(2);
    });

    it('복사본을 반환해야 함 (원본 수정 방지)', () => {
      notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      const notifications1 = notificationService.getNotifications();
      const notifications2 = notificationService.getNotifications();
      
      expect(notifications1).not.toBe(notifications2);
      expect(notifications1).toEqual(notifications2);
    });
  });

  describe('getNotificationsByCategory', () => {
    it('특정 카테고리의 알림만 반환해야 함', () => {
      notificationService.addNotification({
        type: 'info',
        title: '시스템 알림',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      notificationService.addNotification({
        type: 'security',
        title: '보안 알림',
        message: '테스트',
        priority: 'high',
        category: 'security',
      });

      const systemNotifications = notificationService.getNotificationsByCategory('system');
      expect(systemNotifications).toHaveLength(1);
      expect(systemNotifications[0].category).toBe('system');
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 수를 반환해야 함', () => {
      expect(notificationService.getUnreadCount()).toBe(0);
      
      notificationService.addNotification({
        type: 'info',
        title: '알림 1',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      expect(notificationService.getUnreadCount()).toBe(1);
      
      notificationService.addNotification({
        type: 'warning',
        title: '알림 2',
        message: '테스트',
        priority: 'medium',
        category: 'system',
      });
      expect(notificationService.getUnreadCount()).toBe(2);
    });
  });

  describe('getUnreadCountByCategory', () => {
    it('특정 카테고리의 읽지 않은 알림 수를 반환해야 함', () => {
      notificationService.addNotification({
        type: 'info',
        title: '시스템 알림',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });
      notificationService.addNotification({
        type: 'security',
        title: '보안 알림',
        message: '테스트',
        priority: 'high',
        category: 'security',
      });

      expect(notificationService.getUnreadCountByCategory('system')).toBe(1);
      expect(notificationService.getUnreadCountByCategory('security')).toBe(1);
    });
  });

  describe('updateSettings', () => {
    it('설정을 업데이트할 수 있어야 함', () => {
      notificationService.updateSettings({ enabled: false });
      
      const settings = notificationService.getSettings();
      expect(settings.enabled).toBe(false);
      
      // 설정 복원
      notificationService.updateSettings({ enabled: true });
    });

    it('설정을 localStorage에 저장해야 함', () => {
      notificationService.updateSettings({ duration: 3000 });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'notificationSettings',
        expect.stringContaining('"duration":3000')
      );
    });
  });

  describe('getSettings', () => {
    it('현재 설정을 반환해야 함', () => {
      const settings = notificationService.getSettings();
      
      expect(settings).toHaveProperty('enabled');
      expect(settings).toHaveProperty('sound');
      expect(settings).toHaveProperty('vibration');
      expect(settings).toHaveProperty('desktop');
      expect(settings).toHaveProperty('categories');
      expect(settings).toHaveProperty('autoClose');
      expect(settings).toHaveProperty('duration');
    });

    it('복사본을 반환해야 함', () => {
      const settings1 = notificationService.getSettings();
      const settings2 = notificationService.getSettings();
      
      expect(settings1).not.toBe(settings2);
      expect(settings1).toEqual(settings2);
    });
  });

  describe('편의 메서드들', () => {
    it('success 메서드가 작동해야 함', () => {
      const id = notificationService.success('성공', '작업이 완료되었습니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].priority).toBe('medium');
    });

    it('warning 메서드가 작동해야 함', () => {
      const id = notificationService.warning('경고', '주의가 필요합니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('warning');
      expect(notifications[0].priority).toBe('high');
    });

    it('error 메서드가 작동해야 함', () => {
      const id = notificationService.error('오류', '오류가 발생했습니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].priority).toBe('critical');
      expect(notifications[0].persistent).toBe(true);
    });

    it('info 메서드가 작동해야 함', () => {
      const id = notificationService.info('정보', '정보 메시지입니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].priority).toBe('low');
    });

    it('security 메서드가 작동해야 함', () => {
      const id = notificationService.security('보안', '보안 알림입니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('security');
      expect(notifications[0].category).toBe('security');
      expect(notifications[0].persistent).toBe(true);
    });

    it('performance 메서드가 작동해야 함', () => {
      const id = notificationService.performance('성능', '성능 알림입니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('performance');
      expect(notifications[0].category).toBe('performance');
    });

    it('ai 메서드가 작동해야 함', () => {
      const id = notificationService.ai('AI', 'AI 알림입니다');
      
      expect(id).toBeTruthy();
      const notifications = notificationService.getNotifications();
      expect(notifications[0].type).toBe('ai');
      expect(notifications[0].category).toBe('ai');
    });
  });

  describe('이벤트 리스너', () => {
    it('이벤트 리스너를 등록할 수 있어야 함', () => {
      const callback = jest.fn();
      
      notificationService.on('notificationAdded', callback);
      
      notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      expect(callback).toHaveBeenCalled();
    });

    it('이벤트 리스너를 제거할 수 있어야 함', () => {
      const callback = jest.fn();
      
      notificationService.on('notificationAdded', callback);
      notificationService.off('notificationAdded', callback);
      
      notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('여러 이벤트 리스너를 등록할 수 있어야 함', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      notificationService.on('notificationsChanged', callback1);
      notificationService.on('notificationsChanged', callback2);
      
      notificationService.addNotification({
        type: 'info',
        title: '테스트',
        message: '테스트',
        priority: 'low',
        category: 'system',
      });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});

