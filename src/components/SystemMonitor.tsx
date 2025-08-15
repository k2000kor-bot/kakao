import React, { useState, useEffect } from 'react';
import unifiedAPI from '../services/unifiedAPI';

interface SystemStats {
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
        requests: number;
        errors: number;
        responseTime: number;
    };
    uptime: number;
}

interface SystemMonitorProps {
    className?: string;
    showDetails?: boolean;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({
    className = '',
    showDetails = false
}) => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchSystemStats = async () => {
        setIsLoading(true);
        try {
            // 실제 시스템 정보를 가져오는 API 호출
            const response = await unifiedAPI.getSystemInfo();

            if (response.success && response.data) {
                // 시뮬레이션된 시스템 통계 (실제로는 백엔드에서 제공)
                const mockStats: SystemStats = {
                    memory: {
                        used: Math.floor(Math.random() * 2000) + 1000, // 1-3GB
                        total: 8192, // 8GB
                        percentage: Math.floor(Math.random() * 30) + 20 // 20-50%
                    },
                    cpu: {
                        usage: Math.floor(Math.random() * 40) + 10, // 10-50%
                        cores: 8
                    },
                    network: {
                        requests: Math.floor(Math.random() * 100) + 50,
                        errors: Math.floor(Math.random() * 5),
                        responseTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
                    },
                    uptime: Date.now() - (Math.floor(Math.random() * 3600000) + 1800000) // 30-90분
                };

                setStats(mockStats);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('시스템 통계 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemStats();

        // 10초마다 시스템 통계 업데이트
        const interval = setInterval(fetchSystemStats, 10000);

        return () => clearInterval(interval);
    }, []);

    const formatUptime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}시간 ${minutes}분`;
    };

    const getStatusColor = (percentage: number) => {
        if (percentage < 50) return '#10b981'; // 녹색
        if (percentage < 80) return '#f59e0b'; // 주황색
        return '#ef4444'; // 빨간색
    };

    if (isLoading && !stats) {
        return (
            <div className={`system-monitor loading ${className}`}>
                <div className="loading-spinner">⏳</div>
                <span>시스템 정보 로딩 중...</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={`system-monitor error ${className}`}>
                <span>❌ 시스템 정보를 불러올 수 없습니다</span>
                <button onClick={fetchSystemStats} className="retry-button">
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className={`system-monitor ${className}`}>
            <div className="monitor-header">
                <h3>시스템 모니터</h3>
                <span className="last-update">
                    {lastUpdate?.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </span>
            </div>

            <div className="monitor-grid">
                {/* 메모리 사용량 */}
                <div className="monitor-item">
                    <div className="monitor-label">
                        <span>💾 메모리</span>
                        <span className="monitor-value">
                            {stats.memory.percentage}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${stats.memory.percentage}%`,
                                backgroundColor: getStatusColor(stats.memory.percentage)
                            }}
                        />
                    </div>
                    <div className="monitor-details">
                        {showDetails && `${(stats.memory.used / 1024).toFixed(1)}GB / ${(stats.memory.total / 1024).toFixed(1)}GB`}
                    </div>
                </div>

                {/* CPU 사용량 */}
                <div className="monitor-item">
                    <div className="monitor-label">
                        <span>🖥️ CPU</span>
                        <span className="monitor-value">
                            {stats.cpu.usage}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${stats.cpu.usage}%`,
                                backgroundColor: getStatusColor(stats.cpu.usage)
                            }}
                        />
                    </div>
                    <div className="monitor-details">
                        {showDetails && `${stats.cpu.cores}코어`}
                    </div>
                </div>

                {/* 네트워크 상태 */}
                <div className="monitor-item">
                    <div className="monitor-label">
                        <span>🌐 네트워크</span>
                        <span className="monitor-value">
                            {stats.network.responseTime}ms
                        </span>
                    </div>
                    <div className="network-stats">
                        <span className="stat-item">요청: {stats.network.requests}</span>
                        <span className="stat-item">오류: {stats.network.errors}</span>
                    </div>
                </div>

                {/* 가동 시간 */}
                <div className="monitor-item">
                    <div className="monitor-label">
                        <span>⏱️ 가동시간</span>
                    </div>
                    <div className="uptime">
                        {formatUptime(stats.uptime)}
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="monitor-actions">
                    <button onClick={fetchSystemStats} className="refresh-button">
                        🔄 새로고침
                    </button>
                </div>
            )}
        </div>
    );
};

export default SystemMonitor;
