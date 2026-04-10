// 보안 리포트 생성 컴포넌트
// 보안 데이터를 수집하여 리포트를 생성하고 다양한 형식으로 내보낼 수 있도록 지원

import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    Chip,
    Grid,
} from '@mui/material';
import {
    Description,
    Download,
    Code,
    TableChart,
} from '@mui/icons-material';
import securityReportService, { SecurityReport } from '../../services/securityReportService';
import { errorLogger } from '../../utils/errorLogger';

const SecurityReportGenerator: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<SecurityReport | null>(null);
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('html');

    const [reportConfig, setReportConfig] = useState({
        title: `보안 리포트 ${new Date().toLocaleDateString('ko-KR')}`,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 전
        endDate: new Date().toISOString().split('T')[0], // 오늘
        includeDetails: true,
    });

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const startDate = new Date(reportConfig.startDate);
            const endDate = new Date(reportConfig.endDate);
            endDate.setHours(23, 59, 59, 999); // 하루 끝까지

            const generatedReport = await securityReportService.generateReport(
                reportConfig.title,
                startDate,
                endDate,
                {
                    includeDetails: reportConfig.includeDetails,
                }
            );

            setReport(generatedReport);
        } catch (error) {
            errorLogger.error('보안 리포트 생성 실패', error as Error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        if (!report) return;

        try {
            securityReportService.downloadReport(report, exportFormat);
        } catch (error) {
            errorLogger.error('보안 리포트 내보내기 실패', error as Error);
        }
    };

    return (
        <Box>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                            보안 리포트 생성
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Description />}
                            onClick={() => setIsDialogOpen(true)}
                        >
                            리포트 생성
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        보안 데이터를 수집하여 리포트를 생성하고 다양한 형식으로 내보낼 수 있습니다.
                    </Typography>
                </CardContent>
            </Card>

            {/* 리포트 생성 다이얼로그 */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>보안 리포트 생성</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="리포트 제목"
                            value={reportConfig.title}
                            onChange={(e) =>
                                setReportConfig({ ...reportConfig, title: e.target.value })
                            }
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="시작 날짜"
                                type="date"
                                value={reportConfig.startDate}
                                onChange={(e) =>
                                    setReportConfig({ ...reportConfig, startDate: e.target.value })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="종료 날짜"
                                type="date"
                                value={reportConfig.endDate}
                                onChange={(e) =>
                                    setReportConfig({ ...reportConfig, endDate: e.target.value })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={reportConfig.includeDetails}
                                    onChange={(e) =>
                                        setReportConfig({
                                            ...reportConfig,
                                            includeDetails: e.target.checked,
                                        })
                                    }
                                />
                            }
                            label="상세 정보 포함"
                        />

                        {isGenerating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">리포트 생성 중...</Typography>
                            </Box>
                        )}

                        {report && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                리포트가 성공적으로 생성되었습니다.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>취소</Button>
                    <Button onClick={handleGenerate} variant="contained" disabled={isGenerating}>
                        생성
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 리포트 미리보기 및 내보내기 */}
            {report && (
                <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">생성된 리포트</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>형식</InputLabel>
                                    <Select
                                        value={exportFormat}
                                        onChange={(e) =>
                                            setExportFormat(e.target.value as 'json' | 'csv' | 'html')
                                        }
                                        label="형식"
                                    >
                                        <MenuItem value="html">
                                            <TableChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            HTML
                                        </MenuItem>
                                        <MenuItem value="csv">
                                            <TableChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            CSV
                                        </MenuItem>
                                        <MenuItem value="json">
                                            <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            JSON
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<Download />}
                                    onClick={handleExport}
                                >
                                    내보내기
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            총 위협
                                        </Typography>
                                        <Typography variant="h4">{report.summary.totalThreats}</Typography>
                                        <Chip
                                            label={`긴급: ${report.summary.criticalThreats}`}
                                            color="error"
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            보안 점수
                                        </Typography>
                                        <Typography variant="h4">{report.summary.securityScore}/100</Typography>
                                        <Chip
                                            label={
                                                report.summary.securityScore >= 80
                                                    ? '양호'
                                                    : report.summary.securityScore >= 60
                                                        ? '주의'
                                                        : '위험'
                                            }
                                            color={
                                                report.summary.securityScore >= 80
                                                    ? 'success'
                                                    : report.summary.securityScore >= 60
                                                        ? 'warning'
                                                        : 'error'
                                            }
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            총 알림
                                        </Typography>
                                        <Typography variant="h4">{report.summary.totalAlerts}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            실패한 로그인
                                        </Typography>
                                        <Typography variant="h4">{report.summary.failedLogins}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {report.recommendations.length > 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    권장사항
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {report.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default SecurityReportGenerator;
