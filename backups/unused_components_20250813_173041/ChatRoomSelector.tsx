import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface ChatRoom {
    id: string;
    name: string;
    lastMessage: string;
    participantCount: number;
    lastActivity: string;
    messageCount: number;
}

interface ChatRoomSelectorProps {
    onSelectRoom: (roomId: string) => void;
    selectedRoomId?: string;
}

const ChatRoomSelector: React.FC<ChatRoomSelectorProps> = ({ onSelectRoom, selectedRoomId }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
        {
            id: '1',
            name: '[인증]행복한소유☆개포우성7차',
            lastMessage: '시공사 선정 기준에 대해 논의가 있었습니다.',
            participantCount: 40,
            lastActivity: '2025-07-15 14:30',
            messageCount: 519
        },
        {
            id: '2',
            name: '개포우성7차 소유주 모임',
            lastMessage: '홍보부스 방문 후 마음이 돌아섰어요.',
            participantCount: 25,
            lastActivity: '2025-07-15 13:45',
            messageCount: 312
        },
        {
            id: '3',
            name: '우성7차 재건축 정보',
            lastMessage: '880만 원 기준이라도 세대당 약 4억의 분담금이 예상됩니다.',
            participantCount: 18,
            lastActivity: '2025-07-15 12:20',
            messageCount: 156
        },
        {
            id: '4',
            name: '개포우성7차 시공사 검토',
            lastMessage: '제안서엔 숫자가 다가 아니며, 아파트 가치에 영향을 주는 건 평면, 커뮤니티, 외관입니다.',
            participantCount: 32,
            lastActivity: '2025-07-15 11:15',
            messageCount: 245
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredRooms = chatRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">카카오톡 대화방 목록</h2>
                <p className="text-sm text-gray-600 mt-1">분석할 대화방을 선택하세요</p>
            </div>

            {/* 검색 */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="대화방 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* 대화방 목록 */}
            <div className="max-h-96 overflow-y-auto">
                {filteredRooms.map((room) => (
                    <div
                        key={room.id}
                        onClick={() => onSelectRoom(room.id)}
                        className={`px-6 py-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedRoomId === room.id
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {room.name}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {room.lastMessage}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <UserGroupIcon className="w-4 h-4" />
                                        <span>{room.participantCount}명</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                        <span>{room.messageCount}개 메시지</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{room.lastActivity}</span>
                                    </div>
                                </div>
                            </div>
                            {selectedRoomId === room.id && (
                                <div className="ml-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    );
};

export default ChatRoomSelector; 