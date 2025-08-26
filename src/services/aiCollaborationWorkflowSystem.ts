import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// AI 협업 워크플로우 인터페이스 정의
export interface CollaborationWorkflow {
    workflowId: string;
    name: string;
    description: string;
    type: 'project' | 'meeting' | 'decision' | 'review' | 'innovation' | 'training';
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    teamId: string;
    participants: WorkflowParticipant[];
    stages: WorkflowStage[];
    currentStage: number;
    timeline: WorkflowTimeline;
    automation: WorkflowAutomation;
    analytics: WorkflowAnalytics;
    settings: WorkflowSettings;
}

export interface WorkflowParticipant {
    participantId: string;
    name: string;
    role: 'owner' | 'contributor' | 'reviewer' | 'approver' | 'observer';
    responsibilities: string[];
    permissions: string[];
    availability: ParticipantAvailability;
    performance: ParticipantPerformance;
}

export interface ParticipantAvailability {
    status: 'available' | 'busy' | 'away' | 'offline';
    nextAvailable: number;
    workingHours: WorkingHours;
    timezone: string;
    preferences: string[];
}

export interface WorkingHours {
    start: string;
    end: string;
    days: string[];
    breaks: BreakTime[];
}

export interface BreakTime {
    start: string;
    end: string;
    type: 'lunch' | 'coffee' | 'meeting' | 'other';
}

export interface ParticipantPerformance {
    completionRate: number;
    qualityScore: number;
    collaborationScore: number;
    responsiveness: number;
    initiative: number;
    reliability: number;
}

export interface WorkflowStage {
    stageId: string;
    name: string;
    description: string;
    type: 'planning' | 'execution' | 'review' | 'approval' | 'completion';
    status: 'pending' | 'active' | 'completed' | 'blocked';
    tasks: WorkflowTask[];
    dependencies: string[];
    estimatedDuration: number;
    actualDuration: number;
    startTime: number;
    endTime: number;
    automation: StageAutomation;
    metrics: StageMetrics;
}

export interface WorkflowTask {
    taskId: string;
    name: string;
    description: string;
    type: 'manual' | 'automated' | 'ai-assisted' | 'collaborative';
    status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee: string;
    collaborators: string[];
    estimatedEffort: number;
    actualEffort: number;
    startTime: number;
    endTime: number;
    dependencies: string[];
    automation: TaskAutomation;
    quality: TaskQuality;
}

export interface TaskAutomation {
    enabled: boolean;
    type: 'ai-assignment' | 'ai-optimization' | 'auto-scheduling' | 'smart-notification';
    rules: AutomationRule[];
    triggers: AutomationTrigger[];
    actions: AutomationAction[];
}

export interface AutomationRule {
    ruleId: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    enabled: boolean;
}

export interface AutomationTrigger {
    triggerId: string;
    type: 'time' | 'event' | 'condition' | 'manual';
    condition: string;
    frequency: string;
    enabled: boolean;
}

export interface AutomationAction {
    actionId: string;
    type: 'notification' | 'assignment' | 'escalation' | 'optimization' | 'integration';
    parameters: Record<string, any>;
    enabled: boolean;
}

export interface TaskQuality {
    score: number;
    criteria: QualityCriteria[];
    feedback: QualityFeedback[];
    improvements: string[];
}

export interface QualityCriteria {
    criterionId: string;
    name: string;
    weight: number;
    score: number;
    description: string;
}

export interface QualityFeedback {
    feedbackId: string;
    reviewer: string;
    rating: number;
    comments: string;
    timestamp: number;
}

export interface StageAutomation {
    enabled: boolean;
    autoTransition: boolean;
    smartRouting: boolean;
    bottleneckDetection: boolean;
    optimization: boolean;
    rules: AutomationRule[];
}

export interface StageMetrics {
    completionRate: number;
    averageDuration: number;
    qualityScore: number;
    participantSatisfaction: number;
    efficiency: number;
    bottlenecks: Bottleneck[];
}

export interface Bottleneck {
    bottleneckId: string;
    type: 'resource' | 'dependency' | 'approval' | 'communication';
    description: string;
    impact: number;
    duration: number;
    participants: string[];
    solutions: string[];
}

