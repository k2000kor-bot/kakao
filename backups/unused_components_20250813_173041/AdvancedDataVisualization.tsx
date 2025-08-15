import React, { useState, useEffect, useCallback } from 'react';
import { advancedVisualizationService, ChartData, VisualizationRequest } from '../services/advancedVisualizationService';
import './AdvancedDataVisualization.css';

interface AdvancedDataVisualizationProps {
    data?: any[];
    chartType?: string;
    title?: string;
    height?: number;
    width?: number;
    interactive?: boolean;
    realtime?: boolean;
    onChartClick?: (data: any) => void;
    onExport?: (chartId: string, format: string) => void;
}

interface ChartDisplayProps {
    chartData: ChartData;
    height: number;
    width: number;
    onInteraction?: (data: any) => void;
}

const AdvancedDataVisualization: React.FC<AdvancedDataVisualizationProps> = ({
    data = [],
    chartType,
    title,
    height = 400,
    width = 600,
    interactive = true,
    realtime = false,
    onChartClick,
    onExport
}) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [alternativeCharts, setAlternativeCharts] = useState<ChartData[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedChartType, setSelectedChartType] = useState<string>(chartType || 'auto');
    const [showAlternatives, setShowAlternatives] = useState(false);

    /**
     * 차트 생성
     */
    const generateChart = useCallback(async () => {
        if (!data || data.length === 0) {
            setError('표시할 데이터가 없습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const request: VisualizationRequest = {
                data,
                chartType: selectedChartType === 'auto' ? undefined : selectedChartType,
                title,
                interactiveFeatures: interactive ? ['tooltip', 'legend', 'zoom'] : []
            };

            const response = await advancedVisualizationService.generateChart(request);

            if (response.success && response.chartData) {
                setChartData(response.chartData);
                setAlternativeCharts(response.alternativeCharts || []);
                setSuggestions(response.suggestions || []);
            } else {
                setError(response.error || '차트 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('차트 생성 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [data, selectedChartType, title, interactive]);

    /**
     * 데이터 변경 시 차트 재생성
     */
    useEffect(() => {
        if (data && data.length > 0) {
            generateChart();
        }
    }, [generateChart]);

    /**
     * 실시간 업데이트
     */
    useEffect(() => {
        if (realtime && chartData) {
            const interval = setInterval(() => {
                // 실시간 데이터 업데이트 시뮬레이션
                if (data && data.length > 0) {
                    advancedVisualizationService.updateChartData(chartData.id, data);
                    // 차트 데이터 새로고침
                    const updatedChart = advancedVisualizationService.getChart(chartData.id);
                    if (updatedChart) {
                        setChartData(updatedChart);
                    }
                }
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [realtime, chartData, data]);

    /**
     * 차트 타입 변경
     */
    const handleChartTypeChange = (newType: string) => {
        setSelectedChartType(newType);
    };

    /**
     * 차트 내보내기
     */
    const handleExport = (format: 'svg' | 'png' | 'json') => {
        if (chartData) {
            const exported = advancedVisualizationService.exportChart(chartData.id, format);
            if (exported && onExport) {
                onExport(chartData.id, format);
            }
        }
    };

    /**
     * 차트 상호작용 처리
     */
    const handleChartInteraction = (interactionData: any) => {
        if (onChartClick) {
            onChartClick(interactionData);
        }
    };

    if (isLoading) {
        return (
            <div className="advanced-visualization-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>차트를 생성하고 있습니다...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-visualization-container">
                <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={generateChart} className="retry-button">
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="advanced-visualization-container">
                <div className="no-data-message">
                    <div className="no-data-icon">📊</div>
                    <p>표시할 차트 데이터가 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="advanced-visualization-container">
            {/* 차트 컨트롤 패널 */}
            <div className="chart-controls">
                <div className="chart-header">
                    <h3>{chartData.title}</h3>
                    {chartData.description && (
                        <p className="chart-description">{chartData.description}</p>
                    )}
                </div>

                <div className="chart-actions">
                    {/* 차트 타입 선택 */}
                    <div className="chart-type-selector">
                        <label>차트 타입:</label>
                        <select
                            value={selectedChartType}
                            onChange={(e) => handleChartTypeChange(e.target.value)}
                            title="차트 유형 선택"
                            aria-label="차트 유형 선택"
                        >
                            <option value="auto">자동 선택</option>
                            <option value="bar">막대 차트</option>
                            <option value="line">선 차트</option>
                            <option value="pie">파이 차트</option>
                            <option value="scatter">산점도</option>
                            <option value="area">영역 차트</option>
                            <option value="heatmap">히트맵</option>
                            <option value="radar">레이더 차트</option>
                        </select>
                    </div>

                    {/* 내보내기 버튼 */}
                    <div className="export-buttons">
                        <button onClick={() => handleExport('png')} className="export-btn">
                            PNG 저장
                        </button>
                        <button onClick={() => handleExport('svg')} className="export-btn">
                            SVG 저장
                        </button>
                        <button onClick={() => handleExport('json')} className="export-btn">
                            데이터 내보내기
                        </button>
                    </div>

                    {/* 대안 차트 토글 */}
                    {alternativeCharts.length > 0 && (
                        <button
                            onClick={() => setShowAlternatives(!showAlternatives)}
                            className="alternatives-toggle"
                        >
                            대안 차트 {showAlternatives ? '숨기기' : '보기'}
                        </button>
                    )}
                </div>
            </div>

            {/* 메인 차트 */}
            <div className="main-chart">
                <ChartDisplay
                    chartData={chartData}
                    height={height}
                    width={width}
                    onInteraction={handleChartInteraction}
                />
            </div>

            {/* 차트 메타데이터 */}
            {chartData.metadata && (
                <div className="chart-metadata">
                    <div className="metadata-item">
                        <span className="metadata-label">데이터 정확도:</span>
                        <span className="metadata-value">{chartData.metadata.accuracy}%</span>
                    </div>
                    <div className="metadata-item">
                        <span className="metadata-label">마지막 업데이트:</span>
                        <span className="metadata-value">
                            {chartData.metadata.lastUpdated && new Date(chartData.metadata.lastUpdated).toLocaleString()}
                        </span>
                    </div>
                    {chartData.metadata.tags && chartData.metadata.tags.length > 0 && (
                        <div className="metadata-item">
                            <span className="metadata-label">태그:</span>
                            <div className="metadata-tags">
                                {chartData.metadata.tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI 제안사항 */}
            {suggestions.length > 0 && (
                <div className="chart-suggestions">
                    <h4>💡 AI 제안사항</h4>
                    <ul>
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 대안 차트 */}
            {showAlternatives && alternativeCharts.length > 0 && (
                <div className="alternative-charts">
                    <h4>🔄 대안 차트</h4>
                    <div className="alternatives-grid">
                        {alternativeCharts.map((altChart) => (
                            <div key={altChart.id} className="alternative-chart">
                                <h5>{altChart.title}</h5>
                                <ChartDisplay
                                    chartData={altChart}
                                    height={200}
                                    width={300}
                                    onInteraction={handleChartInteraction}
                                />
                                <button
                                    onClick={() => setChartData(altChart)}
                                    className="use-alternative-btn"
                                >
                                    이 차트 사용하기
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * 차트 디스플레이 컴포넌트
 */
const ChartDisplay: React.FC<ChartDisplayProps> = ({
    chartData,
    height,
    width,
    onInteraction
}) => {
    const [hoveredData, setHoveredData] = useState<any>(null);

    const renderChart = () => {
        switch (chartData.type) {
            case 'bar':
                return <BarChart chartData={chartData} height={height} width={width} />;
            case 'line':
                return <LineChart chartData={chartData} height={height} width={width} />;
            case 'pie':
                return <PieChart chartData={chartData} height={height} width={width} />;
            case 'scatter':
                return <ScatterChart chartData={chartData} height={height} width={width} />;
            case 'heatmap':
                return <HeatmapChart chartData={chartData} height={height} width={width} />;
            default:
                return <BarChart chartData={chartData} height={height} width={width} />;
        }
    };

    return (
        <div className="chart-display">
            <div
                className="chart-canvas"
                style={{ width, height }}
                onMouseMove={(e) => {
                    // 마우스 위치에 따른 데이터 포인트 찾기
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // 간단한 히트 테스트 (실제로는 더 정교한 로직 필요)
                    const dataPoint = {
                        x,
                        y,
                        value: chartData.data[Math.floor((x / width) * chartData.data.length)]
                    };

                    setHoveredData(dataPoint);
                }}
                onClick={() => {
                    if (hoveredData && onInteraction) {
                        onInteraction(hoveredData);
                    }
                }}
            >
                {renderChart()}
            </div>

            {/* 툴팁 */}
            {hoveredData && chartData.config.tooltip?.show && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: hoveredData.x + 10,
                        top: hoveredData.y - 10
                    }}
                >
                    <div className="tooltip-content">
                        {hoveredData.value && typeof hoveredData.value === 'object' && (
                            <>
                                <div><strong>{hoveredData.value.name || 'Data'}</strong></div>
                                <div>값: {hoveredData.value.value || hoveredData.value.y}</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * 막대 차트 컴포넌트
 */
const BarChart: React.FC<ChartDisplayProps> = ({ chartData, height, width }) => {
    const data = chartData.data;
    const maxValue = Math.max(...data.map(d => d.value || 0));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;

    return (
        <svg width={width} height={height}>
            {/* 배경 그리드 */}
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 막대 */}
            {data.map((item, index) => {
                const barHeight = (item.value / maxValue) * (height - 60);
                const x = index * (barWidth + barSpacing) + barSpacing / 2;
                const y = height - barHeight - 30;

                return (
                    <g key={index}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={chartData.config.colors?.[index % (chartData.config.colors?.length || 1)] || '#3B82F6'}
                            className="chart-bar"
                        />
                        <text
                            x={x + barWidth / 2}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#666"
                        >
                            {item.name}
                        </text>
                        <text
                            x={x + barWidth / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#333"
                        >
                            {item.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

/**
 * 선 차트 컴포넌트
 */
const LineChart: React.FC<ChartDisplayProps> = ({ chartData, height, width }) => {
    const data = chartData.data;
    const maxY = Math.max(...data.map(d => d.y || 0));
    const minY = Math.min(...data.map(d => d.y || 0));

    const getX = (index: number) => (index / (data.length - 1)) * (width - 60) + 30;
    const getY = (value: number) => height - 30 - ((value - minY) / (maxY - minY)) * (height - 60);

    const pathData = data.map((point, index) => {
        const x = getX(index);
        const y = getY(point.y || 0);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height}>
            {/* 배경 그리드 */}
            <defs>
                <pattern id="lineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lineGrid)" />

            {/* 선 */}
            <path
                d={pathData}
                fill="none"
                stroke={chartData.config.colors?.[0] || '#3B82F6'}
                strokeWidth="2"
                className="chart-line"
            />

            {/* 데이터 포인트 */}
            {data.map((point, index) => (
                <circle
                    key={index}
                    cx={getX(index)}
                    cy={getY(point.y || 0)}
                    r="4"
                    fill={chartData.config.colors?.[0] || '#3B82F6'}
                    className="chart-point"
                />
            ))}

            {/* 축 라벨 */}
            {data.map((point, index) => {
                if (index % Math.ceil(data.length / 5) === 0) {
                    return (
                        <text
                            key={index}
                            x={getX(index)}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#666"
                        >
                            {point.label || point.x}
                        </text>
                    );
                }
                return null;
            })}
        </svg>
    );
};

/**
 * 파이 차트 컴포넌트
 */
const PieChart: React.FC<ChartDisplayProps> = ({ chartData, height, width }) => {
    const data = chartData.data;
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    let currentAngle = 0;

    const createArcPath = (startAngle: number, endAngle: number, outerRadius: number) => {
        const x1 = centerX + outerRadius * Math.cos(startAngle);
        const y1 = centerY + outerRadius * Math.sin(startAngle);
        const x2 = centerX + outerRadius * Math.cos(endAngle);
        const y2 = centerY + outerRadius * Math.sin(endAngle);

        const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    return (
        <svg width={width} height={height}>
            {data.map((item, index) => {
                const angle = (item.value / total) * 2 * Math.PI;
                const path = createArcPath(currentAngle, currentAngle + angle, radius);
                const labelAngle = currentAngle + angle / 2;
                const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
                const labelY = centerY + (radius + 20) * Math.sin(labelAngle);

                currentAngle += angle;

                return (
                    <g key={index}>
                        <path
                            d={path}
                            fill={chartData.config.colors?.[index % (chartData.config.colors?.length || 1)] || '#3B82F6'}
                            className="chart-pie-slice"
                        />
                        <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#333"
                        >
                            {item.name}
                        </text>
                        <text
                            x={labelX}
                            y={labelY + 12}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#666"
                        >
                            {Math.round((item.value / total) * 100)}%
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

/**
 * 산점도 컴포넌트
 */
const ScatterChart: React.FC<ChartDisplayProps> = ({ chartData, height, width }) => {
    const data = chartData.data;
    const maxX = Math.max(...data.map(d => d.x || 0));
    const maxY = Math.max(...data.map(d => d.y || 0));
    const minX = Math.min(...data.map(d => d.x || 0));
    const minY = Math.min(...data.map(d => d.y || 0));

    const getX = (value: number) => ((value - minX) / (maxX - minX)) * (width - 60) + 30;
    const getY = (value: number) => height - 30 - ((value - minY) / (maxY - minY)) * (height - 60);

    return (
        <svg width={width} height={height}>
            {/* 배경 그리드 */}
            <defs>
                <pattern id="scatterGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#scatterGrid)" />

            {/* 데이터 포인트 */}
            {data.map((point, index) => (
                <circle
                    key={index}
                    cx={getX(point.x || 0)}
                    cy={getY(point.y || 0)}
                    r={point.size ? Math.sqrt(point.size) : 5}
                    fill={chartData.config.colors?.[index % (chartData.config.colors?.length || 1)] || '#3B82F6'}
                    opacity="0.7"
                    className="chart-scatter-point"
                />
            ))}

            {/* 축 */}
            <line x1="30" y1={height - 30} x2={width - 30} y2={height - 30} stroke="#333" strokeWidth="1" />
            <line x1="30" y1="30" x2="30" y2={height - 30} stroke="#333" strokeWidth="1" />
        </svg>
    );
};

/**
 * 히트맵 컴포넌트
 */
const HeatmapChart: React.FC<ChartDisplayProps> = ({ chartData, height, width }) => {
    const data = chartData.data;
    const maxValue = Math.max(...data.map(d => d[2] || 0));
    const minValue = Math.min(...data.map(d => d[2] || 0));

    const cellWidth = width / 10;
    const cellHeight = height / 10;

    const getColor = (value: number) => {
        const intensity = (value - minValue) / (maxValue - minValue);
        const colors = chartData.config.colors || ['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#92400E'];
        const colorIndex = Math.floor(intensity * (colors.length - 1));
        return colors[colorIndex] || colors[0];
    };

    return (
        <svg width={width} height={height}>
            {data.map((cell, index) => {
                const [row, col, value] = cell;
                return (
                    <rect
                        key={index}
                        x={col * cellWidth}
                        y={row * cellHeight}
                        width={cellWidth}
                        height={cellHeight}
                        fill={getColor(value)}
                        stroke="#fff"
                        strokeWidth="1"
                        className="heatmap-cell"
                    />
                );
            })}
        </svg>
    );
};

export default AdvancedDataVisualization; 