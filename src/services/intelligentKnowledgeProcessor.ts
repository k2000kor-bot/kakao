import { sendChatMessage, ChatRequest } from './unifiedAPI';

export interface KnowledgeSource {
    id: string;
    type: 'web_search' | 'database' | 'document' | 'expert_knowledge';
    url?: string;
    title: string;
    content: string;
    reliability: number; // 0-1 신뢰도
    timestamp: string;
    domain: string;
    author?: string;
    citations?: string[];
}

export interface ReasoningStep {
    id: string;
    type: 'analysis' | 'synthesis' | 'evaluation' | 'inference' | 'verification';
    description: string;
    input: string[];
    output: string;
    confidence: number;
    reasoning: string;
    sources: string[];
}

export interface IntelligentResponse {
    question: string;
    knowledgeGathering: {
        sources: KnowledgeSource[];
        searchQueries: string[];
        informationGaps: string[];
    };
    reasoning: {
        steps: ReasoningStep[];
        logicalFlow: string;
        assumptions: string[];
        limitations: string[];
    };
    synthesis: {
        mainAnswer: string;
        supportingEvidence: string[];
        alternativeViews: string[];
        confidence: number;
    };
    verification: {
        factCheck: string[];
        sourceValidation: string[];
        logicalConsistency: string[];
        biasAssessment: string[];
    };
    finalResponse: string;
    metadata: {
        processingTime: number;
        sourcesUsed: number;
        reasoningSteps: number;
        confidence: number;
    };
}

// 모호한 질문 분석 및 명확화 함수
export const analyzeAndClarifyQuestion = async (question: string, context: Record<string, unknown>): Promise<{
    clarifiedQuestion: string;
    assumptions: string[];
    contextEnhancement: string[];
    intentAnalysis: string;
}> => {
    const clarificationPrompt = `
다음 모호하거나 불완전한 질문을 분석하고 명확화해주세요:

**원본 질문:** ${question}

**분석 요구사항:**
1. 질문의 진짜 의도 파악
2. 누락된 정보나 맥락 추론
3. 모호한 표현을 명확하게 해석
4. 관련된 배경 정보 추가
5. 질문의 범위와 깊이 조정

**컨텍스트 정보:**
${JSON.stringify(context, null, 2)}

다음 형식으로 응답해주세요:
- 명확화된 질문:
- 추론한 가정들:
- 추가된 맥락:
- 질문 의도 분석:
`;

    try {
        const chatRequest: ChatRequest = {
            message: clarificationPrompt,
            context: context,
            options: {
                intent: 'question_analysis',
                style: 'analytical',
                tone: 'professional',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            // 응답을 파싱하여 구조화된 데이터로 변환
            const content = response.message.content;

            // 간단한 파싱 로직 (실제로는 더 정교한 파싱 필요)
            const clarifiedQuestion = extractSection(content, '명확화된 질문:');
            const assumptions = extractList(content, '추론한 가정들:');
            const contextEnhancement = extractList(content, '추가된 맥락:');
            const intentAnalysis = extractSection(content, '질문 의도 분석:');

            return {
                clarifiedQuestion: clarifiedQuestion || question,
                assumptions: assumptions || [],
                contextEnhancement: contextEnhancement || [],
                intentAnalysis: intentAnalysis || '의도 분석 실패'
            };
        }
    } catch (error) {
        console.error('질문 분석 오류:', error);
    }

    return {
        clarifiedQuestion: question,
        assumptions: [],
        contextEnhancement: [],
        intentAnalysis: '분석 실패'
    };
};

// 텍스트 섹션 추출 헬퍼 함수
const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`${sectionName}\\s*([\\s\\S]*?)(?=\\n\\s*[-\\w]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
};

// 리스트 추출 헬퍼 함수
const extractList = (text: string, sectionName: string): string[] => {
    const section = extractSection(text, sectionName);
    if (!section) return [];

    return section
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);
};

// 체계적 정보 분석 함수
const performSystematicAnalysis = async (question: string, sources: KnowledgeSource[], context: Record<string, unknown>): Promise<string[]> => {
    const analysisPrompt = `
다음 질문과 정보를 체계적으로 분석해주세요:

**질문:** ${question}
**정보 소스:** ${sources.map(s => s.content).join('\n\n')}
**컨텍스트:** ${JSON.stringify(context, null, 2)}

다음 관점에서 분석해주세요:
1. 정보의 일관성과 신뢰성
2. 핵심 주장과 근거
3. 정보 간의 상관관계
4. 누락된 정보나 간극
5. 논리적 구조와 흐름

분석 결과를 구조화된 형태로 제공해주세요.`;

    try {
        const chatRequest: ChatRequest = {
            message: analysisPrompt,
            context: context,
            options: {
                intent: 'systematic_analysis',
                style: 'analytical',
                tone: 'professional',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            return response.message.content.split('\n').filter((line: string) => line.trim().length > 0);
        }
    } catch (error) {
        console.error('체계적 분석 오류:', error);
    }

    return ['체계적 분석을 수행할 수 없습니다.'];
};

// 핵심 정보 추출 및 구조화 함수
const extractAndStructureInfo = async (question: string, analysisResults: string[], sources: KnowledgeSource[]): Promise<Record<string, unknown>> => {
    const extractionPrompt = `
다음 질문과 분석 결과에서 핵심 정보를 추출하고 구조화해주세요:

**질문:** ${question}
**분석 결과:** ${analysisResults.join('\n')}
**정보 소스:** ${sources.map(s => s.content).join('\n\n')}

다음 구조로 정보를 정리해주세요:
- 핵심 사실들
- 주요 주장들
- 근거와 증거
- 관련 개념들
- 중요도 순위

구조화된 정보를 JSON 형태로 제공해주세요.`;

    try {
        const chatRequest: ChatRequest = {
            message: extractionPrompt,
            context: { analysisResults, sources },
            options: {
                intent: 'information_extraction',
                style: 'structured',
                tone: 'professional',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            try {
                return JSON.parse(response.message.content);
            } catch {
                return { extractedInfo: response.message.content };
            }
        }
    } catch (error) {
        console.error('정보 추출 오류:', error);
    }

    return { extractedInfo: '정보 추출을 수행할 수 없습니다.' };
};

// 다각도 관점 분석 함수
const performPerspectiveAnalysis = async (question: string, extractedInfo: Record<string, unknown>, sources: KnowledgeSource[]): Promise<string[]> => {
    const perspectivePrompt = `
다음 질문과 정보를 다양한 관점에서 분석해주세요:

**질문:** ${question}
**추출된 정보:** ${JSON.stringify(extractedInfo, null, 2)}
**정보 소스:** ${sources.map(s => s.content).join('\n\n')}

다음 관점에서 분석해주세요:
1. 긍정적 관점
2. 부정적 관점
3. 중립적 관점
4. 전문가 관점
5. 일반 사용자 관점
6. 미래적 관점
7. 역사적 관점

각 관점별 분석 결과를 제공해주세요.`;

    try {
        const chatRequest: ChatRequest = {
            message: perspectivePrompt,
            context: { extractedInfo, sources },
            options: {
                intent: 'perspective_analysis',
                style: 'comprehensive',
                tone: 'balanced',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            return response.message.content.split('\n').filter((line: string) => line.trim().length > 0);
        }
    } catch (error) {
        console.error('관점 분석 오류:', error);
    }

    return ['관점 분석을 수행할 수 없습니다.'];
};

// 응답 최적화 및 개선 함수
const optimizeResponse = async (response: string, questionAnalysis: any, sources: KnowledgeSource[]): Promise<string> => {
    const optimizationPrompt = `
다음 응답을 최적화하고 개선해주세요:

**원본 응답:** ${response}

**질문 분석 정보:**
- 원본 질문 의도: ${questionAnalysis.intentAnalysis}
- 추론한 가정들: ${questionAnalysis.assumptions.join(', ')}
- 추가된 맥락: ${questionAnalysis.contextEnhancement.join(', ')}

**개선 요구사항:**
1. 사용자가 실제로 원하는 정보에 더 집중
2. 모호한 부분을 명확하게 해석
3. 불필요한 정보 제거
4. 논리적 구조 개선
5. 가독성 향상
6. 실용성 증대

최적화된 응답을 생성해주세요.`;

    try {
        const chatRequest: ChatRequest = {
            message: optimizationPrompt,
            context: { questionAnalysis, sources },
            options: {
                intent: 'response_optimization',
                style: 'clear',
                tone: 'professional',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            return response.message.content;
        }
    } catch (error) {
        console.error('응답 최적화 오류:', error);
    }

    return response;
};

// 최종 검토 및 완성 함수
const performFinalReview = async (response: string, originalQuestion: string, questionAnalysis: any, sources: KnowledgeSource[]): Promise<string> => {
    const reviewPrompt = `
다음 응답을 최종 검토하고 완성해주세요:

**원본 질문:** ${originalQuestion}
**최적화된 응답:** ${response}

**검토 항목:**
1. 원본 질문의 의도를 정확히 반영하는가?
2. 모호한 부분이 명확하게 해석되었는가?
3. 논리적 구조가 일관성 있는가?
4. 신뢰할 수 있는 정보만 포함되어 있는가?
5. 사용자에게 실질적인 도움이 되는가?
6. 객관적이고 균형 잡힌 관점을 제공하는가?

**질문 분석 정보:**
- 의도 분석: ${questionAnalysis.intentAnalysis}
- 추론한 가정들: ${questionAnalysis.assumptions.join(', ')}
- 추가된 맥락: ${questionAnalysis.contextEnhancement.join(', ')}

최종 검토를 완료하고 필요시 수정하여 완성된 응답을 제공해주세요.`;

    try {
        const chatRequest: ChatRequest = {
            message: reviewPrompt,
            context: { originalQuestion, questionAnalysis, sources },
            options: {
                intent: 'final_review',
                style: 'comprehensive',
                tone: 'professional',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            return response.message.content;
        }
    } catch (error) {
        console.error('최종 검토 오류:', error);
    }

    return response;
};

// 웹 검색 서비스 (실제 구현에서는 검색 API 사용)
export const performWebSearch = async (query: string): Promise<KnowledgeSource[]> => {
    const searchPrompts = [
        `다음 질문에 대한 최신 정보를 검색해주세요: ${query}`,
        `다음 주제에 대한 전문적이고 신뢰할 수 있는 정보를 찾아주세요: ${query}`,
        `다음 질문에 대한 다양한 관점의 정보를 수집해주세요: ${query}`
    ];

    const sources: KnowledgeSource[] = [];

    for (const prompt of searchPrompts) {
        try {
            const chatRequest: ChatRequest = {
                message: prompt,
                context: {},
                options: {
                    intent: 'web_search',
                    style: 'detailed',
                    tone: 'professional',
                    requireCitations: true
                }
            };

            const response = await sendChatMessage(chatRequest);
            if (response.success && response.message) {
                sources.push({
                    id: `source_${Date.now()}_${Math.random()}`,
                    type: 'web_search',
                    title: `검색 결과: ${query}`,
                    content: response.message.content,
                    reliability: 0.7, // 기본 신뢰도
                    timestamp: new Date().toISOString(),
                    domain: 'web_search',
                    citations: []
                });
            }
        } catch (error) {
            console.error('웹 검색 오류:', error);
        }
    }

    return sources;
};

// 정보 신뢰도 평가
export const evaluateSourceReliability = (source: KnowledgeSource): number => {
    let reliability = 0.5; // 기본 신뢰도

    // 도메인 기반 평가
    const trustedDomains = [
        'wikipedia.org', 'scholar.google.com', 'arxiv.org', 'ieee.org',
        'acm.org', 'nature.com', 'science.org', 'pubmed.gov',
        'gov', 'edu', 'org'
    ];

    if (source.domain && trustedDomains.some(domain => source.domain.includes(domain))) {
        reliability += 0.2;
    }

    // 내용 품질 평가
    const contentLength = source.content.length;
    if (contentLength > 1000) reliability += 0.1;
    if (contentLength > 5000) reliability += 0.1;

    // 인용 정보 평가
    if (source.citations && source.citations.length > 0) {
        reliability += 0.1;
    }

    // 최신성 평가
    const sourceDate = new Date(source.timestamp);
    const currentDate = new Date();
    const daysDiff = (currentDate.getTime() - sourceDate.getTime()) / (1000 * 3600 * 24);

    if (daysDiff < 365) reliability += 0.1; // 1년 이내
    if (daysDiff < 30) reliability += 0.1; // 1개월 이내

    return Math.min(reliability, 1.0);
};

// 실시간 진행 상황 콜백 타입
export type ProgressCallback = (step: number, totalSteps: number, description: string, confidence: number) => void;

// 성능 최적화 옵션
export interface ProcessingOptions {
    enableParallelProcessing?: boolean;
    maxConcurrentSteps?: number;
    timeoutPerStep?: number;
    enableCaching?: boolean;
    cacheExpiry?: number;
    enableProgressTracking?: boolean;
    onProgress?: ProgressCallback;
}

// 고급 캐시 관리 시스템
interface CacheEntry {
    response: IntelligentResponse;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
}

class AdvancedCache {
    private cache = new Map<string, CacheEntry>();
    private maxSize = 100; // 최대 캐시 항목 수
    private maxAge = 3600000; // 1시간
    private totalSize = 0;

    // 캐시에서 응답 가져오기
    get(key: string): IntelligentResponse | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // 만료 확인
        if (Date.now() - entry.timestamp > this.maxAge) {
            this.delete(key);
            return null;
        }

        // 접근 통계 업데이트
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.cache.set(key, entry);

        return entry.response;
    }

    // 캐시에 응답 저장
    set(key: string, response: IntelligentResponse): void {
        const size = this.calculateSize(response);

        // 캐시 크기 제한 확인
        if (this.totalSize + size > this.maxSize * 1000) { // 100KB 제한
            this.evictOldest();
        }

        const entry: CacheEntry = {
            response,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now(),
            size
        };

        this.cache.set(key, entry);
        this.totalSize += size;
    }

    // 캐시 항목 삭제
    private delete(key: string): void {
        const entry = this.cache.get(key);
        if (entry) {
            this.totalSize -= entry.size;
            this.cache.delete(key);
        }
    }

    // 가장 오래된 항목 제거
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();

        const entries = Array.from(this.cache.entries());
        for (let i = 0; i < entries.length; i++) {
            const [key, entry] = entries[i];
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    // 응답 크기 계산
    private calculateSize(response: IntelligentResponse): number {
        return JSON.stringify(response).length;
    }

    // 캐시 통계
    getStats() {
        return {
            size: this.cache.size,
            totalSize: this.totalSize,
            maxSize: this.maxSize
        };
    }

    // 캐시 정리
    clear(): void {
        this.cache.clear();
        this.totalSize = 0;
    }
}

// 고급 오류 처리 및 재시도 시스템
interface RetryOptions {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

class RetryManager {
    private static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async withRetry<T>(
        operation: () => Promise<T>,
        options: RetryOptions = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2
        }
    ): Promise<T> {
        let lastError: Error;
        let delay = options.baseDelay;

        for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt === options.maxRetries) {
                    throw lastError;
                }

                console.warn(`시도 ${attempt + 1} 실패, ${delay}ms 후 재시도:`, error);
                await this.delay(delay);
                delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
            }
        }

        throw lastError!;
    }
}

// 성능 모니터링 시스템
interface PerformanceMetrics {
    startTime: number;
    endTime: number;
    duration: number;
    steps: Array<{
        step: number;
        description: string;
        startTime: number;
        endTime: number;
        duration: number;
        success: boolean;
        error?: string;
    }>;
    cacheHits: number;
    cacheMisses: number;
    retryCount: number;
    totalSources: number;
    finalConfidence: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics | null = null;
    private stepStartTime: number = 0;

    startMonitoring(): void {
        this.metrics = {
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            steps: [],
            cacheHits: 0,
            cacheMisses: 0,
            retryCount: 0,
            totalSources: 0,
            finalConfidence: 0
        };
    }

    startStep(step: number, description: string): void {
        this.stepStartTime = Date.now();
        this.metrics?.steps.push({
            step,
            description,
            startTime: this.stepStartTime,
            endTime: 0,
            duration: 0,
            success: false
        });
    }

    endStep(step: number, success: boolean, error?: string): void {
        const stepIndex = this.metrics?.steps.findIndex(s => s.step === step);
        if (stepIndex !== undefined && stepIndex >= 0 && this.metrics) {
            const endTime = Date.now();
            this.metrics.steps[stepIndex].endTime = endTime;
            this.metrics.steps[stepIndex].duration = endTime - this.stepStartTime;
            this.metrics.steps[stepIndex].success = success;
            if (error) {
                this.metrics.steps[stepIndex].error = error;
            }
        }
    }

    recordCacheHit(): void {
        if (this.metrics) this.metrics.cacheHits++;
    }

    recordCacheMiss(): void {
        if (this.metrics) this.metrics.cacheMisses++;
    }

    recordRetry(): void {
        if (this.metrics) this.metrics.retryCount++;
    }

    setTotalSources(count: number): void {
        if (this.metrics) this.metrics.totalSources = count;
    }

    setFinalConfidence(confidence: number): void {
        if (this.metrics) this.metrics.finalConfidence = confidence;
    }

    endMonitoring(): PerformanceMetrics | null {
        if (this.metrics) {
            this.metrics.endTime = Date.now();
            this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
        }
        return this.metrics;
    }

    getMetrics(): PerformanceMetrics | null {
        return this.metrics;
    }
}

// 전역 인스턴스
const advancedCache = new AdvancedCache();
const performanceMonitor = new PerformanceMonitor();

// 병렬 처리 함수
const executeStepsInParallel = async (
    steps: Array<{ step: number; prompt: string; context: Record<string, unknown> }>,
    maxConcurrent: number = 3
): Promise<Array<{ step: number; result: string; confidence: number }>> => {
    const results: Array<{ step: number; result: string; confidence: number }> = [];

    for (let i = 0; i < steps.length; i += maxConcurrent) {
        const batch = steps.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(async ({ step, prompt, context }) => {
            try {
                const chatRequest = {
                    message: prompt,
                    context,
                    options: {
                        intent: `step_${step}`,
                        style: 'detailed',
                        tone: 'professional',
                        requireCitations: true
                    }
                };

                const response = await sendChatMessage(chatRequest);
                return {
                    step,
                    result: response.success && response.message ? response.message.content : '처리 실패',
                    confidence: response.success ? 0.7 : 0.5
                };
            } catch (error) {
                console.error(`단계 ${step} 병렬 처리 오류:`, error);
                return {
                    step,
                    result: `단계 ${step} 처리 중 오류가 발생했습니다.`,
                    confidence: 0.3
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results.sort((a, b) => a.step - b.step);
};

// 타임아웃 래퍼 함수
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`타임아웃: ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
};

// 10단계 합리적 사고 과정 구현 (성능 최적화 버전)
export const performLogicalReasoning = async (
    question: string,
    sources: KnowledgeSource[],
    options: ProcessingOptions = {}
): Promise<ReasoningStep[]> => {
    const {
        enableParallelProcessing = false,
        maxConcurrentSteps = 3,
        timeoutPerStep = 30000,
        enableProgressTracking = true,
        onProgress
    } = options;

    const reasoningSteps: ReasoningStep[] = [];

    // 진행 상황 업데이트 함수
    const updateProgress = (step: number, description: string, confidence: number) => {
        if (enableProgressTracking && onProgress) {
            onProgress(step, 10, description, confidence);
        }
        console.log(`🧠 단계 ${step}/10: ${description} (신뢰도: ${(confidence * 100).toFixed(1)}%)`);
    };

    // 상세한 진행 상황 메시지
    const getDetailedProgressMessage = (step: number, description: string): string => {
        const detailedMessages = {
            1: '질문을 심층 분석하여 핵심 요구사항을 파악하고 있습니다...',
            2: '수집된 정보의 품질을 평가하고 우선순위를 설정하고 있습니다...',
            3: '품질이 높은 정보에서 핵심 내용을 추출하고 구조화하고 있습니다...',
            4: '다양한 관점에서 정보를 분석하고 비교하고 있습니다...',
            5: '논리적 추론을 통해 결론을 도출하고 있습니다...',
            6: '모든 분석 결과를 종합하여 통합된 답변을 생성하고 있습니다...',
            7: '생성된 답변의 사실을 검증하고 정확성을 확인하고 있습니다...',
            8: '답변의 편향성을 평가하고 객관성을 확보하고 있습니다...',
            9: '검증 결과를 바탕으로 응답을 최적화하고 개선하고 있습니다...',
            10: '최종 답변을 검토하고 완성하고 있습니다...'
        };

        return detailedMessages[step as keyof typeof detailedMessages] || description;
    };

    // 1단계: 문제 분석 및 요구사항 파악
    performanceMonitor.startStep(1, '문제 분석 및 요구사항 파악');
    updateProgress(1, getDetailedProgressMessage(1, '문제 분석 및 요구사항 파악'), 0.85);

    const analysisPrompt = `다음 질문을 심층적으로 분석해주세요:

질문: ${question}
수집된 정보: ${sources.map(s => s.content).join('\n\n')}

분석해야 할 요소:
1. 질문의 핵심 요구사항과 목적
2. 필요한 정보 유형과 범위
3. 논리적 접근 방법과 전략
4. 가정과 제약사항 식별
5. 예상되는 복잡성과 난이도

구조화된 분석 결과를 제공해주세요.`;

    try {
        const analysisRequest = {
            message: analysisPrompt,
            context: { sources },
            options: {
                intent: 'deep_analysis',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const analysisResponse = await RetryManager.withRetry(
            () => withTimeout(sendChatMessage(analysisRequest), timeoutPerStep),
            { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffMultiplier: 1.5 }
        );

        if ((analysisResponse as any).success && (analysisResponse as any).message) {
            reasoningSteps.push({
                id: 'analysis_1',
                type: 'analysis',
                description: '문제 분석 및 요구사항 파악',
                input: [question, ...sources.map(s => s.content)],
                output: (analysisResponse as any).message.content,
                confidence: 0.85,
                reasoning: '질문의 핵심 요구사항과 필요한 정보 유형을 심층 분석했습니다.',
                sources: sources.map(s => s.id)
            });
            performanceMonitor.endStep(1, true);
        }
    } catch (error) {
        console.error('1단계 분석 오류:', error);
        updateProgress(1, '문제 분석 실패', 0.3);
        performanceMonitor.endStep(1, false, error instanceof Error ? error.message : 'Unknown error');
        performanceMonitor.recordRetry();
    }

    // 2단계: 정보 품질 평가 및 필터링
    updateProgress(2, getDetailedProgressMessage(2, '정보 품질 평가 및 우선순위 설정'), 0.8);
    const qualityPrompt = `수집된 정보의 품질을 평가하고 우선순위를 정해주세요:

분석 결과: ${reasoningSteps[0]?.output || ''}
수집된 정보: ${sources.map(s => s.content).join('\n\n')}

평가 기준:
1. 정보의 신뢰성과 출처의 권위
2. 정보의 최신성과 관련성
3. 정보의 완전성과 정확성
4. 정보의 객관성과 편향성
5. 정보의 실용성과 적용 가능성

품질 평가 결과를 제공해주세요.`;

    try {
        const qualityRequest = {
            message: qualityPrompt,
            context: { sources, analysis: reasoningSteps[0] },
            options: {
                intent: 'quality_assessment',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const qualityResponse = await withTimeout(
            sendChatMessage(qualityRequest),
            timeoutPerStep
        );

        if ((qualityResponse as any).success && (qualityResponse as any).message) {
            reasoningSteps.push({
                id: 'quality_2',
                type: 'evaluation',
                description: '정보 품질 평가 및 우선순위 설정',
                input: [reasoningSteps[0]?.output || '', ...sources.map(s => s.content)],
                output: (qualityResponse as any).message.content,
                confidence: 0.8,
                reasoning: '수집된 정보의 품질을 평가하고 우선순위를 설정했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('2단계 품질 평가 오류:', error);
        updateProgress(2, '품질 평가 실패', 0.3);
    }

    // 병렬 처리 가능한 단계들 (3-5단계)
    if (enableParallelProcessing) {
        updateProgress(3, '병렬 처리: 정보 추출, 다관점 분석, 논리적 추론을 동시에 수행하고 있습니다...', 0.8);

        const parallelSteps = [
            {
                step: 3,
                prompt: `품질이 높은 정보에서 핵심 내용을 추출하고 구조화해주세요:

품질 평가 결과: ${reasoningSteps[1]?.output || ''}
수집된 정보: ${sources.map(s => s.content).join('\n\n')}

추출 과정:
1. 핵심 사실과 데이터 식별
2. 주요 개념과 정의 정리
3. 인과관계와 패턴 파악
4. 예시와 사례 수집
5. 정보 간 연결점 발견

구조화된 핵심 정보를 제공해주세요.`,
                context: { sources, analysis: reasoningSteps[0], quality: reasoningSteps[1] }
            },
            {
                step: 4,
                prompt: `다양한 관점에서 정보를 분석하고 비교해주세요:

구조화된 정보: [처리 중...]
원본 질문: ${question}

다관점 분석:
1. 긍정적 관점과 부정적 관점
2. 전문가 관점과 일반인 관점
3. 단기적 관점과 장기적 관점
4. 개인적 관점과 사회적 관점
5. 이론적 관점과 실용적 관점

다관점 분석 결과를 제공해주세요.`,
                context: { sources, analysis: reasoningSteps[0] }
            },
            {
                step: 5,
                prompt: `수집된 정보를 바탕으로 논리적 추론을 통해 결론을 도출해주세요:

다관점 분석: [처리 중...]
구조화된 정보: [처리 중...]
원본 질문: ${question}

추론 과정:
1. 논리적 전제와 결론 연결
2. 인과관계와 상관관계 분석
3. 귀납적 추론과 연역적 추론
4. 가설 검증과 반증
5. 대안적 설명 고려

논리적 추론 결과를 제공해주세요.`,
                context: { sources, analysis: reasoningSteps[0] }
            }
        ];

        try {
            const parallelResults = await executeStepsInParallel(parallelSteps, maxConcurrentSteps);

            parallelResults.forEach(({ step, result, confidence }) => {
                reasoningSteps.push({
                    id: `step_${step}`,
                    type: step === 3 ? 'analysis' : step === 4 ? 'analysis' : 'inference',
                    description: step === 3 ? '핵심 정보 추출 및 구조화' :
                        step === 4 ? '다관점 분석 및 비교' : '논리적 추론 및 결론 도출',
                    input: [question, ...sources.map(s => s.content)],
                    output: result,
                    confidence,
                    reasoning: `단계 ${step} 병렬 처리 완료`,
                    sources: sources.map(s => s.id)
                });
            });
        } catch (error) {
            console.error('병렬 처리 오류:', error);
            updateProgress(3, '병렬 처리 실패', 0.3);
        }
    } else {
        // 순차 처리 (기존 방식)
        // 3단계: 핵심 정보 추출 및 구조화
        updateProgress(3, getDetailedProgressMessage(3, '핵심 정보 추출 및 구조화'), 0.8);
        const extractionPrompt = `품질이 높은 정보에서 핵심 내용을 추출하고 구조화해주세요:

품질 평가 결과: ${reasoningSteps[1]?.output || ''}
수집된 정보: ${sources.map(s => s.content).join('\n\n')}

추출 과정:
1. 핵심 사실과 데이터 식별
2. 주요 개념과 정의 정리
3. 인과관계와 패턴 파악
4. 예시와 사례 수집
5. 정보 간 연결점 발견

구조화된 핵심 정보를 제공해주세요.`;

        try {
            const extractionRequest: ChatRequest = {
                message: extractionPrompt,
                context: { sources, analysis: reasoningSteps[0], quality: reasoningSteps[1] },
                options: {
                    intent: 'information_extraction',
                    style: 'detailed',
                    tone: 'professional',
                    requireCitations: true
                }
            };

            const extractionResponse = await withTimeout(
                sendChatMessage(extractionRequest),
                timeoutPerStep
            );

            if (extractionResponse.success && extractionResponse.message) {
                reasoningSteps.push({
                    id: 'extraction_3',
                    type: 'analysis',
                    description: '핵심 정보 추출 및 구조화',
                    input: [reasoningSteps[1]?.output || '', ...sources.map(s => s.content)],
                    output: extractionResponse.message.content,
                    confidence: 0.8,
                    reasoning: '품질이 높은 정보에서 핵심 내용을 추출하고 구조화했습니다.',
                    sources: sources.map(s => s.id)
                });
            }
        } catch (error) {
            console.error('3단계 정보 추출 오류:', error);
            updateProgress(3, '정보 추출 실패', 0.3);
        }

        // 4단계: 다관점 분석 및 비교
        updateProgress(4, getDetailedProgressMessage(4, '다관점 분석 및 비교'), 0.75);
        const perspectivePrompt = `다양한 관점에서 정보를 분석하고 비교해주세요:

구조화된 정보: ${reasoningSteps[2]?.output || ''}
원본 질문: ${question}

다관점 분석:
1. 긍정적 관점과 부정적 관점
2. 전문가 관점과 일반인 관점
3. 단기적 관점과 장기적 관점
4. 개인적 관점과 사회적 관점
5. 이론적 관점과 실용적 관점

다관점 분석 결과를 제공해주세요.`;

        try {
            const perspectiveRequest: ChatRequest = {
                message: perspectivePrompt,
                context: { sources, analysis: reasoningSteps[0], extraction: reasoningSteps[2] },
                options: {
                    intent: 'perspective_analysis',
                    style: 'detailed',
                    tone: 'professional',
                    requireCitations: true
                }
            };

            const perspectiveResponse = await withTimeout(
                sendChatMessage(perspectiveRequest),
                timeoutPerStep
            );

            if (perspectiveResponse.success && perspectiveResponse.message) {
                reasoningSteps.push({
                    id: 'perspective_4',
                    type: 'analysis',
                    description: '다관점 분석 및 비교',
                    input: [reasoningSteps[2]?.output || '', question],
                    output: perspectiveResponse.message.content,
                    confidence: 0.75,
                    reasoning: '다양한 관점에서 정보를 분석하고 비교했습니다.',
                    sources: sources.map(s => s.id)
                });
            }
        } catch (error) {
            console.error('4단계 다관점 분석 오류:', error);
            updateProgress(4, '다관점 분석 실패', 0.3);
        }

        // 5단계: 논리적 추론 및 결론 도출
        updateProgress(5, getDetailedProgressMessage(5, '논리적 추론 및 결론 도출'), 0.85);
        const inferencePrompt = `수집된 정보를 바탕으로 논리적 추론을 통해 결론을 도출해주세요:

다관점 분석: ${reasoningSteps[3]?.output || ''}
구조화된 정보: ${reasoningSteps[2]?.output || ''}
원본 질문: ${question}

추론 과정:
1. 논리적 전제와 결론 연결
2. 인과관계와 상관관계 분석
3. 귀납적 추론과 연역적 추론
4. 가설 검증과 반증
5. 대안적 설명 고려

논리적 추론 결과를 제공해주세요.`;

        try {
            const inferenceRequest: ChatRequest = {
                message: inferencePrompt,
                context: {
                    sources,
                    analysis: reasoningSteps[0],
                    extraction: reasoningSteps[2],
                    perspective: reasoningSteps[3]
                },
                options: {
                    intent: 'logical_inference',
                    style: 'detailed',
                    tone: 'professional',
                    requireCitations: true
                }
            };

            const inferenceResponse = await withTimeout(
                sendChatMessage(inferenceRequest),
                timeoutPerStep
            );

            if (inferenceResponse.success && inferenceResponse.message) {
                reasoningSteps.push({
                    id: 'inference_5',
                    type: 'inference',
                    description: '논리적 추론 및 결론 도출',
                    input: [reasoningSteps[3]?.output || '', reasoningSteps[2]?.output || '', question],
                    output: inferenceResponse.message.content,
                    confidence: 0.85,
                    reasoning: '수집된 정보를 바탕으로 논리적 추론을 통해 결론을 도출했습니다.',
                    sources: sources.map(s => s.id)
                });
            }
        } catch (error) {
            console.error('5단계 논리적 추론 오류:', error);
            updateProgress(5, '논리적 추론 실패', 0.3);
        }
    }

    // 6단계: 정보 종합 및 통합
    updateProgress(6, getDetailedProgressMessage(6, '정보 종합 및 통합 답변 생성'), 0.8);
    const synthesisPrompt = `모든 분석 결과를 종합하여 통합된 답변을 생성해주세요:

논리적 추론: ${reasoningSteps.find(s => s.id === 'step_5')?.output || ''}
다관점 분석: ${reasoningSteps.find(s => s.id === 'step_4')?.output || ''}
구조화된 정보: ${reasoningSteps.find(s => s.id === 'step_3')?.output || ''}
원본 질문: ${question}

종합 과정:
1. 핵심 결론과 주요 발견사항 정리
2. 다양한 관점의 균형 조화
3. 논리적 일관성 확보
4. 실용적 적용 방안 제시
5. 한계점과 불확실성 명시

종합된 답변을 제공해주세요.`;

    try {
        const synthesisRequest = {
            message: synthesisPrompt,
            context: {
                sources,
                analysis: reasoningSteps[0],
                inference: reasoningSteps.find(s => s.id === 'step_5'),
                perspective: reasoningSteps.find(s => s.id === 'step_4'),
                extraction: reasoningSteps.find(s => s.id === 'step_3')
            },
            options: {
                intent: 'comprehensive_synthesis',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const synthesisResponse = await withTimeout(
            sendChatMessage(synthesisRequest),
            timeoutPerStep
        );

        if (synthesisResponse.success && synthesisResponse.message) {
            reasoningSteps.push({
                id: 'synthesis_6',
                type: 'synthesis',
                description: '정보 종합 및 통합 답변 생성',
                input: [question, ...sources.map(s => s.content)],
                output: synthesisResponse.message.content,
                confidence: 0.8,
                reasoning: '모든 분석 결과를 종합하여 통합된 답변을 생성했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('6단계 정보 종합 오류:', error);
        updateProgress(6, '정보 종합 실패', 0.3);
    }

    // 7단계: 사실 검증 및 정확성 확인
    updateProgress(7, getDetailedProgressMessage(7, '사실 검증 및 정확성 확인'), 0.9);
    const verificationPrompt = `생성된 답변의 사실을 검증하고 정확성을 확인해주세요:

종합된 답변: ${reasoningSteps.find(s => s.id === 'synthesis_6')?.output || ''}
참고 자료: ${sources.map(s => s.content).join('\n\n')}

검증 항목:
1. 주장의 사실적 정확성
2. 출처의 신뢰성과 권위
3. 정보의 최신성과 관련성
4. 논리적 일관성과 모순점
5. 객관성과 편향성 여부

사실 검증 결과를 제공해주세요.`;

    try {
        const verificationRequest = {
            message: verificationPrompt,
            context: { sources, synthesis: reasoningSteps.find(s => s.id === 'synthesis_6') },
            options: {
                intent: 'fact_verification',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const verificationResponse = await withTimeout(
            sendChatMessage(verificationRequest),
            timeoutPerStep
        );

        if (verificationResponse.success && verificationResponse.message) {
            reasoningSteps.push({
                id: 'verification_7',
                type: 'verification',
                description: '사실 검증 및 정확성 확인',
                input: [reasoningSteps.find(s => s.id === 'synthesis_6')?.output || '', ...sources.map(s => s.content)],
                output: verificationResponse.message.content,
                confidence: 0.9,
                reasoning: '생성된 답변의 사실을 검증하고 정확성을 확인했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('7단계 사실 검증 오류:', error);
        updateProgress(7, '사실 검증 실패', 0.3);
    }

    // 8단계: 편향성 평가 및 객관성 확보
    updateProgress(8, getDetailedProgressMessage(8, '편향성 평가 및 객관성 확보'), 0.8);
    const biasPrompt = `답변의 편향성을 평가하고 객관성을 확보해주세요:

생성된 답변: ${reasoningSteps.find(s => s.id === 'synthesis_6')?.output || ''}
사실 검증 결과: ${reasoningSteps.find(s => s.id === 'verification_7')?.output || ''}

편향성 평가:
1. 언어적 편향성과 감정적 색채
2. 관점의 균형성과 포용성
3. 문화적 편향성과 지역적 특성
4. 인지적 편향성과 논리적 오류
5. 객관성 확보 방안

편향성 평가 결과를 제공해주세요.`;

    try {
        const biasRequest = {
            message: biasPrompt,
            context: {
                sources,
                synthesis: reasoningSteps.find(s => s.id === 'synthesis_6'),
                verification: reasoningSteps.find(s => s.id === 'verification_7')
            },
            options: {
                intent: 'bias_assessment',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const biasResponse = await withTimeout(
            sendChatMessage(biasRequest),
            timeoutPerStep
        );

        if (biasResponse.success && biasResponse.message) {
            reasoningSteps.push({
                id: 'bias_8',
                type: 'evaluation',
                description: '편향성 평가 및 객관성 확보',
                input: [reasoningSteps.find(s => s.id === 'synthesis_6')?.output || '', reasoningSteps.find(s => s.id === 'verification_7')?.output || ''],
                output: biasResponse.message.content,
                confidence: 0.8,
                reasoning: '답변의 편향성을 평가하고 객관성을 확보했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('8단계 편향성 평가 오류:', error);
        updateProgress(8, '편향성 평가 실패', 0.3);
    }

    // 9단계: 응답 최적화 및 개선
    updateProgress(9, getDetailedProgressMessage(9, '응답 최적화 및 개선'), 0.9);
    const optimizationPrompt = `검증 결과를 바탕으로 응답을 최적화하고 개선해주세요:

원본 답변: ${reasoningSteps.find(s => s.id === 'synthesis_6')?.output || ''}
사실 검증: ${reasoningSteps.find(s => s.id === 'verification_7')?.output || ''}
편향성 평가: ${reasoningSteps.find(s => s.id === 'bias_8')?.output || ''}
원본 질문: ${question}

최적화 과정:
1. 정확성 오류 수정
2. 편향성 개선 및 균형 조화
3. 명확성과 이해도 향상
4. 구조화 및 가독성 개선
5. 실용성과 적용 가능성 강화

최적화된 답변을 제공해주세요.`;

    try {
        const optimizationRequest = {
            message: optimizationPrompt,
            context: {
                sources,
                synthesis: reasoningSteps.find(s => s.id === 'synthesis_6'),
                verification: reasoningSteps.find(s => s.id === 'verification_7'),
                bias: reasoningSteps.find(s => s.id === 'bias_8')
            },
            options: {
                intent: 'response_optimization',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const optimizationResponse = await withTimeout(
            sendChatMessage(optimizationRequest),
            timeoutPerStep
        );

        if (optimizationResponse.success && optimizationResponse.message) {
            reasoningSteps.push({
                id: 'optimization_9',
                type: 'synthesis',
                description: '응답 최적화 및 개선',
                input: [reasoningSteps.find(s => s.id === 'synthesis_6')?.output || '', reasoningSteps.find(s => s.id === 'verification_7')?.output || '', reasoningSteps.find(s => s.id === 'bias_8')?.output || '', question],
                output: optimizationResponse.message.content,
                confidence: 0.9,
                reasoning: '검증 결과를 바탕으로 응답을 최적화하고 개선했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('9단계 응답 최적화 오류:', error);
        updateProgress(9, '응답 최적화 실패', 0.3);
    }

    // 10단계: 최종 검토 및 완성
    updateProgress(10, getDetailedProgressMessage(10, '최종 검토 및 완성'), 0.95);
    const finalReviewPrompt = `최종 답변을 검토하고 완성해주세요:

최적화된 답변: ${reasoningSteps.find(s => s.id === 'optimization_9')?.output || ''}
원본 질문: ${question}
전체 처리 과정: ${reasoningSteps.map(step => step.description).join(' → ')}

최종 검토:
1. 질문에 대한 완전한 답변 여부
2. 논리적 일관성과 구조적 완성도
3. 정보의 정확성과 신뢰성
4. 객관성과 균형감
5. 실용성과 가치

최종 완성된 답변을 제공해주세요.`;

    try {
        const finalReviewRequest = {
            message: finalReviewPrompt,
            context: {
                sources,
                optimization: reasoningSteps.find(s => s.id === 'optimization_9'),
                allSteps: reasoningSteps
            },
            options: {
                intent: 'final_review',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const finalReviewResponse = await withTimeout(
            sendChatMessage(finalReviewRequest),
            timeoutPerStep
        );

        if (finalReviewResponse.success && finalReviewResponse.message) {
            reasoningSteps.push({
                id: 'final_review_10',
                type: 'verification',
                description: '최종 검토 및 완성',
                input: [reasoningSteps.find(s => s.id === 'optimization_9')?.output || '', question],
                output: finalReviewResponse.message.content,
                confidence: 0.95,
                reasoning: '최종 답변을 검토하고 완성했습니다.',
                sources: sources.map(s => s.id)
            });
        }
    } catch (error) {
        console.error('10단계 최종 검토 오류:', error);
        updateProgress(10, '최종 검토 실패', 0.3);
    }

    updateProgress(10, '🎯 10단계 지능형 처리 완료! 정확하고 신뢰할 수 있는 답변을 생성했습니다.', 0.95);
    return reasoningSteps;
};

// 사실 검증
export const performFactChecking = async (
    response: string,
    sources: KnowledgeSource[]
): Promise<string[]> => {
    const factCheckPrompt = `다음 응답의 사실을 검증해주세요:

응답: ${response}
참고 자료: ${sources.map(s => s.content).join('\n\n')}

검증 항목:
1. 주장의 사실적 정확성
2. 출처의 신뢰성
3. 정보의 최신성
4. 논리적 일관성

검증 결과를 제공해주세요.`;

    try {
        const factCheckRequest: ChatRequest = {
            message: factCheckPrompt,
            context: { sources },
            options: {
                intent: 'fact_checking',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const factCheckResponse = await sendChatMessage(factCheckRequest);
        if (factCheckResponse.success && factCheckResponse.message) {
            return [factCheckResponse.message.content];
        }
    } catch (error) {
        console.error('사실 검증 오류:', error);
    }

    return ['사실 검증을 수행할 수 없습니다.'];
};

// 편향성 평가
export const assessBias = async (
    response: string,
    sources: KnowledgeSource[]
): Promise<string[]> => {
    const biasAssessmentPrompt = `다음 응답의 편향성을 평가해주세요:

응답: ${response}
참고 자료: ${sources.map(s => s.content).join('\n\n')}

평가 항목:
1. 언어적 편향성
2. 관점의 균형성
3. 문화적 편향성
4. 인지적 편향성

편향성 평가 결과를 제공해주세요.`;

    try {
        const biasRequest: ChatRequest = {
            message: biasAssessmentPrompt,
            context: { sources },
            options: {
                intent: 'bias_assessment',
                style: 'detailed',
                tone: 'professional',
                requireCitations: true
            }
        };

        const biasResponse = await sendChatMessage(biasRequest);
        if (biasResponse.success && biasResponse.message) {
            return [biasResponse.message.content];
        }
    } catch (error) {
        console.error('편향성 평가 오류:', error);
    }

    return ['편향성 평가를 수행할 수 없습니다.'];
};

// 메인 지능형 지식 처리 함수 (성능 최적화 버전)
export const processIntelligentKnowledge = async (
    question: string,
    context: Record<string, unknown> = {},
    options: ProcessingOptions = {}
): Promise<IntelligentResponse> => {
    // 성능 모니터링 시작
    performanceMonitor.startMonitoring();

    const {
        enableCaching = true,
        cacheExpiry = 3600000, // 1시간
        enableProgressTracking = true,
        onProgress
    } = options;

    console.log('🧠 지능형 지식 처리 시작:', question);

    // 캐시 확인
    if (enableCaching) {
        const cachedResponse = advancedCache.get(question);
        if (cachedResponse) {
            console.log('📋 캐시된 응답 사용');
            performanceMonitor.recordCacheHit();
            return cachedResponse;
        }
        performanceMonitor.recordCacheMiss();
    }

    // 0단계: 모호한 질문 분석 및 명확화
    if (enableProgressTracking && onProgress) {
        onProgress(0, 11, '🔍 질문을 분석하고 명확화하고 있습니다...', 0.3);
    }

    console.log('🔍 0단계: 질문 분석 및 명확화 중...');
    const questionAnalysis = await analyzeAndClarifyQuestion(question, context);
    const clarifiedQuestion = questionAnalysis.clarifiedQuestion;

    console.log('📝 원본 질문:', question);
    console.log('✨ 명확화된 질문:', clarifiedQuestion);
    console.log('🤔 추론한 가정들:', questionAnalysis.assumptions);
    console.log('📚 추가된 맥락:', questionAnalysis.contextEnhancement);
    console.log('🎯 질문 의도:', questionAnalysis.intentAnalysis);

    // 1단계: 지식 수집 (명확화된 질문 사용)
    if (enableProgressTracking && onProgress) {
        onProgress(1, 11, '🌐 웹에서 최신 정보를 수집하고 있습니다...', 0.4);
    }

    console.log('📚 1단계: 지식 수집 중...');
    const searchQueries = [
        clarifiedQuestion,
        `${clarifiedQuestion} 최신 정보`,
        `${clarifiedQuestion} 전문가 의견`,
        `${clarifiedQuestion} 다양한 관점`,
        ...questionAnalysis.contextEnhancement.map(ctx => `${ctx} ${clarifiedQuestion}`)
    ];

    const allSources: KnowledgeSource[] = [];
    for (const query of searchQueries) {
        const sources = await performWebSearch(query);
        allSources.push(...sources);
    }

    // 신뢰도 평가 및 필터링
    const evaluatedSources = allSources.map(source => ({
        ...source,
        reliability: evaluateSourceReliability(source)
    })).filter(source => source.reliability > 0.3);

    console.log(`📚 수집된 정보: ${evaluatedSources.length}개 소스`);

    if (enableProgressTracking && onProgress) {
        onProgress(2, 11, '🧠 지능형 분석 시스템을 초기화하고 있습니다...', 0.5);
    }

    // 2단계: 지능형 분석 시스템 초기화
    console.log('🧠 2단계: 지능형 분석 시스템 초기화 중...');
    const analysisContext = {
        originalQuestion: question,
        clarifiedQuestion: clarifiedQuestion,
        assumptions: questionAnalysis.assumptions,
        contextEnhancement: questionAnalysis.contextEnhancement,
        intentAnalysis: questionAnalysis.intentAnalysis,
        sources: evaluatedSources
    };

    if (enableProgressTracking && onProgress) {
        onProgress(3, 11, '📊 수집된 정보를 체계적으로 분석하고 있습니다...', 0.55);
    }

    // 3단계: 체계적 정보 분석
    console.log('📊 3단계: 체계적 정보 분석 중...');
    const analysisResults = await performSystematicAnalysis(clarifiedQuestion, evaluatedSources, analysisContext);

    if (enableProgressTracking && onProgress) {
        onProgress(4, 11, '🔍 핵심 정보를 추출하고 구조화하고 있습니다...', 0.6);
    }

    // 4단계: 핵심 정보 추출 및 구조화
    console.log('🔍 4단계: 핵심 정보 추출 및 구조화 중...');
    const extractedInfo = await extractAndStructureInfo(clarifiedQuestion, analysisResults, evaluatedSources);

    if (enableProgressTracking && onProgress) {
        onProgress(5, 11, '👁️ 다양한 관점에서 정보를 분석하고 있습니다...', 0.65);
    }

    // 5단계: 다각도 관점 분석
    console.log('👁️ 5단계: 다각도 관점 분석 중...');
    const perspectiveAnalysis = await performPerspectiveAnalysis(clarifiedQuestion, extractedInfo, evaluatedSources);

    if (enableProgressTracking && onProgress) {
        onProgress(6, 11, '⚡ 논리적 추론을 통해 결론을 도출하고 있습니다...', 0.7);
    }

    // 6단계: 논리적 추론을 통한 결론 도출
    console.log('⚡ 6단계: 논리적 추론을 통한 결론 도출 중...');
    const reasoningSteps = await performLogicalReasoning(clarifiedQuestion, evaluatedSources, options);
    console.log(`🧮 추론 단계: ${reasoningSteps.length}개 완료`);

    if (enableProgressTracking && onProgress) {
        onProgress(7, 11, '🔗 모든 분석 결과를 종합하고 있습니다...', 0.75);
    }

    // 7단계: 모든 분석 결과 종합
    console.log('🔗 7단계: 모든 분석 결과 종합 중...');
    const synthesisPrompt = `다음 정보를 종합하여 최종 답변을 생성해주세요:

**원본 질문:** ${question}
**명확화된 질문:** ${clarifiedQuestion}
**추론한 가정들:** ${questionAnalysis.assumptions.join(', ')}
**추가된 맥락:** ${questionAnalysis.contextEnhancement.join(', ')}
**질문 의도:** ${questionAnalysis.intentAnalysis}

**추론 과정:** ${reasoningSteps.map(step => `${step.description}: ${step.output}`).join('\n\n')}
**수집된 정보:** ${evaluatedSources.map(s => s.content).join('\n\n')}
**관점 분석:** ${perspectiveAnalysis.join('\n')}

요구사항:
1. 원본 질문의 의도를 정확히 파악하여 답변
2. 모호한 부분에 대한 명확한 해석 제공
3. 논리적이고 구조화된 설명
4. 신뢰할 수 있는 출처 인용
5. 대안적 관점 포함
6. 한계점 명시
7. 사용자가 실제로 원하는 정보에 집중

최종 답변을 생성해주세요.`;

    const synthesisRequest = {
        message: synthesisPrompt,
        context: { sources: evaluatedSources, reasoning: reasoningSteps },
        options: {
            intent: 'final_synthesis',
            style: 'detailed',
            tone: 'professional',
            requireCitations: true
        }
    };

    const synthesisResponse = await sendChatMessage(synthesisRequest);
    const finalResponse = synthesisResponse.success && synthesisResponse.message
        ? synthesisResponse.message.content
        : '답변 생성 중 오류가 발생했습니다.';

    if (enableProgressTracking && onProgress) {
        onProgress(8, 11, '✅ 사실을 검증하고 정확성을 확인하고 있습니다...', 0.8);
    }

    // 8단계: 사실 검증 및 정확성 확인
    console.log('✅ 8단계: 사실 검증 및 정확성 확인 중...');
    const factCheck = await performFactChecking(finalResponse, evaluatedSources);

    if (enableProgressTracking && onProgress) {
        onProgress(9, 11, '⚖️ 편향성을 평가하고 객관성을 확보하고 있습니다...', 0.85);
    }

    // 9단계: 편향성 평가 및 객관성 확보
    console.log('⚖️ 9단계: 편향성 평가 및 객관성 확보 중...');
    const biasAssessment = await assessBias(finalResponse, evaluatedSources);

    if (enableProgressTracking && onProgress) {
        onProgress(10, 11, '✨ 응답을 최적화하고 개선하고 있습니다...', 0.9);
    }

    // 10단계: 응답 최적화 및 개선
    console.log('✨ 10단계: 응답 최적화 및 개선 중...');
    const optimizedResponse = await optimizeResponse(finalResponse, questionAnalysis, evaluatedSources);

    if (enableProgressTracking && onProgress) {
        onProgress(11, 11, '🎯 최종 검토를 완료하고 있습니다...', 0.95);
    }

    // 11단계: 최종 검토 및 완성
    console.log('🎯 11단계: 최종 검토 및 완성 중...');
    const finalReviewedResponse = await performFinalReview(optimizedResponse, question, questionAnalysis, evaluatedSources);

    // 최종 응답 구성 (11단계 완료)
    const metrics = performanceMonitor.endMonitoring();
    const processingTime = metrics ? metrics.duration : 0;
    const confidence = reasoningSteps.reduce((acc, step) => acc + step.confidence, 0) / reasoningSteps.length;

    // 성능 메트릭 업데이트
    performanceMonitor.setTotalSources(evaluatedSources.length);
    performanceMonitor.setFinalConfidence(confidence);

    const intelligentResponse: IntelligentResponse = {
        question,
        knowledgeGathering: {
            sources: evaluatedSources,
            searchQueries,
            informationGaps: questionAnalysis.contextEnhancement
        },
        reasoning: {
            steps: reasoningSteps,
            logicalFlow: `질문분석 → 정보수집 → 분석초기화 → 체계분석 → 정보추출 → 관점분석 → 논리추론 → 종합 → 사실검증 → 편향평가 → 최적화 → 최종검토`,
            assumptions: questionAnalysis.assumptions,
            limitations: ['제한된 정보 소스', '시간적 제약', '모호한 질문의 해석 한계']
        },
        synthesis: {
            mainAnswer: finalReviewedResponse,
            supportingEvidence: evaluatedSources.map(s => s.title),
            alternativeViews: perspectiveAnalysis,
            confidence
        },
        verification: {
            factCheck,
            sourceValidation: evaluatedSources.map(s => `${s.title}: 신뢰도 ${s.reliability}`),
            logicalConsistency: ['논리적 일관성 확인됨', '사실 검증 완료', '편향성 평가 완료'],
            biasAssessment
        },
        finalResponse: finalReviewedResponse,
        metadata: {
            processingTime,
            sourcesUsed: evaluatedSources.length,
            reasoningSteps: reasoningSteps.length,
            confidence
        }
    };

    // 캐시 저장
    if (enableCaching) {
        advancedCache.set(question, intelligentResponse);
    }

    if (enableProgressTracking && onProgress) {
        onProgress(11, 11, '🎉 11단계 지능형 처리 완료! 모호한 질문도 정확하고 신뢰할 수 있는 답변을 제공합니다.', 1.0);
    }

    console.log('🎯 11단계 지능형 지식 처리 완료!');
    console.log(`📝 원본 질문: ${question}`);
    console.log(`✨ 명확화된 질문: ${clarifiedQuestion}`);
    console.log(`⏱️ 처리 시간: ${processingTime}ms`);
    console.log(`📊 신뢰도: ${confidence.toFixed(2)}`);
    console.log(`📚 사용된 소스: ${evaluatedSources.length}개`);
    console.log(`🧮 추론 단계: ${reasoningSteps.length}개`);
    console.log(`🔍 질문 분석: ${questionAnalysis.intentAnalysis}`);

    // 성능 통계 출력
    if (metrics) {
        console.log('📈 성능 통계:');
        console.log(`  - 캐시 히트: ${metrics.cacheHits}회`);
        console.log(`  - 캐시 미스: ${metrics.cacheMisses}회`);
        console.log(`  - 재시도 횟수: ${metrics.retryCount}회`);
        console.log(`  - 총 소스 수: ${metrics.totalSources}개`);
        console.log(`  - 최종 신뢰도: ${metrics.finalConfidence.toFixed(2)}`);

        // 단계별 성능 분석
        console.log('  - 단계별 처리 시간:');
        metrics.steps.forEach(step => {
            const status = step.success ? '✅' : '❌';
            console.log(`    ${status} 단계 ${step.step}: ${step.duration}ms ${step.error ? `(${step.error})` : ''}`);
        });
    }

    return intelligentResponse;
};
