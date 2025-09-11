import { webSearchService } from './webSearchService';

// 부동산 관련 인터페이스
export interface RealEstateLaw {
  id: string;
  title: string;
  category: 'urban_planning' | 'reconstruction' | 'redevelopment' | 'housing' | 'tax' | 'finance';
  content: string;
  articles: LawArticle[];
  lastUpdated: Date;
  source: string;
  applicableRegions: string[];
  relatedCases: string[];
}

export interface LawArticle {
  articleNumber: string;
  title: string;
  content: string;
  amendments: Amendment[];
  interpretations: string[];
}

export interface Amendment {
  date: Date;
  description: string;
  impact: 'major' | 'minor' | 'clarification';
}

export interface ReconstructionProject {
  id: string;
  name: string;
  location: {
    address: string;
    district: string;
    coordinates: { lat: number; lng: number };
  };
  status: 'planning' | 'approval_pending' | 'approved' | 'construction' | 'completed';
  timeline: ProjectTimeline;
  financials: ProjectFinancials;
  constructionCompany: string;
  residents: ResidentInfo[];
  issues: ProjectIssue[];
  marketAnalysis: MarketAnalysis;
  communityFeedback: CommunityFeedback[];
}

export interface ProjectTimeline {
  planningStart: Date;
  approvalSubmission?: Date;
  approvalReceived?: Date;
  constructionStart?: Date;
  expectedCompletion?: Date;
  actualCompletion?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  description: string;
}

export interface ProjectFinancials {
  totalBudget: number;
  currentSpent: number;
  estimatedCost: number;
  fundingSources: FundingSource[];
  costBreakdown: CostBreakdown;
  marketValue: {
    before: number;
    projected: number;
    current?: number;
  };
}

export interface FundingSource {
  type: 'government' | 'private' | 'resident' | 'loan';
  amount: number;
  percentage: number;
  conditions: string[];
}

export interface CostBreakdown {
  land: number;
  construction: number;
  design: number;
  permits: number;
  contingency: number;
  other: number;
}

export interface ResidentInfo {
  id: string;
  unitNumber: string;
  ownershipType: 'owner' | 'tenant' | 'both';
  demographics: {
    ageGroup: string;
    familySize: number;
    income: string;
    occupation: string;
  };
  preferences: {
    unitSize: string;
    floor: string;
    direction: string;
    amenities: string[];
  };
  concerns: string[];
  participationLevel: 'active' | 'moderate' | 'passive' | 'opposed';
  communicationStyle: 'formal' | 'casual' | 'technical' | 'emotional';
}

export interface ProjectIssue {
  id: string;
  type: 'construction' | 'legal' | 'financial' | 'community' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: Date;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  responses: IssueResponse[];
  relatedDocuments: string[];
}

export interface IssueResponse {
  id: string;
  respondent: string;
  role: 'construction_company' | 'resident' | 'government' | 'expert';
  response: string;
  timestamp: Date;
  attachments: string[];
  effectiveness: number; // 0-1
}

export interface MarketAnalysis {
  currentPrices: {
    sale: PriceRange;
    rent: PriceRange;
  };
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    timeframe: string;
  };
  comparables: ComparableProperty[];
  projections: MarketProjection[];
  factors: MarketFactor[];
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  perSquareMeter: number;
}

export interface ComparableProperty {
  name: string;
  distance: number;
  pricePerSqm: number;
  completionYear: number;
  amenities: string[];
  similarityScore: number;
}

export interface MarketProjection {
  timeframe: '1year' | '3year' | '5year' | '10year';
  priceIncrease: number;
  confidence: number;
  factors: string[];
}

