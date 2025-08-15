import React, { useState, useEffect } from 'react';


interface AnalyticsData {
  projectPerformance: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  };
  userActivity: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  };
  aiResponseQuality: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  };
  systemMetrics: {
    cpu: number;
    memory: number;
    responseTime: number;
    throughput: number;
  };
}

interface AdvancedAnalyticsProps {
  projectId?: string;
  onBack?: () => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ projectId, onBack }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    projectPerformance: {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
      datasets: [
        {
          label: '완료된 프로젝트',
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgba(102, 126, 234, 1)'
        },
        {
          label: '진행 중 프로젝트',
          data: [8, 12, 10, 18, 15, 20],
          backgroundColor: 'rgba(72, 187, 120, 0.2)',
          borderColor: 'rgba(72, 187, 120, 1)'
        }
      ]
    },
    userActivity: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      datasets: [
        {
          label: '활성 사용자',
          data: [65, 59, 80, 81, 56, 55, 40],
          backgroundColor: 'rgba(237, 137, 54, 0.2)',
          borderColor: 'rgba(237, 137, 54, 1)'
        }
      ]
    },
    aiResponseQuality: {
      labels: ['정확도', '신뢰도', '응답속도', '사용자만족도', '완성도'],
      datasets: [
        {
          label: 'AI 응답 품질',
          data: [92, 88, 95, 87, 90],
          backgroundColor: 'rgba(66, 153, 225, 0.2)',
          borderColor: 'rgba(66, 153, 225, 1)'
        }
      ]
    },
    systemMetrics: {
      cpu: 45,
      memory: 62,
      responseTime: 0.3,
      throughput: 156
    }
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'activity' | 'quality'>('performance');

  const renderChart = (data: any, type: 'line' | 'bar' | 'radar') => {
    // 실제 차트 라이브러리 대신 CSS로 시뮬레이션
    return (
      <div className={`chart-container ${type}-chart`}>
        <div className="chart-header">
          <h3>{type === 'line' ? '트렌드 분석' : type === 'bar' ? '성과 비교' : '품질 평가'}</h3>
          <div className="chart-legend">
            {data.datasets.map((dataset: any, index: number) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: dataset.borderColor }}
                />
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-content">
          <div className="chart-bars">
            {data.labels.map((label: string, index: number) => (
              <div key={index} className="chart-bar-group">
                <div className="bar-label">{label}</div>
                <div className="bars">
                  {data.datasets.map((dataset: any, datasetIndex: number) => (
                    <div
                      key={datasetIndex}
                      className="bar"
                      style={{
                        height: `${(dataset.data[index] / Math.max(...dataset.data)) * 200}px`,
                        backgroundColor: dataset.backgroundColor,
                        borderColor: dataset.borderColor
                      }}
                    >
                      <span className="bar-value">{dataset.data[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMetricCard = (title: string, value: string | number, unit: string, trend: number, color: string) => (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-header">
        <h4>{title}</h4>
        <div className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      </div>
      <div className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </div>
    </div>
  );

  const renderSystemMetrics = () => (
    <div className="system-metrics">
      <h3>시스템 성능 지표</h3>
      <div className="metrics-grid">
        {renderMetricCard('CPU 사용률', analyticsData.systemMetrics.cpu, '%', 5, '#667eea')}
        {renderMetricCard('메모리 사용률', analyticsData.systemMetrics.memory, '%', -2, '#48bb78')}
        {renderMetricCard('응답 시간', analyticsData.systemMetrics.responseTime, '초', -15, '#ed8936')}
        {renderMetricCard('처리량', analyticsData.systemMetrics.throughput, 'req/s', 12, '#9f7aea')}
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="insights-section">
      <h3>AI 인사이트</h3>
      <div className="insights-grid">
        <div className="insight-card positive">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <h4>프로젝트 완료율 향상</h4>
            <p>지난 달 대비 25% 증가한 프로젝트 완료율을 보여주고 있습니다.</p>
          </div>
        </div>
        <div className="insight-card warning">
          <div className="insight-icon">⚠️</div>
          <div className="insight-content">
            <h4>사용자 활동 감소</h4>
            <p>주말 사용자 활동이 평일 대비 35% 감소하고 있습니다.</p>
          </div>
        </div>
        <div className="insight-card positive">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h4>AI 응답 품질 개선</h4>
            <p>AI 응답의 정확도가 92%로 지속적으로 향상되고 있습니다.</p>
          </div>
        </div>
        <div className="insight-card info">
          <div className="insight-icon">💡</div>
          <div className="insight-content">
            <h4>최적화 기회</h4>
            <p>메모리 사용률을 10% 줄이면 응답 시간을 0.1초 단축할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          {onBack && (
            <button className="back-button" onClick={onBack}>
              <span>←</span>
              뒤로
            </button>
          )}
          <div className="header-content">
            <h1>고급 분석 대시보드</h1>
            <p>데이터 기반 인사이트와 성과 분석</p>
          </div>
        </div>
        <div className="header-controls">
          <div className="time-range-selector">
            <button
              className={selectedTimeRange === 'week' ? 'active' : ''}
              onClick={() => setSelectedTimeRange('week')}
            >
              주간
            </button>
            <button
              className={selectedTimeRange === 'month' ? 'active' : ''}
              onClick={() => setSelectedTimeRange('month')}
            >
              월간
            </button>
            <button
              className={selectedTimeRange === 'quarter' ? 'active' : ''}
              onClick={() => setSelectedTimeRange('quarter')}
            >
              분기
            </button>
            <button
              className={selectedTimeRange === 'year' ? 'active' : ''}
              onClick={() => setSelectedTimeRange('year')}
            >
              연간
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-content">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-tabs">
            <button
              className={selectedMetric === 'performance' ? 'active' : ''}
              onClick={() => setSelectedMetric('performance')}
            >
              프로젝트 성과
            </button>
            <button
              className={selectedMetric === 'activity' ? 'active' : ''}
              onClick={() => setSelectedMetric('activity')}
            >
              사용자 활동
            </button>
            <button
              className={selectedMetric === 'quality' ? 'active' : ''}
              onClick={() => setSelectedMetric('quality')}
            >
              AI 품질
            </button>
          </div>

          <div className="chart-display">
            {selectedMetric === 'performance' && renderChart(analyticsData.projectPerformance, 'bar')}
            {selectedMetric === 'activity' && renderChart(analyticsData.userActivity, 'line')}
            {selectedMetric === 'quality' && renderChart(analyticsData.aiResponseQuality, 'radar')}
          </div>
        </div>

        {/* System Metrics */}
        {renderSystemMetrics()}

        {/* Insights */}
        {renderInsights()}
      </div>

      {/* Floating Export Button */}
      <div className="export-button">
        <button>
          <span>📊</span>
          보고서 내보내기
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
