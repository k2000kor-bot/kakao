import { EventEmitter } from 'events';

// 인터페이스 정의
export interface AIAlert {
    id: string;
    type: 'info' | 'warning' | 'error' | 'critical' | 'success';
    category: 'performance' | 'security' | 'system' | 'user' | 'learning' | 'prediction';
    title: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    user_id?: string;
    session_id?: string;
    metadata?: any;
    acknowledged: boolean;
    resolved: boolean;
    auto_resolve: boolean;
    expires_at?: Date;
    actions?: AlertAction[];
}

export interface AlertAction {
    id: string;
    label: string;
    type: 'button' | 'link' | 'command';
    action: string;
    icon?: string;
    color?: string;
}

export interface AlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: AlertCondition[];
    actions: AlertAction[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    cooldown: number; // seconds
    last_triggered?: Date;
}

export interface AlertCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: any;
    logical_operator?: 'and' | 'or';
}

export interface AlertStats {
    total_alerts: number;
    active_alerts: number;
    resolved_alerts: number;
    critical_alerts: number;
    alerts_by_type: Record<string, number>;
    alerts_by_category: Record<string, number>;
    average_resolution_time: number; // minutes
    alert_trend: 'increasing' | 'decreasing' | 'stable';
}

// 실시간 AI 알림 시스템 클래스
class RealTimeAIAlertSystem extends EventEmitter {
    private alerts: Map<string, AIAlert> = new Map();
    private rules: Map<string, AlertRule> = new Map();
    private subscribers: Map<string, (alert: AIAlert) => void> = new Map();
    private isRunning: boolean = false;
    private alertCounter: number = 0;
    private autoResolveInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.initializeDefaultRules();
        console.log('🚨 실시간 AI 알림 시스템이 초기화되었습니다.');
    }

    // 시스템 시작
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startAutoResolve();
        console.log('🚀 실시간 AI 알림 시스템이 시작되었습니다.');
    }

    // 시스템 중지
    public stop(): void {
        if (this.autoResolveInterval) {
            clearInterval(this.autoResolveInterval);
            this.autoResolveInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ 실시간 AI 알림 시스템이 중지되었습니다.');
    }

    // 알림 생성
    public createAlert(alertData: Omit<AIAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>): string {
        const alertId = `alert-${Date.now()}-${++this.alertCounter}`;
        const alert: AIAlert = {
            ...alertData,
            id: alertId,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false
        };

        this.alerts.set(alertId, alert);
        this.emit('alert_created', alert);
        this.notifySubscribers(alert);

        console.log(`🚨 알림 생성: ${alert.title} (${alert.severity})`);
        return alertId;
    }

    // 성능 알림
    public createPerformanceAlert(
        title: string,
        message: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning',
            category: 'performance',
            title,
            message,
            severity,
            source: 'performance-monitor',
            metadata
        });
    }

    // 보안 알림
    public createSecurityAlert(
        title: string,
        message: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : 'error',
            category: 'security',
            title,
            message,
            severity,
            source: 'security-monitor',
            metadata
        });
    }

    // 시스템 알림
    public createSystemAlert(
        title: string,
        message: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning',
            category: 'system',
            title,
            message,
            severity,
            source: 'system-monitor',
            metadata
        });
    }

    // 사용자 알림
    public createUserAlert(
        title: string,
        message: string,
        user_id: string,
        session_id?: string,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'info',
            category: 'user',
            title,
            message,
            severity,
            source: 'user-interface',
            user_id,
            session_id,
            metadata
        });
    }

    // 학습 알림
    public createLearningAlert(
        title: string,
        message: string,
        user_id: string,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'info',
            category: 'learning',
            title,
            message,
            severity,
            source: 'learning-engine',
            user_id,
            metadata
        });
    }

    // 예측 알림
    public createPredictionAlert(
        title: string,
        message: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        metadata?: any
    ): string {
        return this.createAlert({
            type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning',
            category: 'prediction',
            title,
            message,
            severity,
            source: 'prediction-engine',
            metadata
        });
    }

    // 알림 확인
    public acknowledgeAlert(alertId: string): boolean {
        const alert = this.alerts.get(alertId);
        if (alert && !alert.acknowledged) {
            alert.acknowledged = true;
            this.emit('alert_acknowledged', alert);
            console.log(`✅ 알림 확인: ${alert.title}`);
            return true;
        }
        return false;
    }

    // 알림 해결
    public resolveAlert(alertId: string): boolean {
        const alert = this.alerts.get(alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            this.emit('alert_resolved', alert);
            console.log(`✅ 알림 해결: ${alert.title}`);
            return true;
        }
        return false;
    }

    // 알림 삭제
    public deleteAlert(alertId: string): boolean {
        const alert = this.alerts.get(alertId);
        if (alert) {
            this.alerts.delete(alertId);
            this.emit('alert_deleted', alert);
            console.log(`🗑️ 알림 삭제: ${alert.title}`);
            return true;
        }
        return false;
    }

    // 알림 조회
    public getAlert(alertId: string): AIAlert | null {
        return this.alerts.get(alertId) || null;
    }

    // 모든 알림 조회
    public getAllAlerts(): AIAlert[] {
        return Array.from(this.alerts.values());
    }

    // 활성 알림 조회
    public getActiveAlerts(): AIAlert[] {
        return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
    }

    // 카테고리별 알림 조회
    public getAlertsByCategory(category: string): AIAlert[] {
        return Array.from(this.alerts.values()).filter(alert => alert.category === category);
    }

    // 심각도별 알림 조회
    public getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): AIAlert[] {
        return Array.from(this.alerts.values()).filter(alert => alert.severity === severity);
    }

    // 사용자별 알림 조회
    public getAlertsByUser(userId: string): AIAlert[] {
        return Array.from(this.alerts.values()).filter(alert => alert.user_id === userId);
    }

    // 알림 규칙 추가
    public addRule(rule: AlertRule): void {
        this.rules.set(rule.id, rule);
        this.emit('rule_added', rule);
        console.log(`📋 알림 규칙 추가: ${rule.name}`);
    }

    // 알림 규칙 제거
    public removeRule(ruleId: string): boolean {
        const rule = this.rules.get(ruleId);
        if (rule) {
            this.rules.delete(ruleId);
            this.emit('rule_removed', rule);
            console.log(`🗑️ 알림 규칙 제거: ${rule.name}`);
            return true;
        }
        return false;
    }

    // 알림 규칙 조회
    public getRule(ruleId: string): AlertRule | null {
        return this.rules.get(ruleId) || null;
    }

    // 모든 규칙 조회
    public getAllRules(): AlertRule[] {
        return Array.from(this.rules.values());
    }

    // 이벤트 처리 (규칙 기반 알림)
    public processEvent(event: any): void {
        for (const rule of this.rules.values()) {
            if (!rule.enabled) continue;

            // 쿨다운 확인
            if (rule.last_triggered) {
                const timeSinceLastTrigger = Date.now() - rule.last_triggered.getTime();
                if (timeSinceLastTrigger < rule.cooldown * 1000) continue;
            }

            // 조건 확인
            if (this.evaluateConditions(event, rule.conditions)) {
                this.triggerRule(rule, event);
            }
        }
    }

    // 구독자 등록
    public subscribe(subscriberId: string, callback: (alert: AIAlert) => void): void {
        this.subscribers.set(subscriberId, callback);
        console.log(`👥 알림 구독자 등록: ${subscriberId}`);
    }

    // 구독자 해제
    public unsubscribe(subscriberId: string): boolean {
        const removed = this.subscribers.delete(subscriberId);
        if (removed) {
            console.log(`👥 알림 구독자 해제: ${subscriberId}`);
        }
        return removed;
    }

    // 알림 통계
    public getStats(): AlertStats {
        const allAlerts = Array.from(this.alerts.values());
        const activeAlerts = allAlerts.filter(alert => !alert.resolved);
        const resolvedAlerts = allAlerts.filter(alert => alert.resolved);
        const criticalAlerts = allAlerts.filter(alert => alert.severity === 'critical');

        // 타입별 통계
        const alertsByType: Record<string, number> = {};
        allAlerts.forEach(alert => {
            alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
        });

        // 카테고리별 통계
        const alertsByCategory: Record<string, number> = {};
        allAlerts.forEach(alert => {
            alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
        });

        // 평균 해결 시간 계산
        const resolvedWithTime = resolvedAlerts.filter(alert => alert.timestamp);
        const averageResolutionTime = resolvedWithTime.length > 0
            ? resolvedWithTime.reduce((sum, alert) => {
                const resolutionTime = alert.timestamp ? Date.now() - alert.timestamp.getTime() : 0;
                return sum + resolutionTime;
            }, 0) / resolvedWithTime.length / (1000 * 60) // minutes
            : 0;

        // 트렌드 분석 (최근 1시간 vs 이전 1시간)
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);

        const recentAlerts = allAlerts.filter(alert => alert.timestamp.getTime() > oneHourAgo);
        const previousAlerts = allAlerts.filter(alert =>
            alert.timestamp.getTime() > twoHoursAgo && alert.timestamp.getTime() <= oneHourAgo
        );

        let alertTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (recentAlerts.length > previousAlerts.length * 1.2) {
            alertTrend = 'increasing';
        } else if (recentAlerts.length < previousAlerts.length * 0.8) {
            alertTrend = 'decreasing';
        }

        return {
            total_alerts: allAlerts.length,
            active_alerts: activeAlerts.length,
            resolved_alerts: resolvedAlerts.length,
            critical_alerts: criticalAlerts.length,
            alerts_by_type: alertsByType,
            alerts_by_category: alertsByCategory,
            average_resolution_time: averageResolutionTime,
            alert_trend: alertTrend
        };
    }

    // 알림 정리 (오래된 알림 삭제)
    public cleanupOldAlerts(maxAgeHours: number = 24): number {
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
        let deletedCount = 0;

        for (const [alertId, alert] of this.alerts.entries()) {
            if (alert.timestamp.getTime() < cutoffTime && alert.resolved) {
                this.alerts.delete(alertId);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`🧹 오래된 알림 정리: ${deletedCount}개 삭제`);
        }

        return deletedCount;
    }

    // 개인 메서드들

    // 기본 규칙 초기화
    private initializeDefaultRules(): void {
        // 성능 관련 규칙
        this.addRule({
            id: 'high-cpu-usage',
            name: '높은 CPU 사용률',
            description: 'CPU 사용률이 80%를 초과할 때 알림',
            enabled: true,
            conditions: [
                { field: 'cpu_usage', operator: 'greater_than', value: 80 }
            ],
            actions: [
                { id: 'view-details', label: '상세 보기', type: 'button', action: 'view_performance_details', icon: 'monitor' }
            ],
            priority: 'high',
            category: 'performance',
            cooldown: 300 // 5분
        });

        // 메모리 관련 규칙
        this.addRule({
            id: 'high-memory-usage',
            name: '높은 메모리 사용률',
            description: '메모리 사용률이 85%를 초과할 때 알림',
            enabled: true,
            conditions: [
                { field: 'memory_usage', operator: 'greater_than', value: 85 }
            ],
            actions: [
                { id: 'optimize-memory', label: '메모리 최적화', type: 'button', action: 'optimize_memory', icon: 'memory' }
            ],
            priority: 'high',
            category: 'performance',
            cooldown: 300
        });

        // 보안 관련 규칙
        this.addRule({
            id: 'suspicious-activity',
            name: '의심스러운 활동 감지',
            description: '비정상적인 사용자 활동이 감지될 때 알림',
            enabled: true,
            conditions: [
                { field: 'suspicious_score', operator: 'greater_than', value: 0.7 }
            ],
            actions: [
                { id: 'investigate', label: '조사', type: 'button', action: 'investigate_security', icon: 'security' }
            ],
            priority: 'critical',
            category: 'security',
            cooldown: 60
        });

        // 학습 관련 규칙
        this.addRule({
            id: 'learning-struggle',
            name: '학습 어려움 감지',
            description: '사용자가 학습에 어려움을 겪고 있을 때 알림',
            enabled: true,
            conditions: [
                { field: 'learning_difficulty_score', operator: 'greater_than', value: 0.6 }
            ],
            actions: [
                { id: 'provide-help', label: '도움 제공', type: 'button', action: 'provide_learning_help', icon: 'help' }
            ],
            priority: 'medium',
            category: 'learning',
            cooldown: 600 // 10분
        });

        // 예측 관련 규칙
        this.addRule({
            id: 'prediction-anomaly',
            name: '예측 이상 감지',
            description: '예측 모델에서 이상이 감지될 때 알림',
            enabled: true,
            conditions: [
                { field: 'prediction_confidence', operator: 'less_than', value: 0.5 }
            ],
            actions: [
                { id: 'retrain-model', label: '모델 재훈련', type: 'button', action: 'retrain_prediction_model', icon: 'refresh' }
            ],
            priority: 'high',
            category: 'prediction',
            cooldown: 1800 // 30분
        });
    }

    // 조건 평가
    private evaluateConditions(event: any, conditions: AlertCondition[]): boolean {
        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            const result = this.evaluateCondition(event, condition);

            if (i === 0) continue; // 첫 번째 조건은 논리 연산자 없음

            const previousCondition = conditions[i - 1];
            if (previousCondition.logical_operator === 'and') {
                if (!result) return false;
            } else if (previousCondition.logical_operator === 'or') {
                if (result) return true;
            }
        }

        return true;
    }

    // 단일 조건 평가
    private evaluateCondition(event: any, condition: AlertCondition): boolean {
        const value = this.getNestedValue(event, condition.field);

        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'not_equals':
                return value !== condition.value;
            case 'greater_than':
                return typeof value === 'number' && value > condition.value;
            case 'less_than':
                return typeof value === 'number' && value < condition.value;
            case 'contains':
                return typeof value === 'string' && value.includes(condition.value);
            case 'regex':
                return typeof value === 'string' && new RegExp(condition.value).test(value);
            default:
                return false;
        }
    }

    // 중첩된 객체에서 값 가져오기
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // 규칙 트리거
    private triggerRule(rule: AlertRule, event: any): void {
        rule.last_triggered = new Date();

        const alertId = this.createAlert({
            type: rule.priority === 'critical' ? 'critical' : rule.priority === 'high' ? 'error' : 'warning',
            category: rule.category as any,
            title: rule.name,
            message: rule.description,
            severity: rule.priority,
            source: 'alert-rule',
            metadata: { rule_id: rule.id, event },
            actions: rule.actions,
            auto_resolve: false
        });

        this.emit('rule_triggered', { rule, alert_id: alertId, event });
        console.log(`🚨 규칙 트리거: ${rule.name}`);
    }

    // 구독자에게 알림
    private notifySubscribers(alert: AIAlert): void {
        for (const [subscriberId, callback] of this.subscribers) {
            try {
                callback(alert);
            } catch (error) {
                console.error(`알림 구독자 오류 (${subscriberId}):`, error);
            }
        }
    }

    // 자동 해결 시작
    private startAutoResolve(): void {
        this.autoResolveInterval = setInterval(() => {
            this.autoResolveAlerts();
        }, 60000); // 1분마다
    }

    // 자동 해결 처리
    private autoResolveAlerts(): void {
        const now = new Date();
        let resolvedCount = 0;

        for (const alert of this.alerts.values()) {
            if (alert.auto_resolve && !alert.resolved) {
                // 만료 시간 확인
                if (alert.expires_at && alert.expires_at < now) {
                    alert.resolved = true;
                    resolvedCount++;
                    this.emit('alert_auto_resolved', alert);
                }
            }
        }

        if (resolvedCount > 0) {
            console.log(`⏰ 자동 해결: ${resolvedCount}개 알림`);
        }
    }

    // 간단한 알림 전송
    public sendAlert(type: 'info' | 'warning' | 'error' | 'critical' | 'success', message: string, options?: {
        title?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        source?: string;
        user_id?: string;
        session_id?: string;
    }): string {
        return this.createAlert({
            type,
            category: 'system',
            title: options?.title || message,
            message,
            severity: options?.severity || 'medium',
            source: options?.source || 'system',
            user_id: options?.user_id,
            session_id: options?.session_id,
            auto_resolve: type !== 'critical' && type !== 'error'
        });
    }

    // 서비스 종료
    public shutdown(): void {
        this.stop();
        this.alerts.clear();
        this.rules.clear();
        this.subscribers.clear();
        console.log('🔌 실시간 AI 알림 시스템이 종료되었습니다.');
    }
}

const realTimeAIAlertSystem = new RealTimeAIAlertSystem();
export default realTimeAIAlertSystem;
