import React, { useState, useEffect } from 'react';
import { ChatSession } from './types/chat';
import { Project } from './types/project';
import UnifiedChatInterface from './components/UnifiedChatInterface';
import Sidebar from './components/Sidebar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProjectFileManager from './components/ProjectFileManager';
import GaepoSungAnalysis from './components/GaepoSungAnalysis';
import NewProjectModal from './components/NewProjectModal';
import NotificationSystem from './components/NotificationSystem';
import SystemMonitor from './components/SystemMonitor';
import ConstructionCompanyBiasAnalysis from './components/ConstructionCompanyBiasAnalysis';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import AdvancedImageAnalysis from './components/AdvancedImageAnalysis';
import chatSessionService from './services/chatSessionService';
import projectService from './services/projectService';
import './App.css';

// 앱 상태 타입 정의
type AppView = 'chat' | 'new-project';

const App: React.FC = () => {
  // 기본 상태 관리
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // UI 상태 관리
  const [currentView, setCurrentView] = useState<AppView>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSystemMonitor, setShowSystemMonitor] = useState(false);

  // 앱 초기화 함수
  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 앱 초기화 시작...');

      // 프로젝트 로드
      const projects = await projectService.loadProjects();
      console.log('📁 로드된 프로젝트:', projects.length);

      if (projects.length > 0) {
        setCurrentProject(projects[0]);
        console.log('✅ 프로젝트 선택됨:', projects[0].name);
      } else {
        console.log('📝 프로젝트가 없습니다. 새 프로젝트를 생성해주세요.');
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'info',
            title: '프로젝트 생성',
            message: '첫 번째 프로젝트를 생성해보세요!',
            duration: 5000
          });
        }
      }

      // 세션 로드
      const sessions = await chatSessionService.loadAllChatSessions();
      const sessionList = Object.values(sessions);
      console.log('💬 로드된 세션:', sessionList.length);

      if (sessionList.length > 0) {
        setCurrentSession(sessionList[0]);
        console.log('✅ 세션 선택됨:', sessionList[0].title);
      } else {
        // 기본 세션 생성
        console.log('🆕 기본 세션 생성 중...');
        const defaultSession = await chatSessionService.createChatSession();
        setCurrentSession(defaultSession);
        console.log('✅ 기본 세션 생성 완료:', defaultSession.title);
      }

      // 상태 업데이트
      setProjects(projects.length > 0 ? projects : [currentProject!]);
      setSessions(sessionList.length > 0 ? sessionList : [currentSession!]);

      console.log('🎉 앱 초기화 완료');

      // 성공 알림 표시
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'success',
          title: 'CORBU.AI 준비 완료',
          message: '지능형 AI 분석 플랫폼이 성공적으로 시작되었습니다.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('❌ 앱 초기화 오류:', error);
      setError('앱 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');

      // 에러 알림 표시
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: '초기화 실패',
          message: '시스템 초기화 중 오류가 발생했습니다.',
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeApp();
  }, []);

  // 새 세션 생성
  const handleNewSession = async () => {
    try {
      console.log('🆕 새 세션 생성 중...');
      const newSession = await chatSessionService.createChatSession();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      console.log('✅ 새 세션 생성 완료:', newSession.title);

      // 성공 알림
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'success',
          title: '새 대화 생성',
          message: '새로운 대화가 시작되었습니다.',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('❌ 새 세션 생성 실패:', error);
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: '세션 생성 실패',
          message: '새 대화를 생성할 수 없습니다.',
          duration: 3000
        });
      }
    }
  };

  // 세션 선택
  const handleSessionSelect = (session: ChatSession) => {
    console.log('💬 세션 선택:', session.title);
    setCurrentSession(session);
    setCurrentView('chat');
  };

  // 세션 삭제
  const handleSessionDelete = async (sessionId: string) => {
    try {
      await chatSessionService.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      // 현재 세션이 삭제된 경우 첫 번째 세션 선택
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0]);
        } else {
          // 세션이 없으면 새로 생성
          const newSession = await chatSessionService.createChatSession();
          setCurrentSession(newSession);
          setSessions([newSession]);
        }
      }

      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'success',
          title: '대화 삭제',
          message: '대화가 삭제되었습니다.',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('❌ 세션 삭제 실패:', error);
    }
  };

  // 프로젝트 선택
  const handleProjectSelect = (project: Project) => {
    console.log('📁 프로젝트 선택:', project.name);
    setCurrentProject(project);
  };

  // 새 프로젝트 생성
  const handleCreateProject = async (projectName: string, instructions?: string, files?: any[]) => {
    try {
      console.log('🆕 새 프로젝트 생성 중...');
      const newProject = await projectService.createProject(projectName, instructions || '');

      // 파일이 있는 경우 파일 업로드 처리
      if (files && files.length > 0) {
        console.log('📁 파일 업로드 처리 중...', files.length, '개 파일');
        // 여기서 파일 업로드 로직을 추가할 수 있습니다
      }
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      setShowNewProjectModal(false);

      // 프로젝트 생성 후 자동으로 새 채팅 세션 생성
      const newSession = await chatSessionService.createChatSession(`새로운 ${projectName} 분석`);
      setSessions(prev => [...prev, newSession]);
      setCurrentSession(newSession);
      setCurrentView('chat');
      console.log('✅ 새 프로젝트 생성 완료:', newProject.name);

      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'success',
          title: '프로젝트 생성 완료',
          message: `프로젝트 "${projectName}"이 생성되었습니다. 새 채팅 세션이 자동으로 시작됩니다.`,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('❌ 프로젝트 생성 실패:', error);
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: '프로젝트 생성 실패',
          message: '프로젝트를 생성할 수 없습니다.',
          duration: 3000
        });
      }
    }
  };

  // 뷰 변경 핸들러
  const handleViewChange = (view: AppView) => {
    console.log('🔄 뷰 변경:', view);
    if (view === 'new-project') {
      setShowNewProjectModal(true);
    } else {
      setCurrentView(view);
    }
  };

  // 시스템 모니터 토글
  const toggleSystemMonitor = () => {
    setShowSystemMonitor(!showSystemMonitor);
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>개포우성7차 분석 시스템을 시작하는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="app-error">
        <div className="error-container">
          <h2>❌ 시스템 오류</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={initializeApp}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 메인 앱 렌더링
  return (
    <div className="app">
      {/* 사이드바 */}
      <Sidebar
        currentSession={currentSession}
        currentProject={currentProject}
        sessions={sessions}
        projects={projects}
        onNewSession={handleNewSession}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={handleSessionDelete}
        onProjectSelect={handleProjectSelect}
        onViewChange={handleViewChange}
        onToggleMonitor={toggleSystemMonitor}
        showSystemMonitor={showSystemMonitor}
      />

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {/* 헤더 */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-brand">
              <div className="logo">
                <span className="logo-icon">🤖</span>
                <h1>CORBU.AI</h1>
              </div>
              <span className="brand-subtitle">지능형 AI 분석 플랫폼</span>
            </div>
            <div className="header-actions">
              <span className="header-status">✅ 모든 기능이 통합된 CORBU.AI 시스템</span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <div className="content-area">
          {currentView === 'chat' && currentSession && (
            <UnifiedChatInterface
              currentSession={currentSession}
              currentProject={currentProject}
            />
          )}
        </div>
      </div>

      {/* 새 프로젝트 모달 */}
      {showNewProjectModal && (
        <NewProjectModal
          isVisible={true}
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* 알림 시스템 */}
      <NotificationSystem />
    </div>
  );
};

export default App;