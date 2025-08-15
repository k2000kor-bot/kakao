import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CalendarIcon,
  CpuChipIcon,
  LightBulbIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectFile, KnowledgeBase } from '../types/project';
import { clientFileProcessor } from '../services/clientFileProcessor';
import { AILearningService } from '../services/aiLearningService';

interface ProjectDashboardProps {
  project: Project;
  onNavigateToSection: (section: string) => void;
}

interface DashboardStats {
  totalFiles: number;
  totalMessages: number;
  totalKnowledge: number;
  completionRate: number;
  recentActivity: number;
  pendingTasks: number;
  aiLearningSessions: number;
  knowledgeBaseItems: number;
  writingMaterials: number;
  averageConfidence: number;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  onNavigateToSection
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    totalMessages: 0,
    totalKnowledge: 0,
    completionRate: 0,
    recentActivity: 0,
    pendingTasks: 0,
    aiLearningSessions: 0,
    knowledgeBaseItems: 0,
    writingMaterials: 0,
    averageConfidence: 0
  });

  const [recentFiles, setRecentFiles] = useState<ProjectFile[]>([]);
  const [recentKnowledge, setRecentKnowledge] = useState<KnowledgeBase[]>([]);
  const [aiLearningSessions, setAiLearningSessions] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const [writingMaterials, setWritingMaterials] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // AI 학습 세션 로드
        const aiLearningService = AILearningService.getInstance();
        const sessions = aiLearningService.getProjectLearningSessions(project.id);
        setAiLearningSessions(sessions || []);

        // 지식 베이스 로드
        const kb = clientFileProcessor.getKnowledgeBase(project.id);
        setKnowledgeBase(kb);

        // 글쓰기 소재 로드
        const materials = clientFileProcessor.getWritingMaterials(project.id);
        setWritingMaterials(materials || []);

        // 통계 계산
        const totalFiles = project.files.length;
        const totalMessages = project.chats.reduce((sum, chat) => sum + chat.messages.length, 0);
        const totalKnowledge = kb?.totalKnowledgeItems || 0;
        const aiLearningSessionsCount = sessions?.length || 0;
        const knowledgeBaseItems = kb?.keyConcepts?.length || 0;
        const writingMaterialsCount = materials?.length || 0;

        // 완성도 계산 (파일, 지식, AI 학습 기반)
        const completionRate = Math.min(100, Math.round(
          (totalFiles * 20 + totalKnowledge * 30 + aiLearningSessionsCount * 25) / 3
        ));

        // 최근 활동 (7일 내)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = project.files.filter(file =>
          new Date(file.uploadedAt) > sevenDaysAgo
        ).length;

        // 대기 중인 작업
        const pendingTasks = Math.max(0, 5 - totalFiles);

        // 평균 신뢰도 계산
        const averageConfidence = sessions && sessions.length > 0
          ? sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length * 100
          : 0;

        setStats({
          totalFiles,
          totalMessages,
          totalKnowledge,
          completionRate,
          recentActivity,
          pendingTasks,
          aiLearningSessions: aiLearningSessionsCount,
          knowledgeBaseItems,
          writingMaterials: writingMaterialsCount,
          averageConfidence
        });
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      }
    };

    loadDashboardData();
  }, [project]);

  useEffect(() => {
    // 최근 파일 (최근 5개)
    setRecentFiles(project.files.slice(0, 5));

    // 최근 지식 (최근 3개)
    const recentGuidelines = project.guidelines.slice(0, 3).map(guideline => ({
      id: guideline.id,
      title: guideline.title,
      content: guideline.content,
      type: 'reference' as const,
      tags: [guideline.category],
      aiGenerated: false,
      confidence: 1.0,
      source: 'project',
      relatedFiles: [],
      usage: 0,
      lastAccessed: guideline.updatedAt,
      documents: [],
      guidelines: [],
      logicRules: [],
      createdAt: guideline.createdAt.toString(),
      updatedAt: guideline.updatedAt.toString()
    }));
    setRecentKnowledge(recentGuidelines);
  }, [project]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon className="w-5 h-5 text-blue-500" />;
      case 'spreadsheet': return <DocumentIcon className="w-5 h-5 text-green-500" />;
      case 'image': return <DocumentIcon className="w-5 h-5 text-purple-500" />;
      case 'video': return <DocumentIcon className="w-5 h-5 text-red-500" />;
      case 'audio': return <DocumentIcon className="w-5 h-5 text-yellow-500" />;
      default: return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 프로젝트 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>생성: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4" />
            <span>수정: {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4" />
            <span>참여자: {project.chats.length}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>메시지: {stats.totalMessages}개</span>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 파일</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalFiles}</p>
            </div>
            <DocumentIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.recentActivity} 이번 주</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI 학습</p>
              <p className="text-2xl font-bold text-green-600">{stats.aiLearningSessions}</p>
            </div>
            <CpuChipIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">평균 신뢰도: {stats.averageConfidence.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">지식 베이스</p>
              <p className="text-2xl font-bold text-purple-600">{stats.knowledgeBaseItems}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">총 지식: {stats.totalKnowledge}개</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">글쓰기 소재</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.writingMaterials}</p>
            </div>
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">생성된 소재</span>
            </div>
          </div>
        </div>
      </div>

      {/* 완성도 및 진행 상황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">프로젝트 완성도</h3>
            <span className="text-2xl font-bold text-green-600">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">파일 업로드</p>
              <p className="font-medium">{stats.totalFiles}개</p>
            </div>
            <div>
              <p className="text-gray-600">AI 분석</p>
              <p className="font-medium">{stats.aiLearningSessions}회</p>
            </div>
            <div>
              <p className="text-gray-600">지식 추출</p>
              <p className="font-medium">{stats.knowledgeBaseItems}개</p>
            </div>
            <div>
              <p className="text-gray-600">대기 작업</p>
              <p className="font-medium">{stats.pendingTasks}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigateToSection('files')}
              className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <DocumentIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">파일 업로드</span>
              </div>
              <span className="text-xs text-blue-600">→</span>
            </button>
            <button
              onClick={() => onNavigateToSection('ai-learning')}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CpuChipIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">AI 학습 시작</span>
              </div>
              <span className="text-xs text-green-600">→</span>
            </button>
            <button
              onClick={() => onNavigateToSection('knowledge-base')}
              className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">지식 베이스 확인</span>
              </div>
              <span className="text-xs text-purple-600">→</span>
            </button>
            <button
              onClick={() => onNavigateToSection('chats')}
              className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">AI 채팅</span>
              </div>
              <span className="text-xs text-yellow-600">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 최근 활동 및 대기 작업 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 파일 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 파일</h3>
            <button
              onClick={() => onNavigateToSection('files')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              모두 보기
            </button>
          </div>

          {recentFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>업로드된 파일이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 대기 작업 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">대기 작업</h3>
            <span className="text-sm text-gray-500">{stats.pendingTasks}개 남음</span>
          </div>

          <div className="space-y-3">
            {stats.pendingTasks > 0 ? (
              <>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">파일 업로드 필요</p>
                    <p className="text-xs text-gray-500">분석할 파일을 업로드해주세요</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI 학습 세션</p>
                    <p className="text-xs text-gray-500">업로드된 파일로 AI 학습을 시작하세요</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">지식 베이스 구축</p>
                    <p className="text-xs text-gray-500">분석 결과를 지식으로 저장하세요</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-300" />
                <p>모든 작업이 완료되었습니다!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
