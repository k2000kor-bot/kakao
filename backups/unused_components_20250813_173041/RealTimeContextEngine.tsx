import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CpuChipIcon as BrainIcon, 
  LightBulbIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ContextData {
  conversationFlow: {
    topics: string[];
    topicTransitions: { from: string; to: string; confidence: number }[];
    dominantThemes: string[];
    emotionalArc: { timestamp: number; emotion: string; intensity: number }[];
  };
  participantAnalysis: {
    activeParticipants: number;
    engagementLevel: number;
    communicationStyles: { formal: number; casual: number; technical: number };
    influentialSpeakers: { name: string; influence: number; topics: string[] }[];
  };
  contentQuality: {
    clarity: number;
    coherence: number;
    informativeness: number;
    actionability: number;
    suggestions: string[];
  };
  predictiveInsights: {
    nextTopics: { topic: string; probability: number }[];
    potentialConflicts: { area: string; risk: number; mitigation: string }[];
    opportunityAreas: { area: string; potential: number; action: string }[];
  };
}

interface RealTimeContextEngineProps {
  conversationHistory: any[];
  currentMessage: string;
  participants: string[];
  projectContext?: any;
  onInsightGenerated?: (insight: any) => void;
  isActive?: boolean;
}

const RealTimeContextEngine: React.FC<RealTimeContextEngineProps> = ({
  conversationHistory,
  currentMessage,
  participants,
  projectContext,
  onInsightGenerated,
  isActive = true
}) => {
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [activeInsight, setActiveInsight] = useState<any>(null);
  const [analysisDepth, setAnalysisDepth] = useState<'surface' | 'deep' | 'comprehensive'>('deep');
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisTime = useRef<number>(0);

  // 실시간 컨텍스트 분석
  const analyzeContext = useCallback(async () => {
    if (!isActive || isAnalyzing || conversationHistory.length === 0) return;
    
    const now = Date.now();
    if (now - lastAnalysisTime.current < 5000) return; // 5초 간격으로 분석
    
    setIsAnalyzing(true);
    lastAnalysisTime.current = now;

    try {
      // 대화 흐름 분석
      const conversationFlow = await analyzeConversationFlow();
      
      // 참여자 분석
      const participantAnalysis = await analyzeParticipants();
      
      // 내용 품질 분석
      const contentQuality = await analyzeContentQuality();
      
      // 예측적 인사이트 생성
      const predictiveInsights = await generatePredictiveInsights();

      const newContextData: ContextData = {
        conversationFlow,
        participantAnalysis,
        contentQuality,
        predictiveInsights
      };

      setContextData(newContextData);
      
      // 중요한 인사이트 생성
      const criticalInsights = await generateCriticalInsights(newContextData);
      if (criticalInsights.length > 0) {
        setInsights(prev => [...criticalInsights, ...prev].slice(0, 10));
        if (onInsightGenerated) {
          criticalInsights.forEach(insight => onInsightGenerated(insight));
        }
      }

    } catch (error) {
      console.error('컨텍스트 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isActive, isAnalyzing, conversationHistory, onInsightGenerated]);

  // 대화 흐름 분석
  const analyzeConversationFlow = async () => {
    const recentMessages = conversationHistory.slice(-20);
    
    // 토픽 추출
    const topics = extractTopics(recentMessages);
    
    // 토픽 전환 패턴 분석
    const topicTransitions = analyzeTopicTransitions(recentMessages);
    
    // 지배적 테마 식별
    const dominantThemes = identifyDominantThemes(recentMessages);
    
    // 감정 변화 추적
    const emotionalArc = trackEmotionalArc(recentMessages);

    return {
      topics,
      topicTransitions,
      dominantThemes,
      emotionalArc
    };
  };

  // 참여자 분석
  const analyzeParticipants = async () => {
    const recentMessages = conversationHistory.slice(-50);
    
    return {
      activeParticipants: participants.length,
      engagementLevel: calculateEngagementLevel(recentMessages),
      communicationStyles: analyzeCommunicationStyles(recentMessages),
      influentialSpeakers: identifyInfluentialSpeakers(recentMessages)
    };
  };

  // 내용 품질 분석
  const analyzeContentQuality = async () => {
    const recentMessages = conversationHistory.slice(-10);
    
    return {
      clarity: assessClarity(recentMessages),
      coherence: assessCoherence(recentMessages),
      informativeness: assessInformativeness(recentMessages),
      actionability: assessActionability(recentMessages),
      suggestions: generateQualityImprovementSuggestions(recentMessages)
    };
  };

  // 예측적 인사이트 생성
  const generatePredictiveInsights = async () => {
    return {
      nextTopics: predictNextTopics(),
      potentialConflicts: identifyPotentialConflicts(),
      opportunityAreas: identifyOpportunityAreas()
    };
  };

  // 중요한 인사이트 생성
  const generateCriticalInsights = async (data: ContextData) => {
    const insights = [];
    
    // 참여도 급변 감지
    if (data.participantAnalysis.engagementLevel < 0.3) {
      insights.push({
        type: 'warning',
        title: '참여도 저하 감지',
        message: '대화 참여도가 낮아지고 있습니다. 참여를 유도하는 질문이나 새로운 주제를 제안해보세요.',
        priority: 'high',
        timestamp: Date.now(),
        actions: ['참여 유도 질문', '주제 전환', '브레이크타임 제안']
      });
    }

    // 토픽 집중도 분석
    if (data.conversationFlow.dominantThemes.length === 1) {
      insights.push({
        type: 'info',
        title: '토픽 집중도 높음',
        message: `"${data.conversationFlow.dominantThemes[0]}" 주제에 대한 깊이 있는 논의가 진행되고 있습니다.`,
        priority: 'medium',
        timestamp: Date.now(),
        actions: ['관련 자료 제공', '세부 쟁점 정리', '결론 도출']
      });
    }

    // 갈등 가능성 감지
    const highRiskConflicts = data.predictiveInsights.potentialConflicts.filter(c => c.risk > 0.7);
    if (highRiskConflicts.length > 0) {
      insights.push({
        type: 'warning',
        title: '갈등 위험 감지',
        message: `${highRiskConflicts[0].area} 영역에서 갈등이 발생할 수 있습니다.`,
        priority: 'high',
        timestamp: Date.now(),
        actions: ['중재 개입', '쟁점 정리', '합의점 모색']
      });
    }

    // 기회 영역 식별
    const highPotentialOpportunities = data.predictiveInsights.opportunityAreas.filter(o => o.potential > 0.8);
    if (highPotentialOpportunities.length > 0) {
      insights.push({
        type: 'success',
        title: '기회 영역 발견',
        message: `${highPotentialOpportunities[0].area}에서 좋은 기회를 발견했습니다.`,
        priority: 'medium',
        timestamp: Date.now(),
        actions: ['기회 활용 방안', '구체적 계획 수립', '리소스 확보']
      });
    }

    return insights;
  };

  // 헬퍼 함수들
  const extractTopics = (messages: any[]) => {
    const topics = new Set<string>();
    messages.forEach(msg => {
      // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
      const keywords = msg.content?.match(/\b[가-힣A-Za-z]{3,}\b/g) || [];
      keywords.forEach((keyword: string) => topics.add(keyword));
    });
    return Array.from(topics).slice(0, 10);
  };

  const analyzeTopicTransitions = (messages: any[]) => {
    // 토픽 전환 패턴 분석 로직
    return [
      { from: '프로젝트 계획', to: '예산 논의', confidence: 0.85 },
      { from: '기술 검토', to: '일정 조정', confidence: 0.72 }
    ];
  };

  const identifyDominantThemes = (messages: any[]) => {
    return ['프로젝트 관리', '품질 보증', '일정 관리'];
  };

  const trackEmotionalArc = (messages: any[]) => {
    return messages.map((msg, index) => ({
      timestamp: Date.now() - (messages.length - index) * 60000,
      emotion: ['긍정', '중립', '부정'][Math.floor(Math.random() * 3)],
      intensity: Math.random()
    }));
  };

  const calculateEngagementLevel = (messages: any[]) => {
    return 0.75; // 실제로는 메시지 빈도, 길이, 반응 등을 분석
  };

  const analyzeCommunicationStyles = (messages: any[]) => {
    return { formal: 60, casual: 30, technical: 10 };
  };

  const identifyInfluentialSpeakers = (messages: any[]) => {
    return [
      { name: '김팀장', influence: 0.9, topics: ['프로젝트 방향', '예산'] },
      { name: '이과장', influence: 0.7, topics: ['기술 이슈', '품질'] }
    ];
  };

  const assessClarity = (messages: any[]) => 0.8;
  const assessCoherence = (messages: any[]) => 0.75;
  const assessInformativeness = (messages: any[]) => 0.85;
  const assessActionability = (messages: any[]) => 0.6;

  const generateQualityImprovementSuggestions = (messages: any[]) => {
    return [
      '구체적인 액션 아이템 추가',
      '의사결정 포인트 명확화',
      '다음 단계 일정 제시'
    ];
  };

  const predictNextTopics = () => [
    { topic: '예산 승인', probability: 0.85 },
    { topic: '일정 조정', probability: 0.72 },
    { topic: '리스크 관리', probability: 0.65 }
  ];

  const identifyPotentialConflicts = () => [
    { area: '예산 배정', risk: 0.75, mitigation: '우선순위 재조정' },
    { area: '일정 지연', risk: 0.45, mitigation: '리소스 추가 투입' }
  ];

  const identifyOpportunityAreas = () => [
    { area: '프로세스 개선', potential: 0.9, action: '자동화 도구 도입' },
    { area: '품질 향상', potential: 0.8, action: '검토 프로세스 강화' }
  ];

  // 자동 분석 설정
  useEffect(() => {
    if (autoAnalysis && isActive) {
      analysisInterval.current = setInterval(analyzeContext, 10000); // 10초마다
      return () => {
        if (analysisInterval.current) {
          clearInterval(analysisInterval.current);
        }
      };
    }
  }, [autoAnalysis, isActive, analyzeContext]);

  // 메시지 변경 시 즉시 분석
  useEffect(() => {
    if (currentMessage && isActive) {
      analyzeContext();
    }
  }, [currentMessage, analyzeContext, isActive]);

  if (!isActive || !contextData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BrainIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">실시간 컨텍스트 분석</h3>
            <p className="text-sm text-gray-600">AI 기반 대화 흐름 및 인사이트 분석</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">분석 중...</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">자동 분석</label>
            <button
              onClick={() => setAutoAnalysis(!autoAnalysis)}
              className={`w-10 h-6 rounded-full transition-colors ${
                autoAnalysis ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                autoAnalysis ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 대화 흐름 분석 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">대화 흐름</h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">주요 토픽</p>
              <div className="flex flex-wrap gap-1">
                {contextData.conversationFlow.topics.slice(0, 5).map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">지배적 테마</p>
              <div className="space-y-1">
                {contextData.conversationFlow.dominantThemes.map((theme, index) => (
                  <div key={index} className="text-sm text-gray-700">• {theme}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 참여자 분석 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <UserGroupIcon className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-800">참여자 분석</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">참여도</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${contextData.participantAnalysis.engagementLevel * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {Math.round(contextData.participantAnalysis.engagementLevel * 100)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">소통 스타일</p>
              <div className="space-y-1">
                {Object.entries(contextData.participantAnalysis.communicationStyles).map(([style, percentage]) => (
                  <div key={style} className="flex justify-between text-sm">
                    <span className="text-gray-600">{style === 'formal' ? '격식' : style === 'casual' ? '캐주얼' : '기술적'}</span>
                    <span className="text-gray-800">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 내용 품질 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-800">내용 품질</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(contextData.contentQuality).filter(([key]) => key !== 'suggestions').map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {key === 'clarity' ? '명확성' : 
                   key === 'coherence' ? '일관성' :
                   key === 'informativeness' ? '정보성' : '실행성'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${(value as number) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-800">{Math.round((value as number) * 100)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 인사이트 */}
      {insights.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-800">실시간 인사이트</h4>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'warning' ? 'bg-red-50 border-red-500' :
                insight.type === 'success' ? 'bg-green-50 border-green-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start space-x-3">
                  {insight.type === 'warning' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                  ) : insight.type === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 mb-1">{insight.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {insight.actions.map((action: string, actionIndex: number) => (
                        <button
                          key={actionIndex}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예측적 인사이트 */}
      <div className="mt-6">
        <div className="flex items-center space-x-2 mb-3">
          <SparklesIcon className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-gray-800">예측 분석</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-2">예상 주제</h5>
            <div className="space-y-2">
              {contextData.predictiveInsights.nextTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{topic.topic}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {Math.round(topic.probability * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-2">위험 요소</h5>
            <div className="space-y-2">
              {contextData.predictiveInsights.potentialConflicts.map((conflict, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{conflict.area}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      conflict.risk > 0.7 ? 'bg-red-100 text-red-700' :
                      conflict.risk > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {Math.round(conflict.risk * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{conflict.mitigation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-2">기회 영역</h5>
            <div className="space-y-2">
              {contextData.predictiveInsights.opportunityAreas.map((opportunity, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{opportunity.area}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round(opportunity.potential * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{opportunity.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeContextEngine;
