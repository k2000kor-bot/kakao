import React, { useEffect } from 'react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

interface NotificationToastProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
    notification,
    onRemove
}) => {
    useEffect(() => {
        if (notification.duration !== 0) {
            const timer = setTimeout(() => {
                onRemove(notification.id);
            }, notification.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [notification.id, notification.duration, onRemove]);

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

    return (
        <div className={`rounded-lg border p-4 shadow-lg ${getBgColor()} max-w-sm`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <span className="text-lg">{getIcon()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${getTextColor()}`}>
                        {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                    </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                    <button
                        onClick={() => onRemove(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
