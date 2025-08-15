import React from 'react';
import { Message } from '../../types/chat';

interface ChartResponseProps {
  message: Message;
}

const ChartResponse: React.FC<ChartResponseProps> = ({ message }) => {
  const getChartTypeIcon = () => {
    const type = message.chart?.type || 'bar';
    
    switch (type) {
      case 'bar':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'line':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'pie':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case 'scatter':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'heatmap':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getChartTypeLabel = () => {
    const type = message.chart?.type || 'bar';
    
    switch (type) {
      case 'bar': return '막대 차트';
      case 'line': return '선 차트';
      case 'pie': return '파이 차트';
      case 'scatter': return '산점도';
      case 'heatmap': return '히트맵';
      default: return '차트';
    }
  };

  const renderSimpleChart = () => {
    const data = message.chart?.data;
    if (!data) return null;

    const type = message.chart?.type || 'bar';
    
    if (type === 'bar' && Array.isArray(data)) {
      const maxValue = Math.max(...data.map((item: any) => item.value || 0));
      
      return (
        <div className="space-y-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-20 text-xs text-gray-600 truncate">{item.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${((item.value || 0) / maxValue) * 100}%` }}
                ></div>
              </div>
              <div className="w-12 text-xs text-gray-600 text-right">{item.value}</div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'pie' && Array.isArray(data)) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
      
      return (
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {data.map((item: any, index: number) => {
              const percentage = (item.value / data.reduce((sum: number, d: any) => sum + d.value, 0)) * 100;
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    background: `conic-gradient(${color} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`
                  }}
                ></div>
              );
            })}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">차트</span>
            </div>
          </div>
          <div className="ml-4 space-y-1">
            {data.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">차트 데이터를 렌더링할 수 없습니다.</p>
      </div>
    );
  };

  return (
    <div className="chart-response bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getChartTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-blue-900">
              {getChartTypeLabel()}
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              시각화
            </div>
          </div>
          
          <div className="text-sm text-gray-700 mb-3">
            {message.content}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        {renderSimpleChart()}
      </div>

      {message.chart?.config && (
        <div className="mt-3 text-xs text-gray-500">
          <details>
            <summary className="cursor-pointer">차트 설정</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
              {JSON.stringify(message.chart.config, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ChartResponse; 