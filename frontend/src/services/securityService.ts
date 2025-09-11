// CORBU AI 보안 서비스
// 인증, 권한 관리, 보안 모니터링을 담당하는 통합 보안 서비스

import axios, { AxiosInstance } from 'axios';

// ===== 보안 인터페이스 =====
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    permissions: string[];
    lastLogin?: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface SecurityEvent {
    id: string;
    type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity';
    userId?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    details: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityConfig {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    requireTwoFactor: boolean;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    encryptionEnabled: boolean;
    auditLogging: boolean;
}

// ===== 보안 서비스 클래스 =====
class SecurityService {
    private api: AxiosInstance;
    private baseURL: string;
    private currentUser: User | null = null;
    private authToken: AuthToken | null = null;
    private securityEvents: SecurityEvent[] = [];
    private config: SecurityConfig;

    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 기본 보안 설정
        this.config = {
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15분
            sessionTimeout: 30 * 60 * 1000, // 30분
            requireTwoFactor: false,
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
            },
            encryptionEnabled: true,
            auditLogging: true,
        };

        this.setupInterceptors();
        this.loadStoredAuth();
    }

    private setupInterceptors(): void {
        // 요청 인터셉터 - 토큰 자동 추가
        this.api.interceptors.request.use(
            (config) => {
                if (this.authToken) {
                    config.headers.Authorization = `Bearer ${this.authToken.accessToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터 - 토큰 만료 처리
        this.api.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                if (error.response?.status === 401 && this.authToken) {
                    // 토큰 만료 시 자동 갱신 시도
                    try {
                        await this.refreshToken();
                        // 원래 요청 재시도
                        return this.api.request(error.config);
                    } catch (refreshError) {
                        this.logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private loadStoredAuth(): void {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('currentUser');
            
            if (storedToken && storedUser) {
                this.authToken = JSON.parse(storedToken);
                this.currentUser = JSON.parse(storedUser);
            }
        } catch (error) {
            console.error('저장된 인증 정보 로드 실패:', error);
            this.clearStoredAuth();
        }
    }

    private clearStoredAuth(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.authToken = null;
        this.currentUser = null;
    }

    // ===== 인증 관련 메서드 =====
    async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            const response = await this.api.post('/api/auth/login', {
                username,
                password,
            });

            if (response.data.success) {
                this.authToken = response.data.data.token;
                this.currentUser = response.data.data.user;
                
                // 로컬 스토리지에 저장
                localStorage.setItem('authToken', JSON.stringify(this.authToken));
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                // 보안 이벤트 로깅
                if (this.currentUser) {
                    this.logSecurityEvent({
                        type: 'login',
                        userId: this.currentUser.id,
                        ipAddress: await this.getClientIP(),
                        userAgent: navigator.userAgent,
                        details: { username },
                        severity: 'low'
                    });
                }

                return { success: true, user: this.currentUser || undefined };
            } else {
                // 실패한 로그인 시도 로깅
                this.logSecurityEvent({
                    type: 'failed_login',
                    ipAddress: await this.getClientIP(),
                    userAgent: navigator.userAgent,
                    details: { username, reason: response.data.error },
                    severity: 'medium'
                });

                return { success: false, error: response.data.error };
            }
        } catch (error: any) {
            // 네트워크 오류 등 로깅
            this.logSecurityEvent({
                type: 'failed_login',
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent,
                details: { username, error: error.message },
                severity: 'medium'
            });

            return { success: false, error: '로그인 중 오류가 발생했습니다.' };
        }
    }

    async logout(): Promise<void> {
        try {
            if (this.authToken) {
                await this.api.post('/api/auth/logout', {
                    refreshToken: this.authToken.refreshToken,
                });

                // 보안 이벤트 로깅
                this.logSecurityEvent({
                    type: 'logout',
                    userId: this.currentUser?.id,
                    ipAddress: await this.getClientIP(),
                    userAgent: navigator.userAgent,
                    details: {},
                    severity: 'low'
                });
            }
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
        } finally {
            this.clearStoredAuth();
        }
    }

    async refreshToken(): Promise<boolean> {
        try {
            if (!this.authToken?.refreshToken) {
                throw new Error('리프레시 토큰이 없습니다.');
            }

            const response = await this.api.post('/api/auth/refresh', {
                refreshToken: this.authToken.refreshToken,
            });

            if (response.data.success) {
                this.authToken = response.data.data.token;
                localStorage.setItem('authToken', JSON.stringify(this.authToken));
                return true;
            } else {
                throw new Error('토큰 갱신 실패');
            }
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
            this.logout();
            return false;
        }
    }

    async register(userData: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
    }): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            // 비밀번호 정책 검증
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                return { success: false, error: passwordValidation.error };
            }

            if (userData.password !== userData.confirmPassword) {
                return { success: false, error: '비밀번호가 일치하지 않습니다.' };
            }

            const response = await this.api.post('/api/auth/register', userData);

            if (response.data.success) {
                return { success: true, user: response.data.data.user };
            } else {
                return { success: false, error: response.data.error };
            }
        } catch (error: any) {
            return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
        }
    }

    // ===== 권한 관리 =====
    hasPermission(permission: string): boolean {
        if (!this.currentUser) return false;
        return this.currentUser.permissions.includes(permission) || this.currentUser.role === 'admin';
    }

    hasRole(role: string): boolean {
        if (!this.currentUser) return false;
        return this.currentUser.role === role || this.currentUser.role === 'admin';
    }

    canAccess(resource: string, action: string): boolean {
        if (!this.currentUser) return false;
        
        // 관리자는 모든 권한
        if (this.currentUser.role === 'admin') return true;
        
        // 특정 권한 확인
        const requiredPermission = `${resource}:${action}`;
        return this.hasPermission(requiredPermission);
    }

    // ===== 보안 모니터링 =====
    async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
        const securityEvent: SecurityEvent = {
            ...event,
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        this.securityEvents.push(securityEvent);

        // 서버에 전송
        try {
            await this.api.post('/api/security/events', securityEvent);
        } catch (error) {
            console.error('보안 이벤트 로깅 실패:', error);
        }
    }

    async getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
        try {
            const response = await this.api.get(`/api/security/events?limit=${limit}`);
            return response.data.data || [];
        } catch (error) {
            console.error('보안 이벤트 조회 실패:', error);
            return this.securityEvents.slice(-limit);
        }
    }

    async getSecurityMetrics(): Promise<any> {
        try {
            const response = await this.api.get('/api/security/metrics');
            return response.data.data;
        } catch (error) {
            console.error('보안 메트릭 조회 실패:', error);
            return {
                totalEvents: this.securityEvents.length,
                failedLogins: this.securityEvents.filter(e => e.type === 'failed_login').length,
                suspiciousActivities: this.securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
            };
        }
    }

    // ===== 보안 설정 =====
    async getSecurityConfig(): Promise<SecurityConfig> {
        try {
            const response = await this.api.get('/api/security/config');
            if (response.data.success) {
                this.config = { ...this.config, ...response.data.data };
            }
        } catch (error) {
            console.error('보안 설정 조회 실패:', error);
        }
        return this.config;
    }

    async updateSecurityConfig(config: Partial<SecurityConfig>): Promise<boolean> {
        try {
            const response = await this.api.put('/api/security/config', config);
            if (response.data.success) {
                this.config = { ...this.config, ...config };
                return true;
            }
        } catch (error) {
            console.error('보안 설정 업데이트 실패:', error);
        }
        return false;
    }

    // ===== 유틸리티 메서드 =====
    private validatePassword(password: string): { isValid: boolean; error?: string } {
        const policy = this.config.passwordPolicy;

        if (password.length < policy.minLength) {
            return { isValid: false, error: `비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다.` };
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            return { isValid: false, error: '비밀번호에 대문자가 포함되어야 합니다.' };
        }

        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            return { isValid: false, error: '비밀번호에 소문자가 포함되어야 합니다.' };
        }

        if (policy.requireNumbers && !/\d/.test(password)) {
            return { isValid: false, error: '비밀번호에 숫자가 포함되어야 합니다.' };
        }

        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { isValid: false, error: '비밀번호에 특수문자가 포함되어야 합니다.' };
        }

        return { isValid: true };
    }

    private async getClientIP(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // ===== 공개 메서드 =====
    isAuthenticated(): boolean {
        return !!this.currentUser && !!this.authToken;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    getAuthToken(): AuthToken | null {
        return this.authToken;
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
            const passwordValidation = this.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return { success: false, error: passwordValidation.error };
            }

            const response = await this.api.post('/api/auth/change-password', {
                currentPassword,
                newPassword,
            });

            return { success: response.data.success, error: response.data.error };
        } catch (error: any) {
            return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' };
        }
    }

    async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await this.api.post('/api/auth/reset-password', { email });
            return { success: response.data.success, error: response.data.error };
        } catch (error: any) {
            return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' };
        }
    }

    // ===== 세션 관리 =====
    startSessionTimeout(): void {
        if (this.config.sessionTimeout > 0) {
            setTimeout(() => {
                if (this.isAuthenticated()) {
                    this.logout();
                }
            }, this.config.sessionTimeout);
        }
    }

    extendSession(): void {
        this.startSessionTimeout();
    }
}

// 싱글톤 인스턴스 생성
const securityService = new SecurityService();

export default securityService;
export { SecurityService };
