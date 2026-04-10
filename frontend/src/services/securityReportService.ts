// 보안 리포트 생성 및 내보내기 서비스
// 보안 데이터를 수집하여 리포트를 생성하고 다양한 형식으로 내보낼 수 있도록 지원

import advancedSecurityService, {
    SecurityThreat,
    SecurityEvent,
    SecurityAlert,
    SecurityStatus,
    AuditLog,
    SecurityScanResult,
} from './advancedSecurityService';
import { errorLogger } from '../utils/errorLogger';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface SecurityReport {
    id: string;
    title: string;
    generatedAt: string;
    period: {
        start: string;
        end: string;
    };
    summary: {
        totalThreats: number;
        criticalThreats: number;
        totalAlerts: number;
        securityScore: number;
        totalEvents: number;
        failedLogins: number;
    };
    threats: SecurityThreat[];
    alerts: SecurityAlert[];
    events: SecurityEvent[];
    auditLogs: AuditLog[];
    scanResults: SecurityScanResult[];
    recommendations: string[];
}

export interface ReportExportOptions {
    format: 'json' | 'csv' | 'pdf' | 'html';
    includeCharts?: boolean;
    includeDetails?: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
}

class SecurityReportService {
    /**
     * 보안 리포트 생성
     */
    async generateReport(
        title: string,
        startDate: Date,
        endDate: Date,
        options?: { includeDetails?: boolean }
    ): Promise<SecurityReport> {
        try {
            const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // 모든 보안 데이터 수집
            const [status, threatsData, alertsData, eventsData, auditLogsData] = await Promise.all([
                advancedSecurityService.getSecurityStatus(),
                advancedSecurityService.getSecurityThreats(),
                advancedSecurityService.getSecurityAlerts(),
                advancedSecurityService.getSecurityEvents(1000),
                advancedSecurityService.getAuditLogs(undefined, 1000),
            ]);

            // 날짜 범위 필터링
            const filteredThreats = threatsData.threats.filter(
                (t) =>
                    new Date(t.timestamp) >= startDate &&
                    new Date(t.timestamp) <= endDate
            );

            const filteredAlerts = alertsData.alerts.filter(
                (a) =>
                    new Date(a.timestamp) >= startDate &&
                    new Date(a.timestamp) <= endDate
            );

            const filteredEvents = eventsData.events.filter(
                (e) =>
                    new Date(e.timestamp) >= startDate &&
                    new Date(e.timestamp) <= endDate
            );

            const filteredAuditLogs = auditLogsData.logs.filter(
                (l) =>
                    new Date(l.timestamp) >= startDate &&
                    new Date(l.timestamp) <= endDate
            );

            // 권장사항 생성
            const recommendations = this.generateRecommendations(
                status,
                filteredThreats,
                filteredAlerts
            );

            const report: SecurityReport = {
                id: reportId,
                title,
                generatedAt: new Date().toISOString(),
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
                summary: {
                    totalThreats: filteredThreats.length,
                    criticalThreats: filteredThreats.filter((t) => t.severity === 'critical').length,
                    totalAlerts: filteredAlerts.length,
                    securityScore: status.security_score,
                    totalEvents: filteredEvents.length,
                    failedLogins: filteredAuditLogs.filter(
                        (l) => l.action === 'login' && !l.success
                    ).length,
                },
                threats: options?.includeDetails ? filteredThreats : [],
                alerts: options?.includeDetails ? filteredAlerts : [],
                events: options?.includeDetails ? filteredEvents : [],
                auditLogs: options?.includeDetails ? filteredAuditLogs : [],
                scanResults: [],
                recommendations,
            };

            return report;
        } catch (error) {
            errorLogger.error('보안 리포트 생성 실패', error as Error, {
                component: 'SecurityReportService',
                action: 'generateReport',
            });
            throw error;
        }
    }

    /**
     * 리포트를 JSON 형식으로 내보내기
     */
    exportToJSON(report: SecurityReport): string {
        return JSON.stringify(report, null, 2);
    }

    /**
     * 리포트를 CSV 형식으로 내보내기
     */
    exportToCSV(report: SecurityReport): string {
        const lines: string[] = [];

        // 헤더
        lines.push('보안 리포트');
        lines.push(`제목: ${report.title}`);
        lines.push(`생성일: ${report.generatedAt}`);
        lines.push(`기간: ${report.period.start} ~ ${report.period.end}`);
        lines.push('');

        // 요약
        lines.push('요약');
        lines.push(`총 위협: ${report.summary.totalThreats}`);
        lines.push(`긴급 위협: ${report.summary.criticalThreats}`);
        lines.push(`총 알림: ${report.summary.totalAlerts}`);
        lines.push(`보안 점수: ${report.summary.securityScore}`);
        lines.push(`총 이벤트: ${report.summary.totalEvents}`);
        lines.push(`실패한 로그인: ${report.summary.failedLogins}`);
        lines.push('');

        // 위협 목록
        if (report.threats.length > 0) {
            lines.push('위협 목록');
            lines.push('ID,유형,심각도,설명,IP주소,상태,위험점수,시간');
            report.threats.forEach((threat) => {
                lines.push(
                    `${threat.id},${threat.type},${threat.severity},${threat.description},${threat.source_ip},${threat.status},${threat.risk_score},${threat.timestamp}`
                );
            });
            lines.push('');
        }

        // 알림 목록
        if (report.alerts.length > 0) {
            lines.push('알림 목록');
            lines.push('ID,타입,심각도,제목,설명,상태,시간');
            report.alerts.forEach((alert) => {
                lines.push(
                    `${alert.id},${alert.alert_type},${alert.severity},${alert.title},${alert.description},${alert.status},${alert.timestamp}`
                );
            });
            lines.push('');
        }

        // 권장사항
        if (report.recommendations.length > 0) {
            lines.push('권장사항');
            report.recommendations.forEach((rec, idx) => {
                lines.push(`${idx + 1}. ${rec}`);
            });
        }

        return lines.join('\n');
    }

