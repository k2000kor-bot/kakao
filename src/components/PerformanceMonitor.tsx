import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
    timestamp: number;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
}

interface PerformanceAlert {
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    metric: string;
    value: number;
    threshold: number;
}

interface PerformanceMonitorProps {
    onAlert: (alert: PerformanceAlert) => void;
    onOptimization: (recommendation: string) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
    onAlert,
    onOptimization
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
    const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
    const [optimizationRecommendations, setOptimizationRecommendations] = useState<string[]>([]);
    const [performanceScore, setPerformanceScore] = useState(95);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 성능 임계값 설정
    const thresholds = {
        cpuUsage: 80,
        memoryUsage: 85,
        responseTime: 2000,
        errorRate: 5,
        activeConnections: 1000
    };

    // 성능 메트릭 생성 (시뮬레이션)
    const generateMetrics = (): PerformanceMetrics => {
        const baseCPU = 30 + Math.random() * 40; // 30-70%
        const baseMemory = 40 + Math.random() * 30; // 40-70%
        const baseResponseTime = 500 + Math.random() * 1500; // 500-2000ms
        const baseThroughput = 100 + Math.random() * 200; // 100-300 req/s
        const baseErrorRate = Math.random() * 3; // 0-3%
        const baseConnections = 50 + Math.random() * 100; // 50-150

        return {
            timestamp: Date.now(),
            cpuUsage: Math.round(baseCPU * 10) / 10,
            memoryUsage: Math.round(baseMemory * 10) / 10,
            responseTime: Math.round(baseResponseTime),
            throughput: Math.round(baseThroughput * 10) / 10,
            errorRate: Math.round(baseErrorRate * 100) / 100,
            activeConnections: Math.round(baseConnections)
        };
    };

    // 성능 점수 계산
    const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
        let score = 100;

        // CPU 사용률 체크
        if (metrics.cpuUsage > thresholds.cpuUsage) {
            score -= (metrics.cpuUsage - thresholds.cpuUsage) * 2;
        }

        // 메모리 사용률 체크
        if (metrics.memoryUsage > thresholds.memoryUsage) {
            score -= (metrics.memoryUsage - thresholds.memoryUsage) * 2;
        }

        // 응답 시간 체크
        if (metrics.responseTime > thresholds.responseTime) {
            score -= (metrics.responseTime - thresholds.responseTime) / 100;
        }

        // 오류율 체크
        if (metrics.errorRate > thresholds.errorRate) {
            score -= metrics.errorRate * 10;
        }

