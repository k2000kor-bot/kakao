import { Project, ProjectFile, Chat, Message } from '../types/project';
import { retryApiCall, RetryOptions } from '../utils/retryHandler';
import { errorLogger } from '../utils/errorLogger';
import { notifyProjectsChanged } from '../utils/projectEvents';
import {
    API_BASE_URL,
    API_FORM_FIELD_FILE,
    API_PROJECT_FILES_SEGMENT,
    API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT,
    API_PROJECT_NOTEBOOK_SOURCES_FROM_FILE_SEGMENT,
    API_PROJECT_NOTEBOOK_SOURCES_FROM_URL_SEGMENT,
    API_PROJECT_NOTEBOOK_SOURCES_FROM_YOUTUBE_SEARCH_SEGMENT,
    API_PROJECT_NOTEBOOK_SOURCES_SEGMENT,
    API_PROJECT_NOTEBOOK_STUDIO_GENERATE_SEGMENT,
    API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT,
    API_PROJECT_NOTEBOOK_SUGGESTED_QUESTIONS_SEGMENT,
    API_PROJECTS_LIST_PATH,
    joinApiHealthCheckUrl,
} from '../config/api';
import {
    coerceTrimmedString,
    isAssistantGenerationPlaceholder,
    STORED_ASSISTANT_INCOMPLETE_NOTICE,
} from '../utils/chatInputUtils';
import {
    PROJECTS_STORAGE_KEY,
    SYSTEM_IMPORT_CHATS_STORAGE_KEY,
    SYSTEM_IMPORT_MESSAGES_STORAGE_KEY,
} from './projectStorageKeys';

function sanitizeCorbuStoredMessages(messages: Message[]): Message[] {
    return messages.map((m) => {
        if (
            m.role === 'assistant' &&
            typeof m.content === 'string' &&
            isAssistantGenerationPlaceholder(m.content)
        ) {
            return { ...m, content: STORED_ASSISTANT_INCOMPLETE_NOTICE };
        }
        return m;
    });
}

/** 백엔드 API 프로젝트 응답 항목 */
interface ProjectApiItem {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    source_count?: number;
}

// 로컬 스토리지 키 (폴백용)
const PROJECTS_KEY = 'corbu_projects';
const CHATS_KEY = 'corbu_chats';
const MESSAGES_KEY = 'corbu_messages';

// 재시도 옵션: 연결 거부(Failed to fetch)는 재시도하지 않음(백엔드 미실행 시 로그 스팸 방지)
const defaultRetryOptions: RetryOptions = {
    maxRetries: 1,
    initialDelay: 500,
    retryable: (error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return false;
        const err = error as { status?: number };
        if (typeof err?.status === 'number' && err.status >= 500 && err.status < 600) return true;
        if (err?.status === 408) return true;
        return false;
    },
};

// 백엔드 미연결 시 세션당 한 번만 경고 (콘솔 스팸 방지, 진행이 멈춘 것처럼 보이지 않도록)
let lastBackendUnreachableWarn = 0;
const BACKEND_UNREACHABLE_WARN_MS = 120000; // 2분에 한 번만

function shouldWarnBackendUnreachable(): boolean {
    const now = Date.now();
    if (now - lastBackendUnreachableWarn < BACKEND_UNREACHABLE_WARN_MS) return false;
    lastBackendUnreachableWarn = now;
    return true;
}

function isConnectionRefused(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes('Failed to fetch') || msg.includes('NetworkError');
}

