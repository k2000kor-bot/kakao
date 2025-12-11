/**
 * 부동산 등기 정보 서비스
 * 임시 구현 - 실제 API 연동 필요
 */

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

class RealEstateRegistryService {
  private static instance: RealEstateRegistryService;

  static getInstance(): RealEstateRegistryService {
    if (!RealEstateRegistryService.instance) {
      RealEstateRegistryService.instance = new RealEstateRegistryService();
    }
    return RealEstateRegistryService.instance;
  }

  async searchRegistryChanges(params: RegistrySearchParams): Promise<RegistryChange[]> {
    // 임시 구현 - 실제 API 연동 필요
    return [];
  }

  async getStatistics(params: RegistrySearchParams): Promise<RegistryStatistics> {
    // 임시 구현
    return {
      totalChanges: 0,
      byChangeType: {},
      recentChanges: [],
      ownershipChanges: 0,
      mortgageChanges: 0,
      leaseChanges: 0,
    };
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

