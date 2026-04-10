import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { fetchSessions, setCurrentSession, createSession } from '../../store/slices/sessionsSlice';
import { errorLogger } from '../../utils/errorLogger';
import { showToast } from '../../utils/toast';
import {
    API_BASE_URL,
    API_PROJECT_SESSIONS_SEGMENT,
    API_PROJECTS_LIST_PATH,
    joinApiHealthCheckUrl,
} from '../../config/api';
import { SELECTED_AI_MODEL_STORAGE_KEY } from '../../services/sidebarUiStorageKeys';
import { coerceTrimmedString } from '../../utils/chatInputUtils';
import ErrorBoundary from '../ErrorBoundary';
import {
    Menu,
    Search,
    Plus,
    Folder,
    MessageSquare,
    MoreVertical,
    ChevronDown,
    Clock,
    Grid,
    Bot,
    Users,
    Video,
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
    { id: 'codex', name: 'Codex', icon: Clock, color: 'brainwave-sidebar-model-info', description: '코드 생성 전문' },
    { id: 'sora', name: 'Sora', icon: Video, color: 'brainwave-sidebar-model-secondary', description: '비디오 생성' },
    { id: 'gpt', name: 'GPT', icon: Grid, color: 'brainwave-sidebar-model-success', description: '범용 AI 모델' },
    { id: 'chat', name: '챗', icon: Bot, color: 'brainwave-sidebar-model-orange', description: '대화형 AI' },
];

