# Push / 배포 상태 (k2000kor-bot/kakao)

**브랜치**: `main` · **HEAD**: `05d77f131` (`main` = `dev-continue-2026-01-20`)

## 완료 (2026-05-23)

| 항목 | 상태 |
|------|------|
| 저장소 | **k2000kor-bot/kakao** |
| SSH | **k2000kor-bot** |
| PR #2 merge | ✅ [feat: 관계도·컴포저·handoff](https://github.com/k2000kor-bot/kakao/pull/2) |
| `main` 동기화 | ✅ `origin/main` = `origin/dev-continue-2026-01-20` |
| GitHub default branch | ✅ **`main`** |
| Handoff | ✅ `npm run verify:handoff-artifacts` |
| pre-deploy | ✅ `npm run verify:pre-deploy` |
| verify:completion | ✅ |
| verify:final | ✅ (백엔드 미기동 시 API·통합 SKIP) |
| E2E CI | ✅ `CI=1 npm run test:e2e:pipelines:ci:all` |
| post-merge | ✅ `npm run finish:post-merge` |

## 로컬 검증

```bash
npm run verify:handoff-artifacts
npm run verify:pre-deploy          # Jest·관계도 unit (~1min)
npm run verify:final               # build + Jest pipelines (backend optional)
CI=1 npm run test:e2e:pipelines:ci:all
```

## PR (선택)

`main`과 이미 동기화됐으면 PR diff 없음. 새 작업은 브랜치 따서 PR.

- 수동: `npm run pr:open-new`
- Actions: [PR_CREATE_NOW.md](./PR_CREATE_NOW.md) (Settings PR 권한 필요)

## 명령 요약

```bash
npm run check:push-ready
npm run push:dev-continue
npm run promote:main              # CONFIRM=1 — main ← dev-continue
npm run pr:status
npm run handoff:info
```

관련: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md) · [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