export interface WorkflowTimeline {
    startDate: number;
    endDate: number;
    milestones: Milestone[];
    deadlines: Deadline[];
    dependencies: TimelineDependency[];
    optimization: TimelineOptimization;
}

export interface Milestone {
    milestoneId: string;
    name: string;
    description: string;
    targetDate: number;
    actualDate: number;
    status: 'pending' | 'achieved' | 'delayed' | 'cancelled';
    participants: string[];
    impact: number;
}

export interface Deadline {
    deadlineId: string;
    name: string;
    date: number;
    type: 'soft' | 'hard' | 'critical';
    consequences: string[];
    participants: string[];
}

export interface TimelineDependency {
    dependencyId: string;
    from: string;
    to: string;
    type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    lag: number;
    critical: boolean;
}

export interface TimelineOptimization {
    enabled: boolean;
    algorithm: 'critical-path' | 'resource-leveling' | 'fast-tracking' | 'crashing';
    constraints: string[];
    objectives: string[];
    results: OptimizationResult[];
}

export interface OptimizationResult {
    resultId: string;
    algorithm: string;
    improvement: number;
    changes: string[];
    risks: string[];
    recommendations: string[];
}

export interface WorkflowAutomation {
    enabled: boolean;
    aiAssignment: boolean;
    smartScheduling: boolean;
    bottleneckDetection: boolean;
    qualityOptimization: boolean;
    performancePrediction: boolean;
    adaptiveRouting: boolean;
    rules: AutomationRule[];
    triggers: AutomationTrigger[];
    actions: AutomationAction[];
}

export interface WorkflowAnalytics {
    performance: WorkflowPerformance;
    efficiency: WorkflowEfficiency;
    quality: WorkflowQuality;
    collaboration: WorkflowCollaboration;
    predictions: WorkflowPrediction[];
    insights: WorkflowInsight[];
    recommendations: WorkflowRecommendation[];
}

export interface WorkflowPerformance {
    overallScore: number;
    completionRate: number;
    onTimeDelivery: number;
    qualityScore: number;
    efficiencyScore: number;
    participantSatisfaction: number;
    costEffectiveness: number;
}

export interface WorkflowEfficiency {
    cycleTime: number;
    leadTime: number;
    throughput: number;
    resourceUtilization: number;
    wasteReduction: number;
    automationRate: number;
    optimizationOpportunities: string[];
}

export interface WorkflowQuality {
    defectRate: number;
    reworkRate: number;
    customerSatisfaction: number;
    complianceScore: number;
    qualityMetrics: QualityMetric[];
    improvementAreas: string[];
}

export interface QualityMetric {
    metricId: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
}

export interface WorkflowCollaboration {
    communicationEffectiveness: number;
    teamCoordination: number;
    knowledgeSharing: number;
    conflictResolution: number;
    collaborationPatterns: CollaborationPattern[];
    improvementSuggestions: string[];
}

export interface CollaborationPattern {
    patternId: string;
    type: 'communication' | 'coordination' | 'decision-making' | 'problem-solving';
    frequency: number;
    effectiveness: number;
    participants: string[];
    description: string;
}

export interface WorkflowPrediction {
    predictionId: string;
    type: 'completion' | 'bottleneck' | 'quality' | 'resource' | 'risk';
    description: string;
    probability: number;
    timeframe: string;
    confidence: number;
    factors: string[];
    recommendations: string[];
}

export interface WorkflowInsight {
    insightId: string;
    category: 'performance' | 'efficiency' | 'quality' | 'collaboration' | 'automation';
    title: string;
    description: string;
    impact: number;
    confidence: number;
    urgency: 'low' | 'medium' | 'high';
    timestamp: number;
}

export interface WorkflowRecommendation {
    recommendationId: string;
    category: 'optimization' | 'automation' | 'collaboration' | 'quality' | 'timeline';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    impact: number;
    effort: 'low' | 'medium' | 'high';
    implementation: string;
    expectedOutcome: string;
}

export interface WorkflowSettings {
    autoOptimization: boolean;
    smartNotifications: boolean;
    adaptiveRouting: boolean;
    qualityGates: boolean;
    performanceMonitoring: boolean;
    collaborationEnhancement: boolean;
    aiAssistance: boolean;
    integrationEnabled: boolean;
}

