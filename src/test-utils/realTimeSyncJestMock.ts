/**
 * `useChatEnhancements` → `realTimeSync` 경로용 Jest 모듈 팩토리.
 * `LazyComponents.test` 등 **ChatView + Suspense**를 한 파일에서 돌릴 때 WebSocket 스팸을 막기 위해 사용합니다.
 * `Chat/__tests__/ChatView.test`에는 넣지 마세요(`realTimeSync.on` 더미와 훅 구독/타이머 상호작용으로 단일 파일에서도 실패합니다).
 */
export function createRealTimeSyncJestMock(): {
  __esModule: true;
  default: {
    on: jest.Mock;
    configure: jest.Mock;
    sendEvent: jest.Mock;
  };
  realTimeSync: {
    on: jest.Mock;
    configure: jest.Mock;
    sendEvent: jest.Mock;
  };
} {
  const mockSync = {
    on: jest.fn(() => jest.fn()),
    configure: jest.fn(),
    sendEvent: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockSync,
    realTimeSync: mockSync,
  };
}
