import React, { useState, useEffect } from 'react';
import { performanceMonitoringService } from '../services/performanceMonitoringService';
import {
    ChartBarIcon,
    CpuChipIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface PerformanceMetrics {
    avgResponseTime: number;
    avgMemoryUsage: number;
    errorRate: number;
    throughput: number;
    userSatisfaction: number;
}

interface PerformanceReport {
    summary: PerformanceMetrics;
    recommendations: string[];
    trends: {
        responseTime: number[];
        memoryUsage: number[];
        userSatisfaction: number[];
    };
}

const PerformanceDashboard: React.FC = () => {
    const [performanceData, setPerformanceData] = useState<PerformanceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        updatePerformanceData();

        if (autoRefresh) {
            const interval = setInterval(updatePerformanceData, 10000); // 10초마다 업데이트
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const updatePerformanceData = () => {
        try {
            const report = performanceMonitoringService.generatePerformanceReport();
            setPerformanceData(report);
            setIsLoading(false);
        } catch (error) {
            console.error('성능 데이터 조회 실패:', error);
            setIsLoading(false);
        }
    };

    const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
        if (value <= thresholds.good) return 'text-green-600 bg-green-100';
        if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
        if (value <= thresholds.good) return <CheckCircleIcon className="w-5 h-5" />;
        if (value <= thresholds.warning) return <ExclamationTriangleIcon className="w-5 h-5" />;
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    };

    const formatNumber = (value: number, unit: string = ''): string => {
        if (value < 1000) return `${value.toFixed(1)}${unit}`;
        if (value < 1000000) return `${(value / 1000).toFixed(1)}K${unit}`;
        return `${(value / 1000000).toFixed(1)}M${unit}`;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!performanceData) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center text-gray-500">
                    <CpuChipIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>성능 데이터를 불러올 수 없습니다</p>
                </div>
            </div>
        );
    }

    const { summary, recommendations } = performanceData;

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <SparklesIcon className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">성능 대시보드</h2>
                            <p className="text-gray-600">실시간 시스템 성능 모니터링</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">자동 새로고침</span>
                        </label>
                        <button
                            onClick={updatePerformanceData}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            </div>

            {/* 성능 메트릭 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 응답 시간 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">응답 시간</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(summary.avgResponseTime, 'ms')}
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${getStatusColor(summary.avgResponseTime, { good: 500, warning: 1000 })}`}>
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        {getStatusIcon(summary.avgResponseTime, { good: 500, warning: 1000 })}
                        <span className="ml-1 text-sm text-gray-600">
                            {summary.avgResponseTime <= 500 ? '매우 빠름' :
                                summary.avgResponseTime <= 1000 ? '보통' : '느림'}
                        </span>
                    </div>
                </div>

                {/* 메모리 사용량 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">메모리 사용량</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(summary.avgMemoryUsage * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${getStatusColor(summary.avgMemoryUsage, { good: 0.5, warning: 0.7 })}`}>
                            <CpuChipIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        {getStatusIcon(summary.avgMemoryUsage, { good: 0.5, warning: 0.7 })}
                        <span className="ml-1 text-sm text-gray-600">
                            {summary.avgMemoryUsage <= 0.5 ? '낮음' :
                                summary.avgMemoryUsage <= 0.7 ? '보통' : '높음'}
                        </span>
                    </div>
                </div>

                {/* 오류율 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">오류율</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(summary.errorRate * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${getStatusColor(summary.errorRate, { good: 0.01, warning: 0.05 })}`}>
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        {getStatusIcon(summary.errorRate, { good: 0.01, warning: 0.05 })}
                        <span className="ml-1 text-sm text-gray-600">
                            {summary.errorRate <= 0.01 ? '매우 낮음' :
                                summary.errorRate <= 0.05 ? '보통' : '높음'}
                        </span>
                    </div>
                </div>

                {/* 처리량 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">처리량</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(summary.throughput, '/분')}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        <span className="ml-1 text-sm text-gray-600">분당 요청 수</span>
                    </div>
                </div>

                {/* 사용자 만족도 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">사용자 만족도</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(summary.userSatisfaction * 100).toFixed(0)}%
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${getStatusColor(1 - summary.userSatisfaction, { good: 0.2, warning: 0.3 })}`}>
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center">
                        {getStatusIcon(1 - summary.userSatisfaction, { good: 0.2, warning: 0.3 })}
                        <span className="ml-1 text-sm text-gray-600">
                            {summary.userSatisfaction >= 0.8 ? '우수' :
                                summary.userSatisfaction >= 0.7 ? '보통' : '개선 필요'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 권장사항 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 개선 권장사항</h3>
                <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${recommendation.includes('원활') ? 'bg-green-500' : 'bg-yellow-500'
                                }`}></div>
                            <p className="text-gray-700">{recommendation}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 트렌드 차트 (간단한 시각화) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 트렌드</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 응답 시간 트렌드 */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">응답 시간</h4>
                        <div className="h-20 flex items-end space-x-1">
                            {performanceData.trends.responseTime.slice(-10).map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-blue-500 w-full rounded-t"
                                    style={{
                                        height: `${Math.min(100, (value / 2000) * 100)}%`,
                                        minHeight: '4px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* 메모리 사용량 트렌드 */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">메모리 사용량</h4>
                        <div className="h-20 flex items-end space-x-1">
                            {performanceData.trends.memoryUsage.slice(-10).map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-yellow-500 w-full rounded-t"
                                    style={{
                                        height: `${value * 100}%`,
                                        minHeight: '4px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* 사용자 만족도 트렌드 */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">사용자 만족도</h4>
                        <div className="h-20 flex items-end space-x-1">
                            {performanceData.trends.userSatisfaction.slice(-10).map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-green-500 w-full rounded-t"
                                    style={{
                                        height: `${value * 100}%`,
                                        minHeight: '4px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
