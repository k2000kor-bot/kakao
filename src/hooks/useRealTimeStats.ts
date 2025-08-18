import { useState, useEffect, useCallback } from 'react';

interface RealTimeStats {
    activeUsers: number;
    totalProjects: number;
    totalFiles: number;
    totalMessages: number;
    systemLoad: number;
    memoryUsage: number;
    responseTime: number;
    uptime: number;
}

interface StatsHistory {
    timestamp: number;
    stats: RealTimeStats;
}

export const useRealTimeStats = () => {
    const [currentStats, setCurrentStats] = useState<RealTimeStats>({
        activeUsers: 1,
        totalProjects: 0,
        totalFiles: 0,
        totalMessages: 0,
        systemLoad: 0.45,
        memoryUsage: 45,
        responseTime: 200,
        uptime: 0
    });

    const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
    const [isConnected, setIsConnected] = useState(true);

    // 실시간 통계 업데이트 (시뮬레이션)
    const updateStats = useCallback(() => {
        const now = Date.now();

        // 랜덤 변동을 주어 실시간 느낌 생성
        const newStats: RealTimeStats = {
            activeUsers: Math.max(1, currentStats.activeUsers + Math.floor(Math.random() * 3) - 1),
            totalProjects: currentStats.totalProjects + Math.floor(Math.random() * 2),
            totalFiles: currentStats.totalFiles + Math.floor(Math.random() * 5),
            totalMessages: currentStats.totalMessages + Math.floor(Math.random() * 10),
            systemLoad: Math.max(0.1, Math.min(0.9, currentStats.systemLoad + (Math.random() - 0.5) * 0.1)),
            memoryUsage: Math.max(20, Math.min(80, currentStats.memoryUsage + (Math.random() - 0.5) * 5)),
            responseTime: Math.max(50, Math.min(500, currentStats.responseTime + (Math.random() - 0.5) * 50)),
            uptime: currentStats.uptime + 1
        };

        setCurrentStats(newStats);

        // 히스토리 업데이트 (최근 60개 데이터 유지)
        setStatsHistory(prev => {
            const newHistory = [...prev, { timestamp: now, stats: newStats }];
            return newHistory.slice(-60);
        });
    }, [currentStats]);

    // 초기 통계 로드
    const loadInitialStats = useCallback(async () => {
        try {
            // 실제 API 호출 시뮬레이션
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setCurrentStats(data);
            }
        } catch (error) {
            console.log('[Stats] 초기 통계 로드 실패, 기본값 사용');
            // 기본값 사용
        }
    }, []);

    // 실시간 업데이트 시작
    useEffect(() => {
        loadInitialStats();

        const interval = setInterval(() => {
            if (isConnected) {
                updateStats();
            }
        }, 5000); // 5초마다 업데이트

        return () => clearInterval(interval);
    }, [loadInitialStats, updateStats, isConnected]);

    // 연결 상태 토글
    const toggleConnection = useCallback(() => {
        setIsConnected(!isConnected);
    }, [isConnected]);

    // 통계 리셋
    const resetStats = useCallback(() => {
        setCurrentStats({
            activeUsers: 1,
            totalProjects: 0,
            totalFiles: 0,
            totalMessages: 0,
            systemLoad: 0.45,
            memoryUsage: 45,
            responseTime: 200,
            uptime: 0
        });
        setStatsHistory([]);
    }, []);

    // 성능 지표 계산
    const getPerformanceMetrics = useCallback(() => {
        const avgResponseTime = statsHistory.length > 0
            ? statsHistory.reduce((sum, item) => sum + item.stats.responseTime, 0) / statsHistory.length
            : currentStats.responseTime;

        const avgSystemLoad = statsHistory.length > 0
            ? statsHistory.reduce((sum, item) => sum + item.stats.systemLoad, 0) / statsHistory.length
            : currentStats.systemLoad;

        return {
            avgResponseTime: Math.round(avgResponseTime),
            avgSystemLoad: Math.round(avgSystemLoad * 100) / 100,
            dataPoints: statsHistory.length
        };
    }, [statsHistory, currentStats]);

    return {
        currentStats,
        statsHistory,
        isConnected,
        toggleConnection,
        resetStats,
        getPerformanceMetrics
    };
};
