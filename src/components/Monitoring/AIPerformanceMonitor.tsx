import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Cpu,
    HardDrive,
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Settings,
    BarChart3,
    LineChart,
    Gauge,
    Thermometer,
    Network,
    Database,
    Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
    cpu: {
        usage: number;
        temperature: number;
        cores: number;
        load: number[];
    };
    memory: {
        total: number;
        used: number;
        available: number;
        swap: number;
    };
    responseTime: {
        average: number;
        p95: number;
        p99: number;
        trend: 'improving' | 'stable' | 'declining';
    };
    throughput: {
        requestsPerSecond: number;
        totalRequests: number;
        successRate: number;
        errorRate: number;
    };
    aiModels: {
        active: number;
        total: number;
        accuracy: number;
        latency: number;
    };
    system: {
        uptime: number;
        health: 'excellent' | 'good' | 'warning' | 'critical';
        lastUpdate: Date;
    };
}

interface AIModel {
    id: string;
    name: string;
    type: 'gpt-4' | 'gpt-3.5' | 'claude' | 'gemini' | 'custom';
    status: 'active' | 'inactive' | 'training' | 'error';
    accuracy: number;
    latency: number;
    requests: number;
    errors: number;
    lastUsed: Date;
}

interface PerformanceAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
}

interface AIPerformanceMonitorProps {
    onOptimize?: () => void;
    onAlert?: (alert: PerformanceAlert) => void;
    onModelUpdate?: (modelId: string, updates: Partial<AIModel>) => void;
}

