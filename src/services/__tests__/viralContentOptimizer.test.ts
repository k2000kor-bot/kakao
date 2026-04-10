/**
 * ViralContentOptimizer 테스트
 */
import viralContentOptimizer from '../viralContentOptimizer';
import type { ViralOptimizationRequest } from '../viralContentOptimizer';

const createOptimizationRequest = (overrides: Partial<ViralOptimizationRequest> = {}): ViralOptimizationRequest => ({
  content: 'AI 기술의 미래에 대한 흥미로운 이야기를 공유합니다.',
  targetPlatform: 'instagram',
  targetAudience: {
    ageGroup: '20s',
    interests: ['테크', '혁신'],
    demographics: [],
    psychographics: []
  },
  viralGoal: 'engagement',
  riskTolerance: 'moderate',
  contentType: 'text',
  ...overrides
});

describe('ViralContentOptimizer', () => {
  describe('optimizeForViral', () => {
    it('바이럴 최적화 수행', async () => {
      const request = createOptimizationRequest();
      const result = await viralContentOptimizer.optimizeForViral(request);

      expect(result).toBeDefined();
      expect(Array.isArray(result.optimizedContent)).toBe(true);
      expect(result.optimizedContent.length).toBeGreaterThan(0);
      expect(result.analysis).toBeDefined();
      expect(result.strategy).toBeDefined();
      expect(result.predictions).toBeDefined();

      const content = result.optimizedContent[0];
      expect(content.originalContent).toBe(request.content);
      expect(content.optimizedContent).toBeDefined();
      expect(typeof content.viralScore).toBe('number');
      expect(content.viralScore).toBeGreaterThanOrEqual(0);
      expect(content.viralScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(content.shareabilityFactors)).toBe(true);
      expect(Array.isArray(content.emotionalHooks)).toBe(true);
    });

    it('트렌딩 콘텐츠 생성', async () => {
      const request = createOptimizationRequest({ viralGoal: 'trending' });
      const result = await viralContentOptimizer.optimizeForViral(request);

      expect(result.optimizedContent.length).toBeGreaterThan(0);
    });
  });

  describe('generateTrendingContent', () => {
    it('트렌드 기반 콘텐츠 생성', async () => {
      const result = await viralContentOptimizer.generateTrendingContent(
        'AI 기술',
        'instagram',
        { ageGroup: '20s', interests: [], demographics: [], psychographics: [] },
        'immediate'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.trendingContent)).toBe(true);
      result.trendingContent.forEach(content => {
        expect(content.originalContent).toBeDefined();
        expect(content.optimizedContent).toBeDefined();
        expect(typeof content.viralScore).toBe('number');
      });
      expect(result.trendInsights).toBeDefined();
      expect(result.competitorAnalysis).toBeDefined();
      expect(result.actionPlan).toBeDefined();
    });
  });

  describe('generateViralVariants', () => {
    it('바이럴 변형 생성', async () => {
      const baseContent = '이 내용을 여러 스타일로 변형해주세요.';
      const result = await viralContentOptimizer.generateViralVariants(
        baseContent,
        'instagram',
        2,
        ['engagement', 'shares']
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.variants)).toBe(true);
      expect(result.variants.length).toBe(2);
      result.variants.forEach(v => {
        expect(v.content.originalContent).toBe(baseContent);
        expect(v.content.optimizedContent).toBeDefined();
        expect(typeof v.content.viralScore).toBe('number');
        expect(v.testingFocus).toBeDefined();
      });
    });

    it('트위터 플랫폼 바이럴 변형 생성', async () => {
      const result = await viralContentOptimizer.generateViralVariants(
        '짧은 트윗용 내용',
        'twitter',
        1,
        ['engagement']
      );

      expect(result).toBeDefined();
      expect(result.variants.length).toBe(1);
      expect(result.variants[0].content.viralScore).toBeGreaterThanOrEqual(0);
      expect(result.variants[0].content.viralScore).toBeLessThanOrEqual(100);
    });
  });

  describe('optimizeForViral 플랫폼별', () => {
    it('유튜브 플랫폼 최적화', async () => {
      const request = createOptimizationRequest({
        targetPlatform: 'youtube',
        viralGoal: 'engagement',
      });
      const result = await viralContentOptimizer.optimizeForViral(request);

      expect(result.optimizedContent.length).toBeGreaterThan(0);
      expect(result.strategy).toBeDefined();
      expect(result.predictions).toBeDefined();
    });

    it('shares 목표 최적화', async () => {
      const request = createOptimizationRequest({ viralGoal: 'shares' });
      const result = await viralContentOptimizer.optimizeForViral(request);

      expect(result.optimizedContent[0].shareabilityFactors.length).toBeGreaterThanOrEqual(0);
      expect(result.optimizedContent[0].emotionalHooks.length).toBeGreaterThanOrEqual(0);
    });
  });
});
