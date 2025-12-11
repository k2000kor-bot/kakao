import { ChatSession, Message, ChatMessage } from '../types/chat';

export interface PersistentChatConfig {
    maxSessions: number;
    sessionTimeout: number; // 분 단위
    autoArchive: boolean;
    enableHistory: boolean;
    maxMessageHistory: number;
    backendUrl: string;
}

export interface ChatSessionStats {
    totalSessions: number;
    activeSessions: number;
    archivedSessions: number;
    totalMessages: number;
    averageSessionDuration: number;
    mostActiveTopics: string[];
}

// 백엔드 API 응답 타입들
interface BackendChatSession {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    status: string;
    created_at: string;
    updated_at: string;
    last_activity: string;
    total_messages: number;
    metadata: Record<string, unknown>;
    is_archived: boolean;
}

interface BackendMessage {
    id: string;
    session_id: string;
    content: string;
    role: string;
    sender?: string;
    timestamp: string;
    metadata: Record<string, unknown>;
    is_bookmarked: boolean;
}


export class PersistentChatSessionService {
    private static instance: PersistentChatSessionService;
    private sessions: Map<string, ChatSession> = new Map();
    private config: PersistentChatConfig;
    private sessionCounter: number = 0;

    constructor() {
        this.config = {
            maxSessions: 50,
            sessionTimeout: 1440, // 24시간
            autoArchive: true,
            enableHistory: true,
            maxMessageHistory: 1000,
            backendUrl: 'http://localhost:8001'
        };
        this.loadSessionsFromStorage();
        this.startSessionCleanup();
    }

    public static getInstance(): PersistentChatSessionService {
        if (!PersistentChatSessionService.instance) {
            PersistentChatSessionService.instance = new PersistentChatSessionService();
        }
        return PersistentChatSessionService.instance;
    }

