export interface MediaFile {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'document';
    size: number;
    url: string;
    uploadDate: string;
    analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
    extractedText?: string;
    summary?: string;
    keywords?: string[];
    sentiment?: string;
    writingInsights?: WritingInsight[];
}

export interface WritingInsight {
    id: string;
    type: 'quote' | 'reference' | 'argument' | 'example' | 'statistic';
    content: string;
    source?: string;
    confidence: number;
    context: string;
    writingStyle: string;
    citationFormat: string;
}

export interface ConversationMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    mediaFiles?: MediaFile[];
    writingContext?: {
        tone: string;
        style: string;
        purpose: string;
        audience: string;
    };
}

export interface WritingTheory {
    id: string;
    name: string;
    description: string;
    principles: string[];
    examples: string[];
    application: string;
}

export interface AnalysisResult {
    file_id: string;
    extracted_text: string;
    summary: string;
    keywords: string[];
    sentiment: string;
    confidence_score: number;
    writing_insights: WritingInsight[];
}

export interface MediaUploadResponse {
    file_id: string;
    filename: string;
    file_size: number;
    mime_type: string;
    upload_date: string;
    analysis_status: string;
}

export interface ConversationResponse {
    response: string;
    timestamp: string;
    writing_theory_applied?: string;
}

export interface WritingContext {
    tone: string;
    style: string;
    purpose: string;
    audience: string;
}

export interface FileAnalysisStatus {
    fileId: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
    message?: string;
}

export interface MediaAnalysisConfig {
    enableOCR: boolean;
    enableSpeechRecognition: boolean;
    enableDocumentParsing: boolean;
    maxFileSize: number;
    supportedFormats: string[];
    analysisTimeout: number;
}

export interface WritingInsightFilter {
    type?: 'quote' | 'reference' | 'argument' | 'example' | 'statistic';
    confidence?: number;
    writingStyle?: string;
    source?: string;
}

export interface ConversationSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    mediaFiles: MediaFile[];
    writingContext: WritingContext;
    activeTheory?: WritingTheory;
} 