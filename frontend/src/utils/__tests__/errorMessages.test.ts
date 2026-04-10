/**
 * errorMessages 유틸리티 테스트
 * 사용자 친화적인 에러 메시지 변환 확인
 */

import {
  getUserFriendlyError,
  getErrorIcon,
  getErrorColor,
  isValidHttpUrl,
} from '../errorMessages';

describe('errorMessages', () => {
  describe('isValidHttpUrl', () => {
    it('http:// 또는 https:// URL을 true로 반환해야 함', () => {
      expect(isValidHttpUrl('https://example.com')).toBe(true);
      expect(isValidHttpUrl('http://example.com')).toBe(true);
      expect(isValidHttpUrl('https://example.com/path')).toBe(true);
      expect(isValidHttpUrl('https://sub.example.com/article?q=1')).toBe(true);
    });
    it('잘못된 URL을 false로 반환해야 함', () => {
      expect(isValidHttpUrl('example.com')).toBe(false);
      expect(isValidHttpUrl('ftp://example.com')).toBe(false);
      expect(isValidHttpUrl('')).toBe(false);
      expect(isValidHttpUrl('  ')).toBe(false);
    });
  });

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

    it('401 인증 에러를 올바르게 변환해야 함', () => {
      const error = new Error('401 Unauthorized');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('client');
      expect(result.userMessage).toBe('인증이 필요합니다.');
      expect(result.canRetry).toBe(false);
      expect(result.suggestions).toContain('다시 로그인해주세요.');
    });

    it('403 권한 에러를 올바르게 변환해야 함', () => {
      const error = new Error('403 Forbidden');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('client');
      expect(result.userMessage).toBe('접근 권한이 없습니다.');
      expect(result.canRetry).toBe(false);
      expect(result.suggestions).toContain('관리자에게 문의해주세요.');
    });

    it('404 Not Found 에러를 올바르게 변환해야 함', () => {
      const error = new Error('404 Not Found');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('client');
      expect(result.userMessage).toBe('요청한 리소스를 찾을 수 없습니다.');
      expect(result.canRetry).toBe(false);
    });

    it('4xx 기타 클라이언트 에러를 올바르게 변환해야 함', () => {
      const error = new Error('400 Bad Request');
      const result = getUserFriendlyError(error);

      expect(result.type).toBe('client');
      expect(result.userMessage).toBe('요청을 처리할 수 없습니다.');
      expect(result.canRetry).toBe(false);
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

  describe('getErrorColor', () => {
    it('network 타입은 var(--accent-warning) 반환', () => {
      expect(getErrorColor('network')).toBe('var(--accent-warning)');
    });

    it('server 타입은 var(--accent-danger) 반환', () => {
      expect(getErrorColor('server')).toBe('var(--accent-danger)');
    });

    it('client 타입은 var(--accent-warning) 반환', () => {
      expect(getErrorColor('client')).toBe('var(--accent-warning)');
    });

    it('timeout 타입은 var(--accent-warning) 반환', () => {
      expect(getErrorColor('timeout')).toBe('var(--accent-warning)');
    });

    it('unknown 타입은 var(--accent-danger) 반환', () => {
      expect(getErrorColor('unknown')).toBe('var(--accent-danger)');
    });
  });

  describe('getUserFriendlyError with non-Error', () => {
    it('문자열 throw 시 unknown 타입으로 변환', () => {
      const result = getUserFriendlyError('Something went wrong');
      expect(result.type).toBe('unknown');
      expect(result.userMessage).toBe('예상치 못한 오류가 발생했습니다.');
      expect(result.canRetry).toBe(true);
    });
  });
});

