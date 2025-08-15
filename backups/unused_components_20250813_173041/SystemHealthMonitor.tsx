import React, { useState, useEffect } from 'react';
import {
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ClockIcon,
    ServerIcon,
    WifiIcon
} from '@heroicons/react/24/outline';

interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    cpu: number;
    memory: number;
    network: number;
    disk: number;
    lastUpdate: Date;
    uptime: number;
    activeConnections: number;
    errorCount: number;
    warningCount: number;
}

interface SystemHealthMonitorProps {
    onHealthChange?: (health: SystemHealth) => void;
    showDetails?: boolean;
}

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
    onHealthChange,
    showDetails = false
}) => {
    const [health, setHealth] = useState<SystemHealth>({
        status: 'healthy',
        cpu: 25,
        memory: 45,
        network: 85,
        disk: 30,
        lastUpdate: new Date(),
        uptime: 86400, // 24시간
        activeConnections: 12,
        errorCount: 0,
        warningCount: 2
    });

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const updateHealth = () => {
            const newHealth: SystemHealth = {
                status: 'healthy',
                cpu: Math.floor(Math.random() * 40) + 10,
                memory: Math.floor(Math.random() * 50) + 20,
                network: Math.floor(Math.random() * 20) + 80,
                disk: Math.floor(Math.random() * 30) + 20,
                lastUpdate: new Date(),
                uptime: health.uptime + 1,
                activeConnections: Math.floor(Math.random() * 20) + 5,
                errorCount: Math.floor(Math.random() * 3),
                warningCount: Math.floor(Math.random() * 5)
            };

            // 상태 결정
            if (newHealth.cpu > 80 || newHealth.memory > 80) {
                newHealth.status = 'critical';
            } else if (newHealth.cpu > 60 || newHealth.memory > 60) {
                newHealth.status = 'warning';
            } else {
                newHealth.status = 'healthy';
            }

            setHealth(newHealth);

            if (onHealthChange) {
                onHealthChange(newHealth);
            }
        };

        const interval = setInterval(updateHealth, 5000);
        return () => clearInterval(interval);
    }, [health.uptime, onHealthChange]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircleIcon className="w-4 h-4" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'critical': return <XCircleIcon className="w-4 h-4" />;
            case 'offline': return <XCircleIcon className="w-4 h-4" />;
            default: return <InformationCircleIcon className="w-4 h-4" />;
        }
    };

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">시스템 건강 상태</h3>
                </div>
                <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
                    {getStatusIcon(health.status)}
                    <span className="capitalize">{health.status}</span>
                </div>
            </div>

            {/* 기본 메트릭 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <ServerIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">CPU</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{health.cpu}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <ServerIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">메모리</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{health.memory}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <WifiIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">네트워크</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{health.network}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <ServerIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-gray-600">디스크</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{health.disk}%</div>
                </div>
            </div>

            {/* 상세 정보 (showDetails가 true일 때만 표시) */}
            {showDetails && (
                <div className="border-t pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">가동 시간</div>
                            <div className="text-lg font-semibold text-blue-900">{formatUptime(health.uptime)}</div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">활성 연결</div>
                            <div className="text-lg font-semibold text-green-900">{health.activeConnections}</div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">오류 수</div>
                            <div className="text-lg font-semibold text-red-900">{health.errorCount}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 확장 가능한 상세 정보 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1"
            >
                <span>{isExpanded ? '상세 정보 숨기기' : '상세 정보 보기'}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">마지막 업데이트</span>
                            <span className="text-sm text-gray-900">{health.lastUpdate.toLocaleTimeString()}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">가동 시간</span>
                            <span className="text-sm text-gray-900">{formatUptime(health.uptime)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">활성 연결</span>
                            <span className="text-sm text-gray-900">{health.activeConnections}개</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">경고 수</span>
                            <span className="text-sm text-yellow-600">{health.warningCount}개</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">오류 수</span>
                            <span className="text-sm text-red-600">{health.errorCount}개</span>
                        </div>

                        {/* 진행률 바 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">CPU 사용량</span>
                                <span className="text-sm text-gray-900">{health.cpu}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${health.cpu > 80 ? 'bg-red-500' :
                                            health.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${health.cpu}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">메모리 사용량</span>
                                <span className="text-sm text-gray-900">{health.memory}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${health.memory > 80 ? 'bg-red-500' :
                                            health.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${health.memory}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemHealthMonitor; 