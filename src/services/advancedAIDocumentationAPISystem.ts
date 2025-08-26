import { EventEmitter } from 'events';
import realTimeAIAlertSystem from './realTimeAIAlertSystem';
import aiHealthMonitor from './aiHealthMonitor';

// 인터페이스 정의
export interface APIDocumentation {
    id: string;
    service_name: string;
    version: string;
    endpoints: APIEndpoint[];
    schemas: APISchema[];
    examples: APIExample[];
    changelog: APIChange[];
    last_updated: Date;
    status: 'active' | 'deprecated' | 'beta';
}

export interface APIEndpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    parameters: APIParameter[];
    request_body?: APIRequestBody;
    responses: APIResponse[];
    authentication: string[];
    rate_limit?: string;
    deprecated: boolean;
    tags: string[];
}

export interface APIParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    default_value?: any;
    example?: any;
    validation_rules?: string[];
}

export interface APIRequestBody {
    content_type: string;
    schema: any;
    required: boolean;
    description: string;
    example?: any;
}

export interface APIResponse {
    status_code: number;
    description: string;
    content_type: string;
    schema: any;
    example?: any;
}

export interface APISchema {
    name: string;
    type: 'object' | 'array' | 'string' | 'number' | 'boolean';
    properties?: Record<string, any>;
    required?: string[];
    description: string;
    example?: any;
}

export interface APIExample {
    id: string;
    title: string;
    description: string;
    endpoint_id: string;
    request: {
        method: string;
        url: string;
        headers: Record<string, string>;
        body?: any;
    };
    response: {
        status_code: number;
        headers: Record<string, string>;
        body: any;
    };
    language: 'javascript' | 'python' | 'curl' | 'typescript';
    tags: string[];
}

export interface APIChange {
    version: string;
    date: Date;
    type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed';
    description: string;
    breaking_change: boolean;
    migration_guide?: string;
}

export interface DocumentationMetrics {
    total_endpoints: number;
    documented_endpoints: number;
    coverage_percentage: number;
    last_documentation_update: Date;
    documentation_quality_score: number;
    api_usage_statistics: APIUsageStats[];
    popular_endpoints: string[];
    deprecated_endpoints: number;
}

export interface APIUsageStats {
    endpoint_id: string;
    total_requests: number;
    success_rate: number;
    average_response_time: number;
    error_rate: number;
    last_used: Date;
    unique_users: number;
}

