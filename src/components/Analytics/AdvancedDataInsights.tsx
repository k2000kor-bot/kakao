import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Users,
    FileText,
    MessageSquare,
    Calendar,
    Filter,
    Search,
    Download,
    RefreshCw,
    Settings,
    Eye,
    EyeOff,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    Zap,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Award,
    Trophy,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Activity as ActivityIcon,
    Target as TargetIcon,
    Users as UsersIcon,
    FileText as FileTextIcon,
    MessageSquare as MessageSquareIcon,
    Calendar as CalendarIcon,
    Filter as FilterIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    RefreshCw as RefreshCwIcon,
    Settings as SettingsIcon,
    Eye as EyeIcon,
    EyeOff as EyeOffIcon,
    MoreVertical as MoreVerticalIcon,
    ChevronDown as ChevronDownIcon,
    ChevronRight as ChevronRightIcon,
    Plus as PlusIcon,
    Minus as MinusIcon,
    Zap as ZapIcon,
    Lightbulb as LightbulbIcon,
    AlertTriangle as AlertTriangleIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon,
    Clock as ClockIcon,
    Star as StarIcon,
    Award as AwardIcon,
    Trophy as TrophyIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    change: number;
    changeType: 'increase' | 'decrease' | 'stable';
    trend: 'up' | 'down' | 'stable';
    target?: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    category: string;
    description: string;
    lastUpdated: Date;
}

interface Insight {
    id: string;
    title: string;
    description: string;
    type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    impact: number;
    confidence: number;
    createdAt: Date;
    isRead: boolean;
    actions: Array<{
        id: string;
        label: string;
        type: 'primary' | 'secondary';
        action: string;
    }>;
}

interface ChartData {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    description: string;
    data: any[];
    config: any;
    lastUpdated: Date;
}

interface AdvancedDataInsightsProps {
    onInsightAction?: (insightId: string, actionId: string) => void;
    onMetricUpdate?: (metricId: string, updates: Partial<DataMetric>) => void;
    onChartExport?: (chartId: string, format: string) => void;
    onFilterChange?: (filters: any) => void;
}

