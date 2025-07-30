import React, { useState, useEffect } from 'react';

interface PerformanceMonitorProps {
    onClose?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ onClose }) => {
    const [performance, setPerformance] = useState({
        cpu: 0,
        memory: 0,
        responseTime: 0,
        activeConnections: 0,
        errorRate: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setPerformance({
                cpu: Math.floor(Math.random() * 30) + 10,
                memory: Math.floor(Math.random() * 40) + 20,
                responseTime: Math.floor(Math.random() * 500) + 100,
                activeConnections: Math.floor(Math.random() * 20) + 1,
                errorRate: Math.random() * 2
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="performance-monitor">
            <div className="monitor-header">
                <h2>⚡ 성능 모니터</h2>
                <p>실시간 시스템 성능 모니터링</p>
            </div>

            <div className="performance-grid">
                <div className="performance-card">
                    <h3>CPU 사용률</h3>
                    <div className="performance-value">{performance.cpu}%</div>
                    <div className="performance-bar">
                        <div
                            className="performance-fill"
                            style={{ width: `${performance.cpu}%` }}
                        ></div>
                    </div>
                </div>

                <div className="performance-card">
                    <h3>메모리 사용률</h3>
                    <div className="performance-value">{performance.memory}%</div>
                    <div className="performance-bar">
                        <div
                            className="performance-fill"
                            style={{ width: `${performance.memory}%` }}
                        ></div>
                    </div>
                </div>

                <div className="performance-card">
                    <h3>응답 시간</h3>
                    <div className="performance-value">{performance.responseTime}ms</div>
                    <div className="performance-status">
                        {performance.responseTime < 200 ? '🟢 양호' :
                            performance.responseTime < 500 ? '🟡 보통' : '🔴 느림'}
                    </div>
                </div>

                <div className="performance-card">
                    <h3>활성 연결</h3>
                    <div className="performance-value">{performance.activeConnections}</div>
                    <div className="performance-status">연결됨</div>
                </div>

                <div className="performance-card">
                    <h3>오류율</h3>
                    <div className="performance-value">{performance.errorRate.toFixed(2)}%</div>
                    <div className="performance-status">
                        {performance.errorRate < 1 ? '🟢 정상' :
                            performance.errorRate < 3 ? '🟡 주의' : '🔴 위험'}
                    </div>
                </div>
            </div>

            {onClose && (
                <button onClick={onClose} className="close-button">
                    닫기
                </button>
            )}
        </div>
    );
};

export default PerformanceMonitor; 