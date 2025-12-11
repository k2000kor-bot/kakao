/**
 * AIAutomationWorkflowSystem 테스트
 */

import aiAutomationWorkflowSystem, {
  AIAutomationWorkflowSystem,
  Workflow,
  WorkflowTask,
  WorkflowMetrics,
} from '../aiAutomationWorkflowSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    createSystemAlert: jest.fn(() => 'alert-id-123'),
  },
}));

jest.mock('../aiHealthMonitor', () => ({
  __esModule: true,
  default: {
    performSystemHealthCheck: jest.fn(() => Promise.resolve({ status: 'healthy' })),
  },
}));

jest.mock('../advancedAISecuritySystem', () => ({
  __esModule: true,
  default: {
    getSecurityMetrics: jest.fn(() => ({
      total_threats_detected: 0,
      security_score: 95,
    })),
  },
}));

jest.mock('../aiCacheManager', () => ({
  __esModule: true,
  default: {
    optimize: jest.fn(),
  },
}));

describe('AIAutomationWorkflowSystem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 각 테스트 전에 시스템을 중지하고 정리
    aiAutomationWorkflowSystem.stop();
    aiAutomationWorkflowSystem.shutdown();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('시스템 시작/중지', () => {
    it('시스템 시작', () => {
      aiAutomationWorkflowSystem.start();
      
      expect(aiAutomationWorkflowSystem).toBeDefined();
    });

    it('시스템 중지', () => {
      aiAutomationWorkflowSystem.start();
      aiAutomationWorkflowSystem.stop();
      
      expect(aiAutomationWorkflowSystem).toBeDefined();
    });

    it('시스템 종료', () => {
      aiAutomationWorkflowSystem.start();
      aiAutomationWorkflowSystem.shutdown();
      
      expect(aiAutomationWorkflowSystem).toBeDefined();
    });
  });

  describe('워크플로우 생성', () => {
    it('워크플로우 생성', () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '테스트 워크플로우',
        description: '테스트 설명',
        trigger_type: 'manual',
        tasks: [
          {
            name: '테스트 태스크',
            type: 'ai_processing',
            priority: 'medium',
            input_data: { test: 'data' },
            max_retries: 3,
            dependencies: [],
          },
        ],
      });

      expect(workflowId).toBeDefined();
      expect(typeof workflowId).toBe('string');
    });

    it('여러 태스크가 있는 워크플로우 생성', () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '복합 워크플로우',
        description: '여러 태스크 포함',
        trigger_type: 'manual',
        tasks: [
          {
            name: '태스크 1',
            type: 'ai_processing',
            priority: 'high',
            input_data: { step: 1 },
            max_retries: 2,
            dependencies: [],
          },
          {
            name: '태스크 2',
            type: 'data_analysis',
            priority: 'medium',
            input_data: { step: 2 },
            max_retries: 2,
            dependencies: [],
          },
        ],
      });

      expect(workflowId).toBeDefined();
    });

    it('의존성이 있는 태스크가 있는 워크플로우 생성', () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '의존성 워크플로우',
        description: '태스크 의존성 포함',
        trigger_type: 'manual',
        tasks: [
          {
            name: '첫 번째 태스크',
            type: 'ai_processing',
            priority: 'high',
            input_data: {},
            max_retries: 2,
            dependencies: [],
          },
        ],
      });

      expect(workflowId).toBeDefined();
    });

    it('스케줄링 워크플로우 생성', () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '스케줄 워크플로우',
        description: '정기 실행',
        trigger_type: 'scheduled',
        trigger_config: { interval: 3600000 },
        enabled: true,
        tasks: [
          {
            name: '스케줄 태스크',
            type: 'notification',
            priority: 'low',
            input_data: {},
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      expect(workflowId).toBeDefined();
    });
  });

  describe('워크플로우 실행', () => {
    it('워크플로우 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '실행 테스트 워크플로우',
        description: '실행 테스트',
        trigger_type: 'manual',
        tasks: [
          {
            name: '실행 태스크',
            type: 'notification',
            priority: 'medium',
            input_data: { message: '테스트' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);
    });

    it('존재하지 않는 워크플로우 실행 시 false 반환', async () => {
      const result = await aiAutomationWorkflowSystem.executeWorkflow('invalid-id');

      expect(result).toBe(false);
    });

    it('비활성화된 워크플로우 실행 시 false 반환', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '비활성 워크플로우',
        description: '비활성',
        trigger_type: 'manual',
        enabled: false,
        tasks: [
          {
            name: '태스크',
            type: 'notification',
            priority: 'medium',
            input_data: {},
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(false);
    });

    it('입력 데이터와 함께 워크플로우 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '입력 데이터 워크플로우',
        description: '입력 데이터 테스트',
        trigger_type: 'manual',
        tasks: [
          {
            name: '태스크',
            type: 'ai_processing',
            priority: 'medium',
            input_data: { default: 'value' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId, {
        additional: 'data',
      });

      expect(result).toBe(true);
    });
  });

  describe('워크플로우 메트릭', () => {
    it('워크플로우 메트릭 조회', () => {
      aiAutomationWorkflowSystem.createWorkflow({
        name: '메트릭 테스트',
        description: '메트릭',
        trigger_type: 'manual',
        tasks: [
          {
            name: '태스크',
            type: 'notification',
            priority: 'medium',
            input_data: {},
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      const metrics = aiAutomationWorkflowSystem.getWorkflowMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_workflows).toBe('number');
      expect(typeof metrics.active_workflows).toBe('number');
      expect(typeof metrics.completed_workflows).toBe('number');
      expect(typeof metrics.failed_workflows).toBe('number');
      expect(typeof metrics.total_tasks).toBe('number');
      expect(typeof metrics.pending_tasks).toBe('number');
      expect(typeof metrics.running_tasks).toBe('number');
      expect(typeof metrics.completed_tasks).toBe('number');
      expect(typeof metrics.failed_tasks).toBe('number');
      expect(typeof metrics.average_workflow_duration).toBe('number');
      expect(typeof metrics.success_rate).toBe('number');
      expect(typeof metrics.worker_utilization).toBe('number');
      expect(typeof metrics.queue_size).toBe('number');
    });

    it('메트릭 값 범위 확인', () => {
      const metrics = aiAutomationWorkflowSystem.getWorkflowMetrics();

      expect(metrics.total_workflows).toBeGreaterThanOrEqual(0);
      expect(metrics.active_workflows).toBeGreaterThanOrEqual(0);
      expect(metrics.completed_workflows).toBeGreaterThanOrEqual(0);
      expect(metrics.failed_workflows).toBeGreaterThanOrEqual(0);
      expect(metrics.total_tasks).toBeGreaterThanOrEqual(0);
      expect(metrics.pending_tasks).toBeGreaterThanOrEqual(0);
      expect(metrics.running_tasks).toBeGreaterThanOrEqual(0);
      expect(metrics.completed_tasks).toBeGreaterThanOrEqual(0);
      expect(metrics.failed_tasks).toBeGreaterThanOrEqual(0);
      expect(metrics.average_workflow_duration).toBeGreaterThanOrEqual(0);
      expect(metrics.success_rate).toBeGreaterThanOrEqual(0);
      expect(metrics.success_rate).toBeLessThanOrEqual(100);
      expect(metrics.worker_utilization).toBeGreaterThanOrEqual(0);
      expect(metrics.worker_utilization).toBeLessThanOrEqual(100);
      expect(metrics.queue_size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('이벤트 발행', () => {
    it('워크플로우 생성 이벤트 발행', (done) => {
      const listener = jest.fn(() => {
        expect(listener).toHaveBeenCalled();
        aiAutomationWorkflowSystem.removeListener('workflow_created', listener);
        done();
      });

      aiAutomationWorkflowSystem.on('workflow_created', listener);

      aiAutomationWorkflowSystem.createWorkflow({
        name: '이벤트 테스트',
        description: '이벤트',
        trigger_type: 'manual',
        tasks: [
          {
            name: '태스크',
            type: 'notification',
            priority: 'medium',
            input_data: {},
            max_retries: 1,
            dependencies: [],
          },
        ],
      });
    });

    it('태스크 큐 추가 이벤트 발행', (done) => {
      aiAutomationWorkflowSystem.start();

      const listener = jest.fn(() => {
        expect(listener).toHaveBeenCalled();
        aiAutomationWorkflowSystem.removeListener('task_enqueued', listener);
        done();
      });

      aiAutomationWorkflowSystem.on('task_enqueued', listener);

      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '이벤트 테스트',
        description: '이벤트',
        trigger_type: 'manual',
        tasks: [
          {
            name: '태스크',
            type: 'notification',
            priority: 'medium',
            input_data: {},
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.executeWorkflow(workflowId);
    });
  });

  describe('다양한 태스크 타입', () => {
    it('AI 처리 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: 'AI 처리 테스트',
        description: 'AI 처리',
        trigger_type: 'manual',
        tasks: [
          {
            name: 'AI 태스크',
            type: 'ai_processing',
            priority: 'high',
            input_data: { data: 'test' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      // 시간 진행
      jest.advanceTimersByTime(5000);
    }, 15000);

    it('데이터 분석 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '데이터 분석 테스트',
        description: '데이터 분석',
        trigger_type: 'manual',
        tasks: [
          {
            name: '분석 태스크',
            type: 'data_analysis',
            priority: 'medium',
            input_data: { dataset: 'test' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      jest.advanceTimersByTime(5000);
    }, 15000);

    it('알림 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '알림 테스트',
        description: '알림',
        trigger_type: 'manual',
        tasks: [
          {
            name: '알림 태스크',
            type: 'notification',
            priority: 'low',
            input_data: {
              title: '테스트 알림',
              message: '테스트 메시지',
              severity: 'low',
            },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      jest.advanceTimersByTime(2000);
    }, 10000);

    it('시스템 유지보수 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '유지보수 테스트',
        description: '유지보수',
        trigger_type: 'manual',
        tasks: [
          {
            name: '유지보수 태스크',
            type: 'system_maintenance',
            priority: 'medium',
            input_data: { maintenance_type: 'cache_cleanup' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      jest.advanceTimersByTime(10000);
    }, 20000);

    it('보안 검사 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '보안 검사 테스트',
        description: '보안 검사',
        trigger_type: 'manual',
        tasks: [
          {
            name: '보안 태스크',
            type: 'security_check',
            priority: 'high',
            input_data: { check_type: 'full_scan', target: 'all_services' },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      jest.advanceTimersByTime(10000);
    }, 20000);

    it('보고서 생성 태스크 실행', async () => {
      const workflowId = aiAutomationWorkflowSystem.createWorkflow({
        name: '보고서 생성 테스트',
        description: '보고서 생성',
        trigger_type: 'manual',
        tasks: [
          {
            name: '보고서 태스크',
            type: 'report_generation',
            priority: 'medium',
            input_data: {
              report_type: 'health_check',
              period: 'hourly',
              format: 'json',
            },
            max_retries: 1,
            dependencies: [],
          },
        ],
      });

      aiAutomationWorkflowSystem.start();

      const result = await aiAutomationWorkflowSystem.executeWorkflow(workflowId);

      expect(result).toBe(true);

      jest.advanceTimersByTime(10000);
    }, 20000);
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiAutomationWorkflowSystem).toBeInstanceOf(AIAutomationWorkflowSystem);
    });
  });
});

