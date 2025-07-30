import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    PhotoIcon,
    EyeIcon,
    ShieldCheckIcon,
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
    DocumentTextIcon,
    BuildingOfficeIcon,
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
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface ImageAnalysis {
    id: string;
    name: string;
    url: string;
    size: string;
    uploadedAt: string;
    status: 'processing' | 'analyzed' | 'failed' | 'pending';
    analysisProgress: number;
    insights: ImageInsight[];
    metadata: {
        width: number;
        height: number;
        format: string;
        fileSize: string;
        colorSpace: string;
    };
}

interface ImageInsight {
    id: string;
    type: 'object' | 'face' | 'text' | 'scene' | 'color' | 'quality' | 'brand' | 'landmark';
    title: string;
    description: string;
    confidence: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    value: any;
}

interface ImageModel {
    id: string;
    name: string;
    type: 'object-detection' | 'face-recognition' | 'text-recognition' | 'scene-analysis' | 'brand-detection';
    accuracy: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
}

interface ImageSettings {
    enableObjectDetection: boolean;
    enableFaceRecognition: boolean;
    enableTextRecognition: boolean;
    enableSceneAnalysis: boolean;
    enableBrandDetection: boolean;
    qualityMode: 'fast' | 'balanced' | 'high';
    maxDetections: number;
}

interface AdvancedAIImageAnalysisProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIImageAnalysis: React.FC<AdvancedAIImageAnalysisProps> = ({
    isActive,
    onToggle
}) => {
    const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysis[]>([
        {
            id: 'img-1',
            name: 'AI_시스템_아키텍처.png',
            url: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=AI+System+Architecture',
            size: '2.1MB',
            uploadedAt: '15분 전',
            status: 'analyzed',
            analysisProgress: 100,
            insights: [
                {
                    id: 'insight-1',
                    type: 'object',
                    title: '객체 감지',
                    description: '컴퓨터, 모니터, 키보드, 마우스 감지됨',
                    confidence: 94.2,
                    boundingBox: { x: 100, y: 150, width: 300, height: 200 },
                    value: ['computer', 'monitor', 'keyboard', 'mouse']
                },
                {
                    id: 'insight-2',
                    type: 'text',
                    title: '텍스트 인식',
                    description: 'AI, 시스템, 아키텍처, 데이터베이스 등의 텍스트 감지',
                    confidence: 87.5,
                    value: ['AI', 'System', 'Architecture', 'Database']
                },
                {
                    id: 'insight-3',
                    type: 'scene',
                    title: '장면 분석',
                    description: '사무실 환경, 기술적 작업 공간',
                    confidence: 91.8,
                    value: 'office_workspace'
                }
            ],
            metadata: {
                width: 1920,
                height: 1080,
                format: 'PNG',
                fileSize: '2.1MB',
                colorSpace: 'RGB'
            }
        },
        {
            id: 'img-2',
            name: '사용자_인터페이스_디자인.jpg',
            url: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=User+Interface+Design',
            size: '1.8MB',
            uploadedAt: '30분 전',
            status: 'analyzed',
            analysisProgress: 100,
            insights: [
                {
                    id: 'insight-4',
                    type: 'object',
                    title: '객체 감지',
                    description: '화면, 버튼, 메뉴, 아이콘 감지됨',
                    confidence: 92.1,
                    boundingBox: { x: 50, y: 100, width: 400, height: 300 },
                    value: ['screen', 'button', 'menu', 'icon']
                },
                {
                    id: 'insight-5',
                    type: 'color',
                    title: '색상 분석',
                    description: '주로 파란색과 흰색 계열의 색상 사용',
                    confidence: 89.3,
                    value: ['#4F46E5', '#FFFFFF', '#E5E7EB']
                }
            ],
            metadata: {
                width: 1600,
                height: 900,
                format: 'JPG',
                fileSize: '1.8MB',
                colorSpace: 'RGB'
            }
        },
        {
            id: 'img-3',
            name: '데이터_시각화_차트.png',
            url: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Data+Visualization+Chart',
            size: '3.2MB',
            uploadedAt: '1시간 전',
            status: 'processing',
            analysisProgress: 65,
            insights: [],
            metadata: {
                width: 2400,
                height: 1350,
                format: 'PNG',
                fileSize: '3.2MB',
                colorSpace: 'RGB'
            }
        }
    ]);

    const [imageModels, setImageModels] = useState<ImageModel[]>([
        {
            id: 'model-1',
            name: 'YOLO v8 Object Detection',
            type: 'object-detection',
            accuracy: 94.2,
            speed: 0.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 2150
        },
        {
            id: 'model-2',
            name: 'FaceNet Face Recognition',
            type: 'face-recognition',
            accuracy: 96.8,
            speed: 1.2,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 980
        },
        {
            id: 'model-3',
            name: 'Tesseract OCR',
            type: 'text-recognition',
            accuracy: 89.5,
            speed: 1.5,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1450
        },
        {
            id: 'model-4',
            name: 'ResNet Scene Analysis',
            type: 'scene-analysis',
            accuracy: 91.7,
            speed: 1.0,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 720
        }
    ]);

    const [imageSettings, setImageSettings] = useState<ImageSettings>({
        enableObjectDetection: true,
        enableFaceRecognition: true,
        enableTextRecognition: true,
        enableSceneAnalysis: true,
        enableBrandDetection: false,
        qualityMode: 'balanced',
        maxDetections: 10
    });

    const [activeTab, setActiveTab] = useState<'images' | 'analysis' | 'models' | 'insights' | 'settings'>('images');
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        // 이미지 분석 진행률 시뮬레이션
        const interval = setInterval(() => {
            setImageAnalyses(prev => prev.map(img => {
                if (img.status === 'processing') {
                    const newProgress = Math.min(100, img.analysisProgress + Math.random() * 8);
                    const newStatus = newProgress >= 100 ? 'analyzed' : 'processing';
                    return {
                        ...img,
                        analysisProgress: newProgress,
                        status: newStatus
                    };
                }
                return img;
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'analyzed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'object': return <EyeIcon className="w-4 h-4" />;
            case 'face': return <UserIcon className="w-4 h-4" />;
            case 'text': return <DocumentTextIcon className="w-4 h-4" />;
            case 'scene': return <PhotoIcon className="w-4 h-4" />;
            case 'color': return <SwatchIcon className="w-4 h-4" />;
            case 'quality': return <StarIcon className="w-4 h-4" />;
            case 'brand': return <TrophyIcon className="w-4 h-4" />;
            case 'landmark': return <BuildingOfficeIcon className="w-4 h-4" />;
            default: return <EyeIcon className="w-4 h-4" />;
        }
    };

    const analyzeImage = (imageId: string) => {
        setImageAnalyses(prev => prev.map(img =>
            img.id === imageId
                ? { ...img, status: 'processing' as any, analysisProgress: 0 }
                : img
        ));
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <PhotoIcon className="w-5 h-5" />
                    <span>이미지 분석</span>
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
                                <PhotoIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 이미지 분석 시스템</h3>
                                <p className="text-gray-400 text-sm">이미지 인식 및 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{imageAnalyses.filter(img => img.status === 'analyzed').length}개 분석 완료</span>
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
                        { id: 'images', label: '이미지', icon: PhotoIcon },
                        { id: 'analysis', label: '분석', icon: MagnifyingGlassIcon },
                        { id: 'models', label: '모델', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
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
                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            {/* 이미지 업로드 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">이미지 업로드</h4>
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                        이미지 업로드
                                    </button>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">이미지를 여기에 드래그하거나 클릭하여 업로드</p>
                                    <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF, WebP 파일 지원</p>
                                </div>
                            </div>

                            {/* 이미지 목록 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">이미지 목록</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {imageAnalyses.map(image => (
                                        <div key={image.id} className="bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="w-full h-48 object-cover rounded-t-lg"
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(image.status)}`}>
                                                        {image.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h5 className="font-semibold text-gray-900 mb-2">{image.name}</h5>
                                                <div className="text-sm text-gray-500 mb-3">
                                                    <p>{image.size} • {image.uploadedAt}</p>
                                                    <p>{image.metadata.width} x {image.metadata.height} • {image.metadata.format}</p>
                                                </div>

                                                {image.status === 'processing' && (
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">분석 진행률</span>
                                                            <span className="font-semibold text-gray-900">{image.analysisProgress.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${image.analysisProgress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {image.status === 'analyzed' && (
                                                    <div className="mb-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {image.insights.slice(0, 3).map(insight => (
                                                                <span key={insight.id} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                                    {insight.type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex space-x-2">
                                                    {image.status === 'analyzed' ? (
                                                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                                            결과 보기
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => analyzeImage(image.id)}
                                                            className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                                                        >
                                                            분석 시작
                                                        </button>
                                                    )}
                                                    <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                        다운로드
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h4>
                                <div className="space-y-4">
                                    {imageAnalyses.filter(img => img.status === 'analyzed').map(image => (
                                        <div key={image.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{image.name}</h5>
                                                    <p className="text-sm text-gray-500">{image.metadata.width} x {image.metadata.height}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {image.insights.map(insight => (
                                                    <div key={insight.id} className="p-3 bg-white rounded border">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            {getTypeIcon(insight.type)}
                                                            <span className="font-medium text-gray-900">{insight.title}</span>
                                                            <span className="text-sm text-gray-500">({insight.confidence}%)</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{insight.description}</p>
                                                        {insight.value && (
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                <strong>결과:</strong> {Array.isArray(insight.value) ? insight.value.join(', ') : insight.value}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">이미지 분석 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {imageModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">{model.type}</p>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">이미지 분석 인사이트</h4>
                                <div className="space-y-4">
                                    {imageAnalyses.flatMap(img => img.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon(insight.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            {insight.value && (
                                                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                    <strong>분석 결과:</strong> {Array.isArray(insight.value) ? insight.value.join(', ') : insight.value}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">이미지 분석 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">객체 감지</h5>
                                            <p className="text-sm text-gray-600">이미지 내 객체 자동 감지</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${imageSettings.enableObjectDetection
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {imageSettings.enableObjectDetection ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">얼굴 인식</h5>
                                            <p className="text-sm text-gray-600">이미지 내 얼굴 자동 인식</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${imageSettings.enableFaceRecognition
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {imageSettings.enableFaceRecognition ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">품질 모드</h5>
                                            <p className="text-sm text-gray-600">분석 품질과 속도 조절</p>
                                        </div>
                                        <select
                                            value={imageSettings.qualityMode}
                                            onChange={(e) => setImageSettings(prev => ({ ...prev, qualityMode: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="fast">빠름</option>
                                            <option value="balanced">균형</option>
                                            <option value="high">고품질</option>
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

export default AdvancedAIImageAnalysis; 