    /**
     * 새로운 지속적 채팅 세션 생성
     */
    public async createPersistentChatSession(
        title: string,
        initialMessage?: string,
        tags: string[] = []
    ): Promise<ChatSession> {
        try {
            // 백엔드에 세션 생성 요청
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title || `지속적 채팅 ${++this.sessionCounter}`,
                    description: initialMessage ? `초기 메시지: ${initialMessage.substring(0, 100)}...` : undefined,
                    tags: [...tags, 'persistent'],
                    metadata: {
                        conversationDepth: 0,
                        topicCount: 0,
                        sessionDuration: 0
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`백엔드 세션 생성 실패: ${response.statusText}`);
            }

            const backendSession: BackendChatSession = await response.json();

            // 프론트엔드 세션 객체로 변환
            const newSession: ChatSession = {
                id: backendSession.id,
                title: backendSession.title,
                messages: [],
                createdAt: backendSession.created_at,
                updatedAt: backendSession.updated_at,
                isActive: backendSession.status === 'active',
                messageCount: 0,
                participants: ['user'],
                tags: backendSession.tags,
                type: 'persistent_chat',
                status: backendSession.status as 'active' | 'archived' | 'deleted',
                lastActivity: backendSession.last_activity,
                totalMessages: backendSession.total_messages,
                isPersistent: true,
                metadata: backendSession.metadata
            };

            // 초기 메시지가 있으면 추가
            if (initialMessage) {
                await this.addMessageToSession(backendSession.id, {
                    role: 'user',
                    content: initialMessage,
                    isBookmarked: false
                });
            }

            this.sessions.set(backendSession.id, newSession);
            this.saveSessionToStorage(newSession);
            this.cleanupOldSessions();

            console.log(`🔄 새로운 지속적 채팅 세션 생성: ${title} (ID: ${backendSession.id})`);
            return newSession;

        } catch (error) {
            console.error('백엔드 세션 생성 실패, 로컬 세션으로 대체:', error);

            // 백엔드 실패 시 로컬 세션 생성
            const now = new Date();
            const sessionId = `persistent_${Date.now()}_${++this.sessionCounter}`;

            const newSession: ChatSession = {
                id: sessionId,
                title: title || `지속적 채팅 ${this.sessionCounter}`,
                messages: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                isActive: true,
                messageCount: 0,
                participants: ['user'],
                tags: [...tags, 'persistent'],
                type: 'persistent_chat',
                status: 'active',
                lastActivity: now.toISOString(),
                totalMessages: 0,
                isPersistent: true,
                metadata: {
                    conversationDepth: 0,
                    topicCount: 0,
                    sessionDuration: 0
                }
            };

            // 초기 메시지가 있으면 추가
            if (initialMessage) {
                const initialMsg: Message = {
                    id: `msg_${Date.now()}`,
                    chatId: sessionId,
                    role: 'user',
                    content: initialMessage,
                    timestamp: now.toISOString(),
                    sender: 'user',
                    isBookmarked: false
                };
                newSession.messages = [initialMsg];
                newSession.messageCount = 1;
                newSession.totalMessages = 1;
                newSession.lastMessage = initialMessage;
            }

            this.sessions.set(sessionId, newSession);
            this.saveSessionToStorage(newSession);
            this.cleanupOldSessions();

            console.log(`🔄 로컬 지속적 채팅 세션 생성: ${title} (ID: ${sessionId})`);
            return newSession;
        }
    }

    /**
     * 기존 채팅 세션을 지속적 세션으로 변환
     */
    public convertToPersistentSession(sessionId: string): ChatSession | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        const updatedSession: ChatSession = {
            ...session,
            type: 'persistent_chat',
            isPersistent: true,
            status: 'active',
            lastActivity: new Date().toISOString(),
            metadata: {
                ...session.metadata,
                conversationDepth: this.calculateConversationDepth(session.messages),
                topicCount: this.extractTopicCount(session.messages),
                sessionDuration: this.calculateSessionDuration(session.createdAt)
            }
        };

        this.sessions.set(sessionId, updatedSession);
        this.saveSessionToStorage(updatedSession);

        console.log(`🔄 채팅 세션을 지속적 세션으로 변환: ${session.title}`);
        return updatedSession;
    }

    /**
     * 메시지 추가 및 세션 업데이트
     */
    public async addMessageToSession(
        sessionId: string,
        message: {
            role: 'user' | 'assistant' | 'system';
            content: string;
            isBookmarked?: boolean;
        }
    ): Promise<Message | null> {
        try {
            // 백엔드에 메시지 추가 요청
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message.content,
                    role: message.role,
                    sender: message.role,
                    metadata: {
                        isBookmarked: message.isBookmarked || false
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`백엔드 메시지 추가 실패: ${response.statusText}`);
            }

            const backendMessage: BackendMessage = await response.json();

            // 프론트엔드 메시지 객체로 변환
            const newMessage: Message = {
                id: backendMessage.id,
                chatId: backendMessage.session_id,
                role: backendMessage.role as 'user' | 'assistant' | 'system',
                content: backendMessage.content,
                timestamp: backendMessage.timestamp,
                sender: backendMessage.sender || backendMessage.role,
                isBookmarked: backendMessage.is_bookmarked
            };

            // 로컬 세션 업데이트
            const session = this.sessions.get(sessionId);
            if (session) {
                session.messages.push(newMessage);
                session.messageCount = session.messages.length;
                session.totalMessages = session.messages.length;
                session.updatedAt = new Date().toISOString();
                session.lastActivity = new Date().toISOString();
                session.lastMessage = message.content;

                // 메시지 히스토리 제한
                if (session.messages.length > this.config.maxMessageHistory) {
                    session.messages = session.messages.slice(-this.config.maxMessageHistory);
                }

                // 메타데이터 업데이트
                if (session.metadata) {
                    session.metadata.conversationDepth = this.calculateConversationDepth(session.messages);
                    session.metadata.topicCount = this.extractTopicCount(session.messages);
                    session.metadata.sessionDuration = this.calculateSessionDuration(session.createdAt);
                }

                this.sessions.set(sessionId, session);
                this.saveSessionToStorage(session);
            }

            return newMessage;

        } catch (error) {
            console.error('백엔드 메시지 추가 실패, 로컬 메시지로 대체:', error);

            // 백엔드 실패 시 로컬 메시지 추가
            const session = this.sessions.get(sessionId);
            if (!session || session.status === 'deleted') return null;

            const now = new Date();
            const newMessage: Message = {
                ...message,
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                chatId: sessionId,
                timestamp: now.toISOString(),
                sender: message.role
            };

            // 메시지 추가
            session.messages.push(newMessage);
            session.messageCount = session.messages.length;
            session.totalMessages = session.messages.length;
            session.updatedAt = now.toISOString();
            session.lastActivity = now.toISOString();
            session.lastMessage = message.content;

            // 메시지 히스토리 제한
            if (session.messages.length > this.config.maxMessageHistory) {
                session.messages = session.messages.slice(-this.config.maxMessageHistory);
            }

            // 메타데이터 업데이트
            if (session.metadata) {
                session.metadata.conversationDepth = this.calculateConversationDepth(session.messages);
                session.metadata.topicCount = this.extractTopicCount(session.messages);
                session.metadata.sessionDuration = this.calculateSessionDuration(session.createdAt);
            }

            this.sessions.set(sessionId, session);
            this.saveSessionToStorage(session);

            return newMessage;
        }
    }

    /**
     * 세션 상태 변경
     */
    public updateSessionStatus(
        sessionId: string,
        status: 'active' | 'archived' | 'deleted'
    ): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.status = status;
        session.isActive = status === 'active';
        session.updatedAt = new Date().toISOString();

        if (status === 'deleted') {
            this.sessions.delete(sessionId);
            this.removeSessionFromStorage(sessionId);
            console.log(`🗑️ 채팅 세션 삭제: ${session.title}`);
        } else {
            this.sessions.set(sessionId, session);
            this.saveSessionToStorage(session);
            console.log(`📝 채팅 세션 상태 변경: ${session.title} -> ${status}`);
        }

        return true;
    }

    /**
     * 세션 아카이브
     */
    public async archiveSession(sessionId: string): Promise<boolean> {
        try {
            // 백엔드에 세션 아카이브 요청
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions/${sessionId}/archive`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`백엔드 세션 아카이브 실패: ${response.statusText}`);
            }

            // 로컬에서도 아카이브
            return this.updateSessionStatus(sessionId, 'archived');

        } catch (error) {
            console.error('백엔드 세션 아카이브 실패, 로컬 아카이브로 대체:', error);
            return this.updateSessionStatus(sessionId, 'archived');
        }
    }

    /**
     * 세션 복원
     */
    public async restoreSession(sessionId: string): Promise<boolean> {
        try {
            // 백엔드에 세션 복원 요청
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions/${sessionId}/restore`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`백엔드 세션 복원 실패: ${response.statusText}`);
            }

            // 로컬에서도 복원
            const session = this.sessions.get(sessionId);
            if (!session || session.status !== 'archived') return false;

            return this.updateSessionStatus(sessionId, 'active');

        } catch (error) {
            console.error('백엔드 세션 복원 실패, 로컬 복원으로 대체:', error);
            const session = this.sessions.get(sessionId);
            if (!session || session.status !== 'archived') return false;
            return this.updateSessionStatus(sessionId, 'active');
        }
    }

    /**
     * 세션 삭제
     */
    public async deleteSession(sessionId: string): Promise<boolean> {
        try {
            // 백엔드에 세션 삭제 요청
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`백엔드 세션 삭제 실패: ${response.statusText}`);
            }

            // 로컬에서도 삭제
            this.sessions.delete(sessionId);
            this.removeSessionFromStorage(sessionId);

            console.log(`🗑️ 채팅 세션 삭제 완료: ${sessionId}`);
            return true;

        } catch (error) {
            console.error('백엔드 세션 삭제 실패, 로컬 삭제로 대체:', error);
            return this.updateSessionStatus(sessionId, 'deleted');
        }
    }

    /**
     * 세션 검색
     */
    public searchSessions(query: string): ChatSession[] {
        const results: ChatSession[] = [];
        const searchTerm = query.toLowerCase();

        this.sessions.forEach(session => {
            if (session.status === 'deleted') return;

            const titleMatch = session.title.toLowerCase().includes(searchTerm);
            const tagMatch = session.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const messageMatch = session.messages.some(msg =>
                msg.content.toLowerCase().includes(searchTerm)
            );

            if (titleMatch || tagMatch || messageMatch) {
                results.push(session);
            }
        });

        return results.sort((a, b) =>
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
    }

    /**
     * 세션 통계 가져오기
     */
    public getSessionStats(): ChatSessionStats {
        const sessions = Array.from(this.sessions.values());
        const activeSessions = sessions.filter(s => s.status === 'active');
        const archivedSessions = sessions.filter(s => s.status === 'archived');

        const totalMessages = sessions.reduce((sum, s) => sum + s.totalMessages, 0);
        const totalDuration = sessions.reduce((sum, s) =>
            sum + this.calculateSessionDuration(s.createdAt), 0
        );

        // 가장 활발한 주제 추출
        const topicFrequency = new Map<string, number>();
        sessions.forEach(session => {
            session.tags.forEach(tag => {
                topicFrequency.set(tag, (topicFrequency.get(tag) || 0) + 1);
            });
        });

        const mostActiveTopics = Array.from(topicFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic]) => topic);

        return {
            totalSessions: sessions.length,
            activeSessions: activeSessions.length,
            archivedSessions: archivedSessions.length,
            totalMessages,
            averageSessionDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
            mostActiveTopics
        };
    }

    /**
     * 모든 활성 세션 가져오기
     */
    public async getActiveSessions(): Promise<ChatSession[]> {
        try {
            // 백엔드에서 활성 세션 목록 가져오기
            const response = await fetch(`${this.config.backendUrl}/api/persistent-sessions?status=active&limit=100`);

            if (!response.ok) {
                throw new Error(`백엔드 세션 목록 조회 실패: ${response.statusText}`);
            }

            const backendSessions: BackendChatSession[] = await response.json();

            // 프론트엔드 세션 객체로 변환
            const sessions: ChatSession[] = backendSessions.map(backendSession => ({
                id: backendSession.id,
                title: backendSession.title,
                messages: [], // 메시지는 별도로 로드
                createdAt: backendSession.created_at,
                updatedAt: backendSession.updated_at,
                isActive: backendSession.status === 'active',
                messageCount: 0,
                participants: ['user'],
                tags: backendSession.tags,
                type: 'persistent_chat',
                status: backendSession.status as 'active' | 'archived' | 'deleted',
                lastActivity: backendSession.last_activity,
                totalMessages: backendSession.total_messages,
                isPersistent: true,
                metadata: backendSession.metadata
            }));

            // 로컬 캐시 업데이트
            sessions.forEach(session => {
                this.sessions.set(session.id, session);
            });

            return sessions.sort((a, b) =>
                new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            );

        } catch (error) {
            console.error('백엔드 세션 목록 조회 실패, 로컬 세션으로 대체:', error);

            // 백엔드 실패 시 로컬 세션 반환
            return Array.from(this.sessions.values())
                .filter(s => s.status === 'active')
                .sort((a, b) =>
                    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
                );
        }
    }

    /**
     * 특정 세션 가져오기
     */
    public getSession(sessionId: string): ChatSession | null {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * 대화 깊이 계산
     */
    private calculateConversationDepth(messages: Message[]): number {
        if (messages.length < 2) return 0;

        let depth = 0;
        let currentDepth = 0;

        messages.forEach((msg, index) => {
            if (index > 0) {
                const prevMsg = messages[index - 1];
                // role 속성이 없는 경우를 대비한 안전한 접근
                const currentRole = (msg as ChatMessage).role || 'unknown';
                const prevRole = (prevMsg as ChatMessage).role || 'unknown';
                if (currentRole !== prevRole) {
                    currentDepth++;
                    depth = Math.max(depth, currentDepth);
                }
            }
        });

        return depth;
    }

    /**
     * 주제 수 추출
     */
    private extractTopicCount(messages: Message[]): number {
        const topics = new Set<string>();

        messages.forEach(msg => {
            // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
            const words = msg.content.split(/\s+/);
            words.forEach(word => {
                if (word.length > 3 && /^[가-힣a-zA-Z]+$/.test(word)) {
                    topics.add(word);
                }
            });
        });

        return Math.min(topics.size, 20); // 최대 20개로 제한
    }

    /**
     * 세션 지속 시간 계산 (분 단위)
     */
    private calculateSessionDuration(createdAt: string): number {
        const created = new Date(createdAt);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    }

    /**
     * 오래된 세션 정리
     */
    private cleanupOldSessions(): void {
        if (!this.config.autoArchive) return;

        const now = new Date();
        const timeoutMs = this.config.sessionTimeout * 60 * 1000;

        this.sessions.forEach((session, sessionId) => {
            if (session.status === 'active') {
                const lastActivity = new Date(session.lastActivity);
                if (now.getTime() - lastActivity.getTime() > timeoutMs) {
                    this.archiveSession(sessionId);
                }
            }
        });
    }

    /**
     * 세션을 로컬 스토리지에 저장
     */
    private saveSessionToStorage(session: ChatSession): void {
        try {
            const stored = localStorage.getItem('persistent_chat_sessions');
            const sessions = stored ? JSON.parse(stored) : {};
            sessions[session.id] = session;
            localStorage.setItem('persistent_chat_sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('세션 저장 실패:', error);
        }
    }

    /**
     * 로컬 스토리지에서 세션 로드
     */
    private loadSessionsFromStorage(): void {
        try {
            const stored = localStorage.getItem('persistent_chat_sessions');
            if (stored) {
                const sessions = JSON.parse(stored) as Record<string, ChatSession>;
                Object.values(sessions).forEach((session: ChatSession) => {
                    if (session.status !== 'deleted') {
                        this.sessions.set(session.id, session);
                    }
                });
            }
        } catch (error) {
            console.error('세션 로드 실패:', error);
        }
    }

    /**
     * 로컬 스토리지에서 세션 제거
     */
    private removeSessionFromStorage(sessionId: string): void {
        try {
            const stored = localStorage.getItem('persistent_chat_sessions');
            if (stored) {
                const sessions = JSON.parse(stored);
                delete sessions[sessionId];
                localStorage.setItem('persistent_chat_sessions', JSON.stringify(sessions));
            }
        } catch (error) {
            console.error('세션 제거 실패:', error);
        }
    }

    /**
     * 주기적 세션 정리 시작
     */
    private startSessionCleanup(): void {
        setInterval(() => {
            this.cleanupOldSessions();
        }, 60000); // 1분마다 정리
    }

    /**
     * 설정 업데이트
     */
    public updateConfig(newConfig: Partial<PersistentChatConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ 지속적 채팅 설정 업데이트:', newConfig);
    }

    /**
     * 현재 설정 가져오기
     */
    public getConfig(): PersistentChatConfig {
        return { ...this.config };
    }
}

export default PersistentChatSessionService;
