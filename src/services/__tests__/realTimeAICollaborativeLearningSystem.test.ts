/**
 * realTimeAICollaborativeLearningSystem 테스트
 */
import realTimeAICollaborativeLearningSystem from '../realTimeAICollaborativeLearningSystem';

jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    createAlert: jest.fn()
  }
}));

describe('realTimeAICollaborativeLearningSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeSystem', () => {
    it('시스템 초기화', () => {
      expect(() => realTimeAICollaborativeLearningSystem.initializeSystem()).not.toThrow();
    });
  });

  describe('createCollaborativeSession', () => {
    it('협업 세션 생성', () => {
      const sessionId = realTimeAICollaborativeLearningSystem.createCollaborativeSession({
        name: '테스트 세션',
        description: '테스트',
        session_type: 'brainstorming',
        participants: ['user-1'],
        facilitators: [],
        status: 'planning',
        settings: {
          max_participants: 10,
          session_duration: 60,
          collaboration_mode: 'synchronous',
          privacy_level: 'public',
          recording_enabled: false,
          ai_assistance_level: 'moderate'
        }
      });

      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^session-/);
    });
  });

  describe('getCollaborativeSessions', () => {
    it('세션 목록 반환', () => {
      const sessions = realTimeAICollaborativeLearningSystem.getCollaborativeSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getCollaborativeSession', () => {
    it('세션 조회', () => {
      const sessionId = realTimeAICollaborativeLearningSystem.createCollaborativeSession({
        name: '조회 테스트',
        description: '테스트',
        session_type: 'problem_solving',
        participants: ['user-1'],
        facilitators: [],
        status: 'active',
        settings: {
          max_participants: 5,
          session_duration: 30,
          collaboration_mode: 'asynchronous',
          privacy_level: 'private',
          recording_enabled: true,
          ai_assistance_level: 'high'
        }
      });

      const session = realTimeAICollaborativeLearningSystem.getCollaborativeSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.name).toBe('조회 테스트');
    });
  });

  describe('addInteraction', () => {
    it('상호작용 추가', () => {
      const sessionId = realTimeAICollaborativeLearningSystem.createCollaborativeSession({
        name: '상호작용 테스트',
        description: '테스트',
        session_type: 'knowledge_sharing',
        participants: ['user-1'],
        facilitators: [],
        status: 'active',
        settings: {
          max_participants: 10,
          session_duration: 60,
          collaboration_mode: 'synchronous',
          privacy_level: 'public',
          recording_enabled: false,
          ai_assistance_level: 'moderate'
        }
      });

      const interactionId = realTimeAICollaborativeLearningSystem.addInteraction(sessionId, {
        session_id: sessionId,
        user_id: 'user-1',
        interaction_type: 'message',
        content: '테스트 메시지',
        metadata: {},
        reactions: []
      });

      expect(interactionId).toBeDefined();
      expect(interactionId).toMatch(/^interaction-/);
    });

    it('존재하지 않는 세션 시 에러', () => {
      expect(() => {
        realTimeAICollaborativeLearningSystem.addInteraction('nonexistent', {
          session_id: 'nonexistent',
          user_id: 'user-1',
          interaction_type: 'message',
          content: 'test',
          metadata: {},
          reactions: []
        });
      }).toThrow('찾을 수 없습니다');
    });
  });

  describe('getInteractions', () => {
    it('상호작용 목록 반환', () => {
      const sessionId = realTimeAICollaborativeLearningSystem.createCollaborativeSession({
        name: '상호작용 목록 테스트',
        description: '테스트',
        session_type: 'group_discussion',
        participants: ['user-1'],
        facilitators: [],
        status: 'active',
        settings: {
          max_participants: 10,
          session_duration: 60,
          collaboration_mode: 'synchronous',
          privacy_level: 'public',
          recording_enabled: false,
          ai_assistance_level: 'moderate'
        }
      });

      const interactions = realTimeAICollaborativeLearningSystem.getInteractions(sessionId);
      expect(Array.isArray(interactions)).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = realTimeAICollaborativeLearningSystem.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalSessions).toBe('number');
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태 반환', () => {
      const health = realTimeAICollaborativeLearningSystem.getSystemHealth();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
    });
  });
});
