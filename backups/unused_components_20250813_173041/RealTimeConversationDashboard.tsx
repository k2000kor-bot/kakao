import React, { useState, useEffect } from 'react';

interface RealTimeConversationDashboardProps {
    selectedRoomId?: string;
}

const RealTimeConversationDashboard: React.FC<RealTimeConversationDashboardProps> = ({ selectedRoomId = 'room-1' }) => {
    const [stats, setStats] = useState({
        totalMessages: 0,
        activeUsers: 0,
        responseTime: 0,
        sentiment: 'neutral'
    });

    useEffect(() => {
        // 실시간 통계 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setStats({
                totalMessages: Math.floor(Math.random() * 100) + 50,
                activeUsers: Math.floor(Math.random() * 10) + 1,
                responseTime: Math.floor(Math.random() * 1000) + 100,
                sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="real-time-dashboard">
            <div className="dashboard-header">
                <h2>📊 실시간 대시보드</h2>
                <p>채팅방: {selectedRoomId}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>총 메시지</h3>
                    <div className="stat-value">{stats.totalMessages}</div>
                </div>

                <div className="stat-card">
                    <h3>활성 사용자</h3>
                    <div className="stat-value">{stats.activeUsers}</div>
                </div>

                <div className="stat-card">
                    <h3>응답 시간</h3>
                    <div className="stat-value">{stats.responseTime}ms</div>
                </div>

                <div className="stat-card">
                    <h3>감정 분석</h3>
                    <div className="stat-value">{stats.sentiment}</div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeConversationDashboard; 