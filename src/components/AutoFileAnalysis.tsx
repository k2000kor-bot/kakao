import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import FileAnalysisService, { FileAnalysisResult, RealTimeAnalysisData } from '../services/fileAnalysisService';
import { ProjectFile } from '../types/project';

interface AutoFileAnalysisProps {
  file: ProjectFile;
  onAnalysisComplete?: (result: FileAnalysisResult) => void;
  onRealTimeUpdate?: (data: RealTimeAnalysisData) => void;
}

const AutoFileAnalysis: React.FC<AutoFileAnalysisProps> = ({
  file,
  onAnalysisComplete,
  onRealTimeUpdate
}) => {
  const [analysis, setAnalysis] = useState<FileAnalysisResult | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalysisData | null>(null);
  const [isAutoAnalysisEnabled, setIsAutoAnalysisEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const fileAnalysisService = FileAnalysisService.getInstance();

  useEffect(() => {
    if (isAutoAnalysisEnabled && file && !analysis) {
      startAnalysis();
    }
  }, [file, isAutoAnalysisEnabled, analysis]);

  // 실시간 데이터 업데이트 모니터링
  useEffect(() => {
    if (!analysis || analysis.status !== 'completed') return;

    const interval = setInterval(() => {
      const realTime = fileAnalysisService.getRealTimeAnalysis(file.id);
      if (realTime) {
        setRealTimeData(realTime);
        onRealTimeUpdate?.(realTime);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [analysis, file.id, onRealTimeUpdate]);

  const startAnalysis = async () => {
    try {
      const analysisId = await fileAnalysisService.startFileAnalysis(file, 'advanced');

      // 초기 상태 설정
      const initialResult = fileAnalysisService.getAnalysisResult(analysisId);
      if (initialResult) {
        setAnalysis(initialResult);
      }

      // 진행 상황 주기적 확인
      const progressInterval = setInterval(() => {
        const result = fileAnalysisService.getAnalysisResult(analysisId);
        if (result) {
          setAnalysis(result);

          if (result.status === 'completed') {
            onAnalysisComplete?.(result);
            clearInterval(progressInterval);
            // 실시간 분석 시작
            startRealTimeAnalysis();
          } else if (result.status === 'failed') {
            console.error('분석 실패:', result.error);
            clearInterval(progressInterval);
          }
        }
      }, 1000);

      // 최대 60초 후 정리 (안전장치)
      setTimeout(() => {
        clearInterval(progressInterval);
      }, 60000);

    } catch (error) {
      console.error('분석 시작 실패:', error);
    }
  };

  const startRealTimeAnalysis = async () => {
    try {
      // 이미 실시간 분석이 실행 중인지 확인
      const existingRealTime = fileAnalysisService.getRealTimeAnalysis(file.id);
      if (!existingRealTime) {
        await fileAnalysisService.startFileAnalysis(file, 'real-time');
      }
    } catch (error) {
      console.error('실시간 분석 시작 실패:', error);
    }
  };

  const cancelAnalysis = () => {
    if (analysis) {
      fileAnalysisService.cancelAnalysis(analysis.id);
      setAnalysis(null);
    }
  };

  const getStatusIcon = () => {
    if (!analysis) return <ClockIcon className="w-4 h-4 text-gray-500" />;

    switch (analysis.status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <CpuChipIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!analysis) return '대기 중';

    switch (analysis.status) {
      case 'completed':
        return '분석 완료';
      case 'processing':
        return '분석 중...';
      case 'failed':
        return '분석 실패';
      default:
        return '대기 중';
    }
  };

  const getStatusColor = () => {
    if (!analysis) return 'bg-gray-100 text-gray-800';

    switch (analysis.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAutoAnalysisEnabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">자동 분석이 비활성화되었습니다</span>
          </div>
          <button
            onClick={() => setIsAutoAnalysisEnabled(true)}
            className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
          >
            활성화
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 분석 상태 표시 - 컴팩트 버전 */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <h4 className="text-xs font-medium text-gray-900">AI 자동 분석</h4>
              <p className="text-xs text-gray-500 truncate max-w-32">{file.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {analysis?.status === 'processing' && (
              <button
                onClick={cancelAnalysis}
                className="text-gray-400 hover:text-gray-600"
                title="분석 취소"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 진행률 바 - 컴팩트 */}
        {analysis && analysis.status === 'processing' && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>진행률</span>
              <span>{analysis.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${analysis.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 분석 결과 미리보기 - 컴팩트 */}
        {analysis && analysis.status === 'completed' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">분석 결과</span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showDetails ? '간단히' : '자세히'}
              </button>
            </div>

            {showDetails ? (
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="font-medium">요약:</span>
                  <p className="text-gray-600 mt-1 line-clamp-2">{analysis.results.summary}</p>
                </div>
                <div>
                  <span className="font-medium">키워드:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.results.keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                    {analysis.results.keywords.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        +{analysis.results.keywords.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">감정:</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${analysis.results.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    analysis.results.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {analysis.results.sentiment === 'positive' ? '긍정적' :
                      analysis.results.sentiment === 'negative' ? '부정적' : '중립적'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-600">
                <p className="line-clamp-1">{analysis.results.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* 실시간 분석 상태 - 컴팩트 */}
        {realTimeData && (
          <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700">실시간 분석</span>
              <span className="text-xs text-green-600">{(realTimeData.metrics.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 자동 분석 설정 - 컴팩트 */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>자동 분석</span>
        <button
          onClick={() => setIsAutoAnalysisEnabled(!isAutoAnalysisEnabled)}
          className={`px-2 py-1 rounded text-xs ${isAutoAnalysisEnabled
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {isAutoAnalysisEnabled ? '활성' : '비활성'}
        </button>
      </div>
    </div>
  );
};

export default AutoFileAnalysis;
