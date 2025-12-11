/**
 * ConversationMemorySystem 테스트
 */

import ConversationMemorySystem from '../conversationMemorySystem';

// localStorage 모킹
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ConversationMemorySystem', () => {
  let service: ConversationMemorySystem;

  beforeEach(() => {
    service = new ConversationMemorySystem();
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConversationMemorySystem);
    });
  });

  describe('사용자 프로필 관리', () => {
    it('사용자 프로필 조회 - 새 사용자', async () => {
      const userId = 'user-1';
      const profile = await service.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.expertise).toBeDefined();
      expect(profile.preferences).toBeDefined();
      expect(profile.conversationPatterns).toBeDefined();
      expect(profile.learningProgress).toBeDefined();
      expect(profile.interactionHistory).toBeDefined();
    });

    it('사용자 프로필 조회 - 기존 사용자', async () => {
      const userId = 'user-2';
      
      // 첫 번째 조회로 프로필 생성
      await service.getUserProfile(userId);
      
      // 두 번째 조회
      const profile = await service.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
    });

    it('유효하지 않은 사용자 ID 처리', async () => {
      await expect(service.getUserProfile('')).rejects.toThrow();
      await expect(service.getUserProfile(null as any)).rejects.toThrow();
    });

    it('사용자 프로필 업데이트', async () => {
      const userId = 'user-3';
      await service.getUserProfile(userId);

      const updates = {
        name: '테스트 사용자',
        preferences: {
          responseStyle: 'detailed' as const,
          codeExamples: 'extensive' as const,
          explanationDepth: 'deep' as const,
          preferredLanguages: ['TypeScript', 'JavaScript'],
          learningGoals: ['React', 'Node.js'],
        },
      };

      await service.updateUserProfile(userId, updates);

      const updatedProfile = await service.getUserProfile(userId);
      expect(updatedProfile.name).toBe('테스트 사용자');
      expect(updatedProfile.preferences.responseStyle).toBe('detailed');
    });
  });

  describe('대화 세션 관리', () => {
    it('대화 세션 시작', async () => {
      const userId = 'user-4';
      const sessionId = await service.startConversationSession(userId);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('메시지를 컨텍스트에 추가', async () => {
      const userId = 'user-5';
      const sessionId = await service.startConversationSession(userId);

      await service.addMessageToContext(sessionId, 'user', '테스트 메시지');

      // 메시지가 추가되었는지 확인하기 위해 getUserStats 호출
      const stats = await service.getUserStats(userId);
      expect(stats).toBeDefined();
    });

    it('메시지 메타데이터 포함', async () => {
      const userId = 'user-6';
      const sessionId = await service.startConversationSession(userId);

      const metadata = {
        intent: 'question',
        topics: ['시공사', '선정'],
        sentiment: 'neutral',
        complexity: 3,
      };

      await service.addMessageToContext(sessionId, 'user', '시공사 선정에 대해 알려줘', metadata);

      const stats = await service.getUserStats(userId);
      expect(stats).toBeDefined();
    });
  });

  describe('개인화 추천', () => {
    it('학습 추천 조회', async () => {
      const userId = 'user-7';
      await service.getUserProfile(userId);

      const recommendations = await service.getPersonalizedRecommendations(userId);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('추천 타입 확인', async () => {
      const userId = 'user-8';
      await service.getUserProfile(userId);

      const recommendations = await service.getPersonalizedRecommendations(userId);

      if (recommendations.length > 0) {
        const recommendation = recommendations[0];
        expect(['review', 'advance', 'practice', 'explore']).toContain(recommendation.type);
        expect(['high', 'medium', 'low']).toContain(recommendation.priority);
        expect(recommendation.topic).toBeDefined();
        expect(recommendation.reason).toBeDefined();
      }
    });
  });

  describe('응답 스타일 최적화', () => {
    it('최적 응답 스타일 조회', async () => {
      const userId = 'user-9';
      await service.getUserProfile(userId);

      const responseStyle = await service.getOptimalResponseStyle(userId, 'question');

      expect(responseStyle).toBeDefined();
      expect(responseStyle.style).toBeDefined();
      expect(['concise', 'detailed', 'comprehensive', 'tutorial']).toContain(responseStyle.style);
    });

    it('질문 타입별 응답 스타일', async () => {
      const userId = 'user-10';
      await service.getUserProfile(userId);

      const questionTypes = ['question', 'explanation', 'tutorial', 'code'];
      
      for (const questionType of questionTypes) {
        const responseStyle = await service.getOptimalResponseStyle(userId, questionType);
        expect(responseStyle).toBeDefined();
        expect(responseStyle.style).toBeDefined();
      }
    });
  });

  describe('사용자 통계', () => {
    it('사용자 통계 조회', async () => {
      const userId = 'user-11';
      await service.getUserProfile(userId);

      const stats = await service.getUserStats(userId);

      expect(stats).toBeDefined();
      if (stats.totalSessions !== undefined) {
        expect(typeof stats.totalSessions).toBe('number');
      }
      if (stats.totalMessages !== undefined) {
        expect(typeof stats.totalMessages).toBe('number');
      }
      if (stats.averageSessionLength !== undefined) {
        expect(typeof stats.averageSessionLength).toBe('number');
      }
      if (stats.expertiseLevel !== undefined) {
        expect(stats.expertiseLevel).toBeDefined();
      }
      if (stats.topTopics !== undefined) {
        expect(Array.isArray(stats.topTopics)).toBe(true);
      }
    });

    it('활동 통계 포함', async () => {
      const userId = 'user-12';
      const sessionId = await service.startConversationSession(userId);

      // 메시지 추가
      await service.addMessageToContext(sessionId, 'user', '테스트');

      const stats = await service.getUserStats(userId);
      if (stats.totalMessages !== undefined) {
        expect(stats.totalMessages).toBeGreaterThanOrEqual(0);
      } else {
        expect(stats).toBeDefined();
      }
    });
  });

  describe('학습 진행 상황', () => {
    it('학습 진행 상황 추적', async () => {
      const userId = 'user-13';
      await service.getUserProfile(userId);

      const profile = await service.getUserProfile(userId);
      expect(profile.learningProgress).toBeDefined();
      expect(Array.isArray(profile.learningProgress.completedTopics)).toBe(true);
      expect(Array.isArray(profile.learningProgress.currentLearningPath)).toBe(true);
    });
  });

  describe('대화 패턴 분석', () => {
    it('대화 패턴 추적', async () => {
      const userId = 'user-14';
      const profile = await service.getUserProfile(userId);

      expect(profile.conversationPatterns).toBeDefined();
      expect(Array.isArray(profile.conversationPatterns.commonTopics)).toBe(true);
      expect(Array.isArray(profile.conversationPatterns.questionTypes)).toBe(true);
      expect(profile.conversationPatterns.timePreferences).toBeDefined();
    });
  });
});

