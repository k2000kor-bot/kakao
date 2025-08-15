import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Project } from '../types/project';

interface ProjectListPageProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (project: Omit<Project, 'id'>) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectArchive: (projectId: string) => void;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({
  projects,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onProjectArchive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused' | 'archived'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'messageCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllProjects, setShowAllProjects] = useState(false);

  // 새 프로젝트 생성 상태
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    newTag: ''
  });

  const categories = ['부동산 개발', '도시정비', '건설', '분양', '관리', '기타'];
  const statusOptions = [
    { value: 'all', label: '모든 상태' },
    { value: 'active', label: '활성' },
    { value: 'completed', label: '완료' },
    { value: 'paused', label: '일시정지' },
    { value: 'archived', label: '보관' }
  ];

  const sortOptions = [
    { value: 'name', label: '이름' },
    { value: 'createdAt', label: '생성일' },
    { value: 'updatedAt', label: '마지막 활동' },
    { value: 'messageCount', label: '메시지 수' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'completed': return '완료';
      case 'paused': return '일시정지';
      case 'archived': return '보관';
      default: return status;
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || project.tags.includes(filterCategory);
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'messageCount':
          aValue = a.messageCount;
          bValue = b.messageCount;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // 15개 제한 적용
  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 15);
  const hasMoreProjects = filteredProjects.length > 15;

  const handleCreateProject = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      const project: Omit<Project, 'id'> = {
        name: newProject.name,
        description: newProject.description,
        status: 'active',
        priority: 'medium',
        tags: newProject.tags,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        messageCount: 0,
        files: [],
        guidelines: [],
        chats: [],
        analytics: {
          totalMessages: 0,
          totalFiles: 0,
          totalGuidelines: 0,
          activeChats: 0,
          participants: 0,
          activityTrend: [],
          topTopics: [],
          sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 }
        },
        settings: {
          theme: 'light',
          language: 'ko',
          aiModel: 'gpt-4',
          autoSave: true,
          collaboration: true,
          notifications: true,
          privacy: 'private',
          maxFileSize: 10485760,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          autoBackup: true
        },
        archived: false
      };

      onProjectCreate(project);
      setNewProject({ name: '', description: '', category: '', tags: [], newTag: '' });
      setShowCreateModal(false);
    }
  };

  const handleAddTag = () => {
    if (newProject.newTag.trim() && !newProject.tags.includes(newProject.newTag.trim())) {
      setNewProject({
        ...newProject,
        tags: [...newProject.tags, newProject.newTag.trim()],
        newTag: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewProject({
      ...newProject,
      tags: newProject.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const renderProjectCard = (project: Project) => (
    <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="프로젝트 메뉴"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {showProjectMenu === project.id && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onProjectSelect(project);
                      setShowProjectMenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    열기
                  </button>
                  <button
                    onClick={() => {
                      onProjectUpdate({ ...project, status: project.status === 'archived' ? 'active' : 'archived' });
                      setShowProjectMenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                    {project.status === 'archived' ? '보관 해제' : '보관'}
                  </button>
                  <button
                    onClick={() => {
                      onProjectDelete(project.id);
                      setShowProjectMenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
          <span className="text-xs text-gray-500">{project.tags[0] || '기타'}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">메시지</p>
            <p className="text-sm font-semibold text-gray-900">{project.messageCount}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DocumentIcon className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-500">파일</p>
            <p className="text-sm font-semibold text-gray-900">{project.files.length}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <UserGroupIcon className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500">지침</p>
            <p className="text-sm font-semibold text-gray-900">{project.guidelines.length}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1" />
            {formatDate(project.updatedAt)}
          </div>
          <div className="flex space-x-1">
            {project.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{project.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onProjectSelect(project)}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          프로젝트 열기
        </button>
      </div>
    </div>
  );

  const renderProjectList = (project: Project) => (
    <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                {project.messageCount}
              </div>
              <div className="flex items-center">
                <DocumentIcon className="w-4 h-4 mr-1" />
                {project.files.length}
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-1" />
                {project.guidelines.length}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {formatDate(project.updatedAt)}
            </div>

            <button
              onClick={() => onProjectSelect(project)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              열기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">프로젝트</h1>
              <p className="text-sm text-gray-500">프로젝트를 관리하고 진행 상황을 확인하세요</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              새 프로젝트
            </button>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  aria-label="그리드 보기"
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current"></div>
                    <div className="w-1.5 h-1.5 bg-current"></div>
                    <div className="w-1.5 h-1.5 bg-current"></div>
                    <div className="w-1.5 h-1.5 bg-current"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  aria-label="리스트 보기"
                >
                  <div className="w-4 h-4 space-y-0.5">
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                    <div className="w-full h-0.5 bg-current"></div>
                  </div>
                </button>
              </div>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <React.Fragment key={option.value}>
                    <option value={`${option.value}-asc`}>{option.label} (오름차순)</option>
                    <option value={`${option.value}-desc`}>{option.label} (내림차순)</option>
                  </React.Fragment>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayedProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-500 mb-6">새 프로젝트를 생성하여 시작하세요</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              새 프로젝트 생성
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {displayedProjects.map(project =>
                viewMode === 'grid' ? renderProjectCard(project) : renderProjectList(project)
              )}
            </div>

            {/* 더보기 버튼 */}
            {hasMoreProjects && !showAllProjects && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllProjects(true)}
                  className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronDownIcon className="w-5 h-5 mr-2" />
                  더보기 ({filteredProjects.length - 15}개 더)
                </button>
              </div>
            )}

            {/* 접기 버튼 */}
            {showAllProjects && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllProjects(false)}
                  className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronDownIcon className="w-5 h-5 mr-2 transform rotate-180" />
                  접기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 새 프로젝트 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 프로젝트 생성</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="프로젝트명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="프로젝트 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newProject.newTag}
                    onChange={(e) => setNewProject({ ...newProject, newTag: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="태그 입력"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newProject.tags.map((tag, index) => (
                    <span key={index} className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim() || !newProject.description.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                생성
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage; 