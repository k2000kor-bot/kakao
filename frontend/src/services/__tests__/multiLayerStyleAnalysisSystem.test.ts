/* eslint-disable jest/no-conditional-expect */
import multiLayerStyleAnalysisSystem, {
    CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
    MultiLayerStyleAnalysisSystem,
    MultiLayerAnalysis,
    StyleClonePrecision,
    compactMultiLayerAnalysisForChatContext,
    maybeCompactMultilayerStyleHintForChatContext,
    enrichChatContextRecordWithOptionalMultilayerStyleHint,
} from '../multiLayerStyleAnalysisSystem';

describe('compactMultiLayerAnalysisForChatContext', () => {
    it('API용 소형 요약에 style_signature와 recommendation_samples가 있다', async () => {
        const m = await multiLayerStyleAnalysisSystem.performMultiLayerAnalysis('테스트 문장입니다.', 'surface');
        const compact = compactMultiLayerAnalysisForChatContext(m);
        expect(compact.analysis_depth).toBe('surface');
        expect(compact.style_signature).toBeDefined();
        expect(compact.recommendation_samples).toBeDefined();
        const sig = compact.style_signature as Record<string, unknown>;
        expect(typeof sig.uniqueness).toBe('number');
        expect(Array.isArray(sig.distinctiveness)).toBe(true);
    });
});

describe('maybeCompactMultilayerStyleHintForChatContext', () => {
    const envKey = 'REACT_APP_CHAT_MULTILAYER_STYLE_HINT';
    let prev: string | undefined;

    beforeEach(() => {
        prev = process.env[envKey];
    });

    afterEach(() => {
        if (prev === undefined) {
            delete process.env[envKey];
        } else {
            process.env[envKey] = prev;
        }
    });

    it('환경 변수가 true가 아니면 undefined', async () => {
        delete process.env[envKey];
        await expect(
            maybeCompactMultilayerStyleHintForChatContext('여덟글자이상의입력문장입니다')
        ).resolves.toBeUndefined();
    });

    it('입력이 8자 미만이면 undefined', async () => {
        process.env[envKey] = 'true';
        await expect(maybeCompactMultilayerStyleHintForChatContext('짧음')).resolves.toBeUndefined();
    });

    it('빈 문자열이면 undefined', async () => {
        process.env[envKey] = 'true';
        await expect(maybeCompactMultilayerStyleHintForChatContext('')).resolves.toBeUndefined();
    });

    it('공백만 있으면 trim 후 undefined', async () => {
        process.env[envKey] = 'true';
        await expect(maybeCompactMultilayerStyleHintForChatContext('   \n\t  ')).resolves.toBeUndefined();
    });

    it('true이고 충분한 길이면 surface compact 객체', async () => {
        process.env[envKey] = 'true';
        const r = await maybeCompactMultilayerStyleHintForChatContext(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.'
        );
        expect(r).toBeDefined();
        expect(r?.analysis_depth).toBe('surface');
        expect(r?.style_signature).toBeDefined();
    });

    it('입력이 상한을 넘기면 앞부분만 잘라 surface 분석에 넘긴다', async () => {
        process.env[envKey] = 'true';
        const spy = jest
            .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
            .mockRejectedValue(new Error('short-circuit'));
        const long = 'x'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 500);
        await expect(maybeCompactMultilayerStyleHintForChatContext(long)).resolves.toBeUndefined();
        expect(spy).toHaveBeenCalledWith(
            'x'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
            'surface'
        );
        spy.mockRestore();
    });

    it('performMultiLayerAnalysis가 실패하면 undefined를 반환한다', async () => {
        process.env[envKey] = 'true';
        const spy = jest
            .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
            .mockRejectedValue(new Error('analysis failed'));
        const r = await maybeCompactMultilayerStyleHintForChatContext(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.'
        );
        expect(r).toBeUndefined();
        spy.mockRestore();
    });
});

