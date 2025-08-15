import React, { useState, useEffect } from 'react';
import { useChat } from '../context/AppContext';

interface StatisticsDashboardProps {
  className?: string;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ className = '' }) => {
  const { messages, chatRooms } = useChat();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    systemMessages: 0,
    averageResponseTime: 0,
    activeRooms: 0,
    popularCommands: [] as string[]
  });

  useEffect(() => {
    calculateStats();
  }, [messages, selectedPeriod]);

  const calculateStats = () => {
    setIsLoading(true);

    // 모의 계산 지연
    setTimeout(() => {
      const now = new Date();
      const periodStart = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          periodStart.setHours(0, 0, 0, 0);
          break;
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
      }

      const periodMessages = messages.filter(msg => 
        new Date(msg.timestamp) >= periodStart
      );

      const userMessages = periodMessages.filter(msg => msg.sender === 'user');
      const aiMessages = periodMessages.filter(msg => msg.sender === 'ai');
      const systemMessages = periodMessages.filter(msg => msg.sender === 'system');

      // 인기 명령어 분석
      const commandKeywords = ['ai 상태', '분석', '파일 업로드', '채팅방', '도움말'];
      const popularCommands = commandKeywords.map(keyword => ({
        command: keyword,
        count: periodMessages.filter(msg => 
          msg.content.toLowerCase().includes(keyword)
        ).length
      })).filter(cmd => cmd.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(cmd => cmd.command);

      setStats({
        totalMessages: periodMessages.length,
        userMessages: userMessages.length,
        aiMessages: aiMessages.length,
        systemMessages: systemMessages.length,
        averageResponseTime: 1.2, // 모의 데이터
        activeRooms: chatRooms.length,
        popularCommands
      });

      setIsLoading(false);
    }, 500);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return '오늘';
      case 'week': return '7일';
      case 'month': return '30일';
      default: return period;
    }
  };

  if (isLoading) {
    return (
      <div className={`statistics-dashboard ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">통계를 계산하는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`statistics-dashboard bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">통계 대시보드</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="통계 기간 선택"
        >
          <option value="today">오늘</option>
          <option value="week">7일</option>
          <option value="month">30일</option>
        </select>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 메시지</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">사용자 메시지</p>
              <p className="text-2xl font-bold text-gray-900">{stats.userMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI 응답</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aiMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 응답 시간</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 활성 채팅방 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">활성 채팅방</h3>
          <div className="space-y-2">
            {chatRooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm font-medium text-gray-700">{room.name}</span>
                <span className="text-xs text-gray-500">{room.unreadCount}개 미읽</span>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 명령어 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">인기 명령어</h3>
          <div className="space-y-2">
            {stats.popularCommands.length > 0 ? (
              stats.popularCommands.map((command, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">{command}</span>
                  <span className="text-xs text-gray-500">자주 사용됨</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">아직 명령어 사용 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 기간 정보 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {getPeriodLabel(selectedPeriod)} 기준 통계
      </div>
    </div>
  );
};

export default StatisticsDashboard; 