const AIPerformanceMonitor: React.FC<AIPerformanceMonitorProps> = ({
    onOptimize,
    onAlert,
    onModelUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'alerts' | 'optimization'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 성능 메트릭 시뮬레이션
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        cpu: {
            usage: 65,
            temperature: 72,
            cores: 8,
            load: [0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.5]
        },
        memory: {
            total: 16384,
            used: 8192,
            available: 8192,
            swap: 2048
        },
        responseTime: {
            average: 1200,
            p95: 2500,
            p99: 3500,
            trend: 'stable'
        },
        throughput: {
            requestsPerSecond: 150,
            totalRequests: 1250000,
            successRate: 98.5,
            errorRate: 1.5
        },
        aiModels: {
            active: 4,
            total: 6,
            accuracy: 94.2,
            latency: 850
        },
        system: {
            uptime: 86400,
            health: 'good',
            lastUpdate: new Date()
        }
    });

    const [aiModels, setAiModels] = useState<AIModel[]>([
        {
            id: '1',
            name: 'GPT-4 Turbo',
            type: 'gpt-4',
            status: 'active',
            accuracy: 96.8,
            latency: 1200,
            requests: 45000,
            errors: 23,
            lastUsed: new Date()
        },
        {
            id: '2',
            name: 'Claude-3 Sonnet',
            type: 'claude',
            status: 'active',
            accuracy: 95.2,
            latency: 980,
            requests: 32000,
            errors: 15,
            lastUsed: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
            id: '3',
            name: 'Gemini Pro',
            type: 'gemini',
            status: 'active',
            accuracy: 93.5,
            latency: 750,
            requests: 28000,
            errors: 42,
            lastUsed: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
            id: '4',
            name: 'Custom Model v2.1',
            type: 'custom',
            status: 'training',
            accuracy: 91.8,
            latency: 650,
            requests: 15000,
            errors: 8,
            lastUsed: new Date(Date.now() - 30 * 60 * 1000)
        }
    ]);

    const [alerts, setAlerts] = useState<PerformanceAlert[]>([
        {
            id: '1',
            type: 'warning',
            title: '높은 CPU 사용률',
            message: 'CPU 사용률이 80%를 초과했습니다. 성능 최적화를 고려해보세요.',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            severity: 'medium',
            resolved: false
        },
        {
            id: '2',
            type: 'info',
            title: '모델 업데이트 완료',
            message: 'Custom Model v2.1이 성공적으로 업데이트되었습니다.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            severity: 'low',
            resolved: true
        },
        {
            id: '3',
            type: 'error',
            title: '응답 시간 증가',
            message: '평균 응답 시간이 2초를 초과했습니다. 시스템 부하를 확인해주세요.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            severity: 'high',
            resolved: false
        }
    ]);

    // 자동 새로고침
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refreshMetrics();
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const refreshMetrics = () => {
        setIsLoading(true);
        setTimeout(() => {
            // 메트릭 업데이트 시뮬레이션
            setMetrics(prev => ({
                ...prev,
                cpu: {
                    ...prev.cpu,
                    usage: Math.random() * 30 + 50,
                    temperature: Math.random() * 20 + 65
                },
                responseTime: {
                    ...prev.responseTime,
                    average: Math.random() * 500 + 1000
                },
                system: {
                    ...prev.system,
                    lastUpdate: new Date()
                }
            }));
            setIsLoading(false);
        }, 1000);
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return <CheckCircle className="h-4 w-4" />;
            case 'good': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'critical': return <XCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Activity className="h-4 w-4 text-yellow-500" />;
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}일 ${hours}시간 ${minutes}분`;
    };

    const formatBytes = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const tabs = [
        { id: 'overview', name: '개요', icon: BarChart3 },
        { id: 'models', name: 'AI 모델', icon: Cpu },
        { id: 'alerts', name: '알림', icon: AlertTriangle },
        { id: 'optimization', name: '최적화', icon: Zap }
    ];

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI 성능 모니터링</h2>
                    <p className="text-gray-600 mt-1">시스템 성능 및 AI 모델 상태를 실시간으로 모니터링하세요</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">
                            {autoRefresh ? '자동 새로고침' : '수동 새로고침'}
                        </span>
                    </button>
                    <button
                        onClick={refreshMetrics}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
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
                        {/* 시스템 상태 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">시스템 상태</p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            {getHealthIcon(metrics.system.health)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(metrics.system.health)}`}>
                                                {metrics.system.health === 'excellent' ? '우수' :
                                                 metrics.system.health === 'good' ? '양호' :
                                                 metrics.system.health === 'warning' ? '경고' : '위험'}
                                            </span>
                                        </div>
                                    </div>
                                    <Server className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    가동시간: {formatUptime(metrics.system.uptime)}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">CPU 사용률</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.cpu.usage.toFixed(1)}%</p>
                                        <p className="text-sm text-gray-500">{metrics.cpu.temperature}°C</p>
                                    </div>
                                    <Cpu className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${metrics.cpu.usage}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">메모리 사용률</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                                        </p>
                                    </div>
                                    <HardDrive className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">응답 시간</p>
                                        <p className="text-2xl font-bold text-gray-900">{metrics.responseTime.average}ms</p>
                                        <div className="flex items-center space-x-1 mt-1">
                                            {getTrendIcon(metrics.responseTime.trend)}
                                            <span className="text-sm text-gray-500">
                                                {metrics.responseTime.trend === 'improving' ? '개선 중' :
                                                 metrics.responseTime.trend === 'declining' ? '악화 중' : '안정'}
                                            </span>
                                        </div>
                                    </div>
                                    <Clock className="h-8 w-8 text-orange-600" />
                                </div>
                            </motion.div>
                        </div>

                        {/* 성능 지표 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">처리량</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">초당 요청</span>
                                        <span className="font-medium">{metrics.throughput.requestsPerSecond}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">총 요청</span>
                                        <span className="font-medium">{metrics.throughput.totalRequests.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">성공률</span>
                                        <span className="font-medium text-green-600">{metrics.throughput.successRate}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">오류률</span>
                                        <span className="font-medium text-red-600">{metrics.throughput.errorRate}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 모델</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">활성 모델</span>
                                        <span className="font-medium">{metrics.aiModels.active} / {metrics.aiModels.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">평균 정확도</span>
                                        <span className="font-medium text-green-600">{metrics.aiModels.accuracy}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">평균 지연시간</span>
                                        <span className="font-medium">{metrics.aiModels.latency}ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'models' && (
                    <motion.div
                        key="models"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">AI 모델 상태</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {aiModels.map((model) => (
                                    <div key={model.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Cpu className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                                                    <p className="text-sm text-gray-600">{model.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">정확도</p>
                                                    <p className="font-medium text-green-600">{model.accuracy}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">지연시간</p>
                                                    <p className="font-medium">{model.latency}ms</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">요청</p>
                                                    <p className="font-medium">{model.requests.toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">오류</p>
                                                    <p className="font-medium text-red-600">{model.errors}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    model.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                                                    model.status === 'error' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {model.status === 'active' ? '활성' :
                                                     model.status === 'training' ? '학습 중' :
                                                     model.status === 'error' ? '오류' : '비활성'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'alerts' && (
                    <motion.div
                        key="alerts"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">성능 알림</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg ${
                                                    alert.type === 'error' ? 'bg-red-100' :
                                                    alert.type === 'warning' ? 'bg-yellow-100' :
                                                    alert.type === 'success' ? 'bg-green-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    {alert.type === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> :
                                                     alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                                                     alert.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                                                     <AlertTriangle className="h-4 w-4 text-blue-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {alert.timestamp.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {alert.severity === 'critical' ? '치명적' :
                                                     alert.severity === 'high' ? '높음' :
                                                     alert.severity === 'medium' ? '보통' : '낮음'}
                                                </span>
                                                {alert.resolved && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                        해결됨
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'optimization' && (
                    <motion.div
                        key="optimization"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 최적화</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">자동 최적화</h4>
                                        <p className="text-sm text-gray-600">시스템 성능을 자동으로 최적화합니다</p>
                                    </div>
                                    <button
                                        onClick={onOptimize}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        최적화 실행
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">권장 사항</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• CPU 사용률이 높습니다. 불필요한 프로세스를 종료하세요.</li>
                                            <li>• 메모리 사용률이 정상 범위입니다.</li>
                                            <li>• 응답 시간이 개선되고 있습니다.</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">최적화 상태</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">CPU 최적화</span>
                                                <span className="text-sm font-medium text-green-600">완료</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">메모리 최적화</span>
                                                <span className="text-sm font-medium text-green-600">완료</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">네트워크 최적화</span>
                                                <span className="text-sm font-medium text-yellow-600">진행 중</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIPerformanceMonitor;