    /**
     * 리포트를 HTML 형식으로 내보내기
     */
    exportToHTML(report: SecurityReport): string {
        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .severity-critical { color: #d32f2f; font-weight: bold; }
        .severity-high { color: #f57c00; font-weight: bold; }
        .severity-medium { color: #fbc02d; }
        .severity-low { color: #388e3c; }
        .recommendations {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-top: 15px;
        }
        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>생성일: ${new Date(report.generatedAt).toLocaleString('ko-KR')}</p>
        <p>기간: ${new Date(report.period.start).toLocaleDateString('ko-KR')} ~ ${new Date(report.period.end).toLocaleDateString('ko-KR')}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>총 위협</h3>
            <div class="value">${report.summary.totalThreats}</div>
        </div>
        <div class="summary-card">
            <h3>긴급 위협</h3>
            <div class="value" style="color: #d32f2f;">${report.summary.criticalThreats}</div>
        </div>
        <div class="summary-card">
            <h3>총 알림</h3>
            <div class="value">${report.summary.totalAlerts}</div>
        </div>
        <div class="summary-card">
            <h3>보안 점수</h3>
            <div class="value">${report.summary.securityScore}/100</div>
        </div>
        <div class="summary-card">
            <h3>총 이벤트</h3>
            <div class="value">${report.summary.totalEvents}</div>
        </div>
        <div class="summary-card">
            <h3>실패한 로그인</h3>
            <div class="value">${report.summary.failedLogins}</div>
        </div>
    </div>

    ${report.threats.length > 0 ? `
    <div class="section">
        <h2>위협 목록</h2>
        <table>
            <thead>
                <tr>
                    <th>유형</th>
                    <th>심각도</th>
                    <th>설명</th>
                    <th>IP 주소</th>
                    <th>상태</th>
                    <th>위험 점수</th>
                    <th>시간</th>
                </tr>
            </thead>
            <tbody>
                ${report.threats
                    .map(
                        (t) => `
                <tr>
                    <td>${t.type}</td>
                    <td class="severity-${t.severity}">${t.severity}</td>
                    <td>${t.description}</td>
                    <td>${t.source_ip}</td>
                    <td>${t.status}</td>
                    <td>${(t.risk_score * 100).toFixed(0)}%</td>
                    <td>${new Date(t.timestamp).toLocaleString('ko-KR')}</td>
                </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${report.alerts.length > 0 ? `
    <div class="section">
        <h2>알림 목록</h2>
        <table>
            <thead>
                <tr>
                    <th>타입</th>
                    <th>심각도</th>
                    <th>제목</th>
                    <th>설명</th>
                    <th>상태</th>
                    <th>시간</th>
                </tr>
            </thead>
            <tbody>
                ${report.alerts
                    .map(
                        (a) => `
                <tr>
                    <td>${a.alert_type}</td>
                    <td class="severity-${a.severity}">${a.severity}</td>
                    <td>${a.title}</td>
                    <td>${a.description}</td>
                    <td>${a.status}</td>
                    <td>${new Date(a.timestamp).toLocaleString('ko-KR')}</td>
                </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h2>권장사항</h2>
        <div class="recommendations">
            <ul>
                ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}
</body>
</html>
        `;

        return coerceTrimmedString(html, '');
    }

    /**
     * 리포트 다운로드
     */
    downloadReport(report: SecurityReport, format: 'json' | 'csv' | 'html'): void {
        let content: string;
        let mimeType: string;
        let extension: string;

        switch (format) {
            case 'json':
                content = this.exportToJSON(report);
                mimeType = 'application/json';
                extension = 'json';
                break;
            case 'csv':
                content = this.exportToCSV(report);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'html':
                content = this.exportToHTML(report);
                mimeType = 'text/html';
                extension = 'html';
                break;
            default:
                throw new Error('지원하지 않는 형식입니다.');
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 권장사항 생성
     */
    private generateRecommendations(
        status: SecurityStatus,
        threats: SecurityThreat[],
        alerts: SecurityAlert[]
    ): string[] {
        const recommendations: string[] = [];

        if (status.security_score < 80) {
            recommendations.push('보안 점수가 낮습니다. 보안 시스템을 점검하세요.');
        }

        const criticalThreats = threats.filter((t) => t.severity === 'critical');
        if (criticalThreats.length > 0) {
            recommendations.push(
                `긴급 위협 ${criticalThreats.length}개가 감지되었습니다. 즉시 조치가 필요합니다.`
            );
        }

        const highRiskAlerts = alerts.filter((a) => a.severity === 'high' || a.severity === 'critical');
        if (highRiskAlerts.length > 5) {
            recommendations.push('고위험 알림이 증가하고 있습니다. 보안 정책을 검토하세요.');
        }

        if (status.audit.failed_logins > 20) {
            recommendations.push('로그인 실패가 증가하고 있습니다. 계정 보안을 강화하세요.');
        }

        if (status.threats.active > 10) {
            recommendations.push('활성 위협이 많습니다. 위협 대응 프로세스를 점검하세요.');
        }

        if (recommendations.length === 0) {
            recommendations.push('현재 보안 상태가 양호합니다. 정기적인 모니터링을 계속하세요.');
        }

        return recommendations;
    }
}

// 싱글톤 인스턴스
const securityReportService = new SecurityReportService();

export default securityReportService;
export { SecurityReportService };
