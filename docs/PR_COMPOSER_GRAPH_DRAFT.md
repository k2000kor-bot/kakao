# PR 초안 — composer multi-request + conversation graph

**브랜치**: `dev-continue-2026-01-20`  
**베이스**: `main` (또는 팀 기본 브랜치)

## Summary

- 컴포저 다중 요청 UI(질문·요구·요청 칩, 입력 미리보기, 5단계 UI, 체크리스트)
- 옵트인 순차 API(`REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` / `..._STREAM`) — 전송·재생성·편집 공통
- 옵트인 다단계 응답(`REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST`)
- 대화 관계도 뷰·handoff·Jest/E2E·CI jobs (`composer-pipeline`, `conversation-graph`, E2E)

## Test plan

- [x] `npm run verify:pre-deploy`
- [x] `npm run verify:final`
- [x] `npm run verify:conversation-graph:unit` (관계도 Jest + 백엔드 pytest)
- [x] `ConversationGraphView.test.tsx` (43 tests)
- [x] `npm run verify:handoff-artifacts` (bundle tip = 브랜치 HEAD)
- [x] `HANDOFF_REFRESH=1 npm run maintain:push-block` (사이드바·컴포저 회귀)
- [x] `npm run verify:conversation-graph-api` (upload·relationship-graph)
- [x] `npm run test:e2e:conversation-graph:chromium` (12 passed, `:3000`+`:5002` 기동)
- [x] `npm run test:e2e:composer-pipeline:all` (3 passed)
- [x] `npm run test:e2e:pipelines:all` (컴포저 3 + 관계도 12)
- [x] `npm run verify:conversation-graph` (= unit + E2E)
- [ ] 수동: `.env.local` 순차/multi-step 플래그 후 `1.\n2.` 전송·재생성·편집

## Env (선택)

```env
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST=true
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM=true
REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST=true
```

## Push (권한 있는 저장소에서)

```bash
npm run check:push-ready
npm run refresh:handoff-artifacts   # 커밋 직후라면
PUSH_REMOTE_URL=git@github.com:<owner>/<repo>.git npm run push:dev-continue
```

PR 본문 출력: `npm run pr:composer-graph-body` (또는 이 파일을 GitHub PR에 붙여넣기).
