# PR #3 — feat/chat-composer-context-graph (2026-05-26)

**PR:** https://github.com/k2000kor-bot/kakao/pull/3 · **open** (Draft)  
**브랜치:** `feat/chat-composer-context-graph` → `main`  
**HEAD:** `8406af4c3`

## Summary

- 대화 삭제·초기화 후 첨부+짧은 지시 맥락 API 반영
- conversation graph handoff·sparse 폴백·E2E
- 컴포저 dock·UI · backend YouTube/workspace intent

## CI (PR #3)

| Job | 상태 |
|-----|------|
| 코드 품질 검사 (doc hub) | ✅ |
| 컴포저 파이프라인 (Jest) | ✅ |
| 대화 관계도 (Jest·백엔드) | ✅ |
| 컴포저·재생성·관계도 E2E | ✅ (별도 job) |
| Test Coverage | `test:ci:coverage` — 재실행 중 |
| E2E Tests (e2e-tests job) | `test:e2e:ci:smoke` — 재실행 중 |

## 로컬 검증

```bash
npm run verify:pre-deploy
npm run verify:composer-pipeline
npm run test:composer-context-after-clear
E2E_COMPOSER_ATTACH_CONTEXT=1 E2E_SERVER_READY=1 npm run test:e2e:composer-attach-context
```

## 수동 (PR 머지 전)

1. GitHub PR #3 → **Ready for review** (Draft 해제)
2. 본문: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md) 붙여넣기
3. (선택) `ci/workflow-pr-checkout` → `main` 머지 — PR CI checkout 개선

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
