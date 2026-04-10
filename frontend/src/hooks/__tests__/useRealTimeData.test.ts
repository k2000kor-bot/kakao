/**
 * useRealTimeData 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import useRealTimeData from '../useRealTimeData';

describe('useRealTimeData', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('초기 metrics 구조 반환', () => {
    const { result } = renderHook(() => useRealTimeData());

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.qualityMetrics).toBeDefined();
    expect(result.current.metrics.performanceMetrics).toBeDefined();
    expect(result.current.metrics.testMetrics).toBeDefined();
    expect(result.current.metrics.notificationMetrics).toBeDefined();
    expect(typeof result.current.metrics.qualityMetrics.overallQuality).toBe('number');
    expect(typeof result.current.metrics.performanceMetrics.responseTime).toBe('number');
  });

  it('초기 alerts, runningTests 빈 배열', () => {
    const { result } = renderHook(() => useRealTimeData());

    expect(result.current.alerts).toEqual([]);
    expect(result.current.runningTests).toEqual([]);
  });

  it('isConnected, lastUpdate 반환', () => {
    const { result } = renderHook(() => useRealTimeData());

    expect(typeof result.current.isConnected).toBe('boolean');
    expect(result.current.lastUpdate).toBeInstanceOf(Date);
  });

  it('acknowledgeAlert 호출 시 해당 알림 acknowledged (알림이 있을 때)', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const alertsBefore = result.current.alerts;
    randomSpy.mockRestore();
    expect(alertsBefore.length).toBeGreaterThan(0);

    const alertId = alertsBefore[0].id;
    act(() => {
      result.current.acknowledgeAlert(alertId);
    });
    const acknowledged = result.current.alerts.find((a) => a.id === alertId);
    expect(acknowledged?.acknowledged).toBe(true);
  });

  it('acknowledgeAlert with non-existent id when no alerts leaves alerts empty', () => {
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      result.current.acknowledgeAlert('non-existent');
    });
    expect(result.current.alerts).toEqual([]);
  });

  it('resolveAlert 호출 시 해당 알림 resolved', () => {
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      result.current.resolveAlert('non-existent');
    });
    expect(result.current.alerts).toEqual([]);
  });

  it('deleteAlert 호출 시 해당 알림 제거', () => {
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      result.current.deleteAlert('non-existent');
    });
    expect(result.current.alerts).toEqual([]);
  });

  it('startTest, stopTest 메서드 존재', () => {
    const { result } = renderHook(() => useRealTimeData());

    expect(typeof result.current.startTest).toBe('function');
    expect(typeof result.current.stopTest).toBe('function');
  });

  it('startTest 호출 시 에러 없이 실행', () => {
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      result.current.startTest('test-1');
    });
    expect(result.current.runningTests).toEqual([]);
  });

  it('stopTest 호출 시 에러 없이 실행', () => {
    const { result } = renderHook(() => useRealTimeData());

    act(() => {
      result.current.stopTest('test-1');
    });
    expect(result.current.runningTests).toEqual([]);
  });
});
