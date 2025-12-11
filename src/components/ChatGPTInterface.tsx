import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { projectService } from '../services/projectService';
import NotebookLLM from './NotebookLLM';
import { errorLogger } from '../utils/errorLogger';
import './ChatGPTInterface.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatGPTInterface: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [viewMode, setViewMode] = useState<'chat' | 'notebook'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 로컬 스토리지에서 프로젝트와 대화 불러오기
    useEffect(() => {
        // 프로젝트 불러오기 (백엔드 API 또는 로컬 스토리지)
        const loadProjects = async () => {
            try {
                const loadedProjects = await projectService.getProjects();
                const projectsWithDates: Project[] = loadedProjects
                    .filter((p) => p?.id && p?.name)
                    .map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || '',
                        createdAt: p.createdAt,
                        updatedAt: p.updatedAt,
                    }));
                setProjects(projectsWithDates);
                if (projectsWithDates.length > 0 && !currentProject) {
                    setCurrentProject(projectsWithDates[0]);
                }
            } catch (error) {
                errorLogger.error('프로젝트 불러오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'loadProjects',
                });
                // 폴백: 로컬 스토리지에서 직접 불러오기
                const savedProjects = localStorage.getItem('chatgpt-projects');
                if (savedProjects) {
                    try {
                        const parsed = JSON.parse(savedProjects) as Array<{
                            id: string;
                            name: string;
                            description?: string;
                            createdAt: string;
                            updatedAt: string;
                        }>;
                        const projectsWithDates: Project[] = parsed
                            .filter((p) => p?.id && p?.name)
                            .map((p) => ({
                                ...p,
                                createdAt: new Date(p.createdAt),
                                updatedAt: new Date(p.updatedAt),
                            }));
                        setProjects(projectsWithDates);
                        if (projectsWithDates.length > 0 && !currentProject) {
                            setCurrentProject(projectsWithDates[0]);
                        }
                    } catch (parseError) {
                        errorLogger.error('프로젝트 파싱 실패', parseError instanceof Error ? parseError : new Error(String(parseError)), {
                            component: 'ChatGPTInterface',
                            action: 'parseProjects',
                        });
                    }
                }
            }
        };
        loadProjects();

        // 대화 불러오기
        const saved = localStorage.getItem('chatgpt-conversations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Array<{
                    id: string;
                    title: string;
                    projectId?: string;
                    messages: Array<{
                        id: string;
                        role: 'user' | 'assistant';
                        content: string;
                        timestamp: string;
                    }>;
                    createdAt: string;
                    updatedAt: string;
                }>;
                const conversationsWithDates: Conversation[] = parsed
                    .filter((conv) => conv?.id && conv?.messages)
                    .map((conv) => ({
                        ...conv,
                        createdAt: new Date(conv.createdAt),
                        updatedAt: new Date(conv.updatedAt),
                        messages: conv.messages.map((msg) => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp),
                        })),
                    }));
                setConversations(conversationsWithDates);
            } catch (error) {
                errorLogger.error('대화 불러오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'loadConversations',
                });
            }
        }
    }, [currentProject]);

    // 프로젝트 저장 (로컬 스토리지 동기화)
    useEffect(() => {
        if (projects.length > 0) {
            const toSave = projects.map((p) => ({
                ...p,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            }));
            localStorage.setItem('chatgpt-projects', JSON.stringify(toSave));
        }
    }, [projects]);

    // 대화 저장
    useEffect(() => {
        const toSave = conversations.map((conv) => ({
            ...conv,
            createdAt: conv.createdAt.toISOString(),
            updatedAt: conv.updatedAt.toISOString(),
            messages: conv.messages.map((msg) => ({
                ...msg,
                timestamp: msg.timestamp.toISOString(),
            })),
        }));
        localStorage.setItem('chatgpt-conversations', JSON.stringify(toSave));
    }, [conversations]);

    // 메시지 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentConversation?.messages]);

    // 새 프로젝트 생성 (백엔드 API 사용)
    // 프로젝트 생성 (useCallback으로 메모이제이션)
    const createNewProject = useCallback(async () => {
        if (!newProjectName.trim()) return;

        try {
            const createdProject = await projectService.createProject({
                name: newProjectName.trim(),
                description: '',
                files: [],
                instructions: '',
                tags: [],
                isActive: true,
                type: 'conversation',
                status: 'active',
            });

            const newProject: Project = {
                id: createdProject.id,
                name: createdProject.name,
                description: createdProject.description || '',
                createdAt: createdProject.createdAt,
                updatedAt: createdProject.updatedAt,
            };

            setProjects((prev) => [...prev, newProject]);
            setCurrentProject(newProject);
            setNewProjectName('');
            setShowProjectModal(false);
        } catch (error) {
            errorLogger.error('프로젝트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'createProject',
            });
            // 폴백: 로컬에서 생성
            const newProject: Project = {
                id: `project-${Date.now()}`,
                name: newProjectName.trim(),
                description: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProjects((prev) => [...prev, newProject]);
            setCurrentProject(newProject);
            setNewProjectName('');
            setShowProjectModal(false);
        }
    }, [newProjectName]);

    // 프로젝트 선택 (useCallback으로 메모이제이션)
    const selectProject = useCallback((project: Project) => {
        setCurrentProject(project);
        // 해당 프로젝트의 대화만 필터링
        setConversations((prev) => {
            const projectConversations = prev.filter(
                (conv) => conv.projectId === project.id
            );
            if (projectConversations.length > 0) {
                setCurrentConversation(projectConversations[0]);
            } else {
                setCurrentConversation(null);
            }
            return prev; // conversations는 필터링하지 않고 그대로 유지 (필터링은 filteredConversations에서 처리)
        });
    }, []);

    // 새 대화 시작 (useCallback으로 메모이제이션)
    const startNewConversation = useCallback(() => {
        if (!currentProject) {
            // 프로젝트가 없으면 먼저 생성
            setShowProjectModal(true);
            return;
        }

        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: '새 대화',
            messages: [],
            projectId: currentProject.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
    }, [currentProject]);

    // 대화 선택 (useCallback으로 메모이제이션)
    const selectConversation = useCallback((conversation: Conversation) => {
        setCurrentConversation(conversation);
    }, []);

    // API 재시도 헬퍼 함수
    const apiCallWithRetry = useCallback(async (
        apiCall: () => Promise<any>,
        maxRetries: number = 3,
        retryDelay: number = 1000
    ): Promise<any> => {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error;

                // 재시도 가능한 오류인지 확인
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status;
                    // 5xx 서버 오류나 네트워크 오류만 재시도
                    if (status && status >= 500 && status < 600) {
                        if (attempt < maxRetries) {
                            errorLogger.warn(`API 호출 실패 (시도 ${attempt}/${maxRetries}), ${retryDelay}ms 후 재시도...`, {
                                component: 'ChatGPTInterface',
                                action: 'retryAPI',
                                attempt,
                                maxRetries,
                            });
                            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                            continue;
                        }
                    } else if (!error.response && error.request) {
                        // 네트워크 오류
                        if (attempt < maxRetries) {
                            errorLogger.warn(`네트워크 오류 (시도 ${attempt}/${maxRetries}), ${retryDelay}ms 후 재시도...`, {
                                component: 'ChatGPTInterface',
                                action: 'retryNetwork',
                                attempt,
                                maxRetries,
                            });
                            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                            continue;
                        }
                    }
                }

                // 재시도 불가능한 오류이거나 최대 재시도 횟수 초과
                throw error;
            }
        }

        throw lastError;
    }, []);

    // 입력 검증 헬퍼 함수
    const validateInput = useCallback((text: string): string | null => {
        const trimmed = text.trim();
        if (!trimmed) {
            return null;
        }
        if (trimmed.length > 10000) {
            return '메시지는 최대 10,000자까지 입력할 수 있습니다.';
        }
        return trimmed;
    }, []);

    // 응답 내용 추출 헬퍼 함수
    const extractResponseContent = useCallback((response: any): string => {
        if (!response?.data) {
            return '응답을 생성할 수 없습니다.';
        }
        const data = response.data;
        return data.response || data.message || (typeof data === 'string' ? data : data.data?.response) || '응답을 생성할 수 없습니다.';
    }, []);

    // 에러 메시지 생성 헬퍼 함수
    const getErrorMessage = useCallback((error: unknown): string => {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                return '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
            }
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    return error.response.data?.error || '잘못된 요청입니다.';
                }
                if (status === 500) {
                    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                }
                if (status === 503) {
                    return '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
                }
                return error.response.data?.error || error.message;
            }
            if (error.request) {
                return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
            }
            return error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return '알 수 없는 오류가 발생했습니다.';
    }, []);

    // 대화 저장 헬퍼 함수
    const saveConversationsToStorage = useCallback((conversationsToSave: Conversation[]) => {
        try {
            const toSave = conversationsToSave.map((conv) => ({
                ...conv,
                createdAt: conv.createdAt.toISOString(),
                updatedAt: conv.updatedAt.toISOString(),
                messages: conv.messages.map((msg) => ({
                    ...msg,
                    timestamp: msg.timestamp.toISOString(),
                })),
            }));
            localStorage.setItem('chatgpt-conversations', JSON.stringify(toSave));
        } catch (error) {
            errorLogger.error('대화 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'saveConversationsToStorage',
            });
        }
    }, []);

    // 메시지 전송 (useCallback으로 메모이제이션, 리팩토링됨)
    const sendMessage = useCallback(async () => {
        // 입력 검증
        if (isLoading) {
            return;
        }

        const validationResult = validateInput(input);
        if (validationResult === null) {
            return;
        }
        if (typeof validationResult === 'string') {
            alert(validationResult);
            return;
        }

        const trimmedInput: string = validationResult;
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            timestamp: new Date(),
        };

        // 현재 대화가 없으면 새로 생성
        let conversation: Conversation = currentConversation || {
            id: `conv-${Date.now()}`,
            title: trimmedInput.substring(0, 30),
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!currentConversation) {
            setConversations([conversation, ...conversations]);
            setCurrentConversation(conversation);
        }

        // 사용자 메시지 추가
        const updatedMessages = [...conversation.messages, userMessage];
        const updatedConversation = {
            ...conversation,
            messages: updatedMessages,
            updatedAt: new Date(),
        };
        setCurrentConversation(updatedConversation);
        setConversations(
            conversations.map((c) => (c.id === conversation.id ? updatedConversation : c))
        );

        setInput('');
        setIsLoading(true);

        try {
            // 백엔드 API 호출 (재시도 로직 포함)
            const response = await apiCallWithRetry(
                () => axios.post(
                    `${API_BASE_URL}/api/chat`,
                    {
                        message: trimmedInput,
                        quality: 'enhanced',
                        conversation_id: conversation.id,
                        context: currentProject ? { projectId: currentProject.id, projectName: currentProject.name } : undefined,
                    },
                    {
                        timeout: 30000,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                ),
                3,
                1000
            );

            // 응답 처리
            const responseContent = extractResponseContent(response);
            const assistantMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            const finalConversation = {
                ...updatedConversation,
                messages: finalMessages,
                updatedAt: new Date(),
                title: updatedConversation.title === '새 대화' && finalMessages.length > 0
                    ? trimmedInput.substring(0, 30) || '새 대화'
                    : updatedConversation.title,
            };

            setCurrentConversation(finalConversation);
            const updatedConversations = conversations.map((c) => (c.id === conversation.id ? finalConversation : c));
            setConversations(updatedConversations);

            // 로컬 스토리지에 저장
            saveConversationsToStorage(updatedConversations);
        } catch (error) {
            errorLogger.error('메시지 전송 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'sendMessage',
            });

            const errorContent = getErrorMessage(error);
            const errorMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: `❌ **오류 발생**\n\n${errorContent}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                timestamp: new Date(),
            };

            const finalMessages = [...updatedMessages, errorMessage];
            const finalConversation = {
                ...updatedConversation,
                messages: finalMessages,
                updatedAt: new Date(),
            };

            setCurrentConversation(finalConversation);
            setConversations(
                conversations.map((c) => (c.id === conversation.id ? finalConversation : c))
            );
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, currentConversation, conversations, currentProject, apiCallWithRetry, validateInput, extractResponseContent, getErrorMessage, saveConversationsToStorage]);

    // Enter 키 처리 (useCallback으로 메모이제이션)
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // 대화 삭제 (useCallback으로 메모이제이션)
    const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (globalThis.window?.confirm('이 대화를 삭제하시겠습니까?')) {
            setConversations((prev) => {
                const updated = prev.filter((c) => c.id !== id);
                // 로컬 스토리지에 저장
                try {
                    const toSave = updated.map((conv) => ({
                        ...conv,
                        createdAt: conv.createdAt.toISOString(),
                        updatedAt: conv.updatedAt.toISOString(),
                        messages: conv.messages.map((msg) => ({
                            ...msg,
                            timestamp: msg.timestamp.toISOString(),
                        })),
                    }));
                    localStorage.setItem('chatgpt-conversations', JSON.stringify(toSave));
                } catch (error) {
                    errorLogger.error('대화 삭제 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                        component: 'ChatGPTInterface',
                        action: 'deleteConversation',
                    });
                }
                return updated;
            });

            setCurrentConversation((prev) => (prev?.id === id ? null : prev));
        }
    }, []);

    // 메시지 복사 (토스트 알림 포함, useCallback으로 메모이제이션)
    const copyMessage = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        } catch (error) {
            errorLogger.error('복사 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'copyMessage',
            });
            alert('복사에 실패했습니다.');
        }
    }, []);

    // 대화 검색 필터링
    const filteredConversations = useMemo(() => {
        let filtered = currentProject
            ? conversations.filter(c => c.projectId === currentProject.id)
            : conversations;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(conv =>
                conv.title.toLowerCase().includes(query) ||
                conv.messages.some(msg => msg.content.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [conversations, currentProject, searchQuery]);

    // 입력창 자동 높이 조절
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [input]);

    return (
        <div
            className="chatgpt-interface"
            style={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: '#343541',
                color: '#ececf1',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            {/* 사이드바 */}
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={startNewConversation}>
                        <span>+</span> 새 대화
                    </button>
                    <button
                        className="new-project-btn"
                        onClick={() => setShowProjectModal(true)}
                        style={{ marginLeft: '8px', padding: '8px 12px', fontSize: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#ececf1', cursor: 'pointer' }}
                    >
                        📁 프로젝트
                    </button>
                    {currentProject && (
                        <button
                            className="notebook-toggle-btn"
                            onClick={() => setViewMode(viewMode === 'chat' ? 'notebook' : 'chat')}
                            style={{
                                marginLeft: '8px',
                                padding: '8px 12px',
                                fontSize: '14px',
                                background: viewMode === 'notebook' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                color: '#ececf1',
                                cursor: 'pointer'
                            }}
                            title={viewMode === 'chat' ? '노트북 LLM 보기' : '채팅 보기'}
                        >
                            {viewMode === 'chat' ? '📓 노트북' : '💬 채팅'}
                        </button>
                    )}
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="사이드바 토글"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4h14M3 10h14M3 16h14" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </div>

                {/* 프로젝트 목록 */}
                {projects.length > 0 && (
                    <div className="projects-section" style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#999' }}>
                            프로젝트
                        </div>
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                                onClick={() => selectProject(project)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: currentProject?.id === project.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                                    color: '#ececf1',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                📁 {project.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* 검색 영역 */}
                {conversations.length > 0 && (
                    <div className="search-container" role="search" style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <input
                            type="text"
                            placeholder="대화 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                color: '#ececf1',
                                fontSize: '14px',
                            }}
                            aria-label="대화 검색"
                            aria-describedby="search-hint"
                        />
                        <span id="search-hint" className="sr-only">대화 제목이나 내용으로 검색할 수 있습니다</span>
                    </div>
                )}

                <div className="conversations-list">
                    {(() => {
                        if (filteredConversations.length === 0) {
                            return (
                                <div className="empty-conversations">
                                    <p>대화가 없습니다</p>
                                    <p className="hint">새 대화를 시작해보세요</p>
                                </div>
                            );
                        }

                        return filteredConversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                type="button"
                                className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''
                                    }`}
                                onClick={() => selectConversation(conversation)}
                                aria-label={`대화 선택: ${conversation.title}`}
                            >
                                <div className="conversation-content">
                                    <div className="conversation-title">{conversation.title}</div>
                                    <div className="conversation-preview">
                                        {conversation.messages.length > 0
                                            ? conversation.messages.at(-1)?.content.substring(0, 50) ?? '빈 대화'
                                            : '빈 대화'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={(e) => deleteConversation(conversation.id, e)}
                                    aria-label="대화 삭제"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </button>
                            </button>
                        ));
                    })()}
                </div>
            </div>

            {/* 메인 채팅 영역 */}
            <div className="main-content">
                {viewMode === 'notebook' && currentProject ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0, color: '#ececf1' }}>📓 노트북 LLM - {currentProject.name}</h2>
                            <button
                                onClick={() => setViewMode('chat')}
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    color: '#ececf1',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                💬 채팅으로 돌아가기
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                            <NotebookLLM
                                projectId={currentProject.id}
                                onResponseComplete={(response) => {
                                    errorLogger.info('노트북 LLM 응답 완료', {
                                        component: 'ChatGPTInterface',
                                        action: 'notebookLLMResponse',
                                        responseLength: response?.content?.length || 0,
                                        modelUsed: response?.modelUsed,
                                    });
                                }}
                                onError={(error) => {
                                    errorLogger.error('노트북 LLM 오류', error instanceof Error ? error : new Error(String(error)), {
                                        component: 'ChatGPTInterface',
                                        action: 'notebookLLMError',
                                    });
                                }}
                            />
                        </div>
                    </div>
                ) : currentConversation ? (
                    <>
                        <div className="messages-container" role="log" aria-label="대화 메시지 목록" aria-live="polite" aria-atomic="false">
                            {currentConversation.messages.length === 0 ? (
                                <div className="empty-state">
                                    <output>
                                        <h2>새 대화를 시작하세요</h2>
                                        <p>아래 입력창에 메시지를 입력하여 대화를 시작할 수 있습니다.</p>
                                    </output>
                                </div>
                            ) : (
                                currentConversation.messages.map((message) => (
                                    <article
                                        key={message.id}
                                        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                                        aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지`}
                                    >
                                        <div className="message-avatar" aria-hidden="true">
                                            {message.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-text" role="text">
                                                {message.role === 'assistant' ? (
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                            <fieldset className="message-actions" aria-label="메시지 작업" style={{ border: 'none', padding: 0, margin: 0 }}>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => copyMessage(message.content)}
                                                    aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지 복사`}
                                                    title="메시지 복사 (Ctrl+C)"
                                                    type="button"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                        <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                    </svg>
                                                </button>
                                                <div className="message-timestamp" aria-label={`메시지 전송 시간: ${message.timestamp.toLocaleString('ko-KR')}`}>
                                                    <time dateTime={message.timestamp.toISOString()}>
                                                        {message.timestamp.toLocaleTimeString('ko-KR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </time>
                                                </div>
                                            </fieldset>
                                        </div>
                                    </article>
                                ))
                            )}
                            {isLoading && (
                                <div className="message assistant-message" aria-live="polite" aria-busy="true">
                                    <div className="message-avatar" aria-hidden="true">🤖</div>
                                    <div className="message-content">
                                        <output>
                                            <div className="loading-indicator">
                                                <div className="loading-spinner" aria-hidden="true"></div>
                                                <span>AI가 응답을 생성하고 있습니다...</span>
                                            </div>
                                        </output>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 복사 토스트 알림 */}
                        {showCopyToast && (
                            <div className="toast-notification" style={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                background: '#19c37d',
                                color: 'white',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                zIndex: 10000,
                                animation: 'slideIn 0.3s ease-out',
                            }}>
                                ✅ 메시지가 복사되었습니다
                            </div>
                        )}

                        {/* 입력 영역 */}
                        <section className="input-container" aria-label="메시지 입력 영역">
                            <div className="input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                                    rows={1}
                                    disabled={isLoading}
                                    className="message-input"
                                    aria-label="메시지 입력창"
                                    aria-describedby="input-hint"
                                    aria-invalid={input.length > 10000}
                                    aria-required="true"
                                />
                                <button
                                    className="send-button"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    aria-label="메시지 전송"
                                    aria-disabled={!input.trim() || isLoading}
                                    title={isLoading ? '응답 생성 중...' : '메시지 전송 (Enter)'}
                                >
                                    {isLoading ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="loading-spinner">
                                            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="12.566" strokeDashoffset="12.566">
                                                <animate attributeName="stroke-dashoffset" values="12.566;0" dur="1s" repeatCount="indefinite" />
                                            </circle>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path d="M2 10l16-8-8 16-2-6-6-2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="input-footer">
                                <span id="input-hint" className="input-hint" aria-live="polite">
                                    {isLoading ? '응답 생성 중...' : input.length > 10000 ? `메시지가 너무 깁니다 (${input.length}/10,000자)` : 'Enter로 전송, Shift+Enter로 줄바꿈'}
                                </span>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <h1>CORBU AI</h1>
                            <p>어떤 도움이 필요하신가요?</p>
                            <div className="suggestions">
                                <button
                                    className="suggestion-btn"
                                    onClick={() => {
                                        setInput('안녕하세요!');
                                        inputRef.current?.focus();
                                    }}
                                >
                                    안녕하세요!
                                </button>
                                <button
                                    className="suggestion-btn"
                                    onClick={() => {
                                        setInput('오늘 날씨는 어때요?');
                                        inputRef.current?.focus();
                                    }}
                                >
                                    오늘 날씨는 어때요?
                                </button>
                                <button
                                    className="suggestion-btn"
                                    onClick={() => {
                                        setInput('코딩을 배우고 싶어요');
                                        inputRef.current?.focus();
                                    }}
                                >
                                    코딩을 배우고 싶어요
                                </button>
                            </div>
                        </div>
                        <section className="input-container" aria-label="메시지 입력 영역">
                            <div className="input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="메시지를 입력하세요..."
                                    rows={1}
                                    className="message-input"
                                />
                                <button
                                    className="send-button"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 10l16-8-8 16-2-6-6-2z" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* 프로젝트 생성 모달 */}
            {showProjectModal && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="프로젝트 생성 모달"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowProjectModal(false);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowProjectModal(false);
                        }
                    }}
                >
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>새 프로젝트 생성</h2>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="프로젝트 이름을 입력하세요"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    createNewProject();
                                }
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button
                                onClick={() => {
                                    setShowProjectModal(false);
                                    setNewProjectName('');
                                }}
                                style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', background: 'transparent', color: '#ececf1', cursor: 'pointer' }}
                            >
                                취소
                            </button>
                            <button
                                onClick={createNewProject}
                                disabled={!newProjectName.trim()}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: newProjectName.trim() ? '#19c37d' : '#555',
                                    color: 'white',
                                    cursor: newProjectName.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default ChatGPTInterface;

