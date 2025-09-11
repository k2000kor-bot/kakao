export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    files: ProjectFile[];
    instructions: string;
    guidelines?: string;
    tags: string[];
    isActive: boolean;
    type: 'conversation' | 'analysis' | 'development' | 'research' | 'business';
    status: 'active' | 'archived' | 'completed' | 'draft';
    messageCount?: number;
    priority?: 'low' | 'medium' | 'high';
    chats?: any[];
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
        mathematicalAnalysis?: any;
        languageAnalysis?: any;
        statisticalData?: any;
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
    settings: Record<string, any>;
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

export interface AILearningSession {
    id: string;
    projectId: string;
    sessionType: string;
    startTime: Date;
    endTime?: Date;
    learningData: any;
}
