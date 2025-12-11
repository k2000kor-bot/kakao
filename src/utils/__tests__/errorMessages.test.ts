/**
 * errorMessages 유틸리티 테스트
 * 사용자 친화적인 에러 메시지 변환 확인
 */

import {
  getUserFriendlyError,
  getErrorIcon,
  type ErrorInfo,
} from '../errorMessages';

describe('errorMessages', () => {
  describe('getUserFriendlyError', () => {
    it('네트워크 에러를 올바르게 변환해야 함', () => {
      const error = new Error('Failed to fetch');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('network');
      expect(result.userMessage).toBe('네트워크 연결에 문제가 있습니다.');
      expect(result.canRetry).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('타임아웃 에러를 올바르게 변환해야 함', () => {
      const error = new Error('Request timeout');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('timeout');
      expect(result.userMessage).toBe('요청 시간이 초과되었습니다.');
      expect(result.canRetry).toBe(true);
    });

    it('서버 에러를 올바르게 변환해야 함', () => {
      const error = new Error('500 Internal Server Error');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('server');
      expect(result.userMessage).toBe('서버에서 오류가 발생했습니다.');
      expect(result.canRetry).toBe(true);
    });

    it('알 수 없는 에러를 올바르게 변환해야 함', () => {
      const error = new Error('Unknown error');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('unknown');
      expect(result.userMessage).toBe('예상치 못한 오류가 발생했습니다.');
      expect(result.canRetry).toBe(true);
    });

    it('문자열 에러도 처리해야 함', () => {
      const result = getUserFriendlyError('String error');

      expect(result.type).toBe('unknown');
      expect(result.userMessage).toBe('예상치 못한 오류가 발생했습니다.');
    });

    it('null/undefined 에러도 처리해야 함', () => {
      const result1 = getUserFriendlyError(null);
      const result2 = getUserFriendlyError(undefined);

      expect(result1.type).toBe('unknown');
      expect(result1.userMessage).toBe('예상치 못한 오류가 발생했습니다.');
      expect(result2.type).toBe('unknown');
      expect(result2.userMessage).toBe('예상치 못한 오류가 발생했습니다.');
    });
  });

  describe('getErrorIcon', () => {
    it('네트워크 에러 아이콘을 반환해야 함', () => {
      const icon = getErrorIcon('network');
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
      expect(icon).toBe('🌐');
    });

    it('서버 에러 아이콘을 반환해야 함', () => {
      const icon = getErrorIcon('server');
      expect(icon).toBeDefined();
      expect(icon).toBe('⚠️');
    });

    it('타임아웃 에러 아이콘을 반환해야 함', () => {
      const icon = getErrorIcon('timeout');
      expect(icon).toBeDefined();
      expect(icon).toBe('⏱️');
    });

    it('클라이언트 에러 아이콘을 반환해야 함', () => {
      const icon = getErrorIcon('client');
      expect(icon).toBeDefined();
      expect(icon).toBe('❌');
    });

    it('알 수 없는 에러 아이콘을 반환해야 함', () => {
      const icon = getErrorIcon('unknown');
      expect(icon).toBeDefined();
      expect(icon).toBe('❓');
    });
  });
});

