import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Paper,
    Chip,
    Alert,
    Divider,
    Grid,
    Menu
} from '@mui/material';
import {
    Create,
    AutoStories,
    Psychology,
    Edit,
    Analytics,
    Refresh,
    ContentCopy,
    Save,
    Download,
    Print
} from '@mui/icons-material';
import { writingExporter } from '../utils/writingExport';

interface CreativeWritingProps {
    onContentGenerated?: (content: string, type: string) => void;
}

const CreativeWriting: React.FC<CreativeWritingProps> = ({ onContentGenerated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

    // 스토리 생성 상태
    const [storyGenre, setStoryGenre] = useState('romance');
    const [storyTheme, setStoryTheme] = useState('');
    const [storyLength, setStoryLength] = useState('short');

    // 시 생성 상태
    const [poemType, setPoemType] = useState('lyric');
    const [poemTheme, setPoemTheme] = useState('');

    // 에세이 생성 상태
    const [essayType, setEssayType] = useState('personal');
    const [essayTopic, setEssayTopic] = useState('');

    // 분석 상태
    const [analysisText, setAnalysisText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const genres = [
        { value: 'romance', label: '로맨스' },
        { value: 'fantasy', label: '판타지' },
        { value: 'mystery', label: '미스터리' },
        { value: 'sci_fi', label: 'SF' }
    ];

    const themes = ['사랑', '우정', '가족', '성장', '꿈', '희망', '도전', '자유', '시간', '자연'];

    const generateStory = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/creative/story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    genre: storyGenre,
                    theme: storyTheme || undefined,
                    length: storyLength
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('story');
                onContentGenerated?.(data.data.content, 'story');
            } else {
                setError(data.error || '스토리 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('스토리 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generatePoem = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/creative/poem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: poemType,
                    theme: poemTheme || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('poem');
                onContentGenerated?.(data.data.content, 'poem');
            } else {
                setError(data.error || '시 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('시 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateEssay = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/creative/essay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: essayType,
                    topic: essayTopic || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('essay');
                onContentGenerated?.(data.data.content, 'essay');
            } else {
                setError(data.error || '에세이 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('에세이 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeWriting = async () => {
        if (!analysisText.trim()) {
            setError('분석할 텍스트를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/creative/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: analysisText
                })
            });

            const data = await response.json();

            if (data.success) {
                setAnalysisResult(data.data);
            } else {
                setError(data.error || '분석에 실패했습니다.');
            }
        } catch (err) {
            setError('분석 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError('');
        setGeneratedContent('');
        setAnalysisResult(null);
    };

    const getContentTypeLabel = (type: string): string => {
        if (type === 'story') return '스토리';
        if (type === 'poem') return '시';
        if (type === 'essay') return '에세이';
        return '콘텐츠';
    };

    const getContentTypeTitle = (type: string): string => {
        if (type === 'story') return '창작 스토리';
        if (type === 'poem') return '창작 시';
        if (type === 'essay') return '창작 에세이';
        return '창작 콘텐츠';
    };

    const handleCopy = async () => {
        if (generatedContent) {
            const success = await writingExporter.copyToClipboard(generatedContent);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                setError('복사에 실패했습니다.');
            }
        }
    };

    const handleSave = () => {
        if (generatedContent) {
            try {
                const savedWritings = JSON.parse(localStorage.getItem('creativeWritings') || '[]');
                const newWriting = {
                    id: Date.now(),
                    content: generatedContent,
                    type: contentType,
                    createdAt: new Date().toISOString(),
                    genre: storyGenre,
                    theme: storyTheme || poemTheme || essayTopic,
                };
                savedWritings.unshift(newWriting);
                // 최대 50개만 저장
                if (savedWritings.length > 50) {
                    savedWritings.pop();
                }
                localStorage.setItem('creativeWritings', JSON.stringify(savedWritings));
                setError('');
                // 성공 알림은 Alert로 표시
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
                setError(`저장에 실패했습니다: ${errorMessage}`);
            }
        }
    };

    const handleExport = (format: 'txt' | 'html' | 'markdown') => {
        if (generatedContent) {
            const metadata = {
                title: getContentTypeTitle(contentType),
                date: new Date().toLocaleDateString('ko-KR'),
                template: contentType,
            };
            writingExporter.export(generatedContent, { format, includeMetadata: true }, metadata);
        }
    };

    const handlePrint = () => {
        if (generatedContent) {
            const metadata = {
                title: getContentTypeTitle(contentType),
                date: new Date().toLocaleDateString('ko-KR'),
            };
            writingExporter.print(generatedContent, metadata);
        }
    };

    const renderStoryTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoStories color="primary" />
                창작 스토리 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>장르</InputLabel>
                        <Select
                            value={storyGenre}
                            onChange={(e) => setStoryGenre(e.target.value)}
                            label="장르"
                        >
                            {genres.map((genre) => (
                                <MenuItem key={genre.value} value={genre.value}>
                                    {genre.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>테마</InputLabel>
                        <Select
                            value={storyTheme}
                            onChange={(e) => setStoryTheme(e.target.value)}
                            label="테마"
                        >
                            <MenuItem value="">랜덤 선택</MenuItem>
                            {themes.map((theme) => (
                                <MenuItem key={theme} value={theme}>
                                    {theme}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>길이</InputLabel>
                        <Select
                            value={storyLength}
                            onChange={(e) => setStoryLength(e.target.value)}
                            label="길이"
                        >
                            <MenuItem value="short">짧은 이야기</MenuItem>
                            <MenuItem value="medium">중간 이야기</MenuItem>
                            <MenuItem value="long">긴 이야기</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                onClick={generateStory}
                disabled={loading}
                startIcon={loading ? <Refresh /> : <Create />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '스토리 생성'}
            </Button>
        </Box>
    );

    const renderPoemTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="secondary" />
                창작 시 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>시 형태</InputLabel>
                        <Select
                            value={poemType}
                            onChange={(e) => setPoemType(e.target.value)}
                            label="시 형태"
                        >
                            <MenuItem value="lyric">서정시</MenuItem>
                            <MenuItem value="free_verse">자유시</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>테마</InputLabel>
                        <Select
                            value={poemTheme}
                            onChange={(e) => setPoemTheme(e.target.value)}
                            label="테마"
                        >
                            <MenuItem value="">랜덤 선택</MenuItem>
                            {themes.map((theme) => (
                                <MenuItem key={theme} value={theme}>
                                    {theme}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="secondary"
                onClick={generatePoem}
                disabled={loading}
                startIcon={loading ? <Refresh /> : <Create />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '시 생성'}
            </Button>
        </Box>
    );

    const renderEssayTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="success" />
                창작 에세이 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>에세이 형태</InputLabel>
                        <Select
                            value={essayType}
                            onChange={(e) => setEssayType(e.target.value)}
                            label="에세이 형태"
                        >
                            <MenuItem value="personal">개인 에세이</MenuItem>
                            <MenuItem value="philosophical">철학적 에세이</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>주제</InputLabel>
                        <Select
                            value={essayTopic}
                            onChange={(e) => setEssayTopic(e.target.value)}
                            label="주제"
                        >
                            <MenuItem value="">랜덤 선택</MenuItem>
                            {themes.map((theme) => (
                                <MenuItem key={theme} value={theme}>
                                    {theme}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="success"
                onClick={generateEssay}
                disabled={loading}
                startIcon={loading ? <Refresh /> : <Create />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '에세이 생성'}
            </Button>
        </Box>
    );

    const renderAnalysisTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="warning" />
                글쓰기 분석
            </Typography>

            <TextField
                fullWidth
                multiline
                rows={6}
                label="분석할 텍스트를 입력하세요"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                color="warning"
                onClick={analyzeWriting}
                disabled={loading || !analysisText.trim()}
                startIcon={loading ? <Refresh /> : <Analytics />}
                sx={{ mb: 2 }}
            >
                {loading ? '분석 중...' : '분석하기'}
            </Button>

            {analysisResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>분석 결과</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">단어 수</Typography>
                            <Typography variant="h6">{analysisResult.word_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">문장 수</Typography>
                            <Typography variant="h6">{analysisResult.sentence_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">읽기 수준</Typography>
                            <Chip label={analysisResult.reading_level} color="primary" />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">감정 톤</Typography>
                            <Chip
                                label={analysisResult.emotion_tone}
                                color={analysisResult.emotion_tone === '긍정적' ? 'success' : 'default'}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>글쓰기 스타일</Typography>
                    <Chip label={analysisResult.writing_style} color="secondary" sx={{ mb: 2 }} />

                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>개선 제안</Typography>
                            {analysisResult.suggestions.map((suggestion: string, index: number) => (
                                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                                    {suggestion}
                                </Alert>
                            ))}
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="스토리" icon={<AutoStories />} />
                    <Tab label="시" icon={<Psychology />} />
                    <Tab label="에세이" icon={<Edit />} />
                    <Tab label="분석" icon={<Analytics />} />
                </Tabs>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {activeTab === 0 && renderStoryTab()}
            {activeTab === 1 && renderPoemTab()}
            {activeTab === 2 && renderEssayTab()}
            {activeTab === 3 && renderAnalysisTab()}

            {generatedContent && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                생성된 {getContentTypeLabel(contentType)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant={copied ? 'contained' : 'outlined'}
                                    color={copied ? 'success' : 'primary'}
                                    startIcon={<ContentCopy />}
                                    onClick={handleCopy}
                                >
                                    {copied ? '복사됨' : '복사'}
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Save />}
                                    onClick={handleSave}
                                >
                                    저장
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                                >
                                    내보내기
                                </Button>
                                <Menu
                                    anchorEl={exportMenuAnchor}
                                    open={Boolean(exportMenuAnchor)}
                                    onClose={() => setExportMenuAnchor(null)}
                                >
                                    <MenuItem onClick={() => { handleExport('txt'); setExportMenuAnchor(null); }}>
                                        텍스트 파일 (.txt)
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleExport('html'); setExportMenuAnchor(null); }}>
                                        HTML 파일 (.html)
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleExport('markdown'); setExportMenuAnchor(null); }}>
                                        Markdown 파일 (.md)
                                    </MenuItem>
                                </Menu>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Print />}
                                    onClick={handlePrint}
                                >
                                    인쇄
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            component="pre"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                backgroundColor: 'grey.50',
                                p: 2,
                                borderRadius: 1,
                                maxHeight: 400,
                                overflow: 'auto'
                            }}
                        >
                            {generatedContent}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Paper>
    );
};

export default CreativeWriting;
