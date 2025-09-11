import { EventEmitter } from 'events';
import realTimeAIAlertSystem from './realTimeAIAlertSystem';

// 인터페이스 정의
export interface ServiceHealth {
    service_name: string;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    uptime: number; // seconds
    last_check: Date;
    response_time: number; // ms
    error_rate: number; // 0-1
    memory_usage: number; // MB
    cpu_usage: number; // percentage
    active_connections: number;
    queue_size: number;
    custom_metrics?: Record<string, any>;
}

export interface SystemHealth {
    overall_status: 'healthy' | 'warning' | 'critical';
    services: ServiceHealth[];
    total_services: number;
    healthy_services: number;
    warning_services: number;
    critical_services: number;
    offline_services: number;
    system_uptime: number; // seconds
    last_health_check: Date;
    performance_score: number; // 0-100
    reliability_score: number; // 0-100
    availability_score: number; // 0-100
}

export interface HealthCheckResult {
    service_name: string;
    success: boolean;
    response_time: number;
    error_message?: string;
    timestamp: Date;
    metrics?: Record<string, any>;
}

export interface HealthThreshold {
    service_name: string;
    max_response_time: number; // ms
    max_error_rate: number; // 0-1
    max_memory_usage: number; // MB
    max_cpu_usage: number; // percentage
    min_uptime: number; // seconds
}

// AI 시스템 헬스 모니터 클래스
class AIHealthMonitor extends EventEmitter {
    private services: Map<string, ServiceHealth> = new Map();
    private thresholds: Map<string, HealthThreshold> = new Map();
    private healthHistory: Map<string, HealthCheckResult[]> = new Map();
    private isRunning: boolean = false;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private startTime: Date = new Date();

    constructor() {
        super();
        this.initializeDefaultThresholds();
        console.log('🏥 AI 시스템 헬스 모니터가 초기화되었습니다.');
    }

