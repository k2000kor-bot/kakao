import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    EyeIcon,
    LockClosedIcon,
    KeyIcon,
    UserIcon,
    ServerIcon,
    FireIcon,
    BoltIcon,
    MagnifyingGlassIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ShieldExclamationIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface SecurityEvent {
    id: string;
    type: 'threat' | 'warning' | 'info' | 'success';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    timestamp: string;
    source: string;
    status: 'active' | 'resolved' | 'investigating';
    actions: string[];
}

interface SecurityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
}

interface AccessLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed' | 'blocked';
}

interface AdvancedSecurityMonitoringProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedSecurityMonitoring: React.FC<AdvancedSecurityMonitoringProps> = ({
    isActive,
    onToggle
}) => {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
        {
            id: 'event-1',
            type: 'threat',
            severity: 'critical',
            title: '비정상적인 로그인 시도 감지',
            description: '다중 IP에서 동시 로그인 시도가 감지되었습니다.',
            timestamp: '2분 전',
            source: '192.168.1.100',
            status: 'active',
            actions: ['IP 차단', '계정 잠금', '관리자 알림']
        },
        {
            id: 'event-2',
            type: 'warning',
            severity: 'high',
            title: '데이터 접근 패턴 이상',
            description: '평소와 다른 시간대에 대량 데이터 접근이 감지되었습니다.',
            timestamp: '15분 전',
            source: 'user-123',
            status: 'investigating',
            actions: ['접근 로그 분석', '사용자 확인', '권한 검토']
        },
        {
            id: 'event-3',
            type: 'info',
            severity: 'medium',
            title: '시스템 업데이트 완료',
            description: '보안 패치가 성공적으로 적용되었습니다.',
            timestamp: '1시간 전',
            source: 'system',
            status: 'resolved',
            actions: ['로그 확인', '성능 모니터링']
        }
    ]);

    const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([
        {
            id: 'metric-1',
            name: '위협 탐지율',
            value: 98.5,
            unit: '%',
            trend: 'up',
            threshold: 95,
            status: 'normal'
        },
        {
            id: 'metric-2',
            name: '평균 응답 시간',
            value: 0.8,
            unit: '초',
            trend: 'down',
            threshold: 2,
            status: 'normal'
        },
        {
            id: 'metric-3',
            name: '차단된 접근',
            value: 1247,
            unit: '회',
            trend: 'up',
            threshold: 1000,
            status: 'warning'
        },
        {
            id: 'metric-4',
            name: '시스템 가용성',
            value: 99.9,
            unit: '%',
            trend: 'stable',
            threshold: 99.5,
            status: 'normal'
        }
    ]);

    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
        {
            id: 'log-1',
            userId: 'user-123',
            action: '로그인',
            resource: '/auth/login',
            timestamp: '2분 전',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            status: 'success'
        },
        {
            id: 'log-2',
            userId: 'user-456',
            action: '데이터 접근',
            resource: '/api/data',
            timestamp: '5분 전',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0...',
            status: 'success'
        },
        {
            id: 'log-3',
            userId: 'unknown',
            action: '로그인 시도',
            resource: '/auth/login',
            timestamp: '10분 전',
            ipAddress: '203.0.113.1',
            userAgent: 'Unknown',
            status: 'blocked'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'metrics' | 'access' | 'threats'>('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<string>('');

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // 실시간 보안 이벤트 시뮬레이션
            const newEvent: SecurityEvent = {
                id: `event-${Date.now()}`,
                type: ['threat', 'warning', 'info', 'success'][Math.floor(Math.random() * 4)] as any,
                severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
                title: '실시간 보안 모니터링',
                description: '시스템 보안 상태가 정상적으로 모니터링되고 있습니다.',
                timestamp: '방금 전',
                source: 'system',
                status: 'active',
                actions: ['모니터링', '로그 확인']
            };

            setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getEventColor = (type: string) => {
        switch (type) {
            case 'threat': return 'text-red-600 bg-red-50 border-red-200';
            case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-emerald-600 bg-emerald-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'blocked': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>보안 모니터링</span>
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
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 보안 및 모니터링 시스템</h3>
                                <p className="text-gray-400 text-sm">실시간 보안 위협 탐지 및 시스템 모니터링</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
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
                                aria-label="보안 모니터링 닫기"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'overview', label: '보안 개요', icon: ShieldCheckIcon },
                        { id: 'events', label: '보안 이벤트', icon: ExclamationTriangleIcon },
                        { id: 'metrics', label: '보안 지표', icon: CogIcon },
                        { id: 'access', label: '접근 로그', icon: UserIcon },
                        { id: 'threats', label: '위협 분석', icon: FireIcon }
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
                            {/* 보안 상태 요약 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">안전</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">시스템 상태</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{securityEvents.filter(e => e.status === 'active').length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">활성 이벤트</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <UserIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{accessLogs.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">접근 로그</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <CpuChipIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">99.9%</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">시스템 가용성</p>
                                </div>
                            </div>

                            {/* 실시간 보안 이벤트 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 보안 이벤트</h4>
                                <div className="space-y-3">
                                    {securityEvents.slice(0, 5).map(event => (
                                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{event.title}</p>
                                                    <p className="text-sm text-gray-600">{event.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                                <p className="text-xs text-gray-500">{event.timestamp}</p>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">보안 이벤트 관리</h4>
                                <div className="space-y-4">
                                    {securityEvents.map(event => (
                                        <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{event.title}</h5>
                                                        <p className="text-sm text-gray-600">{event.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventColor(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">심각도:</span>
                                                    <span className={`font-semibold ${getSeverityColor(event.severity)}`}>
                                                        {event.severity}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">소스:</span>
                                                    <span className="font-semibold text-gray-900">{event.source}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">상태:</span>
                                                    <span className="font-semibold text-gray-900">{event.status}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">시간:</span>
                                                    <span className="font-semibold text-gray-900">{event.timestamp}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600 mb-2">권장 조치:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {event.actions.map((action, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                                            {action}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">보안 지표</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {securityMetrics.map(metric => (
                                        <div key={metric.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-gray-900">{metric.name}</h5>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${metric.status === 'normal' ? 'bg-emerald-100 text-emerald-800' :
                                                    metric.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {metric.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {metric.value}{metric.unit}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    {metric.trend === 'up' ? (
                                                        <ArrowPathIcon className="w-4 h-4 text-red-500 rotate-45" />
                                                    ) : metric.trend === 'down' ? (
                                                        <ArrowPathIcon className="w-4 h-4 text-emerald-500 -rotate-45" />
                                                    ) : (
                                                        <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                임계값: {metric.threshold}{metric.unit}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'access' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">접근 로그</h4>
                                <div className="space-y-3">
                                    {accessLogs.map(log => (
                                        <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-200 rounded-lg">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{log.userId}</h5>
                                                        <p className="text-sm text-gray-600">{log.action} - {log.resource}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">IP 주소:</span>
                                                    <span className="font-semibold text-gray-900">{log.ipAddress}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">시간:</span>
                                                    <span className="font-semibold text-gray-900">{log.timestamp}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">User Agent:</span>
                                                    <span className="font-semibold text-gray-900">{log.userAgent.substring(0, 30)}...</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">리소스:</span>
                                                    <span className="font-semibold text-gray-900">{log.resource}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'threats' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">위협 분석</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h5 className="font-medium text-red-900 mb-3">위협 유형별 분포</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-red-800">무차별 대입 공격:</span>
                                                <span className="font-semibold text-red-900">45%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-800">SQL 인젝션:</span>
                                                <span className="font-semibold text-red-900">23%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-800">XSS 공격:</span>
                                                <span className="font-semibold text-red-900">18%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-800">기타:</span>
                                                <span className="font-semibold text-red-900">14%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <h5 className="font-medium text-amber-900 mb-3">차단된 IP 주소</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-amber-800">203.0.113.1:</span>
                                                <span className="font-semibold text-amber-900">1,247회</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-amber-800">198.51.100.1:</span>
                                                <span className="font-semibold text-amber-900">892회</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-amber-800">203.0.113.2:</span>
                                                <span className="font-semibold text-amber-900">567회</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-amber-800">기타:</span>
                                                <span className="font-semibold text-amber-900">2,341회</span>
                                            </div>
                                        </div>
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

export default AdvancedSecurityMonitoring; 