/**
 * UltraAdvancedAIIntegrationManager 테스트
 */
import ultraAdvancedAIIntegrationManager from '../ultraAdvancedAIIntegrationManager';

jest.mock('../ultraAdvancedAIService', () => ({
  ultraAdvancedAIService: {
    performUltraAnalysis: jest.fn().mockResolvedValue({})
  }
}));

jest.mock('../ultraAdvancedAIOrchestrationService', () => ({
  __esModule: true,
  default: {
    createWorkflow: jest.fn().mockResolvedValue({ id: 'wf-1' }),
    createTask: jest.fn().mockResolvedValue('task-1')
  }
}));

describe('UltraAdvancedAIIntegrationManager', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getIntegrations', () => {
    it('등록된 통합 목록 반환', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const integrations = ultraAdvancedAIIntegrationManager.getIntegrations();

      expect(Array.isArray(integrations)).toBe(true);
      expect(integrations.length).toBeGreaterThan(0);
      integrations.forEach(i => {
        expect(i).toHaveProperty('id');
        expect(i).toHaveProperty('name');
        expect(i).toHaveProperty('type');
        expect(i).toHaveProperty('status');
      });
    });
  });

  describe('getIntegration', () => {
    it('ID로 통합 조회', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const integration = ultraAdvancedAIIntegrationManager.getIntegration('ultra-ai-service');

      expect(integration).toBeDefined();
      expect(integration?.id).toBe('ultra-ai-service');
    });

    it('존재하지 않는 ID는 undefined', () => {
      const result = ultraAdvancedAIIntegrationManager.getIntegration('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const metrics = ultraAdvancedAIIntegrationManager.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_integrations).toBe('number');
      expect(typeof metrics.active_integrations).toBe('number');
      expect(metrics.resource_usage).toBeDefined();
    });
  });

  describe('getEvents', () => {
    it('이벤트 목록 반환', () => {
      const events = ultraAdvancedAIIntegrationManager.getEvents(10);

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('getInitializationStatus', () => {
    it('초기화 상태 boolean 반환', async () => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const status = ultraAdvancedAIIntegrationManager.getInitializationStatus();

      expect(typeof status).toBe('boolean');
    });
  });

  describe('removeIntegration', () => {
    it('존재하지 않는 통합 제거 시 오류', async () => {
      await expect(
        ultraAdvancedAIIntegrationManager.removeIntegration('nonexistent')
      ).rejects.toThrow();
    });
  });
});
