import { Project } from '../types/project';
import { ChatSession } from '../types/chat';
import projectService from './projectService';
import chatSessionService from './chatSessionService';

// 사이드 메뉴 데이터 타입 정의
export interface SideMenuData {
    projects: Project[];
    chatSessions: ChatSession[];
    recentFiles: FileItem[];
    templates: TemplateItem[];
    workflows: WorkflowItem[];
    statistics: StatisticsData;
}

export interface FileItem {
    id: string;
    name: string;
    type: 'document' | 'image' | 'video' | 'audio' | 'other';
    size: number;
    uploadDate: Date;
    lastAccessed: Date;
    projectId?: string;
}

export interface TemplateItem {
    id: string;
    name: string;
    category: string;
    description: string;
    usageCount: number;
    lastUsed: Date;
    isFavorite: boolean;
}

export interface WorkflowItem {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'running' | 'error';
    lastRun: Date;
    nextRun: Date;
    steps: number;
    completionRate: number;
}

export interface StatisticsData {
    totalProjects: number;
    totalSessions: number;
    totalMessages: number;
    totalFiles: number;
    activeWorkflows: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'error';
}

class SideMenuDataService {
    private static instance: SideMenuDataService;
    private data: SideMenuData;

    private constructor() {
        this.data = this.initializeData();
    }

    public static getInstance(): SideMenuDataService {
        if (!SideMenuDataService.instance) {
            SideMenuDataService.instance = new SideMenuDataService();
        }
        return SideMenuDataService.instance;
    }

    private initializeData(): SideMenuData {
        return {
            projects: this.loadProjects(),
            chatSessions: this.loadChatSessions(),
            recentFiles: this.loadRecentFiles(),
            templates: this.loadTemplates(),
            workflows: this.loadWorkflows(),
            statistics: this.loadStatistics()
        };
    }

    private loadProjects(): Project[] {
        try {
            const stored = localStorage.getItem('projects');
            if (!stored) {
                // 시드 생성
                projectService.seedProjectsIfEmpty();
            }
            const parsed = localStorage.getItem('projects');
            return parsed ? (JSON.parse(parsed) as Project[]) : [];
        } catch (error) {
            console.error('프로젝트 데이터 로드 실패:', error);
            return [];
        }
    }

    private loadChatSessions(): ChatSession[] {
        try {
            const stored = localStorage.getItem('corbu_chat_sessions');
            return stored ? (JSON.parse(stored) as ChatSession[]) : [];
        } catch (error) {
            console.error('채팅 세션 데이터 로드 실패:', error);
            return [];
        }
    }

