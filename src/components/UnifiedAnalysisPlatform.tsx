import React, { useState, useEffect } from 'react';

interface UnifiedAnalysisResult {
  integratedAnalysis: any;
  realTimeData: {
    conversationSummary: any;
    biasAnalysis: any;
    promotionDetection: any;
    documentAnalysis: any;
    relationshipAnalysis: any;
  };
  crossAnalysis: {
    overallBias: Record<string, number>;
    keyPatterns: string[];
    riskAssessment: Record<string, string>;
    recommendations: string[];
    confidenceScore: number;
    insights: string[];
  };
  systemMetrics: {
    analysisModules: string[];
    processingTime: number;
    dataQuality: number;
    systemHealth: string;
  };
}

interface UnifiedAnalysisPlatformProps {
  selectedRoomId: string;
}

const UnifiedAnalysisPlatform: React.FC<UnifiedAnalysisPlatformProps> = ({ selectedRoomId }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [analysisResults, setAnalysisResults] = useState<UnifiedAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testContent, setTestContent] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState('idle');

  const runUnifiedAnalysis = async () => {
    if (!testContent.trim()) {
      alert('분석할 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setAnalysisProgress(0);
    setSystemStatus('analyzing');

    try {
      // 통합 분석 API 호출
      setAnalysisProgress(20);
      const integratedResponse = await fetch('http://localhost:8000/api/v7/integrated-analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: testContent, room_id: selectedRoomId })
      });
      const integratedData = await integratedResponse.json();

      if (!integratedData.success) {
        throw new Error('통합 분석 실패');
      }

      setAnalysisProgress(60);

      // 실시간 데이터 수집 (통합 분석 결과에서 추출)
      const realTimeData = extractRealTimeData(integratedData.integrated_analysis);

      setAnalysisProgress(80);

      // 교차 분석 수행
      const crossAnalysis = performCrossAnalysis(integratedData.integrated_analysis, realTimeData);

      setAnalysisProgress(90);

      // 시스템 메트릭 계산
      const systemMetrics = calculateSystemMetrics(integratedData.integrated_analysis, realTimeData);

      setAnalysisProgress(100);

      const results: UnifiedAnalysisResult = {
        integratedAnalysis: integratedData.integrated_analysis,
        realTimeData,
        crossAnalysis,
        systemMetrics
      };

      setAnalysisResults(results);
      setSystemStatus('completed');

    } catch (error) {
      console.error('통합 분석 오류:', error);
      alert('분석 중 오류가 발생했습니다.');
      setSystemStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const extractRealTimeData = (integratedAnalysis: any) => {
    return {
      conversationSummary: integratedAnalysis.kakao_analysis || null,
      biasAnalysis: integratedAnalysis.construction_bias || null,
      promotionDetection: integratedAnalysis.promotion_detection || null,
      documentAnalysis: integratedAnalysis.multi_document_analysis || null,
      relationshipAnalysis: integratedAnalysis.company_relationship_analysis || null
    };
  };

  const performCrossAnalysis = (integratedAnalysis: any, realTimeData: any) => {
    const overallBias: Record<string, number> = {};
    const keyPatterns: string[] = [];
    const riskAssessment: Record<string, string> = {};
    const recommendations: string[] = [];
    const insights: string[] = [];

    // 편향성 통합
    if (integratedAnalysis?.cross_analysis?.overall_bias) {
      Object.assign(overallBias, integratedAnalysis.cross_analysis.overall_bias);
    }

    // 패턴 통합
    if (integratedAnalysis?.cross_analysis?.key_patterns) {
      keyPatterns.push(...integratedAnalysis.cross_analysis.key_patterns);
    }

    // 위험도 평가
    if (integratedAnalysis?.risk_assessment) {
      Object.assign(riskAssessment, integratedAnalysis.risk_assessment);
    }

    // 권장사항 통합
    if (integratedAnalysis?.recommendations) {
      recommendations.push(...integratedAnalysis.recommendations);
    }

    // 인사이트 통합
    if (integratedAnalysis?.key_insights) {
      insights.push(...integratedAnalysis.key_insights);
    }

    // 신뢰도 계산
    const completedAnalyses = [
      realTimeData.conversationSummary,
      realTimeData.biasAnalysis,
      realTimeData.promotionDetection,
      realTimeData.documentAnalysis,
      realTimeData.relationshipAnalysis
    ].filter(Boolean).length;

    const confidenceScore = (completedAnalyses / 5) * 100;

    return {
      overallBias,
      keyPatterns,
      riskAssessment,
      recommendations,
      confidenceScore,
      insights
    };
  };

  const calculateSystemMetrics = (integratedAnalysis: any, realTimeData: any) => {
    const analysisModules = [
      'kakao_conversation',
      'construction_bias',
      'promotion_detection',
      'bid_proposal',
      'multi_document',
      'company_relationship'
    ];

    const completedModules = [
      realTimeData.conversationSummary,
      realTimeData.biasAnalysis,
      realTimeData.promotionDetection,
      realTimeData.documentAnalysis,
      realTimeData.relationshipAnalysis
    ].filter(Boolean).length;

    const dataQuality = (completedModules / 5) * 100;
    const systemHealth = dataQuality > 80 ? 'excellent' : dataQuality > 60 ? 'good' : 'poor';

    return {
      analysisModules,
      processingTime: Date.now(),
      dataQuality,
      systemHealth
    };
  };

  const getBiasColor = (score: number) => {
    if (score > 0.6) return 'text-red-600';
    if (score > 0.3) return 'text-orange-600';
    if (score < -0.3) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="unified-analysis-platform p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          통합 분석 플랫폼
        </h2>
        <p className="text-gray-600">
          모든 분석 기능을 통합한 종합적인 분석 시스템
        </p>
      </div>

      {/* 시스템 상태 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${systemStatus === 'completed' ? 'bg-green-500' :
                systemStatus === 'analyzing' ? 'bg-yellow-500' :
                  systemStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
            <span className="text-sm font-medium">
              시스템 상태: {
                systemStatus === 'completed' ? '완료' :
                  systemStatus === 'analyzing' ? '분석 중' :
                    systemStatus === 'error' ? '오류' : '대기'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`px-3 py-1 text-sm rounded ${realTimeMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
              실시간 모드
            </button>
          </div>
        </div>
      </div>

      {/* 분석 입력 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">분석할 내용 입력</h3>
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="예: 중흥건설이 쓰레기 같다. 전라도 기업이라 문제가 많다. 삼성물산이 최고다. 홍보 논리가 보인다."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
        />
        <button
          onClick={runUnifiedAnalysis}
          disabled={loading}
          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? `통합 분석 중... ${analysisProgress}%` : '통합 분석 실행'}
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
          {/* 뷰 네비게이션 */}
          <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'dashboard', label: '대시보드', icon: '📊' },
              { id: 'analysis', label: '통합 분석', icon: '🔍' },
              { id: 'realtime', label: '실시간 데이터', icon: '⚡' },
              { id: 'cross', label: '교차 분석', icon: '🔗' },
              { id: 'metrics', label: '시스템 메트릭', icon: '📈' },
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
                    <h4 className="font-semibold text-blue-800">신뢰도</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisResults.crossAnalysis.confidenceScore.toFixed(0)}%
                    </p>
                    <p className="text-sm text-blue-600">분석 정확도</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">편향 패턴</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResults.crossAnalysis.keyPatterns.length}
                    </p>
                    <p className="text-sm text-orange-600">감지된 패턴</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800">위험 기업</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {Object.keys(analysisResults.crossAnalysis.riskAssessment).length}
                    </p>
                    <p className="text-sm text-red-600">높은 편향성</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">시스템 상태</h4>
                    <p className={`text-2xl font-bold ${getSystemHealthColor(analysisResults.systemMetrics.systemHealth)}`}>
                      {analysisResults.systemMetrics.systemHealth === 'excellent' ? '우수' :
                        analysisResults.systemMetrics.systemHealth === 'good' ? '양호' : '불량'}
                    </p>
                    <p className="text-sm text-green-600">데이터 품질</p>
                  </div>
                </div>

                {/* 핵심 인사이트 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">핵심 인사이트</h3>
                  <div className="space-y-2">
                    {analysisResults.crossAnalysis.insights.slice(0, 5).map((insight, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 권장사항 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">권장사항</h3>
                  <div className="space-y-3">
                    {analysisResults.crossAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analysis' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">통합 분석 결과</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(analysisResults.integratedAnalysis, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeView === 'realtime' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">실시간 데이터</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">대화 분석</h4>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(analysisResults.realTimeData.conversationSummary, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">편향 분석</h4>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(analysisResults.realTimeData.biasAnalysis, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">홍보 감지</h4>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(analysisResults.realTimeData.promotionDetection, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">문서 분석</h4>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(analysisResults.realTimeData.documentAnalysis, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'cross' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">교차 분석</h3>

                {/* 전체 편향성 */}
                <div>
                  <h4 className="font-semibold mb-4">전체 편향성 평가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysisResults.crossAnalysis.overallBias).map(([company, score]) => (
                      <div key={company} className="p-3 border border-gray-200 rounded-lg">
                        <p className="font-semibold">{company}</p>
                        <p className={`text-lg font-bold ${getBiasColor(score)}`}>
                          {score > 0 ? '+' : ''}{score.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {score > 0.3 ? '우호적' : score < -0.3 ? '비하적' : '중립적'}
                        </p>
                        {analysisResults.crossAnalysis.riskAssessment[company] && (
                          <p className="text-xs text-red-600">
                            위험도: {analysisResults.crossAnalysis.riskAssessment[company]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 핵심 패턴 */}
                <div>
                  <h4 className="font-semibold mb-4">감지된 핵심 패턴</h4>
                  <div className="space-y-2">
                    {analysisResults.crossAnalysis.keyPatterns.map((pattern, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'metrics' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">시스템 메트릭</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">분석 모듈</h4>
                    <ul className="text-sm space-y-1">
                      {analysisResults.systemMetrics.analysisModules.map((module, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{module}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">시스템 상태</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>데이터 품질:</span>
                        <span className="font-semibold">{analysisResults.systemMetrics.dataQuality.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>시스템 상태:</span>
                        <span className={`font-semibold ${getSystemHealthColor(analysisResults.systemMetrics.systemHealth)}`}>
                          {analysisResults.systemMetrics.systemHealth === 'excellent' ? '우수' :
                            analysisResults.systemMetrics.systemHealth === 'good' ? '양호' : '불량'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>처리 시간:</span>
                        <span className="font-semibold">{new Date(analysisResults.systemMetrics.processingTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">상세 결과</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(analysisResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedAnalysisPlatform; 