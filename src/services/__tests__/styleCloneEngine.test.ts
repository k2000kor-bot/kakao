/**
 * StyleCloneEngine 테스트
 */
import styleCloneEngine from '../styleCloneEngine';
import styleAnalysisEngine from '../styleAnalysisEngine';
describe('StyleCloneEngine', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('cloneStyle', () => {
    it('스타일 복제', async () => {
      const result = await styleCloneEngine.cloneStyle({
        originalText: '환경 보호는 매우 중요한 과제입니다. 우리는 지속 가능한 미래를 위해 노력해야 합니다.',
        newTopic: '인공지능의 미래'
      });

      expect(result).toBeDefined();
      expect(result.generatedText).toBeDefined();
      expect(result.generatedText.length).toBeGreaterThan(0);
      expect(typeof result.styleMatchScore).toBe('number');
      expect(result.originalProfile).toBeDefined();
      expect(result.appliedProfile).toBeDefined();
      expect(Array.isArray(result.deviations)).toBe(true);
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('preserveExactStyle 옵션으로 복제', async () => {
      const result = await styleCloneEngine.cloneStyle({
        originalText: '간결한 문장. 두 번째 문장.',
        newTopic: '새 주제',
        preserveExactStyle: true
      });

      expect(result).toBeDefined();
      expect(result.generatedText.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('generateWithDetailedControl', () => {
    it('정밀 스타일 제어로 생성', async () => {
      const analysis = await styleAnalysisEngine.analyzeStyle({
        text: '테스트용 텍스트입니다. 스타일 프로필을 추출합니다.'
      });

      const result = await styleCloneEngine.generateWithDetailedControl(
        '새 주제',
        analysis.profile,
        { exactWordCount: 30 }
      );

      expect(result).toBeDefined();
      expect(result.generatedText).toBeDefined();
      expect(typeof result.styleMatchScore).toBe('number');
      expect(result.originalProfile).toBeDefined();
    });
  });

  describe('getLearnedPatterns', () => {
    it('학습된 패턴 목록 반환', () => {
      const patterns = styleCloneEngine.getLearnedPatterns();

      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('deletePattern', () => {
    it('존재하지 않는 패턴 삭제 시 false', () => {
      const result = styleCloneEngine.deletePattern('nonexistent-pattern');

      expect(result).toBe(false);
    });
  });

  describe('learnStylePattern', () => {
    it('스타일 패턴 학습 후 삭제', async () => {
      await styleCloneEngine.learnStylePattern(
        'test-pattern',
        ['샘플 텍스트 1', '샘플 텍스트 2'],
        '테스트용 패턴'
      );

      const patterns = styleCloneEngine.getLearnedPatterns();
      const learned = patterns.find(p => p.name === 'test-pattern');
      expect(learned).toBeDefined();

      const deleted = styleCloneEngine.deletePattern('test-pattern');
      expect(deleted).toBe(true);
    });
  });

  describe('generateFromLearnedPattern', () => {
    it('학습된 패턴으로 텍스트 생성', async () => {
      await styleCloneEngine.learnStylePattern(
        'gen-pattern',
        ['샘플 문장입니다. 스타일을 따릅니다.'],
        '생성 테스트용'
      );

      const result = await styleCloneEngine.generateFromLearnedPattern(
        'gen-pattern',
        '디지털 변혁'
      );

      expect(result).toBeDefined();
      expect(result.generatedText).toBeDefined();
      expect(typeof result.generatedText).toBe('string');
      expect(typeof result.styleMatchScore).toBe('number');
      expect(result.originalProfile).toBeDefined();
      expect(result.appliedProfile).toBeDefined();

      styleCloneEngine.deletePattern('gen-pattern');
    });

    it('존재하지 않는 패턴 시 에러', async () => {
      await expect(
        styleCloneEngine.generateFromLearnedPattern('nonexistent-pattern', '주제')
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });
});
