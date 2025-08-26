import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Button,
    IconButton,
    Paper,
    Chip,
    Typography,
    Autocomplete,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    CircularProgress,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Send as SendIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    AttachFile as AttachFileIcon,
    Image as ImageIcon,
    Code as CodeIcon,
    Psychology as PsychologyIcon,
    Search as SearchIcon,
    AutoAwesome as AutoAwesomeIcon,
    SmartToy as SmartToyIcon,
    Translate as TranslateIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    KeyboardVoice as KeyboardVoiceIcon,
    Stop as StopIcon,
    PlayArrow as PlayArrowIcon,
    VolumeUp as VolumeUpIcon,
    Speed as SpeedIcon,
    Lightbulb as LightbulbIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import advancedNLPEngine from '../services/advancedNLPEngine';
import integratedAIService from '../services/integratedAIService';

// 고급 입력폼 스타일
const AdvancedInputContainer = styled(Paper)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    minHeight: '200px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    }
}));

const InputField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: theme.spacing(2),
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
        }
    },
    '& .MuiOutlinedInput-input': {
        fontSize: '1.1rem',
        lineHeight: 1.6,
        padding: theme.spacing(2),
    }
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 3),
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'scale(1.05)',
    }
}));

// 인터페이스 정의
interface QuestionAnalysis {
    intent: string;
    entities: Array<{ text: string; type: string; confidence: number }>;
    sentiment: { score: number; label: string };
    complexity: number;
    topics: string[];
    keywords: string[];
    suggestedActions: string[];
    confidence: number;
}

interface InputContext {
    conversationHistory: string[];
    userPreferences: {
        expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        preferredLanguage: string;
        responseStyle: 'concise' | 'detailed' | 'technical' | 'friendly';
        includeExamples: boolean;
        includeCode: boolean;
    };
    currentDomain: string;
    recentTopics: string[];
}

