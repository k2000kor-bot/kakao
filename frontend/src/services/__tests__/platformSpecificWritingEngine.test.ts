/**
 * PlatformSpecificWritingEngine 테스트
 */
import platformSpecificWritingEngine from '../platformSpecificWritingEngine';
import type { PlatformWritingRequest } from '../platformSpecificWritingEngine';

const createPlatformRequest = (overrides: Partial<PlatformWritingRequest> = {}): PlatformWritingRequest => ({
  content: '환경 보호를 위한 지속 가능한 에너지 전환에 대한 콘텐츠입니다.',
  targetPlatform: ['facebook', 'instagram'],
  writingGoal: 'awareness',
  audience: {
    primary: ['일반 소비자'],
    secondary: ['환경 운동가'],
    demographics: { age: '25-45', region: 'urban' }
  },
  brandVoice: {
    personality: ['친근함', '신뢰감'],
    tone: ['긍정적', '전문적'],
    values: ['환경', '지속가능성'],
    avoidance: ['공격적 표현']
  },
  constraints: {
    timeframe: '1주',
    budget: '보통',
    resources: ['콘텐츠 팀'],
    compliance: ['광고 규정']
  },
  ...overrides
});

describe('PlatformSpecificWritingEngine', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('optimizeForPlatforms', () => {
    it('플랫폼별 글쓰기 최적화', async () => {
      const request = createPlatformRequest();
      const result = await platformSpecificWritingEngine.optimizeForPlatforms(request);

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
      expect(result.strategy.masterMessage).toBeDefined();
      expect(Array.isArray(result.strategy.platformAdaptations)).toBe(true);
      expect(result.strategy.platformAdaptations.length).toBe(request.targetPlatform.length);
      expect(result.adaptations).toBeDefined();
      expect(result.adaptations.length).toBe(request.targetPlatform.length);
      expect(result.insights).toBeDefined();
      expect(result.insights.strengths).toBeDefined();
      expect(result.insights.weaknesses).toBeDefined();
      expect(result.insights.opportunities).toBeDefined();
      expect(result.insights.threats).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations.immediate)).toBe(true);
    });

    it('단일 플랫폼 최적화', async () => {
      const request = createPlatformRequest({ targetPlatform: ['twitter'] });
      const result = await platformSpecificWritingEngine.optimizeForPlatforms(request);

      expect(result.adaptations.length).toBe(1);
      expect(result.adaptations[0].platform).toBe('twitter');
    });
  });

  describe('analyzePlatformPerformance', () => {
    it('플랫폼 성능 분석', async () => {
      const result = await platformSpecificWritingEngine.analyzePlatformPerformance(
        'content-1',
        ['facebook', 'instagram'],
        '1day'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.performance)).toBe(true);
      expect(result.performance.length).toBe(2);
      expect(result.performance[0]).toHaveProperty('platform');
      expect(result.performance[0]).toHaveProperty('metrics');
      expect(result.performance[0].metrics).toHaveProperty('reach');
      expect(result.performance[0].metrics).toHaveProperty('engagement');
      expect(result.comparativeAnalysis).toBeDefined();
      expect(result.comparativeAnalysis.bestPerforming).toBeDefined();
      expect(result.comparativeAnalysis.leastPerforming).toBeDefined();
      expect(Array.isArray(result.optimizationOpportunities)).toBe(true);
      expect(result.nextActions).toBeDefined();
    });
  });

  describe('optimizeWithTrends', () => {
    it('트렌드 기반 콘텐츠 최적화', async () => {
      const result = await platformSpecificWritingEngine.optimizeWithTrends(
        '환경 관련 콘텐츠',
        ['instagram', 'tiktok'],
        {
          instagram: { hot: ['#지속가능성'], opportunities: ['리얼타임'], risks: [] },
          tiktok: { hot: ['쇼츠'], opportunities: ['바이럴'], risks: ['저작권'] }
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.trendOptimizedContent)).toBe(true);
      expect(result.trendOptimizedContent.length).toBe(2);
      expect(result.trendOptimizedContent[0]).toHaveProperty('platform');
      expect(result.trendOptimizedContent[0]).toHaveProperty('content');
      expect(result.trendOptimizedContent[0]).toHaveProperty('trendsApplied');
      expect(result.trendAnalysis).toBeDefined();
      expect(result.coordination).toBeDefined();
    });
  });

  describe('setupPlatformABTests', () => {
    it('플랫폼 A/B 테스트 설계', async () => {
      const result = await platformSpecificWritingEngine.setupPlatformABTests(
        '테스트 콘텐츠',
        ['facebook'],
        ['전환율 향상', '참여도 증가'],
        '2주'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.testConfigurations)).toBe(true);
      expect(result.testConfigurations[0]).toHaveProperty('platform');
      expect(result.testConfigurations[0]).toHaveProperty('variants');
      expect(result.testingPlan).toBeDefined();
      expect(result.analysisFramework).toBeDefined();
      expect(result.analysisFramework.confidenceLevel).toBe(95);
    });
  });
});
