// 아파트 커뮤니티 분석 대시보드
// 입주민 성향 분석, 댓글 분석, 맞춤형 대응글 생성 기능 제공

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import {
    People,
    Comment,
    ThumbUp,
    SentimentSatisfied,
    SentimentNeutral,
    SentimentDissatisfied,
    Refresh,
    Search,
    AutoAwesome,
    Analytics,
    Message,
    Category,
} from '@mui/icons-material';
import apartmentCommunityAnalysisService, {
    ResidentProfile,
    CommunityComment,
    CommunityAnalytics,
    CommunityResponse,
    CommentAnalysis,
} from '../../services/apartmentCommunityAnalysisService';
import { errorLogger } from '../../utils/errorLogger';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`community-tabpanel-${index}`}
            aria-labelledby={`community-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const ApartmentCommunityAnalysisDashboard: React.FC<{ apartmentId?: string }> = ({ apartmentId }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [residents, setResidents] = useState<ResidentProfile[]>([]);
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
    const [selectedComment, setSelectedComment] = useState<CommunityComment | null>(null);
    const [commentAnalysis, setCommentAnalysis] = useState<CommentAnalysis | null>(null);
    const [generatedResponse, setGeneratedResponse] = useState<CommunityResponse | null>(null);
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSentiment, setFilterSentiment] = useState<string>('all');

    // 데이터 로드
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [residentsData, commentsData, analyticsData] = await Promise.all([
                apartmentCommunityAnalysisService.getResidents(apartmentId),
                apartmentCommunityAnalysisService.getComments(apartmentId),
                apartmentCommunityAnalysisService.getAnalytics(apartmentId),
            ]);

            setResidents(residentsData);
            setComments(commentsData);
            setAnalytics(analyticsData);
        } catch (error) {
            errorLogger.error('커뮤니티 데이터 로드 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisDashboard',
                action: 'loadData',
            });
        } finally {
            setIsLoading(false);
        }
    }, [apartmentId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 필터링된 댓글
    const filteredComments = useMemo(() => {
        let filtered = [...comments];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.content.toLowerCase().includes(searchLower) ||
                    c.resident_nickname.toLowerCase().includes(searchLower) ||
                    c.topic?.toLowerCase().includes(searchLower)
            );
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter((c) => c.category === filterCategory);
        }

        if (filterSentiment !== 'all') {
            filtered = filtered.filter((c) => c.sentiment === filterSentiment);
        }

        return filtered;
    }, [comments, searchTerm, filterCategory, filterSentiment]);

    // 댓글 분석 및 대응글 생성
    const handleAnalyzeAndGenerate = useCallback(async (comment: CommunityComment) => {
        setSelectedComment(comment);
        setIsGenerating(true);
        setIsResponseDialogOpen(true);

        try {
            const [analysis, response] = await Promise.all([
                apartmentCommunityAnalysisService.analyzeComment(comment.id),
                apartmentCommunityAnalysisService.generateResponse(comment.id),
            ]);

            setCommentAnalysis(analysis);
            setGeneratedResponse(response);
        } catch (error) {
            errorLogger.error('댓글 분석 및 대응글 생성 실패', error as Error, {
                component: 'ApartmentCommunityAnalysisDashboard',
                action: 'handleAnalyzeAndGenerate',
            });
        } finally {
            setIsGenerating(false);
        }
    }, []);

    // 감정 색상
    const getSentimentColor = useCallback((sentiment: string): 'success' | 'error' | 'default' => {
        switch (sentiment) {
            case 'positive':
                return 'success';
            case 'negative':
                return 'error';
            default:
                return 'default';
        }
    }, []);

    // 카테고리 한글명
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            complaint: '불만',
            suggestion: '제안',
            question: '질문',
            praise: '칭찬',
            general: '일반',
        };
        return labels[category] || category;
    };

    if (isLoading && !analytics) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* 헤더 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1">
                    아파트 커뮤니티 분석
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadData}
                    disabled={isLoading}
                >
                    새로고침
                </Button>
            </Box>

            {/* 통계 카드 */}
            {analytics && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    총 입주민
                                </Typography>
                                <Typography variant="h4">{analytics.total_residents}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    활성: {analytics.active_residents}명
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    총 댓글
                                </Typography>
                                <Typography variant="h4">{analytics.total_comments}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    긍정적 감정
                                </Typography>
                                <Typography variant="h4" color="success.main">
                                    {analytics.sentiment_distribution.positive}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    부정적 감정
                                </Typography>
                                <Typography variant="h4" color="error.main">
                                    {analytics.sentiment_distribution.negative}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 탭 메뉴 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    aria-label="커뮤니티 분석 탭"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<People />} label="입주민" id="community-tab-0" aria-controls="community-tabpanel-0" />
                    <Tab icon={<Comment />} label="댓글" id="community-tab-1" aria-controls="community-tabpanel-1" />
                    <Tab icon={<Analytics />} label="분석" id="community-tab-2" aria-controls="community-tabpanel-2" />
                </Tabs>
            </Paper>

            {/* 입주민 탭 */}
            <TabPanel value={selectedTab} index={0}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>닉네임</TableCell>
                                <TableCell>감정</TableCell>
                                <TableCell>활동 수준</TableCell>
                                <TableCell>댓글 수</TableCell>
                                <TableCell>영향력 점수</TableCell>
                                <TableCell>관심사</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {residents.map((resident) => (
                                <TableRow key={resident.id}>
                                    <TableCell>{resident.nickname}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                resident.sentiment === 'positive'
                                                    ? '긍정'
                                                    : resident.sentiment === 'negative'
                                                        ? '부정'
                                                        : '중립'
                                            }
                                            color={getSentimentColor(resident.sentiment)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                resident.activity_level === 'high'
                                                    ? '높음'
                                                    : resident.activity_level === 'medium'
                                                        ? '보통'
                                                        : '낮음'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{resident.comment_count}</TableCell>
                                    <TableCell>{resident.influence_score.toFixed(1)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {resident.interests.slice(0, 3).map((interest) => (
                                                <Chip key={`interest-${interest}`} label={interest} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* 댓글 탭 */}
            <TabPanel value={selectedTab} index={1}>
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1, minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>카테고리</InputLabel>
                        <Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            label="카테고리"
                        >
                            <MenuItem value="all">전체</MenuItem>
                            <MenuItem value="complaint">불만</MenuItem>
                            <MenuItem value="suggestion">제안</MenuItem>
                            <MenuItem value="question">질문</MenuItem>
                            <MenuItem value="praise">칭찬</MenuItem>
                            <MenuItem value="general">일반</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>감정</InputLabel>
                        <Select
                            value={filterSentiment}
                            onChange={(e) => setFilterSentiment(e.target.value)}
                            label="감정"
                        >
                            <MenuItem value="all">전체</MenuItem>
                            <MenuItem value="positive">긍정</MenuItem>
                            <MenuItem value="neutral">중립</MenuItem>
                            <MenuItem value="negative">부정</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredComments.length === 0 ? (
                        <Alert severity="info">댓글이 없습니다.</Alert>
                    ) : (
                        filteredComments.map((comment) => (
                            <Card key={comment.id}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {comment.resident_nickname}
                                            </Typography>
                                            <Chip
                                                label={getCategoryLabel(comment.category)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={
                                                    comment.sentiment === 'positive'
                                                        ? '긍정'
                                                        : comment.sentiment === 'negative'
                                                            ? '부정'
                                                            : '중립'
                                                }
                                                size="small"
                                                color={getSentimentColor(comment.sentiment)}
                                            />
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<AutoAwesome />}
                                            onClick={() => handleAnalyzeAndGenerate(comment)}
                                        >
                                            AI 분석 및 대응글 생성
                                        </Button>
                                    </Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {comment.content}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Chip
                                            icon={<ThumbUp />}
                                            label={comment.likes}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<Message />}
                                            label={`답글 ${comment.replies}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        {comment.topic && (
                                            <Chip
                                                icon={<Category />}
                                                label={comment.topic}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(comment.timestamp).toLocaleString('ko-KR')}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </TabPanel>

            {/* 분석 탭 */}
            <TabPanel value={selectedTab} index={2}>
                {analytics ? (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        감정 분포
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SentimentSatisfied color="success" />
                                                <Typography>긍정</Typography>
                                            </Box>
                                            <Typography variant="h6">{analytics.sentiment_distribution.positive}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SentimentNeutral color="action" />
                                                <Typography>중립</Typography>
                                            </Box>
                                            <Typography variant="h6">{analytics.sentiment_distribution.neutral}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SentimentDissatisfied color="error" />
                                                <Typography>부정</Typography>
                                            </Box>
                                            <Typography variant="h6">{analytics.sentiment_distribution.negative}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        인플루언서
                                    </Typography>
                                    <List>
                                        {analytics.influence_leaders.map((leader) => (
                                            <ListItem key={leader.resident_id}>
                                                <ListItemText
                                                    primary={leader.nickname}
                                                    secondary={`영향력 점수: ${leader.influence_score.toFixed(1)}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        주요 토픽
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {analytics.top_topics.map((topic) => (
                                            <Chip
                                                key={`topic-${topic.topic}`}
                                                label={`${topic.topic} (${topic.count})`}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Alert severity="info">분석 데이터가 없습니다.</Alert>
                )}
            </TabPanel>

            {/* 대응글 생성 다이얼로그 */}
            <Dialog
                open={isResponseDialogOpen}
                onClose={() => setIsResponseDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    AI 분석 및 대응글 생성
                    {selectedComment && ` - ${selectedComment.resident_nickname}`}
                </DialogTitle>
                <DialogContent>
                    {isGenerating ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {commentAnalysis && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            분석 결과
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={`우선순위: ${commentAnalysis.priority === 'high'
                                                        ? '높음'
                                                        : commentAnalysis.priority === 'medium'
                                                            ? '중간'
                                                            : '낮음'
                                                    }`}
                                                color={
                                                    commentAnalysis.priority === 'high'
                                                        ? 'error'
                                                        : commentAnalysis.priority === 'medium'
                                                            ? 'warning'
                                                            : 'default'
                                                }
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={`권장 톤: ${commentAnalysis.suggested_response_tone === 'formal'
                                                        ? '공식적'
                                                        : commentAnalysis.suggested_response_tone === 'friendly'
                                                            ? '친근함'
                                                            : commentAnalysis.suggested_response_tone === 'empathetic'
                                                                ? '공감적'
                                                                : '전문적'
                                                    }`}
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            주요 포인트:
                                        </Typography>
                                        <List dense>
                                            {commentAnalysis.key_points.map((point) => (
                                                <ListItem key={`point-${point}`}>
                                                    <ListItemText primary={`• ${point}`} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}
                            {generatedResponse && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            생성된 대응글
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 1 }}>
                                            {generatedResponse.content}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                label={
                                                    generatedResponse.tone === 'formal'
                                                        ? '공식적'
                                                        : generatedResponse.tone === 'friendly'
                                                            ? '친근함'
                                                            : generatedResponse.tone === 'empathetic'
                                                                ? '공감적'
                                                                : '전문적'
                                                }
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label="AI 생성"
                                                size="small"
                                                color="primary"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={() => setIsResponseDialogOpen(false)} aria-label="대응글 다이얼로그 닫기">닫기</Button>
                    {generatedResponse && (
                        <Button type="button" variant="contained" onClick={() => {
                            // 대응글 복사 또는 저장 로직
                            navigator.clipboard.writeText(generatedResponse.content);
                        }} aria-label="생성된 대응글 복사">
                            복사
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApartmentCommunityAnalysisDashboard;
