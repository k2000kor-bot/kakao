import React, { useState, useEffect, useRef } from 'react';
import {
  StarIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  isUrgent: boolean;
  requiresResponse: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface MonitoringSettings {
  autoScroll: boolean;
  showTimestamps: boolean;
  highlightUrgent: boolean;
  filterType: 'all' | 'urgent' | 'system' | 'user';
  refreshInterval: number;
}

const RealTimeChatMonitor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [settings, setSettings] = useState<MonitoringSettings>({
    autoScroll: true,
    showTimestamps: true,
    highlightUrgent: true,
    filterType: 'all',
    refreshInterval: 5000
  });
  const [stats, setStats] = useState({
    totalMessages: 0,
    urgentMessages: 0,
    activeUsers: 0,
    averageResponseTime: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleMessages: ChatMessage[] = [
    {
      id: '1',
      sender: '김조합장',
      content: '오늘 오후 2시에 조합원 총회가 있습니다.',
      timestamp: '14:30',
      type: 'text',
      isUrgent: true,
      requiresResponse: true,
      sentiment: 'neutral'
    },
    {
      id: '2',
      sender: '이부조합장',
      content: '네, 참석하겠습니다.',
      timestamp: '14:32',
      type: 'text',
      isUrgent: false,
      requiresResponse: false,
      sentiment: 'positive'
    },
    {
      id: '3',
      sender: '시스템',
      content: '새로운 사용자가 채팅방에 참여했습니다.',
      timestamp: '14:35',
      type: 'system',
      isUrgent: false,
      requiresResponse: false,
      sentiment: 'neutral'
    },
    {
      id: '4',
      sender: '박관리자',
      content: '회의 안건을 미리 공유해드립니다.',
      timestamp: '14:37',
      type: 'text',
      isUrgent: false,
      requiresResponse: true,
      sentiment: 'positive'
    },
    {
      id: '5',
      sender: '최조합원',
      content: '복지 개선안에 대해 의견이 있습니다.',
      timestamp: '14:40',
      type: 'text',
      isUrgent: true,
      requiresResponse: true,
      sentiment: 'negative'
    }
  ];

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // 새로운 메시지 시뮬레이션
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: ['김조합장', '이부조합장', '박관리자', '최조합원'][Math.floor(Math.random() * 4)],
          content: [
            '회의 일정을 확인했습니다.',
            '안건 검토 중입니다.',
            '의견을 수렴하겠습니다.',
            '검토 후 답변드리겠습니다.'
          ][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          isUrgent: Math.random() > 0.8,
          requiresResponse: Math.random() > 0.5,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
        };

        setMessages(prev => [...prev, newMessage]);
        updateStats();
      }, settings.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, settings.refreshInterval]);

  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.autoScroll]);

  const updateStats = () => {
    setStats({
      totalMessages: messages.length,
      urgentMessages: messages.filter(m => m.isUrgent).length,
      activeUsers: new Set(messages.map(m => m.sender)).size,
      averageResponseTime: Math.floor(Math.random() * 10) + 2
    });
  };

  const filteredMessages = messages.filter(message => {
    switch (settings.filterType) {
      case 'urgent':
        return message.isUrgent;
      case 'system':
        return message.type === 'system';
      case 'user':
        return message.type === 'text';
      default:
        return true;
    }
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'file':
        return '📎';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  };

  return (
    <div className="space-y-6">
      {/* 모니터링 컨트롤 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <SignalIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">15</span>
              실시간 채팅 모니터
            </h3>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${isMonitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {isMonitoring ? (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  모니터링 중
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  일시정지
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isMonitoring
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isMonitoring ? (
                <>
                  <PauseIcon className="w-4 h-4 mr-1" />
                  일시정지
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-1" />
                  시작
                </>
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CogIcon className="w-4 h-4 mr-1" />
              설정
            </button>

            <button
              onClick={() => setMessages([])}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              초기화
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">총 메시지</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">긴급 메시지</p>
                <p className="text-2xl font-bold text-red-900">{stats.urgentMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserIcon className="w-6 h-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">활성 사용자</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ClockIcon className="w-6 h-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">평균 응답시간</p>
                <p className="text-2xl font-bold text-purple-900">{stats.averageResponseTime}분</p>
              </div>
            </div>
          </div>
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">모니터링 설정</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoScroll: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">자동 스크롤</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showTimestamps}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTimestamps: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">타임스탬프 표시</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.highlightUrgent}
                  onChange={(e) => setSettings(prev => ({ ...prev, highlightUrgent: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">긴급 메시지 강조</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">필터</label>
                <select
                  value={settings.filterType}
                  onChange={(e) => setSettings(prev => ({ ...prev, filterType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="urgent">긴급</option>
                  <option value="system">시스템</option>
                  <option value="user">사용자</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-700">실시간 메시지</h4>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {isMonitoring ? '메시지를 기다리는 중...' : '모니터링이 일시정지되었습니다.'}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border transition-colors ${message.isUrgent && settings.highlightUrgent
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                      {settings.showTimestamps && (
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      )}
                      <span className="text-xs">{getMessageTypeIcon(message.type)}</span>
                      {message.isUrgent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          긴급
                        </span>
                      )}
                      {message.requiresResponse && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          응답 필요
                        </span>
                      )}
                    </div>

                    <p className={`text-sm ${getSentimentColor(message.sentiment)}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default RealTimeChatMonitor; 