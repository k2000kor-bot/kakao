/**
 * WebSocketService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  WebSocketService,
  websocketService,
  MetricsWebSocket,
  AlertsWebSocket,
  metricsWebSocket,
  alertsWebSocket,
  SystemMetrics,
  SecurityAlert,
  AIEngineStatus,
  PerformanceOptimization,
} from '../websocketService';

// WebSocket 모킹
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // 비동기로 연결 시뮬레이션
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(_data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(new CloseEvent('close'));
      }
    }, 0);
  }
}

// WebSocket을 MockWebSocket으로 교체
(global as unknown as Record<string, unknown>).WebSocket = MockWebSocket;

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // 새 인스턴스 생성 (생성자에서 connect 호출)
    service = new WebSocketService();
    
    // WebSocket 인스턴스 가져오기
    jest.advanceTimersByTime(1);
    mockWs = (service as unknown as { ws: MockWebSocket }).ws;
  });

  afterEach(() => {
    jest.useRealTimers();
    if (service) {
      service.disconnect();
    }
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(WebSocketService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(websocketService).toBeDefined();
      expect(websocketService).toBeInstanceOf(WebSocketService);
    });
  });

  describe('연결 관리', () => {
    it('연결 상태 확인', () => {
      jest.advanceTimersByTime(10);
      expect(service.getConnectionStatus()).toBe(true);
    });

    it('연결 해제', () => {
      jest.advanceTimersByTime(10);
      service.disconnect();
      jest.advanceTimersByTime(10);
      expect(service.getConnectionStatus()).toBe(false);
    });
  });

  describe('메시지 전송', () => {
    it('메시지 전송 성공', () => {
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(mockWs, 'send');
      const message = { type: 'test', data: 'test' };

      service.send(message);

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('sendMessage는 timestamp와 data 래핑으로 전송한다', () => {
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(mockWs, 'send');

      service.sendMessage({ type: 'switch_model', data: { model: 'm1' } });

      expect(sendSpy).toHaveBeenCalledTimes(1);
      const payload = JSON.parse(sendSpy.mock.calls[0][0] as string);
      expect(payload.type).toBe('switch_model');
      expect(payload.data).toEqual({ model: 'm1' });
      expect(typeof payload.timestamp).toBe('string');
    });

    it('sendMessage는 data 생략 시 빈 객체를 넣는다', () => {
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(mockWs, 'send');

      service.sendMessage({ type: 'ping_only' });

      const payload = JSON.parse(sendSpy.mock.calls[0][0] as string);
      expect(payload.type).toBe('ping_only');
      expect(payload.data).toEqual({});
    });

    it('isConnected는 getConnectionStatus와 동일하다', () => {
      jest.advanceTimersByTime(10);
      expect(service.isConnected()).toBe(service.getConnectionStatus());
      expect(service.isConnected()).toBe(true);
    });

    it('연결되지 않은 상태에서 메시지 전송', () => {
      service.disconnect();
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(mockWs, 'send');

      service.send({ type: 'test' });

      // send는 호출되지 않아야 함 (readyState가 OPEN이 아님)
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe('이벤트 리스너', () => {
    it('이벤트 리스너 등록', () => {
      const callback = jest.fn();
      service.on('test', callback);

      // emit을 통해 테스트
      (service as unknown as { emit: (event: string, payload: unknown) => void }).emit('test', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('이벤트 리스너 제거', () => {
      const callback = jest.fn();
      service.on('test', callback);
      service.off('test', callback);

      (service as unknown as { emit: (event: string, payload: unknown) => void }).emit('test', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('여러 리스너 등록', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      service.on('test', callback1);
      service.on('test', callback2);

      (service as unknown as { emit: (event: string, payload: unknown) => void }).emit('test', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('요청 메서드', () => {
    beforeEach(() => {
      jest.advanceTimersByTime(10);
    });

    it('메트릭 요청', () => {
      const sendSpy = jest.spyOn(service, 'send');
      service.requestMetrics();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'request_metrics',
        })
      );
    });

    it('보안 알림 요청', () => {
      const sendSpy = jest.spyOn(service, 'send');
      service.requestSecurityAlerts();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'request_security',
        })
      );
    });

    it('AI 상태 요청', () => {
      const sendSpy = jest.spyOn(service, 'send');
      service.requestAIStatus();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'request_ai_status',
        })
      );
    });

    it('성능 최적화 요청', () => {
      const sendSpy = jest.spyOn(service, 'send');
      service.requestPerformanceOptimization();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'request_performance',
        })
      );
    });
  });

  describe('메시지 처리', () => {
    beforeEach(() => {
      jest.advanceTimersByTime(10);
    });

    it('시스템 메트릭 메시지 처리', () => {
      const callback = jest.fn();
      service.on('systemMetrics', callback);

      const metrics: SystemMetrics = {
        cpu: 50,
        memory: 60,
        disk: 70,
        network: 80,
        responseTime: 100,
        errorRate: 0.1,
        activeConnections: 10,
      };

      const message = {
        type: 'system_metrics',
        timestamp: new Date().toISOString(),
        data: metrics,
      };

      mockWs.onmessage!({ data: JSON.stringify(message) } as MessageEvent);

      expect(callback).toHaveBeenCalledWith(metrics);
    });

    it('보안 알림 메시지 처리', () => {
      const callback = jest.fn();
      service.on('securityAlert', callback);

      const alert: SecurityAlert = {
        alert_type: 'unauthorized_access',
        severity: 'high',
        message: 'Unauthorized access detected',
        source: '192.168.1.1',
        action: 'blocked',
      };

      const message = {
        type: 'security_alert',
        timestamp: new Date().toISOString(),
        data: alert,
      };

      mockWs.onmessage!({ data: JSON.stringify(message) } as MessageEvent);

      expect(callback).toHaveBeenCalledWith(alert);
    });

    it('AI 엔진 상태 메시지 처리', () => {
      const callback = jest.fn();
      service.on('aiEngineStatus', callback);

      const status: AIEngineStatus = {
        models: [],
        overall_performance: 0.9,
        active_requests: 5,
      };

      const message = {
        type: 'ai_engine_status',
        timestamp: new Date().toISOString(),
        data: status,
      };

      mockWs.onmessage!({ data: JSON.stringify(message) } as MessageEvent);

      expect(callback).toHaveBeenCalledWith(status);
    });

    it('성능 최적화 메시지 처리', () => {
      const callback = jest.fn();
      service.on('performanceOptimization', callback);

      const optimization: PerformanceOptimization = {
        optimization_type: 'cache',
        status: 'running',
        progress: 50,
        estimated_completion: 1000,
        performance_gain: 0.2,
      };

      const message = {
        type: 'performance_optimization',
        timestamp: new Date().toISOString(),
        data: optimization,
      };

      mockWs.onmessage!({ data: JSON.stringify(message) } as MessageEvent);

      expect(callback).toHaveBeenCalledWith(optimization);
    });

    it('알 수 없는 메시지 타입 처리', () => {
      const message = {
        type: 'unknown_type',
        timestamp: new Date().toISOString(),
        data: {},
      };

      // 에러가 발생하지 않아야 함
      expect(() => {
        mockWs.onmessage!({ data: JSON.stringify(message) } as MessageEvent);
      }).not.toThrow();
    });

    it('잘못된 JSON 메시지 처리', () => {
      // 에러가 발생하지 않아야 함
      expect(() => {
        mockWs.onmessage!({ data: 'invalid json' } as MessageEvent);
      }).not.toThrow();
    });
  });

  describe('연결 이벤트', () => {
    it('연결 성공 이벤트', () => {
      // 새 서비스 인스턴스 생성하여 연결 이벤트를 캡처
      const callback = jest.fn();
      const newService = new WebSocketService();
      newService.on('connected', callback);

      jest.advanceTimersByTime(10);

      expect(callback).toHaveBeenCalled();
      newService.disconnect();
    });

    it('연결 종료 이벤트', () => {
      const callback = jest.fn();
      service.on('disconnected', callback);

      jest.advanceTimersByTime(10);
      service.disconnect();
      jest.advanceTimersByTime(10);

      expect(callback).toHaveBeenCalled();
    });

    it('에러 이벤트', () => {
      const callback = jest.fn();
      service.on('error', callback);

      jest.advanceTimersByTime(10);
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'));
      }

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('하트비트', () => {
    it('하트비트 시작', () => {
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(service, 'send');

      // 하트비트는 30초마다 실행
      jest.advanceTimersByTime(30000);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ping',
        })
      );
    });

    it('연결 해제 시 하트비트 중지', () => {
      jest.advanceTimersByTime(10);
      const sendSpy = jest.spyOn(service, 'send');

      service.disconnect();
      jest.advanceTimersByTime(30000);

      // 하트비트가 중지되어 send가 호출되지 않아야 함
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });
});

describe('MetricsWebSocket', () => {
  let metricsWs: MetricsWebSocket;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    metricsWs = new MetricsWebSocket();
    jest.advanceTimersByTime(1);
    mockWs = (metricsWs as unknown as { ws: MockWebSocket }).ws;
  });

  afterEach(() => {
    jest.useRealTimers();
    if (metricsWs) {
      metricsWs.disconnect();
    }
  });

  it('인스턴스 생성', () => {
    expect(metricsWs).toBeInstanceOf(MetricsWebSocket);
  });

  it('싱글톤 인스턴스 확인', () => {
    expect(metricsWebSocket).toBeDefined();
    expect(metricsWebSocket).toBeInstanceOf(MetricsWebSocket);
  });

  it('메트릭 메시지 수신', () => {
    const callback = jest.fn();
    metricsWs.on('metrics', callback);

    const metrics: SystemMetrics = {
      cpu: 50,
      memory: 60,
      disk: 70,
      network: 80,
      responseTime: 100,
      errorRate: 0.1,
      activeConnections: 10,
    };

    const message = {
      type: 'system_metrics',
      timestamp: new Date().toISOString(),
      data: metrics,
    };

    jest.advanceTimersByTime(10);
    if (mockWs.onmessage) {
      mockWs.onmessage({ data: JSON.stringify(message) } as MessageEvent);
    }

    expect(callback).toHaveBeenCalledWith(metrics);
  });

  it('연결 해제', () => {
    jest.advanceTimersByTime(10);
    metricsWs.disconnect();
    jest.advanceTimersByTime(10);

    expect((metricsWs as unknown as { ws: MockWebSocket | null }).ws).toBeNull();
  });
});

describe('AlertsWebSocket', () => {
  let alertsWs: AlertsWebSocket;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    alertsWs = new AlertsWebSocket();
    jest.advanceTimersByTime(1);
    mockWs = (alertsWs as unknown as { ws: MockWebSocket }).ws;
  });

  afterEach(() => {
    jest.useRealTimers();
    if (alertsWs) {
      alertsWs.disconnect();
    }
  });

  it('인스턴스 생성', () => {
    expect(alertsWs).toBeInstanceOf(AlertsWebSocket);
  });

  it('싱글톤 인스턴스 확인', () => {
    expect(alertsWebSocket).toBeDefined();
    expect(alertsWebSocket).toBeInstanceOf(AlertsWebSocket);
  });

  it('보안 알림 메시지 수신', () => {
    const callback = jest.fn();
    alertsWs.on('alert', callback);

    const alert: SecurityAlert = {
      alert_type: 'unauthorized_access',
      severity: 'high',
      message: 'Unauthorized access detected',
      source: '192.168.1.1',
      action: 'blocked',
    };

    const message = {
      type: 'security_alert',
      timestamp: new Date().toISOString(),
      data: alert,
    };

    jest.advanceTimersByTime(10);
    if (mockWs.onmessage) {
      mockWs.onmessage({ data: JSON.stringify(message) } as MessageEvent);
    }

    expect(callback).toHaveBeenCalledWith(alert);
  });

  it('연결 해제', () => {
    jest.advanceTimersByTime(10);
    alertsWs.disconnect();
    jest.advanceTimersByTime(10);

    expect((alertsWs as unknown as { ws: MockWebSocket | null }).ws).toBeNull();
  });
});

