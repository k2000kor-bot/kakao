/**
 * SecurityReportService 테스트
 */
import securityReportService, { SecurityReport } from '../securityReportService';
import * as advancedSecurityServiceModule from '../advancedSecurityService';

// Mock advancedSecurityService before importing
jest.mock('../advancedSecurityService', () => ({
  __esModule: true,
  default: {
    getSecurityStatus: jest.fn(),
    getSecurityThreats: jest.fn(),
    getSecurityAlerts: jest.fn(),
    getSecurityEvents: jest.fn(),
    getAuditLogs: jest.fn()
  }
}));

const createMockReport = (overrides: Partial<SecurityReport> = {}): SecurityReport => ({
  id: 'report_1',
  title: '테스트 보안 리포트',
  generatedAt: new Date().toISOString(),
  period: {
    start: '2025-01-01T00:00:00Z',
    end: '2025-01-31T23:59:59Z'
  },
  summary: {
    totalThreats: 2,
    criticalThreats: 0,
    totalAlerts: 1,
    securityScore: 85,
    totalEvents: 10,
    failedLogins: 1
  },
  threats: [],
  alerts: [],
  events: [],
  auditLogs: [],
  scanResults: [],
  recommendations: ['현재 보안 상태가 양호합니다.'],
  ...overrides
});

describe('SecurityReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('보안 리포트 생성', async () => {
      const advancedSecurityService = (advancedSecurityServiceModule as { default: {
        getSecurityStatus: jest.Mock;
        getSecurityThreats: jest.Mock;
        getSecurityAlerts: jest.Mock;
        getSecurityEvents: jest.Mock;
        getAuditLogs: jest.Mock;
      } }).default;

      advancedSecurityService.getSecurityStatus.mockResolvedValue({
        overall_status: 'healthy',
        security_score: 90,
        threats: { total: 0, active: 0, critical: 0 },
        events: { total: 5, high_risk: 0 },
        audit: { total_logs: 100, failed_logins: 2 }
      });
      advancedSecurityService.getSecurityThreats.mockResolvedValue({ threats: [] });
      advancedSecurityService.getSecurityAlerts.mockResolvedValue({ alerts: [] });
      advancedSecurityService.getSecurityEvents.mockResolvedValue({ events: [] });
      advancedSecurityService.getAuditLogs.mockResolvedValue({ logs: [] });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const report = await securityReportService.generateReport(
        '테스트 리포트',
        startDate,
        endDate
      );

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.title).toBe('테스트 리포트');
      expect(report.period.start).toBe(startDate.toISOString());
      expect(report.period.end).toBe(endDate.toISOString());
      expect(report.summary).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('exportToJSON', () => {
    it('JSON 형식으로 내보내기', () => {
      const report = createMockReport();
      const json = securityReportService.exportToJSON(report);

      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe(report.id);
      expect(parsed.title).toBe(report.title);
    });
  });

  describe('exportToCSV', () => {
    it('CSV 형식으로 내보내기', () => {
      const report = createMockReport();
      const csv = securityReportService.exportToCSV(report);

      expect(typeof csv).toBe('string');
      expect(csv).toContain('보안 리포트');
      expect(csv).toContain(report.title);
      expect(csv).toContain('요약');
    });

    it('위협·알림이 있는 리포트 CSV 내보내기', () => {
      const report = createMockReport({
        threats: [{
          id: 't1',
          type: 'brute_force',
          severity: 'high' as const,
          description: '테스트',
          source_ip: '1.2.3.4',
          user_agent: 'test',
          timestamp: '2025-01-15T00:00:00Z',
          status: 'detected' as const,
          risk_score: 80
        }],
        alerts: [{
          id: 'a1',
          alert_type: 'threat' as const,
          severity: 'high' as const,
          title: '테스트 알림',
          description: '설명',
          source: 'system',
          timestamp: '2025-01-15T00:00:00Z',
          status: 'new' as const,
          details: {}
        }]
      });

      const csv = securityReportService.exportToCSV(report);
      expect(csv).toContain('위협 목록');
      expect(csv).toContain('알림 목록');
    });
  });

  describe('exportToHTML', () => {
    it('HTML 형식으로 내보내기', () => {
      const report = createMockReport();
      const html = securityReportService.exportToHTML(report);

      expect(typeof html).toBe('string');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(report.title);
    });
  });

  describe('downloadReport', () => {
    it('JSON 형식 다운로드', () => {
      const report = createMockReport();
      const createObjectURL = jest.fn(() => 'blob:mock-url');
      const revokeObjectURL = jest.fn();
      const appendChild = jest.fn();
      const removeChild = jest.fn();

      Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL });
      Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL });
      document.body.appendChild = appendChild;
      document.body.removeChild = removeChild;

      const link = { href: '', download: '', click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement);

      securityReportService.downloadReport(report, 'json');

      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(link.click).toHaveBeenCalled();
    });
  });
});
