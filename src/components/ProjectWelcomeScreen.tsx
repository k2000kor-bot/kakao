import React from 'react';
import {
    FolderIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    CogIcon,
    PlusIcon,
    ArrowRightIcon,
    CalendarIcon,
    UserGroupIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { Project } from '../types/chat';

interface ProjectWelcomeScreenProps {
    project: Project;
    onStartChat: () => void;
    onViewFiles: () => void;
    onViewGuidelines: () => void;
    onViewConversations: () => void;
    onProjectSettings: () => void;
}

const ProjectWelcomeScreen: React.FC<ProjectWelcomeScreenProps> = ({
    project,
    onStartChat,
    onViewFiles,
    onViewGuidelines,
    onViewConversations,
    onProjectSettings
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
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
        <div className="h-full bg-gray-50 overflow-y-auto">
            {/* 프로젝트 헤더 */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <p className="text-gray-600">{project.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                        </span>
                        <button
                            onClick={onProjectSettings}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="프로젝트 설정"
                        >
                            <CogIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{project.files.length}</div>
                        <div className="text-gray-600">파일</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{project.conversations.length}</div>
                        <div className="text-gray-600">대화</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{project.guidelines.length}</div>
                        <div className="text-gray-600">지침</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{project.members.length}</div>
                        <div className="text-gray-600">멤버</div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="p-6 space-y-6">
                {/* 새 채팅 시작 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">새 채팅 시작</h2>
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-gray-600 mb-4">
                        {project.name}에서 새로운 대화를 시작하세요. AI가 프로젝트 컨텍스트를 이해하고 도움을 드립니다.
                    </p>
                    <button
                        onClick={onStartChat}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>채팅 시작</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* 프로젝트 파일 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">프로젝트 파일</h2>
                        <button
                            onClick={onViewFiles}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                            모두 보기
                        </button>
                    </div>
                    {project.files.length > 0 ? (
                        <div className="space-y-3">
                            {project.files.slice(0, 3).map((file) => (
                                <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(file.uploadedAt).toLocaleDateString('ko-KR')} • {file.type}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {project.files.length > 3 && (
                                <p className="text-sm text-gray-500 text-center">
                                    +{project.files.length - 3}개 더 보기
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>업로드된 파일이 없습니다.</p>
                            <p className="text-sm">파일을 추가하여 프로젝트를 시작하세요.</p>
                        </div>
                    )}
                </div>

                {/* 지침 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">지침</h2>
                        <button
                            onClick={onViewGuidelines}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                            모두 보기
                        </button>
                    </div>
                    {project.guidelines.length > 0 ? (
                        <div className="space-y-3">
                            {project.guidelines.slice(0, 3).map((guideline) => (
                                <div key={guideline.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CogIcon className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-900">{guideline.title}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{guideline.content}</p>
                                </div>
                            ))}
                            {project.guidelines.length > 3 && (
                                <p className="text-sm text-gray-500 text-center">
                                    +{project.guidelines.length - 3}개 더 보기
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <CogIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>등록된 지침이 없습니다.</p>
                            <p className="text-sm">프로젝트 지침을 추가하세요.</p>
                        </div>
                    )}
                </div>

                {/* 최근 대화 요약 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">최근 대화 요약</h2>
                        <button
                            onClick={onViewConversations}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                            모두 보기
                        </button>
                    </div>
                    {project.conversations.length > 0 ? (
                        <div className="space-y-3">
                            {project.conversations.slice(0, 3).map((conversation) => (
                                <div key={conversation.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-900">{conversation.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                        <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            <span>{new Date(conversation.dateRange.start).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <UserGroupIcon className="w-3 h-3" />
                                            <span>{conversation.participants.length}명</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{conversation.summary}</p>
                                </div>
                            ))}
                            {project.conversations.length > 3 && (
                                <p className="text-sm text-gray-500 text-center">
                                    +{project.conversations.length - 3}개 더 보기
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>대화 요약이 없습니다.</p>
                            <p className="text-sm">첫 대화를 시작해보세요.</p>
                        </div>
                    )}
                </div>

                {/* 프로젝트 정보 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">생성일:</span>
                            <p className="font-medium">{formatDate(project.createdAt)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">최근 업데이트:</span>
                            <p className="font-medium">{formatDate(project.updatedAt)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">상태:</span>
                            <p className="font-medium">{getStatusText(project.status)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">멤버 수:</span>
                            <p className="font-medium">{project.members.length}명</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectWelcomeScreen; 