// 백엔드 API 호출 헬퍼 (재시도 로직 포함)
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const fetchFunction = async (): Promise<T | null> => {
        try {
            const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, endpoint), {
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
                const err = new Error(errorMessage) as Error & { status: number };
                err.status = response.status;
                throw err;
            }

            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            if (isConnectionRefused(error) && shouldWarnBackendUnreachable()) {
                errorLogger.warn('백엔드 서버에 연결할 수 없습니다. 로컬 스토리지를 사용합니다. (백엔드 실행: npm run restart:backend)', {
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
        // 연결 거부는 이미 warn 했으므로 error 로그 생략 (콘솔 스팸·진행 불가 느낌 방지)
        if (isConnectionRefused(error)) {
            return null;
        }
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
            // apiRequest는 data.data를 반환하므로 배열을 직접 받음
            const apiData = await apiRequest<ProjectApiItem[]>(API_PROJECTS_LIST_PATH);
            if (apiData && Array.isArray(apiData) && apiData.length >= 0) {
                // 백엔드 데이터를 프론트엔드 타입에 맞게 변환
                return apiData.map((p: ProjectApiItem) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                    files: [],
                    webSources: [],
                    instructions: '',
                    tags: [],
                    isActive: true,
                    type: 'conversation' as const,
                    status: 'active' as const,
                    chats: [],
                    source_count: typeof p.source_count === 'number' ? p.source_count : undefined,
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
                const parsed = JSON.parse(projects) as Array<{ createdAt: string; updatedAt: string; [key: string]: unknown }>;
                return parsed.map((p) => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                })) as Project[];
            }
        } catch (error) {
            errorLogger.error('프로젝트 목록 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getProjects',
            });
        }
        return [];
    },

    // 프로젝트 생성 (백엔드 API 우선). initialGuidelines 사용 시 노트북 LLM에 학습됨.
    async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'chats'> & { initialGuidelines?: string[] }): Promise<Project> {
        const fetchFunction = async (): Promise<Project | null> => {
            try {
                const initialGuidelines = projectData.initialGuidelines ?? [];
                const response = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_PROJECTS_LIST_PATH), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: projectData.name,
                        description: projectData.description || '',
                        tags: projectData.tags || [],
                        initial_guidelines: initialGuidelines,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const raw = data.data?.project ?? data.data;
                    if (data.success && raw) {
                        const apiProject = raw;
                        const newProject: Project = {
                            id: apiProject.id,
                            name: apiProject.name,
                            description: apiProject.description || '',
                            createdAt: new Date(apiProject.createdAt),
                            updatedAt: new Date(apiProject.updatedAt),
                            files: projectData.files || [],
                            webSources: projectData.webSources || [],
                            instructions: projectData.instructions || '',
                            tags: projectData.tags || [],
                            isActive: projectData.isActive ?? true,
                            type: projectData.type || 'conversation',
                            status: projectData.status || 'active',
                            chats: [],
                            source_count: (projectData.files?.length || 0) + (projectData.webSources?.length || 0),
                        };

                        // 로컬 스토리지에도 저장 (동기화)
                        const projects = await this.getProjects();
                        projects.push(newProject);
                        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
                        notifyProjectsChanged();
                        return newProject;
                    }
                } else {
                    const err = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & { status: number };
                    err.status = response.status;
                    throw err;
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
        notifyProjectsChanged();
        return newProject;
    },

    // 프로젝트 업데이트 (백엔드 API 우선). tags·initialGuidelines 전송 시 노트북 LLM 컨텍스트도 갱신됨.
    async updateProject(
        projectId: string,
        updates: Partial<Project> & { initialGuidelines?: string[] }
    ): Promise<Project | null> {
        try {
            const body: Record<string, unknown> = {};
            if (updates.name !== undefined) body.name = updates.name;
            if (updates.description !== undefined) body.description = updates.description;
            if (updates.tags !== undefined) body.tags = updates.tags;
            if (updates.initialGuidelines !== undefined) body.initial_guidelines = updates.initialGuidelines;
            if (updates.instructions !== undefined) body.instructions = updates.instructions;
            if (updates.source_count !== undefined) body.source_count = updates.source_count;
            if (updates.files !== undefined) body.files = updates.files.map((f) => ({
                ...f,
                uploadedAt: f.uploadedAt instanceof Date ? f.uploadedAt.toISOString() : f.uploadedAt,
            }));
            if (updates.webSources !== undefined) {
                body.web_sources = updates.webSources.map((s) => ({
                    ...s,
                    addedAt: s.addedAt instanceof Date ? s.addedAt.toISOString() : s.addedAt,
                }));
            }

            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
                ),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                },
            );

            if (response.ok) {
                const data = await response.json();
                const raw = data.data?.project ?? data.data;
                if (data.success && raw) {
                    const apiProject = raw;
                    const updatedProject: Project = {
                        id: apiProject.id,
                        name: apiProject.name,
                        description: apiProject.description || '',
                        createdAt: new Date(apiProject.createdAt),
                        updatedAt: new Date(apiProject.updatedAt),
                        files: updates.files ?? (apiProject.files || []),
                        webSources: updates.webSources ?? (apiProject.web_sources || apiProject.webSources || []),
                        instructions: updates.instructions ?? (apiProject.instructions || ''),
                        tags: updates.tags ?? (apiProject.tags || []),
                        isActive: updates.isActive ?? apiProject.isActive ?? true,
                        type: (updates.type || apiProject.type || 'conversation') as Project['type'],
                        status: (updates.status || apiProject.status || 'active') as Project['status'],
                        chats: updates.chats ?? (apiProject.chats || []),
                        source_count: typeof updates.source_count === 'number'
                            ? updates.source_count
                            : ((updates.files?.length ?? apiProject.files?.length ?? 0) + (updates.webSources?.length ?? apiProject.web_sources?.length ?? apiProject.webSources?.length ?? 0)),
                    };

                    // 로컬 스토리지도 업데이트
                    const projects = await this.getProjects();
                    const projectIndex = projects.findIndex(p => p.id === projectId);
                    if (projectIndex !== -1) {
                        projects[projectIndex] = updatedProject;
                        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
                        notifyProjectsChanged();
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
        notifyProjectsChanged();
        return projects[projectIndex];
    },

    // 프로젝트 삭제 (백엔드 API 우선)
    async deleteProject(projectId: string): Promise<boolean> {
        try {
            // 백엔드 API 시도
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
                ),
                {
                    method: 'DELETE',
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 로컬 스토리지에서도 삭제
                    const projects = await this.getProjects();
                    const filteredProjects = projects.filter(p => p.id !== projectId);
                    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));

                    // 관련 대화와 메시지도 삭제
                    this.deleteProjectChats(projectId);
                    // 정관·클라이언트 파일처리 데이터 정리
                    this.cleanupProjectLocalData(projectId);

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

        // 관련 대화와 메시지도 삭제
        this.deleteProjectChats(projectId);
        this.cleanupProjectLocalData(projectId);

        return true;
    },

    /** 프로젝트 관련 로컬 데이터 정리 (정관·clientFileProcessor·파일스토리지 등) */
    cleanupProjectLocalData(projectId: string): void {
        try {
            const { associationBylawsService } = require('./associationBylawsService');
            associationBylawsService.removeBylaws?.(projectId);
        } catch { /* optional */ }
        try {
            const { clientFileProcessor } = require('./clientFileProcessor');
            clientFileProcessor.clearProjectData?.(projectId);
        } catch { /* optional */ }
        try {
            const FileStorageService = require('./fileStorageService').default;
            FileStorageService.getInstance?.()?.removeProjectFiles?.(projectId);
        } catch { /* optional */ }
    },

    // 프로젝트 조회 (백엔드 API 우선). 응답에 initial_guidelines 포함 시 그대로 반환.
    async getProject(projectId: string): Promise<Project | null> {
        try {
            const apiProject = await apiRequest<Record<string, unknown>>(
                `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
            );
            if (apiProject?.id) {
                return {
                    id: apiProject.id as string,
                    name: (apiProject.name as string) || '',
                    description: (apiProject.description as string) || '',
                    createdAt: new Date((apiProject.createdAt as string) || Date.now()),
                    updatedAt: new Date((apiProject.updatedAt as string) || Date.now()),
                    files: (apiProject.files as Project['files']) || [],
                    webSources: ((apiProject.web_sources as Project['webSources']) || (apiProject.webSources as Project['webSources']) || []),
                    instructions: (apiProject.instructions as string) || '',
                    tags: Array.isArray(apiProject.tags) ? (apiProject.tags as string[]) : [],
                    initialGuidelines: Array.isArray(apiProject.initial_guidelines)
                        ? (apiProject.initial_guidelines as string[])
                        : undefined,
                    isActive: apiProject.isActive !== false,
                    type: (apiProject.type as Project['type']) || 'conversation',
                    status: (apiProject.status as Project['status']) || 'active',
                    chats: Array.isArray(apiProject.chats) ? apiProject.chats : [],
                    source_count: typeof apiProject.source_count === 'number'
                        ? (apiProject.source_count as number)
                        : (((apiProject.files as Project['files'])?.length || 0) + ((((apiProject.web_sources as Project['webSources']) || (apiProject.webSources as Project['webSources']))?.length) || 0)),
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

    /** 프로젝트 참고 파일 업로드 (POST /api/projects/{id}/files). 성공 시 파일 메타데이터 반환, 실패 시 null. */
    async uploadProjectFile(projectId: string, file: File): Promise<ProjectFile | null> {
        try {
            const form = new FormData();
            form.append(API_FORM_FIELD_FILE, file);
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_FILES_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    body: form,
                },
            );
            const json = await response.json();
            if (response.ok && json?.success && json?.data?.file) {
                const f = json.data.file as { id: string; name: string; type: string; size: number; uploadedAt: string };
                return {
                    id: f.id,
                    name: f.name,
                    type: f.type as ProjectFile['type'],
                    size: f.size,
                    uploadedAt: new Date(f.uploadedAt || Date.now()),
                };
            }
            return null;
        } catch (err) {
            errorLogger.warn(
                '프로젝트 파일 업로드 실패',
                { component: 'projectService', action: 'uploadProjectFile', projectId, fileName: file.name }
            );
            return null;
        }
    },

    /** 노트북 컨텍스트·소스 목록 조회 */
    async getNotebookContext(projectId: string): Promise<{
        context: string;
        has_context: boolean;
        source_count: number;
        sources?: Array<{ id: string; type: string; title: string; enabled?: boolean }>;
    } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT}`,
                ),
            );
            const json = await response.json();
            if (json?.success && json?.data) {
                return json.data;
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '노트북 컨텍스트 조회 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'getNotebookContext', projectId }
            );
            return null;
        }
    },

    /** 노트북 소스 삭제 (프로젝트 개요 제외) */
    async deleteNotebookSource(
        projectId: string,
        sourceId: string
    ): Promise<{ source_count: number } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SOURCES_SEGMENT}/${encodeURIComponent(sourceId)}`,
                ),
                { method: 'DELETE' },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return { source_count: data.data.source_count ?? 0 };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '노트북 소스 삭제 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'deleteNotebookSource', projectId, sourceId }
            );
            return null;
        }
    },

    /** 노트북 소스 추가 (Google NotebookLM '소스 추가' 스타일) */
    async addNotebookSource(
        projectId: string,
        params: { title: string; content: string; type?: string }
    ): Promise<{ source: { id: string; title: string; type: string }; source_count: number } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SOURCES_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: params.title,
                        content: params.content,
                        type: params.type || 'text',
                    }),
                },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return {
                    source: data.data.source,
                    source_count: data.data.source_count ?? 0,
                };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '노트북 소스 추가 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'addNotebookSource', projectId }
            );
            return null;
        }
    },

    /** 노트북 스튜디오 출력 생성 (Google NotebookLM 스타일: 보고서/학습가이드/퀴즈/요약 등) */
    async generateNotebookStudioOutput(
        projectId: string,
        type: 'report' | 'study_guide' | 'quiz' | 'summary' | 'flashcards' |
              'video_overview' | 'mindmap' | 'infographic' | 'slides' | 'data_table'
    ): Promise<{ type: string; content: string; id?: string; created_at?: string } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_STUDIO_GENERATE_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type }),
                },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return {
                    type: data.data.type,
                    content: data.data.content ?? '',
                    id: data.data.id,
                    created_at: data.data.created_at,
                };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '노트북 스튜디오 생성 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'generateNotebookStudioOutput', projectId, type }
            );
            return null;
        }
    },

    /** 노트북 스튜디오 생성 이력 목록 조회 */
    async getNotebookStudioOutputs(
        projectId: string
    ): Promise<{ outputs: Array<{ id: string; type: string; content: string; created_at: string }>; count: number } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT}`,
                ),
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return { outputs: data.data.outputs ?? [], count: data.data.count ?? 0 };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '스튜디오 출력 목록 조회 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'getNotebookStudioOutputs', projectId }
            );
            return null;
        }
    },

    /** 노트북 스튜디오 생성 이력 항목 삭제 */
    async deleteNotebookStudioOutput(
        projectId: string,
        outputId: string
    ): Promise<boolean> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT}/${encodeURIComponent(outputId)}`,
                ),
                { method: 'DELETE' },
            );
            const data = await response.json();
            return data?.success === true;
        } catch (err) {
            errorLogger.error(
                '스튜디오 출력 삭제 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'deleteNotebookStudioOutput', projectId, outputId }
            );
            return false;
        }
    },

    /** 소스 기반 추천 질문 조회 (대화 웰컴용) */
    async getNotebookSuggestedQuestions(
        projectId: string
    ): Promise<string[] | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SUGGESTED_QUESTIONS_SEGMENT}`,
                ),
            );
            const data = await response.json();
            if (data?.success && data?.data?.questions) {
                return data.data.questions;
            }
            return [];
        } catch (err) {
            errorLogger.error(
                '추천 질문 조회 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'getNotebookSuggestedQuestions', projectId }
            );
            return null;
        }
    },

    /** URL에서 소스 추가 */
    async addNotebookSourceFromUrl(
        projectId: string,
        url: string
    ): Promise<{ source: { id: string; title: string; type: string }; source_count: number } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SOURCES_FROM_URL_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: coerceTrimmedString(url, '') }),
                },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return {
                    source: data.data.source,
                    source_count: data.data.source_count ?? 0,
                };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                'URL 소스 추가 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'addNotebookSourceFromUrl', projectId }
            );
            return null;
        }
    },

    /** 특정인/주제 YouTube 검색 후 자막 수집·노트북 소스 추가 (딥러닝·학습용) */
    async addNotebookSourcesFromYoutubeSearch(
        projectId: string,
        params: { query: string; maxVideos?: number; addFirstAsVoiceSource?: boolean }
    ): Promise<{
        added_count: number;
        sources: Array<{ id: string; title: string; type: string }>;
        source_count: number;
        first_video_added_as_voice: boolean;
    } | null> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SOURCES_FROM_YOUTUBE_SEARCH_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: coerceTrimmedString(params.query || '', ''),
                        max_videos: Math.min(Math.max(params.maxVideos ?? 5, 1), 15),
                        add_first_as_voice_source: Boolean(params.addFirstAsVoiceSource),
                    }),
                },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return {
                    added_count: data.data.added_count ?? 0,
                    sources: data.data.sources ?? [],
                    source_count: data.data.source_count ?? 0,
                    first_video_added_as_voice: Boolean(data.data.first_video_added_as_voice),
                };
            }
            if (response.status >= 400) {
                const msg = typeof data?.detail === 'string' ? data.detail : (data?.detail as { message?: string } | undefined)?.message;
                throw new Error(msg || 'YouTube 검색·소스 추가 요청 실패');
            }
            return null;
        } catch (err) {
            errorLogger.error(
                'YouTube 검색·소스 추가 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'addNotebookSourcesFromYoutubeSearch', projectId }
            );
            throw err;
        }
    },

    /** 파일 업로드로 소스 추가 (PDF/TXT) */
    async addNotebookSourceFromFile(
        projectId: string,
        file: File
    ): Promise<{ source: { id: string; title: string; type: string }; source_count: number } | null> {
        try {
            const form = new FormData();
            form.append(API_FORM_FIELD_FILE, file);
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_NOTEBOOK_SOURCES_FROM_FILE_SEGMENT}`,
                ),
                { method: 'POST', body: form },
            );
            const data = await response.json();
            if (data?.success && data?.data) {
                return {
                    source: data.data.source,
                    source_count: data.data.source_count ?? 0,
                };
            }
            return null;
        } catch (err) {
            errorLogger.error(
                '파일 소스 추가 실패',
                err instanceof Error ? err : new Error(String(err)),
                { component: 'projectService', action: 'addNotebookSourceFromFile', projectId }
            );
            return null;
        }
    },

    // 프로젝트의 대화들 삭제
    deleteProjectChats(projectId: string): void {
        const chats = chatService.getAllChats();
        const projectChats = chats.filter(c => c.projectId === projectId);

        // 각 대화의 메시지 삭제
        projectChats.forEach(chat => {
            messageService.deleteChatMessages(chat.id);
        });

        // 대화 삭제
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

// 대화 관리
export const chatService = {
    // 프로젝트의 대화 목록 조회
    getProjectChats(projectId: string): Chat[] {
        try {
            const chats = localStorage.getItem(CHATS_KEY);
            const allChats: Chat[] = chats ? JSON.parse(chats) : [];
            return allChats.filter(chat => chat.projectId === projectId);
        } catch (error) {
            errorLogger.error('대화 목록 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getProjectChats',
                projectId,
            });
            return [];
        }
    },

    // 대화 생성
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

        // 프로젝트의 대화 목록 업데이트
        const project = await projectService.getProject(projectId);
        if (project) {
            if (!project.chats) project.chats = [];
            project.chats.push(newChat);
            await projectService.updateProject(projectId, { chats: project.chats });
        }

        return newChat;
    },

    // 대화 업데이트
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

    // 대화 삭제
    deleteChat(chatId: string): boolean {
        const chats = this.getAllChats();
        const filteredChats = chats.filter(c => c.id !== chatId);

        if (filteredChats.length === chats.length) return false;

        localStorage.setItem(CHATS_KEY, JSON.stringify(filteredChats));

        // 관련 메시지도 삭제
        messageService.deleteChatMessages(chatId);

        return true;
    },

    // 대화 조회
    getChat(chatId: string): Chat | null {
        const chats = this.getAllChats();
        return chats.find(c => c.id === chatId) || null;
    },

    // 모든 대화 조회
    getAllChats(): Chat[] {
        try {
            const chats = localStorage.getItem(CHATS_KEY);
            return chats ? JSON.parse(chats) : [];
        } catch (error) {
            errorLogger.error('모든 대화 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'projectService',
                action: 'getAllChats',
            });
            return [];
        }
    },

    // 프로젝트의 대화들 삭제
    deleteProjectChats(projectId: string): void {
        const chats = this.getAllChats();
        const projectChats = chats.filter(c => c.projectId === projectId);

        // 각 대화의 메시지 삭제
        projectChats.forEach(chat => {
            messageService.deleteChatMessages(chat.id);
        });

        // 대화 삭제
        const filteredChats = chats.filter(c => c.projectId !== projectId);
        localStorage.setItem(CHATS_KEY, JSON.stringify(filteredChats));
    }
};

// 메시지 관리
export const messageService = {
    // 대화의 메시지 목록 조회
    getChatMessages(chatId: string): Message[] {
        try {
            return this.getAllMessages().filter((msg) => msg.chatId === chatId);
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
    addMessage(chatId: string, content: string, role: 'user' | 'assistant', metadata?: Message['metadata']): Message {
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

        // 대화 업데이트
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

    // 대화의 모든 메시지 삭제
    deleteChatMessages(chatId: string): void {
        const messages = this.getAllMessages();
        const filteredMessages = messages.filter(m => m.chatId !== chatId);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
    },

    // 모든 메시지 조회
    getAllMessages(): Message[] {
        try {
            const messages = localStorage.getItem(MESSAGES_KEY);
            const parsed: Message[] = messages ? JSON.parse(messages) : [];
            return sanitizeCorbuStoredMessages(parsed);
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
    async searchProjects(query: string, filters: { status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}) {
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
                return (filters.sortOrder ?? 'asc') === 'asc' ? comparison : -comparison;
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
    importSystemData: (data: { projects?: unknown; chats?: unknown; messages?: unknown }) => {
        try {
            // 기존 데이터 백업
            const backup = {
                projects: projectService.getProjects(),
                chats: chatService.getAllChats(),
                messages: messageService.getAllMessages()
            };

            // 새 데이터로 교체
            if (data.projects) {
                localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data.projects));
            }
            if (data.chats) {
                localStorage.setItem(SYSTEM_IMPORT_CHATS_STORAGE_KEY, JSON.stringify(data.chats));
            }
            if (data.messages) {
                localStorage.setItem(SYSTEM_IMPORT_MESSAGES_STORAGE_KEY, JSON.stringify(data.messages));
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

export {
    PROJECTS_STORAGE_KEY,
    SYSTEM_IMPORT_CHATS_STORAGE_KEY,
    SYSTEM_IMPORT_MESSAGES_STORAGE_KEY,
} from './projectStorageKeys';

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
