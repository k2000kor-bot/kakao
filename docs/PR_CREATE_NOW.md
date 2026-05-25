# PR #3 — feat/chat-composer-context-graph (2026-05-25)

**PR:** https://github.com/k2000kor-bot/kakao/pull/3 · **open**  
**브랜치:** `feat/chat-composer-context-graph` → `main`  
**HEAD:** `03b870679`

## Summary

- 대화 삭제·초기화 후 첨부+짧은 지시 맥락 API 반영
- conversation graph handoff·sparse 폴백·E2E
- 컴포저 dock·UI · backend YouTube/workspace intent

## CI (PR #3)

| Job | 상태 |
|-----|------|
| 컴포저 파이프라인 E2E | ✅ |
| 컴포저 재생성 E2E | ✅ |
| 대화 관계도 (Jest·백엔드) | ✅ |
| 대화 관계도 E2E | ✅ |
| 코드 품질 검사 | doc hub 수정 후 재실행 |
| test-coverage | doc hub 수정 후 재실행 |

## 로컬 검증

```bash
npm run verify:pre-deploy
npm run verify:composer-pipeline
npm run test:composer-context-after-clear
E2E_COMPOSER_ATTACH_CONTEXT=1 E2E_SERVER_READY=1 npm run test:e2e:composer-attach-context
```

PR 본문: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md)

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
