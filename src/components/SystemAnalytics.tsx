import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    MessageSquare,
    Folder,
    Clock,
    Calendar,
    Target,
    Award,
    AlertTriangle,
    CheckCircle,
    Info,
    Eye,
    Download,
    RefreshCw,
    Filter,
    Search,
    PieChart,
    LineChart,
    BarChart,
    Scatter,
    Zap,
    Brain,
    Lightbulb,
    Star,
    Heart,
    Share2,
    Copy,
    ExternalLink
} from 'lucide-react';

interface AnalyticsMetric {
    id: string;
    name: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'stable';
    unit: string;
    trend: number[];
    target?: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface AnalyticsInsight {
    id: string;
    type: 'performance' | 'usage' | 'trend' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    action?: string;
    priority: 'high' | 'medium' | 'low';
}

interface SystemAnalyticsProps {
    projects: any[];
    chats: any[];
    messages: any[];
    onInsightAction?: (insight: AnalyticsInsight) => void;
}

const SystemAnalytics: React.FC<SystemAnalyticsProps> = ({
    projects,
    chats,
    messages,
    onInsightAction
}) => {
    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'usage' | 'trends'>('overview');
    const [isLoading, setIsLoading] = useState(false);

    // Mock 데이터 생성
    useEffect(() => {
        generateAnalyticsData();
    }, [projects, chats, messages, selectedPeriod]);

    const generateAnalyticsData = () => {
        setIsLoading(true);

        // 시뮬레이션된 데이터 생성
        setTimeout(() => {
            const mockMetrics: AnalyticsMetric[] = [
                {
                    id: 'total_projects',
                    name: '총 프로젝트',
                    value: projects.length,
                    change: 12.5,
                    changeType: 'increase',
                    unit: '개',
                    trend: [45, 52, 48, 61, 58, 67, 72],
                    status: 'excellent'
                },
                {
                    id: 'active_users',
                    name: '활성 사용자',
                    value: 156,
                    change: -3.2,
                    changeType: 'decrease',
                    unit: '명',
                    trend: [142, 148, 155, 162, 158, 151, 156],
                    target: 200,
                    status: 'good'
                },
                {
                    id: 'message_volume',
                    name: '메시지 볼륨',
                    value: messages.length,
                    change: 25.8,
                    changeType: 'increase',
                    unit: '개',
                    trend: [1200, 1350, 1420, 1580, 1720, 1890, 2100],
                    status: 'excellent'
                },
                {
                    id: 'response_time',
                    name: '평균 응답 시간',
                    value: 2.3,
                    change: -15.2,
                    changeType: 'decrease',
                    unit: '초',
                    trend: [3.2, 2.9, 2.7, 2.5, 2.4, 2.3, 2.3],
                    target: 2.0,
                    status: 'good'
                },
                {
                    id: 'system_uptime',
                    name: '시스템 가동률',
                    value: 99.8,
                    change: 0.1,
                    changeType: 'increase',
                    unit: '%',
                    trend: [99.5, 99.6, 99.7, 99.8, 99.8, 99.9, 99.8],
                    target: 99.9,
                    status: 'excellent'
                },
                {
                    id: 'error_rate',
                    name: '오류율',
                    value: 0.2,
                    change: -25.0,
                    changeType: 'decrease',
                    unit: '%',
                    trend: [0.4, 0.35, 0.3, 0.25, 0.22, 0.2, 0.2],
                    target: 0.1,
                    status: 'good'
                }
            ];

            const mockInsights: AnalyticsInsight[] = [
                {
                    id: '1',
                    type: 'performance',
                    title: '시스템 성능 최적화 기회',
                    description: '메시지 처리량이 25% 증가했지만 응답 시간은 개선되었습니다. 추가 최적화로 더 나은 성능을 달성할 수 있습니다.',
                    impact: 'high',
                    confidence: 0.85,
                    action: '성능 최적화 실행',
                    priority: 'medium'
                },
                {
                    id: '2',
                    type: 'usage',
                    title: '사용자 참여도 증가',
                    description: '프로젝트 생성률이 지속적으로 증가하고 있습니다. 새로운 기능 도입을 고려해보세요.',
                    impact: 'medium',
                    confidence: 0.92,
                    action: '새 기능 계획',
                    priority: 'low'
                },
                {
                    id: '3',
                    type: 'trend',
                    title: '오류율 감소 추세',
                    description: '시스템 오류율이 지난 30일간 25% 감소했습니다. 안정성이 크게 향상되었습니다.',
                    impact: 'high',
                    confidence: 0.78,
                    action: '안정성 보고서 생성',
                    priority: 'low'
                },
                {
                    id: '4',
                    type: 'recommendation',
                    title: '사용자 확장 권장',
                    description: '시스템 가동률이 99.8%로 안정적입니다. 더 많은 사용자를 수용할 준비가 되었습니다.',
                    impact: 'medium',
                    confidence: 0.88,
                    action: '사용자 제한 해제',
                    priority: 'medium'
                }
            ];

            setMetrics(mockMetrics);
            setInsights(mockInsights);
            setIsLoading(false);
        }, 1000);
    };

    const getChangeColor = (changeType: string) => {
        switch (changeType) {
            case 'increase': return 'text-green-600';
            case 'decrease': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const formatChange = (change: number) => {
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">시스템 분석</h2>
                        <p className="text-sm text-gray-600">종합적인 시스템 성능 및 사용 현황 분석</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                        <option value="90d">최근 90일</option>
                        <option value="1y">최근 1년</option>
                    </select>
                    <button
                        onClick={generateAnalyticsData}
                        disabled={isLoading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        새로고침
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: '개요', icon: BarChart3 },
                            { id: 'performance', name: '성능', icon: Zap },
                            { id: 'usage', name: '사용 현황', icon: Users },
                            { id: 'trends', name: '트렌드', icon: TrendingUp }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedView(tab.id as any)}
                                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${selectedView === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {selectedView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Key Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {metrics.map((metric) => (
                                        <div key={metric.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                                                    {metric.status === 'excellent' ? '우수' :
                                                        metric.status === 'good' ? '양호' :
                                                            metric.status === 'warning' ? '주의' : '위험'}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="text-3xl font-bold text-gray-900">
                                                        {metric.value.toLocaleString()}
                                                        <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
                                                    </div>
                                                    <div className={`flex items-center mt-2 text-sm ${getChangeColor(metric.changeType)}`}>
                                                        {metric.changeType === 'increase' ? (
                                                            <TrendingUp className="w-4 h-4 mr-1" />
                                                        ) : metric.changeType === 'decrease' ? (
                                                            <TrendingDown className="w-4 h-4 mr-1" />
                                                        ) : (
                                                            <Activity className="w-4 h-4 mr-1" />
                                                        )}
                                                        {formatChange(metric.change)}
                                                    </div>
                                                </div>
                                                {metric.target && (
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">목표</div>
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {metric.target.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Insights */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 인사이트</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {insights.map((insight) => (
                                            <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Lightbulb className="w-5 h-5 text-blue-600" />
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                                                            {insight.impact === 'high' ? '높음' :
                                                                insight.impact === 'medium' ? '보통' : '낮음'}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                                        {insight.priority === 'high' ? '높음' :
                                                            insight.priority === 'medium' ? '보통' : '낮음'}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">
                                                        신뢰도: {Math.round(insight.confidence * 100)}%
                                                    </div>
                                                    {insight.action && (
                                                        <button
                                                            onClick={() => onInsightAction?.(insight)}
                                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                        >
                                                            {insight.action}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'performance' && (
                            <motion.div
                                key="performance"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-12">
                                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">성능 분석</h3>
                                    <p className="text-gray-600">상세한 성능 분석 차트가 곧 추가됩니다.</p>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'usage' && (
                            <motion.div
                                key="usage"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">사용 현황 분석</h3>
                                    <p className="text-gray-600">사용자 행동 및 패턴 분석이 곧 추가됩니다.</p>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'trends' && (
                            <motion.div
                                key="trends"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-12">
                                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">트렌드 분석</h3>
                                    <p className="text-gray-600">시계열 데이터 및 트렌드 분석이 곧 추가됩니다.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SystemAnalytics;
