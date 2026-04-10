/**
 * 성능 모니터링 대시보드 컴포넌트
 * 실시간 시스템 성능 모니터링 및 예측 분석
 */

import {
  INTEGRATED_API_METRICS_PATH,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
  WS_BASE_URL,
} from '../config/api';
import React, { useState, useEffect, useCallback } from 'react';
import advancedAPIService, {
  SystemPerformancePredictionResponse,
  PredictionSummaryResponse,
} from '../services/advancedAPIService';
import { useWebSocket } from '../hooks/useWebSocket';
import { useLoadingState } from '../hooks/useLoadingState';
import PredictionChart from './PredictionChart';
import { CardSkeleton } from './LoadingSkeleton';
import LoadingStateIndicator from './LoadingStateIndicator';
import { errorLogger } from '../utils/errorLogger';
import { getMetricColor } from '../styles/themeColors';
import './PerformanceMonitoringDashboard.css';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  timestamp: string;
}

interface PerformanceMonitoringDashboardProps {
  refreshInterval?: number; // 초 단위
  showPredictions?: boolean;
}

const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  refreshInterval = 30,
  showPredictions = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [prediction, setPrediction] = useState<SystemPerformancePredictionResponse | null>(null);
  const [summary, setSummary] = useState<PredictionSummaryResponse | null>(null);
  const { loadingState, startRefreshing, stopLoading } = useLoadingState();
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // WebSocket 연결 (통합 API 서버 없으면 로컬 포트)
  const wsUrl = WS_BASE_URL;
  const { isConnected: wsConnected } = useWebSocket({
    url: wsUrl,
    roomId: 'performance-monitoring',
    onMessage: (data) => {
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'performance_update') {
            setMetrics({
              cpu: parsed.cpu || 0,
              memory: parsed.memory || 0,
              disk: parsed.disk || 0,
              responseTime: parsed.response_time || 0,
              timestamp: parsed.timestamp || new Date().toISOString(),
            });
          }
        } catch (e) {
          // 파싱 실패 시 무시
        }
      }
    },
    reconnect: true,
  });

  // 성능 메트릭 조회
  const fetchMetrics = useCallback(async () => {
    try {
      startRefreshing('성능 메트릭을 불러오는 중...');
      setError(null);

      // 통합 API(5002)에서 메트릭 조회
      const apiBase = resolveApiBaseUrl();
      const response = await fetch(
        joinApiHealthCheckUrl(apiBase, INTEGRATED_API_METRICS_PATH),
      );
      if (response.ok) {
        const data = await response.json();
        const metricsData = data?.data?.metrics;
        const systemMetrics = data?.system_status?.system_metrics;
        const toPct = (v: unknown) => (typeof v === 'number' ? (v <= 1 ? v * 100 : v) : 0);
        if (systemMetrics && typeof systemMetrics === 'object') {
          setMetrics({
            cpu: toPct(systemMetrics.cpu_usage),
            memory: toPct(systemMetrics.memory_usage),
            disk: toPct(systemMetrics.disk_usage),
            responseTime: metricsData?.average_response_time ?? 0,
            timestamp: metricsData?.last_updated || new Date().toISOString(),
          });
        } else if (metricsData && typeof metricsData === 'object') {
          const avg = metricsData.average_response_time ?? 0;
          setMetrics({
            cpu: toPct(metricsData.cpu_usage ?? metricsData.cpu),
            memory: toPct(metricsData.memory_usage ?? metricsData.memory),
            disk: toPct(metricsData.disk_usage ?? metricsData.disk),
            responseTime: avg,
            timestamp: metricsData.last_updated || new Date().toISOString(),
          });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '성능 메트릭 조회 중 오류가 발생했습니다.');
    } finally {
      stopLoading();
    }
  }, [startRefreshing, stopLoading]);

  // 성능 예측 조회
  const fetchPrediction = useCallback(async () => {
    try {
      const result = await advancedAPIService.predictSystemPerformance({
        time_horizon: '1h',
        include_trends: true,
      });

      if (result.status === 'success') {
        setPrediction(result);
      }
    } catch (err: unknown) {
      errorLogger.error('성능 예측 조회 오류', err instanceof Error ? err : new Error(String(err)), {
        component: 'PerformanceMonitoringDashboard',
        action: 'fetchPrediction',
      });
    }
  }, []);

  // 예측 요약 조회
  const fetchSummary = useCallback(async () => {
    try {
      const result = await advancedAPIService.getPredictionSummary();
      if (result.status === 'success') {
        setSummary(result);
      }
    } catch (err: unknown) {
      errorLogger.error('예측 요약 조회 오류', err instanceof Error ? err : new Error(String(err)), {
        component: 'PerformanceMonitoringDashboard',
        action: 'fetchSummary',
      });
    }
  }, []);

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    fetchMetrics();
    if (showPredictions) {
      fetchPrediction();
      fetchSummary();
    }

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        if (showPredictions) {
          fetchPrediction();
        }
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [fetchMetrics, fetchPrediction, fetchSummary, autoRefresh, refreshInterval, showPredictions]);

  // 메트릭 상태 텍스트
  const getMetricStatus = (value: number, threshold: number = 80): string => {
    if (value >= threshold) return '위험';
    if (value >= threshold * 0.7) return '경고';
    return '정상';
  };

  return (
    <div className="performance-monitoring-dashboard">
      <div className="dashboard-header">
        <h2>성능 모니터링 대시보드</h2>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>자동 갱신 ({refreshInterval}초)</span>
          </label>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchMetrics();
              if (showPredictions) {
                fetchPrediction();
                fetchSummary();
              }
            }}
            disabled={loadingState.type !== 'idle'}
          >
            🔄 새로고침
          </button>
          <div className="connection-status">
            <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{wsConnected ? '실시간 연결' : '연결 끊김'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <LoadingStateIndicator
        type={loadingState.type}
        message={loadingState.message}
        skeletonType="card"
        showSpinner={loadingState.type === 'refreshing'}
      />

      {/* 로딩 스켈레톤 */}
      {loadingState.type !== 'idle' && !metrics && (
        <div className="metrics-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <CardSkeleton key={idx} height="150px" />
          ))}
        </div>
      )}

      {/* 실시간 메트릭 */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <h3>CPU 사용률</h3>
              <span className={`metric-status ${getMetricStatus(metrics.cpu).toLowerCase()}`}>
                {getMetricStatus(metrics.cpu)}
              </span>
            </div>
            <div className="metric-value">
              <span style={{ color: getMetricColor(metrics.cpu) }}>
                {metrics.cpu.toFixed(1)}%
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{
                  width: `${metrics.cpu}%`,
                  backgroundColor: getMetricColor(metrics.cpu),
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>메모리 사용률</h3>
              <span className={`metric-status ${getMetricStatus(metrics.memory).toLowerCase()}`}>
                {getMetricStatus(metrics.memory)}
              </span>
            </div>
            <div className="metric-value">
              <span style={{ color: getMetricColor(metrics.memory) }}>
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{
                  width: `${metrics.memory}%`,
                  backgroundColor: getMetricColor(metrics.memory),
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>디스크 사용률</h3>
              <span className={`metric-status ${getMetricStatus(metrics.disk).toLowerCase()}`}>
                {getMetricStatus(metrics.disk)}
              </span>
            </div>
            <div className="metric-value">
              <span style={{ color: getMetricColor(metrics.disk) }}>
                {metrics.disk.toFixed(1)}%
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{
                  width: `${metrics.disk}%`,
                  backgroundColor: getMetricColor(metrics.disk),
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>응답 시간</h3>
            </div>
            <div className="metric-value">
              <span>{metrics.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="metric-info">
              마지막 업데이트: {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* 성능 예측 */}
      {showPredictions && prediction?.performance_prediction && (
        <div className="prediction-section">
          <h3>성능 예측 (1시간 후)</h3>
          <div className="prediction-grid">
            <div className="prediction-card">
              <h4>현재 vs 예측</h4>
              {metrics && (
                <PredictionChart
                  data={{
                    labels: ['CPU', '메모리', '디스크'],
                    values: [
                      metrics.cpu / 100,
                      metrics.memory / 100,
                      metrics.disk / 100,
                    ],
                    colors: ['var(--accent-info)', 'var(--accent-success)', 'var(--accent-warning)'],
                  }}
                  type="bar"
                  title="현재 사용률"
                />
              )}
              {prediction.performance_prediction.predicted_metrics && (
                <PredictionChart
                  data={{
                    labels: ['CPU', '메모리'],
                    values: [
                      prediction.performance_prediction.predicted_metrics.cpu_usage,
                      prediction.performance_prediction.predicted_metrics.memory_usage,
                    ],
                    colors: ['var(--accent-error)', 'var(--accent-warning)'],
                  }}
                  type="bar"
                  title="예측 사용률"
                />
              )}
            </div>

            {prediction.performance_prediction.alerts.length > 0 && (
              <div className="alerts-card">
                <h4>경고</h4>
                <ul className="alerts-list">
                  {prediction.performance_prediction.alerts.map((alert, idx) => (
                    <li
                      key={idx}
                      className={`alert-item alert-${alert.level}`}
                    >
                      <strong>{alert.level === 'critical' ? '🔴' : '⚠️'}</strong>
                      <div>
                        <p>{alert.message}</p>
                        <small>{alert.recommendation}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.performance_prediction.trends && (
              <div className="trends-card">
                <h4>트렌드</h4>
                <div className="trends-list">
                  <div className="trend-item">
                    <span>CPU 트렌드:</span>
                    <span className={`trend-${prediction.performance_prediction.trends.cpu_trend}`}>
                      {prediction.performance_prediction.trends.cpu_trend === 'increasing'
                        ? '📈 증가'
                        : prediction.performance_prediction.trends.cpu_trend === 'decreasing'
                        ? '📉 감소'
                        : '➡️ 안정'}
                    </span>
                  </div>
                  <div className="trend-item">
                    <span>메모리 트렌드:</span>
                    <span className={`trend-${prediction.performance_prediction.trends.memory_trend}`}>
                      {prediction.performance_prediction.trends.memory_trend === 'increasing'
                        ? '📈 증가'
                        : prediction.performance_prediction.trends.memory_trend === 'decreasing'
                        ? '📉 감소'
                        : '➡️ 안정'}
                    </span>
                  </div>
                  <div className="trend-item">
                    <span>부하 트렌드:</span>
                    <span className={`trend-${prediction.performance_prediction.trends.load_trend}`}>
                      {prediction.performance_prediction.trends.load_trend === 'increasing'
                        ? '📈 증가'
                        : prediction.performance_prediction.trends.load_trend === 'decreasing'
                        ? '📉 감소'
                        : '➡️ 안정'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 예측 요약 */}
      {showPredictions && summary?.summary && (
        <div className="summary-section">
          <h3>예측 분석 요약</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>총 예측 수</h4>
              <p className="summary-value">{summary.summary.total_predictions}</p>
            </div>
            <div className="summary-card">
              <h4>정확도</h4>
              <p className="summary-value">
                {(summary.summary.accuracy_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="summary-card">
              <h4>활성 모델</h4>
              <p className="summary-value">{summary.summary.active_models}개</p>
            </div>
            <div className="summary-card">
              <h4>예측 유형별 통계</h4>
              <PredictionChart
                data={{
                  labels: ['사용자 활동', '메시지 품질', '시스템 성능'],
                  values: [
                    summary.summary.predictions_by_type.user_activity / Math.max(summary.summary.total_predictions, 1),
                    summary.summary.predictions_by_type.message_quality / Math.max(summary.summary.total_predictions, 1),
                    summary.summary.predictions_by_type.system_performance / Math.max(summary.summary.total_predictions, 1),
                  ],
                }}
                type="pie"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitoringDashboard;

