/**
 * advancedVisualizationService 서비스 테스트
 * 고급 데이터 시각화 서비스 테스트
 */

import advancedVisualizationService, {
  VisualizationRequest,
  ChartData
} from '../advancedVisualizationService';

describe('advancedVisualizationService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedVisualizationService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedVisualizationService;
      const instance2 = advancedVisualizationService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('recommendChartType', () => {
    it('시간 시리즈 데이터에 대해 라인 차트를 추천해야 함', () => {
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 },
        { date: '2024-01-03', value: 110 }
      ];

      const chartType = advancedVisualizationService.recommendChartType(data);
      expect(['line', 'bar']).toContain(chartType);
    });

    it('카테고리 데이터에 대해 파이 차트를 추천해야 함', () => {
      const data = [
        { category: 'A', value: 30 },
        { category: 'B', value: 40 },
        { category: 'C', value: 30 }
      ];

      const chartType = advancedVisualizationService.recommendChartType(data);
      expect(['pie', 'bar']).toContain(chartType);
    });

    it('수치형 데이터 2개 이상에 대해 산점도를 추천해야 함', () => {
      const data = [
        { x: 10, y: 20 },
        { x: 15, y: 25 },
        { x: 20, y: 30 }
      ];

      const chartType = advancedVisualizationService.recommendChartType(data);
      expect(chartType).toBe('scatter');
    });

    it('대용량 데이터에 대해 적절한 차트 타입을 추천해야 함', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.random() * 100
      }));

      const chartType = advancedVisualizationService.recommendChartType(data);
      expect(['heatmap', 'scatter', 'line', 'bar']).toContain(chartType);
    });
  });

  describe('generateChart', () => {
    it('라인 차트를 생성할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-01-02', value: 120 },
          { date: '2024-01-03', value: 110 }
        ],
        chartType: 'line',
        title: '테스트 라인 차트'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBe('line');
      expect(result.chartData?.title).toBe('테스트 라인 차트');
      expect(Array.isArray(result.chartData?.data)).toBe(true);
      expect(result.chartData?.config).toBeDefined();
    });

    it('바 차트를 생성할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { category: 'A', value: 30 },
          { category: 'B', value: 40 },
          { category: 'C', value: 30 }
        ],
        chartType: 'bar',
        title: '테스트 바 차트'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBe('bar');
    });

    it('파이 차트를 생성할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { category: 'A', value: 30 },
          { category: 'B', value: 40 },
          { category: 'C', value: 30 }
        ],
        chartType: 'pie',
        title: '테스트 파이 차트'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBe('pie');
    });

    it('산점도 차트를 생성할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 25 },
          { x: 20, y: 30 }
        ],
        chartType: 'scatter',
        title: '테스트 산점도'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBe('scatter');
    });

    it('빈 데이터에 대해 오류를 반환해야 함', async () => {
      const request: VisualizationRequest = {
        data: [],
        chartType: 'line'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('차트 타입을 자동 추천해야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-01-02', value: 120 }
        ],
        title: '자동 추천 차트'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      expect(result.chartData?.type).toBeDefined();
    });

    it('대안 차트를 제안해야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { category: 'A', value: 30 },
          { category: 'B', value: 40 },
          { category: 'C', value: 30 }
        ],
        chartType: 'bar'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      if (result.alternativeCharts) {
        expect(Array.isArray(result.alternativeCharts)).toBe(true);
      }
    });

    it('커스텀 설정을 적용할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-01-02', value: 120 }
        ],
        chartType: 'line',
        customConfig: {
          theme: 'dark',
          animation: false
        }
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
      if (result.chartData?.config) {
        expect(result.chartData.config.theme).toBe('dark');
        expect(result.chartData.config.animation).toBe(false);
      }
    });
  });

  describe('getChart', () => {
    it('차트를 가져올 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-01-02', value: 120 }
        ],
        chartType: 'line',
        title: '조회용 차트'
      };

      const createResult = await advancedVisualizationService.generateChart(request);
      expect(createResult.success).toBe(true);
      expect(createResult.chartData).toBeDefined();

      const chartId = createResult.chartData!.id;
      const chart = advancedVisualizationService.getChart(chartId);

      expect(chart).toBeDefined();
      expect(chart?.id).toBe(chartId);
      expect(chart?.title).toBe('조회용 차트');
    });

    it('존재하지 않는 차트 ID에 대해 null을 반환해야 함', () => {
      const chart = advancedVisualizationService.getChart('non-existent-id');
      expect(chart).toBeNull();
    });
  });

  describe('getAllCharts', () => {
    it('모든 차트를 가져올 수 있어야 함', async () => {
      const request1: VisualizationRequest = {
        data: [{ date: '2024-01-01', value: 100 }],
        chartType: 'line',
        title: '차트 1'
      };

      const request2: VisualizationRequest = {
        data: [{ category: 'A', value: 30 }],
        chartType: 'bar',
        title: '차트 2'
      };

      await advancedVisualizationService.generateChart(request1);
      await advancedVisualizationService.generateChart(request2);

      const allCharts = advancedVisualizationService.getAllCharts();

      expect(Array.isArray(allCharts)).toBe(true);
      expect(allCharts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 데이터를 시각화할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { period: '2024 Q1', projects: 5, budget: 1000 },
          { period: '2024 Q2', projects: 7, budget: 1500 },
          { period: '2024 Q3', projects: 6, budget: 1300 }
        ],
        chartType: 'bar',
        title: '재개발 프로젝트 현황',
        description: '분기별 프로젝트 수와 예산'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData?.title).toBe('재개발 프로젝트 현황');
      expect(result.chartData?.data.length).toBeGreaterThan(0);
    });

    it('시공사 선정 관련 데이터를 시각화할 수 있어야 함', async () => {
      const request: VisualizationRequest = {
        data: [
          { company: '대우건설', score: 90 },
          { company: '삼성물산', score: 85 },
          { company: '현대건설', score: 88 }
        ],
        chartType: 'bar',
        title: '시공사 평가 점수'
      };

      const result = await advancedVisualizationService.generateChart(request);

      expect(result.success).toBe(true);
      expect(result.chartData).toBeDefined();
    });

    it('여러 차트를 생성하고 모두 조회할 수 있어야 함', async () => {
      const requests: VisualizationRequest[] = [
        {
          data: [{ date: '2024-01-01', value: 100 }],
          chartType: 'line',
          title: '차트 1'
        },
        {
          data: [{ category: 'A', value: 30 }],
          chartType: 'pie',
          title: '차트 2'
        },
        {
          data: [{ x: 10, y: 20 }],
          chartType: 'scatter',
          title: '차트 3'
        }
      ];

      const results = await Promise.all(
        requests.map(req => advancedVisualizationService.generateChart(req))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const allCharts = advancedVisualizationService.getAllCharts();
      expect(allCharts.length).toBeGreaterThanOrEqual(3);
    });
  });
});

