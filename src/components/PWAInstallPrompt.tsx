import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Slide,
  Fade
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  Smartphone as PhoneIcon,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import usePWA from '../hooks/usePWA';
import useResponsive from '../hooks/useResponsive';

const PWAInstallPrompt: React.FC = () => {
  const theme = useTheme();
  const { deviceType } = useResponsive();
  const {
    isInstalled,
    isInstallable,
    canInstall,
    installPrompt,
    installApp,
    swUpdateAvailable,
    updateApp,
    checkForUpdates
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 설치 가능하고 아직 설치되지 않은 경우 프롬프트 표시
    if (isInstallable && !isInstalled && canInstall) {
      // 사용자가 이전에 거부한 경우를 확인
      const dismissedInstall = localStorage.getItem('pwa-install-dismissed');
      const lastDismissed = dismissedInstall ? new Date(dismissedInstall) : null;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (!lastDismissed || lastDismissed < oneWeekAgo) {
        setShowPrompt(true);
      }
    }
  }, [isInstallable, isInstalled, canInstall]);

  useEffect(() => {
    // 업데이트 사용 가능한 경우 업데이트 다이얼로그 표시
    if (swUpdateAvailable) {
      setShowUpdateDialog(true);
    }
  }, [swUpdateAvailable]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      setInstallError(null);
      await installApp();
      setShowPrompt(false);
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : '설치 중 오류가 발생했습니다.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleUpdate = async () => {
    try {
      await updateApp();
      setShowUpdateDialog(false);
    } catch (error) {
      console.error('업데이트 실패:', error);
    }
  };

  const handleCheckUpdates = async () => {
    try {
      await checkForUpdates();
    } catch (error) {
      console.error('업데이트 확인 실패:', error);
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <PhoneIcon />;
      case 'tablet': return <TabletIcon />;
      default: return <ComputerIcon />;
    }
  };

  const getInstallBenefits = () => [
    '빠른 앱 실행 속도',
    '오프라인에서도 사용 가능',
    '홈 화면에서 바로 접근',
    '푸시 알림 받기',
    '데이터 사용량 절약'
  ];

  if (isInstalled) {
    return null; // 이미 설치된 경우 표시하지 않음
  }

  return (
    <>
      {/* 설치 프롬프트 */}
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
      >
        <Card sx={{ 
          minWidth: 320, 
          maxWidth: 400,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}>
          <CardContent sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2 }}>
                {getDeviceIcon()}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  CORBU AI 설치
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  앱을 설치하여 더 나은 경험을 즐기세요
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={handleDismiss}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                설치 혜택:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {getInstallBenefits().slice(0, 3).map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<InstallIcon />}
                onClick={handleInstall}
                disabled={isInstalling}
                sx={{
                  flexGrow: 1,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                {isInstalling ? '설치 중...' : '지금 설치'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDismiss}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                나중에
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Snackbar>

      {/* 업데이트 다이얼로그 */}
      <Dialog
        open={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RefreshIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              앱 업데이트 사용 가능
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            CORBU AI의 새 버전이 사용 가능합니다. 업데이트하면 새로운 기능과 개선사항을 이용할 수 있습니다.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              업데이트 내용:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="성능 최적화 및 버그 수정" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="새로운 AI 기능 추가" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="보안 강화" />
              </ListItem>
            </List>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            업데이트 후 페이지가 자동으로 새로고침됩니다.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateDialog(false)}>
            나중에
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleUpdate}
          >
            지금 업데이트
          </Button>
        </DialogActions>
      </Dialog>

      {/* 설치 오류 알림 */}
      <Snackbar
        open={!!installError}
        autoHideDuration={6000}
        onClose={() => setInstallError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setInstallError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {installError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallPrompt;
