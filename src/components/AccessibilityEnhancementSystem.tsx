import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Slider,
    Button,
    Chip,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
} from '@mui/material';
import {
    Accessibility,
    Visibility,
    VisibilityOff,
    VolumeUp,
    VolumeOff,
    HighContrast,
    ZoomIn,
    ZoomOut,
    Keyboard,
    Mouse,
    TouchApp,
    Hearing,
    Visibility as VisibilityIcon,
    Contrast,
    Palette,
    TextFields,
    FormatSize,
    Speed,
    CheckCircle,
    Warning,
    Info,
    Settings,
    Help,
    Close,
    ExpandMore,
    KeyboardArrowDown,
    KeyboardArrowUp,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    Home,
    Menu,
    Search,
    Notifications,
    AccountCircle,
    Brightness4,
    Brightness7,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    HighContrast as HighContrastIcon,
    Accessibility as AccessibilityIcon,
    Keyboard as KeyboardIcon,
    Mouse as MouseIcon,
    TouchApp as TouchAppIcon,
    Hearing as HearingIcon,
    Visibility as VisibilityIcon2,
    Contrast as ContrastIcon,
    Palette as PaletteIcon,
    TextFields as TextFieldsIcon,
    FormatSize as FormatSizeIcon,
    Speed as SpeedIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowLeft as KeyboardArrowLeftIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    Home as HomeIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountCircleIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
} from '@mui/icons-material';

interface AccessibilitySettings {
    highContrast: boolean;
    fontSize: number;
    lineSpacing: number;
    colorBlindness: string;
    screenReader: boolean;
    keyboardNavigation: boolean;
    reducedMotion: boolean;
    focusIndicator: boolean;
    altText: boolean;
    captions: boolean;
    audioDescription: boolean;
    voiceControl: boolean;
    eyeTracking: boolean;
    brainComputerInterface: boolean;
}

interface AccessibilityEnhancementSystemProps {
    children?: React.ReactNode;
}

