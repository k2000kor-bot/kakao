import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Speed,
  Storage,
  Api,
  BugReport,
  CheckCircle,
  Warning,
  Error,
  Info,
  Settings,
  Refresh,
  CloudUpload,
  CloudDownload,
  Security,
  Monitor,
  Analytics,
  TrendingUp,
  TrendingDown,
  Memory,
  Storage as StorageIcon,
  Api as ApiIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Security as SecurityIcon,
  Monitor as MonitorIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon2,
  Api as ApiIcon2,
  BugReport as BugReportIcon2,
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,
  Settings as SettingsIcon2,
  Refresh as RefreshIcon2,
  CloudUpload as CloudUploadIcon2,
  CloudDownload as CloudDownloadIcon2,
  Security as SecurityIcon2,
  Monitor as MonitorIcon2,
  Analytics as AnalyticsIcon2,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon2,
  Memory as MemoryIcon2,
  ExpandMore,
} from '@mui/icons-material';

interface SystemMetrics {
  databasePerformance: number;
  apiResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  storageUsage: number;
  activeConnections: number;
}

interface ScalabilityStabilitySystemProps {
  children?: React.ReactNode;
}

const ScalabilityStabilitySystem: React.FC<ScalabilityStabilitySystemProps> = ({ children }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    databasePerformance: 95,
    apiResponseTime: 150,
    errorRate: 0.5,
    memoryUsage: 65,
    cpuUsage: 45,
    networkLatency: 25,
    storageUsage: 78,
    activeConnections: 1250,
  });

  const [optimizationSettings, setOptimizationSettings] = useState({
    autoScaling: true,
    loadBalancing: true,
    caching: true,
    compression: true,
    monitoring: true,
    backup: true,
    security: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 실시간 메트릭 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        databasePerformance: Math.max(85, Math.min(100, prev.databasePerformance + (Math.random() - 0.5) * 5)),
        apiResponseTime: Math.max(50, Math.min(300, prev.apiResponseTime + (Math.random() - 0.5) * 20)),
        errorRate: Math.max(0, Math.min(2, prev.errorRate + (Math.random() - 0.5) * 0.2)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 15)),
        networkLatency: Math.max(10, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 5)),
        storageUsage: Math.max(60, Math.min(95, prev.storageUsage + (Math.random() - 0.5) * 3)),
        activeConnections: Math.max(800, Math.min(2000, prev.activeConnections + (Math.random() - 0.5) * 100)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOptimizationToggle = (key: string, value: boolean) => {
    setOptimizationSettings(prev => ({ ...prev, [key]: value }));
    setSnackbarMessage(`${key} 설정이 ${value ? '활성화' : '비활성화'}되었습니다.`);
    setShowSnackbar(true);
  };

  const getPerformanceColor = (value: number, threshold: number, reverse: boolean = false) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood ? 'success' : value >= threshold * 0.8 ? 'warning' : 'error';
  };

  const getPerformanceLabel = (value: number, threshold: number, reverse: boolean = false) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood ? '우수' : value >= threshold * 0.8 ? '양호' : '개선 필요';
  };

  const optimizationFeatures = [
    {
      id: 'database',
      title: '데이터베이스 최적화',
      icon: <StorageIcon />,
      metrics: [
        { label: '성능', value: metrics.databasePerformance, unit: '%', threshold: 90 },
        { label: '응답 시간', value: metrics.apiResponseTime, unit: 'ms', threshold: 200, reverse: true },
        { label: '활성 연결', value: metrics.activeConnections, unit: '', threshold: 1000 },
      ],
      optimizations: [
        '인덱스 최적화',
        '쿼리 캐싱',
        '커넥션 풀링',
        '파티셔닝',
        '백업 최적화',
      ]
    },
    {
      id: 'api',
      title: 'API 성능 개선',
      icon: <ApiIcon />,
      metrics: [
        { label: '응답 시간', value: metrics.apiResponseTime, unit: 'ms', threshold: 200, reverse: true },
        { label: '에러율', value: metrics.errorRate, unit: '%', threshold: 1, reverse: true },
        { label: '네트워크 지연', value: metrics.networkLatency, unit: 'ms', threshold: 30, reverse: true },
      ],
      optimizations: [
        '로드 밸런싱',
        'API 캐싱',
        '압축 최적화',
        'CDN 활용',
        'Rate Limiting',
      ]
    },
    {
      id: 'monitoring',
      title: '시스템 모니터링',
      icon: <MonitorIcon />,
      metrics: [
        { label: '메모리 사용량', value: metrics.memoryUsage, unit: '%', threshold: 80, reverse: true },
        { label: 'CPU 사용량', value: metrics.cpuUsage, unit: '%', threshold: 70, reverse: true },
        { label: '저장소 사용량', value: metrics.storageUsage, unit: '%', threshold: 85, reverse: true },
      ],
      optimizations: [
        '실시간 모니터링',
        '알림 시스템',
        '로그 분석',
        '성능 대시보드',
        '자동 복구',
      ]
    },
    {
      id: 'security',
      title: '보안 및 안정성',
      icon: <SecurityIcon />,
      metrics: [
        { label: '보안 점수', value: 98, unit: '%', threshold: 95 },
        { label: '백업 상태', value: 100, unit: '%', threshold: 100 },
        { label: '복구 시간', value: 2.5, unit: '분', threshold: 5, reverse: true },
      ],
      optimizations: [
        '암호화 강화',
        '접근 제어',
        '백업 자동화',
        '재해 복구',
        '보안 감사',
      ]
    }
  ];

  const quickActions = [
    { icon: <RefreshIcon />, name: '시스템 새로고침', action: () => {
      setSnackbarMessage('시스템이 새로고침되었습니다.');
      setShowSnackbar(true);
    }},
    { icon: <CloudUploadIcon />, name: '백업 실행', action: () => {
      setSnackbarMessage('백업이 시작되었습니다.');
      setShowSnackbar(true);
    }},
    { icon: <SettingsIcon />, name: '최적화 설정', action: () => setShowSettings(true) },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* 헤더 */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Speed sx={{ fontSize: 40, color: 'primary.main' }} />
            확장성 및 안정성 강화 시스템
          </Typography>
          <Typography variant="h6" color="text.secondary">
            데이터베이스 최적화, API 성능 개선, 오류 처리 강화를 통한 시스템 안정성 확보
          </Typography>
        </Box>

        {/* 전체 시스템 상태 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>전체 시스템 상태</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  <Typography variant="h6">시스템 성능</Typography>
                  <Typography variant="h4" color="success.main">95%</Typography>
                  <Typography variant="body2" color="text.secondary">우수</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <ApiIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  <Typography variant="h6">API 응답</Typography>
                  <Typography variant="h4" color="info.main">{metrics.apiResponseTime}ms</Typography>
                  <Typography variant="body2" color="text.secondary">빠름</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <BugReportIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Typography variant="h6">에러율</Typography>
                  <Typography variant="h4" color="warning.main">{metrics.errorRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">낮음</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <MemoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Typography variant="h6">메모리 사용량</Typography>
                  <Typography variant="h4" color="primary.main">{metrics.memoryUsage}%</Typography>
                  <Typography variant="body2" color="text.secondary">정상</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 최적화 기능 그리드 */}
        <Grid container spacing={3}>
          {optimizationFeatures.map((feature) => (
            <Grid item xs={12} md={6} key={feature.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  
                  {/* 메트릭 표시 */}
                  {feature.metrics.map((metric, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{metric.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.value}{metric.unit}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (metric.value / metric.threshold) * 100)} 
                            sx={{ height: 6, borderRadius: 3 }}
                            color={getPerformanceColor(metric.value, metric.threshold, metric.reverse) as any}
                          />
                        </Box>
                        <Chip 
                          label={getPerformanceLabel(metric.value, metric.threshold, metric.reverse)}
                          size="small"
                          color={getPerformanceColor(metric.value, metric.threshold, metric.reverse) as any}
                        />
                      </Box>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* 최적화 목록 */}
                  <Typography variant="subtitle2" gutterBottom>최적화 기능:</Typography>
                  <List dense>
                    {feature.optimizations.map((optimization, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={optimization} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 자동화 설정 */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>자동화 설정</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizationSettings.autoScaling}
                      onChange={(e) => handleOptimizationToggle('autoScaling', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="자동 스케일링"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizationSettings.loadBalancing}
                      onChange={(e) => handleOptimizationToggle('loadBalancing', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="로드 밸런싱"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizationSettings.caching}
                      onChange={(e) => handleOptimizationToggle('caching', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="캐싱"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizationSettings.monitoring}
                      onChange={(e) => handleOptimizationToggle('monitoring', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="실시간 모니터링"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 고급 최적화 기능 */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>고급 최적화 기능</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">데이터베이스 최적화</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      인덱스 최적화, 쿼리 튜닝, 파티셔닝을 통한 데이터베이스 성능 향상
                    </Typography>
                    <Button variant="contained" startIcon={<StorageIcon />}>
                      최적화 실행
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">API 성능 개선</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      캐싱, 압축, CDN을 활용한 API 응답 속도 개선
                    </Typography>
                    <Button variant="contained" startIcon={<ApiIcon />}>
                      성능 개선
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">오류 처리 강화</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      자동 복구, 로그 분석, 알림 시스템을 통한 안정성 향상
                    </Typography>
                    <Button variant="contained" startIcon={<BugReportIcon />}>
                      오류 분석
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">보안 강화</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      암호화, 접근 제어, 보안 감사를 통한 시스템 보안 강화
                    </Typography>
                    <Button variant="contained" startIcon={<SecurityIcon />}>
                      보안 점검
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* SpeedDial */}
        <SpeedDial
          ariaLabel="빠른 최적화 도구"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {quickActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>

        {/* 설정 다이얼로그 */}
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>최적화 설정</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              시스템 성능 최적화를 위한 상세 설정을 구성할 수 있습니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />

        {/* 자식 컴포넌트 렌더링 */}
        {children}
      </Container>
    </Box>
  );
};

export default ScalabilityStabilitySystem;
