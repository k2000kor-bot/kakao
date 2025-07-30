import React from 'react';
import {
  StarIcon,
    ChartBarIcon,
    UserGroupIcon,
    ClockIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SimpleRealTimeAnalyticsProps {
    messages: any[];
    selectedChatRoom: string;
}

const SimpleRealTimeAnalytics: React.FC<SimpleRealTimeAnalyticsProps> = ({
    messages,
    selectedChatRoom
}) => {
    const totalMessages = messages.length;
    const uniqueSenders = new Set(messages.map(m => m.sender)).size;
    const recentMessages = messages.filter(m =>
        new Date(m.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-blue-600">{totalMessages}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <UserGroupIcon className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">참여자</p>
                            <p className="text-2xl font-bold text-green-600">{uniqueSenders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-orange-600" />
                        <div>
                            <p className="text-sm text-gray-600">최근 24시간</p>
                            <p className="text-2xl font-bold text-orange-600">{recentMessages}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 분석</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">분석 상태</span>
                        <span className="text-green-600 font-medium">활성</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">마지막 업데이트</span>
                        <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">선택된 채팅방</span>
                        <span className="text-blue-600 font-medium">{selectedChatRoom}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleRealTimeAnalytics; 