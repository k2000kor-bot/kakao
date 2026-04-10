/**
 * errorHandlingService 서비스 테스트
 * 고급 에러 처리 및 사용자 피드백 시스템 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import errorHandlingService, {
  ErrorType,
  ErrorSeverity,
  ErrorContext,
} from '../errorHandlingService';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// fetch 모킹
installJestFetchMock();

// localStorage 모킹
const mockLocalStorage: { [key: string]: string } = {};

// sessionStorage 모킹
const mockSessionStorage: { [key: string]: string } = {};

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
      }),
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockSessionStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockSessionStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
      }),
    },
    writable: true,
    configurable: true,
  });
});

describe('errorHandlingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
    
    // 에러 히스토리 초기화
    errorHandlingService.clearErrorHistory();
  });

  describe('reportError', () => {
    it('Error 객체로 에러를 보고할 수 있어야 함', async () => {
      const error = new Error('Test error');
      const context: Partial<ErrorContext> = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const errorReport = await errorHandlingService.reportError(error, context);

      expect(errorReport).toBeDefined();
      expect(errorReport.id).toBeDefined();
      expect(errorReport.message).toBe('Test error');
      expect(errorReport.context.component).toBe('TestComponent');
      expect(errorReport.context.action).toBe('testAction');
    });

    it('문자열로 에러를 보고할 수 있어야 함', async () => {
      const error = 'Test error string';
      const context: Partial<ErrorContext> = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const errorReport = await errorHandlingService.reportError(error, context);

      expect(errorReport).toBeDefined();
      expect(errorReport.message).toBe('Test error string');
    });

    it('커스텀 메시지를 사용할 수 있어야 함', async () => {
      const error = new Error('Technical error');
      const context: Partial<ErrorContext> = {
        component: 'TestComponent',
        action: 'testAction',
      };

      const errorReport = await errorHandlingService.reportError(
        error,
        context,
        '사용자 친화적 메시지'
      );

      expect(errorReport.userMessage).toBe('사용자 친화적 메시지');
    });

    it('에러 히스토리에 추가해야 함', async () => {
      const error = new Error('Test error');
      const context: Partial<ErrorContext> = {
        component: 'TestComponent',
        action: 'testAction',
      };

      await errorHandlingService.reportError(error, context);

      const stats = errorHandlingService.getErrorStatistics();
      expect(stats.total).toBe(1);
    });
  });

  describe('에러 분류', () => {
    it('네트워크 에러를 분류해야 함', async () => {
      const error = new Error('Network error occurred');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.NETWORK);
    });

    it('검증 에러를 분류해야 함', async () => {
      const error = new Error('Invalid input validation failed');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.VALIDATION);
    });

    it('인증 에러를 분류해야 함', async () => {
      const error = new Error('Unauthorized access');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('AI 서비스 에러를 분류해야 함', async () => {
      const error = new Error('AI model error');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.AI_SERVICE);
    });

    it('권한 에러를 분류해야 함', async () => {
      const error = new Error('Permission denied');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.PERMISSION);
    });

    it('파일 처리 에러를 분류해야 함', async () => {
      const error = new Error('File size exceeded');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.FILE_PROCESSING);
    });

    it('알 수 없는 에러는 SYSTEM으로 분류해야 함', async () => {
      const error = new Error('Unknown internal error');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.type).toBe(ErrorType.SYSTEM);
    });
  });

  describe('에러 심각도 평가', () => {
    it('AI 컴포넌트 에러는 HIGH 심각도여야 함', async () => {
      const error = new Error('Error in AI component');
      const context: Partial<ErrorContext> = {
        component: 'AIComponent',
        action: 'process',
      };

      const errorReport = await errorHandlingService.reportError(error, context);

      expect(errorReport.severity).toBe(ErrorSeverity.HIGH);
    });

    it('네트워크 에러는 MEDIUM 심각도여야 함', async () => {
      const error = new Error('Network timeout');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('제안 및 복구 액션', () => {
    it('에러에 대한 제안을 생성해야 함', async () => {
      const error = new Error('Network error');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.suggestions).toBeDefined();
      expect(Array.isArray(errorReport.suggestions)).toBe(true);
      expect(errorReport.suggestions.length).toBeGreaterThan(0);
    });

    it('복구 액션을 생성해야 함', async () => {
      const error = new Error('Test error');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.recoveryActions).toBeDefined();
      expect(Array.isArray(errorReport.recoveryActions)).toBe(true);
      expect(errorReport.recoveryActions.length).toBeGreaterThan(0);
    });
  });

  describe('getErrorStatistics', () => {
    it('에러 통계를 반환해야 함', async () => {
      await errorHandlingService.reportError(new Error('Network error'), {
        component: 'TestComponent',
        action: 'test',
      });
      await errorHandlingService.reportError(new Error('Validation error'), {
        component: 'TestComponent',
        action: 'test',
      });

      const stats = errorHandlingService.getErrorStatistics();

      expect(stats.total).toBe(2);
      expect(stats.byType).toBeDefined();
      expect(stats.bySeverity).toBeDefined();
      expect(stats.recent).toBeDefined();
      expect(Array.isArray(stats.recent)).toBe(true);
    });

    it('타입별 통계를 계산해야 함', async () => {
      await errorHandlingService.reportError(new Error('Network error'), {});
      await errorHandlingService.reportError(new Error('Network timeout'), {});

      const stats = errorHandlingService.getErrorStatistics();

      expect(stats.byType[ErrorType.NETWORK]).toBeGreaterThanOrEqual(2);
    });

    it('심각도별 통계를 계산해야 함', async () => {
      await errorHandlingService.reportError(new Error('Test error'), {
        component: 'AIComponent',
        action: 'test',
      });

      const stats = errorHandlingService.getErrorStatistics();

      expect(stats.bySeverity).toBeDefined();
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBeGreaterThanOrEqual(1);
    });

    it('최근 에러를 반환해야 함', async () => {
      for (let i = 0; i < 15; i++) {
        await errorHandlingService.reportError(new Error(`Error ${i}`), {});
      }

      const stats = errorHandlingService.getErrorStatistics();

      expect(stats.recent.length).toBe(10); // 최근 10개만
    });
  });

  describe('clearErrorHistory', () => {
    it('에러 히스토리를 클리어할 수 있어야 함', async () => {
      await errorHandlingService.reportError(new Error('Test error'), {});
      
      errorHandlingService.clearErrorHistory();

      const stats = errorHandlingService.getErrorStatistics();
      expect(stats.total).toBe(0);
    });
  });

  describe('registerFeedbackCallback', () => {
    it('피드백 콜백을 등록할 수 있어야 함', async () => {
      const callback = jest.fn();

      errorHandlingService.registerFeedbackCallback(callback);

      await errorHandlingService.reportError(new Error('Test error'), {});

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toHaveProperty('type');
      expect(callback.mock.calls[0][0]).toHaveProperty('title');
      expect(callback.mock.calls[0][0]).toHaveProperty('message');
    });

    it('여러 피드백 콜백을 등록할 수 있어야 함', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      errorHandlingService.registerFeedbackCallback(callback1);
      errorHandlingService.registerFeedbackCallback(callback2);

      await errorHandlingService.reportError(new Error('Test error'), {});

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('사용자 친화적 메시지', () => {
    it('네트워크 에러에 대한 친화적 메시지를 생성해야 함', async () => {
      const error = new Error('Network error');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.userMessage).toContain('네트워크');
    });

    it('타임아웃 에러에 대한 친화적 메시지를 생성해야 함', async () => {
      const error = new Error('Request timeout');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.userMessage).toContain('시간');
    });

    it('인증 에러에 대한 친화적 메시지를 생성해야 함', async () => {
      const error = new Error('Unauthorized');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.userMessage).toContain('로그인');
    });

    it('권한 에러에 대한 친화적 메시지를 생성해야 함', async () => {
      const error = new Error('Forbidden access');
      const errorReport = await errorHandlingService.reportError(error, {});

      expect(errorReport.userMessage).toContain('권한');
    });
  });
});

