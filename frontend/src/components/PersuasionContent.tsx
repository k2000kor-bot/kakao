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
import { Stack } from '@mui/material';
import {
    Business,
    Construction,
    Analytics
} from '@mui/icons-material';
import {
    INTEGRATED_API_PERSUASION_ANALYZE_PATH,
    INTEGRATED_API_PERSUASION_CONSTRUCTION_PATH,
    INTEGRATED_API_PERSUASION_CONTRACTOR_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { coerceTrimmedString } from '../utils/chatInputUtils';

/** API 설득력 분석 응답 타입 */
interface PersuasionAnalysisResult {
    total_persuasion_score?: number;
    gaslighting_score?: number;
    trust_score?: number;
    emotion_tone?: string;
    persuasion_techniques?: Record<string, number>;
    suggestions?: string[];
}

interface PersuasionContentProps {
    onContentGenerated?: (content: string, type: string) => void;
}

const PersuasionContent: React.FC<PersuasionContentProps> = ({ onContentGenerated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // 건설사 설득 상태
    const [constructionCompany, setConstructionCompany] = useState('대한건설');
    const [projectType, setProjectType] = useState('아파트건설');
    const [constructionPersuasionLevel, setConstructionPersuasionLevel] = useState('high');

    // 시공사 설득 상태
    const [contractorCompany, setContractorCompany] = useState('프리미엄시공');
    const [serviceType, setServiceType] = useState('인테리어');
    const [contractorPersuasionLevel, setContractorPersuasionLevel] = useState('high');

    // 분석 상태
    const [analysisText, setAnalysisText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<PersuasionAnalysisResult | null>(null);

    const projectTypes = [
        '아파트건설', '주택건설', '상업건물', '공장건설', '인프라', '리모델링'
    ];

    const serviceTypes = [
        '인테리어', '외장공사', '전기공사', '설비공사', '도장공사', '바닥공사'
    ];

    const persuasionLevels = [
        { value: 'low', label: '기본', color: 'success' },
        { value: 'medium', label: '중간', color: 'warning' },
        { value: 'high', label: '고급', color: 'error' }
    ] as const;

    const generateConstructionContent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), INTEGRATED_API_PERSUASION_CONSTRUCTION_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: constructionCompany,
                    project_type: projectType,
                    persuasion_level: constructionPersuasionLevel
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('construction');
                onContentGenerated?.(data.data.content, 'construction');
            } else {
                setError(data.error || '건설사 설득 콘텐츠 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('건설사 설득 콘텐츠 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateContractorContent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), INTEGRATED_API_PERSUASION_CONTRACTOR_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: contractorCompany,
                    service_type: serviceType,
                    persuasion_level: contractorPersuasionLevel
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedContent(data.data.content);
                setContentType('contractor');
                onContentGenerated?.(data.data.content, 'contractor');
            } else {
                setError(data.error || '시공사 긍정 콘텐츠 생성에 실패했습니다.');
            }
        } catch (err) {
            setError('시공사 긍정 콘텐츠 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const analyzePersuasionContent = async () => {
        const trimmed = coerceTrimmedString(analysisText, '');
        if (!trimmed) {
            setError('분석할 콘텐츠를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), INTEGRATED_API_PERSUASION_ANALYZE_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: trimmed
                })
            });

            const data = await response.json();

            if (data.success) {
                setAnalysisResult(data.data as PersuasionAnalysisResult);
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

    const renderConstructionTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Construction color="primary" />
                건설사 설득 콘텐츠 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                        fullWidth
                        label="회사명"
                        value={constructionCompany}
                        onChange={(e) => setConstructionCompany(e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>프로젝트 유형</InputLabel>
                        <Select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            label="프로젝트 유형"
                        >
                            {projectTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>설득 레벨</InputLabel>
                        <Select
                            value={constructionPersuasionLevel}
                            onChange={(e) => setConstructionPersuasionLevel(e.target.value)}
                            label="설득 레벨"
                        >
                            {persuasionLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                    <Chip
                                        label={level.label}
                                        color={level.color}
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
                onClick={() => void generateConstructionContent()}
                disabled={loading}
                startIcon={<Construction />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '건설사 설득 콘텐츠 생성'}
            </Button>
        </Box>
    );

    const renderContractorTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="secondary" />
                시공사 긍정 콘텐츠 생성
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                        fullWidth
                        label="회사명"
                        value={contractorCompany}
                        onChange={(e) => setContractorCompany(e.target.value)}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>서비스 유형</InputLabel>
                        <Select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            label="서비스 유형"
                        >
                            {serviceTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>설득 레벨</InputLabel>
                        <Select
                            value={contractorPersuasionLevel}
                            onChange={(e) => setContractorPersuasionLevel(e.target.value)}
                            label="설득 레벨"
                        >
                            {persuasionLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                    <Chip
                                        label={level.label}
                                        color={level.color}
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
                color="secondary"
                onClick={() => void generateContractorContent()}
                disabled={loading}
                startIcon={<Business />}
                sx={{ mb: 2 }}
            >
                {loading ? '생성 중...' : '시공사 긍정 콘텐츠 생성'}
            </Button>
        </Box>
    );

    const renderAnalysisTab = () => (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics color="warning" />
                    설득 콘텐츠 분석
                </Typography>

                <TextField
                fullWidth
                multiline
                rows={6}
                label="분석할 설득 콘텐츠를 입력하세요"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                color="warning"
                onClick={() => void analyzePersuasionContent()}
                disabled={loading || !coerceTrimmedString(analysisText, '')}
                startIcon={<Analytics />}
                sx={{ mb: 2 }}
            >
                {loading ? '분석 중...' : '설득력 분석하기'}
            </Button>

            {analysisResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>설득력 분석 결과</Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">전체 설득력 점수</Typography>
                            <Typography variant="h4" color="primary">
                                {analysisResult.total_persuasion_score ?? '—'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">가스라이팅 지수</Typography>
                            <Typography variant="h6" color="error">
                                {analysisResult.gaslighting_score ?? '—'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">신뢰도 지수</Typography>
                            <Typography variant="h6" color="success">
                                {analysisResult.trust_score ?? '—'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="body2" color="text.secondary">감정 톤</Typography>
                            <Chip
                                label={analysisResult.emotion_tone ?? '—'}
                                color={analysisResult.emotion_tone === '긍정적' ? 'success' : 'default'}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2 }}>설득 기법 분석</Typography>
                    <Grid container spacing={2}>
                        {Object.entries(analysisResult.persuasion_techniques ?? {}).map(([technique, score]) => (
                            <Grid size={{ xs: 6, sm: 4 }} key={technique}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {technique === 'social_proof' ? '사회적 증명' :
                                            technique === 'urgency' ? '긴급성' :
                                                technique === 'authority' ? '권위성' :
                                                    technique === 'scarcity' ? '희소성' :
                                                        technique === 'reciprocity' ? '호혜성' : technique}
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
            </Stack>
        </Box>
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="건설사 설득" icon={<Construction />} />
                    <Tab label="시공사 긍정" icon={<Business />} />
                    <Tab label="설득력 분석" icon={<Analytics />} />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {activeTab === 0 && renderConstructionTab()}
            {activeTab === 1 && renderContractorTab()}
            {activeTab === 2 && renderAnalysisTab()}

            {generatedContent && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {contentType === 'construction' ? <Construction color="primary" /> : <Business color="secondary" />}
                            생성된 {contentType === 'construction' ? '건설사 설득' : '시공사 긍정'} 콘텐츠
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                backgroundColor: 'var(--bg-secondary)',
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

export default PersuasionContent;
