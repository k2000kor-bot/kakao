import { Project, ProjectFile, Guideline } from '../types/project';

class ProjectService {
    private readonly STORAGE_KEY = 'projects';

    // 모든 프로젝트 로드
    async loadProjects(): Promise<Project[]> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            return [];
        } catch (error) {
            console.error('프로젝트 로드 오류:', error);
            return [];
        }
    }

    // 새 프로젝트 생성
    async createProject(name: string, instructions?: string): Promise<Project> {
        try {
            const projects = await this.loadProjects();

            const newProject: Project = {
                id: `project_${Date.now()}`,
                name,
                description: `${name} 프로젝트`,
                status: 'active',
                priority: 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messageCount: 0,
                files: [],
                guidelines: instructions ? [{
                    id: '1',
                    title: '프로젝트 지침',
                    content: instructions,
                    category: 'general' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true
                }] : [],
                chats: [],
                analytics: {
                    totalMessages: 0,
                    totalFiles: 0,
                    totalGuidelines: instructions ? 1 : 0,
                    activeChats: 0,
                    participants: 0,
                    activityTrend: [],
                    topTopics: [],
                    sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 }
                },
                settings: {
                    maxFileSize: 10,
                    allowedFileTypes: [],
                    autoBackup: true,
                    notifications: true
                },
                archived: false,
                tags: []
            };

            projects.unshift(newProject); // 새 프로젝트를 맨 앞에 추가
            await this.saveProjects(projects);

            return newProject;
        } catch (error) {
            console.error('프로젝트 생성 오류:', error);
            throw error;
        }
    }

    // 프로젝트 업데이트
    async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
        try {
            const projects = await this.loadProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);

            if (projectIndex === -1) {
                return null;
            }

            projects[projectIndex] = {
                ...projects[projectIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.saveProjects(projects);
            return projects[projectIndex];
        } catch (error) {
            console.error('프로젝트 업데이트 오류:', error);
            throw error;
        }
    }

    // 프로젝트 삭제
    async deleteProject(projectId: string): Promise<boolean> {
        try {
            const projects = await this.loadProjects();
            const filteredProjects = projects.filter(p => p.id !== projectId);

            if (filteredProjects.length === projects.length) {
                return false; // 프로젝트를 찾지 못함
            }

            await this.saveProjects(filteredProjects);
            return true;
        } catch (error) {
            console.error('프로젝트 삭제 오류:', error);
            throw error;
        }
    }

    // 프로젝트 ID로 조회
    async getProjectById(projectId: string): Promise<Project | null> {
        try {
            const projects = await this.loadProjects();
            return projects.find(p => p.id === projectId) || null;
        } catch (error) {
            console.error('프로젝트 조회 오류:', error);
            return null;
        }
    }

    // 프로젝트에 파일 추가
    async addFileToProject(projectId: string, file: ProjectFile): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const updatedProject = {
                ...project,
                files: [...project.files, file],
                analytics: {
                    ...project.analytics,
                    totalFiles: project.analytics.totalFiles + 1
                }
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('파일 추가 오류:', error);
            return false;
        }
    }

    // 프로젝트에 지침 추가
    async addGuidelineToProject(projectId: string, guideline: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const newGuideline: Guideline = {
                id: `guideline_${Date.now()}`,
                title: '새 지침',
                content: guideline,
                category: 'general' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };

            const updatedProject = {
                ...project,
                guidelines: [...project.guidelines, newGuideline],
                analytics: {
                    ...project.analytics,
                    totalGuidelines: project.analytics.totalGuidelines + 1
                }
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('지침 추가 오류:', error);
            return false;
        }
    }

    // 프로젝트 통계 업데이트
    async updateProjectStats(projectId: string, stats: Partial<Project['analytics']>): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const updatedProject = {
                ...project,
                analytics: {
                    ...project.analytics,
                    ...stats
                }
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('통계 업데이트 오류:', error);
            return false;
        }
    }

    // 프로젝트 검색
    async searchProjects(query: string): Promise<Project[]> {
        try {
            const projects = await this.loadProjects();
            const lowerQuery = query.toLowerCase();

            return projects.filter(project =>
                project.name.toLowerCase().includes(lowerQuery) ||
                project.description.toLowerCase().includes(lowerQuery) ||
                project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        } catch (error) {
            console.error('프로젝트 검색 오류:', error);
            return [];
        }
    }

    // 활성 프로젝트만 조회
    async getActiveProjects(): Promise<Project[]> {
        try {
            const projects = await this.loadProjects();
            return projects.filter(p => p.status === 'active' && !p.archived);
        } catch (error) {
            console.error('활성 프로젝트 조회 오류:', error);
            return [];
        }
    }

    // 프로젝트 아카이브
    async archiveProject(projectId: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            await this.updateProject(projectId, { archived: true });
            return true;
        } catch (error) {
            console.error('프로젝트 아카이브 오류:', error);
            return false;
        }
    }

    // 프로젝트 복원
    async restoreProject(projectId: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            await this.updateProject(projectId, { archived: false });
            return true;
        } catch (error) {
            console.error('프로젝트 복원 오류:', error);
            return false;
        }
    }

    // 로컬 스토리지에 프로젝트 저장
    private async saveProjects(projects: Project[]): Promise<void> {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('프로젝트 저장 오류:', error);
            throw error;
        }
    }
}

const projectService = new ProjectService();
export default projectService;
