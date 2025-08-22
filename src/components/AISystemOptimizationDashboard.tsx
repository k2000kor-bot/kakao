import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Zap,
    TrendingUp,
    TrendingDown,
    Activity,
    Shield,
    Users,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Eye,
    Download,
    RefreshCw,
    Filter,
    Search,
    BarChart3,
    LineChart,
    PieChart,
    Gauge,
    Thermometer,
    Battery,
    Signal,
    Globe,
    Lock,
    Unlock,
    Key,
    FileText,
    Folder,
    MessageSquare,
    Database,
    Server,
    Cpu,
    HardDrive,
    Wifi,
    Settings,
    Play,
    Pause,
    Square,
    Plus,
    Edit,
    Trash2,
    Copy,
    ExternalLink,
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Star,
    Heart,
    Share2,
    Target,
    Award,
    Lightbulb,
    Rocket,
    Cog,
    Wrench,
    Wrench as Tool,
    Sparkles
} from 'lucide-react';
import aiSystemOptimizationEngine, {
    SystemMetrics,
    SystemHealthScore,
    OptimizationRecommendation,
    PredictiveAnalysis,
    AutoOptimizationAction
} from '../services/aiSystemOptimizationEngine';
import { Project, Chat, Message } from '../types/project';

interface AISystemOptimizationDashboardProps {
    projects: Project[];
    chats: Chat[];
    messages: Message[];
    onOptimizationAction?: (action: string, data: any) => void;
}

