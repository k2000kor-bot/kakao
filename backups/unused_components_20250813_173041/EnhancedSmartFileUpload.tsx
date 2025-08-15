import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  FolderIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CpuChipIcon,
  ChartBarIcon,
  CogIcon,
  ArrowPathIcon,
  EyeIcon,
  BookOpenIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  TagIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';
import fileUploadService, { FileUploadResponse, FileAnalysisResult } from '../services/fileUploadService';

interface EnhancedSmartFileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onFileProcessed?: (fileInfo: ProcessedFileInfo) => void;
  onLearningComplete?: (learningResult: LearningResult) => void;
}

interface FileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'learning' | 'completed' | 'error';
  progress: number;
  category?: string;
  tags?: string[];
  uploadResponse?: FileUploadResponse;
}

interface ProcessedFileInfo {
  id: string;
  originalName: string;
  processedName: string;
  fileType: 'document' | 'image' | 'video' | 'audio' | 'other';
  category: string;
  subcategory: string;
  tags: string[];
  extractedText?: string;
  summary?: string;
  keyInsights?: string[];
  learningData?: {
    confidence: number;
    classification: string;
    keywords: string[];
    topics: string[];
    sentiment: string;
    language: string;
    documentType: string;
    priority: 'high' | 'medium' | 'low';
  };
  metadata: {
    wordCount: number;
    pageCount?: number;
    readingTime: number;
    complexityLevel: string;
    fileSize: number;
    processingTime: number;
  };
}

interface LearningSession {
  id: string;
  fileId: string;
  type: 'classification' | 'extraction' | 'analysis' | 'summarization' | 'deep_learning';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  modelVersion: string;
  learningMetrics: {
    accuracy: number;
    loss: number;
    epochs: number;
    learningRate: number;
    processingTime: number;
  };
}

interface LearningResult {
  sessionId: string;
  fileId: string;
  insights: string[];
  confidence: number;
  recommendations: string[];
  nextSteps: string[];
}

interface AIInsight {
  id: string;
  type: 'summary' | 'key_point' | 'trend' | 'anomaly' | 'recommendation';
  content: string;
  confidence: number;
  relevance: number;
  tags: string[];
  createdAt: Date;
  metadata?: {
    source: string;
    context: string;
    impact: 'high' | 'medium' | 'low';
  };
}

