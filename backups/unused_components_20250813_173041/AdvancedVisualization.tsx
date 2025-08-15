import React, { useState } from 'react';
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
import { LineChart as RechartsLineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, PieChart, Pie, Cell } from 'recharts';

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
  data: any;
  type: 'line' | 'bar' | 'doughnut' | 'radar' | 'pie';
  title?: string;
  height?: number;
}

const AdvancedVisualization: React.FC<AdvancedVisualizationProps> = ({
  data,
  type,
  title,
  height = 400
}) => {
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'doughnut' | 'radar'>(type as 'line' | 'bar' | 'doughnut' | 'radar');

  const renderChart = () => {
    switch (selectedChart) {
      case 'line':
        return (
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: !!title,
                  text: title,
                },
              },
            }}
          />
        );
      case 'bar':
        return (
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: !!title,
                  text: title,
                },
              },
            }}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: !!title,
                  text: title,
                },
              },
            }}
          />
        );
      case 'radar':
        return (
          <Radar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: !!title,
                  text: title,
                },
              },
            }}
          />
        );
      default:
        return <div>지원하지 않는 차트 타입입니다.</div>;
    }
  };

  const renderRechartsChart = () => {
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <RechartsLine type="monotone" dataKey="value" stroke="#8884d8" />
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title || '데이터 시각화'}</h3>
        <div className="flex space-x-2">
          {(['line', 'bar', 'doughnut', 'radar'] as const).map((chartType) => (
            <button
              key={chartType}
              onClick={() => setSelectedChart(chartType)}
              className={`px-3 py-1 text-sm rounded ${selectedChart === chartType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }}>
        {type === 'pie' ? renderRechartsChart() : renderChart()}
      </div>
    </div>
  );
};

export default AdvancedVisualization; 