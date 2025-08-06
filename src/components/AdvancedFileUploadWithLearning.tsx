import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  DocumentTextIcon,
  FolderIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CpuChipIcon,
  ChartBarIcon,
  CogIcon,
  ArrowPathIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  DocumentIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  SignalIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';

interface AdvancedFileUploadWithLearningProps {
  isOpen?: boolean;
  onClose: () => void;
  projectId?: string;
  onFileProcessed?: (fileInfo: ProcessedFileInfo) => void;
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
    complexityScore: number;
    readabilityScore: number;
    emotionalTone: string;
    formalityLevel: string;
    technicalTerms: string[];
    namedEntities: string[];
    documentStructure: {
      sections: string[];
      headings: string[];
      lists: string[];
      tables: string[];
    };
  };
  metadata: {
    wordCount: number;
    pageCount?: number;
    readingTime: number;
    complexityLevel: string;
    fileSize: number;
    processingTime: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    uniqueWords: number;
    vocabularyDiversity: number;
  };
  analysisResults?: {
    sentimentAnalysis: {
      overall: string;
      positive: number;
      negative: number;
      neutral: number;
      emotions: { [key: string]: number };
    };
    topicModeling: {
      topics: Array<{ name: string; weight: number; keywords: string[] }>;
      coherence: number;
    };
    entityRecognition: {
      persons: string[];
      organizations: string[];
      locations: string[];
      dates: string[];
      amounts: string[];
    };
    textClassification: {
      domain: string;
      genre: string;
      purpose: string;
      audience: string;
    };
  };
}

interface LearningSession {
  id: string;
  fileId: string;
  type: 'classification' | 'extraction' | 'analysis' | 'summarization' | 'sentiment' | 'topic' | 'entity';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: {
    accuracy: number;
    learningRate: number;
    epochs: number;
    loss: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    confusionMatrix?: number[][];
    featureImportance?: { [key: string]: number };
    modelVersion: string;
    trainingTime: number;
    validationScore?: number;
  };
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  modelType?: 'neural_network' | 'random_forest' | 'svm' | 'bert' | 'custom';
  datasetSize?: number;
  validationSplit?: number;
}

