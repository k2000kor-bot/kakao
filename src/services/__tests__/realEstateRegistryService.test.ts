/**
 * realEstateRegistryService 테스트
 * 부동산 등기 정보 서비스 테스트
 */

import realEstateRegistryService, {
  RegistryChange,
  RegistrySearchParams,
  RegistryStatistics,
} from '../realEstateRegistryService';

describe('realEstateRegistryService', () => {
  describe('getInstance', () => {
    it('싱글톤 인스턴스를 반환해야 함', () => {
      const instance1 = realEstateRegistryService;
      const instance2 = realEstateRegistryService;

      expect(instance1).toBe(instance2);
    });
  });

  describe('searchRegistryChanges', () => {
    it('등기 변경 내역을 검색해야 함', async () => {
      const params: RegistrySearchParams = {
        sido: '서울특별시',
        sigungu: '강남구',
      };

      const result = await realEstateRegistryService.searchRegistryChanges(params);

      expect(Array.isArray(result)).toBe(true);
    });

    it('빈 파라미터로 검색할 수 있어야 함', async () => {
      const params: RegistrySearchParams = {};

      const result = await realEstateRegistryService.searchRegistryChanges(params);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('통계를 반환해야 함', async () => {
      const params: RegistrySearchParams = {
        sido: '서울특별시',
      };

      const result = await realEstateRegistryService.getStatistics(params);

      expect(result).toHaveProperty('totalChanges');
      expect(result).toHaveProperty('byChangeType');
      expect(result).toHaveProperty('recentChanges');
      expect(result).toHaveProperty('ownershipChanges');
      expect(result).toHaveProperty('mortgageChanges');
      expect(result).toHaveProperty('leaseChanges');
      expect(result.totalChanges).toBe(0);
      expect(Array.isArray(result.recentChanges)).toBe(true);
    });
  });

  describe('getRegistryChanges', () => {
    it('등기 변경 내역을 가져와야 함', async () => {
      const params: RegistrySearchParams = {
        sido: '서울특별시',
      };

      const result = await realEstateRegistryService.getRegistryChanges(params);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateStatistics', () => {
    it('변경 내역으로부터 통계를 계산해야 함', () => {
      const changes: RegistryChange[] = [
        {
          changeType: '소유권이전',
          propertyAddress: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          changeDate: '2024-01-01',
          previousOwner: { name: '이전 소유자', share: '100%' },
          newOwner: { name: '신규 소유자', share: '100%' },
        },
        {
          changeType: '저당권설정',
          propertyAddress: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          changeDate: '2024-01-02',
          mortgageInfo: {
            creditor: '은행',
            amount: 100000000,
          },
        },
        {
          changeType: '전세권설정',
          propertyAddress: {
            sido: '서울특별시',
            sigungu: '강남구',
            dong: '역삼동',
          },
          changeDate: '2024-01-03',
          leaseInfo: {
            lessee: '임차인',
            deposit: 50000000,
          },
        },
      ];

      const result = realEstateRegistryService.calculateStatistics(changes);

      expect(result.totalChanges).toBe(3);
      expect(result.ownershipChanges).toBe(1);
      expect(result.mortgageChanges).toBe(1);
      expect(result.leaseChanges).toBe(1);
      expect(result.byChangeType['소유권이전']).toBe(1);
      expect(result.byChangeType['저당권설정']).toBe(1);
      expect(result.byChangeType['전세권설정']).toBe(1);
      expect(result.recentChanges.length).toBe(3);
    });

    it('빈 배열에 대한 통계를 계산해야 함', () => {
      const changes: RegistryChange[] = [];

      const result = realEstateRegistryService.calculateStatistics(changes);

      expect(result.totalChanges).toBe(0);
      expect(result.ownershipChanges).toBe(0);
      expect(result.mortgageChanges).toBe(0);
      expect(result.leaseChanges).toBe(0);
      expect(result.recentChanges.length).toBe(0);
    });

    it('10개 이상의 변경 내역에서 최근 10개만 반환해야 함', () => {
      const changes: RegistryChange[] = Array.from({ length: 15 }, (_, i) => ({
        changeType: '소유권이전' as const,
        propertyAddress: {
          sido: '서울특별시',
          sigungu: '강남구',
          dong: '역삼동',
        },
        changeDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
      }));

      const result = realEstateRegistryService.calculateStatistics(changes);

      expect(result.totalChanges).toBe(15);
      expect(result.recentChanges.length).toBe(10);
    });
  });
});

