import { EventEmitter } from 'events';
import realTimeAIAlertSystem from './realTimeAIAlertSystem';
import aiHealthMonitor from './aiHealthMonitor';
import advancedAISecuritySystem from './advancedAISecuritySystem';
import aiCacheManager from './aiCacheManager';
import { errorLogger, toError } from '../utils/errorLogger';

// 인터페이스 정의
export interface WorkflowTask {
    id: string;
    name: string;
    type: 'ai_processing' | 'data_analysis' | 'notification' | 'system_maintenance' | 'security_check' | 'report_generation';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: Date;
    started_at?: Date;
    completed_at?: Date;
    duration?: number; // ms
    input_data: unknown;
    output_data?: unknown;
    error_message?: string;
    retry_count: number;
    max_retries: number;
    dependencies: string[]; // task IDs
    assigned_worker?: string;
    progress: number; // 0-100
    metadata?: Record<string, unknown>;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'completed' | 'failed';
    created_at: Date;
    started_at?: Date;
    completed_at?: Date;
    tasks: WorkflowTask[];
    trigger_type: 'manual' | 'scheduled' | 'event' | 'condition';
    trigger_config?: Record<string, unknown>;
    success_rate: number; // 0-100
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    average_duration: number; // ms
    next_run?: Date;
    enabled: boolean;
}

export interface WorkflowWorker {
    id: string;
    name: string;
    type: 'ai_processor' | 'data_analyzer' | 'system_monitor' | 'security_scanner' | 'report_generator';
    status: 'idle' | 'busy' | 'offline' | 'error';
    current_task?: string;
    processed_tasks: number;
    success_rate: number;
    average_processing_time: number; // ms
    last_activity: Date;
    capabilities: string[];
    max_concurrent_tasks: number;
    current_load: number; // 0-100
}

export interface WorkflowSchedule {
    id: string;
    workflow_id: string;
    schedule_type: 'interval' | 'cron' | 'daily' | 'weekly' | 'monthly';
    schedule_config: Record<string, unknown>;
    enabled: boolean;
    next_execution: Date;
    last_execution?: Date;
    execution_count: number;
}

export interface WorkflowMetrics {
    total_workflows: number;
    active_workflows: number;
    completed_workflows: number;
    failed_workflows: number;
    total_tasks: number;
    pending_tasks: number;
    running_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    average_workflow_duration: number;
    success_rate: number;
    worker_utilization: number;
    queue_size: number;
}

