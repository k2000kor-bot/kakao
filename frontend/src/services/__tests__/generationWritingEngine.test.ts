/* eslint-disable jest/no-conditional-expect */
import generationWritingEngine, {
    GenerationWritingEngine,
    GenerationWritingRequest,
    AgeGroup
} from '../generationWritingEngine';

describe('GenerationWritingEngine', () => {
    let engine: GenerationWritingEngine;

    beforeEach(() => {
        engine = new GenerationWritingEngine();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(generationWritingEngine).toBeDefined();
            expect(generationWritingEngine).toBeInstanceOf(GenerationWritingEngine);
        });

        it('새 인스턴스 생성', () => {
            expect(engine).toBeInstanceOf(GenerationWritingEngine);
        });
    });

    describe('generateGenerationWriting', () => {
        const baseRequest: GenerationWritingRequest = {
            topic: '도시정비법',
            profile: {
                ageGroup: '50s',
                generationStyle: 'authoritative_experienced',
                communicationPattern: 'authoritative',
                languageFormality: 'formal',
                useHonorific: true,
                useTraditionalExpressions: true,
                useGenerationalReferences: true,
                includeLifeExperience: true,
                showAuthorityTone: true
            },
            targetAudience: '30s',
            purposeType: 'advice',
            targetLength: 500,
            includePersonalExperience: true
        };

        it('50대 프로필로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    ageGroup: '50s'
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generatedText.length).toBeGreaterThan(0);
            expect(result.generationalCharacteristics.length).toBeGreaterThan(0);
            expect(result.languageFeatures.length).toBeGreaterThan(0);
            expect(result.communicationStyle).toBeDefined();
            expect(result.formalityLevel).toBeDefined();
        });

        it('60대 프로필로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    ageGroup: '60s'
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generationalCharacteristics.some(c => c.includes('60s 세대 특유의'))).toBe(true);
            expect(result.wisdomElements.length).toBeGreaterThan(0);
        });

        it('70대 프로필로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    ageGroup: '70s'
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generationalCharacteristics.some(c => c.includes('70s 세대 특유의'))).toBe(true);
        });

        it('80대 이상 프로필로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    ageGroup: '80s_plus'
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generationalCharacteristics.some(c => c.includes('80s_plus 세대 특유의'))).toBe(true);
        });

        it('조언 목적으로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                purposeType: 'advice'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toContain('조언');
        });

        it('의견 목적으로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                purposeType: 'opinion'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
        });

        it('비판 목적으로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                purposeType: 'criticism'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toContain('비판');
        });

        it('지지 목적으로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                purposeType: 'support'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toContain('지지');
        });

        it('설명 목적으로 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                purposeType: 'explanation'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toContain('설명');
        });

        it('개인 경험을 포함한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                includePersonalExperience: true
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toContain('시절을 겪어본');
        });

        it('개인 경험 없이 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                includePersonalExperience: false
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
        });

        it('전통적 표현을 사용한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    useTraditionalExpressions: true
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generationalCharacteristics).toContain('전통적 표현 방식 활용');
        });

        it('세대별 참조를 포함한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    useGenerationalReferences: true
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generationalReferences.length).toBeGreaterThan(0);
        });

        it('권위적 어조를 포함한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    showAuthorityTone: true
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.authorityIndicators.length).toBeGreaterThan(0);
            expect(result.generationalCharacteristics.some(c => c.includes('권위적 어조'))).toBe(true);
        });

        it('높임말을 사용한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    useHonorific: true
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.languageFeatures.some(f => f.includes('높임말'))).toBe(true);
        });

        it('인생 경험을 포함한 글쓰기를 생성해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    includeLifeExperience: true
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.wisdomElements.length).toBeGreaterThan(0);
            expect(result.generationalCharacteristics.some(c => c.includes('인생 경험'))).toBe(true);
        });

        it('격식 수준을 반영해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                profile: {
                    ...baseRequest.profile,
                    languageFormality: 'very_formal'
                }
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.formalityLevel).toContain('매우 격식적');
        });

        it('다양한 격식 수준을 지원해야 함', async () => {
            const formalityLevels: Array<'very_formal' | 'formal' | 'semi_formal' | 'casual' | 'intimate'> = 
                ['very_formal', 'formal', 'semi_formal', 'casual', 'intimate'];

            for (const formality of formalityLevels) {
                const request: GenerationWritingRequest = {
                    ...baseRequest,
                    profile: {
                        ...baseRequest.profile,
                        languageFormality: formality
                    }
                };

                const result = await engine.generateGenerationWriting(request);

                expect(result.formalityLevel).toBeDefined();
            }
        });

        it('원본 텍스트가 있으면 이를 활용해야 함', async () => {
            const request: GenerationWritingRequest = {
                ...baseRequest,
                originalText: '원본 텍스트 내용'
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
        });

        it('에러 발생 시 적절히 처리해야 함', async () => {
            const invalidRequest = {} as GenerationWritingRequest;

            await expect(engine.generateGenerationWriting(invalidRequest)).rejects.toThrow();
        });
    });

    describe('recommendGenerationProfile', () => {
        it('50대 프로필을 추천해야 함', () => {
            const profile = engine.recommendGenerationProfile('50s', '비즈니스');

            expect(profile.ageGroup).toBe('50s');
            expect(profile.generationStyle).toBe('authoritative_experienced');
            expect(profile.communicationPattern).toBe('authoritative');
            expect(profile.showAuthorityTone).toBe(true);
        });

        it('60대 프로필을 추천해야 함', () => {
            const profile = engine.recommendGenerationProfile('60s', '조언');

            expect(profile.ageGroup).toBe('60s');
            expect(profile.generationStyle).toBe('wise_elder');
            expect(profile.communicationPattern).toBe('mentoring');
            expect(profile.languageFormality).toBe('very_formal');
        });

        it('70대 프로필을 추천해야 함', () => {
            const profile = engine.recommendGenerationProfile('70s', '훈계');

            expect(profile.ageGroup).toBe('70s');
            expect(profile.generationStyle).toBe('strict_mentor');
            expect(profile.communicationPattern).toBe('hierarchical');
            expect(profile.showAuthorityTone).toBe(true);
        });

        it('80대 이상 프로필을 추천해야 함', () => {
            const profile = engine.recommendGenerationProfile('80s_plus', '유언');

            expect(profile.ageGroup).toBe('80s_plus');
            expect(profile.generationStyle).toBe('wise_elder');
            expect(profile.communicationPattern).toBe('commanding');
            expect(profile.showAuthorityTone).toBe(true);
        });

        it('모든 연령대에 대해 기본 설정을 포함해야 함', () => {
            const ageGroups: AgeGroup[] = ['20s', '30s', '40s', '50s', '60s', '70s', '80s_plus'];

            ageGroups.forEach(ageGroup => {
                const profile = engine.recommendGenerationProfile(ageGroup, '테스트');

                expect(profile.ageGroup).toBe(ageGroup);
                expect(profile.useHonorific).toBe(true);
                expect(profile.useTraditionalExpressions).toBe(true);
                expect(profile.useGenerationalReferences).toBe(true);
                expect(profile.includeLifeExperience).toBe(true);
            });
        });
    });

    describe('generateAgeGroupSamples', () => {
        it('모든 연령대별 샘플을 생성해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['20s']).toBeDefined();
            expect(samples['30s']).toBeDefined();
            expect(samples['40s']).toBeDefined();
            expect(samples['50s']).toBeDefined();
            expect(samples['60s']).toBeDefined();
            expect(samples['70s']).toBeDefined();
            expect(samples['80s_plus']).toBeDefined();
        });

        it('20대 샘플이 적절한 어투를 포함해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['20s']).toContain('새로운');
            expect(samples['20s']).toContain('혁신');
        });

        it('50대 샘플이 적절한 어투를 포함해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['50s']).toContain('실무');
            expect(samples['50s']).toContain('경험');
        });

        it('60대 샘플이 적절한 어투를 포함해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['60s']).toContain('인생');
            expect(samples['60s']).toContain('지혜');
        });

        it('70대 샘플이 적절한 어투를 포함해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['70s']).toContain('연륜');
            expect(samples['70s']).toContain('전통');
        });

        it('80대 이상 샘플이 적절한 어투를 포함해야 함', () => {
            const samples = engine.generateAgeGroupSamples();

            expect(samples['80s_plus']).toContain('평생');
            expect(samples['80s_plus']).toContain('후손');
        });
    });

    describe('통합 테스트', () => {
        it('추천 프로필로 글쓰기를 생성해야 함', async () => {
            const profile = engine.recommendGenerationProfile('60s', '조언');
            const request: GenerationWritingRequest = {
                topic: '인생 조언',
                profile,
                targetAudience: '30s',
                purposeType: 'advice',
                targetLength: 500,
                includePersonalExperience: true
            };

            const result = await engine.generateGenerationWriting(request);

            expect(result.generatedText).toBeDefined();
            expect(result.generationalCharacteristics.length).toBeGreaterThan(0);
            expect(result.wisdomElements.length).toBeGreaterThan(0);
        });

        it('다양한 목적 타입으로 글쓰기를 생성해야 함', async () => {
            const purposeTypes: Array<'advice' | 'opinion' | 'criticism' | 'support' | 'explanation'> = 
                ['advice', 'opinion', 'criticism', 'support', 'explanation'];

            const profile = engine.recommendGenerationProfile('50s', '비즈니스');

            for (const purposeType of purposeTypes) {
                const request: GenerationWritingRequest = {
                    topic: '테스트 주제',
                    profile,
                    targetAudience: '30s',
                    purposeType,
                    targetLength: 300,
                    includePersonalExperience: false
                };

                const result = await engine.generateGenerationWriting(request);

                expect(result.generatedText).toBeDefined();
                expect(result.generatedText.length).toBeGreaterThan(0);
            }
        });
    });
});

