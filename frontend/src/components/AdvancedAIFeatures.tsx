import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Chip,
    LinearProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack
} from '@mui/material';
import {
    Psychology,
    Summarize,
    Translate,
    Search,
    TrendingUp
} from '@mui/icons-material';
import {
    API_BASE_URL,
    API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH,
    API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH,
    API_V8_ADVANCED_SYSTEM_HEALTH_PATH,
    API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH,
    FALLBACK_API_ORIGIN,
    joinApiHealthCheckUrl,
} from '../config/api';
import { coerceTrimmedString } from '../utils/chatInputUtils';

const ADVANCED_AI_API_BASE = (API_BASE_URL || FALLBACK_API_ORIGIN).replace(/\/$/, '');

interface AdvancedAIFeaturesProps {
    onAnalysisComplete?: (result: unknown) => void;
}

interface SentimentResult {
    dominant_emotion: string;
    confidence: number;
    sentiment_scores: Record<string, number>;
}

interface SummaryResult {
    original_length: number;
    summary_length: number;
    compression_ratio: number;
    summary: string;
}

interface KeywordResult {
    keyword_count: number;
    keywords: Array<{ word: string; frequency: number }>;
    total_words?: number;
    unique_words?: number;
}

interface HealthData {
    system_resources?: { cpu_usage?: string; memory_usage?: string; disk_usage?: string };
    api_status?: { version?: string };
    ai_models?: Record<string, unknown>;
}

