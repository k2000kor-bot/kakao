export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'spreadsheet' | 'image' | 'video' | 'audio' | 'other';
    size: number;
    uploadedAt: Date;
    status: 'uploaded' | 'processing' | 'completed' | 'error';
    url?: string;
    description?: string;
    tags?: string[];
    relevance?: number; // 관련성 점수 추가
    aiAnalysis?: {
        keywords: string[];
        summary: string;
        sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
    };
}

export interface WritingMaterial {
    id: string;
    title: string;
    content: string;
    type: 'summary' | 'analysis' | 'report' | 'template';
    createdAt: Date;
    sourceFiles?: string[];
    quality?: number;
    tags?: string[];
}

export interface KnowledgeBase {
    id: string;
    title: string;
    content: string;
    type: 'concept' | 'process' | 'reference' | 'insight' | 'analysis';
    tags: string[];
    createdAt: string;
    aiGenerated: boolean;
    confidence: number;
    source?: string;
    relatedFiles?: string[];
    usage: number;
    lastAccessed: string;
}

export interface AILearningSession {
    id: string;
    projectId: string;
    status: 'active' | 'completed' | 'failed' | 'processing';
    startTime: string;
    endTime?: string;
    analysisType: 'basic' | 'advanced' | 'deep';
    filesAnalyzed: number;
    totalFiles: number;
    progress: number;
    results: any[];
    errors: string[];
    modelVersion: string;
    accuracy: number;
    processingTime: number;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'archived' | 'paused';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    files: ProjectFile[];
    guidelines: Guideline[];
    chats: ProjectChat[];
    analytics: ProjectAnalytics;
    settings: ProjectSettings;
    archived: boolean;
    tags: string[];
}

export interface Guideline {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'specific' | 'technical';
    priority?: 'high' | 'medium' | 'low';
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    relevance?: number; // 관련성 점수 추가
}

export interface ProjectChat {
    id: string;
    title: string;
    description: string;
    participants: string[];
    messageCount: number;
    lastActivity: string;
    status: 'active' | 'archived' | 'completed';
    messages: ChatMessage[];
}

export interface ProjectAnalytics {
    totalMessages: number;
    totalFiles: number;
    totalGuidelines: number;
    activeChats: number;
    participants: number;
    activityTrend: Array<{
        date: string;
        messages: number;
        files: number;
    }>;
    topTopics: Array<{
        topic: string;
        count: number;
        percentage: number;
    }>;
    sentimentAnalysis: {
        positive: number;
        neutral: number;
        negative: number;
    };
    completionRate?: number;
    lastActivity?: string;
}

export interface ProjectSettings {
    maxFileSize: number;
    allowedFileTypes: string[];
    autoBackup: boolean;
    notifications: boolean;
    theme?: string;
    language?: string;
    aiModel?: string;
    autoSave?: boolean;
    collaboration?: boolean;
    privacy?: string;
}

export interface ChatMessage {
    id: string;
    projectId: string;
    chatId: string;
    content: string;
    sender: string;
    timestamp: string;
    type: 'question' | 'answer' | 'system' | 'file' | 'image';
    isUser: boolean;
    replyTo?: string;
    edited?: boolean;
    attachments?: Array<{
        id: string;
        name: string;
        type: 'image' | 'file' | 'document';
        url: string;
    }>;
    metadata?: {
        confidence?: number;
        processingTime?: number;
        modelUsed?: string;
    };
}
