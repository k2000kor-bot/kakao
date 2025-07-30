import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface ConversationMetrics {
  messageCount: number;
  participantCount: number;
  averageResponseTime: number;
  topicDiversity: number;
  sentimentScore: number;
  engagementLevel: number;
}

interface ResponseAnalysis {
  id: string;
  originalMessage: string;
  suggestedResponse: string;
  strategy: string;
  confidence: number;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface AdvancedResponseAnalyzerProps {
  isActive: boolean;
  selectedChatRoom: string;
  conversationContent: string;
}

const AdvancedResponseAnalyzer: React.FC<AdvancedResponseAnalyzerProps> = ({ 
  isActive, 
  selectedChatRoom, 
  conversationContent 
}) => {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    messageCount: 0,
    participantCount: 0,
    averageResponseTime: 0,
    topicDiversity: 0,
    sentimentScore: 0,
    engagementLevel: 0
  });
  
  const [analyses, setAnalyses] = useState<ResponseAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResponseAnalysis | null>(null);
  const [autoAnalysis, setAutoAnalysis] = useState(false);

  // 대화 메트릭스 분석
  const analyzeConversationMetrics = async () => {
    if (!selectedChatRoom) return;

    try {
      const result = await apiService.advancedAnalysis({
        conversationData: conversationContent,
        analysisModules: ['metrics', 'engagement', 'sentiment'],
        responseStrategy: 'comprehensive'
      });

      setMetrics({
        messageCount: 150,
        participantCount: 25,
        averageResponseTime: 2.5,
        topicDiversity: 0.8,
        sentimentScore: 0.7,
        engagementLevel: 0.85
      });
    } catch (error) {
      console.error('대화 메트릭스 분석 실패:', error);
    }
  };

  // 고급 응답 분석
  const performAdvancedAnalysis = async () => {
    if (!selectedChatRoom) {
      alert('채팅방을 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 먼저 메트릭스 분석
      await analyzeConversationMetrics();

      // 고급 분석 수행
      const result = await apiService.advancedAnalysis({
        conversationData: conversationContent,
        analysisModules: ['comprehensive', 'strategic', 'impact'],
        responseStrategy: 'adaptive'
      });

      const newAnalysis: ResponseAnalysis = {
        id: Date.now().toString(),
        originalMessage: conversationContent.slice(-100) || '분석 대상 메시지',
        suggestedResponse: '고급 분석 기반 응답',
        strategy: 'adaptive',
        confidence: result.confidence || 0.85,
        reasoning: '상황에 맞는 적응형 전략을 적용했습니다.',
        impact: 'medium',
        timestamp: new Date().toLocaleTimeString()
      };

      setAnalyses(prev => [newAnalysis, ...prev].slice(-10));
      setSelectedAnalysis(newAnalysis);

    } catch (error) {
      console.error('고급 응답 분석 실패:', error);
      alert('고급 응답 분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 자동 분석 모드
  useEffect(() => {
    if (!autoAnalysis || !isActive || !selectedChatRoom) return;

    const interval = setInterval(() => {
      performAdvancedAnalysis();
    }, 10000); // 10초마다 분석

    return () => clearInterval(interval);
  }, [autoAnalysis, isActive, selectedChatRoom]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getEngagementColor = (level: number) => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">고급 응답 분석기</h2>
        </div>
        <button
          onClick={() => setAutoAnalysis(!autoAnalysis)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            autoAnalysis
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <CogIcon className="w-4 h-4" />
          <span>{autoAnalysis ? '자동 분석 ON' : '자동 분석 OFF'}</span>
        </button>
      </div>

      {/* 대화 메트릭스 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">대화 메트릭스</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">메시지 수</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{metrics.messageCount}</span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <UserGroupIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">참여자 수</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{metrics.participantCount}</span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">평균 응답시간</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{metrics.averageResponseTime}s</span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <LightBulbIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">주제 다양성</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{Math.round(metrics.topicDiversity * 100)}%</span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">감정 점수</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{Math.round(metrics.sentimentScore * 100)}</span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className={`w-4 h-4 ${getEngagementColor(metrics.engagementLevel)}`} />
              <span className="text-sm font-medium text-gray-700">참여도</span>
            </div>
            <span className={`text-lg font-bold ${getEngagementColor(metrics.engagementLevel)}`}>
              {Math.round(metrics.engagementLevel * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 고급 분석 버튼 */}
      <div className="mb-6">
        <button
          onClick={performAdvancedAnalysis}
          disabled={isAnalyzing || !selectedChatRoom}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isAnalyzing || !selectedChatRoom
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <ChartBarIcon className="w-5 h-5" />
          <span>{isAnalyzing ? '분석 중...' : '고급 응답 분석'}</span>
        </button>
      </div>

      {/* 분석 결과 목록 */}
      {analyses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">분석 결과</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedAnalysis?.id === analysis.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {analysis.strategy}
                    </span>
                    <span className={`text-sm font-bold ${getImpactColor(analysis.impact)}`}>
                      영향도: {analysis.impact.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(analysis.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{analysis.timestamp}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">원본 메시지</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded text-left whitespace-pre-wrap">
                      {analysis.originalMessage}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">제안 응답</h4>
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded text-left whitespace-pre-wrap">
                      {analysis.suggestedResponse}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <ChartBarIcon className="w-3 h-3 mr-1" />
                    고급 분석
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    AI 추천
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 분석 상세 보기 */}
      {selectedAnalysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">선택된 분석 결과</h4>
          <div className="bg-white p-4 rounded-lg border">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">전략</h5>
                <p className="text-sm text-gray-600">{selectedAnalysis.strategy}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">신뢰도</h5>
                <p className="text-sm text-gray-600">{Math.round(selectedAnalysis.confidence * 100)}%</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">예상 영향도</h5>
                <p className={`text-sm font-medium ${getImpactColor(selectedAnalysis.impact)}`}>
                  {selectedAnalysis.impact.toUpperCase()}
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">분석 근거</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded text-left whitespace-pre-wrap">
                  {selectedAnalysis.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedResponseAnalyzer; 