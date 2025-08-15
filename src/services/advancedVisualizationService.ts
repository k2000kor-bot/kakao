/**
 * CORBU AI 고급 데이터 시각화 및 차트 생성 서비스
 * 인터랙티브한 차트와 데이터 시각화를 제공합니다.
 */

export interface ChartData {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'heatmap' | 'radar' | 'treemap';
    title: string;
    description?: string;
    data: any[];
    config: ChartConfig;
    interactive: boolean;
    realtime?: boolean;
    metadata?: {
        source?: string;
        lastUpdated?: string;
        accuracy?: number;
        tags?: string[];
    };
}

export interface ChartConfig {
    xAxis?: {
        label: string;
        type: 'category' | 'time' | 'value';
        format?: string;
    };
    yAxis?: {
        label: string;
        type: 'value' | 'category';
        format?: string;
        min?: number;
        max?: number;
    };
    colors?: string[];
    theme?: 'light' | 'dark' | 'corporate' | 'modern';
    animation?: boolean;
    responsive?: boolean;
    legend?: {
        show: boolean;
        position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
        show: boolean;
        format?: string;
    };
}

export interface VisualizationRequest {
    data: any[];
    chartType?: string;
    title?: string;
    description?: string;
    customConfig?: Partial<ChartConfig>;
    interactiveFeatures?: string[];
}

export interface VisualizationResponse {
    success: boolean;
    chartData?: ChartData;
    suggestions?: string[];
    alternativeCharts?: ChartData[];
    error?: string;
}

class AdvancedVisualizationService {
    private charts: Map<string, ChartData> = new Map();
    private templates: Map<string, ChartConfig> = new Map();

    constructor() {
        this.initializeChartTemplates();
    }

    /**
     * 차트 템플릿 초기화
     */
    private initializeChartTemplates(): void {
        // 기본 라인 차트 템플릿
        this.templates.set('line-default', {
            theme: 'modern',
            animation: true,
            responsive: true,
            legend: { show: true, position: 'top' },
            tooltip: { show: true },
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        });

        // 바 차트 템플릿
        this.templates.set('bar-default', {
            theme: 'modern',
            animation: true,
            responsive: true,
            legend: { show: true, position: 'top' },
            tooltip: { show: true },
            colors: ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16']
        });

        // 파이 차트 템플릿
        this.templates.set('pie-default', {
            theme: 'modern',
            animation: true,
            responsive: true,
            legend: { show: true, position: 'right' },
            tooltip: { show: true, format: '{b}: {c} ({d}%)' },
            colors: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899']
        });

        // 히트맵 템플릿
        this.templates.set('heatmap-default', {
            theme: 'modern',
            animation: true,
            responsive: true,
            tooltip: { show: true },
            colors: ['#FEF3C7', '#FCD34D', '#F59E0B', '#D97706', '#92400E']
        });
    }

    /**
     * 데이터에서 최적의 차트 타입 추천
     */
    public recommendChartType(data: any[]): string {
        if (!data || data.length === 0) return 'bar';

        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        // 숫자형 컬럼 개수 계산
        const numericColumns = keys.filter(key =>
            typeof firstRow[key] === 'number'
        ).length;

        // 시간 데이터 확인
        const hasTimeData = keys.some(key =>
            key.toLowerCase().includes('time') ||
            key.toLowerCase().includes('date') ||
            this.isDateString(firstRow[key])
        );

        // 카테고리 데이터 개수 확인
        const categoricalColumns = keys.filter(key =>
            typeof firstRow[key] === 'string'
        ).length;

        // 추천 로직
        if (hasTimeData && numericColumns >= 1) {
            return 'line'; // 시계열 데이터
        }

        if (categoricalColumns === 1 && numericColumns === 1) {
            if (data.length <= 10) {
                return 'pie'; // 카테고리가 적으면 파이 차트
            } else {
                return 'bar'; // 카테고리가 많으면 바 차트
            }
        }

        if (numericColumns >= 2) {
            return 'scatter'; // 수치형 데이터가 2개 이상이면 산점도
        }

        if (data.length > 50) {
            return 'heatmap'; // 데이터가 많으면 히트맵
        }

        return 'bar'; // 기본값
    }

