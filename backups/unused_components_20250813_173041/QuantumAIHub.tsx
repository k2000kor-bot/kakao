import React, { useState, useEffect, useCallback } from 'react';
import {
  CpuChipIcon,
  BeakerIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  BoltIcon,
  GlobeAltIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface QuantumAIAlgorithm {
  id: string;
  name: string;
  type: 'quantum_machine_learning' | 'quantum_optimization' | 'quantum_simulation' | 'quantum_cryptography' | 'quantum_ai' | 'hybrid_quantum_classical';
  category: 'quantum_computing' | 'quantum_ai' | 'quantum_optimization' | 'quantum_simulation' | 'quantum_cryptography' | 'hybrid_systems';
  status: 'idle' | 'running' | 'completed' | 'error' | 'quantum_ready' | 'quantum_processing';
  qubits: number;
  depth: number;
  fidelity: number;
  coherence_time: number;
  error_rate: number;
  lastUpdated: Date;
  performance: {
    quantum_advantage: number;
    classical_equivalent: number;
    speedup_factor: number;
    accuracy: number;
  };
  features: string[];
  description: string;
  quantum_circuit?: string;
}

interface QuantumExecution {
  id: string;
  algorithmId: string;
  startTime: Date;
  endTime?: Date;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'quantum_processing';
  progress: number;
  currentStep: string;
  totalSteps: number;
  metrics: {
    quantum_states: number[];
    classical_states: number[];
    entanglement_measures: number[];
    coherence_times: number[];
  };
  logs: string[];
  quantum_results?: any;
}

const QuantumAIHub: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<QuantumAIAlgorithm[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<QuantumExecution[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAIAlgorithm | null>(null);
  const [quantumState, setQuantumState] = useState<string>('ready');
  const [quantumMetrics, setQuantumMetrics] = useState<any>(null);

  // 양자 AI 알고리즘 초기화
  const initializeQuantumAlgorithms = useCallback(() => {
    const quantumAlgorithms: QuantumAIAlgorithm[] = [
      // Quantum Machine Learning
      {
        id: 'qml-001',
        name: 'Quantum Neural Network (QNN)',
        type: 'quantum_machine_learning',
        category: 'quantum_ai',
        status: 'idle',
        qubits: 8,
        depth: 12,
        fidelity: 0.998,
        coherence_time: 50,
        error_rate: 0.001,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.85,
          classical_equivalent: 0.72,
          speedup_factor: 3.2,
          accuracy: 0.94
        },
        features: ['양자 중첩 활용', '양자 얽힘 기반 학습', '지수적 속도 향상', '양자 메모리'],
        description: '양자 중첩과 얽힘을 활용한 신경망으로 지수적 속도 향상'
      },
      {
        id: 'qml-002',
        name: 'Quantum Support Vector Machine (QSVM)',
        type: 'quantum_machine_learning',
        category: 'quantum_ai',
        status: 'idle',
        qubits: 6,
        depth: 8,
        fidelity: 0.995,
        coherence_time: 45,
        error_rate: 0.002,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.78,
          classical_equivalent: 0.65,
          speedup_factor: 2.8,
          accuracy: 0.91
        },
        features: ['양자 커널 트릭', '고차원 공간 매핑', '양자 특징 추출', '비선형 분류'],
        description: '양자 커널을 활용한 고차원 공간에서의 분류'
      },

      // Quantum Optimization
      {
        id: 'qopt-001',
        name: 'Quantum Approximate Optimization Algorithm (QAOA)',
        type: 'quantum_optimization',
        category: 'quantum_optimization',
        status: 'idle',
        qubits: 12,
        depth: 16,
        fidelity: 0.992,
        coherence_time: 60,
        error_rate: 0.003,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.92,
          classical_equivalent: 0.68,
          speedup_factor: 4.5,
          accuracy: 0.96
        },
        features: ['조합 최적화', '양자-고전 하이브리드', '근사 해 찾기', 'NP-난제 해결'],
        description: '조합 최적화 문제를 위한 양자-고전 하이브리드 알고리즘'
      },
      {
        id: 'qopt-002',
        name: 'Quantum Adiabatic Algorithm (QAA)',
        type: 'quantum_optimization',
        category: 'quantum_optimization',
        status: 'idle',
        qubits: 10,
        depth: 14,
        fidelity: 0.989,
        coherence_time: 55,
        error_rate: 0.004,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.88,
          classical_equivalent: 0.71,
          speedup_factor: 3.8,
          accuracy: 0.93
        },
        features: ['단열 양자 계산', '그라운드 상태 찾기', '양자 터널링', '에너지 최소화'],
        description: '양자 단열 과정을 통한 최적해 탐색'
      },

      // Quantum Simulation
      {
        id: 'qsim-001',
        name: 'Quantum Chemistry Simulation',
        type: 'quantum_simulation',
        category: 'quantum_simulation',
        status: 'idle',
        qubits: 16,
        depth: 20,
        fidelity: 0.985,
        coherence_time: 70,
        error_rate: 0.005,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.95,
          classical_equivalent: 0.45,
          speedup_factor: 6.2,
          accuracy: 0.98
        },
        features: ['분자 구조 시뮬레이션', '전자 구조 계산', '화학 반응 예측', '재료 설계'],
        description: '양자 시스템을 통한 분자 및 화학 반응 시뮬레이션'
      },
      {
        id: 'qsim-002',
        name: 'Quantum Many-Body Physics',
        type: 'quantum_simulation',
        category: 'quantum_simulation',
        status: 'idle',
        qubits: 14,
        depth: 18,
        fidelity: 0.987,
        coherence_time: 65,
        error_rate: 0.004,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.93,
          classical_equivalent: 0.52,
          speedup_factor: 5.8,
          accuracy: 0.97
        },
        features: ['다체 물리 시뮬레이션', '양자 상전이', '얽힘 구조 분석', '물질 특성 예측'],
        description: '다체 양자 시스템의 물리적 특성 시뮬레이션'
      },

      // Quantum Cryptography
      {
        id: 'qcrypto-001',
        name: 'Quantum Key Distribution (QKD)',
        type: 'quantum_cryptography',
        category: 'quantum_cryptography',
        status: 'idle',
        qubits: 4,
        depth: 6,
        fidelity: 0.999,
        coherence_time: 30,
        error_rate: 0.0005,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 1.0,
          classical_equivalent: 0.0,
          speedup_factor: 1000,
          accuracy: 0.999
        },
        features: ['양자 키 분배', '정보 이론적 보안', '도청 탐지', '양자 중첩 활용'],
        description: '양자 역학을 활용한 정보 이론적으로 안전한 키 분배'
      },
      {
        id: 'qcrypto-002',
        name: 'Post-Quantum Cryptography',
        type: 'quantum_cryptography',
        category: 'quantum_cryptography',
        status: 'idle',
        qubits: 8,
        depth: 10,
        fidelity: 0.996,
        coherence_time: 40,
        error_rate: 0.002,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.82,
          classical_equivalent: 0.15,
          speedup_factor: 8.5,
          accuracy: 0.95
        },
        features: ['양자 내성 암호화', '격자 기반 암호', '다변수 다항식', '해시 기반 서명'],
        description: '양자 컴퓨터 공격에 내성을 가진 암호화 시스템'
      },

      // Hybrid Quantum-Classical
      {
        id: 'hybrid-001',
        name: 'Variational Quantum Eigensolver (VQE)',
        type: 'hybrid_quantum_classical',
        category: 'hybrid_systems',
        status: 'idle',
        qubits: 10,
        depth: 12,
        fidelity: 0.994,
        coherence_time: 50,
        error_rate: 0.003,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.87,
          classical_equivalent: 0.58,
          speedup_factor: 4.2,
          accuracy: 0.94
        },
        features: ['변분 양자 고유값', '양자-고전 최적화', '그라운드 상태 찾기', '화학 시스템'],
        description: '양자 회로와 고전적 최적화를 결합한 하이브리드 알고리즘'
      },
      {
        id: 'hybrid-002',
        name: 'Quantum-Classical Neural Network',
        type: 'hybrid_quantum_classical',
        category: 'hybrid_systems',
        status: 'idle',
        qubits: 6,
        depth: 8,
        fidelity: 0.997,
        coherence_time: 45,
        error_rate: 0.002,
        lastUpdated: new Date(),
        performance: {
          quantum_advantage: 0.79,
          classical_equivalent: 0.67,
          speedup_factor: 3.1,
          accuracy: 0.92
        },
        features: ['양자-고전 신경망', '하이브리드 학습', '양자 특징 처리', '고전 분류'],
        description: '양자 회로와 고전 신경망을 결합한 하이브리드 학습'
      }
    ];

    setAlgorithms(quantumAlgorithms);
  }, []);

  useEffect(() => {
    initializeQuantumAlgorithms();
  }, [initializeQuantumAlgorithms]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quantum_computing':
        return <CpuChipIcon className="w-5 h-5" />;
      case 'quantum_ai':
        return <SparklesIcon className="w-5 h-5" />;
      case 'quantum_optimization':
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'quantum_simulation':
        return <BeakerIcon className="w-5 h-5" />;
      case 'quantum_cryptography':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'hybrid_systems':
        return <CubeIcon className="w-5 h-5" />;
      default:
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'quantum_computing':
        return '양자 컴퓨팅';
      case 'quantum_ai':
        return '양자 AI';
      case 'quantum_optimization':
        return '양자 최적화';
      case 'quantum_simulation':
        return '양자 시뮬레이션';
      case 'quantum_cryptography':
        return '양자 암호화';
      case 'hybrid_systems':
        return '하이브리드 시스템';
      default:
        return '전체';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500 bg-gray-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'quantum_ready':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const filteredAlgorithms = selectedCategory === 'all' 
    ? algorithms 
    : algorithms.filter(algorithm => algorithm.category === selectedCategory);

  const startQuantumExecution = async (algorithmId: string) => {
    const algorithm = algorithms.find(a => a.id === algorithmId);
    if (!algorithm) return;

    setQuantumState('initializing');
    
    // 알고리즘 상태를 running으로 변경
    setAlgorithms(prev => prev.map(a => 
      a.id === algorithmId ? { ...a, status: 'running' } : a
    ));

    // 새로운 양자 실행 세션 생성
    const newExecution: QuantumExecution = {
      id: `execution-${Date.now()}`,
      algorithmId,
      startTime: new Date(),
      status: 'queued',
      progress: 0,
      currentStep: '양자 시스템 초기화',
      totalSteps: 8,
      metrics: {
        quantum_states: [],
        classical_states: [],
        entanglement_measures: [],
        coherence_times: []
      },
      logs: [`${algorithm.name} 양자 실행 시작`]
    };

    setActiveExecutions(prev => [...prev, newExecution]);

    // 양자 실행 시뮬레이션
    const executionSteps = [
      '양자 시스템 초기화',
      '큐비트 준비',
      '양자 회로 구성',
      '양자 게이트 적용',
      '양자 얽힘 생성',
      '양자 측정 수행',
      '결과 해석',
      '양자 상태 정리'
    ];

    let currentStep = 0;
    const executionInterval = setInterval(() => {
      setActiveExecutions(prev => prev.map(execution => {
        if (execution.algorithmId === algorithmId && execution.status !== 'completed') {
          const newProgress = Math.min(execution.progress + 12.5, 100);
          const newStep = Math.floor((newProgress / 100) * executionSteps.length);
          
          // 양자 메트릭 시뮬레이션
          const quantumState = 0.5 + (newProgress / 100) * 0.4;
          const classicalState = 0.3 + (newProgress / 100) * 0.3;
          const entanglementMeasure = (newProgress / 100) * 0.9;
          const coherenceTime = 30 + (newProgress / 100) * 40;

          const updatedMetrics = {
            quantum_states: [...execution.metrics.quantum_states, quantumState],
            classical_states: [...execution.metrics.classical_states, classicalState],
            entanglement_measures: [...execution.metrics.entanglement_measures, entanglementMeasure],
            coherence_times: [...execution.metrics.coherence_times, coherenceTime]
          };

          if (newProgress === 100) {
            // 실행 완료
            setAlgorithms(prev => prev.map(a => 
              a.id === algorithmId ? { 
                ...a, 
                status: 'completed',
                lastUpdated: new Date()
              } : a
            ));
            setQuantumState('ready');
            clearInterval(executionInterval);
            return { 
              ...execution, 
              status: 'completed', 
              progress: 100, 
              currentStep: '완료',
              metrics: updatedMetrics,
              endTime: new Date(),
              quantum_results: {
                success: true,
                quantum_advantage: algorithm.performance.quantum_advantage,
                speedup_factor: algorithm.performance.speedup_factor,
                accuracy: algorithm.performance.accuracy
              }
            };
          }

          return { 
            ...execution, 
            progress: newProgress, 
            currentStep: executionSteps[newStep] || '처리 중',
            status: newStep > 2 ? 'quantum_processing' : 'running',
            metrics: updatedMetrics,
            logs: [...execution.logs, `단계 ${newStep + 1}: ${executionSteps[newStep] || '처리 중'}`]
          };
        }
        return execution;
      }));
    }, 200);
  };

  const stopQuantumExecution = (algorithmId: string) => {
    setAlgorithms(prev => prev.map(a => 
      a.id === algorithmId ? { ...a, status: 'idle' } : a
    ));
    setActiveExecutions(prev => prev.map(execution => 
      execution.algorithmId === algorithmId ? { ...execution, status: 'failed' } : execution
    ));
    setQuantumState('ready');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <CpuChipIcon className="w-6 h-6 mr-2" />
          양자 AI 허브
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 {algorithms.length}개 알고리즘 | {activeExecutions.filter(e => e.status === 'running' || e.status === 'quantum_processing').length}개 실행 중
        </div>
      </div>

      {/* 양자 상태 표시 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BoltIcon className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-semibold text-purple-800 dark:text-purple-200">
              양자 시스템 상태: {quantumState === 'ready' ? '준비됨' : '초기화 중'}
            </span>
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-300">
            큐비트: {algorithms.reduce((sum, a) => sum + a.qubits, 0)} | 
            평균 충실도: {(algorithms.reduce((sum, a) => sum + a.fidelity, 0) / algorithms.length * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'quantum_ai', 'quantum_optimization', 'quantum_simulation', 'quantum_cryptography', 'hybrid_systems'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 알고리즘 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map(algorithm => (
          <div
            key={algorithm.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getCategoryIcon(algorithm.category)}
                <h3 className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {algorithm.name}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(algorithm.status)}`}>
                {algorithm.status === 'idle' && '대기'}
                {algorithm.status === 'running' && '실행중'}
                {algorithm.status === 'completed' && '완료'}
                {algorithm.status === 'error' && '오류'}
                {algorithm.status === 'quantum_ready' && '양자 준비'}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {algorithm.description}
            </p>

            <div className="space-y-2 mb-4">
              {algorithm.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                  {feature}
                </div>
              ))}
              {algorithm.features.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{algorithm.features.length - 2}개 기능 더...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div>큐비트: {algorithm.qubits}</div>
              <div>깊이: {algorithm.depth}</div>
              <div>충실도: {(algorithm.fidelity * 100).toFixed(1)}%</div>
              <div>속도 향상: {algorithm.performance.speedup_factor}x</div>
            </div>

            <div className="flex space-x-2">
              {algorithm.status === 'idle' && (
                <button
                  onClick={() => startQuantumExecution(algorithm.id)}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center justify-center"
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  양자 실행
                </button>
              )}
              {(algorithm.status === 'running' || algorithm.status === 'quantum_processing') && (
                <button
                  onClick={() => stopQuantumExecution(algorithm.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center"
                >
                  <StopIcon className="w-4 h-4 mr-1" />
                  중지
                </button>
              )}
              {algorithm.status === 'completed' && (
                <button
                  onClick={() => setSelectedAlgorithm(algorithm)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center justify-center"
                >
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  결과 보기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 활성 양자 실행 */}
      {activeExecutions.filter(e => e.status === 'running' || e.status === 'quantum_processing').length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            활성 양자 실행
          </h3>
          <div className="space-y-4">
            {activeExecutions.filter(e => e.status === 'running' || e.status === 'quantum_processing').map(execution => {
              const algorithm = algorithms.find(a => a.id === execution.algorithmId);
              return (
                <div key={execution.id} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {algorithm?.name} 양자 실행 중
                    </span>
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {execution.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${execution.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    {execution.currentStep} | 
                    양자 상태: {(execution.metrics.quantum_states[execution.metrics.quantum_states.length - 1] * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 알고리즘 상세 정보 모달 */}
      {selectedAlgorithm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedAlgorithm.name}
                </h3>
                <button
                  onClick={() => setSelectedAlgorithm(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="닫기"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">알고리즘 설명</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedAlgorithm.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">양자 특성</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>큐비트 수: {selectedAlgorithm.qubits}</div>
                    <div>회로 깊이: {selectedAlgorithm.depth}</div>
                    <div>양자 충실도: {(selectedAlgorithm.fidelity * 100).toFixed(1)}%</div>
                    <div>결맞음 시간: {selectedAlgorithm.coherence_time}μs</div>
                    <div>오류율: {(selectedAlgorithm.error_rate * 100).toFixed(3)}%</div>
                    <div>양자 이점: {(selectedAlgorithm.performance.quantum_advantage * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">성능 지표</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="text-2xl font-bold text-purple-600">{(selectedAlgorithm.performance.quantum_advantage * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">양자 이점</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedAlgorithm.performance.speedup_factor}x</div>
                      <div className="text-sm text-gray-500">속도 향상</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">주요 기능</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAlgorithm.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumAIHub;
