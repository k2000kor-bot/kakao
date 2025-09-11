import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// AI 리소스 할당 최적화 인터페이스 정의
export interface ResourceAllocation {
  allocationId: string;
  name: string;
  description: string;
  type: 'project' | 'department' | 'team' | 'individual' | 'organization';
  status: 'planning' | 'active' | 'optimizing' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resources: Resource[];
  allocations: AllocationPlan[];
  constraints: AllocationConstraint[];
  optimization: AllocationOptimization;
  performance: AllocationPerformance;
  recommendations: AllocationRecommendation[];
  settings: AllocationSettings;
  timestamp: number;
}

export interface Resource {
  resourceId: string;
  name: string;
  type: 'human' | 'financial' | 'equipment' | 'software' | 'facility' | 'time';
  category: 'fixed' | 'variable' | 'shared' | 'dedicated';
  capacity: ResourceCapacity;
  availability: ResourceAvailability;
  cost: ResourceCost;
  skills: ResourceSkill[];
  location: string;
  department: string;
  manager: string;
  utilization: ResourceUtilization;
  performance: ResourcePerformance;
}

export interface ResourceCapacity {
  total: number;
  available: number;
  allocated: number;
  reserved: number;
  unit: string;
  scalable: boolean;
  maxScale: number;
  minThreshold: number;
}

export interface ResourceAvailability {
  schedule: AvailabilitySlot[];
  timeZone: string;
  workingHours: WorkingHours;
  holidays: number[];
  constraints: string[];
  flexibility: number; // 0-1
}

export interface AvailabilitySlot {
  slotId: string;
  startTime: number;
  endTime: number;
  available: boolean;
  reason?: string;
  priority: number;
}

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  available: boolean;
}

export interface ResourceCost {
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  setupCost: number;
  maintenanceCost: number;
  currency: string;
  variableCosts: VariableCost[];
}

export interface VariableCost {
  costId: string;
  name: string;
  type: 'usage' | 'performance' | 'overtime' | 'premium';
  rate: number;
  unit: string;
  threshold?: number;
}

export interface ResourceSkill {
  skillId: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  proficiency: number; // 0-1
  certification: string[];
  experience: number; // years
  lastUsed: number;
  demand: number; // 0-1
}

export interface ResourceUtilization {
  current: number; // 0-1
  average: number;
  peak: number;
  target: number;
  efficiency: number;
  trends: UtilizationTrend[];
}

export interface UtilizationTrend {
  trendId: string;
  period: string;
  utilization: number;
  efficiency: number;
  timestamp: number;
}

export interface ResourcePerformance {
  quality: number; // 0-1
  productivity: number;
  reliability: number;
  satisfaction: number;
  cost_effectiveness: number;
  metrics: PerformanceMetric[];
}

