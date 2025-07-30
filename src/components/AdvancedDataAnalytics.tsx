import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    FireIcon,
    BoltIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
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
    PlayIcon,
    PauseIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    timestamp: number;
    category: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }[];
}

interface AdvancedDataAnalyticsProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedDataAnalytics: React.FC<AdvancedDataAnalyticsProps> = ({
    isActive,
    onToggle
}) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([
        { timestamp: Date.now() - 86400000, category: '설득력', value: 75, target: 80, trend: 'up', confidence: 0.85 },
        { timestamp: Date.now() - 86400000, category: '감정적 영향', value: 68, target: 70, trend: 'up', confidence: 0.78 },
        { timestamp: Date.now() - 86400000, category: '인지 부하', value: 45, target: 50, trend: 'down', confidence: 0.92 },
        { timestamp: Date.now() - 86400000, category: '신경 활성화', value: 82, target: 85, trend: 'up', confidence: 0.88 },
        { timestamp: Date.now() - 86400000, category: '조작도', value: 35, target: 30, trend: 'up', confidence: 0.76 },
        { timestamp: Date.now() - 86400000, category: '안전도', value: 78, target: 80, trend: 'stable', confidence: 0.94 }
    ]);

    const [chartData, setChartData] = useState<ChartData>({
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [
            {
                label: '설득력',
                data: [65, 68, 72, 75, 78, 82],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            },
            {
                label: '감정적 영향',
                data: [60, 62, 65, 68, 70, 72],
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                borderColor: 'rgba(236, 72, 153, 1)',
                borderWidth: 2
            },
            {
                label: '신경 활성화',
                data: [70, 73, 76, 79, 82, 85],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }
        ]
    });

    const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7일');
    const [selectedMetric, setSelectedMetric] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison' | 'predictions'>('overview');

    useEffect(() => {
        // 실시간 데이터 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setAnalyticsData(prev => prev.map(item => ({
                ...item,
                value: Math.max(0, Math.min(100, item.value + (Math.random() - 0.5) * 5)),
                confidence: Math.max(0.5, Math.min(1, item.confidence + (Math.random() - 0.5) * 0.1))
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <ChevronUpIcon className="w-4 h-4 text-green-600" />;
            case 'down':
                return <ChevronDownIcon className="w-4 h-4 text-red-600" />;
            case 'stable':
                return <Bars3Icon className="w-4 h-4 text-gray-600" />;
            default:
                return <Bars3Icon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            case 'stable': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-600';
        if (confidence >= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (value: number, target: number) => {
        const ratio = value / target;
        if (ratio >= 1) return 'text-green-600';
        if (ratio >= 0.8) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>데이터 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-4/5 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">고도화된 데이터 분석 및 시각화 시스템</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        분석 개요
                    </button>
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'trends'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        트렌드 분석
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'comparison'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        비교 분석
                    </button>
                    <button
                        onClick={() => setActiveTab('predictions')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'predictions'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        예측 분석
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 필터 */}
                            <div className="flex space-x-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        시간 범위
                                    </label>
                                    <select
                                        value={selectedTimeframe}
                                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="1일">1일</option>
                                        <option value="7일">7일</option>
                                        <option value="30일">30일</option>
                                        <option value="90일">90일</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        메트릭 필터
                                    </label>
                                    <select
                                        value={selectedMetric}
                                        onChange={(e) => setSelectedMetric(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="all">모든 메트릭</option>
                                        <option value="persuasion">설득력</option>
                                        <option value="emotional">감정적 영향</option>
                                        <option value="cognitive">인지 부하</option>
                                        <option value="neural">신경 활성화</option>
                                        <option value="manipulation">조작도</option>
                                        <option value="safety">안전도</option>
                                    </select>
                                </div>
                            </div>

                            {/* 메트릭 카드 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {analyticsData.map(item => (
                                    <div key={item.category} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{item.category}</h4>
                                            <div className="flex items-center space-x-1">
                                                {getTrendIcon(item.trend)}
                                                <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                                                    {item.trend === 'up' ? '+5.2%' : item.trend === 'down' ? '-2.1%' : '0%'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">현재 값</span>
                                                <span className={`text-xl font-bold ${getProgressColor(item.value, item.target)}`}>
                                                    {item.value.toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(item.value, item.target) === 'text-green-600' ? 'bg-green-500' : getProgressColor(item.value, item.target) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">목표: {item.target}%</span>
                                                <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                                                    신뢰도: {(item.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 요약 통계 */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">성과 요약</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">평균 달성률</span>
                                            <span className="font-medium text-green-600">
                                                {(analyticsData.reduce((sum, item) => sum + (item.value / item.target), 0) / analyticsData.length * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">목표 초과 항목</span>
                                            <span className="font-medium text-blue-600">
                                                {analyticsData.filter(item => item.value >= item.target).length}개
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">평균 신뢰도</span>
                                            <span className="font-medium text-purple-600">
                                                {(analyticsData.reduce((sum, item) => sum + item.confidence, 0) / analyticsData.length * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">트렌드 분석</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">상승 트렌드</span>
                                            <span className="font-medium text-green-600">
                                                {analyticsData.filter(item => item.trend === 'up').length}개
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">하락 트렌드</span>
                                            <span className="font-medium text-red-600">
                                                {analyticsData.filter(item => item.trend === 'down').length}개
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">안정 트렌드</span>
                                            <span className="font-medium text-gray-600">
                                                {analyticsData.filter(item => item.trend === 'stable').length}개
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">성능 지표</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">최고 성과</span>
                                            <span className="font-medium text-green-600">
                                                {Math.max(...analyticsData.map(item => item.value)).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">최저 성과</span>
                                            <span className="font-medium text-red-600">
                                                {Math.min(...analyticsData.map(item => item.value)).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">평균 성과</span>
                                            <span className="font-medium text-blue-600">
                                                {(analyticsData.reduce((sum, item) => sum + item.value, 0) / analyticsData.length).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">트렌드 분석</h4>
                                <div className="h-64 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">트렌드 차트가 여기에 표시됩니다</p>
                                        <p className="text-sm text-gray-400">실시간 데이터 시각화</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">비교 분석</h4>
                                <div className="h-64 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">비교 차트가 여기에 표시됩니다</p>
                                        <p className="text-sm text-gray-400">메트릭 간 상관관계 분석</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'predictions' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">예측 분석</h4>
                                <div className="h-64 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">예측 모델 결과가 여기에 표시됩니다</p>
                                        <p className="text-sm text-gray-400">AI 기반 미래 예측</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedDataAnalytics; 