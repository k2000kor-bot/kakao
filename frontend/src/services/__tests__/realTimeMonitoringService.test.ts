/**
 * realTimeMonitoringService 서비스 테스트
 * 실시간 모니터링 더미 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import realTimeMonitoringService from '../realTimeMonitoringService';

describe('realTimeMonitoringService', () => {
  describe('start', () => {
    it('start 메서드가 존재해야 함', () => {
      expect(typeof realTimeMonitoringService.start).toBe('function');
    });

    it('start 메서드를 호출할 수 있어야 함', () => {
      expect(() => {
        realTimeMonitoringService.start();
      }).not.toThrow();
    });
  });

  describe('stop', () => {
    it('stop 메서드가 존재해야 함', () => {
      expect(typeof realTimeMonitoringService.stop).toBe('function');
    });

    it('stop 메서드를 호출할 수 있어야 함', () => {
      expect(() => {
        realTimeMonitoringService.stop();
      }).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('getMetrics 메서드가 존재해야 함', () => {
      expect(typeof realTimeMonitoringService.getMetrics).toBe('function');
    });

    it('getMetrics는 빈 배열을 반환해야 함', () => {
      const metrics = realTimeMonitoringService.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBe(0);
    });
  });

  describe('isRunning', () => {
    it('isRunning 메서드가 존재해야 함', () => {
      expect(typeof realTimeMonitoringService.isRunning).toBe('function');
    });

    it('isRunning은 false를 반환해야 함', () => {
      const isRunning = realTimeMonitoringService.isRunning();
      expect(isRunning).toBe(false);
    });
  });
});

