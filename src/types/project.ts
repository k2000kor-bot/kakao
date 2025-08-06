export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'spreadsheet' | 'image' | 'video' | 'audio';
    size: number;
    uploadedAt: string;
    url: string;
    description: string;
    tags: string[];
    aiAnalysis?: {
        keywords: string[];
        summary: string;
        sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
    };
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
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    files: ProjectFile[];
    guidelines: any[];
    chats: any[];
    analytics: any;
    settings: any;
    messageCount: number;
    archived: boolean;
    tags: string[];
}

export interface ProjectGuideline {
    id: string;
    title: string;
    content: string;
    type: 'basic' | 'process' | 'technical' | 'legal';
    createdAt: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ProjectChat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export interface ProjectAnalytics {
    totalFiles: number;
    totalMessages: number;
    lastActivity: string;
    completionRate: number;
}

export interface ProjectSettings {
    maxFileSize: number;
    allowedFileTypes: string[];
    autoBackup: boolean;
    notifications: boolean;
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
