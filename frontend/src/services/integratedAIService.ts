import advancedNLPEngine, { NLPAnalysisResult } from './advancedNLPEngine';
import webSearchIntegrationService, { IntegratedResponse } from './webSearchIntegrationService';
import { errorLogger, toError } from '../utils/errorLogger';
import multimodalAIService, { MultimodalInput, MultimodalResponse } from './multimodalAIService';
import advancedReasoningEngine, { ReasoningResult, ReasoningContext, Solution } from './advancedReasoningEngine';
import advancedResponseGenerationService, { ResponseGenerationRequest } from './advancedResponseGenerationService';
import realTimeAIPerformanceMonitor from './realTimeAIPerformanceMonitor';
import advancedUserExperienceAnalytics from './advancedUserExperienceAnalytics';
import advancedAIPsychologyEngine from './advancedAIPsychologyEngine';
import aiCacheManager from './aiCacheManager';
import realTimeAIAlertSystem from './realTimeAIAlertSystem';
import aiHealthMonitor from './aiHealthMonitor';
import advancedAISecuritySystem from './advancedAISecuritySystem';
import aiAutomationWorkflowSystem from './aiAutomationWorkflowSystem';
import advancedAIAnalyticsOptimizationSystem from './advancedAIAnalyticsOptimizationSystem';
import realTimeAILearningAdaptationSystem from './realTimeAILearningAdaptationSystem';
import advancedAIDocumentationAPISystem from './advancedAIDocumentationAPISystem';
import advancedAIGovernanceEthicalSystem from './advancedAIGovernanceEthicalSystem';
import advancedAIQualityAssuranceSystem from './advancedAIQualityAssuranceSystem';
import advancedAIModelLifecycleSystem from './advancedAIModelLifecycleSystem';
// import realTimeAIPredictiveAnalyticsEnhancementSystem from './realTimeAIPredictiveAnalyticsEnhancementSystem';
import realTimeAIMultimodalLearningSystem from './realTimeAIMultimodalLearningSystem';
import advancedAIDecisionSupportSystem from './advancedAIDecisionSupportSystem';
import realTimeAIEmotionRecognitionSystem from './realTimeAIEmotionRecognitionSystem';
import advancedAIKnowledgeGraphSystem from './advancedAIKnowledgeGraphSystem';
import realTimeAICollaborativeLearningSystem from './realTimeAICollaborativeLearningSystem';
import realTimeAIMultimodalCollaborationSystem from './realTimeAIMultimodalCollaborationSystem';
import advancedAITeamDynamicsSystem from './advancedAITeamDynamicsSystem';
import aiCollaborationWorkflowSystem from './aiCollaborationWorkflowSystem';
// import realTimeAICollaborationQualitySystem from './realTimeAICollaborationQualitySystem';
import aiMultimodalLearningPathOptimizationSystem from './aiMultimodalLearningPathOptimizationSystem';
import aiTeamCompositionOptimizationSystem from './aiTeamCompositionOptimizationSystem';
import aiProjectManagementOptimizationSystem from './aiProjectManagementOptimizationSystem';
import aiResourceAllocationOptimizationSystem from './aiResourceAllocationOptimizationSystem';

export interface AIRequest {
    id: string;
    user_id: string;
    session_id: string;
    input: AIInput;
    context?: AIContext;
    preferences?: UserPreferences;
    timestamp: Date;
}

export interface AIInput {
    text?: string;
    files?: File[];
    voice?: ArrayBuffer;
    images?: File[];
    documents?: File[];
    code?: string;
    metadata?: InputMetadata;
}

export interface InputMetadata {
    source: 'chat' | 'upload' | 'voice' | 'api';
    language?: string;
    intent_hint?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AIContext {
    conversation_history?: unknown[];
    current_project?: string;
    user_role?: string;
    domain_context?: string;
    time_constraints?: number;
    quality_requirements?: string[];
    ip_address?: string;
    user_agent?: string;
}

export interface UserPreferences {
    response_style: 'concise' | 'detailed' | 'technical' | 'friendly';
    language: string;
    expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferred_formats: string[];
    include_sources: boolean;
    include_alternatives: boolean;
    max_response_time: number;
}

export interface AIResponse {
    id: string;
    request_id: string;
    response_type: 'text' | 'multimodal' | 'structured' | 'interactive';
    content: AIResponseContent;
    metadata: ResponseMetadata;
    confidence_score: number;
    processing_time: number;
    timestamp: Date;
    cached?: boolean;
    success?: boolean;
    model_used?: string;
    personalized?: boolean;
    learning_insights?: unknown;
    alternatives?: unknown[];
    follow_up_questions?: string[];
    flags?: string[];
}

export interface AIResponseContent {
    primary_response: string;
    structured_data?: unknown;
    multimedia_elements?: MultimediaElement[];
    interactive_elements?: InteractiveElement[];
    follow_up_suggestions?: string[];
    related_resources?: ResourceLink[];
    length?: number;
    includes?: (searchString: string) => boolean;
    toLowerCase?: () => string;
}

export interface MultimediaElement {
    type: 'image' | 'chart' | 'diagram' | 'code' | 'table';
    content: string;
    caption?: string;
    metadata?: unknown;
}

export interface InteractiveElement {
    type: 'button' | 'form' | 'selection' | 'slider' | 'toggle';
    id: string;
    label: string;
    action: string;
    parameters?: unknown;
}

export interface ResourceLink {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'example' | 'tool' | 'reference';
    relevance_score: number;
}

export interface ResponseMetadata {
    processing_steps: ProcessingStep[];
    sources_used: string[];
    reasoning_path?: string[];
    alternatives_considered?: string[];
    limitations?: string[];
    next_steps?: string[];
}

export interface ProcessingStep {
    step: string;
    duration: number;
    success: boolean;
    details?: string;
}

export interface AICapabilities {
    natural_language: NLCapabilities;
    multimodal: MultimodalCapabilities;
    reasoning: ReasoningCapabilities;
    search: SearchCapabilities;
    integration: IntegrationCapabilities;
}

export interface NLCapabilities {
    languages: string[];
    max_context_length: number;
    sentiment_analysis: boolean;
    entity_extraction: boolean;
    intent_recognition: boolean;
    conversation_memory: boolean;
}

export interface MultimodalCapabilities {
    image_analysis: boolean;
    document_processing: boolean;
    code_analysis: boolean;
    audio_processing: boolean;
    video_processing: boolean;
    supported_formats: string[];
}

export interface ReasoningCapabilities {
    problem_solving: boolean;
    logical_reasoning: boolean;
    creative_thinking: boolean;
    decision_making: boolean;
    planning: boolean;
    learning: boolean;
}

export interface SearchCapabilities {
    web_search: boolean;
    real_time_data: boolean;
    specialized_databases: boolean;
    fact_checking: boolean;
    source_verification: boolean;
}

export interface IntegrationCapabilities {
    api_integration: boolean;
    database_access: boolean;
    external_tools: boolean;
    workflow_automation: boolean;
    custom_plugins: boolean;
}

class IntegratedAIService {
    private requestQueue: Map<string, AIRequest> = new Map();
    private responseCache: Map<string, AIResponse> = new Map();
    private userSessions: Map<string, SessionData> = new Map();
    private requestStartTimes: Map<string, number> = new Map();
    private performanceMetrics: PerformanceMetrics = {
        total_requests: 0,
        average_response_time: 0,
        success_rate: 0,
        user_satisfaction: 0
    };

    constructor() {
        this.initializeService();
    }

    // 메인 AI 처리 메서드
    async processAIRequest(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            // 보안 검증
            const securityValidation = await advancedAISecuritySystem.validateRequest({
                user_id: request.user_id,
                session_id: request.session_id,
                ip_address: request.context?.ip_address || 'unknown',
                user_agent: request.context?.user_agent || 'unknown',
                content: request.input.text || '',
                resource: 'ai_service',
                action: 'process_request'
            });

            if (!securityValidation.allowed) {
                return this.generateErrorResponse(request, new Error(`보안 검증 실패: ${securityValidation.reason}`), Date.now() - startTime);
            }

            // 캐시 확인
            const cacheKey = this.generateCacheKey(request);
            const cachedResponse = aiCacheManager.get<AIResponse>(cacheKey);

            if (cachedResponse) {
                errorLogger.info(`💾 캐시에서 응답 반환: ${cacheKey}`, {
                    component: 'integratedAIService',
                    action: 'processRequest',
                    cacheKey,
                });
                cachedResponse.processing_time = Date.now() - startTime;
                cachedResponse.cached = true;
                return cachedResponse;
            }

            // 1. 요청 전처리 및 검증
            await this.preprocessRequest(request);

            // 2. 사용자 세션 관리
            await this.manageUserSession(request);

            // 3. 입력 분석 및 라우팅
            const analysisResult = await this.analyzeInput(request);

            // 4. 통합 처리 파이프라인 실행
            const processingResult = await this.executeProcessingPipeline(request, analysisResult);

            // 5. 응답 생성 및 최적화
            const response = await this.generateOptimizedResponse(request, processingResult);

            // 6. 후처리 및 학습
            await this.postProcessAndLearn(request, response);

            const processingTime = Date.now() - startTime;
            response.processing_time = processingTime;

            // 응답 캐시 저장
            this.cacheResponse(cacheKey, response, request);

            // 성능 모니터링 및 사용자 경험 분석
            await this.recordPerformanceAndUserExperience(request, response, processingTime);

            return response;

        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI processing error', err, {
                component: 'integratedAIService',
                action: 'processRequest',
                requestId: request.id,
            });
            return this.generateErrorResponse(request, err, Date.now() - startTime);
        }
    }

    // 요청 전처리
    private async preprocessRequest(request: AIRequest): Promise<void> {
        // 입력 검증
        if (!request.input.text && !request.input.files?.length) {
            throw new Error('유효한 입력이 필요합니다.');
        }

        // 보안 검사
        await this.performSecurityCheck(request);

        // 성능 모니터링 시작
        const startTime = Date.now();
        this.requestStartTimes.set(request.id, startTime);

        // 요청 큐에 추가
        this.requestQueue.set(request.id, request);
    }

    // 보안 검사
    private async performSecurityCheck(request: AIRequest): Promise<void> {
        // 악성 입력 검사
        if (request.input.text) {
            const maliciousPatterns = [
                /script\s*>/i,
                /javascript:/i,
                /on\w+\s*=/i,
                /<iframe/i
            ];

            for (const pattern of maliciousPatterns) {
                if (pattern.test(request.input.text)) {
                    throw new Error('보안상 위험한 입력이 감지되었습니다.');
                }
            }
        }

        // 파일 검사
        if (request.input.files) {
            for (const file of request.input.files) {
                if (file.size > 50 * 1024 * 1024) { // 50MB 제한
                    throw new Error('파일 크기가 너무 큽니다.');
                }
            }
        }
    }

    // 사용자 세션 관리
    private async manageUserSession(request: AIRequest): Promise<void> {
        let session = this.userSessions.get(request.session_id);

        if (!session) {
            session = {
                session_id: request.session_id,
                user_id: request.user_id,
                created_at: new Date(),
                last_activity: new Date(),
                conversation_count: 0,
                context: {},
                preferences: request.preferences || this.getDefaultPreferences()
            };
        }

        session.last_activity = new Date();
        session.conversation_count++;

        this.userSessions.set(request.session_id, session);
    }

    // 입력 분석
    private async analyzeInput(request: AIRequest): Promise<InputAnalysisResult> {
        const results: InputAnalysisResult = {
            nlp_analysis: null,
            multimodal_analysis: null,
            input_classification: this.classifyInput(request.input),
            processing_strategy: 'standard'
        };

        // 텍스트 분석
        if (request.input.text) {
            results.nlp_analysis = await advancedNLPEngine.analyzeText(
                request.input.text,
                request.user_id,
                request.context as Record<string, unknown> | undefined
            );
        }

        // 멀티모달 분석
        if (request.input.files?.length || request.input.images?.length || request.input.documents?.length) {
            const multimodalInputs = this.prepareMultimodalInputs(request.input);
            results.multimodal_analysis = await multimodalAIService.processMultimodalInput(
                multimodalInputs,
                request.context as Record<string, unknown> | undefined
            );
        }

        // 처리 전략 결정
        results.processing_strategy = this.determineProcessingStrategy(results);

        return results;
    }

    // 입력 분류
    private classifyInput(input: AIInput): InputClassification {
        const classification: InputClassification = {
            primary_type: 'text',
            complexity: 'medium',
            requires_search: false,
            requires_reasoning: false,
            requires_multimodal: false
        };

        if (input.text) {
            // 복잡도 분석
            const wordCount = input.text.split(/\s+/).length;
            const hasQuestions = /\?|궁금|알려|설명/.test(input.text);
            const hasProblem = /문제|오류|해결|도와/.test(input.text);

            if (wordCount > 100 || hasProblem) {
                classification.complexity = 'high';
                classification.requires_reasoning = true;
            } else if (hasQuestions) {
                classification.requires_search = true;
            }
        }

        if (input.files?.length || input.images?.length || input.documents?.length) {
            classification.requires_multimodal = true;
            classification.primary_type = 'multimodal';
        }

        return classification;
    }

    // 멀티모달 입력 준비
    private prepareMultimodalInputs(input: AIInput): MultimodalInput[] {
        const inputs: MultimodalInput[] = [];

        if (input.images) {
            input.images.forEach(image => {
                inputs.push({
                    type: 'image',
                    content: image,
                    metadata: {
                        filename: image.name,
                        size: image.size,
                        format: image.type,
                        timestamp: new Date()
                    }
                });
            });
        }

        if (input.documents) {
            input.documents.forEach(doc => {
                inputs.push({
                    type: 'document',
                    content: doc,
                    metadata: {
                        filename: doc.name,
                        size: doc.size,
                        format: doc.type,
                        timestamp: new Date()
                    }
                });
            });
        }

        if (input.code) {
            inputs.push({
                type: 'code',
                content: input.code,
                metadata: {
                    timestamp: new Date()
                }
            });
        }

        return inputs;
    }

    // 처리 전략 결정
    private determineProcessingStrategy(analysis: InputAnalysisResult): ProcessingStrategy {
        if (analysis.input_classification.requires_reasoning) {
            return 'reasoning_focused';
        } else if (analysis.input_classification.requires_search) {
            return 'search_focused';
        } else if (analysis.input_classification.requires_multimodal) {
            return 'multimodal_focused';
        } else {
            return 'standard';
        }
    }

    // 통합 처리 파이프라인
    private async executeProcessingPipeline(
        request: AIRequest,
        analysis: InputAnalysisResult
    ): Promise<ProcessingResult> {
        const result: ProcessingResult = {
            nlp_result: analysis.nlp_analysis,
            search_result: null,
            multimodal_result: analysis.multimodal_analysis,
            reasoning_result: null,
            integration_insights: []
        };

        const processingSteps: ProcessingStep[] = [];

        try {
            // 웹 검색 실행 (필요한 경우)
            if (analysis.input_classification.requires_search && analysis.nlp_analysis) {
                const searchStart = Date.now();
                result.search_result = await webSearchIntegrationService.searchAndSynthesize(
                    request.input.text || '',
                    analysis.nlp_analysis,
                    request.context as Record<string, unknown> | undefined
                );
                processingSteps.push({
                    step: 'web_search',
                    duration: Date.now() - searchStart,
                    success: true,
                    details: `Found ${result.search_result.sources_used} sources`
                });
            }

            // 고급 추론 실행 (필요한 경우)
            if (analysis.input_classification.requires_reasoning) {
                const reasoningStart = Date.now();
                const reasoningContext = this.buildReasoningContext(request, analysis);
                result.reasoning_result = await advancedReasoningEngine.solveComplexProblem(
                    request.input.text || '',
                    reasoningContext,
                    {
                        nlpAnalysis: analysis.nlp_analysis || undefined,
                        searchResults: result.search_result || undefined,
                        multimodalData: analysis.multimodal_analysis || undefined
                    }
                );
                processingSteps.push({
                    step: 'reasoning',
                    duration: Date.now() - reasoningStart,
                    success: true,
                    details: `Generated ${result.reasoning_result.solutions.length} solutions`
                });
            }

            // 통합 인사이트 생성
            result.integration_insights = this.generateIntegrationInsights(result);

        } catch (error) {
            processingSteps.push({
                step: 'error_handling',
                duration: 0,
                success: false,
                details: (error as Error).message
            });
        }

        return result;
    }

    // 추론 컨텍스트 구성
    private buildReasoningContext(request: AIRequest, analysis: InputAnalysisResult): Partial<ReasoningContext> {
        const context: Partial<ReasoningContext> = {
            domain: analysis.nlp_analysis?.context.domain || 'general',
            complexity_level: analysis.input_classification.complexity === 'high' ? 8 :
                analysis.input_classification.complexity === 'medium' ? 5 : 3,
            user_expertise: request.preferences?.expertise_level || 'intermediate'
        };

        // 시간 제약 추가
        if (request.context?.time_constraints) {
            context.time_limit = request.context.time_constraints;
        }

        return context;
    }

    // 통합 인사이트 생성
    private generateIntegrationInsights(result: ProcessingResult): string[] {
        const insights: string[] = [];

        // NLP + 검색 결과 통합
        if (result.nlp_result && result.search_result) {
            insights.push('자연어 분석과 웹 검색 결과를 통합하여 포괄적인 답변을 제공했습니다.');
        }

        // 멀티모달 + 추론 통합
        if (result.multimodal_result && result.reasoning_result) {
            insights.push('이미지/문서 분석과 논리적 추론을 결합하여 심층적인 해결책을 도출했습니다.');
        }

        // 전체 신뢰도 평가
        const overallConfidence = this.calculateOverallConfidence(result);
        if (overallConfidence > 0.8) {
            insights.push('높은 신뢰도로 분석이 완료되었습니다.');
        } else if (overallConfidence < 0.6) {
            insights.push('일부 불확실한 요소가 있어 추가 정보가 도움이 될 수 있습니다.');
        }

        return insights;
    }

    // 전체 신뢰도 계산
    private calculateOverallConfidence(result: ProcessingResult): number {
        let totalConfidence = 0;
        let count = 0;

        if (result.nlp_result) {
            totalConfidence += result.nlp_result.sentiment.confidence;
            count++;
        }

        if (result.search_result) {
            totalConfidence += result.search_result.confidence_score;
            count++;
        }

        if (result.multimodal_result) {
            totalConfidence += result.multimodal_result.confidence_score;
            count++;
        }

        if (result.reasoning_result) {
            totalConfidence += result.reasoning_result.confidence_score;
            count++;
        }

        return count > 0 ? totalConfidence / count : 0.5;
    }

    // 최적화된 응답 생성
    private async generateOptimizedResponse(
        request: AIRequest,
        processingResult: ProcessingResult
    ): Promise<AIResponse> {
        const preferences = request.preferences || this.getDefaultPreferences();

        // 주요 응답 생성
        const primaryResponse = await this.generatePrimaryResponse(processingResult, preferences);

        // 구조화된 데이터 생성
        const structuredData = this.generateStructuredData(processingResult);

        // 멀티미디어 요소 생성
        const multimediaElements = this.generateMultimediaElements(processingResult);

        // 인터랙티브 요소 생성
        const interactiveElements = this.generateInteractiveElements(processingResult);

        // 후속 제안 생성
        const followUpSuggestions = this.generateFollowUpSuggestions(processingResult, preferences);

        // 관련 리소스 생성
        const relatedResources = this.generateRelatedResources(processingResult);

        const response: AIResponse = {
            id: `response-${Date.now()}`,
            request_id: request.id,
            response_type: this.determineResponseType(processingResult),
            content: {
                primary_response: primaryResponse,
                structured_data: structuredData,
                multimedia_elements: multimediaElements,
                interactive_elements: interactiveElements,
                follow_up_suggestions: followUpSuggestions,
                related_resources: relatedResources
            },
            metadata: {
                processing_steps: [],
                sources_used: this.extractSourcesUsed(processingResult),
                reasoning_path: processingResult.reasoning_result?.reasoning_chain.map(step => step.description),
                alternatives_considered: processingResult.reasoning_result?.solutions.map(sol => sol.title),
                limitations: this.identifyLimitations(processingResult),
                next_steps: this.suggestNextSteps(processingResult)
            },
            confidence_score: this.calculateOverallConfidence(processingResult),
            processing_time: 0, // 나중에 설정됨
            timestamp: new Date()
        };

        return response;
    }

    // 주요 응답 생성
    private async generatePrimaryResponse(
        result: ProcessingResult,
        preferences: UserPreferences
    ): Promise<string> {
        let response = '';

        // 추론 결과 우선
        if (result.reasoning_result) {
            const solution = result.reasoning_result.recommended_solution;
            response = `**추천 솔루션: ${solution.title}**\n\n${solution.description}\n\n`;

            if (preferences.response_style === 'detailed') {
                response += `**구현 접근법:**\n${solution.approach.methodology}\n\n`;
                response += `**주요 원칙:**\n${solution.approach.key_principles.map(p => `• ${p}`).join('\n')}\n\n`;
            }
        }

        // 검색 결과 통합
        if (result.search_result) {
            if (preferences.response_style !== 'concise') {
                response += `**검색 기반 정보:**\n${result.search_result.primary_answer}\n\n`;
            }
        }

        // 멀티모달 결과 통합
        if (result.multimodal_result) {
            const insights = result.multimodal_result.integrated_insights;
            if (insights.length > 0) {
                response += `**분석 결과:**\n${insights.map(i => `• ${i}`).join('\n')}\n\n`;
            }
        }

        // NLP 결과 기반 기본 응답
        if (!response && result.nlp_result) {
            response = this.generateBasicNLPResponse(result.nlp_result, preferences);
        }

        return response || '죄송합니다. 적절한 응답을 생성할 수 없습니다.';
    }

    // 기본 NLP 응답 생성
    private generateBasicNLPResponse(nlpResult: NLPAnalysisResult, _preferences: UserPreferences): string {
        const strategy = nlpResult.response_strategy;

        let response = '요청을 분석한 결과를 말씀드리겠습니다.\n\n';

        if (strategy.detail_level === 'detailed') {
            response += `**분석된 의도:** ${nlpResult.intent}\n`;
            response += `**주요 주제:** ${nlpResult.topics.join(', ')}\n`;
            response += `**감정 분석:** ${nlpResult.sentiment.label} (신뢰도: ${(nlpResult.sentiment.confidence * 100).toFixed(1)}%)\n\n`;
        }

        response += '더 구체적인 도움이 필요하시면 추가 정보를 제공해 주세요.';

        return response;
    }

    // 응답 타입 결정
    private determineResponseType(result: ProcessingResult): AIResponse['response_type'] {
        if (result.multimodal_result || result.reasoning_result?.solutions.length) {
            return 'multimodal';
        } else if (result.reasoning_result || result.search_result) {
            return 'structured';
        } else {
            return 'text';
        }
    }

    // 구조화된 데이터 생성
    private generateStructuredData(result: ProcessingResult): Record<string, unknown> | undefined {
        const data: Record<string, unknown> = {};

        if (result.reasoning_result) {
            data.solutions = result.reasoning_result.solutions.map(sol => ({
                title: sol.title,
                success_probability: sol.success_probability,
                timeline: sol.timeline.total_duration,
                key_benefits: sol.approach.key_principles
            }));
        }

        if (result.search_result) {
            data.search_summary = {
                sources_count: result.search_result.sources_used,
                confidence: result.search_result.confidence_score,
                related_topics: result.search_result.related_topics
            };
        }

        return Object.keys(data).length > 0 ? data : undefined;
    }

    // 멀티미디어 요소 생성
    private generateMultimediaElements(result: ProcessingResult): MultimediaElement[] {
        const elements: MultimediaElement[] = [];

        if (result.reasoning_result) {
            // 솔루션 비교 테이블
            const solutions = result.reasoning_result.solutions;
            if (solutions.length > 1) {
                const tableContent = this.generateSolutionComparisonTable(solutions);
                elements.push({
                    type: 'table',
                    content: tableContent,
                    caption: '솔루션 비교 분석'
                });
            }
        }

        if (result.multimodal_result?.analysis_results.code) {
            // 코드 분석 결과
            const codeAnalysis = result.multimodal_result.analysis_results.code;
            elements.push({
                type: 'code',
                content: JSON.stringify(codeAnalysis.quality_metrics, null, 2),
                caption: '코드 품질 메트릭'
            });
        }

        return elements;
    }

    // 솔루션 비교 테이블 생성
    private generateSolutionComparisonTable(solutions: Solution[]): string {
        let table = '| 솔루션 | 성공 확률 | 소요 시간 | 위험도 |\n';
        table += '|--------|-----------|-----------|--------|\n';

        solutions.forEach(sol => {
            const avgRisk = sol.risks.reduce((sum, risk) => {
                const riskValue = { low: 1, medium: 2, high: 3, critical: 4 }[risk.impact];
                return sum + riskValue;
            }, 0) / sol.risks.length;

            const riskLevel = avgRisk <= 1.5 ? '낮음' : avgRisk <= 2.5 ? '보통' : '높음';

            table += `| ${sol.title} | ${(sol.success_probability * 100).toFixed(1)}% | ${sol.timeline.total_duration}주 | ${riskLevel} |\n`;
        });

        return table;
    }

    // 인터랙티브 요소 생성
    private generateInteractiveElements(result: ProcessingResult): InteractiveElement[] {
        const elements: InteractiveElement[] = [];

        if (result.reasoning_result && result.reasoning_result.solutions.length > 1) {
            elements.push({
                type: 'selection',
                id: 'solution-selector',
                label: '선호하는 솔루션을 선택하세요',
                action: 'select_solution',
                parameters: {
                    options: result.reasoning_result.solutions.map(sol => ({
                        id: sol.id,
                        label: sol.title
                    }))
                }
            });
        }

        if (result.search_result && result.search_result.follow_up_questions.length > 0) {
            elements.push({
                type: 'button',
                id: 'explore-more',
                label: '더 자세히 알아보기',
                action: 'explore_topic',
                parameters: {
                    questions: result.search_result.follow_up_questions
                }
            });
        }

        return elements;
    }

    // 후속 제안 생성
    private generateFollowUpSuggestions(
        result: ProcessingResult,
        _preferences: UserPreferences
    ): string[] {
        const suggestions: string[] = [];

        if (result.reasoning_result) {
            suggestions.push('선택한 솔루션의 상세 구현 계획을 요청하세요');
            suggestions.push('다른 솔루션 대안에 대해 더 알아보세요');
        }

        if (result.search_result) {
            suggestions.push(...result.search_result.follow_up_questions);
        }

        if (result.multimodal_result) {
            suggestions.push(...result.multimodal_result.next_steps);
        }

        return suggestions.slice(0, 5); // 최대 5개
    }

    // 관련 리소스 생성
    private generateRelatedResources(result: ProcessingResult): ResourceLink[] {
        const resources: ResourceLink[] = [];

        if (result.search_result) {
            result.search_result.supporting_evidence.forEach(evidence => {
                resources.push({
                    title: evidence.title,
                    url: evidence.url,
                    type: evidence.source_type as ResourceLink['type'],
                    relevance_score: evidence.relevance_score
                });
            });
        }

        return resources;
    }

    // 사용된 소스 추출
    private extractSourcesUsed(result: ProcessingResult): string[] {
        const sources: string[] = [];

        if (result.search_result) {
            sources.push(`웹 검색 (${result.search_result.sources_used}개 소스)`);
        }

        if (result.multimodal_result) {
            sources.push('멀티모달 AI 분석');
        }

        if (result.reasoning_result) {
            sources.push('고급 추론 엔진');
        }

        if (result.nlp_result) {
            sources.push('자연어 처리 엔진');
        }

        return sources;
    }

    // 제한사항 식별
    private identifyLimitations(result: ProcessingResult): string[] {
        const limitations: string[] = [];

        const overallConfidence = this.calculateOverallConfidence(result);
        if (overallConfidence < 0.7) {
            limitations.push('일부 분석 결과의 신뢰도가 제한적입니다');
        }

        if (result.search_result && result.search_result.sources_used < 3) {
            limitations.push('제한된 검색 결과로 인해 정보가 부족할 수 있습니다');
        }

        if (!result.search_result && !result.reasoning_result) {
            limitations.push('실시간 정보나 복잡한 추론이 제한적입니다');
        }

        return limitations;
    }

    // 다음 단계 제안
    private suggestNextSteps(result: ProcessingResult): string[] {
        const nextSteps: string[] = [];

        if (result.reasoning_result) {
            nextSteps.push('선택한 솔루션의 구현 계획을 수립하세요');
            nextSteps.push('이해관계자들과 솔루션을 검토하세요');
        }

        if (result.multimodal_result) {
            nextSteps.push(...result.multimodal_result.next_steps);
        }

        nextSteps.push('결과에 대한 피드백을 제공하여 개선에 도움을 주세요');

        return nextSteps;
    }

    // 후처리 및 학습
    private async postProcessAndLearn(request: AIRequest, response: AIResponse): Promise<void> {
        // 대화 메모리 업데이트
        if (request.input.text && response.content.primary_response) {
            advancedNLPEngine.updateConversationMemory(request.user_id, {
                id: `msg-${Date.now()}`,
                content: request.input.text,
                role: 'user',
                timestamp: request.timestamp,
                chatId: request.session_id || 'default'
            });

            advancedNLPEngine.updateConversationMemory(request.user_id, {
                id: `msg-${Date.now() + 1}`,
                content: response.content.primary_response,
                role: 'assistant',
                timestamp: response.timestamp,
                chatId: request.session_id || 'default'
            });
        }

        // 응답 캐시 저장
        this.responseCache.set(response.id, response);

        // 요청 큐에서 제거
        this.requestQueue.delete(request.id);
    }

    // 오류 응답 생성
    private generateErrorResponse(request: AIRequest, error: Error, processingTime: number): AIResponse {
        return {
            id: `error-response-${Date.now()}`,
            request_id: request.id,
            response_type: 'text',
            content: {
                primary_response: `죄송합니다. 요청 처리 중 오류가 발생했습니다: ${error.message}`,
                follow_up_suggestions: [
                    '다시 시도해보세요',
                    '더 구체적인 질문을 해주세요',
                    '기술 지원팀에 문의하세요'
                ]
            },
            metadata: {
                processing_steps: [{
                    step: 'error_handling',
                    duration: processingTime,
                    success: false,
                    details: error.message
                }],
                sources_used: [],
                limitations: ['오류로 인해 정상적인 처리가 불가능했습니다']
            },
            confidence_score: 0.1,
            processing_time: processingTime,
            timestamp: new Date()
        };
    }

    // 성능 메트릭 업데이트
    private updatePerformanceMetrics(request: AIRequest, response: AIResponse, processingTime: number): void {
        this.performanceMetrics.total_requests++;

        const currentAvg = this.performanceMetrics.average_response_time;
        const totalRequests = this.performanceMetrics.total_requests;
        this.performanceMetrics.average_response_time =
            (currentAvg * (totalRequests - 1) + processingTime) / totalRequests;

        const isSuccess = response.confidence_score > 0.5;
        const currentSuccessRate = this.performanceMetrics.success_rate;
        this.performanceMetrics.success_rate =
            (currentSuccessRate * (totalRequests - 1) + (isSuccess ? 1 : 0)) / totalRequests;
    }

    // 기본 사용자 설정
    private getDefaultPreferences(): UserPreferences {
        return {
            response_style: 'detailed',
            language: 'ko',
            expertise_level: 'intermediate',
            preferred_formats: ['text', 'structured'],
            include_sources: true,
            include_alternatives: true,
            max_response_time: 30000
        };
    }

    // 서비스 초기화
    private initializeService(): void {
        errorLogger.info('🚀 통합 AI 서비스 초기화 중...', {
            component: 'integratedAIService',
            action: 'initializeService',
        });

        try {
            // 캐시 매니저 시작
            aiCacheManager.start();

            // 알림 시스템 시작
            realTimeAIAlertSystem.start();

            // 헬스 모니터 시작 및 서비스 등록
            aiHealthMonitor.start();
            aiHealthMonitor.registerService('integrated-ai-service');
            aiHealthMonitor.registerService('ai-psychology-engine');
            aiHealthMonitor.registerService('ai-predictive-analytics');
            aiHealthMonitor.registerService('performance-monitor');
            aiHealthMonitor.registerService('cache-manager');
            aiHealthMonitor.registerService('alert-system');

            // 보안 시스템 시작
            advancedAISecuritySystem.start();

            // 자동화 워크플로우 시스템 시작
            aiAutomationWorkflowSystem.start();

            // AI 분석 및 최적화 시스템 시작
            advancedAIAnalyticsOptimizationSystem.start();

            // 실시간 AI 학습 및 적응 시스템 시작
            realTimeAILearningAdaptationSystem.start();

            // 고급 AI 문서화 및 API 시스템 시작
            advancedAIDocumentationAPISystem.start();

            // 고급 AI 거버넌스 및 윤리 AI 시스템 시작
            advancedAIGovernanceEthicalSystem.start();

            // 고급 AI 품질 보증 및 테스트 자동화 시스템 시작
            advancedAIQualityAssuranceSystem.start();

            // 고급 AI 모델 생명주기 관리 시스템 시작
            advancedAIModelLifecycleSystem.start();

            // 실시간 AI 예측 분석 고도화 시스템 시작
            // realTimeAIPredictiveAnalyticsEnhancementSystem.start();

            // 실시간 AI 멀티모달 학습 시스템 시작
            realTimeAIMultimodalLearningSystem.start();

            // 고급 AI 의사결정 지원 시스템 시작
            advancedAIDecisionSupportSystem.start();

            // 실시간 AI 감정 인식 및 대응 시스템 시작
            realTimeAIEmotionRecognitionSystem.start();

            // 고급 AI 지식 그래프 시스템 시작
            advancedAIKnowledgeGraphSystem.start();

            // 실시간 AI 협업 학습 시스템 시작
            realTimeAICollaborativeLearningSystem.start();

            // 실시간 AI 멀티모달 협업 시스템 시작
            realTimeAIMultimodalCollaborationSystem.start();

            // 고급 AI 팀 역학 분석 시스템 시작
            advancedAITeamDynamicsSystem.start();

            // AI 기반 협업 워크플로우 자동화 시스템 시작
            aiCollaborationWorkflowSystem.start();

            // 실시간 AI 협업 품질 보증 시스템 시작
            // realTimeAICollaborationQualitySystem.start();

            // AI 멀티모달 학습 경로 최적화 시스템 시작
            aiMultimodalLearningPathOptimizationSystem.start();

            // AI 팀 구성 최적화 시스템 시작
            aiTeamCompositionOptimizationSystem.start();

            // AI 프로젝트 관리 최적화 시스템 시작
            aiProjectManagementOptimizationSystem.start();

            // AI 리소스 할당 최적화 시스템 시작
            aiResourceAllocationOptimizationSystem.start();

            errorLogger.info('🔧 모든 하위 시스템이 시작되었습니다.', {
                component: 'integratedAIService',
                action: 'initializeService',
            });

        } catch (error) {
            const err = toError(error);
            errorLogger.error('❌ 서비스 초기화 오류', err, {
                component: 'integratedAIService',
                action: 'initializeService',
            });
        }

        // 정기적인 캐시 정리 (1시간마다)
        setInterval(() => {
            this.cleanupCache();
        }, 60 * 60 * 1000);

        // 세션 정리 (24시간 비활성 세션)
        setInterval(() => {
            this.cleanupInactiveSessions();
        }, 60 * 60 * 1000);

        errorLogger.info('✅ 통합 AI 서비스 초기화 완료', {
            component: 'integratedAIService',
            action: 'initializeService',
        });
    }

    // 캐시 정리
    private cleanupCache(): void {
        const maxCacheSize = 1000;
        if (this.responseCache.size > maxCacheSize) {
            const entries = Array.from(this.responseCache.entries());
            entries.sort((a, b) => {
                const timestampA = a[1].timestamp instanceof Date ? a[1].timestamp : new Date(a[1].timestamp);
                const timestampB = b[1].timestamp instanceof Date ? b[1].timestamp : new Date(b[1].timestamp);
                return timestampB.getTime() - timestampA.getTime();
            });

            // 오래된 항목 삭제
            for (let i = maxCacheSize; i < entries.length; i++) {
                this.responseCache.delete(entries[i][0]);
            }
        }
    }

    // 비활성 세션 정리
    private cleanupInactiveSessions(): void {
        const now = new Date();
        const maxInactiveTime = 24 * 60 * 60 * 1000; // 24시간

        for (const [sessionId, session] of this.userSessions.entries()) {
            if (now.getTime() - session.last_activity.getTime() > maxInactiveTime) {
                this.userSessions.delete(sessionId);
            }
        }
    }

    // 공개 메서드들
    async quickResponse(text: string, userId: string = 'anonymous'): Promise<string> {
        const request: AIRequest = {
            id: `quick-${Date.now()}`,
            user_id: userId,
            session_id: `session-${userId}`,
            input: { text },
            timestamp: new Date()
        };

        const response = await this.processAIRequest(request);
        return response.content.primary_response;
    }

    getCapabilities(): AICapabilities {
        return {
            natural_language: {
                languages: ['ko', 'en', 'ja', 'zh'],
                max_context_length: 4000,
                sentiment_analysis: true,
                entity_extraction: true,
                intent_recognition: true,
                conversation_memory: true
            },
            multimodal: {
                image_analysis: true,
                document_processing: true,
                code_analysis: true,
                audio_processing: false,
                video_processing: false,
                supported_formats: ['jpg', 'png', 'pdf', 'docx', 'txt', 'md', 'js', 'ts', 'py']
            },
            reasoning: {
                problem_solving: true,
                logical_reasoning: true,
                creative_thinking: true,
                decision_making: true,
                planning: true,
                learning: true
            },
            search: {
                web_search: true,
                real_time_data: true,
                specialized_databases: false,
                fact_checking: true,
                source_verification: true
            },
            integration: {
                api_integration: true,
                database_access: false,
                external_tools: false,
                workflow_automation: true,
                custom_plugins: false
            }
        };
    }

    getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    getUserSession(sessionId: string): SessionData | undefined {
        return this.userSessions.get(sessionId);
    }

    clearUserSession(sessionId: string): void {
        this.userSessions.delete(sessionId);
    }

    getActiveSessionsCount(): number {
        return this.userSessions.size;
    }

    getCacheSize(): number {
        return this.responseCache.size;
    }

    // 고급 응답 생성 메서드
    async generateResponse(userInput: string, context: Record<string, unknown>): Promise<Record<string, unknown>> {
        try {
            const startTime = Date.now();

            // 1. 고급 질문 이해
            const understandingResult = await this.advancedQuestionUnderstanding(userInput);

            // 2. 응답 생성 요청 구성
            const responseRequest: ResponseGenerationRequest = {
                user_input: userInput,
                user_id: (context.user_id as string) ?? '',
                session_id: (context.session_id as string) ?? '',
                conversation_memory: context.conversation_memory as ResponseGenerationRequest['conversation_memory'],
                learning_experience: context.learning_experience as ResponseGenerationRequest['learning_experience'],
                understanding_result: understandingResult as unknown as ResponseGenerationRequest['understanding_result'],
                context
            };

            // 3. 고급 응답 생성
            const responseResult = await advancedResponseGenerationService.generateResponse(responseRequest);

            // 4. 메타데이터 추가
            const processingTime = Date.now() - startTime;

            return {
                content: responseResult.content,
                learning_insights: responseResult.learning_insights,
                processing_time: processingTime,
                model_used: responseResult.metadata.model_used,
                confidence_score: responseResult.confidence_score,
                flags: ['personalized', 'memory_integrated'],
                personalized: responseResult.personalized_content,
                memory_integrated: responseResult.memory_integrated,
                alternatives: responseResult.alternatives,
                follow_up_questions: responseResult.follow_up_questions
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('Advanced response generation error', err, {
                component: 'integratedAIService',
                action: 'advancedResponseGeneration',
            });

            // 폴백 응답
            return {
                content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 다시 시도해주세요.',
                learning_insights: null,
                processing_time: 0,
                model_used: 'fallback',
                confidence_score: 0.1,
                flags: ['error'],
                personalized: false,
                memory_integrated: false,
                alternatives: [],
                follow_up_questions: ['다시 시도해보시겠어요?']
            };
        }
    }

    // 고급 질문 이해 메서드
    private async advancedQuestionUnderstanding(userInput: string): Promise<Record<string, unknown>> {
        try {
            // 기본 NLP 분석
            const nlpResult = await advancedNLPEngine.analyzeText(userInput);

            // 질문 이해 엔진 사용 (간단한 버전)
            const understanding = {
                semantic_analysis: {
                    core_concepts: nlpResult.entities.map((entity) => ({
                        concept: entity.text,
                        type: entity.label,
                        confidence: entity.confidence
                    })),
                    domain_classification: {
                        primary_domain: this.classifyDomain(userInput),
                        confidence: 0.8
                    },
                    complexity_assessment: {
                        overall_complexity: this.assessComplexity(userInput),
                        factors: []
                    }
                },
                intent_clarification: {
                    primary_intent: this.classifyIntent(userInput),
                    confidence: 0.7
                },
                confidence_score: 0.75
            };

            return understanding;

        } catch (error) {
            const err = toError(error);
            errorLogger.error('Question understanding error', err, {
                component: 'integratedAIService',
                action: 'advancedQuestionUnderstanding',
            });
            return {
                semantic_analysis: {
                    core_concepts: [],
                    domain_classification: { primary_domain: 'general', confidence: 0.5 },
                    complexity_assessment: { overall_complexity: 5, factors: [] }
                },
                intent_clarification: { primary_intent: 'general', confidence: 0.5 },
                confidence_score: 0.5
            };
        }
    }

    // 도메인 분류
    private classifyDomain(input: string): string {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('react') || lowerInput.includes('javascript') || lowerInput.includes('html') || lowerInput.includes('css')) {
            return 'web_development';
        }
        if (lowerInput.includes('function') || lowerInput.includes('class') || lowerInput.includes('algorithm')) {
            return 'programming';
        }
        if (lowerInput.includes('database') || lowerInput.includes('sql') || lowerInput.includes('query')) {
            return 'database';
        }
        if (lowerInput.includes('ai') || lowerInput.includes('machine learning') || lowerInput.includes('neural')) {
            return 'ai_ml';
        }

        return 'general';
    }

    // 복잡도 평가
    private assessComplexity(input: string): number {
        const words = input.split(' ').length;
        const hasTechnicalTerms = /(function|class|api|database|algorithm|optimize|architecture)/i.test(input);
        const hasQuestions = input.includes('?') || input.includes('어떻게') || input.includes('왜');

        let complexity = 5; // 기본값

        if (words > 20) complexity += 2;
        if (hasTechnicalTerms) complexity += 2;
        if (hasQuestions) complexity += 1;

        return Math.min(10, Math.max(1, complexity));
    }

    // 의도 분류
    private classifyIntent(input: string): string {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('어떻게') || lowerInput.includes('방법') || lowerInput.includes('tutorial')) {
            return 'learning';
        }
        if (lowerInput.includes('문제') || lowerInput.includes('error') || lowerInput.includes('fix')) {
            return 'problem_solving';
        }
        if (lowerInput.includes('분석') || lowerInput.includes('compare') || lowerInput.includes('차이')) {
            return 'analysis';
        }
        if (lowerInput.includes('안녕') || lowerInput.includes('hello') || lowerInput.includes('감사')) {
            return 'conversation';
        }

        return 'general';
    }

    // 성능 모니터링 및 사용자 경험 분석
    private async recordPerformanceAndUserExperience(request: AIRequest, response: AIResponse, processingTime: number): Promise<void> {
        // 성능 메트릭 기록
        realTimeAIPerformanceMonitor.recordResponseTime(
            'integrated_ai_service',
            processingTime,
            {
                user_id: request.user_id,
                session_id: request.session_id,
                request_type: request.input.text ? 'text' : 'multimodal',
                model_used: response.model_used || 'integrated'
            }
        );

        // 사용자 만족도 기록 (시뮬레이션)
        const satisfaction = this.calculateUserSatisfaction(response, processingTime);
        realTimeAIPerformanceMonitor.recordSatisfaction(
            request.user_id,
            request.session_id,
            satisfaction,
            {
                service: 'integrated_ai_service',
                request_type: request.input.text ? 'text' : 'multimodal'
            }
        );

        // 사용자 행동 패턴 분석
        const interactionData = {
            session_duration: processingTime / 1000, // 초 단위
            interaction_count: 1,
            response_times: [processingTime],
            complexity_scores: [this.assessComplexity(request.input.text || '')],
            topics: this.extractTopics(request.input.text || '')
        };
        advancedUserExperienceAnalytics.analyzeUserBehavior(
            request.user_id,
            request.session_id,
            interactionData
        );

        // 사용자 참여도 분석
        const engagementData = {
            session_duration: processingTime / 1000,
            interaction_count: 1,
            response_time: processingTime,
            topic_switches: 0,
            satisfaction_score: satisfaction,
            started_tasks: 1,
            completed_tasks: response.success ? 1 : 0
        };
        advancedUserExperienceAnalytics.analyzeUserEngagement(
            request.user_id,
            request.session_id,
            engagementData
        );

        // 사용자 만족도 분석
        const satisfactionData = {
            overall_satisfaction: satisfaction,
            satisfaction_factors: {
                response_quality: this.assessResponseQuality(response),
                response_speed: this.assessResponseSpeed(processingTime),
                personalization: this.assessPersonalization(response),
                learning_effectiveness: this.assessLearningEffectiveness(response),
                interface_usability: 4.0, // 기본값
                content_relevance: this.assessContentRelevance(request, response)
            }
        };
        advancedUserExperienceAnalytics.analyzeUserSatisfaction(
            request.user_id,
            request.session_id,
            satisfactionData
        );

        // 학습 효과성 분석
        const learningData = {
            knowledge_retention: this.assessKnowledgeRetention(response),
            skill_improvement: this.assessSkillImprovement(response),
            confidence_level: this.assessConfidenceLevel(response),
            current_level: 1,
            milestones_achieved: response.success ? 1 : 0
        };
        advancedUserExperienceAnalytics.analyzeLearningEffectiveness(
            request.user_id,
            request.session_id,
            learningData
        );

        // AI 심리학 분석
        await this.performPsychologicalAnalysis(request, response, processingTime);

        // 기존 성능 메트릭 업데이트
        this.updatePerformanceMetrics(request, response, processingTime);
    }

    // 사용자 만족도 계산
    private calculateUserSatisfaction(response: AIResponse, processingTime: number): number {
        let satisfaction = 4.0; // 기본값

        // 응답 시간에 따른 조정
        if (processingTime < 1000) satisfaction += 0.5;
        else if (processingTime < 3000) satisfaction += 0.2;
        else if (processingTime > 10000) satisfaction -= 0.5;

        // 응답 품질에 따른 조정
        if (response.success) satisfaction += 0.3;
        else satisfaction -= 0.5;

        // 응답 길이에 따른 조정
        if (response.content?.primary_response && response.content.primary_response.length > 100) satisfaction += 0.2;

        return Math.min(5.0, Math.max(1.0, satisfaction));
    }

    // 응답 품질 평가
    private assessResponseQuality(response: AIResponse): number {
        if (!response.success) return 2.0;
        if (response.content?.primary_response && response.content.primary_response.length > 200) return 4.5;
        if (response.content?.primary_response && response.content.primary_response.length > 100) return 4.0;
        return 3.5;
    }

    // 응답 속도 평가
    private assessResponseSpeed(processingTime: number): number {
        if (processingTime < 1000) return 5.0;
        if (processingTime < 3000) return 4.0;
        if (processingTime < 5000) return 3.0;
        return 2.0;
    }

    // 개인화 수준 평가
    private assessPersonalization(response: AIResponse): number {
        if (response.personalized) return 4.5;
        if (response.flags && response.flags.includes('personalized')) return 4.0;
        return 3.0;
    }

    // 학습 효과성 평가
    private assessLearningEffectiveness(response: AIResponse): number {
        if (response.learning_insights) return 4.5;
        if (response.content?.primary_response && response.content.primary_response.includes('학습')) return 4.0;
        return 3.5;
    }

    // 콘텐츠 관련성 평가
    private assessContentRelevance(request: AIRequest, response: AIResponse): number {
        if (!request.input.text || !response.content?.primary_response) return 3.0;

        const requestWords = request.input.text.toLowerCase().split(' ');
        const responseWords = response.content.primary_response.toLowerCase().split(' ');
        const commonWords = requestWords.filter(word => responseWords.includes(word));

        return Math.min(5.0, 3.0 + (commonWords.length * 0.5));
    }

    // 지식 보존률 평가
    private assessKnowledgeRetention(response: AIResponse): number {
        if (response.learning_insights) return 4.0;
        if (response.content?.primary_response && response.content.primary_response.length > 300) return 3.5;
        return 3.0;
    }

    // 기술 향상도 평가
    private assessSkillImprovement(response: AIResponse): number {
        if (response.content?.primary_response && response.content.primary_response.includes('실습')) return 4.0;
        if (response.content?.primary_response && response.content.primary_response.includes('연습')) return 3.5;
        return 3.0;
    }

    // 신뢰도 수준 평가
    private assessConfidenceLevel(response: AIResponse): number {
        if (response.confidence_score && response.confidence_score > 0.8) return 4.5;
        if (response.confidence_score && response.confidence_score > 0.6) return 4.0;
        return 3.5;
    }

    // 주제 추출
    private extractTopics(text: string): string[] {
        const topics: string[] = [];
        const technicalTerms = ['react', 'javascript', 'python', 'ai', 'machine learning', 'database', 'api'];

        technicalTerms.forEach(term => {
            if (text.toLowerCase().includes(term)) {
                topics.push(term);
            }
        });

        return topics;
    }

    // AI 심리학 분석 수행
    private async performPsychologicalAnalysis(request: AIRequest, response: AIResponse, processingTime: number): Promise<void> {
        // 상호작용 데이터 준비
        const interactionData = {
            text: request.input.text,
            response_time: processingTime,
            response_quality: this.assessResponseQuality(response),
            response_success: response.success,
            response_length: response.content?.length || 0,
            interaction_patterns: {
                rapid_responses: processingTime < 1000,
                repeated_questions: false, // 실제로는 이전 대화에서 확인
                short_responses: (response.content?.length || 0) < 50,
                long_detailed_responses: (response.content?.length || 0) > 200
            },
            complexity_scores: [this.assessComplexity(request.input.text || '')],
            topics: this.extractTopics(request.input.text || ''),
            response_times: [processingTime],
            errors: response.success ? [] : ['response_error'],
            repetition_requests: 0,
            topic_switches: 0,
            frustration_signals: response.success ? 0 : 1,
            follow_up_questions: 0,
            deep_diving: 0,
            performance_focus: 0,
            confidence_signals: response.confidence_score || 0.5,
            difficulty_level: this.assessComplexity(request.input.text || ''),
            learning_progress: response.learning_insights ? 1 : 0,
            positive_feedback: response.success ? 1 : 0,
            interesting_content: response.content?.primary_response?.includes('흥미') ? 1 : 0,
            social_interaction: 0,
            achievement_recognition: response.success ? 1 : 0,
            rapid_typing: false,
            short_responses: (response.content?.primary_response?.length || 0) < 50,
            topic_avoidance: false,
            repeated_questions: false,
            negative_language: this.detectNegativeLanguage(request.input.text || ''),
            time_pressure: processingTime > 10000,
            positive_outcome_expectation: response.success,
            visual_preferences: false,
            auditory_preferences: false,
            kinesthetic_preferences: false,
            reading_preferences: true,
            direct_communication: false,
            detailed_explanations: (response.content?.primary_response?.length || 0) > 100,
            technical_communication: this.detectTechnicalContent(response.content?.primary_response || ''),
            analytical_approach: this.detectAnalyticalContent(response.content?.primary_response || ''),
            intuitive_approach: false,
            collaborative_approach: false,
            systematic_approach: this.detectSystematicContent(response.content?.primary_response || ''),
            risk_averse_behavior: false,
            risk_seeking_behavior: false,
            adaptability_signals: 1,
            persistence_signals: 1
        };

        // 감정 상태 분석
        advancedAIPsychologyEngine.analyzeEmotionalState(
            request.user_id,
            request.session_id,
            interactionData
        );

        // 인지 부하 분석
        advancedAIPsychologyEngine.analyzeCognitiveLoad(
            request.user_id,
            request.session_id,
            interactionData
        );

        // 학습 동기 분석
        advancedAIPsychologyEngine.analyzeLearningMotivation(
            request.user_id,
            request.session_id,
            interactionData
        );

        // 스트레스 레벨 분석
        advancedAIPsychologyEngine.analyzeStressLevel(
            request.user_id,
            request.session_id,
            interactionData
        );

        // 성격 인사이트 분석
        advancedAIPsychologyEngine.analyzePersonalityInsights(
            request.user_id,
            request.session_id,
            interactionData
        );
    }

    // 부정적 언어 감지
    private detectNegativeLanguage(text: string): boolean {
        const negativeWords = ['싫어', '화나', '짜증', '힘들어', '어려워', '실패', '실망', '답답해', '지겨워', '안돼', '못해'];
        return negativeWords.some(word => text.toLowerCase().includes(word));
    }

    // 기술적 콘텐츠 감지
    private detectTechnicalContent(content: string): boolean {
        const technicalTerms = ['function', 'class', 'api', 'database', 'algorithm', 'optimize', 'architecture', 'framework', 'library'];
        return technicalTerms.some(term => content.toLowerCase().includes(term));
    }

    // 분석적 콘텐츠 감지
    private detectAnalyticalContent(content: string): boolean {
        const analyticalTerms = ['분석', '비교', '평가', '검토', '검증', '테스트', '실험'];
        return analyticalTerms.some(term => content.includes(term));
    }

    // 체계적 콘텐츠 감지
    private detectSystematicContent(content: string): boolean {
        const systematicTerms = ['단계', '순서', '절차', '방법', '가이드', '튜토리얼', '체계'];
        return systematicTerms.some(term => content.includes(term));
    }

    // 캐시 키 생성
    private generateCacheKey(request: AIRequest): string {
        const inputHash = this.hashString(JSON.stringify(request.input));
        const contextHash = request.context ? this.hashString(JSON.stringify(request.context)) : '';
        return `ai-request-${request.user_id}-${inputHash}-${contextHash}`;
    }

    // 응답 캐시 저장
    private cacheResponse(cacheKey: string, response: AIResponse, request: AIRequest): void {
        // 캐시할 가치가 있는 응답인지 확인
        if (response.success && response.content?.primary_response && response.content.primary_response.length > 50) {
            const ttl = this.calculateCacheTTL(request, response);
            const tags = this.generateCacheTags(request, response);
            const priority = this.determineCachePriority(request, response);

            aiCacheManager.set(cacheKey, response, {
                ttl,
                tags,
                priority
            });

            errorLogger.info(`💾 응답 캐시 저장: ${cacheKey} (TTL: ${ttl}s)`, {
                component: 'integratedAIService',
                action: 'cacheResponse',
                cacheKey,
                ttl,
            });
        }
    }

    // 캐시 TTL 계산
    private calculateCacheTTL(request: AIRequest, response: AIResponse): number {
        let baseTTL = 3600; // 1시간 기본값

        // 응답 품질에 따른 조정
        if (response.confidence_score && response.confidence_score > 0.9) {
            baseTTL *= 2; // 높은 신뢰도면 더 오래 캐시
        }

        // 요청 복잡도에 따른 조정
        const complexity = this.assessComplexity(request.input.text || '');
        if (complexity > 7) {
            baseTTL *= 1.5; // 복잡한 요청은 더 오래 캐시
        }

        // 사용자별 조정
        if (request.user_id === 'premium-user') {
            baseTTL *= 0.5; // 프리미엄 사용자는 더 자주 업데이트
        }

        return Math.min(baseTTL, 7200); // 최대 2시간
    }

    // 캐시 태그 생성
    private generateCacheTags(request: AIRequest, response: AIResponse): string[] {
        const tags = ['ai-response'];

        // 사용자 태그
        tags.push(`user-${request.user_id}`);

        // 세션 태그
        tags.push(`session-${request.session_id}`);

        // 도메인 태그
        const domain = this.classifyDomain(request.input.text || '');
        tags.push(`domain-${domain}`);

        // 응답 타입 태그
        if (response.learning_insights) tags.push('learning');
        if (response.alternatives) tags.push('alternatives');
        if (response.follow_up_questions) tags.push('interactive');

        return tags;
    }

    // 캐시 우선순위 결정
    private determineCachePriority(request: AIRequest, response: AIResponse): 'low' | 'medium' | 'high' | 'critical' {
        // 높은 신뢰도 응답
        if (response.confidence_score && response.confidence_score > 0.95) {
            return 'high';
        }

        // 복잡한 요청의 성공적인 응답
        const complexity = this.assessComplexity(request.input.text || '');
        if (complexity > 8 && response.success) {
            return 'high';
        }

        // 학습 인사이트가 포함된 응답
        if (response.learning_insights) {
            return 'medium';
        }

        return 'low';
    }

    // 문자열 해시 생성
    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit 정수로 변환
        }
        return Math.abs(hash).toString(36);
    }

    // 캐시 통계 가져오기
    public getCacheStats(): unknown {
        return aiCacheManager.getStats();
    }

    // 캐시 최적화
    public optimizeCache(): void {
        aiCacheManager.optimize();
    }

    // 사용자별 캐시 삭제
    public clearUserCache(userId: string): number {
        return aiCacheManager.deleteByTag(`user-${userId}`);
    }

}

// 인터페이스 정의들
interface SessionData {
    session_id: string;
    user_id: string;
    created_at: Date;
    last_activity: Date;
    conversation_count: number;
    context: unknown;
    preferences: UserPreferences;
}

interface PerformanceMetrics {
    total_requests: number;
    average_response_time: number;
    success_rate: number;
    user_satisfaction: number;
}

interface InputAnalysisResult {
    nlp_analysis: NLPAnalysisResult | null;
    multimodal_analysis: MultimodalResponse | null;
    input_classification: InputClassification;
    processing_strategy: ProcessingStrategy;
}

interface InputClassification {
    primary_type: 'text' | 'multimodal' | 'code' | 'voice';
    complexity: 'low' | 'medium' | 'high';
    requires_search: boolean;
    requires_reasoning: boolean;
    requires_multimodal: boolean;
}

type ProcessingStrategy = 'standard' | 'search_focused' | 'reasoning_focused' | 'multimodal_focused';

interface ProcessingResult {
    nlp_result: NLPAnalysisResult | null;
    search_result: IntegratedResponse | null;
    multimodal_result: MultimodalResponse | null;
    reasoning_result: ReasoningResult | null;
    integration_insights: string[];
}

const integratedAIService = new IntegratedAIService();
export default integratedAIService;
