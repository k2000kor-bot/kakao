import React, { useState } from 'react';
import { ChatSession } from '../types/chat';
import { Project } from '../types/project';
import ConnectionStatus from './ConnectionStatus';
import SystemMonitor from './SystemMonitor';

interface SidebarProps {
  currentSession: ChatSession | null;
  currentProject: Project | null;
  sessions: ChatSession[];
  projects: Project[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
  onProjectSelect: (project: Project) => void;
  onNewSession: () => void;
  onViewChange: (view: 'chat' | 'new-project') => void;
  onToggleMonitor: () => void;
  showSystemMonitor: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentSession,
  currentProject,
  sessions,
  projects,
  onSessionSelect,
  onSessionDelete,
  onProjectSelect,
  onNewSession,
  onViewChange,
  onToggleMonitor,
  showSystemMonitor
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="sidebar">
      {/* 검색바 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="대화 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 새 대화 버튼 */}
      <div className="new-chat-section">
        <button onClick={onNewSession} className="new-chat-button">
          ✨ 새 대화
        </button>
      </div>

      {/* 프로젝트 섹션 */}
      <div className="project-section">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">📁</span>
            <span>프로젝트</span>
          </div>
          <button
            onClick={() => onViewChange('new-project')}
            className="new-project-button"
            title="새 프로젝트"
          >
            ➕
          </button>
        </div>
        <div className="project-list">
          {projects.length > 0 ? (
            projects.map(project => (
              <div
                key={project.id}
                className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                onClick={() => onProjectSelect(project)}
              >
                <div className="project-item-header">
                  <span className="project-icon">📁</span>
                  <span className="project-name">{project.name}</span>
                </div>
                <span className="project-description">{project.description}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>프로젝트가 없습니다</p>
              <p>새 프로젝트를 생성해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 정보 */}
      {currentProject && (
        <div className="project-info">
          <div className="project-header">
            <h3>📁 현재 프로젝트</h3>
          </div>
          <div className="project-details">
            <h4>{currentProject.name}</h4>
            <p>{currentProject.description}</p>
            <div className="project-stats">
              <span>📊 모든 기능이 통합된 채팅에서 사용 가능</span>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 섹션 */}
      <div className="chat-section">
        <div className="section-header">
          <span className="section-icon">💬</span>
          <span>대화</span>
        </div>
        <div className="chat-list">
          {filteredSessions.length > 0 ? (
            filteredSessions.map(session => (
              <div
                key={session.id}
                className={`chat-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="chat-info">
                  <span className="chat-title">{session.title}</span>
                  <span className="chat-date">{formatDate(session.createdAt)}</span>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                  title="대화 삭제"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>대화가 없습니다</p>
              <p>새 대화를 시작해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 연결 상태 */}
      <ConnectionStatus className="sidebar-connection" />

      {/* 시스템 모니터 */}
      {showSystemMonitor && (
        <SystemMonitor className="sidebar-monitor" />
      )}

      {/* 사이드바 푸터 */}
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">CORBU.AI</span>
          <span className="user-role">AI 분석 플랫폼</span>
        </div>
        <button
          onClick={onToggleMonitor}
          className="monitor-toggle"
        >
          {showSystemMonitor ? '📊' : '📈'} 시스템 모니터
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
