import React, { useState, useEffect } from 'react';
import {
    ChatBubbleLeftRightIcon,
    ClockIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface MessageResponseSystemProps {
    isActive?: boolean;
    onToggle?: () => void;
}

const MessageResponseSystem: React.FC<MessageResponseSystemProps> = ({ isActive = true, onToggle }) => {
    const [selectedChatRoom, setSelectedChatRoom] = useState<string>('1');
    const [messages, setMessages] = useState<any[]>([]);
    const [syncStatus, setSyncStatus] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'messages' | 'sync' | 'media'>('messages');

    useEffect(() => {
        // 초기 데이터 로딩
        loadChatRooms();
        loadSyncStatus();
    }, []);

    const loadChatRooms = async () => {
        // 채팅방 목록 로딩 로직
        console.log('채팅방 목록 로딩');
    };

    const loadSyncStatus = async () => {
        // 동기화 상태 로딩 로직
        console.log('동기화 상태 로딩');
    };

    const runManualSync = async () => {
        setIsSyncing(true);
        try {
            // 수동 동기화 로직
            console.log('수동 동기화 실행');
        } catch (error) {
            console.error('동기화 오류:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* 좌측 패널 - 채팅방 & 분석 설정 */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                {/* 채팅방 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        채팅방
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">[인증]행복한소유☆개포우성7차</h3>
                        <p className="text-sm text-blue-600">
                            전체: 4,106개 메시지 • 활성 상태
                        </p>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">기능 선택</h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'messages'
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                <span>메시지 관리</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('sync')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'sync'
                                ? 'bg-green-100 border-green-300 text-green-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="w-5 h-5" />
                                <span>동기화</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('media')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'media'
                                ? 'bg-purple-100 border-purple-300 text-purple-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <UserGroupIcon className="w-5 h-5" />
                                <span>미디어</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 동기화 상태 */}
                {activeTab === 'sync' && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            동기화 상태
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">마지막 동기화</span>
                                <span className="text-sm font-medium">2025-01-27 15:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">동기화된 파일</span>
                                <span className="text-sm font-medium">1,234개</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">상태</span>
                                <span className="text-sm font-medium text-green-600">정상</span>
                            </div>
                        </div>
                        <button
                            onClick={runManualSync}
                            disabled={isSyncing}
                            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {isSyncing ? '동기화 중...' : '수동 동기화'}
                        </button>
                    </div>
                )}
            </div>

            {/* 중앙 패널 - 메인 콘텐츠 */}
            <div className="flex-1 bg-white flex flex-col">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                메시지 대응 시스템
                            </h1>
                            <p className="text-gray-600">실시간 메시지 분석 및 자동 대응</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm text-gray-600">시스템 정상</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="flex-1 p-6">
                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">메시지 관리</h3>
                                <p className="text-blue-700">
                                    채팅방의 메시지를 분석하고 관리할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sync' && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">동기화 관리</h3>
                                <p className="text-green-700">
                                    채팅방 데이터를 동기화하고 관리할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4">미디어 관리</h3>
                                <p className="text-purple-700">
                                    채팅방의 미디어 파일을 관리할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 우측 패널 - 설정 */}
            <div className="w-96 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">시스템 설정</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-800">자동 동기화</span>
                            <span className="text-sm text-green-600">활성화</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-800">메시지 분석</span>
                            <span className="text-sm text-green-600">활성화</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-800">AI 응답</span>
                            <span className="text-sm text-green-600">활성화</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageResponseSystem; 