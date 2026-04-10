/**
 * UltraAdvancedAICognitiveArchitectureSystem 테스트
 */
import ultraAdvancedAICognitiveArchitectureSystem from '../ultraAdvancedAICognitiveArchitectureSystem';
import type { CognitiveModule, CognitiveProcess } from '../ultraAdvancedAICognitiveArchitectureSystem';

describe('UltraAdvancedAICognitiveArchitectureSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const waitForInit = () => new Promise(resolve => setTimeout(resolve, 600));

  describe('isInitialized', () => {
    it('초기화 완료 시 true', () => {
      expect(ultraAdvancedAICognitiveArchitectureSystem.isInitialized()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('설정 객체 반환', () => {
      const config = ultraAdvancedAICognitiveArchitectureSystem.getConfig();

      expect(config).toBeDefined();
      expect(typeof config.auto_learning).toBe('boolean');
      expect(typeof config.adaptive_reasoning).toBe('boolean');
    });
  });

  describe('updateConfig', () => {
    it('설정 업데이트', () => {
      ultraAdvancedAICognitiveArchitectureSystem.updateConfig({ auto_learning: false });
      const config = ultraAdvancedAICognitiveArchitectureSystem.getConfig();
      expect(config.auto_learning).toBe(false);

      ultraAdvancedAICognitiveArchitectureSystem.updateConfig({ auto_learning: true });
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAICognitiveArchitectureSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_modules).toBe('number');
      expect(typeof metrics.active_modules).toBe('number');
      expect(typeof metrics.total_processes).toBe('number');
    });
  });

  describe('getModules', () => {
    it('모듈 목록 반환 (비동기 초기화 후)', async () => {
      await waitForInit();

      const modules = ultraAdvancedAICognitiveArchitectureSystem.getModules();

      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
      modules.forEach((m: CognitiveModule) => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('type');
        expect(m).toHaveProperty('status');
      });
    });
  });

  describe('getModule', () => {
    it('ID로 모듈 조회', async () => {
      await waitForInit();

      const module = ultraAdvancedAICognitiveArchitectureSystem.getModule('perception-module');

      expect(module).toBeDefined();
      expect(module?.id).toBe('perception-module');
      expect(module?.name).toBe('지각 모듈');
    });

    it('존재하지 않는 ID는 undefined', () => {
      const result = ultraAdvancedAICognitiveArchitectureSystem.getModule('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getProcesses', () => {
    it('프로세스 목록 반환', async () => {
      await waitForInit();

      const processes = ultraAdvancedAICognitiveArchitectureSystem.getProcesses();

      expect(Array.isArray(processes)).toBe(true);
      expect(processes.length).toBeGreaterThan(0);
      processes.forEach((p: CognitiveProcess) => {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('status');
      });
    });
  });

  describe('getProcess', () => {
    it('ID로 프로세스 조회', async () => {
      await waitForInit();

      const process = ultraAdvancedAICognitiveArchitectureSystem.getProcess('comprehensive-analysis-process');

      expect(process).toBeDefined();
      expect(process?.id).toBe('comprehensive-analysis-process');
    });
  });

  describe('createModule', () => {
    it('새 모듈 생성', async () => {
      const customModule: CognitiveModule = {
        id: 'test-module',
        name: '테스트 모듈',
        type: 'reasoning',
        status: 'active',
        confidence: 0.9,
        processing_time: 100,
        metadata: {
          description: '테스트',
          version: '1.0',
          last_updated: new Date(),
          performance_metrics: { accuracy: 0.9, efficiency: 0.9, reliability: 0.9 }
        }
      };

      await ultraAdvancedAICognitiveArchitectureSystem.createModule(customModule);

      const found = ultraAdvancedAICognitiveArchitectureSystem.getModule('test-module');
      expect(found).toBeDefined();
      expect(found?.name).toBe('테스트 모듈');

      await ultraAdvancedAICognitiveArchitectureSystem.deleteModule('test-module');
    });
  });

  describe('generateInsight', () => {
    it('인사이트 생성', async () => {
      const insight = await ultraAdvancedAICognitiveArchitectureSystem.generateInsight(
        { pattern: 'test' },
        'pattern'
      );

      expect(insight).toBeDefined();
      expect(insight.type).toBe('pattern');
      expect(typeof insight.confidence).toBe('number');
      expect(insight).toHaveProperty('id');
    });
  });

  describe('executeProcess', () => {
    it('프로세스 실행', async () => {
      await waitForInit();

      const result = await ultraAdvancedAICognitiveArchitectureSystem.executeProcess(
        'comprehensive-analysis-process',
        { input: 'test' }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
