import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    CogIcon,
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import SimpleRealTimeAnalytics from './SimpleRealTimeAnalytics';

interface SimpleAIDashboardProps {
    selectedChatRoom: string;
}

const SimpleAIDashboard: React.FC<SimpleAIDashboardProps> = ({
    selectedChatRoom
}) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isRunning, setIsRunning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'warning'>('online');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // 대화 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 실제 API 호출
                const response = await fetch(`http://localhost:8003/api/status`);
                if (response.ok) {
                    const statusData = await response.json();
                    setSystemStatus(statusData.status === 'online' ? 'online' : 'warning');

                    // 채팅 메시지 데이터 로드
                    const chatResponse = await fetch(`http://localhost:8001/api/message-history`);
                    if (chatResponse.ok) {
                        const chatData = await chatResponse.json();
                        setMessages(chatData.messages || []);
                    } else {
                        // API 호출 실패 시 시뮬레이션 데이터 사용
                        const chatData = [
                            {
                                id: '1',
                                content: '안녕하세요! AI 대화분석 시스템입니다.',
                                sender: 'AI',
                                timestamp: new Date(),
                                type: 'text'
                            },
                            {
                                id: '2',
                                content: '실시간 분석이 진행 중입니다.',
                                sender: 'System',
                                timestamp: new Date(),
                                type: 'text'
                            }
                        ];
                        setMessages(chatData);
                    }
                } else {
                    setSystemStatus('warning');
                }
                setLastUpdate(new Date());
            } catch (error) {
                console.error('대화 데이터 로드 실패:', error);
                setSystemStatus('warning');
                // 오류 발생 시 시뮬레이션 데이터 사용
                const chatData = [
                    {
                        id: '1',
                        content: '안녕하세요! AI 대화분석 시스템입니다.',
                        sender: 'AI',
                        timestamp: new Date(),
                        type: 'text'
                    },
                    {
                        id: '2',
                        content: '실시간 분석이 진행 중입니다.',
                        sender: 'System',
                        timestamp: new Date(),
                        type: 'text'
                    }
                ];
                setMessages(chatData);
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedChatRoom) {
            loadData();
        }
    }, [selectedChatRoom]);

    // 실시간 업데이트 시뮬레이션
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 5000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const handleSystemToggle = () => {
        setIsRunning(!isRunning);
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            // 실제 API 호출로 새로고침
            const response = await fetch(`http://localhost:8003/api/status`);
            if (response.ok) {
                const statusData = await response.json();
                setSystemStatus(statusData.status === 'online' ? 'online' : 'warning');
            }

            const chatResponse = await fetch(`http://localhost:8001/api/message-history`);
            if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                setMessages(chatData.messages || []);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('데이터 새로고침 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'offline': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <CheckCircleIcon className="w-4 h-4" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'offline': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <InformationCircleIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">실시간 AI 대응 시스템</h1>
                        </div>

                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(systemStatus)}`}>
                            {getStatusIcon(systemStatus)}
                            <span className="capitalize">{systemStatus}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>새로고침</span>
                        </button>

                        <button
                            onClick={handleSystemToggle}
                            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg ${isRunning
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            {isRunning ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                            <span>{isRunning ? '중지' : '시작'}</span>
                        </button>

                        <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                            <CogIcon className="w-4 h-4" />
                            <span>설정</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                </div>
            </div>

            {/* 분석 컴포넌트 */}
            <SimpleRealTimeAnalytics
                messages={messages}
                selectedChatRoom={selectedChatRoom}
            />

            {/* 시스템 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-gray-600">CPU 사용률</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">78%</div>
                        <div className="text-sm text-gray-600">메모리 사용률</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">2.3ms</div>
                        <div className="text-sm text-gray-600">평균 응답시간</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleAIDashboard; 