import React, { useState, useEffect } from 'react';
import { RealEstateAlert } from '../services/realEstateService';
import realEstateService from '../services/realEstateService';


interface RealEstateAlertsProps {
    isVisible: boolean;
    onClose: () => void;
}

const RealEstateAlerts: React.FC<RealEstateAlertsProps> = ({ isVisible, onClose }) => {
    const [alerts, setAlerts] = useState<RealEstateAlert[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        // 알림 구독
        const handleAlert = (alert: RealEstateAlert) => {
            setAlerts(prev => [alert, ...prev]);

            // 브라우저 알림 표시
            if (Notification.permission === 'granted') {
                new Notification('부동산 시세 알림', {
                    body: alert.message,
                    icon: '/favicon.ico'
                });
            }
        };

        realEstateService.subscribeToAlerts(handleAlert);

        // 기존 알림 로드
        setAlerts(realEstateService.getAlerts());

        return () => {
            realEstateService.unsubscribeFromAlerts(handleAlert);
        };
    }, []);

    const handleMarkAsRead = (alertId: string) => {
        realEstateService.markAlertAsRead(alertId);
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
    };

    const handleDeleteAlert = (alertId: string) => {
        realEstateService.deleteAlert(alertId);
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const handleMarkAllAsRead = () => {
        alerts.forEach(alert => {
            if (!alert.isRead) {
                realEstateService.markAlertAsRead(alert.id);
            }
        });
        setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => !alert.isRead);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'price_change': return '💰';
            case 'trend_change': return '📈';
            case 'market_status_change': return '🔥';
            default: return '🔔';
        }
    };

    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    if (!isVisible) return null;

    return (
        <div className="alerts-overlay" onClick={onClose}>
            <div className="alerts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="alerts-header">
                    <h3>🔔 부동산 시세 알림</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="alerts-controls">
                    <div className="filter-buttons">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            전체 ({alerts.length})
                        </button>
                        <button
                            className={filter === 'unread' ? 'active' : ''}
                            onClick={() => setFilter('unread')}
                        >
                            읽지 않음 ({alerts.filter(a => !a.isRead).length})
                        </button>
                    </div>
                    <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                        모두 읽음 처리
                    </button>
                </div>

                <div className="alerts-list">
                    {filteredAlerts.length === 0 ? (
                        <div className="no-alerts">
                            <p>알림이 없습니다.</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <div key={alert.id} className={`alert-item ${alert.isRead ? 'read' : 'unread'}`}>
                                <div className="alert-icon">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="alert-content">
                                    <div className="alert-message">{alert.message}</div>
                                    <div className="alert-meta">
                                        <span className="alert-region">{alert.region}</span>
                                        <span className="alert-time">{formatTime(alert.timestamp)}</span>
                                    </div>
                                </div>
                                <div className="alert-actions">
                                    {!alert.isRead && (
                                        <button
                                            className="mark-read"
                                            onClick={() => handleMarkAsRead(alert.id)}
                                            title="읽음 처리"
                                        >
                                            ✓
                                        </button>
                                    )}
                                    <button
                                        className="delete-alert"
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        title="삭제"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="alerts-footer">
                    <button className="enable-notifications" onClick={() => {
                        if (Notification.permission === 'default') {
                            Notification.requestPermission();
                        }
                    }}>
                        브라우저 알림 {Notification.permission === 'granted' ? '활성화됨' : '설정'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RealEstateAlerts;
