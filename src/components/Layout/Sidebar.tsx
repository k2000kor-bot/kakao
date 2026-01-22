import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { fetchSessions, setCurrentSession, createSession } from '../../store/slices/sessionsSlice';
import { errorLogger } from '../../utils/errorLogger';
import { API_BASE_URL } from '../../config/api';
import {
    Menu,
    Search,
    Plus,
    Folder,
    MessageSquare,
    Settings,
    Activity,
    MoreVertical,
    ChevronDown,
    Star,
    Clock,
    Grid,
    Bot,
    Home,
    BookOpen,
    TrendingUp,
    Users,
    FileText,
    Image,
    Video,
    Music,
    Loader2,
    AlertCircle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// AI 모델 타입 정의
interface AIModel {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    description: string;
}

const AIModels: AIModel[] = [
    { id: 'codex', name: 'Codex', icon: Clock, color: 'text-blue-600', description: '코드 생성 전문' },
    { id: 'sora', name: 'Sora', icon: Video, color: 'text-purple-600', description: '비디오 생성' },
    { id: 'gpt', name: 'GPT', icon: Grid, color: 'text-green-600', description: '범용 AI 모델' },
    { id: 'chat', name: '챗', icon: Bot, color: 'text-orange-600', description: '대화형 AI' },
];

const Sidebar: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { projects, currentProject, loading: projectsLoading, error: projectsError } = useSelector((state: RootState) => state.projects);
    const { sessions, currentSession, loading: sessionsLoading } = useSelector((state: RootState) => state.sessions);

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedModel, setSelectedModel] = useState<string>('chat');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [recentChats, setRecentChats] = useState<Array<{ id: string; name: string; timestamp: string }>>([]);

    // 프로젝트 로드
    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    // 세션 로드
    useEffect(() => {
        if (currentProject) {
            dispatch(fetchSessions(currentProject.id));
        }
    }, [currentProject, dispatch]);

    // 최근 채팅 로드
    useEffect(() => {
        const loadRecentChats = async () => {
            try {
                // 모든 세션에서 최근 업데이트된 세션 가져오기
                const allSessions = sessions
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map(session => ({
                        id: session.id,
                        name: session.name,
                        timestamp: session.updatedAt,
                    }));
                setRecentChats(allSessions);
            } catch (error) {
                errorLogger.error('최근 채팅 로드 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'Sidebar',
                    action: 'loadRecentChats',
                });
            }
        };

        if (sessions.length > 0) {
            loadRecentChats();
        }
    }, [sessions]);

    // 프로젝트 클릭 핸들러
    const handleProjectClick = useCallback((projectId: string) => {
        dispatch(setCurrentProject(projectId));
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    }, [dispatch]);

    // 세션 클릭 핸들러
    const handleSessionClick = useCallback((sessionId: string) => {
        dispatch(setCurrentSession(sessionId));
    }, [dispatch]);

    // 새 채팅 생성 핸들러
    const handleNewChat = useCallback(async () => {
        try {
            if (currentProject) {
                const result = await dispatch(createSession({
                    projectId: currentProject.id,
                    name: '새 채팅'
                })).unwrap();

                dispatch(setCurrentSession(result.id));
            } else {
                // 프로젝트가 없으면 기본 프로젝트 생성
                const result = await dispatch(createSession({
                    projectId: 'default',
                    name: '새 채팅'
                })).unwrap();

                dispatch(setCurrentSession(result.id));
            }
        } catch (error) {
            errorLogger.error('세션 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'Sidebar',
                action: 'handleCreateSession',
            });
        }
    }, [dispatch, currentProject]);

    // 프로젝트 생성 핸들러
    const handleCreateProject = useCallback(async () => {
        if (!newProjectName.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProjectName,
                    description: '새로운 프로젝트',
                    tags: ['새프로젝트'],
                }),
            });

            if (response.ok) {
                const newProject = await response.json();
                dispatch(fetchProjects()); // 프로젝트 목록 새로고침
                setNewProjectName('');
                setShowNewProjectModal(false);
            } else {
                throw new Error(`프로젝트 생성 실패: ${response.statusText}`);
            }
        } catch (error) {
            errorLogger.error('프로젝트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'Sidebar',
                action: 'handleCreateProject',
            });
        }
    }, [dispatch, newProjectName]);

    // AI 모델 선택 핸들러
    const handleModelSelect = useCallback((modelId: string) => {
        setSelectedModel(modelId);
        // 모델 선택 시 세션에 저장하거나 전역 상태로 관리
        localStorage.setItem('selectedAIModel', modelId);
    }, []);

    // 필터링된 프로젝트 (메모이제이션)
    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    // 필터링된 세션 (메모이제이션)
    const filteredSessions = useMemo(() => {
        if (!currentProject) return [];
        return sessions.filter(session =>
            session.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            session.projectId === currentProject.id
        );
    }, [sessions, currentProject, searchQuery]);

    // 필터링된 최근 채팅 (메모이제이션)
    const filteredRecentChats = useMemo(() => {
        return recentChats.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [recentChats, searchQuery]);

    // 사이드바 너비 계산
    const sidebarWidth = isCollapsed ? 'w-16' : 'w-80';

    return (
        <div className={`${sidebarWidth} bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200">
                {!isCollapsed && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">C</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">CORBU AI</h1>
                            </div>
                            <button
                                onClick={() => setIsCollapsed(true)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="사이드바 접기"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 검색 */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="검색"
                            />
                        </div>
                    </>
                )}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="w-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="사이드바 펼치기"
                    >
                        <Menu size={20} />
                    </button>
                )}
            </div>

            {/* 새 채팅 버튼 */}
            {!isCollapsed && (
                <div className="p-4">
                    <button
                        onClick={handleNewChat}
                        disabled={sessionsLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="새 채팅 만들기"
                    >
                        {sessionsLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        <span>새 채팅</span>
                    </button>
                </div>
            )}

            {/* 메인 네비게이션 */}
            <div className="flex-1 overflow-y-auto">
                {/* 에러 표시 */}
                {projectsError && (
                    <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="text-sm text-red-600">{projectsError}</span>
                    </div>
                )}

                {/* AI 모델/도구 섹션 */}
                {!isCollapsed && (
                    <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            AI 모델
                        </h3>
                        <div className="space-y-1">
                            {AIModels.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelSelect(model.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${selectedModel === model.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    title={model.description}
                                    aria-label={`${model.name} 모델 선택`}
                                >
                                    <model.icon size={16} className={model.color} />
                                    <span>{model.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 프로젝트 섹션 */}
                <div className="px-4 py-2">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                프로젝트
                            </h3>
                            <button
                                onClick={() => setShowNewProjectModal(true)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                aria-label="새 프로젝트 만들기"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    )}

                    {projectsLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredProjects.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div key={project.id}>
                                        <button
                                            onClick={() => handleProjectClick(project.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentProject?.id === project.id
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            aria-label={`${project.name} 프로젝트 선택`}
                                        >
                                            <div className="flex items-center space-x-2 min-w-0">
                                                <Folder size={16} className="text-gray-500 flex-shrink-0" />
                                                {!isCollapsed && (
                                                    <span className="truncate">{project.name}</span>
                                                )}
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform flex-shrink-0 ${expandedProjects.has(project.id) ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            )}
                                        </button>

                                        {/* 프로젝트 내 세션들 */}
                                        <AnimatePresence>
                                            {!isCollapsed && expandedProjects.has(project.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="ml-6 mt-1 space-y-1"
                                                >
                                                    {sessionsLoading ? (
                                                        <div className="flex items-center justify-center py-2">
                                                            <Loader2 size={14} className="animate-spin text-gray-400" />
                                                        </div>
                                                    ) : (
                                                        filteredSessions.map((session) => (
                                                            <button
                                                                key={session.id}
                                                                onClick={() => handleSessionClick(session.id)}
                                                                className={`w-full flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors ${currentSession?.id === session.id
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                                aria-label={`${session.name} 세션 선택`}
                                                            >
                                                                <MessageSquare size={14} className="flex-shrink-0" />
                                                                <span className="truncate">{session.name}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 최근 채팅 섹션 */}
                {!isCollapsed && (
                    <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            최근 채팅
                        </h3>
                        <div className="space-y-1">
                            {filteredRecentChats.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    {searchQuery ? '검색 결과가 없습니다' : '최근 채팅이 없습니다'}
                                </div>
                            ) : (
                                filteredRecentChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSessionClick(chat.id)}
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label={`${chat.name} 채팅 열기`}
                                    >
                                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{chat.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 사용자 정보 */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">사용자</div>
                            <div className="text-xs text-gray-500">Free</div>
                        </div>
                        <button
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            aria-label="사용자 메뉴"
                        >
                            <MoreVertical size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* 새 프로젝트 모달 */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowNewProjectModal(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 id="modal-title" className="text-lg font-semibold mb-4">새 프로젝트 만들기</h3>
                            <input
                                type="text"
                                placeholder="프로젝트 이름을 입력하세요"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newProjectName.trim()) {
                                        handleCreateProject();
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                aria-label="프로젝트 이름 입력"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowNewProjectModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleCreateProject}
                                    disabled={!newProjectName.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    만들기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Sidebar;
