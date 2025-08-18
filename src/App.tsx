import React, { useState, useEffect } from 'react';
import './App.css';
import { Project } from './types/project';
import projectService from './services/projectService';
import ChatGPTStyleInterface from './components/ChatGPTStyleInterface';
import Sidebar from './components/Sidebar';
import NotificationContainer from './components/NotificationContainer';
import LoadingSpinner from './components/LoadingSpinner';
import OfflineIndicator from './components/OfflineIndicator';
import SystemMonitor from './components/SystemMonitor';

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSystemMonitor, setShowSystemMonitor] = useState(false);

  // 프로젝트 목록 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await projectService.loadProjects();
        setProjects(projectList);

        // 첫 번째 프로젝트를 기본으로 선택
        if (projectList.length > 0 && !currentProject) {
          setCurrentProject(projectList[0]);
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [currentProject]);

  const handleProjectChange = (project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      // 프로젝트 목록 업데이트
      setProjects(prev => {
        const existingIndex = prev.findIndex(p => p.id === project.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = project;
          return updated;
        } else {
          return [...prev, project];
        }
      });
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" text="CORBU AI 초기화 중..." />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">CORBU AI</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">지능형 AI 분석 플랫폼</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 오프라인 인디케이터 */}
      <OfflineIndicator />

      {/* 사이드바 */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm">
        <Sidebar
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          onProjectChange={handleProjectChange}
          onSystemMonitorToggle={() => setShowSystemMonitor(!showSystemMonitor)}
          showSystemMonitor={showSystemMonitor}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {showSystemMonitor ? (
          <SystemMonitor />
        ) : (
          <ChatGPTStyleInterface
            currentProject={currentProject}
            onProjectChange={handleProjectChange}
          />
        )}
      </div>

      {/* 알림 시스템 */}
      <NotificationContainer />
    </div>
  );
}

export default App;