export interface PerformanceMetric {
  metricId: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface AllocationPlan {
  planId: string;
  name: string;
  description: string;
  resourceId: string;
  targetId: string; // project, team, etc.
  targetType: 'project' | 'task' | 'team' | 'department';
  allocation: AllocationDetail;
  timeline: AllocationTimeline;
  constraints: string[];
  priority: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  performance: AllocationPlanPerformance;
}

export interface AllocationDetail {
  percentage: number; // 0-100
  hours: number;
  cost: number;
  startDate: number;
  endDate: number;
  renewable: boolean;
  conditions: string[];
}

export interface AllocationTimeline {
  phases: AllocationPhase[];
  milestones: AllocationMilestone[];
  dependencies: string[];
  criticalPath: string[];
}

export interface AllocationPhase {
  phaseId: string;
  name: string;
  startDate: number;
  endDate: number;
  allocation: number;
  resources: string[];
  deliverables: string[];
}

export interface AllocationMilestone {
  milestoneId: string;
  name: string;
  date: number;
  type: 'start' | 'checkpoint' | 'delivery' | 'completion';
  dependencies: string[];
  criteria: string[];
}

export interface AllocationPlanPerformance {
  adherence: number; // 0-1
  efficiency: number;
  quality: number;
  cost_variance: number;
  schedule_variance: number;
  issues: AllocationIssue[];
}

export interface AllocationIssue {
  issueId: string;
  type: 'overallocation' | 'underutilization' | 'conflict' | 'delay' | 'cost_overrun';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  resolution: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export interface AllocationConstraint {
  constraintId: string;
  name: string;
  type: 'capacity' | 'skill' | 'time' | 'budget' | 'location' | 'policy';
  description: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  flexible: boolean;
  impact: number;
}

export interface AllocationOptimization {
  optimizationId: string;
  type: 'capacity' | 'cost' | 'skill_match' | 'utilization' | 'multi_objective';
  status: 'pending' | 'running' | 'completed' | 'failed';
  algorithm: string;
  objective: OptimizationObjective;
  parameters: OptimizationParameters;
  results: OptimizationResult[];
  recommendations: OptimizationRecommendation[];
  timestamp: number;
}

export interface OptimizationObjective {
  primary: 'minimize_cost' | 'maximize_utilization' | 'optimize_skills' | 'balance_workload';
  secondary: string[];
  weights: Record<string, number>;
  constraints: string[];
}

export interface OptimizationParameters {
  timeHorizon: number; // days
  granularity: 'hour' | 'day' | 'week' | 'month';
  iterations: number;
  tolerance: number;
  considerSkills: boolean;
  considerCosts: boolean;
  considerAvailability: boolean;
  riskTolerance: number;
}

export interface OptimizationResult {
  resultId: string;
  metric: string;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  confidence: number;
  explanation: string;
  tradeoffs: string[];
}

export interface OptimizationRecommendation {
  recommendationId: string;
  type: 'reallocation' | 'capacity_increase' | 'skill_development' | 'process_change';
  title: string;
  description: string;
  rationale: string;
  impact: number;
  effort: number;
  cost: number;
  timeline: number; // days
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  risks: string[];
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface AllocationPerformance {
  overallEfficiency: number;
  resourceUtilization: number;
  costEfficiency: number;
  skillMatch: number;
  timelineAdherence: number;
  qualityScore: number;
  satisfaction: number;
  roi: number; // Return on Investment
  trends: AllocationTrend[];
  benchmarks: AllocationBenchmark[];
}

export interface AllocationTrend {
  trendId: string;
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  change: number;
  period: string;
  confidence: number;
  factors: string[];
}

export interface AllocationBenchmark {
  benchmarkId: string;
  name: string;
  category: string;
  value: number;
  target: number;
  industry_average: number;
  best_practice: number;
  gap_analysis: string;
}

export interface AllocationRecommendation {
  recommendationId: string;
  type: 'optimization' | 'rebalancing' | 'capacity_planning' | 'skill_gap' | 'cost_reduction';
  title: string;
  description: string;
  rationale: string;
  impact: number;
  effort: number;
  cost: number;
  timeline: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  success_criteria: string[];
  risks: string[];
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface AllocationSettings {
  autoOptimization: boolean;
  optimizationFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  rebalancingThreshold: number;
  utilizationTarget: number;
  costOptimization: boolean;
  skillMatching: boolean;
  capacityPlanning: boolean;
  alertThresholds: AlertThresholds;
  approvalWorkflow: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface AlertThresholds {
  overallocation: number;
  underutilization: number;
  costOverrun: number;
  skillGap: number;
  timelineDelay: number;
}

export interface AllocationAnalytics {
  totalResources: number;
  activeAllocations: number;
  averageUtilization: number;
  totalCost: number;
  costPerResource: number;
  efficiencyScore: number;
  optimizationRate: number;
  issueResolutionRate: number;
  satisfactionScore: number;
  roi: number;
}

class AIResourceAllocationOptimizationSystem {
  private allocations: Map<string, ResourceAllocation> = new Map();
  private resources: Map<string, Resource> = new Map();
  private isRunning: boolean = false;
  private analytics: AllocationAnalytics = {
    totalResources: 0,
    activeAllocations: 0,
    averageUtilization: 0,
    totalCost: 0,
    costPerResource: 0,
    efficiencyScore: 0,
    optimizationRate: 0,
    issueResolutionRate: 0,
    satisfactionScore: 0,
    roi: 0
  };

  constructor() {
    console.log('🎯 AI 리소스 할당 최적화 시스템 초기화 중...');
  }

  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ AI 리소스 할당 최적화 시스템이 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    this.initializeSystem();
    this.createInitialResources();
    this.createInitialAllocations();
    this.startOptimizationMonitoring();

    console.log('✅ AI 리소스 할당 최적화 시스템이 시작되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 리소스 할당 최적화 시스템이 시작되었습니다.');
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ AI 리소스 할당 최적화 시스템이 실행 중이 아닙니다.');
      return;
    }

    this.isRunning = false;
    this.cleanupData();

    console.log('🛑 AI 리소스 할당 최적화 시스템이 중지되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 리소스 할당 최적화 시스템이 중지되었습니다.');
  }

  private initializeSystem(): void {
    console.log('🔧 리소스 할당 최적화 시스템 초기화 중...');

    console.log('📊 리소스 분석 엔진 초기화 완료');
    console.log('🎯 할당 최적화 알고리즘 초기화 완료');
    console.log('💰 비용 최적화 엔진 초기화 완료');
    console.log('⏰ 스케줄링 엔진 초기화 완료');
    console.log('🔄 실시간 모니터링 시스템 초기화 완료');
    console.log('📈 성과 분석 시스템 초기화 완료');
  }

