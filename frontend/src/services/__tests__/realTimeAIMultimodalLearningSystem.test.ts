/**
 * realTimeAIMultimodalLearningSystem 테스트
 */
import realTimeAIMultimodalLearningSystem from '../realTimeAIMultimodalLearningSystem';

jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    createAlert: jest.fn()
  }
}));

describe('realTimeAIMultimodalLearningSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addInput', () => {
    it('멀티모달 입력 추가', () => {
      const input = {
        id: 'input-1',
        type: 'text' as const,
        content: { text: '테스트 입력' },
        timestamp: new Date(),
        userId: 'user-1',
        sessionId: 'session-1',
        confidence: 0.9
      };

      expect(() => realTimeAIMultimodalLearningSystem.addInput(input)).not.toThrow();
    });
  });

  describe('getLearningPath', () => {
    it('학습 경로 조회 (없을 때 undefined)', () => {
      const path = realTimeAIMultimodalLearningSystem.getLearningPath('user-nonexistent');
      expect(path).toBeUndefined();
    });
  });

  describe('getPatterns', () => {
    it('학습 패턴 목록 반환', () => {
      const patterns = realTimeAIMultimodalLearningSystem.getPatterns('user-1');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getRecommendations', () => {
    it('학습 추천 목록 반환', () => {
      const recommendations = realTimeAIMultimodalLearningSystem.getRecommendations('user-1');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('getAnalyses', () => {
    it('멀티모달 분석 목록 반환', () => {
      const analyses = realTimeAIMultimodalLearningSystem.getAnalyses('user-1');
      expect(Array.isArray(analyses)).toBe(true);
    });
  });

  describe('getModules', () => {
    it('학습 모듈 목록 반환', () => {
      const modules = realTimeAIMultimodalLearningSystem.getModules();
      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe('addModule', () => {
    it('학습 모듈 추가', () => {
      const module = {
        id: 'module-test',
        title: '테스트 모듈',
        type: 'textual' as const,
        difficulty: 'easy' as const,
        duration: 30,
        prerequisites: [],
        content: { text: '테스트 내용' },
        completionRate: 0,
        averageScore: 0
      };

      expect(() => realTimeAIMultimodalLearningSystem.addModule(module)).not.toThrow();
    });
  });

  describe('updateModule', () => {
    it('학습 모듈 업데이트', () => {
      const module = {
        id: 'module-update',
        title: '업데이트 테스트',
        type: 'visual' as const,
        difficulty: 'medium' as const,
        duration: 45,
        prerequisites: [],
        content: {},
        completionRate: 0,
        averageScore: 0
      };

      realTimeAIMultimodalLearningSystem.addModule(module);
      expect(() => {
        realTimeAIMultimodalLearningSystem.updateModule('module-update', { title: '업데이트됨' });
      }).not.toThrow();
    });
  });

  describe('start / stop', () => {
    it('시스템 시작 및 중지', () => {
      expect(() => realTimeAIMultimodalLearningSystem.start()).not.toThrow();
      expect(() => realTimeAIMultimodalLearningSystem.stop()).not.toThrow();
    });
  });
});
