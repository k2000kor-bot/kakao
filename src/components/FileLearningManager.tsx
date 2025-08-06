import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  LightBulbIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  AcademicCapIcon,
  BookOpenIcon,
  DocumentIcon,
  FolderIcon,
  TagIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../context/AppContext';
import { ProjectFile } from '../types/chat';

interface FileLearningManagerProps {
  projectId: string;
  files: ProjectFile[];
  onStartLearning: (fileIds: string[]) => void;
  onStopLearning: (sessionId: string) => void;
  onViewInsights: (fileId: string) => void;
  onClose: () => void;
}

const FileLearningManager: React.FC<FileLearningManagerProps> = ({
  projectId,
  files,
  onStartLearning,
  onStopLearning,
  onViewInsights,
  onClose
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null); // LearningSession type was removed, using 'any' for now
  const [viewMode, setViewMode] = useState<'files' | 'learning' | 'insights'>('files');

  // 샘플 학습 세션
  const [learningSessions] = useState<any[]>([ // LearningSession type was removed, using 'any' for now
    {
      id: '1',
      projectId,
      fileIds: ['1', '2'],
      startedAt: '2025-08-03T10:00:00Z',
      status: 'active',
      progress: 75,
      insights: [
        {
          id: '1',
          type: 'summary',
          content: '개포우성7차 재개발 프로젝트 관련 주요 문서',
          confidence: 0.95,
          relevance: 0.9,
          tags: ['재개발', '개포우성', '프로젝트'],
          createdAt: '2025-08-03T10:30:00Z'
        },
        {
          id: '2',
          type: 'key_point',
          content: '시공사 홍보 활동 관련 논란 지속',
          confidence: 0.88,
          relevance: 0.85,
          tags: ['시공사', '홍보', '논란'],
          createdAt: '2025-08-03T10:35:00Z'
        }
      ],
      modelVersion: 'v2.1.0',
      learningMetrics: {
        totalFiles: 2,
        processedFiles: 1,
        averageConfidence: 0.91,
        newInsights: 2,
        improvedClassifications: 1,
        processingTime: 180000
      }
    }
  ]);

  const getLearningStatusIcon = (status: ProjectFile['learningStatus']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <PlayIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLearningStatusText = (status: ProjectFile['learningStatus']) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '학습 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return '대기 중';
    }
  };

  const getInsightTypeIcon = (type: any) => { // AIInsight type was removed, using 'any' for now
    switch (type) {
      case 'summary':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'key_point':
        return <LightBulbIcon className="w-4 h-4" />;
      case 'action_item':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'risk':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'opportunity':
        return <SparklesIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getInsightTypeColor = (type: any) => { // AIInsight type was removed, using 'any' for now
    switch (type) {
      case 'summary':
        return 'bg-blue-100 text-blue-700';
      case 'key_point':
        return 'bg-yellow-100 text-yellow-700';
      case 'action_item':
        return 'bg-green-100 text-green-700';
      case 'risk':
        return 'bg-red-100 text-red-700';
      case 'opportunity':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleStartLearning = () => {
    if (selectedFiles.length > 0) {
      onStartLearning(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handleStopLearning = (sessionId: string) => {
    onStopLearning(sessionId);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">파일 학습 관리</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('files')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'files' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="파일 목록 보기"
            >
              <DocumentIcon className="w-5 h-5" />
              <span>파일</span>
            </button>
            <button
              onClick={() => setViewMode('learning')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'learning' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="학습 세션 보기"
            >
              <AcademicCapIcon className="w-5 h-5" />
              <span>학습</span>
            </button>
            <button
              onClick={() => setViewMode('insights')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'insights' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="AI 인사이트 보기"
            >
              <LightBulbIcon className="w-5 h-5" />
              <span>인사이트</span>
            </button>
            <button
              onClick={() => {/* 설정 기능 */ }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="설정"
            >
              <CogIcon className="w-5 h-5" />
              <span>설정</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <DocumentTextIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* 파일 목록 */}
          {viewMode === 'files' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">학습할 파일 선택</h3>
                <p className="text-sm text-gray-600">AI가 파일을 분석하고 분류하여 지식을 학습합니다.</p>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedFiles.includes(file.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getLearningStatusIcon(file.learningStatus)}
                        <span className="text-sm text-gray-600">{getLearningStatusText(file.learningStatus)}</span>
                        {file.learningProgress > 0 && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.learningProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {file.classification && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">분류:</span>
                          <span className="font-medium">{file.classification.category} &gt; {file.classification.subcategory}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">신뢰도:</span>
                          <span className="font-medium">{(file.classification.confidence * 100).toFixed(1)}%</span>
                        </div>
                        {file.classification.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {file.classification.keywords.slice(0, 3).map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedFiles.length}개 파일 선택됨
                    </span>
                    <button
                      onClick={handleStartLearning}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      <span>학습 시작</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 학습 세션 */}
          {viewMode === 'learning' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">학습 세션</h3>
                <p className="text-sm text-gray-600">현재 진행 중인 학습 세션을 모니터링합니다.</p>
              </div>

              <div className="space-y-4">
                {learningSessions.map((session) => (
                  <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <LightBulbIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-medium text-gray-900">학습 세션 #{session.id}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'active' ? 'bg-green-100 text-green-700' :
                          session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {session.status === 'active' ? '진행 중' :
                            session.status === 'completed' ? '완료' : '실패'}
                        </span>
                      </div>
                      {session.status === 'active' && (
                        <button
                          onClick={() => handleStopLearning(session.id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          <PauseIcon className="w-3 h-3" />
                          <span>중지</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">진행률:</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${session.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{session.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">처리된 파일:</span>
                        <span className="text-sm font-medium ml-2">
                          {session.learningMetrics.processedFiles}/{session.learningMetrics.totalFiles}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">평균 신뢰도:</span>
                        <span className="font-medium ml-2">{(session.learningMetrics.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">새 인사이트:</span>
                        <span className="font-medium ml-2">{session.learningMetrics.newInsights}개</span>
                      </div>
                      <div>
                        <span className="text-gray-600">처리 시간:</span>
                        <span className="font-medium ml-2">{formatTime(session.learningMetrics.processingTime)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>시작: {new Date(session.startedAt).toLocaleString('ko-KR')}</span>
                        <span>모델: {session.modelVersion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 인사이트 */}
          {viewMode === 'insights' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 인사이트</h3>
                <p className="text-sm text-gray-600">학습된 파일에서 추출된 AI 인사이트를 확인합니다.</p>
              </div>

              <div className="space-y-4">
                {learningSessions.flatMap(session => session.insights).map((insight) => (
                  <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightTypeIcon(insight.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInsightTypeColor(insight.type)}`}>
                          {insight.type === 'summary' ? '요약' :
                            insight.type === 'key_point' ? '핵심 포인트' :
                              insight.type === 'action_item' ? '액션 아이템' :
                                insight.type === 'risk' ? '위험 요소' : '기회'}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">신뢰도: {(insight.confidence * 100).toFixed(1)}%</div>
                        <div className="text-gray-600">관련성: {(insight.relevance * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-3">{insight.content}</p>

                    {insight.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>생성: {new Date(insight.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileLearningManager; 