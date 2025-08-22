import React, { useState, useEffect } from 'react';
import {
    Bell,
    X,
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    autoDismiss?: boolean;
    duration?: number;
}

interface NotificationSystemProps {
    notifications: Notification[];
    onNotificationDismiss: (id: string) => void;
    onNotificationRead: (id: string) => void;
    onNotificationAction?: (id: string, action: string) => void;
    onClearAll?: () => void;
    onMarkAllRead?: () => void;
    soundEnabled?: boolean;
    onSoundToggle?: (enabled: boolean) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
    notifications,
    onNotificationDismiss,
    onNotificationRead,
    onNotificationAction,
    onClearAll,
    onMarkAllRead,
    soundEnabled = true,
    onSoundToggle
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'info':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onNotificationRead(notification.id);
        }
    };

    return (
        <div className="relative">
            {/* 알림 버튼 */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                )}
            </button>

            {/* 알림 드롭다운 */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">알림</h3>
                            <div className="flex items-center space-x-2">
                                {onSoundToggle && (
                                    <button
                                        onClick={() => onSoundToggle(!soundEnabled)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title={soundEnabled ? '소리 끄기' : '소리 켜기'}
                                    >
                                        {soundEnabled ? (
                                            <Volume2 className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <VolumeX className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        {(onClearAll || onMarkAllRead) && (
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                                {onMarkAllRead && (
                                    <button
                                        onClick={onMarkAllRead}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        모두 읽음 처리
                                    </button>
                                )}
                                {onClearAll && (
                                    <button
                                        onClick={onClearAll}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        모두 지우기
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 알림 목록 */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">새로운 알림이 없습니다</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    <AnimatePresence>
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                    }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {getNotificationIcon(notification.type)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {notification.title}
                                                            </h4>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs text-gray-500">
                                                                    {formatTime(notification.timestamp)}
                                                                </span>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onNotificationDismiss(notification.id);
                                                                    }}
                                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                >
                                                                    <X className="h-3 w-3 text-gray-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        {notification.action && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    notification.action?.onClick();
                                                                }}
                                                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                            >
                                                                {notification.action.label}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* 푸터 */}
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    모든 알림 보기
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationSystem;
