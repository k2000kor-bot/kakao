import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Fab,
    CircularProgress,
    ListItemSecondaryAction,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Backup,
    Restore,
    Storage,
    Schedule,
    PlayArrow,
    Pause,
    Stop,
    Refresh,
    Add,
    Edit,
    Delete,
    Visibility,
    Download,
    Upload,
    CheckCircle,
    Error,
    Warning,
    Info,
    ExpandMore,
    Timeline,
    History,
    Assessment,
    Speed,
    Memory,
    Security,
    Delete as Cleanup,
    Storage as StorageIcon,
    Folder,
    FolderOpen,
    Archive,
    CloudUpload,
    CloudDownload
} from '@mui/icons-material';
import axios from 'axios';
import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = 'http://localhost:8000/api';

interface BackupJob {
    id: string;
    name: string;
    description: string;
    backup_type: string;
    source_paths: string[];
    destination_path: string;
    compression: boolean;
    encryption: boolean;
    retention_days: number;
    schedule?: string;
    status: string;
    created_at: string;
    updated_at: string;
    last_run?: string;
    next_run?: string;
    run_count: number;
    success_count: number;
    error_count: number;
    total_size?: number;
    compressed_size?: number;
}

interface BackupRecord {
    id: string;
    job_id: string;
    backup_type: string;
    status: string;
    started_at: string;
    completed_at?: string;
    file_count: number;
    total_size: number;
    compressed_size?: number;
    checksum?: string;
    error_message?: string;
    retention_until: string;
}

interface RecoveryJob {
    id: string;
    backup_id: string;
    target_path: string;
    status: string;
    started_at: string;
    completed_at?: string;
    recovered_files: number;
    recovered_size: number;
    error_message?: string;
}

interface BackupStatus {
    total_jobs: number;
    active_jobs: number;
    running_backups: number;
    running_recoveries: number;
    total_records: number;
    successful_backups: number;
    failed_backups: number;
    success_rate: number;
    total_backup_size: number;
    compressed_size: number;
    compression_ratio: number;
    system_health: string;
}

interface StorageUsage {
    total_capacity: number;
    used_space: number;
    available_space: number;
    usage_percentage: number;
    usage_by_type: {
        full_backups: number;
        incremental_backups: number;
        differential_backups: number;
        compressed_backups: number;
    };
    recommendations: string[];
}

