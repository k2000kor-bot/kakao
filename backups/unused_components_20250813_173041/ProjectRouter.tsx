import React, { useState, useEffect } from 'react';
import ProjectDetailPage from './ProjectDetailPage';
import ProjectListPage from './ProjectListPage';
import { Project } from '../types/project';

interface ProjectRouterProps {
  initialProjects?: Project[];
}

const ProjectRouter: React.FC<ProjectRouterProps> = ({ initialProjects = [] }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');

  // 샘플 프로젝트 데이터
  useEffect(() => {
    if (projects.length === 0) {
      const sampleProjects: Project[] = [
        {
          id: '1',
          name: '개포우성 7차 재개발 프로젝트',
          description: '개포우성 7차 재개발 사업의 진행 상황 및 문서 관리',
          status: 'active',
          priority: 'high',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-20',
          messageCount: 45,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 45,
            totalFiles: 12,
            totalGuidelines: 8,
            activeChats: 3,
            participants: 15,
            activityTrend: [
              { date: '2024-01-18', messages: 5, files: 2 },
              { date: '2024-01-19', messages: 8, files: 3 },
              { date: '2024-01-20', messages: 12, files: 4 }
            ],
            topTopics: [
              { topic: '재개발 계획', count: 15, percentage: 33 },
              { topic: '주민 의견', count: 12, percentage: 27 },
              { topic: '시공사 선정', count: 8, percentage: 18 }
            ],
            sentimentAnalysis: { positive: 25, neutral: 15, negative: 5 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['재개발', '주거', '개포우성']
        },
        {
          id: '2',
          name: 'AI 학습 시스템 개발',
          description: '머신러닝 기반 학습 플랫폼 개발 프로젝트',
          status: 'active',
          priority: 'medium',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          messageCount: 32,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 32,
            totalFiles: 8,
            totalGuidelines: 5,
            activeChats: 2,
            participants: 8,
            activityTrend: [
              { date: '2024-01-18', messages: 3, files: 1 },
              { date: '2024-01-19', messages: 6, files: 2 },
              { date: '2024-01-20', messages: 9, files: 3 }
            ],
            topTopics: [
              { topic: '알고리즘 개발', count: 12, percentage: 38 },
              { topic: '데이터 전처리', count: 8, percentage: 25 },
              { topic: '모델 평가', count: 6, percentage: 19 }
            ],
            sentimentAnalysis: { positive: 20, neutral: 10, negative: 2 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['AI', '머신러닝', '개발']
        },
        {
          id: '3',
          name: '마케팅 캠페인 분석',
          description: '2024년 1분기 마케팅 캠페인 성과 분석 및 개선안 도출',
          status: 'completed',
          priority: 'medium',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-19',
          messageCount: 28,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 28,
            totalFiles: 15,
            totalGuidelines: 3,
            activeChats: 1,
            participants: 12,
            activityTrend: [
              { date: '2024-01-17', messages: 4, files: 2 },
              { date: '2024-01-18', messages: 7, files: 4 },
              { date: '2024-01-19', messages: 5, files: 3 }
            ],
            topTopics: [
              { topic: 'ROI 분석', count: 10, percentage: 36 },
              { topic: '고객 반응', count: 8, percentage: 29 },
              { topic: '캠페인 개선', count: 6, percentage: 21 }
            ],
            sentimentAnalysis: { positive: 18, neutral: 8, negative: 2 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['마케팅', '분석', '캠페인']
        },
        {
          id: '4',
          name: '신제품 출시 준비',
          description: '2024년 상반기 신제품 출시를 위한 준비 작업',
          status: 'active',
          priority: 'high',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-18',
          messageCount: 56,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 56,
            totalFiles: 22,
            totalGuidelines: 12,
            activeChats: 4,
            participants: 20,
            activityTrend: [
              { date: '2024-01-16', messages: 8, files: 3 },
              { date: '2024-01-17', messages: 12, files: 5 },
              { date: '2024-01-18', messages: 15, files: 7 }
            ],
            topTopics: [
              { topic: '제품 설계', count: 18, percentage: 32 },
              { topic: '생산 계획', count: 15, percentage: 27 },
              { topic: '마케팅 전략', count: 12, percentage: 21 }
            ],
            sentimentAnalysis: { positive: 35, neutral: 18, negative: 3 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['신제품', '출시', '준비']
        },
        {
          id: '5',
          name: '고객 서비스 개선',
          description: '고객 만족도 향상을 위한 서비스 프로세스 개선',
          status: 'active',
          priority: 'low',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-17',
          messageCount: 19,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 19,
            totalFiles: 6,
            totalGuidelines: 4,
            activeChats: 1,
            participants: 6,
            activityTrend: [
              { date: '2024-01-15', messages: 2, files: 1 },
              { date: '2024-01-16', messages: 4, files: 2 },
              { date: '2024-01-17', messages: 3, files: 1 }
            ],
            topTopics: [
              { topic: '고객 피드백', count: 8, percentage: 42 },
              { topic: '서비스 개선', count: 6, percentage: 32 },
              { topic: '팀 교육', count: 3, percentage: 16 }
            ],
            sentimentAnalysis: { positive: 12, neutral: 5, negative: 2 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['고객서비스', '개선', '만족도']
        },
        {
          id: '6',
          name: '재무 분석 보고서',
          description: '2023년 연간 재무 성과 분석 및 2024년 예산 계획',
          status: 'completed',
          priority: 'medium',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-16',
          messageCount: 23,
          files: [],
          guidelines: [],
          chats: [],
          analytics: {
            totalMessages: 23,
            totalFiles: 18,
            totalGuidelines: 2,
            activeChats: 1,
            participants: 10,
            activityTrend: [
              { date: '2024-01-14', messages: 3, files: 2 },
              { date: '2024-01-15', messages: 5, files: 4 },
              { date: '2024-01-16', messages: 4, files: 3 }
            ],
            topTopics: [
              { topic: '수익 분석', count: 9, percentage: 39 },
              { topic: '비용 관리', count: 7, percentage: 30 },
              { topic: '예산 계획', count: 5, percentage: 22 }
            ],
            sentimentAnalysis: { positive: 15, neutral: 6, negative: 2 }
          },
          settings: {
            maxFileSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            autoBackup: true,
            notifications: true
          },
          archived: false,
          tags: ['재무', '분석', '보고서']
        }
      ];
      setProjects(sampleProjects);
    }
  }, [projects.length]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleProjectCreate = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      status: 'active',
      priority: 'medium',
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
        maxFileSize: 10485760,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        autoBackup: true,
        notifications: true
      },
      archived: false,
      tags: []
    };

    setProjects(prev => [newProject, ...prev]);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setCurrentView('list');
    }
  };

  const handleProjectArchive = (projectId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, archived: !p.archived } : p
    ));
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setCurrentView('list');
  };

  if (currentView === 'detail' && selectedProject) {
    return (
      <ProjectDetailPage
        project={selectedProject}
        onBack={handleBackToList}
        onProjectUpdate={handleProjectUpdate}
        onProjectDelete={handleProjectDelete}
        projectList={projects}
        onProjectSelect={(projectId) => {
          const project = projects.find(p => p.id === projectId);
          if (project) setSelectedProject(project);
        }}
      />
    );
  }

  return (
    <ProjectListPage
      projects={projects}
      onProjectSelect={handleProjectSelect}
      onProjectCreate={handleProjectCreate}
      onProjectUpdate={handleProjectUpdate}
      onProjectDelete={handleProjectDelete}
      onProjectArchive={handleProjectArchive}
    />
  );
};

export default ProjectRouter; 