const AccessibilityEnhancementSystem: React.FC<AccessibilityEnhancementSystemProps> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>({
        highContrast: false,
        fontSize: 16,
        lineSpacing: 1.5,
        colorBlindness: 'none',
        screenReader: false,
        keyboardNavigation: true,
        reducedMotion: false,
        focusIndicator: true,
        altText: true,
        captions: false,
        audioDescription: false,
        voiceControl: false,
        eyeTracking: false,
        brainComputerInterface: false,
    });

    const [showSettings, setShowSettings] = useState(false);
    const [accessibilityScore, setAccessibilityScore] = useState(85);
    const [currentFeature, setCurrentFeature] = useState<string>('기본 접근성');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // 접근성 점수 계산
    useEffect(() => {
        let score = 0;
        const totalFeatures = Object.keys(settings).length;

        Object.values(settings).forEach(value => {
            if (typeof value === 'boolean' && value) score += 100 / totalFeatures;
            else if (typeof value === 'number' && value > 0) score += 100 / totalFeatures;
            else if (typeof value === 'string' && value !== 'none') score += 100 / totalFeatures;
        });

        setAccessibilityScore(Math.round(score));
    }, [settings]);

    const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSnackbarMessage(`${key} 설정이 변경되었습니다.`);
        setShowSnackbar(true);
    };

    const accessibilityFeatures = [
        {
            id: 'visual',
            title: '시각적 접근성',
            icon: <VisibilityIcon />,
            features: [
                { key: 'highContrast', label: '고대비 모드', type: 'switch' },
                { key: 'fontSize', label: '글자 크기', type: 'slider', min: 12, max: 24 },
                { key: 'lineSpacing', label: '줄 간격', type: 'slider', min: 1, max: 3, step: 0.1 },
                { key: 'colorBlindness', label: '색맹 지원', type: 'select', options: ['none', 'protanopia', 'deuteranopia', 'tritanopia'] },
            ]
        },
        {
            id: 'auditory',
            title: '청각적 접근성',
            icon: <HearingIcon />,
            features: [
                { key: 'screenReader', label: '스크린 리더', type: 'switch' },
                { key: 'captions', label: '자막', type: 'switch' },
                { key: 'audioDescription', label: '음성 설명', type: 'switch' },
            ]
        },
        {
            id: 'motor',
            title: '운동 접근성',
            icon: <TouchAppIcon />,
            features: [
                { key: 'keyboardNavigation', label: '키보드 네비게이션', type: 'switch' },
                { key: 'voiceControl', label: '음성 제어', type: 'switch' },
                { key: 'eyeTracking', label: '시선 추적', type: 'switch' },
                { key: 'brainComputerInterface', label: '뇌-컴퓨터 인터페이스', type: 'switch' },
            ]
        },
        {
            id: 'cognitive',
            title: '인지적 접근성',
            icon: <AccessibilityIcon />,
            features: [
                { key: 'reducedMotion', label: '모션 감소', type: 'switch' },
                { key: 'focusIndicator', label: '포커스 표시', type: 'switch' },
                { key: 'altText', label: '대체 텍스트', type: 'switch' },
            ]
        }
    ];

    const renderFeatureControl = (feature: any) => {
        const value = settings[feature.key as keyof AccessibilitySettings];

        switch (feature.type) {
            case 'switch':
                return (
                    <Switch
                        checked={value as boolean}
                        onChange={(e) => handleSettingChange(feature.key, e.target.checked)}
                        color="primary"
                    />
                );
            case 'slider':
                return (
                    <Slider
                        value={value as number}
                        onChange={(_, newValue) => handleSettingChange(feature.key, newValue)}
                        min={feature.min}
                        max={feature.max}
                        step={feature.step || 1}
                        valueLabelDisplay="auto"
                        sx={{ width: 200 }}
                    />
                );
            case 'select':
                return (
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={value as string}
                            onChange={(e) => handleSettingChange(feature.key, e.target.value)}
                            size="small"
                        >
                            {feature.options.map((option: string) => (
                                <MenuItem key={option} value={option}>
                                    {option === 'none' ? '없음' :
                                        option === 'protanopia' ? '적색맹' :
                                            option === 'deuteranopia' ? '녹색맹' :
                                                option === 'tritanopia' ? '청색맹' : option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            default:
                return null;
        }
    };

    const quickActions = [
        { icon: <HighContrastIcon />, name: '고대비', action: () => handleSettingChange('highContrast', !settings.highContrast) },
        { icon: <ZoomInIcon />, name: '확대', action: () => handleSettingChange('fontSize', Math.min(settings.fontSize + 2, 24)) },
        { icon: <ZoomOutIcon />, name: '축소', action: () => handleSettingChange('fontSize', Math.max(settings.fontSize - 2, 12)) },
        { icon: <VolumeUpIcon />, name: '음성', action: () => handleSettingChange('screenReader', !settings.screenReader) },
        { icon: <KeyboardIcon />, name: '키보드', action: () => handleSettingChange('keyboardNavigation', !settings.keyboardNavigation) },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Container maxWidth="xl">
                {/* 헤더 */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <AccessibilityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        접근성 개선 시스템
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        모든 사용자가 편리하게 사용할 수 있는 포용적 디자인
                    </Typography>
                </Box>

                {/* 접근성 점수 카드 */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5">접근성 점수</Typography>
                            <Chip
                                label={`${accessibilityScore}/100`}
                                color={accessibilityScore >= 90 ? 'success' : accessibilityScore >= 70 ? 'warning' : 'error'}
                                icon={<CheckCircleIcon />}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={accessibilityScore}
                                    sx={{ height: 10, borderRadius: 5 }}
                                    color={accessibilityScore >= 90 ? 'success' : accessibilityScore >= 70 ? 'warning' : 'error'}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {accessibilityScore >= 90 ? '우수' : accessibilityScore >= 70 ? '양호' : '개선 필요'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* 접근성 기능 그리드 */}
                <Grid container spacing={3}>
                    {accessibilityFeatures.map((category) => (
                        <Grid item xs={12} md={6} key={category.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        {category.icon}
                                        <Typography variant="h6" sx={{ ml: 1 }}>
                                            {category.title}
                                        </Typography>
                                    </Box>
                                    <List>
                                        {category.features.map((feature, index) => (
                                            <ListItem key={feature.key} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                                    <Typography variant="body1">{feature.label}</Typography>
                                                    {renderFeatureControl(feature)}
                                                </Box>
                                                {index < category.features.length - 1 && <Divider sx={{ width: '100%' }} />}
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* 접근성 가이드라인 */}
                <Card sx={{ mt: 4 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            WCAG 2.1 가이드라인 준수 현황
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                    <Typography variant="h6">Level A</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        기본 접근성 요구사항
                                    </Typography>
                                    <Chip label="100%" color="success" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                    <Typography variant="h6">Level AA</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        향상된 접근성 요구사항
                                    </Typography>
                                    <Chip label="95%" color="success" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                                    <Typography variant="h6">Level AAA</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        최고 수준 접근성 요구사항
                                    </Typography>
                                    <Chip label="85%" color="warning" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <InfoIcon sx={{ fontSize: 40, color: 'info.main' }} />
                                    <Typography variant="h6">전체 점수</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        종합 접근성 평가
                                    </Typography>
                                    <Chip label={`${accessibilityScore}%`} color="info" size="small" sx={{ mt: 1 }} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* 고급 접근성 기능 */}
                <Card sx={{ mt: 4 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            고급 접근성 기능
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">음성 제어 시스템</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            음성 명령을 통해 모든 기능을 제어할 수 있습니다.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleSettingChange('voiceControl', !settings.voiceControl)}
                                            startIcon={<VolumeUpIcon />}
                                        >
                                            {settings.voiceControl ? '음성 제어 비활성화' : '음성 제어 활성화'}
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">시선 추적 시스템</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            시선 움직임을 감지하여 마우스 없이도 인터페이스를 제어할 수 있습니다.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleSettingChange('eyeTracking', !settings.eyeTracking)}
                                            startIcon={<VisibilityIcon />}
                                        >
                                            {settings.eyeTracking ? '시선 추적 비활성화' : '시선 추적 활성화'}
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">뇌-컴퓨터 인터페이스</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            뇌파 신호를 통해 직접 컴퓨터를 제어할 수 있는 최첨단 기술입니다.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleSettingChange('brainComputerInterface', !settings.brainComputerInterface)}
                                            startIcon={<AccessibilityIcon />}
                                        >
                                            {settings.brainComputerInterface ? 'BCI 비활성화' : 'BCI 활성화'}
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">개인화된 접근성 프로필</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            사용자의 개인적인 접근성 요구사항에 맞춘 맞춤형 설정을 저장하고 관리합니다.
                                        </Typography>
                                        <Button variant="contained" startIcon={<SettingsIcon />}>
                                            프로필 관리
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* SpeedDial */}
                <SpeedDial
                    ariaLabel="빠른 접근성 도구"
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

export default AccessibilityEnhancementSystem;
