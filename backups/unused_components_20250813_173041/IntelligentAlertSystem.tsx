import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface Alert {
  id: string;
  type: 'urgent' | 'important' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  sender: string;
  messageId: string;
  isRead: boolean;
  priority: number;
  category: string;
}

interface IntelligentAlertSystemProps {
  messages: Message[];
  selectedChatRoom: string;
  onAlertClick?: (messageId: string) => void;
}

const IntelligentAlertSystem: React.FC<IntelligentAlertSystemProps> = ({
  messages,
  selectedChatRoom,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showRead, setShowRead] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'important' | 'info' | 'warning'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 중요 키워드 정의
  const urgentKeywords = ['긴급', '즉시', '당장', '중단', '취소', '문제', '오류', '실패'];
  const importantKeywords = ['총회', '투표', '결정', '계약', '협상', '제안', '검토', '승인'];
  const warningKeywords = ['주의', '경고', '반대', '불만', '이의', '항의', '분쟁'];

  // 메시지 분석 및 알림 생성
  const analyzeMessages = async () => {
    setIsAnalyzing(true);
    const newAlerts: Alert[] = [];

    messages.forEach((message) => {
      if (message.type === 'text') {
        const content = message.content.toLowerCase();
        let alertType: Alert['type'] = 'info';
        let priority = 1;
        let category = '일반';

        // 긴급 키워드 확인
        if (urgentKeywords.some(keyword => content.includes(keyword))) {
          alertType = 'urgent';
          priority = 5;
          category = '긴급';
        }
        // 중요 키워드 확인
        else if (importantKeywords.some(keyword => content.includes(keyword))) {
          alertType = 'important';
          priority = 4;
          category = '중요';
        }
        // 경고 키워드 확인
        else if (warningKeywords.some(keyword => content.includes(keyword))) {
          alertType = 'warning';
          priority = 3;
          category = '경고';
        }

        // 특정 조건 추가 확인
        if (content.includes('총회') || content.includes('투표')) {
          alertType = 'important';
          priority = 5;
          category = '총회/투표';
        }

        if (content.includes('계약') || content.includes('협상')) {
          alertType = 'important';
          priority = 4;
          category = '계약/협상';
        }

        // 알림 생성
        if (alertType !== 'info') {
          newAlerts.push({
            id: `alert_${message.id}`,
            type: alertType,
            title: `${category} 알림`,
            message: message.content,
            timestamp: message.timestamp,
            sender: message.sender,
            messageId: message.id,
            isRead: false,
            priority,
            category
          });
        }
      }
    });

    // 우선순위별 정렬
    newAlerts.sort((a, b) => b.priority - a.priority);

    setAlerts(prev => {
      const existingIds = new Set(prev.map(alert => alert.messageId));
      const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.has(alert.messageId));
      return [...prev, ...uniqueNewAlerts];
    });

    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      analyzeMessages();
    }
  }, [messages]);

  // 알림 읽음 처리
  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  // 알림 삭제
  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  // 필터링된 알림
  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (!showRead && alert.isRead) return false;
    return true;
  });

  // 알림 타입별 개수
  const alertCounts = {
    urgent: alerts.filter(a => a.type === 'urgent' && !a.isRead).length,
    important: alerts.filter(a => a.type === 'important' && !a.isRead).length,
    warning: alerts.filter(a => a.type === 'warning' && !a.isRead).length,
    info: alerts.filter(a => a.type === 'info' && !a.isRead).length
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return <FireIcon className="w-5 h-5 text-red-500" />;
      case 'important':
        return <StarIcon className="w-5 h-5 text-yellow-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'important':
        return 'border-yellow-200 bg-yellow-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">19</span>
              지능형 알림
            </h3>
            <div className="flex items-center space-x-1">
              {alertCounts.urgent > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  {alertCounts.urgent}
                </span>
              )}
              {alertCounts.important > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  {alertCounts.important}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRead(!showRead)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {showRead ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
              <span>{showRead ? '읽음 표시' : '읽음 숨김'}</span>
            </button>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              모두 읽음
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center space-x-2 mt-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">전체</option>
            <option value="urgent">긴급</option>
            <option value="important">중요</option>
            <option value="warning">경고</option>
            <option value="info">정보</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${alert.isRead ? 'opacity-60' : ''
                  } ${getAlertColor(alert.type)}`}
                onClick={() => {
                  markAsRead(alert.id);
                  onAlertClick?.(alert.messageId);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <UserIcon className="w-3 h-3" />
                        <span>{alert.sender}</span>
                        <span>•</span>
                        <span>{alert.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAlert(alert.id);
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>새로운 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentAlertSystem; 