/**
 * 부동산 시장 분석 서비스
 * 매매/전세 시세, 정책 변화, 투자 전망 분석
 */

export interface MarketPrice {
    id: string;
    region: string;
    district: string;
    propertyType: 'apartment' | 'villa' | 'officetel' | 'house';
    area: number; // 평방미터
    salePrice?: number;
    rentPrice?: number;
    deposit?: number;
    pricePerSquareMeter: number;
    priceChange: {
        oneMonth: number;
        threeMonth: number;
        sixMonth: number;
        oneYear: number;
    };
    marketTrend: 'rising' | 'stable' | 'falling';
    transactionVolume: number;
    lastUpdated: Date;
    buildingAge?: number;
    floor?: number;
    totalFloors?: number;
    direction?: string;
    amenities: string[];
}

export interface PolicyImpact {
    id: string;
    policyName: string;
    announcementDate: Date;
    effectiveDate: Date;
    category: 'tax' | 'loan' | 'regulation' | 'supply' | 'development';
    description: string;
    targetArea: string[];
    impactLevel: 'high' | 'medium' | 'low';
    expectedEffect: 'positive' | 'negative' | 'neutral';
    priceImpact: {
        shortTerm: number; // percentage
        mediumTerm: number;
        longTerm: number;
    };
    affectedPropertyTypes: string[];
    keyChanges: string[];
    marketResponse: {
        transactionVolumeChange: number;
        priceVolatility: number;
        investorSentiment: 'bullish' | 'bearish' | 'neutral';
    };
}

export interface InvestmentAnalysis {
    id: string;
    region: string;
    propertyType: string;
    investmentScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
    expectedReturn: {
        oneYear: number;
        threeYear: number;
        fiveYear: number;
    };
    capitalGainPotential: number;
    rentalYield: number;
    liquidityScore: number;
    developmentPotential: number;
    infrastructureScore: number;
    demographicTrend: 'positive' | 'stable' | 'negative';
    supplyDemandBalance: number; // -1 to 1 (oversupply to undersupply)
    competitiveAdvantages: string[];
    riskFactors: string[];
    recommendedStrategy: 'buy' | 'hold' | 'sell' | 'avoid';
    optimalHoldingPeriod: number; // years
    entryTiming: 'immediate' | 'wait_3months' | 'wait_6months' | 'wait_1year';
}

export interface MarketTrend {
    period: string;
    region: string;
    averagePrice: number;
    transactionVolume: number;
    priceIndex: number;
    volatility: number;
    momentum: number;
    seasonalFactor: number;
}

export interface RegionalAnalysis {
    region: string;
    district: string;
    population: number;
    populationGrowth: number;
    averageIncome: number;
    employmentRate: number;
    majorIndustries: string[];
    transportationScore: number;
    educationScore: number;
    commercialScore: number;
    developmentPlans: {
        name: string;
        type: string;
        completionDate: Date;
        expectedImpact: string;
    }[];
    marketMaturity: 'emerging' | 'developing' | 'mature' | 'declining';
    investmentHotspot: boolean;
    gentrificationRisk: number;
}

export interface MarketForecast {
    region: string;
    timeframe: '3months' | '6months' | '1year' | '3years' | '5years';
    priceProjection: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
        confidence: number;
    };
    volumeProjection: {
        expected: number;
        confidence: number;
    };
    keyDrivers: string[];
    riskFactors: string[];
    scenarioAnalysis: {
        scenario: string;
        probability: number;
        priceImpact: number;
        description: string;
    }[];
}

export interface MarketAlert {
    id: string;
    type: 'price_surge' | 'volume_spike' | 'policy_change' | 'development_news' | 'market_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    region: string;
    title: string;
    description: string;
    impact: string;
    actionRequired: boolean;
    recommendations: string[];
    createdAt: Date;
    expiresAt?: Date;
}

