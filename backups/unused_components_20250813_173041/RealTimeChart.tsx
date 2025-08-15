import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ko } from 'date-fns/locale';

Chart.register(...registerables);

interface ChartData {
  timestamp: number;
  value: number;
}

interface RealTimeChartProps {
  data: ChartData[];
  title: string;
  color: string;
  maxDataPoints?: number;
  height?: number;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  data,
  title,
  color,
  maxDataPoints = 20,
  height = 100
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // 기존 차트 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 데이터 포인트 제한
    const limitedData = data.slice(-maxDataPoints);

    // 차트 생성
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: limitedData.map(d => new Date(d.timestamp)),
        datasets: [
          {
            label: title,
            data: limitedData.map(d => d.value),
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: true,
            tension: 0.4 as any,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: color,
            borderWidth: 1,
            callbacks: {
              title: function (context: any[]) {
                const date = new Date(context[0].parsed.x);
                return date.toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              },
              label: function (context: any) {
                return `${title}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time' as any,
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm'
              }
            },
            adapters: {
              date: {
                locale: ko
              }
            },
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            display: false,
            grid: {
              display: false
            }
          }
        } as any,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            radius: 0
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title, color, maxDataPoints]);

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!chartInstance.current) return;

    const limitedData = data.slice(-maxDataPoints);

    chartInstance.current.data.labels = limitedData.map(d => new Date(d.timestamp));
    chartInstance.current.data.datasets[0].data = limitedData.map(d => d.value);
    chartInstance.current.update('none');
  }, [data, maxDataPoints]);

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
      <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium">
        {title}
      </div>
      {data.length > 0 && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          최신: {data[data.length - 1]?.value || 0}
        </div>
      )}
    </div>
  );
};

export default RealTimeChart; 