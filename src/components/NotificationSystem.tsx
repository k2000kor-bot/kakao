import React, { useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    duration?: number; // 자동 제거 시간 (ms)
}

interface NotificationSystemProps {
    className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // 알림 추가 함수
    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
        };

        setNotifications(prev => [...prev, newNotification]);

        // 자동 제거
        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, notification.duration || 5000);
        }
    };

    // 알림 제거 함수
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // 전역 알림 함수를 window 객체에 추가
    useEffect(() => {
        (window as any).showNotification = addNotification;

        return () => {
            delete (window as any).showNotification;
        };
    }, []);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'info': return 'ℹ️';
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className={`notification-system ${className}`}>
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div className="notification-header">
                        <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                        <span className="notification-title">{notification.title}</span>
                        <button
                            className="notification-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.timestamp)}</div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
