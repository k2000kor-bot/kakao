/* cspell:ignore mindmap Mindmap unstar HOBUM */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { checkChatContinuity, detectTopicChange } from '../utils/topicDetector';
import { errorLogger } from '../utils/errorLogger';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isStreaming?: boolean;
    streamingStage?: 'thinking' | 'analyzing' | 'generating' | 'typing';
}

export interface Chat {
    id: string;
    title: string;
    summary: string;
    date: string;
    projectId?: string;
    messages: Message[];
    updatedAt?: string;
}

export interface ParsedRequest {
    index: number;
    type: string;
    content: string;
}

type ChatSortOrder = 'recent' | 'oldest' | 'alphabetical';

export interface UseChatManagementReturn {
    // 채팅 상태
    chats: Chat[];
    currentChatId: string | null;
    currentChat: Chat | null;
    messages: Message[];

    // 채팅 필터링/정렬
    chatSearchTerm: string;
    chatSortOrder: ChatSortOrder;
    chatFilterProject: string | null;
    allDisplayChats: Chat[];

    // 메시지 편집 상태
    editingMessageId: string | null;
    editingMessageContent: string;
    messageSearchTerm: string;
    highlightedMessageIds: Set<string>;

    // 채팅 액션
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    setCurrentChatId: (id: string | null) => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setChatSearchTerm: (term: string) => void;
    setChatSortOrder: (order: ChatSortOrder) => void;
    setChatFilterProject: (projectId: string | null) => void;
    setEditingMessageId: (id: string | null) => void;
    setEditingMessageContent: (content: string) => void;
    setMessageSearchTerm: (term: string) => void;
    setHighlightedMessageIds: React.Dispatch<React.SetStateAction<Set<string>>>;

    // 채팅 CRUD
    selectChat: (chatId: string, onSelect?: (chat: Chat) => void) => void;
    createOrGetChatId: (requests: ParsedRequest[], currentProjectId?: string | null) => Promise<string>;
    updateChatMessages: (chatId: string, updatedMessages: Message[]) => void;
    createProjectChat: (projectId: string, projectName?: string) => string;
    deleteChat: (chatId: string) => void;

    // 메시지 관리
    prepareUserMessages: (requests: ParsedRequest[]) => Message[];
    handleEditMessage: (messageId: string, currentContent: string) => void;
    handleCancelEdit: () => void;
    handleSaveEdit: (messageId: string, onSave?: (updatedMessages: Message[]) => void) => Promise<void>;
    handleRegenerateMessage: (messageId: string, onRegenerate?: (updatedMessages: Message[]) => void) => Promise<void>;
    handleDeleteMessage: (messageId: string, onDelete?: (updatedMessages: Message[]) => void) => void;

    // 채팅 시간 계산
    getChatTime: (chat: Chat) => number;
}

/**
 * useChatManagement 커스텀 훅
 * Task-C1: 채팅 관리 로직 분리
 */