    private loadRecentFiles(): FileItem[] {
        const stored = localStorage.getItem('corbu_ai_recent_files');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('최근 파일 데이터 로드 실패:', error);
            }
        }

        // 기본 최근 파일 데이터
        return [
            {
                id: 'file_1',
                name: '프로젝트_제안서.pdf',
                type: 'document',
                size: 2048576,
                uploadDate: new Date('2024-08-15'),
                lastAccessed: new Date(),
                projectId: '1'
            },
            {
                id: 'file_2',
                name: '시스템_아키텍처.png',
                type: 'image',
                size: 512000,
                uploadDate: new Date('2024-08-14'),
                lastAccessed: new Date(),
                projectId: '2'
            },
            {
                id: 'file_3',
                name: '분석_결과.xlsx',
                type: 'document',
                size: 1024000,
                uploadDate: new Date('2024-08-13'),
                lastAccessed: new Date(),
                projectId: '3'
            },
            {
                id: 'file_4',
                name: '회의_녹음.mp3',
                type: 'audio',
                size: 15360000,
                uploadDate: new Date('2024-08-12'),
                lastAccessed: new Date(),
                projectId: '1'
            }
        ];
    }

    private loadTemplates(): TemplateItem[] {
        const stored = localStorage.getItem('corbu_ai_templates');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('템플릿 데이터 로드 실패:', error);
            }
        }

        // 기본 템플릿 데이터
        return [
            {
                id: 'template_1',
                name: '프로젝트 제안서',
                category: '비즈니스',
                description: '프로젝트 제안서 작성 템플릿',
                usageCount: 15,
                lastUsed: new Date('2024-08-14'),
                isFavorite: true
            },
            {
                id: 'template_2',
                name: '회의록',
                category: '업무',
                description: '회의록 작성 템플릿',
                usageCount: 28,
                lastUsed: new Date('2024-08-15'),
                isFavorite: true
            },
            {
                id: 'template_3',
                name: '분석 보고서',
                category: '분석',
                description: '데이터 분석 보고서 템플릿',
                usageCount: 12,
                lastUsed: new Date('2024-08-13'),
                isFavorite: false
            },
            {
                id: 'template_4',
                name: '이메일 답변',
                category: '커뮤니케이션',
                description: '전문적인 이메일 답변 템플릿',
                usageCount: 34,
                lastUsed: new Date('2024-08-15'),
                isFavorite: true
            }
        ];
    }

    private loadWorkflows(): WorkflowItem[] {
        const stored = localStorage.getItem('corbu_ai_workflows');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('워크플로우 데이터 로드 실패:', error);
            }
        }

        // 기본 워크플로우 데이터
        return [
            {
                id: 'workflow_1',
                name: '문서 자동 분석',
                description: '업로드된 문서를 자동으로 분석하는 워크플로우',
                status: 'active',
                lastRun: new Date('2024-08-15 10:30:00'),
                nextRun: new Date('2024-08-16 10:30:00'),
                steps: 5,
                completionRate: 100
            },
            {
                id: 'workflow_2',
                name: '데이터 백업',
                description: '일일 데이터 백업 워크플로우',
                status: 'running',
                lastRun: new Date('2024-08-15 02:00:00'),
                nextRun: new Date('2024-08-16 02:00:00'),
                steps: 3,
                completionRate: 75
            },
            {
                id: 'workflow_3',
                name: '성능 모니터링',
                description: '시스템 성능 실시간 모니터링',
                status: 'active',
                lastRun: new Date('2024-08-15 15:45:00'),
                nextRun: new Date('2024-08-15 16:00:00'),
                steps: 4,
                completionRate: 100
            }
        ];
    }

    private loadStatistics(): StatisticsData {
        const stored = localStorage.getItem('corbu_ai_statistics');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('통계 데이터 로드 실패:', error);
            }
        }

        // 기본 통계 데이터
        return {
            totalProjects: 3,
            totalSessions: 15,
            totalMessages: 1247,
            totalFiles: 23,
            activeWorkflows: 2,
            systemHealth: 'excellent'
        };
    }

    // 데이터 업데이트 메서드들
    public updateProjects(projects: Project[]): void {
        this.data.projects = projects;
        localStorage.setItem('corbu_ai_projects', JSON.stringify(projects));
    }

    public updateChatSessions(sessions: ChatSession[]): void {
        this.data.chatSessions = sessions;
        localStorage.setItem('corbu_ai_chat_sessions', JSON.stringify(sessions));
    }

    public updateRecentFiles(files: FileItem[]): void {
        this.data.recentFiles = files;
        localStorage.setItem('corbu_ai_recent_files', JSON.stringify(files));
    }

    public updateTemplates(templates: TemplateItem[]): void {
        this.data.templates = templates;
        localStorage.setItem('corbu_ai_templates', JSON.stringify(templates));
    }

    public updateWorkflows(workflows: WorkflowItem[]): void {
        this.data.workflows = workflows;
        localStorage.setItem('corbu_ai_workflows', JSON.stringify(workflows));
    }

    public updateStatistics(statistics: StatisticsData): void {
        this.data.statistics = statistics;
        localStorage.setItem('corbu_ai_statistics', JSON.stringify(statistics));
    }

    // 데이터 조회 메서드들
    public getProjects(): Project[] {
        return this.data.projects;
    }

    public getChatSessions(): ChatSession[] {
        return this.data.chatSessions;
    }

    public getRecentFiles(): FileItem[] {
        return this.data.recentFiles;
    }

    public getTemplates(): TemplateItem[] {
        return this.data.templates;
    }

    public getWorkflows(): WorkflowItem[] {
        return this.data.workflows;
    }

    public getStatistics(): StatisticsData {
        return this.data.statistics;
    }

    // 전체 데이터 조회
    public getAllData(): SideMenuData {
        return this.data;
    }

    // 데이터 새로고침
    public refreshData(): void {
        this.data = this.initializeData();
    }

    // 파일 크기 포맷팅
    public formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 날짜 포맷팅
    public formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return '오늘';
        if (days === 1) return '어제';
        if (days < 7) return `${days}일 전`;
        if (days < 30) return `${Math.floor(days / 7)}주 전`;
        return date.toLocaleDateString();
    }
}

export default SideMenuDataService;
