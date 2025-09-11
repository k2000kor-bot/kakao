import { Project, Chat, Message, ProjectFile, ProjectGuidelines } from '../types/project';

// 로컬 스토리지 키
const PROJECTS_KEY = 'corbu_projects';
const CHATS_KEY = 'corbu_chats';
const MESSAGES_KEY = 'corbu_messages';

// 프로젝트 관리
export const projectService = {
    // 프로젝트 목록 조회
    getProjects(): Project[] {
        try {
            const projects = localStorage.getItem(PROJECTS_KEY);
            return projects ? JSON.parse(projects) : [];
        } catch (error) {
            console.error('프로젝트 목록 조회 실패:', error);
            return [];
        }
    },

    // 프로젝트 생성
    createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'chats'>): Project {
        const newProject: Project = {
            ...projectData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            chats: []
        };

        const projects = this.getProjects();
        projects.push(newProject);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

        return newProject;
    },

    // 프로젝트 업데이트
    updateProject(projectId: string, updates: Partial<Project>): Project | null {
        const projects = this.getProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) return null;

        projects[projectIndex] = {
            ...projects[projectIndex],
            ...updates,
            updatedAt: new Date()
        };

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return projects[projectIndex];
    },

    // 프로젝트 삭제
    deleteProject(projectId: string): boolean {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);

        if (filteredProjects.length === projects.length) return false;

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));

        // 관련 채팅과 메시지도 삭제
        this.deleteProjectChats(projectId);

        return true;
    },

    // 프로젝트 조회
    getProject(projectId: string): Project | null {
        const projects = this.getProjects();
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
    seedProjectsIfEmpty(): void {
        const projects = this.getProjects();
        if (projects.length === 0) {
            const seedProjects: Project[] = [
                {
                    id: generateId(),
                    name: '샘플 프로젝트',
                    description: '프로젝트 관리 시스템을 테스트하기 위한 샘플 프로젝트입니다.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active',
                    priority: 'medium',
                    tags: ['샘플', '테스트'],
                    guidelines: '이 프로젝트는 시스템 테스트를 위한 것입니다.',
                    files: [],
                    chats: [],
                    messageCount: 0,
                    instructions: '',
                    isActive: true,
                    type: 'conversation'
                }
            ];
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(seedProjects));
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
            console.error('채팅 목록 조회 실패:', error);
            return [];
        }
    },

    // 채팅 생성
    createChat(projectId: string, title: string): Chat {
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
        const project = projectService.getProject(projectId);
        if (project) {
            if (!project.chats) project.chats = [];
            project.chats.push(newChat);
            projectService.updateProject(projectId, { chats: project.chats });
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
            console.error('모든 채팅 조회 실패:', error);
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
            console.error('메시지 목록 조회 실패:', error);
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
            console.error('모든 메시지 조회 실패:', error);
            return [];
        }
    }
};

// 시스템 관리용 추가 메서드들
export const systemService = {
    // 전체 시스템 통계
    getSystemStats: () => {
        const projects = projectService.getProjects();
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
    searchProjects: (query: string, filters: any = {}) => {
        let projects = projectService.getProjects();

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
            console.error('시스템 데이터 복원 실패:', error);
            return { success: false, error };
        }
    }
};

// 유틸리티 함수
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 프로젝트 통계 계산
export const getProjectStats = (projectId: string) => {
    const project = projectService.getProject(projectId);
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
