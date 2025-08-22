import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    MessageSquare,
    Upload,
    Search,
    Brain,
    Sparkles,
    Target,
    Eye,
    Download,
    Share2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Settings,
    Filter,
    BarChart3,
    Lightbulb,
    CheckCircle,
    AlertTriangle,
    Clock,
    Users,
    Star,
    Heart,
    Zap,
    ArrowRight,
    File,
    Image,
    Video,
    Music,
    Archive,
    Code,
    Database,
    Presentation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyzedFile {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: Date;
    content: string;
    summary: string;
    keywords: string[];
    topics: string[];
    entities: Array<{
        name: string;
        type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'percentage';
        confidence: number;
    }>;
    sentiment: 'positive' | 'negative' | 'neutral';
    language: string;
    readingTime: number;
    wordCount: number;
    analysis: {
        complexity: number;
        readability: number;
        relevance: number;
        accuracy: number;
    };
    extractedData: Record<string, any>;
    insights: Array<{
        type: 'key_point' | 'trend' | 'anomaly' | 'recommendation';
        title: string;
        description: string;
        confidence: number;
        source: string;
    }>;
}

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    files?: AnalyzedFile[];
    analysis?: {
        fileReferences: string[];
        confidence: number;
        sources: string[];
    };
    feedback?: {
        helpful: boolean;
        reason?: string;
    };
    metadata?: {
        model: string;
        tokens: number;
        responseTime: number;
        fileAnalysisTime: number;
    };
}

interface FileAnalysisChatSystemProps {
    onFileUpload?: (files: File[]) => void;
    onMessageSend?: (message: string, files?: AnalyzedFile[]) => void;
    onAnalysisComplete?: (analysis: AnalyzedFile) => void;
    onExportAnalysis?: (fileId: string, format: string) => void;
    onShareAnalysis?: (fileId: string, shareOptions: any) => void;
}

