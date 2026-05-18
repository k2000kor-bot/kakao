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
- [x] `npm run verify:conversation-graph` (E2E, Dev 서버)
- [x] `npm run test:e2e:pipelines:all` (컴포저 3 + 관계도 12)
- [ ] 수동: `.env.local` 순차/multi-step 플래그 후 `1.\n2.` 전송·재생성·편집

## Env (선택)

```env
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST=true
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM=true
REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST=true
```

## Push (권한 있는 저장소에서)

```bash
git remote set-url origin git@github.com:<owner>/<repo>.git
git push -u origin dev-continue-2026-01-20
```

PR 생성 후 위 체크리스트를 PR 본문에 붙여넣기.
