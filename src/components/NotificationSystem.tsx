import React, { useState, useEffect } from 'react';
import {
    BellIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    SparklesIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../hooks/useWebSocket';

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: string;
    priority?: 'low' | 'normal' | 'high';
    room_id?: string;
    read?: boolean;
    action?: {
        label: string;
        callback: () => void;
    };
}

interface NotificationSystemProps {
    clientId: string;
    currentRoom?: string;
    onNotificationClick?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
    clientId,
    currentRoom,
    onNotificationClick
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { isConnected, lastMessage, subscribeToRoom, connectionStatus } = useWebSocket({
        clientId,
        autoReconnect: true
    });

    // 현재 채팅방 구독
    useEffect(() => {
        if (isConnected && currentRoom) {
            subscribeToRoom(currentRoom);
        }
    }, [isConnected, currentRoom, subscribeToRoom]);

    // 새 메시지 처리
    useEffect(() => {
        if (lastMessage && lastMessage.type !== 'heartbeat_response' && lastMessage.type !== 'connection_confirmed') {
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: lastMessage.type,
                title: lastMessage.title || getDefaultTitle(lastMessage.type),
                content: lastMessage.content || '',
                timestamp: lastMessage.timestamp,
                priority: getPriority(lastMessage.type),
                room_id: lastMessage.room_id,
                read: false
            };

            // 특별한 알림 타입 처리
            if (lastMessage.type === 'message_generated') {
                newNotification.action = {
                    label: '확인하기',
                    callback: () => {
                        // 메시지 생성 완료 시 스크롤 또는 새로고침
                        window.location.reload();
                    }
                };
            }

            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // 최대 20개 유지
            setUnreadCount(prev => prev + 1);

            // 토스트 알림 표시
            showToastNotification(newNotification);
        }
    }, [lastMessage]);

    // 기본 제목 생성
    const getDefaultTitle = (type: string): string => {
        switch (type) {
            case 'message_generated': return 'AI 메시지 생성 완료';
            case 'learning_update': return 'AI 학습 업데이트';
            case 'room_notification': return '채팅방 알림';
            case 'broadcast_notification': return '시스템 알림';
            default: return '새 알림';
        }
    };

    // 우선순위 결정
    const getPriority = (type: string): 'low' | 'normal' | 'high' => {
        switch (type) {
            case 'message_generated': return 'high';
            case 'learning_update': return 'normal';
            case 'room_notification': return 'normal';
            case 'broadcast_notification': return 'high';
            default: return 'normal';
        }
    };

    // 토스트 알림 표시
    const showToastNotification = (notification: Notification) => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-80 max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;

        const priorityColors = {
            low: 'border-l-gray-400',
            normal: 'border-l-blue-400',
            high: 'border-l-red-400'
        };

        toast.innerHTML = `
            <div class="border-l-4 ${priorityColors[notification.priority || 'normal']} pl-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            ${getNotificationIcon(notification.type)}
                            <h4 class="font-semibold text-gray-800 text-sm">${notification.title}</h4>
                        </div>
                        <p class="text-gray-600 text-xs">${notification.content}</p>
                        ${notification.room_id ? `<p class="text-gray-400 text-xs mt-1">${notification.room_id}</p>` : ''}
                    </div>
                    <button class="ml-2 text-gray-400 hover:text-gray-600 p-1" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // 애니메이션으로 표시
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // 5초 후 자동 제거
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    };

    // 알림 아이콘 반환
    const getNotificationIcon = (type: string): string => {
        const iconClass = "w-4 h-4";
        switch (type) {
            case 'message_generated':
                return `<svg class="${iconClass} text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`;
            case 'learning_update':
                return `<svg class="${iconClass} text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>`;
            case 'room_notification':
                return `<svg class="${iconClass} text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`;
            default:
                return `<svg class="${iconClass} text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }
    };

    // 알림 읽음 처리
    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
    };

    // 알림 삭제
    const deleteNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    // 연결 상태 아이콘
    const getConnectionStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
            case 'connecting':
                return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
            case 'error':
                return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
            default:
                return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
        }
    };

    return (
        <div className="relative">
            {/* 알림 버튼 */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="실시간 알림"
            >
                <BellIcon className="w-6 h-6" />

                {/* 읽지 않은 알림 배지 */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* 연결 상태 표시 */}
                <div className="absolute -bottom-1 -right-1">
                    {getConnectionStatusIcon()}
                </div>
            </button>

            {/* 알림 드롭다운 */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                            <BellIcon className="w-4 h-4" />
                            <span>실시간 알림</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${isConnected
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {isConnected ? '연결됨' : '연결 끊김'}
                            </span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    모두 읽음
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 알림 목록 */}
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">알림이 없습니다</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (onNotificationClick) {
                                            onNotificationClick(notification);
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                {notification.type === 'message_generated' && <SparklesIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                                                {notification.type === 'learning_update' && <AcademicCapIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                                {notification.type === 'room_notification' && <InformationCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                                {notification.type === 'broadcast_notification' && <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />}

                                                <h4 className={`text-sm truncate ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                                    }`}>
                                                    {notification.title}
                                                </h4>

                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                                {notification.content}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                                </span>

                                                {notification.room_id && (
                                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        {notification.room_id}
                                                    </span>
                                                )}
                                            </div>

                                            {notification.action && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        notification.action!.callback();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    {notification.action.label}
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 푸터 */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setNotifications([]);
                                    setUnreadCount(0);
                                }}
                                className="text-xs text-gray-600 hover:text-gray-800 w-full text-center"
                            >
                                모든 알림 삭제
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationSystem; 