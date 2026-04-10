import {
  API_QUERY_PARAM_CHANGE_TYPE,
  API_QUERY_PARAM_DONG,
  API_QUERY_PARAM_END_DATE_CAMEL,
  API_QUERY_PARAM_SIDO,
  API_QUERY_PARAM_SIGUNGU,
  API_QUERY_PARAM_START_DATE_CAMEL,
  API_REAL_ESTATE_REGISTRY_CHANGES_PATH,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../config/api';
/**
 * 부동산 등기 정보 서비스
 * 백엔드 API 연동, 미연동 시 데모용 샘플 데이터 제공
 */

const API_BASE = resolveApiBaseUrl();

export interface RegistryChange {
  id?: string;
  changeType: '소유권이전' | '저당권설정' | '전세권설정' | '지상권설정' | '지역권설정';
  propertyAddress: {
    sido: string;
    sigungu: string;
    dong: string;
    jibun?: string;
  };
  changeDate: string;
  previousOwner?: {
    name: string;
    share: string;
  };
  newOwner?: {
    name: string;
    share: string;
  };
  mortgageInfo?: {
    creditor: string;
    amount: number;
    maturityDate?: string;
  };
  leaseInfo?: {
    lessee: string;
    deposit: number;
    period?: string;
  };
  notes?: string;
}

export interface RegistrySearchParams {
  sido?: string;
  sigungu?: string;
  dong?: string;
  changeType?: string;
  startDate?: string;
  endDate?: string;
  ownerName?: string;
}

export interface RegistryStatistics {
  totalChanges: number;
  byChangeType: Record<string, number>;
  recentChanges: RegistryChange[];
  ownershipChanges: number;
  mortgageChanges: number;
  leaseChanges: number;
}

const SAMPLE_CHANGES: RegistryChange[] = [
  {
    id: 'demo-reg-1',
    changeType: '소유권이전',
    propertyAddress: { sido: '서울특별시', sigungu: '강남구', dong: '역삼동', jibun: '123-45' },
    changeDate: '2024-12-15',
    previousOwner: { name: '김○○', share: '1/1' },
    newOwner: { name: '이○○', share: '1/1' },
  },
  {
    id: 'demo-reg-2',
    changeType: '저당권설정',
    propertyAddress: { sido: '서울특별시', sigungu: '서초구', dong: '반포동', jibun: '78-12' },
    changeDate: '2024-12-10',
    mortgageInfo: { creditor: '○○은행', amount: 500000000, maturityDate: '2034-12-31' },
  },
  {
    id: 'demo-reg-3',
    changeType: '전세권설정',
    propertyAddress: { sido: '서울특별시', sigungu: '송파구', dong: '잠실동', jibun: '200-1' },
    changeDate: '2024-12-08',
    leaseInfo: { lessee: '박○○', deposit: 300000000, period: '2024.12~2026.12' },
  },
];

class RealEstateRegistryService {
  private static instance: RealEstateRegistryService;

  static getInstance(): RealEstateRegistryService {
    if (!RealEstateRegistryService.instance) {
      RealEstateRegistryService.instance = new RealEstateRegistryService();
    }
    return RealEstateRegistryService.instance;
  }

  async searchRegistryChanges(params: RegistrySearchParams): Promise<RegistryChange[]> {
    try {
      const qs = new URLSearchParams();
      if (params.sido) qs.set(API_QUERY_PARAM_SIDO, params.sido);
      if (params.sigungu) qs.set(API_QUERY_PARAM_SIGUNGU, params.sigungu);
      if (params.dong) qs.set(API_QUERY_PARAM_DONG, params.dong);
      if (params.changeType) qs.set(API_QUERY_PARAM_CHANGE_TYPE, params.changeType);
      if (params.startDate) qs.set(API_QUERY_PARAM_START_DATE_CAMEL, params.startDate);
      if (params.endDate) qs.set(API_QUERY_PARAM_END_DATE_CAMEL, params.endDate);
      const res = await fetch(
        joinApiHealthCheckUrl(API_BASE, `${API_REAL_ESTATE_REGISTRY_CHANGES_PATH}?${qs}`),
      );
      if (res.ok) {
        const data = await res.json();
        const list = data?.data?.changes ?? data?.changes;
        return Array.isArray(list) ? list : [];
      }
    } catch {
      // 백엔드 미연동 시 무시
    }
    return [...SAMPLE_CHANGES];
  }

  async getStatistics(params: RegistrySearchParams): Promise<RegistryStatistics> {
    const changes = await this.searchRegistryChanges(params);
    return this.calculateStatistics(changes);
  }

  getRegistryChanges(params: RegistrySearchParams): Promise<RegistryChange[]> {
    return this.searchRegistryChanges(params);
  }

  calculateStatistics(changes: RegistryChange[]): RegistryStatistics {
    const byChangeType: Record<string, number> = {};
    let ownershipChanges = 0;
    let mortgageChanges = 0;
    let leaseChanges = 0;

    changes.forEach(c => {
      byChangeType[c.changeType] = (byChangeType[c.changeType] || 0) + 1;
      if (c.changeType === '소유권이전') ownershipChanges++;
      if (c.changeType === '저당권설정') mortgageChanges++;
      if (c.changeType === '전세권설정') leaseChanges++;
    });

    return {
      totalChanges: changes.length,
      byChangeType,
      recentChanges: changes.slice(-10),
      ownershipChanges,
      mortgageChanges,
      leaseChanges,
    };
  }
}

export default RealEstateRegistryService.getInstance();

