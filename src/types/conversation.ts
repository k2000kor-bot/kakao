import { Message as ChatMessage } from './chat';

export type Message = ChatMessage;

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

/**
 * 대화 분석용 AI 응답 타입
 * 
 * 주의: 다른 파일에도 AIResponse 타입이 정의되어 있습니다:
 * - src/types/ai.ts: AI 엔진 분석 결과 포함 (sentiment, intent, context)
 * - src/types/chat.ts: 대화 UI용 (type, suggestions, actions)
 * - src/services/integratedAIService.ts: 통합 AI 서비스용 (자체 정의)
 * - src/services/externalAIService.ts: 외부 AI 서비스용 (provider, cost)
 * - src/services/aiService.ts: AI 서비스용 (quality 객체)
 * 
 * 이 타입은 대화 분석에서 전략(strategy), 품질(quality), 피드백(feedback)을
 * 포함하는 응답에 사용됩니다.
 */
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