  private createInitialResources(): void {
    const resource1: Resource = {
      resourceId: 'resource-1',
      name: '김개발자',
      type: 'human',
      category: 'dedicated',
      capacity: {
        total: 40,
        available: 32,
        allocated: 30,
        reserved: 2,
        unit: 'hours/week',
        scalable: false,
        maxScale: 50,
        minThreshold: 20
      },
      availability: {
        schedule: [
          {
            slotId: 'slot-1',
            startTime: Date.now(),
            endTime: Date.now() + 8 * 60 * 60 * 1000,
            available: true,
            priority: 1
          }
        ],
        timeZone: 'Asia/Seoul',
        workingHours: {
          monday: [{ start: '09:00', end: '18:00', available: true }],
          tuesday: [{ start: '09:00', end: '18:00', available: true }],
          wednesday: [{ start: '09:00', end: '18:00', available: true }],
          thursday: [{ start: '09:00', end: '18:00', available: true }],
          friday: [{ start: '09:00', end: '18:00', available: true }],
          saturday: [{ start: '09:00', end: '13:00', available: false }],
          sunday: [{ start: '09:00', end: '13:00', available: false }]
        },
        holidays: [],
        constraints: ['no_overtime', 'remote_work_ok'],
        flexibility: 0.7
      },
      cost: {
        hourlyRate: 50000,
        dailyRate: 400000,
        monthlyRate: 8000000,
        setupCost: 0,
        maintenanceCost: 0,
        currency: 'KRW',
        variableCosts: [
          {
            costId: 'overtime-1',
            name: '초과근무',
            type: 'overtime',
            rate: 75000,
            unit: 'hour',
            threshold: 40
          }
        ]
      },
      skills: [
        {
          skillId: 'skill-1',
          name: 'React 개발',
          level: 'expert',
          proficiency: 0.95,
          certification: ['React 전문가'],
          experience: 5,
          lastUsed: Date.now(),
          demand: 0.9
        },
        {
          skillId: 'skill-2',
          name: 'TypeScript',
          level: 'advanced',
          proficiency: 0.85,
          certification: [],
          experience: 3,
          lastUsed: Date.now() - 86400000,
          demand: 0.8
        }
      ],
      location: '서울',
      department: '개발팀',
      manager: 'manager-1',
      utilization: {
        current: 0.75,
        average: 0.8,
        peak: 0.95,
        target: 0.85,
        efficiency: 0.9,
        trends: [
          {
            trendId: 'trend-1',
            period: '1주일',
            utilization: 0.78,
            efficiency: 0.88,
            timestamp: Date.now()
          }
        ]
      },
      performance: {
        quality: 0.92,
        productivity: 0.88,
        reliability: 0.95,
        satisfaction: 0.85,
        cost_effectiveness: 0.9,
        metrics: [
          {
            metricId: 'metric-1',
            name: '코드 품질',
            value: 92,
            target: 90,
            unit: 'score',
            trend: 'improving'
          }
        ]
      }
    };

    const resource2: Resource = {
      resourceId: 'resource-2',
      name: '개발 서버',
      type: 'equipment',
      category: 'shared',
      capacity: {
        total: 100,
        available: 70,
        allocated: 60,
        reserved: 10,
        unit: 'CPU %',
        scalable: true,
        maxScale: 200,
        minThreshold: 20
      },
      availability: {
        schedule: [],
        timeZone: 'Asia/Seoul',
        workingHours: {
          monday: [{ start: '00:00', end: '24:00', available: true }],
          tuesday: [{ start: '00:00', end: '24:00', available: true }],
          wednesday: [{ start: '00:00', end: '24:00', available: true }],
          thursday: [{ start: '00:00', end: '24:00', available: true }],
          friday: [{ start: '00:00', end: '24:00', available: true }],
          saturday: [{ start: '00:00', end: '24:00', available: true }],
          sunday: [{ start: '00:00', end: '24:00', available: true }]
        },
        holidays: [],
        constraints: ['maintenance_window'],
        flexibility: 0.9
      },
      cost: {
        hourlyRate: 5000,
        dailyRate: 120000,
        monthlyRate: 3600000,
        setupCost: 50000000,
        maintenanceCost: 500000,
        currency: 'KRW',
        variableCosts: [
          {
            costId: 'scaling-1',
            name: '스케일링 비용',
            type: 'usage',
            rate: 10000,
            unit: 'CPU hour',
            threshold: 80
          }
        ]
      },
      skills: [],
      location: '데이터센터',
      department: 'IT 인프라',
      manager: 'manager-2',
      utilization: {
        current: 0.6,
        average: 0.65,
        peak: 0.85,
        target: 0.75,
        efficiency: 0.95,
        trends: []
      },
      performance: {
        quality: 0.98,
        productivity: 0.95,
        reliability: 0.99,
        satisfaction: 0.9,
        cost_effectiveness: 0.85,
        metrics: []
      }
    };

    this.resources.set(resource1.resourceId, resource1);
    this.resources.set(resource2.resourceId, resource2);
    console.log('📋 초기 리소스 생성 완료');
  }

