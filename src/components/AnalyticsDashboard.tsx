import React, { useState, useEffect } from 'react';
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
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ChatSession } from '../types/chat';
import { Project } from '../types/project';
import analyticsService, { AnalyticsData, ChartData } from '../services/analyticsService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsDashboardProps {
    currentSession: ChatSession | null;
    currentProject: Project | null;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    currentSession,
    currentProject
}) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [chartData, setChartData] = useState<{ [key: string]: ChartData } | null>(null);
    const [insightReport, setInsightReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'insights'>('overview');

    useEffect(() => {
        if (currentSession) {
            loadAnalytics();
        }
    }, [currentSession]);

    const loadAnalytics = async () => {
        if (!currentSession) return;

        setIsLoading(true);
        try {
            const analyticsData = await analyticsService.generateAnalytics(currentSession, currentProject);
            const chartDataResult = await analyticsService.generateChartData(analyticsData);
            const report = await analyticsService.generateInsightReport(analyticsData);

            setAnalytics(analyticsData);
            setChartData(chartDataResult);
            setInsightReport(report);
        } catch (error) {
            console.error('분석 데이터 로드 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentSession) {
        return (
            <div className="analytics-dashboard-empty">
                <div className="empty-state">
                    <h2>분석 데이터가 없습니다</h2>
                    <p>대화를 시작하면 분석 데이터를 확인할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="analytics-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>분석 데이터를 생성하는 중...</p>
            </div>
        );
    }

    if (!analytics || !chartData) {
        return (
            <div className="analytics-dashboard-error">
                <p>분석 데이터를 불러올 수 없습니다.</p>
                <button onClick={loadAnalytics} className="retry-button">
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            <div className="dashboard-header">
                <h1>📊 대화 분석 대시보드</h1>
                <div className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        개요
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('charts')}
                    >
                        차트
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                        onClick={() => setActiveTab('insights')}
                    >
                        인사이트
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💬</div>
                                <div className="stat-content">
                                    <h3>총 메시지</h3>
                                    <p className="stat-value">{analytics.messageCount}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">⏱️</div>
                                <div className="stat-content">
                                    <h3>평균 응답 시간</h3>
                                    <p className="stat-value">{Math.round(analytics.averageResponseTime / 1000)}초</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <h3>AI 응답률</h3>
                                    <p className="stat-value">{Math.round(analytics.userEngagement.responseRate)}%</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-content">
                                    <h3>세션 지속 시간</h3>
                                    <p className="stat-value">{Math.round(analytics.userEngagement.sessionDuration / 1000 / 60)}분</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-charts">
                            <div className="chart-container">
                                <h3>응답 품질 분포</h3>
                                <div className="chart-wrapper">
                                    <Doughnut
                                        data={chartData.responseQuality}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="chart-container">
                                <h3>감정 분석</h3>
                                <div className="chart-wrapper">
                                    <Doughnut
                                        data={chartData.sentimentAnalysis}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'charts' && (
                    <div className="charts-tab">
                        <div className="chart-grid">
                            <div className="chart-container full-width">
                                <h3>일별 활동 추이</h3>
                                <div className="chart-wrapper">
                                    <Line
                                        data={chartData.dailyActivity}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        stepSize: 1,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="chart-container">
                                <h3>주제별 질문 분포</h3>
                                <div className="chart-wrapper">
                                    <Bar
                                        data={chartData.topicDistribution}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        stepSize: 1,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="chart-container">
                                <h3>AI 성능 지표</h3>
                                <div className="chart-wrapper">
                                    <Bar
                                        data={chartData.aiPerformance}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    max: 100,
                                                    ticks: {
                                                        callback: function (value) {
                                                            return value + '%';
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="insights-tab">
                        <div className="insight-report">
                            <div
                                className="markdown-content"
                                dangerouslySetInnerHTML={{
                                    __html: insightReport
                                        .replace(/# (.*?)\n/g, '<h1>$1</h1>')
                                        .replace(/## (.*?)\n/g, '<h2>$1</h2>')
                                        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br>')
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
