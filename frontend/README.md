# CRA 보조 패키지 (`frontend/`)

앱 소스의 **캐논**은 저장소 루트의 **`src/`** 입니다. 이 디렉터리 아래 **`src/`**(`frontend/src/`)는 루트 `src/`와 동기화된 **미러**입니다.

- 루트 패키지 디렉터리에서 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**) — `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)와 맞추기 (`src/`를 수정한 경우).
- `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**)
- 통합 대화(UI) 등 **부분** 미러 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**; 전체·패리티는 위 두 줄)
- 자세한 안내: [../QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[../AGENTS.md](../AGENTS.md)·[../scripts/README.md](../scripts/README.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

