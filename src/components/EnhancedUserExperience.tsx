import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { errorLogger } from '../utils/errorLogger';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Avatar,
    Badge,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Rating,
    Divider
} from '@mui/material';
import {
    Person,
    Settings,
    Notifications,
    Accessibility,
    Palette,
    Language,
    Speed,
    Memory,
    NetworkCheck,
    Storage,
    TrendingUp,
    Monitor,
    Analytics,
    AutoAwesome,
    SmartToy,
    Psychology,
    Lightbulb,
    Star,
    Favorite,
    Bookmark,
    Share,
    Download,
    Upload,
    Refresh,
    PlayArrow,
    Pause,
    Stop,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,
    Info
} from '@mui/icons-material';

interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: number;
    animations: boolean;
    sounds: boolean;
    notifications: boolean;
    accessibility: {
        highContrast: boolean;
        reducedMotion: boolean;
        screenReader: boolean;
        keyboardNavigation: boolean;
    };
    performance: {
        enableCaching: boolean;
        enableCompression: boolean;
        enableLazyLoading: boolean;
        enableVirtualization: boolean;
    };
}

interface UserActivity {
    id: string;
    type: 'login' | 'action' | 'achievement' | 'error';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
}

interface UserStats {
    totalSessions: number;
    totalTime: number;
    favoriteFeatures: string[];
    achievements: number;
    productivity: number;
    satisfaction: number;
}