export const useChatManagement = (
    currentProjectId: string | null,
    onProjectSelect?: (projectId: string) => void
): UseChatManagementReturn => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatSearchTerm, setChatSearchTerm] = useState('');
    const [chatSortOrder, setChatSortOrder] = useState<ChatSortOrder>('recent');
    const [chatFilterProject, setChatFilterProject] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingMessageContent, setEditingMessageContent] = useState('');
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [highlightedMessageIds, setHighlightedMessageIds] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 현재 채팅
    const currentChat = useMemo(() => {
        if (!currentChatId) {
            return null;
        }
        return chats.find(chat => chat.id === currentChatId) ?? null;
    }, [chats, currentChatId]);

    // 채팅 시간 계산 헬퍼 함수
    const getChatTime = useCallback((chat: Chat): number => {
        if (chat.updatedAt) {
            return new Date(chat.updatedAt).getTime();
        }
        const lastMessage = chat.messages.at(-1);
        if (lastMessage?.timestamp) {
            return new Date(lastMessage.timestamp).getTime();
        }
        return 0;
    }, []);

    // 일반 채팅 (프로젝트에 속하지 않은 채팅)
    const generalChats = useMemo(
        () => chats
            .filter(c => !c.projectId)
            .sort((a, b) => getChatTime(b) - getChatTime(a)),
        [chats, getChatTime],
    );

    // 현재 프로젝트에 속한 채팅
    const currentProjectChats = useMemo(
        () => currentProjectId
            ? chats
                .filter(c => c.projectId === currentProjectId)
                .sort((a, b) => getChatTime(b) - getChatTime(a))
            : [],
        [chats, currentProjectId, getChatTime],
    );

    // 표시할 모든 채팅 (일반 채팅 + 현재 프로젝트 채팅)
    const allDisplayChats = useMemo(
        () => {
            const combined = [...generalChats, ...currentProjectChats];
            // 중복 제거 및 최신순 정렬
            const uniqueChats = Array.from(
                new Map(combined.map(chat => [chat.id, chat])).values()
            );
            return uniqueChats.sort((a, b) => getChatTime(b) - getChatTime(a));
        },
        [generalChats, currentProjectChats, getChatTime],
    );

    // 채팅 선택 (고도화된 로직)
    const selectChat = useCallback((chatId: string, onSelect?: (chat: Chat) => void) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) {
            errorLogger.warn(`채팅을 찾을 수 없습니다: ${chatId}`, {
                component: 'useChatManagement',
                action: 'selectChat',
                chatId,
            });
            return;
        }

        setCurrentChatId(chatId);
        // 마지막 선택 채팅 ID 저장
        localStorage.setItem('chatgpt_last_chat_id', chatId);

        // 기존 채팅의 메시지 로드 (정렬 확인)
        const chatMessages = (chat.messages || []).sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB; // 시간순 정렬
        });
        setMessages(chatMessages);

        // 프로젝트가 있으면 선택
        if (chat.projectId && onProjectSelect) {
            onProjectSelect(chat.projectId);
        }

        // 콜백 호출
        if (onSelect) {
            onSelect(chat);
        }

        // 채팅 뷰로 전환 후 스크롤을 맨 아래로 (메시지가 있는 경우)
        if (chatMessages.length > 0) {
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        }
    }, [chats, onProjectSelect]);

    /**
     * 채팅 생성 또는 기존 채팅 ID 반환 (고도화된 로직)
     * 
     * @param requests - 파싱된 요청 배열
     * @param projectId - 프로젝트 ID (선택사항)
     * @returns Promise<string> - 채팅 ID
     * @throws Error - 요청이 비어있거나 채팅 생성에 실패한 경우
     * 
     * @description
     * - 주제 변경 감지를 통해 기존 채팅 연속성 체크
     * - 고유한 채팅 ID 생성 (자동 재시도 포함)
     * - 로컬 스토리지 저장 시 용량 초과 처리
     * - 실시간 동기화 지원
     */
    const createOrGetChatId = useCallback(async (requests: ParsedRequest[], projectId?: string | null): Promise<string> => {
        // 혁신적 개선: 입력값 검증
        if (!requests || requests.length === 0) {
            errorLogger.error('요청이 비어있습니다', new Error('요청이 비어있습니다'), {
                component: 'useChatManagement',
                action: 'sendMessage',
            });
            throw new Error('요청이 비어있습니다.');
        }

        const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
        const firstRequest = requests[0]?.content || '';

        // 입력값 검증
        if (!firstRequest || firstRequest.trim().length === 0) {
            errorLogger.error('첫 번째 요청 내용이 비어있습니다', new Error('입력값이 비어있습니다'), {
                component: 'useChatManagement',
                action: 'sendMessage',
            });
            throw new Error('입력값이 비어있습니다.');
        }

        // 고도화: 주제 변경 감지 및 채팅 연속성 체크
        const checkChatContinuityAndReturn = (): string | null => {
            if (!currentChat?.projectId || currentChat.projectId !== projectId || (currentChat.messages?.length ?? 0) === 0) {
                return null;
            }

            try {
                const continuity = checkChatContinuity(
                    {
                        messages: currentChat.messages,
                        updatedAt: currentChat.updatedAt || new Date().toISOString()
                    },
                    firstRequest
                );

                // 연속성 체크 통과 시 기존 채팅 사용
                if (continuity && continuity.shouldContinue) {
                    errorLogger.info(`기존 채팅 연속: ${continuity.reason} (유사도: ${(continuity.topicSimilarity * 100).toFixed(1)}%)`, {
                        component: 'useChatManagement',
                        action: 'sendMessage',
                        reason: continuity.reason,
                        topicSimilarity: continuity.topicSimilarity,
                    });
                    if (!currentChatId) {
                        throw new Error('채팅 ID가 없습니다.');
                    }
                    return currentChatId;
                } else if (continuity) {
                    errorLogger.info(`새 채팅 생성: ${continuity.reason} (유사도: ${(continuity.topicSimilarity * 100).toFixed(1)}%)`, {
                        component: 'useChatManagement',
                        action: 'sendMessage',
                        reason: continuity.reason,
                        topicSimilarity: continuity.topicSimilarity,
                    });
                }
            } catch (error) {
                errorLogger.warn('주제 감지 실패, 기본 로직 사용', {
                    component: 'useChatManagement',
                    action: 'sendMessage',
                    error: error instanceof Error ? error.message : String(error),
                });
                // 기본 로직으로 폴백: 기존 채팅 사용 (있는 경우)
                if (currentChatId) {
                    return currentChatId;
                }
            }
            return null;
        };

        const existingChatId = checkChatContinuityAndReturn();
        if (existingChatId) {
            return existingChatId;
        }

        // 새 채팅 생성 (혁신적 개선: 자동 재시도 포함)
        const now = new Date().toISOString();
        const firstRequestContent = firstRequest || '새 채팅';

        // 제목 생성 개선: 첫 메시지의 핵심 키워드 추출
        const generateTitle = (content: string): string => {
            if (content.length <= 30) return content;

            try {
                // 고도화: 주제 감지 유틸리티 사용
                const topicAnalysis = detectTopicChange(content, []);

                if (topicAnalysis.detectedTopic && topicAnalysis.detectedTopic.length > 0) {
                    const topicTitle = topicAnalysis.detectedTopic.length <= 30
                        ? topicAnalysis.detectedTopic
                        : topicAnalysis.detectedTopic.substring(0, 30) + '...';
                    return topicTitle;
                }
            } catch (error) {
                errorLogger.warn('주제 기반 제목 생성 실패', {
                    component: 'useChatManagement',
                    action: 'sendMessage',
                    error: error instanceof Error ? error.message : String(error),
                });
            }

            // 폴백: 기본 키워드 추출
            const keywords = content
                .replaceAll(/[^\w가-힣\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 1)
                .slice(0, 5)
                .join(' ');

            return keywords.length > 0 && keywords.length < 30
                ? keywords
                : content.substring(0, 30) + '...';
        };

        const chatTitle = generateTitle(firstRequestContent);

        // 혁신적 개선: 채팅 ID 생성 (고유성 보장)
        const generateUniqueChatId = async (): Promise<string> => {
            let chatId: string;
            let attempts = 0;
            const maxAttempts = 5;

            do {
                chatId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
                attempts++;

                // 중복 체크
                const existingChat = chats.find(c => c.id === chatId);
                if (!existingChat) {
                    return chatId;
                }

                if (attempts >= maxAttempts) {
                    errorLogger.error('채팅 ID 생성 실패: 최대 시도 횟수 초과', new Error('채팅 생성에 실패했습니다. 다시 시도해주세요.'), {
                        component: 'useChatManagement',
                        action: 'sendMessage',
                        maxAttempts,
                    });
                    throw new Error('채팅 생성에 실패했습니다. 다시 시도해주세요.');
                }

                // 짧은 지연 후 재시도
                await new Promise(resolve => setTimeout(resolve, 10));
            } while (attempts < maxAttempts);

            // 타입스크립트를 위한 fallback (실제로는 위에서 throw됨)
            throw new Error('채팅 ID 생성 실패');
        };

        const chatId = await generateUniqueChatId();

        const newChat: Chat = {
            id: chatId,
            title: chatTitle,
            summary: requests.length > 1
                ? requests.map((req, idx) => `${idx + 1}. ${req.content}`).join(' | ').substring(0, 100)
                : firstRequestContent.substring(0, 100),
            date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
            projectId: projectId || undefined,
            messages: [],
            updatedAt: now
        };

        // 혁신적 개선: 로컬 스토리지 저장 시 에러 처리
        const saveChatsToStorage = (chatsToSave: Chat[]): Chat[] => {
            try {
                localStorage.setItem('chatgpt_chats', JSON.stringify(chatsToSave));
                return chatsToSave;
            } catch (storageError) {
                if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
                    // 오래된 채팅 제거 후 재시도
                    const sortedChats = [...chatsToSave].sort((a, b) => {
                        const dateA = new Date(a.updatedAt || a.date || 0).getTime();
                        const dateB = new Date(b.updatedAt || b.date || 0).getTime();
                        return dateB - dateA;
                    });
                    const cleanedChats = sortedChats.slice(0, 50); // 최신 50개만 유지
                    localStorage.setItem('chatgpt_chats', JSON.stringify(cleanedChats));
                    errorLogger.warn('로컬 스토리지 용량 초과: 오래된 채팅이 제거되었습니다', {
                        component: 'useChatManagement',
                        action: 'saveChat',
                        removedCount: chats.length - cleanedChats.length,
                    });
                    return cleanedChats;
                } else {
                    throw storageError;
                }
            }
        };

        try {
            const updatedChats = [...chats, newChat];
            const savedChats = saveChatsToStorage(updatedChats);
            setChats(savedChats);
            setCurrentChatId(newChat.id);
            setMessages([]);
        } catch (error) {
            errorLogger.error('채팅 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'useChatManagement',
                action: 'sendMessage',
            });
            throw error;
        }

        // 고도화: 실시간 동기화 (비동기, 블로킹하지 않음)
        try {
            const realTimeSync = (await import('../services/realTimeSync')).default;
            // messageId는 현재 사용하지 않음
            // realTimeSync.sendEvent({
            //     type: 'message',
            //     id: messageId,
            //     data: { message: newMessage },
            //     sessionId: currentSessionId,
            // });
        } catch (error) {
            errorLogger.warn('실시간 동기화 실패', {
                component: 'useChatManagement',
                action: 'syncChat',
                chatId,
                error: error instanceof Error ? error.message : String(error),
            });
        }

        return newChat.id;
    }, [currentChatId, chats]);

    // 채팅 메시지 업데이트 및 저장 (고도화)
    const updateChatMessages = useCallback((chatId: string, updatedMessages: Message[]) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) {
            errorLogger.warn(`채팅을 찾을 수 없습니다: ${chatId}`, {
                component: 'useChatManagement',
                action: 'deleteChat',
                chatId,
            });
            return;
        }

        // 첫 번째 사용자 메시지로 채팅 제목 자동 업데이트 (제목이 기본값인 경우만)
        const firstUserMessage = updatedMessages.find(msg => msg.role === 'user');
        let newTitle = chat.title;
        if (firstUserMessage && (chat.title.includes('새 채팅') || chat.title.includes('새 프로젝트 채팅'))) {
            // 키워드 추출로 더 나은 제목 생성
            const content = firstUserMessage.content;
            if (content.length <= 30) {
                newTitle = content;
            } else {
                // 핵심 키워드 추출
                const keywords = content
                    .replaceAll(/[^\w가-힣\s]/g, ' ')
                    .split(/\s+/)
                    .filter(word => word.length > 1)
                    .slice(0, 5)
                    .join(' ');
                newTitle = keywords.length > 0 && keywords.length < 30
                    ? keywords
                    : content.substring(0, 30) + '...';
            }
        }

        // 요약 생성 (첫 3개 사용자 메시지 기반)
        const userMessages = updatedMessages.filter(msg => msg.role === 'user').slice(0, 3);
        const summary = userMessages
            .map(msg => msg.content)
            .join(' | ')
            .substring(0, 100);

        const updatedChats = chats.map(c =>
            c.id === chatId
                ? {
                    ...c,
                    messages: updatedMessages,
                    title: newTitle,
                    summary: summary || c.summary,
                    updatedAt: new Date().toISOString()
                }
                : c
        );
        setChats(updatedChats);
        localStorage.setItem('chatgpt_chats', JSON.stringify(updatedChats));
    }, [chats]);

    // 프로젝트 채팅 생성 (고도화된 로직)
    const createProjectChat = useCallback((projectId: string, projectName?: string): string => {
        const now = new Date();
        const newChatId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        // 프로젝트별 채팅 제목 생성
        const chatTitle = projectName
            ? `${projectName} - 새 채팅`
            : '새 프로젝트 채팅';

        const newChat: Chat = {
            id: newChatId,
            title: chatTitle,
            summary: projectName ? `${projectName} 프로젝트의 새 채팅입니다.` : '',
            date: now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
            projectId,
            messages: [],
            updatedAt: now.toISOString(),
        };

        setChats(prev => {
            const next = [...prev, newChat];
            localStorage.setItem('chatgpt_chats', JSON.stringify(next));
            return next;
        });
        setCurrentChatId(newChatId);
        setMessages([]);
        return newChatId;
    }, []);

    // 채팅 삭제
    const deleteChat = useCallback((chatId: string) => {
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);
        localStorage.setItem('chatgpt_chats', JSON.stringify(updatedChats));

        if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
        }
    }, [chats, currentChatId]);

    // 사용자 메시지 준비
    const prepareUserMessages = useCallback((requests: ParsedRequest[]): Message[] => {
        return requests.map((req, idx) => ({
            id: `${Date.now()}-${idx}`,
            role: 'user' as const,
            content: req.content,
            timestamp: new Date().toISOString()
        }));
    }, []);

    // 메시지 편집 핸들러
    const handleEditMessage = useCallback((messageId: string, currentContent: string) => {
        setEditingMessageId(messageId);
        setEditingMessageContent(currentContent);
    }, []);

    // 메시지 편집 취소
    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setEditingMessageContent('');
    }, []);

    // 메시지 편집 저장 및 재전송
    const handleSaveEdit = useCallback(async (messageId: string, onSave?: (updatedMessages: Message[]) => void) => {
        if (!editingMessageContent.trim() || !currentChatId) return;

        // 편집된 메시지로 메시지 목록 업데이트
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;

        // 편집된 메시지 이후의 메시지들 제거 (새 응답을 받기 위해)
        const updatedMessages = messages.slice(0, messageIndex).map(msg =>
            msg.id === messageId ? { ...msg, content: editingMessageContent.trim() } : msg
        );

        setMessages(updatedMessages);
        updateChatMessages(currentChatId, updatedMessages);

        setEditingMessageId(null);
        setEditingMessageContent('');

        if (onSave) {
            onSave(updatedMessages);
        }
    }, [editingMessageContent, currentChatId, messages, updateChatMessages]);

    // 메시지 재생성
    const handleRegenerateMessage = useCallback(async (messageId: string, onRegenerate?: (updatedMessages: Message[]) => void) => {
        if (!currentChatId) return;

        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;

        // 재생성할 메시지 이전까지의 메시지들만 유지
        const updatedMessages = messages.slice(0, messageIndex);

        setMessages(updatedMessages);
        updateChatMessages(currentChatId, updatedMessages);

        if (onRegenerate) {
            onRegenerate(updatedMessages);
        }
    }, [currentChatId, messages, updateChatMessages]);

    // 메시지 삭제
    const handleDeleteMessage = useCallback((messageId: string, onDelete?: (updatedMessages: Message[]) => void) => {
        if (!currentChatId) return;

        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        setMessages(updatedMessages);
        updateChatMessages(currentChatId, updatedMessages);

        if (onDelete) {
            onDelete(updatedMessages);
        }
    }, [currentChatId, messages, updateChatMessages]);

    // 초기화: localStorage에서 채팅 로드 (고도화)
    useEffect(() => {
        const savedChats = localStorage.getItem('chatgpt_chats');
        if (savedChats) {
            try {
                const parsedChats = JSON.parse(savedChats) as Chat[];
                if (Array.isArray(parsedChats) && parsedChats.length > 0) {
                    // 메시지가 있는 채팅만 유지하고 정렬
                    const validChats = parsedChats
                        .filter(chat => chat?.id && chat?.title) // 유효한 채팅만 필터링
                        .map(chat => ({
                            id: chat.id,
                            title: chat.title || '제목 없음',
                            summary: chat.summary || '',
                            date: chat.date || new Date().toLocaleDateString('ko-KR'),
                            projectId: chat.projectId,
                            messages: Array.isArray(chat.messages) ? chat.messages : [],
                            updatedAt: chat.updatedAt || chat.date || new Date().toISOString(),
                        }))
                        .sort((a, b) => {
                            const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                            const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                            return timeB - timeA; // 최신순
                        });
                    setChats(validChats);

                    errorLogger.info('[useChatManagement] 채팅 로드 완료', {
                        component: 'useChatManagement',
                        action: 'loadChats',
                        count: validChats.length,
                        chats: validChats.slice(0, 5).map(c => ({ id: c.id, title: c.title, projectId: c.projectId })),
                    });

                    // 마지막 선택했던 채팅이 있으면 선택
                    const lastChatId = localStorage.getItem('chatgpt_last_chat_id');
                    if (lastChatId) {
                        const lastChat = validChats.find(c => c.id === lastChatId);
                        if (lastChat) {
                            // 약간의 지연을 두어 UI가 준비된 후 로드
                            setTimeout(() => {
                                setCurrentChatId(lastChatId);
                                setMessages(lastChat.messages || []);
                            }, 100);
                        }
                    }
                } else {
                    // 빈 배열이거나 유효하지 않은 데이터인 경우 초기화
                    setChats([]);
                    localStorage.setItem('chatgpt_chats', JSON.stringify([]));
                    errorLogger.info('[useChatManagement] 채팅 데이터 없음, 빈 배열로 초기화', {
                        component: 'useChatManagement',
                        action: 'loadChats',
                    });
                }
            } catch (e) {
                errorLogger.error('[useChatManagement] 채팅 로드 오류', e instanceof Error ? e : new Error(String(e)), {
                    component: 'useChatManagement',
                    action: 'loadChats',
                });
                setChats([]);
                localStorage.setItem('chatgpt_chats', JSON.stringify([]));
            }
        } else {
            // localStorage에 데이터가 없는 경우 빈 배열로 초기화
            setChats([]);
            localStorage.setItem('chatgpt_chats', JSON.stringify([]));
            errorLogger.info('[useChatManagement] localStorage에 채팅 데이터 없음, 빈 배열로 초기화', {
                component: 'useChatManagement',
                action: 'loadChats',
            });
        }
    }, []);

    // 채팅 변경 시 localStorage에 저장 (빈 배열도 저장하여 초기화 상태 유지)
    useEffect(() => {
        localStorage.setItem('chatgpt_chats', JSON.stringify(chats));
    }, [chats]);

    return {
        chats,
        currentChatId,
        currentChat,
        messages,
        chatSearchTerm,
        chatSortOrder,
        chatFilterProject,
        allDisplayChats,
        editingMessageId,
        editingMessageContent,
        messageSearchTerm,
        highlightedMessageIds,
        setChats,
        setCurrentChatId,
        setMessages,
        setChatSearchTerm,
        setChatSortOrder,
        setChatFilterProject,
        setEditingMessageId,
        setEditingMessageContent,
        setMessageSearchTerm,
        setHighlightedMessageIds,
        selectChat,
        createOrGetChatId,
        updateChatMessages,
        createProjectChat,
        deleteChat,
        prepareUserMessages,
        handleEditMessage,
        handleCancelEdit,
        handleSaveEdit,
        handleRegenerateMessage,
        handleDeleteMessage,
        getChatTime,
    };
};

export default useChatManagement;