  private createInitialAllocations(): void {
    const allocation1: ResourceAllocation = {
      allocationId: 'allocation-1',
      name: 'AI 플랫폼 개발 프로젝트 리소스 할당',
      description: 'AI 플랫폼 개발을 위한 최적화된 리소스 할당',
      type: 'project',
      status: 'active',
      priority: 'high',
      resources: Array.from(this.resources.values()),
      allocations: [
        {
          planId: 'plan-1',
          name: '개발자 할당',
          description: '프론트엔드 개발을 위한 개발자 할당',
          resourceId: 'resource-1',
          targetId: 'project-1',
          targetType: 'project',
          allocation: {
            percentage: 75,
            hours: 30,
            cost: 1500000,
            startDate: Date.now(),
            endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            renewable: true,
            conditions: ['주 40시간 이내', '원격근무 가능']
          },
          timeline: {
            phases: [
              {
                phaseId: 'phase-1',
                name: '개발 단계',
                startDate: Date.now(),
                endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
                allocation: 80,
                resources: ['resource-1'],
                deliverables: ['프론트엔드 컴포넌트']
              }
            ],
            milestones: [
              {
                milestoneId: 'milestone-1',
                name: '개발 완료',
                date: Date.now() + 20 * 24 * 60 * 60 * 1000,
                type: 'completion',
                dependencies: [],
                criteria: ['모든 기능 구현', '테스트 통과']
              }
            ],
            dependencies: [],
            criticalPath: ['phase-1']
          },
          constraints: [],
          priority: 1,
          status: 'active',
          performance: {
            adherence: 0.9,
            efficiency: 0.85,
            quality: 0.92,
            cost_variance: -0.05,
            schedule_variance: 0.02,
            issues: []
          }
        }
      ],
      constraints: [
        {
          constraintId: 'constraint-1',
          name: '예산 제한',
          type: 'budget',
          description: '월 예산 1억원 이내',
          parameters: { maxBudget: 100000000, currency: 'KRW' },
          priority: 'critical',
          flexible: false,
          impact: 0.9
        }
      ],
      optimization: {
        optimizationId: 'opt-1',
        type: 'multi_objective',
        status: 'completed',
        algorithm: 'genetic-algorithm',
        objective: {
          primary: 'minimize_cost',
          secondary: ['maximize_utilization', 'optimize_skills'],
          weights: { cost: 0.4, utilization: 0.3, skills: 0.3 },
          constraints: ['budget', 'capacity']
        },
        parameters: {
          timeHorizon: 30,
          granularity: 'day',
          iterations: 100,
          tolerance: 0.01,
          considerSkills: true,
          considerCosts: true,
          considerAvailability: true,
          riskTolerance: 0.1
        },
        results: [
          {
            resultId: 'result-1',
            metric: 'cost-efficiency',
            beforeValue: 0.7,
            afterValue: 0.85,
            improvement: 0.15,
            confidence: 0.9,
            explanation: '리소스 재할당으로 비용 효율성 향상',
            tradeoffs: ['일부 스킬 매칭 감소']
          }
        ],
        recommendations: [
          {
            recommendationId: 'rec-1',
            type: 'reallocation',
            title: '개발자 재할당',
            description: '스킬 매칭을 고려한 개발자 재할당',
            rationale: '현재 할당이 스킬 요구사항과 불일치',
            impact: 0.1,
            effort: 0.3,
            cost: 0,
            timeline: 3,
            priority: 'medium',
            implementation: '프로젝트 간 개발자 재배치',
            expectedOutcome: '스킬 매칭 10% 향상',
            risks: ['일시적 생산성 저하'],
            status: 'proposed'
          }
        ],
        timestamp: Date.now()
      },
      performance: {
        overallEfficiency: 0.85,
        resourceUtilization: 0.78,
        costEfficiency: 0.82,
        skillMatch: 0.88,
        timelineAdherence: 0.92,
        qualityScore: 0.9,
        satisfaction: 0.85,
        roi: 1.25,
        trends: [
          {
            trendId: 'trend-1',
            metric: 'efficiency',
            direction: 'improving',
            change: 0.05,
            period: '1주일',
            confidence: 0.8,
            factors: ['최적화 적용', '스킬 매칭 개선']
          }
        ],
        benchmarks: [
          {
            benchmarkId: 'benchmark-1',
            name: '리소스 활용도',
            category: 'utilization',
            value: 0.78,
            target: 0.85,
            industry_average: 0.75,
            best_practice: 0.9,
            gap_analysis: '목표 대비 7% 부족, 업계 평균 대비 3% 우수'
          }
        ]
      },
      recommendations: [
        {
          recommendationId: 'rec-1',
          type: 'optimization',
          title: '리소스 활용도 개선',
          description: '현재 활용도를 목표 수준까지 향상',
          rationale: '목표 활용도에 미달하고 있음',
          impact: 0.07,
          effort: 0.4,
          cost: 500000,
          timeline: 14,
          priority: 'medium',
          implementation: '워크로드 재분배 및 프로세스 개선',
          expectedOutcome: '활용도 7% 향상',
          success_criteria: ['활용도 85% 달성', '품질 유지'],
          risks: ['초기 혼란', '저항'],
          status: 'proposed'
        }
      ],
      settings: {
        autoOptimization: true,
        optimizationFrequency: 'daily',
        rebalancingThreshold: 0.1,
        utilizationTarget: 0.85,
        costOptimization: true,
        skillMatching: true,
        capacityPlanning: true,
        alertThresholds: {
          overallocation: 0.95,
          underutilization: 0.6,
          costOverrun: 0.1,
          skillGap: 0.3,
          timelineDelay: 0.05
        },
        approvalWorkflow: true,
        reportingFrequency: 'weekly'
      },
      timestamp: Date.now()
    };

    this.allocations.set(allocation1.allocationId, allocation1);
    this.optimizeAllocation(allocation1.allocationId);
    console.log('🎯 초기 리소스 할당 생성 완료');
  }

