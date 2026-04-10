/**
 * 예측 분석 결과 차트 컴포넌트
 */

import React from 'react';
import './PredictionChart.css';

interface PredictionChartProps {
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  title?: string;
  type?: 'bar' | 'line' | 'pie';
  maxValue?: number;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  data,
  title,
  type = 'bar',
  maxValue,
}) => {
  const { labels, values, colors } = data;
  const max = maxValue || Math.max(...values, 1);
  const defaultColors = ['var(--accent-info)', 'var(--accent-success)', 'var(--accent-warning)', 'var(--accent-error)', 'var(--text-secondary)'];
  const chartColors = colors || defaultColors;

  const renderBarChart = () => {
    return (
      <div className="chart-container">
        {labels.map((label, index) => {
          const percentage = (values[index] / max) * 100;
          return (
            <div key={index} className="chart-item">
              <div className="chart-label">{label}</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                >
                  <span className="chart-value">
                    {(values[index] * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = values.map((value, index) => ({
      x: (index / (values.length - 1)) * 100,
      y: 100 - (value / max) * 100,
      value,
    }));

    const _pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    void _pathData; // Path data used for future SVG path element

    return (
      <div className="chart-container line-chart">
        <svg viewBox="0 0 100 100" className="chart-svg">
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--accent-info)"
            strokeWidth="2"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="var(--accent-info)"
            />
          ))}
        </svg>
        <div className="chart-labels">
          {labels.map((label, index) => (
            <div key={index} className="chart-label-small">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    let currentAngle = 0;
    const total = values.reduce((sum, val) => sum + val, 0);

    return (
      <div className="chart-container pie-chart">
        <svg viewBox="0 0 100 100" className="chart-svg">
          {values.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

            const largeArc = angle > 180 ? 1 : 0;

            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

            currentAngle = endAngle;

            return (
              <path
                key={index}
                d={pathData}
                fill={chartColors[index % chartColors.length]}
                stroke="var(--on-accent)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div className="chart-legend">
          {labels.map((label, index) => (
            <div key={index} className="legend-item">
              <span
                className="legend-color"
                style={{
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              ></span>
              <span className="legend-label">{label}</span>
              <span className="legend-value">
                {(values[index] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="prediction-chart">
      {title && <h4 className="chart-title">{title}</h4>}
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  );
};

export default PredictionChart;

