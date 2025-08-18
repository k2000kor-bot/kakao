import React, { useState, useEffect } from 'react';
// import './SystemMonitor.css'; // 제거

interface SystemStatus {
    status: string;
    timestamp: string;
    services: string[];
    version: string;
    performance?: {
        responseTime: number;
        memoryUsage: number;
        cpuUsage: number;
        activeConnections: number;
    };
}

interface ServiceStatus {
    name: string;
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    lastCheck: string;
}

const SystemMonitor: React.FC = () => {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkSystemHealth = async () => {
        try {
            const response = await fetch('http://localhost:8005/health');
            if (response.ok) {
                const data = await response.json();
                setSystemStatus(data);
                setError(null);
            } else {
                setError('시스템 상태 확인 실패');
            }
        } catch (err) {
            setError('서버 연결 오류');
        } finally {
            setIsLoading(false);
        }
    };

    const checkServiceStatus = async () => {
        const services = [
            { name: 'Frontend', url: 'http://localhost:3000' },
            { name: 'API Server', url: 'http://localhost:8005' },
            { name: 'Database', url: 'http://localhost:8005/health' }
        ];

        const statuses: ServiceStatus[] = [];

        for (const service of services) {
            try {
                const startTime = Date.now();
                const response = await fetch(service.url);
                const responseTime = Date.now() - startTime;

                statuses.push({
                    name: service.name,
                    status: response.ok ? 'healthy' : 'error',
                    responseTime,
                    lastCheck: new Date().toISOString()
                });
            } catch (err) {
                statuses.push({
                    name: service.name,
                    status: 'error',
                    responseTime: 0,
                    lastCheck: new Date().toISOString()
                });
            }
        }

        setServiceStatuses(statuses);
    };

    useEffect(() => {
        checkSystemHealth();
        checkServiceStatus();

        const interval = setInterval(() => {
            checkSystemHealth();
            checkServiceStatus();
        }, 5000); // 5초마다 업데이트

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return '#4CAF50';
            case 'warning':
                return '#FF9800';
            case 'error':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">시스템 상태 확인 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-600">
                    <p>오류: {error}</p>
                    <button
                        onClick={checkSystemHealth}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">시스템 모니터링</h1>
                    <p className="text-gray-600">실시간 시스템 상태 및 성능 모니터링</p>
                </div>

                {/* 전체 상태 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-100">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">전체 상태</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {systemStatus?.status === 'healthy' ? '정상' : '점검 필요'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-100">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">응답 시간</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {systemStatus?.performance?.responseTime || 0}ms
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-yellow-100">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">메모리 사용량</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {systemStatus?.performance?.memoryUsage || 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-purple-100">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">활성 연결</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {systemStatus?.performance?.activeConnections || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 서비스 상태 */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">서비스 상태</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {serviceStatuses.map((service, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getStatusColor(service.status) }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        응답 시간: {service.responseTime}ms
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        마지막 확인: {new Date(service.lastCheck).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 시스템 정보 */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">시스템 정보</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">버전 정보</h3>
                                <p className="text-sm text-gray-600">v{systemStatus?.version || '1.0.0'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">마지막 업데이트</h3>
                                <p className="text-sm text-gray-600">
                                    {systemStatus?.timestamp ? new Date(systemStatus.timestamp).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
