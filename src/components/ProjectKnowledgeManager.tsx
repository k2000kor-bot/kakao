import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentIcon,
  AcademicCapIcon,
  ChartBarIcon,
  LightBulbIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  KnowledgeBase,
  Document as KnowledgeDocument,
  Guideline
} from '../types/knowledge';
import knowledgeService from '../services/knowledgeService';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  knowledgeBases: string[];
  documents: KnowledgeDocument[];
  guidelines: Guideline[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectKnowledgeManagerProps {
  selectedProject?: Project;
  onProjectChange?: (project: Project) => void;
}

const ProjectKnowledgeManager: React.FC<ProjectKnowledgeManagerProps> = ({
  selectedProject,
  onProjectChange
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(selectedProject || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'guidelines' | 'knowledge' | 'analytics'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 새 프로젝트 생성 상태
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: ''
  });

  // 문서 업로드 상태
  const [uploadedDocuments, setUploadedDocuments] = useState<KnowledgeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // B와 C 버튼 상태
  const [showFileManager, setShowFileManager] = useState(false);
  const [showBridgeSystem, setShowBridgeSystem] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // 샘플 프로젝트 데이터
      const sampleProjects: Project[] = [
        {
          id: 'proj_1',
          name: '우성7차 아파트 프로젝트',
          description: '우성7차 아파트 관련 모든 문서와 지식 관리',
          category: '건설',
          knowledgeBases: ['kb_1'],
          documents: [],
          guidelines: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'proj_2',
          name: '안전 관리 시스템',
          description: '건설 현장 안전 관리 지침 및 규정',
          category: '안전',
          knowledgeBases: ['kb_2'],
          documents: [],
          guidelines: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setProjects(sampleProjects);
      if (sampleProjects.length > 0 && !currentProject) {
        setCurrentProject(sampleProjects[0]);
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description) {
      alert('프로젝트 이름과 설명을 입력해주세요.');
      return;
    }

    try {
      const project: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newProject.name,
        description: newProject.description,
        category: newProject.category,
        knowledgeBases: [],
        documents: [],
        guidelines: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setProjects(prev => [...prev, project]);
      setCurrentProject(project);
      setNewProject({ name: '', description: '', category: '' });

      if (onProjectChange) {
        onProjectChange(project);
      }

      alert('프로젝트가 생성되었습니다.');
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    }
  };

  const handleDocumentUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const newDocuments: KnowledgeDocument[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await readFileContent(file);

        const document: KnowledgeDocument = {
          id: `doc_${Date.now()}_${i}`,
          title: file.name,
          content,
          type: getFileType(file.name),
          category: '일반',
          tags: [],
          uploadedAt: new Date()
        };

        newDocuments.push(document);
      }

      setUploadedDocuments(prev => [...prev, ...newDocuments] as KnowledgeDocument[]);

      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          documents: [...currentProject.documents, ...newDocuments],
          updatedAt: new Date()
        };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
      }

      alert(`${newDocuments.length}개의 문서가 업로드되었습니다.`);
    } catch (error) {
      console.error('문서 업로드 실패:', error);
      alert('문서 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const getFileType = (filename: string): 'pdf' | 'doc' | 'txt' | 'image' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'doc':
      case 'docx': return 'doc';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      default: return 'txt';
    }
  };

  const filteredDocuments = currentProject?.documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredGuidelines = currentProject?.guidelines.filter(guideline =>
    guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guideline.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex h-full bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">12</span>
            프로젝트 관리
          </h2>
        </div>

        {/* B와 C 버튼 */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFileManager(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-1">B</span>
              <DocumentIcon className="w-4 h-4" />
              <span>파일 업로드/리스트</span>
            </button>

            <button
              onClick={() => setShowBridgeSystem(!showBridgeSystem)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span className="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-1">C</span>
              <AcademicCapIcon className="w-4 h-4" />
              <span>AI 강화 시스템</span>
            </button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">프로젝트</h3>
            <button
              onClick={() => setActiveTab('overview')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => {
                  setCurrentProject(project);
                  if (onProjectChange) onProjectChange(project);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${currentProject?.id === project.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProject?.name || '프로젝트 선택'}
              </h1>
              <p className="text-gray-600">
                {currentProject?.description || '프로젝트를 선택해주세요.'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                <span>새 프로젝트</span>
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: '개요', icon: ChartBarIcon },
              { id: 'documents', name: '문서', icon: DocumentIcon },
              { id: 'guidelines', name: '지침', icon: BookOpenIcon },
              { id: 'knowledge', name: '지식 베이스', icon: AcademicCapIcon },
              { id: 'analytics', name: '분석', icon: LightBulbIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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

        {/* 탭 콘텐츠 */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'overview' && (
            <ProjectOverview
              project={currentProject}
              onCreateProject={handleCreateProject}
              newProject={newProject}
              setNewProject={setNewProject}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManager
              project={currentProject}
              documents={filteredDocuments}
              onUpload={handleDocumentUpload}
              isUploading={isUploading}
            />
          )}

          {activeTab === 'guidelines' && (
            <GuidelineManager
              project={currentProject}
              guidelines={filteredGuidelines}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseManager
              project={currentProject}
            />
          )}

          {activeTab === 'analytics' && (
            <ProjectAnalytics
              project={currentProject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 프로젝트 개요 컴포넌트
const ProjectOverview: React.FC<{
  project: Project | null;
  onCreateProject: () => void;
  newProject: any;
  setNewProject: (project: any) => void;
}> = ({ project, onCreateProject, newProject, setNewProject }) => {
  if (!project) {
    return (
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">새 프로젝트 생성</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="프로젝트 이름"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="프로젝트 설명"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
          <input
            type="text"
            placeholder="카테고리"
            value={newProject.category}
            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <button
            onClick={onCreateProject}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            프로젝트 생성
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <DocumentIcon className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.documents.length}</p>
              <p className="text-sm text-gray-600">문서</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.guidelines.length}</p>
              <p className="text-sm text-gray-600">지침</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.knowledgeBases.length}</p>
              <p className="text-sm text-gray-600">지식 베이스</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">프로젝트 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">카테고리</p>
            <p className="text-gray-900">{project.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">생성일</p>
            <p className="text-gray-900">{project.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">최종 수정</p>
            <p className="text-gray-900">{project.updatedAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 문서 관리 컴포넌트
const DocumentManager: React.FC<{
  project: Project | null;
  documents: KnowledgeDocument[];
  onUpload: (files: FileList) => void;
  isUploading: boolean;
}> = ({ project, documents, onUpload, isUploading }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">문서 관리</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isUploading ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>문서 업로드</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="w-8 h-8 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.type.toUpperCase()} • {doc.uploadedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            {doc.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {doc.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 지침 관리 컴포넌트
const GuidelineManager: React.FC<{
  project: Project | null;
  guidelines: Guideline[];
}> = ({ project, guidelines }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">지침 관리</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <PlusIcon className="w-4 h-4" />
          <span>지침 추가</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guidelines.map(guideline => (
          <div key={guideline.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{guideline.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{guideline.content}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${guideline.priority === 'high' ? 'bg-red-100 text-red-800' :
                    guideline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {guideline.priority}
                  </span>
                  <span className="text-xs text-gray-500">{guideline.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 지식 베이스 관리 컴포넌트
const KnowledgeBaseManager: React.FC<{
  project: Project | null;
}> = ({ project }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">지식 베이스</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <PlusIcon className="w-4 h-4" />
          <span>지식 베이스 생성</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">지식 베이스 기능이 곧 추가될 예정입니다.</p>
      </div>
    </div>
  );
};

// 프로젝트 분석 컴포넌트
const ProjectAnalytics: React.FC<{
  project: Project | null;
}> = ({ project }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">프로젝트 분석</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">문서 분포</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">PDF</span>
              <span className="text-sm font-medium">
                {project?.documents.filter(d => d.type === 'pdf').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">문서</span>
              <span className="text-sm font-medium">
                {project?.documents.filter(d => d.type === 'doc').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">텍스트</span>
              <span className="text-sm font-medium">
                {project?.documents.filter(d => d.type === 'txt').length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">지침 우선순위</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">높음</span>
              <span className="text-sm font-medium">
                {project?.guidelines.filter(g => g.priority === 'high').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">보통</span>
              <span className="text-sm font-medium">
                {project?.guidelines.filter(g => g.priority === 'medium').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">낮음</span>
              <span className="text-sm font-medium">
                {project?.guidelines.filter(g => g.priority === 'low').length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKnowledgeManager; 