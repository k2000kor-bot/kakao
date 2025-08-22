import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Brain,
    Target,
    BarChart3,
    Lightbulb,
    Zap,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    Filter,
    Download,
    RefreshCw,
    Settings,
    Users,
    Calendar,
    Star,
    TrendingDown,
    Activity,
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Prediction {
    id: string;
    type: 'project_success' | 'user_behavior' | 'resource_usage' | 'market_trend' | 'performance_optimization';
    title: string;
    description: string;
    confidence: number;
    probability: number;
    timeframe: 'short_term' | 'medium_term' | 'long_term';
    impact: 'high' | 'medium' | 'low';
    status: 'active' | 'completed' | 'expired';
    createdAt: Date;
    expiresAt: Date;
    factors: string[];
    recommendations: Recommendation[];
    accuracy?: number;
    actualOutcome?: 'success' | 'failure' | 'partial';
}

interface Recommendation {
    id: string;
    type: 'action' | 'strategy' | 'optimization' | 'prevention';
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    impact: 'high' | 'medium' | 'low';
    timeframe: 'immediate' | 'short_term' | 'long_term';
    cost: number;
    roi: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    tags: string[];
}

interface UserBehavior {
    userId: string;
    userName: string;
    patterns: {
        loginFrequency: number;
        sessionDuration: number;
        featureUsage: Record<string, number>;
        projectEngagement: number;
        collaborationLevel: number;
    };
    predictions: {
        churnRisk: number;
        featureAdoption: number;
        productivityScore: number;
        nextAction: string;
    };
    recommendations: Recommendation[];
}

interface MarketTrend {
    id: string;
    category: string;
    trend: 'rising' | 'falling' | 'stable';
    confidence: number;
    timeframe: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    opportunities: string[];
    risks: string[];
    recommendations: Recommendation[];
}

interface AIPredictionSystemProps {
    onPredictionAction?: (predictionId: string, action: string) => void;
    onRecommendationAction?: (recommendationId: string, action: string) => void;
    onExportData?: (type: string) => void;
    onRefreshPredictions?: () => void;
}

