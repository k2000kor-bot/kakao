import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Folder,
    MessageSquare,
    Bot,
    ArrowLeft,
    Settings,
    FileText,
    BarChart3,
    BookOpen,
    Activity
} from 'lucide-react';
import { Project, Chat } from '../types/project';
import { projectService, chatService } from '../services/projectService';
import ProjectList from './ProjectList';
import ProjectCreateModal from './ProjectCreateModal';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import QuickChatStart from './QuickChatStart';
import AIAnalyticsDashboard from './AIAnalyticsDashboard';
import KnowledgeBaseDashboard from './KnowledgeBaseDashboard';
import CollaborationPanel from './CollaborationPanel';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import WorkflowDashboard from './WorkflowDashboard';

interface ProjectManagementInterfaceProps {
    initialProjectId?: string | null;
}

const ProjectManagementInterface: React.FC<ProjectManagementInterfaceProps> = ({ initialProjectId }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [view, setView] = useState<'projects' | 'chats' | 'chat' | 'knowledge' | 'collaboration' | 'analytics' | 'workflow'>('projects');

    useEffect(() => {
        // 초기 프로젝트 ID가 있으면 해당 프로젝트 로드
        if (initialProjectId && !selectedProject) {
            const project = projectService.getProject(initialProjectId);
            if (project) {
                setSelectedProject(project);
                setView('chats');
            }
        }
    }, [initialProjectId, selectedProject]);

    useEffect(() => {
        // 프로젝트가 선택되면 채팅 목록으로 이동
        if (selectedProject) {
            setView('chats');
        }
    }, [selectedProject]);

    useEffect(() => {
        // 채팅이 선택되면 채팅 인터페이스로 이동
        if (selectedChat) {
            setView('chat');
        }
    }, [selectedChat]);

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setSelectedChat(null);
    };

    const handleNewProject = () => {
        setShowCreateModal(true);
    };

    const handleProjectCreated = (project: Project) => {
        setSelectedProject(project);
        setShowCreateModal(false);
    };

    const handleChatSelect = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleNewChat = () => {
        if (!selectedProject) return;

        const newChat = chatService.createChat(selectedProject.id, '새 채팅');
        setSelectedChat(newChat);
    };

    const handleChatUpdate = () => {
        // 채팅 목록 새로고침
        if (selectedProject) {
            // 강제로 리렌더링을 위해 상태 업데이트
            setSelectedProject({ ...selectedProject });
        }
    };

    const handleBackToProjects = () => {
        setSelectedProject(null);
        setSelectedChat(null);
        setView('projects');
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
        setView('chats');
    };

    const getProjectStats = () => {
        if (!selectedProject) return null;

        const chats = chatService.getProjectChats(selectedProject.id);
        const totalMessages = chats.reduce((total, chat) => {
            const messages = chat.messages || [];
            return total + messages.length;
        }, 0);

        return {
            totalChats: chats.length,
            totalMessages,
            lastActivity: selectedProject.updatedAt
        };
    };

    const stats = getProjectStats();

    return (
        <div className="h-full bg-gray-50">
            <AnimatePresence mode="wait">
                {view === 'projects' && (
                    <motion.div
                        key="projects"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full p-6"
                    >
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">프로젝트 관리</h1>
                                <p className="text-gray-600">프로젝트를 생성하고 관리하세요</p>
                            </div>
                            <ProjectList
                                onProjectSelect={handleProjectSelect}
                                onNewProject={handleNewProject}
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'chats' && selectedProject && (
                    <motion.div
                        key="chats"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full p-6"
                    >
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={handleBackToProjects}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>프로젝트로 돌아가기</span>
                                    </button>

                                    {/* Navigation Tabs */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setView('chats')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'chats' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            채팅
                                        </button>
                                        <button
                                            onClick={() => setView('knowledge')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'knowledge' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            지식베이스
                                        </button>
                                        <button
                                            onClick={() => setView('analytics')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'analytics' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            고급분석
                                        </button>
                                        <button
                                            onClick={() => setView('workflow')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'workflow' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            워크플로우
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <Folder className="h-8 w-8 text-purple-600" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                                                <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                                                {selectedProject.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {selectedProject.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Settings className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    {stats && (
                                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">{stats.totalChats}</div>
                                                <div className="text-sm text-gray-600">총 채팅</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                                                <div className="text-sm text-gray-600">총 메시지</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {new Date(stats.lastActivity).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-600">마지막 활동</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Guidelines */}
                            {selectedProject.guidelines && (
                                <div className="mb-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">프로젝트 지침</h3>
                                        </div>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                            {selectedProject.guidelines}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Chat Start */}
                            <div className="mb-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">빠른 채팅 시작</h3>
                                    <QuickChatStart
                                        projectId={selectedProject.id}
                                        projectGuidelines={selectedProject.guidelines}
                                        onChatCreated={handleChatSelect}
                                    />
                                </div>
                            </div>

                            {/* AI Analytics Dashboard */}
                            <div className="mb-6">
                                <AIAnalyticsDashboard
                                    project={selectedProject}
                                    onInsightAction={(insight) => {
                                        console.log('인사이트 조치:', insight);
                                        // 인사이트 기반 자동 액션 구현 가능
                                    }}
                                />
                            </div>

                            {/* Chat List */}
                            <ChatList
                                projectId={selectedProject.id}
                                onChatSelect={handleChatSelect}
                                onNewChat={handleNewChat}
                                selectedChatId={selectedChat?.id}
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'knowledge' && selectedProject && (
                    <motion.div
                        key="knowledge"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full p-6"
                    >
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={handleBackToProjects}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>프로젝트로 돌아가기</span>
                                    </button>

                                    {/* Navigation Tabs */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setView('chats')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'chats' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            채팅
                                        </button>
                                        <button
                                            onClick={() => setView('knowledge')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'knowledge' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            지식베이스
                                        </button>
                                        <button
                                            onClick={() => setView('analytics')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'analytics' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            고급분석
                                        </button>
                                        <button
                                            onClick={() => setView('workflow')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'workflow' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            워크플로우
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Base Dashboard */}
                            <KnowledgeBaseDashboard
                                projectId={selectedProject.id}
                                onKnowledgeAction={(action, entry) => {
                                    console.log('지식베이스 액션:', action, entry);
                                    // 지식베이스 액션 처리
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'analytics' && selectedProject && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full p-6"
                    >
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={handleBackToProjects}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>프로젝트로 돌아가기</span>
                                    </button>

                                    {/* Navigation Tabs */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setView('chats')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'chats' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            채팅
                                        </button>
                                        <button
                                            onClick={() => setView('knowledge')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'knowledge' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            지식베이스
                                        </button>
                                        <button
                                            onClick={() => setView('analytics')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'analytics' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            고급분석
                                        </button>
                                        <button
                                            onClick={() => setView('workflow')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'workflow' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            워크플로우
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Analytics Dashboard */}
                            <AdvancedAnalyticsDashboard
                                project={selectedProject}
                                onInsightAction={(insight) => {
                                    console.log('분석 인사이트 액션:', insight);
                                    // 분석 인사이트 액션 처리
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'workflow' && selectedProject && (
                    <motion.div
                        key="workflow"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full p-6"
                    >
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={handleBackToProjects}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>프로젝트로 돌아가기</span>
                                    </button>

                                    {/* Navigation Tabs */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setView('chats')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'chats' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            채팅
                                        </button>
                                        <button
                                            onClick={() => setView('knowledge')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'knowledge' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            지식베이스
                                        </button>
                                        <button
                                            onClick={() => setView('analytics')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'analytics' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            고급분석
                                        </button>
                                        <button
                                            onClick={() => setView('workflow')}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${view === 'workflow' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            워크플로우
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Workflow Dashboard */}
                            <WorkflowDashboard
                                project={selectedProject}
                                onWorkflowAction={(action, workflow) => {
                                    console.log('워크플로우 액션:', action, workflow);
                                    // 워크플로우 액션 처리
                                }}
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'chat' && selectedChat && selectedProject && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full flex"
                    >
                        {/* Sidebar */}
                        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3 mb-4">
                                    <button
                                        onClick={handleBackToChats}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>채팅 목록</span>
                                    </button>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <Folder className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{selectedProject.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{selectedProject.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto">
                                <ChatList
                                    projectId={selectedProject.id}
                                    onChatSelect={handleChatSelect}
                                    onNewChat={handleNewChat}
                                    selectedChatId={selectedChat.id}
                                />
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1">
                            <ChatInterface
                                chat={selectedChat}
                                projectGuidelines={selectedProject.guidelines}
                                onChatUpdate={handleChatUpdate}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Project Modal */}
            <ProjectCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
};

export default ProjectManagementInterface;
