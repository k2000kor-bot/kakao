import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  PlusIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Project } from '../types/chat';

interface ProjectSelectorProps {
  selectedProject?: Project;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: () => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectSelect,
  onProjectCreate
}) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '개포우성_실명방',
      description: '개포우성 재개발 프로젝트 실명 채팅방',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-08-03T17:50:00Z',
      status: 'active',
      files: [
        {
          id: '1',
          name: '[인증]행복한소유☆개포우성7차.txt',
          type: 'document',
          size: 1024 * 50,
          uploadedAt: '2025-08-03T10:00:00Z',
          uploadedBy: 'user1',
          path: '/files/개포우성7차.txt',
          tags: ['인증', '실명방', '개포우성'],
          learningStatus: 'completed',
          classification: {
            category: '문서',
            subcategory: '채팅',
            confidence: 0.95,
            keywords: ['개포우성', '실명방', '인증'],
            topics: ['재개발', '채팅'],
            sentiment: 'neutral',
            language: 'ko',
            documentType: 'chat',
            priority: 'high'
          },
          learningProgress: 100
        }
      ],
      guidelines: [
        {
          id: '1',
          title: '개포우성 0000대화 요약',
          content: '2025년 00월 00일 오후 8시 이후 ~ 00월 00일 기준',
          category: 'specific',
          createdAt: '2025-08-03T00:00:00Z',
          updatedAt: '2025-08-03T00:00:00Z',
          isActive: true
        }
      ],
      conversations: [
        {
          id: '1',
          title: '시공사 홍보 논란',
          dateRange: { start: '2025-07-14T00:00:00Z', end: '2025-07-14T23:59:59Z' },
          participants: ['이재헌', '박재우', '박은진', '정지혜'],
          keyTopics: ['시공사 평가', '홍보 활동', '조합원 의견'],
          summary: 'GS건설과 삼성물산의 개별 홍보 활동 논란 지속',
          createdAt: '2025-07-14T20:00:00Z'
        }
      ],
      members: ['user1', 'user2', 'user3'],
      settings: {
        autoSummarize: true,
        enableVoiceInput: true,
        enableFileUpload: true,
        maxFileSize: 10 * 1024 * 1024 * 1024 // 10GB (매우 큰 값으로 설정)
      }
    },
    {
      id: '2',
      name: '잠실우성_프로젝트',
      description: '잠실우성 재개발 프로젝트',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-08-03T16:30:00Z',
      status: 'active',
      files: [],
      guidelines: [],
      conversations: [
        {
          id: '2',
          title: '잠실우성 대화 요약',
          dateRange: { start: '2025-07-12T00:00:00Z', end: '2025-07-14T23:59:59Z' },
          participants: ['김철수', '이영희'],
          keyTopics: ['재개발', '조합원'],
          summary: '잠실우성 재개발 관련 대화 요약',
          createdAt: '2025-07-14T18:00:00Z'
        }
      ],
      members: ['user4', 'user5'],
      settings: {
        autoSummarize: true,
        enableVoiceInput: true,
        enableFileUpload: true,
        maxFileSize: 10 * 1024 * 1024 * 1024 // 10GB (매우 큰 값으로 설정)
      }
    }
  ]);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <ArchiveBoxIcon className="w-4 h-4 text-gray-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'archived':
        return '보관';
      case 'completed':
        return '완료';
      default:
        return '대기';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">프로젝트</h2>
        <button
          onClick={onProjectCreate}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">새 프로젝트</span>
        </button>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedProject?.id === project.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FolderIcon className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">{project.name}</span>
                {getStatusIcon(project.status)}
              </div>
              <span className="text-xs text-gray-500">{getStatusText(project.status)}</span>
            </div>

            <p className="text-sm text-gray-600 mb-2">{project.description}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="w-3 h-3" />
                <span>{project.files.length} 파일</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftRightIcon className="w-3 h-3" />
                <span>{project.conversations.length} 대화</span>
              </div>
              <div className="flex items-center space-x-1">
                <CogIcon className="w-3 h-3" />
                <span>{project.guidelines.length} 지침</span>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-400">
              최근 업데이트: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSelector; 