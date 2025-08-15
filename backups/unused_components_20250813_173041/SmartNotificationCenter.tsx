import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SmartNotificationCenterProps {
  isActive?: boolean;
  onToggle?: () => void;
  chatRoomId?: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({
  isActive = true,
  onToggle
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: '동기화 완료',
      message: '채팅방 데이터 동기화가 성공적으로 완료되었습니다.',
      timestamp: '2분 전',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'AI 모델 업데이트',
      message: '새로운 AI 모델이 배포되었습니다.',
      timestamp: '5분 전',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: '시스템 부하',
      message: '시스템 부하가 증가하고 있습니다.',
      timestamp: '10분 전',
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: '연결 오류',
      message: '일부 서버와의 연결이 끊어졌습니다.',
      timestamp: '15분 전',
      read: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'important') return notification.type === 'error' || notification.type === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 좌측 패널 - 필터 */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            알림 센터
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'all'
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } border`}
            >
              <div className="flex items-center justify-between">
                <span>모든 알림</span>
                <span className="text-sm">{notifications.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'unread'
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } border`}
            >
              <div className="flex items-center justify-between">
                <span>읽지 않음</span>
                <span className="text-sm">{unreadCount}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('important')}
              className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'important'
                ? 'bg-red-100 border-red-300 text-red-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } border`}
            >
              <div className="flex items-center justify-between">
                <span>중요</span>
                <span className="text-sm">{notifications.filter(n => n.type === 'error' || n.type === 'warning').length}</span>
              </div>
            </button>
          </div>
        </div>

        {/* 알림 통계 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">알림 통계</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 알림</span>
              <span className="text-sm font-medium">{notifications.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">읽지 않음</span>
              <span className="text-sm font-medium">{unreadCount}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">오늘</span>
              <span className="text-sm font-medium">{notifications.filter(n => n.timestamp.includes('분 전')).length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 중앙 패널 - 알림 목록 */}
      <div className="flex-1 bg-white flex flex-col">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <StarIcon className="w-6 h-6 mr-2 text-purple-500" />
                스마트 알림 센터
              </h1>
              <p className="text-gray-600">실시간 알림 관리 및 모니터링</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">시스템 정상</span>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-200' : ''
                    }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <span className="text-sm text-gray-500">{notification.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            새 알림
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>알림이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측 패널 - 설정 */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">알림 설정</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-800">시스템 알림</span>
              <span className="text-sm text-green-600">활성화</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-800">AI 알림</span>
              <span className="text-sm text-green-600">활성화</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-800">오류 알림</span>
              <span className="text-sm text-green-600">활성화</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-800">성능 알림</span>
              <span className="text-sm text-green-600">활성화</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">빠른 액션</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              모든 알림 읽음 처리
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              알림 내보내기
            </button>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
              알림 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartNotificationCenter; 