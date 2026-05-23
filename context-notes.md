# Context Notes — dev-continue 이어하기

## 2026-05-23

- **원인**: `ChatGPTInterface.test`·`composerAssistantTurnFinalize.test` 등이 `test-utils/testHelpers`에서 `withProcessEnv`, `installJestDomQuietNetworkForTests`를 import하지만, 커밋된 `testHelpers.tsx`에는 해당 export가 없었음.
- **증상**: `TypeError: withProcessEnv is not a function`, `installJestDomQuietNetworkForTests` undefined로 composer pipeline 65건 실패.
- **근거**: `frontend/coverage/.../testHelpers.tsx.html`에 과거 구현 흔적 존재. coverage HTML에서 `applyProcessEnvPatch`, `installJestFetchHealthLlmStub` 시그니처 확인.
- **조치**: `src/test-utils/testHelpers.tsx`에 누락 헬퍼만 추가(기존 `setupCommonMocks` 등은 유지). `sync:frontend-src`로 `frontend/src` 동기화.
- **미완**: PR은 `KAKAO_BOT_PAT`/`gh` 없어 API 생성 불가. Actions workflow는 success이나 open PR 0건.
