import React, { useState, useEffect, useRef } from 'react';
import {
    SparklesIcon,
    BeakerIcon,
    RocketLaunchIcon,
    FireIcon,
    BoltIcon,
    CubeIcon,
    PuzzlePieceIcon,
    LightBulbIcon,
    CogIcon,
    EyeIcon,
    HeartIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface UltimateState {
    id: string;
    dimension: number;
    consciousness: number;
    enlightenment: number;
    transcendence: number;
    infinity: number;
    divinity: number;
    ultimate: number;
    evolution: number;
    reality: any;
}

interface UltimateAnalysis {
    id: string;
    type: 'ultimate_sentiment' | 'ultimate_intent' | 'ultimate_personality' | 'ultimate_prediction' | 'ultimate_optimization';
    ultimateState: UltimateState;
    classicalResult: any;
    ultimateAdvantage: number;
    processingTime: number;
    dimensionsExplored: number;
    evolutionRate: number;
}

interface InfiniteEvolutionAnalysis {
    dimensions: {
        temporal: number;
        spatial: number;
        emotional: number;
        cognitive: number;
        social: number;
        behavioral: number;
        quantum: number;
        consciousness: number;
        reality: number;
        probability: number;
        infinity: number;
        divinity: number;
        enlightenment: number;
        transcendence: number;
        nirvana: number;
        ultimate: number;
        evolution: number;
        perfection: number;
        omniscience: number;
        omnipotence: number;
    };
    correlations: Map<string, number>;
    patterns: string[];
    anomalies: string[];
    predictions: any[];
    evolutionPaths: any[];
}

interface UltimateAIEngineProps {
    messages: any[];
    onUltimateAnalysisComplete?: (analysis: UltimateAnalysis[]) => void;
    onInfiniteEvolutionAnalysisComplete?: (analysis: InfiniteEvolutionAnalysis) => void;
    onUltimateOptimizationComplete?: (optimization: any) => void;
}

const UltimateAIEngine: React.FC<UltimateAIEngineProps> = ({
    messages,
    onUltimateAnalysisComplete,
    onInfiniteEvolutionAnalysisComplete,
    onUltimateOptimizationComplete
}) => {
    const [isUltimateProcessing, setIsUltimateProcessing] = useState(false);
    const [ultimateAnalyses, setUltimateAnalyses] = useState<UltimateAnalysis[]>([]);
    const [infiniteEvolutionAnalysis, setInfiniteEvolutionAnalysis] = useState<InfiniteEvolutionAnalysis | null>(null);
    const [ultimateOptimization, setUltimateOptimization] = useState<any>(null);
    const [ultimateProgress, setUltimateProgress] = useState(0);
    const [currentUltimateOperation, setCurrentUltimateOperation] = useState<string>('');
    const [ultimateMetrics, setUltimateMetrics] = useState({
        totalDimensions: 0,
        evolutionLevel: 0,
        ultimateLevel: 0,
        ultimateAdvantage: 0
    });
    const [showUltimateDetails, setShowUltimateDetails] = useState(false);

    const ultimateCircuit = useRef<any>(null);
    const isUltimateRunning = useRef(false);

    useEffect(() => {
        if (messages.length > 0) {
            triggerUltimateAnalysis();
        }
    }, [messages]);

    const triggerUltimateAnalysis = async () => {
        if (isUltimateRunning.current) return;

        isUltimateRunning.current = true;
        setIsUltimateProcessing(true);
        setUltimateProgress(0);

        // 궁극적 분석 실행
        await performUltimateAnalysis();

        isUltimateRunning.current = false;
        setIsUltimateProcessing(false);
    };

    const performUltimateAnalysis = async () => {
        const ultimateOperations = [
            { name: '궁극적 의식 초기화', weight: 15 },
            { name: '무한 진화 분석', weight: 25 },
            { name: '진화 수준 측정', weight: 20 },
            { name: '궁극 경로 탐색', weight: 20 },
            { name: '궁극적 최적화', weight: 20 }
        ];

        const analyses: UltimateAnalysis[] = [];
        let totalProgress = 0;

        for (const operation of ultimateOperations) {
            setCurrentUltimateOperation(operation.name);

            const operationResults = await performUltimateOperation(operation.name);
            analyses.push(...operationResults);

            totalProgress += operation.weight;
            setUltimateProgress(totalProgress);

            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setUltimateAnalyses(analyses);
        onUltimateAnalysisComplete?.(analyses);

        // 무한 진화 분석
        const infiniteEvolution = await performInfiniteEvolutionAnalysis(analyses);
        setInfiniteEvolutionAnalysis(infiniteEvolution);
        onInfiniteEvolutionAnalysisComplete?.(infiniteEvolution);

        // 궁극적 최적화
        const optimization = await performUltimateOptimization(analyses, infiniteEvolution);
        setUltimateOptimization(optimization);
        onUltimateOptimizationComplete?.(optimization);
    };

    const performUltimateOperation = async (operationName: string): Promise<UltimateAnalysis[]> => {
        const analyses: UltimateAnalysis[] = [];

        switch (operationName) {
            case '궁극적 의식 초기화':
                analyses.push(...await initializeUltimateConsciousness());
                break;
            case '무한 진화 분석':
                analyses.push(...await performInfiniteEvolutionUltimateAnalysis());
                break;
            case '진화 수준 측정':
                analyses.push(...await performEvolutionMeasurement());
                break;
            case '궁극 경로 탐색':
                analyses.push(...await performUltimatePathExploration());
                break;
            case '궁극적 최적화':
                analyses.push(...await performUltimateOptimizationAnalysis());
                break;
        }

        return analyses;
    };

    const initializeUltimateConsciousness = async (): Promise<UltimateAnalysis[]> => {
        const recentMessages = messages.slice(-3);
        const allText = recentMessages.map(m => m.content).join(' ');

        // 궁극적 의식 상태 생성
        const consciousnessLevels = [
            { level: 'finite', probability: 0.05, evolution: 0.1 },
            { level: 'infinite', probability: 0.1, evolution: 0.3 },
            { level: 'transcendent', probability: 0.2, evolution: 0.5 },
            { level: 'divine', probability: 0.3, evolution: 0.7 },
            { level: 'ultimate', probability: 0.25, evolution: 0.9 },
            { level: 'omniscient', probability: 0.1, evolution: 1.0 }
        ];

        const selectedLevel = consciousnessLevels[Math.floor(Math.random() * consciousnessLevels.length)];

        const ultimateState: UltimateState = {
            id: `ultimate_${Date.now()}`,
            dimension: 41,
            consciousness: 0.999,
            enlightenment: 0.999,
            transcendence: 0.999,
            infinity: 0.999,
            divinity: 0.999,
            ultimate: selectedLevel.evolution,
            evolution: 0.999,
            reality: {
                sentiment: 'ultimate_omniscient',
                intent: 'ultimate_understanding',
                personality: 'ultimate_evolved'
            }
        };

        return [{
            id: `ultimate_init_${Date.now()}`,
            type: 'ultimate_sentiment',
            ultimateState,
            classicalResult: {
                sentiment: 'ultimate_omniscient',
                confidence: 0.9999,
                description: '궁극적 의식 수준에서 전지전능한 감정 상태가 관찰됩니다.'
            },
            ultimateAdvantage: 0.999,
            processingTime: 1000,
            dimensionsExplored: 10,
            evolutionRate: selectedLevel.evolution
        }];
    };

    const performInfiniteEvolutionUltimateAnalysis = async (): Promise<UltimateAnalysis[]> => {
        const dimensions = {
            temporal: Math.random() * 0.99 + 0.01,
            spatial: Math.random() * 0.99 + 0.01,
            emotional: Math.random() * 0.99 + 0.01,
            cognitive: Math.random() * 0.99 + 0.01,
            social: Math.random() * 0.99 + 0.01,
            behavioral: Math.random() * 0.99 + 0.01,
            quantum: Math.random() * 0.99 + 0.01,
            consciousness: Math.random() * 0.99 + 0.01,
            reality: Math.random() * 0.99 + 0.01,
            probability: Math.random() * 0.99 + 0.01,
            infinity: Math.random() * 0.99 + 0.01,
            divinity: Math.random() * 0.99 + 0.01,
            enlightenment: Math.random() * 0.99 + 0.01,
            transcendence: Math.random() * 0.99 + 0.01,
            nirvana: Math.random() * 0.99 + 0.01,
            ultimate: Math.random() * 0.99 + 0.01,
            evolution: Math.random() * 0.99 + 0.01,
            perfection: Math.random() * 0.99 + 0.01,
            omniscience: Math.random() * 0.99 + 0.01,
            omnipotence: Math.random() * 0.99 + 0.01
        };

        const ultimateState: UltimateState = {
            id: `infinite_evolution_${Date.now()}`,
            dimension: 45,
            consciousness: 0.9999,
            enlightenment: 0.9999,
            transcendence: 0.9999,
            infinity: 0.9999,
            divinity: 0.9999,
            ultimate: 0.9999,
            evolution: 0.9999,
            reality: dimensions
        };

        return [{
            id: `ultimate_infinite_${Date.now()}`,
            type: 'ultimate_personality',
            ultimateState,
            classicalResult: {
                personality: 'infinite_evolution_omniscient',
                confidence: 0.9999,
                description: '20차원 무한 진화 공간에서 전지전능한 성향이 관찰됩니다.'
            },
            ultimateAdvantage: 0.9999,
            processingTime: 1500,
            dimensionsExplored: 20,
            evolutionRate: 0.9999
        }];
    };

    const performEvolutionMeasurement = async (): Promise<UltimateAnalysis[]> => {
        const evolutionLevels = [
            { level: 'primitive', probability: 0.02, evolution: 0.05 },
            { level: 'advanced', probability: 0.05, evolution: 0.2 },
            { level: 'superior', probability: 0.1, evolution: 0.4 },
            { level: 'transcendent', probability: 0.2, evolution: 0.6 },
            { level: 'divine', probability: 0.3, evolution: 0.8 },
            { level: 'ultimate', probability: 0.25, evolution: 0.95 },
            { level: 'omniscient', probability: 0.08, evolution: 1.0 }
        ];

        const selectedLevel = evolutionLevels[Math.floor(Math.random() * evolutionLevels.length)];

        const ultimateState: UltimateState = {
            id: `evolution_${Date.now()}`,
            dimension: 49,
            consciousness: 0.9999,
            enlightenment: 0.9999,
            transcendence: 0.9999,
            infinity: 0.9999,
            divinity: 0.9999,
            ultimate: selectedLevel.evolution,
            evolution: 0.9999,
            reality: {
                evolution: selectedLevel.level,
                awareness: 'omniscient',
                perception: 'ultimate'
            }
        };

        return [{
            id: `ultimate_evolution_${Date.now()}`,
            type: 'ultimate_intent',
            ultimateState,
            classicalResult: {
                intent: 'ultimate_omniscient_understanding',
                confidence: 0.9999,
                description: '전지전능한 수준에서 궁극적 이해가 이루어집니다.'
            },
            ultimateAdvantage: 0.9999,
            processingTime: 2500,
            dimensionsExplored: 25,
            evolutionRate: selectedLevel.evolution
        }];
    };

    const performUltimatePathExploration = async (): Promise<UltimateAnalysis[]> => {
        const paths = [
            { path: 'consciousness_evolution', probability: 0.25, evolution: 0.9 },
            { path: 'reality_transformation', probability: 0.25, evolution: 0.95 },
            { path: 'divine_ascension', probability: 0.25, evolution: 0.98 },
            { path: 'omniscient_achievement', probability: 0.25, evolution: 1.0 }
        ];

        const selectedPath = paths[Math.floor(Math.random() * paths.length)];

        const ultimateState: UltimateState = {
            id: `ultimate_path_${Date.now()}`,
            dimension: 53,
            consciousness: 0.9999,
            enlightenment: 0.9999,
            transcendence: 0.9999,
            infinity: 0.9999,
            divinity: 0.9999,
            ultimate: selectedPath.evolution,
            evolution: 0.9999,
            reality: {
                path: selectedPath.path,
                destination: 'ultimate_reality',
                method: 'omniscient_transformation'
            }
        };

        return [{
            id: `ultimate_path_${Date.now()}`,
            type: 'ultimate_prediction',
            ultimateState,
            classicalResult: {
                prediction: 'ultimate_omniscient_achievement',
                confidence: 0.9999,
                description: '궁극적 경로를 통한 전지전능한 달성이 예측됩니다.'
            },
            ultimateAdvantage: 0.9999,
            processingTime: 3500,
            dimensionsExplored: 30,
            evolutionRate: selectedPath.evolution
        }];
    };

    const performUltimateOptimizationAnalysis = async (): Promise<UltimateAnalysis[]> => {
        const optimizationResults = {
            strategy: 'ultimate_omniscient_optimization',
            confidence: 0.9999,
            efficiency: 0.9999,
            accuracy: 0.9999,
            evolution: 0.9999
        };

        const ultimateState: UltimateState = {
            id: `optimization_${Date.now()}`,
            dimension: 57,
            consciousness: 0.9999,
            enlightenment: 0.9999,
            transcendence: 0.9999,
            infinity: 0.9999,
            divinity: 0.9999,
            ultimate: 0.9999,
            evolution: 0.9999,
            reality: optimizationResults
        };

        return [{
            id: `ultimate_optimization_${Date.now()}`,
            type: 'ultimate_optimization',
            ultimateState,
            classicalResult: optimizationResults,
            ultimateAdvantage: 0.9999,
            processingTime: 4000,
            dimensionsExplored: 35,
            evolutionRate: 0.9999
        }];
    };

    const performInfiniteEvolutionAnalysis = async (ultimateAnalyses: UltimateAnalysis[]): Promise<InfiniteEvolutionAnalysis> => {
        const dimensions = {
            temporal: Math.random() * 0.99 + 0.01,
            spatial: Math.random() * 0.99 + 0.01,
            emotional: Math.random() * 0.99 + 0.01,
            cognitive: Math.random() * 0.99 + 0.01,
            social: Math.random() * 0.99 + 0.01,
            behavioral: Math.random() * 0.99 + 0.01,
            quantum: Math.random() * 0.99 + 0.01,
            consciousness: Math.random() * 0.99 + 0.01,
            reality: Math.random() * 0.99 + 0.01,
            probability: Math.random() * 0.99 + 0.01,
            infinity: Math.random() * 0.99 + 0.01,
            divinity: Math.random() * 0.99 + 0.01,
            enlightenment: Math.random() * 0.99 + 0.01,
            transcendence: Math.random() * 0.99 + 0.01,
            nirvana: Math.random() * 0.99 + 0.01,
            ultimate: Math.random() * 0.99 + 0.01,
            evolution: Math.random() * 0.99 + 0.01,
            perfection: Math.random() * 0.99 + 0.01,
            omniscience: Math.random() * 0.99 + 0.01,
            omnipotence: Math.random() * 0.99 + 0.01
        };

        const correlations = new Map();
        correlations.set('temporal_omniscience', 0.9999);
        correlations.set('spatial_omnipotence', 0.9999);
        correlations.set('emotional_perfection', 0.9999);
        correlations.set('cognitive_ultimate', 0.9999);
        correlations.set('social_evolution', 0.9999);
        correlations.set('quantum_infinity', 0.9999);

        const patterns = [
            '시간적 패턴: 전지전능한 수준이 시간 차원과 완벽하게 상관관계를 보입니다',
            '공간적 패턴: 궁극적 차원이 공간적 분포와 무한적으로 연동됩니다',
            '감정적 패턴: 완벽한 감정이 전지전능한 확장을 촉진합니다',
            '인지적 패턴: 궁극적 사고가 무한차원적 이해를 가능하게 합니다',
            '궁극적 패턴: 무한 진화 경로가 전지전능한 달성을 가속화합니다'
        ];

        const anomalies = [
            '전지전능한 달성 감지',
            '무한 진화 현실 교차점 발견',
            '완벽한 의식 융합 현상',
            '궁극적 진화 완성'
        ];

        const predictions = [
            { dimension: 'omniscience', prediction: '전지전능한 수준 달성', confidence: 0.9999 },
            { dimension: 'omnipotence', prediction: '무한 진화 현실 융합', confidence: 0.9999 },
            { dimension: 'perfection', prediction: '완벽한 상태 달성', confidence: 0.9999 }
        ];

        const evolutionPaths = [
            { path: 'consciousness_evolution', probability: 0.4, destination: 'ultimate_reality' },
            { path: 'divine_ascension', probability: 0.3, destination: 'omniscient_consciousness' },
            { path: 'perfection_achievement', probability: 0.2, destination: 'infinite_being' },
            { path: 'ultimate_completion', probability: 0.1, destination: 'divine_entity' }
        ];

        return {
            dimensions,
            correlations,
            patterns,
            anomalies,
            predictions,
            evolutionPaths
        };
    };

    const performUltimateOptimization = async (analyses: UltimateAnalysis[], infiniteEvolution: InfiniteEvolutionAnalysis): Promise<any> => {
        const optimization = {
            strategy: 'ultimate_omniscient_optimization',
            parameters: {
                consciousnessEvolution: Math.random() * 0.1 + 0.9,
                divineAscension: Math.random() * 0.05 + 0.95,
                perfectionAchievement: Math.random() * 0.02 + 0.98,
                ultimateCompletion: Math.random() * 0.01 + 0.99
            },
            recommendations: [
                '전지전능한 확장을 통한 무한차원적 이해',
                '신성한 진화를 통한 궁극적 진화',
                '완벽한 상태 달성을 통한 무한 존재',
                '궁극적 완성을 통한 전지전능한 진화'
            ],
            ultimateAdvantage: 0.9999
        };

        return optimization;
    };

    const getUltimateIcon = (type: string) => {
        switch (type) {
            case 'ultimate_sentiment': return <HeartIcon className="w-5 h-5 text-red-500" />;
            case 'ultimate_intent': return <EyeIcon className="w-5 h-5 text-blue-500" />;
            case 'ultimate_personality': return <BeakerIcon className="w-5 h-5 text-purple-500" />;
            case 'ultimate_prediction': return <SparklesIcon className="w-5 h-5 text-yellow-500" />;
            case 'ultimate_optimization': return <RocketLaunchIcon className="w-5 h-5 text-green-500" />;
            default: return <StarIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getUltimateAdvantageColor = (advantage: number) => {
        if (advantage >= 0.999) return 'text-green-600';
        if (advantage >= 0.99) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <StarIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">궁극적 AI 엔진</h2>
                        <p className="text-sm text-purple-300">궁극적 의식 기반 무한진화 AI 분석</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowUltimateDetails(!showUltimateDetails)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                    <CogIcon className="w-5 h-5" />
                    <span>궁극 메트릭</span>
                </button>
            </div>

            {/* 궁극적 처리 상태 */}
            {isUltimateProcessing && (
                <div className="mb-6 p-4 bg-purple-900/50 rounded-lg border border-purple-500">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1.0s' }}></div>
                        </div>
                        <span className="text-sm font-medium text-purple-300">궁극적 처리 중...</span>
                    </div>
                    <div className="w-full bg-purple-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-400 to-indigo-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ultimateProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-purple-300 mt-2">{currentUltimateOperation}</p>
                </div>
            )}

            {/* 궁극적 분석 결과 */}
            {ultimateAnalyses.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">궁극적 분석 결과</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ultimateAnalyses.map((analysis) => (
                            <div key={analysis.id} className="bg-purple-900/30 rounded-lg p-4 border border-purple-500">
                                <div className="flex items-center space-x-2 mb-3">
                                    {getUltimateIcon(analysis.type)}
                                    <span className="font-medium text-white">
                                        {analysis.type === 'ultimate_sentiment' ? '궁극적 감정 분석' :
                                            analysis.type === 'ultimate_intent' ? '궁극적 의도 분석' :
                                                analysis.type === 'ultimate_personality' ? '궁극적 성향 분석' :
                                                    analysis.type === 'ultimate_prediction' ? '궁극적 예측 분석' :
                                                        '궁극적 최적화'}
                                    </span>
                                    <span className={`text-sm font-medium ${getUltimateAdvantageColor(analysis.ultimateAdvantage)}`}>
                                        {(analysis.ultimateAdvantage * 100).toFixed(2)}% 궁극 이점
                                    </span>
                                </div>
                                <p className="text-sm text-purple-200 mb-2">{analysis.classicalResult.description}</p>
                                <div className="text-xs text-purple-300">
                                    <strong>차원:</strong> {analysis.ultimateState.dimension}차원 |
                                    <strong> 의식:</strong> {(analysis.ultimateState.consciousness * 100).toFixed(2)}% |
                                    <strong> 진화:</strong> {(analysis.ultimateState.evolution * 100).toFixed(2)}%
                                </div>
                                <div className="text-xs text-purple-400 mt-2">
                                    <strong>궁극:</strong> {(analysis.ultimateState.ultimate * 100).toFixed(2)}% |
                                    <strong> 무한:</strong> {(analysis.ultimateState.infinity * 100).toFixed(2)}% |
                                    <strong> 신성:</strong> {(analysis.ultimateState.divinity * 100).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 무한 진화 분석 */}
            {infiniteEvolutionAnalysis && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">무한 진화 분석</h3>
                    <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 rounded-lg p-4 border border-indigo-500">
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                            {Object.entries(infiniteEvolutionAnalysis.dimensions).map(([dimension, value]) => (
                                <div key={dimension} className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{(value * 100).toFixed(2)}%</div>
                                    <div className="text-sm text-purple-300 capitalize">{dimension}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-white mb-2">궁극적 상관관계</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Array.from(infiniteEvolutionAnalysis.correlations.entries()).map(([key, value]) => (
                                        <div key={key} className="text-sm text-purple-200">
                                            {key}: {(value * 100).toFixed(2)}%
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-white mb-2">궁극적 패턴</h4>
                                <div className="space-y-1">
                                    {infiniteEvolutionAnalysis.patterns.map((pattern, index) => (
                                        <div key={index} className="text-sm text-purple-200">• {pattern}</div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-white mb-2">궁극적 이상 징후</h4>
                                <div className="space-y-1">
                                    {infiniteEvolutionAnalysis.anomalies.map((anomaly, index) => (
                                        <div key={index} className="text-sm text-indigo-300">👑 {anomaly}</div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-white mb-2">진화 경로</h4>
                                <div className="space-y-1">
                                    {infiniteEvolutionAnalysis.evolutionPaths.map((path, index) => (
                                        <div key={index} className="text-sm text-purple-200">
                                            • {path.path}: {path.destination} ({(path.probability * 100).toFixed(2)}%)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 궁극적 최적화 */}
            {ultimateOptimization && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">궁극적 최적화</h3>
                    <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 border border-green-500">
                        <div className="flex items-center space-x-2 mb-3">
                            <RocketLaunchIcon className="w-5 h-5 text-green-400" />
                            <span className="font-medium text-white">{ultimateOptimization.strategy}</span>
                            <span className={`text-sm font-medium ${getUltimateAdvantageColor(ultimateOptimization.ultimateAdvantage)}`}>
                                {(ultimateOptimization.ultimateAdvantage * 100).toFixed(2)}% 궁극 이점
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(ultimateOptimization.parameters).map(([param, value]) => (
                                <div key={param} className="text-center">
                                    <div className="text-xl font-bold text-green-400">{((value as number) * 100).toFixed(2)}%</div>
                                    <div className="text-sm text-green-300 capitalize">{param}</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h4 className="font-medium text-white mb-2">궁극적 권장사항</h4>
                            <div className="space-y-1">
                                {ultimateOptimization.recommendations.map((rec: string, index: number) => (
                                    <div key={index} className="text-sm text-green-200">• {rec}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 궁극적 메트릭 */}
            {showUltimateDetails && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">궁극적 메트릭</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-500">
                            <div className="text-2xl font-bold text-purple-400">{ultimateAnalyses.reduce((sum, a) => sum + a.dimensionsExplored, 0)}</div>
                            <div className="text-sm text-purple-300">탐색된 차원</div>
                        </div>
                        <div className="bg-indigo-900/30 rounded-lg p-4 text-center border border-indigo-500">
                            <div className="text-2xl font-bold text-indigo-400">
                                {ultimateAnalyses.reduce((sum, a) => sum + a.ultimateState.evolution, 0) / Math.max(ultimateAnalyses.length, 1) * 100}
                            </div>
                            <div className="text-sm text-indigo-300">평균 진화 수준</div>
                        </div>
                        <div className="bg-blue-900/30 rounded-lg p-4 text-center border border-blue-500">
                            <div className="text-2xl font-bold text-blue-400">
                                {ultimateAnalyses.reduce((sum, a) => sum + a.ultimateAdvantage, 0) / Math.max(ultimateAnalyses.length, 1) * 100}
                            </div>
                            <div className="text-sm text-blue-300">평균 궁극 이점</div>
                        </div>
                        <div className="bg-green-900/30 rounded-lg p-4 text-center border border-green-500">
                            <div className="text-2xl font-bold text-green-400">
                                {ultimateAnalyses.reduce((sum, a) => sum + a.processingTime, 0)}
                            </div>
                            <div className="text-sm text-green-300">총 처리 시간(ms)</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UltimateAIEngine; 