// AI 자동화 워크플로우 시스템 클래스
export class AIAutomationWorkflowSystem extends EventEmitter {
    private workflows: Map<string, Workflow> = new Map();
    private tasks: Map<string, WorkflowTask> = new Map();
    private workers: Map<string, WorkflowWorker> = new Map();
    private schedules: Map<string, WorkflowSchedule> = new Map();
    private taskQueue: WorkflowTask[] = [];
    private isRunning: boolean = false;
    private workflowCounter: number = 0;
    private taskCounter: number = 0;
    private processingInterval: NodeJS.Timeout | null = null;
    private scheduleInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.initializeWorkers();
        this.initializeDefaultWorkflows();
        errorLogger.info('AI 자동화 워크플로우 시스템이 초기화되었습니다', {
            component: 'aiAutomationWorkflowSystem',
            action: 'constructor',
        });
    }

    // 시스템 시작
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startProcessing();
        this.startScheduler();
        errorLogger.info('AI 자동화 워크플로우 시스템이 시작되었습니다', {
            component: 'aiAutomationWorkflowSystem',
            action: 'start',
        });
    }

    // 시스템 중지
    public stop(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        if (this.scheduleInterval) {
            clearInterval(this.scheduleInterval);
            this.scheduleInterval = null;
        }
        this.isRunning = false;
        errorLogger.info('AI 자동화 워크플로우 시스템이 중지되었습니다', {
            component: 'aiAutomationWorkflowSystem',
            action: 'stop',
        });
    }

    // 워크플로우 생성
    public createWorkflow(workflowData: {
        name: string;
        description: string;
        tasks: Omit<WorkflowTask, 'id' | 'created_at' | 'status' | 'retry_count' | 'progress'>[];
        trigger_type: Workflow['trigger_type'];
        trigger_config?: Record<string, unknown>;
        enabled?: boolean;
    }): string {
        const workflowId = `workflow-${Date.now()}-${++this.workflowCounter}`;

        const tasks: WorkflowTask[] = workflowData.tasks.map((taskData, index) => ({
            ...taskData,
            id: `task-${Date.now()}-${++this.taskCounter}-${index}`,
            created_at: new Date(),
            status: 'pending',
            retry_count: 0,
            progress: 0
        }));

        const workflow: Workflow = {
            id: workflowId,
            name: workflowData.name,
            description: workflowData.description,
            status: 'active',
            created_at: new Date(),
            tasks,
            trigger_type: workflowData.trigger_type,
            trigger_config: workflowData.trigger_config,
            success_rate: 0,
            total_runs: 0,
            successful_runs: 0,
            failed_runs: 0,
            average_duration: 0,
            enabled: workflowData.enabled !== false
        };

        this.workflows.set(workflowId, workflow);

        // 태스크들을 개별적으로 저장
        tasks.forEach(task => {
            this.tasks.set(task.id, task);
        });

        this.emit('workflow_created', workflow);
        errorLogger.info('워크플로우 생성', {
            component: 'aiAutomationWorkflowSystem',
            action: 'createWorkflow',
            workflowId,
            workflowName: workflow.name,
        });

        return workflowId;
    }

    // 워크플로우 실행
    public async executeWorkflow(workflowId: string, inputData?: unknown): Promise<boolean> {
        const workflow = this.workflows.get(workflowId);
        if (!workflow || !workflow.enabled) {
            return false;
        }

        try {
            errorLogger.info('워크플로우 실행 시작', {
                component: 'aiAutomationWorkflowSystem',
                action: 'executeWorkflow',
                workflowId,
                workflowName: workflow.name,
            });

            workflow.status = 'active';
            workflow.started_at = new Date();
            workflow.total_runs++;

            // 의존성이 없는 태스크들을 큐에 추가
            const readyTasks = workflow.tasks.filter(task =>
                task.dependencies.length === 0 && task.status === 'pending'
            );

            for (const task of readyTasks) {
                const current = (task.input_data ?? {}) as Record<string, unknown>;
                const merged = (inputData ?? {}) as Record<string, unknown>;
                task.input_data = { ...current, ...merged };
                this.enqueueTask(task);
            }

            this.emit('workflow_started', workflow);
            return true;

        } catch (error) {
            const err = toError(error);
            errorLogger.error('워크플로우 실행 오류', err, {
                component: 'aiAutomationWorkflowSystem',
                action: 'executeWorkflow',
                workflowId,
                workflowName: workflow.name,
            });
            workflow.status = 'failed';
            workflow.failed_runs++;
            return false;
        }
    }

    // 태스크 큐에 추가
    private enqueueTask(task: WorkflowTask): void {
        task.status = 'pending';
        this.taskQueue.push(task);
        this.taskQueue.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        this.emit('task_enqueued', task);
        errorLogger.info('태스크 큐 추가', {
            component: 'aiAutomationWorkflowSystem',
            action: 'enqueueTask',
            taskId: task.id,
            taskName: task.name,
            priority: task.priority,
        });
    }

    // 태스크 처리
    private async processTask(task: WorkflowTask, worker: WorkflowWorker): Promise<boolean> {
        try {
            errorLogger.info('태스크 처리 시작', {
                component: 'aiAutomationWorkflowSystem',
                action: 'processTask',
                taskId: task.id,
                taskName: task.name,
                workerId: worker.id,
                workerName: worker.name,
            });

            task.status = 'running';
            task.started_at = new Date();
            task.assigned_worker = worker.id;

            worker.status = 'busy';
            worker.current_task = task.id;
            worker.current_load = Math.min(100, worker.current_load + 20);

            this.emit('task_started', { task, worker });

            // 태스크 타입별 처리
            const result = await this.executeTaskByType(task);

            if (result.success) {
                task.status = 'completed';
                task.completed_at = new Date();
                task.duration = task.completed_at.getTime() - (task.started_at?.getTime() || 0);
                task.output_data = result.output;
                task.progress = 100;

                // 워커 통계 업데이트
                worker.processed_tasks++;
                worker.last_activity = new Date();

                errorLogger.info('태스크 완료', {
                    component: 'aiAutomationWorkflowSystem',
                    action: 'processTask',
                    taskId: task.id,
                    taskName: task.name,
                    duration: task.duration,
                });
                this.emit('task_completed', { task, worker });

                // 의존성 태스크 확인
                await this.checkDependentTasks(task);

                return true;
            } else {
                throw new Error(result.error || '태스크 처리 실패');
            }

        } catch (error) {
            const err = toError(error);
            errorLogger.error('태스크 처리 실패', err, {
                component: 'aiAutomationWorkflowSystem',
                action: 'processTask',
                taskId: task.id,
                taskName: task.name,
                retryCount: task.retry_count,
            });

            task.status = 'failed';
            task.error_message = error instanceof Error ? error.message : 'Unknown error';
            task.retry_count++;

            // 재시도 로직
            if (task.retry_count < task.max_retries) {
                errorLogger.info('태스크 재시도', {
                    component: 'aiAutomationWorkflowSystem',
                    action: 'processTask',
                    taskId: task.id,
                    taskName: task.name,
                    retryCount: task.retry_count,
                    maxRetries: task.max_retries,
                });
                setTimeout(() => {
                    task.status = 'pending';
                    this.enqueueTask(task);
                }, 5000 * task.retry_count); // 지수적 백오프
            } else {
                errorLogger.error('태스크 최종 실패', {
                    component: 'aiAutomationWorkflowSystem',
                    action: 'processTask',
                    taskId: task.id,
                    taskName: task.name,
                    retryCount: task.retry_count,
                    maxRetries: task.max_retries,
                });
                this.emit('task_failed', { task, worker });
            }

            return false;
        } finally {
            // 워커 상태 정리
            worker.status = 'idle';
            worker.current_task = undefined;
            worker.current_load = Math.max(0, worker.current_load - 20);
        }
    }

    // 태스크 타입별 실행
    private async executeTaskByType(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        switch (task.type) {
            case 'ai_processing':
                return await this.executeAIProcessingTask(task);
            case 'data_analysis':
                return await this.executeDataAnalysisTask(task);
            case 'notification':
                return await this.executeNotificationTask(task);
            case 'system_maintenance':
                return await this.executeSystemMaintenanceTask(task);
            case 'security_check':
                return await this.executeSecurityCheckTask(task);
            case 'report_generation':
                return await this.executeReportGenerationTask(task);
            default:
                return { success: false, error: `알 수 없는 태스크 타입: ${task.type}` };
        }
    }

    // AI 처리 태스크 실행
    private async executeAIProcessingTask(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            // AI 처리 로직 시뮬레이션
            await this.simulateProcessing(2000 + Math.random() * 3000);

            const result = {
                processed_at: new Date(),
                input_size: JSON.stringify(task.input_data).length,
                processing_time: task.duration,
                confidence_score: 0.8 + Math.random() * 0.2,
                insights: ['패턴 감지됨', 'anomaly 없음', '정상 처리 완료']
            };

            return { success: true, output: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'AI 처리 실패' };
        }
    }

    // 데이터 분석 태스크 실행
    private async executeDataAnalysisTask(_task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            await this.simulateProcessing(1500 + Math.random() * 2000);

            const result = {
                analyzed_at: new Date(),
                data_points: Math.floor(Math.random() * 10000),
                trends: ['상승 추세', '계절성 패턴', '이상치 3개 발견'],
                statistics: {
                    mean: Math.random() * 100,
                    median: Math.random() * 100,
                    std_dev: Math.random() * 20
                }
            };

            return { success: true, output: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '데이터 분석 실패' };
        }
    }

    // 알림 태스크 실행
    private async executeNotificationTask(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            const input = task.input_data as Record<string, unknown>;
            const { title, message, severity, recipients } = input;

            // 알림 시스템을 통한 알림 발송
            const alertId = realTimeAIAlertSystem.createSystemAlert(
                (title as string) || '워크플로우 알림',
                (message as string) || '자동화된 알림입니다.',
                (severity as string) || 'medium',
                { workflow_task_id: task.id }
            );

            await this.simulateProcessing(500);

            return {
                success: true,
                output: {
                    alert_id: alertId,
                    sent_at: new Date(),
                    recipients_count: Array.isArray(recipients) ? recipients.length : 1
                }
            };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알림 발송 실패' };
        }
    }

    // 시스템 유지보수 태스크 실행
    private async executeSystemMaintenanceTask(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            const input = task.input_data as Record<string, unknown>;
            const { maintenance_type } = input;

            switch (maintenance_type) {
                case 'cache_cleanup':
                    aiCacheManager.optimize();
                    break;
                case 'health_check':
                    await aiHealthMonitor.performSystemHealthCheck();
                    break;
                case 'log_rotation':
                    // 로그 순환 로직
                    break;
                default:
                // 기본 유지보수 작업
            }

            await this.simulateProcessing(3000 + Math.random() * 2000);

            return {
                success: true,
                output: {
                    maintenance_type,
                    completed_at: new Date(),
                    status: 'completed'
                }
            };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '시스템 유지보수 실패' };
        }
    }

    // 보안 검사 태스크 실행
    private async executeSecurityCheckTask(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            const input = task.input_data as Record<string, unknown>;
            const { check_type, target } = input;

            await this.simulateProcessing(2000 + Math.random() * 3000);

            const securityMetrics = advancedAISecuritySystem.getSecurityMetrics();

            const result = {
                check_type,
                target,
                checked_at: new Date(),
                security_score: 85 + Math.random() * 15,
                threats_found: securityMetrics.total_threats_detected,
                recommendations: [
                    '정기적인 보안 업데이트 권장',
                    '접근 권한 재검토 필요',
                    '모니터링 강화 권장'
                ]
            };

            return { success: true, output: result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '보안 검사 실패' };
        }
    }

    // 보고서 생성 태스크 실행
    private async executeReportGenerationTask(task: WorkflowTask): Promise<{ success: boolean; output?: unknown; error?: string }> {
        try {
            const input = task.input_data as Record<string, unknown>;
            const { report_type, period, format } = input;

            await this.simulateProcessing(4000 + Math.random() * 3000);

            const report = {
                report_id: `report-${Date.now()}`,
                type: report_type,
                period,
                format: format || 'json',
                generated_at: new Date(),
                data: {
                    summary: '시스템이 정상적으로 운영되고 있습니다.',
                    metrics: this.getWorkflowMetrics(),
                    recommendations: [
                        '워크플로우 최적화 권장',
                        '리소스 사용량 모니터링 강화',
                        '자동화 범위 확대 검토'
                    ]
                },
                file_path: `/reports/${report_type}_${Date.now()}.${format}`
            };

            return { success: true, output: report };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '보고서 생성 실패' };
        }
    }

    // 의존성 태스크 확인
    private async checkDependentTasks(completedTask: WorkflowTask): Promise<void> {
        const workflow = Array.from(this.workflows.values()).find(w =>
            w.tasks.some(t => t.id === completedTask.id)
        );

        if (!workflow) return;

        // 완료된 태스크에 의존하는 태스크들 찾기
        const dependentTasks = workflow.tasks.filter(task =>
            task.dependencies.includes(completedTask.id) && task.status === 'pending'
        );

        for (const task of dependentTasks) {
            // 모든 의존성이 완료되었는지 확인
            const allDependenciesCompleted = task.dependencies.every(depId => {
                const depTask = workflow.tasks.find(t => t.id === depId);
                return depTask?.status === 'completed';
            });

            if (allDependenciesCompleted) {
                // 이전 태스크의 출력을 입력으로 전달
                const dependencyOutputs = task.dependencies.map(depId => {
                    const depTask = workflow.tasks.find(t => t.id === depId);
                    return depTask?.output_data;
                }).filter(output => output !== undefined);

                const currentInput = (task.input_data ?? {}) as Record<string, unknown>;
                task.input_data = {
                    ...currentInput,
                    dependency_outputs: dependencyOutputs
                };

                this.enqueueTask(task);
            }
        }

        // 워크플로우 완료 확인
        await this.checkWorkflowCompletion(workflow);
    }

    // 워크플로우 완료 확인
    private async checkWorkflowCompletion(workflow: Workflow): Promise<void> {
        const allTasksCompleted = workflow.tasks.every(task =>
            task.status === 'completed' || task.status === 'failed'
        );

        if (allTasksCompleted) {
            const successfulTasks = workflow.tasks.filter(task => task.status === 'completed').length;
            const totalTasks = workflow.tasks.length;

            workflow.completed_at = new Date();
            workflow.status = successfulTasks === totalTasks ? 'completed' : 'failed';

            if (workflow.status === 'completed') {
                workflow.successful_runs++;
            } else {
                workflow.failed_runs++;
            }

            // 성공률 계산
            workflow.success_rate = (workflow.successful_runs / workflow.total_runs) * 100;

            // 평균 실행 시간 계산
            if (workflow.started_at && workflow.completed_at) {
                const duration = workflow.completed_at.getTime() - workflow.started_at.getTime();
                workflow.average_duration = workflow.average_duration === 0 ?
                    duration : (workflow.average_duration + duration) / 2;
            }

            this.emit('workflow_completed', workflow);
            errorLogger.info('워크플로우 완료', {
                component: 'aiAutomationWorkflowSystem',
                action: 'checkWorkflowCompletion',
                workflowId: workflow.id,
                workflowName: workflow.name,
                successRate: workflow.success_rate.toFixed(1),
            });
        }
    }

    // 처리 시뮬레이션
    private simulateProcessing(duration: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    // 워크플로우 메트릭 조회
    public getWorkflowMetrics(): WorkflowMetrics {
        const workflows = Array.from(this.workflows.values());
        const tasks = Array.from(this.tasks.values());
        const workers = Array.from(this.workers.values());

        const totalWorkflows = workflows.length;
        const activeWorkflows = workflows.filter(w => w.status === 'active').length;
        const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
        const failedWorkflows = workflows.filter(w => w.status === 'failed').length;

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const runningTasks = tasks.filter(t => t.status === 'running').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const failedTasks = tasks.filter(t => t.status === 'failed').length;

        const avgWorkflowDuration = workflows.length > 0 ?
            workflows.reduce((sum, w) => sum + w.average_duration, 0) / workflows.length : 0;

        const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const workerUtilization = workers.length > 0 ?
            workers.reduce((sum, w) => sum + w.current_load, 0) / workers.length : 0;

        return {
            total_workflows: totalWorkflows,
            active_workflows: activeWorkflows,
            completed_workflows: completedWorkflows,
            failed_workflows: failedWorkflows,
            total_tasks: totalTasks,
            pending_tasks: pendingTasks,
            running_tasks: runningTasks,
            completed_tasks: completedTasks,
            failed_tasks: failedTasks,
            average_workflow_duration: avgWorkflowDuration,
            success_rate: successRate,
            worker_utilization: workerUtilization,
            queue_size: this.taskQueue.length
        };
    }

    // 워커 초기화
    private initializeWorkers(): void {
        const workers: Omit<WorkflowWorker, 'id'>[] = [
            {
                name: 'AI 프로세서 #1',
                type: 'ai_processor',
                status: 'idle',
                processed_tasks: 0,
                success_rate: 100,
                average_processing_time: 2500,
                last_activity: new Date(),
                capabilities: ['ai_processing', 'data_analysis'],
                max_concurrent_tasks: 3,
                current_load: 0
            },
            {
                name: '데이터 분석기 #1',
                type: 'data_analyzer',
                status: 'idle',
                processed_tasks: 0,
                success_rate: 100,
                average_processing_time: 1800,
                last_activity: new Date(),
                capabilities: ['data_analysis', 'report_generation'],
                max_concurrent_tasks: 2,
                current_load: 0
            },
            {
                name: '시스템 모니터 #1',
                type: 'system_monitor',
                status: 'idle',
                processed_tasks: 0,
                success_rate: 100,
                average_processing_time: 3000,
                last_activity: new Date(),
                capabilities: ['system_maintenance', 'security_check'],
                max_concurrent_tasks: 1,
                current_load: 0
            },
            {
                name: '보안 스캐너 #1',
                type: 'security_scanner',
                status: 'idle',
                processed_tasks: 0,
                success_rate: 100,
                average_processing_time: 2200,
                last_activity: new Date(),
                capabilities: ['security_check', 'notification'],
                max_concurrent_tasks: 2,
                current_load: 0
            },
            {
                name: '보고서 생성기 #1',
                type: 'report_generator',
                status: 'idle',
                processed_tasks: 0,
                success_rate: 100,
                average_processing_time: 4000,
                last_activity: new Date(),
                capabilities: ['report_generation', 'notification'],
                max_concurrent_tasks: 1,
                current_load: 0
            }
        ];

        workers.forEach((workerData, index) => {
            const workerId = `worker-${Date.now()}-${index}`;
            this.workers.set(workerId, { ...workerData, id: workerId });
        });

        errorLogger.info('워커 초기화 완료', {
            component: 'aiAutomationWorkflowSystem',
            action: 'initializeWorkers',
            workersCount: workers.length,
        });
    }

    // 기본 워크플로우 초기화
    private initializeDefaultWorkflows(): void {
        // 시스템 헬스 체크 워크플로우
        this.createWorkflow({
            name: '시스템 헬스 체크',
            description: '정기적인 시스템 상태 점검 및 보고',
            trigger_type: 'scheduled',
            trigger_config: { interval: 3600000 }, // 1시간마다
            tasks: [
                {
                    name: '시스템 상태 확인',
                    type: 'system_maintenance',
                    priority: 'medium',
                    input_data: { maintenance_type: 'health_check' },
                    max_retries: 2,
                    dependencies: []
                },
                {
                    name: '보안 검사',
                    type: 'security_check',
                    priority: 'high',
                    input_data: { check_type: 'full_scan', target: 'all_services' },
                    max_retries: 1,
                    dependencies: []
                },
                {
                    name: '상태 보고서 생성',
                    type: 'report_generation',
                    priority: 'medium',
                    input_data: { report_type: 'health_check', period: 'hourly', format: 'json' },
                    max_retries: 2,
                    dependencies: []
                }
            ]
        });

        // 캐시 최적화 워크플로우
        this.createWorkflow({
            name: '캐시 최적화',
            description: '캐시 시스템 정리 및 최적화',
            trigger_type: 'scheduled',
            trigger_config: { interval: 1800000 }, // 30분마다
            tasks: [
                {
                    name: '캐시 정리',
                    type: 'system_maintenance',
                    priority: 'low',
                    input_data: { maintenance_type: 'cache_cleanup' },
                    max_retries: 1,
                    dependencies: []
                },
                {
                    name: '최적화 알림',
                    type: 'notification',
                    priority: 'low',
                    input_data: {
                        title: '캐시 최적화 완료',
                        message: '캐시 시스템이 최적화되었습니다.',
                        severity: 'low'
                    },
                    max_retries: 1,
                    dependencies: []
                }
            ]
        });
    }

    // 처리 시작
    private startProcessing(): void {
        this.processingInterval = setInterval(() => {
            this.processTaskQueue();
        }, 1000); // 1초마다
    }

    // 스케줄러 시작
    private startScheduler(): void {
        this.scheduleInterval = setInterval(() => {
            this.checkScheduledWorkflows();
        }, 60000); // 1분마다
    }

    // 태스크 큐 처리
    private processTaskQueue(): void {
        if (this.taskQueue.length === 0) return;

        // 사용 가능한 워커 찾기
        const availableWorkers = Array.from(this.workers.values()).filter(worker =>
            worker.status === 'idle' && worker.current_load < 80
        );

        if (availableWorkers.length === 0) return;

        // 태스크와 워커 매칭
        for (let i = 0; i < Math.min(this.taskQueue.length, availableWorkers.length); i++) {
            const task = this.taskQueue.shift();
            const worker = availableWorkers[i];

            if (task && worker && worker.capabilities.includes(task.type)) {
                this.processTask(task, worker);
            } else if (task) {
                // 적합한 워커가 없으면 다시 큐에 추가
                this.taskQueue.unshift(task);
                break;
            }
        }
    }

    // 예약된 워크플로우 확인
    private checkScheduledWorkflows(): void {
        const now = new Date();

        for (const workflow of this.workflows.values()) {
            if (workflow.trigger_type === 'scheduled' &&
                workflow.enabled &&
                workflow.next_run &&
                workflow.next_run <= now) {

                this.executeWorkflow(workflow.id);

                // 다음 실행 시간 계산
                const interval = (workflow.trigger_config as { interval?: number } | undefined)?.interval;
                if (typeof interval === 'number') {
                    workflow.next_run = new Date(now.getTime() + interval);
                }
            }
        }
    }

    // 서비스 종료
    public shutdown(): void {
        this.stop();
        this.workflows.clear();
        this.tasks.clear();
        this.workers.clear();
        this.schedules.clear();
        this.taskQueue = [];
        errorLogger.info('AI 자동화 워크플로우 시스템이 종료되었습니다', {
            component: 'aiAutomationWorkflowSystem',
            action: 'shutdown',
        });
    }
}

const aiAutomationWorkflowSystem = new AIAutomationWorkflowSystem();
export default aiAutomationWorkflowSystem;