export interface MarketFactor {
  type: 'policy' | 'economic' | 'demographic' | 'infrastructure';
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface CommunityFeedback {
  id: string;
  platform: 'naver_cafe' | 'daum_cafe' | 'facebook' | 'nextdoor' | 'apt_app' | 'community_board';
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topics: string[];
  timestamp: Date;
  responses: CommunityResponse[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface CommunityResponse {
  id: string;
  type: 'ai_generated' | 'human_written' | 'template_based';
  content: string;
  tone: 'professional' | 'friendly' | 'empathetic' | 'informative';
  personalizedFor: string; // resident ID
  effectiveness: number;
  timestamp: Date;
}

export interface ConstructionCompanyProfile {
  id: string;
  name: string;
  businessNumber: string;
  established: Date;
  headquarters: string;
  ceo: string;
  employees: number;
  capital: number;
  specialties: string[];
  certifications: string[];
  projects: CompanyProject[];
  reputation: CompanyReputation;
  financialHealth: FinancialHealth;
  defectHistory: DefectRecord[];
}

export interface CompanyProject {
  name: string;
  location: string;
  completionYear: number;
  units: number;
  value: number;
  type: 'apartment' | 'office' | 'mixed' | 'commercial';
  awards: string[];
  issues: string[];
}

export interface CompanyReputation {
  overallScore: number; // 0-100
  qualityScore: number;
  timelinessScore: number;
  customerServiceScore: number;
  defectResolutionScore: number;
  reviews: CompanyReview[];
  mediaReports: MediaReport[];
}

export interface CompanyReview {
  projectName: string;
  rating: number;
  review: string;
  reviewer: string;
  date: Date;
  verified: boolean;
}

export interface MediaReport {
  title: string;
  source: string;
  date: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  url: string;
}

export interface FinancialHealth {
  revenue: number[];
  profit: number[];
  debt: number;
  creditRating: string;
  bondRating?: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface DefectRecord {
  projectName: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  reportedDate: Date;
  resolvedDate?: Date;
  resolutionMethod: string;
  cost: number;
  recurrence: boolean;
}

export interface PolicyUpdate {
  id: string;
  title: string;
  category: 'tax' | 'loan' | 'regulation' | 'subsidy' | 'zoning';
  effectiveDate: Date;
  region: string;
  summary: string;
  fullText: string;
  impact: PolicyImpact;
  relatedProjects: string[];
}

export interface TaxInformation {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  assessedValue: number; // 공시가격
  marketValue: number; // 시세
  ownershipInfo: OwnershipInfo;
  taxes: PropertyTaxes;
  taxHistory: TaxRecord[];
  lastUpdated: Date;
}

export interface OwnershipInfo {
  ownerName: string;
  ownershipRatio: number; // 지분율
  acquisitionDate: Date;
  acquisitionPrice: number;
  acquisitionMethod: 'purchase' | 'inheritance' | 'gift' | 'auction';
  isMainResidence: boolean;
  ownershipPeriod: number; // 보유기간 (년)
}

export interface PropertyTaxes {
  propertyTax: TaxCalculation; // 재산세
  comprehensiveRealEstateTax: TaxCalculation; // 종합부동산세
  acquisitionTax: TaxCalculation; // 취득세
  capitalGainsTax: TaxCalculation; // 양도소득세
  localEducationTax: TaxCalculation; // 지방교육세
  ruralDevelopmentTax: TaxCalculation; // 농어촌특별세
}

export interface TaxCalculation {
  taxType: string;
  taxableValue: number; // 과세표준
  taxRate: number; // 세율
  taxAmount: number; // 세액
  deductions: TaxDeduction[]; // 공제사항
  finalTaxAmount: number; // 최종 세액
  dueDate: Date; // 납부기한
  isPaid: boolean;
  paymentDate?: Date;
}

export interface TaxDeduction {
  type: string;
  description: string;
  amount: number;
  eligibilityConditions: string[];
}

export interface TaxRecord {
  id: string;
  year: number;
  taxType: string;
  taxAmount: number;
  paymentDate: Date;
  penalties?: number;
  refunds?: number;
}

export interface TaxOptimization {
  id: string;
  propertyId: string;
  optimizationType: 'acquisition' | 'holding' | 'disposal' | 'reconstruction';
  currentTaxBurden: number;
  optimizedTaxBurden: number;
  savings: number;
  strategies: TaxStrategy[];
  risks: string[];
  timeline: string;
  confidence: number;
}

export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  expectedSavings: number;
  implementationCost: number;
  netBenefit: number;
  requirements: string[];
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TaxPolicy {
  id: string;
  name: string;
  type: 'property_tax' | 'acquisition_tax' | 'capital_gains_tax' | 'comprehensive_tax';
  effectiveDate: Date;
  expiryDate?: Date;
  region: string;
  targetProperty: string[];
  taxRates: TaxRateSchedule[];
  deductions: PolicyDeduction[];
  exemptions: PolicyExemption[];
  changes: PolicyChange[];
}

export interface TaxRateSchedule {
  minValue: number;
  maxValue: number;
  rate: number;
  description: string;
}

export interface PolicyDeduction {
  name: string;
  amount: number;
  conditions: string[];
  maxLimit?: number;
}

export interface PolicyExemption {
  name: string;
  conditions: string[];
  exemptionRate: number; // 0-1
  duration?: string;
}

export interface PolicyChange {
  changeDate: Date;
  changeType: 'rate_change' | 'deduction_change' | 'exemption_change' | 'new_policy';
  description: string;
  impact: string;
}

export interface PolicyImpact {
  marketEffect: 'positive' | 'negative' | 'neutral';
  priceImpact: number; // percentage
  timelineImpact: number; // days
  affectedStakeholders: string[];
  opportunities: string[];
  risks: string[];
}

class RealEstateKnowledgeService {
  private laws: RealEstateLaw[] = [];
  private projects: ReconstructionProject[] = [];
  private companies: ConstructionCompanyProfile[] = [];
  private policies: PolicyUpdate[] = [];
  private marketData: Map<string, MarketAnalysis> = new Map();
  private taxInformation: TaxInformation[] = [];
  private taxPolicies: TaxPolicy[] = [];
  private taxOptimizations: TaxOptimization[] = [];

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeTaxPolicies();
    this.loadStoredData();
  }

  // 지식 베이스 초기화
  private initializeKnowledgeBase(): void {
    // 도시정비법 기본 데이터
    this.laws = [
      {
        id: 'urban_improvement_act',
        title: '도시 및 주거환경정비법',
        category: 'urban_planning',
        content: '도시기능의 회복이 필요하거나 주거환경이 불량한 지역을 계획적으로 정비하고 노후·불량건축물을 효율적으로 개량하기 위하여 필요한 사항을 규정함으로써 도시환경을 개선하고 주거생활의 질을 높이는 것을 목적으로 한다.',
        articles: [
          {
            articleNumber: '제2조',
            title: '정의',
            content: '이 법에서 사용하는 용어의 뜻은 다음과 같다...',
            amendments: [],
            interpretations: []
          }
        ],
        lastUpdated: new Date(),
        source: '국가법령정보센터',
        applicableRegions: ['전국'],
        relatedCases: []
      }
    ];

    // 샘플 시공사 데이터
    this.companies = [
      {
        id: 'sample_construction',
        name: '대한건설',
        businessNumber: '123-45-67890',
        established: new Date('1990-01-01'),
        headquarters: '서울특별시 강남구',
        ceo: '김대표',
        employees: 500,
        capital: 10000000000,
        specialties: ['아파트', '오피스텔', '상업시설'],
        certifications: ['건설업 면허', 'ISO 9001'],
        projects: [],
        reputation: {
          overallScore: 85,
          qualityScore: 88,
          timelinessScore: 82,
          customerServiceScore: 80,
          defectResolutionScore: 90,
          reviews: [],
          mediaReports: []
        },
        financialHealth: {
          revenue: [50000000000, 55000000000, 60000000000],
          profit: [2000000000, 2500000000, 3000000000],
          debt: 15000000000,
          creditRating: 'A',
          riskLevel: 'low',
          lastUpdated: new Date()
        },
        defectHistory: []
      }
    ];
  }

  // 세제 정책 초기화
  private initializeTaxPolicies(): void {
    this.taxPolicies = [
      {
        id: 'property_tax_2024',
        name: '2024년 재산세',
        type: 'property_tax',
        effectiveDate: new Date('2024-01-01'),
        region: '전국',
        targetProperty: ['주택', '상업용부동산', '토지'],
        taxRates: [
          { minValue: 0, maxValue: 60000000, rate: 0.001, description: '6천만원 이하' },
          { minValue: 60000000, maxValue: 150000000, rate: 0.0015, description: '6천만원 초과 1억5천만원 이하' },
          { minValue: 150000000, maxValue: 300000000, rate: 0.0025, description: '1억5천만원 초과 3억원 이하' },
          { minValue: 300000000, maxValue: Infinity, rate: 0.004, description: '3억원 초과' }
        ],
        deductions: [
          { name: '1세대 1주택 공제', amount: 50000000, conditions: ['1세대 1주택', '2년 이상 거주'] }
        ],
        exemptions: [
          { name: '생활보호대상자 면제', conditions: ['생활보호대상자'], exemptionRate: 1.0 }
        ],
        changes: []
      },
      {
        id: 'comprehensive_tax_2024',
        name: '2024년 종합부동산세',
        type: 'comprehensive_tax',
        effectiveDate: new Date('2024-01-01'),
        region: '전국',
        targetProperty: ['주택', '토지'],
        taxRates: [
          { minValue: 0, maxValue: 900000000, rate: 0.005, description: '9억원 이하' },
          { minValue: 900000000, maxValue: 2500000000, rate: 0.007, description: '9억원 초과 25억원 이하' },
          { minValue: 2500000000, maxValue: 5000000000, rate: 0.01, description: '25억원 초과 50억원 이하' },
          { minValue: 5000000000, maxValue: Infinity, rate: 0.02, description: '50억원 초과' }
        ],
        deductions: [
          { name: '1세대 1주택 공제', amount: 900000000, conditions: ['1세대 1주택', '2년 이상 거주'] }
        ],
        exemptions: [],
        changes: []
      },
      {
        id: 'acquisition_tax_2024',
        name: '2024년 취득세',
        type: 'acquisition_tax',
        effectiveDate: new Date('2024-01-01'),
        region: '전국',
        targetProperty: ['주택', '상업용부동산', '토지'],
        taxRates: [
          { minValue: 0, maxValue: Infinity, rate: 0.01, description: '주택 (1%, 조정대상지역 3%)' }
        ],
        deductions: [
          { name: '농어촌특별세', amount: 0, conditions: [], maxLimit: 0 }
        ],
        exemptions: [
          { name: '생애최초 주택구입 감면', conditions: ['생애최초', '6억원 이하'], exemptionRate: 0.5 }
        ],
        changes: []
      },
      {
        id: 'capital_gains_tax_2024',
        name: '2024년 양도소득세',
        type: 'capital_gains_tax',
        effectiveDate: new Date('2024-01-01'),
        region: '전국',
        targetProperty: ['주택', '토지'],
        taxRates: [
          { minValue: 0, maxValue: 14000000, rate: 0.06, description: '1,400만원 이하' },
          { minValue: 14000000, maxValue: 50000000, rate: 0.15, description: '1,400만원 초과 5,000만원 이하' },
          { minValue: 50000000, maxValue: 88000000, rate: 0.24, description: '5,000만원 초과 8,800만원 이하' },
          { minValue: 88000000, maxValue: 150000000, rate: 0.35, description: '8,800만원 초과 1억5,000만원 이하' },
          { minValue: 150000000, maxValue: 300000000, rate: 0.38, description: '1억5,000만원 초과 3억원 이하' },
          { minValue: 300000000, maxValue: 500000000, rate: 0.40, description: '3억원 초과 5억원 이하' },
          { minValue: 500000000, maxValue: 1000000000, rate: 0.42, description: '5억원 초과 10억원 이하' },
          { minValue: 1000000000, maxValue: Infinity, rate: 0.45, description: '10억원 초과' }
        ],
        deductions: [
          { name: '장기보유특별공제', amount: 0, conditions: ['3년 이상 보유'] },
          { name: '1세대 1주택 비과세', amount: 0, conditions: ['1세대 1주택', '2년 이상 거주'] }
        ],
        exemptions: [],
        changes: []
      }
    ];

    // 샘플 세금 정보 초기화
    this.taxInformation = [
      {
        id: 'tax_sample_001',
        propertyId: 'property_001',
        propertyAddress: '서울특별시 강남구 역삼동 123-45',
        propertyType: 'apartment',
        assessedValue: 800000000, // 공시가격 8억
        marketValue: 1200000000, // 시세 12억
        ownershipInfo: {
          ownerName: '김소유',
          ownershipRatio: 1.0,
          acquisitionDate: new Date('2020-03-15'),
          acquisitionPrice: 900000000,
          acquisitionMethod: 'purchase',
          isMainResidence: true,
          ownershipPeriod: 4
        },
        taxes: {
          propertyTax: {
            taxType: '재산세',
            taxableValue: 800000000,
            taxRate: 0.0025,
            taxAmount: 2000000,
            deductions: [
              { type: '1세대 1주택 공제', description: '50,000,000원 공제', amount: 50000000, eligibilityConditions: ['1세대 1주택', '2년 이상 거주'] }
            ],
            finalTaxAmount: 1875000,
            dueDate: new Date('2024-07-31'),
            isPaid: false
          },
          comprehensiveRealEstateTax: {
            taxType: '종합부동산세',
            taxableValue: 0, // 9억 이하로 비과세
            taxRate: 0,
            taxAmount: 0,
            deductions: [],
            finalTaxAmount: 0,
            dueDate: new Date('2024-12-15'),
            isPaid: true
          },
          acquisitionTax: {
            taxType: '취득세',
            taxableValue: 900000000,
            taxRate: 0.01,
            taxAmount: 9000000,
            deductions: [],
            finalTaxAmount: 9000000,
            dueDate: new Date('2020-04-15'),
            isPaid: true,
            paymentDate: new Date('2020-04-10')
          },
          capitalGainsTax: {
            taxType: '양도소득세',
            taxableValue: 0, // 아직 양도하지 않음
            taxRate: 0,
            taxAmount: 0,
            deductions: [],
            finalTaxAmount: 0,
            dueDate: new Date('2024-12-31'),
            isPaid: true
          },
          localEducationTax: {
            taxType: '지방교육세',
            taxableValue: 800000000,
            taxRate: 0.0005,
            taxAmount: 400000,
            deductions: [],
            finalTaxAmount: 375000,
            dueDate: new Date('2024-07-31'),
            isPaid: false
          },
          ruralDevelopmentTax: {
            taxType: '농어촌특별세',
            taxableValue: 900000000,
            taxRate: 0.002,
            taxAmount: 180000,
            deductions: [],
            finalTaxAmount: 180000,
            dueDate: new Date('2020-04-15'),
            isPaid: true,
            paymentDate: new Date('2020-04-10')
          }
        },
        taxHistory: [
          {
            id: 'tax_history_001',
            year: 2023,
            taxType: '재산세',
            taxAmount: 1800000,
            paymentDate: new Date('2023-07-30')
          },
          {
            id: 'tax_history_002',
            year: 2023,
            taxType: '지방교육세',
            taxAmount: 360000,
            paymentDate: new Date('2023-07-30')
          }
        ],
        lastUpdated: new Date()
      }
    ];
  }

  // 저장된 데이터 로드
  private loadStoredData(): void {
    try {
      const storedLaws = localStorage.getItem('real_estate_laws');
      const storedProjects = localStorage.getItem('reconstruction_projects');
      const storedCompanies = localStorage.getItem('construction_companies');
      const storedPolicies = localStorage.getItem('policy_updates');

      if (storedLaws) {
        this.laws = JSON.parse(storedLaws).map((law: any) => ({
          ...law,
          lastUpdated: new Date(law.lastUpdated)
        }));
      }

      if (storedProjects) {
        this.projects = JSON.parse(storedProjects).map((project: any) => ({
          ...project,
          timeline: {
            ...project.timeline,
            planningStart: new Date(project.timeline.planningStart),
            approvalSubmission: project.timeline.approvalSubmission ? new Date(project.timeline.approvalSubmission) : undefined,
            approvalReceived: project.timeline.approvalReceived ? new Date(project.timeline.approvalReceived) : undefined,
            constructionStart: project.timeline.constructionStart ? new Date(project.timeline.constructionStart) : undefined,
            expectedCompletion: project.timeline.expectedCompletion ? new Date(project.timeline.expectedCompletion) : undefined,
            actualCompletion: project.timeline.actualCompletion ? new Date(project.timeline.actualCompletion) : undefined
          }
        }));
      }

      if (storedCompanies) {
        this.companies = JSON.parse(storedCompanies).map((company: any) => ({
          ...company,
          established: new Date(company.established)
        }));
      }

      if (storedPolicies) {
        this.policies = JSON.parse(storedPolicies).map((policy: any) => ({
          ...policy,
          effectiveDate: new Date(policy.effectiveDate)
        }));
      }
    } catch (error) {
      console.error('부동산 지식 데이터 로드 실패:', error);
    }
  }

  // 데이터 저장
  private saveData(): void {
    try {
      localStorage.setItem('real_estate_laws', JSON.stringify(this.laws));
      localStorage.setItem('reconstruction_projects', JSON.stringify(this.projects));
      localStorage.setItem('construction_companies', JSON.stringify(this.companies));
      localStorage.setItem('policy_updates', JSON.stringify(this.policies));
    } catch (error) {
      console.error('부동산 지식 데이터 저장 실패:', error);
    }
  }

  // 외부 지식 업데이트
  public async updateKnowledgeFromExternalSources(): Promise<void> {
    try {
      // 도시정비법 최신 정보 검색
      await this.updateLegalInformation();
      
      // 부동산 정책 업데이트
      await this.updatePolicyInformation();
      
      // 시공사 정보 업데이트
      await this.updateConstructionCompanyInfo();
      
      // 시장 데이터 업데이트
      await this.updateMarketData();

      this.saveData();
    } catch (error) {
      console.error('외부 지식 업데이트 실패:', error);
    }
  }

  // 법령 정보 업데이트
  private async updateLegalInformation(): Promise<void> {
    const searchQueries = [
      '도시정비법 최신 개정',
      '재건축 관련 법령 변경',
      '재개발 절차 법률',
      '주택법 개정사항',
      '건축법 재건축 관련'
    ];

    for (const query of searchQueries) {
      try {
        const results = await webSearchService.searchWeb(query);
        // 검색 결과를 법령 데이터로 파싱하고 업데이트
        await this.parseLegalSearchResults(results);
      } catch (error) {
        console.error(`법령 검색 실패: ${query}`, error);
      }
    }
  }

  // 정책 정보 업데이트
  private async updatePolicyInformation(): Promise<void> {
    const policyQueries = [
      '부동산 정책 최신',
      '재건축 세제 혜택',
      '주택 공급 정책',
      '전세 대출 정책',
      '부동산 규제 완화'
    ];

    for (const query of policyQueries) {
      try {
        const results = await webSearchService.searchWeb(query);
        await this.parsePolicySearchResults(results);
      } catch (error) {
        console.error(`정책 검색 실패: ${query}`, error);
      }
    }
  }

  // 시공사 정보 업데이트
  private async updateConstructionCompanyInfo(): Promise<void> {
    for (const company of this.companies) {
      try {
        const searchQuery = `${company.name} 시공사 하자 이슈 평가`;
        const results = await webSearchService.searchWeb(searchQuery);
        await this.parseCompanySearchResults(company.id, results);
      } catch (error) {
        console.error(`시공사 정보 업데이트 실패: ${company.name}`, error);
      }
    }
  }

  // 시장 데이터 업데이트
  private async updateMarketData(): Promise<void> {
    const regions = ['강남구', '서초구', '송파구', '마포구', '용산구'];
    
    for (const region of regions) {
      try {
        const queries = [
          `${region} 아파트 매매 시세`,
          `${region} 전세 시세`,
          `${region} 재건축 아파트 가격`,
          `${region} 부동산 전망`
        ];

        for (const query of queries) {
          const results = await webSearchService.searchWeb(query);
          await this.parseMarketSearchResults(region, results);
        }
      } catch (error) {
        console.error(`시장 데이터 업데이트 실패: ${region}`, error);
      }
    }
  }

  // 검색 결과 파싱 메서드들
  private async parseLegalSearchResults(results: any[]): Promise<void> {
    // 법령 검색 결과를 파싱하여 laws 배열에 추가
    for (const result of results) {
      if (result.title.includes('법') || result.title.includes('시행령')) {
        // 새로운 법령 정보 생성 및 추가 로직
      }
    }
  }

  private async parsePolicySearchResults(results: any[]): Promise<void> {
    // 정책 검색 결과를 파싱하여 policies 배열에 추가
    for (const result of results) {
      if (result.title.includes('정책') || result.title.includes('발표')) {
        // 새로운 정책 정보 생성 및 추가 로직
      }
    }
  }

  private async parseCompanySearchResults(companyId: string, results: any[]): Promise<void> {
    // 시공사 검색 결과를 파싱하여 회사 정보 업데이트
    const company = this.companies.find(c => c.id === companyId);
    if (company) {
      // 하자, 이슈 정보 업데이트 로직
    }
  }

  private async parseMarketSearchResults(region: string, results: any[]): Promise<void> {
    // 시장 데이터 검색 결과를 파싱하여 marketData에 추가
    // 가격 정보, 트렌드 분석 등
  }

  // 프로젝트 추가
  public addProject(project: Omit<ReconstructionProject, 'id'>): string {
    const newProject: ReconstructionProject = {
      id: `project_${Date.now()}`,
      ...project
    };
    
    this.projects.push(newProject);
    this.saveData();
    return newProject.id;
  }

  // 커뮤니티 피드백 분석
  public async analyzeCommunityFeedback(projectId: string, feedback: CommunityFeedback): Promise<CommunityResponse> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    // 피드백 내용 분석
    const sentiment = this.analyzeSentiment(feedback.content);
    const topics = this.extractTopics(feedback.content);
    const personalizedResponse = await this.generatePersonalizedResponse(feedback, project);

    const response: CommunityResponse = {
      id: `response_${Date.now()}`,
      type: 'ai_generated',
      content: personalizedResponse.content,
      tone: personalizedResponse.tone,
      personalizedFor: feedback.author,
      effectiveness: 0.85, // 초기 예상 효과
      timestamp: new Date()
    };

    // 프로젝트에 피드백과 응답 추가
    project.communityFeedback.push({
      ...feedback,
      sentiment,
      topics,
      responses: [response]
    });

    this.saveData();
    return response;
  }

  // 감정 분석
  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positiveWords = ['좋다', '만족', '기대', '훌륭', '완벽', '최고'];
    const negativeWords = ['불만', '문제', '걱정', '실망', '최악', '화나'];
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    return 'neutral';
  }

  // 주제 추출
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      '공사': ['공사', '시공', '건설', '작업'],
      '소음': ['소음', '시끄러', '騷音', '방음'],
      '일정': ['일정', '기간', '완공', '지연'],
      '품질': ['품질', '하자', '마감', '시공품질'],
      '비용': ['비용', '가격', '분담금', '추가비용'],
      '설계': ['설계', '평면도', '구조', '디자인']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // 개인화된 응답 생성
  private async generatePersonalizedResponse(feedback: CommunityFeedback, project: ReconstructionProject): Promise<{content: string, tone: 'professional' | 'friendly' | 'empathetic' | 'informative'}> {
    // 피드백 작성자의 성향 분석
    const resident = project.residents.find(r => r.id === feedback.author);
    
    let tone: 'professional' | 'friendly' | 'empathetic' | 'informative' = 'professional';
    let responseContent = '';

    if (resident) {
      // 거주민 성향에 따른 톤 결정
      switch (resident.communicationStyle) {
        case 'formal':
          tone = 'professional';
          break;
        case 'casual':
          tone = 'friendly';
          break;
        case 'emotional':
          tone = 'empathetic';
          break;
        case 'technical':
          tone = 'informative';
          break;
      }
    }

    // 피드백 감정에 따른 응답 생성
    switch (feedback.sentiment) {
      case 'positive':
        responseContent = this.generatePositiveResponse(feedback, tone);
        break;
      case 'negative':
        responseContent = this.generateNegativeResponse(feedback, tone, project);
        break;
      case 'neutral':
        responseContent = this.generateNeutralResponse(feedback, tone);
        break;
      case 'mixed':
        responseContent = this.generateMixedResponse(feedback, tone);
        break;
    }

    return { content: responseContent, tone };
  }

  // 긍정적 피드백 응답
  private generatePositiveResponse(feedback: CommunityFeedback, tone: string): string {
    const responses = {
      professional: '소중한 의견 감사드립니다. 앞으로도 더 나은 서비스를 제공하도록 노력하겠습니다.',
      friendly: '좋은 말씀 감사해요! 계속해서 만족스러운 결과를 위해 최선을 다하겠습니다.',
      empathetic: '이렇게 긍정적으로 봐주셔서 정말 감사합니다. 여러분의 기대에 부응하도록 더욱 노력하겠습니다.',
      informative: '긍정적인 피드백을 주셔서 감사합니다. 현재 진행 상황과 향후 계획을 지속적으로 공유드리겠습니다.'
    };

    return responses[tone as keyof typeof responses] || responses.professional;
  }

  // 부정적 피드백 응답
  private generateNegativeResponse(feedback: CommunityFeedback, tone: string, project: ReconstructionProject): string {
    const responses = {
      professional: '불편을 끼쳐드려 죄송합니다. 해당 사안을 면밀히 검토하여 개선 방안을 마련하겠습니다.',
      friendly: '걱정해주시는 마음 충분히 이해합니다. 빠른 시일 내에 해결책을 찾아보겠습니다.',
      empathetic: '이런 상황으로 인해 불편하셨을 마음을 충분히 공감합니다. 즉시 개선 조치를 취하도록 하겠습니다.',
      informative: '지적해주신 문제점에 대해 구체적인 해결 방안과 일정을 검토하여 상세히 안내드리겠습니다.'
    };

    return responses[tone as keyof typeof responses] || responses.professional;
  }

  // 중립적 피드백 응답
  private generateNeutralResponse(feedback: CommunityFeedback, tone: string): string {
    const responses = {
      professional: '의견 주셔서 감사합니다. 관련 사항을 검토하여 답변드리겠습니다.',
      friendly: '관심 가져주셔서 감사해요. 더 자세한 정보가 필요하시면 언제든 말씀해주세요.',
      empathetic: '궁금해하시는 부분을 이해합니다. 명확한 답변을 드릴 수 있도록 확인해보겠습니다.',
      informative: '문의사항에 대해 정확한 정보를 확인하여 상세히 안내드리겠습니다.'
    };

    return responses[tone as keyof typeof responses] || responses.professional;
  }

  // 복합적 피드백 응답
  private generateMixedResponse(feedback: CommunityFeedback, tone: string): string {
    const responses = {
      professional: '다양한 관점에서 의견을 주셔서 감사합니다. 긍정적인 부분은 더욱 발전시키고, 우려사항은 개선하도록 하겠습니다.',
      friendly: '솔직한 의견 정말 고마워요. 좋은 점은 계속 유지하고, 아쉬운 부분은 개선해나가겠습니다.',
      empathetic: '복합적인 감정을 표현해주셔서 감사합니다. 모든 의견을 소중히 받아들여 더 나은 방향으로 나아가겠습니다.',
      informative: '다각도의 피드백을 주셔서 감사합니다. 각 사안별로 구체적인 대응 방안을 마련하여 안내드리겠습니다.'
    };

    return responses[tone as keyof typeof responses] || responses.professional;
  }

  // 시공사 평가 및 선정 지원
  public evaluateConstructionCompany(companyId: string): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
    riskFactors: string[];
  } {
    const company = this.companies.find(c => c.id === companyId);
    if (!company) {
      throw new Error('시공사를 찾을 수 없습니다.');
    }

    const evaluation = {
      score: company.reputation.overallScore,
      strengths: this.identifyCompanyStrengths(company),
      weaknesses: this.identifyCompanyWeaknesses(company),
      recommendation: this.generateCompanyRecommendation(company),
      riskFactors: this.assessCompanyRisks(company)
    };

    return evaluation;
  }

