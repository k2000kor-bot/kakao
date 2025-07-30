import React from 'react';

interface ChatRoomListProps {
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ selectedRoomId, onRoomSelect }) => {
  const chatRooms = [
    { id: 'room-1', name: '행복한소유☆개포우성7차', participants: 15, lastMessage: '2025-07-14 15:30' },
    { id: 'room-2', name: '개포우성7차 조합원', participants: 8, lastMessage: '2025-07-14 14:20' },
    { id: 'room-3', name: '시공사 논의방', participants: 12, lastMessage: '2025-07-14 13:45' },
    { id: 'room-4', name: '입찰 정보 공유', participants: 6, lastMessage: '2025-07-14 12:15' },
    { id: 'room-5', name: '일반 소통방', participants: 20, lastMessage: '2025-07-14 11:30' }
  ];

  return (
    <div className="space-y-2 p-4">
      {chatRooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={`w-full p-3 text-left rounded-lg transition-colors ${
            selectedRoomId === room.id
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{room.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                참여자 {room.participants}명
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {room.lastMessage}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatRoomList; 