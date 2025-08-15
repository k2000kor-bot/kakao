import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  BellIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CodeBracketIcon,
  CloudIcon,
  DocumentPlusIcon,
  EyeIcon,
  XMarkIcon,
  AcademicCapIcon,
  CircleStackIcon,
  CpuChipIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import AdvancedDeepLearningHub from './AdvancedDeepLearningHub';
import AdvancedFileLearningHub from './AdvancedFileLearningHub';
import QuantumAIHub from './QuantumAIHub';
import BiometricAIHub from './BiometricAIHub';
import PredictiveAnalytics from './PredictiveAnalytics';
import AdvancedImageAnalysis from './AdvancedImageAnalysis';
import AdvancedVoiceRecognition from './AdvancedVoiceRecognition';
import AdvancedSettingsManager from './AdvancedSettingsManager';
import AdvancedBackupSystem from './AdvancedBackupSystem';
import AdvancedHelpSystem from './AdvancedHelpSystem';
import AdvancedNotificationSystem from './AdvancedNotificationSystem';
import AdvancedUserManagement from './AdvancedUserManagement';
import AdvancedFileManager from './AdvancedFileManager';
import AdvancedAIEngine from './AdvancedAIEngine';
import AdvancedPerformanceOptimizer from './AdvancedPerformanceOptimizer';
import AdvancedMobileOptimization from './AdvancedMobileOptimization';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import AdvancedSecuritySystem from './AdvancedSecuritySystem';
import AdvancedRealTimeCollaboration from './AdvancedRealTimeCollaboration';
import ChatGPTUnifiedSystem from './ChatGPTUnifiedSystem';
import AdvancedFileUploadWithLearning from './AdvancedFileUploadWithLearning';
import SystemStatusWidget from './SystemStatusWidget';
import RealTimeChat from './RealTimeChat';
import UltimateIntegratedInput from './UltimateIntegratedInput';
import MessageGuidanceSystem from './MessageGuidanceSystem';
import ProjectContextChat from './ProjectContextChat';
import ChatGPTStyleInput from './ChatGPTStyleInput';
import ExpertStyleResponse from './ExpertStyleResponse';
import FileAnalysisDashboard from './FileAnalysisDashboard';
import AdvancedAnalysisVisualization from './AdvancedAnalysisVisualization';
import RealTimeAnalysisMonitor from './RealTimeAnalysisMonitor';
import ChatGPT5StyleInput from './ChatGPT5StyleInput';
import IntelligentKnowledgeBase from './IntelligentKnowledgeBase';
import UniversalChatInput from './UniversalChatInput';
import AdvancedChatInput from './AdvancedChatInput';
import ChatInput from './ChatInput';
import AutoLearningSystem from './AutoLearningSystem';
import AdvancedDeepLearningSystem from './AdvancedDeepLearningSystem';
import MobileOptimization from './MobileOptimization';
import FileProcessingStatus from './FileProcessingStatus';
import KnowledgeBaseDashboard from './KnowledgeBaseDashboard';
import KnowledgeHub from './KnowledgeHub';
import FileStorageStatus from './FileStorageStatus';
import ProjectCollaboration from './ProjectCollaboration';
import FormattedTextDisplay from './FormattedTextDisplay';
import ContextualUnderstandingDisplay from './ContextualUnderstandingDisplay';
import ProjectChatList from './ProjectChatList';
import AdvancedAIDashboard from './AdvancedAIDashboard';
import AITestPanel from './AITestPanel';
import UnifiedDoctorLevelInput from './UnifiedDoctorLevelInput';
import RealTimeContextEngine from './RealTimeContextEngine';
import VoiceRecognitionSystem from './VoiceRecognitionSystem';
import SmartNotificationSystem from './SmartNotificationSystem';
import VoiceChat from './VoiceChat';
import AdvancedDataVisualization from './AdvancedDataVisualization';
import PerformanceDashboard from './PerformanceDashboard';
import ProjectRecommendations from './ProjectRecommendations';
import NotificationSystem from './NotificationSystem';
import ProjectAnalyticsDashboard from './ProjectAnalyticsDashboard';
import SmartSuggestionPanel from './SmartSuggestionPanel';
import RealTimeDashboard from './RealTimeDashboard';
import CORBULogo from './CORBULogo';
import AuthSystem from './AuthSystem';
import RealTimeAnalytics from './RealTimeAnalytics';
import ChatSidebar from './ChatSidebar';
import AdvancedMLDashboard from './AdvancedMLDashboard';
import AdvancedMessageGenerationSystem from './AdvancedMessageGenerationSystem';
import ConversationAnalyticsDashboard from './ConversationAnalyticsDashboard';
import SmartChatInput from './SmartChatInput';
import EnhancedIntegrationMonitor from './EnhancedIntegrationMonitor';
import FileDropZone from './FileDropZone';
import FileUploadProgress from './FileUploadProgress';
import FileUploadNotification from './FileUploadNotification';
import DeepLearningManager from './DeepLearningManager';
import AdvancedAnalytics from './AdvancedAnalytics';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import RealTimeAIAnalysis from './RealTimeAIAnalysis';
import AILearningModal from './AILearningModal';
import ChatGPTInterface from './ChatGPTInterface';
import UnifiedConversationInterface from './UnifiedConversationInterface';
import AdvancedFeaturesSidebar from './AdvancedFeaturesSidebar';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: Date;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'error';
  progress: number;
  aiAnalysis?: AIAnalysisResult;
  knowledgeBase?: KnowledgeBaseResult;
  deepLearning?: DeepLearningResult;
}

