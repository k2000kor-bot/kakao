import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CpuChipIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    CogIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    FireIcon,
    StarIcon,
    HeartIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

interface UltraAdvancedAIAnalyticsProps {
    selectedRoomId: string;
}

interface AIAnalyticsData {
    confidence: number;
    creativity: number;
    adaptation: number;
    learningRate: number;
    responseTime: number;
    accuracy: number;
    engagement: number;
    sentiment: number;
    complexity: number;
    originality: number;
    // 새로운 고도화 지표들
    realTimeLearning: number;
    patternRecognition: number;
    predictiveAccuracy: number;
    userSatisfaction: number;
    conversationFlow: number;
    emotionalIntelligence: number;
    contextualUnderstanding: number;
    adaptiveResponse: number;
    learningEfficiency: number;
    personalizationScore: number;
}

interface AIPattern {
    frequency: number;
    effectiveness: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    category: string;
    impact: 'high' | 'medium' | 'low';
    // 새로운 패턴 분석 데이터
    learningProgress: number;
    adaptationSpeed: number;
    userPreference: string;
    successRate: number;
    improvementRate: number;
    contextualRelevance: number;
    emotionalAlignment: number;
    responseQuality: number;
    conversationContinuity: number;
    predictiveValue: number;
}

interface AIPerformance {
    model: string;
    status: 'optimal' | 'good' | 'warning' | 'critical';
    performance: number;
    efficiency: number;
    reliability: number;
    scalability: number;
    // 새로운 성능 지표들
    realTimeProcessing: number;
    learningCapability: number;
    adaptationSpeed: number;
    patternRecognition: number;
    predictiveAccuracy: number;
    userSatisfaction: number;
    conversationQuality: number;
    emotionalIntelligence: number;
    contextualUnderstanding: number;
    personalizationLevel: number;
}

interface ConversationMetrics {
    totalMessages: number;
    activeUsers: number;
    responseTime: number;
    sentiment: number;
    engagement: number;
    topicDiversity: number;
    userSatisfaction: number;
    aiAccuracy: number;
    // 새로운 대화 지표들
    learningProgress: number;
    adaptationRate: number;
    patternSuccess: number;
    predictiveValue: number;
    emotionalAlignment: number;
    contextualRelevance: number;
    conversationFlow: number;
    userRetention: number;
    satisfactionTrend: number;
    improvementRate: number;
}

