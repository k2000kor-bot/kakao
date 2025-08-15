import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  HeartIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type?: string;
}

interface AdvancedMessageDisplayProps {
  messages: Message[];
  selectedPeriod: string;
}

const AdvancedMessageDisplay: React.FC<AdvancedMessageDisplayProps> = ({
  messages,
  selectedPeriod
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'sender' | 'content'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSender, setFilterSender] = useState<string>('');

  // 메시지 필터링 및 정렬
  const filteredAndSortedMessages = messages
    .filter(message => {
      const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSender = !filterSender || message.sender === filterSender;
      return matchesSearch && matchesSender;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'sender':
          comparison = a.sender.localeCompare(b.sender);
          break;
        case 'content':
          comparison = a.content.localeCompare(b.content);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // 고유한 발신자 목록
  const uniqueSenders = Array.from(new Set(messages.map(m => m.sender))).sort();

  // 메시지 길이 분석
  const getMessageLength = (content: string) => {
    if (content.length < 50) return 'short';
    if (content.length < 200) return 'medium';
    return 'long';
  };

  // 메시지 타입 분석
  const getMessageType = (content: string) => {
    if (content.includes('삭제된 메시지')) return 'deleted';
    if (content.includes('이모티콘') || content.includes('😊') || content.includes('👍')) return 'emoji';
    if (content.length > 300) return 'long';
    return 'normal';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('메시지가 클립보드에 복사되었습니다.');
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left flex items-center">
        <span className="bg-lime-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">28</span>
        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-green-600" />
        대화 내용
        {messages.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            {filteredAndSortedMessages.length}개
          </span>
        )}
      </h3>

      {/* 검색 및 필터 */}
      <div className="mb-4 space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="메시지 또는 발신자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterSender}
            onChange={(e) => setFilterSender(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="">모든 발신자</option>
            {uniqueSenders.map(sender => (
              <option key={sender} value={sender}>{sender}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="timestamp">시간순</option>
            <option value="sender">발신자순</option>
            <option value="content">내용순</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto p-4">
        {filteredAndSortedMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedMessages.map((message, index) => {
              const messageLength = getMessageLength(message.content);
              const messageType = getMessageType(message.content);

              return (
                <div key={index} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-600">{message.sender}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <button
                        onClick={() => setSelectedMessage(message)}
                        className="text-gray-400 hover:text-blue-600"
                        aria-label="메시지 상세 보기"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow ${messageType === 'deleted' ? 'bg-red-50 border-red-200' :
                    messageType === 'emoji' ? 'bg-yellow-50 border-yellow-200' :
                      messageType === 'long' ? 'bg-purple-50 border-purple-200' :
                        'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${messageType === 'deleted' ? 'text-red-600 italic' : 'text-gray-800'
                          }`}>
                          {message.content}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${messageLength === 'short' ? 'bg-green-100 text-green-700' :
                            messageLength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {messageLength === 'short' ? '짧음' : messageLength === 'medium' ? '보통' : '길음'}
                          </span>
                          <span className="flex items-center space-x-1">
                            <DocumentTextIcon className="w-3 h-3" />
                            <span>{message.content.length}자</span>
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-col space-y-1">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1"
                          title="복사"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3" />
                        </button>
                        <button
                          className="text-xs text-gray-500 hover:text-red-600 flex items-center space-x-1"
                          title="분석"
                        >
                          <HeartIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                {searchTerm || filterSender ? '검색 조건에 맞는 메시지가 없습니다.' : '채팅방을 선택하면 메시지가 표시됩니다.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 상세 보기 모달 */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">메시지 상세</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-600">{selectedMessage.sender}</span>
                <span className="text-sm text-gray-500">{formatTimestamp(selectedMessage.timestamp)}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>길이: {selectedMessage.content.length}자</span>
                <button
                  onClick={() => copyToClipboard(selectedMessage.content)}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span>복사</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 요약 정보 */}
      {messages.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>총 {filteredAndSortedMessages.length}개의 메시지 표시 중</span>
          <div className="flex items-center space-x-2">
            <span>발신자: {uniqueSenders.length}명</span>
            <button className="hover:text-blue-600">전체 보기</button>
            <button className="hover:text-green-600">분석하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedMessageDisplay; 