import React, { useState, useEffect } from 'react';
import {
    Code,
    Play,
    Download,
    RefreshCw,
    Settings,
    Zap,
    CheckCircle,
    Bug,
    Shield,
    Plus,
    Trash2,
    Edit,
    Share2,
    BarChart,
    Target,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStatusColor, getPriorityColor } from '../../styles/themeColors';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

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
    onCodeGenerate?: (prompt: string, context: Record<string, unknown>) => void;
    onCodeOptimize?: (fileId: string, optimizations: Optimization[]) => void;
    onTestRun?: (projectId: string, tests: TestCase[]) => void;
    onExportProject?: (projectId: string, format: string) => void;
    onShareProject?: (projectId: string, shareOptions: Record<string, unknown>) => void;
}

const AICodeGenerator: React.FC<AICodeGeneratorProps> = ({
    onProjectCreate,
    onProjectUpdate: _onProjectUpdate,
    onProjectDelete: _onProjectDelete,
    onCodeGenerate: _onCodeGenerate,
    onCodeOptimize,
    onTestRun,
    onExportProject: _onExportProject,
    onShareProject: _onShareProject
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
  data: unknown[];
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
        const trimmedPrompt = coerceTrimmedString(generationPrompt, '');
        if (!trimmedPrompt) return;

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
            description: trimmedPrompt,
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
      <p>${trimmedPrompt}</p>
    </div>
  );
};