  private identifyCompanyStrengths(company: ConstructionCompanyProfile): string[] {
    const strengths = [];
    
    if (company.reputation.qualityScore > 85) {
      strengths.push('우수한 시공 품질');
    }
    if (company.reputation.timelinessScore > 85) {
      strengths.push('일정 준수율 높음');
    }
    if (company.reputation.defectResolutionScore > 85) {
      strengths.push('하자 처리 능력 우수');
    }
    if (company.financialHealth.riskLevel === 'low') {
      strengths.push('안정적인 재무 구조');
    }
    if (company.projects.length > 10) {
      strengths.push('풍부한 시공 경험');
    }

    return strengths;
  }

  private identifyCompanyWeaknesses(company: ConstructionCompanyProfile): string[] {
    const weaknesses = [];
    
    if (company.reputation.qualityScore < 70) {
      weaknesses.push('시공 품질 우려');
    }
    if (company.reputation.timelinessScore < 70) {
      weaknesses.push('일정 지연 위험');
    }
    if (company.reputation.customerServiceScore < 70) {
      weaknesses.push('고객 서비스 미흡');
    }
    if (company.financialHealth.riskLevel === 'high') {
      weaknesses.push('재무 안정성 우려');
    }
    if (company.defectHistory.length > 5) {
      weaknesses.push('하자 발생 이력 다수');
    }

    return weaknesses;
  }

