import React, { useState, useEffect } from 'react';
import {
    BellIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    CogIcon
} from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

const RealTimeNotificationSystem: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [settings, setSettings] = useState({
        soundEnabled: true,
        desktopNotifications: true,
        autoDismiss: 5000
    });

    // 알림 생성 함수
    const createNotification = (type: Notification['type'], title: string, message: string, priority: Notification['priority'] = 'medium') => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            timestamp: new Date(),
            isRead: false,
            priority
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // 최대 20개 유지
        setUnreadCount(prev => prev + 1);

        // 데스크톱 알림
        if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/logo192.png'
            });
        }

        // 자동 제거
        if (settings.autoDismiss > 0) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, settings.autoDismiss);
        }
    };

    // 알림 제거
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // 알림 타입별 아이콘
    const getNotificationIcon = (type: Notification['type']) => {
        const icons = {
            info: InformationCircleIcon,
            warning: ExclamationTriangleIcon,
            error: ExclamationTriangleIcon,
            success: CheckCircleIcon
        };
        const Icon = icons[type];
        return <Icon className="w-5 h-5" />;
    };

    // 알림 타입별 색상
    const getNotificationColor = (type: Notification['type']) => {
        const colors = {
            info: 'text-blue-600 bg-blue-50 border-blue-200',
            warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            error: 'text-red-600 bg-red-50 border-red-200',
            success: 'text-green-600 bg-green-50 border-green-200'
        };
        return colors[type];
    };

    // 우선순위별 색상
    const getPriorityColor = (priority: Notification['priority']) => {
        const colors = {
            low: 'bg-gray-100 text-gray-600',
            medium: 'bg-blue-100 text-blue-600',
            high: 'bg-orange-100 text-orange-600',
            critical: 'bg-red-100 text-red-600'
        };
        return colors[priority];
    };

    // 시뮬레이션된 알림 생성
    useEffect(() => {
        const notificationTypes = [
            { type: 'info' as const, title: '시스템 업데이트', message: '새로운 기능이 추가되었습니다.' },
            { type: 'warning' as const, title: '메모리 사용량', message: '시스템 메모리 사용량이 높습니다.' },
            { type: 'success' as const, title: '학습 완료', message: 'AI 모델 학습이 성공적으로 완료되었습니다.' },
            { type: 'error' as const, title: '연결 오류', message: '백엔드 서버와의 연결이 불안정합니다.' }
        ];

        const interval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% 확률로 알림 생성
                const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
                const priorities: Notification['priority'][] = ['low', 'medium', 'high', 'critical'];
                const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

                createNotification(
                    randomType.type,
                    randomType.title,
                    randomType.message,
                    randomPriority
                );
            }
        }, 10000); // 10초마다 체크

        return () => clearInterval(interval);
    }, [settings]);

    return (
        <div className="relative">
            {/* 알림 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 알림 패널 */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                모두 읽음
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 알림 목록 */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>새로운 알림이 없습니다</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`mb-2 p-3 rounded-lg border ${getNotificationColor(notification.type)} ${!notification.isRead ? 'ring-2 ring-blue-200' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(notification.priority)}`}>
                                                            {notification.priority === 'low' ? '낮음' :
                                                                notification.priority === 'medium' ? '보통' :
                                                                    notification.priority === 'high' ? '높음' : '긴급'}
                                                        </span>
                                                        <button
                                                            onClick={() => removeNotification(notification.id)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {notification.timestamp.toLocaleTimeString('ko-KR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 설정 버튼 */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={() => {/* 설정 모달 열기 */ }}
                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            <CogIcon className="w-4 h-4" />
                            <span>알림 설정</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeNotificationSystem; 