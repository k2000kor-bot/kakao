import { Project, Chat, Message } from '../types/project';

export interface SystemHealthMetrics {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
    uptime: number;
}

export interface SystemAnomaly {
    id: string;
    type: 'performance' | 'security' | 'data' | 'network';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    detectedAt: Date;
    resolvedAt?: Date;
    recommendations: string[];
    affectedComponents: string[];
}

export interface PredictiveInsight {
    id: string;
    type: 'capacity' | 'performance' | 'security' | 'usage';
    title: string;
    description: string;
    confidence: number;
    predictedDate: Date;
    impact: 'low' | 'medium' | 'high';
    recommendations: string[];
}

export interface AutoOptimizationAction {
    id: string;
    type: 'cleanup' | 'optimization' | 'scaling' | 'maintenance';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedImpact: string;
    estimatedDuration: number;
    riskLevel: 'low' | 'medium' | 'high';
    automated: boolean;
}

export interface SystemIntelligenceReport {
    timestamp: Date;
    overallHealth: number;
    criticalIssues: number;
    warnings: number;
    recommendations: string[];
    anomalies: SystemAnomaly[];
    insights: PredictiveInsight[];
    optimizations: AutoOptimizationAction[];
}

export class SystemIntelligenceService {
    private healthHistory: SystemHealthMetrics[] = [];
    private anomalies: SystemAnomaly[] = [];
    private insights: PredictiveInsight[] = [];
    private optimizations: AutoOptimizationAction[] = [];

    // 시스템 건강도 분석
    analyzeSystemHealth(projects: Project[], chats: Chat[], messages: Message[]): SystemHealthMetrics {
        // 실제 구현에서는 시스템 리소스 모니터링 API 사용
        const cpuUsage = Math.random() * 100;
        const memoryUsage = Math.random() * 100;
        const diskUsage = Math.random() * 100;
        const networkUsage = Math.random() * 100;
        const responseTime = Math.random() * 1000;
        const errorRate = Math.random() * 5;
        const activeConnections = Math.floor(Math.random() * 100);
        const uptime = Date.now() - Math.random() * 86400000; // 최근 24시간

        const metrics: SystemHealthMetrics = {
            cpuUsage,
            memoryUsage,
            diskUsage,
            networkUsage,
            responseTime,
            errorRate,
            activeConnections,
            uptime
        };

        this.healthHistory.push(metrics);
        if (this.healthHistory.length > 100) {
            this.healthHistory.shift();
        }

        return metrics;
    }

    // 이상 징후 감지
    detectAnomalies(metrics: SystemHealthMetrics): SystemAnomaly[] {
        const newAnomalies: SystemAnomaly[] = [];

        // CPU 사용률 이상 감지
        if (metrics.cpuUsage > 80) {
            newAnomalies.push({
                id: `anomaly-${Date.now()}-1`,
                type: 'performance',
                severity: metrics.cpuUsage > 95 ? 'critical' : 'high',
                title: '높은 CPU 사용률',
                description: `CPU 사용률이 ${metrics.cpuUsage.toFixed(1)}%로 정상 범위를 초과했습니다.`,
                detectedAt: new Date(),
                recommendations: [
                    '불필요한 프로세스 종료',
                    '시스템 리소스 사용량 분석',
                    '성능 최적화 작업 실행'
                ],
                affectedComponents: ['CPU', '시스템 성능']
            });
        }

        // 메모리 사용률 이상 감지
        if (metrics.memoryUsage > 85) {
            newAnomalies.push({
                id: `anomaly-${Date.now()}-2`,
                type: 'performance',
                severity: metrics.memoryUsage > 95 ? 'critical' : 'high',
                title: '높은 메모리 사용률',
                description: `메모리 사용률이 ${metrics.memoryUsage.toFixed(1)}%로 정상 범위를 초과했습니다.`,
                detectedAt: new Date(),
                recommendations: [
                    '메모리 캐시 정리',
                    '불필요한 애플리케이션 종료',
                    '메모리 누수 검사'
                ],
                affectedComponents: ['메모리', '시스템 성능']
            });
        }

        // 응답 시간 이상 감지
        if (metrics.responseTime > 500) {
            newAnomalies.push({
                id: `anomaly-${Date.now()}-3`,
                type: 'performance',
                severity: metrics.responseTime > 1000 ? 'high' : 'medium',
                title: '느린 응답 시간',
                description: `평균 응답 시간이 ${metrics.responseTime.toFixed(0)}ms로 정상보다 느립니다.`,
                detectedAt: new Date(),
                recommendations: [
                    '데이터베이스 쿼리 최적화',
                    '네트워크 연결 상태 확인',
                    '서버 리소스 확장 검토'
                ],
                affectedComponents: ['네트워크', '데이터베이스', '서버']
            });
        }

        // 오류율 이상 감지
        if (metrics.errorRate > 2) {
            newAnomalies.push({
                id: `anomaly-${Date.now()}-4`,
                type: 'security',
                severity: metrics.errorRate > 5 ? 'critical' : 'high',
                title: '높은 오류율',
                description: `시스템 오류율이 ${metrics.errorRate.toFixed(2)}%로 정상 범위를 초과했습니다.`,
                detectedAt: new Date(),
                recommendations: [
                    '오류 로그 분석',
                    '시스템 안정성 검사',
                    '보안 취약점 점검'
                ],
                affectedComponents: ['시스템 안정성', '보안']
            });
        }

        this.anomalies.push(...newAnomalies);
        return newAnomalies;
    }

