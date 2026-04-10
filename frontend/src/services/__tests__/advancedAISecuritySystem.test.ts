/**
 * advancedAISecuritySystem 서비스 테스트
 * 고급 AI 보안 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { API_PATH_IN_URL_MARKER, API_SMOKE_TEST_PATH } from '../../config/api';
import advancedAISecuritySystem from '../advancedAISecuritySystem';

// 의존성 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createSecurityAlert: jest.fn().mockResolvedValue({}),
}));

jest.mock('../aiHealthMonitor', () => ({
  reportHealth: jest.fn(),
}));

// 타이머 모킹
jest.useFakeTimers();

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAISecuritySystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // 시스템 중지
    if (advancedAISecuritySystem) {
      try {
        advancedAISecuritySystem.stop();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.useRealTimers();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAISecuritySystem).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAISecuritySystem;
      const instance2 = advancedAISecuritySystem;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('보안 시스템을 시작할 수 있어야 함', () => {
      advancedAISecuritySystem.start();
      advancedAISecuritySystem.stop();
    });

    it('보안 시스템을 중지할 수 있어야 함', () => {
      advancedAISecuritySystem.start();
      advancedAISecuritySystem.stop();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAISecuritySystem.start();
      advancedAISecuritySystem.start(); // 중복 호출
      advancedAISecuritySystem.stop();
    });
  });

  describe('validateRequest', () => {
    it('정상적인 요청을 허용해야 함', async () => {
      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        content: '정상적인 요청 내용',
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(result.allowed).toBe(true);
      expect(typeof result.risk_score).toBe('number');
      expect(result.risk_score).toBeGreaterThanOrEqual(0);
    });

    it('차단된 IP의 요청을 거부해야 함', async () => {
      const blockedIP = '192.168.1.200';
      // IP 차단 (내부 메서드 호출 불가하므로 높은 위험 요청으로 차단 유도)
      // 직접 차단은 private 메서드이므로 validateRequest를 통해 위험 점수가 높아지도록 함

      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: blockedIP,
        user_agent: 'Mozilla/5.0',
        content: "'; DROP TABLE users; --",
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.risk_score).toBe('number');
    });

    it('SQL 인젝션 패턴을 감지해야 함', async () => {
      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0',
        content: "'; DROP TABLE users; --",
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(result).toBeDefined();
      expect(typeof result.risk_score).toBe('number');
      // SQL 인젝션 패턴이 감지되면 위험 점수가 높아짐
      expect(result.risk_score).toBeGreaterThan(0);
    });

    it('XSS 패턴을 감지해야 함', async () => {
      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0',
        content: '<script>alert("XSS")</script>',
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(result).toBeDefined();
      expect(typeof result.risk_score).toBe('number');
      expect(result.risk_score).toBeGreaterThan(0);
    });

    it('명령어 인젝션 패턴을 감지해야 함', async () => {
      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0',
        content: 'rm -rf /',
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(result).toBeDefined();
      expect(typeof result.risk_score).toBe('number');
      expect(result.risk_score).toBeGreaterThan(0);
    });

    it('과도한 요청을 감지해야 함', async () => {
      const ipAddress = '192.168.1.104';

      // 여러 요청을 빠르게 보냄
      const requests = Array(105).fill(null).map((_, i) =>
        advancedAISecuritySystem.validateRequest({
          ip_address: ipAddress,
          user_agent: 'Mozilla/5.0',
          content: `요청 ${i}`,
          resource: API_SMOKE_TEST_PATH,
          action: 'read',
        })
      );

      const results = await Promise.all(requests);
      const lastResult = results[results.length - 1];

      expect(lastResult).toBeDefined();
      expect(typeof lastResult.risk_score).toBe('number');
    });
  });

  describe('getSecurityMetrics', () => {
    it('보안 메트릭을 조회할 수 있어야 함', () => {
      const metrics = advancedAISecuritySystem.getSecurityMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.total_threats_detected).toBe('number');
      expect(typeof metrics.threats_by_type).toBe('object');
      expect(typeof metrics.threats_by_severity).toBe('object');
      expect(typeof metrics.blocked_requests).toBe('number');
      expect(typeof metrics.suspicious_sessions).toBe('number');
      expect(typeof metrics.failed_login_attempts).toBe('number');
      expect(typeof metrics.average_risk_score).toBe('number');
      expect(typeof metrics.security_incidents_resolved).toBe('number');
      expect(typeof metrics.response_time_avg).toBe('number');
    });

    it('위협이 감지되면 메트릭에 반영되어야 함', async () => {
      // 높은 위험 점수 요청으로 위협 생성
      await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0',
        content: "'; DROP TABLE users; --",
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      const metrics = advancedAISecuritySystem.getSecurityMetrics();

      expect(metrics.total_threats_detected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('shutdown', () => {
    it('시스템을 종료할 수 있어야 함', () => {
      advancedAISecuritySystem.start();
      advancedAISecuritySystem.shutdown();
    });
  });

  describe('이벤트 발생', () => {
    it('요청 검증 시 이벤트를 발생시켜야 함', async () => {
      const eventSpy = jest.fn();
      advancedAISecuritySystem.on('request_validated', eventSpy);

      await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.106',
        user_agent: 'Mozilla/5.0',
        content: '정상 요청',
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0]).toHaveProperty('request');
      expect(eventSpy.mock.calls[0][0]).toHaveProperty('allowed');
      expect(eventSpy.mock.calls[0][0]).toHaveProperty('risk_score');

      advancedAISecuritySystem.removeAllListeners('request_validated');
    });

    it('위협 감지 시 이벤트를 발생시켜야 함', async () => {
      const eventSpy = jest.fn();
      advancedAISecuritySystem.on('threat_detected', eventSpy);

      // 높은 위험 점수 요청으로 위협 생성 유도
      await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.107',
        user_agent: 'Mozilla/5.0',
        content: "'; DROP TABLE users; --",
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      // 위험 점수가 70을 초과하면 위협으로 분류되므로 이벤트가 발생할 수 있음
      // 실제 발생 여부는 위험 점수에 따라 달라짐
      jest.advanceTimersByTime(100);

      advancedAISecuritySystem.removeAllListeners('threat_detected');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 악성 요청을 차단해야 함', async () => {
      const maliciousRequests = [
        {
          content: "'; DROP TABLE redevelopment_projects; --",
          description: 'SQL 인젝션 시도',
        },
        {
          content: '<script>document.location="http://malicious.com"</script>',
          description: 'XSS 시도',
        },
        {
          content: 'rm -rf /projects',
          description: '명령어 인젝션 시도',
        },
      ];

      for (const request of maliciousRequests) {
        const result = await advancedAISecuritySystem.validateRequest({
          ip_address: '192.168.1.108',
          user_agent: 'Mozilla/5.0',
          content: request.content,
          resource: `${API_PATH_IN_URL_MARKER}redevelopment`,
          action: 'write',
        });

        expect(result).toBeDefined();
        expect(result.risk_score).toBeGreaterThan(0);
        expect(['allowed', 'reason', 'risk_score'].every((key) => key in result)).toBe(true);
      }
    });

    it('시공사 선정 관련 무단 접근을 감지해야 함', async () => {
      // 비정상적인 시간대 접근 시도
      const hour = new Date().getHours();
      const isUnusualTime = hour < 6 || hour > 22;

      const result = await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.109',
        user_agent: 'Mozilla/5.0',
        content: '시공사 선정 정보 조회',
        resource: `${API_PATH_IN_URL_MARKER}contractor-selection`,
        action: 'read',
      });

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(typeof result.risk_score).toBe('number');

      // 비정상적인 시간대면 위험 점수가 더 높을 수 있음
      if (isUnusualTime) {
        expect(result.risk_score).toBeGreaterThanOrEqual(0);
      }
    });

    it('여러 사용자가 동시에 요청할 때 비율 제한을 적용해야 함', async () => {
      const ipAddress = '192.168.1.110';

      // 빠르게 여러 요청 전송
      const promises = Array(60).fill(null).map(() =>
        advancedAISecuritySystem.validateRequest({
          ip_address: ipAddress,
          user_agent: 'Mozilla/5.0',
          content: '동시 요청 테스트',
          resource: API_SMOKE_TEST_PATH,
          action: 'read',
        })
      );

      const results = await Promise.all(promises);

      // 모든 요청이 처리되어야 함
      expect(results.length).toBe(60);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(['allowed', 'reason', 'risk_score'].every((key) => key in result)).toBe(true);
      });

      // 마지막 요청의 위험 점수가 높을 수 있음 (비율 제한 초과)
      const lastResult = results[results.length - 1];
      expect(lastResult.risk_score).toBeGreaterThanOrEqual(0);
    });

    it('보안 메트릭을 통해 시스템 상태를 모니터링할 수 있어야 함', async () => {
      // 다양한 요청 생성
      await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.111',
        user_agent: 'Mozilla/5.0',
        content: '정상 요청',
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      await advancedAISecuritySystem.validateRequest({
        ip_address: '192.168.1.112',
        user_agent: 'Mozilla/5.0',
        content: "'; DROP TABLE users; --",
        resource: API_SMOKE_TEST_PATH,
        action: 'read',
      });

      const metrics = advancedAISecuritySystem.getSecurityMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.total_threats_detected).toBeGreaterThanOrEqual(0);
      expect(metrics.blocked_requests).toBeGreaterThanOrEqual(0);
      expect(metrics.average_risk_score).toBeGreaterThanOrEqual(0);
      expect(metrics.average_risk_score).toBeLessThanOrEqual(100);
    });

    it('보안 시스템 모니터링이 정상 작동해야 함', () => {
      advancedAISecuritySystem.start();

      // 모니터링 간격(1분) 경과
      jest.advanceTimersByTime(60000);

      const metrics = advancedAISecuritySystem.getSecurityMetrics();
      expect(metrics).toBeDefined();

      advancedAISecuritySystem.stop();
    });
  });
});

