import React, { useState } from 'react';
import CORBULogo from './CORBULogo';

interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'project' | 'analysis' | 'system';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatSidebarProps {
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
  chatRooms: ChatRoom[];
  onSystemCommand?: (command: string) => void;
  onAdvancedPanelToggle?: () => void;
  onAnalyticsToggle?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ selectedRoomId, onRoomSelect, chatRooms, onSystemCommand }) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      // 실제로는 API 호출로 새 채팅방 생성
      console.log('새 채팅방 생성:', newRoomName);
      setNewRoomName('');
      setShowCreateRoom(false);
    }
  };

  const handleSystemCommand = (command: string) => {
    if (onSystemCommand) {
      onSystemCommand(command);
    }
  };

  const handleRoomClick = (roomId: string) => {
    onRoomSelect(roomId);

    // 개포우성7차 프로젝트 클릭 시 특별 처리
    if (roomId === '1' && onSystemCommand) {
      // 프로젝트 상세 페이지 표시를 위한 명령 전달
      onSystemCommand('show_project_details');
    }
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col w-60 max-w-60">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <CORBULogo size="md" onClick={() => window.location.href = '/'} />
      </div>

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">프로젝트</h2>
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedRoomId === room.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.type === 'project' ? '프로젝트' : '채팅방'}</p>
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 시스템 기능 메뉴 */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">시스템 기능</h3>
          <div className="space-y-2">
            {/* 프로젝트 */}
            <button
              onClick={() => handleSystemCommand('show_projects')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>프로젝트</span>
              </div>
            </button>

            {/* 프로젝트 파일 */}
            <button
              onClick={() => handleSystemCommand('show_project_files')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>프로젝트 파일</span>
              </div>
            </button>

            {/* 지침 */}
            <button
              onClick={() => handleSystemCommand('show_guidelines')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>지침</span>
              </div>
            </button>

            {/* 분석 기록 */}
            <button
              onClick={() => handleSystemCommand('show_analysis_history')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>분석 기록</span>
              </div>
            </button>

            {/* 템플릿 */}
            <button
              onClick={() => handleSystemCommand('show_templates')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>템플릿</span>
              </div>
            </button>

            {/* 내보내기 */}
            <button
              onClick={() => handleSystemCommand('show_export_options')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>내보내기</span>
              </div>
            </button>
          </div>
        </div>

        {/* 기존 시스템 명령어 */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">시스템 명령어</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleSystemCommand('파일 업로드')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span>파일 업로드</span>
              </div>
            </button>
            <button
              onClick={() => handleSystemCommand('분석 시작')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-teal-500 rounded"></div>
                <span>분석 시작</span>
              </div>
            </button>
            <button
              onClick={() => handleSystemCommand('요약 생성')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span>요약 생성</span>
              </div>
            </button>
            <button
              onClick={() => handleSystemCommand('카드뉴스 생성')}
              className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span>카드뉴스 생성</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 