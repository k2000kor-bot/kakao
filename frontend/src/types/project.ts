export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    files: ProjectFile[];
    webSources?: ProjectLearningSource[];
    instructions: string;
    guidelines?: string;
    /** 노트북 LLM 학습용 가이드라인 (프로젝트 생성/수정 시 사용) */
    initialGuidelines?: string[];
    tags: string[];
    isActive: boolean;
    type: 'conversation' | 'analysis' | 'development' | 'research' | 'business';
    status: 'active' | 'archived' | 'completed' | 'draft';
    messageCount?: number;
    priority?: 'low' | 'medium' | 'high';
    chats?: Chat[];
    /** 노트북 LLM 학습 소스 개수 (Google NotebookLM 스타일, 소스 N개) */
    source_count?: number;
}

export interface ProjectLearningSource {
    id: string;
    type: 'document' | 'video';
    url: string;
    title?: string;
    addedAt: Date;
    syncStatus?: 'pending' | 'success' | 'failed';
    lastSyncedAt?: Date;
    syncError?: string;
}

export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'image' | 'code' | 'other';
    size: number;
    uploadedAt: Date;
    url?: string;
    status?: string;
    description?: string;
    tags?: string[];
}

export interface Chat {
    id: string;
    projectId: string;
    name: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isBookmarked?: boolean;
    metadata?: {
        responseTime?: number;
        qualityScore?: number;
        reviewStatus?: string;
        feedback?: string;
        mathematicalAnalysis?: Record<string, unknown>;
        languageAnalysis?: Record<string, unknown>;
        statisticalData?: Record<string, unknown>;
    };
}

export interface Guideline {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    isActive?: boolean;
}

export interface ProjectGuidelines {
    projectId: string;
    guidelines: Guideline[];
}

export interface ProjectChat {
    id: string;
    projectId: string;
    name: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectAnalytics {
    messageCount: number;
    userCount: number;
    fileCount: number;
    lastActivity: Date;
}

export interface ProjectSettings {
    id: string;
    projectId: string;
    settings: Record<string, unknown>;
    updatedAt: Date;
}

export interface KnowledgeBase {
    id: string;
    projectId: string;
    name: string;
    description: string;
    documents: ProjectFile[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AILearningData {
    results: unknown[];
    filesAnalyzed: number;
    totalFiles: number;
    progress: number;
    errors: string[];
    processingTime?: number;
    modelVersion?: string;
    accuracy?: number;
}

export interface AILearningSession {
    id: string;
    projectId: string;
    sessionType: string;
    startTime: Date;
    endTime?: Date;
    learningData: AILearningData;
}