function AdvancedAIFeatures({ onAnalysisComplete }: AdvancedAIFeaturesProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // 감정 분석 상태
    const [sentimentText, setSentimentText] = useState('');
    const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);

    // 텍스트 요약 상태
    const [summaryText, setSummaryText] = useState('');
    const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

    // 키워드 추출 상태
    const [keywordText, setKeywordText] = useState('');
    const [keywordResult, setKeywordResult] = useState<KeywordResult | null>(null);

    // 시스템 헬스 상태
    const [healthData, setHealthData] = useState<HealthData | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError('');
    };

    const analyzeSentiment = async () => {
        const trimmed = coerceTrimmedString(sentimentText, '');
        if (!trimmed) {
            setError('분석할 텍스트를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(ADVANCED_AI_API_BASE, API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: trimmed }),
            });

            if (!response.ok) {
                throw new Error('감정 분석 요청이 실패했습니다.');
            }

            const result = (await response.json()) as SentimentResult;
            setSentimentResult(result);
            onAnalysisComplete?.(result);
        } catch (err) {
            setError(`감정 분석 중 오류가 발생했습니다: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const summarizeText = async () => {
        const trimmed = coerceTrimmedString(summaryText, '');
        if (!trimmed) {
            setError('요약할 텍스트를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(ADVANCED_AI_API_BASE, API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: trimmed,
                    max_length: 100
                }),
            });

            if (!response.ok) {
                throw new Error('텍스트 요약 요청이 실패했습니다.');
            }

            const result = (await response.json()) as SummaryResult;
            setSummaryResult(result);
            onAnalysisComplete?.(result);
        } catch (err) {
            setError(`텍스트 요약 중 오류가 발생했습니다: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const extractKeywords = async () => {
        const trimmed = coerceTrimmedString(keywordText, '');
        if (!trimmed) {
            setError('키워드를 추출할 텍스트를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(ADVANCED_AI_API_BASE, API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: trimmed,
                    max_keywords: 10
                }),
            });

            if (!response.ok) {
                throw new Error('키워드 추출 요청이 실패했습니다.');
            }

            const result = (await response.json()) as KeywordResult;
            setKeywordResult(result);
            onAnalysisComplete?.(result);
        } catch (err) {
            setError(`키워드 추출 중 오류가 발생했습니다: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const checkSystemHealth = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(ADVANCED_AI_API_BASE, API_V8_ADVANCED_SYSTEM_HEALTH_PATH));

            if (!response.ok) {
                throw new Error('시스템 헬스 체크 요청이 실패했습니다.');
            }

            const result = (await response.json()) as HealthData;
            setHealthData(result);
        } catch (err) {
            setError(`시스템 헬스 체크 중 오류가 발생했습니다: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const renderSentimentAnalysisTab = () => (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology color="primary" />
                    고급 감정 분석
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="분석할 텍스트"
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={() => void analyzeSentiment()}
                    disabled={loading || !coerceTrimmedString(sentimentText, '')}
                    startIcon={<Psychology />}
                >
                    {loading ? '분석 중...' : '감정 분석 실행'}
                </Button>

                {sentimentResult && (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>감정 분석 결과</Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">주요 감정</Typography>
                                <Chip
                                    label={sentimentResult.dominant_emotion}
                                    color="primary"
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">신뢰도</Typography>
                                <Typography variant="h6" color="success.main">
                                    {(sentimentResult.confidence * 100).toFixed(1)}%
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mb: 1 }}>감정 점수</Typography>
                        <Grid container spacing={1}>
                            {Object.entries(sentimentResult.sentiment_scores).map(([emotion, score]) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={emotion}>
                                    <Typography variant="body2" color="text.secondary">
                                        {emotion === 'positive' ? '긍정' :
                                            emotion === 'negative' ? '부정' :
                                                emotion === 'neutral' ? '중립' :
                                                    emotion === 'joy' ? '기쁨' :
                                                        emotion === 'anger' ? '분노' :
                                                            emotion === 'fear' ? '두려움' :
                                                                emotion === 'sadness' ? '슬픔' :
                                                                    emotion === 'surprise' ? '놀람' : emotion}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(score as number) * 100}
                                        sx={{ mt: 0.5 }}
                                    />
                                    <Typography variant="caption">
                                        {((score as number) * 100).toFixed(1)}%
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}
            </Stack>
        </Box>
    );

    const renderTextSummarizationTab = () => (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Summarize color="secondary" />
                    텍스트 요약
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="요약할 텍스트"
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={() => void summarizeText()}
                    disabled={loading || !coerceTrimmedString(summaryText, '')}
                    startIcon={<Summarize />}
                >
                    {loading ? '요약 중...' : '텍스트 요약 실행'}
                </Button>

                {summaryResult && (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>요약 결과</Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">원본 길이</Typography>
                                <Typography variant="h6">{summaryResult.original_length}자</Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">요약 길이</Typography>
                                <Typography variant="h6">{summaryResult.summary_length}자</Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">압축률</Typography>
                                <Typography variant="h6" color="info.main">
                                    {(summaryResult.compression_ratio * 100).toFixed(1)}%
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mb: 1 }}>요약된 텍스트</Typography>
                        <Paper sx={{ p: 2, bgcolor: 'var(--bg-secondary)' }}>
                            <Typography variant="body1">{summaryResult.summary}</Typography>
                        </Paper>
                    </Paper>
                )}
            </Stack>
        </Box>
    );

    const renderKeywordExtractionTab = () => (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Search color="warning" />
                    키워드 추출
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="키워드를 추출할 텍스트"
                    value={keywordText}
                    onChange={(e) => setKeywordText(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={() => void extractKeywords()}
                    disabled={loading || !coerceTrimmedString(keywordText, '')}
                    startIcon={<Search />}
                >
                    {loading ? '추출 중...' : '키워드 추출 실행'}
                </Button>

                {keywordResult && (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>키워드 추출 결과</Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">총 단어 수</Typography>
                                <Typography variant="h6">{keywordResult.total_words != null ? `${keywordResult.total_words}개` : '—'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="body2" color="text.secondary">고유 단어</Typography>
                                <Typography variant="h6">{keywordResult.unique_words != null ? `${keywordResult.unique_words}개` : '—'}</Typography>
                            </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">추출된 키워드</Typography>
                            <Typography variant="h6">{keywordResult.keyword_count}개</Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>추출된 키워드</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {keywordResult.keywords.map((keyword, index) => (
                            <Chip
                                key={index}
                                label={`${keyword.word} (${keyword.frequency})`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>
                </Paper>
            )}
            </Stack>
        </Box>
    );

    const renderSystemHealthTab = () => (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="success" />
                    시스템 헬스 모니터링
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => void checkSystemHealth()}
                    disabled={loading}
                    startIcon={<TrendingUp />}
                >
                    {loading ? '체크 중...' : '시스템 헬스 체크'}
                </Button>

                {healthData && (
                    <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>시스템 상태</Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">CPU 사용률</Typography>
                            <Typography variant="h6" color="primary">
                                {healthData.system_resources?.cpu_usage || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">메모리 사용률</Typography>
                            <Typography variant="h6" color="secondary">
                                {healthData.system_resources?.memory_usage || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">디스크 사용률</Typography>
                            <Typography variant="h6" color="warning.main">
                                {healthData.system_resources?.disk_usage || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">API 버전</Typography>
                            <Typography variant="h6" color="success.main">
                                {healthData.api_status?.version || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>AI 모델 상태</Typography>
                    <List>
                        {Object.entries(healthData.ai_models || {}).map(([model, status]) => (
                            <ListItem key={model}>
                                <ListItemIcon>
                                    {model === 'sentiment_analysis' ? <Psychology /> :
                                        model === 'text_summarization' ? <Summarize /> :
                                            model === 'language_detection' ? <Translate /> :
                                                model === 'keyword_extraction' ? <Search /> : <TrendingUp />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={model.replace('_', ' ').toUpperCase()}
                                    secondary={String(status)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
                )}
            </Stack>
        </Box>
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="감정 분석" icon={<Psychology />} />
                    <Tab label="텍스트 요약" icon={<Summarize />} />
                    <Tab label="키워드 추출" icon={<Search />} />
                    <Tab label="시스템 헬스" icon={<TrendingUp />} />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {activeTab === 0 && renderSentimentAnalysisTab()}
            {activeTab === 1 && renderTextSummarizationTab()}
            {activeTab === 2 && renderKeywordExtractionTab()}
            {activeTab === 3 && renderSystemHealthTab()}
        </Paper>
    );
}

export default AdvancedAIFeatures;
