import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { fetchSessions, setCurrentSession, createSession } from '../../store/slices/sessionsSlice';
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
    Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { projects, currentProject } = useSelector((state: RootState) => state.projects);
    const { sessions, currentSession } = useSelector((state: RootState) => state.sessions);

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    useEffect(() => {
        if (currentProject) {
            dispatch(fetchSessions(currentProject.id));
        }
    }, [currentProject, dispatch]);

    const handleProjectClick = (projectId: string) => {
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
    };

    const handleSessionClick = (sessionId: string) => {
        dispatch(setCurrentSession(sessionId));
    };

    const handleNewChat = async () => {
        try {
            if (currentProject) {
                const result = await dispatch(createSession({
                    projectId: currentProject.id,
                    name: '새 채팅'
                })).unwrap();

                // 새로 생성된 세션을 현재 세션으로 설정
                dispatch(setCurrentSession(result.id));
            } else {
                // 프로젝트가 없으면 기본 프로젝트 생성
                const result = await dispatch(createSession({
                    projectId: 'default',
                    name: '새 채팅'
                })).unwrap();

                // 새로 생성된 세션을 현재 세션으로 설정
                dispatch(setCurrentSession(result.id));
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        try {
            // 프로젝트 생성 API 호출
            const response = await fetch('/api/projects', {
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
            }
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSessions = currentProject
        ? sessions.filter(session =>
            session.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Gemini</h1>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
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
                    />
                </div>
            </div>

            {/* 새 채팅 버튼 */}
            <div className="p-4">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={16} />
                    <span>새 채팅</span>
                </button>
            </div>

            {/* 메인 네비게이션 */}
            <div className="flex-1 overflow-y-auto">
                {/* AI 모델/도구 섹션 */}
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        AI 모델
                    </h3>
                    <div className="space-y-1">
                        {[
                            { icon: Clock, name: 'Codex', color: 'text-blue-600' },
                            { icon: Video, name: 'Sora', color: 'text-purple-600' },
                            { icon: Grid, name: 'GPT', color: 'text-green-600' },
                            { icon: Bot, name: '챗', color: 'text-orange-600' },
                        ].map((item) => (
                            <button
                                key={item.name}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <item.icon size={16} className={item.color} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 프로젝트 섹션 */}
                <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            프로젝트
                        </h3>
                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {filteredProjects.map((project) => (
                            <div key={project.id}>
                                <button
                                    onClick={() => handleProjectClick(project.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${currentProject?.id === project.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Folder size={16} className="text-gray-500" />
                                        <span className="truncate">{project.name}</span>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform ${expandedProjects.has(project.id) ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {/* 프로젝트 내 세션들 */}
                                <AnimatePresence>
                                    {expandedProjects.has(project.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-6 mt-1 space-y-1"
                                        >
                                            {sessions
                                                .filter(session => session.projectId === project.id)
                                                .map((session) => (
                                                    <button
                                                        key={session.id}
                                                        onClick={() => handleSessionClick(session.id)}
                                                        className={`w-full flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors ${currentSession?.id === session.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <MessageSquare size={14} />
                                                        <span className="truncate">{session.name}</span>
                                                    </button>
                                                ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 최근 채팅 섹션 */}
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        최근 채팅
                    </h3>
                    <div className="space-y-1">
                        {[
                            '온도 단위 해석',
                            '소수점 반올림 방법',
                            'laixi 글자 지우기 문제',
                            'Mac 원격 데스크탑 한글 변환',
                            '한글 백스페이스 문제',
                        ].map((chat, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Clock size={14} className="text-gray-400" />
                                <span className="truncate">{chat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 하단 사용자 정보 */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">KIM HOBUM</div>
                        <div className="text-xs text-gray-500">Plus</div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>

            {/* 새 프로젝트 모달 */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowNewProjectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">새 프로젝트 만들기</h3>
                            <input
                                type="text"
                                placeholder="프로젝트 이름을 입력하세요"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
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
