import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  CpuChipIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import FileAnalysisService from '../services/fileAnalysisService';
import AdvancedAnalysisVisualization from './AdvancedAnalysisVisualization';

interface FileAnalysisResult {
  fileId: string;
  fileName: string;
  fileType: string;
  analysisType: 'text' | 'image' | 'video' | 'audio' | 'document';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  confidence: number;
  keywords: string[];
  summary: string;
  insights: string[];
  processingTime: number;
  createdAt: string;
  completedAt?: string;
  content: string;
}

interface FileAnalysisDashboardProps {
  projectId: string;
  files: any[];
  isVisible: boolean;
  onClose: () => void;
}

const FileAnalysisDashboard: React.FC<FileAnalysisDashboardProps> = ({
  projectId,
  files,
  isVisible,
  onClose
}) => {
  const [analysisResults, setAnalysisResults] = useState<FileAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'confidence'>('date');
  const [selectedAnalysisForVisualization, setSelectedAnalysisForVisualization] = useState<FileAnalysisResult | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  // 실제 파일 분석 실행
  useEffect(() => {
    if (isVisible && files.length > 0) {
      const runAnalysis = async () => {
        const fileAnalysisService = FileAnalysisService.getInstance();
        const analysisPromises = files.map(async (file, index) => {
          try {
            const result = await fileAnalysisService.analyzeFile(file);
            return {
              ...result,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date().toISOString()
            };
          } catch (error) {
            console.error(`파일 분석 실패: ${file.name}`, error);
            return {
              fileId: file.id,
              fileName: file.name,
              fileType: file.type,
              analysisType: getAnalysisType(file.type),
              status: 'failed' as const,
              progress: 0,
              confidence: 0,
              keywords: [],
              summary: '분석 실패',
              insights: [],
              processingTime: 0,
              createdAt: new Date().toISOString(),
              content: '분석에 실패했습니다.'
            };
          }
        });

        const results = await Promise.all(analysisPromises);
        setAnalysisResults(results);
      };

      runAnalysis();
    }
  }, [isVisible, files]);

  const getAnalysisType = (fileType: string): 'text' | 'image' | 'video' | 'audio' | 'document' => {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) return 'image';
    if (['mp4', 'avi', 'mov'].includes(fileType)) return 'video';
    if (['mp3', 'wav'].includes(fileType)) return 'audio';
    if (['pdf', 'doc', 'docx'].includes(fileType)) return 'document';
    return 'text';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getFileIcon = (analysisType: string) => {
    switch (analysisType) {
      case 'image':
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-red-500" />;
      case 'audio':
        return <MusicalNoteIcon className="w-6 h-6 text-purple-500" />;
      case 'document':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);

    // 분석 시뮬레이션
    const pendingResults = analysisResults.filter(r => r.status === 'pending');

    for (const result of pendingResults) {
      // 진행률 업데이트
      setAnalysisResults(prev => prev.map(r =>
        r.fileId === result.fileId
          ? { ...r, status: 'processing', progress: 0 }
          : r
      ));

      // 단계별 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setAnalysisResults(prev => prev.map(r =>
          r.fileId === result.fileId
            ? { ...r, progress: i }
            : r
        ));
      }

      // 완료 상태로 변경
      setAnalysisResults(prev => prev.map(r =>
        r.fileId === result.fileId
          ? {
            ...r,
            status: 'completed',
            progress: 100,
            confidence: Math.floor(Math.random() * 30) + 70,
            keywords: ['키워드1', '키워드2', '키워드3'],
            summary: `${result.fileName} 파일 분석이 완료되었습니다.`,
            insights: ['중요한 인사이트1', '유용한 인사이트2'],
            processingTime: Math.floor(Math.random() * 5000) + 1000,
            completedAt: new Date().toISOString()
          }
          : r
      ));
    }

    setIsAnalyzing(false);
  };

  const filteredResults = analysisResults.filter(result =>
    selectedAnalysisType === 'all' || result.analysisType === selectedAnalysisType
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'status':
        return a.status.localeCompare(b.status);
      case 'confidence':
        return b.confidence - a.confidence;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const stats = {
    total: analysisResults.length,
    completed: analysisResults.filter(r => r.status === 'completed').length,
    processing: analysisResults.filter(r => r.status === 'processing').length,
    pending: analysisResults.filter(r => r.status === 'pending').length,
    failed: analysisResults.filter(r => r.status === 'failed').length,
    averageConfidence: analysisResults.filter(r => r.status === 'completed').length > 0
      ? Math.round(analysisResults.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.confidence, 0) / analysisResults.filter(r => r.status === 'completed').length)
      : 0
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
              <h3 className="text-lg font-semibold text-gray-900">실시간 파일 분석 대시보드</h3>
              <p className="text-sm text-gray-500">AI 기반 파일 분석 현황 및 결과</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="닫기"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">총 파일</p>
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
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">처리 중</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">대기</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">실패</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
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
          </div>

          {/* 컨트롤 패널 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={selectedAnalysisType}
                onChange={(e) => setSelectedAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="분석 유형 선택"
              >
                <option value="all">모든 유형</option>
                <option value="text">텍스트</option>
                <option value="image">이미지</option>
                <option value="video">비디오</option>
                <option value="audio">오디오</option>
                <option value="document">문서</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="정렬 기준 선택"
              >
                <option value="date">날짜순</option>
                <option value="status">상태순</option>
                <option value="confidence">신뢰도순</option>
              </select>
            </div>
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing || stats.pending === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CpuChipIcon className="w-4 h-4" />
              <span>{isAnalyzing ? '분석 중...' : '분석 시작'}</span>
            </button>
          </div>

          {/* 분석 결과 목록 */}
          <div className="space-y-4">
            {sortedResults.map((result) => (
              <div key={result.fileId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(result.analysisType)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                      <p className="text-sm text-gray-500">{result.analysisType} 분석</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                </div>

                {/* 진행률 바 */}
                {result.status === 'processing' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">진행률</span>
                      <span className="text-sm text-gray-600">{result.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${result.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 분석 결과 */}
                {result.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">신뢰도</span>
                      <span className="text-sm text-gray-600">{result.confidence}%</span>
                    </div>
                    {result.keywords.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">키워드: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.summary && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">요약: </span>
                        <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
                      </div>
                    )}
                    {result.insights.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">인사이트: </span>
                        <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                          {result.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>처리 시간: {result.processingTime}ms</span>
                      <span>완료: {result.completedAt ? new Date(result.completedAt).toLocaleString() : ''}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedAnalysisForVisualization(result);
                          setShowVisualization(true);
                        }}
                        className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        상세 분석 보기
                      </button>
                    </div>
                  </div>
                )}

                {/* 오류 정보 */}
                {result.status === 'failed' && (
                  <div className="text-sm text-red-600">
                    분석 중 오류가 발생했습니다.
                  </div>
                )}
              </div>
            ))}
          </div>

          {sortedResults.length === 0 && (
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">분석 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 고급 분석 시각화 모달 */}
      {selectedAnalysisForVisualization && (
        <AdvancedAnalysisVisualization
          analysisResult={selectedAnalysisForVisualization}
          isVisible={showVisualization}
          onClose={() => {
            setShowVisualization(false);
            setSelectedAnalysisForVisualization(null);
          }}
        />
      )}
    </div>
  );
};

export default FileAnalysisDashboard;
