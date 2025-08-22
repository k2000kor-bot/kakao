import { Project, ProjectFile as BaseProjectFile, Guideline as BaseGuideline } from '../types/project';
import { ChatSession, Message } from '../types/chat';

// 프로젝트 하위 구조 타입 정의
export interface ProjectStructure {
    project: Project;
    subChats: ChatSession[];
    files: ProjectFile[];
    guidelines: ProjectGuideline[];
}

export interface ProjectFile extends BaseProjectFile {
    uploadDate: Date;
    lastAccessed: Date;
    associatedChatId?: string;
}

export interface ProjectGuideline extends BaseGuideline {
    createdDate: Date;
    lastUpdated: Date;
    associatedChatId?: string;
}

class ProjectChatStructureService {
    private static instance: ProjectChatStructureService;

    constructor() { }

    public static getInstance(): ProjectChatStructureService {
        if (!ProjectChatStructureService.instance) {
            ProjectChatStructureService.instance = new ProjectChatStructureService();
        }
        return ProjectChatStructureService.instance;
    }

    // Date를 ISO string으로 변환하는 헬퍼 함수
    private toISOString(date: Date): string {
        return date.toISOString();
    }

    // 채팅 제목 생성
    private generateChatTitle(userMessage: string): string {
        return userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
    }

    // 채팅 세션 저장
    private saveChatSession(chat: ChatSession): void {
        const chats = this.getChatSessions();
        chats.push(chat);
        localStorage.setItem('chatSessions', JSON.stringify(chats));
    }

    // 채팅 세션 목록 조회
    private getChatSessions(): ChatSession[] {
        const stored = localStorage.getItem('chatSessions');
        return stored ? JSON.parse(stored) : [];
    }

    // 첫 화면에서 입력 시작 시 자동 채팅 생성
    public createInitialChat(userMessage: string): ChatSession {
        const now = new Date();
        const newChat: ChatSession = {
            id: `chat_${Date.now()}`,
            title: this.generateChatTitle(userMessage),
            messages: [
                {
                    id: `msg_${Date.now()}`,
                    content: userMessage,
                    sender: 'user',
                    isUser: true,
                    timestamp: this.toISOString(now),
                    metadata: {
                        processingTime: 0,
                        confidence: 0.8,
                        model: 'standard',
                        tokens: 0,
                        usedServices: ['chat'],
                        quality: 'standard',
                        responseLength: 'medium'
                    }
                }
            ],
            createdAt: this.toISOString(now),
            updatedAt: this.toISOString(now),
            projectId: undefined, // 프로젝트 없이 독립적인 채팅
            isActive: true,
            messageCount: 1,
            participants: [],
            tags: [],
            type: 'general'
        };

        // 로컬 스토리지에 저장
        this.saveChatSession(newChat);
        return newChat;
    }

    // 프로젝트 생성
    public createProject(projectName: string, description?: string): Project {
        const now = new Date();
        const newProject: Project = {
            id: `project_${Date.now()}`,
            name: projectName,
            description: description || '',
            status: 'active',
            priority: 'medium',
            createdAt: now,
            updatedAt: now,
            messageCount: 0,
            files: [],
            guidelines: '',
            chats: [],
            tags: []
        };

        // 프로젝트 저장 (임시로 주석 처리)
        // projectService.createProject(newProject);
        return newProject;
    }
}

export const projectChatStructureService = new ProjectChatStructureService();

