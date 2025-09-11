import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// AI 팀 구성 최적화 인터페이스 정의
export interface TeamComposition {
  teamId: string;
  name: string;
  description: string;
  type: 'project' | 'research' | 'development' | 'analysis' | 'innovation';
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  members: TeamMember[];
  roles: TeamRole[];
  requirements: TeamRequirement[];
  optimization: TeamOptimization;
  performance: TeamPerformance;
  recommendations: TeamRecommendation[];
  settings: TeamSettings;
  timestamp: number;
}

export interface TeamMember {
  memberId: string;
  userId: string;
  name: string;
  role: string;
  skills: Skill[];
  experience: number; // years
  learningPath: string;
  qualityMetrics: QualityMetrics;
  availability: number; // 0-1
  collaborationStyle: 'leader' | 'contributor' | 'supporter' | 'innovator';
  communicationPreference: 'direct' | 'diplomatic' | 'analytical' | 'creative';
  strengths: string[];
  weaknesses: string[];
  developmentAreas: string[];
}

export interface Skill {
  skillId: string;
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'leadership';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relevance: number; // 0-1
  lastUsed: number;
  certification: string[];
}

export interface QualityMetrics {
  overallQuality: number;
  technicalQuality: number;
  collaborationQuality: number;
  communicationQuality: number;
  problemSolvingQuality: number;
  innovationQuality: number;
  reliability: number;
  adaptability: number;
}

export interface TeamRole {
  roleId: string;
  name: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  importance: 'critical' | 'important' | 'nice-to-have';
  assignedMember: string | null;
  performance: number;
}

export interface TeamRequirement {
  requirementId: string;
  category: 'skill' | 'experience' | 'personality' | 'availability';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  satisfied: boolean;
  satisfactionScore: number;
}

export interface TeamOptimization {
  optimizationId: string;
  type: 'composition' | 'role-assignment' | 'skill-balance' | 'diversity';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  algorithm: string;
  parameters: Record<string, any>;
  results: OptimizationResult[];
  recommendations: OptimizationRecommendation[];
  timestamp: number;
}

export interface OptimizationResult {
  resultId: string;
  metric: string;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  confidence: number;
  explanation: string;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  type: 'member-addition' | 'member-removal' | 'role-change' | 'skill-development';
  title: string;
  description: string;
  impact: number;
  effort: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface TeamPerformance {
  overallPerformance: number;
  technicalPerformance: number;
  collaborationPerformance: number;
  communicationPerformance: number;
  problemSolvingPerformance: number;
  innovationPerformance: number;
  efficiency: number;
  satisfaction: number;
  productivity: number;
  quality: number;
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  trendId: string;
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  change: number;
  period: string;
  confidence: number;
  factors: string[];
}

export interface TeamRecommendation {
  recommendationId: string;
  type: 'composition' | 'development' | 'process' | 'communication';
  title: string;
  description: string;
  rationale: string;
  impact: number;
  effort: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedOutcome: string;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface TeamSettings {
  autoOptimization: boolean;
  diversityFocus: boolean;
  skillBalance: boolean;
  performanceTracking: boolean;
  developmentSupport: boolean;
  communicationEnhancement: boolean;
  conflictResolution: boolean;
  feedbackSystem: boolean;
  optimizationFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  performanceThresholds: PerformanceThresholds;
}

export interface PerformanceThresholds {
  minimumPerformance: number;
  targetEfficiency: number;
  minimumSatisfaction: number;
  targetProductivity: number;
  minimumQuality: number;
}

export interface TeamAnalytics {
  totalTeams: number;
  activeTeams: number;
  averagePerformance: number;
  averageSatisfaction: number;
  optimizationRate: number;
  diversityScore: number;
  skillBalanceScore: number;
  collaborationEffectiveness: number;
  innovationRate: number;
  developmentProgress: number;
}

class AITeamCompositionOptimizationSystem {
  private teams: Map<string, TeamComposition> = new Map();
  private isRunning: boolean = false;
  private analytics: TeamAnalytics = {
    totalTeams: 0,
    activeTeams: 0,
    averagePerformance: 0,
    averageSatisfaction: 0,
    optimizationRate: 0,
    diversityScore: 0,
    skillBalanceScore: 0,
    collaborationEffectiveness: 0,
    innovationRate: 0,
    developmentProgress: 0
  };

