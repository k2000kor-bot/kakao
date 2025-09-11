// 더미 서비스 - 비활성화된 서비스 대체용
export default {
    start: () => { },
    stop: () => { },
    sendAlert: (type: string, message: string) => { },
    createAlert: (alert: any) => { },
    createSecurityAlert: (title: string, message: string, priority: string, metadata?: any) => { },
    createSystemAlert: (title: string, message: string, severity: string, metadata?: any) => { },
    getAlerts: () => []
};
