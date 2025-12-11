import { Project, Chat, Message, ProjectFile, ProjectGuidelines } from '../types/project';
import { retryApiCall, RetryOptions } from '../utils/retryHandler';
import { errorLogger } from '../utils/errorLogger';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// 로컬 스토리지 키 (폴백용)
const PROJECTS_KEY = 'corbu_projects';
const CHATS_KEY = 'corbu_chats';
const MESSAGES_KEY = 'corbu_messages';

// 재시도 옵션 설정
const defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    retryable: (error: any) => {
        // 네트워크 오류 또는 5xx 서버 오류만 재시도
        if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
            return true;
        }
        // 5xx 서버 오류 재시도
        if (error?.status >= 500 && error?.status < 600) {
            return true;
        }
        // 408 Timeout 재시도
        if (error?.status === 408) {
            return true;
        }
        return false;
    },
};

// 백엔드 API 호출 헬퍼 (재시도 로직 포함)
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const fetchFunction = async (): Promise<T | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                const error: any = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            // 네트워크 오류인 경우 사용자 친화적 메시지 제공
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                errorLogger.warn('백엔드 서버에 연결할 수 없습니다. 로컬 스토리지를 사용합니다.', {
                    component: 'projectService',
                    action: 'apiRequest',
                    endpoint,
                });
            }
            
            throw error;
        }
    };

    try {
        const result = await retryApiCall(fetchFunction, defaultRetryOptions);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errorLogger.error(`API 요청 실패 (${endpoint})`, error instanceof Error ? error : new Error(errorMessage), {
            component: 'projectService',
            action: 'apiRequest',
            endpoint,
        });
        return null;
    }
}

