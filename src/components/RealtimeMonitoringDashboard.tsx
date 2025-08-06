import React, { useState, useEffect } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';
import './RealtimeMonitoringDashboard.css';

interface RealtimeMonitoringDashboardProps {
    conversationId?: string;
}

interface MonitoringStatus {
    user_id: string;
    start_time: string;
    message_count: number;
    last_message_time: string | null;
    current_emotion: string;
    engagement_score: number;
    status: string;
}

interface MonitoringEvent {
    event_id: string;
    conversation_id: string;
    user_id: string;
    event_type: string;
    timestamp: string;
    data: any;
    severity: string;
}

interface PredictionResult {
    prediction_id: string;
    conversation_id: string;
    prediction_type: string;
    confidence: number;
    predicted_value: any;
    timestamp: string;
    reasoning: string;
}

interface SystemStats {
    active_conversations: number;
    total_events: number;
    total_predictions: number;
    monitoring_callbacks: number;
}

const RealtimeMonitoringDashboard: React.FC<RealtimeMonitoringDashboardProps> = ({
    conversationId
}) => {
    const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null);
    const [events, setEvents] = useState<MonitoringEvent[]>([]);
    const [predictions, setPredictions] = useState<PredictionResult[]>([]);
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (conversationId) {
            loadMonitoringData();
        }
        loadSystemStats();

        // 자동 새로고침 설정
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(() => {
                if (conversationId) {
                    loadMonitoringData();
                }
                loadSystemStats();
            }, 5000); // 5초마다 새로고침
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [conversationId, autoRefresh]);

    const loadMonitoringData = async () => {
        if (!conversationId) return;

        setIsLoading(true);
        setError(null);

        try {
            // 모니터링 상태 조회
            const statusResponse = await advancedMessageAPI.getConversationMonitoringStatus(conversationId);
            if (statusResponse.success && statusResponse.data) {
                setMonitoringStatus(statusResponse.data);
            }

            // 이벤트 조회
            const eventsResponse = await advancedMessageAPI.getConversationEvents(conversationId, 20);
            if (eventsResponse.success && eventsResponse.data) {
                setEvents(eventsResponse.data);
            }

            // 예측 결과 조회
            const predictionsResponse = await advancedMessageAPI.getConversationPredictions(conversationId, 10);
            if (predictionsResponse.success && predictionsResponse.data) {
                setPredictions(predictionsResponse.data);
            }

        } catch (err) {
            console.error('모니터링 데이터 로드 실패:', err);
            setError('모니터링 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSystemStats = async () => {
        try {
            const response = await advancedMessageAPI.getMonitoringSystemStats();
            if (response.success && response.stats) {
                setSystemStats(response.stats);
            }
        } catch (err) {
            console.error('시스템 통계 로드 실패:', err);
        }
    };

    const handleStopMonitoring = async () => {
        if (!conversationId) return;

        if (window.confirm('대화 모니터링을 중지하시겠습니까?')) {
            try {
                await advancedMessageAPI.stopConversationMonitoring(conversationId);
                alert('대화 모니터링이 중지되었습니다.');
                setMonitoringStatus(null);
            } catch (err) {
                console.error('모니터링 중지 실패:', err);
                alert('모니터링 중지 중 오류가 발생했습니다.');
            }
        }
    };

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            low: '#4CAF50',
            normal: '#2196F3',
            high: '#FF9800',
            critical: '#F44336'
        };
        return colors[severity] || '#9E9E9E';
    };

    const getEventTypeIcon = (eventType: string) => {
        const icons: Record<string, string> = {
            message: '💬',
            emotion_change: '😊',
            topic_shift: '🔄',
            engagement_drop: '📉',
            slow_response: '⏰',
            conversation_end: '🏁'
        };
        return icons[eventType] || '📊';
    };

    const getPredictionTypeIcon = (predictionType: string) => {
        const icons: Record<string, string> = {
            engagement: '📈',
            emotion: '😊',
            topic: '🏷️',
            quality: '⭐'
        };
        return icons[predictionType] || '🔮';
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    if (isLoading) {
        return (
            <div className="realtime-monitoring-dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>모니터링 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="realtime-monitoring-dashboard">
                <div className="error-message">
                    <span>❌ {error}</span>
                    <button onClick={loadMonitoringData}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="realtime-monitoring-dashboard">
            <div className="dashboard-header">
                <h3>📊 실시간 모니터링 대시보드</h3>
                <div className="header-controls">
                    <label className="auto-refresh-toggle">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>자동 새로고침</span>
                    </label>
                    <button onClick={loadMonitoringData} className="refresh-btn">
                        🔄 새로고침
                    </button>
                    {conversationId && (
                        <button onClick={handleStopMonitoring} className="stop-btn">
                            ⏹️ 모니터링 중지
                        </button>
                    )}
                </div>
            </div>

            {/* 시스템 통계 */}
            {systemStats && (
                <div className="system-stats-section">
                    <h4>🖥️ 시스템 통계</h4>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon">💬</span>
                            <span className="stat-value">{systemStats.active_conversations}</span>
                            <span className="stat-label">활성 대화</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">📊</span>
                            <span className="stat-value">{systemStats.total_events}</span>
                            <span className="stat-label">총 이벤트</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🔮</span>
                            <span className="stat-value">{systemStats.total_predictions}</span>
                            <span className="stat-label">총 예측</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">⚙️</span>
                            <span className="stat-value">{systemStats.monitoring_callbacks}</span>
                            <span className="stat-label">콜백</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 모니터링 상태 */}
            {monitoringStatus && (
                <div className="monitoring-status-section">
                    <h4>📈 모니터링 상태</h4>
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="label">사용자 ID:</span>
                            <span className="value">{monitoringStatus.user_id}</span>
                        </div>
                        <div className="status-item">
                            <span className="label">시작 시간:</span>
                            <span className="value">{formatTimestamp(monitoringStatus.start_time)}</span>
                        </div>
                        <div className="status-item">
                            <span className="label">메시지 수:</span>
                            <span className="value">{monitoringStatus.message_count}</span>
                        </div>
                        <div className="status-item">
                            <span className="label">현재 감정:</span>
                            <span className="value emotion-tag">{monitoringStatus.current_emotion}</span>
                        </div>
                        <div className="status-item">
                            <span className="label">참여도 점수:</span>
                            <span className="value">{(monitoringStatus.engagement_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="status-item">
                            <span className="label">상태:</span>
                            <span className={`value status-tag ${monitoringStatus.status}`}>
                                {monitoringStatus.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 실시간 이벤트 */}
            {events.length > 0 && (
                <div className="events-section">
                    <h4>📋 실시간 이벤트</h4>
                    <div className="events-list">
                        {events.map((event) => (
                            <div key={event.event_id} className="event-item">
                                <div className="event-header">
                                    <span className="event-icon">{getEventTypeIcon(event.event_type)}</span>
                                    <span className="event-type">{event.event_type}</span>
                                    <span
                                        className="severity-tag"
                                        style={{ backgroundColor: getSeverityColor(event.severity) }}
                                    >
                                        {event.severity}
                                    </span>
                                    <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                                </div>
                                <div className="event-data">
                                    <pre>{JSON.stringify(event.data, null, 2)}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 예측 결과 */}
            {predictions.length > 0 && (
                <div className="predictions-section">
                    <h4>🔮 예측 결과</h4>
                    <div className="predictions-list">
                        {predictions.map((prediction) => (
                            <div key={prediction.prediction_id} className="prediction-item">
                                <div className="prediction-header">
                                    <span className="prediction-icon">{getPredictionTypeIcon(prediction.prediction_type)}</span>
                                    <span className="prediction-type">{prediction.prediction_type}</span>
                                    <span className="confidence-score">{(prediction.confidence * 100).toFixed(1)}%</span>
                                    <span className="prediction-time">{formatTimestamp(prediction.timestamp)}</span>
                                </div>
                                <div className="prediction-content">
                                    <div className="predicted-value">
                                        <span className="label">예측값:</span>
                                        <span className="value">{String(prediction.predicted_value)}</span>
                                    </div>
                                    <div className="reasoning">
                                        <span className="label">근거:</span>
                                        <span className="value">{prediction.reasoning}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!monitoringStatus && !events.length && !predictions.length && (
                <div className="no-data">
                    <p>📊 모니터링할 대화가 없습니다.</p>
                    <p>AI와 대화를 시작하면 실시간 모니터링이 시작됩니다!</p>
                </div>
            )}
        </div>
    );
};

export default RealtimeMonitoringDashboard; 