export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'archived' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    tags: string[];
    guidelines?: string | Guideline[];
    files?: ProjectFile[];
    chats: Chat[];
    messageCount?: number;
}

export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'image' | 'code' | 'other' | 'audio' | 'video';
    size: number;
    uploadedAt: Date;
    url?: string;
    content?: string;
    status?: 'uploaded' | 'processing' | 'completed' | 'error';
    description?: string;
    tags?: string[];
    relevance?: number;
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

export interface Chat {
    id: string;
    projectId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
    status: 'active' | 'archived';
}

export interface Message {
    id: string;
    chatId: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    metadata?: {
        responseTime?: number;
        tokens?: number;
        model?: string;
        workflowId?: string;
        confidence?: number;
        quality?: number;
        executionTime?: number;
        analysis?: any;
        recommendations?: any;
        nextSteps?: any;
        intelligentMode?: boolean;
    };
}

export interface ProjectGuidelines {
    projectId: string;
    content: string;
    updatedAt: Date;
}

export interface ProjectStats {
    totalChats: number;
    totalMessages: number;
    averageResponseTime: number;
    mostActiveDay: string;
    topKeywords: string[];
}

// 기존 서비스들과의 호환성을 위한 타입들
export interface Guideline {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'specific' | 'technical';
    priority?: 'high' | 'medium' | 'low';
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    relevance?: number;
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
