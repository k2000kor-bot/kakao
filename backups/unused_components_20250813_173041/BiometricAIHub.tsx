import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CpuChipIcon,
  EyeIcon,
  FingerPrintIcon,
  HeartIcon,
  AcademicCapIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface BiometricAI {
  id: string;
  name: string;
  type: 'facial_recognition' | 'voice_recognition' | 'fingerprint_recognition' | 'gait_analysis' | 'heart_rate_analysis' | 'brain_signal_analysis' | 'emotion_detection' | 'behavioral_biometrics';
  category: 'physical_biometrics' | 'behavioral_biometrics' | 'physiological_biometrics' | 'cognitive_biometrics';
  status: 'idle' | 'scanning' | 'processing' | 'completed' | 'error';
  accuracy: number;
  false_positive_rate: number;
  false_negative_rate: number;
  processing_time: number;
  lastUpdated: Date;
  performance: {
    recognition_rate: number;
    security_level: number;
    user_friendliness: number;
    adaptability: number;
  };
  features: string[];
  description: string;
  biometric_data?: any;
}

interface BiometricScan {
  id: string;
  biometricId: string;
  startTime: Date;
  endTime?: Date;
  status: 'initializing' | 'scanning' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  totalSteps: number;
  metrics: {
    confidence_scores: number[];
    quality_scores: number[];
    match_scores: number[];
    processing_times: number[];
  };
  logs: string[];
  scan_results?: any;
}

