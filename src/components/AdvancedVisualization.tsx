import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, PieChart, Pie, Cell } from 'recharts';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface AdvancedVisualizationProps {
  analysisData: any;
  realTimeData?: any;
}

const AdvancedVisualization: React.FC<AdvancedVisualizationProps> = ({ analysisData, realTimeData }) => {
  const [activeChart, setActiveChart] = useState('sentiment');
  const [timeRange, setTimeRange] = useState('24h');

  // 감정 트렌드 차트 데이터
  const sentimentChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: '전체 감정',
        data: [0.3, 0.2, -0.1, -0.3, -0.5, -0.4, -0.2],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: '삼성물산 편향',
        data: [0.6, 0.65, 0.7, 0.72, 0.75, 0.78, 0.8],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: '대우건설 편향',
        data: [-0.5, -0.55, -0.6, -0.62, -0.65, -0.68, -0.7],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // 편향성 히트맵 데이터
  const biasHeatmapData = {
    labels: ['삼성물산', '대우건설', '포스코', '현대건설', '롯데건설'],
    datasets: [
      {
        label: '편향성 점수',
        data: [0.75, -0.65, 0.2, -0.3, 0.1],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.4)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 2
      }
    ]
  };

  // 참여자 네트워크 데이터
  const participantNetworkData = [
    { name: '0116', value: 25, influence: 0.8, bias: 0.7 },
    { name: '0024', value: 18, influence: 0.6, bias: 0.0 },
    { name: '0036', value: 22, influence: 0.7, bias: -0.3 },
    { name: '0011', value: 15, influence: 0.7, bias: 0.2 },
    { name: '0062', value: 12, influence: 0.4, bias: 0.1 },
    { name: '0115', value: 8, influence: 0.5, bias: 0.0 }
  ];

  // 갈등 예측 그래프 데이터
  const conflictPredictionData = {
    labels: ['현재', '1시간 후', '3시간 후', '6시간 후', '12시간 후', '24시간 후'],
    datasets: [
      {
        label: '갈등 확률',
        data: [0.75, 0.78, 0.82, 0.85, 0.88, 0.90],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: '해결 확률',
        data: [0.42, 0.40, 0.38, 0.35, 0.32, 0.30],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // AI 인사이트 레이더 차트
  const aiInsightsRadarData = {
    labels: ['패턴 감지', '이상 감지', '트렌드 분석', '위험 예측', '기회 발견', '신뢰도'],
    datasets: [
      {
        label: 'AI 성능 지표',
        data: [92, 87, 78, 85, 76, 94],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }
    ]
  };

  // 실시간 메트릭 데이터
  const realTimeMetricsData = [
    { name: '메시지 속도', value: 12.5, color: '#3B82F6' },
    { name: '활성 참여자', value: 8, color: '#10B981' },
    { name: '편향성 수준', value: 0.65, color: '#EF4444' },
    { name: '갈등 위험', value: 0.72, color: '#F59E0B' },
    { name: 'AI 정확도', value: 94.2, color: '#8B5CF6' }
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '실시간 분석 차트',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'AI 성능 레이더 차트',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="advanced-visualization p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📈 고급 시각화 대시보드</h2>
        <p className="text-gray-600">실시간 차트, 히트맵, 네트워크 분석을 통한 고급 데이터 시각화</p>
      </div>

      {/* 차트 선택 네비게이션 */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'sentiment', label: '감정 트렌드', icon: '📊' },
            { id: 'bias-heatmap', label: '편향성 히트맵', icon: '🔥' },
            { id: 'participant-network', label: '참여자 네트워크', icon: '👥' },
            { id: 'conflict-prediction', label: '갈등 예측', icon: '⚠️' },
            { id: 'ai-insights', label: 'AI 인사이트', icon: '🤖' },
            { id: 'real-time-metrics', label: '실시간 메트릭', icon: '⚡' }
          ].map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeChart === chart.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{chart.icon}</span>
              <span>{chart.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 시간 범위 선택 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">시간 범위:</span>
          {['1h', '6h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 콘텐츠 */}
      <div className="space-y-6">
        {activeChart === 'sentiment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📊 실시간 감정 트렌드</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Line data={sentimentChartData} options={chartOptions} height={60} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">전체 감정 지수</p>
                <p className="text-lg font-bold text-blue-600">-0.2</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">편향성 수준</p>
                <p className="text-lg font-bold text-red-600">0.65</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">갈등 위험도</p>
                <p className="text-lg font-bold text-orange-600">0.72</p>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'bias-heatmap' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🔥 시공사별 편향성 히트맵</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Bar data={biasHeatmapData} options={chartOptions} height={60} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">편향성 해석</h4>
                <ul className="text-sm space-y-1">
                  <li>• <span className="text-red-600 font-medium">삼성물산</span>: 강한 우호 편향 (0.75)</li>
                  <li>• <span className="text-green-600 font-medium">대우건설</span>: 강한 비하 편향 (-0.65)</li>
                  <li>• <span className="text-blue-600 font-medium">포스코</span>: 약한 우호 편향 (0.2)</li>
                </ul>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">편향성 지표</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">평균 편향성:</span>
                    <span className="font-medium">0.22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">편향성 분산:</span>
                    <span className="font-medium">0.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">최대 편향:</span>
                    <span className="font-medium text-red-600">0.75</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'participant-network' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">👥 참여자 네트워크 분석</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={participantNetworkData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">영향력 순위</h4>
                <div className="space-y-2">
                  {participantNetworkData
                    .sort((a, b) => b.influence - a.influence)
                    .map((participant, index) => (
                      <div key={participant.name} className="flex justify-between items-center">
                        <span className="text-sm">{index + 1}. {participant.name}</span>
                        <span className="font-medium text-blue-600">{(participant.influence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">편향성 분석</h4>
                <div className="space-y-2">
                  {participantNetworkData
                    .filter(p => Math.abs(p.bias) > 0.3)
                    .map((participant) => (
                      <div key={participant.name} className="flex justify-between items-center">
                        <span className="text-sm">{participant.name}</span>
                        <span className={`font-medium ${participant.bias > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {participant.bias > 0 ? '+' : ''}{participant.bias.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'conflict-prediction' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⚠️ 갈등 예측 그래프</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Line data={conflictPredictionData} options={chartOptions} height={60} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">현재 갈등 확률</p>
                <p className="text-lg font-bold text-red-600">75%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">해결 확률</p>
                <p className="text-lg font-bold text-green-600">42%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">예상 해결 시간</p>
                <p className="text-lg font-bold text-orange-600">14일</p>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'ai-insights' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🤖 AI 성능 레이더 차트</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Radar data={aiInsightsRadarData} options={radarOptions} height={60} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">AI 성능 지표</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">패턴 감지:</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">이상 감지:</span>
                    <span className="font-medium text-blue-600">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">위험 예측:</span>
                    <span className="font-medium text-orange-600">85%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2">신뢰도 분석</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">전체 신뢰도:</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">데이터 품질:</span>
                    <span className="font-medium text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">모델 성능:</span>
                    <span className="font-medium text-purple-600">89%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'real-time-metrics' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⚡ 실시간 메트릭</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={realTimeMetricsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {realTimeMetricsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {realTimeMetricsData.map((metric, index) => (
                <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-lg font-bold" style={{ color: metric.color }}>
                    {typeof metric.value === 'number' && metric.value < 1 
                      ? (metric.value * 100).toFixed(0) + '%'
                      : metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedVisualization; 