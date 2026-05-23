# Context Notes — dev-continue 이어하기

## 2026-05-23

- **원인**: `ChatGPTInterface.test`·`composerAssistantTurnFinalize.test` 등이 `test-utils/testHelpers`에서 `withProcessEnv`, `installJestDomQuietNetworkForTests`를 import하지만, 커밋된 `testHelpers.tsx`에는 해당 export가 없었음.
- **증상**: `TypeError: withProcessEnv is not a function`, `installJestDomQuietNetworkForTests` undefined로 composer pipeline 65건 실패.
- **근거**: `frontend/coverage/.../testHelpers.tsx.html`에 과거 구현 흔적 존재. coverage HTML에서 `applyProcessEnvPatch`, `installJestFetchHealthLlmStub` 시그니처 확인.
- **조치**: `src/test-utils/testHelpers.tsx`에 누락 헬퍼만 추가(기존 `setupCommonMocks` 등은 유지). `sync:frontend-src`로 `frontend/src` 동기화.
- **검증**: `test:composer-pipeline` 19 suites 143 passed · `local:verify` · `tsc --noEmit` 통과.
- **커밋**: `76d4b607f` push 완료.
- **미완**: PR은 PAT/gh auth 필요. `npm run pr:ensure-gh`로 tools/gh 설치, `.env.local` KAKAO_BOT_PAT 로드, GH_TOKEN 경로로 gh pr create 지원 추가.
