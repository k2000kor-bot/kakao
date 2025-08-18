import React, { useState } from 'react';
import { Project } from '../types/project';

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (projectId: string) => void;
  onProjectChange: (project: Project | null) => void;
  onSystemMonitorToggle?: () => void;
  showSystemMonitor?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentProject,
  onProjectSelect,
  onProjectChange,
  onSystemMonitorToggle,
  showSystemMonitor = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="text-2xl">🤖</div>
          <h1 className="text-lg font-semibold">CORBU AI</h1>
        </div>

        {/* 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 새 프로젝트 */}
        <div className="mb-6">
          <button
            onClick={() => onProjectChange(null)}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>새 프로젝트</span>
          </button>
        </div>

        {/* 프로젝트 목록 */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">프로젝트</h3>
          <div className="space-y-1">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${currentProject?.id === project.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-gray-500 truncate">{project.description}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(project.createdAt)}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 px-3 py-2">
                {searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
              </div>
            )}
          </div>
        </div>

        {/* 시스템 도구 */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">시스템 도구</h3>
          <div className="space-y-1">
            <button
              onClick={onSystemMonitorToggle}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${showSystemMonitor
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>시스템 모니터링</span>
            </button>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">빠른 액션</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>문장 표현 만들기</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>개포동 아파트 시세</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>개포우성7차 이주비 분석</span>
            </button>
          </div>
        </div>
      </div>

      {/* 사용자 프로필 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">K</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">KIM HOBUM</div>
            <div className="text-xs text-gray-500">Plus</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