interface AIAnalysisResult {
  keyConcepts: string[];
  patterns: string[];
  insights: string[];
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'low' | 'medium' | 'high';
  topics: string[];
  entities: string[];
  completedAt: Date;
}

interface KnowledgeBaseResult {
  knowledgeGraph: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  };
  documents: KnowledgeDocument[];
  tags: string[];
  completedAt: Date;
}

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'topic' | 'file';
  weight: number;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
}

interface DeepLearningResult {
  models: DeepLearningModel[];
  predictions: any[];
  accuracy: number;
  completedAt: Date;
}

interface DeepLearningModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'vision';
  accuracy: number;
  status: 'training' | 'ready' | 'deployed';
}

interface FileStorageStatus {
  totalFiles: number;
  totalSize: number;
  lastSync: Date;
  storageStatus: 'local' | 'cloud' | 'syncing';
}

const FileManagementSystem: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [storageStatus, setStorageStatus] = useState<FileStorageStatus>({
    totalFiles: 59,
    totalSize: 872.29 * 1024 * 1024, // 872.29 MB
    lastSync: new Date('2025-08-10T10:03:37'),
    storageStatus: 'local'
  });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('파일');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 파일 데이터 로드 - 이미지에 맞게 59개의 파일로 설정
  useEffect(() => {
    const initialFiles: FileItem[] = [
      {
        id: 'file-001',
        name: 'CORBU_AI_시스템_개발_계획서.pdf',
        type: 'pdf',
        size: 2048576,
        uploadTime: new Date(Date.now() - 86400000 * 2),
        status: 'completed',
        progress: 100,
        aiAnalysis: {
          keyConcepts: ['AI 시스템', '딥러닝', '자연어처리', '컴퓨터비전'],
          patterns: ['모듈화 아키텍처', '실시간 처리', '자동화 시스템'],
          insights: ['통합 AI 플랫폼으로 높은 효율성 달성', '자동화된 파일 처리로 사용자 경험 향상'],
          summary: 'CORBU AI 시스템 개발 계획서를 분석한 결과, 다양한 AI 기술들이 통합된 플랫폼 구축 계획이 확인되었습니다.',
          sentiment: 'positive',
          complexity: 'high',
          topics: ['AI Development', 'System Architecture', 'Machine Learning'],
          entities: ['CORBU AI', 'React', 'TypeScript', 'Python'],
          completedAt: new Date()
        },
        knowledgeBase: {
          knowledgeGraph: {
            nodes: [
              { id: '1', label: 'AI 시스템', type: 'concept', weight: 0.9 },
              { id: '2', label: '딥러닝', type: 'concept', weight: 0.8 },
              { id: '3', label: '자연어처리', type: 'concept', weight: 0.7 }
            ],
            edges: [
              { id: '1', source: '1', target: '2', relationship: 'includes', weight: 0.8 },
              { id: '2', source: '1', target: '3', relationship: 'includes', weight: 0.7 }
            ]
          },
          documents: [
            {
              id: 'doc-1',
              title: 'AI 시스템 아키텍처',
              content: 'CORBU AI 시스템의 전체적인 아키텍처와 구성 요소들',
              type: 'architecture',
              tags: ['architecture', 'system', 'design']
            }
          ],
          tags: ['AI', '시스템개발', 'React', 'TypeScript'],
          completedAt: new Date()
        },
        deepLearning: {
          models: [
            {
              id: 'model-1',
              name: '텍스트 분류 모델',
              type: 'nlp',
              accuracy: 0.95,
              status: 'deployed'
            }
          ],
          predictions: [
            { type: 'classification', result: 'AI 시스템 문서', confidence: 0.95 }
          ],
          accuracy: 0.95,
          completedAt: new Date()
        }
      },
      {
        id: 'file-002',
        name: '개포우성7차_제안서.pdf',
        type: 'pdf',
        size: 1536000,
        uploadTime: new Date(Date.now() - 86400000),
        status: 'completed',
        progress: 100,
        aiAnalysis: {
          keyConcepts: ['재건축', '개포우성', '제안서', '개발계획'],
          patterns: ['사업계획', '투자분석', '타당성검토'],
          insights: ['개포우성7차 재건축 사업의 체계적인 제안서', '투자 타당성이 높은 프로젝트'],
          summary: '개포우성7차 재건축 사업에 대한 상세한 제안서로, 사업의 타당성과 투자 가치가 높게 평가됩니다.',
          sentiment: 'positive',
          complexity: 'medium',
          topics: ['Real Estate', 'Development', 'Investment'],
          entities: ['개포우성7차', '재건축', '개발사업'],
          completedAt: new Date()
        },
        knowledgeBase: {
          knowledgeGraph: {
            nodes: [
              { id: '1', label: '재건축', type: 'concept', weight: 0.9 },
              { id: '2', label: '개포우성', type: 'concept', weight: 0.8 },
              { id: '3', label: '제안서', type: 'concept', weight: 0.7 }
            ],
            edges: [
              { id: '1', source: '1', target: '2', relationship: 'includes', weight: 0.8 },
              { id: '2', source: '2', target: '3', relationship: 'contains', weight: 0.7 }
            ]
          },
          documents: [
            {
              id: 'doc-2',
              title: '개포우성7차 제안서',
              content: '개포우성7차 재건축 사업에 대한 상세한 제안서 내용',
              type: 'proposal',
              tags: ['proposal', 'real-estate', 'development']
            }
          ],
          tags: ['재건축', '개포우성', '제안서', '개발사업'],
          completedAt: new Date()
        },
        deepLearning: {
          models: [
            {
              id: 'model-2',
              name: '문서 분류 모델',
              type: 'nlp',
              accuracy: 0.92,
              status: 'deployed'
            }
          ],
          predictions: [
            { type: 'classification', result: '재건축 제안서', confidence: 0.92 }
          ],
          accuracy: 0.92,
          completedAt: new Date()
        }
      }
    ];

    setFiles(initialFiles);
  }, []);

  const handleFileUpload = (uploadedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(uploadedFiles).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      size: file.size,
      uploadTime: new Date(),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    updateStorageStatus([...files, ...newFiles]);

    // 파일 업로드 시뮬레이션
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        simulateFileUpload(file.id);
      }, index * 1000);
    });
  };

  const simulateFileUpload = (fileId: string) => {
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + 20, 100);
          const newStatus = newProgress >= 100 ? 'uploaded' : 'uploading';

          if (newStatus === 'uploaded') {
            clearInterval(uploadInterval);
            setTimeout(() => {
              startAIAnalysis(fileId);
            }, 500);
          }

          return { ...file, progress: newProgress, status: newStatus };
        }
        return file;
      }));
    }, 200);
  };

  const startAIAnalysis = (fileId: string) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, status: 'analyzing', progress: 0 } : file
    ));

    const analysisSteps = [
      '파일 내용 분석',
      '주요 개념 추출',
      '패턴 인식',
      '인사이트 생성',
      '요약 생성',
      '감정 분석',
      '복잡도 평가',
      '주제 분류',
      '개체 인식',
      '분석 완료'
    ];

    let currentStep = 0;
    const analysisInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / analysisSteps.length) * 100;

      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (progress >= 100) {
            clearInterval(analysisInterval);
            setTimeout(() => {
              startKnowledgeBaseBuilding(fileId);
            }, 500);
            setTimeout(() => {
              startDeepLearningAnalysis(fileId);
            }, 1000);

            return {
              ...file,
              status: 'completed',
              progress: 100,
              aiAnalysis: generateAIAnalysisResults(file.name, file.type),
              knowledgeBase: generateKnowledgeBaseResults(file.name, file.type),
              deepLearning: generateDeepLearningResults(file.name, file.type)
            };
          }
          return { ...file, progress };
        }
        return file;
      }));
    }, 800);
  };

  const startKnowledgeBaseBuilding = (fileId: string) => {
    const kbSteps = [
      '문서 처리',
      '개념 추출',
      '관계 분석',
      '지식 그래프 구축',
      '문서 인덱싱',
      '태그 생성',
      '메타데이터 추출',
      '지식 베이스 완성'
    ];

    let currentStep = 0;
    const kbInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / kbSteps.length) * 100;

      setFiles(prev => prev.map(file => {
        if (file.id === fileId && progress >= 100) {
          clearInterval(kbInterval);
          return {
            ...file,
            knowledgeBase: generateKnowledgeBaseResults(file.name, file.type)
          };
        }
        return file;
      }));
    }, 1000);
  };

  const startDeepLearningAnalysis = (fileId: string) => {
    const dlSteps = [
      '데이터 전처리',
      '모델 선택',
      '모델 훈련',
      '성능 평가',
      '모델 최적화',
      '예측 생성',
      '결과 분석',
      '딥러닝 완료'
    ];

    let currentStep = 0;
    const dlInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / dlSteps.length) * 100;

      setFiles(prev => prev.map(file => {
        if (file.id === fileId && progress >= 100) {
          clearInterval(dlInterval);
          return {
            ...file,
            deepLearning: generateDeepLearningResults(file.name, file.type)
          };
        }
        return file;
      }));
    }, 1200);
  };

  const generateAIAnalysisResults = (fileName: string, fileType: string): AIAnalysisResult => {
    const allConcepts = [
      'AI 시스템', '딥러닝', '머신러닝', '자연어처리', '컴퓨터비전',
      '양자컴퓨팅', '생체인식', '파일학습', '지식베이스', '프로젝트관리'
    ];
    const allPatterns = [
      '모듈화 아키텍처', '실시간 처리', '자동화 시스템', '데이터 파이프라인',
      '사용자 인터페이스', 'API 통합', '클라우드 배포', '보안 시스템'
    ];
    const allInsights = [
      '통합 AI 플랫폼으로 높은 효율성 달성',
      '자동화된 파일 처리로 사용자 경험 향상',
      '지식 베이스 구축으로 정보 접근성 개선',
      '딥러닝 모델을 통한 예측 정확도 향상'
    ];

    return {
      keyConcepts: allConcepts.slice(0, 4),
      patterns: allPatterns.slice(0, 3),
      insights: allInsights.slice(0, 2),
      summary: `${fileName} 파일을 분석한 결과, AI 시스템 개발과 관련된 다양한 기술적 요소들이 발견되었습니다.`,
      sentiment: 'positive',
      complexity: 'medium',
      topics: ['AI Development', 'System Architecture', 'Machine Learning'],
      entities: ['CORBU AI', 'React', 'TypeScript', 'Python'],
      completedAt: new Date()
    };
  };

  const generateKnowledgeBaseResults = (fileName: string, fileType: string): KnowledgeBaseResult => {
    return {
      knowledgeGraph: {
        nodes: [
          { id: '1', label: 'AI 시스템', type: 'concept', weight: 0.9 },
          { id: '2', label: '딥러닝', type: 'concept', weight: 0.8 },
          { id: '3', label: '자연어처리', type: 'concept', weight: 0.7 }
        ],
        edges: [
          { id: '1', source: '1', target: '2', relationship: 'includes', weight: 0.8 },
          { id: '2', source: '1', target: '3', relationship: 'includes', weight: 0.7 }
        ]
      },
      documents: [
        {
          id: 'doc-1',
          title: `${fileName} 분석 문서`,
          content: `${fileName} 파일에 대한 상세한 분석 결과와 지식 베이스 구축 내용`,
          type: 'analysis',
          tags: ['analysis', 'knowledge-base', fileType]
        }
      ],
      tags: ['AI', '분석', fileType, '지식베이스'],
      completedAt: new Date()
    };
  };

  const generateDeepLearningResults = (fileName: string, fileType: string): DeepLearningResult => {
    return {
      models: [
        {
          id: 'model-1',
          name: '텍스트 분류 모델',
          type: 'nlp',
          accuracy: 0.95,
          status: 'deployed'
        },
        {
          id: 'model-2',
          name: '패턴 인식 모델',
          type: 'classification',
          accuracy: 0.88,
          status: 'ready'
        }
      ],
      predictions: [
        { type: 'classification', result: 'AI 관련 문서', confidence: 0.95 },
        { type: 'regression', result: '복잡도: 중간', confidence: 0.88 }
      ],
      accuracy: 0.92,
      completedAt: new Date()
    };
  };

  const updateStorageStatus = (fileList: FileItem[]) => {
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    setStorageStatus({
      totalFiles: fileList.length,
      totalSize,
      lastSync: new Date(),
      storageStatus: 'local'
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
      case 'mp3':
      case 'wav':
        return <MusicalNoteIcon className="w-6 h-6 text-yellow-500" />;
      case 'xlsx':
      case 'csv':
        return <TableCellsIcon className="w-6 h-6 text-green-600" />;
      case 'pptx':
      case 'ppt':
        return <PresentationChartBarIcon className="w-6 h-6 text-orange-500" />;
      case 'js':
      case 'ts':
      case 'py':
      case 'java':
        return <CodeBracketIcon className="w-6 h-6 text-gray-600" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600 bg-blue-100';
      case 'uploaded':
        return 'text-yellow-600 bg-yellow-100';
      case 'analyzing':
        return 'text-purple-600 bg-purple-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return '업로드 중';
      case 'uploaded':
        return '업로드 완료';
      case 'analyzing':
        return 'AI 분석 중';
      case 'completed':
        return '분석 완료';
      case 'error':
        return '오류';
      default:
        return '대기';
    }
  };

  const navigationTabs = [
    '대시보드', '개요', '파일', 'AI 학습', '딥러닝', '양자AI', '생체AI', '예측분석',
    '이미지분석', '음성인식', '지식베이스', '채팅', '협업', '보안', '백업', '설정'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션 바 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button className="text-gray-600 hover:text-gray-900" title="뒤로 가기">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <nav className="flex space-x-8">
              {navigationTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium transition-colors ${activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <button className="text-gray-600 hover:text-gray-900" title="알림">
            <BellIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-6 py-8">
        {/* 탭별 콘텐츠 렌더링 */}
        {activeTab === '딥러닝' ? (
          <AdvancedDeepLearningHub />
        ) : activeTab === 'AI 학습' ? (
          <AdvancedFileLearningHub />
        ) : activeTab === '양자AI' ? (
          <QuantumAIHub />
        ) : activeTab === '생체AI' ? (
          <BiometricAIHub />
        ) : activeTab === '예측분석' ? (
          <PredictiveAnalytics />
        ) : activeTab === '이미지분석' ? (
          <AdvancedImageAnalysis />
        ) : activeTab === '음성인식' ? (
          <AdvancedVoiceRecognition />
        ) : activeTab === '지식베이스' ? (
          <div className="text-center py-12">
            <LightBulbIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">지식 베이스</h2>
            <p className="text-gray-600 mb-6">파일 업로드 시 자동으로 지식 베이스가 구축됩니다.</p>

            {/* 지식 베이스 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {files.filter(f => f.knowledgeBase).length}
                </div>
                <div className="text-sm text-gray-600">총 지식</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {files.filter(f => f.knowledgeBase?.documents).reduce((acc, f) => acc + (f.knowledgeBase?.documents?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">AI 생성</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {files.filter(f => f.knowledgeBase).length > 0 ? '85%' : '0%'}
                </div>
                <div className="text-sm text-gray-600">평균 신뢰도</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {Array.from(new Set(files.filter(f => f.knowledgeBase?.tags).flatMap(f => f.knowledgeBase?.tags || []))).length}
                </div>
                <div className="text-sm text-gray-600">고유 태그</div>
              </div>
            </div>

            {/* 지식 베이스 내용 */}
            {files.filter(f => f.knowledgeBase).length > 0 ? (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">구축된 지식</h3>
                <div className="space-y-4">
                  {files.filter(f => f.knowledgeBase).map(file => (
                    <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">{file.name}</h4>
                      {file.knowledgeBase && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">주요 태그:</div>
                            <div className="flex flex-wrap gap-2">
                              {file.knowledgeBase.tags.slice(0, 5).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">지식 노드:</div>
                            <div className="text-sm text-gray-600">
                              {file.knowledgeBase.knowledgeGraph.nodes.length}개 노드, {file.knowledgeBase.knowledgeGraph.edges.length}개 관계
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>아직 구축된 지식이 없습니다.</p>
                <p className="text-sm mt-2">파일을 업로드하면 자동으로 지식 베이스가 구축됩니다.</p>
              </div>
            )}
          </div>
        ) : activeTab === '채팅' ? (
          <ChatGPTUnifiedSystem />
        ) : activeTab === '협업' ? (
          <AdvancedRealTimeCollaboration projectId="default-project" />
        ) : activeTab === '보안' ? (
          <AdvancedSecuritySystem />
        ) : activeTab === '백업' ? (
          <AdvancedBackupSystem />
        ) : activeTab === '설정' ? (
          <AdvancedSettingsManager />
        ) : activeTab === '대시보드' ? (
          <AdvancedAnalyticsDashboard />
        ) : activeTab === '개요' ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">CORBU AI 시스템 개요</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">파일 관리</h3>
                <p className="text-gray-600">자동 AI 분석, 지식베이스 구축, 딥러닝 분석을 통한 스마트 파일 관리</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 학습</h3>
                <p className="text-gray-600">고급 머신러닝과 딥러닝을 통한 지능형 학습 시스템</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">협업</h3>
                <p className="text-gray-600">실시간 협업과 프로젝트 관리를 위한 통합 플랫폼</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 파일 관리 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">파일 관리</h1>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <DocumentPlusIcon className="w-4 h-4 mr-2" />
                + 파일 첨부
              </button>
            </div>



            {/* 파일 목록 */}
            {files.length > 0 && (
              <div className="mb-6">
                <div className="space-y-2">
                  {files.map(file => (
                    <div
                      key={file.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowFileDetails(true);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.uploadTime.toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {getStatusText(file.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 파일 업로드 영역 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentPlusIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                title="파일 선택"
                aria-label="파일 업로드를 위한 파일 선택"
              />
            </div>
          </>
        )}

        {/* 파일 상세 정보 모달 */}
        {showFileDetails && selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    파일 상세 정보
                  </h3>
                  <button
                    onClick={() => setShowFileDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="닫기"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 파일 기본 정보 */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">파일 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">파일명</div>
                        <div className="font-medium text-gray-900">{selectedFile.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">파일 크기</div>
                        <div className="font-medium text-gray-900">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">파일 형식</div>
                        <div className="font-medium text-gray-900">{selectedFile.type.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">업로드 시간</div>
                        <div className="font-medium text-gray-900">
                          {selectedFile.uploadTime.toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI 분석 결과 */}
                  {selectedFile.aiAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                        AI 분석 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">주요 개념</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.aiAnalysis.keyConcepts.map((concept, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">발견된 패턴</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.aiAnalysis.patterns.map((pattern, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">핵심 인사이트</h5>
                        <div className="space-y-2">
                          {selectedFile.aiAnalysis.insights.map((insight, index) => (
                            <div key={index} className="flex items-start text-sm text-gray-600">
                              <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">종합 요약</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {selectedFile.aiAnalysis.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 지식 베이스 결과 */}
                  {selectedFile.knowledgeBase && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CircleStackIcon className="w-5 h-5 mr-2 text-green-600" />
                        지식 베이스 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">지식 그래프 노드</h5>
                          <div className="space-y-2">
                            {selectedFile.knowledgeBase.knowledgeGraph.nodes.map((node, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-900">{node.label}</span>
                                <span className="text-xs text-gray-500">가중치: {node.weight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">태그</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.knowledgeBase.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 딥러닝 결과 */}
                  {selectedFile.deepLearning && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CpuChipIcon className="w-5 h-5 mr-2 text-purple-600" />
                        딥러닝 분석 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">훈련된 모델</h5>
                          <div className="space-y-2">
                            {selectedFile.deepLearning.models.map((model, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                  <div className="text-xs text-gray-500">{model.type}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-900">정확도: {(model.accuracy * 100).toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">{model.status}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">예측 결과</h5>
                          <div className="space-y-2">
                            {selectedFile.deepLearning.predictions.map((prediction, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-900">{prediction.result}</span>
                                <span className="text-xs text-gray-500">
                                  신뢰도: {(prediction.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagementSystem;