  private generateCompanyRecommendation(company: ConstructionCompanyProfile): string {
    if (company.reputation.overallScore >= 85) {
      return '적극 추천: 전반적으로 우수한 시공사로 안전한 선택입니다.';
    } else if (company.reputation.overallScore >= 70) {
      return '조건부 추천: 일부 보완이 필요하지만 고려할 만한 시공사입니다.';
    } else {
      return '신중 검토 필요: 여러 위험 요소가 있어 신중한 검토가 필요합니다.';
    }
  }

  private assessCompanyRisks(company: ConstructionCompanyProfile): string[] {
    const risks = [];
    
    if (company.financialHealth.debt > company.financialHealth.revenue[company.financialHealth.revenue.length - 1] * 0.5) {
      risks.push('높은 부채비율');
    }
    if (company.defectHistory.filter(d => d.severity === 'critical').length > 0) {
      risks.push('심각한 하자 이력');
    }
    if (company.reputation.mediaReports.filter(r => r.sentiment === 'negative').length > 3) {
      risks.push('부정적 언론 보도');
    }

    return risks;
  }

  // 세금 계산 메서드
  public calculatePropertyTax(propertyValue: number, isMainResidence: boolean = false): TaxCalculation {
    const policy = this.taxPolicies.find(p => p.type === 'property_tax');
    if (!policy) throw new Error('재산세 정책을 찾을 수 없습니다.');

    let taxableValue = propertyValue;
    let deductions: TaxDeduction[] = [];

    // 1세대 1주택 공제 적용
    if (isMainResidence) {
      const deduction = policy.deductions.find(d => d.name === '1세대 1주택 공제');
      if (deduction) {
        taxableValue = Math.max(0, taxableValue - deduction.amount);
        deductions.push({
          type: deduction.name,
          description: `${deduction.amount.toLocaleString()}원 공제`,
          amount: deduction.amount,
          eligibilityConditions: deduction.conditions
        });
      }
    }

    // 세율 적용
    const applicableRate = policy.taxRates.find(rate => 
      taxableValue >= rate.minValue && taxableValue < rate.maxValue
    );
    
    const taxRate = applicableRate?.rate || 0.004;
    const taxAmount = taxableValue * taxRate;

    return {
      taxType: '재산세',
      taxableValue,
      taxRate,
      taxAmount,
      deductions,
      finalTaxAmount: taxAmount,
      dueDate: new Date(new Date().getFullYear(), 6, 31), // 7월 31일
      isPaid: false
    };
  }

