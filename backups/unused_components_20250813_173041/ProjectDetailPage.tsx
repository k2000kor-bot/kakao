import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  FolderIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CogIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectFile, ProjectGuideline, ProjectChat, ProjectAnalytics, ProjectSettings } from '../types/project';

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
  projectList,
  onProjectSelect
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'guidelines' | 'chats' | 'analytics' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // 자동화 상태 관리
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [autoFileProcessing, setAutoFileProcessing] = useState(true);
  const [autoGuidelineGeneration, setAutoGuidelineGeneration] = useState(true);
  const [autoChatManagement, setAutoChatManagement] = useState(true);
  const [autoAnalytics, setAutoAnalytics] = useState(true);
  const [autoSettings, setAutoSettings] = useState(true);
  
  // 자동화 진행 상태
  const [autoProgress, setAutoProgress] = useState({
    files: 0,
    guidelines: 0,
    analytics: 0,
    settings: 0
  });
  
  // 자동화 결과
  const [autoResults, setAutoResults] = useState({
    filesProcessed: 0,
    guidelinesGenerated: 0,
    analyticsUpdated: 0,
    settingsOptimized: 0
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-red-500" />;
      case 'audio':
        return <MusicalNoteIcon className="w-6 h-6 text-purple-500" />;
      case 'document':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      case 'spreadsheet':
        return <DocumentTextIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'archived':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 자동화 기능들
  const startAutoFileProcessing = async () => {
    if (!autoFileProcessing) return;
    
    setAutoProgress(prev => ({ ...prev, files: 0 }));
    console.log('자동 파일 처리 시작...');
    
    // 파일 자동 분석 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setAutoProgress(prev => ({ ...prev, files: i }));
    }
    
    setAutoResults(prev => ({ ...prev, filesProcessed: project.files.length }));
    console.log('자동 파일 처리 완료');
  };

  const startAutoGuidelineGeneration = async () => {
    if (!autoGuidelineGeneration) return;
    
    setAutoProgress(prev => ({ ...prev, guidelines: 0 }));
    console.log('자동 가이드라인 생성 시작...');
    
    // 가이드라인 자동 생성 시뮬레이션
    for (let i = 0; i <= 100; i += 15) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setAutoProgress(prev => ({ ...prev, guidelines: i }));
    }
    
    setAutoResults(prev => ({ ...prev, guidelinesGenerated: 3 }));
    console.log('자동 가이드라인 생성 완료');
  };

  const startAutoAnalytics = async () => {
    if (!autoAnalytics) return;
    
    setAutoProgress(prev => ({ ...prev, analytics: 0 }));
    console.log('자동 분석 시작...');
    
    // 분석 자동 실행 시뮬레이션
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAutoProgress(prev => ({ ...prev, analytics: i }));
    }
    
    setAutoResults(prev => ({ ...prev, analyticsUpdated: 5 }));
    console.log('자동 분석 완료');
  };

  const startAutoSettings = async () => {
    if (!autoSettings) return;
    
    setAutoProgress(prev => ({ ...prev, settings: 0 }));
    console.log('자동 설정 최적화 시작...');
    
    // 설정 자동 최적화 시뮬레이션
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setAutoProgress(prev => ({ ...prev, settings: i }));
    }
    
    setAutoResults(prev => ({ ...prev, settingsOptimized: 8 }));
    console.log('자동 설정 최적화 완료');
  };

  // 탭 변경 시 자동 실행
  useEffect(() => {
    const runAutoFeatures = async () => {
      switch (activeTab) {
        case 'files':
          await startAutoFileProcessing();
          break;
        case 'guidelines':
          await startAutoGuidelineGeneration();
          break;
        case 'analytics':
          await startAutoAnalytics();
          break;
        case 'settings':
          await startAutoSettings();
          break;
      }
    };

    runAutoFeatures();
  }, [activeTab, autoFileProcessing, autoGuidelineGeneration, autoAnalytics, autoSettings]);

  const handleSave = () => {
    const updatedProject = {
      ...project,
      ...editForm,
      updatedAt: new Date().toISOString()
    };
    onProjectUpdate(updatedProject);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onProjectDelete(project.id);
    setShowDeleteModal(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setShowFileUpload(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 프로젝트 기본 정보 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">프로젝트 정보</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              {isEditing ? '취소' : '편집'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                저장
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">활성</option>
                  <option value="completed">완료</option>
                  <option value="archived">보관</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{project.name}</h4>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status === 'active' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                  {project.status === 'completed' && <StarIcon className="w-4 h-4 mr-1" />}
                  {project.status === 'archived' && <FolderIcon className="w-4 h-4 mr-1" />}
                  {project.status === 'active' ? '활성' : project.status === 'completed' ? '완료' : '보관'}
                </div>
                <div className="text-sm text-gray-600 mt-1">상태</div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority === 'high' && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
                  {project.priority === 'medium' && <ClockIcon className="w-4 h-4 mr-1" />}
                  {project.priority === 'low' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                  {project.priority === 'high' ? '높음' : project.priority === 'medium' ? '보통' : '낮음'}
                </div>
                <div className="text-sm text-gray-600 mt-1">우선순위</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{project.messageCount}</div>
                <div className="text-sm text-gray-600">메시지</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{project.files.length}</div>
                <div className="text-sm text-gray-600">파일</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                생성일: {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                참여자: {project.analytics.participants}명
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 빠른 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 채팅</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.activeChats}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">지침</p>
              <p className="text-2xl font-semibold text-gray-900">{project.guidelines.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LightBulbIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">토픽</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.topTopics.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6">
      {/* 자동화 상태 표시 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">자동 파일 처리</h4>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoFileProcessing}
              onChange={(e) => setAutoFileProcessing(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-blue-700">자동 처리 활성화</span>
          </label>
        </div>
        
        {autoFileProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">처리 진행률</span>
              <span className="text-blue-700 font-medium">{autoProgress.files}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${autoProgress.files}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span>처리된 파일: {autoResults.filesProcessed}개</span>
              <span>총 파일: {project.files.length}개</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">파일 관리</h3>
        <button
          onClick={() => document.getElementById('file-upload')?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <CloudArrowUpIcon className="w-5 h-5 mr-2" />
          파일 업로드
        </button>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".txt,.doc,.docx,.pdf,.jpg,.jpeg,.png,.mp4,.mp3"
        />
      </div>

      {project.files.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">파일이 없습니다</h3>
          <p className="text-gray-500 mb-4">프로젝트에 파일을 업로드하여 시작하세요.</p>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            첫 번째 파일 업로드
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.files.map((file) => (
            <div key={file.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-500">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-6">
      {/* 자동화 상태 표시 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-medium text-green-900">자동 가이드라인 생성</h4>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoGuidelineGeneration}
              onChange={(e) => setAutoGuidelineGeneration(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-green-700">자동 생성 활성화</span>
          </label>
        </div>
        
        {autoGuidelineGeneration && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">생성 진행률</span>
              <span className="text-green-700 font-medium">{autoProgress.guidelines}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${autoProgress.guidelines}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-green-600">
              <span>생성된 가이드라인: {autoResults.guidelinesGenerated}개</span>
              <span>총 가이드라인: {project.guidelines.length}개</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">지침 관리</h3>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          새 지침 추가
        </button>
      </div>

      {project.guidelines.length === 0 ? (
        <div className="text-center py-12">
          <LightBulbIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">지침이 없습니다</h3>
          <p className="text-gray-500">프로젝트에 대한 지침을 추가하여 팀원들이 참고할 수 있도록 하세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {project.guidelines.map((guideline) => (
            <div key={guideline.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{guideline.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(guideline.priority)}`}>
                      {guideline.priority === 'high' ? '높음' : guideline.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{guideline.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>카테고리: {guideline.category}</span>
                    <span>생성일: {new Date(guideline.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-500">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChats = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">채팅방</h3>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          새 채팅방 생성
        </button>
      </div>

      {project.chats.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">채팅방이 없습니다</h3>
          <p className="text-gray-500">프로젝트 팀원들과 소통할 채팅방을 생성하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.chats.map((chat) => (
            <div key={chat.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{chat.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{chat.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>메시지: {chat.messageCount}</span>
                    <span>참여자: {chat.participants.length}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                      {chat.status === 'active' ? '활성' : chat.status === 'completed' ? '완료' : '보관'}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-blue-500">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* 자동화 상태 표시 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-medium text-purple-900">자동 분석 업데이트</h4>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAnalytics}
              onChange={(e) => setAutoAnalytics(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-purple-700">자동 분석 활성화</span>
          </label>
        </div>
        
        {autoAnalytics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700">분석 진행률</span>
              <span className="text-purple-700 font-medium">{autoProgress.analytics}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${autoProgress.analytics}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-purple-600">
              <span>업데이트된 분석: {autoResults.analyticsUpdated}개</span>
              <span>총 분석 항목: 5개</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">분석 대시보드</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 메시지</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.totalMessages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 파일</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.totalFiles}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">참여자</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.participants}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <LightBulbIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 채팅</p>
              <p className="text-2xl font-semibold text-gray-900">{project.analytics.activeChats}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">감정 분석</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">긍정적</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${project.analytics.sentimentAnalysis.positive}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{project.analytics.sentimentAnalysis.positive}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">중립적</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.analytics.sentimentAnalysis.neutral}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{project.analytics.sentimentAnalysis.neutral}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">부정적</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${project.analytics.sentimentAnalysis.negative}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{project.analytics.sentimentAnalysis.negative}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">인기 토픽</h4>
          <div className="space-y-2">
            {project.analytics.topTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{topic.topic}</span>
                <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* 자동화 상태 표시 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-5 h-5 text-orange-600" />
            <h4 className="text-sm font-medium text-orange-900">자동 설정 최적화</h4>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoSettings}
              onChange={(e) => setAutoSettings(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-orange-700">자동 최적화 활성화</span>
          </label>
        </div>
        
        {autoSettings && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">최적화 진행률</span>
              <span className="text-orange-700 font-medium">{autoProgress.settings}%</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${autoProgress.settings}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-orange-600">
              <span>최적화된 설정: {autoResults.settingsOptimized}개</span>
              <span>총 설정 항목: 8개</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">프로젝트 설정</h3>
      
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">파일 설정</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최대 파일 크기</label>
            <input
              type="number"
              value={project.settings.maxFileSize / 1024 / 1024}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MB 단위"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">허용된 파일 형식</label>
            <div className="flex flex-wrap gap-2">
              {project.settings.allowedFileTypes.map((type) => (
                <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {type}
                  <button className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                </span>
              ))}
              <button className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                <PlusIcon className="w-4 h-4 mr-1" />
                추가
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">자동 백업</p>
              <p className="text-sm text-gray-500">프로젝트 데이터를 자동으로 백업합니다</p>
            </div>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${project.settings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${project.settings.autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">알림</p>
              <p className="text-sm text-gray-500">프로젝트 활동에 대한 알림을 받습니다</p>
            </div>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${project.settings.notifications ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${project.settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 text-red-600">위험 영역</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">프로젝트를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              프로젝트 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">프로젝트 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '개요', icon: ChartBarIcon },
              { id: 'files', name: '파일', icon: DocumentTextIcon },
              { id: 'guidelines', name: '지침', icon: LightBulbIcon },
              { id: 'chats', name: '채팅', icon: UsersIcon },
              { id: 'analytics', name: '분석', icon: ChartBarIcon },
              { id: 'settings', name: '설정', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'files' && renderFiles()}
        {activeTab === 'guidelines' && renderGuidelines()}
        {activeTab === 'chats' && renderChats()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 삭제</h3>
            </div>
            <p className="text-gray-600 mb-6">
              이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
