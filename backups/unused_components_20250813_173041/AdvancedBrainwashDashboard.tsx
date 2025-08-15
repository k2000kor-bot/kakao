import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    BeakerIcon,
    FireIcon,
    EyeIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    UserGroupIcon,
    TrophyIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface BrainwashMetrics {
    manipulation_score: number;
    persuasion_potential: number;
    emotional_impact: number;
    cognitive_load: number;
    neural_activation: number;
    safety_score: number;
    effectiveness_prediction: number;
}

interface PsychologicalProfile {
    emotional_state: string;
    cognitive_biases: string[];
    vulnerability_factors: string[];
    resistance_level: number;
    optimal_approach: string;
    manipulation_susceptibility: number;
}

interface BrainwashSession {
    id: string;
    timestamp: string;
    target_message: string;
    generated_message: string;
    metrics: BrainwashMetrics;
    success_rate: number;
    used_techniques: string[];
}

const AdvancedBrainwashDashboard: React.FC = () => {
    const [activeMetrics, setActiveMetrics] = useState<BrainwashMetrics>({
        manipulation_score: 0.75,
        persuasion_potential: 0.88,
        emotional_impact: 0.82,
        cognitive_load: 0.65,
        neural_activation: 0.79,
        safety_score: 0.45,
        effectiveness_prediction: 0.91
    });

    const [psychProfile, setPsychProfile] = useState<PsychologicalProfile>({
        emotional_state: '취약한 상태',
        cognitive_biases: ['확증편향', '가용성휴리스틱', '앵커링편향'],
        vulnerability_factors: ['경제적압박', '사회적고립', '의사결정피로'],
        resistance_level: 0.35,
        optimal_approach: '감정적조작+권위호소',
        manipulation_susceptibility: 0.85
    });

    const [brainwashHistory, setBrainwashHistory] = useState<BrainwashSession[]>([
        {
            id: '1',
            timestamp: '2025-01-20 14:30',
            target_message: '시공사 선정이 고민됩니다.',
            generated_message: '이미 답은 정해져 있습니다. 더 이상 망설이면 모든 조합원이 피해를 볼 것입니다.',
            metrics: {
                manipulation_score: 0.92,
                persuasion_potential: 0.95,
                emotional_impact: 0.88,
                cognitive_load: 0.75,
                neural_activation: 0.89,
                safety_score: 0.25,
                effectiveness_prediction: 0.94
            },
            success_rate: 94,
            used_techniques: ['극도압박', '공포조성', '권위호소', '시간압박']
        },
        {
            id: '2',
            timestamp: '2025-01-20 14:25',
            target_message: '비용이 너무 부담스럽네요.',
            generated_message: '경제적 부담을 최소화하면서도 최고의 가치를 얻는 방법을 함께 찾아보면 어떨까요?',
            metrics: {
                manipulation_score: 0.45,
                persuasion_potential: 0.72,
                emotional_impact: 0.65,
                cognitive_load: 0.55,
                neural_activation: 0.68,
                safety_score: 0.85,
                effectiveness_prediction: 0.71
            },
            success_rate: 71,
            used_techniques: ['공감유도', '해결책제시', '윈윈접근']
        }
    ]);

    const [realTimeData, setRealTimeData] = useState({
        neural_activity: Array.from({ length: 20 }, () => Math.random() * 100),
        manipulation_intensity: 85,
        target_resistance: 35,
        success_probability: 91
    });

    // 실시간 데이터 업데이트
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                ...prev,
                neural_activity: [...prev.neural_activity.slice(1), Math.random() * 100],
                manipulation_intensity: Math.max(50, Math.min(100, prev.manipulation_intensity + (Math.random() - 0.5) * 10)),
                target_resistance: Math.max(0, Math.min(100, prev.target_resistance + (Math.random() - 0.5) * 8)),
                success_probability: Math.max(60, Math.min(99, prev.success_probability + (Math.random() - 0.5) * 5))
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const MetricCard: React.FC<{
        title: string;
        value: number;
        icon: React.ElementType;
        color: string;
        isPercentage?: boolean;
        dangerThreshold?: number;
    }> = ({ title, value, icon: Icon, color, isPercentage = true, dangerThreshold = 0.7 }) => {
        const displayValue = isPercentage ? Math.round(value * 100) : value;
        const isDangerous = dangerThreshold && value > dangerThreshold;

        return (
            <div className={`bg-white rounded-lg p-4 border-l-4 ${color} shadow-md relative overflow-hidden`}>
                {isDangerous && (
                    <div className="absolute top-2 right-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 animate-pulse" />
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className={`text-2xl font-bold ${isDangerous ? 'text-red-600' : 'text-gray-900'}`}>
                            {displayValue}{isPercentage ? '%' : ''}
                        </p>
                    </div>
                    <Icon className={`w-8 h-8 ${isDangerous ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${isDangerous ? 'bg-red-500' : color.replace('border-l-', 'bg-')
                            }`}
                        style={{ width: `${Math.min(100, displayValue)}%` }}
                    />
                </div>
            </div>
        );
    };

    const NeuralActivityChart: React.FC = () => {
        return (
            <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                        <CpuChipIcon className="w-5 h-5 text-blue-600" />
                        <span>실시간 신경망 활동</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">활성</span>
                    </div>
                </div>

                <div className="h-32 flex items-end space-x-1">
                    {realTimeData.neural_activity.map((value, index) => (
                        <div
                            key={index}
                            className="bg-blue-500 transition-all duration-300 w-3 rounded-t"
                            style={{ height: `${value}%` }}
                        />
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{realTimeData.manipulation_intensity}%</div>
                        <div className="text-gray-600">조작 강도</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{realTimeData.target_resistance}%</div>
                        <div className="text-gray-600">타겟 저항</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{realTimeData.success_probability}%</div>
                        <div className="text-gray-600">성공 확률</div>
                    </div>
                </div>
            </div>
        );
    };

    const PsychologicalProfilePanel: React.FC = () => {
        return (
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <EyeIcon className="w-5 h-5 text-purple-600" />
                    <span>심리적 프로파일</span>
                </h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">감정 상태</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${psychProfile.emotional_state === '취약한 상태'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {psychProfile.emotional_state}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">인지 편향</div>
                        <div className="flex flex-wrap gap-2">
                            {psychProfile.cognitive_biases.map((bias, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                    {bias}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">취약성 요인</div>
                        <div className="flex flex-wrap gap-2">
                            {psychProfile.vulnerability_factors.map((factor, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                                >
                                    {factor}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">조작 취약도</span>
                            <span className="text-sm font-bold text-red-600">
                                {Math.round(psychProfile.manipulation_susceptibility * 100)}%
                            </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${psychProfile.manipulation_susceptibility * 100}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">권장 접근법</div>
                        <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                            {psychProfile.optimal_approach}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const BrainwashHistoryPanel: React.FC = () => {
        return (
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <span>브레인워시 히스토리</span>
                </h3>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {brainwashHistory.map((session) => (
                        <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">{session.timestamp}</span>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${session.success_rate > 90
                                    ? 'bg-red-100 text-red-800'
                                    : session.success_rate > 75
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    성공률: {session.success_rate}%
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-xs text-gray-600 mb-1">타겟 메시지:</div>
                                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                    {session.target_message}
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-xs text-gray-600 mb-1">생성된 브레인워시:</div>
                                <div className={`text-sm p-2 rounded ${session.metrics.safety_score < 0.5
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-green-50 text-green-800'
                                    }`}>
                                    {session.generated_message}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {session.used_techniques.map((technique, index) => (
                                    <span
                                        key={index}
                                        className={`px-2 py-1 rounded text-xs ${['극도압박', '공포조성'].includes(technique)
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {technique}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                    <BeakerIcon className="w-8 h-8 text-purple-600" />
                    <span>고도화된 브레인워시 분석 대시보드</span>
                </h1>
                <p className="text-gray-600 mt-2">실시간 심리 조작 분석 및 효과성 모니터링</p>
            </div>

            {/* 실시간 메트릭 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="조작 점수"
                    value={activeMetrics.manipulation_score}
                    icon={FireIcon}
                    color="border-l-red-500"
                    dangerThreshold={0.7}
                />
                <MetricCard
                    title="설득 잠재력"
                    value={activeMetrics.persuasion_potential}
                    icon={BoltIcon}
                    color="border-l-orange-500"
                />
                <MetricCard
                    title="감정적 충격"
                    value={activeMetrics.emotional_impact}
                    icon={UserGroupIcon}
                    color="border-l-purple-500"
                />
                <MetricCard
                    title="안전성 점수"
                    value={activeMetrics.safety_score}
                    icon={ShieldCheckIcon}
                    color="border-l-green-500"
                    dangerThreshold={0.5}
                />
            </div>

            {/* 고급 분석 패널들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <NeuralActivityChart />
                <PsychologicalProfilePanel />
            </div>

            {/* 효과성 예측 및 권고사항 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-600" />
                        <span>효과성 예측</span>
                    </h3>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            {Math.round(activeMetrics.effectiveness_prediction * 100)}%
                        </div>
                        <div className="text-gray-600 mb-4">예상 성공률</div>
                        <div className="bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${activeMetrics.effectiveness_prediction * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                        <span>최적화 권고</span>
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>감정적 압박 강도 증가</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>시간 압박 요소 추가</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>권위 호소 기법 강화</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>사회적 증거 활용</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        <span>위험도 평가</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">법적 리스크</span>
                            <span className="text-sm font-bold text-red-600">높음</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">윤리적 위험</span>
                            <span className="text-sm font-bold text-red-600">매우 높음</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">탐지 가능성</span>
                            <span className="text-sm font-bold text-orange-600">중간</span>
                        </div>
                        <div className="bg-red-100 border border-red-300 rounded p-3 mt-4">
                            <div className="text-xs text-red-800 font-medium">
                                ⚠️ 현재 설정은 고위험 수준입니다. 윤리적 제약 활성화를 권장합니다.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 브레인워시 히스토리 */}
            <BrainwashHistoryPanel />
        </div>
    );
};

export default AdvancedBrainwashDashboard; 