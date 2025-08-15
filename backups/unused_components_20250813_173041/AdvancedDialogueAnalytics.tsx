import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    UserGroupIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

import dialogueAPI, { utils } from '../services/dialogueAPI';

// 타입 정의
interface AnalyticsData {
    summary: {
        total_messages: number;
        avg_effectiveness: number;
        active_users: number;
        response_time: number;
        active_types: number;
        top_performing_type: string;
    };
    stats: Array<{
        type: string;
        name: string;
        count: number;
        avg_effectiveness: number;
        category: string;
        trend: 'up' | 'down' | 'stable';
    }>;
    effectiveness_data: Array<{
        date: string;
        time: string;
        score: number;
        effectiveness: number;
    }>;
}

const AdvancedDialogueAnalytics: React.FC = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // 컴포넌트 마운트 시 초기화
    useEffect(() => {
        loadAnalyticsData();
        setupWebSocketListeners();

        // 주기적 업데이트 (30초마다)
        const interval = setInterval(loadAnalyticsData, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [selectedTimeRange]);

    const setupWebSocketListeners = () => {
        // dialogueWebSocket.on('connected', (connected: boolean) => { // dialogueWebSocket is not defined
        //     setIsConnected(connected);
        // });

        // dialogueWebSocket.on('periodic_stats_update', (data: any) => { // dialogueWebSocket is not defined
        //     if (data && data.success) {
        //         setAnalyticsData(data);
        //         setLastUpdated(new Date());
        //     }
        // });

        // dialogueWebSocket.on('new_generation', () => { // dialogueWebSocket is not defined
        //     // 새로운 생성이 있을 때 데이터 새로고침
        //     setTimeout(loadAnalyticsData, 1000);
        // });
    };

    // 데이터 로드 함수
    const loadAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // 목업 데이터로 대체 (백엔드 연결 전까지)
            const mockData: AnalyticsData = {
                summary: {
                    total_messages: 1245,
                    avg_effectiveness: 0.87,
                    active_users: 45,
                    response_time: 2.3,
                    active_types: 12,
                    top_performing_type: '친절한 안내'
                },
                stats: [
                    { type: '공감', name: '공감', count: 245, avg_effectiveness: 0.92, category: 'emotional', trend: 'up' },
                    { type: '제안', name: '제안', count: 198, avg_effectiveness: 0.89, category: 'solution', trend: 'stable' },
                    { type: '반박', name: '반박', count: 156, avg_effectiveness: 0.75, category: 'opposition', trend: 'down' },
                    { type: '중립', name: '중립', count: 134, avg_effectiveness: 0.88, category: 'objective', trend: 'up' }
                ],
                effectiveness_data: Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
                    const effectiveness = 0.7 + Math.random() * 0.3;
                    return {
                        date: date.toISOString(),
                        time: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                        score: effectiveness,
                        effectiveness: effectiveness
                    };
                })
            };
            setAnalyticsData(mockData);
        } catch (err) {
            console.error('통계 데이터 로드 실패:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 필터링된 통계 데이터
    const filteredStats = analyticsData?.stats.filter((stat: any) =>
        selectedCategory === 'all' || stat.category === selectedCategory
    ) || [];

    const categoryColors = {
        basic: 'bg-blue-500',
        moderate: 'bg-green-500',
        advanced: 'bg-yellow-500',
        research: 'bg-red-500'
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <span className="h-4 w-4 text-green-500">↑</span>;
            case 'down': return <span className="h-4 w-4 text-red-500">↓</span>;
            default: return <span className="h-4 w-4 bg-gray-400 rounded-full" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
                            <p className="text-lg text-gray-600">분석 데이터 로딩 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.298 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <span>데이터 로드 실패: {error}</span>
                        </div>
                        <button
                            onClick={loadAnalyticsData}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <ChartBarIcon className="h-12 w-12 text-purple-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">실시간 분석 대시보드</h1>
                        <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {isConnected ? '🟢 실시간 연결' : '🔴 연결 끊김'}
                        </div>
                    </div>
                    <p className="text-xl text-gray-600">21가지 대화 유형의 사용 패턴과 효과성을 실시간으로 분석합니다</p>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 mt-2">
                            마지막 업데이트: {utils.formatTime(lastUpdated.toISOString())}
                        </p>
                    )}
                </div>

                {/* 필터 및 설정 */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div>
                                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">시간 범위</label>
                                <select
                                    id="timeRange"
                                    value={selectedTimeRange}
                                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    aria-label="시간 범위 선택"
                                >
                                    <option value="1h">최근 1시간</option>
                                    <option value="24h">최근 24시간</option>
                                    <option value="7d">최근 7일</option>
                                    <option value="30d">최근 30일</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    aria-label="카테고리 선택"
                                >
                                    <option value="all">전체</option>
                                    <option value="basic">기본 유형</option>
                                    <option value="moderate">중급 유형</option>
                                    <option value="advanced">고급 유형</option>
                                    <option value="research">연구 유형</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadAnalyticsData}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <span>새로고침</span>
                            </button>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                <span>실시간 업데이트</span>
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 주요 지표 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">총 생성된 메시지</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {utils.formatNumber(analyticsData?.summary.total_messages || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="h-4 w-4 text-green-500 mr-1">↑</span>
                            <span className="text-green-600 font-medium">+12.5%</span>
                            <span className="text-gray-500 ml-1">vs 이전 기간</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">평균 효과성</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {utils.formatEffectiveness(analyticsData?.summary.avg_effectiveness || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="h-4 w-4 text-green-500 mr-1">↑</span>
                            <span className="text-green-600 font-medium">+3.2%</span>
                            <span className="text-gray-500 ml-1">vs 이전 기간</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">최고 성능 유형</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analyticsData?.summary.top_performing_type || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">효과성 분석 기준</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <UserGroupIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">활성 유형 수</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {analyticsData?.summary.active_types || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <ClockIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-gray-500">21가지 유형 중</span>
                        </div>
                    </div>
                </div>

                {/* 효과성 트렌드 차트 */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">효과성 트렌드</h3>

                    <div className="h-64 flex items-end justify-between space-x-1">
                        {(analyticsData?.effectiveness_data || []).map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t w-full transition-all duration-300 hover:from-purple-700 hover:to-purple-500"
                                    style={{ height: `${data.effectiveness * 200}px` }}
                                    title={`${data.time}: ${utils.formatEffectiveness(data.effectiveness)}`}
                                />
                                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                                    {index % 4 === 0 ? data.time : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                            <span>효과성 (%)</span>
                        </div>
                    </div>
                </div>

                {/* 대화 유형별 성능 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">대화 유형별 성능 분석</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        대화 유형
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        사용 횟수
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        평균 효과성
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        트렌드
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        카테고리
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStats
                                    .sort((a, b) => b.avg_effectiveness - a.avg_effectiveness)
                                    .map((stat, index) => (
                                        <tr key={stat.type} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{utils.formatNumber(stat.count)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${stat.avg_effectiveness * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {utils.formatEffectiveness(stat.avg_effectiveness)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getTrendIcon(stat.trend)}
                                                    <span className="ml-1 text-sm text-gray-600 capitalize">{stat.trend}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${categoryColors[stat.category as keyof typeof categoryColors]}`}>
                                                    {stat.category}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStats.length === 0 && (
                        <div className="text-center py-12">
                            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">선택된 카테고리에 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 추가 인사이트 */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 인사이트</h4>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        전체 시스템이 정상 작동 중입니다
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        모든 대화 유형이 활발히 사용되고 있음
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        평균 응답 시간: 0.8초
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        실시간 생성 성능 최적화됨
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        WebSocket 연결 상태: {isConnected ? '안정적' : '불안정'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        실시간 업데이트 {isConnected ? '활성화' : '비활성화'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 권장사항</h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800">✓ 균형 잡힌 유형 활용</p>
                                <p className="text-xs text-green-600">다양한 대화 유형을 고르게 사용 중</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-800">💡 효과성 지속 모니터링</p>
                                <p className="text-xs text-blue-600">실시간 성능 추적으로 품질 보장</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-800">🔄 자동 최적화 적용</p>
                                <p className="text-xs text-purple-600">AI 학습을 통한 지속적 개선</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDialogueAnalytics; 