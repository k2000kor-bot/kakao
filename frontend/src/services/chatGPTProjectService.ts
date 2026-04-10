/**
 * ChatGPT 스타일 프로젝트 관리 서비스
 * 백엔드 API와 연동하여 프로젝트, 세션, 메시지 관리
 */

import { errorHandler } from '../utils/errorHandler';
import { errorLogger } from '../utils/errorLogger';
import {
    API_BASE_URL,
    API_FORM_FIELD_FILE,
    API_PERSISTENT_SESSION_ARCHIVE_SEGMENT,
    API_PERSISTENT_SESSION_FILES_SEGMENT,
    API_PERSISTENT_SESSION_MESSAGES_SEGMENT,
    API_PERSISTENT_SESSION_STATS_SEGMENT,
    API_PERSISTENT_SESSION_UPLOAD_SEGMENT,
    API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100,
    API_PERSISTENT_SESSIONS_PATH,
    joinApiHealthCheckUrl,
} from '../config/api';

export interface Project {
    id: string;
    name: string;
    category: string;
    memoryType: 'default' | 'project_exclusive';
    description?: string;
    createdAt: string;
    fileCount: number;
    sessionCount: number;
}

export interface ProjectSession {
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    lastActivity: string;
    messageCount: number;
    isActive: boolean;
    tags?: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isBookmarked?: boolean;
    metadata?: {
        sources?: string[];
        confidence?: number;
        processingTime?: number;
    };
}

interface BackendSession {
    id: string;
    title: string;
    description: string;
    created_at: string;
    last_activity: string;
    total_messages: number;
    metadata: Record<string, unknown>;
    is_archived: boolean;
    status?: string;
    tags?: string[];
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

export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'image' | 'code' | 'other';
    size: number;
    uploadedAt: string;
    url?: string;
}

class ChatGPTProjectService {
    private static instance: ChatGPTProjectService;
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    public static getInstance(): ChatGPTProjectService {
        if (!ChatGPTProjectService.instance) {
            ChatGPTProjectService.instance = new ChatGPTProjectService();
        }
        return ChatGPTProjectService.instance;
    }

    // 프로젝트 관리
    async createProject(projectData: {
        name: string;
        category: string;
        memoryType: 'default' | 'project_exclusive';
        description?: string;
    }): Promise<Project> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, `${API_PERSISTENT_SESSIONS_PATH}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: projectData.name,
                    description: projectData.description,
                    tags: [projectData.category, 'project'],
                    metadata: {
                        memoryType: projectData.memoryType,
                        category: projectData.category,
                        type: 'project'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`프로젝트 생성 실패: ${response.statusText}`);
            }

            const backendSession = await response.json();

            return {
                id: backendSession.id,
                name: backendSession.title,
                category: projectData.category,
                memoryType: projectData.memoryType,
                description: backendSession.description,
                createdAt: backendSession.created_at,
                fileCount: 0,
                sessionCount: 0
            };
        } catch (error) {
            errorLogger.error('프로젝트 생성 실패', error);
            throw error;
        }
    }

    async getProjects(): Promise<Project[]> {
        const result = await errorHandler.safeApiCall(
            async () => {
                const response = await fetch(
                    joinApiHealthCheckUrl(
                        this.baseUrl,
                        `${API_PERSISTENT_SESSIONS_PATH}?${API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100}`,
                    ),
                );

                if (!response.ok) {
                    throw new Error(`프로젝트 목록 조회 실패: ${response.statusText}`);
                }

                const backendSessions = await response.json();

                return backendSessions
                    .filter((session: BackendSession) => session.metadata?.type === 'project')
                    .map((session: BackendSession) => ({
                        id: session.id,
                        name: session.title,
                        category: session.metadata?.category || 'other',
                        memoryType: session.metadata?.memoryType || 'default',
                        description: session.description,
                        createdAt: session.created_at,
                        fileCount: (session.metadata?.fileCount as number) || 0,
                        sessionCount: session.total_messages || 0
                    }));
            },
            { operation: 'getProjects', baseUrl: this.baseUrl }
        );

        if (!result) {
            errorLogger.error('프로젝트 목록 조회 실패', new Error('결과가 없습니다'));
            return [];
        }

        if (result && 'success' in result && result.success === false) {
            const errorMessage = result.error?.message || result.error?.details || '알 수 없는 오류';
            errorLogger.error('프로젝트 목록 조회 실패', new Error(errorMessage));
            return [];
        }

        if (result && 'success' in result && result.success === true && 'data' in result) {
            return result.data;
        }

        return [];
    }

    // 세션 관리
    async createSession(projectId: string, title: string): Promise<ProjectSession> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseUrl, `${API_PERSISTENT_SESSIONS_PATH}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    description: `프로젝트 ${projectId}의 세션`,
                    tags: ['session', 'chat'],
                    metadata: {
                        projectId: projectId,
                        type: 'session'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`세션 생성 실패: ${response.statusText}`);
            }

            const backendSession = await response.json();

            return {
                id: backendSession.id,
                title: backendSession.title,
                preview: '',
                createdAt: backendSession.created_at,
                lastActivity: backendSession.last_activity,
                messageCount: 0,
                isActive: true,
                tags: ['새 세션']
            };
        } catch (error) {
            errorLogger.error('세션 생성 실패', error);
            throw error;
        }
    }

    async getProjectSessions(projectId: string): Promise<ProjectSession[]> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}?${API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100}`,
                ),
            );

            if (!response.ok) {
                throw new Error(`세션 목록 조회 실패: ${response.statusText}`);
            }

            const backendSessions = await response.json();

            return backendSessions
                .filter((session: BackendSession) => session.metadata?.projectId === projectId)
                .map((session: BackendSession) => ({
                    id: session.id,
                    title: session.title,
                    preview: session.description || '',
                    createdAt: session.created_at,
                    lastActivity: session.last_activity,
                    messageCount: session.total_messages || 0,
                    isActive: session.status === 'active',
                    tags: session.tags || []
                }));
        } catch (error) {
            errorLogger.error('세션 목록 조회 실패', error);
            return [];
        }
    }

    // 메시지 관리
    async sendMessage(sessionId: string, content: string, role: 'user' | 'assistant' = 'user'): Promise<ChatMessage> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}${API_PERSISTENT_SESSION_MESSAGES_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                        role: role,
                        sender: role,
                        metadata: {
                            timestamp: new Date().toISOString()
                        }
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`메시지 전송 실패: ${response.statusText}`);
            }

            const backendMessage = await response.json();

            return {
                id: backendMessage.id,
                role: backendMessage.role as 'user' | 'assistant' | 'system',
                content: backendMessage.content,
                timestamp: backendMessage.timestamp,
                isBookmarked: backendMessage.is_bookmarked,
                metadata: backendMessage.metadata
            };
        } catch (error) {
            errorLogger.error('메시지 전송 실패', error);
            throw error;
        }
    }

    async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}${API_PERSISTENT_SESSION_MESSAGES_SEGMENT}?${API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100}`,
                ),
            );

            if (!response.ok) {
                throw new Error(`메시지 목록 조회 실패: ${response.statusText}`);
            }

            const backendMessages = await response.json();

            return backendMessages.map((message: BackendMessage) => ({
                id: message.id,
                role: message.role as 'user' | 'assistant' | 'system',
                content: message.content,
                timestamp: message.timestamp,
                isBookmarked: message.is_bookmarked,
                metadata: message.metadata
            }));
        } catch (error) {
            errorLogger.error('메시지 목록 조회 실패', error);
            return [];
        }
    }

    // AI 응답 생성 (실제로는 백엔드 AI 엔진과 연동)
    async generateAIResponse(sessionId: string, userMessage: string): Promise<ChatMessage> {
        try {
            // 실제로는 백엔드 AI 엔진 API를 호출
            // 여기서는 시뮬레이션된 응답을 반환
            const aiResponse = await this.generateMockAIResponse(userMessage);

            // AI 응답을 세션에 저장
            return await this.sendMessage(sessionId, aiResponse, 'assistant');
        } catch (error) {
            errorLogger.error('AI 응답 생성 실패', error);
            throw error;
        }
    }

    private async generateMockAIResponse(userMessage: string): Promise<string> {
        // 실제로는 고급 AI 엔진을 사용하여 응답 생성
        // 여기서는 간단한 시뮬레이션

        const responses = [
            '네, 말씀하신 내용에 대해 분석해보겠습니다. 추가적인 정보나 구체적인 질문이 있으시면 언제든 말씀해 주세요.',
            '흥미로운 관점이네요. 이 주제에 대해 더 자세히 알아보겠습니다.',
            '좋은 질문입니다. 관련된 여러 측면을 고려해보겠습니다.',
            '이 문제에 대해 체계적으로 접근해보겠습니다.',
            '말씀하신 내용을 바탕으로 구체적인 해결방안을 제시해드리겠습니다.'
        ];

        // 간단한 키워드 기반 응답 생성
        if (userMessage.includes('투자') || userMessage.includes('재건축')) {
            return '투자 및 재건축 관련 질문이군요. 이 분야는 신중한 접근이 필요합니다. 구체적인 상황과 조건을 알려주시면 더 정확한 조언을 드릴 수 있습니다.';
        }

        if (userMessage.includes('댓글') || userMessage.includes('작성')) {
            return '댓글 작성에 도움이 필요하시군요. 어떤 종류의 댓글을 작성하고 싶으신지, 그리고 어떤 톤앤매너를 원하시는지 알려주시면 적절한 내용을 제안해드리겠습니다.';
        }

        if (userMessage.includes('의견') || userMessage.includes('정리')) {
            return '의견 정리가 필요하시군요. 어떤 주제에 대한 의견을 정리하고 싶으신지, 그리고 어떤 형태로 정리하고 싶으신지 구체적으로 말씀해 주시면 도움을 드리겠습니다.';
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 파일 관리
    async uploadFile(sessionId: string, file: File): Promise<ProjectFile> {
        try {
            const formData = new FormData();
            formData.append(API_FORM_FIELD_FILE, file);

            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}${API_PERSISTENT_SESSION_UPLOAD_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    body: formData
                },
            );

            if (!response.ok) {
                throw new Error(`파일 업로드 실패: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                id: result.id || Date.now().toString(),
                name: file.name,
                type: this.getFileType(file.name),
                size: file.size,
                uploadedAt: new Date().toISOString(),
                url: result.url
            };
        } catch (error) {
            errorLogger.error('파일 업로드 실패', error);
            throw error;
        }
    }

    /**
     * 세션의 파일 수 계산
     * @param sessionId 세션 ID
     * @returns 파일 수
     */
    async getFileCount(sessionId: string): Promise<number> {
        try {
            // 방법 1: 세션 정보에서 파일 수 가져오기
            const sessionResponse = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}`,
                ),
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (sessionResponse.ok) {
                const session = await sessionResponse.json();
                // 메타데이터에 파일 수가 있으면 사용
                if (session.metadata?.fileCount !== undefined) {
                    return session.metadata.fileCount;
                }
                // 파일 목록이 있으면 길이 반환
                if (Array.isArray(session.files)) {
                    return session.files.length;
                }
            }

            // 방법 2: 파일 목록 API 호출 시도
            try {
                const filesResponse = await fetch(
                    joinApiHealthCheckUrl(
                        this.baseUrl,
                        `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}${API_PERSISTENT_SESSION_FILES_SEGMENT}`,
                    ),
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (filesResponse.ok) {
                    const files = await filesResponse.json();
                    if (Array.isArray(files)) {
                        return files.length;
                    }
                    if (files.files && Array.isArray(files.files)) {
                        return files.files.length;
                    }
                }
            } catch (e) {
                // 파일 목록 API가 없을 수 있음
                // 파일 목록 API를 사용할 수 없습니다 (선택적 기능)
            }

            // 방법 3: 로컬 스토리지에서 확인 (fallback)
            const storageKey = `session_${sessionId}_files`;
            const storedFiles = localStorage.getItem(storageKey);
            if (storedFiles) {
                try {
                    const files = JSON.parse(storedFiles);
                    if (Array.isArray(files)) {
                        return files.length;
                    }
                } catch (e) {
                    // 파싱 실패
                }
            }

            // 기본값: 0
            return 0;
        } catch (error) {
            errorLogger.error('파일 수 조회 실패', error);
            return 0;
        }
    }

    private getFileType(fileName: string): ProjectFile['type'] {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
            return 'document';
        }
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
            return 'image';
        }
        if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(extension || '')) {
            return 'code';
        }
        return 'other';
    }

    // 세션 관리
    async archiveSession(sessionId: string): Promise<boolean> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}${API_PERSISTENT_SESSION_ARCHIVE_SEGMENT}`,
                ),
                {
                    method: 'POST'
                },
            );

            return response.ok;
        } catch (error) {
            errorLogger.error('세션 아카이브 실패', error);
            return false;
        }
    }

    async deleteSession(sessionId: string): Promise<boolean> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(sessionId)}`,
                ),
                {
                    method: 'DELETE'
                },
            );

            return response.ok;
        } catch (error) {
            errorLogger.error('세션 삭제 실패', error);
            return false;
        }
    }

    // 프로젝트 업데이트
    async updateProject(projectId: string, updates: {
        name?: string;
        category?: string;
        description?: string;
        memoryType?: 'default' | 'project_exclusive';
    }): Promise<Project | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(projectId)}`,
                ),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: updates.name,
                        description: updates.description,
                        metadata: {
                            category: updates.category,
                            memoryType: updates.memoryType,
                            type: 'project'
                        }
                    })
                },
            );

            if (!response.ok) {
                throw new Error(`프로젝트 업데이트 실패: ${response.statusText}`);
            }

            const backendSession = await response.json();

            return {
                id: backendSession.id,
                name: backendSession.title,
                category: backendSession.metadata?.category || 'other',
                memoryType: backendSession.metadata?.memoryType || 'default',
                description: backendSession.description,
                createdAt: backendSession.created_at,
                fileCount: (backendSession.metadata?.fileCount as number) || 0,
                sessionCount: backendSession.total_messages || 0
            };
        } catch (error) {
            errorLogger.error('프로젝트 업데이트 실패', error);
            // 오프라인 모드: 로컬 스토리지 업데이트
            const projects = await this.getProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                const updatedProject = {
                    ...projects[projectIndex],
                    ...updates,
                };
                // 로컬 스토리지 업데이트는 projectService를 통해 처리
                return updatedProject;
            }
            return null;
        }
    }

    // 프로젝트 삭제
    async deleteProject(projectId: string): Promise<boolean> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(projectId)}`,
                ),
                {
                    method: 'DELETE'
                },
            );

            return response.ok;
        } catch (error) {
            errorLogger.error('프로젝트 삭제 실패', error);
            // 오프라인 모드에서는 true 반환 (로컬에서 처리)
            return true;
        }
    }

    // 프로젝트 보관
    async archiveProject(projectId: string): Promise<boolean> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}/${encodeURIComponent(projectId)}${API_PERSISTENT_SESSION_ARCHIVE_SEGMENT}`,
                ),
                {
                    method: 'POST'
                },
            );

            return response.ok;
        } catch (error) {
            errorLogger.error('프로젝트 보관 실패', error);
            // 오프라인 모드에서는 true 반환
            return true;
        }
    }

    // 통계
    async getSessionStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
        archivedSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
    }> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_PERSISTENT_SESSIONS_PATH}${API_PERSISTENT_SESSION_STATS_SEGMENT}`,
                ),
            );

            if (!response.ok) {
                throw new Error(`통계 조회 실패: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            errorLogger.error('통계 조회 실패', error);
            return {
                totalSessions: 0,
                activeSessions: 0,
                archivedSessions: 0,
                totalMessages: 0,
                averageMessagesPerSession: 0
            };
        }
    }
}

export default ChatGPTProjectService;
