import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// AI 프로젝트 관리 최적화 인터페이스 정의
export interface ProjectManagement {
    projectId: string;
    name: string;
    description: string;
    type: 'development' | 'research' | 'analysis' | 'innovation' | 'maintenance';
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    teamId: string;
    phases: ProjectPhase[];
    tasks: ProjectTask[];
    resources: ProjectResource[];
    risks: ProjectRisk[];
    optimization: ProjectOptimization;
    performance: ProjectPerformance;
    recommendations: ProjectRecommendation[];
    settings: ProjectSettings;
    timestamp: number;
}

export interface ProjectPhase {
    phaseId: string;
    name: string;
    description: string;
    order: number;
    status: 'pending' | 'active' | 'completed' | 'delayed';
    startDate: number;
    endDate: number;
    actualStartDate?: number;
    actualEndDate?: number;
    tasks: string[];
    dependencies: string[];
    progress: number;
    quality: number;
}

export interface ProjectTask {
    taskId: string;
    name: string;
    description: string;
    phaseId: string;
    assigneeId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
    estimatedHours: number;
    actualHours: number;
    startDate: number;
    dueDate: number;
    completedDate?: number;
    dependencies: string[];
    tags: string[];
    progress: number;
    quality: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}

export interface ProjectResource {
    resourceId: string;
    type: 'human' | 'equipment' | 'software' | 'budget';
    name: string;
    description: string;
    allocated: number;
    used: number;
    available: number;
    cost: number;
    efficiency: number;
    utilization: number;
}

export interface ProjectRisk {
    riskId: string;
    title: string;
    description: string;
    category: 'technical' | 'schedule' | 'resource' | 'external' | 'quality';
    probability: number;
    impact: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'identified' | 'monitoring' | 'mitigated' | 'resolved';
    mitigationPlan: string;
    contingencyPlan: string;
    assignedTo: string;
    dueDate: number;
}

