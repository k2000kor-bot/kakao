// 더미 서비스 - 비활성화된 서비스 대체용
const realTimeAIAlertSystem = {
    start: () => { },
    stop: () => { },
    sendAlert: (_type: string, _message: string) => { },
    createAlert: (_alert: Record<string, unknown>) => { },
    createSecurityAlert: (_title: string, _message: string, _priority: string, _metadata?: Record<string, unknown>) => { },
    createSystemAlert: (_title: string, _message: string, _severity: string, _metadata?: Record<string, unknown>) => { },
    getAlerts: () => []
};
export default realTimeAIAlertSystem;