// 프로젝트 관리
export const projectService = {
    // 프로젝트 목록 조회 (백엔드 API 우선, 실패 시 로컬 스토리지)
    async getProjects(): Promise<Project[]> {
        try {
            // 백엔드 API 시도
            const apiData = await apiRequest<{ projects: any[] }>('/api/projects');
            if (apiData?.projects) {
                // 백엔드 데이터를 프론트엔드 타입에 맞게 변환
                return apiData.projects.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                    files: [],
                    instructions: '',
                    tags: [],
                    isActive: true,
                    type: 'conversation' as const,
                    status: 'active' as const,
                    chats: [],
                }));
            }
        } catch (error) {
            errorLogger.warn('백엔드 API 호출 실패, 로컬 스토리지 사용', {
                component: 'projectService',
                action: 'getProjects',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 로컬 스토리지
        try {
            const projects = localStorage.getItem(PROJECTS_KEY);
            if (projects) {
                const parsed = JSON.parse(projects);
                return parsed.map((p: any) => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                }));
            }
        } catch (error) {
            errorLogger.error('프로젝트 목록 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getProjects',
            });
        }
        return [];
    },

    // 프로젝트 생성 (백엔드 API 우선)
    async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'chats'>): Promise<Project> {
        const fetchFunction = async (): Promise<Project | null> => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/projects`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: projectData.name,
                        description: projectData.description || '',
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.project) {
                        const apiProject = data.data.project;
                        const newProject: Project = {
                            id: apiProject.id,
                            name: apiProject.name,
                            description: apiProject.description || '',
                            createdAt: new Date(apiProject.createdAt),
                            updatedAt: new Date(apiProject.updatedAt),
                            files: projectData.files || [],
                            instructions: projectData.instructions || '',
                            tags: projectData.tags || [],
                            isActive: projectData.isActive ?? true,
                            type: projectData.type || 'conversation',
                            status: projectData.status || 'active',
                            chats: [],
                        };

                        // 로컬 스토리지에도 저장 (동기화)
                        const projects = await this.getProjects();
                        projects.push(newProject);
                        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

                        return newProject;
                    }
                } else {
                    const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    throw error;
                }
            } catch (error) {
                // 에러를 상위로 전파
                errorLogger.error('프로젝트 데이터 로드 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'projectService',
                    action: 'loadProjectData',
                });
                throw error;
            }
            return null;
        };

        try {
            const result = await retryApiCall(fetchFunction, defaultRetryOptions);
            if (result) {
                return result;
            }
        } catch (error) {
            errorLogger.warn('백엔드 API 호출 실패, 로컬 스토리지 사용', {
                component: 'projectService',
                action: 'getProjects',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 로컬 스토리지
        const newProject: Project = {
            ...projectData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            chats: [],
        };

        const projects = await this.getProjects();
        projects.push(newProject);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

        return newProject;
    },

    // 프로젝트 업데이트 (백엔드 API 우선)
    async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
        try {
            // 백엔드 API 시도
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: updates.name,
                    description: updates.description,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.project) {
                    const apiProject = data.data.project;
                    const updatedProject: Project = {
                        id: apiProject.id,
                        name: apiProject.name,
                        description: apiProject.description || '',
                        createdAt: new Date(apiProject.createdAt),
                        updatedAt: new Date(apiProject.updatedAt),
                        files: updates.files || [],
                        instructions: updates.instructions || '',
                        tags: updates.tags || [],
                        isActive: updates.isActive ?? true,
                        type: updates.type || 'conversation',
                        status: updates.status || 'active',
                        chats: updates.chats || [],
                    };

                    // 로컬 스토리지도 업데이트
                    const projects = await this.getProjects();
                    const projectIndex = projects.findIndex(p => p.id === projectId);
                    if (projectIndex !== -1) {
                        projects[projectIndex] = updatedProject;
                        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
                    }

                    return updatedProject;
                }
            }
        } catch (error) {
            errorLogger.warn('백엔드 API 호출 실패, 로컬 스토리지 사용', {
                component: 'projectService',
                action: 'getProjects',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 로컬 스토리지
        const projects = await this.getProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) return null;

        projects[projectIndex] = {
            ...projects[projectIndex],
            ...updates,
            updatedAt: new Date(),
        };

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return projects[projectIndex];
    },

    // 프로젝트 삭제 (백엔드 API 우선)
    async deleteProject(projectId: string): Promise<boolean> {
        try {
            // 백엔드 API 시도
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 로컬 스토리지에서도 삭제
                    const projects = await this.getProjects();
                    const filteredProjects = projects.filter(p => p.id !== projectId);
                    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));

                    // 관련 채팅과 메시지도 삭제
                    this.deleteProjectChats(projectId);

                    return true;
                }
            }
        } catch (error) {
            errorLogger.warn('백엔드 API 호출 실패, 로컬 스토리지 사용', {
                component: 'projectService',
                action: 'getProjects',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 로컬 스토리지
        const projects = await this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);

        if (filteredProjects.length === projects.length) return false;

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));

        // 관련 채팅과 메시지도 삭제
        this.deleteProjectChats(projectId);

        return true;
    },

    // 프로젝트 조회 (백엔드 API 우선)
    async getProject(projectId: string): Promise<Project | null> {
        try {
            // 백엔드 API 시도
            const apiData = await apiRequest<{ project: any }>(`/api/projects/${projectId}`);
            if (apiData?.project) {
                const apiProject = apiData.project;
                return {
                    id: apiProject.id,
                    name: apiProject.name,
                    description: apiProject.description || '',
                    createdAt: new Date(apiProject.createdAt),
                    updatedAt: new Date(apiProject.updatedAt),
                    files: [],
                    instructions: '',
                    tags: [],
                    isActive: true,
                    type: 'conversation' as const,
                    status: 'active' as const,
                    chats: [],
                };
            }
        } catch (error) {
            errorLogger.warn('백엔드 API 호출 실패, 로컬 스토리지 사용', {
                component: 'projectService',
                action: 'getProjects',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        // 폴백: 로컬 스토리지
        const projects = await this.getProjects();
        return projects.find(p => p.id === projectId) || null;
    },

    // 프로젝트의 채팅들 삭제
    deleteProjectChats(projectId: string): void {
        const chats = chatService.getAllChats();
        const projectChats = chats.filter(c => c.projectId === projectId);

        // 각 채팅의 메시지 삭제
        projectChats.forEach(chat => {
            messageService.deleteChatMessages(chat.id);
        });

        // 채팅 삭제
        const filteredChats = chats.filter(c => c.projectId !== projectId);
        localStorage.setItem(CHATS_KEY, JSON.stringify(filteredChats));
    },

    // 초기 프로젝트 시드 생성
    async seedProjectsIfEmpty(): Promise<void> {
        const projects = await this.getProjects();
        if (projects.length === 0) {
            await this.createProject({
                name: '샘플 프로젝트',
                description: '프로젝트 관리 시스템을 테스트하기 위한 샘플 프로젝트입니다.',
                status: 'active',
                priority: 'medium',
                tags: ['샘플', '테스트'],
                guidelines: '이 프로젝트는 시스템 테스트를 위한 것입니다.',
                files: [],
                messageCount: 0,
                instructions: '',
                isActive: true,
                type: 'conversation'
            });
        }
    }
};

// 채팅 관리
export const chatService = {
    // 프로젝트의 채팅 목록 조회
    getProjectChats(projectId: string): Chat[] {
        try {
            const chats = localStorage.getItem(CHATS_KEY);
            const allChats: Chat[] = chats ? JSON.parse(chats) : [];
            return allChats.filter(chat => chat.projectId === projectId);
        } catch (error) {
            errorLogger.error('채팅 목록 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getProjectChats',
                projectId,
            });
            return [];
        }
    },

    // 채팅 생성
    async createChat(projectId: string, title: string): Promise<Chat> {
        const newChat: Chat = {
            id: generateId(),
            projectId,
            name: title,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
        };

        const chats = this.getAllChats();
        chats.push(newChat);
        localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

        // 프로젝트의 채팅 목록 업데이트
        const project = await projectService.getProject(projectId);
        if (project) {
            if (!project.chats) project.chats = [];
            project.chats.push(newChat);
            await projectService.updateProject(projectId, { chats: project.chats });
        }

        return newChat;
    },

    // 채팅 업데이트
    updateChat(chatId: string, updates: Partial<Chat>): Chat | null {
        const chats = this.getAllChats();
        const chatIndex = chats.findIndex(c => c.id === chatId);

        if (chatIndex === -1) return null;

        chats[chatIndex] = {
            ...chats[chatIndex],
            ...updates,
            updatedAt: new Date()
        };

        localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
        return chats[chatIndex];
    },

    // 채팅 삭제
    deleteChat(chatId: string): boolean {
        const chats = this.getAllChats();
        const filteredChats = chats.filter(c => c.id !== chatId);

        if (filteredChats.length === chats.length) return false;

        localStorage.setItem(CHATS_KEY, JSON.stringify(filteredChats));

        // 관련 메시지도 삭제
        messageService.deleteChatMessages(chatId);

        return true;
    },

    // 채팅 조회
    getChat(chatId: string): Chat | null {
        const chats = this.getAllChats();
        return chats.find(c => c.id === chatId) || null;
    },

    // 모든 채팅 조회
    getAllChats(): Chat[] {
        try {
            const chats = localStorage.getItem(CHATS_KEY);
            return chats ? JSON.parse(chats) : [];
        } catch (error) {
            errorLogger.error('모든 채팅 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getAllChats',
            });
            return [];
        }
    },

    // 프로젝트의 채팅들 삭제
    deleteProjectChats(projectId: string): void {
        const chats = this.getAllChats();
        const projectChats = chats.filter(c => c.projectId === projectId);

        // 각 채팅의 메시지 삭제
        projectChats.forEach(chat => {
            messageService.deleteChatMessages(chat.id);
        });

        // 채팅 삭제
        const filteredChats = chats.filter(c => c.projectId !== projectId);
        localStorage.setItem(CHATS_KEY, JSON.stringify(filteredChats));
    }
};

// 메시지 관리
export const messageService = {
    // 채팅의 메시지 목록 조회
    getChatMessages(chatId: string): Message[] {
        try {
            const messages = localStorage.getItem(MESSAGES_KEY);
            const allMessages: Message[] = messages ? JSON.parse(messages) : [];
            return allMessages.filter(msg => msg.chatId === chatId);
        } catch (error) {
            errorLogger.error('메시지 목록 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getChatMessages',
                chatId,
            });
            return [];
        }
    },

    // 메시지 추가
    addMessage(chatId: string, content: string, role: 'user' | 'assistant', metadata?: any): Message {
        const newMessage: Message = {
            id: generateId(),
            chatId,
            content,
            role,
            timestamp: new Date(),
            metadata
        };

        const messages = this.getAllMessages();
        messages.push(newMessage);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

        // 채팅 업데이트
        const chat = chatService.getChat(chatId);
        if (chat) {
            chat.messages.push(newMessage);
            chat.updatedAt = new Date();
            chatService.updateChat(chatId, { messages: chat.messages, updatedAt: chat.updatedAt });
        }

        return newMessage;
    },

    // 메시지 업데이트
    updateMessage(messageId: string, updates: Partial<Message>): Message | null {
        const messages = this.getAllMessages();
        const messageIndex = messages.findIndex(m => m.id === messageId);

        if (messageIndex === -1) return null;

        messages[messageIndex] = {
            ...messages[messageIndex],
            ...updates
        };

        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        return messages[messageIndex];
    },

    // 메시지 삭제
    deleteMessage(messageId: string): boolean {
        const messages = this.getAllMessages();
        const filteredMessages = messages.filter(m => m.id !== messageId);

        if (filteredMessages.length === messages.length) return false;

        localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
        return true;
    },

    // 채팅의 모든 메시지 삭제
    deleteChatMessages(chatId: string): void {
        const messages = this.getAllMessages();
        const filteredMessages = messages.filter(m => m.chatId !== chatId);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
    },

    // 모든 메시지 조회
    getAllMessages(): Message[] {
        try {
            const messages = localStorage.getItem(MESSAGES_KEY);
            return messages ? JSON.parse(messages) : [];
        } catch (error) {
            errorLogger.error('모든 메시지 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getAllMessages',
            });
            return [];
        }
    }
};

// 시스템 관리용 추가 메서드들
export const systemService = {
    // 전체 시스템 통계
    async getSystemStats() {
        const projects = await projectService.getProjects();
        const allChats = chatService.getAllChats();
        const allMessages = messageService.getAllMessages();

        return {
            totalProjects: projects.length,
            totalChats: allChats.length,
            totalMessages: allMessages.length,
            activeProjects: projects.filter((p: Project) => p.status === 'active').length,
            archivedProjects: projects.filter((p: Project) => p.status === 'archived').length,
            completedProjects: projects.filter((p: Project) => p.status === 'completed').length
        };
    },

    // 프로젝트 검색 및 필터링
    async searchProjects(query: string, filters: any = {}) {
        let projects = await projectService.getProjects();

        // 검색어 필터링
        if (query) {
            projects = projects.filter((project: Project) =>
                project.name.toLowerCase().includes(query.toLowerCase()) ||
                project.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        // 상태 필터링
        if (filters.status && filters.status !== 'all') {
            projects = projects.filter((project: Project) => project.status === filters.status);
        }

        // 정렬
        if (filters.sortBy) {
            projects.sort((a: Project, b: Project) => {
                let comparison = 0;
                switch (filters.sortBy) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'createdAt':
                        comparison = a.createdAt.getTime() - b.createdAt.getTime();
                        break;
                    case 'updatedAt':
                        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
                        break;
                    case 'messageCount':
                        comparison = (a.messageCount || 0) - (b.messageCount || 0);
                        break;
                }
                return filters.sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return projects;
    },

    // 일괄 작업
    bulkUpdateProjects: (projectIds: string[], updates: Partial<Project>) => {
        projectIds.forEach(id => {
            projectService.updateProject(id, updates);
        });
    },

    // 시스템 백업
    exportSystemData: () => {
        const data = {
            projects: projectService.getProjects(),
            chats: chatService.getAllChats(),
            messages: messageService.getAllMessages(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corbu-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // 시스템 복원
    importSystemData: (data: any) => {
        try {
            // 기존 데이터 백업
            const backup = {
                projects: projectService.getProjects(),
                chats: chatService.getAllChats(),
                messages: messageService.getAllMessages()
            };

            // 새 데이터로 교체
            if (data.projects) {
                localStorage.setItem('projects', JSON.stringify(data.projects));
            }
            if (data.chats) {
                localStorage.setItem('chats', JSON.stringify(data.chats));
            }
            if (data.messages) {
                localStorage.setItem('messages', JSON.stringify(data.messages));
            }

            return { success: true, backup };
        } catch (error) {
            errorLogger.error('시스템 데이터 복원 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'restoreSystemData',
            });
            return { success: false, error };
        }
    }
};

// 유틸리티 함수
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 프로젝트 통계 계산
export const getProjectStats = async (projectId: string) => {
    const project = await projectService.getProject(projectId);
    if (!project) return null;

    const chats = chatService.getProjectChats(projectId);
    const allMessages = messageService.getAllMessages();
    const projectMessages = allMessages.filter(msg =>
        chats.some(chat => chat.id === msg.chatId)
    );

    const totalChats = chats.length;
    const totalMessages = projectMessages.length;
    const averageResponseTime = projectMessages.length > 0
        ? projectMessages
            .filter(msg => msg.role === 'assistant' && msg.metadata?.responseTime)
            .reduce((sum, msg) => sum + (msg.metadata?.responseTime || 0), 0) /
        projectMessages.filter(msg => msg.role === 'assistant').length
        : 0;

    // 가장 활발한 날 계산
    const messageDates = projectMessages.map(msg =>
        new Date(msg.timestamp).toDateString()
    );
    const dateCounts = messageDates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostActiveDay = Object.entries(dateCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
        totalChats,
        totalMessages,
        averageResponseTime,
        mostActiveDay,
        topKeywords: [] // 키워드 분석은 별도 구현 필요
    };
};