  public createAllocation(allocation: Omit<ResourceAllocation, 'allocationId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'>): ResourceAllocation {
    const allocationId = `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullAllocation: ResourceAllocation = {
      ...allocation,
      allocationId,
      optimization: {
        optimizationId: `opt-${allocationId}`,
        type: 'multi_objective',
        status: 'pending',
        algorithm: 'genetic-algorithm',
        objective: {
          primary: 'minimize_cost',
          secondary: [],
          weights: {},
          constraints: []
        },
        parameters: {
          timeHorizon: 30,
          granularity: 'day',
          iterations: 100,
          tolerance: 0.01,
          considerSkills: true,
          considerCosts: true,
          considerAvailability: true,
          riskTolerance: 0.1
        },
        results: [],
        recommendations: [],
        timestamp: Date.now()
      },
      performance: {
        overallEfficiency: 0,
        resourceUtilization: 0,
        costEfficiency: 0,
        skillMatch: 0,
        timelineAdherence: 0,
        qualityScore: 0,
        satisfaction: 0,
        roi: 0,
        trends: [],
        benchmarks: []
      },
      recommendations: [],
      timestamp: Date.now()
    };

    this.allocations.set(allocationId, fullAllocation);
    this.optimizeAllocation(allocationId);
    this.updateAnalytics();

    console.log(`🎯 새로운 리소스 할당 생성: ${allocationId}`);
    return fullAllocation;
  }

  public addResource(resource: Resource): void {
    this.resources.set(resource.resourceId, resource);
    this.updateAnalytics();
    console.log(`📋 새로운 리소스 추가: ${resource.name}`);
  }

  public updateResourceUtilization(resourceId: string, utilization: number): void {
    const resource = this.resources.get(resourceId);
    if (resource) {
      resource.utilization.current = utilization;
      this.checkOptimizationNeeds();
    }
  }

  private optimizeAllocation(allocationId: string): void {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) return;

    console.log(`🔧 리소스 할당 최적화 시작: ${allocationId}`);

    const optimization = allocation.optimization;
    optimization.status = 'running';

    // 다중 목표 최적화
    this.optimizeMultiObjective(allocation);

    // 용량 최적화
    this.optimizeCapacity(allocation);

    // 비용 최적화
    this.optimizeCost(allocation);

    // 스킬 매칭 최적화
    this.optimizeSkillMatch(allocation);

    optimization.status = 'completed';
    optimization.timestamp = Date.now();

    // 최적화 결과 분석
    this.analyzeOptimizationResults(allocation);

    // 권장사항 생성
    this.generateOptimizationRecommendations(allocation);

    console.log(`✅ 리소스 할당 최적화 완료: ${allocationId}`);
  }

  private optimizeMultiObjective(allocation: ResourceAllocation): void {
    // 다중 목표 최적화 (간단한 구현)
    const objective = allocation.optimization.objective;

    switch (objective.primary) {
      case 'minimize_cost':
        this.optimizeCostPrimary(allocation);
        break;
      case 'maximize_utilization':
        this.optimizeUtilizationPrimary(allocation);
        break;
      case 'optimize_skills':
        this.optimizeSkillsPrimary(allocation);
        break;
      case 'balance_workload':
        this.optimizeWorkloadBalance(allocation);
        break;
    }
  }

  private optimizeCostPrimary(allocation: ResourceAllocation): void {
    // 비용 최소화 최적화
    const costReduction = this.calculateCostReduction(allocation);

    if (costReduction > 0.05) {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'reallocation',
        title: '비용 효율적 리소스 재할당',
        description: '비용을 최소화하는 리소스 재할당',
        rationale: '현재 할당이 비용 효율적이지 않음',
        impact: costReduction,
        effort: 0.3,
        cost: 0,
        timeline: 7,
        priority: 'high',
        implementation: '저비용 리소스로 재할당',
        expectedOutcome: `비용 ${(costReduction * 100).toFixed(1)}% 절감`,
        risks: ['일시적 생산성 저하'],
        status: 'proposed'
      });
    }
  }

  private optimizeUtilizationPrimary(allocation: ResourceAllocation): void {
    // 활용도 최대화 최적화
    const utilizationGap = this.calculateUtilizationGap(allocation);

    if (utilizationGap > 0.1) {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'capacity_increase',
        title: '리소스 활용도 향상',
        description: '리소스 활용도를 최대화하는 재할당',
        rationale: '현재 활용도가 목표에 미달',
        impact: utilizationGap,
        effort: 0.4,
        cost: 100000,
        timeline: 5,
        priority: 'medium',
        implementation: '워크로드 재분배',
        expectedOutcome: `활용도 ${(utilizationGap * 100).toFixed(1)}% 향상`,
        risks: ['과부하 위험'],
        status: 'proposed'
      });
    }
  }

  private optimizeSkillsPrimary(allocation: ResourceAllocation): void {
    // 스킬 매칭 최적화
    const skillGaps = this.identifySkillGaps(allocation);

    skillGaps.forEach(gap => {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'skill_development',
        title: `${gap.skill} 스킬 개발`,
        description: `부족한 ${gap.skill} 스킬 개발 또는 재할당`,
        rationale: '필요 스킬과 보유 스킬 불일치',
        impact: gap.impact,
        effort: 0.5,
        cost: 200000,
        timeline: 14,
        priority: gap.impact > 0.3 ? 'high' : 'medium',
        implementation: '교육 또는 스킬 보유자 재할당',
        expectedOutcome: `스킬 매칭 ${(gap.impact * 100).toFixed(1)}% 향상`,
        risks: ['교육 시간 소요'],
        status: 'proposed'
      });
    });
  }

  private optimizeWorkloadBalance(allocation: ResourceAllocation): void {
    // 워크로드 균형 최적화
    const imbalance = this.calculateWorkloadImbalance(allocation);

    if (imbalance > 0.2) {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'reallocation',
        title: '워크로드 균형 조정',
        description: '리소스 간 워크로드 균형 조정',
        rationale: '워크로드 불균형이 심함',
        impact: imbalance,
        effort: 0.3,
        cost: 0,
        timeline: 3,
        priority: 'medium',
        implementation: '작업 재분배',
        expectedOutcome: `워크로드 균형 ${(imbalance * 100).toFixed(1)}% 개선`,
        risks: ['초기 혼란'],
        status: 'proposed'
      });
    }
  }

  private optimizeCapacity(allocation: ResourceAllocation): void {
    // 용량 최적화
    const capacityIssues = this.identifyCapacityIssues(allocation);

    capacityIssues.forEach(issue => {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'capacity_increase',
        title: '용량 부족 해결',
        description: `${issue.resourceName}의 용량 부족 해결`,
        rationale: '현재 용량으로는 요구사항 충족 불가',
        impact: issue.impact,
        effort: 0.6,
        cost: issue.cost,
        timeline: issue.timeline,
        priority: 'high',
        implementation: issue.solution,
        expectedOutcome: `용량 ${issue.increase}% 증가`,
        risks: ['비용 증가'],
        status: 'proposed'
      });
    });
  }

  private optimizeCost(allocation: ResourceAllocation): void {
    // 비용 최적화
    const costOptimizations = this.identifyCostOptimizations(allocation);

    costOptimizations.forEach(opt => {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'process_change',
        title: opt.title,
        description: opt.description,
        rationale: '비용 절감 기회 식별',
        impact: opt.savings,
        effort: 0.4,
        cost: opt.implementationCost,
        timeline: 10,
        priority: opt.savings > 0.1 ? 'high' : 'medium',
        implementation: opt.implementation,
        expectedOutcome: `비용 ${(opt.savings * 100).toFixed(1)}% 절감`,
        risks: opt.risks,
        status: 'proposed'
      });
    });
  }

  private optimizeSkillMatch(allocation: ResourceAllocation): void {
    // 스킬 매칭 최적화
    const matchingScore = this.calculateSkillMatchingScore(allocation);

    if (matchingScore < 0.8) {
      allocation.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'reallocation',
        title: '스킬 매칭 개선',
        description: '리소스와 요구 스킬 간 매칭 개선',
        rationale: '현재 스킬 매칭이 부족함',
        impact: 0.8 - matchingScore,
        effort: 0.3,
        cost: 0,
        timeline: 5,
        priority: 'medium',
        implementation: '스킬 기반 재할당',
        expectedOutcome: `스킬 매칭 ${((0.8 - matchingScore) * 100).toFixed(1)}% 향상`,
        risks: ['일시적 혼란'],
        status: 'proposed'
      });
    }
  }

  private calculateCostReduction(allocation: ResourceAllocation): number {
    // 비용 절감 가능성 계산 (간단한 구현)
    return Math.random() * 0.15; // 0-15% 절감 가능
  }

  private calculateUtilizationGap(allocation: ResourceAllocation): number {
    // 활용도 격차 계산
    const target = allocation.settings.utilizationTarget;
    const current = allocation.performance.resourceUtilization;
    return Math.max(0, target - current);
  }

  private identifySkillGaps(allocation: ResourceAllocation): Array<{ skill: string, impact: number }> {
    // 스킬 격차 식별 (간단한 구현)
    return [
      { skill: 'React', impact: 0.2 },
      { skill: 'TypeScript', impact: 0.15 }
    ];
  }

  private calculateWorkloadImbalance(allocation: ResourceAllocation): number {
    // 워크로드 불균형 계산 (간단한 구현)
    return Math.random() * 0.3; // 0-30% 불균형
  }

  private identifyCapacityIssues(allocation: ResourceAllocation): Array<{
    resourceName: string,
    impact: number,
    cost: number,
    timeline: number,
    solution: string,
    increase: number
  }> {
    // 용량 이슈 식별 (간단한 구현)
    return [
      {
        resourceName: '개발 서버',
        impact: 0.2,
        cost: 1000000,
        timeline: 7,
        solution: '서버 스케일업',
        increase: 50
      }
    ];
  }

  private identifyCostOptimizations(allocation: ResourceAllocation): Array<{
    title: string,
    description: string,
    savings: number,
    implementationCost: number,
    implementation: string,
    risks: string[]
  }> {
    // 비용 최적화 기회 식별 (간단한 구현)
    return [
      {
        title: '클라우드 리소스 최적화',
        description: '사용하지 않는 클라우드 리소스 정리',
        savings: 0.12,
        implementationCost: 50000,
        implementation: '자동 스케일링 및 스케줄링 도입',
        risks: ['일시적 성능 저하']
      }
    ];
  }

  private calculateSkillMatchingScore(allocation: ResourceAllocation): number {
    // 스킬 매칭 점수 계산 (간단한 구현)
    return 0.75 + Math.random() * 0.2; // 75-95%
  }

  private analyzeOptimizationResults(allocation: ResourceAllocation): void {
    // 최적화 결과 분석
    const results = allocation.optimization.results;

    results.forEach(result => {
      if (result.improvement > 0.1) {
        console.log(`📈 상당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      } else if (result.improvement > 0.05) {
        console.log(`📊 적당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      }
    });
  }

  private generateOptimizationRecommendations(allocation: ResourceAllocation): void {
    // 최적화 권장사항 생성
    const recommendations: AllocationRecommendation[] = [];

    // 성과 기반 권장사항
    if (allocation.performance.overallEfficiency < 0.8) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'optimization',
        title: '전체 효율성 개선',
        description: '리소스 할당 전체 효율성 향상',
        rationale: '현재 효율성이 목표치에 미달',
        impact: 0.2,
        effort: 0.5,
        cost: 300000,
        timeline: 14,
        priority: 'high',
        implementation: '프로세스 개선 및 자동화',
        expectedOutcome: '효율성 20% 향상',
        success_criteria: ['효율성 80% 달성', 'ROI 1.5 달성'],
        risks: ['초기 투자 비용'],
        status: 'proposed'
      });
    }

    allocation.recommendations = recommendations;
  }

  private updateAllocationPerformance(allocationId: string): void {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) return;

    const performance = allocation.performance;

    // 성과 지표 계산
    performance.overallEfficiency = this.calculateOverallEfficiency(allocation);
    performance.resourceUtilization = this.calculateResourceUtilization(allocation);
    performance.costEfficiency = this.calculateCostEfficiency(allocation);
    performance.skillMatch = this.calculateSkillMatch(allocation);
    performance.timelineAdherence = this.calculateTimelineAdherence(allocation);
    performance.qualityScore = this.calculateQualityScore(allocation);
    performance.satisfaction = this.calculateSatisfaction(allocation);
    performance.roi = this.calculateROI(allocation);
  }

  private calculateOverallEfficiency(allocation: ResourceAllocation): number {
    // 전체 효율성 계산
    const utilization = allocation.performance.resourceUtilization;
    const cost = allocation.performance.costEfficiency;
    const quality = allocation.performance.qualityScore;

    return (utilization * 0.4 + cost * 0.3 + quality * 0.3);
  }

  private calculateResourceUtilization(allocation: ResourceAllocation): number {
    // 리소스 활용도 계산
    if (allocation.resources.length === 0) return 0;

    const totalUtilization = allocation.resources.reduce((sum, resource) =>
      sum + resource.utilization.current, 0);

    return totalUtilization / allocation.resources.length;
  }

  private calculateCostEfficiency(allocation: ResourceAllocation): number {
    // 비용 효율성 계산
    if (allocation.resources.length === 0) return 0;

    const totalEfficiency = allocation.resources.reduce((sum, resource) =>
      sum + resource.performance.cost_effectiveness, 0);

    return totalEfficiency / allocation.resources.length;
  }

  private calculateSkillMatch(allocation: ResourceAllocation): number {
    // 스킬 매칭 점수 계산 (간단한 구현)
    return 0.8 + Math.random() * 0.15;
  }

  private calculateTimelineAdherence(allocation: ResourceAllocation): number {
    // 일정 준수율 계산 (간단한 구현)
    return 0.85 + Math.random() * 0.1;
  }

  private calculateQualityScore(allocation: ResourceAllocation): number {
    // 품질 점수 계산
    if (allocation.resources.length === 0) return 0;

    const totalQuality = allocation.resources.reduce((sum, resource) =>
      sum + resource.performance.quality, 0);

    return totalQuality / allocation.resources.length;
  }

  private calculateSatisfaction(allocation: ResourceAllocation): number {
    // 만족도 계산 (간단한 구현)
    return 0.8 + Math.random() * 0.15;
  }

  private calculateROI(allocation: ResourceAllocation): number {
    // ROI 계산 (간단한 구현)
    return 1.2 + Math.random() * 0.5;
  }

  private startOptimizationMonitoring(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      // 모든 활성 할당에 대해 최적화 모니터링
      this.allocations.forEach((allocation, allocationId) => {
        if (allocation.status === 'active') {
          this.checkOptimizationNeeds();
          this.updateAllocationPerformance(allocationId);
        }
      });

      this.updateAnalytics();
      this.cleanupOldData();
    }, 60000); // 1분마다 모니터링
  }

  private checkOptimizationNeeds(): void {
    this.allocations.forEach((allocation, allocationId) => {
      const settings = allocation.settings;

      // 자동 최적화 조건 확인
      if (settings.autoOptimization) {
        const utilizationGap = Math.abs(allocation.performance.resourceUtilization - settings.utilizationTarget);

        if (utilizationGap > settings.rebalancingThreshold) {
          console.log(`🔄 활용도 기준 미달로 자동 최적화 실행: ${allocationId}`);
          this.optimizeAllocation(allocationId);
        }
      }
    });
  }

  private updateAnalytics(): void {
    const allocations = Array.from(this.allocations.values());
    const resources = Array.from(this.resources.values());

    this.analytics.totalResources = resources.length;
    this.analytics.activeAllocations = allocations.filter(a => a.status === 'active').length;
    this.analytics.averageUtilization = resources.reduce((sum, r) => sum + r.utilization.current, 0) / resources.length;
    this.analytics.totalCost = resources.reduce((sum, r) => sum + r.cost.monthlyRate, 0);
    this.analytics.costPerResource = this.analytics.totalCost / resources.length;
    this.analytics.efficiencyScore = allocations.reduce((sum, a) => sum + a.performance.overallEfficiency, 0) / allocations.length;
    this.analytics.optimizationRate = allocations.filter(a => a.optimization.status === 'completed').length / allocations.length;
    this.analytics.issueResolutionRate = 0.9; // 간단한 구현
    this.analytics.satisfactionScore = allocations.reduce((sum, a) => sum + a.performance.satisfaction, 0) / allocations.length;
    this.analytics.roi = allocations.reduce((sum, a) => sum + a.performance.roi, 0) / allocations.length;
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90일

    this.allocations.forEach(allocation => {
      allocation.performance.trends = allocation.performance.trends.filter(
        trend => now - new Date(trend.period).getTime() < maxAge
      );
    });

    this.resources.forEach(resource => {
      resource.utilization.trends = resource.utilization.trends.filter(
        trend => now - new Date(trend.period).getTime() < maxAge
      );
    });
  }

  private cleanupData(): void {
    this.allocations.clear();
    this.resources.clear();
    console.log('🧹 리소스 할당 데이터 정리 완료');
  }

  public getAllocations(): ResourceAllocation[] {
    return Array.from(this.allocations.values());
  }

  public getAllocation(allocationId: string): ResourceAllocation | undefined {
    return this.allocations.get(allocationId);
  }

  public getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  public getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId);
  }

  public getAnalytics(): AllocationAnalytics {
    return { ...this.analytics };
  }

  public isSystemRunning(): boolean {
    return this.isRunning;
  }
}

const aiResourceAllocationOptimizationSystem = new AIResourceAllocationOptimizationSystem();
export default aiResourceAllocationOptimizationSystem;
