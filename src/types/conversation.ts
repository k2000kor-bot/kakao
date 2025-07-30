export interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    reliability?: number;
    urgency?: 'low' | 'medium' | 'high';
    isDeleted?: boolean;
    aiResponse?: {
        message: string;
        confidence: number;
        status: 'success' | 'error' | 'pending';
    };
}

export interface ConversationSummary {
    topics: {
        title: string;
        messages: Message[];
        summary: string;
        keyParticipants: string[];
        sentiment: 'positive' | 'negative' | 'neutral';
        keywords: string[];
    }[];
    overallSummary: string;
    keyParticipants: string[];
    sentiment: string;
    totalMessages: number;
    totalParticipants: number;
    participantCount: number;
    topParticipants: Array<{
        name: string;
        messageCount: number;
    }>;
    sentimentAnalysis: {
        positive: number;
        negative: number;
        neutral: number;
    };
    urgencyAnalysis: {
        high: number;
        medium: number;
        low: number;
    };
    dateRange: {
        start: string;
        end: string;
    };
}

export interface QualityMetrics {
    relevance: number;
    accuracy: number;
    empathy: number;
    clarity: number;
    timeliness: number;
    overall: number;
}

export interface AIResponse {
    id?: string;
    content?: string;
    strategy?: string;
    quality?: number;
    feedback?: string;
    timestamp?: string;
    reliability?: number;
    message: string;
    confidence: number;
    status: 'success' | 'error' | 'pending';
}

export interface ConversationAnalysis {
    totalMessages: number;
    uniqueParticipants: number;
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    topParticipants: Array<{
        sender: string;
        count: number;
        percentage: number;
    }>;
    hourlyActivity: Record<number, number>;
    dailyActivity: Record<string, number>;
    keywords: string[];
    sentiment: string;
    mainTopics: string[];
    averageMessageLength: number;
    responseTime: number;
    engagementScore: number;
}

export interface MessageStrategy {
    id: string;
    name: string;
    description: string;
    type: 'basic' | 'communication';
}

export interface Participant {
    id: string;
    name: string;
    messageCount: number;
    lastActive: string;
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AnalysisPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCustom: boolean;
}

export interface ChatRoom {
    id: string;
    name: string;
    messageCount: number;
    participantCount: number;
    status: 'active' | 'inactive';
    lastMessage: string;
} 