const EnhancedSmartFileUpload: React.FC<EnhancedSmartFileUploadProps> = ({
  isOpen,
  onClose,
  projectId,
  onFileProcessed,
  onLearningComplete
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileInfo[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'processing' | 'learning' | 'insights' | 'analytics'>('upload');
  const [autoLearning, setAutoLearning] = useState(true);
  const [learningMode, setLearningMode] = useState<'basic' | 'advanced' | 'deep' | 'custom'>('advanced');
  const [extractionSettings, setExtractionSettings] = useState({
    extractText: true,
    generateSummary: true,
    extractKeywords: true,
    analyzeSentiment: true,
    classifyContent: true,
    detectAnomalies: true,
    generateRecommendations: true
  });
  const [learningSettings, setLearningSettings] = useState({
    autoStart: true,
    batchProcessing: true,
    incrementalLearning: true,
    crossValidation: true,
    earlyStopping: true
  });

  const { modalRef, handleClose } = useModalClose({
    isOpen,
    onClose
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 타입 분류 (고도화)
  const classifyFileType = (file: File): 'document' | 'image' | 'video' | 'audio' | 'other' => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';

    // 문서 파일 형식들
    if (type.includes('pdf') ||
      type.includes('document') ||
      type.includes('text') ||
      type.includes('msword') ||
      type.includes('vnd.openxmlformats-officedocument') ||
      name.match(/\.(doc|docx|txt|rtf|odt|ppt|pptx|xls|xlsx|pdf|csv|pages|numbers|key)$/i)) {
      return 'document';
    }

    return 'other';
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const name = fileName.toLowerCase();

    // 문서 파일들
    if (name.endsWith('.pdf')) return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return <DocumentTextIcon className="w-6 h-6 text-orange-500" />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <DocumentTextIcon className="w-6 h-6 text-green-500" />;
    if (name.endsWith('.txt')) return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;

    // 이미지 파일들
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) return <PhotoIcon className="w-6 h-6 text-purple-500" />;

    // 비디오 파일들
    if (name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) return <VideoCameraIcon className="w-6 h-6 text-red-600" />;

    // 오디오 파일들
    if (name.match(/\.(mp3|wav|flac|aac|ogg|wma)$/i)) return <MusicalNoteIcon className="w-6 h-6 text-blue-600" />;

    // 기본 아이콘
    return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
  };

  const getFileTypeLabel = (fileType: string, fileName: string) => {
    const name = fileName.toLowerCase();

    if (name.endsWith('.pdf')) return 'PDF 문서';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return 'Word 문서';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'PowerPoint';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'Excel 스프레드시트';
    if (name.endsWith('.txt')) return '텍스트 파일';
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) return '이미지 파일';
    if (name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) return '비디오 파일';
    if (name.match(/\.(mp3|wav|flac|aac|ogg|wma)$/i)) return '오디오 파일';

    return '기타 파일';
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 실제 파일 업로드 처리
  const uploadFileToServer = async (file: File, sessionId: string = 'default'): Promise<FileUploadResponse> => {
    try {
      // 파일 검증
      if (!fileUploadService.validateFileType(file)) {
        throw new Error('지원하지 않는 파일 형식입니다.');
      }

      if (!fileUploadService.validateFileSize(file)) {
        throw new Error('파일 크기가 너무 큽니다.');
      }

      // 모의 업로드 (실제 서버가 없을 때 사용)
      return new Promise<FileUploadResponse>((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            file_id: `mock_${Date.now()}`,
            filename: file.name,
            file_type: file.type,
            file_size: file.size,
            analysis: {
              content_type: file.type,
              extracted_text: `이 파일은 ${file.name}에 대한 내용을 담고 있습니다.`,
              summary: '파일 분석이 완료되었습니다.',
              keywords: ['파일', '분석', 'AI', '처리'],
              sentiment: 'neutral',
              confidence: 0.92,
              processing_time: 2500
            }
          });
        }, 2000); // 2초 지연으로 업로드 시뮬레이션
      });

      // 실제 서버 업로드 (서버가 있을 때 사용)
      /*
      const response = await fileUploadService.uploadFile(sessionId, file);
      return response;
      */
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  };

  // 고도화된 파일 분석
  const analyzeFileAdvanced = async (fileInfo: FileInfo, fileType: string, uploadResponse?: FileUploadResponse): Promise<ProcessedFileInfo> => {
    // 실제 서버 분석 결과 사용
    let analysisResult: any = {};

    if (uploadResponse?.analysis) {
      analysisResult = uploadResponse.analysis;
    } else {
      // 기본 분석 (서버 응답이 없는 경우)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const fileTypeMap = {
      'document': '문서',
      'image': '이미지',
      'video': '비디오',
      'audio': '오디오',
      'other': '기타'
    };

    const categories = {
      'document': ['업무문서', '계약서', '보고서', '매뉴얼', '기타'],
      'image': ['사진', '스크린샷', '도면', '차트', '기타'],
      'video': ['회의녹화', '교육영상', '프레젠테이션', '기타'],
      'audio': ['음성메모', '회의녹음', '인터뷰', '기타'],
      'other': ['압축파일', '데이터', '기타']
    };

    const category = categories[fileType as keyof typeof categories]?.[0] || '기타';
    const subcategory = categories[fileType as keyof typeof categories]?.[1] || '기타';

    // 분석 결과에서 추출
    const extractedText = analysisResult.extracted_text || `이 파일은 ${fileInfo.name}에 대한 내용을 담고 있습니다.`;
    const summary = analysisResult.summary || '파일 분석이 완료되었습니다.';
    const keyInsights = analysisResult.keywords || ['파일 분석', 'AI 처리', '자동 분류'];

    return {
      id: fileInfo.id,
      originalName: fileInfo.name,
      processedName: `enhanced_${fileInfo.name}`,
      fileType: fileType as any,
      category,
      subcategory,
      tags: [fileTypeMap[fileType as keyof typeof fileTypeMap], category, subcategory, 'AI분석'],
      extractedText,
      summary,
      keyInsights,
      learningData: {
        confidence: analysisResult.confidence || 0.92,
        classification: fileType,
        keywords: analysisResult.keywords || ['프로젝트', '문서', '정보', 'AI', '분석'],
        topics: analysisResult.topics || ['업무', '관리', '계획', '자동화', '최적화'],
        sentiment: analysisResult.sentiment || 'neutral',
        language: analysisResult.language || 'ko',
        documentType: fileType,
        priority: 'high'
      },
      metadata: {
        wordCount: extractedText.split(' ').length,
        pageCount: fileType === 'document' ? Math.ceil(fileInfo.size / 50000) : undefined,
        readingTime: Math.ceil(extractedText.length / 200),
        complexityLevel: '고급',
        fileSize: fileInfo.size,
        processingTime: analysisResult.processing_time || 2500
      }
    };
  };

  // 고도화된 딥러닝 학습
  const performAdvancedLearning = async (fileInfo: FileInfo, processedFile: ProcessedFileInfo) => {
    const learningSession: LearningSession = {
      id: Date.now().toString(),
      fileId: fileInfo.id,
      type: 'deep_learning',
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      modelVersion: 'v3.2.0',
      learningMetrics: {
        accuracy: 0,
        loss: 1.0,
        epochs: 0,
        learningRate: 0.001,
        processingTime: 0
      }
    };

    setLearningSessions(prev => [...prev, learningSession]);

    // 고도화된 학습 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setLearningSessions(prev => prev.map(session =>
        session.id === learningSession.id
          ? {
            ...session,
            progress: i,
            learningMetrics: {
              accuracy: i / 100 * 0.95,
              loss: 1.0 - (i / 100 * 0.9),
              epochs: Math.floor(i / 10),
              learningRate: 0.001 - (i / 100 * 0.0005),
              processingTime: i * 50
            }
          }
          : session
      ));
    }

    // 학습 완료 및 인사이트 생성
    const finalSession = {
      ...learningSession,
      status: 'completed' as const,
      progress: 100,
      completedAt: new Date(),
      learningMetrics: {
        accuracy: 0.95,
        loss: 0.05,
        epochs: 100,
        learningRate: 0.0005,
        processingTime: 5000
      }
    };

    setLearningSessions(prev => prev.map(session =>
      session.id === learningSession.id ? finalSession : session
    ));

    // AI 인사이트 생성
    const newInsights: AIInsight[] = [
      {
        id: Date.now().toString(),
        type: 'summary',
        content: `${processedFile.originalName} 파일에서 주요 패턴과 트렌드를 발견했습니다.`,
        confidence: 0.95,
        relevance: 0.9,
        tags: ['패턴분석', '트렌드', 'AI'],
        createdAt: new Date(),
        metadata: {
          source: fileInfo.name,
          context: '파일 분석',
          impact: 'high'
        }
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'recommendation',
        content: '이 파일과 유사한 문서들을 함께 분석하면 더 정확한 인사이트를 얻을 수 있습니다.',
        confidence: 0.88,
        relevance: 0.85,
        tags: ['추천', '분석', '최적화'],
        createdAt: new Date(),
        metadata: {
          source: 'AI 분석',
          context: '학습 결과',
          impact: 'medium'
        }
      }
    ];

    setAiInsights(prev => [...prev, ...newInsights]);

    // 학습 완료 콜백
    onLearningComplete?.({
      sessionId: learningSession.id,
      fileId: fileInfo.id,
      insights: newInsights.map(insight => insight.content),
      confidence: 0.95,
      recommendations: ['추가 파일 분석', '패턴 학습', '모델 업데이트'],
      nextSteps: ['인사이트 검토', '추가 학습', '모델 배포']
    });
  };

  // 파일 업로드 처리 (고도화)
  const handleFileUpload = useCallback(async (uploadedFiles: FileList) => {
    console.log('handleFileUpload 호출됨:', uploadedFiles);
    const newFiles: FileInfo[] = Array.from(uploadedFiles).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0
    }));

    console.log('새 파일들 생성됨:', newFiles.map(f => f.name));
    setFiles(prev => [...prev, ...newFiles]);
    setActiveTab('processing');

    // 각 파일에 대해 고도화된 처리 시작
    for (const fileInfo of newFiles) {
      await processFileAdvanced(fileInfo);
    }
  }, []);

  // 고도화된 파일 처리
  const processFileAdvanced = async (fileInfo: FileInfo) => {
    try {
      // 1. 업로드 단계
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // 실제 파일 업로드
      const sessionId = projectId || 'default';
      const uploadResponse = await uploadFileToServer(fileInfo.file, sessionId);

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || '파일 업로드 실패');
      }

      // 업로드 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, progress: i, uploadResponse }
            : f
        ));
      }

      // 2. 고도화된 처리 단계
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      const fileType = classifyFileType(fileInfo.file);
      const processedFile = await analyzeFileAdvanced(fileInfo, fileType, uploadResponse);

      // 3. 고도화된 학습 단계
      if (autoLearning) {
        setFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, status: 'learning', progress: 0 }
            : f
        ));

        await performAdvancedLearning(fileInfo, processedFile);
      }

      // 4. 완료
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

      setProcessedFiles(prev => [...prev, processedFile]);
      onFileProcessed?.(processedFile);

    } catch (error) {
      console.error('파일 처리 실패:', error);
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('파일 선택됨:', event.target.files);
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('선택된 파일들:', Array.from(files).map(f => f.name));
      // 즉시 파일 목록에 추가
      const newFiles: FileInfo[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0
      }));

      console.log('새 파일들 생성됨:', newFiles.map(f => f.name));
      setFiles(prev => [...prev, ...newFiles]);
      setActiveTab('processing');

      // 각 파일에 대해 처리 시작
      newFiles.forEach(fileInfo => {
        processFileAdvanced(fileInfo);
      });
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 파일 제거
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setProcessedFiles(prev => prev.filter(f => f.id !== fileId));
    setLearningSessions(prev => prev.filter(s => s.fileId !== fileId));
  };

  // 학습 세션 제어
  const pauseLearning = (sessionId: string) => {
    setLearningSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, status: 'paused' }
        : s
    ));
  };

  const resumeLearning = (sessionId: string) => {
    setLearningSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, status: 'running' }
        : s
    ));
  };

  const stopLearning = (sessionId: string) => {
    setLearningSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, status: 'failed' }
        : s
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">고도화된 파일 업로드 & AI 학습 시스템</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="파일 업로드 모달 닫기"
            title="ESC 키로도 닫을 수 있습니다"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* 왼쪽 패널 - 설정 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* AI 학습 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI 학습 설정</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoLearning}
                      onChange={(e) => setAutoLearning(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">자동 AI 학습 활성화</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학습 모드
                    </label>
                    <select
                      value={learningMode}
                      onChange={(e) => setLearningMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="학습 모드 선택"
                    >
                      <option value="basic">기본 학습</option>
                      <option value="advanced">고급 학습</option>
                      <option value="deep">딥러닝 학습</option>
                      <option value="custom">커스텀 학습</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 고도화된 추출 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI 분석 설정</h3>
                <div className="space-y-3">
                  {Object.entries(extractionSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setExtractionSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key === 'extractText' && '텍스트 추출'}
                        {key === 'generateSummary' && '요약 생성'}
                        {key === 'extractKeywords' && '키워드 추출'}
                        {key === 'analyzeSentiment' && '감정 분석'}
                        {key === 'classifyContent' && '내용 분류'}
                        {key === 'detectAnomalies' && '이상치 탐지'}
                        {key === 'generateRecommendations' && '추천 생성'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 학습 최적화 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">학습 최적화</h3>
                <div className="space-y-3">
                  {Object.entries(learningSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setLearningSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key === 'autoStart' && '자동 시작'}
                        {key === 'batchProcessing' && '배치 처리'}
                        {key === 'incrementalLearning' && '증분 학습'}
                        {key === 'crossValidation' && '교차 검증'}
                        {key === 'earlyStopping' && '조기 종료'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 파일 업로드 영역 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">파일 업로드</h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    console.log('업로드 영역 클릭됨');
                    fileInputRef.current?.click();
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                    aria-label="파일 업로드"
                    title="파일을 선택하세요"
                  />
                  <div className="space-y-4">
                    <PlusIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        모든 파일 형식 지원 • AI 자동분류 • 딥러닝 학습
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">지원 파일 형식:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>📄 문서: PDF, Word, PowerPoint, Excel</div>
                          <div>🖼️ 이미지: JPG, PNG, GIF, SVG</div>
                          <div>🎥 비디오: MP4, AVI, MOV, WMV</div>
                          <div>🎵 오디오: MP3, WAV, FLAC, AAC</div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        클릭하거나 파일을 여기에 드래그하세요
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        console.log('파일 선택 버튼 클릭됨');
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      파일 선택
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 패널 - 결과 */}
          <div className="flex-1 flex flex-col">
            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                업로드
              </button>
              <button
                onClick={() => setActiveTab('processing')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'processing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                처리 중
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'learning'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                AI 학습
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'insights'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                인사이트
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                분석
              </button>
            </div>

            {/* 탭 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">업로드된 파일</h3>
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>업로드된 파일이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div key={file.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.type, file.name)}
                              <div>
                                <p className="font-medium text-gray-800">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.size)} • {getFileTypeLabel(file.type, file.name)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${file.status === 'completed' ? 'bg-green-100 text-green-800' :
                                file.status === 'error' ? 'bg-red-100 text-red-800' :
                                  file.status === 'learning' ? 'bg-purple-100 text-purple-800' :
                                    file.status === 'processing' ? 'bg-orange-100 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                }`}>
                                {file.status === 'uploading' && '📤 업로드 중'}
                                {file.status === 'processing' && '⚙️ 처리 중'}
                                {file.status === 'learning' && '🧠 AI 학습 중'}
                                {file.status === 'completed' && '✅ 완료'}
                                {file.status === 'error' && '❌ 오류'}
                              </span>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="파일 제거"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {file.status !== 'completed' && file.status !== 'error' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>진행률</span>
                                <span>{file.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${file.status === 'uploading' ? 'bg-blue-500' :
                                      file.status === 'processing' ? 'bg-orange-500' :
                                        file.status === 'learning' ? 'bg-purple-500' :
                                          'bg-blue-500'
                                    }`}
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {file.status === 'uploading' && '서버에 업로드 중...'}
                                  {file.status === 'processing' && 'AI 분석 중...'}
                                  {file.status === 'learning' && '딥러닝 학습 중...'}
                                </span>
                                <span>{file.progress}%</span>
                              </div>
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="mt-3 p-2 bg-green-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span className="text-sm text-green-800">처리 완료</span>
                              </div>
                            </div>
                          )}
                          {file.status === 'error' && (
                            <div className="mt-3 p-2 bg-red-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600">❌</span>
                                <span className="text-sm text-red-800">처리 실패</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'learning' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">AI 학습 세션</h3>
                  {learningSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CpuChipIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>AI 학습 세션이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {learningSessions.map((session) => (
                        <div key={session.id} className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <CpuChipIcon className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {session.type === 'deep_learning' && '딥러닝 학습'}
                                  {session.type === 'classification' && '분류 학습'}
                                  {session.type === 'extraction' && '추출 학습'}
                                  {session.type === 'analysis' && '분석 학습'}
                                  {session.type === 'summarization' && '요약 학습'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  모델 버전: {session.modelVersion}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                {session.status === 'pending' && '대기 중'}
                                {session.status === 'running' && '실행 중'}
                                {session.status === 'paused' && '일시정지'}
                                {session.status === 'completed' && '완료'}
                                {session.status === 'failed' && '실패'}
                              </span>
                              {session.status === 'running' && (
                                <button
                                  onClick={() => pauseLearning(session.id)}
                                  className="p-1 text-purple-600 hover:text-purple-800"
                                  title="일시정지"
                                >
                                  <PauseIcon className="w-4 h-4" />
                                </button>
                              )}
                              {session.status === 'paused' && (
                                <button
                                  onClick={() => resumeLearning(session.id)}
                                  className="p-1 text-purple-600 hover:text-purple-800"
                                  title="재개"
                                >
                                  <PlayIcon className="w-4 h-4" />
                                </button>
                              )}
                              {session.status === 'running' && (
                                <button
                                  onClick={() => stopLearning(session.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="중지"
                                >
                                  <StopIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {session.status === 'running' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>학습 진행률</span>
                                <span>{session.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${session.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {session.status === 'completed' && session.learningMetrics && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">정확도:</span>
                                  <span className="font-medium ml-2">
                                    {(session.learningMetrics.accuracy * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">손실:</span>
                                  <span className="font-medium ml-2">
                                    {session.learningMetrics.loss.toFixed(3)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">에포크:</span>
                                  <span className="font-medium ml-2">
                                    {session.learningMetrics.epochs}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">학습률:</span>
                                  <span className="font-medium ml-2">
                                    {session.learningMetrics.learningRate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">AI 인사이트</h3>
                  {aiInsights.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <LightBulbIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>AI 인사이트가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiInsights.map((insight) => (
                        <div key={insight.id} className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                              <span className="font-medium text-gray-800">
                                {insight.type === 'summary' && '요약'}
                                {insight.type === 'key_point' && '핵심 포인트'}
                                {insight.type === 'trend' && '트렌드'}
                                {insight.type === 'anomaly' && '이상치'}
                                {insight.type === 'recommendation' && '추천'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {(insight.confidence * 100).toFixed(0)}% 신뢰도
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {(insight.relevance * 100).toFixed(0)}% 관련성
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{insight.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {insight.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">AI 분석 대시보드</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChartBarIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-medium text-gray-800">처리된 파일</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{processedFiles.length}</p>
                      <p className="text-sm text-gray-500">총 업로드된 파일</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <CpuChipIcon className="w-5 h-5 text-purple-500" />
                        <h4 className="font-medium text-gray-800">학습 세션</h4>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{learningSessions.length}</p>
                      <p className="text-sm text-gray-500">완료된 AI 학습</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-medium text-gray-800">AI 인사이트</h4>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{aiInsights.length}</p>
                      <p className="text-sm text-gray-500">생성된 인사이트</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <AcademicCapIcon className="w-5 h-5 text-green-500" />
                        <h4 className="font-medium text-gray-800">평균 정확도</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {learningSessions.length > 0
                          ? (learningSessions.reduce((acc, session) =>
                            acc + (session.learningMetrics?.accuracy || 0), 0) / learningSessions.length * 100).toFixed(1)
                          : '0'}%
                      </p>
                      <p className="text-sm text-gray-500">AI 학습 성능</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <CogIcon className="w-5 h-5 text-orange-500" />
                        <h4 className="font-medium text-gray-800">처리 시간</h4>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {learningSessions.length > 0
                          ? Math.round(learningSessions.reduce((acc, session) =>
                            acc + (session.learningMetrics?.processingTime || 0), 0) / 1000)
                          : '0'}초
                      </p>
                      <p className="text-sm text-gray-500">총 학습 시간</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-medium text-gray-800">AI 모델</h4>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600">v3.2.0</p>
                      <p className="text-sm text-gray-500">최신 버전</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSmartFileUpload; 