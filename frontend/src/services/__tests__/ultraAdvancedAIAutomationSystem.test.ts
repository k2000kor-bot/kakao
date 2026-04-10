/**
 * UltraAdvancedAIAutomationSystem 테스트
 */
import { UltraAdvancedAIAutomationSystem } from '../ultraAdvancedAIAutomationSystem';
import type { AutomationRule, AutomationWorkflow } from '../ultraAdvancedAIAutomationSystem';

const createRuleFixture = (overrides: Partial<AutomationRule> = {}): AutomationRule => ({
  id: 'test-rule-' + Date.now(),
  name: '테스트 규칙',
  description: '테스트용 규칙',
  type: 'trigger',
  status: 'active',
  priority: 'medium',
  conditions: {
    event_type: 'test_event',
    conditions: {},
    threshold: 0.5
  },
  actions: [
    {
      action_type: 'test_action',
      parameters: {},
      target_service: 'test-service'
    }
  ],
  created_at: new Date(),
  updated_at: new Date(),
  execution_count: 0,
  success_count: 0,
  last_executed: null,
  metadata: {
    author: 'test',
    version: '1.0.0',
    tags: [],
    performance_metrics: {
      average_execution_time: 0,
      success_rate: 0,
      error_rate: 0
    }
  },
  ...overrides
});

const createWorkflowFixture = (overrides: Partial<AutomationWorkflow> = {}): AutomationWorkflow => ({
  id: 'test-workflow-' + Date.now(),
  name: '테스트 워크플로우',
  description: '테스트용 워크플로우',
  steps: [
    {
      id: 'step-1',
      name: '데이터 처리',
      type: 'data_processing',
      parameters: { source: 'test' },
      dependencies: [],
      timeout: 5000,
      retry_count: 0,
      status: 'pending'
    }
  ],
  status: 'active',
  current_step: 0,
  created_at: new Date(),
  updated_at: new Date(),
  execution_history: [],
  metadata: {
    author: 'test',
    version: '1.0.0',
    tags: [],
    estimated_duration: 5000,
    complexity_score: 0.5
  },
  ...overrides
});

describe('UltraAdvancedAIAutomationSystem', () => {
  let service: UltraAdvancedAIAutomationSystem;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    service = new UltraAdvancedAIAutomationSystem();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(UltraAdvancedAIAutomationSystem);
    });

    it('초기화 완료 후 메트릭 조회 가능', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const metrics = service.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.total_rules).toBe('number');
      expect(typeof metrics.total_workflows).toBe('number');
    });
  });

  describe('규칙 관리', () => {
    it('규칙 생성', async () => {
      const rule = createRuleFixture();
      await service.createRule(rule);
      const retrieved = service.getRule(rule.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(rule.name);
    });

    it('규칙 목록 조회', async () => {
      const rule = createRuleFixture();
      await service.createRule(rule);
      const rules = service.getRules();
      expect(rules.some(r => r.id === rule.id)).toBe(true);
    });

    it('규칙 업데이트', async () => {
      const rule = createRuleFixture();
      await service.createRule(rule);
      await service.updateRule(rule.id, { name: '업데이트된 이름' });
      const retrieved = service.getRule(rule.id);
      expect(retrieved?.name).toBe('업데이트된 이름');
    });

    it('규칙 삭제', async () => {
      const rule = createRuleFixture();
      await service.createRule(rule);
      await service.deleteRule(rule.id);
      const retrieved = service.getRule(rule.id);
      expect(retrieved).toBeUndefined();
    });

    it('존재하지 않는 규칙 삭제 시 에러', async () => {
      await expect(service.deleteRule('nonexistent')).rejects.toThrow('찾을 수 없습니다');
    });
  });

  describe('워크플로우 관리', () => {
    it('워크플로우 생성', async () => {
      const workflow = createWorkflowFixture();
      await service.createWorkflow(workflow);
      const retrieved = service.getWorkflow(workflow.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(workflow.name);
    });

    it('워크플로우 목록 조회', async () => {
      const workflow = createWorkflowFixture();
      await service.createWorkflow(workflow);
      const workflows = service.getWorkflows();
      expect(workflows.some(w => w.id === workflow.id)).toBe(true);
    });

    it('워크플로우 업데이트', async () => {
      const workflow = createWorkflowFixture();
      await service.createWorkflow(workflow);
      await service.updateWorkflow(workflow.id, { status: 'paused' });
      const retrieved = service.getWorkflow(workflow.id);
      expect(retrieved?.status).toBe('paused');
    });

    it('워크플로우 삭제', async () => {
      const workflow = createWorkflowFixture();
      await service.createWorkflow(workflow);
      await service.deleteWorkflow(workflow.id);
      const retrieved = service.getWorkflow(workflow.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('워크플로우 실행', () => {
    it('활성 워크플로우 실행', async () => {
      const workflow = createWorkflowFixture();
      await service.createWorkflow(workflow);
      const execution = await service.executeWorkflow(workflow.id);
      expect(execution).toBeDefined();
      expect(execution.status).toBe('completed');
      expect(execution.workflow_id).toBe(workflow.id);
      expect(execution.steps_completed).toBe(workflow.steps.length);
    }, 15000);

    it('존재하지 않는 워크플로우 실행 시 에러', async () => {
      await expect(service.executeWorkflow('nonexistent')).rejects.toThrow('찾을 수 없습니다');
    });

    it('비활성 워크플로우 실행 시 에러', async () => {
      const workflow = createWorkflowFixture({ status: 'paused' });
      await service.createWorkflow(workflow);
      await expect(service.executeWorkflow(workflow.id)).rejects.toThrow('활성 상태가 아닙니다');
    });
  });

  describe('설정', () => {
    it('설정 조회', () => {
      const config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.auto_execution).toBeDefined();
      expect(config.max_concurrent_workflows).toBeDefined();
    });

    it('설정 업데이트', () => {
      service.updateConfig({ max_concurrent_workflows: 5 });
      const config = service.getConfig();
      expect(config.max_concurrent_workflows).toBe(5);
    });
  });
});
