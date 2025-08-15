import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CpuChipIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import FileAnalysisService, { FileAnalysisResult } from '../services/fileAnalysisService';
import { ProjectFile } from '../types/project';

interface RealTimeAnalysisMonitorProps {
  projectId: string;
  files: ProjectFile[];
  isVisible: boolean;
  onClose: () => void;
}

interface AnalysisStats {
  total: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;
  averageConfidence: number;
  averageProcessingTime: number;
  fileTypeDistribution: Record<string, number>;
  topKeywords: Array<{ keyword: string; count: number }>;
  recentAnalyses: FileAnalysisResult[];
}

const RealTimeAnalysisMonitor: React.FC<RealTimeAnalysisMonitorProps> = ({
  projectId,
  files,
  isVisible,
  onClose
}) => {
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    completed: 0,
    processing: 0,
    pending: 0,
    failed: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    fileTypeDistribution: {},
    topKeywords: [],
    recentAnalyses: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const fileAnalysisService = FileAnalysisService.getInstance();

  // 통계 업데이트
  const updateStats = async () => {
    setIsRefreshing(true);
    try {
      // 모든 파일 분석 실행
      const analysisPromises = files.map(file => fileAnalysisService.analyzeFile(file));
      const analyses = await Promise.allSettled(analysisPromises);
      
      const successfulAnalyses = analyses
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<FileAnalysisResult>).value);

      // 통계 계산
      const total = successfulAnalyses.length;
      const completed = successfulAnalyses.length;
      const averageConfidence = total > 0 
        ? Math.round(successfulAnalyses.reduce((sum, a) => sum + a.confidence, 0) / total)
        : 0;
      const averageProcessingTime = total > 0
        ? Math.round(successfulAnalyses.reduce((sum, a) => sum + a.processingTime, 0) / total)
        : 0;

      // 파일 타입 분포
      const fileTypeDistribution: Record<string, number> = {};
      successfulAnalyses.forEach(analysis => {
        fileTypeDistribution[analysis.analysisType] = (fileTypeDistribution[analysis.analysisType] || 0) + 1;
      });

      // 상위 키워드
      const keywordCount: Record<string, number> = {};
      successfulAnalyses.forEach(analysis => {
        analysis.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      });
      const topKeywords = Object.entries(keywordCount)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // 최근 분석 결과
      const recentAnalyses = successfulAnalyses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setStats({
        total,
        completed,
        processing: 0,
        pending: 0,
        failed: 0,
        averageConfidence,
        averageProcessingTime,
        fileTypeDistribution,
        topKeywords,
        recentAnalyses
      });
    } catch (error) {
      console.error('통계 업데이트 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isVisible && files.length > 0) {
      updateStats();
    }
  }, [isVisible, files, selectedTimeRange]);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-4 h-4 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="w-4 h-4 text-red-500" />;
      case 'audio':
        return <MusicalNoteIcon className="w-4 h-4 text-purple-500" />;
      case 'document':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">실시간 분석 모니터링</h3>
              <p className="text-sm text-gray-500">파일 분석 현황 및 통계</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">최근 1시간</option>
              <option value="24h">최근 24시간</option>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
            </select>
            <button
              onClick={updateStats}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <CpuChipIcon className="w-4 h-4" />
              <span>{isRefreshing ? '새로고침 중...' : '새로고침'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="닫기"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 주요 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">총 분석</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">완료</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <LightBulbIcon className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-900">평균 신뢰도</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageConfidence}%</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-900">평균 처리시간</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.averageProcessingTime}ms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 파일 타입 분포 */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
                파일 타입 분포
              </h4>
              <div className="space-y-3">
                {Object.entries(stats.fileTypeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileTypeIcon(type)}
                      <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 상위 키워드 */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                상위 키워드
              </h4>
              <div className="space-y-2">
                {stats.topKeywords.map((item, index) => (
                  <div key={item.keyword} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm text-gray-700">{item.keyword}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.count}회</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 분석 결과 */}
          <div className="mt-6 bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="w-5 h-5 mr-2 text-green-600" />
              최근 분석 결과
            </h4>
            <div className="space-y-4">
              {stats.recentAnalyses.map((analysis) => (
                <div key={analysis.fileId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileTypeIcon(analysis.analysisType)}
                      <div>
                        <h5 className="font-medium text-gray-900">{analysis.fileName}</h5>
                        <p className="text-sm text-gray-500">{analysis.analysisType} 분석</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                        {analysis.confidence}% 신뢰도
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(analysis.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">{analysis.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywords.slice(0, 5).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalysisMonitor;
