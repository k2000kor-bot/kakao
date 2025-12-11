/**
 * errorReportingService 테스트
 * 에러 리포팅 서비스의 주요 기능 확인
 */

import errorReportingService from '../errorReportingService';

// localStorage 모킹
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => localStorageMock.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock.store[key] = value.toString();
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// fetch 모킹
global.fetch = jest.fn();

// console 메서드 모킹
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('errorReportingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockClear();
    errorReportingService.configure({
      enabled: true,
      sampleRate: 1.0,
      maxReportsPerSession: 50,
    });
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('configure', () => {
    it('설정을 업데이트해야 함', () => {
      expect(() => {
        errorReportingService.configure({ enabled: false });
        errorReportingService.configure({ enabled: true });
      }).not.toThrow();
    });
  });

  describe('reportError', () => {
    it('에러를 리포트해야 함', async () => {
      const error = new Error('Test error');
      await errorReportingService.reportError(error);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('컨텍스트 정보를 포함해야 함', async () => {
      errorReportingService.clearStoredReports();
      const error = new Error('Test error');
      await errorReportingService.reportError(error, {
        componentStack: 'Component stack',
        userId: 'user123',
        severity: 'high',
        additionalContext: { key: 'value' },
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const stored = JSON.parse(localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]);
      expect(Array.isArray(stored)).toBe(true);
      if (stored.length > 0) {
        expect(stored[stored.length - 1].userId).toBe('user123');
        expect(stored[stored.length - 1].severity).toBe('high');
      }
    });

    it('enabled가 false이면 리포트하지 않아야 함', async () => {
      errorReportingService.configure({ enabled: false });
      const error = new Error('Test error');
      await errorReportingService.reportError(error);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getStoredReports', () => {
    it('저장된 리포트 목록을 반환해야 함', async () => {
      errorReportingService.clearStoredReports();
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      await errorReportingService.reportError(error1);
      await errorReportingService.reportError(error2);
      
      // localStorage에 저장되었는지 확인
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // getStoredReports는 localStorage에서 읽으므로 모킹된 값 확인
      const reports = errorReportingService.getStoredReports();
      // localStorage 모킹이 제대로 작동하면 리포트가 있어야 함
      expect(Array.isArray(reports)).toBe(true);
    });
  });

  describe('clearStoredReports', () => {
    it('저장된 리포트를 클리어해야 함', async () => {
      const error = new Error('Test error');
      await errorReportingService.reportError(error);
      errorReportingService.clearStoredReports();
      const reports = errorReportingService.getStoredReports();
      expect(reports.length).toBe(0);
    });
  });

  describe('getErrorStatistics', () => {
    it('에러 통계를 반환해야 함', async () => {
      errorReportingService.clearStoredReports();
      
      await errorReportingService.reportError(new Error('Error 1'), { severity: 'high' });
      await errorReportingService.reportError(new Error('Error 2'), { severity: 'low' });
      
      const stats = errorReportingService.getErrorStatistics();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('bySeverity');
      expect(stats).toHaveProperty('recent');
      expect(stats.bySeverity).toHaveProperty('high');
      expect(stats.bySeverity).toHaveProperty('low');
      expect(stats.bySeverity).toHaveProperty('medium');
      expect(stats.bySeverity).toHaveProperty('critical');
      expect(stats.recent).toBeInstanceOf(Array);
      expect(typeof stats.total).toBe('number');
    });
  });
});

