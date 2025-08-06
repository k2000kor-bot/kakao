import React, { useState, useEffect, useRef } from 'react';
import {
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    LightBulbIcon,
    AcademicCapIcon,
    SparklesIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    ClipboardDocumentIcon,
    BookOpenIcon,
    MagnifyingGlassIcon,
    CogIcon,
    ChartBarIcon,
    EyeIcon,
    ArrowPathIcon,
    PlusIcon,
    MinusIcon,
    CpuChipIcon,
    DocumentMagnifyingGlassIcon,
    BeakerIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    LightBulbIcon as LightBulbIconSolid
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';
import fileUploadService from '../services/fileUploadService';
import advancedContextualWritingService, {
    AdvancedWritingRequest,
    AdvancedWritingResponse,
    DeepContextAnalysis
} from '../services/advancedContextualWritingService';

interface AdvancedContextualWritingAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onMessageGenerated: (message: string) => void;
    projectId?: string;
    uploadedFiles?: any[];
}

interface DeepFileContext {
    fileId: string;
    fileName: string;
    fileType: string;
    extractedText: string;
    summary: string;
    keywords: string[];
    sentiment: string;
    confidence: number;
    relevance: number;
    semanticAnalysis: {
        topics: string[];
        entities: string[];
        relationships: string[];
        themes: string[];
        tone: string;
        complexity: number;
    };
    knowledgeGraph: {
        concepts: string[];
        connections: string[];
        insights: string[];
    };
}

interface WritingSession {
    id: string;
    context: string;
    fileContexts: DeepFileContext[];
    writingType: string;
    targetAudience: string;
    writingGoal: string;
    tone: string;
    length: string;
    keywords: string[];
    generatedContent: string;
    qualityMetrics: {
        contextRelevance: number;
        knowledgeIntegration: number;
        semanticCoherence: number;
    };
    conversationHistory: ConversationTurn[];
}

interface ConversationTurn {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        contextUsed?: string[];
        knowledgeApplied?: string[];
        semanticAnalysis?: any;
        suggestions?: string[];
        qualityMetrics?: {
            contextRelevance: number;
            knowledgeIntegration: number;
            semanticCoherence: number;
        };
        conversationMood?: 'analytical' | 'creative' | 'strategic' | 'educational';
        writingIntensity?: 'light' | 'moderate' | 'intense';
        aiLearningMode?: boolean;
        collaborationMode?: boolean;
        contextInference?: any;
        aiLearningProgress?: any;
        realTimeCollaboration?: any;
        adaptiveLearning?: any;
        semanticUnderstanding?: any;
        knowledgeSynthesis?: any;
    };
}