const AISystemOptimizationDashboard: React.FC<AISystemOptimizationDashboardProps> = ({
    projects,
    chats,
    messages,
    onOptimizationAction
}) => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [healthScore, setHealthScore] = useState<SystemHealthScore | null>(null);
    const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
    const [predictions, setPredictions] = useState<PredictiveAnalysis[]>([]);
    const [autoActions, setAutoActions] = useState<AutoOptimizationAction[]>([]);
    const [optimizationReport, setOptimizationReport] = useState<any>(null);
    const [learningPatterns, setLearningPatterns] = useState<any[]>([]);
    const [adaptiveModels, setAdaptiveModels] = useState<any[]>([]);
    const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
    const [learningReport, setLearningReport] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isRetraining, setIsRetraining] = useState(false);
    const [selectedView, setSelectedView] = useState<'overview' | 'recommendations' | 'predictions' | 'actions' | 'analytics' | 'learning'>('overview');
    const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);

    // 시스템 분석 실행
    const runSystemAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // 시스템 메트릭 수집
            const systemMetrics = aiSystemOptimizationEngine.collectSystemMetrics(projects, chats, messages);
            setMetrics(systemMetrics);

            // 시스템 건강도 분석
            const health = aiSystemOptimizationEngine.analyzeSystemHealth(systemMetrics);
            setHealthScore(health);

            // 최적화 권장사항 생성
            const recs = aiSystemOptimizationEngine.generateOptimizationRecommendations(systemMetrics, health);
            setRecommendations(recs);

            // 예측 분석 생성
            const preds = aiSystemOptimizationEngine.generatePredictiveAnalysis(systemMetrics, health);
            setPredictions(preds);

            // 최적화 리포트 생성
            const report = aiSystemOptimizationEngine.generateOptimizationReport(systemMetrics, health);
            setOptimizationReport(report);

            // 자동 액션 이력 조회
            const actions = aiSystemOptimizationEngine.getAutoActionHistory();
            setAutoActions(actions);

            // 적응형 학습 데이터 수집
            const patterns = aiSystemOptimizationEngine.learnUserBehavior(projects, chats, messages);
            setLearningPatterns(patterns);

            const models = aiSystemOptimizationEngine.getAdaptiveModels();
            setAdaptiveModels(models);

            const insights = aiSystemOptimizationEngine.getPredictiveInsights();
            setPredictiveInsights(insights);

            const learningReport = aiSystemOptimizationEngine.generateLearningReport();
            setLearningReport(learningReport);

        } catch (error) {
            console.error('시스템 분석 중 오류 발생:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 자동 최적화 실행
    const executeAutoOptimization = async () => {
        if (!recommendations.length) return;

        setIsOptimizing(true);
        try {
            const actions = await aiSystemOptimizationEngine.executeAutoOptimization(recommendations);
            setAutoActions(prev => [...prev, ...actions]);

            // 분석 재실행
            await runSystemAnalysis();

            onOptimizationAction?.('auto_optimization_completed', { actions });
        } catch (error) {
            console.error('자동 최적화 실행 중 오류 발생:', error);
        } finally {
            setIsOptimizing(false);
        }
    };

    // 모델 재훈련 실행
    const executeModelRetraining = async () => {
        setIsRetraining(true);
        try {
            const updatedModels = aiSystemOptimizationEngine.retrainModels();
            setAdaptiveModels(updatedModels);

            // 학습 리포트 업데이트
            const retrainingReport = aiSystemOptimizationEngine.generateLearningReport();
            setLearningReport(retrainingReport);

            onOptimizationAction?.('model_retraining_completed', { models: updatedModels });
        } catch (error) {
            console.error('모델 재훈련 중 오류 발생:', error);
        } finally {
            setIsRetraining(false);
        }
    };

    // 초기 분석 실행
    useEffect(() => {
        runSystemAnalysis();
    }, [projects, chats, messages]);

    // 자동 새로고침
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            runSystemAnalysis();
        }, refreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, projects, chats, messages]);

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 70) return 'text-blue-600 bg-blue-100';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getHealthStatus = (score: number) => {
        if (score >= 90) return '우수';
        if (score >= 70) return '양호';
        if (score >= 50) return '보통';
        return '주의';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-blue-600" />;
        }
    };

    const getActionStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'running': return 'text-blue-600 bg-blue-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (!metrics || !healthScore) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">시스템 분석 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg">
                        <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI 시스템 최적화</h2>
                        <p className="text-sm text-gray-600">실시간 시스템 분석 및 자동 최적화</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={runSystemAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? '분석 중...' : '새로고침'}
                    </button>
                    <button
                        onClick={executeAutoOptimization}
                        disabled={isOptimizing || !recommendations.filter(r => r.autoImplementable).length}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        {isOptimizing ? '최적화 중...' : '자동 최적화'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: '개요', icon: Brain },
                            { id: 'recommendations', name: '권장사항', icon: Lightbulb },
                            { id: 'predictions', name: '예측 분석', icon: TrendingUp },
                            { id: 'actions', name: '자동 액션', icon: Zap },
                            { id: 'analytics', name: '분석', icon: BarChart3 },
                            { id: 'learning', name: '적응형 학습', icon: Sparkles }
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
                                {/* System Health Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">시스템 건강도</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthScore.overall)}`}>
                                                {getHealthStatus(healthScore.overall)}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">전체 점수</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-bold text-gray-900">{Math.round(healthScore.overall)}</span>
                                                    <span className="text-sm text-gray-500">/ 100</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { label: '성능', score: healthScore.performance, trend: healthScore.trends.performance },
                                                    { label: '보안', score: healthScore.security, trend: healthScore.trends.security },
                                                    { label: '사용자 경험', score: healthScore.userExperience, trend: healthScore.trends.userExperience },
                                                    { label: '리소스 효율성', score: healthScore.resourceEfficiency, trend: healthScore.trends.resourceEfficiency },
                                                    { label: '워크플로우 최적화', score: healthScore.workflowOptimization, trend: healthScore.trends.workflowOptimization }
                                                ].map((item) => (
                                                    <div key={item.label} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-600">{item.label}</span>
                                                            {getTrendIcon(item.trend)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{Math.round(item.score)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">실시간 메트릭</h3>
                                            <span className="text-sm text-gray-500">{new Date().toLocaleTimeString('ko-KR')}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.cpuUsage)}%</div>
                                                    <div className="text-sm text-gray-600">CPU 사용률</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.memoryUsage)}%</div>
                                                    <div className="text-sm text-gray-600">메모리 사용률</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.responseTime)}ms</div>
                                                    <div className="text-sm text-gray-600">응답 시간</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.errorRate)}%</div>
                                                    <div className="text-sm text-gray-600">오류율</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <Lightbulb className="w-8 h-8" />
                                            <span className="text-2xl font-bold">{recommendations.length}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">최적화 권장사항</h3>
                                        <p className="text-blue-100 mb-4">시스템 성능 향상을 위한 AI 권장사항</p>
                                        <button
                                            onClick={() => setSelectedView('recommendations')}
                                            className="flex items-center text-sm font-medium hover:text-blue-200"
                                        >
                                            자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <TrendingUp className="w-8 h-8" />
                                            <span className="text-2xl font-bold">{predictions.length}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">예측 분석</h3>
                                        <p className="text-purple-100 mb-4">AI 기반 시스템 동향 예측</p>
                                        <button
                                            onClick={() => setSelectedView('predictions')}
                                            className="flex items-center text-sm font-medium hover:text-purple-200"
                                        >
                                            자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <Zap className="w-8 h-8" />
                                            <span className="text-2xl font-bold">{autoActions.filter(a => a.status === 'completed').length}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">자동 최적화</h3>
                                        <p className="text-green-100 mb-4">완료된 자동 최적화 액션</p>
                                        <button
                                            onClick={() => setSelectedView('actions')}
                                            className="flex items-center text-sm font-medium hover:text-green-200"
                                        >
                                            자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            활동
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            상태
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            시간
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {autoActions.slice(-5).reverse().map((action) => (
                                                        <tr key={action.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <Zap className="w-4 h-4 text-blue-600 mr-2" />
                                                                    <span className="text-sm font-medium text-gray-900">{action.description}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionStatusColor(action.status)}`}>
                                                                    {action.status === 'completed' ? '완료' :
                                                                        action.status === 'running' ? '실행 중' :
                                                                            action.status === 'failed' ? '실패' : '대기'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {action.completedAt ?
                                                                    action.completedAt.toLocaleTimeString('ko-KR') :
                                                                    action.startedAt?.toLocaleTimeString('ko-KR') || '-'
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'recommendations' && (
                            <motion.div
                                key="recommendations"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">최적화 권장사항</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">총 {recommendations.length}개</span>
                                        <span className="text-sm text-green-600">
                                            자동 실행 가능: {recommendations.filter(r => r.autoImplementable).length}개
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {recommendations.map((recommendation) => (
                                        <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-900">{recommendation.title}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                                                            {recommendation.priority === 'critical' ? '긴급' :
                                                                recommendation.priority === 'high' ? '높음' :
                                                                    recommendation.priority === 'medium' ? '보통' : '낮음'}
                                                        </span>
                                                        {recommendation.autoImplementable && (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                                                자동 실행 가능
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>영향도: <span className={getImpactColor(recommendation.impact)}>{recommendation.impact}</span></span>
                                                        <span>예상 개선: {recommendation.estimatedSavings}%</span>
                                                        <span>작업량: {recommendation.effort}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {recommendation.autoImplementable && (
                                                        <button
                                                            onClick={() => executeAutoOptimization()}
                                                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                        >
                                                            자동 실행
                                                        </button>
                                                    )}
                                                    <button className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                                                        자세히 보기
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <h5 className="text-sm font-medium text-gray-900 mb-2">구현 단계</h5>
                                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                                    {recommendation.implementationSteps.map((step, index) => (
                                                        <li key={index}>{step}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'predictions' && (
                            <motion.div
                                key="predictions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">예측 분석</h3>
                                    <span className="text-sm text-gray-600">총 {predictions.length}개</span>
                                </div>

                                <div className="space-y-4">
                                    {predictions.map((prediction) => (
                                        <div key={prediction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                                        <h4 className="text-lg font-semibold text-gray-900">{prediction.prediction}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)} bg-gray-100`}>
                                                            {prediction.impact === 'critical' ? '긴급' :
                                                                prediction.impact === 'high' ? '높음' :
                                                                    prediction.impact === 'medium' ? '보통' : '낮음'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                                        <span>신뢰도: {Math.round(prediction.confidence * 100)}%</span>
                                                        <span>확률: {Math.round(prediction.probability * 100)}%</span>
                                                        <span>기간: {prediction.timeframe === 'short_term' ? '단기' :
                                                            prediction.timeframe === 'medium_term' ? '중기' : '장기'}</span>
                                                        <span>데이터 포인트: {prediction.dataPoints}개</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <h5 className="text-sm font-medium text-gray-900 mb-2">권장 조치</h5>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                                    {prediction.recommendedActions.map((action, index) => (
                                                        <li key={index}>{action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'actions' && (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">자동 최적화 액션</h3>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">
                                            완료: {autoActions.filter(a => a.status === 'completed').length}개
                                        </span>
                                        <span className="text-sm text-red-600">
                                            실패: {autoActions.filter(a => a.status === 'failed').length}개
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        액션
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        타입
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        상태
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        예상 영향
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        실행 시간
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {autoActions.map((action) => (
                                                    <tr key={action.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                                                                <span className="text-sm font-medium text-gray-900">{action.description}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-900">{action.type}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionStatusColor(action.status)}`}>
                                                                {action.status === 'completed' ? '완료' :
                                                                    action.status === 'running' ? '실행 중' :
                                                                        action.status === 'failed' ? '실패' : '대기'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-900">{Math.round(action.estimatedImpact)}%</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {action.completedAt ?
                                                                action.completedAt.toLocaleString('ko-KR') :
                                                                action.startedAt?.toLocaleString('ko-KR') || '-'
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'analytics' && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-12">
                                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">고급 분석</h3>
                                    <p className="text-gray-600">시스템 성능 트렌드 및 상세 분석이 곧 추가됩니다.</p>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'learning' && (
                            <motion.div
                                key="learning"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Learning Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">적응형 학습 개요</h3>
                                            <button
                                                onClick={executeModelRetraining}
                                                disabled={isRetraining}
                                                className="flex items-center px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                <RefreshCw className={`w-4 h-4 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
                                                {isRetraining ? '재훈련 중...' : '모델 재훈련'}
                                            </button>
                                        </div>
                                        {learningReport && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-900">{learningReport.summary.totalPatterns}</div>
                                                        <div className="text-sm text-gray-600">학습 패턴</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-900">{learningReport.summary.totalOptimizations}</div>
                                                        <div className="text-sm text-gray-600">최적화 결과</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-900">{learningReport.summary.totalInsights}</div>
                                                        <div className="text-sm text-gray-600">예측 인사이트</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-900">{(learningReport.summary.avgModelAccuracy * 100).toFixed(1)}%</div>
                                                        <div className="text-sm text-gray-600">평균 정확도</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    모델 버전: {learningReport.summary.modelVersion}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">적응형 모델</h3>
                                        <div className="space-y-3">
                                            {adaptiveModels.map((model) => (
                                                <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{model.name}</div>
                                                        <div className="text-sm text-gray-600">v{model.version} • {(model.accuracy * 100).toFixed(1)}% 정확도</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">{model.modelType}</div>
                                                        <div className="text-xs text-gray-500">{model.trainingDataSize} 데이터</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Learning Patterns */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 패턴</h3>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            패턴
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            카테고리
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            빈도
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            신뢰도
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            마지막 관찰
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {learningPatterns.map((pattern) => (
                                                        <tr key={pattern.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm font-medium text-gray-900">{pattern.pattern}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-900">{pattern.category}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-900">{pattern.frequency.toFixed(2)}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-900">{(pattern.confidence * 100).toFixed(1)}%</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {pattern.lastObserved.toLocaleDateString('ko-KR')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Predictive Insights */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">예측 인사이트</h3>
                                    <div className="space-y-4">
                                        {predictiveInsights.map((insight) => (
                                            <div key={insight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <Sparkles className="w-5 h-5 text-purple-600" />
                                                            <h4 className="text-lg font-semibold text-gray-900">{insight.insight}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.category)} bg-gray-100`}>
                                                                {insight.category}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                                            <span>신뢰도: {(insight.confidence * 100).toFixed(1)}%</span>
                                                            <span>기간: {insight.timeframe === 'short_term' ? '단기' :
                                                                insight.timeframe === 'medium_term' ? '중기' : '장기'}</span>
                                                            <span>데이터: {insight.dataPoints}개</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4">
                                                    <h5 className="text-sm font-medium text-gray-900 mb-2">권장 조치</h5>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                                        {insight.recommendations.map((rec: string, index: number) => (
                                                            <li key={index}>{rec}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Learning Recommendations */}
                                {learningReport && learningReport.recommendations && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 권장사항</h3>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <ul className="space-y-2">
                                                {learningReport.recommendations.map((rec: string, index: number) => (
                                                    <li key={index} className="flex items-start">
                                                        <Lightbulb className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AISystemOptimizationDashboard;
