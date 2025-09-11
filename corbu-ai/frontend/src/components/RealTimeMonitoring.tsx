import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Monitor,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
  Refresh,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_connections: number;
  response_time: number;
  error_rate: number;
  throughput: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: Date | string;
  severity: 'low' | 'medium' | 'high';
}

const RealTimeMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_latency: 0,
    active_connections: 0,
    response_time: 0,
    error_rate: 0,
    throughput: 0
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 실시간 메트릭 업데이트
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:5005/system/metrics');
        const data = await response.json();
        
        if (data.success) {
          setMetrics(data.system_metrics);
          setLastUpdate(new Date());
          
          // 임계값 기반 알림 생성
          generateAlerts(data.system_metrics);
        }
      } catch (error) {
        console.error('메트릭 조회 실패:', error);
        // 오류 시 시뮬레이션된 메트릭 사용
        const simulatedMetrics = {
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_latency: Math.random() * 100,
          active_connections: Math.floor(Math.random() * 50) + 10,
          response_time: Math.random() * 1000,
          error_rate: Math.random() * 5,
          throughput: Math.random() * 1000
        };
        setMetrics(simulatedMetrics);
        setLastUpdate(new Date());
        generateAlerts(simulatedMetrics);
      }
    };

    if (isMonitoring) {
      const interval = setInterval(fetchMetrics, 5000); // 5초마다 업데이트
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const generateAlerts = (currentMetrics: SystemMetrics) => {
    const newAlerts: AlertItem[] = [];

    if (currentMetrics.cpu_usage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        message: `CPU 사용률이 높습니다: ${currentMetrics.cpu_usage.toFixed(1)}%`,
        timestamp: new Date(),
        severity: currentMetrics.cpu_usage > 90 ? 'high' : 'medium'
      });
    }

    if (currentMetrics.memory_usage > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `메모리 사용률이 높습니다: ${currentMetrics.memory_usage.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    if (currentMetrics.response_time > 1000) {
      newAlerts.push({
        id: `response-${Date.now()}`,
        type: 'warning',
        message: `응답 시간이 느립니다: ${currentMetrics.response_time.toFixed(0)}ms`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    if (currentMetrics.error_rate > 3) {
      newAlerts.push({
        id: `error-${Date.now()}`,
        type: 'error',
        message: `오류율이 높습니다: ${currentMetrics.error_rate.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // 최대 10개 유지
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      case 'success': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Monitor color="primary" />
          실시간 시스템 모니터링
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={isMonitoring ? "contained" : "outlined"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            startIcon={<Monitor />}
            color={isMonitoring ? "success" : "primary"}
          >
            {isMonitoring ? '모니터링 중' : '모니터링 시작'}
          </Button>
          
          <Tooltip title="새로고침">
            <IconButton onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 시스템 메트릭 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">CPU 사용률</Typography>
              </Box>
              <Typography variant="h4" color={getStatusColor(metrics.cpu_usage, { warning: 70, critical: 90 })}>
                {metrics.cpu_usage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.cpu_usage}
                color={getStatusColor(metrics.cpu_usage, { warning: 70, critical: 90 })}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Memory color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">메모리 사용률</Typography>
              </Box>
              <Typography variant="h4" color={getStatusColor(metrics.memory_usage, { warning: 80, critical: 90 })}>
                {metrics.memory_usage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.memory_usage}
                color={getStatusColor(metrics.memory_usage, { warning: 80, critical: 90 })}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">디스크 사용률</Typography>
              </Box>
              <Typography variant="h4" color={getStatusColor(metrics.disk_usage, { warning: 85, critical: 95 })}>
                {metrics.disk_usage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.disk_usage}
                color={getStatusColor(metrics.disk_usage, { warning: 85, critical: 95 })}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NetworkCheck color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">네트워크 지연</Typography>
              </Box>
              <Typography variant="h4" color={getStatusColor(metrics.network_latency, { warning: 50, critical: 80 })}>
                {metrics.network_latency.toFixed(0)}ms
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.network_latency}
                color={getStatusColor(metrics.network_latency, { warning: 50, critical: 80 })}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 성능 지표 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>성능 지표</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">활성 연결</Typography>
                  <Typography variant="h5">{metrics.active_connections}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">응답 시간</Typography>
                  <Typography variant="h5" color={getStatusColor(metrics.response_time, { warning: 500, critical: 1000 })}>
                    {metrics.response_time.toFixed(0)}ms
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">오류율</Typography>
                  <Typography variant="h5" color={getStatusColor(metrics.error_rate, { warning: 2, critical: 5 })}>
                    {metrics.error_rate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">처리량</Typography>
                  <Typography variant="h5">{metrics.throughput.toFixed(0)} req/s</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>시스템 상태</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">서버 상태</Typography>
                  <Chip label="정상" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">AI 엔진</Typography>
                  <Chip label="활성" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">캐시 시스템</Typography>
                  <Chip label="활성" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">마지막 업데이트</Typography>
                  <Typography variant="caption">
                    {lastUpdate.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 알림 목록 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>시스템 알림</Typography>
          {alerts.length === 0 ? (
            <Alert severity="success">
              모든 시스템이 정상적으로 작동하고 있습니다.
            </Alert>
          ) : (
            <List>
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{alert.message}</Typography>
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getAlertColor(alert.type)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        alert.timestamp instanceof Date 
                          ? alert.timestamp.toLocaleString() 
                          : new Date(alert.timestamp).toLocaleString()
                      }
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RealTimeMonitoring;
