/**
 * AIProjectManagementOptimizationSystem 테스트
 */

import aiProjectManagementOptimizationSystem, {
  AIProjectManagementOptimizationSystem,
  ProjectManagement,
  ProjectTask,
  ProjectRisk,
} from '../aiProjectManagementOptimizationSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AIProjectManagementOptimizationSystem', () => {
  let system: AIProjectManagementOptimizationSystem;

  beforeEach(() => {
    system = new AIProjectManagementOptimizationSystem();
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (system.isSystemRunning()) {
      system.stop();
    }
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('시스템 인스턴스 생성', () => {
      expect(system).toBeInstanceOf(AIProjectManagementOptimizationSystem);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiProjectManagementOptimizationSystem).toBeInstanceOf(
        AIProjectManagementOptimizationSystem
      );
    });
  });

  describe('시작/중지', () => {
    it('시스템 시작', () => {
      system.start();
      expect(system.isSystemRunning()).toBe(true);
    });

    it('시스템 중지', () => {
      system.start();
      expect(system.isSystemRunning()).toBe(true);

      system.stop();
      expect(system.isSystemRunning()).toBe(false);
    });

    it('이미 중지된 시스템 다시 중지', () => {
      system.stop();
      expect(system.isSystemRunning()).toBe(false);
    });
  });

  describe('프로젝트 관리', () => {
    it('프로젝트 생성', () => {
      const projectData: Omit<
        ProjectManagement,
        'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '테스트 프로젝트',
        description: '테스트 설명',
        type: 'development',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      };

      const project = system.createProject(projectData);

      expect(project).toBeDefined();
      expect(project.projectId).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.type).toBe(projectData.type);
      expect(project.status).toBe(projectData.status);
    });

    it('프로젝트 조회', () => {
      const projectData: Omit<
        ProjectManagement,
        'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '조회 테스트 프로젝트',
        description: '테스트',
        type: 'research',
        status: 'planning',
        priority: 'medium',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      };

      const created = system.createProject(projectData);
      const retrieved = system.getProject(created.projectId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.projectId).toBe(created.projectId);
      expect(retrieved?.name).toBe(projectData.name);
    });

    it('모든 프로젝트 조회', () => {
      const projects = system.getProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('존재하지 않는 프로젝트 조회', () => {
      const project = system.getProject('non-existent');
      expect(project).toBeUndefined();
    });
  });

  describe('태스크 관리', () => {
    it('태스크 추가', () => {
      const projectData: Omit<
        ProjectManagement,
        'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '태스크 테스트 프로젝트',
        description: '테스트',
        type: 'development',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      };

      const project = system.createProject(projectData);

      const task: ProjectTask = {
        taskId: 'task-1',
        name: '테스트 태스크',
        description: '태스크 설명',
        phaseId: 'phase-1',
        assigneeId: 'member-1',
        priority: 'high',
        status: 'todo',
        estimatedHours: 8,
        actualHours: 0,
        startDate: Date.now(),
        dueDate: Date.now() + 86400000,
        dependencies: [],
        tags: [],
        progress: 0,
        quality: 0,
        complexity: 'moderate',
      };

      system.addTask(project.projectId, task);

      const updatedProject = system.getProject(project.projectId);
      expect(updatedProject?.tasks.find((t) => t.taskId === 'task-1')).toBeDefined();
    });

    it('태스크 상태 업데이트', () => {
      const projectData: Omit<
        ProjectManagement,
        'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '태스크 상태 테스트',
        description: '테스트',
        type: 'development',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        phases: [],
        tasks: [
          {
            taskId: 'task-1',
            name: '태스크',
            description: '설명',
            phaseId: 'phase-1',
            assigneeId: 'member-1',
            priority: 'high',
            status: 'todo',
            estimatedHours: 8,
            actualHours: 0,
            startDate: Date.now(),
            dueDate: Date.now() + 86400000,
            dependencies: [],
            tags: [],
            progress: 0,
            quality: 0,
            complexity: 'moderate',
          },
        ],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      };

      const project = system.createProject(projectData);
      system.updateTaskStatus(project.projectId, 'task-1', 'in-progress');

      const updatedProject = system.getProject(project.projectId);
      const task = updatedProject?.tasks.find((t) => t.taskId === 'task-1');
      expect(task?.status).toBe('in-progress');
    });

    it('존재하지 않는 프로젝트의 태스크 추가', () => {
      const task: ProjectTask = {
        taskId: 'task-1',
        name: '테스트',
        description: '설명',
        phaseId: 'phase-1',
        assigneeId: 'member-1',
        priority: 'high',
        status: 'todo',
        estimatedHours: 8,
        actualHours: 0,
        startDate: Date.now(),
        dueDate: Date.now() + 86400000,
        dependencies: [],
        tags: [],
        progress: 0,
        quality: 0,
        complexity: 'moderate',
      };

      expect(() => {
        system.addTask('non-existent', task);
      }).not.toThrow();
    });
  });

  describe('리스크 관리', () => {
    it('리스크 추가', () => {
      const projectData: Omit<
        ProjectManagement,
        'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '리스크 테스트 프로젝트',
        description: '테스트',
        type: 'development',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      };

      const project = system.createProject(projectData);

      const risk: ProjectRisk = {
        riskId: 'risk-1',
        title: '테스트 리스크',
        description: '리스크 설명',
        category: 'technical',
        probability: 0.5,
        impact: 0.7,
        severity: 'high',
        status: 'identified',
        mitigationPlan: '완화 계획',
        contingencyPlan: '비상 계획',
        assignedTo: 'member-1',
        dueDate: Date.now() + 86400000,
      };

      system.addRisk(project.projectId, risk);

      const updatedProject = system.getProject(project.projectId);
      expect(updatedProject?.risks.find((r) => r.riskId === 'risk-1')).toBeDefined();
    });

    it('존재하지 않는 프로젝트에 리스크 추가', () => {
      const risk: ProjectRisk = {
        riskId: 'risk-1',
        title: '테스트',
        description: '설명',
        category: 'technical',
        probability: 0.5,
        impact: 0.7,
        severity: 'high',
        status: 'identified',
        mitigationPlan: '완화',
        contingencyPlan: '비상',
        assignedTo: 'member-1',
        dueDate: Date.now() + 86400000,
      };

      expect(() => {
        system.addRisk('non-existent', risk);
      }).not.toThrow();
    });
  });

  describe('분석 데이터', () => {
    it('분석 데이터 조회', () => {
      const analytics = system.getAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalProjects).toBe('number');
      expect(typeof analytics.activeProjects).toBe('number');
      expect(typeof analytics.averagePerformance).toBe('number');
      expect(typeof analytics.averageSchedulePerformance).toBe('number');
      expect(typeof analytics.averageCostPerformance).toBe('number');
      expect(typeof analytics.averageQualityPerformance).toBe('number');
      expect(typeof analytics.optimizationRate).toBe('number');
      expect(typeof analytics.riskMitigationRate).toBe('number');
      expect(typeof analytics.resourceUtilization).toBe('number');
      expect(typeof analytics.stakeholderSatisfaction).toBe('number');
    });
  });

  describe('다양한 프로젝트 타입', () => {
    it('개발 프로젝트 생성', () => {
      const project = system.createProject({
        name: '개발 프로젝트',
        description: '테스트',
        type: 'development',
        status: 'active',
        priority: 'high',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      });

      expect(project.type).toBe('development');
    });

    it('연구 프로젝트 생성', () => {
      const project = system.createProject({
        name: '연구 프로젝트',
        description: '테스트',
        type: 'research',
        status: 'active',
        priority: 'medium',
        teamId: 'team-1',
        phases: [],
        tasks: [],
        resources: [],
        risks: [],
        settings: {
          notifications: {
            enabled: true,
            channels: ['email'],
            frequency: 'daily',
          },
          privacy: {
            level: 'team',
            restrictions: [],
          },
          integration: {
            enabled: false,
            services: [],
          },
          performanceThresholds: {
            schedulePerformance: 0.8,
            costPerformance: 0.85,
            qualityPerformance: 0.9,
            resourcePerformance: 0.8,
            riskPerformance: 0.75,
          },
        },
      });

      expect(project.type).toBe('research');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiProjectManagementOptimizationSystem).toBeInstanceOf(
        AIProjectManagementOptimizationSystem
      );
    });
  });
});

