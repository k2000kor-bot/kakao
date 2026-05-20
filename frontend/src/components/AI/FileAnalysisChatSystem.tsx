import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    MessageSquare,
    Upload,
    Brain,
    Target,
    Eye,
    Download,
    Share2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Settings,
    BarChart,
    Lightbulb,
    CheckCircle,
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
import { getFileTypeStyle } from '../../styles/themeColors';
import { resolveDeepseekFlagsForConversation } from '../../config/deepseekUiDefaults';
import { buildUnifiedGenerationPrompt, buildUnifiedChatContext } from '../../services/generationPromptBuilder';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../../utils/modernChatUrlStyle';
import {
    extractResponseContent,
    extractPipelineFollowUpsFromChatResponse,
    hasPipelineExtras,
    coerceTrimmedString,
    buildFeatureContextFromMessage,
    parseQuestionRequirementSections,
    parseInputIntent,
    type PipelineMessageExtras,
    scheduleAssistantNonStreamLoadingPhaseTimers,
    runAssistantNonStreamPostResponsePhases,
    ASSISTANT_PLACEHOLDER_ANALYZING,
    ASSISTANT_PLACEHOLDER_DRAFT,
    ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
    ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../../utils/chatInputUtils';
import {
    AssistantGensparkBody,
    GensparkPipelineExtrasPanel,
    GensparkNextActionChips,
} from '../genspark';
import { postChatJsonWithFallback } from '../../utils/apiClient';
import {
    mergeApiChatContextPayload,
    normalizeChatTurnsForApiMerge,
    resolveMergeOptionsFromHistoryAndExplicit,
    scenarioInheritMergeOptionsFromPipelineLikeMessages,
    toChatTurnWithPipelineExtras,
} from '../../services/modernChatContextBuilder';
import { errorLogger } from '../../utils/errorLogger';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from '../../services/multiLayerStyleAnalysisSystem';
import { resolveGensparkAgentIdFromWindowSearch } from '../../services/gensparkAgentRegistry';
import {
    buildComposerPipelineContextAppend,
    createPostChatRefinedAnswerFn,
    finalizeAssistantNonStreamTurn,
    isComposerSelfDevelopActiveForTurn,
} from '../../utils/composerAssistantTurnFinalize';
import { resolveComposerRegenerateUserTurn } from '../../utils/composerRegenerateTurn';
import { TEST_IDS } from '../../constants/testIds';
import './FileAnalysisChatSystem.css';

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
    extractedData: Record<string, unknown>;
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
    /** 생성 중 임시 AI 메시지 — 다음 요청 맥락 구성 시 제외 */
    generationPlaceholder?: boolean;
    /** Genspark형 파이프라인 메타 (메인 대화와 동일) */
    pipelineExtras?: PipelineMessageExtras;
    suggestedFollowUps?: string[];
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
    onShareAnalysis?: (fileId: string, shareOptions: Record<string, unknown>) => void;
}