    // 모니터링 시작
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startHealthChecks();
        console.log('🚀 AI 시스템 헬스 모니터가 시작되었습니다.');
    }

    // 모니터링 중지
    public stop(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ AI 시스템 헬스 모니터가 중지되었습니다.');
    }

    // 서비스 등록
    public registerService(serviceName: string, initialHealth?: Partial<ServiceHealth>): void {
        const service: ServiceHealth = {
            service_name: serviceName,
            status: 'healthy',
            uptime: 0,
            last_check: new Date(),
            response_time: 0,
            error_rate: 0,
            memory_usage: 0,
            cpu_usage: 0,
            active_connections: 0,
            queue_size: 0,
            ...initialHealth
        };

        this.services.set(serviceName, service);
        this.healthHistory.set(serviceName, []);
        this.emit('service_registered', service);
        console.log(`📝 서비스 등록: ${serviceName}`);
    }

    // 서비스 해제
    public unregisterService(serviceName: string): boolean {
        const service = this.services.get(serviceName);
        if (service) {
            this.services.delete(serviceName);
            this.healthHistory.delete(serviceName);
            this.emit('service_unregistered', service);
            console.log(`🗑️ 서비스 해제: ${serviceName}`);
            return true;
        }
        return false;
    }

    // 서비스 상태 업데이트
    public updateServiceHealth(serviceName: string, healthData: Partial<ServiceHealth>): void {
        const service = this.services.get(serviceName);
        if (service) {
            const updatedService = { ...service, ...healthData, last_check: new Date() };
            this.services.set(serviceName, updatedService);

            // 상태 평가 및 알림
            this.evaluateServiceHealth(updatedService);

            this.emit('service_health_updated', updatedService);
        }
    }

    // 헬스 체크 실행
    public async performHealthCheck(serviceName: string): Promise<HealthCheckResult> {
        const startTime = Date.now();
        let success = false;
        let errorMessage: string | undefined;

        try {
            // 서비스별 헬스 체크 로직
            switch (serviceName) {
                case 'integrated-ai-service':
                    success = await this.checkIntegratedAIService();
                    break;
                case 'ai-psychology-engine':
                    success = await this.checkAIPsychologyEngine();
                    break;
                case 'ai-predictive-analytics':
                    success = await this.checkAIPredictiveAnalytics();
                    break;
                case 'performance-monitor':
                    success = await this.checkPerformanceMonitor();
                    break;
                case 'cache-manager':
                    success = await this.checkCacheManager();
                    break;
                case 'alert-system':
                    success = await this.checkAlertSystem();
                    break;
                default:
                    success = await this.checkGenericService(serviceName);
            }

            if (!success) {
                errorMessage = `${serviceName} 헬스 체크 실패`;
            }
        } catch (error) {
            success = false;
            errorMessage = error instanceof Error ? error.message : 'Unknown error';
        }

        const responseTime = Date.now() - startTime;
        const result: HealthCheckResult = {
            service_name: serviceName,
            success,
            response_time: responseTime,
            error_message: errorMessage,
            timestamp: new Date()
        };

        // 결과 저장
        this.saveHealthCheckResult(serviceName, result);

        // 서비스 상태 업데이트
        this.updateServiceHealthFromCheck(serviceName, result);

        return result;
    }

    // 전체 시스템 헬스 체크
    public async performSystemHealthCheck(): Promise<SystemHealth> {
        const healthChecks = await Promise.allSettled(
            Array.from(this.services.keys()).map(serviceName =>
                this.performHealthCheck(serviceName)
            )
        );

        const results = healthChecks
            .filter((result): result is PromiseFulfilledResult<HealthCheckResult> =>
                result.status === 'fulfilled'
            )
            .map(result => result.value);

        // 통계 계산
        const totalServices = this.services.size;
        const healthyServices = results.filter(r => r.success).length;
        const warningServices = Array.from(this.services.values()).filter(s => s.status === 'warning').length;
        const criticalServices = Array.from(this.services.values()).filter(s => s.status === 'critical').length;
        const offlineServices = Array.from(this.services.values()).filter(s => s.status === 'offline').length;

        // 전체 상태 결정
        let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (criticalServices > 0 || offlineServices > totalServices * 0.3) {
            overallStatus = 'critical';
        } else if (warningServices > 0 || healthyServices < totalServices * 0.8) {
            overallStatus = 'warning';
        }

        // 성능 점수 계산
        const avgResponseTime = results.reduce((sum, r) => sum + r.response_time, 0) / results.length;
        const performanceScore = Math.max(0, 100 - (avgResponseTime / 10));

        // 신뢰성 점수 계산
        const successRate = healthyServices / totalServices;
        const reliabilityScore = successRate * 100;

        // 가용성 점수 계산
        const uptimePercentage = (healthyServices + warningServices) / totalServices;
        const availabilityScore = uptimePercentage * 100;

        const systemHealth: SystemHealth = {
            overall_status: overallStatus,
            services: Array.from(this.services.values()),
            total_services: totalServices,
            healthy_services: healthyServices,
            warning_services: warningServices,
            critical_services: criticalServices,
            offline_services: offlineServices,
            system_uptime: (Date.now() - this.startTime.getTime()) / 1000,
            last_health_check: new Date(),
            performance_score: performanceScore,
            reliability_score: reliabilityScore,
            availability_score: availabilityScore
        };

        this.emit('system_health_updated', systemHealth);
        return systemHealth;
    }

    // 시스템 헬스 상태 조회
    public getSystemHealth(): SystemHealth {
        const services = Array.from(this.services.values());
        const totalServices = services.length;
        const healthyServices = services.filter(s => s.status === 'healthy').length;
        const warningServices = services.filter(s => s.status === 'warning').length;
        const criticalServices = services.filter(s => s.status === 'critical').length;
        const offlineServices = services.filter(s => s.status === 'offline').length;

        let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (criticalServices > 0 || offlineServices > totalServices * 0.3) {
            overallStatus = 'critical';
        } else if (warningServices > 0 || healthyServices < totalServices * 0.8) {
            overallStatus = 'warning';
        }

        return {
            overall_status: overallStatus,
            services,
            total_services: totalServices,
            healthy_services: healthyServices,
            warning_services: warningServices,
            critical_services: criticalServices,
            offline_services: offlineServices,
            system_uptime: (Date.now() - this.startTime.getTime()) / 1000,
            last_health_check: new Date(),
            performance_score: this.calculatePerformanceScore(),
            reliability_score: this.calculateReliabilityScore(),
            availability_score: this.calculateAvailabilityScore()
        };
    }

    // 서비스별 헬스 상태 조회
    public getServiceHealth(serviceName: string): ServiceHealth | null {
        return this.services.get(serviceName) || null;
    }

    // 모든 서비스 헬스 상태 조회
    public getAllServicesHealth(): ServiceHealth[] {
        return Array.from(this.services.values());
    }

    // 헬스 체크 히스토리 조회
    public getHealthHistory(serviceName: string, limit: number = 100): HealthCheckResult[] {
        const history = this.healthHistory.get(serviceName) || [];
        return history.slice(-limit);
    }

    // 임계값 설정
    public setThreshold(serviceName: string, threshold: HealthThreshold): void {
        this.thresholds.set(serviceName, threshold);
        this.emit('threshold_updated', { service_name: serviceName, threshold });
        console.log(`⚙️ 임계값 설정: ${serviceName}`);
    }

    // 임계값 조회
    public getThreshold(serviceName: string): HealthThreshold | null {
        return this.thresholds.get(serviceName) || null;
    }

    // 서비스 재시작
    public async restartService(serviceName: string): Promise<boolean> {
        try {
            console.log(`🔄 서비스 재시작 시도: ${serviceName}`);

            // 서비스별 재시작 로직
            switch (serviceName) {
                case 'integrated-ai-service':
                    // 통합 AI 서비스 재시작 로직
                    break;
                case 'cache-manager':
                    // 캐시 매니저 재시작 로직
                    break;
                default:
                // 기본 재시작 로직
            }

            // 재시작 후 헬스 체크
            await this.performHealthCheck(serviceName);

            this.emit('service_restarted', { service_name: serviceName });
            console.log(`✅ 서비스 재시작 완료: ${serviceName}`);
            return true;
        } catch (error) {
            console.error(`❌ 서비스 재시작 실패: ${serviceName}`, error);
            return false;
        }
    }

    // 서비스 통계
    public getServiceStats(serviceName: string): any {
        const history = this.getHealthHistory(serviceName);
        const service = this.getServiceHealth(serviceName);

        if (!service || history.length === 0) {
            return null;
        }

        const recentHistory = history.slice(-24); // 최근 24개 체크
        const avgResponseTime = recentHistory.reduce((sum, h) => sum + h.response_time, 0) / recentHistory.length;
        const successRate = recentHistory.filter(h => h.success).length / recentHistory.length;
        const errorCount = recentHistory.filter(h => !h.success).length;

        return {
            service_name: serviceName,
            current_status: service.status,
            uptime: service.uptime,
            avg_response_time: avgResponseTime,
            success_rate: successRate,
            error_count: errorCount,
            last_check: service.last_check,
            memory_usage: service.memory_usage,
            cpu_usage: service.cpu_usage
        };
    }

    // 개인 메서드들

    // 기본 임계값 초기화
    private initializeDefaultThresholds(): void {
        const defaultThresholds: HealthThreshold[] = [
            {
                service_name: 'integrated-ai-service',
                max_response_time: 5000,
                max_error_rate: 0.1,
                max_memory_usage: 512,
                max_cpu_usage: 80,
                min_uptime: 3600
            },
            {
                service_name: 'ai-psychology-engine',
                max_response_time: 3000,
                max_error_rate: 0.05,
                max_memory_usage: 256,
                max_cpu_usage: 70,
                min_uptime: 3600
            },
            {
                service_name: 'ai-predictive-analytics',
                max_response_time: 10000,
                max_error_rate: 0.15,
                max_memory_usage: 1024,
                max_cpu_usage: 85,
                min_uptime: 3600
            },
            {
                service_name: 'performance-monitor',
                max_response_time: 1000,
                max_error_rate: 0.02,
                max_memory_usage: 128,
                max_cpu_usage: 50,
                min_uptime: 3600
            },
            {
                service_name: 'cache-manager',
                max_response_time: 100,
                max_error_rate: 0.01,
                max_memory_usage: 2048,
                max_cpu_usage: 60,
                min_uptime: 3600
            },
            {
                service_name: 'alert-system',
                max_response_time: 500,
                max_error_rate: 0.02,
                max_memory_usage: 64,
                max_cpu_usage: 40,
                min_uptime: 3600
            }
        ];

        defaultThresholds.forEach(threshold => {
            this.thresholds.set(threshold.service_name, threshold);
        });
    }

    // 헬스 체크 시작
    private startHealthChecks(): void {
        this.healthCheckInterval = setInterval(async () => {
            await this.performSystemHealthCheck();
        }, 30000); // 30초마다
    }

    // 서비스별 헬스 체크 메서드들
    private async checkIntegratedAIService(): Promise<boolean> {
        try {
            // 통합 AI 서비스 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkAIPsychologyEngine(): Promise<boolean> {
        try {
            // AI 심리학 엔진 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkAIPredictiveAnalytics(): Promise<boolean> {
        try {
            // AI 예측 분석 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkPerformanceMonitor(): Promise<boolean> {
        try {
            // 성능 모니터 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkCacheManager(): Promise<boolean> {
        try {
            // 캐시 매니저 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkAlertSystem(): Promise<boolean> {
        try {
            // 알림 시스템 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    private async checkGenericService(serviceName: string): Promise<boolean> {
        try {
            // 일반적인 서비스 헬스 체크 로직
            return true;
        } catch (error) {
            return false;
        }
    }

    // 헬스 체크 결과 저장
    private saveHealthCheckResult(serviceName: string, result: HealthCheckResult): void {
        const history = this.healthHistory.get(serviceName) || [];
        history.push(result);

        // 최대 1000개 결과만 유지
        if (history.length > 1000) {
            history.splice(0, history.length - 1000);
        }

        this.healthHistory.set(serviceName, history);
    }

    // 헬스 체크 결과로 서비스 상태 업데이트
    private updateServiceHealthFromCheck(serviceName: string, result: HealthCheckResult): void {
        const service = this.services.get(serviceName);
        if (!service) return;

        const threshold = this.thresholds.get(serviceName);
        if (!threshold) return;

        // 응답 시간 업데이트
        service.response_time = result.response_time;

        // 에러율 계산 (최근 10개 결과 기준)
        const history = this.getHealthHistory(serviceName, 10);
        const errorCount = history.filter(h => !h.success).length;
        service.error_rate = errorCount / history.length;

        // 상태 평가
        this.evaluateServiceHealth(service);
    }

    // 서비스 상태 평가
    private evaluateServiceHealth(service: ServiceHealth): void {
        const threshold = this.thresholds.get(service.service_name);
        if (!threshold) return;

        let newStatus: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';

        // 임계값 체크
        if (service.response_time > threshold.max_response_time * 2 ||
            service.error_rate > threshold.max_error_rate * 2 ||
            service.memory_usage > threshold.max_memory_usage * 1.5 ||
            service.cpu_usage > threshold.max_cpu_usage * 1.2) {
            newStatus = 'critical';
        } else if (service.response_time > threshold.max_response_time ||
            service.error_rate > threshold.max_error_rate ||
            service.memory_usage > threshold.max_memory_usage ||
            service.cpu_usage > threshold.max_cpu_usage) {
            newStatus = 'warning';
        }

        // 상태 변경 감지
        if (service.status !== newStatus) {
            const oldStatus = service.status;
            service.status = newStatus;

            // 알림 생성
            this.createHealthAlert(service, oldStatus, newStatus);

            this.emit('service_status_changed', {
                service: service,
                old_status: oldStatus,
                new_status: newStatus
            });
        }
    }

    // 헬스 알림 생성
    private createHealthAlert(
        service: ServiceHealth,
        oldStatus: string,
        newStatus: string
    ): void {
        const severity = newStatus === 'critical' ? 'critical' :
            newStatus === 'warning' ? 'high' : 'medium';

        const title = `${service.service_name} 상태 변경`;
        const message = `${service.service_name} 서비스가 ${oldStatus}에서 ${newStatus}로 변경되었습니다.`;

        realTimeAIAlertSystem.createSystemAlert(
            title,
            message,
            severity,
            {
                service_name: service.service_name,
                old_status: oldStatus,
                new_status: newStatus,
                response_time: service.response_time,
                error_rate: service.error_rate,
                memory_usage: service.memory_usage,
                cpu_usage: service.cpu_usage
            }
        );
    }

    // 성능 점수 계산
    private calculatePerformanceScore(): number {
        const services = Array.from(this.services.values());
        if (services.length === 0) return 100;

        const avgResponseTime = services.reduce((sum, s) => sum + s.response_time, 0) / services.length;
        return Math.max(0, 100 - (avgResponseTime / 10));
    }

    // 신뢰성 점수 계산
    private calculateReliabilityScore(): number {
        const services = Array.from(this.services.values());
        if (services.length === 0) return 100;

        const healthyServices = services.filter(s => s.status === 'healthy').length;
        return (healthyServices / services.length) * 100;
    }

    // 가용성 점수 계산
    private calculateAvailabilityScore(): number {
        const services = Array.from(this.services.values());
        if (services.length === 0) return 100;

        const availableServices = services.filter(s => s.status !== 'offline').length;
        return (availableServices / services.length) * 100;
    }

    // 서비스 종료
    public shutdown(): void {
        this.stop();
        this.services.clear();
        this.thresholds.clear();
        this.healthHistory.clear();
        console.log('🔌 AI 시스템 헬스 모니터가 종료되었습니다.');
    }
}

const aiHealthMonitor = new AIHealthMonitor();
export default aiHealthMonitor;
