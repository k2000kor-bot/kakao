import {
  API_QUERY_PARAM_DONG,
  API_QUERY_PARAM_END_DATE_CAMEL,
  API_QUERY_PARAM_PROPERTY_TYPE_CAMEL,
  API_QUERY_PARAM_SIDO,
  API_QUERY_PARAM_SIGUNGU,
  API_QUERY_PARAM_START_DATE_CAMEL,
  API_QUERY_PARAM_TRANSACTION_TYPE,
  API_REAL_ESTATE_TRANSACTIONS_PATH,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../config/api';
/**
 * 국토교통부 실거래 정보 서비스
 * 실제 API 연동 전 데모용 샘플 데이터 제공
 */

const API_BASE = resolveApiBaseUrl();

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

/** 데모용 샘플 실거래 데이터 (실제 API 미연동 시 사용) */
const SAMPLE_TRANSACTIONS: RealEstateTransaction[] = [
  {
    id: 'demo-1',
    transactionType: '매매',
    propertyType: '아파트',
    address: { sido: '서울특별시', sigungu: '강남구', dong: '역삼동', jibun: '123-45' },
    price: { amount: 125000, unit: '만원' },
    area: { exclusive: 84.5, public: 12.3 },
    transactionDate: '2024-12-15',
    floor: { current: 12, total: 25 },
    buildYear: 2015,
  },
  {
    id: 'demo-2',
    transactionType: '전세',
    propertyType: '아파트',
    address: { sido: '서울특별시', sigungu: '서초구', dong: '반포동', jibun: '78-12' },
    price: { amount: 85000, unit: '만원' },
    area: { exclusive: 102.3, public: 18.2 },
    transactionDate: '2024-12-10',
    floor: { current: 8, total: 20 },
    buildYear: 2010,
  },
  {
    id: 'demo-3',
    transactionType: '매매',
    propertyType: '오피스텔',
    address: { sido: '서울특별시', sigungu: '송파구', dong: '잠실동', jibun: '200-1' },
    price: { amount: 52000, unit: '만원' },
    area: { exclusive: 45.2, public: 8.1 },
    transactionDate: '2024-12-08',
    floor: { current: 15, total: 30 },
    buildYear: 2018,
  },
  {
    id: 'demo-4',
    transactionType: '월세',
    propertyType: '아파트',
    address: { sido: '서울특별시', sigungu: '마포구', dong: '연남동', jibun: '567-8' },
    price: { amount: 5000, unit: '만원' }, // 월세 50만원 + 보증금 5000만원 가정
    area: { exclusive: 59.8, public: 10.5 },
    transactionDate: '2024-12-05',
    floor: { current: 5, total: 12 },
    buildYear: 2005,
  },
  {
    id: 'demo-5',
    transactionType: '매매',
    propertyType: '아파트',
    address: { sido: '서울특별시', sigungu: '강남구', dong: '삼성동', jibun: '88-22' },
    price: { amount: 198000, unit: '만원' },
    area: { exclusive: 132.1, public: 22.4 },
    transactionDate: '2024-12-01',
    floor: { current: 18, total: 28 },
    buildYear: 2012,
  },
];

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
    try {
      const qs = new URLSearchParams();
      if (params.sido) qs.set(API_QUERY_PARAM_SIDO, params.sido);
      if (params.sigungu) qs.set(API_QUERY_PARAM_SIGUNGU, params.sigungu);
      if (params.dong) qs.set(API_QUERY_PARAM_DONG, params.dong);
      if (params.transactionType) qs.set(API_QUERY_PARAM_TRANSACTION_TYPE, params.transactionType);
      if (params.propertyType) qs.set(API_QUERY_PARAM_PROPERTY_TYPE_CAMEL, params.propertyType);
      if (params.startDate) qs.set(API_QUERY_PARAM_START_DATE_CAMEL, params.startDate);
      if (params.endDate) qs.set(API_QUERY_PARAM_END_DATE_CAMEL, params.endDate);
      const res = await fetch(
        joinApiHealthCheckUrl(API_BASE, `${API_REAL_ESTATE_TRANSACTIONS_PATH}?${qs}`),
      );
      if (res.ok) {
        const data = await res.json();
        const list = data?.data?.transactions ?? data?.transactions;
        return Array.isArray(list) ? list : [];
      }
    } catch {
      // 백엔드 미연동 시 무시
    }
    return [...SAMPLE_TRANSACTIONS];
  }

  async getStatistics(params: RealEstateSearchParams): Promise<RealEstateStatistics> {
    const transactions = await this.searchTransactions(params);
    return this.calculateStatistics(transactions);
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

