/**
 * 알림 관리 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../components/NotificationCenter';
import { errorLogger } from '../utils/errorLogger';

const NOTIFICATION_STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 50;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 알림 로드
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Date 객체 복원
        const restored = parsed.map((n: { timestamp: string; [key: string]: unknown }) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(restored);
      } catch (error) {
        errorLogger.error('알림 로드 오류', error instanceof Error ? error : new Error(String(error)), { component: 'useNotifications', action: 'loadNotifications' });
      }
    }
  }, []);

  useEffect(() => {
    // 알림 변경 시 로컬 스토리지에 저장
    if (notifications.length > 0) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // 최대 개수 제한
      return updated.slice(0, MAX_NOTIFICATIONS);
    });

    // 브라우저 알림 (권한이 있는 경우)
    if ('Notification' in window && window.Notification && window.Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/icon-32x32.png',
      });
    }

    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  }, []);

  // 브라우저 알림 권한 요청
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    requestPermission,
  };
};
