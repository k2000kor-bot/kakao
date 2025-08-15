import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon,
    CogIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardMetric {
    id: string;
    title: string;
    value: string | number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    icon: React.ReactNode;
    color: string;
}

interface DashboardWidget {
    id: string;
    title: string;
    type: 'metric' | 'chart' | 'list' | 'status';
    data: any;
    size: 'small' | 'medium' | 'large';
}

interface AdvancedDashboardSystemProps {
    onWidgetClick?: (widgetId: string) => void;
}

const AdvancedDashboardSystem: React.FC<AdvancedDashboardSystemProps> = ({
    onWidgetClick
}) => {
    const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
    const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadDashboardData();

        // 실시간 데이터 업데이트
        const interval = setInterval(() => {
            updateMetrics();
        }, 10000); // 10초마다

        return () => clearInterval(interval);
    }, [selectedTimeRange]);

    const loadDashboardData = () => {
        setIsLoading(true);

        // 메트릭 데이터 생성
        const newMetrics: DashboardMetric[] = [
            {
                id: 'active-routes',
                title: '활성 라우트',
                value: Math.floor(Math.random() * 20) + 15,
                change: Math.floor(Math.random() * 10) - 5,
                changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
                icon: <CogIcon className="w-6 h-6" />,
                color: 'bg-blue-500'
            },
            {
                id: 'total-features',
                title: '총 기능',
                value: Math.floor(Math.random() * 50) + 30,
                change: Math.floor(Math.random() * 15) + 5,
                changeType: 'increase',
                icon: <ChartBarIcon className="w-6 h-6" />,
                color: 'bg-green-500'
            },
            {
                id: 'system-performance',
                title: '시스템 성능',
                value: `${Math.floor(Math.random() * 20) + 80}%`,
                change: Math.floor(Math.random() * 10) - 5,
                changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
                icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
                color: 'bg-purple-500'
            },
            {
                id: 'active-users',
                title: '활성 사용자',
                value: Math.floor(Math.random() * 100) + 50,
                change: Math.floor(Math.random() * 20) + 10,
                changeType: 'increase',
                icon: <UserGroupIcon className="w-6 h-6" />,
                color: 'bg-orange-500'
            }
        ];

        setMetrics(newMetrics);

        // 위젯 데이터 생성
        const newWidgets: DashboardWidget[] = [
            {
                id: 'recent-activities',
                title: '최근 활동',
                type: 'list',
                size: 'medium',
                data: [
                    { id: 1, action: '새 라우트 추가', time: '2분 전', status: 'success' },
                    { id: 2, action: '시스템 업데이트', time: '5분 전', status: 'info' },
                    { id: 3, action: '성능 최적화', time: '10분 전', status: 'warning' },
                    { id: 4, action: '백업 완료', time: '15분 전', status: 'success' }
                ]
            },
            {
                id: 'system-status',
                title: '시스템 상태',
                type: 'status',
                size: 'small',
                data: [
                    { name: 'CPU 사용률', value: '45%', status: 'normal' },
                    { name: '메모리 사용률', value: '62%', status: 'warning' },
                    { name: '디스크 사용률', value: '78%', status: 'critical' },
                    { name: '네트워크', value: '정상', status: 'normal' }
                ]
            },
            {
                id: 'performance-chart',
                title: '성능 추이',
                type: 'chart',
                size: 'large',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [
                        {
                            label: 'CPU 사용률',
                            data: [30, 45, 60, 75, 65, 50],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        },
                        {
                            label: '메모리 사용률',
                            data: [40, 55, 70, 85, 75, 60],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)'
                        }
                    ]
                }
            }
        ];

        setWidgets(newWidgets);
        setIsLoading(false);
    };

    const updateMetrics = () => {
        setMetrics(prev =>
            prev.map(metric => ({
                ...metric,
                value: metric.id === 'active-routes'
                    ? Math.floor(Math.random() * 20) + 15
                    : metric.id === 'total-features'
                        ? Math.floor(Math.random() * 50) + 30
                        : metric.id === 'system-performance'
                            ? `${Math.floor(Math.random() * 20) + 80}%`
                            : Math.floor(Math.random() * 100) + 50,
                change: Math.floor(Math.random() * 20) - 10
            }))
        );
    };

    const getChangeIcon = (changeType: string) => {
        switch (changeType) {
            case 'increase':
                return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
            case 'decrease':
                return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 transform rotate-180" />;
            default:
                return <InformationCircleIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
            default:
                return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal':
                return 'text-green-600 bg-green-100';
            case 'warning':
                return 'text-yellow-600 bg-yellow-100';
            case 'critical':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-blue-600 bg-blue-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">고급 대시보드</h1>
                    <p className="text-gray-600">시스템 전체 현황 및 성능 모니터링</p>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1h">최근 1시간</option>
                        <option value="24h">최근 24시간</option>
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                    </select>

                    <button
                        onClick={loadDashboardData}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? '새로고침 중...' : '새로고침'}
                    </button>
                </div>
            </div>

            {/* 메트릭 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <div
                        key={metric.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onWidgetClick?.(metric.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                                {metric.icon}
                            </div>
                            <div className="flex items-center space-x-1">
                                {getChangeIcon(metric.changeType)}
                                <span className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' :
                                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    {Math.abs(metric.change)}%
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 위젯 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${widget.size === 'large' ? 'lg:col-span-2' : ''
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                            <button
                                onClick={() => onWidgetClick?.(widget.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                자세히 보기
                            </button>
                        </div>

                        {widget.type === 'list' && (
                            <div className="space-y-3">
                                {widget.data.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(item.status)}
                                            <span className="text-sm font-medium text-gray-900">{item.action}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {widget.type === 'status' && (
                            <div className="space-y-3">
                                {widget.data.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">{item.value}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {widget.type === 'chart' && (
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">차트 데이터 시각화</p>
                                    <p className="text-sm text-gray-400">실제 구현 시 Chart.js 또는 Recharts 사용</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 실시간 업데이트 표시 */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>실시간 업데이트 중... (10초마다)</span>
            </div>
        </div>
    );
};

export default AdvancedDashboardSystem; 