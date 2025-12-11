// 고급 보안 API 서비스
// backend/api/advanced_security_api.py의 모든 엔드포인트와 통합

import axios, { AxiosInstance } from 'axios';

// ===== 타입 정의 =====
export interface SecurityThreat {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    source_ip: string;
    user_agent: string;
    timestamp: string;
    status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
    risk_score: number;
}

export interface SecurityEvent {
    id: string;
    event_type: string;
    user_id?: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    details: Record<string, any>;
    risk_level: 'low' | 'medium' | 'high';
}

export interface EncryptionKey {
    id: string;
    name: string;
    algorithm: string;
    key_size: number;
    created_at: string;
    expires_at?: string;
    status: 'active' | 'expired' | 'revoked';
    usage_count: number;
}

export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    resource: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    success: boolean;
    details: Record<string, any>;
}

export interface IPBlock {
    ip_address: string;
    reason: string;
    blocked_at: string;
    blocked_until?: string;
    blocked_by: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    policy_type: 'access_control' | 'rate_limit' | 'encryption' | 'authentication';
    rules: Record<string, any>;
    enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface SecurityAlert {
    id: string;
    alert_type: 'threat' | 'anomaly' | 'policy_violation' | 'system_alert';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    timestamp: string;
    status: 'new' | 'acknowledged' | 'resolved';
    details: Record<string, any>;
}

export interface SecurityStatus {
    overall_status: 'healthy' | 'warning' | 'critical';
    security_score: number;
    threats: {
        total: number;
        active: number;
        critical: number;
    };
    events: {
        total: number;
        high_risk: number;
    };
    audit: {
        total_logs: number;
        failed_logins: number;
    };
    encryption: {
        active_keys: number;
        total_keys: number;
    };
    recommendations: string[];
}

export interface SecurityScanResult {
    scan_id: string;
    scan_type: string;
    started_at: string;
    completed_at: string;
    vulnerabilities_found: number;
    threats_detected: number;
    risk_level: 'low' | 'medium' | 'high';
    recommendations: string[];
}

export interface RateLimitConfig {
    endpoint: string;
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
    enabled: boolean;
    updated_at: string;
}

// ===== 서비스 클래스 =====
class AdvancedSecurityService {
    private api: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // ===== 보안 위협 관리 =====
    async getSecurityThreats(
        severity?: string,
        status?: string
    ): Promise<{ threats: SecurityThreat[]; total_count: number; severity_counts: Record<string, number> }> {
        try {
            // 입력 검증
            if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
                throw new Error('유효하지 않은 심각도 값입니다.');
            }
            if (status && !['detected', 'investigating', 'resolved', 'false_positive'].includes(status)) {
                throw new Error('유효하지 않은 상태 값입니다.');
            }

            const params = new URLSearchParams();
            if (severity) params.append('severity', severity);
            if (status) params.append('status', status);

            const response = await this.api.get(`/security/threats?${params.toString()}`);

            if (!response.data?.success) {
                throw new Error(response.data?.error || '보안 위협 조회 실패');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('보안 위협 조회 실패:', error);
            if (error.response) {
                throw new Error(`서버 오류: ${error.response.status} - ${error.response.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    async resolveThreat(threatId: string, resolution: Record<string, any>): Promise<SecurityThreat> {
        try {
            const response = await this.api.post(`/security/threats/${threatId}/resolve`, resolution);
            return response.data.data;
        } catch (error) {
            console.error('보안 위협 해결 실패:', error);
            throw error;
        }
    }

    // ===== 보안 이벤트 =====
    async getSecurityEvents(limit: number = 50): Promise<{
        events: SecurityEvent[];
        total_count: number;
        risk_distribution: Record<string, number>;
    }> {
        try {
            const response = await this.api.get(`/security/events?limit=${limit}`);
            return response.data.data;
        } catch (error) {
            console.error('보안 이벤트 조회 실패:', error);
            throw error;
        }
    }

    // ===== 암호화/복호화 =====
    async encryptData(data: Record<string, any>): Promise<{
        encrypted_data: string;
        key_id: string;
        algorithm: string;
        timestamp: string;
    }> {
        try {
            const response = await this.api.post('/security/encrypt', data);
            return response.data.data;
        } catch (error) {
            console.error('데이터 암호화 실패:', error);
            throw error;
        }
    }

    async decryptData(encryptedData: string, keyId: string): Promise<Record<string, any>> {
        try {
            const response = await this.api.post('/security/decrypt', {
                encrypted_data: encryptedData,
                key_id: keyId,
            });
            return response.data.data;
        } catch (error) {
            console.error('데이터 복호화 실패:', error);
            throw error;
        }
    }

    // ===== 암호화 키 관리 =====
    async getEncryptionKeys(): Promise<{
        keys: EncryptionKey[];
        total_count: number;
        active_count: number;
    }> {
        try {
            const response = await this.api.get('/security/keys');
            return response.data.data;
        } catch (error) {
            console.error('암호화 키 조회 실패:', error);
            throw error;
        }
    }

    async createEncryptionKey(keyConfig: {
        name?: string;
        expires_days?: number;
    }): Promise<EncryptionKey> {
        try {
            const response = await this.api.post('/security/keys', keyConfig);
            return response.data.data;
        } catch (error) {
            console.error('암호화 키 생성 실패:', error);
            throw error;
        }
    }

    // ===== 비밀번호 관리 =====
    async hashPassword(password: string): Promise<{
        hashed_password: string;
        algorithm: string;
        salt: string;
    }> {
        try {
            const response = await this.api.post('/security/hash', null, {
                params: { password },
            });
            return response.data.data;
        } catch (error) {
            console.error('비밀번호 해시 실패:', error);
            throw error;
        }
    }

    async verifyPassword(password: string, hashedPassword: string): Promise<{
        is_valid: boolean;
        message: string;
    }> {
        try {
            const response = await this.api.post('/security/verify-password', null, {
                params: { password, hashed_password: hashedPassword },
            });
            return response.data.data;
        } catch (error) {
            console.error('비밀번호 검증 실패:', error);
            throw error;
        }
    }

    // ===== JWT 토큰 관리 =====
    async generateJWTToken(payload: Record<string, any>): Promise<{
        token: string;
        expires_at: string;
        algorithm: string;
    }> {
        try {
            const response = await this.api.post('/security/generate-token', payload);
            return response.data.data;
        } catch (error) {
            console.error('JWT 토큰 생성 실패:', error);
            throw error;
        }
    }

    async verifyJWTToken(token: string): Promise<{
        payload: Record<string, any>;
        is_valid: boolean;
        expires_at: string;
    }> {
        try {
            const response = await this.api.post('/security/verify-token', null, {
                params: { token },
            });
            return response.data.data;
        } catch (error) {
            console.error('JWT 토큰 검증 실패:', error);
            throw error;
        }
    }

    // ===== 감사 로그 =====
    async getAuditLogs(userId?: string, limit: number = 100): Promise<{
        logs: AuditLog[];
        total_count: number;
        success_count: number;
        failure_count: number;
    }> {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('user_id', userId);
            params.append('limit', limit.toString());

            const response = await this.api.get(`/security/audit-logs?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error('감사 로그 조회 실패:', error);
            throw error;
        }
    }

    // ===== 보안 상태 =====
    async getSecurityStatus(): Promise<SecurityStatus> {
        try {
            const response = await this.api.get('/security/status');
            return response.data.data;
        } catch (error) {
            console.error('보안 상태 조회 실패:', error);
            throw error;
        }
    }

    // ===== 보안 스캔 =====
    async runSecurityScan(scanType: 'full' | 'quick' | 'custom' = 'full'): Promise<SecurityScanResult> {
        try {
            const response = await this.api.post('/security/scan', null, {
                params: { scan_type: scanType },
            });
            return response.data.data;
        } catch (error) {
            console.error('보안 스캔 실행 실패:', error);
            throw error;
        }
    }

    // ===== IP 관리 =====
    async blockIP(ipData: {
        ip_address: string;
        reason?: string;
        blocked_until?: string;
        blocked_by?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<IPBlock> {
        try {
            // IP 주소 검증
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipData.ip_address || !ipRegex.test(ipData.ip_address)) {
                throw new Error('유효하지 않은 IP 주소 형식입니다.');
            }

            // 심각도 검증
            if (ipData.severity && !['low', 'medium', 'high', 'critical'].includes(ipData.severity)) {
                throw new Error('유효하지 않은 심각도 값입니다.');
            }

            const response = await this.api.post('/security/ip/block', ipData);

            if (!response.data?.success) {
                throw new Error(response.data?.error || 'IP 차단 실패');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('IP 차단 실패:', error);
            if (error.response) {
                throw new Error(`서버 오류: ${error.response.status} - ${error.response.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    async unblockIP(ipAddress: string): Promise<void> {
        try {
            await this.api.delete(`/security/ip/block/${ipAddress}`);
        } catch (error) {
            console.error('IP 차단 해제 실패:', error);
            throw error;
        }
    }

    async getBlockedIPs(): Promise<{
        blocked_ips: IPBlock[];
        total_count: number;
    }> {
        try {
            const response = await this.api.get('/security/ip/blocked');
            return response.data.data;
        } catch (error) {
            console.error('차단된 IP 목록 조회 실패:', error);
            throw error;
        }
    }

    async whitelistIP(ipData: {
        ip_address: string;
        reason?: string;
        added_by?: string;
        notes?: string;
    }): Promise<{
        ip_address: string;
        reason: string;
        added_at: string;
        added_by: string;
        notes: string;
    }> {
        try {
            const response = await this.api.post('/security/ip/whitelist', ipData);
            return response.data.data;
        } catch (error) {
            console.error('IP 화이트리스트 추가 실패:', error);
            throw error;
        }
    }

    async getWhitelistedIPs(): Promise<{
        whitelisted_ips: Array<{
            ip_address: string;
            reason: string;
            added_at: string;
            added_by: string;
            notes: string;
        }>;
        total_count: number;
    }> {
        try {
            const response = await this.api.get('/security/ip/whitelist');
            return response.data.data;
        } catch (error) {
            console.error('화이트리스트 IP 목록 조회 실패:', error);
            throw error;
        }
    }

    // ===== Rate Limiting =====
    async configureRateLimit(config: {
        endpoint: string;
        requests_per_minute?: number;
        requests_per_hour?: number;
        requests_per_day?: number;
        enabled?: boolean;
    }): Promise<RateLimitConfig> {
        try {
            const response = await this.api.post('/security/rate-limit', config);
            return response.data.data;
        } catch (error) {
            console.error('Rate limiting 설정 실패:', error);
            throw error;
        }
    }

    async getRateLimitConfig(): Promise<{
        configs: Record<string, RateLimitConfig>;
        total_endpoints: number;
    }> {
        try {
            const response = await this.api.get('/security/rate-limit');
            return response.data.data;
        } catch (error) {
            console.error('Rate limiting 설정 조회 실패:', error);
            throw error;
        }
    }

    // ===== 보안 정책 관리 =====
    async createSecurityPolicy(policy: {
        name: string;
        description?: string;
        policy_type: 'access_control' | 'rate_limit' | 'encryption' | 'authentication';
        rules?: Record<string, any>;
        enabled?: boolean;
    }): Promise<SecurityPolicy> {
        try {
            // 입력 검증
            if (!policy.name || policy.name.trim().length === 0) {
                throw new Error('정책 이름은 필수입니다.');
            }

            if (policy.name.length > 100) {
                throw new Error('정책 이름은 100자 이하여야 합니다.');
            }

            const validPolicyTypes = ['access_control', 'rate_limit', 'encryption', 'authentication'];
            if (!validPolicyTypes.includes(policy.policy_type)) {
                throw new Error('유효하지 않은 정책 유형입니다.');
            }

            const response = await this.api.post('/security/policies', policy);

            if (!response.data?.success) {
                throw new Error(response.data?.error || '보안 정책 생성 실패');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('보안 정책 생성 실패:', error);
            if (error.response) {
                throw new Error(`서버 오류: ${error.response.status} - ${error.response.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    async getSecurityPolicies(): Promise<{
        policies: SecurityPolicy[];
        total_count: number;
        enabled_count: number;
    }> {
        try {
            const response = await this.api.get('/security/policies');
            return response.data.data;
        } catch (error) {
            console.error('보안 정책 조회 실패:', error);
            throw error;
        }
    }

    async updateSecurityPolicy(
        policyId: string,
        policyUpdate: Partial<SecurityPolicy>
    ): Promise<SecurityPolicy> {
        try {
            const response = await this.api.put(`/security/policies/${policyId}`, policyUpdate);
            return response.data.data;
        } catch (error) {
            console.error('보안 정책 업데이트 실패:', error);
            throw error;
        }
    }

    // ===== 보안 알림 =====
    async getSecurityAlerts(
        severity?: string,
        status?: string,
        limit: number = 50
    ): Promise<{
        alerts: SecurityAlert[];
        total_count: number;
        severity_counts: Record<string, number>;
        status_counts: Record<string, number>;
    }> {
        try {
            const params = new URLSearchParams();
            if (severity) params.append('severity', severity);
            if (status) params.append('status', status);
            params.append('limit', limit.toString());

            const response = await this.api.get(`/security/alerts?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error('보안 알림 조회 실패:', error);
            throw error;
        }
    }

    async acknowledgeAlert(alertId: string): Promise<void> {
        try {
            await this.api.post(`/security/alerts/${alertId}/acknowledge`);
        } catch (error) {
            console.error('알림 확인 처리 실패:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 생성
const advancedSecurityService = new AdvancedSecurityService();

export default advancedSecurityService;
export { AdvancedSecurityService };
