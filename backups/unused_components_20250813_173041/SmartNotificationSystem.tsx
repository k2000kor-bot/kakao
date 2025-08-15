import React, { useState, useEffect, useCallback } from 'react';
import {
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    SparklesIcon,
    BellIcon
} from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'ai_insight';
    title: string;
    message: string;
    timestamp: Date;
    duration?: number;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
    persistent?: boolean;
    category?: 'system' | 'user' | 'ai' | 'performance';
}

interface NotificationContextProps {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = React.createContext<NotificationContextProps | null>(null);

const SmartNotificationSystem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
        const notification: Notification = {
            ...notificationData,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            duration: notificationData.duration || (notificationData.persistent ? undefined : 5000)
        };

        setNotifications(prev => [notification, ...prev]);

        // 자동 제거 (persistent가 아닌 경우)
        if (!notification.persistent && notification.duration) {
            setTimeout(() => {
                removeNotification(notification.id);
            }, notification.duration);
        }

        // 브라우저 알림 권한 요청 및 표시
        if (notification.type === 'error' || notification.type === 'ai_insight') {
            requestBrowserNotification(notification);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const requestBrowserNotification = (notification: Notification) => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                showBrowserNotification(notification);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showBrowserNotification(notification);
                    }
                });
            }
        }
    };

    const showBrowserNotification = (notification: Notification) => {
        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.type === 'error'
        });

        browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
        };

        // 자동 닫기
        setTimeout(() => {
            browserNotification.close();
        }, 5000);
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-600" />;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
            case 'ai_insight':
                return <SparklesIcon className="w-5 h-5 text-purple-600" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationStyle = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'ai_insight':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const formatTimeAgo = (timestamp: Date): string => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return timestamp.toLocaleDateString();
    };

    const categorizeNotifications = () => {
        const categorized = {
            system: notifications.filter(n => n.category === 'system'),
            user: notifications.filter(n => n.category === 'user'),
            ai: notifications.filter(n => n.category === 'ai'),
            performance: notifications.filter(n => n.category === 'performance'),
            uncategorized: notifications.filter(n => !n.category)
        };
        return categorized;
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification, clearAllNotifications }}>
            {children}

            {/* 알림 컨테이너 */}
            <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
                {/* 알림 헤더 */}
                {notifications.length > 0 && (
                    <div className="mb-2 flex items-center justify-between bg-white rounded-lg shadow-lg p-3 border">
                        <div className="flex items-center space-x-2">
                            <BellIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                                알림 ({notifications.length})
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                {isMinimized ? '펼치기' : '접기'}
                            </button>
                            <button
                                onClick={clearAllNotifications}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                모두 삭제
                            </button>
                        </div>
                    </div>
                )}

                {/* 알림 목록 */}
                {!isMinimized && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                            <div
                                key={notification.id}
                                className={`rounded-lg border p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${getNotificationStyle(notification.type)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium truncate">
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs opacity-75 ml-2">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1 opacity-90">
                                                {notification.message}
                                            </p>

                                            {/* 액션 버튼 */}
                                            {notification.actionButton && (
                                                <button
                                                    onClick={notification.actionButton.onClick}
                                                    className="mt-2 text-xs font-medium underline hover:no-underline"
                                                >
                                                    {notification.actionButton.label}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 닫기 버튼 */}
                                    <button
                                        onClick={() => removeNotification(notification.id)}
                                        className="flex-shrink-0 ml-3 opacity-60 hover:opacity-100 transition-opacity"
                                        aria-label="알림 닫기"
                                        title="알림 닫기"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* 진행 바 (자동 사라지는 알림용) */}
                                {!notification.persistent && notification.duration && (
                                    <div className="mt-3 w-full bg-black bg-opacity-10 rounded-full h-1">
                                        <div
                                            className="bg-current h-1 rounded-full transition-all duration-75"
                                            style={{
                                                animation: `shrink ${notification.duration}ms linear forwards`
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* 더 많은 알림이 있을 때 */}
                        {notifications.length > 5 && (
                            <div className="text-center py-2">
                                <span className="text-sm text-gray-500">
                                    +{notifications.length - 5}개 더...
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </NotificationContext.Provider>
    );
};

// 훅으로 알림 시스템 사용
export const useNotification = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within SmartNotificationSystem');
    }
    return context;
};

// 미리 정의된 알림 유틸리티
export const createNotification = {
    success: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'success' as const,
        title,
        message,
        category: 'user' as const,
        ...options
    }),

    error: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'error' as const,
        title,
        message,
        category: 'system' as const,
        persistent: true,
        ...options
    }),

    warning: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'warning' as const,
        title,
        message,
        category: 'system' as const,
        duration: 8000,
        ...options
    }),

    info: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'info' as const,
        title,
        message,
        category: 'user' as const,
        ...options
    }),

    aiInsight: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'ai_insight' as const,
        title,
        message,
        category: 'ai' as const,
        duration: 10000,
        ...options
    }),

    performance: (title: string, message: string, options?: Partial<Notification>) => ({
        type: 'warning' as const,
        title,
        message,
        category: 'performance' as const,
        duration: 8000,
        ...options
    })
};

export default SmartNotificationSystem;
