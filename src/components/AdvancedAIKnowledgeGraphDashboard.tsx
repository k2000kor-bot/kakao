import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    Tooltip,
    Badge,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Slider,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    AccountTree,
    Search,
    Timeline,
    Analytics,
    Refresh,
    Fullscreen,
    FullscreenExit,
    Settings,
    PlayArrow,
    Pause,
    CheckCircle,
    Warning,
    Error,
    Info,
    ExpandMore,
    NetworkCheck,
    Hub,
    Schema,
    Psychology,
    Speed,
    DataUsage,
    PieChart,
    BarChart,
    ScatterPlot,
    BubbleChart,
    ShowChart,
    TrendingUp,
    TrendingDown,
    Equalizer,
    Memory,
    Storage,
    Cloud,
    Code,
    Science,
    School,
    Business,
    Technology,
    Add,
    Edit,
    Delete,
    Visibility,
    VisibilityOff,
    FilterList,
    Sort,
    Download,
    Upload,
    Share,
    Link,
    Unlink,
    Node,
    Edge,
    Graph,
    Query,
    Pattern,
    Inference,
    Cluster,
    Path,
    Similarity
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, BubbleChart as RechartsBubbleChart, Bubble } from 'recharts';

// Mock data for demonstration
const mockMetrics = {
    totalNodes: 156,
    totalEdges: 234,
    averageNodeConfidence: 0.847,
    averageEdgeConfidence: 0.891,
    graphDensity: 0.023,
    averagePathLength: 3.2,
    clusteringCoefficient: 0.756,
    knowledgeCoverage: 0.834,
    relationshipComplexity: 0.789,
    graphConnectivity: 0.856
};

const mockKnowledgeGraphs = [
    {
        id: 'tech-knowledge-graph',
        name: '기술 지식 그래프',
        description: '기술 도메인 지식 네트워크',
        domain: 'technology',
        metrics: {
            totalNodes: 89,
            totalEdges: 134,
            averageNodeConfidence: 0.89,
            averageEdgeConfidence: 0.92,
            graphDensity: 0.034,
            averagePathLength: 2.8,
            clusteringCoefficient: 0.82,
            knowledgeCoverage: 0.91,
            relationshipComplexity: 0.85,
            graphConnectivity: 0.92
        },
        created_at: new Date(Date.now() - 86400000), // 1일 전
        updated_at: new Date(Date.now() - 3600000) // 1시간 전
    },
    {
        id: 'business-knowledge-graph',
        name: '비즈니스 지식 그래프',
        description: '비즈니스 도메인 지식 네트워크',
        domain: 'business',
        metrics: {
            totalNodes: 67,
            totalEdges: 100,
            averageNodeConfidence: 0.81,
            averageEdgeConfidence: 0.87,
            graphDensity: 0.045,
            averagePathLength: 3.5,
            clusteringCoefficient: 0.71,
            knowledgeCoverage: 0.78,
            relationshipComplexity: 0.73,
            graphConnectivity: 0.79
        },
        created_at: new Date(Date.now() - 172800000), // 2일 전
        updated_at: new Date(Date.now() - 7200000) // 2시간 전
    }
];

const mockQueries = [
    {
        id: 'query-001',
        query_type: 'node_search',
        query_text: '인공지능',
        parameters: { domain: 'technology' },
        results: [
            {
                id: 'result-001',
                query_id: 'query-001',
                result_type: 'node',
                content: { label: '인공지능', type: 'concept', confidence: 0.95 },
                relevance_score: 0.95,
                confidence: 0.95,
                explanation: '노드 "인공지능"이(가) 검색어와 95.0% 관련성이 있습니다.'
            }
        ],
        execution_time: 45,
        confidence: 0.85,
        timestamp: new Date(Date.now() - 1800000) // 30분 전
    },
    {
        id: 'query-002',
        query_type: 'path_finding',
        query_text: 'AI에서 딥러닝까지의 경로',
        parameters: { source_node: 'ai', target_node: 'deep-learning', max_path_length: 5 },
        results: [
            {
                id: 'path-001',
                query_id: 'query-002',
                result_type: 'path',
                content: ['ai', 'machine-learning', 'deep-learning'],
                relevance_score: 0.8,
                confidence: 0.92,
                explanation: '소스 노드에서 타겟 노드까지의 경로를 찾았습니다. (길이: 3)'
            }
        ],
        execution_time: 120,
        confidence: 0.78,
        timestamp: new Date(Date.now() - 3600000) // 1시간 전
    }
];