export interface WorkflowMetrics {
    totalWorkflows: number;
    activeWorkflows: number;
    averageCompletionRate: number;
    averageEfficiency: number;
    automationRate: number;
    qualityScore: number;
    participantSatisfaction: number;
    optimizationOpportunities: number;
}

class AICollaborationWorkflowSystem {
    private workflows: Map<string, CollaborationWorkflow> = new Map();
    private isRunning: boolean = false;
    private metrics: WorkflowMetrics = {
        totalWorkflows: 0,
        activeWorkflows: 0,
        averageCompletionRate: 0,
        averageEfficiency: 0,
        automationRate: 0,
        qualityScore: 0,
        participantSatisfaction: 0,
        optimizationOpportunities: 0
    };

    constructor() {
        console.log('🤖 AI 기반 협업 워크플로우 자동화 시스템 초기화 중...');
    }

    public start(): void {
        if (this.isRunning) {
            console.log('⚠️ AI 기반 협업 워크플로우 자동화 시스템이 이미 실행 중입니다.');
            return;
        }

        this.isRunning = true;
        this.initializeSystem();
        this.createInitialWorkflows();
        this.startMetricsUpdate();

        console.log('✅ AI 기반 협업 워크플로우 자동화 시스템이 시작되었습니다.');
        realTimeAIAlertSystem.sendAlert('info', 'AI 기반 협업 워크플로우 자동화 시스템이 시작되었습니다.');
    }

    public stop(): void {
        if (!this.isRunning) {
            console.log('⚠️ AI 기반 협업 워크플로우 자동화 시스템이 실행 중이 아닙니다.');
            return;
        }

        this.isRunning = false;
        this.cleanupData();

        console.log('🛑 AI 기반 협업 워크플로우 자동화 시스템이 중지되었습니다.');
        realTimeAIAlertSystem.sendAlert('info', 'AI 기반 협업 워크플로우 자동화 시스템이 중지되었습니다.');
    }

    private initializeSystem(): void {
        console.log('🔧 워크플로우 자동화 시스템 초기화 중...');

        console.log('🧠 AI 작업 할당 엔진 초기화 완료');
        console.log('📅 스마트 스케줄링 시스템 초기화 완료');
        console.log('🔍 병목 감지 엔진 초기화 완료');
        console.log('🎯 품질 최적화 시스템 초기화 완료');
        console.log('📊 성능 예측 모델 초기화 완료');
        console.log('🔄 적응형 라우팅 시스템 초기화 완료');
    }

