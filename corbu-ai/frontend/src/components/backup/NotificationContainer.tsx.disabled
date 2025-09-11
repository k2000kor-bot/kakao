import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification, clearAllNotifications } = useNotifications();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {/* 알림 헤더 */}
            {notifications.length > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        {notifications.length}개의 알림
                    </span>
                    <button
                        onClick={clearAllNotifications}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        모두 지우기
                    </button>
                </div>
            )}

            {/* 알림 목록 */}
            <div className="space-y-2">
                {notifications.map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationContainer;
