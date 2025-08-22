/**
 * 고급 보안 및 데이터 암호화 서비스
 * 데이터 암호화, 인증, 권한 관리, 보안 감사 기능 제공
 */

export interface SecurityConfig {
  encryptionEnabled: boolean;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyDerivationIterations: number;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  auditLogging: boolean;
  dataRetentionDays: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  algorithm: string;
  version: string;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: any;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  activeSessions: number;
  encryptionOperations: number;
  auditEvents: number;
  securityScore: number; // 0-100
  lastSecurityScan: Date;
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
}

class AdvancedSecurityService {
  private config: SecurityConfig;
  private sessions: Map<string, UserSession> = new Map();
  private auditLog: SecurityAudit[] = [];
  private encryptionKey: CryptoKey | null = null;
  private keyDerivationSalt: Uint8Array | null = null;
  private securityMetrics: SecurityMetrics;

  constructor() {
    this.initializeSecurityConfig();
    this.initializeSecurityMetrics();
    this.setupSecurityMonitoring();
  }

  /**
   * 보안 설정 초기화
   */
  private initializeSecurityConfig(): void {
    this.config = {
      encryptionEnabled: true,
      encryptionAlgorithm: 'AES-256-GCM',
      keyDerivationIterations: 100000,
      sessionTimeout: 60, // 60 minutes
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      auditLogging: true,
      dataRetentionDays: 90
    };

    // 로컬 스토리지에서 설정 로드
    const savedConfig = localStorage.getItem('securityConfig');
    if (savedConfig) {
      try {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      } catch (error) {
        console.error('보안 설정 로드 실패:', error);
      }
    }
  }

  /**
   * 보안 메트릭 초기화
   */
  private initializeSecurityMetrics(): void {
    this.securityMetrics = {
      totalLogins: 0,
      failedLogins: 0,
      activeSessions: 0,
      encryptionOperations: 0,
      auditEvents: 0,
      securityScore: 85,
      lastSecurityScan: new Date(),
      vulnerabilities: []
    };

    // 저장된 메트릭 로드
    const savedMetrics = localStorage.getItem('securityMetrics');
    if (savedMetrics) {
      try {
        this.securityMetrics = { ...this.securityMetrics, ...JSON.parse(savedMetrics) };
      } catch (error) {
        console.error('보안 메트릭 로드 실패:', error);
      }
    }
  }

  /**
   * 보안 모니터링 설정
   */
  private setupSecurityMonitoring(): void {
    // 세션 만료 체크
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // 1분마다

    // 보안 스캔
    setInterval(() => {
      this.performSecurityScan();
    }, 300000); // 5분마다

    // 메트릭 저장
    setInterval(() => {
      this.saveSecurityMetrics();
    }, 300000); // 5분마다

    // 오디트 로그 정리
    setInterval(() => {
      this.cleanupOldAuditLogs();
    }, 86400000); // 24시간마다
  }

