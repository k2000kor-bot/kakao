/**
 * UltraAdvancedAIEmotionRecognitionSystem 테스트
 */
import ultraAdvancedAIEmotionRecognitionSystem from '../ultraAdvancedAIEmotionRecognitionSystem';

describe('UltraAdvancedAIEmotionRecognitionSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInitializationStatus', () => {
    it('초기화 완료 시 true', () => {
      expect(ultraAdvancedAIEmotionRecognitionSystem.getInitializationStatus()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('설정 반환', () => {
      const config = ultraAdvancedAIEmotionRecognitionSystem.getConfig();

      expect(config).toBeDefined();
      expect(config.enable_multimodal).toBe(true);
      expect(config.enable_pattern_analysis).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('설정 업데이트', () => {
      ultraAdvancedAIEmotionRecognitionSystem.updateConfig({ sensitivity_level: 'high' });
      const config = ultraAdvancedAIEmotionRecognitionSystem.getConfig();
      expect(config.sensitivity_level).toBe('high');

      ultraAdvancedAIEmotionRecognitionSystem.updateConfig({ sensitivity_level: 'medium' });
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAIEmotionRecognitionSystem.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_analyses).toBe('number');
      expect(typeof metrics.accuracy_rate).toBe('number');
    });
  });

  describe('analyzeEmotion', () => {
    it('텍스트 감정 분석', async () => {
      const result = await ultraAdvancedAIEmotionRecognitionSystem.analyzeEmotion(
        '오늘 정말 기쁜 일이 있었어요!',
        'text'
      );

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^emotion-/);
      expect(result.type).toBe('text');
      expect(result.content).toBe('오늘 정말 기쁜 일이 있었어요!');
      expect(Array.isArray(result.detected_emotions)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('슬픈 텍스트 감정 분석', async () => {
      const result = await ultraAdvancedAIEmotionRecognitionSystem.analyzeEmotion(
        '힘들고 우울한 하루였어요',
        'text'
      );

      expect(result.detected_emotions.length).toBeGreaterThan(0);
    });
  });

  describe('getEmotionData', () => {
    it('감정 데이터 목록 반환', async () => {
      await ultraAdvancedAIEmotionRecognitionSystem.analyzeEmotion('테스트', 'text');

      const data = ultraAdvancedAIEmotionRecognitionSystem.getEmotionData(5);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach(d => {
        expect(d).toHaveProperty('id');
        expect(d).toHaveProperty('detected_emotions');
      });
    });

    it('limit 적용', async () => {
      const data = ultraAdvancedAIEmotionRecognitionSystem.getEmotionData(2);
      expect(data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getEmotionPatterns', () => {
    it('패턴 목록 반환', () => {
      const patterns = ultraAdvancedAIEmotionRecognitionSystem.getEmotionPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('userId 필터', () => {
      const patterns = ultraAdvancedAIEmotionRecognitionSystem.getEmotionPatterns('default');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('deleteEmotionData', () => {
    it('존재하지 않는 ID 시 에러', async () => {
      await expect(
        ultraAdvancedAIEmotionRecognitionSystem.deleteEmotionData('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });

    it('감정 데이터 삭제', async () => {
      const result = await ultraAdvancedAIEmotionRecognitionSystem.analyzeEmotion('삭제 대상', 'text');

      await ultraAdvancedAIEmotionRecognitionSystem.deleteEmotionData(result.id);

      const data = ultraAdvancedAIEmotionRecognitionSystem.getEmotionData();
      const found = data.find(d => d.id === result.id);
      expect(found).toBeUndefined();
    });
  });
});