        return Math.max(0, Math.round(score));
    };

    // 성능 알림 생성
    const checkAlerts = (metrics: PerformanceMetrics) => {
        const newAlerts: PerformanceAlert[] = [];

        if (metrics.cpuUsage > thresholds.cpuUsage) {
            newAlerts.push({
                id: Date.now().toString(),
                type: metrics.cpuUsage > 90 ? 'critical' : 'warning',
                message: `CPU 사용률이 높습니다: ${metrics.cpuUsage}%`,
                timestamp: new Date().toLocaleString(),
                metric: 'CPU Usage',
                value: metrics.cpuUsage,
                threshold: thresholds.cpuUsage
            });
        }

        if (metrics.memoryUsage > thresholds.memoryUsage) {
            newAlerts.push({
                id: (Date.now() + 1).toString(),
                type: metrics.memoryUsage > 95 ? 'critical' : 'warning',
                message: `메모리 사용률이 높습니다: ${metrics.memoryUsage}%`,
                timestamp: new Date().toLocaleString(),
                metric: 'Memory Usage',
                value: metrics.memoryUsage,
                threshold: thresholds.memoryUsage
            });
        }

        if (metrics.responseTime > thresholds.responseTime) {
            newAlerts.push({
                id: (Date.now() + 2).toString(),
                type: 'warning',
                message: `응답 시간이 느립니다: ${metrics.responseTime}ms`,
                timestamp: new Date().toLocaleString(),
                metric: 'Response Time',
                value: metrics.responseTime,
                threshold: thresholds.responseTime
            });
        }

        if (metrics.errorRate > thresholds.errorRate) {
            newAlerts.push({
                id: (Date.now() + 3).toString(),
                type: 'error',
                message: `오류율이 높습니다: ${metrics.errorRate}%`,
                timestamp: new Date().toLocaleString(),
                metric: 'Error Rate',
                value: metrics.errorRate,
                threshold: thresholds.errorRate
            });
        }

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // 최대 10개 유지
            newAlerts.forEach(alert => onAlert(alert));
        }
    };

    // 최적화 권장사항 생성
    const generateOptimizationRecommendations = (metrics: PerformanceMetrics): string[] => {
        const recommendations: string[] = [];

        if (metrics.cpuUsage > 70) {
            recommendations.push('CPU 사용률이 높습니다. 서버 리소스를 확장하거나 작업을 분산하세요.');
        }

        if (metrics.memoryUsage > 80) {
            recommendations.push('메모리 사용률이 높습니다. 메모리 누수를 확인하고 캐시를 최적화하세요.');
        }

        if (metrics.responseTime > 1500) {
            recommendations.push('응답 시간이 느립니다. 데이터베이스 쿼리를 최적화하고 CDN을 사용하세요.');
        }

        if (metrics.errorRate > 2) {
            recommendations.push('오류율이 높습니다. 로그를 확인하고 오류 처리를 개선하세요.');
        }

        if (metrics.throughput < 150) {
            recommendations.push('처리량이 낮습니다. 서버 성능을 개선하고 로드 밸런싱을 고려하세요.');
        }

        if (recommendations.length === 0) {
            recommendations.push('시스템 성능이 양호합니다. 현재 상태를 유지하세요.');
        }

        return recommendations;
    };

    // 모니터링 시작/중지
    const toggleMonitoring = () => {
        if (isMonitoring) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsMonitoring(false);
        } else {
            setIsMonitoring(true);
            intervalRef.current = setInterval(() => {
                const newMetrics = generateMetrics();
                setCurrentMetrics(newMetrics);
                setMetrics(prev => [...prev.slice(-29), newMetrics]); // 최근 30개 유지

                const score = calculatePerformanceScore(newMetrics);
                setPerformanceScore(score);

                checkAlerts(newMetrics);

                const recommendations = generateOptimizationRecommendations(newMetrics);
                setOptimizationRecommendations(recommendations);
            }, 2000); // 2초마다 업데이트
        }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const getStatusColor = (value: number, threshold: number, reverse: boolean = false) => {
        const ratio = reverse ? threshold / value : value / threshold;
        if (ratio > 0.9) return '#dc2626'; // 빨강
        if (ratio > 0.7) return '#f59e0b'; // 주황
        return '#10b981'; // 초록
    };

    const getAlertTypeColor = (type: PerformanceAlert['type']) => {
        switch (type) {
            case 'warning': return '#f59e0b';
            case 'error': return '#dc2626';
            case 'critical': return '#7c2d12';
            default: return '#6b7280';
        }
    };

    return (
        <div className="performance-monitor">
            <div className="monitor-header">
                <h2>📊 성능 모니터링</h2>
                <div className="monitor-controls">
                    <button
                        className={`monitor-btn ${isMonitoring ? 'monitoring' : ''}`}
                        onClick={toggleMonitoring}
                    >
                        {isMonitoring ? '⏹️ 모니터링 중지' : '▶️ 모니터링 시작'}
                    </button>
                    <button
                        className="details-btn"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? '📋 간단 보기' : '📊 상세 보기'}
                    </button>
                </div>
            </div>

            {/* 성능 점수 */}
            <div className="performance-score">
                <div className="score-circle">
                    <div
                        className="score-value"
                        style={{
                            color: performanceScore > 80 ? '#10b981' :
                                performanceScore > 60 ? '#f59e0b' : '#dc2626'
                        }}
                    >
                        {performanceScore}
                    </div>
                    <div className="score-label">성능 점수</div>
                </div>
            </div>

            {/* 현재 메트릭 */}
            {currentMetrics && (
                <div className="current-metrics">
                    <h3>현재 상태</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">CPU 사용률</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getStatusColor(currentMetrics.cpuUsage, thresholds.cpuUsage) }}
                                >
                                    {currentMetrics.cpuUsage}%
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${currentMetrics.cpuUsage}%`,
                                        backgroundColor: getStatusColor(currentMetrics.cpuUsage, thresholds.cpuUsage)
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">메모리 사용률</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getStatusColor(currentMetrics.memoryUsage, thresholds.memoryUsage) }}
                                >
                                    {currentMetrics.memoryUsage}%
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${currentMetrics.memoryUsage}%`,
                                        backgroundColor: getStatusColor(currentMetrics.memoryUsage, thresholds.memoryUsage)
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">응답 시간</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getStatusColor(currentMetrics.responseTime, thresholds.responseTime, true) }}
                                >
                                    {currentMetrics.responseTime}ms
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${Math.min(100, (currentMetrics.responseTime / thresholds.responseTime) * 100)}%`,
                                        backgroundColor: getStatusColor(currentMetrics.responseTime, thresholds.responseTime, true)
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">처리량</span>
                                <span className="metric-value">
                                    {currentMetrics.throughput} req/s
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${Math.min(100, (currentMetrics.throughput / 300) * 100)}%`,
                                        backgroundColor: '#10b981'
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">오류율</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getStatusColor(currentMetrics.errorRate, thresholds.errorRate) }}
                                >
                                    {currentMetrics.errorRate}%
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${Math.min(100, (currentMetrics.errorRate / thresholds.errorRate) * 100)}%`,
                                        backgroundColor: getStatusColor(currentMetrics.errorRate, thresholds.errorRate)
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-label">활성 연결</span>
                                <span className="metric-value">
                                    {currentMetrics.activeConnections}
                                </span>
                            </div>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${Math.min(100, (currentMetrics.activeConnections / thresholds.activeConnections) * 100)}%`,
                                        backgroundColor: getStatusColor(currentMetrics.activeConnections, thresholds.activeConnections)
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 성능 알림 */}
            {alerts.length > 0 && (
                <div className="performance-alerts">
                    <h3>🚨 성능 알림</h3>
                    <div className="alerts-list">
                        {alerts.slice(0, 5).map(alert => (
                            <div key={alert.id} className="alert-item">
                                <div className="alert-header">
                                    <span
                                        className="alert-type"
                                        style={{ backgroundColor: getAlertTypeColor(alert.type) }}
                                    >
                                        {alert.type}
                                    </span>
                                    <span className="alert-time">{alert.timestamp}</span>
                                </div>
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-details">
                                    {alert.metric}: {alert.value} (임계값: {alert.threshold})
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 최적화 권장사항 */}
            {optimizationRecommendations.length > 0 && (
                <div className="optimization-recommendations">
                    <h3>💡 최적화 권장사항</h3>
                    <div className="recommendations-list">
                        {optimizationRecommendations.map((recommendation, index) => (
                            <div key={index} className="recommendation-item">
                                <span className="recommendation-icon">💡</span>
                                <span className="recommendation-text">{recommendation}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 상세 메트릭 차트 */}
            {showDetails && metrics.length > 0 && (
                <div className="detailed-metrics">
                    <h3>📈 상세 메트릭</h3>
                    <div className="metrics-chart">
                        <div className="chart-container">
                            {metrics.map((metric, index) => (
                                <div key={index} className="chart-point">
                                    <div
                                        className="cpu-point"
                                        style={{
                                            height: `${metric.cpuUsage}%`,
                                            backgroundColor: getStatusColor(metric.cpuUsage, thresholds.cpuUsage)
                                        }}
                                        title={`CPU: ${metric.cpuUsage}%`}
                                    ></div>
                                    <div
                                        className="memory-point"
                                        style={{
                                            height: `${metric.memoryUsage}%`,
                                            backgroundColor: getStatusColor(metric.memoryUsage, thresholds.memoryUsage)
                                        }}
                                        title={`Memory: ${metric.memoryUsage}%`}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            <span>CPU</span>
                            <span>Memory</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceMonitor;
