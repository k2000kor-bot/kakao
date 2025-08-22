import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Brain,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    BarChart3,
    Activity,
    Zap,
    Eye,
    EyeOff,
    Play,
    Pause,
    RotateCcw,
    Download,
    Settings,
    Filter,
    Search,
    Lightbulb,
    Target,
    Heart,
    Star,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationMessage {
    id: string;
    speaker: 'user' | 'ai';
    content: string;
    timestamp: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
    topics: string[];
    emotions: string[];
    intent: string;
    quality: number;
    relevance: number;
}

interface ConversationAnalysis {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    messageCount: number;
    participants: string[];
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    keyTopics: Array<{
        topic: string;
        frequency: number;
        importance: number;
    }>;
    emotions: Array<{
        emotion: string;
        intensity: number;
        frequency: number;
    }>;
    qualityMetrics: {
        clarity: number;
        relevance: number;
        completeness: number;
        engagement: number;
    };
    insights: Array<{
        type: 'opportunity' | 'risk' | 'improvement' | 'trend';
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        confidence: number;
    }>;
    recommendations: Array<{
        id: string;
        type: 'action' | 'strategy' | 'improvement';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'low' | 'medium' | 'high';
        priority: 'critical' | 'high' | 'medium' | 'low';
    }>;
}

interface RealTimeConversationAnalyzerProps {
    onAnalysisComplete?: (analysis: ConversationAnalysis) => void;
    onInsightAction?: (insightId: string, action: string) => void;
    onRecommendationAction?: (recommendationId: string, action: string) => void;
    onExportAnalysis?: (analysisId: string, format: string) => void;
}

