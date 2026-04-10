/**
 * 국제화(i18n) 유틸리티
 */

import ko from './locales/ko.json';
import en from './locales/en.json';
import { errorLogger } from '../utils/errorLogger';
import { I18N_APP_LANGUAGE_STORAGE_KEY } from '../services/i18nStorageKeys';

export type Language = 'ko' | 'en';

export interface Translations {
  [key: string]: string | Record<string, unknown>;
}

const translations: Record<Language, Translations> = {
  ko,
  en,
};

class I18n {
  private currentLanguage: Language = 'ko';

  constructor() {
    // 로컬 스토리지에서 언어 설정 불러오기
    const savedLanguage = localStorage.getItem(I18N_APP_LANGUAGE_STORAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
      this.currentLanguage = savedLanguage;
    } else {
      // 브라우저 언어 감지
      const browserLanguage = navigator.language.split('-')[0];
      this.currentLanguage = browserLanguage === 'en' ? 'en' : 'ko';
    }
  }

  /**
   * 현재 언어 가져오기
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 언어 설정
   */
  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem(I18N_APP_LANGUAGE_STORAGE_KEY, language);
    
    // 언어 변경 이벤트 발생
    globalThis.window?.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }

  /**
   * 번역 텍스트 가져오기
   */
  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: string | Record<string, unknown> | undefined = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k] as string | Record<string, unknown> | undefined;
      } else {
        // 번역 키가 없으면 키 자체 반환
        errorLogger.warn(`번역 키를 찾을 수 없음: ${key}`, {
          component: 'i18n',
          action: 'translate',
          key,
          language: this.currentLanguage,
        });
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // 파라미터 치환
    if (params) {
      // replaceAll은 정규식을 지원하지 않으므로 replace 사용
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }

  /**
   * 모든 번역 가져오기
   */
  getAllTranslations(): Translations {
    return translations[this.currentLanguage];
  }

  /**
   * 사용 가능한 언어 목록
   */
  getAvailableLanguages(): Array<{ code: Language; name: string }> {
    return [
      { code: 'ko', name: '한국어' },
      { code: 'en', name: 'English' },
    ];
  }
}

// 싱글톤 인스턴스
export const i18n = new I18n();
export default i18n;

