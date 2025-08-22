import React, { useState, useEffect } from 'react';
import {
  Plus,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Settings,
  Users,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  fileCount: number;
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
  }>;
  guidelines: Array<{
    id: string;
    title: string;
    content: string;
    isActive: boolean;
  }>;
  tags: string[];
}

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: () => void;
  onProjectEdit: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectArchive: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onProjectSelect,
  onProjectCreate,
  onProjectEdit,
  onProjectDelete,
  onProjectArchive
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">프로젝트</h2>
          <button
            onClick={onProjectCreate}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">새 프로젝트</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="archived">보관됨</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                }`}
              onClick={() => onProjectSelect(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <Folder className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority === 'high' ? '높음' : project.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? '활성' : project.status === 'completed' ? '완료' : '보관'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex items-center space-x-1 mb-3">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{project.messageCount || 0}개 메시지</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{project.fileCount || 0}개 파일</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === project.id ? null : project.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showMenu === project.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    >
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectEdit(project.id);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                          <span>편집</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectArchive(project.id);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Archive className="h-4 w-4" />
                          <span>{project.status === 'archived' ? '복원' : '보관'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectDelete(project.id);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="p-8 text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onProjectCreate}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              첫 번째 프로젝트를 만들어보세요
            </button>
          )}
        </div>
      )}
    </div>
    </div >
  );
};

export default ProjectList;
