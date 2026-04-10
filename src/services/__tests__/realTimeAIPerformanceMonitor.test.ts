/**
 * RealTimeAIPerformanceMonitor 테스트
 */
import realTimeAIPerformanceMonitor from '../realTimeAIPerformanceMonitor';

describe('RealTimeAIPerformanceMonitor', () => {
  it('start 호출 시 오류 없이 실행', () => {
    expect(() => realTimeAIPerformanceMonitor.start()).not.toThrow();
  });

  it('stop 호출 시 오류 없이 실행', () => {
    expect(() => realTimeAIPerformanceMonitor.stop()).not.toThrow();
  });

  it('getMetrics는 빈 배열 반환', () => {
    const metrics = realTimeAIPerformanceMonitor.getMetrics();
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics).toHaveLength(0);
  });

  it('addMetric 호출 시 오류 없이 실행', () => {
    expect(() => realTimeAIPerformanceMonitor.addMetric()).not.toThrow();
  });

  it('recordResponseTime 호출 시 오류 없이 실행', () => {
    expect(() =>
      realTimeAIPerformanceMonitor.recordResponseTime('service1', 100)
    ).not.toThrow();
  });

  it('recordSatisfaction 호출 시 오류 없이 실행', () => {
    expect(() =>
      realTimeAIPerformanceMonitor.recordSatisfaction('user1', 'session1', 5)
    ).not.toThrow();
  });
});
