import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    CogIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    HeartIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    ChartBarIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    ArrowPathIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
    id: string;
    name: string;
    type: 'ai-learning' | 'data-visualization' | 'ai-prediction' | 'security-monitoring' | 'message-workflow' | 'data-processing' | 'model-training' | 'analysis' | 'report-generation';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    description: string;
    duration: number;
    progress: number;
    dependencies: string[];
    output: any;
    error?: string;
    icon: any;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'completed' | 'failed' | 'draft';
    steps: WorkflowStep[];
    createdAt: string;
    lastModified: string;
    executionCount: number;
    averageDuration: number;
    successRate: number;
    triggers: string[];
    settings: {
        autoRetry: boolean;
        maxRetries: number;
        timeout: number;
        parallelExecution: boolean;
        notifications: boolean;
    };
}

interface AutomationRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: string;
    status: 'active' | 'inactive';
    priority: 'low' | 'medium' | 'high' | 'critical';
    lastTriggered: string;
    triggerCount: number;
}

interface AdvancedAIAutomationWorkflowProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIAutomationWorkflow: React.FC<AdvancedAIAutomationWorkflowProps> = ({
    isActive,
    onToggle
}) => {
    const [workflows, setWorkflows] = useState<Workflow[]>([
        {
            id: 'workflow-1',
            name: 'AI 모델 자동 학습 파이프라인',
            description: '데이터 수집부터 모델 배포까지의 완전 자동화된 AI 학습 워크플로우',
            status: 'active',
            steps: [
                {
                    id: 'step-1',
                    name: '데이터 수집 및 전처리',
                    type: 'data-processing',
                    status: 'completed',
                    description: '다양한 소스에서 데이터를 수집하고 전처리',
                    duration: 120,
                    progress: 100,
                    dependencies: [],
                    output: { dataSize: '2.3GB', records: 15420 },
                    icon: ChartBarIcon
                },
                {
                    id: 'step-2',
                    name: 'AI 모델 학습',
                    type: 'model-training',
                    status: 'running',
                    description: '신경망 모델 학습 및 최적화',
                    duration: 300,
                    progress: 65,
                    dependencies: ['step-1'],
                    output: { accuracy: 94.2, loss: 0.058 },
                    icon: CpuChipIcon
                },
                {
                    id: 'step-3',
                    name: '성능 분석 및 검증',
                    type: 'analysis',
                    status: 'pending',
                    description: '모델 성능 분석 및 검증',
                    duration: 60,
                    progress: 0,
                    dependencies: ['step-2'],
                    output: null,
                    icon: MagnifyingGlassIcon
                },
                {
                    id: 'step-4',
                    name: '보안 검사',
                    type: 'security-monitoring',
                    status: 'pending',
                    description: '모델 보안 취약점 검사',
                    duration: 45,
                    progress: 0,
                    dependencies: ['step-3'],
                    output: null,
                    icon: ShieldCheckIcon
                },
                {
                    id: 'step-5',
                    name: '모델 배포',
                    type: 'ai-learning',
                    status: 'pending',
                    description: '프로덕션 환경에 모델 배포',
                    duration: 30,
                    progress: 0,
                    dependencies: ['step-4'],
                    output: null,
                    icon: RocketLaunchIcon
                }
            ],
            createdAt: '2시간 전',
            lastModified: '30분 전',
            executionCount: 15,
            averageDuration: 585,
            successRate: 93.3,
            triggers: ['data-update', 'model-performance-drop'],
            settings: {
                autoRetry: true,
                maxRetries: 3,
                timeout: 3600,
                parallelExecution: false,
                notifications: true
            }
        },
        {
            id: 'workflow-2',
            name: '실시간 데이터 분석 대시보드',
            description: '실시간 데이터 수집, 분석, 시각화 자동화',
            status: 'active',
            steps: [
                {
                    id: 'step-1',
                    name: '실시간 데이터 수집',
                    type: 'data-processing',
                    status: 'running',
                    description: '다양한 소스에서 실시간 데이터 수집',
                    duration: 0,
                    progress: 100,
                    dependencies: [],
                    output: { dataPoints: 1247, sources: 5 },
                    icon: SignalIcon
                },
                {
                    id: 'step-2',
                    name: '데이터 시각화 생성',
                    type: 'data-visualization',
                    status: 'running',
                    description: '실시간 차트 및 대시보드 생성',
                    duration: 30,
                    progress: 80,
                    dependencies: ['step-1'],
                    output: { charts: 6, updateFrequency: '5초' },
                    icon: ChartBarIcon
                },
                {
                    id: 'step-3',
                    name: 'AI 예측 분석',
                    type: 'ai-prediction',
                    status: 'pending',
                    description: '데이터 기반 AI 예측 생성',
                    duration: 60,
                    progress: 0,
                    dependencies: ['step-2'],
                    output: null,
                    icon: StarIcon
                }
            ],
            createdAt: '1시간 전',
            lastModified: '5분 전',
            executionCount: 8,
            averageDuration: 90,
            successRate: 100,
            triggers: ['new-data', 'user-request'],
            settings: {
                autoRetry: true,
                maxRetries: 2,
                timeout: 300,
                parallelExecution: true,
                notifications: true
            }
        }
    ]);

    const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
        {
            id: 'rule-1',
            name: '모델 성능 저하 자동 재학습',
            description: '모델 성능이 임계값 이하로 떨어지면 자동으로 재학습 시작',
            condition: 'model_accuracy < 0.85',
            action: 'trigger_retraining_workflow',
            status: 'active',
            priority: 'high',
            lastTriggered: '1시간 전',
            triggerCount: 3
        },
        {
            id: 'rule-2',
            name: '보안 위협 자동 대응',
            description: '보안 위협이 감지되면 자동으로 대응 조치 실행',
            condition: 'security_threat_detected == true',
            action: 'execute_security_response',
            status: 'active',
            priority: 'critical',
            lastTriggered: '30분 전',
            triggerCount: 1
        },
        {
            id: 'rule-3',
            name: '데이터 백업 자동화',
            description: '정기적으로 중요한 데이터 자동 백업',
            condition: 'time == "02:00" && day == "daily"',
            action: 'backup_critical_data',
            status: 'active',
            priority: 'medium',
            lastTriggered: '어제',
            triggerCount: 7
        }
    ]);

    const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'rules' | 'execution' | 'monitoring' | 'settings'>('overview');
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        // 워크플로우 실행 시뮬레이션
        const interval = setInterval(() => {
            setWorkflows(prev => prev.map(workflow => ({
                ...workflow,
                steps: workflow.steps.map(step => {
                    if (step.status === 'running') {
                        const newProgress = Math.min(100, step.progress + Math.random() * 5);
                        const newStatus = newProgress >= 100 ? 'completed' : 'running';
                        return {
                            ...step,
                            progress: newProgress,
                            status: newStatus
                        };
                    }
                    return step;
                })
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'running':
            case 'completed':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'paused':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'pending':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStepTypeIcon = (type: string) => {
        switch (type) {
            case 'ai-learning': return <AcademicCapIcon className="w-4 h-4" />;
            case 'data-visualization': return <ChartBarIcon className="w-4 h-4" />;
            case 'ai-prediction': return <CpuChipIcon className="w-4 h-4" />;
            case 'security-monitoring': return <ShieldCheckIcon className="w-4 h-4" />;
            case 'message-workflow': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
            case 'data-processing': return <CpuChipIcon className="w-4 h-4" />;
            case 'model-training': return <CpuChipIcon className="w-4 h-4" />;
            case 'analysis': return <MagnifyingGlassIcon className="w-4 h-4" />;
            case 'report-generation': return <ChartBarIcon className="w-4 h-4" />;
            default: return <CogIcon className="w-4 h-4" />;
        }
    };

    const executeWorkflow = (workflowId: string) => {
        setIsExecuting(true);
        setWorkflows(prev => prev.map(workflow =>
            workflow.id === workflowId
                ? { ...workflow, status: 'active' as any }
                : workflow
        ));

        setTimeout(() => setIsExecuting(false), 2000);
    };

    const pauseWorkflow = (workflowId: string) => {
        setWorkflows(prev => prev.map(workflow =>
            workflow.id === workflowId
                ? { ...workflow, status: 'paused' as any }
                : workflow
        ));
    };

    const stopWorkflow = (workflowId: string) => {
        setWorkflows(prev => prev.map(workflow =>
            workflow.id === workflowId
                ? { ...workflow, status: 'failed' as any }
                : workflow
        ));
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CogIcon className="w-5 h-5" />
                    <span>AI 자동화 워크플로우</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <CogIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 자동화 워크플로우 시스템</h3>
                                <p className="text-gray-400 text-sm">복잡한 AI 작업의 자동화 및 관리</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{workflows.filter(w => w.status === 'active').length}개 활성 워크플로우</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'overview', label: '개요', icon: Squares2X2Icon },
                        { id: 'workflows', label: '워크플로우', icon: CogIcon },
                        { id: 'rules', label: '자동화 규칙', icon: BoltIcon },
                        { id: 'execution', label: '실행', icon: PlayIcon },
                        { id: 'monitoring', label: '모니터링', icon: ComputerDesktopIcon },
                        { id: 'settings', label: '설정', icon: CogIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 워크플로우 통계 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <CogIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{workflows.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">총 워크플로우</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <PlayIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{workflows.filter(w => w.status === 'active').length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">활성 워크플로우</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <BoltIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{automationRules.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">자동화 규칙</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <CheckCircleIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {workflows.reduce((acc, w) => acc + w.executionCount, 0)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">총 실행 횟수</p>
                                </div>
                            </div>

                            {/* 활성 워크플로우 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">활성 워크플로우</h4>
                                <div className="space-y-4">
                                    {workflows.filter(w => w.status === 'active').map(workflow => (
                                        <div key={workflow.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{workflow.name}</h5>
                                                    <p className="text-sm text-gray-600">{workflow.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                                                    {workflow.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                {workflow.steps.map(step => (
                                                    <div key={step.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                        <div className="flex items-center space-x-3">
                                                            {getStepTypeIcon(step.type)}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                                                <p className="text-xs text-gray-500">{step.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                                                                {step.status}
                                                            </span>
                                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${step.progress >= 100 ? 'bg-emerald-500' :
                                                                        step.progress >= 50 ? 'bg-blue-500' :
                                                                            'bg-gray-400'
                                                                        }`}
                                                                    style={{ width: `${step.progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{step.progress.toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workflows' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">워크플로우 관리</h4>
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                        새 워크플로우 생성
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {workflows.map(workflow => (
                                        <div key={workflow.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{workflow.name}</h5>
                                                    <p className="text-sm text-gray-500">{workflow.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                                                    {workflow.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm mb-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">실행 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{workflow.executionCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">평균 실행 시간:</span>
                                                    <span className="font-semibold text-gray-900">{workflow.averageDuration}초</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">성공률:</span>
                                                    <span className="font-semibold text-gray-900">{workflow.successRate}%</span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                {workflow.status === 'active' ? (
                                                    <>
                                                        <button
                                                            onClick={() => pauseWorkflow(workflow.id)}
                                                            className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors"
                                                        >
                                                            일시정지
                                                        </button>
                                                        <button
                                                            onClick={() => stopWorkflow(workflow.id)}
                                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            중지
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => executeWorkflow(workflow.id)}
                                                        disabled={isExecuting}
                                                        className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {isExecuting ? '실행 중...' : '실행'}
                                                    </button>
                                                )}
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    편집
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">자동화 규칙</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {automationRules.map(rule => (
                                        <div key={rule.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{rule.name}</h5>
                                                    <p className="text-sm text-gray-500">{rule.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                                                    {rule.priority}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm mb-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">조건:</span>
                                                    <span className="font-semibold text-gray-900">{rule.condition}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">동작:</span>
                                                    <span className="font-semibold text-gray-900">{rule.action}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">마지막 실행:</span>
                                                    <span className="font-semibold text-gray-900">{rule.lastTriggered}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">실행 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{rule.triggerCount}</span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    편집
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    {rule.status === 'active' ? '비활성화' : '활성화'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'execution' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">실행 모니터링</h4>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">실행 모니터링 대시보드</p>
                                        <p className="text-sm text-gray-400">실시간 워크플로우 실행 상태</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'monitoring' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 모니터링</h4>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <ComputerDesktopIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">시스템 모니터링 차트</p>
                                        <p className="text-sm text-gray-400">실시간 성능 및 리소스 모니터링</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">자동화 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 재시도</h5>
                                            <p className="text-sm text-gray-600">실패한 워크플로우 자동 재시도</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">병렬 실행</h5>
                                            <p className="text-sm text-gray-600">독립적인 워크플로우 병렬 실행</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">알림 설정</h5>
                                            <p className="text-sm text-gray-600">워크플로우 상태 변경 알림</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIAutomationWorkflow; 