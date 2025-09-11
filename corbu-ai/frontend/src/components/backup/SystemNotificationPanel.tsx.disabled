import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    Clock,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';

interface SystemNotification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: () => void;
}

interface SystemNotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: SystemNotification[];
    onNotificationRead: (id: string) => void;
    onNotificationDismiss: (id: string) => void;
}

const SystemNotificationPanel: React.FC<SystemNotificationPanelProps> = ({
    isOpen,
    onClose,
    notifications,
    onNotificationRead,
    onNotificationDismiss
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const importantCount = notifications.filter(n => n.type === 'error' || n.type === 'warning').length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'important') return notification.type === 'error' || notification.type === 'warning';
        return true;
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-blue-200 bg-blue-50';
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
        return `${days}일 전`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">알림</h2>
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-sm rounded-md ${filter === 'all'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 text-sm rounded-md ${filter === 'unread'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                읽지 않음 ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('important')}
                                className={`px-3 py-1 text-sm rounded-md ${filter === 'important'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                중요 ({importantCount})
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence>
                            {filteredNotifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-64 text-gray-500"
                                >
                                    <Bell className="w-12 h-12 mb-4 text-gray-300" />
                                    <p className="text-sm">알림이 없습니다</p>
                                </motion.div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {filteredNotifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${notification.read ? 'opacity-60' : ''
                                                } ${getNotificationColor(notification.type)}`}
                                            onClick={() => {
                                                if (!notification.read) {
                                                    onNotificationRead(notification.id);
                                                }
                                                notification.action?.();
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    {getNotificationIcon(notification.type)}
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {formatTime(notification.timestamp)}
                                                            </span>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNotificationDismiss(notification.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>총 {notifications.length}개의 알림</span>
                            <button className="text-purple-600 hover:text-purple-700">
                                모든 알림 읽음 처리
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SystemNotificationPanel;
