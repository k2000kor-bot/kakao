import React, { useState, useEffect, useRef } from 'react';
import AdvancedVisualization from './AdvancedVisualization';
import RealTimeNotifications from './RealTimeNotifications';

interface TimeRange {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

interface IssueSection {
  id: string;
  title: string;
  participants: ParticipantStatement[];
  summary: string;
  conflict_level: '높음' | '보통' | '낮음';
  urgency_level: '높음' | '보통' | '낮음';
  bias_indicators: string[];
  construction_company_bias: CompanyBiasAnalysis;
  ai_insights?: AIInsight[];
  predictive_analysis?: PredictiveAnalysis;
  real_time_metrics?: RealTimeMetrics;
}

interface ParticipantStatement {
  participant_id: string;
  participant_name: string;
  statement: string;
  timestamp: string;
  sentiment: '긍정' | '부정' | '중립';
  influence_score: number;
  bias_towards: string[];
  emotion_analysis?: EmotionAnalysis;
  credibility_score?: number;
  real_time_indicators?: RealTimeIndicators;
}

interface CompanyBiasAnalysis {
  company_name: string;
  bias_score: number;
  bias_type: '우호' | '비하' | '중립';
  key_statements: string[];
  promotional_logic: string[];
  opposition_logic: string[];
  regional_factors: string[];
  political_factors: string[];
  advanced_metrics?: AdvancedBiasMetrics;
  real_time_trends?: RealTimeBiasTrends;
}

interface AIInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  impact_score: number;
  urgency_level: 'critical' | 'high' | 'medium' | 'low';
}

interface PredictiveAnalysis {
  conflict_probability: number;
  escalation_risk: number;
  resolution_time: number;
  participant_behavior_prediction: string;
  company_relationship_forecast: string;
  confidence_intervals: {
    lower: number;
    upper: number;
  };
}

interface EmotionAnalysis {
  primary_emotion: string;
  emotion_intensity: number;
  secondary_emotions: string[];
  emotional_stability: number;
  emotional_trend: 'increasing' | 'decreasing' | 'stable';
}

interface AdvancedBiasMetrics {
  subtle_bias_score: number;
  implicit_bias_detected: boolean;
  bias_escalation_trend: string;
  cross_reference_accuracy: number;
  historical_bias_pattern: string[];
  contextual_bias_score: number;
}

interface RealTimeMetrics {
  message_frequency: number;
  sentiment_trend: number[];
  bias_escalation_rate: number;
  conflict_intensity: number;
  participant_engagement: number;
}

interface RealTimeIndicators {
  typing_speed: number;
  response_time: number;
  message_length_trend: number;
  emoji_usage: number;
  link_sharing_frequency: number;
}