const BiometricAIHub: React.FC = () => {
  const [biometrics, setBiometrics] = useState<BiometricAI[]>([]);
  const [activeScans, setActiveScans] = useState<BiometricScan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBiometric, setSelectedBiometric] = useState<BiometricAI | null>(null);
  const [scanState, setScanState] = useState<string>('ready');
  const [scanMetrics, setScanMetrics] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 생체 인식 AI 초기화
  const initializeBiometricAI = useCallback(() => {
    const biometricAIs: BiometricAI[] = [
      // Physical Biometrics
      {
        id: 'facial-001',
        name: '고급 얼굴 인식 AI',
        type: 'facial_recognition',
        category: 'physical_biometrics',
        status: 'idle',
        accuracy: 0.998,
        false_positive_rate: 0.001,
        false_negative_rate: 0.002,
        processing_time: 0.3,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.998,
          security_level: 0.95,
          user_friendliness: 0.98,
          adaptability: 0.92
        },
        features: ['3D 얼굴 매핑', '표정 인식', '나이 변화 적응', '조명 변화 대응'],
        description: '3D 얼굴 매핑과 딥러닝을 결합한 고정밀 얼굴 인식 시스템'
      },
      {
        id: 'fingerprint-001',
        name: '지문 인식 AI',
        type: 'fingerprint_recognition',
        category: 'physical_biometrics',
        status: 'idle',
        accuracy: 0.999,
        false_positive_rate: 0.0005,
        false_negative_rate: 0.001,
        processing_time: 0.2,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.999,
          security_level: 0.99,
          user_friendliness: 0.85,
          adaptability: 0.88
        },
        features: ['지문 융선 분석', '손상 지문 복원', '위조 탐지', '다중 지문 등록'],
        description: '고해상도 지문 스캔과 AI 기반 패턴 분석'
      },

      // Behavioral Biometrics
      {
        id: 'gait-001',
        name: '보행 패턴 분석 AI',
        type: 'gait_analysis',
        category: 'behavioral_biometrics',
        status: 'idle',
        accuracy: 0.985,
        false_positive_rate: 0.008,
        false_negative_rate: 0.015,
        processing_time: 1.2,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.985,
          security_level: 0.87,
          user_friendliness: 0.95,
          adaptability: 0.78
        },
        features: ['보행 동역학 분석', '걸음걸이 패턴', '신체 특징 추출', '실시간 추적'],
        description: '보행 패턴을 통한 비접촉 사용자 인식 시스템'
      },
      {
        id: 'behavioral-001',
        name: '행동 패턴 분석 AI',
        type: 'behavioral_biometrics',
        category: 'behavioral_biometrics',
        status: 'idle',
        accuracy: 0.972,
        false_positive_rate: 0.015,
        false_negative_rate: 0.028,
        processing_time: 2.5,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.972,
          security_level: 0.82,
          user_friendliness: 0.90,
          adaptability: 0.85
        },
        features: ['키보드 타이핑 패턴', '마우스 사용 패턴', '앱 사용 패턴', '시간 패턴 분석'],
        description: '사용자의 행동 패턴을 학습하여 지속적 인증'
      },

      // Physiological Biometrics
      {
        id: 'heart-001',
        name: '심박수 패턴 분석 AI',
        type: 'heart_rate_analysis',
        category: 'physiological_biometrics',
        status: 'idle',
        accuracy: 0.963,
        false_positive_rate: 0.025,
        false_negative_rate: 0.037,
        processing_time: 3.0,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.963,
          security_level: 0.89,
          user_friendliness: 0.88,
          adaptability: 0.75
        },
        features: ['심박 변이성 분석', '심전도 패턴', '스트레스 수준 측정', '감정 상태 연관'],
        description: '심박수 변이성을 통한 생체 신호 기반 인증'
      },
      {
        id: 'brain-001',
        name: '뇌파 패턴 분석 AI',
        type: 'brain_signal_analysis',
        category: 'physiological_biometrics',
        status: 'idle',
        accuracy: 0.978,
        false_positive_rate: 0.012,
        false_negative_rate: 0.022,
        processing_time: 4.5,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.978,
          security_level: 0.96,
          user_friendliness: 0.75,
          adaptability: 0.80
        },
        features: ['EEG 신호 분석', '뇌파 패턴 인식', '인지 상태 측정', '집중도 분석'],
        description: '뇌파 신호를 통한 고급 생체 인증 시스템'
      },

      // Cognitive Biometrics
      {
        id: 'emotion-001',
        name: '감정 인식 AI',
        type: 'emotion_detection',
        category: 'cognitive_biometrics',
        status: 'idle',
        accuracy: 0.945,
        false_positive_rate: 0.035,
        false_negative_rate: 0.055,
        processing_time: 1.8,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.945,
          security_level: 0.78,
          user_friendliness: 0.92,
          adaptability: 0.88
        },
        features: ['표정 감정 분석', '음성 감정 분석', '생체 신호 연관', '감정 변화 추적'],
        description: '다중 모달 감정 인식을 통한 인지적 생체 인증'
      },
      {
        id: 'voice-001',
        name: '음성 생체 인식 AI',
        type: 'voice_recognition',
        category: 'cognitive_biometrics',
        status: 'idle',
        accuracy: 0.987,
        false_positive_rate: 0.008,
        false_negative_rate: 0.013,
        processing_time: 1.5,
        lastUpdated: new Date(),
        performance: {
          recognition_rate: 0.987,
          security_level: 0.91,
          user_friendliness: 0.96,
          adaptability: 0.85
        },
        features: ['음성 특징 추출', '발성 패턴 분석', '감정 음성 인식', '노이즈 제거'],
        description: '음성의 고유한 생체 특징을 활용한 인증 시스템'
      }
    ];

    setBiometrics(biometricAIs);
  }, []);

  useEffect(() => {
    initializeBiometricAI();
  }, [initializeBiometricAI]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical_biometrics':
        return <UserIcon className="w-5 h-5" />;
      case 'behavioral_biometrics':
        return <SparklesIcon className="w-5 h-5" />;
      case 'physiological_biometrics':
        return <HeartIcon className="w-5 h-5" />;
      case 'cognitive_biometrics':
        return <AcademicCapIcon className="w-5 h-5" />;
      default:
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'physical_biometrics':
        return '신체 생체 인식';
      case 'behavioral_biometrics':
        return '행동 생체 인식';
      case 'physiological_biometrics':
        return '생리 생체 인식';
      case 'cognitive_biometrics':
        return '인지 생체 인식';
      default:
        return '전체';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500 bg-gray-100';
      case 'scanning':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const filteredBiometrics = selectedCategory === 'all' 
    ? biometrics 
    : biometrics.filter(biometric => biometric.category === selectedCategory);

  const startBiometricScan = async (biometricId: string) => {
    const biometric = biometrics.find(b => b.id === biometricId);
    if (!biometric) return;

    setScanState('initializing');
    
    // 생체 인식 상태를 scanning으로 변경
    setBiometrics(prev => prev.map(b => 
      b.id === biometricId ? { ...b, status: 'scanning' } : b
    ));

    // 새로운 스캔 세션 생성
    const newScan: BiometricScan = {
      id: `scan-${Date.now()}`,
      biometricId,
      startTime: new Date(),
      status: 'initializing',
      progress: 0,
      currentStep: '생체 인식 시스템 초기화',
      totalSteps: 6,
      metrics: {
        confidence_scores: [],
        quality_scores: [],
        match_scores: [],
        processing_times: []
      },
      logs: [`${biometric.name} 스캔 시작`]
    };

    setActiveScans(prev => [...prev, newScan]);

    // 스캔 시뮬레이션
    const scanSteps = [
      '생체 인식 시스템 초기화',
      '센서 캘리브레이션',
      '생체 데이터 수집',
      '특징 추출 및 분석',
      '패턴 매칭',
      '결과 검증'
    ];

    const scanInterval = setInterval(() => {
      setActiveScans(prev => prev.map(scan => {
        if (scan.biometricId === biometricId && scan.status !== 'completed') {
          const newProgress = Math.min(scan.progress + 16.67, 100);
          const newStep = Math.floor((newProgress / 100) * scanSteps.length);
          
          // 메트릭 시뮬레이션
          const confidenceScore = 0.6 + (newProgress / 100) * 0.35;
          const qualityScore = 0.7 + (newProgress / 100) * 0.25;
          const matchScore = (newProgress / 100) * 0.95;
          const processingTime = (newProgress / 100) * biometric.processing_time;

          const updatedMetrics = {
            confidence_scores: [...scan.metrics.confidence_scores, confidenceScore],
            quality_scores: [...scan.metrics.quality_scores, qualityScore],
            match_scores: [...scan.metrics.match_scores, matchScore],
            processing_times: [...scan.metrics.processing_times, processingTime]
          };

          if (newProgress === 100) {
            // 스캔 완료
            setBiometrics(prev => prev.map(b => 
              b.id === biometricId ? { 
                ...b, 
                status: 'completed',
                lastUpdated: new Date()
              } : b
            ));
            setScanState('ready');
            clearInterval(scanInterval);
            return { 
              ...scan, 
              status: 'completed', 
              progress: 100, 
              currentStep: '완료',
              metrics: updatedMetrics,
              endTime: new Date(),
              scan_results: {
                success: true,
                confidence: confidenceScore,
                quality: qualityScore,
                match_score: matchScore,
                processing_time: processingTime
              }
            };
          }

          return { 
            ...scan, 
            progress: newProgress, 
            currentStep: scanSteps[newStep] || '처리 중',
            status: newStep > 2 ? 'processing' : 'scanning',
            metrics: updatedMetrics,
            logs: [...scan.logs, `단계 ${newStep + 1}: ${scanSteps[newStep] || '처리 중'}`]
          };
        }
        return scan;
      }));
    }, 300);
  };

  const stopBiometricScan = (biometricId: string) => {
    setBiometrics(prev => prev.map(b => 
      b.id === biometricId ? { ...b, status: 'idle' } : b
    ));
    setActiveScans(prev => prev.map(scan => 
      scan.biometricId === biometricId ? { ...scan, status: 'failed' } : scan
    ));
    setScanState('ready');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ShieldCheckIcon className="w-6 h-6 mr-2" />
          생체 인식 AI 허브
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 {biometrics.length}개 시스템 | {activeScans.filter(s => s.status === 'scanning' || s.status === 'processing').length}개 스캔 중
        </div>
      </div>

      {/* 생체 인식 상태 표시 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BoltIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              생체 인식 시스템 상태: {scanState === 'ready' ? '준비됨' : '스캔 중'}
            </span>
          </div>
          <div className="text-sm text-green-600 dark:text-green-300">
            평균 정확도: {(biometrics.reduce((sum, b) => sum + b.accuracy, 0) / biometrics.length * 100).toFixed(1)}% | 
            보안 수준: {(biometrics.reduce((sum, b) => sum + b.performance.security_level, 0) / biometrics.length * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'physical_biometrics', 'behavioral_biometrics', 'physiological_biometrics', 'cognitive_biometrics'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 생체 인식 시스템 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBiometrics.map(biometric => (
          <div
            key={biometric.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getCategoryIcon(biometric.category)}
                <h3 className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {biometric.name}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(biometric.status)}`}>
                {biometric.status === 'idle' && '대기'}
                {biometric.status === 'scanning' && '스캔중'}
                {biometric.status === 'processing' && '처리중'}
                {biometric.status === 'completed' && '완료'}
                {biometric.status === 'error' && '오류'}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {biometric.description}
            </p>

            <div className="space-y-2 mb-4">
              {biometric.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                  {feature}
                </div>
              ))}
              {biometric.features.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{biometric.features.length - 2}개 기능 더...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div>정확도: {(biometric.accuracy * 100).toFixed(1)}%</div>
              <div>처리시간: {biometric.processing_time}s</div>
              <div>보안수준: {(biometric.performance.security_level * 100).toFixed(0)}%</div>
              <div>사용편의성: {(biometric.performance.user_friendliness * 100).toFixed(0)}%</div>
            </div>

            <div className="flex space-x-2">
              {biometric.status === 'idle' && (
                <button
                  onClick={() => startBiometricScan(biometric.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center justify-center"
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  스캔 시작
                </button>
              )}
              {(biometric.status === 'scanning' || biometric.status === 'processing') && (
                <button
                  onClick={() => stopBiometricScan(biometric.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center"
                >
                  <StopIcon className="w-4 h-4 mr-1" />
                  중지
                </button>
              )}
              {biometric.status === 'completed' && (
                <button
                  onClick={() => setSelectedBiometric(biometric)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  결과 보기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 활성 스캔 */}
      {activeScans.filter(s => s.status === 'scanning' || s.status === 'processing').length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            활성 생체 인식 스캔
          </h3>
          <div className="space-y-4">
            {activeScans.filter(s => s.status === 'scanning' || s.status === 'processing').map(scan => {
              const biometric = biometrics.find(b => b.id === scan.biometricId);
              return (
                <div key={scan.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {biometric?.name} 스캔 중
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {scan.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scan.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {scan.currentStep} | 
                    신뢰도: {(scan.metrics.confidence_scores[scan.metrics.confidence_scores.length - 1] * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 생체 인식 상세 정보 모달 */}
      {selectedBiometric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedBiometric.name}
                </h3>
                <button
                  onClick={() => setSelectedBiometric(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="닫기"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">시스템 설명</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedBiometric.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">성능 지표</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-2xl font-bold text-green-600">{(selectedBiometric.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">정확도</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-2xl font-bold text-blue-600">{(selectedBiometric.performance.security_level * 100).toFixed(0)}%</div>
                      <div className="text-sm text-gray-500">보안 수준</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">상세 성능</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>오탐률: {(selectedBiometric.false_positive_rate * 100).toFixed(3)}%</div>
                    <div>미탐률: {(selectedBiometric.false_negative_rate * 100).toFixed(3)}%</div>
                    <div>처리시간: {selectedBiometric.processing_time}초</div>
                    <div>인식률: {(selectedBiometric.performance.recognition_rate * 100).toFixed(1)}%</div>
                    <div>사용편의성: {(selectedBiometric.performance.user_friendliness * 100).toFixed(0)}%</div>
                    <div>적응성: {(selectedBiometric.performance.adaptability * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">주요 기능</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedBiometric.features.map((feature, index) => (
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

export default BiometricAIHub;
