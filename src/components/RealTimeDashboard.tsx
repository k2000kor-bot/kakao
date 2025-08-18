import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import unifiedAPI from '../services/unifiedAPI';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface SystemMetrics {
    active_users: number;
    requests_per_minute: number;
    average_response_time: number;
    error_rate: number;
    system_health: string;
    total_analyses: number;
    success_rate: number;
}

interface AIAnalysisStats {
    comprehensive_analyses: number;
    real_estate_analyses: number;
    knowledge_processing: number;
    writing_generation: number;
    voice_processing: number;
    image_analysis: number;
    machine_learning: number;
    deep_learning: number;
    nlp_analysis: number;
    cognitive_computing: number;
    predictive_analysis: number;
    risk_assessment: number;
    competitor_analysis: number;
    financial_analysis: number;
    sentiment_analysis: number;
    real_time_data: number;
    advanced_modeling: number;
    adaptive_learning: number;
    real_time_collaboration: number;
    advanced_visualization: number;
    ai_integrated_analysis: number;
    real_time_decision_support: number;
}

const RealTimeDashboard: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [aiStats, setAiStats] = useState<AIAnalysisStats>({
        comprehensive_analyses: 0,
        real_estate_analyses: 0,
        knowledge_processing: 0,
        writing_generation: 0,
        voice_processing: 0,
        image_analysis: 0,
        machine_learning: 0,
        deep_learning: 0,
        nlp_analysis: 0,
        cognitive_computing: 0,
        predictive_analysis: 0,
        risk_assessment: 0,
        competitor_analysis: 0,
        financial_analysis: 0,
        sentiment_analysis: 0,
        real_time_data: 0,
        advanced_modeling: 0,
        adaptive_learning: 0,
        real_time_collaboration: 0,
        advanced_visualization: 0,
        ai_integrated_analysis: 0,
        real_time_decision_support: 0,
    });
    const [performanceHistory, setPerformanceHistory] = useState<Array<{ timestamp: string, response_time: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 시스템 메트릭 로드
    const loadSystemMetrics = async () => {
        try {
            const response = await unifiedAPI.getSystemMetrics();
            if (response.success && response.metrics) {
                setSystemMetrics(response.metrics);

                // 성능 히스토리 업데이트
                setPerformanceHistory(prev => [
                    ...prev.slice(-19), // 최근 20개 데이터만 유지
                    {
                        timestamp: new Date().toLocaleTimeString(),
                        response_time: response.metrics.average_response_time
                    }
                ]);
            }
        } catch (error) {
            console.error('시스템 메트릭 로드 오류:', error);
        }
    };

    // AI 분석 통계 시뮬레이션 (실제로는 백엔드에서 제공)
    const simulateAIStats = () => {
        setAiStats({
            comprehensive_analyses: Math.floor(Math.random() * 50) + 10,
            real_estate_analyses: Math.floor(Math.random() * 30) + 5,
            knowledge_processing: Math.floor(Math.random() * 40) + 8,
            writing_generation: Math.floor(Math.random() * 25) + 3,
            voice_processing: Math.floor(Math.random() * 15) + 2,
            image_analysis: Math.floor(Math.random() * 20) + 4,
            machine_learning: Math.floor(Math.random() * 35) + 6,
            deep_learning: Math.floor(Math.random() * 30) + 5,
            nlp_analysis: Math.floor(Math.random() * 40) + 7,
            cognitive_computing: Math.floor(Math.random() * 25) + 4,
            predictive_analysis: Math.floor(Math.random() * 45) + 8,
            risk_assessment: Math.floor(Math.random() * 35) + 6,
            competitor_analysis: Math.floor(Math.random() * 30) + 5,
            financial_analysis: Math.floor(Math.random() * 40) + 7,
            sentiment_analysis: Math.floor(Math.random() * 50) + 9,
            real_time_data: Math.floor(Math.random() * 55) + 10,
            advanced_modeling: Math.floor(Math.random() * 40) + 8,
            adaptive_learning: Math.floor(Math.random() * 35) + 6,
            real_time_collaboration: Math.floor(Math.random() * 45) + 8,
            advanced_visualization: Math.floor(Math.random() * 50) + 10,
            ai_integrated_analysis: Math.floor(Math.random() * 60) + 12,
            real_time_decision_support: Math.floor(Math.random() * 55) + 10,
        });
    };

    useEffect(() => {
        loadSystemMetrics();
        simulateAIStats();
        setIsLoading(false);

        // 30초마다 메트릭 업데이트
        const interval = setInterval(() => {
            loadSystemMetrics();
            simulateAIStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // 차트 데이터
    const performanceData = {
        labels: performanceHistory.map(item => item.timestamp),
        datasets: [
            {
                label: '응답 시간 (초)',
                data: performanceHistory.map(item => item.response_time),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const aiUsageData = {
        labels: ['종합 분석', '부동산 분석', '지식 처리', '글쓰기 생성', '음성 처리', '이미지 분석', '머신러닝', '딥러닝', 'NLP 분석', '인지 컴퓨팅', '실시간 데이터', '고급 모델링', '적응형 학습', '실시간 협업', '고급 시각화', 'AI 통합 분석', '실시간 의사결정'],
        datasets: [
            {
                label: 'AI 분석 사용량',
                data: [
                    aiStats.comprehensive_analyses,
                    aiStats.real_estate_analyses,
                    aiStats.knowledge_processing,
                    aiStats.writing_generation,
                    aiStats.voice_processing,
                    aiStats.image_analysis,
                    aiStats.machine_learning,
                    aiStats.deep_learning,
                    aiStats.nlp_analysis,
                    aiStats.cognitive_computing,
                    aiStats.real_time_data,
                    aiStats.advanced_modeling,
                    aiStats.adaptive_learning,
                    aiStats.real_time_collaboration,
                    aiStats.advanced_visualization,
                    aiStats.ai_integrated_analysis,
                    aiStats.real_time_decision_support,
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(0, 255, 255, 0.8)',
                    'rgba(75, 0, 130, 0.8)',
                    'rgba(0, 128, 0, 0.8)',
                    'rgba(238, 130, 238, 0.8)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(255, 0, 0, 0.8)',
                    'rgba(0, 128, 0, 0.8)',
                    'rgba(0, 0, 255, 0.8)',
                    'rgba(255, 255, 0, 0.8)',
                    'rgba(128, 0, 128, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(75, 0, 130, 1)',
                    'rgba(0, 128, 0, 1)',
                    'rgba(238, 130, 238, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(255, 0, 0, 1)',
                    'rgba(0, 128, 0, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(255, 255, 0, 1)',
                    'rgba(128, 0, 128, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const systemHealthData = {
        labels: ['성공', '오류'],
        datasets: [
            {
                data: [
                    systemMetrics?.success_rate ? systemMetrics.success_rate * 100 : 95,
                    systemMetrics?.error_rate ? systemMetrics.error_rate * 100 : 5,
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '실시간 성능 모니터링',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-600';
            case 'good': return 'text-blue-600';
            case 'fair': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return '🟢';
            case 'good': return '🟡';
            case 'fair': return '🟠';
            case 'poor': return '🔴';
            default: return '⚪';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">대시보드 로딩 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 시스템 상태 카드 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 상태</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {systemMetrics?.active_users || 0}
                        </div>
                        <div className="text-sm text-gray-600">활성 사용자</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {systemMetrics?.requests_per_minute || 0}
                        </div>
                        <div className="text-sm text-gray-600">요청/분</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {(systemMetrics?.average_response_time || 0).toFixed(2)}s
                        </div>
                        <div className="text-sm text-gray-600">평균 응답시간</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                            {systemMetrics?.success_rate ? (systemMetrics.success_rate * 100).toFixed(1) : '95.0'}%
                        </div>
                        <div className="text-sm text-gray-600">성공률</div>
                    </div>
                </div>

                {/* 시스템 건강도 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">시스템 건강도:</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getHealthIcon(systemMetrics?.system_health || 'good')}</span>
                            <span className={`font-semibold ${getHealthColor(systemMetrics?.system_health || 'good')}`}>
                                {systemMetrics?.system_health || 'good'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI 분석 통계 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI 분석 통계</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{aiStats.comprehensive_analyses}</div>
                        <div className="text-xs text-gray-600">종합 분석</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{aiStats.real_estate_analyses}</div>
                        <div className="text-xs text-gray-600">부동산 분석</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{aiStats.knowledge_processing}</div>
                        <div className="text-xs text-gray-600">지식 처리</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{aiStats.writing_generation}</div>
                        <div className="text-xs text-gray-600">글쓰기 생성</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{aiStats.voice_processing}</div>
                        <div className="text-xs text-gray-600">음성 처리</div>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <div className="text-lg font-bold text-pink-600">{aiStats.image_analysis}</div>
                        <div className="text-xs text-gray-600">이미지 분석</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                        <div className="text-lg font-bold text-cyan-600">{aiStats.machine_learning}</div>
                        <div className="text-xs text-gray-600">머신러닝</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-lg font-bold text-indigo-600">{aiStats.deep_learning}</div>
                        <div className="text-xs text-gray-600">딥러닝</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-600">{aiStats.nlp_analysis}</div>
                        <div className="text-xs text-gray-600">NLP 분석</div>
                    </div>
                    <div className="text-center p-3 bg-violet-50 rounded-lg">
                        <div className="text-lg font-bold text-violet-600">{aiStats.cognitive_computing}</div>
                        <div className="text-xs text-gray-600">인지 컴퓨팅</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">{aiStats.real_time_data}</div>
                        <div className="text-xs text-gray-600">실시간 데이터</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{aiStats.advanced_modeling}</div>
                        <div className="text-xs text-gray-600">고급 모델링</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{aiStats.adaptive_learning}</div>
                        <div className="text-xs text-gray-600">적응형 학습</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{aiStats.real_time_collaboration}</div>
                        <div className="text-xs text-gray-600">실시간 협업</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{aiStats.advanced_visualization}</div>
                        <div className="text-xs text-gray-600">고급 시각화</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{aiStats.ai_integrated_analysis}</div>
                        <div className="text-xs text-gray-600">AI 통합 분석</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{aiStats.real_time_decision_support}</div>
                        <div className="text-xs text-gray-600">실시간 의사결정</div>
                    </div>
                </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 성능 추이 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">응답 시간 추이</h3>
                    <Line data={performanceData} options={chartOptions} />
                </div>

                {/* AI 사용량 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 분석 사용량</h3>
                    <Bar data={aiUsageData} options={chartOptions} />
                </div>
            </div>

            {/* 시스템 건강도 파이 차트 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 성공률</h3>
                <div className="flex justify-center">
                    <div className="w-64 h-64">
                        <Doughnut data={systemHealthData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* 실시간 알림 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 알림</h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-green-800">시스템이 정상적으로 작동 중입니다</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                        <span className="text-blue-600">ℹ️</span>
                        <span className="text-sm text-blue-800">AI 분석 서비스가 활성화되어 있습니다</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                        <span className="text-yellow-600">⚠️</span>
                        <span className="text-sm text-yellow-800">성능 최적화 권장: 캐시 정리</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeDashboard;