  constructor() {
    console.log('👥 AI 팀 구성 최적화 시스템 초기화 중...');
  }

  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ AI 팀 구성 최적화 시스템이 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    this.initializeSystem();
    this.createInitialTeams();
    this.startOptimizationMonitoring();

    console.log('✅ AI 팀 구성 최적화 시스템이 시작되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 팀 구성 최적화 시스템이 시작되었습니다.');
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ AI 팀 구성 최적화 시스템이 실행 중이 아닙니다.');
      return;
    }

    this.isRunning = false;
    this.cleanupData();

    console.log('🛑 AI 팀 구성 최적화 시스템이 중지되었습니다.');
    realTimeAIAlertSystem.sendAlert('info', 'AI 팀 구성 최적화 시스템이 중지되었습니다.');
  }

  private initializeSystem(): void {
    console.log('🔧 팀 구성 최적화 시스템 초기화 중...');

    console.log('👥 팀 구성 분석 엔진 초기화 완료');
    console.log('🎯 역할 최적화 알고리즘 초기화 완료');
    console.log('🔄 실시간 최적화 엔진 초기화 완료');
    console.log('📈 성과 분석 시스템 초기화 완료');
    console.log('🤝 협업 효과성 분석 초기화 완료');
    console.log('💡 다양성 및 균형 분석 초기화 완료');
  }