  public calculateComprehensiveRealEstateTax(propertyValue: number, isMainResidence: boolean = false): TaxCalculation {
    const policy = this.taxPolicies.find(p => p.type === 'comprehensive_tax');
    if (!policy) throw new Error('종합부동산세 정책을 찾을 수 없습니다.');

    let taxableValue = propertyValue;
    let deductions: TaxDeduction[] = [];

    // 1세대 1주택 공제 적용
    if (isMainResidence) {
      const deduction = policy.deductions.find(d => d.name === '1세대 1주택 공제');
      if (deduction) {
        taxableValue = Math.max(0, taxableValue - deduction.amount);
        deductions.push({
          type: deduction.name,
          description: `${deduction.amount.toLocaleString()}원 공제`,
          amount: deduction.amount,
          eligibilityConditions: deduction.conditions
        });
      }
    }

    // 과세표준이 0 이하면 비과세
    if (taxableValue <= 0) {
      return {
        taxType: '종합부동산세',
        taxableValue: 0,
        taxRate: 0,
        taxAmount: 0,
        deductions,
        finalTaxAmount: 0,
        dueDate: new Date(new Date().getFullYear(), 11, 15), // 12월 15일
        isPaid: true
      };
    }

    // 세율 적용
    const applicableRate = policy.taxRates.find(rate => 
      taxableValue >= rate.minValue && taxableValue < rate.maxValue
    );
    
    const taxRate = applicableRate?.rate || 0.02;
    const taxAmount = taxableValue * taxRate;

    return {
      taxType: '종합부동산세',
      taxableValue,
      taxRate,
      taxAmount,
      deductions,
      finalTaxAmount: taxAmount,
      dueDate: new Date(new Date().getFullYear(), 11, 15), // 12월 15일
      isPaid: false
    };
  }

