/**
 * UltraAdvancedAIQualityAssuranceSystem 테스트
 */
import ultraAdvancedAIQualityAssuranceSystem from '../ultraAdvancedAIQualityAssuranceSystem';

describe('UltraAdvancedAIQualityAssuranceSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const waitForInit = () => new Promise(resolve => setTimeout(resolve, 100));

  describe('getConfig', () => {
    it('설정 반환', () => {
      const config = ultraAdvancedAIQualityAssuranceSystem.getConfig();

      expect(config).toBeDefined();
      expect(config.auto_testing).toBe(true);
      expect(config.continuous_monitoring).toBe(true);
      expect(config.performance_thresholds).toBeDefined();
    });
  });

  describe('getTests', () => {
    it('테스트 목록 반환', async () => {
      await waitForInit();

      const tests = ultraAdvancedAIQualityAssuranceSystem.getTests();

      expect(Array.isArray(tests)).toBe(true);
      expect(tests.length).toBeGreaterThan(0);
      tests.forEach(t => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('type');
        expect(t).toHaveProperty('status');
      });
    });
  });

  describe('getMetrics', () => {
    it('메트릭 목록 반환', async () => {
      await waitForInit();

      const metrics = ultraAdvancedAIQualityAssuranceSystem.getMetrics();

      expect(Array.isArray(metrics)).toBe(true);
      metrics.forEach(m => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('value');
      });
    });
  });

  describe('getReports', () => {
    it('리포트 목록 반환', () => {
      const reports = ultraAdvancedAIQualityAssuranceSystem.getReports();
      expect(Array.isArray(reports)).toBe(true);
    });
  });

  describe('getSystemMetrics', () => {
    it('시스템 메트릭 반환', () => {
      const metrics = ultraAdvancedAIQualityAssuranceSystem.getSystemMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_tests).toBe('number');
      expect(typeof metrics.passed_tests).toBe('number');
      expect(typeof metrics.test_coverage).toBe('number');
    });
  });

  describe('createTest', () => {
    it('테스트 케이스 생성', async () => {
      const testId = await ultraAdvancedAIQualityAssuranceSystem.createTest({
        name: '커스텀 테스트',
        type: 'unit',
        status: 'pending',
        priority: 'medium',
        description: '설명',
        test_script: 'test()',
        expected_result: {},
        tags: [],
        dependencies: [],
        coverage: 80,
        reliability_score: 0.9
      });

      expect(testId).toMatch(/^test-/);

      const tests = ultraAdvancedAIQualityAssuranceSystem.getTests();
      const found = tests.find(t => t.id === testId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('커스텀 테스트');
    });
  });

  describe('runTest', () => {
    it('존재하지 않는 테스트 ID 시 에러', async () => {
      await expect(
        ultraAdvancedAIQualityAssuranceSystem.runTest('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });

    it('테스트 실행', async () => {
      await waitForInit();

      const tests = ultraAdvancedAIQualityAssuranceSystem.getTests();
      const pendingTest = tests.find(t => t.status === 'pending');
      if (!pendingTest) return;

      const result = await ultraAdvancedAIQualityAssuranceSystem.runTest(pendingTest.id);

      expect(result).toBeDefined();
      expect(['passed', 'failed']).toContain(result.status);
    }, 15000);
  });

  describe('updateMetric', () => {
    it('존재하지 않는 메트릭 ID 시 에러', async () => {
      await expect(
        ultraAdvancedAIQualityAssuranceSystem.updateMetric('nonexistent', 100)
      ).rejects.toThrow('찾을 수 없습니다');
    });

    it('메트릭 업데이트', async () => {
      await waitForInit();

      const metrics = ultraAdvancedAIQualityAssuranceSystem.getMetrics();
      const firstMetric = metrics[0];
      if (!firstMetric) return;

      await ultraAdvancedAIQualityAssuranceSystem.updateMetric(firstMetric.id, firstMetric.threshold.target);

      const updated = ultraAdvancedAIQualityAssuranceSystem.getMetrics().find(m => m.id === firstMetric.id);
      expect(updated?.value).toBe(firstMetric.threshold.target);
    });
  });
});
