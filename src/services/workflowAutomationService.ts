import { collaborationService } from './collaborationService';
import { projectKnowledgeService } from './projectKnowledgeService';
import { errorLogger, toError } from '../utils/errorLogger';

export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    type: 'manual' | 'automatic' | 'conditional' | 'notification' | 'approval';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    order: number;
    assignee?: string;
    dueDate?: Date;
    completedAt?: Date;
    metadata?: Record<string, unknown>;
    conditions?: WorkflowCondition[];
    actions?: WorkflowAction[];
}

export interface WorkflowCondition {
    id: string;
    type: 'message_count' | 'time_elapsed' | 'user_activity' | 'knowledge_threshold' | 'custom';
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
    value: unknown;
    field?: string;
    description: string;
}

export interface WorkflowAction {
    id: string;
    type: 'send_notification' | 'create_task' | 'update_status' | 'trigger_ai_analysis' | 'assign_user' | 'create_reminder' | 'export_data';
    target: string;
    parameters: Record<string, unknown>;
    description: string;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: 'development' | 'research' | 'marketing' | 'business' | 'custom';
    steps: Omit<WorkflowStep, 'id' | 'status' | 'completedAt'>[];
    triggers: WorkflowTrigger[];
    estimatedDuration: string;
    complexity: 'simple' | 'medium' | 'complex';
}

export interface WorkflowTrigger {
    id: string;
    type: 'project_created' | 'chat_started' | 'message_count' | 'time_based' | 'user_action' | 'knowledge_added';
    conditions: WorkflowCondition[];
    description: string;
}

export interface WorkflowInstance {
    id: string;
    projectId: string;
    templateId: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    currentStep: number;
    steps: WorkflowStep[];
    startedAt: Date;
    completedAt?: Date;
    metadata?: Record<string, unknown>;
    history: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
    id: string;
    timestamp: Date;
    action: string;
    stepId?: string;
    userId?: string;
    details: Record<string, unknown>;
}

export interface Notification {
    id: string;
    projectId: string;
    userId: string;
    type: 'workflow' | 'mention' | 'deadline' | 'milestone' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    createdAt: Date;
    readAt?: Date;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

export class WorkflowAutomationService {
    private readonly WORKFLOW_TEMPLATES_KEY = 'workflow_templates';
    private readonly WORKFLOW_INSTANCES_KEY = 'workflow_instances_';
    private readonly NOTIFICATIONS_KEY = 'notifications_';

    // 워크플로우 템플릿 관리
    getWorkflowTemplates(): WorkflowTemplate[] {
        const data = localStorage.getItem(this.WORKFLOW_TEMPLATES_KEY);
        return data ? JSON.parse(data) : this.getDefaultTemplates();
    }

    createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): WorkflowTemplate {
        const templates = this.getWorkflowTemplates();
        const newTemplate: WorkflowTemplate = {
            ...template,
            id: this.generateId()
        };

        templates.push(newTemplate);
        localStorage.setItem(this.WORKFLOW_TEMPLATES_KEY, JSON.stringify(templates));
        return newTemplate;
    }

    // 워크플로우 인스턴스 관리
    getProjectWorkflows(projectId: string): WorkflowInstance[] {
        const key = this.WORKFLOW_INSTANCES_KEY + projectId;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    createWorkflowInstance(projectId: string, templateId: string, name?: string): WorkflowInstance {
        const templates = this.getWorkflowTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            throw new Error('워크플로우 템플릿을 찾을 수 없습니다.');
        }

        const instance: WorkflowInstance = {
            id: this.generateId(),
            projectId,
            templateId,
            name: name || template.name,
            status: 'active',
            currentStep: 0,
            steps: template.steps.map((step, index) => ({
                ...step,
                id: this.generateId(),
                status: index === 0 ? 'in_progress' : 'pending',
                order: index
            })),
            startedAt: new Date(),
            history: [{
                id: this.generateId(),
                timestamp: new Date(),
                action: 'workflow_started',
                details: { templateName: template.name }
            }]
        };

        const instances = this.getProjectWorkflows(projectId);
        instances.push(instance);
        this.saveProjectWorkflows(projectId, instances);

        // 첫 번째 단계 실행
        this.executeWorkflowStep(instance.id, 0);

        return instance;
    }