describe('enrichChatContextRecordWithOptionalMultilayerStyleHint', () => {
    const envKey = 'REACT_APP_CHAT_MULTILAYER_STYLE_HINT';
    let prev: string | undefined;

    beforeEach(() => {
        prev = process.env[envKey];
    });

    afterEach(() => {
        if (prev === undefined) {
            delete process.env[envKey];
        } else {
            process.env[envKey] = prev;
        }
    });

    it('이미 multilayer_style_hint가 있으면 덮어쓰지 않고 다른 키는 유지', async () => {
        process.env[envKey] = 'true';
        const preset = { analysis_depth: 'surface', preset_marker: true };
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '새로 분석할 만한 충분히 긴 사용자 메시지 본문',
            { multilayer_style_hint: preset, keep: 1 }
        );
        expect(out.keep).toBe(1);
        expect(out.multilayer_style_hint).toEqual(preset);
    });

    it('힌트가 없고 env가 true면 context에 multilayer_style_hint를 추가', async () => {
        process.env[envKey] = 'true';
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.',
            { project_id: 'p1' }
        );
        expect(out.project_id).toBe('p1');
        expect(out.multilayer_style_hint).toBeDefined();
        expect((out.multilayer_style_hint as Record<string, unknown>).analysis_depth).toBe('surface');
    });

    it('메시지가 trim 후 비면 힌트를 넣지 않고 performMultiLayerAnalysis도 호출하지 않는다', async () => {
        process.env[envKey] = 'true';
        const spy = jest.spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis');
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint('    \n', { keep: 2 });
        expect(out).toEqual({ keep: 2 });
        expect(out.multilayer_style_hint).toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('분석 실패 시 기존 context만 유지하고 multilayer_style_hint는 넣지 않는다', async () => {
        process.env[envKey] = 'true';
        const spy = jest
            .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
            .mockRejectedValue(new Error('fail'));
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.',
            { project_id: 'p2' }
        );
        expect(out.project_id).toBe('p2');
        expect(out.multilayer_style_hint).toBeUndefined();
        spy.mockRestore();
    });

    it('context를 생략하면 env가 true일 때 multilayer_style_hint만 담긴 객체를 반환한다', async () => {
        process.env[envKey] = 'true';
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.'
        );
        expect(Object.keys(out)).toEqual(['multilayer_style_hint']);
        expect(out.multilayer_style_hint).toBeDefined();
        expect((out.multilayer_style_hint as Record<string, unknown>).analysis_depth).toBe('surface');
    });

    it('context를 생략하고 힌트가 꺼져 있으면 빈 객체를 반환한다', async () => {
        delete process.env[envKey];
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.'
        );
        expect(out).toEqual({});
    });

    it('context가 null이면 생략과 같이 빈 시드에서 힌트만 채운다', async () => {
        process.env[envKey] = 'true';
        const out = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            '사용자 메시지가 충분히 길 때 멀티레이어 스타일 힌트를 만든다.',
            null as unknown as Record<string, unknown>
        );
        expect(Object.keys(out)).toEqual(['multilayer_style_hint']);
        expect(out.multilayer_style_hint).toBeDefined();
    });
});

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
            jest.spyOn(system as unknown as { analyzeAllLayers: () => Promise<unknown> }, 'analyzeAllLayers').mockRejectedValueOnce(new Error('Test error'));

            await expect(
                system.performMultiLayerAnalysis('test')
            ).rejects.toThrow('다중 계층 스타일 분석에 실패했습니다.');
        });

        it('빈 문자열이면 분석하지 않고 예외를 던진다', async () => {
            await expect(system.performMultiLayerAnalysis('')).rejects.toThrow('분석할 텍스트가 비어 있습니다.');
        });

        it('공백만 있으면 분석하지 않고 예외를 던진다', async () => {
            await expect(system.performMultiLayerAnalysis('   \t\n  ')).rejects.toThrow('분석할 텍스트가 비어 있습니다.');
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

        it('원본이 비어 있으면 복제 전에 예외를 던진다', async () => {
            await expect(
                system.performPrecisionStyleCloning('  ', targetTopic, precision)
            ).rejects.toThrow('원본 텍스트가 비어 있습니다.');
        });

        it('대상 주제가 비어 있으면 복제 전에 예외를 던진다', async () => {
            await expect(
                system.performPrecisionStyleCloning(sourceText, '\t', precision)
            ).rejects.toThrow('복제 대상 주제가 비어 있습니다.');
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

        it('텍스트 시리즈가 비어 있으면 예외를 던진다', async () => {
            await expect(
                system.analyzeStyleEvolution([], [], 'chronological')
            ).rejects.toThrow('스타일 진화 분석을 위한 텍스트가 없습니다.');
        });

        it('텍스트 수와 시점 수가 다르면 예외를 던진다', async () => {
            await expect(
                system.analyzeStyleEvolution(['a'], ['t1', 't2'], 'chronological')
            ).rejects.toThrow('텍스트 개수와 시점 개수가 일치해야 합니다.');
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

        it('소스가 없으면 융합 전에 예외를 던진다', async () => {
            await expect(
                system.fuseMultipleStyles([], '주제', 'balanced')
            ).rejects.toThrow('융합할 소스 텍스트가 없습니다.');
        });

        it('융합 주제가 비어 있으면 예외를 던진다', async () => {
            const sourceTexts = [
                { text: '텍스트1', weight: 1.0, priority: [] },
                { text: '텍스트2', weight: 1.0, priority: [] },
            ];
            await expect(
                system.fuseMultipleStyles(sourceTexts, '   ', 'balanced')
            ).rejects.toThrow('융합 주제가 비어 있습니다.');
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

