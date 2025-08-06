interface CollaborationMessage {
    id: string;
    type: 'message' | 'status' | 'file' | 'analysis' | 'insight';
    sender: string;
    content: string;
    timestamp: string;
    projectId?: string;
    metadata?: any;
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
    files: any[];
    analyses: any[];
}

class RealtimeCollaborationService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000;
    private listeners: Map<string, Function[]> = new Map();
    private currentUser: UserStatus | null = null;
    private currentProject: string | null = null;

    constructor(private serverUrl: string = 'ws://localhost:8002') { }

    // WebSocket 연결
    connect(userId: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`${this.serverUrl}?userId=${userId}&username=${username}`);

                this.ws.onopen = () => {
                    console.log('WebSocket 연결 성공');
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
                    console.log('WebSocket 연결 종료');
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket 오류:', error);
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
            console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                if (this.currentUser) {
                    this.connect(this.currentUser.userId, this.currentUser.username)
                        .catch(error => console.error('재연결 실패:', error));
                }
            }, this.reconnectInterval);
        }
    }

    // 메시지 처리
    private handleMessage(data: any): void {
        const { type, payload } = data;

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
                console.log('알 수 없는 메시지 타입:', type);
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
    private emit(event: string, data: any): void {
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
    notifyFileUpload(fileInfo: any): void {
        this.sendMessage(`파일 업로드: ${fileInfo.name}`, 'file');
    }

    // 분석 완료 알림
    notifyAnalysisComplete(analysisInfo: any): void {
        this.sendMessage(`분석 완료: ${analysisInfo.type}`, 'analysis');
    }

    // 인사이트 생성 알림
    notifyInsightGenerated(insightInfo: any): void {
        this.sendMessage(`인사이트 생성: ${insightInfo.type}`, 'insight');
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