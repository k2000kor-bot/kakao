/**
 * 국토교통부 실거래 정보 서비스
 * 임시 구현 - 실제 API 연동 필요
 */

export interface RealEstateTransaction {
  id?: string;
  transactionType: '매매' | '전세' | '월세';
  propertyType: '아파트' | '오피스텔' | '연립다세대' | '단독다가구' | '상업시설';
  address: {
    sido: string;
    sigungu: string;
    dong: string;
    jibun?: string;
  };
  price: {
    amount: number;
    unit: '만원' | '억원';
  };
  area: {
    exclusive: number;
    public?: number;
    land?: number;
  };
  transactionDate: string;
  floor?: {
    current: number;
    total: number;
  };
  buildYear?: number;
  structure?: string;
}

export interface RealEstateSearchParams {
  sido?: string;
  sigungu?: string;
  dong?: string;
  propertyType?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}

export interface RealEstateStatistics {
  totalTransactions: number;
  transactionCount: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
    median: number;
    minPrice: number;
    maxPrice: number;
  };
  pricePerSquareMeter: number;
  byPropertyType: Record<string, number>;
  byTransactionType: Record<string, number>;
}

class MolitRealEstateService {
  private static instance: MolitRealEstateService;

  static getInstance(): MolitRealEstateService {
    if (!MolitRealEstateService.instance) {
      MolitRealEstateService.instance = new MolitRealEstateService();
    }
    return MolitRealEstateService.instance;
  }

  async searchTransactions(params: RealEstateSearchParams): Promise<RealEstateTransaction[]> {
    // 임시 구현 - 실제 API 연동 필요
    return [];
  }

  async getStatistics(params: RealEstateSearchParams): Promise<RealEstateStatistics> {
    // 임시 구현
    return {
      totalTransactions: 0,
      transactionCount: 0,
      averagePrice: 0,
      priceRange: {
        min: 0,
        max: 0,
        median: 0,
        minPrice: 0,
        maxPrice: 0,
      },
      pricePerSquareMeter: 0,
      byPropertyType: {},
      byTransactionType: {},
    };
  }

  calculateStatistics(transactions: RealEstateTransaction[]): RealEstateStatistics {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        transactionCount: 0,
        averagePrice: 0,
        priceRange: {
          min: 0,
          max: 0,
          median: 0,
          minPrice: 0,
          maxPrice: 0,
        },
        pricePerSquareMeter: 0,
        byPropertyType: {},
        byTransactionType: {},
      };
    }

    const prices = transactions.map(t => t.price.amount);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    const byPropertyType: Record<string, number> = {};
    const byTransactionType: Record<string, number> = {};

    transactions.forEach(t => {
      byPropertyType[t.propertyType] = (byPropertyType[t.propertyType] || 0) + 1;
      byTransactionType[t.transactionType] = (byTransactionType[t.transactionType] || 0) + 1;
    });

    const totalArea = transactions.reduce((sum, t) => sum + t.area.exclusive, 0);
    const totalPrice = prices.reduce((a, b) => a + b, 0);
    const avgPrice = prices.length > 0 ? totalPrice / prices.length : 0;
    const pricePerSqm = totalArea > 0 ? totalPrice / totalArea : 0;

    return {
      totalTransactions: transactions.length,
      transactionCount: transactions.length,
      averagePrice: avgPrice,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
        median,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      },
      pricePerSquareMeter: pricePerSqm,
      byPropertyType,
      byTransactionType,
    };
  }
}

export default MolitRealEstateService.getInstance();

