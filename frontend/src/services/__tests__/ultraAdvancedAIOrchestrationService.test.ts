/**
 * UltraAdvancedAIOrchestrationService 테스트
 */
import ultraAdvancedAIOrchestrationService from '../ultraAdvancedAIOrchestrationService';

describe('UltraAdvancedAIOrchestrationService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createTask', () => {
    it('작업 생성 후 ID 반환', async () => {
      const taskId = await ultraAdvancedAIOrchestrationService.createTask(
        'analysis',
        { data: 'test' },
        'medium'
      );

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
      expect(taskId).toMatch(/^task-/);

      const task = ultraAdvancedAIOrchestrationService.getTaskById(taskId);
      expect(task).toBeDefined();
      expect(task?.type).toBe('analysis');
      expect(task?.status).toBe('pending');
    });
  });

  describe('getTasks', () => {
    it('작업 목록 반환', async () => {
      await ultraAdvancedAIOrchestrationService.createTask('optimization', { x: 1 });
      const tasks = ultraAdvancedAIOrchestrationService.getTasks();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(t => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('type');
        expect(t).toHaveProperty('status');
      });
    });
  });

  describe('getTaskById', () => {
    it('ID로 작업 조회', async () => {
      const taskId = await ultraAdvancedAIOrchestrationService.createTask('learning', {});
      const task = ultraAdvancedAIOrchestrationService.getTaskById(taskId);

      expect(task).toBeDefined();
      expect(task?.id).toBe(taskId);
      expect(task?.type).toBe('learning');
    });

    it('존재하지 않는 ID는 undefined', () => {
      const result = ultraAdvancedAIOrchestrationService.getTaskById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('createWorkflow', () => {
    it('워크플로우 생성', async () => {
      const workflowId = await ultraAdvancedAIOrchestrationService.createWorkflow(
        '테스트 워크플로우',
        '설명',
        [
          { type: 'analysis', priority: 'high', input: {} },
          { type: 'synthesis', priority: 'medium', input: {} }
        ]
      );

      expect(workflowId).toBeDefined();
      expect(workflowId).toMatch(/^workflow-/);

      const workflow = ultraAdvancedAIOrchestrationService.getWorkflowById(workflowId);
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe('테스트 워크플로우');
      expect(workflow?.steps.length).toBe(2);
    });
  });

  describe('getWorkflows', () => {
    it('워크플로우 목록 반환', async () => {
      await ultraAdvancedAIOrchestrationService.createWorkflow('W1', 'Desc', [
        { type: 'prediction', priority: 'low', input: {} }
      ]);
      const workflows = ultraAdvancedAIOrchestrationService.getWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
      workflows.forEach(w => {
        expect(w).toHaveProperty('id');
        expect(w).toHaveProperty('name');
        expect(w).toHaveProperty('status');
      });
    });
  });

  describe('getWorkflowById', () => {
    it('ID로 워크플로우 조회', async () => {
      const workflowId = await ultraAdvancedAIOrchestrationService.createWorkflow(
        '조회 테스트',
        'desc',
        [{ type: 'analysis', priority: 'medium', input: {} }]
      );
      const workflow = ultraAdvancedAIOrchestrationService.getWorkflowById(workflowId);

      expect(workflow).toBeDefined();
      expect(workflow?.id).toBe(workflowId);
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAIOrchestrationService.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_tasks).toBe('number');
      expect(typeof metrics.completed_tasks).toBe('number');
      expect(metrics.resource_utilization).toBeDefined();
      expect(['excellent', 'good', 'fair', 'poor']).toContain(metrics.system_health);
    });
  });

  describe('pauseWorkflow', () => {
    it('워크플로우 일시정지', async () => {
      const workflowId = await ultraAdvancedAIOrchestrationService.createWorkflow(
        '일시정지 테스트',
        'desc',
        [{ type: 'analysis', priority: 'medium', input: {} }]
      );

      ultraAdvancedAIOrchestrationService.pauseWorkflow(workflowId);

      const workflow = ultraAdvancedAIOrchestrationService.getWorkflowById(workflowId);
      expect(workflow?.status).toBe('paused');
    });
  });

  describe('resumeWorkflow', () => {
    it('워크플로우 재개', async () => {
      const workflowId = await ultraAdvancedAIOrchestrationService.createWorkflow(
        '재개 테스트',
        'desc',
        [{ type: 'analysis', priority: 'medium', input: {} }]
      );

      ultraAdvancedAIOrchestrationService.pauseWorkflow(workflowId);
      ultraAdvancedAIOrchestrationService.resumeWorkflow(workflowId);

      const workflow = ultraAdvancedAIOrchestrationService.getWorkflowById(workflowId);
      expect(workflow?.status).toBe('active');
    });
  });

  describe('cancelTask', () => {
    it('pending 작업 취소', async () => {
      const taskId = await ultraAdvancedAIOrchestrationService.createTask(
        'synthesis',
        {},
        'low'
      );

      ultraAdvancedAIOrchestrationService.cancelTask(taskId);

      const task = ultraAdvancedAIOrchestrationService.getTaskById(taskId);
      expect(task?.status).toBe('failed');
      expect(task?.metadata.error).toContain('cancelled');
    });
  });

  describe('clearCompletedTasks', () => {
    it('완료/실패 작업 정리', () => {
      const countBefore = ultraAdvancedAIOrchestrationService.getTasks().length;
      ultraAdvancedAIOrchestrationService.clearCompletedTasks();
      const countAfter = ultraAdvancedAIOrchestrationService.getTasks().length;

      expect(countAfter).toBeLessThanOrEqual(countBefore);
    });
  });
});
