import { Project, ProjectFile, Guideline, ProjectChat } from '../types/project';

class ProjectService {
    private readonly STORAGE_KEY = 'projects';

    // 초기 더미 프로젝트 생성
    private createSeedProjects(): Project[] {
        const now = new Date().toISOString();
        const base = {
            status: 'active' as const,
            priority: 'medium' as const,
            createdAt: now,
            updatedAt: now,
            messageCount: 0,
            files: [] as ProjectFile[],
            guidelines: [] as Guideline[],
            chats: [] as ProjectChat[],
            analytics: {
                totalMessages: 0,
                totalFiles: 0,
                totalGuidelines: 0,
                activeChats: 0,
                participants: 0,
                activityTrend: [],
                topTopics: [],
                sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 }
            },
            settings: {
                maxFileSize: 10,
                allowedFileTypes: [] as string[],
                autoBackup: true,
                notifications: true
            },
            archived: false,
            tags: [] as string[]
        };

        return [
            {
                id: 'project_gaepo_woosung',
                name: '개포우성',
                description: '개포우성 단지 종합 분석',
                ...base
            },
            {
                id: 'project_gaepo_7th',
                name: '개포우성7차',
                description: '개포우성7차 재개발 프로젝트',
                ...base
            },
            {
                id: 'project_woosamo_kakao',
                name: '우사모 카카오톡 분석',
                description: '우사모 카카오톡 대화 분석',
                ...base
            },
            {
                id: 'project_viral',
                name: '바이럴',
                description: '바이럴 콘텐츠 분석',
                ...base
            },
            {
                id: 'project_business_loan',
                name: '사업비 대여 차이 분석',
                description: '사업비 대여 차이점 분석',
                ...base
            },
            {
                id: 'project_daewoo_elevator',
                name: '대우 엘리베이터 설계 우위',
                description: '대우 엘리베이터 설계 분석',
                ...base
            },
            {
                id: 'project_counter_comments',
                name: '반격 댓글 작성',
                description: '반격 댓글 작성 도구',
                ...base
            },
            {
                id: 'project_rain_preparedness',
                name: '폭우 대비 비교',
                description: '폭우 대비 시스템 비교',
                ...base
            },
            {
                id: 'project_criticism_analysis',
                name: '극우적 비판 분석',
                description: '극우적 비판 분석',
                ...base
            },
            {
                id: 'project_real_name_room',
                name: '개포우성_실명방',
                description: '개포우성 실명방 분석',
                ...base
            },
            {
                id: 'project_real_estate_news',
                name: '부동산뉴스',
                description: '부동산 뉴스 분석',
                ...base
            },
            {
                id: 'project_wedding_diary',
                name: '웨딩다이어리',
                description: '웨딩 다이어리 프로젝트',
                ...base
            }
        ];
    }

    // 로컬 스토리지에 기본 프로젝트가 없으면 시드
    async seedProjectsIfEmpty(): Promise<Project[]> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const parsed: Project[] = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (_) {
                // 파싱 실패 시 아래에서 시드
            }
        }

        const seeds = this.createSeedProjects();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seeds));
        return seeds;
    }

    // 모든 프로젝트 로드
    async loadProjects(): Promise<Project[]> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return await this.seedProjectsIfEmpty();
            }
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed as Project[];
            return await this.seedProjectsIfEmpty();
        } catch (error) {
            console.error('프로젝트 로드 오류:', error);
            return await this.seedProjectsIfEmpty();
        }
    }

    // 새 프로젝트 생성
    async createProject(name: string, description?: string, instructions?: string): Promise<Project> {
        try {
            const projects = await this.loadProjects();

            const newProject: Project = {
                id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                description: description || `${name} 프로젝트`,
                status: 'active',
                priority: 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messageCount: 0,
                files: [],
                guidelines: instructions ? [{
                    id: `guideline_${Date.now()}`,
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

            // 파일 중복 체크
            const existingFile = project.files.find(f => f.name === file.name);
            if (existingFile) {
                // 기존 파일 업데이트
                const updatedFiles = project.files.map(f =>
                    f.id === existingFile.id ? { ...file, id: existingFile.id } : f
                );

                const updatedProject = {
                    ...project,
                    files: updatedFiles,
                    analytics: {
                        ...project.analytics,
                        totalFiles: project.analytics.totalFiles
                    }
                };

                await this.updateProject(projectId, updatedProject);
            } else {
                // 새 파일 추가
                const updatedProject = {
                    ...project,
                    files: [...project.files, file],
                    analytics: {
                        ...project.analytics,
                        totalFiles: project.analytics.totalFiles + 1
                    }
                };

                await this.updateProject(projectId, updatedProject);
            }

            return true;
        } catch (error) {
            console.error('파일 추가 오류:', error);
            return false;
        }
    }

    // 프로젝트에서 파일 삭제
    async removeFileFromProject(projectId: string, fileId: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const updatedProject = {
                ...project,
                files: project.files.filter(f => f.id !== fileId),
                analytics: {
                    ...project.analytics,
                    totalFiles: Math.max(0, project.analytics.totalFiles - 1)
                }
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('파일 삭제 오류:', error);
            return false;
        }
    }

    // 프로젝트에 지침 추가
    async addGuidelineToProject(projectId: string, guideline: string, title?: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const newGuideline: Guideline = {
                id: `guideline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: title || '새 지침',
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

    // 프로젝트에서 지침 삭제
    async removeGuidelineFromProject(projectId: string, guidelineId: string): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const updatedProject = {
                ...project,
                guidelines: project.guidelines.filter(g => g.id !== guidelineId),
                analytics: {
                    ...project.analytics,
                    totalGuidelines: Math.max(0, project.analytics.totalGuidelines - 1)
                }
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('지침 삭제 오류:', error);
            return false;
        }
    }

    // 프로젝트 지침 업데이트
    async updateGuideline(projectId: string, guidelineId: string, updates: Partial<Guideline>): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            if (!project) return false;

            const updatedGuidelines = project.guidelines.map(g =>
                g.id === guidelineId
                    ? { ...g, ...updates, updatedAt: new Date().toISOString() }
                    : g
            );

            const updatedProject = {
                ...project,
                guidelines: updatedGuidelines
            };

            await this.updateProject(projectId, updatedProject);
            return true;
        } catch (error) {
            console.error('지침 업데이트 오류:', error);
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

    // 지침 활성/비활성 토글
    async toggleGuidelineActive(projectId: string, guidelineId: string): Promise<Project | null> {
        try {
            const projects = await this.loadProjects();
            const idx = projects.findIndex(p => p.id === projectId);
            if (idx === -1) return null;
            const updatedGuidelines = projects[idx].guidelines.map(g =>
                g.id === guidelineId ? { ...g, isActive: !g.isActive, updatedAt: new Date().toISOString() } : g
            );
            projects[idx] = { ...projects[idx], guidelines: updatedGuidelines, updatedAt: new Date().toISOString() };
            await this.saveProjects(projects);
            return projects[idx];
        } catch (error) {
            console.error('지침 토글 오류:', error);
            return null;
        }
    }

    // 지침 삭제
    async deleteGuideline(projectId: string, guidelineId: string): Promise<Project | null> {
        try {
            const projects = await this.loadProjects();
            const idx = projects.findIndex(p => p.id === projectId);
            if (idx === -1) return null;
            const before = projects[idx].guidelines.length;
            const filtered = projects[idx].guidelines.filter(g => g.id !== guidelineId);
            if (filtered.length === before) return projects[idx];
            const updated = {
                ...projects[idx],
                guidelines: filtered,
                analytics: {
                    ...projects[idx].analytics,
                    totalGuidelines: Math.max(0, projects[idx].analytics.totalGuidelines - 1)
                },
                updatedAt: new Date().toISOString()
            };
            projects[idx] = updated;
            await this.saveProjects(projects);
            return updated;
        } catch (error) {
            console.error('지침 삭제 오류:', error);
            return null;
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
