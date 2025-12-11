/**
 * apiClient 유틸리티 테스트
 * API 호출 기능 확인
 */

// 모킹을 import 전에 설정
jest.mock('../../services/errorReportingService', () => ({
  __esModule: true,
  default: {
    reportError: jest.fn(),
  },
}));

jest.mock('../retryHandler', () => ({
  retryApiCall: jest.fn(async (fn: () => Promise<any>) => {
    try {
      return await fn();
    } catch (error) {
      throw error;
    }
  }),
}));

jest.mock('../../services/localLLMService', () => ({
  localLLMService: {
    isAvailable: jest.fn(() => false),
  },
}));

import { sendChatMessage, isValidChatResponse } from '../apiClient';
import errorReportingService from '../../services/errorReportingService';
import { retryApiCall } from '../retryHandler';

// fetch 모킹
global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (retryApiCall as jest.Mock).mockImplementation(async (fn: () => Promise<any>) => {
      try {
        return await fn();
      } catch (error) {
        throw error;
      }
    });
  });

  describe('sendChatMessage', () => {
    it('채팅 메시지를 성공적으로 전송해야 함', async () => {
      const mockResponse = {
        success: true,
        message: '응답 메시지',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendChatMessage('테스트 메시지', 'session-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('응답 메시지');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('테스트 메시지'),
        })
      );
    });

    it('API 호출 실패 시 에러를 리포팅해야 함', async () => {
      const error = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      await expect(sendChatMessage('테스트 메시지', 'session-123')).rejects.toThrow();

      expect(errorReportingService.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          severity: 'high',
          additionalContext: expect.objectContaining({
            action: 'sendChatMessage',
            sessionId: 'session-123',
          }),
        })
      );
    });

    it('HTTP 에러 응답을 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(sendChatMessage('테스트 메시지', 'session-123')).rejects.toThrow();

      expect(errorReportingService.reportError).toHaveBeenCalled();
    });
  });

  describe('isValidChatResponse', () => {
    it('유효한 ChatAPIResponse를 확인해야 함', () => {
      const validResponse = {
        success: true,
        message: '응답',
      };

      expect(isValidChatResponse(validResponse)).toBe(true);
    });

    it('success가 false인 응답도 유효해야 함', () => {
      const validResponse = {
        success: false,
        error: '에러',
      };

      expect(isValidChatResponse(validResponse)).toBe(true);
    });

    it('유효하지 않은 객체를 거부해야 함', () => {
      expect(isValidChatResponse(null)).toBe(false);
      expect(isValidChatResponse(undefined)).toBe(false);
      expect(isValidChatResponse({})).toBe(false);
      expect(isValidChatResponse({ message: 'test' })).toBe(false);
      expect(isValidChatResponse({ success: 'true' })).toBe(false);
      expect(isValidChatResponse('string')).toBe(false);
      expect(isValidChatResponse(123)).toBe(false);
    });
  });
});