    /**
     * 문자열이 날짜인지 확인
     */
    private isDateString(value: any): boolean {
        if (typeof value !== 'string') return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    /**
     * 차트 생성
     */
    public async generateChart(request: VisualizationRequest): Promise<VisualizationResponse> {
        try {
            const { data, chartType, title, description, customConfig, interactiveFeatures } = request;

            if (!data || data.length === 0) {
                return {
                    success: false,
                    error: '데이터가 비어있습니다.'
                };
            }

            // 차트 타입 결정
            const recommendedType = chartType || this.recommendChartType(data);

            // 차트 데이터 생성
            const chartData: ChartData = {
                id: this.generateChartId(),
                type: recommendedType as ChartData['type'],
                title: title || `${recommendedType.toUpperCase()} 차트`,
                description: description || '자동 생성된 차트입니다.',
                data: this.processDataForChart(data, recommendedType),
                config: this.generateChartConfig(recommendedType, customConfig),
                interactive: interactiveFeatures ? interactiveFeatures.length > 0 : true,
                metadata: {
                    source: 'user_data',
                    lastUpdated: new Date().toISOString(),
                    accuracy: this.calculateDataAccuracy(data),
                    tags: this.generateDataTags(data)
                }
            };

            // 차트 저장
            this.charts.set(chartData.id, chartData);

            // 대안 차트 제안
            const alternativeCharts = await this.generateAlternativeCharts(data, recommendedType);

            return {
                success: true,
                chartData,
                suggestions: this.generateChartSuggestions(data, recommendedType),
                alternativeCharts
            };

        } catch (error) {
            console.error('차트 생성 오류:', error);
            return {
                success: false,
                error: '차트 생성 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 차트 데이터 처리
     */
    private processDataForChart(data: any[], chartType: string): any[] {
        switch (chartType) {
            case 'line':
                return this.processLineChartData(data);
            case 'bar':
                return this.processBarChartData(data);
            case 'pie':
                return this.processPieChartData(data);
            case 'scatter':
                return this.processScatterChartData(data);
            case 'heatmap':
                return this.processHeatmapData(data);
            case 'radar':
                return this.processRadarChartData(data);
            default:
                return data;
        }
    }

    /**
     * 라인 차트 데이터 처리
     */
    private processLineChartData(data: any[]): any[] {
        const processedData = data.map((item, index) => {
            const keys = Object.keys(item);
            const timeKey = keys.find(key =>
                key.toLowerCase().includes('time') ||
                key.toLowerCase().includes('date') ||
                this.isDateString(item[key])
            );

            const valueKey = keys.find(key => typeof item[key] === 'number');

            return {
                x: timeKey ? item[timeKey] : index,
                y: valueKey ? item[valueKey] : 0,
                label: item.name || item.label || `Data ${index + 1}`
            };
        });

        return processedData;
    }

    /**
     * 바 차트 데이터 처리
     */
    private processBarChartData(data: any[]): any[] {
        return data.map(item => {
            const keys = Object.keys(item);
            const nameKey = keys.find(key => typeof item[key] === 'string') || keys[0];
            const valueKey = keys.find(key => typeof item[key] === 'number') || keys[1];

            return {
                name: item[nameKey],
                value: item[valueKey] || 0
            };
        });
    }

    /**
     * 파이 차트 데이터 처리
     */
    private processPieChartData(data: any[]): any[] {
        return data.map(item => {
            const keys = Object.keys(item);
            const nameKey = keys.find(key => typeof item[key] === 'string') || keys[0];
            const valueKey = keys.find(key => typeof item[key] === 'number') || keys[1];

            return {
                name: item[nameKey],
                value: item[valueKey] || 0
            };
        });
    }

    /**
     * 산점도 데이터 처리
     */
    private processScatterChartData(data: any[]): any[] {
        const numericKeys = Object.keys(data[0]).filter(key =>
            typeof data[0][key] === 'number'
        );

        if (numericKeys.length < 2) {
            return data.map((item, index) => ({
                x: index,
                y: Object.values(item).find(val => typeof val === 'number') || 0
            }));
        }

        return data.map(item => ({
            x: item[numericKeys[0]],
            y: item[numericKeys[1]],
            size: item[numericKeys[2]] || 10
        }));
    }

    /**
     * 히트맵 데이터 처리
     */
    private processHeatmapData(data: any[]): any[] {
        // 히트맵을 위한 2차원 배열 생성
        const processed: any[] = [];

        data.forEach((item, rowIndex) => {
            Object.keys(item).forEach((key, colIndex) => {
                if (typeof item[key] === 'number') {
                    processed.push([rowIndex, colIndex, item[key]]);
                }
            });
        });

        return processed;
    }

    /**
     * 레이더 차트 데이터 처리
     */
    private processRadarChartData(data: any[]): any[] {
        const indicators = Object.keys(data[0]).filter(key =>
            typeof data[0][key] === 'number'
        );

        return data.map(item => ({
            name: item.name || item.label || 'Series',
            value: indicators.map(indicator => item[indicator] || 0)
        }));
    }

    /**
     * 차트 설정 생성
     */
    private generateChartConfig(chartType: string, customConfig?: Partial<ChartConfig>): ChartConfig {
        const template = this.templates.get(`${chartType}-default`) || this.templates.get('bar-default')!;

        return {
            ...template,
            ...customConfig
        };
    }

    /**
     * 차트 ID 생성
     */
    private generateChartId(): string {
        return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 데이터 정확도 계산
     */
    private calculateDataAccuracy(data: any[]): number {
        let accuracy = 100;

        // 빈 값이나 null 값이 있으면 정확도 감소
        const totalFields = data.length * Object.keys(data[0]).length;
        let emptyFields = 0;

        data.forEach(item => {
            Object.values(item).forEach(value => {
                if (value === null || value === undefined || value === '') {
                    emptyFields++;
                }
            });
        });

        accuracy = Math.max(0, 100 - (emptyFields / totalFields) * 100);
        return Math.round(accuracy);
    }

    /**
     * 데이터 태그 생성
     */
    private generateDataTags(data: any[]): string[] {
        const tags: string[] = [];

        if (data.length > 100) tags.push('big-data');
        if (data.length < 10) tags.push('small-dataset');

        const firstRow = data[0];
        const hasTimeData = Object.keys(firstRow).some(key =>
            key.toLowerCase().includes('time') ||
            key.toLowerCase().includes('date')
        );

        if (hasTimeData) tags.push('time-series');

        const numericColumns = Object.keys(firstRow).filter(key =>
            typeof firstRow[key] === 'number'
        ).length;

        if (numericColumns > 3) tags.push('multi-dimensional');

        return tags;
    }

    /**
     * 차트 제안사항 생성
     */
    private generateChartSuggestions(data: any[], chartType: string): string[] {
        const suggestions: string[] = [];

        suggestions.push(`${chartType} 차트가 이 데이터에 최적화되어 있습니다.`);

        if (data.length > 50) {
            suggestions.push('데이터가 많아 페이지네이션이나 필터링을 고려해보세요.');
        }

        if (chartType !== 'pie' && data.length <= 10) {
            suggestions.push('데이터가 적어 파이 차트도 효과적일 수 있습니다.');
        }

        const numericColumns = Object.keys(data[0]).filter(key =>
            typeof data[0][key] === 'number'
        ).length;

        if (numericColumns >= 2 && chartType !== 'scatter') {
            suggestions.push('수치 데이터가 여러 개 있어 산점도 차트도 유용할 수 있습니다.');
        }

        return suggestions;
    }

    /**
     * 대안 차트 생성
     */
    private async generateAlternativeCharts(data: any[], currentType: string): Promise<ChartData[]> {
        const alternatives: ChartData[] = [];
        const chartTypes = ['bar', 'line', 'pie', 'scatter'];

        const otherTypes = chartTypes.filter(type => type !== currentType);

        for (const type of otherTypes.slice(0, 2)) {
            try {
                const altChart: ChartData = {
                    id: this.generateChartId(),
                    type: type as ChartData['type'],
                    title: `${type.toUpperCase()} 차트 (대안)`,
                    description: `동일한 데이터의 ${type} 차트 버전입니다.`,
                    data: this.processDataForChart(data, type),
                    config: this.generateChartConfig(type),
                    interactive: true,
                    metadata: {
                        source: 'alternative_suggestion',
                        lastUpdated: new Date().toISOString()
                    }
                };

                alternatives.push(altChart);
            } catch (error) {
                console.warn(`대안 차트 생성 실패 (${type}):`, error);
            }
        }

        return alternatives;
    }

    /**
     * 실시간 차트 업데이트
     */
    public updateChartData(chartId: string, newData: any[]): boolean {
        const chart = this.charts.get(chartId);
        if (!chart) return false;

        try {
            chart.data = this.processDataForChart(newData, chart.type);
            chart.metadata = {
                ...chart.metadata,
                lastUpdated: new Date().toISOString()
            };

            this.charts.set(chartId, chart);
            return true;
        } catch (error) {
            console.error('차트 업데이트 오류:', error);
            return false;
        }
    }

    /**
     * 차트 조회
     */
    public getChart(chartId: string): ChartData | null {
        return this.charts.get(chartId) || null;
    }

    /**
     * 모든 차트 조회
     */
    public getAllCharts(): ChartData[] {
        return Array.from(this.charts.values());
    }

    /**
     * 차트 삭제
     */
    public deleteChart(chartId: string): boolean {
        return this.charts.delete(chartId);
    }

    /**
     * 대화형 차트 기능 활성화
     */
    public enableInteractiveFeatures(chartId: string, features: string[]): boolean {
        const chart = this.charts.get(chartId);
        if (!chart) return false;

        chart.interactive = true;
        chart.config = {
            ...chart.config,
            // 인터랙티브 기능 설정
            tooltip: { show: features.includes('tooltip') },
            legend: {
                ...chart.config.legend,
                show: features.includes('legend'),
                position: chart.config.legend?.position || 'top'
            }
        };

        this.charts.set(chartId, chart);
        return true;
    }

    /**
     * 차트 내보내기 (SVG/PNG)
     */
    public exportChart(chartId: string, format: 'svg' | 'png' | 'json'): string | null {
        const chart = this.charts.get(chartId);
        if (!chart) return null;

        switch (format) {
            case 'json':
                return JSON.stringify(chart, null, 2);
            case 'svg':
                // SVG 생성 로직 (실제 구현 시 라이브러리 사용)
                return `<svg><!-- ${chart.title} 차트 --></svg>`;
            case 'png':
                // PNG 생성 로직 (실제 구현 시 canvas 사용)
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
            default:
                return null;
        }
    }
}

// 싱글톤 인스턴스 생성
export const advancedVisualizationService = new AdvancedVisualizationService();

export default advancedVisualizationService;
