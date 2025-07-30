import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    FireIcon,
    BoltIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlayIcon,
    PauseIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface PerformanceMetrics {
    timestamp: number;
    cpu_usage: number;
    memory_usage: number;
    gpu_usage: number;
    network_latency: number;
    response_time: number;
    throughput: number;
    error_rate: number;
    active_connections: number;
    queue_length: number;
}

interface ModelPerformance {
    modelId: string;
    name: string;
    requests_per_second: number;
    average_response_time: number;
    success_rate: number;
    error_count: number;
    last_response_time: number;
    status: 'online' | 'degraded' | 'offline' | 'error';
}

interface RealTimePerformanceMonitorProps {
    isActive: boolean;
    onToggle: () => void;
}

const RealTimePerformanceMonitor: React.FC<RealTimePerformanceMonitorProps> = ({
    isActive,
    onToggle
}) => {
    const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
        timestamp: Date.now(),
        cpu_usage: 45.2,
        memory_usage: 67.8,
        gpu_usage: 23.4,
        network_latency: 12.5,
        response_time: 245,
        throughput: 1250,
        error_rate: 0.8,
        active_connections: 156,
        queue_length: 23
    });

    const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([
        {
            modelId: 'neural-v1',
            name: '신경망 AI v1.0',
            requests_per_second: 45.2,
            average_response_time: 180,
            success_rate: 94.5,
            error_count: 12,
            last_response_time: 165,
            status: 'online'
        },
        {
            modelId: 'quantum-v2',
            name: '양자 AI v2.0',
            requests_per_second: 32.1,
            average_response_time: 320,
            success_rate: 97.2,
            error_count: 5,
            last_response_time: 298,
            status: 'online'
        },
        {
            modelId: 'extreme-v3',
            name: '극한 설득 AI v3.0',
            requests_per_second: 28.7,
            average_response_time: 450,
            success_rate: 91.8,
            error_count: 18,
            last_response_time: 412,
            status: 'degraded'
        },
        {
            modelId: 'personalized-v1',
            name: '개인화 AI v1.0',
            requests_per_second: 38.9,
            average_response_time: 210,
            success_rate: 96.1,
            error_count: 8,
            last_response_time: 195,
            status: 'online'
        },
        {
            modelId: 'hybrid-v2',
            name: '하이브리드 AI v2.0',
            requests_per_second: 22.3,
            average_response_time: 580,
            success_rate: 98.5,
            error_count: 3,
            last_response_time: 545,
            status: 'online'
        },
        {
            modelId: 'experimental-v1',
            name: '실험적 AI v1.0',
            requests_per_second: 15.6,
            average_response_time: 720,
            success_rate: 82.3,
            error_count: 45,
            last_response_time: 890,
            status: 'error'
        }
    ]);

    const [isMonitoring, setIsMonitoring] = useState(true);
    const [alertLevel, setAlertLevel] = useState<'normal' | 'warning' | 'critical'>('normal');

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isMonitoring) {
            interval = setInterval(() => {
                setCurrentMetrics(prev => ({
                    ...prev,
                    timestamp: Date.now(),
                    cpu_usage: Math.max(0, Math.min(100, prev.cpu_usage + (Math.random() - 0.5) * 10)),
                    memory_usage: Math.max(0, Math.min(100, prev.memory_usage + (Math.random() - 0.5) * 8)),
                    gpu_usage: Math.max(0, Math.min(100, prev.gpu_usage + (Math.random() - 0.5) * 15)),
                    network_latency: Math.max(0, prev.network_latency + (Math.random() - 0.5) * 5),
                    response_time: Math.max(0, prev.response_time + (Math.random() - 0.5) * 50),
                    throughput: Math.max(0, prev.throughput + (Math.random() - 0.5) * 100),
                    error_rate: Math.max(0, Math.min(10, prev.error_rate + (Math.random() - 0.5) * 2)),
                    active_connections: Math.max(0, prev.active_connections + Math.floor(Math.random() * 5) - 2),
                    queue_length: Math.max(0, prev.queue_length + Math.floor(Math.random() * 3) - 1)
                }));

                setModelPerformance(prev => prev.map(model => ({
                    ...model,
                    requests_per_second: Math.max(0, model.requests_per_second + (Math.random() - 0.5) * 5),
                    average_response_time: Math.max(0, model.average_response_time + (Math.random() - 0.5) * 20),
                    success_rate: Math.max(0, Math.min(100, model.success_rate + (Math.random() - 0.5) * 2)),
                    error_count: Math.max(0, model.error_count + Math.floor(Math.random() * 3) - 1),
                    last_response_time: Math.max(0, model.last_response_time + (Math.random() - 0.5) * 30)
                })));
            }, 2000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isMonitoring]);

    useEffect(() => {
        // 알림 레벨 결정
        const avgErrorRate = modelPerformance.reduce((sum, model) => sum + (100 - model.success_rate), 0) / modelPerformance.length;
        const avgResponseTime = modelPerformance.reduce((sum, model) => sum + model.average_response_time, 0) / modelPerformance.length;

        if (avgErrorRate > 10 || avgResponseTime > 500 || currentMetrics.cpu_usage > 90) {
            setAlertLevel('critical');
        } else if (avgErrorRate > 5 || avgResponseTime > 300 || currentMetrics.cpu_usage > 70) {
            setAlertLevel('warning');
        } else {
            setAlertLevel('normal');
        }
    }, [modelPerformance, currentMetrics]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'degraded': return 'text-yellow-600 bg-yellow-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getAlertColor = (level: string) => {
        switch (level) {
            case 'normal': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getMetricColor = (value: number, threshold: number) => {
        if (value > threshold * 0.8) return 'text-red-600';
        if (value > threshold * 0.6) return 'text-yellow-600';
        return 'text-green-600';
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>성능 모니터링</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-4/5 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CpuChipIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">실시간 성능 모니터링</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getAlertColor(alertLevel)}`}>
                                <div className={`w-2 h-2 rounded-full ${alertLevel === 'critical' ? 'bg-red-500' : alertLevel === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                <span className="text-gray-800">{alertLevel.toUpperCase()}</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 시스템 메트릭 */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">시스템 리소스</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">CPU 사용률</span>
                                            <span className={`font-medium ${getMetricColor(currentMetrics.cpu_usage, 100)}`}>
                                                {currentMetrics.cpu_usage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMetricColor(currentMetrics.cpu_usage, 100) === 'text-red-600' ? 'bg-red-500' : getMetricColor(currentMetrics.cpu_usage, 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${currentMetrics.cpu_usage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">메모리 사용률</span>
                                            <span className={`font-medium ${getMetricColor(currentMetrics.memory_usage, 100)}`}>
                                                {currentMetrics.memory_usage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMetricColor(currentMetrics.memory_usage, 100) === 'text-red-600' ? 'bg-red-500' : getMetricColor(currentMetrics.memory_usage, 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${currentMetrics.memory_usage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">GPU 사용률</span>
                                            <span className={`font-medium ${getMetricColor(currentMetrics.gpu_usage, 100)}`}>
                                                {currentMetrics.gpu_usage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMetricColor(currentMetrics.gpu_usage, 100) === 'text-red-600' ? 'bg-red-500' : getMetricColor(currentMetrics.gpu_usage, 100) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${currentMetrics.gpu_usage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">네트워크 지연</span>
                                            <span className={`font-medium ${getMetricColor(currentMetrics.network_latency, 50)}`}>
                                                {currentMetrics.network_latency.toFixed(1)}ms
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMetricColor(currentMetrics.network_latency, 50) === 'text-red-600' ? 'bg-red-500' : getMetricColor(currentMetrics.network_latency, 50) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(currentMetrics.network_latency / 50 * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">성능 지표</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">평균 응답 시간:</span>
                                        <span className={`font-medium ${getMetricColor(currentMetrics.response_time, 500)}`}>
                                            {currentMetrics.response_time.toFixed(0)}ms
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">처리량:</span>
                                        <span className="font-medium text-green-600">
                                            {currentMetrics.throughput.toFixed(0)} req/s
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">오류율:</span>
                                        <span className={`font-medium ${getMetricColor(currentMetrics.error_rate, 5)}`}>
                                            {currentMetrics.error_rate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">활성 연결:</span>
                                        <span className="font-medium text-blue-600">
                                            {currentMetrics.active_connections}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">큐 길이:</span>
                                        <span className={`font-medium ${getMetricColor(currentMetrics.queue_length, 50)}`}>
                                            {currentMetrics.queue_length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">마지막 업데이트:</span>
                                        <span className="text-gray-500">
                                            {new Date(currentMetrics.timestamp).toLocaleTimeString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 모델 성능 */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI 모델 성능</h4>
                                <div className="space-y-4">
                                    {modelPerformance.map(model => (
                                        <div key={model.modelId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <CpuChipIcon className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">요청/초:</span>
                                                    <span className="font-medium">{model.requests_per_second.toFixed(1)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">평균 응답:</span>
                                                    <span className={`font-medium ${getMetricColor(model.average_response_time, 500)}`}>
                                                        {model.average_response_time.toFixed(0)}ms
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">성공률:</span>
                                                    <span className={`font-medium ${getMetricColor(100 - model.success_rate, 10)}`}>
                                                        {model.success_rate.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">오류 수:</span>
                                                    <span className="font-medium text-red-600">{model.error_count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimePerformanceMonitor; 