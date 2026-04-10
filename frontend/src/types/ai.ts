/**
 * AI 엔진 관련 타입 정의
 * 
 * 이 파일은 AI 엔진의 설정, 상태, 응답, 분석 결과 등을 위한 타입들을 정의합니다.
 */

/**
 * AI 엔진 설정
 * 모델의 동작을 제어하는 파라미터들
 */
export interface AIEngineConfig {
    /** 사용할 모델 이름 */
    model: string;
    /** 창의성/랜덤성 조절 (0.0 ~ 2.0) */
    temperature: number;
    /** 최대 토큰 수 */
    maxTokens: number;
    /** Nucleus sampling 파라미터 (0.0 ~ 1.0) */
    topP: number;
    /** 빈도 페널티 (-2.0 ~ 2.0) */
    frequencyPenalty: number;
    /** 존재 페널티 (-2.0 ~ 2.0) */
    presencePenalty: number;
}

/**
 * AI 분석 결과
 * 일반적인 AI 분석 작업의 결과를 나타냅니다
 */
export interface AIAnalysisResult {
    /** 분석 신뢰도 (0.0 ~ 1.0) */
    confidence: number;
    /** 처리 시간 (밀리초) */
    processingTime: number;
    /** 분석 결과 텍스트 */
    analysis: string;
    /** 추가 메타데이터 */
    metadata: Record<string, unknown>;
}

/**
 * 감정 분석 결과
 * 텍스트의 감정을 분석한 결과를 나타냅니다
 */
export interface SentimentAnalysisResult {
    /** 전체 감정 분류 */
    sentiment: 'positive' | 'negative' | 'neutral';
    /** 분석 신뢰도 (0.0 ~ 1.0) */
    confidence: number;
    /** 각 감정별 점수 (0.0 ~ 1.0) */
    scores: {
        positive: number;
        negative: number;
        neutral: number;
    };
    /** 감정과 관련된 키워드 목록 */
    keywords: string[];
}

/**
 * 의도 감지 결과
 * 사용자의 의도를 분석한 결과를 나타냅니다
 */
export interface IntentDetectionResult {
    /** 감지된 주요 의도 */
    intent: string;
    /** 의도 감지 신뢰도 (0.0 ~ 1.0) */
    confidence: number;
    /** 추출된 엔티티 목록 */
    entities: Array<{
        /** 엔티티 타입 (예: 'person', 'location', 'date') */
        type: string;
        /** 엔티티 값 */
        value: string;
        /** 엔티티 추출 신뢰도 (0.0 ~ 1.0) */
        confidence: number;
    }>;
    /** 대안 의도 목록 */
    alternatives: Array<{
        /** 대안 의도 */
        intent: string;
        /** 대안 의도 신뢰도 (0.0 ~ 1.0) */
        confidence: number;
    }>;
}

/**
 * 컨텍스트 분석 결과
 * 대화나 텍스트의 컨텍스트를 분석한 결과를 나타냅니다
 */
export interface ContextAnalysisResult {
    /** 컨텍스트 레벨 (0.0 ~ 1.0) */
    contextLevel: number;
    /** 관련 주제 목록 */
    relevantTopics: string[];
    /** 컨텍스트 윈도우 크기 (토큰 수) */
    contextWindow: number;
    /** 메모리 사용량 (바이트) */
    memoryUsage: number;
    /** 관련 컨텍스트 목록 */
    relatedContexts: Array<{
        /** 컨텍스트 ID */
        id: string;
        /** 관련성 점수 (0.0 ~ 1.0) */
        relevance: number;
        /** 컨텍스트 요약 */
        summary: string;
    }>;
}

/**
 * 모델 성능 지표
 * AI 모델의 성능을 측정한 지표들
 */
export interface ModelPerformance {
    /** 모델 이름 */
    model: string;
    /** 정확도 (0.0 ~ 1.0) */
    accuracy: number;
    /** 평균 응답 시간 (밀리초) */
    responseTime: number;
    /** 처리량 (요청/초) */
    throughput: number;
    /** 오류율 (0.0 ~ 1.0) */
    errorRate: number;
    /** 마지막 업데이트 시간 (ISO 8601) */
    lastUpdated: string;
}

/**
 * 실시간 분석 설정
 * 실시간 분석 기능의 동작을 제어하는 설정
 */
