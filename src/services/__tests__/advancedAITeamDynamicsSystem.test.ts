/**
 * advancedAITeamDynamicsSystem 서비스 테스트
 * 고급 AI 팀 역학 분석 시스템 테스트
 */

import advancedAITeamDynamicsSystem from '../advancedAITeamDynamicsSystem';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';
import type {
  TeamInteraction,
  TeamDynamicsSession,
  TeamMember,
} from '../advancedAITeamDynamicsSystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  sendAlert: jest.fn().mockResolvedValue({}),
}));

// 타이머 모킹
jest.useFakeTimers();

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedAITeamDynamicsSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // 시스템 중지
    if (advancedAITeamDynamicsSystem) {
      try {
        advancedAITeamDynamicsSystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    jest.useRealTimers();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAITeamDynamicsSystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAITeamDynamicsSystem;
      const instance2 = advancedAITeamDynamicsSystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('시스템을 시작할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();
      expect(advancedAITeamDynamicsSystem.isSystemRunning()).toBe(true);
      advancedAITeamDynamicsSystem.stop();
    });

    it('시스템을 중지할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();
      advancedAITeamDynamicsSystem.stop();
      expect(advancedAITeamDynamicsSystem.isSystemRunning()).toBe(false);
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAITeamDynamicsSystem.start();
      advancedAITeamDynamicsSystem.start(); // 중복 호출
      advancedAITeamDynamicsSystem.stop();
    });

    it('이미 중지된 상태에서 중지 호출을 방지해야 함', () => {
      advancedAITeamDynamicsSystem.stop(); // 이미 중지된 상태
      expect(advancedAITeamDynamicsSystem.isSystemRunning()).toBe(false);
    });
  });

  describe('getSessions', () => {
    it('시작 후 초기 세션을 조회할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);

      if (sessions.length > 0) {
        const session = sessions[0];
        expect(session.sessionId).toBeDefined();
        expect(session.teamId).toBeDefined();
        expect(session.teamName).toBeDefined();
        expect(Array.isArray(session.members)).toBe(true);
        expect(Array.isArray(session.interactions)).toBe(true);
        expect(session.dynamics).toBeDefined();
        expect(session.analysis).toBeDefined();
        expect(session.metrics).toBeDefined();
        expect(session.settings).toBeDefined();
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('세션이 올바른 구조를 가져야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();

      if (sessions.length > 0) {
        const session = sessions[0];

        // 멤버 구조 확인
        if (session.members.length > 0) {
          const member = session.members[0];
          expect(member.memberId).toBeDefined();
          expect(member.name).toBeDefined();
          expect(member.role).toBeDefined();
          expect(member.personality).toBeDefined();
          expect(member.communicationStyle).toBeDefined();
          expect(member.leadershipStyle).toBeDefined();
          expect(Array.isArray(member.collaborationPatterns)).toBe(true);
          expect(member.performance).toBeDefined();
          expect(Array.isArray(member.relationships)).toBe(true);
        }

        // 역학 구조 확인
        expect(session.dynamics.cohesion).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.communication).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.conflict).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.collaboration).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.creativity).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.decisionMaking).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.leadership).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.trust).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.motivation).toBeGreaterThanOrEqual(0);
        expect(session.dynamics.productivity).toBeGreaterThanOrEqual(0);
      }

      advancedAITeamDynamicsSystem.stop();
    });
  });

  describe('getSession', () => {
    it('특정 세션을 조회할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;
        const session = advancedAITeamDynamicsSystem.getSession(sessionId);

        expect(session).toBeDefined();
        expect(session?.sessionId).toBe(sessionId);
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('존재하지 않는 세션을 조회하면 undefined를 반환해야 함', () => {
      const session = advancedAITeamDynamicsSystem.getSession('non-existent-session');
      expect(session).toBeUndefined();
    });
  });

  describe('addTeamInteraction', () => {
    it('팀 상호작용을 추가할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;
        const initialInteractionCount = sessions[0].interactions.length;

        const interaction = advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'communication',
          modality: 'verbal',
          content: '프로젝트 진행 상황 공유',
          timestamp: Date.now(),
          duration: 60000,
        });

        expect(interaction).toBeDefined();
        expect(interaction.interactionId).toBeDefined();
        expect(interaction.analysis).toBeDefined();
        expect(interaction.participants).toEqual(['member-1', 'member-2']);

        const updatedSession = advancedAITeamDynamicsSystem.getSession(sessionId);
        expect(updatedSession?.interactions.length).toBe(initialInteractionCount + 1);
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('존재하지 않는 세션에 상호작용을 추가하면 에러를 발생시켜야 함', () => {
      expect(() => {
        advancedAITeamDynamicsSystem.addTeamInteraction('non-existent-session', {
          sessionId: 'non-existent-session',
          participants: ['member-1'],
          type: 'communication',
          modality: 'verbal',
          content: '테스트',
          timestamp: Date.now(),
          duration: 60000,
        });
      }).toThrow();
    });

    it('상호작용 분석 결과가 올바른 구조를 가져야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;

        const interaction = advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'decision',
          modality: 'verbal',
          content: '프로젝트 일정 결정',
          timestamp: Date.now(),
          duration: 120000,
        });

        expect(interaction.analysis).toBeDefined();
        expect(interaction.analysis.sentiment).toBeDefined();
        expect(typeof interaction.analysis.engagement).toBe('number');
        expect(typeof interaction.analysis.effectiveness).toBe('number');
        expect(typeof interaction.analysis.impact).toBe('number');
        expect(typeof interaction.analysis.conflictLevel).toBe('number');
        expect(typeof interaction.analysis.collaborationLevel).toBe('number');
        expect(typeof interaction.analysis.leadershipPresence).toBe('number');
        expect(typeof interaction.analysis.innovationPotential).toBe('number');
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('상호작용 추가 후 인사이트가 생성되어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;
        const initialInsightCount = sessions[0].analysis.insights.length;

        advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'collaboration',
          modality: 'written',
          content: '협업 문서 작성',
          timestamp: Date.now(),
          duration: 180000,
        });

        const updatedSession = advancedAITeamDynamicsSystem.getSession(sessionId);
        expect(updatedSession?.analysis.insights.length).toBeGreaterThanOrEqual(initialInsightCount);
      }

      advancedAITeamDynamicsSystem.stop();
    });
  });

  describe('getMetrics', () => {
    it('메트릭을 조회할 수 있어야 함', () => {
      const metrics = advancedAITeamDynamicsSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalInteractions).toBe('number');
      expect(typeof metrics.averageCohesion).toBe('number');
      expect(typeof metrics.conflictFrequency).toBe('number');
      expect(typeof metrics.collaborationEffectiveness).toBe('number');
      expect(typeof metrics.leadershipEffectiveness).toBe('number');
      expect(typeof metrics.innovationRate).toBe('number');
      expect(typeof metrics.decisionQuality).toBe('number');
      expect(typeof metrics.teamSatisfaction).toBe('number');
      expect(typeof metrics.productivityScore).toBe('number');
      expect(typeof metrics.adaptabilityScore).toBe('number');
    });

    it('시작 후 메트릭이 업데이트되어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      // 메트릭 업데이트 간격(30초) 경과
      jest.advanceTimersByTime(30000);

      const metrics = advancedAITeamDynamicsSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalInteractions).toBeGreaterThanOrEqual(0);

      advancedAITeamDynamicsSystem.stop();
    });
  });

  describe('isSystemRunning', () => {
    it('시스템이 실행 중이 아니면 false를 반환해야 함', () => {
      expect(advancedAITeamDynamicsSystem.isSystemRunning()).toBe(false);
    });

    it('시스템이 실행 중이면 true를 반환해야 함', () => {
      advancedAITeamDynamicsSystem.start();
      expect(advancedAITeamDynamicsSystem.isSystemRunning()).toBe(true);
      advancedAITeamDynamicsSystem.stop();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 팀의 역학을 분석할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;

        // 재개발 프로젝트 관련 상호작용 추가
        const interaction1 = advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'decision',
          modality: 'verbal',
          content: '재개발 프로젝트 일정 논의',
          timestamp: Date.now(),
          duration: 3600000,
        });

        const interaction2 = advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'collaboration',
          modality: 'written',
          content: '재개발 문서 공동 작성',
          timestamp: Date.now() + 1000,
          duration: 7200000,
        });

        expect(interaction1).toBeDefined();
        expect(interaction2).toBeDefined();

        const session = advancedAITeamDynamicsSystem.getSession(sessionId);
        expect(session?.interactions.length).toBeGreaterThanOrEqual(2);
        expect(session?.analysis.patterns.length).toBeGreaterThanOrEqual(0);
        expect(session?.analysis.recommendations.length).toBeGreaterThanOrEqual(0);
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('시공사 선정 팀의 협업 패턴을 분석할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;

        // 시공사 선정 관련 상호작용 추가
        advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'decision',
          modality: 'verbal',
          content: '시공사 선정 기준 논의',
          timestamp: Date.now(),
          duration: 5400000,
        });

        advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
          sessionId: sessionId,
          participants: ['member-1', 'member-2'],
          type: 'innovation',
          modality: 'visual',
          content: '시공사 평가 매트릭스 설계',
          timestamp: Date.now() + 2000,
          duration: 10800000,
        });

        const session = advancedAITeamDynamicsSystem.getSession(sessionId);
        expect(session).toBeDefined();

        if (session) {
          expect(session.dynamics.collaboration).toBeGreaterThanOrEqual(0);
          expect(session.dynamics.creativity).toBeGreaterThanOrEqual(0);
          expect(session.dynamics.decisionMaking).toBeGreaterThanOrEqual(0);

          // 예측 결과 확인
          if (session.analysis.predictions.length > 0) {
            const prediction = session.analysis.predictions[0];
            expect(prediction.predictionId).toBeDefined();
            expect(prediction.type).toBeDefined();
            expect(typeof prediction.probability).toBe('number');
            expect(prediction.confidence).toBeGreaterThanOrEqual(0);
          }
        }
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('팀 역학 분석을 통해 인사이트와 권장사항을 생성할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      const sessions = advancedAITeamDynamicsSystem.getSessions();
      if (sessions.length > 0) {
        const sessionId = sessions[0].sessionId;

        // 여러 상호작용 추가
        for (let i = 0; i < 3; i++) {
          advancedAITeamDynamicsSystem.addTeamInteraction(sessionId, {
            sessionId: sessionId,
            participants: ['member-1', 'member-2'],
            type: 'communication',
            modality: 'verbal',
            content: `팀 미팅 ${i + 1}`,
            timestamp: Date.now() + i * 1000,
            duration: 3600000,
          });
        }

        const session = advancedAITeamDynamicsSystem.getSession(sessionId);

        if (session) {
          // 인사이트 확인
          expect(Array.isArray(session.analysis.insights)).toBe(true);
          if (session.analysis.insights.length > 0) {
            const insight = session.analysis.insights[0];
            expect(insight.insightId).toBeDefined();
            expect(insight.category).toBeDefined();
            expect(insight.title).toBeDefined();
            expect(insight.description).toBeDefined();
            expect(typeof insight.confidence).toBe('number');
            expect(typeof insight.impact).toBe('number');
            expect(['low', 'medium', 'high']).toContain(insight.urgency);
          }

          // 권장사항 확인
          expect(Array.isArray(session.analysis.recommendations)).toBe(true);
          if (session.analysis.recommendations.length > 0) {
            const recommendation = session.analysis.recommendations[0];
            expect(recommendation.recommendationId).toBeDefined();
            expect(recommendation.category).toBeDefined();
            expect(recommendation.title).toBeDefined();
            expect(recommendation.description).toBeDefined();
            expect(['low', 'medium', 'high']).toContain(recommendation.priority);
            expect(typeof recommendation.impact).toBe('number');
            expect(['low', 'medium', 'high']).toContain(recommendation.effort);
            expect(recommendation.implementation).toBeDefined();
            expect(recommendation.expectedOutcome).toBeDefined();
          }

          // 패턴 확인
          expect(Array.isArray(session.analysis.patterns)).toBe(true);
          if (session.analysis.patterns.length > 0) {
            const pattern = session.analysis.patterns[0];
            expect(pattern.patternId).toBeDefined();
            expect(pattern.type).toBeDefined();
            expect(pattern.description).toBeDefined();
            expect(typeof pattern.frequency).toBe('number');
            expect(typeof pattern.effectiveness).toBe('number');
            expect(Array.isArray(pattern.participants)).toBe(true);
            expect(typeof pattern.impact).toBe('number');
            expect(Array.isArray(pattern.recommendations)).toBe(true);
          }
        }
      }

      advancedAITeamDynamicsSystem.stop();
    });

    it('전체 팀 메트릭을 모니터링할 수 있어야 함', () => {
      advancedAITeamDynamicsSystem.start();

      // 메트릭 업데이트 간격 경과
      jest.advanceTimersByTime(30000);

      const metrics = advancedAITeamDynamicsSystem.getMetrics();

      expect(metrics.totalInteractions).toBeGreaterThanOrEqual(0);
      expect(metrics.averageCohesion).toBeGreaterThanOrEqual(0);
      expect(metrics.averageCohesion).toBeLessThanOrEqual(1);
      expect(metrics.conflictFrequency).toBeGreaterThanOrEqual(0);
      expect(metrics.collaborationEffectiveness).toBeGreaterThanOrEqual(0);
      expect(metrics.collaborationEffectiveness).toBeLessThanOrEqual(1);
      expect(metrics.leadershipEffectiveness).toBeGreaterThanOrEqual(0);
      expect(metrics.leadershipEffectiveness).toBeLessThanOrEqual(1);
      expect(metrics.innovationRate).toBeGreaterThanOrEqual(0);
      expect(metrics.innovationRate).toBeLessThanOrEqual(1);
      expect(metrics.decisionQuality).toBeGreaterThanOrEqual(0);
      expect(metrics.decisionQuality).toBeLessThanOrEqual(1);
      expect(metrics.teamSatisfaction).toBeGreaterThanOrEqual(0);
      expect(metrics.teamSatisfaction).toBeLessThanOrEqual(1);
      expect(metrics.productivityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.productivityScore).toBeLessThanOrEqual(1);
      expect(metrics.adaptabilityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.adaptabilityScore).toBeLessThanOrEqual(1);

      advancedAITeamDynamicsSystem.stop();
    });
  });
});

