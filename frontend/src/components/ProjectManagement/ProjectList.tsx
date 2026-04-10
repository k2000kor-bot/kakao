/**
 * 프로젝트 목록 컴포넌트 (카드/리스트 뷰)
 * @status 비활성 — backup/UnifiedProjectInterface.tsx.disabled에서만 사용.
 * 현재 프로젝트 목록: ProjectsPage → ProjectHub.
 * @see docs/COMPONENT_ARCHITECTURE.md §3, src/components/ProjectManagement/README.md
 */
import React, { useState } from 'react';
import {
  Plus,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPriorityStyle, getProjectStatusStyle } from '../../styles/themeColors';
import './ProjectList.css';

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

  const getPriorityStyleObj = (p: string) => getPriorityStyle(p);
  const getStatusStyleObj = (s: string) => getProjectStatusStyle(s);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pl-root">
      <div className="pl-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
          <h2 className="pl-title">프로젝트</h2>
          <button type="button" onClick={onProjectCreate} className="bw-btn-primary" aria-label="새 프로젝트 만들기">
            <Plus size={16} aria-hidden /> 새 프로젝트
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <div style={{ flex: 1 }}>
            <input type="text" placeholder="프로젝트 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bw-input" aria-label="프로젝트 검색" style={{ width: '100%' }} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'archived')} className="bw-input" style={{ flex: '0 0 auto', minWidth: 120 }} aria-label="프로젝트 필터">
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="archived">보관됨</option>
          </select>
        </div>
      </div>

      <div className="pl-list">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`pl-item ${selectedProjectId === project.id ? 'selected' : ''}`}
              onClick={() => onProjectSelect(project)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    <Folder size={20} style={{ color: 'var(--accent-info)', flexShrink: 0 }} aria-hidden />
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </h3>
                    <span className="pl-tag" style={getPriorityStyleObj(project.priority)}>
                      {project.priority === 'high' ? '높음' : project.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                    <span className="pl-tag" style={getStatusStyleObj(project.status)}>
                      {project.status === 'active' ? '활성' : project.status === 'completed' ? '완료' : '보관'}
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 'var(--spacing-sm)' }}>
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="pl-tag" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{tag}</span>
                      ))}
                      {project.tags.length > 3 && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>+{project.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageSquare size={12} aria-hidden />
                      <span>{project.messageCount || 0}개 메시지</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={12} aria-hidden />
                      <span>{project.fileCount || 0}개 파일</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} aria-hidden />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === project.id ? null : project.id); }} className="pl-menu-btn" aria-label="프로젝트 메뉴">
                  <MoreVertical size={16} aria-hidden />
                </button>
                <AnimatePresence>
                  {showMenu === project.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bw-card" style={{ position: 'absolute', right: 0, top: 32, minWidth: 192, zIndex: 'var(--z-base)', padding: 'var(--spacing-xs)' }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onProjectEdit(project.id); setShowMenu(null); }} className="pl-menu-item">
                        <Edit size={16} aria-hidden /> 편집
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onProjectArchive(project.id); setShowMenu(null); }} className="pl-menu-item">
                        <Archive size={16} aria-hidden /> {project.status === 'archived' ? '복원' : '보관'}
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onProjectDelete(project.id); setShowMenu(null); }} className="pl-menu-item danger">
                        <Trash2 size={16} aria-hidden /> 삭제
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="pl-empty" role="status" aria-live="polite">
          <Folder size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--spacing-md)', display: 'block' }} aria-hidden />
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>{searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}</p>
          {!searchTerm && (
            <button type="button" onClick={onProjectCreate} style={{ color: 'var(--accent-info)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }} aria-label="첫 번째 프로젝트 만들기">
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
