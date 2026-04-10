/**
 * realEstateMarketAnalysisService 서비스 테스트
 * 부동산 시장 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { realEstateMarketAnalysisService } from '../realEstateMarketAnalysisService';

describe('realEstateMarketAnalysisService', () => {
  describe('analyzeMarketPrices', () => {
    it('전체 시장 가격을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeMarketPrices();

      expect(analysis).toBeDefined();
      expect(analysis.averagePrice).toBeGreaterThan(0);
      expect(analysis.priceRange).toBeDefined();
      expect(analysis.priceRange.min).toBeGreaterThan(0);
      expect(analysis.priceRange.max).toBeGreaterThan(0);
      expect(analysis.trendAnalysis).toBeDefined();
      expect(['rising', 'stable', 'falling']).toContain(analysis.trendAnalysis.direction);
      expect(analysis.comparativeAnalysis).toBeDefined();
      expect(Array.isArray(analysis.hotspots)).toBe(true);
    });

    it('지역별 시장 가격을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeMarketPrices('강남구');

      expect(analysis).toBeDefined();
      expect(analysis.averagePrice).toBeGreaterThan(0);
    });

    it('부동산 유형별 시장 가격을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeMarketPrices(undefined, 'apartment');

      expect(analysis).toBeDefined();
      expect(analysis.averagePrice).toBeGreaterThan(0);
    });

    it('지역과 유형을 함께 필터링할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeMarketPrices('강남구', 'apartment');

      expect(analysis).toBeDefined();
      expect(analysis.averagePrice).toBeGreaterThan(0);
    });

    it('트렌드 분석에 방향, 강도, 모멘텀이 포함되어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeMarketPrices();

      expect(analysis.trendAnalysis.direction).toBeDefined();
      expect(typeof analysis.trendAnalysis.strength).toBe('number');
      expect(typeof analysis.trendAnalysis.momentum).toBe('number');
    });
  });

  describe('analyzePolicyImpact', () => {
    it('현재 정책 영향을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzePolicyImpact('current');

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.activePolicies)).toBe(true);
      expect(['positive', 'negative', 'neutral']).toContain(analysis.overallImpact);
      expect(typeof analysis.impactScore).toBe('number');
      expect(Array.isArray(analysis.regionImpacts)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('예정된 정책 영향을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzePolicyImpact('upcoming');

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.activePolicies)).toBe(true);
    });

    it('과거 정책 영향을 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzePolicyImpact('historical');

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.activePolicies)).toBe(true);
    });

    it('기본값으로 현재 정책을 분석해야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzePolicyImpact();

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.activePolicies)).toBe(true);
    });
  });

  describe('analyzeInvestmentOpportunity', () => {
    it('투자 기회를 분석할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeInvestmentOpportunity('강남구', 'apartment', 1000000000);

      expect(analysis).toBeDefined();
      expect(typeof analysis.investmentScore).toBe('number');
      expect(analysis.investmentScore).toBeGreaterThanOrEqual(0);
      expect(analysis.investmentScore).toBeLessThanOrEqual(100);
      expect(['strong_buy', 'buy', 'hold', 'avoid']).toContain(analysis.recommendation);
      expect(analysis.expectedReturn).toBeDefined();
      expect(analysis.riskAssessment).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(analysis.riskAssessment.level);
      expect(analysis.optimalStrategy).toBeDefined();
      expect(Array.isArray(analysis.alternatives)).toBe(true);
    });

    it('존재하지 않는 지역/유형에 대해 기본 분석을 반환해야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeInvestmentOpportunity('존재하지않는지역', 'villa', 500000000);

      expect(analysis).toBeDefined();
      expect(analysis.recommendation).toBe('hold');
      expect(analysis.investmentScore).toBe(60);
    });

    it('투자 점수에 따라 적절한 추천을 해야 함', () => {
      const analysis = realEstateMarketAnalysisService.analyzeInvestmentOpportunity('강남구', 'apartment', 2000000000);

      if (analysis.investmentScore >= 80) {
        expect(analysis.recommendation).toBe('strong_buy');
      } else if (analysis.investmentScore >= 65) {
        expect(analysis.recommendation).toBe('buy');
      } else if (analysis.investmentScore < 40) {
        expect(analysis.recommendation).toBe('avoid');
      } else {
        expect(analysis.recommendation).toBe('hold');
      }
    });
  });

  describe('generateMarketForecast', () => {
    it('시장 예측을 생성할 수 있어야 함', () => {
      const forecast = realEstateMarketAnalysisService.generateMarketForecast('강남구', '6months');

      expect(forecast).toBeDefined();
      expect(forecast.region).toBe('강남구');
      expect(forecast.timeframe).toBe('6months');
      expect(forecast.priceProjection).toBeDefined();
      expect(forecast.priceProjection.optimistic).toBeGreaterThan(0);
      expect(forecast.priceProjection.realistic).toBeGreaterThan(0);
      expect(forecast.priceProjection.pessimistic).toBeGreaterThan(0);
      expect(forecast.priceProjection.confidence).toBeGreaterThanOrEqual(0);
      expect(forecast.priceProjection.confidence).toBeLessThanOrEqual(1);
      expect(forecast.volumeProjection).toBeDefined();
      expect(Array.isArray(forecast.keyDrivers)).toBe(true);
      expect(Array.isArray(forecast.riskFactors)).toBe(true);
      expect(Array.isArray(forecast.scenarioAnalysis)).toBe(true);
    });

    it('다양한 기간의 예측을 생성할 수 있어야 함', () => {
      const timeframes: Array<'3months' | '6months' | '1year' | '3years' | '5years'> = ['3months', '6months', '1year', '3years', '5years'];

      timeframes.forEach(timeframe => {
        const forecast = realEstateMarketAnalysisService.generateMarketForecast('강남구', timeframe);
        expect(forecast.timeframe).toBe(timeframe);
      });
    });

    it('동일한 예측을 재사용해야 함', () => {
      const forecast1 = realEstateMarketAnalysisService.generateMarketForecast('서초구', '1year');
      const forecast2 = realEstateMarketAnalysisService.generateMarketForecast('서초구', '1year');

      expect(forecast1).toBe(forecast2);
    });
  });

  describe('generateMarketAlerts', () => {
    it('시장 알림을 생성할 수 있어야 함', () => {
      const alerts = realEstateMarketAnalysisService.generateMarketAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('알림에 필수 필드가 포함되어야 함', () => {
      const alerts = realEstateMarketAnalysisService.generateMarketAlerts();

      if (alerts.length > 0) {
        const alert = alerts[0];
        expect(alert.id).toBeDefined();
        expect(alert.type).toBeDefined();
        expect(['price_surge', 'volume_spike', 'policy_change', 'development_news', 'market_anomaly']).toContain(alert.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
        expect(alert.region).toBeDefined();
        expect(alert.title).toBeDefined();
        expect(alert.description).toBeDefined();
        expect(alert.impact).toBeDefined();
        expect(typeof alert.actionRequired).toBe('boolean');
        expect(Array.isArray(alert.recommendations)).toBe(true);
        expect(alert.createdAt).toBeDefined();
      }
    });
  });

  describe('getRegionalAnalysis', () => {
    it('지역별 분석을 조회할 수 있어야 함', () => {
      const analysis = realEstateMarketAnalysisService.getRegionalAnalysis('강남구');

      expect(analysis).toBeDefined();
      if (analysis) {
        expect(analysis.region).toBe('강남구');
        expect(typeof analysis.population).toBe('number');
        expect(typeof analysis.populationGrowth).toBe('number');
        expect(typeof analysis.averageIncome).toBe('number');
        expect(typeof analysis.employmentRate).toBe('number');
        expect(Array.isArray(analysis.majorIndustries)).toBe(true);
        expect(typeof analysis.transportationScore).toBe('number');
        expect(['emerging', 'developing', 'mature', 'declining']).toContain(analysis.marketMaturity);
        expect(typeof analysis.investmentHotspot).toBe('boolean');
      }
    });

    it('존재하지 않는 지역은 null을 반환해야 함', () => {
      const analysis = realEstateMarketAnalysisService.getRegionalAnalysis('존재하지않는지역');

      expect(analysis).toBeNull();
    });
  });

  describe('getMarketTrends', () => {
    it('시장 트렌드를 조회할 수 있어야 함', () => {
      const trends = realEstateMarketAnalysisService.getMarketTrends();

      expect(Array.isArray(trends)).toBe(true);
    });

    it('지역별 트렌드를 필터링할 수 있어야 함', () => {
      const trends = realEstateMarketAnalysisService.getMarketTrends('강남구');

      expect(Array.isArray(trends)).toBe(true);
      trends.forEach(trend => {
        expect(trend.region).toBe('강남구');
      });
    });

    it('트렌드에 필수 필드가 포함되어야 함', () => {
      const trends = realEstateMarketAnalysisService.getMarketTrends();

      if (trends.length > 0) {
        const trend = trends[0];
        expect(trend.period).toBeDefined();
        expect(trend.region).toBeDefined();
        expect(typeof trend.averagePrice).toBe('number');
        expect(typeof trend.transactionVolume).toBe('number');
        expect(typeof trend.priceIndex).toBe('number');
        expect(typeof trend.volatility).toBe('number');
        expect(typeof trend.momentum).toBe('number');
        expect(typeof trend.seasonalFactor).toBe('number');
      }
    });
  });

  describe('Public getter methods', () => {
    it('getMarketPrices를 호출할 수 있어야 함', () => {
      const prices = realEstateMarketAnalysisService.getMarketPrices();

      expect(Array.isArray(prices)).toBe(true);
    });

    it('getPolicyImpacts를 호출할 수 있어야 함', () => {
      const policies = realEstateMarketAnalysisService.getPolicyImpacts();

      expect(Array.isArray(policies)).toBe(true);
    });

    it('getInvestmentAnalyses를 호출할 수 있어야 함', () => {
      const analyses = realEstateMarketAnalysisService.getInvestmentAnalyses();

      expect(Array.isArray(analyses)).toBe(true);
    });

    it('getMarketAlerts를 호출할 수 있어야 함', () => {
      const alerts = realEstateMarketAnalysisService.getMarketAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('getRegionalAnalyses를 호출할 수 있어야 함', () => {
      const analyses = realEstateMarketAnalysisService.getRegionalAnalyses();

      expect(Array.isArray(analyses)).toBe(true);
    });
  });
});

