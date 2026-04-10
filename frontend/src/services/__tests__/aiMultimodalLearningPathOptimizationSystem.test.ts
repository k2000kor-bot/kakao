/**
 * AIMultimodalLearningPathOptimizationSystem 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import aiMultimodalLearningPathOptimizationSystem, {
  AIMultimodalLearningPathOptimizationSystem,
  LearningPath,
} from '../aiMultimodalLearningPathOptimizationSystem';

// Mock dependencies
jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn(),
  },
}));

describe('AIMultimodalLearningPathOptimizationSystem', () => {
  let system: AIMultimodalLearningPathOptimizationSystem;

  beforeEach(() => {
    system = new AIMultimodalLearningPathOptimizationSystem();
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
      expect(system).toBeInstanceOf(AIMultimodalLearningPathOptimizationSystem);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiMultimodalLearningPathOptimizationSystem).toBeInstanceOf(
        AIMultimodalLearningPathOptimizationSystem
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

  describe('학습 경로 관리', () => {
    const mockPathData: Omit<
      LearningPath,
      'pathId' | 'progress' | 'optimization' | 'qualityMetrics' | 'recommendations' | 'timestamp'
    > = {
      userId: 'user-1',
      name: '테스트 학습 경로',
      description: '테스트 설명',
      type: 'individual',
      status: 'active',
      modules: [
        {
          moduleId: 'module-1',
          name: '테스트 모듈',
          description: '모듈 설명',
          type: 'video',
          difficulty: 'beginner',
          duration: 30,
          prerequisites: [],
          skills: [],
          qualityScore: 0.8,
          completionRate: 0.7,
          userSatisfaction: 0.75,
          adaptiveContent: [],
          assessments: [],
        },
      ],
      settings: {
        adaptiveLearning: true,
        personalization: true,
        collaboration: false,
        qualityTracking: true,
        optimization: true,
        notifications: true,
        difficultyAdjustment: true,
        timeManagement: true,
        qualityThresholds: {
          excellent: 0.9,
          good: 0.7,
          average: 0.5,
          poor: 0.3,
        },
      },
    };

    it('학습 경로 생성', () => {
      const path = system.createLearningPath(mockPathData);

      expect(path).toBeDefined();
      expect(path.pathId).toBeDefined();
      expect(path.userId).toBe(mockPathData.userId);
      expect(path.name).toBe(mockPathData.name);
      expect(path.type).toBe(mockPathData.type);
      expect(path.status).toBe(mockPathData.status);
      expect(path.progress).toBeDefined();
      expect(path.optimization).toBeDefined();
      expect(path.qualityMetrics).toBeDefined();
    });

    it('학습 경로 조회', () => {
      const created = system.createLearningPath(mockPathData);
      const retrieved = system.getLearningPath(created.pathId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.pathId).toBe(created.pathId);
      expect(retrieved?.name).toBe(mockPathData.name);
    });

    it('모든 학습 경로 조회', () => {
      system.createLearningPath(mockPathData);

      const paths = system.getLearningPaths();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('존재하지 않는 학습 경로 조회', () => {
      const path = system.getLearningPath('non-existent');
      expect(path).toBeUndefined();
    });
  });

  describe('모듈 진행률 업데이트', () => {
    it('모듈 진행률 업데이트', () => {
      const mockPathData: Omit<
        LearningPath,
        'pathId' | 'progress' | 'optimization' | 'qualityMetrics' | 'recommendations' | 'timestamp'
      > = {
        userId: 'user-1',
        name: '테스트 경로',
        description: '설명',
        type: 'individual',
        status: 'active',
        modules: [
          {
            moduleId: 'module-1',
            name: '모듈 1',
            description: '설명',
            type: 'video',
            difficulty: 'beginner',
            duration: 30,
            prerequisites: [],
            skills: [],
            qualityScore: 0.8,
            completionRate: 0.7,
            userSatisfaction: 0.75,
            adaptiveContent: [],
            assessments: [],
          },
        ],
        settings: {
          adaptiveLearning: true,
          personalization: true,
          collaboration: false,
          qualityTracking: true,
          optimization: true,
          notifications: true,
          difficultyAdjustment: true,
          timeManagement: true,
          qualityThresholds: {
            excellent: 0.9,
            good: 0.7,
            average: 0.5,
            poor: 0.3,
          },
        },
      };

      const path = system.createLearningPath(mockPathData);
      system.updateModuleProgress(path.pathId, 'module-1', 0.5);

      const updatedPath = system.getLearningPath(path.pathId);
      expect(updatedPath).toBeDefined();
    });

    it('존재하지 않는 경로의 모듈 진행률 업데이트', () => {
      expect(() => {
        system.updateModuleProgress('non-existent', 'module-1', 0.5);
      }).not.toThrow();
    });
  });

  describe('평가 결과 추가', () => {
    it('평가 결과 추가', () => {
      const mockPathData: Omit<
        LearningPath,
        'pathId' | 'progress' | 'optimization' | 'qualityMetrics' | 'recommendations' | 'timestamp'
      > = {
        userId: 'user-1',
        name: '테스트 경로',
        description: '설명',
        type: 'individual',
        status: 'active',
        modules: [
          {
            moduleId: 'module-1',
            name: '모듈 1',
            description: '설명',
            type: 'video',
            difficulty: 'beginner',
            duration: 30,
            prerequisites: [],
            skills: [],
            qualityScore: 0.8,
            completionRate: 0.7,
            userSatisfaction: 0.75,
            adaptiveContent: [],
            assessments: [
              {
                assessmentId: 'assessment-1',
                type: 'quiz',
                title: '테스트 평가',
                description: '설명',
                questions: [],
                passingScore: 70,
                timeLimit: 30,
                adaptiveScoring: false,
              },
            ],
          },
        ],
        settings: {
          adaptiveLearning: true,
          personalization: true,
          collaboration: false,
          qualityTracking: true,
          optimization: true,
          notifications: true,
          difficultyAdjustment: true,
          timeManagement: true,
          qualityThresholds: {
            excellent: 0.9,
            good: 0.7,
            average: 0.5,
            poor: 0.3,
          },
        },
      };

      const path = system.createLearningPath(mockPathData);
      system.addAssessmentResult(path.pathId, 'module-1', 'assessment-1', 85);

      const updatedPath = system.getLearningPath(path.pathId);
      expect(updatedPath).toBeDefined();
    });

    it('존재하지 않는 경로의 평가 결과 추가', () => {
      expect(() => {
        system.addAssessmentResult('non-existent', 'module-1', 'assessment-1', 85);
      }).not.toThrow();
    });
  });

  describe('분석 데이터', () => {
    it('분석 데이터 조회', () => {
      const analytics = system.getAnalytics();

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalPaths).toBe('number');
      expect(typeof analytics.activePaths).toBe('number');
      expect(typeof analytics.averageProgress).toBe('number');
      expect(typeof analytics.averageQuality).toBe('number');
      expect(typeof analytics.completionRate).toBe('number');
      // userSatisfaction과 optimizationRate는 선택적일 수 있음
      if (analytics.userSatisfaction !== undefined) {
        expect(typeof analytics.userSatisfaction).toBe('number');
      }
      if (analytics.optimizationRate !== undefined) {
        expect(typeof analytics.optimizationRate).toBe('number');
      }
    });
  });

  describe('다양한 학습 경로 타입', () => {
    it('개인 학습 경로 생성', () => {
      const path = system.createLearningPath({
        userId: 'user-1',
        name: '개인 학습 경로',
        description: '설명',
        type: 'individual',
        status: 'active',
        modules: [],
        settings: {
          adaptiveLearning: true,
          personalization: true,
          collaboration: false,
          qualityTracking: true,
          optimization: true,
          notifications: true,
          difficultyAdjustment: true,
          timeManagement: true,
          qualityThresholds: {
            excellent: 0.9,
            good: 0.7,
            average: 0.5,
            poor: 0.3,
          },
        },
      });

      expect(path.type).toBe('individual');
    });

    it('팀 학습 경로 생성', () => {
      const path = system.createLearningPath({
        userId: 'user-1',
        name: '팀 학습 경로',
        description: '설명',
        type: 'team',
        status: 'active',
        modules: [],
        settings: {
          adaptiveLearning: true,
          personalization: true,
          collaboration: true,
          qualityTracking: true,
          optimization: true,
          notifications: true,
          difficultyAdjustment: true,
          timeManagement: true,
          qualityThresholds: {
            excellent: 0.9,
            good: 0.7,
            average: 0.5,
            poor: 0.3,
          },
        },
      });

      expect(path.type).toBe('team');
    });

    it('스킬 학습 경로 생성', () => {
      const path = system.createLearningPath({
        userId: 'user-1',
        name: '스킬 학습 경로',
        description: '설명',
        type: 'skill',
        status: 'active',
        modules: [],
        settings: {
          adaptiveLearning: true,
          personalization: true,
          collaboration: false,
          qualityTracking: true,
          optimization: true,
          notifications: true,
          difficultyAdjustment: true,
          timeManagement: true,
          qualityThresholds: {
            excellent: 0.9,
            good: 0.7,
            average: 0.5,
            poor: 0.3,
          },
        },
      });

      expect(path.type).toBe('skill');
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiMultimodalLearningPathOptimizationSystem).toBeInstanceOf(
        AIMultimodalLearningPathOptimizationSystem
      );
    });
  });
});