interface AdvancedInputFormProps {
    onSubmit: (input: string, context: InputContext) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const AdvancedInputForm: React.FC<AdvancedInputFormProps> = ({
    onSubmit,
    isLoading = false,
    disabled = false
}) => {
    // 상태 관리
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [context, setContext] = useState<InputContext>({
        conversationHistory: [],
        userPreferences: {
            expertiseLevel: 'intermediate',
            preferredLanguage: 'ko',
            responseStyle: 'detailed',
            includeExamples: true,
            includeCode: true
        },
        currentDomain: 'general',
        recentTopics: []
    });

    // 음성 인식 관련
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    // 파일 업로드 관련
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 고급 기능 상태
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);
    const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);
    const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(false);

    // 실시간 분석 디바운싱
    const analysisTimeoutRef = useRef<NodeJS.Timeout>();

    // 음성 인식 초기화
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ko-KR';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    // 실시간 질문 분석
    const analyzeQuestion = useCallback(async (question: string) => {
        if (!question.trim() || question.length < 3) {
            setAnalysis(null);
            return;
        }

        setIsAnalyzing(true);
        try {
            // 고급 NLP 분석
            const nlpResult = await advancedNLPEngine.analyzeText(question, 'user-1', {
                conversation_history: context.conversationHistory,
                user_preferences: context.userPreferences
            });

            // 질문 분석 결과 구성
            const questionAnalysis: QuestionAnalysis = {
                intent: nlpResult.intent,
                entities: nlpResult.entities.map(entity => ({
                    text: entity.text,
                    type: entity.label,
                    confidence: entity.confidence
                })),
                sentiment: {
                    score: nlpResult.sentiment.score,
                    label: nlpResult.sentiment.label
                },
                complexity: nlpResult.complexity,
                topics: nlpResult.topics,
                keywords: nlpResult.keywords,
                suggestedActions: generateSuggestedActions(nlpResult),
                confidence: nlpResult.sentiment.confidence
            };

            setAnalysis(questionAnalysis);

            // 제안사항 생성
            const newSuggestions = generateSuggestions(questionAnalysis, context);
            setSuggestions(newSuggestions);

            // 컨텍스트 업데이트
            updateContext(questionAnalysis);

        } catch (error) {
            console.error('Question analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [context]);

    // 실시간 분석 디바운싱
    useEffect(() => {
        if (realTimeAnalysis && input) {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
            analysisTimeoutRef.current = setTimeout(() => {
                analyzeQuestion(input);
            }, 500);
        }

        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
        };
    }, [input, realTimeAnalysis, analyzeQuestion]);

    // 제안 액션 생성
    const generateSuggestedActions = (nlpResult: any): string[] => {
        const actions: string[] = [];

        if (nlpResult.intent === 'question') {
            actions.push('🔍 상세 검색', '📚 관련 문서', '💡 예시 제공');
        } else if (nlpResult.intent === 'problem_solving') {
            actions.push('🛠️ 해결책 제시', '📋 단계별 가이드', '⚠️ 주의사항');
        } else if (nlpResult.intent === 'learning') {
            actions.push('📖 튜토리얼', '🎯 핵심 개념', '📝 요약');
        }

        if (nlpResult.context.domain === 'software_engineering') {
            actions.push('💻 코드 예제', '🔧 도구 추천');
        }

        return actions;
    };

    // 제안사항 생성
    const generateSuggestions = (analysis: QuestionAnalysis, context: InputContext): string[] => {
        const suggestions: string[] = [];

        // 복잡도 기반 제안
        if (analysis.complexity > 7) {
            suggestions.push('이 질문은 복잡합니다. 단계별로 나누어 설명해드릴까요?');
        }

        // 주제 기반 제안
        if (analysis.topics.includes('programming')) {
            suggestions.push('코드 예제를 포함한 답변을 원하시나요?');
        }

        // 감정 기반 제안
        if (analysis.sentiment.label === 'negative') {
            suggestions.push('더 자세한 설명이 필요하시면 말씀해 주세요.');
        }

        // 컨텍스트 기반 제안
        if (context.recentTopics.length > 0) {
            const relatedTopic = context.recentTopics[0];
            suggestions.push(`이전에 ${relatedTopic}에 대해 이야기했는데, 관련이 있나요?`);
        }

        return suggestions;
    };

    // 컨텍스트 업데이트
    const updateContext = (analysis: QuestionAnalysis) => {
        setContext(prev => ({
            ...prev,
            currentDomain: analysis.topics[0] || 'general',
            recentTopics: [...new Set([...analysis.topics, ...prev.recentTopics])].slice(0, 5)
        }));
    };

    // 음성 녹음 시작/중지
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('음성 인식이 지원되지 않는 브라우저입니다.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            if (transcript) {
                setInput(prev => prev + transcript);
                setTranscript('');
            }
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setAttachedFiles(prev => [...prev, ...files]);
    };

    // 제안 클릭 처리
    const handleSuggestionClick = (suggestion: string) => {
        setInput(prev => prev + ' ' + suggestion);
    };

    // 제안 액션 클릭 처리
    const handleActionClick = (action: string) => {
        const actionPrompts = {
            '🔍 상세 검색': '더 자세한 정보를 검색해주세요.',
            '📚 관련 문서': '관련 문서나 참고 자료를 제공해주세요.',
            '💡 예시 제공': '실제 예시를 들어 설명해주세요.',
            '🛠️ 해결책 제시': '구체적인 해결 방법을 알려주세요.',
            '📋 단계별 가이드': '단계별로 자세히 설명해주세요.',
            '⚠️ 주의사항': '주의해야 할 점들을 알려주세요.',
            '📖 튜토리얼': '기초부터 차근차근 설명해주세요.',
            '🎯 핵심 개념': '핵심 개념을 정리해주세요.',
            '📝 요약': '간단히 요약해주세요.',
            '💻 코드 예제': '코드 예제를 포함해서 설명해주세요.',
            '🔧 도구 추천': '유용한 도구들을 추천해주세요.'
        };

        const prompt = actionPrompts[action as keyof typeof actionPrompts];
        if (prompt) {
            setInput(prev => prev + ' ' + prompt);
        }
    };

    // 폼 제출 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // 최종 분석 수행
        await analyzeQuestion(input);

        // 컨텍스트와 함께 제출
        const finalContext: InputContext = {
            ...context,
            conversationHistory: [...context.conversationHistory, input]
        };

        onSubmit(input, finalContext);
        setInput('');
        setAnalysis(null);
        setSuggestions([]);
        setAttachedFiles([]);
    };

    // 자동완성 옵션들
    const autoCompleteOptions = [
        'React 성능 최적화 방법',
        'TypeScript 타입 정의',
        'Node.js 서버 구축',
        '데이터베이스 설계',
        'API 개발 가이드',
        '보안 취약점 점검',
        '테스트 코드 작성',
        '배포 자동화',
        '모니터링 시스템',
        '마이크로서비스 아키텍처'
    ];

    return (
        <AdvancedInputContainer elevation={3}>
            {/* 헤더 섹션 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    🤖 고급 AI 질문 시스템
                </Typography>
                <Box display="flex" gap={1}>
                    <Tooltip title="고급 옵션">
                        <IconButton
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            sx={{ color: 'white' }}
                        >
                            <Settings />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="도움말">
                        <IconButton sx={{ color: 'white' }}>
                            <Help />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 고급 옵션 패널 */}
            {showAdvancedOptions && (
                <Box mb={3} p={2} bgcolor="rgba(255,255,255,0.1)" borderRadius={2}>
                    <Typography variant="subtitle2" mb={2}>고급 설정</Typography>
                    <Box display="flex" gap={3} flexWrap="wrap">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoCompleteEnabled}
                                    onChange={(e) => setAutoCompleteEnabled(e.target.checked)}
                                    sx={{ color: 'white' }}
                                />
                            }
                            label="자동완성"
                            sx={{ color: 'white' }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={realTimeAnalysis}
                                    onChange={(e) => setRealTimeAnalysis(e.target.checked)}
                                    sx={{ color: 'white' }}
                                />
                            }
                            label="실시간 분석"
                            sx={{ color: 'white' }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={voiceResponseEnabled}
                                    onChange={(e) => setVoiceResponseEnabled(e.target.checked)}
                                    sx={{ color: 'white' }}
                                />
                            }
                            label="음성 응답"
                            sx={{ color: 'white' }}
                        />
                    </Box>
                </Box>
            )}

            {/* 메인 입력 폼 */}
            <form onSubmit={handleSubmit}>
                <Box display="flex" gap={2} alignItems="flex-end">
                    {/* 자동완성 입력 필드 */}
                    <Box flex={1}>
                        {autoCompleteEnabled ? (
                            <Autocomplete
                                freeSolo
                                options={autoCompleteOptions}
                                value={input}
                                onChange={(_, newValue) => setInput(newValue || '')}
                                onInputChange={(_, newInputValue) => setInput(newInputValue)}
                                renderInput={(params) => (
                                    <InputField
                                        {...params}
                                        multiline
                                        rows={3}
                                        placeholder="질문을 입력하거나 제안사항을 선택하세요..."
                                        variant="outlined"
                                        fullWidth
                                        disabled={disabled}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {isAnalyzing && <CircularProgress size={20} />}
                                                    {isListening && (
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <Box
                                                                width={8}
                                                                height={8}
                                                                borderRadius="50%"
                                                                bgcolor="red"
                                                                sx={{ animation: 'pulse 1s infinite' }}
                                                            />
                                                            <Typography variant="caption">듣는 중...</Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )
                                        }}
                                    />
                                )}
                            />
                        ) : (
                            <InputField
                                multiline
                                rows={3}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="질문을 입력하세요..."
                                variant="outlined"
                                fullWidth
                                disabled={disabled}
                            />
                        )}
                    </Box>

                    {/* 액션 버튼들 */}
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Tooltip title="음성 입력">
                            <IconButton
                                onClick={toggleRecording}
                                sx={{
                                    color: isListening ? 'red' : 'white',
                                    bgcolor: isListening ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.2)'
                                }}
                                disabled={disabled}
                            >
                                {isListening ? <StopIcon /> : <MicIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="파일 첨부">
                            <IconButton
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                                disabled={disabled}
                            >
                                <AttachFileIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="전송">
                            <IconButton
                                type="submit"
                                disabled={!input.trim() || isLoading || disabled}
                                sx={{
                                    color: 'white',
                                    bgcolor: input.trim() ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* 숨겨진 파일 입력 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx,.txt,.md,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs"
                />
            </form>

            {/* 음성 전사 결과 */}
            {transcript && (
                <Box mt={2} p={2} bgcolor="rgba(255,255,255,0.1)" borderRadius={1}>
                    <Typography variant="caption" color="white">
                        음성 인식: {transcript}
                    </Typography>
                </Box>
            )}

            {/* 첨부된 파일들 */}
            {attachedFiles.length > 0 && (
                <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    {attachedFiles.map((file, index) => (
                        <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                    ))}
                </Box>
            )}

            {/* 실시간 분석 결과 */}
            {analysis && (
                <Box mt={3} p={2} bgcolor="rgba(255,255,255,0.1)" borderRadius={2}>
                    <Typography variant="subtitle2" mb={2} fontWeight="bold">
                        📊 질문 분석 결과
                    </Typography>

                    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                        <FeatureChip
                            label={`의도: ${analysis.intent}`}
                            size="small"
                        />
                        <FeatureChip
                            label={`복잡도: ${analysis.complexity}/10`}
                            size="small"
                        />
                        <FeatureChip
                            label={`감정: ${analysis.sentiment.label}`}
                            size="small"
                        />
                        <FeatureChip
                            label={`신뢰도: ${(analysis.confidence * 100).toFixed(1)}%`}
                            size="small"
                        />
                    </Box>

                    {/* 주제 및 키워드 */}
                    {analysis.topics.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="caption" display="block" mb={1}>
                                주제: {analysis.topics.join(', ')}
                            </Typography>
                        </Box>
                    )}

                    {/* 제안 액션들 */}
                    {analysis.suggestedActions.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="caption" display="block" mb={1}>
                                제안 액션:
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {analysis.suggestedActions.map((action, index) => (
                                    <Chip
                                        key={index}
                                        label={action}
                                        size="small"
                                        onClick={() => handleActionClick(action)}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            {/* 제안사항 */}
            {suggestions.length > 0 && (
                <Box mt={2}>
                    <Typography variant="subtitle2" mb={1} fontWeight="bold">
                        💡 제안사항
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {suggestions.map((suggestion, index) => (
                            <Chip
                                key={index}
                                label={suggestion}
                                size="small"
                                onClick={() => handleSuggestionClick(suggestion)}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* 빠른 액션 버튼들 */}
            <Box mt={3} display="flex" gap={1} flexWrap="wrap">
                <ActionButton
                    startIcon={<SearchIcon />}
                    onClick={() => setInput(prev => prev + ' 검색해주세요')}
                    size="small"
                >
                    검색
                </ActionButton>
                <ActionButton
                    startIcon={<CodeIcon />}
                    onClick={() => setInput(prev => prev + ' 코드 예제를 포함해서')}
                    size="small"
                >
                    코드
                </ActionButton>
                <ActionButton
                    startIcon={<PsychologyIcon />}
                    onClick={() => setInput(prev => prev + ' 자세히 설명해주세요')}
                    size="small"
                >
                    설명
                </ActionButton>
                <ActionButton
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => setInput(prev => prev + ' 최적화 방법을 알려주세요')}
                    size="small"
                >
                    최적화
                </ActionButton>
                <ActionButton
                    startIcon={<SmartToyIcon />}
                    onClick={() => setInput(prev => prev + ' AI 관점에서 분석해주세요')}
                    size="small"
                >
                    AI 분석
                </ActionButton>
            </Box>

            {/* 상태 표시 */}
            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="rgba(255,255,255,0.8)">
                    {input.length}자 입력됨
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                    {isAnalyzing && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CircularProgress size={16} />
                            <Typography variant="caption">분석 중...</Typography>
                        </Box>
                    )}
                    {isListening && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Box width={6} height={6} borderRadius="50%" bgcolor="red" />
                            <Typography variant="caption">음성 인식 중</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </AdvancedInputContainer>
    );
};

export default AdvancedInputForm;