const UltraAdvancedAIAnalytics: React.FC<UltraAdvancedAIAnalyticsProps> = ({ selectedRoomId }) => {
    const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData[]>([
        { confidence: 85, creativity: 78, adaptation: 82, learningRate: 0.75, responseTime: 1200, accuracy: 88, engagement: 92, sentiment: 0.7, complexity: 65, originality: 80, realTimeLearning: 87, patternRecognition: 91, predictiveAccuracy: 84, userSatisfaction: 89, conversationFlow: 86, emotionalIntelligence: 88, contextualUnderstanding: 85, adaptiveResponse: 90, learningEfficiency: 83, personalizationScore: 92 },
        { confidence: 87, creativity: 81, adaptation: 85, learningRate: 0.78, responseTime: 1150, accuracy: 90, engagement: 94, sentiment: 0.72, complexity: 68, originality: 83, realTimeLearning: 89, patternRecognition: 93, predictiveAccuracy: 86, userSatisfaction: 91, conversationFlow: 88, emotionalIntelligence: 90, contextualUnderstanding: 87, adaptiveResponse: 92, learningEfficiency: 85, personalizationScore: 94 },
        { confidence: 89, creativity: 84, adaptation: 88, learningRate: 0.81, responseTime: 1100, accuracy: 92, engagement: 96, sentiment: 0.75, complexity: 71, originality: 86, realTimeLearning: 91, patternRecognition: 95, predictiveAccuracy: 88, userSatisfaction: 93, conversationFlow: 90, emotionalIntelligence: 92, contextualUnderstanding: 89, adaptiveResponse: 94, learningEfficiency: 87, personalizationScore: 96 },
        { confidence: 91, creativity: 87, adaptation: 91, learningRate: 0.84, responseTime: 1050, accuracy: 94, engagement: 98, sentiment: 0.78, complexity: 74, originality: 89, realTimeLearning: 93, patternRecognition: 97, predictiveAccuracy: 90, userSatisfaction: 95, conversationFlow: 92, emotionalIntelligence: 94, contextualUnderstanding: 91, adaptiveResponse: 96, learningEfficiency: 89, personalizationScore: 98 },
        { confidence: 93, creativity: 90, adaptation: 94, learningRate: 0.87, responseTime: 1000, accuracy: 96, engagement: 100, sentiment: 0.81, complexity: 77, originality: 92, realTimeLearning: 95, patternRecognition: 99, predictiveAccuracy: 92, userSatisfaction: 97, conversationFlow: 94, emotionalIntelligence: 96, contextualUnderstanding: 93, adaptiveResponse: 98, learningEfficiency: 91, personalizationScore: 100 },
        { confidence: 95, creativity: 93, adaptation: 97, learningRate: 0.90, responseTime: 950, accuracy: 98, engagement: 100, sentiment: 0.84, complexity: 80, originality: 95, realTimeLearning: 97, patternRecognition: 100, predictiveAccuracy: 94, userSatisfaction: 99, conversationFlow: 96, emotionalIntelligence: 98, contextualUnderstanding: 95, adaptiveResponse: 100, learningEfficiency: 93, personalizationScore: 100 },
        { confidence: 97, creativity: 96, adaptation: 100, learningRate: 0.93, responseTime: 900, accuracy: 100, engagement: 100, sentiment: 0.87, complexity: 83, originality: 98, realTimeLearning: 99, patternRecognition: 100, predictiveAccuracy: 96, userSatisfaction: 100, conversationFlow: 98, emotionalIntelligence: 100, contextualUnderstanding: 97, adaptiveResponse: 100, learningEfficiency: 95, personalizationScore: 100 },
        { confidence: 99, creativity: 99, adaptation: 100, learningRate: 0.96, responseTime: 850, accuracy: 100, engagement: 100, sentiment: 0.90, complexity: 86, originality: 100, realTimeLearning: 100, patternRecognition: 100, predictiveAccuracy: 98, userSatisfaction: 100, conversationFlow: 100, emotionalIntelligence: 100, contextualUnderstanding: 99, adaptiveResponse: 100, learningEfficiency: 97, personalizationScore: 100 },
        { confidence: 100, creativity: 100, adaptation: 100, learningRate: 0.99, responseTime: 800, accuracy: 100, engagement: 100, sentiment: 0.93, complexity: 89, originality: 100, realTimeLearning: 100, patternRecognition: 100, predictiveAccuracy: 100, userSatisfaction: 100, conversationFlow: 100, emotionalIntelligence: 100, contextualUnderstanding: 100, adaptiveResponse: 100, learningEfficiency: 99, personalizationScore: 100 },
        { confidence: 100, creativity: 100, adaptation: 100, learningRate: 1.0, responseTime: 750, accuracy: 100, engagement: 100, sentiment: 0.96, complexity: 92, originality: 100, realTimeLearning: 100, patternRecognition: 100, predictiveAccuracy: 100, userSatisfaction: 100, conversationFlow: 100, emotionalIntelligence: 100, contextualUnderstanding: 100, adaptiveResponse: 100, learningEfficiency: 100, personalizationScore: 100 }
    ]);

    const [patterns, setPatterns] = useState<AIPattern[]>([
        { frequency: 85, effectiveness: 92, trend: 'increasing', category: '감정 인식', impact: 'high', learningProgress: 88, adaptationSpeed: 90, userPreference: '공감적', successRate: 94, improvementRate: 12, contextualRelevance: 91, emotionalAlignment: 93, responseQuality: 89, conversationContinuity: 87, predictiveValue: 85 },
        { frequency: 78, effectiveness: 89, trend: 'increasing', category: '맥락 이해', impact: 'high', learningProgress: 85, adaptationSpeed: 88, userPreference: '전문적', successRate: 91, improvementRate: 15, contextualRelevance: 94, emotionalAlignment: 87, responseQuality: 92, conversationContinuity: 89, predictiveValue: 88 },
        { frequency: 82, effectiveness: 86, trend: 'stable', category: '패턴 학습', impact: 'medium', learningProgress: 83, adaptationSpeed: 85, userPreference: '실용적', successRate: 88, improvementRate: 8, contextualRelevance: 86, emotionalAlignment: 84, responseQuality: 87, conversationContinuity: 85, predictiveValue: 82 },
        { frequency: 75, effectiveness: 83, trend: 'increasing', category: '예측 분석', impact: 'medium', learningProgress: 80, adaptationSpeed: 82, userPreference: '창의적', successRate: 85, improvementRate: 18, contextualRelevance: 88, emotionalAlignment: 81, responseQuality: 84, conversationContinuity: 83, predictiveValue: 90 },
        { frequency: 88, effectiveness: 95, trend: 'increasing', category: '실시간 학습', impact: 'high', learningProgress: 92, adaptationSpeed: 94, userPreference: '적응적', successRate: 96, improvementRate: 20, contextualRelevance: 95, emotionalAlignment: 93, responseQuality: 94, conversationContinuity: 91, predictiveValue: 92 }
    ]);

    const [aiPerformance, setAiPerformance] = useState<AIPerformance>({
        model: 'GPT-4 Ultra',
        status: 'optimal',
        performance: 96,
        efficiency: 94,
        reliability: 98,
        scalability: 92,
        realTimeProcessing: 95,
        learningCapability: 97,
        adaptationSpeed: 93,
        patternRecognition: 96,
        predictiveAccuracy: 94,
        userSatisfaction: 98,
        conversationQuality: 95,
        emotionalIntelligence: 96,
        contextualUnderstanding: 94,
        personalizationLevel: 97
    });

    const [conversationMetrics, setConversationMetrics] = useState<ConversationMetrics>({
        totalMessages: 1247,
        activeUsers: 23,
        responseTime: 1.2,
        sentiment: 0.78,
        engagement: 94,
        topicDiversity: 87,
        userSatisfaction: 96,
        aiAccuracy: 94,
        learningProgress: 89,
        adaptationRate: 92,
        patternSuccess: 88,
        predictiveValue: 85,
        emotionalAlignment: 91,
        contextualRelevance: 93,
        conversationFlow: 90,
        userRetention: 95,
        satisfactionTrend: 12,
        improvementRate: 15
    });

    const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        // 실시간 데이터 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setAnalyticsData(prev => {
                const newData = [...prev];
                newData.push({
                    confidence: Math.max(80, Math.min(95, prev[prev.length - 1].confidence + (Math.random() - 0.5) * 2)),
                    creativity: Math.max(85, Math.min(98, prev[prev.length - 1].creativity + (Math.random() - 0.5) * 1.5)),
                    adaptation: Math.max(75, Math.min(90, prev[prev.length - 1].adaptation + (Math.random() - 0.5) * 2)),
                    learningRate: Math.max(80, Math.min(95, prev[prev.length - 1].learningRate + (Math.random() - 0.5) * 1.8)),
                    responseTime: Math.max(1.5, Math.min(3.5, prev[prev.length - 1].responseTime + (Math.random() - 0.5) * 0.3)),
                    accuracy: Math.max(88, Math.min(96, prev[prev.length - 1].accuracy + (Math.random() - 0.5) * 1.2)),
                    engagement: Math.max(85, Math.min(95, prev[prev.length - 1].engagement + (Math.random() - 0.5) * 1.5)),
                    sentiment: Math.max(70, Math.min(85, prev[prev.length - 1].sentiment + (Math.random() - 0.5) * 2)),
                    complexity: Math.max(78, Math.min(90, prev[prev.length - 1].complexity + (Math.random() - 0.5) * 1.8)),
                    originality: Math.max(85, Math.min(95, prev[prev.length - 1].originality + (Math.random() - 0.5) * 1.5)),
                    realTimeLearning: Math.max(80, Math.min(95, prev[prev.length - 1].realTimeLearning + (Math.random() - 0.5) * 5)),
                    patternRecognition: Math.max(85, Math.min(95, prev[prev.length - 1].patternRecognition + (Math.random() - 0.5) * 5)),
                    predictiveAccuracy: Math.max(80, Math.min(90, prev[prev.length - 1].predictiveAccuracy + (Math.random() - 0.5) * 5)),
                    userSatisfaction: Math.max(85, Math.min(95, prev[prev.length - 1].userSatisfaction + (Math.random() - 0.5) * 5)),
                    conversationFlow: Math.max(80, Math.min(90, prev[prev.length - 1].conversationFlow + (Math.random() - 0.5) * 5)),
                    emotionalIntelligence: Math.max(80, Math.min(90, prev[prev.length - 1].emotionalIntelligence + (Math.random() - 0.5) * 5)),
                    contextualUnderstanding: Math.max(80, Math.min(90, prev[prev.length - 1].contextualUnderstanding + (Math.random() - 0.5) * 5)),
                    adaptiveResponse: Math.max(80, Math.min(90, prev[prev.length - 1].adaptiveResponse + (Math.random() - 0.5) * 5)),
                    learningEfficiency: Math.max(80, Math.min(90, prev[prev.length - 1].learningEfficiency + (Math.random() - 0.5) * 5)),
                    personalizationScore: Math.max(80, Math.min(90, prev[prev.length - 1].personalizationScore + (Math.random() - 0.5) * 5))
                });
                return newData;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const analyzePerformance = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
        }, 3000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'text-green-600';
            case 'good': return 'text-blue-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'optimal': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
            case 'good': return <CheckCircleIcon className="w-4 h-4 text-blue-600" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
            case 'critical': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
            default: return <CogIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'increasing': return 'text-green-600';
            case 'decreasing': return 'text-red-600';
            case 'stable': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
            case 'decreasing': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-600 transform rotate-180" />;
            case 'stable': return <ChartBarIcon className="w-4 h-4 text-blue-600" />;
            default: return <ChartBarIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'emotional': return <HeartIcon className="w-4 h-4" />;
            case 'analytical': return <CpuChipIcon className="w-4 h-4" />;
            case 'creative': return <SparklesIcon className="w-4 h-4" />;
            case 'engagement': return <UserGroupIcon className="w-4 h-4" />;
            case 'narrative': return <StarIcon className="w-4 h-4" />;
            default: return <LightBulbIcon className="w-4 h-4" />;
        }
    };

    const getLearningEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 90) return 'text-green-600';
        if (efficiency >= 80) return 'text-blue-600';
        if (efficiency >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAdaptationSpeedColor = (speed: number) => {
        if (speed >= 90) return 'text-purple-600';
        if (speed >= 80) return 'text-indigo-600';
        if (speed >= 70) return 'text-pink-600';
        return 'text-gray-600';
    };

    const getPredictiveAccuracyColor = (accuracy: number) => {
        if (accuracy >= 90) return 'text-emerald-600';
        if (accuracy >= 80) return 'text-teal-600';
        if (accuracy >= 70) return 'text-cyan-600';
        return 'text-slate-600';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">초고도화 AI 분석</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600">실시간 학습 + 예측 분석</span>
                </div>
            </div>

            {/* AI 성능 대시보드 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <CpuChipIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI 성능 대시보드</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(aiPerformance.status)}`}>
                            {getStatusIcon(aiPerformance.status)} {aiPerformance.model}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="bg-white rounded p-2">
                        <div className="text-blue-600 font-medium">실시간 처리</div>
                        <div className="text-lg font-bold">{aiPerformance.realTimeProcessing}%</div>
                    </div>
                    <div className="bg-white rounded p-2">
                        <div className="text-green-600 font-medium">학습 능력</div>
                        <div className="text-lg font-bold">{aiPerformance.learningCapability}%</div>
                    </div>
                    <div className="bg-white rounded p-2">
                        <div className="text-purple-600 font-medium">적응 속도</div>
                        <div className="text-lg font-bold">{aiPerformance.adaptationSpeed}%</div>
                    </div>
                    <div className="bg-white rounded p-2">
                        <div className="text-indigo-600 font-medium">패턴 인식</div>
                        <div className="text-lg font-bold">{aiPerformance.patternRecognition}%</div>
                    </div>
                </div>
            </div>

            {/* 고도화 지표들 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">고도화 AI 지표</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">실시간 학습</span>
                            <span className={`text-sm font-medium ${getLearningEfficiencyColor(analyticsData[analyticsData.length - 1].realTimeLearning)}`}>
                                {analyticsData[analyticsData.length - 1].realTimeLearning}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].realTimeLearning}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">패턴 인식</span>
                            <span className={`text-sm font-medium ${getAdaptationSpeedColor(analyticsData[analyticsData.length - 1].patternRecognition)}`}>
                                {analyticsData[analyticsData.length - 1].patternRecognition}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].patternRecognition}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">예측 정확도</span>
                            <span className={`text-sm font-medium ${getPredictiveAccuracyColor(analyticsData[analyticsData.length - 1].predictiveAccuracy)}`}>
                                {analyticsData[analyticsData.length - 1].predictiveAccuracy}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].predictiveAccuracy}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">감정 지능</span>
                            <span className={`text-sm font-medium ${getLearningEfficiencyColor(analyticsData[analyticsData.length - 1].emotionalIntelligence)}`}>
                                {analyticsData[analyticsData.length - 1].emotionalIntelligence}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].emotionalIntelligence}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">맥락 이해</span>
                            <span className={`text-sm font-medium ${getAdaptationSpeedColor(analyticsData[analyticsData.length - 1].contextualUnderstanding)}`}>
                                {analyticsData[analyticsData.length - 1].contextualUnderstanding}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].contextualUnderstanding}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">개인화 점수</span>
                            <span className={`text-sm font-medium ${getPredictiveAccuracyColor(analyticsData[analyticsData.length - 1].personalizationScore)}`}>
                                {analyticsData[analyticsData.length - 1].personalizationScore}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${analyticsData[analyticsData.length - 1].personalizationScore}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 패턴 분석 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">학습 패턴 분석</h4>
                <div className="space-y-3">
                    {patterns.map((pattern, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {getCategoryIcon(pattern.category)}
                                    <span className="text-sm font-medium text-gray-900">{pattern.category}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(pattern.trend)}`}>
                                        {getTrendIcon(pattern.trend)} {pattern.trend === 'increasing' ? '증가' : pattern.trend === 'decreasing' ? '감소' : '안정'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${pattern.impact === 'high' ? 'bg-red-100 text-red-800' : pattern.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {pattern.impact === 'high' ? '높음' : pattern.impact === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">학습 진행률:</span>
                                    <div className="font-medium text-blue-600">{pattern.learningProgress}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">적응 속도:</span>
                                    <div className="font-medium text-green-600">{pattern.adaptationSpeed}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">성공률:</span>
                                    <div className="font-medium text-purple-600">{pattern.successRate}%</div>
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">개선률:</span>
                                    <div className="font-medium text-emerald-600">+{pattern.improvementRate}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">예측 가치:</span>
                                    <div className="font-medium text-indigo-600">{pattern.predictiveValue}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 대화 지표 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">실시간 대화 지표</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">학습 진행률</span>
                                <span className="text-lg font-bold text-blue-600">{conversationMetrics.learningProgress}%</span>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-900">적응률</span>
                                <span className="text-lg font-bold text-green-600">{conversationMetrics.adaptationRate}%</span>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-900">패턴 성공률</span>
                                <span className="text-lg font-bold text-purple-600">{conversationMetrics.patternSuccess}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-emerald-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-emerald-900">예측 가치</span>
                                <span className="text-lg font-bold text-emerald-600">{conversationMetrics.predictiveValue}%</span>
                            </div>
                        </div>

                        <div className="bg-pink-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-pink-900">감정 정렬</span>
                                <span className="text-lg font-bold text-pink-600">{conversationMetrics.emotionalAlignment}%</span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-indigo-900">맥락 관련성</span>
                                <span className="text-lg font-bold text-indigo-600">{conversationMetrics.contextualRelevance}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 개선 추세 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">개선 추세</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">만족도 트렌드</span>
                            <span className="text-lg font-bold text-green-600">+{conversationMetrics.satisfactionTrend}%</span>
                        </div>
                        <div className="text-xs text-green-700">지난 주 대비 개선</div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-900">개선률</span>
                            <span className="text-lg font-bold text-purple-600">+{conversationMetrics.improvementRate}%</span>
                        </div>
                        <div className="text-xs text-purple-700">전체 성능 향상</div>
                    </div>
                </div>
            </div>

            {/* 실시간 업데이트 상태 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">실시간 학습 활성화</span>
                    </div>
                    <div className="text-xs text-blue-700">
                        마지막 업데이트: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UltraAdvancedAIAnalytics; 