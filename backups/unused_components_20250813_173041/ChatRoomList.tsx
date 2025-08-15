import React, { useState, useEffect } from 'react';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

interface ChatRoomListProps {
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ selectedRoomId, onRoomSelect }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v7/chat-rooms');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chat_rooms) {
          setChatRooms(data.chat_rooms);
        }
      }
    } catch (err) {
      setError('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-400 text-sm mb-2">
          <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs">{error}</p>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs">채팅방이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chatRooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={`w-full text-left p-3 rounded-lg transition-colors group ${selectedRoomId === room.id
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${selectedRoomId === room.id
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-600 text-gray-300'
                    }`}>
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedRoomId === room.id ? 'text-white' : 'text-gray-300'
                    }`}>
                    {room.name}
                  </p>
                  {room.lastMessage && (
                    <p className={`text-xs truncate ${selectedRoomId === room.id ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                      {room.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {room.unreadCount && room.unreadCount > 0 && (
                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${selectedRoomId === room.id
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-600 text-white'
                  }`}>
                  {room.unreadCount}
                </span>
              )}

              {room.lastActivity && (
                <span className={`text-xs ${selectedRoomId === room.id ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                  {formatLastActivity(room.lastActivity)}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatRoomList; 