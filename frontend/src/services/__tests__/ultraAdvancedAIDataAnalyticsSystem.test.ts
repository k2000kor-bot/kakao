/**
 * UltraAdvancedAIDataAnalyticsSystem 테스트
 */
import ultraAdvancedAIDataAnalyticsSystem from '../ultraAdvancedAIDataAnalyticsSystem';

describe('UltraAdvancedAIDataAnalyticsSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getConfig', () => {
    it('설정 반환', () => {
      const config = ultraAdvancedAIDataAnalyticsSystem.getConfig();

      expect(config).toBeDefined();
      expect(config.auto_analysis).toBe(true);
      expect(config.data_retention_days).toBe(90);
      expect(config.alert_thresholds).toBeDefined();
    });

    it('설정에 machine_learning, visualization_settings 포함', () => {
      const config = ultraAdvancedAIDataAnalyticsSystem.getConfig();
      expect(config.machine_learning).toBeDefined();
      expect(config.machine_learning?.auto_feature_selection).toBeDefined();
      expect(config.visualization_settings).toBeDefined();
      expect(config.visualization_settings?.default_chart_type).toBe('line');
    });
  });

  describe('updateConfig', () => {
    it('설정 일부 업데이트', async () => {
      const before = ultraAdvancedAIDataAnalyticsSystem.getConfig();
      await ultraAdvancedAIDataAnalyticsSystem.updateConfig({ data_retention_days: 30 });
      const after = ultraAdvancedAIDataAnalyticsSystem.getConfig();
      expect(after.data_retention_days).toBe(30);
      expect(after.auto_analysis).toBe(before.auto_analysis);
      // 원복
      await ultraAdvancedAIDataAnalyticsSystem.updateConfig({ data_retention_days: 90 });
    });
  });

  describe('createDataSource', () => {
    it('데이터 소스 생성', async () => {
      const sourceId = await ultraAdvancedAIDataAnalyticsSystem.createDataSource({
        name: '테스트 소스',
        type: 'api',
        connection_string: 'http://api.example.com',
        schema: {},
        status: 'active',
        data_volume: 1000,
        update_frequency: 'hourly',
        description: '테스트',
        tags: ['test']
      });

      expect(sourceId).toMatch(/^source-/);

      const sources = ultraAdvancedAIDataAnalyticsSystem.getDataSources();
      const found = sources.find(s => s.id === sourceId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('테스트 소스');
    });
  });

  describe('createAnalysis', () => {
    it('분석 작업 생성', async () => {
      const analysisId = await ultraAdvancedAIDataAnalyticsSystem.createAnalysis({
        name: '테스트 분석',
        type: 'descriptive',
        data_sources: ['source-1'],
        algorithm: 'clustering',
        parameters: {},
        created_by: 'user-1'
      });

      expect(analysisId).toMatch(/^analysis-/);

      const analyses = ultraAdvancedAIDataAnalyticsSystem.getAnalyses();
      const found = analyses.find(a => a.id === analysisId);
      expect(found).toBeDefined();
      expect(found?.status).toBe('pending');
    });
  });

  describe('runAnalysis', () => {
    it('존재하지 않는 분석 ID 시 에러', async () => {
      await expect(
        ultraAdvancedAIDataAnalyticsSystem.runAnalysis('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });

    it('분석 실행 완료', async () => {
      const analysisId = await ultraAdvancedAIDataAnalyticsSystem.createAnalysis({
        name: '실행 테스트',
        type: 'predictive',
        data_sources: [],
        algorithm: 'regression',
        parameters: {},
        created_by: 'user-1'
      });

      const result = await ultraAdvancedAIDataAnalyticsSystem.runAnalysis(analysisId);

      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    }, 15000);
  });

  describe('getDataSources', () => {
    it('데이터 소스 목록 반환', () => {
      const sources = ultraAdvancedAIDataAnalyticsSystem.getDataSources();
      expect(Array.isArray(sources)).toBe(true);
    });
  });

  describe('getAnalyses', () => {
    it('분석 목록 반환', () => {
      const analyses = ultraAdvancedAIDataAnalyticsSystem.getAnalyses();
      expect(Array.isArray(analyses)).toBe(true);
    });
  });

  describe('getVisualizations', () => {
    it('시각화 목록 반환', () => {
      const viz = ultraAdvancedAIDataAnalyticsSystem.getVisualizations();
      expect(Array.isArray(viz)).toBe(true);
    });
  });

  describe('getInsights', () => {
    it('인사이트 목록 반환', () => {
      const insights = ultraAdvancedAIDataAnalyticsSystem.getInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('getSystemMetrics', () => {
    it('시스템 메트릭 반환', () => {
      const metrics = ultraAdvancedAIDataAnalyticsSystem.getSystemMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_data_sources).toBe('number');
      expect(typeof metrics.completed_analyses).toBe('number');
    });
  });

  describe('updateMetrics', () => {
    it('메트릭 갱신 후 last_updated 갱신됨', async () => {
      const before = ultraAdvancedAIDataAnalyticsSystem.getSystemMetrics().last_updated;
      await new Promise(r => setTimeout(r, 10));
      await ultraAdvancedAIDataAnalyticsSystem.updateMetrics();
      const after = ultraAdvancedAIDataAnalyticsSystem.getSystemMetrics().last_updated;
      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
    });
  });

  describe('runPendingAnalyses', () => {
    it('호출 시 예외 없음', async () => {
      await expect(ultraAdvancedAIDataAnalyticsSystem.runPendingAnalyses()).resolves.not.toThrow();
    });
  });

  describe('generateInsights', () => {
    it('호출 시 예외 없음', async () => {
      await expect(ultraAdvancedAIDataAnalyticsSystem.generateInsights()).resolves.not.toThrow();
    });
  });

  describe('이벤트', () => {
    it('createDataSource 시 data_source_created 이벤트 발생', async () => {
      const handler = jest.fn();
      ultraAdvancedAIDataAnalyticsSystem.on('data_source_created', handler);

      await ultraAdvancedAIDataAnalyticsSystem.createDataSource({
        name: '이벤트 테스트 소스',
        type: 'file',
        connection_string: 'file:///tmp/test',
        schema: {},
        status: 'active',
        data_volume: 100,
        update_frequency: 'daily',
        description: '이벤트 테스트',
        tags: ['event-test']
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toMatchObject({ name: '이벤트 테스트 소스' });
      ultraAdvancedAIDataAnalyticsSystem.off('data_source_created', handler);
    });
  });

  describe('createVisualization', () => {
    it('시각화 생성', async () => {
      const vizId = await ultraAdvancedAIDataAnalyticsSystem.createVisualization({
        name: '테스트 차트',
        type: 'chart',
        chart_type: 'line',
        data_source: 'source-1',
        configuration: {},
        filters: [],
        refresh_rate: 60,
        is_public: false,
        created_by: 'user-1'
      });

      expect(vizId).toMatch(/^viz-/);

      const viz = ultraAdvancedAIDataAnalyticsSystem.getVisualizations();
      const found = viz.find(v => v.id === vizId);
      expect(found).toBeDefined();
    });
  });
});