// 고급 AI 문서화 및 API 시스템 클래스
class AdvancedAIDocumentationAPISystem extends EventEmitter {
    private apiDocumentation: Map<string, APIDocumentation> = new Map();
    private documentationMetrics: DocumentationMetrics | null = null;
    private isRunning: boolean = false;
    private documentationInterval: NodeJS.Timeout | null = null;
    private metricsInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.initializeDocumentation();
        console.log('📚 고급 AI 문서화 및 API 시스템이 초기화되었습니다.');
    }

    // 시스템 시작
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startDocumentationUpdates();
        this.startMetricsCollection();
        console.log('🚀 고급 AI 문서화 및 API 시스템이 시작되었습니다.');
    }

    // 시스템 중지
    public stop(): void {
        if (this.documentationInterval) {
            clearInterval(this.documentationInterval);
            this.documentationInterval = null;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ 고급 AI 문서화 및 API 시스템이 중지되었습니다.');
    }

    // API 문서화 생성
    public async generateAPIDocumentation(serviceName: string): Promise<APIDocumentation> {
        try {
            console.log(`📝 ${serviceName} API 문서화 생성 중...`);

            const documentation: APIDocumentation = {
                id: `api-doc-${serviceName}-${Date.now()}`,
                service_name: serviceName,
                version: '1.0.0',
                endpoints: await this.generateEndpoints(serviceName),
                schemas: await this.generateSchemas(serviceName),
                examples: await this.generateExamples(serviceName),
                changelog: await this.generateChangelog(serviceName),
                last_updated: new Date(),
                status: 'active'
            };

            this.apiDocumentation.set(serviceName, documentation);
            this.emit('documentation_generated', { service_name: serviceName, documentation });

            // 문서화 품질 알림
            await this.checkDocumentationQuality(serviceName, documentation);

            console.log(`✅ ${serviceName} API 문서화 생성 완료`);
            return documentation;

        } catch (error) {
            console.error(`❌ ${serviceName} API 문서화 생성 오류:`, error);
            throw error;
        }
    }

    // 엔드포인트 생성
    private async generateEndpoints(serviceName: string): Promise<APIEndpoint[]> {
        const endpoints: APIEndpoint[] = [];

        switch (serviceName) {
            case 'integrated-ai-service':
                endpoints.push(
                    {
                        id: 'process-ai-request',
                        path: '/api/ai/process',
                        method: 'POST',
                        description: 'AI 요청 처리 및 응답 생성',
                        parameters: [
                            {
                                name: 'user_id',
                                type: 'string',
                                required: true,
                                description: '사용자 식별자',
                                example: 'user-123'
                            },
                            {
                                name: 'session_id',
                                type: 'string',
                                required: true,
                                description: '세션 식별자',
                                example: 'session-456'
                            }
                        ],
                        request_body: {
                            content_type: 'application/json',
                            schema: {
                                type: 'object',
                                properties: {
                                    input: {
                                        type: 'object',
                                        properties: {
                                            text: { type: 'string' },
                                            files: { type: 'array' },
                                            voice: { type: 'object' }
                                        }
                                    },
                                    context: { type: 'object' },
                                    preferences: { type: 'object' }
                                },
                                required: ['input']
                            },
                            required: true,
                            description: 'AI 처리 요청 데이터'
                        },
                        responses: [
                            {
                                status_code: 200,
                                description: '성공적인 AI 응답',
                                content_type: 'application/json',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        content: { type: 'object' },
                                        confidence_score: { type: 'number' },
                                        processing_time: { type: 'number' }
                                    }
                                }
                            },
                            {
                                status_code: 400,
                                description: '잘못된 요청',
                                content_type: 'application/json',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: { type: 'string' },
                                        details: { type: 'string' }
                                    }
                                }
                            }
                        ],
                        authentication: ['Bearer Token'],
                        rate_limit: '100 requests/minute',
                        deprecated: false,
                        tags: ['AI', 'Processing', 'Core']
                    },
                    {
                        id: 'get-ai-capabilities',
                        path: '/api/ai/capabilities',
                        method: 'GET',
                        description: 'AI 시스템의 현재 기능 및 제한사항 조회',
                        parameters: [],
                        responses: [
                            {
                                status_code: 200,
                                description: 'AI 기능 정보',
                                content_type: 'application/json',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        natural_language: { type: 'object' },
                                        multimodal: { type: 'object' },
                                        reasoning: { type: 'object' },
                                        search: { type: 'object' }
                                    }
                                }
                            }
                        ],
                        authentication: ['Bearer Token'],
                        deprecated: false,
                        tags: ['AI', 'Information', 'Core']
                    }
                );
                break;

            case 'ai-psychology-engine':
                endpoints.push(
                    {
                        id: 'analyze-emotional-state',
                        path: '/api/psychology/emotions',
                        method: 'POST',
                        description: '사용자의 감정 상태 분석',
                        parameters: [
                            {
                                name: 'user_id',
                                type: 'string',
                                required: true,
                                description: '분석할 사용자 ID',
                                example: 'user-123'
                            }
                        ],
                        request_body: {
                            content_type: 'application/json',
                            schema: {
                                type: 'object',
                                properties: {
                                    interaction_data: { type: 'object' },
                                    context: { type: 'object' }
                                }
                            },
                            required: true,
                            description: '감정 분석을 위한 상호작용 데이터'
                        },
                        responses: [
                            {
                                status_code: 200,
                                description: '감정 분석 결과',
                                content_type: 'application/json',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        emotional_state: { type: 'object' },
                                        confidence: { type: 'number' },
                                        recommendations: { type: 'array' }
                                    }
                                }
                            }
                        ],
                        authentication: ['Bearer Token'],
                        deprecated: false,
                        tags: ['Psychology', 'Analysis', 'Emotions']
                    }
                );
                break;

            case 'ai-security-system':
                endpoints.push(
                    {
                        id: 'validate-security',
                        path: '/api/security/validate',
                        method: 'POST',
                        description: '요청의 보안 검증 수행',
                        parameters: [],
                        request_body: {
                            content_type: 'application/json',
                            schema: {
                                type: 'object',
                                properties: {
                                    user_id: { type: 'string' },
                                    session_id: { type: 'string' },
                                    ip_address: { type: 'string' },
                                    content: { type: 'string' }
                                },
                                required: ['user_id', 'session_id', 'content']
                            },
                            required: true,
                            description: '보안 검증을 위한 요청 데이터'
                        },
                        responses: [
                            {
                                status_code: 200,
                                description: '보안 검증 결과',
                                content_type: 'application/json',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        allowed: { type: 'boolean' },
                                        risk_score: { type: 'number' },
                                        threats_detected: { type: 'array' }
                                    }
                                }
                            }
                        ],
                        authentication: ['Bearer Token'],
                        deprecated: false,
                        tags: ['Security', 'Validation', 'Core']
                    }
                );
                break;
        }

        return endpoints;
    }

    // 스키마 생성
    private async generateSchemas(serviceName: string): Promise<APISchema[]> {
        const schemas: APISchema[] = [];

        // 공통 스키마
        schemas.push(
            {
                name: 'AIRequest',
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    user_id: { type: 'string' },
                    session_id: { type: 'string' },
                    input: { type: 'object' },
                    context: { type: 'object' },
                    preferences: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['id', 'user_id', 'session_id', 'input'],
                description: 'AI 요청을 위한 표준 요청 스키마'
            },
            {
                name: 'AIResponse',
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    request_id: { type: 'string' },
                    response_type: { type: 'string' },
                    content: { type: 'object' },
                    metadata: { type: 'object' },
                    confidence_score: { type: 'number' },
                    processing_time: { type: 'number' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['id', 'request_id', 'content'],
                description: 'AI 응답을 위한 표준 응답 스키마'
            }
        );

        return schemas;
    }

    // 예제 생성
    private async generateExamples(serviceName: string): Promise<APIExample[]> {
        const examples: APIExample[] = [];

        examples.push(
            {
                id: 'example-ai-process-request',
                title: 'AI 요청 처리 예제',
                description: '텍스트 기반 AI 요청 처리 예제',
                endpoint_id: 'process-ai-request',
                request: {
                    method: 'POST',
                    url: '/api/ai/process',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer your-token-here'
                    },
                    body: {
                        user_id: 'user-123',
                        session_id: 'session-456',
                        input: {
                            text: '안녕하세요! 오늘 날씨는 어떤가요?'
                        },
                        context: {
                            conversation_history: [],
                            current_project: 'weather-inquiry'
                        },
                        preferences: {
                            response_style: 'friendly',
                            language: 'ko'
                        }
                    }
                },
                response: {
                    status_code: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        id: 'response-789',
                        request_id: 'request-123',
                        response_type: 'text',
                        content: {
                            primary_response: '안녕하세요! 현재 서울의 날씨는 맑고 기온은 22도입니다. 오후에는 구름이 조금 있을 예정이에요.',
                            structured_data: {
                                location: '서울',
                                weather: '맑음',
                                temperature: 22,
                                forecast: '오후 구름'
                            }
                        },
                        confidence_score: 0.95,
                        processing_time: 245
                    }
                },
                language: 'javascript',
                tags: ['AI', 'Processing', 'Example']
            }
        );

        return examples;
    }

    // 변경 로그 생성
    private async generateChangelog(serviceName: string): Promise<APIChange[]> {
        const changelog: APIChange[] = [];

        changelog.push(
            {
                version: '1.0.0',
                date: new Date(),
                type: 'added',
                description: '초기 API 버전 릴리스',
                breaking_change: false
            },
            {
                version: '1.1.0',
                date: new Date(Date.now() - 86400000),
                type: 'added',
                description: 'AI 심리학 분석 엔드포인트 추가',
                breaking_change: false
            },
            {
                version: '1.2.0',
                date: new Date(Date.now() - 172800000),
                type: 'changed',
                description: '응답 형식 개선 및 성능 최적화',
                breaking_change: false
            }
        );

        return changelog;
    }

    // 문서화 품질 검사
    private async checkDocumentationQuality(serviceName: string, documentation: APIDocumentation): Promise<void> {
        const qualityScore = this.calculateDocumentationQuality(documentation);

        if (qualityScore < 0.8) {
            await realTimeAIAlertSystem.createAlert({
                type: 'documentation',
                severity: 'medium',
                title: 'API 문서화 품질 경고',
                message: `${serviceName} API 문서화 품질이 ${(qualityScore * 100).toFixed(1)}%로 낮습니다. 개선이 필요합니다.`,
                source: 'documentation-system',
                metadata: { service_name: serviceName, quality_score: qualityScore }
            });
        }

        console.log(`📊 ${serviceName} 문서화 품질 점수: ${(qualityScore * 100).toFixed(1)}%`);
    }

    // 문서화 품질 계산
    private calculateDocumentationQuality(documentation: APIDocumentation): number {
        let score = 0;
        let totalChecks = 0;

        // 엔드포인트 문서화 완성도
        documentation.endpoints.forEach(endpoint => {
            totalChecks += 4;
            if (endpoint.description) score += 1;
            if (endpoint.parameters.length > 0) score += 1;
            if (endpoint.responses.length > 0) score += 1;
            if (endpoint.authentication.length > 0) score += 1;
        });

        // 스키마 문서화 완성도
        documentation.schemas.forEach(schema => {
            totalChecks += 3;
            if (schema.description) score += 1;
            if (schema.properties || schema.type) score += 1;
            if (schema.example) score += 1;
        });

        // 예제 문서화 완성도
        if (documentation.examples.length > 0) {
            totalChecks += 2;
            score += 1;
            if (documentation.examples.some(ex => ex.language === 'javascript')) score += 1;
        }

        // 변경 로그 완성도
        if (documentation.changelog.length > 0) {
            totalChecks += 1;
            score += 1;
        }

        return totalChecks > 0 ? score / totalChecks : 0;
    }

    // API 사용 통계 수집
    public async collectAPIUsageStats(): Promise<APIUsageStats[]> {
        const stats: APIUsageStats[] = [];

        // 실제로는 실제 API 로그에서 수집
        for (const [serviceName, documentation] of this.apiDocumentation.entries()) {
            documentation.endpoints.forEach(endpoint => {
                stats.push({
                    endpoint_id: endpoint.id,
                    total_requests: Math.floor(Math.random() * 10000) + 100,
                    success_rate: 0.85 + Math.random() * 0.1,
                    average_response_time: 200 + Math.random() * 300,
                    error_rate: 0.05 + Math.random() * 0.1,
                    last_used: new Date(Date.now() - Math.random() * 86400000),
                    unique_users: Math.floor(Math.random() * 1000) + 50
                });
            });
        }

        return stats;
    }

    // 문서화 메트릭 업데이트
    public async updateDocumentationMetrics(): Promise<DocumentationMetrics> {
        const totalEndpoints = Array.from(this.apiDocumentation.values())
            .reduce((sum, doc) => sum + doc.endpoints.length, 0);

        const documentedEndpoints = Array.from(this.apiDocumentation.values())
            .reduce((sum, doc) => sum + doc.endpoints.filter(ep => ep.description).length, 0);

        const deprecatedEndpoints = Array.from(this.apiDocumentation.values())
            .reduce((sum, doc) => sum + doc.endpoints.filter(ep => ep.deprecated).length, 0);

        const usageStats = await this.collectAPIUsageStats();
        const popularEndpoints = usageStats
            .sort((a, b) => b.total_requests - a.total_requests)
            .slice(0, 5)
            .map(stat => stat.endpoint_id);

        const metrics: DocumentationMetrics = {
            total_endpoints: totalEndpoints,
            documented_endpoints: documentedEndpoints,
            coverage_percentage: totalEndpoints > 0 ? (documentedEndpoints / totalEndpoints) * 100 : 0,
            last_documentation_update: new Date(),
            documentation_quality_score: this.calculateOverallQuality(),
            api_usage_statistics: usageStats,
            popular_endpoints: popularEndpoints,
            deprecated_endpoints: deprecatedEndpoints
        };

        this.documentationMetrics = metrics;
        this.emit('metrics_updated', metrics);

        return metrics;
    }

    // 전체 품질 계산
    private calculateOverallQuality(): number {
        if (this.apiDocumentation.size === 0) return 0;

        const qualities = Array.from(this.apiDocumentation.values())
            .map(doc => this.calculateDocumentationQuality(doc));

        return qualities.reduce((sum, quality) => sum + quality, 0) / qualities.length;
    }

    // 문서화 초기화
    private initializeDocumentation(): void {
        // 기본 서비스들에 대한 문서화 생성
        const services = [
            'integrated-ai-service',
            'ai-psychology-engine',
            'ai-security-system',
            'ai-cache-manager',
            'ai-alert-system',
            'ai-health-monitor',
            'ai-workflow-system',
            'ai-analytics-system',
            'ai-learning-system'
        ];

        services.forEach(service => {
            this.generateAPIDocumentation(service);
        });
    }

    // 문서화 업데이트 시작
    private startDocumentationUpdates(): void {
        this.documentationInterval = setInterval(async () => {
            // 주기적으로 문서화 품질 검사 및 업데이트
            for (const [serviceName, documentation] of this.apiDocumentation.entries()) {
                await this.checkDocumentationQuality(serviceName, documentation);
            }
        }, 3600000); // 1시간마다
    }

    // 메트릭 수집 시작
    private startMetricsCollection(): void {
        this.metricsInterval = setInterval(async () => {
            await this.updateDocumentationMetrics();
        }, 1800000); // 30분마다
    }

    // API 문서화 조회
    public getAPIDocumentation(serviceName: string): APIDocumentation | null {
        return this.apiDocumentation.get(serviceName) || null;
    }

    // 모든 API 문서화 조회
    public getAllAPIDocumentation(): APIDocumentation[] {
        return Array.from(this.apiDocumentation.values());
    }

    // 문서화 메트릭 조회
    public getDocumentationMetrics(): DocumentationMetrics | null {
        return this.documentationMetrics;
    }

    // 엔드포인트 검색
    public searchEndpoints(query: string): APIEndpoint[] {
        const results: APIEndpoint[] = [];
        const searchTerm = query.toLowerCase();

        for (const documentation of this.apiDocumentation.values()) {
            documentation.endpoints.forEach(endpoint => {
                if (endpoint.path.toLowerCase().includes(searchTerm) ||
                    endpoint.description.toLowerCase().includes(searchTerm) ||
                    endpoint.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                    results.push(endpoint);
                }
            });
        }

        return results;
    }

    // 서비스 종료
    public shutdown(): void {
        this.stop();
        this.apiDocumentation.clear();
        this.documentationMetrics = null;
        console.log('🔌 고급 AI 문서화 및 API 시스템이 종료되었습니다.');
    }
}

const advancedAIDocumentationAPISystem = new AdvancedAIDocumentationAPISystem();
export default advancedAIDocumentationAPISystem;