const FileAnalysisChatSystem: React.FC<FileAnalysisChatSystemProps> = ({
    onFileUpload,
    onMessageSend,
    onAnalysisComplete,
    onExportAnalysis,
    onShareAnalysis
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'analysis' | 'insights' | 'settings'>('chat');
    const [selectedFile, setSelectedFile] = useState<AnalyzedFile | null>(null);
    const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, number>>({});
    const [analysisSettings, setAnalysisSettings] = useState({
        extractText: true,
        extractEntities: true,
        sentimentAnalysis: true,
        keywordExtraction: true,
        topicModeling: true,
        dataExtraction: true,
        insightGeneration: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Mock analyzed files
    useEffect(() => {
        const mockFiles: AnalyzedFile[] = [
            {
                id: 'file1',
                name: 'CORBU.AI_프로젝트_제안서.pdf',
                type: 'pdf',
                size: 2048576,
                uploadedAt: new Date('2024-01-15'),
                content: 'CORBU.AI는 혁신적인 AI 기반 프로젝트 관리 플랫폼입니다. 이 플랫폼은 프로젝트 효율성을 50% 향상시키고, 팀 협업을 개선하며, 실시간 분석을 제공합니다.',
                summary: 'CORBU.AI 플랫폼의 주요 기능과 혜택에 대한 제안서',
                keywords: ['AI', '프로젝트 관리', '플랫폼', '효율성', '협업', '분석'],
                topics: ['기술', '비즈니스', '프로젝트 관리', 'AI/ML'],
                entities: [
                    { name: 'CORBU.AI', type: 'organization', confidence: 0.95 },
                    { name: '50%', type: 'percentage', confidence: 0.88 },
                    { name: '2024-01-15', type: 'date', confidence: 0.92 }
                ],
                sentiment: 'positive',
                language: 'ko',
                readingTime: 5,
                wordCount: 150,
                analysis: {
                    complexity: 0.7,
                    readability: 0.8,
                    relevance: 0.9,
                    accuracy: 0.85
                },
                extractedData: {
                    company: 'CORBU.AI',
                    efficiency_improvement: '50%',
                    platform_type: 'AI 기반 프로젝트 관리',
                    key_features: ['실시간 분석', '팀 협업', '효율성 향상']
                },
                insights: [
                    {
                        type: 'key_point',
                        title: '효율성 향상',
                        description: '프로젝트 효율성이 50% 향상된다고 명시되어 있습니다.',
                        confidence: 0.9,
                        source: 'content'
                    },
                    {
                        type: 'recommendation',
                        title: 'AI 기능 활용',
                        description: 'AI 기반 기능을 더 적극적으로 활용하는 것을 권장합니다.',
                        confidence: 0.8,
                        source: 'analysis'
                    }
                ]
            }
        ];

        setAnalyzedFiles(mockFiles);
    }, []);

    const getFileIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return <FileText className="h-5 w-5" />;
            case 'doc':
            case 'docx': return <FileText className="h-5 w-5" />;
            case 'xls':
            case 'xlsx': return <FileText className="h-5 w-5" />;
            case 'ppt':
            case 'pptx': return <Presentation className="h-5 w-5" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <Image className="h-5 w-5" />;
            case 'mp4':
            case 'avi':
            case 'mov': return <Video className="h-5 w-5" />;
            case 'mp3':
            case 'wav': return <Music className="h-5 w-5" />;
            case 'zip':
            case 'rar': return <Archive className="h-5 w-5" />;
            case 'js':
            case 'ts':
            case 'py':
            case 'java': return <Code className="h-5 w-5" />;
            case 'sql':
            case 'db': return <Database className="h-5 w-5" />;
            default: return <File className="h-5 w-5" />;
        }
    };

    const getFileTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return 'text-red-600 bg-red-50';
            case 'doc':
            case 'docx': return 'text-blue-600 bg-blue-50';
            case 'xls':
            case 'xlsx': return 'text-green-600 bg-green-50';
            case 'ppt':
            case 'pptx': return 'text-orange-600 bg-orange-50';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleFileUpload = async (files: FileList) => {
        setIsAnalyzing(true);

        for (const file of Array.from(files)) {
            setFileUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

            // Simulate file analysis progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setFileUploadProgress(prev => ({ ...prev, [file.name]: i }));
            }

            // Simulate AI analysis
            const analyzedFile: AnalyzedFile = {
                id: `file-${Date.now()}-${Math.random()}`,
                name: file.name,
                type: file.name.split('.').pop() || 'unknown',
                size: file.size,
                uploadedAt: new Date(),
                content: `분석된 ${file.name} 파일의 내용입니다. AI가 파일을 분석하여 텍스트, 데이터, 인사이트를 추출했습니다.`,
                summary: `${file.name} 파일의 주요 내용 요약`,
                keywords: ['키워드1', '키워드2', '키워드3'],
                topics: ['주제1', '주제2'],
                entities: [
                    { name: '엔티티1', type: 'organization', confidence: 0.8 },
                    { name: '엔티티2', type: 'person', confidence: 0.7 }
                ],
                sentiment: 'positive',
                language: 'ko',
                readingTime: Math.ceil(file.size / 10000),
                wordCount: Math.ceil(file.size / 100),
                analysis: {
                    complexity: 0.6 + Math.random() * 0.3,
                    readability: 0.7 + Math.random() * 0.2,
                    relevance: 0.8 + Math.random() * 0.2,
                    accuracy: 0.75 + Math.random() * 0.2
                },
                extractedData: {
                    filename: file.name,
                    filesize: file.size,
                    uploadDate: new Date().toISOString()
                },
                insights: [
                    {
                        type: 'key_point',
                        title: '주요 포인트',
                        description: '파일에서 추출된 주요 정보입니다.',
                        confidence: 0.8,
                        source: 'content'
                    }
                ]
            };

            setAnalyzedFiles(prev => [...prev, analyzedFile]);
            onAnalysisComplete?.(analyzedFile);
        }

        setIsAnalyzing(false);
        setFileUploadProgress({});
    };

    const handleSendMessage = async () => {
        if (!currentMessage.trim() && analyzedFiles.length === 0) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            type: 'user',
            content: currentMessage,
            timestamp: new Date(),
            files: analyzedFiles
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsTyping(true);

        // Simulate AI response generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiResponse: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: generateAIResponse(currentMessage, analyzedFiles),
            timestamp: new Date(),
            analysis: {
                fileReferences: analyzedFiles.map(f => f.name),
                confidence: 0.85,
                sources: analyzedFiles.map(f => f.name)
            },
            metadata: {
                model: 'gpt-4',
                tokens: 150,
                responseTime: 2000,
                fileAnalysisTime: 1000
            }
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        onMessageSend?.(currentMessage, analyzedFiles);
    };

    const generateAIResponse = (question: string, files: AnalyzedFile[]): string => {
        if (files.length === 0) {
            return '안녕하세요! 파일을 업로드하시면 해당 파일에 대한 질문에 답변해드릴 수 있습니다.';
        }

        const fileNames = files.map(f => f.name).join(', ');
        const fileContent = files.map(f => f.content).join(' ');
        const insights = files.flatMap(f => f.insights);

        if (question.toLowerCase().includes('요약') || question.toLowerCase().includes('summary')) {
            return `업로드된 파일들(${fileNames})을 분석한 결과:\n\n${files.map(f => `• ${f.name}: ${f.summary}`).join('\n')}\n\n주요 인사이트:\n${insights.map(i => `• ${i.title}: ${i.description}`).join('\n')}`;
        }

        if (question.toLowerCase().includes('키워드') || question.toLowerCase().includes('keyword')) {
            const allKeywords = files.flatMap(f => f.keywords);
            const uniqueKeywords = Array.from(new Set(allKeywords));
            return `파일에서 추출된 주요 키워드:\n${uniqueKeywords.map(k => `• ${k}`).join('\n')}`;
        }

        if (question.toLowerCase().includes('감정') || question.toLowerCase().includes('sentiment')) {
            const sentiments = files.map(f => `${f.name}: ${f.sentiment === 'positive' ? '긍정적' : f.sentiment === 'negative' ? '부정적' : '중립'}`);
            return `파일별 감정 분석 결과:\n${sentiments.join('\n')}`;
        }

        return `업로드된 파일들(${fileNames})을 분석한 결과를 바탕으로 답변드립니다:\n\n${fileContent.substring(0, 200)}...\n\n더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.`;
    };

    const handleFileSelect = (file: AnalyzedFile) => {
        setSelectedFile(file);
        setActiveTab('analysis');
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">파일 분석 대화</h2>
                            <p className="text-sm text-gray-500">파일을 업로드하고 AI와 대화하세요</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            <span>파일 업로드</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4">
                    {[
                        { id: 'chat', label: '대화', icon: MessageSquare },
                        { id: 'files', label: '파일', icon: FileText },
                        { id: 'analysis', label: '분석', icon: BarChart3 },
                        { id: 'insights', label: '인사이트', icon: Lightbulb },
                        { id: 'settings', label: '설정', icon: Settings }
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
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
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-3xl ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-4`}>
                                            <div className="flex items-start space-x-3">
                                                {message.type === 'ai' && (
                                                    <Brain className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                                    {message.files && message.files.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <p className="text-xs opacity-75 mb-2">참조된 파일:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {message.files.map((file) => (
                                                                    <span
                                                                        key={file.id}
                                                                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                                                    >
                                                                        {getFileIcon(file.type)}
                                                                        <span>{file.name}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {message.analysis && (
                                                        <div className="mt-2 text-xs opacity-75">
                                                            신뢰도: {Math.round(message.analysis.confidence * 100)}% |
                                                            소스: {message.analysis.sources.join(', ')}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center space-x-2 mt-3">
                                                        {message.type === 'ai' && (
                                                            <>
                                                                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                                                    <ThumbsUp className="h-4 w-4" />
                                                                </button>
                                                                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                                                    <ThumbsDown className="h-4 w-4" />
                                                                </button>
                                                                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <span className="text-xs opacity-75">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-gray-100 rounded-lg p-4">
                                            <div className="flex items-center space-x-2">
                                                <Brain className="h-5 w-5 text-blue-600" />
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                                <span className="text-sm text-gray-600">AI가 답변을 생성하고 있습니다...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={chatEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex items-end space-x-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={currentMessage}
                                            onChange={(e) => setCurrentMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="파일에 대해 질문하세요..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!currentMessage.trim() && analyzedFiles.length === 0}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Uploaded Files */}
                                {analyzedFiles.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">업로드된 파일:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {analyzedFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg"
                                                >
                                                    {getFileIcon(file.type)}
                                                    <span className="text-sm font-medium">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {Math.round(file.size / 1024)}KB
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'files' && (
                        <motion.div
                            key="files"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-4">
                                {analyzedFiles.map((file) => (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleFileSelect(file)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{file.name}</h3>
                                                    <p className="text-sm text-gray-500">{file.summary}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file.type)}`}>
                                                {file.type.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {file.keywords.slice(0, 5).map((keyword, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>업로드: {file.uploadedAt.toLocaleDateString()}</span>
                                                <span>크기: {Math.round(file.size / 1024)}KB</span>
                                                <span>단어: {file.wordCount}</span>
                                                <span>읽기시간: {file.readingTime}분</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analysis' && selectedFile && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                {/* File Header */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                {getFileIcon(selectedFile.type)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{selectedFile.name}</h2>
                                                <p className="text-gray-500">{selectedFile.summary}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onExportAnalysis?.(selectedFile.id, 'pdf')}
                                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>내보내기</span>
                                            </button>
                                            <button
                                                onClick={() => onShareAnalysis?.(selectedFile.id, {})}
                                                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span>공유</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">복잡도</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {Math.round(selectedFile.analysis.complexity * 100)}%
                                                </p>
                                            </div>
                                            <BarChart3 className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">가독성</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {Math.round(selectedFile.analysis.readability * 100)}%
                                                </p>
                                            </div>
                                            <Eye className="h-8 w-8 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">관련성</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {Math.round(selectedFile.analysis.relevance * 100)}%
                                                </p>
                                            </div>
                                            <Target className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">정확도</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {Math.round(selectedFile.analysis.accuracy * 100)}%
                                                </p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Entities */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">추출된 엔티티</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedFile.entities.map((entity, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="font-medium text-gray-900">{entity.name}</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({entity.type === 'person' ? '사람' :
                                                            entity.type === 'organization' ? '조직' :
                                                                entity.type === 'location' ? '위치' :
                                                                    entity.type === 'date' ? '날짜' :
                                                                        entity.type === 'money' ? '금액' : '비율'})
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {Math.round(entity.confidence * 100)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Insights */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 인사이트</h3>
                                    <div className="space-y-3">
                                        {selectedFile.insights.map((insight, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <Lightbulb className="h-5 w-5 text-yellow-600 mt-1" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                    <p className="text-sm text-gray-600">{insight.description}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            신뢰도: {Math.round(insight.confidence * 100)}%
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            소스: {insight.source}
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

                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 파일 인사이트</h3>
                                    <div className="space-y-4">
                                        {analyzedFiles.flatMap(file => file.insights).map((insight, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                                <Lightbulb className="h-5 w-5 text-yellow-600 mt-1" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                    <p className="text-sm text-gray-600">{insight.description}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            신뢰도: {Math.round(insight.confidence * 100)}%
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            소스: {insight.source}
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

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full overflow-y-auto p-4"
                        >
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 설정</h3>
                                <div className="space-y-4">
                                    {Object.entries(analysisSettings).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                {key === 'extractText' ? '텍스트 추출' :
                                                    key === 'extractEntities' ? '엔티티 추출' :
                                                        key === 'sentimentAnalysis' ? '감정 분석' :
                                                            key === 'keywordExtraction' ? '키워드 추출' :
                                                                key === 'topicModeling' ? '주제 모델링' :
                                                                    key === 'dataExtraction' ? '데이터 추출' :
                                                                        '인사이트 생성'}
                                            </span>
                                            <button
                                                onClick={() => setAnalysisSettings(prev => ({ ...prev, [key]: !value }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar,.js,.ts,.py,.java,.sql,.db"
            />
        </div>
    );
};

export default FileAnalysisChatSystem;
