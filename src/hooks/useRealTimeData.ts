import { useState, useEffect, useCallback } from 'react';

export interface RealTimeMetrics {
    qualityMetrics: {
        overallQuality: number;
        testCoverage: number;
        automationRate: number;
        defectDensity: number;
        codeQuality: number;
        performanceScore: number;
        securityScore: number;
        userSatisfaction: number;
    };
    performanceMetrics: {
        responseTime: number;
        throughput: number;
        cpuUsage: number;
        memoryUsage: number;
        errorRate: number;
        availability: number;
    };
    testMetrics: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        runningTests: number;
        testExecutionTime: number;
        testSuccessRate: number;
    };
    notificationMetrics: {
        totalNotifications: number;
        unreadNotifications: number;
        criticalNotifications: number;
        resolvedNotifications: number;
    };
}

export interface RealTimeAlert {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'critical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
    source: string;
    category: string;
    acknowledged: boolean;
    resolved: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    ai_analysis?: {
        sentiment: 'positive' | 'negative' | 'neutral';
        urgency_score: number;
        impact_assessment: string;
        recommended_action: string;
        confidence: number;
    };
}

export interface RealTimeTest {
    id: string;
    name: string;
    status: 'running' | 'passed' | 'failed' | 'pending';
    type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    progress: number;
    startTime: Date;
    endTime?: Date;
    result?: {
        passed: boolean;
        errorMessage?: string;
        performanceMetrics?: {
            responseTime: number;
            memoryUsage: number;
            cpuUsage: number;
        };
    };
}