    // 예측적 인사이트 생성
    generatePredictiveInsights(metrics: SystemHealthMetrics, projects: Project[]): PredictiveInsight[] {
        const newInsights: PredictiveInsight[] = [];

        // 용량 예측
        const projectGrowthRate = projects.length / Math.max(1, this.healthHistory.length);
        if (projectGrowthRate > 0.1) {
            newInsights.push({
                id: `insight-${Date.now()}-1`,
                type: 'capacity',
                title: '저장소 용량 부족 예상',
                description: '현재 성장률을 고려할 때 30일 내 저장소 용량이 부족할 것으로 예상됩니다.',
                confidence: 0.85,
                predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                impact: 'high',
                recommendations: [
                    '저장소 용량 확장 계획 수립',
                    '불필요한 데이터 정리',
                    '데이터 압축 정책 검토'
                ]
            });
        }

        // 성능 예측
        const avgCpuUsage = this.healthHistory.reduce((sum, m) => sum + m.cpuUsage, 0) / this.healthHistory.length;
        if (avgCpuUsage > 70) {
            newInsights.push({
                id: `insight-${Date.now()}-2`,
                type: 'performance',
                title: '성능 저하 예상',
                description: '현재 CPU 사용률 추세를 보면 7일 내 성능 저하가 예상됩니다.',
                confidence: 0.78,
                predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                impact: 'medium',
                recommendations: [
                    '시스템 리소스 모니터링 강화',
                    '성능 최적화 작업 예약',
                    '사용자 수 제한 검토'
                ]
            });
        }

        // 보안 예측
        if (metrics.errorRate > 1) {
            newInsights.push({
                id: `insight-${Date.now()}-3`,
                type: 'security',
                title: '보안 위험 증가',
                description: '오류율 증가로 인한 보안 취약점 발생 가능성이 높아지고 있습니다.',
                confidence: 0.72,
                predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                impact: 'high',
                recommendations: [
                    '보안 감사 실행',
                    '접근 로그 분석',
                    '보안 패치 적용'
                ]
            });
        }

        this.insights.push(...newInsights);
        return newInsights;
    }