    // 워크플로우 단계 실행
    async executeWorkflowStep(instanceId: string, stepIndex: number): Promise<void> {
        const instances = this.getAllWorkflowInstances();
        const instance = instances.find(i => i.id === instanceId);

        if (!instance || stepIndex >= instance.steps.length) {
            return;
        }

        const step = instance.steps[stepIndex];

        // 조건 확인
        if (step.conditions && step.conditions.length > 0) {
            const shouldExecute = await this.evaluateConditions(instance.projectId, step.conditions);
            if (!shouldExecute) {
                step.status = 'skipped';
                this.updateWorkflowInstance(instance);
                this.executeNextStep(instance, stepIndex + 1);
                return;
            }
        }

        // 단계 실행
        step.status = 'in_progress';
        this.updateWorkflowInstance(instance);

        try {
            await this.executeStepActions(instance.projectId, step);
            step.status = 'completed';
            step.completedAt = new Date();

            // 히스토리 추가
            instance.history.push({
                id: this.generateId(),
                timestamp: new Date(),
                action: 'step_completed',
                stepId: step.id,
                details: { stepName: step.name }
            });

            this.updateWorkflowInstance(instance);

            // 다음 단계 실행
            this.executeNextStep(instance, stepIndex + 1);

        } catch (error) {
            step.status = 'failed';
            this.updateWorkflowInstance(instance);
            const err = toError(error);
            errorLogger.error('워크플로우 단계 실행 실패', err, {
                component: 'workflowAutomationService',
                action: 'executeStep',
                workflowId: instance.id,
                stepId: step.id,
            });
        }
    }

    private async executeStepActions(projectId: string, step: WorkflowStep): Promise<void> {
        if (!step.actions) return;

        for (const action of step.actions) {
            await this.executeAction(projectId, action);
        }
    }

    private async executeAction(projectId: string, action: WorkflowAction): Promise<void> {
        switch (action.type) {
            case 'send_notification':
                await this.sendNotification(projectId, action.parameters);
                break;
            case 'create_task':
                await this.createTask(projectId, action.parameters);
                break;
            case 'update_status':
                await this.updateProjectStatus(projectId, action.parameters);
                break;
            case 'trigger_ai_analysis':
                await this.triggerAIAnalysis(projectId, action.parameters);
                break;
            case 'assign_user':
                await this.assignUser(projectId, action.parameters);
                break;
            case 'create_reminder':
                await this.createReminder(projectId, action.parameters);
                break;
            case 'export_data':
                await this.exportProjectData(projectId, action.parameters);
                break;
        }
    }

    // 조건 평가
    private async evaluateConditions(projectId: string, conditions: WorkflowCondition[]): Promise<boolean> {
        for (const condition of conditions) {
            const result = await this.evaluateCondition(projectId, condition);
            if (!result) return false;
        }
        return true;
    }

    private async evaluateCondition(projectId: string, condition: WorkflowCondition): Promise<boolean> {
        switch (condition.type) {
            case 'message_count':
                return this.evaluateMessageCount(projectId, condition);
            case 'time_elapsed':
                return this.evaluateTimeElapsed(projectId, condition);
            case 'user_activity':
                return this.evaluateUserActivity(projectId, condition);
            case 'knowledge_threshold':
                return this.evaluateKnowledgeThreshold(projectId, condition);
            default:
                return true;
        }
    }

    private evaluateMessageCount(projectId: string, condition: WorkflowCondition): boolean {
        const chats = collaborationService.getProjectComments(projectId);
        const count = chats.length;
        const val = Number(condition.value);

        switch (condition.operator) {
            case 'equals':
                return count === val;
            case 'greater_than':
                return count > val;
            case 'less_than':
                return count < val;
            default:
                return true;
        }
    }

    private evaluateTimeElapsed(projectId: string, condition: WorkflowCondition): boolean {
        const instances = this.getProjectWorkflows(projectId);
        if (instances.length === 0) return false;

        const startTime = instances[0].startedAt;
        const elapsed = Date.now() - startTime.getTime();
        const elapsedHours = elapsed / (1000 * 60 * 60);

        const val = Number(condition.value);
        switch (condition.operator) {
            case 'greater_than':
                return elapsedHours > val;
            case 'less_than':
                return elapsedHours < val;
            default:
                return true;
        }
    }

    private evaluateUserActivity(projectId: string, condition: WorkflowCondition): boolean {
        const users = collaborationService.getProjectUsers(projectId);
        const activeUsers = users.filter(u => {
            const lastActive = new Date(u.lastActive);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return lastActive > oneDayAgo;
        });

        const val = Number(condition.value);
        switch (condition.operator) {
            case 'equals':
                return activeUsers.length === val;
            case 'greater_than':
                return activeUsers.length > val;
            case 'less_than':
                return activeUsers.length < val;
            default:
                return true;
        }
    }

    private evaluateKnowledgeThreshold(projectId: string, condition: WorkflowCondition): boolean {
        const knowledge = projectKnowledgeService.getProjectKnowledge(projectId);
        const count = knowledge.length;
        const val = Number(condition.value);

        switch (condition.operator) {
            case 'equals':
                return count === val;
            case 'greater_than':
                return count > val;
            case 'less_than':
                return count < val;
            default:
                return true;
        }
    }

    // 다음 단계 실행
    private executeNextStep(instance: WorkflowInstance, nextStepIndex: number): void {
        if (nextStepIndex >= instance.steps.length) {
            // 워크플로우 완료
            instance.status = 'completed';
            instance.completedAt = new Date();
            instance.history.push({
                id: this.generateId(),
                timestamp: new Date(),
                action: 'workflow_completed',
                details: { totalSteps: instance.steps.length }
            });
            this.updateWorkflowInstance(instance);
            return;
        }

        instance.currentStep = nextStepIndex;
        this.updateWorkflowInstance(instance);

        // 다음 단계 실행 (비동기)
        setTimeout(() => {
            this.executeWorkflowStep(instance.id, nextStepIndex);
        }, 1000);
    }

    // 액션 실행 메서드들
    private async sendNotification(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        const users = collaborationService.getProjectUsers(projectId);
        const userId = parameters.userId ?? users[0]?.id;
        const title = parameters.title ?? '워크플로우 알림';
        const message = parameters.message ?? '새로운 워크플로우 단계가 시작되었습니다.';
        const priority = parameters.priority ?? 'medium';
        const actionUrl = parameters.actionUrl;
        const notification: Notification = {
            id: this.generateId(),
            projectId,
            userId: String(userId ?? ''),
            type: 'workflow',
            title: String(title),
            message: String(message),
            priority: (['low', 'medium', 'high', 'urgent'].includes(String(priority)) ? priority : 'medium') as Notification['priority'],
            isRead: false,
            createdAt: new Date(),
            actionUrl: typeof actionUrl === 'string' ? actionUrl : undefined
        };

        this.addNotification(notification);
    }

    private async createTask(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // 태스크 생성 로직 (실제 구현에서는 별도 서비스 필요)
        errorLogger.info('태스크 생성', {
            component: 'workflowAutomationService',
            action: 'createTask',
            projectId,
            parameters,
        });
    }

    private async updateProjectStatus(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // 프로젝트 상태 업데이트 로직
        errorLogger.info('프로젝트 상태 업데이트', {
            component: 'workflowAutomationService',
            action: 'updateProjectStatus',
            projectId,
            parameters,
        });
    }

    private async triggerAIAnalysis(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // AI 분석 트리거 로직
        errorLogger.info('AI 분석 트리거', {
            component: 'workflowAutomationService',
            action: 'triggerAIAnalysis',
            projectId,
            parameters,
        });
    }

    private async assignUser(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // 사용자 할당 로직
        errorLogger.info('사용자 할당', {
            component: 'workflowAutomationService',
            action: 'assignUser',
            projectId,
            parameters,
        });
    }

    private async createReminder(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // 리마인더 생성 로직
        errorLogger.info('리마인더 생성', {
            component: 'workflowAutomationService',
            action: 'createReminder',
            projectId,
            parameters,
        });
    }

    private async exportProjectData(projectId: string, parameters: Record<string, unknown>): Promise<void> {
        // 데이터 내보내기 로직
        errorLogger.info('데이터 내보내기', {
            component: 'workflowAutomationService',
            action: 'exportProjectData',
            projectId,
            parameters,
        });
    }

    // 알림 관리
    getProjectNotifications(projectId: string, userId?: string): Notification[] {
        const key = this.NOTIFICATIONS_KEY + projectId;
        const data = localStorage.getItem(key);
        const notifications: Notification[] = data ? JSON.parse(data) : [];

        if (userId) {
            return notifications.filter(n => n.userId === userId);
        }

        return notifications;
    }

    addNotification(notification: Notification): void {
        const notifications = this.getProjectNotifications(notification.projectId);
        notifications.push(notification);
        this.saveProjectNotifications(notification.projectId, notifications);
    }

