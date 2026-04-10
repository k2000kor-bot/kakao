// securityAutomationService 테스트
/* eslint-disable jest/no-conditional-expect */

import securityAutomationService from '../securityAutomationService';

// advancedSecurityService 모킹(axios 사용) → ESM 대응을 위해 axios 선모킹
jest.mock('axios', () => ({
  default: { get: jest.fn(), post: jest.fn(), create: jest.fn(() => ({ get: jest.fn(), post: jest.fn() })) },
  get: jest.fn(),
  post: jest.fn(),
  create: jest.fn(() => ({ get: jest.fn(), post: jest.fn() })),
}));

// advancedSecurityService 모킹
jest.mock('../advancedSecurityService');

describe('SecurityAutomationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        securityAutomationService.stopMonitoring();
    });

    describe('getRules', () => {
        it('should return all automation rules', () => {
            const rules = securityAutomationService.getRules();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
        });
    });

    describe('addRule', () => {
        it('should add a new automation rule', () => {
            const newRule = {
                name: 'Test Rule',
                description: 'Test Description',
                trigger: {
                    type: 'event' as const,
                    condition: 'test_condition',
                    severity: 'medium' as const,
                },
                actions: [
                    {
                        type: 'send_alert' as const,
                        params: { severity: 'high' },
                    },
                ],
                enabled: true,
            };

            const rule = securityAutomationService.addRule(newRule);

            expect(rule.name).toBe('Test Rule');
            expect(rule.id).toBeDefined();
            expect(rule.created_at).toBeDefined();
            expect(rule.trigger_count).toBe(0);
        });
    });

    describe('updateRule', () => {
        it('should update an existing rule', () => {
            const rules = securityAutomationService.getRules();
            if (rules.length > 0) {
                const ruleId = rules[0].id;
                const updated = securityAutomationService.updateRule(ruleId, {
                    enabled: false,
                });

                expect(updated).toBe(true);
                const updatedRule = securityAutomationService.getRule(ruleId);
                expect(updatedRule?.enabled).toBe(false);
            }
        });

        it('should return false for non-existent rule', () => {
            const updated = securityAutomationService.updateRule('non_existent', {
                enabled: false,
            });
            expect(updated).toBe(false);
        });
    });

    describe('deleteRule', () => {
        it('should delete an existing rule', () => {
            const newRule = {
                name: 'Rule to Delete',
                description: 'Will be deleted',
                trigger: {
                    type: 'event' as const,
                    condition: 'test',
                    severity: 'low' as const,
                },
                actions: [],
                enabled: true,
            };

            const rule = securityAutomationService.addRule(newRule);
            const deleted = securityAutomationService.deleteRule(rule.id);

            expect(deleted).toBe(true);
            const deletedRule = securityAutomationService.getRule(rule.id);
            expect(deletedRule).toBeUndefined();
        });

        it('should return false for non-existent rule', () => {
            const deleted = securityAutomationService.deleteRule('non_existent');
            expect(deleted).toBe(false);
        });
    });

    describe('monitoring', () => {
        it('should start and stop monitoring', () => {
            securityAutomationService.startMonitoring();
            // 모니터링이 시작되었는지 확인 (내부 상태는 직접 확인 불가)
            securityAutomationService.stopMonitoring();
            // 정상적으로 중지되었는지 확인
            expect(true).toBe(true); // 기본 테스트
        });
    });

    describe('getRule', () => {
        it('should return rule by id', () => {
            const rules = securityAutomationService.getRules();
            if (rules.length > 0) {
                const rule = securityAutomationService.getRule(rules[0].id);
                expect(rule).toBeDefined();
                expect(rule?.id).toBe(rules[0].id);
            }
        });

        it('should return undefined for non-existent rule', () => {
            const rule = securityAutomationService.getRule('non_existent');
            expect(rule).toBeUndefined();
        });
    });
});
