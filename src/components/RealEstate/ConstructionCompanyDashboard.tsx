// 시공사 정보 대시보드
// 하자 이슈, 대응 방안, 선정 기준 분석 기능 제공

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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Rating,
    Stepper,
    Step,
    StepLabel,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    Business,
    Warning,
    Compare,
    Add,
    Refresh,
    Assessment,
} from '@mui/icons-material';
import constructionCompanyService, {
    ConstructionCompany,
    DefectIssue,
    ResponsePlan,
    SelectionCriteriaAnalysis,
    CompanyComparison,
    IssueSeverity,
    IssueStatus,
    SelectionCriteria,
} from '../../services/constructionCompanyService';
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
            id={`construction-tabpanel-${index}`}
            aria-labelledby={`construction-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const ConstructionCompanyDashboard: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<ConstructionCompany[]>([]);
    const [defectIssues, setDefectIssues] = useState<DefectIssue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<DefectIssue | null>(null);
    const [responsePlan, setResponsePlan] = useState<ResponsePlan | null>(null);
    const [selectionAnalyses, setSelectionAnalyses] = useState<SelectionCriteriaAnalysis[]>([]);
    const [comparison, setComparison] = useState<CompanyComparison | null>(null);
    const [isResponsePlanDialogOpen, setIsResponsePlanDialogOpen] = useState(false);
    const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedCompaniesForComparison, setSelectedCompaniesForComparison] = useState<string[]>([]);
    const [selectedCriteria, setSelectedCriteria] = useState<SelectionCriteria[]>([]);

    // 데이터 로드
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [companiesData, issuesData] = await Promise.all([
                constructionCompanyService.getCompanies(),
                constructionCompanyService.getDefectIssues(),
            ]);

            setCompanies(companiesData);
            setDefectIssues(issuesData);
        } catch (error) {
            errorLogger.error('시공사 데이터 로드 실패', error as Error, {
                component: 'ConstructionCompanyDashboard',
                action: 'loadData',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 검색 필터 함수
    const matchesSearch = useCallback((issue: DefectIssue, term: string): boolean => {
        const searchLower = term.toLowerCase();
        return (
            issue.title.toLowerCase().includes(searchLower) ||
            issue.description.toLowerCase().includes(searchLower) ||
            issue.company_name.toLowerCase().includes(searchLower)
        );
    }, []);

    // 필터링된 하자 이슈
    const filteredIssues = useMemo(() => {
        let filtered = [...defectIssues];

        if (searchTerm) {
            filtered = filtered.filter((issue) => matchesSearch(issue, searchTerm));
        }

        if (filterSeverity !== 'all') {
            filtered = filtered.filter((issue) => issue.severity === filterSeverity);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter((issue) => issue.status === filterStatus);
        }

        return filtered;
    }, [defectIssues, searchTerm, filterSeverity, filterStatus, matchesSearch]);


    // 대응 방안 생성
    const handleGenerateResponsePlan = useCallback(async (issue: DefectIssue) => {
        setSelectedIssue(issue);
        setIsLoading(true);
        try {
            const plan = await constructionCompanyService.generateResponsePlan(issue.id, issue.company_id);
            setResponsePlan(plan);
            setIsResponsePlanDialogOpen(true);
        } catch (error) {
            errorLogger.error('대응 방안 생성 실패', error as Error, {
                component: 'ConstructionCompanyDashboard',
                action: 'handleGenerateResponsePlan',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 선정 기준 분석
    const handleAnalyzeSelection = useCallback(async () => {
        if (selectedCompaniesForComparison.length === 0) {
            alert('비교할 시공사를 선택하세요.');
            return;
        }

        setIsLoading(true);
        try {
            const analyses = await constructionCompanyService.analyzeSelectionCriteria(
                selectedCompaniesForComparison,
                selectedCriteria.length > 0 ? selectedCriteria : undefined
            );
            setSelectionAnalyses(analyses);
        } catch (error) {
            errorLogger.error('선정 기준 분석 실패', error as Error, {
                component: 'ConstructionCompanyDashboard',
                action: 'handleAnalyzeSelection',
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompaniesForComparison, selectedCriteria]);

    // 시공사 비교
    const handleCompareCompanies = useCallback(async () => {
        if (selectedCompaniesForComparison.length < 2) {
            alert('비교할 시공사를 2개 이상 선택하세요.');
            return;
        }

        setIsLoading(true);
        try {
            const comparisonData = await constructionCompanyService.compareCompanies(selectedCompaniesForComparison);
            setComparison(comparisonData);
            setIsComparisonDialogOpen(true);
        } catch (error) {
            errorLogger.error('시공사 비교 실패', error as Error, {
                component: 'ConstructionCompanyDashboard',
                action: 'handleCompareCompanies',
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompaniesForComparison]);

    // 심각도 색상
    const getSeverityColor = useCallback((severity: IssueSeverity): 'error' | 'warning' | 'info' | 'default' => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            default:
                return 'info';
        }
    }, []);

    // 상태 색상
    const getStatusColor = useCallback((status: IssueStatus): 'success' | 'warning' | 'info' | 'default' => {
        switch (status) {
            case 'resolved':
            case 'closed':
                return 'success';
            case 'fixing':
                return 'info';
            case 'investigating':
                return 'warning';
            default:
                return 'default';
        }
    }, []);

    // 카테고리 한글명
    const getCategoryLabel = useCallback((category: string): string => {
        const labels: Record<string, string> = {
            structure: '구조',
            finishing: '마감',
            electrical: '전기',
            plumbing: '배관',
            heating: '난방',
            safety: '안전',
            other: '기타',
        };
        return labels[category] || category;
    }, []);

    // 상태 한글명
    const getStatusLabel = useCallback((status: IssueStatus): string => {
        const labels: Record<IssueStatus, string> = {
            reported: '신고됨',
            investigating: '조사 중',
            fixing: '수리 중',
            resolved: '해결됨',
            closed: '종료',
        };
        return labels[status];
    }, []);

    // 선정 기준 한글명
    const getCriteriaLabel = useCallback((criteria: SelectionCriteria): string => {
        const labels: Record<SelectionCriteria, string> = {
            reputation: '평판',
            price: '가격',
            quality: '품질',
            experience: '경험',
            warranty: '보증',
            response_time: '응답 시간',
        };
        return labels[criteria];
    }, []);

    if (isLoading && companies.length === 0) {
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
                    시공사 정보 시스템
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

            {/* 탭 메뉴 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    aria-label="시공사 정보 탭"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<Business />} label="시공사 목록" id="construction-tab-0" aria-controls="construction-tabpanel-0" />
                    <Tab icon={<Warning />} label="하자 이슈" id="construction-tab-1" aria-controls="construction-tabpanel-1" />
                    <Tab icon={<Compare />} label="선정 기준 분석" id="construction-tab-2" aria-controls="construction-tabpanel-2" />
                </Tabs>
            </Paper>

            {/* 시공사 목록 탭 */}
            <TabPanel value={selectedTab} index={0}>
                <Grid container spacing={3}>
                    {companies.map((company) => (
                        <Grid size={{ xs: 12, md: 6 }} key={company.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6">{company.name}</Typography>
                                        <Rating value={company.rating} precision={0.1} readOnly size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        설립: {company.established_year}년 | 본사: {company.headquarters}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            전문 분야:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {company.specialties.map((specialty) => (
                                                <Chip key={specialty} label={specialty} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                총 프로젝트
                                            </Typography>
                                            <Typography variant="h6">{company.total_projects}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                완료 프로젝트
                                            </Typography>
                                            <Typography variant="h6" color="success.main">
                                                {company.completed_projects}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                평판 점수
                                            </Typography>
                                            <Typography variant="h6">{company.reputation_score.toFixed(1)}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                품질 점수
                                            </Typography>
                                            <Typography variant="h6">{company.quality_score.toFixed(1)}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                // 상세 보기는 향후 구현
                                                alert(`${company.name} 상세 정보는 향후 구현 예정입니다.`);
                                            }}
                                        >
                                            상세 보기
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* 하자 이슈 탭 */}
            <TabPanel value={selectedTab} index={1}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">하자 이슈</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ minWidth: 200 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>심각도</InputLabel>
                            <Select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                label="심각도"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="상태"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="reported">신고됨</MenuItem>
                                <MenuItem value="investigating">조사 중</MenuItem>
                                <MenuItem value="fixing">수리 중</MenuItem>
                                <MenuItem value="resolved">해결됨</MenuItem>
                                <MenuItem value="closed">종료</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => {
                                // 이슈 등록 다이얼로그는 향후 구현
                                alert('이슈 등록 기능은 향후 구현 예정입니다.');
                            }}
                        >
                            이슈 등록
                        </Button>
                    </Box>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>제목</TableCell>
                                <TableCell>시공사</TableCell>
                                <TableCell>카테고리</TableCell>
                                <TableCell>심각도</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>신고일</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredIssues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        하자 이슈가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredIssues.map((issue) => (
                                    <TableRow key={issue.id}>
                                        <TableCell>{issue.title}</TableCell>
                                        <TableCell>{issue.company_name}</TableCell>
                                        <TableCell>
                                            <Chip label={getCategoryLabel(issue.category)} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={issue.severity.toUpperCase()}
                                                color={getSeverityColor(issue.severity)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(issue.status)}
                                                color={getStatusColor(issue.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(issue.reported_date).toLocaleDateString('ko-KR')}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleGenerateResponsePlan(issue)}
                                                disabled={isLoading}
                                            >
                                                대응 방안 생성
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* 선정 기준 분석 탭 */}
            <TabPanel value={selectedTab} index={2}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        시공사 선정 기준 분석
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        비교할 시공사를 선택하고 선정 기준을 분석하세요.
                    </Typography>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                시공사 선택
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {companies.map((company) => (
                                    <FormControlLabel
                                        key={company.id}
                                        control={
                                            <Checkbox
                                                checked={selectedCompaniesForComparison.includes(company.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCompaniesForComparison([...selectedCompaniesForComparison, company.id]);
                                                    } else {
                                                        setSelectedCompaniesForComparison(
                                                            selectedCompaniesForComparison.filter((id) => id !== company.id)
                                                        );
                                                    }
                                                }}
                                            />
                                        }
                                        label={`${company.name} (평점: ${company.rating})`}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                분석 기준 선택 (선택사항)
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {(['reputation', 'price', 'quality', 'experience', 'warranty', 'response_time'] as SelectionCriteria[]).map(
                                    (criteria) => (
                                        <FormControlLabel
                                            key={criteria}
                                            control={
                                                <Checkbox
                                                    checked={selectedCriteria.includes(criteria)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCriteria([...selectedCriteria, criteria]);
                                                        } else {
                                                            setSelectedCriteria(selectedCriteria.filter((c) => c !== criteria));
                                                        }
                                                    }}
                                                />
                                            }
                                            label={getCriteriaLabel(criteria)}
                                        />
                                    )
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Assessment />}
                            onClick={handleAnalyzeSelection}
                            disabled={selectedCompaniesForComparison.length === 0 || isLoading}
                        >
                            선정 기준 분석
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Compare />}
                            onClick={handleCompareCompanies}
                            disabled={selectedCompaniesForComparison.length < 2 || isLoading}
                        >
                            시공사 비교
                        </Button>
                    </Box>
                </Box>

                {/* 분석 결과 */}
                {selectionAnalyses.length > 0 && (
                    <Grid container spacing={3}>
                        {selectionAnalyses.map((analysis) => (
                            <Grid size={{ xs: 12, md: 6 }} key={analysis.company_id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {analysis.company_name}
                                        </Typography>
                                        <Typography variant="h4" color="primary" gutterBottom>
                                            종합 점수: {analysis.overall_score.toFixed(1)}
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                기준별 점수:
                                            </Typography>
                                            {Object.entries(analysis.criteria_scores).map(([criteria, score]) => (
                                                <Box key={criteria} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">{getCriteriaLabel(criteria as SelectionCriteria)}:</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {score.toFixed(1)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                강점:
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {analysis.strengths.map((strength) => (
                                                    <Chip key={strength} label={strength} size="small" color="success" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                약점:
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {analysis.weaknesses.map((weakness) => (
                                                    <Chip key={weakness} label={weakness} size="small" color="error" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </TabPanel>

            {/* 대응 방안 다이얼로그 */}
            <Dialog
                open={isResponsePlanDialogOpen}
                onClose={() => setIsResponsePlanDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    대응 방안
                    {selectedIssue && ` - ${selectedIssue.title}`}
                </DialogTitle>
                <DialogContent>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : responsePlan ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        대응 유형
                                    </Typography>
                                    <Chip
                                        label={
                                            (() => {
                                                switch (responsePlan.response_type) {
                                                    case 'immediate':
                                                        return '즉시 대응';
                                                    case 'scheduled':
                                                        return '예정된 대응';
                                                    case 'long_term':
                                                        return '장기 대응';
                                                    default:
                                                        return '예방적 대응';
                                                }
                                            })()
                                        }
                                        color="primary"
                                    />
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        {responsePlan.description}
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        대응 단계
                                    </Typography>
                                    <Stepper orientation="vertical">
                                        {responsePlan.steps.map((step) => (
                                            <Step key={step.step_number} active={true}>
                                                <StepLabel>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {step.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        예상 소요: {step.estimated_duration} | 담당: {step.responsible_party}
                                                    </Typography>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </CardContent>
                            </Card>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    예상 완료일: {new Date(responsePlan.estimated_completion).toLocaleDateString('ko-KR')}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    예상 비용: {responsePlan.cost_estimate.toLocaleString()}원
                                </Typography>
                            </Box>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsResponsePlanDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 시공사 비교 다이얼로그 */}
            <Dialog
                open={isComparisonDialogOpen}
                onClose={() => setIsComparisonDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>시공사 비교</DialogTitle>
                <DialogContent>
                    {comparison ? (
                        <Box>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {comparison.summary}
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>시공사</TableCell>
                                            {(['reputation', 'price', 'quality', 'experience', 'warranty', 'response_time'] as SelectionCriteria[]).map(
                                                (criteria) => (
                                                    <TableCell key={criteria} align="right">
                                                        {getCriteriaLabel(criteria)}
                                                    </TableCell>
                                                )
                                            )}
                                            <TableCell align="right">종합 점수</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {comparison.companies.map((company) => (
                                            <TableRow key={company.company_id}>
                                                <TableCell>{company.company_name}</TableCell>
                                                {(['reputation', 'price', 'quality', 'experience', 'warranty', 'response_time'] as SelectionCriteria[]).map(
                                                    (criteria) => (
                                                        <TableCell key={criteria} align="right">
                                                            {company.criteria_scores[criteria].toFixed(1)}
                                                        </TableCell>
                                                    )
                                                )}
                                                <TableCell align="right">
                                                    <Typography variant="h6">{company.overall_score.toFixed(1)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsComparisonDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConstructionCompanyDashboard;