    markNotificationAsRead(projectId: string, notificationId: string): void {
        const notifications = this.getProjectNotifications(projectId);
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            notification.readAt = new Date();
            this.saveProjectNotifications(projectId, notifications);
        }
    }

    // 유틸리티 메서드들
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private getAllWorkflowInstances(): WorkflowInstance[] {
        const allInstances: WorkflowInstance[] = [];
        const keys = Object.keys(localStorage);

        for (const key of keys) {
            if (key.startsWith(this.WORKFLOW_INSTANCES_KEY)) {
                const data = localStorage.getItem(key);
                if (data) {
                    allInstances.push(...JSON.parse(data));
                }
            }
        }

        return allInstances;
    }

    private updateWorkflowInstance(instance: WorkflowInstance): void {
        const instances = this.getProjectWorkflows(instance.projectId);
        const index = instances.findIndex(i => i.id === instance.id);

        if (index !== -1) {
            instances[index] = instance;
            this.saveProjectWorkflows(instance.projectId, instances);
        }
    }

    private saveProjectWorkflows(projectId: string, instances: WorkflowInstance[]): void {
        const key = this.WORKFLOW_INSTANCES_KEY + projectId;
        localStorage.setItem(key, JSON.stringify(instances));
    }

    private saveProjectNotifications(projectId: string, notifications: Notification[]): void {
        const key = this.NOTIFICATIONS_KEY + projectId;
        localStorage.setItem(key, JSON.stringify(notifications));
    }

    // 기본 템플릿 제공
    private getDefaultTemplates(): WorkflowTemplate[] {
        return [
            {
                id: 'development_workflow',
                name: '개발 프로젝트 워크플로우',
                description: '웹 개발 프로젝트를 위한 자동화된 워크플로우',
                category: 'development',
                complexity: 'medium',
                estimatedDuration: '2-4주',
                steps: [
                    {
                        name: '프로젝트 초기화',
                        description: '프로젝트 설정 및 팀 구성',
                        type: 'automatic',
                        order: 0,
                        actions: [
                            {
                                id: '1',
                                type: 'send_notification',
                                target: 'team',
                                parameters: {
                                    title: '프로젝트 시작',
                                    message: '새로운 개발 프로젝트가 시작되었습니다.',
                                    priority: 'high'
                                },
                                description: '팀원들에게 프로젝트 시작 알림'
                            }
                        ]
                    },
                    {
                        name: '요구사항 분석',
                        description: '프로젝트 요구사항 수집 및 분석',
                        type: 'manual',
                        order: 1,
                        conditions: [
                            {
                                id: '1',
                                type: 'message_count',
                                operator: 'greater_than',
                                value: 5,
                                description: '대화 메시지가 5개 이상일 때'
                            }
                        ],
                        actions: [
                            {
                                id: '2',
                                type: 'trigger_ai_analysis',
                                target: 'requirements',
                                parameters: {
                                    analysisType: 'requirements_extraction'
                                },
                                description: 'AI를 통한 요구사항 자동 추출'
                            }
                        ]
                    },
                    {
                        name: '기술 스택 결정',
                        description: '적합한 기술 스택 선정',
                        type: 'conditional',
                        order: 2,
                        conditions: [
                            {
                                id: '2',
                                type: 'knowledge_threshold',
                                operator: 'greater_than',
                                value: 10,
                                description: '지식베이스 항목이 10개 이상일 때'
                            }
                        ]
                    },
                    {
                        name: '개발 시작',
                        description: '실제 개발 작업 시작',
                        type: 'manual',
                        order: 3,
                        actions: [
                            {
                                id: '3',
                                type: 'create_task',
                                target: 'development',
                                parameters: {
                                    taskType: 'development_milestone',
                                    assignee: 'auto'
                                },
                                description: '개발 마일스톤 태스크 생성'
                            }
                        ]
                    }
                ],
                triggers: [
                    {
                        id: '1',
                        type: 'project_created',
                        conditions: [],
                        description: '프로젝트 생성 시 자동 시작'
                    }
                ]
            },
            {
                id: 'research_workflow',
                name: '연구 프로젝트 워크플로우',
                description: '연구 및 분석 프로젝트를 위한 워크플로우',
                category: 'research',
                complexity: 'complex',
                estimatedDuration: '1-3개월',
                steps: [
                    {
                        name: '연구 주제 정의',
                        description: '연구 주제 및 범위 설정',
                        type: 'manual',
                        order: 0
                    },
                    {
                        name: '문헌 조사',
                        description: '관련 문헌 및 자료 수집',
                        type: 'automatic',
                        order: 1,
                        actions: [
                            {
                                id: '1',
                                type: 'trigger_ai_analysis',
                                target: 'literature',
                                parameters: {
                                    analysisType: 'literature_review'
                                },
                                description: 'AI를 통한 문헌 분석'
                            }
                        ]
                    },
                    {
                        name: '데이터 수집',
                        description: '연구에 필요한 데이터 수집',
                        type: 'manual',
                        order: 2
                    },
                    {
                        name: '분석 및 결과 도출',
                        description: '데이터 분석 및 결과 정리',
                        type: 'conditional',
                        order: 3,
                        conditions: [
                            {
                                id: '1',
                                type: 'knowledge_threshold',
                                operator: 'greater_than',
                                value: 20,
                                description: '지식베이스 항목이 20개 이상일 때'
                            }
                        ]
                    }
                ],
                triggers: [
                    {
                        id: '1',
                        type: 'project_created',
                        conditions: [],
                        description: '프로젝트 생성 시 자동 시작'
                    }
                ]
            }
        ];
    }
}

export const workflowAutomationService = new WorkflowAutomationService();
export default workflowAutomationService;
