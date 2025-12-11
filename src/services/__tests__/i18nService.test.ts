/**
 * i18nService 서비스 테스트
 * 다국어 지원 서비스 테스트
 */

import i18nService from '../i18nService';

// navigator 모킹
const mockNavigator = {
  language: 'ko-KR',
  languages: ['ko-KR', 'en-US'],
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true,
});

describe('i18nService', () => {
  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
    // 기본 로케일로 리셋
    i18nService.setLocale('ko');
  });

  describe('getLocale', () => {
    it('현재 로케일을 반환해야 함', () => {
      expect(i18nService.getLocale()).toBe('ko');
    });

    it('설정한 로케일을 반환해야 함', () => {
      i18nService.setLocale('en');
      expect(i18nService.getLocale()).toBe('en');
    });
  });

  describe('setLocale', () => {
    it('로케일을 설정할 수 있어야 함', () => {
      i18nService.setLocale('ja');
      expect(i18nService.getLocale()).toBe('ja');
    });

    it('localStorage에 로케일을 저장해야 함', () => {
      i18nService.setLocale('en');
      expect(localStorage.getItem('preferred-locale')).toBe('en');
    });
  });

  describe('getSupportedLocales', () => {
    it('지원되는 로케일 목록을 반환해야 함', () => {
      const locales = i18nService.getSupportedLocales();
      expect(locales).toHaveLength(4);
      expect(locales[0].code).toBe('ko');
      expect(locales[1].code).toBe('en');
      expect(locales[2].code).toBe('ja');
      expect(locales[3].code).toBe('zh');
    });

    it('각 로케일은 code, name, nativeName, flag를 포함해야 함', () => {
      const locales = i18nService.getSupportedLocales();
      locales.forEach(locale => {
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('name');
        expect(locale).toHaveProperty('nativeName');
        expect(locale).toHaveProperty('flag');
      });
    });
  });

  describe('t (번역)', () => {
    it('간단한 키로 번역을 반환해야 함', () => {
      expect(i18nService.t('common.save')).toBe('저장');
    });

    it('중첩된 키로 번역을 반환해야 함', () => {
      expect(i18nService.t('chat.placeholder')).toBe('무엇이든 물어보세요');
      expect(i18nService.t('project.title')).toBe('프로젝트');
    });

    it('로케일 변경 시 번역이 변경되어야 함', () => {
      i18nService.setLocale('en');
      expect(i18nService.t('common.save')).toBe('Save');
    });

    it('매개변수를 치환할 수 있어야 함', () => {
      const result = i18nService.t('chat.messageCount', { count: 5 });
      expect(result).toBe('5개 메시지');
    });

    it('존재하지 않는 키는 키 자체를 반환해야 함', () => {
      expect(i18nService.t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('폴백 로케일에서 번역을 찾아야 함', () => {
      i18nService.setLocale('ko');
      const result = i18nService.t('common.save');
      expect(result).toBe('저장');
      
      i18nService.setLocale('en');
      const enResult = i18nService.t('common.save');
      expect(enResult).toBe('Save');
    });
  });

  describe('formatDate', () => {
    it('날짜를 포맷팅할 수 있어야 함', () => {
      const date = new Date('2025-01-27T10:00:00Z');
      const formatted = i18nService.formatDate(date);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('옵션을 사용하여 날짜를 포맷팅할 수 있어야 함', () => {
      const date = new Date('2025-01-27T10:00:00Z');
      const formatted = i18nService.formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatNumber', () => {
    it('숫자를 포맷팅할 수 있어야 함', () => {
      const formatted = i18nService.formatNumber(1234567.89);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('옵션을 사용하여 숫자를 포맷팅할 수 있어야 함', () => {
      const formatted = i18nService.formatNumber(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('통화를 포맷팅할 수 있어야 함', () => {
      const formatted = i18nService.formatCurrency(12345.67, 'KRW');
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('기본 통화로 포맷팅할 수 있어야 함', () => {
      const formatted = i18nService.formatCurrency(12345.67);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatRelativeTime', () => {
    it('방금 전 시간을 포맷팅할 수 있어야 함', () => {
      const now = new Date();
      const result = i18nService.formatRelativeTime(now);
      expect(typeof result).toBe('string');
    });

    it('과거 시간을 포맷팅할 수 있어야 함', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000); // 5분 전
      const result = i18nService.formatRelativeTime(past);
      expect(typeof result).toBe('string');
    });
  });

  describe('detectLanguage', () => {
    it('한국어 텍스트를 감지할 수 있어야 함', () => {
      expect(i18nService.detectLanguage('안녕하세요')).toBe('ko');
      expect(i18nService.detectLanguage('테스트')).toBe('ko');
    });

    it('일본어 텍스트를 감지할 수 있어야 함', () => {
      expect(i18nService.detectLanguage('こんにちは')).toBe('ja');
      expect(i18nService.detectLanguage('テスト')).toBe('ja');
    });

    it('중국어 텍스트를 감지할 수 있어야 함', () => {
      expect(i18nService.detectLanguage('你好')).toBe('zh');
    });

    it('영어 텍스트를 감지할 수 있어야 함', () => {
      expect(i18nService.detectLanguage('Hello World')).toBe('en');
      expect(i18nService.detectLanguage('123')).toBe('en');
    });
  });

  describe('onLocaleChange', () => {
    it('로케일 변경 리스너를 등록할 수 있어야 함', () => {
      const callback = jest.fn();
      i18nService.onLocaleChange(callback);
      
      i18nService.setLocale('en');
      expect(callback).toHaveBeenCalledWith('en');
    });

    it('여러 리스너를 등록할 수 있어야 함', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      i18nService.onLocaleChange(callback1);
      i18nService.onLocaleChange(callback2);
      
      i18nService.setLocale('ja');
      expect(callback1).toHaveBeenCalledWith('ja');
      expect(callback2).toHaveBeenCalledWith('ja');
    });
  });

  describe('removeLocaleChangeListener', () => {
    it('로케일 변경 리스너를 제거할 수 있어야 함', () => {
      const callback = jest.fn();
      i18nService.onLocaleChange(callback);
      i18nService.removeLocaleChangeListener(callback);
      
      i18nService.setLocale('en');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isRTL', () => {
    it('LTR 언어에 대해 false를 반환해야 함', () => {
      i18nService.setLocale('ko');
      expect(i18nService.isRTL()).toBe(false);
      
      i18nService.setLocale('en');
      expect(i18nService.isRTL()).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('LTR 언어에 대해 ltr을 반환해야 함', () => {
      i18nService.setLocale('ko');
      expect(i18nService.getTextDirection()).toBe('ltr');
      
      i18nService.setLocale('en');
      expect(i18nService.getTextDirection()).toBe('ltr');
    });
  });
});

