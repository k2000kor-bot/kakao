/**
 * RealTimeAIMultimodalCollaborationSystem 테스트
 */
import realTimeAIMultimodalCollaborationSystem from '../realTimeAIMultimodalCollaborationSystem';

jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    sendAlert: jest.fn()
  }
}));

describe('RealTimeAIMultimodalCollaborationSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('start / stop', () => {
    it('시스템 시작 및 중지', () => {
      realTimeAIMultimodalCollaborationSystem.start();
      expect(realTimeAIMultimodalCollaborationSystem.isSystemRunning()).toBe(true);

      realTimeAIMultimodalCollaborationSystem.stop();
      expect(realTimeAIMultimodalCollaborationSystem.isSystemRunning()).toBe(false);
    });

    it('이미 실행 중일 때 start 중복 호출', () => {
      realTimeAIMultimodalCollaborationSystem.start();
      realTimeAIMultimodalCollaborationSystem.start();
      realTimeAIMultimodalCollaborationSystem.stop();
    });
  });

  describe('getSessions', () => {
    it('세션 목록 반환', () => {
      realTimeAIMultimodalCollaborationSystem.start();

      const sessions = realTimeAIMultimodalCollaborationSystem.getSessions();

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      sessions.forEach(s => {
        expect(s).toHaveProperty('sessionId');
        expect(s).toHaveProperty('title');
        expect(s).toHaveProperty('participants');
      });

      realTimeAIMultimodalCollaborationSystem.stop();
    });
  });

  describe('getSession', () => {
    it('ID로 세션 조회', () => {
      realTimeAIMultimodalCollaborationSystem.start();

      const session = realTimeAIMultimodalCollaborationSystem.getSession('multimodal-session-1');

      expect(session).toBeDefined();
      expect(session?.sessionId).toBe('multimodal-session-1');
      expect(session?.title).toBe('AI 프로젝트 브레인스토밍');

      realTimeAIMultimodalCollaborationSystem.stop();
    });

    it('존재하지 않는 ID는 undefined', () => {
      const result = realTimeAIMultimodalCollaborationSystem.getSession('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('addMultimodalInteraction', () => {
    it('상호작용 추가', () => {
      realTimeAIMultimodalCollaborationSystem.start();

      const interaction = realTimeAIMultimodalCollaborationSystem.addMultimodalInteraction(
        'multimodal-session-1',
        {
          sessionId: 'multimodal-session-1',
          participantId: 'user-1',
          modalities: ['text'],
          content: { text: '테스트 메시지' },
          timestamp: Date.now(),
          duration: 100
        }
      );

      expect(interaction).toBeDefined();
      expect(interaction.interactionId).toMatch(/^interaction-/);
      expect(interaction.content.text).toBe('테스트 메시지');
      expect(interaction.analysis).toBeDefined();

      realTimeAIMultimodalCollaborationSystem.stop();
    });

    it('존재하지 않는 세션 ID 시 에러', () => {
      realTimeAIMultimodalCollaborationSystem.start();

      expect(() =>
        realTimeAIMultimodalCollaborationSystem.addMultimodalInteraction('nonexistent', {
          sessionId: 'nonexistent',
          participantId: 'user-1',
          modalities: ['text'],
          content: {},
          timestamp: Date.now(),
          duration: 0
        })
      ).toThrow('세션을 찾을 수 없습니다');

      realTimeAIMultimodalCollaborationSystem.stop();
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = realTimeAIMultimodalCollaborationSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalInteractions).toBe('number');
      expect(metrics.modalityUsage).toBeDefined();
    });
  });
});