const useRealTimeData = () => {
    const [metrics, setMetrics] = useState<RealTimeMetrics>({
        qualityMetrics: {
            overallQuality: 94.2,
            testCoverage: 87.5,
            automationRate: 92.8,
            defectDensity: 2.1,
            codeQuality: 91.3,
            performanceScore: 88.7,
            securityScore: 95.2,
            userSatisfaction: 89.1
        },
        performanceMetrics: {
            responseTime: 245,
            throughput: 1250,
            cpuUsage: 68,
            memoryUsage: 72,
            errorRate: 0.15,
            availability: 99.8
        },
        testMetrics: {
            totalTests: 156,
            passedTests: 142,
            failedTests: 8,
            runningTests: 6,
            testExecutionTime: 45,
            testSuccessRate: 91.0
        },
        notificationMetrics: {
            totalNotifications: 23,
            unreadNotifications: 7,
            criticalNotifications: 2,
            resolvedNotifications: 16
        }
    });

    const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
    const [runningTests, setRunningTests] = useState<RealTimeTest[]>([]);
    const [isConnected, setIsConnected] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 실시간 데이터 업데이트 시뮬레이션
    const updateMetrics = useCallback(() => {
        setMetrics(prev => ({
            qualityMetrics: {
                overallQuality: Math.max(85, Math.min(98, prev.qualityMetrics.overallQuality + (Math.random() - 0.5) * 2)),
                testCoverage: Math.max(80, Math.min(95, prev.qualityMetrics.testCoverage + (Math.random() - 0.5) * 1.5)),
                automationRate: Math.max(85, Math.min(98, prev.qualityMetrics.automationRate + (Math.random() - 0.5) * 1)),
                defectDensity: Math.max(0.5, Math.min(5, prev.qualityMetrics.defectDensity + (Math.random() - 0.5) * 0.3)),
                codeQuality: Math.max(85, Math.min(96, prev.qualityMetrics.codeQuality + (Math.random() - 0.5) * 1.2)),
                performanceScore: Math.max(80, Math.min(95, prev.qualityMetrics.performanceScore + (Math.random() - 0.5) * 1.8)),
                securityScore: Math.max(90, Math.min(99, prev.qualityMetrics.securityScore + (Math.random() - 0.5) * 0.8)),
                userSatisfaction: Math.max(85, Math.min(95, prev.qualityMetrics.userSatisfaction + (Math.random() - 0.5) * 1.5))
            },
            performanceMetrics: {
                responseTime: Math.max(150, Math.min(400, prev.performanceMetrics.responseTime + (Math.random() - 0.5) * 20)),
                throughput: Math.max(1000, Math.min(1500, prev.performanceMetrics.throughput + (Math.random() - 0.5) * 50)),
                cpuUsage: Math.max(50, Math.min(85, prev.performanceMetrics.cpuUsage + (Math.random() - 0.5) * 5)),
                memoryUsage: Math.max(60, Math.min(85, prev.performanceMetrics.memoryUsage + (Math.random() - 0.5) * 4)),
                errorRate: Math.max(0.05, Math.min(0.5, prev.performanceMetrics.errorRate + (Math.random() - 0.5) * 0.05)),
                availability: Math.max(99.5, Math.min(99.95, prev.performanceMetrics.availability + (Math.random() - 0.5) * 0.1))
            },
            testMetrics: {
                totalTests: prev.testMetrics.totalTests,
                passedTests: prev.testMetrics.passedTests + (Math.random() > 0.7 ? 1 : 0),
                failedTests: prev.testMetrics.failedTests + (Math.random() > 0.9 ? 1 : 0),
                runningTests: Math.max(0, Math.min(10, prev.testMetrics.runningTests + (Math.random() > 0.5 ? 1 : -1))),
                testExecutionTime: Math.max(30, Math.min(60, prev.testMetrics.testExecutionTime + (Math.random() - 0.5) * 5)),
                testSuccessRate: Math.max(85, Math.min(98, prev.testMetrics.testSuccessRate + (Math.random() - 0.5) * 1))
            },
            notificationMetrics: {
                totalNotifications: prev.notificationMetrics.totalNotifications + (Math.random() > 0.95 ? 1 : 0),
                unreadNotifications: prev.notificationMetrics.unreadNotifications + (Math.random() > 0.9 ? 1 : 0),
                criticalNotifications: prev.notificationMetrics.criticalNotifications + (Math.random() > 0.98 ? 1 : 0),
                resolvedNotifications: prev.notificationMetrics.resolvedNotifications + (Math.random() > 0.8 ? 1 : 0)
            }
        }));
    }, []);

    // 알림 업데이트
    const updateAlerts = useCallback(() => {
        if (Math.random() > 0.95) {
            const newAlert: RealTimeAlert = {
                id: `alert-${Date.now()}`,
                type: ['info', 'warning', 'error', 'success', 'critical'][Math.floor(Math.random() * 5)] as any,
                severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                title: `자동 생성 알림 ${Math.floor(Math.random() * 1000)}`,
                message: '시스템 모니터링에 의해 자동 생성된 알림입니다.',
                timestamp: new Date(),
                source: 'auto-monitor',
                category: ['performance', 'quality', 'security', 'connectivity'][Math.floor(Math.random() * 4)],
                acknowledged: false,
                resolved: false,
                priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                tags: ['auto-generated', 'monitoring'],
                ai_analysis: {
                    sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
                    urgency_score: Math.random(),
                    impact_assessment: '자동 분석된 영향도 평가',
                    recommended_action: '시스템 상태를 확인하세요.',
                    confidence: 0.7 + Math.random() * 0.2
                }
            };
            setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // 최대 50개 유지
        }
    }, []);

    // 테스트 상태 업데이트
    const updateRunningTests = useCallback(() => {
        setRunningTests(prev => {
            const updated = prev.map(test => {
                if (test.status === 'running') {
                    const newProgress = Math.min(100, test.progress + Math.random() * 10);
                    const newStatus = newProgress >= 100 ? (Math.random() > 0.8 ? 'failed' : 'passed') : 'running';
                    return {
                        ...test,
                        progress: newProgress,
                        status: newStatus,
                        endTime: newStatus !== 'running' ? new Date() : undefined,
                        result: newStatus !== 'running' ? {
                            passed: newStatus === 'passed',
                            errorMessage: newStatus === 'failed' ? '테스트 실행 중 오류가 발생했습니다.' : undefined,
                            performanceMetrics: {
                                responseTime: Math.random() * 500 + 100,
                                memoryUsage: Math.random() * 50 + 20,
                                cpuUsage: Math.random() * 30 + 10
                            }
                        } : undefined
                    };
                }
                return test;
            });

            // 완료된 테스트 제거
            const filtered = updated.filter(test => test.status === 'running');

            // 새로운 테스트 추가 (5% 확률)
            if (Math.random() > 0.95 && filtered.length < 5) {
                const newTest: RealTimeTest = {
                    id: `test-${Date.now()}`,
                    name: `자동 테스트 ${Math.floor(Math.random() * 1000)}`,
                    status: 'running',
                    type: ['unit', 'integration', 'e2e', 'performance', 'security'][Math.floor(Math.random() * 5)] as any,
                    priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                    duration: Math.random() * 60 + 30,
                    progress: 0,
                    startTime: new Date()
                };
                filtered.push(newTest);
            }

            return filtered;
        });
    }, []);

    // 실시간 업데이트 시작
    useEffect(() => {
        const interval = setInterval(() => {
            updateMetrics();
            updateAlerts();
            updateRunningTests();
            setLastUpdate(new Date());
        }, 3000); // 3초마다 업데이트

        return () => clearInterval(interval);
    }, [updateMetrics, updateAlerts, updateRunningTests]);

    // 연결 상태 시뮬레이션
    useEffect(() => {
        const connectionInterval = setInterval(() => {
            setIsConnected(Math.random() > 0.99); // 99% 연결 상태 유지
        }, 10000);

        return () => clearInterval(connectionInterval);
    }, []);

    // 알림 액션 핸들러
    const acknowledgeAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
    }, []);

    const resolveAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
        ));
    }, []);

    const deleteAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    // 테스트 액션 핸들러
    const startTest = useCallback((testId: string) => {
        setRunningTests(prev => prev.map(test =>
            test.id === testId ? { ...test, status: 'running', progress: 0, startTime: new Date() } : test
        ));
    }, []);

    const stopTest = useCallback((testId: string) => {
        setRunningTests(prev => prev.map(test =>
            test.id === testId ? { ...test, status: 'pending', progress: 0 } : test
        ));
    }, []);

    return {
        metrics,
        alerts,
        runningTests,
        isConnected,
        lastUpdate,
        acknowledgeAlert,
        resolveAlert,
        deleteAlert,
        startTest,
        stopTest
    };
};

export default useRealTimeData;
