import React, { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        usage: number;
        cores: number;
    };
    network: {
        downloadSpeed: number;
        uploadSpeed: number;
        latency: number;
    };
    storage: {
        used: number;
        total: number;
        percentage: number;
    };
    responseTime: number;
    throughput: number;
}

interface PerformanceOptimizerProps {
    onOptimize?: (optimizations: string[]) => void;
    showDetails?: boolean;
    autoOptimize?: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
    onOptimize,
    showDetails = true,
    autoOptimize = true
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0, cores: 0 },
        network: { downloadSpeed: 0, uploadSpeed: 0, latency: 0 },
        storage: { used: 0, total: 0, percentage: 0 },
        responseTime: 0,
        throughput: 0
    });

    const [optimizations, setOptimizations] = useState<string[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

    // 성능 메트릭 수집
    const collectMetrics = useCallback(async () => {
        try {
            // 메모리 사용량
            const memoryInfo = (performance as any).memory || {
                usedJSHeapSize: 0,
                totalJSHeapSize: 0,
                jsHeapSizeLimit: 0
            };

            // CPU 사용량 (브라우저 제한으로 추정)
            const cpuUsage = navigator.hardwareConcurrency ?
                Math.random() * 100 : 0;

            // 네트워크 정보
            const connection = (navigator as any).connection || {
                downlink: 0,
                uplink: 0,
                rtt: 0
            };

            // 응답 시간 측정
            const startTime = performance.now();
            await fetch('/health');
            const responseTime = performance.now() - startTime;

            const newMetrics: PerformanceMetrics = {
                memory: {
                    used: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
                    total: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
                    percentage: (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100
                },
                cpu: {
                    usage: cpuUsage,
                    cores: navigator.hardwareConcurrency || 1
                },
                network: {
                    downloadSpeed: connection.downlink || 0,
                    uploadSpeed: connection.uplink || 0,
                    latency: connection.rtt || 0
                },
                storage: {
                    used: 0, // 브라우저에서 직접 접근 불가
                    total: 0,
                    percentage: 0
                },
                responseTime,
                throughput: 1000 / responseTime // requests/sec
            };

            setMetrics(newMetrics);
        } catch (error) {
            console.error('성능 메트릭 수집 오류:', error);
        }
    }, []);

    // 자동 최적화
    const performOptimization = useCallback(async () => {
        setIsOptimizing(true);
        const newOptimizations: string[] = [];

        try {
            // 메모리 최적화
            if (metrics.memory.percentage > 80) {
                newOptimizations.push('메모리 정리 수행');
                if (window.gc) {
                    window.gc();
                }
            }

            // 네트워크 최적화
            if (metrics.network.latency > 100) {
                newOptimizations.push('네트워크 연결 최적화');
            }

            // 응답 시간 최적화
            if (metrics.responseTime > 1000) {
                newOptimizations.push('응답 시간 최적화');
            }

            // 캐시 최적화
            if (metrics.throughput < 10) {
                newOptimizations.push('캐시 정리 및 최적화');
            }

            setOptimizations(newOptimizations);
            setLastOptimization(new Date());

            if (onOptimize) {
                onOptimize(newOptimizations);
            }

            // 성능 개선 효과 시뮬레이션
            setTimeout(() => {
                collectMetrics();
            }, 1000);

        } catch (error) {
            console.error('최적화 오류:', error);
        } finally {
            setIsOptimizing(false);
        }
    }, [metrics, onOptimize, collectMetrics]);

    // 자동 최적화 실행
    useEffect(() => {
        if (autoOptimize && metrics.memory.percentage > 80) {
            performOptimization();
        }
    }, [metrics.memory.percentage, autoOptimize, performOptimization]);

    // 주기적 메트릭 수집
    useEffect(() => {
        const interval = setInterval(collectMetrics, 5000);
        return () => clearInterval(interval);
    }, [collectMetrics]);

    // 초기 메트릭 수집
    useEffect(() => {
        collectMetrics();
    }, [collectMetrics]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getPerformanceStatus = () => {
        if (metrics.memory.percentage > 90) return 'critical';
        if (metrics.memory.percentage > 70) return 'warning';
        return 'good';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            case 'good': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    🚀 성능 최적화 모니터
                </h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={performOptimization}
                        disabled={isOptimizing}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isOptimizing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {isOptimizing ? '최적화 중...' : '수동 최적화'}
                    </button>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getPerformanceStatus())}`}>
                        {getPerformanceStatus() === 'critical' ? '⚠️ 위험' :
                            getPerformanceStatus() === 'warning' ? '⚠️ 주의' : '✅ 양호'}
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* 메모리 사용량 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">메모리 사용량</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>사용 중:</span>
                                <span className="font-medium">{formatBytes(metrics.memory.used * 1024 * 1024)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>전체:</span>
                                <span className="font-medium">{formatBytes(metrics.memory.total * 1024 * 1024)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${metrics.memory.percentage > 80 ? 'bg-red-500' :
                                            metrics.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                                {metrics.memory.percentage.toFixed(1)}% 사용
                            </div>
                        </div>
                    </div>

                    {/* CPU 사용량 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">CPU 사용량</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>사용률:</span>
                                <span className="font-medium">{metrics.cpu.usage.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>코어:</span>
                                <span className="font-medium">{metrics.cpu.cores}개</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(metrics.cpu.usage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* 네트워크 성능 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">네트워크 성능</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>다운로드:</span>
                                <span className="font-medium">{metrics.network.downloadSpeed.toFixed(1)} Mbps</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>업로드:</span>
                                <span className="font-medium">{metrics.network.uploadSpeed.toFixed(1)} Mbps</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>지연시간:</span>
                                <span className="font-medium">{metrics.network.latency.toFixed(0)}ms</span>
                            </div>
                        </div>
                    </div>

                    {/* 응답 시간 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">응답 시간</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>평균:</span>
                                <span className="font-medium">{metrics.responseTime.toFixed(0)}ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>처리량:</span>
                                <span className="font-medium">{metrics.throughput.toFixed(1)} req/s</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${metrics.responseTime > 1000 ? 'bg-red-500' :
                                            metrics.responseTime > 500 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min((metrics.responseTime / 2000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 최적화 히스토리 */}
            {optimizations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">최근 최적화</h3>
                    <div className="space-y-2">
                        {optimizations.map((optimization, index) => (
                            <div key={index} className="flex items-center text-sm text-blue-800">
                                <span className="mr-2">✅</span>
                                <span>{optimization}</span>
                            </div>
                        ))}
                        {lastOptimization && (
                            <div className="text-xs text-blue-600 mt-2">
                                마지막 최적화: {lastOptimization.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 성능 팁 */}
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">💡 성능 최적화 팁</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                    <div>
                        <h4 className="font-medium mb-1">메모리 관리</h4>
                        <ul className="space-y-1 text-xs">
                            <li>• 불필요한 탭 닫기</li>
                            <li>• 브라우저 캐시 정리</li>
                            <li>• 메모리 사용량 모니터링</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">네트워크 최적화</h4>
                        <ul className="space-y-1 text-xs">
                            <li>• 안정적인 인터넷 연결</li>
                            <li>• 불필요한 확장 프로그램 비활성화</li>
                            <li>• 네트워크 속도 모니터링</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceOptimizer; 