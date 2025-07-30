import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    HeartIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AnalyticsMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    category: 'performance' | 'security' | 'usage' | 'quality';
    icon: any;
}

interface SystemPerformance {
    id: string;
    name: string;
    cpu: number;
    memory: number;
    network: number;
    disk: number;
    status: 'optimal' | 'good' | 'warning' | 'critical';
    lastUpdate: string;
}

interface AIInsight {
    id: string;
    title: string;
    description: string;
    type: 'optimization' | 'alert' | 'recommendation' | 'trend';
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    actionable: boolean;
}

interface RealTimeEvent {
    id: string;
    type: 'ai-learning' | 'data-visualization' | 'ai-prediction' | 'security-monitoring' | 'collaboration' | 'automation';
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: string;
    system: string;
}

interface AdvancedAIRealTimeAnalyticsProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIRealTimeAnalytics: React.FC<AdvancedAIRealTimeAnalyticsProps> = ({
    isActive,
    onToggle
}) => {
    const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([
        {
            id: 'ai-accuracy',
            name: 'AI 정확도',
            value: 94.2,
            unit: '%',
            trend: 'up',
            change: 2.1,
            category: 'quality',
            icon: CpuChipIcon
        },
        {
            id: 'response-time',
            name: '평균 응답 시간',
            value: 245,
            unit: 'ms',
            trend: 'down',
            change: -15.3,
            category: 'performance',
            icon: BoltIcon
        },
        {
            id: 'security-score',
            name: '보안 점수',
            value: 98.5,
            unit: '/100',
            trend: 'stable',
            change: 0,
            category: 'security',
            icon: ShieldCheckIcon
        },
        {
            id: 'active-users',
            name: '활성 사용자',
            value: 1247,
            unit: '명',
            trend: 'up',
            change: 8.7,
            category: 'usage',
            icon: UsersIcon
        },
        {
            id: 'data-processed',
            name: '처리된 데이터',
            value: 15420,
            unit: 'MB',
            trend: 'up',
            change: 12.5,
            category: 'performance',
            icon: ChartBarIcon
        },
        {
            id: 'model-uptime',
            name: '모델 가동률',
            value: 99.9,
            unit: '%',
            trend: 'stable',
            change: 0,
            category: 'quality',
            icon: CpuChipIcon
        }
    ]);

    const [systemPerformance, setSystemPerformance] = useState<SystemPerformance[]>([
        {
            id: 'ai-learning-system',
            name: 'AI 학습 시스템',
            cpu: 45.2,
            memory: 67.8,
            network: 12.5,
            disk: 23.1,
            status: 'optimal',
            lastUpdate: '방금 전'
        },
        {
            id: 'data-visualization',
            name: '데이터 시각화',
            cpu: 32.1,
            memory: 54.3,
            network: 8.7,
            disk: 15.6,
            status: 'good',
            lastUpdate: '30초 전'
        },
        {
            id: 'ai-prediction',
            name: 'AI 예측 시스템',
            cpu: 58.9,
            memory: 72.4,
            network: 18.2,
            disk: 31.7,
            status: 'warning',
            lastUpdate: '1분 전'
        },
        {
            id: 'security-monitoring',
            name: '보안 모니터링',
            cpu: 28.3,
            memory: 41.2,
            network: 6.4,
            disk: 12.8,
            status: 'optimal',
            lastUpdate: '2분 전'
        }
    ]);

    const [aiInsights, setAiInsights] = useState<AIInsight[]>([
        {
            id: 'insight-1',
            title: 'AI 모델 성능 최적화 기회',
            description: 'Neural Network v1.0의 정확도가 2.1% 향상되었습니다. 추가 최적화를 통해 5% 더 개선할 수 있습니다.',
            type: 'optimization',
            priority: 'medium',
            timestamp: '5분 전',
            actionable: true
        },
        {
            id: 'insight-2',
            title: '보안 위협 감지됨',
            description: '비정상적인 접근 패턴이 감지되었습니다. 즉시 조치가 필요합니다.',
            type: 'alert',
            priority: 'critical',
            timestamp: '2분 전',
            actionable: true
        },
        {
            id: 'insight-3',
            title: '사용자 참여도 증가',
            description: '지난 24시간 동안 사용자 참여도가 8.7% 증가했습니다. 이는 새로운 기능의 성공을 나타냅니다.',
            type: 'trend',
            priority: 'low',
            timestamp: '10분 전',
            actionable: false
        },
        {
            id: 'insight-4',
            title: '시스템 리소스 최적화 권장',
            description: 'AI 예측 시스템의 CPU 사용률이 58.9%로 높습니다. 리소스 할당을 조정하는 것을 권장합니다.',
            type: 'recommendation',
            priority: 'high',
            timestamp: '15분 전',
            actionable: true
        }
    ]);

    const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([
        {
            id: 'event-1',
            type: 'ai-learning',
            message: 'Neural Network 모델 학습 완료 - 정확도 94.2% 달성',
            severity: 'info',
            timestamp: '방금 전',
            system: 'AI 학습 시스템'
        },
        {
            id: 'event-2',
            type: 'security-monitoring',
            message: '새로운 보안 패턴 감지됨 - 자동 차단 완료',
            severity: 'warning',
            timestamp: '1분 전',
            system: '보안 모니터링'
        },
        {
            id: 'event-3',
            type: 'data-visualization',
            message: '실시간 차트 업데이트 완료 - 6개 차트 동기화',
            severity: 'info',
            timestamp: '2분 전',
            system: '데이터 시각화'
        },
        {
            id: 'event-4',
            type: 'ai-prediction',
            message: '사용자 행동 예측 모델 업데이트 - 정확도 향상',
            severity: 'info',
            timestamp: '3분 전',
            system: 'AI 예측 시스템'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'insights' | 'events' | 'trends' | 'alerts'>('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // 실시간 메트릭 업데이트 시뮬레이션
            setAnalyticsMetrics(prev => prev.map(metric => ({
                ...metric,
                value: metric.value + (Math.random() - 0.5) * metric.value * 0.01,
                change: metric.change + (Math.random() - 0.5) * 2
            })));

            // 시스템 성능 업데이트
            setSystemPerformance(prev => prev.map(system => ({
                ...system,
                cpu: Math.max(10, Math.min(90, system.cpu + (Math.random() - 0.5) * 5)),
                memory: Math.max(20, Math.min(85, system.memory + (Math.random() - 0.5) * 3)),
                network: Math.max(5, Math.min(25, system.network + (Math.random() - 0.5) * 2)),
                disk: Math.max(10, Math.min(40, system.disk + (Math.random() - 0.5) * 3)),
                lastUpdate: '방금 전'
            })));

            // 새로운 이벤트 추가
            const newEvent: RealTimeEvent = {
                id: `event-${Date.now()}`,
                type: ['ai-learning', 'data-visualization', 'ai-prediction', 'security-monitoring'][Math.floor(Math.random() * 4)] as any,
                message: '시스템 상태 업데이트 완료',
                severity: 'info',
                timestamp: '방금 전',
                system: '통합 시스템'
            };
            setRealTimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />;
            case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
            case 'stable': return <ArrowRightIcon className="w-4 h-4 text-gray-500" />;
            default: return <ArrowRightIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            case 'critical': return 'text-red-700 bg-red-100 border-red-300';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>실시간 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <ChartBarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 실시간 분석 대시보드</h3>
                                <p className="text-gray-400 text-sm">통합 AI 시스템 실시간 성능 모니터링 및 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-700"
                            >
                                <option value="1h">1시간</option>
                                <option value="6h">6시간</option>
                                <option value="24h">24시간</option>
                                <option value="7d">7일</option>
                            </select>
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${autoRefresh
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {autoRefresh ? '실시간 ON' : '실시간 OFF'}
                            </button>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'overview', label: '개요', icon: Squares2X2Icon },
                        { id: 'performance', label: '성능', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
                        { id: 'events', label: '이벤트', icon: SignalIcon },
                        { id: 'trends', label: '트렌드', icon: ArrowTrendingUpIcon },
                        { id: 'alerts', label: '알림', icon: ExclamationTriangleIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 주요 메트릭 */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                {analyticsMetrics.map(metric => {
                                    const Icon = metric.icon;
                                    return (
                                        <div key={metric.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Icon className="w-4 h-4 text-gray-600" />
                                                </div>
                                                {getTrendIcon(metric.trend)}
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-sm font-medium text-gray-600">{metric.name}</h5>
                                                <div className="flex items-end justify-between">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {metric.value.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{metric.unit}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 시스템 성능 및 인사이트 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 성능</h4>
                                    <div className="space-y-3">
                                        {systemPerformance.map(system => (
                                            <div key={system.id} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-medium text-gray-900">{system.name}</h5>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(system.status)}`}>
                                                        {system.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">CPU:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{system.cpu.toFixed(1)}%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">메모리:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{system.memory.toFixed(1)}%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">네트워크:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{system.network.toFixed(1)}%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">디스크:</span>
                                                        <span className="font-semibold text-gray-900 ml-1">{system.disk.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 인사이트</h4>
                                    <div className="space-y-3">
                                        {aiInsights.slice(0, 3).map(insight => (
                                            <div key={insight.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className="font-medium text-gray-900">{insight.title}</h5>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}>
                                                        {insight.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{insight.timestamp}</span>
                                                    {insight.actionable && (
                                                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                            조치하기
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">상세 성능 분석</h4>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">성능 분석 차트</p>
                                        <p className="text-sm text-gray-400">실시간 성능 지표 시각화</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 인사이트</h4>
                                <div className="space-y-4">
                                    {aiInsights.map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <LightBulbIcon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                        <p className="text-sm text-gray-600">{insight.description}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}>
                                                    {insight.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{insight.timestamp}</span>
                                                {insight.actionable && (
                                                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                        조치하기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 이벤트</h4>
                                <div className="space-y-3">
                                    {realTimeEvents.map(event => (
                                        <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${event.severity === 'info' ? 'bg-blue-500' :
                                                event.severity === 'warning' ? 'bg-amber-500' :
                                                    event.severity === 'error' ? 'bg-red-500' :
                                                        'bg-red-700'
                                                }`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-900">{event.message}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                                                        {event.severity}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>{event.system}</span>
                                                    <span>{event.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">트렌드 분석</h4>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">트렌드 분석 차트</p>
                                        <p className="text-sm text-gray-400">시계열 데이터 분석 및 예측</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">알림 관리</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center space-x-3">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                            <div>
                                                <h5 className="font-medium text-gray-900">보안 위협 감지</h5>
                                                <p className="text-sm text-gray-600">비정상적인 접근 패턴이 감지되었습니다.</p>
                                            </div>
                                        </div>
                                        <button className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                                            조치하기
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="flex items-center space-x-3">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                                            <div>
                                                <h5 className="font-medium text-gray-900">시스템 리소스 부족</h5>
                                                <p className="text-sm text-gray-600">AI 예측 시스템의 CPU 사용률이 높습니다.</p>
                                            </div>
                                        </div>
                                        <button className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors">
                                            확인
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIRealTimeAnalytics; 