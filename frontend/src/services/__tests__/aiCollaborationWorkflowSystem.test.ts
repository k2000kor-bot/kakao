/**
 * AICollaborationWorkflowSystem 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiCollaborationWorkflowSystem, {
  AICollaborationWorkflowSystem,
  CollaborationWorkflow,
} from '../aiCollaborationWorkflowSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AICollaborationWorkflowSystem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    if (aiCollaborationWorkflowSystem.isSystemRunning()) {
      aiCollaborationWorkflowSystem.stop();
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('시스템 시작/중지', () => {
    it('시스템 시작', () => {
      aiCollaborationWorkflowSystem.start();
      expect(aiCollaborationWorkflowSystem.isSystemRunning()).toBe(true);
    });

    it('시스템 중지', () => {
      aiCollaborationWorkflowSystem.start();
      expect(aiCollaborationWorkflowSystem.isSystemRunning()).toBe(true);

      aiCollaborationWorkflowSystem.stop();
      expect(aiCollaborationWorkflowSystem.isSystemRunning()).toBe(false);
    });

    it('이미 중지된 시스템 다시 중지', () => {
      aiCollaborationWorkflowSystem.stop();
      expect(aiCollaborationWorkflowSystem.isSystemRunning()).toBe(false);
    });
  });

  describe('워크플로우 추가', () => {
    it('워크플로우 추가', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '테스트 워크플로우',
        description: '테스트 설명',
        type: 'project',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        participants: [
          {
            participantId: 'participant-1',
            name: '테스트 참여자',
            role: 'owner',
            responsibilities: ['테스트'],
            permissions: ['read', 'write'],
            availability: {
              status: 'available',
              nextAvailable: Date.now(),
              workingHours: {
                start: '09:00',
                end: '18:00',
                days: ['monday', 'tuesday'],
                breaks: [],
              },
              timezone: 'Asia/Seoul',
              preferences: [],
            },
            performance: {
              completionRate: 0.9,
              qualityScore: 0.9,
              collaborationScore: 0.8,
              responsiveness: 0.9,
              initiative: 0.8,
              reliability: 0.9,
            },
          },
        ],
        stages: [],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const result = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      expect(result).toBeDefined();
      expect(result.workflowId).toBeDefined();
      expect(result.name).toBe(workflow.name);
    });

    it('스테이지가 있는 워크플로우 추가', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '스테이지 워크플로우',
        description: '테스트',
        type: 'project',
        status: 'active',
        priority: 'medium',
        teamId: 'team-1',
        participants: [],
        stages: [
          {
            stageId: 'stage-1',
            name: '스테이지 1',
            description: '테스트 스테이지',
            type: 'planning',
            status: 'pending',
            tasks: [],
            dependencies: [],
            estimatedDuration: 1,
            actualDuration: 0,
            startTime: 0,
            endTime: 0,
            automation: {
              enabled: false,
              autoTransition: false,
              smartRouting: false,
              bottleneckDetection: false,
              optimization: false,
              rules: [],
            },
            metrics: {
              completionRate: 0,
              averageDuration: 0,
              qualityScore: 0,
              participantSatisfaction: 0,
              efficiency: 0,
              bottlenecks: [],
            },
          },
        ],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const result = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      expect(result.stages.length).toBe(1);
    });
  });

  describe('워크플로우 조회', () => {
    it('모든 워크플로우 조회', () => {
      const workflows = aiCollaborationWorkflowSystem.getWorkflows();
      expect(Array.isArray(workflows)).toBe(true);
    });

    it('특정 워크플로우 조회', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '조회 테스트 워크플로우',
        description: '테스트',
        type: 'project',
        status: 'active',
        priority: 'low',
        teamId: 'team-1',
        participants: [],
        stages: [],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const added = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      const retrieved = aiCollaborationWorkflowSystem.getWorkflow(added.workflowId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.workflowId).toBe(added.workflowId);
      expect(retrieved?.name).toBe(workflow.name);
    });

    it('존재하지 않는 워크플로우 조회 시 undefined 반환', () => {
      const workflow = aiCollaborationWorkflowSystem.getWorkflow('non-existent');
      expect(workflow).toBeUndefined();
    });
  });

  describe('태스크 상태 업데이트', () => {
    it('태스크 상태 업데이트', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '태스크 테스트 워크플로우',
        description: '테스트',
        type: 'project',
        status: 'active',
        priority: 'medium',
        teamId: 'team-1',
        participants: [
          {
            participantId: 'participant-1',
            name: '테스트 참여자',
            role: 'contributor',
            responsibilities: [],
            permissions: ['read', 'write'],
            availability: {
              status: 'available',
              nextAvailable: Date.now(),
              workingHours: {
                start: '09:00',
                end: '18:00',
                days: ['monday'],
                breaks: [],
              },
              timezone: 'Asia/Seoul',
              preferences: [],
            },
            performance: {
              completionRate: 0.9,
              qualityScore: 0.9,
              collaborationScore: 0.8,
              responsiveness: 0.9,
              initiative: 0.8,
              reliability: 0.9,
            },
          },
        ],
        stages: [
          {
            stageId: 'stage-1',
            name: '스테이지 1',
            description: '테스트',
            type: 'execution',
            status: 'active',
            tasks: [
              {
                taskId: 'task-1',
                name: '태스크 1',
                description: '테스트 태스크',
                type: 'manual',
                status: 'pending',
                priority: 'high',
                assignee: 'participant-1',
                collaborators: [],
                estimatedEffort: 4,
                actualEffort: 0,
                startTime: 0,
                endTime: 0,
                dependencies: [],
                automation: {
                  enabled: false,
                  type: 'ai-assignment',
                  rules: [],
                  triggers: [],
                  actions: [],
                },
                quality: {
                  score: 0,
                  criteria: [],
                  feedback: [],
                  improvements: [],
                },
              },
            ],
            dependencies: [],
            estimatedDuration: 1,
            actualDuration: 0,
            startTime: Date.now(),
            endTime: 0,
            automation: {
              enabled: false,
              autoTransition: false,
              smartRouting: false,
              bottleneckDetection: false,
              optimization: false,
              rules: [],
            },
            metrics: {
              completionRate: 0,
              averageDuration: 0,
              qualityScore: 0,
              participantSatisfaction: 0,
              efficiency: 0,
              bottlenecks: [],
            },
          },
        ],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const added = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      aiCollaborationWorkflowSystem.updateTaskStatus(
        added.workflowId,
        'stage-1',
        'task-1',
        'in-progress'
      );

      const updated = aiCollaborationWorkflowSystem.getWorkflow(added.workflowId);
      const task = updated?.stages[0]?.tasks.find((t) => t.taskId === 'task-1');
      expect(task?.status).toBe('in-progress');
    });

    it('존재하지 않는 워크플로우의 태스크 상태 업데이트', () => {
      expect(() => {
        aiCollaborationWorkflowSystem.updateTaskStatus(
          'non-existent',
          'stage-1',
          'task-1',
          'in-progress'
        );
      }).not.toThrow();
    });
  });

  describe('메트릭 조회', () => {
    it('메트릭 조회', () => {
      const metrics = aiCollaborationWorkflowSystem.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalWorkflows).toBe('number');
      expect(typeof metrics.activeWorkflows).toBe('number');
      expect(typeof metrics.averageCompletionRate).toBe('number');
      expect(typeof metrics.averageEfficiency).toBe('number');
      expect(typeof metrics.automationRate).toBe('number');
    });

    it('메트릭 값 범위 확인', () => {
      const metrics = aiCollaborationWorkflowSystem.getMetrics();
      expect(metrics.totalWorkflows).toBeGreaterThanOrEqual(0);
      expect(metrics.activeWorkflows).toBeGreaterThanOrEqual(0);
      
      // 워크플로우가 있을 때만 평균값 확인
      if (!isNaN(metrics.averageCompletionRate)) {
        expect(metrics.averageCompletionRate).toBeGreaterThanOrEqual(0);
        expect(metrics.averageCompletionRate).toBeLessThanOrEqual(1);
      }
      
      if (!isNaN(metrics.averageEfficiency)) {
        expect(metrics.averageEfficiency).toBeGreaterThanOrEqual(0);
      }
      
      // 기본 메트릭들은 항상 숫자여야 함
      expect(typeof metrics.automationRate).toBe('number');
      expect(typeof metrics.qualityScore).toBe('number');
      expect(typeof metrics.participantSatisfaction).toBe('number');
      expect(typeof metrics.optimizationOpportunities).toBe('number');
    });
  });

  describe('다양한 워크플로우 타입', () => {
    it('미팅 타입 워크플로우 추가', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '미팅 워크플로우',
        description: '테스트',
        type: 'meeting',
        status: 'active',
        priority: 'medium',
        teamId: 'team-1',
        participants: [],
        stages: [],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 3600000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const result = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      expect(result.type).toBe('meeting');
    });

    it('결정 타입 워크플로우 추가', () => {
      const workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'> = {
        name: '결정 워크플로우',
        description: '테스트',
        type: 'decision',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        participants: [],
        stages: [],
        currentStage: 0,
        timeline: {
          startDate: Date.now(),
          endDate: Date.now() + 86400000,
          milestones: [],
          deadlines: [],
          dependencies: [],
          optimization: {
            enabled: false,
            suggestions: [],
            improvements: [],
          },
        },
        automation: {
          enabled: false,
          rules: [],
          triggers: [],
          actions: [],
        },
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'real-time',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
        },
      };

      const result = aiCollaborationWorkflowSystem.addWorkflow(workflow);
      expect(result.type).toBe('decision');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiCollaborationWorkflowSystem).toBeInstanceOf(
        AICollaborationWorkflowSystem
      );
    });
  });
});

