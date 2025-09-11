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
    Grid
} from '@mui/material';
import {
    Create,
    AutoStories,
    Psychology,
    Edit,
    Analytics,
    Refresh
} from '@mui/icons-material';

interface CreativeWritingProps {
    onContentGenerated?: (content: string, type: string) => void;
}

const CreativeWriting: React.FC<CreativeWritingProps> = ({ onContentGenerated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

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

    const renderStoryTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoStories color="primary" />
                창작 스토리 생성
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2} sx={{ mb: 3 }}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>

                <Box>
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
                </Box>
            </Box>

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

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2} sx={{ mb: 3 }}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>
            </Box>

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

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2} sx={{ mb: 3 }}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>
            </Box>

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

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">단어 수</Typography>
                            <Typography variant="h6">{analysisResult.word_count}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">문장 수</Typography>
                            <Typography variant="h6">{analysisResult.sentence_count}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">읽기 수준</Typography>
                            <Chip label={analysisResult.reading_level} color="primary" />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">감정 톤</Typography>
                            <Chip
                                label={analysisResult.emotion_tone}
                                color={analysisResult.emotion_tone === '긍정적' ? 'success' : 'default'}
                            />
                        </Box>
                    </Box>

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
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            생성된 {contentType === 'story' ? '스토리' : contentType === 'poem' ? '시' : '에세이'}
                        </Typography>
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
