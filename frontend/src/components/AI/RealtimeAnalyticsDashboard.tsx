import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Chart } from 'chart.js';
import { selectRealtimeAnalysis, selectAdvancedAnalytics } from '../../store/slices/aiEngineSlice';
import {
    TrendingUp,
    Activity,
    Brain,
    MessageSquare,
    Target,
    Zap,
    Gauge,
    BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentColor, getQualityScoreColor, CHART_COLORS_HEX } from '../../styles/themeColors';

interface AnalyticsData {
    timestamp: number;
    confidence: number;
    processingTime: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    intent: string;
}

const RealtimeAnalyticsDashboard: React.FC = () => {
    const realtimeAnalysis = useSelector(selectRealtimeAnalysis);
    const advancedAnalytics = useSelector(selectAdvancedAnalytics);

    const [analyticsHistory, setAnalyticsHistory] = useState<AnalyticsData[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    // 차트 초기화
    useEffect(() => {
        if (chartRef.current && !chartInstance.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                // Chart.js를 동적으로 import
                import('chart.js/auto').then(({ Chart, registerables }) => {
                    Chart.register(...registerables);

                    chartInstance.current = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: '신뢰도',
                                    data: [],
                                    borderColor: CHART_COLORS_HEX[0],
                                    backgroundColor: `${CHART_COLORS_HEX[0]}1A`,
                                    tension: 0.4,
                                },
                                {
                                    label: '처리 시간 (ms)',
                                    data: [],
                                    borderColor: CHART_COLORS_HEX[2],
                                    backgroundColor: `${CHART_COLORS_HEX[2]}1A`,
                                    tension: 0.4,
                                    yAxisID: 'y1',
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: 'index' as const,
                                intersect: false,
                            },
                            scales: {
                                x: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: '시간'
                                    }
                                },
                                y: {
                                    type: 'linear' as const,
                                    display: true,
                                    position: 'left' as const,
                                    title: {
                                        display: true,
                                        text: '신뢰도 (%)'
                                    },
                                    min: 0,
                                    max: 100,
                                },
                                y1: {
                                    type: 'linear' as const,
                                    display: true,
                                    position: 'right' as const,
                                    title: {
                                        display: true,
                                        text: '처리 시간 (ms)'
                                    },
                                    min: 0,
                                    max: 1000,
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'top' as const,
                                },
                                title: {
                                    display: true,
                                    text: '실시간 분석 성능'
                                }
                            }
                        }
                    });
                });
            }
        }
    }, []);

    // 실시간 데이터 업데이트
    useEffect(() => {
        if (realtimeAnalysis.currentAnalysis && chartInstance.current) {
            const newData: AnalyticsData = {
                timestamp: Date.now(),
                confidence: realtimeAnalysis.confidence,
                processingTime: realtimeAnalysis.processingTime,
                sentiment: advancedAnalytics.sentimentAnalysis.currentSentiment,
                intent: advancedAnalytics.intentRecognition.detectedIntent,
            };

            setAnalyticsHistory(prev => {
                const updated = [...prev, newData].slice(-50); // 최근 50개 데이터만 유지

                // 차트 업데이트
                if (chartInstance.current) {
                    chartInstance.current.data.labels = updated.map(d =>
                        new Date(d.timestamp).toLocaleTimeString()
                    );
                    chartInstance.current.data.datasets[0].data = updated.map(d => d.confidence);
                    chartInstance.current.data.datasets[1].data = updated.map(d => d.processingTime);
                    chartInstance.current.update('none');
                }

                return updated;
            });
        }
    }, [realtimeAnalysis, advancedAnalytics]);

    const getConfidenceColor = (confidence: number) => getQualityScoreColor(confidence);
    const getProcessingTimeColor = (time: number) =>
        time <= 100 ? 'var(--accent-success)' : time <= 300 ? 'var(--accent-warning)' : 'var(--accent-error)';

    return (
        <div className="rounded-lg shadow-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color, var(--bg-tertiary))' }}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color, var(--bg-tertiary))' }}>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-info)' }}>
                        <BarChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>실시간 분석 대시보드</h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 엔진 성능 및 분석 결과 모니터링</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bw-btn-ghost p-2 rounded-lg transition-colors"
                    type="button"
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TrendingUp className="w-5 h-5 bw-text-muted" />
                    </motion.div>
                </button>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="p-6">
                {/* 실시간 상태 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg p-4 text-white"
                        style={{ background: 'var(--accent-info)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">신뢰도</p>
                                <p className="text-2xl font-bold" style={{ color: getConfidenceColor(realtimeAnalysis.confidence) }}>
                                    {realtimeAnalysis.confidence}%
                                </p>
                            </div>
                            <Gauge className="w-8 h-8 opacity-80" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg p-4 text-white"
                        style={{ background: 'var(--accent-success)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">처리 시간</p>
                                <p className="text-2xl font-bold" style={{ color: getProcessingTimeColor(realtimeAnalysis.processingTime) }}>
                                    {realtimeAnalysis.processingTime}ms
                                </p>
                            </div>
                            <Activity className="w-8 h-8 opacity-80" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-lg p-4 text-white"
                        style={{ background: 'var(--accent-secondary)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">감정 분석</p>
                                <p className="text-lg font-bold" style={{ color: getSentimentColor(advancedAnalytics.sentimentAnalysis.currentSentiment) }}>
                                    {advancedAnalytics.sentimentAnalysis.currentSentiment === 'positive' ? '긍정적' :
                                        advancedAnalytics.sentimentAnalysis.currentSentiment === 'negative' ? '부정적' : '중립적'}
                                </p>
                            </div>
                            <MessageSquare className="w-8 h-8 opacity-80" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg p-4 text-white"
                        style={{ background: 'var(--accent-orange)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">의도 감지</p>
                                <p className="text-lg font-bold truncate">
                                    {advancedAnalytics.intentRecognition.detectedIntent || '감지 중...'}
                                </p>
                            </div>
                            <Target className="w-8 h-8 opacity-80" />
                        </div>
                    </motion.div>
                </div>

                {/* 확장 가능한 차트 섹션 */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="bw-card-secondary rounded-lg p-4">
                                <h3 className="bw-heading-2 mb-4">실시간 성능 차트</h3>
                                <div className="h-64">
                                    <canvas ref={chartRef} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 분석 상태 표시 */}
                <div className="mt-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-3 h-3 rounded-full ${realtimeAnalysis.isActive ? 'animate-pulse' : ''}`}
                                style={{ backgroundColor: realtimeAnalysis.isActive ? 'var(--accent-success)' : 'var(--text-tertiary)' }}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {realtimeAnalysis.isActive ? '실시간 분석 활성' : '실시간 분석 비활성'}
                            </span>
                        </div>

                        {realtimeAnalysis.isActive && (
                            <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 animate-pulse" style={{ color: 'var(--accent-warning)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    마지막 업데이트: {new Date().toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 상세 분석 결과 */}
                {realtimeAnalysis.currentAnalysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 rounded-lg p-4"
                        style={{ backgroundColor: 'var(--accent-info-muted)', border: '1px solid var(--accent-info-border)' }}
                    >
                        <h4 className="font-medium mb-2" style={{ color: 'var(--accent-info)' }}>현재 분석 결과</h4>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{realtimeAnalysis.currentAnalysis}</p>
                    </motion.div>
                )}

                {/* 분석 히스토리 */}
                {analyticsHistory.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>최근 분석 기록</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {analyticsHistory.slice(-5).reverse().map((data, index) => (
                                <motion.div
                                    key={data.timestamp}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg"
                                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Brain className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {new Date(data.timestamp).toLocaleTimeString()}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                신뢰도: {data.confidence}% | 처리시간: {data.processingTime}ms
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="text-xs px-2 py-1 rounded-full"
                                            style={{ color: getSentimentColor(data.sentiment), backgroundColor: 'var(--bg-hover)' }}
                                        >
                                            {data.sentiment === 'positive' ? '긍정' :
                                                data.sentiment === 'negative' ? '부정' : '중립'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealtimeAnalyticsDashboard;
