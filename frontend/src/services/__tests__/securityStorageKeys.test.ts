/**
 * @jest-environment jsdom
 */
import { AUTH_TOKEN_STORAGE_KEY, CURRENT_USER_STORAGE_KEY } from '../securityStorageKeys';
import {
  AUTH_TOKEN_STORAGE_KEY as T_SVC,
  CURRENT_USER_STORAGE_KEY as U_SVC,
} from '../securityService';

describe('securityStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(AUTH_TOKEN_STORAGE_KEY).toBe('authToken');
    expect(CURRENT_USER_STORAGE_KEY).toBe('currentUser');
  });

  it('securityService 재보내기와 동일', () => {
    expect(T_SVC).toBe(AUTH_TOKEN_STORAGE_KEY);
    expect(U_SVC).toBe(CURRENT_USER_STORAGE_KEY);
  });
});