const AdvancedDataInsights: React.FC<AdvancedDataInsightsProps> = ({
    onInsightAction,
    onMetricUpdate,
    onChartExport,
    onFilterChange
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'insights' | 'charts' | 'reports'>('overview');
    const [selectedMetric, setSelectedMetric] = useState<DataMetric | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
    const [timeRange, setTimeRange] = useState<string>('7d');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // 데이터 메트릭 시뮬레이션
    const [metrics, setMetrics] = useState<DataMetric[]>([
        {
            id: '1',
            name: '활성 사용자',
            value: 1247,
            unit: '명',
            change: 12.5,
            changeType: 'increase',
            trend: 'up',
            target: 1500,
            status: 'good',
            category: '사용자',
            description: '지난 7일간 활성 사용자 수',
            lastUpdated: new Date()
        },
        {
            id: '2',
            name: '프로젝트 완료율',
            value: 87.3,
            unit: '%',
            change: -2.1,
            changeType: 'decrease',
            trend: 'down',
            target: 90,
            status: 'warning',
            category: '프로젝트',
            description: '완료된 프로젝트 비율',
            lastUpdated: new Date()
        },
        {
            id: '3',
            name: '평균 응답 시간',
            value: 1.2,
            unit: '초',
            change: -15.3,
            changeType: 'decrease',
            trend: 'up',
            target: 1.0,
            status: 'excellent',
            category: '성능',
            description: 'AI 응답 평균 시간',
            lastUpdated: new Date()
        },
        {
            id: '4',
            name: '사용자 만족도',
            value: 4.6,
            unit: '/5',
            change: 0.2,
            changeType: 'increase',
            trend: 'up',
            target: 4.5,
            status: 'excellent',
            category: '만족도',
            description: '사용자 만족도 평점',
            lastUpdated: new Date()
        },
        {
            id: '5',
            name: '시스템 가동률',
            value: 99.8,
            unit: '%',
            change: 0.1,
            changeType: 'increase',
            trend: 'up',
            target: 99.9,
            status: 'excellent',
            category: '시스템',
            description: '시스템 가동률',
            lastUpdated: new Date()
        },
        {
            id: '6',
            name: '데이터 처리량',
            value: 2.4,
            unit: 'TB',
            change: 8.7,
            changeType: 'increase',
            trend: 'up',
            target: 3.0,
            status: 'good',
            category: '데이터',
            description: '일일 데이터 처리량',
            lastUpdated: new Date()
        }
    ]);

    const [insights, setInsights] = useState<Insight[]>([
        {
            id: '1',
            title: '사용자 참여도 증가 추세',
            description: '최근 30일간 사용자 참여도가 15% 증가했습니다. 이는 새로운 기능 도입과 개선된 사용자 경험의 결과로 보입니다.',
            type: 'trend',
            severity: 'low',
            category: '사용자',
            impact: 75,
            confidence: 92,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false,
            actions: [
                { id: '1', label: '상세 분석', type: 'primary', action: 'analyze' },
                { id: '2', label: '보고서 생성', type: 'secondary', action: 'report' }
            ]
        },
        {
            id: '2',
            title: '프로젝트 완료율 감소 경고',
            description: '프로젝트 완료율이 목표치 대비 2.7% 감소했습니다. 팀 리소스 배분과 일정 관리에 주의가 필요합니다.',
            type: 'risk',
            severity: 'medium',
            category: '프로젝트',
            impact: 60,
            confidence: 85,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            isRead: true,
            actions: [
                { id: '1', label: '원인 분석', type: 'primary', action: 'investigate' },
                { id: '2', label: '개선 계획', type: 'secondary', action: 'plan' }
            ]
        },
        {
            id: '3',
            title: 'AI 성능 최적화 기회',
            description: 'AI 모델 응답 시간이 목표치보다 20% 빠릅니다. 추가 최적화를 통해 더 나은 성능을 달성할 수 있습니다.',
            type: 'opportunity',
            severity: 'low',
            category: '성능',
            impact: 45,
            confidence: 78,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            isRead: false,
            actions: [
                { id: '1', label: '최적화 실행', type: 'primary', action: 'optimize' },
                { id: '2', label: '성능 테스트', type: 'secondary', action: 'test' }
            ]
        }
    ]);

    const [charts, setCharts] = useState<ChartData[]>([
        {
            id: '1',
            type: 'line',
            title: '사용자 활동 추이',
            description: '일별 사용자 활동 패턴',
            data: [
                { date: '2024-01-01', active: 1200, new: 150, returning: 1050 },
                { date: '2024-01-02', active: 1250, new: 180, returning: 1070 },
                { date: '2024-01-03', active: 1180, new: 120, returning: 1060 },
                { date: '2024-01-04', active: 1320, new: 200, returning: 1120 },
                { date: '2024-01-05', active: 1400, new: 220, returning: 1180 },
                { date: '2024-01-06', active: 1350, new: 190, returning: 1160 },
                { date: '2024-01-07', active: 1247, new: 170, returning: 1077 }
            ],
            config: { xAxis: 'date', yAxis: 'users', series: ['active', 'new', 'returning'] },
            lastUpdated: new Date()
        },
        {
            id: '2',
            type: 'bar',
            title: '프로젝트 카테고리별 분포',
            description: '프로젝트 유형별 분포 현황',
            data: [
                { category: '웹 개발', count: 45, percentage: 30 },
                { category: '모바일 앱', count: 32, percentage: 21 },
                { category: '데이터 분석', count: 28, percentage: 19 },
                { category: 'AI/ML', count: 25, percentage: 17 },
                { category: '기타', count: 18, percentage: 13 }
            ],
            config: { xAxis: 'category', yAxis: 'count', series: ['count'] },
            lastUpdated: new Date()
        }
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent': return <Trophy className="h-4 w-4" />;
            case 'good': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'critical': return <XCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getInsightTypeColor = (type: string) => {
        switch (type) {
            case 'opportunity': return 'text-green-600 bg-green-100';
            case 'risk': return 'text-red-600 bg-red-100';
            case 'trend': return 'text-blue-600 bg-blue-100';
            case 'anomaly': return 'text-orange-600 bg-orange-100';
            case 'recommendation': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getInsightTypeIcon = (type: string) => {
        switch (type) {
            case 'opportunity': return <TrendingUp className="h-4 w-4" />;
            case 'risk': return <AlertTriangle className="h-4 w-4" />;
            case 'trend': return <Activity className="h-4 w-4" />;
            case 'anomaly': return <Zap className="h-4 w-4" />;
            case 'recommendation': return <Lightbulb className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const tabs = [
        { id: 'overview', name: '개요', icon: BarChart3 },
        { id: 'metrics', name: '메트릭', icon: Target },
        { id: 'insights', name: '인사이트', icon: Lightbulb },
        { id: 'charts', name: '차트', icon: LineChart },
        { id: 'reports', name: '보고서', icon: FileText }
    ];

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">고급 데이터 분석</h2>
                    <p className="text-gray-600 mt-1">데이터 기반 인사이트로 의사결정을 지원합니다</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="1d">오늘</option>
                        <option value="7d">7일</option>
                        <option value="30d">30일</option>
                        <option value="90d">90일</option>
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="h-4 w-4" />
                        <span>필터</span>
                    </button>
                    <button
                        onClick={() => {/* 데이터 새로고침 */ }}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>새로고침</span>
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 탭 내용 */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 주요 메트릭 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {metrics.slice(0, 6).map((metric) => (
                                <motion.div
                                    key={metric.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(metric.status)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                                                {metric.category}
                                            </span>
                                        </div>
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                        <div className="flex items-end space-x-2 mt-2">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatNumber(metric.value)}
                                            </p>
                                            <p className="text-sm text-gray-500">{metric.unit}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <span className={`text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-600' :
                                                metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                                            </span>
                                            {metric.changeType === 'increase' ? (
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            ) : metric.changeType === 'decrease' ? (
                                                <TrendingDown className="h-4 w-4 text-red-600" />
                                            ) : (
                                                <Activity className="h-4 w-4 text-gray-600" />
                                            )}
                                        </div>
                                        {metric.target && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>목표: {metric.target}{metric.unit}</span>
                                                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${metric.value >= metric.target ? 'bg-green-600' :
                                                            metric.value >= metric.target * 0.8 ? 'bg-yellow-600' : 'bg-red-600'
                                                            }`}
                                                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* 최신 인사이트 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">최신 인사이트</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {insights.slice(0, 3).map((insight) => (
                                    <div key={insight.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg ${getInsightTypeColor(insight.type)}`}>
                                                    {getInsightTypeIcon(insight.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInsightTypeColor(insight.type)}`}>
                                                            {insight.type === 'opportunity' ? '기회' :
                                                                insight.type === 'risk' ? '위험' :
                                                                    insight.type === 'trend' ? '트렌드' :
                                                                        insight.type === 'anomaly' ? '이상' : '권장사항'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            영향도: {insight.impact}% • 신뢰도: {insight.confidence}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {insight.actions.map((action) => (
                                                    <button
                                                        key={action.id}
                                                        onClick={() => onInsightAction?.(insight.id, action.id)}
                                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${action.type === 'primary'
                                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'metrics' && (
                    <motion.div
                        key="metrics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">상세 메트릭</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {metrics.map((metric) => (
                                    <div key={metric.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Target className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                                                    <p className="text-sm text-gray-600">{metric.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        마지막 업데이트: {formatDate(metric.lastUpdated)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {formatNumber(metric.value)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{metric.unit}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                                                        {metric.status === 'excellent' ? '우수' :
                                                            metric.status === 'good' ? '양호' :
                                                                metric.status === 'warning' ? '경고' : '위험'}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedMetric(metric)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="상세 보기"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">AI 인사이트</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {insights.map((insight) => (
                                    <div key={insight.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className={`p-3 rounded-lg ${getInsightTypeColor(insight.type)}`}>
                                                    {getInsightTypeIcon(insight.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                        {!insight.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInsightTypeColor(insight.type)}`}>
                                                            {insight.type === 'opportunity' ? '기회' :
                                                                insight.type === 'risk' ? '위험' :
                                                                    insight.type === 'trend' ? '트렌드' :
                                                                        insight.type === 'anomaly' ? '이상' : '권장사항'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            영향도: {insight.impact}%
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            신뢰도: {insight.confidence}%
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(insight.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                {insight.actions.map((action) => (
                                                    <button
                                                        key={action.id}
                                                        onClick={() => onInsightAction?.(insight.id, action.id)}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${action.type === 'primary'
                                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'charts' && (
                    <motion.div
                        key="charts"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {charts.map((chart) => (
                                <div key={chart.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                                                <p className="text-sm text-gray-600">{chart.description}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onChartExport?.(chart.id, 'png')}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="PNG 내보내기"
                                                >
                                                    <Download className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => onChartExport?.(chart.id, 'csv')}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="CSV 내보내기"
                                                >
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">차트 시각화</p>
                                                <p className="text-sm text-gray-400">
                                                    {chart.data.length}개 데이터 포인트
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedDataInsights;
