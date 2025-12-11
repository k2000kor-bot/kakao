/**
 * formatters 유틸리티 테스트
 * 포맷터 함수들 테스트
 */

import {
  formatDate,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatDuration,
  truncateText,
  highlightText,
  isValidUrl,
  isValidEmail,
  formatPhoneNumber,
} from '../formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('날짜를 short 형식으로 포맷해야 함', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'short');
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('날짜를 long 형식으로 포맷해야 함', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'long');
      expect(result).toContain('2024');
    });

    it('상대 시간을 올바르게 표시해야 함', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const result = formatDate(oneMinuteAgo, 'relative');
      expect(result).toContain('분 전');
    });

    it('유효하지 않은 날짜는 빈 문자열을 반환해야 함', () => {
      const result = formatDate('invalid', 'short');
      expect(result).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('바이트를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    it('큰 파일 크기를 올바르게 포맷해야 함', () => {
      const result = formatFileSize(1024 * 1024 * 5);
      expect(result).toContain('MB');
    });
  });

  describe('formatNumber', () => {
    it('숫자에 천 단위 콤마를 추가해야 함', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('작은 숫자는 콤마 없이 반환해야 함', () => {
      expect(formatNumber(999)).toBe('999');
    });
  });

  describe('formatPercentage', () => {
    it('백분율을 올바르게 포맷해야 함', () => {
      expect(formatPercentage(85.5)).toBe('85.5%');
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('소수점 자릿수를 지정할 수 있어야 함', () => {
      expect(formatPercentage(85.555, 2)).toBe('85.56%');
    });
  });

  describe('formatDuration', () => {
    it('초를 시:분:초 형식으로 변환해야 함', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3665)).toBe('1:01:05');
    });

    it('1분 미만은 분:초 형식으로 표시해야 함', () => {
      expect(formatDuration(30)).toBe('0:30');
    });
  });

  describe('truncateText', () => {
    it('텍스트를 자르고 말줄임표를 추가해야 함', () => {
      const text = 'This is a very long text';
      const result = truncateText(text, 10);
      expect(result.length).toBeLessThanOrEqual(13); // 10 + '...'
      expect(result).toContain('...');
    });

    it('짧은 텍스트는 그대로 반환해야 함', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe(text);
    });
  });

  describe('highlightText', () => {
    it('키워드를 하이라이트해야 함', () => {
      const text = 'This is a test';
      const result = highlightText(text, 'test');
      expect(result).toContain('<span');
      expect(result).toContain('test');
    });

    it('빈 키워드는 원본 텍스트를 반환해야 함', () => {
      const text = 'This is a test';
      expect(highlightText(text, '')).toBe(text);
    });
  });

  describe('isValidUrl', () => {
    it('유효한 URL을 확인해야 함', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('유효하지 않은 URL을 확인해야 함', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('유효한 이메일을 확인해야 함', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
    });

    it('유효하지 않은 이메일을 확인해야 함', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('전화번호를 올바르게 포맷해야 함', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
      expect(formatPhoneNumber('0212345678')).toMatch(/02-\d{3,4}-\d{4}/);
      expect(formatPhoneNumber('0311234567')).toBe('031-123-4567');
    });

    it('이미 포맷된 전화번호는 그대로 반환해야 함', () => {
      const phone = '010-1234-5678';
      const result = formatPhoneNumber(phone);
      expect(result).toContain('-');
    });
  });
});

