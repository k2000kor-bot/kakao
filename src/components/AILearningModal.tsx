import React, { useState, useEffect } from 'react';
import { XMarkIcon, CpuChipIcon, BeakerIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { ProjectFile } from '../types/project';

interface AILearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: (options: {
    analysisType: 'basic' | 'advanced' | 'deep';
    includePatternAnalysis: boolean;
    includeSentimentAnalysis: boolean;
    includeEntityExtraction: boolean;
    includeRecommendations: boolean;
    files: ProjectFile[];
  }) => void;
  projectFiles: ProjectFile[];
}

const AILearningModal: React.FC<AILearningModalProps> = ({
  isOpen,
  onClose,
  onStartLearning,
  projectFiles
}) => {
  const [analysisType, setAnalysisType] = useState<'basic' | 'advanced' | 'deep'>('basic');
  const [includePatternAnalysis, setIncludePatternAnalysis] = useState(true);
  const [includeSentimentAnalysis, setIncludeSentimentAnalysis] = useState(true);
  const [includeEntityExtraction, setIncludeEntityExtraction] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    // 분석 유형에 따른 예상 시간 계산
    let baseTime = 0;
    switch (analysisType) {
      case 'basic':
        baseTime = 30;
        break;
      case 'advanced':
        baseTime = 60;
        break;
      case 'deep':
        baseTime = 120;
        break;
    }

    const selectedCount = selectedFiles.size;
    const totalTime = baseTime * selectedCount;
    setEstimatedTime(totalTime);
  }, [analysisType, selectedFiles]);

  const handleFileToggle = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === projectFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(projectFiles.map(f => f.id)));
    }
  };

  const handleStartLearning = () => {
    if (selectedFiles.size === 0) return;

    const selectedFileObjects = projectFiles.filter(f => selectedFiles.has(f.id));
    
    onStartLearning({
      analysisType,
      includePatternAnalysis,
      includeSentimentAnalysis,
      includeEntityExtraction,
      includeRecommendations,
      files: selectedFileObjects
    });
    
    onClose();
  };

  const getAnalysisTypeDescription = (type: 'basic' | 'advanced' | 'deep') => {
    switch (type) {
      case 'basic':
        return '키워드 추출 및 기본 요약 분석';
      case 'advanced':
        return '감정 분석, 엔티티 추출 및 패턴 분석 포함';
      case 'deep':
        return '심화 분석, 상관관계 분석 및 AI 추천 생성';
    }
  };

  const getAnalysisTypeIcon = (type: 'basic' | 'advanced' | 'deep') => {
    switch (type) {
      case 'basic':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'advanced':
        return <BeakerIcon className="w-5 h-5" />;
      case 'deep':
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI 학습 세션 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 분석 유형 선택 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">분석 유형 선택</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['basic', 'advanced', 'deep'] as const).map((type) => (
                <div
                  key={type}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    analysisType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAnalysisType(type)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {getAnalysisTypeIcon(type)}
                    <span className="font-medium text-gray-900 capitalize">{type}</span>
                  </div>
                  <p className="text-sm text-gray-600">{getAnalysisTypeDescription(type)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 분석 옵션 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">분석 옵션</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includePatternAnalysis}
                  onChange={(e) => setIncludePatternAnalysis(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">패턴 분석</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeSentimentAnalysis}
                  onChange={(e) => setIncludeSentimentAnalysis(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">감정 분석</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeEntityExtraction}
                  onChange={(e) => setIncludeEntityExtraction(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">엔티티 추출</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">AI 추천 생성</span>
              </label>
            </div>
          </div>

          {/* 파일 선택 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">분석할 파일 선택</h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedFiles.size === projectFiles.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {projectFiles.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  분석할 파일이 없습니다. 먼저 파일을 업로드해주세요.
                </div>
              ) : (
                <div className="divide-y">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-3 p-4 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleFileToggle(file.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 예상 시간 및 요약 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">선택된 파일</span>
              <span className="text-sm text-gray-600">{selectedFiles.size}개</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">예상 소요 시간</span>
              <span className="text-sm text-gray-600">
                {Math.floor(estimatedTime / 60)}분 {estimatedTime % 60}초
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">분석 유형</span>
              <span className="text-sm text-gray-600 capitalize">{analysisType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            onClick={handleStartLearning}
            disabled={selectedFiles.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            학습 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default AILearningModal;
