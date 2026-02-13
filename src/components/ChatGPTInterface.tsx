import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { projectService } from '../services/projectService';
import NotebookLLM from './NotebookLLM';
import ProjectEditModal from './ProjectManagement/ProjectEditModal';
import ProjectShareDialog from './ProjectShareDialog';
import { errorLogger } from '../utils/errorLogger';
import { API_BASE_URL } from '../config/api';
import { isStreamingSupported, streamChatMessage } from '../utils/streamingClient';
import { rehypeHighlightSearch } from '../utils/rehypeHighlightSearch';
import './ChatGPTInterface.css';

function getSelectedSourceIds(projectId: string): string[] | null {
  try {
    const raw = localStorage.getItem(`notebook-selected-sources-${projectId}`);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildChatContext(project: { id: string; name: string } | null, extra?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!project) return extra ?? undefined;
  const ctx: Record<string, unknown> = { projectId: project.id, projectName: project.name, ...extra };
  const ids = getSelectedSourceIds(project.id);
  if (ids !== null) ctx.source_ids = ids;
  return ctx;
}

// 코드 블록 복사 버튼 컴포넌트
const CodeBlock: React.FC<{ children: React.ReactNode; className?: string; theme: 'dark' | 'light' }> = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const language = className?.replace('language-', '') || '';
    const codeContent = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // 복사 실패 시 무시
        }
    };

    return (
        <div style={{
            position: 'relative',
            margin: '12px 0',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--code-block-bg)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--code-block-header)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--code-muted)',
            }}>
                <span>{language || 'code'}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="코드 복사"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: copied ? 'var(--accent-success)' : 'var(--code-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                    }}
                    title="코드 복사"
                >
                    {copied ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                            복사됨
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                            </svg>
                            복사
                        </>
                    )}
                </button>
            </div>
            <pre style={{
                margin: 0,
                padding: '12px',
                overflow: 'auto',
                fontSize: '13px',
                lineHeight: '1.5',
            }}>
                <code className={className} style={{ color: 'var(--code-block-text)' }}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

type MessageReaction = 'like' | 'dislike' | null;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    bookmarked?: boolean;
    reaction?: MessageReaction;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    source_count?: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
    pinned?: boolean;
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
    const [showProjectEditModal, setShowProjectEditModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [projectListTab, setProjectListTab] = useState<'all' | 'recommended'>('all');
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('복사되었습니다');
    const [viewMode, setViewMode] = useState<'chat' | 'notebook'>('chat');
    const [useStreaming, setUseStreaming] = useState<boolean>(true);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const [deleteConfirmConversation, setDeleteConfirmConversation] = useState<Conversation | null>(null);
    const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
    const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
    const [showClearMessagesConfirm, setShowClearMessagesConfirm] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    useEffect(() => {
        if (!showProModal) return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowProModal(false); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [showProModal]);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingConversationTitle, setEditingConversationTitle] = useState<string>('');
    // 응답 스타일 설정
    const [responseStyle, setResponseStyle] = useState<'concise' | 'balanced' | 'detailed' | 'comprehensive'>('balanced');
    const [perspective, setPerspective] = useState<string | null>(null);
    const [showStyleOptions, setShowStyleOptions] = useState<boolean>(false);
    // 빠른 제안
    const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
    // 소스 기반 추천 질문 (NotebookLM, 채팅 웰컴용)
    const [suggestedQuestionsFromSource, setSuggestedQuestionsFromSource] = useState<string[]>([]);
    // 대화 내 검색
    const [messageSearchQuery, setMessageSearchQuery] = useState<string>('');
    const [showMessageSearch, setShowMessageSearch] = useState<boolean>(false);
    const [messageSearchIndex, setMessageSearchIndex] = useState<number>(0);
    // 테마 설정
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem('chatgpt-theme');
        if (saved === 'light' || saved === 'dark') return saved;
        // 시스템 설정 확인
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    });
    // TTS 설정
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [showTimestamps, setShowTimestamps] = useState<boolean>(() => {
        return localStorage.getItem('chatgpt-show-timestamps') === 'true';
    });
    const [importingConversation, setImportingConversation] = useState(false);
    // 키보드 단축키 도움말
    const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
    // 대화 정렬
    type SortOption = 'recent' | 'name' | 'messages';
    const [sortOption, setSortOption] = useState<SortOption>('recent');
    // 프로젝트 정렬
    type ProjectSortOption = 'recent' | 'name' | 'sources';
    const [projectSortOption, setProjectSortOption] = useState<ProjectSortOption>('recent');
    // 자동 스크롤 설정
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    // 메시지 접기 상태
    const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(new Set());
    // 응답 시간 측정
    const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
    const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
    const [streamingElapsedSec, setStreamingElapsedSec] = useState(0);
    // 네트워크 상태
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    // 스토리지 사용량
    const [storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);
    const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const streamingRafRef = useRef<number | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef<boolean>(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const inputHistoryRef = useRef<string[]>([]);
    const inputHistoryIndexRef = useRef<number>(-1);
    const shortcutsCloseRef = useRef<HTMLButtonElement>(null);
    const prevFocusRef = useRef<HTMLElement | null>(null);

    const refreshProjects = useCallback(async () => {
        try {
            const loadedProjects = await projectService.getProjects();
            const projectsWithDates: Project[] = loadedProjects
                .filter((p) => p?.id && p?.name)
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
                    updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
                    source_count: typeof (p as Project).source_count === 'number' ? (p as Project).source_count : undefined,
                }));
            setProjects(projectsWithDates);
        } catch {
            // 폴백 시에는 기존 projects 유지
        }
    }, []);

    const sortedProjects = useMemo(() => {
        const copy = [...projects];
        if (projectSortOption === 'recent') {
            copy.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        } else if (projectSortOption === 'name') {
            copy.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
        } else if (projectSortOption === 'sources') {
            copy.sort((a, b) => (b.source_count ?? 0) - (a.source_count ?? 0));
        }
        return copy;
    }, [projects, projectSortOption]);

    const filteredProjects = useMemo(() => {
        if (!projectSearchQuery.trim()) return sortedProjects;
        const q = projectSearchQuery.toLowerCase().trim();
        return sortedProjects.filter((p) => p.name.toLowerCase().includes(q));
    }, [sortedProjects, projectSearchQuery]);

    // 로컬 스토리지에서 프로젝트와 대화 불러오기
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const loadedProjects = await projectService.getProjects();
                const projectsWithDates: Project[] = loadedProjects
                    .filter((p) => p?.id && p?.name)
                    .map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || '',
                        createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
                        updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
                        source_count: typeof (p as Project).source_count === 'number' ? (p as Project).source_count : undefined,
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

    // 메시지 스크롤 (사용자가 아래쪽을 보고 있을 때만 자동 스크롤)
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesContainerRef.current?.scrollTo({ top: 0, behavior });
    }, []);

    const handleMessagesScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const threshold = 120; // px
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        isNearBottomRef.current = distanceToBottom <= threshold;
        setShowScrollToBottom(distanceToBottom > threshold);
        setShowScrollToTop(el.scrollTop > threshold);
    }, []);

    useEffect(() => {
        // 자동 스크롤이 활성화되어 있고, 아래를 보고 있는 경우에만 따라가기
        if (autoScroll && isNearBottomRef.current) {
            scrollToBottom(isStreaming ? 'auto' : 'smooth');
        }
    }, [currentConversation?.messages, isStreaming, scrollToBottom, autoScroll]);

    // 대화 전환 시 스크롤 버튼 상태 동기화
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (!el || !currentConversation?.messages.length) {
            setShowScrollToBottom(false);
            setShowScrollToTop(false);
            return;
        }
        const threshold = 120;
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollToBottom(distanceToBottom > threshold);
        setShowScrollToTop(el.scrollTop > threshold);
    }, [currentConversation?.id, currentConversation?.messages.length]);

    useEffect(() => {
        if (!isStreaming || !responseStartTime) {
            if (!isStreaming) setStreamingElapsedSec(0);
            return;
        }
        const tick = () => setStreamingElapsedSec(Math.floor((Date.now() - responseStartTime) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [isStreaming, responseStartTime]);

    // 새 프로젝트 생성 (백엔드 API 사용)
    // 프로젝트 생성 (useCallback으로 메모이제이션)
    const createNewProject = useCallback(async () => {
        const name = newProjectName.trim();
        if (!name || name.length < 2) return;

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
            setToastMessage('프로젝트가 생성되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
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
            setToastMessage('프로젝트가 생성되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        }
    }, [newProjectName]);

    const RECOMMENDED_TEMPLATES = [
        { name: '학습 노트', desc: '강의·책 내용 정리', icon: '📚' },
        { name: '연구 노트', desc: '문헌·자료 연구', icon: '🔬' },
        { name: '업무 노트', desc: '회의록·업무 정리', icon: '📋' },
    ];

    const createFromTemplate = useCallback(async (templateName: string, templateDesc: string) => {
        try {
            const createdProject = await projectService.createProject({
                name: templateName,
                description: templateDesc,
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
            setProjectListTab('all');
            setToastMessage('프로젝트가 생성되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        } catch (error) {
            errorLogger.error('템플릿 프로젝트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'createFromTemplate',
            });
            const newProject: Project = {
                id: `project-${Date.now()}`,
                name: templateName,
                description: templateDesc,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProjects((prev) => [...prev, newProject]);
            setCurrentProject(newProject);
            setProjectListTab('all');
            setToastMessage('프로젝트가 생성되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        }
    }, []);

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
        apiCall: () => Promise<unknown>,
        maxRetries: number = 3,
        retryDelay: number = 1000
    ): Promise<unknown> => {
        let lastError: unknown;

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
    const extractResponseContent = useCallback((response: unknown): string => {
        const r = response as { data?: unknown } | null | undefined;
        if (!r?.data) {
            return '응답을 생성할 수 없습니다.';
        }
        const data = r.data as Record<string, unknown> | string;
        if (typeof data === 'string') return data;
        const d = data as Record<string, unknown>;
        return (d.response as string) || (d.message as string) || ((d.data as Record<string, unknown>)?.response as string) || '응답을 생성할 수 없습니다.';
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

    // 대화 제목 자동 생성 함수
    const generateConversationTitle = useCallback(async (
        userMessage: string,
        assistantResponse?: string
    ): Promise<string> => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/chat/title`,
                {
                    message: userMessage,
                    assistant_response: assistantResponse,
                    max_length: 30,
                },
                { timeout: 5000 }
            );

            if (response.data?.data?.title) {
                return response.data.data.title;
            }
        } catch (error) {
            errorLogger.warn('대화 제목 자동 생성 실패, 기본 제목 사용', {
                component: 'ChatGPTInterface',
                action: 'generateConversationTitle',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 첫 30자 사용
        return userMessage.substring(0, 30) || '새 대화';
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
    // overrideText: 추천 질문 클릭 등으로 즉시 전송할 때 사용
    const sendMessage = useCallback(async (overrideText?: string) => {
        if (isLoading || !isOnline) return;

        const textToSend = (overrideText ?? input).trim();
        const validationResult = validateInput(textToSend);
        if (validationResult === null) {
            return;
        }
        if (typeof validationResult === 'string') {
            setToastMessage(validationResult);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
            return;
        }

        const trimmedInput: string = validationResult;

        // 입력 히스토리에 추가 (중복 방지, 최대 50개)
        const hist = inputHistoryRef.current;
        if (hist[0] !== trimmedInput) {
            inputHistoryRef.current = [trimmedInput, ...hist].slice(0, 50);
        }
        inputHistoryIndexRef.current = -1;

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
            setConversations((prev) => [conversation, ...prev]);
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
        setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conversation.id);
            if (idx >= 0) {
                return prev.map((c) => (c.id === conversation.id ? updatedConversation : c));
            }
            return [updatedConversation, ...prev];
        });

        setInput('');
        setIsLoading(true);
        setResponseStartTime(Date.now());
        setLastResponseTime(null);

        try {
            const shouldStream = useStreaming && isStreamingSupported();

            if (shouldStream) {
                setIsStreaming(true);

                // AbortController 생성
                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const assistantId = `msg-${Date.now() + 1}`;
                const assistantMessage: Message = {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                };

                const initialMessages = [...updatedMessages, assistantMessage];
                const initialConversation = {
                    ...updatedConversation,
                    messages: initialMessages,
                    updatedAt: new Date(),
                };

                setCurrentConversation(initialConversation);
                setConversations((prev) => {
                    const idx = prev.findIndex((c) => c.id === conversation.id);
                    if (idx >= 0) {
                        return prev.map((c) => (c.id === conversation.id ? initialConversation : c));
                    }
                    return [initialConversation, ...prev];
                });

                let accumulatedText = '';

                await streamChatMessage(trimmedInput, conversation.id, {
                    signal: abortController.signal,
                    requestBody: {
                        quality: 'enhanced',
                        conversation_id: conversation.id,
                        context: buildChatContext(currentProject ?? null),
                    },
                    onChunk: (chunk: string) => {
                        accumulatedText += chunk;
                        // 너무 잦은 상태 업데이트를 막기 위해 rAF로 배치 업데이트
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                        }
                        streamingRafRef.current = requestAnimationFrame(() => {
                            setCurrentConversation((prev) => {
                                if (!prev || prev.id !== conversation.id) return prev;
                                return {
                                    ...prev,
                                    updatedAt: new Date(),
                                    messages: prev.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: accumulatedText } : m
                                    ),
                                };
                            });
                        });
                    },
                    onComplete: async (fullText: string) => {
                        setIsStreaming(false);
                        abortControllerRef.current = null;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                            streamingRafRef.current = null;
                        }
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId ? { ...m, content: fullText } : m
                        );

                        // 새 대화인 경우 제목 자동 생성
                        let newTitle = initialConversation.title;
                        if (initialConversation.title === '새 대화' && finalMessages.length > 0) {
                            newTitle = await generateConversationTitle(trimmedInput, fullText);
                        }

                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                            title: newTitle,
                        };

                        setCurrentConversation(finalConversation);
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            const next =
                                idx >= 0
                                    ? prev.map((c) => (c.id === conversation.id ? finalConversation : c))
                                    : [finalConversation, ...prev];
                            saveConversationsToStorage(next);
                            return next;
                        });
                    },
                    onError: (error: Error) => {
                        setIsStreaming(false);
                        abortControllerRef.current = null;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                            streamingRafRef.current = null;
                        }
                        const errorContent = getErrorMessage(error);
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId
                                ? {
                                    ...m,
                                    content: `❌ **오류 발생**\n\n${errorContent}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                                }
                                : m
                        );
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                        };

                        setCurrentConversation(finalConversation);
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            if (idx >= 0) {
                                return prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                            }
                            return [finalConversation, ...prev];
                        });
                    },
                });
            } else {
                setIsStreaming(false);
                // 백엔드 API 호출 (재시도 로직 포함)
                const response = await apiCallWithRetry(
                    () => axios.post(
                        `${API_BASE_URL}/api/chat`,
                        {
                            message: trimmedInput,
                            quality: 'enhanced',
                            conversation_id: conversation.id,
                            context: buildChatContext(currentProject ?? null),
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

                // 새 대화인 경우 제목 자동 생성
                let newTitle = updatedConversation.title;
                if (updatedConversation.title === '새 대화' && finalMessages.length > 0) {
                    newTitle = await generateConversationTitle(trimmedInput, responseContent);
                }

                const finalConversation = {
                    ...updatedConversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                    title: newTitle,
                };

                setCurrentConversation(finalConversation);
                setConversations((prev) => {
                    const idx = prev.findIndex((c) => c.id === conversation.id);
                    const next =
                        idx >= 0
                            ? prev.map((c) => (c.id === conversation.id ? finalConversation : c))
                            : [finalConversation, ...prev];
                    saveConversationsToStorage(next);
                    return next;
                });
            }
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
            setIsStreaming(false);
            setIsLoading(false);
            // 응답 시간 계산
            setLastResponseTime(prev => {
                const startTime = responseStartTime;
                if (startTime) {
                    return Date.now() - startTime;
                }
                return prev;
            });
            setResponseStartTime(null);
        }
    }, [
        input,
        isLoading,
        isOnline,
        currentConversation,
        conversations,
        currentProject,
        apiCallWithRetry,
        validateInput,
        extractResponseContent,
        getErrorMessage,
        saveConversationsToStorage,
        useStreaming,
        generateConversationTitle,
        responseStartTime,
    ]);

    // 스트리밍 취소 (useCallback으로 메모이제이션)
    const cancelStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
            setIsLoading(false);
            if (streamingRafRef.current) {
                cancelAnimationFrame(streamingRafRef.current);
                streamingRafRef.current = null;
            }
        }
    }, []);

    // Enter 키 처리 (Enter 또는 Cmd/Ctrl+Enter로 전송, Shift+Enter는 줄바꿈)
    // ArrowUp/ArrowDown: 입력 히스토리 탐색 (이번 세션에서 전송한 메시지)
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        } else if (e.key === 'Escape' && isStreaming) {
            e.preventDefault();
            cancelStreaming();
        } else if (e.key === 'ArrowUp' && inputHistoryRef.current.length > 0) {
            const hist = inputHistoryRef.current;
            let idx = inputHistoryIndexRef.current;
            if (idx < hist.length - 1) {
                idx += 1;
                inputHistoryIndexRef.current = idx;
                setInput(hist[idx]);
                e.preventDefault();
            } else if (idx === -1) {
                inputHistoryIndexRef.current = 0;
                setInput(hist[0]);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowDown' && inputHistoryIndexRef.current >= 0) {
            const idx = inputHistoryIndexRef.current;
            if (idx > 0) {
                inputHistoryIndexRef.current = idx - 1;
                setInput(inputHistoryRef.current[inputHistoryIndexRef.current]);
                e.preventDefault();
            } else {
                inputHistoryIndexRef.current = -1;
                setInput('');
                e.preventDefault();
            }
        }
    }, [sendMessage, isStreaming, cancelStreaming]);

    // 대화 삭제 요청 (모달 열기)
    const requestDeleteConversation = useCallback((conversation: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmConversation(conversation);
    }, []);

    // 대화 삭제 확정
    const confirmDeleteConversation = useCallback(() => {
        if (!deleteConfirmConversation) return;

        const id = deleteConfirmConversation.id;
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
        setDeleteConfirmConversation(null);
        setToastMessage('대화가 삭제되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [deleteConfirmConversation]);

    // 대화 삭제 취소
    const cancelDeleteConversation = useCallback(() => {
        setDeleteConfirmConversation(null);
    }, []);

    // 프로젝트 삭제 요청 (모달 열기)
    const requestDeleteProject = useCallback((project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmProject(project);
    }, []);

    // 프로젝트 삭제 확정
    const confirmDeleteProject = useCallback(async () => {
        if (!deleteConfirmProject) return;
        const id = deleteConfirmProject.id;
        const name = deleteConfirmProject.name;
        setDeleteConfirmProject(null);

        try {
            const ok = await projectService.deleteProject(id);
            if (ok) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
                if (currentProject?.id === id) {
                    const remaining = projects.filter((p) => p.id !== id);
                    setCurrentProject(remaining[0] ?? null);
                    setCurrentConversation(null);
                }
                setConversations((prev) => prev.filter((c) => c.projectId !== id));
                setToastMessage('프로젝트가 삭제되었습니다');
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 2000);
            }
        } catch (error) {
            errorLogger.error('프로젝트 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'deleteProject',
            });
            setToastMessage(`"${name}" 삭제에 실패했습니다.`);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
        }
    }, [deleteConfirmProject, currentProject, projects]);

    // 프로젝트 삭제 취소
    const cancelDeleteProject = useCallback(() => {
        setDeleteConfirmProject(null);
    }, []);

    // 대화 복제
    const duplicateConversation = useCallback((conversation: Conversation) => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: `${conversation.title} (복사본)`,
            messages: conversation.messages.map((msg) => ({
                ...msg,
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(msg.timestamp),
            })),
            projectId: conversation.projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
            pinned: false,
        };

        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        setToastMessage('대화가 복제되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, []);

    // 검색어 하이라이트 함수
    const highlightSearchText = useCallback((text: string, query: string): React.ReactNode => {
        if (!query.trim()) return text;

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return text;

        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);

        return (
            <>
                {before}
                <mark style={{
                    backgroundColor: 'var(--accent-warning)',
                    color: 'var(--text-primary)',
                    padding: '0 2px',
                    borderRadius: '2px',
                }}>{match}</mark>
                {after}
            </>
        );
    }, []);

    // 대화 이름 편집 시작
    const startEditingConversationTitle = useCallback((conversationId: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingConversationId(conversationId);
        setEditingConversationTitle(currentTitle);
    }, []);

    // 대화 이름 편집 취소
    const cancelEditingConversationTitle = useCallback(() => {
        setEditingConversationId(null);
        setEditingConversationTitle('');
    }, []);

    // 대화 이름 저장
    const saveConversationTitle = useCallback((conversationId: string) => {
        const newTitle = editingConversationTitle.trim();
        if (!newTitle || newTitle.length < 2) {
            cancelEditingConversationTitle();
            return;
        }

        setConversations(prev => {
            const updated = prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, title: newTitle, updatedAt: new Date() }
                    : conv
            );
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
                errorLogger.error('대화 제목 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'saveConversationTitle',
                });
            }
            return updated;
        });

        // 현재 대화도 업데이트
        setCurrentConversation(prev =>
            prev?.id === conversationId
                ? { ...prev, title: newTitle, updatedAt: new Date() }
                : prev
        );

        cancelEditingConversationTitle();
        setToastMessage('제목이 저장되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [editingConversationTitle, cancelEditingConversationTitle]);

    // 상대적 시간 포맷 (오늘, 어제, 날짜)
    const formatRelativeTime = useCallback((date: Date): string => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (targetDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else if (targetDate.getTime() === yesterday.getTime()) {
            return '어제';
        } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${days[date.getDay()]}요일`;
        } else {
            return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
    }, []);

    // 메시지 복사 (토스트 알림 포함, useCallback으로 메모이제이션)
    const copyMessage = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setToastMessage('복사되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        } catch (error) {
            errorLogger.error('복사 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'copyMessage',
            });
            setToastMessage('복사에 실패했습니다.');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2500);
        }
    }, []);

    // 메시지 북마크 토글
    const toggleBookmark = useCallback((messageId: string) => {
        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const msg = prev.messages.find((m) => m.id === messageId);
            const willBeBookmarked = !msg?.bookmarked;
            const updated = {
                ...prev,
                messages: prev.messages.map((m) =>
                    m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
                ),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            setToastMessage(willBeBookmarked ? '북마크에 추가되었습니다' : '북마크가 해제되었습니다');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
            return updated;
        });
    }, []);

    // 메시지 반응 (좋아요/싫어요)
    const setMessageReaction = useCallback((messageId: string, reaction: MessageReaction) => {
        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                messages: prev.messages.map((m) =>
                    m.id === messageId
                        ? { ...m, reaction: m.reaction === reaction ? null : reaction }
                        : m
                ),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            return updated;
        });
    }, []);

    // 개별 메시지 삭제 요청 (확인 모달 열기)
    const requestDeleteMessage = useCallback((messageId: string) => {
        setDeleteConfirmMessageId(messageId);
    }, []);

    // 개별 메시지 삭제 확정
    const confirmDeleteMessage = useCallback(() => {
        const messageId = deleteConfirmMessageId;
        setDeleteConfirmMessageId(null);
        if (!messageId) return;

        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== messageId),
                updatedAt: new Date(),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            return updated;
        });
        setToastMessage('메시지가 삭제되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [deleteConfirmMessageId]);

    // 메시지 접기/펼치기 토글
    const toggleMessageCollapse = useCallback((messageId: string) => {
        setCollapsedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    }, []);

    // 긴 메시지 여부 확인 (500자 이상 또는 15줄 이상)
    const isLongMessage = useCallback((content: string) => {
        return content.length > 500 || content.split('\n').length > 15;
    }, []);

    // 현재 대화 메시지 전체 삭제 요청 (확인 모달 열기)
    const requestClearMessages = useCallback(() => {
        if (!currentConversation) return;
        setShowClearMessagesConfirm(true);
    }, [currentConversation]);

    // 현재 대화 메시지 전체 삭제 확정
    const confirmClearMessages = useCallback(() => {
        setShowClearMessagesConfirm(false);
        if (!currentConversation) return;

        const updated = {
            ...currentConversation,
            messages: [],
            updatedAt: new Date(),
        };
        setCurrentConversation(updated);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updated : c));
        setCollapsedMessages(new Set());
        setToastMessage('메시지가 모두 삭제되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [currentConversation]);

    // 대화 고정/해제
    const togglePinConversation = useCallback((conversationId: string) => {
        const conv = conversations.find((c) => c.id === conversationId);
        const willBePinned = conv ? !conv.pinned : false;
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, pinned: !c.pinned } : c
            )
        );
        setCurrentConversation((prev) => {
            if (prev && prev.id === conversationId) {
                return { ...prev, pinned: !prev.pinned };
            }
            return prev;
        });
        setToastMessage(willBePinned ? '대화가 상단에 고정되었습니다' : '고정이 해제되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [conversations]);

    // 테마 전환
    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('chatgpt-theme', next);
            return next;
        });
    }, []);

    // 시스템 테마 변경 감지
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem('chatgpt-theme');
            if (!savedTheme) {
                setTheme(e.matches ? 'light' : 'dark');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // 네트워크 상태 감지
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 스토리지 사용량 계산
    useEffect(() => {
        const calculateStorageUsage = () => {
            try {
                let totalSize = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        const value = localStorage.getItem(key) || '';
                        totalSize += (key.length + value.length) * 2; // UTF-16 인코딩
                    }
                }
                // localStorage 일반적 제한: 5MB
                setStorageUsage({
                    used: totalSize,
                    total: 5 * 1024 * 1024,
                });
            } catch {
                setStorageUsage(null);
            }
        };

        calculateStorageUsage();
        // 대화가 변경될 때마다 재계산
    }, [conversations]);

    /* CORBU AI UI Kit — theme.css 변수 사용 (Figma node 323-168775, 7-3) */
    const themeStyles = useMemo(() => ({
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        bgTertiary: 'var(--bg-tertiary)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        inputBg: 'var(--bg-tertiary)',
        messageBgUser: 'var(--accent-info-muted)',
        messageBgAssistant: 'var(--bg-secondary)',
        accentColor: 'var(--accent-info)',
    }), []);

    // 북마크된 메시지 필터링
    const bookmarkedMessages = useMemo(() => {
        if (!currentConversation) return [];
        return currentConversation.messages.filter((m) => m.bookmarked);
    }, [currentConversation]);

    // 대화 내 검색 결과
    const messageSearchResults = useMemo(() => {
        if (!currentConversation || !messageSearchQuery.trim()) return [];
        const query = messageSearchQuery.toLowerCase();
        return currentConversation.messages
            .map((m, index) => ({ message: m, index }))
            .filter(({ message }) => message.content.toLowerCase().includes(query));
    }, [currentConversation, messageSearchQuery]);

    // 대화 통계
    const conversationStats = useMemo(() => {
        if (!currentConversation) return null;
        const messages = currentConversation.messages;
        const userMessages = messages.filter(m => m.role === 'user');
        const assistantMessages = messages.filter(m => m.role === 'assistant');
        const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
        const estimatedTokens = Math.ceil(totalChars / 4);
        return {
            total: messages.length,
            user: userMessages.length,
            assistant: assistantMessages.length,
            chars: totalChars,
            tokens: estimatedTokens,
        };
    }, [currentConversation]);

    // 검색 결과 탐색
    const navigateMessageSearch = useCallback((direction: 'prev' | 'next') => {
        if (messageSearchResults.length === 0) return;
        setMessageSearchIndex((prev) => {
            if (direction === 'next') {
                return (prev + 1) % messageSearchResults.length;
            } else {
                return (prev - 1 + messageSearchResults.length) % messageSearchResults.length;
            }
        });
    }, [messageSearchResults.length]);

    // 검색어 하이라이트 (플레인 텍스트)
    const highlightTextForPlainText = useCallback((text: string): React.ReactNode => {
        if (!messageSearchQuery.trim() || !text) return text;
        const query = messageSearchQuery.trim();
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => {
            const testRegex = new RegExp(`^${escaped}$`, 'i');
            return testRegex.test(part) ? (
                <mark key={i} className="search-highlight">{part}</mark>
            ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
            );
        });
    }, [messageSearchQuery]);

    // 검색 결과로 스크롤
    useEffect(() => {
        if (messageSearchResults.length > 0 && messageSearchQuery.trim()) {
            const targetMessage = messageSearchResults[messageSearchIndex];
            const element = document.getElementById(`message-${targetMessage.message.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.animation = 'highlight-pulse 1s ease-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 1000);
            }
        }
    }, [messageSearchIndex, messageSearchResults, messageSearchQuery]);

    // 빠른 후속 질문 제안 생성
    const generateQuickSuggestions = useCallback((lastAssistantMessage: string, lastUserMessage: string) => {
        const suggestions: string[] = [];
        const msgLower = lastAssistantMessage.toLowerCase();
        const userMsgLower = lastUserMessage.toLowerCase();

        // 단계별 설명이 있으면 "더 자세히" 제안
        if (msgLower.includes('단계') || msgLower.includes('방법')) {
            suggestions.push('더 자세히 설명해줘');
            suggestions.push('예시를 들어줘');
        }

        // 장단점이 있으면 대안 제안
        if (msgLower.includes('장점') || msgLower.includes('단점')) {
            suggestions.push('대안이 있을까?');
            suggestions.push('어떤 경우에 추천해?');
        }

        // 비교 내용이 있으면 추천 제안
        if (msgLower.includes('비교') || msgLower.includes('vs')) {
            suggestions.push('어떤 걸 추천해?');
            suggestions.push('내 상황에 맞는 건?');
        }

        // 기본 후속 질문
        if (suggestions.length === 0) {
            suggestions.push('더 알려줘');
            suggestions.push('요약해줘');
        }

        // 사용자 질문 기반 후속 제안
        if (userMsgLower.includes('어떻게')) {
            suggestions.push('주의할 점은?');
        }
        if (userMsgLower.includes('추천')) {
            suggestions.push('다른 옵션은?');
        }

        // 최대 3개로 제한
        setQuickSuggestions(suggestions.slice(0, 3));
    }, []);

    // TTS: 메시지 음성 읽기
    const speakMessage = useCallback((messageId: string, content: string) => {
        // 이미 읽고 있는 중이면 중지
        if (speakingMessageId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
            return;
        }

        // 다른 메시지 읽고 있으면 중지
        if (speakingMessageId) {
            window.speechSynthesis.cancel();
        }

        // 마크다운/코드 블록 제거
        const cleanText = content
            .replace(/```[\s\S]*?```/g, '코드 블록')
            .replace(/`[^`]+`/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
            .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
            .replace(/~~([^~]+)~~/g, '$1')
            .replace(/>\s/g, '')
            .replace(/[-*+]\s/g, '')
            .replace(/\d+\.\s/g, '')
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // 한국어 음성 찾기
        const voices = window.speechSynthesis.getVoices();
        const koreanVoice = voices.find(v => v.lang.includes('ko'));
        if (koreanVoice) {
            utterance.voice = koreanVoice;
        }

        utterance.onend = () => {
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
        };

        speechSynthRef.current = utterance;
        setSpeakingMessageId(messageId);
        window.speechSynthesis.speak(utterance);
    }, [speakingMessageId]);

    // TTS 정리
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // 타임스탬프 표시 토글
    const toggleTimestamps = useCallback(() => {
        setShowTimestamps(prev => {
            const newValue = !prev;
            localStorage.setItem('chatgpt-show-timestamps', String(newValue));
            return newValue;
        });
    }, []);

    // 대화 메시지가 업데이트될 때 빠른 제안 생성
    useEffect(() => {
        if (!currentConversation || currentConversation.messages.length < 2) {
            setQuickSuggestions([]);
            return;
        }

        const messages = currentConversation.messages;
        const lastMessage = messages[messages.length - 1];
        const secondLastMessage = messages[messages.length - 2];

        // 마지막 메시지가 AI 응답이고 로딩 중이 아닐 때만 제안 생성
        if (lastMessage?.role === 'assistant' && secondLastMessage?.role === 'user' && !isLoading && !isStreaming) {
            generateQuickSuggestions(lastMessage.content, secondLastMessage.content);
        } else {
            setQuickSuggestions([]);
        }
    // currentConversation intentionally omitted to avoid re-running on ref identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation?.messages, isLoading, isStreaming, generateQuickSuggestions]);

    // 소스 기반 추천 질문 로드 (프로젝트 채팅 빈 대화 시)
    useEffect(() => {
        if (
            !currentProject ||
            !currentConversation ||
            currentConversation.projectId !== currentProject.id ||
            currentConversation.messages.length > 0
        ) {
            setSuggestedQuestionsFromSource([]);
            return;
        }
        let cancelled = false;
        projectService
            .getNotebookSuggestedQuestions(currentProject.id)
            .then((questions) => {
                if (!cancelled && questions && questions.length > 0) {
                    setSuggestedQuestionsFromSource(questions.slice(0, 5));
                } else {
                    setSuggestedQuestionsFromSource([]);
                }
            })
            .catch(() => {
                if (!cancelled) setSuggestedQuestionsFromSource([]);
            });
        return () => { cancelled = true; };
    // currentProject/currentConversation 제외: 객체 참조 변경 시 불필요한 재요청 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject?.id, currentConversation?.id, currentConversation?.projectId, currentConversation?.messages?.length]);

    // 대화 내보내기 (Markdown, JSON, 또는 클립보드 복사)
    const exportConversation = useCallback((format: 'markdown' | 'json' | 'html' | 'clipboard' = 'markdown') => {
        if (!currentConversation || currentConversation.messages.length === 0) {
            setToastMessage('내보낼 대화가 없습니다.');
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2500);
            return;
        }

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'markdown' || format === 'clipboard') {
            const lines: string[] = [
                `# ${currentConversation.title}`,
                '',
                `> 생성일: ${currentConversation.createdAt.toLocaleString('ko-KR')}`,
                `> 메시지 수: ${currentConversation.messages.length}`,
                '',
                '---',
                '',
            ];

            currentConversation.messages.forEach((msg) => {
                const role = msg.role === 'user' ? '👤 **사용자**' : '🤖 **AI**';
                const time = msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                lines.push(`### ${role} (${time})`);
                lines.push('');
                lines.push(msg.content);
                lines.push('');
                lines.push('---');
                lines.push('');
            });

            content = lines.join('\n');
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
            mimeType = 'text/markdown';

            if (format === 'clipboard') {
                navigator.clipboard.writeText(content).then(() => {
                    setToastMessage('복사되었습니다');
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2000);
                }).catch(() => {
                    setToastMessage('클립보드에 복사에 실패했습니다.');
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2500);
                });
                return;
            }
        } else if (format === 'html') {
            const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const msgsHtml = currentConversation.messages.map((msg) => {
                const role = msg.role === 'user' ? '사용자' : 'AI';
                const time = msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                const css = msg.role === 'user' ? 'background:#f0f0f0;margin-left:20%;border-radius:12px 12px 4px 12px' : 'background:#e8f4fd;margin-right:20%;border-radius:12px 12px 12px 4px';
                return `<div style="margin:12px 0"><div style="font-size:11px;color:#666;margin-bottom:4px">${escapeHtml(role)} · ${escapeHtml(time)}</div><div style="padding:12px 16px;${css}">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div></div>`;
            }).join('');
            content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(currentConversation.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px;line-height:1.6;color:#333}h1{font-size:1.25rem;margin-bottom:8px}.meta{font-size:12px;color:#666;margin-bottom:24px}</style></head><body><h1>${escapeHtml(currentConversation.title)}</h1><div class="meta">${currentConversation.createdAt.toLocaleString('ko-KR')} · ${currentConversation.messages.length}개 메시지</div><hr/>${msgsHtml}</body></html>`;
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
            mimeType = 'text/html';
        } else {
            const exportData = {
                id: currentConversation.id,
                title: currentConversation.title,
                createdAt: currentConversation.createdAt.toISOString(),
                updatedAt: currentConversation.updatedAt.toISOString(),
                messages: currentConversation.messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp.toISOString(),
                })),
            };
            content = JSON.stringify(exportData, null, 2);
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
            mimeType = 'application/json';
        }

        // 파일 다운로드
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setToastMessage('다운로드되었습니다');
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    }, [currentConversation]);

    // 대화 가져오기 (JSON, Markdown 또는 HTML 파일)
    const importConversation = useCallback(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.md,.html';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImportingConversation(true);
            try {
                const text = await file.text();
                const name = file.name.toLowerCase();
                const ext = name.endsWith('.json') ? 'json' : name.endsWith('.html') ? 'html' : 'md';

                let title: string;
                let messages: Array<{ role: 'user' | 'assistant'; content: string }>;

                if (ext === 'json') {
                    const data = JSON.parse(text);
                if (!data.title || !data.messages || !Array.isArray(data.messages)) {
                    setToastMessage('잘못된 대화 파일 형식입니다.');
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 3000);
                        return;
                    }
                    title = data.title || '가져온 대화';
                    messages = data.messages.map((msg: { role: string; content: string }) => ({
                        role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                        content: String(msg.content ?? ''),
                    }));
                } else if (ext === 'md') {
                    // Markdown 파싱 (내보내기 형식: ### 👤 **사용자** / ### 🤖 **AI**)
                    const firstLine = text.split('\n')[0]?.trim() || '';
                    title = firstLine.startsWith('# ') ? firstLine.slice(2).trim() || '가져온 대화' : '가져온 대화';
                    const msgBlocks = text.split(/^### /m).filter(Boolean);
                    messages = [];
                    for (const block of msgBlocks) {
                        const firstNewline = block.indexOf('\n');
                        const header = firstNewline >= 0 ? block.slice(0, firstNewline) : block;
                        const content = firstNewline >= 0 ? block.slice(firstNewline).replace(/^---\s*$/gm, '').trim() : '';
                        const hasRole = header.includes('사용자') || header.includes('👤') || header.includes('AI') || header.includes('🤖');
                        if (!hasRole) continue; // 메타 블록 스킵
                        const isUser = header.includes('사용자') || header.includes('👤');
                        messages.push({ role: isUser ? 'user' : 'assistant', content: content || header });
                    }
                    if (messages.length === 0) {
                        setToastMessage('Markdown 파일에서 대화 내용을 찾을 수 없습니다.');
                        setShowCopyToast(true);
                        setTimeout(() => setShowCopyToast(false), 3000);
                        return;
                    }
                } else {
                    // HTML 파싱 (내보내기 형식 호환)
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    title = doc.querySelector('h1')?.textContent?.trim() || doc.querySelector('title')?.textContent?.trim() || '가져온 대화';
                    messages = [];
                    for (const child of Array.from(doc.body.children)) {
                        if (child.tagName !== 'DIV') continue;
                        const innerDivs = child.querySelectorAll(':scope > div');
                        if (innerDivs.length >= 2) {
                            const roleText = innerDivs[0].textContent || '';
                            const content = (innerDivs[1].innerHTML || '')
                                .replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<[^>]+>/g, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&quot;/g, '"')
                                .trim();
                            if (!roleText.includes('사용자') && !roleText.includes('AI')) continue;
                            const isUser = roleText.includes('사용자');
                            messages.push({ role: isUser ? 'user' : 'assistant', content });
                        }
                    }
                    if (messages.length === 0) {
                        setToastMessage('HTML 파일에서 대화 내용을 찾을 수 없습니다.');
                        setShowCopyToast(true);
                        setTimeout(() => setShowCopyToast(false), 3000);
                        return;
                    }
                }

                const newConversation: Conversation = {
                    id: `conv-${Date.now()}`,
                    title,
                    messages: messages.map((msg, i) => ({
                        id: `msg-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(),
                        bookmarked: false,
                    })),
                    projectId: currentProject?.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    pinned: false,
                };

                setConversations((prev) => [newConversation, ...prev]);
                setCurrentConversation(newConversation);

                setToastMessage('대화를 가져왔습니다');
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 2000);
            } catch (error) {
                errorLogger.error('대화 가져오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'importConversation',
                });
                setToastMessage('대화 파일을 읽는 중 오류가 발생했습니다.');
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 3000);
            } finally {
                setImportingConversation(false);
            }
        };
        fileInput.click();
    }, [currentProject]);

    // 메시지 재생성 (마지막 AI 응답을 다시 생성)
    const regenerateMessage = useCallback(async (messageId: string) => {
        if (!currentConversation || isLoading || isStreaming) return;

        // 해당 메시지의 인덱스 찾기
        const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        const targetMessage = currentConversation.messages[messageIndex];
        if (targetMessage.role !== 'assistant') return;

        // 바로 이전 사용자 메시지 찾기
        let userMessageIndex = messageIndex - 1;
        while (userMessageIndex >= 0 && currentConversation.messages[userMessageIndex].role !== 'user') {
            userMessageIndex--;
        }
        if (userMessageIndex < 0) return;

        const userMessage = currentConversation.messages[userMessageIndex];

        // 해당 메시지까지의 히스토리만 유지 (재생성할 메시지 제거)
        const messagesBeforeRegeneration = currentConversation.messages.slice(0, messageIndex);

        // 대화 상태 업데이트
        const updatedConversation = {
            ...currentConversation,
            messages: messagesBeforeRegeneration,
            updatedAt: new Date(),
        };
        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updatedConversation : c));

        // 입력창에 원래 질문 설정하고 전송
        setInput(userMessage.content);

        // 약간의 딜레이 후 메시지 전송 (상태 업데이트 후)
        setTimeout(() => {
            // input이 설정된 후 sendMessage 호출을 위해 직접 API 호출
            const trimmedInput = userMessage.content.trim();
            if (!trimmedInput) return;

            setInput('');
            setIsLoading(true);

            const shouldStream = useStreaming && isStreamingSupported();
            const conversation = updatedConversation;

            if (shouldStream) {
                setIsStreaming(true);
                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const assistantId = `msg-${Date.now() + 1}`;
                const assistantMessage: Message = {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                };

                const initialMessages = [...messagesBeforeRegeneration, assistantMessage];
                const initialConversation = {
                    ...conversation,
                    messages: initialMessages,
                    updatedAt: new Date(),
                };

                setCurrentConversation(initialConversation);
                setConversations(prev => prev.map(c => c.id === conversation.id ? initialConversation : c));

                let accumulatedText = '';

                streamChatMessage(trimmedInput, conversation.id, {
                    signal: abortController.signal,
                    requestBody: {
                        quality: 'enhanced',
                        conversation_id: conversation.id,
                        context: buildChatContext(currentProject ?? null),
                    },
                    onChunk: (chunk: string) => {
                        accumulatedText += chunk;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                        }
                        streamingRafRef.current = requestAnimationFrame(() => {
                            setCurrentConversation((prev) => {
                                if (!prev || prev.id !== conversation.id) return prev;
                                return {
                                    ...prev,
                                    updatedAt: new Date(),
                                    messages: prev.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: accumulatedText } : m
                                    ),
                                };
                            });
                        });
                    },
                    onComplete: (fullText: string) => {
                        setIsStreaming(false);
                        setIsLoading(false);
                        abortControllerRef.current = null;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                            streamingRafRef.current = null;
                        }
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId ? { ...m, content: fullText } : m
                        );
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                        };
                        setCurrentConversation(finalConversation);
                        setConversations((prev) => {
                            const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                            saveConversationsToStorage(next);
                            return next;
                        });
                    },
                    onError: (error: Error) => {
                        setIsStreaming(false);
                        setIsLoading(false);
                        abortControllerRef.current = null;
                        const errorContent = getErrorMessage(error);
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId
                                ? { ...m, content: `❌ **재생성 오류**\n\n${errorContent}` }
                                : m
                        );
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                        };
                        setCurrentConversation(finalConversation);
                        setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
                    },
                });
            } else {
                // 비스트리밍 모드
                axios.post(
                    `${API_BASE_URL}/api/chat`,
                    {
                        message: trimmedInput,
                        quality: 'enhanced',
                        conversation_id: conversation.id,
                        context: buildChatContext(currentProject ?? null),
                    },
                    { timeout: 30000 }
                ).then(response => {
                    const responseContent = extractResponseContent(response);
                    const assistantMessage: Message = {
                        id: `msg-${Date.now() + 1}`,
                        role: 'assistant',
                        content: responseContent,
                        timestamp: new Date(),
                    };
                    const finalMessages = [...messagesBeforeRegeneration, assistantMessage];
                    const finalConversation = {
                        ...conversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations((prev) => {
                        const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                        saveConversationsToStorage(next);
                        return next;
                    });
                }).catch(error => {
                    const errorContent = getErrorMessage(error);
                    const errorMessage: Message = {
                        id: `msg-${Date.now() + 1}`,
                        role: 'assistant',
                        content: `❌ **재생성 오류**\n\n${errorContent}`,
                        timestamp: new Date(),
                    };
                    const finalMessages = [...messagesBeforeRegeneration, errorMessage];
                    const finalConversation = {
                        ...conversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
                }).finally(() => {
                    setIsLoading(false);
                });
            }
        }, 50);
    }, [
        currentConversation,
        isLoading,
        isStreaming,
        useStreaming,
        currentProject,
        getErrorMessage,
        extractResponseContent,
        saveConversationsToStorage,
    ]);

    // 메시지 편집 시작
    const startEditingMessage = useCallback((messageId: string, content: string) => {
        if (isLoading || isStreaming) return;
        setEditingMessageId(messageId);
        setEditingContent(content);
    }, [isLoading, isStreaming]);

    // 메시지 편집 취소
    const cancelEditingMessage = useCallback(() => {
        setEditingMessageId(null);
        setEditingContent('');
    }, []);

    // 메시지 편집 저장 및 재전송
    const saveEditedMessage = useCallback(async (messageId: string) => {
        if (!currentConversation || isLoading || isStreaming) return;

        const trimmedContent = editingContent.trim();
        if (!trimmedContent) {
            cancelEditingMessage();
            return;
        }

        // 편집한 메시지의 인덱스 찾기
        const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) {
            cancelEditingMessage();
            return;
        }

        const targetMessage = currentConversation.messages[messageIndex];
        if (targetMessage.role !== 'user') {
            cancelEditingMessage();
            return;
        }

        // 편집한 메시지까지만 유지 (이후 메시지 제거)
        const messagesUntilEdited = currentConversation.messages.slice(0, messageIndex);
        const editedUserMessage: Message = {
            ...targetMessage,
            content: trimmedContent,
            timestamp: new Date(),
        };

        const updatedConversation = {
            ...currentConversation,
            messages: [...messagesUntilEdited, editedUserMessage],
            updatedAt: new Date(),
        };

        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updatedConversation : c));
        cancelEditingMessage();

        // 새 응답 생성
        setIsLoading(true);
        const conversation = updatedConversation;

        const shouldStream = useStreaming && isStreamingSupported();

        if (shouldStream) {
            setIsStreaming(true);
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            const assistantId = `msg-${Date.now() + 1}`;
            const assistantMessage: Message = {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };

            const initialMessages = [...updatedConversation.messages, assistantMessage];
            const initialConversation = {
                ...conversation,
                messages: initialMessages,
                updatedAt: new Date(),
            };

            setCurrentConversation(initialConversation);
            setConversations(prev => prev.map(c => c.id === conversation.id ? initialConversation : c));

            let accumulatedText = '';

            // 대화 히스토리 구성 (최근 10개 메시지)
            const conversationHistory = updatedConversation.messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content,
            }));

            streamChatMessage(trimmedContent, conversation.id, {
                signal: abortController.signal,
                requestBody: {
                    quality: 'enhanced',
                    conversation_id: conversation.id,
                    context: buildChatContext(currentProject ?? null, { conversation_history: conversationHistory }),
                    // 응답 스타일 및 다양성 옵션
                    response_style: responseStyle,
                    perspective: perspective,
                    max_tokens: responseStyle === 'comprehensive' ? 8192 : 4096,
                    handle_multiple_questions: true,
                    diversity: true,
                    temperature: 0.8,
                },
                onChunk: (chunk: string) => {
                    accumulatedText += chunk;
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                    }
                    streamingRafRef.current = requestAnimationFrame(() => {
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: accumulatedText } : m
                                ),
                            };
                        });
                    });
                },
                onComplete: (fullText: string) => {
                    setIsStreaming(false);
                    setIsLoading(false);
                    abortControllerRef.current = null;
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                        streamingRafRef.current = null;
                    }
                    const finalMessages = initialMessages.map((m) =>
                        m.id === assistantId ? { ...m, content: fullText } : m
                    );
                    const finalConversation = {
                        ...initialConversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations((prev) => {
                        const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                        saveConversationsToStorage(next);
                        return next;
                    });
                },
                onError: (error: Error) => {
                    setIsStreaming(false);
                    setIsLoading(false);
                    abortControllerRef.current = null;
                    const errorContent = getErrorMessage(error);
                    const finalMessages = initialMessages.map((m) =>
                        m.id === assistantId
                            ? { ...m, content: `❌ **오류 발생**\n\n${errorContent}` }
                            : m
                    );
                    const finalConversation = {
                        ...initialConversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
                },
            });
        } else {
            // 비스트리밍 모드
            axios.post(
                `${API_BASE_URL}/api/chat`,
                {
                    message: trimmedContent,
                    quality: 'enhanced',
                    conversation_id: conversation.id,
                    context: buildChatContext(currentProject ?? null),
                },
                { timeout: 30000 }
            ).then(response => {
                const responseContent = extractResponseContent(response);
                const assistantMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    content: responseContent,
                    timestamp: new Date(),
                };
                const finalMessages = [...updatedConversation.messages, assistantMessage];
                const finalConversation = {
                    ...conversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                };
                setCurrentConversation(finalConversation);
                setConversations((prev) => {
                    const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                    saveConversationsToStorage(next);
                    return next;
                });
            }).catch(error => {
                const errorContent = getErrorMessage(error);
                const errorMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    content: `❌ **오류 발생**\n\n${errorContent}`,
                    timestamp: new Date(),
                };
                const finalMessages = [...updatedConversation.messages, errorMessage];
                const finalConversation = {
                    ...conversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                };
                setCurrentConversation(finalConversation);
                setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [
        currentConversation,
        editingContent,
        isLoading,
        isStreaming,
        useStreaming,
        currentProject,
        getErrorMessage,
        extractResponseContent,
        saveConversationsToStorage,
        cancelEditingMessage,
        responseStyle,
        perspective,
    ]);

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

        // 고정된 대화를 상단에, 그 다음 정렬 옵션에 따라 정렬
        return [...filtered].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;

            switch (sortOption) {
                case 'name':
                    return a.title.localeCompare(b.title, 'ko');
                case 'messages':
                    return b.messages.length - a.messages.length;
                case 'recent':
                default:
                    return b.updatedAt.getTime() - a.updatedAt.getTime();
            }
        });
    }, [conversations, currentProject, searchQuery, sortOption]);

    // 전역 키보드 단축키
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // 모달이 열려 있거나 편집 중이면 무시 (Escape는 별도 처리)
            const modalOpen = showProjectModal || showProjectEditModal || showProModal || editingMessageId || deleteConfirmConversation ||
                deleteConfirmProject || deleteConfirmMessageId || showClearMessagesConfirm || showShareModal || showShortcutsHelp;
            if (modalOpen && e.key !== 'Escape') return;

            const isInputFocused = document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA';

            // Ctrl/Cmd + N: 새 대화
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                startNewConversation();
                return;
            }

            // Ctrl/Cmd + /: 사이드바 토글
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

            // Ctrl/Cmd + E: 대화 내보내기
            if ((e.ctrlKey || e.metaKey) && e.key === 'e' && currentConversation) {
                e.preventDefault();
                exportConversation('markdown');
                return;
            }

            // Ctrl/Cmd + Shift + D: 대화 복제
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D' && currentConversation && currentConversation.messages.length > 0) {
                e.preventDefault();
                duplicateConversation(currentConversation);
                return;
            }

            // Ctrl/Cmd + Shift + I: 대화 가져오기 (가져오는 중에는 무시)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I' && !importingConversation) {
                e.preventDefault();
                importConversation();
                return;
            }

            // Ctrl/Cmd + F: 대화 내 검색
            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && currentConversation) {
                e.preventDefault();
                setShowMessageSearch(prev => !prev);
                return;
            }

            // Escape: 스트리밍 취소, 검색·단축키 도움말 닫기
            if (e.key === 'Escape') {
                if (showShortcutsHelp) {
                    setShowShortcutsHelp(false);
                    return;
                }
                if (showMessageSearch) {
                    setShowMessageSearch(false);
                    setMessageSearchQuery('');
                    setMessageSearchIndex(0);
                    return;
                }
                if (isStreaming) {
                    e.preventDefault();
                    cancelStreaming();
                    return;
                }
            }

            // / 또는 Ctrl/Cmd + L: 입력창 포커스 (입력 중이 아닐 때)
            if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'l')) && !isInputFocused) {
                e.preventDefault();
                inputRef.current?.focus();
                return;
            }

            // ?: 키보드 단축키 도움말
            if (e.key === '?' && !isInputFocused) {
                e.preventDefault();
                setShowShortcutsHelp(prev => !prev);
                return;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [showProjectModal, showProjectEditModal, showProModal, editingMessageId, isStreaming, currentConversation, startNewConversation, exportConversation, duplicateConversation, importConversation, cancelStreaming, showMessageSearch, showShortcutsHelp, importingConversation, deleteConfirmConversation, deleteConfirmProject, deleteConfirmMessageId, showClearMessagesConfirm, showShareModal]);

    // 단축키 도움말 모달 포커스 관리
    useEffect(() => {
        if (showShortcutsHelp) {
            prevFocusRef.current = document.activeElement as HTMLElement | null;
            const t = setTimeout(() => shortcutsCloseRef.current?.focus(), 50);
            return () => clearTimeout(t);
        } else if (prevFocusRef.current) {
            prevFocusRef.current.focus();
            prevFocusRef.current = null;
        }
    }, [showShortcutsHelp]);

    // 문서 제목 동적 업데이트
    useEffect(() => {
        if (viewMode === 'notebook' && currentProject) {
            document.title = `${currentProject.name} - CORBU AI`;
        } else if (viewMode === 'chat' && currentConversation?.title) {
            document.title = `${currentConversation.title} - CORBU AI`;
        } else {
            document.title = 'CORBU AI';
        }
        return () => { document.title = 'CORBU AI'; };
    }, [viewMode, currentProject, currentConversation]);

    // 입력창 자동 높이 조절
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [input]);

    return (
        <div
            className={`chatgpt-interface ${theme}`}
            style={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: themeStyles.bgPrimary,
                color: themeStyles.textPrimary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'background-color 0.3s, color 0.3s',
            }}
        >
            {/* 스킵 링크: 키보드 사용자·스크린 리더용 */}
            <a
                href="#chat-main-content"
                className="skip-to-main"
                style={{
                    position: 'absolute',
                    left: -9999,
                    zIndex: 99999,
                    padding: '12px 20px',
                    background: 'var(--accent-info)',
                    color: 'var(--on-accent)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                }}
                onFocus={(e) => {
                    e.currentTarget.style.left = '12px';
                    e.currentTarget.style.top = '12px';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.left = '-9999px';
                    e.currentTarget.style.top = '';
                }}
            >
                본문으로 건너뛰기
            </a>
            {/* 사이드바 */}
            <div
                className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
                data-testid="sidebar"
                role="navigation"
                aria-label="프로젝트 및 대화 목록"
                style={{
                    backgroundColor: themeStyles.bgSecondary,
                    borderColor: themeStyles.borderColor,
                    transition: 'background-color 0.3s',
                }}
            >
                <div className="sidebar-header">
                    <button
                        type="button"
                        className="new-chat-btn"
                        onClick={startNewConversation}
                        style={{ color: themeStyles.textPrimary }}
                        title="새 대화 (Ctrl+N)"
                        aria-label="새 대화 시작 (Ctrl+N)"
                    >
                        <span>+</span> 새 대화
                    </button>
                    <button
                        type="button"
                        className="import-btn"
                        onClick={importConversation}
                        disabled={importingConversation}
                        aria-label="대화 가져오기 (Ctrl+Shift+I)"
                        style={{ marginLeft: '8px', padding: '8px 10px', fontSize: '14px', background: 'transparent', border: `1px solid ${themeStyles.borderColor}`, borderRadius: '6px', color: themeStyles.textPrimary, cursor: importingConversation ? 'wait' : 'pointer', opacity: importingConversation ? 0.7 : 1 }}
                        title="JSON, Markdown 또는 HTML 파일에서 대화 가져오기 (Ctrl+Shift+I)"
                    >
                        {importingConversation ? (
                            <span style={{ fontSize: '12px' }}>가져오는 중…</span>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                            </svg>
                        )}
                    </button>
                    <button
                        type="button"
                        className="new-project-btn"
                        onClick={() => setShowProjectModal(true)}
                        aria-label="새 프로젝트 만들기"
                        style={{ marginLeft: '4px', padding: '8px 12px', fontSize: '14px', background: 'transparent', border: `1px solid ${themeStyles.borderColor}`, borderRadius: '6px', color: themeStyles.textPrimary, cursor: 'pointer' }}
                        title="새 프로젝트 만들기"
                    >
                        📁 프로젝트
                    </button>
                    {currentProject && (
                        <>
                            <button
                                type="button"
                                className="notebook-settings-btn"
                                onClick={() => setShowProjectEditModal(true)}
                                style={{
                                    marginLeft: '4px',
                                    padding: '8px 10px',
                                    fontSize: '14px',
                                    background: 'transparent',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                                title="노트북 설정"
                                aria-label="노트북 설정"
                            >
                                ⚙️
                            </button>
                            <button
                                type="button"
                                className="notebook-share-btn"
                                onClick={() => setShowShareModal(true)}
                                style={{
                                    marginLeft: '4px',
                                    padding: '8px 10px',
                                    fontSize: '14px',
                                    background: 'transparent',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                                title="노트북 공유"
                                aria-label="노트북 공유"
                            >
                                🔗
                            </button>
                    <button
                        type="button"
                        className="notebook-toggle-btn"
                        onClick={() => setViewMode(viewMode === 'chat' ? 'notebook' : 'chat')}
                        aria-label={viewMode === 'chat' ? '노트북 LLM 보기' : '채팅 보기'}
                                style={{
                                    marginLeft: '4px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    background: viewMode === 'notebook' ? 'var(--accent-info-border)' : 'transparent',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                                title={viewMode === 'chat' ? '노트북 LLM 보기' : '채팅 보기'}
                            >
                                {viewMode === 'chat' ? '📓 노트북' : '💬 채팅'}
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="사이드바 토글"
                        title={sidebarOpen ? '사이드바 접기 (Ctrl+/)' : '사이드바 펼치기 (Ctrl+/)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4h14M3 10h14M3 16h14" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </div>

                {/* 정렬 옵션 */}
                <div style={{
                    padding: '8px 10px',
                    borderBottom: `1px solid ${themeStyles.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{ fontSize: '11px', color: themeStyles.textSecondary }}>정렬:</span>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        aria-label="대화 정렬"
                        style={{
                            flex: 1,
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: themeStyles.bgPrimary,
                            border: `1px solid ${themeStyles.borderColor}`,
                            borderRadius: '4px',
                            color: themeStyles.textPrimary,
                            cursor: 'pointer',
                        }}
                    >
                        <option value="recent">최신순</option>
                        <option value="name">이름순</option>
                        <option value="messages">메시지 수</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowShortcutsHelp(true)}
                        aria-label="키보드 단축키 도움말 열기"
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            background: 'transparent',
                            border: `1px solid ${themeStyles.borderColor}`,
                            borderRadius: '4px',
                            color: themeStyles.textSecondary,
                            cursor: 'pointer',
                        }}
                        title="키보드 단축키 (? 키)"
                    >
                        ⌨️
                    </button>
                </div>

                {/* 프로젝트 목록 (전체/추천 탭) */}
                <div className="projects-section" style={{ padding: '10px', borderBottom: '1px solid var(--sidebar-dark-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '4px' }} role="tablist" aria-label="노트북 탭">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={projectListTab === 'all'}
                                    onClick={() => setProjectListTab('all')}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: projectListTab === 'all' ? 'bold' : 'normal',
                                        background: projectListTab === 'all' ? 'var(--sidebar-dark-hover-strong)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    전체
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={projectListTab === 'recommended'}
                                    onClick={() => setProjectListTab('recommended')}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: projectListTab === 'recommended' ? 'bold' : 'normal',
                                        background: projectListTab === 'recommended' ? 'var(--sidebar-dark-hover-strong)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    추천
                                </button>
                            </div>
                            {projectListTab === 'all' && projects.length > 1 && (
                                <select
                                    value={projectSortOption}
                                    onChange={(e) => setProjectSortOption(e.target.value as ProjectSortOption)}
                                    style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--sidebar-dark-input-bg)', border: '1px solid var(--sidebar-dark-border-strong)', borderRadius: '4px', color: 'var(--text-primary)' }}
                                    aria-label="프로젝트 정렬"
                                >
                                    <option value="recent">최신순</option>
                                    <option value="name">이름순</option>
                                    <option value="sources">소스순</option>
                                </select>
                            )}
                        </div>
                        {projectListTab === 'all' && projects.length > 0 && (
                            <input
                                type="text"
                                placeholder="노트북 검색..."
                                value={projectSearchQuery}
                                onChange={(e) => setProjectSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    marginBottom: 8,
                                    background: 'var(--sidebar-dark-hover)',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '12px',
                                }}
                                aria-label="노트북 검색"
                            />
                        )}
                        {projectListTab === 'all' && filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className={`project-item-wrapper ${currentProject?.id === project.id ? 'active' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    marginBottom: 4,
                                    padding: '4px 4px 4px 12px',
                                    borderRadius: '4px',
                                    background: currentProject?.id === project.id ? 'var(--sidebar-dark-hover-strong)' : 'transparent',
                                }}
                            >
                                <button
                                    type="button"
                                    className="project-item"
                                    onClick={() => selectProject(project)}
                                    style={{
                                        flex: 1,
                                        padding: '4px 0',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    <span>📁 {project.name}</span>
                                    {typeof project.source_count === 'number' && (
                                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                                            소스 {project.source_count}개
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => requestDeleteProject(project, e)}
                                    aria-label={`${project.name} 삭제`}
                                    title="프로젝트 삭제"
                                    style={{
                                        padding: 4,
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 4,
                                        color: 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.color = 'var(--accent-error)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.6';
                                        e.currentTarget.style.color = 'var(--text-tertiary)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {projectListTab === 'recommended' && (
                            <div className="recommended-templates" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {RECOMMENDED_TEMPLATES.map((t) => (
                                    <button
                                        key={t.name}
                                        type="button"
                                        className="recommended-template-card"
                                        onClick={() => createFromTemplate(t.name, t.desc)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            textAlign: 'left',
                                            border: '1px solid var(--sidebar-dark-border-strong)',
                                            borderRadius: '6px',
                                            background: 'var(--sidebar-dark-hover)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                        }}
                                        title={`"${t.name}" 템플릿으로 노트북 생성`}
                                    >
                                        <span style={{ marginRight: '8px' }}>{t.icon}</span>
                                        <strong>{t.name}</strong>
                                        <span style={{ marginLeft: '6px', fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {projectListTab === 'all' && projects.length === 0 && (
                            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }} role="status" aria-live="polite">
                                <p style={{ margin: '0 0 8px 0' }}>프로젝트가 없습니다</p>
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(true)}
                                    style={{
                                        padding: '6px 14px',
                                        background: 'var(--accent-primary)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'var(--on-accent)',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                    aria-label="새 프로젝트 만들기"
                                >
                                    프로젝트 만들기
                                </button>
                            </div>
                        )}
                        {projectListTab === 'all' && projects.length > 0 && filteredProjects.length === 0 && (
                            <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>

                {/* 검색 영역 */}
                {conversations.length > 0 && (
                    <div className="search-container" role="search" style={{ padding: '8px', borderBottom: '1px solid var(--sidebar-dark-border)' }}>
                        <input
                            type="search"
                            placeholder="대화 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="대화 검색"
                            aria-describedby="search-hint"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'var(--sidebar-dark-input-bg)',
                                border: '1px solid var(--sidebar-dark-border-strong)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                            }}
                        />
                        <span id="search-hint" className="sr-only">대화 제목이나 내용으로 검색할 수 있습니다</span>
                    </div>
                )}

                <div className="conversations-list">
                    {(() => {
                        if (filteredConversations.length === 0) {
                            const hasSearch = searchQuery.trim().length > 0;
                            return (
                                <div className="empty-conversations" role="status" aria-live="polite">
                                    <p>{hasSearch ? '검색 결과가 없습니다' : '대화가 없습니다'}</p>
                                    <p className="hint">{hasSearch ? '다른 검색어를 입력해보세요' : '새 대화를 시작해보세요'}</p>
                                    {!hasSearch && (
                                        <button
                                            type="button"
                                            onClick={startNewConversation}
                                            style={{
                                                marginTop: '10px',
                                                padding: '8px 16px',
                                                background: 'var(--accent-primary)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'var(--on-accent)',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                            }}
                                            aria-label="새 대화 시작 (Ctrl+N)"
                                        >
                                            새 대화 시작
                                        </button>
                                    )}
                                </div>
                            );
                        }

                        return filteredConversations.map((conversation) => {
                            const isActive = currentConversation?.id === conversation.id;
                            const lastMessage = isActive
                                ? currentConversation?.messages?.at(-1)
                                : conversation.messages.at(-1);
                            const previewText = lastMessage?.content
                                ? lastMessage.content.substring(0, 50)
                                : '빈 대화';
                            const isEditing = editingConversationId === conversation.id;

                            return (
                                <div
                                    key={conversation.id}
                                    className={`conversation-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {isEditing ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <input
                                                type="text"
                                                value={editingConversationTitle}
                                                onChange={(e) => setEditingConversationTitle(e.target.value)}
                                                placeholder="대화 제목 (2자 이상)"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && editingConversationTitle.trim().length >= 2) {
                                                        e.preventDefault();
                                                        saveConversationTitle(conversation.id);
                                                    } else if (e.key === 'Escape') {
                                                        cancelEditingConversationTitle();
                                                    }
                                                }}
                                                onBlur={() => saveConversationTitle(conversation.id)}
                                                autoFocus
                                                style={{
                                                    width: '100%',
                                                    padding: '4px 8px',
                                                    fontSize: '14px',
                                                    background: 'var(--sidebar-dark-input-bg)',
                                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                                    borderRadius: '4px',
                                                    color: 'var(--text-primary)',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="conversation-content"
                                            onClick={() => selectConversation(conversation)}
                                            onDoubleClick={(e) => startEditingConversationTitle(conversation.id, conversation.title, e)}
                                            aria-label={`대화 선택: ${conversation.title}`}
                                            title="더블클릭하여 이름 편집"
                                            style={{
                                                flex: 1,
                                                textAlign: 'left',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'inherit',
                                                cursor: 'pointer',
                                                padding: 0,
                                            }}
                                        >
                                            <div className="conversation-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {conversation.pinned && (
                                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--accent-warning)" style={{ flexShrink: 0 }}>
                                                        <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                                    </svg>
                                                )}
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {highlightSearchText(conversation.title, searchQuery)}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                                                    {formatRelativeTime(conversation.updatedAt)}
                                                </span>
                                            </div>
                                            <div className="conversation-preview" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}>
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {highlightSearchText(previewText, searchQuery)}
                                                </span>
                                                {conversation.messages.length > 0 && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        background: 'var(--sidebar-dark-input-bg)',
                                                        borderRadius: '10px',
                                                        color: 'var(--text-secondary)',
                                                        flexShrink: 0,
                                                    }}>
                                                        💬 {conversation.messages.length}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    )}

                                    {!isEditing && (
                                        <>
                                            <button
                                                type="button"
                                                className="pin-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePinConversation(conversation.id);
                                                }}
                                                aria-label={conversation.pinned ? '고정 해제' : '대화 고정'}
                                                title={conversation.pinned ? '고정 해제' : '상단에 고정'}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: conversation.pinned ? 'var(--accent-warning)' : 'inherit',
                                                    opacity: conversation.pinned ? 1 : 0.6,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="edit-title-btn"
                                                onClick={(e) => startEditingConversationTitle(conversation.id, conversation.title, e)}
                                                aria-label="대화 이름 편집"
                                                title="이름 편집"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: 'inherit',
                                                    opacity: 0.6,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="duplicate-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    duplicateConversation(conversation);
                                                }}
                                                aria-label="대화 복제"
                                                title="대화 복제 (Ctrl+Shift+D)"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: 'inherit',
                                                    opacity: 0.6,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={(e) => requestDeleteConversation(conversation, e)}
                                                aria-label="대화 삭제"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* 테마 전환 버튼 */}
                <div style={{
                    padding: '12px',
                    borderTop: `1px solid ${themeStyles.borderColor}`,
                    marginTop: 'auto',
                }}>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: `1px solid ${themeStyles.borderColor}`,
                            borderRadius: '6px',
                            color: themeStyles.textPrimary,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                라이트 모드
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                다크 모드
                            </>
                        )}
                    </button>
                    
                    {/* 상태 표시 영역 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        padding: '8px',
                        fontSize: '11px',
                        color: themeStyles.textSecondary,
                        background: themeStyles.bgPrimary,
                        borderRadius: '6px',
                    }}>
                        {/* 네트워크 상태 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isOnline ? 'var(--accent-success)' : 'var(--accent-error)',
                            }} />
                            <span>{isOnline ? '온라인' : '오프라인'}</span>
                        </div>
                        
                        {/* PRO/프로필 스텁 (Phase 5) */}
                        <button
                            type="button"
                            onClick={() => setShowProModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'var(--accent-warning-muted)',
                                color: 'var(--accent-warning)',
                                fontSize: '10px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            title="PRO 구독 (준비 중)"
                            aria-label="PRO 구독 정보"
                        >
                            PRO
                        </button>

                        {/* 스토리지 사용량 */}
                        {storageUsage && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }} title={`${(storageUsage.used / 1024).toFixed(1)}KB / ${(storageUsage.total / 1024 / 1024).toFixed(0)}MB`}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                                </svg>
                                <span>{((storageUsage.used / storageUsage.total) * 100).toFixed(1)}%</span>
                                <div style={{
                                    width: '40px',
                                    height: '4px',
                                    background: themeStyles.borderColor,
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${(storageUsage.used / storageUsage.total) * 100}%`,
                                        height: '100%',
                                        background: (storageUsage.used / storageUsage.total) > 0.8 ? 'var(--accent-error)' : 'var(--accent-info)',
                                        transition: 'width 0.3s',
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 메인 채팅 영역 */}
            <main id="chat-main-content" className="main-content" tabIndex={-1} role="main" aria-label="채팅 대화 영역" style={{ backgroundColor: themeStyles.bgPrimary, transition: 'background-color 0.3s' }}>
                {!isOnline && (
                    <div
                        role="alert"
                        style={{
                            padding: '10px 16px',
                            background: 'var(--accent-error-muted, rgba(220, 53, 69, 0.15))',
                            borderBottom: '1px solid var(--accent-error-border, rgba(220, 53, 69, 0.3))',
                            color: 'var(--accent-error, #dc3545)',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span>⚠️</span>
                        <span>오프라인 상태입니다. 연결이 복구되면 메시지 전송이 가능합니다.</span>
                    </div>
                )}
                {viewMode === 'notebook' && currentProject ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: `1px solid ${themeStyles.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <h2 style={{ margin: 0, color: themeStyles.textPrimary }}>📓 노트북 LLM - {currentProject.name}</h2>
                            <span style={{ fontSize: '12px', color: themeStyles.textSecondary }}>
                                소스는 ⚙️ 설정에서 가이드라인으로 추가할 수 있습니다
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewMode('chat')}
                                aria-label="채팅으로 이동"
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
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
                                onSourcesChanged={refreshProjects}
                                onResponseComplete={(response) => {
                                    errorLogger.info('노트북 LLM 응답 완료', {
                                        component: 'ChatGPTInterface',
                                        action: 'notebookLLMResponse',
                                        responseLength: response?.content?.length || 0,
                                        modelUsed: response?.modelUsed,
                                    });
                                    setToastMessage('응답 생성이 완료되었습니다');
                                    setShowCopyToast(true);
                                    setTimeout(() => setShowCopyToast(false), 2500);
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
                        {/* 대화 헤더 (Figma: 제목 + 별·북마크·Share) */}
                        <div className="brainwave-chat-header" style={{
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            borderBottom: 'var(--border-width) solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-primary)',
                        }}>
                            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                {currentConversation.title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowShareModal(true)}
                                    aria-label="공유"
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        fontSize: 'var(--font-size-sm)',
                                        background: 'var(--accent-info-figma)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--on-accent)',
                                        cursor: 'pointer',
                                        fontWeight: 'var(--font-weight-medium)',
                                    }}
                                    title="대화 공유"
                                >
                                    Share
                                </button>
                                <button
                                    type="button"
                                    onClick={() => exportConversation('markdown')}
                                    disabled={currentConversation.messages.length === 0}
                                    aria-label="Markdown으로 내보내기"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: currentConversation.messages.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: currentConversation.messages.length > 0 ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                    title={currentConversation.messages.length === 0 ? '대화 내용이 있을 때 내보내기 가능' : 'Markdown으로 내보내기 (Ctrl+E)'}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                    </svg>
                                    내보내기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => exportConversation('clipboard')}
                                    disabled={currentConversation.messages.length === 0}
                                    aria-label="클립보드에 복사"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: currentConversation.messages.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: currentConversation.messages.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                    title={currentConversation.messages.length === 0 ? '대화 내용이 있을 때 복사 가능' : '마크다운을 클립보드에 복사'}
                                >
                                    복사
                                </button>
                                <button
                                    type="button"
                                    onClick={() => exportConversation('json')}
                                    disabled={currentConversation.messages.length === 0}
                                    aria-label="JSON으로 내보내기"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: currentConversation.messages.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: currentConversation.messages.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                    title={currentConversation.messages.length === 0 ? '대화 내용이 있을 때 내보내기 가능' : 'JSON으로 내보내기'}
                                >
                                    JSON
                                </button>
                                <button
                                    type="button"
                                    onClick={() => exportConversation('html')}
                                    disabled={currentConversation.messages.length === 0}
                                    aria-label="HTML로 내보내기"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: currentConversation.messages.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: currentConversation.messages.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                    title={currentConversation.messages.length === 0 ? '대화 내용이 있을 때 내보내기 가능' : 'HTML로 내보내기'}
                                >
                                    HTML
                                </button>
                                <button
                                    type="button"
                                    onClick={importConversation}
                                    disabled={importingConversation}
                                    aria-label="대화 가져오기 (Ctrl+Shift+I)"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: importingConversation ? 'wait' : 'pointer',
                                        opacity: importingConversation ? 0.7 : 1,
                                    }}
                                    title="JSON, Markdown 또는 HTML 파일에서 대화 가져오기 (Ctrl+Shift+I)"
                                >
                                    {importingConversation ? '가져오는 중…' : '가져오기'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => currentConversation && duplicateConversation(currentConversation)}
                                    disabled={currentConversation.messages.length === 0}
                                    aria-label="대화 복제"
                                    title={currentConversation.messages.length === 0 ? '대화 내용이 있을 때 복제 가능' : '현재 대화 복제 (Ctrl+Shift+D)'}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: currentConversation.messages.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: currentConversation.messages.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    복제
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowMessageSearch(prev => !prev)}
                                    aria-label="대화 내 검색 (Ctrl+F)"
                                    title="대화 내 검색 (Ctrl+F)"
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        background: showMessageSearch ? 'var(--accent-info-muted)' : 'transparent',
                                        border: showMessageSearch ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                    </svg>
                                </button>
                                {/* 타임스탬프 토글 */}
                                <button
                                    type="button"
                                    onClick={toggleTimestamps}
                                    aria-label={showTimestamps ? '시간 숨기기' : '시간 표시'}
                                    title={showTimestamps ? '시간 숨기기' : '시간 표시'}
                                    style={{
                                        padding: '6px',
                                        background: showTimestamps ? 'var(--accent-info-border)' : 'transparent',
                                        border: showTimestamps ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                    </svg>
                                </button>
                                {/* 자동 스크롤 토글 */}
                                <button
                                    type="button"
                                    onClick={() => setAutoScroll(prev => !prev)}
                                    aria-label={autoScroll ? '자동 스크롤 끄기' : '자동 스크롤 켜기'}
                                    title={autoScroll ? '자동 스크롤 끄기' : '자동 스크롤 켜기'}
                                    style={{
                                        padding: '6px',
                                        background: autoScroll ? 'var(--accent-info-border)' : 'transparent',
                                        border: autoScroll ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
                                    </svg>
                                </button>
                                {/* 대화 내용 전체 삭제 */}
                                {currentConversation && currentConversation.messages.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={requestClearMessages}
                                        aria-label="대화 내용 전체 삭제"
                                        style={{
                                            padding: '6px',
                                            background: 'transparent',
                                            border: '1px solid var(--accent-error-border)',
                                            borderRadius: '4px',
                                            color: 'var(--accent-error)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            opacity: 0.8,
                                        }}
                                        title="대화 내용 전체 삭제"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
                                    </button>
                                )}
                                {bookmarkedMessages.length > 0 && (
                                    <span style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        background: 'var(--accent-warning-muted)',
                                        borderRadius: '4px',
                                        color: 'var(--accent-warning)',
                                    }}>
                                        북마크 {bookmarkedMessages.length}
                                    </span>
                                )}
                                {/* 대화 통계 */}
                                {conversationStats && conversationStats.total > 0 && (
                                    <span style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        background: 'var(--accent-info-muted)',
                                        borderRadius: '4px',
                                        color: 'var(--accent-info)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <span title={`사용자: ${conversationStats.user}, AI: ${conversationStats.assistant}`}>
                                            💬 {conversationStats.total}
                                        </span>
                                        <span style={{ opacity: 0.5 }}>|</span>
                                        <span title={`총 ${conversationStats.chars.toLocaleString()}자`}>
                                            ~{conversationStats.tokens.toLocaleString()} 토큰
                                        </span>
                                    </span>
                                )}
                                {/* 마지막 응답 시간 */}
                                {lastResponseTime && !isLoading && (
                                    <span style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        background: 'var(--accent-success-muted)',
                                        borderRadius: '4px',
                                        color: 'var(--accent-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                        </svg>
                                        {lastResponseTime < 1000
                                            ? `${lastResponseTime}ms`
                                            : `${(lastResponseTime / 1000).toFixed(1)}초`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 대화 내 검색 바 */}
                        {showMessageSearch && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'var(--bg-overlay)',
                                borderBottom: '1px solid var(--sidebar-dark-border)',
                            }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-secondary)">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                                <input
                                    type="search"
                                    value={messageSearchQuery}
                                    onChange={(e) => {
                                        setMessageSearchQuery(e.target.value);
                                        setMessageSearchIndex(0);
                                    }}
                                    placeholder="대화에서 검색..."
                                    aria-label="대화 내 검색"
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        background: 'var(--sidebar-dark-hover)',
                                        color: 'var(--text-primary)',
                                        fontSize: '13px',
                                        outline: 'none',
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigateMessageSearch('next');
                                        } else if (e.key === 'Escape') {
                                            setShowMessageSearch(false);
                                            setMessageSearchQuery('');
                                        }
                                    }}
                                />
                                {messageSearchQuery && (
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {messageSearchResults.length > 0
                                            ? `${messageSearchIndex + 1} / ${messageSearchResults.length}`
                                            : '결과 없음'}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => navigateMessageSearch('prev')}
                                    disabled={messageSearchResults.length === 0}
                                    aria-label="이전 검색 결과"
                                    title="이전 결과"
                                    style={{
                                        padding: '4px 8px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: messageSearchResults.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: messageSearchResults.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateMessageSearch('next')}
                                    disabled={messageSearchResults.length === 0}
                                    aria-label="다음 검색 결과"
                                    title="다음 결과"
                                    style={{
                                        padding: '4px 8px',
                                        background: 'transparent',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '4px',
                                        color: messageSearchResults.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: messageSearchResults.length > 0 ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMessageSearch(false);
                                        setMessageSearchQuery('');
                                    }}
                                    aria-label="검색 닫기 (Esc)"
                                    title="검색 닫기 (Esc)"
                                    style={{
                                        padding: '4px 8px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div
                            className="messages-container"
                            role="log"
                            aria-label="대화 메시지 목록"
                            aria-live="polite"
                            aria-atomic="false"
                            ref={messagesContainerRef}
                            onScroll={handleMessagesScroll}
                            data-testid="messages-container"
                        >
                            {currentConversation.messages.length === 0 ? (
                                <div className="empty-state" data-testid="empty-state">
                                    <output>
                                        <h2>새 대화를 시작하세요</h2>
                                        <p>
                                            {suggestedQuestionsFromSource.length > 0
                                              ? '아래 추천 질문을 클릭하거나 직접 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈.'
                                              : '입력창에 메시지를 입력하여 대화를 시작하세요. Enter로 전송, Shift+Enter로 줄바꿈.'}
                                        </p>
                                        {suggestedQuestionsFromSource.length > 0 && (
                                            <div className="empty-state-suggested-questions" role="region" aria-label="추천 질문" data-testid="suggested-questions-from-source">
                                                <p className="suggested-questions-label">💡 소스 기반 추천 질문</p>
                                                <div className="suggested-questions-grid">
                                                    {suggestedQuestionsFromSource.map((q, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="suggested-question-chip"
                                                            onClick={() => sendMessage(q)}
                                                            data-testid={`suggested-question-${idx}`}
                                                            aria-label={`추천 질문 전송: ${q}`}
                                                        >
                                                            {q}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </output>
                                </div>
                            ) : (
                                currentConversation.messages.map((message, index) => (
                                    <article
                                        key={message.id}
                                        id={`message-${message.id}`}
                                        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}${message.bookmarked ? ' bookmarked' : ''}`}
                                        aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지${message.bookmarked ? ' (북마크됨)' : ''}`}
                                        style={{
                                            borderLeft: message.bookmarked ? '3px solid var(--accent-warning)' : undefined,
                                        }}
                                        data-testid={`message-${message.role}${isStreaming && message.role === 'assistant' && index === currentConversation.messages.length - 1 ? '-streaming' : ''}`}
                                    >
                                        <div className="message-avatar" aria-hidden="true">
                                            {message.role === 'user' ? (
                                                <span style={{ fontSize: '1.2em' }}>👤</span>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-info-figma)" aria-hidden="true"><path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z"/></svg>
                                            )}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-text">
                                                {editingMessageId === message.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <textarea
                                                            value={editingContent}
                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    saveEditedMessage(message.id);
                                                                } else if (e.key === 'Escape') {
                                                                    cancelEditingMessage();
                                                                }
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                minHeight: '80px',
                                                                padding: '12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--sidebar-dark-border-strong)',
                                                                background: 'var(--sidebar-dark-input-bg)',
                                                                color: 'var(--text-primary)',
                                                                fontSize: '14px',
                                                                resize: 'vertical',
                                                                fontFamily: 'inherit',
                                                            }}
                                                            autoFocus
                                                        />
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEditingMessage}
                                                                aria-label="편집 취소"
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                                                    background: 'transparent',
                                                                    color: 'var(--text-primary)',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => saveEditedMessage(message.id)}
                                                                disabled={!editingContent.trim()}
                                                                aria-label="편집 저장"
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    background: editingContent.trim() ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                                    color: 'var(--on-accent)',
                                                                    cursor: editingContent.trim() ? 'pointer' : 'not-allowed',
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                저장 및 전송
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : message.role === 'assistant' ? (
                                                    <>
                                                        <div style={{
                                                            maxHeight: collapsedMessages.has(message.id) ? '150px' : 'none',
                                                            overflow: collapsedMessages.has(message.id) ? 'hidden' : 'visible',
                                                            position: 'relative',
                                                        }}>
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={messageSearchQuery.trim() ? [[rehypeHighlightSearch, { searchTerm: messageSearchQuery }]] : []}
                                                                components={{
                                                                    code: ({ className, children, ...props }) => {
                                                                        const isInline = !className;
                                                                        if (isInline) {
                                                                            return (
                                                                                <code
                                                                                    style={{
                                                                                        backgroundColor: theme === 'dark' ? 'var(--sidebar-dark-input-bg)' : 'var(--bg-active)',
                                                                                        padding: '2px 6px',
                                                                                        borderRadius: '4px',
                                                                                        fontSize: '0.9em',
                                                                                    }}
                                                                                    {...props}
                                                                                >
                                                                                    {children}
                                                                                </code>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <CodeBlock className={className} theme={theme}>
                                                                                {children}
                                                                            </CodeBlock>
                                                                        );
                                                                    },
                                                                    pre: ({ children }) => <>{children}</>,
                                                                } as Components}
                                                            >
                                                                {message.content}
                                                            </ReactMarkdown>
                                                            {collapsedMessages.has(message.id) && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    bottom: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '60px',
                                                                    background: `linear-gradient(transparent, var(--bg-secondary))`,
                                                                    pointerEvents: 'none',
                                                                }} />
                                                            )}
                                                        </div>
                                                        {isLongMessage(message.content) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMessageCollapse(message.id)}
                                                                aria-label={collapsedMessages.has(message.id) ? '메시지 펼치기' : '메시지 접기'}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginTop: '8px',
                                                                    padding: '4px 10px',
                                                                    background: 'transparent',
                                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                                    borderRadius: '4px',
                                                                    color: themeStyles.textSecondary,
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                {collapsedMessages.has(message.id) ? (
                                                                    <>
                                                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                                                        </svg>
                                                                        펼치기
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                                                                        </svg>
                                                                        접기
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : messageSearchQuery.trim() ? (
                                                    highlightTextForPlainText(message.content)
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                            {editingMessageId !== message.id && (
                                                <fieldset className="message-actions" aria-label="메시지 작업" style={{ border: 'none', padding: 0, margin: 0 }}>
                                                    <button
                                                        type="button"
                                                        className="copy-btn"
                                                        onClick={() => copyMessage(message.content)}
                                                        aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지 복사`}
                                                        title="메시지 복사"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                        </svg>
                                                    </button>
                                                    {message.role === 'user' && !isLoading && !isStreaming && (
                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() => startEditingMessage(message.id, message.content)}
                                                            aria-label="메시지 편집"
                                                            title="메시지 편집"
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                color: 'inherit',
                                                                opacity: 0.7,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {message.role === 'assistant' && !isLoading && !isStreaming && (
                                                        <button
                                                            type="button"
                                                            className="regenerate-btn"
                                                            onClick={() => regenerateMessage(message.id)}
                                                            aria-label={message.content.startsWith('❌') ? '재시도' : '응답 재생성'}
                                                            title={message.content.startsWith('❌') ? '재시도' : '응답 재생성'}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                color: 'inherit',
                                                                opacity: 0.7,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {message.role === 'assistant' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="reaction-btn like-btn"
                                                                onClick={() => setMessageReaction(message.id, 'like')}
                                                                aria-label="좋아요"
                                                                title="좋은 응답"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    color: message.reaction === 'like' ? 'var(--accent-success)' : 'inherit',
                                                                    opacity: message.reaction === 'like' ? 1 : 0.7,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill={message.reaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="reaction-btn dislike-btn"
                                                                onClick={() => setMessageReaction(message.id, 'dislike')}
                                                                aria-label="싫어요"
                                                                title="개선이 필요한 응답"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    color: message.reaction === 'dislike' ? 'var(--accent-error)' : 'inherit',
                                                                    opacity: message.reaction === 'dislike' ? 1 : 0.7,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill={message.reaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                                    <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.082 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.076.237-.138.362a1.9 1.9 0 0 1 .234 1.734c-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.509c-.138.508-.55.848-1.012.964l-.261.065z" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="bookmark-btn"
                                                        onClick={() => toggleBookmark(message.id)}
                                                        aria-label={message.bookmarked ? '북마크 해제' : '북마크'}
                                                        title={message.bookmarked ? '북마크 해제' : '북마크'}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: message.bookmarked ? 'var(--accent-warning)' : 'inherit',
                                                            opacity: message.bookmarked ? 1 : 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill={message.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z" />
                                                        </svg>
                                                    </button>
                                                    {/* TTS 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="tts-btn"
                                                        onClick={() => speakMessage(message.id, message.content)}
                                                        aria-label={speakingMessageId === message.id ? '읽기 중지' : '음성으로 읽기'}
                                                        title={speakingMessageId === message.id ? '읽기 중지' : '음성으로 읽기'}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: speakingMessageId === message.id ? 'var(--accent-info)' : 'inherit',
                                                            opacity: speakingMessageId === message.id ? 1 : 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {speakingMessageId === message.id ? (
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                                                                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                                                                <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    {/* 메시지 복사 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="copy-message-btn"
                                                        aria-label="메시지 복사"
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(message.content);
                                                                setToastMessage('복사되었습니다');
                                                                setShowCopyToast(true);
                                                                setTimeout(() => setShowCopyToast(false), 2000);
                                                            } catch {
                                                                // 복사 실패 시 무시
                                                            }
                                                        }}
                                                        title="메시지 복사"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'inherit',
                                                            opacity: 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                        </svg>
                                                    </button>
                                                    {/* 메시지 삭제 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="delete-message-btn"
                                                        onClick={() => requestDeleteMessage(message.id)}
                                                        aria-label="메시지 삭제"
                                                        title="메시지 삭제"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'inherit',
                                                            opacity: 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                        </svg>
                                                    </button>
                                                    {showTimestamps && (
                                                        <div className="message-timestamp" aria-label={`메시지 전송 시간: ${message.timestamp.toLocaleString('ko-KR')}`}>
                                                            <time dateTime={message.timestamp.toISOString()}>
                                                                {message.timestamp.toLocaleTimeString('ko-KR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </time>
                                                        </div>
                                                    )}
                                                </fieldset>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                            {showScrollToTop && currentConversation.messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => scrollToTop('smooth')}
                                    aria-label="맨 위로 스크롤"
                                    title="맨 위로"
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        padding: '8px 12px',
                                        background: 'var(--accent-primary)',
                                        color: 'var(--on-accent)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        boxShadow: 'var(--shadow-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        zIndex: 10,
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 13a.5.5 0 0 1-.5-.5V4.707L4.354 7.854a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708L8.5 4.707V12.5a.5.5 0 0 1-.5.5z" />
                                    </svg>
                                    맨 위로
                                </button>
                            )}
                            {showScrollToBottom && currentConversation.messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => scrollToBottom('smooth')}
                                    aria-label="맨 아래로 스크롤"
                                    title="맨 아래로"
                                    style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: 16,
                                        padding: '8px 12px',
                                        background: 'var(--accent-primary)',
                                        color: 'var(--on-accent)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        boxShadow: 'var(--shadow-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        zIndex: 10,
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 3a.5.5 0 0 1 .5.5v8.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.708L7.5 12.293V3.5A.5.5 0 0 1 8 3z" />
                                    </svg>
                                    맨 아래로
                                </button>
                            )}
                            {isLoading && !isStreaming && (
                                <div className="message assistant-message" aria-live="polite" aria-busy="true" data-testid="loading-indicator">
                                    <div className="message-avatar" aria-hidden="true">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-info-figma)" aria-hidden="true"><path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z"/></svg>
                                    </div>
                                    <div className="message-content">
                                        <output>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {/* 스켈레톤 라인들 */}
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                }}>
                                                    <div style={{
                                                        height: '16px',
                                                        width: '85%',
                                                        background: `linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)`,
                                                        backgroundSize: '200% 100%',
                                                        animation: 'shimmer 1.5s infinite',
                                                        borderRadius: '4px',
                                                    }} />
                                                    <div style={{
                                                        height: '16px',
                                                        width: '70%',
                                                        background: `linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)`,
                                                        backgroundSize: '200% 100%',
                                                        animation: 'shimmer 1.5s infinite 0.1s',
                                                        borderRadius: '4px',
                                                    }} />
                                                    <div style={{
                                                        height: '16px',
                                                        width: '60%',
                                                        background: `linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)`,
                                                        backgroundSize: '200% 100%',
                                                        animation: 'shimmer 1.5s infinite 0.2s',
                                                        borderRadius: '4px',
                                                    }} />
                                                </div>
                                                {/* 로딩 텍스트 */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    color: themeStyles.textSecondary,
                                                }}>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        border: '2px solid var(--border-color)',
                                                        borderTopColor: 'var(--accent-info)',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite',
                                                    }} />
                                                    <span>AI가 응답을 생성하고 있습니다...</span>
                                                    {responseStartTime && (
                                                        <span style={{ opacity: 0.7 }}>
                                                            ({Math.floor((Date.now() - responseStartTime) / 1000)}초)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </output>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 키보드 단축키 도움말 모달 */}
                        {showShortcutsHelp && (
                            <div
                                className="shortcuts-modal-overlay"
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'var(--modal-overlay)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10001,
                                }}
                                onClick={() => setShowShortcutsHelp(false)}
                                role="presentation"
                            >
                                <div
                                    className="shortcuts-modal"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="shortcuts-modal-title"
                                    style={{
                                        background: themeStyles.bgSecondary,
                                        borderRadius: '12px',
                                        padding: '24px',
                                        maxWidth: '500px',
                                        width: '90%',
                                        maxHeight: '80vh',
                                        overflow: 'auto',
                                        boxShadow: 'var(--shadow-modal)',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 id="shortcuts-modal-title" style={{ margin: 0, fontSize: '18px', color: themeStyles.textPrimary }}>⌨️ 키보드 단축키</h2>
                                        <button
                                            ref={shortcutsCloseRef}
                                            type="button"
                                            onClick={() => setShowShortcutsHelp(false)}
                                            aria-label="단축키 도움말 닫기"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: themeStyles.textSecondary,
                                                cursor: 'pointer',
                                                fontSize: '20px',
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { keys: 'Ctrl/⌘ + N', desc: '새 대화 시작' },
                                            { keys: 'Ctrl/⌘ + /', desc: '사이드바 토글' },
                                            { keys: 'Ctrl/⌘ + F', desc: '대화 내 검색' },
                                            { keys: 'Ctrl/⌘ + E', desc: '대화 내보내기' },
                                            { keys: 'Ctrl/⌘ + Shift + D', desc: '대화 복제' },
                                            { keys: 'Ctrl/⌘ + Shift + I', desc: '대화 가져오기' },
                                            { keys: '/ 또는 Ctrl/⌘ + L', desc: '입력창 포커스' },
                                            { keys: '?', desc: '이 도움말 열기' },
                                            { keys: 'Enter', desc: '메시지 전송' },
                                            { keys: 'Shift + Enter', desc: '줄바꿈' },
                                            { keys: '↑ / ↓', desc: '입력 히스토리 탐색' },
                                            { keys: 'Escape', desc: '단축키·검색 닫기 / 스트리밍 중지' },
                                        ].map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    background: themeStyles.bgPrimary,
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                <span style={{ color: themeStyles.textPrimary }}>{shortcut.desc}</span>
                                                <kbd style={{
                                                    padding: '4px 8px',
                                                    background: themeStyles.bgSecondary,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontFamily: 'monospace',
                                                    color: themeStyles.textSecondary,
                                                }}>
                                                    {shortcut.keys}
                                                </kbd>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '16px', fontSize: '12px', color: themeStyles.textSecondary, textAlign: 'center' }}>
                                        ESC 또는 바깥 클릭으로 닫기
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 입력 영역 */}
                        <section className="input-container" aria-label="메시지 입력 영역">
                            {/* 응답 스타일 선택 버튼 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderBottom: '1px solid var(--sidebar-dark-border)',
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowStyleOptions(!showStyleOptions)}
                                    aria-label={`응답 스타일: ${responseStyle === 'concise' ? '간결한' : responseStyle === 'balanced' ? '균형잡힌' : responseStyle === 'detailed' ? '상세한' : '종합적인'}`}
                                    title="응답 스타일 선택"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        background: 'var(--sidebar-dark-hover)',
                                        border: '1px solid var(--sidebar-dark-border-strong)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .75.434l5.5-3.143a.5.5 0 0 1 .5 0l5.5 3.143A.5.5 0 0 0 14 14.5v-13a.5.5 0 0 0-.5-.5h-11z" />
                                    </svg>
                                    {responseStyle === 'concise' && '간결한'}
                                    {responseStyle === 'balanced' && '균형잡힌'}
                                    {responseStyle === 'detailed' && '상세한'}
                                    {responseStyle === 'comprehensive' && '종합적인'}
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showStyleOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                        <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                    </svg>
                                </button>
                                {perspective && (
                                    <span style={{
                                        padding: '4px 8px',
                                        background: 'var(--accent-info-muted)',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        color: 'var(--accent-info)',
                                    }}>
                                        {perspective === 'practical' && '실용적'}
                                        {perspective === 'theoretical' && '이론적'}
                                        {perspective === 'creative' && '창의적'}
                                        {perspective === 'critical' && '비판적'}
                                        {perspective === 'empathetic' && '공감적'}
                                        <button
                                            type="button"
                                            onClick={() => setPerspective(null)}
                                            aria-label="관점 선택 해제"
                                            style={{ marginLeft: '4px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                                        >×</button>
                                    </span>
                                )}
                            </div>

                            {/* 스타일 옵션 드롭다운 */}
                            {showStyleOptions && (
                                <div style={{
                                    padding: '12px',
                                    background: 'var(--bg-overlay)',
                                    borderBottom: '1px solid var(--sidebar-dark-border)',
                                }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>응답 길이</div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {(['concise', 'balanced', 'detailed', 'comprehensive'] as const).map((style) => (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => { setResponseStyle(style); }}
                                                    aria-label={`${style === 'concise' ? '간결' : style === 'balanced' ? '균형' : style === 'detailed' ? '상세' : '종합'} 스타일 선택`}
                                                    aria-pressed={responseStyle === style}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: responseStyle === style ? 'var(--accent-info-muted)' : 'var(--bg-hover)',
                                                        border: responseStyle === style ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: responseStyle === style ? 'var(--accent-info)' : 'var(--text-primary)',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {style === 'concise' && '간결'}
                                                    {style === 'balanced' && '균형'}
                                                    {style === 'detailed' && '상세'}
                                                    {style === 'comprehensive' && '종합'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>응답 관점 (선택사항)</div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {(['practical', 'theoretical', 'creative', 'critical', 'empathetic'] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPerspective(perspective === p ? null : p)}
                                                    aria-label={`${p === 'practical' ? '실용적' : p === 'theoretical' ? '이론적' : p === 'creative' ? '창의적' : p === 'critical' ? '비판적' : '공감적'} 관점 선택`}
                                                    aria-pressed={perspective === p}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: perspective === p ? 'var(--accent-success-muted)' : 'var(--bg-hover)',
                                                        border: perspective === p ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: perspective === p ? 'var(--accent-primary)' : 'var(--text-primary)',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {p === 'practical' && '실용적'}
                                                    {p === 'theoretical' && '이론적'}
                                                    {p === 'creative' && '창의적'}
                                                    {p === 'critical' && '비판적'}
                                                    {p === 'empathetic' && '공감적'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 빠른 후속 질문 제안 */}
                            {quickSuggestions.length > 0 && !input.trim() && (
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderBottom: '1px solid var(--sidebar-dark-border)',
                                    flexWrap: 'wrap',
                                }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                        빠른 질문:
                                    </span>
                                    {quickSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => sendMessage(suggestion)}
                                            aria-label={`빠른 질문 전송: ${suggestion}`}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '12px',
                                                background: 'var(--accent-info-muted)',
                                                border: '1px solid var(--accent-info-border)',
                                                borderRadius: 'var(--radius-xl)',
                                                color: 'var(--accent-info)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--accent-info-border)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--accent-info-muted)';
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    maxLength={10000}
                                    onChange={(e) => {
                                        inputHistoryIndexRef.current = -1;
                                        setInput(e.target.value);
                                        // 자동 높이 조절
                                        const textarea = e.target;
                                        textarea.style.height = 'auto';
                                        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type '/' for commands"
                                    rows={1}
                                    disabled={isLoading || !isOnline}
                                    className="message-input"
                                    data-testid="chat-input"
                                    aria-label="메시지 입력창 (최대 10,000자)"
                                    aria-describedby="input-hint"
                                    aria-invalid={input.length > 10000}
                                    aria-required="true"
                                    style={{
                                        minHeight: '44px',
                                        maxHeight: '200px',
                                        resize: 'none',
                                        overflow: 'auto',
                                    }}
                                />
                                {isStreaming ? (
                                    <button
                                        type="button"
                                        className="send-button cancel-button"
                                        onClick={cancelStreaming}
                                        aria-label="스트리밍 중지"
                                        title={`스트리밍 중지 (Esc) · ${streamingElapsedSec}초`}
                                        style={{ background: 'var(--accent-error)' }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <rect x="4" y="4" width="12" height="12" rx="2" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="send-button"
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading || !isOnline}
                                        aria-label="메시지 전송"
                                        aria-disabled={!input.trim() || isLoading || !isOnline}
                                        title={!isOnline ? '오프라인 상태입니다' : isLoading ? '응답 생성 중...' : '메시지 전송 (Enter)'}
                                        data-testid="send-button"
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
                                )}
                            </div>
                            <div className="input-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <span id="input-hint" className="input-hint" aria-live="polite">
                                    {!isOnline ? '오프라인 — 연결 후 전송 가능' : isStreaming ? `스트리밍 중... (${streamingElapsedSec}초) — Esc로 중지` : isLoading ? '응답 생성 중...' : input.length > 10000 ? `메시지가 너무 깁니다 (${input.length}/10,000자)` : input.length >= 9000 ? `거의 최대치입니다 (${input.length}/10,000자)` : 'Enter로 전송, Shift+Enter로 줄바꿈'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* 글자 수 / 토큰 예상치 */}
                                    {input.length > 0 && (
                                        <span style={{
                                            fontSize: '11px',
                                            color: input.length >= 9000 ? 'var(--accent-error)' : input.length > 5000 ? 'var(--accent-warning)' : themeStyles.textSecondary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}>
                                            <span>{input.length.toLocaleString()}자</span>
                                            <span style={{ opacity: 0.5 }}>|</span>
                                            <span>~{Math.ceil(input.length / 4).toLocaleString()} 토큰</span>
                                        </span>
                                    )}
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} title={isLoading || isStreaming ? '응답 생성 중에는 변경할 수 없습니다' : !isStreamingSupported() ? '스트리밍 미지원' : undefined}>
                                        <input
                                            type="checkbox"
                                            checked={useStreaming}
                                            onChange={(e) => setUseStreaming(e.target.checked)}
                                            disabled={isLoading || isStreaming || !isStreamingSupported()}
                                            aria-label="스트리밍 활성화"
                                        />
                                        <span style={{ fontSize: '12px', opacity: 0.85 }}>
                                            스트리밍{isStreamingSupported() ? '' : ' (미지원)'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="welcome-screen brainwave-welcome" style={{ background: themeStyles.bgPrimary }}>
                        <div className="welcome-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    fontSize: '48px',
                                    marginBottom: '16px',
                                }}>
                                    🤖
                                </div>
                                <h1 style={{
                                    fontSize: '28px',
                                    fontWeight: '600',
                                    color: themeStyles.textPrimary,
                                    marginBottom: '8px',
                                }}>
                                    CORBU AI
                                </h1>
                                <p style={{
                                    fontSize: '16px',
                                    color: themeStyles.textSecondary,
                                    marginBottom: '24px',
                                }}>
                                    I&apos;m CORBU AI - a versatile and powerful tool for users seeking to enhance their experience with ChatGPT.
                                </p>
                                <div className="brainwave-capability-chips" style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 'var(--spacing-sm)',
                                    justifyContent: 'center',
                                    marginTop: 'var(--spacing-lg)',
                                }}>
                                    {[
                                        { label: 'Photo edition', icon: '📷', bg: 'var(--accent-secondary-muted)', hoverBg: 'var(--accent-secondary)', border: 'var(--accent-secondary)' },
                                        { label: 'Video generation', icon: '▶️', bg: 'var(--accent-warning-muted)', hoverBg: 'var(--accent-orange)', border: 'var(--accent-orange)' },
                                        { label: 'Photo generation', icon: '🖼️', bg: 'var(--accent-info-muted)', hoverBg: 'var(--accent-info-figma)', border: 'var(--accent-info-figma)' },
                                        { label: 'Code generation', icon: '💻', bg: 'var(--accent-success-muted)', hoverBg: 'var(--accent-success)', border: 'var(--accent-success)' },
                                        { label: 'Audio generation', icon: '🎵', bg: 'var(--accent-warning-muted)', hoverBg: 'var(--accent-orange)', border: 'var(--accent-orange)' },
                                    ].map(({ label, icon, bg, hoverBg, border }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => sendMessage(`Show me ${label.toLowerCase()}`)}
                                            className="brainwave-capability-chip"
                                            style={{ background: bg, borderColor: border }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = hoverBg;
                                                e.currentTarget.style.borderColor = border;
                                                e.currentTarget.style.color = 'var(--on-accent)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = bg;
                                                e.currentTarget.style.borderColor = border;
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                            }}
                                            aria-label={`${label} 시작`}
                                        >
                                            <span>{icon}</span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                                {!currentProject && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '12px 20px',
                                        background: 'var(--accent-info-muted)',
                                        border: '1px solid var(--accent-info-border)',
                                        borderRadius: 'var(--radius-xl)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '14px', color: themeStyles.textPrimary }}>
                                            📁 프로젝트를 선택하거나 새로 만들면 소스 기반 답변을 받을 수 있어요
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowProjectModal(true)}
                                            style={{
                                                padding: '6px 14px',
                                                background: 'var(--accent-info)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                            }}
                                        >
                                            프로젝트 만들기
                                        </button>
                                    </div>
                                )}

                            {/* 카테고리별 예시 질문 */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '32px',
                            }}>
                                {/* 일반 대화 */}
                                <div style={{
                                    background: themeStyles.bgSecondary,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: `1px solid ${themeStyles.borderColor}`,
                                }}>
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>💬</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeStyles.textPrimary, marginBottom: '12px' }}>
                                        일반 대화
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['안녕하세요!', '오늘 기분이 어때요?', '재미있는 이야기 해줘'].map((text) => (
                                            <button
                                                key={text}
                                                type="button"
                                                onClick={() => sendMessage(text)}
                                                aria-label={`예시 질문 전송: ${text}`}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    borderRadius: '8px',
                                                    color: themeStyles.textSecondary,
                                                    fontSize: '13px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 학습/정보 */}
                                <div style={{
                                    background: themeStyles.bgSecondary,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: `1px solid ${themeStyles.borderColor}`,
                                }}>
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>📚</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeStyles.textPrimary, marginBottom: '12px' }}>
                                        학습/정보
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['Python 기초 알려줘', 'React와 Vue 비교해줘', '머신러닝이란?'].map((text) => (
                                            <button
                                                key={text}
                                                type="button"
                                                onClick={() => sendMessage(text)}
                                                aria-label={`예시 질문 전송: ${text}`}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    borderRadius: '8px',
                                                    color: themeStyles.textSecondary,
                                                    fontSize: '13px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 창작/글쓰기 */}
                                <div style={{
                                    background: themeStyles.bgSecondary,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: `1px solid ${themeStyles.borderColor}`,
                                }}>
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>✍️</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeStyles.textPrimary, marginBottom: '12px' }}>
                                        창작/글쓰기
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['이메일 작성 도와줘', '블로그 글 아이디어', '짧은 시 한편 써줘'].map((text) => (
                                            <button
                                                key={text}
                                                type="button"
                                                onClick={() => sendMessage(text)}
                                                aria-label={`예시 질문 전송: ${text}`}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    borderRadius: '8px',
                                                    color: themeStyles.textSecondary,
                                                    fontSize: '13px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 분석/조언 */}
                                <div style={{
                                    background: themeStyles.bgSecondary,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: `1px solid ${themeStyles.borderColor}`,
                                }}>
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeStyles.textPrimary, marginBottom: '12px' }}>
                                        분석/조언
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['코드 리뷰해줘', '이력서 피드백', '사업 아이디어 분석'].map((text) => (
                                            <button
                                                key={text}
                                                type="button"
                                                onClick={() => sendMessage(text)}
                                                aria-label={`예시 질문 전송: ${text}`}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    borderRadius: '8px',
                                                    color: themeStyles.textSecondary,
                                                    fontSize: '13px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 단축키 힌트 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '24px',
                                fontSize: '12px',
                                color: themeStyles.textSecondary,
                            }}>
                                <span><kbd style={{ padding: '2px 6px', background: themeStyles.bgSecondary, borderRadius: '4px', marginRight: '4px' }}>/</kbd> 입력창 포커스</span>
                                <span><kbd style={{ padding: '2px 6px', background: themeStyles.bgSecondary, borderRadius: '4px', marginRight: '4px' }}>?</kbd> 단축키 보기</span>
                            </div>
                        </div>
                        <section className="input-container" aria-label="메시지 입력 영역" data-testid="input-container">
                            <div className="input-wrapper brainwave-input">
                                <button
                                    type="button"
                                    className="input-icon-btn"
                                    onClick={() => inputRef.current?.focus()}
                                    aria-label="첨부 또는 명령어 (/ 입력)"
                                    title="첨부 또는 명령어"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => {
                                        inputHistoryIndexRef.current = -1;
                                        setInput(e.target.value);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type '/' for commands"
                                    rows={1}
                                    className="message-input"
                                    data-testid="chat-input"
                                    aria-label="메시지 입력 (Enter로 전송, ↑↓ 이전 입력)"
                                />
                                <button
                                    type="button"
                                    className="input-icon-btn"
                                    aria-label="음성 입력"
                                    title="음성 입력"
                                    style={{ opacity: 0.6 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v4"/><path d="M8 23h8"/></svg>
                                </button>
                                <button
                                    type="button"
                                    className="send-button"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || isLoading || !isOnline}
                                    data-testid="send-button"
                                    title={!isOnline ? '오프라인 상태입니다' : '메시지 전송 (Enter)'}
                                    aria-label={!isOnline ? '오프라인 상태입니다' : '메시지 전송'}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 10l16-8-8 16-2-6-6-2z" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* 노트북 설정 모달 (Phase 4) */}
            <ProjectEditModal
                isOpen={showProjectEditModal}
                onClose={() => setShowProjectEditModal(false)}
                projectId={currentProject?.id ?? null}
                currentProject={currentProject ? { id: currentProject.id, name: currentProject.name, description: currentProject.description, tags: [] } : null}
                onSaved={(updated) => {
                    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, name: updated.name, description: updated.description || '' } : p)));
                    if (currentProject?.id === updated.id) {
                        setCurrentProject((prev) => (prev ? { ...prev, name: updated.name, description: updated.description || '' } : null));
                    }
                    setToastMessage('설정이 저장되었습니다');
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2000);
                }}
            />

            {/* 노트북 공유 모달 (Phase 4) */}
            {currentProject && (
                <ProjectShareDialog
                    open={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    projectId={currentProject.id}
                    projectName={currentProject.name}
                />
            )}

            {/* PRO 구독 안내 모달 */}
            {showProModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--modal-overlay)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setShowProModal(false)}
                    role="presentation"
                >
                    <div
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pro-modal-title"
                    >
                        <h2 id="pro-modal-title" style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text-primary)' }}>
                            ⭐ PRO 구독
                        </h2>
                        <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            PRO 구독 시 제공될 예정 기능입니다.
                        </p>
                        <ul style={{ margin: '0 0 20px', paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <li>고급 모델 접근 (GPT-4, Claude 등)</li>
                            <li>무제한 노트북·소스</li>
                            <li>우선 지원</li>
                        </ul>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>준비 중입니다.</p>
                        <button
                            type="button"
                            onClick={() => setShowProModal(false)}
                            aria-label="PRO 모달 닫기"
                            style={{
                                marginTop: 20,
                                padding: '10px 20px',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                borderRadius: 8,
                                color: 'var(--on-accent)',
                                cursor: 'pointer',
                                fontSize: 14,
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

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
                            placeholder="프로젝트 이름 (2자 이상)"
                            aria-label="프로젝트 이름"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newProjectName.trim().length >= 2) {
                                    createNewProject();
                                } else if (e.key === 'Escape') {
                                    setShowProjectModal(false);
                                    setNewProjectName('');
                                }
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProjectModal(false);
                                    setNewProjectName('');
                                }}
                                aria-label="프로젝트 생성 취소"
                                style={{ padding: '8px 16px', border: '1px solid var(--sidebar-dark-border-strong)', borderRadius: '4px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={createNewProject}
                                disabled={newProjectName.trim().length < 2}
                                aria-label="프로젝트 생성"
                                title={newProjectName.trim().length < 2 ? '프로젝트 이름을 2자 이상 입력하세요' : undefined}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: newProjectName.trim().length >= 2 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    color: 'var(--on-accent)',
                                    cursor: newProjectName.trim().length >= 2 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 프로젝트 삭제 확인 모달 */}
            {deleteConfirmProject && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="프로젝트 삭제 확인 모달"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) cancelDeleteProject();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelDeleteProject();
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--modal-overlay)',
                        zIndex: 1000,
                        border: 'none',
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            프로젝트 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            다음 프로젝트(노트북)를 삭제하시겠습니까?
                        </p>
                        <p style={{
                            margin: '0 0 20px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '12px',
                            background: 'var(--sidebar-dark-hover)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            📁 {deleteConfirmProject.name}
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--accent-error)', fontSize: '12px' }}>
                            관련 대화와 소스도 함께 삭제되며 되돌릴 수 없습니다.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={cancelDeleteProject}
                                aria-label="프로젝트 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteProject}
                                aria-label="프로젝트 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 메시지 삭제 확인 모달 */}
            {deleteConfirmMessageId && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="메시지 삭제 확인"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setDeleteConfirmMessageId(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setDeleteConfirmMessageId(null);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--modal-overlay)',
                        zIndex: 1000,
                        border: 'none',
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            메시지 삭제
                        </h2>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            이 메시지를 삭제하시겠습니까?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmMessageId(null)}
                                aria-label="메시지 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteMessage}
                                aria-label="메시지 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 메시지 전체 삭제 확인 모달 */}
            {showClearMessagesConfirm && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="메시지 전체 삭제 확인"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowClearMessagesConfirm(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setShowClearMessagesConfirm(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--modal-overlay)',
                        zIndex: 1000,
                        border: 'none',
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            메시지 전체 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            현재 대화의 모든 메시지를 삭제하시겠습니까?
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            대화 자체는 유지됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowClearMessagesConfirm(false)}
                                aria-label="전체 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmClearMessages}
                                aria-label="메시지 전체 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 대화 삭제 확인 모달 */}
            {deleteConfirmConversation && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="대화 삭제 확인 모달"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            cancelDeleteConversation();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            cancelDeleteConversation();
                        }
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--modal-overlay)',
                        zIndex: 1000,
                        border: 'none',
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: 'var(--shadow-modal)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            대화 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            다음 대화를 삭제하시겠습니까?
                        </p>
                        <p style={{
                            margin: '0 0 20px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '12px',
                            background: 'var(--sidebar-dark-hover)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            "{deleteConfirmConversation.title}"
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--accent-error)', fontSize: '12px' }}>
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={cancelDeleteConversation}
                                aria-label="대화 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteConversation}
                                aria-label="대화 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 공통 토스트 알림 (채팅 복사·노트북 응답 완료 등) */}
            {showCopyToast && (
                <div
                    className="toast-notification"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={toastMessage}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        background: 'var(--accent-primary)',
                        color: 'var(--on-accent)',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-dropdown)',
                        zIndex: 10000,
                        animation: 'slideIn 0.3s ease-out',
                    }}
                >
                    ✅ {toastMessage}
                </div>
            )}
        </div>
    );
};

export default ChatGPTInterface;

