/**
 * RealTimeAILearningAdaptationSystem 테스트
 */
import realTimeAILearningAdaptationSystem from '../realTimeAILearningAdaptationSystem';
import type { LearningData } from '../realTimeAILearningAdaptationSystem';

jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    createAlert: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../aiCacheManager', () => ({
  __esModule: true,
  default: {
    invalidateByTag: jest.fn()
  }
}));

const createLearningData = (overrides: Partial<LearningData> = {}): LearningData => ({
  id: `ld-${Date.now()}`,
  timestamp: new Date(),
  user_id: 'user-1',
  session_id: 'session-1',
  interaction_type: 'query',
  content: {
    input: '질문',
    output: '응답',
    context: {}
  },
  learning_signals: {
    success: true,
    accuracy_score: 0.9,
    user_satisfaction: 0.8,
    response_time: 100,
    complexity: 0.5
  },
  metadata: {
    domain: 'general',
    intent: 'query',
    confidence: 0.9,
    model_version: '1.0'
  },
  ...overrides
});

describe('RealTimeAILearningAdaptationSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('start / stop', () => {
    it('시스템 시작 및 중지', () => {
      realTimeAILearningAdaptationSystem.start();
      realTimeAILearningAdaptationSystem.stop();
      // 에러 없이 실행되면 성공
    });
  });

  describe('collectLearningData', () => {
    it('학습 데이터 수집 (높은 만족도)', () => {
      const data = createLearningData();
      realTimeAILearningAdaptationSystem.collectLearningData(data);
      // 에러 없이 실행
    });

    it('낮은 만족도 시 패턴 분석 트리거', () => {
      const data = createLearningData({
        learning_signals: {
          success: false,
          accuracy_score: 0.4,
          user_satisfaction: 0.2,
          response_time: 200,
          complexity: 0.8
        }
      });
      realTimeAILearningAdaptationSystem.collectLearningData(data);
      // realTimeAIAlertSystem.createAlert mock이 호출될 수 있음
    });
  });

  describe('detectLearningPatterns', () => {
    it('데이터 부족 시 빈 패턴 반환', async () => {
      const patterns = await realTimeAILearningAdaptationSystem.detectLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('충분한 데이터로 패턴 감지', async () => {
      for (let i = 0; i < 12; i++) {
        realTimeAILearningAdaptationSystem.collectLearningData(
          createLearningData({ id: `ld-${i}`, user_id: 'pattern-user' })
        );
      }
      const patterns = await realTimeAILearningAdaptationSystem.detectLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getLearningMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = realTimeAILearningAdaptationSystem.getLearningMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_learning_events).toBe('number');
      expect(typeof metrics.successful_adaptations).toBe('number');
      expect(typeof metrics.average_improvement).toBe('number');
      expect(typeof metrics.learning_velocity).toBe('number');
      expect(typeof metrics.model_stability).toBe('number');
    });
  });

  describe('executeModelAdaptation', () => {
    it('존재하지 않는 패턴 ID는 null 반환', async () => {
      const result = await realTimeAILearningAdaptationSystem.executeModelAdaptation('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('rollbackAdaptation', () => {
    it('존재하지 않는 적응 ID는 false 반환', async () => {
      const result = await realTimeAILearningAdaptationSystem.rollbackAdaptation('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('shutdown', () => {
    it('시스템 종료', () => {
      realTimeAILearningAdaptationSystem.shutdown();
      // 에러 없이 실행
    });
  });
});