// 임시로 analytics 부분을 제거하고 나중에 다시 추가
/*
            analytics: {
                totalMessages: 0,
                totalFiles: 0,
                totalGuidelines: 0,
                activeChats: 0,
                participants: 0,
                activityTrend: [],
                topTopics: [],
                sentimentAnalysis: {
                    positive: 0,
                    neutral: 0,
                    negative: 0
                },
                completionRate: 0,
                lastActivity: this.toISOString(now)
            },
            settings: {
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedFileTypes: ['pdf', 'doc', 'txt', 'jpg', 'png'],
                autoBackup: true,
                notifications: true,
                theme: 'light',
                language: 'ko',
                aiModel: 'gpt-4',
                autoSave: true,
                collaboration: false,
                privacy: 'private'
            },
            archived: false,
            tags: []
        };

        // 로컬 스토리지에 저장
        this.saveProject(newProject);
        return newProject;
    }

    // 프로젝트에 파일 추가 및 하위 채팅 생성
    public addFileToProject(projectId: string, file: ProjectFile): { file: ProjectFile; chat: ChatSession } {
        const project = this.getProject(projectId);
        if (!project) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
        }

        const now = new Date();
        // 파일 저장 - BaseProjectFile 형식으로 변환
        const baseFile: BaseProjectFile = {
            id: `file_${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size || 0,
            uploadedAt: now,
            status: 'uploaded',
            description: file.description,
            tags: file.tags || []
        };

        if (!project.files) project.files = [];
        project.files.push(baseFile);
        this.saveProject(project);

        // 파일 관련 하위 채팅 생성
        const fileChat: ChatSession = {
            id: `chat_file_${Date.now()}`,
            title: `📄 ${file.name} 관련 채팅`,
            messages: [
                {
                    id: `msg_${Date.now()}`,
                    content: `파일 "${file.name}"이 프로젝트에 추가되었습니다. 이 파일에 대해 질문하거나 작업을 진행할 수 있습니다.`,
                    sender: 'system',
                    isUser: false,
                    timestamp: this.toISOString(now),
                    metadata: {
                        processingTime: 0,
                        confidence: 0.8,
                        model: 'standard',
                        tokens: 0,
                        usedServices: ['chat'],
                        quality: 'standard',
                        responseLength: 'medium'
                    }
                }
            ],
            createdAt: this.toISOString(now),
            updatedAt: this.toISOString(now),
            projectId: projectId,
            isActive: true,
            parentChatId: undefined,
            type: 'file_chat',
            messageCount: 1,
            participants: [],
            tags: []
        };

        // 파일과 채팅 연결
        const savedFile = { ...file, id: baseFile.id, associatedChatId: fileChat.id };
        this.saveProject(project);
        this.saveChatSession(fileChat);

        return { file: savedFile, chat: fileChat };
    }

    // 프로젝트에 지침 추가 및 하위 채팅 생성
    public addGuidelineToProject(projectId: string, guideline: ProjectGuideline): { guideline: ProjectGuideline; chat: ChatSession } {
        const project = this.getProject(projectId);
        if (!project) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
        }

        const now = new Date();
        // 지침 저장 - BaseGuideline 형식으로 변환
        const baseGuideline: BaseGuideline = {
            id: `guideline_${Date.now()}`,
            title: guideline.title,
            content: guideline.content,
            category: 'general',
            createdAt: this.toISOString(now),
            updatedAt: this.toISOString(now),
            isActive: true
        };

        if (!project.guidelines) project.guidelines = '';
        // guidelines는 string이므로 push 대신 다른 방식으로 처리
        project.guidelines = project.guidelines + '\n' + baseGuideline.content;
        this.saveProject(project);

        // 지침 관련 하위 채팅 생성
        const guidelineChat: ChatSession = {
            id: `chat_guideline_${Date.now()}`,
            title: `📋 ${guideline.title} 관련 채팅`,
            messages: [
                {
                    id: `msg_${Date.now()}`,
                    content: `지침 "${guideline.title}"이 프로젝트에 추가되었습니다. 이 지침에 대해 질문하거나 수정할 수 있습니다.`,
                    sender: 'system',
                    isUser: false,
                    timestamp: this.toISOString(now),
                    metadata: {
                        processingTime: 0,
                        confidence: 0.8,
                        model: 'standard',
                        tokens: 0,
                        usedServices: ['chat'],
                        quality: 'standard',
                        responseLength: 'medium'
                    }
                }
            ],
            createdAt: this.toISOString(now),
            updatedAt: this.toISOString(now),
            projectId: projectId,
            isActive: true,
            parentChatId: undefined,
            type: 'guideline_chat',
            messageCount: 1,
            participants: [],
            tags: []
        };

        // 지침과 채팅 연결
        const savedGuideline = { ...guideline, id: baseGuideline.id, associatedChatId: guidelineChat.id };
        this.saveProject(project);
        this.saveChatSession(guidelineChat);

        return { guideline: savedGuideline, chat: guidelineChat };
    }

    // 프로젝트 구조 가져오기
    public getProjectStructure(projectId: string): ProjectStructure | null {
        const project = this.getProject(projectId);
        if (!project) return null;

        const subChats = this.getChatSessionsByProject(projectId);

        // BaseProjectFile을 ProjectFile로 변환
        const files: ProjectFile[] = (project.files || []).map(baseFile => ({
            ...baseFile,
            uploadDate: new Date(baseFile.uploadedAt),
            lastAccessed: new Date(baseFile.uploadedAt),
            associatedChatId: undefined
        }));

        // BaseGuideline을 ProjectGuideline로 변환
        const guidelines: ProjectGuideline[] = Array.isArray(project.guidelines)
            ? project.guidelines.map((baseGuideline: any) => ({
                ...baseGuideline,
                createdDate: new Date(baseGuideline.createdAt),
                lastUpdated: new Date(baseGuideline.updatedAt),
                associatedChatId: undefined
            }))
            : [];

        return {
            project,
            subChats,
            files,
            guidelines
        };
    }

    // 프로젝트별 하위 채팅 목록 가져오기
    public getChatSessionsByProject(projectId: string): ChatSession[] {
        try {
            const stored = localStorage.getItem('corbu_chat_sessions');
            if (!stored) return [];

            const allChats: ChatSession[] = JSON.parse(stored);
            return allChats.filter(chat => chat.projectId === projectId);
        } catch (error) {
            console.error('프로젝트 채팅 세션 로드 실패:', error);
            return [];
        }
    }

    // 채팅 제목 생성
    private generateChatTitle(message: string): string {
        const maxLength = 30;
        if (message.length <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength) + '...';
    }

    // 프로젝트 저장
    private saveProject(project: Project): void {
        try {
            const stored = localStorage.getItem('projects');
            const projects: Project[] = stored ? JSON.parse(stored) : [];

            const existingIndex = projects.findIndex(p => p.id === project.id);
            if (existingIndex >= 0) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            localStorage.setItem('projects', JSON.stringify(projects));
        } catch (error) {
            console.error('프로젝트 저장 실패:', error);
        }
    }

    // 프로젝트 가져오기
    private getProject(projectId: string): Project | null {
        try {
            const stored = localStorage.getItem('projects');
            if (!stored) return null;

            const projects: Project[] = JSON.parse(stored);
            return projects.find(p => p.id === projectId) || null;
        } catch (error) {
            console.error('프로젝트 로드 실패:', error);
            return null;
        }
    }

    // 채팅 세션 저장
    private saveChatSession(chat: ChatSession): void {
        try {
            const stored = localStorage.getItem('corbu_chat_sessions');
            const chats: ChatSession[] = stored ? JSON.parse(stored) : [];

            const existingIndex = chats.findIndex(c => c.id === chat.id);
            if (existingIndex >= 0) {
                chats[existingIndex] = chat;
            } else {
                chats.push(chat);
            }

            localStorage.setItem('corbu_chat_sessions', JSON.stringify(chats));
        } catch (error) {
            console.error('채팅 세션 저장 실패:', error);
        }
    }

    // 모든 프로젝트 구조 가져오기
    public getAllProjectStructures(): ProjectStructure[] {
        try {
            const stored = localStorage.getItem('projects');
            if (!stored) return [];

            const projects: Project[] = JSON.parse(stored);
            return projects.map(project => this.getProjectStructure(project.id)).filter(Boolean) as ProjectStructure[];
        } catch (error) {
            console.error('프로젝트 구조 로드 실패:', error);
            return [];
        }
    }

    // 독립적인 채팅 세션 가져오기 (프로젝트 없는 채팅)
    public getIndependentChatSessions(): ChatSession[] {
        try {
            const stored = localStorage.getItem('corbu_chat_sessions');
            if (!stored) return [];

            const allChats: ChatSession[] = JSON.parse(stored);
            return allChats.filter(chat => !chat.projectId);
        } catch (error) {
            console.error('독립 채팅 세션 로드 실패:', error);
            return [];
        }
    }

    // 프로젝트 업데이트
    public updateProject(updatedProject: Project): void {
        try {
            const now = new Date();
            const projectToUpdate = {
                ...updatedProject,
                updatedAt: now
            };

            this.saveProject(projectToUpdate);
            console.log('프로젝트 업데이트 완료:', projectToUpdate.name);
        } catch (error) {
            console.error('프로젝트 업데이트 실패:', error);
            throw error;
        }
    }

    // 프로젝트 삭제
    public deleteProject(projectId: string): boolean {
        try {
            const stored = localStorage.getItem('projects');
            if (!stored) return false;

            const projects: Project[] = JSON.parse(stored);
            const filteredProjects = projects.filter(p => p.id !== projectId);

            localStorage.setItem('projects', JSON.stringify(filteredProjects));

            // 관련 채팅 세션도 삭제
            const chatStored = localStorage.getItem('corbu_chat_sessions');
            if (chatStored) {
                const chats: ChatSession[] = JSON.parse(chatStored);
                const filteredChats = chats.filter(c => c.projectId !== projectId);
                localStorage.setItem('corbu_chat_sessions', JSON.stringify(filteredChats));
            }

            console.log('프로젝트 삭제 완료:', projectId);
            return true;
        } catch (error) {
            console.error('프로젝트 삭제 실패:', error);
            return false;
        }
    }
}

export default ProjectChatStructureService;
