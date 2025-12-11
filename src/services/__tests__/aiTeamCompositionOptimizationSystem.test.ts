/**
 * AITeamCompositionOptimizationSystem 테스트
 */

import aiTeamCompositionOptimizationSystem, {
  AITeamCompositionOptimizationSystem,
  TeamComposition,
  TeamMember,
} from '../aiTeamCompositionOptimizationSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AITeamCompositionOptimizationSystem', () => {
  let system: AITeamCompositionOptimizationSystem;

  beforeEach(() => {
    system = new AITeamCompositionOptimizationSystem();
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
      expect(system).toBeInstanceOf(AITeamCompositionOptimizationSystem);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiTeamCompositionOptimizationSystem).toBeInstanceOf(
        AITeamCompositionOptimizationSystem
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

  describe('팀 관리', () => {
    const mockTeamData: Omit<
      TeamComposition,
      'teamId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
    > = {
      name: '테스트 팀',
      description: '테스트 설명',
      type: 'project',
      status: 'active',
      members: [],
      roles: [],
      requirements: [],
      settings: {
        autoOptimization: true,
        diversityFocus: true,
        skillBalance: true,
        performanceTracking: true,
        developmentSupport: true,
        communicationEnhancement: true,
        conflictResolution: true,
        feedbackSystem: true,
        optimizationFrequency: 'weekly',
        performanceThresholds: {
          minimumPerformance: 0.8,
          targetEfficiency: 0.9,
          minimumSatisfaction: 0.8,
          targetProductivity: 0.9,
          minimumQuality: 0.85,
        },
      },
    };

    it('팀 생성', () => {
      const team = system.createTeam(mockTeamData);

      expect(team).toBeDefined();
      expect(team.teamId).toBeDefined();
      expect(team.name).toBe(mockTeamData.name);
      expect(team.type).toBe(mockTeamData.type);
      expect(team.status).toBe(mockTeamData.status);
      expect(team.optimization).toBeDefined();
      expect(team.performance).toBeDefined();
    });

    it('팀 조회', () => {
      const created = system.createTeam(mockTeamData);
      const retrieved = system.getTeam(created.teamId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.teamId).toBe(created.teamId);
      expect(retrieved?.name).toBe(mockTeamData.name);
    });

    it('모든 팀 조회', () => {
      system.createTeam(mockTeamData);

      const teams = system.getTeams();
      expect(Array.isArray(teams)).toBe(true);
    });

    it('존재하지 않는 팀 조회', () => {
      const team = system.getTeam('non-existent');
      expect(team).toBeUndefined();
    });
  });

  describe('멤버 관리', () => {
    const mockMember: TeamMember = {
      memberId: 'member-1',
      userId: 'user-1',
      name: '테스트 멤버',
      role: 'developer',
      skills: [],
      experience: 5,
      learningPath: 'senior',
      qualityMetrics: {
        overallQuality: 0.9,
        technicalQuality: 0.9,
        collaborationQuality: 0.85,
        communicationQuality: 0.88,
        problemSolvingQuality: 0.9,
        innovationQuality: 0.85,
        reliability: 0.92,
        adaptability: 0.88,
      },
      availability: 0.9,
      collaborationStyle: 'contributor',
      communicationPreference: 'direct',
      strengths: ['기술력', '문제 해결'],
      weaknesses: [],
      developmentAreas: [],
    };

    it('멤버 추가', () => {
      const mockTeamData: Omit<
        TeamComposition,
        'teamId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '테스트 팀',
        description: '설명',
        type: 'project',
        status: 'active',
        members: [],
        roles: [],
        requirements: [],
        settings: {
          autoOptimization: true,
          diversityFocus: true,
          skillBalance: true,
          performanceTracking: true,
          developmentSupport: true,
          communicationEnhancement: true,
          conflictResolution: true,
          feedbackSystem: true,
          optimizationFrequency: 'weekly',
          performanceThresholds: {
            minimumPerformance: 0.8,
            targetEfficiency: 0.9,
            minimumSatisfaction: 0.8,
            targetProductivity: 0.9,
            minimumQuality: 0.85,
          },
        },
      };

      const team = system.createTeam(mockTeamData);
      system.addMember(team.teamId, mockMember);

      const updatedTeam = system.getTeam(team.teamId);
      expect(updatedTeam?.members.length).toBeGreaterThan(0);
    });

    it('멤버 제거', () => {
      const mockTeamData: Omit<
        TeamComposition,
        'teamId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '테스트 팀',
        description: '설명',
        type: 'project',
        status: 'active',
        members: [mockMember],
        roles: [],
        requirements: [],
        settings: {
          autoOptimization: true,
          diversityFocus: true,
          skillBalance: true,
          performanceTracking: true,
          developmentSupport: true,
          communicationEnhancement: true,
          conflictResolution: true,
          feedbackSystem: true,
          optimizationFrequency: 'weekly',
          performanceThresholds: {
            minimumPerformance: 0.8,
            targetEfficiency: 0.9,
            minimumSatisfaction: 0.8,
            targetProductivity: 0.9,
            minimumQuality: 0.85,
          },
        },
      };

      const team = system.createTeam(mockTeamData);
      system.removeMember(team.teamId, 'member-1');

      const updatedTeam = system.getTeam(team.teamId);
      expect(updatedTeam?.members.find((m) => m.memberId === 'member-1')).toBeUndefined();
    });

    it('존재하지 않는 팀에 멤버 추가', () => {
      expect(() => {
        system.addMember('non-existent', mockMember);
      }).not.toThrow();
    });
  });

  describe('역할 할당', () => {
    it('역할 할당', () => {
      const mockTeamData: Omit<
        TeamComposition,
        'teamId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'
      > = {
        name: '테스트 팀',
        description: '설명',
        type: 'project',
        status: 'active',
        members: [
          {
            memberId: 'member-1',
            userId: 'user-1',
            name: '멤버 1',
            role: 'developer',
            skills: [],
            experience: 5,
            learningPath: 'senior',
            qualityMetrics: {
              overallQuality: 0.9,
              technicalQuality: 0.9,
              collaborationQuality: 0.85,
              communicationQuality: 0.88,
              problemSolvingQuality: 0.9,
              innovationQuality: 0.85,
              reliability: 0.92,
              adaptability: 0.88,
            },
            availability: 0.9,
            collaborationStyle: 'contributor',
            communicationPreference: 'direct',
            strengths: [],
            weaknesses: [],
            developmentAreas: [],
          },
        ],
        roles: [
          {
            roleId: 'role-1',
            name: '리드 개발자',
            description: '설명',
            responsibilities: [],
            requiredSkills: [],
            preferredSkills: [],
            importance: 'critical',
            assignedMember: null,
            performance: 0,
          },
        ],
        requirements: [],
        settings: {
          autoOptimization: true,
          diversityFocus: true,
          skillBalance: true,
          performanceTracking: true,
          developmentSupport: true,
          communicationEnhancement: true,
          conflictResolution: true,
          feedbackSystem: true,
          optimizationFrequency: 'weekly',
          performanceThresholds: {
            minimumPerformance: 0.8,
            targetEfficiency: 0.9,
            minimumSatisfaction: 0.8,
            targetProductivity: 0.9,
            minimumQuality: 0.85,
          },
        },
      };

      const team = system.createTeam(mockTeamData);
      system.assignRole(team.teamId, 'role-1', 'member-1');

      const updatedTeam = system.getTeam(team.teamId);
      const role = updatedTeam?.roles.find((r) => r.roleId === 'role-1');
      expect(role?.assignedMember).toBe('member-1');
    });

    it('존재하지 않는 팀에 역할 할당', () => {
      expect(() => {
        system.assignRole('non-existent', 'role-1', 'member-1');
      }).not.toThrow();
    });
  });

  describe('분석 데이터', () => {
    it('분석 데이터 조회', () => {
      const analytics = system.getAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalTeams).toBe('number');
      expect(typeof analytics.activeTeams).toBe('number');
      expect(typeof analytics.averagePerformance).toBe('number');
      expect(typeof analytics.averageSatisfaction).toBe('number');
      // totalMembers는 선택적일 수 있음
      if (analytics.totalMembers !== undefined) {
        expect(typeof analytics.totalMembers).toBe('number');
      }
      expect(typeof analytics.optimizationRate).toBe('number');
    });
  });

  describe('다양한 팀 타입', () => {
    it('프로젝트 팀 생성', () => {
      const team = system.createTeam({
        name: '프로젝트 팀',
        description: '설명',
        type: 'project',
        status: 'active',
        members: [],
        roles: [],
        requirements: [],
        settings: {
          autoOptimization: true,
          diversityFocus: true,
          skillBalance: true,
          performanceTracking: true,
          developmentSupport: true,
          communicationEnhancement: true,
          conflictResolution: true,
          feedbackSystem: true,
          optimizationFrequency: 'weekly',
          performanceThresholds: {
            minimumPerformance: 0.8,
            targetEfficiency: 0.9,
            minimumSatisfaction: 0.8,
            targetProductivity: 0.9,
            minimumQuality: 0.85,
          },
        },
      });

      expect(team.type).toBe('project');
    });

    it('개발 팀 생성', () => {
      const team = system.createTeam({
        name: '개발 팀',
        description: '설명',
        type: 'development',
        status: 'active',
        members: [],
        roles: [],
        requirements: [],
        settings: {
          autoOptimization: true,
          diversityFocus: true,
          skillBalance: true,
          performanceTracking: true,
          developmentSupport: true,
          communicationEnhancement: true,
          conflictResolution: true,
          feedbackSystem: true,
          optimizationFrequency: 'weekly',
          performanceThresholds: {
            minimumPerformance: 0.8,
            targetEfficiency: 0.9,
            minimumSatisfaction: 0.8,
            targetProductivity: 0.9,
            minimumQuality: 0.85,
          },
        },
      });

      expect(team.type).toBe('development');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiTeamCompositionOptimizationSystem).toBeInstanceOf(
        AITeamCompositionOptimizationSystem
      );
    });
  });
});

