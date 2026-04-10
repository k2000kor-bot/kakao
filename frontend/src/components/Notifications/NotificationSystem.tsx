import React, { useState, useEffect } from 'react';
import {
    Bell,
    X,
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
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
    onNotificationAction: _onNotificationAction,
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
                return <CheckCircle className="h-5 w-5 bw-text-success" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 bw-text-error" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 bw-text-warning" />;
            case 'info':
                return <Info className="h-5 w-5 bw-text-info" />;
            default:
                return <Info className="h-5 w-5 bw-text-muted" />;
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
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="bw-btn-ghost relative p-2 rounded-lg"
            >
                <Bell className="h-5 w-5 bw-text-secondary" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                        style={{ background: 'var(--accent-error)' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 bw-card rounded-lg shadow-xl z-[var(--z-dropdown)] border border-[var(--border-color)]"
                    >
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="font-semibold bw-text-primary">알림</h3>
                            <div className="flex items-center space-x-2">
                                {onSoundToggle && (
                                    <button type="button" onClick={() => onSoundToggle(!soundEnabled)} className="bw-btn-ghost p-1 rounded" title={soundEnabled ? '소리 끄기' : '소리 켜기'} aria-label={soundEnabled ? '알림 소리 끄기' : '알림 소리 켜기'}>
                                        {soundEnabled ? <Volume2 className="h-4 w-4 bw-text-muted" aria-hidden="true" /> : <VolumeX className="h-4 w-4 bw-text-muted" aria-hidden="true" />}
                                    </button>
                                )}
                                <button type="button" onClick={() => setShowDropdown(false)} className="bw-btn-ghost p-1 rounded" aria-label="알림 패널 닫기">
                                    <X className="h-4 w-4 bw-text-muted" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {(onClearAll || onMarkAllRead) && (
                            <div className="flex items-center justify-between px-4 py-2 border-b bw-card-secondary" style={{ borderColor: 'var(--border-color)' }}>
                                {onMarkAllRead && (
                                    <button type="button" onClick={onMarkAllRead} className="text-sm bw-text-info font-medium" aria-label="모든 알림 읽음 처리">
                                        모두 읽음 처리
                                    </button>
                                )}
                                {onClearAll && (
                                    <button type="button" onClick={onClearAll} className="text-sm bw-text-error font-medium" aria-label="모든 알림 삭제">
                                        모두 지우기
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="bw-empty p-8">
                                    <Bell className="h-12 w-12 bw-empty-icon mx-auto mb-4" />
                                    <p>새로운 알림이 없습니다</p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                    <AnimatePresence>
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`p-4 transition-colors cursor-pointer ${!notification.read ? 'bw-card-secondary' : ''}`}
                                                style={!notification.read ? { background: 'var(--accent-info-muted)' } : undefined}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {getNotificationIcon(notification.type)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-medium bw-text-primary">
                                                                {notification.title}
                                                            </h4>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs bw-text-muted">
                                                                    {formatTime(notification.timestamp)}
                                                                </span>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-info)' }} />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onNotificationDismiss(notification.id);
                                                                    }}
                                                                    className="bw-btn-ghost p-1 rounded"
                                                                    aria-label={`${notification.title} 알림 닫기`}
                                                                >
                                                                    <X className="h-3 w-3 bw-text-muted" aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm bw-text-secondary mt-1">
                                                            {notification.message}
                                                        </p>
                                                        {notification.action && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    notification.action?.onClick();
                                                                }}
                                                                className="mt-2 text-sm bw-text-info font-medium"
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

                        {notifications.length > 0 && (
                            <div className="p-4 border-t bw-card-secondary" style={{ borderColor: 'var(--border-color)' }}>
                                <button type="button" onClick={() => setShowDropdown(false)} className="w-full text-sm bw-text-secondary font-medium" aria-label="모든 알림 보기 페이지로 이동">
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
