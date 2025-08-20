// AI 엔진 관련 타입 정의

export interface AIEngineConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface AIAnalysisResult {
    confidence: number;
    processingTime: number;
    analysis: string;
    metadata: Record<string, any>;
}

export interface SentimentAnalysisResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    scores: {
        positive: number;
        negative: number;
        neutral: number;
    };
    keywords: string[];
}

export interface IntentDetectionResult {
    intent: string;
    confidence: number;
    entities: Array<{
        type: string;
        value: string;
        confidence: number;
    }>;
    alternatives: Array<{
        intent: string;
        confidence: number;
    }>;
}

export interface ContextAnalysisResult {
    contextLevel: number;
    relevantTopics: string[];
    contextWindow: number;
    memoryUsage: number;
    relatedContexts: Array<{
        id: string;
        relevance: number;
        summary: string;
    }>;
}

export interface ModelPerformance {
    model: string;
    accuracy: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    lastUpdated: string;
}

export interface RealtimeAnalysisConfig {
    enabled: boolean;
    interval: number;
    features: {
        sentiment: boolean;
        intent: boolean;
        context: boolean;
        performance: boolean;
    };
    thresholds: {
        confidence: number;
        processingTime: number;
        errorRate: number;
    };
}

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
    roomId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

export interface AIEngineStatus {
    isInitialized: boolean;
    isConnected: boolean;
    currentModel: string;
    availableModels: string[];
    performance: ModelPerformance;
    errors: Array<{
        type: string;
        message: string;
        timestamp: string;
    }>;
}

export interface AIResponse {
    content: string;
    confidence: number;
    processingTime: number;
    model: string;
    tokens: number;
    metadata: {
        sentiment?: SentimentAnalysisResult;
        intent?: IntentDetectionResult;
        context?: ContextAnalysisResult;
    };
}

export interface AIRequest {
    content: string;
    context?: string;
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        includeAnalysis?: boolean;
    };
}

export interface AIEngineMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    averageConfidence: number;
    modelUsage: Record<string, number>;
    errorDistribution: Record<string, number>;
    performanceHistory: Array<{
        timestamp: string;
        responseTime: number;
        confidence: number;
        model: string;
    }>;
}

export interface AIEngineEvent {
    type: 'initialization' | 'model_switch' | 'analysis_start' | 'analysis_complete' | 'error' | 'performance_update';
    timestamp: string;
    data: any;
    severity?: 'info' | 'warning' | 'error';
}

export interface AIEngineCapabilities {
    models: Array<{
        name: string;
        description: string;
        capabilities: string[];
        performance: ModelPerformance;
    }>;
    features: Array<{
        name: string;
        description: string;
        enabled: boolean;
        config: any;
    }>;
    limits: {
        maxTokens: number;
        maxRequestsPerMinute: number;
        maxConcurrentRequests: number;
        maxContextLength: number;
    };
}

// AI 엔진 설정 타입
export interface AIEngineSettings {
    general: {
        autoInitialize: boolean;
        autoReconnect: boolean;
        logLevel: 'debug' | 'info' | 'warning' | 'error';
    };
    models: {
        defaultModel: string;
        fallbackModel: string;
        modelConfigs: Record<string, AIEngineConfig>;
    };
    analysis: {
        realtime: RealtimeAnalysisConfig;
        batch: {
            enabled: boolean;
            batchSize: number;
            interval: number;
        };
    };
    performance: {
        cacheEnabled: boolean;
        cacheSize: number;
        timeout: number;
        retryAttempts: number;
    };
    monitoring: {
        enabled: boolean;
        metricsInterval: number;
        alertThresholds: {
            errorRate: number;
            responseTime: number;
            confidence: number;
        };
    };
}

// AI 엔진 상태 관리 타입
export interface AIEngineState {
    status: AIEngineStatus;
    settings: AIEngineSettings;
    metrics: AIEngineMetrics;
    events: AIEngineEvent[];
    capabilities: AIEngineCapabilities;
}

// API 응답 타입
export interface AIEngineAPIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId: string;
}

// 웹소켓 이벤트 타입
export type WebSocketEventType =
    | 'connect'
    | 'disconnect'
    | 'message'
    | 'error'
    | 'reconnect'
    | 'heartbeat';

export interface WebSocketEvent {
    type: WebSocketEventType;
    data?: any;
    timestamp: string;
    connectionId?: string;
}

// 실시간 분석 스트림 타입
export interface AnalysisStream {
    id: string;
    type: 'sentiment' | 'intent' | 'context' | 'performance';
    data: any;
    timestamp: string;
    confidence: number;
    processingTime: number;
}

// AI 엔진 플러그인 타입
export interface AIEnginePlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    enabled: boolean;
    config: Record<string, any>;
    hooks: {
        preProcess?: (input: any) => any;
        postProcess?: (output: any) => any;
        onError?: (error: any) => void;
    };
}

// AI 엔진 워크플로우 타입
export interface AIEngineWorkflow {
    id: string;
    name: string;
    description: string;
    steps: Array<{
        id: string;
        type: string;
        config: any;
        dependencies: string[];
    }>;
    enabled: boolean;
    schedule?: {
        type: 'manual' | 'interval' | 'cron';
        config: any;
    };
}
