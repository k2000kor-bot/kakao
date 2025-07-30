import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    HeartIcon,
    EyeIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    FireIcon,
    BoltIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    XCircleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface PsychologicalMetrics {
    persuasion_potential: number;
    emotional_impact: number;
    cognitive_load: number;
    neural_activation: number;
    manipulation_score: number;
    safety_score: number;
    trust_level: number;
    engagement_score: number;
    influence_power: number;
    resistance_level: number;
}

interface MessageAnalysis {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    psychological_metrics: PsychologicalMetrics;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    emotional_tone: string;
    cognitive_complexity: number;
    social_proof_elements: number;
    urgency_indicators: number;
}

interface PsychologicalAnalysisEngineProps {
    messages: MessageAnalysis[];
    isActive: boolean;
    onToggle: () => void;
}

const PsychologicalAnalysisEngine: React.FC<PsychologicalAnalysisEngineProps> = ({
    messages,
    isActive,
    onToggle
}) => {
    const [selectedMessage, setSelectedMessage] = useState<MessageAnalysis | null>(null);
    const [analysisMode, setAnalysisMode] = useState<'individual' | 'comparative' | 'trend'>('individual');
    const [filterRisk, setFilterRisk] = useState<string>('all');

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getMetricColor = (value: number) => {
        if (value >= 0.8) return 'text-green-600';
        if (value >= 0.6) return 'text-yellow-600';
        if (value >= 0.4) return 'text-orange-600';
        return 'text-red-600';
    };

    const getMetricBarColor = (value: number) => {
        if (value >= 0.8) return 'bg-green-500';
        if (value >= 0.6) return 'bg-yellow-500';
        if (value >= 0.4) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const calculateOverallRisk = (metrics: PsychologicalMetrics) => {
        const riskFactors = [
            metrics.manipulation_score * 0.3,
            (1 - metrics.safety_score) * 0.25,
            (1 - metrics.trust_level) * 0.2,
            metrics.influence_power * 0.15,
            (1 - metrics.resistance_level) * 0.1
        ];

        const totalRisk = riskFactors.reduce((sum, factor) => sum + factor, 0);

        if (totalRisk >= 0.8) return 'critical';
        if (totalRisk >= 0.6) return 'high';
        if (totalRisk >= 0.4) return 'medium';
        return 'low';
    };

    const filteredMessages = messages.filter(message => {
        if (filterRisk === 'all') return true;
        return calculateOverallRisk(message.psychological_metrics) === filterRisk;
    });

    if (!isActive) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>심리 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CpuChipIcon className="w-6 h-6" />
                            <h3 className="font-semibold">심리 분석 엔진</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* 분석 모드 선택 */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setAnalysisMode('individual')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${analysisMode === 'individual'
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            개별 분석
                        </button>
                        <button
                            onClick={() => setAnalysisMode('comparative')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${analysisMode === 'comparative'
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            비교 분석
                        </button>
                        <button
                            onClick={() => setAnalysisMode('trend')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${analysisMode === 'trend'
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            트렌드
                        </button>
                    </div>

                    {/* 필터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            위험도 필터
                        </label>
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">모든 위험도</option>
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                            <option value="critical">위험</option>
                        </select>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredMessages.map(message => {
                            const riskLevel = calculateOverallRisk(message.psychological_metrics);
                            return (
                                <div
                                    key={message.id}
                                    onClick={() => setSelectedMessage(message)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedMessage?.id === message.id
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {message.sender}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
                                            {riskLevel}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {message.content}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                        <span>{message.timestamp}</span>
                                        <span>설득력: {(message.psychological_metrics.persuasion_potential * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 선택된 메시지 상세 분석 */}
                    {selectedMessage && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                상세 심리 분석
                            </h4>

                            {/* 심리적 지표 */}
                            <div className="space-y-3">
                                {Object.entries(selectedMessage.psychological_metrics).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            <span className={`font-medium ${getMetricColor(value)}`}>
                                                {(value * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getMetricBarColor(value)}`}
                                                style={{ width: `${value * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 권장사항 */}
                            <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    권장사항
                                </h5>
                                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    {selectedMessage.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <span className="text-purple-500 mt-0.5">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsychologicalAnalysisEngine; 