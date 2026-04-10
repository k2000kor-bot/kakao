/**
 * @jest-environment jsdom
 */
import { ERROR_HANDLING_LOGS_STORAGE_KEY } from '../errorHandlingStorageKeys';
import { ERROR_HANDLING_LOGS_STORAGE_KEY as K_SVC } from '../errorHandlingService';

describe('errorHandlingStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(ERROR_HANDLING_LOGS_STORAGE_KEY).toBe('errorLogs');
  });

  it('errorHandlingService 재보내기와 동일', () => {
    expect(K_SVC).toBe(ERROR_HANDLING_LOGS_STORAGE_KEY);
  });
});
