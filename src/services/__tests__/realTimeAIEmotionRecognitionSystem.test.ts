/**
 * realTimeAIEmotionRecognitionSystem 테스트
 */
import realTimeAIEmotionRecognitionSystem from '../realTimeAIEmotionRecognitionSystem';

jest.mock('../realTimeAIAlertSystem', () => ({
  __esModule: true,
  default: {
    createAlert: jest.fn()
  }
}));

describe('realTimeAIEmotionRecognitionSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializeSystem', () => {
    it('시스템 초기화', () => {
      expect(() => realTimeAIEmotionRecognitionSystem.initializeSystem()).not.toThrow();
    });
  });

  describe('detectEmotion', () => {
    it('감정 감지', () => {
      const result = realTimeAIEmotionRecognitionSystem.detectEmotion(
        'user-1',
        'session-1',
        { text: '오늘 정말 기쁜 일이 있었어요!' }
      );

      expect(result).toBeDefined();
      expect(result.user_id).toBe('user-1');
      expect(result.session_id).toBe('session-1');
      expect(result.emotion_type).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('generateAdaptiveResponse', () => {
    it('적응적 응답 생성', () => {
      const emotionData = realTimeAIEmotionRecognitionSystem.detectEmotion(
        'user-1',
        'session-1',
        { text: '테스트' }
      );

      const response = realTimeAIEmotionRecognitionSystem.generateAdaptiveResponse(
        'user-1',
        emotionData
      );

      expect(response).toBeDefined();
      expect(response.emotion_data_id).toBe(emotionData.id);
      expect(response.content).toBeDefined();
      expect(response.response_type).toBeDefined();
      expect(response.tone).toBeDefined();
    });
  });

  describe('analyzeEmotionTrends', () => {
    it('감정 트렌드 분석', () => {
      realTimeAIEmotionRecognitionSystem.detectEmotion('user-1', 'session-1', { text: 'test1' });
      realTimeAIEmotionRecognitionSystem.detectEmotion('user-1', 'session-1', { text: 'test2' });

      const trend = realTimeAIEmotionRecognitionSystem.analyzeEmotionTrends('user-1', 'day');

      expect(trend).toBeDefined();
      expect(trend.user_id).toBe('user-1');
      expect(trend.time_period).toBe('day');
      expect(trend.dominant_emotion).toBeDefined();
      expect(typeof trend.average_valence).toBe('number');
    });
  });

  describe('getEmotionData', () => {
    it('감정 데이터 조회', () => {
      realTimeAIEmotionRecognitionSystem.detectEmotion('user-1', 'session-1', { text: 'test' });
      const data = realTimeAIEmotionRecognitionSystem.getEmotionData('user-1');

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('getEmotionResponses', () => {
    it('감정 응답 조회', () => {
      const emotionData = realTimeAIEmotionRecognitionSystem.detectEmotion(
        'user-1',
        'session-1',
        { text: 'test' }
      );
      realTimeAIEmotionRecognitionSystem.generateAdaptiveResponse('user-1', emotionData);

      const responses = realTimeAIEmotionRecognitionSystem.getEmotionResponses('user-1');

      expect(Array.isArray(responses)).toBe(true);
    });
  });

  describe('getEmotionContext', () => {
    it('감정 컨텍스트 조회', () => {
      realTimeAIEmotionRecognitionSystem.initializeSystem();
      const context = realTimeAIEmotionRecognitionSystem.getEmotionContext('user-001');

      expect(context).toBeDefined();
      expect(context?.user_id).toBe('user-001');
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = realTimeAIEmotionRecognitionSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_emotions_detected).toBe('number');
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태 반환', () => {
      const health = realTimeAIEmotionRecognitionSystem.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
    });
  });
});
