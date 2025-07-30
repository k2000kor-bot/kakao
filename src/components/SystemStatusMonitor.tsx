import React, { useState, useEffect } from 'react';
import { routeManager } from '../config/routes';
import { RouteConfig } from '../types/routes';

interface SystemStatus {
    totalRoutes: number;
    activeRoutes: number;
    inactiveRoutes: number;
    categories: number;
    lastUpdate: Date;
    systemHealth: 'healthy' | 'warning' | 'error';
    performance: {
        loadTime: number;
        memoryUsage: number;
        cpuUsage: number;
    };
}

const SystemStatusMonitor: React.FC = () => {
    const [status, setStatus] = useState<SystemStatus>({
        totalRoutes: 0,
        activeRoutes: 0,
        inactiveRoutes: 0,
        categories: 0,
        lastUpdate: new Date(),
        systemHealth: 'healthy',
        performance: {
            loadTime: 0,
            memoryUsage: 0,
            cpuUsage: 0
        }
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        updateStatus();
        const interval = setInterval(updateStatus, 10000); // 10초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const updateStatus = () => {
        try {
            const allRoutes = routeManager.getAllRoutes();
            const activeRoutes = allRoutes.filter(r => r.isActive !== false);
            const inactiveRoutes = allRoutes.filter(r => r.isActive === false);

            // 카테고리 수 계산
            const categories = new Set(allRoutes.map(r => r.category || 'main')).size;

            // 성능 메트릭 (시뮬레이션)
            const performance = {
                loadTime: Math.random() * 100 + 50, // 50-150ms
                memoryUsage: Math.random() * 20 + 10, // 10-30%
                cpuUsage: Math.random() * 15 + 5 // 5-20%
            };

            // 시스템 건강도 판단
            let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
            if (performance.memoryUsage > 25 || performance.cpuUsage > 15) {
                systemHealth = 'warning';
            }
            if (performance.memoryUsage > 40 || performance.cpuUsage > 25) {
                systemHealth = 'error';
            }

            setStatus({
                totalRoutes: allRoutes.length,
                activeRoutes: activeRoutes.length,
                inactiveRoutes: inactiveRoutes.length,
                categories,
                lastUpdate: new Date(),
                systemHealth,
                performance
            });
        } catch (error) {
            console.error('상태 업데이트 오류:', error);
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy': return '🟢';
            case 'warning': return '🟡';
            case 'error': return '🔴';
            default: return '⚪';
        }
    };

    const getHealthText = (health: string) => {
        switch (health) {
            case 'healthy': return '정상';
            case 'warning': return '주의';
            case 'error': return '오류';
            default: return '알 수 없음';
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-40">
            {/* 축소된 상태 표시 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <span className={`text-lg ${getHealthColor(status.systemHealth)}`}>
                            {getHealthIcon(status.systemHealth)}
                        </span>
                        <div className="text-sm">
                            <div className="font-medium text-gray-900">
                                {getHealthText(status.systemHealth)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {status.activeRoutes}/{status.totalRoutes} 활성
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? '▼' : '▲'}
                    </button>
                </div>

                {/* 확장된 상세 정보 */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <div className="text-gray-500">총 라우트</div>
                                <div className="font-medium">{status.totalRoutes}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">활성 라우트</div>
                                <div className="font-medium text-green-600">{status.activeRoutes}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">비활성 라우트</div>
                                <div className="font-medium text-gray-600">{status.inactiveRoutes}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">카테고리</div>
                                <div className="font-medium">{status.categories}</div>
                            </div>
                        </div>

                        {/* 성능 메트릭 */}
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">로드 시간</span>
                                <span className={`font-medium ${status.performance.loadTime < 100 ? 'text-green-600' :
                                    status.performance.loadTime < 150 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {status.performance.loadTime.toFixed(0)}ms
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">메모리</span>
                                <span className={`font-medium ${status.performance.memoryUsage < 20 ? 'text-green-600' :
                                    status.performance.memoryUsage < 30 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {status.performance.memoryUsage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">CPU</span>
                                <span className={`font-medium ${status.performance.cpuUsage < 10 ? 'text-green-600' :
                                    status.performance.cpuUsage < 20 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {status.performance.cpuUsage.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* 마지막 업데이트 */}
                        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                            마지막 업데이트: {status.lastUpdate.toLocaleTimeString()}
                        </div>

                        {/* 상세 보기 버튼 */}
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700"
                        >
                            {showDetails ? '간단히 보기' : '상세 보기'}
                        </button>
                    </div>
                )}
            </div>

            {/* 상세 모달 */}
            {showDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">시스템 상태 상세</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* 시스템 건강도 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">시스템 건강도</h3>
                                <div className="flex items-center space-x-4">
                                    <div className={`px-4 py-2 rounded-lg ${getHealthColor(status.systemHealth)}`}>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">{getHealthIcon(status.systemHealth)}</span>
                                            <div>
                                                <div className="font-medium">{getHealthText(status.systemHealth)}</div>
                                                <div className="text-sm opacity-75">
                                                    {status.systemHealth === 'healthy' && '모든 시스템이 정상 작동 중입니다.'}
                                                    {status.systemHealth === 'warning' && '일부 성능 지표에 주의가 필요합니다.'}
                                                    {status.systemHealth === 'error' && '시스템 성능에 문제가 있습니다.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 라우트 통계 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">라우트 통계</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{status.totalRoutes}</div>
                                        <div className="text-sm text-blue-600">총 라우트</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{status.activeRoutes}</div>
                                        <div className="text-sm text-green-600">활성 라우트</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-600">{status.inactiveRoutes}</div>
                                        <div className="text-sm text-gray-600">비활성 라우트</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{status.categories}</div>
                                        <div className="text-sm text-purple-600">카테고리</div>
                                    </div>
                                </div>
                            </div>

                            {/* 성능 메트릭 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">성능 메트릭</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">로드 시간</span>
                                            <span className={`text-sm font-medium ${status.performance.loadTime < 100 ? 'text-green-600' :
                                                status.performance.loadTime < 150 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {status.performance.loadTime.toFixed(0)}ms
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${status.performance.loadTime < 100 ? 'bg-green-500' :
                                                    status.performance.loadTime < 150 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${Math.min(status.performance.loadTime / 2, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">메모리 사용량</span>
                                            <span className={`text-sm font-medium ${status.performance.memoryUsage < 20 ? 'text-green-600' :
                                                status.performance.memoryUsage < 30 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {status.performance.memoryUsage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${status.performance.memoryUsage < 20 ? 'bg-green-500' :
                                                    status.performance.memoryUsage < 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${status.performance.memoryUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">CPU 사용량</span>
                                            <span className={`text-sm font-medium ${status.performance.cpuUsage < 10 ? 'text-green-600' :
                                                status.performance.cpuUsage < 20 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {status.performance.cpuUsage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${status.performance.cpuUsage < 10 ? 'bg-green-500' :
                                                    status.performance.cpuUsage < 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${status.performance.cpuUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 시스템 정보 */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">시스템 정보</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">마지막 업데이트:</span>
                                            <div className="font-medium">{status.lastUpdate.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">시스템 상태:</span>
                                            <div className={`font-medium ${getHealthColor(status.systemHealth)}`}>
                                                {getHealthText(status.systemHealth)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemStatusMonitor; 