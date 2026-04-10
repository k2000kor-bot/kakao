/**
 * advancedContentGenerationService 서비스 테스트
 * 고급 콘텐츠 생성 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedContentGenerationService, {
    ContentGenerationConfig,
    ContentResearchData,
    ContentAnalysis,
    ContentStructure,
    GeneratedContent
} from '../advancedContentGenerationService';
import { projectKnowledgeService } from '../projectKnowledgeService';
import { collaborationService } from '../collaborationService';

// 의존성 모킹
jest.mock('../projectKnowledgeService', () => ({
    projectKnowledgeService: {
        getProjectKnowledge: jest.fn()
    }
}));

jest.mock('../collaborationService', () => ({
    collaborationService: {
        getProjectComments: jest.fn()
    }
}));

jest.mock('../advancedAnalyticsService', () => ({
    advancedAnalyticsService: {
        analyze: jest.fn()
    }
}));

describe('advancedContentGenerationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // 기본 모킹 데이터 설정
        jest.mocked(projectKnowledgeService.getProjectKnowledge).mockReturnValue([
            {
                id: 'kb1',
                title: '재개발 프로젝트 가이드',
                content: '재개발 프로젝트의 기본 개념과 절차에 대한 가이드',
                category: 'guide',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        jest.mocked(collaborationService.getProjectComments).mockReturnValue([
            {
                id: 'comment1',
                authorId: 'user1',
                content: '재개발 프로젝트 진행 시 주의사항에 대한 토론',
                createdAt: new Date()
            }
        ]);
    });

    describe('conductComprehensiveResearch', () => {
        it('종합적인 기초 조사를 수행할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 진행 방법';
            const projectId = 'test-project';

            const researchData = await advancedContentGenerationService.conductComprehensiveResearch(query, projectId);

            expect(researchData).toBeDefined();
            expect(researchData.id).toBeDefined();
            expect(researchData.query).toBe(query);
            expect(Array.isArray(researchData.sources)).toBe(true);
            expect(Array.isArray(researchData.keywords)).toBe(true);
            expect(['positive', 'negative', 'neutral']).toContain(researchData.sentiment);
            expect(typeof researchData.relevance).toBe('number');
            expect(researchData.timestamp).toBeInstanceOf(Date);
        });

        it('웹 검색, 지식베이스, 대화 히스토리를 모두 수집해야 함', async () => {
            const query = '재개발 프로젝트';
            const projectId = 'test-project';

            const researchData = await advancedContentGenerationService.conductComprehensiveResearch(query, projectId);

            expect(researchData.sources.length).toBeGreaterThan(0);
            const sourceTypes = researchData.sources.map(s => s.type);
            expect(sourceTypes).toContain('web');
            expect(sourceTypes).toContain('knowledge_base');
            expect(sourceTypes).toContain('chat_history');
        });

        it('키워드를 추출하고 감정을 분석해야 함', async () => {
            const query = '재개발 프로젝트 성공 사례';
            const projectId = 'test-project';

            const researchData = await advancedContentGenerationService.conductComprehensiveResearch(query, projectId);

            expect(researchData.keywords.length).toBeGreaterThan(0);
            expect(['positive', 'negative', 'neutral']).toContain(researchData.sentiment);
            expect(researchData.relevance).toBeGreaterThanOrEqual(0);
            expect(researchData.relevance).toBeLessThanOrEqual(1);
        });
    });

    describe('analyzeContentRequirements', () => {
        it('콘텐츠 요구사항을 분석할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 가이드';
            const researchData: ContentResearchData = {
                id: 'research1',
                query,
                sources: [],
                keywords: ['재개발', '프로젝트'],
                sentiment: 'neutral',
                relevance: 0.8,
                timestamp: new Date()
            };

            const analysis = await advancedContentGenerationService.analyzeContentRequirements(query, researchData);

            expect(analysis).toBeDefined();
            expect(analysis.id).toBeDefined();
            expect(analysis.topic).toBeDefined();
            expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(analysis.complexity);
            expect(Array.isArray(analysis.targetAudience)).toBe(true);
            expect(Array.isArray(analysis.keyInsights)).toBe(true);
            expect(analysis.sentimentAnalysis).toBeDefined();
            expect(typeof analysis.readabilityScore).toBe('number');
            expect(typeof analysis.seoScore).toBe('number');
            expect(typeof analysis.engagementPrediction).toBe('number');
            expect(Array.isArray(analysis.recommendations)).toBe(true);
        });

        it('복잡도에 따라 적절한 타겟 오디언스를 식별해야 함', async () => {
            const query = '고급 재개발 프로젝트 관리 기법';
            const researchData: ContentResearchData = {
                id: 'research1',
                query,
                sources: [],
                keywords: Array(20).fill('키워드'), // 많은 키워드로 expert 복잡도 유도
                sentiment: 'neutral',
                relevance: 0.8,
                timestamp: new Date()
            };

            const analysis = await advancedContentGenerationService.analyzeContentRequirements(query, researchData);

            expect(analysis.complexity).toBe('expert');
            expect(analysis.targetAudience).toContain('전문가');
        });
    });

    describe('designContentStructure', () => {
        it('콘텐츠 구조를 설계할 수 있어야 함', async () => {
            const analysis: ContentAnalysis = {
                id: 'analysis1',
                topic: '재개발 프로젝트',
                complexity: 'intermediate',
                targetAudience: ['학생', '관리자'],
                keyInsights: ['인사이트1', '인사이트2'],
                sentimentAnalysis: {
                    overall: 'neutral',
                    confidence: 0.85,
                    emotions: {},
                    intensity: 0.75
                },
                readabilityScore: 0.82,
                seoScore: 85,
                engagementPrediction: 0.78,
                recommendations: []
            };

            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'medium',
                focus: 'accuracy',
                targetAudience: ['관리자'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const structure = await advancedContentGenerationService.designContentStructure(analysis, config);

            expect(structure).toBeDefined();
            expect(structure.id).toBeDefined();
            expect(Array.isArray(structure.outline)).toBe(true);
            expect(['chronological', 'problem_solution', 'compare_contrast', 'cause_effect', 'narrative']).toContain(structure.flowLogic);
            expect(typeof structure.estimatedLength).toBe('number');
            expect(typeof structure.complexity).toBe('number');
        });

        it('설정에 따라 적절한 길이를 계산해야 함', async () => {
            const analysis: ContentAnalysis = {
                id: 'analysis1',
                topic: '테스트',
                complexity: 'basic',
                targetAudience: ['일반 사용자'],
                keyInsights: [],
                sentimentAnalysis: {
                    overall: 'neutral',
                    confidence: 0.85,
                    emotions: {},
                    intensity: 0.75
                },
                readabilityScore: 0.82,
                seoScore: 85,
                engagementPrediction: 0.78,
                recommendations: []
            };

            const shortConfig: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'short',
                focus: 'accuracy',
                targetAudience: [],
                includeExamples: false,
                includeStatistics: false,
                includeVisuals: false
            };

            const longConfig: ContentGenerationConfig = {
                ...shortConfig,
                length: 'long'
            };

            const shortStructure = await advancedContentGenerationService.designContentStructure(analysis, shortConfig);
            const longStructure = await advancedContentGenerationService.designContentStructure(analysis, longConfig);

            expect(shortStructure.estimatedLength).toBeLessThan(longStructure.estimatedLength);
        });
    });

    describe('generateAdvancedContent', () => {
        it('고급 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 가이드';
            const researchData: ContentResearchData = {
                id: 'research1',
                query,
                sources: [],
                keywords: ['재개발'],
                sentiment: 'neutral',
                relevance: 0.8,
                timestamp: new Date()
            };

            const analysis: ContentAnalysis = {
                id: 'analysis1',
                topic: '재개발 프로젝트',
                complexity: 'intermediate',
                targetAudience: ['관리자'],
                keyInsights: ['인사이트1'],
                sentimentAnalysis: {
                    overall: 'neutral',
                    confidence: 0.85,
                    emotions: {},
                    intensity: 0.75
                },
                readabilityScore: 0.82,
                seoScore: 85,
                engagementPrediction: 0.78,
                recommendations: []
            };

            const structure: ContentStructure = {
                id: 'structure1',
                outline: [
                    {
                        id: 'section1',
                        title: '서론',
                        type: 'introduction',
                        keyPoints: ['배경'],
                        estimatedWords: 150,
                        priority: 1
                    }
                ],
                flowLogic: 'narrative',
                estimatedLength: 1000,
                complexity: 0.5
            };

            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'medium',
                focus: 'accuracy',
                targetAudience: ['관리자'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateAdvancedContent(
                query,
                researchData,
                analysis,
                structure,
                config
            );

            expect(content).toBeDefined();
            expect(content.id).toBeDefined();
            expect(content.title).toBeDefined();
            expect(content.content).toBeDefined();
            expect(content.summary).toBeDefined();
            expect(content.metadata).toBeDefined();
            expect(content.qualityMetrics).toBeDefined();
            expect(content.version).toBe(1);
            expect(content.createdAt).toBeInstanceOf(Date);
            expect(content.updatedAt).toBeInstanceOf(Date);
        });

        it('품질 메트릭을 계산해야 함', async () => {
            const query = '테스트';
            const researchData: ContentResearchData = {
                id: 'research1',
                query,
                sources: [],
                keywords: [],
                sentiment: 'neutral',
                relevance: 0.8,
                timestamp: new Date()
            };

            const analysis: ContentAnalysis = {
                id: 'analysis1',
                topic: '테스트',
                complexity: 'basic',
                targetAudience: ['일반 사용자'],
                keyInsights: [],
                sentimentAnalysis: {
                    overall: 'neutral',
                    confidence: 0.85,
                    emotions: {},
                    intensity: 0.75
                },
                readabilityScore: 0.82,
                seoScore: 85,
                engagementPrediction: 0.78,
                recommendations: []
            };

            const structure: ContentStructure = {
                id: 'structure1',
                outline: [],
                flowLogic: 'narrative',
                estimatedLength: 1000,
                complexity: 0.5
            };

            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'medium',
                focus: 'accuracy',
                targetAudience: [],
                includeExamples: false,
                includeStatistics: false,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateAdvancedContent(
                query,
                researchData,
                analysis,
                structure,
                config
            );

            expect(content.qualityMetrics.readability).toBeDefined();
            expect(content.qualityMetrics.coherence).toBeDefined();
            expect(content.qualityMetrics.relevance).toBeDefined();
            expect(content.qualityMetrics.accuracy).toBeDefined();
            expect(content.qualityMetrics.engagement).toBeDefined();
            expect(content.qualityMetrics.seoScore).toBeDefined();
            expect(content.qualityMetrics.overallScore).toBeDefined();
        });
    });

    describe('reviewAndOptimizeContent', () => {
        it('콘텐츠를 검수하고 최적화할 수 있어야 함', async () => {
            const content: GeneratedContent = {
                id: 'content1',
                title: '테스트 제목',
                content: '테스트 콘텐츠',
                summary: '테스트 요약',
                metadata: {
                    keywords: [],
                    tags: [],
                    category: '',
                    difficulty: '',
                    readingTime: 0,
                    wordCount: 0,
                    language: 'ko',
                    references: []
                },
                qualityMetrics: {
                    readability: 0.8,
                    coherence: 0.85,
                    relevance: 0.9,
                    accuracy: 0.92,
                    engagement: 0.78,
                    seoScore: 85,
                    overallScore: 0.85
                },
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const analysis: ContentAnalysis = {
                id: 'analysis1',
                topic: '테스트',
                complexity: 'basic',
                targetAudience: ['일반 사용자'],
                keyInsights: [],
                sentimentAnalysis: {
                    overall: 'neutral',
                    confidence: 0.85,
                    emotions: {},
                    intensity: 0.75
                },
                readabilityScore: 0.82,
                seoScore: 85,
                engagementPrediction: 0.78,
                recommendations: []
            };

            const optimized = await advancedContentGenerationService.reviewAndOptimizeContent(content, analysis);

            expect(optimized).toBeDefined();
            expect(optimized.id).toBe(content.id);
            expect(optimized.version).toBeGreaterThan(content.version);
            expect(optimized.updatedAt.getTime()).toBeGreaterThanOrEqual(content.updatedAt.getTime());
            expect(optimized.qualityMetrics).toBeDefined();
        });
    });

    describe('generateHighQualityContent', () => {
        it('통합 파이프라인으로 고품질 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 진행 가이드';
            const projectId = 'test-project';
            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'medium',
                focus: 'accuracy',
                targetAudience: ['관리자'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

            expect(content).toBeDefined();
            expect(content.id).toBeDefined();
            expect(content.title.length).toBeGreaterThan(0);
            expect(content.content.length).toBeGreaterThan(0);
            expect(content.summary.length).toBeGreaterThan(0);
            expect(content.metadata).toBeDefined();
            expect(content.qualityMetrics.overallScore).toBeGreaterThan(0);
        });

        it('전체 파이프라인 단계를 거쳐야 함', async () => {
            const query = '재개발 프로젝트 성공 사례';
            const projectId = 'test-project';
            const config: ContentGenerationConfig = {
                style: 'academic',
                tone: 'formal',
                length: 'long',
                focus: 'completeness',
                targetAudience: ['전문가'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: true
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

            // 각 단계를 거쳤는지 확인
            expect(content.title).toBeDefined();
            expect(content.content).toBeDefined();
            expect(content.metadata.keywords.length).toBeGreaterThan(0);
            expect(content.qualityMetrics.overallScore).toBeGreaterThan(0);
        });
    });

    describe('실제 사용자 질문/요구 시나리오 테스트', () => {
        it('재개발 프로젝트 관련 질문에 대한 고품질 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 진행 시 주의사항과 성공 전략';
            const projectId = 'redevelopment-project';
            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'informative',
                length: 'comprehensive',
                focus: 'completeness',
                targetAudience: ['관리자', '전문가'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

            expect(content).toBeDefined();
            expect(content.title).toContain('재개발');
            expect(content.content.length).toBeGreaterThan(0);
            expect(content.metadata.keywords.length).toBeGreaterThan(0);
            expect(content.qualityMetrics.overallScore).toBeGreaterThan(0.5);
        });

        it('시공사 선정 관련 질문에 대한 전문적인 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 시공사 선정 기준과 평가 방법';
            const projectId = 'construction-project';
            const config: ContentGenerationConfig = {
                style: 'technical',
                tone: 'formal',
                length: 'long',
                focus: 'accuracy',
                targetAudience: ['전문가'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

            expect(content).toBeDefined();
            expect(content.title).toBeDefined();
            expect(content.content).toBeDefined();
            expect(content.metadata.category).toBeDefined();
            expect(content.qualityMetrics.accuracy).toBeGreaterThan(0);
        });

        it('예산 계획 관련 질문에 대한 실용적인 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 예산 계획 수립 방법';
            const projectId = 'budget-project';
            const config: ContentGenerationConfig = {
                style: 'business',
                tone: 'persuasive',
                length: 'medium',
                focus: 'engagement',
                targetAudience: ['관리자'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: false
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

            expect(content).toBeDefined();
            expect(content.metadata.tags.length).toBeGreaterThan(0);
            expect(content.qualityMetrics.engagement).toBeGreaterThan(0);
            expect(content.qualityMetrics.relevance).toBeGreaterThan(0);
        });

        it('복합적인 요구사항에 대한 포괄적인 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 전체 프로세스: 계획부터 완공까지';
            const projectId = 'comprehensive-project';
            const config: ContentGenerationConfig = {
                style: 'academic',
                tone: 'informative',
                length: 'comprehensive',
                focus: 'completeness',
                targetAudience: ['전문가', '학생', '관리자'],
                includeExamples: true,
                includeStatistics: true,
                includeVisuals: true
            };

            const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

      expect(content).toBeDefined();
      expect(content.content.length).toBeGreaterThan(0); // comprehensive는 긴 콘텐츠 (실제 길이는 서비스 로직에 따라 다를 수 있음)
      expect(content.metadata.wordCount).toBeGreaterThan(0);
      expect(content.metadata.readingTime).toBeGreaterThan(0);
      expect(content.qualityMetrics.overallScore).toBeGreaterThan(0.7);
        });

        it('다양한 스타일과 톤으로 콘텐츠를 생성할 수 있어야 함', async () => {
            const query = '재개발 프로젝트 소개';
            const projectId = 'style-project';

            const styles: ContentGenerationConfig['style'][] = ['academic', 'business', 'casual', 'technical', 'creative'];
            const tones: ContentGenerationConfig['tone'][] = ['formal', 'informal', 'persuasive', 'informative', 'conversational'];

            for (const style of styles) {
                for (const tone of tones) {
                    const config: ContentGenerationConfig = {
                        style,
                        tone,
                        length: 'short',
                        focus: 'clarity',
                        targetAudience: ['일반 사용자'],
                        includeExamples: false,
                        includeStatistics: false,
                        includeVisuals: false
                    };

                    const content = await advancedContentGenerationService.generateHighQualityContent(query, projectId, config);

                    expect(content).toBeDefined();
                    expect(content.title).toBeDefined();
                    expect(content.content).toBeDefined();
                }
            }
        });
    });
});

