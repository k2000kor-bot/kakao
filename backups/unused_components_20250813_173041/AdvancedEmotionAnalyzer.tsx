import React, { useState, useEffect } from 'react';
import {
    HeartIcon,
    FaceSmileIcon,
    FaceFrownIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CogIcon
} from '@heroicons/react/24/outline';

interface EmotionData {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
}

interface EmotionAnalysisResult {
    primaryEmotion: string;
    secondaryEmotion: string;
    intensity: number;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    emotionalTrend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
}

const AdvancedEmotionAnalyzer: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState<EmotionData>({
        joy: 0.3,
        sadness: 0.1,
        anger: 0.05,
        fear: 0.02,
        surprise: 0.15,
        disgust: 0.01,
        trust: 0.25,
        anticipation: 0.12
    });
    const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
    const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

    const analyzeEmotion = async () => {
        setIsAnalyzing(true);

        // 시뮬레이션된 감정 분석
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newEmotion: EmotionData = {
            joy: Math.random() * 0.8 + 0.1,
            sadness: Math.random() * 0.6,
            anger: Math.random() * 0.4,
            fear: Math.random() * 0.3,
            surprise: Math.random() * 0.5,
            disgust: Math.random() * 0.2,
            trust: Math.random() * 0.7 + 0.2,
            anticipation: Math.random() * 0.6 + 0.1
        };

        setCurrentEmotion(newEmotion);
        setEmotionHistory(prev => [...prev, newEmotion]);

        const primaryEmotion = Object.entries(newEmotion).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const secondaryEmotion = Object.entries(newEmotion)
            .filter(([key]) => key !== primaryEmotion)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        const result: EmotionAnalysisResult = {
            primaryEmotion,
            secondaryEmotion,
            intensity: Math.max(...Object.values(newEmotion)),
            confidence: Math.random() * 0.3 + 0.7,
            sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
            emotionalTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
            recommendations: [
                '감정적 안정성을 위해 명상 시간을 늘려보세요',
                '긍정적인 대화를 더 많이 나누어보세요',
                '스트레스 해소를 위한 운동을 권장합니다'
            ]
        };

        setAnalysisResult(result);
        setIsAnalyzing(false);
    };

    const getEmotionColor = (emotion: string) => {
        const colors: { [key: string]: string } = {
            joy: 'text-yellow-500',
            sadness: 'text-blue-500',
            anger: 'text-red-500',
            fear: 'text-purple-500',
            surprise: 'text-orange-500',
            disgust: 'text-green-500',
            trust: 'text-indigo-500',
            anticipation: 'text-pink-500'
        };
        return colors[emotion] || 'text-gray-500';
    };

    const getEmotionIcon = (emotion: string) => {
        const icons: { [key: string]: React.ElementType } = {
            joy: FaceSmileIcon,
            sadness: FaceFrownIcon,
            anger: ExclamationTriangleIcon,
            fear: ExclamationTriangleIcon,
            surprise: FaceSmileIcon,
            disgust: FaceFrownIcon,
            trust: HeartIcon,
            anticipation: ChartBarIcon
        };
        return icons[emotion] || CogIcon;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <HeartIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">고급 감정 분석</h3>
                        <p className="text-sm text-gray-500">실시간 감정 상태 모니터링</p>
                    </div>
                </div>
                <button
                    onClick={analyzeEmotion}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
                >
                    {isAnalyzing ? '분석 중...' : '감정 분석'}
                </button>
            </div>

            {/* 현재 감정 상태 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(currentEmotion).map(([emotion, value]) => {
                    const Icon = getEmotionIcon(emotion);
                    return (
                        <div key={emotion} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Icon className={`w-5 h-5 ${getEmotionColor(emotion)}`} />
                                <span className="text-sm font-medium text-gray-700 capitalize">
                                    {emotion}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${value * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                                {(value * 100).toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 분석 결과 */}
            {analysisResult && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">주요 감정:</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">
                                    {analysisResult.primaryEmotion}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">보조 감정:</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm capitalize">
                                    {analysisResult.secondaryEmotion}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">강도:</span>
                                <span className="text-sm text-gray-800">
                                    {(analysisResult.intensity * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">감정 경향:</span>
                                <span className={`px-2 py-1 rounded text-sm ${analysisResult.emotionalTrend === 'increasing'
                                        ? 'bg-green-100 text-green-800'
                                        : analysisResult.emotionalTrend === 'decreasing'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {analysisResult.emotionalTrend === 'increasing' ? '증가'
                                        : analysisResult.emotionalTrend === 'decreasing' ? '감소' : '안정'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">신뢰도:</span>
                                <span className="text-sm text-gray-800">
                                    {(analysisResult.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">전체 톤:</span>
                                <span className={`px-2 py-1 rounded text-sm ${analysisResult.sentiment === 'positive'
                                        ? 'bg-green-100 text-green-800'
                                        : analysisResult.sentiment === 'negative'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {analysisResult.sentiment === 'positive' ? '긍정적'
                                        : analysisResult.sentiment === 'negative' ? '부정적' : '중립'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 권장사항 */}
            {analysisResult && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">권장사항</h4>
                    <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-sm text-gray-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 시간대 선택 */}
            <div className="mt-6">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600">시간대:</span>
                    <div className="flex space-x-2">
                        {(['1h', '24h', '7d', '30d'] as const).map(timeframe => (
                            <button
                                key={timeframe}
                                onClick={() => setSelectedTimeframe(timeframe)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${selectedTimeframe === timeframe
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {timeframe === '1h' ? '1시간' :
                                    timeframe === '24h' ? '24시간' :
                                        timeframe === '7d' ? '7일' : '30일'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedEmotionAnalyzer; 