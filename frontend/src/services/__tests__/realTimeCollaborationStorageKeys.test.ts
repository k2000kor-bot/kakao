/**
 * @jest-environment jsdom
 */
describe('realTimeCollaborationStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    const { COLLABORATION_USERNAME_STORAGE_KEY } = require('../realTimeCollaborationStorageKeys');
    expect(COLLABORATION_USERNAME_STORAGE_KEY).toBe('username');
  });

  it('realTimeCollaborationService 재보내기와 동일', () => {
    global.WebSocket = class {
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSING = 2;
      static readonly CLOSED = 3;
      readyState = 0;
      close(): void {}
      send(): void {}
      addEventListener(): void {}
      removeEventListener(): void {}
    } as unknown as typeof WebSocket;

    jest.resetModules();
    const { COLLABORATION_USERNAME_STORAGE_KEY: K } = require('../realTimeCollaborationStorageKeys');
    const { COLLABORATION_USERNAME_STORAGE_KEY: K_SVC } = require('../realTimeCollaborationService');
    expect(K_SVC).toBe(K);
  });
});