function EnhancedUserExperience() {
    const [activeTab, setActiveTab] = useState(0);
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'auto',
        language: 'ko',
        fontSize: 14,
        animations: true,
        sounds: true,
        notifications: true,
        accessibility: {
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true
        },
        performance: {
            enableCaching: true,
            enableCompression: true,
            enableLazyLoading: true,
            enableVirtualization: true
        }
    });

    const [userStats, setUserStats] = useState<UserStats>({
        totalSessions: 45,
        totalTime: 1250,
        favoriteFeatures: ['AI 분석', '프로젝트 관리', '실시간 협업'],
        achievements: 12,
        productivity: 85,
        satisfaction: 4.5
    });

    const [activities, setActivities] = useState<UserActivity[]>([
        {
            id: '1',
            type: 'achievement',
            title: 'AI 마스터 달성',
            description: 'AI 분석 기능을 100번 사용했습니다.',
            timestamp: '2024-01-27T10:30:00Z',
            icon: '🏆',
            color: 'success'
        },
        {
            id: '2',
            type: 'action',
            title: '프로젝트 생성',
            description: '새로운 프로젝트를 생성했습니다.',
            timestamp: '2024-01-27T09:15:00Z',
            icon: '📁',
            color: 'info'
        },
        {
            id: '3',
            type: 'login',
            title: '로그인',
            description: '시스템에 로그인했습니다.',
            timestamp: '2024-01-27T08:45:00Z',
            icon: '🔐',
            color: 'primary'
        }
    ]);

    const [onboardingStep, setOnboardingStep] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [feedback, setFeedback] = useState({
        rating: 0,
        comment: '',
        category: 'general'
    });

    // 사용자 선호도 저장
    const savePreferences = useCallback(async () => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            const data = await response.json();

            if (data.success) {
                // 로컬 스토리지에도 저장
                localStorage.setItem('userPreferences', JSON.stringify(preferences));
            }
        } catch (error: unknown) {
            errorLogger.error('선호도 저장 실패', error, {
                component: 'EnhancedUserExperience',
                action: 'savePreferences',
            });
        }
    }, [preferences]);

    // 사용자 통계 업데이트
    const updateUserStats = useCallback(async () => {
        try {
            const response = await fetch('/api/user/stats');
            const data = await response.json();

            if (data.success) {
                setUserStats(data.stats);
            }
        } catch (error: unknown) {
            errorLogger.error('사용자 통계 업데이트 실패', error, {
                component: 'EnhancedUserExperience',
                action: 'updateUserStats',
            });
        }
    }, []);

    // 피드백 제출
    const submitFeedback = useCallback(async () => {
        try {
            const response = await fetch('/api/user/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });

            const data = await response.json();

            if (data.success) {
                setFeedback({ rating: 0, comment: '', category: 'general' });
                // 피드백 제출 성공 알림
            }
        } catch (error: unknown) {
            errorLogger.error('피드백 제출 실패', error, {
                component: 'EnhancedUserExperience',
                action: 'submitFeedback',
            });
        }
    }, [feedback]);

    // 온보딩 완료
    const completeOnboarding = useCallback(() => {
        setShowOnboarding(false);
        localStorage.setItem('onboardingCompleted', 'true');
    }, []);

    // 선호도 변경 핸들러
    const handlePreferenceChange = useCallback((key: string, value: any) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // 접근성 설정 변경 핸들러
    const handleAccessibilityChange = useCallback((key: string, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            accessibility: {
                ...prev.accessibility,
                [key]: value
            }
        }));
    }, []);

    // 성능 설정 변경 핸들러
    const handlePerformanceChange = useCallback((key: string, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            performance: {
                ...prev.performance,
                [key]: value
            }
        }));
    }, []);

    // 초기화
    useEffect(() => {
        // 로컬 스토리지에서 선호도 로드
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences));
        }

        // 온보딩 상태 확인
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (!onboardingCompleted) {
            setShowOnboarding(true);
        }

        // 사용자 통계 업데이트
        updateUserStats();
    }, [updateUserStats]);

    // 선호도 변경 시 자동 저장
    useEffect(() => {
        const timer = setTimeout(() => {
            savePreferences();
        }, 1000);

        return () => clearTimeout(timer);
    }, [preferences, savePreferences]);

    const renderProfileTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                사용자 프로필
            </Typography>

            {/* 사용자 정보 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                            <Person fontSize="large" />
                        </Avatar>
                        <Box>
                            <Typography variant="h5">사용자</Typography>
                            <Typography variant="body2" color="text.secondary">
                                CORBU AI 사용자
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip label="프리미엄" color="primary" size="small" />
                                <Chip label="베타 테스터" color="secondary" size="small" />
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 사용자 통계 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Monitor color="primary" />
                                <Typography variant="h6">총 세션</Typography>
                            </Box>
                            <Typography variant="h4" color="primary.main">
                                {userStats.totalSessions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Speed color="secondary" />
                                <Typography variant="h6">총 시간</Typography>
                            </Box>
                            <Typography variant="h4" color="secondary.main">
                                {userStats.totalTime}분
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Star color="warning" />
                                <Typography variant="h6">성취</Typography>
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {userStats.achievements}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp color="success" />
                                <Typography variant="h6">생산성</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {userStats.productivity}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 만족도 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>서비스 만족도</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating value={userStats.satisfaction} readOnly precision={0.1} />
                        <Typography variant="h6">{userStats.satisfaction}/5</Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* 즐겨찾기 기능 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>즐겨찾기 기능</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {userStats.favoriteFeatures.map((feature, index) => (
                            <Chip key={index} label={feature} color="primary" />
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );

    const renderPreferencesTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="secondary" />
                사용자 설정
            </Typography>

            {/* 일반 설정 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>일반 설정</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>테마</InputLabel>
                                <Select
                                    value={preferences.theme}
                                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                    label="테마"
                                >
                                    <MenuItem value="light">라이트</MenuItem>
                                    <MenuItem value="dark">다크</MenuItem>
                                    <MenuItem value="auto">자동</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>언어</InputLabel>
                                <Select
                                    value={preferences.language}
                                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                    label="언어"
                                >
                                    <MenuItem value="ko">한국어</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="ja">日本語</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>폰트 크기: {preferences.fontSize}px</Typography>
                            <Slider
                                value={preferences.fontSize}
                                onChange={(_, value) => handlePreferenceChange('fontSize', value)}
                                min={12}
                                max={20}
                                step={1}
                                marks={[
                                    { value: 12, label: '12px' },
                                    { value: 16, label: '16px' },
                                    { value: 20, label: '20px' }
                                ]}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={preferences.animations}
                                            onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                                        />
                                    }
                                    label="애니메이션"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={preferences.sounds}
                                            onChange={(e) => handlePreferenceChange('sounds', e.target.checked)}
                                        />
                                    }
                                    label="사운드"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={preferences.notifications}
                                            onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                                        />
                                    }
                                    label="알림"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 접근성 설정 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Accessibility color="info" />
                        접근성 설정
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.accessibility.highContrast}
                                        onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                                    />
                                }
                                label="고대비 모드"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.accessibility.reducedMotion}
                                        onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
                                    />
                                }
                                label="움직임 줄이기"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.accessibility.screenReader}
                                        onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                                    />
                                }
                                label="스크린 리더 지원"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.accessibility.keyboardNavigation}
                                        onChange={(e) => handleAccessibilityChange('keyboardNavigation', e.target.checked)}
                                    />
                                }
                                label="키보드 네비게이션"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 성능 설정 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed color="warning" />
                        성능 설정
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.performance.enableCaching}
                                        onChange={(e) => handlePerformanceChange('enableCaching', e.target.checked)}
                                    />
                                }
                                label="캐싱 활성화"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.performance.enableCompression}
                                        onChange={(e) => handlePerformanceChange('enableCompression', e.target.checked)}
                                    />
                                }
                                label="압축 활성화"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.performance.enableLazyLoading}
                                        onChange={(e) => handlePerformanceChange('enableLazyLoading', e.target.checked)}
                                    />
                                }
                                label="지연 로딩"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preferences.performance.enableVirtualization}
                                        onChange={(e) => handlePerformanceChange('enableVirtualization', e.target.checked)}
                                    />
                                }
                                label="가상화"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    const renderActivityTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="info" />
                활동 기록
            </Typography>

            <List>
                {activities.map((activity) => (
                    <ListItem key={activity.id}>
                        <ListItemIcon>
                            <Box sx={{ fontSize: '2rem' }}>{activity.icon}</Box>
                        </ListItemIcon>
                        <ListItemText
                            primary={activity.title}
                            secondary={
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {activity.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </Typography>
                                </Box>
                            }
                        />
                        <Chip
                            label={activity.type}
                            color={activity.color as any}
                            size="small"
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const renderFeedbackTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="warning" />
                피드백 및 제안
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>서비스 피드백</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>만족도 평가</Typography>
                            <Rating
                                value={feedback.rating}
                                onChange={(_, value) => setFeedback(prev => ({ ...prev, rating: value || 0 }))}
                                size="large"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>카테고리</InputLabel>
                                <Select
                                    value={feedback.category}
                                    onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                                    label="카테고리"
                                >
                                    <MenuItem value="general">일반</MenuItem>
                                    <MenuItem value="feature">기능</MenuItem>
                                    <MenuItem value="performance">성능</MenuItem>
                                    <MenuItem value="ui">사용자 인터페이스</MenuItem>
                                    <MenuItem value="bug">버그</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="의견 및 제안"
                                value={feedback.comment}
                                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="서비스에 대한 의견이나 개선 제안을 입력해주세요..."
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Button
                                variant="contained"
                                onClick={submitFeedback}
                                disabled={!feedback.rating || !feedback.comment.trim()}
                                startIcon={<Lightbulb />}
                            >
                                피드백 제출
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="프로필" icon={<Person />} />
                    <Tab label="설정" icon={<Settings />} />
                    <Tab label="활동" icon={<Analytics />} />
                    <Tab label="피드백" icon={<Lightbulb />} />
                </Tabs>
            </Box>

            {activeTab === 0 && renderProfileTab()}
            {activeTab === 1 && renderPreferencesTab()}
            {activeTab === 2 && renderActivityTab()}
            {activeTab === 3 && renderFeedbackTab()}

            {/* 온보딩 다이얼로그 */}
            <Dialog open={showOnboarding} maxWidth="md" fullWidth>
                <DialogTitle>CORBU AI 환영합니다!</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={onboardingStep} orientation="vertical">
                        <Step>
                            <StepLabel>시작하기</StepLabel>
                            <StepContent>
                                <Typography>
                                    CORBU AI에 오신 것을 환영합니다! 이 가이드를 통해 주요 기능들을 알아보세요.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button onClick={() => setOnboardingStep(1)}>
                                        다음
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>AI 기능</StepLabel>
                            <StepContent>
                                <Typography>
                                    AI 분석, 예측, 인사이트 생성 등 다양한 AI 기능을 활용해보세요.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button onClick={() => setOnboardingStep(2)}>
                                        다음
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>프로젝트 관리</StepLabel>
                            <StepContent>
                                <Typography>
                                    프로젝트를 생성하고 관리하며, 팀과 협업할 수 있습니다.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button onClick={() => setOnboardingStep(3)}>
                                        다음
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>완료</StepLabel>
                            <StepContent>
                                <Typography>
                                    모든 설정이 완료되었습니다! 이제 CORBU AI를 자유롭게 사용해보세요.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button onClick={completeOnboarding} variant="contained">
                                        시작하기
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>
            </Dialog>
        </Paper>
    );
}

export default EnhancedUserExperience;