  private createInitialTeams(): void {
    const team1: TeamComposition = {
      teamId: 'team-1',
      name: 'AI 개발 팀',
      description: 'AI 프로젝트 개발을 위한 최적화된 팀 구성',
      type: 'development',
      status: 'active',
      members: [
        {
          memberId: 'member-1',
          userId: 'user-1',
          name: '김개발',
          role: '팀 리더',
          skills: [
            {
              skillId: 'skill-1',
              name: 'AI 개발',
              category: 'technical',
              level: 'expert',
              relevance: 0.95,
              lastUsed: Date.now(),
              certification: ['AI 전문가', '머신러닝 엔지니어']
            },
            {
              skillId: 'skill-2',
              name: '프로젝트 관리',
              category: 'leadership',
              level: 'advanced',
              relevance: 0.9,
              lastUsed: Date.now() - 86400000,
              certification: ['PMP', '애자일 마스터']
            }
          ],
          experience: 8,
          learningPath: 'learning-path-1',
          qualityMetrics: {
            overallQuality: 0.92,
            technicalQuality: 0.95,
            collaborationQuality: 0.88,
            communicationQuality: 0.9,
            problemSolvingQuality: 0.93,
            innovationQuality: 0.87,
            reliability: 0.94,
            adaptability: 0.89
          },
          availability: 0.95,
          collaborationStyle: 'leader',
          communicationPreference: 'direct',
          strengths: ['기술적 전문성', '리더십', '문제해결 능력'],
          weaknesses: ['때로는 너무 직접적'],
          developmentAreas: ['감정적 지능 향상', '멘토링 스킬']
        },
        {
          memberId: 'member-2',
          userId: 'user-2',
          name: '이디자인',
          role: 'UX/UI 디자이너',
          skills: [
            {
              skillId: 'skill-3',
              name: 'UI/UX 디자인',
              category: 'technical',
              level: 'advanced',
              relevance: 0.9,
              lastUsed: Date.now(),
              certification: ['UX 전문가', '디자인 시스템 전문가']
            }
          ],
          experience: 5,
          learningPath: 'learning-path-2',
          qualityMetrics: {
            overallQuality: 0.88,
            technicalQuality: 0.92,
            collaborationQuality: 0.85,
            communicationQuality: 0.87,
            problemSolvingQuality: 0.89,
            innovationQuality: 0.91,
            reliability: 0.88,
            adaptability: 0.86
          },
          availability: 0.9,
          collaborationStyle: 'contributor',
          communicationPreference: 'creative',
          strengths: ['창의적 사고', '사용자 중심 설계', '시각적 커뮤니케이션'],
          weaknesses: ['기술적 세부사항에 대한 이해 부족'],
          developmentAreas: ['기술적 이해도 향상', '데이터 기반 디자인']
        }
      ],
      roles: [
        {
          roleId: 'role-1',
          name: '팀 리더',
          description: '팀 전체를 이끌고 프로젝트를 관리하는 역할',
          responsibilities: ['프로젝트 계획', '팀 관리', '의사결정'],
          requiredSkills: ['리더십', '프로젝트 관리', '의사소통'],
          preferredSkills: ['AI 개발', '전략적 사고'],
          importance: 'critical',
          assignedMember: 'member-1',
          performance: 0.92
        },
        {
          roleId: 'role-2',
          name: 'UX/UI 디자이너',
          description: '사용자 경험과 인터페이스 디자인을 담당',
          responsibilities: ['사용자 리서치', '디자인 시스템 구축', '프로토타입 제작'],
          requiredSkills: ['UI/UX 디자인', '사용자 리서치', '프로토타이핑'],
          preferredSkills: ['사용자 테스트', '접근성 디자인'],
          importance: 'important',
          assignedMember: 'member-2',
          performance: 0.88
        }
      ],
      requirements: [
        {
          requirementId: 'req-1',
          category: 'skill',
          description: 'AI 개발 경험 5년 이상',
          priority: 'critical',
          weight: 0.9,
          satisfied: true,
          satisfactionScore: 0.95
        },
        {
          requirementId: 'req-2',
          category: 'skill',
          description: 'UX/UI 디자인 경험 3년 이상',
          priority: 'high',
          weight: 0.8,
          satisfied: true,
          satisfactionScore: 0.9
        }
      ],
      optimization: {
        optimizationId: 'opt-1',
        type: 'composition',
        status: 'completed',
        algorithm: 'genetic-algorithm',
        parameters: {
          populationSize: 100,
          generations: 50,
          mutationRate: 0.1
        },
        results: [
          {
            resultId: 'result-1',
            metric: 'team-effectiveness',
            beforeValue: 0.8,
            afterValue: 0.92,
            improvement: 0.12,
            confidence: 0.9,
            explanation: '역할 배정 최적화로 팀 효과성 향상'
          }
        ],
        recommendations: [
          {
            recommendationId: 'rec-1',
            type: 'member-addition',
            title: '데이터 사이언티스트 추가',
            description: 'AI 모델 개발을 위한 데이터 사이언티스트 역할 추가',
            impact: 0.15,
            effort: 0.6,
            priority: 'high',
            implementation: '데이터 사이언티스트 채용 및 팀 통합',
            expectedOutcome: 'AI 모델 개발 능력 15% 향상',
            status: 'proposed'
          }
        ],
        timestamp: Date.now()
      },
      performance: {
        overallPerformance: 0.9,
        technicalPerformance: 0.93,
        collaborationPerformance: 0.87,
        communicationPerformance: 0.89,
        problemSolvingPerformance: 0.91,
        innovationPerformance: 0.88,
        efficiency: 0.92,
        satisfaction: 0.88,
        productivity: 0.9,
        quality: 0.91,
        trends: [
          {
            trendId: 'trend-1',
            metric: 'collaboration-performance',
            direction: 'improving',
            change: 0.05,
            period: '1주일',
            confidence: 0.8,
            factors: ['팀 빌딩 활동', '의사소통 개선']
          }
        ]
      },
      recommendations: [
        {
          recommendationId: 'rec-1',
          type: 'development',
          title: '팀 멤버 스킬 개발',
          description: '개별 멤버의 약점 영역에 대한 개발 프로그램 제공',
          rationale: '팀 전체 성과 향상을 위한 개인 역량 강화',
          impact: 0.1,
          effort: 0.4,
          priority: 'medium',
          implementation: '개인별 맞춤형 학습 경로 제공',
          expectedOutcome: '팀 성과 10% 향상',
          status: 'proposed'
        }
      ],
      settings: {
        autoOptimization: true,
        diversityFocus: true,
        skillBalance: true,
        performanceTracking: true,
        developmentSupport: true,
        communicationEnhancement: true,
        conflictResolution: true,
        feedbackSystem: true,
        optimizationFrequency: 'weekly',
        performanceThresholds: {
          minimumPerformance: 0.8,
          targetEfficiency: 0.9,
          minimumSatisfaction: 0.8,
          targetProductivity: 0.9,
          minimumQuality: 0.85
        }
      },
      timestamp: Date.now()
    };

    this.teams.set(team1.teamId, team1);
    this.optimizeTeam(team1.teamId);
    console.log('📋 초기 팀 구성 생성 완료');
  }

