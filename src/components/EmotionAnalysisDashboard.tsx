import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    HeartIcon,
    FaceSmileIcon,
    FaceFrownIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface EmotionData {
    timestamp: string;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    dominantEmotion: 'positive' | 'negative' | 'neutral';
    intensity: number;
}

interface ParticipantEmotion {
    name: string;
    emotion: 'positive' | 'negative' | 'neutral';
    intensity: number;
    messageCount: number;
    lastActivity: string;
}

const EmotionAnalysisDashboard: React.FC = () => {
    const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
    const [participants, setParticipants] = useState<ParticipantEmotion[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
    const [realTimeMode, setRealTimeMode] = useState(true);

    useEffect(() => {
        // 시뮬레이션된 감정 데이터
        const generateEmotionData = () => {
            const now = new Date();
            const data: EmotionData[] = [];

            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                const positive = Math.floor(Math.random() * 30) + 20;
                const negative = Math.floor(Math.random() * 20) + 10;
                const neutral = Math.floor(Math.random() * 50) + 30;
                const total = positive + negative + neutral;

                data.push({
                    timestamp: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    positive,
                    negative,
                    neutral,
                    total,
                    dominantEmotion: positive > negative && positive > neutral ? 'positive' :
                        negative > neutral ? 'negative' : 'neutral',
                    intensity: Math.random() * 0.5 + 0.5
                });
            }

            setEmotionData(data);
        };

        generateEmotionData();

        // 실시간 업데이트
        if (realTimeMode) {
            const interval = setInterval(() => {
                const newData = [...emotionData];
                const latest = newData[newData.length - 1];

                newData.push({
                    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    positive: latest.positive + Math.floor(Math.random() * 10) - 5,
                    negative: latest.negative + Math.floor(Math.random() * 10) - 5,
                    neutral: latest.neutral + Math.floor(Math.random() * 10) - 5,
                    total: latest.total + Math.floor(Math.random() * 20) - 10,
                    dominantEmotion: Math.random() > 0.5 ? 'positive' : 'negative',
                    intensity: Math.random() * 0.5 + 0.5
                });

                setEmotionData(newData.slice(-24)); // 최근 24개 데이터만 유지
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [realTimeMode, emotionData]);

    useEffect(() => {
        // 시뮬레이션된 참여자 데이터
        const mockParticipants: ParticipantEmotion[] = [
            {
                name: '우성7차',
                emotion: 'neutral',
                intensity: 0.7,
                messageCount: 45,
                lastActivity: '2분 전'
            },
            {
                name: '관리자',
                emotion: 'positive',
                intensity: 0.8,
                messageCount: 23,
                lastActivity: '5분 전'
            },
            {
                name: '조합원A',
                emotion: 'negative',
                intensity: 0.6,
                messageCount: 12,
                lastActivity: '10분 전'
            },
            {
                name: '조합원B',
                emotion: 'positive',
                intensity: 0.9,
                messageCount: 8,
                lastActivity: '15분 전'
            }
        ];

        setParticipants(mockParticipants);
    }, []);

    const getEmotionIcon = (emotion: string) => {
        switch (emotion) {
            case 'positive': return <FaceSmileIcon className="w-6 h-6 text-green-600" />;
            case 'negative': return <FaceFrownIcon className="w-6 h-6 text-red-600" />;
            default: return <FaceSmileIcon className="w-6 h-6 text-gray-600" />;
        }
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'positive': return 'text-green-600 bg-green-100';
            case 'negative': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getIntensityColor = (intensity: number) => {
        if (intensity >= 0.8) return 'text-red-600';
        if (intensity >= 0.6) return 'text-orange-600';
        return 'text-green-600';
    };

    const currentEmotion = emotionData[emotionData.length - 1];
    const totalMessages = emotionData.reduce((sum, data) => sum + data.total, 0);
    const avgPositive = emotionData.reduce((sum, data) => sum + data.positive, 0) / emotionData.length;
    const avgNegative = emotionData.reduce((sum, data) => sum + data.negative, 0) / emotionData.length;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <HeartIcon className="w-8 h-8 text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-900">실시간 감정 분석 대시보드</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="1h">최근 1시간</option>
                        <option value="24h">최근 24시간</option>
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                    </select>

                    <button
                        onClick={() => setRealTimeMode(!realTimeMode)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${realTimeMode
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                    >
                        {realTimeMode ? '실시간 ON' : '실시간 OFF'}
                    </button>
                </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">긍정적 메시지</p>
                            <p className="text-3xl font-bold">{Math.round(avgPositive)}</p>
                        </div>
                        <FaceSmileIcon className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">부정적 메시지</p>
                            <p className="text-3xl font-bold">{Math.round(avgNegative)}</p>
                        </div>
                        <FaceFrownIcon className="w-8 h-8 text-red-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">총 메시지</p>
                            <p className="text-3xl font-bold">{totalMessages}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">활성 참여자</p>
                            <p className="text-3xl font-bold">{participants.length}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-purple-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 감정 트렌드 차트 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 트렌드</h3>
                    <div className="space-y-3">
                        {emotionData.slice(-12).map((data, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className="w-16 text-sm text-gray-600">{data.timestamp}</div>
                                <div className="flex-1 flex space-x-1">
                                    <div
                                        className="bg-green-500 rounded-l h-6"
                                        style={{ width: `${(data.positive / data.total) * 100}%` }}
                                    ></div>
                                    <div
                                        className="bg-red-500 h-6"
                                        style={{ width: `${(data.negative / data.total) * 100}%` }}
                                    ></div>
                                    <div
                                        className="bg-gray-500 rounded-r h-6"
                                        style={{ width: `${(data.neutral / data.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {getEmotionIcon(data.dominantEmotion)}
                                    <span className={`text-xs px-2 py-1 rounded-full ${getEmotionColor(data.dominantEmotion)}`}>
                                        {data.dominantEmotion === 'positive' ? '긍정' :
                                            data.dominantEmotion === 'negative' ? '부정' : '중립'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 참여자별 감정 분석 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">참여자별 감정 분석</h3>
                    <div className="space-y-4">
                        {participants.map((participant, index) => (
                            <div key={index} className="bg-white rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        {getEmotionIcon(participant.emotion)}
                                        <div>
                                            <div className="font-medium text-gray-900">{participant.name}</div>
                                            <div className="text-sm text-gray-500">{participant.messageCount}개 메시지</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${getIntensityColor(participant.intensity)}`}>
                                            강도: {(participant.intensity * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-xs text-gray-500">{participant.lastActivity}</div>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${participant.emotion === 'positive' ? 'bg-green-500' :
                                            participant.emotion === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                            }`}
                                        style={{ width: `${participant.intensity * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 현재 감정 상태 */}
            {currentEmotion && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">현재 감정 상태</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl mb-2">😊</div>
                            <div className="text-2xl font-bold text-green-600">{currentEmotion.positive}</div>
                            <div className="text-sm text-gray-600">긍정적 메시지</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">😞</div>
                            <div className="text-2xl font-bold text-red-600">{currentEmotion.negative}</div>
                            <div className="text-sm text-gray-600">부정적 메시지</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">😐</div>
                            <div className="text-2xl font-bold text-gray-600">{currentEmotion.neutral}</div>
                            <div className="text-sm text-gray-600">중립적 메시지</div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow">
                            <span className="text-sm font-medium">현재 우세 감정:</span>
                            {getEmotionIcon(currentEmotion.dominantEmotion)}
                            <span className={`text-sm px-2 py-1 rounded-full ${getEmotionColor(currentEmotion.dominantEmotion)}`}>
                                {currentEmotion.dominantEmotion === 'positive' ? '긍정' :
                                    currentEmotion.dominantEmotion === 'negative' ? '부정' : '중립'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmotionAnalysisDashboard; 