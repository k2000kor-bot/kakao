import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    AlertTitle,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Input,
    InputAdornment,
    IconButton,
    Link,
    CircularProgress,
    Divider,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    Security,
    Google,
    Facebook,
    Apple
} from '@mui/icons-material';
import securityService from '../../services/securityService';
import { errorLogger } from '../../utils/errorLogger';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface AuthenticationFormProps {
    onAuthenticated?: () => void;
}

const AuthenticationForm: React.FC<AuthenticationFormProps> = ({ onAuthenticated: _onAuthenticated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 로그인 폼 상태
    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    // 회원가입 폼 상태
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    // 비밀번호 재설정 폼 상태
    const [resetData, setResetData] = useState({
        email: ''
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError(null);
        setSuccess(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await securityService.login(loginData.username, loginData.password);

            if (result.success) {
                setSuccess('로그인에 성공했습니다!');
                // 로그인 성공 후 리다이렉트 또는 상태 업데이트
                window.location.reload();
            } else {
                setError(result.error || '로그인에 실패했습니다.');
            }
        } catch (error) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (registerData.password !== registerData.confirmPassword) {
                setError('비밀번호가 일치하지 않습니다.');
                return;
            }

            if (!registerData.agreeToTerms) {
                setError('이용약관에 동의해주세요.');
                return;
            }

            const result = await securityService.register(registerData);

            if (result.success) {
                setSuccess('회원가입이 완료되었습니다! 로그인해주세요.');
                setActiveTab(0); // 로그인 탭으로 이동
            } else {
                setError(result.error || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await securityService.resetPassword(resetData.email);

            if (result.success) {
                setSuccess('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
            } else {
                setError(result.error || '비밀번호 재설정에 실패했습니다.');
            }
        } catch (error) {
            setError('비밀번호 재설정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        // 소셜 로그인 구현
        errorLogger.info(`${provider} 로그인 시도`, { component: 'AuthenticationForm', action: 'handleSocialLogin', provider });
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'var(--app-vh-min)',
            background: 'linear-gradient(135deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
            p: 2
        }}>
            <Card sx={{
                maxWidth: 500,
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <CardContent sx={{ p: 0 }}>
                    {/* 헤더 */}
                    <Box sx={{
                        background: 'linear-gradient(45deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                        color: 'white',
                        p: 3,
                        textAlign: 'center'
                    }}>
                        <Security sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            CORBU AI
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            안전하고 스마트한 AI 플랫폼
                        </Typography>
                    </Box>

                    {/* 탭 네비게이션 */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                            <Tab label="로그인" />
                            <Tab label="회원가입" />
                            <Tab label="비밀번호 재설정" />
                        </Tabs>
                    </Box>

                    {/* 알림 메시지 */}
                    {error && (
                        <Alert severity="error" sx={{ m: 2 }}>
                            <AlertTitle>오류</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ m: 2 }}>
                            <AlertTitle>성공</AlertTitle>
                            {success}
                        </Alert>
                    )}

                    {/* 로그인 탭 */}
                    <TabPanel value={activeTab} index={0}>
                        <form onSubmit={handleLogin}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="login-username">사용자명</InputLabel>
                                    <Input
                                        id="login-username"
                                        value={loginData.username}
                                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Person />
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="login-password">비밀번호</InputLabel>
                                    <Input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Lock />
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={loginData.rememberMe}
                                                onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                                            />
                                        }
                                        label="로그인 상태 유지"
                                    />
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => setActiveTab(2)}
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        background: 'linear-gradient(45deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                                        py: 1.5,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
                                </Button>
                            </Box>
                        </form>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                또는
                            </Typography>
                        </Divider>

                        {/* 소셜 로그인 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Google />}
                                onClick={() => handleSocialLogin('google')}
                                fullWidth
                            >
                                Google로 로그인
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Facebook />}
                                onClick={() => handleSocialLogin('facebook')}
                                fullWidth
                            >
                                Facebook으로 로그인
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Apple />}
                                onClick={() => handleSocialLogin('apple')}
                                fullWidth
                            >
                                Apple로 로그인
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* 회원가입 탭 */}
                    <TabPanel value={activeTab} index={1}>
                        <form onSubmit={handleRegister}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="register-username">사용자명</InputLabel>
                                    <Input
                                        id="register-username"
                                        value={registerData.username}
                                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Person />
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="register-email">이메일</InputLabel>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="register-password">비밀번호</InputLabel>
                                    <Input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Lock />
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="register-confirm-password">비밀번호 확인</InputLabel>
                                    <Input
                                        id="register-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Lock />
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={registerData.agreeToTerms}
                                            onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            <Link href="#" target="_blank">이용약관</Link> 및{' '}
                                            <Link href="#" target="_blank">개인정보처리방침</Link>에 동의합니다.
                                        </Typography>
                                    }
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        background: 'linear-gradient(45deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                                        py: 1.5,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
                                </Button>
                            </Box>
                        </form>
                    </TabPanel>

                    {/* 비밀번호 재설정 탭 */}
                    <TabPanel value={activeTab} index={2}>
                        <form onSubmit={handlePasswordReset}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                                </Typography>

                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel htmlFor="reset-email">이메일</InputLabel>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        value={resetData.email}
                                        onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        }
                                        required
                                    />
                                </FormControl>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isLoading}
                                    sx={{
                                        background: 'linear-gradient(45deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                                        py: 1.5,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : '재설정 링크 전송'}
                                </Button>

                                <Button
                                    variant="text"
                                    onClick={() => setActiveTab(0)}
                                    sx={{ mt: 1 }}
                                >
                                    로그인으로 돌아가기
                                </Button>
                            </Box>
                        </form>
                    </TabPanel>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AuthenticationForm;