const BackupRecoveryManager: React.FC = () => {
    const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
    const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
    const [recoveryJobs, setRecoveryJobs] = useState<RecoveryJob[]>([]);
    const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [createDialog, setCreateDialog] = useState(false);
    const [recoverDialog, setRecoverDialog] = useState(false);
    const [cleanupDialog, setCleanupDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<BackupRecord | null>(null);
    const [newJob, setNewJob] = useState({
        name: '',
        description: '',
        backup_type: 'full',
        source_paths: '',
        destination_path: '',
        compression: true,
        encryption: false,
        retention_days: 30,
        schedule: ''
    });
    const [recoverPath, setRecoverPath] = useState('');

    // 데이터 로드
    useEffect(() => {
        loadBackupData();
    }, []);

    const loadBackupData = async (): Promise<void> => {
        try {
            const [jobsRes, recordsRes, recoveriesRes, statusRes, storageRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/backup/jobs`),
                axios.get(`${API_BASE_URL}/backup/records`),
                axios.get(`${API_BASE_URL}/backup/recovery-jobs`),
                axios.get(`${API_BASE_URL}/backup/status`),
                axios.get(`${API_BASE_URL}/backup/storage-usage`)
            ]);

            if (jobsRes.data.success) {
                setBackupJobs(jobsRes.data.data.jobs);
            }
            if (recordsRes.data.success) {
                setBackupRecords(recordsRes.data.data.records);
            }
            if (recoveriesRes.data.success) {
                setRecoveryJobs(recoveriesRes.data.data.recoveries);
            }
            if (statusRes.data.success) {
                setBackupStatus(statusRes.data.data);
            }
            if (storageRes.data.success) {
                setStorageUsage(storageRes.data.data);
            }
        } catch (err: unknown) {
            setError('백업 데이터를 불러오는 중 오류가 발생했습니다.');
            errorLogger.error('백업 데이터 로드 오류', err, {
                component: 'BackupRecoveryManager',
                action: 'loadBackupData',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteBackup = async (jobId: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/backup/jobs/${jobId}/execute`);
            if (response.data.success) {
                setError(null);
                loadBackupData();
            }
        } catch (err) {
            setError('백업 실행 중 오류가 발생했습니다.');
        }
    };

    const handleRecoverBackup = async () => {
        if (!selectedRecord) return;

        try {
            const response = await axios.post(`${API_BASE_URL}/backup/records/${selectedRecord.id}/recover`, {
                target_path: recoverPath
            });
            if (response.data.success) {
                setError(null);
                setRecoverDialog(false);
                setRecoverPath('');
                setSelectedRecord(null);
                loadBackupData();
            }
        } catch (err) {
            setError('백업 복구 중 오류가 발생했습니다.');
        }
    };

    const handleCleanupBackups = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/backup/cleanup`);
            if (response.data.success) {
                setError(null);
                setCleanupDialog(false);
                loadBackupData();
            }
        } catch (err) {
            setError('백업 정리 중 오류가 발생했습니다.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'running': return 'primary';
            case 'pending': return 'info';
            case 'failed': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle />;
            case 'running': return <PlayArrow />;
            case 'pending': return <Schedule />;
            case 'failed': return <Error />;
            case 'cancelled': return <Stop />;
            default: return <Info />;
        }
    };

    const getBackupTypeIcon = (type: string) => {
        switch (type) {
            case 'full': return <Storage />;
            case 'incremental': return <Speed />;
            case 'differential': return <Memory />;
            case 'selective': return <Folder />;
            default: return <Backup />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const calculateSuccessRate = (job: BackupJob) => {
        if (job.run_count === 0) return 0;
        return Math.round((job.success_count / job.run_count) * 100);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">백업 데이터를 불러오는 중...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Backup sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight="bold">
                        백업 및 복구 관리
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="새로고침">
                        <IconButton onClick={loadBackupData} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<Cleanup />}
                        onClick={() => setCleanupDialog(true)}
                        color="warning"
                    >
                        정리
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialog(true)}
                    >
                        새 백업 작업
                    </Button>
                </Box>
            </Box>

            {/* 백업 상태 요약 */}
            {backupStatus && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            백업 시스템 상태
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">총 백업 작업</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                                        {backupStatus.total_jobs}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        활성: {backupStatus.active_jobs}개
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">성공률</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="success.main">
                                        {backupStatus.success_rate}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        성공: {backupStatus.successful_backups}개
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">백업 크기</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="info.main">
                                        {formatBytes(backupStatus.total_backup_size)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        압축률: {backupStatus.compression_ratio}%
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">시스템 상태</Typography>
                                    <Typography variant="h3" fontWeight="bold"
                                        color={backupStatus.system_health === 'healthy' ? 'success.main' : 'warning.main'}>
                                        {backupStatus.system_health === 'healthy' ? '정상' : '주의'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        실행 중: {backupStatus.running_backups}개
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* 저장소 사용량 */}
            {storageUsage && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            저장소 사용량
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        전체 사용량 ({storageUsage.usage_percentage}%)
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={storageUsage.usage_percentage}
                                        color={storageUsage.usage_percentage > 80 ? 'error' :
                                            storageUsage.usage_percentage > 60 ? 'warning' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="caption">
                                            사용: {formatBytes(storageUsage.used_space)}
                                        </Typography>
                                        <Typography variant="caption">
                                            여유: {formatBytes(storageUsage.available_space)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                    백업 유형별 사용량
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">전체 백업</Typography>
                                        <Typography variant="body2">{formatBytes(storageUsage.usage_by_type.full_backups)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">증분 백업</Typography>
                                        <Typography variant="body2">{formatBytes(storageUsage.usage_by_type.incremental_backups)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">차등 백업</Typography>
                                        <Typography variant="body2">{formatBytes(storageUsage.usage_by_type.differential_backups)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">압축 백업</Typography>
                                        <Typography variant="body2">{formatBytes(storageUsage.usage_by_type.compressed_backups)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* 권장사항 */}
                        {storageUsage.recommendations.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>
                                    권장사항
                                </Typography>
                                {storageUsage.recommendations.map((recommendation, index) => (
                                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                        {recommendation}
                                    </Alert>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="백업 작업" icon={<Backup />} />
                    <Tab label="백업 기록" icon={<History />} />
                    <Tab label="복구 작업" icon={<Restore />} />
                    <Tab label="모니터링" icon={<Timeline />} />
                </Tabs>
            </Box>

            {/* 백업 작업 탭 */}
            {selectedTab === 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {backupJobs.map((job) => (
                        <Card key={job.id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {job.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {job.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <Chip
                                                label={job.backup_type}
                                                size="small"
                                                icon={getBackupTypeIcon(job.backup_type)}
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={job.status}
                                                color={getStatusColor(job.status) as any}
                                                size="small"
                                                icon={getStatusIcon(job.status)}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title="실행">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleExecuteBackup(job.id)}
                                                disabled={job.status === 'running'}
                                            >
                                                <PlayArrow />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="상세보기">
                                            <IconButton size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* 설정 정보 */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                        설정
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {job.compression && (
                                            <Chip label="압축" size="small" color="primary" variant="outlined" />
                                        )}
                                        {job.encryption && (
                                            <Chip label="암호화" size="small" color="secondary" variant="outlined" />
                                        )}
                                        <Chip label={`보존 ${job.retention_days}일`} size="small" variant="outlined" />
                                    </Box>
                                </Box>

                                {/* 경로 정보 */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                        소스 경로
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {job.source_paths.join(', ')}
                                    </Typography>
                                </Box>

                                {/* 통계 정보 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            실행 횟수: {job.run_count}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            성공률: {calculateSuccessRate(job)}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        {job.last_run && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                마지막 실행: {formatDate(job.last_run)}
                                            </Typography>
                                        )}
                                        {job.next_run && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                다음 실행: {formatDate(job.next_run)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* 백업 기록 탭 */}
            {selectedTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            백업 기록
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>작업</TableCell>
                                        <TableCell>유형</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>시작 시간</TableCell>
                                        <TableCell>완료 시간</TableCell>
                                        <TableCell>파일 수</TableCell>
                                        <TableCell>크기</TableCell>
                                        <TableCell>조치</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {backupRecords.slice(0, 50).map((record) => {
                                        const job = backupJobs.find(j => j.id === record.job_id);
                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    {job ? job.name : record.job_id}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={record.backup_type}
                                                        size="small"
                                                        icon={getBackupTypeIcon(record.backup_type)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={record.status}
                                                        color={getStatusColor(record.status) as any}
                                                        size="small"
                                                        icon={getStatusIcon(record.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(record.started_at)}</TableCell>
                                                <TableCell>
                                                    {record.completed_at ? formatDate(record.completed_at) : '-'}
                                                </TableCell>
                                                <TableCell>{record.file_count}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {formatBytes(record.total_size)}
                                                        </Typography>
                                                        {record.compressed_size && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                압축: {formatBytes(record.compressed_size)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Restore />}
                                                        onClick={() => {
                                                            setSelectedRecord(record);
                                                            setRecoverDialog(true);
                                                        }}
                                                        disabled={record.status !== 'completed'}
                                                    >
                                                        복구
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 복구 작업 탭 */}
            {selectedTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            복구 작업 기록
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>복구 ID</TableCell>
                                        <TableCell>백업 ID</TableCell>
                                        <TableCell>대상 경로</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>시작 시간</TableCell>
                                        <TableCell>완료 시간</TableCell>
                                        <TableCell>복구된 파일</TableCell>
                                        <TableCell>복구된 크기</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recoveryJobs.slice(0, 50).map((recovery) => (
                                        <TableRow key={recovery.id}>
                                            <TableCell>{recovery.id}</TableCell>
                                            <TableCell>{recovery.backup_id}</TableCell>
                                            <TableCell>{recovery.target_path}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={recovery.status}
                                                    color={getStatusColor(recovery.status) as any}
                                                    size="small"
                                                    icon={getStatusIcon(recovery.status)}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(recovery.started_at)}</TableCell>
                                            <TableCell>
                                                {recovery.completed_at ? formatDate(recovery.completed_at) : '-'}
                                            </TableCell>
                                            <TableCell>{recovery.recovered_files}</TableCell>
                                            <TableCell>{formatBytes(recovery.recovered_size)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 모니터링 탭 */}
            {selectedTab === 3 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                백업 통계
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">총 백업 작업</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {backupJobs.length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">성공한 백업</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {backupRecords.filter(r => r.status === 'completed').length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">실패한 백업</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {backupRecords.filter(r => r.status === 'failed').length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                복구 통계
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">총 복구 작업</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {recoveryJobs.length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">성공한 복구</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {recoveryJobs.filter(r => r.status === 'completed').length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">실패한 복구</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {recoveryJobs.filter(r => r.status === 'failed').length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                성능 지표
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">평균 백업 크기</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {backupRecords.length > 0
                                        ? formatBytes(backupRecords.reduce((sum, r) => sum + r.total_size, 0) / backupRecords.length)
                                        : '0 Bytes'
                                    }
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">압축률</Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {backupStatus ? `${backupStatus.compression_ratio}%` : '0%'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">전체 성공률</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {backupStatus ? `${backupStatus.success_rate}%` : '0%'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 백업 복구 다이얼로그 */}
            <Dialog open={recoverDialog} onClose={() => setRecoverDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Restore />
                        백업 복구
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedRecord && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                선택된 백업
                            </Typography>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    백업 ID: {selectedRecord.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    파일 수: {selectedRecord.file_count}개
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    크기: {formatBytes(selectedRecord.total_size)}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        label="복구 대상 경로"
                        value={recoverPath}
                        onChange={(e) => setRecoverPath(e.target.value)}
                        placeholder="/recovery/target/path"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecoverDialog(false)}>취소</Button>
                    <Button variant="contained" onClick={handleRecoverBackup}>
                        복구 시작
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 백업 정리 다이얼로그 */}
            <Dialog open={cleanupDialog} onClose={() => setCleanupDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Cleanup />
                        백업 정리
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" mb={2}>
                        만료된 백업 파일들을 정리하시겠습니까?
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        이 작업은 되돌릴 수 없습니다. 정리된 백업 파일은 복구할 수 없습니다.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCleanupDialog(false)}>취소</Button>
                    <Button variant="contained" color="warning" onClick={handleCleanupBackups}>
                        정리 실행
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 에러 알림 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BackupRecoveryManager;
