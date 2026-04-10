/**
 * 실시간 협업 서비스
 * 여러 사용자가 동시에 프로젝트를 편집하고 협업할 수 있는 기능
 */

import { resolveCollaborationWebSocketUrl } from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';
import { COLLABORATION_USERNAME_STORAGE_KEY } from './realTimeCollaborationStorageKeys';

export interface CollaborationUser {
    userId: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
    currentActivity: string;
    cursorPosition?: { x: number; y: number };
}

export interface CollaborationSession {
    sessionId: string;
    projectId: string;
    users: CollaborationUser[];
    createdAt: Date;
    lastActivity: Date;
    isActive: boolean;
}

export interface CollaborationEvent {
    type: 'join' | 'leave' | 'cursor_move' | 'text_change' | 'file_upload' | 'comment';
    userId: string;
    timestamp: Date;
    data: unknown;
}

export interface SharedDocument {
    documentId: string;
    projectId: string;
    content: string;
    version: number;
    lastModified: Date;
    lastModifiedBy: string;
    collaborators: string[];
}

export class RealTimeCollaborationService {
    private sessions: Map<string, CollaborationSession> = new Map();
    private users: Map<string, CollaborationUser> = new Map();
    private documents: Map<string, SharedDocument> = new Map();
    private eventListeners: Map<string, Array<(event: CollaborationEvent) => void>> = new Map();
    private currentUserId: string = this.generateUserId();
    private currentSessionId: string | null = null;
    private websocket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor() {
        this.initializeWebSocket();
        this.setupHeartbeat();
    }

    /**
     * WebSocket 초기화
     */
    private initializeWebSocket(): void {
        try {
            this.websocket = new WebSocket(resolveCollaborationWebSocketUrl());

            this.websocket.onopen = () => {
                errorLogger.info('협업 WebSocket 연결 성공', {
                    component: 'realTimeCollaborationService',
                    action: 'initializeWebSocket',
                    userId: this.currentUserId,
                });
                this.reconnectAttempts = 0;
                this.broadcastUserStatus('online');
            };

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };

            this.websocket.onclose = () => {
                errorLogger.info('협업 WebSocket 연결 종료', {
                    component: 'realTimeCollaborationService',
                    action: 'initializeWebSocket',
                    userId: this.currentUserId,
                });
                this.broadcastUserStatus('offline');
                this.attemptReconnect();
            };

            this.websocket.onerror = (error) => {
                const err = toError(error);
                errorLogger.error('협업 WebSocket 오류', err, {
                    component: 'realTimeCollaborationService',
                    action: 'initializeWebSocket',
                    userId: this.currentUserId,
                });
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('WebSocket 초기화 실패', err, {
                component: 'realTimeCollaborationService',
                action: 'initializeWebSocket',
                userId: this.currentUserId,
            });
        }
    }

    /**
     * WebSocket 메시지 처리
     */
    private handleWebSocketMessage(data: string): void {
        try {
            const event: CollaborationEvent = JSON.parse(data);

            switch (event.type) {
                case 'join':
                    this.handleUserJoin(event);
                    break;
                case 'leave':
                    this.handleUserLeave(event);
                    break;
                case 'cursor_move':
                    this.handleCursorMove(event);
                    break;
                case 'text_change':
                    this.handleTextChange(event);
                    break;
                case 'file_upload':
                    this.handleFileUpload(event);
                    break;
                case 'comment':
                    this.handleComment(event);
                    break;
            }

            // 이벤트 리스너들에게 알림
            this.notifyEventListeners(event);
        } catch (error) {
            const err = toError(error);
            errorLogger.error('WebSocket 메시지 처리 실패', err, {
                component: 'realTimeCollaborationService',
                action: 'handleWebSocketMessage',
                userId: this.currentUserId,
            });
        }
    }

    /**
     * 사용자 참가 처리
     */
    private handleUserJoin(event: CollaborationEvent): void {
        const data = event.data as { username?: string; avatar?: string; activity?: string; sessionId?: string };
        const user: CollaborationUser = {
            userId: event.userId,
            username: data.username ?? 'Unknown',
            avatar: data.avatar,
            isOnline: true,
            lastSeen: new Date(),
            currentActivity: data.activity ?? '프로젝트 참여'
        };

        this.users.set(event.userId, user);

        if (data.sessionId) {
            const session = this.sessions.get(data.sessionId);
            if (session) {
                session.users.push(user);
                session.lastActivity = new Date();
            }
        }
    }

