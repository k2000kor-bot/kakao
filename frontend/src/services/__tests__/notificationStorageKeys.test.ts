import { NOTIFICATION_SETTINGS_STORAGE_KEY } from '../notificationStorageKeys';
import { NOTIFICATION_SETTINGS_STORAGE_KEY as K_SVC } from '../notificationService';

describe('notificationStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(NOTIFICATION_SETTINGS_STORAGE_KEY).toBe('notificationSettings');
  });

  it('notificationService 재보내기와 동일', () => {
    expect(K_SVC).toBe(NOTIFICATION_SETTINGS_STORAGE_KEY);
  });
});
