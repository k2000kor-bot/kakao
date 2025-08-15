import React, { useState, useEffect } from 'react';
import {
    LightBulbIcon,
    ChartBarIcon,
    UserGroupIcon,
    HeartIcon,
    ClockIcon,
    DocumentTextIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Insight {
    [key: string]: any;
}

interface AnalysisType {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface InsightResponse {
    success: boolean;
    analysis_type: string;
    insights: Insight;
    metadata: {
        title: string;
        description: string;
        type: string;
    };
}

const AIConversationInsights: React.FC = () => {
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedAnalysis, setSelectedAnalysis] = useState('');
    const [insights, setInsights] = useState<Insight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);

    useEffect(() => {
        loadChatRooms();
        loadAnalysisTypes();
    }, []);

    const loadChatRooms = async () => {
        try {
            const response = await fetch('http://localhost:8009/api/chat-rooms');
            const data = await response.json();
            if (data.success && data.chat_rooms.length > 0) {
                setChatRooms(data.chat_rooms);
                setSelectedRoom(data.chat_rooms[0].id);
            }
        } catch (error) {
            console.error('채팅방 목록 로드 오류:', error);
        }
    };

    const loadAnalysisTypes = async () => {
        try {
            const response = await fetch('http://localhost:8009/api/analysis-types');
            const data = await response.json();
            setAnalysisTypes(data.analysis_types);
            if (data.analysis_types.length > 0) {
                setSelectedAnalysis(data.analysis_types[0].id);
            }
        } catch (error) {
            console.error('분석 타입 로드 오류:', error);
        }
    };

    const generateInsights = async () => {
        if (!selectedRoom || !selectedAnalysis) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8009/api/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_room_id: selectedRoom,
                    analysis_type: selectedAnalysis
                })
            });

            const data: InsightResponse = await response.json();

            if (data.success) {
                setInsights(data.insights);
            }
        } catch (error) {
            console.error('인사이트 생성 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAnalysisIcon = (type: string) => {
        switch (type) {
            case 'summary': return DocumentTextIcon;
            case 'topics': return CpuChipIcon;
            case 'participants': return UserGroupIcon;
            case 'sentiment': return HeartIcon;
            case 'patterns': return ArrowTrendingUpIcon;
            default: return ChartBarIcon;
        }
    };

    const renderSummaryInsights = () => {
        if (!insights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">대화 요약</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        {insights.summary}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{insights.statistics?.total_messages || 0}</div>
                        <div className="text-sm text-blue-600">총 메시지 수</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{insights.statistics?.unique_participants || 0}</div>
                        <div className="text-sm text-green-600">참여자 수</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">{insights.statistics?.duration_days || 0}</div>
                        <div className="text-sm text-purple-600">대화 기간 (일)</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold mb-2">가장 활발한 시간대</h4>
                        <div className="text-2xl font-bold text-orange-600">{insights.statistics?.peak_hour || '00'}:00</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold mb-2">최고 참여자</h4>
                        <div className="text-lg font-semibold">{insights.statistics?.top_participant || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{insights.statistics?.top_participant_count || 0}개 메시지</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTopicsInsights = () => {
        if (!insights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">핵심 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                        {insights.top_keywords?.map((keyword: any, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                                {keyword.word} ({keyword.count})
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">주요 주제</h3>
                    <div className="space-y-3">
                        {insights.main_topics?.map((topic: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{topic.topic}</span>
                                <span className="text-blue-600 font-semibold">{topic.count}회 언급</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderParticipantsInsights = () => {
        if (!insights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">참여자 활동</h3>
                    <div className="space-y-4">
                        {insights.participants?.map((participant: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">{participant.sender}</span>
                                    <span className="text-blue-600 font-bold">{participant.message_count}개</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    평균 길이: {participant.avg_message_length}자
                                </div>
                                <div className="text-sm text-gray-500">
                                    첫 메시지: {participant.first_message?.split('T')[0]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">활동 시간대</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(insights.peak_hours || {}).map(([sender, hour]: [string, any]) => (
                            <div key={sender} className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">{sender}</div>
                                <div className="text-blue-600 font-bold">{String(hour)}:00</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderSentimentInsights = () => {
        if (!insights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">전체 감정 분포</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {insights.overall_sentiment?.positive || 0}%
                            </div>
                            <div className="text-sm text-green-600">긍정</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">
                                {insights.overall_sentiment?.neutral || 0}%
                            </div>
                            <div className="text-sm text-gray-600">중립</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {insights.overall_sentiment?.negative || 0}%
                            </div>
                            <div className="text-sm text-red-600">부정</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">감정 트렌드</h3>
                    <div className="space-y-3">
                        {insights.sentiment_trends?.slice(0, 7).map((trend: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{trend.date}</span>
                                    <span className="text-sm text-gray-600">{trend.message_count}개 메시지</span>
                                </div>
                                <div className="flex space-x-4 text-sm">
                                    <span className="text-green-600">긍정: {trend.positive}%</span>
                                    <span className="text-gray-600">중립: {trend.neutral}%</span>
                                    <span className="text-red-600">부정: {trend.negative}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPatternsInsights = () => {
        if (!insights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">주요 인사이트</h3>
                    <div className="space-y-3">
                        {insights.insights?.map((insight: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{insight}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">요일별 활동</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {insights.weekly_pattern?.map((day: any, index: number) => (
                            <div key={index} className="text-center p-2 bg-gray-50 rounded">
                                <div className="text-xs text-gray-600">{day.day}</div>
                                <div className="font-bold text-blue-600">{day.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">메시지 길이 통계</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {insights.message_length_stats?.average || 0}
                            </div>
                            <div className="text-sm text-gray-600">평균 길이</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {insights.message_length_stats?.minimum || 0}
                            </div>
                            <div className="text-sm text-gray-600">최소 길이</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {insights.message_length_stats?.maximum || 0}
                            </div>
                            <div className="text-sm text-gray-600">최대 길이</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderInsights = () => {
        if (!insights) return null;

        switch (selectedAnalysis) {
            case 'summary':
                return renderSummaryInsights();
            case 'topics':
                return renderTopicsInsights();
            case 'participants':
                return renderParticipantsInsights();
            case 'sentiment':
                return renderSentimentInsights();
            case 'patterns':
                return renderPatternsInsights();
            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <EyeIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <div className="text-lg font-medium">인사이트를 생성해주세요</div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 대화 인사이트</h1>
                <p className="text-gray-600">대화 데이터를 분석하여 핵심 인사이트를 제공합니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 설정 패널 */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">분석 설정</h2>

                        <div className="space-y-4">
                            {/* 채팅방 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    채팅방 선택
                                </label>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {chatRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.id} ({room.message_count}개)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 분석 타입 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    분석 타입
                                </label>
                                <select
                                    value={selectedAnalysis}
                                    onChange={(e) => setSelectedAnalysis(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {analysisTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 분석 시작 버튼 */}
                            <button
                                onClick={generateInsights}
                                disabled={isLoading || !selectedRoom || !selectedAnalysis}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                                        분석 중...
                                    </>
                                ) : (
                                    <>
                                        <CpuChipIcon className="w-5 h-5 mr-2" />
                                        인사이트 생성
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 분석 타입 설명 */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">분석 타입 설명</h3>
                            <div className="space-y-3">
                                {analysisTypes.map((type) => {
                                    const Icon = getAnalysisIcon(type.id);
                                    return (
                                        <div key={type.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">{type.name}</div>
                                                <div className="text-sm text-gray-600">{type.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 패널 */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">분석 결과</h2>

                        {insights ? (
                            renderInsights()
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <CpuChipIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <div className="text-lg font-medium mb-2">인사이트를 생성해주세요</div>
                                <div className="text-sm">채팅방과 분석 타입을 선택한 후 인사이트를 생성하세요.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConversationInsights; 