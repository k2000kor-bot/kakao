import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  LightBulbIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import ProjectKnowledgeManager from './ProjectKnowledgeManager';
import MessageGuidanceSystem from './MessageGuidanceSystem';
import KnowledgeBasedMessageGenerator from './KnowledgeBasedMessageGenerator';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  documents: any[];
  guidelines: any[];
  knowledgeBases: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IntegratedProjectDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'knowledge' | 'guidance' | 'generator'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    if (project.knowledgeBases.length > 0) {
      setSelectedKnowledgeBase(project.knowledgeBases[0]);
    }
  };

  const handleMessageGenerated = (message: string) => {
    console.log('생성된 메시지:', message);
    // 여기서 메시지를 채팅이나 다른 곳에 전달할 수 있습니다
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">13</span>
                    프로젝트 지식 관리 시스템
                  </h1>
                  <p className="text-sm text-gray-600">AI 기반 프로젝트 이해 및 메시지 가이드</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                대시보드
              </button>
              <button
                onClick={() => setActiveView('knowledge')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeView === 'knowledge'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                지식 관리
              </button>
              <button
                onClick={() => setActiveView('guidance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeView === 'guidance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                메시지 가이드
              </button>
              <button
                onClick={() => setActiveView('generator')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeView === 'generator'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                메시지 생성
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'dashboard' && (
          <DashboardView
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        )}

        {activeView === 'knowledge' && (
          <ProjectKnowledgeManager
            selectedProject={selectedProject || undefined}
            onProjectChange={handleProjectChange}
          />
        )}

        {activeView === 'guidance' && (
          <MessageGuidanceSystem
            projectId={selectedProject?.id}
            knowledgeBaseId={selectedKnowledgeBase}
            onMessageGenerated={handleMessageGenerated}
          />
        )}

        {activeView === 'generator' && (
          <KnowledgeBasedMessageGenerator
            onMessageGenerated={handleMessageGenerated}
          />
        )}
      </div>
    </div>
  );
};

// 대시보드 뷰 컴포넌트
const DashboardView: React.FC<{
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}> = ({ selectedProject, onProjectSelect }) => {
  const [recentActivities] = useState([
    {
      id: '1',
      type: 'document_upload',
      title: '새 문서 업로드',
      description: '우성7차_제안서.pdf',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: DocumentTextIcon
    },
    {
      id: '2',
      type: 'guideline_created',
      title: '새 지침 생성',
      description: '안전 관리 지침',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: LightBulbIcon
    },
    {
      id: '3',
      type: 'message_generated',
      title: '메시지 생성',
      description: '고객 응대 메시지',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      icon: AcademicCapIcon
    }
  ]);

  const stats = {
    totalProjects: 3,
    totalDocuments: 45,
    totalGuidelines: 12,
    activeKnowledgeBases: 2,
    messagesGenerated: 28,
    averageResponseTime: '2.3초'
  };

  return (
    <div className="p-6 space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              <p className="text-sm text-gray-600">프로젝트</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              <p className="text-sm text-gray-600">문서</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LightBulbIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGuidelines}</p>
              <p className="text-sm text-gray-600">지침</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.messagesGenerated}</p>
              <p className="text-sm text-gray-600">생성된 메시지</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로젝트 선택 */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 선택</h3>

            {selectedProject ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedProject.name}</h4>
                  <p className="text-sm text-blue-700 mt-1">{selectedProject.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-blue-600">
                    <span>{selectedProject.documents.length} 문서</span>
                    <span>{selectedProject.guidelines.length} 지침</span>
                  </div>
                </div>

                <button
                  onClick={() => onProjectSelect(null)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  다른 프로젝트 선택
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => onProjectSelect({
                    id: 'proj_1',
                    name: '우성7차 아파트 프로젝트',
                    description: '우성7차 아파트 관련 모든 문서와 지식 관리',
                    category: '건설',
                    documents: [],
                    guidelines: [],
                    knowledgeBases: ['kb_1'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                  })}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">프로젝트를 선택하세요</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>

            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <activity.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {/* 문서 업로드 모달 */ }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">문서 업로드</p>
              <p className="text-xs text-gray-600">새 문서 추가</p>
            </div>
          </button>

          <button
            onClick={() => {/* 지침 생성 모달 */ }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <LightBulbIcon className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">지침 생성</p>
              <p className="text-xs text-gray-600">새 지침 추가</p>
            </div>
          </button>

          <button
            onClick={() => {/* 메시지 생성 */ }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <AcademicCapIcon className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">메시지 생성</p>
              <p className="text-xs text-gray-600">AI 기반 메시지</p>
            </div>
          </button>

          <button
            onClick={() => {/* 분석 보고서 */ }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
          >
            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">분석 보고서</p>
              <p className="text-xs text-gray-600">프로젝트 분석</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegratedProjectDashboard; 