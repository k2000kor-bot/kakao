import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    SignalIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    WifiIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

interface MonitoringData {
    systemStatus: 'online' | 'warning' | 'error';
    activeConnections: number;
    messageQueue: number;
    responseTime: number;
    errorRate: number;
    recentActivities: {
        id: string;
        type: 'message' | 'analysis' | 'error' | 'warning';
        message: string;
        timestamp: string;
        severity: 'low' | 'medium' | 'high';
    }[];
    systemMetrics: {
        cpu: number;
        memory: number;
        network: number;
        storage: number;
    };
}

const RealTimeMonitoring: React.FC = () => {
    const [monitoringData, setMonitoringData] = useState<MonitoringData>({
        systemStatus: 'online',
        activeConnections: 0,
        messageQueue: 0,
        responseTime: 0,
        errorRate: 0,
        recentActivities: [],
        systemMetrics: {
            cpu: 0,
            memory: 0,
            network: 0,
            storage: 0
        }
    });
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        // 실시간 데이터 시뮬레이션
        const interval = setInterval(() => {
            setMonitoringData(prev => ({
                systemStatus: Math.random() > 0.9 ? 'warning' : 'online',
                activeConnections: Math.floor(Math.random() * 50) + 10,
                messageQueue: Math.floor(Math.random() * 20),
                responseTime: Math.random() * 5 + 0.5,
                errorRate: Math.random() * 2,
                recentActivities: [
                    {
                        id: Date.now().toString(),
                        type: Math.random() > 0.7 ? 'message' : 'analysis',
                        message: Math.random() > 0.5 ? '새 메시지 처리 완료' : 'AI 분석 완료',
                        timestamp: new Date().toLocaleTimeString(),
                        severity: Math.random() > 0.8 ? 'high' : 'low'
                    },
                    ...prev.recentActivities.slice(0, 4)
                ],
                systemMetrics: {
                    cpu: Math.random() * 30 + 20,
                    memory: Math.random() * 20 + 40,
                    network: Math.random() * 50 + 30,
                    storage: Math.random() * 10 + 60
                }
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'message': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
            case 'analysis': return <SignalIcon className="w-4 h-4" />;
            case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <CheckCircleIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <SignalIcon className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">실시간 모니터링</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(monitoringData.systemStatus)}`}>
                        <div className={`w-2 h-2 rounded-full ${monitoringData.systemStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm font-medium">
                            {monitoringData.systemStatus === 'online' ? '정상' : '주의'}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <WifiIcon className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="text-sm text-gray-600">
                            {isConnected ? '연결됨' : '연결 끊김'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 시스템 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">활성 연결</p>
                            <p className="text-2xl font-bold text-blue-900">{monitoringData.activeConnections}</p>
                        </div>
                        <UserIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">메시지 큐</p>
                            <p className="text-2xl font-bold text-green-900">{monitoringData.messageQueue}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">응답 시간</p>
                            <p className="text-2xl font-bold text-purple-900">{monitoringData.responseTime.toFixed(1)}s</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">오류율</p>
                            <p className="text-2xl font-bold text-red-900">{monitoringData.errorRate.toFixed(2)}%</p>
                        </div>
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* 시스템 메트릭스 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ServerIcon className="w-5 h-5 text-gray-600 mr-2" />
                        시스템 리소스
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>CPU 사용률</span>
                                <span>{monitoringData.systemMetrics.cpu.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${monitoringData.systemMetrics.cpu}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>메모리 사용률</span>
                                <span>{monitoringData.systemMetrics.memory.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${monitoringData.systemMetrics.memory}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>네트워크 사용률</span>
                                <span>{monitoringData.systemMetrics.network.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${monitoringData.systemMetrics.network}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>저장소 사용률</span>
                                <span>{monitoringData.systemMetrics.storage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${monitoringData.systemMetrics.storage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {monitoringData.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                <div className={`${getSeverityColor(activity.severity)}`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                                        activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {activity.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 알림 및 권장사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    시스템 알림
                </h3>
                <div className="space-y-2 text-yellow-800">
                    <p>• <strong>정상 운영:</strong> 모든 시스템이 정상적으로 작동하고 있습니다.</p>
                    <p>• <strong>성능 최적화:</strong> 응답 시간이 평균 2.1초로 양호한 수준입니다.</p>
                    <p>• <strong>리소스 모니터링:</strong> CPU 사용률이 35% 이하로 안정적입니다.</p>
                    <p>• <strong>네트워크 상태:</strong> 네트워크 연결이 안정적으로 유지되고 있습니다.</p>
                </div>
            </div>
        </div>
    );
};

export default RealTimeMonitoring; 