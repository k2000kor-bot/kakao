import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Folder,
    MoreVertical,
    Edit,
    Trash2,
    Archive,
    Calendar,
    Tag,
    MessageSquare,
    FileText
} from 'lucide-react';
import { Project } from '../types/project';
import { projectService } from '../services/projectService';

interface ProjectListProps {
    onProjectSelect: (project: Project) => void;
    onNewProject: () => void;
    selectedProjectId?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
    onProjectSelect,
    onNewProject,
    selectedProjectId
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        const projectList = projectService.getProjects();
        setProjects(projectList);
    };

    const handleDeleteProject = (projectId: string) => {
        if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
            projectService.deleteProject(projectId);
            loadProjects();
            setShowMenu(null);
        }
    };

    const handleArchiveProject = (projectId: string) => {
        projectService.updateProject(projectId, { status: 'archived' });
        loadProjects();
        setShowMenu(null);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('ko-KR', {
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
                        onClick={onNewProject}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">새 프로젝트</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="프로젝트 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Folder className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">
                                {searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={onNewProject}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    첫 번째 프로젝트를 만들어보세요
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${selectedProjectId === project.id
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => onProjectSelect(project)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Folder className={`h-5 w-5 ${project.status === 'archived' ? 'text-gray-400' : 'text-purple-600'
                                                }`} />
                                            <h3 className={`font-medium truncate ${project.status === 'archived' ? 'text-gray-500' : 'text-gray-900'
                                                }`}>
                                                {project.name}
                                            </h3>
                                            {project.status === 'archived' && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                    보관됨
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(project.updatedAt)}</span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{project.chats.length} 채팅</span>
                                            </div>

                                            {project.tags.length > 0 && (
                                                <div className="flex items-center space-x-1">
                                                    <Tag className="h-3 w-3" />
                                                    <span>{project.tags.length} 태그</span>
                                                </div>
                                            )}
                                        </div>

                                        {project.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {project.tags.length > 3 && (
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        +{project.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative ml-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(showMenu === project.id ? null : project.id);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <MoreVertical className="h-4 w-4 text-gray-400" />
                                        </button>

                                        <AnimatePresence>
                                            {showMenu === project.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // 편집 기능 구현 필요
                                                            setShowMenu(null);
                                                        }}
                                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span>편집</span>
                                                    </button>

                                                    {project.status === 'archived' ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                projectService.updateProject(project.id, { status: 'active' });
                                                                loadProjects();
                                                                setShowMenu(null);
                                                            }}
                                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Folder className="h-4 w-4" />
                                                            <span>복원</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArchiveProject(project.id);
                                                            }}
                                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Archive className="h-4 w-4" />
                                                            <span>보관</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteProject(project.id);
                                                        }}
                                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>삭제</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProjectList;
