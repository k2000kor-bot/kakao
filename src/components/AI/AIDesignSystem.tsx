import React, { useState, useEffect, useRef } from 'react';
import {
    Palette,
    Layout,
    Type,
    Image,
    Sparkles,
    Download,
    Copy,
    RefreshCw,
    Settings,
    Eye,
    EyeOff,
    Grid,
    Layers,
    CheckCircle,
    AlertTriangle,
    Clock,
    Star,
    Heart,
    Zap,
    ArrowRight,
    Plus,
    Trash2,
    Edit,
    Share2,
    History,
    TrendingUp,
    BarChart3,
    Target,
    Palette as PaletteIcon,
    Droplets,
    Sun,
    Moon,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Lock,
    Unlock,
    Save,
    Upload,
    Search,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesignSystem {
    id: string;
    name: string;
    description: string;
    theme: 'light' | 'dark' | 'auto';
    colors: ColorPalette;
    typography: TypographySystem;
    components: ComponentLibrary;
    spacing: SpacingSystem;
    breakpoints: BreakpointSystem;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    status: 'draft' | 'published' | 'archived';
    usage: {
        projects: number;
        components: number;
        downloads: number;
    };
}

interface ColorPalette {
    primary: Color[];
    secondary: Color[];
    neutral: Color[];
    semantic: {
        success: Color[];
        warning: Color[];
        error: Color[];
        info: Color[];
    };
    gradients: Gradient[];
}

interface Color {
    name: string;
    hex: string;
    rgb: string;
    hsl: string;
    usage: string[];
    accessibility: {
        contrast: number;
        wcag: 'AA' | 'AAA' | 'fail';
    };
}

interface Gradient {
    name: string;
    colors: string[];
    direction: 'linear' | 'radial';
    angle: number;
    usage: string[];
}

interface TypographySystem {
    fonts: FontFamily[];
    scales: TypographyScale[];
    weights: FontWeight[];
    lineHeights: LineHeight[];
}

interface FontFamily {
    name: string;
    category: 'serif' | 'sans-serif' | 'monospace' | 'display';
    import: string;
    fallback: string[];
    usage: string[];
}

interface TypographyScale {
    name: string;
    size: string;
    lineHeight: string;
    weight: string;
    usage: string[];
}

interface FontWeight {
    value: number;
    name: string;
    usage: string[];
}

interface LineHeight {
    value: number;
    name: string;
    usage: string[];
}

interface ComponentLibrary {
    buttons: Component[];
    inputs: Component[];
    cards: Component[];
    modals: Component[];
    navigation: Component[];
    data: Component[];
    feedback: Component[];
}

interface Component {
    id: string;
    name: string;
    category: string;
    variants: ComponentVariant[];
    props: ComponentProp[];
    examples: ComponentExample[];
    usage: number;
    rating: number;
}

interface ComponentVariant {
    name: string;
    description: string;
    code: string;
    preview: string;
    props: Record<string, any>;
}

interface ComponentProp {
    name: string;
    type: string;
    required: boolean;
    default: any;
    description: string;
}

interface ComponentExample {
    name: string;
    description: string;
    code: string;
    preview: string;
}

interface SpacingSystem {
    scale: number[];
    units: 'px' | 'rem' | 'em';
    usage: Record<string, string>;
}

interface BreakpointSystem {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
    usage: Record<string, string>;
}

interface AIDesignSystemProps {
    onSystemCreate?: (system: DesignSystem) => void;
    onSystemUpdate?: (systemId: string, updates: Partial<DesignSystem>) => void;
    onSystemDelete?: (systemId: string) => void;
    onComponentGenerate?: (prompt: string, context: any) => void;
    onColorGenerate?: (prompt: string, context: any) => void;
    onTypographyGenerate?: (prompt: string, context: any) => void;
    onExportSystem?: (systemId: string, format: string) => void;
    onShareSystem?: (systemId: string, shareOptions: any) => void;
}

const AIDesignSystem: React.FC<AIDesignSystemProps> = ({
    onSystemCreate,
    onSystemUpdate,
    onSystemDelete,
    onComponentGenerate,
    onColorGenerate,
    onTypographyGenerate,
    onExportSystem,
    onShareSystem
}) => {
    const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<DesignSystem | null>(null);
    const [activeTab, setActiveTab] = useState<'systems' | 'colors' | 'typography' | 'components' | 'generator' | 'analytics' | 'settings'>('systems');
    const [generationPrompt, setGenerationPrompt] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'component' | 'color' | 'typography'>('component');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

    // Mock design systems
    useEffect(() => {
        const mockSystems: DesignSystem[] = [
            {
                id: '1',
                name: 'CORBU.AI Design System',
                description: 'CORBU.AI 플랫폼을 위한 통합 디자인 시스템',
                theme: 'light',
                version: '1.0.0',
                status: 'published',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-21'),
                usage: {
                    projects: 12,
                    components: 45,
                    downloads: 156
                },
                colors: {
                    primary: [
                        {
                            name: 'Primary Blue',
                            hex: '#3B82F6',
                            rgb: 'rgb(59, 130, 246)',
                            hsl: 'hsl(217, 91%, 60%)',
                            usage: ['buttons', 'links', 'branding'],
                            accessibility: { contrast: 4.5, wcag: 'AA' }
                        },
                        {
                            name: 'Primary Dark',
                            hex: '#1E40AF',
                            rgb: 'rgb(30, 64, 175)',
                            hsl: 'hsl(217, 91%, 40%)',
                            usage: ['hover states', 'active states'],
                            accessibility: { contrast: 7.2, wcag: 'AAA' }
                        }
                    ],
                    secondary: [
                        {
                            name: 'Secondary Purple',
                            hex: '#8B5CF6',
                            rgb: 'rgb(139, 92, 246)',
                            hsl: 'hsl(262, 83%, 58%)',
                            usage: ['accent elements', 'highlights'],
                            accessibility: { contrast: 3.8, wcag: 'AA' }
                        }
                    ],
                    neutral: [
                        {
                            name: 'Gray 50',
                            hex: '#F9FAFB',
                            rgb: 'rgb(249, 250, 251)',
                            hsl: 'hsl(210, 20%, 98%)',
                            usage: ['backgrounds', 'surfaces'],
                            accessibility: { contrast: 1.2, wcag: 'fail' }
                        },
                        {
                            name: 'Gray 900',
                            hex: '#111827',
                            rgb: 'rgb(17, 24, 39)',
                            hsl: 'hsl(222, 84%, 5%)',
                            usage: ['text', 'icons'],
                            accessibility: { contrast: 15.8, wcag: 'AAA' }
                        }
                    ],
                    semantic: {
                        success: [
                            {
                                name: 'Success Green',
                                hex: '#10B981',
                                rgb: 'rgb(16, 185, 129)',
                                hsl: 'hsl(160, 84%, 39%)',
                                usage: ['success states', 'confirmations'],
                                accessibility: { contrast: 3.1, wcag: 'AA' }
                            }
                        ],
                        warning: [
                            {
                                name: 'Warning Yellow',
                                hex: '#F59E0B',
                                rgb: 'rgb(245, 158, 11)',
                                hsl: 'hsl(43, 96%, 56%)',
                                usage: ['warnings', 'alerts'],
                                accessibility: { contrast: 2.9, wcag: 'AA' }
                            }
                        ],
                        error: [
                            {
                                name: 'Error Red',
                                hex: '#EF4444',
                                rgb: 'rgb(239, 68, 68)',
                                hsl: 'hsl(0, 84%, 60%)',
                                usage: ['errors', 'destructive actions'],
                                accessibility: { contrast: 4.5, wcag: 'AA' }
                            }
                        ],
                        info: [
                            {
                                name: 'Info Blue',
                                hex: '#3B82F6',
                                rgb: 'rgb(59, 130, 246)',
                                hsl: 'hsl(217, 91%, 60%)',
                                usage: ['information', 'notifications'],
                                accessibility: { contrast: 4.5, wcag: 'AA' }
                            }
                        ]
                    },
                    gradients: [
                        {
                            name: 'Primary Gradient',
                            colors: ['#3B82F6', '#8B5CF6'],
                            direction: 'linear',
                            angle: 135,
                            usage: ['hero sections', 'call-to-actions']
                        }
                    ]
                },
                typography: {
                    fonts: [
                        {
                            name: 'Inter',
                            category: 'sans-serif',
                            import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                            fallback: ['system-ui', 'sans-serif'],
                            usage: ['body text', 'headings']
                        }
                    ],
                    scales: [
                        {
                            name: 'Heading 1',
                            size: '2.25rem',
                            lineHeight: '1.2',
                            weight: '700',
                            usage: ['page titles', 'hero headings']
                        },
                        {
                            name: 'Heading 2',
                            size: '1.875rem',
                            lineHeight: '1.3',
                            weight: '600',
                            usage: ['section headings', 'card titles']
                        },
                        {
                            name: 'Body',
                            size: '1rem',
                            lineHeight: '1.5',
                            weight: '400',
                            usage: ['paragraphs', 'body text']
                        }
                    ],
                    weights: [
                        { value: 400, name: 'Regular', usage: ['body text'] },
                        { value: 500, name: 'Medium', usage: ['labels', 'emphasis'] },
                        { value: 600, name: 'SemiBold', usage: ['headings', 'buttons'] },
                        { value: 700, name: 'Bold', usage: ['hero headings', 'strong emphasis'] }
                    ],
                    lineHeights: [
                        { value: 1.2, name: 'Tight', usage: ['headings'] },
                        { value: 1.5, name: 'Normal', usage: ['body text'] },
                        { value: 1.8, name: 'Relaxed', usage: ['large text'] }
                    ]
                },
                components: {
                    buttons: [
                        {
                            id: 'btn-primary',
                            name: 'Primary Button',
                            category: 'buttons',
                            usage: 156,
                            rating: 4.8,
                            variants: [
                                {
                                    name: 'Default',
                                    description: '기본 주요 버튼',
                                    code: '<button className="btn btn-primary">Button</button>',
                                    preview: 'Primary Button',
                                    props: { variant: 'primary', size: 'medium' }
                                }
                            ],
                            props: [
                                {
                                    name: 'variant',
                                    type: 'string',
                                    required: false,
                                    default: 'primary',
                                    description: '버튼 스타일 변형'
                                }
                            ],
                            examples: [
                                {
                                    name: '기본 사용법',
                                    description: '가장 기본적인 주요 버튼',
                                    code: '<button className="btn btn-primary">Click me</button>',
                                    preview: 'Click me'
                                }
                            ]
                        }
                    ],
                    inputs: [],
                    cards: [],
                    modals: [],
                    navigation: [],
                    data: [],
                    feedback: []
                },
                spacing: {
                    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64],
                    units: 'px',
                    usage: {
                        'xs': '4px',
                        'sm': '8px',
                        'md': '16px',
                        'lg': '24px',
                        'xl': '32px',
                        '2xl': '48px'
                    }
                },
                breakpoints: {
                    mobile: '640px',
                    tablet: '768px',
                    desktop: '1024px',
                    wide: '1280px',
                    usage: {
                        'sm': '640px',
                        'md': '768px',
                        'lg': '1024px',
                        'xl': '1280px'
                    }
                }
            }
        ];

        setDesignSystems(mockSystems);
        if (mockSystems.length > 0) {
            setSelectedSystem(mockSystems[0]);
        }
    }, []);

    const handleGenerateDesign = async () => {
        if (!generationPrompt.trim()) return;

        setIsGenerating(true);
        setGenerationProgress(0);

        // 시뮬레이션: 디자인 생성 진행률
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setGenerationProgress(i);
        }

        const newSystem: DesignSystem = {
            id: `system-${Date.now()}`,
            name: `AI 생성 디자인 시스템 ${designSystems.length + 1}`,
            description: generationPrompt,
            theme: 'light',
            version: '1.0.0',
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            usage: { projects: 0, components: 0, downloads: 0 },
            colors: { primary: [], secondary: [], neutral: [], semantic: { success: [], warning: [], error: [], info: [] }, gradients: [] },
            typography: { fonts: [], scales: [], weights: [], lineHeights: [] },
            components: { buttons: [], inputs: [], cards: [], modals: [], navigation: [], data: [], feedback: [] },
            spacing: { scale: [], units: 'px', usage: {} },
            breakpoints: { mobile: '', tablet: '', desktop: '', wide: '', usage: {} }
        };

        setDesignSystems(prev => [...prev, newSystem]);
        setSelectedSystem(newSystem);
        setGenerationPrompt('');
        setIsGenerating(false);
        setGenerationProgress(0);
        onSystemCreate?.(newSystem);
    };

    const getAccessibilityColor = (wcag: string) => {
        switch (wcag) {
            case 'AAA': return 'text-green-600 bg-green-50';
            case 'AA': return 'text-blue-600 bg-blue-50';
            case 'fail': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-600 bg-green-50';
            case 'draft': return 'text-yellow-600 bg-yellow-50';
            case 'archived': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Palette className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">AI 디자인 시스템</h2>
                            <p className="text-sm text-gray-500">AI가 디자인 시스템을 생성하고 관리합니다</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>새 디자인 시스템</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4">
                    {[
                        { id: 'systems', label: '시스템', icon: Layout },
                        { id: 'colors', label: '색상', icon: PaletteIcon },
                        { id: 'typography', label: '타이포그래피', icon: Type },
                        { id: 'components', label: '컴포넌트', icon: Grid },
                        { id: 'generator', label: '생성기', icon: Sparkles },
                        { id: 'analytics', label: '분석', icon: BarChart3 },
                        { id: 'settings', label: '설정', icon: Settings }
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'systems' && (
                        <motion.div
                            key="systems"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-4">
                                {designSystems.map((system) => (
                                    <motion.div
                                        key={system.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedSystem(system)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Palette className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                                                    <p className="text-sm text-gray-500">{system.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.status)}`}>
                                                    {system.status}
                                                </span>
                                                <span className="text-xs text-gray-500">v{system.version}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>프로젝트: {system.usage.projects}</span>
                                                <span>컴포넌트: {system.usage.components}</span>
                                                <span>다운로드: {system.usage.downloads}</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                    <Edit className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                    <Share2 className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                    <Download className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'colors' && selectedSystem && (
                        <motion.div
                            key="colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* Primary Colors */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Colors</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedSystem.colors.primary.map((color, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div
                                                        className="w-12 h-12 rounded-lg border border-gray-200"
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{color.name}</h4>
                                                        <p className="text-sm text-gray-500">{color.hex}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">RGB:</span>
                                                        <span className="font-mono">{color.rgb}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">HSL:</span>
                                                        <span className="font-mono">{color.hsl}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">WCAG:</span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccessibilityColor(color.accessibility.wcag)}`}>
                                                            {color.accessibility.wcag}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Semantic Colors */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Colors</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Object.entries(selectedSystem.colors.semantic).map(([category, colors]) => (
                                            <div key={category} className="space-y-3">
                                                <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                                                {colors.map((color, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div
                                                                className="w-8 h-8 rounded border border-gray-200"
                                                                style={{ backgroundColor: color.hex }}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{color.name}</p>
                                                                <p className="text-xs text-gray-500">{color.hex}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccessibilityColor(color.accessibility.wcag)}`}>
                                                            {color.accessibility.wcag}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gradients */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradients</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSystem.colors.gradients.map((gradient, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div
                                                    className="w-full h-20 rounded-lg mb-3"
                                                    style={{
                                                        background: `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`
                                                    }}
                                                />
                                                <h4 className="font-medium text-gray-900 mb-2">{gradient.name}</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Direction:</span>
                                                        <span className="capitalize">{gradient.direction}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Angle:</span>
                                                        <span>{gradient.angle}°</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'typography' && selectedSystem && (
                        <motion.div
                            key="typography"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* Font Families */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h3>
                                    <div className="space-y-4">
                                        {selectedSystem.typography.fonts.map((font, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900">{font.name}</h4>
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                                                        {font.category}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Category:</span>
                                                        <span className="capitalize">{font.category}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Fallback:</span>
                                                        <span className="font-mono">{font.fallback.join(', ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Typography Scale */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography Scale</h3>
                                    <div className="space-y-4">
                                        {selectedSystem.typography.scales.map((scale, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4
                                                        className="font-medium text-gray-900"
                                                        style={{
                                                            fontSize: scale.size,
                                                            lineHeight: scale.lineHeight,
                                                            fontWeight: scale.weight
                                                        }}
                                                    >
                                                        {scale.name}
                                                    </h4>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Size:</span>
                                                        <span className="font-mono">{scale.size}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Line Height:</span>
                                                        <span className="font-mono">{scale.lineHeight}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Weight:</span>
                                                        <span className="font-mono">{scale.weight}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'components' && selectedSystem && (
                        <motion.div
                            key="components"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* Component Categories */}
                                {Object.entries(selectedSystem.components).map(([category, components]) => (
                                    <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{category}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {components.map((component: any) => (
                                                <div key={component.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium text-gray-900">{component.name}</h4>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                            <span className="text-sm text-gray-600">{component.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Usage:</span>
                                                            <span>{component.usage} times</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Variants:</span>
                                                            <span>{component.variants.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'generator' && (
                        <motion.div
                            key="generator"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Generation Type Selection */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">생성 유형 선택</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'component', label: '컴포넌트', icon: Grid, description: 'UI 컴포넌트 생성' },
                                            { id: 'color', label: '색상 팔레트', icon: PaletteIcon, description: '색상 조합 생성' },
                                            { id: 'typography', label: '타이포그래피', icon: Type, description: '폰트 시스템 생성' }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedCategory(type.id as any)}
                                                className={`p-4 border rounded-lg text-left transition-colors ${selectedCategory === type.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <type.icon className="h-6 w-6 text-purple-600" />
                                                    <span className="font-medium text-gray-900">{type.label}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{type.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generation Prompt */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">디자인 요청</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                원하는 디자인을 설명하세요
                                            </label>
                                            <textarea
                                                value={generationPrompt}
                                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                                placeholder={
                                                    selectedCategory === 'component' ? '예: 모던한 카드 컴포넌트를 만들어주세요. 그림자와 호버 효과가 포함되어야 합니다.' :
                                                        selectedCategory === 'color' ? '예: 브랜드에 맞는 색상 팔레트를 만들어주세요. 파란색 계열로 전문적이고 신뢰감 있는 느낌이어야 합니다.' :
                                                            '예: 가독성이 좋은 타이포그래피 시스템을 만들어주세요. 헤딩과 본문 텍스트에 적합한 폰트 조합이어야 합니다.'
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                rows={6}
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateDesign}
                                            disabled={!generationPrompt.trim() || isGenerating}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                                    <span>디자인 생성 중... {generationProgress}%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5" />
                                                    <span>디자인 생성하기</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Generation Progress */}
                                {isGenerating && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">생성 진행률</h3>
                                        <div className="space-y-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${generationProgress}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>AI가 디자인을 분석하고 생성하고 있습니다...</span>
                                                <span>{generationProgress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && selectedSystem && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* Usage Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">프로젝트</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {selectedSystem.usage.projects}
                                                </p>
                                            </div>
                                            <Layout className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">컴포넌트</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {selectedSystem.usage.components}
                                                </p>
                                            </div>
                                            <Grid className="h-8 w-8 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">다운로드</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {selectedSystem.usage.downloads}
                                                </p>
                                            </div>
                                            <Download className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Color Analytics */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">색상 분석</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">총 색상 수</span>
                                            <span className="text-sm text-gray-600">
                                                {selectedSystem.colors.primary.length +
                                                    selectedSystem.colors.secondary.length +
                                                    selectedSystem.colors.neutral.length +
                                                    Object.values(selectedSystem.colors.semantic).flat().length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">WCAG AA 준수</span>
                                            <span className="text-sm text-green-600">100%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">그라디언트</span>
                                            <span className="text-sm text-gray-600">{selectedSystem.colors.gradients.length}개</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">디자인 시스템 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">자동 색상 생성</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">접근성 검사</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">자동 최적화</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIDesignSystem;
