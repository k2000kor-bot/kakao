import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface ChatSession {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  isActive: boolean;
  tags: string[];
}

interface ProjectChatListProps {
  projectId: string;
  projectName: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onArchiveChat: (chatId: string) => void;
}

const ProjectChatList: React.FC<ProjectChatListProps> = ({
  projectId,
  projectName,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onArchiveChat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  // 샘플 채팅 데이터
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: '시공사 홍보 논란',
      participants: ['이재헌', '박재우', '박은진', '정지혜'],
      lastMessage: 'GS건설과 삼성물산의 개별 홍보 활동 논란 지속',
      lastMessageTime: '2025-07-14T20:00:00Z',
      messageCount: 45,
      isActive: true,
      tags: ['시공사', '홍보', '논란']
    },
    {
      id: '2',
      title: '조합원 의견 수렴',
      participants: ['김철수', '이영희', '박민수'],
      lastMessage: '조합원들의 의견을 수렴하여 다음 단계를 진행하겠습니다.',
      lastMessageTime: '2025-07-13T15:30:00Z',
      messageCount: 32,
      isActive: true,
      tags: ['조합원', '의견', '수렴']
    },
    {
      id: '3',
      title: '재개발 계획 검토',
      participants: ['최영수', '김미영', '박준호'],
      lastMessage: '재개발 계획에 대한 상세 검토가 필요합니다.',
      lastMessageTime: '2025-07-12T10:15:00Z',
      messageCount: 28,
      isActive: false,
      tags: ['재개발', '계획', '검토']
    },
    {
      id: '4',
      title: '법적 검토 사항',
      participants: ['이법무', '김변호', '박법무'],
      lastMessage: '법적 검토 사항에 대한 논의가 진행되었습니다.',
      lastMessageTime: '2025-07-11T14:20:00Z',
      messageCount: 19,
      isActive: false,
      tags: ['법적', '검토', '사항']
    }
  ]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const filteredChats = chatSessions.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      chat.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter === 'all' ||
      (filter === 'active' && chat.isActive) ||
      (filter === 'archived' && !chat.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{projectName} 채팅 목록</h2>
          <button
            onClick={onNewChat}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">새 채팅</span>
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="채팅 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              활성
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'archived' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              보관
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-2 text-gray-300" />
            <p>검색 결과가 없습니다.</p>
            <p className="text-sm">새로운 채팅을 시작해보세요.</p>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{chat.title}</h3>
                      {!chat.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          보관됨
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{chat.lastMessage}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveChat(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                      title={chat.isActive ? "보관" : "활성화"}
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-3 h-3" />
                      <span>{chat.participants.length}명</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftRightIcon className="w-3 h-3" />
                      <span>{chat.messageCount}개</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTime(chat.lastMessageTime)}</span>
                    </div>
                  </div>
                </div>

                {chat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {chat.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {filteredChats.length}개 채팅</span>
          <span>{filteredChats.filter(c => c.isActive).length}개 활성</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectChatList; 