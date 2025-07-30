import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface DashboardMetrics {
    activeUsers: number;
    totalMessages: number;
    averageResponseTime: number;
    sentimentScore: number;
    topKeywords: string[];
    recentActivity: Array<{
        user: string;
        action: string;
        timestamp: string;
    }>;
}

const RealTimeDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        activeUsers: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        sentimentScore: 0,
        topKeywords: [],
        recentActivity: []
    });

    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const { messages: wsMessages, isConnected: wsConnected } = useWebSocket({
        url: 'ws://localhost:8000',
        clientId: 'dashboard',
        autoReconnect: true
    });

    useEffect(() => {
        setIsConnected(wsConnected);
    }, [wsConnected]);

    useEffect(() => {
        // 실시간 메트릭 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                activeUsers: Math.floor(Math.random() * 50) + 10,
                totalMessages: prev.totalMessages + Math.floor(Math.random() * 5) + 1,
                averageResponseTime: Math.random() * 5 + 1,
                sentimentScore: Math.random() * 100,
                topKeywords: ['프로젝트', '회의', '일정', '리소스', '기술'].sort(() => Math.random() - 0.5).slice(0, 5),
                recentActivity: [
                    {
                        user: '김철수',
                        action: '새 메시지 전송',
                        timestamp: new Date().toISOString()
                    },
                    {
                        user: '이영희',
                        action: '파일 업로드',
                        timestamp: new Date(Date.now() - 30000).toISOString()
                    },
                    {
                        user: '박민수',
                        action: '이모티콘 반응',
                        timestamp: new Date(Date.now() - 60000).toISOString()
                    }
                ]
            }));
            setLastUpdate(new Date());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusIcon = (score: number) => {
        if (score >= 80) return '🟢';
        if (score >= 60) return '🟡';
        return '🔴';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">실시간 대시보드</h2>
                    <p className="text-gray-600">
                        마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {isConnected ? '실시간 연결됨' : '연결 끊김'}
                    </span>
                </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}명</p>
                        </div>
                        <div className="text-3xl">👥</div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-green-600">+5%</span>
                        <span className="text-xs text-gray-500 ml-1">지난 시간 대비</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.totalMessages.toLocaleString()}</p>
                        </div>
                        <div className="text-3xl">💬</div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-green-600">+12%</span>
                        <span className="text-xs text-gray-500 ml-1">지난 시간 대비</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 응답 시간</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime.toFixed(1)}초</p>
                        </div>
                        <div className="text-3xl">⏱️</div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-red-600">-8%</span>
                        <span className="text-xs text-gray-500 ml-1">지난 시간 대비</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">감정 점수</p>
                            <p className={`text-2xl font-bold ${getStatusColor(metrics.sentimentScore)}`}>
                                {Math.round(metrics.sentimentScore)}%
                            </p>
                        </div>
                        <div className="text-3xl">{getStatusIcon(metrics.sentimentScore)}</div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-green-600">+15%</span>
                        <span className="text-xs text-gray-500 ml-1">지난 시간 대비</span>
                    </div>
                </div>
            </div>

            {/* 실시간 활동 및 키워드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 실시간 활동 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 활동</h3>
                    <div className="space-y-4">
                        {metrics.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                                    <p className="text-xs text-gray-600">{activity.action}</p>
                                </div>
                                <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 인기 키워드 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                        {metrics.topKeywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4">
                        <p className="text-xs text-gray-500">
                            실시간으로 업데이트되는 대화 키워드입니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* 시스템 상태 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                            <p className="text-sm font-medium text-green-800">AI 모델</p>
                            <p className="text-xs text-green-600">정상 작동</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">데이터베이스</p>
                            <p className="text-xs text-blue-600">연결됨</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                            <p className="text-sm font-medium text-yellow-800">API 서버</p>
                            <p className="text-xs text-yellow-600">응답 지연</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 실시간 알림 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 알림</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-700">
                            새로운 사용자가 채팅방에 참여했습니다
                        </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700">
                            긍정적인 감정 점수가 15% 증가했습니다
                        </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-700">
                            평균 응답 시간이 개선되었습니다
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeDashboard; 