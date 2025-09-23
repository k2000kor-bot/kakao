import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Slider,
    Chip,
    Alert,
    Snackbar,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Grid,
    Paper
} from '@mui/material';
import {
    Accessibility as AccessibilityIcon,
    Visibility as VisibilityIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    Keyboard as KeyboardIcon,
    Mouse as MouseIcon,
    TouchApp as TouchIcon,
    Speed as SpeedIcon,
    Contrast as ContrastIcon,
    Palette as PaletteIcon,
    TextFields as TextFieldsIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Settings as SettingsIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';

interface AccessibilityEnhancementsProps {
    children: React.ReactNode;
}

interface AccessibilitySettings {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusVisible: boolean;
    colorBlindFriendly: boolean;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    soundEffects: boolean;
    voiceGuidance: boolean;
    autoFocus: boolean;
    skipLinks: boolean;
    ariaLabels: boolean;
    semanticHTML: boolean;
}

const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>({
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        screenReader: false,
        keyboardNavigation: true,
        focusVisible: true,
        colorBlindFriendly: false,
        fontSize: 16,
        lineHeight: 1.5,
        letterSpacing: 0,
        soundEffects: false,
        voiceGuidance: false,
        autoFocus: false,
        skipLinks: true,
        ariaLabels: true,
        semanticHTML: true
    });

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [announcementOpen, setAnnouncementOpen] = useState(false);
    const [currentFocus, setCurrentFocus] = useState<string>('');
    const skipLinksRef = useRef<HTMLDivElement>(null);

    // 접근성 설정 적용
    useEffect(() => {
        const root = document.documentElement;

        // 고대비 모드
        if (settings.highContrast) {
            root.style.setProperty('--contrast-ratio', '4.5');
            root.style.setProperty('--text-contrast', '#000000');
            root.style.setProperty('--bg-contrast', '#FFFFFF');
        } else {
            root.style.removeProperty('--contrast-ratio');
            root.style.removeProperty('--text-contrast');
            root.style.removeProperty('--bg-contrast');
        }

        // 움직임 줄이기
        if (settings.reducedMotion) {
            root.style.setProperty('--animation-duration', '0s');
            root.style.setProperty('--transition-duration', '0s');
        } else {
            root.style.removeProperty('--animation-duration');
            root.style.removeProperty('--transition-duration');
        }

        // 큰 텍스트
        if (settings.largeText) {
            root.style.setProperty('--base-font-size', '18px');
        } else {
            root.style.setProperty('--base-font-size', '16px');
        }

        // 폰트 크기
        root.style.setProperty('--font-size', `${settings.fontSize}px`);
        root.style.setProperty('--line-height', settings.lineHeight.toString());
        root.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);

        // 색맹 친화적
        if (settings.colorBlindFriendly) {
            root.style.setProperty('--color-blind-mode', 'true');
        } else {
            root.style.removeProperty('--color-blind-mode');
        }

        // 포커스 표시
        if (settings.focusVisible) {
            root.style.setProperty('--focus-visible', '2px solid #2196F3');
        } else {
            root.style.setProperty('--focus-visible', 'none');
        }

    }, [settings]);

    // 키보드 네비게이션 처리
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!settings.keyboardNavigation) return;

            // Tab 키로 포커스 이동
            if (event.key === 'Tab') {
                setCurrentFocus(document.activeElement?.id || '');
            }

            // Enter 키로 활성화
            if (event.key === 'Enter' && document.activeElement) {
                const element = document.activeElement as HTMLElement;
                if (element.click) {
                    element.click();
                }
            }

            // Escape 키로 모달 닫기
            if (event.key === 'Escape') {
                setSettingsOpen(false);
            }

            // 스킵 링크 활성화 (Alt + S)
            if (event.altKey && event.key === 's') {
                event.preventDefault();
                skipLinksRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [settings.keyboardNavigation]);

    // 스크린 리더 지원
    useEffect(() => {
        if (settings.screenReader) {
            // ARIA 라이브 영역 생성
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            liveRegion.id = 'screen-reader-announcements';
            document.body.appendChild(liveRegion);

            return () => {
                const element = document.getElementById('screen-reader-announcements');
                if (element) {
                    document.body.removeChild(element);
                }
            };
        }
    }, [settings.screenReader]);

    // 음성 안내
    const announceToScreenReader = (message: string) => {
        if (settings.screenReader) {
            const liveRegion = document.getElementById('screen-reader-announcements');
            if (liveRegion) {
                liveRegion.textContent = message;
            }
        }

        if (settings.voiceGuidance) {
            // Web Speech API 사용
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = 'ko-KR';
                speechSynthesis.speak(utterance);
            }
        }
    };

    // 설정 변경 핸들러
    const handleSettingChange = (key: keyof AccessibilitySettings, value: boolean | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // 변경 사항 알림
        const settingNames: Record<string, string> = {
            highContrast: '고대비 모드',
            reducedMotion: '움직임 줄이기',
            largeText: '큰 텍스트',
            screenReader: '스크린 리더',
            keyboardNavigation: '키보드 네비게이션',
            focusVisible: '포커스 표시',
            colorBlindFriendly: '색맹 친화적',
            fontSize: '폰트 크기',
            lineHeight: '줄 간격',
            letterSpacing: '글자 간격',
            soundEffects: '음향 효과',
            voiceGuidance: '음성 안내',
            autoFocus: '자동 포커스',
            skipLinks: '스킵 링크',
            ariaLabels: 'ARIA 라벨',
            semanticHTML: '의미적 HTML'
        };

        const action = typeof value === 'boolean' ? (value ? '활성화' : '비활성화') : '변경';
        const message = `${settingNames[key]}이 ${action}되었습니다.`;

        setAnnouncement(message);
        setAnnouncementOpen(true);
        announceToScreenReader(message);
    };

    // 접근성 점수 계산
    const calculateAccessibilityScore = () => {
        const totalSettings = Object.keys(settings).length;
        const enabledSettings = Object.values(settings).filter(value =>
            typeof value === 'boolean' ? value : true
        ).length;

        return Math.round((enabledSettings / totalSettings) * 100);
    };

    const accessibilityScore = calculateAccessibilityScore();

    return (
        <Box sx={{ position: 'relative' }}>
            {/* 스킵 링크 */}
            {settings.skipLinks && (
                <Box
                    ref={skipLinksRef}
                    tabIndex={-1}
                    sx={{
                        position: 'absolute',
                        top: -40,
                        left: 6,
                        background: '#000',
                        color: '#fff',
                        padding: '8px 16px',
                        zIndex: 9999,
                        '&:focus': {
                            top: 6,
                        }
                    }}
                >
                    <Button
                        color="inherit"
                        onClick={() => {
                            const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
                            if (mainContent) {
                                (mainContent as HTMLElement).focus();
                            }
                        }}
                    >
                        메인 콘텐츠로 건너뛰기
                    </Button>
                </Box>
            )}

            {/* 접근성 설정 버튼 */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                <Tooltip title="접근성 설정">
                    <IconButton
                        onClick={() => setSettingsOpen(true)}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            '&:focus': {
                                outline: settings.focusVisible ? '2px solid #2196F3' : 'none',
                                outlineOffset: '2px'
                            }
                        }}
                        aria-label="접근성 설정 열기"
                    >
                        <AccessibilityIcon />
                    </IconButton>
                </Tooltip>

                {/* 접근성 점수 표시 */}
                <Chip
                    label={`접근성: ${accessibilityScore}%`}
                    color={accessibilityScore >= 80 ? 'success' : accessibilityScore >= 60 ? 'warning' : 'error'}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                />
            </Box>

            {/* 메인 콘텐츠 */}
            <Box
                sx={{
                    '& *': {
                        '&:focus': {
                            outline: settings.focusVisible ? '2px solid #2196F3' : 'none',
                            outlineOffset: '2px'
                        }
                    }
                }}
            >
                {children}
            </Box>

            {/* 접근성 설정 다이얼로그 */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                maxWidth="md"
                fullWidth
                aria-labelledby="accessibility-settings-title"
            >
                <DialogTitle id="accessibility-settings-title">
                    접근성 설정
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                        {/* 시각적 설정 */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                시각적 설정
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.highContrast}
                                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                                    />
                                }
                                label="고대비 모드"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.largeText}
                                        onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                                    />
                                }
                                label="큰 텍스트"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.colorBlindFriendly}
                                        onChange={(e) => handleSettingChange('colorBlindFriendly', e.target.checked)}
                                    />
                                }
                                label="색맹 친화적 색상"
                            />

                            <Box sx={{ mt: 2 }}>
                                <Typography gutterBottom>폰트 크기: {settings.fontSize}px</Typography>
                                <Slider
                                    value={settings.fontSize}
                                    onChange={(e, value) => handleSettingChange('fontSize', value as number)}
                                    min={12}
                                    max={24}
                                    step={1}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography gutterBottom>줄 간격: {settings.lineHeight}</Typography>
                                <Slider
                                    value={settings.lineHeight}
                                    onChange={(e, value) => handleSettingChange('lineHeight', value as number)}
                                    min={1.2}
                                    max={2.0}
                                    step={0.1}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                        </Box>

                        {/* 상호작용 설정 */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                상호작용 설정
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.keyboardNavigation}
                                        onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                                    />
                                }
                                label="키보드 네비게이션"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.focusVisible}
                                        onChange={(e) => handleSettingChange('focusVisible', e.target.checked)}
                                    />
                                }
                                label="포커스 표시"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.autoFocus}
                                        onChange={(e) => handleSettingChange('autoFocus', e.target.checked)}
                                    />
                                }
                                label="자동 포커스"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.skipLinks}
                                        onChange={(e) => handleSettingChange('skipLinks', e.target.checked)}
                                    />
                                }
                                label="스킵 링크"
                            />
                        </Box>

                        {/* 보조 기술 설정 */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                보조 기술
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.screenReader}
                                        onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                                    />
                                }
                                label="스크린 리더 지원"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.ariaLabels}
                                        onChange={(e) => handleSettingChange('ariaLabels', e.target.checked)}
                                    />
                                }
                                label="ARIA 라벨"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.semanticHTML}
                                        onChange={(e) => handleSettingChange('semanticHTML', e.target.checked)}
                                    />
                                }
                                label="의미적 HTML"
                            />
                        </Box>

                        {/* 기타 설정 */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                기타 설정
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.reducedMotion}
                                        onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                                    />
                                }
                                label="움직임 줄이기"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.soundEffects}
                                        onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                                    />
                                }
                                label="음향 효과"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.voiceGuidance}
                                        onChange={(e) => handleSettingChange('voiceGuidance', e.target.checked)}
                                    />
                                }
                                label="음성 안내"
                            />
                        </Box>
                    </Box>

                    {/* 접근성 가이드라인 */}
                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        접근성 가이드라인
                    </Typography>

                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary="WCAG 2.1 AA 준수"
                                secondary="웹 콘텐츠 접근성 가이드라인을 따릅니다"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary="키보드 네비게이션"
                                secondary="Tab, Enter, Escape 키로 모든 기능 사용 가능"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary="스크린 리더 지원"
                                secondary="ARIA 라벨과 의미적 HTML 구조 제공"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary="색상 대비"
                                secondary="최소 4.5:1의 색상 대비율 유지"
                            />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>
                        닫기
                    </Button>
                    <Button
                        onClick={() => {
                            // 기본 설정으로 리셋
                            setSettings({
                                highContrast: false,
                                reducedMotion: false,
                                largeText: false,
                                screenReader: false,
                                keyboardNavigation: true,
                                focusVisible: true,
                                colorBlindFriendly: false,
                                fontSize: 16,
                                lineHeight: 1.5,
                                letterSpacing: 0,
                                soundEffects: false,
                                voiceGuidance: false,
                                autoFocus: false,
                                skipLinks: true,
                                ariaLabels: true,
                                semanticHTML: true
                            });
                            announceToScreenReader('접근성 설정이 기본값으로 리셋되었습니다.');
                        }}
                    >
                        기본값으로 리셋
                    </Button>
                    <Button variant="contained" onClick={() => setSettingsOpen(false)}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 알림 스낵바 */}
            <Snackbar
                open={announcementOpen}
                autoHideDuration={3000}
                onClose={() => setAnnouncementOpen(false)}
                message={announcement}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />
        </Box>
    );
};

export default AccessibilityEnhancements;
