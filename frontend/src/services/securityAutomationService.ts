// 보안 자동화 서비스
// 위협 감지 시 자동 대응, 정책 기반 자동화 규칙 실행

import { API_QUERY_PARAM_SCAN_TYPE } from '../config/api';
import advancedSecurityService from './advancedSecurityService';
import { errorLogger, toError } from '../utils/errorLogger';

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger: {
        type: 'threat' | 'alert' | 'event' | 'metric';
        condition: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    };
    actions: Array<{
        type: 'block_ip' | 'send_alert' | 'run_scan' | 'update_policy' | 'notify_admin';
        params: Record<string, unknown>;
    }>;
    enabled: boolean;
    created_at: string;
    last_triggered?: string;
    trigger_count: number;
}

class SecurityAutomationService {
    private rules: AutomationRule[] = [];
    private isMonitoring = false;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeDefaultRules();
    }

    /**
     * 기본 자동화 규칙 초기화
     */
    private initializeDefaultRules(): void {
        this.rules = [
            {
                id: 'auto-block-brute-force',
                name: '브루트 포스 공격 자동 차단',
                description: '5회 이상 로그인 실패 시 IP 자동 차단',
                trigger: {
                    type: 'event',
                    condition: 'failed_login_count >= 5',
                    severity: 'high',
                },
                actions: [
                    {
                        type: 'block_ip',
                        params: { duration: '24h', reason: 'Brute force attack detected' },
                    },
                    {
                        type: 'send_alert',
                        params: { severity: 'high', notify_admin: true },
                    },
                ],
                enabled: true,
                created_at: new Date().toISOString(),
                trigger_count: 0,
            },
            {
                id: 'auto-scan-on-threat',
                name: '위협 감지 시 자동 스캔',
                description: '심각한 위협 감지 시 자동 보안 스캔 실행',
                trigger: {
                    type: 'threat',
                    condition: 'severity == critical',
                    severity: 'critical',
                },
                actions: [
                    {
                        type: 'run_scan',
                        params: { [API_QUERY_PARAM_SCAN_TYPE]: 'full' },
                    },
                    {
                        type: 'notify_admin',
                        params: { priority: 'urgent' },
                    },
                ],
                enabled: true,
                created_at: new Date().toISOString(),
                trigger_count: 0,
            },
            {
                id: 'auto-alert-on-suspicious',
                name: '의심스러운 활동 자동 알림',
                description: '의심스러운 활동 감지 시 즉시 알림',
                trigger: {
                    type: 'event',
                    condition: 'risk_level == high',
                    severity: 'high',
                },
                actions: [
                    {
                        type: 'send_alert',
                        params: { severity: 'medium', notify_admin: true },
                    },
                ],
                enabled: true,
                created_at: new Date().toISOString(),
                trigger_count: 0,
            },
        ];
    }

    /**
     * 모니터링 시작
     */
    startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.checkRules();
        }, 10000); // 10초마다 규칙 확인

        errorLogger.info('보안 자동화 모니터링 시작', {
            component: 'securityAutomationService',
            action: 'startMonitoring',
            rulesCount: this.rules.length,
        });
    }

    /**
     * 모니터링 중지
     */
    stopMonitoring(): void {
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        errorLogger.info('보안 자동화 모니터링 중지', {
            component: 'securityAutomationService',
            action: 'stopMonitoring',
        });
    }

    /**
     * 규칙 확인 및 실행
     */
    private async checkRules(): Promise<void> {
        if (!this.isMonitoring) {
            return;
        }

        try {
            // 최근 보안 이벤트 조회
            const events = await advancedSecurityService.getSecurityEvents(100);
            const threats = await advancedSecurityService.getSecurityThreats();
            const status = await advancedSecurityService.getSecurityStatus();

            // 각 규칙 확인
            for (const rule of this.rules) {
                if (!rule.enabled) {
                    continue;
                }

                const shouldTrigger = await this.evaluateRule(rule, {
                    events: events.events,
                    threats: threats.threats,
                    status,
                });

                if (shouldTrigger) {
                    await this.executeRule(rule);
                }
            }
                } catch (error) {
            const err = toError(error);
            errorLogger.error('자동화 규칙 확인 실패', err, {
                component: 'SecurityAutomationService',
                action: 'checkRules',
            });
        }
    }

    /**
     * 규칙 평가
     */
    private async evaluateRule(
        rule: AutomationRule,
        context: {
            events: unknown[];
            threats: unknown[];
            status: unknown;
        }
    ): Promise<boolean> {
        const { trigger } = rule;

        switch (trigger.type) {
            case 'event':
                // 최근 5분간의 실패한 로그인 시도 확인
                const recentFailedLogins = context.events.filter(
                    (e) => {
                        const ev = e as Record<string, unknown>;
                        return ev.event_type === 'login' &&
                            ev.risk_level === 'high' &&
                            new Date(String(ev.timestamp)) > new Date(Date.now() - 5 * 60 * 1000);
                    }
                );

                if (trigger.condition.includes('failed_login_count >= 5')) {
                    const ipCounts = new Map<string, number>();
                    recentFailedLogins.forEach((e) => {
                        const ev = e as Record<string, unknown>;
                        const ip = String(ev.ip_address ?? '');
                        ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
                    });

                    return Array.from(ipCounts.values()).some((count) => count >= 5);
                }

                if (trigger.condition.includes('risk_level == high')) {
                    return context.events.some((e) => (e as Record<string, unknown>).risk_level === 'high');
                }
                break;

            case 'threat':
                if (trigger.severity) {
                    return context.threats.some(
                        (t) => {
                            const tv = t as Record<string, unknown>;
                            return tv.severity === trigger.severity && tv.status !== 'resolved';
                        }
                    );
                }
                break;

            case 'metric':
                // 메트릭 기반 규칙 평가
                if (trigger.condition.includes('security_score <')) {
                    const threshold = parseInt(trigger.condition.match(/\d+/)?.[0] || '80');
                    const status = context.status as Record<string, unknown>;
                    return (Number(status.security_score) ?? 0) < threshold;
                }
                break;
        }

        return false;
    }

    /**
     * 규칙 실행
     */
    private async executeRule(rule: AutomationRule): Promise<void> {
        errorLogger.info('자동화 규칙 실행', {
            component: 'securityAutomationService',
            action: 'executeRule',
            ruleId: rule.id,
            ruleName: rule.name,
            actionsCount: rule.actions.length,
        });

        try {
            for (const action of rule.actions) {
                await this.executeAction(action, rule);
            }

            // 규칙 실행 기록 업데이트
            rule.last_triggered = new Date().toISOString();
            rule.trigger_count += 1;

            errorLogger.info('규칙 실행 완료', {
                component: 'securityAutomationService',
                action: 'executeRule',
                ruleId: rule.id,
                ruleName: rule.name,
                triggerCount: rule.trigger_count,
            });
        } catch (error) {
            const err = toError(error);
            errorLogger.error('규칙 실행 실패', err, {
                component: 'SecurityAutomationService',
                action: 'executeRule',
                rule_id: rule.id,
                ruleName: rule.name,
            });
        }
    }

    /**
     * 액션 실행
     */
    private async executeAction(action: AutomationRule['actions'][0], rule: AutomationRule): Promise<void> {
        switch (action.type) {
            case 'block_ip':
                // 최근 실패한 로그인 시도에서 IP 추출
                const events = await advancedSecurityService.getSecurityEvents(50);
                const failedLogins = events.events.filter((e) => e.event_type === 'login' && e.risk_level === 'high');

                if (failedLogins.length > 0) {
                    const ipCounts = new Map<string, number>();
                    failedLogins.forEach((e) => {
                        ipCounts.set(e.ip_address, (ipCounts.get(e.ip_address) || 0) + 1);
                    });

                    // 가장 많이 실패한 IP 차단
                    const topIP = Array.from(ipCounts.entries()).sort((a, b) => b[1] - a[1])[0];
                    if (topIP && topIP[1] >= 5) {
                        await advancedSecurityService.blockIP({
                            ip_address: topIP[0],
                            reason: `자동 차단: ${rule.name}`,
                            severity: 'high',
                        });
                        errorLogger.info('IP 자동 차단', {
                            component: 'securityAutomationService',
                            action: 'executeAction',
                            actionType: 'block_ip',
                            ipAddress: topIP[0],
                            ruleId: rule.id,
                            ruleName: rule.name,
                            failedAttempts: topIP[1],
                        });
                    }
                }
                break;

            case 'run_scan': {
                const scanType = (action.params[API_QUERY_PARAM_SCAN_TYPE] as string) || 'full';
                await advancedSecurityService.runSecurityScan(scanType as 'full' | 'quick' | 'custom');
                errorLogger.info('보안 스캔 실행', {
                    component: 'securityAutomationService',
                    action: 'executeAction',
                    actionType: 'run_scan',
                    scanType,
                    ruleId: rule.id,
                    ruleName: rule.name,
                });
                break;
            }

            case 'send_alert':
                // 알림은 WebSocket을 통해 전송되거나 로깅
                errorLogger.info('보안 알림', {
                    component: 'securityAutomationService',
                    action: 'executeAction',
                    actionType: 'send_alert',
                    severity: action.params.severity || 'medium',
                    ruleId: rule.id,
                    ruleName: rule.name,
                });
                break;

            case 'notify_admin':
                errorLogger.info('관리자 알림', {
                    component: 'securityAutomationService',
                    action: 'executeAction',
                    actionType: 'notify_admin',
                    priority: action.params.priority || 'normal',
                    ruleId: rule.id,
                    ruleName: rule.name,
                });
                break;

            case 'update_policy':
                // 정책 업데이트는 수동으로 처리
                errorLogger.info('정책 업데이트 요청', {
                    component: 'securityAutomationService',
                    action: 'executeAction',
                    actionType: 'update_policy',
                    ruleId: rule.id,
                    ruleName: rule.name,
                    params: action.params,
                });
                break;
        }
    }

    /**
     * 규칙 추가
     */
    addRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'trigger_count'>): AutomationRule {
        const newRule: AutomationRule = {
            ...rule,
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            trigger_count: 0,
        };

        this.rules.push(newRule);
        return newRule;
    }

    /**
     * 규칙 업데이트
     */
    updateRule(ruleId: string, updates: Partial<AutomationRule>): boolean {
        const index = this.rules.findIndex((r) => r.id === ruleId);
        if (index === -1) {
            return false;
        }

        this.rules[index] = { ...this.rules[index], ...updates };
        return true;
    }

    /**
     * 규칙 삭제
     */
    deleteRule(ruleId: string): boolean {
        const index = this.rules.findIndex((r) => r.id === ruleId);
        if (index === -1) {
            return false;
        }

        this.rules.splice(index, 1);
        return true;
    }

    /**
     * 모든 규칙 조회
     */
    getRules(): AutomationRule[] {
        return [...this.rules];
    }

    /**
     * 규칙 조회
     */
    getRule(ruleId: string): AutomationRule | undefined {
        return this.rules.find((r) => r.id === ruleId);
    }
}

// 싱글톤 인스턴스
const securityAutomationService = new SecurityAutomationService();

export default securityAutomationService;
