/**
 * SocialMediaInteractionEngine 테스트
 */
import socialMediaInteractionEngine from '../socialMediaInteractionEngine';
import type { CommentStrategy, DebatePosition, ViralContentOptimization } from '../socialMediaInteractionEngine';

describe('SocialMediaInteractionEngine', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateSocialMediaPost', () => {
    it('소셜 미디어 게시글 생성', async () => {
      const result = await socialMediaInteractionEngine.generateSocialMediaPost(
        '환경 보호의 중요성',
        'instagram',
        'inform',
        ['청년층', '환경 관심층']
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
      expect(result.posts.length).toBeGreaterThan(0);
      expect(result.posts[0].content).toBeDefined();
      expect(result.posts[0].platform).toBe('instagram');
      expect(Array.isArray(result.variations)).toBe(true);
      expect(Array.isArray(result.optimizationTips)).toBe(true);
      expect(typeof result.engagementPrediction).toBe('number');
      expect(typeof result.viralScore).toBe('number');
    });

    it('트위터용 게시글 생성', async () => {
      const result = await socialMediaInteractionEngine.generateSocialMediaPost(
        'AI 기술 동향',
        'twitter',
        'inform',
        ['개발자']
      );

      expect(result.posts[0].platform).toBe('twitter');
    });
  });

  describe('generateComment', () => {
    it('댓글 생성', async () => {
      const strategy: CommentStrategy = {
        approach: 'supportive',
        responseType: 'agreement',
        tonality: 'respectful',
        engagementGoal: 'show_support'
      };

      const result = await socialMediaInteractionEngine.generateComment(
        '환경 보호를 위해 일회용품 사용을 줄여야 합니다.',
        strategy
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.comments)).toBe(true);
      expect(result.comments.length).toBeGreaterThan(0);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.sentiment).toBeDefined();
      expect(typeof result.engagementStrategy).toBe('string');
      expect(Array.isArray(result.followUpSuggestions)).toBe(true);
      expect(result.riskAssessment).toBeDefined();
    });
  });

  describe('generateCounterArgument', () => {
    it('반박글 생성', async () => {
      const position: DebatePosition = {
        stance: 'moderately_against',
        argumentType: 'logical',
        evidenceLevel: 'research_based',
        rhetoricalStrategy: 'fact_checking'
      };

      const result = await socialMediaInteractionEngine.generateCounterArgument(
        '일회용품 금지는 경제에 부정적 영향을 미친다.',
        position,
        ['연구 데이터 1', '통계 2']
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.counterArguments)).toBe(true);
      expect(result.counterArguments.length).toBeGreaterThan(0);
      expect(result.logicalStructure).toBeDefined();
      expect(result.logicalStructure.premise).toBeDefined();
      expect(result.rhetoricalAnalysis).toBeDefined();
      expect(typeof result.effectivenessScore).toBe('number');
      expect(typeof result.responseStrategy).toBe('string');
    });
  });

  describe('optimizeForViral', () => {
    it('바이럴 콘텐츠 최적화', async () => {
      const optimization: ViralContentOptimization = {
        clickbaitLevel: 30,
        emotionalHooks: ['공감', '호기심'],
        shareabilityFactors: ['실용성', '재미'],
        platformOptimization: {},
        trendingTopics: ['환경'],
        controversyLevel: 20
      };

      const result = await socialMediaInteractionEngine.optimizeForViral(
        '환경 보호를 위한 5가지 실천 방법',
        'instagram',
        optimization
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.optimizedContent)).toBe(true);
      expect(result.optimizedContent.length).toBeGreaterThan(0);
      expect(result.viralElements).toBeDefined();
      expect(Array.isArray(result.viralElements.hooks)).toBe(true);
      expect(result.platformSpecific).toBeDefined();
      expect(Array.isArray(result.riskWarnings)).toBe(true);
      expect(Array.isArray(result.ethicalConsiderations)).toBe(true);
    });
  });

  describe('generateTrendingContent', () => {
    it('트렌드 기반 콘텐츠 생성', async () => {
      const result = await socialMediaInteractionEngine.generateTrendingContent(
        '지속가능한 패션',
        ['#에코패션', '#업사이클링'],
        'instagram',
        '20s'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.trendingPosts)).toBe(true);
      expect(result.trendingPosts.length).toBeGreaterThan(0);
      expect(result.trendAnalysis).toBeDefined();
      expect(result.trendAnalysis.relevantTrends).toBeDefined();
      expect(typeof result.trendAnalysis.trendStrength).toBe('number');
      expect(result.timingStrategy).toBeDefined();
      expect(result.crossPlatformStrategy).toBeDefined();
    });
  });
});