export interface ProjectOptimization {
    optimizationId: string;
    type: 'schedule' | 'resource' | 'risk' | 'quality' | 'cost';
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
    type: 'schedule-adjustment' | 'resource-reallocation' | 'risk-mitigation' | 'quality-improvement';
    title: string;
    description: string;
    impact: number;
    effort: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    implementation: string;
    expectedOutcome: string;
    status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface ProjectPerformance {
    overallPerformance: number;
    schedulePerformance: number;
    costPerformance: number;
    qualityPerformance: number;
    resourcePerformance: number;
    riskPerformance: number;
    efficiency: number;
    productivity: number;
    satisfaction: number;
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

export interface ProjectRecommendation {
    recommendationId: string;
    type: 'management' | 'process' | 'resource' | 'risk' | 'quality';
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

export interface ProjectSettings {
    autoOptimization: boolean;
    riskMonitoring: boolean;
    qualityTracking: boolean;
    resourceOptimization: boolean;
    scheduleOptimization: boolean;
    costControl: boolean;
    stakeholderCommunication: boolean;
    progressReporting: boolean;
    optimizationFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
    performanceThresholds: PerformanceThresholds;
}

export interface PerformanceThresholds {
    minimumSchedulePerformance: number;
    minimumCostPerformance: number;
    minimumQualityPerformance: number;
    maximumRiskLevel: number;
    targetEfficiency: number;
}

export interface ProjectAnalytics {
    totalProjects: number;
    activeProjects: number;
    averagePerformance: number;
    averageSchedulePerformance: number;
    averageCostPerformance: number;
    averageQualityPerformance: number;
    optimizationRate: number;
    riskMitigationRate: number;
    resourceUtilization: number;
    stakeholderSatisfaction: number;
}

export class AIProjectManagementOptimizationSystem {
    private projects: Map<string, ProjectManagement> = new Map();
    private isRunning: boolean = false;
    private analytics: ProjectAnalytics = {
        totalProjects: 0,
        activeProjects: 0,
        averagePerformance: 0,
        averageSchedulePerformance: 0,
        averageCostPerformance: 0,
        averageQualityPerformance: 0,
        optimizationRate: 0,
        riskMitigationRate: 0,
        resourceUtilization: 0,
        stakeholderSatisfaction: 0
    };

    constructor() {
        console.log('📋 AI 프로젝트 관리 최적화 시스템 초기화 중...');
    }

    public start(): void {
        if (this.isRunning) {
            console.log('⚠️ AI 프로젝트 관리 최적화 시스템이 이미 실행 중입니다.');
            return;
        }

        this.isRunning = true;
        this.initializeSystem();
        this.createInitialProjects();
        this.startOptimizationMonitoring();

        console.log('✅ AI 프로젝트 관리 최적화 시스템이 시작되었습니다.');
        realTimeAIAlertSystem.sendAlert('info', 'AI 프로젝트 관리 최적화 시스템이 시작되었습니다.');
    }

    public stop(): void {
        if (!this.isRunning) {
            console.log('⚠️ AI 프로젝트 관리 최적화 시스템이 실행 중이 아닙니다.');
            return;
        }

        this.isRunning = false;
        this.cleanupData();

        console.log('🛑 AI 프로젝트 관리 최적화 시스템이 중지되었습니다.');
        realTimeAIAlertSystem.sendAlert('info', 'AI 프로젝트 관리 최적화 시스템이 중지되었습니다.');
    }

    private initializeSystem(): void {
        console.log('🔧 프로젝트 관리 최적화 시스템 초기화 중...');

        console.log('📅 스케줄 최적화 엔진 초기화 완료');
        console.log('💰 비용 관리 시스템 초기화 완료');
        console.log('🎯 품질 관리 시스템 초기화 완료');
        console.log('⚠️ 리스크 관리 시스템 초기화 완료');
        console.log('👥 리소스 최적화 엔진 초기화 완료');
        console.log('📊 성과 분석 시스템 초기화 완료');
    }

    private createInitialProjects(): void {
        const project1: ProjectManagement = {
            projectId: 'project-1',
            name: 'AI 플랫폼 개발',
            description: '기업용 AI 플랫폼 개발 프로젝트',
            type: 'development',
            status: 'active',
            priority: 'high',
            teamId: 'team-1',
            phases: [
                {
                    phaseId: 'phase-1',
                    name: '요구사항 분석',
                    description: '프로젝트 요구사항 분석 및 정의',
                    order: 1,
                    status: 'completed',
                    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    endDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    actualStartDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    actualEndDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    tasks: ['task-1', 'task-2'],
                    dependencies: [],
                    progress: 1.0,
                    quality: 0.9
                },
                {
                    phaseId: 'phase-2',
                    name: '설계',
                    description: '시스템 아키텍처 및 상세 설계',
                    order: 2,
                    status: 'active',
                    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
                    actualStartDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    tasks: ['task-3', 'task-4'],
                    dependencies: ['phase-1'],
                    progress: 0.6,
                    quality: 0.85
                }
            ],
            tasks: [
                {
                    taskId: 'task-1',
                    name: '요구사항 수집',
                    description: '이해관계자로부터 요구사항 수집',
                    phaseId: 'phase-1',
                    assigneeId: 'member-1',
                    priority: 'high',
                    status: 'completed',
                    estimatedHours: 16,
                    actualHours: 14,
                    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    dueDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
                    completedDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
                    dependencies: [],
                    tags: ['requirements', 'analysis'],
                    progress: 1.0,
                    quality: 0.9,
                    complexity: 'moderate'
                },
                {
                    taskId: 'task-2',
                    name: '요구사항 문서화',
                    description: '수집된 요구사항을 문서화',
                    phaseId: 'phase-1',
                    assigneeId: 'member-2',
                    priority: 'medium',
                    status: 'completed',
                    estimatedHours: 8,
                    actualHours: 10,
                    startDate: Date.now() - 25 * 24 * 60 * 60 * 1000,
                    dueDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    completedDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                    dependencies: ['task-1'],
                    tags: ['documentation'],
                    progress: 1.0,
                    quality: 0.85,
                    complexity: 'simple'
                }
            ],
            resources: [
                {
                    resourceId: 'resource-1',
                    type: 'human',
                    name: '개발팀',
                    description: 'AI 개발 전문가 팀',
                    allocated: 100,
                    used: 75,
                    available: 25,
                    cost: 50000,
                    efficiency: 0.85,
                    utilization: 0.75
                }
            ],
            risks: [
                {
                    riskId: 'risk-1',
                    title: '기술적 복잡성',
                    description: 'AI 기술의 복잡성으로 인한 개발 지연 위험',
                    category: 'technical',
                    probability: 0.6,
                    impact: 0.8,
                    severity: 'high',
                    status: 'monitoring',
                    mitigationPlan: '단계적 개발 및 프로토타입 검증',
                    contingencyPlan: '외부 전문가 컨설팅 고려',
                    assignedTo: 'member-1',
                    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000
                }
            ],
            optimization: {
                optimizationId: 'opt-1',
                type: 'schedule',
                status: 'completed',
                algorithm: 'critical-path-analysis',
                parameters: {
                    bufferTime: 0.2,
                    resourceConstraints: true
                },
                results: [
                    {
                        resultId: 'result-1',
                        metric: 'schedule-efficiency',
                        beforeValue: 0.7,
                        afterValue: 0.85,
                        improvement: 0.15,
                        confidence: 0.9,
                        explanation: '크리티컬 패스 최적화로 일정 효율성 향상'
                    }
                ],
                recommendations: [
                    {
                        recommendationId: 'rec-1',
                        type: 'schedule-adjustment',
                        title: '병렬 작업 확대',
                        description: '독립적인 작업들을 병렬로 실행하여 일정 단축',
                        impact: 0.1,
                        effort: 0.3,
                        priority: 'medium',
                        implementation: '작업 의존성 분석 및 병렬 실행 계획 수립',
                        expectedOutcome: '프로젝트 일정 10% 단축',
                        status: 'proposed'
                    }
                ],
                timestamp: Date.now()
            },
            performance: {
                overallPerformance: 0.82,
                schedulePerformance: 0.85,
                costPerformance: 0.78,
                qualityPerformance: 0.88,
                resourcePerformance: 0.75,
                riskPerformance: 0.7,
                efficiency: 0.8,
                productivity: 0.85,
                satisfaction: 0.8,
                trends: [
                    {
                        trendId: 'trend-1',
                        metric: 'schedule-performance',
                        direction: 'improving',
                        change: 0.05,
                        period: '1주일',
                        confidence: 0.8,
                        factors: ['작업 최적화', '리소스 재배치']
                    }
                ]
            },
            recommendations: [
                {
                    recommendationId: 'rec-1',
                    type: 'management',
                    title: '리스크 관리 강화',
                    description: '기술적 복잡성 리스크에 대한 적극적 관리 필요',
                    rationale: '현재 리스크 성과가 목표치에 미달하고 있음',
                    impact: 0.15,
                    effort: 0.4,
                    priority: 'high',
                    implementation: '리스크 모니터링 시스템 구축 및 대응 계획 수립',
                    expectedOutcome: '리스크 성과 15% 향상',
                    status: 'proposed'
                }
            ],
            settings: {
                autoOptimization: true,
                riskMonitoring: true,
                qualityTracking: true,
                resourceOptimization: true,
                scheduleOptimization: true,
                costControl: true,
                stakeholderCommunication: true,
                progressReporting: true,
                optimizationFrequency: 'weekly',
                performanceThresholds: {
                    minimumSchedulePerformance: 0.8,
                    minimumCostPerformance: 0.8,
                    minimumQualityPerformance: 0.85,
                    maximumRiskLevel: 0.3,
                    targetEfficiency: 0.85
                }
            },
            timestamp: Date.now()
        };

        this.projects.set(project1.projectId, project1);
        this.optimizeProject(project1.projectId);
        console.log('📋 초기 프로젝트 생성 완료');
    }

    public createProject(project: Omit<ProjectManagement, 'projectId' | 'optimization' | 'performance' | 'recommendations' | 'timestamp'>): ProjectManagement {
        const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const fullProject: ProjectManagement = {
            ...project,
            projectId,
            optimization: {
                optimizationId: `opt-${projectId}`,
                type: 'schedule',
                status: 'pending',
                algorithm: 'critical-path-analysis',
                parameters: {},
                results: [],
                recommendations: [],
                timestamp: Date.now()
            },
            performance: {
                overallPerformance: 0,
                schedulePerformance: 0,
                costPerformance: 0,
                qualityPerformance: 0,
                resourcePerformance: 0,
                riskPerformance: 0,
                efficiency: 0,
                productivity: 0,
                satisfaction: 0,
                trends: []
            },
            recommendations: [],
            timestamp: Date.now()
        };

        this.projects.set(projectId, fullProject);
        this.optimizeProject(projectId);
        this.updateAnalytics();

        console.log(`📋 새로운 프로젝트 생성: ${projectId}`);
        return fullProject;
    }

    public addTask(projectId: string, task: ProjectTask): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        project.tasks.push(task);
        this.optimizeProject(projectId);
        this.updateProjectPerformance(projectId);
    }

    public updateTaskStatus(projectId: string, taskId: string, status: string): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        const task = project.tasks.find(t => t.taskId === taskId);
        if (task) {
            task.status = status as any;
            if (status === 'completed') {
                task.completedDate = Date.now();
                task.progress = 1.0;
            }
            this.optimizeProject(projectId);
        }
    }

    public addRisk(projectId: string, risk: ProjectRisk): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        project.risks.push(risk);
        this.optimizeProject(projectId);
    }

    private optimizeProject(projectId: string): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        console.log(`🔧 프로젝트 최적화 시작: ${projectId}`);

        const optimization = project.optimization;
        optimization.status = 'in-progress';

        // 스케줄 최적화
        this.optimizeSchedule(project);

        // 리소스 최적화
        this.optimizeResources(project);

        // 리스크 최적화
        this.optimizeRisks(project);

        // 품질 최적화
        this.optimizeQuality(project);

        optimization.status = 'completed';
        optimization.timestamp = Date.now();

        // 최적화 결과 분석
        this.analyzeOptimizationResults(project);

        // 권장사항 생성
        this.generateRecommendations(project);

        console.log(`✅ 프로젝트 최적화 완료: ${projectId}`);
    }

    private optimizeSchedule(project: ProjectManagement): void {
        // 스케줄 최적화 (크리티컬 패스 분석)
        const criticalPath = this.analyzeCriticalPath(project);

        if (criticalPath.length > 0) {
            project.optimization.recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                type: 'schedule-adjustment',
                title: '크리티컬 패스 최적화',
                description: '크리티컬 패스상의 작업들을 최적화하여 일정 단축',
                impact: 0.15,
                effort: 0.4,
                priority: 'high',
                implementation: '크리티컬 패스 작업들의 리소스 증강 및 병렬화',
                expectedOutcome: '프로젝트 일정 15% 단축',
                status: 'proposed'
            });
        }
    }

    private optimizeResources(project: ProjectManagement): void {
        // 리소스 최적화
        const resourceUtilization = this.calculateResourceUtilization(project);

        if (resourceUtilization < 0.8) {
            project.optimization.recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                type: 'resource-reallocation',
                title: '리소스 활용도 개선',
                description: '리소스 활용도를 높이기 위한 재배치',
                impact: 0.1,
                effort: 0.3,
                priority: 'medium',
                implementation: '리소스 사용량 분석 및 재배치 계획 수립',
                expectedOutcome: '리소스 활용도 10% 향상',
                status: 'proposed'
            });
        }
    }

    private optimizeRisks(project: ProjectManagement): void {
        // 리스크 최적화
        const highRisks = project.risks.filter(r => r.severity === 'high' || r.severity === 'critical');

        highRisks.forEach(risk => {
            if (risk.status === 'identified') {
                project.optimization.recommendations.push({
                    recommendationId: `rec-${Date.now()}`,
                    type: 'risk-mitigation',
                    title: `${risk.title} 리스크 완화`,
                    description: `높은 우선순위 리스크에 대한 적극적 완화 조치`,
                    impact: risk.impact,
                    effort: 0.5,
                    priority: 'high',
                    implementation: risk.mitigationPlan,
                    expectedOutcome: `리스크 확률 ${(risk.probability * 0.5 * 100).toFixed(0)}% 감소`,
                    status: 'proposed'
                });
            }
        });
    }

    private optimizeQuality(project: ProjectManagement): void {
        // 품질 최적화
        const averageQuality = this.calculateAverageQuality(project);

        if (averageQuality < 0.85) {
            project.optimization.recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                type: 'quality-improvement',
                title: '품질 관리 강화',
                description: '프로젝트 전반의 품질 향상을 위한 관리 강화',
                impact: 0.1,
                effort: 0.4,
                priority: 'medium',
                implementation: '품질 체크포인트 추가 및 리뷰 프로세스 강화',
                expectedOutcome: '평균 품질 10% 향상',
                status: 'proposed'
            });
        }
    }

    private analyzeCriticalPath(project: ProjectManagement): string[] {
        // 크리티컬 패스 분석 (간단한 구현)
        const tasks = project.tasks.filter(t => t.status !== 'completed');
        const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');

        return criticalTasks.map(t => t.taskId);
    }

    private calculateResourceUtilization(project: ProjectManagement): number {
        if (project.resources.length === 0) return 0;

        const totalUtilization = project.resources.reduce((sum, resource) =>
            sum + resource.utilization, 0);

        return totalUtilization / project.resources.length;
    }

    private calculateAverageQuality(project: ProjectManagement): number {
        if (project.tasks.length === 0) return 0;

        const totalQuality = project.tasks.reduce((sum, task) =>
            sum + task.quality, 0);

        return totalQuality / project.tasks.length;
    }

    private analyzeOptimizationResults(project: ProjectManagement): void {
        // 최적화 결과 분석
        const results = project.optimization.results;

        results.forEach(result => {
            if (result.improvement > 0.1) {
                console.log(`📈 상당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
            } else if (result.improvement > 0.05) {
                console.log(`📊 적당한 개선: ${result.metric} (${(result.improvement * 100).toFixed(1)}% 향상)`);
            }
        });
    }

    private generateRecommendations(project: ProjectManagement): void {
        // 프로젝트 개선 권장사항 생성
        const recommendations: ProjectRecommendation[] = [];

        // 성과 기반 권장사항
        if (project.performance.overallPerformance < 0.8) {
            recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                type: 'management',
                title: '프로젝트 성과 향상',
                description: '전체 프로젝트 성과를 향상시키기 위한 관리 개선',
                rationale: '현재 성과가 목표치에 미달하고 있음',
                impact: 0.2,
                effort: 0.6,
                priority: 'high',
                implementation: '프로젝트 관리 프로세스 개선 및 팀 커뮤니케이션 강화',
                expectedOutcome: '프로젝트 성과 20% 향상',
                status: 'proposed'
            });
        }

        // 일정 기반 권장사항
        if (project.performance.schedulePerformance < 0.8) {
            recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                type: 'process',
                title: '일정 관리 개선',
                description: '프로젝트 일정 관리 프로세스 개선',
                rationale: '일정 성과가 목표치에 미달하고 있음',
                impact: 0.15,
                effort: 0.4,
                priority: 'medium',
                implementation: '일정 추적 시스템 도입 및 정기 리뷰 강화',
                expectedOutcome: '일정 성과 15% 향상',
                status: 'proposed'
            });
        }

        project.recommendations = recommendations;
    }

    private updateProjectPerformance(projectId: string): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        const performance = project.performance;

        // 일정 성과 계산
        performance.schedulePerformance = this.calculateSchedulePerformance(project);

        // 비용 성과 계산
        performance.costPerformance = this.calculateCostPerformance(project);

        // 품질 성과 계산
        performance.qualityPerformance = this.calculateQualityPerformance(project);

        // 리소스 성과 계산
        performance.resourcePerformance = this.calculateResourcePerformance(project);

        // 리스크 성과 계산
        performance.riskPerformance = this.calculateRiskPerformance(project);

        // 전체 성과 계산
        performance.overallPerformance = (
            performance.schedulePerformance * 0.25 +
            performance.costPerformance * 0.25 +
            performance.qualityPerformance * 0.2 +
            performance.resourcePerformance * 0.15 +
            performance.riskPerformance * 0.15
        );

        // 효율성, 생산성, 만족도 계산
        performance.efficiency = this.calculateEfficiency(project);
        performance.productivity = this.calculateProductivity(project);
        performance.satisfaction = this.calculateSatisfaction(project);
    }

    private calculateSchedulePerformance(project: ProjectManagement): number {
        const phases = project.phases;
        if (phases.length === 0) return 0;

        const totalProgress = phases.reduce((sum, phase) =>
            sum + phase.progress, 0);

        return totalProgress / phases.length;
    }

    private calculateCostPerformance(project: ProjectManagement): number {
        const resources = project.resources;
        if (resources.length === 0) return 0;

        const totalEfficiency = resources.reduce((sum, resource) =>
            sum + resource.efficiency, 0);

        return totalEfficiency / resources.length;
    }

    private calculateQualityPerformance(project: ProjectManagement): number {
        return this.calculateAverageQuality(project);
    }

    private calculateResourcePerformance(project: ProjectManagement): number {
        return this.calculateResourceUtilization(project);
    }

    private calculateRiskPerformance(project: ProjectManagement): number {
        const risks = project.risks;
        if (risks.length === 0) return 1.0;

        const mitigatedRisks = risks.filter(r => r.status === 'mitigated' || r.status === 'resolved');
        return mitigatedRisks.length / risks.length;
    }

    private calculateEfficiency(project: ProjectManagement): number {
        if (project.tasks.length === 0) return 0;

        const totalEfficiency = project.tasks.reduce((sum, task) => {
            if (task.estimatedHours === 0) return sum;
            return sum + (task.estimatedHours / Math.max(task.actualHours, 1));
        }, 0);

        return totalEfficiency / project.tasks.length;
    }

    private calculateProductivity(project: ProjectManagement): number {
        if (project.tasks.length === 0) return 0;

        const completedTasks = project.tasks.filter(t => t.status === 'completed');
        return completedTasks.length / project.tasks.length;
    }

    private calculateSatisfaction(project: ProjectManagement): number {
        // 간단한 만족도 계산 (실제로는 설문조사 결과 기반)
        return 0.8;
    }

    private startOptimizationMonitoring(): void {
        setInterval(() => {
            if (!this.isRunning) return;

            // 모든 활성 프로젝트에 대해 최적화 모니터링
            this.projects.forEach((project, projectId) => {
                if (project.status === 'active') {
                    this.checkOptimizationNeeds(projectId);
                    this.updateProjectPerformance(projectId);
                }
            });

            this.updateAnalytics();
            this.cleanupOldData();
        }, 60000); // 1분마다 모니터링
    }

    private checkOptimizationNeeds(projectId: string): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        const settings = project.settings;

        // 자동 최적화 조건 확인
        if (settings.autoOptimization && project.performance.overallPerformance < settings.performanceThresholds.minimumSchedulePerformance) {
            console.log(`🔄 성과 기준 미달로 자동 최적화 실행: ${projectId}`);
            this.optimizeProject(projectId);
        }
    }

    private updateAnalytics(): void {
        const projects = Array.from(this.projects.values());

        this.analytics.totalProjects = projects.length;
        this.analytics.activeProjects = projects.filter(p => p.status === 'active').length;
        this.analytics.averagePerformance = projects.reduce((sum, p) => sum + p.performance.overallPerformance, 0) / projects.length;
        this.analytics.averageSchedulePerformance = projects.reduce((sum, p) => sum + p.performance.schedulePerformance, 0) / projects.length;
        this.analytics.averageCostPerformance = projects.reduce((sum, p) => sum + p.performance.costPerformance, 0) / projects.length;
        this.analytics.averageQualityPerformance = projects.reduce((sum, p) => sum + p.performance.qualityPerformance, 0) / projects.length;
        this.analytics.optimizationRate = projects.filter(p => p.optimization.status === 'completed').length / projects.length;
        this.analytics.riskMitigationRate = projects.reduce((sum, p) =>
            sum + p.risks.filter(r => r.status === 'mitigated' || r.status === 'resolved').length / Math.max(p.risks.length, 1), 0) / projects.length;
        this.analytics.resourceUtilization = projects.reduce((sum, p) => sum + this.calculateResourceUtilization(p), 0) / projects.length;
        this.analytics.stakeholderSatisfaction = projects.reduce((sum, p) => sum + p.performance.satisfaction, 0) / projects.length;
    }

    private cleanupOldData(): void {
        const now = Date.now();
        const maxAge = 90 * 24 * 60 * 60 * 1000; // 90일

        this.projects.forEach(project => {
            project.performance.trends = project.performance.trends.filter(
                trend => now - new Date(trend.period).getTime() < maxAge
            );
        });
    }

    private cleanupData(): void {
        this.projects.clear();
        console.log('🧹 프로젝트 데이터 정리 완료');
    }

    public getProjects(): ProjectManagement[] {
        return Array.from(this.projects.values());
    }

    public getProject(projectId: string): ProjectManagement | undefined {
        return this.projects.get(projectId);
    }

    public getAnalytics(): ProjectAnalytics {
        return { ...this.analytics };
    }

    public isSystemRunning(): boolean {
        return this.isRunning;
    }
}

const aiProjectManagementOptimizationSystem = new AIProjectManagementOptimizationSystem();
export default aiProjectManagementOptimizationSystem;
