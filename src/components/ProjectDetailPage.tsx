import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BeakerIcon,
  SparklesIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import ProjectAnalyticsDashboard from './ProjectAnalyticsDashboard';
import ProjectRecommendations from './ProjectRecommendations';
import { Project, ProjectFile, KnowledgeBase, AILearningSession } from '../types/project';
import AILearningModal from './AILearningModal';
import KnowledgeBaseModal from './KnowledgeBaseModal';
import RealTimeChat from './RealTimeChat';
import ProjectDashboard from './ProjectDashboard';
import RealTimeAIAnalysis from './RealTimeAIAnalysis';
import RealTimeAnalysisModal from './RealTimeAnalysisModal';
import AdvancedAnalytics from './AdvancedAnalytics';
import DeepLearningManager from './DeepLearningManager';
import DeleteConfirmModal from './DeleteConfirmModal';
import FileStorageStatus from './FileStorageStatus';
import FileUploadNotification from './FileUploadNotification';
import AutoFileAnalysis from './AutoFileAnalysis';
import { AILearningService } from '../services/aiLearningService';
import FileStorageService from '../services/fileStorageService';
import FileAnalysisService, { FileAnalysisResult, RealTimeAnalysisData } from '../services/fileAnalysisService';

interface ProjectDetailPageProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  projectList?: Project[];
  onProjectSelect?: (projectId: string) => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  onBack,
  onProjectUpdate,
  onProjectDelete,
  projectList = [],
  onProjectSelect
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'files' | 'guidelines' | 'chats' | 'analytics' | 'settings' | 'ai-learning' | 'knowledge-base' | 'deep-learning' | 'project-analytics' | 'recommendations' | 'collaboration'>('dashboard');
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(project);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'images' | 'videos' | 'audio'>('all');

  // 파일 업로드 상태
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 새 항목 생성 상태
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewGuidelineModal, setShowNewGuidelineModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // AI 학습 및 지식 베이스 상태
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [aiLearningSessions, setAiLearningSessions] = useState<AILearningSession[]>([]);
  const [isAILearning, setIsAILearning] = useState(false);
  const [currentLearningSession, setCurrentLearningSession] = useState<AILearningSession | null>(null);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showAILearningModal, setShowAILearningModal] = useState(false);

  // 실시간 채팅 상태
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // 실시간 분석 모달 상태
  const [showRealTimeAnalysisModal, setShowRealTimeAnalysisModal] = useState(false);
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<ProjectFile | null>(null);

  // 삭제 확인 모달 상태
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  // 파일 업로드 알림 상태
  const [uploadNotification, setUploadNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // 프로젝트 목록 및 채팅 목록 상태
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);

  const aiLearningService = AILearningService.getInstance();
  const fileStorageService = FileStorageService.getInstance();
  const fileAnalysisService = FileAnalysisService.getInstance();

  useEffect(() => {
    // AI 학습 세션 및 지식 베이스 로드
    const loadAIData = async () => {
      const sessions = aiLearningService.getProjectLearningSessions(project.id);
      const knowledge = aiLearningService.getProjectKnowledge(project.id);

      setAiLearningSessions(sessions);
      setKnowledgeBase(knowledge);
    };

    loadAIData();
  }, [project.id, aiLearningService]);

  // 저장된 파일 불러오기 (초기 로드 시에만)
  useEffect(() => {
    const savedFiles = fileStorageService.getProjectFiles(project.id);
    // 프로젝트에 파일이 없고, 저장된 파일이 있을 때만 불러오기
    if (savedFiles.length > 0 && project.files.length === 0) {
      const updatedProject = {
        ...project,
        files: savedFiles
      };
      onProjectUpdate(updatedProject);
    }
  }, [project.id]); // project.files.length 의존성 제거

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon className="w-6 h-6 text-blue-500" />;
      case 'spreadsheet': return <DocumentIcon className="w-6 h-6 text-green-500" />;
      case 'image': return <DocumentIcon className="w-6 h-6 text-purple-500" />;
      case 'video': return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'audio': return <DocumentIcon className="w-6 h-6 text-yellow-500" />;
      default: return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    onProjectUpdate(editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onProjectDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 시뮬레이션된 업로드 진행률
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // 파일을 ProjectFile 형식으로 변환
      const newFiles: ProjectFile[] = Array.from(files).map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' :
          file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' :
              file.type.includes('spreadsheet') ? 'spreadsheet' : 'document',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
        description: `업로드된 ${file.name}`,
        tags: [],
        aiAnalysis: undefined
      }));

      // 즉시 프로젝트에 파일 추가 (사용자가 즉시 볼 수 있도록)
      const updatedProject = {
        ...project,
        files: [...project.files, ...newFiles]
      };
      onProjectUpdate(updatedProject);

      // 업로드 완료 후 처리
      setTimeout(() => {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);

        // 파일 저장 서비스에 저장
        newFiles.forEach(file => {
          fileStorageService.addFile(project.id, file);
        });

        // 업로드 성공 알림 표시
        setUploadNotification({
          isVisible: true,
          message: `${newFiles.length}개의 파일이 성공적으로 업로드되었습니다. AI 분석이 자동으로 시작됩니다.`,
          type: 'success'
        });

        // 자동 AI 분석 시작 (약간의 지연 후)
        setTimeout(() => {
          newFiles.forEach(file => {
            fileAnalysisService.startFileAnalysis(file, 'advanced').then(analysisId => {
              console.log(`파일 ${file.name} 분석 시작: ${analysisId}`);
            }).catch(error => {
              console.error(`파일 ${file.name} 분석 시작 실패:`, error);
            });
          });
        }, 1000); // 1초 후 분석 시작
      }, 2000);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setIsUploading(false);
      setUploadProgress(0);

      // 업로드 실패 알림 표시
      setUploadNotification({
        isVisible: true,
        message: '파일 업로드 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  };

  const startAILearning = async (options: any) => {
    setIsAILearning(true);

    try {
      const session = await aiLearningService.startLearningSession(project.id, options);
      setCurrentLearningSession(session);

      // 세션 진행 상황 모니터링
      const checkProgress = () => {
        const updatedSession = aiLearningService.getLearningSession(session.id);
        if (updatedSession) {
          setCurrentLearningSession(updatedSession);

          if (updatedSession.status === 'completed') {
            setIsAILearning(false);
            setCurrentLearningSession(null);
            // 지식 베이스 새로고침
            const knowledge = aiLearningService.getProjectKnowledge(project.id);
            setKnowledgeBase(knowledge);
          } else {
            setTimeout(checkProgress, 1000);
          }
        }
      };

      checkProgress();
    } catch (error) {
      console.error('AI 학습 시작 실패:', error);
      setIsAILearning(false);
    }
  };

  const addKnowledgeItem = (knowledge: Omit<KnowledgeBase, 'id' | 'createdAt'>) => {
    aiLearningService.addKnowledgeItem(project.id, knowledge);
    const updatedKnowledge = aiLearningService.getProjectKnowledge(project.id);
    setKnowledgeBase(updatedKnowledge);
  };

  const removeKnowledgeItem = (knowledgeId: string) => {
    aiLearningService.removeKnowledgeItem(project.id, knowledgeId);
    const updatedKnowledge = aiLearningService.getProjectKnowledge(project.id);
    setKnowledgeBase(updatedKnowledge);
  };

  const generateRecommendations = async () => {
    const recommendations = await aiLearningService.generateRecommendations(project.id);
    // 추천사항을 채팅으로 표시
    const aiMessage = {
      id: Date.now().toString(),
      content: `AI 추천사항:\n\n${recommendations.join('\n')}`,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'answer' as const
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  const analyzePerformance = async () => {
    const performance = await aiLearningService.analyzeLearningPerformance(project.id);
    const aiMessage = {
      id: Date.now().toString(),
      content: `학습 성과 분석:\n\n• 총 세션: ${performance.totalSessions}개\n• 성공률: ${performance.successRate.toFixed(1)}%\n• 평균 신뢰도: ${(performance.averageConfidence * 100).toFixed(1)}%\n• 지식 성장: ${performance.knowledgeGrowth}개`,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'answer' as const
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  const handleSendMessage = async (message: string) => {
    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
      type: 'question' as const
    };
    setChatMessages(prev => [...prev, userMessage]);

    // AI 응답 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: `프로젝트 "${project.name}"에 대한 질문을 받았습니다. ${message}에 대한 답변을 제공하겠습니다.`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'answer' as const
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const performAIAnalysis = async (file: ProjectFile) => {
    try {
      const analysis = await aiLearningService.analyzeFile(file);
      await aiLearningService.extractKnowledge(file, analysis);

      const updatedKnowledge = aiLearningService.getProjectKnowledge(project.id);
      setKnowledgeBase(updatedKnowledge);
    } catch (error) {
      console.error('파일 분석 실패:', error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    const file = project.files.find(f => f.id === fileId);
    if (file) {
      setFileToDelete(file);
      setShowDeleteFileModal(true);
    }
  };

  const confirmFileDelete = async () => {
    if (fileToDelete) {
      try {
        // 저장 서비스에서 파일 삭제
        fileStorageService.removeFile(project.id, fileToDelete.id);

        // 파일 분석 서비스에서도 관련 데이터 삭제
        const analysis = fileAnalysisService.getFileAnalysis(fileToDelete.id);
        if (analysis) {
          fileAnalysisService.deleteAnalysis(analysis.id);
        }
        fileAnalysisService.stopRealTimeAnalysis(fileToDelete.id);

        // 프로젝트에서 파일 제거
        const updatedProject = {
          ...project,
          files: project.files.filter(file => file.id !== fileToDelete.id)
        };
        onProjectUpdate(updatedProject);

        // 삭제 성공 알림
        setUploadNotification({
          isVisible: true,
          message: `파일 "${fileToDelete.name}"이(가) 성공적으로 삭제되었습니다.`,
          type: 'success'
        });

        // 파일 URL 해제 (메모리 누수 방지)
        if (fileToDelete.url && fileToDelete.url.startsWith('blob:')) {
          URL.revokeObjectURL(fileToDelete.url);
        }

        setFileToDelete(null);
        setShowDeleteFileModal(false);

        // 디버깅을 위한 로그
        console.log(`파일 삭제 완료: ${fileToDelete.name} (${fileToDelete.id})`);
        console.log(`프로젝트 ${project.id}의 남은 파일 수: ${updatedProject.files.length}`);
      } catch (error) {
        console.error('파일 삭제 실패:', error);

        // 삭제 실패 알림
        setUploadNotification({
          isVisible: true,
          message: '파일 삭제 중 오류가 발생했습니다.',
          type: 'error'
        });
      }
    }
  };

  const renderDashboard = () => (
    <ProjectDashboard
      project={project}
      onNavigateToSection={(section) => setActiveTab(section as any)}
    />
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 프로젝트 정보 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">프로젝트 정보</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="w-4 h-4" />
            <span>{isEditing ? '취소' : '편집'}</span>
          </button>
        </div>

        {/* 프로젝트 목록 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">프로젝트 목록</h4>
            <button
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <span>{showAllProjects ? '접기' : '더보기'}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAllProjects ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectList.slice(0, showAllProjects ? projectList.length : 7).map((projectItem) => (
              <div
                key={projectItem.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${projectItem.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                onClick={() => onProjectSelect?.(projectItem.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 truncate">{projectItem.name}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{projectItem.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(projectItem.status)}`}>
                        {projectItem.status === 'active' ? '진행중' : '완료'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(projectItem.priority)}`}>
                        {projectItem.priority === 'high' ? '높음' : projectItem.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(projectItem.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projectList.length > 7 && !showAllProjects && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllProjects(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                +{projectList.length - 7}개 더보기
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트명</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">기본 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">프로젝트명:</span>
                  <span className="text-gray-900">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">설명:</span>
                  <span className="text-gray-900">{project.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상태:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">우선순위:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">활동 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">생성일:</span>
                  <span className="text-gray-900">{project.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">마지막 수정:</span>
                  <span className="text-gray-900">{project.updatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">메시지 수:</span>
                  <span className="text-gray-900">{project.messageCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">파일 수:</span>
                  <span className="text-gray-900">{project.files.length}개</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 파일</p>
              <p className="text-2xl font-bold text-gray-900">{project.files.length}</p>
            </div>
            <DocumentIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 메시지</p>
              <p className="text-2xl font-bold text-gray-900">{project.messageCount}</p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">지식 항목</p>
              <p className="text-2xl font-bold text-gray-900">{knowledgeBase.length}</p>
            </div>
            <LightBulbIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">파일 관리</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            <span>파일 첨부</span>
          </button>
        </div>
      </div>

      {/* 파일 저장 상태 */}
      <FileStorageStatus projectId={project.id} />

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-700">파일 업로드 중... {uploadProgress}%</span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="파일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 파일</option>
              <option value="documents">문서</option>
              <option value="images">이미지</option>
              <option value="videos">비디오</option>
              <option value="audio">오디오</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {project.files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DocumentIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>업로드된 파일이 없습니다</p>
            </div>
          ) : (
            project.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.type} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    title="다운로드"
                  >
                    다운로드
                  </button>
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>

                {/* 자동 분석 컴포넌트 */}
                <AutoFileAnalysis
                  file={file}
                  onAnalysisComplete={(result) => {
                    console.log('분석 완료:', result);
                    // 분석 결과를 파일에 저장
                    const updatedFile = {
                      ...file,
                      aiAnalysis: {
                        keywords: result.results.keywords,
                        summary: result.results.summary,
                        sentiment: result.results.sentiment,
                        confidence: result.confidence
                      }
                    };

                    // 프로젝트 업데이트
                    const updatedProject = {
                      ...project,
                      files: project.files.map(f =>
                        f.id === file.id ? updatedFile : f
                      )
                    };
                    onProjectUpdate(updatedProject);
                  }}
                  onRealTimeUpdate={(data) => {
                    console.log('실시간 분석 업데이트:', data);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">지침 관리</h3>
        <button
          onClick={() => setShowNewGuidelineModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          <span>지침 추가</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="지침 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="divide-y">
          {project.guidelines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 지침이 없습니다</p>
            </div>
          ) : (
            project.guidelines.map((guideline, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {guideline.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-gray-900">{guideline}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="h-full">
      <RealTimeChat
        projectId={project.id}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isTyping={isTyping}
      />
    </div>
  );

  const renderAnalytics = () => (
    <AdvancedAnalytics projectId={project.id} />
  );

  const renderProjectAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">프로젝트 상세 분석</h3>
        <button
          onClick={() => setShowAnalyticsDashboard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <ChartBarIcon className="w-4 h-4 mr-2" />
          상세 분석 대시보드
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <PresentationChartLineIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">진행률</h4>
              <p className="text-3xl font-bold text-blue-600">75%</p>
              <p className="text-sm text-gray-600">전체 작업 완료율</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">팀 성과</h4>
              <p className="text-3xl font-bold text-green-600">92%</p>
              <p className="text-sm text-gray-600">협업 효율성</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">AI 예측</h4>
              <p className="text-3xl font-bold text-purple-600">88%</p>
              <p className="text-sm text-gray-600">성공 확률</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">AI 개선 추천</h3>
        <button
          onClick={() => setShowRecommendations(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center"
        >
          <LightBulbIcon className="w-4 h-4 mr-2" />
          상세 추천사항
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-orange-600" />
            우선순위 액션
          </h4>
          <div className="space-y-3">
            <div className="border-l-4 border-red-400 pl-4">
              <p className="font-medium text-red-800">코드 최적화</p>
              <p className="text-sm text-gray-600">성능 30% 향상 가능</p>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-medium text-yellow-800">커뮤니케이션 강화</p>
              <p className="text-sm text-gray-600">일일 스탠드업 미팅 도입</p>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <p className="font-medium text-green-800">API 문서화</p>
              <p className="text-sm text-gray-600">개발자 가이드 작성</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CpuChipIcon className="w-5 h-5 mr-2 text-blue-600" />
            자동화 기회
          </h4>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-800">테스트 자동화</p>
              <p className="text-xs text-blue-600">QA 시간 50% 단축</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm font-medium text-green-800">배포 자동화</p>
              <p className="text-xs text-green-600">릴리스 사이클 개선</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm font-medium text-purple-800">코드 리뷰 자동화</p>
              <p className="text-xs text-purple-600">품질 관리 강화</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollaboration = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">팀 협업</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">활성 팀원</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">김</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">김개발</p>
                <p className="text-xs text-gray-600">Frontend Developer</p>
              </div>
              <div className="ml-auto">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">박</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">박백엔드</p>
                <p className="text-xs text-gray-600">Backend Developer</p>
              </div>
              <div className="ml-auto">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">이</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">이디자인</p>
                <p className="text-xs text-gray-600">UI/UX Designer</p>
              </div>
              <div className="ml-auto">
                <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h4>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-900">김개발님이 새 파일을 업로드했습니다</p>
              <p className="text-gray-500 text-xs">5분 전</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">박백엔드님이 코드 리뷰를 완료했습니다</p>
              <p className="text-gray-500 text-xs">15분 전</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">이디자인님이 새 댓글을 추가했습니다</p>
              <p className="text-gray-500 text-xs">1시간 전</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">설정</h3>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 설정</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">자동 백업</label>
            <input type="checkbox" checked={project.settings.autoBackup} className="mr-2" />
            <span className="text-sm text-gray-600">프로젝트 데이터 자동 백업</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">알림</label>
            <input type="checkbox" checked={project.settings.notifications} className="mr-2" />
            <span className="text-sm text-gray-600">활동 알림 받기</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">위험 영역</h4>
        <div className="space-y-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <TrashIcon className="w-4 h-4" />
            <span>프로젝트 삭제</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAILearning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI 학습</h3>
        <button
          onClick={() => setShowAILearningModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <CpuChipIcon className="w-4 h-4" />
          <span>학습 시작</span>
        </button>
      </div>

      {/* 현재 학습 세션 */}
      {currentLearningSession && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">현재 학습 세션</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">세션 ID</p>
              <p className="text-gray-900">{currentLearningSession.id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">진행률</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentLearningSession.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{currentLearningSession.progress}% 완료</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">처리된 파일</p>
                <p className="text-gray-900">{currentLearningSession.filesAnalyzed}/{currentLearningSession.totalFiles}개</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">분석 결과</p>
                <p className="text-gray-900">{currentLearningSession.results.length}개</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 학습 세션 히스토리 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">학습 세션 히스토리</h4>
        <div className="space-y-3">
          {aiLearningSessions.length === 0 ? (
            <p className="text-gray-500">학습 세션이 없습니다</p>
          ) : (
            aiLearningSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="text-lg font-medium text-gray-900">세션 {session.id.slice(-8)}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {session.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{new Date(session.startTime).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{session.filesAnalyzed}/{session.totalFiles}개 파일</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">지식 베이스</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={generateRecommendations}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>AI 추천</span>
          </button>
          <button
            onClick={() => setShowKnowledgeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            <span>지식 추가</span>
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">총 지식</p>
          <p className="text-2xl font-bold text-gray-900">{knowledgeBase.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">AI 생성</p>
          <p className="text-2xl font-bold text-gray-900">
            {knowledgeBase.filter(k => k.aiGenerated).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">평균 신뢰도</p>
          <p className="text-2xl font-bold text-gray-900">
            {knowledgeBase.length > 0
              ? Math.round(knowledgeBase.reduce((sum, k) => sum + k.confidence, 0) / knowledgeBase.length * 100)
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">고유 태그</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(knowledgeBase.flatMap(k => k.tags)).size}
          </p>
        </div>
      </div>

      {/* 지식 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="지식 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="divide-y">
          {knowledgeBase.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 지식이 없습니다</p>
            </div>
          ) : (
            knowledgeBase.map((knowledge) => (
              <div key={knowledge.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-gray-900">{knowledge.title}</h5>
                      {knowledge.aiGenerated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          AI 생성
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {knowledge.confidence * 100}% 신뢰도
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{knowledge.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {knowledge.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeKnowledgeItem(knowledge.id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-8 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'files'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            파일
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'guidelines'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            지침
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'chats'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            채팅
          </button>
          <button
            onClick={() => setActiveTab('ai-learning')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'ai-learning'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            AI 학습
          </button>
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'knowledge-base'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            지식 베이스
          </button>
          <button
            onClick={() => setActiveTab('deep-learning')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'deep-learning'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            딥러닝
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            분석
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            설정
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'guidelines' && renderGuidelines()}
        {activeTab === 'chats' && renderChats()}
        {activeTab === 'ai-learning' && renderAILearning()}
        {activeTab === 'knowledge-base' && renderKnowledgeBase()}
        {activeTab === 'deep-learning' && <DeepLearningManager projectId={project.id} files={project.files} />}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'project-analytics' && renderProjectAnalytics()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'collaboration' && renderCollaboration()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* 모달들 */}
      <AILearningModal
        isOpen={showAILearningModal}
        onClose={() => setShowAILearningModal(false)}
        onStartLearning={startAILearning}
        projectFiles={project.files}
      />

      <KnowledgeBaseModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        onAddKnowledge={addKnowledgeItem}
      />

      {/* 프로젝트 분석 대시보드 */}
      <ProjectAnalyticsDashboard
        projectId={project.id}
        isVisible={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
      />

      {/* 프로젝트 추천사항 */}
      <ProjectRecommendations
        projectId={project.id}
        isVisible={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        onApplyRecommendation={(recommendation) => {
          console.log('추천사항 적용:', recommendation);
          // 여기에 추천사항 적용 로직 구현
        }}
      />

      <RealTimeAnalysisModal
        isOpen={showRealTimeAnalysisModal}
        onClose={() => {
          setShowRealTimeAnalysisModal(false);
          setSelectedFileForAnalysis(null);
        }}
        file={selectedFileForAnalysis}
      />

      <DeleteConfirmModal
        isOpen={showDeleteFileModal}
        onClose={() => {
          setShowDeleteFileModal(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmFileDelete}
        title="파일 삭제"
        message="이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        itemName={fileToDelete?.name}
      />

      <FileUploadNotification
        isVisible={uploadNotification.isVisible}
        message={uploadNotification.message}
        type={uploadNotification.type}
        onClose={() => setUploadNotification(prev => ({ ...prev, isVisible: false }))}
      />

      {/* 파일 첨부 모달 */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">파일 첨부</h3>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="닫기"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-all duration-300 hover:bg-blue-50"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50', 'scale-105');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'scale-105');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'scale-105');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload(files);
                  setShowNewFileModal(false);
                }
              }}
            >
              <div className="space-y-6">
                <div className="text-8xl mb-4">📁</div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    파일을 드래그하여 업로드
                  </h3>
                  <p className="text-gray-600 text-lg">
                    여러 파일을 한 번에 업로드할 수 있습니다
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-500">또는</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                  <button
                    onClick={() => document.getElementById('modal-file-upload')?.click()}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    aria-label="파일 선택 버튼"
                  >
                    <span className="text-lg font-medium">클릭하여 파일 선택</span>
                  </button>
                </div>
                <input
                  id="modal-file-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                      setShowNewFileModal(false);
                    }
                  }}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                  aria-label="파일 선택"
                />
              </div>
            </div>

            {/* 지원 파일 형식 */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">지원 파일 형식</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium">이미지</div>
                  <div>JPG, PNG, GIF</div>
                </div>
                <div>
                  <div className="font-medium">스프레드시트</div>
                  <div>XLSX, XLS</div>
                </div>
                <div>
                  <div className="font-medium">문서</div>
                  <div>PDF, DOC, DOCX, TXT</div>
                </div>
                <div>
                  <div className="font-medium">프레젠테이션</div>
                  <div>PPTX, PPT</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                최대 파일 크기: 10MB
              </div>
            </div>

            {/* 업로드 진행률 */}
            {isUploading && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-700 font-medium">파일 업로드 중... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage; 