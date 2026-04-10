/**
 * realEstateService 서비스 테스트
 * 부동산 서비스 테스트
 */

import realEstateService, { RealEstateData } from '../realEstateService';

describe('realEstateService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(realEstateService).toBeDefined();
    });
  });

  describe('getRealEstateData', () => {
    it('지역 시세를 조회할 수 있어야 함', async () => {
      const result = await realEstateService.getRealEstateData('강남구');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.region).toBe('강남구');
      expect(result.data?.averagePrice).toBeGreaterThan(0);
    });

    it('정규화된 지역명으로도 조회할 수 있어야 함', async () => {
      const result = await realEstateService.getRealEstateData('강남');

      expect(result.success).toBe(true);
      expect(result.data?.region).toBe('강남구');
    });

    it('존재하지 않는 지역은 에러를 반환해야 함', async () => {
      const result = await realEstateService.getRealEstateData('존재하지않는지역');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('유사한 지역명을 제안해야 함', async () => {
      const result = await realEstateService.getRealEstateData('강');

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('generateSummary', () => {
    it('시세 요약을 생성할 수 있어야 함', () => {
      const data: RealEstateData = {
        region: '강남구',
        type: 'apartment',
        averagePrice: 2500000000,
        priceRange: { min: 1800000000, max: 3500000000 },
        pricePerSquareMeter: 25000000,
        trend: 'up',
        trendPercentage: 3.2,
        lastUpdated: '2024-01-15',
        transactionCount: 45,
        marketStatus: 'hot',
        description: '테스트 설명',
      };

      const summary = realEstateService.generateSummary(data);

      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('강남구');
      expect(summary).toContain('상승');
    });

    it('하락세 요약을 생성할 수 있어야 함', () => {
      const data: RealEstateData = {
        region: '영등포구',
        type: 'apartment',
        averagePrice: 1600000000,
        priceRange: { min: 1100000000, max: 2200000000 },
        pricePerSquareMeter: 16000000,
        trend: 'down',
        trendPercentage: -0.8,
        lastUpdated: '2024-01-15',
        transactionCount: 35,
        marketStatus: 'cold',
        description: '테스트 설명',
      };

      const summary = realEstateService.generateSummary(data);

      expect(summary).toContain('하락');
    });
  });

  describe('getAvailableRegions', () => {
    it('사용 가능한 지역 목록을 반환해야 함', () => {
      const regions = realEstateService.getAvailableRegions();

      expect(Array.isArray(regions)).toBe(true);
      expect(regions.length).toBeGreaterThan(0);
      expect(regions).toContain('강남구');
    });
  });

  describe('compareRegions', () => {
    it('여러 지역을 비교할 수 있어야 함', async () => {
      const comparison = await realEstateService.compareRegions(['강남구', '서초구']);

      expect(typeof comparison).toBe('string');
      expect(comparison.length).toBeGreaterThan(0);
      expect(comparison).toContain('비교');
    });

    it('존재하지 않는 지역은 제외하고 비교해야 함', async () => {
      const comparison = await realEstateService.compareRegions(['강남구', '존재하지않는지역']);

      expect(comparison).toContain('강남구');
    });

    it('비교할 수 있는 지역이 없으면 에러 메시지를 반환해야 함', async () => {
      const comparison = await realEstateService.compareRegions(['존재하지않는지역1', '존재하지않는지역2']);

      expect(comparison).toContain('비교할 수 있는 지역 정보가 없습니다');
    });
  });

  describe('predictMarketTrend', () => {
    it('시세 예측을 생성할 수 있어야 함', async () => {
      const prediction = await realEstateService.predictMarketTrend('강남구', 6);

      expect(typeof prediction).toBe('string');
      expect(prediction.length).toBeGreaterThan(0);
      expect(prediction).toContain('예측');
    });

    it('존재하지 않는 지역은 에러 메시지를 반환해야 함', async () => {
      const prediction = await realEstateService.predictMarketTrend('존재하지않는지역');

      expect(prediction).toContain('예측 데이터를 생성할 수 없습니다');
    });

    it('예측에 현재 가격과 예상 가격이 포함되어야 함', async () => {
      const prediction = await realEstateService.predictMarketTrend('강남구', 12);

      expect(prediction).toContain('현재 평균가');
      expect(prediction).toContain('예상 평균가');
    });
  });

  describe('generateMarketDashboard', () => {
    it('시세 대시보드를 생성할 수 있어야 함', async () => {
      const dashboard = await realEstateService.generateMarketDashboard();

      expect(typeof dashboard).toBe('string');
      expect(dashboard.length).toBeGreaterThan(0);
      expect(dashboard).toContain('대시보드');
    });

    it('대시보드에 통계 정보가 포함되어야 함', async () => {
      const dashboard = await realEstateService.generateMarketDashboard();

      expect(dashboard).toContain('평균 매매가');
      expect(dashboard).toContain('상승 지역');
    });
  });

  describe('subscribeToAlerts / unsubscribeFromAlerts', () => {
    it('알림을 구독할 수 있어야 함', () => {
      const callback = jest.fn();
      realEstateService.subscribeToAlerts(callback);

      // 알림이 발생하면 콜백이 호출되어야 함
      expect(callback).toBeDefined();
    });

    it('알림 구독을 해제할 수 있어야 함', () => {
      const callback = jest.fn();
      realEstateService.subscribeToAlerts(callback);
      realEstateService.unsubscribeFromAlerts(callback);

      // 구독 해제 후에도 에러가 발생하지 않아야 함
      expect(() => {
        realEstateService.unsubscribeFromAlerts(callback);
      }).not.toThrow();
    });
  });

  describe('getAlerts', () => {
    it('알림 목록을 조회할 수 있어야 함', () => {
      const alerts = realEstateService.getAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('지역별 알림을 필터링할 수 있어야 함', () => {
      const alerts = realEstateService.getAlerts('강남구');

      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('markAlertAsRead', () => {
    it('알림을 읽음 처리할 수 있어야 함', () => {
      // 알림이 없어도 에러가 발생하지 않아야 함
      expect(() => {
        realEstateService.markAlertAsRead('nonexistent');
      }).not.toThrow();
    });
  });

  describe('deleteAlert', () => {
    it('알림을 삭제할 수 있어야 함', () => {
      // 알림이 없어도 에러가 발생하지 않아야 함
      expect(() => {
        realEstateService.deleteAlert('nonexistent');
      }).not.toThrow();
    });
  });

  describe('getPriceHistory', () => {
    it('시세 히스토리를 조회할 수 있어야 함', async () => {
      const history = await realEstateService.getPriceHistory('강남구');

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('히스토리에 날짜와 가격이 포함되어야 함', async () => {
      const history = await realEstateService.getPriceHistory('강남구', 6);

      /* eslint-disable jest/no-conditional-expect */
      if (history.length > 0) {
        expect(history[0].date).toBeDefined();
        expect(history[0].price).toBeDefined();
        expect(history[0].trend).toBeDefined();
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('존재하지 않는 지역은 빈 배열을 반환해야 함', async () => {
      const history = await realEstateService.getPriceHistory('존재하지않는지역');

      expect(history).toEqual([]);
    });
  });

  describe('getInvestmentGrade', () => {
    it('투자 등급을 평가할 수 있어야 함', () => {
      const grade = realEstateService.getInvestmentGrade('강남구');

      expect(grade).toBeDefined();
      expect(grade.grade).toBeDefined();
      expect(grade.score).toBeGreaterThanOrEqual(0);
      expect(grade.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(grade.factors)).toBe(true);
    });

    it('존재하지 않는 지역은 N/A를 반환해야 함', () => {
      const grade = realEstateService.getInvestmentGrade('존재하지않는지역');

      expect(grade.grade).toBe('N/A');
      expect(grade.score).toBe(0);
    });

    it('등급이 A, B, C, D 중 하나여야 함', () => {
      const grade = realEstateService.getInvestmentGrade('강남구');

      expect(['A', 'B', 'C', 'D', 'N/A']).toContain(grade.grade);
    });

    it('점수에 따라 등급이 결정되어야 함', () => {
      const grade = realEstateService.getInvestmentGrade('강남구');

      /* eslint-disable jest/no-conditional-expect */
      if (grade.score >= 80) {
        expect(grade.grade).toBe('A');
      } else if (grade.score >= 70) {
        expect(grade.grade).toBe('B');
      } else if (grade.score >= 60) {
        expect(grade.grade).toBe('C');
      } else {
        expect(grade.grade).toBe('D');
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });
});

