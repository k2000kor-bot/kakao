// 보안 통계 및 분석 서비스
// 보안 데이터를 분석하여 통계 및 트렌드를 제공

import advancedSecurityService, {
    SecurityThreat,
    SecurityEvent,
    SecurityAlert,
    SecurityStatus,
    AuditLog,
} from './advancedSecurityService';
import { errorLogger } from '../utils/errorLogger';

export interface SecurityStatistics {
    period: {
        start: string;
        end: string;
    };
    threats: {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
        trend: Array<{ date: string; count: number }>;
        topSources: Array<{ ip: string; count: number }>;
    };
    events: {
        total: number;
        byRiskLevel: Record<string, number>;
        byType: Record<string, number>;
        successRate: number;
        failureRate: number;
    };
    alerts: {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
        unacknowledged: number;
    };
    audit: {
        totalLogs: number;
        failedLogins: number;
        topUsers: Array<{ user_id: string; action_count: number }>;
        topResources: Array<{ resource: string; access_count: number }>;
    };
    trends: {
        securityScoreTrend: Array<{ date: string; score: number }>;
        threatFrequency: Array<{ date: string; count: number }>;
        eventFrequency: Array<{ date: string; count: number }>;
    };
    insights: string[];
}

class SecurityAnalyticsService {
    /**
     * 보안 통계 생성
     */
    async generateStatistics(startDate: Date, endDate: Date): Promise<SecurityStatistics> {
        try {
            // 모든 보안 데이터 수집
            const [threatsData, eventsData, alertsData, auditLogsData, status] = await Promise.all([
                advancedSecurityService.getSecurityThreats(),
                advancedSecurityService.getSecurityEvents(1000),
                advancedSecurityService.getSecurityAlerts(undefined, undefined, 1000),
                advancedSecurityService.getAuditLogs(undefined, 1000),
                advancedSecurityService.getSecurityStatus(),
            ]);

            // 날짜 범위 필터링
            const filteredThreats = this.filterByDateRange(threatsData.threats, startDate, endDate);
            const filteredEvents = this.filterByDateRange(eventsData.events, startDate, endDate);
            const filteredAlerts = this.filterByDateRange(alertsData.alerts, startDate, endDate);
            const filteredAuditLogs = this.filterByDateRange(auditLogsData.logs, startDate, endDate);

            // 통계 계산
            const statistics: SecurityStatistics = {
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
                threats: this.analyzeThreats(filteredThreats, startDate, endDate),
                events: this.analyzeEvents(filteredEvents),
                alerts: this.analyzeAlerts(filteredAlerts),
                audit: this.analyzeAuditLogs(filteredAuditLogs),
                trends: this.calculateTrends(filteredThreats, filteredEvents, status, startDate, endDate),
                insights: this.generateInsights(
                    filteredThreats,
                    filteredEvents,
                    filteredAlerts,
                    filteredAuditLogs,
                    status
                ),
            };

            return statistics;
        } catch (error) {
            errorLogger.error('보안 통계 생성 실패', error as Error, {
                component: 'SecurityAnalyticsService',
                action: 'generateStatistics',
            });
            throw error;
        }
    }

    /**
     * 날짜 범위 필터링
     */
    private filterByDateRange<T extends { timestamp: string }>(
        items: T[],
        startDate: Date,
        endDate: Date
    ): T[] {
        return items.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    /**
     * 위협 분석
     */
    private analyzeThreats(
        threats: SecurityThreat[],
        startDate: Date,
        endDate: Date
    ): SecurityStatistics['threats'] {
        const bySeverity: Record<string, number> = {};
        const byType: Record<string, number> = {};
        const sourceCounts: Record<string, number> = {};

        threats.forEach((threat) => {
            bySeverity[threat.severity] = (bySeverity[threat.severity] || 0) + 1;
            byType[threat.type] = (byType[threat.type] || 0) + 1;
            sourceCounts[threat.source_ip] = (sourceCounts[threat.source_ip] || 0) + 1;
        });

        // 일별 추이 계산
        const trend = this.calculateDailyTrend(threats, startDate, endDate);

        // 상위 소스 IP
        const topSources = Object.entries(sourceCounts)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            total: threats.length,
            bySeverity,
            byType,
            trend,
            topSources,
        };
    }

    /**
     * 이벤트 분석
     */
    private analyzeEvents(events: SecurityEvent[]): SecurityStatistics['events'] {
        const byRiskLevel: Record<string, number> = {};
        const byType: Record<string, number> = {};
        let successCount = 0;
        let failureCount = 0;

        events.forEach((event) => {
            byRiskLevel[event.risk_level] = (byRiskLevel[event.risk_level] || 0) + 1;
            byType[event.event_type] = (byType[event.event_type] || 0) + 1;
        });

        return {
            total: events.length,
            byRiskLevel,
            byType,
            successRate: events.length > 0 ? (successCount / events.length) * 100 : 0,
            failureRate: events.length > 0 ? (failureCount / events.length) * 100 : 0,
        };
    }

