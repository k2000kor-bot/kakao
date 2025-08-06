// 미디어 지식 시스템 API 서비스
const MEDIA_KNOWLEDGE_API_BASE = 'http://localhost:8005';

export interface ProjectCreate {
    name: string;
    description?: string;
    category?: string;
}

export interface MediaUploadResponse {
    file_id: string;
    project_id: string;
    filename: string;
    file_size: number;
    mime_type: string;
    upload_date: string;
}

export interface FileAnalysis {
    analysis_id: string;
    knowledge_id: string;
    extracted_text: string;
    keywords: string[];
    summary: string;
    confidence_score: number;
}

export interface MediaFile {
    id: string;
    project_id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    upload_date: string;
    summary: string;
    confidence_score: number;
}

export interface KnowledgeEntry {
    id: string;
    project_id: string;
    content: string;
    source_file_id: string;
    knowledge_type: string;
    tags: string[];
    created_at: string;
    source_filename: string;
}

export interface PopupCreate {
    popup_type: string;
    title: string;
    content: string;
    position_x?: number;
    position_y?: number;
}

export interface Popup {
    id: string;
    project_id: string;
    popup_type: string;
    title: string;
    content: string;
    position_x: number;
    position_y: number;
    is_active: boolean;
    created_at: string;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${MEDIA_KNOWLEDGE_API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
};

// 파일 업로드 헬퍼 함수
const uploadFile = async (endpoint: string, formData: FormData) => {
    try {
        const response = await fetch(`${MEDIA_KNOWLEDGE_API_BASE}${endpoint}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        throw error;
    }
};

// 미디어 지식 시스템 API 클래스
export class MediaKnowledgeAPI {
    // 시스템 상태 확인
    static async getStatus() {
        return apiCall('/api/status');
    }

    // 프로젝트 생성
    static async createProject(project: ProjectCreate): Promise<{ success: boolean; project_id: string; message: string }> {
        return apiCall('/api/projects', {
            method: 'POST',
            body: JSON.stringify(project),
        });
    }

    // 미디어 파일 업로드
    static async uploadMediaFile(file: File, projectId: string): Promise<{ success: boolean; upload_result: MediaUploadResponse }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);

        return uploadFile('/api/upload-media', formData);
    }

    // 파일 분석
    static async analyzeFile(fileId: string): Promise<{ success: boolean; analysis_result: FileAnalysis }> {
        return apiCall(`/api/analyze-file/${fileId}`, {
            method: 'POST',
        });
    }

    // 프로젝트 파일 목록 조회
    static async getProjectFiles(projectId: string): Promise<{ success: boolean; files: MediaFile[] }> {
        return apiCall(`/api/projects/${projectId}/files`);
    }

    // 프로젝트 지식 베이스 조회
    static async getProjectKnowledge(projectId: string): Promise<{ success: boolean; knowledge: KnowledgeEntry[] }> {
        return apiCall(`/api/projects/${projectId}/knowledge`);
    }

    // 팝업 생성
    static async createPopup(projectId: string, popup: PopupCreate): Promise<{ success: boolean; popup_id: string; message: string }> {
        return apiCall(`/api/projects/${projectId}/popups`, {
            method: 'POST',
            body: JSON.stringify(popup),
        });
    }

    // 프로젝트 팝업 목록 조회
    static async getProjectPopups(projectId: string): Promise<{ success: boolean; popups: Popup[] }> {
        return apiCall(`/api/projects/${projectId}/popups`);
    }

    // 서버 연결 테스트
    static async testConnection(): Promise<boolean> {
        try {
            await this.getStatus();
            return true;
        } catch (error) {
            console.error('서버 연결 실패:', error);
            return false;
        }
    }
}

// 편의 함수들
export const mediaKnowledgeAPI = {
    // 프로젝트 생성
    createProject: async (project: ProjectCreate) => {
        try {
            const response = await MediaKnowledgeAPI.createProject(project);
            return response.project_id;
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
            throw error;
        }
    },

    // 미디어 파일 업로드
    uploadMedia: async (file: File, projectId: string) => {
        try {
            const response = await MediaKnowledgeAPI.uploadMediaFile(file, projectId);
            return response.upload_result;
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            throw error;
        }
    },

    // 파일 분석
    analyzeFile: async (fileId: string) => {
        try {
            const response = await MediaKnowledgeAPI.analyzeFile(fileId);
            return response.analysis_result;
        } catch (error) {
            console.error('파일 분석 실패:', error);
            throw error;
        }
    },

    // 프로젝트 파일 목록 조회
    getProjectFiles: async (projectId: string) => {
        try {
            const response = await MediaKnowledgeAPI.getProjectFiles(projectId);
            return response.files;
        } catch (error) {
            console.error('파일 목록 조회 실패:', error);
            throw error;
        }
    },

    // 프로젝트 지식 베이스 조회
    getProjectKnowledge: async (projectId: string) => {
        try {
            const response = await MediaKnowledgeAPI.getProjectKnowledge(projectId);
            return response.knowledge;
        } catch (error) {
            console.error('지식 베이스 조회 실패:', error);
            throw error;
        }
    },

    // 팝업 생성
    createPopup: async (projectId: string, popup: PopupCreate) => {
        try {
            const response = await MediaKnowledgeAPI.createPopup(projectId, popup);
            return response.popup_id;
        } catch (error) {
            console.error('팝업 생성 실패:', error);
            throw error;
        }
    },

    // 프로젝트 팝업 목록 조회
    getProjectPopups: async (projectId: string) => {
        try {
            const response = await MediaKnowledgeAPI.getProjectPopups(projectId);
            return response.popups;
        } catch (error) {
            console.error('팝업 목록 조회 실패:', error);
            throw error;
        }
    },

    // 서버 상태 확인
    checkStatus: async () => {
        try {
            const response = await MediaKnowledgeAPI.getStatus();
            return response.status === 'healthy';
        } catch (error) {
            console.error('서버 상태 확인 실패:', error);
            return false;
        }
    },

    // 테스트 엔드포인트
    testEndpoint: async () => {
        try {
            const response = await apiCall('/api/test');
            return response;
        } catch (error) {
            console.error('테스트 엔드포인트 실패:', error);
            throw error;
        }
    },
};

export default MediaKnowledgeAPI; 