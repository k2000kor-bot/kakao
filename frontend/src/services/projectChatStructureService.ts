import { Project, ProjectFile as BaseProjectFile, Guideline as BaseGuideline } from '../types/project';
import { ChatSession } from '../types/chat';
import { conversationListTitleFromUserMessage } from '../utils/chatInputUtils';
import { errorLogger, toError } from '../utils/errorLogger';
import { CHAT_SESSIONS_STORAGE_KEY } from './chatSessionStorageKeys';
import {
  PROJECTS_STORAGE_KEY,
  PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY,
} from './projectStorageKeys';

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

export class ProjectChatStructureService {
    private static instance: ProjectChatStructureService;

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

    // 대화 제목 생성 (명시 제목 라벨 우선, 없으면 30자 축약)
    private generateChatTitle(userMessage: string): string {
        return conversationListTitleFromUserMessage(userMessage);
    }

    // 대화 세션 저장
    private saveChatSession(chat: ChatSession): void {
        const chats = this.getChatSessions();
        chats.push(chat);
        localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify(chats));
    }

    // 대화 세션 목록 조회
    private getChatSessions(): ChatSession[] {
        const stored = localStorage.getItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // 첫 화면에서 입력 시작 시 자동 대화 생성
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
            projectId: undefined, // 프로젝트 없이 독립적인 대화
            isActive: true,
            messageCount: 1,
            participants: [],
            tags: [],
            type: 'general',
            status: 'active',
            lastActivity: this.toISOString(now),
            totalMessages: 1,
            isPersistent: true
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
            tags: [],
            instructions: '',
            isActive: true,
            type: 'conversation'
        };

        // 프로젝트 저장 (임시로 주석 처리)
        // projectService.createProject(newProject);
        return newProject;
    }

    // 프로젝트에 파일 추가 및 하위 대화 생성
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

        // 파일 관련 하위 대화 생성
        const fileChat: ChatSession = {
            id: `chat_file_${Date.now()}`,
            title: `📄 ${file.name} 관련 대화`,
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
            tags: [],
            status: 'active',
            lastActivity: this.toISOString(now),
            totalMessages: 1,
            isPersistent: true
        };

        // 파일과 대화 연결
        const savedFile = { ...file, id: baseFile.id, associatedChatId: fileChat.id };
        this.saveProject(project);
        this.saveChatSession(fileChat);

        return { file: savedFile, chat: fileChat };
    }

    // 프로젝트에 지침 추가 및 하위 대화 생성
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
            priority: 'medium',
            createdAt: now,
            updatedAt: now,
            isActive: true
        };

        if (!project.guidelines) project.guidelines = '';
        // guidelines는 string이므로 push 대신 다른 방식으로 처리
        project.guidelines = project.guidelines + '\n' + baseGuideline.content;
        this.saveProject(project);

        // 지침 관련 하위 대화 생성
        const guidelineChat: ChatSession = {
            id: `chat_guideline_${Date.now()}`,
            title: `📋 ${guideline.title} 관련 대화`,
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
            tags: [],
            status: 'active',
            lastActivity: this.toISOString(now),
            totalMessages: 1,
            isPersistent: true
        };

        // 지침과 대화 연결
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
            ? project.guidelines.map((baseGuideline: BaseGuideline) => ({
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

    // 프로젝트별 하위 대화 목록 가져오기
    public getChatSessionsByProject(projectId: string): ChatSession[] {
        try {
            const stored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
            if (!stored) return [];

            const allChats: ChatSession[] = JSON.parse(stored);
            return allChats.filter(chat => chat.projectId === projectId);
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 대화 세션 로드 실패', err, {
                component: 'projectChatStructureService',
                action: 'getChatSessions',
                projectId,
            });
            return [];
        }
    }


    // 프로젝트 저장
    private saveProject(project: Project): void {
        try {
            const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
            const projects: Project[] = stored ? JSON.parse(stored) : [];

            const existingIndex = projects.findIndex(p => p.id === project.id);
            if (existingIndex >= 0) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 저장 실패', err, {
                component: 'projectChatStructureService',
                action: 'saveProject',
                projectId: project.id,
            });
        }
    }

    // 프로젝트 가져오기
    private getProject(projectId: string): Project | null {
        try {
            const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!stored) return null;

            const projects: Project[] = JSON.parse(stored);
            return projects.find(p => p.id === projectId) || null;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 로드 실패', err, {
                component: 'projectChatStructureService',
                action: 'getProject',
                projectId,
            });
            return null;
        }
    }


    // 모든 프로젝트 구조 가져오기
    public getAllProjectStructures(): ProjectStructure[] {
        try {
            const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!stored) return [];

            const projects: Project[] = JSON.parse(stored);
            return projects.map(project => this.getProjectStructure(project.id)).filter(Boolean) as ProjectStructure[];
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 구조 로드 실패', err, {
                component: 'projectChatStructureService',
                action: 'getAllProjectStructures',
            });
            return [];
        }
    }

    // 독립적인 대화 세션 가져오기 (프로젝트 없는 대화)
    public getIndependentChatSessions(): ChatSession[] {
        try {
            const stored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
            if (!stored) return [];

            const allChats: ChatSession[] = JSON.parse(stored);
            return allChats.filter(chat => !chat.projectId);
        } catch (error) {
            const err = toError(error);
            errorLogger.error('독립 대화 세션 로드 실패', err, {
                component: 'projectChatStructureService',
                action: 'getIndependentChatSessions',
            });
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
            errorLogger.info('프로젝트 업데이트 완료', {
                component: 'projectChatStructureService',
                action: 'updateProject',
                projectId: projectToUpdate.id,
                projectName: projectToUpdate.name,
            });
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 업데이트 실패', err, {
                component: 'projectChatStructureService',
                action: 'updateProject',
                projectId: updatedProject.id,
            });
            throw err;
        }
    }

    // 프로젝트 삭제
    public deleteProject(projectId: string): boolean {
        try {
            const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!stored) return false;

            const projects: Project[] = JSON.parse(stored);
            const filteredProjects = projects.filter(p => p.id !== projectId);

            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filteredProjects));

            // 관련 대화 세션도 삭제
            const chatStored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
            if (chatStored) {
                const chats: ChatSession[] = JSON.parse(chatStored);
                const filteredChats = chats.filter(c => c.projectId !== projectId);
                localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(filteredChats));
            }

            errorLogger.info('프로젝트 삭제 완료', {
                component: 'projectChatStructureService',
                action: 'deleteProject',
                projectId,
            });
            return true;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 삭제 실패', err, {
                component: 'projectChatStructureService',
                action: 'deleteProject',
                projectId,
            });
            return false;
        }
    }
}

export {
  PROJECTS_STORAGE_KEY,
  PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY,
} from './projectStorageKeys';

export default ProjectChatStructureService;