    // 자동 최적화 액션 생성
    generateOptimizationActions(metrics: SystemHealthMetrics, anomalies: SystemAnomaly[]): AutoOptimizationAction[] {
        const actions: AutoOptimizationAction[] = [];

        // 자동 정리 액션
        if (metrics.diskUsage > 80) {
            actions.push({
                id: `optimization-${Date.now()}-1`,
                type: 'cleanup',
                title: '자동 디스크 정리',
                description: '불필요한 임시 파일 및 로그 파일을 자동으로 정리합니다.',
                priority: 'high',
                estimatedImpact: '디스크 사용률 15% 감소',
                estimatedDuration: 30, // 분
                riskLevel: 'low',
                automated: true
            });
        }

        // 성능 최적화 액션
        if (metrics.cpuUsage > 70) {
            actions.push({
                id: `optimization-${Date.now()}-2`,
                type: 'optimization',
                title: '시스템 성능 최적화',
                description: '시스템 캐시 및 메모리 최적화를 수행합니다.',
                priority: 'medium',
                estimatedImpact: 'CPU 사용률 10% 감소',
                estimatedDuration: 45,
                riskLevel: 'low',
                automated: true
            });
        }

        // 스케일링 액션
        if (metrics.activeConnections > 80) {
            actions.push({
                id: `optimization-${Date.now()}-3`,
                type: 'scaling',
                title: '자동 스케일링',
                description: '시스템 부하에 따라 자동으로 리소스를 확장합니다.',
                priority: 'high',
                estimatedImpact: '응답 시간 50% 개선',
                estimatedDuration: 10,
                riskLevel: 'medium',
                automated: true
            });
        }

        // 유지보수 액션
        if (anomalies.length > 3) {
            actions.push({
                id: `optimization-${Date.now()}-4`,
                type: 'maintenance',
                title: '예방적 유지보수',
                description: '시스템 안정성을 위한 예방적 유지보수를 수행합니다.',
                priority: 'medium',
                estimatedImpact: '시스템 안정성 향상',
                estimatedDuration: 60,
                riskLevel: 'low',
                automated: false
            });
        }

        this.optimizations.push(...actions);
        return actions;
    }

    // 종합 지능 보고서 생성
    generateIntelligenceReport(projects: Project[], chats: Chat[], messages: Message[]): SystemIntelligenceReport {
        const metrics = this.analyzeSystemHealth(projects, chats, messages);
        const anomalies = this.detectAnomalies(metrics);
        const insights = this.generatePredictiveInsights(metrics, projects);
        const optimizations = this.generateOptimizationActions(metrics, anomalies);

        // 전체 건강도 계산
        const overallHealth = Math.max(0, 100 -
            (metrics.cpuUsage * 0.3) -
            (metrics.memoryUsage * 0.3) -
            (metrics.errorRate * 10) -
            (anomalies.length * 5)
        );

        const criticalIssues = anomalies.filter(a => a.severity === 'critical').length;
        const warnings = anomalies.filter(a => a.severity === 'high' || a.severity === 'medium').length;

        const recommendations = [
            ...anomalies.flatMap(a => a.recommendations),
            ...insights.flatMap(i => i.recommendations),
            ...optimizations.map(o => o.title)
        ].slice(0, 10); // 상위 10개 추천사항

        return {
            timestamp: new Date(),
            overallHealth,
            criticalIssues,
            warnings,
            recommendations,
            anomalies,
            insights,
            optimizations
        };
    }

    // 자동 최적화 실행
    async executeOptimization(action: AutoOptimizationAction): Promise<boolean> {
        if (!action.automated) {
            return false;
        }

        try {
            // 시뮬레이션된 최적화 실행
            await new Promise(resolve => setTimeout(resolve, action.estimatedDuration * 1000));

            // 최적화 완료 후 액션 제거
            this.optimizations = this.optimizations.filter(o => o.id !== action.id);

            return true;
        } catch (error) {
            console.error('최적화 실행 실패:', error);
            return false;
        }
    }

    // 이상 징후 해결
    resolveAnomaly(anomalyId: string): void {
        const anomaly = this.anomalies.find(a => a.id === anomalyId);
        if (anomaly) {
            anomaly.resolvedAt = new Date();
        }
    }

    // 히스토리 데이터 조회
    getHealthHistory(): SystemHealthMetrics[] {
        return [...this.healthHistory];
    }

    getAnomalies(): SystemAnomaly[] {
        return [...this.anomalies];
    }

    getInsights(): PredictiveInsight[] {
        return [...this.insights];
    }

    getOptimizations(): AutoOptimizationAction[] {
        return [...this.optimizations];
    }

    // 데이터 초기화
    clearHistory(): void {
        this.healthHistory = [];
        this.anomalies = [];
        this.insights = [];
        this.optimizations = [];
    }
}

export const systemIntelligenceService = new SystemIntelligenceService();
export default systemIntelligenceService;