    private createInitialWorkflows(): void {
        const workflow1: CollaborationWorkflow = {
            workflowId: 'workflow-1',
            name: 'AI 프로젝트 개발 워크플로우',
            description: 'AI 기반 프로젝트 개발을 위한 최적화된 워크플로우',
            type: 'project',
            status: 'active',
            priority: 'high',
            teamId: 'team-1',
            participants: [
                {
                    participantId: 'participant-1',
                    name: '김개발',
                    role: 'owner',
                    responsibilities: ['프로젝트 관리', '기술 리더십', '품질 보증'],
                    permissions: ['read', 'write', 'approve', 'delete'],
                    availability: {
                        status: 'available',
                        nextAvailable: Date.now(),
                        workingHours: {
                            start: '09:00',
                            end: '18:00',
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                            breaks: [
                                { start: '12:00', end: '13:00', type: 'lunch' },
                                { start: '15:00', end: '15:15', type: 'coffee' }
                            ]
                        },
                        timezone: 'Asia/Seoul',
                        preferences: ['morning-meetings', 'detailed-documentation']
                    },
                    performance: {
                        completionRate: 0.95,
                        qualityScore: 0.9,
                        collaborationScore: 0.85,
                        responsiveness: 0.9,
                        initiative: 0.95,
                        reliability: 0.9
                    }
                },
                {
                    participantId: 'participant-2',
                    name: '이디자인',
                    role: 'contributor',
                    responsibilities: ['UI/UX 디자인', '사용자 경험 최적화'],
                    permissions: ['read', 'write'],
                    availability: {
                        status: 'available',
                        nextAvailable: Date.now(),
                        workingHours: {
                            start: '10:00',
                            end: '19:00',
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                            breaks: [
                                { start: '12:30', end: '13:30', type: 'lunch' },
                                { start: '16:00', end: '16:15', type: 'coffee' }
                            ]
                        },
                        timezone: 'Asia/Seoul',
                        preferences: ['creative-sessions', 'user-feedback']
                    },
                    performance: {
                        completionRate: 0.9,
                        qualityScore: 0.95,
                        collaborationScore: 0.8,
                        responsiveness: 0.85,
                        initiative: 0.9,
                        reliability: 0.85
                    }
                }
            ],
            stages: [
                {
                    stageId: 'stage-1',
                    name: '기획 및 설계',
                    description: '프로젝트 기획 및 시스템 설계 단계',
                    type: 'planning',
                    status: 'completed',
                    tasks: [
                        {
                            taskId: 'task-1',
                            name: '요구사항 분석',
                            description: '프로젝트 요구사항 상세 분석',
                            type: 'ai-assisted',
                            status: 'completed',
                            priority: 'high',
                            assignee: 'participant-1',
                            collaborators: ['participant-2'],
                            estimatedEffort: 8,
                            actualEffort: 7,
                            startTime: Date.now() - 86400000,
                            endTime: Date.now() - 86400000 + 25200000,
                            dependencies: [],
                            automation: {
                                enabled: true,
                                type: 'ai-optimization',
                                rules: [],
                                triggers: [],
                                actions: []
                            },
                            quality: {
                                score: 0.9,
                                criteria: [],
                                feedback: [],
                                improvements: []
                            }
                        }
                    ],
                    dependencies: [],
                    estimatedDuration: 5,
                    actualDuration: 4,
                    startTime: Date.now() - 86400000,
                    endTime: Date.now() - 86400000 + 172800000,
                    automation: {
                        enabled: true,
                        autoTransition: true,
                        smartRouting: true,
                        bottleneckDetection: true,
                        optimization: true,
                        rules: []
                    },
                    metrics: {
                        completionRate: 1.0,
                        averageDuration: 4,
                        qualityScore: 0.9,
                        participantSatisfaction: 0.85,
                        efficiency: 0.9,
                        bottlenecks: []
                    }
                },
                {
                    stageId: 'stage-2',
                    name: '개발 및 구현',
                    description: 'AI 시스템 개발 및 구현 단계',
                    type: 'execution',
                    status: 'active',
                    tasks: [
                        {
                            taskId: 'task-2',
                            name: 'AI 모델 개발',
                            description: '핵심 AI 모델 개발 및 구현',
                            type: 'ai-assisted',
                            status: 'in-progress',
                            priority: 'critical',
                            assignee: 'participant-1',
                            collaborators: ['participant-2'],
                            estimatedEffort: 40,
                            actualEffort: 25,
                            startTime: Date.now() - 43200000,
                            endTime: 0,
                            dependencies: ['task-1'],
                            automation: {
                                enabled: true,
                                type: 'ai-optimization',
                                rules: [],
                                triggers: [],
                                actions: []
                            },
                            quality: {
                                score: 0.85,
                                criteria: [],
                                feedback: [],
                                improvements: []
                            }
                        }
                    ],
                    dependencies: ['stage-1'],
                    estimatedDuration: 10,
                    actualDuration: 5,
                    startTime: Date.now() - 43200000,
                    endTime: 0,
                    automation: {
                        enabled: true,
                        autoTransition: true,
                        smartRouting: true,
                        bottleneckDetection: true,
                        optimization: true,
                        rules: []
                    },
                    metrics: {
                        completionRate: 0.5,
                        averageDuration: 5,
                        qualityScore: 0.85,
                        participantSatisfaction: 0.8,
                        efficiency: 0.8,
                        bottlenecks: []
                    }
                }
            ],
            currentStage: 1,
            timeline: {
                startDate: Date.now() - 86400000,
                endDate: Date.now() + 604800000,
                milestones: [
                    {
                        milestoneId: 'milestone-1',
                        name: '기획 완료',
                        description: '프로젝트 기획 및 설계 완료',
                        targetDate: Date.now() - 86400000 + 172800000,
                        actualDate: Date.now() - 86400000 + 172800000,
                        status: 'achieved',
                        participants: ['participant-1', 'participant-2'],
                        impact: 0.3
                    }
                ],
                deadlines: [
                    {
                        deadlineId: 'deadline-1',
                        name: '개발 완료',
                        date: Date.now() + 518400000,
                        type: 'hard',
                        consequences: ['프로젝트 지연', '추가 비용 발생'],
                        participants: ['participant-1', 'participant-2']
                    }
                ],
                dependencies: [],
                optimization: {
                    enabled: true,
                    algorithm: 'critical-path',
                    constraints: ['리소스 가용성', '품질 요구사항'],
                    objectives: ['일정 단축', '비용 최적화'],
                    results: []
                }
            },
            automation: {
                enabled: true,
                aiAssignment: true,
                smartScheduling: true,
                bottleneckDetection: true,
                qualityOptimization: true,
                performancePrediction: true,
                adaptiveRouting: true,
                rules: [],
                triggers: [],
                actions: []
            },
            analytics: {
                performance: {
                    overallScore: 0.85,
                    completionRate: 0.5,
                    onTimeDelivery: 0.8,
                    qualityScore: 0.85,
                    efficiencyScore: 0.8,
                    participantSatisfaction: 0.8,
                    costEffectiveness: 0.75
                },
                efficiency: {
                    cycleTime: 5,
                    leadTime: 8,
                    throughput: 0.2,
                    resourceUtilization: 0.8,
                    wasteReduction: 0.15,
                    automationRate: 0.6,
                    optimizationOpportunities: ['자동화 확대', '병목 제거']
                },
                quality: {
                    defectRate: 0.05,
                    reworkRate: 0.1,
                    customerSatisfaction: 0.85,
                    complianceScore: 0.9,
                    qualityMetrics: [],
                    improvementAreas: ['코드 품질', '문서화']
                },
                collaboration: {
                    communicationEffectiveness: 0.8,
                    teamCoordination: 0.85,
                    knowledgeSharing: 0.75,
                    conflictResolution: 0.9,
                    collaborationPatterns: [],
                    improvementSuggestions: ['정기 미팅', '지식 공유 세션']
                },
                predictions: [],
                insights: [],
                recommendations: []
            },
            settings: {
                autoOptimization: true,
                smartNotifications: true,
                adaptiveRouting: true,
                qualityGates: true,
                performanceMonitoring: true,
                collaborationEnhancement: true,
                aiAssistance: true,
                integrationEnabled: true
            }
        };

        this.workflows.set(workflow1.workflowId, workflow1);
        this.analyzeWorkflow(workflow1.workflowId);
        console.log('📋 초기 AI 협업 워크플로우 생성 완료');
    }

