import React, { useState, useEffect } from 'react';
import {
    LightBulbIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    SparklesIcon,
    ClipboardDocumentIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Recommendation {
    text: string;
    type: string;
    confidence: number;
    reason: string;
}

interface ContextAnalysis {
    topic: string;
    sentiment: string;
    urgency: string;
    formality: string;
    participants_count: number;
}

interface RecommendationResponse {
    success: boolean;
    recommendations: Recommendation[];
    context_analysis: ContextAnalysis;
    confidence_score: number;
}

const AIMessageRecommender: React.FC = () => {
    const [context, setContext] = useState('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLength, setSelectedLength] = useState('medium');
    const [selectedTone, setSelectedTone] = useState('casual');
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

    useEffect(() => {
        loadChatRooms();
    }, []);

    const loadChatRooms = async () => {
        try {
            const response = await fetch('http://localhost:8007/api/chat-rooms');
            const data = await response.json();
            if (data.success && data.chat_rooms.length > 0) {
                setChatRooms(data.chat_rooms);
                setSelectedRoom(data.chat_rooms[0].id);
            }
        } catch (error) {
            console.error('채팅방 목록 로드 오류:', error);
        }
    };

    const getRecommendations = async () => {
        if (!context.trim() || !selectedRoom) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8007/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_room_id: selectedRoom,
                    context: context,
                    tone: selectedTone,
                    length: selectedLength
                })
            });

            const data: RecommendationResponse = await response.json();

            if (data.success) {
                setRecommendations(data.recommendations);
                setContextAnalysis(data.context_analysis);
            }
        } catch (error) {
            console.error('추천 요청 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessage(text);
            setTimeout(() => setCopiedMessage(null), 2000);
        } catch (error) {
            console.error('클립보드 복사 오류:', error);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50';
            case 'negative': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const getTopicColor = (topic: string) => {
        switch (topic) {
            case 'meeting': return 'text-blue-600 bg-blue-50';
            case 'work': return 'text-purple-600 bg-purple-50';
            case 'social': return 'text-green-600 bg-green-50';
            case 'emergency': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 메시지 추천</h1>
                <p className="text-gray-600">대화 맥락을 분석하여 적절한 메시지를 추천합니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 입력 섹션 */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">대화 맥락 입력</h2>

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
                                    aria-label="채팅방 선택"
                                >
                                    {chatRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.id} ({room.message_count}개 메시지)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 대화 맥락 입력 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    대화 맥락
                                </label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="현재 대화 상황이나 맥락을 입력해주세요..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                                />
                            </div>

                            {/* 설정 옵션 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        메시지 길이
                                    </label>
                                    <select
                                        value={selectedLength}
                                        onChange={(e) => setSelectedLength(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        aria-label="메시지 길이 선택"
                                    >
                                        <option value="short">짧게</option>
                                        <option value="medium">보통</option>
                                        <option value="long">길게</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        톤
                                    </label>
                                    <select
                                        value={selectedTone}
                                        onChange={(e) => setSelectedTone(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        aria-label="톤 선택"
                                    >
                                        <option value="casual">친근하게</option>
                                        <option value="formal">격식있게</option>
                                    </select>
                                </div>
                            </div>

                            {/* 추천 요청 버튼 */}
                            <button
                                onClick={getRecommendations}
                                disabled={isLoading || !context.trim()}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                                        분석 중...
                                    </>
                                ) : (
                                    <>
                                        <LightBulbIcon className="w-5 h-5 mr-2" />
                                        메시지 추천 받기
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 맥락 분석 결과 */}
                    {contextAnalysis && (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">맥락 분석 결과</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg ${getTopicColor(contextAnalysis.topic)}`}>
                                    <div className="text-sm font-medium">주제</div>
                                    <div className="text-lg font-semibold">{contextAnalysis.topic}</div>
                                </div>
                                <div className={`p-3 rounded-lg ${getSentimentColor(contextAnalysis.sentiment)}`}>
                                    <div className="text-sm font-medium">감정</div>
                                    <div className="text-lg font-semibold">{contextAnalysis.sentiment}</div>
                                </div>
                                <div className={`p-3 rounded-lg ${getUrgencyColor(contextAnalysis.urgency)}`}>
                                    <div className="text-sm font-medium">긴급도</div>
                                    <div className="text-lg font-semibold">{contextAnalysis.urgency}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <div className="text-sm font-medium">격식도</div>
                                    <div className="text-lg font-semibold">{contextAnalysis.formality}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 추천 결과 */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">추천 메시지</h2>

                        {recommendations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <div className="text-lg font-medium mb-2">추천 메시지가 없습니다</div>
                                <div className="text-sm">대화 맥락을 입력하고 추천을 요청해주세요.</div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recommendations.map((recommendation, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                                    {Math.round(recommendation.confidence * 100)}% 신뢰도
                                                </div>
                                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {recommendation.type}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(recommendation.text)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                aria-label="메시지 복사"
                                            >
                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="text-gray-900 mb-2 leading-relaxed">
                                            {recommendation.text}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            {recommendation.reason}
                                        </div>

                                        {copiedMessage === recommendation.text && (
                                            <div className="mt-2 text-xs text-green-600">
                                                ✓ 클립보드에 복사되었습니다
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 추천 통계 */}
                    {recommendations.length > 0 && (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">추천 통계</h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                                    <div className="text-sm text-gray-500">추천 메시지</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {Math.round((recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500">평균 신뢰도</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {new Set(recommendations.map(r => r.type)).size}
                                    </div>
                                    <div className="text-sm text-gray-500">추천 타입</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 사용 가이드 */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">사용 가이드</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center mb-2">
                            <MagnifyingGlassIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <h3 className="font-semibold">맥락 분석</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            입력한 대화 맥락을 분석하여 주제, 감정, 긴급도를 파악합니다.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center mb-2">
                            <SparklesIcon className="w-5 h-5 text-green-600 mr-2" />
                            <h3 className="font-semibold">스마트 추천</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            상황에 맞는 적절한 메시지를 AI가 추천해드립니다.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center mb-2">
                            <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-600 mr-2" />
                            <h3 className="font-semibold">맞춤 설정</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            메시지 길이와 톤을 조절하여 원하는 스타일로 추천받을 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMessageRecommender; 