  /**
   * 암호화 키 생성
   */
  async generateEncryptionKey(password: string, salt?: Uint8Array): Promise<CryptoKey> {
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(32));
      this.keyDerivationSalt = salt;
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.keyDerivationIterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    this.encryptionKey = key;
    return key;
  }

  /**
   * 데이터 암호화
   */
  async encryptData(data: string): Promise<EncryptedData> {
    if (!this.config.encryptionEnabled) {
      return {
        encrypted: data,
        iv: '',
        salt: '',
        algorithm: 'none',
        version: '1.0'
      };
    }

    if (!this.encryptionKey) {
      throw new Error('암호화 키가 설정되지 않았습니다.');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      encodedData
    );

    const encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    const salt = this.keyDerivationSalt ? btoa(String.fromCharCode(...this.keyDerivationSalt)) : '';

    this.securityMetrics.encryptionOperations++;

    return {
      encrypted,
      iv: btoa(String.fromCharCode(...iv)),
      salt,
      algorithm: this.config.encryptionAlgorithm,
      version: '1.0'
    };
  }

  /**
   * 데이터 복호화
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    if (!this.config.encryptionEnabled || encryptedData.algorithm === 'none') {
      return encryptedData.encrypted;
    }

    if (!this.encryptionKey) {
      throw new Error('암호화 키가 설정되지 않았습니다.');
    }

    try {
      const iv = new Uint8Array(atob(encryptedData.iv).split('').map(char => char.charCodeAt(0)));
      const encrypted = new Uint8Array(atob(encryptedData.encrypted).split('').map(char => char.charCodeAt(0)));

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      this.securityMetrics.encryptionOperations++;

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error('데이터 복호화 실패: ' + error);
    }
  }

  /**
   * 비밀번호 검증
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordPolicy.minLength) {
      errors.push(`비밀번호는 최소 ${this.config.passwordPolicy.minLength}자 이상이어야 합니다.`);
    }

    if (this.config.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다.');
    }

    if (this.config.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다.');
    }

    if (this.config.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다.');
    }

    if (this.config.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 비밀번호 해시 생성
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return btoa(String.fromCharCode(...salt)) + ':' + hashHex;
  }

  /**
   * 비밀번호 검증
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [saltB64, hash] = hashedPassword.split(':');
    const salt = new Uint8Array(atob(saltB64).split('').map(char => char.charCodeAt(0)));
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hash === computedHash;
  }

  /**
   * 사용자 세션 생성
   */
  createUserSession(userId: string, ipAddress: string, userAgent: string): UserSession {
    const sessionId = crypto.randomUUID();
    const token = this.generateSecureToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.sessionTimeout * 60000);

    const session: UserSession = {
      id: sessionId,
      userId,
      token,
      createdAt: now,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true
    };

    this.sessions.set(sessionId, session);
    this.securityMetrics.activeSessions = this.sessions.size;
    this.securityMetrics.totalLogins++;

    this.logAuditEvent(userId, 'login', 'session', ipAddress, userAgent, true);

    return session;
  }

  /**
   * 세션 검증
   */
  validateSession(sessionId: string, token: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }

    if (session.token !== token) {
      this.logAuditEvent(session.userId, 'session_validation_failed', 'session', session.ipAddress, session.userAgent, false);
      return false;
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      this.logAuditEvent(session.userId, 'session_expired', 'session', session.ipAddress, session.userAgent, false);
      return false;
    }

    return true;
  }

  /**
   * 세션 종료
   */
  terminateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.securityMetrics.activeSessions = this.sessions.size;
      this.logAuditEvent(session.userId, 'logout', 'session', session.ipAddress, session.userAgent, true);
      return true;
    }
    return false;
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        session.isActive = false;
        cleanedCount++;
      }
    }

    this.securityMetrics.activeSessions = this.sessions.size - cleanedCount;

    if (cleanedCount > 0) {
      console.log(`${cleanedCount}개의 만료된 세션을 정리했습니다.`);
    }
  }

  /**
   * 보안 토큰 생성
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 오디트 이벤트 로깅
   */
  logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    details?: any
  ): void {
    if (!this.config.auditLogging) return;

    const auditEvent: SecurityAudit = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      success,
      details
    };

    this.auditLog.push(auditEvent);
    this.securityMetrics.auditEvents++;

    // 로컬 스토리지에 저장
    this.saveAuditLog();
  }

  /**
   * 오디트 로그 저장
   */
  private saveAuditLog(): void {
    try {
      const recentLogs = this.auditLog.slice(-1000); // 최근 1000개만 저장
      localStorage.setItem('securityAuditLog', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('오디트 로그 저장 실패:', error);
    }
  }

  /**
   * 오래된 오디트 로그 정리
   */
  private cleanupOldAuditLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);

    this.auditLog = this.auditLog.filter(log => log.timestamp > cutoffDate);
    console.log('오래된 오디트 로그를 정리했습니다.');
  }

  /**
   * 보안 스캔 수행
   */
  private performSecurityScan(): void {
    const vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }> = [];

    // 세션 보안 검사
    if (this.securityMetrics.activeSessions > 10) {
      vulnerabilities.push({
        type: 'session_overflow',
        severity: 'medium',
        description: '활성 세션이 너무 많습니다.',
        recommendation: '불필요한 세션을 정리하세요.'
      });
    }

    // 로그인 실패율 검사
    const failureRate = this.securityMetrics.failedLogins / Math.max(this.securityMetrics.totalLogins, 1);
    if (failureRate > 0.3) {
      vulnerabilities.push({
        type: 'high_failure_rate',
        severity: 'high',
        description: '로그인 실패율이 높습니다.',
        recommendation: '계정 보안을 강화하세요.'
      });
    }

    // 암호화 사용률 검사
    if (this.securityMetrics.encryptionOperations === 0) {
      vulnerabilities.push({
        type: 'no_encryption',
        severity: 'critical',
        description: '데이터 암호화가 사용되지 않고 있습니다.',
        recommendation: '암호화를 활성화하세요.'
      });
    }

    this.securityMetrics.vulnerabilities = vulnerabilities;
    this.securityMetrics.lastSecurityScan = new Date();

    // 보안 점수 계산
    this.calculateSecurityScore();
  }

  /**
   * 보안 점수 계산
   */
  private calculateSecurityScore(): void {
    let score = 100;

    // 취약점에 따른 점수 감점
    this.securityMetrics.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // 암호화 사용률에 따른 점수
    if (this.securityMetrics.encryptionOperations === 0) {
      score -= 20;
    }

    // 세션 관리에 따른 점수
    if (this.securityMetrics.activeSessions > 20) {
      score -= 10;
    }

    this.securityMetrics.securityScore = Math.max(0, Math.min(100, score));
  }

  /**
   * 보안 메트릭 저장
   */
  private saveSecurityMetrics(): void {
    try {
      localStorage.setItem('securityMetrics', JSON.stringify(this.securityMetrics));
    } catch (error) {
      console.error('보안 메트릭 저장 실패:', error);
    }
  }

  /**
   * 보안 설정 업데이트
   */
  updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('securityConfig', JSON.stringify(this.config));
  }

  /**
   * 보안 메트릭 조회
   */
  getSecurityMetrics(): SecurityMetrics {
    return { ...this.securityMetrics };
  }

  /**
   * 오디트 로그 조회
   */
  getAuditLog(limit: number = 100): SecurityAudit[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * 활성 세션 조회
   */
  getActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * 보안 설정 조회
   */
  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * 데이터 안전한 저장
   */
  async secureStore(key: string, data: any): Promise<void> {
    const dataString = JSON.stringify(data);
    const encrypted = await this.encryptData(dataString);
    localStorage.setItem(key, JSON.stringify(encrypted));
  }

  /**
   * 데이터 안전한 로드
   */
  async secureLoad(key: string): Promise<any> {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;

    try {
      const encrypted = JSON.parse(encryptedData) as EncryptedData;
      const decrypted = await this.decryptData(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      return null;
    }
  }

  /**
   * 보안 초기화
   */
  async initializeSecurity(password: string): Promise<void> {
    await this.generateEncryptionKey(password);
    this.logAuditEvent('system', 'security_initialized', 'system', 'localhost', 'system', true);
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    // 모든 세션 종료
    for (const session of this.sessions.values()) {
      session.isActive = false;
    }
    this.sessions.clear();

    // 메트릭 저장
    this.saveSecurityMetrics();
    this.saveAuditLog();
  }
}

// 싱글톤 인스턴스
export const advancedSecurityService = new AdvancedSecurityService();

export default advancedSecurityService;
