import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'bias' | 'conflict' | 'anomaly' | 'trend' | 'system';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

interface RealTimeNotificationsProps {
  analysisData?: any;
  realTimeData?: any;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ analysisData, realTimeData }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'bias' | 'conflict' | 'anomaly' | 'trend' | 'system'>('all');

  useEffect(() => {
    if (realTimeData) {
      // 편향성 확대 알림
      if (realTimeData.bias_escalation_alerts) {
        realTimeData.bias_escalation_alerts.forEach((alert: string, index: number) => {
          const notification: Notification = {
            id: `bias-${Date.now()}-${index}`,
            type: 'bias',
            title: '편향성 확대 감지',
            message: alert,
            timestamp: new Date().toISOString(),
            severity: 'high',
            acknowledged: false
          };
          addNotification(notification);
        });
      }

      // 갈등 예측 업데이트
      if (realTimeData.conflict_prediction_updates) {
        realTimeData.conflict_prediction_updates.forEach((update: any, index: number) => {
          if (update.probability > 0.8) {
            const notification: Notification = {
              id: `conflict-${Date.now()}-${index}`,
              type: 'conflict',
              title: '갈등 위험 증가',
              message: `갈등 확률이 ${(update.probability * 100).toFixed(1)}%로 증가했습니다.`,
              timestamp: update.timestamp || new Date().toISOString(),
              severity: 'critical',
              acknowledged: false
            };
            addNotification(notification);
          }
        });
      }

      // 감정 트렌드 이상 감지
      if (realTimeData.live_sentiment_trend) {
        const recentSentiment = realTimeData.live_sentiment_trend.slice(-3);
        const sentimentChange = recentSentiment[recentSentiment.length - 1] - recentSentiment[0];
        
        if (Math.abs(sentimentChange) > 0.3) {
          const notification: Notification = {
            id: `sentiment-${Date.now()}`,
            type: 'anomaly',
            title: '감정 변화 이상 감지',
            message: `전체 감정이 ${sentimentChange > 0 ? '급격히 개선' : '급격히 악화'}되었습니다.`,
            timestamp: new Date().toISOString(),
            severity: 'medium',
            acknowledged: false
          };
          addNotification(notification);
        }
      }
    }
  }, [realTimeData]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // 최대 10개 유지
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, acknowledged: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bias': return '🔥';
      case 'conflict': return '⚠️';
      case 'anomaly': return '🚨';
      case 'trend': return '📈';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bias': return '편향성';
      case 'conflict': return '갈등';
      case 'anomaly': return '이상';
      case 'trend': return '트렌드';
      case 'system': return '시스템';
      default: return '알림';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    return notification.type === filterType;
  });

  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  return (
    <div className="real-time-notifications">
      {/* 알림 헤더 */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="text-2xl">🔔</span>
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">실시간 알림</h3>
            <p className="text-sm text-gray-600">편향성, 갈등, 이상 패턴 실시간 모니터링</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {showNotifications ? '숨기기' : '보이기'}
          </button>
          <button
            onClick={clearAllNotifications}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            모두 지우기
          </button>
        </div>
      </div>

      {showNotifications && (
        <>
          {/* 필터 버튼 */}
          <div className="mb-4 flex space-x-2 overflow-x-auto">
            {[
              { id: 'all', label: '전체', count: notifications.length },
              { id: 'bias', label: '편향성', count: notifications.filter(n => n.type === 'bias').length },
              { id: 'conflict', label: '갈등', count: notifications.filter(n => n.type === 'conflict').length },
              { id: 'anomaly', label: '이상', count: notifications.filter(n => n.type === 'anomaly').length },
              { id: 'trend', label: '트렌드', count: notifications.filter(n => n.type === 'trend').length },
              { id: 'system', label: '시스템', count: notifications.filter(n => n.type === 'system').length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id as any)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  filterType === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* 알림 목록 */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🔕</span>
                <p>현재 알림이 없습니다.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    notification.acknowledged 
                      ? 'opacity-60 bg-gray-50' 
                      : getSeverityColor(notification.severity)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${
                            notification.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            notification.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTypeLabel(notification.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.acknowledged && (
                      <button
                        onClick={() => acknowledgeNotification(notification.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        확인
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 실시간 상태 요약 */}
          {analysisData && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3">📊 실시간 상태 요약</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisData.realTimeAnalysis?.active_participants || 0}
                  </p>
                  <p className="text-xs text-gray-600">활성 참여자</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analysisData.realTimeAnalysis?.message_velocity || 0}/분
                  </p>
                  <p className="text-xs text-gray-600">메시지 속도</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {analysisData.systemMetrics?.real_time_performance?.latency || 0}ms
                  </p>
                  <p className="text-xs text-gray-600">응답 시간</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisData.systemMetrics?.ai_model_performance?.sentiment_accuracy?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-gray-600">AI 정확도</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RealTimeNotifications; 