    /**
     * 사용자 퇴장 처리
     */
    private handleUserLeave(event: CollaborationEvent): void {
        const user = this.users.get(event.userId);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            user.currentActivity = '오프라인';
        }

        // 모든 세션에서 사용자 제거
        this.sessions.forEach(session => {
            session.users = session.users.filter(u => u.userId !== event.userId);
        });
    }

    /**
     * 커서 이동 처리
     */
    private handleCursorMove(event: CollaborationEvent): void {
        const user = this.users.get(event.userId);
        if (user) {
            const data = event.data as { position?: { x: number; y: number } };
            user.cursorPosition = data.position;
            user.lastSeen = new Date();
        }
    }

    /**
     * 텍스트 변경 처리
     */
    private handleTextChange(event: CollaborationEvent): void {
        const data = event.data as { documentId?: string; content?: string; version?: number };
        const { documentId, content, version } = data;
        if (!documentId || content === undefined || version === undefined) return;
        const document = this.documents.get(documentId);

        if (document && version > document.version) {
            document.content = content;
            document.version = version;
            document.lastModified = new Date();
            document.lastModifiedBy = event.userId;
        }
    }

    /**
     * 파일 업로드 처리
     */
    private handleFileUpload(event: CollaborationEvent): void {
        // 파일 업로드 이벤트 처리
        errorLogger.info('파일 업로드', {
            component: 'realTimeCollaborationService',
            action: 'handleFileUpload',
            userId: event.userId,
            timestamp: event.timestamp.toISOString(),
        });
    }

    /**
     * 댓글 처리
     */
    private handleComment(event: CollaborationEvent): void {
        // 댓글 이벤트 처리
        errorLogger.info('댓글', {
            component: 'realTimeCollaborationService',
            action: 'handleComment',
            userId: event.userId,
            timestamp: event.timestamp.toISOString(),
        });
    }

    /**
     * 세션 참가
     */
    async joinSession(projectId: string): Promise<CollaborationSession> {
        const sessionId = `session_${projectId}_${Date.now()}`;

        const session: CollaborationSession = {
            sessionId,
            projectId,
            users: [],
            createdAt: new Date(),
            lastActivity: new Date(),
            isActive: true
        };

        this.sessions.set(sessionId, session);
        this.currentSessionId = sessionId;

        // WebSocket을 통해 참가 알림
        this.sendWebSocketMessage({
            type: 'join',
            userId: this.currentUserId,
            timestamp: new Date(),
            data: {
                sessionId,
                projectId,
                username: this.getCurrentUsername(),
                activity: '프로젝트 참여'
            }
        });

        return session;
    }

    /**
     * 세션 퇴장
     */
    leaveSession(): void {
        if (this.currentSessionId) {
            this.sendWebSocketMessage({
                type: 'leave',
                userId: this.currentUserId,
                timestamp: new Date(),
                data: {
                    sessionId: this.currentSessionId
                }
            });

            this.sessions.delete(this.currentSessionId);
            this.currentSessionId = null;
        }
    }

    /**
     * 커서 위치 업데이트
     */
    updateCursorPosition(x: number, y: number): void {
        this.sendWebSocketMessage({
            type: 'cursor_move',
            userId: this.currentUserId,
            timestamp: new Date(),
            data: { position: { x, y } }
        });
    }

    /**
     * 텍스트 변경 전송
     */
    sendTextChange(documentId: string, content: string, version: number): void {
        this.sendWebSocketMessage({
            type: 'text_change',
            userId: this.currentUserId,
            timestamp: new Date(),
            data: { documentId, content, version }
        });
    }

    /**
     * 댓글 전송
     */
    sendComment(comment: string, targetId?: string): void {
        this.sendWebSocketMessage({
            type: 'comment',
            userId: this.currentUserId,
            timestamp: new Date(),
            data: { comment, targetId }
        });
    }

    /**
     * 공유 문서 생성
     */
    createSharedDocument(projectId: string, initialContent: string = ''): SharedDocument {
        const documentId = `doc_${projectId}_${Date.now()}`;

        const document: SharedDocument = {
            documentId,
            projectId,
            content: initialContent,
            version: 1,
            lastModified: new Date(),
            lastModifiedBy: this.currentUserId,
            collaborators: [this.currentUserId]
        };

        this.documents.set(documentId, document);
        return document;
    }

    /**
     * 공유 문서 업데이트
     */
    updateSharedDocument(documentId: string, content: string): boolean {
        const document = this.documents.get(documentId);
        if (document) {
            document.content = content;
            document.version += 1;
            document.lastModified = new Date();
            document.lastModifiedBy = this.currentUserId;

            this.sendTextChange(documentId, content, document.version);
            return true;
        }
        return false;
    }

    /**
     * 현재 세션의 사용자 목록 조회
     */
    getCurrentSessionUsers(): CollaborationUser[] {
        if (this.currentSessionId) {
            const session = this.sessions.get(this.currentSessionId);
            return session ? session.users : [];
        }
        return [];
    }

    /**
     * 온라인 사용자 목록 조회
     */
    getOnlineUsers(): CollaborationUser[] {
        return Array.from(this.users.values()).filter(user => user.isOnline);
    }

    /**
     * 공유 문서 조회
     */
    getSharedDocument(documentId: string): SharedDocument | null {
        return this.documents.get(documentId) || null;
    }

    /**
     * 이벤트 리스너 등록
     */
    addEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(callback);
    }

    /**
     * 이벤트 리스너 제거
     */
    removeEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 이벤트 리스너들에게 알림
     */
    private notifyEventListeners(event: CollaborationEvent): void {
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    const err = toError(error);
                    errorLogger.error('이벤트 리스너 오류', err, {
                        component: 'realTimeCollaborationService',
                        action: 'notifyEventListeners',
                        eventType: event.type,
                        userId: event.userId,
                    });
                }
            });
        }
    }

    /**
     * WebSocket 메시지 전송
     */
    private sendWebSocketMessage(event: CollaborationEvent): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(event));
        } else {
            errorLogger.warn('WebSocket이 연결되지 않았습니다', {
                component: 'realTimeCollaborationService',
                action: 'sendWebSocketMessage',
                eventType: event.type,
                userId: event.userId,
                websocketState: this.websocket?.readyState,
            });
        }
    }

    /**
     * 사용자 상태 브로드캐스트
     */
    private broadcastUserStatus(status: 'online' | 'offline'): void {
        this.sendWebSocketMessage({
            type: status === 'online' ? 'join' : 'leave',
            userId: this.currentUserId,
            timestamp: new Date(),
            data: {
                username: this.getCurrentUsername(),
                status
            }
        });
    }

    /**
     * 재연결 시도
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            setTimeout(() => {
                errorLogger.info('재연결 시도', {
                    component: 'realTimeCollaborationService',
                    action: 'attemptReconnect',
                    userId: this.currentUserId,
                    reconnectAttempts: this.reconnectAttempts,
                    maxReconnectAttempts: this.maxReconnectAttempts,
                });
                this.initializeWebSocket();
            }, delay);
        } else {
            errorLogger.error('최대 재연결 시도 횟수 초과', new Error('최대 재연결 시도 횟수 초과'), {
                component: 'realTimeCollaborationService',
                action: 'attemptReconnect',
                userId: this.currentUserId,
                maxReconnectAttempts: this.maxReconnectAttempts,
            });
        }
    }

    /**
     * 하트비트 설정
     */
    private setupHeartbeat(): void {
        setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.sendWebSocketMessage({
                    type: 'cursor_move',
                    userId: this.currentUserId,
                    timestamp: new Date(),
                    data: { heartbeat: true }
                });
            }
        }, 30000); // 30초마다 하트비트
    }

    /**
     * 유틸리티 메서드들
     */
    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getCurrentUsername(): string {
        return localStorage.getItem(COLLABORATION_USERNAME_STORAGE_KEY) || '익명 사용자';
    }

    /**
     * 서비스 정리
     */
    cleanup(): void {
        this.leaveSession();

        if (this.websocket) {
            this.websocket.close();
        }

        this.sessions.clear();
        this.users.clear();
        this.documents.clear();
        this.eventListeners.clear();
    }
}

export { COLLABORATION_USERNAME_STORAGE_KEY } from './realTimeCollaborationStorageKeys';

// 싱글톤 인스턴스
export const realTimeCollaborationService = new RealTimeCollaborationService();

export default realTimeCollaborationService;
