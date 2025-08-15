import React, { useState, useEffect } from 'react';
import {
  StarIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}

const StableNotificationSystem: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 샘플 알림 데이터
    useEffect(() => {
        const sampleNotifications: Notification[] = [
            {
                id: '1',
                type: 'info',
                title: '시스템 시작',
                message: 'AI 대화분석 시스템이 시작되었습니다.',
                timestamp: new Date(),
                isRead: false
            },
            {
                id: '2',
                type: 'success',
                title: '분석 완료',
                message: '대화 분석이 성공적으로 완료되었습니다.',
                timestamp: new Date(Date.now() - 300000),
                isRead: false
            },
            {
                id: '3',
                type: 'warning',
                title: '주의사항',
                message: '일부 메시지에서 감정 분석이 어려울 수 있습니다.',
                timestamp: new Date(Date.now() - 600000),
                isRead: true
            }
        ];
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => {
            const notification = notifications.find(n => n.id === id);
            return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
            case 'error':
                return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
            case 'warning':
                return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
            default:
                return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
        }
    };

    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return timestamp.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* 알림 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 알림 드롭다운 */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                알림이 없습니다
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeNotification(notification.id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                                                    >
                                                        읽음으로 표시
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                    setUnreadCount(0);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                모두 읽음으로 표시
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StableNotificationSystem; 