  public calculateAcquisitionTax(propertyValue: number, isFirstHome: boolean = false, isAdjustmentArea: boolean = false): TaxCalculation {
    const policy = this.taxPolicies.find(p => p.type === 'acquisition_tax');
    if (!policy) throw new Error('취득세 정책을 찾을 수 없습니다.');

    let taxRate = 0.01; // 기본 1%
    if (isAdjustmentArea) {
      taxRate = 0.03; // 조정대상지역 3%
    }

    let taxAmount = propertyValue * taxRate;
    let deductions: TaxDeduction[] = [];

    // 생애최초 주택구입 감면
    if (isFirstHome && propertyValue <= 600000000) {
      const exemption = policy.exemptions.find(e => e.name === '생애최초 주택구입 감면');
      if (exemption) {
        taxAmount = taxAmount * (1 - exemption.exemptionRate);
        deductions.push({
          type: exemption.name,
          description: `${exemption.exemptionRate * 100}% 감면`,
          amount: propertyValue * taxRate * exemption.exemptionRate,
          eligibilityConditions: exemption.conditions
        });
      }
    }

    // 농어촌특별세 (취득세의 20%)
    const ruralTax = taxAmount * 0.2;

    return {
      taxType: '취득세',
      taxableValue: propertyValue,
      taxRate,
      taxAmount: taxAmount + ruralTax,
      deductions,
      finalTaxAmount: taxAmount + ruralTax,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      isPaid: false
    };
  }

