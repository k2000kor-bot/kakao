import React, { useState, useEffect, useCallback } from 'react';

interface PredictionData {
  userActivity: {
    predictedAction: string;
    confidence: number;
    nextActionProbability: number;
    timestamp: string;
  };
  messageQuality: {
    score: number;
    clarity: number;
    relevance: number;
    toneAppropriateness: number;
    suggestions: string[];
    timestamp: string;
  };
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    predictionHorizon: string;
    alerts: string[];
    timestamp: string;
  };
}

interface AnalyticsSummary {
  totalPredictions: number;
  accuracyRate: number;
  activeModels: number;
  lastUpdated: string;
  predictionsByType: {
    userActivity: number;
    messageQuality: number;
    systemPerformance: number;
  };
}

const PredictiveAnalytics: React.FC = () => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // 예측 데이터 가져오기
  const fetchPredictionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 시뮬레이션된 예측 데이터 생성
      const mockPredictionData: PredictionData = {
        userActivity: {
          predictedAction: '프로젝트 분석 요청',
          confidence: 0.85,
          nextActionProbability: 0.72,
          timestamp: new Date().toISOString()
        },
        messageQuality: {
          score: 0.88,
          clarity: 0.92,
          relevance: 0.85,
          toneAppropriateness: 0.90,
          suggestions: [
            '더 구체적인 질문을 하시면 더 정확한 답변을 드릴 수 있습니다',
            '관련 파일을 첨부하시면 분석 품질이 향상됩니다'
          ],
          timestamp: new Date().toISOString()
        },
        systemPerformance: {
          cpuUsage: 45.2,
          memoryUsage: 62.8,
          responseTime: 1.2,
          throughput: 156.7,
          predictionHorizon: '1시간',
          alerts: [
            '메모리 사용량이 점진적으로 증가하고 있습니다',
            '응답 시간이 예상보다 빠릅니다'
          ],
          timestamp: new Date().toISOString()
        }
      };

      const mockSummary: AnalyticsSummary = {
        totalPredictions: 1247,
        accuracyRate: 0.89,
        activeModels: 8,
        lastUpdated: new Date().toISOString(),
        predictionsByType: {
          userActivity: 456,
          messageQuality: 523,
          systemPerformance: 268
        }
      };

      // 실제 API 호출 대신 시뮬레이션
      setTimeout(() => {
        setPredictionData(mockPredictionData);
        setSummary(mockSummary);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('예측 데이터 가져오기 실패:', error);
      setError('예측 데이터를 가져오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, []);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchPredictionData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchPredictionData]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPredictionData();
  }, [fetchPredictionData]);

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold) return 'text-green-600';
    if (value <= threshold * 1.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading && !predictionData) {
    return (
      <div className="predictive-analytics">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>예측 분석 데이터를 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h2>🔮 예측 분석 대시보드</h2>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            자동 새로고침
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
          >
            <option value={10}>10초</option>
            <option value={30}>30초</option>
            <option value={60}>1분</option>
            <option value={300}>5분</option>
          </select>
          <button onClick={fetchPredictionData} disabled={isLoading}>
            {isLoading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {summary && (
        <div className="analytics-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>총 예측 수</h3>
              <span className="summary-value">{summary.totalPredictions.toLocaleString()}</span>
            </div>
            <div className="summary-card">
              <h3>정확도</h3>
              <span className="summary-value">{(summary.accuracyRate * 100).toFixed(1)}%</span>
            </div>
            <div className="summary-card">
              <h3>활성 모델</h3>
              <span className="summary-value">{summary.activeModels}개</span>
            </div>
            <div className="summary-card">
              <h3>마지막 업데이트</h3>
              <span className="summary-value">
                {new Date(summary.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="prediction-types">
            <h3>예측 유형별 통계</h3>
            <div className="type-bars">
              <div className="type-bar">
                <span>사용자 활동</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill user-activity"
                    style={{ width: `${(summary.predictionsByType.userActivity / summary.totalPredictions) * 100}%` }}
                  />
                </div>
                <span>{summary.predictionsByType.userActivity}</span>
              </div>
              <div className="type-bar">
                <span>메시지 품질</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill message-quality"
                    style={{ width: `${(summary.predictionsByType.messageQuality / summary.totalPredictions) * 100}%` }}
                  />
                </div>
                <span>{summary.predictionsByType.messageQuality}</span>
              </div>
              <div className="type-bar">
                <span>시스템 성능</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill system-performance"
                    style={{ width: `${(summary.predictionsByType.systemPerformance / summary.totalPredictions) * 100}%` }}
                  />
                </div>
                <span>{summary.predictionsByType.systemPerformance}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {predictionData && (
        <div className="prediction-details">
          <div className="prediction-section">
            <h3>👤 사용자 활동 예측</h3>
            <div className="prediction-card">
              <div className="prediction-item">
                <span className="label">예측된 다음 액션:</span>
                <span className="value">{predictionData.userActivity.predictedAction}</span>
              </div>
              <div className="prediction-item">
                <span className="label">신뢰도:</span>
                <span className="value">{(predictionData.userActivity.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="prediction-item">
                <span className="label">다음 액션 확률:</span>
                <span className="value">{(predictionData.userActivity.nextActionProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="prediction-item">
                <span className="label">예측 시간:</span>
                <span className="value">
                  {new Date(predictionData.userActivity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="prediction-section">
            <h3>💬 메시지 품질 분석</h3>
            <div className="prediction-card">
              <div className="quality-metrics">
                <div className="quality-item">
                  <span className="label">전체 품질 점수:</span>
                  <span className={`value ${getQualityColor(predictionData.messageQuality.score)}`}>
                    {(predictionData.messageQuality.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="quality-item">
                  <span className="label">명확성:</span>
                  <span className={`value ${getQualityColor(predictionData.messageQuality.clarity)}`}>
                    {(predictionData.messageQuality.clarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="quality-item">
                  <span className="label">관련성:</span>
                  <span className={`value ${getQualityColor(predictionData.messageQuality.relevance)}`}>
                    {(predictionData.messageQuality.relevance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="quality-item">
                  <span className="label">톤 적절성:</span>
                  <span className={`value ${getQualityColor(predictionData.messageQuality.toneAppropriateness)}`}>
                    {(predictionData.messageQuality.toneAppropriateness * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              {predictionData.messageQuality.suggestions.length > 0 && (
                <div className="suggestions">
                  <h4>개선 제안:</h4>
                  <ul>
                    {predictionData.messageQuality.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="prediction-section">
            <h3>⚡ 시스템 성능 예측</h3>
            <div className="prediction-card">
              <div className="performance-metrics">
                <div className="performance-item">
                  <span className="label">CPU 사용률:</span>
                  <span className={`value ${getPerformanceColor(predictionData.systemPerformance.cpuUsage, 70)}`}>
                    {predictionData.systemPerformance.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="performance-item">
                  <span className="label">메모리 사용률:</span>
                  <span className={`value ${getPerformanceColor(predictionData.systemPerformance.memoryUsage, 80)}`}>
                    {predictionData.systemPerformance.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="performance-item">
                  <span className="label">응답 시간:</span>
                  <span className={`value ${getPerformanceColor(predictionData.systemPerformance.responseTime, 2)}`}>
                    {predictionData.systemPerformance.responseTime.toFixed(1)}초
                  </span>
                </div>
                <div className="performance-item">
                  <span className="label">처리량:</span>
                  <span className="value">
                    {predictionData.systemPerformance.throughput.toFixed(1)} req/s
                  </span>
                </div>
                <div className="performance-item">
                  <span className="label">예측 범위:</span>
                  <span className="value">{predictionData.systemPerformance.predictionHorizon}</span>
                </div>
              </div>
              {predictionData.systemPerformance.alerts.length > 0 && (
                <div className="alerts">
                  <h4>⚠️ 시스템 알림:</h4>
                  <ul>
                    {predictionData.systemPerformance.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