    /**
     * 알림 분석
     */
    private analyzeAlerts(alerts: SecurityAlert[]): SecurityStatistics['alerts'] {
        const bySeverity: Record<string, number> = {};
        const byType: Record<string, number> = {};
        let unacknowledged = 0;

        alerts.forEach((alert) => {
            bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
            byType[alert.alert_type] = (byType[alert.alert_type] || 0) + 1;
            if (alert.status === 'new') {
                unacknowledged++;
            }
        });

        return {
            total: alerts.length,
            bySeverity,
            byType,
            unacknowledged,
        };
    }

    /**
     * 감사 로그 분석
     */
    private analyzeAuditLogs(logs: AuditLog[]): SecurityStatistics['audit'] {
        const userCounts: Record<string, number> = {};
        const resourceCounts: Record<string, number> = {};
        let failedLogins = 0;

        logs.forEach((log) => {
            if (log.user_id) {
                userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
            }
            resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
            if (log.action === 'login' && !log.success) {
                failedLogins++;
            }
        });

        const topUsers = Object.entries(userCounts)
            .map(([user_id, action_count]) => ({ user_id, action_count }))
            .sort((a, b) => b.action_count - a.action_count)
            .slice(0, 10);

        const topResources = Object.entries(resourceCounts)
            .map(([resource, access_count]) => ({ resource, access_count }))
            .sort((a, b) => b.access_count - a.access_count)
            .slice(0, 10);

        return {
            totalLogs: logs.length,
            failedLogins,
            topUsers,
            topResources,
        };
    }

    /**
     * 일별 추이 계산
     */
    private calculateDailyTrend<T extends { timestamp: string }>(
        items: T[],
        startDate: Date,
        endDate: Date
    ): Array<{ date: string; count: number }> {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const trend: Array<{ date: string; count: number }> = [];

        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const count = items.filter((item) => item.timestamp.startsWith(dateStr)).length;
            trend.push({
                date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                count,
            });
        }

        return trend;
    }

    /**
     * 트렌드 계산
     */
    private calculateTrends(
        threats: SecurityThreat[],
        events: SecurityEvent[],
        status: SecurityStatus,
        startDate: Date,
        endDate: Date
    ): SecurityStatistics['trends'] {
        const threatFrequency = this.calculateDailyTrend(threats, startDate, endDate);
        const eventFrequency = this.calculateDailyTrend(events, startDate, endDate);

        // 보안 점수 추이 (시뮬레이션)
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const securityScoreTrend = Array.from({ length: days + 1 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const baseScore = status.security_score;
            const variation = (Math.random() - 0.5) * 10;
            return {
                date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                score: Math.max(0, Math.min(100, baseScore + variation)),
            };
        });

        return {
            securityScoreTrend,
            threatFrequency,
            eventFrequency,
        };
    }

    /**
     * 인사이트 생성
     */
    private generateInsights(
        threats: SecurityThreat[],
        events: SecurityEvent[],
        alerts: SecurityAlert[],
        auditLogs: AuditLog[],
        status: SecurityStatus
    ): string[] {
        const insights: string[] = [];

        // 위협 관련 인사이트
        const criticalThreats = threats.filter((t) => t.severity === 'critical');
        if (criticalThreats.length > 0) {
            insights.push(
                `긴급 위협 ${criticalThreats.length}개가 감지되었습니다. 즉시 조치가 필요합니다.`
            );
        }

        const topThreatType = Object.entries(
            threats.reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        )
            .sort((a, b) => b[1] - a[1])[0];

        if (topThreatType && topThreatType[1] > 5) {
            insights.push(
                `"${topThreatType[0]}" 유형의 위협이 ${topThreatType[1]}회 발생했습니다. 이 유형에 대한 추가 보안 조치를 고려하세요.`
            );
        }

        // 이벤트 관련 인사이트
        const highRiskEvents = events.filter((e) => e.risk_level === 'high');
        if (highRiskEvents.length > 10) {
            insights.push(
                `고위험 이벤트가 ${highRiskEvents.length}개 발생했습니다. 보안 정책을 검토하세요.`
            );
        }

        // 알림 관련 인사이트
        const unacknowledgedAlerts = alerts.filter((a) => a.status === 'new');
        if (unacknowledgedAlerts.length > 5) {
            insights.push(
                `확인되지 않은 알림이 ${unacknowledgedAlerts.length}개 있습니다. 즉시 확인하세요.`
            );
        }

        // 감사 로그 관련 인사이트
        const failedLogins = auditLogs.filter((l) => l.action === 'login' && !l.success);
        if (failedLogins.length > 20) {
            insights.push(
                `로그인 실패가 ${failedLogins.length}회 발생했습니다. 계정 보안을 강화하세요.`
            );
        }

        // 보안 점수 관련 인사이트
        if (status.security_score < 80) {
            insights.push(
                `보안 점수가 ${status.security_score}점입니다. 보안 시스템을 점검하고 개선하세요.`
            );
        }

        if (insights.length === 0) {
            insights.push('현재 보안 상태가 양호합니다. 정기적인 모니터링을 계속하세요.');
        }

        return insights;
    }
}

// 싱글톤 인스턴스
const securityAnalyticsService = new SecurityAnalyticsService();

export default securityAnalyticsService;
export { SecurityAnalyticsService };
