import React, { useState, useEffect, useRef } from 'react';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  CogIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AIAnalysisResult {
  id: string;
  type: 'sentiment' | 'intent' | 'personality' | 'context' | 'prediction' | 'recommendation';
  confidence: number;
  score: number;
  description: string;
  evidence: string[];
  metadata: {
    processingTime: number;
    modelVersion: string;
    algorithm: string;
    timestamp: Date;
  };
}

interface ConversationInsight {
  id: string;
  category: 'emotional' | 'cognitive' | 'social' | 'behavioral';
  insight: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface PredictiveAnalysis {
  nextIntent: string;
  confidence: number;
  suggestedActions: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface AdvancedAIAnalysisEngineProps {
  messages: any[];
  onAnalysisComplete?: (results: AIAnalysisResult[]) => void;
  onInsightGenerated?: (insights: ConversationInsight[]) => void;
  onPredictionGenerated?: (prediction: PredictiveAnalysis) => void;
}

const AdvancedAIAnalysisEngine: React.FC<AdvancedAIAnalysisEngineProps> = ({
  messages,
  onAnalysisComplete,
  onInsightGenerated,
  onPredictionGenerated
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [insights, setInsights] = useState<ConversationInsight[]>([]);
  const [prediction, setPrediction] = useState<PredictiveAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>('');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const analysisQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (messages.length > 0) {
      triggerAnalysis();
    }
  }, [messages]);

  const triggerAnalysis = async () => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // 다단계 분석 실행
    await performMultiStageAnalysis();

    isProcessing.current = false;
    setIsAnalyzing(false);
  };

  const performMultiStageAnalysis = async () => {
    const stages = [
      { name: '감정 분석', weight: 20 },
      { name: '의도 분석', weight: 25 },
      { name: '성향 분석', weight: 20 },
      { name: '컨텍스트 분석', weight: 15 },
      { name: '예측 분석', weight: 20 }
    ];

    const results: AIAnalysisResult[] = [];
    let totalProgress = 0;

    for (const stage of stages) {
      setCurrentAnalysis(stage.name);
      
      const stageResults = await performStageAnalysis(stage.name);
      results.push(...stageResults);
      
      totalProgress += stage.weight;
      setAnalysisProgress(totalProgress);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setAnalysisResults(results);
    onAnalysisComplete?.(results);

    // 고급 인사이트 생성
    const advancedInsights = await generateAdvancedInsights(results);
    setInsights(advancedInsights);
    onInsightGenerated?.(advancedInsights);

    // 예측 분석
    const predictiveAnalysis = await generatePredictiveAnalysis(results, advancedInsights);
    setPrediction(predictiveAnalysis);
    onPredictionGenerated?.(predictiveAnalysis);
  };

  const performStageAnalysis = async (stageName: string): Promise<AIAnalysisResult[]> => {
    const results: AIAnalysisResult[] = [];

    switch (stageName) {
      case '감정 분석':
        results.push(...await performSentimentAnalysis());
        break;
      case '의도 분석':
        results.push(...await performIntentAnalysis());
        break;
      case '성향 분석':
        results.push(...await performPersonalityAnalysis());
        break;
      case '컨텍스트 분석':
        results.push(...await performContextAnalysis());
        break;
      case '예측 분석':
        results.push(...await performPredictionAnalysis());
        break;
    }

    return results;
  };

  const performSentimentAnalysis = async (): Promise<AIAnalysisResult[]> => {
    const recentMessages = messages.slice(-5);
    const allText = recentMessages.map(m => m.content).join(' ');
    
    const sentimentKeywords = {
      positive: ['좋다', '감사', '행복', '만족', '훌륭', '완벽', '좋은', '긍정'],
      negative: ['나쁘다', '실망', '화나', '불만', '문제', '어려움', '부정'],
      neutral: ['보통', '일반', '중간', '평범', '보통']
    };

    const scores = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
      for (const keyword of keywords) {
        scores[sentiment as keyof typeof scores] += (allText.match(new RegExp(keyword, 'g')) || []).length;
      }
    }

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const dominantSentiment = total > 0 ? 
      Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0] :
      'neutral';

