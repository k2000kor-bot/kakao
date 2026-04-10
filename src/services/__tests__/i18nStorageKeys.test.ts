/**
 * @jest-environment jsdom
 */
import {
  I18N_APP_LANGUAGE_STORAGE_KEY,
  PREFERRED_LOCALE_STORAGE_KEY,
} from '../i18nStorageKeys';
import {
  I18N_APP_LANGUAGE_STORAGE_KEY as K_LANG_SVC,
  PREFERRED_LOCALE_STORAGE_KEY as K_SVC,
} from '../i18nService';

describe('i18nStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(PREFERRED_LOCALE_STORAGE_KEY).toBe('preferred-locale');
    expect(I18N_APP_LANGUAGE_STORAGE_KEY).toBe('language');
  });

  it('i18nService 재보내기와 동일', () => {
    expect(K_SVC).toBe(PREFERRED_LOCALE_STORAGE_KEY);
    expect(K_LANG_SVC).toBe(I18N_APP_LANGUAGE_STORAGE_KEY);
  });
});