const AdvancedContextualWritingAssistant: React.FC<AdvancedContextualWritingAssistantProps> = ({
    isOpen,
    onClose,
    onMessageGenerated,
    projectId,
    uploadedFiles = []
}) => {
    const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'conversation' | 'context' | 'knowledge' | 'analysis' | 'insights' | 'quality' | 'graph'>('conversation');
    const [deepFileContexts, setDeepFileContexts] = useState<DeepFileContext[]>([]);
    const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
    const [knowledgeInsights, setKnowledgeInsights] = useState<string[]>([]);
    const [semanticAnalysis, setSemanticAnalysis] = useState<any>(null);
    const [writingPrompt, setWritingPrompt] = useState('');
    const [writingSettings, setWritingSettings] = useState({
        writingType: 'contextual' as const,
        targetAudience: 'expert' as const,
        writingGoal: 'educate' as const,
        tone: 'analytical' as const,
        length: 'comprehensive' as const,
        keywords: [] as string[]
    });
    const [qualityMetrics, setQualityMetrics] = useState({
        contextRelevance: 0,
        knowledgeIntegration: 0,
        semanticCoherence: 0,
        overallScore: 0
    });
    const [writingSuggestions, setWritingSuggestions] = useState<string[]>([]);
    const [contextRecommendations, setContextRecommendations] = useState<string[]>([]);
    const [realTimeAnalysis, setRealTimeAnalysis] = useState<any>(null);
    const [knowledgeGraphVisualization, setKnowledgeGraphVisualization] = useState<any>(null);
    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
    const [conversationMood, setConversationMood] = useState<'analytical' | 'creative' | 'strategic' | 'educational'>('analytical');
    const [writingIntensity, setWritingIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');
    const [aiLearningMode, setAiLearningMode] = useState(false);
    const [collaborationMode, setCollaborationMode] = useState(false);
    const [contextInference, setContextInference] = useState<any>(null);
    const [writingStyle, setWritingStyle] = useState<'formal' | 'casual' | 'technical' | 'narrative'>('formal');
    const [realTimeCollaboration, setRealTimeCollaboration] = useState<any>(null);
    const [aiLearningProgress, setAiLearningProgress] = useState<any>(null);
    const [contextualMemory, setContextualMemory] = useState<any[]>([]);
    const [adaptiveLearning, setAdaptiveLearning] = useState<any>(null);
    const [semanticUnderstanding, setSemanticUnderstanding] = useState<any>(null);
    const [knowledgeSynthesis, setKnowledgeSynthesis] = useState<any>(null);

    const { modalRef, handleClose } = useModalClose({ isOpen, onClose });
    const conversationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    useEffect(() => {
        if (uploadedFiles.length > 0) {
            analyzeDeepFileContexts();
        }
    }, [uploadedFiles]);

    const analyzeDeepFileContexts = async () => {
        const contexts: DeepFileContext[] = [];
        const insights: string[] = [];

        for (const file of uploadedFiles) {
            try {
                const analysis = await fileUploadService.getFileAnalysis(projectId || 'default', file.id);

                if (analysis) {
                    // 심층 문맥 분석
                    const deepContext: DeepFileContext = {
                        fileId: file.id,
                        fileName: file.name,
                        fileType: file.type,
                        extractedText: analysis.extracted_text || '',
                        summary: analysis.summary || '',
                        keywords: analysis.keywords || [],
                        sentiment: analysis.sentiment || 'neutral',
                        confidence: analysis.confidence || 0.8,
                        relevance: calculateDeepRelevance(analysis),
                        semanticAnalysis: {
                            topics: extractTopics(analysis.extracted_text || ''),
                            entities: extractEntities(analysis.extracted_text || ''),
                            relationships: extractRelationships(analysis.extracted_text || ''),
                            themes: extractThemes(analysis.extracted_text || ''),
                            tone: analyzeTone(analysis.extracted_text || ''),
                            complexity: calculateComplexity(analysis.extracted_text || '')
                        },
                        knowledgeGraph: {
                            concepts: extractConcepts(analysis.extracted_text || ''),
                            connections: findConnections(analysis.extracted_text || ''),
                            insights: generateInsights(analysis)
                        }
                    };

                    contexts.push(deepContext);
                    insights.push(...deepContext.knowledgeGraph.insights);
                }
            } catch (error) {
                console.error('심층 파일 문맥 분석 실패:', error);
            }
        }

        setDeepFileContexts(contexts);
        setKnowledgeInsights(insights);

        // 고도화된 인사이트 생성
        const advancedInsights = advancedContextualWritingService.generateContextualInsights(contexts);
        setKnowledgeInsights(prev => [...prev, ...advancedInsights]);
    };

    const calculateDeepRelevance = (analysis: any): number => {
        const keywordScore = (analysis.keywords?.length || 0) * 0.1;
        const confidenceScore = analysis.confidence || 0;
        const sentimentScore = analysis.sentiment === 'positive' ? 0.2 : 0;
        const complexityScore = analysis.extracted_text?.length > 1000 ? 0.1 : 0;

        return Math.min(keywordScore + confidenceScore + sentimentScore + complexityScore, 1.0);
    };

    const extractTopics = (text: string): string[] => {
        const topics = ['프로젝트 관리', '기술 분석', '비즈니스 전략', '데이터 분석', '시스템 설계', '혁신', '최적화'];
        return topics.filter(topic => text.includes(topic));
    };

    const extractEntities = (text: string): string[] => {
        const entities = ['회사', '제품', '기술', '시장', '고객', '시스템', '플랫폼', '서비스'];
        return entities.filter(entity => text.includes(entity));
    };

    const extractRelationships = (text: string): string[] => {
        return ['인과관계', '상호작용', '의존성', '비교', '연결', '통합', '협력'];
    };

    const extractThemes = (text: string): string[] => {
        return ['혁신', '효율성', '성장', '지속가능성', '최적화', '개선', '전략'];
    };

    const analyzeTone = (text: string): string => {
        const positiveWords = ['성공', '개선', '향상', '긍정', '효과', '성과', '혁신'];
        const negativeWords = ['문제', '실패', '위험', '부정', '어려움', '장애', '실패'];

        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    };

    const calculateComplexity = (text: string): number => {
        const sentences = text.split(/[.!?]+/).length;
        const words = text.split(' ').length;
        const avgWordsPerSentence = words / sentences;

        if (avgWordsPerSentence > 20) return 0.9;
        if (avgWordsPerSentence > 15) return 0.7;
        if (avgWordsPerSentence > 10) return 0.5;
        return 0.3;
    };

    const extractConcepts = (text: string): string[] => {
        return ['전략적 사고', '시스템 분석', '프로세스 최적화', '리더십', '혁신', '효율성', '데이터 기반'];
    };

    const findConnections = (text: string): string[] => {
        return ['전략-실행 연결', '데이터-의사결정 연결', '기술-비즈니스 연결', '시스템-프로세스 연결'];
    };

    const generateInsights = (analysis: any): string[] => {
        return [
            `${analysis.summary?.substring(0, 50)}...`,
            `주요 키워드: ${analysis.keywords?.slice(0, 3).join(', ')}`,
            `감정 분석: ${analysis.sentiment} (${(analysis.confidence * 100).toFixed(1)}%)`
        ];
    };

    const addMessage = (role: 'user' | 'assistant' | 'system', content: string, metadata?: any) => {
        const newMessage: ConversationTurn = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            metadata
        };
        setConversation(prev => [...prev, newMessage]);
    };

    const handleSendMessage = async () => {
        if (!writingPrompt.trim()) return;

        const userMessage = writingPrompt;
        setWritingPrompt('');
        addMessage('user', userMessage);
        setIsGenerating(true);

        try {
            // 선택된 문맥들을 활용한 고도화된 글쓰기
            const selectedFileContexts = deepFileContexts.filter(fc =>
                selectedContexts.includes(fc.fileId)
            );

            // 품질 메트릭 계산
            const contextRelevance = advancedContextualWritingService.calculateContextRelevance(selectedFileContexts, userMessage);
            const knowledgeIntegration = advancedContextualWritingService.calculateKnowledgeIntegration(selectedFileContexts);
            const semanticCoherence = advancedContextualWritingService.calculateSemanticCoherence(selectedFileContexts);

            const enhancedRequest: AdvancedWritingRequest = {
                ...writingSettings,
                context: userMessage,
                fileContexts: selectedFileContexts,
                semanticAnalysis: semanticAnalysis
            };

            const response = await advancedContextualWritingService.generateAdvancedContextualWriting(
                projectId || 'default',
                enhancedRequest
            );

            if (response.success) {
                // 품질 분석
                const qualityAnalysis = advancedContextualWritingService.analyzeAdvancedWritingQuality(
                    response.content,
                    response.contextRelevance,
                    response.knowledgeIntegration,
                    response.semanticCoherence
                );

                setQualityMetrics({
                    contextRelevance: response.contextRelevance,
                    knowledgeIntegration: response.knowledgeIntegration,
                    semanticCoherence: response.semanticCoherence,
                    overallScore: qualityAnalysis.overallScore
                });

                setWritingSuggestions(qualityAnalysis.recommendations);

                addMessage('assistant', response.content, {
                    contextUsed: response.usedContexts,
                    knowledgeApplied: response.generatedInsights,
                    semanticAnalysis: response.semanticConnections,
                    suggestions: response.suggestions,
                    qualityMetrics: {
                        contextRelevance: response.contextRelevance,
                        knowledgeIntegration: response.knowledgeIntegration,
                        semanticCoherence: response.semanticCoherence
                    }
                });
            } else {
                addMessage('assistant', '죄송합니다. 고도화된 문맥 글쓰기 생성에 실패했습니다.');
            }

        } catch (error) {
            console.error('고도화된 문맥 글쓰기 생성 실패:', error);
            addMessage('assistant', '죄송합니다. 문맥 분석 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleContextSelection = (fileId: string) => {
        setSelectedContexts(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const addKeyword = (keyword: string) => {
        if (keyword.trim() && !writingSettings.keywords.includes(keyword.trim())) {
            setWritingSettings(prev => ({
                ...prev,
                keywords: [...prev.keywords, keyword.trim()]
            }));
        }
    };

    const removeKeyword = (keyword: string) => {
        setWritingSettings(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keyword)
        }));
    };

    const getQualityColor = (score: number): string => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getQualityIcon = (score: number) => {
        if (score >= 0.8) return <StarIcon className="w-4 h-4 text-green-500" />;
        if (score >= 0.6) return <ArrowTrendingUpIcon className="w-4 h-4 text-yellow-500" />;
        return <CogIcon className="w-4 h-4 text-red-500" />;
    };

    // 실시간 문맥 추천 기능
    const generateContextRecommendations = (userInput: string) => {
        const recommendations: string[] = [];

        if (userInput.includes('분석') || userInput.includes('데이터')) {
            recommendations.push('데이터 분석 관련 파일들을 선택하여 통계적 인사이트를 활용하세요');
        }

        if (userInput.includes('전략') || userInput.includes('계획')) {
            recommendations.push('전략적 사고 관련 파일들을 선택하여 체계적인 접근을 하세요');
        }

        if (userInput.includes('기술') || userInput.includes('시스템')) {
            recommendations.push('기술적 문서들을 선택하여 전문적인 관점을 제공하세요');
        }

        if (userInput.includes('비즈니스') || userInput.includes('시장')) {
            recommendations.push('비즈니스 관련 파일들을 선택하여 시장 분석을 강화하세요');
        }

        setContextRecommendations(recommendations);
    };

    // 지식 그래프 시각화 데이터 생성
    const generateKnowledgeGraphData = () => {
        const nodes: any[] = [];
        const edges: any[] = [];

        deepFileContexts.forEach((context, index) => {
            // 파일 노드
            nodes.push({
                id: `file-${index}`,
                label: context.fileName,
                type: 'file',
                group: 1
            });

            // 개념 노드들
            context.knowledgeGraph.concepts.forEach((concept: string, conceptIndex: number) => {
                const conceptId = `concept-${index}-${conceptIndex}`;
                nodes.push({
                    id: conceptId,
                    label: concept,
                    type: 'concept',
                    group: 2
                });

                // 파일과 개념 연결
                edges.push({
                    from: `file-${index}`,
                    to: conceptId,
                    label: 'contains'
                });
            });

            // 연결성 노드들
            context.knowledgeGraph.connections.forEach((connection: string, connIndex: number) => {
                const connectionId = `connection-${index}-${connIndex}`;
                nodes.push({
                    id: connectionId,
                    label: connection,
                    type: 'connection',
                    group: 3
                });

                // 파일과 연결성 연결
                edges.push({
                    from: `file-${index}`,
                    to: connectionId,
                    label: 'relates'
                });
            });
        });

        return { nodes, edges };
    };

    // 고급 분석 기능
    const performAdvancedAnalysis = () => {
        const analysis = {
            totalFiles: deepFileContexts.length,
            selectedFiles: selectedContexts.length,
            averageComplexity: deepFileContexts.reduce((sum, ctx) => sum + ctx.semanticAnalysis.complexity, 0) / deepFileContexts.length,
            dominantTone: getDominantTone(),
            knowledgeDensity: calculateKnowledgeDensity(),
            semanticCoherence: calculateSemanticCoherence(),
            contextRelevance: calculateContextRelevance(),
            insights: generateAdvancedInsights()
        };

        setRealTimeAnalysis(analysis);
    };

    const getDominantTone = () => {
        const tones = deepFileContexts.map(ctx => ctx.semanticAnalysis.tone);
        const toneCounts = tones.reduce((acc, tone) => {
            acc[tone] = (acc[tone] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
    };

    const calculateKnowledgeDensity = () => {
        const totalConcepts = deepFileContexts.reduce((sum, ctx) => sum + ctx.knowledgeGraph.concepts.length, 0);
        const totalConnections = deepFileContexts.reduce((sum, ctx) => sum + ctx.knowledgeGraph.connections.length, 0);

        return (totalConcepts + totalConnections) / Math.max(deepFileContexts.length, 1);
    };

    const calculateSemanticCoherence = () => {
        const allThemes = deepFileContexts.flatMap(ctx => ctx.semanticAnalysis.themes);
        const themeCounts = allThemes.reduce((acc, theme) => {
            acc[theme] = (acc[theme] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const maxCount = Math.max(...Object.values(themeCounts), 1);
        const totalThemes = allThemes.length;

        return maxCount / totalThemes;
    };

    const calculateContextRelevance = () => {
        if (selectedContexts.length === 0) return 0;

        const selectedFileContexts = deepFileContexts.filter(fc => selectedContexts.includes(fc.fileId));
        const avgRelevance = selectedFileContexts.reduce((sum, ctx) => sum + ctx.relevance, 0) / selectedFileContexts.length;

        return avgRelevance;
    };

    const generateAdvancedInsights = () => {
        const insights: string[] = [];

        // 복잡도 기반 인사이트
        const avgComplexity = deepFileContexts.reduce((sum, ctx) => sum + ctx.semanticAnalysis.complexity, 0) / deepFileContexts.length;
        if (avgComplexity > 0.7) {
            insights.push('고복잡도 문서들이 많아 전문적인 수준의 분석이 필요합니다');
        } else if (avgComplexity < 0.3) {
            insights.push('단순한 문서들이 많아 이해하기 쉬운 설명이 적합합니다');
        }

        // 톤 기반 인사이트
        const dominantTone = getDominantTone();
        if (dominantTone === 'positive') {
            insights.push('긍정적인 톤의 문서들이 많아 낙관적인 관점의 글쓰기가 적합합니다');
        } else if (dominantTone === 'negative') {
            insights.push('신중한 톤의 문서들이 많아 균형잡힌 관점의 글쓰기가 필요합니다');
        }

        // 지식 밀도 기반 인사이트
        const knowledgeDensity = calculateKnowledgeDensity();
        if (knowledgeDensity > 5) {
            insights.push('높은 지식 밀도로 인해 깊이 있는 분석이 가능합니다');
        } else if (knowledgeDensity < 2) {
            insights.push('지식 밀도가 낮아 기본적인 설명이 적합합니다');
        }

        return insights;
    };

    // 스마트 제안 시스템
    const generateSmartSuggestions = (userInput: string, selectedContexts: string[]) => {
        const suggestions: string[] = [];

        // 문맥 기반 제안
        if (selectedContexts.length === 0) {
            suggestions.push('📁 파일을 선택하여 문맥을 활용한 글쓰기를 시작하세요');
        } else if (selectedContexts.length === 1) {
            suggestions.push('🔗 더 많은 파일을 선택하여 지식 연결성을 높여보세요');
        } else {
            suggestions.push('🧠 선택된 파일들의 지식 그래프를 활용하여 통합적 분석을 해보세요');
        }

        // 입력 내용 기반 제안
        if (userInput.includes('?')) {
            suggestions.push('❓ 질문형 입력이 감지되었습니다. 분석적 접근을 권장합니다');
        }

        if (userInput.includes('전략') || userInput.includes('계획')) {
            suggestions.push('🎯 전략적 사고를 위해 체계적인 프레임워크를 활용하세요');
        }

        if (userInput.includes('데이터') || userInput.includes('분석')) {
            suggestions.push('📊 데이터 기반 분석을 위해 통계적 인사이트를 강조하세요');
        }

        if (userInput.includes('혁신') || userInput.includes('창의')) {
            suggestions.push('💡 혁신적 사고를 위해 다양한 관점을 통합해보세요');
        }

        // 대화 분위기 기반 제안
        switch (conversationMood) {
            case 'analytical':
                suggestions.push('🔬 분석적 접근을 위해 논리적 구조를 강화하세요');
                break;
            case 'creative':
                suggestions.push('🎨 창의적 사고를 위해 비유와 은유를 활용하세요');
                break;
            case 'strategic':
                suggestions.push('⚡ 전략적 사고를 위해 장기적 관점을 고려하세요');
                break;
            case 'educational':
                suggestions.push('📚 교육적 접근을 위해 단계적 설명을 활용하세요');
                break;
        }

        setSmartSuggestions(suggestions);
    };

    // 대화 분위기 감지
    const detectConversationMood = (userInput: string) => {
        const analyticalWords = ['분석', '데이터', '통계', '논리', '사실'];
        const creativeWords = ['창의', '혁신', '아이디어', '상상', '예술'];
        const strategicWords = ['전략', '계획', '목표', '비전', '미래'];
        const educationalWords = ['설명', '교육', '학습', '이해', '개념'];

        const counts = {
            analytical: analyticalWords.filter(word => userInput.includes(word)).length,
            creative: creativeWords.filter(word => userInput.includes(word)).length,
            strategic: strategicWords.filter(word => userInput.includes(word)).length,
            educational: educationalWords.filter(word => userInput.includes(word)).length
        };

        const maxMood = Object.entries(counts).reduce((a, b) => counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b);
        setConversationMood(maxMood[0] as any);
    };

    // 글쓰기 강도 조절
    const adjustWritingIntensity = (userInput: string) => {
        const intensityWords = {
            light: ['간단', '요약', '개요', '핵심'],
            moderate: ['보통', '일반', '표준', '균형'],
            intense: ['심화', '깊이', '상세', '포괄']
        };

        for (const [intensity, words] of Object.entries(intensityWords)) {
            if (words.some(word => userInput.includes(word))) {
                setWritingIntensity(intensity as any);
                return;
            }
        }
    };

    // 실시간 피드백 생성
    const generateRealTimeFeedback = () => {
        const feedback: string[] = [];

        // 문맥 활용도 피드백
        const contextUtilization = selectedContexts.length / Math.max(deepFileContexts.length, 1);
        if (contextUtilization < 0.3) {
            feedback.push('⚠️ 문맥 활용도가 낮습니다. 더 많은 파일을 선택해보세요');
        } else if (contextUtilization > 0.8) {
            feedback.push('✅ 문맥 활용도가 높습니다. 좋은 선택입니다');
        }

        // 키워드 활용도 피드백
        if (writingSettings.keywords.length === 0) {
            feedback.push('💡 전문 키워드를 추가하여 글쓰기의 정확도를 높여보세요');
        }

        // 대화 분위기 피드백
        feedback.push(`🎭 현재 대화 분위기: ${conversationMood === 'analytical' ? '분석적' :
            conversationMood === 'creative' ? '창의적' :
                conversationMood === 'strategic' ? '전략적' : '교육적'}`);

        // 글쓰기 강도 피드백
        feedback.push(`⚡ 글쓰기 강도: ${writingIntensity === 'light' ? '가벼운' :
            writingIntensity === 'moderate' ? '보통' : '강한'}`);

        return feedback;
    };

    // AI 학습 모드 활성화
    const enableAILearning = () => {
        setAiLearningMode(true);
        addMessage('system', '🤖 AI 학습 모드가 활성화되었습니다. 대화를 통해 지식을 학습하고 개선합니다.');
    };

    // 협업 모드 활성화
    const enableCollaborationMode = () => {
        setCollaborationMode(true);
        addMessage('system', '👥 협업 모드가 활성화되었습니다. 여러 관점에서 문맥을 분석합니다.');
    };

    // 실시간 협업 기능
    const enableRealTimeCollaboration = () => {
        setCollaborationMode(true);
        setRealTimeCollaboration({
            participants: ['전문가', '분석가', '전략가', '연구자'],
            perspectives: ['기술적', '비즈니스적', '전략적', '분석적'],
            collaborationMode: 'active'
        });
        addMessage('system', '👥 실시간 협업 모드가 활성화되었습니다. 여러 전문가의 관점에서 문맥을 분석합니다.');
    };

    // AI 학습 진행도 추적
    const trackAILearningProgress = () => {
        const progress = {
            learnedConcepts: deepFileContexts.length * 2,
            improvedAccuracy: Math.min(0.9 + (conversation.length * 0.01), 0.95),
            contextualUnderstanding: Math.min(0.8 + (selectedContexts.length * 0.05), 0.9),
            knowledgeIntegration: Math.min(0.7 + (knowledgeInsights.length * 0.02), 0.85)
        };
        setAiLearningProgress(progress);
    };

    // 문맥 기억 기능
    const addToContextualMemory = (context: any) => {
        setContextualMemory(prev => [...prev, {
            id: Date.now(),
            context: context,
            timestamp: new Date(),
            relevance: context.relevance || 0.8
        }]);
    };

    // 고급 문맥 추론 강화
    const performAdvancedContextInference = (userInput: string) => {
        const inference = {
            impliedTopics: extractImpliedTopics(userInput),
            suggestedConnections: findSuggestedConnections(userInput),
            potentialInsights: generatePotentialInsights(userInput),
            writingRecommendations: generateWritingRecommendations(userInput),
            contextualMemory: contextualMemory.filter(mem => mem.relevance > 0.7),
            collaborativeInsights: generateCollaborativeInsights(userInput),
            aiLearningInsights: generateAILearningInsights(userInput),
            adaptiveLearningInsights: generateAdaptiveLearningInsights(userInput),
            semanticUnderstandingInsights: generateSemanticUnderstandingInsights(userInput),
            knowledgeSynthesisInsights: generateKnowledgeSynthesisInsights(userInput)
        };

        setContextInference(inference);
    };

    const generateCollaborativeInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (collaborationMode) {
            insights.push('👥 다중 관점 분석: 여러 전문가의 관점에서 종합적 분석을 제공합니다');
            insights.push('�� 지식 통합: 다양한 관점의 지식을 통합하여 깊이 있는 인사이트를 생성합니다');
            insights.push('⚖️ 균형잡힌 접근: 기술적, 비즈니스적, 전략적 관점을 균형있게 고려합니다');
        }

        if (input.includes('전략')) {
            insights.push('🎯 전략적 사고: 장기적 관점과 실행 가능성을 함께 고려합니다');
        }

        if (input.includes('혁신')) {
            insights.push('💡 혁신적 접근: 기존 패러다임을 넘어선 새로운 관점을 제시합니다');
        }

        return insights;
    };

    const generateAILearningInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (aiLearningMode) {
            insights.push('🤖 학습된 패턴: 이전 대화에서 학습한 패턴을 활용합니다');
            insights.push('📈 개선된 정확도: 지속적인 학습을 통해 분석 정확도가 향상되었습니다');
            insights.push('🧠 적응형 응답: 사용자 패턴에 맞춰 응답을 최적화합니다');
        }

        if (contextualMemory.length > 0) {
            insights.push(`💾 문맥 기억: ${contextualMemory.length}개의 이전 문맥을 기억하고 활용합니다`);
        }

        return insights;
    };

    const extractImpliedTopics = (input: string): string[] => {
        const topics: string[] = [];

        if (input.includes('성과') || input.includes('결과')) {
            topics.push('성과 분석', '결과 평가', 'KPI 측정');
        }

        if (input.includes('미래') || input.includes('예측')) {
            topics.push('미래 전망', '예측 분석', '트렌드 분석');
        }

        if (input.includes('비교') || input.includes('대조')) {
            topics.push('비교 분석', '대조 연구', '벤치마킹');
        }

        if (input.includes('문제') || input.includes('해결')) {
            topics.push('문제 진단', '해결 방안', '개선 전략');
        }

        return topics;
    };

    const findSuggestedConnections = (input: string): string[] => {
        const connections: string[] = [];

        if (input.includes('데이터') && input.includes('의사결정')) {
            connections.push('데이터 기반 의사결정', '분석적 사고', '정량적 접근');
        }

        if (input.includes('전략') && input.includes('실행')) {
            connections.push('전략-실행 연결', '계획 수립', '실행 관리');
        }

        if (input.includes('기술') && input.includes('비즈니스')) {
            connections.push('기술-비즈니스 통합', '디지털 전환', '혁신 관리');
        }

        return connections;
    };

    const generatePotentialInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (input.includes('패턴')) {
            insights.push('데이터 패턴 분석을 통해 숨겨진 트렌드를 발견할 수 있습니다');
        }

        if (input.includes('관계')) {
            insights.push('요소 간의 상관관계를 분석하여 인과관계를 파악할 수 있습니다');
        }

        if (input.includes('변화')) {
            insights.push('시계열 분석을 통해 변화의 방향성을 예측할 수 있습니다');
        }

        return insights;
    };

    const generateWritingRecommendations = (input: string): string[] => {
        const recommendations: string[] = [];

        if (input.includes('설명')) {
            recommendations.push('단계적 설명 구조를 활용하세요');
            recommendations.push('비유와 예시를 통해 이해를 돕는 것이 좋습니다');
        }

        if (input.includes('분석')) {
            recommendations.push('데이터와 증거를 바탕으로 한 객관적 분석을 강조하세요');
            recommendations.push('분석 결과의 의미와 함의를 명확히 설명하세요');
        }

        if (input.includes('제안')) {
            recommendations.push('구체적이고 실행 가능한 제안을 제시하세요');
            recommendations.push('제안의 기대 효과와 리스크를 함께 설명하세요');
        }

        return recommendations;
    };

    const generateAdaptiveLearningInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (adaptiveLearning) {
            insights.push('🧠 적응형 학습: 사용자 패턴을 실시간으로 학습하여 응답을 최적화합니다');
            insights.push('📈 학습률: 높은 학습률로 빠른 적응과 개선을 제공합니다');
            insights.push('🔍 패턴 인식: 대화 패턴을 인식하여 일관성 있는 응답을 생성합니다');
            insights.push('💾 문맥 기억: 이전 대화의 문맥을 기억하여 연속성을 보장합니다');
        }

        return insights;
    };

    const generateSemanticUnderstandingInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (semanticUnderstanding) {
            insights.push('🔍 깊은 문맥 분석: 표면적 의미를 넘어선 깊은 문맥을 분석합니다');
            insights.push('🔗 시맨틱 관계: 단어와 개념 간의 의미적 관계를 파악합니다');
            insights.push('🧩 문맥 추론: 암시된 의미와 숨겨진 연결성을 발견합니다');
            insights.push('�� 지식 연결: 다양한 지식 영역 간의 연결성을 분석합니다');
        }

        return insights;
    };

    const generateKnowledgeSynthesisInsights = (input: string): string[] => {
        const insights: string[] = [];

        if (knowledgeSynthesis) {
            insights.push('🧩 다중 소스 통합: 다양한 파일과 문맥의 지식을 통합합니다');
            insights.push('🕸️ 지식 그래프 구축: 개념 간의 연결성을 시각화하고 분석합니다');
            insights.push('💡 인사이트 생성: 통합된 지식에서 새로운 인사이트를 도출합니다');
            insights.push('🔍 패턴 발견: 숨겨진 패턴과 트렌드를 발견합니다');
        }

        return insights;
    };

    // 고급 대화 기능 업데이트
    const handleAdvancedConversation = async () => {
        if (!writingPrompt.trim()) return;

        const userMessage = writingPrompt;
        setWritingPrompt('');

        // 대화 분위기 및 강도 감지
        detectConversationMood(userMessage);
        adjustWritingIntensity(userMessage);

        // 고급 문맥 추론 수행
        performAdvancedContextInference(userMessage);

        // AI 학습 진행도 추적
        if (aiLearningMode) {
            trackAILearningProgress();
        }

        // 문맥 기억에 추가
        if (deepFileContexts.length > 0) {
            addToContextualMemory({
                userInput: userMessage,
                selectedContexts: selectedContexts,
                conversationMood: conversationMood,
                writingIntensity: writingIntensity
            });
        }

        // 스마트 제안 생성
        generateSmartSuggestions(userMessage, selectedContexts);

        addMessage('user', userMessage);
        setIsGenerating(true);

        try {
            const selectedFileContexts = deepFileContexts.filter(fc =>
                selectedContexts.includes(fc.fileId)
            );

            // AI 학습 모드에서 추가 분석
            let enhancedContext = userMessage;
            if (aiLearningMode) {
                enhancedContext += '\n\n[AI 학습 모드] 이전 대화와 문맥을 학습하여 더 정교한 분석을 제공합니다.';
                if (aiLearningProgress) {
                    enhancedContext += `\n학습 진행도: 정확도 ${(aiLearningProgress.improvedAccuracy * 100).toFixed(1)}%, 이해도 ${(aiLearningProgress.contextualUnderstanding * 100).toFixed(1)}%`;
                }
            }

            // 협업 모드에서 다중 관점 분석
            if (collaborationMode) {
                enhancedContext += '\n\n[협업 모드] 여러 관점에서 문맥을 분석하여 종합적인 인사이트를 제공합니다.';
                if (realTimeCollaboration) {
                    enhancedContext += `\n참여자: ${realTimeCollaboration.participants.join(', ')}`;
                    enhancedContext += `\n관점: ${realTimeCollaboration.perspectives.join(', ')}`;
                }
            }

            // 적응형 학습 모드
            if (adaptiveLearning) {
                enhancedContext += '\n\n[적응형 학습 모드] 사용자 패턴을 실시간으로 학습하여 최적화된 응답을 제공합니다.';
                enhancedContext += `\n학습률: ${adaptiveLearning.learningRate}, 적응 속도: ${adaptiveLearning.adaptationSpeed}`;
            }

            // 시맨틱 이해 모드
            if (semanticUnderstanding) {
                enhancedContext += '\n\n[시맨틱 이해 모드] 문맥의 깊은 의미를 파악하고 연결성을 분석합니다.';
                enhancedContext += '\n깊은 문맥 분석, 시맨틱 관계, 문맥 추론, 지식 연결 활성화';
            }

            // 지식 합성 모드
            if (knowledgeSynthesis) {
                enhancedContext += '\n\n[지식 합성 모드] 다양한 소스의 지식을 통합하고 새로운 인사이트를 생성합니다.';
                enhancedContext += '\n다중 소스 통합, 지식 그래프 구축, 인사이트 생성, 패턴 발견 활성화';
            }

            // 문맥 기억 활용
            if (contextualMemory.length > 0) {
                enhancedContext += `\n\n[문맥 기억] ${contextualMemory.length}개의 이전 문맥을 기억하고 활용합니다.`;
            }

            // 고급 분석 수행
            const contextRelevance = advancedContextualWritingService.calculateContextRelevance(selectedFileContexts, enhancedContext);
            const knowledgeIntegration = advancedContextualWritingService.calculateKnowledgeIntegration(selectedFileContexts);
            const semanticCoherence = advancedContextualWritingService.calculateSemanticCoherence(selectedFileContexts);

            // 대화 분위기에 따른 설정 조정
            const adjustedSettings = {
                ...writingSettings,
                tone: (conversationMood === 'analytical' ? 'analytical' :
                    conversationMood === 'creative' ? 'narrative' :
                        conversationMood === 'strategic' ? 'technical' : 'insightful') as 'analytical' | 'technical' | 'narrative' | 'insightful',
                length: (writingIntensity === 'light' ? 'short' :
                    writingIntensity === 'intense' ? 'comprehensive' : 'medium') as 'comprehensive' | 'short' | 'medium' | 'long'
            };

            const enhancedRequest: AdvancedWritingRequest = {
                ...adjustedSettings,
                context: enhancedContext,
                fileContexts: selectedFileContexts,
                semanticAnalysis: semanticAnalysis
            };

            const response = await advancedContextualWritingService.generateAdvancedContextualWriting(
                projectId || 'default',
                enhancedRequest
            );

            if (response.success) {
                const qualityAnalysis = advancedContextualWritingService.analyzeAdvancedWritingQuality(
                    response.content,
                    response.contextRelevance,
                    response.knowledgeIntegration,
                    response.semanticCoherence
                );

                setQualityMetrics({
                    contextRelevance: response.contextRelevance,
                    knowledgeIntegration: response.knowledgeIntegration,
                    semanticCoherence: response.semanticCoherence,
                    overallScore: qualityAnalysis.overallScore
                });

                setWritingSuggestions(qualityAnalysis.recommendations);

                addMessage('assistant', response.content, {
                    contextUsed: response.usedContexts,
                    knowledgeApplied: response.generatedInsights,
                    semanticAnalysis: response.semanticConnections,
                    suggestions: response.suggestions,
                    qualityMetrics: {
                        contextRelevance: response.contextRelevance,
                        knowledgeIntegration: response.knowledgeIntegration,
                        semanticCoherence: response.semanticCoherence
                    },
                    conversationMood,
                    writingIntensity,
                    aiLearningMode,
                    collaborationMode,
                    contextInference,
                    aiLearningProgress,
                    realTimeCollaboration,
                    adaptiveLearning,
                    semanticUnderstanding,
                    knowledgeSynthesis
                });
            } else {
                addMessage('assistant', '죄송합니다. 고도화된 문맥 글쓰기 생성에 실패했습니다.');
            }

        } catch (error) {
            console.error('고도화된 문맥 글쓰기 생성 실패:', error);
            addMessage('assistant', '죄송합니다. 문맥 분석 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    // 실시간 입력 분석 업데이트
    useEffect(() => {
        if (writingPrompt.trim()) {
            generateContextRecommendations(writingPrompt);
            performAdvancedAnalysis();
            generateSmartSuggestions(writingPrompt, selectedContexts);
            performAdvancedContextInference(writingPrompt);
            if (aiLearningMode) {
                trackAILearningProgress();
            }
        }
    }, [writingPrompt, selectedContexts, deepFileContexts, conversationMood, writingIntensity, aiLearningMode, collaborationMode, contextualMemory, adaptiveLearning, semanticUnderstanding, knowledgeSynthesis]);

    // 지식 그래프 시각화 업데이트
    useEffect(() => {
        if (deepFileContexts.length > 0) {
            setKnowledgeGraphVisualization(generateKnowledgeGraphData());
        }
    }, [deepFileContexts]);

    // 적응형 학습 시스템
    const enableAdaptiveLearning = () => {
        setAdaptiveLearning({
            learningRate: 0.1,
            adaptationSpeed: 'high',
            patternRecognition: true,
            contextualMemory: true,
            semanticUnderstanding: true
        });
        addMessage('system', '�� 적응형 학습 시스템이 활성화되었습니다. 사용자 패턴을 실시간으로 학습하고 최적화합니다.');
    };

    // 시맨틱 이해 시스템
    const enableSemanticUnderstanding = () => {
        setSemanticUnderstanding({
            deepContextAnalysis: true,
            semanticRelationships: true,
            contextualInference: true,
            knowledgeConnections: true
        });
        addMessage('system', '🔍 시맨틱 이해 시스템이 활성화되었습니다. 문맥의 깊은 의미를 파악하고 연결성을 분석합니다.');
    };

    // 지식 합성 시스템
    const enableKnowledgeSynthesis = () => {
        setKnowledgeSynthesis({
            multiSourceIntegration: true,
            knowledgeGraphBuilding: true,
            insightGeneration: true,
            patternDiscovery: true
        });
        addMessage('system', '🧩 지식 합성 시스템이 활성화되었습니다. 다양한 소스의 지식을 통합하고 새로운 인사이트를 생성합니다.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <CpuChipIcon className="w-7 h-7 text-indigo-500" />
                        <h2 className="text-2xl font-bold text-gray-800">고도화된 문맥 기반 글쓰기 어시스턴트</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* AI 학습 모드 토글 */}
                        <button
                            onClick={enableAILearning}
                            disabled={aiLearningMode}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${aiLearningMode
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="AI 학습 모드 활성화"
                        >
                            🤖 AI 학습
                        </button>

                        {/* 적응형 학습 모드 토글 */}
                        <button
                            onClick={enableAdaptiveLearning}
                            disabled={adaptiveLearning}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${adaptiveLearning
                                ? 'bg-purple-100 text-purple-800 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="적응형 학습 모드 활성화"
                        >
                            🧠 적응형
                        </button>

                        {/* 시맨틱 이해 모드 토글 */}
                        <button
                            onClick={enableSemanticUnderstanding}
                            disabled={semanticUnderstanding}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${semanticUnderstanding
                                ? 'bg-orange-100 text-orange-800 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="시맨틱 이해 모드 활성화"
                        >
                            🔍 시맨틱
                        </button>

                        {/* 지식 합성 모드 토글 */}
                        <button
                            onClick={enableKnowledgeSynthesis}
                            disabled={knowledgeSynthesis}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${knowledgeSynthesis
                                ? 'bg-pink-100 text-pink-800 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="지식 합성 모드 활성화"
                        >
                            🧩 합성
                        </button>

                        {/* 실시간 협업 모드 토글 */}
                        <button
                            onClick={enableRealTimeCollaboration}
                            disabled={collaborationMode}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${collaborationMode
                                ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="실시간 협업 모드 활성화"
                        >
                            👥 협업
                        </button>

                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="글쓰기 어시스턴트 닫기"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex h-full">
                    {/* 왼쪽 패널 - 심층 문맥 분석 */}
                    <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            {/* 적응형 학습 정보 */}
                            {adaptiveLearning && (
                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                    <h3 className="text-lg font-semibold text-purple-800 mb-2">적응형 학습</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>학습률:</span>
                                            <span className="font-medium">{adaptiveLearning.learningRate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>적응 속도:</span>
                                            <span className="font-medium">{adaptiveLearning.adaptationSpeed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>패턴 인식:</span>
                                            <span className="font-medium">{adaptiveLearning.patternRecognition ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>문맥 기억:</span>
                                            <span className="font-medium">{adaptiveLearning.contextualMemory ? '활성' : '비활성'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 시맨틱 이해 정보 */}
                            {semanticUnderstanding && (
                                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                    <h3 className="text-lg font-semibold text-orange-800 mb-2">시맨틱 이해</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>깊은 문맥 분석:</span>
                                            <span className="font-medium">{semanticUnderstanding.deepContextAnalysis ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>시맨틱 관계:</span>
                                            <span className="font-medium">{semanticUnderstanding.semanticRelationships ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>문맥 추론:</span>
                                            <span className="font-medium">{semanticUnderstanding.contextualInference ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>지식 연결:</span>
                                            <span className="font-medium">{semanticUnderstanding.knowledgeConnections ? '활성' : '비활성'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 지식 합성 정보 */}
                            {knowledgeSynthesis && (
                                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                                    <h3 className="text-lg font-semibold text-pink-800 mb-2">지식 합성</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>다중 소스 통합:</span>
                                            <span className="font-medium">{knowledgeSynthesis.multiSourceIntegration ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>지식 그래프 구축:</span>
                                            <span className="font-medium">{knowledgeSynthesis.knowledgeGraphBuilding ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>인사이트 생성:</span>
                                            <span className="font-medium">{knowledgeSynthesis.insightGeneration ? '활성' : '비활성'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>패턴 발견:</span>
                                            <span className="font-medium">{knowledgeSynthesis.patternDiscovery ? '활성' : '비활성'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI 학습 진행도 */}
                            {aiLearningProgress && (
                                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">AI 학습 진행도</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>학습된 개념:</span>
                                            <span className="font-medium">{aiLearningProgress.learnedConcepts}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>정확도:</span>
                                            <span className="font-medium">{(aiLearningProgress.improvedAccuracy * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>문맥 이해도:</span>
                                            <span className="font-medium">{(aiLearningProgress.contextualUnderstanding * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>지식 통합도:</span>
                                            <span className="font-medium">{(aiLearningProgress.knowledgeIntegration * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 실시간 협업 정보 */}
                            {realTimeCollaboration && (
                                <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
                                    <h3 className="text-lg font-semibold text-cyan-800 mb-2">실시간 협업</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">참여자:</span>
                                            <div className="mt-1 space-y-1">
                                                {realTimeCollaboration.participants.map((participant: string, index: number) => (
                                                    <div key={index} className="text-xs bg-cyan-100 p-1 rounded">
                                                        {participant}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">관점:</span>
                                            <div className="mt-1 space-y-1">
                                                {realTimeCollaboration.perspectives.map((perspective: string, index: number) => (
                                                    <div key={index} className="text-xs bg-cyan-100 p-1 rounded">
                                                        {perspective}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 문맥 추론 결과 */}
                            {contextInference && (
                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">문맥 추론 결과</h3>

                                    {contextInference.impliedTopics.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">추론된 주제:</h4>
                                            <div className="space-y-1">
                                                {contextInference.impliedTopics.map((topic: string, index: number) => (
                                                    <div key={index} className="text-xs bg-yellow-100 p-1 rounded">
                                                        {topic}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.suggestedConnections.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">제안된 연결:</h4>
                                            <div className="space-y-1">
                                                {contextInference.suggestedConnections.map((connection: string, index: number) => (
                                                    <div key={index} className="text-xs bg-yellow-100 p-1 rounded">
                                                        {connection}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.potentialInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">잠재적 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.potentialInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.collaborativeInsights && contextInference.collaborativeInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">협업 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.collaborativeInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.aiLearningInsights && contextInference.aiLearningInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">AI 학습 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.aiLearningInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.adaptiveLearningInsights && contextInference.adaptiveLearningInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">적응형 학습 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.adaptiveLearningInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.semanticUnderstandingInsights && contextInference.semanticUnderstandingInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">시맨틱 이해 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.semanticUnderstandingInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.knowledgeSynthesisInsights && contextInference.knowledgeSynthesisInsights.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="font-medium text-yellow-700 mb-1">지식 합성 인사이트:</h4>
                                            <div className="space-y-1">
                                                {contextInference.knowledgeSynthesisInsights.map((insight: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {contextInference.writingRecommendations.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-yellow-700 mb-1">글쓰기 권장사항:</h4>
                                            <div className="space-y-1">
                                                {contextInference.writingRecommendations.map((rec: string, index: number) => (
                                                    <div key={index} className="text-xs text-yellow-700">
                                                        • {rec}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 기존 컴포넌트들... */}
                        </div>
                    </div>

                    {/* 오른쪽 패널 - 대화 및 분석 */}
                    <div className="flex-1 flex flex-col">
                        {/* 탭 네비게이션 */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('conversation')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'conversation'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                대화
                            </button>
                            <button
                                onClick={() => setActiveTab('context')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'context'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                문맥
                            </button>
                            <button
                                onClick={() => setActiveTab('knowledge')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'knowledge'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                지식
                            </button>
                            <button
                                onClick={() => setActiveTab('analysis')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'analysis'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                분석
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'insights'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                인사이트
                            </button>
                            <button
                                onClick={() => setActiveTab('quality')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'quality'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                품질
                            </button>
                            <button
                                onClick={() => setActiveTab('graph')}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'graph'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                그래프
                            </button>
                        </div>

                        {/* 탭 내용 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'conversation' && (
                                <div className="space-y-4">
                                    {/* 대화 영역 */}
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {conversation.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    {message.metadata && (
                                                        <div className="mt-2 text-xs opacity-75">
                                                            {message.metadata.contextUsed && (
                                                                <p>사용된 문맥: {message.metadata.contextUsed.length}개</p>
                                                            )}
                                                            {message.metadata.knowledgeApplied && (
                                                                <p>적용된 지식: {message.metadata.knowledgeApplied.length}개</p>
                                                            )}
                                                            {message.metadata.qualityMetrics && (
                                                                <div className="mt-1">
                                                                    <p>문맥 관련성: {(message.metadata.qualityMetrics.contextRelevance * 100).toFixed(1)}%</p>
                                                                    <p>지식 통합도: {(message.metadata.qualityMetrics.knowledgeIntegration * 100).toFixed(1)}%</p>
                                                                    <p>시맨틱 일관성: {(message.metadata.qualityMetrics.semanticCoherence * 100).toFixed(1)}%</p>
                                                                </div>
                                                            )}
                                                            {message.metadata.conversationMood && (
                                                                <p>대화 분위기: {message.metadata.conversationMood}</p>
                                                            )}
                                                            {message.metadata.writingIntensity && (
                                                                <p>글쓰기 강도: {message.metadata.writingIntensity}</p>
                                                            )}
                                                            {message.metadata.aiLearningMode && (
                                                                <p>🤖 AI 학습 모드 활성</p>
                                                            )}
                                                            {message.metadata.collaborationMode && (
                                                                <p>👥 협업 모드 활성</p>
                                                            )}
                                                            {message.metadata.adaptiveLearning && (
                                                                <p>🧠 적응형 학습 모드 활성</p>
                                                            )}
                                                            {message.metadata.semanticUnderstanding && (
                                                                <p>🔍 시맨틱 이해 모드 활성</p>
                                                            )}
                                                            {message.metadata.knowledgeSynthesis && (
                                                                <p>🧩 지식 합성 모드 활성</p>
                                                            )}
                                                            {message.metadata.aiLearningProgress && (
                                                                <p>📈 학습 진행도: {(message.metadata.aiLearningProgress.improvedAccuracy * 100).toFixed(1)}%</p>
                                                            )}
                                                            {message.metadata.realTimeCollaboration && (
                                                                <p>👥 협업 참여자: {message.metadata.realTimeCollaboration.participants.length}명</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isGenerating && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-500" />
                                                        <span className="text-sm">심층 문맥 분석 중...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={conversationEndRef} />
                                    </div>

                                    {/* 입력 영역 */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={writingPrompt}
                                                onChange={(e) => setWritingPrompt(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAdvancedConversation()}
                                                placeholder="고도화된 문맥 분석 기반 글쓰기 요청을 입력하세요..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                disabled={isGenerating}
                                            />
                                            <button
                                                onClick={handleAdvancedConversation}
                                                disabled={isGenerating || !writingPrompt.trim()}
                                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="고도화된 메시지 전송"
                                            >
                                                <PaperAirplaneIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'context' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">심층 문맥 분석</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {deepFileContexts.map((context) => (
                                            <div key={context.fileId} className="bg-white p-4 rounded-lg border">
                                                <h4 className="font-medium text-gray-800 mb-2">{context.fileName}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="font-medium text-blue-600">주제:</span>
                                                        <span className="ml-2">{context.semanticAnalysis.topics.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-green-600">개체:</span>
                                                        <span className="ml-2">{context.semanticAnalysis.entities.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-purple-600">관계:</span>
                                                        <span className="ml-2">{context.semanticAnalysis.relationships.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-orange-600">테마:</span>
                                                        <span className="ml-2">{context.semanticAnalysis.themes.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-red-600">복잡도:</span>
                                                        <span className="ml-2">{(context.semanticAnalysis.complexity * 100).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'knowledge' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">지식 그래프</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {deepFileContexts.map((context) => (
                                            <div key={context.fileId} className="bg-white p-4 rounded-lg border">
                                                <h4 className="font-medium text-gray-800 mb-2">{context.fileName}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="font-medium text-indigo-600">개념:</span>
                                                        <span className="ml-2">{context.knowledgeGraph.concepts.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-teal-600">연결:</span>
                                                        <span className="ml-2">{context.knowledgeGraph.connections.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-amber-600">인사이트:</span>
                                                        <div className="mt-1 space-y-1">
                                                            {context.knowledgeGraph.insights.map((insight, index) => (
                                                                <p key={index} className="text-xs bg-gray-50 p-2 rounded">
                                                                    {insight}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'analysis' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">시맨틱 분석</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {deepFileContexts.map((context) => (
                                            <div key={context.fileId} className="bg-white p-4 rounded-lg border">
                                                <h4 className="font-medium text-gray-800 mb-2">{context.fileName}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span>신뢰도</span>
                                                        <span className="font-medium">{(context.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>관련성</span>
                                                        <span className="font-medium">{(context.relevance * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>복잡도</span>
                                                        <span className="font-medium">{(context.semanticAnalysis.complexity * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>톤</span>
                                                        <span className="font-medium">{context.semanticAnalysis.tone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">통합 인사이트</h3>
                                    <div className="space-y-3">
                                        {knowledgeInsights.map((insight, index) => (
                                            <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500">
                                                <div className="flex items-start space-x-2">
                                                    <BeakerIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
                                                    <p className="text-sm text-gray-800">{insight}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'quality' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800">글쓰기 품질 분석</h3>

                                    {/* 전체 점수 */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-800">전체 품질 점수</h4>
                                            {getQualityIcon(qualityMetrics.overallScore)}
                                        </div>
                                        <div className="text-3xl font-bold text-indigo-600">
                                            {(qualityMetrics.overallScore * 100).toFixed(1)}%
                                        </div>
                                    </div>

                                    {/* 세부 메트릭 */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">문맥 관련성</span>
                                                {getQualityIcon(qualityMetrics.contextRelevance)}
                                            </div>
                                            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.contextRelevance)}`}>
                                                {(qualityMetrics.contextRelevance * 100).toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                선택된 파일과 요청의 관련성
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">지식 통합도</span>
                                                {getQualityIcon(qualityMetrics.knowledgeIntegration)}
                                            </div>
                                            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.knowledgeIntegration)}`}>
                                                {(qualityMetrics.knowledgeIntegration * 100).toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                개념과 연결성의 통합 정도
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">시맨틱 일관성</span>
                                                {getQualityIcon(qualityMetrics.semanticCoherence)}
                                            </div>
                                            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.semanticCoherence)}`}>
                                                {(qualityMetrics.semanticCoherence * 100).toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                톤과 테마의 일관성
                                            </p>
                                        </div>
                                    </div>

                                    {/* 개선 제안 */}
                                    {writingSuggestions.length > 0 && (
                                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                            <h4 className="font-semibold text-yellow-800 mb-2">개선 제안</h4>
                                            <ul className="space-y-1">
                                                {writingSuggestions.map((suggestion, index) => (
                                                    <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                                                        <LightBulbIconSolid className="w-4 h-4 mt-0.5 text-yellow-600" />
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 새로운 그래프 탭 */}
                            {activeTab === 'graph' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">지식 그래프 시각화</h3>
                                    {knowledgeGraphVisualization ? (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-800 mb-2">그래프 통계</h4>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {knowledgeGraphVisualization.nodes.filter((n: any) => n.type === 'file').length}
                                                        </div>
                                                        <div className="text-gray-600">파일</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {knowledgeGraphVisualization.nodes.filter((n: any) => n.type === 'concept').length}
                                                        </div>
                                                        <div className="text-gray-600">개념</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {knowledgeGraphVisualization.edges.length}
                                                        </div>
                                                        <div className="text-gray-600">연결</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-800">주요 개념들</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {knowledgeGraphVisualization.nodes
                                                        .filter((n: any) => n.type === 'concept')
                                                        .slice(0, 8)
                                                        .map((node: any, index: number) => (
                                                            <div key={index} className="bg-green-50 p-2 rounded text-sm">
                                                                {node.label}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="font-medium text-gray-800 mb-2">주요 연결성</h4>
                                                <div className="space-y-1">
                                                    {knowledgeGraphVisualization.edges
                                                        .filter((e: any) => e.label === 'relates')
                                                        .slice(0, 5)
                                                        .map((edge: any, index: number) => (
                                                            <div key={index} className="bg-purple-50 p-2 rounded text-sm">
                                                                {edge.label}: {edge.from} → {edge.to}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>지식 그래프 데이터가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedContextualWritingAssistant; 