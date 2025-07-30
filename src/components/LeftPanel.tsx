import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ConversationAnalyzer from './ConversationAnalyzer';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  participants: number;
  messageCount: number;
  participantList?: string[];
}

interface ConversationAnalysis {
  totalMessages: number;
  participants: number;
  averageLength: number;
  participationRate: number;
  negativeKeywords: number;
  topParticipants: Array<{
    name: string;
    messageCount: number;
    percentage: number;
  }>;
  keywords: string[];
}

interface LeftPanelProps {
  chatRooms: ChatRoom[];
  selectedChatRoom: string;
  selectedPeriod: string;
  onChatRoomSelect: (roomId: string) => void;
  onPeriodSelect: (period: string) => void;
  conversationAnalysis?: ConversationAnalysis;
  messages?: any[];
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  chatRooms,
  selectedChatRoom,
  selectedPeriod,
  onChatRoomSelect,
  onPeriodSelect,
  conversationAnalysis,
  messages = []
}) => {
  const periods = [
    { id: 'today', label: '오늘', icon: ClockIcon },
    { id: 'week', label: '이번 주', icon: CalendarIcon },
    { id: 'month', label: '이번 달', icon: CalendarIcon },
    { id: 'all', label: '전체', icon: CalendarIcon }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
      {/* 기간 선택 */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 text-left flex items-center">
          <span className="bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">31</span>
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
          기간 선택
        </h3>
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {periods.map((period) => {
            const IconComponent = period.icon;
            return (
              <button
                key={period.id}
                onClick={() => onPeriodSelect(period.id)}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-md border-2 transition-all duration-200 ${selectedPeriod === period.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">{period.label}</span>
              </button>
            );
          })}
        </div>
      </div>



      {/* 채팅방 목록 */}
      <div>
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left flex items-center">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">49</span>
            <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
            채팅방
          </h3>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onChatRoomSelect(room.id)}
                className={`p-3 sm:p-4 md:p-5 rounded-md border-2 cursor-pointer transition-all duration-200 ${selectedChatRoom === room.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                style={{ minHeight: '80px' }}
              >
                <div className="flex items-start space-x-3 mb-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${room.isActive
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                    <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-xs sm:text-sm mb-1 ${room.isActive ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                      {room.name}
                    </h4>
                    <p className="text-xs text-gray-500 break-words line-clamp-2">
                      {room.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start text-xs text-gray-500 mt-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="whitespace-nowrap">{room.participants}명</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{room.messageCount}개 메시지</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{room.lastMessageTime}</span>
                  </div>
                  {room.participantList && room.participantList.length > 0 && (
                    <div className="text-xs text-gray-400 truncate w-full">
                      대화자: {room.participantList.slice(0, 2).join(', ')}
                      {room.participantList.length > 2 && ` 외 ${room.participantList.length - 2}명`}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>업로드된 대화가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 대화 분석 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">50</span>
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            대화 분석
          </h3>
        </div>
        <ConversationAnalyzer
          messages={messages}
          selectedPeriod={selectedPeriod}
        />
      </div>
    </div>
  );
};

export default LeftPanel; 