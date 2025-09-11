import React, { useState, useEffect, useRef } from 'react';
import {
    Code,
    Play,
    Save,
    Download,
    Copy,
    RefreshCw,
    Settings,
    Zap,
    Lightbulb,
    CheckCircle,
    AlertTriangle,
    Clock,
    Star,
    Eye,
    FileText,
    GitBranch,
    Bug,
    Shield,
    Computer as Cpu,
    Database,
    Globe,
    Smartphone,
    Monitor,
    Server,
    Wifi,
    Lock,
    Unlock,
    ArrowRight,
    Plus,
    Trash2,
    Edit,
    Share2,
    History,
    TrendingUp,
    BarChart,
    Target,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeProject {
    id: string;
    name: string;
    description: string;
    language: string;
    framework: string;
    status: 'draft' | 'generating' | 'completed' | 'optimizing' | 'error';
    createdAt: Date;
    updatedAt: Date;
    files: CodeFile[];
    metrics: {
        linesOfCode: number;
        complexity: number;
        performance: number;
        security: number;
        maintainability: number;
        testCoverage: number;
    };
    aiSuggestions: AISuggestion[];
    optimizations: Optimization[];
    tests: TestCase[];
}

interface CodeFile {
    id: string;
    name: string;
    path: string;
    content: string;
    language: string;
    size: number;
    lastModified: Date;
    status: 'generated' | 'modified' | 'optimized' | 'tested';
}

interface AISuggestion {
    id: string;
    type: 'performance' | 'security' | 'readability' | 'best_practice' | 'optimization';
    title: string;
    description: string;
    code: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    applied: boolean;
    confidence: number;
}

interface Optimization {
    id: string;
    type: 'performance' | 'memory' | 'security' | 'readability';
    title: string;
    description: string;
    beforeCode: string;
    afterCode: string;
    improvement: number;
    applied: boolean;
    timestamp: Date;
}

interface TestCase {
    id: string;
    name: string;
    description: string;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    status: 'pass' | 'fail' | 'pending';
    executionTime: number;
}

interface AICodeGeneratorProps {
    onProjectCreate?: (project: CodeProject) => void;
    onProjectUpdate?: (projectId: string, updates: Partial<CodeProject>) => void;
    onProjectDelete?: (projectId: string) => void;
    onCodeGenerate?: (prompt: string, context: any) => void;
    onCodeOptimize?: (fileId: string, optimizations: Optimization[]) => void;
    onTestRun?: (projectId: string, tests: TestCase[]) => void;
    onExportProject?: (projectId: string, format: string) => void;
    onShareProject?: (projectId: string, shareOptions: any) => void;
}

const AICodeGenerator: React.FC<AICodeGeneratorProps> = ({
    onProjectCreate,
    onProjectUpdate,
    onProjectDelete,
    onCodeGenerate,
    onCodeOptimize,
    onTestRun,
    onExportProject,
    onShareProject
}) => {
    const [projects, setProjects] = useState<CodeProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<CodeProject | null>(null);
    const [activeTab, setActiveTab] = useState<'projects' | 'generator' | 'optimizer' | 'tester' | 'analytics' | 'settings'>('projects');
    const [generationPrompt, setGenerationPrompt] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [selectedFramework, setSelectedFramework] = useState('react');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
    const [codeEditorContent, setCodeEditorContent] = useState('');

    const codeEditorRef = useRef<HTMLTextAreaElement>(null);

    // Mock projects
    useEffect(() => {
        const mockProjects: CodeProject[] = [
            {
                id: '1',
                name: 'CORBU.AI 대시보드',
                description: 'React 기반 AI 대시보드 애플리케이션',
                language: 'typescript',
                framework: 'react',
                status: 'completed',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-21'),
                files: [
                    {
                        id: 'file1',
                        name: 'Dashboard.tsx',
                        path: 'src/components/Dashboard.tsx',
                        content: `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardProps {
  data: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 데이터 로딩 로직
  }, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard"
    >
      <h1>CORBU.AI 대시보드</h1>
      {/* 대시보드 내용 */}
    </motion.div>
  );
};

export default Dashboard;`,
                        language: 'typescript',
                        size: 1024,
                        lastModified: new Date('2024-01-21'),
                        status: 'generated'
                    }
                ],
                metrics: {
                    linesOfCode: 150,
                    complexity: 0.3,
                    performance: 0.85,
                    security: 0.9,
                    maintainability: 0.8,
                    testCoverage: 0.75
                },
                aiSuggestions: [
                    {
                        id: 'suggestion1',
                        type: 'performance',
                        title: '메모이제이션 최적화',
                        description: 'useMemo를 사용하여 불필요한 재렌더링을 방지하세요.',
                        code: 'const memoizedData = useMemo(() => processData(data), [data]);',
                        impact: 'high',
                        effort: 'low',
                        applied: false,
                        confidence: 0.9
                    }
                ],
                optimizations: [
                    {
                        id: 'opt1',
                        type: 'performance',
                        title: 'React.memo 적용',
                        description: '컴포넌트를 React.memo로 감싸서 성능을 향상시킵니다.',
                        beforeCode: 'const Dashboard = ({ data }) => {',
                        afterCode: 'const Dashboard = React.memo(({ data }) => {',
                        improvement: 15,
                        applied: true,
                        timestamp: new Date('2024-01-20')
                    }
                ],
                tests: [
                    {
                        id: 'test1',
                        name: 'Dashboard 렌더링 테스트',
                        description: 'Dashboard 컴포넌트가 올바르게 렌더링되는지 확인',
                        input: 'data: []',
                        expectedOutput: 'Dashboard 컴포넌트 렌더링',
                        actualOutput: 'Dashboard 컴포넌트 렌더링',
                        status: 'pass',
                        executionTime: 0.5
                    }
                ]
            }
        ];

        setProjects(mockProjects);
        if (mockProjects.length > 0) {
            setSelectedProject(mockProjects[0]);
        }
    }, []);

    const languages = [
        { value: 'javascript', label: 'JavaScript', icon: '⚡' },
        { value: 'typescript', label: 'TypeScript', icon: '🔷' },
        { value: 'python', label: 'Python', icon: '🐍' },
        { value: 'java', label: 'Java', icon: '☕' },
        { value: 'csharp', label: 'C#', icon: '🔷' },
        { value: 'go', label: 'Go', icon: '🐹' },
        { value: 'rust', label: 'Rust', icon: '🦀' },
        { value: 'php', label: 'PHP', icon: '🐘' }
    ];

    const frameworks = {
        javascript: [
            { value: 'react', label: 'React', icon: '⚛️' },
            { value: 'vue', label: 'Vue.js', icon: '💚' },
            { value: 'angular', label: 'Angular', icon: '🅰️' },
            { value: 'node', label: 'Node.js', icon: '🟢' },
            { value: 'express', label: 'Express', icon: '🚂' }
        ],
        typescript: [
            { value: 'react', label: 'React', icon: '⚛️' },
            { value: 'vue', label: 'Vue.js', icon: '💚' },
            { value: 'angular', label: 'Angular', icon: '🅰️' },
            { value: 'nest', label: 'NestJS', icon: '🪺' }
        ],
        python: [
            { value: 'django', label: 'Django', icon: '🎸' },
            { value: 'flask', label: 'Flask', icon: '🍶' },
            { value: 'fastapi', label: 'FastAPI', icon: '⚡' },
            { value: 'tensorflow', label: 'TensorFlow', icon: '🧠' }
        ]
    };

    const handleGenerateCode = async () => {
        if (!generationPrompt.trim()) return;

        setIsGenerating(true);
        setGenerationProgress(0);

        // 시뮬레이션: 코드 생성 진행률
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setGenerationProgress(i);
        }

        const newProject: CodeProject = {
            id: `project-${Date.now()}`,
            name: `AI 생성 프로젝트 ${projects.length + 1}`,
            description: generationPrompt,
            language: selectedLanguage,
            framework: selectedFramework,
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
            files: [
                {
                    id: `file-${Date.now()}`,
                    name: 'GeneratedCode.tsx',
                    path: 'src/GeneratedCode.tsx',
                    content: `// AI가 생성한 코드
import React from 'react';

const GeneratedComponent: React.FC = () => {
  return (
    <div className="generated-component">
      <h1>AI 생성 코드</h1>
      <p>${generationPrompt}</p>
    </div>
  );
};

export default GeneratedComponent;`,
                    language: selectedLanguage,
                    size: generationPrompt.length * 2,
                    lastModified: new Date(),
                    status: 'generated'
                }
            ],
            metrics: {
                linesOfCode: Math.ceil(generationPrompt.length / 10),
                complexity: 0.3 + Math.random() * 0.4,
                performance: 0.7 + Math.random() * 0.2,
                security: 0.8 + Math.random() * 0.1,
                maintainability: 0.7 + Math.random() * 0.2,
                testCoverage: 0.6 + Math.random() * 0.3
            },
            aiSuggestions: [],
            optimizations: [],
            tests: []
        };

        setProjects(prev => [...prev, newProject]);
        setSelectedProject(newProject);
        setGenerationPrompt('');
        setIsGenerating(false);
        setGenerationProgress(0);
        onProjectCreate?.(newProject);
    };

    const handleOptimizeCode = async (fileId: string) => {
        setIsOptimizing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const optimization: Optimization = {
            id: `opt-${Date.now()}`,
            type: 'performance',
            title: '코드 최적화',
            description: 'AI가 코드를 분석하여 성능을 개선했습니다.',
            beforeCode: 'const data = expensiveCalculation();',
            afterCode: 'const data = useMemo(() => expensiveCalculation(), [deps]);',
            improvement: 25,
            applied: false,
            timestamp: new Date()
        };

        if (selectedProject) {
            const updatedProject = {
                ...selectedProject,
                optimizations: [...selectedProject.optimizations, optimization]
            };
            setSelectedProject(updatedProject);
            setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
        }

        setIsOptimizing(false);
        onCodeOptimize?.(fileId, [optimization]);
    };

    const handleRunTests = async (projectId: string) => {
        setIsTesting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const testResults: TestCase[] = [
            {
                id: `test-${Date.now()}`,
                name: '기본 렌더링 테스트',
                description: '컴포넌트가 올바르게 렌더링되는지 확인',
                input: 'props: {}',
                expectedOutput: '컴포넌트 렌더링',
                actualOutput: '컴포넌트 렌더링',
                status: 'pass',
                executionTime: 0.3
            },
            {
                id: `test-${Date.now() + 1}`,
                name: '상태 변경 테스트',
                description: '상태 변경이 올바르게 작동하는지 확인',
                input: 'setState 호출',
                expectedOutput: '상태 업데이트',
                actualOutput: '상태 업데이트',
                status: 'pass',
                executionTime: 0.2
            }
        ];

        if (selectedProject) {
            const updatedProject = {
                ...selectedProject,
                tests: [...selectedProject.tests, ...testResults]
            };
            setSelectedProject(updatedProject);
            setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
        }

        setIsTesting(false);
        onTestRun?.(projectId, testResults);
    };

    const getLanguageIcon = (language: string) => {
        const lang = languages.find(l => l.value === language);
        return lang?.icon || '📄';
    };

    const getFrameworkIcon = (framework: string) => {
        const frameworkList = frameworks[selectedLanguage as keyof typeof frameworks] || [];
        const fw = frameworkList.find(f => f.value === framework);
        return fw?.icon || '⚙️';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'generating': return 'text-blue-600 bg-blue-50';
            case 'optimizing': return 'text-yellow-600 bg-yellow-50';
            case 'error': return 'text-red-600 bg-red-50';
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
                            <Code className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">AI 코드 생성기</h2>
                            <p className="text-sm text-gray-500">AI가 코드를 생성하고 최적화합니다</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>새 프로젝트</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4">
                    {[
                        { id: 'projects', label: '프로젝트', icon: Code },
                        { id: 'generator', label: '코드 생성', icon: Sparkles },
                        { id: 'optimizer', label: '최적화', icon: Zap },
                        { id: 'tester', label: '테스트', icon: Bug },
                        { id: 'analytics', label: '분석', icon: BarChart },
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
                    {activeTab === 'projects' && (
                        <motion.div
                            key="projects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Code className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                                    <p className="text-sm text-gray-500">{project.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {getLanguageIcon(project.language)} {project.language}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>파일: {project.files.length}개</span>
                                                <span>코드 라인: {project.metrics.linesOfCode}</span>
                                                <span>성능: {Math.round(project.metrics.performance * 100)}%</span>
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

                    {activeTab === 'generator' && (
                        <motion.div
                            key="generator"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* 언어 및 프레임워크 선택 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 설정</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                프로그래밍 언어
                                            </label>
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                {languages.map((lang) => (
                                                    <option key={lang.value} value={lang.value}>
                                                        {lang.icon} {lang.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                프레임워크
                                            </label>
                                            <select
                                                value={selectedFramework}
                                                onChange={(e) => setSelectedFramework(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                {(frameworks[selectedLanguage as keyof typeof frameworks] || []).map((fw) => (
                                                    <option key={fw.value} value={fw.value}>
                                                        {fw.icon} {fw.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 코드 생성 프롬프트 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">코드 생성 요청</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                원하는 기능을 설명하세요
                                            </label>
                                            <textarea
                                                value={generationPrompt}
                                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                                placeholder="예: React 컴포넌트로 사용자 대시보드를 만들어주세요. 차트와 데이터 테이블이 포함되어야 합니다."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                rows={6}
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateCode}
                                            disabled={!generationPrompt.trim() || isGenerating}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                                    <span>코드 생성 중... {generationProgress}%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5" />
                                                    <span>코드 생성하기</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 생성 진행률 */}
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
                                                <span>AI가 코드를 분석하고 생성하고 있습니다...</span>
                                                <span>{generationProgress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'optimizer' && selectedProject && (
                        <motion.div
                            key="optimizer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* 프로젝트 정보 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{selectedProject.name}</h3>
                                            <p className="text-gray-500">{selectedProject.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleOptimizeCode(selectedProject.files[0]?.id || '')}
                                            disabled={isOptimizing}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {isOptimizing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span>최적화 중...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="h-4 w-4" />
                                                    <span>코드 최적화</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 최적화 제안 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 최적화 제안</h3>
                                    <div className="space-y-4">
                                        {selectedProject.aiSuggestions.map((suggestion) => (
                                            <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm font-mono">
                                                            {suggestion.code}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                                                                suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                            }`}>
                                                            {suggestion.impact} impact
                                                        </span>
                                                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 최적화 히스토리 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최적화 히스토리</h3>
                                    <div className="space-y-4">
                                        {selectedProject.optimizations.map((optimization) => (
                                            <div key={optimization.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{optimization.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1">Before</p>
                                                                <div className="p-2 bg-red-50 rounded text-sm font-mono">
                                                                    {optimization.beforeCode}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1">After</p>
                                                                <div className="p-2 bg-green-50 rounded text-sm font-mono">
                                                                    {optimization.afterCode}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="text-sm font-medium text-green-600">
                                                            +{optimization.improvement}%
                                                        </span>
                                                        {optimization.applied && (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tester' && selectedProject && (
                        <motion.div
                            key="tester"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* 테스트 실행 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">테스트 실행</h3>
                                            <p className="text-gray-500">프로젝트의 모든 테스트를 실행합니다</p>
                                        </div>
                                        <button
                                            onClick={() => handleRunTests(selectedProject.id)}
                                            disabled={isTesting}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {isTesting ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span>테스트 실행 중...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4" />
                                                    <span>테스트 실행</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 테스트 결과 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">테스트 결과</h3>
                                    <div className="space-y-4">
                                        {selectedProject.tests.map((test) => (
                                            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-medium text-gray-500">Input</p>
                                                                <p className="font-mono">{test.input}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-500">Expected</p>
                                                                <p className="font-mono">{test.expectedOutput}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-500">Actual</p>
                                                                <p className="font-mono">{test.actualOutput}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.status === 'pass' ? 'bg-green-100 text-green-700' :
                                                                test.status === 'fail' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {test.status}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {test.executionTime}s
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && selectedProject && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* 메트릭 카드 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">성능</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {Math.round(selectedProject.metrics.performance * 100)}%
                                                </p>
                                            </div>
                                            <Zap className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">보안</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {Math.round(selectedProject.metrics.security * 100)}%
                                                </p>
                                            </div>
                                            <Shield className="h-8 w-8 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">테스트 커버리지</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {Math.round(selectedProject.metrics.testCoverage * 100)}%
                                                </p>
                                            </div>
                                            <Target className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* 상세 메트릭 */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 분석</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">코드 라인 수</span>
                                            <span className="text-sm text-gray-600">{selectedProject.metrics.linesOfCode}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">복잡도</span>
                                            <span className="text-sm text-gray-600">{Math.round(selectedProject.metrics.complexity * 100)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">유지보수성</span>
                                            <span className="text-sm text-gray-600">{Math.round(selectedProject.metrics.maintainability * 100)}%</span>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 코드 생성기 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">자동 최적화</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">자동 테스트 생성</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">코드 리뷰</span>
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

export default AICodeGenerator;
