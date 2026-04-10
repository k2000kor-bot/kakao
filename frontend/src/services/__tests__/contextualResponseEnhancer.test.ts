/**
 * contextualResponseEnhancer 서비스 테스트
 * 맥락적 응답 강화 서비스 테스트
 */
/// <reference types="jest" />
/* eslint-disable jest/no-conditional-expect */

import { contextualResponseEnhancer, ContextualAnalysisRequest } from '../contextualResponseEnhancer';

// conversationMemoryService 모킹
jest.mock('../conversationMemoryService', () => ({
    conversationMemoryService: {
        getConversationHistory: jest.fn(),
        saveMessage: jest.fn()
    }
}));

describe('contextualResponseEnhancer', () => {
    describe('싱글톤 인스턴스', () => {
        it('싱글톤 인스턴스가 존재해야 함', () => {
            expect(contextualResponseEnhancer).toBeDefined();
        });
    });

    describe('enhanceResponse', () => {
        it('기본 요청에 대한 응답을 생성할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '재개발 프로젝트에 대해 분석해주세요',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.primaryResponse).toBeDefined();
            expect(response.primaryResponse.content).toBeDefined();
            expect(response.primaryResponse.confidence).toBeGreaterThanOrEqual(0);
            expect(response.contextualInsights).toBeDefined();
            expect(response.researcherAnalysis).toBeDefined();
            expect(response.opinionAnalysisInsights).toBeDefined();
            expect(response.textManipulationSuite).toBeDefined();
            expect(response.strategicRecommendations).toBeDefined();
            expect(response.followUpFramework).toBeDefined();
            expect(response.pipelineExtras).toBeUndefined();
        });

        it('요청 pipelineExtras가 응답에 그대로 전달된다', async () => {
            const extras = { pipelineGenerationPhase: 'verify' as const, qaPipelineTraceId: 'trace-ctx' };
            const request: ContextualAnalysisRequest = {
                currentMessage: '요약해 주세요',
                conversationHistory: [],
                pipelineExtras: extras,
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.pipelineExtras).toBe(extras);
            expect(response.pipelineExtras?.pipelineGenerationPhase).toBe('verify');
        });

        it('대화 기록이 있는 요청을 처리할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '시공사 선정 기준은 무엇인가요?',
                conversationHistory: [
                    {
                        message: '재개발 프로젝트에 대해 알려주세요',
                        response: '재개발 프로젝트는 다음과 같은 절차를 따릅니다...',
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.contextualInsights.conversationalFlow).toBeDefined();
            expect(response.contextualInsights.userIntentEvolution).toBeDefined();
        });

        it('사용자 선호도가 포함된 요청을 처리할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '예산 계획을 분석해주세요',
                conversationHistory: [],
                userPreferences: {
                    responseStyle: 'academic',
                    preferredPerspective: 'researcher',
                    detailLevel: 'detailed'
                }
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.primaryResponse.perspective).toBeDefined();
            expect(response.primaryResponse.methodology).toBeDefined();
        });

        it('컨텍스트가 포함된 요청을 처리할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '일정 관리 방안을 제시해주세요',
                conversationHistory: [],
                context: {
                    domain: '재개발',
                    stakeholders: ['주민', '시공사', '정부'],
                    timeframe: '24개월',
                    objectives: ['효율적 일정 관리', '지연 최소화']
                }
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.researcherAnalysis).toBeDefined();
            expect(response.opinionAnalysisInsights.stakeholderPerspectives).toBeDefined();
            expect(Array.isArray(response.opinionAnalysisInsights.stakeholderPerspectives)).toBe(true);
        });

        it('복잡한 대화 기록을 처리할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '종합적인 분석을 요청합니다',
                conversationHistory: [
                    {
                        message: '재개발 프로젝트 절차',
                        response: '절차 설명...',
                        timestamp: new Date(Date.now() - 10000).toISOString()
                    },
                    {
                        message: '시공사 선정 기준',
                        response: '선정 기준 설명...',
                        timestamp: new Date(Date.now() - 5000).toISOString()
                    },
                    {
                        message: '예산 계획',
                        response: '예산 계획 설명...',
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.contextualInsights.emergingPatterns).toBeDefined();
            expect(Array.isArray(response.contextualInsights.emergingPatterns)).toBe(true);
        });

        it('텍스트 조작 스위트를 포함해야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '주장에 대한 반박을 생성해주세요',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.textManipulationSuite).toBeDefined();
            expect(response.textManipulationSuite.enhancedModification).toBeDefined();
            expect(response.textManipulationSuite.systematicCounterargument).toBeDefined();
            expect(response.textManipulationSuite.persuasiveAppeal).toBeDefined();
            expect(response.textManipulationSuite.comprehensiveRebuttal).toBeDefined();
            expect(response.textManipulationSuite.academicExpansion).toBeDefined();
            expect(response.textManipulationSuite.rhetoricalVariations).toBeDefined();
            expect(response.textManipulationSuite.rhetoricalVariations.formal).toBeDefined();
            expect(response.textManipulationSuite.rhetoricalVariations.persuasive).toBeDefined();
            expect(response.textManipulationSuite.rhetoricalVariations.analytical).toBeDefined();
            expect(response.textManipulationSuite.rhetoricalVariations.emotive).toBeDefined();
        });

        it('전략적 권장사항을 포함해야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '커뮤니케이션 전략을 수립해주세요',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.strategicRecommendations).toBeDefined();
            expect(Array.isArray(response.strategicRecommendations.communicationStrategy)).toBe(true);
            expect(Array.isArray(response.strategicRecommendations.riskMitigation)).toBe(true);
            expect(Array.isArray(response.strategicRecommendations.opportunityLeveraging)).toBe(true);
            expect(Array.isArray(response.strategicRecommendations.stakeholderEngagement)).toBe(true);
        });

        it('후속 프레임워크를 포함해야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '추가 질문을 제시해주세요',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.followUpFramework).toBeDefined();
            expect(Array.isArray(response.followUpFramework.deepeningQuestions)).toBe(true);
            expect(Array.isArray(response.followUpFramework.alternativePerspectives)).toBe(true);
            expect(Array.isArray(response.followUpFramework.synthesisOpportunities)).toBe(true);
            expect(Array.isArray(response.followUpFramework.practicalApplications)).toBe(true);
        });

        it('연구자 분석을 포함해야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '학술적 분석을 요청합니다',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.researcherAnalysis).toBeDefined();
            expect(response.researcherAnalysis.academicFramework).toBeDefined();
            expect(response.researcherAnalysis.theoreticalBasis).toBeDefined();
            expect(response.researcherAnalysis.methodologicalApproach).toBeDefined();
            expect(response.researcherAnalysis.evidenceAssessment).toBeDefined();
            expect(response.researcherAnalysis.limitationsAndBias).toBeDefined();
            expect(Array.isArray(response.researcherAnalysis.futureResearchDirections)).toBe(true);
        });

        it('여론분석 인사이트를 포함해야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '여론 분석을 요청합니다',
                conversationHistory: []
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response.opinionAnalysisInsights).toBeDefined();
            expect(response.opinionAnalysisInsights.publicSentimentAssessment).toBeDefined();
            expect(Array.isArray(response.opinionAnalysisInsights.stakeholderPerspectives)).toBe(true);
            expect(response.opinionAnalysisInsights.socialImplications).toBeDefined();
            expect(response.opinionAnalysisInsights.politicalRamifications).toBeDefined();
            expect(Array.isArray(response.opinionAnalysisInsights.mediaInfluenceFactors)).toBe(true);
            expect(response.opinionAnalysisInsights.consensusBuildingPotential).toBeDefined();
        });

        it('오류 발생 시 적절한 에러를 던져야 함', async () => {
            // 잘못된 요청으로 오류 유도 (null이나 undefined 전달)
            const invalidRequest = null as unknown as ContextualAnalysisRequest;

            await expect(
                contextualResponseEnhancer.enhanceResponse(invalidRequest)
            ).rejects.toThrow();
        });
    });

    describe('실제 사용자 시나리오 테스트', () => {
        it('재개발 프로젝트 관련 종합 분석을 수행할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '재개발 프로젝트의 전체적인 분석과 전략을 제시해주세요',
                conversationHistory: [
                    {
                        message: '재개발 프로젝트 절차',
                        response: '재개발 프로젝트는 다음과 같은 절차를 따릅니다...',
                        timestamp: new Date().toISOString()
                    }
                ],
                userPreferences: {
                    responseStyle: 'comprehensive',
                    preferredPerspective: 'researcher',
                    detailLevel: 'exhaustive'
                },
                context: {
                    domain: '재개발',
                    stakeholders: ['주민', '시공사', '정부', '지자체'],
                    timeframe: '24개월',
                    objectives: ['효율적 프로젝트 관리', '이해관계자 만족', '일정 준수']
                }
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.primaryResponse.content.length).toBeGreaterThan(0);
            expect(response.primaryResponse.confidence).toBeGreaterThan(0);
            expect(response.researcherAnalysis.academicFramework.length).toBeGreaterThan(0);
            expect(response.opinionAnalysisInsights.stakeholderPerspectives.length).toBeGreaterThan(0);
            expect(response.strategicRecommendations.communicationStrategy.length).toBeGreaterThan(0);
        });

        it('시공사 선정 관련 전문적 분석을 수행할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '시공사 선정 기준과 절차를 학술적 관점에서 분석해주세요',
                conversationHistory: [],
                userPreferences: {
                    responseStyle: 'academic',
                    preferredPerspective: 'researcher',
                    detailLevel: 'detailed'
                }
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.researcherAnalysis.methodologicalApproach.length).toBeGreaterThan(0);
            expect(response.researcherAnalysis.evidenceAssessment.length).toBeGreaterThan(0);
            expect(response.researcherAnalysis.futureResearchDirections.length).toBeGreaterThan(0);
        });

        it('예산 및 비용 관련 실용적 분석을 수행할 수 있어야 함', async () => {
            const request: ContextualAnalysisRequest = {
                currentMessage: '예산 계획과 비용 최적화 방안을 제시해주세요',
                conversationHistory: [],
                userPreferences: {
                    responseStyle: 'analytical',
                    preferredPerspective: 'analyst',
                    detailLevel: 'standard'
                }
            };

            const response = await contextualResponseEnhancer.enhanceResponse(request);

            expect(response).toBeDefined();
            expect(response.primaryResponse.content.length).toBeGreaterThan(0);
            expect(response.strategicRecommendations.opportunityLeveraging.length).toBeGreaterThan(0);
            expect(response.followUpFramework.practicalApplications.length).toBeGreaterThan(0);
        });
    });
});

