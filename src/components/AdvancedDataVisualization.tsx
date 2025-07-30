import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    ChartPieIcon,
    ChartBarSquareIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ChartData {
    label: string;
    value: number;
    color: string;
    percentage: number;
}

interface TimeSeriesData {
    time: string;
    messages: number;
    participants: number;
    sentiment: number;
    engagement: number;
}

const AdvancedDataVisualization: React.FC = () => {
    const [selectedChart, setSelectedChart] = useState('messages');
    const [timeRange, setTimeRange] = useState('7d');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

    useEffect(() => {
        // 시뮬레이션된 차트 데이터
        const generateChartData = () => {
            const data: ChartData[] = [
                { label: '긍정적', value: 45, color: 'bg-green-500', percentage: 45 },
                { label: '중립적', value: 35, color: 'bg-gray-500', percentage: 35 },
                { label: '부정적', value: 20, color: 'bg-red-500', percentage: 20 }
            ];
            setChartData(data);
        };

        const generateTimeSeriesData = () => {
            const data: TimeSeriesData[] = [];
            const now = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                data.push({
                    time: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                    messages: Math.floor(Math.random() * 100) + 50,
                    participants: Math.floor(Math.random() * 20) + 10,
                    sentiment: Math.random() * 0.6 + 0.4,
                    engagement: Math.random() * 0.5 + 0.5
                });
            }

            setTimeSeriesData(data);
        };

        generateChartData();
        generateTimeSeriesData();
    }, [timeRange]);

    const getMaxValue = (data: any[], key: string) => {
        return Math.max(...data.map(item => item[key]));
    };

    const maxMessages = getMaxValue(timeSeriesData, 'messages');
    const maxParticipants = getMaxValue(timeSeriesData, 'participants');

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">고급 데이터 시각화</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label="시간 범위 선택"
                    >
                        <option value="1d">최근 1일</option>
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                        <option value="90d">최근 90일</option>
                    </select>

                    <select
                        value={selectedChart}
                        onChange={(e) => setSelectedChart(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label="차트 유형 선택"
                    >
                        <option value="messages">메시지 분포</option>
                        <option value="sentiment">감정 분석</option>
                        <option value="engagement">참여도</option>
                        <option value="participants">참여자</option>
                    </select>
                </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">총 메시지</p>
                            <p className="text-3xl font-bold">{timeSeriesData.reduce((sum, data) => sum + data.messages, 0)}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">평균 참여자</p>
                            <p className="text-3xl font-bold">{Math.round(timeSeriesData.reduce((sum, data) => sum + data.participants, 0) / timeSeriesData.length)}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">평균 감정</p>
                            <p className="text-3xl font-bold">{Math.round(timeSeriesData.reduce((sum, data) => sum + data.sentiment, 0) / timeSeriesData.length * 100)}%</p>
                        </div>
                        <ChartPieIcon className="w-8 h-8 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">평균 참여도</p>
                            <p className="text-3xl font-bold">{Math.round(timeSeriesData.reduce((sum, data) => sum + data.engagement, 0) / timeSeriesData.length * 100)}%</p>
                        </div>
                        <ArrowTrendingUpIcon className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 파이 차트 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ChartPieIcon className="w-5 h-5 text-gray-600 mr-2" />
                        감정 분포 (파이 차트)
                    </h3>
                    <div className="space-y-4">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                                    <span className="font-medium text-gray-900">{item.label}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${item.color}`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{item.value}%</div>
                                    <div className="text-sm text-gray-500">{item.value}개</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 막대 차트 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ChartBarSquareIcon className="w-5 h-5 text-gray-600 mr-2" />
                        시간별 메시지 (막대 차트)
                    </h3>
                    <div className="space-y-3">
                        {timeSeriesData.map((data, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className="w-16 text-sm text-gray-600">{data.time}</div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                            style={{ width: `${(data.messages / maxMessages) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">{data.messages}</div>
                                    <div className="text-xs text-gray-500">메시지</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 시계열 차트 */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                    시계열 분석
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 메시지 트렌드 */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">메시지 트렌드</h4>
                        <div className="space-y-2">
                            {timeSeriesData.map((data, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-12 text-xs text-gray-600">{data.time}</div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(data.messages / maxMessages) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 w-12 text-right">{data.messages}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 참여자 트렌드 */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">참여자 트렌드</h4>
                        <div className="space-y-2">
                            {timeSeriesData.map((data, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="w-12 text-xs text-gray-600">{data.time}</div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${(data.participants / maxParticipants) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 w-12 text-right">{data.participants}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 상관관계 분석 */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                    상관관계 분석
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">메시지 수 vs 참여자 수</span>
                            <span className="text-sm font-medium">0.87</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">참여자 수 vs 감정 점수</span>
                            <span className="text-sm font-medium">0.72</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">감정 점수 vs 참여도</span>
                            <span className="text-sm font-medium">0.65</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">메시지 수 vs 참여도</span>
                            <span className="text-sm font-medium">0.58</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">분석 결과</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>• <strong>강한 상관관계:</strong> 메시지 수와 참여자 수는 매우 강한 양의 상관관계를 보입니다.</p>
                        <p>• <strong>중간 상관관계:</strong> 참여자 수와 감정 점수는 중간 정도의 양의 상관관계를 보입니다.</p>
                        <p>• <strong>개선 필요:</strong> 메시지 수와 참여도 간의 상관관계가 낮아 개선이 필요합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDataVisualization; 