  public calculateCapitalGainsTax(
    acquisitionPrice: number, 
    disposalPrice: number, 
    ownershipPeriod: number, 
    isMainResidence: boolean = false
  ): TaxCalculation {
    const policy = this.taxPolicies.find(p => p.type === 'capital_gains_tax');
    if (!policy) throw new Error('양도소득세 정책을 찾을 수 없습니다.');

    // 1세대 1주택 비과세 조건 확인
    if (isMainResidence && ownershipPeriod >= 2) {
      return {
        taxType: '양도소득세',
        taxableValue: 0,
        taxRate: 0,
        taxAmount: 0,
        deductions: [{
          type: '1세대 1주택 비과세',
          description: '2년 이상 거주한 1세대 1주택 비과세',
          amount: disposalPrice - acquisitionPrice,
          eligibilityConditions: ['1세대 1주택', '2년 이상 거주']
        }],
        finalTaxAmount: 0,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
        isPaid: true
      };
    }

    // 양도차익 계산
    let capitalGain = disposalPrice - acquisitionPrice;
    let deductions: TaxDeduction[] = [];

    // 장기보유특별공제 (3년 이상 보유시)
    if (ownershipPeriod >= 3) {
      const deductionRate = Math.min(0.3, (ownershipPeriod - 3) * 0.02 + 0.1); // 최대 30%
      const deductionAmount = capitalGain * deductionRate;
      capitalGain -= deductionAmount;
      
      deductions.push({
        type: '장기보유특별공제',
        description: `${Math.round(deductionRate * 100)}% 공제`,
        amount: deductionAmount,
        eligibilityConditions: ['3년 이상 보유']
      });
    }

    // 세율 적용
    const applicableRate = policy.taxRates.find(rate => 
      capitalGain >= rate.minValue && capitalGain < rate.maxValue
    );
    
    const taxRate = applicableRate?.rate || 0.45;
    const taxAmount = capitalGain * taxRate;

    return {
      taxType: '양도소득세',
      taxableValue: capitalGain,
      taxRate,
      taxAmount,
      deductions,
      finalTaxAmount: taxAmount,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
      isPaid: false
    };
  }

  // 세금 최적화 분석
  public analyzeTaxOptimization(propertyId: string): TaxOptimization {
    const taxInfo = this.taxInformation.find(t => t.propertyId === propertyId);
    if (!taxInfo) {
      throw new Error('해당 부동산의 세금 정보를 찾을 수 없습니다.');
    }

    const currentTaxBurden = this.calculateCurrentTaxBurden(taxInfo);
    const strategies = this.generateTaxStrategies(taxInfo);
    const optimizedTaxBurden = this.calculateOptimizedTaxBurden(taxInfo, strategies);
    const savings = currentTaxBurden - optimizedTaxBurden;

    const optimization: TaxOptimization = {
      id: `opt_${Date.now()}`,
      propertyId,
      optimizationType: 'holding',
      currentTaxBurden,
      optimizedTaxBurden,
      savings,
      strategies,
      risks: this.assessTaxOptimizationRisks(strategies),
      timeline: '1-3개월',
      confidence: 0.85
    };

    this.taxOptimizations.push(optimization);
    this.saveData();
    return optimization;
  }

  private calculateCurrentTaxBurden(taxInfo: TaxInformation): number {
    return taxInfo.taxes.propertyTax.finalTaxAmount +
           taxInfo.taxes.comprehensiveRealEstateTax.finalTaxAmount +
           taxInfo.taxes.localEducationTax.finalTaxAmount;
  }

  private generateTaxStrategies(taxInfo: TaxInformation): TaxStrategy[] {
    const strategies: TaxStrategy[] = [];

    // 1세대 1주택 전환 전략
    if (!taxInfo.ownershipInfo.isMainResidence) {
      strategies.push({
        id: 'main_residence_conversion',
        name: '1세대 1주택 전환',
        description: '주소지를 해당 부동산으로 이전하여 1세대 1주택 혜택 적용',
        expectedSavings: taxInfo.taxes.propertyTax.finalTaxAmount * 0.3,
        implementationCost: 100000,
        netBenefit: taxInfo.taxes.propertyTax.finalTaxAmount * 0.3 - 100000,
        requirements: ['주소지 이전', '2년 이상 거주 의무'],
        timeframe: '즉시 적용 가능',
        riskLevel: 'low'
      });
    }

    // 장기보유 전략
    if (taxInfo.ownershipInfo.ownershipPeriod < 10) {
      strategies.push({
        id: 'long_term_holding',
        name: '장기보유 전략',
        description: '10년 이상 보유하여 양도소득세 장기보유특별공제 최대화',
        expectedSavings: 50000000, // 예상 절세액
        implementationCost: 0,
        netBenefit: 50000000,
        requirements: ['10년 이상 보유'],
        timeframe: `${10 - taxInfo.ownershipInfo.ownershipPeriod}년 후`,
        riskLevel: 'medium'
      });
    }

    return strategies;
  }

  private calculateOptimizedTaxBurden(taxInfo: TaxInformation, strategies: TaxStrategy[]): number {
    let optimizedBurden = this.calculateCurrentTaxBurden(taxInfo);
    
    strategies.forEach(strategy => {
      optimizedBurden -= strategy.expectedSavings;
      optimizedBurden += strategy.implementationCost;
    });

    return Math.max(0, optimizedBurden);
  }

  private assessTaxOptimizationRisks(strategies: TaxStrategy[]): string[] {
    const risks: string[] = [];
    
    strategies.forEach(strategy => {
      if (strategy.riskLevel === 'high') {
        risks.push(`${strategy.name}: 높은 위험도`);
      } else if (strategy.riskLevel === 'medium') {
        risks.push(`${strategy.name}: 중간 위험도`);
      }
    });

    if (risks.length === 0) {
      risks.push('낮은 위험도의 안전한 절세 전략');
    }

    return risks;
  }

  // 공시가격 업데이트
  public updateAssessedValue(propertyId: string, newAssessedValue: number): void {
    const taxInfo = this.taxInformation.find(t => t.propertyId === propertyId);
    if (taxInfo) {
      taxInfo.assessedValue = newAssessedValue;
      taxInfo.lastUpdated = new Date();
      
      // 세금 재계산
      taxInfo.taxes.propertyTax = this.calculatePropertyTax(newAssessedValue, taxInfo.ownershipInfo.isMainResidence);
      taxInfo.taxes.comprehensiveRealEstateTax = this.calculateComprehensiveRealEstateTax(newAssessedValue, taxInfo.ownershipInfo.isMainResidence);
      
      this.saveData();
    }
  }

  // 세금 납부 처리
  public payTax(propertyId: string, taxType: string): void {
    const taxInfo = this.taxInformation.find(t => t.propertyId === propertyId);
    if (taxInfo) {
      const taxCalculation = this.getTaxCalculationByType(taxInfo, taxType);
      if (taxCalculation) {
        taxCalculation.isPaid = true;
        taxCalculation.paymentDate = new Date();
        
        // 납부 기록 추가
        taxInfo.taxHistory.push({
          id: `history_${Date.now()}`,
          year: new Date().getFullYear(),
          taxType,
          taxAmount: taxCalculation.finalTaxAmount,
          paymentDate: new Date()
        });
        
        this.saveData();
      }
    }
  }

  private getTaxCalculationByType(taxInfo: TaxInformation, taxType: string): TaxCalculation | null {
    switch (taxType) {
      case '재산세': return taxInfo.taxes.propertyTax;
      case '종합부동산세': return taxInfo.taxes.comprehensiveRealEstateTax;
      case '취득세': return taxInfo.taxes.acquisitionTax;
      case '양도소득세': return taxInfo.taxes.capitalGainsTax;
      case '지방교육세': return taxInfo.taxes.localEducationTax;
      case '농어촌특별세': return taxInfo.taxes.ruralDevelopmentTax;
      default: return null;
    }
  }

  // Getters
  public getLaws(): RealEstateLaw[] {
    return [...this.laws];
  }

  public getProjects(): ReconstructionProject[] {
    return [...this.projects];
  }

  public getCompanies(): ConstructionCompanyProfile[] {
    return [...this.companies];
  }

  public getPolicies(): PolicyUpdate[] {
    return [...this.policies];
  }

  public getTaxInformation(): TaxInformation[] {
    return [...this.taxInformation];
  }

  public getTaxPolicies(): TaxPolicy[] {
    return [...this.taxPolicies];
  }

  public getTaxOptimizations(): TaxOptimization[] {
    return [...this.taxOptimizations];
  }

  public getMarketAnalysis(region: string): MarketAnalysis | undefined {
    return this.marketData.get(region);
  }

  public getProjectById(id: string): ReconstructionProject | undefined {
    return this.projects.find(p => p.id === id);
  }

  public getCompanyById(id: string): ConstructionCompanyProfile | undefined {
    return this.companies.find(c => c.id === id);
  }

  public getTaxInformationById(propertyId: string): TaxInformation | undefined {
    return this.taxInformation.find(t => t.propertyId === propertyId);
  }
}

export const realEstateKnowledgeService = new RealEstateKnowledgeService();