export interface RealtimeAnalysisConfig {
    /** 실시간 분석 활성화 여부 */
    enabled: boolean;
    /** 분석 간격 (밀리초) */
    interval: number;
    /** 활성화된 분석 기능 */
    features: {
        /** 감정 분석 활성화 */
        sentiment: boolean;
        /** 의도 감지 활성화 */
        intent: boolean;
        /** 컨텍스트 분석 활성화 */
        context: boolean;
        /** 성능 모니터링 활성화 */
        performance: boolean;
    };
    /** 임계값 설정 */
    thresholds: {
        /** 최소 신뢰도 (0.0 ~ 1.0) */
        confidence: number;
        /** 최대 처리 시간 (밀리초) */
        processingTime: number;
        /** 최대 오류율 (0.0 ~ 1.0) */
        errorRate: number;
    };
}

/**
 * 웹소켓 메시지
 * 
 * 주의: WebSocketEvent와 유사하지만 다른 용도입니다.
 * - WebSocketMessage: 일반적인 웹소켓 메시지 전송용
 * - WebSocketEvent: 웹소켓 연결 이벤트 처리용
 */
export interface WebSocketMessage {
    /** 메시지 타입 */
    type: string;
    /** 메시지 데이터 */
    data: unknown;
    /** 타임스탬프 (Unix timestamp, 밀리초) */
    timestamp: number;
    /** 대화방 ID (선택) */
    roomId?: string;
    /** 사용자 ID (선택) */
    userId?: string;
    /** 추가 메타데이터 (선택) */
    metadata?: Record<string, unknown>;
}

/**
 * AI 엔진 상태
 * AI 엔진의 현재 상태를 나타냅니다
 */
export interface AIEngineStatus {
    /** 초기화 완료 여부 */
    isInitialized: boolean;
    /** 연결 상태 */
    isConnected: boolean;
    /** 현재 사용 중인 모델 */
    currentModel: string;
    /** 사용 가능한 모델 목록 */
    availableModels: string[];
    /** 모델 성능 지표 */
    performance: ModelPerformance;
    /** 발생한 오류 목록 */
    errors: Array<{
        /** 오류 타입 */
        type: string;
        /** 오류 메시지 */
        message: string;
        /** 오류 발생 시간 (ISO 8601) */
        timestamp: string;
    }>;
}

/**
 * AI 엔진 응답 타입
 * 
 * 주의: 다른 파일에도 AIResponse 타입이 정의되어 있습니다:
 * - src/types/chat.ts: 대화 UI용 AI 응답 (type, metadata.suggestions 등 포함)
 * - src/types/conversation.ts: 대화 분석용 AI 응답 (strategy, quality, feedback 등 포함)
 * - src/services/integratedAIService.ts: 통합 AI 서비스용 (자체 정의)
 * - src/services/externalAIService.ts: 외부 AI 서비스용 (provider, cost 등 포함)
 * - src/services/aiService.ts: AI 서비스용 (quality 객체 포함)
 * 
 * 이 타입은 AI 엔진의 분석 결과(sentiment, intent, context)를 포함하는 응답에 사용됩니다.
 */
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

/**
 * AI 요청
 * AI 엔진에 전송하는 요청 데이터
 */
export interface AIRequest {
    /** 요청 내용 */
    content: string;
    /** 컨텍스트 정보 (선택) */
    context?: string;
    /** 요청 옵션 (선택) */
    options?: {
        /** 사용할 모델 (선택) */
        model?: string;
        /** 온도 파라미터 (선택) */
        temperature?: number;
        /** 최대 토큰 수 (선택) */
        maxTokens?: number;
        /** 분석 결과 포함 여부 (선택) */
        includeAnalysis?: boolean;
    };
}

/**
 * AI 엔진 메트릭
 * AI 엔진의 사용 통계 및 성능 지표
 */
export interface AIEngineMetrics {
    /** 전체 요청 수 */
    totalRequests: number;
    /** 성공한 요청 수 */
    successfulRequests: number;
    /** 실패한 요청 수 */
    failedRequests: number;
    /** 평균 응답 시간 (밀리초) */
    averageResponseTime: number;
    /** 평균 신뢰도 (0.0 ~ 1.0) */
    averageConfidence: number;
    /** 모델별 사용 횟수 */
    modelUsage: Record<string, number>;
    /** 오류 타입별 분포 */
    errorDistribution: Record<string, number>;
    /** 성능 이력 */
    performanceHistory: Array<{
        /** 기록 시간 (ISO 8601) */
        timestamp: string;
        /** 응답 시간 (밀리초) */
        responseTime: number;
        /** 신뢰도 (0.0 ~ 1.0) */
        confidence: number;
        /** 사용된 모델 */
        model: string;
    }>;
}

/**
 * AI 엔진 이벤트
 * AI 엔진에서 발생하는 이벤트를 나타냅니다
 */
