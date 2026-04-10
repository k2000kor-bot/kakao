import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface RealEstateAlert {
  id: string;
  region: string;
  type: 'price_change' | 'trend_change' | 'market_status_change';
  threshold: number;
  currentValue: number;
  previousValue: number;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface RealEstateData {
  region: string;
  type: 'apartment' | 'house' | 'commercial';
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSquareMeter: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastUpdated: string;
  transactionCount: number;
  marketStatus: 'hot' | 'normal' | 'cold';
  description: string;
}

export interface RealEstateSearchResult {
  success: boolean;
  data?: RealEstateData;
  error?: string;
  suggestions?: string[];
}

class RealEstateService {
  private mockData: { [key: string]: RealEstateData } = {
    '강남구': {
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
      description: '강남구는 서울의 핵심 상권으로, 최근 3.2% 상승세를 보이고 있습니다. 평균 매매가 25억원, 평당 2,500만원 수준입니다.'
    },
    '서초구': {
      region: '서초구',
      type: 'apartment',
      averagePrice: 2200000000,
      priceRange: { min: 1600000000, max: 3200000000 },
      pricePerSquareMeter: 22000000,
      trend: 'up',
      trendPercentage: 2.8,
      lastUpdated: '2024-01-15',
      transactionCount: 38,
      marketStatus: 'hot',
      description: '서초구는 교육과 교통이 우수한 지역으로, 2.8% 상승세를 보이고 있습니다. 평균 매매가 22억원, 평당 2,200만원 수준입니다.'
    },
    '마포구': {
      region: '마포구',
      type: 'apartment',
      averagePrice: 1800000000,
      priceRange: { min: 1200000000, max: 2500000000 },
      pricePerSquareMeter: 18000000,
      trend: 'stable',
      trendPercentage: 0.5,
      lastUpdated: '2024-01-15',
      transactionCount: 52,
      marketStatus: 'normal',
      description: '마포구는 문화와 예술이 살아있는 지역으로, 안정적인 시세를 보이고 있습니다. 평균 매매가 18억원, 평당 1,800만원 수준입니다.'
    },
    '송파구': {
      region: '송파구',
      type: 'apartment',
      averagePrice: 2000000000,
      priceRange: { min: 1400000000, max: 2800000000 },
      pricePerSquareMeter: 20000000,
      trend: 'up',
      trendPercentage: 1.8,
      lastUpdated: '2024-01-15',
      transactionCount: 41,
      marketStatus: 'normal',
      description: '송파구는 가족 친화적 환경으로 인기가 높으며, 1.8% 상승세를 보이고 있습니다. 평균 매매가 20억원, 평당 2,000만원 수준입니다.'
    },
    '영등포구': {
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
      description: '영등포구는 최근 0.8% 하락세를 보이고 있지만, 교통 접근성이 우수한 지역입니다. 평균 매매가 16억원, 평당 1,600만원 수준입니다.'
    },
    '종로구': {
      region: '종로구',
      type: 'apartment',
      averagePrice: 1900000000,
      priceRange: { min: 1300000000, max: 2600000000 },
      pricePerSquareMeter: 19000000,
      trend: 'stable',
      trendPercentage: 0.3,
      lastUpdated: '2024-01-15',
      transactionCount: 28,
      marketStatus: 'normal',
      description: '종로구는 전통과 현대가 공존하는 지역으로, 안정적인 시세를 보이고 있습니다. 평균 매매가 19억원, 평당 1,900만원 수준입니다.'
    },
    '중구': {
      region: '중구',
      type: 'apartment',
      averagePrice: 1700000000,
      priceRange: { min: 1200000000, max: 2400000000 },
      pricePerSquareMeter: 17000000,
      trend: 'up',
      trendPercentage: 1.2,
      lastUpdated: '2024-01-15',
      transactionCount: 32,
      marketStatus: 'normal',
      description: '중구는 서울의 중심지로, 최근 1.2% 상승세를 보이고 있습니다. 평균 매매가 17억원, 평당 1,700만원 수준입니다.'
    },
    '용산구': {
      region: '용산구',
      type: 'apartment',
      averagePrice: 2100000000,
      priceRange: { min: 1500000000, max: 3000000000 },
      pricePerSquareMeter: 21000000,
      trend: 'up',
      trendPercentage: 2.1,
      lastUpdated: '2024-01-15',
      transactionCount: 33,
      marketStatus: 'hot',
      description: '용산구는 재개발 지역으로 주목받고 있으며, 2.1% 상승세를 보이고 있습니다. 평균 매매가 21억원, 평당 2,100만원 수준입니다.'
    },
    '성동구': {
      region: '성동구',
      type: 'apartment',
      averagePrice: 1950000000,
      priceRange: { min: 1400000000, max: 2700000000 },
      pricePerSquareMeter: 19500000,
      trend: 'up',
      trendPercentage: 1.9,
      lastUpdated: '2024-01-15',
      transactionCount: 42,
      marketStatus: 'normal',
      description: '성동구는 문화와 예술이 융합된 지역으로, 1.9% 상승세를 보이고 있습니다. 평균 매매가 19.5억원, 평당 1,950만원 수준입니다.'
    },
    '광진구': {
      region: '광진구',
      type: 'apartment',
      averagePrice: 1850000000,
      priceRange: { min: 1300000000, max: 2600000000 },
      pricePerSquareMeter: 18500000,
      trend: 'stable',
      trendPercentage: 0.8,
      lastUpdated: '2024-01-15',
      transactionCount: 39,
      marketStatus: 'normal',
      description: '광진구는 젊은 문화가 활발한 지역으로, 안정적인 시세를 보이고 있습니다. 평균 매매가 18.5억원, 평당 1,850만원 수준입니다.'
    }
  };

  private alerts: RealEstateAlert[] = [];
  private alertSubscribers: ((alert: RealEstateAlert) => void)[] = [];

  // 지역명 정규화
  private normalizeRegion(region: string): string {
    const normalized = coerceTrimmedString(region.replace(/[시군구]/g, ''), '');
    const regionMap: { [key: string]: string } = {
      '강남': '강남구',
      '서초': '서초구',
      '마포': '마포구',
      '송파': '송파구',
      '영등포': '영등포구',
      '종로': '종로구',
      '중구': '중구',
      '강남구': '강남구',
      '서초구': '서초구',
      '마포구': '마포구',
      '송파구': '송파구',
      '영등포구': '영등포구',
      '종로구': '종로구'
    };
    return regionMap[normalized] || normalized;
  }

  // 시세 조회
  async getRealEstateData(region: string): Promise<RealEstateSearchResult> {
    try {
      const normalizedRegion = this.normalizeRegion(region);

      if (this.mockData[normalizedRegion]) {
        return {
          success: true,
          data: this.mockData[normalizedRegion]
        };
      }

      // 유사한 지역명 제안
      const suggestions = this.findSimilarRegions(region);

      return {
        success: false,
        error: `"${region}" 지역의 시세 정보를 찾을 수 없습니다.`,
        suggestions
      };
    } catch (error) {
      return {
        success: false,
        error: '시세 조회 중 오류가 발생했습니다.'
      };
    }
  }

  // 유사한 지역명 찾기
  private findSimilarRegions(region: string): string[] {
    const availableRegions = Object.keys(this.mockData);
    const normalizedInput = coerceTrimmedString(region.replace(/[시군구]/g, ''), '');

    return availableRegions.filter(available =>
      available.includes(normalizedInput) ||
      normalizedInput.includes(available.replace(/구$/, ''))
    );
  }

  // 시세 요약 생성
  generateSummary(data: RealEstateData): string {
    const trendText = data.trend === 'up' ? '상승' : data.trend === 'down' ? '하락' : '안정';
    const trendIcon = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';
    const statusIcon = data.marketStatus === 'hot' ? '🔥' : data.marketStatus === 'cold' ? '❄️' : '🌡️';

    // 투자 조언 생성
    const investmentAdvice = this.generateInvestmentAdvice(data);

    return coerceTrimmedString(`
🏠 **${data.region} 부동산 시세 정보**

${trendIcon} **시세 동향**: ${trendText} (${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage}%)
💰 **평균 매매가**: ${(data.averagePrice / 100000000).toFixed(1)}억원
📊 **가격 범위**: ${(data.priceRange.min / 100000000).toFixed(1)}억원 ~ ${(data.priceRange.max / 100000000).toFixed(1)}억원
🏢 **평당 가격**: ${(data.pricePerSquareMeter / 10000).toFixed(0)}만원
${statusIcon} **시장 상태**: ${this.getMarketStatusText(data.marketStatus)}
📅 **최근 거래**: ${data.transactionCount}건 (${data.lastUpdated} 기준)

${data.description}

💡 **투자 조언**: ${investmentAdvice}
    `, '');
  }

  // 시장 상태 텍스트 변환
  private getMarketStatusText(status: string): string {
    switch (status) {
      case 'hot': return '매우 활발';
      case 'normal': return '보통';
      case 'cold': return '침체';
      default: return '보통';
    }
  }

  // 투자 조언 생성
  private generateInvestmentAdvice(data: RealEstateData): string {
    let advice = '';

    if (data.trend === 'up' && data.marketStatus === 'hot') {
      advice = '시장이 매우 활발하고 상승세를 보이고 있어 투자에 유리한 환경입니다. 다만 과열 가능성도 고려해야 합니다.';
    } else if (data.trend === 'up' && data.marketStatus === 'normal') {
      advice = '안정적인 상승세를 보이고 있어 장기 투자 관점에서 좋은 선택입니다.';
    } else if (data.trend === 'stable' && data.marketStatus === 'normal') {
      advice = '시장이 안정적이어서 리스크가 낮은 투자 환경입니다.';
    } else if (data.trend === 'down' && data.marketStatus === 'cold') {
      advice = '시장이 침체기에 있어 신중한 접근이 필요합니다. 하지만 매수 기회일 수도 있습니다.';
    } else {
      advice = '시장 상황을 종합적으로 분석하여 투자 결정을 내리는 것이 좋습니다.';
    }

    // 시장 상태에 따른 추가 조언
    if (data.marketStatus === 'hot') {
      advice += '\n🔥 **시장 상태**: 매우 활발한 거래가 이루어지고 있어 빠른 결정이 필요합니다.';
    } else if (data.marketStatus === 'cold') {
      advice += '\n❄️ **시장 상태**: 거래가 부진하여 가격 협상의 여지가 있을 수 있습니다.';
    }

    // 거래량에 따른 조언
    if (data.transactionCount > 40) {
      advice += '\n📊 **거래량**: 높은 거래량으로 시장이 활발합니다.';
    } else if (data.transactionCount < 20) {
      advice += '\n📊 **거래량**: 낮은 거래량으로 시장이 침체되어 있습니다.';
    }

    return advice;
  }

  // 전체 지역 목록 조회
  getAvailableRegions(): string[] {
    return Object.keys(this.mockData);
  }

  // 시세 비교
  async compareRegions(regions: string[]): Promise<string> {
    const results = await Promise.all(
      regions.map(region => this.getRealEstateData(region))
    );

    const validResults = results.filter(result => result.success);

    if (validResults.length === 0) {
      return '비교할 수 있는 지역 정보가 없습니다.';
    }

    let comparison = '🏠 **지역별 시세 비교**\n\n';

    validResults.forEach((result, index) => {
      const data = result.data!;
      const trendIcon = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';

      comparison += `${index + 1}. **${data.region}**\n`;
      comparison += `   💰 평균: ${(data.averagePrice / 100000000).toFixed(1)}억원\n`;
      comparison += `   ${trendIcon} ${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage}%\n\n`;
    });

    // 투자 추천 추가
    const recommendation = this.generateComparisonRecommendation(validResults.map(r => r.data!));
    comparison += `\n💡 **투자 추천**: ${recommendation}`;

    return comparison;
  }

  // 시세 예측
  async predictMarketTrend(region: string, months: number = 6): Promise<string> {
    const result = await this.getRealEstateData(region);

    if (!result.success || !result.data) {
      return `"${region}" 지역의 예측 데이터를 생성할 수 없습니다.`;
    }

    const data = result.data;
    const currentPrice = data.averagePrice;
    const trendRate = data.trendPercentage / 100;

    // 단순 선형 예측 (실제로는 더 복잡한 모델 사용)
    const predictedPrice = currentPrice * (1 + trendRate * months / 12);
    const priceChange = predictedPrice - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;

    const prediction = coerceTrimmedString(`
🔮 **${region} ${months}개월 후 시세 예측**

📊 **현재 상황**:
   💰 현재 평균가: ${(currentPrice / 100000000).toFixed(1)}억원
   📈 현재 트렌드: ${data.trendPercentage > 0 ? '+' : ''}${data.trendPercentage}%

🔮 **${months}개월 후 예상**:
   💰 예상 평균가: ${(predictedPrice / 100000000).toFixed(1)}억원
   📊 예상 변동: ${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%
   💵 예상 차이: ${(priceChange / 100000000).toFixed(1)}억원

⚠️ **주의사항**: 이는 단순 예측이며, 실제 시세는 다양한 요인에 따라 달라질 수 있습니다.
    `, '');

    return prediction;
  }

  // 비교 추천 생성
  private generateComparisonRecommendation(regions: RealEstateData[]): string {
    const sortedByTrend = [...regions].sort((a, b) => b.trendPercentage - a.trendPercentage);
    const bestRegion = sortedByTrend[0];
    const worstRegion = sortedByTrend[sortedByTrend.length - 1];

    if (bestRegion.trendPercentage > 2) {
      return `${bestRegion.region}이 가장 강한 상승세를 보이고 있어 단기 투자에 유리합니다.`;
    } else if (worstRegion.trendPercentage < -1) {
      return `${worstRegion.region}이 하락세를 보이고 있어 매수 기회일 수 있습니다.`;
    } else {
      return '전반적으로 안정적인 시세를 보이고 있어 장기 투자 관점에서 접근하는 것이 좋습니다.';
    }
  }

  // 시세 통계 대시보드
  async generateMarketDashboard(): Promise<string> {
    const allRegions = this.getAvailableRegions();
    const allData = await Promise.all(
      allRegions.map(region => this.getRealEstateData(region))
    );

    const validData = allData.filter(result => result.success).map(result => result.data!);

    if (validData.length === 0) {
      return '시세 데이터를 불러올 수 없습니다.';
    }

    // 통계 계산
    const totalRegions = validData.length;
    const averagePrice = validData.reduce((sum, data) => sum + data.averagePrice, 0) / totalRegions;
    const upTrendCount = validData.filter(data => data.trend === 'up').length;
    const downTrendCount = validData.filter(data => data.trend === 'down').length;
    const stableCount = validData.filter(data => data.trend === 'stable').length;

    const hotMarkets = validData.filter(data => data.marketStatus === 'hot');
    const coldMarkets = validData.filter(data => data.marketStatus === 'cold');

    // 최고/최저 가격 지역
    const sortedByPrice = [...validData].sort((a, b) => b.averagePrice - a.averagePrice);
    const mostExpensive = sortedByPrice[0];
    const leastExpensive = sortedByPrice[sortedByPrice.length - 1];

    // 최고/최저 상승률 지역
    const sortedByTrend = [...validData].sort((a, b) => b.trendPercentage - a.trendPercentage);
    const bestPerformer = sortedByTrend[0];
    const worstPerformer = sortedByTrend[sortedByTrend.length - 1];

    const dashboard = coerceTrimmedString(`
📊 **서울 부동산 시세 대시보드**

🏢 **전체 현황**:
   📍 총 지역 수: ${totalRegions}개
   💰 평균 매매가: ${(averagePrice / 100000000).toFixed(1)}억원
   📈 상승 지역: ${upTrendCount}개
   📉 하락 지역: ${downTrendCount}개
   ➡️ 안정 지역: ${stableCount}개

🔥 **시장 상태**:
   🔥 활발한 시장: ${hotMarkets.length}개 (${hotMarkets.map(r => r.region).join(', ')})
   ❄️ 침체 시장: ${coldMarkets.length}개 (${coldMarkets.map(r => r.region).join(', ')})

💰 **가격 순위**:
   🥇 최고가: ${mostExpensive.region} (${(mostExpensive.averagePrice / 100000000).toFixed(1)}억원)
   🥉 최저가: ${leastExpensive.region} (${(leastExpensive.averagePrice / 100000000).toFixed(1)}억원)

📈 **성과 순위**:
   🏆 최고 상승: ${bestPerformer.region} (${bestPerformer.trendPercentage > 0 ? '+' : ''}${bestPerformer.trendPercentage}%)
   📉 최고 하락: ${worstPerformer.region} (${worstPerformer.trendPercentage}%)

💡 **시장 분석**: 
   ${this.generateMarketAnalysis(validData)}
    `, '');

    return dashboard;
  }

  // 시장 분석 생성
  private generateMarketAnalysis(data: RealEstateData[]): string {
    const upCount = data.filter(d => d.trend === 'up').length;
    const downCount = data.filter(d => d.trend === 'down').length;
    const hotCount = data.filter(d => d.marketStatus === 'hot').length;

    if (upCount > downCount && hotCount > 2) {
      return '전반적으로 상승세를 보이고 있으며, 활발한 시장이 많아 투자에 유리한 환경입니다.';
    } else if (downCount > upCount) {
      return '하락세를 보이는 지역이 많아 신중한 접근이 필요하지만, 매수 기회일 수도 있습니다.';
    } else {
      return '시장이 안정적이며, 지역별 차이가 있어 세심한 분석이 필요한 상황입니다.';
    }
  }

  // 실시간 시세 모니터링 시작
  startMonitoring(regions: string[], thresholds: { priceChange?: number; trendChange?: number } = {}) {
    setInterval(() => {
      regions.forEach(region => {
        this.checkForAlerts(region, thresholds);
      });
    }, 30000); // 30초마다 체크
  }

  // 알림 구독
  subscribeToAlerts(callback: (alert: RealEstateAlert) => void) {
    this.alertSubscribers.push(callback);
  }

  // 알림 구독 해제
  unsubscribeFromAlerts(callback: (alert: RealEstateAlert) => void) {
    const index = this.alertSubscribers.indexOf(callback);
    if (index > -1) {
      this.alertSubscribers.splice(index, 1);
    }
  }

  // 알림 체크
  private checkForAlerts(region: string, thresholds: { priceChange?: number; trendChange?: number }) {
    const data = this.mockData[region];
    if (!data) return;

    // 가격 변화 알림
    if (thresholds.priceChange && Math.abs(data.trendPercentage) >= thresholds.priceChange) {
      const alert: RealEstateAlert = {
        id: `price_${region}_${Date.now()}`,
        region,
        type: 'price_change',
        threshold: thresholds.priceChange,
        currentValue: data.trendPercentage,
        previousValue: data.trendPercentage - (data.trendPercentage > 0 ? 1 : -1),
        message: `${region} 시세가 ${data.trendPercentage > 0 ? '상승' : '하락'}하고 있습니다. (${Math.abs(data.trendPercentage)}%)`,
        timestamp: new Date(),
        isRead: false
      };
      this.notifyAlert(alert);
    }

    // 시장 상태 변화 알림
    if (data.marketStatus === 'hot' && data.transactionCount > 50) {
      const alert: RealEstateAlert = {
        id: `market_${region}_${Date.now()}`,
        region,
        type: 'market_status_change',
        threshold: 50,
        currentValue: data.transactionCount,
        previousValue: 40,
        message: `${region} 시장이 매우 활발합니다. 거래량: ${data.transactionCount}건`,
        timestamp: new Date(),
        isRead: false
      };
      this.notifyAlert(alert);
    }
  }

  // 알림 전송
  private notifyAlert(alert: RealEstateAlert) {
    this.alerts.push(alert);
    this.alertSubscribers.forEach(callback => callback(alert));
  }

  // 알림 목록 조회
  getAlerts(region?: string): RealEstateAlert[] {
    let filteredAlerts = this.alerts;
    if (region) {
      filteredAlerts = this.alerts.filter(alert => alert.region === region);
    }
    return filteredAlerts.sort((a, b) => {
      const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
  }

  // 알림 읽음 처리
  markAlertAsRead(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  // 알림 삭제
  deleteAlert(alertId: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  // 시세 히스토리 조회 (최근 6개월)
  async getPriceHistory(region: string, months: number = 6): Promise<{ date: string; price: number; trend: string }[]> {
    const data = this.mockData[region];
    if (!data) return [];

    const history = [];
    const currentDate = new Date();

    for (let i = months; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);

      // 단순한 선형 변화 시뮬레이션
      const monthChange = (data.trendPercentage / 12) * i;
      const historicalPrice = data.averagePrice * (1 + monthChange / 100);

      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(historicalPrice),
        trend: data.trend
      });
    }

    return history;
  }

  // 지역별 투자 등급 평가
  getInvestmentGrade(region: string): { grade: string; score: number; factors: string[] } {
    const data = this.mockData[region];
    if (!data) {
      return { grade: 'N/A', score: 0, factors: ['데이터 없음'] };
    }

    let score = 0;
    const factors: string[] = [];

    // 트렌드 점수 (40점)
    if (data.trend === 'up') {
      score += 40;
      factors.push('상승세');
    } else if (data.trend === 'stable') {
      score += 25;
      factors.push('안정세');
    } else {
      score += 10;
      factors.push('하락세');
    }

    // 시장 상태 점수 (30점)
    if (data.marketStatus === 'hot') {
      score += 30;
      factors.push('활발한 시장');
    } else if (data.marketStatus === 'normal') {
      score += 20;
      factors.push('보통 시장');
    } else {
      score += 10;
      factors.push('침체 시장');
    }

    // 거래량 점수 (20점)
    if (data.transactionCount > 40) {
      score += 20;
      factors.push('높은 거래량');
    } else if (data.transactionCount > 20) {
      score += 15;
      factors.push('보통 거래량');
    } else {
      score += 5;
      factors.push('낮은 거래량');
    }

    // 가격 안정성 점수 (10점)
    const priceVolatility = Math.abs(data.trendPercentage);
    if (priceVolatility < 1) {
      score += 10;
      factors.push('안정적인 가격');
    } else if (priceVolatility < 3) {
      score += 7;
      factors.push('적당한 변동성');
    } else {
      score += 3;
      factors.push('높은 변동성');
    }

    // 등급 결정
    let grade = 'D';
    if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';

    return { grade, score, factors };
  }
}

export const realEstateService = new RealEstateService();
export default realEstateService;
