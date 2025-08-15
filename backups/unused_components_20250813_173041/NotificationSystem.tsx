import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationSystemProps {
    className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    // 알림 추가 함수
    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            duration: notification.duration || 5000
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

        // 자동 제거
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, newNotification.duration);
        }
    };

    // 알림 제거 함수
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // 전역 이벤트 리스너 (다른 컴포넌트에서 알림 트리거)
    useEffect(() => {
        const handleAddNotification = (event: CustomEvent) => {
            addNotification(event.detail);
        };

        window.addEventListener('addNotification', handleAddNotification as EventListener);
        return () => {
            window.removeEventListener('addNotification', handleAddNotification as EventListener);
        };
    }, []);

    // AI 이벤트 모니터링
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // 실시간 데이터 확인
                const response = await fetch('http://localhost:8000/api/v7/analytics/realtime');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        const realtimeData = data.realtime_data;

                        // 시스템 부하 높음 알림
                        if (realtimeData.system_load.cpu > 0.8) {
                            addNotification({
                                type: 'warning',
                                title: 'CPU 사용률 높음',
                                message: `현재 CPU 사용률이 ${(realtimeData.system_load.cpu * 100).toFixed(1)}%입니다.`,
                                duration: 8000
                            });
                        }

                        // AI 처리 대기열 많음 알림
                        if (realtimeData.ai_processing_queue > 10) {
                            addNotification({
                                type: 'info',
                                title: 'AI 처리 대기',
                                message: `${realtimeData.ai_processing_queue}개의 작업이 처리 대기 중입니다.`,
                                duration: 6000
                            });
                        }

                        // 긍정적 감정 비율 높음 알림
                        if (realtimeData.emotion_distribution.positive > 0.7) {
                            addNotification({
                                type: 'success',
                                title: '긍정적 분위기',
                                message: '대화의 긍정적 감정 비율이 높습니다! 🎉',
                                duration: 4000
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('알림 시스템 모니터링 오류:', error);
            }
        }, 30000); // 30초마다 체크

        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'error':
                return <AlertCircle className="text-red-600" size={20} />;
            case 'warning':
                return <AlertCircle className="text-yellow-600" size={20} />;
            case 'info':
            default:
                return <Info className="text-blue-600" size={20} />;
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
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 전역 함수로 다른 컴포넌트에서 사용할 수 있도록 export
    (window as any).addNotification = addNotification;

    return (
        <>
            {/* 알림 버튼 */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-lg border hover:shadow-xl transition-shadow z-50"
            >
                <Bell size={20} className={notifications.length > 0 ? 'text-blue-600' : 'text-gray-600'} />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>

            {/* 알림 패널 */}
            {isVisible && (
                <div className="fixed top-16 right-4 bg-white rounded-lg shadow-xl border max-w-sm w-full z-40 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">알림</h3>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <div className="flex items-center ml-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                    <button
                                                        onClick={() => removeNotification(notification.id)}
                                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {notification.message}
                                            </p>
                                            {notification.action && (
                                                <button
                                                    onClick={notification.action.onClick}
                                                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                                                >
                                                    {notification.action.label}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto text-gray-400 mb-2" size={24} />
                                <p className="text-sm text-gray-600">알림이 없습니다</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 팝업 알림 (화면 우상단) */}
            <div className="fixed top-4 right-20 space-y-2 z-50 pointer-events-none">
                {notifications.slice(0, 3).map((notification) => (
                    <div
                        key={`popup-${notification.id}`}
                        className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm transform transition-all duration-300 ease-in-out pointer-events-auto`}
                        style={{
                            animation: 'slideInRight 0.3s ease-out'
                        }}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600 pointer-events-auto"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </>
    );
};

export default NotificationSystem;