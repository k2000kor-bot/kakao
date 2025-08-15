import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { AILearningService } from '../services/aiLearningService';
import { RealTimeAnalysis } from '../services/aiLearningService';

interface RealTimeAIAnalysisProps {
  fileId: string;
  fileName: string;
  onAnalysisComplete?: (analysis: RealTimeAnalysis) => void;
}

const RealTimeAIAnalysis: React.FC<RealTimeAIAnalysisProps> = ({
  fileId,
  fileName,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>('');
  const [analyses, setAnalyses] = useState<RealTimeAnalysis[]>([]);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('keyword');
  const [progress, setProgress] = useState(0);

  const aiLearningService = AILearningService.getInstance();

  const analysisTypes = [
    { id: 'keyword', name: '키워드 추출', icon: LightBulbIcon },
    { id: 'sentiment', name: '감정 분석', icon: ChartBarIcon },
    { id: 'entity', name: '개체 추출', icon: CpuChipIcon },
    { id: 'topic', name: '주제 분석', icon: ChartBarIcon },
    { id: 'summary', name: '요약 생성', icon: LightBulbIcon }
  ];

  useEffect(() => {
    // 기존 분석 결과 로드
    const existingAnalyses = aiLearningService.getRealTimeAnalyses(fileId);
    setAnalyses(existingAnalyses);
  }, [fileId]);

  const startAnalysis = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentAnalysis(selectedAnalysisType);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // AI 분석 수행
      const analysis = await aiLearningService.performRealTimeAnalysis(fileId, selectedAnalysisType);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // 분석 결과 추가
      setAnalyses(prev => [...prev, analysis]);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }

      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
        setCurrentAnalysis('');
      }, 1000);

    } catch (error) {
      console.error('분석 실패:', error);
      setIsAnalyzing(false);
      setProgress(0);
      setCurrentAnalysis('');
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setProgress(0);
    setCurrentAnalysis('');
  };

  const getAnalysisIcon = (type: string) => {
    const analysisType = analysisTypes.find(at => at.id === type);
    return analysisType ? analysisType.icon : LightBulbIcon;
  };

  const formatAnalysisResult = (analysis: RealTimeAnalysis) => {
    switch (analysis.type) {
      case 'keyword':
        return Array.isArray(analysis.result) ? analysis.result.join(', ') : analysis.result;
      case 'sentiment':
        if (typeof analysis.result === 'object') {
          const sentiment = analysis.result as any;
          return `긍정: ${(sentiment.positive * 100).toFixed(1)}%, 중립: ${(sentiment.neutral * 100).toFixed(1)}%, 부정: ${(sentiment.negative * 100).toFixed(1)}%`;
        }
        return analysis.result;
      case 'entity':
        return Array.isArray(analysis.result) ? analysis.result.join(', ') : analysis.result;
      case 'topic':
        return Array.isArray(analysis.result) ? analysis.result.join(', ') : analysis.result;
      case 'summary':
        return analysis.result;
      default:
        return JSON.stringify(analysis.result);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">실시간 AI 분석</h3>
          <p className="text-sm text-gray-500">{fileName}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAnalyzing ? (
            <button
              onClick={stopAnalysis}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <StopIcon className="w-4 h-4" />
              <span>중지</span>
            </button>
          ) : (
            <button
              onClick={startAnalysis}
              disabled={!selectedAnalysisType}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <PlayIcon className="w-4 h-4" />
              <span>분석 시작</span>
            </button>
          )}
        </div>
      </div>

      {/* 분석 타입 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          분석 타입 선택
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {analysisTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedAnalysisType(type.id)}
                disabled={isAnalyzing}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAnalysisType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                } disabled:opacity-50`}
              >
                <IconComponent className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 분석 진행률 */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-700">
                {currentAnalysis} 분석 중...
              </span>
            </div>
            <span className="text-sm text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">분석 결과</h4>
        {analyses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>아직 분석 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => {
              const IconComponent = getAnalysisIcon(analysis.type);
              return (
                <div
                  key={analysis.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {analysisTypes.find(at => at.id === analysis.type)?.name}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(analysis.confidence)} bg-gray-100`}>
                            {(analysis.confidence * 100).toFixed(0)}% 신뢰도
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatAnalysisResult(analysis)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeAIAnalysis; 