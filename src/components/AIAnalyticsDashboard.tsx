import React, { useState, useEffect, useRef } from 'react';
import { aiResponseQualityService, ResponseQualityMetrics } from '../services/aiResponseQualityService';
import { imageAnalysisService } from '../services/imageAnalysisService';


interface AnalyticsData {
  qualityMetrics: ResponseQualityMetrics;
  responseTime: number;
  userSatisfaction: number;
  conversationCount: number;
  imageAnalysisCount: number;
  voiceRecognitionCount: number;
  errorRate: number;
  systemPerformance: {
    cpu: number;
    memory: number;
    network: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const AIAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<keyof ResponseQualityMetrics>('accuracy');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [historicalData, setHistoricalData] = useState<ChartData | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 실시간 데이터 수집
  useEffect(() => {
    const updateAnalytics = () => {
      const mockData: AnalyticsData = {
        qualityMetrics: {
          accuracy: 0.85 + Math.random() * 0.1,
          relevance: 0.8 + Math.random() * 0.15,
          creativity: 0.7 + Math.random() * 0.2,
          completeness: 0.9 + Math.random() * 0.1,
          clarity: 0.85 + Math.random() * 0.1,
          engagement: 0.75 + Math.random() * 0.2,
          coherence: 0.9 + Math.random() * 0.1,
          helpfulness: 0.85 + Math.random() * 0.1
        },
        responseTime: 800 + Math.random() * 400,
        userSatisfaction: 0.8 + Math.random() * 0.15,
        conversationCount: Math.floor(Math.random() * 100) + 50,
        imageAnalysisCount: Math.floor(Math.random() * 20) + 10,
        voiceRecognitionCount: Math.floor(Math.random() * 30) + 15,
        errorRate: Math.random() * 0.05,
        systemPerformance: {
          cpu: 30 + Math.random() * 40,
          memory: 45 + Math.random() * 30,
          network: 60 + Math.random() * 25
        }
      };

      setAnalyticsData(mockData);
    };

    // 초기 데이터 로드
    updateAnalytics();

    // 실시간 업데이트 (3초마다)
    const interval = setInterval(updateAnalytics, 3000);

    return () => clearInterval(interval);
  }, []);

  // 차트 애니메이션
  useEffect(() => {
    if (!canvasRef.current || !analyticsData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawQualityChart(ctx, analyticsData.qualityMetrics);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyticsData]);

  // 품질 차트 그리기
  const drawQualityChart = (ctx: CanvasRenderingContext2D, metrics: ResponseQualityMetrics) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // 배경 지우기
    ctx.clearRect(0, 0, width, height);

    const metricsArray = Object.entries(metrics);
    const barWidth = width / metricsArray.length;
    const maxValue = 1;

    metricsArray.forEach(([metric, value], index) => {
      const x = index * barWidth + barWidth * 0.1;
      const barHeight = (value / maxValue) * height * 0.8;
      const y = height * 0.9 - barHeight;

      // 바 그리기
      const gradient = ctx.createLinearGradient(x, y, x, height * 0.9);
      gradient.addColorStop(0, getMetricColor(metric as keyof ResponseQualityMetrics));
      gradient.addColorStop(1, getMetricColor(metric as keyof ResponseQualityMetrics, 0.6));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);

      // 값 표시
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${(value * 100).toFixed(1)}%`, x + barWidth * 0.4, height * 0.95);

      // 메트릭 이름
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(getMetricLabel(metric as keyof ResponseQualityMetrics), x + barWidth * 0.4, height * 0.98);
    });
  };

  // 메트릭 색상 가져오기
  const getMetricColor = (metric: keyof ResponseQualityMetrics, alpha: number = 1): string => {
    const colors: { [key: string]: string } = {
      accuracy: `rgba(52, 152, 219, ${alpha})`,
      relevance: `rgba(46, 204, 113, ${alpha})`,
      creativity: `rgba(155, 89, 182, ${alpha})`,
      completeness: `rgba(241, 196, 15, ${alpha})`,
      clarity: `rgba(230, 126, 34, ${alpha})`,
      engagement: `rgba(231, 76, 60, ${alpha})`,
      coherence: `rgba(26, 188, 156, ${alpha})`,
      helpfulness: `rgba(52, 73, 94, ${alpha})`
    };
    return colors[metric] || `rgba(128, 128, 128, ${alpha})`;
  };

  // 메트릭 라벨 가져오기
  const getMetricLabel = (metric: keyof ResponseQualityMetrics): string => {
    const labels: { [key: string]: string } = {
      accuracy: '정확도',
      relevance: '관련성',
      creativity: '창의성',
      completeness: '완성도',
      clarity: '명확성',
      engagement: '흥미도',
      coherence: '일관성',
      helpfulness: '도움성'
    };
    return labels[metric] || metric;
  };

  // 성능 상태 가져오기
  const getPerformanceStatus = (value: number): { status: string; color: string } => {
    if (value >= 90) return { status: '우수', color: '#27ae60' };
    if (value >= 70) return { status: '양호', color: '#f39c12' };
    if (value >= 50) return { status: '보통', color: '#e67e22' };
    return { status: '주의', color: '#e74c3c' };
  };

  // 대시보드 토글
  const toggleDashboard = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <button className="analytics-toggle-btn" onClick={toggleDashboard}>
        📊 AI 분석
      </button>
    );
  }

  return (
    <div className="ai-analytics-dashboard">
      <div className="dashboard-header">
        <h2>🤖 AI 성능 분석 대시보드</h2>
        <div className="dashboard-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="time-range-select"
          >
            <option value="1h">최근 1시간</option>
            <option value="24h">최근 24시간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
          <button className="close-btn" onClick={toggleDashboard}>
            ✕
          </button>
        </div>
      </div>

      {analyticsData && (
        <div className="dashboard-content">
          {/* 주요 지표 */}
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-info">
                <h3>응답 시간</h3>
                <p className="metric-value">{analyticsData.responseTime}ms</p>
                <p className="metric-status">실시간</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">😊</div>
              <div className="metric-info">
                <h3>사용자 만족도</h3>
                <p className="metric-value">{(analyticsData.userSatisfaction * 100).toFixed(1)}%</p>
                <p className="metric-status">높음</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-info">
                <h3>대화 수</h3>
                <p className="metric-value">{analyticsData.conversationCount}</p>
                <p className="metric-status">오늘</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🖼️</div>
              <div className="metric-info">
                <h3>이미지 분석</h3>
                <p className="metric-value">{analyticsData.imageAnalysisCount}</p>
                <p className="metric-status">오늘</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🎤</div>
              <div className="metric-info">
                <h3>음성 인식</h3>
                <p className="metric-value">{analyticsData.voiceRecognitionCount}</p>
                <p className="metric-status">오늘</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⚠️</div>
              <div className="metric-info">
                <h3>오류율</h3>
                <p className="metric-value">{(analyticsData.errorRate * 100).toFixed(2)}%</p>
                <p className="metric-status">낮음</p>
              </div>
            </div>
          </div>

          {/* 품질 메트릭 차트 */}
          <div className="quality-chart-section">
            <h3>AI 응답 품질 분석</h3>
            <div className="chart-container">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={300} 
                className="quality-chart"
              />
            </div>
            <div className="metric-selector">
              {Object.keys(analyticsData.qualityMetrics).map((metric) => (
                <button
                  key={metric}
                  className={`metric-btn ${selectedMetric === metric ? 'active' : ''}`}
                  onClick={() => setSelectedMetric(metric as keyof ResponseQualityMetrics)}
                >
                  {getMetricLabel(metric as keyof ResponseQualityMetrics)}
                </button>
              ))}
            </div>
          </div>

          {/* 시스템 성능 */}
          <div className="system-performance">
            <h3>시스템 성능</h3>
            <div className="performance-metrics">
              <div className="performance-item">
                <div className="performance-label">CPU 사용률</div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill cpu"
                    style={{ width: `${analyticsData.systemPerformance.cpu}%` }}
                  />
                  <span className="performance-value">{analyticsData.systemPerformance.cpu.toFixed(1)}%</span>
                </div>
              </div>

              <div className="performance-item">
                <div className="performance-label">메모리 사용률</div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill memory"
                    style={{ width: `${analyticsData.systemPerformance.memory}%` }}
                  />
                  <span className="performance-value">{analyticsData.systemPerformance.memory.toFixed(1)}%</span>
                </div>
              </div>

              <div className="performance-item">
                <div className="performance-label">네트워크 사용률</div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill network"
                    style={{ width: `${analyticsData.systemPerformance.network}%` }}
                  />
                  <span className="performance-value">{analyticsData.systemPerformance.network.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 실시간 알림 */}
          <div className="realtime-alerts">
            <h3>실시간 알림</h3>
            <div className="alerts-list">
              <div className="alert-item success">
                <span className="alert-icon">✅</span>
                <span className="alert-text">AI 응답 품질이 목표치를 상회하고 있습니다.</span>
                <span className="alert-time">방금 전</span>
              </div>
              <div className="alert-item info">
                <span className="alert-icon">ℹ️</span>
                <span className="alert-text">새로운 이미지 분석 요청이 처리되었습니다.</span>
                <span className="alert-time">2분 전</span>
              </div>
              <div className="alert-item warning">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">CPU 사용률이 70%를 초과했습니다.</span>
                <span className="alert-time">5분 전</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalyticsDashboard;