const RealTimeConversationAnalyzer: React.FC<RealTimeConversationAnalyzerProps> = ({
    onAnalysisComplete,
    onInsightAction,
    onRecommendationAction,
    onExportAnalysis
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'analysis' | 'insights' | 'recommendations' | 'settings'>('live');
    const [conversations, setConversations] = useState<ConversationAnalysis[]>([]);
    const [currentConversation, setCurrentConversation] = useState<ConversationAnalysis | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [analysisSettings, setAnalysisSettings] = useState({
        realTimeAnalysis: true,
        sentimentAnalysis: true,
        emotionDetection: true,
        topicExtraction: true,
        qualityAssessment: true,
        autoInsights: true,
        autoRecommendations: true
    });
    const [filterSettings, setFilterSettings] = useState({
        minConfidence: 0.7,
        minQuality: 0.6,
        sentimentFilter: 'all' as 'all' | 'positive' | 'negative' | 'neutral',
        emotionFilter: 'all' as 'all' | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise'
    });

    const analysisInterval = useRef<NodeJS.Timeout | null>(null);
    const messageQueue = useRef<ConversationMessage[]>([]);

    // Mock data for demonstration
    useEffect(() => {
        const mockConversation: ConversationAnalysis = {
            id: 'conv-1',
            startTime: new Date(),
            duration: 0,
            messageCount: 0,
            participants: ['사용자', 'AI 어시스턴트'],
            overallSentiment: 'positive',
            sentimentScore: 0.75,
            keyTopics: [
                { topic: '프로젝트 관리', frequency: 15, importance: 0.9 },
                { topic: 'AI 기능', frequency: 12, importance: 0.8 },
                { topic: '데이터 분석', frequency: 8, importance: 0.7 }
            ],
            emotions: [
                { emotion: '기대', intensity: 0.8, frequency: 10 },
                { emotion: '만족', intensity: 0.7, frequency: 8 },
                { emotion: '호기심', intensity: 0.6, frequency: 6 }
            ],
            qualityMetrics: {
                clarity: 0.85,
                relevance: 0.92,
                completeness: 0.78,
                engagement: 0.88
            },
            insights: [
                {
                    type: 'opportunity',
                    title: 'AI 기능 활용도 증가',
                    description: '사용자가 AI 기능에 대한 관심이 높아지고 있습니다.',
                    priority: 'high',
                    confidence: 0.87
                },
                {
                    type: 'improvement',
                    title: '응답 완성도 개선 필요',
                    description: '일부 응답의 완성도가 낮아 사용자 만족도에 영향을 줄 수 있습니다.',
                    priority: 'medium',
                    confidence: 0.73
                }
            ],
            recommendations: [
                {
                    id: 'rec-1',
                    type: 'improvement',
                    title: '응답 품질 향상',
                    description: 'AI 응답의 완성도와 정확성을 높여 사용자 만족도를 개선합니다.',
                    impact: 'high',
                    effort: 'medium',
                    priority: 'high'
                },
                {
                    id: 'rec-2',
                    type: 'strategy',
                    title: 'AI 기능 교육',
                    description: '사용자에게 AI 기능의 활용 방법을 교육하여 사용률을 높입니다.',
                    impact: 'medium',
                    effort: 'low',
                    priority: 'medium'
                }
            ]
        };

        setCurrentConversation(mockConversation);
        setConversations([mockConversation]);
    }, []);

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setIsPaused(false);

        // Simulate real-time message processing
        analysisInterval.current = setInterval(() => {
            if (!isPaused && currentConversation) {
                processNewMessage();
            }
        }, 3000);
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (analysisInterval.current) {
            clearInterval(analysisInterval.current);
        }
    };

    const pauseAnalysis = () => {
        setIsPaused(true);
    };

    const resumeAnalysis = () => {
        setIsPaused(false);
    };

    const processNewMessage = () => {
        // Simulate new message analysis
        const newMessage: ConversationMessage = {
            id: `msg-${Date.now()}`,
            speaker: Math.random() > 0.5 ? 'user' : 'ai',
            content: '새로운 메시지가 분석되었습니다.',
            timestamp: new Date(),
            sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
            confidence: 0.7 + Math.random() * 0.3,
            keywords: ['키워드1', '키워드2', '키워드3'],
            topics: ['주제1', '주제2'],
            emotions: ['감정1', '감정2'],
            intent: '의도 분석',
            quality: 0.6 + Math.random() * 0.4,
            relevance: 0.7 + Math.random() * 0.3
        };

        setMessages(prev => [...prev, newMessage]);

        if (currentConversation) {
            const updatedConversation = {
                ...currentConversation,
                messageCount: currentConversation.messageCount + 1,
                duration: Date.now() - currentConversation.startTime.getTime()
            };
            setCurrentConversation(updatedConversation);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50';
            case 'negative': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getInsightTypeColor = (type: string) => {
        switch (type) {
            case 'opportunity': return 'text-green-600 bg-green-50';
            case 'risk': return 'text-red-600 bg-red-50';
            case 'improvement': return 'text-blue-600 bg-blue-50';
            case 'trend': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">실시간 대화 분석</h2>
                            <p className="text-sm text-gray-500">AI 기반 실시간 대화 분석 및 인사이트 제공</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isAnalyzing ? (
                            <button
                                onClick={startAnalysis}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Play className="h-4 w-4" />
                                <span>분석 시작</span>
                            </button>
                        ) : (
                            <>
                                {isPaused ? (
                                    <button
                                        onClick={resumeAnalysis}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Play className="h-4 w-4" />
                                        <span>재개</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={pauseAnalysis}
                                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        <Pause className="h-4 w-4" />
                                        <span>일시정지</span>
                                    </button>
                                )}
                                <button
                                    onClick={stopAnalysis}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span>중지</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-600">
                            {isAnalyzing ? (isPaused ? '일시정지됨' : '분석 중') : '대기 중'}
                        </span>
                    </div>
                    {currentConversation && (
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>메시지: {currentConversation.messageCount}개</span>
                            <span>지속시간: {Math.floor(currentConversation.duration / 1000)}초</span>
                            <span>참여자: {currentConversation.participants.length}명</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4">
                    {[
                        { id: 'live', label: '실시간', icon: Activity },
                        { id: 'analysis', label: '분석', icon: BarChart3 },
                        { id: 'insights', label: '인사이트', icon: Lightbulb },
                        { id: 'recommendations', label: '추천', icon: Target },
                        { id: 'settings', label: '설정', icon: Settings }
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'live' && (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Real-time Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">전체 감정 점수</p>
                                            <p className="text-2xl font-bold">
                                                {currentConversation?.sentimentScore ? Math.round(currentConversation.sentimentScore * 100) : 0}%
                                            </p>
                                        </div>
                                        <Heart className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">품질 점수</p>
                                            <p className="text-2xl font-bold">
                                                {currentConversation?.qualityMetrics ? Math.round(currentConversation.qualityMetrics.clarity * 100) : 0}%
                                            </p>
                                        </div>
                                        <Star className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">참여도</p>
                                            <p className="text-2xl font-bold">
                                                {currentConversation?.qualityMetrics ? Math.round(currentConversation.qualityMetrics.engagement * 100) : 0}%
                                            </p>
                                        </div>
                                        <Users className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">관련성</p>
                                            <p className="text-2xl font-bold">
                                                {currentConversation?.qualityMetrics ? Math.round(currentConversation.qualityMetrics.relevance * 100) : 0}%
                                            </p>
                                        </div>
                                        <Target className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                            </div>

                            {/* Live Messages */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 메시지 분석</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {messages.slice(-10).map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white p-3 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(message.sentiment)}`}>
                                                            {message.sentiment === 'positive' ? '긍정' : message.sentiment === 'negative' ? '부정' : '중립'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            신뢰도: {Math.round(message.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {message.keywords.slice(0, 3).map((keyword, index) => (
                                                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <div className="text-xs text-gray-500">
                                                        품질: {Math.round(message.quality * 100)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analysis' && currentConversation && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Key Topics */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 주제</h3>
                                <div className="space-y-3">
                                    {currentConversation.keyTopics.map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{topic.topic}</span>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(topic.importance * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-12">
                                                    {topic.frequency}회
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Emotions */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentConversation.emotions.map((emotion, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">{emotion.emotion}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${(emotion.intensity * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-8">
                                                    {emotion.frequency}회
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quality Metrics */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">품질 지표</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(currentConversation.qualityMetrics).map(([metric, value]) => (
                                        <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                {metric === 'clarity' ? '명확성' :
                                                    metric === 'relevance' ? '관련성' :
                                                        metric === 'completeness' ? '완성도' : '참여도'}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${(value * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {Math.round(value * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'insights' && currentConversation && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {currentConversation.insights.map((insight, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Lightbulb className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                                    <p className="text-sm text-gray-500">{insight.description}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInsightTypeColor(insight.type)}`}>
                                                {insight.type === 'opportunity' ? '기회' :
                                                    insight.type === 'risk' ? '위험' :
                                                        insight.type === 'improvement' ? '개선' : '트렌드'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                                                    {insight.priority === 'high' ? '높음' :
                                                        insight.priority === 'medium' ? '중간' : '낮음'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    신뢰도: {Math.round(insight.confidence * 100)}%
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onInsightAction?.(insight.title, 'accept')}
                                                    className="p-1 hover:bg-green-100 rounded transition-colors"
                                                >
                                                    <ThumbsUp className="h-4 w-4 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => onInsightAction?.(insight.title, 'reject')}
                                                    className="p-1 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <ThumbsDown className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'recommendations' && currentConversation && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {currentConversation.recommendations.map((recommendation) => (
                                    <motion.div
                                        key={recommendation.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Target className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
                                                    <p className="text-sm text-gray-500">{recommendation.description}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                                                {recommendation.priority === 'critical' ? '긴급' :
                                                    recommendation.priority === 'high' ? '높음' :
                                                        recommendation.priority === 'medium' ? '중간' : '낮음'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">영향도</span>
                                                    <div className="font-medium">
                                                        {recommendation.impact === 'high' ? '높음' :
                                                            recommendation.impact === 'medium' ? '중간' : '낮음'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">노력</span>
                                                    <div className="font-medium">
                                                        {recommendation.effort === 'low' ? '낮음' :
                                                            recommendation.effort === 'medium' ? '중간' : '높음'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onRecommendationAction?.(recommendation.id, 'accept')}
                                                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    수락
                                                </button>
                                                <button
                                                    onClick={() => onRecommendationAction?.(recommendation.id, 'reject')}
                                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    거부
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Analysis Settings */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 설정</h3>
                                <div className="space-y-4">
                                    {Object.entries(analysisSettings).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                {key === 'realTimeAnalysis' ? '실시간 분석' :
                                                    key === 'sentimentAnalysis' ? '감정 분석' :
                                                        key === 'emotionDetection' ? '감정 감지' :
                                                            key === 'topicExtraction' ? '주제 추출' :
                                                                key === 'qualityAssessment' ? '품질 평가' :
                                                                    key === 'autoInsights' ? '자동 인사이트' :
                                                                        '자동 추천'}
                                            </span>
                                            <button
                                                onClick={() => setAnalysisSettings(prev => ({ ...prev, [key]: !value }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Settings */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">필터 설정</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            최소 신뢰도
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={filterSettings.minConfidence}
                                            onChange={(e) => setFilterSettings(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-500">{Math.round(filterSettings.minConfidence * 100)}%</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            최소 품질
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={filterSettings.minQuality}
                                            onChange={(e) => setFilterSettings(prev => ({ ...prev, minQuality: parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-500">{Math.round(filterSettings.minQuality * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RealTimeConversationAnalyzer;