export interface AIEngineEvent {
    /** 이벤트 타입 */
    type: 'initialization' | 'model_switch' | 'analysis_start' | 'analysis_complete' | 'error' | 'performance_update';
    /** 이벤트 발생 시간 (ISO 8601) */
    timestamp: string;
    /** 이벤트 데이터 */
    data: unknown;
    /** 심각도 (선택) */
    severity?: 'info' | 'warning' | 'error';
}

/**
 * AI 엔진 기능
 * AI 엔진이 제공하는 기능과 제한사항
 */
export interface AIEngineCapabilities {
    /** 사용 가능한 모델 목록 */
    models: Array<{
        /** 모델 이름 */
        name: string;
        /** 모델 설명 */
        description: string;
        /** 모델 기능 목록 */
        capabilities: string[];
        /** 모델 성능 지표 */
        performance: ModelPerformance;
    }>;
    /** 활성화된 기능 목록 */
    features: Array<{
        /** 기능 이름 */
        name: string;
        /** 기능 설명 */
        description: string;
        /** 활성화 여부 */
        enabled: boolean;
        /** 기능 설정 */
        config: Record<string, unknown>;
    }>;
    /** 제한사항 */
    limits: {
        /** 최대 토큰 수 */
        maxTokens: number;
        /** 분당 최대 요청 수 */
        maxRequestsPerMinute: number;
        /** 최대 동시 요청 수 */
        maxConcurrentRequests: number;
        /** 최대 컨텍스트 길이 (토큰 수) */
        maxContextLength: number;
    };
}

/**
 * AI 엔진 설정
 * AI 엔진의 전체 설정을 나타냅니다
 */
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

/**
 * AI 엔진 상태
 * AI 엔진의 전체 상태를 관리하는 타입
 */
export interface AIEngineState {
    status: AIEngineStatus;
    settings: AIEngineSettings;
    metrics: AIEngineMetrics;
    events: AIEngineEvent[];
    capabilities: AIEngineCapabilities;
}

/**
 * AI 엔진 API 응답
 * AI 엔진 API의 표준 응답 형식
 */
export interface AIEngineAPIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId: string;
}

/**
 * 웹소켓 이벤트 타입
 * 웹소켓 연결에서 발생할 수 있는 이벤트 타입들
 */
export type WebSocketEventType =
    | 'connect'
    | 'disconnect'
    | 'message'
    | 'error'
    | 'reconnect'
    | 'heartbeat';

/**
 * 웹소켓 이벤트
 * 
 * 주의: WebSocketMessage와 유사하지만 다른 용도입니다.
 * - WebSocketEvent: 웹소켓 연결 이벤트 처리용 (connect, disconnect 등)
 * - WebSocketMessage: 일반적인 웹소켓 메시지 전송용
 */
export interface WebSocketEvent {
    /** 이벤트 타입 */
    type: WebSocketEventType;
    /** 이벤트 데이터 (선택) */
    data?: unknown;
    /** 이벤트 발생 시간 (ISO 8601) */
    timestamp: string;
    /** 연결 ID (선택) */
    connectionId?: string;
}

/**
 * 실시간 분석 스트림
 * 실시간으로 전송되는 분석 결과 데이터
 */
export interface AnalysisStream {
    /** 스트림 ID */
    id: string;
    /** 분석 타입 */
    type: 'sentiment' | 'intent' | 'context' | 'performance';
    /** 분석 결과 데이터
     * - sentiment: SentimentAnalysisResult
     * - intent: IntentDetectionResult
     * - context: ContextAnalysisResult
     * - performance: ModelPerformance
     */
    data: unknown;
    /** 분석 시간 (ISO 8601) */
    timestamp: string;
    /** 분석 신뢰도 (0.0 ~ 1.0) */
    confidence: number;
    /** 처리 시간 (밀리초) */
    processingTime: number;
}

/**
 * AI 엔진 플러그인
 * AI 엔진의 기능을 확장하는 플러그인
 */
export interface AIEnginePlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    enabled: boolean;
    config: Record<string, unknown>;
    hooks: {
        preProcess?: (input: unknown) => unknown;
        postProcess?: (output: unknown) => unknown;
        onError?: (error: unknown) => void;
    };
}

/**
 * AI 엔진 워크플로우
 * AI 엔진에서 실행되는 작업 워크플로우
 */
export interface AIEngineWorkflow {
    id: string;
    name: string;
    description: string;
    steps: Array<{
        id: string;
        type: string;
        config: Record<string, unknown>;
        dependencies: string[];
    }>;
    enabled: boolean;
    schedule?: {
        type: 'manual' | 'interval' | 'cron';
        config: Record<string, unknown>;
    };
}
