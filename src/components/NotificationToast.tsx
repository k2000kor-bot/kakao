import React from 'react';
import { Notification } from '../hooks/useNotifications';

interface NotificationToastProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onRemove }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getTextColor = () => {
        switch (notification.type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
            default:
                return 'text-gray-800';
        }
    };

    const getTitleColor = () => {
        switch (notification.type) {
            case 'success':
                return 'text-green-900';
            case 'error':
                return 'text-red-900';
            case 'warning':
                return 'text-yellow-900';
            case 'info':
                return 'text-blue-900';
            default:
                return 'text-gray-900';
        }
    };

    return (
        <div
            className={`p-4 border rounded-lg shadow-lg max-w-sm w-full ${getBgColor()} animate-slide-in`}
            role="alert"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <span className="text-lg">{getIcon()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${getTitleColor()}`}>
                        {notification.title}
                    </h4>
                    <p className={`text-sm mt-1 ${getTextColor()}`}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                    <button
                        onClick={() => onRemove(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="알림 닫기"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