const mockPatterns = [
    {
        id: 'pattern-001',
        pattern_type: 'structural',
        nodes: ['ai', 'machine-learning', 'deep-learning', 'neural-networks'],
        edges: ['ai-ml', 'ml-dl', 'dl-nn'],
        frequency: 1,
        significance: 0.85,
        description: '4개 노드로 구성된 연결된 구조',
        examples: ['ai', 'machine-learning', 'deep-learning'],
        created_at: new Date(Date.now() - 7200000) // 2시간 전
    },
    {
        id: 'pattern-002',
        pattern_type: 'semantic',
        nodes: ['ai', 'ml', 'dl', 'nlp', 'computer-vision'],
        edges: ['ai-ml', 'ml-dl', 'ai-nlp', 'ai-cv'],
        frequency: 5,
        significance: 0.92,
        description: '태그 "AI"를 공유하는 노드 그룹',
        examples: ['ai', 'ml', 'dl'],
        created_at: new Date(Date.now() - 10800000) // 3시간 전
    }
];

const mockInferences = [
    {
        id: 'inference-001',
        source_nodes: ['ai', 'machine-learning', 'deep-learning'],
        target_node: 'inferred-001',
        inference_type: 'deductive',
        reasoning_chain: [
            '인공지능은 머신러닝을 포함합니다.',
            '머신러닝은 딥러닝을 포함합니다.',
            '따라서 인공지능은 딥러닝을 포함합니다.'
        ],
        confidence: 0.92,
        evidence: ['ai-ml', 'ml-dl'],
        created_at: new Date(Date.now() - 5400000) // 1.5시간 전
    }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff69b4', '#4169e1', '#32cd32', '#ff4500', '#9370db'];

const AdvancedAIKnowledgeGraphDashboard: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [graphDialogOpen, setGraphDialogOpen] = useState(false);
    const [metrics, setMetrics] = useState(mockMetrics);
    const [knowledgeGraphs, setKnowledgeGraphs] = useState(mockKnowledgeGraphs);
    const [queries, setQueries] = useState(mockQueries);
    const [patterns, setPatterns] = useState(mockPatterns);
    const [inferences, setInferences] = useState(mockInferences);
    const [queryDialogOpen, setQueryDialogOpen] = useState(false);
    const [newQuery, setNewQuery] = useState({
        query_type: 'node_search',
        query_text: '',
        parameters: {}
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // 실시간 데이터 업데이트
            setMetrics(prev => ({
                ...prev,
                totalNodes: prev.totalNodes + (Math.random() > 0.9 ? 1 : 0),
                totalEdges: prev.totalEdges + (Math.random() > 0.9 ? 1 : 0),
                averageNodeConfidence: Math.min(1, Math.max(0, prev.averageNodeConfidence + (Math.random() - 0.5) * 0.02)),
                graphConnectivity: Math.min(1, Math.max(0, prev.graphConnectivity + (Math.random() - 0.5) * 0.01))
            }));
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleGraphClick = (graph: any) => {
        setSelectedGraph(graph);
        setGraphDialogOpen(true);
    };

    const handleExecuteQuery = () => {
        // 쿼리 실행 로직
        const query = {
            id: `query-${Date.now()}`,
            ...newQuery,
            results: [],
            execution_time: Math.floor(Math.random() * 200) + 50,
            confidence: 0.8 + Math.random() * 0.2,
            timestamp: new Date()
        };

        setQueries(prev => [query, ...prev]);
        setQueryDialogOpen(false);
        setNewQuery({ query_type: 'node_search', query_text: '', parameters: {} });
    };

    const getQueryTypeColor = (queryType: string) => {
        switch (queryType) {
            case 'node_search': return 'primary';
            case 'path_finding': return 'success';
            case 'pattern_matching': return 'warning';
            case 'inference': return 'info';
            case 'similarity': return 'secondary';
            case 'clustering': return 'error';
            default: return 'default';
        }
    };

    const getQueryTypeIcon = (queryType: string) => {
        switch (queryType) {
            case 'node_search': return <Search />;
            case 'path_finding': return <Path />;
            case 'pattern_matching': return <Pattern />;
            case 'inference': return <Psychology />;
            case 'similarity': return <Similarity />;
            case 'clustering': return <Cluster />;
            default: return <Query />;
        }
    };

    const getPatternTypeColor = (patternType: string) => {
        switch (patternType) {
            case 'structural': return 'primary';
            case 'temporal': return 'success';
            case 'semantic': return 'warning';
            case 'behavioral': return 'info';
            case 'causal': return 'error';
            default: return 'default';
        }
    };

    const getInferenceTypeColor = (inferenceType: string) => {
        switch (inferenceType) {
            case 'deductive': return 'primary';
            case 'inductive': return 'success';
            case 'abductive': return 'warning';
            case 'analogical': return 'info';
            case 'causal': return 'error';
            default: return 'default';
        }
    };

    const renderOverviewTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 시스템 상태 카드 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                지식 그래프 시스템 상태
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Chip
                                    label="정상 운영"
                                    color="success"
                                    icon={<CheckCircle />}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    마지막 업데이트: {new Date().toLocaleTimeString()}
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">총 노드</Typography>
                                    <Typography variant="h4">{metrics.totalNodes}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">총 엣지</Typography>
                                    <Typography variant="h4">{metrics.totalEdges}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">평균 노드 신뢰도</Typography>
                                    <Typography variant="h4">{(metrics.averageNodeConfidence * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">그래프 연결성</Typography>
                                    <Typography variant="h4">{(metrics.graphConnectivity * 100).toFixed(1)}%</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 그래프 메트릭 차트 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                그래프 메트릭 현황
                            </Typography>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={[
                                    {
                                        metric: '그래프 밀도',
                                        current: metrics.graphDensity * 100,
                                        target: 5
                                    },
                                    {
                                        metric: '평균 경로 길이',
                                        current: metrics.averagePathLength * 10,
                                        target: 30
                                    },
                                    {
                                        metric: '클러스터링 계수',
                                        current: metrics.clusteringCoefficient * 100,
                                        target: 80
                                    },
                                    {
                                        metric: '지식 커버리지',
                                        current: metrics.knowledgeCoverage * 100,
                                        target: 90
                                    },
                                    {
                                        metric: '관계 복잡성',
                                        current: metrics.relationshipComplexity * 100,
                                        target: 85
                                    },
                                    {
                                        metric: '그래프 연결성',
                                        current: metrics.graphConnectivity * 100,
                                        target: 90
                                    }
                                ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="현재 성능" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Radar name="목표 성능" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    <RechartsTooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 지식 그래프 목록 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                지식 그래프 목록
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>그래프 이름</TableCell>
                                            <TableCell>도메인</TableCell>
                                            <TableCell>노드 수</TableCell>
                                            <TableCell>엣지 수</TableCell>
                                            <TableCell>평균 신뢰도</TableCell>
                                            <TableCell>그래프 밀도</TableCell>
                                            <TableCell>마지막 업데이트</TableCell>
                                            <TableCell>상태</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {knowledgeGraphs.map((graph) => (
                                            <TableRow key={graph.id} hover onClick={() => handleGraphClick(graph)} style={{ cursor: 'pointer' }}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <AccountTree color="primary" />
                                                        <Typography variant="body2">{graph.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={graph.domain}
                                                        size="small"
                                                        color={graph.domain === 'technology' ? 'primary' : 'secondary'}
                                                    />
                                                </TableCell>
                                                <TableCell>{graph.metrics.totalNodes}</TableCell>
                                                <TableCell>{graph.metrics.totalEdges}</TableCell>
                                                <TableCell>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={graph.metrics.averageNodeConfidence * 100}
                                                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {(graph.metrics.averageNodeConfidence * 100).toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {(graph.metrics.graphDensity * 100).toFixed(2)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {graph.updated_at.toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label="활성"
                                                        color="success"
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderQueryTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 쿼리 실행 패널 */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                지식 쿼리 실행
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <FormControl fullWidth>
                                    <InputLabel>쿼리 타입</InputLabel>
                                    <Select
                                        value={newQuery.query_type}
                                        onChange={(e) => setNewQuery(prev => ({ ...prev, query_type: e.target.value }))}
                                        label="쿼리 타입"
                                    >
                                        <MenuItem value="node_search">노드 검색</MenuItem>
                                        <MenuItem value="path_finding">경로 찾기</MenuItem>
                                        <MenuItem value="pattern_matching">패턴 매칭</MenuItem>
                                        <MenuItem value="inference">추론</MenuItem>
                                        <MenuItem value="similarity">유사성 검색</MenuItem>
                                        <MenuItem value="clustering">클러스터링</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="쿼리 텍스트"
                                    value={newQuery.query_text}
                                    onChange={(e) => setNewQuery(prev => ({ ...prev, query_text: e.target.value }))}
                                    multiline
                                    rows={3}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setQueryDialogOpen(true)}
                                    startIcon={<PlayArrow />}
                                    fullWidth
                                >
                                    쿼리 실행
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 쿼리 결과 */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                최근 쿼리 결과
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {queries.map((query) => (
                                    <Paper key={query.id} sx={{ p: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip
                                                    label={query.query_type}
                                                    color={getQueryTypeColor(query.query_type)}
                                                    icon={getQueryTypeIcon(query.query_type)}
                                                    size="small"
                                                />
                                                <Typography variant="subtitle2">
                                                    {query.query_text}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary">
                                                {query.execution_time}ms
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            {query.results.length}개 결과, 신뢰도: {(query.confidence * 100).toFixed(1)}%
                                        </Typography>
                                        {query.results.slice(0, 2).map((result, index) => (
                                            <Box key={index} sx={{ ml: 2, mb: 1 }}>
                                                <Typography variant="body2">
                                                    • {result.explanation}
                                                </Typography>
                                            </Box>
                                        ))}
                                        <Typography variant="body2" color="textSecondary">
                                            {query.timestamp.toLocaleTimeString()}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderPatternsTab = () => (
        <Box>
            <Grid container spacing={3}>
                {patterns.map((pattern) => (
                    <Grid item xs={12} md={6} key={pattern.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        {pattern.pattern_type} 패턴
                                    </Typography>
                                    <Chip
                                        label={`${(pattern.significance * 100).toFixed(0)}점`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="body2" color="textSecondary" paragraph>
                                    {pattern.description}
                                </Typography>

                                <Box display="flex" gap={1} mb={2}>
                                    <Chip
                                        label={pattern.pattern_type}
                                        size="small"
                                        color={getPatternTypeColor(pattern.pattern_type)}
                                    />
                                    <Chip
                                        label={`${pattern.nodes.length} 노드`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${pattern.edges.length} 엣지`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle2">패턴 세부사항</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>빈도:</strong> {pattern.frequency}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>중요도:</strong> {(pattern.significance * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>예시 노드:</strong>
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {pattern.examples.map((example, index) => (
                                                    <Chip key={index} label={example} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        {pattern.created_at.toLocaleTimeString()}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <IconButton size="small" color="primary">
                                            <Visibility />
                                        </IconButton>
                                        <IconButton size="small" color="secondary">
                                            <Analytics />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* 패턴 분석 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                패턴 분석
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={patterns.map(pattern => ({
                                    pattern: pattern.pattern_type,
                                    significance: pattern.significance * 100,
                                    frequency: pattern.frequency,
                                    nodes: pattern.nodes.length
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="pattern" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="significance" fill="#8884d8" name="중요도 (%)" />
                                    <Bar dataKey="frequency" fill="#82ca9d" name="빈도" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderInferencesTab = () => (
        <Box>
            <Grid container spacing={3}>
                {inferences.map((inference) => (
                    <Grid item xs={12} md={6} key={inference.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        {inference.inference_type} 추론
                                    </Typography>
                                    <Chip
                                        label={`${(inference.confidence * 100).toFixed(0)}점`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>

                                <Box display="flex" gap={1} mb={2}>
                                    <Chip
                                        label={inference.inference_type}
                                        size="small"
                                        color={getInferenceTypeColor(inference.inference_type)}
                                    />
                                    <Chip
                                        label={`${inference.source_nodes.length} 소스`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle2">추론 과정</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List dense>
                                            {inference.reasoning_chain.map((step, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <Typography variant="body2" color="primary">
                                                            {index + 1}.
                                                        </Typography>
                                                    </ListItemIcon>
                                                    <ListItemText primary={step} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>

                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        {inference.created_at.toLocaleTimeString()}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <IconButton size="small" color="primary">
                                            <Psychology />
                                        </IconButton>
                                        <IconButton size="small" color="secondary">
                                            <Analytics />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* 추론 성능 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                추론 성능 분석
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                                    time: i,
                                    deductive: 0.85 + Math.random() * 0.1,
                                    inductive: 0.75 + Math.random() * 0.15,
                                    abductive: 0.70 + Math.random() * 0.2,
                                    analogical: 0.80 + Math.random() * 0.15,
                                    causal: 0.90 + Math.random() * 0.08
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="deductive" stroke="#8884d8" name="연역적" />
                                    <Line type="monotone" dataKey="inductive" stroke="#82ca9d" name="귀납적" />
                                    <Line type="monotone" dataKey="abductive" stroke="#ffc658" name="가정적" />
                                    <Line type="monotone" dataKey="analogical" stroke="#ff7300" name="유추적" />
                                    <Line type="monotone" dataKey="causal" stroke="#00ff00" name="인과적" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderAnalysisTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 분석 카드들 */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                그래프 밀도
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {(metrics.graphDensity * 100).toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                평균 경로 길이
                            </Typography>
                            <Typography variant="h3" color="success">
                                {metrics.averagePathLength.toFixed(1)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                클러스터링 계수
                            </Typography>
                            <Typography variant="h3" color="warning">
                                {(metrics.clusteringCoefficient * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                지식 커버리지
                            </Typography>
                            <Typography variant="h3" color="info">
                                {(metrics.knowledgeCoverage * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 그래프 분석 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                그래프 구조 분석
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart data={knowledgeGraphs.map(graph => ({
                                    nodes: graph.metrics.totalNodes,
                                    edges: graph.metrics.totalEdges,
                                    density: graph.metrics.graphDensity * 1000,
                                    connectivity: graph.metrics.graphConnectivity * 100
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nodes" name="노드 수" />
                                    <YAxis dataKey="edges" name="엣지 수" />
                                    <RechartsTooltip />
                                    <Scatter dataKey="density" fill="#8884d8" name="밀도" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderSettingsTab = () => (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 설정
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button variant="contained" color="primary" startIcon={<Refresh />}>
                                    지식 그래프 엔진 재시작
                                </Button>
                                <Button variant="outlined" color="secondary" startIcon={<Analytics />}>
                                    쿼리 최적화 실행
                                </Button>
                                <Button variant="outlined" color="info" startIcon={<Psychology />}>
                                    추론 엔진 재훈련
                                </Button>
                                <Button variant="outlined" color="warning" startIcon={<Settings />}>
                                    고급 설정
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 상태
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Alert severity="success">
                                    지식 그래프 시스템이 정상적으로 작동 중입니다.
                                </Alert>
                                <Alert severity="info">
                                    실시간 쿼리 처리가 활성화되어 있습니다.
                                </Alert>
                                <Alert severity="warning">
                                    일부 그래프의 메트릭이 업데이트되었습니다.
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        🧠 고급 AI 지식 그래프 대시보드
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        지식 네트워크 구축, 관계 분석, 지식 추론 및 패턴 발견
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Tooltip title="새로고침">
                        <IconButton>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isFullscreen ? "전체화면 해제" : "전체화면"}>
                        <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab icon={<AccountTree />} label="개요" />
                    <Tab icon={<Search />} label="쿼리 실행" />
                    <Tab icon={<Pattern />} label="패턴 분석" />
                    <Tab icon={<Psychology />} label="추론 결과" />
                    <Tab icon={<Analytics />} label="그래프 분석" />
                    <Tab icon={<Settings />} label="설정" />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <Box>
                {currentTab === 0 && renderOverviewTab()}
                {currentTab === 1 && renderQueryTab()}
                {currentTab === 2 && renderPatternsTab()}
                {currentTab === 3 && renderInferencesTab()}
                {currentTab === 4 && renderAnalysisTab()}
                {currentTab === 5 && renderSettingsTab()}
            </Box>

            {/* 지식 그래프 상세 다이얼로그 */}
            <Dialog open={graphDialogOpen} onClose={() => setGraphDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    지식 그래프 상세 정보: {selectedGraph?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedGraph && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">도메인</Typography>
                                    <Chip label={selectedGraph.domain} color="primary" />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">노드 수</Typography>
                                    <Typography variant="body2">{selectedGraph.metrics.totalNodes}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">엣지 수</Typography>
                                    <Typography variant="body2">{selectedGraph.metrics.totalEdges}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">평균 신뢰도</Typography>
                                    <Typography variant="body2">{(selectedGraph.metrics.averageNodeConfidence * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">설명</Typography>
                                    <Typography variant="body2">{selectedGraph.description}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGraphDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">그래프 시각화</Button>
                </DialogActions>
            </Dialog>

            {/* 쿼리 실행 다이얼로그 */}
            <Dialog open={queryDialogOpen} onClose={() => setQueryDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    지식 쿼리 실행
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Typography variant="body2" color="textSecondary">
                            선택한 쿼리 타입: <strong>{newQuery.query_type}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            쿼리 텍스트: <strong>{newQuery.query_text}</strong>
                        </Typography>
                        <Alert severity="info">
                            이 쿼리를 실행하시겠습니까? 실행 시간은 50-200ms 정도 소요될 수 있습니다.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQueryDialogOpen(false)}>취소</Button>
                    <Button variant="contained" color="primary" onClick={handleExecuteQuery}>
                        쿼리 실행
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedAIKnowledgeGraphDashboard;
