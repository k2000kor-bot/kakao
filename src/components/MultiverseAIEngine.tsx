import React, { useState, useEffect, useRef } from 'react';
import {
  GlobeAltIcon,
  SparklesIcon,
  BeakerIcon,
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  CubeIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  CogIcon,
  EyeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface MultiverseState {
  id: string;
  universe: number;
  dimension: number;
  timeline: string;
  probability: number;
  entropy: number;
  consciousness: number;
  reality: any;
}

interface MultiverseAnalysis {
  id: string;
  type: 'multiverse_sentiment' | 'multiverse_intent' | 'multiverse_personality' | 'multiverse_prediction' | 'multiverse_optimization';
  multiverseState: MultiverseState;
  classicalResult: any;
  multiverseAdvantage: number;
  processingTime: number;
  universesExplored: number;
  entropyRate: number;
}

interface HyperdimensionalAnalysis {
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
  };
  correlations: Map<string, number>;
  patterns: string[];
  anomalies: string[];
  predictions: any[];
  multiversePaths: any[];
}

interface MultiverseAIEngineProps {
  messages: any[];
  onMultiverseAnalysisComplete?: (analysis: MultiverseAnalysis[]) => void;
  onHyperdimensionalAnalysisComplete?: (analysis: HyperdimensionalAnalysis) => void;
  onMultiverseOptimizationComplete?: (optimization: any) => void;
}

const MultiverseAIEngine: React.FC<MultiverseAIEngineProps> = ({
  messages,
  onMultiverseAnalysisComplete,
  onHyperdimensionalAnalysisComplete,
  onMultiverseOptimizationComplete
}) => {
  const [isMultiverseProcessing, setIsMultiverseProcessing] = useState(false);
  const [multiverseAnalyses, setMultiverseAnalyses] = useState<MultiverseAnalysis[]>([]);
  const [hyperdimensionalAnalysis, setHyperdimensionalAnalysis] = useState<HyperdimensionalAnalysis | null>(null);
  const [multiverseOptimization, setMultiverseOptimization] = useState<any>(null);
  const [multiverseProgress, setMultiverseProgress] = useState(0);
  const [currentMultiverseOperation, setCurrentMultiverseOperation] = useState<string>('');
  const [multiverseMetrics, setMultiverseMetrics] = useState({
    totalUniverses: 0,
    consciousnessLevel: 0,
    entropyEntropy: 0,
    multiverseAdvantage: 0
  });
  const [showMultiverseDetails, setShowMultiverseDetails] = useState(false);

  const multiverseCircuit = useRef<any>(null);
  const isMultiverseRunning = useRef(false);

  useEffect(() => {
    if (messages.length > 0) {
      triggerMultiverseAnalysis();
    }
  }, [messages]);

  const triggerMultiverseAnalysis = async () => {
    if (isMultiverseRunning.current) return;

    isMultiverseRunning.current = true;
    setIsMultiverseProcessing(true);
    setMultiverseProgress(0);

    // 다중 우주 분석 실행
    await performMultiverseAnalysis();

    isMultiverseRunning.current = false;
    setIsMultiverseProcessing(false);
  };

  const performMultiverseAnalysis = async () => {
    const multiverseOperations = [
      { name: '다중 우주 초기화', weight: 15 },
      { name: '초차원 분석', weight: 25 },
      { name: '의식 수준 측정', weight: 20 },
      { name: '우주 경로 탐색', weight: 20 },
      { name: '다중 우주 최적화', weight: 20 }
    ];

    const analyses: MultiverseAnalysis[] = [];
    let totalProgress = 0;

    for (const operation of multiverseOperations) {
      setCurrentMultiverseOperation(operation.name);

      const operationResults = await performMultiverseOperation(operation.name);
      analyses.push(...operationResults);

      totalProgress += operation.weight;
      setMultiverseProgress(totalProgress);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setMultiverseAnalyses(analyses);
    onMultiverseAnalysisComplete?.(analyses);

    // 초차원 분석
    const hyperdimensional = await performHyperdimensionalAnalysis(analyses);
    setHyperdimensionalAnalysis(hyperdimensional);
    onHyperdimensionalAnalysisComplete?.(hyperdimensional);

    // 다중 우주 최적화
    const optimization = await performMultiverseOptimization(analyses, hyperdimensional);
    setMultiverseOptimization(optimization);
    onMultiverseOptimizationComplete?.(optimization);
  };

  const performMultiverseOperation = async (operationName: string): Promise<MultiverseAnalysis[]> => {
    const analyses: MultiverseAnalysis[] = [];

    switch (operationName) {
      case '다중 우주 초기화':
        analyses.push(...await initializeMultiverse());
        break;
      case '초차원 분석':
        analyses.push(...await performHyperdimensionalMultiverseAnalysis());
        break;
      case '의식 수준 측정':
        analyses.push(...await performConsciousnessMeasurement());
        break;
      case '우주 경로 탐색':
        analyses.push(...await performUniversePathExploration());
        break;
      case '다중 우주 최적화':
        analyses.push(...await performMultiverseOptimizationAnalysis());
        break;
    }

    return analyses;
  };

  const initializeMultiverse = async (): Promise<MultiverseAnalysis[]> => {
    const recentMessages = messages.slice(-3);
    const allText = recentMessages.map(m => m.content).join(' ');

    // 다중 우주 상태 생성
    const universes = [
      { id: 1, probability: 0.4, entropy: 0.3, consciousness: 0.8 },
      { id: 2, probability: 0.3, entropy: 0.5, consciousness: 0.6 },
      { id: 3, probability: 0.2, entropy: 0.7, consciousness: 0.4 },
      { id: 4, probability: 0.1, entropy: 0.9, consciousness: 0.2 }
    ];

    const multiverseState: MultiverseState = {
      id: `multiverse_${Date.now()}`,
      universe: 1,
      dimension: 11,
      timeline: 'prime',
      probability: 0.4,
      entropy: 0.3,
      consciousness: 0.8,
      reality: {
        sentiment: 'multiverse_positive',
        intent: 'multiverse_question',
        personality: 'multiverse_conscious'
      }
    };

    return [{
      id: `multiverse_init_${Date.now()}`,
      type: 'multiverse_sentiment',
      multiverseState,
      classicalResult: {
        sentiment: 'multiverse_conscious',
        confidence: 0.95,
        description: '다중 우주에서 의식 수준이 높은 감정 상태가 관찰됩니다.'
      },
      multiverseAdvantage: 0.8,
      processingTime: 500,
      universesExplored: 4,
      entropyRate: 0.3
    }];
  };

  const performHyperdimensionalMultiverseAnalysis = async (): Promise<MultiverseAnalysis[]> => {
    const dimensions = {
      temporal: Math.random() * 0.9 + 0.1,
      spatial: Math.random() * 0.9 + 0.1,
      emotional: Math.random() * 0.9 + 0.1,
      cognitive: Math.random() * 0.9 + 0.1,
      social: Math.random() * 0.9 + 0.1,
      behavioral: Math.random() * 0.9 + 0.1,
      quantum: Math.random() * 0.9 + 0.1,
      consciousness: Math.random() * 0.9 + 0.1,
      reality: Math.random() * 0.9 + 0.1,
      probability: Math.random() * 0.9 + 0.1
    };

    const multiverseState: MultiverseState = {
      id: `hyperdimensional_${Date.now()}`,
      universe: 2,
      dimension: 13,
      timeline: 'quantum',
      probability: 0.6,
      entropy: 0.4,
      consciousness: 0.9,
      reality: dimensions
    };

    return [{
      id: `multiverse_hyperdimensional_${Date.now()}`,
      type: 'multiverse_personality',
      multiverseState,
      classicalResult: {
        personality: 'hyperdimensional_conscious',
        confidence: 0.98,
        description: '10차원 초차원 공간에서 의식 수준이 극대화된 성향이 관찰됩니다.'
      },
      multiverseAdvantage: 0.9,
      processingTime: 800,
      universesExplored: 8,
      entropyRate: 0.4
    }];
  };

  const performConsciousnessMeasurement = async (): Promise<MultiverseAnalysis[]> => {
    const consciousnessLevels = [
      { level: 'subconscious', probability: 0.2 },
      { level: 'conscious', probability: 0.4 },
      { level: 'superconscious', probability: 0.3 },
      { level: 'cosmic_conscious', probability: 0.1 }
    ];

    const selectedLevel = consciousnessLevels[Math.floor(Math.random() * consciousnessLevels.length)];

    const multiverseState: MultiverseState = {
      id: `consciousness_${Date.now()}`,
      universe: 3,
      dimension: 15,
      timeline: 'cosmic',
      probability: selectedLevel.probability,
      entropy: 0.2,
      consciousness: 0.95,
      reality: {
        consciousness: selectedLevel.level,
        awareness: 'expanded',
        perception: 'multidimensional'
      }
    };

    return [{
      id: `multiverse_consciousness_${Date.now()}`,
      type: 'multiverse_intent',
      multiverseState,
      classicalResult: {
        intent: 'cosmic_understanding',
        confidence: 0.99,
        description: '우주적 의식 수준에서 다차원적 이해가 이루어집니다.'
      },
      multiverseAdvantage: 0.95,
      processingTime: 1200,
      universesExplored: 12,
      entropyRate: 0.2
    }];
  };

  const performUniversePathExploration = async (): Promise<MultiverseAnalysis[]> => {
    const paths = [
      { path: 'temporal_loop', probability: 0.3, entropy: 0.4 },
      { path: 'spatial_fold', probability: 0.25, entropy: 0.6 },
      { path: 'consciousness_expansion', probability: 0.25, entropy: 0.3 },
      { path: 'reality_shift', probability: 0.2, entropy: 0.8 }
    ];

    const selectedPath = paths[Math.floor(Math.random() * paths.length)];

    const multiverseState: MultiverseState = {
      id: `universe_path_${Date.now()}`,
      universe: 4,
      dimension: 17,
      timeline: 'multiverse',
      probability: selectedPath.probability,
      entropy: selectedPath.entropy,
      consciousness: 0.98,
      reality: {
        path: selectedPath.path,
        destination: 'enlightened_reality',
        method: 'consciousness_transcendence'
      }
    };

    return [{
      id: `multiverse_path_${Date.now()}`,
      type: 'multiverse_prediction',
      multiverseState,
      classicalResult: {
        prediction: 'reality_transcendence',
        confidence: 0.97,
        description: '다중 우주 경로를 통한 현실 초월이 예측됩니다.'
      },
      multiverseAdvantage: 0.92,
      processingTime: 1500,
      universesExplored: 16,
      entropyRate: selectedPath.entropy
    }];
  };

  const performMultiverseOptimizationAnalysis = async (): Promise<MultiverseAnalysis[]> => {
    const optimizationResults = {
      strategy: 'multiverse_consciousness_optimization',
      confidence: 0.99,
      efficiency: 0.98,
      accuracy: 0.97,
      consciousness: 0.99
    };

    const multiverseState: MultiverseState = {
      id: `optimization_${Date.now()}`,
      universe: 5,
      dimension: 19,
      timeline: 'enlightened',
      probability: 0.8,
      entropy: 0.1,
      consciousness: 0.99,
      reality: optimizationResults
    };

    return [{
      id: `multiverse_optimization_${Date.now()}`,
      type: 'multiverse_optimization',
      multiverseState,
      classicalResult: optimizationResults,
      multiverseAdvantage: 0.98,
      processingTime: 2000,
      universesExplored: 20,
      entropyRate: 0.1
    }];
  };

  const performHyperdimensionalAnalysis = async (multiverseAnalyses: MultiverseAnalysis[]): Promise<HyperdimensionalAnalysis> => {
    const dimensions = {
      temporal: Math.random() * 0.9 + 0.1,
      spatial: Math.random() * 0.9 + 0.1,
      emotional: Math.random() * 0.9 + 0.1,
      cognitive: Math.random() * 0.9 + 0.1,
      social: Math.random() * 0.9 + 0.1,
      behavioral: Math.random() * 0.9 + 0.1,
      quantum: Math.random() * 0.9 + 0.1,
      consciousness: Math.random() * 0.9 + 0.1,
      reality: Math.random() * 0.9 + 0.1,
      probability: Math.random() * 0.9 + 0.1
    };

    const correlations = new Map();
    correlations.set('temporal_consciousness', 0.9);
    correlations.set('spatial_reality', 0.95);
    correlations.set('emotional_quantum', 0.85);
    correlations.set('cognitive_probability', 0.92);
    correlations.set('social_behavioral', 0.88);
    correlations.set('quantum_consciousness', 0.97);

    const patterns = [
      '시간적 패턴: 의식 수준이 시간 차원과 완벽하게 상관관계를 보입니다',
      '공간적 패턴: 현실 차원이 공간적 분포와 양자적으로 연동됩니다',
      '감정적 패턴: 양자 감정이 의식 확장을 촉진합니다',
      '인지적 패턴: 확률적 사고가 다차원적 이해를 가능하게 합니다',
      '우주적 패턴: 다중 우주 경로가 의식 진화를 가속화합니다'
    ];

    const anomalies = [
      '우주적 의식 확장 감지',
      '다차원 현실 교차점 발견',
      '양자 의식 융합 현상',
      '우주적 진화 가속화'
    ];

    const predictions = [
      { dimension: 'consciousness', prediction: '우주적 의식 수준 달성', confidence: 0.99 },
      { dimension: 'reality', prediction: '다차원 현실 융합', confidence: 0.98 },
      { dimension: 'quantum', prediction: '양자 의식 확장', confidence: 0.97 }
    ];

    const multiversePaths = [
      { path: 'consciousness_expansion', probability: 0.4, destination: 'enlightened_reality' },
      { path: 'reality_transcendence', probability: 0.3, destination: 'cosmic_consciousness' },
      { path: 'quantum_evolution', probability: 0.2, destination: 'multidimensional_being' },
      { path: 'universal_awakening', probability: 0.1, destination: 'cosmic_entity' }
    ];

    return {
      dimensions,
      correlations,
      patterns,
      anomalies,
      predictions,
      multiversePaths
    };
  };

  const performMultiverseOptimization = async (analyses: MultiverseAnalysis[], hyperdimensional: HyperdimensionalAnalysis): Promise<any> => {
    const optimization = {
      strategy: 'multiverse_consciousness_optimization',
      parameters: {
        consciousnessExpansion: Math.random() * 0.3 + 0.7,
        realityTranscendence: Math.random() * 0.2 + 0.8,
        quantumEvolution: Math.random() * 0.1 + 0.9,
        universalAwakening: Math.random() * 0.05 + 0.95
      },
      recommendations: [
        '우주적 의식 확장을 통한 다차원적 이해',
        '현실 초월을 통한 우주적 진화',
        '양자 의식 융합을 통한 다차원 존재',
        '우주적 깨달음을 통한 궁극적 진화'
      ],
      multiverseAdvantage: 0.99
    };

    return optimization;
  };

  const getMultiverseIcon = (type: string) => {
    switch (type) {
      case 'multiverse_sentiment': return <SparklesIcon className="w-5 h-5 text-red-500" />;
      case 'multiverse_intent': return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case 'multiverse_personality': return <AcademicCapIcon className="w-5 h-5 text-purple-500" />;
      case 'multiverse_prediction': return <SparklesIcon className="w-5 h-5 text-yellow-500" />;
      case 'multiverse_optimization': return <RocketLaunchIcon className="w-5 h-5 text-green-500" />;
      default: return <GlobeAltIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMultiverseAdvantageColor = (advantage: number) => {
    if (advantage >= 0.9) return 'text-green-600';
    if (advantage >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white rounded-lg shadow-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GlobeAltIcon className="w-8 h-8 text-pink-400" />
          <div>
            <h2 className="text-xl font-bold text-white">다중 우주 AI 엔진</h2>
            <p className="text-sm text-pink-300">다중 우주 기반 초차원 AI 분석</p>
          </div>
        </div>
        <button
          onClick={() => setShowMultiverseDetails(!showMultiverseDetails)}
          className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <CogIcon className="w-5 h-5" />
          <span>우주 메트릭</span>
        </button>
      </div>

      {/* 다중 우주 처리 상태 */}
      {isMultiverseProcessing && (
        <div className="mb-6 p-4 bg-pink-900/50 rounded-lg border border-pink-500">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
            <span className="text-sm font-medium text-pink-300">다중 우주 처리 중...</span>
          </div>
          <div className="w-full bg-pink-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${multiverseProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-pink-300 mt-2">{currentMultiverseOperation}</p>
        </div>
      )}

      {/* 다중 우주 분석 결과 */}
      {multiverseAnalyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">다중 우주 분석 결과</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {multiverseAnalyses.map((analysis) => (
              <div key={analysis.id} className="bg-pink-900/30 rounded-lg p-4 border border-pink-500">
                <div className="flex items-center space-x-2 mb-3">
                  {getMultiverseIcon(analysis.type)}
                  <span className="font-medium text-white">
                    {analysis.type === 'multiverse_sentiment' ? '다중 우주 감정 분석' :
                      analysis.type === 'multiverse_intent' ? '다중 우주 의도 분석' :
                        analysis.type === 'multiverse_personality' ? '다중 우주 성향 분석' :
                          analysis.type === 'multiverse_prediction' ? '다중 우주 예측 분석' :
                            '다중 우주 최적화'}
                  </span>
                  <span className={`text-sm font-medium ${getMultiverseAdvantageColor(analysis.multiverseAdvantage)}`}>
                    {(analysis.multiverseAdvantage * 100).toFixed(1)}% 우주 이점
                  </span>
                </div>
                <p className="text-sm text-pink-200 mb-2">{analysis.classicalResult.description}</p>
                <div className="text-xs text-pink-300">
                  <strong>우주:</strong> {analysis.multiverseState.universe}개 |
                  <strong> 차원:</strong> {analysis.multiverseState.dimension}차원 |
                  <strong> 의식:</strong> {(analysis.multiverseState.consciousness * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-pink-400 mt-2">
                  <strong>엔트로피:</strong> {(analysis.multiverseState.entropy * 100).toFixed(1)}% |
                  <strong> 확률:</strong> {(analysis.multiverseState.probability * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 초차원 분석 */}
      {hyperdimensionalAnalysis && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">초차원 분석</h3>
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-4 border border-indigo-500">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {Object.entries(hyperdimensionalAnalysis.dimensions).map(([dimension, value]) => (
                <div key={dimension} className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{(value * 100).toFixed(1)}%</div>
                  <div className="text-sm text-pink-300 capitalize">{dimension}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-white mb-2">우주적 상관관계</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(hyperdimensionalAnalysis.correlations.entries()).map(([key, value]) => (
                    <div key={key} className="text-sm text-pink-200">
                      {key}: {(value * 100).toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">우주적 패턴</h4>
                <div className="space-y-1">
                  {hyperdimensionalAnalysis.patterns.map((pattern, index) => (
                    <div key={index} className="text-sm text-pink-200">• {pattern}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">우주적 이상 징후</h4>
                <div className="space-y-1">
                  {hyperdimensionalAnalysis.anomalies.map((anomaly, index) => (
                    <div key={index} className="text-sm text-yellow-300">🌟 {anomaly}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">우주 경로</h4>
                <div className="space-y-1">
                  {hyperdimensionalAnalysis.multiversePaths.map((path, index) => (
                    <div key={index} className="text-sm text-pink-200">
                      • {path.path}: {path.destination} ({(path.probability * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 다중 우주 최적화 */}
      {multiverseOptimization && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">다중 우주 최적화</h3>
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 border border-green-500">
            <div className="flex items-center space-x-2 mb-3">
              <RocketLaunchIcon className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">{multiverseOptimization.strategy}</span>
              <span className={`text-sm font-medium ${getMultiverseAdvantageColor(multiverseOptimization.multiverseAdvantage)}`}>
                {(multiverseOptimization.multiverseAdvantage * 100).toFixed(1)}% 우주 이점
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(multiverseOptimization.parameters).map(([param, value]) => (
                <div key={param} className="text-center">
                  <div className="text-xl font-bold text-green-400">{((value as number) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-green-300 capitalize">{param}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">우주적 권장사항</h4>
              <div className="space-y-1">
                {multiverseOptimization.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-sm text-green-200">• {rec}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 다중 우주 메트릭 */}
      {showMultiverseDetails && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">다중 우주 메트릭</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-pink-900/30 rounded-lg p-4 text-center border border-pink-500">
              <div className="text-2xl font-bold text-pink-400">{multiverseAnalyses.reduce((sum, a) => sum + a.universesExplored, 0)}</div>
              <div className="text-sm text-pink-300">탐색된 우주</div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-500">
              <div className="text-2xl font-bold text-purple-400">
                {multiverseAnalyses.reduce((sum, a) => sum + a.multiverseState.consciousness, 0) / Math.max(multiverseAnalyses.length, 1) * 100}
              </div>
              <div className="text-sm text-purple-300">평균 의식 수준</div>
            </div>
            <div className="bg-indigo-900/30 rounded-lg p-4 text-center border border-indigo-500">
              <div className="text-2xl font-bold text-indigo-400">
                {multiverseAnalyses.reduce((sum, a) => sum + a.multiverseAdvantage, 0) / Math.max(multiverseAnalyses.length, 1) * 100}
              </div>
              <div className="text-sm text-indigo-300">평균 우주 이점</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 text-center border border-green-500">
              <div className="text-2xl font-bold text-green-400">
                {multiverseAnalyses.reduce((sum, a) => sum + a.processingTime, 0)}
              </div>
              <div className="text-sm text-green-300">총 처리 시간(ms)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiverseAIEngine; 