    public addWorkflow(workflow: Omit<CollaborationWorkflow, 'workflowId' | 'analytics'>): CollaborationWorkflow {
        const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const fullWorkflow: CollaborationWorkflow = {
            ...workflow,
            workflowId,
            analytics: {
                performance: {
                    overallScore: 0,
                    completionRate: 0,
                    onTimeDelivery: 0,
                    qualityScore: 0,
                    efficiencyScore: 0,
                    participantSatisfaction: 0,
                    costEffectiveness: 0
                },
                efficiency: {
                    cycleTime: 0,
                    leadTime: 0,
                    throughput: 0,
                    resourceUtilization: 0,
                    wasteReduction: 0,
                    automationRate: 0,
                    optimizationOpportunities: []
                },
                quality: {
                    defectRate: 0,
                    reworkRate: 0,
                    customerSatisfaction: 0,
                    complianceScore: 0,
                    qualityMetrics: [],
                    improvementAreas: []
                },
                collaboration: {
                    communicationEffectiveness: 0,
                    teamCoordination: 0,
                    knowledgeSharing: 0,
                    conflictResolution: 0,
                    collaborationPatterns: [],
                    improvementSuggestions: []
                },
                predictions: [],
                insights: [],
                recommendations: []
            }
        };

        this.workflows.set(workflowId, fullWorkflow);
        this.analyzeWorkflow(workflowId);
        this.updateWorkflowMetrics(workflowId);

        console.log(`🤖 새로운 워크플로우 추가: ${workflowId}`);
        return fullWorkflow;
    }

    public updateTaskStatus(workflowId: string, stageId: string, taskId: string, status: string): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        const stage = workflow.stages.find(s => s.stageId === stageId);
        if (!stage) return;

