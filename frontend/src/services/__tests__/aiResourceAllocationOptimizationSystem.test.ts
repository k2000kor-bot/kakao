/**
 * AIResourceAllocationOptimizationSystem 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiResourceAllocationOptimizationSystem, {
  AIResourceAllocationOptimizationSystem,
  ResourceAllocation,
  Resource,
} from '../aiResourceAllocationOptimizationSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AIResourceAllocationOptimizationSystem', () => {
  let system: AIResourceAllocationOptimizationSystem;

  beforeEach(() => {
    system = new AIResourceAllocationOptimizationSystem();
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
      expect(system).toBeInstanceOf(AIResourceAllocationOptimizationSystem);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiResourceAllocationOptimizationSystem).toBeInstanceOf(
        AIResourceAllocationOptimizationSystem
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

  describe('리소스 관리', () => {
    const mockResource: Resource = {
      resourceId: 'resource-1',
      name: '테스트 리소스',
      type: 'human',
      category: 'dedicated',
      capacity: {
        total: 40,
        available: 32,
        allocated: 8,
        reserved: 0,
        unit: 'hours/week',
        scalable: false,
        maxScale: 50,
        minThreshold: 20,
      },
      availability: {
        schedule: [],
        timeZone: 'Asia/Seoul',
        workingHours: {
          monday: [{ start: '09:00', end: '18:00', available: true }],
          tuesday: [{ start: '09:00', end: '18:00', available: true }],
          wednesday: [{ start: '09:00', end: '18:00', available: true }],
          thursday: [{ start: '09:00', end: '18:00', available: true }],
          friday: [{ start: '09:00', end: '18:00', available: true }],
          saturday: [],
          sunday: [],
        },
        holidays: [],
        constraints: [],
        flexibility: 0.7,
      },
      cost: {
        hourlyRate: 50000,
        dailyRate: 400000,
        monthlyRate: 8000000,
        setupCost: 0,
        maintenanceCost: 0,
        currency: 'KRW',
        variableCosts: [],
      },
      skills: [],
      location: '서울',
      department: '개발팀',
      manager: 'manager-1',
      utilization: {
        current: 0.2,
        average: 0.8,
        peak: 0.95,
        target: 0.85,
        efficiency: 0.9,
        trends: [],
      },
      performance: {
        quality: 0.9,
        productivity: 0.85,
        reliability: 0.9,
        satisfaction: 0.8,
        cost_effectiveness: 0.85,
        metrics: [],
      },
    };

    it('리소스 추가', () => {
      system.addResource(mockResource);

      const resource = system.getResource('resource-1');
      expect(resource).toBeDefined();
      expect(resource?.name).toBe('테스트 리소스');
      expect(resource?.type).toBe('human');
    });

    it('리소스 조회', () => {
      system.addResource(mockResource);

      const resource = system.getResource('resource-1');
      expect(resource).toBeDefined();
      expect(resource?.resourceId).toBe('resource-1');
    });

    it('모든 리소스 조회', () => {
      system.addResource(mockResource);

      const resources = system.getResources();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 리소스 조회', () => {
      const resource = system.getResource('non-existent');
      expect(resource).toBeUndefined();
    });

    it('리소스 활용률 업데이트', () => {
      system.addResource(mockResource);
      system.updateResourceUtilization('resource-1', 0.5);

      const resource = system.getResource('resource-1');
      expect(resource?.utilization.current).toBe(0.5);
    });

    it('존재하지 않는 리소스 활용률 업데이트', () => {
      expect(() => {
        system.updateResourceUtilization('non-existent', 0.5);
      }).not.toThrow();
    });
  });

  describe('할당 관리', () => {
    const mockAllocationData: Omit<
      ResourceAllocation,
      'allocationId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
    > = {
      name: '테스트 할당',
      description: '테스트 설명',
      type: 'project',
      status: 'active',
      priority: 'high',
      resources: [],
      allocations: [],
      constraints: [],
      settings: {
        autoOptimization: true,
        optimizationFrequency: 'daily',
        rebalancingThreshold: 0.1,
        utilizationTarget: 0.85,
        costOptimization: true,
        skillMatching: true,
        capacityPlanning: true,
        alertThresholds: {
          overallocation: 0.95,
          underutilization: 0.3,
          costOverrun: 0.2,
          skillGap: 0.5,
          timelineDelay: 0.2,
        },
        approvalWorkflow: false,
        reportingFrequency: 'weekly',
      },
    };

    it('할당 생성', () => {
      const allocation = system.createAllocation(mockAllocationData);

      expect(allocation).toBeDefined();
      expect(allocation.allocationId).toBeDefined();
      expect(allocation.name).toBe(mockAllocationData.name);
      expect(allocation.type).toBe(mockAllocationData.type);
      expect(allocation.status).toBe(mockAllocationData.status);
    });

    it('할당 조회', () => {
      const created = system.createAllocation(mockAllocationData);
      const retrieved = system.getAllocation(created.allocationId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.allocationId).toBe(created.allocationId);
      expect(retrieved?.name).toBe(mockAllocationData.name);
    });

    it('모든 할당 조회', () => {
      system.createAllocation(mockAllocationData);

      const allocations = system.getAllocations();
      expect(Array.isArray(allocations)).toBe(true);
    });

    it('존재하지 않는 할당 조회', () => {
      const allocation = system.getAllocation('non-existent');
      expect(allocation).toBeUndefined();
    });
  });

  describe('분석 데이터', () => {
    it('분석 데이터 조회', () => {
      const analytics = system.getAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalResources).toBe('number');
      expect(typeof analytics.activeAllocations).toBe('number');
      expect(typeof analytics.averageUtilization).toBe('number');
      expect(typeof analytics.totalCost).toBe('number');
      expect(typeof analytics.costPerResource).toBe('number');
      expect(typeof analytics.efficiencyScore).toBe('number');
      expect(typeof analytics.optimizationRate).toBe('number');
      expect(typeof analytics.issueResolutionRate).toBe('number');
      expect(typeof analytics.satisfactionScore).toBe('number');
      expect(typeof analytics.roi).toBe('number');
    });
  });

  describe('다양한 할당 타입', () => {
    it('프로젝트 타입 할당 생성', () => {
      const allocation = system.createAllocation({
        name: '프로젝트 할당',
        description: '테스트',
        type: 'project',
        status: 'active',
        priority: 'high',
        resources: [],
        allocations: [],
        constraints: [],
        settings: {
          autoOptimization: true,
          optimizationFrequency: 'daily',
          rebalancingThreshold: 0.1,
          utilizationTarget: 0.85,
          costOptimization: true,
          skillMatching: true,
          capacityPlanning: true,
          alertThresholds: {
            overallocation: 0.95,
            underutilization: 0.3,
            costOverrun: 0.2,
            skillGap: 0.5,
            timelineDelay: 0.2,
          },
          approvalWorkflow: false,
          reportingFrequency: 'weekly',
        },
      });

      expect(allocation.type).toBe('project');
    });

    it('팀 타입 할당 생성', () => {
      const allocation = system.createAllocation({
        name: '팀 할당',
        description: '테스트',
        type: 'team',
        status: 'active',
        priority: 'medium',
        resources: [],
        allocations: [],
        constraints: [],
        settings: {
          autoOptimization: true,
          optimizationFrequency: 'daily',
          rebalancingThreshold: 0.1,
          utilizationTarget: 0.85,
          costOptimization: true,
          skillMatching: true,
          capacityPlanning: true,
          alertThresholds: {
            overallocation: 0.95,
            underutilization: 0.3,
            costOverrun: 0.2,
            skillGap: 0.5,
            timelineDelay: 0.2,
          },
          approvalWorkflow: false,
          reportingFrequency: 'weekly',
        },
      });

      expect(allocation.type).toBe('team');
    });
  });

  describe('다양한 리소스 타입', () => {
    it('인적 리소스 추가', () => {
      const resource: Resource = {
        resourceId: 'human-1',
        name: '인적 리소스',
        type: 'human',
        category: 'dedicated',
        capacity: {
          total: 40,
          available: 32,
          allocated: 8,
          reserved: 0,
          unit: 'hours/week',
          scalable: false,
          maxScale: 50,
          minThreshold: 20,
        },
        availability: {
          schedule: [],
          timeZone: 'Asia/Seoul',
          workingHours: {
            monday: [{ start: '09:00', end: '18:00', available: true }],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
          holidays: [],
          constraints: [],
          flexibility: 0.7,
        },
        cost: {
          hourlyRate: 50000,
          dailyRate: 400000,
          monthlyRate: 8000000,
          setupCost: 0,
          maintenanceCost: 0,
          currency: 'KRW',
          variableCosts: [],
        },
        skills: [],
        location: '서울',
        department: '개발팀',
        manager: 'manager-1',
        utilization: {
          current: 0.2,
          average: 0.8,
          peak: 0.95,
          target: 0.85,
          efficiency: 0.9,
          trends: [],
        },
        performance: {
          quality: 0.9,
          productivity: 0.85,
          reliability: 0.9,
          satisfaction: 0.8,
          cost_effectiveness: 0.85,
          metrics: [],
        },
      };

      system.addResource(resource);
      expect(system.getResource('human-1')?.type).toBe('human');
    });

    it('재무 리소스 추가', () => {
      const resource: Resource = {
        resourceId: 'financial-1',
        name: '예산',
        type: 'financial',
        category: 'fixed',
        capacity: {
          total: 10000000,
          available: 5000000,
          allocated: 3000000,
          reserved: 2000000,
          unit: 'KRW',
          scalable: true,
          maxScale: 20000000,
          minThreshold: 1000000,
        },
        availability: {
          schedule: [],
          timeZone: 'Asia/Seoul',
          workingHours: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
          holidays: [],
          constraints: [],
          flexibility: 0.5,
        },
        cost: {
          hourlyRate: 0,
          dailyRate: 0,
          monthlyRate: 0,
          setupCost: 0,
          maintenanceCost: 0,
          currency: 'KRW',
          variableCosts: [],
        },
        skills: [],
        location: '서울',
        department: '재무팀',
        manager: 'manager-1',
        utilization: {
          current: 0.3,
          average: 0.5,
          peak: 0.8,
          target: 0.7,
          efficiency: 0.85,
          trends: [],
        },
        performance: {
          quality: 1.0,
          productivity: 1.0,
          reliability: 1.0,
          satisfaction: 0.9,
          cost_effectiveness: 0.95,
          metrics: [],
        },
      };

      system.addResource(resource);
      expect(system.getResource('financial-1')?.type).toBe('financial');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiResourceAllocationOptimizationSystem).toBeInstanceOf(
        AIResourceAllocationOptimizationSystem
      );
    });
  });
});