export default GeneratedComponent;`,
                    language: selectedLanguage,
                    size: trimmedPrompt.length * 2,
                    lastModified: new Date(),
                    status: 'generated'
                }
            ],
            metrics: {
                linesOfCode: Math.ceil(trimmedPrompt.length / 10),
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

    const getStatusStyle = (status: string) => {
        const colorMap: Record<string, string> = {
            completed: getStatusColor('success'),
            generating: 'var(--accent-info)',
            optimizing: getStatusColor('warning'),
            error: getStatusColor('error'),
        };
        return { color: colorMap[status] ?? 'var(--text-tertiary)', backgroundColor: 'var(--bg-tertiary)' };
    };

    return (
        <div className="rounded-lg shadow-sm border h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--bg-tertiary)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-secondary-muted)' }}>
                            <Code className="h-5 w-5" style={{ color: 'var(--accent-secondary)' }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI 코드 생성기</h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI가 코드를 생성하고 최적화합니다</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className="flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                            style={{ backgroundColor: 'var(--accent-secondary)' }}
                        >
                            <Plus className="h-4 w-4" />
                            <span>새 프로젝트</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 rounded-lg mt-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    {([
                        { id: 'projects', label: '프로젝트', icon: Code },
                        { id: 'generator', label: '코드 생성', icon: Sparkles },
                        { id: 'optimizer', label: '최적화', icon: Zap },
                        { id: 'tester', label: '테스트', icon: Bug },
                        { id: 'analytics', label: '분석', icon: BarChart },
                        { id: 'settings', label: '설정', icon: Settings }
                    ] as const).map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                                    color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                                    boxShadow: isActive ? 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))' : undefined,
                                }}
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
                                        className="rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border"
                                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-secondary-muted)' }}>
                                                    <Code className="h-5 w-5" style={{ color: 'var(--accent-secondary)' }} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{project.name}</h3>
                                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full" style={getStatusStyle(project.status)}>
                                                    {project.status}
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {getLanguageIcon(project.language)} {project.language}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span>파일: {project.files.length}개</span>
                                                <span>코드 라인: {project.metrics.linesOfCode}</span>
                                                <span>성능: {Math.round(project.metrics.performance * 100)}%</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 rounded transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 rounded transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    <Share2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 rounded transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 rounded transition-colors hover:opacity-80" style={{ color: 'var(--accent-error)' }}>
                                                    <Trash2 className="h-4 w-4" />
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>프로젝트 설정</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                프로그래밍 언어
                                            </label>
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                                className="w-full p-3 rounded-lg border focus:ring-2 focus:border-transparent"
                                                style={{ borderColor: 'var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                            >
                                                {languages.map((lang) => (
                                                    <option key={lang.value} value={lang.value}>
                                                        {lang.icon} {lang.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                프레임워크
                                            </label>
                                            <select
                                                value={selectedFramework}
                                                onChange={(e) => setSelectedFramework(e.target.value)}
                                                className="w-full p-3 rounded-lg border focus:ring-2 focus:border-transparent"
                                                style={{ borderColor: 'var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>코드 생성 요청</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                원하는 기능을 설명하세요
                                            </label>
                                            <textarea
                                                value={generationPrompt}
                                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                                placeholder="예: React 컴포넌트로 사용자 대시보드를 만들어주세요. 차트와 데이터 테이블이 포함되어야 합니다."
                                                className="w-full p-3 rounded-lg border focus:ring-2 focus:border-transparent resize-none"
                                                style={{ borderColor: 'var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                                rows={6}
                                            />
                                        </div>
                                        <button
                                            onClick={() => void handleGenerateCode()}
                                            disabled={!coerceTrimmedString(generationPrompt, '') || isGenerating}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                            style={{ backgroundColor: 'var(--accent-secondary)' }}
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
                                    <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>생성 진행률</h3>
                                        <div className="space-y-4">
                                            <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                                <div
                                                    className="h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${generationProgress}%`, backgroundColor: 'var(--accent-secondary)' }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedProject.name}</h3>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedProject.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleOptimizeCode(selectedProject.files[0]?.id || '')}
                                            disabled={isOptimizing}
                                            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
                                            style={{ backgroundColor: 'var(--accent-info)' }}
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI 최적화 제안</h3>
                                    <div className="space-y-4">
                                        {selectedProject.aiSuggestions.map((suggestion) => (
                                            <div key={suggestion.id} className="rounded-lg p-4 border" style={{ borderColor: 'var(--bg-tertiary)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{suggestion.title}</h4>
                                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{suggestion.description}</p>
                                                        <div className="mt-2 p-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                                            {suggestion.code}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ color: getPriorityColor(suggestion.impact), backgroundColor: 'var(--bg-tertiary)' }}>
                                                            {suggestion.impact} impact
                                                        </span>
                                                        <button className="p-1 rounded transition-colors hover:opacity-80" style={{ color: 'var(--accent-success)' }}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 최적화 히스토리 */}
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>최적화 히스토리</h3>
                                    <div className="space-y-4">
                                        {selectedProject.optimizations.map((optimization) => (
                                            <div key={optimization.id} className="rounded-lg p-4 border" style={{ borderColor: 'var(--bg-tertiary)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{optimization.title}</h4>
                                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{optimization.description}</p>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Before</p>
                                                                <div className="p-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--accent-error-muted, rgba(239,68,68,0.1))' }}>
                                                                    {optimization.beforeCode}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>After</p>
                                                                <div className="p-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--accent-success-muted, rgba(63,221,120,0.1))' }}>
                                                                    {optimization.afterCode}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="text-sm font-medium" style={{ color: 'var(--accent-success)' }}>
                                                            +{optimization.improvement}%
                                                        </span>
                                                        {optimization.applied && (
                                                            <CheckCircle className="h-4 w-4" style={{ color: 'var(--accent-success)' }} />
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>테스트 실행</h3>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>프로젝트의 모든 테스트를 실행합니다</p>
                                        </div>
                                        <button
                                            onClick={() => handleRunTests(selectedProject.id)}
                                            disabled={isTesting}
                                            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
                                            style={{ backgroundColor: 'var(--accent-success)' }}
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
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>테스트 결과</h3>
                                    <div className="space-y-4">
                                        {selectedProject.tests.map((test) => (
                                            <div key={test.id} className="rounded-lg p-4 border" style={{ borderColor: 'var(--bg-tertiary)' }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{test.name}</h4>
                                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{test.description}</p>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Input</p>
                                                                <p className="font-mono" style={{ color: 'var(--text-primary)' }}>{test.input}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Expected</p>
                                                                <p className="font-mono" style={{ color: 'var(--text-primary)' }}>{test.expectedOutput}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Actual</p>
                                                                <p className="font-mono" style={{ color: 'var(--text-primary)' }}>{test.actualOutput}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span
                                                            className="px-2 py-1 text-xs font-medium rounded-full"
                                                            style={{
                                                                color: test.status === 'pass' ? getStatusColor('success') : test.status === 'fail' ? getStatusColor('error') : getStatusColor('warning'),
                                                                backgroundColor: 'var(--bg-tertiary)',
                                                            }}
                                                        >
                                                            {test.status}
                                                        </span>
                                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>성능</p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--accent-info)' }}>
                                                    {Math.round(selectedProject.metrics.performance * 100)}%
                                                </p>
                                            </div>
                                            <Zap className="h-8 w-8" style={{ color: 'var(--accent-info)' }} />
                                        </div>
                                    </div>
                                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>보안</p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--accent-success)' }}>
                                                    {Math.round(selectedProject.metrics.security * 100)}%
                                                </p>
                                            </div>
                                            <Shield className="h-8 w-8" style={{ color: 'var(--accent-success)' }} />
                                        </div>
                                    </div>
                                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>테스트 커버리지</p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
                                                    {Math.round(selectedProject.metrics.testCoverage * 100)}%
                                                </p>
                                            </div>
                                            <Target className="h-8 w-8" style={{ color: 'var(--accent-secondary)' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* 상세 메트릭 */}
                                <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>상세 분석</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>코드 라인 수</span>
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedProject.metrics.linesOfCode}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>복잡도</span>
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{Math.round(selectedProject.metrics.complexity * 100)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>유지보수성</span>
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{Math.round(selectedProject.metrics.maintainability * 100)}%</span>
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
                            <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI 코드 생성기 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>자동 최적화</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full" style={{ backgroundColor: 'var(--accent-info)' }}>
                                            <span className="inline-block h-4 w-4 transform rounded-full translate-x-6" style={{ backgroundColor: 'var(--bg-primary)' }} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>자동 테스트 생성</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full" style={{ backgroundColor: 'var(--accent-info)' }}>
                                            <span className="inline-block h-4 w-4 transform rounded-full translate-x-6" style={{ backgroundColor: 'var(--bg-primary)' }} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>코드 리뷰</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                            <span className="inline-block h-4 w-4 transform rounded-full translate-x-1" style={{ backgroundColor: 'var(--bg-primary)' }} />
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
