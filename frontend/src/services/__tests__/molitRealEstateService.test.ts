/**
 * molitRealEstateService 서비스 테스트
 * 국토교통부 실거래 정보 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import molitRealEstateService, {
  RealEstateTransaction,
  RealEstateSearchParams,
} from '../molitRealEstateService';
import { restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

beforeAll(() => {
  globalThis.fetch = mockFetch;
  if (typeof window !== 'undefined') {
    window.fetch = globalThis.fetch;
  }
});

afterAll(() => {
  restoreGlobalFetch(originalFetch);
});

beforeEach(() => {
  mockFetch.mockReset();
  // API 성공 시 빈 transactions 반환 → getStatistics가 빈 배열 기반 통계 반환
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: { transactions: [] } }),
  });
});

describe('molitRealEstateService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(molitRealEstateService).toBeDefined();
    });
  });

  describe('searchTransactions', () => {
    it('거래 정보를 검색할 수 있어야 함', async () => {
      const params: RealEstateSearchParams = {
        sido: '서울특별시',
        sigungu: '강남구',
      };

      const results = await molitRealEstateService.searchTransactions(params);

      expect(Array.isArray(results)).toBe(true);
    });

    it('빈 파라미터로도 검색할 수 있어야 함', async () => {
      const results = await molitRealEstateService.searchTransactions({});

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('통계를 조회할 수 있어야 함', async () => {
      const params: RealEstateSearchParams = {
        sido: '서울특별시',
      };

      const stats = await molitRealEstateService.getStatistics(params);

      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeDefined();
      expect(stats.transactionCount).toBeDefined();
      expect(stats.averagePrice).toBeDefined();
      expect(stats.priceRange).toBeDefined();
      expect(stats.pricePerSquareMeter).toBeDefined();
      expect(stats.byPropertyType).toBeDefined();
      expect(stats.byTransactionType).toBeDefined();
    });

    it('빈 파라미터로도 통계를 조회할 수 있어야 함', async () => {
      const stats = await molitRealEstateService.getStatistics({});

      expect(stats.totalTransactions).toBe(0);
      expect(stats.averagePrice).toBe(0);
    });
  });

  describe('calculateStatistics', () => {
    it('거래 데이터가 없으면 빈 통계를 반환해야 함', () => {
      const stats = molitRealEstateService.calculateStatistics([]);

      expect(stats.totalTransactions).toBe(0);
      expect(stats.transactionCount).toBe(0);
      expect(stats.averagePrice).toBe(0);
      expect(stats.priceRange.min).toBe(0);
      expect(stats.priceRange.max).toBe(0);
      expect(stats.pricePerSquareMeter).toBe(0);
    });

    it('거래 데이터로 통계를 계산할 수 있어야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          price: {
            amount: 10,
            unit: '억원',
          },
          area: {
            exclusive: 84,
          },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '전세',
          propertyType: '아파트',
          address: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          price: {
            amount: 5,
            unit: '억원',
          },
          area: {
            exclusive: 84,
          },
          transactionDate: '2024-01-02',
        },
        {
          transactionType: '매매',
          propertyType: '오피스텔',
          address: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          price: {
            amount: 8,
            unit: '억원',
          },
          area: {
            exclusive: 60,
          },
          transactionDate: '2024-01-03',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      expect(stats.totalTransactions).toBe(3);
      expect(stats.transactionCount).toBe(3);
      expect(stats.averagePrice).toBe((10 + 5 + 8) / 3);
      expect(stats.priceRange.min).toBe(5);
      expect(stats.priceRange.max).toBe(10);
      expect(stats.priceRange.median).toBe(8);
    });

    it('중앙값을 올바르게 계산해야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 5, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 8, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-02',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-03',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 12, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-04',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      // 짝수 개일 때 중앙값은 두 중간값의 평균
      expect(stats.priceRange.median).toBe((8 + 10) / 2);
    });

    it('부동산 타입별 통계를 계산해야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 8, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-02',
        },
        {
          transactionType: '매매',
          propertyType: '오피스텔',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 5, unit: '억원' },
          area: { exclusive: 60 },
          transactionDate: '2024-01-03',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      expect(stats.byPropertyType['아파트']).toBe(2);
      expect(stats.byPropertyType['오피스텔']).toBe(1);
    });

    it('거래 타입별 통계를 계산해야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '전세',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 5, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-02',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 8, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-03',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      expect(stats.byTransactionType['매매']).toBe(2);
      expect(stats.byTransactionType['전세']).toBe(1);
    });

    it('평균 가격을 올바르게 계산해야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 8, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-02',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 12, unit: '억원' },
          area: { exclusive: 84 },
          transactionDate: '2024-01-03',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      expect(stats.averagePrice).toBe((10 + 8 + 12) / 3);
    });

    it('제곱미터당 가격을 올바르게 계산해야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 100 },
          transactionDate: '2024-01-01',
        },
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 8, unit: '억원' },
          area: { exclusive: 80 },
          transactionDate: '2024-01-02',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      const totalPrice = 10 + 8;
      const totalArea = 100 + 80;
      expect(stats.pricePerSquareMeter).toBe(totalPrice / totalArea);
    });

    it('면적이 0이면 제곱미터당 가격은 0이어야 함', () => {
      const transactions: RealEstateTransaction[] = [
        {
          transactionType: '매매',
          propertyType: '아파트',
          address: { sido: '서울', sigungu: '강남', dong: '역삼' },
          price: { amount: 10, unit: '억원' },
          area: { exclusive: 0 },
          transactionDate: '2024-01-01',
        },
      ];

      const stats = molitRealEstateService.calculateStatistics(transactions);

      expect(stats.pricePerSquareMeter).toBe(0);
    });
  });
});

