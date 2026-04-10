/**
 * UltraAdvancedAIIntegratedChatSystem 테스트
 */
import ultraAdvancedAIIntegratedChatSystem from '../ultraAdvancedAIIntegratedChatSystem';

const mockPerformUltraAnalysis = jest.fn();
const mockGetIntegrations = jest.fn();

jest.mock('../ultraAdvancedAIService', () => ({
  ultraAdvancedAIService: {
    performUltraAnalysis: (...args: unknown[]) => mockPerformUltraAnalysis(...args)
  }
}));

jest.mock('../ultraAdvancedAIIntegrationManager', () => ({
  __esModule: true,
  default: {
    getIntegrations: () => mockGetIntegrations()
  }
}));

describe('UltraAdvancedAIIntegratedChatSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    mockGetIntegrations.mockReturnValue([{ id: 'int-1', status: 'active' }]);
    mockPerformUltraAnalysis.mockResolvedValue({
      recommendations: ['AI 응답 추천'],
      analysis: {
        intent: 'general',
        sentiment: { label: 'neutral' },
        entities: [],
        contextRelevance: 0.9
      },
      confidence: 0.95
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const waitForInit = () => new Promise(resolve => setTimeout(resolve, 100));

  describe('getSettings', () => {
    it('설정 객체 반환', () => {
      const settings = ultraAdvancedAIIntegratedChatSystem.getSettings();

      expect(settings).toBeDefined();
      expect(settings.model).toBe('gpt-4');
      expect(settings.language).toBe('ko');
    });
  });

  describe('updateSettings', () => {
    it('설정 업데이트', () => {
      ultraAdvancedAIIntegratedChatSystem.updateSettings({ language: 'en' });
      const settings = ultraAdvancedAIIntegratedChatSystem.getSettings();
      expect(settings.language).toBe('en');

      ultraAdvancedAIIntegratedChatSystem.updateSettings({ language: 'ko' });
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAIIntegratedChatSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_sessions).toBe('number');
      expect(typeof metrics.total_messages).toBe('number');
    });
  });

  describe('createSession', () => {
    it('새 세션 생성', async () => {
      const sessionId = await ultraAdvancedAIIntegratedChatSystem.createSession('테스트 세션');

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^session-/);

      const session = ultraAdvancedAIIntegratedChatSystem.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.title).toBe('테스트 세션');
    });
  });

  describe('getSessions', () => {
    it('세션 목록 반환', async () => {
      await waitForInit();

      const sessions = ultraAdvancedAIIntegratedChatSystem.getSessions();

      expect(Array.isArray(sessions)).toBe(true);
      sessions.forEach(s => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('title');
        expect(s).toHaveProperty('messages');
      });
    });
  });

  describe('getSession', () => {
    it('ID로 세션 조회', async () => {
      const sessionId = await ultraAdvancedAIIntegratedChatSystem.createSession('조회 테스트');
      const session = ultraAdvancedAIIntegratedChatSystem.getSession(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
    });

    it('존재하지 않는 ID는 undefined', () => {
      const result = ultraAdvancedAIIntegratedChatSystem.getSession('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('setCurrentSession / getCurrentSession', () => {
    it('현재 세션 설정 및 조회', async () => {
      const sessionId = await ultraAdvancedAIIntegratedChatSystem.createSession('현재 세션');
      ultraAdvancedAIIntegratedChatSystem.setCurrentSession(sessionId);

      const current = ultraAdvancedAIIntegratedChatSystem.getCurrentSession();
      expect(current).toBeDefined();
      expect(current?.id).toBe(sessionId);
    });
  });

  describe('processMessage', () => {
    it('메시지 처리 후 AI 응답 반환', async () => {
      await waitForInit();

      const sessionId = await ultraAdvancedAIIntegratedChatSystem.createSession('대화 테스트');
      ultraAdvancedAIIntegratedChatSystem.setCurrentSession(sessionId);

      const response = await ultraAdvancedAIIntegratedChatSystem.processMessage('안녕하세요', sessionId);

      expect(response).toBeDefined();
      expect(response.type).toBe('ai');
      expect(typeof response.content).toBe('string');
      expect(mockPerformUltraAnalysis).toHaveBeenCalled();
    });

    it('존재하지 않는 세션 ID로 호출 시 에러', async () => {
      await expect(
        ultraAdvancedAIIntegratedChatSystem.processMessage('hi', 'nonexistent-session-id')
      ).rejects.toThrow('활성 세션을 찾을 수 없습니다');
    });
  });

  describe('updateUserProfile / getUserProfile', () => {
    it('사용자 프로필 업데이트 및 조회', () => {
      ultraAdvancedAIIntegratedChatSystem.updateUserProfile({ name: '테스트 유저' });
      const profile = ultraAdvancedAIIntegratedChatSystem.getUserProfile();

      expect(profile).toHaveProperty('name', '테스트 유저');
    });
  });

  describe('updateConversationContext / getConversationContext', () => {
    it('대화 컨텍스트 업데이트 및 조회', () => {
      ultraAdvancedAIIntegratedChatSystem.updateConversationContext({ topic: 'AI' });
      const context = ultraAdvancedAIIntegratedChatSystem.getConversationContext();

      expect(context).toHaveProperty('topic', 'AI');
    });
  });

  describe('getProcessingStatus', () => {
    it('처리 중이 아닐 때 false', () => {
      expect(ultraAdvancedAIIntegratedChatSystem.getProcessingStatus()).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('세션 메시지 초기화', async () => {
      const sessionId = await ultraAdvancedAIIntegratedChatSystem.createSession('초기화 테스트');
      ultraAdvancedAIIntegratedChatSystem.setCurrentSession(sessionId);
      await ultraAdvancedAIIntegratedChatSystem.processMessage('테스트', sessionId);

      await ultraAdvancedAIIntegratedChatSystem.clearSession(sessionId);

      const session = ultraAdvancedAIIntegratedChatSystem.getSession(sessionId);
      expect(session?.messages.length).toBe(0);
    });
  });
});