  public createTeam(team: Omit<TeamComposition, 'teamId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'>): TeamComposition {
    const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullTeam: TeamComposition = {
      ...team,
      teamId,
      optimization: {
        optimizationId: `opt-${teamId}`,
        type: 'composition',
        status: 'pending',
        algorithm: 'genetic-algorithm',
        parameters: {},
        results: [],
        recommendations: [],
        timestamp: Date.now()
      },
      performance: {
        overallPerformance: 0,
        technicalPerformance: 0,
        collaborationPerformance: 0,
        communicationPerformance: 0,
        problemSolvingPerformance: 0,
        innovationPerformance: 0,
        efficiency: 0,
        satisfaction: 0,
        productivity: 0,
        quality: 0,
        trends: []
      },
      recommendations: [],
      timestamp: Date.now()
    };

    this.teams.set(teamId, fullTeam);
    this.optimizeTeam(teamId);
    this.updateAnalytics();

    console.log(`👥 새로운 팀 구성 생성: ${teamId}`);
    return fullTeam;
  }

  public addMember(teamId: string, member: TeamMember): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    team.members.push(member);
    this.optimizeTeam(teamId);
    this.updateTeamPerformance(teamId);
  }

  public removeMember(teamId: string, memberId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    team.members = team.members.filter(m => m.memberId !== memberId);
    this.optimizeTeam(teamId);
    this.updateTeamPerformance(teamId);
  }

  public assignRole(teamId: string, roleId: string, memberId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const role = team.roles.find(r => r.roleId === roleId);
    if (role) {
      role.assignedMember = memberId;
      this.optimizeTeam(teamId);
    }
  }

  private optimizeTeam(teamId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    console.log(`🔧 팀 구성 최적화 시작: ${teamId}`);

    const optimization = team.optimization;
    optimization.status = 'in-progress';

    // 팀 구성 최적화
    this.optimizeComposition(team);

    // 역할 배정 최적화
    this.optimizeRoleAssignment(team);

    // 스킬 균형 최적화
    this.optimizeSkillBalance(team);

    // 다양성 최적화
    this.optimizeDiversity(team);

    optimization.status = 'completed';
    optimization.timestamp = Date.now();

    // 최적화 결과 분석
    this.analyzeOptimizationResults(team);

    // 권장사항 생성
    this.generateRecommendations(team);

    console.log(`✅ 팀 구성 최적화 완료: ${teamId}`);
  }

  private optimizeComposition(team: TeamComposition): void {
    // 팀 구성 최적화 (간단한 구현)
    const members = team.members;

    // 스킬 겹침 분석 및 최적화
    const skillOverlap = this.analyzeSkillOverlap(members);
    if (skillOverlap > 0.7) {
      // 스킬 겹침이 높은 경우 최적화 권장사항 생성
      team.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'member-addition',
        title: '다양한 스킬을 가진 멤버 추가',
        description: '스킬 겹침을 줄이고 팀 다양성을 높이기 위한 멤버 추가',
        impact: 0.1,
        effort: 0.5,
        priority: 'medium',
        implementation: '다양한 배경을 가진 멤버 채용',
        expectedOutcome: '팀 다양성 및 창의성 향상',
        status: 'proposed'
      });
    }
  }

  private optimizeRoleAssignment(team: TeamComposition): void {
    // 역할 배정 최적화
    team.roles.forEach(role => {
      if (!role.assignedMember) {
        // 역할에 적합한 멤버 찾기
        const bestMatch = this.findBestMemberForRole(team.members, role);
        if (bestMatch) {
          role.assignedMember = bestMatch.memberId;
          role.performance = this.calculateRolePerformance(bestMatch, role);
        }
      }
    });
  }

  private optimizeSkillBalance(team: TeamComposition): void {
    // 스킬 균형 최적화
    const skillGaps = this.identifySkillGaps(team);

    skillGaps.forEach(gap => {
      team.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'skill-development',
        title: `${gap.skill} 스킬 개발`,
        description: `팀에서 부족한 ${gap.skill} 스킬 개발 프로그램 제공`,
        impact: gap.importance,
        effort: 0.3,
        priority: gap.importance > 0.8 ? 'high' : 'medium',
        implementation: '스킬 개발 프로그램 및 멘토링 제공',
        expectedOutcome: `${gap.skill} 스킬 수준 향상`,
        status: 'proposed'
      });
    });
  }

  private optimizeDiversity(team: TeamComposition): void {
    // 다양성 최적화
    const diversityScore = this.calculateDiversityScore(team);

    if (diversityScore < 0.7) {
      team.optimization.recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'member-addition',
        title: '팀 다양성 향상',
        description: '다양한 배경과 경험을 가진 멤버 추가',
        impact: 0.15,
        effort: 0.6,
        priority: 'high',
        implementation: '다양한 배경의 멤버 채용',
        expectedOutcome: '팀 다양성 및 혁신성 향상',
        status: 'proposed'
      });
    }
  }

  private analyzeSkillOverlap(members: TeamMember[]): number {
    // 스킬 겹침 분석 (간단한 구현)
    const allSkills = members.flatMap(m => m.skills.map(s => s.name));
    const uniqueSkills = new Set(allSkills);

    return 1 - (uniqueSkills.size / allSkills.length);
  }

  private findBestMemberForRole(members: TeamMember[], role: TeamRole): TeamMember | null {
    let bestMatch: TeamMember | null = null;
    let bestScore = 0;

    members.forEach(member => {
      const score = this.calculateRoleFitScore(member, role);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = member;
      }
    });

    return bestMatch;
  }

  private calculateRoleFitScore(member: TeamMember, role: TeamRole): number {
    let score = 0;

    // 필수 스킬 매칭
    role.requiredSkills.forEach(skill => {
      const memberSkill = member.skills.find(s => s.name === skill);
      if (memberSkill) {
        score += memberSkill.level === 'expert' ? 1 :
          memberSkill.level === 'advanced' ? 0.8 :
            memberSkill.level === 'intermediate' ? 0.6 : 0.4;
      }
    });

    // 선호 스킬 매칭
    role.preferredSkills.forEach(skill => {
      const memberSkill = member.skills.find(s => s.name === skill);
      if (memberSkill) {
        score += 0.3;
      }
    });

    return score / (role.requiredSkills.length + role.preferredSkills.length);
  }

  private calculateRolePerformance(member: TeamMember, role: TeamRole): number {
    // 역할 성과 계산
    const skillScore = this.calculateRoleFitScore(member, role);
    const qualityScore = member.qualityMetrics.overallQuality;
    const availabilityScore = member.availability;

    return (skillScore * 0.4 + qualityScore * 0.4 + availabilityScore * 0.2);
  }

  private identifySkillGaps(team: TeamComposition): Array<{ skill: string, importance: number }> {
    // 스킬 격차 식별
    const requiredSkills = team.roles.flatMap(r => r.requiredSkills);
    const teamSkills = team.members.flatMap(m => m.skills.map(s => s.name));

    const gaps: Array<{ skill: string, importance: number }> = [];
    const uniqueRequiredSkills = [...new Set(requiredSkills)];

    uniqueRequiredSkills.forEach(skill => {
      if (!teamSkills.includes(skill)) {
        const importance = team.roles
          .filter(r => r.requiredSkills.includes(skill))
          .reduce((sum, r) => sum + (r.importance === 'critical' ? 1 : 0.5), 0);

        gaps.push({ skill, importance: importance / team.roles.length });
      }
    });

    return gaps;
  }

  private calculateDiversityScore(team: TeamComposition): number {
    // 다양성 점수 계산 (간단한 구현)
    const collaborationStyles = new Set(team.members.map(m => m.collaborationStyle));
    const communicationPreferences = new Set(team.members.map(m => m.communicationPreference));
    const skillCategories = new Set(team.members.flatMap(m => m.skills.map(s => s.category)));

    const styleDiversity = collaborationStyles.size / 4; // 4가지 스타일
    const communicationDiversity = communicationPreferences.size / 4; // 4가지 선호도
    const skillDiversity = skillCategories.size / 4; // 4가지 카테고리

    return (styleDiversity + communicationDiversity + skillDiversity) / 3;
  }

  private analyzeOptimizationResults(team: TeamComposition): void {
    // 최적화 결과 분석
    const results = team.optimization.results;

    results.forEach(result => {
      if (result.improvement > 0.1) {
        console.log(`📈 상당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      } else if (result.improvement > 0.05) {
        console.log(`📊 적당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
      }
    });
  }

  private generateRecommendations(team: TeamComposition): void {
    // 팀 개선 권장사항 생성
    const recommendations: TeamRecommendation[] = [];

    // 성과 기반 권장사항
    if (team.performance.overallPerformance < 0.8) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'development',
        title: '팀 성과 향상 프로그램',
        description: '팀 전체 성과를 향상시키기 위한 개발 프로그램',
        rationale: '현재 성과가 목표치에 미달하고 있음',
        impact: 0.2,
        effort: 0.6,
        priority: 'high',
        implementation: '팀 빌딩 워크숍 및 성과 관리 시스템 도입',
        expectedOutcome: '팀 성과 20% 향상',
        status: 'proposed'
      });
    }

    // 협업 기반 권장사항
    if (team.performance.collaborationPerformance < 0.8) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}`,
        type: 'process',
        title: '협업 프로세스 개선',
        description: '팀 협업 효과성을 높이기 위한 프로세스 개선',
        rationale: '협업 성과가 목표치에 미달하고 있음',
        impact: 0.15,
        effort: 0.4,
        priority: 'medium',
        implementation: '협업 도구 도입 및 프로세스 표준화',
        expectedOutcome: '협업 효과성 15% 향상',
        status: 'proposed'
      });
    }

    team.recommendations = recommendations;
  }

  private updateTeamPerformance(teamId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const performance = team.performance;

    // 기술적 성과 계산
    performance.technicalPerformance = this.calculateTechnicalPerformance(team);

    // 협업 성과 계산
    performance.collaborationPerformance = this.calculateCollaborationPerformance(team);

    // 의사소통 성과 계산
    performance.communicationPerformance = this.calculateCommunicationPerformance(team);

    // 문제해결 성과 계산
    performance.problemSolvingPerformance = this.calculateProblemSolvingPerformance(team);

    // 혁신 성과 계산
    performance.innovationPerformance = this.calculateInnovationPerformance(team);

    // 전체 성과 계산
    performance.overallPerformance = (
      performance.technicalPerformance * 0.25 +
      performance.collaborationPerformance * 0.25 +
      performance.communicationPerformance * 0.2 +
      performance.problemSolvingPerformance * 0.2 +
      performance.innovationPerformance * 0.1
    );

    // 효율성, 만족도, 생산성, 품질 계산
    performance.efficiency = this.calculateEfficiency(team);
    performance.satisfaction = this.calculateSatisfaction(team);
    performance.productivity = this.calculateProductivity(team);
    performance.quality = this.calculateQuality(team);
  }

  private calculateTechnicalPerformance(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalTechnicalQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.technicalQuality, 0);

    return totalTechnicalQuality / team.members.length;
  }

  private calculateCollaborationPerformance(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalCollaborationQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.collaborationQuality, 0);

    return totalCollaborationQuality / team.members.length;
  }

  private calculateCommunicationPerformance(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalCommunicationQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.communicationQuality, 0);

    return totalCommunicationQuality / team.members.length;
  }

  private calculateProblemSolvingPerformance(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalProblemSolvingQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.problemSolvingQuality, 0);

    return totalProblemSolvingQuality / team.members.length;
  }

  private calculateInnovationPerformance(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalInnovationQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.innovationQuality, 0);

    return totalInnovationQuality / team.members.length;
  }

  private calculateEfficiency(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalReliability = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.reliability, 0);

    return totalReliability / team.members.length;
  }

  private calculateSatisfaction(team: TeamComposition): number {
    // 간단한 만족도 계산 (실제로는 설문조사 결과 기반)
    return 0.85;
  }

  private calculateProductivity(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalAvailability = team.members.reduce((sum, member) =>
      sum + member.availability, 0);

    return totalAvailability / team.members.length;
  }

  private calculateQuality(team: TeamComposition): number {
    if (team.members.length === 0) return 0;

    const totalQuality = team.members.reduce((sum, member) =>
      sum + member.qualityMetrics.overallQuality, 0);

    return totalQuality / team.members.length;
  }

  private startOptimizationMonitoring(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      // 모든 활성 팀에 대해 최적화 모니터링
      this.teams.forEach((team, teamId) => {
        if (team.status === 'active') {
          this.checkOptimizationNeeds(teamId);
          this.updateTeamPerformance(teamId);
        }
      });

      this.updateAnalytics();
      this.cleanupOldData();
    }, 60000); // 1분마다 모니터링
  }

  private checkOptimizationNeeds(teamId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const settings = team.settings;

    // 자동 최적화 조건 확인
    if (settings.autoOptimization && team.performance.overallPerformance < settings.performanceThresholds.minimumPerformance) {
      console.log(`🔄 성과 기준 미달로 자동 최적화 실행: ${teamId}`);
      this.optimizeTeam(teamId);
    }
  }

  private updateAnalytics(): void {
    const teams = Array.from(this.teams.values());

    this.analytics.totalTeams = teams.length;
    this.analytics.activeTeams = teams.filter(t => t.status === 'active').length;
    this.analytics.averagePerformance = teams.reduce((sum, t) => sum + t.performance.overallPerformance, 0) / teams.length;
    this.analytics.averageSatisfaction = teams.reduce((sum, t) => sum + t.performance.satisfaction, 0) / teams.length;
    this.analytics.optimizationRate = teams.filter(t => t.optimization.status === 'completed').length / teams.length;
    this.analytics.diversityScore = teams.reduce((sum, t) => sum + this.calculateDiversityScore(t), 0) / teams.length;
    this.analytics.skillBalanceScore = teams.reduce((sum, t) => sum + (1 - this.analyzeSkillOverlap(t.members)), 0) / teams.length;
    this.analytics.collaborationEffectiveness = teams.reduce((sum, t) => sum + t.performance.collaborationPerformance, 0) / teams.length;
    this.analytics.innovationRate = teams.reduce((sum, t) => sum + t.performance.innovationPerformance, 0) / teams.length;
    this.analytics.developmentProgress = teams.reduce((sum, t) =>
      sum + t.members.reduce((mSum, m) => mSum + m.qualityMetrics.adaptability, 0) / t.members.length, 0) / teams.length;
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90일

    this.teams.forEach(team => {
      team.performance.trends = team.performance.trends.filter(
        trend => now - new Date(trend.period).getTime() < maxAge
      );
    });
  }

  private cleanupData(): void {
    this.teams.clear();
    console.log('🧹 팀 구성 데이터 정리 완료');
  }

  public getTeams(): TeamComposition[] {
    return Array.from(this.teams.values());
  }

  public getTeam(teamId: string): TeamComposition | undefined {
    return this.teams.get(teamId);
  }

  public getAnalytics(): TeamAnalytics {
    return { ...this.analytics };
  }

  public isSystemRunning(): boolean {
    return this.isRunning;
  }
}

const aiTeamCompositionOptimizationSystem = new AITeamCompositionOptimizationSystem();
export default aiTeamCompositionOptimizationSystem;