class RealEstateMarketAnalysisService {
    private marketPrices: MarketPrice[] = [];
    private policyImpacts: PolicyImpact[] = [];
    private investmentAnalyses: InvestmentAnalysis[] = [];
    private marketTrends: MarketTrend[] = [];
    private regionalAnalyses: RegionalAnalysis[] = [];
    private marketForecasts: MarketForecast[] = [];
    private marketAlerts: MarketAlert[] = [];

    constructor() {
        this.initializeMockData();
    }

    // 시장 가격 분석
    analyzeMarketPrices(region?: string, propertyType?: string): {
        averagePrice: number;
        priceRange: { min: number; max: number };
        trendAnalysis: {
            direction: 'rising' | 'stable' | 'falling';
            strength: number;
            momentum: number;
        };
        comparativeAnalysis: {
            regionComparison: { region: string; priceRatio: number }[];
            typeComparison: { type: string; priceRatio: number }[];
        };
        hotspots: { region: string; growthRate: number }[];
    } {
        let filteredPrices = this.marketPrices;

        if (region) {
            filteredPrices = filteredPrices.filter(p => p.region === region);
        }
        if (propertyType) {
            filteredPrices = filteredPrices.filter(p => p.propertyType === propertyType);
        }

        const averagePrice = filteredPrices.reduce((sum, p) => sum + p.pricePerSquareMeter, 0) / filteredPrices.length;
        const prices = filteredPrices.map(p => p.pricePerSquareMeter);
        const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };

        // 트렌드 분석
        const risingCount = filteredPrices.filter(p => p.marketTrend === 'rising').length;
        const _stableCount = filteredPrices.filter(p => p.marketTrend === 'stable').length;
        const fallingCount = filteredPrices.filter(p => p.marketTrend === 'falling').length;

        const totalCount = filteredPrices.length;
        const risingRatio = risingCount / totalCount;
        const fallingRatio = fallingCount / totalCount;

        let direction: 'rising' | 'stable' | 'falling' = 'stable';
        if (risingRatio > 0.6) direction = 'rising';
        else if (fallingRatio > 0.6) direction = 'falling';

        const strength = Math.abs(risingRatio - fallingRatio);
        const momentum = filteredPrices.reduce((sum, p) => sum + p.priceChange.oneMonth, 0) / totalCount;

        // 지역별 비교
        const regionComparison = this.getRegionComparison(averagePrice);
        const typeComparison = this.getTypeComparison(averagePrice, propertyType);

        // 핫스팟 분석
        const hotspots = this.identifyHotspots();

        return {
            averagePrice,
            priceRange,
            trendAnalysis: { direction, strength, momentum },
            comparativeAnalysis: { regionComparison, typeComparison },
            hotspots
        };
    }

    // 정책 영향 분석
    analyzePolicyImpact(timeframe: 'current' | 'upcoming' | 'historical' = 'current'): {
        activePolicies: PolicyImpact[];
        overallImpact: 'positive' | 'negative' | 'neutral';
        impactScore: number;
        regionImpacts: { region: string; impact: number }[];
        recommendations: string[];
    } {
        const now = new Date();
        let relevantPolicies: PolicyImpact[] = [];

        switch (timeframe) {
            case 'current':
                relevantPolicies = this.policyImpacts.filter(p =>
                    p.effectiveDate <= now &&
                    new Date(p.effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000) > now
                );
                break;
            case 'upcoming':
                relevantPolicies = this.policyImpacts.filter(p => p.effectiveDate > now);
                break;
            case 'historical':
                relevantPolicies = this.policyImpacts.filter(p =>
                    new Date(p.effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000) <= now
                );
                break;
        }

        // 전체 영향도 계산
        const impactScores = relevantPolicies.map(p => {
            const levelWeight = { high: 3, medium: 2, low: 1 }[p.impactLevel];
            const effectWeight = { positive: 1, negative: -1, neutral: 0 }[p.expectedEffect];
            return levelWeight * effectWeight;
        });

        const totalImpactScore = impactScores.reduce((sum, score) => sum + score, 0);
        const averageImpact = totalImpactScore / relevantPolicies.length || 0;

        let overallImpact: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (averageImpact > 0.5) overallImpact = 'positive';
        else if (averageImpact < -0.5) overallImpact = 'negative';

        // 지역별 영향도
        const regionImpacts = this.calculateRegionImpacts(relevantPolicies);

        // 추천사항
        const recommendations = this.generatePolicyRecommendations(relevantPolicies, overallImpact);

        return {
            activePolicies: relevantPolicies,
            overallImpact,
            impactScore: Math.abs(averageImpact) * 100,
            regionImpacts,
            recommendations
        };
    }

    // 투자 분석
    analyzeInvestmentOpportunity(region: string, propertyType: string, budget: number): {
        investmentScore: number;
        recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
        expectedReturn: InvestmentAnalysis['expectedReturn'];
        riskAssessment: {
            level: 'low' | 'medium' | 'high';
            factors: string[];
            mitigation: string[];
        };
        optimalStrategy: {
            timing: string;
            holdingPeriod: number;
            exitStrategy: string;
        };
        alternatives: {
            region: string;
            type: string;
            score: number;
            reason: string;
        }[];
    } {
        const analysis = this.investmentAnalyses.find(a =>
            a.region === region && a.propertyType === propertyType
        );

        if (!analysis) {
            return this.generateDefaultAnalysis(region, propertyType, budget);
        }

        // 추천 등급 결정
        let recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' = 'hold';
        if (analysis.investmentScore >= 80) recommendation = 'strong_buy';
        else if (analysis.investmentScore >= 65) recommendation = 'buy';
        else if (analysis.investmentScore < 40) recommendation = 'avoid';

        // 리스크 평가
        const riskAssessment = {
            level: analysis.riskLevel,
            factors: analysis.riskFactors,
            mitigation: this.generateRiskMitigation(analysis.riskFactors)
        };

        // 최적 전략
        const optimalStrategy = {
            timing: this.getTimingRecommendation(analysis.entryTiming),
            holdingPeriod: analysis.optimalHoldingPeriod,
            exitStrategy: this.generateExitStrategy(analysis)
        };

        // 대안 투자처
        const alternatives = this.findAlternatives(region, propertyType, budget);

        return {
            investmentScore: analysis.investmentScore,
            recommendation,
            expectedReturn: analysis.expectedReturn,
            riskAssessment,
            optimalStrategy,
            alternatives
        };
    }

    // 시장 예측
    generateMarketForecast(region: string, timeframe: MarketForecast['timeframe']): MarketForecast {
        const existingForecast = this.marketForecasts.find(f =>
            f.region === region && f.timeframe === timeframe
        );

        if (existingForecast) {
            return existingForecast;
        }

        // AI 기반 예측 생성 (시뮬레이션)
        const currentPrices = this.marketPrices.filter(p => p.region === region);
        const averagePrice = currentPrices.reduce((sum, p) => sum + p.pricePerSquareMeter, 0) / currentPrices.length;

        const timeMultiplier = {
            '3months': 0.25,
            '6months': 0.5,
            '1year': 1,
            '3years': 3,
            '5years': 5
        }[timeframe];

        const baseGrowth = 0.03 * timeMultiplier; // 3% annual growth base
        const volatility = 0.1 * Math.sqrt(timeMultiplier);

        const forecast: MarketForecast = {
            region,
            timeframe,
            priceProjection: {
                optimistic: averagePrice * (1 + baseGrowth + volatility),
                realistic: averagePrice * (1 + baseGrowth),
                pessimistic: averagePrice * (1 + baseGrowth - volatility),
                confidence: Math.max(0.6, 0.9 - timeMultiplier * 0.1)
            },
            volumeProjection: {
                expected: 100 * (1 + baseGrowth * 0.5),
                confidence: 0.7
            },
            keyDrivers: this.identifyKeyDrivers(region),
            riskFactors: this.identifyRiskFactors(region),
            scenarioAnalysis: this.generateScenarios(region, timeframe)
        };

        this.marketForecasts.push(forecast);
        return forecast;
    }

    // 시장 알림 생성
    generateMarketAlerts(): MarketAlert[] {
        const alerts: MarketAlert[] = [];
        const now = new Date();

        // 가격 급등 감지
        this.marketPrices.forEach(price => {
            if (price.priceChange.oneMonth > 10) {
                alerts.push({
                    id: this.generateId(),
                    type: 'price_surge',
                    severity: price.priceChange.oneMonth > 20 ? 'high' : 'medium',
                    region: `${price.region} ${price.district}`,
                    title: '가격 급등 감지',
                    description: `${price.region} ${price.district} ${price.propertyType} 가격이 한 달간 ${price.priceChange.oneMonth.toFixed(1)}% 상승했습니다.`,
                    impact: '투자 기회 또는 버블 위험 가능성',
                    actionRequired: true,
                    recommendations: [
                        '시장 동향 면밀 모니터링',
                        '투자 타이밍 검토',
                        '리스크 관리 강화'
                    ],
                    createdAt: now,
                    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                });
            }
        });

        // 거래량 급증 감지
        this.marketPrices.forEach(price => {
            if (price.transactionVolume > 150) { // 평균 대비 50% 증가
                alerts.push({
                    id: this.generateId(),
                    type: 'volume_spike',
                    severity: 'medium',
                    region: `${price.region} ${price.district}`,
                    title: '거래량 급증',
                    description: `${price.region} ${price.district}에서 거래량이 평소보다 크게 증가했습니다.`,
                    impact: '시장 관심도 증가, 가격 변동성 확대 가능',
                    actionRequired: false,
                    recommendations: [
                        '시장 동향 주의 관찰',
                        '투자 기회 검토'
                    ],
                    createdAt: now
                });
            }
        });

        // 정책 변화 알림
        this.policyImpacts.forEach(policy => {
            const daysSinceAnnouncement = Math.floor((now.getTime() - policy.announcementDate.getTime()) / (24 * 60 * 60 * 1000));
            if (daysSinceAnnouncement <= 7 && policy.impactLevel === 'high') {
                alerts.push({
                    id: this.generateId(),
                    type: 'policy_change',
                    severity: 'high',
                    region: policy.targetArea.join(', '),
                    title: '중요 정책 발표',
                    description: `${policy.policyName}이 발표되었습니다.`,
                    impact: policy.description,
                    actionRequired: true,
                    recommendations: [
                        '정책 상세 내용 검토',
                        '투자 전략 재검토',
                        '전문가 상담 고려'
                    ],
                    createdAt: now,
                    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                });
            }
        });

        return alerts;
    }

    // 지역별 시장 분석
    getRegionalAnalysis(region: string): RegionalAnalysis | null {
        return this.regionalAnalyses.find(r => r.region === region) || null;
    }

    // 시장 트렌드 분석
    getMarketTrends(region?: string, period?: string): MarketTrend[] {
        let trends = this.marketTrends;

        if (region) {
            trends = trends.filter(t => t.region === region);
        }
        if (period) {
            trends = trends.filter(t => t.period === period);
        }

        return trends.sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
    }

    // Private helper methods
    private initializeMockData(): void {
        // 시장 가격 데이터 초기화
        this.marketPrices = [
            {
                id: '1',
                region: '강남구',
                district: '역삼동',
                propertyType: 'apartment',
                area: 84,
                salePrice: 1200000000,
                pricePerSquareMeter: 14285714,
                priceChange: {
                    oneMonth: 2.3,
                    threeMonth: 5.1,
                    sixMonth: 8.7,
                    oneYear: 12.4
                },
                marketTrend: 'rising',
                transactionVolume: 120,
                lastUpdated: new Date(),
                buildingAge: 15,
                floor: 10,
                totalFloors: 25,
                direction: '남향',
                amenities: ['지하철역 도보 5분', '대형마트', '학군 우수']
            },
            {
                id: '2',
                region: '서초구',
                district: '반포동',
                propertyType: 'apartment',
                area: 105,
                salePrice: 1800000000,
                pricePerSquareMeter: 17142857,
                priceChange: {
                    oneMonth: 1.8,
                    threeMonth: 4.2,
                    sixMonth: 7.9,
                    oneYear: 15.2
                },
                marketTrend: 'rising',
                transactionVolume: 95,
                lastUpdated: new Date(),
                buildingAge: 8,
                floor: 15,
                totalFloors: 30,
                direction: '남동향',
                amenities: ['한강뷰', '지하철역 도보 3분', '명문학군']
            },
            {
                id: '3',
                region: '마포구',
                district: '상암동',
                propertyType: 'apartment',
                area: 74,
                salePrice: 900000000,
                pricePerSquareMeter: 12162162,
                priceChange: {
                    oneMonth: 0.5,
                    threeMonth: 1.2,
                    sixMonth: 2.8,
                    oneYear: 5.6
                },
                marketTrend: 'stable',
                transactionVolume: 80,
                lastUpdated: new Date(),
                buildingAge: 12,
                floor: 8,
                totalFloors: 20,
                direction: '서향',
                amenities: ['디지털미디어시티', '공원 인접', '신축 상가']
            }
        ];

        // 정책 영향 데이터 초기화
        this.policyImpacts = [
            {
                id: '1',
                policyName: '부동산 거래신고 등에 관한 법률 개정',
                announcementDate: new Date('2024-01-15'),
                effectiveDate: new Date('2024-03-01'),
                category: 'regulation',
                description: '부동산 거래 투명성 강화를 위한 신고 의무 확대',
                targetArea: ['전국'],
                impactLevel: 'medium',
                expectedEffect: 'neutral',
                priceImpact: {
                    shortTerm: -1.5,
                    mediumTerm: 0.5,
                    longTerm: 2.0
                },
                affectedPropertyTypes: ['apartment', 'villa', 'house'],
                keyChanges: [
                    '거래신고 의무 확대',
                    '허위신고 처벌 강화',
                    '실거래가 공개 범위 확대'
                ],
                marketResponse: {
                    transactionVolumeChange: -15,
                    priceVolatility: 0.8,
                    investorSentiment: 'neutral'
                }
            },
            {
                id: '2',
                policyName: '서울시 재건축 초과이익 환수제 완화',
                announcementDate: new Date('2024-02-01'),
                effectiveDate: new Date('2024-04-01'),
                category: 'regulation',
                description: '재건축 사업 활성화를 위한 초과이익 환수율 조정',
                targetArea: ['서울시'],
                impactLevel: 'high',
                expectedEffect: 'positive',
                priceImpact: {
                    shortTerm: 3.2,
                    mediumTerm: 8.5,
                    longTerm: 15.0
                },
                affectedPropertyTypes: ['apartment'],
                keyChanges: [
                    '환수율 50% → 30% 인하',
                    '적용 기준 완화',
                    '재건축 절차 간소화'
                ],
                marketResponse: {
                    transactionVolumeChange: 25,
                    priceVolatility: 1.2,
                    investorSentiment: 'bullish'
                }
            }
        ];

        // 투자 분석 데이터 초기화
        this.investmentAnalyses = [
            {
                id: '1',
                region: '강남구',
                propertyType: 'apartment',
                investmentScore: 85,
                riskLevel: 'medium',
                expectedReturn: {
                    oneYear: 8.5,
                    threeYear: 25.2,
                    fiveYear: 45.8
                },
                capitalGainPotential: 12.5,
                rentalYield: 2.8,
                liquidityScore: 90,
                developmentPotential: 75,
                infrastructureScore: 95,
                demographicTrend: 'positive',
                supplyDemandBalance: 0.3,
                competitiveAdvantages: [
                    '강남 프리미엄',
                    '교통 접근성 우수',
                    '교육 인프라 완비',
                    '상업시설 밀집'
                ],
                riskFactors: [
                    '높은 진입 비용',
                    '정책 변화 민감성',
                    '시장 과열 우려'
                ],
                recommendedStrategy: 'buy',
                optimalHoldingPeriod: 5,
                entryTiming: 'immediate'
            },
            {
                id: '2',
                region: '마포구',
                propertyType: 'apartment',
                investmentScore: 72,
                riskLevel: 'low',
                expectedReturn: {
                    oneYear: 5.2,
                    threeYear: 18.5,
                    fiveYear: 35.0
                },
                capitalGainPotential: 8.5,
                rentalYield: 3.2,
                liquidityScore: 75,
                developmentPotential: 85,
                infrastructureScore: 80,
                demographicTrend: 'positive',
                supplyDemandBalance: 0.1,
                competitiveAdvantages: [
                    '개발 잠재력 높음',
                    '상대적 저평가',
                    '교통망 확충 예정',
                    '젊은 인구 유입'
                ],
                riskFactors: [
                    '공급 물량 증가',
                    '개발 지연 위험'
                ],
                recommendedStrategy: 'buy',
                optimalHoldingPeriod: 7,
                entryTiming: 'wait_3months'
            }
        ];

        // 지역 분석 데이터 초기화
        this.regionalAnalyses = [
            {
                region: '강남구',
                district: '역삼동',
                population: 45000,
                populationGrowth: 1.2,
                averageIncome: 85000000,
                employmentRate: 68.5,
                majorIndustries: ['IT', '금융', '의료', '교육'],
                transportationScore: 95,
                educationScore: 98,
                commercialScore: 92,
                developmentPlans: [
                    {
                        name: '역삼역 복합개발',
                        type: '상업복합',
                        completionDate: new Date('2026-12-31'),
                        expectedImpact: '지역 상권 활성화 및 부동산 가치 상승'
                    }
                ],
                marketMaturity: 'mature',
                investmentHotspot: true,
                gentrificationRisk: 0.2
            },
            {
                region: '마포구',
                district: '상암동',
                population: 38000,
                populationGrowth: 3.5,
                averageIncome: 62000000,
                employmentRate: 72.1,
                majorIndustries: ['미디어', 'IT', '스포츠', '엔터테인먼트'],
                transportationScore: 85,
                educationScore: 75,
                commercialScore: 80,
                developmentPlans: [
                    {
                        name: '상암 DMC 2단계',
                        type: '복합개발',
                        completionDate: new Date('2025-06-30'),
                        expectedImpact: 'IT 클러스터 확장 및 주거 수요 증가'
                    }
                ],
                marketMaturity: 'developing',
                investmentHotspot: true,
                gentrificationRisk: 0.6
            }
        ];

        // 시장 트렌드 데이터 초기화
        this.marketTrends = this.generateTrendData();
    }

    private generateTrendData(): MarketTrend[] {
        const trends: MarketTrend[] = [];
        const regions = ['강남구', '서초구', '마포구', '용산구', '성동구'];
        const baseDate = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setMonth(date.getMonth() - i);
            const period = date.toISOString().substring(0, 7);

            regions.forEach(region => {
                trends.push({
                    period,
                    region,
                    averagePrice: 12000000 + Math.random() * 8000000,
                    transactionVolume: 80 + Math.random() * 40,
                    priceIndex: 100 + Math.random() * 20 - 10,
                    volatility: Math.random() * 0.1,
                    momentum: Math.random() * 0.2 - 0.1,
                    seasonalFactor: Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.05
                });
            });
        }

        return trends;
    }

    private getRegionComparison(basePrice: number): { region: string; priceRatio: number }[] {
        const regions = ['강남구', '서초구', '송파구', '마포구', '용산구'];
        return regions.map(region => {
            const regionPrices = this.marketPrices.filter(p => p.region === region);
            const avgPrice = regionPrices.length > 0
                ? regionPrices.reduce((sum, p) => sum + p.pricePerSquareMeter, 0) / regionPrices.length
                : basePrice;
            return {
                region,
                priceRatio: avgPrice / basePrice
            };
        });
    }

    private getTypeComparison(basePrice: number, excludeType?: string): { type: string; priceRatio: number }[] {
        const types = ['apartment', 'villa', 'officetel', 'house'];
        return types
            .filter(type => type !== excludeType)
            .map(type => {
                const typePrices = this.marketPrices.filter(p => p.propertyType === type);
                const avgPrice = typePrices.length > 0
                    ? typePrices.reduce((sum, p) => sum + p.pricePerSquareMeter, 0) / typePrices.length
                    : basePrice;
                return {
                    type,
                    priceRatio: avgPrice / basePrice
                };
            });
    }

    private identifyHotspots(): { region: string; growthRate: number }[] {
        const regionGrowth: { [region: string]: number[] } = {};

        this.marketPrices.forEach(price => {
            if (!regionGrowth[price.region]) {
                regionGrowth[price.region] = [];
            }
            regionGrowth[price.region].push(price.priceChange.oneYear);
        });

        return Object.entries(regionGrowth)
            .map(([region, growthRates]) => ({
                region,
                growthRate: growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
            }))
            .filter(item => item.growthRate > 8)
            .sort((a, b) => b.growthRate - a.growthRate)
            .slice(0, 5);
    }

    private calculateRegionImpacts(policies: PolicyImpact[]): { region: string; impact: number }[] {
        const regionImpacts: { [region: string]: number } = {};

        policies.forEach(policy => {
            policy.targetArea.forEach(area => {
                const impactValue = policy.priceImpact.shortTerm *
                    ({ high: 3, medium: 2, low: 1 }[policy.impactLevel]);
                regionImpacts[area] = (regionImpacts[area] || 0) + impactValue;
            });
        });

        return Object.entries(regionImpacts).map(([region, impact]) => ({ region, impact }));
    }

    private generatePolicyRecommendations(policies: PolicyImpact[], overallImpact: string): string[] {
        const recommendations: string[] = [];

        if (overallImpact === 'positive') {
            recommendations.push('정책 호재를 활용한 투자 기회 검토');
            recommendations.push('해당 지역 부동산 시장 모니터링 강화');
        } else if (overallImpact === 'negative') {
            recommendations.push('투자 계획 재검토 및 리스크 관리');
            recommendations.push('정책 변화 추이 지속 관찰');
        }

        if (policies.some(p => p.category === 'tax')) {
            recommendations.push('세제 변화에 따른 투자 전략 조정');
        }
        if (policies.some(p => p.category === 'loan')) {
            recommendations.push('대출 조건 변화 대응 방안 수립');
        }

        return recommendations;
    }

    private generateDefaultAnalysis(_region: string, _propertyType: string, _budget: number): {
        investmentScore: number;
        recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
        expectedReturn: { oneYear: number; threeYear: number; fiveYear: number };
        riskAssessment: { level: 'low' | 'medium' | 'high'; factors: string[]; mitigation: string[] };
        optimalStrategy: { timing: string; holdingPeriod: number; exitStrategy: string };
        alternatives: { region: string; type: string; score: number; reason: string }[];
    } {
        return {
            investmentScore: 60,
            recommendation: 'hold' as const,
            expectedReturn: { oneYear: 3, threeYear: 10, fiveYear: 20 },
            riskAssessment: {
                level: 'medium' as const,
                factors: ['시장 불확실성', '정책 변화 위험'],
                mitigation: ['분산 투자', '전문가 상담']
            },
            optimalStrategy: {
                timing: '시장 안정화 후',
                holdingPeriod: 5,
                exitStrategy: '시장 상황에 따른 유연한 대응'
            },
            alternatives: []
        };
    }

    private generateRiskMitigation(riskFactors: string[]): string[] {
        const mitigations: string[] = [];

        riskFactors.forEach(risk => {
            if (risk.includes('정책')) {
                mitigations.push('정책 동향 지속 모니터링');
            }
            if (risk.includes('비용') || risk.includes('가격')) {
                mitigations.push('적정 가격 범위 내 투자');
            }
            if (risk.includes('공급')) {
                mitigations.push('공급 계획 사전 조사');
            }
        });

        return Array.from(new Set(mitigations));
    }

    private getTimingRecommendation(timing: InvestmentAnalysis['entryTiming']): string {
        const timingMap = {
            'immediate': '즉시 투자 검토',
            'wait_3months': '3개월 후 재검토',
            'wait_6months': '6개월 후 재검토',
            'wait_1year': '1년 후 재검토'
        };
        return timingMap[timing];
    }

    private generateExitStrategy(analysis: InvestmentAnalysis): string {
        if (analysis.expectedReturn.fiveYear > 40) {
            return '장기 보유 후 시장 최고점 매도';
        } else if (analysis.liquidityScore > 80) {
            return '시장 상황에 따른 유연한 매도';
        } else {
            return '보유 기간 준수 후 안정적 매도';
        }
    }

    private findAlternatives(region: string, propertyType: string, _budget: number): { region: string; type: string; score: number; reason: string }[] {
        return this.investmentAnalyses
            .filter(a => a.region !== region || a.propertyType !== propertyType)
            .sort((a, b) => b.investmentScore - a.investmentScore)
            .slice(0, 3)
            .map(a => ({
                region: a.region,
                type: a.propertyType,
                score: a.investmentScore,
                reason: a.competitiveAdvantages[0] || '투자 매력도 높음'
            }));
    }

    private identifyKeyDrivers(region: string): string[] {
        const regionalAnalysis = this.getRegionalAnalysis(region);
        const drivers: string[] = [];

        if (regionalAnalysis) {
            if (regionalAnalysis.populationGrowth > 2) {
                drivers.push('인구 증가');
            }
            if (regionalAnalysis.developmentPlans.length > 0) {
                drivers.push('개발 계획');
            }
            if (regionalAnalysis.transportationScore > 85) {
                drivers.push('교통 인프라');
            }
        }

        drivers.push('경제 성장', '금리 정책', '부동산 정책');
        return drivers;
    }

    private identifyRiskFactors(_region: string): string[] {
        return [
            '금리 상승 위험',
            '정책 변화',
            '경기 침체',
            '공급 과잉',
            '인구 감소'
        ];
    }

    private generateScenarios(_region: string, _timeframe: string): MarketForecast['scenarioAnalysis'] {
        return [
            {
                scenario: '낙관적 시나리오',
                probability: 0.3,
                priceImpact: 15,
                description: '경제 호황, 정책 호재, 개발 계획 순조진행'
            },
            {
                scenario: '기본 시나리오',
                probability: 0.5,
                priceImpact: 5,
                description: '현재 추세 지속, 안정적 성장'
            },
            {
                scenario: '비관적 시나리오',
                probability: 0.2,
                priceImpact: -8,
                description: '경기 침체, 정책 규제 강화, 금리 급등'
            }
        ];
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    // Public getter methods
    public getMarketPrices(): MarketPrice[] {
        return this.marketPrices;
    }

    public getPolicyImpacts(): PolicyImpact[] {
        return this.policyImpacts;
    }

    public getInvestmentAnalyses(): InvestmentAnalysis[] {
        return this.investmentAnalyses;
    }

    public getMarketAlerts(): MarketAlert[] {
        return this.generateMarketAlerts();
    }

    public getRegionalAnalyses(): RegionalAnalysis[] {
        return this.regionalAnalyses;
    }
}

export const realEstateMarketAnalysisService = new RealEstateMarketAnalysisService();
