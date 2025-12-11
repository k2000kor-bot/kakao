// advancedSecurityService 테스트
import advancedSecurityService from '../advancedSecurityService';
import axios from 'axios';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdvancedSecurityService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.create.mockReturnValue(mockedAxios as any);
    });

    describe('getSecurityThreats', () => {
        it('should fetch security threats successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        threats: [
                            {
                                id: 'threat_1',
                                type: 'SQL Injection',
                                severity: 'high',
                                description: 'Test threat',
                                source_ip: '192.168.1.1',
                                user_agent: 'Test Agent',
                                timestamp: '2025-01-27T00:00:00Z',
                                status: 'detected',
                                risk_score: 0.8,
                            },
                        ],
                        total_count: 1,
                        severity_counts: { high: 1, medium: 0, low: 0, critical: 0 },
                    },
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.getSecurityThreats();

            expect(result.threats).toHaveLength(1);
            expect(result.total_count).toBe(1);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/security/threats')
            );
        });

        it('should handle errors when fetching threats', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(advancedSecurityService.getSecurityThreats()).rejects.toThrow();
        });
    });

    describe('blockIP', () => {
        it('should block IP address successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        ip_address: '192.168.1.100',
                        reason: 'Brute force attack',
                        blocked_at: '2025-01-27T00:00:00Z',
                        severity: 'high',
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.blockIP({
                ip_address: '192.168.1.100',
                reason: 'Brute force attack',
                severity: 'high',
            });

            expect(result.ip_address).toBe('192.168.1.100');
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/security/ip/block',
                expect.objectContaining({
                    ip_address: '192.168.1.100',
                })
            );
        });
    });

    describe('getSecurityStatus', () => {
        it('should fetch security status successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        overall_status: 'healthy',
                        security_score: 95,
                        threats: { total: 0, active: 0, critical: 0 },
                        events: { total: 10, high_risk: 0 },
                        audit: { total_logs: 100, failed_logins: 2 },
                        encryption: { active_keys: 1, total_keys: 1 },
                        recommendations: [],
                    },
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.getSecurityStatus();

            expect(result.overall_status).toBe('healthy');
            expect(result.security_score).toBe(95);
        });
    });

    describe('runSecurityScan', () => {
        it('should run security scan successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        scan_id: 'scan_123',
                        scan_type: 'full',
                        started_at: '2025-01-27T00:00:00Z',
                        completed_at: '2025-01-27T00:05:00Z',
                        vulnerabilities_found: 5,
                        threats_detected: 2,
                        risk_level: 'medium',
                        recommendations: ['Update system', 'Review firewall'],
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.runSecurityScan('full');

            expect(result.scan_id).toBe('scan_123');
            expect(result.vulnerabilities_found).toBe(5);
        });
    });

    describe('createSecurityPolicy', () => {
        it('should create security policy successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        id: 'policy_123',
                        name: 'Test Policy',
                        description: 'Test Description',
                        policy_type: 'access_control',
                        rules: {},
                        enabled: true,
                        created_at: '2025-01-27T00:00:00Z',
                        updated_at: '2025-01-27T00:00:00Z',
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.createSecurityPolicy({
                name: 'Test Policy',
                description: 'Test Description',
                policy_type: 'access_control',
            });

            expect(result.name).toBe('Test Policy');
            expect(result.policy_type).toBe('access_control');
        });
    });

    describe('encryptData', () => {
        it('should encrypt data successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        encrypted_data: 'encrypted_string',
                        key_id: 'key_123',
                        algorithm: 'AES-256',
                        timestamp: '2025-01-27T00:00:00Z',
                    },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.encryptData({ secret: 'data' });

            expect(result.encrypted_data).toBe('encrypted_string');
            expect(result.algorithm).toBe('AES-256');
        });
    });

    describe('getAuditLogs', () => {
        it('should fetch audit logs successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        logs: [
                            {
                                id: 'log_1',
                                user_id: 'user_1',
                                action: 'login',
                                resource: 'auth',
                                ip_address: '192.168.1.1',
                                user_agent: 'Test Agent',
                                timestamp: '2025-01-27T00:00:00Z',
                                success: true,
                                details: {},
                            },
                        ],
                        total_count: 1,
                        success_count: 1,
                        failure_count: 0,
                    },
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            const result = await advancedSecurityService.getAuditLogs();

            expect(result.logs).toHaveLength(1);
            expect(result.total_count).toBe(1);
        });

        it('should filter by user_id when provided', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        logs: [],
                        total_count: 0,
                        success_count: 0,
                        failure_count: 0,
                    },
                },
            };

            mockedAxios.get.mockResolvedValue(mockResponse);

            await advancedSecurityService.getAuditLogs('user_1');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('user_id=user_1')
            );
        });
    });
});