interface RealTimeBiasTrends {
  bias_score_history: number[];
  promotional_content_ratio: number;
  opposition_content_ratio: number;
  neutral_content_ratio: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

interface AdvancedAnalysisResult {
  timeRange: TimeRange;
  roomInfo: {
    room_id: string;
    room_name: string;
    total_participants: number;
    total_messages: number;
  };
  issueSections: IssueSection[];
  overallAnalysis: {
    total_issues: number;
    high_conflict_issues: number;
    high_urgency_issues: number;
    construction_company_biases: CompanyBiasAnalysis[];
    key_insights: string[];
    recommendations: string[];
    ai_generated_insights: AIInsight[];
    predictive_models: {
      conflict_prediction: number;
      bias_escalation: number;
      resolution_probability: number;
    };
    real_time_summary: RealTimeSummary;
  };
  participantAnalysis: {
    participants: {
      id: string;
      name: string;
      message_count: number;
      influence_score: number;
      bias_patterns: string[];
      key_statements: string[];
      credibility_analysis: {
        consistency_score: number;
        factual_accuracy: number;
        emotional_stability: number;
      };
      real_time_behavior: RealTimeBehavior;
    }[];
  };
  systemMetrics: {
    analysis_accuracy: number;
    data_quality: number;
    processing_time: number;
    confidence_score: number;
    ai_model_performance: {
      sentiment_accuracy: number;
      bias_detection_accuracy: number;
      prediction_accuracy: number;
    };
    real_time_performance: {
      latency: number;
      throughput: number;
      error_rate: number;
    };
  };
  realTimeAnalysis?: {
    live_sentiment_trend: number[];
    bias_escalation_alerts: string[];
    conflict_prediction_updates: any[];
    active_participants: number;
    message_velocity: number;
  };
  documentAnalysis?: any;
  voiceAnalysis?: any;
  imageAnalysis?: any;
  predictiveAnalytics?: any;
  promotionDetection?: any;
  bidProposalAnalysis?: any;
  multiDocumentAnalysis?: any;
  companyRelationshipAnalysis?: any;
}

interface RealTimeSummary {
  active_issues: number;
  trending_topics: string[];
  sentiment_overall: number;
  bias_level: number;
  conflict_risk: number;
}

interface RealTimeBehavior {
  typing_pattern: string;
  response_consistency: number;
  emotional_volatility: number;
  influence_trend: number[];
  engagement_level: number;
}

interface AdvancedUnifiedAnalysisPlatformProps {
  selectedRoomId: string;
}

const AdvancedUnifiedAnalysisPlatform: React.FC<AdvancedUnifiedAnalysisPlatformProps> = ({ selectedRoomId }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [analysisResults, setAnalysisResults] = useState<AdvancedAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: '2025-07-12',
    endDate: '2025-07-14',
    startTime: '00:00',
    endTime: '23:59'
  });
  const [testContent, setTestContent] = useState('');
  const [systemStatus, setSystemStatus] = useState('idle');
  const [analysisMode, setAnalysisMode] = useState('comprehensive');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [predictiveMode, setPredictiveMode] = useState(false);
  const [advancedVisualization, setAdvancedVisualization] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 자동 새로고침
  useEffect(() => {
    if (autoRefresh && analysisResults) {
      autoRefreshRef.current = setInterval(() => {
        runAdvancedAnalysis();
      }, refreshInterval * 1000);
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, analysisResults]);

  const runAdvancedAnalysis = async () => {
    if (!testContent.trim()) {
      alert('분석할 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setAnalysisProgress(0);
    setSystemStatus('analyzing');

    try {
      setAnalysisProgress(20);
      const response = await fetch('http://localhost:8000/api/v7/advanced-unified-analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: testContent,
          room_id: selectedRoomId,
          time_range: timeRange,
          analysis_mode: analysisMode,
          ai_analysis: aiAnalysisEnabled,
          predictive_mode: predictiveMode,
          real_time_mode: realTimeMode,
          advanced_visualization: advancedVisualization
        })
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error('고도화된 통합 분석 실패');
      }

      setAnalysisProgress(100);
      setAnalysisResults(data.advanced_analysis);
      setSystemStatus('completed');

    } catch (error) {
      console.error('고도화된 통합 분석 오류:', error);
      alert('분석 중 오류가 발생했습니다.');
      setSystemStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getConflictLevelColor = (level: string) => {
    switch (level) {
      case '높음': return 'text-red-600';
      case '보통': return 'text-yellow-600';
      case '낮음': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getUrgencyLevelColor = (level: string) => {
    switch (level) {
      case '높음': return 'text-red-600';
      case '보통': return 'text-yellow-600';
      case '낮음': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getBiasColor = (score: number) => {
    if (score > 0.6) return 'text-red-600';
    if (score > 0.3) return 'text-orange-600';
    if (score < -0.3) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'analyzing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="advanced-unified-analysis-platform p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          최첨단 AI 통합 분석 플랫폼
        </h2>
        <p className="text-gray-600">
          실시간 AI 분석, 고급 예측 모델링, 정교한 편향성 분석을 통합한 차세대 분석 시스템
        </p>
      </div>

      {/* 고급 설정 패널 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${getSystemStatusColor(systemStatus)}`}></div>
            <span className="text-sm font-medium">
              시스템 상태: {
                systemStatus === 'completed' ? '완료' :
                  systemStatus === 'analyzing' ? '분석 중' :
                    systemStatus === 'error' ? '오류' : '대기'
              }
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={aiAnalysisEnabled}
                onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">AI 분석</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={predictiveMode}
                onChange={(e) => setPredictiveMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">예측 모델</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={realTimeMode}
                onChange={(e) => setRealTimeMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">실시간 모드</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={advancedVisualization}
                onChange={(e) => setAdvancedVisualization(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">고급 시각화</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">자동 새로고침</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value={10}>10초</option>
                <option value={30}>30초</option>
                <option value={60}>1분</option>
                <option value={300}>5분</option>
              </select>
            )}
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              aria-label="분석 모드 선택"
            >
              <option value="comprehensive">종합 분석</option>
              <option value="quick">빠른 분석</option>
              <option value="detailed">상세 분석</option>
            </select>
          </div>
        </div>
      </div>

      {/* 시간 범위 설정 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">분석 시간 범위 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
            <input
              type="date"
              value={timeRange.startDate}
              onChange={(e) => setTimeRange({ ...timeRange, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              aria-label="시작 날짜"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
            <input
              type="date"
              value={timeRange.endDate}
              onChange={(e) => setTimeRange({ ...timeRange, endDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              aria-label="종료 날짜"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
            <input
              type="time"
              value={timeRange.startTime}
              onChange={(e) => setTimeRange({ ...timeRange, startTime: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              aria-label="시작 시간"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
            <input
              type="time"
              value={timeRange.endTime}
              onChange={(e) => setTimeRange({ ...timeRange, endTime: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              aria-label="종료 시간"
            />
          </div>
        </div>
      </div>

      {/* 분석 입력 */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">분석할 대화 내용 입력</h3>
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="예: 2025년 7월 12일부터 7월 14일 기준, 행복한소유☆개포우성7차의 대화 내용을 입력하세요..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
          aria-label="분석할 대화 내용"
        />
        <button
          onClick={runAdvancedAnalysis}
          disabled={loading}
          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? `고도화된 분석 중... ${analysisProgress}%` : '최첨단 통합 분석 실행'}
        </button>
      </div>

      {loading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">분석 진행률: {analysisProgress}%</p>
        </div>
      )}

      {analysisResults && (
        <div className="space-y-6">
          {/* 실시간 알림 패널 */}
          <RealTimeNotifications
            analysisData={analysisResults}
            realTimeData={analysisResults.realTimeAnalysis}
          />

          {/* 뷰 네비게이션 */}
          <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'dashboard', label: '대시보드', icon: '📊' },
              { id: 'issues', label: '이슈 분석', icon: '🔍' },
              { id: 'participants', label: '참여자 분석', icon: '👥' },
              { id: 'construction-bias', label: '시공사 성향', icon: '🏗️' },
              { id: 'ai-insights', label: 'AI 인사이트', icon: '🤖' },
              { id: 'predictive', label: '예측 분석', icon: '🔮' },
              { id: 'real-time', label: '실시간 분석', icon: '⚡' },
              { id: 'advanced-viz', label: '고급 시각화', icon: '📈' },
              { id: 'timeline', label: '시간별 분석', icon: '⏰' },
              { id: 'insights', label: '종합 인사이트', icon: '💡' },
              { id: 'documents', label: '문서 분석', icon: '📄' },
              { id: 'voice', label: '음성 분석', icon: '🎤' },
              { id: 'images', label: '이미지 분석', icon: '🖼️' },
              { id: 'promotion', label: '홍보 감지', icon: '📢' },
              { id: 'bid-proposal', label: '입찰 분석', icon: '📋' },
              { id: 'multi-document', label: '다중 문서', icon: '📚' },
              { id: 'company-relationship', label: '기업 관계', icon: '🏢' },
              { id: 'details', label: '상세 결과', icon: '📋' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-t-lg flex items-center space-x-2 whitespace-nowrap ${activeView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>

          {/* 뷰 콘텐츠 */}
          <div className="min-h-96">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* 대시보드 요약 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">총 이슈</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisResults.overallAnalysis.total_issues}
                    </p>
                    <p className="text-sm text-blue-600">감지된 이슈</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800">높은 갈등</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {analysisResults.overallAnalysis.high_conflict_issues}
                    </p>
                    <p className="text-sm text-red-600">갈등 이슈</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">긴급 이슈</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResults.overallAnalysis.high_urgency_issues}
                    </p>
                    <p className="text-sm text-orange-600">긴급 처리 필요</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">AI 정확도</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {analysisResults.systemMetrics.ai_model_performance?.sentiment_accuracy?.toFixed(0) || analysisResults.systemMetrics.analysis_accuracy.toFixed(0)}%
                    </p>
                    <p className="text-sm text-green-600">AI 모델 성능</p>
                  </div>
                </div>

                {/* 실시간 요약 */}
                {analysisResults.overallAnalysis.real_time_summary && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">⚡ 실시간 요약</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{analysisResults.overallAnalysis.real_time_summary.active_issues}</p>
                        <p className="text-sm text-gray-600">활성 이슈</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{analysisResults.overallAnalysis.real_time_summary.sentiment_overall.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">전체 감정</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{analysisResults.overallAnalysis.real_time_summary.bias_level.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">편향성 수준</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{analysisResults.overallAnalysis.real_time_summary.conflict_risk.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">갈등 위험</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{analysisResults.realTimeAnalysis?.active_participants || 0}</p>
                        <p className="text-sm text-gray-600">활성 참여자</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 인사이트 미리보기 */}
                {analysisResults.overallAnalysis.ai_generated_insights && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">🤖 AI 인사이트</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResults.overallAnalysis.ai_generated_insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 text-xs rounded ${insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' :
                                insight.type === 'anomaly' ? 'bg-red-100 text-red-800' :
                                  insight.type === 'trend' ? 'bg-green-100 text-green-800' :
                                    insight.type === 'risk' ? 'bg-orange-100 text-orange-800' :
                                      'bg-yellow-100 text-yellow-800'
                              }`}>
                              {insight.type}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence.toFixed(0)}%
                              </span>
                              <span className={`text-xs ${getUrgencyColor(insight.urgency_level)}`}>
                                {insight.urgency_level}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                          <p className="text-xs text-gray-600">{insight.description}</p>
                          <div className="mt-2">
                            <span className={`text-xs font-bold ${getImpactColor(insight.impact_score)}`}>
                              영향도: {insight.impact_score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 예측 모델 결과 */}
                {analysisResults.overallAnalysis.predictive_models && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">🔮 예측 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">갈등 확률</p>
                        <p className="text-lg font-bold text-red-600">
                          {(analysisResults.overallAnalysis.predictive_models.conflict_prediction * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">편향성 확대</p>
                        <p className="text-lg font-bold text-orange-600">
                          {(analysisResults.overallAnalysis.predictive_models.bias_escalation * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">해결 가능성</p>
                        <p className="text-lg font-bold text-green-600">
                          {(analysisResults.overallAnalysis.predictive_models.resolution_probability * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 시간 범위 정보 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">분석 시간 범위</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">시작: {analysisResults.timeRange.startDate} {analysisResults.timeRange.startTime}</p>
                      <p className="text-sm text-gray-600">종료: {analysisResults.timeRange.endDate} {analysisResults.timeRange.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">채팅방: {analysisResults.roomInfo.room_name}</p>
                      <p className="text-sm text-gray-600">총 메시지: {analysisResults.roomInfo.total_messages}개</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 고급 시각화 뷰 */}
            {activeView === 'advanced-viz' && (
              <AdvancedVisualization
                analysisData={analysisResults}
                realTimeData={analysisResults?.realTimeAnalysis}
              />
            )}

            {/* 나머지 뷰들은 기존과 동일하게 유지하되, AI 인사이트와 예측 분석 뷰 추가 */}
            {activeView === 'ai-insights' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">🤖 AI 인사이트</h3>
                {analysisResults.overallAnalysis.ai_generated_insights?.map((insight, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' :
                            insight.type === 'anomaly' ? 'bg-red-100 text-red-800' :
                              insight.type === 'trend' ? 'bg-green-100 text-green-800' :
                                insight.type === 'risk' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                          }`}>
                          {insight.type}
                        </span>
                        <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence.toFixed(0)}% 신뢰도
                        </span>
                        <span className={`text-xs ${getUrgencyColor(insight.urgency_level)}`}>
                          {insight.urgency_level}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-bold ${getImpactColor(insight.impact_score)}`}>
                        영향도: {insight.impact_score.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">권장사항:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {insight.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'predictive' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">🔮 예측 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">갈등 예측</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>갈등 확률:</span>
                        <span className="font-bold text-red-600">
                          {(analysisResults.overallAnalysis.predictive_models?.conflict_prediction * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>확대 위험:</span>
                        <span className="font-bold text-orange-600">
                          {(analysisResults.overallAnalysis.predictive_models?.bias_escalation * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>해결 가능성:</span>
                        <span className="font-bold text-green-600">
                          {(analysisResults.overallAnalysis.predictive_models?.resolution_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">행동 예측</h4>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>참여자 행동:</strong> {analysisResults.issueSections[0]?.predictive_analysis?.participant_behavior_prediction}</p>
                      <p className="text-sm"><strong>기업 관계:</strong> {analysisResults.issueSections[0]?.predictive_analysis?.company_relationship_forecast}</p>
                      <p className="text-sm"><strong>해결 시간:</strong> {analysisResults.issueSections[0]?.predictive_analysis?.resolution_time}일 예상</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'real-time' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">⚡ 실시간 분석</h3>
                {analysisResults.realTimeAnalysis && (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">편향성 확대 알림</h4>
                      <div className="space-y-1">
                        {analysisResults.realTimeAnalysis.bias_escalation_alerts.map((alert, index) => (
                          <p key={index} className="text-sm text-yellow-700">⚠️ {alert}</p>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">감정 트렌드</h4>
                      <div className="h-32 bg-white rounded border p-2">
                        <p className="text-sm text-gray-600">실시간 감정 분석 차트가 여기에 표시됩니다.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">활성 참여자</p>
                        <p className="text-lg font-bold text-green-600">{analysisResults.realTimeAnalysis.active_participants}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">메시지 속도</p>
                        <p className="text-lg font-bold text-blue-600">{analysisResults.realTimeAnalysis.message_velocity}/분</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">실시간 성능</p>
                        <p className="text-lg font-bold text-purple-600">{analysisResults.systemMetrics.real_time_performance?.latency || 0}ms</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 기존 뷰들은 유지하되 간단히 표시 */}
            {activeView === 'issues' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">이슈 분석</h3>
                <p className="text-gray-600">고도화된 이슈 분석 기능이 통합 분석에 포함되어 있습니다.</p>
              </div>
            )}

            {activeView === 'participants' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">참여자 분석</h3>
                <p className="text-gray-600">고도화된 참여자 분석 기능이 통합 분석에 포함되어 있습니다.</p>
              </div>
            )}

            {activeView === 'construction-bias' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">시공사 성향 분석</h3>
                <p className="text-gray-600">고도화된 시공사 성향 분석 기능이 통합 분석에 포함되어 있습니다.</p>
              </div>
            )}

            {/* 나머지 뷰들도 간단히 표시 */}
            {['timeline', 'insights', 'documents', 'voice', 'images', 'promotion', 'bid-proposal', 'multi-document', 'company-relationship', 'details'].includes(activeView) && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {activeView === 'timeline' ? '시간별 분석' :
                    activeView === 'insights' ? '종합 인사이트' :
                      activeView === 'documents' ? '문서 분석' :
                        activeView === 'voice' ? '음성 분석' :
                          activeView === 'images' ? '이미지 분석' :
                            activeView === 'promotion' ? '홍보 감지' :
                              activeView === 'bid-proposal' ? '입찰 분석' :
                                activeView === 'multi-document' ? '다중 문서' :
                                  activeView === 'company-relationship' ? '기업 관계' :
                                    '상세 결과'}
                </h3>
                <p className="text-gray-600">고도화된 {activeView} 기능이 통합 분석에 포함되어 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUnifiedAnalysisPlatform; 