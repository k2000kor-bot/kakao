import enhancedResponseProcessor, { EnhancedResponseContext } from './enhancedResponseProcessor';
import enhancedBackendAPI from './enhancedBackendAPI';
import { errorLogger, toError } from '../utils/errorLogger';

export interface TestResult {
    testName: string;
    success: boolean;
    responseTime: number;
    qualityScore: number;
    confidence: number;
    content: string;
    error?: string;
}

export interface SystemTestReport {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageResponseTime: number;
    averageQualityScore: number;
    averageConfidence: number;
    testResults: TestResult[];
    systemStatus: {
        enhancedProcessor: boolean;
        backendAPI: boolean;
        ultimateAPI: boolean;
        enhancedAPI: boolean;
        standardAPI: boolean;
    };
}

class SystemIntegrationTest {
    private testQuestions = [
        "인공지능의 미래에 대해 설명해주세요",
        "프로젝트 관리의 핵심 요소는 무엇인가요?",
        "기술 문서 작성 시 주의사항을 알려주세요",
        "팀 협업을 위한 효과적인 의사소통 방법은?",
        "데이터 분석 프로젝트의 성공 요인은?"
    ];

    /**
     * 전체 시스템 통합 테스트 실행
     */
    async runFullSystemTest(): Promise<SystemTestReport> {
        errorLogger.info('🧪 전체 시스템 통합 테스트 시작', {
            component: 'systemIntegrationTest',
            action: 'runFullSystemTest',
        });

        const startTime = Date.now();
        const testResults: TestResult[] = [];

        // 1. 시스템 상태 확인
        const systemStatus = await this.checkSystemStatus();

        // 2. 각 품질 수준별 테스트
        const qualityLevels: Array<'standard' | 'enhanced' | 'ultimate'> = ['standard', 'enhanced', 'ultimate'];

        for (const quality of qualityLevels) {
            for (const question of this.testQuestions) {
                const testResult = await this.runSingleTest(question, quality);
                testResults.push(testResult);

                // 테스트 간 간격
                await this.delay(1000);
            }
        }

        // 3. 백엔드 API 직접 테스트
        const backendTests = await this.runBackendAPITests();
        testResults.push(...backendTests);

        const totalTime = Date.now() - startTime;

        // 4. 결과 분석
        const report = this.analyzeTestResults(testResults, systemStatus, totalTime);

        errorLogger.info('✅ 전체 시스템 통합 테스트 완료', {
            component: 'systemIntegrationTest',
            action: 'runFullSystemTest',
            passedTests: report.passedTests,
            totalTests: report.totalTests,
            totalTime,
            averageQualityScore: report.averageQualityScore,
            averageConfidence: report.averageConfidence,
        });

        return report;
    }

    /**
     * 단일 테스트 실행
     */
    private async runSingleTest(question: string, quality: 'standard' | 'enhanced' | 'ultimate'): Promise<TestResult> {
        const testName = `${quality.toUpperCase()} 품질 - ${question.substring(0, 20)}...`;
        const startTime = Date.now();

        try {
            const context: EnhancedResponseContext = {
                userInput: question,
                conversationHistory: [],
                projectContext: {},
                userPreferences: {
                    responseStyle: quality === 'ultimate' ? 'technical' : 'conversational',
                    detailLevel: 'balanced',
                    language: 'korean',
                    tone: 'friendly'
                },
                currentTime: new Date()
            };

            const result = await enhancedResponseProcessor.processEnhancedResponse(question, context);

            return {
                testName,
                success: true,
                responseTime: Date.now() - startTime,
                qualityScore: result.qualityScore,
                confidence: result.confidence,
                content: result.content.substring(0, 100) + '...'
            };

        } catch (error) {
            return {
                testName,
                success: false,
                responseTime: Date.now() - startTime,
                qualityScore: 0,
                confidence: 0,
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 백엔드 API 직접 테스트
     */
    private async runBackendAPITests(): Promise<TestResult[]> {
        const results: TestResult[] = [];

        try {
            // Ultimate API 테스트
            const ultimateResult = await this.testBackendAPI('ultimate', '궁극의 통합 응답 시스템 테스트');
            results.push(ultimateResult);

            // Enhanced API 테스트
            const enhancedResult = await this.testBackendAPI('enhanced', '고급 통합 API 테스트');
            results.push(enhancedResult);

            // Standard API 테스트
            const standardResult = await this.testBackendAPI('standard', '기본 통합 API 테스트');
            results.push(standardResult);

        } catch (error) {
            const err = toError(error);
            errorLogger.error('백엔드 API 테스트 실패', err, {
                component: 'systemIntegrationTest',
                action: 'runBackendAPITests',
            });
        }

        return results;
    }

    /**
     * 개별 백엔드 API 테스트
     */
    private async testBackendAPI(quality: 'standard' | 'enhanced' | 'ultimate', testName: string): Promise<TestResult> {
        const startTime = Date.now();

        try {
            const response = await enhancedBackendAPI.generateHighQualityResponse({
                userInput: "테스트 질문입니다. 간단한 답변을 해주세요.",
                context: {},
                options: {
                    quality,
                    style: 'conversational',
                    detailLevel: 'balanced',
                    tone: 'friendly'
                }
            });

            return {
                testName,
                success: response.success,
                responseTime: Date.now() - startTime,
                qualityScore: response.metadata.qualityScore,
                confidence: response.confidence,
                content: response.content.substring(0, 100) + '...'
            };

        } catch (error) {
            return {
                testName,
                success: false,
                responseTime: Date.now() - startTime,
                qualityScore: 0,
                confidence: 0,
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 시스템 상태 확인
     */
    private async checkSystemStatus(): Promise<SystemTestReport['systemStatus']> {
        const status = {
            enhancedProcessor: true, // 프론트엔드 시스템은 항상 사용 가능
            backendAPI: false,
            ultimateAPI: false,
            enhancedAPI: false,
            standardAPI: false
        };

        try {
            const backendStatus = await enhancedBackendAPI.checkBackendStatus();
            status.backendAPI = true;
            status.ultimateAPI = backendStatus.ultimate;
            status.enhancedAPI = backendStatus.enhanced;
            status.standardAPI = backendStatus.standard;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('백엔드 상태 확인 실패', err, {
                component: 'systemIntegrationTest',
                action: 'checkSystemStatus',
            });
        }

        return status;
    }

    /**
     * 테스트 결과 분석
     */
    private analyzeTestResults(
        results: TestResult[],
        systemStatus: SystemTestReport['systemStatus'],
        _totalTime: number
    ): SystemTestReport {
        const successfulTests = results.filter(r => r.success);
        const failedTests = results.filter(r => !r.success);

        const averageResponseTime = successfulTests.length > 0
            ? successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length
            : 0;

        const averageQualityScore = successfulTests.length > 0
            ? successfulTests.reduce((sum, r) => sum + r.qualityScore, 0) / successfulTests.length
            : 0;

        const averageConfidence = successfulTests.length > 0
            ? successfulTests.reduce((sum, r) => sum + r.confidence, 0) / successfulTests.length
            : 0;

        return {
            totalTests: results.length,
            passedTests: successfulTests.length,
            failedTests: failedTests.length,
            averageResponseTime,
            averageQualityScore,
            averageConfidence,
            testResults: results,
            systemStatus
        };
    }

    /**
     * 지연 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 백엔드 상태 확인
     */
    async checkBackendStatus(): Promise<{
        ultimate: boolean;
        enhanced: boolean;
        standard: boolean;
        overall: boolean;
    }> {
        errorLogger.info('🔍 백엔드 상태 확인 시작', {
            component: 'systemIntegrationTest',
            action: 'checkBackendStatus',
        });

        const status = await enhancedBackendAPI.checkBackendStatus();
        const overall = status.ultimate || status.enhanced || status.standard;

        errorLogger.info('📊 백엔드 상태 확인 결과', {
            component: 'systemIntegrationTest',
            action: 'checkBackendStatus',
            ultimate: status.ultimate,
            enhanced: status.enhanced,
            standard: status.standard,
            overall,
        });

        return {
            ...status,
            overall
        };
    }

    /**
     * 성능 벤치마크 테스트
     */
    async runPerformanceBenchmark(): Promise<{
        enhancedProcessor: number;
        backendAPI: number;
        averageQuality: number;
    }> {
        errorLogger.info('🏃 성능 벤치마크 시작', {
            component: 'systemIntegrationTest',
            action: 'runPerformanceBenchmark',
        });

        const testQuestion = "인공지능 기술의 현재와 미래에 대해 상세히 설명해주세요";
        const iterations = 5;

        // Enhanced Processor 벤치마크
        const enhancedTimes: number[] = [];
        const enhancedQualities: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            try {
                const context: EnhancedResponseContext = {
                    userInput: testQuestion,
                    conversationHistory: [],
                    projectContext: {},
                    userPreferences: {
                        responseStyle: 'technical',
                        detailLevel: 'detailed',
                        language: 'korean',
                        tone: 'professional'
                    },
                    currentTime: new Date()
                };

                const result = await enhancedResponseProcessor.processEnhancedResponse(testQuestion, context);
                enhancedTimes.push(Date.now() - startTime);
                enhancedQualities.push(result.qualityScore);
            } catch (error) {
                const err = toError(error);
                errorLogger.error(`Enhanced Processor 벤치마크 ${i + 1} 실패`, err, {
                    component: 'systemIntegrationTest',
                    action: 'runPerformanceBenchmark',
                    iteration: i + 1,
                    benchmarkType: 'enhancedProcessor',
                });
            }

            await this.delay(2000); // 2초 간격
        }

        // Backend API 벤치마크
        const backendTimes: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            try {
                await enhancedBackendAPI.generateHighQualityResponse({
                    userInput: testQuestion,
                    context: {},
                    options: {
                        quality: 'ultimate',
                        style: 'technical',
                        detailLevel: 'detailed',
                        tone: 'professional'
                    }
                });
                backendTimes.push(Date.now() - startTime);
            } catch (error) {
                const err = toError(error);
                errorLogger.error(`Backend API 벤치마크 ${i + 1} 실패`, err, {
                    component: 'systemIntegrationTest',
                    action: 'runPerformanceBenchmark',
                    iteration: i + 1,
                    benchmarkType: 'backendAPI',
                });
            }

            await this.delay(2000); // 2초 간격
        }

        const avgEnhancedTime = enhancedTimes.length > 0
            ? enhancedTimes.reduce((sum, time) => sum + time, 0) / enhancedTimes.length
            : 0;

        const avgBackendTime = backendTimes.length > 0
            ? backendTimes.reduce((sum, time) => sum + time, 0) / backendTimes.length
            : 0;

        const avgQuality = enhancedQualities.length > 0
            ? enhancedQualities.reduce((sum, quality) => sum + quality, 0) / enhancedQualities.length
            : 0;

        errorLogger.info('📊 성능 벤치마크 결과', {
            component: 'systemIntegrationTest',
            action: 'runPerformanceBenchmark',
            avgEnhancedTime,
            avgBackendTime,
            avgQuality,
        });

        return {
            enhancedProcessor: avgEnhancedTime,
            backendAPI: avgBackendTime,
            averageQuality: avgQuality
        };
    }
}

// 싱글톤 인스턴스 생성
const systemIntegrationTest = new SystemIntegrationTest();

export default systemIntegrationTest;