const FileAnalysisChatSystem: React.FC<FileAnalysisChatSystemProps> = ({
    onFileUpload: _onFileUpload,
    onMessageSend,
    onAnalysisComplete,
    onExportAnalysis,
    onShareAnalysis
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    void isAnalyzing; // reserved for future loading indicator
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'analysis' | 'insights' | 'settings'>('chat');
    const [selectedFile, setSelectedFile] = useState<AnalyzedFile | null>(null);
    const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, number>>({});
    void fileUploadProgress; // reserved for progress UI
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
                name: 'CORBU_AI_프로젝트_제안서.pdf',
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
        const iconSize = 20;
        switch (type.toLowerCase()) {
            case 'pdf':
            case 'doc':
            case 'docx':
            case 'xls':
            case 'xlsx': return <FileText size={iconSize} aria-hidden />;
            case 'ppt':
            case 'pptx': return <Presentation size={iconSize} aria-hidden />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <Image size={iconSize} aria-hidden />;
            case 'mp4':
            case 'avi':
            case 'mov': return <Video size={iconSize} aria-hidden />;
            case 'mp3':
            case 'wav': return <Music size={iconSize} aria-hidden />;
            case 'zip':
            case 'rar': return <Archive size={iconSize} aria-hidden />;
            case 'js':
            case 'ts':
            case 'py':
            case 'java': return <Code size={iconSize} aria-hidden />;
            case 'sql':
            case 'db': return <Database size={iconSize} aria-hidden />;
            default: return <File size={iconSize} aria-hidden />;
        }
    };

    const getFileTypeStyleObj = (type: string) => getFileTypeStyle(type);

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

    type FileAnalysisSendOptions = {
        baseMessages?: ChatMessage[];
        filesSnapshot?: AnalyzedFile[];
    };

    const handleSendMessage = async (directText?: string, sendOpts?: FileAnalysisSendOptions) => {
        const priorMessages = sendOpts?.baseMessages ?? messages;
        const filesForTurn = sendOpts?.filesSnapshot ?? analyzedFiles;
        const fromInput = coerceTrimmedString(directText, currentMessage);
        if (!fromInput && filesForTurn.length === 0) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            type: 'user',
            content: fromInput || '(파일만 업로드됨)',
            timestamp: new Date(),
            files: filesForTurn,
        };

        const placeholderAiId = `ai-${Date.now()}`;
        const placeholderAi: ChatMessage = {
            id: placeholderAiId,
            type: 'ai',
            content: ASSISTANT_PLACEHOLDER_ANALYZING,
            timestamp: new Date(),
            generationPlaceholder: true,
        };

        setMessages([...priorMessages, userMessage, placeholderAi]);
        setCurrentMessage('');
        setIsTyping(true);

        let clearFileAnalysisNsPhases = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
            setMessages((prev) =>
                prev.map((m) => (m.id === placeholderAiId ? { ...m, content: text } : m)),
            );
        });

        const promptInput = fromInput || '업로드된 파일을 요약하고 핵심 인사이트를 알려주세요.';
        const requestMessage = buildUnifiedGenerationPrompt(promptInput, {
            responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
            perspective: DEFAULT_CHAT_PERSPECTIVE,
        });
        const projectKnowledge = filesForTurn.length > 0
            ? filesForTurn.map((f) => `[파일: ${f.name}]\n요약: ${f.summary}\n내용: ${f.content ?? ''}\n키워드: ${f.keywords.join(', ')}`).join('\n\n')
            : '';
        const messagesForApiContext = priorMessages.filter((m) => !m.generationPlaceholder);
        const conversationHistory = normalizeChatTurnsForApiMerge(
            messagesForApiContext.map((m) =>
                toChatTurnWithPipelineExtras({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content,
                    pipelineExtras: m.pipelineExtras,
                })
            )
        );
        const ds = resolveDeepseekFlagsForConversation(undefined);
        const hasNotebookKnowledge = Boolean(coerceTrimmedString(projectKnowledge, ''));
        const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
        const agentGensparkSession = Boolean(agentRouteId);
        const featureCtx = buildFeatureContextFromMessage(promptInput);
        const parsedSections = parseQuestionRequirementSections(promptInput);
        const inputIntent = parseInputIntent(promptInput);
        const wantsStructured =
            hasNotebookKnowledge ||
            parsedSections.hasBoth ||
            inputIntent.type !== 'general' ||
            !!(featureCtx as Record<string, unknown>).prefer_informed_answer ||
            !!(featureCtx as Record<string, unknown>).enable_web_research;
        const useQaPipeline = wantsStructured || agentGensparkSession;
        const context = buildUnifiedChatContext(promptInput, {
            conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
            deepSeekReviewLayerHints: useQaPipeline && ds.review,
            pipelineDeepSeekRefine: useQaPipeline && ds.refine,
            pipelineDeepSeekReasoner: useQaPipeline && ds.reasoner,
            ...(useQaPipeline
                ? {
                      useQuestionAnswerPipeline: true,
                      agenticGensparkStyle: true,
                      qaPipelineAllowEmptyProject: true,
                      ...(agentRouteId ? { gensparkRouteAgentId: agentRouteId } : {}),
                      skipWriterLlmPolish:
                          process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
                      ...(process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
                          ? { pipelineVerifierRewrite: true }
                          : {}),
                      ...(process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
                          ? { includeGenerationScenarioInResponse: true }
                          : {}),
                  }
                : {}),
        });
        const baseWithFiles: Record<string, unknown> = {
            ...context,
            projectKnowledge: projectKnowledge || undefined,
            project_files: filesForTurn.map((f) => ({ name: f.name, type: f.type })),
        };
        const contextWithFiles = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
            coerceTrimmedString(promptInput, ''),
            baseWithFiles
        );

        const scenarioMergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(messagesForApiContext);

        const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(conversationHistory, scenarioMergeOpts);

        const { pipelineMerge, selfDevelopFlags } = buildComposerPipelineContextAppend({
            trimmedInput: promptInput,
            featureCtx: featureCtx as Record<string, unknown>,
            composerResponseMode: 'balanced',
            responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
            conversationFileContent: projectKnowledge || undefined,
            gensparkRouteAgentId: agentRouteId,
            hasConversationThreadContext: conversationHistory.length > 0,
        });

        const { quality, contextForBody } = mergeApiChatContextPayload(
            promptInput,
            {
                ...contextWithFiles,
                ...pipelineMerge,
                ...selfDevelopFlags,
            },
            conversationHistory.length > 0 ? conversationHistory : undefined,
            mergeOpts
        );
        const chatPostBody = {
            message: requestMessage,
            quality,
            ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
            response_style: DEFAULT_CHAT_RESPONSE_STYLE,
            perspective: DEFAULT_CHAT_PERSPECTIVE,
        };

        try {
            const data = await postChatJsonWithFallback(chatPostBody as Record<string, unknown>);
            clearFileAnalysisNsPhases();
            clearFileAnalysisNsPhases = () => {};
            const responseText = extractResponseContent({ data });
            const isSuccess = data.success !== false && responseText.length > 0;
            const suggestedFollowUps = extractPipelineFollowUpsFromChatResponse({ data });
            const draftContent = isSuccess ? responseText : generateAIResponse(fromInput, filesForTurn);

            await runAssistantNonStreamPostResponsePhases((text) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === placeholderAiId
                            ? { ...m, content: text, generationPlaceholder: true }
                            : m,
                    ),
                );
            });

            let finalContent = draftContent;
            let pipelineExtras: PipelineMessageExtras | undefined;
            if (isSuccess) {
                const requestRefined = createPostChatRefinedAnswerFn({
                    postChat: (body) => postChatJsonWithFallback(body),
                    buildPayload: (outboundMessage, ctx) => ({
                        ...chatPostBody,
                        message: outboundMessage,
                        ...(Object.keys(ctx).length > 0 ? { context: ctx } : {}),
                    }),
                });
                const selfDevelopActive = isComposerSelfDevelopActiveForTurn({
                    trimmedInput: promptInput,
                    featureCtx: featureCtx as Record<string, unknown>,
                    pipelineMerge,
                });
                const finalized = await finalizeAssistantNonStreamTurn({
                    draft: draftContent,
                    userInput: promptInput,
                    requestContext: (contextForBody ?? {}) as Record<string, unknown>,
                    sessionId: 'file_analysis_chat',
                    selfDevelopActive,
                    requestRefined,
                    responseData: { data },
                    onStatusText: (text) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === placeholderAiId ? { ...m, content: text } : m,
                            ),
                        );
                    },
                });
                finalContent = finalized.text;
                pipelineExtras = finalized.pipelineExtras;
            }

            const aiResponse: ChatMessage = {
                id: placeholderAiId,
                type: 'ai',
                content: finalContent,
                timestamp: new Date(),
                ...(pipelineExtras ? { pipelineExtras } : {}),
                ...(suggestedFollowUps?.length ? { suggestedFollowUps } : {}),
                analysis: {
                    fileReferences: filesForTurn.map(f => f.name),
                    confidence: isSuccess ? 0.9 : 0.85,
                    sources: filesForTurn.map(f => f.name)
                },
                metadata: {
                    model: 'gpt-4',
                    tokens: 150,
                    responseTime: 2000,
                    fileAnalysisTime: 1000
                }
            };
            setMessages((prev) => prev.map((m) => (m.id === placeholderAiId ? aiResponse : m)));
        } catch (err) {
            clearFileAnalysisNsPhases();
            clearFileAnalysisNsPhases = () => {};
            errorLogger.error('파일 분석 대화 API 오류', err instanceof Error ? err : new Error(String(err)), {
                component: 'FileAnalysisChatSystem',
                action: 'handleSendMessage',
            });
            const aiResponse: ChatMessage = {
                id: placeholderAiId,
                type: 'ai',
                content: generateAIResponse(fromInput, filesForTurn),
                timestamp: new Date(),
                analysis: {
                    fileReferences: filesForTurn.map(f => f.name),
                    confidence: 0.85,
                    sources: filesForTurn.map(f => f.name)
                },
                metadata: {
                    model: 'gpt-4',
                    tokens: 150,
                    responseTime: 2000,
                    fileAnalysisTime: 1000
                }
            };
            setMessages((prev) => prev.map((m) => (m.id === placeholderAiId ? aiResponse : m)));
        } finally {
            clearFileAnalysisNsPhases();
            clearFileAnalysisNsPhases = () => {};
            setIsTyping(false);
            onMessageSend?.(fromInput, filesForTurn);
        }
    };

    const regenerateMessage = async (messageId: string) => {
        if (isTyping) return;
        const turn = resolveComposerRegenerateUserTurn(messages, messageId);
        if (!turn) return;
        const userMsg = messages[turn.truncateToIndex];
        const kept = messages.slice(0, turn.truncateToIndex);
        const filesSnapshot =
            userMsg.files && userMsg.files.length > 0 ? userMsg.files : analyzedFiles;
        await handleSendMessage(
            turn.userText === '(파일만 업로드됨)' ? '' : turn.userText,
            { baseMessages: kept, filesSnapshot },
        );
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

        return `업로드된 파일들(${fileNames})을 분석한 결과를 바탕으로 답변드립니다:\n\n${fileContent}\n\n더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.`;
    };

    const handleFileSelect = (file: AnalyzedFile) => {
        setSelectedFile(file);
        setActiveTab('analysis');
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="fac-root bw-detail-root" data-testid="page-file-analysis">
            {/* Header */}
            <div className="fac-header bw-detail-header">
                <div className="fac-header-inner bw-detail-header-inner">
                    <div className="bw-detail-header-left">
                        <div className="fac-header-icon bw-detail-header-icon">
                            <Brain size={20} aria-hidden />
                        </div>
                        <div>
                            <h2 className="bw-detail-header-title">파일 분석 대화</h2>
                            <p className="bw-detail-header-desc">파일을 업로드하고 CORBU.AI와 대화하세요</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bw-btn-primary"
                    >
                        <Upload size={16} aria-hidden />
                        파일 업로드
                    </button>
                </div>

                {/* Tabs */}
                <div className="fac-tabs bw-detail-tabs">
                    {([
                        { id: 'chat', label: '대화', icon: MessageSquare },
                        { id: 'files', label: '파일', icon: FileText },
                        { id: 'analysis', label: '분석', icon: BarChart },
                        { id: 'insights', label: '인사이트', icon: Lightbulb },
                        { id: 'settings', label: '설정', icon: Settings }
                    ] as const).map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`fac-tab bw-detail-tab ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <IconComponent size={16} aria-hidden />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="fac-content bw-detail-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                            {/* Chat Messages */}
                            <div className="fac-chat-area genspark-chat-column">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`fac-msg-wrap ${message.type === 'ai' ? 'ai' : ''}`}
                                    >
                                        <div className={`fac-msg-bubble ${message.type}`}>
                                            {message.type === 'ai' && (
                                                <Brain size={20} style={{ color: 'var(--accent-info)', flexShrink: 0, marginTop: 2 }} aria-hidden />
                                            )}
                                            <div className="fac-msg-content">
                                                <div
                                                    className="genspark-qa-role-row"
                                                    style={{
                                                        display: 'flex',
                                                        width: '100%',
                                                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    <span
                                                        className={`genspark-qa-badge ${message.type === 'user' ? 'genspark-qa-badge--question' : 'genspark-qa-badge--answer'}`}
                                                    >
                                                        {message.type === 'user' ? ASSISTANT_GENSPARK_QA_BADGE_QUESTION : ASSISTANT_GENSPARK_QA_BADGE_ANSWER}
                                                    </span>
                                                </div>
                                                <div className="fac-msg-text">
                                                    {message.type === 'ai' ? (
                                                        <AssistantGensparkBody
                                                            text={message.content}
                                                            embedded
                                                            enhancedCodeBlocks
                                                            documentContext={analyzedFiles.length > 0}
                                                        />
                                                    ) : (
                                                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
                                                    )}
                                                </div>

                                                {message.type === 'ai' &&
                                                    message.suggestedFollowUps &&
                                                    message.suggestedFollowUps.length > 0 && (
                                                        <GensparkNextActionChips
                                                            hints={message.suggestedFollowUps}
                                                            messageId={message.id}
                                                            onSelectHint={(h) => void handleSendMessage(h)}
                                                            borderColor="var(--border-color)"
                                                            textSecondary="var(--text-secondary)"
                                                        />
                                                    )}
                                                {message.type === 'ai' &&
                                                    message.pipelineExtras &&
                                                    hasPipelineExtras(message.pipelineExtras) && (
                                                        <GensparkPipelineExtrasPanel
                                                            extras={message.pipelineExtras}
                                                            messageId={message.id}
                                                            theme={{
                                                                borderColor: 'var(--border-color)',
                                                                textSecondary: 'var(--text-secondary)',
                                                            }}
                                                        />
                                                    )}

                                                {message.files && message.files.length > 0 && (
                                                    <div className="fac-msg-files">
                                                        <p className="fac-msg-meta" style={{ marginBottom: 'var(--spacing-sm)' }}>참조된 파일:</p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                                            {message.files.map((file) => (
                                                                <span
                                                                    key={file.id}
                                                                    className="fac-file-chip"
                                                                >
                                                                    {getFileIcon(file.type)}
                                                                    <span>{file.name}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {message.analysis && (
                                                    <div className="fac-msg-meta" style={{ marginTop: 'var(--spacing-sm)' }}>
                                                        신뢰도: {Math.round(message.analysis.confidence * 100)}% |
                                                        소스: {message.analysis.sources.join(', ')}
                                                    </div>
                                                )}

                                                <div className="fac-msg-actions">
                                                    {message.type === 'ai' && (
                                                        <>
                                                            <button type="button" className="fac-action-btn" aria-label="도움됨"><ThumbsUp size={16} aria-hidden /></button>
                                                            <button type="button" className="fac-action-btn" aria-label="도움 안됨"><ThumbsDown size={16} aria-hidden /></button>
                                                            <button type="button" className="fac-action-btn" aria-label="복사"><Copy size={16} aria-hidden /></button>
                                                            {!message.generationPlaceholder && !isTyping && (
                                                                <button
                                                                    type="button"
                                                                    className="fac-action-btn"
                                                                    data-testid={TEST_IDS.COMPOSER_REGENERATE_MESSAGE}
                                                                    aria-label="답변 재생성"
                                                                    onClick={() => void regenerateMessage(message.id)}
                                                                >
                                                                    <RotateCcw size={16} aria-hidden />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <span className="fac-msg-meta">{message.timestamp.toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping &&
                                    !messages.some((m) => m.generationPlaceholder) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                                        aria-live="polite"
                                        aria-busy="true"
                                        aria-label={ASSISTANT_PLACEHOLDER_DRAFT}
                                    >
                                        <div
                                            className="fac-typing-bubble"
                                            style={{
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                gap: 'var(--spacing-sm)',
                                                maxWidth: '100%',
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                                                <Brain size={20} style={{ color: 'var(--accent-info)', flexShrink: 0 }} aria-hidden />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="genspark-qa-role-row" style={{ marginBottom: 6 }}>
                                                        <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                                                    </div>
                                                    <AssistantGensparkBody
                                                        text=""
                                                        embedded
                                                        enhancedCodeBlocks
                                                        documentContext={analyzedFiles.length > 0}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={chatEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="fac-input-row bw-page-input-dock" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <div className="bw-figma-composer">
                                    <button
                                        type="button"
                                        className="bw-figma-composer-add"
                                        onClick={() => {
                                            const el = document.getElementById('file-analysis-message-input');
                                            el?.focus();
                                        }}
                                        aria-label="질문 입력 포커스"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                    </button>
                                    <textarea
                                        id="file-analysis-message-input"
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="질문을 입력하세요. (Shift+Enter 줄바꿈)"
                                        className="fac-input bw-input bw-figma-composer-field"
                                        rows={1}
                                        style={{ minHeight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handleSendMessage()}
                                        disabled={
                                            (!coerceTrimmedString(currentMessage, '') && analyzedFiles.length === 0) ||
                                            isTyping ||
                                            messages.some((m) => m.generationPlaceholder)
                                        }
                                        className="fac-send-btn bw-figma-composer-action bw-figma-composer-action--primary"
                                        aria-label="메시지 전송"
                                    >
                                        <ArrowRight size={20} aria-hidden />
                                    </button>
                                </div>

                                {analyzedFiles.length > 0 && (
                                    <div className="fac-files-wrap">
                                        <p className="fac-files-label">업로드된 파일:</p>
                                        <div className="fac-file-list">
                                            {analyzedFiles.map((file) => (
                                                <div key={file.id} className="fac-file-list-item">
                                                    {getFileIcon(file.type)}
                                                    <span className="fac-file-name">{file.name}</span>
                                                    <span className="fac-msg-meta">{Math.round(file.size / 1024)}KB</span>
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
                            className="fac-tab-content"
                        >
                            <div className="fac-tab-stack-md">
                                {analyzedFiles.map((file) => (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="fac-card fac-file-card"
                                        onClick={() => handleFileSelect(file)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFileSelect(file)}
                                    >
                                        <div className="fac-row-between-start">
                                            <div className="fac-row-center-md">
                                                <div className="fac-header-icon">{getFileIcon(file.type)}</div>
                                                <div>
                                                    <h3 className="fac-header-title fac-title-base">{file.name}</h3>
                                                    <p className="fac-header-desc">{file.summary}</p>
                                                </div>
                                            </div>
                                            <span
                                                className="fac-file-chip"
                                                style={getFileTypeStyleObj(file.type)}
                                            >
                                                {file.type.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="fac-card-meta">
                                            <div className="fac-keywords-wrap">
                                                {file.keywords.slice(0, 5).map((keyword, index) => (
                                                    <span key={index} className="fac-keyword-tag">{keyword}</span>
                                                ))}
                                            </div>

                                            <div className="fac-file-stats">
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
                            className="fac-tab-content"
                        >
                            <div className="fac-tab-stack-lg">
                                {/* File Header */}
                                <div className="fac-card">
                                    <div className="fac-row-between-start">
                                        <div className="fac-row-center-md">
                                            <div className="fac-header-icon fac-icon-pad-md">{getFileIcon(selectedFile.type)}</div>
                                            <div>
                                                <h2 className="fac-card-title fac-card-title-xl">{selectedFile.name}</h2>
                                                <p className="fac-header-desc">{selectedFile.summary}</p>
                                            </div>
                                        </div>
                                        <div className="fac-actions-row">
                                            <button type="button" onClick={() => onExportAnalysis?.(selectedFile.id, 'pdf')} className="bw-btn-primary">
                                                <Download size={16} aria-hidden /> 내보내기
                                            </button>
                                            <button type="button" onClick={() => onShareAnalysis?.(selectedFile.id, {})} className="bw-btn-secondary">
                                                <Share2 size={16} aria-hidden /> 공유
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Metrics */}
                                <div className="fac-grid-metrics">
                                    <div className="fac-card fac-metric-card">
                                        <div className="fac-metric-head">
                                            <div>
                                                <p className="fac-header-desc">복잡도</p>
                                                <p className="fac-metric-value info">{Math.round(selectedFile.analysis.complexity * 100)}%</p>
                                            </div>
                                            <BarChart size={32} className="fac-icon-info" aria-hidden />
                                        </div>
                                    </div>
                                    <div className="fac-card fac-metric-card">
                                        <div className="fac-metric-head">
                                            <div>
                                                <p className="fac-header-desc">가독성</p>
                                                <p className="fac-metric-value success">{Math.round(selectedFile.analysis.readability * 100)}%</p>
                                            </div>
                                            <Eye size={32} className="fac-icon-success" aria-hidden />
                                        </div>
                                    </div>
                                    <div className="fac-card fac-metric-card">
                                        <div className="fac-metric-head">
                                            <div>
                                                <p className="fac-header-desc">관련성</p>
                                                <p className="fac-metric-value secondary">{Math.round(selectedFile.analysis.relevance * 100)}%</p>
                                            </div>
                                            <Target size={32} className="fac-icon-secondary" aria-hidden />
                                        </div>
                                    </div>
                                    <div className="fac-card fac-metric-card">
                                        <div className="fac-metric-head">
                                            <div>
                                                <p className="fac-header-desc">정확도</p>
                                                <p className="fac-metric-value orange">{Math.round(selectedFile.analysis.accuracy * 100)}%</p>
                                            </div>
                                            <CheckCircle size={32} className="fac-icon-orange" aria-hidden />
                                        </div>
                                    </div>
                                </div>

                                {/* Entities */}
                                <div className="fac-card">
                                    <h3 className="fac-card-title">추출된 엔티티</h3>
                                    <div className="fac-grid-entities">
                                        {selectedFile.entities.map((entity, index) => (
                                            <div key={index} className="fac-entity-row">
                                                <div className="fac-entity-main">
                                                    <span className="fac-entity-name">{entity.name}</span>
                                                    <span className="fac-header-desc">
                                                        ({entity.type === 'person' ? '사람' :
                                                            entity.type === 'organization' ? '조직' :
                                                                entity.type === 'location' ? '위치' :
                                                                    entity.type === 'date' ? '날짜' :
                                                                        entity.type === 'money' ? '금액' : '비율'})
                                                    </span>
                                                </div>
                                                <span className="fac-header-desc">{Math.round(entity.confidence * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Insights */}
                                <div className="fac-card">
                                    <h3 className="fac-card-title">AI 인사이트</h3>
                                    <div className="fac-insights-list">
                                        {selectedFile.insights.map((insight, index) => (
                                            <div key={index} className="fac-insight-item">
                                                <Lightbulb size={20} className="fac-insight-icon" aria-hidden />
                                                <div className="fac-insight-content">
                                                    <h4 className="fac-insight-title">{insight.title}</h4>
                                                    <p className="fac-header-desc fac-insight-desc">{insight.description}</p>
                                                    <div className="fac-insight-meta">
                                                        <span className="fac-header-desc">신뢰도: {Math.round(insight.confidence * 100)}%</span>
                                                        <span className="fac-header-desc">소스: {insight.source}</span>
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
                            className="fac-tab-content"
                        >
                            <div className="fac-card">
                                <h3 className="fac-card-title">전체 파일 인사이트</h3>
                                <div className="fac-insights-list">
                                    {analyzedFiles.flatMap(file => file.insights).map((insight, index) => (
                                        <div key={index} className="fac-insight-item">
                                            <Lightbulb size={20} className="fac-insight-icon" aria-hidden />
                                            <div className="fac-insight-content">
                                                <h4 className="fac-insight-title">{insight.title}</h4>
                                                <p className="fac-header-desc fac-insight-desc">{insight.description}</p>
                                                <div className="fac-insight-meta">
                                                    <span className="fac-header-desc">신뢰도: {Math.round(insight.confidence * 100)}%</span>
                                                    <span className="fac-header-desc">소스: {insight.source}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                            className="fac-tab-content"
                        >
                            <div className="fac-card">
                                <h3 className="fac-card-title">분석 설정</h3>
                                <div className="fac-settings-list">
                                    {Object.entries(analysisSettings).map(([key, value]) => (
                                        <div key={key} className="fac-settings-row">
                                            <span className="fac-setting-label">
                                                {key === 'extractText' ? '텍스트 추출' :
                                                    key === 'extractEntities' ? '엔티티 추출' :
                                                        key === 'sentimentAnalysis' ? '감정 분석' :
                                                            key === 'keywordExtraction' ? '키워드 추출' :
                                                                key === 'topicModeling' ? '주제 모델링' :
                                                                    key === 'dataExtraction' ? '데이터 추출' :
                                                                        '인사이트 생성'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setAnalysisSettings(prev => ({ ...prev, [key]: !value }))}
                                                style={{
                                                    background: value ? 'var(--accent-info)' : 'var(--bg-tertiary)',
                                                    width: 44,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '3px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: value ? 'flex-end' : 'flex-start'
                                                }}
                                                aria-label={`${key} ${value ? '비활성화' : '활성화'}`}
                                                aria-pressed={value}
                                            >
                                                <span
                                                    style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: '50%',
                                                        background: 'var(--bg-primary)',
                                                        flexShrink: 0,
                                                        transition: 'transform var(--transition-base)'
                                                    }}
                                                />
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
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar,.js,.ts,.py,.java,.sql,.db"
                aria-label="파일 선택하여 분석"
            />
        </div>
    );
};

export default FileAnalysisChatSystem;
