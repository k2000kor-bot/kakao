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
    LinearProgress
} from '@mui/material';
import {
    Instagram,
    Facebook,
    Twitter,
    LinkedIn,
    Email,
    Analytics,
    TrendingUp,
    Psychology,
    Speed
} from '@mui/icons-material';

interface MarketingContentProps {
    onContentGenerated?: (content: string, type: string) => void;
}

const MarketingContent: React.FC<MarketingContentProps> = ({ onContentGenerated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // 소셜미디어 상태
    const [socialPlatform, setSocialPlatform] = useState('instagram');
    const [socialContentType, setSocialContentType] = useState('post');
    const [socialCompany, setSocialCompany] = useState('대한건설');
    const [socialIndustry, setSocialIndustry] = useState('건설업');
    const [socialTone, setSocialTone] = useState('professional');

    // 이메일 상태
    const [emailType, setEmailType] = useState('promotional');
    const [emailCompany, setEmailCompany] = useState('대한건설');
    const [emailIndustry, setEmailIndustry] = useState('건설업');
    const [emailUrgency, setEmailUrgency] = useState('medium');

    // 분석 상태
    const [analysisText, setAnalysisText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const platforms = [
        { value: 'instagram', label: 'Instagram', icon: <Instagram />, color: 'secondary' },
        { value: 'facebook', label: 'Facebook', icon: <Facebook />, color: 'primary' },
        { value: 'twitter', label: 'Twitter', icon: <Twitter />, color: 'info' },
        { value: 'linkedin', label: 'LinkedIn', icon: <LinkedIn />, color: 'primary' }
    ];

    const socialContentTypes = [
        { value: 'post', label: '포스트' },
        { value: 'story', label: '스토리' },
        { value: 'reel', label: '릴스' }
    ];

    const emailTypes = [
        { value: 'promotional', label: '프로모션' },
        { value: 'newsletter', label: '뉴스레터' },
        { value: 'follow_up', label: '팔로업' },
        { value: 'welcome', label: '환영' }
    ];

    const tones = [
        { value: 'professional', label: '전문적', color: 'primary' },
        { value: 'casual', label: '캐주얼', color: 'secondary' },
        { value: 'friendly', label: '친근한', color: 'success' },
        { value: 'authoritative', label: '권위적', color: 'error' }
    ];

    const urgencyLevels = [
        { value: 'low', label: '낮음', color: 'success' },
        { value: 'medium', label: '보통', color: 'warning' },
        { value: 'high', label: '높음', color: 'error' }
    ];

    const generateSocialContent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/marketing/social', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform: socialPlatform,
                    content_type: socialContentType,
                    company_name: socialCompany,
                    industry: socialIndustry,
                    tone: socialTone
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('social');
                onContentGenerated?.(data.data.content, 'social');
            } else {
                setError(data.error || '소셜미디어 콘텐츠 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('소셜미디어 콘텐츠 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateEmailContent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/marketing/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_type: emailType,
                    company_name: emailCompany,
                    industry: emailIndustry,
                    urgency_level: emailUrgency
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('email');
                onContentGenerated?.(data.data.content, 'email');
            } else {
                setError(data.error || '이메일 마케팅 콘텐츠 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('이메일 마케팅 콘텐츠 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeMarketingContent = async () => {
        if (!analysisText.trim()) {
            setError('분석할 콘텐츠를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/marketing/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: analysisText,
                    content_type: 'social'
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

    const renderSocialTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Instagram color="secondary" />
                소셜미디어 콘텐츠 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>플랫폼</InputLabel>
                        <Select
                            value={socialPlatform}
                            onChange={(e) => setSocialPlatform(e.target.value)}
                            label="플랫폼"
                        >
                            {platforms.map((platform) => (
                                <MenuItem key={platform.value} value={platform.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {platform.icon}
                                        {platform.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>콘텐츠 유형</InputLabel>
                        <Select
                            value={socialContentType}
                            onChange={(e) => setSocialContentType(e.target.value)}
                            label="콘텐츠 유형"
                        >
                            {socialContentTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        fullWidth
                        label="회사명"
                        value={socialCompany}
                        onChange={(e) => setSocialCompany(e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        fullWidth
                        label="업종"
                        value={socialIndustry}
                        onChange={(e) => setSocialIndustry(e.target.value)}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>톤</InputLabel>
                        <Select
                            value={socialTone}
                            onChange={(e) => setSocialTone(e.target.value)}
                            label="톤"
                        >
                            {tones.map((tone) => (
                                <MenuItem key={tone.value} value={tone.value}>
                                    <Chip
                                        label={tone.label}
                                        color={tone.color as any}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    {tone.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="secondary"
                onClick={generateSocialContent}
                disabled={loading}
                startIcon={<Instagram />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '소셜미디어 콘텐츠 생성'}
            </Button>
        </Box>
    );

    const renderEmailTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                이메일 마케팅 콘텐츠 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>이메일 유형</InputLabel>
                        <Select
                            value={emailType}
                            onChange={(e) => setEmailType(e.target.value)}
                            label="이메일 유형"
                        >
                            {emailTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        fullWidth
                        label="회사명"
                        value={emailCompany}
                        onChange={(e) => setEmailCompany(e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        fullWidth
                        label="업종"
                        value={emailIndustry}
                        onChange={(e) => setEmailIndustry(e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>긴급도</InputLabel>
                        <Select
                            value={emailUrgency}
                            onChange={(e) => setEmailUrgency(e.target.value)}
                            label="긴급도"
                        >
                            {urgencyLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                    <Chip
                                        label={level.label}
                                        color={level.color as any}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    {level.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="primary"
                onClick={generateEmailContent}
                disabled={loading}
                startIcon={<Email />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '이메일 마케팅 콘텐츠 생성'}
            </Button>
        </Box>
    );

    const renderAnalysisTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="warning" />
                마케팅 콘텐츠 분석
            </Typography>

            <TextField
                fullWidth
                multiline
                rows={6}
                label="분석할 마케팅 콘텐츠를 입력하세요"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                color="warning"
                onClick={analyzeMarketingContent}
                disabled={loading || !analysisText.trim()}
                startIcon={<Analytics />}
                sx={{ mb: 2 }}
            >
                {loading ? '분석 중...' : '마케팅 콘텐츠 분석하기'}
            </Button>

            {analysisResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>마케팅 콘텐츠 분석 결과</Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">전체 마케팅 점수</Typography>
                            <Typography variant="h4" color="primary">
                                {analysisResult.total_marketing_score}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">해시태그 수</Typography>
                            <Typography variant="h6" color="secondary">
                                {analysisResult.hashtag_count}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">이모지 수</Typography>
                            <Typography variant="h6" color="success">
                                {analysisResult.emoji_count}
                            </Typography>
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

                    <Typography variant="h6" sx={{ mb: 2 }}>마케팅 요소 분석</Typography>
                    <Grid container spacing={2}>
                        {Object.entries(analysisResult.marketing_elements).map(([element, score]) => (
                            <Grid size={{ xs: 6, sm: 4 }} key={element}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {element === 'call_to_action' ? '행동 유도' :
                                            element === 'emotional_trigger' ? '감정 트리거' :
                                                element === 'social_proof' ? '사회적 증명' :
                                                    element === 'urgency' ? '긴급성' :
                                                        element === 'authority' ? '권위성' : element}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(score as number) * 20}
                                        sx={{ mt: 1, mb: 1 }}
                                    />
                                    <Typography variant="h6">{String(score)}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 1 }}>가독성 분석</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">단어 수</Typography>
                            <Typography variant="h6">{analysisResult.readability.word_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">문장 수</Typography>
                            <Typography variant="h6">{analysisResult.readability.sentence_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="body2" color="text.secondary">평균 단어/문장</Typography>
                            <Typography variant="h6">{analysisResult.readability.avg_words_per_sentence}</Typography>
                        </Grid>
                    </Grid>

                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>개선 제안</Typography>
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
                <Tab label="소셜미디어" icon={<Instagram />} />
                <Tab label="이메일" icon={<Email />} />
                <Tab label="분석" icon={<Analytics />} />
            </Tabs>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}

        {activeTab === 0 && renderSocialTab()}
        {activeTab === 1 && renderEmailTab()}
        {activeTab === 2 && renderAnalysisTab()}

        {generatedContent && (
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {contentType === 'social' ? <Instagram color="secondary" /> : <Email color="primary" />}
                        생성된 {contentType === 'social' ? '소셜미디어' : '이메일'} 콘텐츠
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

export default MarketingContent;
