/**
 * SecurityAnalyticsService 테스트
 */
import securityAnalyticsService from '../securityAnalyticsService';

jest.mock('../advancedSecurityService', () => {
  const mockThreats = [{
    id: 't1', type: 'phishing', severity: 'high' as const, description: 'd',
    source_ip: '1.2.3.4', user_agent: 'ua', timestamp: '2025-02-01T12:00:00Z',
    status: 'detected' as const, risk_score: 0.8
  }];
  const mockEvents = [{
    id: 'e1', event_type: 'login', ip_address: '1.2.3.4',
    user_agent: 'ua', timestamp: '2025-02-01T12:00:00Z', details: {}, risk_level: 'low' as const
  }];
  const mockAlerts = [{
    id: 'a1', alert_type: 'threat' as const, severity: 'medium' as const,
    title: 't', description: 'd', source: 's', timestamp: '2025-02-01T12:00:00Z', status: 'new'
  }];
  const mockLogs = [{
    id: 'l1', action: 'view', resource: '/api', ip_address: '1.2.3.4',
    user_agent: 'ua', timestamp: '2025-02-01T12:00:00Z', success: true, details: {}
  }];
  return {
    __esModule: true,
    default: {
      getSecurityThreats: () => Promise.resolve({
        threats: mockThreats,
        total_count: 1,
        severity_counts: { high: 1 }
      }),
      getSecurityEvents: () => Promise.resolve({
        events: mockEvents,
        total_count: 1,
        risk_distribution: {}
      }),
      getSecurityAlerts: () => Promise.resolve({
        alerts: mockAlerts,
        total_count: 1
      }),
      getAuditLogs: () => Promise.resolve({
        logs: mockLogs,
        total_count: 1,
        success_count: 1
      }),
      getSecurityStatus: () => Promise.resolve({
        overall_status: 'healthy',
        security_score: 85,
        timestamp: '2025-02-01T12:00:00Z'
      })
    }
  };
});

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: { error: jest.fn(), warn: jest.fn() }
}));

describe('SecurityAnalyticsService', () => {
  describe('generateStatistics', () => {
    it('보안 통계 생성', async () => {
      const startDate = new Date('2025-02-01T00:00:00Z');
      const endDate = new Date('2025-02-02T00:00:00Z');

      const result = await securityAnalyticsService.generateStatistics(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.period.start).toBe(startDate.toISOString());
      expect(result.period.end).toBe(endDate.toISOString());
      expect(result.threats).toBeDefined();
      expect(typeof result.threats.total).toBe('number');
      expect(result.events).toBeDefined();
      expect(result.alerts).toBeDefined();
      expect(result.audit).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('결과에 threats.bySeverity, events.byRiskLevel, trends 포함', async () => {
      const startDate = new Date('2025-02-01T00:00:00Z');
      const endDate = new Date('2025-02-02T23:59:59Z');

      const result = await securityAnalyticsService.generateStatistics(startDate, endDate);

      expect(result.threats.bySeverity).toBeDefined();
      expect(typeof result.threats.bySeverity).toBe('object');
      expect(result.threats.trend).toBeDefined();
      expect(Array.isArray(result.threats.trend)).toBe(true);
      expect(result.events.byRiskLevel).toBeDefined();
      expect(result.trends.securityScoreTrend).toBeDefined();
      expect(Array.isArray(result.trends.securityScoreTrend)).toBe(true);
    });

  });
});
