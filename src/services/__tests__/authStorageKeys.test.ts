/**
 * @jest-environment jsdom
 */
import { CORBU_AUTH_TOKEN_STORAGE_KEY } from '../authStorageKeys';

describe('authStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(CORBU_AUTH_TOKEN_STORAGE_KEY).toBe('corbu_token');
  });
});
