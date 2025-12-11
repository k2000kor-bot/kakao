import multiLayerStyleAnalysisSystem, {
    MultiLayerStyleAnalysisSystem,
    MultiLayerAnalysis,
    StyleClonePrecision,
    AdvancedStyleReplication
} from '../multiLayerStyleAnalysisSystem';

describe('MultiLayerStyleAnalysisSystem', () => {
    let system: MultiLayerStyleAnalysisSystem;

    beforeEach(() => {
        system = new MultiLayerStyleAnalysisSystem();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(multiLayerStyleAnalysisSystem).toBeDefined();
            expect(multiLayerStyleAnalysisSystem).toBeInstanceOf(MultiLayerStyleAnalysisSystem);
        });

        it('새 인스턴스 생성', () => {
            expect(system).toBeInstanceOf(MultiLayerStyleAnalysisSystem);
        });
    });

    describe('performMultiLayerAnalysis', () => {
        it('다중 계층 스타일 분석을 수행해야 함', async () => {
            const text = '이것은 테스트 텍스트입니다. 다양한 스타일 요소를 포함하고 있습니다.';
            const result = await system.performMultiLayerAnalysis(text);

            expect(result).toBeDefined();
            expect(result.textId).toBeDefined();
            expect(result.analysisDepth).toBe('comprehensive');
            expect(result.layers).toBeDefined();
            expect(result.layers.linguistic).toBeDefined();
            expect(result.layers.semantic).toBeDefined();
            expect(result.layers.pragmatic).toBeDefined();
            expect(result.layers.psychological).toBeDefined();
            expect(result.layers.cultural).toBeDefined();
            expect(result.layers.rhetorical).toBeDefined();
            expect(result.layers.emotional).toBeDefined();
            expect(result.layers.cognitive).toBeDefined();
        });

        it('다양한 분석 깊이를 지원해야 함', async () => {
            const text = '테스트 텍스트';
            const depths: MultiLayerAnalysis['analysisDepth'][] = [
                'surface',
                'intermediate',
                'deep',
                'comprehensive'
            ];

            for (const depth of depths) {
                const result = await system.performMultiLayerAnalysis(text, depth);
                expect(result.analysisDepth).toBe(depth);
            }
        });

        it('옵션을 포함하여 분석을 수행해야 함', async () => {
            const text = '테스트 텍스트';
            const result = await system.performMultiLayerAnalysis(text, 'comprehensive', {
                focusLayers: ['linguistic', 'semantic'],
                culturalContext: 'korean',
                targetUse: 'analysis',
                comparisonTexts: ['비교 텍스트']
            });

            expect(result).toBeDefined();
            expect(result.layers).toBeDefined();
        });

        it('crossLayerPatterns를 포함해야 함', async () => {
            const text = '테스트 텍스트';
            const result = await system.performMultiLayerAnalysis(text);

            expect(result.crossLayerPatterns).toBeDefined();
            expect(result.crossLayerPatterns.correlations).toBeInstanceOf(Array);
            expect(result.crossLayerPatterns.conflicts).toBeInstanceOf(Array);
            expect(result.crossLayerPatterns.synergies).toBeInstanceOf(Array);
        });

        it('styleSignature를 포함해야 함', async () => {
            const text = '테스트 텍스트';
            const result = await system.performMultiLayerAnalysis(text);

            expect(result.styleSignature).toBeDefined();
            expect(result.styleSignature.uniqueness).toBeGreaterThanOrEqual(0);
            expect(result.styleSignature.consistency).toBeGreaterThanOrEqual(0);
            expect(result.styleSignature.complexity).toBeGreaterThanOrEqual(0);
            expect(result.styleSignature.adaptability).toBeGreaterThanOrEqual(0);
            expect(result.styleSignature.distinctiveness).toBeInstanceOf(Array);
        });

        it('recommendations를 포함해야 함', async () => {
            const text = '테스트 텍스트';
            const result = await system.performMultiLayerAnalysis(text);

            expect(result.recommendations).toBeDefined();
            expect(result.recommendations.preservation).toBeInstanceOf(Array);
            expect(result.recommendations.enhancement).toBeInstanceOf(Array);
            expect(result.recommendations.adaptation).toBeInstanceOf(Array);
            expect(result.recommendations.innovation).toBeInstanceOf(Array);
        });

        it('에러 발생 시 예외를 발생시켜야 함', async () => {
            // 에러를 강제로 발생시키기 위해 잘못된 입력 시뮬레이션
            jest.spyOn(system as any, 'analyzeAllLayers').mockRejectedValueOnce(new Error('Test error'));

            await expect(
                system.performMultiLayerAnalysis('test')
            ).rejects.toThrow('다중 계층 스타일 분석에 실패했습니다.');
        });
    });

    describe('performPrecisionStyleCloning', () => {
        const sourceText = '원본 텍스트입니다. 이 텍스트의 스타일을 복제해야 합니다.';
        const targetTopic = '새로운 주제';
        const precision: StyleClonePrecision = {
            textToAnalyze: sourceText,
            targetAccuracy: 'strict',
            preservationPriority: ['linguistic', 'rhetorical'],
            adaptationFlexibility: ['semantic', 'cultural'],
            qualityThresholds: {
                minimum: 0.7,
                target: 0.9,
                maximum: 1.0
            }
        };

        it('고정밀 스타일 복제를 수행해야 함', async () => {
            const result = await system.performPrecisionStyleCloning(sourceText, targetTopic, precision);

            expect(result).toBeDefined();
            expect(result.originalAnalysis).toBeDefined();
            expect(result.replicationRequest).toBeDefined();
            expect(result.replicationRequest.newTopic).toBe(targetTopic);
            expect(result.generatedContent).toBeDefined();
            expect(result.generatedContent.primary).toBeDefined();
            expect(result.generatedContent.alternatives).toBeInstanceOf(Array);
            expect(result.generatedContent.confidence).toBeGreaterThanOrEqual(0);
            expect(result.qualityAssessment).toBeDefined();
        });

        it('다양한 정확도 레벨을 지원해야 함', async () => {
            const accuracyLevels: StyleClonePrecision['targetAccuracy'][] = [
                'loose',
                'moderate',
                'strict',
                'exact'
            ];

            for (const accuracy of accuracyLevels) {
                const testPrecision: StyleClonePrecision = {
                    ...precision,
                    targetAccuracy: accuracy
                };

                const result = await system.performPrecisionStyleCloning(
                    sourceText,
                    targetTopic,
                    testPrecision
                );

                expect(result).toBeDefined();
                expect(result.originalAnalysis).toBeDefined();
            }
        });

        it('품질 평가를 포함해야 함', async () => {
            const result = await system.performPrecisionStyleCloning(sourceText, targetTopic, precision);

            expect(result.qualityAssessment.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.qualityAssessment.layerScores).toBeDefined();
            expect(result.qualityAssessment.improvements).toBeInstanceOf(Array);
            expect(result.qualityAssessment.warnings).toBeInstanceOf(Array);
        });

        it('layerFidelity를 포함해야 함', async () => {
            const result = await system.performPrecisionStyleCloning(sourceText, targetTopic, precision);

            expect(result.generatedContent.layerFidelity).toBeDefined();
            expect(typeof result.generatedContent.layerFidelity).toBe('object');
        });

        it('에러 발생 시 예외를 발생시켜야 함', async () => {
            jest.spyOn(system, 'performMultiLayerAnalysis').mockRejectedValueOnce(new Error('Test error'));

            await expect(
                system.performPrecisionStyleCloning(sourceText, targetTopic, precision)
            ).rejects.toThrow('고정밀 스타일 복제에 실패했습니다.');
        });
    });

    describe('analyzeStyleEvolution', () => {
        it('스타일 진화를 분석해야 함', async () => {
            const textSeries = [
                '첫 번째 텍스트',
                '두 번째 텍스트',
                '세 번째 텍스트'
            ];
            const timePoints = [
                '2024-01-01',
                '2024-01-02',
                '2024-01-03'
            ];

            const result = await system.analyzeStyleEvolution(textSeries, timePoints, 'chronological');

            expect(result).toBeDefined();
            expect(result.evolutionTrajectory).toBeInstanceOf(Array);
            expect(result.evolutionTrajectory.length).toBe(textSeries.length);
            expect(result.patterns).toBeDefined();
            expect(result.insights).toBeDefined();
        });

        it('다양한 분석 유형을 지원해야 함', async () => {
            const textSeries = ['텍스트1', '텍스트2'];
            const timePoints = ['2024-01-01', '2024-01-02'];
            const analysisTypes: Array<'chronological' | 'contextual' | 'adaptive'> = [
                'chronological',
                'contextual',
                'adaptive'
            ];

            for (const analysisType of analysisTypes) {
                const result = await system.analyzeStyleEvolution(textSeries, timePoints, analysisType);
                expect(result).toBeDefined();
                expect(result.evolutionTrajectory.length).toBe(textSeries.length);
            }
        });

        it('evolutionTrajectory를 포함해야 함', async () => {
            const textSeries = ['텍스트1', '텍스트2'];
            const timePoints = ['2024-01-01', '2024-01-02'];

            const result = await system.analyzeStyleEvolution(textSeries, timePoints, 'chronological');

            expect(result.evolutionTrajectory[0].timePoint).toBe(timePoints[0]);
            expect(result.evolutionTrajectory[0].analysis).toBeDefined();
            expect(result.evolutionTrajectory[0].changes).toBeInstanceOf(Array);
        });

        it('patterns를 포함해야 함', async () => {
            const textSeries = ['텍스트1', '텍스트2'];
            const timePoints = ['2024-01-01', '2024-01-02'];

            const result = await system.analyzeStyleEvolution(textSeries, timePoints, 'chronological');

            expect(result.patterns.trends).toBeInstanceOf(Array);
            expect(result.patterns.cycles).toBeInstanceOf(Array);
            expect(result.patterns.anomalies).toBeInstanceOf(Array);
            expect(result.patterns.predictions).toBeInstanceOf(Array);
        });

        it('insights를 포함해야 함', async () => {
            const textSeries = ['텍스트1', '텍스트2'];
            const timePoints = ['2024-01-01', '2024-01-02'];

            const result = await system.analyzeStyleEvolution(textSeries, timePoints, 'chronological');

            expect(result.insights.drivingFactors).toBeInstanceOf(Array);
            expect(result.insights.stabilityFactors).toBeInstanceOf(Array);
            expect(result.insights.adaptationCapacity).toBeGreaterThanOrEqual(0);
            expect(result.insights.futureProjections).toBeInstanceOf(Array);
        });
    });

    describe('fuseMultipleStyles', () => {
        it('여러 스타일을 융합해야 함', async () => {
            const sourceTexts = [
                {
                    text: '첫 번째 원본 텍스트',
                    weight: 1.0,
                    priority: ['linguistic', 'rhetorical']
                },
                {
                    text: '두 번째 원본 텍스트',
                    weight: 1.0,
                    priority: ['semantic']
                },
                {
                    text: '세 번째 원본 텍스트',
                    weight: 0.8,
                    priority: ['cultural']
                }
            ];
            const targetTopic = '융합 주제';
            const fusionStrategy: 'balanced' | 'dominant' | 'selective' | 'innovative' = 'balanced';

            const result = await system.fuseMultipleStyles(sourceTexts, targetTopic, fusionStrategy);

            expect(result).toBeDefined();
            expect(result.fusedAnalysis).toBeDefined();
            expect(result.generatedContent).toBeDefined();
            expect(result.generatedContent.primary).toBeDefined();
            expect(result.quality).toBeDefined();
        });

        it('융합 분석을 포함해야 함', async () => {
            const sourceTexts = [
                {
                    text: '텍스트1',
                    weight: 1.0,
                    priority: []
                },
                {
                    text: '텍스트2',
                    weight: 1.0,
                    priority: []
                }
            ];
            const targetTopic = '주제';
            const fusionStrategy: 'balanced' | 'dominant' | 'selective' | 'innovative' = 'balanced';

            const result = await system.fuseMultipleStyles(sourceTexts, targetTopic, fusionStrategy);

            expect(result.fusedAnalysis).toBeDefined();
            expect(result.fusedAnalysis.layers).toBeDefined();
        });

        it('융합 품질을 평가해야 함', async () => {
            const sourceTexts = [
                {
                    text: '텍스트1',
                    weight: 1.0,
                    priority: []
                },
                {
                    text: '텍스트2',
                    weight: 1.0,
                    priority: []
                }
            ];
            const targetTopic = '주제';
            const fusionStrategy: 'balanced' | 'dominant' | 'selective' | 'innovative' = 'balanced';

            const result = await system.fuseMultipleStyles(sourceTexts, targetTopic, fusionStrategy);

            expect(result.quality).toBeDefined();
            expect(result.quality.coherence).toBeGreaterThanOrEqual(0);
            expect(result.quality.uniqueness).toBeGreaterThanOrEqual(0);
            expect(result.quality.effectiveness).toBeGreaterThanOrEqual(0);
        });

        it('다양한 융합 전략을 지원해야 함', async () => {
            const sourceTexts = [
                {
                    text: '텍스트1',
                    weight: 1.0,
                    priority: []
                },
                {
                    text: '텍스트2',
                    weight: 1.0,
                    priority: []
                }
            ];
            const targetTopic = '주제';
            const strategies: Array<'balanced' | 'dominant' | 'selective' | 'innovative'> = [
                'balanced',
                'dominant',
                'selective',
                'innovative'
            ];

            for (const strategy of strategies) {
                const result = await system.fuseMultipleStyles(sourceTexts, targetTopic, strategy);
                expect(result).toBeDefined();
                expect(result.fusedAnalysis).toBeDefined();
            }
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            // 1. 다중 계층 분석
            const text = '원본 텍스트입니다. 다양한 스타일 요소를 포함합니다.';
            const analysis = await system.performMultiLayerAnalysis(text, 'comprehensive', {
                culturalContext: 'korean'
            });

            expect(analysis.layers).toBeDefined();
            expect(analysis.styleSignature).toBeDefined();

            // 2. 고정밀 스타일 복제
            const precision: StyleClonePrecision = {
                textToAnalyze: text,
                targetAccuracy: 'strict',
                preservationPriority: ['linguistic'],
                adaptationFlexibility: ['semantic'],
                qualityThresholds: {
                    minimum: 0.7,
                    target: 0.9,
                    maximum: 1.0
                }
            };

            const replication = await system.performPrecisionStyleCloning(
                text,
                '새 주제',
                precision
            );

            expect(replication.generatedContent).toBeDefined();
            expect(replication.qualityAssessment).toBeDefined();
        });

        it('스타일 진화 분석과 융합을 함께 테스트해야 함', async () => {
            const textSeries = ['텍스트1', '텍스트2', '텍스트3'];
            const timePoints = ['2024-01-01', '2024-01-02', '2024-01-03'];

            // 1. 스타일 진화 분석
            const evolution = await system.analyzeStyleEvolution(textSeries, timePoints, 'chronological');

            expect(evolution.evolutionTrajectory.length).toBe(textSeries.length);

            // 2. 여러 스타일 융합
            const sourceTexts = textSeries.map(text => ({
                text,
                weight: 1.0,
                priority: ['linguistic']
            }));

            const fusion = await system.fuseMultipleStyles(
                sourceTexts,
                '융합 주제',
                'balanced'
            );

            expect(fusion.fusedAnalysis).toBeDefined();
            expect(fusion.generatedContent).toBeDefined();
        });
    });
});