const SidebarContent: React.FC = () => {
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

    // 모든 프로젝트의 세션 로드 (최근 대화용)
    useEffect(() => {
        const loadAllSessions = async () => {
            if (projects.length === 0) return;

            try {
                // 모든 프로젝트의 세션을 병렬로 로드
                const sessionPromises = projects.map(async (project) => {
                    try {
                        const response = await fetch(
                            joinApiHealthCheckUrl(
                                API_BASE_URL,
                                `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(project.id)}${API_PROJECT_SESSIONS_SEGMENT}`,
                            ),
                        );
                        if (response.ok) {
                            const data = await response.json();
                            return data.data || [];
                        }
                        return [];
                    } catch (error) {
                        errorLogger.error(
                            `프로젝트 ${project.id} 세션 로드 실패`,
                            error instanceof Error ? error : new Error(String(error)),
                            { component: 'Sidebar', action: 'loadAllSessions', projectId: project.id }
                        );
                        return [];
                    }
                });

                const allSessionsArrays = await Promise.all(sessionPromises);
                const allSessions = allSessionsArrays.flat();

                // 최근 업데이트된 세션 정렬
                const recentSessions = allSessions
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map(session => ({
                        id: session.id,
                        name: session.name,
                        timestamp: session.updatedAt,
                    }));

                setRecentChats(recentSessions);
            } catch (error) {
                errorLogger.error('전체 세션 로드 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'Sidebar',
                    action: 'loadAllSessions',
                });
            }
        };

        loadAllSessions();
    }, [projects]);

    // 현재 프로젝트의 세션 로드
    useEffect(() => {
        if (currentProject) {
            dispatch(fetchSessions(currentProject.id));
        }
    }, [currentProject, dispatch]);

    // 새 프로젝트 모달 Escape로 닫기
    useEffect(() => {
        if (!showNewProjectModal) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowNewProjectModal(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [showNewProjectModal]);

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

    // 새 대화 생성 핸들러
    const handleNewChat = useCallback(async () => {
        try {
            if (currentProject) {
                const result = await dispatch(createSession({
                    projectId: currentProject.id,
                    name: '새 대화'
                })).unwrap();

                dispatch(setCurrentSession(result.id));
            } else {
                // 프로젝트가 없으면 기본 프로젝트 생성
                const result = await dispatch(createSession({
                    projectId: 'default',
                    name: '새 대화'
                })).unwrap();

                dispatch(setCurrentSession(result.id));
            }
        } catch (error) {
            errorLogger.error('세션 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'Sidebar',
                action: 'handleCreateSession',
            });
            showToast('새 대화 생성에 실패했습니다. 다시 시도해주세요.');
        }
    }, [dispatch, currentProject]);

    // 프로젝트 생성 핸들러
    const handleCreateProject = useCallback(async () => {
        const name = coerceTrimmedString(newProjectName, '');
        if (!name || name.length < 2) return;

        try {
            const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_PROJECTS_LIST_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    description: '새로운 프로젝트',
                    tags: ['새프로젝트'],
                }),
            });

            if (response.ok) {
                await response.json();
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
            showToast('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
        }
    }, [dispatch, newProjectName]);

    // AI 모델 선택 핸들러
    const handleModelSelect = useCallback((modelId: string) => {
        setSelectedModel(modelId);
        // 모델 선택 시 세션에 저장하거나 전역 상태로 관리
        localStorage.setItem(SELECTED_AI_MODEL_STORAGE_KEY, modelId);
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

    // 필터링된 최근 대화 (메모이제이션)
    const filteredRecentChats = useMemo(() => {
        return recentChats.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [recentChats, searchQuery]);

    // 사이드바 너비 계산
    const sidebarWidth = isCollapsed ? 'w-16' : 'w-80';

    return (
        <div className={`brainwave-layout-sidebar ${sidebarWidth} flex flex-col h-full transition-all duration-300`}>
            {/* 헤더 */}
            <div className="brainwave-layout-sidebar-header p-4">
                {!isCollapsed && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="brainwave-sidebar-logo w-8 h-8 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-sm">B</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCollapsed(true)}
                                className="brainwave-sidebar-btn-icon p-1.5 rounded-lg"
                                aria-label="사이드바 접기"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 검색 */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 brainwave-sidebar-text-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="brainwave-sidebar-input w-full pl-10 pr-4 py-2 rounded-lg"
                                aria-label="검색"
                            />
                        </div>
                    </>
                )}
                {isCollapsed && (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="brainwave-sidebar-btn-icon w-full p-2 rounded-lg"
                        aria-label="사이드바 펼치기"
                    >
                        <Menu size={20} />
                    </button>
                )}
            </div>

            {/* 새 대화 버튼 */}
            {!isCollapsed && (
                <div className="p-4">
                    <button
                        type="button"
                        onClick={handleNewChat}
                        disabled={sessionsLoading}
                        className="brainwave-sidebar-btn-primary w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="새 대화 만들기"
                    >
                        {sessionsLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        <span>새 대화</span>
                    </button>
                </div>
            )}

            {/* 메인 네비게이션 */}
            <div className="flex-1 overflow-y-auto">
                {/* 에러 표시 */}
                {projectsError && (
                    <div className="brainwave-sidebar-error-box mx-4 mt-2 p-3 rounded-lg flex items-center space-x-2">
                        <AlertCircle size={16} />
                        <span className="text-sm">{projectsError}</span>
                    </div>
                )}

                {/* AI 모델/도구 섹션 */}
                {!isCollapsed && (
                    <div className="px-4 py-2">
                        <h3 className="brainwave-sidebar-section-title text-xs font-semibold uppercase tracking-wider mb-2">
                            AI 모델
                        </h3>
                        <div className="space-y-1">
                            {AIModels.map((model) => (
                                <button
                                    type="button"
                                    key={model.id}
                                    onClick={() => handleModelSelect(model.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${selectedModel === model.id
                                            ? 'brainwave-sidebar-item-selected'
                                            : 'brainwave-sidebar-item'
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
                            <h3 className="brainwave-sidebar-section-title text-xs font-semibold uppercase tracking-wider">
                                프로젝트
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowNewProjectModal(true)}
                                className="brainwave-sidebar-btn-icon p-1 rounded transition-colors"
                                aria-label="새 프로젝트 만들기"
                                data-testid="new-project-button"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    )}

                    {projectsLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin brainwave-sidebar-loading brainwave-sidebar-text-secondary" />
                        </div>
                    ) : (
                        <div className="space-y-1" data-testid="project-list">
                            {filteredProjects.length === 0 ? (
                                <div className="brainwave-sidebar-empty text-sm text-center py-4">
                                    {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div key={project.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleProjectClick(project.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentProject?.id === project.id
                                                    ? 'brainwave-sidebar-item-selected'
                                                    : 'brainwave-sidebar-item'
                                                }`}
                                            aria-label={`${project.name} 프로젝트 선택`}
                                        >
                                            <div className="flex items-center space-x-2 min-w-0">
                                                <Folder size={16} className="brainwave-sidebar-text-secondary flex-shrink-0" />
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
                                                            <Loader2 size={14} className="animate-spin brainwave-sidebar-text-secondary" />
                                                        </div>
                                                    ) : (
                                                        filteredSessions.map((session) => (
                                                            <button
                                                                type="button"
                                                                key={session.id}
                                                                onClick={() => handleSessionClick(session.id)}
                                                                className={`w-full flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors ${currentSession?.id === session.id
                                                                        ? 'brainwave-sidebar-item-selected'
                                                                        : 'brainwave-sidebar-item'
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

                {/* 최근 대화 섹션 */}
                {!isCollapsed && (
                    <div className="px-4 py-2">
                        <h3 className="brainwave-sidebar-section-title text-xs font-semibold uppercase tracking-wider mb-2">
                            최근 대화
                        </h3>
                        <div className="space-y-1">
                            {filteredRecentChats.length === 0 ? (
                                <div className="brainwave-sidebar-empty text-sm text-center py-4">
                                    {searchQuery ? '검색 결과가 없습니다' : '최근 대화가 없습니다'}
                                </div>
                            ) : (
                                filteredRecentChats.map((chat) => (
                                    <button
                                        type="button"
                                        key={chat.id}
                                        onClick={() => handleSessionClick(chat.id)}
                                        className="brainwave-sidebar-item w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors"
                                        aria-label={`${chat.name} 대화 열기`}
                                    >
                                        <Clock size={14} className="flex-shrink-0 brainwave-sidebar-text-secondary" />
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
                <div className="p-4 border-t brainwave-sidebar-footer-border">
                    <div className="flex items-center space-x-3">
                        <div className="brainwave-sidebar-user-avatar w-8 h-8 rounded-full flex items-center justify-center">
                            <Users size={16} className="brainwave-sidebar-text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="brainwave-sidebar-text-primary text-sm font-medium truncate">사용자</div>
                            <div className="brainwave-sidebar-text-secondary text-xs">Free</div>
                        </div>
                        <button
                            type="button"
                            className="brainwave-sidebar-btn-icon p-1 rounded transition-colors"
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
                        className="brainwave-sidebar-modal-overlay fixed inset-0 flex items-center justify-center"
                        onClick={() => setShowNewProjectModal(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="brainwave-sidebar-modal-panel rounded-lg p-6 w-96 max-w-[90vw]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 id="modal-title" className="brainwave-sidebar-text-primary text-lg font-semibold mb-4">새 프로젝트 만들기</h3>
                            <input
                                type="text"
                                placeholder="프로젝트 이름 (2자 이상)"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && coerceTrimmedString(newProjectName, '').length >= 2) {
                                        void handleCreateProject();
                                    }
                                }}
                                className="brainwave-sidebar-input-modal w-full px-3 py-2 rounded-lg mb-4"
                                aria-label="프로젝트 이름 입력"
                            />
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewProjectModal(false)}
                                    className="brainwave-sidebar-btn-secondary flex-1 px-4 py-2 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleCreateProject()}
                                    disabled={coerceTrimmedString(newProjectName, '').length < 2}
                                    className="brainwave-sidebar-btn-primary flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

// ErrorBoundary로 감싼 Sidebar 컴포넌트
const Sidebar: React.FC = () => {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                errorLogger.error('Sidebar Error', error, {
                    component: 'Sidebar',
                    componentStack: errorInfo.componentStack,
                });
            }}
        >
            <SidebarContent />
        </ErrorBoundary>
    );
};

export default Sidebar;
