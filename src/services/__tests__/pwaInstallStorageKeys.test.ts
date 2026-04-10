/**
 * @jest-environment jsdom
 */
import { PWA_INSTALL_DISMISSED_AT_STORAGE_KEY } from '../pwaInstallStorageKeys';

describe('pwaInstallStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(PWA_INSTALL_DISMISSED_AT_STORAGE_KEY).toBe('pwa-install-dismissed');
  });
});