        const task = stage.tasks.find(t => t.taskId === taskId);
        if (!task) return;

        task.status = status as any;
        if (status === 'completed') {
            task.endTime = Date.now();
        }

        this.updateWorkflowMetrics(workflowId);
        this.generateWorkflowInsights(workflowId);
        this.optimizeWorkflow(workflowId);
    }

    private analyzeWorkflow(workflowId: string): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        // 워크플로우 분석 로직
        this.calculatePerformanceMetrics(workflow);
        this.detectBottlenecks(workflow);
        this.generatePredictions(workflow);
        this.createRecommendations(workflow);
    }

    private calculatePerformanceMetrics(workflow: CollaborationWorkflow): void {
        const analytics = workflow.analytics;

        // 성과 지표 계산
        analytics.performance.completionRate = this.calculateCompletionRate(workflow);
        analytics.performance.qualityScore = this.calculateQualityScore(workflow);
        analytics.performance.efficiencyScore = this.calculateEfficiencyScore(workflow);
        analytics.performance.overallScore = this.calculateOverallScore(analytics.performance);

        // 효율성 지표 계산
        analytics.efficiency.cycleTime = this.calculateCycleTime(workflow);
        analytics.efficiency.throughput = this.calculateThroughput(workflow);
        analytics.efficiency.automationRate = this.calculateAutomationRate(workflow);
    }

    private calculateCompletionRate(workflow: CollaborationWorkflow): number {
        const completedStages = workflow.stages.filter(stage => stage.status === 'completed').length;
        return completedStages / workflow.stages.length;
    }

    private calculateQualityScore(workflow: CollaborationWorkflow): number {
        const allTasks = workflow.stages.flatMap(stage => stage.tasks);
        const completedTasks = allTasks.filter(task => task.status === 'completed');

        if (completedTasks.length === 0) return 0;

        const totalQuality = completedTasks.reduce((sum, task) => sum + task.quality.score, 0);
        return totalQuality / completedTasks.length;
    }

    private calculateEfficiencyScore(workflow: CollaborationWorkflow): number {
        const allTasks = workflow.stages.flatMap(stage => stage.tasks);
        const completedTasks = allTasks.filter(task => task.status === 'completed');

        if (completedTasks.length === 0) return 0;

        const efficiencyScores = completedTasks.map(task => {
            if (task.actualEffort === 0) return 1;
            return Math.min(task.estimatedEffort / task.actualEffort, 1);
        });

        return efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
    }

    private calculateOverallScore(performance: WorkflowPerformance): number {
        return (
            performance.completionRate * 0.3 +
            performance.qualityScore * 0.25 +
            performance.efficiencyScore * 0.25 +
            performance.participantSatisfaction * 0.2
        );
    }

    private calculateCycleTime(workflow: CollaborationWorkflow): number {
        const completedStages = workflow.stages.filter(stage => stage.status === 'completed');
        if (completedStages.length === 0) return 0;

        const totalDuration = completedStages.reduce((sum, stage) => sum + stage.actualDuration, 0);
        return totalDuration / completedStages.length;
    }

    private calculateThroughput(workflow: CollaborationWorkflow): number {
        const completedTasks = workflow.stages.flatMap(stage => stage.tasks).filter(task => task.status === 'completed');
        const totalTime = workflow.timeline.endDate - workflow.timeline.startDate;

        if (totalTime === 0) return 0;
        return completedTasks.length / (totalTime / (1000 * 60 * 60 * 24)); // tasks per day
    }

    private calculateAutomationRate(workflow: CollaborationWorkflow): number {
        const allTasks = workflow.stages.flatMap(stage => stage.tasks);
        const automatedTasks = allTasks.filter(task => task.automation.enabled);

        return allTasks.length > 0 ? automatedTasks.length / allTasks.length : 0;
    }

    private detectBottlenecks(workflow: CollaborationWorkflow): void {
        const bottlenecks: Bottleneck[] = [];

        // 병목 감지 로직
        workflow.stages.forEach(stage => {
            if (stage.status === 'blocked') {
                bottlenecks.push({
                    bottleneckId: `bottleneck-${Date.now()}`,
                    type: 'dependency',
                    description: `${stage.name} 단계가 차단되었습니다.`,
                    impact: 0.8,
                    duration: stage.actualDuration - stage.estimatedDuration,
                    participants: stage.tasks.map(task => task.assignee),
                    solutions: ['의존성 해결', '리소스 재할당', '우선순위 조정']
                });
            }
        });

        workflow.stages.forEach(stage => {
            stage.metrics.bottlenecks = bottlenecks.filter(b =>
                b.participants.some(p => stage.tasks.some(t => t.assignee === p))
            );
        });
    }

    private generatePredictions(workflow: CollaborationWorkflow): void {
        const predictions: WorkflowPrediction[] = [];

        // 완료 예측
        const completionPrediction: WorkflowPrediction = {
            predictionId: `pred-${Date.now()}`,
            type: 'completion',
            description: '현재 진행률을 기반으로 한 완료 예측',
            probability: 0.85,
            timeframe: '2주 후',
            confidence: 0.8,
            factors: ['현재 진행률', '팀 성과', '자동화 수준'],
            recommendations: ['자동화 확대', '리소스 추가 배정']
        };

        predictions.push(completionPrediction);
        workflow.analytics.predictions = predictions;
    }

    private createRecommendations(workflow: CollaborationWorkflow): void {
        const recommendations: WorkflowRecommendation[] = [];

        // 최적화 추천
        if (workflow.analytics.efficiency.automationRate < 0.7) {
            recommendations.push({
                recommendationId: `rec-${Date.now()}`,
                category: 'automation',
                title: '자동화 확대',
                description: '워크플로우 자동화 수준을 높여 효율성을 개선하세요.',
                priority: 'high',
                impact: 0.8,
                effort: 'medium',
                implementation: 'AI 기반 작업 할당 및 스케줄링 자동화',
                expectedOutcome: '효율성 20% 향상, 완료 시간 단축'
            });
        }

        workflow.analytics.recommendations = recommendations;
    }

    private generateWorkflowInsights(workflowId: string): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        const insight: WorkflowInsight = {
            insightId: `insight-${Date.now()}`,
            category: 'performance',
            title: '워크플로우 성과 최적화 기회',
            description: '현재 워크플로우에서 성과 개선 가능한 영역이 발견되었습니다.',
            impact: 0.7,
            confidence: 0.8,
            urgency: 'medium',
            timestamp: Date.now()
        };

        workflow.analytics.insights.push(insight);
    }

    private optimizeWorkflow(workflowId: string): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        // 워크플로우 최적화 로직
        this.optimizeTaskAssignment(workflow);
        this.optimizeScheduling(workflow);
        this.optimizeAutomation(workflow);
    }

    private optimizeTaskAssignment(workflow: CollaborationWorkflow): void {
        // AI 기반 작업 할당 최적화
        workflow.stages.forEach(stage => {
            stage.tasks.forEach(task => {
                if (task.status === 'pending') {
                    // 참가자 성과를 기반으로 최적 할당
                    const bestParticipant = this.findBestParticipant(workflow, task);
                    if (bestParticipant) {
                        task.assignee = bestParticipant;
                    }
                }
            });
        });
    }

    private findBestParticipant(workflow: CollaborationWorkflow, task: WorkflowTask): string | null {
        const availableParticipants = workflow.participants.filter(p =>
            p.availability.status === 'available'
        );

        if (availableParticipants.length === 0) return null;

        // 성과 점수를 기반으로 최적 참가자 선택
        return availableParticipants.reduce((best, current) =>
            current.performance.overallScore > best.performance.overallScore ? current : best
        ).participantId;
    }

    private optimizeScheduling(workflow: CollaborationWorkflow): void {
        // 스마트 스케줄링 최적화
        workflow.stages.forEach(stage => {
            if (stage.status === 'pending') {
                // 의존성과 리소스 가용성을 고려한 최적 스케줄링
                const optimalStartTime = this.calculateOptimalStartTime(workflow, stage);
                stage.startTime = optimalStartTime;
            }
        });
    }

    private calculateOptimalStartTime(workflow: CollaborationWorkflow, stage: WorkflowStage): number {
        // 의존성 완료 시간과 참가자 가용성을 고려한 최적 시작 시간 계산
        const dependencyEndTime = this.getDependencyEndTime(workflow, stage);
        const participantAvailability = this.getEarliestParticipantAvailability(workflow, stage);

        return Math.max(dependencyEndTime, participantAvailability);
    }

    private getDependencyEndTime(workflow: CollaborationWorkflow, stage: WorkflowStage): number {
        if (stage.dependencies.length === 0) return Date.now();

        const dependencyStages = workflow.stages.filter(s =>
            stage.dependencies.includes(s.stageId)
        );

        if (dependencyStages.length === 0) return Date.now();

        return Math.max(...dependencyStages.map(s => s.endTime));
    }

    private getEarliestParticipantAvailability(workflow: CollaborationWorkflow, stage: WorkflowStage): number {
        const participants = stage.tasks.map(task => task.assignee);
        const participantData = workflow.participants.filter(p =>
            participants.includes(p.participantId)
        );

        if (participantData.length === 0) return Date.now();

        return Math.max(...participantData.map(p => p.availability.nextAvailable));
    }

    private optimizeAutomation(workflow: CollaborationWorkflow): void {
        // 자동화 최적화
        workflow.stages.forEach(stage => {
            stage.tasks.forEach(task => {
                if (task.type === 'manual' && this.canAutomate(task)) {
                    task.type = 'ai-assisted';
                    task.automation.enabled = true;
                }
            });
        });
    }

    private canAutomate(task: WorkflowTask): boolean {
        // 작업 자동화 가능성 판단
        const automationCriteria = [
            task.estimatedEffort > 4, // 4시간 이상 소요되는 작업
            task.dependencies.length === 0, // 의존성이 없는 작업
            task.priority !== 'critical' // 중요도가 높지 않은 작업
        ];

        return automationCriteria.every(criterion => criterion);
    }

    private updateWorkflowMetrics(workflowId: string): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        // 워크플로우별 지표 업데이트
        this.updateGlobalMetrics();
    }

    private updateGlobalMetrics(): void {
        const workflows = Array.from(this.workflows.values());

        this.metrics.totalWorkflows = workflows.length;
        this.metrics.activeWorkflows = workflows.filter(w => w.status === 'active').length;
        this.metrics.averageCompletionRate = workflows.reduce((sum, w) =>
            sum + w.analytics.performance.completionRate, 0) / workflows.length;
        this.metrics.averageEfficiency = workflows.reduce((sum, w) =>
            sum + w.analytics.performance.efficiencyScore, 0) / workflows.length;
        this.metrics.automationRate = workflows.reduce((sum, w) =>
            sum + w.analytics.efficiency.automationRate, 0) / workflows.length;
        this.metrics.qualityScore = workflows.reduce((sum, w) =>
            sum + w.analytics.performance.qualityScore, 0) / workflows.length;
        this.metrics.participantSatisfaction = workflows.reduce((sum, w) =>
            sum + w.analytics.performance.participantSatisfaction, 0) / workflows.length;
        this.metrics.optimizationOpportunities = workflows.reduce((sum, w) =>
            sum + w.analytics.recommendations.length, 0);
    }

    private startMetricsUpdate(): void {
        setInterval(() => {
            if (!this.isRunning) return;

            this.updateGlobalMetrics();
            this.cleanupOldData();
        }, 30000); // 30초마다 업데이트
    }

    private cleanupOldData(): void {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30일

        this.workflows.forEach(workflow => {
            workflow.analytics.insights = workflow.analytics.insights.filter(
                insight => now - insight.timestamp < maxAge
            );
            workflow.analytics.predictions = workflow.analytics.predictions.filter(
                prediction => now - prediction.timestamp < maxAge
            );
        });
    }

    private cleanupData(): void {
        this.workflows.clear();
        console.log('🧹 워크플로우 데이터 정리 완료');
    }

    public getWorkflows(): CollaborationWorkflow[] {
        return Array.from(this.workflows.values());
    }

    public getWorkflow(workflowId: string): CollaborationWorkflow | undefined {
        return this.workflows.get(workflowId);
    }

    public getMetrics(): WorkflowMetrics {
        return { ...this.metrics };
    }

    public isSystemRunning(): boolean {
        return this.isRunning;
    }
}

const aiCollaborationWorkflowSystem = new AICollaborationWorkflowSystem();
export default aiCollaborationWorkflowSystem;
