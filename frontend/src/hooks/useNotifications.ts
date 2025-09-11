import { useState, useCallback } from 'react';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: Date;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            duration: notification.duration || 5000
        };

        setNotifications(prev => [...prev, newNotification]);

        // 자동 제거
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((title: string, message: string, duration?: number) => {
        addNotification({ type: 'success', title, message, duration });
    }, [addNotification]);

    const showError = useCallback((title: string, message: string, duration?: number) => {
        addNotification({ type: 'error', title, message, duration });
    }, [addNotification]);

    const showWarning = useCallback((title: string, message: string, duration?: number) => {
        addNotification({ type: 'warning', title, message, duration });
    }, [addNotification]);

    const showInfo = useCallback((title: string, message: string, duration?: number) => {
        addNotification({ type: 'info', title, message, duration });
    }, [addNotification]);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};
