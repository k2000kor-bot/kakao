import masterWritingEngine, {
    MasterWritingEngine,
    MasterWritingProfile,
    MasterWritingRequest,
    MasterWritingResponse,
    WritingTemplate
} from '../masterWritingEngine';
import { politicalWritingEngine } from '../politicalWritingEngine';
import { generationWritingEngine } from '../generationWritingEngine';
import { stanceWritingEngine } from '../stanceWritingEngine';

// 다른 엔진들 모킹
jest.mock('../politicalWritingEngine');
jest.mock('../generationWritingEngine');
jest.mock('../stanceWritingEngine');

describe('MasterWritingEngine', () => {
    let engine: MasterWritingEngine;

    beforeEach(() => {
        engine = new MasterWritingEngine();
        jest.clearAllMocks();

        // 모킹된 엔진들의 반환값 설정
        (politicalWritingEngine.generatePoliticalWriting as jest.Mock) = jest.fn().mockResolvedValue({
            generatedText: '정치적 글쓰기 텍스트',
            keyArguments: ['정치적 논점 1', '정치적 논점 2']
        });

        (generationWritingEngine.generateGenerationWriting as jest.Mock) = jest.fn().mockResolvedValue({
            generatedText: '세대별 글쓰기 텍스트',
            generationalCharacteristics: ['세대 특성 1', '세대 특성 2']
        });

        (stanceWritingEngine.generateStanceWriting as jest.Mock) = jest.fn().mockResolvedValue({
            generatedText: '입장별 글쓰기 텍스트',
            stanceIndicators: ['입장 표시 1'],
            rhetoricalDevices: ['수사법 1'],
            persuasionElements: ['설득 요소 1']
        });
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(masterWritingEngine).toBeDefined();
            expect(masterWritingEngine).toBeInstanceOf(MasterWritingEngine);
        });

        it('새 인스턴스 생성', () => {
            expect(engine).toBeInstanceOf(MasterWritingEngine);
        });
    });

    describe('generateMasterWriting', () => {
        const baseProfile: MasterWritingProfile = {
            politicalSpectrum: 'conservative',
            politicalStance: 'support',
            ageGroup: '50s',
            generationStyle: 'formal_traditional',
            stancePosition: 'support',
            argumentStyle: 'logical',
            emotionIntensity: 'moderate',
            toneIntensity: 'firm',
            strengthLevel: 'moderate',
            formalityLevel: 'formal',
            useHonorific: true,
            useMilitantLanguage: false,
            useAggressiveRhetoric: false,
            includePersonalExperience: true,
            includeCounterArguments: true,
            includeEvidence: true,
            useTraditionalExpressions: true,
            showAuthorityTone: false
        };

        it('마스터 글쓰기를 생성해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: 'AI의 미래',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            const response = await engine.generateMasterWriting(request);

            expect(response).toBeDefined();
            expect(response.generatedText).toBeDefined();
            expect(response.generatedText.length).toBeGreaterThan(0);
            expect(response.analysisReport).toBeDefined();
            expect(response.styleMetrics).toBeDefined();
            expect(response.recommendations).toBeInstanceOf(Array);
        });

        it('정치적 글쓰기 엔진을 호출해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '정치 주제',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            await engine.generateMasterWriting(request);

            expect(politicalWritingEngine.generatePoliticalWriting).toHaveBeenCalled();
        });

        it('세대별 글쓰기 엔진을 호출해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '세대 주제',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            await engine.generateMasterWriting(request);

            expect(generationWritingEngine.generateGenerationWriting).toHaveBeenCalled();
        });

        it('입장별 글쓰기 엔진을 호출해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '입장 주제',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            await engine.generateMasterWriting(request);

            expect(stanceWritingEngine.generateStanceWriting).toHaveBeenCalled();
        });

        it('분석 리포트를 생성해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '분석 주제',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'analysis',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'inform'
            };

            const response = await engine.generateMasterWriting(request);

            expect(response.analysisReport.politicalCharacteristics).toBeDefined();
            expect(response.analysisReport.generationalCharacteristics).toBeDefined();
            expect(response.analysisReport.stanceCharacteristics).toBeDefined();
            expect(response.analysisReport.strengthAnalysis).toBeDefined();
            expect(response.analysisReport.languageFeatures).toBeDefined();
        });

        it('스타일 메트릭을 계산해야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '메트릭 주제',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            const response = await engine.generateMasterWriting(request);

            expect(response.styleMetrics.formalityScore).toBeDefined();
            expect(response.styleMetrics.aggressivenessScore).toBeDefined();
            expect(response.styleMetrics.persuasivenessScore).toBeDefined();
            expect(response.styleMetrics.authorityScore).toBeDefined();
            expect(response.styleMetrics.emotionalIntensityScore).toBeDefined();
        });

        it('원본 텍스트를 포함할 수 있어야 함', async () => {
            const request: MasterWritingRequest = {
                topic: '원본 텍스트 주제',
                originalText: '원본 텍스트입니다.',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            const response = await engine.generateMasterWriting(request);

            expect(response).toBeDefined();
            expect(politicalWritingEngine.generatePoliticalWriting).toHaveBeenCalledWith(
                expect.objectContaining({ originalText: '원본 텍스트입니다.' })
            );
        });

        it('다양한 출력 형식을 지원해야 함', async () => {
            const formats: MasterWritingRequest['outputFormat'][] = [
                'essay', 'opinion', 'rebuttal', 'support', 'analysis', 'critique'
            ];

            for (const format of formats) {
                const request: MasterWritingRequest = {
                    topic: '형식 테스트',
                    profile: baseProfile,
                    targetLength: 500,
                    outputFormat: format,
                    tone: 'formal',
                    targetAudience: 'general',
                    purpose: 'persuade'
                };

                const response = await engine.generateMasterWriting(request);
                expect(response).toBeDefined();
            }
        });

        it('다양한 목적을 지원해야 함', async () => {
            const purposes: MasterWritingRequest['purpose'][] = [
                'persuade', 'inform', 'criticize', 'support', 'educate', 'provoke'
            ];

            for (const purpose of purposes) {
                const request: MasterWritingRequest = {
                    topic: '목적 테스트',
                    profile: baseProfile,
                    targetLength: 500,
                    outputFormat: 'opinion',
                    tone: 'formal',
                    targetAudience: 'general',
                    purpose
                };

                const response = await engine.generateMasterWriting(request);
                expect(response).toBeDefined();
            }
        });

        it('에러 발생 시 적절히 처리해야 함', async () => {
            (politicalWritingEngine.generatePoliticalWriting as jest.Mock).mockRejectedValueOnce(
                new Error('정치적 글쓰기 실패')
            );

            const request: MasterWritingRequest = {
                topic: '에러 테스트',
                profile: baseProfile,
                targetLength: 500,
                outputFormat: 'opinion',
                tone: 'formal',
                targetAudience: 'general',
                purpose: 'persuade'
            };

            await expect(engine.generateMasterWriting(request)).rejects.toThrow('마스터 글쓰기 생성에 실패했습니다.');
        });
    });

    describe('generateFromTemplate', () => {
        it('템플릿 기반 글쓰기를 생성해야 함', async () => {
            const response = await engine.generateFromTemplate('conservative_middle_firm', '템플릿 주제');

            expect(response).toBeDefined();
            expect(response.generatedText).toBeDefined();
        });

        it('모든 템플릿에 대해 글쓰기를 생성할 수 있어야 함', async () => {
            const templates: WritingTemplate[] = [
                'extreme_right_elderly_militant',
                'progressive_young_passionate',
                'conservative_middle_firm',
                'centrist_mature_balanced',
                'militant_opposition_combative',
                'gentle_support_respectful',
                'academic_neutral_formal',
                'populist_emotional_aggressive'
            ];

            for (const template of templates) {
                const response = await engine.generateFromTemplate(template, '템플릿 테스트');
                expect(response).toBeDefined();
            }
        });

        it('커스터마이징 옵션을 적용해야 함', async () => {
            const customizations: Partial<MasterWritingProfile> = {
                strengthLevel: 'extreme',
                useMilitantLanguage: true
            };

            const response = await engine.generateFromTemplate(
                'conservative_middle_firm',
                '커스터마이징 주제',
                customizations
            );

            expect(response).toBeDefined();
        });

        it('알 수 없는 템플릿에 대해 에러를 발생시켜야 함', async () => {
            await expect(
                engine.generateFromTemplate('unknown_template' as WritingTemplate, '주제')
            ).rejects.toThrow('Unknown template');
        });
    });

    describe('quickWrite', () => {
        it('빠른 글쓰기를 생성해야 함', async () => {
            const text = await engine.quickWrite('빠른 글쓰기 주제', {
                stance: 'support',
                tone: 'firm',
                age: '50s',
                political: 'conservative'
            });

            expect(text).toBeDefined();
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
        });

        it('다양한 옵션 조합에 대해 글쓰기를 생성해야 함', async () => {
            const stances: Array<'support' | 'oppose' | 'neutral'> = ['support', 'oppose', 'neutral'];
            const tones: Array<'gentle' | 'firm' | 'aggressive'> = ['gentle', 'firm', 'aggressive'];
            const ages: Array<'50s' | '60s' | '70s'> = ['50s', '60s', '70s'];
            const politicals: Array<'conservative' | 'progressive' | 'center'> = ['conservative', 'progressive', 'center'];

            for (const stance of stances) {
                for (const tone of tones) {
                    for (const age of ages) {
                        for (const political of politicals) {
                            const text = await engine.quickWrite('빠른 글쓰기', {
                                stance,
                                tone,
                                age,
                                political
                            });
                            expect(text).toBeDefined();
                        }
                    }
                }
            }
        });
    });

    describe('getAvailableTemplates', () => {
        it('사용 가능한 템플릿 목록을 반환해야 함', () => {
            const templates = engine.getAvailableTemplates();

            expect(templates).toBeInstanceOf(Array);
            expect(templates.length).toBeGreaterThan(0);
        });

        it('모든 템플릿이 포함되어야 함', () => {
            const templates = engine.getAvailableTemplates();
            const expectedTemplates: WritingTemplate[] = [
                'extreme_right_elderly_militant',
                'progressive_young_passionate',
                'conservative_middle_firm',
                'centrist_mature_balanced',
                'militant_opposition_combative',
                'gentle_support_respectful',
                'academic_neutral_formal',
                'populist_emotional_aggressive'
            ];

            expectedTemplates.forEach(template => {
                expect(templates).toContain(template);
            });
        });
    });

    describe('getTemplateDescription', () => {
        it('템플릿 설명을 반환해야 함', () => {
            const description = engine.getTemplateDescription('conservative_middle_firm');

            expect(description).toBeDefined();
            expect(typeof description).toBe('string');
            expect(description.length).toBeGreaterThan(0);
        });

        it('모든 템플릿에 대해 설명을 반환해야 함', () => {
            const templates: WritingTemplate[] = [
                'extreme_right_elderly_militant',
                'progressive_young_passionate',
                'conservative_middle_firm',
                'centrist_mature_balanced',
                'militant_opposition_combative',
                'gentle_support_respectful',
                'academic_neutral_formal',
                'populist_emotional_aggressive'
            ];

            templates.forEach(template => {
                const description = engine.getTemplateDescription(template);
                expect(description).toBeDefined();
                expect(description).not.toBe('설명 없음');
            });
        });

        it('알 수 없는 템플릿에 대해 기본 설명을 반환해야 함', () => {
            const description = engine.getTemplateDescription('unknown_template' as WritingTemplate);
            expect(description).toBe('설명 없음');
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            const profile: MasterWritingProfile = {
                politicalSpectrum: 'progressive',
                politicalStance: 'strongly_support',
                ageGroup: '30s',
                generationStyle: 'formal_traditional',
                stancePosition: 'strongly_support',
                argumentStyle: 'idealistic',
                emotionIntensity: 'very_passionate',
                toneIntensity: 'firm',
                strengthLevel: 'passionate',
                formalityLevel: 'moderate',
                useHonorific: false,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: false,
                showAuthorityTone: false
            };

            const request: MasterWritingRequest = {
                topic: '통합 테스트 주제',
                profile,
                targetLength: 500,
                outputFormat: 'essay',
                tone: 'passionate',
                targetAudience: 'younger',
                purpose: 'persuade'
            };

            const response = await engine.generateMasterWriting(request);

            expect(response.generatedText).toBeDefined();
            expect(response.analysisReport).toBeDefined();
            expect(response.styleMetrics).toBeDefined();
            expect(response.recommendations).toBeInstanceOf(Array);
        });
    });
});

