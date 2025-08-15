import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    CameraIcon,
    VideoCameraIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    ArrowPathIcon,
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
    UsersIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
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
    ChartBarIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
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
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface VisionTask {
    id: string;
    type: 'object-detection' | 'face-recognition' | 'image-segmentation' | 'pose-estimation' | 'optical-character-recognition' | 'image-classification' | 'video-analysis' | 'scene-understanding';
    input: string;
    output: any;
    confidence: number;
    processingTime: number;
    timestamp: string;
    insights: VisionInsight[];
}

interface VisionInsight {
    id: string;
    type: 'spatial' | 'temporal' | 'semantic' | 'geometric' | 'appearance' | 'motion';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface VisionModel {
    id: string;
    name: string;
    type: 'cnn' | 'transformer' | 'yolo' | 'resnet' | 'efficientnet' | 'vit';
    accuracy: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
    inputSize: string;
}

interface VisionSettings {
    enableRealTime: boolean;
    enableGPU: boolean;
    enableBatchProcessing: boolean;
    modelSize: 'small' | 'medium' | 'large';
    confidenceThreshold: number;
    maxDetections: number;
}

interface AdvancedAIComputerVisionProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIComputerVision: React.FC<AdvancedAIComputerVisionProps> = ({
    isActive,
    onToggle
}) => {
    const [visionTasks, setVisionTasks] = useState<VisionTask[]>([
        {
            id: 'task-1',
            type: 'object-detection',
            input: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Object+Detection',
            output: {
                objects: [
                    { label: 'person', confidence: 0.95, bbox: [100, 150, 200, 400] },
                    { label: 'car', confidence: 0.87, bbox: [300, 200, 150, 100] },
                    { label: 'building', confidence: 0.92, bbox: [50, 50, 300, 200] }
                ]
            },
            confidence: 94.2,
            processingTime: 1.2,
            timestamp: '5분 전',
            insights: [
                {
                    id: 'insight-1',
                    type: 'spatial',
                    title: '공간적 배치',
                    description: '객체들이 공간적으로 잘 분리되어 배치됨',
                    confidence: 91.7,
                    value: 'well_distributed'
                },
                {
                    id: 'insight-2',
                    type: 'semantic',
                    title: '시맨틱 분석',
                    description: '도시 환경에서 일반적인 객체들 감지',
                    confidence: 89.3,
                    value: 'urban_environment'
                }
            ]
        },
        {
            id: 'task-2',
            type: 'face-recognition',
            input: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Face+Recognition',
            output: {
                faces: [
                    { id: 'face-1', confidence: 0.96, landmarks: [100, 150, 200, 300], identity: 'User A' },
                    { id: 'face-2', confidence: 0.88, landmarks: [400, 200, 150, 250], identity: 'User B' }
                ]
            },
            confidence: 92.5,
            processingTime: 0.8,
            timestamp: '12분 전',
            insights: [
                {
                    id: 'insight-3',
                    type: 'appearance',
                    title: '얼굴 특성',
                    description: '명확한 얼굴 특징과 랜드마크 감지',
                    confidence: 94.1,
                    value: 'clear_features'
                }
            ]
        },
        {
            id: 'task-3',
            type: 'image-segmentation',
            input: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Image+Segmentation',
            output: {
                segments: [
                    { label: 'background', pixels: 150000, confidence: 0.95 },
                    { label: 'foreground', pixels: 50000, confidence: 0.87 },
                    { label: 'object', pixels: 25000, confidence: 0.92 }
                ]
            },
            confidence: 89.7,
            processingTime: 2.1,
            timestamp: '25분 전',
            insights: [
                {
                    id: 'insight-4',
                    type: 'geometric',
                    title: '기하학적 구조',
                    description: '복잡한 기하학적 구조의 정확한 분할',
                    confidence: 91.2,
                    value: 'complex_geometry'
                }
            ]
        }
    ]);

    const [visionModels, setVisionModels] = useState<VisionModel[]>([
        {
            id: 'model-1',
            name: 'YOLO v8',
            type: 'yolo',
            accuracy: 94.2,
            speed: 0.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 2150,
            inputSize: '640x640'
        },
        {
            id: 'model-2',
            name: 'ResNet-50',
            type: 'resnet',
            accuracy: 91.7,
            speed: 1.2,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1800,
            inputSize: '224x224'
        },
        {
            id: 'model-3',
            name: 'Vision Transformer',
            type: 'transformer',
            accuracy: 96.8,
            speed: 1.5,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1650,
            inputSize: '384x384'
        },
        {
            id: 'model-4',
            name: 'EfficientNet-B4',
            type: 'efficientnet',
            accuracy: 93.5,
            speed: 0.6,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 950,
            inputSize: '380x380'
        }
    ]);

    const [visionSettings, setVisionSettings] = useState<VisionSettings>({
        enableRealTime: true,
        enableGPU: true,
        enableBatchProcessing: true,
        modelSize: 'medium',
        confidenceThreshold: 0.8,
        maxDetections: 10
    });

    const [activeTab, setActiveTab] = useState<'tasks' | 'models' | 'insights' | 'analytics' | 'settings'>('tasks');

    useEffect(() => {
        // 실시간 비전 작업 시뮬레이션
        const interval = setInterval(() => {
            const newTask: VisionTask = {
                id: `task-${Date.now()}`,
                type: ['object-detection', 'face-recognition', 'image-segmentation'][Math.floor(Math.random() * 3)] as any,
                input: 'https://via.placeholder.com/800x600/6366F1/FFFFFF?text=Real+Time+Vision',
                output: {
                    objects: [
                        { label: 'object', confidence: Math.random() * 0.3 + 0.7, bbox: [100, 100, 200, 200] }
                    ]
                },
                confidence: Math.floor(Math.random() * 20) + 80,
                processingTime: Math.random() * 2 + 0.5,
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'spatial',
                        title: '실시간 공간 분석',
                        description: '실시간 비전 데이터 기반 공간 분석',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'realtime_spatial'
                    }
                ]
            };

            setVisionTasks(prev => [newTask, ...prev.slice(0, 9)]);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'object-detection': return <EyeIcon className="w-4 h-4" />;
            case 'face-recognition': return <UserIcon className="w-4 h-4" />;
            case 'image-segmentation': return <Squares2X2Icon className="w-4 h-4" />;
            case 'pose-estimation': return <UserIcon className="w-4 h-4" />;
            case 'optical-character-recognition': return <DocumentTextIcon className="w-4 h-4" />;
            case 'image-classification': return <ChartBarIcon className="w-4 h-4" />;
            case 'video-analysis': return <VideoCameraIcon className="w-4 h-4" />;
            case 'scene-understanding': return <CameraIcon className="w-4 h-4" />;
            default: return <CameraIcon className="w-4 h-4" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (confidence >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CameraIcon className="w-5 h-5" />
                    <span>컴퓨터 비전</span>
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
                                <CameraIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 컴퓨터 비전 시스템</h3>
                                <p className="text-gray-400 text-sm">이미지 및 비디오 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{visionTasks.length}개 작업</span>
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
                        { id: 'tasks', label: '작업', icon: CameraIcon },
                        { id: 'models', label: '모델', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
                        { id: 'analytics', label: '분석', icon: ChartPieIcon },
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
                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">비전 작업</h4>
                                <div className="space-y-4">
                                    {visionTasks.map(task => (
                                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getTypeIcon(task.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 capitalize">{task.type.replace('-', ' ')}</h5>
                                                        <p className="text-sm text-gray-500">{task.timestamp}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(task.confidence)}`}>
                                                    {task.confidence}%
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <img
                                                        src={task.input}
                                                        alt="Vision input"
                                                        className="w-full h-32 object-cover rounded"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    {task.output.objects && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">감지된 객체:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {task.output.objects.map((obj: any, idx: number) => (
                                                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                                        {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {task.output.faces && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">감지된 얼굴:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {task.output.faces.map((face: any, idx: number) => (
                                                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                                        {face.identity} ({(face.confidence * 100).toFixed(0)}%)
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">처리시간: {task.processingTime.toFixed(1)}초</span>
                                                    <span className="text-gray-600">신뢰도: {task.confidence}%</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    상세 보기
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">비전 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {visionModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">{model.type} • {model.inputSize}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도:</span>
                                                    <span className="font-semibold text-gray-900">{model.accuracy}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">속도:</span>
                                                    <span className="font-semibold text-gray-900">{model.speed}초</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">사용 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{model.usage.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    사용
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    설정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">비전 인사이트</h4>
                                <div className="space-y-4">
                                    {visionTasks.flatMap(task => task.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                <strong>분석 결과:</strong> {insight.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">비전 분석</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">{visionModels.length}</div>
                                        <div className="text-sm text-gray-600">활성 모델</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(visionTasks.reduce((acc, task) => acc + task.confidence, 0) / visionTasks.length).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">평균 신뢰도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {(visionTasks.reduce((acc, task) => acc + task.processingTime, 0) / visionTasks.length).toFixed(1)}초
                                        </div>
                                        <div className="text-sm text-gray-600">평균 처리 시간</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {visionTasks.length}
                                        </div>
                                        <div className="text-sm text-gray-600">총 작업 수</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">비전 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 처리</h5>
                                            <p className="text-sm text-gray-600">실시간 비전 처리 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${visionSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {visionSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">GPU 가속</h5>
                                            <p className="text-sm text-gray-600">GPU 가속 처리 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${visionSettings.enableGPU
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {visionSettings.enableGPU ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">신뢰도 임계값</h5>
                                            <p className="text-sm text-gray-600">객체 감지 신뢰도 임계값</p>
                                        </div>
                                        <select
                                            value={visionSettings.confidenceThreshold}
                                            onChange={(e) => setVisionSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value={0.5}>50%</option>
                                            <option value={0.7}>70%</option>
                                            <option value={0.8}>80%</option>
                                            <option value={0.9}>90%</option>
                                        </select>
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

export default AdvancedAIComputerVision; 