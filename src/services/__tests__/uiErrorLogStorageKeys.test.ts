/**
 * @jest-environment jsdom
 */
import { UI_ERROR_LOG_STORAGE_KEY } from '../uiErrorLogStorageKeys';

describe('uiErrorLogStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(UI_ERROR_LOG_STORAGE_KEY).toBe('errorLog');
  });
});
