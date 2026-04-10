/**
 * RealTimeWritingCoachingSystem 테스트
 */
import realTimeWritingCoachingSystem from '../realTimeWritingCoachingSystem';
import type { WritingGoal } from '../realTimeWritingCoachingSystem';

const baseWritingGoal: WritingGoal = {
  type: 'informative',
  targetAudience: ['일반'],
  desiredLength: { min: 100, target: 500, max: 1000 },
  timeConstraint: '1시간',
  qualityPriorities: ['명확성'],
  specificObjectives: ['정보 전달']
};

describe('RealTimeWritingCoachingSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startWritingSession', () => {
    it('글쓰기 세션 시작', async () => {
      const result = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(Array.isArray(result.initialGuidance)).toBe(true);
      expect(result.coachingStrategy).toBeDefined();
      expect(Array.isArray(result.setupRecommendations)).toBe(true);
    });
  });

  describe('processRealTimeInput', () => {
    it('실시간 입력 처리', async () => {
      const { sessionId } = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      const result = await realTimeWritingCoachingSystem.processRealTimeInput(
        sessionId,
        '첫 번째 문장입니다.',
        {
          timestamp: new Date(),
          inputType: 'typing',
          cursorPosition: 10
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.coachingFeedback)).toBe(true);
      expect(result.writingAssistance).toBeDefined();
      expect(result.progressUpdate).toBeDefined();
    });

    it('존재하지 않는 세션 시 에러', async () => {
      await expect(
        realTimeWritingCoachingSystem.processRealTimeInput(
          'nonexistent-session',
          '텍스트',
          { timestamp: new Date(), inputType: 'typing', cursorPosition: 0 }
        )
      ).rejects.toThrow();
    });
  });

  describe('detectAndResolveWritingBlock', () => {
    it('글쓰기 막힘 감지 및 해결', async () => {
      const { sessionId } = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      const result = await realTimeWritingCoachingSystem.detectAndResolveWritingBlock(sessionId, {
        pauseDuration: 120,
        deletionRatio: 0.3,
        repetitivePatterns: []
      });

      expect(result).toBeDefined();
      expect(result.blockAnalysis).toBeDefined();
      expect(Array.isArray(result.resolutionStrategies)).toBe(true);
    });
  });

  describe('completeWritingSession', () => {
    it('글쓰기 세션 완료', async () => {
      const { sessionId } = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      const result = await realTimeWritingCoachingSystem.completeWritingSession(
        sessionId,
        '완성된 글의 내용입니다.'
      );

      expect(result).toBeDefined();
      expect(result.sessionSummary).toBeDefined();
    });

    it('자기 평가와 함께 세션 완료', async () => {
      const { sessionId } = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      const result = await realTimeWritingCoachingSystem.completeWritingSession(
        sessionId,
        '완성된 글입니다.',
        {
          satisfactionLevel: 4,
          perceivedDifficulty: 2,
          goalAchievement: 5,
          coachingEffectiveness: 4,
          additionalComments: '도움이 되었습니다.'
        }
      );

      expect(result).toBeDefined();
      expect(result.sessionSummary).toBeDefined();
      expect(typeof result.sessionSummary).toBe('object');
    });
  });

  describe('adaptCoachingStrategy', () => {
    it('코칭 전략 적응', async () => {
      const { sessionId } = await realTimeWritingCoachingSystem.startWritingSession(
        'user-1',
        baseWritingGoal
      );

      const result = await realTimeWritingCoachingSystem.adaptCoachingStrategy(
        sessionId,
        {
          acceptanceRate: 0.8,
          improvementRate: 0.6,
          userSatisfaction: 4,
          efficiencyMetrics: { timeSaved: 0.2 }
        }
      );

      expect(result).toBeDefined();
      expect(result.updatedStrategy).toBeDefined();
      expect(Array.isArray(result.adaptationReasons)).toBe(true);
      expect(Array.isArray(result.expectedImprovements)).toBe(true);
      expect(result.personalizations).toBeDefined();
    });

    it('존재하지 않는 세션 시 에러', async () => {
      await expect(
        realTimeWritingCoachingSystem.adaptCoachingStrategy(
          'nonexistent-session',
          {
            acceptanceRate: 0.5,
            improvementRate: 0.3,
            userSatisfaction: 3,
            efficiencyMetrics: {}
          }
        )
      ).rejects.toThrow();
    });
  });
});
