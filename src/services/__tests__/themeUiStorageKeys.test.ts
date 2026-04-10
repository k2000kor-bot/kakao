/**
 * @jest-environment jsdom
 */
import { DARK_MODE_STORAGE_KEY, THEME_MODE_STORAGE_KEY } from '../themeUiStorageKeys';

describe('themeUiStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(THEME_MODE_STORAGE_KEY).toBe('themeMode');
    expect(DARK_MODE_STORAGE_KEY).toBe('darkMode');
  });
});