    return [{
      id: `sentiment_${Date.now()}`,
      type: 'sentiment',
      confidence: 0.85,
      score: scores[dominantSentiment as keyof typeof scores] / Math.max(total, 1),
      description: `전체적인 감정 상태는 ${dominantSentiment === 'positive' ? '긍정적' : dominantSentiment === 'negative' ? '부정적' : '중립적'}입니다.`,
      evidence: Object.entries(scores).filter(([_, score]) => score > 0).map(([sentiment, score]) => `${sentiment}: ${score}회`),
      metadata: {
        processingTime: 150,
        modelVersion: 'v2.1',
        algorithm: 'keyword-based-sentiment',
        timestamp: new Date()
      }
    }];
  };

  const performIntentAnalysis = async (): Promise<AIAnalysisResult[]> => {
    const recentMessages = messages.slice(-3);
    const userMessages = recentMessages.filter(m => m.sender === 'user');
    
    const intentPatterns = {
      question: ['무엇', '어떻게', '왜', '언제', '어디', '?', '질문'],
      request: ['해주세요', '부탁', '요청', '도움', '필요'],
      complaint: ['문제', '불만', '어려움', '실패', '화나'],
      appreciation: ['감사', '고마워', '좋다', '훌륭'],
      information: ['알려', '설명', '정보', '상세']
    };

    const intentScores: Record<string, number> = {};
    
    for (const message of userMessages) {
      const text = message.content.toLowerCase();
      
      for (const [intent, patterns] of Object.entries(intentPatterns)) {
        for (const pattern of patterns) {
          if (text.includes(pattern)) {
            intentScores[intent] = (intentScores[intent] || 0) + 1;
          }
        }
      }
    }

    const dominantIntent = Object.entries(intentScores).reduce((a, b) => 
      intentScores[a[0]] > intentScores[b[0]] ? a : b, ['neutral', 0]
    );

    return [{
      id: `intent_${Date.now()}`,
      type: 'intent',
      confidence: 0.8,
      score: dominantIntent[1] / Math.max(Object.values(intentScores).reduce((sum, score) => sum + score, 0), 1),
      description: `사용자의 주요 의도는 ${dominantIntent[0]}입니다.`,
      evidence: Object.entries(intentScores).filter(([_, score]) => score > 0).map(([intent, score]) => `${intent}: ${score}회`),
      metadata: {
        processingTime: 200,
        modelVersion: 'v2.1',
        algorithm: 'pattern-based-intent',
        timestamp: new Date()
      }
    }];
  };

  const performPersonalityAnalysis = async (): Promise<AIAnalysisResult[]> => {
    const allMessages = messages.filter(m => m.sender === 'user');
    const allText = allMessages.map(m => m.content).join(' ');
    
    const personalityTraits = {
      extroversion: ['사람', '친구', '함께', '모임', '대화'],
      introversion: ['혼자', '조용히', '생각', '독서', '차분히'],
      analytical: ['분석', '논리', '이유', '근거', '체계'],
      creative: ['아이디어', '상상', '창의', '예술', '독창'],
      emotional: ['감정', '기분', '느낌', '마음', '심정']
    };

    const traitScores: Record<string, number> = {};
    
    for (const [trait, keywords] of Object.entries(personalityTraits)) {
      for (const keyword of keywords) {
        const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
        traitScores[trait] = (traitScores[trait] || 0) + matches;
      }
    }

    const topTraits = Object.entries(traitScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    return topTraits.map(([trait, score]) => ({
      id: `personality_${trait}_${Date.now()}`,
      type: 'personality',
      confidence: 0.75,
      score: score / Math.max(Object.values(traitScores).reduce((sum, s) => sum + s, 0), 1),
      description: `${trait} 성향이 강하게 나타납니다.`,
      evidence: [`${trait} 관련 키워드 ${score}회 사용`],
      metadata: {
        processingTime: 300,
        modelVersion: 'v2.1',
        algorithm: 'trait-based-personality',
        timestamp: new Date()
      }
    }));
  };

  const performContextAnalysis = async (): Promise<AIAnalysisResult[]> => {
    const recentMessages = messages.slice(-5);
    const topics = extractTopics(recentMessages);
    const urgency = analyzeUrgency(recentMessages);
    const complexity = analyzeComplexity(recentMessages);

    return [{
      id: `context_${Date.now()}`,
      type: 'context',
      confidence: 0.9,
      score: 0.8,
      description: `주요 주제: ${topics.join(', ')}, 긴급도: ${urgency}, 복잡도: ${complexity}`,
      evidence: [`주제: ${topics.length}개`, `긴급도: ${urgency}`, `복잡도: ${complexity}`],
      metadata: {
        processingTime: 250,
        modelVersion: 'v2.1',
        algorithm: 'context-aware-analysis',
        timestamp: new Date()
      }
    }];
  };

  const performPredictionAnalysis = async (): Promise<AIAnalysisResult[]> => {
    const recentMessages = messages.slice(-3);
    const userMessages = recentMessages.filter(m => m.sender === 'user');
    
    const predictions = {
      nextIntent: predictNextIntent(userMessages),
      responseTime: predictResponseTime(userMessages),
      engagement: predictEngagement(userMessages)
    };

    return [{
      id: `prediction_${Date.now()}`,
      type: 'prediction',
      confidence: 0.7,
      score: 0.75,
      description: `예상 다음 의도: ${predictions.nextIntent}, 예상 응답 시간: ${predictions.responseTime}초`,
      evidence: [`의도 예측: ${predictions.nextIntent}`, `응답 시간: ${predictions.responseTime}초`, `참여도: ${predictions.engagement}`],
      metadata: {
        processingTime: 400,
        modelVersion: 'v2.1',
        algorithm: 'temporal-prediction',
        timestamp: new Date()
      }
    }];
  };

  const extractTopics = (messages: any[]): string[] => {
    const topicKeywords = ['프로젝트', '회의', '일정', '문제', '해결', '계획', '보고'];
    const foundTopics: string[] = [];
    
    for (const message of messages) {
      for (const keyword of topicKeywords) {
        if (message.content.includes(keyword) && !foundTopics.includes(keyword)) {
          foundTopics.push(keyword);
        }
      }
    }
    
    return foundTopics;
  };

  const analyzeUrgency = (messages: any[]): string => {
    const urgencyKeywords = ['긴급', '즉시', '당장', '빨리', '시급'];
    const allText = messages.map(m => m.content).join(' ');
    
    const urgencyCount = urgencyKeywords.filter(keyword => allText.includes(keyword)).length;
    
    if (urgencyCount >= 2) return 'high';
    if (urgencyCount >= 1) return 'medium';
    return 'low';
  };

  const analyzeComplexity = (messages: any[]): string => {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    
    if (avgLength > 100) return 'complex';
    if (avgLength > 50) return 'moderate';
    return 'simple';
  };

  const predictNextIntent = (messages: any[]): string => {
    const intents = ['question', 'request', 'appreciation', 'complaint'];
    const weights = [0.3, 0.4, 0.2, 0.1];
    
    // 간단한 확률 기반 예측
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < intents.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return intents[i];
      }
    }
    
    return 'question';
  };

  const predictResponseTime = (messages: any[]): number => {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    return Math.max(1, Math.min(10, Math.floor(avgLength / 20)));
  };

  const predictEngagement = (messages: any[]): string => {
    const messageCount = messages.length;
    if (messageCount >= 5) return 'high';
    if (messageCount >= 3) return 'medium';
    return 'low';
  };

  const generateAdvancedInsights = async (results: AIAnalysisResult[]): Promise<ConversationInsight[]> => {
    const insights: ConversationInsight[] = [];

    // 감정적 인사이트
    const sentimentResult = results.find(r => r.type === 'sentiment');
    if (sentimentResult) {
      insights.push({
        id: `emotional_${Date.now()}`,
        category: 'emotional',
        insight: `사용자의 감정 상태가 ${sentimentResult.score > 0.6 ? '매우 긍정적' : sentimentResult.score > 0.3 ? '보통' : '부정적'}입니다.`,
        confidence: sentimentResult.confidence,
        impact: sentimentResult.score > 0.7 ? 'high' : sentimentResult.score > 0.4 ? 'medium' : 'low',
        recommendations: [
          '감정 상태에 맞는 톤으로 응답하세요',
          '공감적 접근이 필요할 수 있습니다',
          '긍정적 피드백을 제공하세요'
        ]
      });
    }

    // 인지적 인사이트
    const personalityResults = results.filter(r => r.type === 'personality');
    if (personalityResults.length > 0) {
      insights.push({
        id: `cognitive_${Date.now()}`,
        category: 'cognitive',
        insight: `사용자는 ${personalityResults.map(r => r.description).join(', ')} 특성을 보입니다.`,
        confidence: personalityResults.reduce((sum, r) => sum + r.confidence, 0) / personalityResults.length,
        impact: 'medium',
        recommendations: [
          '성향에 맞는 커뮤니케이션 스타일을 사용하세요',
          '개인화된 접근 방식을 적용하세요',
          '선호하는 정보 제공 방식을 고려하세요'
        ]
      });
    }

    // 행동적 인사이트
    const intentResult = results.find(r => r.type === 'intent');
    if (intentResult) {
      insights.push({
        id: `behavioral_${Date.now()}`,
        category: 'behavioral',
        insight: `사용자의 주요 의도는 ${intentResult.description}입니다.`,
        confidence: intentResult.confidence,
        impact: 'high',
        recommendations: [
          '의도에 맞는 구체적인 답변을 제공하세요',
          '사용자의 요구사항을 정확히 파악하세요',
          '적절한 해결책을 제시하세요'
        ]
      });
    }

    return insights;
  };

  const generatePredictiveAnalysis = async (results: AIAnalysisResult[], insights: ConversationInsight[]): Promise<PredictiveAnalysis> => {
    const intentResult = results.find(r => r.type === 'intent');
    const sentimentResult = results.find(r => r.type === 'sentiment');
    
    const nextIntent = intentResult?.description || '일반적인 질문';
    const confidence = (intentResult?.confidence || 0.5) * (sentimentResult?.confidence || 0.5);
    
    const suggestedActions = [
      '사용자의 의도에 맞는 구체적인 답변 제공',
      '감정 상태를 고려한 톤 조절',
      '개인화된 정보 제공'
    ];

    const riskFactors = [
      '의도 파악 오류 가능성',
      '감정 상태 변화',
      '컨텍스트 이해 부족'
    ];

    const opportunities = [
      '더 정확한 의도 파악',
      '감정적 연결 강화',
      '개인화된 경험 제공'
    ];

    return {
      nextIntent,
      confidence,
      suggestedActions,
      riskFactors,
      opportunities
    };
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'intent': return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case 'personality': return <AcademicCapIcon className="w-5 h-5 text-purple-500" />;
      case 'context': return <CogIcon className="w-5 h-5 text-green-500" />;
      case 'prediction': return <SparklesIcon className="w-5 h-5 text-yellow-500" />;
      default: return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">고급 AI 분석 엔진</h2>
            <p className="text-sm text-gray-600">다단계 심화 분석 시스템</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
        >
          <CogIcon className="w-5 h-5" />
          <span>고급 메트릭</span>
        </button>
      </div>

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium text-blue-800">분석 중...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 mt-2">{currentAnalysis}</p>
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">분석 결과</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisResults.map((result) => (
              <div key={result.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  {getAnalysisIcon(result.type)}
                  <span className="font-medium text-gray-900">
                    {result.type === 'sentiment' ? '감정 분석' :
                     result.type === 'intent' ? '의도 분석' :
                     result.type === 'personality' ? '성향 분석' :
                     result.type === 'context' ? '컨텍스트 분석' :
                     '예측 분석'}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{result.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>증거:</strong> {result.evidence.join(', ')}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  처리 시간: {result.metadata.processingTime}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 고급 인사이트 */}
      {insights.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">고급 인사이트</h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <LightBulbIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">{insight.insight}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  신뢰도: {(insight.confidence * 100).toFixed(1)}%
                </div>
                <div className="space-y-1">
                  <strong className="text-sm text-gray-700">권장사항:</strong>
                  {insight.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600">• {rec}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예측 분석 */}
      {prediction && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">예측 분석</h3>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center space-x-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-gray-900">다음 예상 의도: {prediction.nextIntent}</span>
              <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {(prediction.confidence * 100).toFixed(1)}% 신뢰도
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">제안 액션</h4>
                <div className="space-y-1">
                  {prediction.suggestedActions.map((action, index) => (
                    <div key={index} className="text-sm text-gray-600">• {action}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">위험 요소</h4>
                <div className="space-y-1">
                  {prediction.riskFactors.map((risk, index) => (
                    <div key={index} className="text-sm text-red-600">• {risk}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">기회 요소</h4>
                <div className="space-y-1">
                  {prediction.opportunities.map((opportunity, index) => (
                    <div key={index} className="text-sm text-green-600">• {opportunity}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 고급 메트릭 */}
      {showAdvancedMetrics && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">고급 메트릭</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisResults.length}</div>
              <div className="text-sm text-gray-600">분석 결과</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{insights.length}</div>
              <div className="text-sm text-gray-600">인사이트</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysisResults.reduce((sum, r) => sum + r.confidence, 0) / Math.max(analysisResults.length, 1) * 100}
              </div>
              <div className="text-sm text-gray-600">평균 신뢰도</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analysisResults.reduce((sum, r) => sum + r.metadata.processingTime, 0)}
              </div>
              <div className="text-sm text-gray-600">총 처리 시간(ms)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIAnalysisEngine; 