const AIPredictionSystem: React.FC<AIPredictionSystemProps> = ({
    onPredictionAction,
    onRecommendationAction,
    onExportData,
    onRefreshPredictions
}) => {
    const [activeTab, setActiveTab] = useState<'predictions' | 'recommendations' | 'behavior' | 'trends' | 'analytics'>('predictions');
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterTimeframe, setFilterTimeframe] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock data
    const [predictions] = useState<Prediction[]>([
        {
            id: '1',
            type: 'project_success',
            title: '프로젝트 완료율 15% 향상 예측',
            description: '현재 진행 중인 프로젝트들의 완료율이 향후 3개월 내 15% 향상될 것으로 예측됩니다.',
            confidence: 87,
            probability: 0.87,
            timeframe: 'medium_term',
            impact: 'high',
            status: 'active',
            createdAt: new Date('2024-01-15'),
            expiresAt: new Date('2024-04-15'),
            factors: ['팀 협업 개선', 'AI 도구 활용 증가', '프로세스 최적화'],
            recommendations: [
                {
                    id: 'rec1',
                    type: 'optimization',
                    title: '협업 도구 통합',
                    description: '팀 협업 도구를 통합하여 커뮤니케이션 효율성을 높입니다.',
                    priority: 'high',
                    effort: 'medium',
                    impact: 'high',
                    timeframe: 'short_term',
                    cost: 5000,
                    roi: 2.5,
                    status: 'pending',
                    tags: ['협업', '효율성', '통합']
                }
            ]
        },
        {
            id: '2',
            type: 'user_behavior',
            title: '사용자 이탈 위험 감지',
            description: '특정 사용자 그룹에서 이탈 위험이 감지되었습니다.',
            confidence: 92,
            probability: 0.92,
            timeframe: 'short_term',
            impact: 'high',
            status: 'active',
            createdAt: new Date('2024-01-18'),
            expiresAt: new Date('2024-02-18'),
            factors: ['사용 빈도 감소', '피드백 부정적', '경쟁 서비스 사용'],
            recommendations: [
                {
                    id: 'rec2',
                    type: 'prevention',
                    title: '사용자 참여 프로그램',
                    description: '이탈 위험 사용자들을 위한 맞춤형 참여 프로그램을 제공합니다.',
                    priority: 'critical',
                    effort: 'high',
                    impact: 'high',
                    timeframe: 'immediate',
                    cost: 15000,
                    roi: 3.2,
                    status: 'in_progress',
                    tags: ['사용자 참여', '이탈 방지', '맞춤형']
                }
            ]
        }
    ]);

    const [recommendations] = useState<Recommendation[]>([
        {
            id: 'rec3',
            type: 'strategy',
            title: 'AI 모델 성능 최적화',
            description: '현재 AI 모델의 성능을 20% 향상시킬 수 있는 최적화 방안을 제안합니다.',
            priority: 'high',
            effort: 'medium',
            impact: 'high',
            timeframe: 'short_term',
            cost: 8000,
            roi: 2.8,
            status: 'pending',
            tags: ['AI', '성능', '최적화']
        },
        {
            id: 'rec4',
            type: 'action',
            title: '데이터 품질 개선',
            description: '데이터 품질을 개선하여 예측 정확도를 높입니다.',
            priority: 'medium',
            effort: 'low',
            impact: 'medium',
            timeframe: 'short_term',
            cost: 3000,
            roi: 1.5,
            status: 'completed',
            tags: ['데이터', '품질', '정확도']
        }
    ]);

    const [userBehaviors] = useState<UserBehavior[]>([
        {
            userId: 'user1',
            userName: '김개발',
            patterns: {
                loginFrequency: 5.2,
                sessionDuration: 45,
                featureUsage: {
                    'chat': 80,
                    'analytics': 60,
                    'collaboration': 40
                },
                projectEngagement: 85,
                collaborationLevel: 70
            },
            predictions: {
                churnRisk: 0.15,
                featureAdoption: 0.75,
                productivityScore: 82,
                nextAction: '프로젝트 생성'
            },
            recommendations: []
        }
    ]);

    const [marketTrends] = useState<MarketTrend[]>([
        {
            id: 'trend1',
            category: 'AI 개발 도구',
            trend: 'rising',
            confidence: 89,
            timeframe: '6개월',
            description: 'AI 기반 개발 도구 시장이 지속적으로 성장하고 있습니다.',
            impact: 'positive',
            opportunities: ['새로운 기능 개발', '시장 확장', '파트너십'],
            risks: ['경쟁 심화', '기술 변화', '규제 변화'],
            recommendations: []
        }
    ]);

    const getPredictionTypeIcon = (type: string) => {
        switch (type) {
            case 'project_success': return <Target className="h-5 w-5" />;
            case 'user_behavior': return <Users className="h-5 w-5" />;
            case 'resource_usage': return <BarChart3 className="h-5 w-5" />;
            case 'market_trend': return <TrendingUp className="h-5 w-5" />;
            case 'performance_optimization': return <Zap className="h-5 w-5" />;
            default: return <Brain className="h-5 w-5" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600 bg-green-50';
        if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onRefreshPredictions?.();
        setIsRefreshing(false);
    };

    const filteredPredictions = predictions.filter(prediction => {
        const matchesType = filterType === 'all' || prediction.type === filterType;
        const matchesTimeframe = filterTimeframe === 'all' || prediction.timeframe === filterTimeframe;
        return matchesType && matchesTimeframe;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">AI 예측 및 추천 시스템</h2>
                            <p className="text-sm text-gray-500">AI 기반 예측과 맞춤형 추천을 제공합니다</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>새로고침</span>
                        </button>
                        <button
                            onClick={() => onExportData?.('predictions')}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            <span>내보내기</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'predictions', label: '예측', icon: TrendingUp },
                        { id: 'recommendations', label: '추천', icon: Lightbulb },
                        { id: 'behavior', label: '사용자 행동', icon: Users },
                        { id: 'trends', label: '시장 트렌드', icon: TrendingUp },
                        { id: 'analytics', label: '분석', icon: BarChart3 }
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-white text-purple-600 shadow-sm'
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
                    {activeTab === 'predictions' && (
                        <motion.div
                            key="predictions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Filters */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">모든 유형</option>
                                        <option value="project_success">프로젝트 성공</option>
                                        <option value="user_behavior">사용자 행동</option>
                                        <option value="resource_usage">리소스 사용</option>
                                        <option value="market_trend">시장 트렌드</option>
                                        <option value="performance_optimization">성능 최적화</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <select
                                        value={filterTimeframe}
                                        onChange={(e) => setFilterTimeframe(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">모든 기간</option>
                                        <option value="short_term">단기</option>
                                        <option value="medium_term">중기</option>
                                        <option value="long_term">장기</option>
                                    </select>
                                </div>
                            </div>

                            {/* Predictions Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredPredictions.map((prediction) => (
                                    <motion.div
                                        key={prediction.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedPrediction(prediction)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    {getPredictionTypeIcon(prediction.type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{prediction.title}</h3>
                                                    <p className="text-sm text-gray-500">{prediction.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                                                    {prediction.confidence}% 신뢰도
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(prediction.impact)}`}>
                                                    {prediction.impact === 'high' ? '높은' : prediction.impact === 'medium' ? '중간' : '낮은'} 영향
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">확률</span>
                                                <span className="font-medium">{(prediction.probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${prediction.probability * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {prediction.timeframe === 'short_term' ? '단기' :
                                                            prediction.timeframe === 'medium_term' ? '중기' : '장기'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{prediction.expiresAt.toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {prediction.factors.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">주요 요인:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prediction.factors.slice(0, 3).map((factor, index) => (
                                                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                {factor}
                                                            </span>
                                                        ))}
                                                        {prediction.factors.length > 3 && (
                                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                +{prediction.factors.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'recommendations' && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {recommendations.map((recommendation) => (
                                    <motion.div
                                        key={recommendation.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Lightbulb className="h-5 w-5 text-blue-600" />
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
                                                    <span className="text-gray-500">ROI</span>
                                                    <div className="font-medium text-green-600">{recommendation.roi}x</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">비용</span>
                                                    <div className="font-medium">₩{recommendation.cost.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">노력</span>
                                                    <div className="font-medium">
                                                        {recommendation.effort === 'low' ? '낮음' :
                                                            recommendation.effort === 'medium' ? '중간' : '높음'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">영향</span>
                                                    <div className="font-medium">
                                                        {recommendation.impact === 'high' ? '높음' :
                                                            recommendation.impact === 'medium' ? '중간' : '낮음'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onRecommendationAction?.(recommendation.id, 'accept')}
                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

                    {activeTab === 'behavior' && (
                        <motion.div
                            key="behavior"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {userBehaviors.map((behavior) => (
                                    <motion.div
                                        key={behavior.userId}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">{behavior.userName}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${behavior.predictions.churnRisk < 0.2 ? 'text-green-600 bg-green-50' :
                                                        behavior.predictions.churnRisk < 0.5 ? 'text-yellow-600 bg-yellow-50' :
                                                            'text-red-600 bg-red-50'
                                                    }`}>
                                                    이탈 위험: {(behavior.predictions.churnRisk * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-purple-600">{behavior.patterns.loginFrequency}</div>
                                                    <div className="text-xs text-gray-500">주간 로그인</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-blue-600">{behavior.patterns.sessionDuration}분</div>
                                                    <div className="text-xs text-gray-500">평균 세션</div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">기능 사용률</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(behavior.patterns.featureUsage).map(([feature, usage]) => (
                                                        <div key={feature} className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600 capitalize">{feature}</span>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-purple-600 h-2 rounded-full"
                                                                        style={{ width: `${usage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-500 w-8">{usage}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t pt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">다음 예상 행동</h4>
                                                <p className="text-sm text-gray-600">{behavior.predictions.nextAction}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'trends' && (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {marketTrends.map((trend) => (
                                    <motion.div
                                        key={trend.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${trend.trend === 'rising' ? 'bg-green-100' :
                                                        trend.trend === 'falling' ? 'bg-red-100' : 'bg-gray-100'
                                                    }`}>
                                                    <TrendingUp className={`h-5 w-5 ${trend.trend === 'rising' ? 'text-green-600' :
                                                            trend.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                                                        }`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{trend.category}</h3>
                                                    <p className="text-sm text-gray-500">{trend.description}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${trend.impact === 'positive' ? 'text-green-600 bg-green-50' :
                                                    trend.impact === 'negative' ? 'text-red-600 bg-red-50' :
                                                        'text-gray-600 bg-gray-50'
                                                }`}>
                                                {trend.impact === 'positive' ? '긍정적' :
                                                    trend.impact === 'negative' ? '부정적' : '중립'}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">신뢰도</span>
                                                <span className="font-medium">{trend.confidence}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${trend.confidence}%` }}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">기회</h4>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {trend.opportunities.slice(0, 3).map((opportunity, index) => (
                                                            <li key={index} className="flex items-center space-x-1">
                                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                                <span>{opportunity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">위험</h4>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {trend.risks.slice(0, 3).map((risk, index) => (
                                                            <li key={index} className="flex items-center space-x-1">
                                                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                                                <span>{risk}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">예측 정확도</h3>
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-purple-600 mb-2">87.3%</div>
                                    <div className="text-sm text-gray-500">지난 30일 평균</div>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">+2.1%</span>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">활성 예측</h3>
                                        <Activity className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                                    <div className="text-sm text-gray-500">현재 진행 중</div>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">+3개</span>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">추천 수락률</h3>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-green-600 mb-2">73.5%</div>
                                    <div className="text-sm text-gray-500">지난 30일</div>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">+5.2%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">예측 성과 분석</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">예측 유형별 성공률</h4>
                                        <div className="space-y-3">
                                            {[
                                                { type: '프로젝트 성공', success: 92, total: 100 },
                                                { type: '사용자 행동', success: 85, total: 95 },
                                                { type: '리소스 사용', success: 78, total: 85 },
                                                { type: '시장 트렌드', success: 88, total: 92 }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">{item.type}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-purple-600 h-2 rounded-full"
                                                                style={{ width: `${(item.success / item.total) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-12">{item.success}/{item.total}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">월별 예측 정확도</h4>
                                        <div className="space-y-3">
                                            {[
                                                { month: '1월', accuracy: 85 },
                                                { month: '2월', accuracy: 87 },
                                                { month: '3월', accuracy: 89 },
                                                { month: '4월', accuracy: 91 }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">{item.month}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full"
                                                                style={{ width: `${item.accuracy}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-8">{item.accuracy}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Prediction Detail Modal */}
            <AnimatePresence>
                {selectedPrediction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setSelectedPrediction(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">{selectedPrediction.title}</h2>
                                    <button
                                        onClick={() => setSelectedPrediction(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ArrowRight className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">설명</h3>
                                        <p className="text-gray-600">{selectedPrediction.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500">신뢰도</span>
                                            <div className="font-semibold text-lg">{selectedPrediction.confidence}%</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">확률</span>
                                            <div className="font-semibold text-lg">{(selectedPrediction.probability * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">주요 요인</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPrediction.factors.map((factor, index) => (
                                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedPrediction.recommendations.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">추천 사항</h3>
                                            <div className="space-y-3">
                                                {selectedPrediction.recommendations.map((recommendation) => (
                                                    <div key={recommendation.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                                                                {recommendation.priority === 'critical' ? '긴급' :
                                                                    recommendation.priority === 'high' ? '높음' :
                                                                        recommendation.priority === 'medium' ? '중간' : '낮음'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>ROI: {recommendation.roi}x</span>
                                                            <span>비용: ₩{recommendation.cost.toLocaleString()}</span>
                                                            <span>노력: {recommendation.effort === 'low' ? '낮음' :
                                                                recommendation.effort === 'medium' ? '중간' : '높음'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 pt-4 border-t">
                                        <button
                                            onClick={() => {
                                                onPredictionAction?.(selectedPrediction.id, 'accept');
                                                setSelectedPrediction(null);
                                            }}
                                            className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            예측 수락
                                        </button>
                                        <button
                                            onClick={() => {
                                                onPredictionAction?.(selectedPrediction.id, 'reject');
                                                setSelectedPrediction(null);
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            예측 거부
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIPredictionSystem;
