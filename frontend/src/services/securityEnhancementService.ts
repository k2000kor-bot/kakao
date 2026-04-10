import { EventEmitter } from 'events';

interface SecurityEvent {
    id: string;
    type: 'authentication' | 'authorization' | 'data_access' | 'api_call' | 'suspicious_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    source: string;
    target: string;
    details: Record<string, unknown>;
    status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
}

interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    type: 'access_control' | 'data_protection' | 'api_security' | 'monitoring';
    rules: SecurityRule[];
    enabled: boolean;
    lastUpdated: Date;
}

interface SecurityRule {
    id: string;
    name: string;
    condition: string;
    action: 'allow' | 'deny' | 'log' | 'alert';
    priority: number;
    enabled: boolean;
}

interface ThreatDetection {
    id: string;
    threatType: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'malware';
    confidence: number;
    source: string;
    target: string;
    timestamp: Date;
    details: Record<string, unknown>;
    status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
}

interface AccessControl {
    userId: string;
    resource: string;
    permission: 'read' | 'write' | 'execute' | 'admin';
    granted: boolean;
    timestamp: Date;
    expiresAt?: Date;
}

export class SecurityEnhancementService extends EventEmitter {
    private securityEvents: SecurityEvent[] = [];
    private securityPolicies: SecurityPolicy[] = [];
    private threatDetections: ThreatDetection[] = [];
    private accessControls: AccessControl[] = [];
    private isMonitoring: boolean = false;
    private monitoringInterval: NodeJS.Timeout | null = null;
    private policyCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.initializeSecurityPolicies();
        if (process.env.NODE_ENV !== 'test') {
            this.startSecurityMonitoring();
        }
    }

    private initializeSecurityPolicies(): void {
        this.securityPolicies = [
            {
                id: 'auth-policy-1',
                name: '인증 정책',
                description: '사용자 인증 및 세션 관리 정책',
                type: 'access_control',
                rules: [
                    {
                        id: 'rule-1',
                        name: '로그인 시도 제한',
                        condition: 'login_attempts > 5 in 5 minutes',
                        action: 'deny',
                        priority: 1,
                        enabled: true
                    },
                    {
                        id: 'rule-2',
                        name: '세션 타임아웃',
                        condition: 'session_idle_time > 30 minutes',
                        action: 'log',
                        priority: 2,
                        enabled: true
                    }
                ],
                enabled: true,
                lastUpdated: new Date()
            },
            {
                id: 'data-policy-1',
                name: '데이터 보호 정책',
                description: '민감한 데이터 접근 및 보호 정책',
                type: 'data_protection',
                rules: [
                    {
                        id: 'rule-3',
                        name: '민감한 데이터 접근 로깅',
                        condition: 'access_sensitive_data == true',
                        action: 'log',
                        priority: 1,
                        enabled: true
                    },
                    {
                        id: 'rule-4',
                        name: '데이터 암호화',
                        condition: 'data_type == "sensitive"',
                        action: 'allow',
                        priority: 1,
                        enabled: true
                    }
                ],
                enabled: true,
                lastUpdated: new Date()
            },
            {
                id: 'api-policy-1',
                name: 'API 보안 정책',
                description: 'API 엔드포인트 보안 및 접근 제어',
                type: 'api_security',
                rules: [
                    {
                        id: 'rule-5',
                        name: 'API 요청 제한',
                        condition: 'api_requests > 100 per minute',
                        action: 'deny',
                        priority: 1,
                        enabled: true
                    },
                    {
                        id: 'rule-6',
                        name: 'API 인증 확인',
                        condition: 'api_call without valid_token',
                        action: 'deny',
                        priority: 1,
                        enabled: true
                    }
                ],
                enabled: true,
                lastUpdated: new Date()
            }
        ];
    }

    private startSecurityMonitoring(): void {
        if (this.monitoringInterval != null) {
            return;
        }
        this.isMonitoring = true;

        // 보안 이벤트 모니터링
        this.monitoringInterval = setInterval(() => {
            this.performSecurityScan();
            this.detectThreats();
            this.analyzeAccessPatterns();
        }, 30000); // 30초마다 스캔

        // 정책 위반 감지
        this.policyCheckInterval = setInterval(() => {
            this.checkPolicyViolations();
        }, 60000); // 1분마다 정책 확인
    }

    /** `stopMonitoring()` 이후 모니터링 타이머를 다시 켭니다 */
    public resumeMonitoring(): void {
        this.startSecurityMonitoring();
    }

    // 보안 이벤트 로깅
    public logSecurityEvent(
        type: SecurityEvent['type'],
        severity: SecurityEvent['severity'],
        source: string,
        target: string,
        details: Record<string, unknown> = {}
    ): void {
        const event: SecurityEvent = {
            id: `security-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            timestamp: new Date(),
            source,
            target,
            details,
            status: 'detected'
        };

        this.securityEvents.push(event);
        this.emit('securityEvent', event);

        // 심각한 이벤트의 경우 즉시 알림
        if (severity === 'critical' || severity === 'high') {
            this.emit('securityAlert', event);
        }
    }

    // 인증 및 권한 확인
    public async authenticateUser(userId: string, credentials: Record<string, unknown>): Promise<{
        success: boolean;
        token?: string;
        permissions?: string[];
        error?: string;
    }> {
        try {
            // 인증 로직 시뮬레이션
            const isValid = await this.validateCredentials(userId, credentials);

            if (!isValid) {
                this.logSecurityEvent(
                    'authentication',
                    'medium',
                    userId,
                    'authentication_service',
                    { reason: 'invalid_credentials' }
                );
                return { success: false, error: 'Invalid credentials' };
            }

            // 토큰 생성
            const token = this.generateSecurityToken(userId);
            const permissions = await this.getUserPermissions(userId);

            this.logSecurityEvent(
                'authentication',
                'low',
                userId,
                'authentication_service',
                { success: true, permissions }
            );

            return {
                success: true,
                token,
                permissions
            };

        } catch (error) {
            this.logSecurityEvent(
                'authentication',
                'high',
                userId,
                'authentication_service',
                { error: error instanceof Error ? error.message : String(error) }
            );
            return { success: false, error: 'Authentication failed' };
        }
    }

    // 리소스 접근 권한 확인
    public async checkAccess(
        userId: string,
        resource: string,
        permission: AccessControl['permission']
    ): Promise<boolean> {
        try {
            const hasAccess = await this.validateAccess(userId, resource, permission);

            this.logSecurityEvent(
                'authorization',
                hasAccess ? 'low' : 'medium',
                userId,
                resource,
                { permission, granted: hasAccess }
            );

            // 접근 제어 기록
            this.accessControls.push({
                userId,
                resource,
                permission,
                granted: hasAccess,
                timestamp: new Date()
            });

            return hasAccess;

        } catch (error) {
            this.logSecurityEvent(
                'authorization',
                'high',
                userId,
                resource,
                { permission, error: error instanceof Error ? error.message : String(error) }
            );
            return false;
        }
    }

    // API 보안 검증
    public async validateApiRequest(
        endpoint: string,
        method: string,
        headers: Record<string, string>,
        body?: Record<string, unknown>
    ): Promise<{
        allowed: boolean;
        reason?: string;
        rateLimit?: { remaining: number; resetTime: Date };
    }> {
        try {
            // API 토큰 검증
            const token = headers.authorization?.replace('Bearer ', '');
            if (!token || !this.validateApiToken(token)) {
                this.logSecurityEvent(
                    'api_call',
                    'medium',
                    'unknown',
                    endpoint,
                    { method, reason: 'invalid_token' }
                );
                return { allowed: false, reason: 'Invalid or missing token' };
            }

            // 요청 제한 확인
            const rateLimit = await this.checkRateLimit(endpoint, token);
            if (!rateLimit.allowed) {
                this.logSecurityEvent(
                    'api_call',
                    'medium',
                    token,
                    endpoint,
                    { method, reason: 'rate_limit_exceeded' }
                );
                return { allowed: false, reason: 'Rate limit exceeded' };
            }

            // 입력 검증
            if (body && !this.validateInput(body)) {
                this.logSecurityEvent(
                    'api_call',
                    'high',
                    token,
                    endpoint,
                    { method, reason: 'invalid_input' }
                );
                return { allowed: false, reason: 'Invalid input detected' };
            }

            this.logSecurityEvent(
                'api_call',
                'low',
                token,
                endpoint,
                { method, success: true }
            );

            return {
                allowed: true,
                rateLimit: {
                    remaining: rateLimit.remaining,
                    resetTime: rateLimit.resetTime
                }
            };

        } catch (error) {
            this.logSecurityEvent(
                'api_call',
                'high',
                'unknown',
                endpoint,
                { method, error: error instanceof Error ? error.message : String(error) }
            );
            return { allowed: false, reason: 'Security validation failed' };
        }
    }

    // 위협 탐지
    private async detectThreats(): Promise<void> {
        // 브루트 포스 공격 탐지
        await this.detectBruteForce();

        // SQL 인젝션 탐지
        await this.detectSQLInjection();

        // XSS 공격 탐지
        await this.detectXSS();

        // DDoS 공격 탐지
        await this.detectDDoS();
    }

    private async detectBruteForce(): Promise<void> {
        // 최근 5분간의 실패한 로그인 시도 분석
        const recentFailedLogins = this.securityEvents.filter(event =>
            event.type === 'authentication' &&
            event.details.success === false &&
            event.timestamp > new Date(Date.now() - 5 * 60 * 1000)
        );

        // IP별 실패 횟수 계산
        const failedByIP = new Map<string, number>();
        recentFailedLogins.forEach(event => {
            const ip = event.source;
            failedByIP.set(ip, (failedByIP.get(ip) || 0) + 1);
        });

        // 5회 이상 실패한 IP 탐지
        failedByIP.forEach((count, ip) => {
            if (count >= 5) {
                const threat: ThreatDetection = {
                    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    threatType: 'brute_force',
                    confidence: Math.min(0.95, count / 10),
                    source: ip,
                    target: 'authentication_service',
                    timestamp: new Date(),
                    details: { failedAttempts: count },
                    status: 'detected'
                };

                this.threatDetections.push(threat);
                this.emit('threatDetected', threat);
            }
        });
    }

    private async detectSQLInjection(): Promise<void> {
        // SQL 인젝션 패턴 탐지 시뮬레이션
        const suspiciousPatterns = ['union select', 'drop table', 'insert into', 'delete from'];

        // 최근 API 요청에서 의심스러운 패턴 검색
        const recentApiCalls = this.securityEvents.filter(event =>
            event.type === 'api_call' &&
            event.timestamp > new Date(Date.now() - 10 * 60 * 1000)
        );

        recentApiCalls.forEach(event => {
            const body = String(event.details?.body ?? '');
            const hasSuspiciousPattern = suspiciousPatterns.some(pattern =>
                body.toLowerCase().includes(pattern)
            );

            if (hasSuspiciousPattern) {
                const threat: ThreatDetection = {
                    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    threatType: 'sql_injection',
                    confidence: 0.85,
                    source: event.source,
                    target: event.target,
                    timestamp: new Date(),
                    details: { suspiciousPattern: body },
                    status: 'detected'
                };

                this.threatDetections.push(threat);
                this.emit('threatDetected', threat);
            }
        });
    }

    private async detectXSS(): Promise<void> {
        // XSS 패턴 탐지 시뮬레이션
        // eslint-disable-next-line no-script-url -- XSS pattern string for detection, not execution
        const xssPatterns = ['<script>', 'javascript:', 'onload=', 'onerror='];

        const recentApiCalls = this.securityEvents.filter(event =>
            event.type === 'api_call' &&
            event.timestamp > new Date(Date.now() - 10 * 60 * 1000)
        );

        recentApiCalls.forEach(event => {
            const body = String(event.details?.body ?? '');
            const hasXSSPattern = xssPatterns.some(pattern =>
                body.toLowerCase().includes(pattern)
            );

            if (hasXSSPattern) {
                const threat: ThreatDetection = {
                    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    threatType: 'xss',
                    confidence: 0.80,
                    source: event.source,
                    target: event.target,
                    timestamp: new Date(),
                    details: { xssPattern: body },
                    status: 'detected'
                };

                this.threatDetections.push(threat);
                this.emit('threatDetected', threat);
            }
        });
    }

    private async detectDDoS(): Promise<void> {
        // DDoS 공격 탐지 시뮬레이션
        const recentRequests = this.securityEvents.filter(event =>
            event.type === 'api_call' &&
            event.timestamp > new Date(Date.now() - 1 * 60 * 1000) // 최근 1분
        );

        // IP별 요청 수 계산
        const requestsByIP = new Map<string, number>();
        recentRequests.forEach(event => {
            const ip = event.source;
            requestsByIP.set(ip, (requestsByIP.get(ip) || 0) + 1);
        });

        // 분당 100회 이상 요청하는 IP 탐지
        requestsByIP.forEach((count, ip) => {
            if (count >= 100) {
                const threat: ThreatDetection = {
                    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    threatType: 'ddos',
                    confidence: Math.min(0.95, count / 200),
                    source: ip,
                    target: 'api_endpoints',
                    timestamp: new Date(),
                    details: { requestCount: count },
                    status: 'detected'
                };

                this.threatDetections.push(threat);
                this.emit('threatDetected', threat);
            }
        });
    }

    // 보안 스캔
    private async performSecurityScan(): Promise<void> {
        // 시스템 보안 상태 스캔 시뮬레이션
        const vulnerabilities = await this.scanForVulnerabilities();

        if (vulnerabilities.length > 0) {
            vulnerabilities.forEach(vuln => {
                this.logSecurityEvent(
                    'suspicious_activity',
                    'medium',
                    'security_scanner',
                    String((vuln as Record<string, unknown>).target ?? ''),
                    { vulnerability: vuln }
                );
            });
        }
    }

    private async scanForVulnerabilities(): Promise<Record<string, unknown>[]> {
        // 취약점 스캔 시뮬레이션
        const vulnerabilities = [];

        // 시뮬레이션된 취약점
        if (Math.random() > 0.9) { // 10% 확률로 취약점 발견
            vulnerabilities.push({
                type: 'configuration_issue',
                severity: 'medium',
                target: 'api_endpoint',
                description: '보안 헤더 누락'
            });
        }

        return vulnerabilities;
    }

    // 정책 위반 확인
    private async checkPolicyViolations(): Promise<void> {
        this.securityPolicies.forEach(policy => {
            if (!policy.enabled) return;

            policy.rules.forEach(rule => {
                if (!rule.enabled) return;

                // 정책 위반 확인 로직 시뮬레이션
                const isViolated = this.evaluateRule(rule);

                if (isViolated) {
                    this.logSecurityEvent(
                        'suspicious_activity',
                        'medium',
                        'policy_engine',
                        rule.name,
                        { policy: policy.name, rule: rule.name }
                    );
                }
            });
        });
    }

    private evaluateRule(_rule: SecurityRule): boolean {
        // 정책 규칙 평가 시뮬레이션
        return Math.random() > 0.95; // 5% 확률로 위반
    }

    // 접근 패턴 분석
    private async analyzeAccessPatterns(): Promise<void> {
        // 비정상적인 접근 패턴 탐지
        const recentAccess = this.accessControls.filter(access =>
            access.timestamp > new Date(Date.now() - 60 * 60 * 1000) // 최근 1시간
        );

        // 사용자별 접근 패턴 분석
        const accessByUser = new Map<string, AccessControl[]>();
        recentAccess.forEach(access => {
            if (!accessByUser.has(access.userId)) {
                accessByUser.set(access.userId, []);
            }
            accessByUser.get(access.userId)!.push(access);
        });

        // 비정상적인 접근 패턴 탐지
        accessByUser.forEach((accesses, userId) => {
            if (accesses.length > 50) { // 1시간에 50회 이상 접근
                this.logSecurityEvent(
                    'suspicious_activity',
                    'medium',
                    userId,
                    'multiple_resources',
                    { accessCount: accesses.length }
                );
            }
        });
    }

    // 유틸리티 메서드들
    private async validateCredentials(_userId: string, _credentials: Record<string, unknown>): Promise<boolean> {
        // 인증 로직 시뮬레이션
        return Math.random() > 0.1; // 90% 성공률
    }

    private generateSecurityToken(userId: string): string {
        return `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async getUserPermissions(_userId: string): Promise<string[]> {
        // 사용자 권한 조회 시뮬레이션
        return ['read', 'write', 'execute'];
    }

    private async validateAccess(_userId: string, _resource: string, _permission: string): Promise<boolean> {
        // 접근 권한 검증 시뮬레이션
        return Math.random() > 0.2; // 80% 성공률
    }

    private validateApiToken(token: string): boolean {
        // API 토큰 검증 시뮬레이션
        return token.startsWith('token_');
    }

    private async checkRateLimit(_endpoint: string, _token: string): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
    }> {
        // 요청 제한 확인 시뮬레이션
        return {
            allowed: Math.random() > 0.1, // 90% 허용
            remaining: Math.floor(Math.random() * 100),
            resetTime: new Date(Date.now() + 60 * 60 * 1000) // 1시간 후
        };
    }

    private validateInput(_input: unknown): boolean {
        // 입력 검증 시뮬레이션
        return Math.random() > 0.05; // 95% 유효
    }

    // 공개 메서드들
    public getSecurityEvents(): SecurityEvent[] {
        return [...this.securityEvents];
    }

    public getSecurityPolicies(): SecurityPolicy[] {
        return [...this.securityPolicies];
    }

    public getThreatDetections(): ThreatDetection[] {
        return [...this.threatDetections];
    }

    public getAccessControls(): AccessControl[] {
        return [...this.accessControls];
    }

    public getSecurityStatus(): {
        isMonitoring: boolean;
        totalEvents: number;
        activeThreats: number;
        policiesEnabled: number;
        lastScan: Date;
    } {
        return {
            isMonitoring: this.isMonitoring,
            totalEvents: this.securityEvents.length,
            activeThreats: this.threatDetections.filter(t => t.status === 'detected').length,
            policiesEnabled: this.securityPolicies.filter(p => p.enabled).length,
            lastScan: new Date()
        };
    }

    public stopMonitoring(): void {
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        if (this.policyCheckInterval) {
            clearInterval(this.policyCheckInterval);
            this.policyCheckInterval = null;
        }
    }
}

// 싱글톤 인스턴스
const securityEnhancementService = new SecurityEnhancementService();

export default securityEnhancementService;
export type { SecurityEvent, SecurityPolicy, ThreatDetection, AccessControl };
