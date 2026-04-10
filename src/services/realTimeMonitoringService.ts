// 더미 서비스 - 비활성화된 서비스 대체용
const realTimeMonitoringService = {
    start: () => { },
    stop: () => { },
    getMetrics: () => [],
    isRunning: () => false
};
export default realTimeMonitoringService;
