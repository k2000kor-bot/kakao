import React, { useState, useMemo } from 'react';
import { Project } from '../types/project';

interface ProjectSearchProps {
    projects: Project[];
    onProjectSelect: (project: Project) => void;
    selectedProjectId?: string;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({
    projects,
    onProjectSelect,
    selectedProjectId
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'messageCount'>('updatedAt');

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        // 정렬
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'createdAt':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'updatedAt':
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                case 'messageCount':
                    return b.analytics.totalMessages - a.analytics.totalMessages;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [projects, searchTerm, filterStatus, sortBy]);

    const getProjectStats = (project: Project) => {
        const activeGuidelines = project.guidelines.filter(g => g.isActive).length;
        return {
            files: project.analytics.totalFiles,
            messages: project.analytics.totalMessages,
            guidelines: activeGuidelines
        };
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '오늘';
        if (diffDays === 2) return '어제';
        if (diffDays <= 7) return `${diffDays - 1}일 전`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)}주 전`;
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 검색 및 필터 헤더 */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col space-y-3">
                    {/* 검색 입력 */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="프로젝트 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                    </div>

                    {/* 필터 및 정렬 */}
                    <div className="flex space-x-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'archived')}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">모든 상태</option>
                            <option value="active">활성</option>
                            <option value="archived">보관</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'updatedAt' | 'messageCount')}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="updatedAt">최근 업데이트</option>
                            <option value="createdAt">생성일</option>
                            <option value="name">이름순</option>
                            <option value="messageCount">메시지 수</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 프로젝트 목록 */}
            <div className="max-h-96 overflow-y-auto">
                {filteredAndSortedProjects.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <div className="text-2xl mb-2">📁</div>
                        <p>검색 결과가 없습니다</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredAndSortedProjects.map((project) => {
                            const stats = getProjectStats(project);
                            const isSelected = project.id === selectedProjectId;

                            return (
                                <div
                                    key={project.id}
                                    onClick={() => onProjectSelect(project)}
                                    className={`p-4 cursor-pointer transition-colors ${isSelected
                                            ? 'bg-blue-50 border-l-4 border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                                    }`}>
                                                    {project.name}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {project.status === 'active' ? '활성' : '보관'}
                                                </span>
                                            </div>

                                            {project.description && (
                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                    {project.description}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>📄 {stats.files}개 파일</span>
                                                <span>💬 {stats.messages}개 메시지</span>
                                                <span>📋 {stats.guidelines}개 지침</span>
                                                <span>🕒 {formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="text-blue-500 text-sm">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 검색 결과 요약 */}
            {searchTerm && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                    "{searchTerm}" 검색 결과: {filteredAndSortedProjects.length}개 프로젝트
                </div>
            )}
        </div>
    );
};

export default ProjectSearch;