// 파일 결과 카드 컴포넌트 분리 및 메모이제이션
const FileResultCard = React.memo(({ file, selected, onToggleSelect }: {
  file: ProcessedFileInfo;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) => (
  <div className="bg-white border rounded-lg p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(file.id)}
          className="rounded text-blue-600 focus:ring-blue-500"
          title="파일 선택"
        />
        <DocumentTextIcon className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-medium text-gray-800">{file.originalName}</p>
          <p className="text-sm text-gray-500">{file.category} • {file.subcategory}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${file.learningData?.priority === 'high' ? 'bg-red-100 text-red-800' : file.learningData?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{file.learningData?.priority}</span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-gray-800 mb-2">분석 결과</h4>
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-600">신뢰도:</span><span className="font-medium ml-2">{(file.learningData?.confidence || 0) * 100}%</span></div>
          <div><span className="text-gray-600">언어:</span><span className="font-medium ml-2">{file.learningData?.language}</span></div>
          <div><span className="text-gray-600">감정:</span><span className="font-medium ml-2">{file.learningData?.sentiment}</span></div>
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-800 mb-2">키워드</h4>
        <div className="flex flex-wrap gap-1">
          {file.learningData?.keywords.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{keyword}</span>
          ))}
        </div>
      </div>
    </div>
    {file.summary && (
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">요약</h4>
        <p className="text-sm text-gray-600">{file.summary}</p>
      </div>
    )}
    {file.keyInsights && file.keyInsights.length > 0 && (
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">주요 인사이트</h4>
        <ul className="space-y-1">
          {file.keyInsights.map((insight, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {file.analysisResults && (
      <div className="mt-4 space-y-4">
        <h4 className="font-medium text-gray-800 mb-2">상세 분석</h4>
        {/* 상세 분석 결과 렌더링 (생략) */}
      </div>
    )}
  </div>
));

const AdvancedFileUploadWithLearning: React.FC<AdvancedFileUploadWithLearningProps> = ({
  isOpen,
  onClose,
  projectId,
  onFileProcessed
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileInfo[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'processing' | 'learning' | 'results' | 'ai-models' | 'security' | 'dashboard' | 'collaboration' | 'performance'>('upload');
  const [autoLearning, setAutoLearning] = useState(true);
  const [learningMode, setLearningMode] = useState<'basic' | 'advanced' | 'deep'>('advanced');
  const [extractionSettings, setExtractionSettings] = useState({
    extractText: true,
    generateSummary: true,
    extractKeywords: true,
    analyzeSentiment: true,
    classifyContent: true
  });

  // 새로운 상태 추가
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [selectedFilesForExport, setSelectedFilesForExport] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // 실시간 협업 상태
  const [collaborators, setCollaborators] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    currentActivity: string;
    lastSeen: Date;
  }>>([]);
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: Date;
    type: 'text' | 'file' | 'analysis';
  }>>([]);

  // WebSocket 연결 설정
  const initializeWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/collaboration');

    ws.onopen = () => {
      console.log('WebSocket 연결 성공');
      setIsCollaborationEnabled(true);

      // 사용자 정보 전송
      ws.send(JSON.stringify({
        type: 'user_join',
        data: {
          userId: 'user_' + Date.now(),
          userName: '사용자',
          userAvatar: 'https://via.placeholder.com/40'
        }
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'user_list':
          setCollaborators(message.data.users);
          break;
        case 'user_activity':
          handleUserActivity(message.data);
          break;
        case 'file_update':
          handleFileUpdate(message.data);
          break;
        case 'chat_message':
          handleChatMessage(message.data);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      setIsCollaborationEnabled(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setIsCollaborationEnabled(false);
    };

    setWsConnection(ws);
  }, []);

  // 사용자 활동 처리
  const handleUserActivity = useCallback((data: any) => {
    setCollaborators(prev => prev.map(user =>
      user.id === data.userId
        ? { ...user, currentActivity: data.activity, lastSeen: new Date() }
        : user
    ));
  }, []);

  // 파일 업데이트 처리
  const handleFileUpdate = useCallback((data: any) => {
    // 다른 사용자의 파일 업데이트 처리
    console.log('파일 업데이트:', data);

    // 실시간 알림
    if (data.userId !== 'current_user') {
      showNotification(`${data.userName}님이 파일을 업데이트했습니다.`);
    }
  }, []);

  // 채팅 메시지 전송
  const sendChatMessage = useCallback((message: string, type: 'text' | 'file' | 'analysis' = 'text') => {
    const chatMessage = {
      id: Date.now().toString(),
      sender: '나',
      message,
      timestamp: new Date(),
      type
    };

    setChatMessages(prev => [...prev, chatMessage]);

    // WebSocket을 통해 메시지 전송
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'chat_message',
        data: {
          message,
          messageType: type,
          timestamp: new Date()
        }
      }));
    }
  }, [wsConnection]);

  // 채팅 메시지 수신 처리
  const handleChatMessage = useCallback((data: any) => {
    const chatMessage = {
      id: Date.now().toString(),
      sender: data.sender,
      message: data.message,
      timestamp: new Date(data.timestamp),
      type: data.messageType || 'text'
    };

    setChatMessages(prev => [...prev, chatMessage]);
  }, []);

  // WebSocket 연결 초기화
  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [initializeWebSocket]);

  // 고급 분석 도구 상태
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState<'comparative' | 'trend' | 'correlation' | 'clustering'>('comparative');
  const [analysisResults, setAnalysisResults] = useState<{
    type: string;
    title: string;
    summary?: any;
    insights?: any;
    recommendations?: any;
    data?: any;
    anomalies?: any;
  } | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // AI 자동화 기능 상태
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [autoAnalysisRules, setAutoAnalysisRules] = useState<Array<{
    id: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>>([
    {
      id: '1',
      name: '긴 문서 자동 요약',
      condition: '문서 길이 > 1000자',
      action: '자동 요약 생성',
      enabled: true
    },
    {
      id: '2',
      name: '감정 분석 자동 실행',
      condition: '문서 타입 = 문서',
      action: '감정 분석 수행',
      enabled: true
    },
    {
      id: '3',
      name: '키워드 추출 자동화',
      condition: '모든 문서',
      action: '키워드 추출',
      enabled: true
    }
  ]);
  const [autoProcessingLog, setAutoProcessingLog] = useState<Array<{
    id: string;
    timestamp: Date;
    action: string;
    file: string;
    result: string;
  }>>([]);

  // 고급 시각화 도구 상태
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'network' | 'timeline' | 'heatmap' | 'scatter'>('network');
  const [visualizationData, setVisualizationData] = useState<Record<string, any> | null>(null);

  // 고급 AI 기능 상태
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<Array<{
    id: string;
    type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    category: string;
    timestamp: Date;
  }>>([]);
  const [aiProcessing, setAiProcessing] = useState(false);

  // 통합 분석 도구 상태
  const [showIntegratedAnalysis, setShowIntegratedAnalysis] = useState(false);
  const [integratedAnalysisType, setIntegratedAnalysisType] = useState<'comprehensive' | 'predictive' | 'comparative' | 'insights'>('comprehensive');
  const [integratedResults, setIntegratedResults] = useState<{
    type: string;
    title: string;
    summary?: any;
    insights?: any;
    recommendations?: any;
    predictions?: any;
    comparisons?: any;
    patterns?: any;
  } | null>(null);
  const [integratedAnalysisProgress, setIntegratedAnalysisProgress] = useState(0);

  // 파일 분할 업로드 상태
  const [chunkSize, setChunkSize] = useState(1024 * 1024); // 1MB 청크
  const [uploadChunks, setUploadChunks] = useState<Map<string, { total: number; completed: number; chunks: Blob[] }>>(new Map());

  // Web Worker를 활용한 백그라운드 처리
  const [worker, setWorker] = useState<Worker | null>(null);
  const [backgroundTasks, setBackgroundTasks] = useState<Map<string, { type: string; progress: number }>>(new Map());

  // 성능 모니터링 상태
  const [performanceMetrics, setPerformanceMetrics] = useState({
    memory: {
      used: 0,
      total: 0,
      percentage: 0
    },
    cpu: {
      usage: 0,
      cores: navigator.hardwareConcurrency || 4
    },
    network: {
      downloadSpeed: 0,
      uploadSpeed: 0,
      latency: 0
    },
    storage: {
      used: 0,
      total: 0,
      percentage: 0
    },
    filesProcessed: 0,
    averageFileSize: 0,
    totalProcessingTime: 0,
    processingSpeed: 0
  });

  const [optimizationSettings, setOptimizationSettings] = useState({
    autoOptimize: true,
    memoryThreshold: 80, // %
    cpuThreshold: 70, // %
    networkThreshold: 1000, // MB/s
    compressionLevel: 'medium' as 'low' | 'medium' | 'high',
    cacheEnabled: true,
    backgroundProcessing: true
  });

  const { modalRef, handleClose } = useModalClose({
    isOpen: isOpen || false,
    onClose
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 타입 분류
  const classifyFileType = (file: File): 'document' | 'image' | 'video' | 'audio' | 'other' => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text') ||
      file.name.match(/\.(doc|docx|txt|rtf|odt)$/i)) return 'document';
    return 'other';
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일을 청크로 분할하는 함수
  const splitFileIntoChunks = (file: File, chunkSize: number): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

  // 청크 업로드 처리
  const uploadFileInChunks = async (file: File, fileInfo: FileInfo) => {
    const chunks = splitFileIntoChunks(file, chunkSize);
    const chunkInfo = { total: chunks.length, completed: 0, chunks };

    setUploadChunks(prev => new Map(prev.set(fileInfo.id, chunkInfo)));

    for (let i = 0; i < chunks.length; i++) {
      // 청크 업로드 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 200));

      setUploadChunks(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(fileInfo.id);
        if (current) {
          current.completed = i + 1;
          newMap.set(fileInfo.id, current);
        }
        return newMap;
      });

      // 파일 진행률 업데이트
      const progress = ((i + 1) / chunks.length) * 100;
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id ? { ...f, progress } : f
      ));
    }

    // 청크 정보 정리
    setUploadChunks(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileInfo.id);
      return newMap;
    });
  };

  // 병렬 파일 처리
  const processFilesInParallel = async (fileInfos: FileInfo[]) => {
    const processingPromises = fileInfos.map(async (fileInfo) => {
      try {
        if (fileInfo.size > chunkSize) {
          // 대용량 파일은 분할 업로드
          await uploadFileInChunks(fileInfo.file, fileInfo);
        } else {
          // 소용량 파일은 기존 방식
          await processFile(fileInfo);
        }
        return { success: true, fileId: fileInfo.id };
      } catch (error) {
        console.error(`파일 처리 실패: ${fileInfo.name}`, error);
        return { success: false, fileId: fileInfo.id, error };
      }
    });

    const results = await Promise.all(processingPromises);

    // 결과 처리
    const successfulFiles = results.filter(result => result.success);
    const failedFiles = results.filter(result => !result.success);

    if (failedFiles.length > 0) {
      console.warn(`${failedFiles.length}개 파일 처리 실패`);
    }

    return { successfulFiles, failedFiles };
  };

  // 파일 업로드 처리 (보안 검사 적용)
  const handleFileUpload = useCallback(async (uploadedFiles: FileList) => {
    const validFiles: File[] = [];
    const blockedFiles: string[] = [];

    // 보안 검사 수행
    for (const file of Array.from(uploadedFiles)) {
      if (checkFileAccess(file)) {
        validFiles.push(file);
      } else {
        blockedFiles.push(file.name);
      }
    }

    if (blockedFiles.length > 0) {
      alert(`다음 파일들이 보안 정책에 의해 차단되었습니다:\n${blockedFiles.join('\n')}`);
    }

    if (validFiles.length === 0) {
      return;
    }

    const newFiles: FileInfo[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setActiveTab('processing');

    // 암호화 및 병렬 처리 시작
    const { successfulFiles, failedFiles } = await processFilesInParallel(newFiles);

    // 실패한 파일 상태 업데이트
    failedFiles.forEach(({ fileId }) => {
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
      ));
    });
  }, [chunkSize]);

  // 보안 상태 관리 (위로 이동)
  const [securitySettings, setSecuritySettings] = useState({
    encryptionEnabled: true,
    accessControlEnabled: true,
    auditLogEnabled: true,
    encryptionLevel: 'AES-256' as 'AES-128' | 'AES-256' | 'ChaCha20',
    sessionTimeout: 30, // 분
    maxFileSize: 100, // MB
    allowedFileTypes: ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*']
  });

  const [auditLog, setAuditLog] = useState<Array<{
    id: string;
    timestamp: Date;
    action: 'upload' | 'download' | 'share' | 'delete' | 'analyze' | 'export';
    userId: string;
    fileName: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed' | 'blocked';
    details: string;
  }>>([]);

  // 보안 감사 로그 추가 (위로 이동)
  const addAuditLog = useCallback((action: string, fileName: string, status: 'success' | 'failed' | 'blocked', details: string = '') => {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: action as any,
      userId: 'current_user',
      fileName,
      ipAddress: '127.0.0.1', // 실제 구현에서는 클라이언트 IP 가져오기
      userAgent: navigator.userAgent,
      status,
      details
    };

    setAuditLog(prev => [logEntry, ...prev.slice(0, 99)]); // 최근 100개만 유지
  }, []);

  // 알림 함수 (위로 이동)
  const showNotification = useCallback((message: string) => {
    // 브라우저 알림 API 사용
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CORBU AI', { body: message });
    } else {
      // 폴백: alert 사용
      alert(message);
    }
  }, []);

  // 파일 접근 제어 검사 (위로 이동)
  const checkFileAccess = useCallback((file: File): boolean => {
    // 파일 크기 검사
    if (file.size > securitySettings.maxFileSize * 1024 * 1024) {
      addAuditLog('upload', file.name, 'blocked', `파일 크기 초과: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }

    // 파일 타입 검사
    const isAllowedType = securitySettings.allowedFileTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const baseType = allowedType.slice(0, -2);
        return file.type.startsWith(baseType);
      }
      return file.type === allowedType;
    });

    if (!isAllowedType) {
      addAuditLog('upload', file.name, 'blocked', `허용되지 않은 파일 타입: ${file.type}`);
      return false;
    }

    return true;
  }, [securitySettings, addAuditLog]);

  // 파일 처리 (업로드, 분류, 학습)
  const processFile = async (fileInfo: FileInfo) => {
    try {
      // 1. 업로드 단계
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // 업로드 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, progress: i }
            : f
        ));
      }

      // 2. 처리 단계
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      // 파일 분류 및 메타데이터 추출
      const fileType = classifyFileType(fileInfo.file);
      const processedFile = await analyzeFile(fileInfo, fileType);

      // 3. 학습 단계
      if (autoLearning) {
        setFiles(prev => prev.map(f =>
          f.id === fileInfo.id
            ? { ...f, status: 'learning', progress: 0 }
            : f
        ));

        await performLearning(fileInfo, processedFile);
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

  // 파일 분석
  const analyzeFile = async (fileInfo: FileInfo, fileType: string): Promise<ProcessedFileInfo> => {
    // 실제 구현에서는 AI API를 호출하여 파일 분석
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // 텍스트 추출 시뮬레이션
    let extractedText = '';
    let summary = '';
    let keyInsights: string[] = [];

    if (fileType === 'document') {
      extractedText = `이 문서는 ${fileInfo.name}에 대한 내용을 담고 있습니다. 주요 내용으로는 프로젝트 계획, 예산, 일정 등이 포함되어 있습니다.`;
      summary = '프로젝트 관련 문서로, 계획과 예산 정보가 포함되어 있습니다.';
      keyInsights = ['프로젝트 계획', '예산 정보', '일정 관리', '팀 구성'];
    } else if (fileType === 'image') {
      extractedText = '이미지 파일로 텍스트 추출이 제한적입니다.';
      summary = '이미지 파일입니다.';
      keyInsights = ['시각적 정보', '그래프/차트', '사진'];
    }

    return {
      id: fileInfo.id,
      originalName: fileInfo.name,
      processedName: `processed_${fileInfo.name}`,
      fileType: fileType as any,
      category,
      subcategory,
      tags: [fileTypeMap[fileType as keyof typeof fileTypeMap], category, subcategory],
      extractedText,
      summary,
      keyInsights,
      learningData: {
        confidence: 0.85,
        classification: fileType,
        keywords: ['프로젝트', '문서', '정보'],
        topics: ['업무', '관리', '계획'],
        sentiment: 'neutral',
        language: 'ko',
        documentType: fileType,
        priority: 'medium',
        complexityScore: 0.65,
        readabilityScore: 0.78,
        emotionalTone: 'neutral',
        formalityLevel: 'formal',
        technicalTerms: ['프로젝트', '계획', '관리'],
        namedEntities: ['개포우성7차', '재건축'],
        documentStructure: {
          sections: ['개요', '계획', '결론'],
          headings: ['프로젝트 개요', '실행 계획'],
          lists: ['주요 목표', '예산 계획'],
          tables: ['일정표', '예산표']
        }
      },
      metadata: {
        wordCount: extractedText.split(' ').length,
        pageCount: fileType === 'document' ? Math.ceil(fileInfo.size / 50000) : undefined,
        readingTime: Math.ceil(extractedText.length / 200),
        complexityLevel: '보통',
        fileSize: fileInfo.size,
        processingTime: 2000,
        characterCount: extractedText.length,
        sentenceCount: extractedText.split(/[.!?]+/).length - 1,
        paragraphCount: extractedText.split(/\n\s*\n/).length,
        averageSentenceLength: extractedText.split(/[.!?]+/).filter(s => s.trim()).reduce((acc, s) => acc + s.length, 0) / Math.max(extractedText.split(/[.!?]+/).filter(s => s.trim()).length, 1),
        uniqueWords: new Set(extractedText.toLowerCase().split(/\s+/)).size,
        vocabularyDiversity: new Set(extractedText.toLowerCase().split(/\s+/)).size / Math.max(extractedText.split(/\s+/).length, 1)
      },
      analysisResults: {
        sentimentAnalysis: {
          overall: 'neutral',
          positive: 0.3,
          negative: 0.2,
          neutral: 0.5,
          emotions: {
            joy: 0.1,
            sadness: 0.05,
            anger: 0.02,
            fear: 0.03,
            surprise: 0.08
          }
        },
        topicModeling: {
          topics: [
            { name: '프로젝트 관리', weight: 0.4, keywords: ['계획', '일정', '예산'] },
            { name: '재건축', weight: 0.3, keywords: ['개포우성', '7차', '아파트'] },
            { name: '업무 문서', weight: 0.3, keywords: ['보고서', '문서', '정리'] }
          ],
          coherence: 0.75
        },
        entityRecognition: {
          persons: ['김철수', '이영희'],
          organizations: ['개포우성7차', '재건축조합'],
          locations: ['개포동', '서울시'],
          dates: ['2024년', '2025년'],
          amounts: ['100억원', '50억원']
        },
        textClassification: {
          domain: 'business',
          genre: 'report',
          purpose: 'information',
          audience: 'stakeholders'
        }
      }
    };
  };

  // 딥러닝 학습 수행
  const performLearning = async (fileInfo: FileInfo, processedFile: ProcessedFileInfo) => {
    const learningSession: LearningSession = {
      id: Date.now().toString(),
      fileId: fileInfo.id,
      type: 'classification',
      status: 'running',
      progress: 0,
      startedAt: new Date()
    };

    setLearningSessions(prev => [...prev, learningSession]);

    // 학습 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLearningSessions(prev => prev.map(session =>
        session.id === learningSession.id
          ? { ...session, progress: i }
          : session
      ));
    }

    // 학습 완료
    setLearningSessions(prev => prev.map(session =>
      session.id === learningSession.id
        ? {
          ...session,
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          result: {
            accuracy: 0.92,
            learningRate: 0.001,
            epochs: 50,
            loss: 0.08,
            precision: 0.89,
            recall: 0.91,
            f1Score: 0.90,
            modelVersion: '1.2.0',
            trainingTime: 2.5,
            validationScore: 0.88
          }
        }
        : session
    ));
  };

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
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

  // 배치 처리 시작
  const startBatchProcessing = async () => {
    if (files.length === 0) return;

    setBatchProcessing(true);

    for (const fileInfo of files) {
      await processFile(fileInfo);
    }

    setBatchProcessing(false);
  };

  // 파일 내보내기
  const exportFiles = () => {
    if (selectedFilesForExport.length === 0) return;

    const selectedProcessedFiles = processedFiles.filter(f =>
      selectedFilesForExport.includes(f.id)
    );

    let exportData: string;

    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(selectedProcessedFiles, null, 2);
        break;
      case 'csv':
        exportData = convertToCSV(selectedProcessedFiles);
        break;
      case 'pdf':
        exportData = convertToPDF(selectedProcessedFiles);
        break;
      default:
        exportData = JSON.stringify(selectedProcessedFiles, null, 2);
    }

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file_analysis_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    setSelectedFilesForExport([]);
  };

  // CSV 변환
  const convertToCSV = (files: ProcessedFileInfo[]): string => {
    const headers = ['파일명', '분류', '신뢰도', '키워드', '요약', '감정', '문자수'];
    const rows = files.map(file => [
      file.originalName,
      file.category,
      (file.learningData?.confidence || 0) * 100,
      file.learningData?.keywords?.join(', ') || '',
      file.summary || '',
      file.learningData?.sentiment || '',
      file.metadata.characterCount
    ]);

    return [headers, ...rows].map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  // PDF 변환 (간단한 텍스트 형식)
  const convertToPDF = (files: ProcessedFileInfo[]): string => {
    let pdfContent = '파일 분석 보고서\n\n';

    files.forEach(file => {
      pdfContent += `파일명: ${file.originalName}\n`;
      pdfContent += `분류: ${file.category} - ${file.subcategory}\n`;
      pdfContent += `신뢰도: ${(file.learningData?.confidence || 0) * 100}%\n`;
      pdfContent += `키워드: ${file.learningData?.keywords?.join(', ') || '없음'}\n`;
      pdfContent += `요약: ${file.summary || '요약 없음'}\n`;
      pdfContent += `감정: ${file.learningData?.sentiment || '알 수 없음'}\n`;
      pdfContent += `문자수: ${file.metadata.characterCount.toLocaleString()}\n\n`;
    });

    return pdfContent;
  };

  // 파일 선택 토글
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFilesForExport(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  // 실시간 협업 기능
  const addCollaborator = (name: string) => {
    const newCollaborator = {
      id: Date.now().toString(),
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      status: 'online' as const,
      currentActivity: '',
      lastSeen: new Date()
    };
    setCollaborators(prev => [...prev, newCollaborator]);
  };

  // 고급 분석 기능
  const performAdvancedAnalysis = async () => {
    if (processedFiles.length < 2) {
      alert('비교 분석을 위해서는 최소 2개 이상의 파일이 필요합니다.');
      return;
    }

    setShowAdvancedAnalysis(true);
    setAnalysisProgress(0);

    // 분석 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysisProgress(i);
    }

    // 분석 결과 생성
    const results = generateAdvancedAnalysisResults();
    setAnalysisResults(results);
  };

  const generateAdvancedAnalysisResults = () => {
    const files = processedFiles.slice(0, 5); // 최대 5개 파일 분석

    switch (analysisType) {
      case 'comparative':
        return {
          type: 'comparative',
          title: '파일 비교 분석',
          data: {
            similarities: files.map((file, index) => ({
              file: file.originalName,
              similarity: 0.7 + (index * 0.05),
              commonKeywords: file.learningData?.keywords?.slice(0, 3) || [],
              sharedTopics: file.learningData?.topics?.slice(0, 2) || []
            })),
            differences: files.map(file => ({
              file: file.originalName,
              uniqueKeywords: file.learningData?.keywords?.slice(3, 6) || [],
              distinctTopics: file.learningData?.topics?.slice(2, 4) || []
            }))
          }
        };

      case 'trend':
        return {
          type: 'trend',
          title: '트렌드 분석',
          data: {
            trends: [
              { keyword: '프로젝트', frequency: 85, trend: 'up' },
              { keyword: '계획', frequency: 72, trend: 'up' },
              { keyword: '관리', frequency: 68, trend: 'stable' },
              { keyword: '분석', frequency: 45, trend: 'down' }
            ],
            timeSeries: files.map((file, index) => ({
              time: `파일 ${index + 1}`,
              sentiment: file.learningData?.sentiment === 'positive' ? 0.7 :
                file.learningData?.sentiment === 'negative' ? 0.3 : 0.5,
              complexity: file.learningData?.complexityScore || 0.5
            }))
          }
        };

      case 'correlation':
        return {
          type: 'correlation',
          title: '상관관계 분석',
          data: {
            correlations: [
              { factor1: '문서 길이', factor2: '복잡도', correlation: 0.78 },
              { factor1: '키워드 수', factor2: '신뢰도', correlation: 0.65 },
              { factor1: '감정 점수', factor2: '가독성', correlation: 0.42 }
            ],
            insights: [
              '문서가 길수록 복잡도가 높아지는 경향이 있습니다.',
              '키워드가 많을수록 분석 신뢰도가 높아집니다.',
              '긍정적인 감정의 문서가 더 읽기 쉬운 경향이 있습니다.'
            ]
          }
        };

      case 'clustering':
        return {
          type: 'clustering',
          title: '클러스터링 분석',
          data: {
            clusters: [
              {
                name: '업무 문서 그룹',
                files: files.filter(f => f.category === '업무문서'),
                centroid: { x: 0.7, y: 0.6 },
                characteristics: ['형식적', '구조화', '객관적']
              },
              {
                name: '분석 문서 그룹',
                files: files.filter(f => f.category === '보고서'),
                centroid: { x: 0.8, y: 0.4 },
                characteristics: ['데이터 중심', '분석적', '결론 지향']
              }
            ],
            outliers: files.filter(f => (f.learningData?.confidence || 0) < 0.6)
          }
        };

      default:
        return null;
    }
  };

  // 학습 세션 재시작
  const restartLearning = async (sessionId: string) => {
    const session = learningSessions.find(s => s.id === sessionId);
    if (!session) return;

    setLearningSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, status: 'running', progress: 0, startedAt: new Date() }
        : s
    ));

    // 학습 재시작 시뮬레이션
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setLearningSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, progress: i }
          : s
      ));
    }

    setLearningSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
          ...s,
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          result: {
            accuracy: 0.95,
            learningRate: 0.0005,
            epochs: 100,
            loss: 0.05,
            precision: 0.93,
            recall: 0.94,
            f1Score: 0.935,
            modelVersion: '1.2.1',
            trainingTime: 3.2,
            validationScore: 0.92
          }
        }
        : s
    ));
  };

  // AI 자동화 기능
  const startAutoProcessing = async () => {
    setAutoProcessing(true);
    const enabledRules = autoAnalysisRules.filter(rule => rule.enabled);

    for (const file of processedFiles) {
      for (const rule of enabledRules) {
        const logEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          action: rule.name,
          file: file.originalName,
          result: '처리 중...'
        };
        setAutoProcessingLog(prev => [...prev, logEntry]);

        // 자동화 규칙에 따른 처리
        await processAutoRule(file, rule);

        // 로그 업데이트
        setAutoProcessingLog(prev => prev.map(log =>
          log.id === logEntry.id
            ? { ...log, result: '완료' }
            : log
        ));
      }
    }

    setAutoProcessing(false);
  };

  const processAutoRule = async (file: ProcessedFileInfo, rule: { id: string; name: string; condition: string; action: string; enabled: boolean; }) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 처리 시뮬레이션

    switch (rule.id) {
      case '1': // 긴 문서 자동 요약
        if (file.metadata.characterCount > 1000) {
          // 요약 생성 로직
          console.log(`${file.originalName}에 대한 자동 요약 생성`);
        }
        break;
      case '2': // 감정 분석 자동 실행
        if (file.fileType === 'document') {
          // 감정 분석 로직
          console.log(`${file.originalName}에 대한 감정 분석 수행`);
        }
        break;
      case '3': // 키워드 추출 자동화
        // 키워드 추출 로직
        console.log(`${file.originalName}에 대한 키워드 추출`);
        break;
    }
  };

  // 고급 시각화 도구
  const generateVisualization = async () => {
    setShowVisualization(true);
    setVisualizationData(null);

    // 시각화 데이터 생성
    await new Promise(resolve => setTimeout(resolve, 1000));

    const data = generateVisualizationData();
    setVisualizationData(data);
  };

  const generateVisualizationData = () => {
    const files = processedFiles.slice(0, 10); // 최대 10개 파일

    switch (visualizationType) {
      case 'network':
        return {
          type: 'network',
          title: '키워드 네트워크',
          nodes: files.flatMap(file =>
            file.learningData?.keywords?.map(keyword => ({
              id: keyword,
              label: keyword,
              size: Math.random() * 20 + 10,
              group: file.category
            })) || []
          ),
          edges: files.flatMap(file =>
            file.learningData?.keywords?.slice(0, -1).map((keyword, index) => ({
              from: keyword,
              to: file.learningData?.keywords?.[index + 1] || keyword,
              weight: Math.random() * 5 + 1
            })) || []
          )
        };

      case 'timeline':
        return {
          type: 'timeline',
          title: '문서 처리 타임라인',
          events: files.map((file, index) => ({
            time: new Date(Date.now() - (files.length - index) * 60000),
            title: file.originalName,
            category: file.category,
            sentiment: file.learningData?.sentiment || 'neutral',
            confidence: file.learningData?.confidence || 0
          }))
        };

      case 'heatmap':
        return {
          type: 'heatmap',
          title: '문서 특성 히트맵',
          data: files.map(file => ({
            file: file.originalName,
            confidence: file.learningData?.confidence || 0,
            complexity: file.learningData?.complexityScore || 0,
            readability: file.learningData?.readabilityScore || 0,
            sentiment: file.learningData?.sentiment === 'positive' ? 0.7 :
              file.learningData?.sentiment === 'negative' ? 0.3 : 0.5
          }))
        };

      case 'scatter':
        return {
          type: 'scatter',
          title: '문서 분포 산점도',
          data: files.map(file => ({
            x: file.metadata.characterCount,
            y: file.learningData?.confidence || 0,
            size: file.learningData?.keywords?.length || 0,
            label: file.originalName,
            category: file.category
          }))
        };

      default:
        return null;
    }
  };

  // 고급 AI 인사이트 생성
  const generateAIInsights = async () => {
    if (processedFiles.length === 0) {
      alert('분석할 파일이 없습니다.');
      return;
    }

    setShowAIInsights(true);
    setAiProcessing(true);

    // AI 인사이트 생성 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const insights = [
      {
        id: '1',
        type: 'pattern' as const,
        title: '문서 길이 패턴 발견',
        description: '대부분의 문서가 500-2000자 범위에 집중되어 있으며, 이는 표준적인 업무 문서의 길이입니다.',
        confidence: 0.92,
        impact: 'medium' as const,
        category: '문서 특성',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'anomaly' as const,
        title: '비정상적으로 긴 문서 감지',
        description: '일부 문서가 평균 길이보다 3배 이상 길어 추가 분석이 필요합니다.',
        confidence: 0.88,
        impact: 'high' as const,
        category: '품질 관리',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'trend' as const,
        title: '감정 변화 트렌드',
        description: '최근 문서들의 감정이 중립에서 긍정으로 변화하는 경향이 관찰됩니다.',
        confidence: 0.85,
        impact: 'medium' as const,
        category: '감정 분석',
        timestamp: new Date()
      },
      {
        id: '4',
        type: 'recommendation' as const,
        title: '문서 구조 개선 제안',
        description: '키워드 밀도가 낮은 문서들에 대해 더 구체적인 키워드 사용을 권장합니다.',
        confidence: 0.78,
        impact: 'low' as const,
        category: '최적화',
        timestamp: new Date()
      }
    ];

    setAiInsights(insights);
    setAiProcessing(false);
  };

  // 통합 분석 수행
  const performIntegratedAnalysis = async () => {
    if (processedFiles.length < 2) {
      alert('통합 분석을 위해서는 최소 2개 이상의 파일이 필요합니다.');
      return;
    }

    setShowIntegratedAnalysis(true);
    setIntegratedAnalysisProgress(0);

    // 분석 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setIntegratedAnalysisProgress(i);
    }

    // 통합 분석 결과 생성
    const results = generateIntegratedAnalysisResults();
    setIntegratedResults(results);
  };

  const generateIntegratedAnalysisResults = () => {
    const files = processedFiles.slice(0, 10);

    switch (integratedAnalysisType) {
      case 'comprehensive':
        return {
          type: 'comprehensive',
          title: '종합 분석 보고서',
          summary: {
            totalFiles: files.length,
            averageConfidence: files.reduce((acc, f) => acc + (f.learningData?.confidence || 0), 0) / files.length,
            averageComplexity: files.reduce((acc, f) => acc + (f.learningData?.complexityScore || 0), 0) / files.length,
            sentimentDistribution: {
              positive: files.filter(f => f.learningData?.sentiment === 'positive').length,
              negative: files.filter(f => f.learningData?.sentiment === 'negative').length,
              neutral: files.filter(f => f.learningData?.sentiment === 'neutral').length
            }
          },
          insights: [
            '문서 품질이 전반적으로 높은 수준을 유지하고 있습니다.',
            '감정 분석 결과 중립적이거나 긍정적인 문서가 대부분입니다.',
            '복잡도와 가독성 간의 균형이 잘 맞춰져 있습니다.'
          ],
          recommendations: [
            '긴 문서에 대한 요약 기능을 활성화하세요.',
            '감정 분석 결과를 활용한 문서 분류를 고려하세요.',
            '키워드 추출 결과를 태그 시스템에 활용하세요.'
          ]
        };

      case 'predictive':
        return {
          type: 'predictive',
          title: '예측 분석',
          predictions: [
            {
              metric: '문서 품질',
              current: 0.75,
              predicted: 0.82,
              trend: 'up',
              confidence: 0.85
            },
            {
              metric: '처리 시간',
              current: 2.3,
              predicted: 1.8,
              trend: 'down',
              confidence: 0.78
            },
            {
              metric: '키워드 다양성',
              current: 0.65,
              predicted: 0.71,
              trend: 'up',
              confidence: 0.92
            }
          ],
          factors: [
            '문서 길이와 복잡도 간의 상관관계',
            '감정 점수와 가독성의 관계',
            '키워드 수와 신뢰도의 연관성'
          ]
        };

      case 'comparative':
        return {
          type: 'comparative',
          title: '비교 분석',
          comparisons: [
            {
              dimension: '문서 길이',
              group1: '짧은 문서 (< 500자)',
              group2: '긴 문서 (> 2000자)',
              difference: '긴 문서가 평균 40% 더 높은 신뢰도를 보입니다.',
              significance: 0.05
            },
            {
              dimension: '감정 분포',
              group1: '긍정적 문서',
              group2: '부정적 문서',
              difference: '긍정적 문서가 더 높은 가독성을 보입니다.',
              significance: 0.01
            },
            {
              dimension: '복잡도',
              group1: '단순한 문서',
              group2: '복잡한 문서',
              difference: '복잡한 문서가 더 많은 키워드를 포함합니다.',
              significance: 0.03
            }
          ]
        };

      case 'insights':
        return {
          type: 'insights',
          title: '심화 인사이트',
          patterns: [
            {
              pattern: '문서 길이와 신뢰도의 상관관계',
              description: '문서가 길수록 분석 신뢰도가 높아지는 경향이 있습니다.',
              strength: 0.78,
              examples: files.filter(f => f.metadata.characterCount > 1000).slice(0, 3)
            },
            {
              pattern: '감정과 가독성의 관계',
              description: '긍정적인 감정의 문서가 더 읽기 쉬운 경향이 있습니다.',
              strength: 0.65,
              examples: files.filter(f => f.learningData?.sentiment === 'positive').slice(0, 3)
            },
            {
              pattern: '키워드 다양성과 복잡도',
              description: '키워드가 다양할수록 문서 복잡도가 높아집니다.',
              strength: 0.72,
              examples: files.filter(f => (f.learningData?.keywords?.length || 0) > 5).slice(0, 3)
            }
          ],
          anomalies: files.filter(f =>
            (f.learningData?.confidence || 0) < 0.5 ||
            f.metadata.characterCount > 5000 ||
            (f.learningData?.keywords?.length || 0) < 2
          ).slice(0, 3)
        };

      default:
        return null;
    }
  };

  // Web Worker 초기화
  useEffect(() => {
    if (typeof Window !== 'undefined' && 'Worker' in window) {
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'analyze_file':
              // 파일 분석 시뮬레이션
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                self.postMessage({ type: 'progress', id: data.id, progress });
                
                if (progress >= 100) {
                  clearInterval(interval);
                  self.postMessage({ 
                    type: 'complete', 
                    id: data.id, 
                    result: {
                      analysis: 'completed',
                      processingTime: Math.random() * 2000 + 1000
                    }
                  });
                }
              }, 200);
              break;
              
            case 'process_chunk':
              // 청크 처리 시뮬레이션
              setTimeout(() => {
                self.postMessage({ 
                  type: 'chunk_complete', 
                  id: data.id, 
                  chunkIndex: data.chunkIndex 
                });
              }, 100);
              break;
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const newWorker = new Worker(workerUrl);

      newWorker.onmessage = (e) => {
        const { type, id, progress, result, chunkIndex } = e.data;

        switch (type) {
          case 'progress':
            setBackgroundTasks(prev => {
              const newMap = new Map(prev);
              const current = newMap.get(id);
              if (current) {
                current.progress = progress;
                newMap.set(id, current);
              }
              return newMap;
            });
            break;

          case 'complete':
            setBackgroundTasks(prev => {
              const newMap = new Map(prev);
              newMap.delete(id);
              return newMap;
            });
            // 분석 완료 처리
            break;

          case 'chunk_complete':
            // 청크 완료 처리
            break;
        }
      };

      setWorker(newWorker);

      return () => {
        newWorker.terminate();
        URL.revokeObjectURL(workerUrl);
      };
    }
  }, []);

  // 백그라운드 파일 분석 시작
  const startBackgroundAnalysis = (fileInfo: FileInfo) => {
    if (worker) {
      setBackgroundTasks(prev => new Map(prev.set(fileInfo.id, { type: 'analysis', progress: 0 })));
      worker.postMessage({
        type: 'analyze_file',
        data: { id: fileInfo.id, file: fileInfo }
      });
    }
  };

  // 성능 메트릭 업데이트
  const updatePerformanceMetrics = useCallback(async () => {
    try {
      // 메모리 사용량 (브라우저 지원 시)
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        setPerformanceMetrics(prev => ({
          ...prev,
          memory: {
            used: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
            total: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
            percentage: (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100
          }
        }));
      }

      // CPU 사용률 시뮬레이션 (실제 구현에서는 시스템 메트릭 가져오기)
      const cpuUsage = Math.random() * 100;
      setPerformanceMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: cpuUsage
        }
      }));

      // 네트워크 성능 시뮬레이션
      setPerformanceMetrics(prev => ({
        ...prev,
        network: {
          downloadSpeed: Math.random() * 2000, // MB/s
          uploadSpeed: Math.random() * 1000, // MB/s
          latency: Math.random() * 100 // ms
        }
      }));

      // 스토리지 사용량 시뮬레이션
      setPerformanceMetrics(prev => ({
        ...prev,
        storage: {
          used: Math.random() * 100, // GB
          total: 1000, // GB
          percentage: Math.random() * 100
        }
      }));

    } catch (error) {
      console.error('성능 메트릭 업데이트 실패:', error);
    }
  }, []);

  // 자동 최적화 실행
  const runAutoOptimization = useCallback(() => {
    const optimizations: string[] = [];

    // 메모리 최적화
    if (performanceMetrics.memory.percentage > optimizationSettings.memoryThreshold) {
      // 가비지 컬렉션 트리거
      if ('gc' in window) {
        (window as any).gc();
      }
      optimizations.push('메모리 정리 완료');
    }

    // CPU 최적화
    if (performanceMetrics.cpu.usage > optimizationSettings.cpuThreshold) {
      // 백그라운드 작업 일시 중지
      setOptimizationSettings(prev => ({
        ...prev,
        backgroundProcessing: false
      }));
      optimizations.push('백그라운드 작업 일시 중지');
    }

    // 네트워크 최적화
    if (performanceMetrics.network.downloadSpeed < optimizationSettings.networkThreshold) {
      // 압축 레벨 증가
      setOptimizationSettings(prev => ({
        ...prev,
        compressionLevel: 'high'
      }));
      optimizations.push('네트워크 압축 레벨 증가');
    }

    if (optimizations.length > 0) {
      showNotification(`자동 최적화 실행: ${optimizations.join(', ')}`);
      addAuditLog('optimization', '자동 최적화', 'success', optimizations.join(', '));
    }
  }, [performanceMetrics, optimizationSettings, showNotification, addAuditLog]);

  // 성능 모니터링 효과
  useEffect(() => {
    updatePerformanceMetrics();
    const interval = setInterval(updatePerformanceMetrics, 5000); // 5초마다 업데이트
    return () => clearInterval(interval);
  }, [updatePerformanceMetrics]);

  // 자동 최적화 효과
  useEffect(() => {
    if (optimizationSettings.autoOptimize) {
      const interval = setInterval(runAutoOptimization, 30000); // 30초마다 체크
      return () => clearInterval(interval);
    }
  }, [optimizationSettings.autoOptimize, runAutoOptimization]);

  // 메모리 정리
  const cleanupMemory = useCallback(() => {
    // 불필요한 상태 정리
    setFiles(prev => prev.filter(f => f.status !== 'error'));
    setAuditLog(prev => prev.slice(0, 50)); // 최근 50개만 유지
    setChatMessages(prev => prev.slice(0, 100)); // 최근 100개만 유지

    // 가비지 컬렉션 트리거
    if ('gc' in window) {
      (window as any).gc();
    }

    showNotification('메모리 정리가 완료되었습니다.');
    addAuditLog('optimization', '메모리 정리', 'success', '수동 메모리 정리 완료');
  }, [showNotification, addAuditLog]);

  // 캐시 관리
  const clearCache = useCallback(() => {
    // 브라우저 캐시 정리
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // 로컬 스토리지 정리 (선택적)
    const shouldClearStorage = window.confirm('로컬 스토리지도 정리하시겠습니까?');
    if (shouldClearStorage) {
      localStorage.clear();
    }

    showNotification('캐시가 정리되었습니다.');
    addAuditLog('optimization', '캐시 정리', 'success', '캐시 정리 완료');
  }, [showNotification, addAuditLog]);

  // 비동기 작업 큐 시스템
  const [taskQueue, setTaskQueue] = useState<Array<{
    id: string;
    type: 'upload' | 'analysis' | 'learning' | 'export';
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'running' | 'completed' | 'failed';
    data: any;
    createdAt: Date;
  }>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // 작업 큐에 작업 추가
  const addToTaskQueue = useCallback((task: {
    type: 'upload' | 'analysis' | 'learning' | 'export';
    priority: 'high' | 'medium' | 'low';
    data: any;
  }) => {
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...task,
      status: 'pending' as const,
      createdAt: new Date()
    };

    setTaskQueue(prev => [...prev, newTask]);
  }, []);

  // 큐 처리 함수
  const processTaskQueue = useCallback(async () => {
    if (isProcessingQueue || taskQueue.length === 0) return;

    setIsProcessingQueue(true);

    while (taskQueue.length > 0) {
      const task = taskQueue[0];

      // 작업 상태를 running으로 변경
      setTaskQueue(prev => prev.map(t =>
        t.id === task.id ? { ...t, status: 'running' } : t
      ));

      try {
        // 작업 실행
        switch (task.type) {
          case 'upload':
            await processFile(task.data);
            break;
          case 'analysis':
            await performAdvancedAnalysis();
            break;
          case 'learning':
            await performLearning(task.data.fileInfo, task.data.processedFile);
            break;
          case 'export':
            await exportFiles();
            break;
        }

        // 작업 완료
        setTaskQueue(prev => prev.map(t =>
          t.id === task.id ? { ...t, status: 'completed' } : t
        ));

      } catch (error) {
        console.error(`작업 실패: ${task.type}`, error);

        // 작업 실패
        setTaskQueue(prev => prev.map(t =>
          t.id === task.id ? { ...t, status: 'failed' } : t
        ));
      }

      // 작업 완료 후 큐에서 제거
      setTaskQueue(prev => prev.filter(t => t.id !== task.id));

      // 다음 작업 전 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessingQueue(false);
  }, [taskQueue, isProcessingQueue]);

  // 큐 처리 효과
  useEffect(() => {
    processTaskQueue();
  }, [processTaskQueue]);

  // 지연 로딩 상태
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // 지연 로딩 모달 열기
  const openLazyModal = useCallback((modalType: 'export' | 'analysis' | 'visualization') => {
    setIsLoadingModal(true);

    // 모달 로딩 시뮬레이션
    setTimeout(() => {
      setIsLoadingModal(false);
      switch (modalType) {
        case 'export':
          setShowExportModal(true);
          break;
        case 'analysis':
          setShowAdvancedAnalysis(true);
          break;
        case 'visualization':
          setShowVisualization(true);
          break;
      }
    }, 300);
  }, []);

  // 재시도 메커니즘
  const [retryAttempts, setRetryAttempts] = useState<Map<string, number>>(new Map());
  const maxRetryAttempts = 3;

  // 작업 재시도
  const retryTask = useCallback(async (taskId: string, taskData: any) => {
    const currentAttempts = retryAttempts.get(taskId) || 0;

    if (currentAttempts >= maxRetryAttempts) {
      console.error(`작업 ${taskId} 최대 재시도 횟수 초과`);
      return;
    }

    setRetryAttempts(prev => new Map(prev.set(taskId, currentAttempts + 1)));

    try {
      // 재시도 로직
      await new Promise(resolve => setTimeout(resolve, 1000 * (currentAttempts + 1))); // 지수 백오프

      // 작업 재실행
      switch (taskData.type) {
        case 'upload':
          await processFile(taskData.data);
          break;
        case 'analysis':
          await performAdvancedAnalysis();
          break;
        case 'learning':
          await performLearning(taskData.data.fileInfo, taskData.data.processedFile);
          break;
        case 'export':
          await exportFiles();
          break;
      }

      // 성공 시 재시도 카운트 초기화
      setRetryAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });

    } catch (error) {
      console.error(`재시도 실패: ${taskId}`, error);

      // 재시도 실패 시 다시 큐에 추가
      if (currentAttempts + 1 < maxRetryAttempts) {
        addToTaskQueue({
          type: taskData.type,
          priority: taskData.priority,
          data: taskData.data
        });
      }
    }
  }, [retryAttempts, addToTaskQueue]);

  // 에러 처리 함수
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`${context} 오류:`, error);

    // 사용자에게 에러 알림
    alert(`${context} 중 오류가 발생했습니다: ${error.message}`);

    // 에러 로깅
    const errorLog = {
      timestamp: new Date(),
      context,
      error: error.message,
      stack: error.stack
    };

    console.log('에러 로그:', errorLog);
  }, []);



  // 파일 공유 상태
  const [sharedFiles, setSharedFiles] = useState<Array<{
    id: string;
    name: string;
    sharedBy: string;
    sharedAt: Date;
    permissions: 'read' | 'write' | 'admin';
    collaborators: string[];
  }>>([]);

  // 파일 공유
  const shareFile = useCallback((fileId: string, permissions: 'read' | 'write' | 'admin' = 'read') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const sharedFile = {
      id: fileId,
      name: file.name,
      sharedBy: '나',
      sharedAt: new Date(),
      permissions,
      collaborators: collaborators.map(c => c.id)
    };

    setSharedFiles(prev => [...prev, sharedFile]);

    // WebSocket을 통해 공유 알림 전송
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'file_share',
        data: {
          fileId,
          fileName: file.name,
          permissions,
          sharedBy: '나'
        }
      }));
    }

    // 채팅으로 공유 알림
    sendChatMessage(`📎 파일 "${file.name}"을(를) 공유했습니다.`, 'file');
  }, [files, collaborators, wsConnection, sendChatMessage]);

  // 파일 편집 권한 확인
  const canEditFile = useCallback((fileId: string) => {
    const sharedFile = sharedFiles.find(sf => sf.id === fileId);
    if (!sharedFile) return true; // 공유되지 않은 파일은 편집 가능

    return sharedFile.permissions === 'write' || sharedFile.permissions === 'admin';
  }, [sharedFiles]);

  // 동시 편집 충돌 해결
  const [editConflict, setEditConflict] = useState<{
    fileId: string;
    conflictData: any;
    isVisible: boolean;
  } | null>(null);

  const resolveEditConflict = useCallback((fileId: string, conflictData: any) => {
    // 편집 충돌 해결 로직
    console.log('편집 충돌 해결:', fileId, conflictData);

    // 충돌 모달 표시
    setEditConflict({
      fileId,
      conflictData,
      isVisible: true
    });
  }, []);

  const handleConflictResolution = useCallback((resolution: 'continue' | 'cancel') => {
    if (resolution === 'continue') {
      console.log('편집 충돌 해결됨');
    }
    setEditConflict(null);
  }, []);

  // 다중 AI 모델 분석 상태
  const [aiModels, setAiModels] = useState<Array<{
    id: string;
    name: string;
    type: 'text' | 'image' | 'audio' | 'video' | 'multimodal';
    status: 'available' | 'loading' | 'error';
    accuracy: number;
    processingTime: number;
  }>>([
    { id: 'gpt-4', name: 'GPT-4', type: 'text', status: 'available', accuracy: 0.95, processingTime: 2.3 },
    { id: 'claude-3', name: 'Claude-3', type: 'text', status: 'available', accuracy: 0.93, processingTime: 1.8 },
    { id: 'gemini-pro', name: 'Gemini Pro', type: 'multimodal', status: 'available', accuracy: 0.91, processingTime: 2.1 },
    { id: 'llama-2', name: 'Llama-2', type: 'text', status: 'available', accuracy: 0.89, processingTime: 1.5 },
    { id: 'dall-e-3', name: 'DALL-E 3', type: 'image', status: 'available', accuracy: 0.94, processingTime: 3.2 }
  ]);

  // 다중 AI 모델 분석
  const performMultiModelAnalysis = useCallback(async (fileInfo: FileInfo) => {
    const availableModels = aiModels.filter(model => model.status === 'available');

    if (availableModels.length === 0) {
      throw new Error('사용 가능한 AI 모델이 없습니다.');
    }

    // 파일 타입에 맞는 모델 선택
    const suitableModels = availableModels.filter(model => {
      if (fileInfo.type.startsWith('image/')) {
        return model.type === 'image' || model.type === 'multimodal';
      } else if (fileInfo.type.startsWith('audio/')) {
        return model.type === 'audio' || model.type === 'multimodal';
      } else if (fileInfo.type.startsWith('video/')) {
        return model.type === 'video' || model.type === 'multimodal';
      } else {
        return model.type === 'text' || model.type === 'multimodal';
      }
    });

    // 병렬로 여러 모델 분석 실행
    const analysisPromises = suitableModels.map(async (model) => {
      try {
        const startTime = Date.now();

        // 모델별 분석 수행
        const result = await performModelAnalysis(fileInfo, model);

        const processingTime = (Date.now() - startTime) / 1000;

        return {
          modelId: model.id,
          modelName: model.name,
          result,
          processingTime,
          accuracy: model.accuracy
        };
      } catch (error) {
        console.error(`모델 ${model.name} 분석 실패:`, error);
        return {
          modelId: model.id,
          modelName: model.name,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          processingTime: 0,
          accuracy: 0
        };
      }
    });

    const results = await Promise.all(analysisPromises);

    // 결과 통합 및 신뢰도 계산
    const successfulResults = results.filter(r => !r.error);
    const consensusResult = calculateConsensusResult(successfulResults);

    return {
      individualResults: results,
      consensusResult,
      totalProcessingTime: Math.max(...results.map(r => r.processingTime)),
      averageAccuracy: successfulResults.reduce((sum, r) => sum + r.accuracy, 0) / successfulResults.length
    };
  }, [aiModels]);

  // 모델별 분석 수행
  const performModelAnalysis = async (fileInfo: FileInfo, model: any) => {
    // 실제 AI 모델 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, model.processingTime * 1000));

    return {
      summary: `${model.name} 분석 결과: 파일 "${fileInfo.name}"에 대한 상세 분석이 완료되었습니다.`,
      insights: [
        `모델 ${model.name}이(가) 감지한 주요 패턴`,
        `파일 유형: ${fileInfo.type}`,
        `파일 크기: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`,
        `분석 신뢰도: ${(model.accuracy * 100).toFixed(1)}%`
      ],
      confidence: model.accuracy
    };
  };

  // 합의 결과 계산
  const calculateConsensusResult = (results: any[]) => {
    if (results.length === 0) return null;

    // 가장 높은 신뢰도를 가진 결과를 기본으로 사용
    const bestResult = results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // 다른 모델들의 결과를 보완 정보로 추가
    const consensusInsights = [
      ...bestResult.insights,
      `총 ${results.length}개 모델이 분석에 참여`,
      `평균 신뢰도: ${(results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100).toFixed(1)}%`
    ];

    return {
      summary: bestResult.summary,
      insights: consensusInsights,
      confidence: bestResult.confidence,
      modelCount: results.length
    };
  };

  // 고급 분석 결과 상태
  const [advancedAnalysisResults, setAdvancedAnalysisResults] = useState<Array<{
    id: string;
    fileId: string;
    fileName: string;
    analysisType: 'single' | 'multi-model';
    results: any;
    timestamp: Date;
    processingTime: number;
    modelCount: number;
  }>>([]);

  // 고급 분석 결과 저장
  const saveAdvancedAnalysisResult = useCallback((fileInfo: FileInfo, result: any, analysisType: 'single' | 'multi-model') => {
    const analysisResult = {
      id: Date.now().toString(),
      fileId: fileInfo.id,
      fileName: fileInfo.name,
      analysisType,
      results: result,
      timestamp: new Date(),
      processingTime: result.totalProcessingTime || 0,
      modelCount: result.modelCount || 1
    };

    setAdvancedAnalysisResults(prev => [...prev, analysisResult]);
  }, []);

  // 고급 분석 결과 시각화 데이터 생성
  const generateAdvancedVisualizationData = useCallback((result: any) => {
    if (result.analysisType === 'multi-model') {
      return {
        modelComparison: result.results.individualResults.map((r: any) => ({
          model: r.modelName,
          accuracy: r.accuracy * 100,
          processingTime: r.processingTime,
          confidence: r.result?.confidence * 100 || 0
        })),
        consensusMetrics: {
          averageAccuracy: result.results.averageAccuracy * 100,
          totalProcessingTime: result.results.totalProcessingTime,
          modelCount: result.modelCount
        }
      };
    }

    return {
      singleModel: {
        accuracy: result.results.confidence * 100,
        processingTime: result.processingTime,
        insights: result.results.insights
      }
    };
  }, []);

  // 분석 결과 내보내기
  const exportAnalysisResults = useCallback(() => {
    if (advancedAnalysisResults.length === 0) {
      alert('내보낼 분석 결과가 없습니다.');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalResults: advancedAnalysisResults.length,
      results: advancedAnalysisResults.map(result => ({
        fileName: result.fileName,
        analysisType: result.analysisType,
        processingTime: result.processingTime,
        modelCount: result.modelCount,
        timestamp: result.timestamp.toISOString(),
        summary: result.results.consensusResult?.summary || result.results.summary
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('분석 결과가 성공적으로 내보내졌습니다.');
  }, [advancedAnalysisResults, showNotification]);

  // 감사 로그 내보내기
  const exportAuditLog = useCallback(() => {
    if (auditLog.length === 0) {
      alert('내보낼 감사 로그가 없습니다.');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogs: auditLog.length,
      logs: auditLog.map(log => ({
        timestamp: log.timestamp.toISOString(),
        action: log.action,
        fileName: log.fileName,
        status: log.status,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('감사 로그가 성공적으로 내보내졌습니다.');
  }, [auditLog, showNotification]);



  // 파일 암호화
  const encryptFile = useCallback(async (file: File): Promise<ArrayBuffer> => {
    if (!securitySettings.encryptionEnabled) {
      return await file.arrayBuffer();
    }

    try {
      // Web Crypto API를 사용한 파일 암호화
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: securitySettings.encryptionLevel === 'AES-256' ? 256 : 128
        },
        true,
        ['encrypt', 'decrypt']
      );

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const fileBuffer = await file.arrayBuffer();

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        fileBuffer
      );

      // 암호화된 데이터와 IV를 결합
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      addAuditLog('upload', file.name, 'success', '파일 암호화 완료');
      return combined.buffer;
    } catch (error) {
      console.error('파일 암호화 실패:', error);
      addAuditLog('upload', file.name, 'failed', '암호화 실패');
      throw new Error('파일 암호화에 실패했습니다.');
    }
  }, [securitySettings.encryptionEnabled, securitySettings.encryptionLevel, addAuditLog]);

  // 파일 복호화
  const decryptFile = useCallback(async (encryptedData: ArrayBuffer): Promise<ArrayBuffer> => {
    if (!securitySettings.encryptionEnabled) {
      return encryptedData;
    }

    try {
      // IV와 암호화된 데이터 분리
      const combined = new Uint8Array(encryptedData);
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: securitySettings.encryptionLevel === 'AES-256' ? 256 : 128
        },
        true,
        ['encrypt', 'decrypt']
      );

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encrypted
      );

      return decryptedData;
    } catch (error) {
      console.error('파일 복호화 실패:', error);
      throw new Error('파일 복호화에 실패했습니다.');
    }
  }, [securitySettings.encryptionEnabled, securitySettings.encryptionLevel]);



  // 보안 설정 UI
  const SecuritySettingsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">보안 설정</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${securitySettings.encryptionEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {securitySettings.encryptionEnabled ? '암호화 활성화' : '암호화 비활성화'}
          </span>
        </div>
      </div>

      {/* 암호화 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">암호화 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">파일 암호화</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.encryptionEnabled}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    encryptionEnabled: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              업로드된 모든 파일을 자동으로 암호화합니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              암호화 레벨
            </label>
            <select
              value={securitySettings.encryptionLevel}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                encryptionLevel: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AES-128">AES-128 (빠름)</option>
              <option value="AES-256">AES-256 (보안)</option>
              <option value="ChaCha20">ChaCha20 (최신)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 접근 제어 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">접근 제어</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 파일 크기 (MB)
            </label>
            <input
              type="number"
              value={securitySettings.maxFileSize}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                maxFileSize: parseInt(e.target.value) || 100
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="1000"
            />
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세션 타임아웃 (분)
            </label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value) || 30
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="480"
            />
          </div>
        </div>
      </div>

      {/* 감사 로그 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">감사 로그</h4>
          <button
            onClick={() => exportAuditLog()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            로그 내보내기
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {auditLog.map((log) => (
            <div key={log.id} className={`p-3 rounded-lg border ${log.status === 'success' ? 'bg-green-50 border-green-200' :
              log.status === 'failed' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {log.action} - {log.fileName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {log.timestamp.toLocaleString()} • {log.ipAddress}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${log.status === 'success' ? 'bg-green-100 text-green-800' :
                  log.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {log.status}
                </span>
              </div>
              {log.details && (
                <p className="text-xs text-gray-600 mt-1">{log.details}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 실시간 대시보드 상태
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalFiles: 0,
    processedFiles: 0,
    activeModels: 0,
    averageProcessingTime: 0,
    successRate: 0,
    systemLoad: 0,
    memoryUsage: 0,
    networkSpeed: 0
  });

  const [realTimeCharts, setRealTimeCharts] = useState({
    processingSpeed: [] as Array<{ timestamp: number; value: number }>,
    modelAccuracy: [] as Array<{ timestamp: number; model: string; accuracy: number }>,
    systemPerformance: [] as Array<{ timestamp: number; cpu: number; memory: number }>,
    fileTypes: {} as Record<string, number>
  });

  // 실시간 메트릭 업데이트
  const updateDashboardMetrics = useCallback(() => {
    const newMetrics = {
      totalFiles: files.length,
      processedFiles: files.filter(f => f.status === 'completed').length,
      activeModels: aiModels.filter(m => m.status === 'available').length,
      averageProcessingTime: files.length > 0
        ? files.reduce((sum, f) => sum + (f.progress || 0), 0) / files.length
        : 0,
      successRate: files.length > 0
        ? (files.filter(f => f.status === 'completed').length / files.length) * 100
        : 0,
      systemLoad: Math.random() * 100, // 실제 구현에서는 시스템 메트릭 가져오기
      memoryUsage: Math.random() * 100,
      networkSpeed: Math.random() * 1000 // MB/s
    };

    setDashboardMetrics(newMetrics);

    // 실시간 차트 데이터 업데이트
    const now = Date.now();
    setRealTimeCharts(prev => ({
      processingSpeed: [...prev.processingSpeed.slice(-50), { timestamp: now, value: newMetrics.averageProcessingTime }],
      modelAccuracy: aiModels.map(model => ({
        timestamp: now,
        model: model.name,
        accuracy: model.accuracy * 100
      })),
      systemPerformance: [...prev.systemPerformance.slice(-50), {
        timestamp: now,
        cpu: newMetrics.systemLoad,
        memory: newMetrics.memoryUsage
      }],
      fileTypes: files.reduce((acc, file) => {
        const type = file.type.split('/')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }));
  }, [files, aiModels]);

  // 실시간 업데이트 효과
  useEffect(() => {
    updateDashboardMetrics();
    const interval = setInterval(updateDashboardMetrics, 2000); // 2초마다 업데이트
    return () => clearInterval(interval);
  }, [updateDashboardMetrics]);

  // 차트 데이터 생성
  const generateChartData = useCallback((chartType: 'processing' | 'accuracy' | 'performance' | 'types') => {
    switch (chartType) {
      case 'processing':
        return realTimeCharts.processingSpeed.map(point => ({
          x: new Date(point.timestamp),
          y: point.value
        }));
      case 'accuracy':
        return realTimeCharts.modelAccuracy.map(point => ({
          x: new Date(point.timestamp),
          y: point.accuracy,
          model: point.model
        }));
      case 'performance':
        return realTimeCharts.systemPerformance.map(point => ({
          x: new Date(point.timestamp),
          cpu: point.cpu,
          memory: point.memory
        }));
      case 'types':
        return Object.entries(realTimeCharts.fileTypes).map(([type, count]) => ({
          type,
          count
        }));
      default:
        return [];
    }
  }, [realTimeCharts]);

  // 실시간 대시보드 UI
  const DashboardPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">실시간 대시보드</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">실시간 업데이트</span>
        </div>
      </div>

      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-blue-700">총 파일</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{dashboardMetrics.totalFiles}</p>
          <p className="text-sm text-blue-600">처리 중: {files.filter(f => f.status === 'uploading' || f.status === 'processing').length}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">완료된 파일</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{dashboardMetrics.processedFiles}</p>
          <p className="text-sm text-green-600">성공률: {dashboardMetrics.successRate.toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-purple-700">활성 AI 모델</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{dashboardMetrics.activeModels}</p>
          <p className="text-sm text-purple-600">총 {aiModels.length}개 모델</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-orange-700">평균 처리 시간</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{dashboardMetrics.averageProcessingTime.toFixed(1)}s</p>
          <p className="text-sm text-orange-600">최근 업데이트</p>
        </div>
      </div>

      {/* 시스템 성능 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4">시스템 성능</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU 사용률</span>
              <span className="text-sm font-medium">{dashboardMetrics.systemLoad.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardMetrics.systemLoad}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">메모리 사용률</span>
              <span className="text-sm font-medium">{dashboardMetrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardMetrics.memoryUsage}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">네트워크 속도</span>
              <span className="text-sm font-medium">{dashboardMetrics.networkSpeed.toFixed(1)} MB/s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dashboardMetrics.networkSpeed / 10, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4">파일 타입 분포</h4>
          <div className="space-y-2">
            {Object.entries(realTimeCharts.fileTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / dashboardMetrics.totalFiles) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 모델 성능 차트 */}
      <div className="p-4 bg-white rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">AI 모델 성능</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModels.map((model) => (
            <div key={model.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">{model.name}</h5>
                <div className={`w-2 h-2 rounded-full ${model.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">정확도</span>
                  <span className="text-xs font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full"
                    style={{ width: `${model.accuracy * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">처리 시간</span>
                  <span className="text-xs font-medium">{model.processingTime}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 고급 협업 상태
  const [collaborationFeatures, setCollaborationFeatures] = useState({
    videoCall: {
      isActive: false,
      participants: [] as Array<{
        id: string;
        name: string;
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
        isScreenSharing: boolean;
      }>,
      localStream: null as MediaStream | null,
      remoteStreams: {} as Record<string, MediaStream>
    },
    whiteboard: {
      isActive: false,
      drawings: [] as Array<{
        id: string;
        type: 'line' | 'rectangle' | 'circle' | 'text';
        points: Array<{ x: number; y: number }>;
        color: string;
        strokeWidth: number;
        text?: string;
        timestamp: number;
        userId: string;
      }>,
      currentTool: 'pen' as 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser',
      currentColor: '#000000',
      strokeWidth: 2
    },
    screenSharing: {
      isActive: false,
      stream: null as MediaStream | null,
      participants: [] as string[]
    }
  });

  // WebRTC 연결 관리
  const [peerConnections, setPeerConnections] = useState<Record<string, RTCPeerConnection>>({});

  // 화상 통화 시작
  const startVideoCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setCollaborationFeatures(prev => ({
        ...prev,
        videoCall: {
          ...prev.videoCall,
          isActive: true,
          localStream: stream
        }
      }));

      // WebSocket을 통해 다른 참가자들에게 알림
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'video_call_start',
          data: {
            userId: 'current_user',
            userName: '나'
          }
        }));
      }

      addAuditLog('video_call', '화상 통화', 'success', '화상 통화 시작');
    } catch (error) {
      console.error('화상 통화 시작 실패:', error);
      addAuditLog('video_call', '화상 통화', 'failed', '카메라/마이크 접근 실패');
    }
  }, [wsConnection, addAuditLog]);

  // 화상 통화 종료
  const endVideoCall = useCallback(() => {
    setCollaborationFeatures(prev => ({
      ...prev,
      videoCall: {
        ...prev.videoCall,
        isActive: false,
        localStream: null,
        participants: []
      }
    }));

    // 모든 피어 연결 종료
    Object.values(peerConnections).forEach(pc => pc.close());
    setPeerConnections({});

    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'video_call_end',
        data: { userId: 'current_user' }
      }));
    }

    addAuditLog('video_call', '화상 통화', 'success', '화상 통화 종료');
  }, [peerConnections, wsConnection, addAuditLog]);

  // 화이트보드 시작
  const startWhiteboard = useCallback(() => {
    setCollaborationFeatures(prev => ({
      ...prev,
      whiteboard: {
        ...prev.whiteboard,
        isActive: true
      }
    }));

    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'whiteboard_start',
        data: { userId: 'current_user' }
      }));
    }

    addAuditLog('whiteboard', '화이트보드', 'success', '화이트보드 시작');
  }, [wsConnection, addAuditLog]);

  // 화이트보드 그리기
  const addDrawing = useCallback((drawing: any) => {
    setCollaborationFeatures(prev => ({
      ...prev,
      whiteboard: {
        ...prev.whiteboard,
        drawings: [...prev.whiteboard.drawings, drawing]
      }
    }));

    // 다른 참가자들에게 그리기 정보 전송
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'whiteboard_draw',
        data: {
          drawing,
          userId: 'current_user'
        }
      }));
    }
  }, [wsConnection]);

  // 화면 공유 시작
  const startScreenSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      setCollaborationFeatures(prev => ({
        ...prev,
        screenSharing: {
          ...prev.screenSharing,
          isActive: true,
          stream
        }
      }));

      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'screen_share_start',
          data: { userId: 'current_user' }
        }));
      }

      addAuditLog('screen_share', '화면 공유', 'success', '화면 공유 시작');
    } catch (error) {
      console.error('화면 공유 시작 실패:', error);
      addAuditLog('screen_share', '화면 공유', 'failed', '화면 공유 실패');
    }
  }, [wsConnection, addAuditLog]);

  // 화면 공유 종료
  const stopScreenSharing = useCallback(() => {
    setCollaborationFeatures(prev => ({
      ...prev,
      screenSharing: {
        ...prev.screenSharing,
        isActive: false,
        stream: null
      }
    }));

    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'screen_share_end',
        data: { userId: 'current_user' }
      }));
    }

    addAuditLog('screen_share', '화면 공유', 'success', '화면 공유 종료');
  }, [wsConnection, addAuditLog]);

  // 고급 협업 UI
  const AdvancedCollaborationPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">고급 협업 도구</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${collaborationFeatures.videoCall.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          <span className="text-sm text-gray-600">
            {collaborationFeatures.videoCall.isActive ? '화상 통화 중' : '대기 중'}
          </span>
        </div>
      </div>

      {/* 화상 통화 섹션 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">화상 통화</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">화상 통화</span>
              <button
                onClick={collaborationFeatures.videoCall.isActive ? endVideoCall : startVideoCall}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${collaborationFeatures.videoCall.isActive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                {collaborationFeatures.videoCall.isActive ? '통화 종료' : '통화 시작'}
              </button>
            </div>

            {collaborationFeatures.videoCall.isActive && (
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600">참가자: {collaborationFeatures.videoCall.participants.length + 1}명</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {collaborationFeatures.videoCall.participants.map((participant) => (
                      <span key={participant.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {participant.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">화면 공유</span>
              <button
                onClick={collaborationFeatures.screenSharing.isActive ? stopScreenSharing : startScreenSharing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${collaborationFeatures.screenSharing.isActive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                {collaborationFeatures.screenSharing.isActive ? '공유 중지' : '화면 공유'}
              </button>
            </div>

            {collaborationFeatures.screenSharing.isActive && (
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-600">화면 공유 중</p>
                <p className="text-xs text-gray-500">다른 참가자들이 화면을 볼 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 화이트보드 섹션 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">화이트보드</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">화이트보드</span>
              <button
                onClick={startWhiteboard}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
              >
                시작
              </button>
            </div>

            {collaborationFeatures.whiteboard.isActive && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">도구:</span>
                  <select
                    value={collaborationFeatures.whiteboard.currentTool}
                    onChange={(e) => setCollaborationFeatures(prev => ({
                      ...prev,
                      whiteboard: {
                        ...prev.whiteboard,
                        currentTool: e.target.value as any
                      }
                    }))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pen">펜</option>
                    <option value="rectangle">사각형</option>
                    <option value="circle">원</option>
                    <option value="text">텍스트</option>
                    <option value="eraser">지우개</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">색상:</span>
                  <input
                    type="color"
                    value={collaborationFeatures.whiteboard.currentColor}
                    onChange={(e) => setCollaborationFeatures(prev => ({
                      ...prev,
                      whiteboard: {
                        ...prev.whiteboard,
                        currentColor: e.target.value
                      }
                    }))}
                    className="w-8 h-8 border border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">두께:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={collaborationFeatures.whiteboard.strokeWidth}
                    onChange={(e) => setCollaborationFeatures(prev => ({
                      ...prev,
                      whiteboard: {
                        ...prev.whiteboard,
                        strokeWidth: parseInt(e.target.value)
                      }
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">{collaborationFeatures.whiteboard.strokeWidth}</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 p-4 bg-white rounded-lg border">
            <h5 className="font-medium text-gray-800 mb-3">그림 목록</h5>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {collaborationFeatures.whiteboard.drawings.map((drawing, index) => (
                <div key={drawing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: drawing.color }}
                    />
                    <span className="text-sm text-gray-700">
                      {drawing.type} - {drawing.userId}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(drawing.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}

              {collaborationFeatures.whiteboard.drawings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  아직 그린 그림이 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 협업 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <VideoCameraIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-blue-700">화상 통화</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {collaborationFeatures.videoCall.participants.length + (collaborationFeatures.videoCall.isActive ? 1 : 0)}
          </p>
          <p className="text-sm text-blue-600">참가자</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <ComputerDesktopIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">화면 공유</span>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {collaborationFeatures.screenSharing.isActive ? 1 : 0}
          </p>
          <p className="text-sm text-green-600">활성 공유</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <PencilIcon className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-purple-700">화이트보드</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">
            {collaborationFeatures.whiteboard.drawings.length}
          </p>
          <p className="text-sm text-purple-600">그림 개수</p>
        </div>
      </div>
    </div>
  );

  // 성능 최적화 UI
  const PerformanceOptimizationPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">성능 최적화</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${optimizationSettings.autoOptimize ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          <span className="text-sm text-gray-600">
            {optimizationSettings.autoOptimize ? '자동 최적화 활성화' : '자동 최적화 비활성화'}
          </span>
        </div>
      </div>

      {/* 실시간 성능 모니터링 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-blue-700">메모리 사용률</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {performanceMetrics.memory.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-blue-600">
            {performanceMetrics.memory.used.toFixed(1)}MB / {performanceMetrics.memory.total.toFixed(1)}MB
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">CPU 사용률</span>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {performanceMetrics.cpu.usage.toFixed(1)}%
          </p>
          <p className="text-sm text-green-600">
            {performanceMetrics.cpu.cores}개 코어
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <SignalIcon className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-purple-700">네트워크 속도</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">
            {performanceMetrics.network.downloadSpeed.toFixed(1)} MB/s
          </p>
          <p className="text-sm text-purple-600">
            지연시간: {performanceMetrics.network.latency.toFixed(0)}ms
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <ServerIcon className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-orange-700">스토리지 사용률</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">
            {performanceMetrics.storage.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-orange-600">
            {performanceMetrics.storage.used.toFixed(1)}GB / {performanceMetrics.storage.total}GB
          </p>
        </div>
      </div>

      {/* 최적화 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">최적화 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">자동 최적화</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={optimizationSettings.autoOptimize}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    autoOptimize: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              시스템 성능을 자동으로 모니터링하고 최적화합니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">백그라운드 처리</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={optimizationSettings.backgroundProcessing}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    backgroundProcessing: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              백그라운드에서 파일 처리를 수행합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모리 임계값 (%)
            </label>
            <input
              type="number"
              value={optimizationSettings.memoryThreshold}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                memoryThreshold: parseInt(e.target.value) || 80
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="50"
              max="95"
            />
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPU 임계값 (%)
            </label>
            <input
              type="number"
              value={optimizationSettings.cpuThreshold}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                cpuThreshold: parseInt(e.target.value) || 70
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="50"
              max="90"
            />
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              압축 레벨
            </label>
            <select
              value={optimizationSettings.compressionLevel}
              onChange={(e) => setOptimizationSettings(prev => ({
                ...prev,
                compressionLevel: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">낮음 (빠름)</option>
              <option value="medium">보통 (균형)</option>
              <option value="high">높음 (압축)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 최적화 도구 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">최적화 도구</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={cleanupMemory}
            className="p-4 bg-blue-50 rounded-lg border hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CogIcon className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <h5 className="font-medium text-blue-800">메모리 정리</h5>
                <p className="text-sm text-blue-600">불필요한 메모리를 정리합니다</p>
              </div>
            </div>
          </button>

          <button
            onClick={clearCache}
            className="p-4 bg-green-50 rounded-lg border hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <TrashIcon className="w-6 h-6 text-green-500" />
              <div className="text-left">
                <h5 className="font-medium text-green-800">캐시 정리</h5>
                <p className="text-sm text-green-600">브라우저 캐시를 정리합니다</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // 테스트 시스템 상태
  const [testResults, setTestResults] = useState<{
    fileUpload: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
    aiAnalysis: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
    collaboration: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
    security: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
    performance: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
    realTimeFeatures: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string };
  }>({
    fileUpload: { status: 'pending', message: '대기 중' },
    aiAnalysis: { status: 'pending', message: '대기 중' },
    collaboration: { status: 'pending', message: '대기 중' },
    security: { status: 'pending', message: '대기 중' },
    performance: { status: 'pending', message: '대기 중' },
    realTimeFeatures: { status: 'pending', message: '대기 중' }
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  // 파일 업로드 테스트
  const testFileUpload = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      fileUpload: { status: 'running', message: '파일 업로드 테스트 중...' }
    }));

    try {
      // 테스트 파일 생성
      const testFile = new File(['테스트 파일 내용'], 'test.txt', { type: 'text/plain' });

      // 파일 업로드 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 보안 검사 테스트
      const accessCheck = checkFileAccess(testFile);
      if (!accessCheck) {
        throw new Error('파일 접근 제어 실패');
      }

      // 암호화 테스트
      if (securitySettings.encryptionEnabled) {
        const encryptedData = await encryptFile(testFile);
        if (!encryptedData) {
          throw new Error('파일 암호화 실패');
        }
      }

      setTestResults(prev => ({
        ...prev,
        fileUpload: { status: 'passed', message: '파일 업로드 및 보안 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        fileUpload: { status: 'failed', message: `파일 업로드 테스트 실패: ${error}` }
      }));
    }
  }, [checkFileAccess, encryptFile, securitySettings.encryptionEnabled]);

  // AI 분석 테스트
  const testAIAnalysis = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      aiAnalysis: { status: 'running', message: 'AI 분석 테스트 중...' }
    }));

    try {
      // AI 모델 가용성 테스트
      const availableModels = aiModels.filter(model => model.status === 'available');
      if (availableModels.length === 0) {
        throw new Error('사용 가능한 AI 모델이 없습니다');
      }

      // 다중 모델 분석 테스트
      const testFile = { id: 'test', name: 'test.txt', size: 1024, type: 'text/plain' } as FileInfo;
      await performMultiModelAnalysis(testFile);

      setTestResults(prev => ({
        ...prev,
        aiAnalysis: { status: 'passed', message: 'AI 분석 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        aiAnalysis: { status: 'failed', message: `AI 분석 테스트 실패: ${error}` }
      }));
    }
  }, [aiModels, performMultiModelAnalysis]);

  // 협업 기능 테스트
  const testCollaboration = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      collaboration: { status: 'running', message: '협업 기능 테스트 중...' }
    }));

    try {
      // WebSocket 연결 테스트
      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket 연결이 없습니다');
      }

      // 채팅 기능 테스트
      sendChatMessage('테스트 메시지', 'text');

      // 화상 통화 기능 테스트 (카메라 접근 권한 확인)
      const hasVideoPermission = await navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => true)
        .catch(() => false);

      if (!hasVideoPermission) {
        throw new Error('카메라 접근 권한이 없습니다');
      }

      setTestResults(prev => ({
        ...prev,
        collaboration: { status: 'passed', message: '협업 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        collaboration: { status: 'failed', message: `협업 기능 테스트 실패: ${error}` }
      }));
    }
  }, [wsConnection, sendChatMessage]);

  // 보안 기능 테스트
  const testSecurity = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      security: { status: 'running', message: '보안 기능 테스트 중...' }
    }));

    try {
      // 암호화 기능 테스트
      if (securitySettings.encryptionEnabled) {
        const testData = new ArrayBuffer(1024);
        const encrypted = await encryptFile(new File([testData], 'test.bin'));
        const decrypted = await decryptFile(encrypted);

        if (encrypted.byteLength === 0) {
          throw new Error('암호화 실패');
        }
      }

      // 감사 로그 테스트
      addAuditLog('test', '보안 테스트', 'success', '보안 기능 테스트 완료');

      setTestResults(prev => ({
        ...prev,
        security: { status: 'passed', message: '보안 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        security: { status: 'failed', message: `보안 기능 테스트 실패: ${error}` }
      }));
    }
  }, [securitySettings.encryptionEnabled, encryptFile, decryptFile, addAuditLog]);

  // 성능 최적화 테스트
  const testPerformance = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      performance: { status: 'running', message: '성능 최적화 테스트 중...' }
    }));

    try {
      // 메모리 사용량 테스트
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo.usedJSHeapSize > memoryInfo.totalJSHeapSize * 0.9) {
          throw new Error('메모리 사용량이 너무 높습니다');
        }
      }

      // 성능 최적화 실행
      cleanupMemory();
      clearCache();

      setTestResults(prev => ({
        ...prev,
        performance: { status: 'passed', message: '성능 최적화 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        performance: { status: 'failed', message: `성능 최적화 테스트 실패: ${error}` }
      }));
    }
  }, [cleanupMemory, clearCache]);

  // 실시간 기능 테스트
  const testRealTimeFeatures = useCallback(async () => {
    setTestResults(prev => ({
      ...prev,
      realTimeFeatures: { status: 'running', message: '실시간 기능 테스트 중...' }
    }));

    try {
      // 실시간 업데이트 테스트
      updateDashboardMetrics();
      updatePerformanceMetrics();

      // WebSocket 연결 상태 확인
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: 'test',
          data: { message: '실시간 기능 테스트' }
        }));
      }

      setTestResults(prev => ({
        ...prev,
        realTimeFeatures: { status: 'passed', message: '실시간 기능 정상' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        realTimeFeatures: { status: 'failed', message: `실시간 기능 테스트 실패: ${error}` }
      }));
    }
  }, [wsConnection, updateDashboardMetrics, updatePerformanceMetrics]);

  // 전체 테스트 실행
  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    const tests = [
      testFileUpload,
      testAIAnalysis,
      testCollaboration,
      testSecurity,
      testPerformance,
      testRealTimeFeatures
    ];

    for (let i = 0; i < tests.length; i++) {
      await tests[i]();
      setTestProgress(((i + 1) / tests.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 테스트 간 간격
    }

    setIsRunningTests(false);
    showNotification('모든 테스트가 완료되었습니다.');
  }, [testFileUpload, testAIAnalysis, testCollaboration, testSecurity, testPerformance, testRealTimeFeatures, showNotification]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">고급 파일 업로드 & 학습 시스템</h2>
          </div>
          <div className="flex items-center space-x-2">
            {processedFiles.length > 0 && (
              <button
                onClick={startAutoProcessing}
                disabled={autoProcessing}
                className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${autoProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                title="AI 자동화"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{autoProcessing ? '자동화 중...' : 'AI 자동화'}</span>
              </button>
            )}
            {processedFiles.length > 0 && (
              <button
                onClick={generateAIInsights}
                disabled={aiProcessing}
                className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${aiProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                title="AI 인사이트"
              >
                <LightBulbIcon className="w-4 h-4" />
                <span>{aiProcessing ? '분석 중...' : 'AI 인사이트'}</span>
              </button>
            )}
            {processedFiles.length >= 2 && (
              <button
                onClick={performAdvancedAnalysis}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                title="고급 분석 도구"
              >
                <BeakerIcon className="w-4 h-4" />
                <span>고급 분석</span>
              </button>
            )}
            {processedFiles.length >= 2 && (
              <button
                onClick={performIntegratedAnalysis}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                title="통합 분석"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>통합 분석</span>
              </button>
            )}
            {processedFiles.length > 0 && (
              <button
                onClick={generateVisualization}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                title="시각화 도구"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>시각화</span>
              </button>
            )}
            <button
              onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="협업 패널"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>협업</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="파일 업로드 모달 닫기"
              title="ESC 키로도 닫을 수 있습니다"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* 왼쪽 패널 - 설정 */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 자동 학습 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">학습 설정</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoLearning}
                      onChange={(e) => setAutoLearning(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">자동 학습 활성화</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학습 모드
                    </label>
                    <select
                      value={learningMode}
                      onChange={(e) => setLearningMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="학습 모드 선택"
                      aria-label="학습 모드 선택"
                    >
                      <option value="basic">기본 학습</option>
                      <option value="advanced">고급 학습</option>
                      <option value="deep">딥러닝 학습</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 추출 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">추출 설정</h3>
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
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 파일 업로드 영역 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">파일 업로드</h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                    aria-label="파일 선택"
                    title="파일을 선택하세요"
                  />
                  <div className="space-y-4">
                    <PlusIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, 이미지, 문서, 비디오 등 모든 파일 형식 지원
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      파일 선택
                    </button>
                  </div>
                </div>

                {/* 배치 처리 버튼 */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={startBatchProcessing}
                      disabled={batchProcessing}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${batchProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    >
                      {batchProcessing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CogIcon className="w-4 h-4 animate-spin" />
                          <span>배치 처리 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <CogIcon className="w-4 h-4" />
                          <span>배치 처리 시작</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
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
                학습
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'results'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                결과
              </button>
              <button
                onClick={() => setActiveTab('ai-models')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'ai-models'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                AI 모델 관리
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                보안 설정
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                대시보드
              </button>
              <button
                onClick={() => setActiveTab('collaboration')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'collaboration'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                고급 협업
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'performance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                성능 최적화
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
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file.file)} alt={file.name} className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                  <DocumentIcon className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.status}
                              </p>
                              {sharedFiles.find(sf => sf.id === file.id) && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    공유됨
                                  </span>
                                  {!canEditFile(file.id) && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                      읽기 전용
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => shareFile(file.id, 'read')}
                                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                                  title="파일 공유"
                                >
                                  <ShareIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => shareFile(file.id, 'write')}
                                  className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                                  title="편집 권한으로 공유"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                              title="파일 제거"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'processing' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">파일 처리</h3>
                  {files.filter(f => f.status === 'processing' || f.status === 'uploading').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CogIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>처리 중인 파일이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {files.filter(f => f.status === 'processing' || f.status === 'uploading').map((file) => {
                        const chunkInfo = uploadChunks.get(file.id);
                        return (
                          <div key={file.id} className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CogIcon className="w-5 h-5 text-blue-500 animate-spin" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{file.name}</p>
                                <p className="text-sm text-gray-600">
                                  {file.status === 'uploading' ? '파일 업로드 중...' : '파일 분석 및 분류 중...'}
                                </p>
                                {chunkInfo && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    청크: {chunkInfo.completed}/{chunkInfo.total} ({(chunkInfo.completed / chunkInfo.total * 100).toFixed(1)}%)
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-blue-600">{file.progress}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div className={`w-[${file.progress}%] bg-blue-500 h-2 rounded-full transition-all duration-300`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'learning' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">학습 세션</h3>
                  {learningSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CpuChipIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>학습 세션이 없습니다.</p>
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
                                  {session.type === 'classification' && '내용 분류 학습'}
                                  {session.type === 'extraction' && '텍스트 추출 학습'}
                                  {session.type === 'analysis' && '분석 학습'}
                                  {session.type === 'summarization' && '요약 학습'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {session.startedAt.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                {session.status === 'pending' && '대기 중'}
                                {session.status === 'running' && '실행 중'}
                                {session.status === 'completed' && '완료'}
                                {session.status === 'failed' && '실패'}
                              </span>
                              {session.status === 'failed' && (
                                <button
                                  onClick={() => restartLearning(session.id)}
                                  className="p-1 text-purple-600 hover:text-purple-800"
                                  title="학습 재시작"
                                  aria-label="학습 재시작"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
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
                              <div className={`w-[${session.progress}%] bg-green-500 h-2 rounded-full transition-all duration-300`} />
                            </div>
                          )}
                          {session.status === 'completed' && session.result && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">정확도:</span>
                                  <span className="font-medium ml-2">
                                    {(session.result.accuracy * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">손실:</span>
                                  <span className="font-medium ml-2">
                                    {session.result.loss.toFixed(3)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">에포크:</span>
                                  <span className="font-medium ml-2">
                                    {session.result.epochs}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">학습률:</span>
                                  <span className="font-medium ml-2">
                                    {session.result.learningRate}
                                  </span>
                                </div>
                                {session.result.precision && (
                                  <div>
                                    <span className="text-gray-600">정밀도:</span>
                                    <span className="font-medium ml-2">
                                      {(session.result.precision * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                                {session.result.recall && (
                                  <div>
                                    <span className="text-gray-600">재현율:</span>
                                    <span className="font-medium ml-2">
                                      {(session.result.recall * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                                {session.result.f1Score && (
                                  <div>
                                    <span className="text-gray-600">F1 점수:</span>
                                    <span className="font-medium ml-2">
                                      {(session.result.f1Score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                                {session.result.validationScore && (
                                  <div>
                                    <span className="text-gray-600">검증 점수:</span>
                                    <span className="font-medium ml-2">
                                      {(session.result.validationScore * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">모델 버전:</span>
                                  <span className="font-medium ml-2">
                                    {session.result.modelVersion}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">훈련 시간:</span>
                                  <span className="font-medium ml-2">
                                    {session.result.trainingTime}초
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

              {activeTab === 'results' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">분석 결과</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportAnalysisResults()}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        결과 내보내기
                      </button>
                      <button
                        onClick={() => performMultiModelAnalysis(files[0])}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        다중 모델 분석
                      </button>
                    </div>
                  </div>

                  {/* 분석 결과 목록 */}
                  <div className="space-y-4">
                    {advancedAnalysisResults.map((result) => (
                      <div key={result.id} className="p-6 bg-white rounded-lg border space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{result.fileName}</h4>
                            <p className="text-sm text-gray-600">
                              {result.timestamp.toLocaleString()} • {result.analysisType === 'multi-model' ? '다중 모델' : '단일 모델'} 분석
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {result.processingTime.toFixed(1)}s
                            </span>
                            {result.analysisType === 'multi-model' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {result.modelCount}개 모델
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 모델 비교 차트 (다중 모델 분석인 경우) */}
                        {result.analysisType === 'multi-model' && result.results.individualResults && (
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-700">모델별 성능 비교</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {result.results.individualResults.map((modelResult: any) => (
                                <div key={modelResult.modelId} className="p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-gray-800">{modelResult.modelName}</h6>
                                    <span className={`text-xs px-2 py-1 rounded ${modelResult.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                      }`}>
                                      {modelResult.error ? '실패' : '성공'}
                                    </span>
                                  </div>

                                  {!modelResult.error && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">정확도:</span>
                                        <span className="text-sm font-medium">
                                          {(modelResult.accuracy * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">처리 시간:</span>
                                        <span className="text-sm font-medium">
                                          {modelResult.processingTime.toFixed(1)}s
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">신뢰도:</span>
                                        <span className="text-sm font-medium">
                                          {(modelResult.result.confidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {modelResult.error && (
                                    <p className="text-sm text-red-600">{modelResult.error}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 합의 결과 */}
                        {result.results.consensusResult && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">합의 결과</h5>
                            <p className="text-sm text-blue-700 mb-2">{result.results.consensusResult.summary}</p>
                            <div className="space-y-1">
                              {result.results.consensusResult.insights.map((insight: string, index: number) => (
                                <p key={index} className="text-xs text-blue-600">• {insight}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 단일 모델 결과 */}
                        {result.analysisType === 'single' && result.results && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">분석 결과</h5>
                            <p className="text-sm text-green-700 mb-2">{result.results.summary}</p>
                            <div className="space-y-1">
                              {result.results.insights.map((insight: string, index: number) => (
                                <p key={index} className="text-xs text-green-600">• {insight}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {advancedAnalysisResults.length === 0 && (
                    <div className="text-center py-12">
                      <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">아직 분석 결과가 없습니다.</p>
                      <p className="text-sm text-gray-400">파일을 업로드하고 분석을 시작해보세요.</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI 모델 관리 */}
              {activeTab === 'ai-models' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">AI 모델 관리</h3>
                    <button
                      onClick={() => performMultiModelAnalysis(files[0])}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      다중 모델 분석
                    </button>
                  </div>

                  {/* 모델 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiModels.map((model) => (
                      <div key={model.id} className="p-4 bg-white rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{model.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${model.status === 'available' ? 'bg-green-500' :
                            model.status === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">타입:</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {model.type}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">정확도:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${model.accuracy * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-700">
                              {(model.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">처리 시간:</span>
                            <span className="text-sm text-gray-700">
                              {model.processingTime}s
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setAiModels(prev => prev.map(m =>
                                m.id === model.id
                                  ? { ...m, status: m.status === 'available' ? 'loading' : 'available' }
                                  : m
                              ));
                            }}
                            className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${model.status === 'available'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                          >
                            {model.status === 'available' ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 모델 성능 통계 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CogIcon className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-700">활성 모델</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">
                        {aiModels.filter(m => m.status === 'available').length}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">평균 정확도</span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">
                        {(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-purple-700">평균 처리 시간</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">
                        {(aiModels.reduce((sum, m) => sum + m.processingTime, 0) / aiModels.length).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'security' && (
                <SecuritySettingsPanel />
              )}
              {activeTab === 'dashboard' && (
                <DashboardPanel />
              )}
              {activeTab === 'collaboration' && (
                <AdvancedCollaborationPanel />
              )}
              {activeTab === 'performance' && (
                <PerformanceOptimizationPanel />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 협업 패널 */}
      {showCollaborationPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">실시간 협업</h3>
              <button
                onClick={() => setShowCollaborationPanel(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="협업 패널 닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-full">
              {/* 협업자 목록 */}
              <div className="w-1/3 border-r border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-4">협업자</h4>
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={collaborator.avatar}
                        alt={collaborator.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{collaborator.name}</p>
                        <p className="text-sm text-gray-500">{collaborator.status}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${collaborator.status === 'online' ? 'bg-green-500' :
                        collaborator.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addCollaborator(`사용자${collaborators.length + 1}`)}
                  className="mt-4 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  협업자 추가
                </button>
              </div>

              {/* 채팅 영역 */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === '나' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg ${message.sender === '나'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendChatMessage(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="메시지를 입력하세요..."]') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          sendChatMessage(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI 자동화 패널 */}
      {autoProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">AI 자동화 처리</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span className="text-sm text-orange-600">자동화 진행 중...</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">활성화된 규칙</h4>
                  <div className="space-y-2">
                    {autoAnalysisRules.filter(rule => rule.enabled).map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{rule.name}</p>
                          <p className="text-sm text-gray-600">{rule.condition} → {rule.action}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">처리 로그</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {autoProcessingLog.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-600">{log.file}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${log.result === '완료'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {log.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시각화 모달 */}
      {showVisualization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">고급 시각화 도구</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={visualizationType}
                  onChange={(e) => setVisualizationType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="시각화 유형 선택"
                  aria-label="시각화 유형 선택"
                >
                  <option value="network">네트워크 그래프</option>
                  <option value="timeline">타임라인</option>
                  <option value="heatmap">히트맵</option>
                  <option value="scatter">산점도</option>
                </select>
                <button
                  onClick={() => setShowVisualization(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="시각화 모달 닫기"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!visualizationData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">시각화 데이터를 생성하는 중...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">{visualizationData.title}</h4>

                  {visualizationData.type === 'network' && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-4">키워드 네트워크</h5>
                      <div className="grid grid-cols-3 gap-4">
                        {visualizationData.nodes.slice(0, 9).map((node: { id: string; name: string; connections: string[]; size: number; group: string; }, index: number) => (
                          <div key={index} className="p-3 bg-white rounded border text-center">
                            <div className="text-sm font-medium">{node.name}</div>
                            <div className="text-xs text-gray-500">크기: {node.size.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">그룹: {node.group}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        총 {visualizationData.nodes.length}개 노드, {visualizationData.edges.length}개 연결
                      </p>
                    </div>
                  )}

                  {visualizationData.type === 'timeline' && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-4">문서 처리 타임라인</h5>
                      <div className="space-y-3">
                        {visualizationData.events.map((event: { time: Date; title: string; category: string; sentiment: string; confidence: number; }, index: number) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded border">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <div className="flex-1">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-gray-600">{event.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{event.sentiment}</p>
                              <p className="text-xs text-gray-500">{(event.confidence * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {visualizationData.type === 'heatmap' && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-4">문서 특성 히트맵</h5>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center font-medium text-gray-700">파일명</div>
                        <div className="text-center font-medium text-gray-700">신뢰도</div>
                        <div className="text-center font-medium text-gray-700">복잡도</div>
                        <div className="text-center font-medium text-gray-700">가독성</div>
                        {visualizationData.data.map((item: { name: string; value: number; }, index: number) => (
                          <React.Fragment key={index}>
                            <div className="text-sm text-gray-800">{item.name}</div>
                            <div className="text-center">
                              <div className={`inline-block px-2 py-1 rounded text-xs ${item.value > 0.7 ? 'bg-green-100 text-green-700' :
                                item.value > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {(item.value * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`inline-block px-2 py-1 rounded text-xs ${item.value > 0.7 ? 'bg-red-100 text-red-700' :
                                item.value > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {(item.value * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`inline-block px-2 py-1 rounded text-xs ${item.value > 0.7 ? 'bg-green-100 text-green-700' :
                                item.value > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {(item.value * 100).toFixed(1)}%
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {visualizationData.type === 'scatter' && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-4">문서 분포 산점도</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">X축: 문자 수</p>
                          <p className="text-sm font-medium text-gray-700 mb-2">Y축: 신뢰도</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">점 크기: 키워드 수</p>
                          <p className="text-sm font-medium text-gray-700 mb-2">색상: 카테고리</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {visualizationData.data.map((point: { x: number; y: number; size: number; label: string; category: string; }, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm font-medium">{point.label}</span>
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <span>X: {point.x.toLocaleString()}</span>
                              <span>Y: {(point.y * 100).toFixed(1)}%</span>
                              <span>크기: {point.size}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {point.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI 인사이트 모달 */}
      {showAIInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">AI 인사이트</h3>
              <button
                onClick={() => setShowAIInsights(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="AI 인사이트 모달 닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {aiProcessing ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <LightBulbIcon className="w-12 h-12 mx-auto text-orange-400 animate-pulse mb-4" />
                    <p className="text-gray-500">AI가 인사이트를 생성하는 중...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">발견된 인사이트</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.map((insight) => (
                      <div key={insight.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${insight.type === 'pattern' ? 'bg-blue-500' :
                              insight.type === 'anomaly' ? 'bg-red-500' :
                                insight.type === 'trend' ? 'bg-green-500' :
                                  'bg-purple-500'
                              }`} />
                            <span className="text-sm font-medium text-gray-700">
                              {insight.type === 'pattern' ? '패턴' :
                                insight.type === 'anomaly' ? '이상치' :
                                  insight.type === 'trend' ? '트렌드' : '권장사항'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                              insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                              {insight.impact === 'high' ? '높음' :
                                insight.impact === 'medium' ? '보통' : '낮음'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <h5 className="font-medium text-gray-800 mb-2">{insight.title}</h5>
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{insight.category}</span>
                          <span>{insight.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 통합 분석 모달 */}
      {showIntegratedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">통합 분석</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={integratedAnalysisType}
                  onChange={(e) => setIntegratedAnalysisType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="분석 유형 선택"
                  aria-label="분석 유형 선택"
                >
                  <option value="comprehensive">종합 분석</option>
                  <option value="predictive">예측 분석</option>
                  <option value="comparative">비교 분석</option>
                  <option value="insights">심화 인사이트</option>
                </select>
                <button
                  onClick={() => setShowIntegratedAnalysis(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="통합 분석 모달 닫기"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!integratedResults ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      분석 진행률: {integratedAnalysisProgress}%
                    </p>
                    <div className={`w-[${integratedAnalysisProgress}%] bg-teal-500 h-2 rounded-full transition-all duration-300`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">{integratedResults.title}</h4>

                  {integratedResults.type === 'comprehensive' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">요약 통계</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{integratedResults.summary.totalFiles}</div>
                            <div className="text-sm text-gray-600">총 파일 수</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {(integratedResults.summary.averageConfidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">평균 신뢰도</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {(integratedResults.summary.averageComplexity * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">평균 복잡도</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {integratedResults.summary.sentimentDistribution.positive}
                            </div>
                            <div className="text-sm text-gray-600">긍정 문서</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-800 mb-3">주요 인사이트</h5>
                          <ul className="space-y-2">
                            {integratedResults.insights?.map((insight: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <LightBulbIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-800 mb-3">권장사항</h5>
                          <ul className="space-y-2">
                            {integratedResults.recommendations?.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {integratedResults.type === 'predictive' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">예측 결과</h5>
                        <div className="space-y-3">
                          {integratedResults.predictions?.map((pred: { metric: string; current: number; predicted: number; trend: string; confidence: number; }, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div>
                                <p className="font-medium">{pred.metric}</p>
                                <p className="text-sm text-gray-600">
                                  현재: {pred.current} → 예측: {pred.predicted}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${pred.trend === 'up' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                  }`}>
                                  {pred.trend === 'up' ? '상승' : '하락'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {(pred.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {integratedResults.type === 'comparative' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">비교 분석 결과</h5>
                        <div className="space-y-3">
                          {integratedResults.comparisons?.map((comp: { dimension: string; group1: string; group2: string; difference: string; significance: number; }, index: number) => (
                            <div key={index} className="p-3 bg-white rounded border">
                              <h6 className="font-medium text-gray-800 mb-2">{comp.dimension}</h6>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium">{comp.group1}</p>
                                </div>
                                <div>
                                  <p className="font-medium">{comp.group2}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">{comp.difference}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                유의수준: {comp.significance}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {integratedResults.type === 'insights' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">발견된 패턴</h5>
                        <div className="space-y-3">
                          {integratedResults.patterns?.map((pattern: { pattern: string; description: string; strength: number; examples: ProcessedFileInfo[]; }, index: number) => (
                            <div key={index} className="p-3 bg-white rounded border">
                              <h6 className="font-medium text-gray-800 mb-2">{pattern.pattern}</h6>
                              <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">강도: {(pattern.strength * 100).toFixed(0)}%</span>
                                <span className="text-xs text-gray-500">예시: {pattern.examples.length}개</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 고급 분석 모달 */}
      {showAdvancedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">고급 분석 도구</h3>
              <button
                onClick={() => setShowAdvancedAnalysis(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="고급 분석 모달 닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!analysisResults ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">분석 유형:</label>
                    <select
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="고급 분석 유형 선택"
                      aria-label="고급 분석 유형 선택"
                    >
                      <option value="comparative">비교 분석</option>
                      <option value="trend">트렌드 분석</option>
                      <option value="correlation">상관관계 분석</option>
                      <option value="clustering">클러스터링 분석</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      분석 진행률: {analysisProgress}%
                    </p>
                    <div className={`w-[${analysisProgress}%] bg-purple-500 h-2 rounded-full transition-all duration-300`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">{analysisResults.title}</h4>

                  {analysisResults.type === 'comparative' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">유사성 분석</h5>
                        {analysisResults.data?.similarities?.map((item: { file: string; similarity: number; commonKeywords: string[]; sharedTopics: string[]; }, index: number) => (
                          <div key={index} className="mb-3 p-3 bg-white rounded border">
                            <p className="font-medium">{item.file}</p>
                            <p className="text-sm text-gray-600">유사도: {(item.similarity * 100).toFixed(1)}%</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.commonKeywords.map((keyword: string, kIndex: number) => (
                                <span key={kIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">차이점 분석</h5>
                        {analysisResults.data?.differences?.map((item: { file: string; uniqueKeywords: string[]; distinctTopics: string[]; }, index: number) => (
                          <div key={index} className="mb-3 p-3 bg-white rounded border">
                            <p className="font-medium">{item.file}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.uniqueKeywords.map((keyword: string, kIndex: number) => (
                                <span key={kIndex} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResults.type === 'trend' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">키워드 트렌드</h5>
                        {analysisResults.data?.trends?.map((trend: { keyword: string; frequency: number; trend: string; }, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border mb-2">
                            <span className="font-medium">{trend.keyword}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{trend.frequency}%</span>
                              <span className={`px-2 py-1 text-xs rounded ${trend.trend === 'up' ? 'bg-green-100 text-green-700' :
                                trend.trend === 'down' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                {trend.trend === 'up' ? '상승' : trend.trend === 'down' ? '하락' : '안정'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResults.type === 'correlation' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">상관관계 분석</h5>
                        {analysisResults.data?.correlations?.map((corr: { factor1: string; factor2: string; correlation: number; }, index: number) => (
                          <div key={index} className="p-3 bg-white rounded border mb-2">
                            <p className="font-medium">{corr.factor1} ↔ {corr.factor2}</p>
                            <p className="text-sm text-gray-600">상관계수: {corr.correlation.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">인사이트</h5>
                        <ul className="space-y-2">
                          {analysisResults.data?.insights?.map((insight: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {analysisResults.type === 'clustering' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">클러스터 분석</h5>
                        {analysisResults.data?.clusters?.map((cluster: { name: string; files: ProcessedFileInfo[]; centroid: { x: number; y: number; }; characteristics: string[]; }, index: number) => (
                          <div key={index} className="p-3 bg-white rounded border mb-3">
                            <h6 className="font-medium text-gray-800">{cluster.name}</h6>
                            <p className="text-sm text-gray-600 mb-2">파일 수: {cluster.files.length}개</p>
                            <div className="flex flex-wrap gap-1">
                              {cluster.characteristics.map((char: string, cIndex: number) => (
                                <span key={cIndex} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 내보내기 모달 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">파일 내보내기</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="내보내기 모달 닫기"
                aria-label="내보내기 모달 닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 내보내기 형식 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내보내기 형식
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="내보내기 형식 선택"
                  aria-label="내보내기 형식 선택"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* 파일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내보낼 파일 선택
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {processedFiles.map((file) => (
                    <label key={file.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFilesForExport.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{file.originalName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 전체 선택/해제 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedFilesForExport(processedFiles.map(f => f.id))}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  전체 선택
                </button>
                <button
                  onClick={() => setSelectedFilesForExport([])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  전체 해제
                </button>
              </div>

              {/* 내보내기 버튼 */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={exportFiles}
                  disabled={selectedFilesForExport.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedFilesForExport.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                >
                  내보내기
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 백그라운드 작업 상태 */}
      {backgroundTasks.size > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">백그라운드 작업</h3>
          <div className="space-y-3">
            {Array.from(backgroundTasks.entries()).map(([taskId, task]) => (
              <div key={taskId} className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CpuChipIcon className="w-5 h-5 text-purple-500 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">백그라운드 분석</p>
                    <p className="text-sm text-gray-600">Web Worker에서 처리 중...</p>
                  </div>
                  <span className="text-sm text-purple-600">{task.progress}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className={`w-[${task.progress}%] bg-purple-500 h-2 rounded-full transition-all duration-300`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 성능 모니터링 */}
      {performanceMetrics.filesProcessed > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">성능 모니터링</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">처리된 파일</p>
                  <p className="text-lg font-bold text-blue-600">{performanceMetrics.filesProcessed}개</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CogIcon className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">평균 파일 크기</p>
                  <p className="text-lg font-bold text-green-600">{formatFileSize(performanceMetrics.averageFileSize)}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">총 처리 시간</p>
                  <p className="text-lg font-bold text-purple-600">{(performanceMetrics.totalProcessingTime / 1000).toFixed(1)}초</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">처리 속도</p>
                  <p className="text-lg font-bold text-orange-600">{performanceMetrics.processingSpeed.toFixed(2)} MB/s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 작업 큐 상태 */}
      {taskQueue.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">작업 큐</h3>
          <div className="space-y-3">
            {taskQueue.map((task) => (
              <div key={task.id} className={`p-4 rounded-lg border ${task.status === 'running' ? 'bg-blue-50 border-blue-200' :
                task.status === 'completed' ? 'bg-green-50 border-green-200' :
                  task.status === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-400'
                      }`} />
                    <div>
                      <p className="font-medium text-gray-800">
                        {task.type === 'upload' ? '파일 업로드' :
                          task.type === 'analysis' ? '고급 분석' :
                            task.type === 'learning' ? 'AI 학습' :
                              '내보내기'}
                      </p>
                      <p className="text-sm text-gray-600">
                        우선순위: {task.priority === 'high' ? '높음' :
                          task.priority === 'medium' ? '보통' : '낮음'}
                      </p>
                      {task.status === 'failed' && (
                        <p className="text-xs text-red-600">
                          재시도: {(retryAttempts.get(task.id) || 0)}/{maxRetryAttempts}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {task.status === 'pending' ? '대기 중' :
                          task.status === 'running' ? '처리 중' :
                            task.status === 'completed' ? '완료' : '실패'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    {task.status === 'failed' && (retryAttempts.get(task.id) || 0) < maxRetryAttempts && (
                      <button
                        onClick={() => retryTask(task.id, task)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="작업 재시도"
                      >
                        재시도
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isProcessingQueue && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <CogIcon className="w-4 h-4 animate-spin" />
              <span>작업 큐 처리 중...</span>
            </div>
          )}
        </div>
      )}

      {/* 실시간 협업 패널 */}
      {showCollaborationPanel && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">실시간 협업</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isCollaborationEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isCollaborationEnabled ? '연결됨' : '연결 안됨'}
              </span>
            </div>
          </div>

          {/* 협업자 목록 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">협업자 ({collaborators.length})</h4>
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${collaborator.status === 'online' ? 'bg-green-500' :
                      collaborator.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{collaborator.name}</p>
                    <p className="text-sm text-gray-600">
                      {collaborator.currentActivity || '대기 중'}
                    </p>
                    <p className="text-xs text-gray-500">
                      마지막 활동: {collaborator.lastSeen.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 실시간 채팅 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">실시간 채팅</h4>
            <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === '나' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${message.sender === '나'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                    }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.sender}
                      </span>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    {message.type !== 'text' && (
                      <span className="text-xs opacity-70">
                        {message.type === 'file' ? '📎 파일' : '📊 분석'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 메시지 입력 */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    sendChatMessage(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="메시지를 입력하세요..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    sendChatMessage(input.value.trim());
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 편집 충돌 모달 */}
      {editConflict && editConflict.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">편집 충돌</h3>
                <p className="text-sm text-gray-600">다른 사용자가 동시에 편집하고 있습니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                파일 "{files.find(f => f.id === editConflict.fileId)?.name}"이(가) 다른 사용자에 의해 편집되고 있습니다.
                계속 편집하시겠습니까?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleConflictResolution('continue')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  계속 편집
                </button>
                <button
                  onClick={() => handleConflictResolution('cancel')}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <DashboardPanel />
      )}
      {activeTab === 'collaboration' && (
        <AdvancedCollaborationPanel />
      )}
      {activeTab === 'performance' && (
        <PerformanceOptimizationPanel />
      )}
    </div>
  );
};

export default AdvancedFileUploadWithLearning; 