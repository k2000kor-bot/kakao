import { errorLogger, toError } from '../utils/errorLogger';
import {
    API_QUERY_PARAM_USER_ID_CAMEL,
    API_QUERY_PARAM_USERNAME,
    WS_BASE_URL,
    WS_COLLABORATION_PATH,
    joinApiBaseAndPath,
} from '../config/api';

interface CollaborationMessage {
    id: string;
    type: 'message' | 'status' | 'file' | 'analysis' | 'insight';
    sender: string;
    content: string;
    timestamp: string;
    projectId?: string;
    metadata?: unknown;
}

interface UserStatus {
    userId: string;
    username: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    currentProject?: string;
    lastActivity: string;
}

interface ProjectCollaboration {
    projectId: string;
    projectName: string;
    activeUsers: UserStatus[];
    messages: CollaborationMessage[];
    files: unknown[];
    analyses: unknown[];
}

class RealtimeCollaborationService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000;
    private listeners: Map<string, Function[]> = new Map();
    private currentUser: UserStatus | null = null;
    private currentProject: string | null = null;

    constructor(
        private collaborationWsUrl: string = joinApiBaseAndPath(WS_BASE_URL, WS_COLLABORATION_PATH),
    ) { }

    /** `ws://`/`wss://` 베이스에 쿼리를 `URL`로 붙여 인코딩·기존 쿼리와 충돌을 피한다. */
    private buildCollaborationWebSocketUrl(userId: string, username: string): string {
        try {
            const u = new URL(this.collaborationWsUrl);
            u.searchParams.set(API_QUERY_PARAM_USER_ID_CAMEL, userId);
            u.searchParams.set(API_QUERY_PARAM_USERNAME, username);
            return u.toString();
        } catch {
            const base = this.collaborationWsUrl.replace(/\/$/, '');
            const sep = base.includes('?') ? '&' : '?';
            return `${base}${sep}${API_QUERY_PARAM_USER_ID_CAMEL}=${encodeURIComponent(userId)}&${API_QUERY_PARAM_USERNAME}=${encodeURIComponent(username)}`;
        }
    }

    // WebSocket 연결
    connect(userId: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.buildCollaborationWebSocketUrl(userId, username));

                this.ws.onopen = () => {
                    errorLogger.info('WebSocket 연결 성공', {
                        component: 'realtimeCollaboration',
                        action: 'connect',
                        userId,
                        username,
                    });
                    this.reconnectAttempts = 0;
                    this.currentUser = {
                        userId,
                        username,
                        status: 'online',
                        lastActivity: new Date().toISOString()
                    };
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

                this.ws.onclose = () => {
                    errorLogger.info('WebSocket 연결 종료', {
                        component: 'realtimeCollaboration',
                        action: 'connect',
                        userId,
                        username,
                    });
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    const err = toError(error);
                    errorLogger.error('WebSocket 오류', err, {
                        component: 'realtimeCollaboration',
                        action: 'connect',
                        userId,
                        username,
                    });
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // 재연결 처리
    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            errorLogger.info('재연결 시도', {
                component: 'realtimeCollaboration',
                action: 'handleReconnect',
                reconnectAttempts: this.reconnectAttempts,
                maxReconnectAttempts: this.maxReconnectAttempts,
                userId: this.currentUser?.userId,
            });

            setTimeout(() => {
                if (this.currentUser) {
                    this.connect(this.currentUser.userId, this.currentUser.username)
                        .catch(error => {
                            const err = toError(error);
                            errorLogger.error('재연결 실패', err, {
                                component: 'realtimeCollaboration',
                                action: 'handleReconnect',
                                userId: this.currentUser?.userId,
                                reconnectAttempts: this.reconnectAttempts,
                            });
                        });
                }
            }, this.reconnectInterval);
        }
    }

    // 메시지 처리
    private handleMessage(data: Record<string, unknown>): void {
        const { type, payload } = data as { type: string; payload?: unknown };

        switch (type) {
            case 'message':
                this.emit('message', payload);
                break;
            case 'user_status':
                this.emit('userStatus', payload);
                break;
            case 'project_update':
                this.emit('projectUpdate', payload);
                break;
            case 'file_upload':
                this.emit('fileUpload', payload);
                break;
            case 'analysis_complete':
                this.emit('analysisComplete', payload);
                break;
            case 'insight_generated':
                this.emit('insightGenerated', payload);
                break;
            default:
                errorLogger.info('알 수 없는 메시지 타입', {
                    component: 'realtimeCollaboration',
                    action: 'handleMessage',
                    messageType: type,
                });
        }
    }

    // 이벤트 리스너 등록
    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    // 이벤트 발생
    private emit(event: string, data: unknown): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // 프로젝트 참여
    joinProject(projectId: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.currentProject = projectId;
            this.ws.send(JSON.stringify({
                type: 'join_project',
                payload: { projectId }
            }));
        }
    }

    // 프로젝트 나가기
    leaveProject(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentProject) {
            this.ws.send(JSON.stringify({
                type: 'leave_project',
                payload: { projectId: this.currentProject }
            }));
            this.currentProject = null;
        }
    }

    // 메시지 전송
    sendMessage(content: string, type: 'message' | 'status' | 'file' | 'analysis' | 'insight' = 'message'): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: CollaborationMessage = {
                id: Date.now().toString(),
                type,
                sender: this.currentUser?.username || 'Unknown',
                content,
                timestamp: new Date().toISOString(),
                projectId: this.currentProject || undefined
            };

            this.ws.send(JSON.stringify({
                type: 'send_message',
                payload: message
            }));
        }
    }

    // 상태 업데이트
    updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
        if (this.currentUser) {
            this.currentUser.status = status;
            this.currentUser.lastActivity = new Date().toISOString();

            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'update_status',
                    payload: this.currentUser
                }));
            }
        }
    }

    // 파일 업로드 알림
    notifyFileUpload(fileInfo: { name?: string }): void {
        this.sendMessage(`파일 업로드: ${fileInfo.name ?? 'unknown'}`, 'file');
    }

    // 분석 완료 알림
    notifyAnalysisComplete(analysisInfo: { type?: string }): void {
        this.sendMessage(`분석 완료: ${analysisInfo.type ?? 'unknown'}`, 'analysis');
    }

    // 인사이트 생성 알림
    notifyInsightGenerated(insightInfo: { type?: string }): void {
        this.sendMessage(`인사이트 생성: ${insightInfo.type ?? 'unknown'}`, 'insight');
    }

    // 연결 종료
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.currentUser = null;
        this.currentProject = null;
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// 싱글톤 인스턴스 생성
export const realtimeCollaboration = new RealtimeCollaborationService();

// 타입 내보내기
export type { CollaborationMessage, UserStatus, ProjectCollaboration }; 