import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    ClockIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    CpuChipIcon,
    LightBulbIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PatternAnalysis {
    [key: string]: any;
}

interface Prediction {
    [key: string]: any;
}

interface Insight {
    type: string;
    title: string;
    description: string;
    value: any;
}

interface AnalysisType {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface PatternAnalysisResponse {
    success: boolean;
    analysis_type: string;
    patterns: PatternAnalysis;
    predictions: Prediction;
    insights: Insight[];
    confidence_score: number;
    metadata: {
        analysis_period: string;
        prediction_horizon: number;
        timestamp: string;
    };
}

const AIConversationPatternAnalyzer: React.FC = () => {
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedAnalysis, setSelectedAnalysis] = useState('');
    const [analysisPeriod, setAnalysisPeriod] = useState('7d');
    const [predictionHorizon, setPredictionHorizon] = useState(24);
    const [analysisResult, setAnalysisResult] = useState<PatternAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);

    useEffect(() => {
        loadChatRooms();
        loadAnalysisTypes();
    }, []);

    const loadChatRooms = async () => {
        try {
            const response = await fetch('http://localhost:8012/api/chat-rooms');
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
            const response = await fetch('http://localhost:8012/api/analysis-types');
            const data = await response.json();
            setAnalysisTypes(data.analysis_types);
            if (data.analysis_types.length > 0) {
                setSelectedAnalysis(data.analysis_types[0].id);
            }
        } catch (error) {
            console.error('분석 타입 로드 오류:', error);
        }
    };

    const runPatternAnalysis = async () => {
        if (!selectedRoom || !selectedAnalysis) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8012/api/analyze-patterns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_room_id: selectedRoom,
                    analysis_type: selectedAnalysis,
                    analysis_period: analysisPeriod,
                    prediction_horizon: predictionHorizon
                })
            });

            const data: PatternAnalysisResponse = await response.json();

            if (data.success) {
                setAnalysisResult(data);
            }
        } catch (error) {
            console.error('패턴 분석 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAnalysisIcon = (type: string) => {
        switch (type) {
            case 'conversation': return ChartBarIcon;
            case 'participant': return UserGroupIcon;
            case 'flow': return ClockIcon;
            case 'prediction': return ArrowTrendingUpIcon;
            case 'quality': return EyeIcon;
            default: return CpuChipIcon;
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderConversationPatterns = () => {
        if (!analysisResult) return null;

        const patterns = analysisResult.patterns;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">시간대별 패턴</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(patterns.hourly_patterns || {}).slice(0, 8).map(([hour, data]: [string, any]) => (
                            <div key={hour} className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {hour}시
                                </div>
                                <div className="text-sm text-gray-600">
                                    {data.count}개 메시지
                                </div>
                                <div className="text-xs text-gray-500">
                                    평균 {Math.round(data.avg_length)}자
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">주제별 패턴</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(patterns.topic_patterns || {}).map(([topic, count]: [string, any]) => (
                            <div key={topic} className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-lg font-bold text-green-600">
                                    {count}
                                </div>
                                <div className="text-sm text-gray-600">{topic}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">감정 패턴</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(patterns.emotion_patterns || {}).map(([emotion, count]: [string, any]) => (
                            <div key={emotion} className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">
                                    {count}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {emotion === 'positive' ? '긍정' : emotion === 'negative' ? '부정' : '중립'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderParticipantPatterns = () => {
        if (!analysisResult) return null;

        const patterns = analysisResult.patterns;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">참여자 활동 패턴</h3>
                    <div className="space-y-4">
                        {Object.entries(patterns.participant_patterns || {}).map(([participant, data]: [string, any]) => (
                            <div key={participant} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{participant}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.activity_level === 'high' ? 'bg-green-100 text-green-800' :
                                        data.activity_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {data.activity_level === 'high' ? '높음' :
                                            data.activity_level === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">메시지:</span> {data.message_count}개
                                    </div>
                                    <div>
                                        <span className="text-gray-600">평균 길이:</span> {data.avg_length}자
                                    </div>
                                    <div>
                                        <span className="text-gray-600">활동일:</span> {data.active_days}일
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderFlowPredictions = () => {
        if (!analysisResult) return null;

        const predictions = analysisResult.predictions;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">시간대별 예측</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(predictions.hourly_predictions || {}).slice(0, 8).map(([hour, data]: [string, any]) => (
                            <div key={hour} className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600">
                                    {data.predicted_messages}개
                                </div>
                                <div className="text-sm text-gray-600">
                                    예상 메시지
                                </div>
                                <div className="text-xs text-gray-500">
                                    신뢰도: {Math.round(data.confidence * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderQualityPredictions = () => {
        if (!analysisResult) return null;

        const predictions = analysisResult.predictions;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">품질 예측</h3>
                    <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-blue-600">
                            {predictions.current_quality}/100
                        </div>
                        <div className="text-gray-600">현재 품질 점수</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">미래 품질 예측</h3>
                    <div className="space-y-2">
                        {predictions.future_predictions?.slice(0, 6).map((pred: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="font-medium">{pred.hour}시간 후</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-bold text-blue-600">
                                        {pred.predicted_quality}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {Math.round(pred.confidence * 100)}% 신뢰도
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalysis = () => {
        if (!analysisResult) return null;

        switch (analysisResult.analysis_type) {
            case 'conversation':
                return renderConversationPatterns();
            case 'participant':
                return renderParticipantPatterns();
            case 'flow':
                return renderFlowPredictions();
            case 'prediction':
                return renderFlowPredictions();
            case 'quality':
                return renderQualityPredictions();
            default:
                return null;
        }
    };

    const renderInsights = () => {
        if (!analysisResult) return null;

        return (
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">AI 인사이트</h3>
                <div className="space-y-4">
                    {analysisResult.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                            <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900">{insight.title}</h4>
                                <p className="text-blue-800">{insight.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 대화 패턴 분석</h1>
                <p className="text-gray-600">대화 패턴을 분석하고 미래 대화를 예측합니다.</p>
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

                            {/* 분석 기간 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    분석 기간
                                </label>
                                <select
                                    value={analysisPeriod}
                                    onChange={(e) => setAnalysisPeriod(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="1d">최근 1일</option>
                                    <option value="7d">최근 7일</option>
                                    <option value="30d">최근 30일</option>
                                    <option value="all">전체 기간</option>
                                </select>
                            </div>

                            {/* 예측 기간 설정 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    예측 기간 (시간)
                                </label>
                                <input
                                    type="number"
                                    value={predictionHorizon}
                                    onChange={(e) => setPredictionHorizon(parseInt(e.target.value))}
                                    min="1"
                                    max="168"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* 분석 실행 버튼 */}
                            <button
                                onClick={runPatternAnalysis}
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
                                        패턴 분석 실행
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
                    {analysisResult ? (
                        <div className="space-y-6">
                            {/* 신뢰도 표시 */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-4">분석 결과</h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">분석 타입</div>
                                        <div className="text-lg font-semibold">{analysisTypes.find(t => t.id === analysisResult.analysis_type)?.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">신뢰도</div>
                                        <div className={`text-lg font-semibold ${getConfidenceColor(analysisResult.confidence_score)}`}>
                                            {Math.round(analysisResult.confidence_score * 100)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 분석 결과 */}
                            {renderAnalysis()}

                            {/* AI 인사이트 */}
                            {renderInsights()}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">패턴 분석 결과</h2>
                            <div className="text-center py-12 text-gray-500">
                                <CpuChipIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <div className="text-lg font-medium mb-2">패턴 분석을 실행해주세요</div>
                                <div className="text-sm">채팅방과 분석 타입을 선택한 후 패턴 분석을 실행하세요.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIConversationPatternAnalyzer; 